// TypeScript-compatible wrapper for Lab6 impedance diagram
// This module refactors indexImpedanceZ.js to work inside React components

import * as d3 from "d3";

// Type definitions
export interface VectorData {
  x: number;
  y: number;
  magnitude?: number;
  angle?: number;
  [key: string]: any;
}

export interface Colors {
  [key: string]: string;
}

export interface SVGElements {
  svgMainVisual: SVGSVGElement;
  svgApparentPower: SVGSVGElement;
  svgAdmittance: SVGSVGElement;
  svgSequenceImpedance: SVGSVGElement;
  svgSequenceCurrentAndVoltage: SVGSVGElement;
  svgPhasePhaseVoltage: SVGSVGElement;
  svgPhasePhaseCurrent: SVGSVGElement;
  svgPhasePhaseImpedance: SVGSVGElement;
  svgZaids: SVGSVGElement;
}

export interface UpdateFunctions {
  updateQuantity: (phase?: string) => void;
  updateInputFields: (phaseDataArray: { key: string; value: VectorData }[]) => void;
  updateMainVisualization: (phase: string) => void;
  updateImpedances: (keyTobeUptaded: string) => void;
  calculateSequenceImpedances: () => void;
  exportCSV: () => void;
  calculateImpedances: () => void;
}

// Complex number operations (from ComplexOperatorAid.mjs)
function complexMultiplication(a: VectorData, b: VectorData): VectorData {
  return {
    x: a.x * b.x - a.y * b.y,
    y: a.x * b.y + a.y * b.x,
  };
}

function complexAdd(a: VectorData, b: VectorData): VectorData {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function complexAdd3(
  a: VectorData,
  b: VectorData,
  c: VectorData
): VectorData {
  return {
    x: a.x + b.x + c.x,
    y: a.y + b.y + c.y,
  };
}

function complexDivision(a: VectorData, b: VectorData): VectorData {
  const denom = b.x * b.x + b.y * b.y;
  return {
    x: (a.x * b.x + a.y * b.y) / denom,
    y: (a.y * b.x - a.x * b.y) / denom,
  };
}

// Marker setup (from AddMarkersZ.mjs)
function setupMarkers(
  svg: any,
  colorKeys: string[],
  arrowSize: number,
  colors: Colors
): void {
  svg
    .append("defs")
    .selectAll("marker")
    .data(colorKeys)
    .enter()
    .append("marker")
    .attr("id", (d: string) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", arrowSize / 1.5)
    .attr("markerHeight", arrowSize)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", (d: string) => colors[d]);
}

// Create vectors group (from MainSVGZ.mjs)
function createVectorsGroup(
  objVect: { key: string; value: VectorData }[],
  drag: any,
  colors: Colors,
  mainGroup: any,
  xScale: any,
  yScale: any
): any {
  const vectors = mainGroup
    .selectAll(".vector")
    .data(objVect)
    .enter()
    .append("g")
    .attr("class", "vector")
    .call(drag);

  vectors
    .append("line")
    .attr("class", (d: any) => `${d.key} ${d.key.charAt(0)}`)
    .attr("x1", xScale(0))
    .attr("y1", yScale(0))
    .attr("x2", (d: any) => xScale(d.value.x))
    .attr("y2", (d: any) => yScale(d.value.y))
    .style("stroke", (d: any) => colors[d.key.charAt(1)])
    .style("stroke-width", 2)
    .attr("marker-end", (d: any) => `url(#arrow-${d.key.charAt(1)})`)
    .style("stroke-opacity", (d: any) => (d.key.length > 2 ? 0.5 : 1));

  vectors
    .append("circle")
    .attr("class", (d: any) => `${d.key} ${d.key.charAt(0)}`)
    .attr("cx", (d: any) => xScale(d.value.x))
    .attr("cy", (d: any) => yScale(d.value.y))
    .attr("r", 15)
    .style("cursor", (d: any) => (d.key.charAt(0) === "Z" ? "" : "pointer"))
    .style("fill-opacity", 0);

  vectors
    .append("text")
    .attr("class", (d: any) => `${d.key} ${d.key.charAt(0)}`)
    .attr("id", (d: any) => `text${d.key}`)
    .attr("x", (d: any) => xScale(d.value.x))
    .attr("y", (d: any) => yScale(d.value.y))
    .attr("dx", 5)
    .attr("dy", -5)
    .style("font-size", "1rem")
    .style("font-weight", "bold")
    .style("fill", (d: any) => colors[d.key.charAt(1)])
    .each(function (this: Element, d: any) {
      const magnitude = Math.sqrt(d.value.x ** 2 + d.value.y ** 2).toFixed(1);
      const angle = (
        (Math.atan2(d.value.y, d.value.x) * 180) / Math.PI
      ).toFixed(1);
      d3.select(this)
        .append("tspan")
        .text(`${d.key} = ${magnitude}`);
      d3.select(this)
        .append("tspan")
        .style("text-decoration", "underline")
        .text(`/${angle}°`);
    });

  return vectors;
}

// Create input fields (from InputsZ.mjs)
function createInputs(
  container: any,
  classForTable: string,
  data: { key: string; value: VectorData }[],
  onInputChanged: (event: any, d: any) => void
): any {
  const inputDiv = d3.select(container);
  const table = inputDiv
    .append("table")
    .attr("class", classForTable)
    .style("font-size", "0.8rem");

  const header = table.append("thead").append("tr");
  header
    .append("th")
    .append("button")
    .text("R/X")
    .style("font-size", "0.8rem")
    .attr("class", "myButtonCurrentAndVoltagePanel")
    .on("click", function () {
      d3.select(`.${classForTable}`).classed(
        "hidden",
        !d3.select(`.${classForTable}`).classed("hidden")
      );
      d3.select(".polarTable").classed(
        "hidden",
        !d3.select(".polarTable").classed("hidden")
      );
    });
  header.append("th").text("R");
  header.append("th").text("X");

  const tbody = table.append("tbody");
  const inputFields = tbody
    .selectAll(".input-field")
    .data(data)
    .enter()
    .append("tr")
    .attr("class", "input-field");

  inputFields
    .append("td")
    .text((d: any) => `${d.key}: `)
    .attr("class", (d: any) => d.key.charAt(0))
    .style("font-size", "1rem");

  inputFields
    .append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.01")
    .style("font-size", "1rem")
    .attr("value", (d: any) => d.value.x.toFixed(3))
    .attr("placeholder", "x")
    .attr("id", (d: any) => `${d.key}-real`)
    .attr("class", (d: any) => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (
        lastChar !== "A" &&
        lastChar !== "B" &&
        lastChar !== "C" &&
        lastChar !== "0" &&
        lastChar !== "1" &&
        lastChar !== "2"
      ) {
        return "VAR";
      }
      if (d.key.length === 3) {
        return "VAR";
      }
      return d.key.charAt(0);
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  inputFields
    .append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.01")
    .style("font-size", "1rem")
    .attr("value", (d: any) => d.value.y.toFixed(3))
    .attr("placeholder", "y")
    .attr("id", (d: any) => `${d.key}-imaginary`)
    .attr("class", (d: any) => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (
        lastChar !== "A" &&
        lastChar !== "B" &&
        lastChar !== "C" &&
        lastChar !== "0" &&
        lastChar !== "1" &&
        lastChar !== "2"
      ) {
        return "VAR";
      }
      if (d.key.length === 3) {
        return "VAR";
      }
      return d.key.charAt(0);
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  return inputDiv;
}

// Create polar inputs (from InputsZ.mjs)
function createPolarInputs(
  container: any,
  classForTable: string,
  data: { key: string; value: VectorData }[],
  onInputChanged: (event: any, d: any) => void
): any {
  const inputDiv = d3.select(container);
  const table = inputDiv
    .append("table")
    .attr("class", classForTable)
    .style("font-size", "0.8rem")
    .classed("hidden", true);

  const header = table.append("thead").append("tr");
  header
    .append("th")
    .append("button")
    .text("A/θ")
    .style("font-size", "0.8rem")
    .attr("class", "myButtonpolarTable")
    .on("click", function () {
      d3.select(".CurrentAndVoltageTable").classed(
        "hidden",
        !d3.select(".CurrentAndVoltageTable").classed("hidden")
      );
      d3.select(".polarTable").classed(
        "hidden",
        !d3.select(".polarTable").classed("hidden")
      );
    });
  header.append("th").text("A");
  header.append("th").text("θ");

  const tbody = table.append("tbody");

  data.forEach((d) => {
    const mag = Math.sqrt(d.value.x ** 2 + d.value.y ** 2);
    const angDeg = (Math.atan2(d.value.y, d.value.x) * 180) / Math.PI;
    d.value.magnitude = mag;
    d.value.angle = angDeg;
  });

  const inputFields = tbody
    .selectAll(".input-fieldPolar")
    .data(data)
    .enter()
    .append("tr")
    .attr("class", "input-fieldPolar");

  inputFields
    .append("td")
    .text((d: any) => `${d.key}: `)
    .attr("class", (d: any) => d.key.charAt(0))
    .style("font-size", "1rem");

  inputFields
    .append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.1")
    .style("font-size", "1rem")
    .attr("value", (d: any) => d.value.magnitude?.toFixed(3) || "0")
    .attr("placeholder", "A")
    .attr("id", (d: any) => `${d.key}-amplitude`)
    .attr("class", (d: any) => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (
        lastChar !== "A" &&
        lastChar !== "B" &&
        lastChar !== "C" &&
        lastChar !== "0" &&
        lastChar !== "1" &&
        lastChar !== "2"
      ) {
        return "VAR";
      }
      if (d.key.length === 3) {
        return "VAR";
      }
      return d.key.charAt(0);
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  inputFields
    .append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.1")
    .style("font-size", "1rem")
    .attr("value", (d: any) => d.value.angle?.toFixed(3) || "0")
    .attr("placeholder", "θ")
    .attr("id", (d: any) => `${d.key}-angle`)
    .attr("class", (d: any) => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (
        lastChar !== "A" &&
        lastChar !== "B" &&
        lastChar !== "C" &&
        lastChar !== "0" &&
        lastChar !== "1" &&
        lastChar !== "2"
      ) {
        return "VAR";
      }
      if (d.key.length === 3) {
        return "VAR";
      }
      return d.key.charAt(0);
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  return inputDiv;
}

// Quantity chart (from quantity.mjs)
function createQuantityChart(
  svg: any,
  vectorsData: VectorData,
  colors: Colors,
  quantityKeys: string[],
  chartTitle: string
): { updateQuantity: (phase?: string) => void } {
  const parentEl = d3.select(svg.node()?.parentNode as Element);
  parentEl.selectAll(".chartTitle").remove();

  parentEl
    .insert("div", ":first-child")
    .attr("class", "chartTitle")
    .style("text-align", "center")
    .style("margin-bottom", "4px")
    .html(`<strong>${chartTitle}</strong>`);

  svg.selectAll(".x-axis").remove();
  svg.selectAll(".y-axis").remove();

  const w = +svg.attr("width");
  const h = +svg.attr("height");
  const margin = 30;

  setupMarkers(svg, ["A", "B", "C"], 8, colors);

  const diagramGroup = svg.append("g").attr("id", "diagramView");
  const textGroup = svg
    .append("g")
    .attr("id", "textView")
    .style("display", "none");

  const sData = quantityKeys.map((key) => ({
    key: key,
    value: vectorsData[key],
  }));

  diagramGroup
    .append("path")
    .attr(
      "d",
      "M19.89 10.105a8.696 8.696 0 0 0-.789-1.456l-1.658 1.119a6.606 6.606 0 0 1 .987 2.345 6.659 6.659 0 0 1 0 2.648 6.495 6.495 0 0 1-.384 1.231 6.404 6.404 0 0 1-.603 1.112 6.654 6.654 0 0 1-1.776 1.775 6.606 6.606 0 0 1-2.343.987 6.734 6.734 0 0 1-2.646 0 6.55 6.55 0 0 1-3.317-1.788 6.605 6.605 0 0 1-1.408-2.088 6.613 6.613 0 0 1-.382-1.23 6.627 6.627 0 0 1 .382-3.877A6.551 6.551 0 0 1 7.36 8.797 6.628 6.628 0 0 1 9.446 7.39c.395-.167.81-.296 1.23-.382.107-.022.216-.032.324-.049V10l5-4-5-4v2.938a8.805 8.805 0 0 0-.725.111 8.512 8.512 0 0 0-3.063 1.29A8.566 8.566 0 0 0 4.11 16.77a8.535 8.535 0 0 0 1.835 2.724 8.614 8.614 0 0 0 2.721 1.833 8.55 8.55 0 0 0 5.061.499 8.576 8.576 0 0 0 6.162-5.056c.22-.52.389-1.061.5-1.608a8.643 8.643 0 0 0 0-3.45 8.684 8.684 0 0 0-.499-1.607z"
    )
    .attr("stroke", "none")
    .attr("fill", "darkgrey")
    .attr("class", "clockwise")
    .attr(
      "transform",
      `scale(1, -1) translate(${w - margin - 10},${-margin - 10}) scale(1.5)`
    );

  diagramGroup
    .append("path")
    .attr("d", `m ${w - 12.5 - 10},${margin - 26 + 10} 0,10`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  diagramGroup
    .append("path")
    .attr("d", `m ${w - 17.5 - 10},${margin - 21 + 10} 10,0`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  const maxVal = d3.max(sData, (d: any) =>
    Math.sqrt(d.value.x ** 2 + d.value.y ** 2)
  ) || 1;
  const scaleX = d3
    .scaleLinear()
    .domain([-maxVal, maxVal])
    .range([margin, w - margin]);
  const scaleY = d3
    .scaleLinear()
    .domain([maxVal, -maxVal])
    .range([margin, w - margin]);

  const xAxis = d3.axisBottom(scaleX).ticks(5);
  const yAxis = d3.axisLeft(scaleY).ticks(5);

  diagramGroup
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${h / 2})`)
    .transition()
    .duration(750)
    .call(xAxis)
    .call((g: any) => {
      g.selectAll(".tick text").filter((d: any) => d === 0).remove();
    })
    .select(".domain")
    .attr("stroke", "white")
    .each(function (this: Element, d: any, i: number, nodes: any[]) {
      const parent = nodes[i]?.parentNode;
      if (parent) {
        d3.select(parent as Element)
          .append("line")
          .attr("x1", w - margin)
          .attr("x2", w - margin + 15)
          .attr("y1", 0.5)
          .attr("y2", 0.5)
          .attr("class", "xAxisAider")
          .attr("stroke", "white")
          .attr("marker-end", "url(#markc-xAxis)");
      }
    });

  diagramGroup
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${w / 2},0)`)
    .transition()
    .duration(750)
    .call(yAxis)
    .call((g: any) => {
      g.selectAll(".tick text").filter((d: any) => d === 0).remove();
    })
    .select(".domain")
    .attr("stroke", "white")
    .each(function (this: Element, d: any, i: number, nodes: any[]) {
      const parent = nodes[i]?.parentNode;
      if (parent) {
        d3.select(parent as Element)
          .append("line")
          .attr("x1", 0.5)
          .attr("x2", 0.5)
          .attr("y1", margin)
          .attr("y2", margin - 15)
          .attr("class", "yAxisAider")
          .attr("stroke", "white")
          .attr("marker-end", "url(#markc-yAxis)");
      }
    });

  const quantityGroup = diagramGroup
    .selectAll(".quantity")
    .data(sData)
    .enter()
    .append("g")
    .attr("class", "quantity");

  quantityGroup
    .append("line")
    .attr("x1", scaleX(0))
    .attr("y1", scaleY(0))
    .attr("x2", (d: any) => scaleX(d.value.x))
    .attr("y2", (d: any) => scaleY(d.value.y))
    .style("stroke", (d: any) => colors[d.key.charAt(1)] || colors[d.key] || "white")
    .style("stroke-width", 2)
    .attr("marker-end", (d: any) => `url(#arrow-${d.key.charAt(1)})`);

  const updateQuantity = () => {
    quantityGroup
      .select("line")
      .transition()
      .duration(750)
      .attr("x2", (d: any) => scaleX(d.value.x))
      .attr("y2", (d: any) => scaleY(d.value.y));
  };

  return { updateQuantity };
}

/**
 * Initialize the impedance diagram visualization
 * @param svgElements - Object containing all SVG elements
 * @param inputsContainer - Container element for input fields
 * @param vectorsData - Object containing all vector data
 * @param colors - Object containing color mappings
 * @returns Object containing update and helper functions
 */
export function initImpedanceDiagram(
  svgElements: SVGElements,
  inputsContainer: HTMLElement,
  vectorsData: any,
  colors: Colors
): UpdateFunctions {
  const svgWidth = 250;
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const arrowSize = 8;
  let maxStatus = 2;

  // Select main visual elements
  const mainGroup = d3
    .select(svgElements.svgMainVisual)
    .append("g")
    .attr("id", "gMainVisual");

  // Setup scales
  const xScale = d3.scaleLinear().domain([-3, 3]).range([margin.left, svgWidth - margin.right]);
  const yScale = d3.scaleLinear().domain([-3, 3]).range([svgWidth - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale).ticks(6);
  const yAxis = d3.axisLeft(yScale).ticks(6);

  // Setup markers
  setupMarkers(d3.select(svgElements.svgMainVisual), ["A", "B", "C"], arrowSize, colors);

  // Calculate impedances
  function calculateImpedances(): void {
    vectorsData.ZA = complexDivision(vectorsData.VA, vectorsData.IA);
    vectorsData.ZB = complexDivision(vectorsData.VB, vectorsData.IB);
    vectorsData.ZC = complexDivision(vectorsData.VC, vectorsData.IC);
  }

  // Calculate sequence impedances
  function calculateSequenceImpedances(): void {
    const a = { x: -0.5, y: 0.87 };
    const a2 = complexMultiplication(a, a);

    vectorsData.Z0 = complexDivision(
      complexAdd3(vectorsData.ZA, vectorsData.ZB, vectorsData.ZC),
      { x: 3, y: 0 }
    );
    vectorsData.Z1 = complexDivision(
      complexAdd3(
        vectorsData.ZA,
        complexMultiplication(vectorsData.ZB, a),
        complexMultiplication(vectorsData.ZC, a2)
      ),
      { x: 3, y: 0 }
    );
    vectorsData.Z2 = complexDivision(
      complexAdd3(
        vectorsData.ZA,
        complexMultiplication(vectorsData.ZB, a2),
        complexMultiplication(vectorsData.ZC, a)
      ),
      { x: 3, y: 0 }
    );

    d3.select("#Z0-real").property("value", vectorsData.Z0.x.toFixed(3));
    d3.select("#Z0-imaginary").property("value", vectorsData.Z0.y.toFixed(3));
    d3.select("#Z1-real").property("value", vectorsData.Z1.x.toFixed(3));
    d3.select("#Z1-imaginary").property("value", vectorsData.Z1.y.toFixed(3));
    d3.select("#Z2-real").property("value", vectorsData.Z2.x.toFixed(3));
    d3.select("#Z2-imaginary").property("value", vectorsData.Z2.y.toFixed(3));
  }

  // Create drag behavior
  const drag = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  function dragstarted(this: Element, event: any, d: any): void {
    d3.select(this).raise().classed("active", true);
  }

  function dragended(this: Element, event: any, d: any): void {
    let max = Number.NEGATIVE_INFINITY;
    const allPhases = ["A", "B", "C"];

    for (let i = 0; i < 3; i++) {
      const magnitude = Math.max(
        Math.abs(vectorsData["I" + allPhases[i]].x),
        Math.abs(vectorsData["I" + allPhases[i]].y),
        Math.abs(vectorsData["V" + allPhases[i]].x),
        Math.abs(vectorsData["V" + allPhases[i]].y),
        Math.abs(vectorsData["Z" + allPhases[i]].x),
        Math.abs(vectorsData["Z" + allPhases[i]].y)
      );
      max = Math.max(max, magnitude);
    }

    maxStatus = max;
    xScale.domain([-max, max]);
    yScale.domain([-max, max]);

    mainGroup
      .select(".x-axis")
      .transition()
      .duration(1000)
      .call(xAxis as any);
    mainGroup
      .select(".y-axis")
      .transition()
      .duration(1000)
      .call(yAxis as any);

    updateMainVisualization("IA");
    updateMainVisualization("IB");
    updateMainVisualization("IC");
    updateMainVisualization("VA");
    updateMainVisualization("VB");
    updateMainVisualization("VC");
    updateMainVisualization("ZA");
    updateMainVisualization("ZB");
    updateMainVisualization("ZC");

    d3.select(this).classed("active", false);
  }

  function dragged(this: Element, event: any, d: any): void {
    if ("Z" !== d.key.charAt(0)) {
      const newX = xScale.invert(event.x);
      const newY = yScale.invert(event.y);

      d.value.x = newX;
      d.value.y = newY;
      vectorsData[d.key].x = newX;
      vectorsData[d.key].y = newY;

      const mag = Math.sqrt(newX * newX + newY * newY);
      const ang = (Math.atan2(newY, newX) * 180) / Math.PI;
      d.value.magnitude = mag;
      d.value.angle = ang;
      vectorsData[d.key].magnitude = mag;
      vectorsData[d.key].angle = ang;

      d3.selectAll(".input-field").each(function (data: any) {
        d3.select(`#${data.key}-real`).property("value", data.value.x.toFixed(2));
        d3.select(`#${data.key}-imaginary`).property("value", data.value.y.toFixed(2));
      });
      d3.selectAll(".input-fieldPolar").each(function (data: any) {
        d3.select(`#${data.key}-amplitude`).property(
          "value",
          (data.value.magnitude || 0).toFixed(2)
        );
        d3.select(`#${data.key}-angle`).property(
          "value",
          (data.value.angle || 0).toFixed(2)
        );
      });

      d3.select(this).select("line").attr("x2", event.x).attr("y2", event.y);
      d3.select(this).select("circle").attr("cx", event.x).attr("cy", event.y);
      d3.select(this)
        .select("text")
        .attr("x", event.x + 5)
        .attr("y", event.y - 5)
        .text(() => {
          const m = Math.sqrt(d.value.x * d.value.x + d.value.y * d.value.y).toFixed(1);
          const a = ((Math.atan2(d.value.y, d.value.x) * 180) / Math.PI).toFixed(0);
          return `${d.key} ${m}/${a}°`;
        });

      vectorsData[d.key].x = d.value.x;
      vectorsData[d.key].y = d.value.y;
      const z = complexDivision(
        vectorsData["V" + d.key.charAt(1)],
        vectorsData["I" + d.key.charAt(1)]
      );

      d3.select("#Z" + d.key.charAt(1) + "-real").property("value", z.x.toFixed(3));
      d3.select("#Z" + d.key.charAt(1) + "-imaginary").property("value", z.y.toFixed(3));
      vectorsData["Z" + d.key.charAt(1)].x = z.x;
      vectorsData["Z" + d.key.charAt(1)].y = z.y;
    }

    updateInputFields([d]);
    updateImpedances(d.key);
    updateAllQuantityCharts();
  }

  // Create vectors
  const vectors = createVectorsGroup(
    [
      { key: "ZA", value: vectorsData.ZA },
      { key: "ZB", value: vectorsData.ZB },
      { key: "ZC", value: vectorsData.ZC },
      { key: "VA", value: vectorsData.VA },
      { key: "VB", value: vectorsData.VB },
      { key: "VC", value: vectorsData.VC },
      { key: "IA", value: vectorsData.IA },
      { key: "IB", value: vectorsData.IB },
      { key: "IC", value: vectorsData.IC },
    ],
    drag,
    colors,
    mainGroup,
    xScale,
    yScale
  );

  // Input change handler
  function onInputChanged(event: any, d: any): void {
    let inputType: string;
    const phase = d.key;
    if (event.target.id.includes("-")) {
      inputType = event.target.id.split("-")[1];
    } else {
      inputType = event.target.id;
    }
    const newValue = parseFloat(event.target.value);

    if (inputType === "real") {
      const x = newValue;
      const y = d.value.y;
      const magnitude = Math.sqrt(x * x + y * y);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      vectorsData[d.key].magnitude = magnitude;
      vectorsData[d.key].angle = angle;
      vectorsData[phase].x = newValue;
    } else if (inputType === "imaginary") {
      const x = d.value.x;
      const y = newValue;
      const magnitude = Math.sqrt(x * x + y * y);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      vectorsData[d.key].magnitude = magnitude;
      vectorsData[d.key].angle = angle;
      vectorsData[phase].y = newValue;
    }

    if (inputType === "angle") {
      const Mag = d.value.magnitude;
      const newAngDeg = newValue;
      const rad = (newAngDeg * Math.PI) / 180;
      vectorsData[d.key].x = Mag * Math.cos(rad);
      vectorsData[d.key].y = Mag * Math.sin(rad);
      vectorsData[d.key].magnitude = Mag;
      vectorsData[d.key].angle = newAngDeg;
    }

    if (inputType === "amplitude") {
      const newMag = newValue;
      const AngDeg = d.value.angle;
      const rad = (AngDeg * Math.PI) / 180;
      vectorsData[d.key].x = newMag * Math.cos(rad);
      vectorsData[d.key].y = newMag * Math.sin(rad);
      vectorsData[d.key].magnitude = newMag;
      vectorsData[d.key].angle = AngDeg;
    }

    d3.selectAll(".input-field").each(function (data: any) {
      const phaseKey = data.key;
      d3.select(`#${phaseKey}-real`).property("value", data.value.x.toFixed(2));
      d3.select(`#${phaseKey}-imaginary`).property("value", data.value.y.toFixed(2));
    });

    d3.selectAll(".input-fieldPolar").each(function (data: any) {
      const phaseKey = data.key;
      d3.select(`#${phaseKey}-amplitude`).property(
        "value",
        (data.value.magnitude || 0).toFixed(2)
      );
      d3.select(`#${phaseKey}-angle`).property(
        "value",
        (data.value.angle || 0).toFixed(2)
      );
    });

    updateMainVisualization(phase);
    updateImpedances(phase);
    vectorsData[phase].x = d.value.x;
    vectorsData[phase].y = d.value.y;

    if (["A", "B", "C"].includes(phase.charAt(1))) {
      const z = complexDivision(
        vectorsData["V" + phase.charAt(1)],
        vectorsData["I" + phase.charAt(1)]
      );

      d3.select("#Z" + phase.charAt(1) + "-real").property("value", z.x.toFixed(3));
      d3.select("#Z" + phase.charAt(1) + "-imaginary").property("value", z.y.toFixed(3));
      vectorsData["Z" + phase.charAt(1)].x = z.x;
      vectorsData["Z" + phase.charAt(1)].y = z.y;

      calculateSequenceImpedances();

      let max = Number.NEGATIVE_INFINITY;
      const allPhases = ["A", "B", "C"];

      for (let i = 0; i < 3; i++) {
        const magnitude = Math.max(
          Math.abs(vectorsData["I" + allPhases[i]].x),
          Math.abs(vectorsData["I" + allPhases[i]].y),
          Math.abs(vectorsData["V" + allPhases[i]].x),
          Math.abs(vectorsData["V" + allPhases[i]].y),
          Math.abs(vectorsData["Z" + allPhases[i]].x),
          Math.abs(vectorsData["Z" + allPhases[i]].y)
        );
        max = Math.max(max, magnitude);
      }

      maxStatus = max;
      xScale.domain([-max, max]);
      yScale.domain([-max, max]);

      mainGroup
        .select(".x-axis")
        .transition()
        .duration(1000)
        .call(xAxis as any);
      mainGroup
        .select(".y-axis")
        .transition()
        .duration(1000)
        .call(yAxis as any);

      updateMainVisualization("IA");
      updateMainVisualization("IB");
      updateMainVisualization("IC");
      updateMainVisualization("VA");
      updateMainVisualization("VB");
      updateMainVisualization("VC");
      updateMainVisualization("ZA");
      updateMainVisualization("ZB");
      updateMainVisualization("ZC");
    }
  }

  // Create input fields
  createInputs(
    inputsContainer,
    "input-field1",
    [
      { key: "ZA", value: vectorsData.ZA },
      { key: "ZB", value: vectorsData.ZB },
      { key: "ZC", value: vectorsData.ZC },
      { key: "Z0", value: vectorsData.Z0 },
      { key: "Z1", value: vectorsData.Z1 },
      { key: "Z2", value: vectorsData.Z2 },
    ],
    onInputChanged
  );

  d3.selectAll(".Z").attr("readonly", true).style("pointer-events", "none");

  const inputDiv = createInputs(
    inputsContainer,
    "input-field",
    [
      { key: "VA", value: vectorsData.VA },
      { key: "VB", value: vectorsData.VB },
      { key: "VC", value: vectorsData.VC },
      { key: "IA", value: vectorsData.IA },
      { key: "IB", value: vectorsData.IB },
      { key: "IC", value: vectorsData.IC },
    ],
    onInputChanged
  );

  createPolarInputs(
    inputsContainer,
    "input-fieldPolar",
    [
      { key: "VA", value: vectorsData.VA },
      { key: "VB", value: vectorsData.VB },
      { key: "VC", value: vectorsData.VC },
      { key: "IA", value: vectorsData.IA },
      { key: "IB", value: vectorsData.IB },
      { key: "IC", value: vectorsData.IC },
    ],
    onInputChanged
  );

  // Create quantity charts
  const quantityApparentPower = createQuantityChart(
    d3.select(svgElements.svgApparentPower),
    vectorsData,
    colors,
    ["SA", "SB", "SC", "S0", "S1", "S2"],
    "Apparent Power SA SB SC S0 S1 S2"
  );

  const quantityAdmittance = createQuantityChart(
    d3.select(svgElements.svgAdmittance),
    vectorsData,
    colors,
    ["YA", "YB", "YC"],
    "Admittance YA YB YC"
  );

  const quantitySequenceImpedance = createQuantityChart(
    d3.select(svgElements.svgSequenceImpedance),
    vectorsData,
    colors,
    ["Z0", "Z1", "Z2", "ZA", "ZB", "ZC"],
    "Z0 Z1 Z2 ZA ZB ZC"
  );

  const quantitySequenceCurrentVoltage = createQuantityChart(
    d3.select(svgElements.svgSequenceCurrentAndVoltage),
    vectorsData,
    colors,
    ["V0", "V1", "V2", "I0", "I1", "I2"],
    "V0 V1 V2 I0 I1 I2"
  );

  const quantityPhasePhaseVoltage = createQuantityChart(
    d3.select(svgElements.svgPhasePhaseVoltage),
    vectorsData,
    colors,
    ["VAB", "VBC", "VCA"],
    "Phase-Phase Voltage"
  );

  const quantityPhasePhaseCurrent = createQuantityChart(
    d3.select(svgElements.svgPhasePhaseCurrent),
    vectorsData,
    colors,
    ["IAB", "IBC", "ICA"],
    "Phase-Phase Current"
  );

  const quantityPhasePhaseImpedance = createQuantityChart(
    d3.select(svgElements.svgPhasePhaseImpedance),
    vectorsData,
    colors,
    ["ZAB", "ZBC", "ZCA"],
    "Phase-Phase Impedance"
  );

  const quantityZaids = createQuantityChart(
    d3.select(svgElements.svgZaids),
    vectorsData,
    colors,
    ["ZsymetricalTotal", "Zn"],
    "ZT = Z1+Z2+Z0, Zn"
  );

  function updateAllQuantityCharts(): void {
    quantityApparentPower.updateQuantity();
    quantityAdmittance.updateQuantity();
    quantitySequenceImpedance.updateQuantity();
    quantitySequenceCurrentVoltage.updateQuantity();
    quantityPhasePhaseVoltage.updateQuantity();
    quantityPhasePhaseCurrent.updateQuantity();
    quantityPhasePhaseImpedance.updateQuantity();
    quantityZaids.updateQuantity();
  }

  // Update main visualization
  function updateMainVisualization(phase: string): void {
    vectors
      .selectAll("." + phase)
      .attr("x2", (d: any) => xScale(d.value.x))
      .attr("y2", (d: any) => yScale(d.value.y))
      .attr("x", (d: any) => xScale(d.value.x))
      .attr("y", (d: any) => yScale(d.value.y))
      .attr("cx", (d: any) => xScale(d.value.x))
      .attr("cy", (d: any) => yScale(d.value.y))
      .attr("id", (d: any) => `text${d.key}`)
      .each(function (this: Element) {
        const el = d3.select(this);
        const data = el.datum() as { key: string; value: VectorData };
        const magnitude = Math.sqrt(data.value.x ** 2 + data.value.y ** 2).toFixed(1);
        const angle = ((Math.atan2(data.value.y, data.value.x) * 180) / Math.PI).toFixed(0);
        el.select("tspan:nth-child(1)").text(`${data.key} = ${magnitude}`);
        el.select("tspan:nth-child(2)").text(`/${angle}°`);
      });

    updateAllQuantityCharts();
  }

  // Update input fields
  function updateInputFields(
    phaseDataArray: { key: string; value: VectorData }[]
  ): void {
    phaseDataArray.forEach((phaseData) => {
      const phase = phaseData.key;
      d3.select(`#${phase}-real`).property("value", phaseData.value.x.toFixed(2));
      d3.select(`#${phase}-imaginary`).property("value", phaseData.value.y.toFixed(2));
    });
  }

  // Update impedances
  function updateImpedances(keyTobeUptaded: string): void {
    const wichPhase = keyTobeUptaded.charAt(1);
    const z = complexDivision(
      vectorsData["V" + wichPhase],
      vectorsData["I" + wichPhase]
    );

    vectors
      .selectAll(".Z" + wichPhase)
      .attr("x", () => xScale(z.x))
      .attr("y", () => yScale(z.y))
      .attr("cx", () => xScale(z.x))
      .attr("cy", () => yScale(z.y))
      .attr("x2", () => xScale(z.x))
      .attr("y2", () => yScale(z.y))
      .attr("id", () => `textZ${wichPhase}`)
      .each(function (this: Element) {
        const m = Math.sqrt(z.x * z.x + z.y * z.y).toFixed(1);
        const a = ((Math.atan2(z.y, z.x) * 180) / Math.PI).toFixed(0);
        const el = d3.select(this);
        el.select("tspan:nth-child(1)").text(`Z${wichPhase} = ${m}`);
        el.select("tspan:nth-child(2)").text(`/${a}°`);
      });

    calculateSequenceImpedances();
  }

  // Export CSV
  function exportCSV(): void {
    const headers = ["Phase", "Real", "Imaginary"];
    const csvData = Object.entries(vectorsData).map(([phase, data]) => [
      phase,
      (data as VectorData).x.toFixed(2),
      (data as VectorData).y.toFixed(2),
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    csvContent += csvData.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "phasor_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Initial calculations
  calculateImpedances();
  calculateSequenceImpedances();
  updateAllQuantityCharts();

  return {
    updateQuantity: updateAllQuantityCharts,
    updateInputFields,
    updateMainVisualization,
    updateImpedances,
    calculateSequenceImpedances,
    exportCSV,
    calculateImpedances,
  };
}

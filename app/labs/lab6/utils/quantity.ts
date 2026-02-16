import * as d3 from "d3";
import { ComplexNumber } from "./ComplexOperatorAid";
import { Vmarker } from "./AddMarkersZ";

export function quantity(
  vectorsData: { [key: string]: ComplexNumber },
  svg_: d3.Selection<any, any, any, any>,
  colors: { [key: string]: string },
  quantity: string[],
  chartTitle: string
): { updateQuantity: () => void } {
  // Remove any previous chart title
  const parentEl = d3.select(svg_.node()?.parentNode as any);
  parentEl.selectAll(".chartTitle").remove();

  // Insert a div heading before the SVG
  parentEl.insert("div", ":first-child")
    .attr("class", "chartTitle")
    .style("text-align", "center")
    .style("margin-bottom", "4px")
    .html(`<strong>${chartTitle}</strong>`);

  svg_.selectAll(".x-axis").remove();
  svg_.selectAll(".y-axis").remove();

  const w = +svg_.attr("width");
  const h = +svg_.attr("height");
  const margin = 30;
  const phases = ["A", "B", "C"];
  Vmarker(svg_, Object.keys(colors), 8, colors);

  const diagramGroup = svg_.append("g").attr("id", "diagramView");
  const textGroup = svg_.append("g").attr("id", "textView")
    .style("display", "none");

  // Prepare data
  const sData = quantity.map((key) => ({
    key: key,
    value: vectorsData[key],
  }));

  diagramGroup.append("path")
    .attr("d", "M19.89 10.105a8.696 8.696 0 0 0-.789-1.456l-1.658 1.119a6.606 6.606 0 0 1 .987 2.345 6.659 6.659 0 0 1 0 2.648 6.495 6.495 0 0 1-.384 1.231 6.404 6.404 0 0 1-.603 1.112 6.654 6.654 0 0 1-1.776 1.775 6.606 6.606 0 0 1-2.343.987 6.734 6.734 0 0 1-2.646 0 6.55 6.55 0 0 1-3.317-1.788 6.605 6.605 0 0 1-1.408-2.088 6.613 6.613 0 0 1-.382-1.23 6.627 6.627 0 0 1 .382-3.877A6.551 6.551 0 0 1 7.36 8.797 6.628 6.628 0 0 1 9.446 7.39c.395-.167.81-.296 1.23-.382.107-.022.216-.032.324-.049V10l5-4-5-4v2.938a8.805 8.805 0 0 0-.725.111 8.512 8.512 0 0 0-3.063 1.29A8.566 8.566 0 0 0 4.11 16.77a8.535 8.535 0 0 0 1.835 2.724 8.614 8.614 0 0 0 2.721 1.833 8.55 8.55 0 0 0 5.061.499 8.576 8.576 0 0 0 6.162-5.056c.22-.52.389-1.061.5-1.608a8.643 8.643 0 0 0 0-3.45 8.684 8.684 0 0 0-.499-1.607z")
    .attr("stroke", "none")
    .attr("fill", "darkgrey")
    .attr('class', 'clockwise')
    .attr("transform", `scale(1, -1) translate(${w - margin - 10},${-margin - 10}) scale(1.5)`);

  diagramGroup.append("path")
    .attr("d", `m ${w - 12.5 - 10},${margin - 26 + 10} 0,10`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  diagramGroup.append("path")
    .attr("d", `m ${w - 17.5 - 10},${margin - 21 + 10} 10,0`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  // Determine max scale
  const maxVal = d3.max(sData, d => Math.sqrt(d.value.x ** 2 + d.value.y ** 2)) || 1;
  const scaleX = d3.scaleLinear().domain([-maxVal, maxVal]).range([margin, w - margin]);
  const scaleY = d3.scaleLinear().domain([maxVal, -maxVal]).range([margin, w - margin]);

  // Append new axis groups and transition them
  const xAxis = d3.axisBottom(scaleX).ticks(5);
  const yAxis = d3.axisLeft(scaleY).ticks(5);

  diagramGroup.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${h / 2})`)
    .transition()
    .duration(750)
    .call(xAxis as any)
    .call((g: any) => {
      g.selectAll(".tick text").filter((d: any) => d === 0).remove();
    })
    .select(".domain")
    .attr("stroke", "white")
    .each((d: any, i: any, nodes: any) => {
      d3.select(nodes[i].parentNode as any)
        .append("line")
        .attr("x1", w - margin)
        .attr("x2", w - margin + 15)
        .attr("y1", 0.5)
        .attr("y2", 0.5)
        .attr('class', 'xAxisAider')
        .attr("stroke", "white")
        .attr("marker-end", "url(#markc-xAxis)");
    });

  diagramGroup.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${w / 2},0)`)
    .transition()
    .duration(750)
    .call(yAxis as any)
    .call((g: any) => {
      g.selectAll(".tick text").filter((d: any) => d === 0).remove();
    })
    .select(".domain")
    .attr("stroke", "white")
    .each((d: any, i: any, nodes: any) => {
      d3.select(nodes[i].parentNode as any)
        .append("line")
        .attr("x1", 0.5)
        .attr("x2", 0.5)
        .attr("y1", margin)
        .attr("y2", margin - 15)
        .attr('class', 'yAxisAider')
        .attr("stroke", "white")
        .attr("marker-end", "url(#markc-yAxis)");
    });

  const textItems = textGroup.selectAll("text")
    .data(sData)
    .enter()
    .append("text")
    .attr("x", w / 2)
    .attr("y", (d, i) => margin + i * 40)
    .style("font-size", "14px")
    .style("fill", d => colors[d.key.charAt(1)])
    .style("stroke", d => colors[d.key.charAt(1)])
    .each(function(d: any) {
      d3.select(this).text(null);
      appendPolarAndCartesianSingleLine(d3.select(this), d);
    });

  // A helper to append both polar and cartesian lines
  function appendPolarAndCartesianSingleLine(textSelection: any, d: any) {
    const { x, y } = d.value;
    const magnitude = Math.hypot(x, y).toFixed(3);
    const angleDeg = (Math.atan2(y, x) * 180 / Math.PI).toFixed(2);
    const sign = (y < 0) ? '-' : '+';
    const yAbs = Math.abs(y).toFixed(3);

    textSelection.text(null);

    textSelection
      .append("tspan")
      .style("text-decoration", "none")
      .text(`${(d.key === 'ZsymetricalTotal') ? 'ZT' : d.key} = ${magnitude} `);

    textSelection
      .append("tspan")
      .style("text-decoration", "underline")
      .text(`/${angleDeg}°`);

    textSelection
      .append("tspan")
      .style("text-decoration", null)
      .text(` , ${(d.key === 'ZsymetricalTotal') ? 'ZT' : d.key} = ${x.toFixed(3)} ${sign} j ${yAbs}`);
  }

  // Now the update function
  function updateTextView() {
    sData.forEach(d => {
      d.value = vectorsData[d.key];
    });

    textItems.each(function(d: any) {
      const sel = d3.select(this).text(null);
      appendPolarAndCartesianSingleLine(sel, d);
    });
  }

  // Group for vectors
  const vectorGroup = diagramGroup.append("g");

  // Draw lines
  vectorGroup.selectAll(".phasorLine")
    .data(sData)
    .enter()
    .append("line")
    .attr("class", d => "phasorLine " + d.key)
    .attr("x1", w / 2)
    .attr("y1", h / 2)
    .attr("x2", d => scaleX(d.value.x))
    .attr("y2", d => scaleY(d.value.y))
    .attr("stroke", d => colors[d.key.charAt(1)])
    .attr("stroke-width", 2)
    .attr("marker-end", d => `url(#arrow-${d.key.charAt(1)})`);

  vectorGroup.selectAll(".textLine")
    .data(sData)
    .enter()
    .append("text")
    .attr("class", d => `textLine ${d.key} ${d.key.charAt(0)}`)
    .attr("id", d => `text${d.key}`)
    .attr("x", d => scaleX(d.value.x))
    .attr("y", d => scaleY(d.value.y))
    .attr("dx", 5)
    .attr("dy", -5)
    .style("font-size", "1rem")
    .style("font-weight", "bold")
    .style("fill", d => colors[d.key.charAt(1)])
    .each(function(d: any) {
      const magnitude = Math.sqrt(d.value.x * d.value.x + d.value.y * d.value.y).toFixed(1);
      const angle = (Math.atan2(d.value.y, d.value.x) * 180 / Math.PI).toFixed(0);

      d3.select(this)
        .append("tspan")
        .text(`${(d.key === 'ZsymetricalTotal') ? 'ZT' : d.key} = ${magnitude} `);

      d3.select(this)
        .append("tspan")
        .style("text-decoration", "underline")
        .text(`/${angle}°`);
    });

  // Optional update method if values change
  function updateQuantity() {
    sData.forEach(d => {
      d.value = vectorsData[d.key];
    });
    const newMax = d3.max(sData, d => Math.sqrt(d.value.x ** 2 + d.value.y ** 2)) || 1;
    scaleX.domain([-newMax, newMax]);
    scaleY.domain([newMax, -newMax]);

    svg_.select(".x-axis")
      .transition()
      .duration(750)
      .call(xAxis as any);

    svg_.select(".y-axis")
      .transition()
      .duration(750)
      .call(yAxis as any);

    vectorGroup.selectAll(".phasorLine")
      .data(sData)
      .transition()
      .attr("x2", d => scaleX(d.value.x))
      .attr("y2", d => scaleY(d.value.y))
      .attr("marker-end", d => `url(#arrow-${d.key.charAt(1)})`);

    vectorGroup.selectAll(".textLine")
      .data(sData)
      .transition()
      .attr("x", d => scaleX(d.value.x))
      .attr("y", d => scaleY(d.value.y))
      .each(function(d: any) {
        const magnitude = Math.sqrt(d.value.x * d.value.x + d.value.y * d.value.y).toFixed(1);
        const angle = (Math.atan2(d.value.y, d.value.x) * 180 / Math.PI).toFixed(1);

        d3.select(this).text(null);

        d3.select(this)
          .append("tspan")
          .text(`${(d.key === 'ZsymetricalTotal') ? 'ZT' : d.key} = ${magnitude}`);

        d3.select(this)
          .append("tspan")
          .style("text-decoration", "underline")
          .text(`/${angle}°`);
      });

    updateTextView();
  }

  return { updateQuantity };
}

import * as d3 from "d3";

export interface VectorData {
  key: string;
  value: {
    x: number;
    y: number;
    magnitude?: number;
    angle?: number;
  };
}

export type InputChangeHandler = (event: Event, d: VectorData) => void;

export function Inputs(
  SelectInputFieldsID: string,
  classForTable: string,
  SelectInputFieldsClass: string,
  data: VectorData[],
  onInputChanged: InputChangeHandler
): d3.Selection<any, any, any, any> {
  const inputDiv = d3.select(SelectInputFieldsID);
  const table = inputDiv.append("table").attr("class", classForTable);
  table.style('font-size', '0.8rem');

  // Create table header
  const header = table.append("thead").append("tr");

  // Create a button in the first header cell
  header.append("th")
    .append("button")
    .text("R/X")
    .style('font-size', '0.8rem')
    .attr("class", "myButtonCurrentAndVoltagePanel")
    .on("click", function() {
      d3.select(".CurrentAndVoltageTable")
        .classed("hidden", !d3.select(".CurrentAndVoltageTable").classed("hidden"));
      d3.select(".polarTable")
        .classed("hidden", !d3.select(".polarTable").classed("hidden"));

      d3.selectAll(".input-field").each(function(d: unknown) {
        const phaseData = d as VectorData;
        const phase = phaseData.key;
        d3.select(`#${phase}-real`).property("value", phaseData.value.x.toFixed(2));
        d3.select(`#${phase}-imaginary`).property("value", phaseData.value.y.toFixed(2));
      });
      d3.selectAll(".input-fieldPolar").each(function(d: unknown) {
        const phaseData = d as VectorData;
        const phase = phaseData.key;
        d3.select(`#${phase}-amplitude`).property("value", (phaseData.value.magnitude || 0).toFixed(2));
        d3.select(`#${phase}-angle`).property("value", (phaseData.value.angle || 0).toFixed(2));
      });
    });

  header.append("th").text("R");
  header.append("th").text("X");

  // Create table body
  const tbody = table.append("tbody");

  const inputFields = tbody.selectAll("." + SelectInputFieldsClass)
    .data(data)
    .enter()
    .append("tr")
    .attr("class", SelectInputFieldsClass);

  // Add first column with input file labels
  inputFields.append("td")
    .text(d => `${d.key}: `)
    .attr("class", d => d.key.charAt(0))
    .style('font-size', '1rem');

  // Add second column with real input fields
  inputFields.append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.01")
    .style('font-size', '1rem')
    .attr("value", d => d.value.x.toFixed(3))
    .attr("placeholder", "x")
    .attr("id", d => `${d.key}-real`)
    .attr("class", d => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (lastChar !== "A" && lastChar !== "B" && lastChar !== "C" && lastChar !== "0" && lastChar !== "1" && lastChar !== "2") {
        return "VAR";
      } else {
        if (d.key.length === 3) {
          return "VAR";
        } else {
          return d.key.charAt(0);
        }
      }
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  // Add third column with imaginary input fields
  inputFields.append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.01")
    .style('font-size', '1rem')
    .attr("value", d => d.value.y.toFixed(3))
    .attr("placeholder", "y")
    .attr("id", d => `${d.key}-imaginary`)
    .attr("class", d => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (lastChar !== "A" && lastChar !== "B" && lastChar !== "C" && lastChar !== "0" && lastChar !== "1" && lastChar !== "2") {
        return "VAR";
      } else {
        if (d.key.length === 3) {
          return "VAR";
        } else {
          return d.key.charAt(0);
        }
      }
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  return inputDiv;
}

export function InputsPolar(
  SelectInputFieldsID: string,
  classForTable: string,
  SelectInputFieldsClass: string,
  data: VectorData[],
  onInputChanged: InputChangeHandler
): d3.Selection<any, any, any, any> {
  const inputDiv = d3.select(SelectInputFieldsID);
  const table = inputDiv.append("table").attr("class", classForTable);
  table.style('font-size', '0.8rem');
  table.classed('hidden', true);

  // Create table header
  const header = table.append("thead").append("tr");

  // Create a button in the first header cell
  header.append("th")
    .append("button")
    .text("A/θ")
    .style('font-size', '0.8rem')
    .attr("class", "myButtonpolarTable")
    .on("click", function() {
      d3.select(".CurrentAndVoltageTable")
        .classed("hidden", !d3.select(".CurrentAndVoltageTable").classed("hidden"));
      d3.select(".polarTable")
        .classed("hidden", !d3.select(".polarTable").classed("hidden"));

      d3.selectAll(".input-field").each(function(d: unknown) {
        const phaseData = d as VectorData;
        const phase = phaseData.key;
        d3.select(`#${phase}-real`).property("value", phaseData.value.x.toFixed(2));
        d3.select(`#${phase}-imaginary`).property("value", phaseData.value.y.toFixed(2));
      });
      d3.selectAll(".input-fieldPolar").each(function(d: unknown) {
        const phaseData = d as VectorData;
        const phase = phaseData.key;
        d3.select(`#${phase}-amplitude`).property("value", (phaseData.value.magnitude || 0).toFixed(2));
        d3.select(`#${phase}-angle`).property("value", (phaseData.value.angle || 0).toFixed(2));
      });
    });

  header.append("th").text("A");
  header.append("th").text("θ");

  // Create table body
  const tbody = table.append("tbody");

  data.forEach(d => {
    const mag = Math.sqrt(d.value.x ** 2 + d.value.y ** 2);
    const angDeg = Math.atan2(d.value.y, d.value.x) * (180 / Math.PI);
    d.value.magnitude = mag;
    d.value.angle = angDeg;
  });

  const inputFields = tbody.selectAll("." + SelectInputFieldsClass)
    .data(data)
    .enter()
    .append("tr")
    .attr("class", SelectInputFieldsClass);

  // Add first column with input file labels
  inputFields.append("td")
    .text(d => `${d.key}: `)
    .attr("class", d => d.key.charAt(0))
    .style('font-size', '1rem');

  // Add second column with amplitude input fields
  inputFields.append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.1")
    .style('font-size', '1rem')
    .attr("value", d => (d.value.magnitude || 0).toFixed(3))
    .attr("placeholder", "A")
    .attr("id", d => `${d.key}-amplitude`)
    .attr("class", d => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (lastChar !== "A" && lastChar !== "B" && lastChar !== "C" && lastChar !== "0" && lastChar !== "1" && lastChar !== "2") {
        return "VAR";
      } else {
        if (d.key.length === 3) {
          return "VAR";
        } else {
          return d.key.charAt(0);
        }
      }
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  // Add third column with angle input fields
  inputFields.append("td")
    .append("input")
    .style("width", "50px")
    .attr("type", "number")
    .attr("step", "0.1")
    .style('font-size', '1rem')
    .attr("value", d => (d.value.angle || 0).toFixed(3))
    .attr("placeholder", "θ")
    .attr("id", d => `${d.key}-angle`)
    .attr("class", d => {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (lastChar !== "A" && lastChar !== "B" && lastChar !== "C" && lastChar !== "0" && lastChar !== "1" && lastChar !== "2") {
        return "VAR";
      } else {
        if (d.key.length === 3) {
          return "VAR";
        } else {
          return d.key.charAt(0);
        }
      }
    })
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  return inputDiv;
}

export function InputsTopLeft(
  SelectInputFieldsID: string,
  classForTable: string,
  SelectInputFieldsClass: string,
  data: VectorData[],
  onInputChanged: InputChangeHandler
): d3.Selection<any, any, any, any> {
  const inputDiv = d3.select(SelectInputFieldsID);
  const table = inputDiv.append("table").attr("class", classForTable);
  table.style('font-size', '1rem');

  // Create table body
  const tbody = table.append("tbody");

  const inputFields = tbody.selectAll("." + SelectInputFieldsClass)
    .data(data)
    .enter()
    .append("tr")
    .attr("class", SelectInputFieldsClass);

  // Add first column with input file labels
  inputFields.append("td")
    .text(function(d: unknown) {
      const dataItem = d as VectorData;
      if (dataItem.key !== "Per100") {
        return ` ${dataItem.key}:`;
      } else {
        return "%";
      }
    })
    .attr("class", d => d.key);

  // Add second column with real input fields
  inputFields.append("td")
    .append("input")
    .style("width", "70px")
    .attr("type", "number")
    .attr("step", "0.01")
    .attr("value", d => d.value.x.toFixed(2))
    .attr("id", d => `${d.key}-real`)
    .attr("class", d => d.key)
    .style('font-size', '1rem')
    .style("text-align", "end")
    .on("input", onInputChanged);

  return inputDiv;
}

import { convertToPolar } from "./ComplexOperatorAid.mjs";


export function Inputs (SelectInputFieldsID,classForTable,SelectInputFieldsClass,data,onInputChanged){

  const inputDiv = d3.select(SelectInputFieldsID);
  const table = inputDiv.append("table").attr("class",classForTable);
  table.style('font-size', '0.8rem');
  // Create table header
  const header = table.append("thead").append("tr");
  // Create a button in the first header cell
  header.append("th")
  .append("button")
  .text("R/X").style('font-size', '0.8rem')
  .attr("class", "myButtonCurrentAndVoltagePanel"); // optional: add a class for styling
  d3.select('.CurrentAndVoltageTable button')
  .on("click", function() {    
    d3.select(".CurrentAndVoltageTable")
      .classed("hidden", !d3.select(".CurrentAndVoltageTable").classed("hidden"));
    d3.select(".polarTable")
      .classed("hidden", !d3.select(".polarTable").classed("hidden"));

d3.selectAll(".input-field").each(function(d) {
  const phase = d.key;
  d3.select(`#${phase}-real`).property("value", d.value.x.toFixed(2));
  d3.select(`#${phase}-imaginary`).property("value", d.value.y.toFixed(2));
});     
d3.selectAll(".input-fieldPolar").each(function(d) {
  const phase = d.key;
  
  d3.select(`#${phase}-amplitude`).property("value", d.value.magnitude.toFixed(2));
  d3.select(`#${phase}-angle`).property("value", d.value.angle.toFixed(2));
});  
  });
  header.append("th").text("R");
  header.append("th").text("X");
  
  // Create table body
  const tbody = table.append("tbody");
  
  const inputFields = tbody.selectAll("."+SelectInputFieldsClass)
    .data(data)
    .enter().append("tr")
    .attr("class", SelectInputFieldsClass);
    
  var underlinedSlash = String.fromCharCode(47) + '\u0332';    
  // Add first column with input file labels
  inputFields.append("td")
    .text(d => `${d.key}: `)
    .attr("class",d => d.key.charAt(0))
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
    .attr("class",function(d) { 
      if (d.key.charAt(d.key.length-1) !== "A" && d.key.charAt(d.key.length-1) !== "B" && d.key.charAt(d.key.length-1) !== "C" && d.key.charAt(d.key.length-1) !== "0" && d.key.charAt(d.key.length-1) !== "1" && d.key.charAt(d.key.length-1) !== "2"){
         return "VAR"; 
      } else { 
      if ((d.key.length===3)){return "VAR" }
      else {
        return d.key.charAt(0);
      }
      }})
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
    .attr("class",function(d) {
      if (d.key.charAt(d.key.length-1) !== "A" && d.key.charAt(d.key.length-1) !== "B" && d.key.charAt(d.key.length-1) !== "C" && d.key.charAt(d.key.length-1) !== "0" && d.key.charAt(d.key.length-1) !== "1" && d.key.charAt(d.key.length-1) !== "2"){
         return "VAR"; 
      } else { 
      if ((d.key.length===3)){return "VAR" }
      else {
        return d.key.charAt(0);
      }
      }})
    .on("input", onInputChanged)
    .on("change", onInputChanged);

  return inputDiv;
}
export function InputsPolar (SelectInputFieldsID,classForTable,SelectInputFieldsClass,data,onInputChanged){

    const inputDiv = d3.select(SelectInputFieldsID);
    const table = inputDiv.append("table").attr("class",classForTable);
    table.style('font-size', '0.8rem');
    table.classed('hidden', true);
    // Create table header
    const header = table.append("thead").append("tr");
    // Create a button in the first header cell
    header.append("th")
    .append("button")
    .text("A/θ").style('font-size', '0.8rem')
    .attr("class", "myButtonpolarTable"); // optional: add a class for styling
    d3.select('.polarTable button')
    .on("click", function() {      
      d3.select(".CurrentAndVoltageTable")
      .classed("hidden", !d3.select(".CurrentAndVoltageTable").classed("hidden"));
      d3.select(".polarTable")
        .classed("hidden", !d3.select(".polarTable").classed("hidden"));

        d3.selectAll(".input-field").each(function(d) {
          const phase = d.key;
          d3.select(`#${phase}-real`).property("value", d.value.x.toFixed(2));
          d3.select(`#${phase}-imaginary`).property("value", d.value.y.toFixed(2));
        });     
        d3.selectAll(".input-fieldPolar").each(function(d) {
          const phase = d.key;
          
          d3.select(`#${phase}-amplitude`).property("value", d.value.magnitude.toFixed(2));
          d3.select(`#${phase}-angle`).property("value", d.value.angle.toFixed(2));
        });       
    });
    header.append("th").text("A");
    header.append("th").text("θ");
    
    // Create table body
    const tbody = table.append("tbody");

    data.forEach(d => {
      const mag = Math.sqrt(d.value.x**2 + d.value.y**2);
      const angDeg = Math.atan2(d.value.y, d.value.x) * (180/Math.PI);
      d.value.magnitude = mag;
      d.value.angle = angDeg;
    });
    
    const inputFields = tbody.selectAll("."+SelectInputFieldsClass)
      .data(data)
      .enter().append("tr")
      .attr("class", SelectInputFieldsClass);
      
    var underlinedSlash = String.fromCharCode(47) + '\u0332';    
    // Add first column with input file labels
    inputFields.append("td")
      .text(d => `${d.key}: `)
      .attr("class",d => d.key.charAt(0))
      .style('font-size', '1rem');
    
    // Add second column with real input fields
    inputFields.append("td")
      .append("input")
      .style("width", "50px")
      .attr("type", "number")
      .attr("step", "0.1")
      .style('font-size', '1rem')
      .attr("value", d => d.value.magnitude.toFixed(3))
      .attr("placeholder", "A")
      .attr("id", d => `${d.key}-amplitude`)
      .attr("class",function(d) { 
        if (d.key.charAt(d.key.length-1) !== "A" && d.key.charAt(d.key.length-1) !== "B" && d.key.charAt(d.key.length-1) !== "C" && d.key.charAt(d.key.length-1) !== "0" && d.key.charAt(d.key.length-1) !== "1" && d.key.charAt(d.key.length-1) !== "2"){
           return "VAR"; 
        } else { 
        if ((d.key.length===3)){return "VAR" }
        else {
          return d.key.charAt(0);
        }
        }})
      .on("input", onInputChanged)
      .on("change", onInputChanged);
    
    // Add third column with imaginary input fields
    inputFields.append("td")
      .append("input")
      .style("width", "50px")
      .attr("type", "number")
      .attr("step", "0.1")
      .style('font-size', '1rem')
      .attr("value", d => d.value.angle.toFixed(3))
      .attr("placeholder", "θ")
      .attr("id", d => `${d.key}-angle`)
      .attr("class",function(d) {
        if (d.key.charAt(d.key.length-1) !== "A" && d.key.charAt(d.key.length-1) !== "B" && d.key.charAt(d.key.length-1) !== "C" && d.key.charAt(d.key.length-1) !== "0" && d.key.charAt(d.key.length-1) !== "1" && d.key.charAt(d.key.length-1) !== "2"){
           return "VAR"; 
        } else { 
        if ((d.key.length===3)){return "VAR" }
        else {
          return d.key.charAt(0);
        }
        }})
      .on("input", onInputChanged)
      .on("change", onInputChanged);

    return inputDiv;
}

export function InputsTopLeft (SelectInputFieldsID,classForTable,SelectInputFieldsClass,data,onInputChanged){
console.log('SelectInputFieldsID', SelectInputFieldsID)

  const inputDiv = d3.select(SelectInputFieldsID);
  const table = inputDiv.append("table").attr("class",classForTable);
  table.style('font-size', '1rem');
    // Create table body
  const tbody = table.append("tbody");
  
  const inputFields = tbody.selectAll("."+SelectInputFieldsClass)
    .data(data)
    .enter().append("tr")
    .attr("class", SelectInputFieldsClass)
  
  // Add first column with input file labels
  inputFields.append("td")
    .text(function(d) {
      if (d.key !== "Per100") {
        return ` ${d.key}:`;
      } else {
        return "%";
      }
    })
    .attr("class",d => d.key);
  
  // Add second column with real input fields
  inputFields.append("td")
    .append("input")
    .style("width", "70px")
    .attr("type", "number")
    .attr("step", "0.01")
    .attr("value", d => d.value.x.toFixed(2))
    .attr("id", d => `${d.key}-real`)
    .attr("class",d => d.key)
    .style('font-size', '1rem')
    .style("text-align","end")
    .on("input", onInputChanged)
    // .on("change", onInputChanged);

  return inputDiv;
}


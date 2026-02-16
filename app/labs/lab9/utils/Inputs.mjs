import { convertToPolar } from "../js/ComplexOperatorAid.mjs";


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
    .attr("class", "myButtonCurrentAndVoltagePanel") // optional: add a class for styling
    .on("click", function() {
      let tableToHide = document.getElementsByClassName(classForTable);console.log("classForTable",classForTable);
      tableToHide.style("display","none");
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
      .style('font-size', '1rem')
      .on("mouseenter", function(event,d) {
      let elementReal =document.getElementById(d.key+"-real")
      let elementImaginary =document.getElementById(d.key+"-imaginary")
      let boundingBoxReal = elementReal.getBoundingClientRect()
      let boundingBoxImaginary = elementImaginary.getBoundingClientRect()

        // Create tooltip element
        const tooltip = d3.selectAll(".CurrentAndVoltageTable")
          .append("div")
          .text(` ${ convertToPolar(d.value, true).magnitude.toFixed(2)} `)
          .attr("class", "tooltip")
        const tooltipUnderlined = d3.selectAll(".CurrentAndVoltageTable")
          .append("div")
          .text(` ${" " + underlinedSlash}${convertToPolar(d.value,true).angle.toFixed(1)} `)
          .attr("class", "tooltipUnderlined");
          
        tooltip.style("left",boundingBoxReal.x  + "px").style("top", boundingBoxReal.y + "px").style("height",boundingBoxReal.height + "px").style("width",boundingBoxReal.width + "px");
        tooltipUnderlined.style("left",boundingBoxImaginary.x + "px").style("top", boundingBoxImaginary.y + "px").style("height",boundingBoxImaginary.height + "px").style("width",boundingBoxImaginary.width + "px");
      })
      .on("mouseout", function() {
        // Remove the tooltip element when the mouse is no longer over the element
        d3.select(".tooltip").remove();
        d3.select(".tooltipUnderlined").remove();
      });
    
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
      // .on("change", onInputChanged);
    
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
      // .on("change", onInputChanged);

    return inputDiv;
}

export function InputsTopLeft (SelectInputFieldsID,classForTable,SelectInputFieldsClass,data,onInputChanged){

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


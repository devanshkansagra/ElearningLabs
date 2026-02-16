import * as C_ from "../js/ComplexOperatorAid.mjs";
import * as M_ from "./AddMarkers.mjs";
import * as G_ from "./MainSVG.mjs";
import * as I_ from "./Inputs.mjs";
import * as CL_ from "./checkboxListeners.mjs";


import { ThreePhaseFault } from './3PhFault_at_F.mjs';
import { Ph_Ph } from "./2PhFault_at_F.mjs";
import { Ph_G } from "./1PhFault_at_F.mjs";


// CL_.inputListener1Ph;

// CL_.inputListener2Ph;

// CL_.inputListener3Ph;

M_.Vmarker(svg, Object.keys(colors), arrowSize, colors);

const impedanceData = calculateImpedances(vectorsData);


var inputsTopLeft = I_.InputsTopLeft(
  "#inputsTopLeftVariablle",
  "datumTable var",
  "input-fieldsVar",
  [
    { key: "Voltage", value: {x:Voltage, y:0}},
    { key: "l", value: {x:lineLength, y:0}},
    { key: "Per100", value: {x:distanceToFault, y:0}},
    { key: "Sb", value: {x:Sb, y:0}}
  ],
  onInputChanged
);
var inputsTopLeftBelow = I_.Inputs(
  "#inputsTopLeftProtectedLine",
  "VariablesTable var",
  "input-fieldsVar",
  [
    { key:"Z1l", value: {x: Z1x , y: Z1y} },
    { key:"ZL", value:{x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b}},
    { key:"Z0l", value: {x: Z0x,y: Z0y} },
    { key: "Es", value: {x:E_F.x,y:E_F.y} },
    { key:"Zf", value: {x: Z_F.x,y: Z_F.y} }
  ],
  onInputChanged
);

var inputsTopLeftBelow = I_.Inputs(
  "#inputsTopRight",
  "VariablesTable var",
  "input-fieldsVar",
  [
    { key:"ZE1", value:{x:Z_E1.x,y:Z_E1.y} },
    { key:"ZE2", value:{x:Z_E2.x,y:Z_E2.y} },
    { key:"ZE0", value:{x:Z_E0.x,y:Z_E0.y}  },
    { key:"ZS1", value: {x:Z_S1.x,y:Z_S1.y}  },
    { key:"ZS2", value: {x:Z_S2.x,y:Z_S2.y}  },
    { key:"ZS0", value: {x:Z_S0.x,y:Z_S0.y}  },
    { key:"ZU1", value: {x:Z_U1.x,y:Z_U1.y}  },
    { key:"ZU2", value: {x:Z_U2.x,y:Z_U2.y}  },
    { key:"ZU0", value: {x:Z_U0.x,y:Z_U0.y}  }
  ],
  onInputChanged
);

var addClass_3Ph_to_Elements = document.querySelectorAll("#ZE1-real, #ZE1-imaginary, #ZU1-real, #ZU1-imaginary, #ZS1-real, #ZS1-imaginary");
var addClass_Unbalanced_to_Elements = document.querySelectorAll("#ZE0-real, #ZE0-imaginary, #ZE2-real, #ZE2-imaginary, #ZU0-real, #ZU0-imaginary, #ZU2-real, #ZU2-imaginary, #ZS0-real, #ZS0-imaginary, #ZS2-real, #ZS2-imaginary, #Z0l-real, #Z0l-imaginary");

addClass_3Ph_to_Elements.forEach(function(n) {
  n.classList.add("Balanced");
});

addClass_Unbalanced_to_Elements.forEach(function(n) {
  n.classList.add("Unbalanced");
});

var listenTo3Ph = document.getElementById("faultType3Ph");
var listenTo2Ph = document.getElementById("faultType2Ph");
var listenTo1Ph = document.getElementById("faultType1Ph");

listenTo3Ph.addEventListener("click",function(){

d3.selectAll("#svgSingleDiagram_g_id>text.Unbalanced").style("display","none");
d3.selectAll("#svgSingleDiagram_g_id>text.Balanced").style("display","block");
var inputsUnbalanced =  Array.from(document.getElementsByClassName('Unbalanced'));
inputsUnbalanced.forEach(function(i){ i.style.color="lightgrey";i.readOnly=true;i.style.cursor="not-allowed";})
var inputsBalanced =  Array.from(document.getElementsByClassName('Balanced'));
inputsBalanced.forEach(function(i){ i.style.color="black";i.readOnly=false;});
CL_.Fault_Type("./3PhFault_at_F.mjs","3Ph");
})

listenTo2Ph.addEventListener("click",function(){
d3.selectAll("#svgSingleDiagram_g_id>text.Unbalanced").style("display","block");
d3.selectAll("#svgSingleDiagram_g_id>text.Balanced").style("display","block");
var inputsUnbalanced =  Array.from(document.getElementsByClassName('Unbalanced'));
inputsUnbalanced.forEach(function(i){ i.style.color="black";i.readOnly=false;i.style.cursor="auto";})
      var inputsBalanced =  Array.from(document.getElementsByClassName('Balanced'));
      inputsBalanced.forEach(function(i){ i.style.color="black";i.readOnly=false;});
CL_.Fault_Type("./2PhFault_at_F.mjs","2Ph");
})

listenTo1Ph.addEventListener("click",function(){
d3.selectAll("#svgSingleDiagram_g_id>text.Unbalanced").style("display","block");
d3.selectAll("#svgSingleDiagram_g_id>text.Balanced").style("display","block");
var inputsUnbalanced =  Array.from(document.getElementsByClassName('Unbalanced'));
inputsUnbalanced.forEach(function(i){ i.style.color="black";i.readOnly=false;i.style.cursor="auto";})
      var inputsBalanced =  Array.from(document.getElementsByClassName('Balanced'));
      inputsBalanced.forEach(function(i){ i.style.color="black";i.readOnly=false;});
CL_.Fault_Type("./1PhFault_at_F.mjs","1Ph");
})

// Step 1: Select the input element
var numberInputs = document.querySelectorAll('#l-real, #Sb-real, #Per100-real, #Voltage-real, .VAR, #pathFaultStrike');
numberInputs.forEach(function(numberInput,i) {

numberInput.addEventListener('change', function() {
  if ("Voltage-real"===numberInput.id) {
    Voltage = parseFloat(numberInput.value);
    Z_L1.x =lineLength*Z1x/(Voltage*Voltage/Sb);
    let ZLReal = document.getElementById("ZL-real");
    ZLReal.value=Z_L1.x;
    Z_L1.y =lineLength*Z1y/(Voltage*Voltage/Sb);
    let ZLImaginary = document.getElementById("ZL-imaginary");
    ZLImaginary.value=Z_L1.y; 
    Z_b=Voltage*Voltage/Sb;
    d3.select("#Basetext")._groups[0][0].innerHTML = "Network Characteristics: V = " + Voltage + " kV, S base = " + Sb + " MVA, Z base = " + Z_b + " Î©"+ ", fault at " +distanceToFault + "% of Line L ("+ lineLength + " miles)";
    
  }; 
  if ("l-real"===numberInput.id) {
    lineLength = parseFloat(numberInput.value);
    Z_L1.x =lineLength*Z1x/Z_b;
    let ZLReal = document.getElementById("ZL-real");
    ZLReal.value=Z_L1.x;
    Z_L1.y =lineLength*Z1y/Z_b;
    let ZLImaginary = document.getElementById("ZL-imaginary");
    ZLImaginary.value=Z_L1.y; 
    d3.select("#Basetext")._groups[0][0].innerHTML = "Network Characteristics: V = " + Voltage.toFixed(1) + " kV, S base = " + Sb.toFixed(1) + " MVA, Z base = " + Z_b.toFixed(2) + " Î©"+ ", fault at " + (distanceToFault).toFixed(1) + "% of Line L ("+ lineLength.toFixed(2) + " miles)";
  }; 
  if ("Sb-real"===numberInput.id) {
    Sb = parseFloat(numberInput.value);
    Z_L1.x =lineLength*Z1x/(Voltage*Voltage/Sb);
    let ZLReal = document.getElementById("ZL-real");
    ZLReal.value=Z_L1.x;
    Z_L1.y =lineLength*Z1y/(Voltage*Voltage/Sb);
    let ZLImaginary = document.getElementById("ZL-imaginary");
    ZLImaginary.value=Z_L1.y;   
    Z_b=Voltage*Voltage/Sb;
    d3.select("#Basetext")._groups[0][0].innerHTML = "Network Characteristics: V = " + Voltage.toFixed(1) + " kV, S base = " + Sb.toFixed(1) + " MVA, Z base = " + Z_b.toFixed(2) + " Î©"+ ", fault at " + (distanceToFault).toFixed(1) + "% of Line L ("+ lineLength.toFixed(2) + " miles)";
  };
  if ("Per100-real"===numberInput.id) {
    var minX = LeftBusPosition -0.5;
    var maxX = LeftBusPosition + Line_E_Length - 22.5;
    distanceToFault = parseFloat(numberInput.value)
     console.log("distancetofautl",distanceToFault);
     h = {x:distanceToFault/100,y:0}; I_h = {x:1-distanceToFault/100,y:0};
    d3.select("#pathFaultStrike").attr("transform", "translate(" + (distanceToFault/100 * (maxX - minX) + minX) + "," + (Line_L_Position -7.5) + ") scale(1,2.35)");
    d3.select("#Basetext")._groups[0][0].innerHTML = "Network Characteristics: V = " + Voltage.toFixed(1) + " kV, S base = " + Sb.toFixed(1) + " MVA, Z base = " + Z_b.toFixed(2) + " Î©"+ ", fault at " + (distanceToFault).toFixed(1) + "% of Line L ("+ lineLength.toFixed(2) + " miles)";
  };
  if ("Z1l-real"===numberInput.id) {
    Z1x = parseFloat(numberInput.value);
    Z_L1.x =lineLength*Z1x/Z_b;
    let ZLReal = document.getElementById("ZL-real");
    ZLReal.value=Z_L1.x;
    d3.select("#Z1ltext")._groups[0][0].innerHTML="Z1l = "+Z_L1.x.toFixed(3)+" + j "+Z_L1.y.toFixed(3);};
  if ("Z1l-imaginary"===numberInput.id) {
    Z1y = parseFloat(numberInput.value);
    Z_L1.y =lineLength*Z1y/Z_b;
    let ZLImaginary = document.getElementById("ZL-imaginary");
    ZLImaginary.value=Z_L1.y;
    d3.select("#Z1ltext")._groups[0][0].innerHTML="Z1l = "+Z_L1.x.toFixed(3)+" + j "+Z_L1.y.toFixed(3);};
  if ("Z0l-real"===numberInput.id) {Z0x = parseFloat(numberInput.value);};
  if ("Z0l-imaginary"===numberInput.id) {Z0y = parseFloat(numberInput.value);};
  if ("Zf-real"===numberInput.id) {Z_F.x = parseFloat(numberInput.value);};
  if ("Zf-imaginary"===numberInput.id) {Z_F.y = parseFloat(numberInput.value);};
  if ("ZL-real"===numberInput.id) {
    Z_L1.x = parseFloat(numberInput.value);  
    Z1x = Z_b*Z_L1.x/lineLength;
    let Z1LReal = document.getElementById("Z1l-real");
    Z1LReal.value=Z1x;
    d3.select("#Z1ltext")._groups[0][0].innerHTML="Z1l = "+Z_L1.x.toFixed(3)+" + j "+Z_L1.y.toFixed(3);};
  if ("ZL-imaginary"===numberInput.id) {
    Z_L1.y = parseFloat(numberInput.value);   
    Z1y = Z_b*Z_L1.y/lineLength;
    let ZLImaginary = document.getElementById("Z1l-imaginary");
    ZLImaginary.value=Z_L1.y;  
    d3.select("#Z1l")._groups[0][0].innerHTML="Z1l = "+Z_L1.x.toFixed(3)+" + j "+Z_L1.y.toFixed(3);};
  if ("ZE1-real"===numberInput.id) {
    Z_E1.x = parseFloat(numberInput.value);    
    d3.select("#ZE1text")._groups[0][0].innerHTML="ZE1 = "+Z_E1.x.toFixed(3)+" + j "+Z_E1.y.toFixed(3);};
  if ("ZE1-imaginary"===numberInput.id) {
    Z_E1.y = parseFloat(numberInput.value);    
    d3.select("#ZE1text")._groups[0][0].innerHTML="ZE1 = "+Z_E1.x.toFixed(3)+" + j "+Z_E1.y.toFixed(3);};
  if ("ZE2-real"===numberInput.id) {
    Z_E2.x = parseFloat(numberInput.value);
   d3.select("#ZE2text")._groups[0][0].innerHTML="ZE2 = "+Z_E2.x.toFixed(3)+" + j "+Z_E2.y.toFixed(3);};
  if ("ZE2-imaginary"===numberInput.id) {
    Z_E2.y = parseFloat(numberInput.value);
    d3.select("#ZE2text")._groups[0][0].innerHTML="ZE2 = "+Z_E2.x.toFixed(3)+" + j "+Z_E2.y.toFixed(3);};
  if ("ZE0-real"===numberInput.id) {
    Z_E0.x = parseFloat(numberInput.value);
    d3.select("#ZE0text")._groups[0][0].innerHTML="ZE0 = "+Z_E0.x.toFixed(3)+" + j "+Z_E0.y.toFixed(3);};
  if ("ZE0-imaginary"===numberInput.id) {
    Z_E0.y = parseFloat(numberInput.value);
    d3.select("#ZE0text")._groups[0][0].innerHTML="ZE0 = "+Z_E0.x.toFixed(3)+" + j "+Z_E0.y.toFixed(3);};
  if ("ZS1-real"===numberInput.id) {
    Z_S1.x = parseFloat(numberInput.value);
    d3.select("#ZS1text")._groups[0][0].innerHTML="ZS1 = "+Z_S1.x.toFixed(3)+" + j "+Z_S1.y.toFixed(3);};
  if ("ZS1-imaginary"===numberInput.id) {
    Z_S1.y = parseFloat(numberInput.value);
    d3.select("#ZS1text")._groups[0][0].innerHTML="ZS1 = "+Z_S1.x.toFixed(3)+" + j "+Z_S1.y.toFixed(3);};
  if ("ZS2-real"===numberInput.id) {
    Z_S2.x = parseFloat(numberInput.value);
    d3.select("#ZS2text")._groups[0][0].innerHTML="ZS2 = "+Z_S2.x.toFixed(3)+" + j "+Z_S2.y.toFixed(3);};
  if ("ZS2-imaginary"===numberInput.id) {
    Z_S2.y = parseFloat(numberInput.value);
    d3.select("#ZS2text")._groups[0][0].innerHTML="ZS2 = "+Z_S2.x.toFixed(3)+" + j "+Z_S2.y.toFixed(3);};
  if ("ZS0-real"===numberInput.id) {
    Z_S0.x = parseFloat(numberInput.value);
    d3.select("#ZS0text")._groups[0][0].innerHTML="ZS0 = "+Z_S0.x.toFixed(3)+" + j "+Z_S0.y.toFixed(3);};
  if ("ZS0-imaginary"===numberInput.id) {
    Z_S0.y = parseFloat(numberInput.value);console.log("Zso.y",Z_S0.y);
    d3.select("#ZS0text")._groups[0][0].innerHTML="ZS0 = "+Z_S0.x.toFixed(3)+" + j "+Z_S0.y.toFixed(3);};
  if ("ZU1-real"===numberInput.id) {
    Z_U1.x = parseFloat(numberInput.value);    
    d3.select("#ZU1text")._groups[0][0].innerHTML="ZU1 = "+Z_U1.x.toFixed(3)+" + j "+Z_U1.y.toFixed(3);};
  if ("ZU1-imaginary"===numberInput.id) {
    Z_U1.y = parseFloat(numberInput.value);    
    d3.select("#ZU1text")._groups[0][0].innerHTML="ZU1 = "+Z_U1.x.toFixed(3)+" + j "+Z_U1.y.toFixed(3);};
  if ("ZU2-real"===numberInput.id) {
    Z_U2.x = parseFloat(numberInput.value);
    d3.select("#ZU2text")._groups[0][0].innerHTML="ZU2 = "+Z_U2.x.toFixed(3)+" + j "+Z_U2.y.toFixed(3);};
  if ("ZU2-imaginary"===numberInput.id) {
    Z_U2.y = parseFloat(numberInput.value);
    d3.select("#ZU2text")._groups[0][0].innerHTML="ZU2 = "+Z_U2.x.toFixed(3)+" + j "+Z_U2.y.toFixed(3);};
  if ("ZU0-real"===numberInput.id) {
    Z_U0.x = parseFloat(numberInput.value);
    d3.select("#ZU0text")._groups[0][0].innerHTML="ZU0 = "+Z_U0.x.toFixed(3)+" + j "+Z_U0.y.toFixed(3);};
  if ("ZU0-imaginary"===numberInput.id) {
    Z_U0.y = parseFloat(numberInput.value);
    d3.select("#ZU0text")._groups[0][0].innerHTML="ZU0 = "+Z_U0.x.toFixed(3)+" + j "+Z_U0.y.toFixed(3);};
  if ("Es-real"===numberInput.id) {
    E_F.x = parseFloat(numberInput.value);
    d3.select("#Estext")._groups[0][0].innerHTML="Es = "+E_F.x+" + j "+E_F.y; };
  if ("Es-imaginary"===numberInput.id) {
    E_F.y = parseFloat(numberInput.value);
    d3.select("#Estext")._groups[0][0].innerHTML="Es = "+E_F.x+" + j "+E_F.y; };  

    CL_.Fault_Type("./"+ checkedValue +"Fault_at_F.mjs",checkedValue);
    console.log("to check oninput Change");
});
});



var pathFaultStrike = svgSingleDiagram_g.append("path");
pathFaultStrike.attr("d", "M10.4154 18.9231L10.8804 16.5981C10.9357 16.3214 10.9634 16.183 10.8884 16.0915C10.8134 16 10.6723 16 10.3901 16H8.8831C8.49157 16 8.2958 16 8.224 15.8732C8.15219 15.7463 8.25291 15.5785 8.45435 15.2428L10.5457 11.7572C10.7471 11.4215 10.8478 11.2537 10.776 11.1268C10.7042 11 10.5084 11 10.1169 11H7.7215C7.39372 11 7.22984 11 7.15527 10.8924C7.0807 10.7848 7.13825 10.6313 7.25334 10.3244L9.87834 3.32444C9.93719 3.1675 9.96661 3.08904 10.0309 3.04452C10.0951 3 10.1789 3 10.3465 3H15.1169C15.5084 3 15.7042 3 15.776 3.12683C15.8478 3.25365 15.7471 3.42152 15.5457 3.75725L13.4543 7.24275C13.2529 7.57848 13.1522 7.74635 13.224 7.87317C13.2958 8 13.4916 8 13.8831 8H15C15.4363 8 15.6545 8 15.7236 8.1382C15.7927 8.27639 15.6618 8.45093 15.4 8.8L13.6 11.2C13.3382 11.5491 13.2073 11.7236 13.2764 11.8618C13.3455 12 13.5637 12 14 12H15.9777C16.4225 12 16.6449 12 16.7134 12.1402C16.782 12.2803 16.6454 12.4559 16.3724 12.807L11.3003 19.3281C10.7859 19.9895 10.5287 20.3202 10.3488 20.2379C10.1689 20.1556 10.2511 19.7447 10.4154 18.9231Z")
.attr("fill", "grey")
.attr("id","pathFaultStrike")
.attr("transform", "translate(" + (distanceToFault/100 * (maxX - minX) + minX) + "," + (Line_L_Position -7.5) + ") scale(1,2.35)");



// Define drag behavior
var dragFault = d3.drag()
  .on("drag", function(event) {
      // Current x position of the path
      currentX = d3.select(this).attr("transform") ? parseFloat(d3.select(this).attr("transform").split(',')[0].replace('translate(', '')) : 0;

      // Calculate new x position based on the drag event
      var newX = currentX + event.dx;

      // Check if the new x position is within the defined limits
      if (newX < minX) {
          newX = minX;
      } else if (newX > maxX) {
          newX = maxX;
      }

      // Apply the translation to the path
      d3.select(this).attr("transform", "translate(" + newX + "," + (Line_L_Position -7.5) + ") scale(1,2.35)");
      currentX=newX;
      
      // Calculate and output the percentage position of the path
      distanceToFault = (newX - minX) / (maxX - minX);
      document.getElementById("Per100-real").value=(distanceToFault*100).toFixed(2);
      h = {x:distanceToFault,y:0}; I_h = {x:1-distanceToFault,y:0};
      console.log("h in drag",h);
      d3.select("#Basetext")._groups[0][0].innerHTML = "Network Characteristics: V = " + Voltage.toFixed(1) + " kV, S base = " + Sb.toFixed(1) + " MVA, Z base = " + Z_b.toFixed(2) + " Î©"+ ", fault at " + (distanceToFault*100).toFixed(1) + "% of Line L ("+ lineLength.toFixed(2) + " miles)";      
      CL_.Fault_Type("./"+ checkedValue +"Fault_at_F.mjs",checkedValue);
      console.log("are we going through drag the fault?");
  });

// Apply the drag behavior to the path
pathFaultStrike.call(dragFault);



var inputDiv1 = I_.Inputs(
  "#input-fields1",
  "ImpedanceTable Z",
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

// d3.selectAll(".Z")
//   .attr("readonly", true)
//   // .style("pointer-events", "none")
//   .style("cursor", "not-allowed");

var inputDiv = I_.Inputs(
  "#input-fields",
  "CurrentAndVoltageTable",
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

updateInputFields([
  { key: "IA", value: vectorsData.IA },
  { key: "IB", value: vectorsData.IB },
  { key: "IC", value: vectorsData.IC },
  { key: "VA", value: vectorsData.VA },
  { key: "VB", value: vectorsData.VB },
  { key: "VC", value: vectorsData.VC },
  { key: "Z0", value: vectorsData.Z0 },
  { key: "Z1", value: vectorsData.Z1 },
  { key: "Z2", value: vectorsData.Z2 },
  { key: "ZA", value: vectorsData.ZA },
  { key: "ZB", value: vectorsData.ZB },
  { key: "ZC", value: vectorsData.ZC },
]);

// Define input change function
export function onInputChanged(event, d) {
  let inputType; console.log("are we going through onInputChange?");
  const phase = d.key; 
  if (event.target.id.includes("-")){ inputType = event.target.id.split("-")[1];} else {inputType = event.target.id;}; 
  const newValue = parseFloat(event.target.value);
  if (inputType === "real") { 
    vectorsData[phase].x = newValue;
  } else if (inputType === "imaginary") {
    vectorsData[phase].y = newValue;
  } else {vectorsData[phase] = newValue;}
  
  updateMainVisualization(phase);

  updateImpedances(vectorsData, d.key);
  vectorsData[d.key].x = d.value.x;
  vectorsData[d.key].y = d.value.y;
  if (["A", "B", "C"].includes(d.key.charAt(1))){ 
  const z = C_.complexDivision(
    vectorsData["V" + d.key.charAt(1)],
    vectorsData["I" + d.key.charAt(1)]
  );

  
  d3.select("#Z" + d.key.charAt(1) + "-real").property("value", z.x);
  d3.select("#Z" + d.key.charAt(1) + "-imaginary").property("value", z.y);
  vectorsData["Z" + d.key.charAt(1)].x = z.x;
  vectorsData["Z" + d.key.charAt(1)].y = z.y;
  calculateSequenceImpedances(vectorsData);
  var max = Number.NEGATIVE_INFINITY;

  var allPhases = ["A","B","C"]
  for (let i = 0; i < 3; i++) {
    var magnitude = Math.max( Math.abs(vectorsData["I"+allPhases[i]].x), Math.abs(vectorsData["I"+allPhases[i]].y),
                              Math.abs(vectorsData["V"+allPhases[i]].x), Math.abs(vectorsData["V"+allPhases[i]].y),
                              Math.abs(vectorsData["Z"+allPhases[i]].x), Math.abs(vectorsData["Z"+allPhases[i]].y));

    max = Math.max(max, magnitude);}
  
  maxStatus = max;
  xScale.domain([-max, max]); // new maximum domain value is now 200
  yScale.domain([-max, max]);
  mainGroup
    .select(".x-axis") // select your axis again
    .transition() // add a transition if you want
    .duration(1000)
    .call(xAxis);
  mainGroup
    .select(".y-axis") // select your axis again
    .transition() // add a transition if you want
    .duration(1000)
    .call(yAxis);
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
  return vectorsData;
}

// Define update functions
export function updateMainVisualization(phase) {

  vectors
    .selectAll("." + phase)
    .attr("x2", (d) => xScale(d.value.x))
    .attr("y2", (d) => yScale(d.value.y))
    .attr("x", (d) => xScale(d.value.x))
    .attr("y", (d) => yScale(d.value.y))
    .attr("cx", (d) => xScale(d.value.x))
    .attr("cy", (d) => yScale(d.value.y))
    .text(
      (d) => (d.value.x===0)?"":
        `${d.key} ${Math.sqrt(
          d.value.x * d.value.x + d.value.y * d.value.y
        ).toFixed(1)}/${(
          (Math.atan2(d.value.y, d.value.x) * 180) /
          Math.PI
        ).toFixed(0)}Â°`
    )
    .style("stroke-opacity",(d) => (d.value.x===0)?0:1);
}

export function updateInputFields(phaseDataArray) {
  phaseDataArray.forEach(function (phaseData) {
    const phase = phaseData.key;

    const realInput = inputDiv.select(`#${phase}-real`);
    const imaginaryInput = inputDiv.select(`#${phase}-imaginary`);

    realInput.property("value", phaseData.value.x.toFixed(2));
    imaginaryInput.property("value", phaseData.value.y.toFixed(2));
  });
  return vectorsData;
}

const drag = d3
  .drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);
function dragstarted(event, d) {
  d3.select(this).raise().classed("active", true);
}
function dragended(event, d) {
  var max = Number.NEGATIVE_INFINITY;
  
  var allPhases = ["A","B","C"]
  for (let i = 0; i < 3; i++) {
    var magnitude = Math.max( Math.abs(vectorsData["I"+allPhases[i]].x), Math.abs(vectorsData["I"+allPhases[i]].y),
                              Math.abs(vectorsData["V"+allPhases[i]].x), Math.abs(vectorsData["V"+allPhases[i]].y),
                              Math.abs(vectorsData["Z"+allPhases[i]].x), Math.abs(vectorsData["Z"+allPhases[i]].y));
    console.log("mag",magnitude);
    max = Math.max(max, magnitude);}
  
  maxStatus = max;
  xScale.domain([-max, max]); // new maximum domain value is now 200
  yScale.domain([-max, max]);
  mainGroup
    .select(".x-axis") // select your axis again
    .transition() // add a transition if you want
    .duration(1000)
    .call(xAxis);
  mainGroup
    .select(".y-axis") // select your axis again
    .transition() // add a transition if you want
    .duration(1000)
    .call(yAxis);
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

function dragged(event, d) {
  if ("Z" !== d.key.charAt(0)) {
    d.value.x = xScale.invert(event.x);
    d.value.y = yScale.invert(event.y);

    d3.select(this).select("line").attr("x2", event.x).attr("y2", event.y);

    d3.select(this).select("circle").attr("cx", event.x).attr("cy", event.y);

    d3.select(this)
      .select("text")
      .attr("x", event.x + 5)
      .attr("y", event.y - 5)
      .text(
        () =>
          `${d.key} ${Math.sqrt(
            d.value.x * d.value.x + d.value.y * d.value.y
          ).toFixed(1)}/${(
            (Math.atan2(d.value.y, d.value.x) * 180) /
            Math.PI
          ).toFixed(0)}Â°`
      );

    vectorsData[d.key].x = d.value.x;
    vectorsData[d.key].y = d.value.y;
    const z = C_.complexDivision(
      vectorsData["V" + d.key.charAt(1)],
      vectorsData["I" + d.key.charAt(1)]
    );

    d3.select("#Z" + d.key.charAt(1) + "-real").property("value", z.x);
    d3.select("#Z" + d.key.charAt(1) + "-imaginary").property("value", z.y);
    vectorsData["Z" + d.key.charAt(1)].x = z.x;
    vectorsData["Z" + d.key.charAt(1)].y = z.y;
  }

  updateInputFields([d]);
  updateImpedances(vectorsData, d.key);
}

var vectors = G_.GroupSVG(
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

// Calculate impedances
function calculateImpedances(data) {
  data.ZA.x = C_.complexDivision(data.VA, data.IA).x;
  data.ZA.y = C_.complexDivision(data.VA, data.IA).y;
  data.ZB.x = C_.complexDivision(data.VB, data.IB).x;
  data.ZB.y = C_.complexDivision(data.VB, data.IB).y;
  data.ZC.x = C_.complexDivision(data.VC, data.IC).x;
  data.ZC.y = C_.complexDivision(data.VC, data.IC).y;

  return data;
}

function updateImpedances(vectorsData, keyTobeUptaded) {
  const wichPhase = keyTobeUptaded.charAt(1);
 
if (["A", "B", "C"].includes(wichPhase)) {  
  const z = C_.complexDivision(
    vectorsData["V" + wichPhase],
    vectorsData["I" + wichPhase]
  );
  vectors
    .selectAll(".Z" + wichPhase)
    .attr("x", (d) => xScale(z.x))
    .attr("y", (d) => yScale(z.y))
    .attr("cx", (d) => xScale(z.x))
    .attr("cy", (d) => yScale(z.y))
    .attr("x2", (d) => xScale(z.x))
    .attr("y2", (d) => yScale(z.y))
    .text(
      (d) =>
        `${"Z" + wichPhase} ${Math.sqrt(z.x * z.x + z.y * z.y).toFixed(1)}/${(
          (Math.atan2(z.y, z.x) * 180) /
          Math.PI
        ).toFixed(0)}Â°`
    );
  calculateSequenceImpedances(vectorsData);
        }
  return vectorsData;
}

// Calculate sequence impedances
function calculateSequenceImpedances(vectorsData) {
  const a = { x: -0.5, y: 0.87 };
  const a2 = C_.complexMultiplication(a, a);

  vectorsData.Z0.x = C_.complexDivision(
    C_.complexAdd3(vectorsData.ZA, vectorsData.ZB, vectorsData.ZC),
    { x: 3, y: 0 }
  ).x;
  vectorsData.Z0.y = C_.complexDivision(
    C_.complexAdd3(vectorsData.ZA, vectorsData.ZB, vectorsData.ZC),
    { x: 3, y: 0 }
  ).y;
  vectorsData.Z1.x = C_.complexDivision(
    C_.complexAdd3(
      vectorsData.ZA,
      C_.complexMultiplication(vectorsData.ZB, a),
      C_.complexMultiplication(vectorsData.ZC, a2)
    ),
    { x: 3, y: 0 }
  ).x;
  vectorsData.Z1.y = C_.complexDivision(
    C_.complexAdd3(
      vectorsData.ZA,
      C_.complexMultiplication(vectorsData.ZB, a),
      C_.complexMultiplication(vectorsData.ZC, a2)
    ),
    { x: 3, y: 0 }
  ).y;
  vectorsData.Z2.x = C_.complexDivision(
    C_.complexAdd3(
      vectorsData.ZA,
      C_.complexMultiplication(vectorsData.ZB, a2),
      C_.complexMultiplication(vectorsData.ZC, a)
    ),
    { x: 3, y: 0 }
  ).x;
  vectorsData.Z2.y = C_.complexDivision(
    C_.complexAdd3(
      vectorsData.ZA,
      C_.complexMultiplication(vectorsData.ZB, a2),
      C_.complexMultiplication(vectorsData.ZC, a)
    ),
    { x: 3, y: 0 }
  ).y;

  d3.select("#Z0-real").property("value", vectorsData.Z0.x);
  d3.select("#Z0-imaginary").property("value", vectorsData.Z0.y);
  d3.select("#Z1-real").property("value", vectorsData.Z1.x);
  d3.select("#Z1-imaginary").property("value", vectorsData.Z1.y);
  d3.select("#Z2-real").property("value", vectorsData.Z2.x);
  d3.select("#Z2-imaginary").property("value", vectorsData.Z2.y);
  return vectorsData;
}

// Export data to CSV
function exportCSV() {
  const headers = ["Phase", "Real", "Imaginary"];
  const csvData = Object.entries(vectorsData).map(([phase, { x, y }]) => [
    phase,
    x.toFixed(2),
    y.toFixed(2),
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

    const groupMagnifierMinus = svg.append("g").attr("class","magnifiersMinus")
        .attr("transform", "translate (" + (maxSize) + ",0) scale(0.3)").style("fill","black")
        .style("pointer-events","bounding-box");

    groupMagnifierMinus.append("path")
        .attr("d", "M45.414,36.586c-0.781-0.781-2.047-0.781-2.828,0L41,38.172l-3.811-3.811C40.192,30.728,42,26.071,42,21 C42,9.42,32.579,0,21,0S0,9.42,0,21s9.421,21,21,21c5.071,0,9.728-1.808,13.361-4.811L38.172,41l-1.586,1.586 c-0.781,0.781-0.781,2.047,0,2.828l18,18C54.977,63.805,55.488,64,56,64s1.023-0.195,1.414-0.586l6-6 c0.781-0.781,0.781-2.047,0-2.828L45.414,36.586z M4,21c0-9.374,7.626-17,17-17s17,7.626,17,17s-7.626,17-17,17S4,30.374,4,21z M56,59.171L40.828,44L44,40.829L59.172,56L56,59.171z")
        .style("fill","black").attr("class","magnifiersMinus");

    groupMagnifierMinus.append("path")
        .attr("d", "M30,19H12c-1.104,0-2,0.896-2,2s0.896,2,2,2h18c1.104,0,2-0.896,2-2S31.104,19,30,19z")
        .style("fill","black").attr("class","magnifiersMinus"); 

    const groupMagnifierPlus = svg.append("g").attr("id","magnifiersPlus")
      .attr("transform", "translate (" + (maxSize+18) + ",0) scale(0.3)").style("fill","black")
      .style("pointer-events","bounding-box");

    groupMagnifierPlus.append("path")
        .attr("d", "M21,42c5.071,0,9.728-1.808,13.361-4.811L38.172,41l-1.586,1.586c-0.781,0.781-0.781,2.047,0,2.828l18,18 C54.977,63.805,55.488,64,56,64s1.023-0.195,1.414-0.586l6-6c0.781-0.781,0.781-2.047,0-2.828l-18-18 c-0.781-0.781-2.047-0.781-2.828,0L41,38.172l-3.811-3.811C40.192,30.728,42,26.071,42,21C42,9.42,32.579,0,21,0S0,9.42,0,21 S9.421,42,21,42z M59.172,56L56,59.171L40.828,44L44,40.829L59.172,56z M21,4c9.374,0,17,7.626,17,17s-7.626,17-17,17 S4,30.374,4,21S11.626,4,21,4z")
        .style("fill","black").attr("class","magnifiersPlus");

    groupMagnifierPlus.append("path")
        .attr("d", "M12,23h7v7c0,1.104,0.896,2,2,2s2-0.896,2-2v-7h7c1.104,0,2-0.896,2-2s-0.896-2-2-2h-7v-7c0-1.104-0.896-2-2-2 s-2,0.896-2,2v7h-7c-1.104,0-2,0.896-2,2S10.896,23,12,23z")
        .style("fill","black").attr("class","magnifiersPlus");  
    
    groupMagnifierMinus.on("mouseenter", function(event, d) {
      d3.select(this).selectAll("path")
          .style("fill", "grey");
    });
    
    groupMagnifierMinus.on("mouseleave", function(event, d) {
      d3.select(this).selectAll("path")
          .style("fill", "black"); 
    });    
    
    groupMagnifierPlus.on("mouseenter", function(event, d) {
      d3.select(this).selectAll("path")
          .style("fill", "grey");
    });
    
    groupMagnifierPlus.on("mouseleave", function(event, d) {
      d3.select(this).selectAll("path")
          .style("fill", "black"); 
    });    

    var rotationConvention = svg.append("g")

    // Create a symbol generator for a plus sign (cross)
    var symbolGenerator = d3.symbol()
    .type(d3.symbolCross) // Set the symbol type to cross
    .size(150); // Set the size of the symbol

    rotationConvention.append("path")
    .attr("d", symbolGenerator())
    .attr("transform", "translate(" + 28 + "," + 33.5 + ")")
    .attr("stroke", "grey")
    .style("fill","grey"); 

    rotationConvention.append("path")
    .attr("d", "M 28.8555 26.1836 C 29.9102 26.1836 30.7070 25.3867 30.7070 24.3086 C 30.7070 23.8164 30.5195 23.3477 30.1680 22.9726 L 23.1602 16.0117 C 24.5664 15.7070 26.2070 15.5664 27.9883 15.5664 C 37.3867 15.5664 44.9336 23.0898 44.9336 32.4883 C 44.9336 41.9101 37.3867 49.4570 27.9883 49.4570 C 18.5899 49.4570 11.0664 41.9101 11.0664 32.4883 C 11.0664 31.3633 10.3399 30.5430 9.2383 30.5430 C 8.0899 30.5430 7.2930 31.3633 7.2930 32.4883 C 7.2930 43.9961 16.5039 53.2305 27.9883 53.2305 C 39.4726 53.2305 48.7070 43.9961 48.7070 32.4883 C 48.7070 21.0039 39.4726 11.7930 27.9883 11.7930 C 26.6289 11.7930 25.2695 11.9336 23.9336 12.1679 L 30.1914 6.0274 C 30.5195 5.6523 30.7070 5.1836 30.7070 4.6914 C 30.7070 3.6133 29.9102 2.7695 28.8555 2.7695 C 28.2930 2.7695 27.8242 2.9570 27.4961 3.3320 L 17.8399 13.1289 C 17.4648 13.5039 17.2539 14.0195 17.2539 14.5352 C 17.2539 15.0742 17.4180 15.5430 17.8399 15.9414 L 27.4961 25.6445 C 27.8242 25.9961 28.2695 26.1836 28.8555 26.1836 Z")
    .attr("stroke", "grey")
    .style("fill","grey"); 

		rotationConvention
			.attr("transform", "translate(" + (2*maxSize/3+19) + ",10) scale(0.4)");

    function Zoom(event,d) {
      
      toDelete = event;


      var max = maxStatus;
      
      for (var key in vectorsData) {
        if (key.includes("A","B","C")){
        var vector = vectorsData[key];
        if (event.srcElement.classList[0]==="magnifiersPlus") [
          max = max/1.2
        ]        
        
        if (event.srcElement.classList[0]==="magnifiersMinus") [
          max = max*1.2
        ]  
        
      }}
      maxStatus = max
      xScale.domain([-max, max]); // new maximum domain value is now 200
      yScale.domain([-max, max]);
      mainGroup
        .select(".x-axis") // select your axis again
        .transition() // add a transition if you want
        .duration(1000)
        .call(xAxis);
      mainGroup
        .select(".y-axis") // select your axis again
        .transition() // add a transition if you want
        .duration(1000)
        .call(yAxis);
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
    groupMagnifierPlus.on("click", function(event, d) {
     Zoom(event);
    });
    groupMagnifierMinus.on("click", function(event, d) {
     Zoom(event);
    });
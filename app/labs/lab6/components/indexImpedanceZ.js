import * as C_ from "../utils/ComplexOperatorAid.mjs";
import * as M_ from "../utils/AddMarkersZ.mjs";
import * as G_ from "../utils/MainSVGZ.mjs";
import * as I_ from "../utils/InputsZ.mjs";
import * as aP_ from "../utils/quantity.mjs";

M_.Vmarker(svg, Object.keys(colors), arrowSize, colors);


const { updateQuantity: updatePowerSC } = aP_.quantity(
  vectorsData,
  svg_apparentPower,
  colors,
  ["SA", "SB", "SC","S0", "S1", "S2"],
  "Apparent Power SA SB SC S0 S1 S2"
);

const { updateQuantity: updatePowerYC } = aP_.quantity(
  vectorsData,
  svg_admittance,
  colors,
  ["YA", "YB", "YC"],
  "Admittance YA YB YC"
);

const { updateQuantity: updatePowerSI } = aP_.quantity(
  vectorsData,
  svg_SequenceImpedance,
  colors,
  ["Z0", "Z1", "Z2", "ZA", "ZB", "ZC"],
  "Z0 Z1 Z2 ZA ZB ZC"
);

const { updateQuantity: updatePowerSCV } = aP_.quantity(
  vectorsData,
  svg_SequenceCurrentAndVoltage ,
  colors,
  ["V0", "V1", "V2","I0", "I1", "I2"],
  "V0 V1 V2 I0 I1 I2"
);

const { updateQuantity: updatePowerPPV } = aP_.quantity(
  vectorsData,
  svg_PhasePhaseVoltage ,
  colors,
  ["VAB", "VBC", "VCA"],
  "Phase-Phase Voltage"
);

const { updateQuantity: updatePowerPPI } = aP_.quantity(
  vectorsData,
  svg_PhasePhaseCurrent ,
  colors,
  ["IAB", "IBC", "ICA"],
  "Phase-Phase Current"
);

const { updateQuantity: updatePowerPPZ } = aP_.quantity(
  vectorsData,
  svg_PhasePhaseImpedance ,
  colors,
  ["ZAB", "ZBC", "ZCA"],
  "Phase-Phase Impedance"
);


const { updateQuantity: updatePowerZaids } = aP_.quantity(
  vectorsData,
  svg_Zaids ,
  colors,
  ["ZsymetricalTotal", "Zn"],
  "ZT = Z1+Z2+Z0, Zn"
);

updatePowerSC();
updatePowerYC();
updatePowerSI();
updatePowerSCV();
updatePowerPPV();
updatePowerPPI();
updatePowerPPZ();
updatePowerZaids();

const impedanceData = calculateImpedances(vectorsData);

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
d3.selectAll(".Z").attr("readonly", true).style("pointer-events", "none");

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

var inputDivPolar = I_.InputsPolar(
  "#input-fields",
  "polarTable",
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
function onInputChanged(event, d) {


  let inputType;
  const phase = d.key;
  if (event.target.id.includes("-")){ inputType = event.target.id.split("-")[1];} else {inputType = event.target.id;}; 
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
  
  if (inputType === 'angle'){    
  const Mag = d.value.magnitude; 
  const newAngDeg = newValue;
  const rad = newAngDeg * Math.PI / 180;  
  vectorsData[d.key].x = Mag * Math.cos(rad);
  vectorsData[d.key].y = Mag * Math.sin(rad);
  vectorsData[d.key].magnitude = Mag;
  vectorsData[d.key].angle = newAngDeg;
  }

  if (inputType === 'amplitude'){
    const newMag = newValue;
    const AngDeg = d.value.angle;
    const rad = AngDeg * Math.PI / 180;
    vectorsData[d.key].x = newMag * Math.cos(rad);
    vectorsData[d.key].y = newMag * Math.sin(rad);
    vectorsData[d.key].magnitude = newMag;
    vectorsData[d.key].angle = AngDeg;
    }

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
function updateMainVisualization(phase) {

  vectors
    .selectAll("." + phase)
    .attr("x2", (d) => xScale(d.value.x))
    .attr("y2", (d) => yScale(d.value.y))
    .attr("x", (d) => xScale(d.value.x))
    .attr("y", (d) => yScale(d.value.y))
    .attr("cx", (d) => xScale(d.value.x))
    .attr("cy", (d) => yScale(d.value.y))
    .text(
      (d) =>
        `${d.key} ${Math.sqrt(
          d.value.x * d.value.x + d.value.y * d.value.y
        ).toFixed(1)}/${(
          (Math.atan2(d.value.y, d.value.x) * 180) /
          Math.PI
        ).toFixed(0)}°`
    );

    updatePowerSC();
    updatePowerYC();
    updatePowerSI();
    updatePowerSCV();
    updatePowerPPV();
    updatePowerPPI();
    updatePowerPPZ();
    updatePowerZaids();
}

function updateInputFields(phaseDataArray) {

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
    const newX = xScale.invert(event.x);
    const newY = yScale.invert(event.y);

    d.value.x = newX;
    d.value.y = newY;
    vectorsData[d.key].x = newX;
    vectorsData[d.key].y = newY;

    // *** also update magnitude & angle for polar
    const mag = Math.sqrt(newX*newX + newY*newY);
    const ang = (Math.atan2(newY, newX) * 180) / Math.PI;
    d.value.magnitude = mag;
    d.value.angle = ang;
    vectorsData[d.key].magnitude = mag;
    vectorsData[d.key].angle = ang;

    d3.selectAll(".input-field").each(function(d) {
      d3.select(`#${d.key}-real`).property("value", d.value.x.toFixed(2));
      d3.select(`#${d.key}-imaginary`).property("value", d.value.y.toFixed(2));
    });
    d3.selectAll(".input-fieldPolar").each(function(d) {
      d3.select(`#${d.key}-amplitude`).property("value", d.value.magnitude.toFixed(2));
      d3.select(`#${d.key}-angle`).property("value", d.value.angle.toFixed(2));
    });
    

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
          ).toFixed(0)}°`
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
  updatePowerSC();
  updatePowerYC();
  updatePowerSI();
  updatePowerSCV();
  updatePowerPPV();
  updatePowerPPI();
  updatePowerPPZ();
  updatePowerZaids();
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
        ).toFixed(0)}°`
    );
  calculateSequenceImpedances(vectorsData);

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
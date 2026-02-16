
function createDiagram(svgSingleDiagram) {
  const appendLine = (x1, y1, x2, y2, id) => {
    svgSingleDiagram_g
      .append("line")
      .style("stroke", "black")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("id", id + "line");
  };

  const appendRectangle = (x, y, width, height,dx,dy, id,text) => {
    svgSingleDiagram_g.append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 0.2)  
    .attr("ry", 0.2)  
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("id", id + "rect")
  };

  const appendCircle = (cx, cy, r) => {
    svgSingleDiagram_g
      .append("circle")
      .style("stroke", "black")
      .style("fill", "none")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r);
  };

  const appendText = (x, y, dx, dy, text, id, balanced) => {
    svgSingleDiagram_g
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("dx", dx)
      .attr("dy", dy)
      .style("font-size", "1rem")
      .text(text)
      .attr("id", id + "text")
      .attr("class",balanced ? "Balanced":"Unbalanced");
  };

  svgSingleDiagram
    .append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("dx", 20)
    .attr("dy", -10)
    .style("font-size", "1rem")
    .text("Network Characteristics: V = " + Voltage.toFixed(1) + " kV, S base = " + Sb.toFixed(1) + " MVA, Z base = " + Z_b.toFixed(2) + " Î©"+ ", fault at " +distanceToFault.toFixed(1) + "% of Line L ("+ lineLength.toFixed(2) + " miles)")
    .attr("id", "Basetext");  

  svgSingleDiagram.attr("viewBox", "0 0 "+ document.getElementById("svgSingleDiagram_id").clientWidth*1.09+ " " + document.getElementById("svgSingleDiagram_id").clientHeight*1.09);
  svgSingleDiagram.attr("preserveAspectRatio", "xMidYMid meet");


// // Assuming you have a group element (g) containing all your SVG content
// var bbox = svgSingleDiagram_g.node().getBBox();
// console.log("svgSingleDiagram_g",svgSingleDiagram_g.node());
// // Set the viewBox using the bounding box dimensions
// svgSingleDiagram.attr("viewBox", bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);

  appendLine(
    Generator_S_Position_x,
    Line_S_U_Position,
    Generator_S_Position_x,
    Generator_S_Position_y - Generator_Radius
  );
  appendCircle(
    Generator_S_Position_x,
    Generator_S_Position_y,
    Generator_Radius
  );
  appendLine(
    Generator_S_Position_x,
    Generator_S_Position_y + Generator_Radius,
    Generator_S_Position_x,
    Ground_Position
  );
  appendLine(
    Generator_S_Position_x,
    Line_S_U_Position,
    LeftBusPosition,
    Line_S_U_Position
  );
  appendText(
    Generator_S_Position_x + Line_S_Length/2,
    Line_S_U_Position,
    -Line_S_Length/3,
    - textOffset,
    "ZS1 = "+Z_S1.x+" + j "+Z_S1.y,
    "ZS1",
    true
  )
  appendText(
    Generator_S_Position_x + Line_S_Length/2,
    Line_S_U_Position,
    -Line_S_Length/3,
    - textOffset + textOffsetRelative,
    "ZS2 = "+Z_S2.x+" + j "+Z_S2.y,
    "ZS2",
    false
  )
  appendText(
    Generator_S_Position_x + Line_S_Length/2,
    Line_S_U_Position,
    -Line_S_Length/3,
    - textOffset - textOffsetRelative,
    "ZS0 = "+Z_S0.x+" + j "+Z_S0.y,
    "ZS0",
    false
  )
  appendLine(
    LeftBusPosition,
    Line_S_U_Position,
    LeftBusPosition,
    Line_L_Position
  );
  appendLine(
    LeftBusPosition,
    Line_L_Position,
    RightBusPosition,
    Line_L_Position,
    "faultedLine"
  );
  appendText(
    LeftBusPosition + Line_E_Length/2,
    Line_L_Position,
    -Line_E_Length/4,
    - textOffset,
    "Z1l = "+Z_L1.x.toFixed(3)+" + j "+Z_L1.y.toFixed(3),
    "Z1l",
    true
  );
  appendLine(
    RightBusPosition,
    Line_E_Position,
    RightBusPosition,
    Line_S_U_Position
  );
  appendLine(
    LeftBusPosition,
    Line_S_U_Position,
    LeftBusPosition,
    Line_L_Position
  );
  appendLine(
    LeftBusPosition,
    Line_E_Position,
    RightBusPosition,
    Line_E_Position,
    "What"
  );
  appendText(
    LeftBusPosition + Line_E_Length/2,
    Line_E_Position,
    -Line_E_Length/4,
    - textOffset,
    "ZE1 = "+Z_E1.x+" + j "+Z_E1.y,
    "ZE1",
    true
  );
  appendText(
    LeftBusPosition + Line_E_Length/2,
    Line_E_Position,
    -Line_E_Length/4,
    - textOffset + textOffsetRelative,
    "ZE2 = "+Z_E2.x+" + j "+Z_E2.y,
    "ZE2",
    false
  );
  appendText(
    LeftBusPosition + Line_E_Length/2,
    Line_E_Position,
    -Line_E_Length/4,
    - textOffset - textOffsetRelative,
    "ZE0 = "+Z_E0.x+" + j "+Z_E0.y,
    "ZE0",
    false
  );
  appendLine(
    RightBusPosition,
    Line_L_Position,
    RightBusPosition,
    Line_S_U_Position
  );
  appendLine(
    RightBusPosition,
    Line_S_U_Position,
    Generator_U_Position,
    Line_S_U_Position
  );
  appendText(
    RightBusPosition + Line_U_Length/2,
    Line_S_U_Position,
    -Line_U_Length/4,
    - textOffset,
    "ZU1 = "+Z_U1.x+" + j "+Z_U1.y,
    "ZU1",
    true
  );
  appendText(
    RightBusPosition + Line_U_Length/2,
    Line_S_U_Position,
    -Line_U_Length/4,
    - textOffset + textOffsetRelative,
    "ZU2 = "+Z_U2.x+" + j "+Z_U2.y,
    "ZU2",
    false
  );
  appendText(
    RightBusPosition + Line_U_Length/2,
    Line_S_U_Position,
    -Line_U_Length/4,
    - textOffset - textOffsetRelative,
    "ZU0 = "+Z_U0.x+" + j "+Z_U0.y,
    "ZU0",
    false
  );
  appendLine(
    Generator_U_Position,
    Line_S_U_Position,
    Generator_U_Position,
    Generator_S_Position_y - Generator_Radius
  );
  appendCircle(
    Generator_U_Position,
    Generator_S_Position_y, 
    Generator_Radius);
  appendLine(
    Generator_U_Position,
    Generator_S_Position_y + Generator_Radius,
    Generator_U_Position,
    Ground_Position
  );

  //busbar at R
  appendLine(
    LeftBusPosition,
    Line_E_Position - 5,
    LeftBusPosition,
    Line_L_Position + 5
  );

  // E tspan at Generator S
  appendText(
    Generator_S_Position_x,
    Generator_S_Position_y,
    Generator_Radius + 5,
    7.5,
    "Es = "+E_F.x+" + j "+E_F.y,
    "Es",
    true
  );

  //busbar at Q
  appendLine(
    RightBusPosition,
    Line_E_Position - 5,
    RightBusPosition,
    Line_L_Position + 5
  );
  // E tspan at Generator U
  appendText(
    Generator_U_Position,
    Generator_S_Position_y,
    Generator_Radius + 5,
    7.5,
    "Eu = "+E_F.x+" + j "+E_F.y,
    "Eu",
    true
  );
  appendLine(
    Generator_S_Position_x,
    Ground_Position,
    Generator_U_Position,
    Ground_Position
  );  


var linesLength = 10; // Length of each line

// Define the limits
var xMin = Generator_S_Position_x+linesLength/4, xMax = Generator_U_Position-linesLength/2;
var yMin = Ground_Position+linesLength/2, yMax = Ground_Position+linesLength/2; // Keeping the y-values the same for horizontal alignment

// Define the number of lines and the space between them
var numberOfLines = 50;
var spaceBetweenLines = (xMax - xMin) / (numberOfLines - 1);

// Function to generate a single line at a given x position
function generateLine(x) {
  var y1 = yMin - (linesLength / 2);
  var y2 = yMax + (linesLength / 2);
  svgSingleDiagram_g.append("line")
    .attr("x1", x)
    .attr("y1", y1)
    .attr("x2", x)
    .attr("y2", y2)
    .attr("transform", "rotate(45," + x + "," + yMin + ")") // 45Â° rotation
    .attr("stroke", "grey")
    .attr("stroke-width", 2);
}

// Generate the lines
for (var i = 0; i < numberOfLines; i++) {
  var xPosition = xMin + (spaceBetweenLines * i);
  generateLine(xPosition);
}


var customSymbolS = {
  draw: function (context, size) {
    let s = size;
    context.moveTo(1.5 * s, 0);
    context.arcTo(2 * s, 0, 2 * s, -1 * s, s / 2);
    context.lineTo(2 * s, -4 * s);
    context.arcTo(2 * s, -5 * s, 2.5 * s, -5 * s, s / 2);
    context.arcTo(2 * s, -5 * s, 2 * s, -4 * s, s / 2);
    context.lineTo(2 * s, -1 * s);
    context.arcTo(2 * s, 0, 1.5 * s, 0, s / 2);

    context.moveTo(1.5 * s, 0);
    context.arcTo(2 * s, 0, 2 * s, 1 * s, s / 2);
    context.lineTo(2 * s, 4 * s);
    context.arcTo(2 * s, 5 * s, 2.5 * s, 5 * s, s / 2);
    context.arcTo(2 * s, 5 * s, 2 * s, 4 * s, s / 2);
    context.lineTo(2 * s, 1 * s);
    context.arcTo(2 * s, 0, 1.5 * s, 0, s / 2);
  },
};

const r1 =3;
var arc1=d3.arc()
.innerRadius(r1)
.outerRadius(r1-1)
.startAngle(-Math.PI/2)
.endAngle(Math.PI/2);
var arc2=d3.arc()
.innerRadius(r1)
.outerRadius(r1-1)
.startAngle(Math.PI/2)
.endAngle(-Math.PI/2);
var arc3=d3.arc()
.innerRadius(r1*1.5)
.outerRadius(r1*1.5-1)
.startAngle(-Math.PI/2)
.endAngle(Math.PI/2);

//--- Add CT to diagram------------
svgSingleDiagram_g.append("path")
  .attr("d",arc3)
  .attr(
        "transform",
        "translate(" + (LeftBusPosition+3*r1) + "," + Line_L_Position + ")"
      )
  .attr("stroke", "grey")
  .attr("stroke-width", "0.5");
svgSingleDiagram_g.append("path")
  .attr("d",arc3)
  .attr(
        "transform",
        "translate(" + (LeftBusPosition+6*r1) + "," + Line_L_Position + ")"
      )
  .attr("stroke", "grey")
  .attr("stroke-width", "0.5");

appendLine(
  LeftBusPosition+2*r1-1,
  Line_L_Position,
  LeftBusPosition+2*r1-1,
  Line_L_Position+3*r1
);

appendRectangle(
  LeftBusPosition+r1-1,
  Line_L_Position+3*r1,
  4.2*r1,
  4.2*r1,
  "Relay_at_R"
)

appendLine(
  LeftBusPosition+r1-1+4.2*r1,
  Line_L_Position+3*r1+2.1*r1,
  LeftBusPosition+r1-1+4.2*r1+3*r1,
  Line_L_Position+3*r1+2.1*r1
);

let arrow = d3.symbol().type(d3.symbolTriangle).size(10)
svgSingleDiagram_g.append("path")
  .attr("d",arrow)
  .style("fill","grey")
  .style("stroke","grey")
  .attr("transform","translate("+ (LeftBusPosition+r1-1+4.2*r1+3*r1) + "," + (Line_L_Position+3*r1+2.1*r1) +") rotate(90)");

appendText(
  LeftBusPosition+2*r1-1,
  Line_L_Position+3*r1,
  0,
  3.2*r1+1,
  "R",
  "Relay_at_R_Text",
  "Balanced"      
)

//--------------------

  svgSingleDiagram_g.append("path")
  .attr("d",arc1)
  .attr(
        "transform",
        "translate(" + (Generator_S_Position_x - Generator_Radius/4+r1/4) + "," + (Generator_S_Position_y - Generator_Radius/4+r1/2) + ")"
      )
  .attr("stroke", "grey")
  .attr("stroke-width", "0.5");
svgSingleDiagram_g.append("path")
  .attr("d",arc2)
  .attr(
        "transform",
        "translate(" + (Generator_S_Position_x - Generator_Radius/4+r1/4+2*r1) + "," + (Generator_S_Position_y - Generator_Radius/4+r1/2) + ") rotate(180)"
      )
  .attr("stroke", "grey")
  .attr("stroke-width", "0.5");

  svgSingleDiagram_g.append("path")
    .attr("d",arc1)
    .attr(
          "transform",
          "translate(" + (Generator_U_Position - Generator_Radius/4+r1/4) + "," + (Generator_S_Position_y - Generator_Radius/4+r1/2) + ")"
        )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5")
  svgSingleDiagram_g.append("path")
    .attr("d",arc2)
    .attr(
          "transform",
          "translate(" + (Generator_U_Position - Generator_Radius/4+r1/4+2*r1) + "," + (Generator_S_Position_y - Generator_Radius/4+r1/2) + ") rotate(180)"
        )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");

var customS = d3.symbol().type(customSymbolS).size(3.5);
svgSingleDiagram_g
  .append("path")
  .attr("d", customS)
  .attr(
    "transform",
    "translate(" + (Generator_S_Position_x + Line_S_Length/2 -Line_S_Length/2.45) + "," + (Line_S_U_Position - 1.3*textOffset) + ")"
  )
  .attr("stroke", "black")
  .attr("stroke-width", "0.5");

var customU = d3.symbol().type(customSymbolS).size(3.5);
svgSingleDiagram_g
  .append("path")
  .attr("d", customU)
  .attr(
    "transform",
    "translate(" + (RightBusPosition + Line_U_Length/2 -Line_U_Length/2.45) + "," + (Line_S_U_Position - 1.3*textOffset) + ")"
  )
  .attr("stroke", "black")
  .attr("stroke-width", "0.5");
  

  var customE = d3.symbol().type(customSymbolS).size(3.5);
  svgSingleDiagram_g
    .append("path")
    .attr("d", customE)
    .attr(
      "transform",
      "translate(" + (LeftBusPosition + Line_E_Length/2 -Line_E_Length/3) + "," + (Line_E_Position - 1.3*textOffset) + ")"
    )
    .attr("stroke", "black")
    .attr("stroke-width", "0.5");
    
var customL = d3.symbol().type(customSymbolS).size(3.5);
svgSingleDiagram_g
  .append("path")
  .attr("d", customL)
  .attr(
    "transform",
    "translate(" + (LeftBusPosition + Line_E_Length/2 -Line_E_Length/3) + "," + (Line_S_U_Position + textOffset/1.2) + ")"
  )
  .attr("stroke", "black")
  .attr("stroke-width", "0.5");
      

}
// call the function
createDiagram(svgSingleDiagram);



import * as d3 from "d3";
import { Complex } from "./types";

// Single Line Diagram positions interface
export interface SingleLinePositions {
  Generator_S_Position_x: number;
  LeftBusPosition: number;
  RightBusPosition: number;
  Generator_U_Position: number;
  Line_S_U_Position: number;
  Line_L_Position: number;
  Generator_S_Position_y: number;
  Ground_Position: number;
  Line_E_Position: number;
  Line_E_Length: number;
  Line_S_Length: number;
  Line_U_Length: number;
  Generator_Radius: number;
  textOffset: number;
  textOffsetRelative: number;
}

// Create the single line diagram
export function createSingleLineDiagram(
  svgSingleDiagram_g: d3.Selection<SVGGElement, unknown, null, undefined>,
  positions: SingleLinePositions,
  impedances: {
    Z_S1: Complex;
    Z_S2: Complex;
    Z_S0: Complex;
    Z_E1: Complex;
    Z_E2: Complex;
    Z_E0: Complex;
    Z_U1: Complex;
    Z_U2: Complex;
    Z_U0: Complex;
    Z_L1: Complex;
    E_F: Complex;
  },
  params: {
    Voltage: number;
    Sb: number;
    distanceToFault: number;
    lineLength: number;
    Z_b: number;
  },
) {
  const {
    Generator_S_Position_x,
    LeftBusPosition,
    RightBusPosition,
    Generator_U_Position,
    Line_S_U_Position,
    Line_L_Position,
    Generator_S_Position_y,
    Ground_Position,
    Line_E_Position,
    Line_E_Length,
    Line_S_Length,
    Line_U_Length,
    Generator_Radius,
    textOffset,
    textOffsetRelative,
  } = positions;

  const { Z_S1, Z_S2, Z_S0, Z_E1, Z_E2, Z_E0, Z_U1, Z_U2, Z_U0, Z_L1, E_F } =
    impedances;

  const { Voltage, Sb, distanceToFault, lineLength, Z_b } = params;

  // Helper functions
  const appendLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    id?: string,
  ) => {
    svgSingleDiagram_g
      .append("line")
      .style("stroke", "black")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("id", id ? id + "line" : "");
  };

  const appendRectangle = (
    x: number,
    y: number,
    width: number,
    height: number,
    id: string,
  ) => {
    svgSingleDiagram_g
      .append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .attr("rx", 0.2)
      .attr("ry", 0.2)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("id", id + "rect");
  };

  const appendCircle = (cx: number, cy: number, r: number) => {
    svgSingleDiagram_g
      .append("circle")
      .style("stroke", "black")
      .style("fill", "none")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r);
  };

  const appendText = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    text: string,
    id: string,
    balanced: boolean,
  ) => {
    svgSingleDiagram_g
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("dx", dx)
      .attr("dy", dy)
      .style("font-size", "1rem")
      .text(text)
      .attr("id", id + "text")
      .attr("class", balanced ? "Balanced" : "Unbalanced");
  };

  // Add base text
  svgSingleDiagram_g
    .append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("dx", 20)
    .attr("dy", -10)
    .style("font-size", "1rem")
    .text(
      `Network Characteristics: V = ${Voltage.toFixed(1)} kV, S base = ${Sb.toFixed(1)} MVA, Z base = ${Z_b.toFixed(2)} Ω, fault at ${distanceToFault.toFixed(1)}% of Line L (${lineLength.toFixed(2)} miles)`,
    )
    .attr("id", "Basetext");

  // Draw generator S
  appendLine(
    Generator_S_Position_x,
    Line_S_U_Position,
    Generator_S_Position_x,
    Generator_S_Position_y - Generator_Radius,
  );
  appendCircle(
    Generator_S_Position_x,
    Generator_S_Position_y,
    Generator_Radius,
  );
  appendLine(
    Generator_S_Position_x,
    Generator_S_Position_y + Generator_Radius,
    Generator_S_Position_x,
    Ground_Position,
  );
  appendLine(
    Generator_S_Position_x,
    Line_S_U_Position,
    LeftBusPosition,
    Line_S_U_Position,
  );

  // ZS labels
  appendRectangle(
    Generator_S_Position_x + Line_S_Length / 2 - Line_S_Length / 3 - 5,
    Line_S_U_Position - textOffset - textOffsetRelative * 2.5,
    130,
    50,
    "ZSBox",
  );
  appendText(
    Generator_S_Position_x + Line_S_Length / 2,
    Line_S_U_Position,
    -Line_S_Length / 3,
    -textOffset,
    `ZS1 = ${Z_S1.x.toFixed(3)} + j ${Z_S1.y.toFixed(3)}`,
    "ZS1",
    true,
  );
  appendText(
    Generator_S_Position_x + Line_S_Length / 2,
    Line_S_U_Position,
    -Line_S_Length / 3,
    -textOffset + textOffsetRelative,
    `ZS2 = ${Z_S2.x.toFixed(3)} + j ${Z_S2.y.toFixed(3)}`,
    "ZS2",
    false,
  );
  appendText(
    Generator_S_Position_x + Line_S_Length / 2,
    Line_S_U_Position,
    -Line_S_Length / 3,
    -textOffset - textOffsetRelative,
    `ZS0 = ${Z_S0.x.toFixed(3)} + j ${Z_S0.y.toFixed(3)}`,
    "ZS0",
    false,
  );

  // Bus and lines
  appendLine(
    LeftBusPosition,
    Line_S_U_Position,
    LeftBusPosition,
    Line_L_Position,
  );
  appendLine(
    LeftBusPosition,
    Line_L_Position,
    RightBusPosition,
    Line_L_Position,
    "faultedLine",
  );

  appendRectangle(
    LeftBusPosition + Line_E_Length / 2 - Line_E_Length / 4 - 5,
    Line_L_Position - textOffset - 15,
    140,
    25,
    "Z1lBox",
  );

  appendText(
    LeftBusPosition + Line_E_Length / 2,
    Line_L_Position,
    -Line_E_Length / 4,
    -textOffset,
    `Z1l = ${Z_L1.x.toFixed(3)} + j ${Z_L1.y.toFixed(3)}`,
    "Z1l",
    true,
  );
  appendLine(
    RightBusPosition,
    Line_E_Position,
    RightBusPosition,
    Line_S_U_Position,
  );
  appendLine(
    LeftBusPosition,
    Line_S_U_Position,
    LeftBusPosition,
    Line_L_Position,
  );
  appendLine(
    LeftBusPosition,
    Line_E_Position,
    RightBusPosition,
    Line_E_Position,
    "What",
  );

  // ZE labels
  appendRectangle(
    LeftBusPosition + Line_E_Length / 2 - Line_E_Length / 4 - 5,
    Line_E_Position - textOffset - textOffsetRelative * 2.5,
    130,
    50,
    "ZEBox",
  );
  appendText(
    LeftBusPosition + Line_E_Length / 2,
    Line_E_Position,
    -Line_E_Length / 4,
    -textOffset,
    `ZE1 = ${Z_E1.x.toFixed(3)} + j ${Z_E1.y.toFixed(3)}`,
    "ZE1",
    true,
  );
  appendText(
    LeftBusPosition + Line_E_Length / 2,
    Line_E_Position,
    -Line_E_Length / 4,
    -textOffset + textOffsetRelative,
    `ZE2 = ${Z_E2.x.toFixed(3)} + j ${Z_E2.y.toFixed(3)}`,
    "ZE2",
    false,
  );
  appendText(
    LeftBusPosition + Line_E_Length / 2,
    Line_E_Position,
    -Line_E_Length / 4,
    -textOffset - textOffsetRelative,
    `ZE0 = ${Z_E0.x.toFixed(3)} + j ${Z_E0.y.toFixed(3)}`,
    "ZE0",
    false,
  );

  // Right side
  appendLine(
    RightBusPosition,
    Line_L_Position,
    RightBusPosition,
    Line_S_U_Position,
  );
  appendLine(
    RightBusPosition,
    Line_S_U_Position,
    Generator_U_Position,
    Line_S_U_Position,
  );

  // ZU labels
  appendRectangle(
    RightBusPosition + Line_U_Length / 2 - Line_U_Length / 4 - 5,
    Line_S_U_Position - textOffset - textOffsetRelative * 2.5,
    130,
    50,
    "ZUBox",
  );
  appendText(
    RightBusPosition + Line_U_Length / 2,
    Line_S_U_Position,
    -Line_U_Length / 4,
    -textOffset,
    `ZU1 = ${Z_U1.x.toFixed(3)} + j ${Z_U1.y.toFixed(3)}`,
    "ZU1",
    true,
  );
  appendText(
    RightBusPosition + Line_U_Length / 2,
    Line_S_U_Position,
    -Line_U_Length / 4,
    -textOffset + textOffsetRelative,
    `ZU2 = ${Z_U2.x.toFixed(3)} + j ${Z_U2.y.toFixed(3)}`,
    "ZU2",
    false,
  );
  appendText(
    RightBusPosition + Line_U_Length / 2,
    Line_S_U_Position,
    -Line_U_Length / 4,
    -textOffset - textOffsetRelative,
    `ZU0 = ${Z_U0.x.toFixed(3)} + j ${Z_U0.y.toFixed(3)}`,
    "ZU0",
    false,
  );

  // Generator U
  appendLine(
    Generator_U_Position,
    Line_S_U_Position,
    Generator_U_Position,
    Generator_S_Position_y - Generator_Radius,
  );
  appendCircle(Generator_U_Position, Generator_S_Position_y, Generator_Radius);
  appendLine(
    Generator_U_Position,
    Generator_S_Position_y + Generator_Radius,
    Generator_U_Position,
    Ground_Position,
  );

  // Bus bars
  appendLine(
    LeftBusPosition,
    Line_E_Position - 5,
    LeftBusPosition,
    Line_L_Position + 5,
  );
  appendLine(
    RightBusPosition,
    Line_E_Position - 5,
    RightBusPosition,
    Line_L_Position + 5,
  );

  // Es and Eu labels
  appendText(
    Generator_S_Position_x,
    Generator_S_Position_y,
    Generator_Radius + 5,
    7.5,
    `Es = ${E_F.x.toFixed(1)} + j ${E_F.y.toFixed(1)}`,
    "Es",
    true,
  );
  appendText(
    Generator_U_Position,
    Generator_S_Position_y,
    Generator_Radius + 5,
    7.5,
    `Eu = ${E_F.x.toFixed(1)} + j ${E_F.y.toFixed(1)}`,
    "Eu",
    true,
  );
  appendLine(
    Generator_S_Position_x,
    Ground_Position,
    Generator_U_Position,
    Ground_Position,
  );

  // Ground lines
  const linesLength = 10;
  const xMin = Generator_S_Position_x + linesLength / 4;
  const xMax = Generator_U_Position - linesLength / 2;
  const yMin = Ground_Position + linesLength / 2;
  const yMax = Ground_Position + linesLength / 2;
  const numberOfLines = 50;
  const spaceBetweenLines = (xMax - xMin) / (numberOfLines - 1);

  for (let i = 0; i < numberOfLines; i++) {
    const xPosition = xMin + spaceBetweenLines * i;
    const y1 = yMin - linesLength / 2;
    const y2 = yMax + linesLength / 2;
    svgSingleDiagram_g
      .append("line")
      .attr("x1", xPosition)
      .attr("y1", y1)
      .attr("x2", xPosition)
      .attr("y2", y2)
      .attr("transform", `rotate(45,${xPosition},${yMin})`)
      .attr("stroke", "grey")
      .attr("stroke-width", 2);
  }

  // Custom symbols for generators
  const customSymbolS = {
    draw: function (context: CanvasRenderingContext2D, size: number) {
      const s = size;
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

  const r1 = 3;
  const arc1 = d3
    .arc()
    .innerRadius(r1)
    .outerRadius(r1 - 1)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);
  const arc2 = d3
    .arc()
    .innerRadius(r1)
    .outerRadius(r1 - 1)
    .startAngle(Math.PI / 2)
    .endAngle(-Math.PI / 2);
  const arc3 = d3
    .arc()
    .innerRadius(r1 * 1.5)
    .outerRadius(r1 * 1.5 - 1)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  // Add CT to diagram
  svgSingleDiagram_g
    .append("path")
    .attr("d", arc3 as any)
    .attr(
      "transform",
      `translate(${LeftBusPosition + 3 * r1},${Line_L_Position})`,
    )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");
  svgSingleDiagram_g
    .append("path")
    .attr("d", arc3 as any)
    .attr(
      "transform",
      `translate(${LeftBusPosition + 6 * r1},${Line_L_Position})`,
    )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");

  appendLine(
    LeftBusPosition + 2 * r1 - 1,
    Line_L_Position,
    LeftBusPosition + 2 * r1 - 1,
    Line_L_Position + 3 * r1,
  );

  appendRectangle(
    LeftBusPosition + r1 - 1,
    Line_L_Position + 3 * r1,
    4.2 * r1,
    4.2 * r1,
    "Relay_at_R",
  );

  appendLine(
    LeftBusPosition + r1 - 1 + 4.2 * r1,
    Line_L_Position + 3 * r1 + 2.1 * r1,
    LeftBusPosition + r1 - 1 + 4.2 * r1 + 3 * r1,
    Line_L_Position + 3 * r1 + 2.1 * r1,
  );

  const arrow = d3.symbol().type(d3.symbolTriangle).size(10);
  svgSingleDiagram_g
    .append("path")
    .attr("d", arrow as any)
    .style("fill", "grey")
    .style("stroke", "grey")
    .attr(
      "transform",
      `translate(${LeftBusPosition + r1 - 1 + 4.2 * r1 + 3 * r1},${Line_L_Position + 3 * r1 + 2.1 * r1}) rotate(90)`,
    );

  appendText(
    LeftBusPosition + 2 * r1 - 1,
    Line_L_Position + 3 * r1,
    0,
    3.2 * r1 + 1,
    "R",
    "Relay_at_R_Text",
    true,
  );

  // Generator arcs
  svgSingleDiagram_g
    .append("path")
    .attr("d", arc1 as any)
    .attr(
      "transform",
      `translate(${Generator_S_Position_x - Generator_Radius / 4 + r1 / 4},${Generator_S_Position_y - Generator_Radius / 4 + r1 / 2})`,
    )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");
  svgSingleDiagram_g
    .append("path")
    .attr("d", arc2 as any)
    .attr(
      "transform",
      `translate(${Generator_S_Position_x - Generator_Radius / 4 + r1 / 4 + 2 * r1},${Generator_S_Position_y - Generator_Radius / 4 + r1 / 2}) rotate(180)`,
    )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");

  svgSingleDiagram_g
    .append("path")
    .attr("d", arc1 as any)
    .attr(
      "transform",
      `translate(${Generator_U_Position - Generator_Radius / 4 + r1 / 4},${Generator_S_Position_y - Generator_Radius / 4 + r1 / 2})`,
    )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");
  svgSingleDiagram_g
    .append("path")
    .attr("d", arc2 as any)
    .attr(
      "transform",
      `translate(${Generator_U_Position - Generator_Radius / 4 + r1 / 4 + 2 * r1},${Generator_S_Position_y - Generator_Radius / 4 + r1 / 2}) rotate(180)`,
    )
    .attr("stroke", "grey")
    .attr("stroke-width", "0.5");

  // Custom symbols
  const customS = d3
    .symbol()
    .type(customSymbolS as any)
    .size(3.5);
  svgSingleDiagram_g
    .append("path")
    .attr("d", customS as any)
    .attr(
      "transform",
      `translate(${Generator_S_Position_x + Line_S_Length / 2 - Line_S_Length / 2.45},${Line_S_U_Position - 1.3 * textOffset})`,
    )
    .attr("stroke", "black")
    .attr("stroke-width", "0.5");

  const customU = d3
    .symbol()
    .type(customSymbolS as any)
    .size(3.5);
  svgSingleDiagram_g
    .append("path")
    .attr("d", customU as any)
    .attr(
      "transform",
      `translate(${RightBusPosition + Line_U_Length / 2 - Line_U_Length / 2.45},${Line_S_U_Position - 1.3 * textOffset})`,
    )
    .attr("stroke", "black")
    .attr("stroke-width", "0.5");

  const customE = d3
    .symbol()
    .type(customSymbolS as any)
    .size(3.5);
  svgSingleDiagram_g
    .append("path")
    .attr("d", customE as any)
    .attr(
      "transform",
      `translate(${LeftBusPosition + Line_E_Length / 2 - Line_E_Length / 3},${Line_E_Position - 1.3 * textOffset})`,
    )
    .attr("stroke", "black")
    .attr("stroke-width", "0.5");

  const customL = d3
    .symbol()
    .type(customSymbolS as any)
    .size(3.5);
  svgSingleDiagram_g
    .append("path")
    .attr("d", customL as any)
    .attr(
      "transform",
      `translate(${LeftBusPosition + Line_E_Length / 2 - Line_E_Length / 3},${Line_S_U_Position + textOffset / 1.2})`,
    )
    .attr("stroke", "black")
    .attr("stroke-width", "0.5");

  // Return useful values for fault position
  const minX = LeftBusPosition - 0.5;
  const maxX = LeftBusPosition + Line_E_Length - 22.5;

  return { minX, maxX };
}

import * as d3 from "d3";
import { ComplexNumber } from "./ComplexOperatorAid";

export interface VectorData {
  key: string;
  value: ComplexNumber;
}

export function GroupSVG(
  ObjVect: VectorData[],
  drag: d3.DragBehavior<any, any, any>,
  colors: { [key: string]: string },
  mainGroup: d3.Selection<any, any, any, any>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): d3.Selection<any, any, any, any> {
  const vectors = mainGroup.selectAll<SVGGElement, VectorData>(".vector")
    .data(ObjVect)
    .enter()
    .append("g")
    .attr("class", "vector")
    .call(drag);

  vectors.append("line")
    .attr("class", (d: VectorData) => `${d.key} ${d.key.charAt(0)}`)
    .attr("x1", xScale(0))
    .attr("y1", yScale(0))
    .attr("x2", (d: VectorData) => xScale(d.value.x))
    .attr("y2", (d: VectorData) => yScale(d.value.y))
    .style("stroke", (d: VectorData) => colors[d.key.charAt(1)])
    .style("stroke-width", 2)
    .attr("marker-end", (d: VectorData) => `url(#arrow-${d.key.charAt(1)})`)
    .style("stroke-opacity", (d: VectorData) => d.key.length > 2 ? 0.5 : 1);

  vectors.append("circle")
    .attr("class", (d: VectorData) => `${d.key} ${d.key.charAt(0)}`)
    .attr("cx", (d: VectorData) => xScale(d.value.x))
    .attr("cy", (d: VectorData) => yScale(d.value.y))
    .attr("r", 15)
    .style("cursor", (d: VectorData) => d.key.charAt(0) === "Z" ? "" : "pointer")
    .style("fill-opacity", 0);

  vectors.append("text")
    .attr("class", (d: VectorData) => `${d.key} ${d.key.charAt(0)}`)
    .attr("id", (d: VectorData) => `text${d.key}`)
    .attr("x", (d: VectorData) => xScale(d.value.x))
    .attr("y", (d: VectorData) => yScale(d.value.y))
    .attr("dx", 5)
    .attr("dy", -5)
    .style("font-size", "1rem")
    .style("font-weight", "bold")
    .style("fill", (d: VectorData) => colors[d.key.charAt(1)])
    .each(function(d: VectorData) {
      const magnitude = Math.sqrt(d.value.x ** 2 + d.value.y ** 2).toFixed(1);
      const angle = (Math.atan2(d.value.y, d.value.x) * 180 / Math.PI).toFixed(1);
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

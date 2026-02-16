import * as d3 from "d3";

export interface Colors {
  [key: string]: string;
}

export interface VmarkerResult {
  svg: d3.Selection<SVGSVGElement, unknown, any, any>;
}

export function Vmarker(
  svg: d3.Selection<SVGSVGElement, unknown, any, any>,
  ObjColor: string[],
  arrowSize: number,
  colors: Colors
): VmarkerResult {
  svg.append("defs")
    .selectAll("marker")
    .data(ObjColor)
    .enter()
    .append("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", arrowSize / 1.5)
    .attr("markerHeight", arrowSize)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", (d) => colors[d]);
  
  return { svg };
}

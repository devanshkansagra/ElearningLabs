// Define arrow marker
export function Vmarker(svg, ObjColor, arrowSize, colors) {
 svg.append("defs").selectAll("marker")
    .data(ObjColor)
    .enter().append("marker")
    .attr("id", d => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", arrowSize/1.5)
    .attr("markerHeight", arrowSize)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", d => colors[d]);
    return { svg };
}

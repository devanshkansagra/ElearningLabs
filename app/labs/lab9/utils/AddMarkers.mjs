// Define arrow marker
export function Vmarker(svg, ObjColor, arrowSize, colors) {
    const markerWidth = arrowSize;
    const markerHeight = 2 * arrowSize;
    const viewBox = `${0} ${0} ${2 * arrowSize} ${2 * arrowSize}`;
    const keys = Array.isArray(ObjColor) ? ObjColor : Object.keys(ObjColor || {});

    const markerData = keys.map((key) => {
        const normalizedKey = key && key.length > 1 && key.charAt(0) === "Z" ? key.slice(1) : key;
        const color = colors && (colors[key] || colors[normalizedKey]) ? (colors[key] || colors[normalizedKey]) : "currentColor";
        return { id: `arrow-${normalizedKey}`, color };
    });

    const defs = svg.select("defs");
    const defsSelection = defs.empty() ? svg.append("defs") : defs;

    const markers = defsSelection.selectAll("marker.vector-marker")
        .data(markerData, d => d.id);

    markers.exit().remove();

    const markersEnter = markers.enter().append("marker")
        .attr("class", "vector-marker")
        .attr("id", d => d.id)
        .attr("viewBox", viewBox)
        .attr("refX", 1.7 * arrowSize)
        .attr("refY", 0)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto");

    markersEnter.append("path")
        .attr("d", `M0,-${arrowSize}L${2 * arrowSize},0L0,${arrowSize}Z`)
        .attr("fill", d => d.color)
        .attr("stroke", d => d.color);

    return { svg };
}

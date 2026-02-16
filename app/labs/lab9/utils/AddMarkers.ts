// Define arrow marker

// Define types for SVG elements
interface D3Selection {
    select: (selector: string) => D3Selection;
    empty: () => boolean;
    append: (type: string) => D3Selection;
    selectAll: (selector: string) => D3Selection;
    data: (data: any[], keyFn?: (d: any) => any) => D3Selection;
    exit: () => D3Selection;
    remove: () => D3Selection;
    enter: () => D3Selection;
    attr: (name: string, value: any) => D3Selection;
}

interface MarkerData {
    id: string;
    color: string;
}

interface Colors {
    [key: string]: string;
}

interface VmarkerResult {
    svg: D3Selection;
}

export function Vmarker(
    svg: D3Selection,
    ObjColor: string[] | { [key: string]: string } | undefined,
    arrowSize: number,
    colors: Colors | undefined
): VmarkerResult {
    const markerWidth = arrowSize;
    const markerHeight = 2 * arrowSize;
    const viewBox = `${0} ${0} ${2 * arrowSize} ${2 * arrowSize}`;
    const keys = Array.isArray(ObjColor) ? ObjColor : Object.keys(ObjColor || {});

    const markerData: MarkerData[] = keys.map((key) => {
        const normalizedKey = key && key.length > 1 && key.charAt(0) === "Z" ? key.slice(1) : key;
        const color = colors && (colors[key] || colors[normalizedKey || ""]) ? (colors[key] || colors[normalizedKey || ""]) : "currentColor";
        return { id: `arrow-${normalizedKey}`, color };
    });

    const defs = svg.select("defs");
    const defsSelection = defs.empty() ? svg.append("defs") : defs;

    const markers = defsSelection.selectAll("marker.vector-marker")
        .data(markerData, (d: MarkerData) => d.id);

    markers.exit().remove();

    const markersEnter = markers.enter().append("marker")
        .attr("class", "vector-marker")
        .attr("id", (d: MarkerData) => d.id)
        .attr("viewBox", viewBox)
        .attr("refX", 1.7 * arrowSize)
        .attr("refY", 0)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto");

    markersEnter.append("path")
        .attr("d", `M0,-${arrowSize}L${2 * arrowSize},0L0,${arrowSize}Z`)
        .attr("fill", (d: MarkerData) => d.color)
        .attr("stroke", (d: MarkerData) => d.color);

    return { svg };
}

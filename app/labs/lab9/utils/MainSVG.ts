// Main SVG utility functions

// Define types for SVG elements
interface D3Selection {
    selectAll: (selector: string) => D3Selection;
    data: (data: any[]) => D3Selection;
    enter: () => D3Selection;
    append: (type: string) => D3Selection;
    attr: (name: string, value: any) => D3Selection;
    style: (name: string, value: any) => D3Selection;
    call: (handler: any) => D3Selection;
    text: (value: any) => D3Selection;
}

interface DragHandler {
    (selection: D3Selection): void;
}

interface ColorMap {
    [key: string]: string;
}

interface ScaleFunction {
    (value: number): number;
}

interface VectorData {
    key: string;
    value: {
        x: number;
        y: number;
    };
}

// MainSVG function
export function GroupSVG(
    ObjVect: VectorData[],
    drag: DragHandler,
    colors: ColorMap,
    mainGroup: D3Selection,
    xScale: ScaleFunction,
    yScale: ScaleFunction
): D3Selection {
    const vectors = mainGroup.selectAll(".vector")
        .data(ObjVect)
        .enter().append("g")
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
        .text((d: VectorData) => `${d.key} ${Math.sqrt(d.value.x * d.value.x + d.value.y * d.value.y).toFixed(1)}/${(Math.atan2(d.value.y, d.value.x) * 180 / Math.PI).toFixed(0)}°`);

    return vectors;
}

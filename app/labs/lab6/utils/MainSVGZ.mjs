

export function GroupSVG (ObjVect,drag,colors,mainGroup,xScale,yScale) {

var vectors = mainGroup.selectAll(".vector")
    .data(ObjVect)
    .enter().append("g")
    .attr("class", "vector")
    .call(drag);

vectors.append("line")
    .attr("class", d => `${d.key} ${d.key.charAt(0)}`)
    .attr("x1", xScale(0))
    .attr("y1", yScale(0))
    .attr("x2", d => xScale(d.value.x))
    .attr("y2", d => yScale(d.value.y))
    .style("stroke", d => colors[d.key.charAt(1)])
    .style("stroke-width", 2)
    .attr("marker-end", d => `url(#arrow-${d.key.charAt(1)})`)
    .style("stroke-opacity", d => d.key.length > 2 ? 0.5 : 1);

vectors.append("circle")
    .attr("class", d => `${d.key} ${d.key.charAt(0)}`)
    .attr("cx", d => xScale(d.value.x))
    .attr("cy", d => yScale(d.value.y))
    .attr("r", 15)
    .style("cursor",d => d.key.charAt(0) === "Z" ? "" : "pointer")
    .style("fill-opacity", 0);

    vectors.append("text")
    .attr("class", d => `${d.key} ${d.key.charAt(0)}`)
    .attr("id", d => `text${d.key}`)
    .attr("x", d => xScale(d.value.x))
    .attr("y", d => yScale(d.value.y))
    .attr("dx", 5)
    .attr("dy", -5)
    .style("font-size", "1rem")
    .style("font-weight", "bold")
    .style("fill", d => colors[d.key.charAt(1)])
    .each(function(d) {
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
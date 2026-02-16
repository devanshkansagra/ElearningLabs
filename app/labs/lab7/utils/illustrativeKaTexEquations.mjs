import * as katex from "katex";
export function equationsDisplayed(vis, numPhases) {
  const foreignVoltage = vis
    .append("foreignObject")
    .attr("x", -150)
    .attr("y", 600)
    .attr("width", 600)
    .attr("height", 400);
  const foreigna = vis
    .append("foreignObject")
    .attr("x", 400)
    .attr("y", 600)
    .attr("width", 400)
    .attr("height", 200);
  const foreigna2 = vis
    .append("foreignObject")
    .attr("x", 400)
    .attr("y", 600)
    .attr("width", 400)
    .attr("height", 200);

  const voltageDiv = foreignVoltage
    .append("xhtml:div")
    .attr("xmlns", "http://www.w3.org/1999/xhtml")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("color", "steelblue")
    .html("");

  const aDiv = foreigna
    .append("xhtml:div")
    .attr("xmlns", "http://www.w3.org/1999/xhtml")
    .style("font-size", "20px")
    .style("color", "steelblue")
    .style("font-weight", "bold")
    .html("");

  const a2Div = foreigna2
    .append("xhtml:div")
    .attr("xmlns", "http://www.w3.org/1999/xhtml")
    .style("font-size", "20px")
    .style("color", "steelblue")
    .style("font-weight", "bold")
    .html("");

  if (numPhases === 6) {
    let voltageEquation = `
    \\bigg[
    \\begin{array}{c}
    V_0 \\\\ 
    V_1 \\\\ 
    V_2 \\\\ 
    V_3 \\\\ 
    V_4 \\\\ 
    V_5
    \\end{array}
    \\bigg] = 
    \\frac{1}{6}
    \\bigg[
    \\begin{array}{cccccc}
    1 & 1 & 1 & 1 & 1 & 1 \\\\
    1 & \a & \a^2 & \a^3 & \a^4 & \a^5 \\\\
    1 & \a^2 & \a^4 & \a^0 & \a^2 & \a^4 \\\\
    1 & \a^3 & \a^0 & \a^3 & \a^0 & \a^3 \\\\
    1 & \a^4 & \a^2 & \a^0 & \a^4 & \a^2 \\\\
    1 & \a^5 & \a^4 & \a^3 & \a^2 & \a
    \\end{array}
    \\bigg]
    \\bigg[
    \\begin{array}{c}
    V_a \\\\ 
    V_b \\\\ 
    V_c \\\\ 
    V_d \\\\ 
    V_e \\\\ 
    V_f
    \\end{array}
    \\bigg]
    `;

    let aEquation = `

    `;

    let a2Equation = `
    \a^0 = e^{j\\frac{2\\pi \\times 0}{6}} = e^{0} = 1 \\\\    
    \a^1 = e^{j\\frac{2\\pi}{6}} = e^{j\\frac{\\pi}{3}} = \\frac{1}{2} + j\\frac{\\sqrt{3}}{2} \\\\
    \a^2 = e^{j\\frac{2\\pi \\times 2}{6}} = e^{j\\frac{2\\pi}{3}} = -\\frac{1}{2} + j\\frac{\\sqrt{3}}{2} \\\\
    \a^3 = e^{j\\frac{2\\pi \\times 3}{6}} = e^{j\\pi} = -1 \\\\
    \a^4 = e^{j\\frac{2\\pi \\times 4}{6}} = e^{j\\frac{4\\pi}{3}} = -\\frac{1}{2} - j\\frac{\\sqrt{3}}{2} \\\\
    \a^5 = e^{j\\frac{2\\pi \\times 5}{6}} = e^{j\\frac{5\\pi}{3}} = \\frac{1}{2} - j\\frac{\\sqrt{3}}{2}
    `;

    katex.render(voltageEquation, voltageDiv.node(), { throwOnError: false });
    katex.render(aEquation, aDiv.node(), { throwOnError: false });
    katex.render(a2Equation, a2Div.node(), { throwOnError: false });
  } else {
    let voltageEquation = `
  \\bigg[
  \\begin{array}{c}
  V_0 \\\\ 
  V_1 \\\\ 
  V_2 
  \\end{array}
  \\bigg] = 
  \\frac{1}{3} 
  \\bigg[
  \\begin{array}{ccc}
  1 & 1 & 1 \\\\ 
  1 & \a & \a^2 \\\\ 
  1 & \a^2 & \a 
  \\end{array}
  \\bigg] 
  \\bigg[
  \\begin{array}{c}
  V_a \\\\ 
  V_b \\\\ 
  V_c 
  \\end{array}
  \\bigg]
`;

    let aEquation = `

`;

    let a2Equation = `
a^0 = e^{j\\frac{2\\pi \\times 0}{6}} = e^{0} = 1 \\\\      
a^1 = e^{j\\frac{2\\pi}{3}} = -\\frac{1}{2} + j\\frac{\\sqrt{3}}{2} \\\\ 
a^2 = e^{j\\frac{4\\pi}{3}} = -\\frac{1}{2} - j\\frac{\\sqrt{3}}{2}
`;

    katex.render(voltageEquation, voltageDiv.node(), { throwOnError: false });
    katex.render(aEquation, aDiv.node(), { throwOnError: false });
    katex.render(a2Equation, a2Div.node(), { throwOnError: false });
  }
}

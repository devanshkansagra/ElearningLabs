import * as d3 from 'd3'
// Only add event listener if element exists (for React/SSR compatibility)
const blinderShow = document.getElementById('blinderShow');
if (blinderShow) {
  blinderShow.addEventListener('change', function () {
    const sel = d3.selectAll('.load-blinder-v,.load-blinder-arc');
    sel.style('display', this.checked ? 'block' : 'none');
    sel.style('background-color', this.checked ? 'lightgrey' : 'none');
  });
}

export function setupSELDynamicBlinder() {
  const svg = d3.select('.vis_inner_Z_svg_g');

  // helpers: Ω -> px using the current Z scales
  const toPx = ([re, im]) => [ xScale_Z(re), yScale_Z(im) ];
  const Zmax = Math.max(
    Math.abs(xScale_Z.domain()[0]),
    Math.abs(xScale_Z.domain()[1]),
    Math.abs(yScale_Z.domain()[0]),
    Math.abs(yScale_Z.domain()[1])
  );

  function drawSELBlinder() {
    const angleDeg  = parseFloat(document.getElementById('blinderAngle').value)      || 30; // °
    const arcRadius = parseFloat(document.getElementById('blinderArcRadius').value)  || 10; // Ω
    const theta     = angleDeg * Math.PI / 180;

    // how far the arms extend (in Ω, not px)
    // (a bit beyond current domain so they reach the edges)
    const R_far = Zmax * 1.5;

    // wipe previous
    svg.selectAll('.load-blinder-arc,.load-blinder-v').remove();

    // ---- positive-R side (centered on +R axis) --------------------------------
    // arc from -θ to +θ at radius arcRadius
    const pStart = toPx([ arcRadius * Math.cos(-theta), arcRadius * Math.sin(-theta) ]);
    const pEnd   = toPx([ arcRadius * Math.cos(+theta), arcRadius * Math.sin(+theta) ]);

    // radii must be in *pixels* for the SVG arc command
    const rx = Math.abs(xScale_Z(arcRadius) - xScale_Z(0));
    const ry = Math.abs(yScale_Z(0)        - yScale_Z(arcRadius));

    const arcPath = [
      "M", pStart[0], pStart[1],
      "A", rx, ry, 0, 0, 0, pEnd[0], pEnd[1]
    ].join(" ");

    svg.append('path')
      .attr('class', 'load-blinder-arc')
      .attr('d', arcPath);

    // arms (radial lines) from the arc ends to the edge
    const armPosEnd  = toPx([ R_far * Math.cos(+theta), R_far * Math.sin(+theta) ]);
    const armNegEnd  = toPx([ R_far * Math.cos(-theta), R_far * Math.sin(-theta) ]);

    svg.append('line')
      .attr('class', 'load-blinder-v')
      .attr('x1', pEnd[0]).attr('y1', pEnd[1])
      .attr('x2', armPosEnd[0]).attr('y2', armPosEnd[1]);

    svg.append('line')
      .attr('class', 'load-blinder-v')
      .attr('x1', pStart[0]).attr('y1', pStart[1])
      .attr('x2', armNegEnd[0]).attr('y2', armNegEnd[1]);

    // ---- negative-R side (mirror around π) -----------------------------------
    const pStartN = toPx([ arcRadius * Math.cos(Math.PI - theta),
                           arcRadius * Math.sin(Math.PI - theta) ]);
    const pEndN   = toPx([ arcRadius * Math.cos(Math.PI + theta),
                           arcRadius * Math.sin(Math.PI + theta) ]);

    const arcPathN = [
      "M", pStartN[0], pStartN[1],
      "A", rx, ry, 0, 0, 0, pEndN[0], pEndN[1]
    ].join(" ");

    svg.append('path')
      .attr('class', 'load-blinder-arc')
      .attr('d', arcPathN);

    const armPosEndN = toPx([ R_far * Math.cos(Math.PI + theta),
                              R_far * Math.sin(Math.PI + theta) ]);
    const armNegEndN = toPx([ R_far * Math.cos(Math.PI - theta),
                              R_far * Math.sin(Math.PI - theta) ]);

    svg.append('line')
      .attr('class', 'load-blinder-v')
      .attr('x1', pEndN[0]).attr('y1', pEndN[1])
      .attr('x2', armPosEndN[0]).attr('y2', armPosEndN[1]);

    svg.append('line')
      .attr('class', 'load-blinder-v')
      .attr('x1', pStartN[0]).attr('y1', pStartN[1])
      .attr('x2', armNegEndN[0]).attr('y2', armNegEndN[1]);

    // respect the checkbox visibility
    const visible = document.getElementById('blinderShow').checked;
    d3.selectAll('.load-blinder-arc,.load-blinder-v')
      .style('display', visible ? 'block' : 'none');
  }

  // live updates
  ['blinderAngle','blinderArcRadius'].forEach(id => {
    ['input','change'].forEach(ev =>
      document.getElementById(id).addEventListener(ev, drawSELBlinder)
    );
  });

  drawSELBlinder();
  // expose for external re-draws if scales/domains change later
  window.drawSELBlinder = drawSELBlinder;
}
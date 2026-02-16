// ForeignObjects.js
// d3 is global. Uses your existing Vmarker(svg, [id], arrowSize, markerType).
// Behavior: first click -> circles only (lines hidden), second click -> arrows with lines, then toggle.
import * as d3 from 'd3'

let markerState = 'arrow'; // current plot style in the canvas

function parseMarkerId(markerUrl) {
  if (!markerUrl) return null;
  const m = /url\(#([^)]+)\)/.exec(markerUrl);
  return m ? m[1] : null;
}

// HUD icon shows the NEXT mode (action) based on CURRENT state
function setIconForAction(state) {
  const icon = document.getElementById('markerIcon');
  if (!icon) return;
  if (state === 'arrow') {
    // currently arrows/lines; offer dots (circles only)
    icon.src   = './images/dot.png';
    icon.alt   = 'Switch to dots';
    icon.title = 'Switch to dots';
  } else {
    // currently dots; offer arrows/lines
    icon.src   = './images/phasors.png';
    icon.alt   = 'Switch to phasors';
    icon.title = 'Switch to phasors';
  }
}

/* 1) Build HUD once */
export function inserForeignObject() {
  const svgZ = d3.select('#vis_inner_Z_svg');
  d3.select('#hud-fo').remove();

  const foCtrl = svgZ.append('foreignObject')
    .attr('id', 'hud-fo')
    .attr('x', 4).attr('y', 4)
    .attr('width', 60).attr('height', 60)
    .attr('class', 'marker-toggle-hud')
    .attr('pointer-events', 'visiblePainted');

  foCtrl.append('xhtml:div')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .html(`<img id="markerIcon" class="toggleMarker" style="width:50px;aspect-ratio:1" alt="">`);

  setIconForAction(markerState); // action for current state
  foCtrl.raise();
}

/* 2) Bind toggle once */
export function bindMarkerToggle(vis_inner_Z) {
  const icon = document.getElementById('markerIcon');
  if (!icon) return;
  if (icon.dataset.bound === '1') { setIconForAction(markerState); return; }

  const onToggle = () => {
    // keep HUD above
    const hud = document.getElementById('hud-fo');
    if (hud) d3.select(hud).raise();

    // flip state; FIRST CLICK goes to 'circle' (dots mode)
    markerState = (markerState === 'arrow') ? 'circle' : 'arrow';
    setIconForAction(markerState);

    // fresh list each click
    const polylines = document.querySelectorAll('.vis_inner_Z_svg_g > polyline:not(.vector_Z_Line)');

    polylines.forEach(polyline => {
      // cache originals once
      const cs = getComputedStyle(polyline);
      if (!polyline.dataset.originalColor)   polyline.dataset.originalColor   = cs.stroke;
      if (!polyline.dataset.originalOpacity) polyline.dataset.originalOpacity = cs.strokeOpacity || '1';

      // dots mode: hide the line, keep the marker visible
      if (markerState === 'circle') {
        polyline.style.strokeOpacity = '0';          // hide line only
        // do not change stroke color or width
      } else {
        // phasors mode: restore line visibility
        polyline.style.stroke        = polyline.dataset.originalColor;
        polyline.style.strokeOpacity = polyline.dataset.originalOpacity;
      }

      // update the marker head shape if present
      const markerId = parseMarkerId(polyline.getAttribute('marker-end'));
      if (!markerId) return;

      // remove ALL markers with this id under this svg, then recreate via your factory
      vis_inner_Z.selectAll('defs').selectAll(`marker#${CSS.escape(markerId)}`).remove();
      if (typeof Vmarker === 'function') {
        Vmarker(vis_inner_Z, [markerId], 5, markerState); // arrow <-> circle
      }
    });
  };

  icon.addEventListener('click', onToggle, { passive: true });
  icon.dataset.bound = '1';
}

/* 3) Optional immediate setter (keeps same semantics) */
export function setMarkerState(state, vis_inner_Z) {
  if (state !== 'arrow' && state !== 'circle') return;
  if (markerState === state) { setIconForAction(markerState); return; }

  markerState = state;
  setIconForAction(markerState);

  const polylines = document.querySelectorAll('.vis_inner_Z_svg_g > polyline:not(.vector_Z_Line)');
  polylines.forEach(polyline => {
    const cs = getComputedStyle(polyline);
    if (!polyline.dataset.originalColor)   polyline.dataset.originalColor   = cs.stroke;
    if (!polyline.dataset.originalOpacity) polyline.dataset.originalOpacity = cs.strokeOpacity || '1';

    if (markerState === 'circle') {
      polyline.style.strokeOpacity = '0';
    } else {
      polyline.style.stroke        = polyline.dataset.originalColor;
      polyline.style.strokeOpacity = polyline.dataset.originalOpacity;
    }

    const markerId = parseMarkerId(polyline.getAttribute('marker-end'));
    if (!markerId) return;
    vis_inner_Z.selectAll('defs').selectAll(`marker#${CSS.escape(markerId)}`).remove();
    if (typeof Vmarker === 'function') Vmarker(vis_inner_Z, [markerId], 5, markerState);
  });
}

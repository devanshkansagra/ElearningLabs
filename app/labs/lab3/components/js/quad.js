const recordAndUpdate = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.recordAndUpdate === "function"
  ) {
    window.recordAndUpdate();
  }
};
import { lowerSELTable, raiseSELTable } from "./svgSELTable.js";
import * as d3 from "d3";
import $ from "jquery";

let rLeft = 0;
let rRight = 0;
let f = 0;
let fLeft = 0;
let fRight = 0;
let mode = "MHO";
const rad = (deg) => (deg * Math.PI) / 180;

// Return true when point [R, X] lies inside a convex quad (edges inclusive)
export function inBox([R, X], pts) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  if (
    R < Math.min(...xs) ||
    R > Math.max(...xs) ||
    X < Math.min(...ys) ||
    X > Math.max(...ys)
  )
    return false;

  let orient = 0;
  const n = pts.length; // = 4
  for (let i = 0; i < n; ++i) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    const cross = (x2 - x1) * (X - y1) - (y2 - y1) * (R - x1);
    if (cross === 0) continue; // on edge => inside
    const s = Math.sign(cross);
    if (!orient)
      orient = s; // first non-zero sign
    else if (s !== orient) return false;
  }
  return true;
}

export function quadPoints(reach, rLeft, rRight, f, fLeft, fRight) {
  const reachVal = +$(reach()).val();
  const z1 = +$("#Z1").val();
  const zRatio = +$("#Z_ratio").val();
  const zLen = +$("#Z_l").val();
  const required = [
    rLeft,
    rRight,
    f,
    fLeft,
    fRight,
    reachVal,
    z1,
    zRatio,
    zLen,
  ];
  if (required.some((v) => !Number.isFinite(v))) return null;

  // r (vertical edge) in ohms
  const r = (zRatio * zLen * reachVal) / 100;

  // convenience (all angles in radians)
  const cfLeft = Math.cos(-fLeft + Math.PI / 2);
  const sfLeft = Math.sin(-fLeft + Math.PI / 2);
  const cf = Math.cos(-f + Math.PI / 2);
  const sf = Math.sin(-f + Math.PI / 2);
  const cfRight = Math.cos(-fRight + Math.PI / 2);
  const sfRight = Math.sin(-fRight + Math.PI / 2);

  // scale left/right radii when drawing Z2/Z3 relative to Z1
  const reachPct = +$(reach()).val();
  const rLeftWithReach = (rLeft * reachPct) / +$("#Z1").val();
  const rRightWithReach = (rRight * reachPct) / +$("#Z1").val();

  // vertices in ohms (R, X)
  return [
    [-rLeftWithReach * cf, +rLeftWithReach * sf],
    [-rLeftWithReach * (cfLeft - sfLeft), +r],
    [rRightWithReach * (cfRight + sfRight), +r],
    [rRightWithReach * cf, -rRightWithReach * sf],
  ];
}

/* drawQuads now uses <polygon> ------------------------------------- */
export function drawQuads(g) {
  if (typeof xScale_Z !== "function" || typeof yScale_Z !== "function") return;
  const data = quadBoxes
    .map((q, i) => {
      const pts = quadPoints(q, rLeft, rRight, f, fLeft, fRight);
      return pts ? { pts, idx: i } : null;
    })
    .filter(Boolean);

  const quads = g.selectAll("polygon.quad").data(data, (d) => d.idx);

  quads
    .enter()
    .append("polygon")
    .attr("class", "quad")
    .attr("id", (d) => `quad${d.idx + 1}`)
    .style("fill", "none")
    .style("stroke", "var(--plot-stroke)")
    .style("stroke-width", 0.5)
    .style("pointer-events", "none");

  // scale to screen when drawing
  quads.attr("points", (d) =>
    d.pts.map(([R, X]) => `${xScale_Z(R)},${yScale_Z(X)}`).join(" "),
  );

  quads.exit().remove();
}

export let startQuad = function () {
  rLeft = +$("#reachLeft").val(); // ohms
  rRight = +$("#reachRight").val(); // ohms
  f = rad(+$("#Z_angle").val());
  fLeft = rad(+$("#reachAngleLeft").val());
  fRight = rad(+$("#reachAngleRight").val());
  mode = $('input[name="charType"]:checked').val(); // "MHO" | "QUAD"
  const vals = [rLeft, rRight, f, fLeft, fRight];
  if (vals.some((v) => !Number.isFinite(v))) {
    d3.selectAll(".quad").remove();
    return;
  }

  if (mode === "QUAD") {
    // Look at ALL candidate impedances: phase & phase-to-phase
    const zAll = [za, zb, zc, zab, zbc, zca].filter(
      (z) => z && Number.isFinite(z[0]) && Number.isFinite(z[1]),
    );

    const [b1, b2, b3] = quadBoxes.map((q) =>
      quadPoints(q, rLeft, rRight, f, fLeft, fRight),
    );
    if (![b1, b2, b3].every(Array.isArray)) {
      d3.selectAll(".quad").remove();
      return;
    }

    const z1Hit = zAll.some((z) => inBox(z, b1));
    d3.select("#quad1").style(
      "fill",
      z1Hit ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 255, 255, 0.01)",
    );

    const z2Hit = zAll.some((z) => inBox(z, b2));
    d3.select("#quad2").style(
      "fill",
      z2Hit ? "rgba(0, 0, 255, 0.1)" : "rgba(255, 255, 255, 0.01)",
    );

    const z3Hit = zAll.some((z) => inBox(z, b3));
    d3.select("#quad3").style(
      "fill",
      z3Hit ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.01)",
    );
  }

  if (mode === "MHO") {
    d3.selectAll(".quad").remove();
    document.getElementById("reach").style.display = "none";
  }

  mode === "QUAD"
    ? drawQuads(vis_inner_Z)
    : vis_inner_Z.selectAll("rect.quad").remove();
};

export function syncQuadFromDOM() {
  if (!$) return;
  quad.rLeft = +$("#reachLeft").val() || 0;
  quad.rRight = +$("#reachRight").val() || 0;
  quad.phiLeft = (+$("#reachAngleLeft").val() * Math.PI) / 180 || 0;
  quad.phiRight = (+$("#reachAngleRight").val() * Math.PI) / 180 || 0;
}

// 1. reactive state
export const quad = new Proxy(
  {
    rLeft: 0,
    rRight: 0,
    phiLeft: 0,
    phiRight: 0,
  },
  {
    set(obj, k, v) {
      obj[k] = v; // store sanitized value
      // keep the four input boxes in-sync
      switch (k) {
        case "rLeft":
          $("#reachLeft").val(v.toFixed(2));
          break;
        case "rRight":
          $("#reachRight").val(v.toFixed(2));
          break;
        case "phiLeft":
          $("#reachAngleLeft").val(((v * 180) / Math.PI).toFixed(1));
          break;
        case "phiRight":
          $("#reachAngleRight").val(((v * 180) / Math.PI).toFixed(1));
          break;
      }
      window.recordAndUpdate();
      drawQuadHandles(); // redraw the four little circles
      return true;
    },
  },
);

const idMap = new Map([
  ["reachLeft", "rLeft"],
  ["reachRight", "rRight"],
  ["reachAngleLeft", "phiLeft"],
  ["reachAngleRight", "phiRight"],
]);

function mapIdToLabel(id) {
  return idMap.get(id) || null;
}

// Only set up event listeners if DOM is ready (for React/SSR compatibility)
export function setupQuadEventListeners() {
  if (typeof $ === "undefined") return;

  // 2. keep proxy <-> inputs in-sync
  $("#reachLeft,#reachRight,#reachAngleLeft,#reachAngleRight").on(
    "input",
    (e) => {
      quad[mapIdToLabel(e.target.id)] = +e.target.value;
    },
  );
}

export function setupQuadChangeListeners() {
  if (typeof $ === "undefined") return;

  $("#Z_ratio").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z0_ratio").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z_l").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z_angle").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z0_angle").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z1").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z2").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $("#Z3").on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  });
  $('input[name="charType"]').on("change", () => {
    window.recordAndUpdate();
    drawQuadHandles();
  }); // MHO or Quad
}
// angle handles: vertices 1 & 2 sit on the horizontal line X = -r
function solvePhiFromR(Rohm, rOhm, leftSide) {
  const v = (leftSide ? -Rohm : Rohm) / (rOhm * Math.SQRT2);
  const clamped = Math.max(-1, Math.min(1, v));
  return (Math.acos(clamped) - Math.PI / 6) * (leftSide ? 1 : -1);
}

// 3. draggable handles
export function drawQuadHandles() {
  const hud = d3.select("#vis_inner_Z_svg").select("#hud-fo");
  if (typeof xScale_Z !== "function" || typeof yScale_Z !== "function") return;

  function hudDisable() {
    hud.attr("pointer-events", "none");
  }
  function hudEnable() {
    hud.attr("pointer-events", "visible");
  }

  const mode = $('input[name="charType"]:checked').val();
  const reach = document.getElementById("reach");
  zoomLayer.selectAll(".quad-handle").remove();
  if (mode !== "QUAD") {
    if (reach) reach.style.display = "none";
    return;
  }
  reach.style.display = "block";

  // base handles reference Z1
  const pts = quadPoints(() => $("#Z1"), rLeft, rRight, f, fLeft, fRight);
  if (!Array.isArray(pts)) return;
  const screenPts = pts.map(([R, X]) => [xScale_Z(R), yScale_Z(X)]);

  const g = zoomLayer;

  // ANGLE handles (indices 1 & 2) live on X = -r
  [
    { i: 1, key: "phiLeft", left: true },
    { i: 2, key: "phiRight", left: false },
  ].forEach((h) => {
    const c = g
      .append("circle")
      .attr("class", "quad-handle")
      .attr("r", 6)
      .attr("fill", "orange")
      .attr("cx", screenPts[h.i][0])
      .attr("cy", screenPts[h.i][1])
      .style("cursor", "grab")
      .style("pointer-events", "all");

    c.call(
      d3
        .drag()
        .on("drag", (event) => {
          const [mx] = d3.pointer(event, g.node());
          const Rohm = xScale_Z.invert(mx);
          const rOhm = h.left ? -rLeft : rRight;
          quad[h.key] = solvePhiFromR(Rohm, rOhm, h.left);
          drawQuads(vis_inner_Z);
        })
        .on("end", () => {
          hudEnable();
        }),
    );
  });

  // RADIUS handles (indices 0 & 3) move along f rays
  const dirLeft = () => [-Math.sin(f), Math.cos(f)]; // unit in ohm-space
  const dirRight = () => [Math.sin(f), -Math.cos(f)];

  [
    { i: 0, key: "rLeft", dir: dirLeft },
    { i: 3, key: "rRight", dir: dirRight },
  ].forEach((h) => {
    const c = g
      .append("circle")
      .attr("class", "quad-handle")
      .attr("r", 6)
      .attr("fill", "green")
      .attr("cx", screenPts[h.i][0])
      .attr("cy", screenPts[h.i][1])
      .style("cursor", "grab")
      .style("pointer-events", "all");

    c.call(
      d3
        .drag()
        .on("drag", (event) => {
          const [mx, my] = d3.pointer(event, g.node());
          const R = xScale_Z.invert(mx);
          const X = yScale_Z.invert(my);
          const [ux, uy] = h.dir();
          const proj = R * ux + X * uy; // projection in ohms
          quad[h.key] = Math.max(0, proj);
          drawQuads(vis_inner_Z);
        })
        .on("end", () => {
          hudEnable();
        }),
    );
  });
  g.selectAll(".quad-handle").raise();
}

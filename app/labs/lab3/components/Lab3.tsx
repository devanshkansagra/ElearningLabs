"use client";
import "../css/style.css";
import "../css/tooltip.css";
import * as d3 from "d3";
import $ from "jquery";
if (typeof window !== "undefined") {
  (window as any).$ = (window as any).jQuery = $;
}
import katex from "katex";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";
import { useEffect, useRef, useState } from "react";

import { inserForeignObject, bindMarkerToggle } from "./js/ForeignObjects.js";
import {
  textDecorationAndSymbols,
  addArrows,
} from "./js/textDecorationAndSymbols.js";
import { setupSELDynamicBlinder } from "./js/blinders.js";
import {
  compute,
  restore,
  buildMatrix,
  loadPresets,
  saveCurrentToPreset,
  applyPreset,
  lowerSELTable,
  raiseSELTable,
  deletePreset,
  ensureSELTable,
  collectAllInputs,
  applyAllInputs,
} from "./js/svgSELTable.js";
import { assignValues } from "./js/assignment.js";
import { History } from "./js/History.js";
import {
  inBox,
  quadPoints,
  drawQuads,
  drawQuadHandles,
  quad,
  syncQuadFromDOM,
  startQuad,
} from "./js/quad.js";
import {
  computeVoltagePhasors,
  computeCurrentPhasors,
  computeImpedancePhasors,
} from "./js/computePhaseVectors.js";
import { renderVectorsAndTexts } from "./js/renderVectorsAndTexts.js";
import { toggleUnit, setUnit } from "./js/toggle.js";
import { tab_ABC } from "./js/tab_ABC.js";
import { ganged } from "./js/ganged.js";

import { initMeteringBaseUI } from "./js/meteringBaseUI.js";
import { onMeteringBaseChange, convertScalar } from "./js/meteringBase.js";
import { initZ0ModelUI } from "./js/z0model.js";

export default function Lab3() {
  // Refs for SVG elements
  const visInnerISvgRef = useRef<SVGSVGElement>(null);
  const visInnerVSvgRef = useRef<SVGSVGElement>(null);

  // React state for app state
  const [appState, setAppState] = useState({
    currentMarkerType: "arrow",
    units: { mode: "SEC" },
    mode: "MHO",
    lastDisplayMode: "SEC",
  });

  // React state for reset triggers
  const [resetVTrigger, setResetVTrigger] = useState(0);
  const [resetITrigger, setResetITrigger] = useState(0);

  // Handle reset V
  const handleResetV = () => {
    setResetVTrigger(prev => prev + 1);
  };

  // Handle reset I
  const handleResetI = () => {
    setResetITrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const REPL: [string, string][] = [
      ["Ã¢â€žÂ¦", "\u03A9"],
      ["Ã‚Âº", "\u00B0"],
      ["Ãƒâ€”", "\u00D7"],
      ["Ã¢â€ Â¶", "\u21B6"],
      ["Ã¢â€ Â·", "\u21B7"],
      ["Ã¢â‚¬Å“", '"'],
      ["Ã¢â‚¬\u009D", '"'],
      ["Ã¢â‚¬Â", '"'],
      ["Ã¢â‚¬Ëœ", "'"],
      ["Ã¢â‚¬â„¢", "'"],
      ["Ã¢â‚¬Â¦", "..."],
      ["Ã¢â‚¬â€œ", "-"],
      ["Ã¢â‚¬â€", " - "],
      ["Ã¢Ë†Å¾", "\u221E"],
      ["Ã¢â€šâ‚¬", "0"],
      ["Ã¢â€šâ€š", "2"],
      ["Ã°Å¸â€œÂ", "\u2220"],
    ];

    const scrub = (s: string) => {
      let out = s;
      for (const [bad, good] of REPL) {
        out = out.split(bad).join(good);
      }
      return out;
    };

    const run = () => {
      try {
        if (typeof NodeFilter !== "undefined" && document.body) {
          const w = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );

          let n: Node | null;
          while ((n = w.nextNode())) {
            const v = n.nodeValue;
            if (!v) continue;

            if (
              !v.includes("Ã¢") &&
              !v.includes("Ã‚") &&
              !v.includes("Ãƒ") &&
              !v.includes("Ã°")
            )
              continue;

            const fixed = scrub(v);
            if (fixed !== v) n.nodeValue = fixed;
          }
        }

        const ATTRS = ["title", "aria-label", "placeholder"];
        document
          .querySelectorAll("[title],[aria-label],[placeholder]")
          .forEach((el) => {
            for (const a of ATTRS) {
              if (!el.hasAttribute(a)) continue;

              const v = el.getAttribute(a);
              if (!v) continue;

              if (
                !v.includes("Ã¢") &&
                !v.includes("Ã‚") &&
                !v.includes("Ãƒ") &&
                !v.includes("Ã°")
              )
                continue;

              const fixed = scrub(v);
              if (fixed !== v) el.setAttribute(a, fixed);
            }
          });
      } catch (_) {}
    };

    run();
  }, []);

  // Handle reset V trigger
  useEffect(() => {
    if (resetVTrigger === 0) return;
    
    // Get the AMP_V_INIT value
    const AMP_V_INIT = (window as any).AMP_V_INIT || 115;
    const $ = (window as any).jQuery || require("jquery");
    
    if (!$) return;
    
    // Set balanced three-phase voltage values
    $("#Amp_A").val(AMP_V_INIT);
    $("#Amp_B").val(AMP_V_INIT);
    $("#Amp_C").val(AMP_V_INIT);
    $("#Angle_A").val(0);
    $("#Angle_B").val(-120);
    $("#Angle_C").val(120);
    
    // Reset symmetric components
    $("#Amp_0").val(0);
    $("#Amp_1").val(AMP_V_INIT);
    $("#Amp_2").val(0);
    $("#Angle_0").val(0);
    $("#Angle_1").val(0);
    $("#Angle_2").val(0);
    
    // Trigger change events to update the UI
    $("#Amp_A").trigger("change");
    $("#Amp_B").trigger("change");
    $("#Amp_C").trigger("change");
    $("#Angle_A").trigger("change");
    $("#Angle_B").trigger("change");
    $("#Angle_C").trigger("change");
    
    // Dispatch custom event for full update
    setTimeout(() => {
      const win = window as any;
      if (win.performUpdateCycle) {
        win.performUpdateCycle();
      } else if (win.recordAndUpdate) {
        win.recordAndUpdate();
      }
    }, 50);
  }, [resetVTrigger]);

  // Handle reset I trigger
  useEffect(() => {
    if (resetITrigger === 0) return;
    
    const AMP_I_INIT = (window as any).AMP_I_INIT || 5;
    const $ = (window as any).jQuery || require("jquery");
    
    if (!$) return;
    
    // Set balanced three-phase current values
    $("#Amp_A_I").val(AMP_I_INIT);
    $("#Amp_B_I").val(AMP_I_INIT);
    $("#Amp_C_I").val(AMP_I_INIT);
    $("#Angle_A_I").val(0);
    $("#Angle_B_I").val(-120);
    $("#Angle_C_I").val(120);
    
    // Reset symmetric components
    $("#Amp_0_I").val(0);
    $("#Amp_1_I").val(AMP_I_INIT);
    $("#Amp_2_I").val(0);
    $("#Angle_0_I").val(0);
    $("#Angle_1_I").val(0);
    $("#Angle_2_I").val(0);
    
    // Trigger change events
    $("#Amp_A_I").trigger("change");
    $("#Amp_B_I").trigger("change");
    $("#Amp_C_I").trigger("change");
    $("#Angle_A_I").trigger("change");
    $("#Angle_B_I").trigger("change");
    $("#Angle_C_I").trigger("change");
    
    setTimeout(() => {
      const win = window as any;
      if (win.performUpdateCycle) {
        win.performUpdateCycle();
      } else if (win.recordAndUpdate) {
        win.recordAndUpdate();
      }
    }, 50);
  }, [resetITrigger]);

  if (!d3.selection.prototype.nodes) {
    d3.selection.prototype.nodes = function () {
      var out: any[] = [];
      this.each(() => {
        out.push(this);
      }); // â€˜thisâ€™ === DOM node
      return out;
    };
  }

  useEffect(() => {
    const $ = require("jquery");
    (window as any).$ = (window as any).jQuery = $;

    let quadBase: { L: number; R: number } | null = null;

    const applyQuadLinkage = (fValue: number) => {
      const lEl = document.getElementById("reachLeft") as HTMLInputElement;
      const rEl = document.getElementById("reachRight") as HTMLInputElement;
      if (!lEl || !rEl) return;
      if (!quadBase) quadBase = { L: +lEl.value || 0, R: +rEl.value || 0 };
      const k = 0.4 + 0.6 * fValue;
      const L = (quadBase.L * k).toFixed(3);
      const R = (quadBase.R * k).toFixed(3);
      if (lEl.value !== L) {
        lEl.value = L;
        lEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (rEl.value !== R) {
        rEl.value = R;
        rEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    const restoreQuadIfLinked = () => {
      if (!quadBase) return;
      const lEl = document.getElementById("reachLeft") as HTMLInputElement;
      const rEl = document.getElementById("reachRight") as HTMLInputElement;
      if (!lEl || !rEl) return;
      const L = quadBase.L.toFixed(3),
        R = quadBase.R.toFixed(3);
      if (lEl.value !== L) {
        lEl.value = L;
        lEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (rEl.value !== R) {
        rEl.value = R;
        rEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
      quadBase = null;
    };

    // Title migration
    (function migrateTitles() {
      const nodes = document.querySelectorAll("[title]");
      nodes.forEach((el: Element) => {
        // Skip titles inside <svg> so the D3 SVG tooltip can auto-bind them
        if (el.closest("svg")) return;

        const txt = el.getAttribute("title");
        if (!txt) return;
        if (!el.hasAttribute("data-tooltip"))
          el.setAttribute("data-tooltip", txt);
        el.removeAttribute("title");
      });
    })();

    // Theme/Density/Tooltip initialization
    (() => {
      const root = document.documentElement;
      const get = (k: string) => localStorage.getItem(k);
      const set = (k: string, v: string) => localStorage.setItem(k, v);

      const initTheme =
        get("ui-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const initDensity = get("ui-density") || "comfortable";
      const initTooltips = get("ui-tooltips") || "on";
      root.dataset.theme = initTheme;
      root.dataset.density = initDensity;
      root.dataset.tooltips = initTooltips;

      const themeToggle = document.getElementById(
        "themeToggle",
      ) as HTMLInputElement;
      const densityToggle = document.getElementById(
        "densityToggle",
      ) as HTMLInputElement;
      const tooltipToggle = document.getElementById(
        "tooltipToggle",
      ) as HTMLInputElement;

      if (themeToggle) {
        themeToggle.checked = initTheme === "dark";
        if (initTheme === "dark") root.classList.add("dark");
        themeToggle.addEventListener("change", (e) => {
          const isDark = (e.target as HTMLInputElement).checked;
          root.dataset.theme = isDark ? "dark" : "light";
          root.classList.toggle("dark", isDark);
          set("ui-theme", root.dataset.theme || "light");
        });
      }

      if (densityToggle) {
        densityToggle.checked = initDensity === "dense";
        densityToggle.addEventListener("change", (e) => {
          root.dataset.density = (e.target as HTMLInputElement).checked
            ? "dense"
            : "comfortable";
          set("ui-density", root.dataset.density || "comfortable");
        });
      }

      if (tooltipToggle) {
        tooltipToggle.checked = initTooltips !== "off";
        tooltipToggle.addEventListener("change", (e) => {
          root.dataset.tooltips = (e.target as HTMLInputElement).checked
            ? "on"
            : "off";
          set("ui-tooltips", root.dataset.tooltips || "on");
          if (!(e.target as HTMLInputElement).checked) {
            // Close any open simple tooltips
            try {
              document
                .querySelectorAll('[data-tooltip][data-open="true"]')
                .forEach((el) => el.setAttribute("data-open", "false"));
            } catch {}
            // Hide any rich/SVG tooltips currently shown
            try {
              document
                .querySelectorAll(".tooltip-d3,.tooltip-rich,.svg-phase-panel")
                .forEach((el) => {
                  if ((el as HTMLElement).dataset)
                    (el as HTMLElement).dataset.show = "false";
                });
            } catch {}
          }
        });
      }
    })();

    // --- App State ---
    let editSource: string | null = null;
    let isDragging = false;
    let currentMarkerType = "arrow"; // Keep var for legacy usage
    const units = { mode: "SEC" }; // "SEC" | "PRI"
    let mode = "MHO";
    let lastDisplayMode = units.mode;

    (window as any).currentMarkerType = currentMarkerType;
    (window as any).isDragging = isDragging;
    (window as any).editSource = editSource;

    // --- Drawing + Engineering Units ---
    let w = 400,
      h = w,
      small_w = w / 3 - 5,
      small_h = small_w;
    (window as any).w = w;
    (window as any).h = h;
    let domainFactor = 1.1;
    const svgPadding = 0;
    const VIEWBOX_V = [w, h];
    const TARGET_VEC = 140;
    let p0x = w / 2,
      p0y = h / 2;
    const ORIGIN = [w / 2, h / 2];

    let AMP_I_INIT = 5,
      AMP_V_INIT = 115;
    let AMP_Z_INIT = AMP_V_INIT / AMP_I_INIT;
    function pxFromAmp(I: number) {
      return I * (PIX_PER_AMP_I as number);
    }
    function ampFromPx(px: number) {
      return px / (PIX_PER_AMP_I as number);
    }

    const pxI = (amp: number) => amp * (PIX_PER_AMP_I as number);
    const ampI = (px: number) => px / (PIX_PER_AMP_I as number);

    // --- Math Helpers ---
    const DEG2RAD = Math.PI / 180,
      RAD2DEG = 180 / Math.PI;
    const rad = (d: number) => d * DEG2RAD;

    const C = (re: number, im: number) => ({ re, im });
    const abs = (z: { re: number; im: number }) => Math.hypot(z.re, z.im);
    const polar = (mag: number, deg: number) =>
      C(mag * Math.cos(deg * DEG2RAD), mag * Math.sin(deg * DEG2RAD));
    const add = (
      a: { re: number; im: number },
      b: { re: number; im: number },
    ) => C(a.re + b.re, a.im + b.im);
    const sub = (
      a: { re: number; im: number },
      b: { re: number; im: number },
    ) => C(a.re - b.re, a.im - b.im);
    const mul = (
      a: { re: number; im: number },
      b: { re: number; im: number },
    ) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
    const div = (
      a: { re: number; im: number },
      b: { re: number; im: number },
    ) => {
      const d = b.re * b.re + b.im * b.im;
      return C(
        (a.re * b.re + a.im * b.im) / d,
        (a.im * b.re - a.re * b.im) / d,
      );
    };

    const phasor = (amp: number, deg: number) => [
      amp * Math.cos(rad(deg)),
      amp * Math.sin(rad(deg)),
    ];

    // patch drag to also sync the inputs
    const drag = d3
      .drag()
      .on("start", function (event: any, d: any) {
        isDragging = true;
        (window as any).isDragging = true;
        History.begin("drag", {
          cls: (this as any).classList?.[0] || "unknown",
        });
        (this as any).__origin__ = (d as any).slice(); // keep head in pixels
      })
      .on("drag", function (event: any, d: any) {
        const cls = [...(this as any).classList][0] || "unknown";

        // Free motion: follow the pointer even outside the SVG
        (this as any).__origin__[0] += event.dx;
        (this as any).__origin__[1] += event.dy;
        const x = (this as any).__origin__[0];
        const y = (this as any).__origin__[1];

        // If we are outside the plot, expand the domain instantly (no animations)
        maybeExpandWhileDragging(cls, x, y);

        // Write back the head; the instant axis growth keeps it under the cursor
        d[0] = x;
        d[1] = y;

        // Reflect into inputs (amps/angles) and recompute
        syncInputsFromDrag(this, x, y);
        rafUpdate();
      })
      .on("end", function () {
        delete (this as any).__origin__;
        recordAndUpdate(); // final precise render
        History.commit();
        isDragging = false;
        (window as any).isDragging = false;
      });

    // --- Complex/Vector Utilities (Array form, legacy-compatible) ---
    const polyline = function (d: number[][]) {
      return d.map((x) => x.join(",")).join(" ");
    };
    const dist = function (v: number[]) {
      let x = v[0] - p0x;
      let y = v[1] - p0y;
      return Math.hypot(x, y);
    };
    const angle = function (v: number[]) {
      return (Math.atan2(v[1], v[0]) * 180) / Math.PI;
    };
    const comp_MulX = function (u: number[], v: number[]) {
      return u[0] * v[0] - u[1] * v[1];
    };
    const comp_MulY = function (u: number[], v: number[]) {
      return u[1] * v[0] + u[0] * v[1];
    };
    const conjugate = function (u: number[]) {
      return [u[0], -u[1]];
    };

    const Zmul = function (u: number[], v: number[]) {
      return [u[0] * v[0] - u[1] * v[1], u[1] * v[0] + u[0] * v[1]];
    };
    const Zmulscal = function (u: number, v: number[]) {
      return [u * v[0], u * v[1]];
    };
    const Zadd = function (u: number[], v: number[]) {
      return [u[0] + v[0], u[1] + v[1]];
    };
    const Zaddscal = function (u: number, v: number[]) {
      return [u + v[0], v[1]];
    };
    const Zsub = function (u: number[], v: number[]) {
      return [u[0] - v[0], u[1] - v[1]];
    };
    const Zinv = function (u: number[]) {
      let d = u[0] * u[0] + u[1] * u[1];
      return [u[0] / d, -u[1] / d];
    };
    const Zabs = function (u: number[]) {
      return Math.sqrt(u[0] * u[0] + u[1] * u[1]);
    };
    const Zpara = function (u: number[], v: number[]) {
      return Zinv(Zadd(Zinv(u), Zinv(v)));
    };

    class Complex {
      re: number;
      im: number;
      constructor(re = 0, im = 0) {
        if (Array.isArray(re)) [re, im] = re;
        this.re = +re;
        this.im = +im;
      }
      static add(u: number | number[], v: number | number[]): number[] {
        const ux = Array.isArray(u) ? u : [u, 0];
        const vx = Array.isArray(v) ? v : [v, 0];
        return [ux[0] + vx[0], ux[1] + vx[1]];
      }
      static mul(u: number | number[], v: number | number[]): number[] {
        const ux = Array.isArray(u) ? u : [u, 0];
        const vx = Array.isArray(v) ? v : [v, 0];
        return [ux[0] * vx[0] - ux[1] * vx[1], ux[1] * vx[0] + ux[0] * vx[1]];
      }
    }

    const one = [1, 0];
    const a = [-1 / 2, Math.sqrt(3) / 2];
    const a2 = [-1 / 2, -Math.sqrt(3) / 2];

    const m = [
      [one, one, one],
      [one, a2, a],
      [one, a, a2],
    ];

    const m_ = [
      [one, one, one],
      [one, a, a2],
      [one, a2, a],
    ];

    const m_inv = [
      [Zmulscal(1 / 3, one), Zmulscal(1 / 3, one), Zmulscal(1 / 3, one)],
      [Zmulscal(1 / 3, one), Zmulscal(1 / 3, a), Zmulscal(1 / 3, a2)],
      [Zmulscal(1 / 3, one), Zmulscal(1 / 3, a2), Zmulscal(1 / 3, a)],
    ];

    // Minimal matrix-vector multiply for array-based complex vectors
    function M_V(m: number[][], v: number[]) {
      return m.map((row) =>
        row
          .map((coef, i) =>
            Complex.add(
              [0, 0] as number[],
              Complex.mul(coef, v[i]) as number[],
            ),
          )
          .reduce((a, b) => Complex.add(a, b), [0, 0] as number[]),
      );
    }
    function M_V_(m_: number[][], v: number[]) {
      return m_.map((row) =>
        Complex.mul(
          [1 / 3, 0] as number[],
          row
            .map((coef, i) => Complex.mul(coef, v[i]) as number[])
            .reduce((a, b) => Complex.add(a, b), [0, 0] as number[]),
        ),
      );
    }

    const toScreenXY = ([re, im]: number[], [ox, oy]: number[] = ORIGIN) => [
      ox + re,
      oy - im,
    ];
    const fromScreenXY = ([x, y]: number[], [ox, oy]: number[] = ORIGIN) => [
      x - ox,
      -(y - oy),
    ];
    const toScreenAll = (arr: number[][], origin = ORIGIN) =>
      arr.map((v) => toScreenXY(v, origin));

    // D3.js SVG initialization
    const vis_inner_Z = d3
      .select("#vis_inner_Z_svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("border", "1px solid SteelBlue")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,.15)")
      .append("g")
      .attr("class", "vis_inner_Z_svg_g");
    (window as any).vis_inner_Z = vis_inner_Z;

    const vis_inner_I = d3
      .select("#vis_inner_I_svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("border", "1px solid SteelBlue")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,.15)")
      .append("g")
      .attr("class", "vis_inner_I_svg_g");
    (window as any).vis_inner_I = vis_inner_I;

    const vis_inner_V = d3
      .select("#vis_inner_V_svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("border", "1px solid SteelBlue")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,.15)")
      .append("g")
      .attr("class", "vis_inner_V_svg_g");
    (window as any).vis_inner_V = vis_inner_V;

    const svgAxis_I = d3.select("#vis_inner_I_svg") as any;
    const viewport_I = svgAxis_I.select("g.vis_inner_I_svg_g") as any;
    viewport_I.attr("id", "viewport_I");
    const axisLayer_I = svgAxis_I
      .insert("g", "g#viewport_I")
      .attr("id", "axisLayer_I") as any;

    // 2. initial scales
    let domain_I = [-AMP_I_INIT * domainFactor, AMP_I_INIT * domainFactor];
    const xScale_I = d3
      .scaleLinear()
      .domain(domain_I)
      .range([0, p0x * 2 - svgPadding]);
    const yScale_I = d3
      .scaleLinear()
      .domain(domain_I)
      .range([p0y * 2 - svgPadding, 0]);

    const xAxis_I = d3
      .axisBottom(xScale_I)
      .ticks(5)
      .tickSize(-5)
      .tickPadding(8);
    const yAxis_I = d3
      .axisLeft(yScale_I)
      .ticks(5)
      .tickSize(-5)
      .tickPadding(8)
      .tickFormat((d: any) => (d === 0 ? "" : d));

    const xCenter_I = p0x;
    const yCenter_I = p0y;

    axisLayer_I
      .append("g")
      .attr("class", "x-axis_I")
      .attr("transform", `translate(${svgPadding / 2},${xCenter_I})`)
      .call(xAxis_I)
      .selectAll("text")
      .style("font-size", "10px");

    axisLayer_I
      .append("g")
      .attr("class", "y-axis_I")
      .attr("transform", `translate(${yCenter_I},${svgPadding / 2})`)
      .call(yAxis_I)
      .selectAll("text")
      .style("font-size", "10px");

    d3.selectAll(
      ".y-axis_I path, .x-axis_I path, .y-axis_I line, .x-axis_I line",
    )
      .style("stroke", "#666")
      .style("stroke-width", 2)
      .style("fill", "none");

    let SCALE_I = xScale_I(1) - xScale_I(0);
    let PIX_PER_AMP_I: number = SCALE_I;

    const svgAxis_V = d3.select("#vis_inner_V_svg") as any;
    const viewport_V = svgAxis_V.select("g.vis_inner_V_svg_g") as any;
    viewport_V.attr("id", "viewport_V");
    const axisLayer_V = svgAxis_V
      .insert("g", "g#viewport_V")
      .attr("id", "axisLayer_V") as any;

    // 2. initial scales
    let domain_V = [-AMP_V_INIT * 1.1, AMP_V_INIT * 1.1];
    const xScale_V = d3
      .scaleLinear()
      .domain(domain_V)
      .range([0, p0x * 2 - svgPadding]);
    const yScale_V = d3
      .scaleLinear()
      .domain(domain_V)
      .range([p0y * 2 - svgPadding, 0]);

    const xAxis_V = d3
      .axisBottom(xScale_V)
      .ticks(5)
      .tickSize(-5)
      .tickPadding(8);
    const yAxis_V = d3
      .axisLeft(yScale_V)
      .ticks(5)
      .tickSize(-10)
      .tickPadding(8)
      .tickFormat((d: any) => (d === 0 ? "" : d));

    const xCenter_V = yScale_V(0) + svgPadding / 2;
    const yCenter_V = xScale_V(0) + svgPadding / 2;

    axisLayer_V
      .append("g")
      .attr("class", "x-axis_V")
      .attr("transform", `translate(${svgPadding / 2},${xCenter_V})`)
      .call(xAxis_V)
      .selectAll("text")
      .style("font-size", "10px");

    axisLayer_V
      .append("g")
      .attr("class", "y-axis_V")
      .attr("transform", `translate(${yCenter_V},${svgPadding / 2})`)
      .call(yAxis_V)
      .selectAll("text")
      .style("font-size", "10px");

    d3.selectAll(
      ".y-axis_V path, .x-axis_V path, .y-axis_V line, .x-axis_V line",
    )
      .style("stroke", "#666")
      .style("stroke-width", 2)
      .style("fill", "none");

    let SCALE_V = xScale_V(1) - xScale_V(0);
    let PIX_PER_AMP_V: number = SCALE_V;

    // --- Z Axis Setup ---
    const svgAxis_Z = d3.select("#vis_inner_Z_svg") as any;
    const viewport_Z = svgAxis_Z.select("g.vis_inner_Z_svg_g") as any;
    viewport_Z.attr("id", "viewport_Z");
    const axisLayer_Z = svgAxis_Z
      .insert("g", "g#viewport_Z")
      .attr("id", "axisLayer_Z") as any;

    const domain_Z = [-AMP_Z_INIT * domainFactor, AMP_Z_INIT * domainFactor];
    const xScale_Z = d3
      .scaleLinear()
      .domain(domain_Z)
      .range([0, p0x * 2 - svgPadding]);
    const yScale_Z = d3
      .scaleLinear()
      .domain(domain_Z)
      .range([p0y * 2 - svgPadding, 0]);

    const xAxis_Z = d3
      .axisBottom(xScale_Z)
      .ticks(5)
      .tickSize(-5)
      .tickPadding(8);
    const yAxis_Z = d3
      .axisLeft(yScale_Z)
      .ticks(5)
      .tickSize(-5)
      .tickPadding(8)
      .tickFormat((d: any) => (d === 0 ? "" : d));

    const xCenter_Z = yScale_Z(0) + svgPadding / 2;
    const yCenter_Z = xScale_Z(0) + svgPadding / 2;

    axisLayer_Z
      .append("g")
      .attr("class", "x-axis_Z")
      .attr("transform", `translate(${svgPadding / 2},${xCenter_Z})`)
      .call(xAxis_Z)
      .selectAll("text")
      .style("font-size", "10px");

    axisLayer_Z
      .append("g")
      .attr("class", "y-axis_Z")
      .attr("transform", `translate(${yCenter_Z},${svgPadding / 2})`)
      .call(yAxis_Z)
      .selectAll("text")
      .style("font-size", "10px");

    let SCALE_Z = xScale_Z(1) - xScale_Z(0);
    let PIX_PER_AMP_Z = SCALE_Z;

    // --- KN Axis Setup ---
    // Note: The HTML for this must replace the #KN_svg if it exists or be added.
    // main.js expects .vis_KN_svg
    const svgAxis_KN = d3
      .select(".vis_KN_svg")
      .attr("viewBox", `0 0 ${w / 2} ${h / 2}`)
      .attr("preserveAspectRatio", "xMidYMid meet") as any;
    let vis_KN = svgAxis_KN.select("g.vis_KN_svg_g") as any;
    if (vis_KN.empty()) {
      vis_KN = svgAxis_KN.append("g").attr("class", "vis_KN_svg_g") as any;
    }
    (window as any).vis_KN = vis_KN;

    // Default KN scale from main.js logic (approx)
    const w_KN_inner = (window as any).w_KN || w / 2;
    const h_KN_inner = (window as any).h_KN || h / 2;
    const p0_KNx_inner = w_KN_inner / 2;
    const p0_KNy_inner = h_KN_inner / 2;

    // Assign to window for global access if needed, or use local
    (window as any).w_KN = w_KN_inner;
    (window as any).h_KN = h_KN_inner;
    (window as any).p0_KNx = p0_KNx_inner;
    (window as any).p0_KNy = p0_KNy_inner;
    (window as any).svgAxis_KN = svgAxis_KN;

    const domain_KN = [-2, 2]; // KN is usually small (compensation factor ~1)
    const xScale_KN = d3.scaleLinear().domain(domain_KN).range([0, w_KN_inner]);
    const yScale_KN = d3.scaleLinear().domain(domain_KN).range([h_KN_inner, 0]);

    const xAxis_KN = d3.axisBottom(xScale_KN).ticks(5).tickSize(-3);
    const yAxis_KN = d3.axisLeft(yScale_KN).ticks(5).tickSize(-3);

    const xCenter_KN = yScale_KN(0);
    const yCenter_KN = xScale_KN(0);

    // Axis layer for KN
    let axisLayer_KN = svgAxis_KN.select(".axisLayer_KN");
    if (axisLayer_KN.empty())
      axisLayer_KN = svgAxis_KN
        .insert("g", "g.vis_KN_svg_g")
        .attr("class", "axisLayer_KN") as any;

    axisLayer_KN
      .append("g")
      .attr("class", "x-axis_KN")
      .attr("transform", `translate(0,${xCenter_KN})`)
      .call(xAxis_KN);
    axisLayer_KN
      .append("g")
      .attr("class", "y-axis_KN")
      .attr("transform", `translate(${yCenter_KN},0)`)
      .call(yAxis_KN);

    // Style KN axes
    d3.selectAll(
      ".y-axis_KN path, .x-axis_KN path, .y-axis_KN line, .x-axis_KN line",
    )
      .style("stroke", "#888")
      .style("stroke-width", 1)
      .style("fill", "none");

    let SCALE_KN = xScale_KN(1) - xScale_KN(0);
    let PIX_PER_AMP_KN = SCALE_KN;

    // --- Helpers for Origin ---
    const originV = () => [p0x, p0y];
    const originI = () => [p0x, p0y]; // Same origin
    const originZ = () => [p0x, p0y]; // Same origin

    // --- Geometry/Visual State ---
    let p = 50;
    let wbis = w,
      hbis = (4 * h) / 5 + 60;
    let tx = (400 + 40) / 2,
      textx = tx,
      texty = 20;
    let ta = 86,
      tb = ta + 40,
      tc = tb + 40,
      td = 30,
      tdd = td + 55;
    (window as any).data_id_ZA_ZB_ZC_1 = [
      ["za_before", "equala_Z", "ampza", "angza"],
    ];
    (window as any).data_id_ZA_ZB_ZC_2 = [
      ["zb_before", "equalb_Z", "ampzb", "angzb"],
    ];
    (window as any).data_id_ZA_ZB_ZC_3 = [
      ["zc_before", "equalc_Z", "ampzc", "angzc"],
    ];
    (window as any).data_id_ZAB_ZBC_ZCA_1 = [
      ["zab_before", "equalab_Z", "ampzab", "angzab"],
    ];
    (window as any).data_id_ZAB_ZBC_ZCA_2 = [
      ["zbc_before", "equalbc_Z", "ampzbc", "angzbc"],
    ];
    (window as any).data_id_ZAB_ZBC_ZCA_3 = [
      ["zca_before", "equalca_Z", "ampzca", "angzca"],
    ];
    let ta_I = 86,
      tb_I = ta_I + 40,
      tc_I = tb_I + 40,
      td_I = 30,
      tdd_I = td_I + 55;
    let keyc = false;

    let mag_V = xScale_V(AMP_V_INIT) - p0x,
      mag_I = xScale_I(AMP_I_INIT) - p0x - svgPadding / 2,
      mag_KN = 0;
    const w_KN = w / 2,
      h_KN = h / 2;
    let p0_KNx = w / 4,
      p0_KNy = h / 4;

    let p0 = [p0x, p0y];

    const Vvec0 = [mag_V, 0];
    let va = toScreenXY(Vvec0, p0);
    let vb = toScreenXY(Zmul(Vvec0, a2), p0);
    let vc = toScreenXY(Vvec0, p0); // default vc initialization
    try {
      vc = toScreenXY(Zmul(Vvec0, a), p0);
    } catch (e) {
      /* ignore if a is somehow not ready */
    }
    let psa = [va],
      psb = [vb],
      psc = [vc];

    let p0_I = [p0x, p0y];
    const Ivec0 = [mag_I, 0];
    let ia = toScreenXY(Ivec0, p0_I);
    let ib = toScreenXY(Zmul(Ivec0, a2), p0_I);
    let ic = toScreenXY(Zmul(Ivec0, a), p0_I);
    let psa_I = [ia],
      psb_I = [ib],
      psc_I = [ic];

    let Three_ph = false,
      Three_ph_I = false,
      is_CT_1A = false,
      is_CT_5A = true,
      Amp_0_value = 0,
      Amp_0_value_I = 0,
      Angle_0_value = 0,
      Angle_0_value_I = 0,
      Amp_1_value = 115,
      Angle_1_value = 0,
      Amp_1_value_I = 5,
      Angle_1_value_I = 0,
      Amp_2_value = 0,
      Angle_2_value = 0,
      Amp_2_value_I = 0,
      Angle_2_value_I = 0,
      Amp_A_value = 115,
      Angle_A_value = 0,
      Amp_A_value_I = 5,
      Angle_A_value_I = 0,
      Amp_B_value = 115,
      Angle_B_value = -120,
      Amp_B_value_I = 5,
      Angle_B_value_I = -120,
      Amp_C_value = 115,
      Angle_C_value = 120,
      Amp_C_value_I = 5,
      Angle_C_value_I = 120,
      Ph2Ph = false;

    // Export to window for compatibility
    (window as any).va = va;
    (window as any).vb = vb;
    (window as any).vc = vc;
    (window as any).psa = psa;
    (window as any).psb = psb;
    (window as any).psc = psc;
    (window as any).ia = ia;
    (window as any).ib = ib;
    (window as any).ic = ic;
    (window as any).psa_I = psa_I;
    (window as any).psb_I = psb_I;
    (window as any).psc_I = psc_I;
    (window as any).Three_ph = Three_ph;
    (window as any).Three_ph_I = Three_ph_I;
    (window as any).is_CT_1A = is_CT_1A;
    (window as any).is_CT_5A = is_CT_5A;
    (window as any).Amp_0_value = Amp_0_value;
    (window as any).Amp_0_value_I = Amp_0_value_I;
    (window as any).Angle_0_value = Angle_0_value;
    (window as any).Angle_0_value_I = Angle_0_value_I;
    (window as any).Amp_1_value = Amp_1_value;
    (window as any).Angle_1_value = Angle_1_value;
    (window as any).Amp_1_value_I = Amp_1_value_I;
    (window as any).Angle_1_value_I = Angle_1_value_I;
    (window as any).Amp_2_value = Amp_2_value;
    (window as any).Angle_2_value = Angle_2_value;
    (window as any).Amp_2_value_I = Amp_2_value_I;
    (window as any).Angle_2_value_I = Angle_2_value_I;
    (window as any).Amp_A_value = Amp_A_value;
    (window as any).Angle_A_value = Angle_A_value;
    (window as any).Amp_A_value_I = Amp_A_value_I;
    (window as any).Angle_A_value_I = Angle_A_value_I;
    (window as any).Amp_B_value = Amp_B_value;
    (window as any).Angle_B_value = Angle_B_value;
    (window as any).Amp_B_value_I = Amp_B_value_I;
    (window as any).Angle_B_value_I = Angle_B_value_I;
    (window as any).Amp_C_value = Amp_C_value;
    (window as any).Angle_C_value = Angle_C_value;
    (window as any).Amp_C_value_I = Amp_C_value_I;
    (window as any).Angle_C_value_I = Angle_C_value_I;
    (window as any).Ph2Ph = Ph2Ph;
    (window as any).fact_1A = 1;

    (window as any).originV = () => [xScale_V(0), yScale_V(0)];
    (window as any).originI = () => [xScale_I(0), yScale_I(0)];
    (window as any).originZ = () => [xScale_Z(0), yScale_Z(0)];

    (window as any).xScale_V = xScale_V;
    (window as any).yScale_V = yScale_V;
    (window as any).xScale_I = xScale_I;
    (window as any).yScale_I = yScale_I;
    (window as any).xScale_K = (window as any).xScale_KN = xScale_KN;
    (window as any).yScale_K = (window as any).yScale_KN = yScale_KN;
    (window as any).xScale_Z = xScale_Z;
    (window as any).yScale_Z = yScale_Z;
    (window as any).p0_KNx = p0_KNx;
    (window as any).p0_KNy = p0_KNy;
    (window as any).ps_KN = [[p0_KNx, p0_KNy]];
    (window as any).data_Z = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    (window as any).PIX_PER_AMP_Z = PIX_PER_AMP_Z;

    // Initialize global buffer variables used in computePhaseVectors.js
    (window as any).za = (window as any).zb = (window as any).zc = [0, 0];
    (window as any).zab = (window as any).zbc = (window as any).zca = [0, 0];
    (window as any).p0_Z = [0, 0];
    (window as any).za_conjugate =
      (window as any).zb_conjugate =
      (window as any).zc_conjugate =
        [0, 0];
    (window as any).zab_conjugate =
      (window as any).zbc_conjugate =
      (window as any).zca_conjugate =
        [0, 0];
    (window as any).psa_Z =
      (window as any).psb_Z =
      (window as any).psc_Z =
        [[0, 0]];
    (window as any).psab_Z =
      (window as any).psbc_Z =
      (window as any).psca_Z =
        [[0, 0]];
    (window as any).ps_Z_line =
      (window as any).ps_Z1_line =
      (window as any).ps_Z2_line =
      (window as any).ps_Z3_line =
        [[0, 0]];
    (window as any).veca_Z =
      (window as any).vecb_Z =
      (window as any).vecc_Z =
        { re: 0, im: 0 };
    (window as any).vecab_Z =
      (window as any).vecbc_Z =
      (window as any).vecca_Z =
        { re: 0, im: 0 };
    (window as any).ampa_Z =
      (window as any).ampb_Z =
      (window as any).ampc_Z =
        0;
    (window as any).anglea_Z =
      (window as any).angleb_Z =
      (window as any).anglec_Z =
        0;
    (window as any).ampab_Z =
      (window as any).ampbc_Z =
      (window as any).ampca_Z =
        0;
    (window as any).angleab_Z =
      (window as any).anglebc_Z =
      (window as any).angleca_Z =
        0;
    (window as any).IN = (window as any).KN = [0, 0];
    (window as any).check_trip =
      (window as any).check_trip2 =
      (window as any).check_trip3 =
        false;

    // Export Vector/Text placeholders to window
    (window as any).vectora =
      (window as any).vectorb =
      (window as any).vectorc =
        undefined;
    (window as any).vector0 =
      (window as any).vector1 =
      (window as any).vector2 =
        undefined;
    (window as any).vector0bis =
      (window as any).vector1bis =
      (window as any).vector2bis =
        undefined;
    (window as any).texta =
      (window as any).textb =
      (window as any).textc =
        undefined;
    (window as any).textadash =
      (window as any).textbdash =
      (window as any).textcdash =
        undefined;
    (window as any).textadashangle =
      (window as any).textbdashangle =
      (window as any).textcdashangle =
        undefined;
    (window as any).text0butt = (window as any).text0buttangle = undefined;
    (window as any).text1butt = (window as any).text1buttangle = undefined;
    (window as any).text2butt = (window as any).text2buttangle = undefined;
    (window as any).textdecova = (window as any).equala = undefined;
    (window as any).textdecovb = (window as any).equalb = undefined;
    (window as any).textdecovc = (window as any).equalc = undefined;
    (window as any).textdecov0 = (window as any).equal0 = undefined;
    (window as any).textdecov1 = (window as any).equal1 = undefined;
    (window as any).textdecov2 = (window as any).equal2 = undefined;

    (window as any).vectorab =
      (window as any).vectorbc =
      (window as any).vectorca =
      (window as any).vector_KN =
        undefined;
    (window as any).vectora_I =
      (window as any).vectorb_I =
      (window as any).vectorc_I =
        undefined;
    (window as any).vector0_I =
      (window as any).vector1_I =
      (window as any).vector2_I =
        undefined;
    (window as any).vector0bis_I =
      (window as any).vector1bis_I =
      (window as any).vector2bis_I =
        undefined;
    (window as any).texta_I =
      (window as any).textb_I =
      (window as any).textc_I =
        undefined;
    (window as any).textadash_I =
      (window as any).textbdash_I =
      (window as any).textcdash_I =
        undefined;
    (window as any).textadashangle_I =
      (window as any).textbdashangle_I =
      (window as any).textcdashangle_I =
        undefined;
    (window as any).text0butt_I = (window as any).text0buttangle_I = undefined;
    (window as any).text1butt_I = (window as any).text1buttangle_I = undefined;
    (window as any).text2butt_I = (window as any).text2buttangle_I = undefined;
    (window as any).textdecova_I = (window as any).equala_I = undefined;
    (window as any).textdecovb_I = (window as any).equalb_I = undefined;
    (window as any).textdecovc_I = (window as any).equalc_I = undefined;
    (window as any).textdecov0_I = (window as any).equal0_I = undefined;
    (window as any).textdecov1_I = (window as any).equal1_I = undefined;
    (window as any).textdecov2_I = (window as any).equal2_I = undefined;
    (window as any).vectorab_I =
      (window as any).vectorbc_I =
      (window as any).vectorca_I =
        undefined;

    (window as any).vectora_Z =
      (window as any).vectorb_Z =
      (window as any).vectorc_Z =
        undefined;
    (window as any).vectorab_Z =
      (window as any).vectorbc_Z =
      (window as any).vectorca_Z =
        undefined;
    (window as any).vector_Z_Line =
      (window as any).vector_Z1_Line =
      (window as any).vector_Z2_Line =
      (window as any).vector_Z3_Line =
        undefined;
    (window as any).texta_Z =
      (window as any).textb_Z =
      (window as any).textc_Z =
        undefined;
    (window as any).textab_Z =
      (window as any).textbc_Z =
      (window as any).textca_Z =
        undefined;
    (window as any).textadash_Z =
      (window as any).textbdash_Z =
      (window as any).textcdash_Z =
        undefined;
    (window as any).textadashangle_Z =
      (window as any).textbdashangle_Z =
      (window as any).textcdashangle_Z =
        undefined;
    (window as any).textabdash_Z =
      (window as any).textbcdash_Z =
      (window as any).textcadash_Z =
        undefined;
    (window as any).textabdashangle_Z =
      (window as any).textbcdashangle_Z =
      (window as any).textcadashangle_Z =
        undefined;
    (window as any).text0butt_Z = (window as any).text0buttangle_Z = undefined;
    (window as any).text1butt_Z = (window as any).text1buttangle_Z = undefined;
    (window as any).text2butt_Z = (window as any).text2buttangle_Z = undefined;
    (window as any).textdecova_Z = (window as any).equala_Z = undefined;
    (window as any).textdecovb_Z = (window as any).equalb_Z = undefined;
    (window as any).textdecovc_Z = (window as any).equalc_Z = undefined;
    (window as any).textdecovab_Z = (window as any).equalab_Z = undefined;
    (window as any).textdecovbc_Z = (window as any).equalbc_Z = undefined;
    (window as any).textdecovca_Z = (window as any).equalca_Z = undefined;
    (window as any).textdecov0_Z = (window as any).equal0_Z = undefined;
    (window as any).textdecov1_Z = (window as any).equal1_Z = undefined;
    (window as any).textdecov2_Z = (window as any).equal2_Z = undefined;

    (window as any).fontSize = 12;
    (window as any).p0_I = p0_I;
    (window as any).data =
      (window as any).data1 =
      (window as any).data2 =
        undefined;
    (window as any).data_I =
      (window as any).data1_I =
      (window as any).data2_I =
        undefined;

    (window as any).ORIGIN = ORIGIN;
    (window as any).polyline = polyline;
    (window as any).zoomLayer = (window as any).vis_inner_Z = vis_inner_Z;
    (window as any).vis_inner_V = vis_inner_V;
    (window as any).vis_inner_I = vis_inner_I;
    (window as any).vis_inner_Z = vis_inner_Z;
    (window as any).vis_KN = vis_KN;

    (window as any).PIX_PER_AMP_V = PIX_PER_AMP_V;
    (window as any).PIX_PER_AMP_I = PIX_PER_AMP_I;
    (window as any).AMP_V_INIT = AMP_V_INIT;
    (window as any).AMP_I_INIT = AMP_I_INIT;
    (window as any).AMP_Z_INIT = AMP_Z_INIT;

    const ids = [
      "Amp_A",
      "Angle_A",
      "Amp_B",
      "Angle_B",
      "Amp_C",
      "Angle_C",
      "Amp_A_I",
      "Angle_A_I",
      "Amp_B_I",
      "Angle_B_I",
      "Amp_C_I",
      "Angle_C_I",
      "Amp_0",
      "Angle_0",
      "Amp_1",
      "Angle_1",
      "Amp_2",
      "Angle_2",
      "Amp_0_I",
      "Angle_0_I",
      "Amp_1_I",
      "Angle_1_I",
      "Amp_2_I",
      "Angle_2_I",
      "toggle",
      "toggle_I",
    ];
    ids.forEach((id) => {
      (window as any)[id] = document.getElementById(id);
    });

    (window as any).toggleon = document.getElementById("toggleon");
    (window as any).toggleon_I = document.getElementById("toggleon_I");

    (window as any).ta = ta;
    (window as any).tb = tb;
    (window as any).tc = tc;
    (window as any).td = td;
    (window as any).tdd = tdd;
    (window as any).ta_I = ta_I;
    (window as any).tb_I = tb_I;
    (window as any).tc_I = tc_I;
    (window as any).td_I = td_I;
    (window as any).tdd_I = tdd_I;
    (window as any).conjugate = conjugate;

    // Export utilities to window
    (window as any).Zmul = Zmul;
    (window as any).Zmulscal = Zmulscal;
    (window as any).Zadd = Zadd;
    (window as any).Zsub = Zsub;
    (window as any).Zinv = Zinv;
    (window as any).Zabs = Zabs;
    (window as any).angle = angle;
    (window as any).rad = rad;
    (window as any).M_V = M_V;
    (window as any).m_inv = m_inv;
    (window as any).fromScreenXY = fromScreenXY;
    (window as any).toScreenXY = toScreenXY;
    (window as any).a = a;
    (window as any).a2 = a2;
    (window as any).DEG2RAD = DEG2RAD;
    (window as any).RAD2DEG = RAD2DEG;
    (window as any).ampI = ampI;
    (window as any).pxI = pxI;

    // Expose functions to window for external access if needed
    (window as unknown as Record<string, unknown>).appState = {
      currentMarkerType,
      units,
      mode,
      lastDisplayMode,
      editSource,
      isDragging,
      vis_inner_Z,
      vis_inner_I,
      vis_inner_V,
      PIX_PER_AMP_I,
      PIX_PER_AMP_V,
      p0x,
      p0y,
      ORIGIN,
      w,
      h,
      phasor,
      rad,
      Zmul,
      Zmulscal,
      Zadd,
      Zsub,
      Zinv,
      Zabs,
      Zpara,
      Complex,
      C,
      add,
      sub,
      mul,
      div,
      polar,
      abs,
      m,
      m_,
      m_inv,
      M_V,
      M_V_,
      toScreenXY,
      fromScreenXY,
      toScreenAll,
      polyline,
      dist,
      angle,
      comp_MulX,
      comp_MulY,
      conjugate,
    };

    // --- Injected main.js logic (Part 1) ---
    const jq = $; // Local alias if needed

    let unitClickBound = false;
    const meterReadoutFormatter = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    });
    let meteringUpdateRaf = 0;
    let updateLoopRunning = false;
    let updateLoopPending = false;
    const scheduleMeteringRefresh = () => {
      if (typeof requestAnimationFrame !== "function") {
        recordAndUpdate();
        return;
      }
      if (meteringUpdateRaf) cancelAnimationFrame(meteringUpdateRaf);
      meteringUpdateRaf = requestAnimationFrame(() => {
        meteringUpdateRaf = 0;
        recordAndUpdate();
      });
    };

    onMeteringBaseChange(scheduleMeteringRefresh);
    function bindUnitClickOnce() {
      if (unitClickBound) return;
      document.getElementById("spanUnit")?.addEventListener(
        "click",
        () => {
          toggleUnit();
        },
        { passive: true },
      );
      unitClickBound = true;
    }
    const configureSVGs = () => {
      const common = [vis_inner_V, vis_inner_I, vis_inner_Z];
      common.forEach((v) =>
        v
          .style("width", w + "px")
          .style("height", h + "px")
          .attr("viewBox", `0 0 ${w} ${h}`),
      );
    };

    function renderSchematic(tag: string) {
      const svg = document.getElementById("i0-schematic");
      if (!svg) return;

      // Which right-side symbol?
      const rightDelta = svg.querySelector("#sym-right-Delta") as HTMLElement;
      const rightYg = svg.querySelector("#sym-right-Yg") as HTMLElement;
      const showRightY = tag === "YYg";
      if (rightDelta) rightDelta.style.display = showRightY ? "none" : "";
      if (rightYg) rightYg.style.display = showRightY ? "" : "none";

      // 30 deg marker for DY5
      const ph = svg.querySelector("#phase-label") as HTMLElement;
      if (ph) ph.style.display = tag === "DY5g" ? "" : "none";

      // Ground “open” dimming when Z0 = ∞ at local/remote
      const openL = !!(
        document.getElementById("z0inf-local") as HTMLInputElement
      )?.checked;
      const openR = !!(
        document.getElementById("z0inf-remote") as HTMLInputElement
      )?.checked;

      const gL = svg.querySelector("#gnd-left");
      const gR = showRightY
        ? svg.querySelector("#gnd-right-Y")
        : svg.querySelector("#gnd-right");

      if (gL) gL.setAttribute("opacity", openL ? "0.35" : "1");
      if (gR) gR.setAttribute("opacity", openR ? "0.35" : "1");

      // Handy tooltip with the exact Z0s seen at each terminal (3·(Rn+jXn))
      const Rn = +($("#Rn").val() || 0),
        Xn = +($("#Xn").val() || 0);
      const locZ = openL
        ? "∞"
        : `${(3 * Rn).toFixed(2)}+j${(3 * Xn).toFixed(2)}`;
      const remZ = openR
        ? "∞"
        : `${(3 * Rn).toFixed(2)}+j${(3 * Xn).toFixed(2)}`;
      let title = svg.querySelector("title") as SVGTitleElement | null;
      if (!title) {
        title = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "title",
        ) as SVGTitleElement;
        svg.appendChild(title);
      }
      title.textContent = `${tag || "—"}  •  Z₀(local)=${locZ} Ω  •  Z₀(remote)=${remZ} Ω`;
    }

    function updateSecondarySummary() {
      const el = document.getElementById("secondary-summary");
      if (!el) return;
      const preset =
        (document.getElementById("gsu-preset") as HTMLInputElement)?.value ||
        "none";
      const z0L = (document.getElementById("z0inf-local") as HTMLInputElement)
        ?.checked
        ? "open"
        : "closed";
      const z0R = (document.getElementById("z0inf-remote") as HTMLInputElement)
        ?.checked
        ? "open"
        : "closed";
      const sel = (window as any).selState?.settings;
      const order = (sel?.order || "QV").toUpperCase();
      const mode = (sel?.comparators?.mode || "AUTO").toUpperCase();
      el.textContent = `GSU ${preset || "none"} | Z0 L:${z0L} R:${z0R} | SEL ${mode}/${order}`;
    }

    // ---- Weak-source / GSU mini-model (global shim used by svgSELTable.js) ----
    (window as any).seqModel = {
      scale0: 1, // scales |I0| and |V0|
      scale1: 1, // optional future use on I1 (kept =1)
      scale2: 1, // optional future use on I2 (kept =1)
      z0Seen: { mag: 0, ang: 0 }, // equivalent Z0 seen by the relay (display)
      i0Qual: "strong", // 'strong' | 'weak' | 'open'
    };

    function complex(re = 0, im = 0) {
      return { re: +re, im: +im };
    }
    function cAdd(a: any, b: any) {
      return complex(a.re + b.re, a.im + b.im);
    }
    function cInv(z: any) {
      const d = z.re * z.re + z.im * z.im;
      return d ? complex(z.re / d, -z.im / d) : complex(0, 0);
    }
    function cPar(a: any, b: any) {
      // parallel
      if (!isFinite(a.re) && !isFinite(b.re))
        return complex(Infinity, Infinity);
      const ia = isFinite(a.re) ? cInv(a) : complex(0, 0);
      const ib = isFinite(b.re) ? cInv(b) : complex(0, 0);
      const s = cAdd(ia, ib);
      const d = s.re * s.re + s.im * s.im;
      return d ? complex(s.re / d, -s.im / d) : complex(Infinity, Infinity);
    }
    function magAng(z: any) {
      return {
        mag: Math.hypot(z.re, z.im),
        ang: (Math.atan2(z.im, z.re) * 180) / Math.PI,
      };
    }
    function pol(m: any, deg: any) {
      const r = (deg * Math.PI) / 180;
      return complex(m * Math.cos(r), m * Math.sin(r));
    }

    function zLineZ0() {
      const Z0mag = (+$("#Z0_ratio").val() || 0) * (+$("#Z_l").val() || 0);
      const Z0ang = +$("#Z0_angle").val() || 0;
      return pol(Z0mag, Z0ang);
    }

    function computeWeakSourceModel() {
      // 1) Inputs
      const z0infLocal = !!(
        document.getElementById("z0inf-local") as HTMLInputElement
      )?.checked;
      const z0infRemote = !!(
        document.getElementById("z0inf-remote") as HTMLInputElement
      )?.checked;
      const Rn = +$("#Rn").val() || 0;
      const Xn = +$("#Xn").val() || 0;

      // 2) Terminal Z0 Thevenins (only neutral path), ∞ if open
      //    Z0_term ≈ 3·(Rn + jXn) (classic image-method result)
      const Z0term = complex(3 * Rn, 3 * Xn);
      const Zloc = z0infLocal ? complex(Infinity, Infinity) : Z0term;
      const Zrem = z0infRemote ? complex(Infinity, Infinity) : Z0term;

      // Equivalent seen by line end (parallel of terminals)
      const Zeq = cPar(Zloc, Zrem);
      const seen = magAng(Zeq);

      // 3) Strength factor vs. line Z0 magnitude (dimensionless 0..1)
      const Z0L = zLineZ0();
      const Z0Lmag = Math.max(1e-9, Math.hypot(Z0L.re, Z0L.im));
      let f = seen.mag / (seen.mag + Z0Lmag); // simple current-divider proxy
      if (!isFinite(seen.mag)) f = 0; // both inf -> open
      f = Math.max(0, Math.min(1, f));

      // Quantitative label
      const qual = !f ? "open" : f < 0.3 ? "weak" : "strong";

      // 4) Optional quad link: squeeze resistive sides with strength
      //    use a gentle curve so it doesn't collapse fully when weak
      const linkQuad = !!(
        document.getElementById("link-quad") as HTMLInputElement
      )?.checked;
      if (linkQuad) applyQuadLinkage(f);
      else restoreQuadIfLinked();

      // 5) Publish to svgSELTable.js (consumes scale0 & z0Seen)
      (window as any).seqModel.scale0 = f;
      (window as any).seqModel.scale1 = 1;
      (window as any).seqModel.scale2 = 1;
      (window as any).seqModel.z0Seen = seen;
      (window as any).seqModel.i0Qual = qual;

      // 6) Live badges
      const b1 = document.getElementById("i0-path-badge");
      const b2 = document.getElementById("z0-seen-badge");
      if (b1) {
        b1.textContent = `I₀ path: ${qual}`;
        b1.className =
          "chip " +
          (qual === "open" ? "bit-false" : qual === "weak" ? "bit-true" : "");
      }
      if (b2)
        b2.textContent = `Z₀(seen): ${seen.mag.toFixed(2)} Ω / ${seen.ang.toFixed(1)}°`;

      renderSchematic(
        (document.getElementById("gsu-preset") as HTMLInputElement)?.value ||
          "",
      );
      updateSecondarySummary();
    }

    function initSecondaryConfigModal() {
      const modal = document.getElementById("secondary-config");
      const body = document.getElementById("secondary-body");
      const openBtn = document.getElementById("open-secondary-config");
      const status = document.getElementById("secondary-status");
      const applyBtn = document.getElementById(
        "secondary-apply",
      ) as HTMLButtonElement;
      const revertBtn = document.getElementById(
        "secondary-revert",
      ) as HTMLButtonElement;
      const cancelBtn = document.getElementById("secondary-cancel");
      const closeBtn = document.getElementById("secondary-close");
      const app = document.getElementById("app");

      if (!modal || !body || !openBtn) return;

      const legacyZ0 = document.getElementById("z0-src-model");
      if (legacyZ0) legacyZ0.remove();

      const movePanel = (id: string) => {
        const el = document.getElementById(id);
        if (el && el.parentNode !== body) body.appendChild(el);
      };
      ["source-gsu", "sel-config-panel", "sel-enable-table"].forEach(movePanel);

      let baseline: any = null;
      let lastFocus: any = null;
      let lastScrollY = 0;

      const readState = () => collectAllInputs(document.body);
      const isDirty = () => {
        if (!baseline) return false;
        const now = readState();
        const keys = new Set([...Object.keys(now), ...Object.keys(baseline)]);
        for (const k of keys) {
          if ((now as any)[k] !== (baseline as any)[k]) return true;
        }
        return false;
      };

      const updateStatus = () => {
        if (!modal.classList.contains("is-open")) return;
        const dirty = isDirty();
        if (status)
          status.textContent = dirty
            ? "Unsaved changes"
            : "All changes applied";
        if (applyBtn) applyBtn.disabled = !dirty;
        if (revertBtn) revertBtn.disabled = !dirty;
        modal.dataset.dirty = dirty ? "true" : "false";
      };

      const openModal = () => {
        baseline = readState();
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("secondary-open");
        if (app) {
          app.setAttribute("aria-hidden", "true");
          (app as any).inert = true;
        }
        lastFocus = document.activeElement;
        lastScrollY = window.scrollY;
        updateStatus();
        setTimeout(() => {
          closeBtn?.focus();
        }, 0);
      };

      const closeModal = (opts: any = {}) => {
        if (opts.revert && baseline) applyAllInputs(baseline);
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("secondary-open");
        if (app) {
          app.removeAttribute("aria-hidden");
          (app as any).inert = false;
        }
        if (lastFocus && typeof lastFocus.focus === "function")
          lastFocus.focus();
        if (Number.isFinite(lastScrollY)) window.scrollTo(0, lastScrollY);
      };

      const attemptClose = (mode: string) => {
        const dirty = isDirty();
        if (mode === "apply") {
          closeModal();
          return;
        }
        if (dirty && mode === "close") {
          const ok = window.confirm("Discard secondary changes?");
          if (!ok) return;
        }
        if (dirty && (mode === "close" || mode === "cancel")) {
          closeModal({ revert: true });
          return;
        }
        closeModal();
      };

      openBtn.addEventListener("click", openModal);
      applyBtn?.addEventListener("click", () => attemptClose("apply"));
      revertBtn?.addEventListener("click", () => {
        if (!baseline) return;
        applyAllInputs(baseline);
        updateStatus();
      });
      cancelBtn?.addEventListener("click", () => attemptClose("cancel"));
      closeBtn?.addEventListener("click", () => attemptClose("close"));
      modal.addEventListener("click", (e: any) => {
        if (e.target && e.target.hasAttribute("data-secondary-close"))
          attemptClose("close");
      });
      modal.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        attemptClose("close");
      });
      body.addEventListener("input", updateStatus);
      body.addEventListener("change", updateStatus);
    }

    // --- Injected main.js logic (Part 2) ---

    // Duplicates removed (already defined in Lab3.tsx scope)
    let isBooting = true;
    // let editSource: any = null;
    // let isDragging = false;
    let isAutoScaling = false;

    // Helper: auto-expand domains if dragged point goes near/boundary
    function maybeExpandWhileDragging(cls: any, px: any, py: any) {
      // Do not resize KN while dragging
      if (cls === "vector_KN") return;

      const key = classKey(cls);
      const { xScale, yScale, apply, width, height } =
        canvasConfigForClass(cls);

      // --- GROW on overshoot (same idea as before) ---
      const ox = overshootPx(px, 0, width);
      const oy = overshootPx(py, 0, height);
      const extraPx = Math.max(ox, oy);
      if (extraPx > 0) {
        const pxPerUnit = xScale(1) - xScale(0);
        const unitsPerPx = 1 / Math.max(1e-9, pxPerUnit);
        const growUnits = extraPx * unitsPerPx * 1.2;

        const cur = xScale.domain();
        const half = Math.max(Math.abs(cur[0]), Math.abs(cur[1]));
        const next = Math.min(MAX_CAP, half + growUnits);
        apply([-next, +next], { instant: true });
        shrinkState[key] = 0; // reset shrink hysteresis on grow
        return; // don’t try to shrink same frame
      }

      // --- SHRINK when there’s comfortable slack inside the current domain ---
      if (key === "Z") return; // as requested: leave impedance out for drag
      const cur = xScale.domain();
      const half = Math.max(Math.abs(cur[0]), Math.abs(cur[1]));
      const used = currentMaxEngForCanvas(key); // engineering units
      const want = niceSymmetricDomain(used)[1]; // target half-range after padding

      // If padded used-range is well below current half-range, count toward shrink
      if (want <= half * SHRINK_SLACK) {
        if (++shrinkState[key] >= SHRINK_MIN_CONSEC) {
          apply([-want, +want], { instant: true });
          shrinkState[key] = 0;
        }
      } else {
        shrinkState[key] = 0;
      }
    }

    // ... (boot function stays same) ...

    async function boot() {
      syncQuadFromDOM();
      // 1) Bind basic UI
      bindUnitClickOnce();

      // 2) Initialize helper modules
      //    (Many of these rely on global ids, so they just work)
      setupSELDynamicBlinder();
      initMeteringBaseUI(); // binds listeners for CT/VT text inputs
      initZ0ModelUI(); // binds listeners for Z0 params
      initSecondaryConfigModal();

      // 3) Initial computations
      //    Ensure we have a valid state before first render
      assignValues(); // reads DOM inputs -> window.selState
      Object.assign(
        window,
        computeVoltagePhasors({ va, vb, vc, p0x, p0y, Three_ph }),
      );
      Object.assign(window, computeCurrentPhasors({ ia, ib, ic, Three_ph_I }));
      computeImpedancePhasors(); // depends on V, I

      // 4) Configure D3 basics
      //    (axes, markers, etc. - done once)
      configureSVGs();
      addArrows();

      // 5) Bind drag behaviors
      //    (Since we are inside useEffect, we can bind to selections)
      bindDraggables();

      // 6) Initial render
      renderSchematic(
        (document.getElementById("gsu-preset") as HTMLInputElement)?.value ||
          "",
      );
      updateSecondarySummary();
      computeWeakSourceModel(); // initializes seqModel

      // 7) Event listeners for inputs
      bindInputListeners();

      // 8) First full update cycle
      await performUpdateCycle();

      setTimeout(() => {
        isBooting = false;
        // Unveil app if hidden
        document.body.classList.remove("is-loading");
      }, 50);
    }

    function bindDraggables() {
      // Apply to all draggable heads
      d3.selectAll(".draggable-head").call(drag as any);
    }

    function syncInputsFromDrag(node: any, x: any, y: any) {
      const cls = [...(node.classList as any)].find((c: any) =>
        CLASS_TO_FIELDS.has(c),
      );
      if (!cls) return;
      const {
        amp,
        ang,
        scale,
        origin,
        lock,
        sib = [],
      } = CLASS_TO_FIELDS.get(cls);

      const vx = x - origin[0];
      const vy = y - origin[1];
      const scal = (typeof scale === "function" ? scale() : scale) || 1;
      const magUnits = Math.hypot(vx, vy) / scal;
      const deg = normDeg(Math.atan2(-vy, vx) * RAD2DEG);

      const setVal = (sel: string, v: string) => {
        const el = document.querySelector(sel) as HTMLInputElement;
        if (el) {
          el.value = v;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      };

      setVal(amp, magUnits.toFixed(1));
      if (ang) setVal(ang, deg.toFixed(1));

      if (lock && lock()) {
        sib.forEach(({ amp: aSel, ang: gSel, off }: any) => {
          setVal(aSel, magUnits.toFixed(1));
          if (gSel) setVal(gSel, normDeg(deg + off).toFixed(1));
        });
      }

      editSource =
        cls === "vector_KN" ? "KN" : cls.includes("_I") ? "I_ABC" : "V_ABC";
    }

    function fitZToCurrentOnce() {
      if ((window as any).didInitialZFit) return;
      const zMax = Math.max(...collectZ().map(Math.abs));
      const dom = niceSymmetricDomain(zMax);
      applyAxis_Z(dom, { instant: false }); // animate normally outside of drag
      (window as any).didInitialZFit = true;
    }
    (window as any).didInitialZFit = false;

    function updateCollapseRows() {
      try {
        const ratio = +($("#Z_ratio").val() || 0);
        const ratio0 = +($("#Z0_ratio").val() || 0);
        const L = +($("#Z_l").val() || 0);
        const angle1 = +($("#Z_angle").val() || 0);
        const angle0 = +($("#Z0_angle").val() || 0);

        const Z1line = ratio * L;
        const Z0line = ratio0 * L;

        d3.selectAll("#collapse0").html(
          `Z <sub>1</sub> = ${Z1line.toFixed(2)} <tspan style="text-decoration:underline">/${angle1}</tspan> Ω`,
        );
        d3.selectAll("#collapseZ0").html(
          `Z <sub>0</sub> = ${Z0line.toFixed(2)} <tspan style="text-decoration:underline">/${angle0}</tspan> Ω`,
        );

        // keep |Z1| (line) in sync unless user is actively editing it
        if (!_lockZLmag) syncZLmagFromParts();
      } catch (e) {
        /* keep calm and carry on */
      }
    }

    let _lockZLmag = false;

    function syncZLmagFromParts() {
      if (_lockZLmag) return;
      const ratio = parseFloat($("#Z_ratio").val()) || 0;
      const L = parseFloat($("#Z_l").val()) || 0;
      const zmag = ratio * L;
      const el = document.getElementById("ZLmag") as HTMLInputElement;
      if (el) el.value = Number.isFinite(zmag) ? zmag.toFixed(3) : "";
    }

    function syncPartsFromZLmag() {
      const zmag = parseFloat($("#ZLmag").val());
      const L = parseFloat($("#Z_l").val());
      if (!Number.isFinite(zmag) || !Number.isFinite(L) || L === 0) return;
      _lockZLmag = true;
      const ratio = zmag / L;
      const el = document.getElementById("Z_ratio") as HTMLInputElement;
      if (el) {
        el.value = ratio.toFixed(4);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      _lockZLmag = false;
      updateCollapseRows();
      recordAndUpdate();
    }

    $('input[name="charType"]').on("change", function (this: HTMLInputElement) {
      (window as any).currentCharType = this.value; // if other code relies on it
      recordAndUpdate(); // calls update2() which calls startQuad()
      if (String(this.value).toUpperCase() === "QUAD") {
        try {
          drawQuadHandles();
        } catch (e) {
          /* handles are optional */
        }
      }
    });

    async function update2() {
      Object.assign(
        window,
        computeVoltagePhasors({ va, vb, vc, p0x, p0y, Three_ph }),
      );
      Object.assign(window, computeCurrentPhasors({ ia, ib, ic, Three_ph_I }));
      computeImpedancePhasors();
      /* -------------------------------------------------------------- */

      const [inDisplay, knDisplay] = await Promise.all([
        convertScalar(abs((window as any).IN), "I"),
        convertScalar(abs((window as any).KN), "Z"),
      ]);
      {
        const out = d3.select("#components_Factors_after");
        if (!out.empty()) {
          out.text(
            `IN = ${meterReadoutFormatter.format(inDisplay)},  KN = ${meterReadoutFormatter.format(knDisplay)}`,
          );
        }
      }

      (window as any).fact_1A = 1;

      startQuad();

      const OZ = originZ();

      function circleCx(d: any) {
        return (OZ[0] + d[0]) / 2;
      }
      function circleCy(d: any) {
        return (OZ[1] + d[1]) / 2;
      }
      function circleR(d: any) {
        return Math.hypot(OZ[0] - d[0], OZ[1] - d[1]) / 2;
      }

      vis_inner_Z
        .selectAll("circle.vector_Z1_Line")
        .data((window as any).ps_Z1_line ?? [])
        .join("circle")
        .attr("class", "vector_Z1_Line")
        .attr("cx", circleCx)
        .attr("cy", circleCy)
        .attr("r", circleR)
        .style("pointer-events", "none")
        .classed("intersect", !!(window as any).check_trip);

      vis_inner_Z
        .selectAll("circle.vector_Z2_Line")
        .data((window as any).ps_Z2_line ?? [])
        .join("circle")
        .attr("class", "vector_Z2_Line")
        .attr("cx", circleCx)
        .attr("cy", circleCy)
        .attr("r", circleR)
        .style("pointer-events", "none")
        .classed("intersect2", !!(window as any).check_trip2);

      vis_inner_Z
        .selectAll("circle.vector_Z3_Line")
        .data((window as any).ps_Z3_line ?? [])
        .join("circle")
        .attr("class", "vector_Z3_Line")
        .attr("cx", circleCx)
        .attr("cy", circleCy)
        .attr("r", circleR)
        .style("pointer-events", "none")
        .classed("intersect3", !!(window as any).check_trip3);

      await renderVectorsAndTexts();

      vis_inner_Z
        .selectAll(
          ".vector_Z_Line, .vectora_Z, .vectorb_Z, .vectorc_Z, .vectorab_Z, .vectorbc_Z, .vectorca_Z",
        )
        .style("pointer-events", "none");

      d3.selectAll(".vector_Z_Line").attr("marker-start", "url(#markPol)");

      vis_inner_V
        .selectAll("circle.vectora")
        .data(psa)
        .attr("cx", function (d: any) {
          return d[0];
        })
        .attr("cy", function (d: any) {
          return d[1];
        })
        .raise();

      vis_inner_V
        .selectAll("circle.vectorb")
        .data(psb)
        .attr("cx", function (d: any) {
          return d[0];
        })
        .attr("cy", function (d: any) {
          return d[1];
        })
        .raise();

      vis_inner_V
        .selectAll("circle.vectorc")
        .data(psc)
        .attr("cx", function (d: any) {
          return d[0];
        })
        .attr("cy", function (d: any) {
          return d[1];
        })
        .raise();

      vis_inner_I
        .selectAll("circle.vectora_I")
        .data(psa_I)
        .attr("cx", function (d: any) {
          return d[0];
        })
        .attr("cy", function (d: any) {
          return d[1];
        })
        .raise();

      vis_inner_I
        .selectAll("circle.vectorb_I")
        .data(psb_I)
        .attr("cx", function (d: any) {
          return d[0];
        })
        .attr("cy", function (d: any) {
          return d[1];
        })
        .raise();

      vis_inner_I
        .selectAll("circle.vectorc_I")
        .data(psc_I)
        .attr("cx", function (d: any) {
          return d[0];
        })
        .attr("cy", function (d: any) {
          return d[1];
        })
        .raise();

      // Voltage arrow drag handles subject
      vis_inner_V
        .selectAll("circle.vectora")
        .data((window as any).psa)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vectora")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      vis_inner_V
        .selectAll("circle.vectorb")
        .data((window as any).psb)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vectorb")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      vis_inner_V
        .selectAll("circle.vectorc")
        .data((window as any).psc)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vectorc")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      // Current arrow drag handles
      vis_inner_I
        .selectAll("circle.vectora_I")
        .data((window as any).psa_I)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vectora_I")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      vis_inner_I
        .selectAll("circle.vectorb_I")
        .data((window as any).psb_I)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vectorb_I")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      vis_inner_I
        .selectAll("circle.vectorc_I")
        .data((window as any).psc_I)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vectorc_I")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      vis_KN
        .selectAll("circle.vector_KN")
        .data((window as any).ps_KN)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", "vector_KN")
              .attr("r", 25)
              .call(drag),
          (update: any) => update,
        )
        .attr("cx", (d: any) => d[0])
        .attr("cy", (d: any) => d[1]);

      updateCollapseRows();
    }

    function headFromFields(
      ampSel: any,
      angSel: any,
      origin: any,
      pixPerUnit: any,
    ) {
      const amp = parseFloat($(ampSel).val()) || 0;
      const deg = parseFloat($(angSel).val()) || 0;
      const rpx = amp * pixPerUnit;
      const th = deg * DEG2RAD;
      return [origin[0] + rpx * Math.cos(th), origin[1] - rpx * Math.sin(th)];
    }

    function recomputeVHeadsFromInputs() {
      const O = originV();
      (window as any).va = headFromFields(
        "#Amp_A",
        "#Angle_A",
        O,
        PIX_PER_AMP_V,
      );
      (window as any).vb = headFromFields(
        "#Amp_B",
        "#Angle_B",
        O,
        PIX_PER_AMP_V,
      );
      (window as any).vc = headFromFields(
        "#Amp_C",
        "#Angle_C",
        O,
        PIX_PER_AMP_V,
      );
      (window as any).psa = [(window as any).va];
      (window as any).psb = [(window as any).vb];
      (window as any).psc = [(window as any).vc];
    }

    function recomputeIHeadsFromInputs() {
      const O = originI();
      (window as any).ia = headFromFields(
        "#Amp_A_I",
        "#Angle_A_I",
        O,
        PIX_PER_AMP_I,
      );
      (window as any).ib = headFromFields(
        "#Amp_B_I",
        "#Angle_B_I",
        O,
        PIX_PER_AMP_I,
      );
      (window as any).ic = headFromFields(
        "#Amp_C_I",
        "#Angle_C_I",
        O,
        PIX_PER_AMP_I,
      );
      (window as any).psa_I = [(window as any).ia];
      (window as any).psb_I = [(window as any).ib];
      (window as any).psc_I = [(window as any).ic];
    }

    // --- helpers ---------------------------------------------------------------
    const clamp = (n: any, lo: any, hi: any) => Math.min(hi, Math.max(lo, n));
    const normDeg = (d: any) => ((d + 540) % 360) - 180; // [-180,180)

    const CLASS_TO_FIELDS = new Map<string, any>([
      // Voltage (A/B/C)
      [
        "vectora",
        {
          amp: "#Amp_A",
          ang: "#Angle_A",
          scale: () => PIX_PER_AMP_V,
          origin: [p0x, p0y],
          lock: () => +(window as any).toggleon?.value === 1,
          sib: [
            { amp: "#Amp_B", ang: "#Angle_B", off: -120 },
            { amp: "#Amp_C", ang: "#Angle_C", off: +120 },
          ],
        },
      ],
      [
        "vectorb",
        {
          amp: "#Amp_B",
          ang: "#Angle_B",
          scale: () => PIX_PER_AMP_V,
          origin: [p0x, p0y],
          lock: () => +(window as any).toggleon?.value === 1,
          sib: [
            { amp: "#Amp_C", ang: "#Angle_C", off: -120 },
            { amp: "#Amp_A", ang: "#Angle_A", off: +120 },
          ],
        },
      ],
      [
        "vectorc",
        {
          amp: "#Amp_C",
          ang: "#Angle_C",
          scale: () => PIX_PER_AMP_V,
          origin: [p0x, p0y],
          lock: () => +(window as any).toggleon?.value === 1,
          sib: [
            { amp: "#Amp_A", ang: "#Angle_A", off: -120 },
            { amp: "#Amp_B", ang: "#Angle_B", off: +120 },
          ],
        },
      ],

      // Current (A/B/C)
      [
        "vectora_I",
        {
          amp: "#Amp_A_I",
          ang: "#Angle_A_I",
          scale: () => PIX_PER_AMP_I,
          origin: [p0x, p0y],
          lock: () => +(window as any).toggleon_I?.value === 1,
          sib: [
            { amp: "#Amp_B_I", ang: "#Angle_B_I", off: -120 },
            { amp: "#Amp_C_I", ang: "#Angle_C_I", off: +120 },
          ],
        },
      ],
      [
        "vectorb_I",
        {
          amp: "#Amp_B_I",
          ang: "#Angle_B_I",
          scale: () => PIX_PER_AMP_I,
          origin: [p0x, p0y],
          lock: () => +(window as any).toggleon_I?.value === 1,
          sib: [
            { amp: "#Amp_C_I", ang: "#Angle_C_I", off: -120 },
            { amp: "#Amp_A_I", ang: "#Angle_A_I", off: +120 },
          ],
        },
      ],
      [
        "vectorc_I",
        {
          amp: "#Amp_C_I",
          ang: "#Angle_C_I",
          scale: () => PIX_PER_AMP_I,
          origin: [p0x, p0y],
          lock: () => +(window as any).toggleon_I?.value === 1,
          sib: [
            { amp: "#Amp_A_I", ang: "#Angle_A_I", off: -120 },
            { amp: "#Amp_B_I", ang: "#Angle_B_I", off: +120 },
          ],
        },
      ],

      [
        "vector_KN",
        {
          amp: "#KN",
          ang: "#KN_angle",
          scale: () => PIX_PER_AMP_KN,
          origin: [(window as any).p0_KNx, (window as any).p0_KNy],
          bounds: [0, (window as any).w_KN, 0, (window as any).h_KN], // xmin, xmax, ymin, ymax (pixels in KN SVG)
          lock: () => false,
        },
      ],
    ]);

    // --- Overshoot-based autosizing during drag ---------------------------------
    function overshootPx(px: any, lo: any, hi: any) {
      return px < lo ? lo - px : px > hi ? px - hi : 0;
    }

    function canvasConfigForClass(cls: any) {
      // Decide which canvas/scales/axis-applier/bounds to use
      if (cls.endsWith("_I")) {
        return {
          xScale: xScale_I,
          yScale: yScale_I,
          apply: (dom: any, opts: any) => applyAxis_I(dom, opts),
          width: p0x * 2 - svgPadding,
          height: p0y * 2 - svgPadding,
        };
      }
      if (cls.includes("_Z")) {
        return {
          xScale: xScale_Z,
          yScale: yScale_Z,
          apply: (dom: any, opts: any) => applyAxis_Z(dom, opts),
          width: p0x * 2 - svgPadding,
          height: p0y * 2 - svgPadding,
        };
      }
      if (cls === "vector_KN") {
        // leave KN alone (no autosize while dragging)
        return {
          xScale: xScale_KN,
          yScale: yScale_KN,
          apply: (dom: any, opts: any) => applyAxis_KN(dom, opts),
          width: (window as any).w_KN - svgPadding,
          height: (window as any).h_KN - svgPadding,
        };
      }
      // default → Voltage canvas
      return {
        xScale: xScale_V,
        yScale: yScale_V,
        apply: (dom: any, opts: any) => applyAxis_V(dom, opts),
        width: p0x * 2 - svgPadding,
        height: p0y * 2 - svgPadding,
      };
    }

    // ------- Auto-scale helpers -------
    const MAX_CAP = 1e6; // ignore absurd values
    const MIN_SPAN = 1e-6; // avoid zero-span domains
    const PAD = 1.75; // breathing room around extrema
    // let isAutoScaling = false;  // re-entry guard (Duplicate)
    // --- Shrink tuning (smooth / anti-jitter)
    const SHRINK_SLACK = 0.82; // shrink when used range < 82% of current half-range
    const SHRINK_MIN_CONSEC = 2; // need N consecutive frames under threshold

    const shrinkState: any = { V: 0, I: 0, Z: 0, KN: 0 };

    function classKey(cls: any) {
      if (cls.endsWith("_I")) return "I";
      if (cls.includes("_Z")) return "Z";
      if (cls === "vector_KN") return "KN";
      return "V";
    }

    // Max magnitude (engineering units) currently shown on a canvas
    function currentMaxEngForCanvas(key: any) {
      if (key === "V") {
        const O = originV();
        const heads = [
          (window as any).psa?.[0],
          (window as any).psb?.[0],
          (window as any).psc?.[0],
        ].filter(Boolean);
        if (!heads.length) return AMP_V_INIT;
        const ppu = PIX_PER_AMP_V || xScale_V(1) - xScale_V(0);
        return Math.max(
          ...heads.map(
            ([x, y]: any) =>
              Math.hypot(x - O[0], y - O[1]) / Math.max(ppu as number, 1e-9),
          ),
        );
      }
      if (key === "I") {
        const O = originI();
        const heads = [
          (window as any).psa_I?.[0],
          (window as any).psb_I?.[0],
          (window as any).psc_I?.[0],
        ].filter(Boolean);
        if (!heads.length) return AMP_I_INIT;
        const ppu = PIX_PER_AMP_I || xScale_I(1) - xScale_I(0);
        return Math.max(
          ...heads.map(
            ([x, y]: any) =>
              Math.hypot(x - O[0], y - O[1]) / Math.max(ppu as number, 1e-9),
          ),
        );
      }
      if (key === "Z") {
        // leave Z out during drag; this is only used if you later enable Z shrinking
        const vals = collectZ();
        return Math.max(...vals.map(Math.abs));
      }
      return 1;
    }

    function finiteNums(arr: any) {
      return arr.filter(
        (v: any) =>
          Number.isFinite(v) && Math.abs(v) > 0 && Math.abs(v) <= MAX_CAP,
      );
    }
    function niceSymmetricDomain(maxAbs: any, tickCount = 8) {
      const m = Math.max(MIN_SPAN, Math.min(MAX_CAP, maxAbs * PAD));
      const s = d3.scaleLinear().domain([-m, m]).nice(tickCount);
      return s.domain(); // symmetric nice numbers
    }
    function styleAxesOnce() {
      d3.selectAll(
        ".y-axis_V path, .x-axis_V path, .y-axis_V line, .x-axis_V line," +
          ".y-axis_I path, .x-axis_I path, .y-axis_I line, .x-axis_I line," +
          ".y-axis_Z path, .x-axis_Z path, .y-axis_Z line, .x-axis_Z line," +
          ".y-axis_KN path, .x-axis_KN path, .y-axis_KN line, .x-axis_KN line",
      )
        .style("stroke", "#666")
        .style("stroke-width", 2)
        .style("fill", "none");
    }

    // Collect candidates in engineering units
    function collectV() {
      const vals = [
        +$("#Amp_A").val(),
        +$("#Amp_B").val(),
        +$("#Amp_C").val(),
        +$("#Amp_0").val(),
        +$("#Amp_1").val(),
        +$("#Amp_2").val(),
      ];
      const f = finiteNums(vals);
      return f.length ? f : [AMP_V_INIT];
    }
    function collectI() {
      const vals = [
        +$("#Amp_A_I").val(),
        +$("#Amp_B_I").val(),
        +$("#Amp_C_I").val(),
        +$("#Amp_0_I").val(),
        +$("#Amp_1_I").val(),
        +$("#Amp_2_I").val(),
      ];
      const f = finiteNums(vals);
      return f.length ? f : [AMP_I_INIT];
    }
    function collectZ() {
      const pts: any[] = [];

      // phase & loop impedances (engineering Ohms) if available
      // [za, zb, zc, zab, zbc, zca].forEach(z => {
      //   if (z && Number.isFinite(z[0]) && Number.isFinite(z[1])) {
      //     pts.push(Math.abs(z[0]), Math.abs(z[1]));
      //   }
      // });
      // (Assuming global za, zb etc are updated by update2/computeImpedancePhasors and attached to window)

      const gl = window as any;
      [gl.za, gl.zb, gl.zc, gl.zab, gl.zbc, gl.zca].forEach((z) => {
        if (z && Number.isFinite(z[0]) && Number.isFinite(z[1])) {
          pts.push(Math.abs(z[0]), Math.abs(z[1]));
        }
      });

      // reaches and line angle
      const Zline = (+$("#Z_ratio").val() || 0) * (+$("#Z_l").val() || 0);
      const reachMaxPct = Math.max(
        +$("#Z1").val() || 0,
        +$("#Z2").val() || 0,
        +$("#Z3").val() || 0,
      );
      if (Number.isFinite(Zline) && Number.isFinite(reachMaxPct)) {
        const r = (Zline * reachMaxPct) / 100;
        pts.push(Math.abs(r));
      }

      // QUAD vertices envelope
      if ($('input[name="charType"]:checked').val() === "QUAD") {
        const rLeft = +$("#reachLeft").val() || 0;
        const rRight = +$("#reachRight").val() || 0;
        const phi = ((+$("#Z_angle").val() || 0) * Math.PI) / 180;
        const phiLeft = ((+$("#reachAngleLeft").val() || 0) * Math.PI) / 180;
        const phiRight = ((+$("#reachAngleRight").val() || 0) * Math.PI) / 180;
        const quadReaches = ["#Z1", "#Z2", "#Z3"].map(
          (id) => +$(id).val() || 0,
        );

        const cosPhiLeft = Math.cos(-phiLeft + Math.PI / 2);
        const sinPhiLeft = Math.sin(-phiLeft + Math.PI / 2);
        const cosPhi = Math.cos(-phi + Math.PI / 2);
        const sinPhi = Math.sin(-phi + Math.PI / 2);
        const cosPhiRight = Math.cos(-phiRight + Math.PI / 2);
        const sinPhiRight = Math.sin(-phiRight + Math.PI / 2);

        quadReaches.forEach((pct) => {
          const r = (Zline * pct) / 100;
          const rL = (rLeft * pct) / (+$("#Z1").val() || 1);
          const rR = (rRight * pct) / (+$("#Z1").val() || 1);
          const verts = [
            [-rL * cosPhi, +rL * sinPhi],
            [-rL * (cosPhiLeft - sinPhiLeft), +r],
            [rR * (cosPhiRight + sinPhiRight), +r],
            [rR * cosPhi, -rR * sinPhi],
          ];
          verts.forEach(([R, X]) => pts.push(Math.abs(R), Math.abs(X)));
        });
      }

      // Blinder arc radius
      const arcR = +$("#blinderArcRadius").val();
      if (Number.isFinite(arcR) && arcR > 0) pts.push(Math.abs(arcR));

      const f = finiteNums(pts);
      return f.length ? f : [AMP_Z_INIT];
    }

    // Axis rebind with transition and center correction
    function applyAxis_V(newDom: any, { instant = false } = {}) {
      xScale_V.domain(newDom);
      yScale_V.domain(newDom);

      const xCenter = yScale_V(0) + svgPadding / 2;
      const yCenter = xScale_V(0) + svgPadding / 2;

      const xSel = svgAxis_V.select(".x-axis_V");
      const ySel = svgAxis_V.select(".y-axis_V");

      (instant ? xSel : (xSel.transition().duration(300) as any))
        .attr("transform", `translate(${svgPadding / 2},${xCenter})`)
        .call(xAxis_V.scale(xScale_V));

      (instant ? ySel : (ySel.transition().duration(300) as any))
        .attr("transform", `translate(${yCenter},${svgPadding / 2})`)
        .call(yAxis_V.scale(yScale_V));

      SCALE_V = (xScale_V(1) as number) - (xScale_V(0) as number);
      PIX_PER_AMP_V = SCALE_V;

      recomputeVHeadsFromInputs(); // keep heads consistent after scale change
    }

    function applyAxis_I(newDom: any, { instant = false } = {}) {
      xScale_I.domain(newDom);
      yScale_I.domain(newDom);

      const xCenter = p0y; // you keep I-axis centered by layout
      const yCenter = p0x;

      const xSel = svgAxis_I.select(".x-axis_I");
      const ySel = svgAxis_I.select(".y-axis_I");

      (instant ? xSel : (xSel.transition().duration(300) as any))
        .attr("transform", `translate(${svgPadding / 2},${xCenter})`)
        .call(xAxis_I.scale(xScale_I));

      (instant ? ySel : (ySel.transition().duration(300) as any))
        .attr("transform", `translate(${yCenter},${svgPadding / 2})`)
        .call(yAxis_I.scale(yScale_I));

      SCALE_I = (xScale_I(1) as number) - (xScale_I(0) as number);
      PIX_PER_AMP_I = SCALE_I;

      recomputeIHeadsFromInputs();
    }

    function applyAxis_Z(newDom: any, { instant = false } = {}) {
      xScale_Z.domain(newDom);
      yScale_Z.domain(newDom);

      const xCenter = yScale_Z(0) + svgPadding / 2;
      const yCenter = xScale_Z(0) + svgPadding / 2;

      const xSel = svgAxis_Z.select(".x-axis_Z");
      const ySel = svgAxis_Z.select(".y-axis_Z");

      (instant ? xSel : (xSel.transition().duration(300) as any))
        .attr("transform", `translate(${svgPadding / 2},${xCenter})`)
        .call(xAxis_Z.scale(xScale_Z));

      (instant ? ySel : (ySel.transition().duration(300) as any))
        .attr("transform", `translate(${yCenter},${svgPadding / 2})`)
        .call(yAxis_Z.scale(yScale_Z));

      SCALE_Z = (xScale_Z(1) as number) - (xScale_Z(0) as number);
      PIX_PER_AMP_Z = SCALE_Z;

      // redraw overlays that depend on scale
      try {
        if (typeof drawQuads === "function") drawQuads(vis_inner_Z);
      } catch (_) {}
      try {
        if (typeof (window as any).drawSELBlinder === "function")
          (window as any).drawSELBlinder();
      } catch (_) {}
    }

    function applyAxis_KN(newDom: any, { instant = false } = {}) {
      xScale_KN.domain(newDom);
      yScale_KN.domain(newDom);

      const xCenter = (window as any).p0_KNy;
      const yCenter = (window as any).p0_KNx;

      const xSel = (window as any).svgAxis_KN.select(".x-axis_KN");
      const ySel = (window as any).svgAxis_KN.select(".y-axis_KN");

      (instant ? xSel : (xSel.transition().duration(300) as any))
        .attr("transform", `translate(${svgPadding / 2},${xCenter})`)
        .call(xAxis_KN.scale(xScale_KN));

      (instant ? ySel : (ySel.transition().duration(300) as any))
        .attr("transform", `translate(${yCenter},${svgPadding / 2})`)
        .call(yAxis_KN.scale(yScale_KN));

      SCALE_KN = (xScale_KN(1) as number) - (xScale_KN(0) as number);
      PIX_PER_AMP_KN = SCALE_KN;

      // keep KN head at same magnitude/angle after scale change
      const mag = parseFloat($("#KN").val()) || 0;
      const ang = parseFloat($("#KN_angle").val());
      const deg = Number.isFinite(ang) ? ang : currentKNAngleDeg();
      setKNHeadFromPolar(mag, deg);
    }

    // === Axes snapshot/apply for History =====================================
    function axesSnapshot() {
      return {
        V: xScale_V.domain().slice(),
        I: xScale_I.domain().slice(),
        Z: xScale_Z.domain().slice(),
        KN: xScale_KN.domain().slice(),
      };
    }
    function axesApply(domains: any, instant = true) {
      if (domains?.V) applyAxis_V(domains.V, { instant });
      if (domains?.I) applyAxis_I(domains.I, { instant });
      if (domains?.Z) applyAxis_Z(domains.Z, { instant });
      if (domains?.KN) applyAxis_KN(domains.KN, { instant });
    }

    function autoScaleAll() {
      // Compute desired domains
      const vMax = Math.max(...collectV().map(Math.abs));
      const iMax = Math.max(...collectI().map(Math.abs));
      const zMax = Math.max(...collectZ().map(Math.abs));
      const knMag = Math.abs(parseFloat($("#KN").val()) || 1);

      const vDomNew = niceSymmetricDomain(vMax);
      const iDomNew = niceSymmetricDomain(iMax);
      const zDomNew = niceSymmetricDomain(zMax);
      const knDomNew = niceSymmetricDomain(Math.max(knMag, 1)); // keep ≥1 for usability

      // Only apply if changed
      const same = (a: any, b: any) => a[0] === b[0] && a[1] === b[1];

      const vDomOld = xScale_V.domain().slice();
      const iDomOld = xScale_I.domain().slice();
      const zDomOld = xScale_Z.domain().slice();
      const knDomOld = xScale_KN.domain().slice();

      if (!same(vDomNew, vDomOld)) applyAxis_V(vDomNew);
      if (!same(iDomNew, iDomOld)) applyAxis_I(iDomNew);
      if (!same(zDomNew, zDomOld)) applyAxis_Z(zDomNew);
      if (!same(knDomNew, knDomOld)) applyAxis_KN(knDomNew);

      styleAxesOnce();
    }

    let rafId = 0;
    const rafUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        recordAndUpdate();
      });
    };

    // Clamp a drag to current domain in engineering units
    function clampHeadToDomain(
      x: any,
      y: any,
      origin: any,
      pixPerUnit: any,
      maxEng: any,
    ) {
      const dx = x - origin[0],
        dy = y - origin[1];
      const rpx = Math.hypot(dx, dy);
      const ang = Math.atan2(-dy, dx); // screen Y up negative
      const rEng = rpx / Math.max(1e-9, pixPerUnit);
      const rCap = Math.min(rEng, maxEng);
      const rNew = rCap * pixPerUnit;
      return [
        origin[0] + rNew * Math.cos(ang),
        origin[1] - rNew * Math.sin(ang),
      ];
    }

    const renderVector = (container: any, cls: any, data: any) => {
      const safe = (Array.isArray(data) ? data : []).filter(Array.isArray);
      // Note: we don't bind drag here because bindDraggables handles it globally
      container
        .selectAll(`circle.${cls}`)
        .data(safe)
        .join(
          (enter: any) =>
            enter
              .append("circle")
              .attr("class", cls)
              .attr("id", cls)
              .attr("r", 25)
              // set position on ENTER too (prevents 0,0)
              .attr("cx", (d: any) => d[0])
              .attr("cy", (d: any) => d[1]),
          (update: any) =>
            update
              // keep tied to bound data on every update
              .attr("cx", (d: any) => d[0])
              .attr("cy", (d: any) => d[1]),
          (exit: any) => exit.remove(),
        );
    };

    function Vmarker(
      svg: any,
      ObjColor: string[],
      arrowSize: number,
      markerType: string,
    ) {
      const markerWidth = arrowSize;
      const markerHeight = 2 * arrowSize;
      const viewBox =
        markerType === "arrow"
          ? `0 0 ${2 * arrowSize} ${2 * arrowSize}`
          : `0 0 ${arrowSize * 4} ${arrowSize * 4}`;
      const MoveTo = 0;
      const paths: any = {
        arrow: `M0,-${arrowSize}L${2 * arrowSize},0L0,${arrowSize}Z`,
        circle: `M${2 * arrowSize + MoveTo},${arrowSize}
                 A${arrowSize},${arrowSize} 0 1 0 ${2 * arrowSize + MoveTo},${-arrowSize}
                A${arrowSize},${arrowSize} 0 1 0 ${2 * arrowSize + MoveTo},${arrowSize}`,
      };

      const path = paths[markerType] || paths.arrow;

      svg
        .append("defs")
        .selectAll("marker")
        .data(ObjColor)
        .enter()
        .append("marker")
        .attr("id", (d: any) => `${d}`)
        .attr("viewBox", viewBox)
        .attr("refX", 1.7 * arrowSize)
        .attr("refY", 0)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .append("path")
        .attr("d", path)
        .attr("id", (d: any) => `${d}-${markerType}path`);

      return { svg };
    }
    (window as any).Vmarker = Vmarker;

    function setKNHeadFromPolar(mag: any, deg: any) {
      const rpx = (Number.isFinite(mag) ? mag : 0) * PIX_PER_AMP_KN;
      const theta = deg * DEG2RAD;
      const x = (window as any).p0_KNx + rpx * Math.cos(theta);
      const y = (window as any).p0_KNy - rpx * Math.sin(theta); // screen Y up is negative
      if (!(window as any).ps_KN || !(window as any).ps_KN[0])
        (window as any).ps_KN = [[x, y]];
      else {
        (window as any).ps_KN[0][0] = x;
        (window as any).ps_KN[0][1] = y;
      }
      rafUpdate();
    }

    function currentKNAngleDeg() {
      const head = (window as any).ps_KN?.[0] || [
        (window as any).p0_KNx,
        (window as any).p0_KNy,
      ];
      const dx = head[0] - (window as any).p0_KNx;
      const dy = (window as any).p0_KNy - head[1]; // invert Y
      return normDeg(Math.atan2(dy, dx) * RAD2DEG);
    }

    // replace the old version with this shim that preserves current angle when only mag changes
    function setKNHeadFromScalar(mag: any) {
      const el = document.getElementById("KN_angle") as HTMLInputElement;
      const degInput = parseFloat(el ? el.value : "0");
      const deg = Number.isFinite(degInput) ? degInput : currentKNAngleDeg();
      setKNHeadFromPolar(mag, deg);
    }

    async function performUpdateCycle() {
      await update2();

      const restoring = History.isRestoring && History.isRestoring();
      if (!restoring) {
        if (editSource === "V_ABC" || editSource === "I_ABC") {
          ganged(); // ABC -> 0/1/2
        } else if (editSource === "V_SEQ" || editSource === "I_SEQ") {
          tab_ABC(); // 0/1/2 -> ABC
        } else {
          ganged();
        }
      }

      compute();

      if (!isDragging && !isAutoScaling && !restoring) {
        isAutoScaling = true;
        autoScaleAll();
        await update2(); // recompute ps_* that depend on xScale_/yScale_
        isAutoScaling = false;
      }

      editSource = null;
      document.dispatchEvent(new CustomEvent("phasors:update"));
    }

    function recordAndUpdate() {
      (window as any).updateLoopPending = true;
      if ((window as any).updateLoopRunning) return;
      (window as any).updateLoopRunning = true;
      (async function driveUpdates() {
        do {
          (window as any).updateLoopPending = false;
          try {
            await performUpdateCycle();
          } catch (err) {
            console.error("[main] update failed", err);
          }
        } while ((window as any).updateLoopPending);
        (window as any).updateLoopRunning = false;
      })();
    }
    (window as any).recordAndUpdate = recordAndUpdate;

    function bindInputListeners() {
      const undo = document.getElementById("undoBtn");
      if (undo) undo.onclick = History.undo;
      const redo = document.getElementById("redoBtn");
      if (redo) redo.onclick = History.redo;

      d3.select("#reachLeft").on("change", () => {
        recordAndUpdate();
      });
      d3.select("#reachRight").on("change", () => {
        recordAndUpdate();
      });
      d3.select("#Z_angle").on("change", () => {
        recordAndUpdate();
      });
      d3.select("#reachAngleLeft").on("change", () => {
        recordAndUpdate();
      });
      d3.select("#reachAngleRight").on("change", () => {
        recordAndUpdate();
      });

      d3.select("body").on("keydown", function (event: any) {
        const key = event.key || event.keyCode; // safari fallback
        if (key === "Shift") (window as any).keyc = true;
      });

      window.addEventListener("keydown", (e) => {
        const z = e.key === "z" || e.key === "Z";
        const y = e.key === "y" || e.key === "Y";
        if (!e.ctrlKey && !e.metaKey) return;

        if (z && !e.shiftKey) {
          e.preventDefault();
          History.undo();
        }
        if (y || (z && e.shiftKey)) {
          e.preventDefault();
          History.redo();
        }
      });

      d3.select("body").on("keyup", function () {
        (window as any).keyc = false;
      });

      const ampEl = document.getElementById("KN");
      if (ampEl) {
        ["input", "change"].forEach((ev) =>
          ampEl.addEventListener(
            ev,
            () => {
              editSource = "KN";
              const mag = parseFloat((ampEl as HTMLInputElement).value);
              setKNHeadFromScalar(Number.isFinite(mag) ? mag : 0);
            },
            { passive: true },
          ),
        );
      }

      d3.select("#KN_angle").on("input change", function (this: any) {
        const mag = parseFloat($("#KN").val()) || 0;
        setKNHeadFromPolar(mag, parseFloat(this.value) || 0);
        editSource = "KN";
      });

      setupRdbImportUI();
    }

    // ---- RDB/SET/TXT/ZIP Import -------------------------------------------------
    function setupRdbImportUI() {
      const btn = document.getElementById("import-btn");
      const file = document.getElementById("import-file");
      const zone = document.getElementById("import-dropzone");
      const card = document.getElementById("import-summary");

      if (!btn || !file) return;

      // Reveal dropzone when tooltips are ON (nice discoverability)
      if (zone) zone.style.display = "grid";

      btn.addEventListener("click", () => file.click(), { passive: true });

      file.addEventListener("change", async (e: any) => {
        const files = [...(e.target.files || [])];
        if (!files.length) return;
        const result = await importSelSettings(files);
        renderImportSummary(result);
      });

      const accept = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (zone) zone.style.borderColor = "var(--accent, SteelBlue)";
      };
      const leave = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (zone) zone.style.borderColor = "var(--muted-stroke,#557)";
      };
      ["dragenter", "dragover"].forEach((ev) =>
        zone?.addEventListener(ev, accept),
      );
      ["dragleave", "drop"].forEach((ev) => zone?.addEventListener(ev, leave));
      zone?.addEventListener("click", () => file.click(), { passive: true });
      zone?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          file.click();
        }
      });
      zone?.addEventListener("drop", async (e: any) => {
        e.preventDefault();
        const dt = e.dataTransfer;
        const files = [...(dt?.files || [])];
        if (!files.length) return;
        const result = await importSelSettings(files);
        renderImportSummary(result);
      });

      function renderImportSummary(res: any) {
        if (!card) return;
        if (!res || !res.mapping) {
          card.style.display = "block";
          card.innerHTML = `<div>Could not parse any compatible SEL settings.</div>`;
          return;
        }
        const { info, mapping } = res;
        const raw = mapping.raw || {};
        const scaleMeta = mapping.scaling || {};

        const fmt = (n: any, d = 2) =>
          Number.isFinite(n) ? Number(n).toFixed(d) : "--";
        const asText = (v: any) => v ?? "--";

        const rows = [
          ["Device", `${info?.RELAYTYPE || "--"}`],
          ["Firmware", `${info?.FID || info?.BFID || "--"}`],
          [
            "CT (p/s)",
            `${fmt(mapping.ctPrimary, 2)} / ${fmt(mapping.ctSecondary, 2)} A`,
          ],
          [
            "VT (p/s)",
            `${fmt(mapping.vtPrimary, 2)} / ${fmt(mapping.vtSecondary, 2)} V (${mapping.vtMode})`,
          ],
          ["Freq", `${info?.FREQ || "50/60"} Hz`],
          [
            "|Z1| / angle Z1",
            `${fmt(mapping.Z1MAG, 3)} ohm / ${fmt(mapping.Z1ANG, 2)}º`,
          ],
          [
            "|Z0| / angle Z0",
            `${fmt(mapping.Z0MAG, 3)} ohm / ${fmt(mapping.Z0ANG, 2)}º`,
          ],
          [
            "k0 (mag/angle)",
            `${fmt(mapping.k0M, 3)} / ${fmt(mapping.k0A, 2)}º`,
          ],
          ["Length", mapping.lengthText || "--"],
          [
            "Zones (Z1/Z2/Z3 %)",
            [mapping.Z1P, mapping.Z2P, mapping.Z3P]
              .map((v) => (Number.isFinite(v) ? fmt(v, 1) : "OFF"))
              .join(" / "),
          ],
          [
            "32 thresholds (Q:FP/RP)",
            `${fmt(mapping["50QFP"])} / ${fmt(mapping["50QRP"])}`,
          ],
          [
            "32 thresholds (V: GFP/GRP)",
            `${fmt(mapping["50GFP"])} / ${fmt(mapping["50GRP"])}`,
          ],
          ["ORDER", asText(mapping.ORDER)],
          ["E32IV", mapping.E32IV ? "ON" : "OFF"],
          ["ELOP", mapping.ELOP || "N"],
          ["OOSB1-5", (mapping.OOSB || []).join("") || "--"],
        ];

        const toast = `<div style="display:inline-flex;align-items:center;gap:.35rem;margin-bottom:.65rem;padding:.35rem .6rem;border-radius:.35rem;background:rgba(25,135,84,.15);color:rgb(25,135,84);font-weight:600;">Scaled to secondary</div>`;

        const diffRows = [
          ["CT primary (A)", raw.ctPrimary, mapping.ctPrimary],
          ["CT secondary (A)", raw.ctSecondary, mapping.ctSecondary],
          ["VT primary (V)", raw.vtPrimary, mapping.vtPrimary],
          ["VT secondary (V)", raw.vtSecondary, mapping.vtSecondary],
          ["|Z1| (ohm)", raw.Z1MAG, mapping.Z1MAG],
          ["|Z0| (ohm)", raw.Z0MAG, mapping.Z0MAG],
        ];

        const diffHtml = diffRows
          .filter(([, , scaled]) => Number.isFinite(scaled))
          .map(([label, before, after]) => {
            const beforeText = Number.isFinite(before) ? fmt(before, 3) : "--";
            const afterText = Number.isFinite(after) ? fmt(after, 3) : "--";
            if (beforeText === afterText) {
              return `<span style="opacity:.65">${label}</span><span style="opacity:.55">(no change)</span><span></span><span></span>`;
            }
            return `<span>${label}</span><span style="opacity:.75">${beforeText}</span><span style="opacity:.45">-></span><span>${afterText}</span>`;
          })
          .join("");

        const sanity = Number.isFinite(scaleMeta.z1DeltaPct)
          ? scaleMeta.z1DeltaPct
          : undefined;
        const sanityBadge =
          sanity && sanity > 0.03
            ? `<span style="padding:.1rem .45rem;border-radius:999px;font-size:.75rem;font-weight:600;background:rgba(220,53,69,.12);color:rgb(200,35,51);">Scaling sanity: ${(sanity * 100).toFixed(1)}% delta</span>`
            : "";

        const diffSection = `
          <section style="margin-top:.85rem;">
            <header style="display:flex;align-items:center;gap:.5rem;font-weight:600;margin-bottom:.25rem;">
              <span>Scaling diff</span>
              ${sanityBadge}
            </header>
            <div style="display:grid;grid-template-columns:auto auto auto auto;gap:.25rem .75rem;font-size:.85rem;">
              ${diffHtml || '<span style="grid-column:1/-1;opacity:.65;">No delta detected.</span>'}
            </div>
          </section>
        `;

        const table = `
          ${toast}
          <header style="font-weight:700;margin-bottom:.25rem;">Imported settings</header>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:.25rem .75rem;">
            ${rows.map(([k, v]) => `<div style="opacity:.8">${k}</div><div>${v}</div>`).join("")}
          </div>
          <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
            <button id="import-apply" class="btn">Apply</button>
            <button id="import-save" class="btn">Save as preset</button>
            <span style="opacity:.7">A read-only "Imported preset" is also added.</span>
          </div>
          ${diffSection}
        `;

        card.style.display = "block";
        card.innerHTML = table;

        document
          .getElementById("import-apply")
          ?.addEventListener("click", () => {
            try {
              applyMappingToForm(mapping);
              recordAndUpdate();
            } catch (e) {
              console.error(e);
            }
          });

        document
          .getElementById("import-save")
          ?.addEventListener("click", () => {
            const name = prompt(
              "Preset name:",
              `Imported ${info?.RELAYTYPE || ""}`.trim(),
            );
            if (!name) return;
            applyMappingToForm(mapping);
            const sel = document.getElementById(
              "preset-select",
            ) as HTMLSelectElement;
            if (sel && ![...sel.options].some((o) => o.value === name)) {
              const opt = document.createElement("option");
              opt.value = name;
              opt.textContent = name;
              sel.appendChild(opt);
            }
            if (sel) {
              sel.value = name;
              sel.dispatchEvent(new Event("change", { bubbles: true }));
            }
            document.getElementById("preset-save")?.click();
          });

        ensureImportedPresetOption();
      }

      function ensureImportedPresetOption() {
        const sel = document.getElementById(
          "preset-select",
        ) as HTMLSelectElement;
        if (!sel) return;
        const label = "Imported preset (read-only)";
        if (![...sel.options].some((o) => o.value === "__IMPORTED__")) {
          const opt = document.createElement("option");
          opt.value = "__IMPORTED__";
          opt.textContent = label;
          opt.disabled = true; // visually conveys read-only
          sel.add(opt, sel.options[1] || null);
        }
        // When selected (if someone forces it), disable Save/Delete
        const saveBtn = document.getElementById(
          "preset-save",
        ) as HTMLButtonElement;
        const delBtn = document.getElementById(
          "preset-delete",
        ) as HTMLButtonElement;
        sel.addEventListener("change", () => {
          const ro = sel.value === "__IMPORTED__";
          if (saveBtn) saveBtn.disabled = ro;
          if (delBtn) delBtn.disabled = ro;
        });
      }
    }

    async function importSelSettings(files: any) {
      const texts: any[] = [];
      for (const f of files) {
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        if (ext === "zip" && (window as any).JSZip) {
          try {
            const z = await (window as any).JSZip.loadAsync(f);
            const entries = Object.values(z.files).filter(
              (x: any) => !x.dir && /\.(txt|set|rdb)$/i.test(x.name),
            );
            for (const ent of entries as any[]) {
              const s = await ent.async("string");
              texts.push({ name: ent.name, text: s });
            }
          } catch (e) {
            console.warn("ZIP import failed", e);
          }
        } else {
          const s = await f.text().catch(() => null);
          if (s) texts.push({ name: f.name, text: s });
        }
      }
      if (!texts.length) return null;

      // Parse all, pick the best candidate (has [S1] with Z1/Z0 present)
      const parsed = texts
        .map((t) => ({ ...t, parsed: parseSelSetText(t.text) }))
        .filter((x) => x.parsed && Object.keys(x.parsed).length);
      if (!parsed.length) return null;

      // pick first with S1.Z1MAG present
      let best =
        parsed.find(
          (p) => p.parsed.S1 && (p.parsed.S1.Z1MAG || p.parsed.S1.Z1ANG),
        ) || parsed[0];

      const info = best.parsed.INFO || best.parsed["INFO"] || {};
      const mapping = buildMappingFromParsed(best.parsed);

      return { info, mapping, file: best.name };
    }

    function parseSelSetText(text: any) {
      // Handles lines like: KEY,"VALUE" or KEY,VALUE; sections [S1] etc.
      const out: any = {};
      let section = "ROOT";
      const lines = String(text).split(/\r?\n/);
      for (let raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("//") || line.startsWith(";")) continue;

        const sec = line.match(/^\[([A-Za-z0-9_]+)\]\s*$/);
        if (sec) {
          section = sec[1].toUpperCase();
          if (!out[section]) out[section] = {};
          continue;
        }

        const kv = line.match(/^([A-Za-z0-9_]+)\s*,\s*(.*)$/);
        if (!kv) continue;
        const key = kv[1].toUpperCase();
        let val = kv[2].trim();

        // Strip quotes if present
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        out[section] = out[section] || {};
        out[section][key] = normalizeSelValue(val);
      }
      return out;
    }

    function normalizeSelValue(v: any) {
      if (v == null) return null;
      const s = String(v).trim();
      const upper = s.toUpperCase();

      // Simple flags
      if (["OFF", "NA", "N", "NO", "0", "FALSE"].includes(upper)) return null;
      if (["ON", "Y", "YES", "1", "TRUE", "AUTO", "Y1"].includes(upper))
        return upper; // keep truthy marker string

      // numbers — handle "1,234.56", "1.234,56", "1,23E-2"
      let t = s.replace(/_/g, "").replace(/\s+/g, "");
      // If it looks like European decimal (only one comma and no dot), swap
      if (/^-?\d{1,3}(?:\.\d{3})*,\d+$/.test(t))
        t = t.replace(/\./g, "").replace(",", ".");
      // Otherwise remove thousands commas
      if (/^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(t)) t = t.replace(/,/g, "");
      const n = Number(t);
      return Number.isFinite(n) ? n : s;
    }

    // Safe getter across sections with priority list
    function g(parsed: any, keys: any, sections = ["S1", "ROOT", "INFO"]) {
      for (const sec of sections) {
        if (!parsed[sec]) continue;
        for (const k of Array.isArray(keys) ? keys : [keys]) {
          const kk = String(k).toUpperCase();
          if (parsed[sec].hasOwnProperty(kk)) return parsed[sec][kk];
        }
      }
      return undefined;
    }

    function buildMappingFromParsed(parsed: any) {
      const rawZ1MAG = g(parsed, "Z1MAG");
      const rawZ1ANG = g(parsed, "Z1ANG");
      const rawZ0MAG = g(parsed, "Z0MAG");
      const rawZ0ANG = g(parsed, "Z0ANG");

      const k0M = g(parsed, ["K0M", "K0MR", "K0M1"]);
      const k0A = g(parsed, ["K0A", "K0AR", "K0A1"]);

      const lengthVal = g(parsed, ["LLR", "LLL", "LENGTH"]);
      const lengthUnit = (g(parsed, "LLUNIT") || "km").toString().toLowerCase();
      const lengthKm = Number.isFinite(lengthVal)
        ? lengthUnit.startsWith("mi")
          ? lengthVal * 1.609344
          : lengthVal
        : undefined;
      const lengthText = Number.isFinite(lengthVal)
        ? `${lengthVal} ${lengthUnit}`
        : undefined;

      const ctPrimary = g(parsed, ["CTRW", "CTRX", "CTP", "CTR"]);
      let ctSecondary = g(parsed, ["CTRS", "CTS", "CTSECONDARY", "CT2"]);
      if (!Number.isFinite(ctSecondary)) ctSecondary = 5;

      const vtPrimary = g(parsed, ["PTRY", "PTRZ", "PTR"]);
      const vtSecondary = g(parsed, ["VNOMY", "VNOMZ", "VNOM"]);
      const vtMode =
        (g(parsed, ["VTMODE", "VTCONFIG"]) || "LL").toString().toUpperCase() ===
        "LN"
          ? "LN"
          : "LL";

      const ctRatio =
        Number.isFinite(ctPrimary) &&
        Number.isFinite(ctSecondary) &&
        ctSecondary !== 0
          ? ctPrimary / ctSecondary
          : NaN;
      const vtRatio =
        Number.isFinite(vtPrimary) &&
        Number.isFinite(vtSecondary) &&
        vtSecondary !== 0
          ? vtPrimary / vtSecondary
          : NaN;
      const zScale =
        Number.isFinite(ctRatio) && Number.isFinite(vtRatio) && vtRatio !== 0
          ? ctRatio / vtRatio
          : NaN;

      const scaledZ1MAG =
        Number.isFinite(rawZ1MAG) && Number.isFinite(zScale)
          ? rawZ1MAG * zScale
          : rawZ1MAG;
      const scaledZ0MAG =
        Number.isFinite(rawZ0MAG) && Number.isFinite(zScale)
          ? rawZ0MAG * zScale
          : rawZ0MAG;

      const raw = {
        ctPrimary,
        ctSecondary,
        vtPrimary,
        vtSecondary,
        vtMode,
        Z1MAG: rawZ1MAG,
        Z1ANG: rawZ1ANG,
        Z0MAG: rawZ0MAG,
        Z0ANG: rawZ0ANG,
        lengthKm,
      };

      const Z1P = g(parsed, ["Z1MP", "Z1MG"]);
      const Z2P = g(parsed, ["Z2MP", "Z2MG"]);
      const Z3P = g(parsed, ["Z3MP", "Z3MG"]);

      const th50QFP = g(parsed, ["50QFP", "50FP"]);
      const th50QRP = g(parsed, ["50QRP", "50RP"]);
      const th50GFP = g(parsed, ["50GFP", "Z50G1"]);
      const th50GRP = g(parsed, ["50GRP", "Z50G1"]);

      const Z2F = g(parsed, "Z2F");
      const Z2R = g(parsed, "Z2R");
      const Z0F = g(parsed, "Z0F");
      const Z0R = g(parsed, "Z0R");
      const scaledZ2F =
        Number.isFinite(Z2F) && Number.isFinite(zScale) ? Z2F * zScale : Z2F;
      const scaledZ2R =
        Number.isFinite(Z2R) && Number.isFinite(zScale) ? Z2R * zScale : Z2R;
      const scaledZ0F =
        Number.isFinite(Z0F) && Number.isFinite(zScale) ? Z0F * zScale : Z0F;
      const scaledZ0R =
        Number.isFinite(Z0R) && Number.isFinite(zScale) ? Z0R * zScale : Z0R;
      const a2 = g(parsed, "A2");
      const a0 = g(parsed, "A0");
      const E32IV = !!g(parsed, "E32IV");
      const ORDER = g(parsed, "ORDER");
      const ELOP = (g(parsed, "ELOP") || "").toString().toUpperCase();

      const OOSB = ["OOSB1", "OOSB2", "OOSB3", "OOSB4", "OOSB5"].map((k) =>
        g(parsed, k) ? "Y" : "N",
      );

      const z1DeltaPct =
        Number.isFinite(rawZ1MAG) &&
        Number.isFinite(scaledZ1MAG) &&
        rawZ1MAG !== 0
          ? Math.abs(scaledZ1MAG - rawZ1MAG) / Math.abs(rawZ1MAG)
          : undefined;

      return {
        Z1MAG: scaledZ1MAG,
        Z1ANG: rawZ1ANG,
        Z0MAG: scaledZ0MAG,
        Z0ANG: rawZ0ANG,
        k0M,
        k0A,
        ctPrimary,
        ctSecondary,
        vtPrimary,
        vtSecondary,
        vtMode,
        Z1P,
        Z2P,
        Z3P,
        "50QFP": th50QFP,
        "50QRP": th50QRP,
        "50GFP": th50GFP,
        "50GRP": th50GRP,
        Z2F: scaledZ2F,
        Z2R: scaledZ2R,
        Z0F: scaledZ0F,
        Z0R: scaledZ0R,
        a2,
        a0,
        E32IV,
        ELOP,
        ORDER,
        lengthKm,
        lengthText,
        raw,
        scaling: {
          ctRatio,
          vtRatio,
          zScale,
          z1DeltaPct,
        },
      };
    }

    function applyMappingToForm(map: any) {
      const setVal = (id: string, v: any) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el || v == null) return;
        el.value = v;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const setChk = (id: string, on: any) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el || on == null) return;
        el.checked = !!on;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };

      // Metering bases
      if (map.vtPrimary != null) setVal("vt-primary", map.vtPrimary);
      if (map.vtSecondary != null) setVal("vt-secondary", map.vtSecondary);
      if (map.vtSecondary != null) setVal("vt-nominal", map.vtSecondary);
      const vtModeSel = document.getElementById("vt-mode") as HTMLSelectElement;
      if (vtModeSel && map.vtMode) {
        vtModeSel.value = map.vtMode;
        vtModeSel.dispatchEvent(new Event("change", { bubbles: true }));
      }

      if (map.ctPrimary != null) setVal("ct-primary", map.ctPrimary);
      if (map.ctSecondary != null) setVal("ct-secondary", map.ctSecondary);
      // Nominal CT 1A/5A radio
      const wantNom =
        map.ctSecondary && Math.abs(map.ctSecondary - 1) < 0.001 ? "1" : "5";
      const ctRadio = document.querySelector(
        `input[name="ct-nominal"][value="${wantNom}"]`,
      ) as HTMLInputElement;
      if (ctRadio) {
        ctRadio.checked = true;
        ctRadio.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Line model
      if (typeof (window as any).setUnit === "function") {
        // our UI defaults to km; convert incoming lengthKm to that system
        (window as any).setUnit("km");
      }
      if (Number.isFinite(map.lengthKm)) {
        setVal("Z_l", +map.lengthKm.toFixed(3));
      }

      if (
        Number.isFinite(map.Z1MAG) &&
        Number.isFinite(map.lengthKm) &&
        map.lengthKm > 0
      ) {
        setVal("Z_ratio", +(map.Z1MAG / map.lengthKm).toFixed(4));
      }
      if (
        Number.isFinite(map.Z0MAG) &&
        Number.isFinite(map.lengthKm) &&
        map.lengthKm > 0
      ) {
        setVal("Z0_ratio", +(map.Z0MAG / map.lengthKm).toFixed(4));
      }
      if (Number.isFinite(map.Z1ANG)) setVal("Z_angle", map.Z1ANG);
      if (Number.isFinite(map.Z0ANG)) {
        setVal("Z0_angle", map.Z0ANG);
        setVal("Z0_angleSEL", map.Z0ANG);
      }

      // Zone reaches (%)
      if (map.Z1P != null) setVal("Z1", map.Z1P);
      if (map.Z2P != null) setVal("Z2", map.Z2P);
      if (map.Z3P != null) setVal("Z3", map.Z3P);

      // Directional / thresholds
      if (map["50QFP"] != null) setVal("50QFP", map["50QFP"]);
      if (map["50QRP"] != null) setVal("50QRP", map["50QRP"]);
      if (map["50GFP"] != null) setVal("50GFP", map["50GFP"]);
      if (map["50GRP"] != null) setVal("50GRP", map["50GRP"]);
      if (map.a2 != null) setVal("a2", map.a2);
      if (map.a0 != null) setVal("a0", map.a0);
      if (map.Z2F != null) setVal("Z2F", map.Z2F);
      if (map.Z2R != null) setVal("Z2R", map.Z2R);
      if (map.Z0F != null) setVal("Z0F", map.Z0F);
      if (map.Z0R != null) setVal("Z0R", map.Z0R);
      if (map.ORDER) {
        const el = document.getElementById("ORDER") as HTMLInputElement;
        if (el) {
          el.value = map.ORDER.toString().slice(0, 3).toUpperCase();
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      if (map.E32IV != null) setChk("E32IV", !!map.E32IV);
      if (map.ELOP) setVal("ELOP", map.ELOP);

      // K0 (compensation)
      if (map.k0M != null) setVal("KN", map.k0M);
      if (map.k0A != null) setVal("KN_angle", map.k0A);
    }

    boot();

    return () => {
      // Clean up event listeners if needed
    };
  }, []); // Empty dependency array - runs once on mount

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
        role="banner"
      >
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            21 Distance Protection
          </h1>

          <div
            id="historyBar"
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg"
          >
            <button
              id="undoBtn"
              className="p-1 px-3 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all text-slate-600 dark:text-slate-300"
              title="Undo (Ctrl + Z)"
            >
              ↶
            </button>
            <button
              id="redoBtn"
              className="p-1 px-3 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all text-slate-600 dark:text-slate-300"
              title="Redo (Ctrl + Y)"
            >
              ↷
            </button>
          </div>
        </div>

        <div
          className="flex items-center gap-4"
          role="group"
          aria-label="Display options"
        >
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 px-3 rounded-full">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                id="densityToggle"
                type="checkbox"
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Dense
            </label>

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>

            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                id="themeToggle"
                type="checkbox"
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Dark
            </label>

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>

            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                id="tooltipToggle"
                type="checkbox"
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Tooltip
            </label>
          </div>

          <button
            id="open-secondary-config"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            type="button"
            aria-haspopup="dialog"
            aria-controls="secondary-config"
          >
            Secondary config
          </button>

          <span
            id="secondary-summary"
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
            aria-live="polite"
          >
            Secondary: GSU + SEL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="cta-email text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
            <a
              href="/cdn-cgi/l/email-protection"
              className="__cf_email__"
              data-cfemail="f99d9c959e989d968b9c9f9c8b9c979a9cb99e94989095d79a9694"
            >
              [email&nbsp;protected]
            </a>
          </div>

          <nav className="flex items-center">
            <a
              href="https://www.linkedin.com/in/delgadorelayprotectionreference/"
              className="text-slate-400 hover:text-blue-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.98 3.5C4.98 5 3.9 6 2.5 6S0 5 0 3.5 1.1 1 2.5 1s2.48 1 2.48 2.5zM.5 8h4V24h-4V8zM9 8h3.8v2.2h.1c.6-1.1 2-2.2 4.1-2.2 4.4 0 5.2 2.9 5.2 6.6V24h-4v-7.7c0-1.8 0-4.1-2.5-4.1s-2.9 1.9-2.9 3.9V24h-4V8z" />
              </svg>
            </a>
          </nav>
        </div>
      </header>
      <main id="app" className="flex flex-col gap-8 p-4 min-w-0">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="animationControl flex-1 min-w-0">
            <div className="h-full">
              <section
                id="vis_inner_Z"
                className="flex flex-col lg:flex-row items-stretch gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
              >
                {/* LEFT SIDE */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Z Display Toggle */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div
                      className="flex items-center gap-3"
                      role="radiogroup"
                      aria-label="Impedance display base"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Z display:
                      </span>

                      <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                        <label className="flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-600 has-[:checked]:shadow-sm">
                          <input
                            type="radio"
                            name="z-display"
                            value="secondary"
                            className="hidden"
                          />
                          <span className="text-xs font-semibold">
                            Secondary
                          </span>
                        </label>

                        <label className="flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-600 has-[:checked]:shadow-sm">
                          <input
                            type="radio"
                            name="z-display"
                            value="primary"
                            className="hidden"
                          />
                          <span className="text-xs font-semibold">Primary</span>
                        </label>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span id="metering-summary">
                        CT ratio -- | VT ratio -- | Z scale --
                      </span>
                    </div>
                  </div>

                  <div
                    id="metering-feedback"
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase"
                    role="status"
                    aria-live="polite"
                  />

                  {/* Z SVG */}
                  <div className="relative aspect-square w-full max-w-md mx-auto">
                    <svg
                      id="vis_inner_Z_svg"
                      className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden"
                    />
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-full lg:w-56 space-y-6 shrink-0">
                  {/* Blinder */}
                  <fieldset className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <legend className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="blinderShow"
                          type="checkbox"
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        Show Blinder
                      </label>
                    </legend>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          ∠ Angle
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            id="blinderAngle"
                            type="number"
                            defaultValue="30"
                            step="0.1"
                            className="w-20 px-2 py-1 bg-white dark:bg-slate-800 rounded text-right shadow-sm"
                          />
                          <span className="text-xs text-slate-400 w-4">°</span>
                        </div>
                      </label>

                      <label className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          Radius
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            id="blinderArcRadius"
                            type="number"
                            defaultValue="10"
                            step="0.1"
                            className="w-20 px-2 py-1 bg-white dark:bg-slate-800 rounded text-right shadow-sm"
                          />
                          <span className="text-xs text-slate-400 w-4">Ω</span>
                        </div>
                      </label>
                    </div>
                  </fieldset>

                  {/* Characteristic Type */}
                  <fieldset className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <label className="flex-1 flex items-center justify-center py-1.5 rounded-md cursor-pointer has-[:checked]:bg-white dark:has-[:checked]:bg-slate-600 has-[:checked]:shadow-sm text-xs font-bold uppercase">
                      <input
                        type="radio"
                        name="charType"
                        value="MHO"
                        defaultChecked
                        className="hidden"
                      />
                      MHO
                    </label>

                    <label className="flex-1 flex items-center justify-center py-1.5 rounded-md cursor-pointer has-[:checked]:bg-white dark:has-[:checked]:bg-slate-600 has-[:checked]:shadow-sm text-xs font-bold uppercase">
                      <input
                        type="radio"
                        name="charType"
                        value="QUAD"
                        className="hidden"
                      />
                      Quad
                    </label>
                  </fieldset>
                  <section
                    id="option5"
                    className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                  >
                    {/* Fault presets matrix */}
                    <table className="w-full text-center">
                      <tbody
                        id="fault-presets-body"
                        className="grid grid-cols-3 gap-2"
                        role="radiogroup"
                        aria-label="Fault presets"
                      >
                        <tr className="contents">
                          <td className="contents">
                            <label
                              id="AG"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all active-fault"
                              title="simulate A to ground fault"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                defaultChecked
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                A-G
                              </span>
                            </label>
                          </td>

                          <td className="contents">
                            <label
                              id="BG"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate B to ground fault"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                B-G
                              </span>
                            </label>
                          </td>

                          <td className="contents">
                            <label
                              id="CG"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate C to ground fault"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                C-G
                              </span>
                            </label>
                          </td>
                        </tr>

                        <tr className="contents">
                          <td className="contents">
                            <label
                              id="AB"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate fault between B and A"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                AB
                              </span>
                            </label>
                          </td>

                          <td className="contents">
                            <label
                              id="BC"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate fault between C and B"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                BC
                              </span>
                            </label>
                          </td>

                          <td className="contents">
                            <label
                              id="CA"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate fault between A and C"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                CA
                              </span>
                            </label>
                          </td>
                        </tr>

                        <tr className="contents">
                          <td className="contents">
                            <label
                              id="ABG"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate AB to ground"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                AB-G
                              </span>
                            </label>
                          </td>

                          <td className="contents">
                            <label
                              id="BCG"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate BC to ground"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                BC-G
                              </span>
                            </label>
                          </td>

                          <td className="contents">
                            <label
                              id="CAG"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate CA to ground"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                CA-G
                              </span>
                            </label>
                          </td>
                        </tr>

                        <tr className="contents">
                          <td></td>

                          <td className="contents">
                            <label
                              id="ABC"
                              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                              title="simulate three phase fault"
                            >
                              <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                                className="hidden"
                              />
                              <span className="text-xs font-bold dark:text-slate-200">
                                ABC
                              </span>
                            </label>
                          </td>

                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </div>
              </section>
            </div>
          </div>
          <aside
            id="Left_Table"
            className="w-full lg:w-96 flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0"
          >
            <section
              id="option4"
              className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
            >
              {/* Z Line */}
              <article>
                <header id="headingTwo_Z" className="mb-2">
                  <div className="flex flex-col gap-1">
                    <div
                      id="collapse0"
                      className="text-lg font-bold text-slate-800 dark:text-slate-100"
                    >
                      Positive Sequence Z<sub>1</sub>
                    </div>
                    <div
                      id="collapseZ0"
                      className="text-md font-semibold text-slate-500 dark:text-slate-400"
                    >
                      Zero Sequence Z<sub>0</sub>
                    </div>
                  </div>
                </header>

                <hr className="mb-2 border-slate-200 dark:border-slate-700" />

                <div id="collapseOne_Z">
                  <section id="components_Z_Line_row4" className="zline">
                    <form
                      id="zline-form"
                      className="space-y-2"
                      role="group"
                      aria-labelledby="headingTwo_Z"
                    >
                      {/* Line parameters */}
                      <fieldset className="space-y-2">
                        <legend className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          Line parameters
                        </legend>

                        <div className="grid gap-3">
                          <label className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium text-slate-600 dark:text-slate-300"
                              title="Positive Sequence Ohms per unit of length"
                            >
                              Z <sub>1</sub>
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z_ratio"
                                type="number"
                                step="0.01"
                                defaultValue="0.29"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span
                                className="text-xs text-slate-400 spanOhmsPerUnit min-w-[3rem]"
                                aria-hidden="true"
                              >
                                Ω/km
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium text-slate-600 dark:text-slate-300"
                              title="Zero Sequence Ohms per unit of length"
                            >
                              Z <sub>0</sub>
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z0_ratio"
                                type="number"
                                step="0.01"
                                defaultValue="0.9"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span
                                className="text-xs text-slate-400 spanOhmsPerUnit min-w-[3rem]"
                                aria-hidden="true"
                              >
                                Ω/km
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium text-slate-600 dark:text-slate-300"
                              title="Length in km or miles"
                            >
                              ℓ
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z_l"
                                type="number"
                                step="0.01"
                                defaultValue="20"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                id="spanUnit"
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded min-w-[3rem] hover:bg-blue-200 transition-colors"
                                title="Toggle unit"
                              >
                                km
                              </button>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium text-slate-600 dark:text-slate-300"
                              title="Positive-sequence line magnitude |Z1| = Z1_ratio · ℓ"
                            >
                              |Z<sub>1</sub>| (line)
                            </span>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <input
                                id="ZLmag"
                                type="number"
                                step="0.001"
                                defaultValue="5.800"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="min-w-[3rem]">Ω</span>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              Z <sub>1</sub> ∠
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z_angle"
                                type="number"
                                step="0.01"
                                defaultValue="80"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-slate-400 min-w-[3rem]">
                                °
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              Z <sub>0</sub> ∠
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z0_angle"
                                type="number"
                                step="0.01"
                                defaultValue="77.5"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-slate-400 min-w-[3rem]">
                                °
                              </span>
                            </div>
                          </label>
                        </div>
                      </fieldset>

                      {/* Zones */}
                      <fieldset className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <legend className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          Reach (Zones)
                        </legend>

                        <div className="grid gap-3">
                          <label className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium text-slate-600 dark:text-slate-300"
                              title="Zone 1 reach typically set at 80% of the line"
                            >
                              Zone<sub>1</sub>
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z1"
                                type="number"
                                step="0.01"
                                defaultValue="80"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-slate-400 min-w-[3rem]">
                                %
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium text-slate-600 dark:text-slate-300"
                              title="Zone 2 reach typically set at 120% of the line"
                            >
                              Zone<sub>2</sub>
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z2"
                                type="number"
                                step="0.01"
                                defaultValue="120"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-slate-400 min-w-[3rem]">
                                %
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              Zone<sub>3</sub>
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                id="Z3"
                                type="number"
                                step="0.01"
                                defaultValue="200"
                                inputMode="decimal"
                                className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-slate-400 min-w-[3rem]">
                                %
                              </span>
                            </div>
                          </label>
                        </div>
                      </fieldset>
                    </form>
                  </section>
                </div>
              </article>
            </section>

            <section
              id="source-gsu"
              className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <header className="flex flex-col gap-2">
                <strong className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  IBR / Weak system model
                </strong>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <svg
                    id="i0-schematic"
                    aria-hidden="true"
                    width="100%"
                    height="30"
                    viewBox="0 0 168 24"
                    className="mx-auto border-none shadow-none"
                  >
                    <title>—</title>

                    {/* Left: Yg */}
                    <g
                      id="sym-left-Yg"
                      transform="translate(4,2)"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                    >
                      <path d="M6 0 L6 8 M0 8 L12 8 M6 8 L6 14" />
                      <g id="gnd-left">
                        <circle cx="6" cy="14" r="1.2" fill="currentColor" />
                        <path d="M6 15 L6 19 M2 19 L10 19 M3 20.5 L9 20.5 M4 22 L8 22" />
                      </g>
                      <text
                        x="14"
                        y="10"
                        fontSize="8"
                        dominantBaseline="middle"
                        fill="currentColor"
                      >
                        Yg
                      </text>
                    </g>

                    {/* Transformer core */}
                    <g
                      id="sym-T"
                      transform="translate(70,3)"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                    >
                      <rect x="0" y="0" width="24" height="18" rx="2" />
                      <text
                        x="12"
                        y="9.3"
                        fontSize="9"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                      >
                        T
                      </text>
                    </g>

                    <text
                      id="phase-label"
                      x="94"
                      y="6"
                      fontSize="7"
                      style={{ display: "none" }}
                      fill="currentColor"
                    >
                      30°
                    </text>

                    {/* Right: Δg (default) */}
                    <g
                      id="sym-right-Delta"
                      transform="translate(124,2)"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                    >
                      <path d="M6 0 L12 10 L0 10 Z" />
                      <g id="gnd-right" transform="translate(6,10)">
                        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
                        <path d="M0 1 L0 5 M-4 5 L4 5 M-3 6.5 L3 6.5 M-2 8 L2 8" />
                      </g>
                      <text
                        x="16"
                        y="8"
                        fontSize="8"
                        dominantBaseline="middle"
                        fill="currentColor"
                      >
                        Δg
                      </text>
                    </g>

                    {/* Right: Yg (hidden unless YYg) */}
                    <g
                      id="sym-right-Yg"
                      transform="translate(124,2)"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                      style={{ display: "none" }}
                    >
                      <path d="M6 0 L6 8 M0 8 L12 8 M6 8 L6 14" />
                      <g id="gnd-right-Y">
                        <circle cx="6" cy="14" r="1.2" fill="currentColor" />
                        <path d="M6 15 L6 19 M2 19 L10 19 M3 20.5 L9 20.5 M4 22 L8 22" />
                      </g>
                      <text
                        x="14"
                        y="10"
                        fontSize="8"
                        dominantBaseline="middle"
                        fill="currentColor"
                      >
                        Yg
                      </text>
                    </g>
                  </svg>
                </div>
              </header>

              <div className="flex flex-wrap gap-2 text-xs">
                <label className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <input
                    id="z0inf-local"
                    type="checkbox"
                    className="w-3 h-3 rounded shadow-sm"
                  />
                  Local Z₀ = ∞
                </label>

                <label className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <input
                    id="z0inf-remote"
                    type="checkbox"
                    className="w-3 h-3 rounded shadow-sm"
                  />
                  Remote Z₀ = ∞
                </label>

                <label className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <input
                    id="link-quad"
                    type="checkbox"
                    defaultChecked
                    className="w-3 h-3 rounded shadow-sm"
                  />
                  Link quad to I₀
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                    GSU preset
                  </span>
                  <select
                    id="gsu-preset"
                    className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">none</option>
                    <option value="DY1g">DY1 (Yg–Δ) + grounded tertiary</option>
                    <option value="DY5g">DY5 (Yg–Δ) + grounded tertiary</option>
                    <option value="YYg">YY (Yg–Yg) + grounded tertiary</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">
                      Neutral R<sub>n</sub> (Ω)
                    </span>
                    <input
                      id="Rn"
                      type="number"
                      step="0.01"
                      defaultValue="0.00"
                      className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">
                      Neutral X<sub>n</sub> (Ω)
                    </span>
                    <input
                      id="Xn"
                      type="number"
                      step="0.01"
                      defaultValue="0.00"
                      className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    id="rev-slg"
                    type="checkbox"
                    className="w-3 h-3 rounded shadow-sm"
                  />
                  Reverse SLG (behind GSU)
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                      I2 scale
                    </span>
                    <output
                      id="qscale-out"
                      htmlFor="qscale"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400"
                    >
                      1.00x
                    </output>
                  </div>

                  <input
                    id="qscale"
                    type="range"
                    min="0.10"
                    max="1.50"
                    step="0.05"
                    defaultValue="1"
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span
                  id="i0-path-badge"
                  className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase tracking-wider"
                >
                  I₀ path: strong
                </span>

                <span
                  id="z0-seen-badge"
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider"
                >
                  Z₀(seen): — Ω / —°
                </span>
              </div>

              <p
                id="z0model-note"
                className="text-[10px] text-slate-400 italic leading-snug"
              ></p>

              <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-700">
                Model scales 3V₀/3I₀ used by 32V/Q from a simple
                sequence-network: Z₀(term) = 3(R<sub>n</sub>+jX<sub>n</sub>),
                terminals in parallel, ∞ when toggled. Optional link nudges quad
                resistive sides with I₀ strength.
              </p>
            </section>
          </aside>
        </div>
        <aside
          id="Right_Table"
          className="w-full flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0"
          aria-label="Vectors"
        >
          <section className="flex flex-col lg:flex-row gap-4 w-full">
            <div
              id="vis_inner_V"
              className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-0 flex flex-col lg:flex-row gap-4 items-start"
            >
              <div className="flex-1 min-w-0 w-full">
                <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-2">
                  <svg
                    id="vis_inner_V_svg"
                    className="w-full h-full border-none shadow-none bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden"
                  />
                </div>
                <table className="w-full text-xs opacity-80 pt-2">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <tr>
                      <td className="py-2 font-bold text-slate-500">V0</td>
                      <td className="py-2 text-slate-400 font-medium">=</td>
                      <td className="py-2">
                        <form id="form_Amp_0" onBlur={() => {}}>
                          <input
                            id="Amp_0"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                      <td className="py-2">
                        <form id="form_Angle_0" onBlur={() => {}}>
                          <input
                            id="Angle_0"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-slate-500">V1</td>
                      <td className="py-2 text-slate-400 font-medium">=</td>
                      <td className="py-2">
                        <form id="form_Amp_1" onBlur={() => {}}>
                          <input
                            id="Amp_1"
                            type="number"
                            step="0.01"
                            defaultValue="115"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                      <td className="py-2">
                        <form id="form_Angle_1" onBlur={() => {}}>
                          <input
                            id="Angle_1"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-slate-500">V2</td>
                      <td className="py-2 text-slate-400 font-medium">=</td>
                      <td className="py-2">
                        <form id="form_Amp_2" onBlur={() => {}}>
                          <input
                            id="Amp_2"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                      <td className="py-2">
                        <form id="form_Angle_2" onBlur={() => {}}>
                          <input
                            id="Angle_2"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex-[1.5] min-w-0 w-full space-y-4">
                <fieldset className="mb-4" id="meteringBaseVT">
                  <legend className="flex items-center gap-3 w-full border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      VT / PT Ratio
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <output
                        id="vt-ratio"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400"
                      >
                        --
                      </output>
                      <select
                        id="vt-mode"
                        className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border-none rounded font-bold uppercase cursor-pointer"
                      >
                        <option value="LN">LN</option>
                        <option value="LL">LL</option>
                      </select>
                    </div>
                  </legend>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Primary (V LL)
                      </span>
                      <input
                        id="vt-primary"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Secondary (V)
                      </span>
                      <input
                        id="vt-secondary"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <input
                      id="vt-nominal"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      className="hidden"
                    />
                  </div>
                </fieldset>

                <div
                  id="table_V"
                  className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <form
                      id="form_toggle"
                      className="cursor-pointer transition-transform hover:scale-110"
                      title="click to lock voltage VA, VB, VC balanced"
                    >
                      <img
                        src="./img/closed unlock.svg"
                        id="img_toggleon"
                        className="w-8 h-8 opacity-80"
                        alt="Toggle V lock"
                      />
                      <input
                        type="text"
                        defaultValue="0"
                        id="toggleon"
                        className="hidden"
                      />
                      <output
                        name="toggle"
                        htmlFor="toggleon"
                        className="hidden"
                      />
                    </form>

                    <button
                      type="button"
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors"
                      id="Reset_All_Data_V_ABC"
                      onClick={handleResetV}
                    >
                      Reset V
                    </button>
                  </div>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase text-[10px]">
                        <th className="text-left pb-2">Phase</th>
                        <th className="pb-2"></th>
                        <th className="text-right pb-2">(V)</th>
                        <th className="text-right pb-2">∠(°)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr className="group">
                        <td className="py-2 font-bold text-slate-600 dark:text-slate-300">
                          VA
                        </td>
                        <td className="py-2 text-slate-400 font-medium">=</td>
                        <td className="py-2">
                          <form id="form_Amp_A" onBlur={() => {}}>
                            <input
                              id="Amp_A"
                              type="number"
                              step="0.01"
                              defaultValue="0"
                              className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                            />
                          </form>
                        </td>
                        <td className="py-2">
                          <form id="form_Angle_A" onBlur={() => {}}>
                            <input
                              id="Angle_A"
                              type="number"
                              step="0.01"
                              defaultValue="0"
                              className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                            />
                          </form>
                        </td>
                      </tr>
                      <tr className="group">
                        <td className="py-2 font-bold text-slate-600 dark:text-slate-300">
                          VB
                        </td>
                        <td className="py-2 text-slate-400 font-medium">=</td>
                        <td className="py-2">
                          <form id="form_Amp_B" onBlur={() => {}}>
                            <input
                              id="Amp_B"
                              type="number"
                              step="0.01"
                              defaultValue="115"
                              className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                            />
                          </form>
                        </td>
                        <td className="py-2">
                          <form id="form_Angle_B" onBlur={() => {}}>
                            <input
                              id="Angle_B"
                              type="number"
                              step="0.01"
                              defaultValue="0"
                              className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                            />
                          </form>
                        </td>
                      </tr>
                      <tr className="group">
                        <td className="py-2 font-bold text-slate-600 dark:text-slate-300">
                          VC
                        </td>
                        <td className="py-2 text-slate-400 font-medium">=</td>
                        <td className="py-2">
                          <form id="form_Amp_C" onBlur={() => {}}>
                            <input
                              id="Amp_C"
                              type="number"
                              step="0.01"
                              defaultValue="0"
                              className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                            />
                          </form>
                        </td>
                        <td className="py-2">
                          <form id="form_Angle_C" onBlur={() => {}}>
                            <input
                              id="Angle_C"
                              type="number"
                              step="0.01"
                              defaultValue="0"
                              className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                            />
                          </form>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="grid grid-cols-3 gap-2 px-2 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-[10px] font-bold text-slate-400">
                        VAB
                      </span>
                      <div className="flex flex-col items-center">
                        <span
                          id="Amp_AB_Ph2Ph"
                          className="text-xs font-bold text-slate-700 dark:text-slate-200"
                        >
                          199.2
                        </span>
                        <span
                          id="Angle_AB_Ph2Ph"
                          className="text-[10px] text-slate-400"
                        >
                          ∠-150.0
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center border-x border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400">
                        VBC
                      </span>
                      <div className="flex flex-col items-center">
                        <span
                          id="Amp_BC_Ph2Ph"
                          className="text-xs font-bold text-slate-700 dark:text-slate-200"
                        >
                          199.2
                        </span>
                        <span
                          id="Angle_BC_Ph2Ph"
                          className="text-[10px] text-slate-400"
                        >
                          ∠90.0
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-[10px] font-bold text-slate-400">
                        VCA
                      </span>
                      <div className="flex flex-col items-center">
                        <span
                          id="Amp_CA_Ph2Ph"
                          className="text-xs font-bold text-slate-700 dark:text-slate-200"
                        >
                          199.2
                        </span>
                        <span
                          id="Angle_CA_Ph2Ph"
                          className="text-[10px] text-slate-400"
                        >
                          ∠-30.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Section */}

            <div
              id="vis_inner_I"
              className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-0 flex flex-col lg:flex-row gap-4 items-start"
            >
              <div className="flex-1 min-w-0 w-full">
                <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-2">
                  <svg
                    id="vis_inner_I_svg"
                    className="w-full h-full border-none shadow-none bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden"
                  />
                </div>

                <table className="w-full text-xs opacity-80 pt-2">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <tr>
                      <td className="py-2 font-bold text-slate-500">I0</td>
                      <td className="py-2 text-slate-400 font-medium">=</td>
                      <td className="py-2">
                        <form id="form_Amp_0_I" onBlur={() => {}}>
                          <input
                            id="Amp_0_I"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                      <td className="py-2">
                        <form id="form_Angle_0_I" onBlur={() => {}}>
                          <input
                            id="Angle_0_I"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-slate-500">I1</td>
                      <td className="py-2 text-slate-400 font-medium">=</td>
                      <td className="py-2">
                        <form id="form_Amp_1_I" onBlur={() => {}}>
                          <input
                            id="Amp_1_I"
                            type="number"
                            step="0.01"
                            defaultValue="5"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                      <td className="py-2">
                        <form id="form_Angle_1_I" onBlur={() => {}}>
                          <input
                            id="Angle_1_I"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-slate-500">I2</td>
                      <td className="py-2 text-slate-400 font-medium">=</td>
                      <td className="py-2">
                        <form id="form_Amp_2_I" onBlur={() => {}}>
                          <input
                            id="Amp_2_I"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                      <td className="py-2">
                        <form id="form_Angle_2_I" onBlur={() => {}}>
                          <input
                            id="Angle_2_I"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex-[1.5] min-w-0 w-full space-y-4">
                <fieldset className="mb-4" id="meteringBaseCT">
                  <legend className="flex items-center gap-3 w-full border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      CT Ratio
                    </span>
                    <output
                      id="ct-ratio"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 ml-auto"
                    >
                      --
                    </output>

                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                      <label className="px-2 py-0.5 text-[10px] font-bold cursor-pointer rounded transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-600 has-[:checked]:shadow-sm">
                        <input
                          type="radio"
                          name="ct-nominal"
                          value="5"
                          className="hidden"
                        />
                        5 A
                      </label>
                      <label className="px-2 py-0.5 text-[10px] font-bold cursor-pointer rounded transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-600 has-[:checked]:shadow-sm">
                        <input
                          type="radio"
                          name="ct-nominal"
                          value="1"
                          className="hidden"
                        />
                        1 A
                      </label>
                    </div>
                  </legend>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Primary
                      </span>
                      <input
                        id="ct-primary"
                        type="number"
                        inputMode="decimal"
                        step="1"
                        min="0"
                        className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Secondary
                      </span>
                      <input
                        id="ct-secondary"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </fieldset>

                <div
                  id="table_I"
                  className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <form
                      id="form_toggle_I"
                      className="cursor-pointer transition-transform hover:scale-110"
                      title="click to lock currents IA, IB, IC balanced"
                    >
                      <img
                        src="./img/closed unlock.svg"
                        id="img_toggleon_I"
                        className="w-8 h-8 opacity-80"
                        alt="Toggle I lock"
                      />
                      <input
                        type="text"
                        defaultValue="0"
                        id="toggleon_I"
                        className="hidden"
                      />
                      <output
                        name="toggle_I"
                        htmlFor="toggleon_I"
                        className="hidden"
                      />
                    </form>

                    <button
                      type="button"
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors"
                      id="Reset_All_Data_I_ABC"
                      onClick={handleResetI}
                    >
                      Reset I
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase text-[10px]">
                          <th className="text-left pb-2">Phase</th>
                          <th className="pb-2"></th>
                          <th className="text-right pb-2">(I)</th>
                          <th className="text-right pb-2">∠(°)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        <tr className="group">
                          <td className="py-2 font-bold text-slate-600 dark:text-slate-300">
                            IA
                          </td>
                          <td className="py-2 text-slate-400 font-medium">=</td>
                          <td className="py-2">
                            <form id="form_Amp_A_I" onBlur={() => {}}>
                              <input
                                id="Amp_A_I"
                                type="number"
                                step="0.01"
                                defaultValue="0"
                                className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                              />
                            </form>
                          </td>
                          <td className="py-2">
                            <form id="form_Angle_A_I" onBlur={() => {}}>
                              <input
                                id="Angle_A_I"
                                type="number"
                                step="0.01"
                                defaultValue="0"
                                className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                              />
                            </form>
                          </td>
                        </tr>
                        <tr className="group">
                          <td className="py-2 font-bold text-slate-600 dark:text-slate-300">
                            IB
                          </td>
                          <td className="py-2 text-slate-400 font-medium">=</td>
                          <td className="py-2">
                            <form id="form_Amp_B_I" onBlur={() => {}}>
                              <input
                                id="Amp_B_I"
                                type="number"
                                step="0.01"
                                defaultValue="5"
                                className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                              />
                            </form>
                          </td>
                          <td className="py-2">
                            <form id="form_Angle_B_I" onBlur={() => {}}>
                              <input
                                id="Angle_B_I"
                                type="number"
                                step="0.01"
                                defaultValue="0"
                                className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                              />
                            </form>
                          </td>
                        </tr>
                        <tr className="group">
                          <td className="py-2 font-bold text-slate-600 dark:text-slate-300">
                            IC
                          </td>
                          <td className="py-2 text-slate-400 font-medium">=</td>
                          <td className="py-2">
                            <form id="form_Amp_C_I" onBlur={() => {}}>
                              <input
                                id="Amp_C_I"
                                type="number"
                                step="0.01"
                                defaultValue="0"
                                className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                              />
                            </form>
                          </td>
                          <td className="py-2">
                            <form id="form_Angle_C_I" onBlur={() => {}}>
                              <input
                                id="Angle_C_I"
                                type="number"
                                step="0.01"
                                defaultValue="0"
                                className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded text-right focus:ring-2 focus:ring-blue-500"
                              />
                            </form>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="grid grid-cols-3 gap-2 px-2 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-bold text-slate-400">
                          IAB
                        </span>
                        <div className="flex flex-col items-center">
                          <span
                            id="Amp_AB_Ph2Ph_I"
                            className="text-xs font-bold text-slate-700 dark:text-slate-200"
                          >
                            8.7
                          </span>
                          <span
                            id="Angle_AB_Ph2Ph_I"
                            className="text-[10px] text-slate-400"
                          >
                            ∠-150.0
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-center border-x border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400">
                          IBC
                        </span>
                        <div className="flex flex-col items-center">
                          <span
                            id="Amp_BC_Ph2Ph_I"
                            className="text-xs font-bold text-slate-700 dark:text-slate-200"
                          >
                            8.7
                          </span>
                          <span
                            id="Angle_BC_Ph2Ph_I"
                            className="text-[10px] text-slate-400"
                          >
                            ∠90.0
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-bold text-slate-400">
                          ICA
                        </span>
                        <div className="flex flex-col items-center">
                          <span
                            id="Amp_CA_Ph2Ph_I"
                            className="text-xs font-bold text-slate-700 dark:text-slate-200"
                          >
                            8.7
                          </span>
                          <span
                            id="Angle_CA_Ph2Ph_I"
                            className="text-[10px] text-slate-400"
                          >
                            ∠-30.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </main>
      <section
        id="secondary-config"
        className="secondary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="secondary-title"
        aria-hidden="true"
      >
        <div className="secondary-backdrop" data-secondary-close></div>

        <div className="secondary-surface" role="document">
          <header className="secondary-header">
            <div className="secondary-heading">
              <h2 id="secondary-title">Secondary configuration</h2>
              <p
                id="secondary-status"
                className="secondary-status"
                aria-live="polite"
              >
                No pending changes
              </p>
            </div>

            <div className="secondary-actions">
              <button id="secondary-apply" className="btn" type="button">
                Apply
              </button>

              <button id="secondary-revert" className="btn" type="button">
                Revert
              </button>

              <button id="secondary-cancel" className="btn" type="button">
                Cancel
              </button>

              <button
                id="secondary-close"
                className="btn"
                type="button"
                aria-label="Close secondary configuration"
              >
                Close
              </button>
            </div>
          </header>

          <div id="secondary-body" className="secondary-body"></div>
        </div>
      </section>
    </>
  );
}

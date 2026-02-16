// Fallbacks so this module doesn’t depend on page globals
import * as d3 from "d3";
import $ from "jquery";

const units = window.units || (window.units = { mode: "SEC" });

const state =
  window.selState ||
  (window.selState = {
    settings: {
      negativeSeq: { "50QFP": 0.5, "50QRP": 0.25, a2: 0.1, k2: 0.2 },
      zeroSeq: { "50GFP": 0.5, "50GRP": 0.25, a0: 0.1 },
      flags: { E32IV: true, ILOP: false, ELOP: "N" },
      comparators: { mode: "AUTO", band: 0.3, deadband: 0.05 },
      order: "QV",
    },
    bits: {},
    choice: "I",
    orderResolved: "QV",
  });

// Use page-defined BIT_ROWS if present; otherwise default
const BIT_ROWS = window.BIT_ROWS || [
  { name: "50QF", formula: "" },
  { name: "50QR", formula: "" },
  { name: "32QE", formula: "" },
  { name: "50GF", formula: "" },
  { name: "50GR", formula: "" },
  { name: "32VE", formula: "" },
  { name: "32QGE", formula: "" },
  { name: "CHOICE", formula: "" },
  { name: "LOPBLOCK", formula: "" },
  { name: "Z2<FTH", formula: "" },
  { name: "Z2>RTH", formula: "" },
  { name: "F32Q", formula: "" },
  { name: "R32Q", formula: "" },
  { name: "Z0<FTH", formula: "" },
  { name: "Z0>RTH", formula: "" },
  { name: "F32V", formula: "" },
  { name: "R32V", formula: "" },
  { name: "32IE", formula: "" },
  { name: "F32I", formula: "" },
  { name: "R32I", formula: "" },
  { name: "F32P", formula: "" },
  { name: "R32P", formula: "" },
  { name: "32PF", formula: "" },
  { name: "32PR", formula: "" },
];

// --- ensure HTML host for the enable matrix is present ---------------------
function isForeignObjectNode(node) {
  return (
    typeof SVGForeignObjectElement !== "undefined" &&
    node instanceof SVGForeignObjectElement
  );
}

export function ensureSELTable() {
  let host = document.getElementById("svgSELTable");
  if (host) {
    const table = host.querySelector("#enable-matrix");
    if (table) table.classList.remove("visible");
    return true;
  }

  const rightTable = document.getElementById("Right_Table");
  if (!rightTable) return false;

  const section = document.createElement("section");
  section.id = "sel-enable-table";
  section.className = "sel-enable-panel secondary-panel";

  const header = document.createElement("header");
  header.className = "panel-header";
  const title = document.createElement("h2");
  title.className = "panel-title";
  title.textContent = "SEL Logic Matrix";
  header.append(title);

  const wrapper = document.createElement("div");
  wrapper.id = "svgSELTable";
  wrapper.className = "sel-enable-container";
  wrapper.style.display = "none";

  const note = document.createElement("div");
  note.id = "note";
  note.className = "note";
  wrapper.append(note);

  const table = document.createElement("table");
  table.id = "enable-matrix";
  const thead = document.createElement("thead");
  thead.innerHTML =
    "<tr><th>Bit</th><th>Status / Choice</th><th></th><th>Value (used)</th></tr>";
  const tbody = document.createElement("tbody");
  table.append(thead, tbody);
  wrapper.append(table);

  section.append(header, wrapper);
  rightTable.append(section);
  return true;
}

/*********************************************************************
 *  Preset persistence                                             *
 *********************************************************************/
let presets = {}; // declared *before* loadPresets() is defined / called

// --- Preset helpers: collect and apply inputs/vectors -----------------------
/**
 * @param {Document | Element} root - The root element to search for inputs
 * @returns {Record<string, string>}
 */
export function collectAllInputs(root = document) {
  const out = {};
  const IGNORE_IDS = new Set(["themeToggle", "densityToggle", "tooltipToggle"]);
  const ctrls = Array.from(root.querySelectorAll("input,select,textarea"));
  // non-radio by id
  ctrls.forEach((el) => {
    if (!el.id) return;
    if (IGNORE_IDS.has(el.id)) return;
    if (el.type === "file") return;
    if (el.type === "radio") return;
    out[el.id] = el.type === "checkbox" ? !!el.checked : String(el.value);
  });
  // radios by name
  const names = new Set(
    ctrls.filter((el) => el.type === "radio" && el.name).map((el) => el.name),
  );
  names.forEach((name) => {
    const checked = root.querySelector(
      `input[type=radio][name="${CSS.escape(name)}"]:checked`,
    );
    if (checked) out[`$radio:${name}`] = checked.value;
  });
  return out;
}

export function applyAllInputs(map) {
  if (!map) return;
  for (const [key, val] of Object.entries(map)) {
    if (key.startsWith("$radio:")) {
      const name = key.slice(7);
      const el = document.querySelector(
        `input[type=radio][name="${CSS.escape(name)}"][value="${CSS.escape(val)}"]`,
      );
      if (el && !el.checked) {
        el.checked = true;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      continue;
    }
    const el = document.getElementById(key);
    if (!el) continue;
    if (el.type === "file") continue;
    if (el.type === "checkbox") {
      const next = !!val;
      if (el.checked !== next) {
        el.checked = next;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else {
      const next = String(val);
      if (el.value !== next) {
        el.value = next;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }
}

function collectVectors() {
  try {
    return {
      psa,
      psb,
      psc,
      psa_I,
      psb_I,
      psc_I,
      ps_KN,
      va,
      vb,
      vc,
      ia,
      ib,
      ic,
    };
  } catch {
    return {};
  }
}

function applyVectors(v) {
  if (!v) return;
  try {
    if (v.psa) psa = v.psa.map((p) => p.slice());
    if (v.psb) psb = v.psb.map((p) => p.slice());
    if (v.psc) psc = v.psc.map((p) => p.slice());
    if (v.psa_I) psa_I = v.psa_I.map((p) => p.slice());
    if (v.psb_I) psb_I = v.psb_I.map((p) => p.slice());
    if (v.psc_I) psc_I = v.psc_I.map((p) => p.slice());
    if (v.ps_KN) ps_KN = v.ps_KN.map((p) => p.slice());
    if (psa?.[0]) va = psa[0].slice();
    if (psb?.[0]) vb = psb[0].slice();
    if (psc?.[0]) vc = psc[0].slice();
    if (psa_I?.[0]) ia = psa_I[0].slice();
    if (psb_I?.[0]) ib = psb_I[0].slice();
    if (psc_I?.[0]) ic = psc_I[0].slice();
  } catch {}
}

export function loadPresets() {
  try {
    presets = JSON.parse(localStorage.getItem("sel_presets")) || {};
  } catch {
    presets = {};
  }
  renderPresetSelect();
}

export function renderPresetSelect() {
  const sel = document.getElementById("preset-select");
  if (!sel) return; // not on page yet (e.g. early module load)
  sel.innerHTML = "";
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "none";
  sel.append(none);
  Object.keys(presets).forEach((name) => {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    sel.append(o);
  });
}

export function saveCurrentToPreset() {
  const name = prompt(
    "Preset name:",
    document.getElementById("preset-select").value || "",
  );
  if (!name) return;
  // Build settings used by compute() from current UI values
  const settings = {
    negativeSeq: {
      "50QFP": +$("#50QFP").val() || 0,
      "50QRP": +$("#50QRP").val() || 0,
      a2: +$("#a2").val() || 0,
      k2: +$("#k2").val() || 0,
    },
    zeroSeq: {
      "50GFP": +$("#50GFP").val() || 0,
      "50GRP": +$("#50GRP").val() || 0,
      a0: +$("#a0").val() || 0,
    },
    flags: {
      E32IV: !!document.getElementById("E32IV")?.checked,
      ILOP: !!document.getElementById("ILOP")?.checked,
      ELOP: (document.getElementById("ELOP")?.value || "N")
        .toString()
        .toUpperCase(),
    },
    comparators: {
      mode: (
        document.querySelector('input[name="scalar-mode"]:checked')?.value ||
        state.settings?.comparators?.mode ||
        "AUTO"
      )
        .toString()
        .toUpperCase(),
      band: Number.isFinite(state.settings?.comparators?.band)
        ? state.settings.comparators.band
        : 0.3,
      deadband: Number.isFinite(state.settings?.comparators?.deadband)
        ? state.settings.comparators.deadband
        : 0.05,
    },
    order: (
      document.getElementById("ORDER")?.value ||
      state.settings.order ||
      ""
    )
      .toString()
      .toUpperCase(),
  };

  presets[name] = {
    settings,
    inputsAll: collectAllInputs(document),
    vectors: collectVectors(),
  };
  localStorage.setItem("sel_presets", JSON.stringify(presets));
  localStorage.setItem("sel_last_preset", name);
  loadPresets();
  document.getElementById("preset-select").value = name;
}

export function applyPreset(name) {
  if (!presets[name]) return;
  const p = presets[name] || {};
  if (p.settings) {
    Object.assign(state.settings, p.settings);
    state.settings.flags = Object.assign(
      { E32IV: true, ILOP: false, ELOP: "N" },
      state.settings.flags || {},
    );
    state.settings.comparators = Object.assign(
      { mode: "AUTO", band: 0.3, deadband: 0.05 },
      state.settings.comparators || {},
    );
  }
  if (p.inputsAll) applyAllInputs(p.inputsAll);
  if (p.vectors) applyVectors(p.vectors);
  try {
    window.recordAndUpdate ? window.recordAndUpdate() : compute();
  } catch {
    compute();
  }
}

export function deletePreset(name) {
  if (!presets[name]) return;
  if (!confirm(`Delete preset "${name}"?`)) return;
  delete presets[name];
  localStorage.setItem("sel_presets", JSON.stringify(presets));
  loadPresets();
  document.getElementById("preset-select").value = "";
}

export function buildMatrix() {
  const tbody = document.querySelector("#enable-matrix tbody");
  tbody.innerHTML = "";
  BIT_ROWS.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td id="bit-${r.name}label">${r.name}</td><td id="bit-${r.name}" data-cell="${r.name}"></td><td>${r.formula}</td><td id="val-${r.name}"></td>`;
    tbody.append(tr);
  });
}

// --- tiny complex helpers (module-local) ---
const d2r = (d) => (d * Math.PI) / 180;
const C = (re, im) => ({ re, im });
const pol = (m, deg) => C(m * Math.cos(d2r(deg)), m * Math.sin(d2r(deg)));
const add = (a, b) => C(a.re + b.re, a.im + b.im);
const sub = (a, b) => C(a.re - b.re, a.im - b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const divc = (a, b) => {
  const d = b.re * b.re + b.im * b.im || 1e-12;
  return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const conj = (z) => C(z.re, -z.im);
const mag = (z) => Math.hypot(z.re, z.im);

// SEL torque-style comparator:  RE{ V * conj( I * e^{jtheta} ) } / |I|^2
function zComp(V, I, thetaDeg) {
  const ez = pol(1, thetaDeg);
  const num = mul(V, conj(mul(I, ez)));
  const den = Math.max(1e-12, mag(I) ** 2);
  return num.re / den;
}

// workbook thresholds
const fwdTH = (Zf, Zmag) =>
  Zf <= 0 ? 0.75 * Zf - 0.25 * Zmag : 1.25 * Zf - 0.25 * Zmag;
const revTH = (Zr, Zmag) =>
  Zr >= 0 ? 0.75 * Zr + 0.25 * Zmag : 1.25 * Zr + 0.25 * Zmag;

// === Scalar comparators (z2 / z0) — helpers ================================
// Get magnitudes that main.js publishes globally (secondary units).
function _seqMag(name) {
  const v = window?.[name];
  return Number.isFinite(v) ? +v : 0;
}
// Build |Z| from |V|/|I| (secondary ohms). Infinity when I≈0.
function _zMagFromSeq(vName, iName) {
  const V = _seqMag(vName),
    I = _seqMag(iName);
  return Math.abs(I) > 1e-9 ? V / I : Infinity;
}

// Compute all scalar deltas + AUTO window. Keeps backward-compat globals too.
function _buildScalarComparators() {
  // UI thresholds
  const Z2Fth = +document.getElementById("Z2F")?.value || 0;
  const Z2Rth = +document.getElementById("Z2R")?.value || 0;
  const Z0Fth = +document.getElementById("Z0F")?.value || 0;
  const Z0Rth = +document.getElementById("Z0R")?.value || 0;

  // Measured |z| (secondary) from live sequences: |z2|=|V2|/|I2|, |z0|=|V0|/|I0|
  const z2Mag = _zMagFromSeq("Amp_2_value", "Amp_2_value_I");
  const z0Mag = _zMagFromSeq("Amp_0_value", "Amp_0_value_I");

  // Mode & window (AUTO uses +/-band with a small deadband)
  const cmp = window.selState?.settings?.comparators || {};
  const mode = String(cmp.mode || "AUTO").toUpperCase();
  const band = Number.isFinite(cmp.band) ? +cmp.band : 0.3;
  const dead = Number.isFinite(cmp.deadband) ? +cmp.deadband : 0.05;

  // Deltas (positive => over threshold)
  const Z2diffF = z2Mag - Z2Fth;
  const Z2diffR = z2Mag - Z2Rth;
  const Z0diffF = z0Mag - Z0Fth;
  const Z0diffR = z0Mag - Z0Rth;

  // Convenience booleans
  const near = (d) => Math.abs(d) <= (mode === "AUTO" ? band : 0);
  const pass = (d) => d >= (mode === "AUTO" ? -dead : 0);

  // Back-compat globals so any existing code using bare names keeps working
  Object.assign(window, { Z2diffF, Z2diffR, Z0diffF, Z0diffR, z2Mag, z0Mag });

  return {
    mode,
    band,
    dead,
    z2Mag,
    z0Mag,
    Z2Fth,
    Z2Rth,
    Z0Fth,
    Z0Rth,
    Z2diffF,
    Z2diffR,
    Z0diffF,
    Z0diffR,
    z2NearF: near(Z2diffF),
    z2NearR: near(Z2diffR),
    z0NearF: near(Z0diffF),
    z0NearR: near(Z0diffR),
    z2PassF: pass(Z2diffF),
    z2PassR: pass(Z2diffR),
    z0PassF: pass(Z0diffF),
    z0PassR: pass(Z0diffR),
  };
}

/*********************************************************************
 *  Core compute - evaluates bits, paints matrix      *
 *********************************************************************/
export function compute() {
  // --- scalar comparators (defines Z2diffF/Z0diffF so they're never undefined)
  const _cmp = _buildScalarComparators();
  // You can use _cmp.z2Mag, _cmp.Z2diffF, _cmp.z2NearF, etc. for UI chips or matrix

  // 1) measured sequences (secondary) - with weak-source model scaling
  const M = window.seqModel || {
    scale0: 1,
    scale1: 1,
    scale2: 1,
    z0Seen: { mag: 0, ang: 0 },
    i0Qual: "strong",
  };

  let I0m_raw = +$("#Amp_0_I").val() || 0;
  let I1m_raw = +$("#Amp_1_I").val() || 0;
  let I2m_raw = +$("#Amp_2_I").val() || 0;

  let I0m = I0m_raw * (M.scale0 ?? 1);
  let I1m = I1m_raw * (M.scale1 ?? 1);
  let I2m = I2m_raw * (M.scale2 ?? 1);

  const threeI2 = 3 * I2m;
  const IG = 3 * I0m;

  // 2) settings + helper accessors
  const settings = state.settings || {};
  const ns = settings.negativeSeq || {};
  const zs = settings.zeroSeq || {};
  const flags = settings.flags || {};
  const orderSetting = (settings.order || "QV").toString();
  const cmpCfg = settings.comparators || {};

  const valOr = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const e32 = !!flags.E32IV;
  const ilop = !!flags.ILOP;
  const elopMode = (flags.ELOP || "N").toString().toUpperCase();
  const lopActive = ilop && (elopMode === "Y" || elopMode === "Y1");

  const modeRaw = (cmpCfg.mode || "AUTO").toString().toUpperCase();
  const comparatorMode = modeRaw === "MANUAL" ? "MANUAL" : "AUTO";
  const baseBand = valOr(cmpCfg.band, 0.3);
  const baseDeadband = Math.max(0, valOr(cmpCfg.deadband, 0.05));
  let ctNom = window.meteringBase?.ct?.nominalSecondary;
  if (!Number.isFinite(ctNom) || ctNom <= 0) ctNom = 5;
  const band = comparatorMode === "AUTO" ? baseBand * (5 / ctNom) : baseBand;
  const deadband = comparatorMode === "AUTO" ? baseDeadband : baseDeadband;

  const bandSpan = document.getElementById("scalar-band-span");
  if (bandSpan && Number.isFinite(band)) bandSpan.textContent = band.toFixed(2);
  const deadSpan = document.getElementById("scalar-deadband-span");
  if (deadSpan && Number.isFinite(deadband))
    deadSpan.textContent = deadband.toFixed(2);

  const b = Object.create(null);

  const th50QFP = valOr(ns["50QFP"]);
  const th50QRP = valOr(ns["50QRP"]);
  const th50GFP = valOr(zs["50GFP"]);
  const th50GRP = valOr(zs["50GRP"]);
  const a2Setting = valOr(ns.a2);
  const k2Setting = valOr(ns.k2);
  const a0Setting = valOr(zs.a0);

  b["50QF"] = threeI2 > th50QFP;
  b["50QR"] = threeI2 > th50QRP;
  const a2Pass = I2m > a2Setting * I1m;
  b["32QE"] = (b["50QF"] || b["50QR"]) && a2Pass;

  b["50GF"] = IG > th50GFP;
  b["50GR"] = IG > th50GRP;
  const IGpickup = b["50GF"] || b["50GR"];
  const a0Pass = I0m > a0Setting * I1m;
  b["32VE"] = IGpickup && a0Pass && e32 && !lopActive;

  // internal readiness (k2 restraint & LOP handling)
  const k2Pass = I2m > k2Setting * I0m || !b["32VE"];
  const Qready = b["32QE"] && k2Pass;
  const Vready = b["32VE"];
  const Ieligible = IGpickup && e32 && (a0Pass || lopActive);
  b["32IE"] = Ieligible;

  // 4) scalar z2/z0 comparators (AUTO/MANUAL)
  const V2 = pol(+$("#Amp_2").val() || 0, +$("#Angle_2").val() || 0);
  let I2 = pol(+$("#Amp_2_I").val() || 0, +$("#Angle_2_I").val() || 0);
  let V0 = pol(
    (+$("#Amp_0").val() || 0) * (M.scale0 ?? 1),
    +($("#Angle_0").val() || 0),
  );
  let I0 = pol(
    (+$("#Amp_0_I").val() || 0) * (M.scale0 ?? 1),
    +($("#Angle_0_I").val() || 0),
  );

  // --- Apply optional Z0/GSU model (quick levers) ------------------------
  if (window.Z0Model && typeof window.Z0Model.getState === "function") {
    try {
      const maybe =
        window.Z0Model.applyZeroSeqModel || window.applyZeroSeqModel;
      if (typeof maybe === "function") {
        const mod = maybe({
          V0,
          I0,
          I1: pol(+$("#Amp_1_I").val() || 0, +($("#Angle_1_I").val() || 0)),
          I2,
        });
        if (mod && mod.V0 && mod.I0) {
          V0 = mod.V0;
          I0 = mod.I0;
          I2 = mod.I2 || I2;
          if (mod.path === "open") {
            b["50GF"] = false;
            b["50GR"] = false;
          }
        }
      }
    } catch (err) {
      console.warn("[Z0Model] apply failed", err);
    }
  }

  const Z2ph = divc(V2, I2);
  const z2Mag = mag(Z2ph);
  const Z0ph = divc(V0, I0);
  const z0Mag = mag(Z0ph);

  const Z2Fset = +$("#Z2F").val() || 0;
  const Z2Rset = +$("#Z2R").val() || 0;
  const Z0Fset = +$("#Z0F").val() || 0;
  const Z0Rset = +$("#Z0R").val() || 0;

  const z2DiffF = Z2Fset - z2Mag;
  const z2DiffR = z2Mag - Z2Rset;
  const z0DiffF = Z0Fset - z0Mag;
  const z0DiffR = z0Mag - Z0Rset;

  state.lastComparators = state.lastComparators || {
    z2Fwd: false,
    z2Rev: false,
    z0Fwd: false,
    z0Rev: false,
  };
  const lastC = state.lastComparators;
  const withinDeadband = (diff) => Math.abs(diff) < deadband;

  let z2Fwd = z2Mag < Z2Fset;
  let z2Rev = z2Mag > Z2Rset;
  let z0Fwd = z0Mag < Z0Fset;
  let z0Rev = z0Mag > Z0Rset;

  if (comparatorMode === "AUTO") {
    z2Fwd = z2DiffF >= -band;
    if (withinDeadband(z2DiffF)) z2Fwd = lastC.z2Fwd;
    z2Rev = z2DiffR >= -band;
    if (withinDeadband(z2DiffR)) z2Rev = lastC.z2Rev;
    z0Fwd = z0DiffF >= -band;
    if (withinDeadband(z0DiffF)) z0Fwd = lastC.z0Fwd;
    z0Rev = z0DiffR >= -band;
    if (withinDeadband(z0DiffR)) z0Rev = lastC.z0Rev;
  }

  state.lastComparators = { z2Fwd, z2Rev, z0Fwd, z0Rev };

  b["Z2<FTH"] = z2Fwd;
  b["Z2>RTH"] = z2Rev;
  b["Z0<FTH"] = z0Fwd;
  b["Z0>RTH"] = z0Rev;

  // 5) decide Q / V / I path results with gating
  b["F32Q"] = z2Fwd && b["50QF"] && Qready;
  b["R32Q"] = z2Rev && b["50QR"] && Qready;
  b["F32V"] = z0Fwd && b["50GF"] && Vready;
  b["R32V"] = z0Rev && b["50GR"] && Vready;
  b["F32I"] = z0Fwd && Ieligible;
  b["R32I"] = z0Rev && Ieligible;

  // 6) Phase OC directional (32P) ? unchanged logic, used as safety net
  const V1 = pol(+$("#Amp_1").val() || 0, +$("#Angle_1").val() || 0);
  const I1 = pol(+$("#Amp_1_I").val() || 0, +($("#Angle_1_I").val() || 0));
  const Z1ang = +$("#Z_angle").val() || 0;
  const Pcomp = zComp(V1, I1, Z1ang);
  const Ppickup = +$("#50P32P").val() || 0;

  const IA = pol(+$("#Amp_A_I").val() || 0, +($("#Angle_A_I").val() || 0));
  const IB = pol(+$("#Amp_B_I").val() || 0, +($("#Angle_B_I").val() || 0));
  const IC = pol(+$("#Amp_C_I").val() || 0, +($("#Angle_C_I").val() || 0));
  const IAB = mag(sub(IA, IB));
  const IBC = mag(sub(IB, IC));
  const ICA = mag(sub(IC, IA));
  const fiftyP32 =
    IAB > Math.SQRT3 * Ppickup &&
    IBC > Math.SQRT3 * Ppickup &&
    ICA > Math.SQRT3 * Ppickup;
  const Pready = e32 && !lopActive && fiftyP32;

  b["F32P"] = Pready && Pcomp < 0;
  b["R32P"] = Pready && Pcomp > 0;

  // Priority 32Q over 32P when I2 > a2*I1 (requested)
  const qBeatsP = a2Pass;
  b["32PF"] = qBeatsP
    ? b["F32Q"] || (!b["F32Q"] && b["F32P"])
    : b["F32P"] || b["F32Q"];
  b["32PR"] = qBeatsP
    ? b["R32Q"] || (!b["R32Q"] && b["R32P"])
    : b["R32P"] || b["R32Q"];

  // 7) Best-Choice chain (Q/V/I)
  const preferQ = !!a2Pass;
  let orderArr = [
    ...new Set(
      orderSetting
        .toUpperCase()
        .replace(/[^QVI]/g, "")
        .split("")
        .filter(Boolean),
    ),
  ];
  if (!orderArr.length) orderArr = ["Q", "V", "I"];
  if (orderArr.includes("Q") && orderArr.includes("V")) {
    if (preferQ) {
      orderArr = ["Q", ...orderArr.filter((ch) => ch !== "Q")];
    } else {
      orderArr = ["V", ...orderArr.filter((ch) => ch !== "V")];
    }
    orderArr = [...new Set(orderArr)];
  }
  if (Ieligible && !orderArr.includes("I")) {
    orderArr.push("I");
  }

  const qDir = b["F32Q"] ? "FWD" : b["R32Q"] ? "REV" : null;
  const vDir = b["F32V"] ? "FWD" : b["R32V"] ? "REV" : null;
  const iDir = b["F32I"] ? "FWD" : b["R32I"] ? "REV" : null;

  let choice = "I";
  let chosenDir = null;
  for (const ch of orderArr) {
    if (ch === "Q" && Qready) {
      choice = "Q";
      chosenDir = qDir;
      break;
    }
    if (ch === "V" && Vready) {
      choice = "V";
      chosenDir = vDir;
      break;
    }
    if (ch === "I" && Ieligible) {
      choice = "I";
      chosenDir = iDir;
      break;
    }
  }

  b["32QGE"] = Qready; // expose internal enable
  b["LOPBLOCK"] = lopActive && e32;

  state.choice = choice;
  state.orderResolved = orderArr.join("");
  state.bits = b;

  paintMatrix(b, {
    I2m,
    I0m,
    IG,
    threeI2,
    Z2comp: z2Mag,
    Z2Fth: Z2Fset,
    Z2Rth: Z2Rset,
    Z2mag: z2Mag,
    Z2diffF,
    Z2diffR,
    Z0comp: z0Mag,
    Z0Fth: Z0Fset,
    Z0Rth: Z0Rset,
    Z0mag: z0Mag,
    Z0diffF,
    Z0diffR,
    band,
    deadband,
    comparatorMode,
    lopActive,
    Vready,
    Qready,
    Iready: Ieligible,
    IGpickup,
    Pcomp,
  });

  renderExplainer({
    choice,
    chosenDir,
    order: orderSetting,
    orderResolved: state.orderResolved,
    preferQ,
    comparatorMode,
    band,
    deadband,
    elopMode,
    lopActive,
    e32,
    a2Pass,
    a0Pass,
    k2Pass,
    Qready,
    Vready,
    Iready: Ieligible,
    Qdir: qDir,
    Vdir: vDir,
    Idir: iDir,
    I2m,
    I1m,
    I0m,
    threeI2,
    IG,
    z2Mag,
    Z2Fset,
    Z2Rset,
    z2DiffF,
    z2DiffR,
    z0Mag,
    Z0Fset,
    Z0Rset,
    z0DiffF,
    z0DiffR,
    IGpickup,
    bits: b,
  });

  try {
    const n = document.querySelector("#note");
    const s = window.Z0Model?.getState?.();
    if (n && s) {
      n.innerHTML = `<div style="margin-top:.5rem;font-size:.9em;opacity:.85">
        Z0 model: ${s.reverseSLG ? "Reverse SLG" : "Forward"} ? Local inf=${s.z0InfLocal ? "ON" : "OFF"} ? Remote inf=${s.z0InfRemote ? "ON" : "OFF"} ? GSU=${s.gsuPreset} ? Rn=${s.rn} ohm ? Xn=${s.xn} ohm ? I2x=${(s.qScale || 1).toFixed(2)}
      </div>`;
    }
  } catch (err) {
    /* ignore */
  }

  persist();
}

export function paintMatrix(bits, vals) {
  BIT_ROWS.forEach((r) => {
    const td = document.getElementById(`bit-${r.name}`);
    const val = document.getElementById(`val-${r.name}`);
    if (!td || !val) return;

    if (r.name === "CHOICE") {
      td.textContent = state.choice;
      td.className = "";
      val.textContent =
        {
          Q: vals.I2m?.toFixed?.(3),
          V: vals.I0m?.toFixed?.(3),
          I: vals.IG?.toFixed?.(3),
        }[state.choice] || "";
      return;
    }

    const on = !!bits[r.name];
    td.textContent = on ? "ON" : "OFF";
    td.className = on ? "bit-true" : "bit-false";

    switch (r.name) {
      case "50QF":
        val.textContent = (
          units.mode === "PRI" && typeof s2pI === "function"
            ? s2pI(vals.threeI2)
            : vals.threeI2
        ).toFixed(3);
        break;
      case "50QR":
        val.textContent = vals.threeI2.toFixed(3);
        break;
      case "32QE":
        val.textContent = vals.I2m.toFixed(3);
        break;
      case "50GF":
      case "50GR":
        val.textContent = vals.IG.toFixed(3);
        break;
      case "32VE":
        val.textContent = vals.I0m.toFixed(3);
        break;

      case "Z2<FTH": {
        const diff = Number.isFinite(vals.Z2diffF)
          ? vals.Z2diffF.toFixed(3)
          : "--";
        const band = Number.isFinite(vals.band)
          ? ` (+/-${vals.band.toFixed(2)})`
          : "";
        val.textContent = `diff=${diff}${band}`;
        break;
      }
      case "Z2>RTH": {
        const diff = Number.isFinite(vals.Z2diffR)
          ? vals.Z2diffR.toFixed(3)
          : "--";
        const band = Number.isFinite(vals.band)
          ? ` (+/-${vals.band.toFixed(2)})`
          : "";
        val.textContent = `diff=${diff}${band}`;
        break;
      }
      case "Z0<FTH": {
        const diff = Number.isFinite(vals.Z0diffF)
          ? vals.Z0diffF.toFixed(3)
          : "--";
        const band = Number.isFinite(vals.band)
          ? ` (+/-${vals.band.toFixed(2)})`
          : "";
        val.textContent = `diff=${diff}${band}`;
        break;
      }
      case "Z0>RTH": {
        const diff = Number.isFinite(vals.Z0diffR)
          ? vals.Z0diffR.toFixed(3)
          : "--";
        const band = Number.isFinite(vals.band)
          ? ` (+/-${vals.band.toFixed(2)})`
          : "";
        val.textContent = `diff=${diff}${band}`;
        break;
      }
      case "F32Q":
        val.textContent = `|Z2|=${vals.Z2mag.toFixed(3)}`;
        break;
      case "R32Q":
        val.textContent = `|Z2|=${vals.Z2mag.toFixed(3)}`;
        break;
      case "F32V":
        val.textContent = `|Z0|=${vals.Z0mag.toFixed(3)}`;
        break;
      case "R32V":
        val.textContent = `|Z0|=${vals.Z0mag.toFixed(3)}`;
        break;
      case "32IE":
        val.textContent = vals.IG?.toFixed?.(3) || "";
        break;
      case "F32I":
        val.textContent = `|Z0|=${vals.Z0mag.toFixed(3)}`;
        break;
      case "R32I":
        val.textContent = `|Z0|=${vals.Z0mag.toFixed(3)}`;
        break;

      case "F32P":
        val.textContent = `Pcomp:${vals.Pcomp.toFixed(3)}`;
        break;
      case "R32P":
        val.textContent = `Pcomp:${vals.Pcomp.toFixed(3)}`;
        break;
      case "32PF":
        val.textContent = "OR(F32Q, F32P)";
        break;
      case "32PR":
        val.textContent = "OR(R32Q, R32P)";
        break;
      case "LOPBLOCK":
        val.textContent = vals.lopActive ? "ELOP+ILOP" : "-";
        break;

      default:
        val.textContent = "";
    }
  });
  // highlight active path & decision row
  const hot = [];
  if (state.choice === "Q") {
    if (bits["F32Q"]) hot.push("F32Q");
    if (bits["R32Q"]) hot.push("R32Q");
  }
  if (state.choice === "V") {
    if (bits["F32V"]) hot.push("F32V");
    if (bits["R32V"]) hot.push("R32V");
  }
  if (state.choice === "I") {
    if (bits["F32I"]) hot.push("F32I");
    if (bits["R32I"]) hot.push("R32I");
  }

  // clear old
  document.querySelectorAll("#enable-matrix td[data-hot]").forEach((td) => {
    td.removeAttribute("data-hot");
    td.style.background = "";
  });

  // mark new
  hot.forEach((name) => {
    const td = document.getElementById(`bit-${name}`);
    if (td) {
      td.setAttribute("data-hot", "1");
      td.style.background = "rgba(70,130,180,.12)";
    }
  });
}

function fmt(n, d = 3) {
  return Number.isFinite(n) ? n.toFixed(d) : "-";
}
function tol(v) {
  const t = Math.max(0.001, Math.abs(v) * 0.01);
  return `±${t.toFixed(3)}`;
}

function renderExplainer(ctx) {
  const el = document.getElementById("dir-explainer");
  if (!el) return;
  const {
    choice,
    chosenDir,
    order,
    orderResolved,
    preferQ,
    comparatorMode,
    band,
    deadband,
    elopMode,
    lopActive,
    e32,
    a2Pass,
    a0Pass,
    k2Pass,
    Qready,
    Vready,
    Iready,
    Qdir,
    Vdir,
    Idir,
    I2m,
    I1m,
    I0m,
    threeI2,
    IG,
    z2Mag,
    Z2Fset,
    Z2Rset,
    z2DiffF,
    z2DiffR,
    z0Mag,
    Z0Fset,
    Z0Rset,
    z0DiffF,
    z0DiffR,
    IGpickup,
    bits,
  } = ctx;

  const fmt = (n, d = 3) => (Number.isFinite(n) ? n.toFixed(d) : "--");
  const chips = [];
  const pushChip = (text, kind = "info") => chips.push({ text, kind });

  const ns = state.settings?.negativeSeq || {};
  const zs = state.settings?.zeroSeq || {};
  const a2Setting = Number(ns.a2) || 0;
  const a0Setting = Number(zs.a0) || 0;
  const th50QF = Number(ns["50QFP"]) || 0;
  const th50GF = Number(zs["50GFP"]) || 0;

  const headlineFor = () => {
    const label =
      choice === "Q"
        ? "32Q"
        : choice === "V"
          ? "32V"
          : choice === "I"
            ? "32I"
            : "None";
    const dir = chosenDir ? chosenDir.toLowerCase() : "pending";
    return `${label} ${dir}`;
  };

  const addQChips = () => {
    pushChip(
      `3I2=${fmt(threeI2)}A vs 50QF=${fmt(th50QF)}A`,
      bits["50QF"] ? "pass" : "block",
    );
    pushChip(
      `I2=${fmt(I2m)}A vs a2*I1=${fmt(a2Setting * I1m)}A`,
      a2Pass ? "pass" : "block",
    );
    pushChip(
      `|Z2|=${fmt(z2Mag)} vs Z2F=${fmt(Z2Fset)} (diff=${fmt(z2DiffF)})`,
      bits["Z2<FTH"] ? "pass" : "warn",
    );
    pushChip(
      `k2 restraint ${k2Pass ? "pass" : "block"}`,
      k2Pass ? "pass" : "block",
    );
  };

  const addVChips = () => {
    pushChip(
      `3I0=${fmt(IG)}A vs 50GF=${fmt(th50GF)}A`,
      IGpickup ? "pass" : "block",
    );
    pushChip(
      `I0=${fmt(I0m)}A vs a0*I1=${fmt(a0Setting * I1m)}A`,
      a0Pass ? "pass" : "block",
    );
    pushChip(
      `|Z0|=${fmt(z0Mag)} vs Z0F=${fmt(Z0Fset)} (diff=${fmt(z0DiffF)})`,
      bits["Z0<FTH"] ? "pass" : "warn",
    );
    if (!e32) pushChip("E32IV=OFF", "block");
    if (lopActive)
      pushChip(`ELOP=${elopMode} + ILOP -> V-path blocked`, "block");
  };

  const addIChips = () => {
    if (lopActive) pushChip("LOP active -> current-polarized path", "info");
    const a0GatePass = a0Pass || lopActive;
    pushChip(
      `I0=${fmt(I0m)}A vs a0*I1=${fmt(a0Setting * I1m)}A`,
      a0GatePass ? "pass" : "block",
    );
    pushChip(
      `3I0=${fmt(IG)}A vs 50GF=${fmt(th50GF)}A`,
      IGpickup ? "pass" : "block",
    );
    pushChip(
      `|Z0|=${fmt(z0Mag)} vs Z0F=${fmt(Z0Fset)} (diff=${fmt(z0DiffF)})`,
      bits["Z0<FTH"] ? "pass" : "warn",
    );
  };

  const resolvedOrder = orderResolved || order || "";
  pushChip(`ORDER=${resolvedOrder}`, "info");
  if (comparatorMode === "AUTO") {
    const bandText = Number.isFinite(band) ? `+/-${band.toFixed(2)} ohm` : "";
    pushChip(
      `Comparators=AUTO${bandText ? " (" + bandText + ")" : ""}`,
      "info",
    );
  } else {
    pushChip("Comparators=MANUAL", "warn");
  }
  if (preferQ) {
    pushChip("Auto prefers Q path", choice === "Q" ? "info" : "warn");
  } else {
    pushChip("Auto prefers V path", choice === "V" ? "info" : "warn");
  }
  if (lopActive) {
    pushChip(`ELOP=${elopMode} & ILOP=Y`, "block");
  }

  switch (choice) {
    case "Q":
      addQChips();
      break;
    case "V":
      addVChips();
      break;
    case "I":
      addIChips();
      break;
    default:
      pushChip("No directional channel selected", "warn");
  }

  if (!chips.length) {
    pushChip("No comparator data available", "info");
  }

  const chipHtml = chips
    .map(
      ({ text, kind }) => `<span class="why-chip why-${kind}">${text}</span>`,
    )
    .join("");
  const headline = `Directional - ${headlineFor()}`;

  el.innerHTML = `
    <div class="dir-headline"><strong>${headline}</strong></div>
    <div class="why-chip-row">${chipHtml}</div>
  `;
}

/*********************************************************************
 *  Persistence of last session                                      *
 *********************************************************************/
export function persist() {
  localStorage.setItem(
    "sel_state",
    JSON.stringify({
      settings: state.settings,
      units: units.mode,
      CTpri: $("#CT_primary").val(),
      CTsec: $("#CT_secondary").val(),
      PTpri: $("#PT_primary").val(),
      PTsec: $("#PT_secondary").val(),
    }),
  );
}

export function restore() {
  try {
    const s = JSON.parse(localStorage.getItem("sel_state") || "{}");
    Object.assign(state.settings, s.settings || {});
    state.settings.flags = Object.assign(
      { E32IV: true, ILOP: false, ELOP: "N" },
      state.settings.flags || {},
    );
    state.settings.comparators = Object.assign(
      { mode: "AUTO", band: 0.3, deadband: 0.05 },
      state.settings.comparators || {},
    );
    if (s.units) units.mode = s.units;
    if (s.CTpri) $("#CT_primary").val(s.CTpri);
    if (s.CTsec) $("#CT_secondary").val(s.CTsec);
    if (s.PTpri) $("#PT_primary").val(s.PTpri);
    if (s.PTsec) $("#PT_secondary").val(s.PTsec);
  } catch {
    /* ignore */
  }
}

export function lowerSELTable() {
  const node = document.getElementById("svgSELTable");
  if (!node) return;

  if (!isForeignObjectNode(node)) {
    node.style.pointerEvents = "";
    return;
  }

  const s = d3.select(node);
  s.style("pointer-events", "none");

  if (typeof s.lower === "function") {
    s.lower();
  }

  const parent = node.parentNode;
  if (parent && parent.firstChild !== node) {
    parent.insertBefore(node, parent.firstChild);
  }
}

export function raiseSELTable() {
  const node = document.getElementById("svgSELTable");
  if (!node) return;

  if (!isForeignObjectNode(node)) {
    node.style.pointerEvents = "";
    return;
  }

  const s = d3.select(node);
  s.style("pointer-events", "auto");

  if (typeof s.raise === "function") {
    s.raise();
  }

  const parent = node.parentNode;
  if (parent) {
    parent.appendChild(node);
  }
}

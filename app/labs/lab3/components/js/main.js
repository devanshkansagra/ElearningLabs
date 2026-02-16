import { inserForeignObject, bindMarkerToggle } from './ForeignObjects.js';     
import { textDecorationAndSymbols,addArrows } from './textDecorationAndSymbols.js';
import { setupSELDynamicBlinder} from './blinders.js';
import { compute, restore, buildMatrix, loadPresets,saveCurrentToPreset, applyPreset, lowerSELTable, raiseSELTable, deletePreset, ensureSELTable, collectAllInputs, applyAllInputs } from './svgSELTable.js';
import { assignValues } from './assignment.js';
import { History } from './History.js';
import { inBox, quadPoints, drawQuads, drawQuadHandles, quad,startQuad} from './quad.js' 
import { computeVoltagePhasors, computeCurrentPhasors, computeImpedancePhasors } from './computePhaseVectors.js';
import { renderVectorsAndTexts } from './renderVectorsAndTexts.js';
import { toggleUnit, setUnit } from './toggle.js';
import './tooltip.js';
import { tab_ABC } from './tab_ABC.js';
import { ganged } from './ganged.js'

import { initMeteringBaseUI } from './meteringBaseUI.js';
import { onMeteringBaseChange, convertScalar } from './meteringBase.js';
import { initZ0ModelUI } from './z0model.js';
import * as d3 from 'd3'

// One-pass UI text repair for common mojibake sequences (keeps source/localization intact).
// Uses ASCII-only escapes for replacements to avoid charset sensitivity in JS sources.
(() => {
  if (typeof document === 'undefined') return;

  const REPL = [
    ['Ã¢â€žÂ¦', '\u03A9'],    // Î©
    ['Ã‚Âº',  '\u00B0'],    // Â°
    ['Ãƒâ€”',  '\u00D7'],    // Ã—
    ['Ã¢â€ Â¶', '\u21B6'],    // â†¶
    ['Ã¢â€ Â·', '\u21B7'],    // â†·
    ['Ã¢â‚¬Å“', '"'],
    ['Ã¢â‚¬\u009D', '"'],    // sometimes comes through with control byte
    ['Ã¢â‚¬Â', '"'],
    ['Ã¢â‚¬Ëœ', "'"],
    ['Ã¢â‚¬â„¢', "'"],
    ['Ã¢â‚¬Â¦', '...'],
    ['Ã¢â‚¬â€œ', '-'],
    ['Ã¢â‚¬â€', ' - '],
    ['Ã¢Ë†Å¾', '\u221E'],    // âˆž
    ['Ã¢â€šâ‚¬', '0'],         // subscript 0 broken -> 0 (readable, robust)
    ['Ã¢â€šâ€š', '2'],         // subscript 2 broken -> 2
    ['Ã°Å¸â€œÂ', '\u2220'],  // âˆ  (angle indicator)
  ];

  const scrub = (s) => {
    let out = s;
    for (const [bad, good] of REPL) out = out.split(bad).join(good);
    return out;
  };

  const run = () => {
    try {
      // Text nodes
      if (typeof NodeFilter !== 'undefined' && document.body) {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) {
          const v = n.nodeValue;
          if (!v) continue;
          if (v.indexOf('Ã¢') === -1 && v.indexOf('Ã‚') === -1 && v.indexOf('Ãƒ') === -1 && v.indexOf('Ã°') === -1) continue;
          const fixed = scrub(v);
          if (fixed !== v) n.nodeValue = fixed;
        }
      }

      // Common attributes used for tooltips/labels
      const ATTRS = ['title', 'aria-label', 'placeholder'];
      document.querySelectorAll('[title],[aria-label],[placeholder]').forEach((el) => {
        for (const a of ATTRS) {
          if (!el.hasAttribute(a)) continue;
          const v = el.getAttribute(a);
          if (!v) continue;
          if (v.indexOf('Ã¢') === -1 && v.indexOf('Ã‚') === -1 && v.indexOf('Ãƒ') === -1 && v.indexOf('Ã°') === -1) continue;
          const fixed = scrub(v);
          if (fixed !== v) el.setAttribute(a, fixed);
        }
      });
    } catch (_) {
      // fail-closed: do nothing
    }
  };

  if (document.body) run();
  else document.addEventListener('DOMContentLoaded', run, { once: true });
})();


if (!d3.selection.prototype.nodes) { d3.selection.prototype.nodes = function () { var out = []; this.each(function () { out.push(this); });   // â€˜thisâ€™ === DOM node
    return out;};}

let unitClickBound = false;
const meterReadoutFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
let meteringUpdateRaf = 0;
let updateLoopRunning = false;
let updateLoopPending = false;
const scheduleMeteringRefresh = () => {
  if (typeof requestAnimationFrame !== 'function') {
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
  document.getElementById('spanUnit')?.addEventListener('click', () => { toggleUnit(); }, { passive: true });
  unitClickBound = true;
}
    const configureSVGs = () => {
        const common = [vis_inner_V, vis_inner_I,vis_inner_Z];
        common.forEach(v => v.style("width", w + 'px').style("height", h + 'px').attr("viewBox", `0 0 ${w} ${h}`));
        };

function renderSchematic(tag){
  const svg = document.getElementById('i0-schematic');
  if (!svg) return;

  // Which right-side symbol?
  const rightDelta = svg.querySelector('#sym-right-Delta');
  const rightYg    = svg.querySelector('#sym-right-Yg');
  const showRightY = (tag === 'YYg');
  if (rightDelta) rightDelta.style.display = showRightY ? 'none' : '';
  if (rightYg)    rightYg.style.display    = showRightY ? ''     : 'none';

  // 30 deg marker for DY5
  const ph = svg.querySelector('#phase-label');
  if (ph) ph.style.display = (tag === 'DY5g') ? '' : 'none';

  // Ground â€œopenâ€ dimming when Z0 = âˆž at local/remote
  const openL = !!document.getElementById('z0inf-local')?.checked;
  const openR = !!document.getElementById('z0inf-remote')?.checked;

  const gL = svg.querySelector('#gnd-left');
  const gR = showRightY ? svg.querySelector('#gnd-right-Y') : svg.querySelector('#gnd-right');

  if (gL) gL.setAttribute('opacity', openL ? '0.35' : '1');
  if (gR) gR.setAttribute('opacity', openR ? '0.35' : '1');

  // Handy tooltip with the exact Z0s seen at each terminal (3Â·(Rn+jXn))
  const Rn = +($('#Rn').val() || 0), Xn = +($('#Xn').val() || 0);
  const locZ = openL ? 'âˆž' : `${(3*Rn).toFixed(2)}+j${(3*Xn).toFixed(2)}`;
  const remZ = openR ? 'âˆž' : `${(3*Rn).toFixed(2)}+j${(3*Xn).toFixed(2)}`;
  let title = svg.querySelector('title');
  if (!title){
    title = document.createElementNS('http://www.w3.org/2000/svg','title');
    svg.appendChild(title);
  }
  title.textContent = `${tag || 'â€”'}  â€¢  Zâ‚€(local)=${locZ} â„¦  â€¢  Zâ‚€(remote)=${remZ} â„¦`;
}

function updateSecondarySummary() {
  const el = document.getElementById('secondary-summary');
  if (!el) return;
  const preset = document.getElementById('gsu-preset')?.value || 'none';
  const z0L = document.getElementById('z0inf-local')?.checked ? 'open' : 'closed';
  const z0R = document.getElementById('z0inf-remote')?.checked ? 'open' : 'closed';
  const sel = window.selState?.settings;
  const order = (sel?.order || 'QV').toUpperCase();
  const mode = (sel?.comparators?.mode || 'AUTO').toUpperCase();
  el.textContent = `GSU ${preset || 'none'} | Z0 L:${z0L} R:${z0R} | SEL ${mode}/${order}`;
}

// ---- Weak-source / GSU mini-model (global shim used by svgSELTable.js) ----
window.seqModel = {
  scale0: 1,      // scales |I0| and |V0|
  scale1: 1,      // optional future use on I1 (kept =1)
  scale2: 1,      // optional future use on I2 (kept =1)
  z0Seen: { mag: 0, ang: 0 }, // equivalent Z0 seen by the relay (display)
  i0Qual: 'strong'            // 'strong' | 'weak' | 'open'
};

function complex(re=0, im=0){ return {re:+re, im:+im}; }
function cAdd(a,b){ return complex(a.re+b.re, a.im+b.im); }
function cInv(z){ const d=z.re*z.re+z.im*z.im; return d? complex(z.re/d, -z.im/d) : complex(0,0); }
function cPar(a,b){ // parallel
  if (!isFinite(a.re) && !isFinite(b.re)) return complex(Infinity, Infinity);
  const ia = (isFinite(a.re) ? cInv(a) : complex(0,0));
  const ib = (isFinite(b.re) ? cInv(b) : complex(0,0));
  const s = cAdd(ia, ib); const d = s.re*s.re + s.im*s.im;
  return d ? complex(s.re/d, -s.im/d) : complex(Infinity, Infinity);
}
function magAng(z){ return { mag: Math.hypot(z.re,z.im), ang: Math.atan2(z.im,z.re)*180/Math.PI }; }
function pol(m,deg){ const r=deg*Math.PI/180; return complex(m*Math.cos(r), m*Math.sin(r)); }

function zLineZ0() {
  const Z0mag = (+($('#Z0_ratio').val())||0) * (+($('#Z_l').val())||0);
  const Z0ang = +($('#Z0_angle').val()) || 0;
  return pol(Z0mag, Z0ang);
}

function computeWeakSourceModel() {
  // 1) Inputs
  const z0infLocal  = !!document.getElementById('z0inf-local')?.checked;
  const z0infRemote = !!document.getElementById('z0inf-remote')?.checked;
  const Rn = +($('#Rn').val()) || 0;
  const Xn = +($('#Xn').val()) || 0;

  // 2) Terminal Z0 Thevenins (only neutral path), âˆž if open
  //    Z0_term â‰ˆ 3Â·(Rn + jXn) (classic image-method result)
  const Z0term = complex(3*Rn, 3*Xn);
  const Zloc   = z0infLocal  ? complex(Infinity, Infinity) : Z0term;
  const Zrem   = z0infRemote ? complex(Infinity, Infinity) : Z0term;

  // Equivalent seen by line end (parallel of terminals)
  const Zeq = cPar(Zloc, Zrem);
  const seen = magAng(Zeq);

  // 3) Strength factor vs. line Z0 magnitude (dimensionless 0..1)
  const Z0L = zLineZ0(); const Z0Lmag = Math.max(1e-9, Math.hypot(Z0L.re, Z0L.im));
  let f = seen.mag / (seen.mag + Z0Lmag);           // simple current-divider proxy
  if (!isFinite(seen.mag)) f = 0;                   // both inf -> open
  f = Math.max(0, Math.min(1, f));

  // Qualitative label
  const qual = !f ? 'open' : (f < 0.3 ? 'weak' : 'strong');

  // 4) Optional quad link: squeeze resistive sides with strength
  //    use a gentle curve so it doesn't collapse fully when weak
  const linkQuad = !!document.getElementById('link-quad')?.checked;
  if (linkQuad) applyQuadLinkage(f); else restoreQuadIfLinked();

  // 5) Publish to svgSELTable.js (consumes scale0 & z0Seen)
  window.seqModel.scale0 = f;
  window.seqModel.scale1 = 1;
  window.seqModel.scale2 = 1;
  window.seqModel.z0Seen = seen;
  window.seqModel.i0Qual = qual;

  // 6) Live badges
  const b1 = document.getElementById('i0-path-badge');
  const b2 = document.getElementById('z0-seen-badge');
  if (b1) { b1.textContent = `Iâ‚€ path: ${qual}`; b1.className = 'chip ' + (qual==='open'?'bit-false':qual==='weak'?'bit-true':''); }
  if (b2)  b2.textContent = `Zâ‚€(seen): ${seen.mag.toFixed(2)} â„¦ / ${seen.ang.toFixed(1)}Â°`;
  
  renderSchematic(document.getElementById('gsu-preset')?.value || '');
  updateSecondarySummary();
}

function initSecondaryConfigModal() {
  const modal = document.getElementById('secondary-config');
  const body = document.getElementById('secondary-body');
  const openBtn = document.getElementById('open-secondary-config');
  const status = document.getElementById('secondary-status');
  const applyBtn = document.getElementById('secondary-apply');
  const revertBtn = document.getElementById('secondary-revert');
  const cancelBtn = document.getElementById('secondary-cancel');
  const closeBtn = document.getElementById('secondary-close');
  const app = document.getElementById('app');

  if (!modal || !body || !openBtn) return;

  const legacyZ0 = document.getElementById('z0-src-model');
  if (legacyZ0) legacyZ0.remove();

  const movePanel = (id) => {
    const el = document.getElementById(id);
    if (el && el.parentNode !== body) body.appendChild(el);
  };
  ['source-gsu', 'sel-config-panel', 'sel-enable-table'].forEach(movePanel);

  let baseline = null;
  let lastFocus = null;
  let lastScrollY = 0;

  const readState = () => collectAllInputs(body);
  const isDirty = () => {
    if (!baseline) return false;
    const now = readState();
    const keys = new Set([...Object.keys(now), ...Object.keys(baseline)]);
    for (const k of keys) {
      if (now[k] !== baseline[k]) return true;
    }
    return false;
  };

  const updateStatus = () => {
    if (!modal.classList.contains('is-open')) return;
    const dirty = isDirty();
    if (status) status.textContent = dirty ? 'Unsaved changes' : 'All changes applied';
    if (applyBtn) applyBtn.disabled = !dirty;
    if (revertBtn) revertBtn.disabled = !dirty;
    modal.dataset.dirty = dirty ? 'true' : 'false';
  };

  const openModal = () => {
    baseline = readState();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('secondary-open');
    if (app) { app.setAttribute('aria-hidden', 'true'); app.inert = true; }
    lastFocus = document.activeElement;
    lastScrollY = window.scrollY;
    updateStatus();
    setTimeout(() => { closeBtn?.focus(); }, 0);
  };

  const closeModal = (opts = {}) => {
    if (opts.revert && baseline) applyAllInputs(baseline);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('secondary-open');
    if (app) { app.removeAttribute('aria-hidden'); app.inert = false; }
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    if (Number.isFinite(lastScrollY)) window.scrollTo(0, lastScrollY);
  };

  const attemptClose = (mode) => {
    const dirty = isDirty();
    if (mode === 'apply') {
      closeModal();
      return;
    }
    if (dirty && mode === 'close') {
      const ok = window.confirm('Discard secondary changes?');
      if (!ok) return;
    }
    if (dirty && (mode === 'close' || mode === 'cancel')) {
      closeModal({ revert: true });
      return;
    }
    closeModal();
  };

  openBtn.addEventListener('click', openModal);
  applyBtn?.addEventListener('click', () => attemptClose('apply'));
  revertBtn?.addEventListener('click', () => {
    if (!baseline) return;
    applyAllInputs(baseline);
    updateStatus();
  });
  cancelBtn?.addEventListener('click', () => attemptClose('cancel'));
  closeBtn?.addEventListener('click', () => attemptClose('close'));
  modal.addEventListener('click', (e) => {
    if (e.target && e.target.hasAttribute('data-secondary-close')) attemptClose('close');
  });
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    attemptClose('close');
  });
  body.addEventListener('input', updateStatus);
  body.addEventListener('change', updateStatus);
}

function boot() {
  textDecorationAndSymbols();
  initMeteringBaseUI();
  inserForeignObject();
  bindMarkerToggle(d3.select('#vis_inner_Z_svg').select('g.vis_inner_Z_svg_g'));
  addArrows();
  lowerSELTable();
  {
    const zRoot = d3.select('#vis_inner_Z_svg');
    const defs  = zRoot.select('defs').empty() ? zRoot.append('defs') : zRoot.select('defs');
    defs.selectAll('marker#markPol')
      .data([0])
      .join(enter => enter.append('marker')
        .attr('id', 'markPol')
        .attr('viewBox', '-5 -2.5 5 5')
        .attr('refX', 0).attr('refY', 0)
        .attr('markerWidth', 500).attr('markerHeight', 500)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-2.5L-5,-2.5L-5,2.5L0,2.5,z')
        .style('fill', 'SteelBlue')
        .style('fill-opacity', '0.2')
        .style('stroke-width', 0.01));
  }

  setupSELDynamicBlinder();
  assignValues(recordAndUpdate, History);    // wires inputs
  {
    // one-time initial |Z1| sync
    syncZLmagFromParts();

    // edits to ratio or length update |Z1|
    ['Z_ratio','Z_l'].forEach(id => {
      const el = document.getElementById(id);
      el && el.addEventListener('input',  syncZLmagFromParts, { passive:true });
      el && el.addEventListener('change', syncZLmagFromParts, { passive:true });
    });

    // edits to |Z1| back-calc the ratio
    const zEl = document.getElementById('ZLmag');
    if (zEl) {
      zEl.addEventListener('input',  syncPartsFromZLmag);
      zEl.addEventListener('change', syncPartsFromZLmag);
      // prevent feedback loops while typing
      zEl.addEventListener('focus',  () => { _lockZLmag = true; });
      zEl.addEventListener('blur',   () => { _lockZLmag = false; syncPartsFromZLmag(); });
    }
  }

  {
    const mag0 = parseFloat(document.getElementById('KN')?.value);
    const deg0 = parseFloat(document.getElementById('KN_angle')?.value);
    setKNHeadFromPolar(Number.isFinite(mag0) ? mag0 : 0, Number.isFinite(deg0) ? deg0 : 0);
  }

  const Vg = d3.select('#vis_inner_V_svg').select('g.vis_inner_V_svg_g');
  const Ig = d3.select('#vis_inner_I_svg').select('g.vis_inner_I_svg_g');
  const Zg = d3.select('#vis_inner_Z_svg').select('g.vis_inner_Z_svg_g');
  renderVector(Vg, 'vectora',   window.psa    || []);
  renderVector(Vg, 'vectorb',   window.psb    || []);
  renderVector(Vg, 'vectorc',   window.psc    || []);
  renderVector(Ig, 'vectora_I', window.psa_I  || []);
  renderVector(Ig, 'vectorb_I', window.psb_I  || []);
  renderVector(Ig, 'vectorc_I', window.psc_I  || []);
  renderVector(d3.select('#vis_KN_svg'), 'vector_KN', window.ps_KN || []);

  const savedUnit = localStorage.getItem('unit') || 'km';
  setUnit(savedUnit);
  bindUnitClickOnce();
  // configure SVG sizes/viewBox once
  configureSVGs();

  autoScaleAll();
  History.bindAxes({ get: axesSnapshot, set: axesApply });
  // history and first render
  History.init(recordAndUpdate);
  History.attachInputTransactions(document); 
  recordAndUpdate();
  fitZToCurrentOnce();
  // preset UI (after it exists)
  // drawSettings();
  restore();
  if (ensureSELTable()) {
    buildMatrix();
    lowerSELTable();     // or leave lowered until the user shows it
  }
  wireEnableMatrix();

  // Delegated sync: #matrixEnabler inputs -> #enable-matrix cells
  function wireMatrixValueSync() {
    const root  = document.getElementById('matrixEnabler');
    const table = document.getElementById('enable-matrix');
    if (!root || !table) { console.warn('matrixEnabler/enable-matrix not found'); return; }

    const esc = (s) => {
      try { return (window.CSS && CSS.escape) ? CSS.escape(String(s)) : String(s).replace(/"/g, '\\"'); }
      catch { return String(s); }
    };

    const setCell = (key, text, kind, el) => {
      if (!key) return;
      const sel = `[data-cell="${esc(key)}"]`;
      table.querySelectorAll(sel).forEach(td => {
        td.textContent = text;
        // Update ON/OFF coloring when appropriate (checkbox-like semantics)
        const k = String(key).toUpperCase();
        const isChoice = (k === 'CHOICE');
        if (isChoice) { td.className = ''; return; }
        const t = String(text).trim().toUpperCase();
        td.classList.toggle('bit-true',  t === 'ON'  || t === 'TRUE' || t === '1');
        td.classList.toggle('bit-false', t === 'OFF' || t === 'FALSE' || t === '0');
      });
    };

    const getTextFor = (el) => {
      const tag  = (el.tagName || '').toLowerCase();
      const type = (el.type || '').toLowerCase();
      if (tag === 'select') return el.value;
      if (tag === 'textarea') return el.value;
      if (type === 'checkbox') return el.checked ? 'ON' : 'OFF';
      if (type === 'radio') {
        const name = el.name;
        if (name) {
          const checked = root.querySelector(`input[type="radio"][name="${name}"]:checked`);
          return checked ? checked.value : '';
        }
        return el.checked ? (el.value || '') : '';
      }
      // text/number/date/etc.
      return el.value ?? '';
    };

    const syncFromEl = (el) => {
      let key = el?.dataset?.target;
      if (!key) return;
      const text = getTextFor(el);
      // support multiple keys separated by comma/space
      String(key).split(/[\s,]+/).filter(Boolean).forEach(k => setCell(k, text, el.type, el));
    };

    const onAny = (e) => {
      const t = e.target;
      if (!t || !t.matches('input,select,textarea')) return;
      if (!t.dataset || !t.dataset.target) return;
      // Update matching cells
      syncFromEl(t);
    };

    // Delegate input/change from the container
    root.addEventListener('input', onAny);
    root.addEventListener('change', onAny);

    // Initial sync on page load
    root.querySelectorAll('input[data-target],select[data-target],textarea[data-target]').forEach(el => {
      if (el.type === 'radio' && !el.checked) return; // one per group
      syncFromEl(el);
    });
  }

  wireMatrixValueSync();
  initSecondaryConfigModal();
  // Sync SEL settings model from DOM + recompute on edits
  function wireSELGroundCharCompute() {
    const root = document.getElementById('collapseSEL_GroundChar');
    if (!root) return;
    const S = (window.selState = window.selState || { settings: { negativeSeq:{}, zeroSeq:{}, flags:{}, comparators:{ mode:'AUTO', band:0.3, deadband:0.05 }, order:'QV' } });

    const q = (id) => /** @type {HTMLInputElement|null} */ (document.getElementById(id));
    const num = (id) => { const el = q(id); const v = parseFloat(el?.value ?? ''); return Number.isFinite(v) ? v : 0; };
    const bool = (id) => !!q(id)?.checked;
    const str = (id) => (q(id)?.value || '').toString();
    const radio = (name) => {
      const selector = root.querySelector('input[name="' + name + '"]:checked');
      return selector ? selector.value : '';
    };

    const scalarManualIds = ['Z2F','Z2R','Z0F','Z0R'];

    const pullIntoState = () => {
      S.settings = S.settings || {};
      const ns = (S.settings.negativeSeq = S.settings.negativeSeq || {});
      const zs = (S.settings.zeroSeq     = S.settings.zeroSeq     || {});
      const fg = (S.settings.flags       = S.settings.flags       || {});
      const cmp = (S.settings.comparators = S.settings.comparators || { mode:'AUTO', band:0.3, deadband:0.05 });

      // Negative sequence thresholds
      ns['50QFP'] = num('50QFP');
      ns['50QRP'] = num('50QRP');
      ns['a2']    = num('a2');
      ns['k2']    = num('k2');

      // Zero sequence thresholds
      zs['50GFP'] = num('50GFP');
      zs['50GRP'] = num('50GRP');
      zs['a0']    = num('a0');

      // Flags
      fg['E32IV'] = bool('E32IV');
      fg['ILOP']  = bool('ILOP');
      const elop = str('ELOP').toUpperCase();
      fg['ELOP'] = elop === 'Y1' ? 'Y1' : (elop === 'Y' ? 'Y' : 'N');

      // Comparator mode
      const modeSel = radio('scalar-mode').toUpperCase();
      cmp.mode = modeSel === 'MANUAL' ? 'MANUAL' : modeSel === 'AUTO' ? 'AUTO' : (cmp.mode || 'AUTO');
      if (!Number.isFinite(cmp.band)) cmp.band = 0.3;
      if (!Number.isFinite(cmp.deadband)) cmp.deadband = 0.05;

      // ORDER (keep uppercase, clamp length)
      const order = str('ORDER').toUpperCase().slice(0, 3).replace(/[^QVIP]/g, '');
      S.settings.order = order || S.settings.order || 'QV';
    };

    const updateScalarModeUI = () => {
      const cmp = S.settings?.comparators || {};
      const mode = (cmp.mode || 'AUTO').toUpperCase();
      const auto = mode !== 'MANUAL';
      scalarManualIds.map(id => q(id)).filter(Boolean).forEach(input => {
        input.disabled = auto;
        input.classList.toggle('is-disabled', auto);
      });
      const autoRadio = q('scalar-mode-auto');
      const manualRadio = q('scalar-mode-manual');
      if (autoRadio) autoRadio.checked = auto;
      if (manualRadio) manualRadio.checked = !auto;
      const note = document.getElementById('scalar-mode-note');
      if (note) note.dataset.mode = auto ? 'auto' : 'manual';
      const noteBand = document.getElementById('scalar-band-span');
      const noteDb   = document.getElementById('scalar-deadband-span');
      if (noteBand) noteBand.textContent = (cmp.band ?? 0.30).toFixed(2);
      if (noteDb)   noteDb.textContent   = (cmp.deadband ?? 0.05).toFixed(2);

    };

    const onEdit = () => {
      pullIntoState();
      updateScalarModeUI();
      try { compute(); } catch(e) { /* compute may not be ready very early */ }
      updateSecondarySummary();
    };

    // Delegate changes to recompute everything
    root.addEventListener('input', onEdit);
    root.addEventListener('change', onEdit);

    // Initial sync from current DOM values
    pullIntoState();
    updateScalarModeUI();
  }

  wireSELGroundCharCompute();
  updateSecondarySummary();
  loadPresets();
  // After restore/presets, hydrate vector heads from current inputs
  // Triggers the same change handlers assignValues() bound
  setTimeout(() => {
    try {
      const fa = document.getElementById('form_Amp_A');
      const fai = document.getElementById('form_Amp_A_I');
      if (fa)  fa.dispatchEvent(new Event('change', { bubbles: true }));
      if (fai) fai.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {}
  }, 0);
  document.getElementById("preset-save").addEventListener("click", saveCurrentToPreset);
      document.getElementById("preset-delete").addEventListener("click", () => {
        const sel = document.getElementById("preset-select");
        const name = sel ? sel.value : '';
        if (typeof deletePreset === 'function' && name) deletePreset(name);
      });
  document.getElementById("preset-select").addEventListener("change", e => applyPreset(e.target.value));
  compute();
  // toggleMarkers(vis_inner_Z);
 function wireEnableMatrix() {
   const host = document.getElementById('settings');
   if (!host) { console.warn('settings host not found'); return; }
   const show = () => {
     const fo  = document.getElementById('svgSELTable');
     const tbl = document.getElementById('enable-matrix');
     if (tbl && !tbl.classList.contains('visible')) tbl.classList.add('visible');
     if (fo) fo.style.display = '';
     try { raiseSELTable(); } catch {}
   };
   ['input','change','click'].forEach(ev =>
     host.addEventListener(ev, show, { passive: true })
   );
 }
 document.getElementById('toggle-enable')?.addEventListener('click', () => {
   const fo  = document.getElementById('svgSELTable');
   const tbl = document.getElementById('enable-matrix');
   if (!fo || !tbl) { console.warn('enable-matrix or svgSELTable not found'); return; }
 // compute target state (toggle)
 const show = !tbl.classList.contains('visible');
 // apply to table (for opacity/max-height animation)
 tbl.classList.toggle('visible', show);
 // and to container (actual visibility)
 fo.style.display = show ? 'block' : 'none';

  try { show ? raiseSELTable() : lowerSELTable(); } catch {}
  });

  // --- GSU presets & toggles ---
  function applyGsuPreset(tag){
    const R = document.getElementById('Rn');
    const X = document.getElementById('Xn');

    const map = {
      '':     { R: 0.00, X: 0.00 },
      'DY1g': { R: 0.20, X: 1.00 },
      'DY5g': { R: 0.20, X: 1.20 },
      'YYg':  { R: 0.05, X: 0.30 }
    };
    const p = map[tag] || map[''];

    if (R) { R.value = p.R; R.dispatchEvent(new Event('input',{bubbles:true})); }
    if (X) { X.value = p.X; X.dispatchEvent(new Event('input',{bubbles:true})); }

    renderSchematic(tag);
  }


  ['z0inf-local','z0inf-remote','Rn','Xn','link-quad'].forEach(id=>{
    const el = document.getElementById(id);
    el && ['input','change'].forEach(ev => el.addEventListener(ev, () => {
      computeWeakSourceModel(); recordAndUpdate();
    }, {passive:true}));
  });
  document.getElementById('gsu-preset')?.addEventListener('change', e=>{
    applyGsuPreset(e.target.value); computeWeakSourceModel(); recordAndUpdate();
  });

  // prime once on load
  applyGsuPreset(document.getElementById('gsu-preset')?.value || '');
  computeWeakSourceModel();
  renderSchematic(document.getElementById('gsu-preset')?.value || '');
  
  try { initZ0ModelUI(); } catch {}
}

let didInitialZFit = false;

function fitZToCurrentOnce() {
  if (didInitialZFit) return;
  const zMax = Math.max(...collectZ().map(Math.abs));
  const dom  = niceSymmetricDomain(zMax);
  applyAxis_Z(dom, { instant: false });   // animate normally outside of drag
  didInitialZFit = true;
}

function updateCollapseRows() {
  try {
    const ratio  = +($('#Z_ratio').val() || 0);
    const ratio0 = +($('#Z0_ratio').val() || 0);
    const L      = +($('#Z_l').val() || 0);
    const angle1 = +($('#Z_angle').val() || 0);
    const angle0 = +($('#Z0_angle').val() || 0);

    const Z1line = (ratio * L);
    const Z0line = (ratio0 * L);

    d3.selectAll('#collapse0')
      .html(`Z <sub>1</sub> = ${(Z1line).toFixed(2)} <tspan style="text-decoration:underline">/${angle1}</tspan> â„¦`);
    d3.selectAll('#collapseZ0')
      .html(`Z <sub>0</sub> = ${(Z0line).toFixed(2)} <tspan style="text-decoration:underline">/${angle0}</tspan> â„¦`);

    // keep |Z1| (line) in sync unless user is actively editing it
    if (!_lockZLmag) syncZLmagFromParts();
  } catch (e) { /* keep calm and carry on */ }
}


let _lockZLmag = false;

function syncZLmagFromParts() {
  if (_lockZLmag) return;
  const ratio = parseFloat($('#Z_ratio').val()) || 0;
  const L     = parseFloat($('#Z_l').val())     || 0;
  const zmag  = ratio * L;
  const el = document.getElementById('ZLmag');
  if (el) el.value = Number.isFinite(zmag) ? zmag.toFixed(3) : '';
}

function syncPartsFromZLmag() {
  const zmag = parseFloat($('#ZLmag').val());
  const L    = parseFloat($('#Z_l').val());
  if (!Number.isFinite(zmag) || !Number.isFinite(L) || L === 0) return;
  _lockZLmag = true;
  const ratio = zmag / L;
  const el = document.getElementById('Z_ratio');
  if (el) {
    el.value = ratio.toFixed(4);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  _lockZLmag = false;
  updateCollapseRows();
  recordAndUpdate();
}


if (typeof $ !== 'undefined') {
$('input[name="charType"]').on('change', function () {
  window.currentCharType = this.value;  // if other code relies on it
  recordAndUpdate();                    // calls update2() which calls startQuad()
  if (String(this.value).toUpperCase() === 'QUAD') {
    try { drawQuadHandles(); } catch (e) { /* handles are optional */ }
  }
});
}

    async function update2 () {

    Object.assign(window, computeVoltagePhasors({ va, vb, vc, p0x, p0y, Three_ph }));
    Object.assign(window, computeCurrentPhasors({ ia, ib, ic, p0x, p0y, Three_ph_I }));
    Object.assign(window, computeImpedancePhasors({}));
    /* -------------------------------------------------------------- */

    const [inDisplay, knDisplay] = await Promise.all([
      convertScalar(Zabs(IN), 'I'),
      convertScalar(Zabs(KN), 'Z'),
    ]);
    {
      const out = d3.select('#components_Factors_after');
      if (!out.empty()) {
        out.text(`IN = ${meterReadoutFormatter.format(inDisplay)},  KN = ${meterReadoutFormatter.format(knDisplay)}`);
      }
    }

    fact_1A = 1;

    startQuad();

const OZ = originZ();

function circleCx(d){ return (OZ[0] + d[0]) / 2; }
function circleCy(d){ return (OZ[1] + d[1]) / 2; }
function circleR (d){ return Math.hypot(OZ[0]-d[0], OZ[1]-d[1]) / 2; }

vis_inner_Z.selectAll("circle.vector_Z1_Line")
  .data(ps_Z1_line ?? [])
  .join("circle")
  .attr("class","vector_Z1_Line")
  .attr("cx", circleCx)
  .attr("cy", circleCy)
  .attr("r",  circleR)
  .style("pointer-events","none")
  .classed("intersect", !!check_trip);

vis_inner_Z.selectAll("circle.vector_Z2_Line")
  .data(ps_Z2_line ?? [])
  .join("circle")
  .attr("class","vector_Z2_Line")
  .attr("cx", circleCx)
  .attr("cy", circleCy)
  .attr("r",  circleR)
  .style("pointer-events","none")
  .classed("intersect2", !!check_trip2);

vis_inner_Z.selectAll("circle.vector_Z3_Line")
  .data(ps_Z3_line ?? [])
  .join("circle")
  .attr("class","vector_Z3_Line")
  .attr("cx", circleCx)
  .attr("cy", circleCy)
  .attr("r",  circleR)
  .style("pointer-events","none")
  .classed("intersect3", !!check_trip3);

    await renderVectorsAndTexts();

    vis_inner_Z.selectAll(".vector_Z_Line, .vectora_Z, .vectorb_Z, .vectorc_Z, .vectorab_Z, .vectorbc_Z, .vectorca_Z")
               .style("pointer-events", "none");

    d3.selectAll(".vector_Z_Line").attr("marker-start", "url(#markPol)");

    vis_inner_V.selectAll("circle.vectora")
        .data(psa)
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; }).raise();

    vis_inner_V.selectAll("circle.vectorb")
        .data(psb)
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; }).raise();

    vis_inner_V.selectAll("circle.vectorc")
        .data(psc)
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; }).raise();

    vis_inner_I.selectAll("circle.vectora_I")
        .data(psa_I)
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; }).raise();

    vis_inner_I.selectAll("circle.vectorb_I")
        .data(psb_I)
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; }).raise();

    vis_inner_I.selectAll("circle.vectorc_I")
        .data(psc_I)
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; }).raise();          

    vis_KN.selectAll("circle.vector_KN")
      .data(ps_KN)
      .join(
        enter => enter.append("circle")
          .attr("class", "vector_KN")
          .attr("r", 25)
          .call(drag),
        update => update
      )
      .attr("cx", d => d[0])
      .attr("cy", d => d[1]);

updateCollapseRows();                              
    }

function headFromFields(ampSel, angSel, origin, pixPerUnit) {
  const amp = parseFloat($(ampSel).val()) || 0;
  const deg = parseFloat($(angSel).val()) || 0;
  const rpx = amp * pixPerUnit;
  const th  = deg * DEG2RAD;
  return [ origin[0] + rpx * Math.cos(th), origin[1] - rpx * Math.sin(th) ];
}

function recomputeVHeadsFromInputs() {
  const O = originV();
  va = headFromFields('#Amp_A', '#Angle_A', O, PIX_PER_AMP_V);
  vb = headFromFields('#Amp_B', '#Angle_B', O, PIX_PER_AMP_V);
  vc = headFromFields('#Amp_C', '#Angle_C', O, PIX_PER_AMP_V);
  psa = [va]; psb = [vb]; psc = [vc];
}

function recomputeIHeadsFromInputs() {
  const O = originI();
  ia = headFromFields('#Amp_A_I', '#Angle_A_I', O, PIX_PER_AMP_I);
  ib = headFromFields('#Amp_B_I', '#Angle_B_I', O, PIX_PER_AMP_I);
  ic = headFromFields('#Amp_C_I', '#Angle_C_I', O, PIX_PER_AMP_I);
  psa_I = [ia]; psb_I = [ib]; psc_I = [ic];
}

// --- helpers ---------------------------------------------------------------
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const normDeg = d => ((d + 540) % 360) - 180; // [-180,180)

// CLASS_TO_FIELDS - lazily initialized to avoid SSR issues
let CLASS_TO_FIELDS = null;
function getCLASS_TO_FIELDS() {
  if (CLASS_TO_FIELDS) return CLASS_TO_FIELDS;
  if (typeof document === 'undefined') return null;
  
  CLASS_TO_FIELDS = new Map([
    // Voltage (A/B/C)
    ['vectora',  { amp: '#Amp_A',  ang: '#Angle_A',   scale: () => PIX_PER_AMP_V, origin: p0,  lock: () => +toggleon.value === 1,
                   sib: [{amp:'#Amp_B',ang:'#Angle_B',off:-120},{amp:'#Amp_C',ang:'#Angle_C',off:+120}] }],
    ['vectorb',  { amp: '#Amp_B',  ang: '#Angle_B',   scale: () => PIX_PER_AMP_V, origin: p0,  lock: () => +toggleon.value === 1,
                   sib: [{amp:'#Amp_C',ang:'#Angle_C',off:-120},{amp:'#Amp_A',ang:'#Angle_A',off:+120}] }],
    ['vectorc',  { amp: '#Amp_C',  ang: '#Angle_C',   scale: () => PIX_PER_AMP_V, origin: p0,  lock: () => +toggleon.value === 1,
                   sib: [{amp:'#Amp_A',ang:'#Angle_A',off:-120},{amp:'#Amp_B',ang:'#Angle_B',off:+120}] }],

    // Current (A/B/C)
    ['vectora_I',{ amp: '#Amp_A_I',ang: '#Angle_A_I', scale: () => PIX_PER_AMP_I, origin: p0_I,lock: () => +toggleon_I.value === 1,
                   sib: [{amp:'#Amp_B_I',ang:'#Angle_B_I',off:-120},{amp:'#Amp_C_I',ang:'#Angle_C_I',off:+120}] }],
    ['vectorb_I',{ amp: '#Amp_B_I',ang: '#Angle_B_I', scale: () => PIX_PER_AMP_I, origin: p0_I,lock: () => +toggleon_I.value === 1,
                   sib: [{amp:'#Amp_C_I',ang:'#Angle_C_I',off:-120},{amp:'#Amp_A_I',ang:'#Angle_A_I',off:+120}] }],
    ['vectorc_I',{ amp: '#Amp_C_I',ang: '#Angle_C_I', scale: () => PIX_PER_AMP_I, origin: p0_I,lock: () => +toggleon_I.value === 1,
                   sib: [{amp:'#Amp_A_I',ang:'#Angle_A_I',off:-120},{amp:'#Amp_B_I',ang:'#Angle_B_I',off:+120}] }],

    ['vector_KN', {
      amp: '#KN',
      ang: '#KN_angle',
       scale: () => PIX_PER_AMP_KN,
      origin: [p0_KNx, p0_KNy],
      bounds: [0, w_KN, 0, h_KN],  // xmin, xmax, ymin, ymax (pixels in KN SVG)
      lock: () => false
    }],           
  ]);
  return CLASS_TO_FIELDS;
}

// --- Overshoot-based autosizing during drag ---------------------------------
function overshootPx(px, lo, hi) {
  return px < lo ? (lo - px) : (px > hi ? (px - hi) : 0);
}

function canvasConfigForClass(cls) {
  // Decide which canvas/scales/axis-applier/bounds to use
  if (cls.endsWith('_I')) {
    return {
      xScale: xScale_I, yScale: yScale_I,
      apply: (dom, opts) => applyAxis_I(dom, opts),
      width:  p0x * 2 - svgPadding,
      height: p0y * 2 - svgPadding
    };
  }
  if (cls.includes('_Z')) {
    return {
      xScale: xScale_Z, yScale: yScale_Z,
      apply: (dom, opts) => applyAxis_Z(dom, opts),
      width:  p0x * 2 - svgPadding,
      height: p0y * 2 - svgPadding
    };
  }
  if (cls === 'vector_KN') { // leave KN alone (no autosize while dragging)
    return {
      xScale: xScale_KN, yScale: yScale_KN,
      apply: (dom, opts) => applyAxis_KN(dom, opts),
      width:  w_KN - svgPadding,
      height: h_KN - svgPadding
    };
  }
  // default â†’ Voltage canvas
  return {
    xScale: xScale_V, yScale: yScale_V,
    apply: (dom, opts) => applyAxis_V(dom, opts),
    width:  p0x * 2 - svgPadding,
    height: p0y * 2 - svgPadding
  };
}

function maybeExpandWhileDragging(cls, px, py) {
  // Do not resize KN while dragging
  if (cls === 'vector_KN') return;

  const key = classKey(cls);
  const { xScale, yScale, apply, width, height } = canvasConfigForClass(cls);

  // --- GROW on overshoot (same idea as before) ---
  const ox = overshootPx(px, 0, width);
  const oy = overshootPx(py, 0, height);
  const extraPx = Math.max(ox, oy);
  if (extraPx > 0) {
    const pxPerUnit  = xScale(1) - xScale(0);
    const unitsPerPx = 1 / Math.max(1e-9, pxPerUnit);
    const growUnits  = extraPx * unitsPerPx * 1.2;

    const cur  = xScale.domain();
    const half = Math.max(Math.abs(cur[0]), Math.abs(cur[1]));
    const next = Math.min(MAX_CAP, half + growUnits);
    apply([-next, +next], { instant: true });
    shrinkState[key] = 0;         // reset shrink hysteresis on grow
    return;                       // donâ€™t try to shrink same frame
  }

  // --- SHRINK when thereâ€™s comfortable slack inside the current domain ---
  if (key === 'Z') return;        // as requested: leave impedance out for drag
  const cur  = xScale.domain();
  const half = Math.max(Math.abs(cur[0]), Math.abs(cur[1]));
  const used = currentMaxEngForCanvas(key);    // engineering units
  const want = niceSymmetricDomain(used)[1];   // target half-range after padding

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

// ------- Auto-scale helpers -------
const MAX_CAP = 1e6;        // ignore absurd values
const MIN_SPAN = 1e-6;      // avoid zero-span domains
const PAD = 1.75;           // breathing room around extrema
let isAutoScaling = false;  // re-entry guard
// --- Shrink tuning (smooth / anti-jitter)
const SHRINK_SLACK        = 0.82;  // shrink when used range < 82% of current half-range
const SHRINK_MIN_CONSEC   = 2;     // need N consecutive frames under threshold

const shrinkState = { V: 0, I: 0, Z: 0, KN: 0 };

function classKey(cls) {
  if (cls.endsWith('_I')) return 'I';
  if (cls.includes('_Z')) return 'Z';
  if (cls === 'vector_KN') return 'KN';
  return 'V';
}

// Max magnitude (engineering units) currently shown on a canvas
function currentMaxEngForCanvas(key) {
  if (key === 'V') {
    const O = originV();
    const heads = [psa?.[0], psb?.[0], psc?.[0]].filter(Boolean);
    if (!heads.length) return AMP_V_INIT;
    const ppu = PIX_PER_AMP_V || (xScale_V(1) - xScale_V(0));
    return Math.max(...heads.map(([x,y]) => Math.hypot(x - O[0], y - O[1]) / Math.max(ppu,1e-9)));
  }
  if (key === 'I') {
    const O = originI();
    const heads = [psa_I?.[0], psb_I?.[0], psc_I?.[0]].filter(Boolean);
    if (!heads.length) return AMP_I_INIT;
    const ppu = PIX_PER_AMP_I || (xScale_I(1) - xScale_I(0));
    return Math.max(...heads.map(([x,y]) => Math.hypot(x - O[0], y - O[1]) / Math.max(ppu,1e-9)));
  }
  if (key === 'Z') {
    // leave Z out during drag; this is only used if you later enable Z shrinking
    const vals = collectZ();
    return Math.max(...vals.map(Math.abs));
  }
  return 1;
}

function finiteNums(arr) {
  return arr.filter(v => Number.isFinite(v) && Math.abs(v) > 0 && Math.abs(v) <= MAX_CAP);
}
function niceSymmetricDomain(maxAbs, tickCount = 8) {
  const m = Math.max(MIN_SPAN, Math.min(MAX_CAP, maxAbs * PAD));
  const s = d3.scaleLinear().domain([-m, m]).nice(tickCount);
  return s.domain(); // symmetric nice numbers
}
function styleAxesOnce() {
  d3.selectAll(".y-axis_V path, .x-axis_V path, .y-axis_V line, .x-axis_V line," +
               ".y-axis_I path, .x-axis_I path, .y-axis_I line, .x-axis_I line," +
               ".y-axis_Z path, .x-axis_Z path, .y-axis_Z line, .x-axis_Z line," +
               ".y-axis_KN path, .x-axis_KN path, .y-axis_KN line, .x-axis_KN line")
    .style("stroke", "#666")
    .style("stroke-width", 2)
    .style("fill", "none");
}

// Collect candidates in engineering units
function collectV() {
  const vals = [
    +$('#Amp_A').val(), +$('#Amp_B').val(), +$('#Amp_C').val(),
    +$('#Amp_0').val(), +$('#Amp_1').val(), +$('#Amp_2').val()
  ];
  const f = finiteNums(vals);
  return f.length ? f : [AMP_V_INIT];
}
function collectI() {
  const vals = [
    +$('#Amp_A_I').val(), +$('#Amp_B_I').val(), +$('#Amp_C_I').val(),
    +$('#Amp_0_I').val(), +$('#Amp_1_I').val(), +$('#Amp_2_I').val()
  ];
  const f = finiteNums(vals);
  return f.length ? f : [AMP_I_INIT];
}
function collectZ() {
  const pts = [];

  // phase & loop impedances (engineering Ohms) if available
  [za, zb, zc, zab, zbc, zca].forEach(z => {
    if (z && Number.isFinite(z[0]) && Number.isFinite(z[1])) {
      pts.push(Math.abs(z[0]), Math.abs(z[1]));
    }
  });

  // reaches and line angle
  const Zline = (+$('#Z_ratio').val() || 0) * (+$('#Z_l').val() || 0);
  const reachMaxPct = Math.max(+$('#Z1').val() || 0, +$('#Z2').val() || 0, +$('#Z3').val() || 0);
  if (Number.isFinite(Zline) && Number.isFinite(reachMaxPct)) {
    const r = Zline * reachMaxPct / 100;
    pts.push(Math.abs(r));
  }

  // QUAD vertices envelope
  if ($('input[name="charType"]:checked').val() === 'QUAD') {
    const rLeft = +$('#reachLeft').val() || 0;
    const rRight = +$('#reachRight').val() || 0;
    const phi = (+$('#Z_angle').val() || 0) * Math.PI / 180;
    const phiLeft = (+$('#reachAngleLeft').val() || 0) * Math.PI / 180;
    const phiRight = (+$('#reachAngleRight').val() || 0) * Math.PI / 180;
    const quadReaches = ['#Z1', '#Z2', '#Z3'].map(id => +$(id).val() || 0);

    const cosPhiLeft = Math.cos(-phiLeft + Math.PI / 2);
    const sinPhiLeft = Math.sin(-phiLeft + Math.PI / 2);
    const cosPhi = Math.cos(-phi + Math.PI / 2);
    const sinPhi = Math.sin(-phi + Math.PI / 2);
    const cosPhiRight = Math.cos(-phiRight + Math.PI / 2);
    const sinPhiRight = Math.sin(-phiRight + Math.PI / 2);

    quadReaches.forEach(pct => {
      const r = Zline * pct / 100;
      const rL = rLeft * pct / (+$('#Z1').val() || 1);
      const rR = rRight * pct / (+$('#Z1').val() || 1);
      const verts = [
        [-rL * cosPhi,               +rL * sinPhi],
        [-rL * (cosPhiLeft - sinPhiLeft), +r],
        [ rR * (cosPhiRight + sinPhiRight), +r],
        [ rR * cosPhi,               -rR * sinPhi]
      ];
      verts.forEach(([R, X]) => pts.push(Math.abs(R), Math.abs(X)));
    });
  }

  // Blinder arc radius
  const arcR = +$('#blinderArcRadius').val();
  if (Number.isFinite(arcR) && arcR > 0) pts.push(Math.abs(arcR));

  const f = finiteNums(pts);
  return f.length ? f : [AMP_Z_INIT];
}

// Axis rebind with transition and center correction
function applyAxis_V(newDom, { instant = false } = {}) {
  xScale_V.domain(newDom);
  yScale_V.domain(newDom);

  const xCenter = yScale_V(0) + svgPadding / 2;
  const yCenter = xScale_V(0) + svgPadding / 2;

  const xSel = svgAxis_V.select('.x-axis_V');
  const ySel = svgAxis_V.select('.y-axis_V');

  (instant ? xSel : xSel.transition().duration(300))
    .attr('transform', `translate(${svgPadding/2},${xCenter})`)
    .call(xAxis_V.scale(xScale_V));

  (instant ? ySel : ySel.transition().duration(300))
    .attr('transform', `translate(${yCenter},${svgPadding/2})`)
    .call(yAxis_V.scale(yScale_V));

  SCALE_V       = xScale_V(1) - xScale_V(0);
  PIX_PER_AMP_V = SCALE_V;

  recomputeVHeadsFromInputs(); // keep heads consistent after scale change
}

function applyAxis_I(newDom, { instant = false } = {}) {
  xScale_I.domain(newDom);
  yScale_I.domain(newDom);

  const xCenter = p0y; // you keep I-axis centered by layout
  const yCenter = p0x;

  const xSel = svgAxis_I.select('.x-axis_I');
  const ySel = svgAxis_I.select('.y-axis_I');

  (instant ? xSel : xSel.transition().duration(300))
    .attr('transform', `translate(${svgPadding/2},${xCenter})`)
    .call(xAxis_I.scale(xScale_I));

  (instant ? ySel : ySel.transition().duration(300))
    .attr('transform', `translate(${yCenter},${svgPadding/2})`)
    .call(yAxis_I.scale(yScale_I));

  SCALE_I       = xScale_I(1) - xScale_I(0);
  PIX_PER_AMP_I = SCALE_I;

  recomputeIHeadsFromInputs();
}

function applyAxis_Z(newDom, { instant = false } = {}) {
  xScale_Z.domain(newDom);
  yScale_Z.domain(newDom);

  const xCenter = yScale_Z(0) + svgPadding / 2;
  const yCenter = xScale_Z(0) + svgPadding / 2;

  const xSel = svgAxis_Z.select('.x-axis_Z');
  const ySel = svgAxis_Z.select('.y-axis_Z');

  (instant ? xSel : xSel.transition().duration(300))
    .attr('transform', `translate(${svgPadding/2},${xCenter})`)
    .call(xAxis_Z.scale(xScale_Z));

  (instant ? ySel : ySel.transition().duration(300))
    .attr('transform', `translate(${yCenter},${svgPadding/2})`)
    .call(yAxis_Z.scale(yScale_Z));

  SCALE_Z       = xScale_Z(1) - xScale_Z(0);
  PIX_PER_AMP_Z = SCALE_Z;

  // redraw overlays that depend on scale
  try { if (typeof drawQuads === 'function') drawQuads(vis_inner_Z); } catch(_) {}
  try { if (typeof window.drawSELBlinder === 'function') window.drawSELBlinder(); } catch(_) {}
}

function applyAxis_KN(newDom, { instant = false } = {}) {
  xScale_KN.domain(newDom);
  yScale_KN.domain(newDom);

  const xCenter = p0_KNy;
  const yCenter = p0_KNx;

  const xSel = svgAxis_KN.select('.x-axis_KN');
  const ySel = svgAxis_KN.select('.y-axis_KN');

  (instant ? xSel : xSel.transition().duration(300))
    .attr('transform', `translate(${svgPadding/2},${xCenter})`)
    .call(xAxis_KN.scale(xScale_KN));

  (instant ? ySel : ySel.transition().duration(300))
    .attr('transform', `translate(${yCenter},${svgPadding/2})`)
    .call(yAxis_KN.scale(yScale_KN));

  SCALE_KN       = xScale_KN(1) - xScale_KN(0);
  PIX_PER_AMP_KN = SCALE_KN;

  // keep KN head at same magnitude/angle after scale change
  const mag = parseFloat($('#KN').val()) || 0;
  const ang = parseFloat($('#KN_angle').val());
  const deg = Number.isFinite(ang) ? ang : currentKNAngleDeg();
  setKNHeadFromPolar(mag, deg);
}

// === Axes snapshot/apply for History =====================================
function axesSnapshot() {
  return {
    V:  xScale_V.domain().slice(),
    I:  xScale_I.domain().slice(),
    Z:  xScale_Z.domain().slice(),
    KN: xScale_KN.domain().slice(),
  };
}
function axesApply(domains, instant = true) {
  if (domains?.V)  applyAxis_V(domains.V,  { instant });
  if (domains?.I)  applyAxis_I(domains.I,  { instant });
  if (domains?.Z)  applyAxis_Z(domains.Z,  { instant });
  if (domains?.KN) applyAxis_KN(domains.KN,{ instant });
}

function autoScaleAll() {
  // Compute desired domains
  const vMax = Math.max(...collectV().map(Math.abs));
  const iMax = Math.max(...collectI().map(Math.abs));
  const zMax = Math.max(...collectZ().map(Math.abs));
  const knMag = Math.abs(parseFloat($('#KN').val()) || 1);

  const vDomNew  = niceSymmetricDomain(vMax);
  const iDomNew  = niceSymmetricDomain(iMax);
  const zDomNew  = niceSymmetricDomain(zMax);
  const knDomNew = niceSymmetricDomain(Math.max(knMag, 1)); // keep â‰¥1 for usability

  // Only apply if changed
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];

  const vDomOld  = xScale_V.domain().slice();
  const iDomOld  = xScale_I.domain().slice();
  const zDomOld  = xScale_Z.domain().slice();
  const knDomOld = xScale_KN.domain().slice();

  if (!same(vDomNew, vDomOld))  applyAxis_V(vDomNew);
  if (!same(iDomNew, iDomOld))  applyAxis_I(iDomNew);
  if (!same(zDomNew, zDomOld))  applyAxis_Z(zDomNew);
  if (!same(knDomNew, knDomOld)) applyAxis_KN(knDomNew);

  styleAxesOnce();
}

// Sync the form fields from a dragged head so the phase render path updates too
function syncInputsFromDrag(node, x, y) {
  const cls = [...node.classList].find(c => getCLASS_TO_FIELDS()?.has(c));
  if (!cls) return;
  const { amp, ang, scale, origin, lock, sib = [] } = getCLASS_TO_FIELDS()?.get(cls);

  const vx = x - origin[0];
  const vy = y - origin[1];
  const scal = (typeof scale === 'function' ? scale() : scale) || 1;
  const magUnits = Math.hypot(vx, vy) / scal;
  const deg = normDeg(Math.atan2(-vy, vx) * RAD2DEG);

  $(amp).val(magUnits.toFixed(1));
  if (ang) $(ang).val(deg.toFixed(1));       // KN has no angle box

  if (lock && lock()) {
    sib.forEach(({ amp: aSel, ang: gSel, off }) => {
      $(aSel).val(magUnits.toFixed(1));
      if (gSel) $(gSel).val(normDeg(deg + off).toFixed(1));
    });
  }

  // tag the source correctly (so we donâ€™t run ganged() unnecessarily)
  editSource = cls === 'vector_KN'
    ? 'KN'
    : (cls.includes('_I') ? 'I_ABC' : 'V_ABC');
}

// small rAF throttle so we donâ€™t spam compute()
let rafId = 0;
const rafUpdate = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => { rafId = 0; recordAndUpdate(); });
};

// Clamp a drag to current domain in engineering units
function clampHeadToDomain(x, y, origin, pixPerUnit, maxEng) {
  const dx = x - origin[0], dy = y - origin[1];
  const rpx  = Math.hypot(dx, dy);
  const ang  = Math.atan2(-dy, dx);        // screen Y up negative
  const rEng = rpx / Math.max(1e-9, pixPerUnit);
  const rCap = Math.min(rEng, maxEng);
  const rNew = rCap * pixPerUnit;
  return [ origin[0] + rNew * Math.cos(ang),
           origin[1] - rNew * Math.sin(ang) ];
}

// --- patch drag to also sync the inputs ------------------------------------
const drag = d3.drag()
  .on('start', function (event, d) {
    isDragging = true;
    History.begin('drag', { cls: this.classList?.[0] || 'unknown' });
    this.__origin__ = d.slice(); // keep head in pixels
  })
  .on('drag', function (event, d) {
    const cls = [...this.classList][0] || 'unknown';

    // Free motion: follow the pointer even outside the SVG
    this.__origin__[0] += event.dx;
    this.__origin__[1] += event.dy;
    let x = this.__origin__[0];
    let y = this.__origin__[1];

    // If we are outside the plot, expand the domain instantly (no animations)
    maybeExpandWhileDragging(cls, x, y);

    // Write back the head; the instant axis growth keeps it under the cursor
    d[0] = x; d[1] = y;

    // Reflect into inputs (amps/angles) and recompute
    syncInputsFromDrag(this, x, y);
    rafUpdate();
  })
  .on('end', function () {
    delete this.__origin__;
    recordAndUpdate(); // final precise render
    History.commit();
    isDragging = false;  
  });

const renderVector = (container, cls, data) => {
  const safe = (Array.isArray(data) ? data : []).filter(Array.isArray);
  container
    .selectAll(`circle.${cls}`)
    .data(safe)
    .join(
      enter => enter.append('circle')
        .attr('class', cls)
        .attr('id', cls)
        .attr('r', 25)
        // set position on ENTER too (prevents 0,0)
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .call(drag),
      update => update
        // keep tied to bound data on every update
        .attr('cx', d => d[0])
        .attr('cy', d => d[1]),
      exit => exit.remove()
    );
};

function setKNHeadFromPolar(mag, deg) {
  const rpx   = (Number.isFinite(mag) ? mag : 0) * PIX_PER_AMP_KN;
  const theta = deg * DEG2RAD;
  const x = p0_KNx + rpx * Math.cos(theta);
  const y = p0_KNy - rpx * Math.sin(theta); // screen Y up is negative
  if (!ps_KN || !ps_KN[0]) ps_KN = [[x, y]];
  else { ps_KN[0][0] = x; ps_KN[0][1] = y; }
  rafUpdate();
}

function currentKNAngleDeg() {
  const head = ps_KN?.[0] || [p0_KNx, p0_KNy];
  const dx = head[0] - p0_KNx;
  const dy = p0_KNy - head[1]; // invert Y
  return normDeg(Math.atan2(dy, dx) * RAD2DEG);
}

// replace the old version with this shim that preserves current angle when only mag changes
function setKNHeadFromScalar(mag) {
  const degInput = parseFloat($('#KN_angle').val());
  const deg = Number.isFinite(degInput) ? degInput : currentKNAngleDeg();
  setKNHeadFromPolar(mag, deg);
}

(() => {
  const ampEl = document.getElementById('KN');
  if (!ampEl) return;
  ['input','change'].forEach(ev =>
    ampEl.addEventListener(ev, () => {
      editSource = 'KN';
      const mag = parseFloat(ampEl.value);
      setKNHeadFromScalar(Number.isFinite(mag) ? mag : 0); // updates ps_KN + rafUpdate()
    }, { passive: true })
  );
})();

d3.select('#KN_angle').on('input change', function () {
  const mag = parseFloat($('#KN').val()) || 0;
  setKNHeadFromPolar(mag, parseFloat(this.value) || 0);
  editSource = 'KN';
});

async function performUpdateCycle() {
  await update2();

  const restoring = History.isRestoring && History.isRestoring();
  if (!restoring) {
    if (editSource === 'V_ABC' || editSource === 'I_ABC') {
      ganged();   // ABC -> 0/1/2
    } else if (editSource === 'V_SEQ' || editSource === 'I_SEQ') {
      tab_ABC();  // 0/1/2 -> ABC
    } else {
      ganged();
    }
  }

  compute();

  if (!isDragging && !isAutoScaling && !restoring) {
    isAutoScaling = true;
    autoScaleAll();
    await update2();         // recompute ps_* that depend on xScale_/yScale_
    isAutoScaling = false;
  }

  editSource = null;
  document.dispatchEvent(new CustomEvent('phasors:update'));
}

export function recordAndUpdate() {
  updateLoopPending = true;
  if (updateLoopRunning) return;
  updateLoopRunning = true;
  (async function driveUpdates() {
    do {
      updateLoopPending = false;
      try {
        await performUpdateCycle();
      } catch (err) {
        console.error('[main] update failed', err);
      }
    } while (updateLoopPending);
    updateLoopRunning = false;
  })();
}

// Make full refresh callable from other modules (e.g., presets)
// Safe in modules: attaching to window for loose coupling
window.recordAndUpdate = recordAndUpdate;

    document.getElementById('undoBtn').onclick = History.undo;
    document.getElementById('redoBtn').onclick = History.redo;

    d3.select('#reachLeft').on('change', () => { recordAndUpdate() });
    d3.select('#reachRight').on('change', () => { recordAndUpdate() });
    d3.select('#Z_angle').on('change', () => { recordAndUpdate() });
    d3.select('#reachAngleLeft').on('change', () => { recordAndUpdate() });
    d3.select('#reachAngleRight').on('change', () => { recordAndUpdate() });

    d3.select('body').on('keydown', function (event) {
    const key = event.key || event.keyCode; // safari fallback
    if (key === "Shift") keyc = true;
    });

    window.addEventListener('keydown', (e) => {
    const z = e.key === 'z' || e.key === 'Z';
    const y = e.key === 'y' || e.key === 'Y';
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

    d3.select('body').on('keyup', function () {
    keyc = false;
    });

    const shapes  = d3.select(".vis_inner_I_svg_g");
    const texts   = shapes.selectAll("text");
    const markers= d3.select("#vis_inner_I g defs").selectAll("marker");

     window.addEventListener('DOMContentLoaded', () => {
        boot();
        setupRdbImportUI();
        // if thereâ€™s anything unique in init(), move it into boot() and delete init()
      });

    // ---- RDB/SET/TXT/ZIP Import -------------------------------------------------
    function setupRdbImportUI() {
      const btn   = document.getElementById('import-btn');
      const file  = document.getElementById('import-file');
      const zone  = document.getElementById('import-dropzone');
      const card  = document.getElementById('import-summary');

      if (!btn || !file) return;

      // Reveal dropzone when tooltips are ON (nice discoverability)
      if (zone) zone.style.display = 'grid';

      btn.addEventListener('click', () => file.click(), { passive:true });

      file.addEventListener('change', async (e) => {
        const files = [...(e.target.files || [])];
        if (!files.length) return;
        const result = await importSelSettings(files);
        renderImportSummary(result);
      });

      const accept = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (zone) zone.style.borderColor = 'var(--accent, SteelBlue)';
      };
      const leave = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (zone) zone.style.borderColor = 'var(--muted-stroke,#557)';
      };
      ['dragenter','dragover'].forEach(ev => zone?.addEventListener(ev, accept));
      ['dragleave','drop'].forEach(ev => zone?.addEventListener(ev, leave));
      zone?.addEventListener('click', () => file.click(), { passive:true });
      zone?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); }
      });
      zone?.addEventListener('drop', async (e) => {
        e.preventDefault();
        const dt = e.dataTransfer;
        const files = [...(dt?.files || [])];
        if (!files.length) return;
        const result = await importSelSettings(files);
        renderImportSummary(result);
      });

      function renderImportSummary(res) {
        if (!card) return;
        if (!res || !res.mapping) {
          card.style.display = 'block';
          card.innerHTML = `<div>Could not parse any compatible SEL settings.</div>`;
          return;
        }
        const { info, mapping } = res;
        const raw = mapping.raw || {};
        const scaleMeta = mapping.scaling || {};

        const fmt = (n, d = 2) => Number.isFinite(n) ? Number(n).toFixed(d) : '--';
        const asText = (v) => (v ?? '--');

        const rows = [
          ['Device', `${info?.RELAYTYPE || '--'}`],
          ['Firmware', `${info?.FID || info?.BFID || '--'}`],
          ['CT (p/s)', `${fmt(mapping.ctPrimary, 2)} / ${fmt(mapping.ctSecondary, 2)} A`],
          ['VT (p/s)', `${fmt(mapping.vtPrimary, 2)} / ${fmt(mapping.vtSecondary, 2)} V (${mapping.vtMode})`],
          ['Freq', `${info?.FREQ || '50/60'} Hz`],
          ['|Z1| / angle Z1', `${fmt(mapping.Z1MAG, 3)} ohm / ${fmt(mapping.Z1ANG, 2)}Âº`],
          ['|Z0| / angle Z0', `${fmt(mapping.Z0MAG, 3)} ohm / ${fmt(mapping.Z0ANG, 2)}Âº`],
          ['k0 (mag/angle)', `${fmt(mapping.k0M, 3)} / ${fmt(mapping.k0A, 2)}Âº`],
          ['Length', mapping.lengthText || '--'],
          ['Zones (Z1/Z2/Z3 %)', [mapping.Z1P, mapping.Z2P, mapping.Z3P].map(v => Number.isFinite(v) ? fmt(v, 1) : 'OFF').join(' / ')],
          ['32 thresholds (Q:FP/RP)', `${fmt(mapping['50QFP'])} / ${fmt(mapping['50QRP'])}`],
          ['32 thresholds (V: GFP/GRP)', `${fmt(mapping['50GFP'])} / ${fmt(mapping['50GRP'])}`],
          ['ORDER', asText(mapping.ORDER)],
          ['E32IV', mapping.E32IV ? 'ON' : 'OFF'],
          ['ELOP', mapping.ELOP || 'N'],
          ['OOSB1-5', (mapping.OOSB || []).join('') || '--'],
        ];

        const toast = `<div style="display:inline-flex;align-items:center;gap:.35rem;margin-bottom:.65rem;padding:.35rem .6rem;border-radius:.35rem;background:rgba(25,135,84,.15);color:rgb(25,135,84);font-weight:600;">Scaled to secondary</div>`;

        const diffRows = [
          ['CT primary (A)', raw.ctPrimary, mapping.ctPrimary],
          ['CT secondary (A)', raw.ctSecondary, mapping.ctSecondary],
          ['VT primary (V)', raw.vtPrimary, mapping.vtPrimary],
          ['VT secondary (V)', raw.vtSecondary, mapping.vtSecondary],
          ['|Z1| (ohm)', raw.Z1MAG, mapping.Z1MAG],
          ['|Z0| (ohm)', raw.Z0MAG, mapping.Z0MAG],
        ];

        const diffHtml = diffRows
          .filter(([,, scaled]) => Number.isFinite(scaled))
          .map(([label, before, after]) => {
            const beforeText = Number.isFinite(before) ? fmt(before, 3) : '--';
            const afterText  = Number.isFinite(after)  ? fmt(after, 3)  : '--';
            if (beforeText === afterText) {
              return `<span style="opacity:.65">${label}</span><span style="opacity:.55">(no change)</span><span></span><span></span>`;
            }
            return `<span>${label}</span><span style="opacity:.75">${beforeText}</span><span style="opacity:.45">-></span><span>${afterText}</span>`;
          })
          .join('');

        const sanity = Number.isFinite(scaleMeta.z1DeltaPct) ? scaleMeta.z1DeltaPct : undefined;
        const sanityBadge = (sanity && sanity > 0.03)
          ? `<span style="padding:.1rem .45rem;border-radius:999px;font-size:.75rem;font-weight:600;background:rgba(220,53,69,.12);color:rgb(200,35,51);">Scaling sanity: ${(sanity * 100).toFixed(1)}% delta</span>`
          : '';

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
            ${rows.map(([k,v]) => `<div style="opacity:.8">${k}</div><div>${v}</div>`).join('')}
          </div>
          <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
            <button id="import-apply" class="btn">Apply</button>
            <button id="import-save" class="btn">Save as preset</button>
            <span style="opacity:.7">A read-only "Imported preset" is also added.</span>
          </div>
          ${diffSection}
        `;

        card.style.display = 'block';
        card.innerHTML = table;

        document.getElementById('import-apply')?.addEventListener('click', () => {
          try { applyMappingToForm(mapping); recordAndUpdate(); } catch (e) { console.error(e); }
        });

        document.getElementById('import-save')?.addEventListener('click', () => {
          const name = prompt('Preset name:', `Imported ${info?.RELAYTYPE || ''}`.trim());
          if (!name) return;
          applyMappingToForm(mapping);
          const sel = document.getElementById('preset-select');
          if (sel && ![...sel.options].some(o => o.value === name)) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            sel.appendChild(opt);
          }
          if (sel) {
            sel.value = name;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
          document.getElementById('preset-save')?.click();
        });

        ensureImportedPresetOption();
      }

      function ensureImportedPresetOption() {
        const sel = document.getElementById('preset-select');
        if (!sel) return;
        const label = 'Imported preset (read-only)';
        if (![...sel.options].some(o => o.value === '__IMPORTED__')) {
          const opt = document.createElement('option');
          opt.value = '__IMPORTED__';
          opt.textContent = label;
          opt.disabled = true;     // visually conveys read-only
          sel.add(opt, sel.options[1] || null);
        }
        // When selected (if someone forces it), disable Save/Delete
        const saveBtn = document.getElementById('preset-save');
        const delBtn  = document.getElementById('preset-delete');
        sel.addEventListener('change', () => {
          const ro = sel.value === '__IMPORTED__';
          if (saveBtn) saveBtn.disabled = ro;
          if (delBtn)  delBtn.disabled  = ro;
        });
      }
    }

    async function importSelSettings(files) {
      const texts = [];
      for (const f of files) {
        const ext = (f.name.split('.').pop() || '').toLowerCase();
        if (ext === 'zip' && window.JSZip) {
          try {
            const z = await JSZip.loadAsync(f);
            const entries = Object.values(z.files).filter(x => !x.dir && /\.(txt|set|rdb)$/i.test(x.name));
            for (const ent of entries) {
              const s = await ent.async('string');
              texts.push({ name: ent.name, text: s });
            }
          } catch (e) { console.warn('ZIP import failed', e); }
        } else {
          const s = await f.text().catch(() => null);
          if (s) texts.push({ name: f.name, text: s });
        }
      }
      if (!texts.length) return null;

      // Parse all, pick the best candidate (has [S1] with Z1/Z0 present)
      const parsed = texts.map(t => ({ ...t, parsed: parseSelSetText(t.text) }))
                          .filter(x => x.parsed && Object.keys(x.parsed).length);
      if (!parsed.length) return null;

      // pick first with S1.Z1MAG present
      let best = parsed.find(p => p.parsed.S1 && (p.parsed.S1.Z1MAG || p.parsed.S1.Z1ANG)) || parsed[0];

      const info = best.parsed.INFO || best.parsed[ 'INFO' ] || {};
      const mapping = buildMappingFromParsed(best.parsed);

      return { info, mapping, file: best.name };
    }

    function parseSelSetText(text) {
      // Handles lines like: KEY,"VALUE" or KEY,VALUE; sections [S1] etc.
      const out = {};
      let section = 'ROOT';
      const lines = String(text).split(/\r?\n/);
      for (let raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith('//') || line.startsWith(';')) continue;

        const sec = line.match(/^\[([A-Za-z0-9_]+)\]\s*$/);
        if (sec) { section = sec[1].toUpperCase(); if (!out[section]) out[section] = {}; continue; }

        const kv = line.match(/^([A-Za-z0-9_]+)\s*,\s*(.*)$/);
        if (!kv) continue;
        const key = kv[1].toUpperCase();
        let val = kv[2].trim();

        // Strip quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        out[section] = out[section] || {};
        out[section][key] = normalizeSelValue(val);
      }
      return out;
    }

    function normalizeSelValue(v) {
      if (v == null) return null;
      const s = String(v).trim();
      const upper = s.toUpperCase();

      // Simple flags
      if (['OFF','NA','N','NO','0','FALSE'].includes(upper)) return null;
      if (['ON','Y','YES','1','TRUE','AUTO','Y1'].includes(upper)) return upper; // keep truthy marker string

      // numbers â€” handle "1,234.56", "1.234,56", "1,23E-2"
      let t = s.replace(/_/g,'').replace(/\s+/g,'');
      // If it looks like European decimal (only one comma and no dot), swap
      if (/^-?\d{1,3}(?:\.\d{3})*,\d+$/.test(t)) t = t.replace(/\./g,'').replace(',', '.');
      // Otherwise remove thousands commas
      if (/^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(t)) t = t.replace(/,/g,'');
      const n = Number(t);
      return Number.isFinite(n) ? n : s;
    }

    // Safe getter across sections with priority list
    function g(parsed, keys, sections = ['S1','ROOT','INFO']) {
      for (const sec of sections) {
        if (!parsed[sec]) continue;
        for (const k of (Array.isArray(keys)?keys:[keys])) {
          const kk = String(k).toUpperCase();
          if (parsed[sec].hasOwnProperty(kk)) return parsed[sec][kk];
        }
      }
      return undefined;
    }

    function buildMappingFromParsed(parsed) {
      const rawZ1MAG = g(parsed, 'Z1MAG');
      const rawZ1ANG = g(parsed, 'Z1ANG');
      const rawZ0MAG = g(parsed, 'Z0MAG');
      const rawZ0ANG = g(parsed, 'Z0ANG');

      const k0M = g(parsed, ['K0M','K0MR','K0M1']);
      const k0A = g(parsed, ['K0A','K0AR','K0A1']);

      const lengthVal  = g(parsed, ['LLR','LLL','LENGTH']);
      const lengthUnit = (g(parsed, 'LLUNIT') || 'km').toString().toLowerCase();
      const lengthKm   = Number.isFinite(lengthVal)
        ? (lengthUnit.startsWith('mi') ? lengthVal * 1.609344 : lengthVal)
        : undefined;
      const lengthText = Number.isFinite(lengthVal) ? `${lengthVal} ${lengthUnit}` : undefined;

      const ctPrimary   = g(parsed, ['CTRW','CTRX','CTP','CTR']);
      let ctSecondary   = g(parsed, ['CTRS','CTS','CTSECONDARY','CT2']);
      if (!Number.isFinite(ctSecondary)) ctSecondary = 5;

      const vtPrimary   = g(parsed, ['PTRY','PTRZ','PTR']);
      const vtSecondary = g(parsed, ['VNOMY','VNOMZ','VNOM']);
      const vtMode      = (g(parsed, ['VTMODE','VTCONFIG']) || 'LL').toString().toUpperCase() === 'LN' ? 'LN' : 'LL';

      const ctRatio = Number.isFinite(ctPrimary) && Number.isFinite(ctSecondary) && ctSecondary !== 0
        ? ctPrimary / ctSecondary
        : NaN;
      const vtRatio = Number.isFinite(vtPrimary) && Number.isFinite(vtSecondary) && vtSecondary !== 0
        ? vtPrimary / vtSecondary
        : NaN;
      const zScale = Number.isFinite(ctRatio) && Number.isFinite(vtRatio) && vtRatio !== 0
        ? ctRatio / vtRatio
        : NaN;

      const scaledZ1MAG = Number.isFinite(rawZ1MAG) && Number.isFinite(zScale) ? rawZ1MAG * zScale : rawZ1MAG;
      const scaledZ0MAG = Number.isFinite(rawZ0MAG) && Number.isFinite(zScale) ? rawZ0MAG * zScale : rawZ0MAG;

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

      const Z1P = g(parsed, ['Z1MP','Z1MG']);
      const Z2P = g(parsed, ['Z2MP','Z2MG']);
      const Z3P = g(parsed, ['Z3MP','Z3MG']);

      const th50QFP = g(parsed, ['50QFP','50FP']);
      const th50QRP = g(parsed, ['50QRP','50RP']);
      const th50GFP = g(parsed, ['50GFP','Z50G1']);
      const th50GRP = g(parsed, ['50GRP','Z50G1']);

      const Z2F = g(parsed, 'Z2F');
      const Z2R = g(parsed, 'Z2R');
      const Z0F = g(parsed, 'Z0F');
      const Z0R = g(parsed, 'Z0R');
      const scaledZ2F = Number.isFinite(Z2F) && Number.isFinite(zScale) ? Z2F * zScale : Z2F;
      const scaledZ2R = Number.isFinite(Z2R) && Number.isFinite(zScale) ? Z2R * zScale : Z2R;
      const scaledZ0F = Number.isFinite(Z0F) && Number.isFinite(zScale) ? Z0F * zScale : Z0F;
      const scaledZ0R = Number.isFinite(Z0R) && Number.isFinite(zScale) ? Z0R * zScale : Z0R;      
      const a2  = g(parsed, 'A2');
      const a0  = g(parsed, 'A0');
      const E32IV = !!g(parsed, 'E32IV');
      const ORDER = g(parsed, 'ORDER');
      const ELOP = (g(parsed, 'ELOP') || '').toString().toUpperCase();

      const OOSB = ['OOSB1','OOSB2','OOSB3','OOSB4','OOSB5'].map(k => g(parsed, k) ? 'Y' : 'N');

      const z1DeltaPct = Number.isFinite(rawZ1MAG) && Number.isFinite(scaledZ1MAG) && rawZ1MAG !== 0
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
        '50QFP': th50QFP,
        '50QRP': th50QRP,
        '50GFP': th50GFP,
        '50GRP': th50GRP,
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
    };
    

    function applyMappingToForm(map) {
      const setVal = (id, v) => { const el = document.getElementById(id); if (!el || v==null) return; el.value = v; el.dispatchEvent(new Event('input', { bubbles:true })); el.dispatchEvent(new Event('change', { bubbles:true })); };
      const setChk = (id, on) => { const el = document.getElementById(id); if (!el || on==null) return; el.checked = !!on; el.dispatchEvent(new Event('change', { bubbles:true })); };

      // Metering bases
      if (map.vtPrimary != null)   setVal('vt-primary',   map.vtPrimary);
      if (map.vtSecondary != null) setVal('vt-secondary', map.vtSecondary);
      if (map.vtSecondary != null) setVal('vt-nominal',   map.vtSecondary);
      const vtModeSel = document.getElementById('vt-mode');
      if (vtModeSel && map.vtMode) { vtModeSel.value = map.vtMode; vtModeSel.dispatchEvent(new Event('change', { bubbles:true })); }

      if (map.ctPrimary != null)   setVal('ct-primary', map.ctPrimary);
      if (map.ctSecondary != null) setVal('ct-secondary', map.ctSecondary);
      // Nominal CT 1A/5A radio
      const wantNom = map.ctSecondary && Math.abs(map.ctSecondary - 1) < 0.001 ? '1' : '5';
      const ctRadio = document.querySelector(`input[name="ct-nominal"][value="${wantNom}"]`);
      if (ctRadio) { ctRadio.checked = true; ctRadio.dispatchEvent(new Event('change', { bubbles:true })); }

      // Line model
      if (typeof setUnit === 'function') {
        // our UI defaults to km; convert incoming lengthKm to that system
        setUnit('km');
      }
      if (Number.isFinite(map.lengthKm)) {
        setVal('Z_l', +map.lengthKm.toFixed(3));
      }

      if (Number.isFinite(map.Z1MAG) && Number.isFinite(map.lengthKm) && map.lengthKm > 0) {
        setVal('Z_ratio', +(map.Z1MAG / map.lengthKm).toFixed(4));
      }
      if (Number.isFinite(map.Z0MAG) && Number.isFinite(map.lengthKm) && map.lengthKm > 0) {
        setVal('Z0_ratio', +(map.Z0MAG / map.lengthKm).toFixed(4));
      }
      if (Number.isFinite(map.Z1ANG)) setVal('Z_angle', map.Z1ANG);
      if (Number.isFinite(map.Z0ANG)) { setVal('Z0_angle', map.Z0ANG); setVal('Z0_angleSEL', map.Z0ANG); }

      // Zone reaches (%)
      if (map.Z1P != null) setVal('Z1', map.Z1P);
      if (map.Z2P != null) setVal('Z2', map.Z2P);
      if (map.Z3P != null) setVal('Z3', map.Z3P);

      // Directional / thresholds
      if (map['50QFP'] != null) setVal('50QFP', map['50QFP']);
      if (map['50QRP'] != null) setVal('50QRP', map['50QRP']);
      if (map['50GFP'] != null) setVal('50GFP', map['50GFP']);
      if (map['50GRP'] != null) setVal('50GRP', map['50GRP']);
      if (map.a2    != null)     setVal('a2', map.a2);
      if (map.a0    != null)     setVal('a0', map.a0);
      if (map.Z2F   != null)     setVal('Z2F', map.Z2F);
      if (map.Z2R   != null)     setVal('Z2R', map.Z2R);
      if (map.Z0F   != null)     setVal('Z0F', map.Z0F);
      if (map.Z0R   != null)     setVal('Z0R', map.Z0R);
      if (map.ORDER) { const el = document.getElementById('ORDER'); if (el) { el.value = map.ORDER.toString().slice(0,3).toUpperCase(); el.dispatchEvent(new Event('input', { bubbles:true })); } }
      if (map.E32IV != null) setChk('E32IV', !!map.E32IV);
      if (map.ELOP) setVal('ELOP', map.ELOP);

      // K0 (compensation)
      if (map.k0M != null) setVal('KN', map.k0M);
      if (map.k0A != null) setVal('KN_angle', map.k0A);
    }

    // ---- hook into boot sequence
    (function () {
      const old = window.addEventListener;
      // Ensure we call our setup after your boot()
      window.addEventListener('DOMContentLoaded', () => {
        try { setupRdbImportUI(); } catch(e) { console.warn(e); }
      });
    })();
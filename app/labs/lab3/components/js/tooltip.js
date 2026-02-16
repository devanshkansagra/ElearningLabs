/* Global tooltip manager – D3 v3.4 + auto-title fallback */
import * as d3 from 'd3'
import * as katex from 'katex'
(function () {
/* ---------------------------------------------
 * 1) SVG-only tooltip configuration (examples)
 *    — keep only SVG selectors here
 * ------------------------------------------- */
var SVG_TOOLTIP_CONFIG = {
  "svg circle.vectora": {
    text: function (d, el) {
      var p = (d && d.point) || [0, 0];
      var mag   = Math.hypot(p[0], p[1]).toFixed(2);
      var angle = (Math.atan2(p[1], p[0]) * 180 / Math.PI).toFixed(1);
      return " ";
    },
    html: true,
    offset: { x: 10, y: 10 }
  },
  "svg polyline.vectorb": {
    text: function (d) {
      var z = (d && d.z) || [0, 0];
      return " ";
    },
    html: true,
    offset: { x: 14, y: 10 }
  }
};

// Normalize example tooltip strings to avoid encoding artifacts on some systems
try {
  if (SVG_TOOLTIP_CONFIG["svg circle.vectora"]) {
    SVG_TOOLTIP_CONFIG["svg circle.vectora"].text = function (d, el) {
      var p = (d && d.point) || [0, 0];
      var mag   = Math.hypot(p[0], p[1]).toFixed(2);
      var angle = (Math.atan2(p[1], p[0]) * 180 / Math.PI).toFixed(1);
      return " ";
    };
    SVG_TOOLTIP_CONFIG["svg circle.vectora"].html = true;
  }
  if (SVG_TOOLTIP_CONFIG["svg polyline.vectorb"]) {
    SVG_TOOLTIP_CONFIG["svg polyline.vectorb"].text = function (d) {
      var z = (d && d.z) || [0, 0];
      return " ";
    };
    SVG_TOOLTIP_CONFIG["svg polyline.vectorb"].html = true;
  }
} catch {}

/* ---------------------------------------------
 * 2) Helpers
 * ------------------------------------------- */
var DEFAULT_OFFSET = { x:10, y:10 };
var BR_REGEX = /<br>|[\n\r]/;


function resolveText(cfg, d, el){
  var raw = typeof cfg.text === "function" ? cfg.text.call(el, d, el) : cfg.text;
  if (raw) return raw;
  // Prefer attributes present on the element
  var titleAttr = el.getAttribute("title");
  if (titleAttr) return titleAttr;
  var svgTitle = el.querySelector && el.querySelector("title");
  return svgTitle ? svgTitle.textContent : (el.getAttribute("data-tooltip") || "");
}

function isInSvg(el){
  // Ensure we are inside an <svg> root
  while (el) {
    if (el.tagName && el.tagName.toLowerCase() === 'svg') return true;
    el = el.parentNode;
  }
  return false;
}

/* ---------------------------------------------
 * 3) Wire tooltip to a D3 selection (SVG only)
 * ------------------------------------------- */
function wireSvgTooltip(selection, cfg, layer){
  var offset = Object.assign({}, DEFAULT_OFFSET, cfg.offset || {});
  var allowHtml = !!cfg.html;

  selection.each(function(){ this.__svgTooltipBound = true; });

  selection
    .on("mouseover.tooltip", function(event, d){
      if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') return;
      var el = this;
      if (!isInSvg(el)) return;

      var txt = resolveText(cfg, d, el);
      el.__nativeTitle = el.getAttribute("title");
      if (el.__nativeTitle != null) el.removeAttribute("title");

      if (allowHtml || BR_REGEX.test(txt)) {
        layer.html(String(txt).replace(/\n/g, "<br>"));
      } else {
        layer.text(String(txt));
      }

      if (cfg.style) Object.keys(cfg.style).forEach(function(k){ layer.style(k, cfg.style[k]); });

      layer
        .style("left", (event.pageX + offset.x) + "px")
        .style("top",  (event.pageY + offset.y) + "px")
        .attr("data-show","true");
    })
    .on("mousemove.tooltip", function(event){
      if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') return;
      layer
        .style("left", (event.pageX + offset.x) + "px")
        .style("top",  (event.pageY + offset.y) + "px");
    })
    .on("mouseout.tooltip", function(){
      var el = this;
      layer.attr("data-show","false");
      if (el.__nativeTitle != null) {
        el.setAttribute("title", el.__nativeTitle);
        el.__nativeTitle = null;
      }
    })
    .on("touchstart.tooltip", function(event, d){
      if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') return;
      var t = event.touches && event.touches[0];
      var el = this;
      if (!t) return;

      var txt = resolveText(cfg, d, el);
      if (allowHtml || BR_REGEX.test(txt)) {
        layer.html(String(txt).replace(/\n/g, "<br>"));
      } else {
        layer.text(String(txt));
      }

      layer
        .style("left", (t.pageX + offset.x) + "px")
        .style("top",  (t.pageY + offset.y) + "px")
        .attr("data-show","true");

      clearTimeout(el.__touchTimeout);
      el.__touchTimeout = setTimeout(function(){
        layer.attr("data-show","false");
        if (el.__nativeTitle != null) {
          el.setAttribute("title", el.__nativeTitle);
          el.__nativeTitle = null;
        }
      }, 2500);
    });
}

/* ---------------------------------------------
 * 4) Bootstrap (SVG only)
 *    - Binds custom selectors (must be inside SVG)
 *    - Auto-binds ONLY svg elements with [title]
 * ------------------------------------------- */
function initSvgTooltips(config){
  if (!window.d3 || !d3.select) {
    console.warn("D3 not found; SVG tooltips disabled.");
    return;
  }
  var layer = d3.select("body").append("div").attr("class","tooltip-d3");

  // Custom SVG selectors (keep these SVG-only)
  Object.keys(config || {}).forEach(function(sel){
    var selAll = d3.selectAll(sel).filter(function(){ return isInSvg(this); });
    if (!selAll.empty()) wireSvgTooltip(selAll, config[sel], layer);
  });

  // Auto-bind svg elements that still have a native title
  var autoSel = d3.selectAll("svg [title]").filter(function(){ return !this.__svgTooltipBound; });
  if (!autoSel.empty()) wireSvgTooltip(autoSel, { offset: DEFAULT_OFFSET }, layer);
}

/* ---------------------------------------------
 * 5) Launch after DOM is ready
 * ------------------------------------------- */
window.addEventListener("load", function(){ initSvgTooltips(SVG_TOOLTIP_CONFIG); });
})();

(function(){
  // Enable tap-to-toggle for all [data-tooltip] elements
  document.addEventListener('click', (e) => {
    if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') {
      // When disabled, ensure any open ones are closed and ignore toggling
      document.querySelectorAll('[data-tooltip][data-open="true"]').forEach(el => el.dataset.open = "false");
      return;
    }
    const t = e.target.closest('[data-tooltip]');
    if (!t) {
      // clicked outside -> close all
      document.querySelectorAll('[data-tooltip][data-open="true"]').forEach(el => el.dataset.open = "false");
      return;
    }
    // toggle current, close others
    const open = t.dataset.open === "true";
    document.querySelectorAll('[data-tooltip][data-open="true"]').forEach(el => el.dataset.open = "false");
    t.dataset.open = String(!open);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-tooltip][data-open="true"]').forEach(el => el.dataset.open = "false");
    }
  });
})();

(function(){
  const HOVER_DELAY = 500;     // show after 500 ms
  let hoverTimer = null;

  const host = document.body;
  const panel = document.createElement('div');
  panel.className = 'tooltip-rich';
  panel.setAttribute('role','tooltip');
  host.appendChild(panel);

  let currentTrigger = null;

  function getTemplate(trigger){
    const sel = trigger.getAttribute('data-tooltip-template');
    if (!sel) return null;
    const tpl = document.querySelector(sel);
    return tpl && tpl.content ? tpl.content.cloneNode(true) : null;
  }

  // Very small evaluator for data-calc (Math + your "state" object)
  const sandbox = { Math, state: window.state ?? {} };
  function safeEval(expr){
    try{
      const fn = new Function(...Object.keys(sandbox), `return (${expr});`);
      return fn(...Object.values(sandbox));
    }catch(e){ return '—'; }
  }

  function renderMath(root){
    if (!window.katex) return;
    root.querySelectorAll('.math').forEach(el => {
      const src = el.textContent.trim() || el.getAttribute('data-math') || '';
      try{ katex.render(src, el, { throwOnError:false, displayMode:false }); }catch{}
    });
    // live editors
    root.querySelectorAll('textarea[data-math-editor]').forEach(t => {
      const outSel = t.getAttribute('data-preview') || '.math-preview';
      const out = t.closest('.math-live')?.querySelector(outSel);
      const err = t.closest('.math-live')?.querySelector('.math-error');
      const update = ()=>{
        try{
          katex.render(t.value, out, { throwOnError:true, displayMode:false });
          if (err) err.textContent = '';
        }catch(e){ if (err) err.textContent = e.message; }
      };
      t.addEventListener('input', update);
      update();
    });
  }

  function renderCalcs(root){
    root.querySelectorAll('output[data-calc]').forEach(out => {
      out.textContent = safeEval(out.getAttribute('data-calc'));
    });
  }

  function place(trigger){
    const pos = trigger.getAttribute('data-tip-pos') || 'bottom';
    const r = trigger.getBoundingClientRect();
    const t = { x: r.left + r.width/2, y: r.bottom };
    const gap = -5;

    panel.style.maxWidth = ''; panel.style.maxHeight = '';
    panel.style.left = '0px'; panel.style.top = '0px';

    const pw = panel.offsetWidth, ph = panel.offsetHeight;
    let x = t.x - pw/2, y = t.y + gap;

    if (pos === 'top'){ y = r.top - ph - gap; x = t.x - pw/2; }
    if (pos === 'start'){ x = r.left - pw - gap; y = r.top + (r.height - ph)/2; }
    if (pos === 'end'){ x = r.right + gap; y = r.top + (r.height - ph)/2; }

    // clamp to viewport
    x = Math.max(8, Math.min(x, innerWidth  - pw - 8));
    y = Math.max(8, Math.min(y, innerHeight - ph - 8));

    panel.style.left = `${x}px`;
    panel.style.top  = `${y}px`;

    // arrow placement (kept)
    const a = panel.style, s = 9;
    if (pos === 'top'){ a.setProperty('--ax', `${r.left + r.width/2 - x - s}px`); a.setProperty('--ay', `${ph - 3}px`); }
    else if (pos === 'start'){ a.setProperty('--ax', `${pw - 3}px`); a.setProperty('--ay', `${r.top + r.height/2 - y - s}px`); }
    else if (pos === 'end'){ a.setProperty('--ax', `3px`); a.setProperty('--ay', `${r.top + r.height/2 - y - s}px`); }
    else { a.setProperty('--ax', `${r.left + r.width/2 - x - s}px`); a.setProperty('--ay', `3px`); }

    a.setProperty('--arrow-display','block');
    a.setProperty('--arrow-size','.6rem');
    a.setProperty('--arrow-rotate','45deg');
    a.setProperty('--arrow-opacity','1');
    a.setProperty('--arrow-left', a.getPropertyValue('--ax'));
    a.setProperty('--arrow-top',  a.getPropertyValue('--ay'));
    a.setProperty('--arrow-bg',   'inherit');
    a.setProperty('--arrow-z',    'calc(var(--tip-z,1000)+1)');
    a.setProperty('--arrow-border','none');
  }

  function open(trigger){
    const frag = getTemplate(trigger);
    if (!frag) return;
    panel.replaceChildren(frag);
    renderCalcs(panel);
    renderMath(panel);
    currentTrigger = trigger;
    panel.dataset.show = "true";
    try { trigger.setAttribute('aria-expanded','true'); } catch {}
    place(trigger);
  }
  function close(){
    panel.dataset.show = "false";
    panel.replaceChildren();
    try { if (currentTrigger) currentTrigger.setAttribute('aria-expanded','false'); } catch {}
    currentTrigger = null;
  }

  // --- Delegated events with delay -----------------------------------
  function scheduleOpen(trigger){
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      // still hovering/focused?
      const stillHere = trigger.matches(':hover') || trigger === document.activeElement;
      if (!stillHere) return;
      if (panel.dataset.show === "true" && trigger === currentTrigger) return;
      open(trigger);
    }, HOVER_DELAY);
  }
  function cancelScheduledOpen(){
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }

  // Mouse hover
  document.addEventListener('mouseover', (e)=>{
    if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') return;
    const t = e.target.closest('[data-tooltip-template]');
    if (t){
      // If same trigger is already open, do nothing; otherwise schedule
      if (panel.dataset.show === "true" && t === currentTrigger) return;
      scheduleOpen(t);
      return;
    }
  }, { passive: true });

  // Hide as soon as the pointer leaves the trigger
  document.addEventListener('mouseout', (e)=>{
    const t = e.target.closest('[data-tooltip-template]');
    if (t && !t.contains(e.relatedTarget)){
      cancelScheduledOpen();
      // If leaving the current trigger and not entering the panel, close immediately
      if (currentTrigger === t && !panel.contains(e.relatedTarget)) close();
    }
  }, { passive: true });

  // Keyboard accessibility: open after delay on focus, close on blur
  document.addEventListener('focusin', (e)=>{
    if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') return;
    const t = e.target.closest?.('[data-tooltip-template]');
    if (t) scheduleOpen(t);
  });
  document.addEventListener('focusout', (e)=>{
    const t = e.target.closest?.('[data-tooltip-template]');
    if (t) { cancelScheduledOpen(); if (currentTrigger === t) close(); }
  });

  // Resize/scroll reposition
  window.addEventListener('resize', ()=>{ if (currentTrigger) place(currentTrigger); });
  window.addEventListener('scroll', ()=>{ if (currentTrigger) place(currentTrigger); }, true);

  // Escape to close
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });

  // Optional: click-away closes
  document.addEventListener('mousedown', (e)=>{
    if (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off') return;
    if (panel.dataset.show === "true"){
      const inTrigger = currentTrigger && (e.target === currentTrigger || currentTrigger.contains(e.target));
      const inPanel = panel.contains(e.target);
      if (!inTrigger && !inPanel){ cancelScheduledOpen(); close(); }
    }
  });
})();


/* =========================================================================
 * SVG Phase Inspector (click → scrollable merged tooltip panel)
 * - Non-intrusive: only binds to SVG vectors; HTML tooltips untouched
 * - Works with your existing inputs, globals, and live dragging
 * - Merges: relative (angles/ratios), power (P/Q/S/PF), imbalance (V2/V1, V0/V1)
 * ======================================================================= */
(function () {
  // Which SVG things open the panel (phase vectors only)
  var VECTOR_SELECTORS = [
    // Voltage
    'svg circle.vectora','svg polyline.vectora',
    'svg circle.vectorb','svg polyline.vectorb',
    'svg circle.vectorc','svg polyline.vectorc',
    // Current
    'svg circle.vectora_I','svg polyline.vectora_I',
    'svg circle.vectorb_I','svg polyline.vectorb_I',
    'svg circle.vectorc_I','svg polyline.vectorc_I',
    // Impedance (phase-to-ground)
    'svg polyline.vectora_Z','svg polyline.vectorb_Z','svg polyline.vectorc_Z'
  ].join(',');

  var panel, openInfo = null, refreshTimer = null, lastAnchor = {x:0,y:0};
  function tooltipsOff(){
    return !!(document.documentElement && document.documentElement.dataset && document.documentElement.dataset.tooltips === 'off');
  }
  function wantsForceOpen(e){
    return !!(e && (e.ctrlKey || e.metaKey));
  }
  function clamp(val, min, max){ return Math.min(Math.max(val, min), max); }
  function setPanelPosition(x, y){
    if (!panel) return null;
    var r = panel.getBoundingClientRect();
    var margin = 8;
    var maxX = window.innerWidth - r.width - margin;
    var maxY = window.innerHeight - r.height - margin;
    var left = clamp(x, margin, Math.max(margin, maxX));
    var top = clamp(y, margin, Math.max(margin, maxY));
    panel.style.left = left + 'px';
    panel.style.top  = top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    return { x: left, y: top };
  }

  // ---------- utilities ----------
  function deg2rad(d){ return d*Math.PI/180; }
  function rad2deg(r){ return r*180/Math.PI; }
  function normDeg(d){ return ((d+540)%360)-180; }
  function num(sel){ var el=document.querySelector(sel); return el ? (+el.value || 0) : 0; }
  function polar(m,a){ var th=deg2rad(a); return {re:m*Math.cos(th), im:m*Math.sin(th)}; }
  function conj(z){ return {re:z.re, im:-z.im}; }
  function mul(a,b){ return {re:a.re*b.re - a.im*b.im, im:a.re*b.im + a.im*b.re}; }
  function div(a,b){ var d=b.re*b.re+b.im*b.im || 1e-30; return {re:(a.re*b.re + a.im*b.im)/d, im:(a.im*b.re - a.re*b.im)/d}; }
  function mag(z){ return Math.hypot(z.re, z.im); }
  function ang(z){ return normDeg(rad2deg(Math.atan2(z.im, z.re))); }
  function fmt(x, p){ return (Number.isFinite(x)? x.toFixed(p ?? 2): '—'); }
  function pct(x){ return Number.isFinite(x)? (x*100).toFixed(2)+'%' : '—'; }

  function parseTarget(el){
    var cls = el.getAttribute('class') || '';
    var phase = /vectora/.test(cls) ? 'A' : /vectorb/.test(cls) ? 'B' : /vectorc/.test(cls) ? 'C' : null;
    var type  = /_I/.test(cls) ? 'I' : /_Z/.test(cls) ? 'Z' : 'V';
    return { phase: phase, type: type };
  }

  function ensurePanel(){
    if (panel) return panel;
    panel = document.createElement('div');
    panel.className = 'svg-phase-panel';
    panel.setAttribute('role','dialog');
    panel.innerHTML = '';
    panel.addEventListener('click', e => {
      // close button
      if (e.target.closest('[data-x="close"]')) { closePanel(); }
      e.stopPropagation();
    });
    document.body.appendChild(panel);
    initPanelDrag(panel);
    return panel;
  }

  function placePanel(x, y){
    lastAnchor.x = x; lastAnchor.y = y;
    if (panel && panel.__manualPos) {
      var manual = setPanelPosition(panel.__manualPos.x, panel.__manualPos.y);
      if (manual) panel.__manualPos = manual;
      return;
    }
    setPanelPosition(x + 12, y + 12);
  }

  function openPanel(info, anchor, opts){
    ensurePanel();
    openInfo = info;
    panel.dataset.show = 'true';
    if (opts && opts.force) panel.dataset.force = 'true';
    else if (panel.dataset.force) delete panel.dataset.force;
    placePanel(anchor.x, anchor.y);
    updatePanel(); // initial render
    // update only when phasors change
    const handler = () => { if (panel?.dataset.show === 'true') updatePanel(); };
    document.addEventListener('phasors:update', handler);
    panel.__updateHandler__ = handler;
  }

  function closePanel(){
    if (!panel) return;
    panel.dataset.show = 'false';
    panel.replaceChildren();
    openInfo = null;
    if (panel.dataset.force) delete panel.dataset.force;
    if (panel.__updateHandler__) {
      document.removeEventListener('phasors:update', panel.__updateHandler__);
      panel.__updateHandler__ = null;
    }
  }

  function initPanelDrag(panelEl){
    if (!panelEl || !window.PointerEvent || panelEl.__dragBound) return;
    panelEl.__dragBound = true;

    var pointerId = null;
    var startX = 0, startY = 0;
    var startLeft = 0, startTop = 0;
    var moved = false;
    var threshold = 4;

    function onMove(e){
      if (pointerId === null || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) >= threshold) moved = true;
      var pos = setPanelPosition(startLeft + dx, startTop + dy);
      if (pos) panelEl.__manualPos = pos;
    }

    function stopDrag(){
      if (pointerId === null) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      panelEl.classList.remove('is-dragging');
      pointerId = null;
    }

    function onPointerUp(e){
      if (pointerId !== e.pointerId) return;
      try { panelEl.releasePointerCapture(pointerId); } catch (err) {}
      stopDrag();
    }

    panelEl.addEventListener('pointerdown', function(e){
      if (e.button !== 0) return;
      var handle = e.target.closest('.svg-phase-panel__hd');
      if (!handle || !panelEl.contains(handle)) return;
      if (e.target.closest('[data-x="close"]')) return;
      pointerId = e.pointerId;
      var rect = panelEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      moved = false;
      panelEl.classList.add('is-dragging');
      try { panelEl.setPointerCapture(pointerId); } catch (err) {}
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      e.preventDefault();
    });
  }

  function phaseIndex(ph){ return ph==='A'?0:ph==='B'?1:2; }

  // Gather per-phase V/I from your form inputs
  function readVI(phase){
    var s = phase;
    var V = polar(num('#Amp_'+s),    num('#Angle_'+s));
    var I = polar(num('#Amp_'+s+'_I'),num('#Angle_'+s+'_I'));
    return { V:V, I:I, // also polar values
             Vmag:num('#Amp_'+s),    Vang:num('#Angle_'+s),
             Imag:num('#Amp_'+s+'_I'),Iang:num('#Angle_'+s+'_I') };
  }

  // Read sequence sets (Voltage/Current)
  function readSeq(){
    var V0=polar(num('#Amp_0'),  num('#Angle_0'));
    var V1=polar(num('#Amp_1'),  num('#Angle_1'));
    var V2=polar(num('#Amp_2'),  num('#Angle_2'));
    var I0=polar(num('#Amp_0_I'),num('#Angle_0_I'));
    var I1=polar(num('#Amp_1_I'),num('#Angle_1_I'));
    var I2=polar(num('#Amp_2_I'),num('#Angle_2_I'));
    return {V0,V1,V2,I0,I1,I2};
  }

  // Angle deltas to other phases for V or I
  function relativeAngles(kind, phase, phi){
    var ids = kind === 'V'
      ? {A:'#Angle_A', B:'#Angle_B', C:'#Angle_C'}
      : {A:'#Angle_A_I', B:'#Angle_B_I', C:'#Angle_C_I'};
    var a = num(ids.A), b = num(ids.B), c = num(ids.C);
    var map = {A:a, B:b, C:c};
    var out = {};
    ['A','B','C'].forEach(p=>{
      if (p === phase) return;
      out[p] = normDeg(phi - map[p]);
    });
    return out;
  }

  function buildRows(rows){
    return rows.map(r => (
      `<tr><td>${r[0]}</td><td class="eq">=</td><td class="aln">${r[1]}</td><td class="u">${r[2]||''}</td></tr>`
    )).join('');
  }

  function updatePanel(){
    if (!openInfo) return;
    var ph = openInfo.phase, typ = openInfo.type; // 'A'|'B'|'C', 'V'|'I'|'Z'
    var phIdx = phaseIndex(ph);

    // Base phasors
    var VI = readVI(ph);
    var seq = readSeq();

    // Impedance of the clicked phase
    var Zp;
    if (typ === 'Z' && window.za) {                 // use computed globals if present
      var Zraw = ph === 'A' ? window.za : ph === 'B' ? window.zb : window.zc;
      Zp = { re:+(Zraw?.[0]||0), im:+(Zraw?.[1]||0) };
    } else {
      Zp = div(VI.V, (mag(VI.I) ? VI.I : {re:1e-30,im:0}));
    }

    // Power S = V * I*
    var S = mul(VI.V, conj(VI.I));
    var P = S.re, Q = S.im, Sabs = Math.hypot(P,Q);
    var pf = (Sabs>1e-12) ? Math.min(1, Math.max(-1, P/Sabs)) : 0;
    var pfType = (Q>0?'lagging':'leading');

    // Relative angles
    var dθV = relativeAngles('V', ph, VI.Vang);
    var dθI = relativeAngles('I', ph, VI.Iang);

    // Imbalance metrics
    var Vimb2 = (mag(seq.V1)>1e-9) ? mag(seq.V2)/mag(seq.V1) : NaN;
    var Vimb0 = (mag(seq.V1)>1e-9) ? mag(seq.V0)/mag(seq.V1) : NaN;
    var Iimb2 = (mag(seq.I1)>1e-9) ? mag(seq.I2)/mag(seq.I1) : NaN;
    var Iimb0 = (mag(seq.I1)>1e-9) ? mag(seq.I0)/mag(seq.I1) : NaN;

    // Friendly labels
    var headLabel = (typ==='V'?'Voltage':'I'===typ?'Current':'Impedance') + ' — Phase ' + ph;

    // Panel HTML
    var html = `
      <header class="svg-phase-panel__hd">
        <div>${headLabel}</div>
        <button class="btn-close" data-x="close" aria-label="Close">×</button>
      </header>

      <section class="sec">
        <h4>Primary</h4>
        <table>
          ${buildRows([
            ['|V'+ph+'|',  fmt(VI.Vmag,3), 'V'],
            ['V'+ph+' 📐',      fmt(VI.Vang,1),  '°'],
            ['|I'+ph+'|',  fmt(VI.Imag,3), 'A'],
            ['I'+ph+' 📐',      fmt(VI.Iang,1),  '°'],
            ['|Z'+ph+'|',  fmt(mag(Zp),3),  'Ω'],
            ['Z'+ph+' 📐',      fmt(ang(Zp),1),  '°']
          ])}
        </table>
      </section>

      <section class="sec">
        <h4>Power (per-phase)</h4>
        <table>
          ${buildRows([
            ['P',    fmt(P,3),     'W'],
            ['Q',    fmt(Q,3),     'var'],
            ['|S|',  fmt(Sabs,3),  'VA'],
            ['PF',   fmt(pf,3)+' '+pfType.toLowerCase()]
          ])}
        </table>
      </section>

      <section class="sec">
        <h4>Relative (angles to others)</h4>
        <table>
          ${buildRows([
            ['Δθ&nbsp;V'+ph+'-'+(ph==='A'?'B':'A'), fmt(dθV[(ph==='A'?'B':'A')],1), '°'],
            ['Δθ&nbsp;V'+ph+'-'+(ph==='C'?'B':'C'), fmt(dθV[(ph==='C'?'B':'C')],1), '°'],
            ['Δθ&nbsp;I'+ph+'-'+(ph==='A'?'B':'A'), fmt(dθI[(ph==='A'?'B':'A')],1), '°'],
            ['Δθ&nbsp;I'+ph+'-'+(ph==='C'?'B':'C'), fmt(dθI[(ph==='C'?'B':'C')],1), '°']
          ])}
        </table>
      </section>

      <section class="sec">
        <h4>Imbalance</h4>
        <table>
          ${buildRows([
            ['|V₂|/|V₁|', pct(Vimb2)],
            ['|V₀|/|V₁|', pct(Vimb0)],
            ['|I₂|/|I₁|', pct(Iimb2)],
            ['|I₀|/|I₁|', pct(Iimb0)]
          ])}
        </table>
        <p class="muted">V/I sequence magnitudes taken from the live inputs.</p>
      </section>
    `;

    panel.innerHTML = html;
    // Keep panel near last anchor (useful while numbers update during drag)
    placePanel(lastAnchor.x, lastAnchor.y);
  }

  // ---------- open on click ----------
  document.addEventListener('pointerdown', function (e) {
    if (!wantsForceOpen(e)) return;
    var t = e.target.closest(VECTOR_SELECTORS);
    if (!t) return;
    var info = parseTarget(t);
    if (!info.phase) return;
    e.preventDefault();
    e.stopPropagation();
    openPanel(info, { x: e.clientX, y: e.clientY }, { force: true });
  }, true);

  document.addEventListener('click', function (e) {
    if (wantsForceOpen(e)) return;
    if (tooltipsOff()) return;
    var t = e.target.closest(VECTOR_SELECTORS);
    if (!t) {
      // click-away closes (unless inside the panel)
      if (panel && panel.dataset.show === 'true' && !panel.contains(e.target)) closePanel();
      return;
    }
    var info = parseTarget(t);
    if (!info.phase) return;
    e.stopPropagation();
    openPanel(info, { x: e.clientX, y: e.clientY });
  }, { passive:true });

  // Reposition on resize/scroll
  window.addEventListener('resize', function(){ if (panel && panel.dataset.show==='true') placePanel(lastAnchor.x, lastAnchor.y); });
  window.addEventListener('scroll', function(){ if (panel && panel.dataset.show==='true') placePanel(lastAnchor.x, lastAnchor.y); }, true);

  // Escape closes
  document.addEventListener('keydown', function(e){ if (e.key==='Escape') closePanel(); });

})();

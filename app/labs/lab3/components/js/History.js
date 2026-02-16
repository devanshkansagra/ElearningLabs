// History.js
export const History = (() => {
  const MAX = 1200;
  let stack = [];
  let ptr = -1;
  let restoring = false;
  let updater = () => {};
  let txn = null; // { label, meta, before }
  let axisBridge = { get: null, set: null };
  const bindAxes = (handlers) => { axisBridge = handlers || axisBridge; };
  // --- snapshot helpers ----------------------------------------------------
  const takeInputs = () => {
    const ctrls = Array.from(document.querySelectorAll('input,select,textarea'));
    const IGNORE_IDS = new Set(['themeToggle','densityToggle','tooltipToggle']); // not part of undo history
    const out = {};

    // non-radio by id
    for (const el of ctrls) {
      if (el.type === 'radio') continue;
      if (!el.id) continue;
      if (IGNORE_IDS.has(el.id)) continue;
      out[el.id] = (el.type === 'checkbox') ? !!el.checked : String(el.value);
    }

    // radios grouped by name (so inputs without ids are captured)
    const radioNames = new Set(
      ctrls.filter(el => el.type === 'radio' && el.name).map(el => el.name)
    );
    radioNames.forEach(name => {
      const checked = document.querySelector(
        `input[type="radio"][name="${CSS.escape(name)}"]:checked`
      );
      if (checked) out[`$radio:${name}`] = checked.value;
    });

    return out;
  };

  // Keep globals as-is: we snapshot both the head points and their data arrays
  const takeVectors = () => ({
    psa, psb, psc, psa_I, psb_I, psc_I, ps_KN,
    va, vb, vc, ia, ib, ic
  });

  const snapshot = () => ({
      inputs:  takeInputs(),
      vectors: takeVectors(),
      axes:    axisBridge.get ? axisBridge.get() : null
    });

  const applyVectors = v => {
    if (!v) return;
    // clone arrays so D3/data references update safely
    if (v.psa)   psa   = v.psa.map(p => p.slice());
    if (v.psb)   psb   = v.psb.map(p => p.slice());
    if (v.psc)   psc   = v.psc.map(p => p.slice());
    if (v.psa_I) psa_I = v.psa_I.map(p => p.slice());
    if (v.psb_I) psb_I = v.psb_I.map(p => p.slice());
    if (v.psc_I) psc_I = v.psc_I.map(p => p.slice());
    if (v.ps_KN) ps_KN = v.ps_KN.map(p => p.slice());

    // heads for compute/render
    if (psa?.[0])   va = psa[0].slice();
    if (psb?.[0])   vb = psb[0].slice();
    if (psc?.[0])   vc = psc[0].slice();
    if (psa_I?.[0]) ia = psa_I[0].slice();
    if (psb_I?.[0]) ib = psb_I[0].slice();
    if (psc_I?.[0]) ic = psc_I[0].slice();
  };

  const restore = json => {
    restoring = true;
    try {
      const state = typeof json === 'string' ? JSON.parse(json) : json;

        // 1) inputs (dispatch change events)
       for (const [key, val] of Object.entries(state.inputs)) {
         if (key.startsWith('$radio:')) {
           const name = key.slice(7);
           const el = document.querySelector(
             `input[type="radio"][name="${CSS.escape(name)}"][value="${CSS.escape(val)}"]`
           );
           if (el) {
             el.checked = true;
             if (el && !el.checked) { 
             el.dispatchEvent(new Event('input',  { bubbles: true }));
             el.dispatchEvent(new Event('change', { bubbles: true }));
             }
           }
           continue;
         }
         const el = document.getElementById(key);
         if (!el) continue;
         if (['themeToggle','densityToggle','tooltipToggle'].includes(key)) continue;
         if (el.type === 'checkbox') {
           const next = !!val;
           if (el.checked !== next) {
             el.checked = next;
             el.dispatchEvent(new Event('input',  { bubbles: true }));
             el.dispatchEvent(new Event('change', { bubbles: true }));
           }
         } else {
           const next = String(val);
           if (el.value !== next) {
             el.value = next;
             el.dispatchEvent(new Event('input',  { bubbles: true }));
             el.dispatchEvent(new Event('change', { bubbles: true }));
           }
         }
       }

      // 2) vectors
      applyVectors(state.vectors);

      // 3) axes — apply AFTER inputs/events so autoscale can't override them
      if (state.axes && axisBridge.set) axisBridge.set(state.axes, true);

      // 4) final redraw with the restored axes
      updater();
    } finally {
      restoring = false;
    }
  };

  const push = (snap = snapshot()) => {
    if (restoring) return;

    const json = JSON.stringify(snap);
    const prev = stack[ptr];
    if (prev === json) return; // no-op

    stack = stack.slice(0, ptr + 1);
    stack.push(json);
    if (stack.length > MAX) stack.shift();
    ptr = stack.length - 1;
    reflectButtons();
  };

  const begin  = (label = 'op', meta = {}) => {
    if (txn) return;
    const before = snapshot();
    txn = { label, meta, beforeJSON: JSON.stringify(before) };
  };
  const commit = () => {
    if (!txn) return;
    if (restoring) { txn = null; return; }
    const after = snapshot();
    const afterJSON  = JSON.stringify(after);
    const changed = txn.beforeJSON !== afterJSON;
    if (changed)
    if (changed) push(after);
    txn = null;
  };

  const cancel = () => { txn = null; };

  // If a user triggers Undo/Redo while typing, force-finish that edit first
  const flushOpenTxn = () => {
    if (txn?.label === 'input') {
      commit();       // will push if there is a real delta
    }
  };  

  const undo = () => {
    flushOpenTxn();
    if (ptr > 0) {
      restore(stack[--ptr]); reflectButtons();
    }
  };
  const redo = () => {
    flushOpenTxn();
    if (ptr < stack.length - 1) {
      restore(stack[++ptr]); reflectButtons();
    }
  };

  const canUndo = () => ptr > 0;
  const canRedo = () => ptr < stack.length - 1;

  const reflectButtons = () => {
    const ub = document.getElementById('undoBtn');
    const rb = document.getElementById('redoBtn');
    if (ub) ub.toggleAttribute('disabled', !canUndo());
    if (rb) rb.toggleAttribute('disabled', !canRedo());
  };

  const init = fn => { updater = fn; push(); reflectButtons(); };

  // Grouped programmatic changes
  const group = (label, fn) => { begin(label); try { fn(); } finally { commit(); } };

  // Transaction semantics for form controls and spinner arrows
  const attachInputTransactions = (root = document) => {
    const isField = el =>
      el && el.matches && el.matches('input,select,textarea,[contenteditable="true"]');

    const start = e => {
      if (restoring) return;
      const t = e.target;
      if (!isField(t)) return;
      if (txn?.label === 'input' && (txn.meta?.id === (t.id || t.name))) return;
      begin('input', { id: t.id || t.name || '(anon)' });
    };

    const maybeCommit = () => { if (restoring) return; if (txn?.label === 'input') commit(); };

    // Start a txn as soon as the user is about to edit
    root.addEventListener('pointerdown', start,  true);     // clicks + number spinners
    root.addEventListener('focusin',    start,  true);     // tab into a field
    root.addEventListener('beforeinput',start,  true);     // first actual edit
    root.addEventListener('wheel',  e => { if (isField(e.target)) start(e); },
                          { capture: true, passive: true });

    // Typing: group keystrokes into one txn; commit on Enter/Esc
    root.addEventListener('keydown', e => {
      if (restoring) return;
      if (!isField(e.target)) return;
      if (!e.ctrlKey && !e.metaKey && !e.altKey) start(e);
      if (e.key === 'Enter' || e.key === 'Escape') maybeCommit();
    }, true);

    // Debounced commit after the user pauses typing
    let typingTimer = null;
    root.addEventListener('input', e => {
      if (restoring) return;
      if (!isField(e.target)) return;
      if (!txn) start(e);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(maybeCommit, 400);
    }, true);

    // Finalize on normal UI boundaries
    root.addEventListener('change',    maybeCommit, true);  // selects/number edits on blur
    root.addEventListener('focusout',  maybeCommit, true);  // blur that bubbles
    root.addEventListener('pointerup', maybeCommit, true);  // number spinner mouseup
  };

  const isRestoring = () => restoring;
  return { init, push, undo, redo, begin, commit, cancel, group, attachInputTransactions, bindAxes, isRestoring };
})();

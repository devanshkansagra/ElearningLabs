// --- meteringBaseUI.js (drop-in) ---
import {
  meteringBase,
  onMeteringBaseChange,
  setCTPrimary,
  setCTSecondary,
  setCTNominal,
  setVTPrimaryKVLL,
  setVTSecondary,
  setVTNominal,
  setVTSecondaryMode,
  setDisplayMode,
  setVoltageInputMode,
  getValidationState,
  getZBase
} from './meteringBase.js';

const ratioFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });
const scaleFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

const refs = {
  ctPrimary:   document.getElementById('ct-primary'),
  ctSecondary: document.getElementById('ct-secondary'),
  ctRatio:     document.getElementById('ct-ratio'),
  ctNominal:   document.querySelectorAll('input[name="ct-nominal"]'),
  vtPrimary:   document.getElementById('vt-primary'),
  vtSecondary: document.getElementById('vt-secondary'),
  vtNominal:   document.getElementById('vt-nominal'),
  vtMode:      document.getElementById('vt-mode'),
  vtRatio:     document.getElementById('vt-ratio'),
  zDisplay:    document.querySelectorAll('input[name="z-display"]'),
  summary:     document.getElementById('metering-summary'),
  feedback:    document.getElementById('metering-feedback'),
};

const fieldLookup = new Map([
  ['ctPrimary', refs.ctPrimary],
  ['ctSecondary', refs.ctSecondary],
  ['ctRatio', refs.ctRatio],
  ['vtPrimary', refs.vtPrimary],
  ['vtSecondary', refs.vtSecondary],
  ['vtRatio', refs.vtRatio],
]);

const show = (n, fmt) => (Number.isFinite(n) ? fmt.format(n) : '--');

function setInput(el, value) {
  if (!el) return;
  if (Number.isFinite(value)) el.value = String(value);
  else el.value = '';
}

function setRadios(list, desired) {
  list?.forEach(radio => {
    radio.checked = Number(radio.value) === desired;
  });
}

function setZDisplayRadios(mode) {
  refs.zDisplay?.forEach(radio => {
    radio.checked = radio.value === mode;
  });
}

function renderFeedback(issues, warnings) {
  if (!refs.feedback) return;
  refs.feedback.textContent = '';
  if (!issues.length && !warnings.length) {
    const ok = document.createElement('span');
    ok.textContent = 'All ratios valid.';
    refs.feedback.appendChild(ok);
    return;
  }
  const add = (items, cls) => items.forEach(it => {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = it.message;
    refs.feedback.appendChild(span);
  });
  add(issues, 'issue');
  add(warnings, 'warning');
}

let syncing = false;

function syncFromModel() {
  syncing = true;

  setInput(refs.ctPrimary,   meteringBase.ct.primary);
  setInput(refs.ctSecondary, meteringBase.ct.secondary);
  setRadios(refs.ctNominal,  meteringBase.ct.nominalSecondary);

  setInput(refs.vtPrimary,   meteringBase.vt.primaryKVLL);
  setInput(refs.vtSecondary, meteringBase.vt.secondary);
  setInput(refs.vtNominal,   meteringBase.vt.nominalSecondary);
  if (refs.vtMode) refs.vtMode.value = meteringBase.vt.secondaryMode;

  setZDisplayRadios(meteringBase.displayMode);

  const { ratios, issues, warnings } = getValidationState();
  if (refs.ctRatio) refs.ctRatio.textContent = show(ratios.ct, ratioFmt);
  if (refs.vtRatio) refs.vtRatio.textContent = show(ratios.vt, ratioFmt);
  if (refs.summary) {
    const ctText = `CT ratio ${show(ratios.ct, ratioFmt)}`;
    const vtText = `VT ratio ${show(ratios.vt, ratioFmt)}`;
    const mode = meteringBase.displayMode;
    const modeLabel = mode === 'primary' ? 'primary' : mode === 'per-unit' ? 'per-unit' : 'secondary';
    let zLabel = 'Z scale';
    let zValue = show(ratios.impedance, scaleFmt);
    let zUnit = '';
    if (mode === 'per-unit') {
      const zBase = getZBase();
      zLabel = 'Z base';
      zValue = Number.isFinite(zBase) ? scaleFmt.format(zBase) : '--';
      zUnit = Number.isFinite(zBase) ? ' ohm' : '';
    }
    const zText = `${zLabel} ${zValue}${zUnit} (${modeLabel})`;
    refs.summary.textContent = `${ctText} | ${vtText} | ${zText}`;
  }

  document.querySelectorAll('.field').forEach(f => f.classList.remove('is-invalid', 'is-warning'));
  issues.forEach(it => fieldLookup.get(it.field)?.closest('.field')?.classList.add('is-invalid'));
  warnings.forEach(it => fieldLookup.get(it.field)?.closest('.field')?.classList.add('is-warning'));

  renderFeedback(issues, warnings);
  syncing = false;
}

export function initMeteringBaseUI() {
  onMeteringBaseChange(syncFromModel);
  syncFromModel();

  refs.ctPrimary?.addEventListener('input', e => {
    if (!syncing) setCTPrimary(e.target.value);
  });
  refs.ctSecondary?.addEventListener('input', e => {
    if (!syncing) setCTSecondary(e.target.value);
  });

  refs.vtPrimary?.addEventListener('input', e => {
    if (!syncing) setVTPrimaryKVLL(e.target.value);
  });
  refs.vtSecondary?.addEventListener('input', e => {
    if (!syncing) setVTSecondary(e.target.value);
  });
  refs.vtNominal?.addEventListener('input', e => {
    if (!syncing) setVTNominal(e.target.value);
  });

  refs.vtMode?.addEventListener('change', e => {
    if (syncing) return;
    const mode = e.target.value === 'LL' ? 'LL' : 'LN';
    setVTSecondaryMode(mode);
    setVoltageInputMode(mode);
  });

  refs.ctNominal?.forEach(radio => {
    radio.addEventListener('change', () => {
      if (!radio.checked || syncing) return;
      const next = Number(radio.value);
      const prev = meteringBase.ct.nominalSecondary;
      const sec  = meteringBase.ct.secondary;
      setCTNominal(next);
      if (!Number.isFinite(sec) || Math.abs(sec - prev) < 1e-6) setCTSecondary(next);
    });
  });

  refs.zDisplay?.forEach(radio => {
    radio.addEventListener('change', () => {
      if (!radio.checked || syncing) return;
      setDisplayMode(radio.value);
    });
  });

  const initialVoltageMode = refs.vtMode && (refs.vtMode.value === 'LL' ? 'LL' : 'LN');
  setVoltageInputMode(initialVoltageMode);

  // --- tiny, self-contained renderer so #vt-ratio / #ct-ratio aren’t empty ---
  const renderRatiosNow = () => {
    const vp = parseFloat(document.getElementById('vt-primary')?.value);
    const vs = parseFloat(document.getElementById('vt-secondary')?.value);
    const cp = parseFloat(document.getElementById('ct-primary')?.value);
    const cs = parseFloat(document.getElementById('ct-secondary')?.value);

    const vtOut = document.getElementById('vt-ratio');
    const ctOut = document.getElementById('ct-ratio');

    if (vtOut) {
      vtOut.textContent = (Number.isFinite(vp) && Number.isFinite(vs) && vs > 0)
        ? (vp / vs).toFixed(2) + ':1'
        : '—';
    }
    if (ctOut) {
      ctOut.textContent = (Number.isFinite(cp) && Number.isFinite(cs) && cs > 0)
        ? (cp / cs).toFixed(2) + ':1'
        : '—';
    }
  };

  // Sensible boot defaults if blank (kept minimal)
  const ensureDefault = (id, val) => {
    const el = document.getElementById(id);
    if (el && (el.value === '' || !Number.isFinite(parseFloat(el.value)))) el.value = val;
  };
  ensureDefault('vt-primary',   '69000');
  ensureDefault('vt-secondary', '115');
  ensureDefault('ct-primary',   '800');
  ensureDefault('ct-secondary', '5');

  // Re-render on edits and once at startup
  ['vt-primary','vt-secondary','ct-primary','ct-secondary','vt-mode']
    .forEach(id => document.getElementById(id)?.addEventListener('input', renderRatiosNow, { passive: true }));
  renderRatiosNow();
  
}
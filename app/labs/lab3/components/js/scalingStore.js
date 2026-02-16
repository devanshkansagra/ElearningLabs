import {
  fetchDerivedData,
  convertScalarRemote,
  convertComplexRemote,
} from './workerClient.js';

const BASE_MODES = new Set(['secondary', 'primary', 'per-unit']);
const VOLTAGE_MODES = new Set(['LN', 'LL']);

function makeState(src = {}) {
  const source = src || {};
  return {
    CT: {
      primary: toNumber(source.CT?.primary),
      secondary: toNumber(source.CT?.secondary),
      nominal: toNumber(source.CT?.nominal),
    },
    PT: {
      primary: toNumber(source.PT?.primary),
      secondary: toNumber(source.PT?.secondary),
      mode: VOLTAGE_MODES.has(source.PT?.mode) ? source.PT.mode : 'LN',
    },
    Vnom: toNumber(source.Vnom),
    voltageInputMode: VOLTAGE_MODES.has(source.voltageInputMode) ? source.voltageInputMode : 'LN',
    base: BASE_MODES.has(source.base) ? source.base : 'secondary',
  };
}

const DEFAULTS = Object.freeze(makeState({
  CT: { primary: 400, secondary: 5, nominal: 5 },
  PT: { primary: 2000, secondary: 115, mode: 'LN' },
  Vnom: 115,
  voltageInputMode: 'LN',
  base: 'secondary',
}));

const state = makeState(DEFAULTS);
const listeners = new Set();

const derivedCache = createDerivedSnapshot();
let derivedRefreshRunning = false;
let derivedRefreshQueued = false;

function createDerivedSnapshot() {
  return {
    pending: true,
    error: null,
    ratios: { ct: NaN, vt: NaN, pt: NaN, impedance: NaN },
    ctRatio: NaN,
    ptRatio: NaN,
    impedanceRatio: NaN,
    secondaryCurrentBase: NaN,
    secondaryVoltageBase: NaN,
    zBase: NaN,
    validation: {
      issues: [],
      warnings: [],
      ratios: { ct: NaN, vt: NaN, pt: NaN, impedance: NaN },
    },
  };
}

function cloneState() {
  return makeState(state);
}

function emit(reason) {
  const detail = { state: cloneState(), reason };
  if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
    document.dispatchEvent(new CustomEvent('scaling:change', { detail }));
  }
  listeners.forEach(fn => {
    try { fn(detail.state, reason); }
    catch (err) { console.error('[scalingStore] listener error', err); }
  });
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function numbersEqual(a, b) {
  return Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b));
}

function scheduleDerivedRefresh(reason = 'state') {
  derivedRefreshQueued = true;
  derivedCache.pending = true;
  if (derivedRefreshRunning) return;
  derivedRefreshRunning = true;
  (async function run() {
    do {
      derivedRefreshQueued = false;
      try {
        const payloadState = cloneState();
        const data = await fetchDerivedData(payloadState);
        applyDerivedData(data);
        derivedCache.error = null;
        emit(reason === 'init' ? 'derived:init' : 'derived');
      } catch (err) {
        derivedCache.error = err;
        console.error('[scalingStore] worker fetch failed', err);
      } finally {
        derivedCache.pending = false;
      }
    } while (derivedRefreshQueued);
    derivedRefreshRunning = false;
  })();
}

function applyDerivedData(data) {
  if (!data || typeof data !== 'object') return;
  const ratios = data.ratios || {};
  derivedCache.ratios = {
    ct: Number.isFinite(ratios.ct) ? ratios.ct : NaN,
    vt: Number.isFinite(ratios.vt) ? ratios.vt : Number.isFinite(ratios.pt) ? ratios.pt : NaN,
    pt: Number.isFinite(ratios.pt) ? ratios.pt : Number.isFinite(ratios.vt) ? ratios.vt : NaN,
    impedance: Number.isFinite(ratios.impedance) ? ratios.impedance : NaN,
  };
  derivedCache.ctRatio = Number.isFinite(data.ctRatio) ? data.ctRatio : derivedCache.ratios.ct;
  derivedCache.ptRatio = Number.isFinite(data.ptRatio) ? data.ptRatio : derivedCache.ratios.vt;
  derivedCache.impedanceRatio = Number.isFinite(data.impedanceRatio) ? data.impedanceRatio : derivedCache.ratios.impedance;
  derivedCache.secondaryCurrentBase = Number.isFinite(data.secondaryCurrentBase) ? data.secondaryCurrentBase : NaN;
  derivedCache.secondaryVoltageBase = Number.isFinite(data.secondaryVoltageBase) ? data.secondaryVoltageBase : NaN;
  derivedCache.zBase = Number.isFinite(data.zBase) ? data.zBase : NaN;
  const validation = data.validation || {};
  derivedCache.validation = {
    issues: Array.isArray(validation.issues) ? validation.issues : [],
    warnings: Array.isArray(validation.warnings) ? validation.warnings : [],
    ratios: validation.ratios || derivedCache.ratios,
  };
}

function setCTPrimary(raw) {
  const next = toNumber(raw);
  if (numbersEqual(state.CT.primary, next)) return;
  state.CT.primary = next;
  emit('ct');
  scheduleDerivedRefresh('ct');
}

function setCTSecondary(raw) {
  const next = toNumber(raw);
  if (numbersEqual(state.CT.secondary, next)) return;
  state.CT.secondary = next;
  emit('ct');
  scheduleDerivedRefresh('ct');
}

function setCTNominal(raw) {
  const next = toNumber(raw);
  if (numbersEqual(state.CT.nominal, next)) return;
  state.CT.nominal = next;
  emit('ct');
  scheduleDerivedRefresh('ct');
}

function setPTPrimary(raw) {
  const next = toNumber(raw);
  if (numbersEqual(state.PT.primary, next)) return;
  state.PT.primary = next;
  emit('pt');
  scheduleDerivedRefresh('pt');
}

function setPTSecondary(raw) {
  const next = toNumber(raw);
  if (numbersEqual(state.PT.secondary, next)) return;
  state.PT.secondary = next;
  emit('pt');
  scheduleDerivedRefresh('pt');
}

function setVTMode(mode) {
  const normalised = VOLTAGE_MODES.has(mode) ? mode : 'LN';
  if (state.PT.mode === normalised) return;
  state.PT.mode = normalised;
  emit('vt-mode');
  scheduleDerivedRefresh('vt-mode');
}

function setVoltageInputMode(mode) {
  const normalised = VOLTAGE_MODES.has(mode) ? mode : 'LN';
  if (state.voltageInputMode === normalised) return;
  state.voltageInputMode = normalised;
  emit('voltage-mode');
  scheduleDerivedRefresh('voltage-mode');
}

function setVnom(raw) {
  const next = toNumber(raw);
  if (numbersEqual(state.Vnom, next)) return;
  state.Vnom = next;
  emit('vnom');
  scheduleDerivedRefresh('vnom');
}

function setBase(base) {
  const normalised = base === 'primary' ? 'primary' : base === 'per-unit' || base === 'pu' ? 'per-unit' : 'secondary';
  if (state.base === normalised) return;
  state.base = normalised;
  emit('base');
  scheduleDerivedRefresh('base');
}

function resetScaling() {
  const fresh = makeState(DEFAULTS);
  Object.assign(state.CT, fresh.CT);
  Object.assign(state.PT, fresh.PT);
  state.Vnom = fresh.Vnom;
  state.voltageInputMode = fresh.voltageInputMode;
  state.base = fresh.base;
  emit('reset');
  scheduleDerivedRefresh('reset');
}

async function convertScalar(value, kind, options = {}) {
  try {
    return await convertScalarRemote(state, value, kind, options);
  } catch (err) {
    console.error('[scalingStore] convertScalar failed', err);
    return NaN;
  }
}

async function convertComplex(tuple, kind, options = {}) {
  try {
    return await convertComplexRemote(state, tuple, kind, options);
  } catch (err) {
    console.error('[scalingStore] convertComplex failed', err);
    return [NaN, NaN];
  }
}

function getRatios() {
  return derivedCache.ratios;
}

function getCtRatio() {
  return derivedCache.ctRatio;
}

function getPtRatio() {
  return derivedCache.ptRatio;
}

function getImpedanceRatio() {
  return derivedCache.impedanceRatio;
}

function getSecondaryCurrentBase() {
  return derivedCache.secondaryCurrentBase;
}

function getSecondaryVoltageBase() {
  return derivedCache.secondaryVoltageBase;
}

function getZBase() {
  return derivedCache.zBase;
}

function getValidationState() {
  return {
    ...derivedCache.validation,
    pending: derivedCache.pending,
    error: derivedCache.error ? (derivedCache.error.message || String(derivedCache.error)) : null,
  };
}

function onScalingChange(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getScalingState() {
  return cloneState();
}

scheduleDerivedRefresh('init');

export {
  DEFAULTS,
  getScalingState,
  getRatios,
  getCtRatio,
  getPtRatio,
  getImpedanceRatio,
  getSecondaryCurrentBase,
  getSecondaryVoltageBase,
  getZBase,
  setCTPrimary,
  setCTSecondary,
  setCTNominal,
  setPTPrimary,
  setPTSecondary,
  setVTMode,
  setVoltageInputMode,
  setVnom,
  setBase,
  resetScaling,
  convertScalar,
  convertComplex,
  getValidationState,
  onScalingChange,
};

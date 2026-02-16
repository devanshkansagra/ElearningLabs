import {
  DEFAULTS as SCALING_DEFAULTS,
  getScalingState,
  getRatios as storeGetRatios,
  getCtRatio as storeGetCtRatio,
  getPtRatio as storeGetPtRatio,
  getImpedanceRatio as storeGetImpedanceRatio,
  getSecondaryCurrentBase as storeGetSecondaryCurrentBase,
  getSecondaryVoltageBase as storeGetSecondaryVoltageBase,
  getZBase as storeGetZBase,
  getValidationState as storeGetValidationState,
  setCTPrimary as storeSetCTPrimary,
  setCTSecondary as storeSetCTSecondary,
  setCTNominal as storeSetCTNominal,
  setPTPrimary as storeSetPTPrimary,
  setPTSecondary as storeSetPTSecondary,
  setVTMode as storeSetVTMode,
  setVoltageInputMode as storeSetVoltageInputMode,
  setVnom as storeSetVnom,
  setBase as storeSetBase,
  resetScaling,
  convertScalar as storeConvertScalar,
  convertComplex as storeConvertComplex,
  onScalingChange as storeOnScalingChange,
} from './scalingStore.js';

const meteringBase = {
  displayMode: SCALING_DEFAULTS.base,
  voltageInputMode: SCALING_DEFAULTS.voltageInputMode,
  ct: {
    primary: SCALING_DEFAULTS.CT.primary,
    secondary: SCALING_DEFAULTS.CT.secondary,
    nominalSecondary: SCALING_DEFAULTS.CT.nominal,
  },
  vt: {
    primaryKVLL: SCALING_DEFAULTS.PT.primary,
    secondary: SCALING_DEFAULTS.PT.secondary,
    secondaryMode: SCALING_DEFAULTS.PT.mode,
    nominalSecondary: SCALING_DEFAULTS.Vnom,
  },
};

const subscribers = new Set();

function applySnapshot(snapshot) {
  const snap = snapshot || getScalingState();
  meteringBase.displayMode = snap.base;
  meteringBase.voltageInputMode = snap.voltageInputMode;
  meteringBase.ct.primary = snap.CT.primary;
  meteringBase.ct.secondary = snap.CT.secondary;
  meteringBase.ct.nominalSecondary = snap.CT.nominal;
  meteringBase.vt.primaryKVLL = snap.PT.primary;
  meteringBase.vt.secondary = snap.PT.secondary;
  meteringBase.vt.secondaryMode = snap.PT.mode;
  meteringBase.vt.nominalSecondary = snap.Vnom;
}

function syncWindowUnits(base) {
  if (typeof window === 'undefined' || !window.units) return;
  if (base === 'primary') {
    window.units.mode = 'PRI';
  } else if (base === 'per-unit') {
    window.units.mode = 'PU';
  } else {
    window.units.mode = 'SEC';
  }
}

function emit(reason) {
  subscribers.forEach(listener => {
    try { listener(meteringBase, reason); }
    catch (err) { console.error('[meteringBase] listener error', err); }
  });
}

applySnapshot(getScalingState());
syncWindowUnits(meteringBase.displayMode);

storeOnScalingChange((state, reason) => {
  applySnapshot(state);
  syncWindowUnits(meteringBase.displayMode);
  emit(reason || 'scaling');
});

function onMeteringBaseChange(listener) {
  if (typeof listener !== 'function') return () => {};
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function setDisplayMode(mode) {
  const target = mode === 'primary' ? 'primary' : mode === 'per-unit' || mode === 'pu' ? 'per-unit' : 'secondary';
  storeSetBase(target);
}

function setVoltageInputMode(mode) {
  storeSetVoltageInputMode(mode === 'LL' ? 'LL' : 'LN');
}

function setCTPrimary(value) { storeSetCTPrimary(value); }
function setCTSecondary(value) { storeSetCTSecondary(value); }
function setCTNominal(value) { storeSetCTNominal(value); }

function setVTPrimaryKVLL(value) { storeSetPTPrimary(value); }
function setVTSecondary(value) { storeSetPTSecondary(value); }
function setVTSecondaryMode(mode) { storeSetVTMode(mode); }
function setVTNominal(value) { storeSetVnom(value); }

function convertScalar(value, kind, options) {
  return storeConvertScalar(value, kind, options);
}

function convertComplex(tuple, kind, options) {
  return storeConvertComplex(tuple, kind, options);
}

function getRatios() {
  return storeGetRatios();
}

function getCtRatio() {
  return storeGetCtRatio();
}

function getVtRatio() {
  return storeGetPtRatio();
}

function getImpedanceRatio() {
  return storeGetImpedanceRatio();
}

function getSecondaryCurrentBase() {
  return storeGetSecondaryCurrentBase();
}

function getSecondaryVoltageBase() {
  return storeGetSecondaryVoltageBase();
}

function getZBase() {
  return storeGetZBase();
}

function getValidationState() {
  return storeGetValidationState();
}

function resetMeteringBase() {
  resetScaling();
}

if (typeof window !== 'undefined') {
  window.meteringBase = meteringBase;
  window.meteringBaseAPI = {
    setDisplayMode,
    setVoltageInputMode,
    setCTPrimary,
    setCTSecondary,
    setCTNominal,
    setVTPrimaryKVLL,
    setVTSecondary,
    setVTSecondaryMode,
    setVTNominal,
    convertScalar,
    convertComplex,
    getRatios,
    getCtRatio,
    getVtRatio,
    getImpedanceRatio,
    getSecondaryCurrentBase,
    getSecondaryVoltageBase,
    getZBase,
    getValidationState,
    onMeteringBaseChange,
    resetMeteringBase,
  };
}

export {
  meteringBase,
  onMeteringBaseChange,
  setDisplayMode,
  setVoltageInputMode,
  setCTPrimary,
  setCTSecondary,
  setCTNominal,
  setVTPrimaryKVLL,
  setVTSecondary,
  setVTSecondaryMode,
  setVTNominal,
  convertScalar,
  convertComplex,
  getRatios,
  getCtRatio,
  getVtRatio,
  getImpedanceRatio,
  getSecondaryCurrentBase,
  getSecondaryVoltageBase,
  getZBase,
  getValidationState,
  resetMeteringBase,
};
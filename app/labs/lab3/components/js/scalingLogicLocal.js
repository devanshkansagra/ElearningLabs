// Local copy of the scaling logic used by the Cloudflare Worker.
// Keeps the UI functional when the worker endpoint is unavailable (e.g. local file/server).
const BASE_MODES = new Set(['secondary', 'primary', 'per-unit']);
const VOLTAGE_MODES = new Set(['LN', 'LL']);
const sqrt3 = Math.sqrt(3);

const DEFAULT_SOURCE = {
  CT: { primary: 400, secondary: 5, nominal: 5 },
  PT: { primary: 2000, secondary: 115, mode: 'LN' },
  Vnom: 115,
  voltageInputMode: 'LN',
  base: 'secondary',
};

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function makeState(src = {}) {
  const stateSource = src || {};
  const ctSrc = stateSource.CT || {};
  const ptSrc = stateSource.PT || {};
  const safeMode = VOLTAGE_MODES.has(ptSrc.mode) ? ptSrc.mode : DEFAULT_SOURCE.PT.mode;
  const state = {
    CT: {
      primary: toNumber(ctSrc.primary),
      secondary: toNumber(ctSrc.secondary),
      nominal: toNumber(ctSrc.nominal),
    },
    PT: {
      primary: toNumber(ptSrc.primary),
      secondary: toNumber(ptSrc.secondary),
      mode: safeMode,
    },
    Vnom: toNumber(stateSource.Vnom),
    voltageInputMode: VOLTAGE_MODES.has(stateSource.voltageInputMode) ? stateSource.voltageInputMode : DEFAULT_SOURCE.voltageInputMode,
    base: BASE_MODES.has(stateSource.base) ? stateSource.base : DEFAULT_SOURCE.base,
  };
  Object.defineProperty(state, '__normalized', { value: true, enumerable: false });
  return state;
}

const DEFAULTS = Object.freeze(makeState(DEFAULT_SOURCE));

function positive(value) {
  return Number.isFinite(value) && value > 0 ? value : NaN;
}

function getCtRatio(state) {
  const primary = positive(state.CT.primary);
  const secondary = positive(state.CT.secondary);
  if (!Number.isFinite(primary) || !Number.isFinite(secondary)) return NaN;
  const ratio = primary / secondary;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : NaN;
}

function getPtRatio(state) {
  const primary = positive(state.PT.primary);
  const secondary = positive(state.PT.secondary);
  if (!Number.isFinite(primary) || !Number.isFinite(secondary)) return NaN;
  const ratio = primary / secondary;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : NaN;
}

function getImpedanceRatio(state) {
  const ct = getCtRatio(state);
  const pt = getPtRatio(state);
  if (!Number.isFinite(ct) || !Number.isFinite(pt) || pt === 0) return NaN;
  return ct / pt;
}

function getRatios(state) {
  const ct = getCtRatio(state);
  const vt = getPtRatio(state);
  return {
    ct,
    pt: vt,
    vt,
    impedance: getImpedanceRatio(state),
  };
}

function getSecondaryCurrentBase(state) {
  const nominal = positive(state.CT.nominal);
  if (Number.isFinite(nominal)) return nominal;
  return positive(state.CT.secondary);
}

function getSecondaryVoltageBase(state) {
  const raw = positive(state.Vnom);
  const fallback = positive(state.PT.secondary);
  const base = Number.isFinite(raw) ? raw : fallback;
  if (!Number.isFinite(base)) return NaN;
  return state.PT.mode === 'LL' ? base / sqrt3 : base;
}

function getZBase(state) {
  const vBase = getSecondaryVoltageBase(state);
  const iBase = getSecondaryCurrentBase(state);
  if (!Number.isFinite(vBase) || !Number.isFinite(iBase) || iBase === 0) return NaN;
  const sPhase = vBase * iBase;
  if (!Number.isFinite(sPhase) || sPhase === 0) return NaN;
  return (vBase * vBase) / sPhase;
}

function normaliseKind(kind) {
  if (!kind) return null;
  const token = String(kind).trim().toLowerCase();
  if (!token) return null;
  if (token === 'v' || token.startsWith('volt')) return 'voltage';
  if (token === 'i' || token.startsWith('curr')) return 'current';
  if (token === 'z' || token.startsWith('imped')) return 'impedance';
  return null;
}

function primaryToSecondary(state, value, kind) {
  if (!Number.isFinite(value)) return NaN;
  switch (kind) {
    case 'voltage': {
      const ratio = getPtRatio(state);
      return Number.isFinite(ratio) && ratio !== 0 ? value / ratio : NaN;
    }
    case 'current': {
      const ratio = getCtRatio(state);
      return Number.isFinite(ratio) && ratio !== 0 ? value / ratio : NaN;
    }
    case 'impedance': {
      const factor = getImpedanceRatio(state);
      return Number.isFinite(factor) ? value * factor : NaN;
    }
    default:
      return NaN;
  }
}

function secondaryToPrimary(state, value, kind) {
  if (!Number.isFinite(value)) return NaN;
  switch (kind) {
    case 'voltage': {
      const ratio = getPtRatio(state);
      return Number.isFinite(ratio) ? value * ratio : NaN;
    }
    case 'current': {
      const ratio = getCtRatio(state);
      return Number.isFinite(ratio) ? value * ratio : NaN;
    }
    case 'impedance': {
      const ct = getCtRatio(state);
      const pt = getPtRatio(state);
      return Number.isFinite(ct) && Number.isFinite(pt) && ct !== 0 ? value * (pt / ct) : NaN;
    }
    default:
      return NaN;
  }
}

function secondaryToPerUnit(state, value, kind) {
  if (!Number.isFinite(value)) return NaN;
  switch (kind) {
    case 'voltage': {
      const base = getSecondaryVoltageBase(state);
      return Number.isFinite(base) && base !== 0 ? value / base : NaN;
    }
    case 'current': {
      const base = getSecondaryCurrentBase(state);
      return Number.isFinite(base) && base !== 0 ? value / base : NaN;
    }
    case 'impedance': {
      const base = getZBase(state);
      return Number.isFinite(base) && base !== 0 ? value / base : NaN;
    }
    default:
      return NaN;
  }
}

function perUnitToSecondary(state, value, kind) {
  if (!Number.isFinite(value)) return NaN;
  switch (kind) {
    case 'voltage': {
      const base = getSecondaryVoltageBase(state);
      return Number.isFinite(base) ? value * base : NaN;
    }
    case 'current': {
      const base = getSecondaryCurrentBase(state);
      return Number.isFinite(base) ? value * base : NaN;
    }
    case 'impedance': {
      const base = getZBase(state);
      return Number.isFinite(base) ? value * base : NaN;
    }
    default:
      return NaN;
  }
}

function convertScalar(rawState, value, kind, options = {}) {
  const state = ensureState(rawState);
  const numeric = toNumber(value);
  if (!Number.isFinite(numeric)) return NaN;
  const resolvedKind = normaliseKind(kind);
  if (!resolvedKind) return NaN;
  const from = options.from === 'primary'
    ? 'primary'
    : (options.from === 'per-unit' || options.from === 'pu')
      ? 'per-unit'
      : 'secondary';
  const to = options.to === 'primary'
    ? 'primary'
    : (options.to === 'per-unit' || options.to === 'pu')
      ? 'per-unit'
      : options.to === 'secondary'
        ? 'secondary'
        : state.base;

  let inSecondary;
  if (from === 'primary') {
    inSecondary = primaryToSecondary(state, numeric, resolvedKind);
  } else if (from === 'per-unit') {
    inSecondary = perUnitToSecondary(state, numeric, resolvedKind);
  } else {
    inSecondary = numeric;
  }
  if (!Number.isFinite(inSecondary)) return NaN;

  if (to === 'secondary') return inSecondary;
  if (to === 'primary') return secondaryToPrimary(state, inSecondary, resolvedKind);
  if (to === 'per-unit') return secondaryToPerUnit(state, inSecondary, resolvedKind);
  return inSecondary;
}

function convertComplex(rawState, tuple, kind, options = {}) {
  const state = ensureState(rawState);
  if (!Array.isArray(tuple)) return [NaN, NaN];
  const resolvedKind = normaliseKind(kind);
  if (!resolvedKind) return [NaN, NaN];
  const real = convertScalar(state, tuple[0], resolvedKind, options);
  const imag = convertScalar(state, tuple[1], resolvedKind, options);
  return [real, imag];
}

function getValidationState(state) {
  const issues = [];
  const warnings = [];

  if (!positive(state.CT.primary)) {
    issues.push({ field: 'ctPrimary', message: 'CT primary must be a positive number.' });
  }
  if (!positive(state.CT.secondary)) {
    issues.push({ field: 'ctSecondary', message: 'CT secondary must be a positive number.' });
  }
  if (!positive(state.PT.primary)) {
    issues.push({ field: 'vtPrimary', message: 'VT primary (V LL) must be positive.' });
  }
  if (!positive(state.PT.secondary)) {
    issues.push({ field: 'vtSecondary', message: 'VT secondary must be a positive number.' });
  }

  if (!Number.isFinite(getCtRatio(state))) {
    issues.push({ field: 'ctRatio', message: 'CT ratio is undefined. Check primary and secondary values.' });
  }
  if (!Number.isFinite(getPtRatio(state))) {
    issues.push({ field: 'vtRatio', message: 'VT ratio is undefined. Check primary and secondary values.' });
  }

  if (state.PT.mode === 'LN' && state.voltageInputMode === 'LL') {
    warnings.push({ field: 'vtSecondaryMode', message: 'Secondary is set to LN while phasor inputs are LL.' });
  }
  if (state.PT.mode === 'LL' && state.voltageInputMode === 'LN') {
    warnings.push({ field: 'vtSecondaryMode', message: 'Secondary is set to LL while phasor inputs are LN.' });
  }

  return { issues, warnings, ratios: getRatios(state) };
}

function ensureState(rawState) {
  if (rawState && rawState.__normalized) return rawState;
  return makeState(rawState || DEFAULTS);
}

function computeDerived(rawState) {
  const state = ensureState(rawState);
  const ratios = getRatios(state);
  return {
    ratios,
    ctRatio: ratios.ct,
    ptRatio: ratios.vt,
    impedanceRatio: ratios.impedance,
    secondaryCurrentBase: getSecondaryCurrentBase(state),
    secondaryVoltageBase: getSecondaryVoltageBase(state),
    zBase: getZBase(state),
    validation: getValidationState(state),
  };
}

export {
  DEFAULTS,
  makeState,
  ensureState,
  computeDerived,
  convertScalar,
  convertComplex,
};

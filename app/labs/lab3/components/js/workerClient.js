import {
  computeDerived as computeDerivedLocal,
  convertScalar as convertScalarLocal,
  convertComplex as convertComplexLocal,
  ensureState as ensureLocalState,
} from './scalingLogicLocal.js';

const FALLBACK_ENDPOINT = '/worker';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function resolveWorkerEndpoint() {
  if (typeof window === 'undefined') return FALLBACK_ENDPOINT;
  const globalConfigured = window.__CF_CALC_ENDPOINT__;
  const metaConfigured = typeof document !== 'undefined'
    ? document.querySelector('meta[name="cf-worker-endpoint"]')?.getAttribute('content')
    : '';
  const host = window.location?.hostname || '';
  const isLocal = !host || LOCAL_HOSTS.has(host);
  if (globalConfigured || metaConfigured) {
    const endpoint = normaliseEndpoint(globalConfigured || metaConfigured);
    if (isLocal && endpoint === FALLBACK_ENDPOINT) return '';
    return endpoint;
  }
  if (isLocal) return '';
  return FALLBACK_ENDPOINT;
}

function normaliseEndpoint(raw) {
  if (!raw || !raw.trim()) return '';
  const trimmed = raw.trim();
  if (/^https?:/i.test(trimmed)) return trimmed.replace(/\/+$/, '');
  if (trimmed.startsWith('/')) return trimmed.replace(/\/+$/, '') || FALLBACK_ENDPOINT;
  return `/${trimmed}`.replace(/\/+$/, '');
}

const WORKER_ENDPOINT = resolveWorkerEndpoint();

let workerOffline = false;
let warnedFallback = false;

function cleanNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value === '' || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function serialiseState(state) {
  if (!state) return null;
  return {
    CT: {
      primary: cleanNumber(state.CT?.primary),
      secondary: cleanNumber(state.CT?.secondary),
      nominal: cleanNumber(state.CT?.nominal),
    },
    PT: {
      primary: cleanNumber(state.PT?.primary),
      secondary: cleanNumber(state.PT?.secondary),
      mode: state.PT?.mode,
    },
    Vnom: cleanNumber(state.Vnom),
    voltageInputMode: state.voltageInputMode,
    base: state.base,
  };
}

function callLocal(action, state, args = {}) {
  const safeState = ensureLocalState(serialiseState(state));
  switch (action) {
    case 'derived':
      return computeDerivedLocal(safeState);
    case 'convert-scalar':
      return convertScalarLocal(safeState, args.value, args.kind, args.options);
    case 'convert-complex':
      return convertComplexLocal(safeState, args.value, args.kind, args.options);
    default:
      throw new Error(`Unsupported local action "${action}"`);
  }
}

async function callWorker(action, state, args = {}) {
  if (!WORKER_ENDPOINT) {
    return callLocal(action, state, args);
  }
  const payload = {
    action,
    state: serialiseState(state),
    args,
  };

  if (workerOffline) {
    return callLocal(action, state, args);
  }

  try {
    const res = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) {
      const msg = body?.error || `Worker error ${res.status}`;
      throw new Error(msg);
    }
    return body.data;
  } catch (err) {
    workerOffline = true; // stop hammering a missing/forbidden endpoint
    if (!warnedFallback) {
      console.warn('[workerClient] worker endpoint unavailable; using local calculator.', err);
      warnedFallback = true;
    }
    return callLocal(action, state, args);
  }
}

export async function fetchDerivedData(state) {
  return callWorker('derived', state);
}

export async function convertScalarRemote(state, value, kind, options) {
  return callWorker('convert-scalar', state, { value, kind, options });
}

export async function convertComplexRemote(state, tuple, kind, options) {
  return callWorker('convert-complex', state, { value: Array.isArray(tuple) ? tuple : [null, null], kind, options });
}

export { serialiseState };

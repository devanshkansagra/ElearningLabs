// js/z0model.js — quick-lever zero-sequence source & GSU model
// Minimal, educational; intentionally simple equivalents.

const Z = (re=0, im=0) => ({ re:+re, im:+im });
const add = (a,b)=>Z(a.re+b.re,a.im+b.im);
const mul = (a,b)=>Z(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
const div = (a,b)=>{const d=b.re*b.re+b.im*b.im||1e-12;return Z((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d)};
const mag = a=>Math.hypot(a.re,a.im);
const normalizePreset = (v) => String(v || 'none').toLowerCase().replace(/g$/, '');
const inf = { re: 1e12, im: 0 }; // large stand-in for ∞ in this toy model

const state = {
  z0InfLocal:  false,
  z0InfRemote: false,
  reverseSLG:  false,
  gsuPreset:   'none',
  rn: 0,
  xn: 0,
  qScale: 1,
};

function $(id){ return document.getElementById(id); }

export function initZ0ModelUI(){
  const byId = id => document.getElementById(id);
  const bind = (id, k, coerce = v=>v) => {
    const el = byId(id); if (!el) return;
    const push = () => { state[k] = el.type === 'checkbox' ? !!el.checked : coerce(el.value); publish(); };
    el.addEventListener('input', push); el.addEventListener('change', push); push();
  };

  bind('z0inf-local',  'z0InfLocal',  v=>!!v);
  bind('z0inf-remote', 'z0InfRemote', v=>!!v);
  bind('rev-slg',      'reverseSLG',  v=>!!v);
  bind('gsu-preset',   'gsuPreset',   v=>String(v||'none'));
  bind('Rn',           'rn',          v=>+v||0);
  bind('Xn',           'xn',          v=>+v||0);
  bind('qscale',       'qScale',      v=>+v||1);

  const qs = $('qscale'); const out = $('qscale-out');
  if (qs && out){ const upd = () => out.textContent = `${(+qs.value).toFixed(2)}×`; qs.addEventListener('input', upd); upd(); }

  publish();

  if (qs && out) {
    const upd = () => { out.textContent = `${(+qs.value).toFixed(2)}x`; };
    qs.addEventListener('input', upd);
    upd();
  }
}

function publish(){
  // Let other modules pull state via window.Z0Model
  window.Z0Model = window.Z0Model || {};
  window.Z0Model.getState = () => ({...state});
}

// Small helper: 3*Zn for tertiary grounding reflected to line (toy model)
function gsuZ0(rn,xn){
  if (!isFinite(rn) && !isFinite(xn)) return inf; // nothing specified
  return Z(3* ( +rn||0 ), 3* ( +xn||0 ));
}

function terminalZ0({ isInfinite, gsu }){
  // If forced ∞Z0 or no GSU path (and reverse SLG), return ∞
  if (isInfinite) return inf;
  if (!gsu) return inf; // no explicit GSU → open path in this simplification
  return gsu;
}

function labelFromZ0eff(m){
  if (!isFinite(m) || m > 1e9) return 'open';
  if (m > 5) return 'weak'; // arbitrary threshold; tune for your line units
  return 'strong';
}

/**
 * Apply the model to the sequences used by the 32 logic.
 * @param {{V0:{re,im}, I0:{re,im}, I1:{re,im}, I2:{re,im}}} seq
 * @param {{Z0line:number}} ctx minimal context (optional)
 */
export function applyZeroSeqModel(seq, ctx={}){
  const s = window.Z0Model?.getState?.() || state;

  // Build remote GSU Z0 (simple: 3·(Rn+jXn) when a preset with grounded tert is selected)
  const presetNeedsTert = (p)=> p==='dy1' || p==='dy5' || p==='yy';
  const presetKey = normalizePreset(s.gsuPreset);
  const z0gsu   = presetNeedsTert(presetKey) ? gsuZ0(s.rn, s.xn) : null;

  const z0Local = terminalZ0({ isInfinite: s.z0InfLocal,  gsu: null });
  const z0Rem   = terminalZ0({ isInfinite: s.z0InfRemote, gsu: z0gsu });

  // Effective Z0 seen by the relay (very rough): if reverse SLG and remote path is open → treat as open
  let z0eff = inf;
  if (s.reverseSLG){
    z0eff = z0Rem; // you are looking through the GSU into remote grounding
  } else {
    // forward fault: consider local source to ground; in this toy lever, assume local Z0 is open if toggled
    z0eff = z0Local === inf ? Z(0,0) : z0Local;
  }
  const z0effMag = mag(z0eff);
  const path = labelFromZ0eff(z0effMag);

  // Adjust the comparator inputs lightly:
  // - If path is open → V0≈0 and I0≈0
  // - If weak → scale V0 down a bit so Z0=V0/I0 smaller; leave angles intact
  let V0 = seq.V0, I0 = seq.I0, I1 = seq.I1, I2 = seq.I2;

  if (path === 'open'){
    V0 = Z(0,0); I0 = Z(0,0);
  } else if (path === 'weak'){
    V0 = Z(seq.V0.re*0.25, seq.V0.im*0.25);
  } // strong → unchanged

  // Q-path (negative-sequence) scaling to mimic weak source
  const k = +s.qScale || 1;
  I2 = Z(seq.I2.re*k, seq.I2.im*k);
  I1 = Z(seq.I1.re*k, seq.I1.im*k);

  // Update the live note
  const card = document.getElementById('z0model-note');
  if (card){
    card.innerHTML = `I₀ path: <strong>${path}</strong> · Z₀<sub>eff</sub>: ${Number.isFinite(z0effMag)?z0effMag.toFixed(2):'∞'} Ω`;
  }

  return { V0, I0, I1, I2, z0effMag, path };
}

// Auto-init if the UI exists
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initZ0ModelUI());
  } else { initZ0ModelUI(); }
}

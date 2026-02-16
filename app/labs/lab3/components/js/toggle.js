(function(){


                function setOn(inValue) {
                    if ((toggleon.value) === "1") {
                        (toggleon.value) = "0";
                    }
                    else {
                        (toggleon.value) = "1";
                    }
                }
                function setOn_I(inValue) {
                    if ((toggleon_I.value) === "1") {
                        (toggleon_I.value) = "0";
                    }
                    else {
                        (toggleon_I.value) = "1";
                    }
                }
                window.setOn = setOn;
                window.setOn_I = setOn_I;                
})()

function updateOhmLabels(unit) {
  // query fresh each time – avoids reliance on outer-scope globals
  const spans = document.querySelectorAll('.spanOhmsPerUnit');
  const label = unit === 'miles' ? 'Ω/miles' : 'Ω/km';
  spans.forEach(s => { s.textContent = label; });
}

export function setUnit(unit) {
  const desired = unit === 'miles' ? 'miles' : 'km';
  const span = document.getElementById('spanUnit');
  if (span) span.textContent = desired;     // cosmetic label only
  updateOhmLabels(desired);                  // Ω/km ⇄ Ω/miles
  localStorage.setItem('unit', desired);     // remember cosmetic choice
  document.documentElement.dataset.unit = desired; // optional CSS hook
  // Ensure Ω per unit labels sync with current unit for Z1/Z0
  try {
    const ohmPer = desired === 'miles' ? 'Ω/miles' : 'Ω/km';
    document.querySelectorAll('.spanOhmsPerUnit').forEach(s => { s.textContent = ohmPer; });
    const z1 = document.getElementById('Z_ratio')?.parentElement?.querySelector('span.lbl');
    const z0 = document.getElementById('Z0_ratio')?.parentElement?.querySelector('span.lbl');
    [z1, z0].filter(Boolean).forEach(s => { if (!s.classList.contains('spanOhmsPerUnit')) s.textContent = ohmPer; });
  } catch {}
}

export function toggleUnit() {
  const span = document.getElementById('spanUnit');
  const current = (localStorage.getItem('unit') || span?.textContent?.trim() || 'km');
  const next = current === 'km' ? 'miles' : 'km';
  setUnit(next);
}

import { m_inv, M_V } from "./symTransforms.js";

// Get global variables from window
const DEG2RAD = Math.PI / 180;
const PIX_PER_AMP_I = window.PIX_PER_AMP_I || 1;

// Helper function to get absolute value
function Zabs(c) {
  return Math.sqrt(c[0] * c[0] + c[1] * c[1]);
}

// Helper function to get angle in degrees
function angle(c) {
  return Math.atan2(c[1], c[0]) * 180 / Math.PI;
}

// Helper function to convert px to amps
function ampI(px) {
  return px / PIX_PER_AMP_I;
}

export function ganged(){
  
  // Get DOM element references
  const Amp_A = document.getElementById("Amp_A");
  const Amp_B = document.getElementById("Amp_B");
  const Amp_C = document.getElementById("Amp_C");
  const Angle_A = document.getElementById("Angle_A");
  const Angle_B = document.getElementById("Angle_B");
  const Angle_C = document.getElementById("Angle_C");
  const Amp_A_I = document.getElementById("Amp_A_I");
  const Amp_B_I = document.getElementById("Amp_B_I");
  const Amp_C_I = document.getElementById("Amp_C_I");
  const Angle_A_I = document.getElementById("Angle_A_I");
  const Angle_B_I = document.getElementById("Angle_B_I");
  const Angle_C_I = document.getElementById("Angle_C_I");
  
  const phasors = [
    { amp: Amp_A, angle: Angle_A },
    { amp: Amp_B, angle: Angle_B },
    { amp: Amp_C, angle: Angle_C }
  ];

  const phasors_I = [
    { amp: Amp_A_I, angle: Angle_A_I },
    { amp: Amp_B_I, angle: Angle_B_I },
    { amp: Amp_C_I, angle: Angle_C_I }
  ];

  const phasor = (ampVal, angleDeg) => [
    ampVal * Math.cos(angleDeg * DEG2RAD),
    ampVal * Math.sin(angleDeg * DEG2RAD)
  ];

  const rect = phasors.map(({ amp, angle }) => phasor(+amp.value, +angle.value));
  const rect_I = phasors_I.map(({ amp, angle }) => phasor(+amp.value * PIX_PER_AMP_I, +angle.value));

  const modified = M_V(m_inv, rect); 
  const modified_I = M_V(m_inv, rect_I);

  for (let i = 0; i < 3; i++) {
    $(`#Amp_${i}`).val(Zabs(modified[i]).toFixed(1));
    $(`#Angle_${i}`).val(angle(modified[i]).toFixed(1));
    $(`#Amp_${i}_I`).val(ampI(Zabs(modified_I[i])).toFixed(1));
    $(`#Angle_${i}_I`).val(angle(modified_I[i]).toFixed(1));
  }
}

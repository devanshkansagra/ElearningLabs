import { m_inv, M_V } from "./symTransforms.js";

export function ganged(){
    
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

  const phasor = (ampVal, angleDEG2RAD) => [ ampVal * Math.cos(angleDEG2RAD * DEG2RAD), ampVal * Math.sin(angleDEG2RAD * DEG2RAD)];

  const rect = phasors.map(({ amp, angle }) => phasor(+amp.value, +angle.value));
  const rect_I = phasors_I.map(({ amp, angle }) => phasor(+amp.value * PIX_PER_AMP_I, +angle.value));

  const modified = M_V(m_inv, rect); const modified_I = M_V(m_inv, rect_I);

  for (let i = 0; i < 3; i++) {
    $(`#Amp_${i}`).val(Zabs(modified[i]).toFixed(1));
    $(`#Angle_${i}`).val(angle(modified[i]).toFixed(1));
    $(`#Amp_${i}_I`).val(ampI(Zabs(modified_I[i])).toFixed(1));
    $(`#Angle_${i}_I`).val(angle(modified_I[i]).toFixed(1));
  }
}
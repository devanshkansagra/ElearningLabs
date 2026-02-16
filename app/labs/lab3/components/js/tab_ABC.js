import * as d3 from "d3";
import $ from "jquery";
import { m, M_V } from "./symTransforms.js";

export function tab_ABC() {
  const inputs = [
    { amp: Amp_0, angle: Angle_0, ampI: Amp_0_I, angleI: Angle_0_I },
    { amp: Amp_1, angle: Angle_1, ampI: Amp_1_I, angleI: Angle_1_I },
    { amp: Amp_2, angle: Angle_2, ampI: Amp_2_I, angleI: Angle_2_I },
  ];

  const phasors = inputs.map(({ amp, angle }) =>
    phasor(+amp.value, +angle.value),
  );
  const phasors_I = inputs.map(({ ampI, angleI }) =>
    phasor(+ampI.value, +angleI.value),
  );

  const modified = M_V(m, phasors);
  const modified_I = M_V(m, phasors_I);

  const ids = ["A", "B", "C"];
  ids.forEach((id, i) => {
    $(`#Amp_${id}`).val(Zabs(modified[i]).toFixed(1));
    $(`#Angle_${id}`).val(angle(modified[i]).toFixed(1));
    $(`#Amp_${id}_I`).val(Zabs(modified_I[i]).toFixed(1));
    $(`#Angle_${id}_I`).val(angle(modified_I[i]).toFixed(1));
  });

  const deltas = [
    [1, 0, "AB"],
    [2, 1, "BC"],
    [0, 2, "CA"],
  ];

  deltas.forEach(([i, j, label]) => {
    const diff = Zsub(modified[i], modified[j]);
    const diff_I = Zsub(modified_I[i], modified_I[j]);

    d3.selectAll(`#Amp_${label}_Ph2Ph`).text(Zabs(diff).toFixed(1));
    d3.selectAll(`#Angle_${label}_Ph2Ph`).text(angle(diff).toFixed(1));
    d3.selectAll(`#Amp_${label}_Ph2Ph_I`).text(Zabs(diff_I).toFixed(1));
    d3.selectAll(`#Angle_${label}_Ph2Ph_I`).text(angle(diff_I).toFixed(1));
  });
}

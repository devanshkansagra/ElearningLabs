import { vector } from "./vector.js";
import * as d3 from "d3";

export async function renderVectorsAndTexts() {
  vector(vectora, psa, "vectora", "a", data, data, vis_inner_V);
  vector(vectorb, psb, "vectorb", "b", data, data, vis_inner_V);
  vector(vectorc, psc, "vectorc", "c", data, data, vis_inner_V);
  vector(vector2, ps2, "vector2", "2", data, data, vis_inner_V);
  vector(vector1, ps1, "vector1", "1", data, data1, vis_inner_V);
  vector(vector0, ps0, "vector0", "0", data, data2, vis_inner_V);

  vector(vectora_I, psa_I, "vectora_I", "ai", data_I, data_I, vis_inner_I);
  vector(vectorb_I, psb_I, "vectorb_I", "bi", data_I, data_I, vis_inner_I);
  vector(vectorc_I, psc_I, "vectorc_I", "ci", data_I, data_I, vis_inner_I);
  vector(vector2_I, ps2_I, "vector2_I", "2i", data_I, data_I, vis_inner_I);
  vector(vector1_I, ps1_I, "vector1_I", "1i", data_I, data1_I, vis_inner_I);
  vector(vector0_I, ps0_I, "vector0_I", "0i", data_I, data2_I, vis_inner_I);

  const p0_KN3 = [
    [p0_KNx, p0_KNy],
    [p0_KNx, p0_KNy],
    [p0_KNx, p0_KNy],
  ];
  vector(vector_KN, ps_KN, "vector_KN", "KN", p0_KN3, p0_KN3, vis_KN);

  vector(vectora_Z, psa_Z, "vectora_Z", "az", data_Z, data_Z, vis_inner_Z);
  vector(vectorb_Z, psb_Z, "vectorb_Z", "bz", data_Z, data_Z, vis_inner_Z);
  vector(vectorc_Z, psc_Z, "vectorc_Z", "cz", data_Z, data_Z, vis_inner_Z);

  vector(vectorab_Z, psab_Z, "vectorab_Z", "abz", data_Z, data_Z, vis_inner_Z);
  vector(vectorbc_Z, psbc_Z, "vectorbc_Z", "bcz", data_Z, data_Z, vis_inner_Z);
  vector(vectorca_Z, psca_Z, "vectorca_Z", "caz", data_Z, data_Z, vis_inner_Z);

  // Render text labels for Z vectors (Za, Zab, Zb, Zbc, Zc, Zca)
  // Note: za, zb, zc, zab, zbc, zca are global complex impedance values in Ohms
  // ampa_Z, ampb_Z, etc. are in pixels, need Zabs() / PIX_PER_AMP_Z for Ohms
  const zData = [
    { label: "Za", coords: psa_Z, zVal: za, class: "texta_Z", color: "var(--Aphase)" },
    { label: "Zb", coords: psb_Z, zVal: zb, class: "textb_Z", color: "var(--Bphase)" },
    { label: "Zc", coords: psc_Z, zVal: zc, class: "textc_Z", color: "var(--Cphase)" },
    { label: "Zab", coords: psab_Z, zVal: zab, class: "textab_Z", color: "var(--Aphase)" },
    { label: "Zbc", coords: psbc_Z, zVal: zbc, class: "textbc_Z", color: "var(--Bphase)" },
    { label: "Zca", coords: psca_Z, zVal: zca, class: "textca_Z", color: "var(--Cphase)" },
  ];

  // Helper function to get absolute value and angle from complex number
  const Zabs = (c) => Math.sqrt(c[0] * c[0] + c[1] * c[1]);
  const angle = (c) => Math.atan2(c[1], c[0]) * 180 / Math.PI;

  zData.forEach(({ label, coords, zVal, class: cls, color }) => {
    if (coords && coords[0] && Number.isFinite(coords[0][0]) && Number.isFinite(coords[0][1])) {
      const x = coords[0][0] + 15;
      const y = coords[0][1] + 15;
      
      // Remove existing label if any
      vis_inner_Z.selectAll(`text.${cls}`).remove();
      vis_inner_Z.selectAll(`text.${cls}dash`).remove();
      
      // Add label text
      vis_inner_Z.append("text")
        .attr("class", cls)
        .attr("x", x)
        .attr("y", y)
        .attr("fill", color)
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(label);
      
      // Add impedance value (magnitude and angle) below the label
      if (zVal && Number.isFinite(zVal[0]) && Number.isFinite(zVal[1])) {
        const mag = Zabs(zVal);
        const ang = angle(zVal);
        if (Number.isFinite(mag) && Number.isFinite(ang)) {
          vis_inner_Z.append("text")
            .attr("class", `${cls}dash`)
            .attr("x", x)
            .attr("y", y + 14)
            .attr("fill", color)
            .style("font-family", "sans-serif")
            .style("font-size", "10px")
            .text(`${mag.toFixed(1)} Ω ∠${ang.toFixed(1)}°`);
        }
      }
    }
  });

  vector(
    vector_Z_Line,
    ps_Z_line,
    "vector_Z_Line",
    "line",
    data_Z,
    data_Z,
    vis_inner_Z,
  );
}

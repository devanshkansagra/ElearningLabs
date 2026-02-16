import { vector } from './vector.js';
import { text_Vector } from './texts.js';

export async function renderVectorsAndTexts() {
  vector(vectora, psa, 'vectora', 'a', data, data, vis_inner_V);
  vector(vectorb, psb, 'vectorb', 'b', data, data, vis_inner_V);
  vector(vectorc, psc, 'vectorc', 'c', data, data, vis_inner_V);
  vector(vector2, ps2, 'vector2', '2', data, data, vis_inner_V);
  vector(vector1, ps1, 'vector1', '1', data, data1, vis_inner_V);
  vector(vector0, ps0, 'vector0', '0', data, data2, vis_inner_V);

  vector(vectora_I, psa_I, 'vectora_I', 'ai', data_I, data_I, vis_inner_I);
  vector(vectorb_I, psb_I, 'vectorb_I', 'bi', data_I, data_I, vis_inner_I);
  vector(vectorc_I, psc_I, 'vectorc_I', 'ci', data_I, data_I, vis_inner_I);
  vector(vector2_I, ps2_I, 'vector2_I', '2i', data_I, data_I, vis_inner_I);
  vector(vector1_I, ps1_I, 'vector1_I', '1i', data_I, data1_I, vis_inner_I);
  vector(vector0_I, ps0_I, 'vector0_I', '0i', data_I, data2_I, vis_inner_I);

  const p0_KN3 = [[p0_KNx, p0_KNy], [p0_KNx, p0_KNy], [p0_KNx, p0_KNy]];
  vector(vector_KN, ps_KN, 'vector_KN', 'KN', p0_KN3, p0_KN3, vis_KN);

  vector(vectora_Z, psa_Z, 'vectora_Z', 'az', data_Z, data_Z, vis_inner_Z);
  vector(vectorb_Z, psb_Z, 'vectorb_Z', 'bz', data_Z, data_Z, vis_inner_Z);
  vector(vectorc_Z, psc_Z, 'vectorc_Z', 'cz', data_Z, data_Z, vis_inner_Z);

  vector(vectorab_Z, psab_Z, 'vectorab_Z', 'abz', data_Z, data_Z, vis_inner_Z);
  vector(vectorbc_Z, psbc_Z, 'vectorbc_Z', 'bcz', data_Z, data_Z, vis_inner_Z);
  vector(vectorca_Z, psca_Z, 'vectorca_Z', 'caz', data_Z, data_Z, vis_inner_Z);

  vector(vector_Z_Line, ps_Z_line, 'vector_Z_Line', 'line', data_Z, data_Z, vis_inner_Z);

  const textJobs = [
    text_Vector(texta, textadash, textadashangle, 'texta', 'textadash', 'textadashangle', psa, psa, veca, 'a', '#va_before', '#equala_V', '#ampva', '#angva', ampa, anglea, va, td, ta, tdd, 'var(--Aphase)', textdecova, equala, vis_inner_V, fontSize, 'V', PIX_PER_AMP_V),
    text_Vector(textb, textbdash, textbdashangle, 'textb', 'textbdash', 'textbdashangle', psb, psa, vecb, 'b', '#vb_before', '#equalb_V', '#ampvb', '#angvb', ampb, angleb, vb, td, tb, tdd, 'var(--Bphase)', textdecovb, equalb, vis_inner_V, fontSize, 'V', PIX_PER_AMP_V),
    text_Vector(textc, textcdash, textcdashangle, 'textc', 'textcdash', 'textcdashangle', psc, psa, vecc, 'c', '#vc_before', '#equalc_V', '#ampvc', '#angvc', ampc, anglec, vc, td, tc, tdd, 'var(--Cphase)', textdecovc, equalc, vis_inner_V, fontSize, 'V', PIX_PER_AMP_V),
    text_Vector(texta_I, textadash_I, textadashangle_I, 'texta_I', 'textadash_I', 'textadashangle_I', psa_I, psa_I, veca_I, 'a', '#ia_before', '#equala_I', '#ampia', '#angia', ampa_I, anglea_I, ia, td_I, ta_I, tdd_I, 'var(--Aphase)', textdecova_I, equala_I, vis_inner_I, fontSize, 'I', PIX_PER_AMP_I),
    text_Vector(textb_I, textbdash_I, textbdashangle_I, 'textb_I', 'textbdash_I', 'textbdashangle_I', psb_I, psa_I, vecb_I, 'b', '#ib_before', '#equalb_I', '#ampib', '#angib', ampb_I, angleb_I, ib, td_I, tb_I, tdd_I, 'var(--Bphase)', textdecovb_I, equalb_I, vis_inner_I, fontSize, 'I', PIX_PER_AMP_I),
    text_Vector(textc_I, textcdash_I, textcdashangle_I, 'textc_I', 'textcdash_I', 'textcdashangle_I', psc_I, psa_I, vecc_I, 'c', '#ic_before', '#equalc_I', '#ampic', '#angic', ampc_I, anglec_I, ic, td_I, tc_I, tdd_I, 'var(--Cphase)', textdecovc_I, equalc_I, vis_inner_I, fontSize, 'I', PIX_PER_AMP_I),
    text_Vector(texta_Z, textadash_Z, textadashangle_Z, 'texta_Z', 'textadash_Z', 'textadashangle_Z', psa_Z, psa_Z, conjugate(veca_Z), 'a', '#za_before', '#equala_Z', '#ampza', '#angza', ampa_Z, anglea_Z, Zadd(data_Z[0], veca_Z), td_I, ta_I, tdd_I, 'var(--Aphase)', textdecova_Z, equala_Z, vis_inner_Z, fontSize, 'Z', PIX_PER_AMP_Z),
    text_Vector(textb_Z, textbdash_Z, textbdashangle_Z, 'textb_Z', 'textbdash_Z', 'textbdashangle_Z', psb_Z, psa_Z, conjugate(vecb_Z), 'b', '#zb_before', '#equalb_Z', '#ampzb', '#angzb', ampb_Z, angleb_Z, Zadd(data_Z[1], vecb_Z), td_I, tb_I, tdd_I, 'var(--Bphase)', textdecovb_Z, equalb_Z, vis_inner_Z, fontSize, 'Z', PIX_PER_AMP_Z),
    text_Vector(textc_Z, textcdash_Z, textcdashangle_Z, 'textc_Z', 'textcdash_Z', 'textcdashangle_Z', psc_Z, psa_Z, conjugate(vecc_Z), 'c', '#zc_before', '#equalc_Z', '#ampzc', '#angzc', ampc_Z, anglec_Z, Zadd(data_Z[2], vecc_Z), td_I, tc_I, tdd_I, 'var(--Cphase)', textdecovc_Z, equalc_Z, vis_inner_Z, fontSize, 'Z', PIX_PER_AMP_Z),
    text_Vector(textab_Z, textabdash_Z, textabdashangle_Z, 'textab_Z', 'textabdash_Z', 'textabdashangle_Z', psab_Z, psab_Z, conjugate(vecab_Z), 'ab', '#zab_before', '#equalab_Z', '#ampzab', '#angzab', ampab_Z, angleab_Z, Zadd(data_Z[0], vecab_Z), td_I, ta_I, tdd_I, 'var(--Aphase)', textdecovab_Z, equalab_Z, vis_inner_Z, fontSize, 'Z', PIX_PER_AMP_Z),
    text_Vector(textbc_Z, textbcdash_Z, textbcdashangle_Z, 'textbc_Z', 'textbcdash_Z', 'textbcdashangle_Z', psbc_Z, psbc_Z, conjugate(vecbc_Z), 'bc', '#zbc_before', '#equalbc_Z', '#ampzbc', '#angzbc', ampbc_Z, anglebc_Z, Zadd(data_Z[0], vecbc_Z), td_I, tb_I, tdd_I, 'var(--Bphase)', textdecovbc_Z, equalbc_Z, vis_inner_Z, fontSize, 'Z', PIX_PER_AMP_Z),
    text_Vector(textca_Z, textcadash_Z, textcadashangle_Z, 'textca_Z', 'textcadash_Z', 'textcadashangle_Z', psca_Z, psca_Z, conjugate(vecca_Z), 'ca', '#zca_before', '#equalca_Z', '#ampzca', '#angzca', ampca_Z, angleca_Z, Zadd(data_Z[0], vecca_Z), td_I, tc_I, tdd_I, 'var(--Cphase)', textdecovca_Z, equalca_Z, vis_inner_Z, fontSize, 'Z', PIX_PER_AMP_Z),
  ];

  await Promise.all(textJobs);
}

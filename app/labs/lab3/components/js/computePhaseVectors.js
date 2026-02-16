import { m_inv, M_V, a, a2 } from "./symTransforms.js";

// ---------- VOLTAGE ----------
export function computeVoltagePhasors({ va, vb, vc, p0x, p0y, Three_ph }) {
  const p0 = originV();
  
  // If "balanced" is locked, derive VB/VC from VA
  let vb_plot = vb, vc_plot = vc;
  if (Three_ph) {
    const Va_loc = fromScreenXY(va, p0);
    vb_plot = toScreenXY(Zmul(a2, Va_loc), p0);
    vc_plot = toScreenXY(Zmul(a,  Va_loc), p0);
  }

  // ABC in local complex (px)
  const Va = fromScreenXY(va,      p0);
  const Vb = fromScreenXY(vb_plot, p0);
  const Vc = fromScreenXY(vc_plot, p0);

  // Base symmetrical components (A-phase reference)
  const [V0, V1, V2] = M_V(m_inv, [Va, Vb, Vc]);

  // Per-phase sequence vectors (local, from origin)
  const Va2 = V2,           Vb2 = Zmul(a,  V2),  Vc2 = Zmul(a2, V2);
  const Va1 = V1,           Vb1 = Zmul(a2, V1),  Vc1 = Zmul(a,  V1);
  const Va0 = V0,           Vb0 = V0,            Vc0 = V0;

  // Head-to-tail absolute HEADS (screen coords)
  const head2a = toScreenXY(Va2,                 p0);
  const head2b = toScreenXY(Vb2,                 p0);
  const head2c = toScreenXY(Vc2,                 p0);

  const head1a = toScreenXY(Zadd(Va2, Va1),      p0);
  const head1b = toScreenXY(Zadd(Vb2, Vb1),      p0);
  const head1c = toScreenXY(Zadd(Vc2, Vc1),      p0);

  const head0a = toScreenXY(Zadd(Zadd(Va2, Va1), Va0), p0);
  const head0b = toScreenXY(Zadd(Zadd(Vb2, Vb1), Vb0), p0);
  const head0c = toScreenXY(Zadd(Zadd(Vc2, Vc1), Vc0), p0);

  // TAILS and HEADS arrays (3 per set → A/B/C)
  const data  = [p0,      p0,      p0     ];             // tails for "2"
  const ps2   = [head2a,  head2b,  head2c];              // heads for "2"

  const data1 = [head2a,  head2b,  head2c];              // tails for "1"
  const ps1   = [head1a,  head1b,  head1c];              // heads for "1"

  const data2 = [head1a,  head1b,  head1c];              // tails for "0"
  const ps0   = [head0a,  head0b,  head0c];              // heads for "0"

  // ABC (for labels next to the big phase vectors)
  const ampa = Zabs(Va), anglea = angle(Va);
  const ampb = Zabs(Vb), angleb = angle(Vb);
  const ampc = Zabs(Vc), anglec = angle(Vc);

  return {
    // store balanced copies used elsewhere
    p0, psa: [va], psb: [vb_plot], psc: [vc_plot], vb: vb_plot, vc: vc_plot,

    // ABC labels
    veca: Va, vecb: Vb, vecc: Vc,
    ampa, anglea, ampb, angleb, ampc, anglec,

    // 0/1/2 values for the right-side table
    amp0: Zabs(V0), angle0: angle(V0),
    amp1: Zabs(V1), angle1: angle(V1),
    amp2: Zabs(V2), angle2: angle(V2),

    // nine sequence vectors head-to-tail
    data, data1, data2,
    ps0, ps1, ps2,
    ps0bis: ps0, ps1bis: ps1, ps2bis: ps2
  };
}

// ---------- CURRENT ----------
export function computeCurrentPhasors({ ia, ib, ic, Three_ph_I }) {
  const p0 = originI(); // use the current canvas origin

  // Derive balanced IB/IC from IA if locked
  let ib_plot = ib, ic_plot = ic;
  if (Three_ph_I) {
    const Ia_loc = fromScreenXY(ia, p0);
    ib_plot = toScreenXY(Zmul(a2, Ia_loc), p0);
    ic_plot = toScreenXY(Zmul(a,  Ia_loc), p0);
  }

  // ABC (px)
  const Ia = fromScreenXY(ia,      p0);
  const Ib = fromScreenXY(ib_plot, p0);
  const Ic = fromScreenXY(ic_plot, p0);

  // Base symmetrical components
  const [I0, I1, I2] = M_V(m_inv, [Ia, Ib, Ic]);

  // Per-phase sequences
  const Ia2 = I2,           Ib2 = Zmul(a,  I2),  Ic2 = Zmul(a2, I2);
  const Ia1 = I1,           Ib1 = Zmul(a2, I1),  Ic1 = Zmul(a,  I1);
  const Ia0 = I0,           Ib0 = I0,            Ic0 = I0;

  // Absolute heads (screen)
  const head2a = toScreenXY(Ia2,                 p0);
  const head2b = toScreenXY(Ib2,                 p0);
  const head2c = toScreenXY(Ic2,                 p0);

  const head1a = toScreenXY(Zadd(Ia2, Ia1),      p0);
  const head1b = toScreenXY(Zadd(Ib2, Ib1),      p0);
  const head1c = toScreenXY(Zadd(Ic2, Ic1),      p0);

  const head0a = toScreenXY(Zadd(Zadd(Ia2, Ia1), Ia0), p0);
  const head0b = toScreenXY(Zadd(Zadd(Ib2, Ib1), Ib0), p0);
  const head0c = toScreenXY(Zadd(Zadd(Ic2, Ic1), Ic0), p0);

  // Tails/heads
  const data_I  = [p0,      p0,      p0     ];
  const ps2_I   = [head2a,  head2b,  head2c];

  const data1_I = [head2a,  head2b,  head2c];
  const ps1_I   = [head1a,  head1b,  head1c];

  const data2_I = [head1a,  head1b,  head1c];
  const ps0_I   = [head0a,  head0b,  head0c];

  // ABC labels for I
  const ampa_I = Zabs(Ia), anglea_I = angle(Ia);
  const ampb_I = Zabs(Ib), angleb_I = angle(Ib);
  const ampc_I = Zabs(Ic), anglec_I = angle(Ic);

  return {
    psa_I: [ia], psb_I: [ib_plot], psc_I: [ic_plot],

    veca_I: Ia, vecb_I: Ib, vecc_I: Ic,
    ampa_I, anglea_I, ampb_I, angleb_I, ampc_I, anglec_I,

    amp0_I: Zabs(I0), angle0_I: angle(I0),
    amp1_I: Zabs(I1), angle1_I: angle(I1),
    amp2_I: Zabs(I2), angle2_I: angle(I2),

    data_I, data1_I, data2_I,
    ps0_I, ps1_I, ps2_I,
    ps0bis_I: ps0_I, ps1bis_I: ps1_I, ps2bis_I: ps2_I
  };
}
                     
        
export let computeImpedancePhasors = () => {
  // --- screen → engineering converters --------------------------------------
  const V = h => [ xScale_V.invert(h[0]), yScale_V.invert(h[1]) ];
  const I = h => [ xScale_I.invert(h[0]), yScale_I.invert(h[1]) ];

  // KN unchanged
  const KN_head = (ps_KN && ps_KN[0]) ? ps_KN[0] : [p0_KNx, p0_KNy];
  KN = [
    xScale_KN.invert(KN_head[0]) - xScale_KN.invert(p0_KNx),
    yScale_KN.invert(KN_head[1]) - yScale_KN.invert(p0_KNy)
  ];
  if (!Number.isFinite(Zabs(KN))) KN = [0, 0];

  // IN in amps with current scale
  const oI = originI();
  const IaH = psa_I?.[0] ?? [oI[0], oI[1]];
  const IbH = psb_I?.[0] ?? [oI[0], oI[1]];
  const IcH = psc_I?.[0] ?? [oI[0], oI[1]];
  IN = Zmulscal(1 / fact_1A, Zadd(I(IaH), Zadd(I(IbH), I(IcH))));

  // Phase volt heads using V scale
  const oV = originV();
  const VaH = psa?.[0] ?? [oV[0], oV[1]];
  const VbH = psb?.[0] ?? [oV[0], oV[1]];
  const VcH = psc?.[0] ?? [oV[0], oV[1]];

  const denA = Zadd(I(IaH), Zmul(KN, IN));
  const denB = Zadd(I(IbH), Zmul(KN, IN));
  const denC = Zadd(I(IcH), Zmul(KN, IN));

  const Za = Zmul(V(VaH), Zinv(denA));
  const Zb = Zmul(V(VbH), Zinv(denB));
  const Zc = Zmul(V(VcH), Zinv(denC));

  za = Za; zb = Zb; zc = Zc;

  // Loop impedances (no KN)
  const Zab = Zmul( Zsub(V(VaH), V(VbH)), Zinv( Zsub(I(IaH), I(IbH)) ) );
  const Zbc = Zmul( Zsub(V(VbH), V(VcH)), Zinv( Zsub(I(IbH), I(IcH)) ) );
  const Zca = Zmul( Zsub(V(VcH), V(VaH)), Zinv( Zsub(I(IcH), I(IaH)) ) );
  zab = Zab; zbc = Zbc; zca = Zca;

  // Heads on Z canvas using current Z scale
  const oZ = originZ();
  p0_Z = oZ;                                // use dynamic origin for Z canvas
  data_Z = [oZ, oZ, oZ];

  psa_Z  = [[ xScale_Z(za[0]),  yScale_Z(za[1]) ]];
  psb_Z  = [[ xScale_Z(zb[0]),  yScale_Z(zb[1]) ]];
  psc_Z  = [[ xScale_Z(zc[0]),  yScale_Z(zc[1]) ]];
  psab_Z = [[ xScale_Z(zab[0]), yScale_Z(zab[1]) ]];
  psbc_Z = [[ xScale_Z(zbc[0]), yScale_Z(zbc[1]) ]];
  psca_Z = [[ xScale_Z(zca[0]), yScale_Z(zca[1]) ]];

  // Recompute vectors relative to dynamic Z origin
  veca_Z  = Zsub(psa_Z[0],  p0_Z);
  vecb_Z  = Zsub(psb_Z[0],  p0_Z);
  vecc_Z  = Zsub(psc_Z[0],  p0_Z);
  vecab_Z = Zsub(psab_Z[0], p0_Z);
  vecbc_Z = Zsub(psbc_Z[0], p0_Z);
  vecca_Z = Zsub(psca_Z[0], p0_Z);

  // Amplitudes: keep px units consistently
  ampa_Z  = Zabs(za)  * PIX_PER_AMP_Z;
  ampb_Z  = Zabs(zb)  * PIX_PER_AMP_Z;
  ampc_Z  = Zabs(zc)  * PIX_PER_AMP_Z;
  ampab_Z = Zabs(zab) * PIX_PER_AMP_Z;
  ampbc_Z = Zabs(zbc) * PIX_PER_AMP_Z;
  ampca_Z = Zabs(zca) * PIX_PER_AMP_Z;

  anglea_Z = angle(za); angleb_Z = angle(zb); anglec_Z = angle(zc);
  angleab_Z = angle(zab); anglebc_Z = angle(zbc); angleca_Z = angle(zca);

  // Z_line helpers in Ω → px
  const Zx = v => [
    $("#Z_ratio").val() * $("#Z_l").val() * v * Math.cos(rad($("#Z_angle").val())),
    $("#Z_ratio").val() * $("#Z_l").val() * v * Math.sin(rad($("#Z_angle").val()))
  ];
  ps_Z_line  = [[ xScale_Z(Zx(1)[0]),                   yScale_Z(Zx(1)[1]) ]];
  ps_Z1_line = [[ xScale_Z(Zx($("#Z1").val()/100)[0]),  yScale_Z(Zx($("#Z1").val()/100)[1]) ]];
  ps_Z2_line = [[ xScale_Z(Zx($("#Z2").val()/100)[0]),  yScale_Z(Zx($("#Z2").val()/100)[1]) ]];
  ps_Z3_line = [[ xScale_Z(Zx($("#Z3").val()/100)[0]),  yScale_Z(Zx($("#Z3").val()/100)[1]) ]];

  // --- Trip checks (unchanged) ----------------------------------------------
  const Z_reach1 = $("#Z_ratio").val() * $("#Z_l").val() * $("#Z1").val()/100;
  const Z_reach2 = $("#Z_ratio").val() * $("#Z_l").val() * $("#Z2").val()/100;
  const Z_reach3 = $("#Z_ratio").val() * $("#Z_l").val() * $("#Z3").val()/100;
  const theta0deg = +$("#Z_angle").val();
  const cosDelta = z => Math.cos(DEG2RAD * (angle(z) - theta0deg));

  check_trip = (
    Zabs(za)  < Z_reach1 * cosDelta(za)  ||
    Zabs(zb)  < Z_reach1 * cosDelta(zb)  ||
    Zabs(zc)  < Z_reach1 * cosDelta(zc)  ||
    Zabs(zab) < Z_reach1 * cosDelta(zab) ||
    Zabs(zbc) < Z_reach1 * cosDelta(zbc) ||
    Zabs(zca) < Z_reach1 * cosDelta(zca)
  );

  check_trip2 = (
    ((Zabs(za)  > Z_reach1 * cosDelta(za))  && (Zabs(za)  < Z_reach2 * cosDelta(za)))  ||
    ((Zabs(zb)  > Z_reach1 * cosDelta(zb))  && (Zabs(zb)  < Z_reach2 * cosDelta(zb)))  ||
    ((Zabs(zc)  > Z_reach1 * cosDelta(zc))  && (Zabs(zc)  < Z_reach2 * cosDelta(zc)))  ||
    ((Zabs(zab) > Z_reach1 * cosDelta(zab)) && (Zabs(zab) < Z_reach2 * cosDelta(zab))) ||
    ((Zabs(zbc) > Z_reach1 * cosDelta(zbc)) && (Zabs(zbc) < Z_reach2 * cosDelta(zbc))) ||
    ((Zabs(zca) > Z_reach1 * cosDelta(zca)) && (Zabs(zca) < Z_reach2 * cosDelta(zca)))
  );

  check_trip3 = (
    ((Zabs(za)  > Z_reach2 * cosDelta(za))  && (Zabs(za)  < Z_reach3 * cosDelta(za)))  ||
    ((Zabs(zb)  > Z_reach2 * cosDelta(zb))  && (Zabs(zb)  < Z_reach3 * cosDelta(zb)))  ||
    ((Zabs(zc)  > Z_reach2 * cosDelta(zc))  && (Zabs(zc)  < Z_reach3 * cosDelta(zc)))  ||
    ((Zabs(zab) > Z_reach2 * cosDelta(zab)) && (Zabs(zab) < Z_reach3 * cosDelta(zab))) ||
    ((Zabs(zbc) > Z_reach2 * cosDelta(zbc)) && (Zabs(zbc) < Z_reach3 * cosDelta(zbc))) ||
    ((Zabs(zca) > Z_reach2 * cosDelta(zca)) && (Zabs(zca) < Z_reach3 * cosDelta(zca)))
  );
};


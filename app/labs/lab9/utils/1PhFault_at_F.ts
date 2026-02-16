// Three-Phase Fault Quantities for a Fault at F

import { 
    complexAdd, 
    complexSub, 
    complexAdd3, 
    complexAdd4, 
    complexInverse, 
    complexDivision, 
    complexMultiplication, 
    complexMultiplication3, 
    a, 
    a2, 
    _a, 
    _a2, 
    _I, 
    I, 
    III,
    a_a2, 
    a2_a, 
    a_I, 
    I_a, 
    I_a2, 
    a2_I, 
    O, 
    d0, 
    d1, 
    d2, 
    _d0, 
    _d1, 
    _d2, 
    Seq_012 
} from "./ComplexOperatorAid";

// Complex number interface
interface Complex {
    x: number;
    y: number;
}

// Input parameters interface (these would typically come from props or context)
interface InputParams {
    lineLength: number;
    Z1x: number;
    Z1y: number;
    Z0x: number;
    Z0y: number;
    Z_b: number;
    Z_F: Complex;
    E_F: Complex;
    III: Complex;
    h: number;
    I_h: number;
    Z_S1: Complex;
    Z_E1: Complex;
    Z_U1: Complex;
    Z_S2: Complex;
    Z_E2: Complex;
    Z_U2: Complex;
    Z_S0: Complex;
    Z_E0: Complex;
    Z_U0: Complex;
}

export function Ph_G(inputs: InputParams): {
    Ia0at_F: Complex;
    Ia1at_F: Complex;
    Ia2at_F: Complex;
    Iaat_F: Complex;
    Ibat_F: Complex;
    Icat_F: Complex;
    Ia_bat_F: Complex;
    Ib_cat_F: Complex;
    Ic_aat_F: Complex;
    Va0at_F: Complex;
    Va1at_F: Complex;
    Va2at_F: Complex;
    Vaat_F: Complex;
    Vbat_F: Complex;
    Vcat_F: Complex;
    Va_bat_F: Complex;
    Vb_cat_F: Complex;
    Vc_aat_F: Complex;
    Za_bat_F: Complex;
    Zb_cat_F: Complex;
    Zc_aat_F: Complex;
    Zaat_F: Complex;
    Zbat_F: Complex;
    Zcat_F: Complex;
    Ia0at_R: Complex;
    Ia1at_R: Complex;
    Ia2at_R: Complex;
    Iaat_R: Complex;
    Ibat_R: Complex;
    Icat_R: Complex;
    Ia_bat_R: Complex;
    Ib_cat_R: Complex;
    Ic_aat_R: Complex;
    Va0at_R: Complex;
    Va1at_R: Complex;
    Va2at_R: Complex;
    Vaat_R: Complex;
    Vbat_R: Complex;
    Vcat_R: Complex;
    Va_bat_R: Complex;
    Vb_cat_R: Complex;
    Vc_aat_R: Complex;
    Za_bat_R: Complex;
    Zb_cat_R: Complex;
    Zc_aat_R: Complex;
    Zaat_R: Complex;
    Zbat_R: Complex;
    Zcat_R: Complex;
    Z0at_R: Complex;
    Z1at_R: Complex;
    Z2at_R: Complex;
} {
    const {
        lineLength,
        Z1x,
        Z1y,
        Z0x,
        Z0y,
        Z_b,
        Z_F,
        E_F,
        III,
        h,
        I_h,
        Z_S1,
        Z_E1,
        Z_U1,
        Z_S2,
        Z_E2,
        Z_U2,
        Z_S0,
        Z_E0,
        Z_U0
    } = inputs;

    // Line impedances
    const Z_L1: Complex = { x: lineLength * Z1x / Z_b, y: lineLength * Z1y / Z_b };
    const Z_L2: Complex = { x: lineLength * Z1x / Z_b, y: lineLength * Z1y / Z_b };
    const Z_L0: Complex = { x: lineLength * Z0x / Z_b, y: lineLength * Z0y / Z_b };
    const Z_Fx3: Complex = complexMultiplication(III, Z_F);

    // Positive sequence impedances
    const Zl1: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S1, Z_E1, Z_U1)),
        complexMultiplication(Z_U1, Z_S1)
    );
    const Zj1: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S1, Z_E1, Z_U1)),
        complexMultiplication(Z_S1, Z_E1)
    );
    const Zk1: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S1, Z_E1, Z_U1)),
        complexMultiplication(Z_E1, Z_U1)
    );

    // Negative sequence impedances
    const Zl2: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S2, Z_E2, Z_U2)),
        complexMultiplication(Z_U2, Z_S2)
    );
    const Zj2: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S2, Z_E2, Z_U2)),
        complexMultiplication(Z_S2, Z_E2)
    );
    const Zk2: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S2, Z_E2, Z_U2)),
        complexMultiplication(Z_E2, Z_U2)
    );

    // Zero sequence impedances
    const Zl0: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S0, Z_E0, Z_U0)),
        complexMultiplication(Z_U0, Z_S0)
    );
    const Zj0: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S0, Z_E0, Z_U0)),
        complexMultiplication(Z_S0, Z_E0)
    );
    const Zk0: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S0, Z_E0, Z_U0)),
        complexMultiplication(Z_E0, Z_U0)
    );

    // LEFT BRANCH - Positive sequence
    const Z_M1: Complex = complexAdd(Zj1, complexMultiplication(h, Z_L1));
    // RIGHT BRANCH - Positive sequence
    const Z_N1: Complex = complexAdd(Zk1, complexMultiplication(I_h, Z_L1));

    // Z1 total impedance
    const Z1: Complex = complexAdd(Zl1, complexDivision(complexMultiplication(Z_M1, Z_N1), complexAdd(Z_M1, Z_N1)));

    const C1: Complex = complexDivision(complexMultiplication(I, Z_N1), complexAdd(Z_M1, Z_N1));

    // LEFT BRANCH - Negative sequence
    const Z_M2: Complex = complexAdd(Zj2, complexMultiplication(h, Z_L2));
    // RIGHT BRANCH - Negative sequence
    const Z_N2: Complex = complexAdd(Zk2, complexMultiplication(I_h, Z_L2));

    // Z2 total impedance
    const Z2: Complex = complexAdd(Zl2, complexDivision(complexMultiplication(Z_M2, Z_N2), complexAdd(Z_M2, Z_N2)));

    const C2: Complex = complexDivision(complexMultiplication(I, Z_N2), complexAdd(Z_M2, Z_N2));

    // LEFT BRANCH - Zero sequence
    const Z_M0: Complex = complexAdd(Zj0, complexMultiplication(h, Z_L0));
    // RIGHT BRANCH - Zero sequence
    const Z_N0: Complex = complexAdd(Zk0, complexMultiplication(I_h, Z_L0));

    // Z0 total impedance
    let Z0: Complex = complexAdd(Zl0, complexDivision(complexMultiplication(Z_M0, Z_N0), complexAdd(Z_M0, Z_N0)));
    if (isNaN(Z0.x) && isNaN(Z0.y)) {
        Z0 = { x: 0, y: 0 };
    }

    let C0: Complex = complexDivision(complexMultiplication(I, Z_N0), complexAdd(Z_M0, Z_N0));
    if (isNaN(C0.x) && isNaN(C0.y)) {
        C0 = { x: 0, y: 0 };
    }

    const K: Complex = complexDivision(complexAdd4(Z0, Z1, Z2, Z_Fx3), E_F);

    const Z_F0: Complex = complexAdd(Z_F, complexMultiplication3(h, Z_L0, C0));
    const Z_F1: Complex = complexAdd(Z_F, complexMultiplication3(h, Z_L1, C1));
    const Z_F2: Complex = complexAdd(Z_F, complexMultiplication3(h, Z_L2, C2));
    const Z_2C: Complex = complexAdd(Z2, complexMultiplication3(complexMultiplication(_I, h), Z_L2, C2));
    const Z_0C: Complex = complexAdd(Z0, complexMultiplication3(complexMultiplication(_I, h), Z_L0, C0));

    // Value at F
    const Ia0at_F: Complex = complexDivision(I, K);
    const Ia1at_F: Complex = complexDivision(I, K);
    const Ia2at_F: Complex = complexDivision(I, K);

    const Iaat_F: Complex = complexDivision(III, K);
    const Ibat_F: Complex = complexDivision(O, K);
    const Icat_F: Complex = complexDivision(O, K);

    const Ia_bat_F: Complex = complexDivision(III, K);
    const Ib_cat_F: Complex = complexDivision(O, K);
    const Ic_aat_F: Complex = complexDivision(III, K);

    const Va0at_F: Complex = complexDivision(complexMultiplication(_I, Z0), K);
    const Va1at_F: Complex = complexDivision(complexAdd3(Z_Fx3, Z0, Z2), K);
    const Va2at_F: Complex = complexDivision(complexMultiplication(_I, Z2), K);

    const Vaat_F: Complex = complexDivision(Z_Fx3, K);
    const Vbat_F: Complex = complexDivision(complexAdd3(complexMultiplication3(III, a2, Z_F), complexMultiplication(_d0, Z0), complexMultiplication(d2, Z2)), K);
    const Vcat_F: Complex = complexDivision(complexAdd3(complexMultiplication3(III, a, Z_F), complexMultiplication(d1, Z0), complexMultiplication(_d2, Z2)), K);

    const Va_bat_F: Complex = complexDivision(complexAdd3(complexMultiplication3(III, d0, Z_F), complexMultiplication(d0, Z0), complexMultiplication(_d2, Z2)), K);
    const Vb_cat_F: Complex = complexDivision(complexAdd3(complexMultiplication3(III, d2, Z_F), complexMultiplication(d2, Z0), complexMultiplication({ x: 2, y: 0 }, Z2)), K);
    const Vc_aat_F: Complex = complexDivision(complexAdd3(complexMultiplication3(III, d1, Z_F), complexMultiplication(d1, Z0), complexMultiplication(_d2, Z2)), K);

    // value at R
    const Ia0at_R: Complex = complexDivision(C0, K);
    const Ia1at_R: Complex = complexDivision(C1, K);
    const Ia2at_R: Complex = complexDivision(C2, K);

    const Iaat_R: Complex = complexDivision(complexAdd3(C0, C1, C2), K);
    const Ibat_R: Complex = complexDivision(complexAdd3(C0, complexMultiplication(a2, C1), complexMultiplication(a, C2)), K);
    const Icat_R: Complex = complexDivision(complexAdd3(C0, complexMultiplication(a, C1), complexMultiplication(a2, C2)), K);

    const Ia_bat_R: Complex = complexDivision(complexSub(complexMultiplication(d0, C1), complexMultiplication(d1, C2)), K);
    const Ib_cat_R: Complex = complexDivision(complexSub(complexMultiplication(d2, C1), complexMultiplication(_d2, C2)), K);
    const Ic_aat_R: Complex = complexDivision(complexSub(complexMultiplication(d1, C1), complexMultiplication(_d0, C2)), K);

    const Va0at_R: Complex = complexDivision(complexMultiplication(_I, Z_0C), K);
    const Va1at_R: Complex = complexDivision(complexAdd3(complexAdd3(Z_F0, Z_F1, Z_F2), Z_0C, Z_2C), K);
    const Va2at_R: Complex = complexDivision(complexMultiplication(_I, Z_2C), K);

    const Vaat_R: Complex = complexDivision(complexAdd3(Z_F0, Z_F1, Z_F2), K);
    const Vbat_R: Complex = complexDivision(complexAdd3(complexMultiplication(a2, complexAdd3(Z_F0, Z_F1, Z_F2)), complexMultiplication(_d0, Z_0C), complexMultiplication(d2, Z_2C)), K);
    const Vcat_R: Complex = complexDivision(complexAdd3(complexMultiplication(a, complexAdd3(Z_F0, Z_F1, Z_F2)), complexMultiplication(d1, Z_0C), complexMultiplication(_d2, Z_2C)), K);

    const Va_bat_R: Complex = complexDivision(complexAdd3(complexMultiplication(d0, complexAdd3(Z_F0, Z_F1, Z_F2)), complexMultiplication(d0, Z_0C), complexMultiplication(_d2, Z_2C)), K);
    const Vb_cat_R: Complex = complexDivision(complexAdd3(complexMultiplication(d2, complexAdd3(Z_F0, Z_F1, Z_F2)), complexMultiplication(I, Z_0C), complexMultiplication({ x: 2, y: 0 }, Z_2C)), K);
    const Vc_aat_R: Complex = complexDivision(complexAdd3(complexMultiplication(d1, complexAdd3(Z_F0, Z_F1, Z_F2)), complexMultiplication(d1, Z_0C), complexMultiplication(_d2, Z_2C)), K);

    const Za_bat_R: Complex = complexDivision(Va_bat_R, Ia_bat_R);
    const Zb_cat_R: Complex = complexDivision(Vb_cat_R, Ib_cat_R);
    const Zc_aat_R: Complex = complexDivision(Vc_aat_R, Ic_aat_R);

    const Zaat_R: Complex = complexDivision(Vaat_R, Iaat_R);
    const Zbat_R: Complex = complexDivision(Vbat_R, Ibat_R);
    const Zcat_R: Complex = complexDivision(Vcat_R, Icat_R);

    const Z012: { ZA: Complex; ZB: Complex; ZC: Complex } = {
        ZA: Zaat_R,
        ZB: Zbat_R,
        ZC: Zcat_R
    };

    const Z0at_R: Complex = Seq_012(Z012).Z0;
    const Z1at_R: Complex = Seq_012(Z012).Z1;
    const Z2at_R: Complex = Seq_012(Z012).Z2;

    return {
        Ia0at_F,
        Ia1at_F,
        Ia2at_F,
        Iaat_F,
        Ibat_F,
        Icat_F,
        Ia_bat_F,
        Ib_cat_F,
        Ic_aat_F,
        Va0at_F,
        Va1at_F,
        Va2at_F,
        Vaat_F,
        Vbat_F,
        Vcat_F,
        Va_bat_F,
        Vb_cat_F,
        Vc_aat_F,
        Za_bat_F: { x: 0, y: 0 },
        Zb_cat_F: { x: 0, y: 0 },
        Zc_aat_F: { x: 0, y: 0 },
        Zaat_F: { x: 0, y: 0 },
        Zbat_F: { x: 0, y: 0 },
        Zcat_F: { x: 0, y: 0 },
        Ia0at_R,
        Ia1at_R,
        Ia2at_R,
        Iaat_R,
        Ibat_R,
        Icat_R,
        Ia_bat_R,
        Ib_cat_R,
        Ic_aat_R,
        Va0at_R,
        Va1at_R,
        Va2at_R,
        Vaat_R,
        Vbat_R,
        Vcat_R,
        Va_bat_R,
        Vb_cat_R,
        Vc_aat_R,
        Za_bat_R,
        Zb_cat_R,
        Zc_aat_R,
        Zaat_R,
        Zbat_R,
        Zcat_R,
        Z0at_R,
        Z1at_R,
        Z2at_R
    };
}

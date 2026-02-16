// Three-Phase Fault Quantities for a Fault at F

import {
    PI_to_Y,
    convertToPolar,
    convertToCartesian,
    complexAdd,
    complexSub,
    complexAdd3,
    complexAdd4,
    complexDivision,
    complexMultiplication,
    complexMultiplication3,
    a,
    a2,
    _a,
    _a2,
    _I,
    I,
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
    Seq_012,
    Complex,
    ComplexInput
} from "./ComplexOperatorAid";

// Input parameters interface
interface InputParams {
    lineLength: number;
    Z1x: number;
    Z1y: number;
    Z0x: number;
    Z0y: number;
    Z_b: number;
    Z_F: Complex;
    E_F: Complex;
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

export function ThreePhaseFault(inputs: InputParams): {
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

    const Z_L1: Complex = { x: lineLength * Z1x / Z_b, y: lineLength * Z1y / Z_b };
    const Z_L2: Complex = { x: lineLength * Z1x / Z_b, y: lineLength * Z1y / Z_b };

    const Zl: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S1, Z_E1, Z_U1)),
        complexMultiplication(Z_U1, Z_S1)
    );
    const Zj: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S1, Z_E1, Z_U1)),
        complexMultiplication(Z_S1, Z_E1)
    );
    const Zk: Complex = complexMultiplication(
        complexDivision(I, complexAdd3(Z_S1, Z_E1, Z_U1)),
        complexMultiplication(Z_E1, Z_U1)
    );

    // LEFT BRANCH
    const Z_M: Complex = complexAdd(Zj, complexMultiplication(h, Z_L1));
    // RIGHT BRANCH
    const Z_N: Complex = complexAdd(Zk, complexMultiplication(I_h, Z_L1));
    // Z1 total impedance

    const Z1: Complex = complexAdd(Zl, complexDivision(complexMultiplication(Z_M, Z_N), complexAdd(Z_M, Z_N)));

    const C1: Complex = complexDivision(complexMultiplication(I, Z_N), complexAdd(Z_M, Z_N));

    const K: Complex = complexDivision(complexAdd(Z1, Z_F), E_F);

    const Z_F1: Complex = complexAdd(Z_F, complexMultiplication(complexMultiplication(h, Z_L1), C1));

    // Value at F
    const Ia0at_F: Complex = complexDivision(O, K);
    const Ia1at_F: Complex = complexDivision(I, K);
    const Ia2at_F: Complex = complexDivision(O, K);

    const Iaat_F: Complex = complexDivision(I, K);
    const Ibat_F: Complex = complexDivision(a2, K);
    const Icat_F: Complex = complexDivision(a, K);

    const Ia_bat_F: Complex = complexDivision(I_a2, K);
    const Ib_cat_F: Complex = complexDivision(a2_a, K);
    const Ic_aat_F: Complex = complexDivision(a_I, K);

    const Va0at_F: Complex = complexDivision(O, K);
    const Va1at_F: Complex = complexDivision(Z_F, K);
    const Va2at_F: Complex = complexDivision(O, K);

    const Vaat_F: Complex = complexDivision(Z_F, K);
    const Vbat_F: Complex = complexDivision(complexMultiplication(a2, Z_F), K);
    const Vcat_F: Complex = complexDivision(complexMultiplication(a, Z_F), K);

    const Va_bat_F: Complex = complexDivision(complexMultiplication(I_a2, Z_F), K);
    const Vb_cat_F: Complex = complexDivision(complexMultiplication(a2_a, Z_F), K);
    const Vc_aat_F: Complex = complexDivision(complexMultiplication(a_I, Z_F), K);

    const Za_bat_F: Complex = Z_F;
    const Zb_cat_F: Complex = Z_F;
    const Zc_aat_F: Complex = Z_F;

    const Zaat_F: Complex = complexDivision(Vaat_F, Iaat_F);
    const Zbat_F: Complex = complexDivision(Vbat_F, Ibat_F);
    const Zcat_F: Complex = complexDivision(Vcat_F, Icat_F);

    // value at R
    const Ia0at_R: Complex = complexDivision(complexMultiplication(O, C1), K);
    const Ia1at_R: Complex = complexDivision(complexMultiplication(I, C1), K);
    const Ia2at_R: Complex = complexDivision(complexMultiplication(O, C1), K);

    const Iaat_R: Complex = complexDivision(complexMultiplication(I, C1), K);
    const Ibat_R: Complex = complexDivision(complexMultiplication(a2, C1), K);
    const Icat_R: Complex = complexDivision(complexMultiplication(a, C1), K);

    const Ia_bat_R: Complex = complexDivision(complexMultiplication(I_a2, C1), K);
    const Ib_cat_R: Complex = complexDivision(complexMultiplication(a2_a, C1), K);
    const Ic_aat_R: Complex = complexDivision(complexMultiplication(a_I, C1), K);

    const Va0at_R: Complex = complexDivision(O, K);
    const Va1at_R: Complex = complexDivision(Z_F1, K);
    const Va2at_R: Complex = complexDivision(O, K);

    const Vaat_R: Complex = complexDivision(Z_F1, K);
    const Vbat_R: Complex = complexDivision(complexMultiplication(a2, Z_F1), K);
    const Vcat_R: Complex = complexDivision(complexMultiplication(a, Z_F1), K);

    const Va_bat_R: Complex = complexDivision(complexMultiplication(I_a2, Z_F1), K);
    const Vb_cat_R: Complex = complexDivision(complexMultiplication(a2_a, Z_F1), K);
    const Vc_aat_R: Complex = complexDivision(complexMultiplication(a_I, Z_F1), K);

    const Za_bat_R: Complex = complexDivision(Z_F1, C1);
    const Zb_cat_R: Complex = complexDivision(Z_F1, C1);
    const Zc_aat_R: Complex = complexDivision(Z_F1, C1);

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
        Za_bat_F,
        Zb_cat_F,
        Zc_aat_F,
        Zaat_F,
        Zbat_F,
        Zcat_F,
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

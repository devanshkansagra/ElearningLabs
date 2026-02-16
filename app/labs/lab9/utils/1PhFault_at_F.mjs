
//Three-Phase Fault Quantities for a Fault at F

import { complexAdd,complexSub, complexAdd3, complexAdd4, complexInverse, complexDivision, complexMultiplication, complexMultiplication3, a, a2, _a, _a2, _I, I, a_a2, a2_a, a_I, I_a, I_a2, a2_I, O, d0, d1, d2, _d0, _d1, _d2, Seq_012 } from "../js/ComplexOperatorAid.mjs";

export function Ph_G() {

Z_L1 = {x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b}; Z_L2 = {x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b};Z_L0 = {x:lineLength*Z0x/Z_b,y:lineLength*Z0y/Z_b};
Z_Fx3 = complexMultiplication(III,Z_F)

            Zl1 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S1,Z_E1,Z_U1)),
                complexMultiplication(Z_U1,Z_S1));
            Zj1 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S1,Z_E1,Z_U1)),
                complexMultiplication(Z_S1,Z_E1));
            Zk1 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S1,Z_E1,Z_U1)),
                complexMultiplication(Z_E1,Z_U1));

            Zl2 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S2,Z_E2,Z_U2)),
                complexMultiplication(Z_U2,Z_S2));
            Zj2 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S2,Z_E2,Z_U2)),
                complexMultiplication(Z_S2,Z_E2));
            Zk2 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S2,Z_E2,Z_U2)),
                complexMultiplication(Z_E2,Z_U2));

            Zl0 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S0,Z_E0,Z_U0)),
                complexMultiplication(Z_U0,Z_S0));
            Zj0 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S0,Z_E0,Z_U0)),
                complexMultiplication(Z_S0,Z_E0));
            Zk0 = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S0,Z_E0,Z_U0)),
                complexMultiplication(Z_E0,Z_U0));
            
//LEFT BRANCH
Z_M1 = complexAdd(Zj1,complexMultiplication(h,Z_L1));
//RIGHT BRANCH
Z_N1 = complexAdd(Zk1,complexMultiplication(I_h,Z_L1));

// Z1 total impedance

Z1 = complexAdd(Zl1,complexDivision(complexMultiplication(Z_M1,Z_N1),complexAdd(Z_M1,Z_N1)));


C1 = complexDivision(complexMultiplication(I,Z_N1),complexAdd(Z_M1,Z_N1));

//LEFT BRANCH
Z_M2 = complexAdd(Zj2,complexMultiplication(h,Z_L2));
//RIGHT BRANCH
Z_N2 = complexAdd(Zk2,complexMultiplication(I_h,Z_L2));

// Z1 total impedance

Z2 = complexAdd(Zl2,complexDivision(complexMultiplication(Z_M2,Z_N2),complexAdd(Z_M2,Z_N2)));



C2 = complexDivision(complexMultiplication(I,Z_N2),complexAdd(Z_M2,Z_N2));


//LEFT BRANCH
Z_M0 = complexAdd(Zj0,complexMultiplication(h,Z_L0));
//RIGHT BRANCH
Z_N0 = complexAdd(Zk0,complexMultiplication(I_h,Z_L0));

// Z1 total impedance

Z0 = complexAdd(Zl0,complexDivision(complexMultiplication(Z_M0,Z_N0),complexAdd(Z_M0,Z_N0)));
if (isNaN(Z0.x) && isNaN(Z0.y)) {
    Z0 = {x: 0, y: 0};
  }

C0 = complexDivision(complexMultiplication(I,Z_N0),complexAdd(Z_M0,Z_N0));
if (isNaN(C0.x) && isNaN(C0.y)) {
    C0 = {x: 0, y: 0};
  }

K = complexDivision(complexAdd4(Z0,Z1,Z2,Z_Fx3),E_F);

Z_F0 = complexAdd(Z_F,complexMultiplication3(h,Z_L0,C0));
Z_F1 = complexAdd(Z_F,complexMultiplication3(h,Z_L1,C1));
Z_F2 = complexAdd(Z_F,complexMultiplication3(h,Z_L2,C2));
Z_2C = complexAdd(Z2,complexMultiplication3(complexMultiplication(_I,h),Z_L2,C2));
Z_0C = complexAdd(Z0,complexMultiplication3(complexMultiplication(_I,h),Z_L0,C0));

//Value at F
Ia0at_F = complexDivision(I,K);
Ia1at_F = complexDivision(I,K);
Ia2at_F = complexDivision(I,K);

Iaat_F = complexDivision(III,K);
Ibat_F = complexDivision(O,K);
Icat_F = complexDivision(O,K);

Ia_bat_F = complexDivision(III,K);
Ib_cat_F = complexDivision(O,K);
Ic_aat_F = complexDivision(_3,K);

Va0at_F =  complexDivision(complexMultiplication(_I,Z0),K);
Va1at_F =  complexDivision(complexAdd3(Z_Fx3,Z0,Z2),K);
Va2at_F =  complexDivision(complexMultiplication(_I,Z2),K);

Vaat_F = complexDivision(Z_Fx3,K);
Vbat_F = complexDivision(complexAdd3(complexMultiplication3(III,a2,Z_F),complexMultiplication(_d0,Z0),complexMultiplication(d2,Z2)),K);
Vcat_F = complexDivision(complexAdd3(complexMultiplication3(III,a,Z_F),complexMultiplication(d1,Z0),complexMultiplication(_d2,Z2)),K);

Va_bat_F = complexDivision(complexAdd3(complexMultiplication3(III,d0,Z_F),complexMultiplication(d0,Z0),complexMultiplication(_d2,Z2)),K);
Vb_cat_F = complexDivision(complexAdd3(complexMultiplication3(III,d2,Z_F),complexMultiplication(d2,Z0),complexMultiplication({x:2,y:0},Z2)),K);
Vc_aat_F = complexDivision(complexAdd3(complexMultiplication3(III,d1,Z_F),complexMultiplication(d1,Z0),complexMultiplication(_d2,Z2)),K);

//value at R
Ia0at_R = complexDivision(C0,K);
Ia1at_R = complexDivision(C1,K);
Ia2at_R = complexDivision(C2,K);

Iaat_R = complexDivision(complexAdd3(C0,C1,C2),K);
Ibat_R = complexDivision(complexAdd3(C0,complexMultiplication(a2,C1),complexMultiplication(a,C2)),K);
Icat_R = complexDivision(complexAdd3(C0,complexMultiplication(a,C1),complexMultiplication(a2,C2)),K);

Ia_bat_R = complexDivision(complexSub(complexMultiplication(d0,C1),complexMultiplication(d1,C2)),K);
Ib_cat_R = complexDivision(complexSub(complexMultiplication(d2,C1),complexMultiplication(_d2,C2)),K);
Ic_aat_R = complexDivision(complexSub(complexMultiplication(d1,C1),complexMultiplication(_d0,C2)),K);

Va0at_R =  complexDivision(complexMultiplication(_I,Z_0C),K);
Va1at_R =  complexDivision(complexAdd3(complexAdd3(Z_F0,Z_F1,Z_F2),Z_0C,Z_2C),K);
Va2at_R =  complexDivision(complexMultiplication(_I,Z_2C),K);

Vaat_R = complexDivision(complexAdd3(Z_F0,Z_F1,Z_F2),K);
Vbat_R = complexDivision(complexAdd3(complexMultiplication(a2,complexAdd3(Z_F0,Z_F1,Z_F2)),complexMultiplication(_d0,Z_0C),complexMultiplication(d2,Z_2C)),K);
Vcat_R = complexDivision(complexAdd3(complexMultiplication(a,complexAdd3(Z_F0,Z_F1,Z_F2)),complexMultiplication(d1,Z_0C),complexMultiplication(_d2,Z_2C)),K);

Va_bat_R = complexDivision(complexAdd3(complexMultiplication(d0,complexAdd3(Z_F0,Z_F1,Z_F2)),complexMultiplication(d0,Z_0C),complexMultiplication(_d2,Z_2C)),K);
Vb_cat_R = complexDivision(complexAdd3(complexMultiplication(d2,complexAdd3(Z_F0,Z_F1,Z_F2)),complexMultiplication(I,Z_0C),complexMultiplication({x:2,y:0},Z_2C)),K);
Vc_aat_R = complexDivision(complexAdd3(complexMultiplication(d1,complexAdd3(Z_F0,Z_F1,Z_F2)),complexMultiplication(d1,Z_0C),complexMultiplication(_d2,Z_2C)),K);

Za_bat_R = complexDivision(Va_bat_R,Ia_bat_R);
Zb_cat_R = complexDivision(Vb_cat_R,Ib_cat_R);
Zc_aat_R = complexDivision(Vc_aat_R,Ic_aat_R);

Zaat_R = complexDivision(Vaat_R,Iaat_R);
Zbat_R = complexDivision(Vbat_R,Ibat_R);
Zcat_R = complexDivision(Vcat_R,Icat_R);

let Z012 = {
    ZA : Zaat_R,
    ZB : Zbat_R,
    ZC : Zcat_R
}

Z0at_R = Seq_012(Z012).Z0;
Z1at_R = Seq_012(Z012).Z1;
Z2at_R = Seq_012(Z012).Z2;

    return {
        Ia0at_F, Ia1at_F, Ia2at_F,
        Iaat_F, Ibat_F, Icat_F,
        Ia_bat_F, Ib_cat_F, Ic_aat_F, 
        Va0at_F, Va1at_F, Va2at_F, 
        Vaat_F, Vbat_F, Vcat_F, 
        Va_bat_F, Vb_cat_F, Vc_aat_F, 
        Za_bat_F, Zb_cat_F, Zc_aat_F, 
        Zaat_F, Zbat_F, Zcat_F, 
        
        Ia0at_R, Ia1at_R, Ia2at_R, 
        Iaat_R, Ibat_R, Icat_R, 
        Ia_bat_R, Ib_cat_R, Ic_aat_R, 
        Va0at_R, Va1at_R, Va2at_R, 
        Vaat_R, Vbat_R, Vcat_R, 
        Va_bat_R, Vb_cat_R, Vc_aat_R, 
        Za_bat_R, Zb_cat_R, Zc_aat_R, 
        Zaat_R, Zbat_R, Zcat_R, 
        Z0at_R, Z1at_R, Z2at_R  
    };

}
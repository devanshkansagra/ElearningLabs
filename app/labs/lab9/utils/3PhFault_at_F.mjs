
//Three-Phase Fault Quantities for a Fault at F

import { PI_to_Y,convertToPolar, convertToCartesian, complexAdd,complexSub, complexAdd3, complexAdd4, complexDivision, complexMultiplication, complexMultiplication3, a, a2, _a, _a2, _I, I, a_a2, a2_a, a_I, I_a, I_a2, a2_I, O, d0,d1,d2, _d0, _d1, _d2, Seq_012 } from "../js/ComplexOperatorAid.mjs";


export function ThreePhaseFault() { 

Z_L1 = {x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b}; Z_L2 = {x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b};

            Zl = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S1,Z_E1,Z_U1)),
                complexMultiplication(Z_U1,Z_S1));
            Zj = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S1,Z_E1,Z_U1)),
                complexMultiplication(Z_S1,Z_E1));
            Zk = complexMultiplication(
                complexDivision(I,complexAdd3(Z_S1,Z_E1,Z_U1)),
                complexMultiplication(Z_E1,Z_U1));


//LEFT BRANCH
Z_M = complexAdd(Zj,complexMultiplication(h,Z_L1));
//RIGHT BRANCH
Z_N = complexAdd(Zk,complexMultiplication(I_h,Z_L1));
// Z1 total impedance

Z1 = complexAdd(Zl,complexDivision(complexMultiplication(Z_M,Z_N),complexAdd(Z_M,Z_N)));



C1 = complexDivision(complexMultiplication(I,Z_N),complexAdd(Z_M,Z_N));


K = complexDivision(complexAdd(Z1,Z_F),E_F);



Z_F1 = complexAdd(Z_F,complexMultiplication(complexMultiplication(h,Z_L1),C1));

//Value at F
Ia0at_F = complexDivision(O,K);
Ia1at_F = complexDivision(I,K);
Ia2at_F = complexDivision(O,K);

Iaat_F = complexDivision(I,K);
Ibat_F = complexDivision(a2,K);
Icat_F = complexDivision(a,K);

Ia_bat_F = complexDivision(I_a2,K);
Ib_cat_F = complexDivision(a2_a,K);
Ic_aat_F = complexDivision(a_I,K);

Va0at_F =  complexDivision(O,K);
Va1at_F =  complexDivision(Z_F,K);
Va2at_F =  complexDivision(O,K);

Vaat_F = complexDivision(Z_F,K);
Vbat_F = complexDivision(complexMultiplication(a2,Z_F),K);
Vcat_F = complexDivision(complexMultiplication(a,Z_F),K);

Va_bat_F = complexDivision(complexMultiplication(I_a2,Z_F),K);
Vb_cat_F = complexDivision(complexMultiplication(a2_a,Z_F),K);
Vc_aat_F = complexDivision(complexMultiplication(a_I,Z_F),K);

Za_bat_F = Z_F;
Zb_cat_F = Z_F;
Zc_aat_F = Z_F;

Zaat_F = complexDivision(Vaat_F,Iaat_F);
Zbat_F = complexDivision(Vbat_F,Ibat_F);
Zcat_F = complexDivision(Vcat_F,Icat_F);

//value at R
Ia0at_R = complexDivision(complexMultiplication(O,C1),K);
Ia1at_R = complexDivision(complexMultiplication(I,C1),K);
Ia2at_R = complexDivision(complexMultiplication(O,C1),K);

Iaat_R = complexDivision(complexMultiplication(I,C1),K);
Ibat_R = complexDivision(complexMultiplication(a2,C1),K);
Icat_R = complexDivision(complexMultiplication(a,C1),K);

Ia_bat_R = complexDivision(complexMultiplication(I_a2,C1),K);
Ib_cat_R = complexDivision(complexMultiplication(a2_a,C1),K);
Ic_aat_R = complexDivision(complexMultiplication(a_I,C1),K);

Va0at_R =  complexDivision(O,K);
Va1at_R =  complexDivision(Z_F1,K);
Va2at_R =  complexDivision(O,K);

Vaat_R = complexDivision(Z_F1,K); 
Vbat_R = complexDivision(complexMultiplication(a2,Z_F1),K);
Vcat_R = complexDivision(complexMultiplication(a,Z_F1),K);

Va_bat_R = complexDivision(complexMultiplication(I_a2,Z_F1),K);
Vb_cat_R = complexDivision(complexMultiplication(a2_a,Z_F1),K);
Vc_aat_R = complexDivision(complexMultiplication(a_I ,Z_F1),K);

Za_bat_R = complexDivision(Z_F1,C1);
Zb_cat_R = complexDivision(Z_F1,C1);
Zc_aat_R = complexDivision(Z_F1,C1);




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
    Zaat_R, Zbat_R, Zcat_R , 
    Z0at_R, Z1at_R, Z2at_R 
};

}

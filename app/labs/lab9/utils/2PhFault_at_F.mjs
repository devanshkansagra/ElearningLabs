
import { PI_to_Y,convertToPolar, convertToCartesian, complexAdd,complexSub, complexAdd3, complexAdd4, complexDivision, complexMultiplication, complexMultiplication3, a, a2, _a, _a2, _I, I, a_a2, a2_a, a_I, I_a, I_a2, a2_I, O, d0,d1,d2, _d0, _d1, _d2, Seq_012  } from "../js/ComplexOperatorAid.mjs";


export function Ph_Ph() {
let Z_L1 = {x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b}; let Z_L2 = {x:lineLength*Z1x/Z_b,y:lineLength*Z1y/Z_b};

            Zl1 = complexDivision(complexMultiplication(Z_U1,Z_S1),complexAdd3(Z_S1,Z_E1,Z_U1));
            Zj1 = complexDivision(complexMultiplication(Z_S1,Z_E1),complexAdd3(Z_S1,Z_E1,Z_U1));
            Zk1 = complexDivision(complexMultiplication(Z_E1,Z_U1),complexAdd3(Z_S1,Z_E1,Z_U1));
                 
            Zl2 = complexDivision(complexMultiplication(Z_U2,Z_S2),complexAdd3(Z_S2,Z_E2,Z_U2));
            Zj2 = complexDivision(complexMultiplication(Z_S2,Z_E2),complexAdd3(Z_S2,Z_E2,Z_U2));
            Zk2 = complexDivision(complexMultiplication(Z_E2,Z_U2),complexAdd3(Z_S2,Z_E2,Z_U2));

//LEFT BRANCH
Z_M1 = complexAdd(PI_to_Y(Z_S1,Z_E1,Z_U1).Zj,complexMultiplication(h,Z_L1));

//RIGHT BRANCH
Z_N1 = complexAdd(PI_to_Y(Z_S1,Z_E1,Z_U1).Zk,complexMultiplication(I_h,Z_L1));

// Z1 total impedance

Z1 = complexAdd(Zl1,complexDivision(complexMultiplication(Z_M1,Z_N1),complexAdd(Z_M1,Z_N1)));


C1 = complexDivision(Z_N1,complexAdd(Z_M1,Z_N1));


//LEFT BRANCH
Z_M2 = complexAdd(Zj2,complexMultiplication(h,Z_L2));
//RIGHT BRANCH
Z_N2 = complexAdd(Zk2,complexMultiplication(I_h,Z_L2));

// Z2 total impedance

Z2 = complexAdd(Zl2,complexDivision(complexMultiplication(Z_M2,Z_N2),complexAdd(Z_M2,Z_N2)));



C2 = complexDivision(complexMultiplication(I,Z_N2),complexAdd(Z_M2,Z_N2));
K = complexDivision(complexAdd3(Z1,Z2,Z_F),E_F);


Z_F1 = complexAdd(Z_F,complexMultiplication3(h,Z_L1,C1));

Z_2C = complexAdd(Z2,complexMultiplication3(complexMultiplication(_I,h),Z_L2,C2));


//Value at F
Ia0at_F = complexDivision(O,K);
Ia1at_F = complexDivision(I,K);
Ia2at_F = complexDivision(_I,K);

Iaat_F = complexDivision(O      ,K);
Ibat_F = complexDivision(a2_a   ,K);
Icat_F = complexDivision(a_a2   ,K);

Ia_bat_F = complexDivision(a_a2                                 ,K);
Ib_cat_F = complexDivision(complexMultiplication({x:2,y:0},a2_a),K);
Ic_aat_F = complexDivision(a_a2                                 ,K);

Va0at_F =  complexDivision(O,K);
Va1at_F =  complexDivision(complexAdd(Z_F,Z2),K);
Va2at_F =  complexDivision(Z2,K);

Vaat_F = complexDivision(complexAdd(Z_F,complexMultiplication({x:2,y:0},Z2)),K);
Vbat_F = complexDivision(complexAdd(complexMultiplication(a2,Z_F),complexMultiplication(_I,Z2)),K);
Vcat_F = complexDivision(complexAdd(complexMultiplication(a,Z_F),complexMultiplication(_I,Z2)),K);

Va_bat_F = complexDivision(complexAdd(complexMultiplication(I_a2,Z_F),complexMultiplication({x:3,y:0},Z2))  ,K);
Vb_cat_F = complexDivision(complexMultiplication(a2_a,Z_F)                                                  ,K);
Vc_aat_F = complexDivision(complexAdd(complexMultiplication(a_I,Z_F),complexMultiplication({x:-3,y:0},Z2))  ,K);


//value at R
Ia0at_R = complexDivision(complexMultiplication(O,C1),K);
Ia1at_R = complexDivision(complexMultiplication(I,C1),K);
Ia2at_R = complexDivision(complexMultiplication(_I,C2),K);

Iaat_R = complexDivision(complexSub(C1,C2),K);
Ibat_R = complexDivision(complexSub(complexMultiplication(a2,C1),complexMultiplication(a,C2)),K);
Icat_R = complexDivision(complexSub(complexMultiplication(a,C1),complexMultiplication(a2,C2)),K);

Ia_bat_R = complexDivision(complexAdd(complexMultiplication(I_a2,C1),complexMultiplication(a_I,C2)),K);
Ib_cat_R = complexDivision(complexMultiplication(a2_a,complexAdd(C1,C2)),K);
Ic_aat_R = complexDivision(complexAdd(complexMultiplication(a_I,C1),complexMultiplication(I_a2,C2)),K);

Va0at_R =  complexDivision(O,K);
Va1at_R =  complexDivision(complexAdd(Z_F1,Z_2C),K);
Va2at_R =  complexDivision(Z_2C,K);

Vaat_R = complexDivision(complexAdd3(Z_F1,Z2,Z_2C),K);
Vbat_R = complexDivision(complexAdd(complexMultiplication(a2,complexAdd(Z_F1,Z2)),complexMultiplication(a,Z_2C)),K);
Vcat_R = complexDivision(complexAdd(complexMultiplication(a,complexAdd(Z_F1,Z2)),complexMultiplication(a2,Z_2C)),K);

Va_bat_R = complexDivision(complexAdd(complexMultiplication(I_a2,complexAdd(Z_F1,Z2)),complexMultiplication(I_a,Z_2C)),K); 
Vb_cat_R = complexDivision(complexMultiplication(a2_a,complexAdd3(Z_F1,Z2,complexMultiplication(_I,Z_2C))),K);
Vc_aat_R = complexDivision(complexAdd(complexMultiplication(a_I,complexAdd(Z_F1,Z2)),complexMultiplication(a2_I,Z_2C)),K);

Za_bat_R = complexDivision(Va_bat_R,Ia_bat_R);
Zb_cat_R = complexDivision(Vb_cat_R,Ib_cat_R);
Zc_aat_R = complexDivision(Vc_aat_R,Ic_aat_R);

// for bc fault Set to 0
Zaat_R = {x:0,y:0};
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
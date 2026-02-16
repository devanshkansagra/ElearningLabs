import * as d3 from 'd3'

export function textDecorationAndSymbols(){

        d3.select(".vis_inner_V_svg").append("path").attr("d", "M 520,288 A 15,15 0 1 1 530,313").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none").style("marker-end", "url(#markc-arc)");
        d3.select(".vis_inner_V_svg").append("path").attr("d", "m 530,295 0,10").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none");
        d3.select(".vis_inner_V_svg").append("path").attr("d", "m 525,300 10,0").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none");

        d3.select(".vis_inner_I_svg").append("path").attr("d", "M 520,288 A 15,15 0 1 1 530,313").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none").style("marker-end", "url(#markc-arc)");
        d3.select(".vis_inner_I_svg").append("path").attr("d", "m 530,295 0,10").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none");
        d3.select(".vis_inner_I_svg").append("path").attr("d", "m 525,300 10,0").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none");

        d3.select(".vis_inner_Z_svg").append("path").attr("d", "M 515,313 A 15,15 0 1 0 505,288").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none").style("marker-end", "url(#markc-arc)");
        d3.select(".vis_inner_Z_svg").append("path").attr("d", "m 515,295 0,10").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none");
        d3.select(".vis_inner_Z_svg").append("path").attr("d", "m 510,300 10,0").attr("stroke", "darkgrey").attr("stroke-width", 2).attr("fill", "none");

  const KN_W = w / 4, KN_H = h / 4;       // same ratios used to build the canvas
  const arcX = KN_W - 20, arcY = KN_H - 20, r = 10;

  d3.select(".vis_KN_svg")
    .append("path")
    .attr("d", `M ${arcX},${arcY} A ${r},${r} 0 1 0 ${arcX - 5},${arcY - 15}`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .style("marker-end", "url(#markc-arc)");

  d3.select(".vis_KN_svg")
    .append("path")
    .attr("d", `m ${arcX},${arcY - 12} 0,10`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  d3.select(".vis_KN_svg")
    .append("path")
    .attr("d", `m ${arcX - 5},${arcY - 7} 10,0`)
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("fill", "none");;

        d3.select("#components_Z_row4").append("table").selectAll("tr").data(data_id_ZA_ZB_ZC_1).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        d3.select("#components_Z_row5").append("table").selectAll("tr").data(data_id_ZA_ZB_ZC_2).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        d3.select("#components_Z_row6").append("table").selectAll("tr").data(data_id_ZA_ZB_ZC_3).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
  
        d3.select("#components_Z_row4_Ph2Ph").append("table").selectAll("tr").data(data_id_ZAB_ZBC_ZCA_1).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        d3.select("#components_Z_row5_Ph2Ph").append("table").selectAll("tr").data(data_id_ZAB_ZBC_ZCA_2).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        d3.select("#components_Z_row6_Ph2Ph").append("table").selectAll("tr").data(data_id_ZAB_ZBC_ZCA_3).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
       
        // data_id_VA_VB_VC_1=[["va_before","equala_V","ampva","angva"]]; data_id_VA_VB_VC_2=[["vb_before","equalb_V","ampvb","angvb"]]; data_id_VA_VB_VC_3=[["vc_before","equalc_V","ampvc","angvc"]];

        // d3.select("#components_V_row4").append("table").selectAll("tr").data(data_id_VA_VB_VC_1).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_V_row5").append("table").selectAll("tr").data(data_id_VA_VB_VC_2).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_V_row6").append("table").selectAll("tr").data(data_id_VA_VB_VC_3).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});

        // data_id_IA_IB_IC_1=[["ia_before","equala_I","ampia","angia"]]; data_id_IA_IB_IC_2=[["ib_before","equalb_I","ampib","angib"]]; data_id_IA_IB_IC_3=[["ic_before","equalc_I","ampic","angic"]];

        // d3.select("#components_I_row4").append("table").selectAll("tr").data(data_id_IA_IB_IC_1).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_I_row5").append("table").selectAll("tr").data(data_id_IA_IB_IC_2).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_I_row6").append("table").selectAll("tr").data(data_id_IA_IB_IC_3).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});

        // data_id_V0_V1_V2_1 = [["v0_before", "equal0", "ampv0", "angv0"]];data_id_V0_V1_V2_2 = [["v1_before", "equal1", "ampv1", "ang1"]];data_id_V0_V1_V2_3 = [["v2_before", "equal2", "ampv2", "angv2"]];

        // d3.select("#components_V_I_row1").append("table").attr("class","table").selectAll("tr").data(data_id_V0_V1_V2_1).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_V_I_row2").append("table").attr("class","table").selectAll("tr").data(data_id_V0_V1_V2_2).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_V_I_row3").append("table").attr("class","table").selectAll("tr").data(data_id_V0_V1_V2_3).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});

        // data_id_I0_I1_I2_1 = [["i0_before", "equal0_I", "ampi0", "angi0"]];data_id_I0_I1_I2_2 = [["i1_before", "equal1_I", "ampi1", "angi1"]];data_id_I0_I1_I2_3 = [["i2_before", "equal2_I", "ampi2", "angi2"]];

        // d3.select("#components_V_I_row4").append("table").attr("class","table").selectAll("tr").data(data_id_I0_I1_I2_1).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_V_I_row5").append("table").attr("class","table").selectAll("tr").data(data_id_I0_I1_I2_2).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
        // d3.select("#components_V_I_row6").append("table").attr("class","table").selectAll("tr").data(data_id_I0_I1_I2_3).enter().append("tr").selectAll("td").data(function(d){return d;}).enter().append("td").attr("id",function(d){return d;});
}

export function addArrows() {
        
        Vmarker(vis_inner_V, ["marka", "markb", "markc", "markab", "markbc", "markca", "mark2", "mark1", "mark0", "markc-arc", "markKN", "markPol"], 5, currentMarkerType);

        Vmarker(vis_inner_I, ["markai", "markbi", "markci", "markabi", "markbci", "markcai", "mark2i", "mark1i", "mark0i"], 5, currentMarkerType);


        Vmarker(vis_inner_Z, ["markaz", "markbz", "markcz", "markabz", "markbcz", "markcaz"], 5, currentMarkerType);
        Vmarker(vis_KN, ["markKN"], 5, currentMarkerType);

}
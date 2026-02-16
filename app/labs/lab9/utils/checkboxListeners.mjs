import { PI_to_Y,convertToPolar, convertToCartesian, complexAdd,complexSub, complexAdd3, complexAdd4, complexDivision, complexMultiplication, complexMultiplication3, a, a2, _a, _a2, _I, I, a_a2, a2_a, a_I, I_a, I_a2, a2_I, O, d0,d1,d2, _d0, _d1, _d2, Seq_012  } from "../js/ComplexOperatorAid.mjs";
import { ThreePhaseFault } from "./3PhFault_at_F.mjs";
import { Ph_Ph } from "./2PhFault_at_F.mjs";
import { Ph_G } from "./1PhFault_at_F.mjs";
import {
  onInputChanged,
  updateMainVisualization,
  updateInputFields,
} from "./index.js";

export function assignValue_I_V_input(
  selectAll_I_V_input,
  objectCopy1PhaseFault
) {
  selectAll_I_V_input[0].value = objectCopy1PhaseFault.Zaat_R.x.toFixed(2);
  selectAll_I_V_input[1].value = objectCopy1PhaseFault.Zaat_R.y.toFixed(2);
  selectAll_I_V_input[2].value = objectCopy1PhaseFault.Zbat_R.x.toFixed(2);
  selectAll_I_V_input[3].value = objectCopy1PhaseFault.Zbat_R.y.toFixed(2);
  selectAll_I_V_input[4].value = objectCopy1PhaseFault.Zcat_R.x.toFixed(2);
  selectAll_I_V_input[5].value = objectCopy1PhaseFault.Zcat_R.y.toFixed(2);
  selectAll_I_V_input[6].value = objectCopy1PhaseFault.Z0at_R.x.toFixed(2);
  selectAll_I_V_input[7].value = objectCopy1PhaseFault.Z0at_R.y.toFixed(2);
  selectAll_I_V_input[8].value = objectCopy1PhaseFault.Z1at_R.x.toFixed(2);
  selectAll_I_V_input[9].value = objectCopy1PhaseFault.Z1at_R.y.toFixed(2);
  selectAll_I_V_input[10].value = objectCopy1PhaseFault.Z2at_R.x.toFixed(2);
  selectAll_I_V_input[11].value = objectCopy1PhaseFault.Z2at_R.y.toFixed(2);
  selectAll_I_V_input[12].value = objectCopy1PhaseFault.Vaat_R.x.toFixed(2);
  selectAll_I_V_input[13].value = objectCopy1PhaseFault.Vaat_R.y.toFixed(2);
  selectAll_I_V_input[14].value = objectCopy1PhaseFault.Vbat_R.x.toFixed(2);
  selectAll_I_V_input[15].value = objectCopy1PhaseFault.Vbat_R.y.toFixed(2);
  selectAll_I_V_input[16].value = objectCopy1PhaseFault.Vcat_R.x.toFixed(2);
  selectAll_I_V_input[17].value = objectCopy1PhaseFault.Vcat_R.y.toFixed(2);
  selectAll_I_V_input[18].value = objectCopy1PhaseFault.Iaat_R.x.toFixed(2);
  selectAll_I_V_input[19].value = objectCopy1PhaseFault.Iaat_R.y.toFixed(2);
  selectAll_I_V_input[20].value = objectCopy1PhaseFault.Ibat_R.x.toFixed(2);
  selectAll_I_V_input[21].value = objectCopy1PhaseFault.Ibat_R.y.toFixed(2);
  selectAll_I_V_input[22].value = objectCopy1PhaseFault.Icat_R.x.toFixed(2);
  selectAll_I_V_input[23].value = objectCopy1PhaseFault.Icat_R.y.toFixed(2);

  vectorsData.ZA.x = objectCopy1PhaseFault.Zaat_R.x.toFixed(2);
  vectorsData.ZA.y = objectCopy1PhaseFault.Zaat_R.y.toFixed(2);
  vectorsData.ZB.x = objectCopy1PhaseFault.Zbat_R.x.toFixed(2);
  vectorsData.ZB.y = objectCopy1PhaseFault.Zbat_R.y.toFixed(2);
  vectorsData.ZC.x = objectCopy1PhaseFault.Zcat_R.x.toFixed(2);
  vectorsData.ZC.y = objectCopy1PhaseFault.Zcat_R.y.toFixed(2);
  vectorsData.VA.x = objectCopy1PhaseFault.Vaat_R.x.toFixed(2);
  vectorsData.VA.y = objectCopy1PhaseFault.Vaat_R.y.toFixed(2);
  vectorsData.VB.x = objectCopy1PhaseFault.Vbat_R.x.toFixed(2);
  vectorsData.VB.y = objectCopy1PhaseFault.Vbat_R.y.toFixed(2);
  vectorsData.VC.x = objectCopy1PhaseFault.Vcat_R.x.toFixed(2);
  vectorsData.VC.y = objectCopy1PhaseFault.Vcat_R.y.toFixed(2);
  vectorsData.IA.x = objectCopy1PhaseFault.Iaat_R.x.toFixed(2);
  vectorsData.IA.y = objectCopy1PhaseFault.Iaat_R.y.toFixed(2);
  vectorsData.IB.x = objectCopy1PhaseFault.Ibat_R.x.toFixed(2);
  vectorsData.IB.y = objectCopy1PhaseFault.Ibat_R.y.toFixed(2);
  vectorsData.IC.x = objectCopy1PhaseFault.Icat_R.x.toFixed(2);
  vectorsData.IC.y = objectCopy1PhaseFault.Icat_R.y.toFixed(2);
}

export function updateAxis(inputs) {
  let values = Array.prototype.map.call(inputs, function (input) {
    return parseFloat(input.value); // parse the values to numbers if they are not already
  });

  let max = values.reduce(function (a, b) {
    return Math.max(Math.abs(a), Math.abs(b));
  });

  xScale.domain([-max, max]); // new maximum domain value is now 200
  yScale.domain([-max, max]);
  mainGroup
    .select(".x-axis") // select your axis again
    .transition() // add a transition if you want
    .duration(1000)
    .call(xAxis);
  mainGroup
    .select(".y-axis") // select your axis again
    .transition() // add a transition if you want
    .duration(1000)
    .call(yAxis);

  updateMainVisualization("IA");
  updateMainVisualization("IB");
  updateMainVisualization("IC");
  updateMainVisualization("VA");
  updateMainVisualization("VB");
  updateMainVisualization("VC");
  updateMainVisualization("ZA");
  updateMainVisualization("ZB");
  updateMainVisualization("ZC");
}

export function Fault_Type (mjs,checkedValue){
  if (toggleButtonValue==="ON") {
    import(mjs).then(function (module) {
    let objectCopyFault;
    let arrayFunctions=[
      ThreePhaseFault(),
      Ph_Ph(),
      Ph_G()
      ];
    let index=-1;

    if (checkedValue==="3Ph") {objectCopyFault = module.ThreePhaseFault();index=0;} 
    if (checkedValue==="2Ph") {objectCopyFault = module.Ph_Ph();index=1;} 
    if (checkedValue==="1Ph") {objectCopyFault = module.Ph_G();index=2;} 


      let selectAll_I_V_input = document.querySelectorAll(
        "input.Z, input.I, input.V"
      );

      assignValue_I_V_input(selectAll_I_V_input, objectCopyFault);

      updateAxis(selectAll_I_V_input);

      function dataToHTMLTable(data) {
        // Start with the table header
        let tableHTML = '<table border="1px" style="border-collapse:unset; padding:2px 0px 2px 0px;font-size:0.8rem;">';
  
        // Extract headers (object keys) from the first data entry
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            tableHTML += `<th> </th>`;
        });
  
        tableHTML += '</tr></thead><tbody>';
  
        // Add table data
        data.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                tableHTML += `<td>${row[header]}</td>`;
            });
            tableHTML += '</tr>';
        });
  
        tableHTML += '</tbody></table>';
  
        return tableHTML;
      }

    const fieldSet = function(id,label,array,keys,cartesianFaultApply){ 
      const fieldset = document.getElementById(id);
      let data = []
      if (cartesianFaultApply){
       data = [
        {V: label[0] ,R: (array[keys[0]].x).toFixed(2), X:  (array[keys[0]].y)<0 ? "- j "+ (-array[keys[0]].y).toFixed(2) : "+ j " + (array[keys[0]].y).toFixed(2)},
        {V: label[1] ,R: (array[keys[1]].x).toFixed(2), X:  (array[keys[1]].y)<0 ? "- j "+ (-array[keys[1]].y).toFixed(2) : "+ j " + (array[keys[1]].y).toFixed(2)},
        {V: label[2] ,R: (array[keys[2]].x).toFixed(2), X:  (array[keys[2]].y)<0 ? "- j "+ (-array[keys[2]].y).toFixed(2) : "+ j " + (array[keys[2]].y).toFixed(2)}
      ]}
      else{
        data = [
          {V: label[0] ,R: "&nbsp;" + (convertToPolar(array[keys[0]],true).magnitude).toFixed(2), X:  `<u>${"&nbsp;" + "&frasl;" + (convertToPolar(array[keys[0]],true).angle <0 ? "-" : "+") + Math.abs((convertToPolar(array[keys[0]],true).angle)).toFixed(1) + "º"}</u>`},
          {V: label[1] ,R: "&nbsp;" + (convertToPolar(array[keys[1]],true).magnitude).toFixed(2), X:  `<u>${"&nbsp;" + "&frasl;" + (convertToPolar(array[keys[1]],true).angle <0 ? "-" : "+") +  Math.abs((convertToPolar(array[keys[1]],true).angle)).toFixed(1) + "º"}</u>`},
          {V: label[2] ,R: "&nbsp;" + (convertToPolar(array[keys[2]],true).magnitude).toFixed(2), X:  `<u>${"&nbsp;" + "&frasl;" + (convertToPolar(array[keys[2]],true).angle <0 ? "-" : "+") + Math.abs((convertToPolar(array[keys[2]],true).angle)).toFixed(1) + "º"}</u>`}
        ]        
      };
      
      const tableHTML = dataToHTMLTable(data);

     var tableOutput = document.getElementById(id)
     tableOutput.innerHTML = tableHTML;
     

    }


    let faultInput3Ph = document.getElementById('faultType3Ph');
    faultInput3Ph.addEventListener('click', function() {
            Fault_Type("./3PhFault_at_F.mjs","3Ph");
        })
    let faultInput2Ph = document.getElementById('faultType2Ph');
    faultInput2Ph.addEventListener('click', function() {
            Fault_Type("./2PhFault_at_F.mjs","2Ph");
        })
    let faultInput1Ph = document.getElementById('faultType1Ph');
    faultInput1Ph.addEventListener('click', function() {
            Fault_Type("./1PhFault_at_F.mjs","1Ph");
        })
    

    let toggleDisplayValues = document.getElementById("toggleDisplayValues");

    function setDashboardText(text) {
      document.getElementById("toggleDisplayValues").innerHTML = text;
    }


    toggleDisplayValues.addEventListener("click", function(e) {

      if (cartesianFaultApply) {
        setDashboardText("r<u>&nbsp;⁄θº</u>"); 
        console.log("Event listener invoked  r theta",checkedValue);

      // Call setdashboardValues before toggling cartesianFaultApply
      setdashboardValues(cartesianFaultApply);        
      } else {
        setDashboardText("R/X"); 
        console.log("Event listener invoked R/X",checkedValue);
        
      // Call setdashboardValues before toggling cartesianFaultApply
      setdashboardValues(cartesianFaultApply);        
      }
    


    });

  // let toggleDisplayValues = document.getElementById("toggleDisplayValues")
  // toggleDisplayValues.addEventListener("click",function(){
  //     const changeToRX = function() {cartesianFaultApply=!cartesianFaultApply;document.getElementById("toggleDisplayValues").innerText="R/X";setdashboardValues(cartesianFaultApply);}
  //     const changeTorTheta = function() {cartesianFaultApply=!cartesianFaultApply;document.getElementById("toggleDisplayValues").innerHTML="r<u>&nbsp;⁄θº</u>";setdashboardValues(cartesianFaultApply);}
  //     if (cartesianFaultApply) {console.log("change to R/X");changeTorTheta()}
  //     else {console.log("change to r theta");changeToRX()};
  // }) 
  
  function setdashboardValues(cartesionTrue){
  fieldSet('faultCalculationResult_V',["Va = ","Vb = ","Vc = "],arrayFunctions[index],["Vaat_R","Vbat_R","Vcat_R"],cartesionTrue)    
  fieldSet('faultCalculationResult_VPh',["Vab = ","Vbc = ","Vca = "],arrayFunctions[index],["Va_bat_R","Vb_cat_R","Vc_aat_R"],cartesionTrue)    
  fieldSet('faultCalculationResult_I',["Ia = ","Ib = ","Ic = "],arrayFunctions[index],["Iaat_R","Ibat_R","Icat_R"],cartesionTrue)    
  fieldSet('faultCalculationResult_IPh',["Iab = ","Ibc = ","Ica = "],arrayFunctions[index],["Ia_bat_R","Ib_cat_R","Ic_aat_R"],cartesionTrue)    
  fieldSet('faultCalculationResult_Z',["Za = ","Zb = ","Zc = "],arrayFunctions[index],["Zaat_R","Zbat_R","Zcat_R"],cartesionTrue)    
  fieldSet('faultCalculationResult_Z_Ph_Ph',["Zab = ","Zbc = ","Zca = "],arrayFunctions[index],["Za_bat_R","Zb_cat_R","Zc_aat_R"],cartesionTrue)    
  fieldSet('faultCalculationResult_Z_Ph_Ph',["Zab = ","Zbc = ","Zca = "],arrayFunctions[index],["Za_bat_R","Zb_cat_R","Zc_aat_R"],cartesionTrue) 
      // Toggle cartesianFaultApply
      cartesianFaultApply = !cartesianFaultApply;  }
 
  setdashboardValues(cartesianFaultApply)

    const data_Transition = [
      {Z: "Zab = " ,R: convertToPolar(complexMultiplication(h,Z_L1),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(h,Z_L1),true).angle.toFixed(2)+ " + ", X:convertToPolar(complexMultiplication(complexDivision(_a,C1),Z_F),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision(_a,C1),Z_F),true).angle.toFixed(2)+ " + ", Y:convertToPolar(complexMultiplication(complexDivision({x:0,y:-Math.sqrt(3)},C1),Z2),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision({x:0,y:-Math.sqrt(3)},C1),Z2),true).angle.toFixed(2)},
      {Z: "Zbc = " ,R: convertToPolar(complexMultiplication(h,Z_L1),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(h,Z_L1),true).angle.toFixed(2)+ " + ", X:convertToPolar(complexMultiplication(complexDivision(complexDivision(I,{x:2,y:0}),C1),Z_F),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision(complexDivision(I,{x:2,y:0}),C1),Z_F),true).angle.toFixed(2), Y: ""},
      {Z: "Zca = " ,R: convertToPolar(complexMultiplication(h,Z_L1),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(h,Z_L1),true).angle.toFixed(2)+ " + ", X:convertToPolar(complexMultiplication(complexDivision(_a2,C1),Z_F),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision(_a2,C1),Z_F),true).angle.toFixed(2)+ " + ", Y:convertToPolar(complexMultiplication(complexDivision({x:0,y:Math.sqrt(3)},C1),Z2),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision({x:0,y:Math.sqrt(3)},C1),Z2),true).angle.toFixed(2)}
    ];
    
    const tableHTML_Transition = dataToHTMLTable(data_Transition);
    document.getElementById('faultCalculationResult_Transition').innerHTML = tableHTML_Transition;

    // {Z: "Zbc = " ,R: convertToPolar(complexMultiplication(h,Z_L1),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(h,Z_L1),true).angle.toFixed(2)+ " + ", X:convertToPolar(complexMultiplication(complexDivision(complexDivision(I,{x:2,y:0}),C1),Z_F),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision(complexDivision(I,{x:2,y:0}),C1),Z_F),true).angle.toFixed(2), Y: ""},
    // {Z: "Zca = " ,R: convertToPolar(complexMultiplication(h,Z_L1),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(h,Z_L1),true).angle.toFixed(2)+ " + ", X:convertToPolar(complexMultiplication(complexDivision(_a2,C1),Z_F),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision(_a2,C1),Z_F),true).angle.toFixed(2)+ " + ", Y:convertToPolar(complexMultiplication(complexDivision({x:0,y:Math.sqrt(3)},C1),Z2),true).magnitude.toFixed(4)+"/"+convertToPolar(complexMultiplication(complexDivision({x:0,y:Math.sqrt(3)},C1),Z2),true).angle.toFixed(2)}
    

    });
  }
}
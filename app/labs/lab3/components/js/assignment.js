import { ganged } from "./ganged.js";
import { tab_ABC } from "./tab_ABC.js";
import { setVoltageInputMode } from "./meteringBase.js";
import { m, m_inv, M_V } from "./symTransforms.js";
import * as d3 from "d3";
import $ from "jquery";

// Global DOM element references - ensure they exist
var Amp_0, Amp_1, Amp_2, Angle_0, Angle_1, Angle_2;
var Amp_A, Amp_B, Amp_C, Angle_A, Angle_B, Angle_C;
var Amp_0_I, Amp_1_I, Amp_2_I, Angle_0_I, Angle_1_I, Angle_2_I;
var Amp_A_I, Amp_B_I, Amp_C_I, Angle_A_I, Angle_B_I, Angle_C_I;
var toggleon, toggleon_I, toggleon_Ph, toggleon_Ph_Ph;

// Get constants from window (set by Lab3.tsx)
const AMP_V_INIT = window.AMP_V_INIT || 115;
const AMP_I_INIT = window.AMP_I_INIT || 5;
const PIX_PER_AMP_V = window.PIX_PER_AMP_V || 1;
const PIX_PER_AMP_I = window.PIX_PER_AMP_I || 1;

// Degree to radian conversion
const rad = (deg) => deg * Math.PI / 180;

function initGlobalElements() {
  // Initialize global DOM element references
  Amp_0 = document.getElementById("Amp_0");
  Amp_1 = document.getElementById("Amp_1");
  Amp_2 = document.getElementById("Amp_2");
  Angle_0 = document.getElementById("Angle_0");
  Angle_1 = document.getElementById("Angle_1");
  Angle_2 = document.getElementById("Angle_2");
  Amp_A = document.getElementById("Amp_A");
  Amp_B = document.getElementById("Amp_B");
  Amp_C = document.getElementById("Amp_C");
  Angle_A = document.getElementById("Angle_A");
  Angle_B = document.getElementById("Angle_B");
  Angle_C = document.getElementById("Angle_C");
  Amp_0_I = document.getElementById("Amp_0_I");
  Amp_1_I = document.getElementById("Amp_1_I");
  Amp_2_I = document.getElementById("Amp_2_I");
  Angle_0_I = document.getElementById("Angle_0_I");
  Angle_1_I = document.getElementById("Angle_1_I");
  Angle_2_I = document.getElementById("Angle_2_I");
  Amp_A_I = document.getElementById("Amp_A_I");
  Amp_B_I = document.getElementById("Amp_B_I");
  Amp_C_I = document.getElementById("Amp_C_I");
  Angle_A_I = document.getElementById("Angle_A_I");
  Angle_B_I = document.getElementById("Angle_B_I");
  Angle_C_I = document.getElementById("Angle_C_I");
  toggleon = document.getElementById("toggleon");
  toggleon_I = document.getElementById("toggleon_I");
  toggleon_Ph = document.getElementById("toggleon_Ph");
  toggleon_Ph_Ph = document.getElementById("toggleon_Ph_Ph");
}

export function assignValues(recordAndUpdate, History) {
  // Initialize global DOM element references
  initGlobalElements();
  
  // Declare auxiliary variables used in toggle functions
  let Aux, Aux2, Aux3, Aux_I;

  if (toggleon.value * 1 === 1) {
    toggleon.value = 0;
  }
  if (toggleon_I.value * 1 === 1) {
    toggleon_I.value = 0;
  }
  $("#Amp_0").val(0);
  $("#Amp_1").val(AMP_V_INIT);
  $("#Amp_2").val(0);
  $("#Angle_0").val(0);
  $("#Angle_1").val(0);
  $("#Angle_2").val(0);
  $("#Amp_0_I").val(0);
  $("#Amp_1_I").val(AMP_I_INIT);
  $("#Amp_2_I").val(0);
  $("#Angle_0_I").val(0);
  $("#Angle_1_I").val(0);
  $("#Angle_2_I").val(0);
  $("#Amp_A").val(AMP_V_INIT);
  $("#Amp_B").val(AMP_V_INIT);
  $("#Amp_C").val(AMP_V_INIT);
  $("#Angle_A").val(0);
  $("#Angle_B").val(-120);
  $("#Angle_C").val(120);
  $("#Amp_A_I").val(AMP_I_INIT);
  $("#Amp_B_I").val(AMP_I_INIT);
  $("#Amp_C_I").val(AMP_I_INIT);
  $("#Angle_A_I").val(0);
  $("#Angle_B_I").val(-120);
  $("#Angle_C_I").val(120);
  $("#toggle").val(0);
  $("#toggle_I").val(0);
  $("#img_toggleon").attr("src", "../img/closed unlock.svg");
  $("#img_toggleon_I").attr("src", "../img/closed unlock_I.svg");
  $("#Z_ratio").val(0.29);
  $("#Z0_ratio").val(0.9);
  $("#Z_l").val(20);
  $("#Z_angle").val(80);
  $("#Z0_angle").val(72.52);
  $("#Z1").val(80);
  $("#Z2").val(120);
  $("#Z3").val(200);
  d3.selectAll("#Zl_Amp").text(
    ($("#Z_ratio").val() * $("#Z_l").val()).toFixed(2) + " Ohm",
  );
  d3.selectAll("#Zl_Ang")
    .text("/" + $("#Z_angle").val() + " º")
    .style("text-decoration", "underline");

  //----------------------

  $("#img_toggleon").on({
    click: function () {
      var origsrc = $(this).attr("src");
      var src = "";
      if (origsrc === "../img/closed unlock.svg") {
        src = "../img/closed lock.svg";
        $("#form_toggle").attr(
          "title",
          "click to unlock voltage VA, VB, VC to freely change their angle and amplitude",
        );
      }
      if (origsrc === "../img/closed lock.svg") {
        src = "../img/closed unlock.svg";
        $("#form_toggle").attr(
          "title",
          "click to lock voltage VA, VB, VC for balanced angle and amplitude",
        );
      }
      $("#img_toggleon").attr("src", src);
    },
  });
  $("#img_toggleon_I").on({
    click: function () {
      var origsrc_I = $(this).attr("src");
      var src_I = "";
      if (origsrc_I === "../img/closed unlock_I.svg") {
        src_I = "../img/closed lock_I.svg";
        $("#form_toggle_I").attr(
          "title",
          "click to unlock current IA, IB, IC to freely change their angle and amplitude",
        );
      }
      if (origsrc_I === "../img/closed lock_I.svg") {
        src_I = "../img/closed unlock_I.svg";
        $("#form_toggle_I").attr(
          "title",
          "click to lock current IA, IB, IC for balanced angle and amplitude",
        );
      }
      $("#img_toggleon_I").attr("src", src_I);
    },
  });

  d3.selectAll("#img_toggleon").on("click", function () {
    var a;
    var ang_a;
    a = $("#Amp_A").val();
    ang_a = $("#Angle_A").val();
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(a);
    change_Amp_1();
    $("#Amp_2").val(0);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(ang_a);
    change_Amp_1();
    $("#Angle_2").val(0);
    change_Amp_2();
    change_three_ph();
    History.push();
  });
  d3.selectAll("#img_toggleon_I").on("click", function () {
    var a;
    var ang_a;
    a = $("#Amp_A_I").val();
    ang_a = $("#Angle_A_I").val();
    $("#Amp_0_I").val(0);
    change_Amp_0();
    $("#Amp_1_I").val(a);
    change_Amp_1();
    $("#Amp_2_I").val(0);
    change_Amp_2();
    $("#Angle_0_I").val(0);
    change_Amp_0();
    $("#Angle_1_I").val(ang_a);
    change_Amp_1();
    $("#Angle_2_I").val(0);
    change_Amp_2();
    change_I();
  });
  d3.selectAll("#Z_l").on("change", function () {
    var a;
    a = $("#Z_ratio").val();
    var b;
    b = $("#Z_l").val();
    d3.selectAll("#Zl_Amp").text((a * b).toFixed(1) + " Ohm");
    change_three_ph();
  });
  d3.selectAll("#Z_angle").on("change", function () {
    var ang_a;
    ang_a = $("#Z_angle").val();
    d3.selectAll("#Zl_Ang")
      .text("/" + ang_a + " º")
      .style("text-decoration", "underline");
    change_three_ph();
  });
  d3.selectAll("#Z1").on("change", function () {
    change_three_ph();
  });
  d3.selectAll("#Z2").on("change", function () {
    change_three_ph();
  });
  d3.selectAll("#Z3").on("change", function () {
    change_three_ph();
  });
  d3.selectAll("#Type_1").on("click", function () {
    var a;
    a = $("#Data_Type_1_R").text();
    change_three_ph();
  });
  d3.selectAll("#Z_ratio").on("change", function () {
    var a;
    a = $("#Z_ratio").val();
    var b;
    b = $("#Z_l").val();
    var ang_a;
    ang_a = $("#Z_angle").val();
    d3.selectAll("#Zl_Amp").text((a * b).toFixed(1) + " Ohm");
    change_three_ph();
  });
  d3.selectAll("#Ph_label_ID").on("click", function () {
    change_Ph();
  });
  d3.selectAll("#toggleon_Ph").on("change", function () {
    change_Ph();
  });
  d3.selectAll("#Ph_Ph").on("click", function () {
    change_Ph_Ph();
  });
  d3.selectAll("#form_Amp_0").on("change", function () {
    change_Amp_0();
  });
  d3.selectAll("#form_Amp_1").on("change", function () {
    change_Amp_1();
  });
  d3.selectAll("#form_Amp_2").on("change", function () {
    change_Amp_2();
  });
  d3.selectAll("#form_Angle_0").on("change", function () {
    change_Amp_0();
  });
  d3.selectAll("#form_Angle_1").on("change", function () {
    change_Amp_1();
  });
  d3.selectAll("#form_Angle_2").on("change", function () {
    change_Amp_2();
  });
  d3.selectAll("#form_Amp_0_I").on("change", function () {
    change_Amp_0_I();
  });
  d3.selectAll("#form_Amp_1_I").on("change", function () {
    change_Amp_1_I();
  });
  d3.selectAll("#form_Amp_2_I").on("change", function () {
    change_Amp_2_I();
  });
  d3.selectAll("#Angle_0_I").on("change", function () {
    change_Amp_0_I();
  });
  d3.selectAll("#Angle_1_I").on("change", function () {
    change_Amp_1_I();
  });
  d3.selectAll("#Angle_2_I").on("change", function () {
    change_Amp_2_I();
  });
  d3.selectAll("#form_Amp_A").on("change", function () {
    change_Amp_A();
  });
  d3.selectAll("#form_Amp_B").on("change", function () {
    change_Amp_B();
  });
  d3.selectAll("#form_Amp_C").on("change", function () {
    change_Amp_C();
  });
  d3.selectAll("#form_Angle_A").on("change", function () {
    change_Amp_A();
  });
  d3.selectAll("#form_Angle_B").on("change", function () {
    change_Amp_B();
  });
  d3.selectAll("#form_Angle_C").on("change", function () {
    change_Amp_C();
  });
  d3.selectAll("#form_Amp_A_I").on("change", function () {
    change_Amp_A_I();
  });
  d3.selectAll("#form_Amp_B_I").on("change", function () {
    change_Amp_B_I();
  });
  d3.selectAll("#form_Amp_C_I").on("change", function () {
    change_Amp_C_I();
  });
  d3.selectAll("#form_Angle_A_I").on("change", function () {
    change_Amp_A_I();
  });
  d3.selectAll("#form_Angle_B_I").on("change", function () {
    change_Amp_B_I();
  });
  d3.selectAll("#form_Angle_C_I").on("change", function () {
    change_Amp_C_I();
  });
  d3.selectAll("#a_ref_4").on("click", function () {
    change_tab_ABC();
    change_tab_123();
  });
  d3.selectAll("#a_ref_3").on("click", function () {
    change_tab_ABC();
    change_tab_123();
  });
  d3.selectAll("#a_ref_2").on("click", function () {
    change_tab_ABC();
  });
  d3.selectAll("#a_ref_1").on("click", function () {
    change_tab_123();
  });
  d3.selectAll("circle.vectora").on("click", function () {
    change_tab_ABC();
  });
  d3.selectAll("circle.vectorb").on("click", function () {
    change_tab_ABC();
  });
  d3.selectAll("circle.vectorc").on("click", function () {
    change_tab_ABC();
  });
  d3.selectAll("circle.vectora_I").on("click", function () {
    change_tab_ABC();
  });
  d3.selectAll("circle.vectorb_I").on("click", function () {
    change_tab_ABC();
  });
  d3.selectAll("circle.vectorc_I").on("click", function () {
    change_tab_ABC();
  });

  d3.select("#ABC").on("click", function () {
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(75);
    change_Amp_1();
    $("#Amp_2").val(0);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(0);
    change_Amp_2();
    $("#Amp_0_I").val(0);
    change_Amp_0_I();
    $("#Amp_1_I").val(15);
    change_Amp_1_I();
    $("#Amp_2_I").val(0);
    change_Amp_2_I();
    $("#Angle_0_I").val(0);
    change_Amp_0_I();
    $("#Angle_1_I").val(-80);
    change_Amp_1_I();
    $("#Angle_2_I").val(0);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#AB").on("click", function () {
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(75);
    change_Amp_1();
    $("#Amp_2").val(25);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(-120);
    change_Amp_2();
    $("#Amp_0_I").val(1.7);
    change_Amp_0_I();
    $("#Amp_1_I").val(5.3);
    change_Amp_1_I();
    $("#Amp_2_I").val(5.3);
    change_Amp_2_I();
    $("#Angle_0_I").val(120);
    change_Amp_0_I();
    $("#Angle_1_I").val(-71.6);
    change_Amp_1_I();
    $("#Angle_2_I").val(-48.4);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#BC").on("click", function () {
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(75);
    change_Amp_1();
    $("#Amp_2").val(25);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(0);
    change_Amp_2();
    $("#Amp_0_I").val(1.7);
    change_Amp_0_I();
    $("#Amp_1_I").val(6.5);
    change_Amp_1_I();
    $("#Amp_2_I").val(5.5);
    change_Amp_2_I();
    $("#Angle_0_I").val(0.4);
    change_Amp_0_I();
    $("#Angle_1_I").val(-57.6);
    change_Amp_1_I();
    $("#Angle_2_I").val(91.4);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#CA").on("click", function () {
    $("#Amp_0").val(14);
    change_Amp_0();
    $("#Amp_1").val(76.5);
    change_Amp_1();
    $("#Amp_2").val(14);
    change_Amp_2();
    $("#Angle_0").val(-148.2);
    change_Amp_0();
    $("#Angle_1").val(9.9);
    change_Amp_1();
    $("#Angle_2").val(91.8);
    change_Amp_2();
    $("#Amp_0_I").val(3.7);
    change_Amp_0_I();
    $("#Amp_1_I").val(4.3);
    change_Amp_1_I();
    $("#Amp_2_I").val(5.2);
    change_Amp_2_I();
    $("#Angle_0_I").val(-157.2);
    change_Amp_0_I();
    $("#Angle_1_I").val(-40.8);
    change_Amp_1_I();
    $("#Angle_2_I").val(-136.8);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#ABG").on("click", function () {
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(75);
    change_Amp_1();
    $("#Amp_2").val(0);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(0);
    change_Amp_2();
    $("#Amp_0_I").val(AMP_I_INIT);
    change_Amp_0_I();
    $("#Amp_1_I").val(10);
    change_Amp_1_I();
    $("#Amp_2_I").val(AMP_I_INIT);
    change_Amp_2_I();
    $("#Angle_0_I").val(-140);
    change_Amp_0_I();
    $("#Angle_1_I").val(-80);
    change_Amp_1_I();
    $("#Angle_2_I").val(-20);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#BCG").on("click", function () {
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(75);
    change_Amp_1();
    $("#Amp_2").val(0);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(0);
    change_Amp_2();
    $("#Amp_0_I").val(AMP_I_INIT);
    change_Amp_0_I();
    $("#Amp_1_I").val(10);
    change_Amp_1_I();
    $("#Amp_2_I").val(AMP_I_INIT);
    change_Amp_2_I();
    $("#Angle_0_I").val(100);
    change_Amp_0_I();
    $("#Angle_1_I").val(-80);
    change_Amp_1_I();
    $("#Angle_2_I").val(100);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#CAG").on("click", function () {
    $("#Amp_0").val(0);
    change_Amp_0();
    $("#Amp_1").val(75);
    change_Amp_1();
    $("#Amp_2").val(0);
    change_Amp_2();
    $("#Angle_0").val(0);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(0);
    change_Amp_2();
    $("#Amp_0_I").val(AMP_I_INIT);
    change_Amp_0_I();
    $("#Amp_1_I").val(10);
    change_Amp_1_I();
    $("#Amp_2_I").val(AMP_I_INIT);
    change_Amp_2_I();
    $("#Angle_0_I").val(-20);
    change_Amp_0_I();
    $("#Angle_1_I").val(-80);
    change_Amp_1_I();
    $("#Angle_2_I").val(-140);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#AG").on("click", function () {
    $("#Amp_0").val(8);
    change_Amp_0();
    $("#Amp_1").val(92);
    change_Amp_1();
    $("#Amp_2").val(8);
    change_Amp_2();
    $("#Angle_0").val(180);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(180);
    change_Amp_2();
    $("#Amp_0_I").val(AMP_I_INIT);
    change_Amp_0_I();
    $("#Amp_1_I").val(6.5);
    change_Amp_1_I();
    $("#Amp_2_I").val(AMP_I_INIT);
    change_Amp_2_I();
    $("#Angle_0_I").val(-99.2);
    change_Amp_0_I();
    $("#Angle_1_I").val(-49.5);
    change_Amp_1_I();
    $("#Angle_2_I").val(-99.2);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#CG").on("click", function () {
    $("#Amp_0").val(8);
    change_Amp_0();
    $("#Amp_1").val(92);
    change_Amp_1();
    $("#Amp_2").val(8);
    change_Amp_2();
    $("#Angle_0").val(-60);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(60);
    change_Amp_2();
    $("#Amp_0_I").val(AMP_I_INIT);
    change_Amp_0_I();
    $("#Amp_1_I").val(6.5);
    change_Amp_1_I();
    $("#Amp_2_I").val(AMP_I_INIT);
    change_Amp_2_I();
    $("#Angle_0_I").val(20.8);
    change_Amp_0_I();
    $("#Angle_1_I").val(-49.5);
    change_Amp_1_I();
    $("#Angle_2_I").val(140.8);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  d3.select("#BG").on("click", function () {
    $("#Amp_0").val(8);
    change_Amp_0();
    $("#Amp_1").val(92);
    change_Amp_1();
    $("#Amp_2").val(8);
    change_Amp_2();
    $("#Angle_0").val(60);
    change_Amp_0();
    $("#Angle_1").val(0);
    change_Amp_1();
    $("#Angle_2").val(-60);
    change_Amp_2();
    $("#Amp_0_I").val(AMP_I_INIT);
    change_Amp_0_I();
    $("#Amp_1_I").val(6.5);
    change_Amp_1_I();
    $("#Amp_2_I").val(AMP_I_INIT);
    change_Amp_2_I();
    $("#Angle_0_I").val(140.8);
    change_Amp_0_I();
    $("#Angle_1_I").val(-49.5);
    change_Amp_1_I();
    $("#Angle_2_I").val(20.8);
    change_Amp_2_I();
    change_tab_ABC();
    change_tab_123();
  });
  // Reset handlers are now handled via React useState in Lab3.tsx
  // The React component triggers the reset through state updates
  // This keeps the logic in sync with React's rendering cycle
  // Reset I handler is now handled via React useState in Lab3.tsx

  function change_three_ph() {
    Aux = toggleon.value * 1;
    if (Aux === 1) {
      Three_ph = true;
    } else {
      Three_ph = false;
    }
    window.recordAndUpdate();
  }
  function change_Ph_Ph() {
    Aux3 = toggleon_Ph_Ph.value;
    if (Aux3 === "on") {
      Ph2Ph = false;
    }
    setVoltageInputMode(Ph2Ph ? "LL" : "LN");
    window.recordAndUpdate();
  }
  function change_Ph() {
    Aux2 = toggleon_Ph.value;
    if (Aux2 === "on") {
      Ph2Ph = true;
    }
    setVoltageInputMode(Ph2Ph ? "LL" : "LN");
    window.recordAndUpdate();
  }
  function change_I() {
    Aux_I = toggleon_I.value * 1;
    if (Aux_I === 1) {
      Three_ph_I = true;
    } else {
      Three_ph_I = false;
    }
    window.recordAndUpdate();
  }

  function change_Amp_0_I() {
    editSource = "I_SEQ";
    Amp_0_value_I = Amp_0_I.value * PIX_PER_AMP_I;
    Angle_0_value_I = +Angle_0_I.value;
    Amp_1_value_I = Amp_1_I.value * PIX_PER_AMP_I;
    Angle_1_value_I = +Angle_1_I.value;
    Amp_2_value_I = Amp_2_I.value * PIX_PER_AMP_I;
    Angle_2_value_I = +Angle_2_I.value;

    const triplet = [
      [
        Amp_0_value_I * Math.cos(rad(Angle_0_value_I)),
        Amp_0_value_I * Math.sin(rad(Angle_0_value_I)),
      ],
      [
        Amp_1_value_I * Math.cos(rad(Angle_1_value_I)),
        Amp_1_value_I * Math.sin(rad(Angle_1_value_I)),
      ],
      [
        Amp_2_value_I * Math.cos(rad(Angle_2_value_I)),
        Amp_2_value_I * Math.sin(rad(Angle_2_value_I)),
      ],
    ];

    const abc = M_V(m, triplet); // 0/1/2 -> A/B/C
    ia = toScreenXY(abc[0], p0_I);
    ib = toScreenXY(abc[1], p0_I);
    ic = toScreenXY(abc[2], p0_I);
    window.recordAndUpdate();
  }
  function change_Amp_1_I() {
    editSource = "I_SEQ";
    Amp_0_value_I = Amp_0_I.value * PIX_PER_AMP_I;
    Angle_0_value_I = +Angle_0_I.value;
    Amp_1_value_I = Amp_1_I.value * PIX_PER_AMP_I;
    Angle_1_value_I = +Angle_1_I.value;
    Amp_2_value_I = Amp_2_I.value * PIX_PER_AMP_I;
    Angle_2_value_I = +Angle_2_I.value;

    const triplet = [
      [
        Amp_0_value_I * Math.cos(rad(Angle_0_value_I)),
        Amp_0_value_I * Math.sin(rad(Angle_0_value_I)),
      ],
      [
        Amp_1_value_I * Math.cos(rad(Angle_1_value_I)),
        Amp_1_value_I * Math.sin(rad(Angle_1_value_I)),
      ],
      [
        Amp_2_value_I * Math.cos(rad(Angle_2_value_I)),
        Amp_2_value_I * Math.sin(rad(Angle_2_value_I)),
      ],
    ];

    const abc = M_V(m, triplet); // 0/1/2 -> A/B/C
    ia = toScreenXY(abc[0], p0_I);
    ib = toScreenXY(abc[1], p0_I);
    ic = toScreenXY(abc[2], p0_I);
    window.recordAndUpdate();
  }
  function change_Amp_2_I() {
    editSource = "I_SEQ";
    Amp_0_value_I = Amp_0_I.value * PIX_PER_AMP_I;
    Angle_0_value_I = +Angle_0_I.value;
    Amp_1_value_I = Amp_1_I.value * PIX_PER_AMP_I;
    Angle_1_value_I = +Angle_1_I.value;
    Amp_2_value_I = Amp_2_I.value * PIX_PER_AMP_I;
    Angle_2_value_I = +Angle_2_I.value;

    const triplet = [
      [
        Amp_0_value_I * Math.cos(rad(Angle_0_value_I)),
        Amp_0_value_I * Math.sin(rad(Angle_0_value_I)),
      ],
      [
        Amp_1_value_I * Math.cos(rad(Angle_1_value_I)),
        Amp_1_value_I * Math.sin(rad(Angle_1_value_I)),
      ],
      [
        Amp_2_value_I * Math.cos(rad(Angle_2_value_I)),
        Amp_2_value_I * Math.sin(rad(Angle_2_value_I)),
      ],
    ];

    const abc = M_V(m, triplet); // 0/1/2 -> A/B/C
    ia = toScreenXY(abc[0], p0_I);
    ib = toScreenXY(abc[1], p0_I);
    ic = toScreenXY(abc[2], p0_I);
    window.recordAndUpdate();
  }
  function change_Amp_A() {
    editSource = "V_ABC";
    Amp_A_value = Amp_A.value * PIX_PER_AMP_V;
    Angle_A_value = +Angle_A.value;
    Amp_B_value = Amp_B.value * PIX_PER_AMP_V;
    Angle_B_value = +Angle_B.value;
    Amp_C_value = Amp_C.value * PIX_PER_AMP_V;
    Angle_C_value = +Angle_C.value;

    const triplet = [
      [
        Amp_A_value * Math.cos(rad(Angle_A_value)),
        Amp_A_value * Math.sin(rad(Angle_A_value)),
      ],
      [
        Amp_B_value * Math.cos(rad(Angle_B_value)),
        Amp_B_value * Math.sin(rad(Angle_B_value)),
      ],
      [
        Amp_C_value * Math.cos(rad(Angle_C_value)),
        Amp_C_value * Math.sin(rad(Angle_C_value)),
      ],
    ];
    va = toScreenXY(triplet[0], p0);
    vb = toScreenXY(triplet[1], p0);
    vc = toScreenXY(triplet[2], p0);
    window.recordAndUpdate();
  }
  function change_Amp_B() {
    editSource = "V_ABC";
    Amp_A_value = Amp_A.value * PIX_PER_AMP_V;
    Angle_A_value = +Angle_A.value;
    Amp_B_value = Amp_B.value * PIX_PER_AMP_V;
    Angle_B_value = +Angle_B.value;
    Amp_C_value = Amp_C.value * PIX_PER_AMP_V;
    Angle_C_value = +Angle_C.value;

    const triplet = [
      [
        Amp_A_value * Math.cos(rad(Angle_A_value)),
        Amp_A_value * Math.sin(rad(Angle_A_value)),
      ],
      [
        Amp_B_value * Math.cos(rad(Angle_B_value)),
        Amp_B_value * Math.sin(rad(Angle_B_value)),
      ],
      [
        Amp_C_value * Math.cos(rad(Angle_C_value)),
        Amp_C_value * Math.sin(rad(Angle_C_value)),
      ],
    ];
    va = toScreenXY(triplet[0], p0);
    vb = toScreenXY(triplet[1], p0);
    vc = toScreenXY(triplet[2], p0);
    window.recordAndUpdate();
  }
  function change_Amp_C() {
    editSource = "V_ABC";
    Amp_A_value = Amp_A.value * PIX_PER_AMP_V;
    Angle_A_value = +Angle_A.value;
    Amp_B_value = Amp_B.value * PIX_PER_AMP_V;
    Angle_B_value = +Angle_B.value;
    Amp_C_value = Amp_C.value * PIX_PER_AMP_V;
    Angle_C_value = +Angle_C.value;

    const triplet = [
      [
        Amp_A_value * Math.cos(rad(Angle_A_value)),
        Amp_A_value * Math.sin(rad(Angle_A_value)),
      ],
      [
        Amp_B_value * Math.cos(rad(Angle_B_value)),
        Amp_B_value * Math.sin(rad(Angle_B_value)),
      ],
      [
        Amp_C_value * Math.cos(rad(Angle_C_value)),
        Amp_C_value * Math.sin(rad(Angle_C_value)),
      ],
    ];
    va = toScreenXY(triplet[0], p0);
    vb = toScreenXY(triplet[1], p0);
    vc = toScreenXY(triplet[2], p0);
    window.recordAndUpdate();
  }

  function change_Amp_0() {
    editSource = "V_SEQ";
    Amp_0_value = Amp_0.value * PIX_PER_AMP_V;
    Angle_0_value = +Angle_0.value;
    Amp_1_value = Amp_1.value * PIX_PER_AMP_V;
    Angle_1_value = +Angle_1.value;
    Amp_2_value = Amp_2.value * PIX_PER_AMP_V;
    Angle_2_value = +Angle_2.value;

    const triplet = [
      [
        Amp_0_value * Math.cos(rad(Angle_0_value)),
        Amp_0_value * Math.sin(rad(Angle_0_value)),
      ],
      [
        Amp_1_value * Math.cos(rad(Angle_1_value)),
        Amp_1_value * Math.sin(rad(Angle_1_value)),
      ],
      [
        Amp_2_value * Math.cos(rad(Angle_2_value)),
        Amp_2_value * Math.sin(rad(Angle_2_value)),
      ],
    ];

    const triplet_inv = M_V(m, triplet);
    const toScreenXYFn = window.toScreenXY || function(pt, origin) {
      const xScale_V = window.xScale_V;
      const yScale_V = window.yScale_V;
      return [xScale_V ? xScale_V(pt[0]) : pt[0], yScale_V ? yScale_V(pt[1]) : pt[1]];
    };
    const p0 = window.p0 || [window.w / 2 || 300, window.h / 2 || 300];
    window.va = toScreenXYFn(triplet_inv[0], p0);
    window.vb = toScreenXYFn(triplet_inv[1], p0);
    window.vc = toScreenXYFn(triplet_inv[2], p0);
    window.recordAndUpdate();
  }
  function change_Amp_1() {
    editSource = "V_SEQ";
    Amp_0_value = Amp_0.value * PIX_PER_AMP_V;
    Angle_0_value = +Angle_0.value;
    Amp_1_value = Amp_1.value * PIX_PER_AMP_V;
    Angle_1_value = +Angle_1.value;
    Amp_2_value = Amp_2.value * PIX_PER_AMP_V;
    Angle_2_value = +Angle_2.value;

    const triplet = [
      [
        Amp_0_value * Math.cos(rad(Angle_0_value)),
        Amp_0_value * Math.sin(rad(Angle_0_value)),
      ],
      [
        Amp_1_value * Math.cos(rad(Angle_1_value)),
        Amp_1_value * Math.sin(rad(Angle_1_value)),
      ],
      [
        Amp_2_value * Math.cos(rad(Angle_2_value)),
        Amp_2_value * Math.sin(rad(Angle_2_value)),
      ],
    ];

    const triplet_inv = M_V(m, triplet);
    va = toScreenXY(triplet_inv[0], p0);
    vb = toScreenXY(triplet_inv[1], p0);
    vc = toScreenXY(triplet_inv[2], p0);
    window.recordAndUpdate();
  }
  function change_Amp_2() {
    editSource = "V_SEQ";
    Amp_0_value = Amp_0.value * PIX_PER_AMP_V;
    Angle_0_value = +Angle_0.value;
    Amp_1_value = Amp_1.value * PIX_PER_AMP_V;
    Angle_1_value = +Angle_1.value;
    Amp_2_value = Amp_2.value * PIX_PER_AMP_V;
    Angle_2_value = +Angle_2.value;

    const triplet = [
      [
        Amp_0_value * Math.cos(rad(Angle_0_value)),
        Amp_0_value * Math.sin(rad(Angle_0_value)),
      ],
      [
        Amp_1_value * Math.cos(rad(Angle_1_value)),
        Amp_1_value * Math.sin(rad(Angle_1_value)),
      ],
      [
        Amp_2_value * Math.cos(rad(Angle_2_value)),
        Amp_2_value * Math.sin(rad(Angle_2_value)),
      ],
    ];

    const triplet_inv = M_V(m, triplet);
    va = toScreenXY(triplet_inv[0], p0);
    vb = toScreenXY(triplet_inv[1], p0);
    vc = toScreenXY(triplet_inv[2], p0);
    window.recordAndUpdate();
  }

  function change_Amp_A_I() {
    editSource = "I_ABC";
    Amp_A_value_I = Amp_A_I.value * PIX_PER_AMP_I;
    Angle_A_value_I = +Angle_A_I.value;
    Amp_B_value_I = Amp_B_I.value * PIX_PER_AMP_I;
    Angle_B_value_I = +Angle_B_I.value;
    Amp_C_value_I = Amp_C_I.value * PIX_PER_AMP_I;
    Angle_C_value_I = +Angle_C_I.value;

    const triplet = [
      [
        Amp_A_value_I * Math.cos(rad(Angle_A_value_I)),
        Amp_A_value_I * Math.sin(rad(Angle_A_value_I)),
      ],
      [
        Amp_B_value_I * Math.cos(rad(Angle_B_value_I)),
        Amp_B_value_I * Math.sin(rad(Angle_B_value_I)),
      ],
      [
        Amp_C_value_I * Math.cos(rad(Angle_C_value_I)),
        Amp_C_value_I * Math.sin(rad(Angle_C_value_I)),
      ],
    ];
    ia = toScreenXY(triplet[0], p0_I);
    ib = toScreenXY(triplet[1], p0_I);
    ic = toScreenXY(triplet[2], p0_I);
    window.recordAndUpdate();
  }
  function change_Amp_B_I() {
    editSource = "I_ABC";
    Amp_A_value_I = Amp_A_I.value * PIX_PER_AMP_I;
    Angle_A_value_I = +Angle_A_I.value;
    Amp_B_value_I = Amp_B_I.value * PIX_PER_AMP_I;
    Angle_B_value_I = +Angle_B_I.value;
    Amp_C_value_I = Amp_C_I.value * PIX_PER_AMP_I;
    Angle_C_value_I = +Angle_C_I.value;

    const triplet = [
      [
        Amp_A_value_I * Math.cos(rad(Angle_A_value_I)),
        Amp_A_value_I * Math.sin(rad(Angle_A_value_I)),
      ],
      [
        Amp_B_value_I * Math.cos(rad(Angle_B_value_I)),
        Amp_B_value_I * Math.sin(rad(Angle_B_value_I)),
      ],
      [
        Amp_C_value_I * Math.cos(rad(Angle_C_value_I)),
        Amp_C_value_I * Math.sin(rad(Angle_C_value_I)),
      ],
    ];
    ia = toScreenXY(triplet[0], p0_I);
    ib = toScreenXY(triplet[1], p0_I);
    ic = toScreenXY(triplet[2], p0_I);
    window.recordAndUpdate();
  }
  function change_Amp_C_I() {
    editSource = "I_ABC";
    Amp_A_value_I = Amp_A_I.value * PIX_PER_AMP_I;
    Angle_A_value_I = +Angle_A_I.value;
    Amp_B_value_I = Amp_B_I.value * PIX_PER_AMP_I;
    Angle_B_value_I = +Angle_B_I.value;
    Amp_C_value_I = Amp_C_I.value * PIX_PER_AMP_I;
    Angle_C_value_I = +Angle_C_I.value;

    const triplet = [
      [
        Amp_A_value_I * Math.cos(rad(Angle_A_value_I)),
        Amp_A_value_I * Math.sin(rad(Angle_A_value_I)),
      ],
      [
        Amp_B_value_I * Math.cos(rad(Angle_B_value_I)),
        Amp_B_value_I * Math.sin(rad(Angle_B_value_I)),
      ],
      [
        Amp_C_value_I * Math.cos(rad(Angle_C_value_I)),
        Amp_C_value_I * Math.sin(rad(Angle_C_value_I)),
      ],
    ];
    ia = toScreenXY(triplet[0], p0_I);
    ib = toScreenXY(triplet[1], p0_I);
    ic = toScreenXY(triplet[2], p0_I);
    window.recordAndUpdate();
  }

  function change_tab_ABC() {
    tab_ABC();
    window.recordAndUpdate();
  }
  function change_tab_123() {
    ganged();
    window.recordAndUpdate();
  }
}

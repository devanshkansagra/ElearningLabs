"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import katex from "katex";
import "../style.css";

// Curve constants
const curveConstants: Record<
  string,
  { A: number; B: number; P: number; L: number; desc: string }
> = {
  "SEL U1": { A: 1.5, B: 1, P: 2, L: 0, desc: "Standard SEL curve." },
  "SEL U2": { A: 1.8, B: 1, P: 2, L: 0, desc: "Moderately faster SEL curve." },
  "SEL U3": {
    A: 2.0,
    B: 1,
    P: 2,
    L: 0,
    desc: "Faster SEL curve for high fault.",
  },
  "SEL U4": { A: 2.5, B: 1, P: 2, L: 0, desc: "Even faster SEL curve." },
  "SEL U5": { A: 3.0, B: 1, P: 2, L: 0, desc: "Highly sensitive SEL curve." },
  "IEEE MI": {
    A: 0.0515,
    B: 0.114,
    P: 0.02,
    L: 0,
    desc: "IEEE Moderately Inverse.",
  },
  "IEEE VI": { A: 19.61, B: 0.491, P: 2, L: 0, desc: "IEEE Very Inverse." },
  "IEEE EI": {
    A: 28.2,
    B: 0.1217,
    P: 2,
    L: 0,
    desc: "IEEE Extremely Inverse.",
  },
  "IEC SI": { A: 0.14, B: 0, P: 0.02, L: 0, desc: "IEC Standard Inverse." },
  "IEC VI": { A: 13.5, B: 0, P: 1, L: 0, desc: "IEC Very Inverse." },
  "IEC EI": { A: 80, B: 0, P: 2, L: 0, desc: "IEC Extremely Inverse." },
  "IEC LTI": { A: 120, B: 0, P: 1, L: 0, desc: "IEC Long-Time Inverse." },
  "IEC STI": { A: 0.05, B: 0, P: 0.04, L: 0, desc: "IEC Short-Time Inverse." },
  "US U1": {
    A: 0.0226,
    B: 0.0104,
    P: 0.02,
    L: 0,
    desc: "US Moderately Inverse.",
  },
  "US U2": { A: 0.18, B: 5.95, P: 2, L: 0, desc: "US Inverse." },
  "US U3": { A: 0.0963, B: 3.88, P: 2, L: 0, desc: "US Very Inverse." },
  "US U4": { A: 0.02434, B: 5.64, P: 2, L: 0, desc: "US Extremely Inverse." },
  "US U5": {
    A: 0.00262,
    B: 0.00342,
    P: 0.02,
    L: 0,
    desc: "US Short-Time Inverse.",
  },
  "UK LTI": { A: 120, B: 0, P: 1, L: 0, desc: "UK Long-Time Inverse." },
  "UK R": { A: 45900, B: 0, P: 5.6, L: 0, desc: "UK Reset curve." },
};

const curvesByStandard: Record<string, string[]> = {
  SEL: ["SEL U1", "SEL U2", "SEL U3", "SEL U4", "SEL U5"],
  IEEE: ["IEEE MI", "IEEE VI", "IEEE EI"],
  IEC: ["IEC SI", "IEC VI", "IEC EI", "IEC LTI", "IEC STI"],
  US: ["US U1", "US U2", "US U3", "US U4", "US U5"],
  UK: ["UK LTI", "UK R"],
};

const standards = ["SEL", "IEEE", "IEC", "US", "UK"];

// Helper function to compute time
function computeTime(
  current: number,
  pickup: number,
  A: number,
  B: number,
  P: number,
  L: number,
  timeDial: number,
): number {
  if (current <= pickup) return Infinity;
  const part = Math.pow(current / pickup, P) - 1;
  if (part <= 0) return NaN;
  const result = timeDial * (A / part + B) + L;
  return result > 0 ? result : NaN;
}

export default function Lab2() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [standard, setStandard] = useState("IEEE");
  const [standardIndex, setStandardIndex] = useState(standards.indexOf("IEEE"));
  const [activeTab, setActiveTab] = useState<"primary" | "secondary">(
    "primary",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [coordinationResult, setCoordinationResult] = useState<{
    pass: boolean;
    delta: number;
    current: number;
    margin: number;
  } | null>(null);

  // System parameters
  const [powerRating, setPowerRating] = useState(40);
  const [hvVoltage, setHvVoltage] = useState(132);
  const [lvVoltage, setLvVoltage] = useState(11);
  const [impedance, setImpedance] = useState(8);
  const [ctRatioHV, setCtRatioHV] = useState(200);
  const [ctRatioLV, setCtRatioLV] = useState(2000);
  const [pickupMargin, setPickupMargin] = useState(10);
  const [coordinationMargin, setCoordinationMargin] = useState(0.3);
  const [coordinationCurrent, setCoordinationCurrent] = useState<number | "">(
    "",
  );
  const [tripTimeHV, setTripTimeHV] = useState(0.8);
  const [tripTimeLV, setTripTimeLV] = useState(0.6);

  // Curve parameters
  const [curve1Type, setCurve1Type] = useState("IEEE MI");
  const [curve1Pickup, setCurve1Pickup] = useState(192.45);
  const [curve1TimeDial, setCurve1TimeDial] = useState(0.66);
  const [curve2Type, setCurve2Type] = useState("IEEE MI");
  const [curve2Pickup, setCurve2Pickup] = useState(2309.4);
  const [curve2TimeDial, setCurve2TimeDial] = useState(0.47);

  // Damage curve mode
  const [damageMode, setDamageMode] = useState<"manual" | "formula">("formula");
  const [manualCurrent, setManualCurrent] = useState(
    "2800,4000,10000,20000,30000",
  );
  const [manualTime, setManualTime] = useState("100000,100,50,2,1");
  const [faultCurrent, setFaultCurrent] = useState(26250);
  const [tDamage, setTDamage] = useState(2);

  // Results
  const [primaryResults, setPrimaryResults] = useState<Record<string, string>>(
    {},
  );
  const [secondaryResults, setSecondaryResults] = useState<
    Record<string, string>
  >({});

  // Curve constants
  const [curveConstantsHV, setCurveConstantsHV] = useState({
    A: 0.0515,
    B: 0.114,
    P: 0.02,
    L: 0,
  });
  const [curveConstantsLV, setCurveConstantsLV] = useState({
    A: 0.0515,
    B: 0.114,
    P: 0.02,
    L: 0,
  });

  // Chart refs
  const margin = { top: 50, right: 100, bottom: 50, left: 60 };
  const width = 650 - margin.left - margin.right;
  const height = 650 - margin.top - margin.bottom;

  // Cycle through standards
  const cycleStandard = useCallback(() => {
    const newIndex = (standardIndex + 1) % standards.length;
    setStandardIndex(newIndex);
    setStandard(standards[newIndex]);
    const newCurveOptions =
      curvesByStandard[standards[newIndex] as keyof typeof curvesByStandard];
    setCurve1Type(newCurveOptions[0]);
    setCurve2Type(newCurveOptions[0]);
  }, [standardIndex]);

  // Update curve constants when curve type changes
  useEffect(() => {
    const constants = curveConstants[curve1Type];
    setCurveConstantsHV(constants);
  }, [curve1Type]);

  useEffect(() => {
    const constants = curveConstants[curve2Type];
    setCurveConstantsLV(constants);
  }, [curve2Type]);

  // Calculate settings
  const calculateSettings = useCallback(() => {
    const ctSecondary = standard === "IEC" || standard === "UK" ? 1 : 5;

    // Full Load Current for LV and HV Sides
    const I_FL_LV = (powerRating * 1e6) / (Math.sqrt(3) * lvVoltage * 1e3);
    const I_FL_HV = (powerRating * 1e6) / (Math.sqrt(3) * hvVoltage * 1e3);
    const I_FL_LVsec = I_FL_LV / (ctRatioLV / ctSecondary);
    const I_FL_HVsec = I_FL_HV / (ctRatioHV / ctSecondary);

    const I_F_LV = I_FL_LV / (impedance / 100);
    const I_F_HV = I_FL_HV / (impedance / 100);
    const I_F_LVsec = I_F_LV / (ctRatioLV / ctSecondary);
    const I_F_HVsec = I_F_HV / (ctRatioHV / ctSecondary);

    // Pickup = (1+pickupMargin)*I_FL
    const pickupMarginDecimal = pickupMargin / 100;
    const I_set_LV_primary = (1 + pickupMarginDecimal) * I_FL_LV;
    const I_set_HV_primary = (1 + pickupMarginDecimal) * I_FL_HV;
    const I_set_LV_primarysec = I_set_LV_primary / (ctRatioLV / ctSecondary);
    const I_set_HV_primarysec = I_set_HV_primary / (ctRatioHV / ctSecondary);

    // Update pickup values
    setCurve1Pickup(I_set_HV_primary);
    setCurve2Pickup(I_set_LV_primary);

    // Fault Current Multiples (PSM)
    const PSM_LV = I_F_LV / I_set_LV_primary;
    const PSM_HV = I_F_HV / I_set_HV_primary;

    // Calculate TMS
    const denomLV = Math.pow(PSM_LV, curveConstantsLV.P) - 1;
    const denomHV = Math.pow(PSM_HV, curveConstantsHV.P) - 1;

    let TMS_LV = 0;
    let TMS_HV = 0;

    if (denomLV > 0 && denomHV > 0) {
      TMS_LV =
        (tripTimeLV - curveConstantsLV.L) /
        (curveConstantsLV.A / denomLV + curveConstantsLV.B);
      TMS_HV =
        (tripTimeHV - curveConstantsHV.L) /
        (curveConstantsHV.A / denomHV + curveConstantsHV.B);
    }

    setCurve1TimeDial(TMS_HV);
    setCurve2TimeDial(TMS_LV);

    // Coordination check
    const coordCurrent = coordinationCurrent || I_F_LV;
    const tLVCoord = computeTime(
      coordCurrent,
      curve2Pickup,
      curveConstantsLV.A,
      curveConstantsLV.B,
      curveConstantsLV.P,
      curveConstantsLV.L,
      curve2TimeDial,
    );
    const tHVCoord = computeTime(
      coordCurrent,
      curve1Pickup,
      curveConstantsHV.A,
      curveConstantsHV.B,
      curveConstantsHV.P,
      curveConstantsHV.L,
      curve1TimeDial,
    );

    let coordResult = null;
    if (Number.isFinite(tLVCoord) && Number.isFinite(tHVCoord)) {
      const deltaCoord = tHVCoord - tLVCoord;
      coordResult = {
        pass: deltaCoord >= coordinationMargin,
        delta: deltaCoord,
        current: coordCurrent,
        margin: coordinationMargin,
      };
      setCoordinationResult(coordResult);
    }

    // Set primary results
    setPrimaryResults({
      I_FL_HV: I_FL_HV.toFixed(2),
      I_FL_LV: I_FL_LV.toFixed(2),
      I_F_LV: I_F_LV.toFixed(2),
      I_F_HV: I_F_HV.toFixed(2),
      I_set_LV: I_set_LV_primary.toFixed(2),
      I_set_HV: I_set_HV_primary.toFixed(2),
      TSM_LV: TMS_LV.toFixed(2),
      TSM_HV: TMS_HV.toFixed(2),
      PSM: PSM_LV.toFixed(2),
    });

    // Set secondary results
    setSecondaryResults({
      I_FL_HV_sec: I_FL_HVsec.toFixed(2),
      I_FL_LV_sec: I_FL_LVsec.toFixed(2),
      I_F_LV_sec: I_F_LVsec.toFixed(2),
      I_F_HV_sec: I_F_HVsec.toFixed(2),
      I_set_LV_sec: I_set_LV_primarysec.toFixed(2),
      I_set_HV_sec: I_set_HV_primarysec.toFixed(2),
      PSM_LV: PSM_LV.toFixed(2),
      PSM_HV: PSM_HV.toFixed(2),
      TSM_LV_sec: TMS_LV.toFixed(2),
      TSM_HV_sec: TMS_HV.toFixed(2),
    });

    // Check warnings
    const newWarnings: string[] = [];
    if (curve1Pickup < 100 || curve1Pickup > 100000) {
      newWarnings.push("Pickup for HV curve is out of range [100, 100000].");
    }
    if (curve2Pickup < 100 || curve2Pickup > 100000) {
      newWarnings.push("Pickup for LV curve is out of range [100, 100000].");
    }
    if (curve1TimeDial < 0.1 || curve1TimeDial > 100) {
      newWarnings.push("Time Dial for HV curve is out of range [0.1, 100].");
    }
    if (curve2TimeDial < 0.1 || curve2TimeDial > 100) {
      newWarnings.push("Time Dial for LV curve is out of range [0.1, 100].");
    }
    setWarnings(newWarnings);
  }, [
    powerRating,
    hvVoltage,
    lvVoltage,
    impedance,
    ctRatioHV,
    ctRatioLV,
    pickupMargin,
    coordinationMargin,
    coordinationCurrent,
    tripTimeHV,
    tripTimeLV,
    curve1Pickup,
    curve2Pickup,
    curve1TimeDial,
    curve2TimeDial,
    curve1Type,
    curve2Type,
    curveConstantsHV,
    curveConstantsLV,
    standard,
  ]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const svgRoot = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("id", "svg");

    const g = svgRoot
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLog().domain([100, 100000]).range([0, width]);

    const y = d3.scaleLog().domain([0.01, 100000]).range([height, 0]);

    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => ""),
      );

    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => ""),
      );

    // Axes
    const xAxis = d3
      .axisBottom(x)
      .tickValues([100, 1000, 10000, 100000])
      .tickFormat(d3.format(".0f"));

    const yAxis = d3
      .axisLeft(y)
      .tickValues([0.01, 1, 10, 100, 1000, 100000])
      .tickFormat(d3.format(".0f"));

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    g.append("g").attr("class", "axis").call(yAxis);

    // Axis labels
    g.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .style("text-anchor", "middle")
      .style("fill", "#475569")
      .text("Current (A)");

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .style("text-anchor", "middle")
      .style("fill", "#475569")
      .text("Time (seconds)");

    g.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", -25)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "1rem")
      .style("fill", "#1e293b")
      .text("Time Current Curves Coordination");

    // Generate curve data
    const currentPoints = d3.range(100, 100001, 1);

    interface CurveData {
      id: string;
      color: string;
      type: string;
      pickup: number;
      timeDial: number;
    }

    const curves: CurveData[] = [
      {
        id: "HV curve",
        color: "#15803d",
        type: curve1Type,
        pickup: curve1Pickup,
        timeDial: curve1TimeDial,
      },
      {
        id: "LV curve",
        color: "#b45309",
        type: curve2Type,
        pickup: curve2Pickup,
        timeDial: curve2TimeDial,
      },
    ];

    // Draw curves
    curves.forEach((d) => {
      const constants = curveConstants[d.type];
      const data = currentPoints
        .map((current: number) => {
          const time = computeTime(
            current,
            d.pickup,
            constants.A,
            constants.B,
            constants.P,
            constants.L,
            d.timeDial,
          );
          return isNaN(time) || time > 10000 ? null : { current, time };
        })
        .filter((dd): dd is { current: number; time: number } => dd !== null);

      if (data.length > 0) {
        g.append("path")
          .datum(data)
          .attr("class", "curve")
          .attr("id", d.id)
          .attr("fill", "none")
          .attr("stroke", d.color)
          .attr("stroke-width", 2)
          .attr(
            "d",
            d3
              .line<{ current: number; time: number }>()
              .x((dd) => x(dd.current))
              .y((dd) => y(dd.time)),
          );
      }
    });

    // Add curve labels
    curves.forEach((d: CurveData) => {
      const constants = curveConstants[d.type];
      const data = currentPoints
        .map((current: number) => {
          const time = computeTime(
            current,
            d.pickup,
            constants.A,
            constants.B,
            constants.P,
            constants.L,
            d.timeDial,
          );
          return isNaN(time) || time > 10000 ? null : { current, time };
        })
        .filter((dd): dd is { current: number; time: number } => dd !== null);

      if (data.length > 0) {
        const lastPoint = data[data.length - 1];
        g.append("text")
          .attr("class", "curve-label")
          .attr("x", x(lastPoint.current) + 10)
          .attr("y", y(lastPoint.time))
          .text(d.id)
          .style("fill", d.color)
          .style("font-size", "1rem")
          .style("font-weight", "600");
      }
    });

    // Damage curve
    if (damageMode === "formula") {
      const C = Math.pow(faultCurrent, 2) * tDamage;
      const damageData = d3
        .range(1000, faultCurrent * 1.2, 500)
        .map((current: number) => ({
          current,
          time: C / Math.pow(current, 2),
        }));

      g.append("path")
        .datum(damageData)
        .attr("class", "damage-curve")
        .attr("fill", "none")
        .attr("stroke", "#b91c1c")
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line<{ current: number; time: number }>()
            .x((dd) => x(dd.current))
            .y((dd) => y(dd.time)),
        );

      const lastDamagePoint = damageData[damageData.length - 1];
      g.append("text")
        .attr("class", "damage-curve")
        .attr("x", x(lastDamagePoint.current))
        .attr("y", y(lastDamagePoint.time))
        .style("fill", "#b91c1c")
        .style("font-weight", "600")
        .text("Damage Curve");
    } else {
      const manualCurrents = manualCurrent.split(",").map(Number);
      const manualTimes = manualTime.split(",").map(Number);
      if (manualCurrents.length === manualTimes.length) {
        const damageData = manualCurrents.map((current: number, i: number) => ({
          current,
          time: manualTimes[i],
        }));
        g.append("path")
          .datum(damageData)
          .attr("class", "damage-curve")
          .attr("fill", "none")
          .attr("stroke", "#b91c1c")
          .attr("stroke-width", 2)
          .attr(
            "d",
            d3
              .line<{ current: number; time: number }>()
              .x((dd) => x(dd.current))
              .y((dd) => y(dd.time)),
          );
      }
    }

    // Fault coordinates
    const I_F_LV =
      (powerRating * 1e6) /
      (Math.sqrt(3) * lvVoltage * 1e3) /
      (impedance / 100);
    const I_F_HV =
      (powerRating * 1e6) /
      (Math.sqrt(3) * hvVoltage * 1e3) /
      (impedance / 100);

    // LV fault
    g.append("line")
      .attr("x1", x(I_F_LV + 100))
      .attr("y1", y(0.01))
      .attr("x2", x(I_F_LV + 100))
      .attr("y2", y(tripTimeLV + 0.01))
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    g.append("line")
      .attr("x1", x(100))
      .attr("y1", y(tripTimeLV + 0.01))
      .attr("x2", x(I_F_LV + 100))
      .attr("y2", y(tripTimeLV + 0.01))
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    g.append("circle")
      .attr("cx", x(I_F_LV + 100))
      .attr("cy", y(tripTimeLV + 0.01))
      .attr("r", 5)
      .attr("fill", "#FFFF00");

    // HV fault
    g.append("line")
      .attr("x1", x(I_F_HV + 100))
      .attr("y1", y(0.01))
      .attr("x2", x(I_F_HV + 100))
      .attr("y2", y(tripTimeHV + 0.01))
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    g.append("line")
      .attr("x1", x(100))
      .attr("y1", y(tripTimeHV + 0.01))
      .attr("x2", x(I_F_HV + 100))
      .attr("y2", y(tripTimeHV + 0.01))
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    g.append("circle")
      .attr("cx", x(I_F_HV + 100))
      .attr("cy", y(tripTimeHV + 0.01))
      .attr("r", 5)
      .attr("fill", "#00FF00");
  }, [
    curve1Type,
    curve2Type,
    curve1Pickup,
    curve2Pickup,
    curve1TimeDial,
    curve2TimeDial,
    damageMode,
    manualCurrent,
    manualTime,
    faultCurrent,
    tDamage,
    powerRating,
    hvVoltage,
    lvVoltage,
    impedance,
    tripTimeHV,
    tripTimeLV,
  ]);

  // Initialize
  useEffect(() => {
    calculateSettings();
  }, [calculateSettings]);

  // Equation display
  const renderEquationHV = () => {
    const LText = curveConstantsHV.L === 0 ? "" : ` + ${curveConstantsHV.L}`;
    const BText = curveConstantsHV.B !== 0 ? ` + ${curveConstantsHV.B}` : "";
    return `t = ${curve1TimeDial.toFixed(2)} * \\left(\\frac{${curveConstantsHV.A.toFixed(2)}}{(I/I_s)^{${curveConstantsHV.P}}-1}${BText}\\right)${LText} { sec}`;
  };

  const renderEquationLV = () => {
    const LText = curveConstantsLV.L === 0 ? "" : ` + ${curveConstantsLV.L}`;
    const BText = curveConstantsLV.B !== 0 ? ` + ${curveConstantsLV.B}` : "";
    return `t = ${curve2TimeDial.toFixed(2)} * \\left(\\frac{${curveConstantsLV.A.toFixed(2)}}{(I/I_s)^{${curveConstantsLV.P}}-1}${BText}\\right)${LText} { sec}`;
  };

  return (
    <main className="container mx-auto p-4 lg:p-8 max-w-[1600px] min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Overcurrent Curves Calculator
          </h1>
          <p className="text-slate-500 mt-1">
            Interactive relay coordination and damage curve analyzer
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-secondary text-sm px-4 py-2 hover:shadow-lg"
          >
            View Curve Constants
          </button>
          <button
            onClick={cycleStandard}
            className="btn-primary text-sm px-6 py-2 shadow-lg"
          >
            {standard}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Side: Chart (8 columns) */}
        <div className="xl:col-span-8">
          <div
            id="svg-container"
            className="bg-card p-2 rounded-2xl border-gray-200 shadow relative overflow-hidden group"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 650 650"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-auto cursor-crosshair"
            />
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[10px] text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              CTRL+Drag to adjust TSM • Drag to shift Pickup
            </div>
          </div>
          <section className="mt-5 bg-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex bg-slate-100/50 border-b border-slate-800">
              <button
                className={`tab-button ${activeTab === "primary" ? "active" : ""}`}
                onClick={() => setActiveTab("primary")}
              >
                Primary
              </button>
              <button
                className={`tab-button ${activeTab === "secondary" ? "active" : ""}`}
                onClick={() => setActiveTab("secondary")}
              >
                Secondary
              </button>
            </div>
            {activeTab === "primary" ? (
              <div id="tabs-1" className="tab-content p-4 space-y-4">
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Load currents
                  </h4>
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>FL,HV</sub> = ${primaryResults["I_FL_HV"] || ""} A`,
                    }}
                  />
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>FL,LV</sub> = ${primaryResults["I_FL_LV"] || ""} A`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Fault currents
                  </h4>
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>F,LV</sub> = ${primaryResults["I_F_LV"] || ""} A`,
                    }}
                  />
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>F,HV</sub> = ${primaryResults["I_F_HV"] || ""} A`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Pick-up currents
                  </h4>
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>set,LV</sub> = ${primaryResults["I_set_LV"] || ""} A`,
                    }}
                  />
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>set,HV</sub> = ${primaryResults["I_set_HV"] || ""} A`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Plug Multiplier
                  </h4>
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `PSM = ${primaryResults["PSM"] || ""}`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Time Multiplier
                  </h4>
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `TSM<sub>LV</sub> = ${primaryResults["TSM_LV"] || ""}`,
                    }}
                  />
                  <p
                    className="primary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `TSM<sub>HV</sub> = ${primaryResults["TSM_HV"] || ""}`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div id="tabs-2" className="tab-content p-4 space-y-4">
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Load currents
                  </h4>
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>FL,HV</sub> = ${secondaryResults["I_FL_HV_sec"] || ""} A`,
                    }}
                  />
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>FL,LV</sub> = ${secondaryResults["I_FL_LV_sec"] || ""} A`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Fault currents
                  </h4>
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>F,LV</sub> = ${secondaryResults["I_F_LV_sec"] || ""} A`,
                    }}
                  />
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>F,HV</sub> = ${secondaryResults["I_F_HV_sec"] || ""} A`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    Pick-up currents
                  </h4>
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>set,LV</sub> = ${secondaryResults["I_set_LV_sec"] || ""} A`,
                    }}
                  />
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `I<sub>set,HV</sub> = ${secondaryResults["I_set_HV_sec"] || ""} A`,
                    }}
                  />
                </div>
                <div className="result-group p-2 border-t border-slate-800 pt-3">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    PSM Settings
                  </h4>
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `PSM<sub>LV</sub> = ${secondaryResults["PSM_LV"] || ""}`,
                    }}
                  />
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `PSM<sub>HV</sub> = ${secondaryResults["PSM_HV"] || ""}`,
                    }}
                  />
                </div>
                <div className="result-group p-2">
                  <h4 className="hidden text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                    TSM Settings
                  </h4>
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `TSM<sub>LV</sub> = ${secondaryResults["TSM_LV_sec"] || ""}`,
                    }}
                  />
                  <p
                    className="secondary text-sm"
                    dangerouslySetInnerHTML={{
                      __html: `TSM<sub>HV</sub> = ${secondaryResults["TSM_HV_sec"] || ""}`,
                    }}
                  />
                </div>
              </div>
            )}
            {coordinationResult && (
              <div
                id="coordinationCheckResult"
                className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs font-semibold"
              >
                Coordination check:{" "}
                <span
                  style={{
                    color: coordinationResult.pass ? "#15803d" : "#b91c1c",
                  }}
                >
                  {coordinationResult.pass ? "PASS" : "FAIL"}
                  (dt={coordinationResult.delta.toFixed(3)} s vs margin{" "}
                  {coordinationResult.margin.toFixed(3)} s @{" "}
                  {coordinationResult.current.toFixed(1)} A)
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Right Side: All Details (4 columns) */}
        <div className="xl:col-span-4 space-y-6">
          {/* HV Curve Card */}
          <section className="bg-card p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-[#15803d] flex items-center gap-2 mb-2">
              <span className="w-2 h-6 bg-[#15803d] rounded-full shadow-[0_2px_4px_rgba(21,128,61,0.2)]"></span>
              HV Curve Settings
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Curve Type
                </label>
                <select
                  id="curve1-type"
                  className="custom-select"
                  value={curve1Type}
                  onChange={(e) => setCurve1Type(e.target.value)}
                >
                  {curvesByStandard[
                    standard as keyof typeof curvesByStandard
                  ].map((curve) => (
                    <option key={curve} value={curve}>
                      {curve}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Pickup (A)
                  </label>
                  <input
                    type="number"
                    id="curve1-pickup"
                    className="custom-input"
                    value={curve1Pickup.toFixed(2)}
                    onChange={(e) => setCurve1Pickup(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    id="TMS_TD_HV"
                    className="text-xs uppercase tracking-wider text-slate-500 font-bold"
                  >
                    {standard === "IEC" || standard === "UK" ? "TSM" : "TD"}
                  </label>
                  <input
                    type="number"
                    id="curve1TimeDial"
                    className="custom-input"
                    value={curve1TimeDial}
                    step="0.001"
                    onChange={(e) => setCurve1TimeDial(Number(e.target.value))}
                  />
                </div>
              </div>
              <div
                id="equationHV"
                className="p-3 bg-slate-100/50 rounded-lg text-[#15803d] text-center overflow-x-auto min-h-[3rem] flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(renderEquationHV(), {
                    throwOnError: false,
                  }),
                }}
              />
            </div>
          </section>

          {/* LV Curve Card */}
          <section className="bg-card p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-[#b45309] flex items-center gap-2 mb-2">
              <span className="w-2 h-6 bg-[#b45309] rounded-full shadow-[0_2px_4px_rgba(180,83,9,0.2)]"></span>
              LV Curve Settings
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Curve Type
                </label>
                <select
                  id="curve2-type"
                  className="custom-select"
                  value={curve2Type}
                  onChange={(e) => setCurve2Type(e.target.value)}
                >
                  {curvesByStandard[
                    standard as keyof typeof curvesByStandard
                  ].map((curve) => (
                    <option key={curve} value={curve}>
                      {curve}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Pickup (A)
                  </label>
                  <input
                    type="number"
                    id="curve2-pickup"
                    className="custom-input"
                    value={curve2Pickup.toFixed(2)}
                    onChange={(e) => setCurve2Pickup(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    id="TMS_TD_LV"
                    className="text-xs uppercase tracking-wider text-slate-500 font-bold"
                  >
                    {standard === "IEC" || standard === "UK" ? "TSM" : "TD"}
                  </label>
                  <input
                    type="number"
                    id="curve2TimeDial"
                    className="custom-input"
                    value={curve2TimeDial}
                    step="0.001"
                    onChange={(e) => setCurve2TimeDial(Number(e.target.value))}
                  />
                </div>
              </div>
              <div
                id="equationLV"
                className="p-3 bg-slate-100/50 rounded-lg text-[#b45309] text-center overflow-x-auto min-h-[3rem] flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(renderEquationLV(), {
                    throwOnError: false,
                  }),
                }}
              />
            </div>
          </section>

          {warnings.length > 0 && (
            <div id="warning-messages" className="mt-4 text-red-500 text-sm">
              {warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          )}

          {/* System Parameters */}
          <section className="bg-card p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              System Parameters
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs text-slate-500 font-medium">
                  Power Rating (MVA)
                </label>
                <input
                  type="number"
                  id="powerRating"
                  className="custom-input !w-20 text-right"
                  value={powerRating}
                  onChange={(e) => setPowerRating(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  HV Voltage (kV)
                </label>
                <input
                  type="number"
                  id="hvVoltage"
                  className="custom-input !w-20 text-right"
                  value={hvVoltage}
                  onChange={(e) => setHvVoltage(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  LV Voltage (kV)
                </label>
                <input
                  type="number"
                  id="lvVoltage"
                  className="custom-input !w-20 text-right"
                  value={lvVoltage}
                  onChange={(e) => setLvVoltage(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2 mb-2">
                <label className="text-xs text-slate-500 font-medium italic">
                  Impedance (%Z)
                </label>
                <input
                  type="number"
                  id="impedance"
                  className="custom-input !w-20 text-right"
                  value={impedance}
                  onChange={(e) => setImpedance(Number(e.target.value))}
                />
              </div>

              {/* Tooltip-enabled margins */}
              <div className="flex items-center justify-between gap-4">
                <span className="tooltip flex items-center gap-1 text-xs text-slate-500 font-medium cursor-help">
                  Pickup Margin (%){" "}
                  <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-500">
                    ?
                  </span>
                  <span className="tooltiptext">
                    Standard safety buffer above full-load to prevent nuisance
                    tripping.
                  </span>
                </span>
                <input
                  type="number"
                  id="pickupMargin"
                  className="custom-input !w-20 text-right"
                  value={pickupMargin}
                  step="0.01"
                  onChange={(e) => setPickupMargin(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="tooltip flex items-center gap-1 text-xs text-slate-500 font-medium cursor-help">
                  Coord. Margin (s){" "}
                  <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-500">
                    ?
                  </span>
                  <span className="tooltiptext">
                    Required time gap for selectivity between upstream and
                    downstream relays.
                  </span>
                </span>
                <input
                  type="number"
                  id="coordinationMargin"
                  className="custom-input !w-20 text-right"
                  value={coordinationMargin}
                  step="0.1"
                  onChange={(e) =>
                    setCoordinationMargin(Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-1 mt-4">
                <label className="text-[10px] uppercase font-bold text-[#0284c7] tracking-tighter">
                  Coordination Check Current (A)
                </label>
                <input
                  type="number"
                  id="coordinationCurrent"
                  placeholder="Auto (I_fault)"
                  className="custom-input"
                  value={coordinationCurrent}
                  onChange={(e) =>
                    setCoordinationCurrent(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#15803d] tracking-tighter">
                    HV Trip (s)
                  </label>
                  <input
                    type="number"
                    id="tripTimeHV"
                    className="custom-input"
                    value={tripTimeHV}
                    onChange={(e) => setTripTimeHV(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#b45309] tracking-tighter">
                    LV Trip (s)
                  </label>
                  <input
                    type="number"
                    id="tripTimeLV"
                    className="custom-input"
                    value={tripTimeLV}
                    onChange={(e) => setTripTimeLV(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <label className="text-xs font-bold text-[#b91c1c] uppercase mb-2 block">
                  Damage Curve Mode
                </label>
                <select
                  id="mode"
                  className="custom-select mb-3"
                  value={damageMode}
                  onChange={(e) =>
                    setDamageMode(e.target.value as "manual" | "formula")
                  }
                >
                  <option value="manual">Manual Points</option>
                  <option value="formula">t = C / I²</option>
                </select>

                {damageMode === "manual" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">
                        Current Pts
                      </label>
                      <input
                        type="text"
                        id="manualCurrent"
                        className="custom-input text-xs"
                        value={manualCurrent}
                        onChange={(e) => setManualCurrent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">
                        Time Pts
                      </label>
                      <input
                        type="text"
                        id="manualTime"
                        className="custom-input text-xs"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">
                        Fault (A)
                      </label>
                      <input
                        type="number"
                        id="faultCurrent"
                        className="custom-input"
                        value={faultCurrent}
                        onChange={(e) =>
                          setFaultCurrent(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">
                        Time (s)
                      </label>
                      <input
                        type="number"
                        id="tDamage"
                        className="custom-input"
                        value={tDamage}
                        onChange={(e) => setTDamage(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden CT ratio inputs */}
              <input type="hidden" id="ctRatioHV" value={ctRatioHV} />
              <input type="hidden" id="ctRatioLV" value={ctRatioLV} />

              <button
                type="button"
                id="buttonCalculate"
                onClick={calculateSettings}
                className="w-full mt-6 bg-[#0284c7] hover:bg-[#0284c7]/90 text-dark font-bold py-3 rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                RUN COORDINATION
              </button>
            </div>
          </section>

          {/* Calculation Results */}
        </div>
      </div>

      {/* Modal for Curve Constants */}
      {modalOpen && (
        <div
          id="curveConstantsModal"
          className="modal"
          style={{ display: "block" }}
        >
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Overcurrent Relay Curve Constants
              </h2>
              <span
                className="close text-3xl text-slate-400 hover:text-slate-900 cursor-pointer transition-colors"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </span>
            </div>
            <p className="text-slate-500 mb-6 text-sm">
              Below is a table of curve constants used for different overcurrent
              relay characteristics aligned with industry standards like IEEE,
              IEC, and SEL documentation.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Curve Type</th>
                    <th>A</th>
                    <th>B</th>
                    <th>P</th>
                    <th>L</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(curveConstants)
                    .filter(([type]) =>
                      curvesByStandard[
                        standard as keyof typeof curvesByStandard
                      ].includes(type),
                    )
                    .map(([type, constants]) => (
                      <tr key={type}>
                        <td>{type}</td>
                        <td>{constants.A}</td>
                        <td>{constants.B}</td>
                        <td>{constants.P}</td>
                        <td>{constants.L}</td>
                        <td>{constants.desc}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex gap-4 text-xs">
              <span className="text-slate-500">References:</span>
              <a
                href="https://standards.ieee.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0284c7] underline hover:no-underline"
              >
                IEEE C37.112
              </a>
              <a
                href="https://www.iec.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0284c7] underline hover:no-underline"
              >
                IEC 60255
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

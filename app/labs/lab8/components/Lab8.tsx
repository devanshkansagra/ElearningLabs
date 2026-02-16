"use client";
import * as d3 from "d3";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  calculateSettings,
  formatCalculationResults,
  CalculationResults,
} from "../utils/calculator";

// KaTeX rendering helper
const renderKatex = (element: HTMLElement, formula: string) => {
  if (typeof window === "undefined") return;

  // Dynamically import katex on client side
  import("katex")
    .then((katexModule) => {
      const katex = katexModule.default || katexModule;
      try {
        // Clear the element first
        element.innerHTML = "";
        // Render KaTeX with HTML output
        katex.render(formula, element, {
          throwOnError: false,
          displayMode: false,
          output: "html",
        });
      } catch (e) {
        console.warn("KaTeX rendering error:", e);
        // Fallback to plain text
        element.textContent = formula;
      }
    })
    .catch((e) => {
      console.warn("KaTeX import error:", e);
      // Fallback to plain text
      element.textContent = formula;
    });
};

interface CurveData {
  x: number;
  y: number;
}

interface Dataset {
  dLV: CurveData[];
  dHV: CurveData[];
}

export function Lab8() {
  // State for form values
  const [powerRating, setPowerRating] = useState(50);
  const [lvVoltage, setLvVoltage] = useState(33);
  const [hvVoltage, setHvVoltage] = useState(132);
  const [impedance, setImpedance] = useState(12);
  const [ctRatioLV, setCtRatioLV] = useState(1000);
  const [ctRatioHV, setCtRatioHV] = useState(300);
  const [tripTimeLV, setTripTimeLV] = useState(0.6);
  const [tripTimeHV, setTripTimeHV] = useState(0.8);

  // State for curve selection
  const [selectedLVCurve, setSelectedLVCurve] = useState<string | null>(null);
  const [selectedHVCurve, setSelectedHVCurve] = useState<string | null>(null);
  const [timemultval, setTimeMultVal] = useState(1.0);
  const [timemultval2, setTimeMultVal2] = useState(1.0);
  const [tmsValue, setTmsValue] = useState(1.0);
  const [tmsValue2, setTmsValue2] = useState(1.0);

  // State for calculation results
  const [calculationResults, setCalculationResults] =
    useState<CalculationResults | null>(null);
  const [formattedResults, setFormattedResults] = useState<
    { id: string; label: string; value: string }[]
  >([]);
  const [calculationPerformed, setCalculationPerformed] = useState(false);

  // Refs for D3 visualization
  const svgRef = useRef<SVGSVGElement>(null);

  // Curve parameters
  const Tx = 2;
  const endValue = 2.5;
  const I_Highest = Math.pow(19.61 / (Tx - 0.491) + 1, 1 / 2);
  const I_Highest2 = Math.pow((timemultval2 * 19.61) / (Tx - 0.491) + 1, 1 / 2);

  // Suite values map
  const getSuite = useCallback(() => {
    const suiteValues = new Map<number, number>([
      [1, 1],
      [2, 1.05],
      [3, 1.1],
      [4, 1.15],
      [5, 1.2],
      [6, 1.25],
      [7, 1.3],
      [8, 1.35],
      [9, 1.4],
      [10, 1.45],
      [11, 1.5],
      [12, 1.55],
      [13, 1.6],
      [14, 1.65],
      [15, 1.7],
      [16, 1.75],
      [17, 1.8],
      [18, 1.85],
      [19, 1.9],
      [20, 1.95],
      [21, 2],
      [22, 2.05],
      [23, 2.1],
      [24, 2.15],
      [25, 2.2],
      [26, 2.25],
      [27, 2.3],
      [28, 2.35],
      [29, 2.4],
      [30, endValue],
    ]);
    return suiteValues;
  }, []);

  // Get curve parameters based on curve type
  const getCurveParams = useCallback((curveType: string) => {
    let b = 19.61,
      a = 2,
      l = 0.491;
    switch (curveType) {
      case "IEEE_VI":
        b = 19.61;
        a = 2;
        l = 0.491;
        break;
      case "IEEE_EI":
        b = 28.2;
        a = 2;
        l = 0.1217;
        break;
      case "IEEE_MI":
        b = 0.0515;
        a = 0.02;
        l = 0.114;
        break;
      case "US_I":
        b = 5.95;
        a = 2;
        l = 0.18;
        break;
      case "US_STI":
        b = 0.16758;
        a = 0.02;
        l = 0.11858;
        break;
      case "IEC_VI":
        b = 13.5;
        a = 1;
        l = 0;
        break;
      case "IEC_EI":
        b = 80;
        a = 2;
        l = 0;
        break;
      case "IEC_MI":
        b = 0.14;
        a = 0.02;
        l = 0;
        break;
      case "UK_LTI":
        b = 120;
        a = 1;
        l = 0;
        break;
      case "UK_R":
        b = 45900;
        a = 5.6;
        l = 0;
        break;
      default:
        break;
    }
    return { b, a, l };
  }, []);

  // Update SVG elements when curves change
  const updateCurves = useCallback(() => {
    if (!svgRef.current || (!selectedLVCurve && !selectedHVCurve)) return;

    const suiteValues = getSuite();
    const widthBox = 500;
    const heightBox = 500;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const width_curve = widthBox - margin.left - margin.right;
    const height_curve = heightBox - margin.top - margin.bottom;

    // Calculate domains
    const domx = endValue * I_Highest2;
    const domy = Tx;

    const xscale_curve = d3
      .scaleLinear()
      .range([0, width_curve])
      .domain([0, domx]);
    const yscale_curve = d3
      .scaleLinear()
      .range([0, -height_curve])
      .domain([0, domy]);

    // Generate LV curve data
    let datasetdLV: CurveData[] = [];
    if (selectedLVCurve) {
      const { b, a, l } = getCurveParams(selectedLVCurve);
      const multiplier =
        selectedLVCurve.includes("IEC") || selectedLVCurve.includes("UK")
          ? tmsValue
          : timemultval;
      for (let [, value] of suiteValues) {
        const t = multiplier * (b / (Math.pow(value * I_Highest, a) - 1) + l);
        datasetdLV.push({ x: value * I_Highest, y: t });
      }
    }

    // Generate HV curve data
    let datasetdHV: CurveData[] = [];
    if (selectedHVCurve) {
      const { b, a, l } = getCurveParams(selectedHVCurve);
      const multiplier =
        selectedHVCurve.includes("IEC") || selectedHVCurve.includes("UK")
          ? tmsValue2
          : timemultval2;
      for (let [, value] of suiteValues) {
        const t = multiplier * (b / (Math.pow(value * I_Highest2, a) - 1) + l);
        datasetdHV.push({ x: value * I_Highest2, y: t });
      }
    }

    // Calculate dynamic y-domain if both curves are present
    let newDomy = domy;
    if (datasetdLV.length > 0 && datasetdHV.length > 0) {
      const maxYLV = Math.max(...datasetdLV.map((d) => d.y));
      const maxYHV = Math.max(...datasetdHV.map((d) => d.y));
      newDomy = Math.max(maxYLV, maxYHV, 1) * 1.1;

      // Create new y-scale with dynamic domain
      const newYScale = d3
        .scaleLinear()
        .range([0, -height_curve])
        .domain([0, newDomy]);

      // Update y-axis
      const yAxisGroup = svgRef.current?.querySelector(
        ".y.axis",
      ) as SVGGElement;
      if (yAxisGroup) {
        d3.select(yAxisGroup).call(d3.axisRight(newYScale));
        yAxisGroup.querySelectorAll("*").forEach((el) => {
          el.setAttribute("stroke", "black");
          (el as HTMLElement).style.color = "black";
        });
      }
    }

    // Update LV curve
    const lineGraphLV = d3.select(svgRef.current).select("#pathLV");
    if (datasetdLV.length > 0) {
      const lineFunction = d3
        .line<CurveData>()
        .x((d) => (d.x * width_curve) / domx)
        .y((d) => height_curve - (d.y * height_curve) / newDomy)
        .curve(d3.curveCatmullRom);

      lineGraphLV
        .datum(datasetdLV)
        .transition()
        .duration(100)
        .attr("d", lineFunction)
        .attr("stroke", "springgreen")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .style("display", "block");
    }

    // Update HV curve
    const lineGraphHV = d3.select(svgRef.current).select("#pathHV");
    if (datasetdHV.length > 0) {
      const lineFunction = d3
        .line<CurveData>()
        .x((d) => (d.x * width_curve) / domx)
        .y((d) => height_curve - (d.y * height_curve) / newDomy)
        .curve(d3.curveCatmullRom);

      lineGraphHV
        .datum(datasetdHV)
        .transition()
        .duration(100)
        .attr("d", lineFunction)
        .attr("stroke", "peru")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .style("display", "block");
    }

    // Update area paths
    if (datasetdLV.length > 0 && datasetdHV.length > 0) {
      const datasetPositive: Dataset = { dLV: [], dHV: [] };
      const datasetNegative: Dataset = { dLV: [], dHV: [] };

      for (let i = 0; i < datasetdLV.length; i++) {
        if (datasetdHV[i].y - datasetdLV[i].y <= 0) {
          datasetNegative.dLV.push(datasetdLV[i]);
          datasetNegative.dHV.push(datasetdHV[i]);
        } else {
          datasetPositive.dLV.push(datasetdLV[i]);
          datasetPositive.dHV.push(datasetdHV[i]);
        }
      }

      const lineFunctionLV = d3
        .line<CurveData>()
        .x((d) => (d.x * width_curve) / domx)
        .y((d) => height_curve - (d.y * height_curve) / newDomy)
        .curve(d3.curveCatmullRom);

      const lineFunctionHV = d3
        .line<CurveData>()
        .x((d) => (d.x * width_curve) / domx)
        .y((d) => height_curve - (d.y * height_curve) / newDomy)
        .curve(d3.curveCatmullRom);

      const areaFunctionPositive = d3
        .area<CurveData>()
        .x((d) => (d.x * width_curve) / domx)
        .y0((d) => height_curve - (d.y * height_curve) / newDomy)
        .y1((d, i) => {
          const hvData = datasetPositive.dHV[i];
          return hvData
            ? height_curve - (hvData.y * height_curve) / newDomy
            : 0;
        });

      const areaFunctionNegative = d3
        .area<CurveData>()
        .x((d) => (d.x * width_curve) / domx)
        .y0((d) => height_curve - (d.y * height_curve) / newDomy)
        .y1((d, i) => {
          const hvData = datasetNegative.dHV[i];
          return hvData
            ? height_curve - (hvData.y * height_curve) / newDomy
            : 0;
        });

      d3.select(svgRef.current)
        .select(".area.positive")
        .datum(datasetPositive.dLV)
        .transition()
        .duration(90)
        .attr("d", areaFunctionPositive)
        .attr("fill", "lightgreen")
        .style("opacity", 0.5)
        .style("display", "block");

      d3.select(svgRef.current)
        .select(".area.negative")
        .datum(datasetNegative.dLV)
        .transition()
        .duration(90)
        .attr("d", areaFunctionNegative)
        .attr("fill", "red")
        .style("opacity", 0.5)
        .style("display", "block");
    }

    // Update text labels
    if (selectedLVCurve) {
      const curveNames: Record<string, string> = {
        IEEE_VI: "LV IEEE Very Inverse",
        IEEE_EI: "LV IEEE Extremely Inverse",
        IEEE_MI: "LV IEEE Moderate Inverse",
        US_I: "LV US Inverse",
        US_STI: "LV US Short Time Inverse",
        IEC_VI: "LV IEC Very Inverse",
        IEC_EI: "LV IEC Extremely Inverse",
        IEC_MI: "LV IEC Moderate Inverse",
        UK_LTI: "LV UK Long Time Inverse",
        UK_R: "LV UK Rectifier",
      };
      d3.select(svgRef.current)
        .select("#textLV")
        .text(curveNames[selectedLVCurve] || "")
        .style("fill", "springgreen")
        .style("display", "block");
    }

    if (selectedHVCurve) {
      const curveNames: Record<string, string> = {
        IEEE2_VI: "HV IEEE Very Inverse",
        IEEE2_EI: "HV IEEE Extremely Inverse",
        IEEE2_MI: "HV IEEE Moderate Inverse",
        US2_I: "HV US Inverse",
        US2_STI: "HV US Short Time Inverse",
        IEC2_VI: "HV IEC Very Inverse",
        IEC2_EI: "HV IEC Extremely Inverse",
        IEC2_MI: "HV IEC Moderate Inverse",
        UK2_LTI: "HV UK Long Time Inverse",
        UK2_R: "HV UK Rectifier",
      };
      d3.select(svgRef.current)
        .select("#textHV")
        .text(curveNames[selectedHVCurve] || "")
        .style("fill", "peru")
        .style("display", "block");
    }
  }, [
    selectedLVCurve,
    selectedHVCurve,
    timemultval,
    timemultval2,
    tmsValue,
    tmsValue2,
    getSuite,
    getCurveParams,
    I_Highest,
    I_Highest2,
  ]);

  // Calculate on initial render
  useEffect(() => {
    const results = calculateSettings(
      powerRating,
      lvVoltage,
      hvVoltage,
      impedance,
      ctRatioLV,
      ctRatioHV,
      tripTimeLV,
      tripTimeHV,
    );

    setCalculationResults(results);
    setFormattedResults(formatCalculationResults(results));
    setCalculationPerformed(true);

    // Update calculation section display with KaTeX
    const calculationSection = document.querySelectorAll(
      "#calculation-section p",
    );
    const items = formatCalculationResults(results);

    calculationSection.forEach((element, index) => {
      if (items[index] && element instanceof HTMLElement) {
        renderKatex(element, items[index].value);
      }
    });
  }, [
    powerRating,
    lvVoltage,
    hvVoltage,
    impedance,
    ctRatioLV,
    ctRatioHV,
    tripTimeLV,
    tripTimeHV,
  ]);

  // Update equations when curves or time values change
  useEffect(() => {
    updateEquations();
  }, [
    selectedLVCurve,
    selectedHVCurve,
    timemultval,
    timemultval2,
    tmsValue,
    tmsValue2,
  ]);

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const widthBox = 500;
    const heightBox = 500;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const width_curve = widthBox - margin.left - margin.right;
    const height_curve = heightBox - margin.top - margin.bottom;

    const domx = endValue * I_Highest2;
    const domy = Tx;

    const xscale_curve = d3
      .scaleLinear()
      .range([0, width_curve])
      .domain([0, domx]);
    const yscale_curve = d3
      .scaleLinear()
      .range([0, -height_curve])
      .domain([0, domy]);

    // Create SVG elements
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width_curve + margin.left + margin.right)
      .attr("height", height_curve + margin.top + margin.bottom)
      .style("border-width", "1px")
      .style("border-color", "black")
      .style("overflow", "visible");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add arrow marker
    g.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "steelblue");

    // Add x-axis
    g.append("g")
      .attr("class", "x axis")
      .attr("stroke", "black")
      .attr("transform", `translate(0,${height_curve})`)
      .call(d3.axisTop(xscale_curve).tickFormat((d) => d.toString()))
      .selectAll("line, path, text")
      .attr("stroke", "black")
      .style("color", "black");

    // Add y-axis
    g.append("g")
      .attr("class", "y axis")
      .attr("stroke", "black")
      .attr("transform", `translate(0,${height_curve})`)
      .call(d3.axisRight(yscale_curve).tickFormat((d) => d.toString()))
      .selectAll("line, path, text")
      .attr("stroke", "black")
      .style("color", "black");

    // Create LV group
    const gLV = g
      .append("g")
      .attr("id", "gLV")
      .attr("transform", "translate(0,-10)");

    gLV
      .append("text")
      .attr("id", "textLV")
      .attr("x", 0)
      .attr("y", 0)
      .attr("style", "font-size:1.1rem;fill:springgreen")
      .style("display", "none")
      .text("");

    // Create HV group
    const gHV = g
      .append("g")
      .attr("id", "gHV")
      .attr("transform", "translate(250,-10)");

    gHV
      .append("text")
      .attr("id", "textHV")
      .attr("x", 0)
      .attr("y", 0)
      .attr("style", "font-size:1.1rem;fill:peru")
      .style("display", "none")
      .text("");

    // Create area paths
    g.append("path").attr("class", "area positive").attr("fill", "none");

    g.append("path").attr("class", "area negative").attr("fill", "none");

    // Create line paths
    g.append("path")
      .attr("id", "pathLV")
      .attr("stroke", "springgreen")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("display", "none");

    g.append("path")
      .attr("id", "pathHV")
      .attr("stroke", "peru")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("display", "none");

    // Update curves on selection change
    updateCurves();
  }, [updateCurves, I_Highest2]);

  // Handle form input changes
  const handlePowerRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPowerRating(Number(value));
    const mvaElement = document.getElementById("MVA");
    if (mvaElement) {
      mvaElement.textContent = value + " MVA";
    }
  };

  const handleLvVoltageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLvVoltage(Number(value));
    const lvBusElement = document.getElementById("LV-Bus");
    if (lvBusElement && lvBusElement.firstChild) {
      lvBusElement.firstChild.textContent = value + "kV";
    }
  };

  const handleHvVoltageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHvVoltage(Number(value));
    const hvBusElement = document.getElementById("HV-Bus");
    if (hvBusElement && hvBusElement.firstChild) {
      hvBusElement.firstChild.textContent = value + "kV";
    }
  };

  const handleImpedanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setImpedance(Number(value));
    const impedanceElement = document.getElementById("Impedance");
    if (impedanceElement && impedanceElement.firstChild) {
      impedanceElement.firstChild.textContent = "%Z = " + value + "%";
    }
  };

  const handleCtRatioLVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCtRatioLV(Number(value));
    const lvCtElement = document.getElementById("LV-CT");
    if (lvCtElement && lvCtElement.firstChild) {
      lvCtElement.firstChild.textContent = value + "/1";
    }
  };

  const handleCtRatioHVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCtRatioHV(Number(value));
    const hvCtElement = document.getElementById("HV-CT");
    if (hvCtElement && hvCtElement.firstChild) {
      hvCtElement.firstChild.textContent = value + "/1";
    }
  };

  const handleTripTimeLVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTripTimeLV(Number(e.target.value));
  };

  const handleTripTimeHVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTripTimeHV(Number(e.target.value));
  };

  // Handle curve selection
  const handleCurveSelect = (curveType: string) => {
    if (curveType.startsWith("IEEE") || curveType.startsWith("US")) {
      // Show time dial
      document
        .querySelectorAll(".form12_4")
        .forEach((el) => ((el as HTMLElement).style.display = "inline"));
      document
        .querySelectorAll(".form12_4_2")
        .forEach((el) => ((el as HTMLElement).style.display = "inline"));
      document
        .querySelectorAll(".form13_4")
        .forEach((el) => ((el as HTMLElement).style.display = "none"));
      document
        .querySelectorAll(".form13_4_2")
        .forEach((el) => ((el as HTMLElement).style.display = "none"));
    } else {
      // Show TMS
      document
        .querySelectorAll(".form12_4")
        .forEach((el) => ((el as HTMLElement).style.display = "none"));
      document
        .querySelectorAll(".form12_4_2")
        .forEach((el) => ((el as HTMLElement).style.display = "none"));
      document
        .querySelectorAll(".form13_4")
        .forEach((el) => ((el as HTMLElement).style.display = "inline"));
      document
        .querySelectorAll(".form13_4_2")
        .forEach((el) => ((el as HTMLElement).style.display = "inline"));
    }

    if (curveType.includes("2")) {
      setSelectedHVCurve(curveType);
    } else {
      setSelectedLVCurve(curveType);
    }

    // Update equations with KaTeX
    updateEquations();

    updateCurves();
  };

  // Update equations with KaTeX rendering based on selected curves
  const updateEquations = () => {
    // LV equation
    const equationLVElement = document.getElementById("equationLV");
    if (equationLVElement && selectedLVCurve) {
      const { b, a, l } = getCurveParams(selectedLVCurve);
      const multiplier =
        selectedLVCurve.includes("IEC") || selectedLVCurve.includes("UK")
          ? tmsValue
          : timemultval;
      let LText = l === 0 ? "" : ` + ${l}`;
      const equationFormula = `\\mathrm{LV}:\\ t = ${multiplier.toFixed(
        2,
      )} \\times \\frac{${b.toFixed(2)}}{{\\left(\\frac{I}{I_{\\mathrm{s}}}}\\right)^{${a}}}}${LText}~\\mathrm{s}`;
      renderKatex(equationLVElement, equationFormula);
    }

    // HV equation
    const equationHVElement = document.getElementById("equationHV");
    if (equationHVElement && selectedHVCurve) {
      const { b, a, l } = getCurveParams(selectedHVCurve);
      const multiplier =
        selectedHVCurve.includes("IEC") || selectedHVCurve.includes("UK")
          ? tmsValue2
          : timemultval2;
      let LText = l === 0 ? "" : ` + ${l}`;
      const equationFormula = `\\mathrm{HV}:\\ t = ${multiplier.toFixed(
        2,
      )} \\times \\frac{${b.toFixed(2)}}{{\\left(\\frac{I}{I_{\\mathrm{s}}}}\\right)^{${a}}}}${LText}~\\mathrm{s}`;
      renderKatex(equationHVElement, equationFormula);
    }
  };

  // Handle time dial/TMS changes
  const handleTDialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTimeMultVal(value);
    const tdOut = document.getElementById("TDout");
    if (tdOut) {
      tdOut.textContent = value.toFixed(2);
    }
    updateEquations();
    updateCurves();
  };

  const handleTDial2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTimeMultVal2(value);
    const tdOut2 = document.getElementById("TDout2");
    if (tdOut2) {
      tdOut2.textContent = value.toFixed(2);
    }
    updateEquations();
    updateCurves();
  };

  const handleTTMSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTmsValue(value);
    const tmsOut = document.getElementById("TMSout");
    if (tmsOut) {
      tmsOut.textContent = value.toFixed(2);
    }
    updateEquations();
    updateCurves();
  };

  const handleTTMS2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTmsValue2(value);
    const tmsOut2 = document.getElementById("TMSout2");
    if (tmsOut2) {
      tmsOut2.textContent = value.toFixed(2);
    }
    updateEquations();
    updateCurves();
  };

  // Calculate button handler
  const handleCalculate = () => {
    const tDial = document.getElementById("TDial") as HTMLInputElement;
    const tDial2 = document.getElementById("TDial2") as HTMLInputElement;
    const tTms = document.getElementById("TTMS") as HTMLInputElement;
    const tTms2 = document.getElementById("TTMS2") as HTMLInputElement;

    if (tDial) {
      setTimeMultVal(parseFloat(tDial.value));
      const tdOut = document.getElementById("TDout");
      if (tdOut) tdOut.textContent = tDial.value;
    }
    if (tDial2) {
      setTimeMultVal2(parseFloat(tDial2.value));
      const tdOut2 = document.getElementById("TDout2");
      if (tdOut2) tdOut2.textContent = tDial2.value;
    }
    if (tTms) {
      setTmsValue(parseFloat(tTms.value));
      const tmsOut = document.getElementById("TMSout");
      if (tmsOut) tmsOut.textContent = tTms.value;
    }
    if (tTms2) {
      setTmsValue2(parseFloat(tTms2.value));
      const tmsOut2 = document.getElementById("TMSout2");
      if (tmsOut2) tmsOut2.textContent = tTms2.value;
    }

    // Perform calculator settings calculation using the calculator utility
    const results = calculateSettings(
      powerRating,
      lvVoltage,
      hvVoltage,
      impedance,
      ctRatioLV,
      ctRatioHV,
      tripTimeLV,
      tripTimeHV,
    );

    setCalculationResults(results);
    setFormattedResults(formatCalculationResults(results));
    setCalculationPerformed(true);

    // Update calculation section display
    updateCalculationDisplay(results);

    updateCurves();
  };

  // Update calculation display with KaTeX rendering
  const updateCalculationDisplay = (results: CalculationResults) => {
    const calculationSection = document.querySelectorAll(
      "#calculation-section p",
    );

    const items = formatCalculationResults(results);

    calculationSection.forEach((element, index) => {
      if (items[index] && element instanceof HTMLElement) {
        renderKatex(element, items[index].value);
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-2rem)] max-w-[98vw] mx-auto">
        <div
          className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6 overflow-hidden border border-slate-200"
          id="svg-section"
        >
          <div
            id="OvercurrentOperatingTime"
            className="relative tile h-full w-full grid grid-cols-[1fr_350px]"
          >
            <div className="divCurve relative flex flex-col justify-center items-center gap-6">
              <h1 className="text-5xl font-bold text-blue-600 text-center border-b-2 border-blue-200 pb-3">
                Transformer Over-Current Setting
              </h1>
              <div
                className="svgCurveContainer grid bg-white rounded-lg shadow-inner border border-slate-200 p-4"
                id="divCurveContainerId"
              >
                <div className="t text-2xl font-bold text-gray-700 pt-6 font-['math'] col-span-full row-span-full">
                  t
                </div>
                <svg
                  id="svgCurve"
                  ref={svgRef}
                  width="1000"
                  height="1000"
                  viewBox="0 0 500 500"
                  className="col-span-full row-span-full overflow-visible"
                ></svg>
                <div
                  id="i"
                  className="text-xl font-bold text-gray-700 pl-[485px] pt-[470px] font-['math'] col-span-full row-span-full"
                >
                  I
                </div>
              </div>
            </div>
            <div className="asideContainer flex flex-col w-[350px] h-full absolute top-0 right-0">
              <div
                id="CurveSelectionAndTimeDial"
                className="relative flex justify-evenly"
              >
                <div className="TwoControls space-y-4">
                  <div
                    className="verticalMenue w-max h-[165px] flex justify-center items-center m-0"
                    id="idVerticalMenue"
                  >
                    <nav className="vertical-navigation">
                      <ul style={{ paddingLeft: "0" }}>
                        <li
                          id="li_IEEE"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#IEEE"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            IEEE
                          </a>
                          <ul
                            id="ulIEEE"
                            className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10"
                          >
                            <li
                              id="li_IEEE_EI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEEE_EI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEEE EI
                              </button>
                            </li>
                            <li
                              id="li_IEEE_VI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEEE_VI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEEE VI
                              </button>
                            </li>
                            <li
                              id="li_IEEE_MI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEEE_MI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEEE MI
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li
                          id="li_US"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#US"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            US
                          </a>
                          <ul className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10">
                            <li
                              id="li_US_I"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("US_I")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                US I
                              </button>
                            </li>
                            <li
                              id="li_US_STI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("US_STI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                US STI
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li
                          id="li_IEC"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#IEC"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            IEC
                          </a>
                          <ul className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10">
                            <li
                              id="li_IEC_MI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEC_MI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEC MI
                              </button>
                            </li>
                            <li
                              id="li_IEC_VI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEC_VI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEC VI
                              </button>
                            </li>
                            <li
                              id="li_IEC_EI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEC_EI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEC EI
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li
                          id="li_UK"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#UK"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            UK
                          </a>
                          <ul className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10">
                            <li
                              id="li_UK_LTI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("UK_LTI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                UK LTI
                              </button>
                            </li>
                            <li
                              id="li_UK_R"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("UK_R")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                UK R
                              </button>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <div className="timeDial">
                    <form className="form12_4">
                      <label className="block text-sm font-semibold text-gray-700">
                        TD={" "}
                      </label>
                      <input
                        type="range"
                        name="slider"
                        id="TDial"
                        defaultValue="1.0"
                        min="1.0"
                        max="100"
                        step="1"
                        onChange={handleTDialChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <output
                        id="TDout"
                        name="x"
                        htmlFor="TDial"
                        className="text-sm font-bold text-blue-600"
                      >
                        1.0
                      </output>
                    </form>
                    <form className="form13_4">
                      <label className="block text-sm font-semibold text-gray-700">
                        TMS={" "}
                      </label>
                      <input
                        type="range"
                        name="slider"
                        id="TTMS"
                        defaultValue="1.0"
                        min="1.0"
                        max="100"
                        step="1"
                        onChange={handleTTMSChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <output
                        id="TMSout"
                        name="x"
                        htmlFor="TTMS"
                        className="text-sm font-bold text-blue-600"
                      >
                        1.0
                      </output>
                    </form>
                  </div>
                </div>
                <div className="TwoControls space-y-4">
                  <div className="verticalMenue w-max h-[165px] flex justify-center items-center m-0">
                    <nav className="vertical-navigation">
                      <ul style={{ paddingLeft: "0" }}>
                        <li
                          id="li_IEEE2"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#IEEE2"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            IEEE
                          </a>
                          <ul
                            id="ulIEEE2"
                            className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10"
                          >
                            <li
                              id="li_IEEE2_EI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEEE2_EI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEEE EI
                              </button>
                            </li>
                            <li
                              id="li_IEEE2_VI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEEE2_VI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEEE VI
                              </button>
                            </li>
                            <li
                              id="li_IEEE2_MI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEEE2_MI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEEE MI
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li
                          id="li_US2"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#US2"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            US
                          </a>
                          <ul className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10">
                            <li
                              id="li_US2_I"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("US2_I")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                US I
                              </button>
                            </li>
                            <li
                              id="li_US2_STI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("US2_STI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                US STI
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li
                          id="li_IEC2"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#IEC2"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            IEC
                          </a>
                          <ul className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10">
                            <li
                              id="li_IEC2_MI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEC2_MI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEC MI
                              </button>
                            </li>
                            <li
                              id="li_IEC2_VI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEC2_VI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEC VI
                              </button>
                            </li>
                            <li
                              id="li_IEC2_EI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("IEC2_EI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                IEC EI
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li
                          id="li_UK2"
                          value="0"
                          className="nav-item group relative bg-gray-100 hover:bg-gray-300"
                        >
                          <a
                            href="#UK2"
                            className="block w-max p-2 text-blue-600 no-underline transition-colors duration-300"
                          >
                            UK
                          </a>
                          <ul className="hidden group-hover:block absolute left-full top-0 bg-white border border-gray-200 shadow-md min-w-[100px] z-10">
                            <li
                              id="li_UK2_LTI"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("UK2_LTI")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                UK LTI
                              </button>
                            </li>
                            <li
                              id="li_UK2_R"
                              value="0"
                              className="submenu hover:bg-gray-100"
                            >
                              <button
                                onClick={() => handleCurveSelect("UK2_R")}
                                className="block p-2 text-blue-600 w-full text-left"
                              >
                                UK R
                              </button>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <div className="timeDial">
                    <form className="form12_4_2" style={{ display: "none" }}>
                      <label className="block text-sm font-semibold text-gray-700">
                        TD={" "}
                      </label>
                      <input
                        type="range"
                        name="slider"
                        id="TDial2"
                        defaultValue="1.0"
                        min="1.0"
                        max="100"
                        step="1"
                        onChange={handleTDial2Change}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <output
                        id="TDout2"
                        name="x"
                        htmlFor="TDial2"
                        className="text-sm font-bold text-blue-600"
                      >
                        1.0
                      </output>
                    </form>
                    <form className="form13_4_2" style={{ display: "none" }}>
                      <label className="block text-sm font-semibold text-gray-700">
                        TMS={" "}
                      </label>
                      <input
                        type="range"
                        name="slider"
                        id="TTMS2"
                        defaultValue="1.0"
                        min="1.0"
                        max="100"
                        step="1"
                        onChange={handleTTMS2Change}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <output
                        id="TMSout2"
                        name="x"
                        htmlFor="TTMS2"
                        className="text-sm font-bold text-blue-600"
                      >
                        1.0
                      </output>
                    </form>
                  </div>
                </div>
              </div>
              <div
                className="grid-item absolute bottom-0 left-0 text-base w-full h-[65%] overflow-y-auto"
                id="calculation-section"
              >
                <p id="1" className="px-2 py-1"></p>
                <p id="2" className="px-2 py-1"></p>
                <p id="3" className="px-2 py-1"></p>
                <p id="4" className="px-2 py-1"></p>
                <p id="5" className="px-2 py-1"></p>
                <p id="6" className="px-2 py-1"></p>
                <p id="7" className="px-2 py-1"></p>
                <p id="8" className="px-2 py-1"></p>
                <p id="9" className="px-2 py-1"></p>
                <p id="10" className="px-2 py-1"></p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto border border-slate-200"
          id="form-section"
        >
          <div></div>
          <div
            id="divSvg"
            className="flex justify-center items-center mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
          >
            <svg
              width="250"
              height="415.52396"
              viewBox="0 0 66.146041 109.94054"
              version="1.1"
              id="svg1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <defs id="defs1">
                <linearGradient id="swatch31">
                  <stop
                    style={{ stopColor: "#4682b4", stopOpacity: 1 }}
                    offset="0"
                    id="stop31"
                  />
                </linearGradient>
                <linearGradient id="swatch14">
                  <stop
                    style={{ stopColor: "#4682b4", stopOpacity: 1 }}
                    offset="0"
                    id="stop14"
                  />
                </linearGradient>
                <linearGradient id="swatch13">
                  <stop
                    style={{ stopColor: "#4682b4", stopOpacity: 1 }}
                    offset="0"
                    id="stop13"
                  />
                </linearGradient>
                <linearGradient id="swatch10">
                  <stop
                    style={{ stopColor: "#4682b4", stopOpacity: 1 }}
                    offset="0"
                    id="stop10"
                  />
                </linearGradient>
                <linearGradient id="swatch4">
                  <stop
                    style={{ stopColor: "#000000", stopOpacity: 1 }}
                    offset="0"
                    id="stop4"
                  />
                </linearGradient>
                <linearGradient id="swatch1">
                  <stop
                    style={{ stopColor: "#4682b4", stopOpacity: 1 }}
                    offset="0"
                    id="stop1"
                  />
                </linearGradient>
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient1"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(-21.423466,-25.444059)"
                />
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient6"
                  gradientUnits="userSpaceOnUse"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                  gradientTransform="matrix(0,0.7790298,-1,0,129.43363,-18.175908)"
                />
                <linearGradient
                  xlinkHref="#swatch10"
                  id="linearGradient5"
                  x1="33.336044"
                  y1="145.06769"
                  x2="77.040962"
                  y2="145.06769"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0.39490004,0,0,0.39490004,62.592316,70.805581)"
                />
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient11"
                  gradientUnits="userSpaceOnUse"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                  gradientTransform="translate(-21.423466,-25.444059)"
                />
                <linearGradient
                  xlinkHref="#swatch13"
                  id="linearGradient13"
                  x1="10.348428"
                  y1="151.28558"
                  x2="204.41937"
                  y2="151.28558"
                  gradientUnits="userSpaceOnUse"
                />
                <linearGradient
                  xlinkHref="#swatch14"
                  id="linearGradient14"
                  x1="10.348428"
                  y1="151.28558"
                  x2="204.41937"
                  y2="151.28558"
                  gradientUnits="userSpaceOnUse"
                />
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient15"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(-21.423466,194.16092)"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                />
                <linearGradient
                  xlinkHref="#swatch10"
                  id="linearGradient16"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0.39490004,0,0,0.39490004,62.592313,86.36193)"
                  x1="33.336044"
                  y1="145.06769"
                  x2="77.040962"
                  y2="145.06769"
                />
                <linearGradient
                  xlinkHref="#swatch13"
                  id="linearGradient17"
                  gradientUnits="userSpaceOnUse"
                  x1="10.348428"
                  y1="151.28558"
                  x2="204.41937"
                  y2="151.28558"
                />
                <linearGradient
                  xlinkHref="#swatch13"
                  id="linearGradient18"
                  gradientUnits="userSpaceOnUse"
                  x1="10.348428"
                  y1="151.28558"
                  x2="204.41937"
                  y2="151.28558"
                />
                <linearGradient
                  xlinkHref="#swatch14"
                  id="linearGradient19"
                  gradientUnits="userSpaceOnUse"
                  x1="10.348428"
                  y1="151.28558"
                  x2="204.41937"
                  y2="151.28558"
                />
                <linearGradient
                  xlinkHref="#swatch14"
                  id="linearGradient20"
                  gradientUnits="userSpaceOnUse"
                  x1="10.348428"
                  y1="151.28558"
                  x2="204.41937"
                  y2="151.28558"
                />
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient21"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0,0.7790298,-1,0,129.43363,111.47021)"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                />
                <linearGradient
                  xlinkHref="#swatch31"
                  id="linearGradient31"
                  x1="-45.833332"
                  y1="88.392853"
                  x2="-4.1904755"
                  y2="88.392853"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0.59774296,0,0,0.59774296,132.04995,9.06497)"
                />
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient32"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0.12962884,0,0,1,82.717661,19.005963)"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                />
                <marker
                  style={{ overflow: "visible" }}
                  id="ConcaveTriangle"
                  refX="0"
                  refY="0"
                  orient="auto-start-reverse"
                  markerWidth="1.001"
                  markerHeight="0.667"
                  viewBox="0 0 1 1"
                  preserveAspectRatio="xMidYMid"
                >
                  <path
                    transform="scale(0.7)"
                    d="M -2,-4 9,0 -2,4 c 2,-2.33 2,-5.66 0,-8 z"
                    style={{
                      fill: "context-stroke",
                      fillRule: "evenodd",
                      stroke: "none",
                    }}
                    id="path7-2"
                  />
                </marker>
                <linearGradient
                  xlinkHref="#swatch31"
                  id="linearGradient33"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0.59774296,0,0,0.59774296,132.04994,139.96169)"
                  x1="-45.833332"
                  y1="88.392853"
                  x2="-4.1904755"
                  y2="88.392853"
                />
                <linearGradient
                  xlinkHref="#swatch1"
                  id="linearGradient34"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0.12962884,0,0,1,83.088658,149.90268)"
                  x1="49.238094"
                  y1="45.047619"
                  x2="162.38095"
                  y2="45.047619"
                />
              </defs>
              <g id="layer1" transform="translate(-27.814623,-14.024532)">
                <g
                  id="g46"
                  transform="matrix(0.38775792,0,0,0.38775792,18.881372,11.396388)"
                >
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient11)",
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    d="M 27.814623,19.60356 H 140.95738"
                    id="path1"
                  />
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient1)",
                      strokeWidth: "2.646",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    d="M 27.814623,19.60356 H 140.95738"
                    id="HV_Bus"
                  />
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient15)",
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    d="M 27.814623,239.2088 H 140.95738"
                    id="LV_Bus"
                  />
                  <g
                    id="HV_CT"
                    transform="matrix(0,0.12681616,-0.12681616,0,103.83436,50.381271)"
                    style={{
                      stroke: "url(#linearGradient13)",
                      strokeWidth: "20.8635",
                      strokeDasharray: "none",
                    }}
                  >
                    <path
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient17)",
                        strokeWidth: "20.8635",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="path3"
                      d="M 107.36526,108.58115 A 48.569916,79.511223 0 0 1 85.391556,181.14 48.569916,79.511223 0 0 1 35.963955,184.529 48.569916,79.511223 0 0 1 10.360928,115.23224"
                    />
                    <path
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient18)",
                        strokeWidth: "20.8635",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="path5"
                      d="m -107.40254,108.58115 a 48.569916,79.511223 0 0 1 -21.9737,72.55885 48.569916,79.511223 0 0 1 -49.4276,3.389 48.569916,79.511223 0 0 1 -25.60303,-69.29676"
                      transform="scale(-1,1)"
                    />
                  </g>
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient6)",
                      strokeWidth: "1.68253",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    d="M 84.386018,20.182156 V 108.32407"
                    id="HV_Line"
                  />
                  <g
                    id="LV_CT"
                    transform="matrix(0,0.12681616,-0.12681616,0,103.83436,181.19506)"
                    style={{
                      stroke: "url(#linearGradient14)",
                      strokeWidth: "20.8635",
                      strokeDasharray: "none",
                    }}
                  >
                    <path
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient19)",
                        strokeWidth: "20.8635",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="path7"
                      d="M 107.36526,108.58115 A 48.569916,79.511223 0 0 1 85.391556,181.14 48.569916,79.511223 0 0 1 35.963955,184.529 48.569916,79.511223 0 0 1 10.360928,115.23224"
                    />
                    <path
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient20)",
                        strokeWidth: "20.8635",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="path8"
                      d="m -107.40254,108.58115 a 48.569916,79.511223 0 0 1 -21.9737,72.55885 48.569916,79.511223 0 0 1 -49.4276,3.389 48.569916,79.511223 0 0 1 -25.60303,-69.29676"
                      transform="scale(-1,1)"
                    />
                  </g>
                  <g id="Transformer">
                    <path
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient15)",
                        strokeWidth: "2.64583",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="path9"
                      d="M 96.867745,119.46384 A 12.652072,13.231874 0 0 1 86.456257,134.68155 12.652072,13.231874 0 0 1 71.904639,123.794 12.652072,13.231874 0 0 1 82.314096,108.57477 12.652072,13.231874 0 0 1 96.867166,119.4602"
                    />
                    <path
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient16)",
                        strokeWidth: "2.64583",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="path15"
                      d="M 96.867745,135.02019 A 12.652072,13.231874 0 0 1 86.456257,150.2379 12.652072,13.231874 0 0 1 71.904639,139.35035 12.652072,13.231874 0 0 1 82.314096,124.13112 12.652072,13.231874 0 0 1 96.867166,135.01654"
                    />
                  </g>
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient21)",
                      strokeWidth: "1.68253",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    d="m 84.386018,149.8285 v 88.14222"
                    id="LV_Line"
                  />
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: "normal",
                      fontVariant: "normal",
                      fontWeight: "900",
                      fontStretch: "normal",
                      fontSize: "12.7px",
                      fontFamily: "math",
                      fill: "#4682b4",
                      fillOpacity: 1,
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    x="147.27019"
                    y="23.27022"
                    id="HV-Bus"
                  >
                    <tspan
                      id="tspan21"
                      style={{
                        fontStyle: "normal",
                        fontVariant: "normal",
                        fontWeight: "900",
                        fontStretch: "normal",
                        fontSize: "12.7px",
                        fontFamily: "math",
                        fill: "#4682b4",
                        fillOpacity: 1,
                        strokeWidth: "2.64583",
                      }}
                      x="147.27019"
                      y="23.27022"
                    >
                      132kV
                    </tspan>
                  </text>
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: "normal",
                      fontVariant: "normal",
                      fontWeight: "900",
                      fontStretch: "normal",
                      fontSize: "12.7px",
                      fontFamily: "math",
                      fill: "#4682b4",
                      fillOpacity: 1,
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    x="155.74098"
                    y="242.2226"
                    id="LV-Bus"
                  >
                    <tspan id="tspan22" x="155.74098" y="242.2226">
                      33kV
                    </tspan>
                  </text>
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: "normal",
                      fontVariant: "normal",
                      fontWeight: "900",
                      fontStretch: "normal",
                      fontSize: "12.7px",
                      fontFamily: "math",
                      fill: "#4682b4",
                      fillOpacity: 1,
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    x="28.365425"
                    y="66.746407"
                    id="HV-CT"
                  >
                    <tspan id="tspan25" x="28.365425" y="66.746407">
                      300/1
                    </tspan>
                  </text>
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: "normal",
                      fontVariant: "normal",
                      fontWeight: "900",
                      fontStretch: "normal",
                      fontSize: "12.7px",
                      fontFamily: "math",
                      fill: "#4682b4",
                      fillOpacity: 1,
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    x="28.365425"
                    y="199.27022"
                    id="LV-CT"
                  >
                    <tspan id="tspan26" x="28.365425" y="199.27022">
                      1000/1
                    </tspan>
                  </text>
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: "normal",
                      fontVariant: "normal",
                      fontWeight: "900",
                      fontStretch: "normal",
                      fontSize: "12.7px",
                      fontFamily: "math",
                      fill: "#4682b4",
                      fillOpacity: 1,
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    x="113.74638"
                    y="126.46069"
                    id="MVA"
                  >
                    <tspan id="tspan27" x="113.74638" y="126.46069">
                      50 MVA
                    </tspan>
                  </text>
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: "normal",
                      fontVariant: "normal",
                      fontWeight: "900",
                      fontStretch: "normal",
                      fontSize: "12.7px",
                      fontFamily: "math",
                      fill: "#4682b4",
                      fillOpacity: 1,
                      strokeWidth: "2.64583",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "none",
                    }}
                    x="113.74638"
                    y="139.68968"
                    id="Impedance"
                  >
                    <tspan id="tspan28" x="113.74638" y="139.68968">
                      %Z = 12%
                    </tspan>
                  </text>
                  <g id="relayHV">
                    <text
                      xmlSpace="preserve"
                      style={{
                        fontStyle: "normal",
                        fontVariant: "normal",
                        fontWeight: "900",
                        fontStretch: "normal",
                        fontSize: "12.7px",
                        fontFamily: "math",
                        fill: "#4682b4",
                        fillOpacity: 1,
                        strokeWidth: "2.64583",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      x="108.55933"
                      y="66.746407"
                      id="text29"
                    >
                      <tspan id="tspan29" x="108.55933" y="66.746407">
                        51
                      </tspan>
                    </text>
                    <rect
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient31)",
                        strokeWidth: "1.58153",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="rect30"
                      width="24.891726"
                      height="23.326206"
                      x="104.6534"
                      y="50.238071"
                      rx="0"
                      ry="0"
                    />
                  </g>
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient32)",
                      strokeWidth: "0.952605",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "2.85782, 0.952605",
                      strokeDashoffset: "2.00047",
                    }}
                    d="M 89.100337,64.053588 H 103.7669"
                    id="CT-Wires-HV"
                  />
                  <g id="Faukt">
                    <path
                      style={{
                        fill: "#ffffff",
                        stroke: "#4682b4",
                        strokeWidth: "2.64583",
                        strokeDasharray: "none",
                        strokeOpacity: 1,
                      }}
                      d="m 117.02477,239.00622 -9.80016,14.00661 12.13376,-3.31904"
                      id="path45"
                    />
                    <path
                      style={{
                        fill: "#ffffff",
                        stroke: "#4682b4",
                        strokeWidth: "2.64583",
                        strokeDasharray: "none",
                        strokeOpacity: 1,
                        markerStart: "url(#ConcaveTriangle)",
                      }}
                      d="m 108.1184,275.22668 12.13776,-26.23675"
                      id="path46"
                    />
                  </g>
                  <g id="relayLV">
                    <text
                      xmlSpace="preserve"
                      style={{
                        fontStyle: "normal",
                        fontVariant: "normal",
                        fontWeight: "900",
                        fontStretch: "normal",
                        fontSize: "12.7px",
                        fontFamily: "math",
                        fill: "#4682b4",
                        fillOpacity: 1,
                        strokeWidth: "2.64583",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      x="108.55933"
                      y="197.64313"
                      id="text29-0"
                    >
                      <tspan id="tspan29-6" x="108.55933" y="197.64313">
                        51
                      </tspan>
                    </text>
                    <rect
                      style={{
                        fill: "none",
                        stroke: "url(#linearGradient33)",
                        strokeWidth: "1.58153",
                        strokeLinejoin: "bevel",
                        strokeMiterlimit: "9.8",
                        strokeDasharray: "none",
                      }}
                      id="rect30-9"
                      width="24.891726"
                      height="23.326206"
                      x="104.6534"
                      y="181.1348"
                      rx="0"
                      ry="0"
                    />
                  </g>
                  <path
                    style={{
                      fill: "none",
                      stroke: "url(#linearGradient34)",
                      strokeWidth: "0.952605",
                      strokeLinejoin: "bevel",
                      strokeMiterlimit: "9.8",
                      strokeDasharray: "2.85782, 0.952605",
                      strokeDashoffset: "2.00047",
                    }}
                    d="M 89.471333,194.95031 H 104.1379"
                    id="CT-Wires-LV"
                  />
                </g>
              </g>
            </svg>
          </div>
          <div>
            <form id="calculator-form" className="space-y-4">
              <div className="divMVA">
                <label
                  htmlFor="powerRating"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Power Rating (MVA):
                </label>
                <input
                  type="number"
                  id="powerRating"
                  name="powerRating"
                  value={powerRating}
                  onChange={handlePowerRatingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divLvV">
                <label
                  htmlFor="lvVoltage"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Voltage on LV Side (kV):
                </label>
                <input
                  type="number"
                  id="lvVoltage"
                  name="lvVoltage"
                  value={lvVoltage}
                  onChange={handleLvVoltageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divHvV">
                <label
                  htmlFor="hvVoltage"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Voltage on HV Side (kV):
                </label>
                <input
                  type="number"
                  id="hvVoltage"
                  name="hvVoltage"
                  value={hvVoltage}
                  onChange={handleHvVoltageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divZ">
                <label
                  htmlFor="impedance"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Impedance (%):
                </label>
                <input
                  type="number"
                  id="impedance"
                  name="impedance"
                  value={impedance}
                  onChange={handleImpedanceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divCThv">
                <label
                  htmlFor="ctRatioLV"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  CT Ratio for LV Side:
                </label>
                <input
                  type="number"
                  id="ctRatioLV"
                  name="ctRatioLV"
                  value={ctRatioLV}
                  onChange={handleCtRatioLVChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divCThv">
                <label
                  htmlFor="ctRatioHV"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  CT Ratio for HV Side:
                </label>
                <input
                  type="number"
                  id="ctRatioHV"
                  name="ctRatioHV"
                  value={ctRatioHV}
                  onChange={handleCtRatioHVChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divTripLV">
                <label
                  htmlFor="tripTimeLV"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Trip Time for LV Side (s):
                </label>
                <input
                  type="number"
                  id="tripTimeLV"
                  name="tripTimeLV"
                  value={tripTimeLV}
                  onChange={handleTripTimeLVChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divTripHV">
                <label
                  htmlFor="tripTimeHV"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Trip Time for HV Side (s):
                </label>
                <input
                  type="number"
                  id="tripTimeHV"
                  name="tripTimeHV"
                  value={tripTimeHV}
                  onChange={handleTripTimeHVChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-400"
                />
              </div>
              <div className="divButton mt-6">
                <button
                  type="button"
                  id="buttonCalculate"
                  onClick={handleCalculate}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition duration-200 shadow-md hover:shadow-lg"
                >
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

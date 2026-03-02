"use client";

import { useMemo, useState, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type CurveFamily = "IEEE" | "IEC" | "US" | "UK";
type CurveType = "MI" | "VI" | "EI" | "I" | "STI" | "LTI" | "R";

const curveOptions: Record<CurveFamily, CurveType[]> = {
  IEEE: ["MI", "VI", "EI"],
  IEC: ["MI", "VI", "EI"],
  US: ["I", "STI"],
  UK: ["LTI", "R"],
};

export default function Lab5() {
  const [family, setFamily] = useState<CurveFamily>("IEC");
  const [type, setType] = useState<CurveType>("MI");
  const [td, setTd] = useState(0.1);
  const [tms, setTms] = useState(0.5);

  /* ---------------- Get formula string ---------------- */
  function getFormula(): string {
    const paramValue = family === "IEC" || family === "UK" ? tms : td;
    const paramStr = paramValue.toString();
    switch (`${family}-${type}`) {
      case "IEC-MI":
        return `t = ${paramStr} \\times \\frac{13.5}{M - 1}`;
      case "IEC-VI":
        return `t = ${paramStr} \\times \\frac{80}{M^2 - 1}`;
      case "IEC-EI":
        return `t = ${paramStr} \\times \\frac{0.4}{M^{0.02} - 1}`;
      case "IEEE-MI":
        return `t = ${paramStr} \\times \\frac{0.0515}{M^{0.02} - 1} + 0.114`;
      case "IEEE-VI":
        return `t = ${paramStr} \\times \\frac{28.2}{M^2 - 1} + 0.121`;
      case "IEEE-EI":
        return `t = ${paramStr} \\times \\frac{28.2}{M^2 - 1} + 0.121`;
      case "US-I":
        return `t = ${paramStr} \\times \\frac{5.95}{M^2 - 1}`;
      case "US-STI":
        return `t = ${paramStr} \\times \\frac{0.16758}{M^{0.02} - 1}`;
      case "UK-LTI":
        return `t = ${paramStr} \\times \\frac{120}{M - 1}`;
      case "UK-R":
        return `t = ${paramStr} \\times \\frac{45900}{M^{5.6} - 1}`;
      default:
        return "";
    }
  }

  /* ---------------- Render formula with KaTeX ---------------- */
  const formulaHtml = useMemo(() => {
    try {
      return katex.renderToString(getFormula(), {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      console.error("KaTeX render error:", e);
      return "";
    }
  }, [family, type, td, tms]);

  /* ---------------- Chart size ---------------- */
  const WIDTH = 820;
  const HEIGHT = 620;

  const MARGIN = { top: 30, right: 20, bottom: 60, left: 70 };
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  /* ---------------- Curve equation ---------------- */
  function calculateTime(m: number): number {
    if (m <= 1) return Infinity;

    switch (`${family}-${type}`) {
      case "IEC-MI":
        return tms * (13.5 / (m - 1));
      case "IEC-VI":
        return tms * (80 / (Math.pow(m, 2) - 1));
      case "IEC-EI":
        return tms * (0.4 / (Math.pow(m, 0.02) - 1));

      case "IEEE-MI":
        return td * (0.0515 / (Math.pow(m, 0.02) - 1)) + 0.114;
      case "IEEE-VI":
        return td * (28.2 / (Math.pow(m, 2) - 1)) + 0.121;
      case "IEEE-EI":
        return td * (28.2 / (Math.pow(m, 2) - 1)) + 0.121;

      case "US-I":
        return td * (5.95 / (Math.pow(m, 2) - 1));
      case "US-STI":
        return td * (0.16758 / (Math.pow(m, 0.02) - 1));

      case "UK-LTI":
        return tms * (120 / (m - 1));
      case "UK-R":
        return tms * (45900 / (Math.pow(m, 5.6) - 1));

      default:
        return Infinity;
    }
  }

  /* ---------------- Scales ---------------- */
  const xScale = (m: number) => ((m - 1) / 9) * innerWidth;

  /* ---------------- Curve Path & Y-Axis Scale ---------------- */
  const { curvePath, maxT, yTicks } = useMemo(() => {
    const pts: string[] = [];
    let maxTime = 0;
    // Use higher cap (1000) to accommodate curves like UK-R
    const timeCap = 1000;
    for (let m = 1.01; m <= 10; m += 0.05) {
      const t = calculateTime(m);
      if (t > 0 && t <= timeCap) {
        if (t > maxTime) maxTime = t;
      }
    }
    // Round up to a nice number for the axis
    const roundedMax = Math.max(Math.ceil(maxTime / 5) * 5, 5);
    
    // Dynamic tick generation - smaller steps at low values, larger at high values
    const ticks: number[] = [];
    if (roundedMax <= 10) {
      // For small max values (0-10): 0, 1, 2, 3, ..., 10
      for (let i = 0; i <= roundedMax; i++) {
        ticks.push(i);
      }
    } else if (roundedMax <= 50) {
      // For medium max values (10-50): 0, 5, 10, 15, ..., max
      for (let i = 0; i <= roundedMax; i += 5) {
        ticks.push(i);
      }
    } else if (roundedMax <= 100) {
      // For larger max values (50-100): 0, 10, 20, 30, ..., max
      for (let i = 0; i <= roundedMax; i += 10) {
        ticks.push(i);
      }
    } else if (roundedMax <= 500) {
      // For very large max values (100-500): 0, 50, 100, 150, ..., max
      for (let i = 0; i <= roundedMax; i += 50) {
        ticks.push(i);
      }
    } else {
      // For extremely large max values (>500): 0, 100, 200, 300, ..., max
      for (let i = 0; i <= roundedMax; i += 100) {
        ticks.push(i);
      }
    }
    
    // Now generate points using the rounded max
    for (let m = 1.01; m <= 10; m += 0.05) {
      const t = calculateTime(m);
      if (t > 0 && t <= roundedMax * 1.2) {
        pts.push(`${xScale(m)},${innerHeight - (t / roundedMax) * innerHeight}`);
      }
    }
    return { curvePath: "M " + pts.join(" L "), maxT: roundedMax, yTicks: ticks };
  }, [family, type, td, tms]);

  const yScale = (t: number) => innerHeight - (t / maxT) * innerHeight;

  /* ---------------- Test points ---------------- */
  const testMultiples = [2, 3, 5, 10];
  const testValues = testMultiples.map((m) => ({
    m,
    t: calculateTime(m),
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-10 text-blue-700">
      <h1 className="text-xl font-semibold text-center mb-10">
        Overcurrent Relay Time Curves
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 max-w-7xl mx-auto">
        {/* ================= LEFT CARD ================= */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <svg width={WIDTH} height={HEIGHT}>
            {/* Formula Display */}
            <foreignObject x={MARGIN.left + 20} y={10} width={innerWidth - 40} height={60}>
              <div
                // @ts-ignore - xmlns needed for foreignObject
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  color: "#1e40af",
                }}
                dangerouslySetInnerHTML={{ __html: formulaHtml }}
              />
            </foreignObject>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {yTicks.map((v) => (
                <g key={v}>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={yScale(v)}
                    y2={yScale(v)}
                    stroke="#e2e8f0"
                  />
                  <text
                    x={-10}
                    y={yScale(v) + 4}
                    fontSize={12}
                    textAnchor="end"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
                <g key={m}>
                  <line
                    y1={0}
                    y2={innerHeight}
                    x1={xScale(m)}
                    x2={xScale(m)}
                    stroke="#e2e8f0"
                  />
                  <text
                    y={innerHeight + 25}
                    x={xScale(m)}
                    textAnchor="middle"
                    fontSize={12}
                  >
                    {m}
                  </text>
                </g>
              ))}

              <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="blue" />
              <line
                x1={0}
                x2={innerWidth}
                y1={innerHeight}
                y2={innerHeight}
                stroke="blue"
              />

              {/* Axis Labels */}
              <text
                x={innerWidth / 2}
                y={innerHeight + 50}
                textAnchor="middle"
                fontSize={14}
                fill="#333"
              >
                Multiple of Pickup (M)
              </text>
              <text
                transform={`translate(-45, ${innerHeight / 2}) rotate(-90)`}
                textAnchor="middle"
                fontSize={14}
                fill="#333"
              >
                Time (seconds)
              </text>

              <path
                suppressHydrationWarning={true}
                d={curvePath}
                fill="none"
                stroke="blue"
                strokeWidth={2}
              />

              {testValues.map(({ m, t }) => (
                <g key={m}>
                  <circle
                    cx={xScale(m)}
                    cy={yScale(t)}
                    r={4}
                    fill="red"
                  />
                  <text
                    x={xScale(m)}
                    y={yScale(t) - 10}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#333"
                  >
                    x{m}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* ================= RIGHT CARD ================= */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Family */}
          <div className="flex gap-2 flex-wrap">
            {(["IEEE", "IEC", "US", "UK"] as CurveFamily[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFamily(f);
                  setType(curveOptions[f][0]);
                }}
                className={`px-3 py-1 rounded text-sm border ${
                  family === f ? "bg-blue-600 text-white" : "hover:bg-blue-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Subtype */}
          <div>
            <label className="text-sm font-semibold block mb-2">
              Curve Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CurveType)}
              className="w-full border rounded px-2 py-1"
            >
              {curveOptions[family].map((t) => (
                <option key={t} value={t}>
                  {family}
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Test values */}
          <div>
            <h3 className="font-semibold mb-2">Test Values</h3>
            {testValues.map(({ m, t }) => (
              <div key={m} className="flex justify-between text-sm">
                <span>x {m}</span>
                <span>{t.toFixed(2)} s</span>
              </div>
            ))}
          </div>

          {/* TD / TMS */}
          <div>
            <label className="font-semibold block mb-1">
              {family === "IEC" || family === "UK" ? "TMS" : "Time Delay (TD)"}
            </label>
            <input
              type="range"
              min={
                family === "IEC" || family === "UK"
                  ? 0.01
                  : family === "US"
                  ? 0.1
                  : type === "EI" || type === "VI"
                  ? 1
                  : 0.1
              }
              max={
                family === "IEC" || family === "UK"
                  ? 1.5
                  : family === "US"
                  ? 1.0
                  : 100
              }
              step={
                family === "IEC" || family === "UK"
                  ? 0.01
                  : family === "US"
                  ? 0.1
                  : type === "EI" || type === "VI"
                  ? 1
                  : 0.1
              }
              value={family === "IEC" || family === "UK" ? tms : td}
              onChange={(e) => {
                const val = +e.target.value;
                if (family === "IEC" || family === "UK") {
                  setTms(val);
                } else {
                  setTd(val);
                }
              }}
              className="w-full accent-blue-600"
            />
            <div className="text-sm text-gray-600 mt-1">
              Current: {(family === "IEC" || family === "UK" ? tms : td).toFixed(family === "IEC" || family === "UK" ? 2 : family === "US" ? 1 : 1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";

type CurveFamily = "IEEE" | "IEC" | "US" | "UK";
type CurveType =
  | "MI"
  | "VI"
  | "EI"
  | "I"
  | "STI"
  | "LTI"
  | "R";

const curveOptions: Record<CurveFamily, CurveType[]> = {
  IEEE: ["MI", "VI", "EI"],
  IEC: ["MI", "VI", "EI"],
  US: ["I", "STI"],
  UK: ["LTI", "R"],
};

export default function Lab5() {
  const [family, setFamily] = useState<CurveFamily>("IEC");
  const [type, setType] = useState<CurveType>("MI");
  const [td, setTd] = useState(1);

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
        return td * (0.14 / (Math.pow(m, 0.02) - 1));
      case "IEC-VI":
        return td * (13.5 / (m - 1));
      case "IEC-EI":
        return td * (80 / (m * m - 1));

      case "IEEE-MI":
        return td * (0.0515 / (Math.pow(m, 0.02) - 1));
      case "IEEE-VI":
        return td * (19.61 / (m * m - 1));
      case "IEEE-EI":
        return td * (28.2 / (m - 1));

      case "US-I":
        return td * (5.95 / (m - 1));
      case "US-STI":
        return td * (0.05 / (m - 1));

      case "UK-LTI":
        return td * (120 / (m - 1));
      case "UK-R":
        return td * (60 / (m - 1));

      default:
        return Infinity;
    }
  }

  /* ---------------- Scales ---------------- */
  const xScale = (m: number) => (m / 10) * innerWidth;
  const yScale = (t: number) =>
    innerHeight - (t / 20) * innerHeight;

  /* ---------------- Curve Path ---------------- */
  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let m = 1.01; m <= 10; m += 0.05) {
      const t = calculateTime(m);
      if (t > 0 && t < 20) {
        pts.push(`${xScale(m)},${yScale(t)}`);
      }
    }
    return "M " + pts.join(" L ");
  }, [family, type, td]);

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
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {[0, 5, 10, 15, 20].map((v) => (
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

              {[1, 2, 3, 5, 10].map((m) => (
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

              <path d={curvePath} fill="none" stroke="blue" strokeWidth={2} />

              {testValues.map(({ m, t }) => (
                <circle
                  key={m}
                  cx={xScale(m)}
                  cy={yScale(t)}
                  r={4}
                  fill="red"
                />
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
                  family === f
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50"
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

          {/* TD */}
          <div>
            <label className="font-semibold block mb-1">
              Time Dial (TD)
            </label>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.05}
              value={td}
              onChange={(e) => setTd(+e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

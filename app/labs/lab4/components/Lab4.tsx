"use client";
import '../style.css'
import React, { useState, useEffect } from "react";

// Complex number operations
const Zmul = (u: [number, number], v: [number, number]): [number, number] => {
  return [u[0] * v[0] - u[1] * v[1], u[1] * v[0] + u[0] * v[1]];
};

const Zmulscal = (u: number, v: [number, number]): [number, number] => {
  return [u * v[0], u * v[1]];
};

const Zadd = (u: [number, number], v: [number, number]): [number, number] => {
  return [u[0] + v[0], u[1] + v[1]];
};

const Zadd4 = (
  u: [number, number],
  v: [number, number],
  w: [number, number],
  x: [number, number]
): [number, number] => {
  return [u[0] + v[0] + w[0] + x[0], u[1] + v[1] + w[1] + x[1]];
};

const Zaddscal = (u: number, v: [number, number]): [number, number] => {
  return [u + v[0], v[1]];
};

const Zsub = (u: [number, number], v: [number, number]): [number, number] => {
  return [u[0] - v[0], u[1] - v[1]];
};

const Zinv = (u: [number, number]): [number, number] => {
  return [
    u[0] / (u[0] * u[0] + u[1] * u[1]),
    -u[1] / (u[0] * u[0] + u[1] * u[1]),
  ];
};

const Zabs = (u: [number, number]): number => {
  return Math.sqrt(u[0] * u[0] + u[1] * u[1]);
};

const Zpara = (
  u: [number, number],
  v: [number, number]
): [number, number] => {
  return Zinv(Zadd(Zinv(u), Zinv(v)));
};

interface RelayOperationPrinciplesProps {
  className?: string;
}

export default function Lab4({
  className = "",
}: RelayOperationPrinciplesProps) {
  // State for all input values
  const [Zsr, setZsr] = useState(0.1);
  const [Zsx, setZsx] = useState(1);
  const [Zlr, setZlr] = useState(0.2);
  const [Zlx, setZlx] = useState(2);
  const [Zs0r, setZs0r] = useState(0.1);
  const [Zs0x, setZs0x] = useState(1);
  const [Zl0r, setZl0r] = useState(0.2);
  const [Zl0x, setZl0x] = useState(2);
  const [V, setV] = useState(100);
  const [rf, setRf] = useState(0);
  const [zn, setZn] = useState(0);
  const [distance, setDistance] = useState(50);

  // Calculated values
  const [ZsKo, setZsKo] = useState<[number, number]>([0, 0]);
  const [ZlKo, setZlKo] = useState<[number, number]>([0, 0]);
  const [Itest, setItest] = useState<[number, number]>([0, 0]);
  const [Vtest, setVtest] = useState<[number, number]>([0, 0]);
  const [showNeutral, setShowNeutral] = useState(false);
  const [showFault, setShowFault] = useState(false);

  // Calculate values whenever inputs change
  useEffect(() => {
    const Zs: [number, number] = [Zsr, Zsx];
    const Zs0: [number, number] = [Zs0r, Zs0x];
    const ZsKoCalc = Zmulscal(1 / 3, Zsub(Zs0, Zs));
    setZsKo(ZsKoCalc);

    const Zl: [number, number] = [
      Zlr * (distance / 100),
      Zlx * (distance / 100),
    ];
    const Zl0: [number, number] = [
      Zl0r * (distance / 100),
      Zl0x * (distance / 100),
    ];
    const ZlKoCalc = Zmulscal(1 / 3, Zsub(Zl0, Zl));
    setZlKo(ZlKoCalc);

    const ItestCalc = Zmulscal(
      V,
      Zinv(
        Zaddscal(rf + zn, Zadd4(Zs, Zl, ZsKoCalc, ZlKoCalc))
      )
    );
    setItest(ItestCalc);

    const VtestCalc = Zsub(
      [V, 0],
      Zadd4(
        Zmul(ItestCalc, Zs),
        Zmul(ItestCalc, ZsKoCalc),
        Zmulscal(zn, ItestCalc),
        [0, 0]
      )
    );
    setVtest(VtestCalc);

    setShowNeutral(zn > 0);
    setShowFault(rf > 0);
  }, [Zsr, Zsx, Zlr, Zlx, Zs0r, Zs0x, Zl0r, Zl0x, V, rf, zn, distance]);

  // Calculate polar values
  const ItestPolarMag = Zabs(Itest);
  const ItestPolarAngle =
    (180 * Math.atan2(Itest[1], Itest[0])) / Math.PI;
  const VtestPolarMag = Zabs(Vtest);
  const VtestPolarAngle =
    (180 * Math.atan2(Vtest[1], Vtest[0])) / Math.PI;

  // Formatting helpers
  const formatNumber = (num: number, decimals = 1): string => {
    return num.toFixed(decimals);
  };

  const formatNumberAbs = (num: number, decimals = 1): string => {
    return Math.abs(num).toFixed(decimals);
  };

  // Custom input component matching the original design
  const InputField = ({
    value,
    onChange,
    className = "",
  }: {
    value: number;
    onChange: (val: number) => void;
    className?: string;
  }) => (
    <input
      type="number"
      step="0.1"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`w-[55px] h-[24px] text-sm font-semibold px-1 border border-slate-300 rounded bg-white/95 text-slate-700 text-right transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${className}`}
    />
  );

  return (
    <div className={`lab4-container ${className}`}>
      <div className="lab4-card">
        {/* Header */}
        <div className="lab4-header">
          <h1>Relay Operation Principles</h1>
          <p>Single Phase Fault Test Value Visualization</p>
        </div>

        {/* Diagram Area */}
        <div className="lab4-diagram-wrapper">
          <div className="relative inline-block">
            <svg
              width="960"
              height="430"
              id="svg4628"
              className="lab4-svg"
            >
              <defs id="defs4629">
                <marker
                  orient="auto"
                  refY="0"
                  refX="0"
                  id="Arrow2Lend"
                  style={{ overflow: "visible" }}
                >
                  <path
                    id="path4008"
                    style={{
                      fillRule: "evenodd",
                      strokeWidth: 0.625,
                      strokeLinejoin: "round",
                    }}
                    d="M 8.7185878,4.0337352 -2.2072895,0.01601326 8.7185884,-4.0017078 c -1.7454984,2.3720609 -1.7354408,5.6174519 -6e-7,8.035443 z"
                    transform="matrix(-1.1,0,0,-1.1,-1.1,0)"
                  />
                </marker>
                <marker
                  orient="auto"
                  refY="0"
                  refX="0"
                  id="Arrow2Mend"
                  style={{ overflow: "visible" }}
                >
                  <path
                    id="path5139"
                    style={{
                      fillRule: "evenodd",
                      strokeWidth: 0.625,
                      strokeLinejoin: "round",
                    }}
                    d="M 8.7185878,4.0337352 -2.2072895,0.01601326 8.7185884,-4.0017078 c -1.7454984,2.3720609 -1.7354408,5.6174519 -6e-7,8.035443 z"
                    transform="scale(-0.6,-0.6)"
                  />
                </marker>
                <marker
                  orient="auto"
                  refY="0"
                  refX="0"
                  id="Arrow2Lstart"
                  style={{ overflow: "visible" }}
                >
                  <path
                    id="path5130"
                    style={{
                      fillRule: "evenodd",
                      strokeWidth: 0.625,
                      strokeLinejoin: "round",
                    }}
                    d="M 8.7185878,4.0337352 -2.2072895,0.01601326 8.7185884,-4.0017078 c -1.7454984,2.3720609 -1.7354408,5.6174519 -6e-7,8.035443 z"
                    transform="matrix(1.1,0,0,1.1,1.1,0)"
                  />
                </marker>
              </defs>
              <g id="mainGroup" transform="translate(0,-622.36218)">
                {/* Main circuit paths */}
                <path
                  id="pathHorizontal"
                  d="m 709.58768,719.37096 -497.16424,0"
                />
                <path
                  id="pathVertical"
                  d="m 166.11489,770.73153 0,147.82461"
                />
                
                {/* Earthing symbols */}
                <path
                  id="pathEarthingBigger"
                  d="m 152.64949,918.60756 26.62402,0"
                />
                <path
                  id="pathEarthingMedium"
                  d="m 156.38291,924.28784 18.96854,0"
                />
                <path
                  id="pathEarthingSmallest"
                  d="m 160.6359,929.92127 10.46248,0"
                />
                
                {/* Generator symbol */}
                <path
                  id="pathGenerator"
                  style={{ fill: "none" }}
                  d="m 210.11174,297.60706 a 30.304577,30.304577 0 1 1 -60.60916,0 30.304577,30.304577 0 1 1 60.60916,0 z"
                  transform="matrix(1.5565121,0,0,1.5565121,-114.19977,258.8994)"
                />
                <path
                  id="pathGroundHorizontal"
                  d="m 701.34535,918.61734 -521.87112,0"
                />
                
                {/* Generator sine wave */}
                <g
                  id="ggeneratorSinewave"
                  transform="matrix(0.77698631,0,0,1.0875641,184.9125,734.98929)"
                >
                  <path
                    d="m 4.1569681,-11.26866 c 0,8.1993929 -6.7133902,14.8463139 -14.9947771,14.8463139 -8.281386,0 -14.994776,-6.646921 -14.994776,-14.8463139 0,-0.226836 0.0053,-0.453643 0.01575,-0.680241"
                    id="path5957"
                    style={{ fill: "none" }}
                  />
                  <path
                    transform="matrix(1,0,0,-1,-29.971586,-23.225816)"
                    style={{ fill: "none" }}
                    id="path5959"
                    d="m 4.1569681,-11.26866 c 0,8.1993929 -6.7133902,14.8463139 -14.9947771,14.8463139 -8.281386,0 -14.994776,-6.646921 -14.994776,-14.8463139 0,-0.226836 0.0053,-0.453643 0.01575,-0.680241"
                  />
                </g>
                
                {/* Voltage test arrow */}
                <path
                  style={{ markerStart: "url(#Arrow2Lstart)" }}
                  d="m 428.34062,721.79867 0,196.05301"
                  id="pathVoltageTestArrow"
                />
                
                {/* CT symbol */}
                <g
                  id="gCT"
                  transform="matrix(0.42928193,0,0,0.56893813,403.71355,744.80163)"
                >
                  <path
                    transform="matrix(1,0,0,-1,-5.499997,-88.200926)"
                    d="m 183.66846,-52.200401 c 0,9.664983 -7.83502,17.5 -17.5,17.5 -9.66499,0 -17.5,-7.835017 -17.5,-17.5 0,-0.03342 9e-5,-0.06683 2.8e-4,-0.100249"
                    id="pathCTLeft"
                    style={{ fill: "rgba(255,255,255,0.1)" }}
                  />
                  <path
                    style={{ fill: "rgba(255,255,255,0.1)" }}
                    id="pathCTRight"
                    d="m 183.66846,-52.200401 c 0,9.664983 -7.83502,17.5 -17.5,17.5 -9.66499,0 -17.5,-7.835017 -17.5,-17.5 0,-0.03342 9e-5,-0.06683 2.8e-4,-0.100249"
                    transform="matrix(1,0,0,-1,30.500003,-88.200926)"
                  />
                  <path
                    id="path4195"
                    d="m 178.66846,-35.7004 0,10"
                  />
                </g>
                
                {/* Relay circle */}
                <path
                  id="pathRelayCircle"
                  style={{
                    fill: "rgba(255,255,255,0.1)",
                    strokeWidth: 0.03,
                  }}
                  d="m 126.66846,64.799599 a 4.5,4.5 0 1 1 -1.3e-4,-0.03335"
                  transform="matrix(3.5946193,0,0,3.5946193,41.392848,546.14928)"
                />
                
                {/* CT wire */}
                <path
                  id="pathCTWire"
                  style={{ strokeWidth: "0.1", strokeDasharray: "5, 2" }}
                  d="m 480.37514,724.34372 0,36.53163"
                />
                
                {/* I test arrow */}
                <path
                  id="pathItestArrow"
                  style={{ markerStart: "none", markerEnd: "url(#Arrow2Mend)" }}
                  d="m 466.64459,692.55378 35.73257,0"
                />
                
                {/* Fault symbol */}
                <path
                  id="FaultSymbol"
                  style={{ markerEnd: "url(#Arrow2Lend)" }}
                  d="m 708.65336,718.19257 -10.49971,127.34432 7.159,-23.38962 -4.29546,93.55902"
                />
                
                {/* Impedance rectangles */}
                <rect
                  id="sourceImpedanceSet"
                  className="impedance-rect"
                  transform="matrix(0,1,-1,0,0,0)"
                  y="-343.78058"
                  x="705.20178"
                  height="73.196846"
                  width="29.27874"
                />
                <rect
                  id="lineImedanceSet"
                  className="impedance-rect"
                  transform="matrix(0,1,-1,0,0,0)"
                  x="705.20178"
                  y="-653.23462"
                  width="29.27874"
                  height="73.196846"
                />
                <rect
                  id="groundSourceImpedance"
                  className="impedance-rect"
                  transform="matrix(0,1,-1,0,0,0)"
                  x="902.93878"
                  y="-343.78058"
                  width="29.27874"
                  height="73.196846"
                />
                <rect
                  id="groundLineImpedance"
                  className="impedance-rect"
                  transform="matrix(0,1,-1,0,0,0)"
                  y="-653.23462"
                  x="902.93878"
                  height="73.196846"
                  width="29.27874"
                />

                {/* Text labels */}
                <text x="471.27658" y="787.40784" id="textRelayRSign" className="impedance-label">
                  <tspan id="tspanRelayRSign" x="471.27658" y="787.40784">R</tspan>
                </text>
                
                <text x="0" y="1010.026" id="textDistanceToFault" className="distance-indicator">
                  <tspan id="tspanDistanceToFault" x="0" y="1010.026">Distance to fault =</tspan>
                </text>

                {/* Impedance labels */}
                <text x="234.87416" y="650.91687" id="textZs" className="impedance-label">
                  <tspan id="tspanZs" x="234.87416" y="650.91687">Zs=</tspan>
                </text>
                <text id="textZ0s" y="685.26208" x="222.9436" className="impedance-label">
                  <tspan id="tspanZ0s" x="222.9436" y="685.26208">Z0s=</tspan>
                </text>
                <text id="textZl" y="649.40161" x="554.9942" className="impedance-label">
                  <tspan id="tspanZl" x="554.9942" y="649.40161">Zl=</tspan>
                </text>
                <text x="544.20947" y="685.26208" id="textZ0l" className="impedance-label">
                  <tspan id="tspanZ0l" x="544.20947" y="685.26208">Z0l=</tspan>
                </text>
                
                {/* +j labels */}
                <text x="302.78125" y="881.71069" id="text6391" className="impedance-label">
                  <tspan id="tspan6393" x="302.78125" y="881.71069">+j</tspan>
                </text>
                <text id="text6403" y="881.71069" x="596.27979" className="impedance-label">
                  <tspan id="tspan6405" x="586" y="881.71069">+j</tspan>
                </text>
                <text id="text6419" y="649.40161" x="642.0202" className="impedance-label">
                  <tspan id="tspan6421" x="648" y="649.40161">+j</tspan>
                </text>
                <text x="641.05353" y="684.72845" id="text6423" className="impedance-label">
                  <tspan id="tspan6425" x="648" y="684.72845">+j</tspan>
                </text>
                <text x="322.01837" y="649.40161" id="textjZs" className="impedance-label">
                  <tspan id="tspanjZs" y="649.40161" x="330">+j</tspan>
                </text>
                <text id="textjZ0s" y="684.72845" x="321.05176" className="impedance-label">
                  <tspan id="tspanjZ0s" x="330" y="684.72845">+j</tspan>
                </text>
                <text id="textGeneratorV" y="729.29877" x="98.643944" className="impedance-label">
                  <tspan id="tspanGeneratorV" x="100" y="729.29877">V</tspan>
                </text>

                {/* Vtest label */}
                <text
                  id="text6435"
                  x="371.38132"
                  y="826.65771"
                  style={{
                    fontSize: "35.9461937px",
                    fill: "#d91b1b",
                    stroke: "#d42b2b",
                    strokeWidth: 1.17106473,
                  }}
                >
                  <tspan
                    id="tspan6437"
                    x="371.38132"
                    y="826.65771"
                    style={{
                      fill: "#d91b1b",
                      stroke: "#d42b2b",
                      strokeWidth: 1.17106473,
                    }}
                  >
                    V
                    <tspan
                      id="tspan6439"
                      style={{
                        fontSize: "14.3784771px",
                        fontWeight: "bold",
                        fill: "#d91b1b",
                        stroke: "#d42b2b",
                        strokeWidth: 1.17106473,
                      }}
                    >
                      test
                    </tspan>
                  </tspan>
                </text>
                
                {/* Itest label */}
                <text
                  id="text6441"
                  x="459.68362"
                  y="673.4494"
                  style={{
                    fontSize: "35.9461937px",
                    fill: "#ef2121",
                    stroke: "#ef3025",
                    strokeWidth: 1.17106473,
                  }}
                >
                  <tspan
                    id="tspan6443"
                    x="459.68362"
                    y="673.4494"
                    style={{
                      fill: "#ef2121",
                      stroke: "#ef3025",
                      strokeWidth: 1.17106473,
                    }}
                  >
                    I
                    <tspan
                      id="tspan6445"
                      style={{
                        fontSize: "14.3784771px",
                        fontWeight: "bold",
                        fill: "#ef2121",
                        stroke: "#ef3025",
                        strokeWidth: 1.17106473,
                      }}
                    >
                      test
                    </tspan>
                  </tspan>
                </text>
                
                {/* Vtest output */}
                <text
                  id="text6723"
                  x="375.80377"
                  y="986.0965"
                  style={{
                    fontSize: "31.99049568px",
                    fill: "#c04545",
                    stroke: "#d83e3e",
                  }}
                >
                  <tspan
                    id="tspan6725"
                    x="375.80377"
                    y="986.0965"
                    style={{ fill: "#c04545", stroke: "#d83e3e" }}
                  >
                    V
                    <tspan
                      id="tspan6727"
                      style={{
                        fontSize: "12.79619789px",
                        fontWeight: "bold",
                        fill: "#c04545",
                        stroke: "#d83e3e",
                      }}
                    >
                      test
                    </tspan>
                    <tspan
                      id="tspan6727-equal"
                      style={{
                        fontSize: "1rem",
                        fontWeight: "bold",
                        fill: "#64748b",
                        stroke: "#64748b",
                      }}
                    >
                      =
                    </tspan>
                  </tspan>
                </text>
                
                {/* Itest output */}
                <text
                  id="text6729"
                  x="375"
                  y="1037.6362"
                  style={{
                    fontSize: "31.99049568px",
                    fill: "#ec2a2a",
                    stroke: "#ef3025",
                  }}
                >
                  <tspan
                    id="tspan6731"
                    x="375"
                    y="1037.6362"
                    style={{ fill: "#ec2a2a", stroke: "#ef3025" }}
                  >
                    I
                    <tspan
                      id="tspan6733"
                      style={{
                        fontSize: "12.79619789px",
                        fontWeight: "bold",
                        fill: "#ec2a2a",
                        stroke: "#ef3025",
                      }}
                    >
                      test
                    </tspan>
                    <tspan
                      id="tspan6733-equal"
                      style={{
                        fontSize: "1rem",
                        fontWeight: "bold",
                        fill: "#64748b",
                        stroke: "#64748b",
                      }}
                    >
                      =
                    </tspan>
                  </tspan>
                </text>

                {/* Complex output indicators */}
                <text id="text6739" x="730" y="983.90985" className="impedance-label">
                  <tspan id="tspan6741" x="730" y="983.90985">
                    {Itest[1] < 0 ? "-j" : "+j"}
                  </tspan>
                </text>
                <text id="text6751" x="730" y="1039.4683" className="impedance-label">
                  <tspan id="tspan6753" x="730" y="1039.4683">
                    {Itest[1] < 0 ? "-j" : "+j"}
                  </tspan>
                </text>

                {/* Fault indicator path */}
                <path
                  id="path6999_1"
                  style={{
                    color: "#64748b",
                    fill: "#ffffff",
                    stroke: "#64748b",
                    strokeWidth: 2.50126791,
                  }}
                  opacity={showFault ? 1 : 0}
                  d="m 109.66282,889.22842 -12.413999,-6.33333 8.485429,-4.19046 -8.485429,-4.19054 8.485429,-4.19051 -8.485429,-4.19051 8.485429,-4.19051 -8.485429,-4.19041 8.485429,-4.19058 -8.825639,-4.47853 12.895419,-6.80138"
                />
                
                {/* Rf labels */}
                <text id="text7775" x="711.51343" y="792.75458" className="impedance-label">
                  <tspan id="tspan7777" x="711.51343" y="792.75458">Rf=</tspan>
                </text>
                <text id="text7784" x="812.03912" y="794.65839" className="unit-label">
                  <tspan id="tspan7788" x="812.03912" y="794.65839">Ω</tspan>
                </text>

                {/* Unit labels for impedance */}
                <text id="text7798" x="731.47107" y="649.35229" className="unit-label">
                  <tspan id="tspan7800" x="731.47107" y="649.35229">Ω</tspan>
                </text>
                <text id="text7802" x="731.47107" y="686.27222" className="unit-label">
                  <tspan id="tspan7804" x="731.47107" y="686.27222">Ω</tspan>
                </text>
                <text id="text7806" x="410.42752" y="651.76007" className="unit-label">
                  <tspan id="tspan7808" x="410.42752" y="651.76007">Ω</tspan>
                </text>
                <text id="text7810" x="413.62494" y="684.66705" className="unit-label">
                  <tspan id="tspan7812" x="413.62494" y="684.66705">Ω</tspan>
                </text>
                
                {/* V and A units */}
                <text id="text7814" x="819" y="985.3064" className="unit-label">
                  <tspan id="tspan7816" x="819" y="985.3064">V</tspan>
                </text>
                <text id="text7818" x="836" y="1036.5332" className="unit-label">
                  <tspan id="tspan7820" x="836" y="1036.5332">A</tspan>
                </text>
                <text id="textcopyV" x="610" y="985.3064" className="unit-label">
                  <tspan id="tspancopyV" x="610" y="985.3064">V,</tspan>
                </text>
                <text id="textcopyI" x="610" y="1036.5332" className="unit-label">
                  <tspan id="tspancopyI" x="610" y="1036.5332">A,</tspan>
                </text>
                
                {/* More unit labels */}
                <text id="text7822" x="396.05566" y="882.10883" className="unit-label">
                  <tspan id="tspan7824" x="390.05566" y="882.10883">Ω</tspan>
                </text>
                <text id="text7826" x="690.37408" y="882.10883" className="unit-label">
                  <tspan id="tspan7828" x="675" y="882.10883">Ω</tspan>
                </text>
                
                {/* Percentage indicator */}
                <path
                  id="path7830"
                  className="fault-indicator"
                  d="m 310,996.76798 c 8.73212,-0.106 18.58026,0.2378 25.96739,0.1317 l -0.41121,-12.6832 22.89937,20.03692 -21.62717,17.4926 -0.6361,-11.4497 -26.07983,0.318 z"
                />
                
                {/* Neutral indicator */}
                <rect
                  id="rect7832"
                  className="neutral-indicator"
                  transform="scale(-1,-1)"
                  opacity={showNeutral ? 1 : 0}
                  y="-866.63794"
                  x="-180.75426"
                  height="73.196846"
                  width="29.27874"
                />

                {/* Zn labels */}
                <text id="text7838" x="146.35934" y="827.67804" className="unit-label">
                  <tspan id="tspan7840" x="137" y="827.67804">Ω</tspan>
                </text>
                <text id="text7842" x="44.842995" y="827.05005" className="impedance-label">
                  <tspan id="tspan7844" x="44.842995" y="827.05005">Zn=</tspan>
                </text>

                {/* Percent sign */}
                <text id="textPercentSign" x="303.68457" y="1009.7445" className="unit-label">
                  <tspan id="tspanPercentSign" x="280" y="1012">%</tspan>
                </text>

                {/* Dynamic output values - Vtest */}
                <text id="textVtestr" x="655" y="985.77405" className="output-value">
                  <tspan id="tspan6426" x="655" y="985.77405">
                    {formatNumber(Vtest[0])}
                  </tspan>
                </text>
                <text id="textVtestrpolar" x="445.98715" y="985.77405" className="output-value">
                  <tspan id="tspan6435" x="445.98715" y="985.77405">
                    {formatNumber(VtestPolarMag)}
                  </tspan>
                </text>
                <text id="textVtestrpolarangle" x="525" y="985.77405" className="output-value">
                  <tspan id="tspan6436" x="525" y="985.77405">
                    {formatNumber(VtestPolarAngle)}°
                  </tspan>
                </text>
                <text id="textVtestx" x="760" y="985.77405" className="output-value">
                  <tspan id="tspan6428" x="760" y="985.77405">
                    {formatNumberAbs(Vtest[1])}
                  </tspan>
                </text>

                {/* Dynamic output values - Itest */}
                <text id="textItestr" x="655" y="1037.91693" className="output-value">
                  <tspan id="tspan6425" x="655" y="1037.91693">
                    {formatNumber(Itest[0])}
                  </tspan>
                </text>
                <text id="textItestrpolar" x="445.98715" y="1037.91693" className="output-value">
                  <tspan id="tspan6434" x="445.98715" y="1037.91693">
                    {formatNumber(ItestPolarMag)}
                  </tspan>
                </text>
                <text id="textItestrpolarangle" x="525" y="1037.91693" className="output-value">
                  <tspan id="tspan6437" x="525" y="1037.91693">
                    {formatNumber(ItestPolarAngle)}°
                  </tspan>
                </text>
                <text id="textItestx" x="760" y="1037.91693" className="output-value">
                  <tspan id="tspan6427" x="760" y="1037.91693">
                    {formatNumberAbs(Itest[1])}
                  </tspan>
                </text>

                {/* Calculated impedance values */}
                <text id="textZfactsr" x="235" y="882" className="output-value">
                  <tspan id="tspan6429" x="235" y="882">
                    {formatNumber(ZsKo[0])}
                  </tspan>
                </text>
                <text id="textZfactsx" x="329.37064" y="882" className="output-value">
                  <tspan id="tspan6430" x="329.37064" y="882">
                    {formatNumberAbs(ZsKo[1])}
                  </tspan>
                </text>
                <text id="textZfacts0r" x="515" y="882" className="output-value">
                  <tspan id="tspan6431" x="515" y="882">
                    {formatNumber(ZlKo[0])}
                  </tspan>
                </text>
                <text id="textZfacts0x" x="613" y="882" className="output-value">
                  <tspan id="tspan6432" x="613" y="882">
                    {formatNumberAbs(ZlKo[1])}
                  </tspan>
                </text>

                {/* Decoration lines */}
                <g id="layer4">
                  <path
                    id="path3164-1"
                    style={{
                      fill: "none",
                      stroke: "#64748b",
                      strokeWidth: 1,
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeOpacity: 1,
                      display: "inline",
                    }}
                    d="m 525,1012.07989 c -15.71626,35.46179 -15.71626,35.46179 -15.71626,35.46179 l 73.34252,0"
                  />
                </g>
                <g id="layer5">
                  <path
                    id="path3164-1"
                    style={{
                      fill: "none",
                      stroke: "#64748b",
                      strokeWidth: 1,
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeOpacity: 1,
                      display: "inline",
                    }}
                    d="m 525,962.07989 c -15.71626,35.46179 -15.71626,35.46179 -15.71626,35.46179 l 73.34252,0"
                  />
                </g>
              </g>
            </svg>

            {/* Input forms positioned absolutely */}
            <div
              className="input-form-wrapper"
              style={{ top: "15.837455px", left: "283.14728px" }}
            >
              <InputField value={Zsr} onChange={setZsr} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "15.837455px", left: "356.7869px" }}
            >
              <InputField value={Zsx} onChange={setZsx} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "15.837455px", left: "601.34534px" }}
            >
              <InputField value={Zlr} onChange={setZlr} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "15.837455px", left: "674.98492px" }}
            >
              <InputField value={Zlx} onChange={setZlx} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "50.18264px", left: "283.14728px" }}
            >
              <InputField value={Zs0r} onChange={setZs0r} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "50.18264px", left: "356.7869px" }}
            >
              <InputField value={Zs0x} onChange={setZs0x} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "50.18264px", left: "601.34534px" }}
            >
              <InputField value={Zl0r} onChange={setZl0r} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "50.18264px", left: "674.98492px" }}
            >
              <InputField value={Zl0x} onChange={setZl0x} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "95.659813px", left: "50.771591px" }}
            >
              <InputField value={V} onChange={setV} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "159.27913px", left: "756.81744px" }}
            >
              <InputField value={rf} onChange={setRf} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "193.64461px", left: "92.12693px" }}
            >
              <InputField value={zn} onChange={setZn} />
            </div>
            <div
              className="input-form-wrapper"
              style={{ top: "388px", left: "115px" }}
            >
              <InputField value={distance} onChange={setDistance} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="lab4-footer">
          <p>E-Learning Tools © 2026</p>
        </div>
      </div>
    </div>
  );
}

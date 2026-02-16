// Calculator utility functions for Transformer Over-Current Setting calculations

// Curve parameters
export const getCurveParams = (curveType: string): { b: number; a: number; l: number } => {
  let b = 19.61, a = 2, l = 0.491;
  switch (curveType) {
    case 'IEEE_VI': b = 19.61; a = 2; l = 0.491; break;
    case 'IEEE_EI': b = 28.2; a = 2; l = 0.1217; break;
    case 'IEEE_MI': b = 0.0515; a = 0.02; l = 0.114; break;
    case 'US_I': b = 5.95; a = 2; l = 0.18; break;
    case 'US_STI': b = 0.16758; a = 0.02; l = 0.11858; break;
    case 'IEC_VI': b = 13.5; a = 1; l = 0; break;
    case 'IEC_EI': b = 80; a = 2; l = 0; break;
    case 'IEC_MI': b = 0.14; a = 0.02; l = 0; break;
    case 'UK_LTI': b = 120; a = 1; l = 0; break;
    case 'UK_R': b = 45900; a = 5.6; l = 0; break;
    default: break;
  }
  return { b, a, l };
};

// Calculate full load current
export const calculateFullLoadCurrent = (powerRating: number, voltage: number): number => {
  return (powerRating * Math.pow(10, 6)) / (Math.sqrt(3) * voltage * Math.pow(10, 3));
};

// Calculate fault current
export const calculateFaultCurrent = (fullLoadCurrent: number, impedance: number): number => {
  return fullLoadCurrent / (impedance / 100);
};

// Calculate current set value
export const calculateCurrentSetValue = (fullLoadCurrent: number): number => {
  return 1.1 * fullLoadCurrent;
};

// Calculate PSM (Plug Setting Multiplier)
export const calculatePSM = (faultCurrent: number, setValue: number): number => {
  return faultCurrent / setValue;
};

// Calculate TMS (Time Multiplier Setting)
export const calculateTMS = (
  tripTime: number,
  psm: number,
  beta: number,
  alfa: number,
  L: number
): number => {
  return tripTime / (beta / (Math.pow(psm, alfa) - 1) + L);
};

// Main calculation function that returns all results
export interface CalculationResults {
  I_FL_LV: number;
  I_FL_HV: number;
  I_F_LV: number;
  I_F_HV: number;
  I_set_LV: number;
  I_set_HV: number;
  PSM_LV: number;
  PSM_HV: number;
  TMS_LV: number;
  TMS_HV: number;
}

export const calculateSettings = (
  powerRating: number,
  lvVoltage: number,
  hvVoltage: number,
  impedance: number,
  ctRatioLV: number,
  ctRatioHV: number,
  tripTimeLV: number,
  tripTimeHV: number
): CalculationResults => {
  // Full Load Current for LV and HV Sides
  const I_FL_LV = calculateFullLoadCurrent(powerRating, lvVoltage);
  const I_FL_HV = calculateFullLoadCurrent(powerRating, hvVoltage);

  // Fault Current for LV and HV Sides
  const I_F_LV = calculateFaultCurrent(I_FL_LV, impedance);
  const I_F_HV = calculateFaultCurrent(I_FL_HV, impedance);

  // Current Set Value for LV and HV Sides
  const I_set_LV = calculateCurrentSetValue(I_FL_LV);
  const I_set_HV = calculateCurrentSetValue(I_FL_HV);

  // Plug Setting Multiplier (PSM)
  const PSM_LV = calculatePSM(I_F_LV, I_set_LV);
  const PSM_HV = calculatePSM(I_F_HV, I_set_HV);

  // Time Multiplier Setting (TMS) - using standard curve parameters
  const beta = 19.61;
  const alfa_curve = 2;
  const L = 0.491;
  const beta2 = 19.61;
  const alfa_curve2 = 2;
  const L2 = 0.491;

  const TMS_LV = calculateTMS(tripTimeLV, PSM_LV, beta, alfa_curve, L);
  const TMS_HV = calculateTMS(tripTimeHV, PSM_HV, beta2, alfa_curve2, L2);

  return {
    I_FL_LV,
    I_FL_HV,
    I_F_LV,
    I_F_HV,
    I_set_LV,
    I_set_HV,
    PSM_LV,
    PSM_HV,
    TMS_LV,
    TMS_HV
  };
};

// Format results for display
export const formatCalculationResults = (results: CalculationResults) => {
  return [
    { id: "1", label: "I_FL_LV", value: `I_{\\mathrm{FL,LV}} = ${results.I_FL_LV.toFixed(2)}~\mathrm{A}` },
    { id: "2", label: "I_FL_HV", value: `I_{\\mathrm{FL,HV}} = ${results.I_FL_HV.toFixed(2)}~\mathrm{A}` },
    { id: "3", label: "I_F_LV", value: `I_{\\mathrm{F,LV}} = ${results.I_F_LV.toFixed(2)}~\mathrm{A}` },
    { id: "4", label: "I_F_HV", value: `I_{\\mathrm{F,HV}} = ${results.I_F_HV.toFixed(2)}~\mathrm{A}` },
    { id: "5", label: "I_set_LV", value: `I_{\\mathrm{set,LV}} = ${results.I_set_LV.toFixed(2)}~\mathrm{A}` },
    { id: "6", label: "I_set_HV", value: `I_{\\mathrm{set,HV}} = ${results.I_set_HV.toFixed(2)}~\mathrm{A}` },
    { id: "7", label: "PSM_LV", value: `\\mathrm{PSM}_{\\mathrm{LV}} = ${results.PSM_LV.toFixed(2)}` },
    { id: "8", label: "PSM_HV", value: `\\mathrm{PSM}_{\\mathrm{HV}} = ${results.PSM_HV.toFixed(2)}` },
    { id: "9", label: "TMS_LV", value: `\\mathrm{TMS}_{\\mathrm{LV}} = ${results.TMS_LV.toFixed(2)}` },
    { id: "10", label: "TMS_HV", value: `\\mathrm{TMS}_{\\mathrm{HV}} = ${results.TMS_HV.toFixed(2)}` }
  ];
};

// KaTeX rendering helper
export const renderMathInElement = (element: HTMLElement, formula: string) => {
  if (typeof window !== 'undefined' && (window as any).katex) {
    (window as any).katex.render(formula, element, { throwOnError: false });
  }
};

// Generate equation text
export const generateEquationText = (
  tripTime: number,
  beta: number,
  alfa: number,
  L: number,
  side: 'LV' | 'HV'
): string => {
  let LText = L === 0 ? "" : ` + ${L}`;
  return `${side}: {\\text{t}} = ${tripTime.toFixed(2)} * \\dfrac{${beta.toFixed(2)}}{{\\left({\\dfrac {I}  {I_{\\text{s}}}}\\right)^{${alfa}}}} ${LText} sec`;
};

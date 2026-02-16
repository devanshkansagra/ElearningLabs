import { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import * as C_ from "../utils/ComplexOperatorAid";
import * as M_ from "../utils/AddMarkersZ";
import * as G_ from "../utils/MainSVGZ";
import * as I_ from "../utils/InputsZ";
import * as aP_ from "../utils/quantity";
import { ComplexNumber } from "../utils/ComplexOperatorAid";

export interface VectorData {
  key: string;
  value: ComplexNumber & { magnitude?: number; angle?: number };
}

export interface UseImpedanceZOptions {
  svg: d3.Selection<any, any, any, any>;
  vectorsData: { [key: string]: ComplexNumber & { magnitude?: number; angle?: number } };
  colors: { [key: string]: string };
  arrowSize: number;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  mainGroup: d3.Selection<any, any, any, any>;
  svg_apparentPower: d3.Selection<any, any, any, any>;
  svg_admittance: d3.Selection<any, any, any, any>;
  svg_SequenceImpedance: d3.Selection<any, any, any, any>;
  svg_SequenceCurrentAndVoltage: d3.Selection<any, any, any, any>;
  svg_PhasePhaseVoltage: d3.Selection<any, any, any, any>;
  svg_PhasePhaseCurrent: d3.Selection<any, any, any, any>;
  svg_PhasePhaseImpedance: d3.Selection<any, any, any, any>;
  svg_Zaids: d3.Selection<any, any, any, any>;
  onInputChanged?: (event: Event, d: VectorData) => void;
}

export function useImpedanceZ(options: UseImpedanceZOptions) {
  const {
    svg,
    vectorsData,
    colors,
    arrowSize,
    xScale,
    yScale,
    mainGroup,
    svg_apparentPower,
    svg_admittance,
    svg_SequenceImpedance,
    svg_SequenceCurrentAndVoltage,
    svg_PhasePhaseVoltage,
    svg_PhasePhaseCurrent,
    svg_PhasePhaseImpedance,
    svg_Zaids,
    onInputChanged,
  } = options;

  const updateFunctionsRef = useRef<{
    updatePowerSC?: () => void;
    updatePowerYC?: () => void;
    updatePowerSI?: () => void;
    updatePowerSCV?: () => void;
    updatePowerPPV?: () => void;
    updatePowerPPI?: () => void;
    updatePowerPPZ?: () => void;
    updatePowerZaids?: () => void;
  }>({});

  const inputDivRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const inputDiv1Ref = useRef<d3.Selection<any, any, any, any> | null>(null);

  // Initialize markers
  useEffect(() => {
    M_.Vmarker(svg, Object.keys(colors), arrowSize, colors);
  }, [svg, colors, arrowSize]);

  // Initialize quantity displays
  useEffect(() => {
    const { updateQuantity: updatePowerSC } = aP_.quantity(
      vectorsData,
      svg_apparentPower,
      colors,
      ["SA", "SB", "SC", "S0", "S1", "S2"],
      "Apparent Power SA SB SC S0 S1 S2"
    );

    const { updateQuantity: updatePowerYC } = aP_.quantity(
      vectorsData,
      svg_admittance,
      colors,
      ["YA", "YB", "YC"],
      "Admittance YA YB YC"
    );

    const { updateQuantity: updatePowerSI } = aP_.quantity(
      vectorsData,
      svg_SequenceImpedance,
      colors,
      ["Z0", "Z1", "Z2", "ZA", "ZB", "ZC"],
      "Z0 Z1 Z2 ZA ZB ZC"
    );

    const { updateQuantity: updatePowerSCV } = aP_.quantity(
      vectorsData,
      svg_SequenceCurrentAndVoltage,
      colors,
      ["V0", "V1", "V2", "I0", "I1", "I2"],
      "V0 V1 V2 I0 I1 I2"
    );

    const { updateQuantity: updatePowerPPV } = aP_.quantity(
      vectorsData,
      svg_PhasePhaseVoltage,
      colors,
      ["VAB", "VBC", "VCA"],
      "Phase-Phase Voltage"
    );

    const { updateQuantity: updatePowerPPI } = aP_.quantity(
      vectorsData,
      svg_PhasePhaseCurrent,
      colors,
      ["IAB", "IBC", "ICA"],
      "Phase-Phase Current"
    );

    const { updateQuantity: updatePowerPPZ } = aP_.quantity(
      vectorsData,
      svg_PhasePhaseImpedance,
      colors,
      ["ZAB", "ZBC", "ZCA"],
      "Phase-Phase Impedance"
    );

    const { updateQuantity: updatePowerZaids } = aP_.quantity(
      vectorsData,
      svg_Zaids,
      colors,
      ["ZsymetricalTotal", "Zn"],
      "ZT = Z1+Z2+Z0, Zn"
    );

    updateFunctionsRef.current = {
      updatePowerSC,
      updatePowerYC,
      updatePowerSI,
      updatePowerSCV,
      updatePowerPPV,
      updatePowerPPI,
      updatePowerPPZ,
      updatePowerZaids,
    };

    // Initial updates
    updatePowerSC();
    updatePowerYC();
    updatePowerSI();
    updatePowerSCV();
    updatePowerPPV();
    updatePowerPPI();
    updatePowerPPZ();
    updatePowerZaids();
  }, [vectorsData, svg_apparentPower, svg_admittance, svg_SequenceImpedance, svg_SequenceCurrentAndVoltage, svg_PhasePhaseVoltage, svg_PhasePhaseCurrent, svg_PhasePhaseImpedance, svg_Zaids, colors]);

  // Calculate impedances
  const calculateImpedances = useCallback((data: { [key: string]: ComplexNumber }) => {
    data.ZA.x = C_.complexDivision(data.VA, data.IA).x;
    data.ZA.y = C_.complexDivision(data.VA, data.IA).y;
    data.ZB.x = C_.complexDivision(data.VB, data.IB).x;
    data.ZB.y = C_.complexDivision(data.VB, data.IB).y;
    data.ZC.x = C_.complexDivision(data.VC, data.IC).x;
    data.ZC.y = C_.complexDivision(data.VC, data.IC).y;
    return data;
  }, []);

  // Calculate sequence impedances
  const calculateSequenceImpedances = useCallback((data: { [key: string]: ComplexNumber }) => {
    const a = C_.a;
    const a2 = C_.a2;

    data.Z0.x = C_.complexDivision(
      C_.complexAdd3(data.ZA, data.ZB, data.ZC),
      C_.III
    ).x;
    data.Z0.y = C_.complexDivision(
      C_.complexAdd3(data.ZA, data.ZB, data.ZC),
      C_.III
    ).y;

    data.Z1.x = C_.complexDivision(
      C_.complexAdd3(
        data.ZA,
        C_.complexMultiplication(data.ZB, a),
        C_.complexMultiplication(data.ZC, a2)
      ),
      C_.III
    ).x;
    data.Z1.y = C_.complexDivision(
      C_.complexAdd3(
        data.ZA,
        C_.complexMultiplication(data.ZB, a),
        C_.complexMultiplication(data.ZC, a2)
      ),
      C_.III
    ).y;

    data.Z2.x = C_.complexDivision(
      C_.complexAdd3(
        data.ZA,
        C_.complexMultiplication(data.ZB, a2),
        C_.complexMultiplication(data.ZC, a)
      ),
      C_.III
    ).x;
    data.Z2.y = C_.complexDivision(
      C_.complexAdd3(
        data.ZA,
        C_.complexMultiplication(data.ZB, a2),
        C_.complexMultiplication(data.ZC, a)
      ),
      C_.III
    ).y;

    return data;
  }, []);

  // Create input fields
  const createInputFields = useCallback(() => {
    // Impedance table
    inputDiv1Ref.current = I_.Inputs(
      "#input-fields1",
      "ImpedanceTable Z",
      "input-field1",
      [
        { key: "ZA", value: vectorsData.ZA },
        { key: "ZB", value: vectorsData.ZB },
        { key: "ZC", value: vectorsData.ZC },
        { key: "Z0", value: vectorsData.Z0 },
        { key: "Z1", value: vectorsData.Z1 },
        { key: "Z2", value: vectorsData.Z2 },
      ],
      onInputChanged || (() => {})
    );

    // Current and voltage table
    inputDivRef.current = I_.Inputs(
      "#input-fields",
      "CurrentAndVoltageTable",
      "input-field",
      [
        { key: "VA", value: vectorsData.VA },
        { key: "VB", value: vectorsData.VB },
        { key: "VC", value: vectorsData.VC },
        { key: "IA", value: vectorsData.IA },
        { key: "IB", value: vectorsData.IB },
        { key: "IC", value: vectorsData.IC },
      ],
      onInputChanged || (() => {})
    );

    // Polar input table
    I_.InputsPolar(
      "#input-fields",
      "polarTable",
      "input-fieldPolar",
      [
        { key: "VA", value: vectorsData.VA },
        { key: "VB", value: vectorsData.VB },
        { key: "VC", value: vectorsData.VC },
        { key: "IA", value: vectorsData.IA },
        { key: "IB", value: vectorsData.IB },
        { key: "IC", value: vectorsData.IC },
      ],
      onInputChanged || (() => {})
    );
  }, [vectorsData, onInputChanged]);

  // Update input fields
  const updateInputFields = useCallback((phaseDataArray: VectorData[]) => {
    if (inputDivRef.current) {
      phaseDataArray.forEach(function(phaseData) {
        const phase = phaseData.key;
        const realInput = inputDivRef.current?.select(`#${phase}-real`);
        const imaginaryInput = inputDivRef.current?.select(`#${phase}-imaginary`);
        if (realInput) realInput.property("value", phaseData.value.x.toFixed(2));
        if (imaginaryInput) imaginaryInput.property("value", phaseData.value.y.toFixed(2));
      });
    }
  }, []);

  // Make Z fields readonly
  useEffect(() => {
    d3.selectAll(".Z").attr("readonly", true).style("pointer-events", "none");
  }, []);

  // Update all visualizations
  const updateAllVisualizations = useCallback((phase?: string) => {
    const funcs = updateFunctionsRef.current;
    if (funcs.updatePowerSC) funcs.updatePowerSC();
    if (funcs.updatePowerYC) funcs.updatePowerYC();
    if (funcs.updatePowerSI) funcs.updatePowerSI();
    if (funcs.updatePowerSCV) funcs.updatePowerSCV();
    if (funcs.updatePowerPPV) funcs.updatePowerPPV();
    if (funcs.updatePowerPPI) funcs.updatePowerPPI();
    if (funcs.updatePowerPPZ) funcs.updatePowerPPZ();
    if (funcs.updatePowerZaids) funcs.updatePowerZaids();
  }, []);

  // Initialize
  useEffect(() => {
    createInputFields();
    calculateImpedances(vectorsData);
    updateInputFields([
      { key: "IA", value: vectorsData.IA },
      { key: "IB", value: vectorsData.IB },
      { key: "IC", value: vectorsData.IC },
      { key: "VA", value: vectorsData.VA },
      { key: "VB", value: vectorsData.VB },
      { key: "VC", value: vectorsData.VC },
      { key: "Z0", value: vectorsData.Z0 },
      { key: "Z1", value: vectorsData.Z1 },
      { key: "Z2", value: vectorsData.Z2 },
      { key: "ZA", value: vectorsData.ZA },
      { key: "ZB", value: vectorsData.ZB },
      { key: "ZC", value: vectorsData.ZC },
    ]);
  }, [createInputFields, calculateImpedances, vectorsData, updateInputFields]);

  return {
    calculateImpedances,
    calculateSequenceImpedances,
    updateInputFields,
    updateAllVisualizations,
    createInputFields,
  };
}

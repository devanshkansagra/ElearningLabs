"use client";
import '../style.css'
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";
import * as ComplexOp from "../utils/ComplexOperatorAid";
import * as AddMarkers from "../utils/AddMarkersZ";
import * as MainSVG from "../utils/MainSVGZ";
import * as Inputs from "../utils/InputsZ";
import * as Quantity from "../utils/quantity";

export interface VectorDataValue {
  x: number;
  y: number; 
  magnitude?: number;
  angle?: number;
}

export interface VectorsData {
  [key: string]: VectorDataValue;
}

const Lab6 = () => {
  const [isPolar, setIsPolar] = useState(false);
  const svgMainRef = useRef<SVGSVGElement>(null);
  const hasInitialized = useRef(false);
  
  // Store refs for SVG elements
  const svgRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const mainGroupRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const xScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const yScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const vectorsDataRef = useRef<any>(null);
  
  // Refs for secondary SVGs
  const svg_apparentPowerRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_admittanceRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_SequenceImpedanceRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_SequenceCurrentAndVoltageRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_PhasePhaseVoltageRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_PhasePhaseCurrentRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_PhasePhaseImpedanceRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const svg_ZaidsRef = useRef<d3.Selection<any, any, any, any> | null>(null);

  // Store update functions for secondary SVGs
  const updatePowerSCRef = useRef<(() => void) | null>(null);
  const updatePowerYCRef = useRef<(() => void) | null>(null);
  const updatePowerSIRef = useRef<(() => void) | null>(null);
  const updatePowerSCVRef = useRef<(() => void) | null>(null);
  const updatePowerPPVRef = useRef<(() => void) | null>(null);
  const updatePowerPPIRef = useRef<(() => void) | null>(null);
  const updatePowerPPZRef = useRef<(() => void) | null>(null);
  const updatePowerZaidsRef = useRef<(() => void) | null>(null);

  // Constants
  const svgWidth = 250;
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const arrowSize = 8;
  const colors = {
    A: "red",
    B: "gold",
    C: "blue",
    0: "darkgrey",
    1: "limegreen",
    2: "magenta",
    s: "white",
    n: "cyan",
  };
  const colorAxis = { xAxis: "white", yAxis: "white" };

  // Calculate impedances function
  const calculateImpedances = useCallback((data: any) => {
    data.ZA.x = ComplexOp.complexDivision(data.VA, data.IA).x;
    data.ZA.y = ComplexOp.complexDivision(data.VA, data.IA).y;
    data.ZB.x = ComplexOp.complexDivision(data.VB, data.IB).x;
    data.ZB.y = ComplexOp.complexDivision(data.VB, data.IB).y;
    data.ZC.x = ComplexOp.complexDivision(data.VC, data.IC).x;
    data.ZC.y = ComplexOp.complexDivision(data.VC, data.IC).y;
    return data;
  }, []);

  // Calculate sequence impedances function
  const calculateSequenceImpedances = useCallback((data: any) => {
    const a = ComplexOp.a;
    const a2 = ComplexOp.a2;

    data.Z0.x = ComplexOp.complexDivision(
      ComplexOp.complexAdd3(data.ZA, data.ZB, data.ZC),
      ComplexOp.III
    ).x;
    data.Z0.y = ComplexOp.complexDivision(
      ComplexOp.complexAdd3(data.ZA, data.ZB, data.ZC),
      ComplexOp.III
    ).y;

    data.Z1.x = ComplexOp.complexDivision(
      ComplexOp.complexAdd3(
        data.ZA,
        ComplexOp.complexMultiplication(data.ZB, a),
        ComplexOp.complexMultiplication(data.ZC, a2)
      ),
      ComplexOp.III
    ).x;
    data.Z1.y = ComplexOp.complexDivision(
      ComplexOp.complexAdd3(
        data.ZA,
        ComplexOp.complexMultiplication(data.ZB, a),
        ComplexOp.complexMultiplication(data.ZC, a2)
      ),
      ComplexOp.III
    ).y;

    data.Z2.x = ComplexOp.complexDivision(
      ComplexOp.complexAdd3(
        data.ZA,
        ComplexOp.complexMultiplication(data.ZB, a2),
        ComplexOp.complexMultiplication(data.ZC, a)
      ),
      ComplexOp.III
    ).x;
    data.Z2.y = ComplexOp.complexDivision(
      ComplexOp.complexAdd3(
        data.ZA,
        ComplexOp.complexMultiplication(data.ZB, a2),
        ComplexOp.complexMultiplication(data.ZC, a)
      ),
      ComplexOp.III
    ).y;

    return data;
  }, []);

  // Initialize quantity displays
  const initializeQuantities = useCallback((svg: d3.Selection<any, any, any, any>, svgId: string, quantityKeys: string[], title: string) => {
    const svgEl = d3.select(`#${svgId}`);
    svgEl.attr("width", svgWidth).attr("height", svgWidth);
    return Quantity.quantity(vectorsDataRef.current, svgEl, colors, quantityKeys, title);
  }, [colors]);

  // Create input fields
  const createInputFields = useCallback((onInputChanged?: (event: Event, d: any) => void) => {
    // Impedance table
    Inputs.Inputs(
      "#input-fields1",
      "ImpedanceTable Z",
      "input-field1",
      [
        { key: "ZA", value: vectorsDataRef.current.ZA },
        { key: "ZB", value: vectorsDataRef.current.ZB },
        { key: "ZC", value: vectorsDataRef.current.ZC },
        { key: "Z0", value: vectorsDataRef.current.Z0 },
        { key: "Z1", value: vectorsDataRef.current.Z1 },
        { key: "Z2", value: vectorsDataRef.current.Z2 },
      ],
      onInputChanged || (() => {})
    );

    // Current and voltage table
    Inputs.Inputs(
      "#input-fields",
      "CurrentAndVoltageTable",
      "input-field",
      [
        { key: "VA", value: vectorsDataRef.current.VA },
        { key: "VB", value: vectorsDataRef.current.VB },
        { key: "VC", value: vectorsDataRef.current.VC },
        { key: "IA", value: vectorsDataRef.current.IA },
        { key: "IB", value: vectorsDataRef.current.IB },
        { key: "IC", value: vectorsDataRef.current.IC },
      ],
      onInputChanged || (() => {})
    );

    // Polar input table
    Inputs.InputsPolar(
      "#input-fields",
      "polarTable",
      "input-fieldPolar",
      [
        { key: "VA", value: vectorsDataRef.current.VA },
        { key: "VB", value: vectorsDataRef.current.VB },
        { key: "VC", value: vectorsDataRef.current.VC },
        { key: "IA", value: vectorsDataRef.current.IA },
        { key: "IB", value: vectorsDataRef.current.IB },
        { key: "IC", value: vectorsDataRef.current.IC },
      ],
      onInputChanged || (() => {})
    );

    // Make Z fields readonly
    d3.selectAll(".Z").attr("readonly", true).style("pointer-events", "none");
  }, []);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // --- VECTORS DATA ---
    const vectorsData: any = {
      VA: { x: 2, y: 0 },
      VAB: {
        get x() { return vectorsData.VB.x - vectorsData.VA.x; },
        get y() { return vectorsData.VB.y - vectorsData.VA.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      VB: { x: -1, y: +Math.sqrt(3) },
      VBC: {
        get x() { return vectorsData.VC.x - vectorsData.VB.x; },
        get y() { return vectorsData.VC.y - vectorsData.VB.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      VC: { x: -1, y: -Math.sqrt(3) },
      VCA: {
        get x() { return vectorsData.VA.x - vectorsData.VC.x; },
        get y() { return vectorsData.VA.y - vectorsData.VC.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      IA: { x: 1, y: 0 },
      IAB: {
        get x() { return vectorsData.IB.x - vectorsData.IA.x; },
        get y() { return vectorsData.IB.y - vectorsData.IA.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      IB: { x: -0.5, y: +0.8660254037844386 },
      IBC: {
        get x() { return vectorsData.IC.x - vectorsData.IB.x; },
        get y() { return vectorsData.IC.y - vectorsData.IB.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      IC: { x: -0.5, y: -0.8660254037844386 },
      ICA: {
        get x() { return vectorsData.IA.x - vectorsData.IC.x; },
        get y() { return vectorsData.IA.y - vectorsData.IC.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      SA: {
        get x() { return vectorsData.VA.x * vectorsData.IA.x - vectorsData.VA.y * vectorsData.IA.y; },
        get y() { return vectorsData.VA.y * vectorsData.IA.x + vectorsData.VA.x * vectorsData.IA.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      SB: {
        get x() { return vectorsData.VB.x * vectorsData.IB.x - vectorsData.VB.y * vectorsData.IB.y; },
        get y() { return vectorsData.VB.y * vectorsData.IB.x + vectorsData.VB.x * vectorsData.IB.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      SC: {
        get x() { return vectorsData.VC.x * vectorsData.IC.x - vectorsData.VC.y * vectorsData.IC.y; },
        get y() { return vectorsData.VC.y * vectorsData.IC.x + vectorsData.VC.x * vectorsData.IC.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      S0: {
        get x() { return (vectorsData.SA.x + vectorsData.SB.x + vectorsData.SC.x) / 3; },
        get y() { return (vectorsData.SA.y + vectorsData.SB.y + vectorsData.SC.y) / 3; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      S1: {
        get x() {
          const SBx_a2 = vectorsData.SB.x * ComplexOp.a2.x - vectorsData.SB.y * ComplexOp.a2.y;
          const SBy_a2 = vectorsData.SB.x * ComplexOp.a2.y + vectorsData.SB.y * ComplexOp.a2.x;
          const SCx_a = vectorsData.SC.x * ComplexOp.a.x - vectorsData.SC.y * ComplexOp.a.y;
          const SCy_a = vectorsData.SC.x * ComplexOp.a.y + vectorsData.SC.y * ComplexOp.a.x;
          return (vectorsData.SA.x + SBx_a2 + SCx_a) / 3;
        },
        get y() {
          const SBx_a2 = vectorsData.SB.x * ComplexOp.a2.x - vectorsData.SB.y * ComplexOp.a2.y;
          const SBy_a2 = vectorsData.SB.x * ComplexOp.a2.y + vectorsData.SB.y * ComplexOp.a2.x;
          const SCx_a = vectorsData.SC.x * ComplexOp.a.x - vectorsData.SC.y * ComplexOp.a.y;
          const SCy_a = vectorsData.SC.x * ComplexOp.a.y + vectorsData.SC.y * ComplexOp.a.x;
          return (vectorsData.SA.y + SBy_a2 + SCy_a) / 3;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      S2: {
        get x() {
          const SBx_a = vectorsData.SB.x * ComplexOp.a.x - vectorsData.SB.y * ComplexOp.a.y;
          const SBy_a = vectorsData.SB.x * ComplexOp.a.y + vectorsData.SB.y * ComplexOp.a.x;
          const SCx_a2 = vectorsData.SC.x * ComplexOp.a2.x - vectorsData.SC.y * ComplexOp.a2.y;
          const SCy_a2 = vectorsData.SC.x * ComplexOp.a2.y + vectorsData.SC.y * ComplexOp.a2.x;
          return (vectorsData.SA.x + SBx_a + SCx_a2) / 3;
        },
        get y() {
          const SBx_a = vectorsData.SB.x * ComplexOp.a.x - vectorsData.SB.y * ComplexOp.a.y;
          const SBy_a = vectorsData.SB.x * ComplexOp.a.y + vectorsData.SB.y * ComplexOp.a.x;
          const SCx_a2 = vectorsData.SC.x * ComplexOp.a2.x - vectorsData.SC.y * ComplexOp.a2.y;
          const SCy_a2 = vectorsData.SC.x * ComplexOp.a2.y + vectorsData.SC.y * ComplexOp.a2.x;
          return (vectorsData.SA.y + SBy_a + SCy_a2) / 3;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      ZA: { x: 2, y: 0 },
      ZB: { x: 2, y: 0 },
      ZC: { x: 2, y: 0 },
      I0: {
        get x() { return (vectorsData.IA.x + vectorsData.IB.x + vectorsData.IC.x) / 3; },
        get y() { return (vectorsData.IA.y + vectorsData.IB.y + vectorsData.IC.y) / 3; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      I1: {
        get x() {
          const IBx_a2 = vectorsData.IB.x * ComplexOp.a2.x - vectorsData.IB.y * ComplexOp.a2.y;
          const IBy_a2 = vectorsData.IB.x * ComplexOp.a2.y + vectorsData.IB.y * ComplexOp.a2.x;
          const ICx_a = vectorsData.IC.x * ComplexOp.a.x - vectorsData.IC.y * ComplexOp.a.y;
          const ICy_a = vectorsData.IC.x * ComplexOp.a.y + vectorsData.IC.y * ComplexOp.a.x;
          return (vectorsData.IA.x + IBx_a2 + ICx_a) / 3;
        },
        get y() {
          const IBx_a2 = vectorsData.IB.x * ComplexOp.a2.x - vectorsData.IB.y * ComplexOp.a2.y;
          const IBy_a2 = vectorsData.IB.x * ComplexOp.a2.y + vectorsData.IB.y * ComplexOp.a2.x;
          const ICx_a = vectorsData.IC.x * ComplexOp.a.x - vectorsData.IC.y * ComplexOp.a.y;
          const ICy_a = vectorsData.IC.x * ComplexOp.a.y + vectorsData.IC.y * ComplexOp.a.x;
          return (vectorsData.IA.y + IBy_a2 + ICy_a) / 3;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      I2: {
        get x() {
          const IBx_a = vectorsData.IB.x * ComplexOp.a.x - vectorsData.IB.y * ComplexOp.a.y;
          const IBy_a = vectorsData.IB.x * ComplexOp.a.y + vectorsData.IB.y * ComplexOp.a.x;
          const ICx_a2 = vectorsData.IC.x * ComplexOp.a2.x - vectorsData.IC.y * ComplexOp.a2.y;
          const ICy_a2 = vectorsData.IC.x * ComplexOp.a2.y + vectorsData.IC.y * ComplexOp.a2.x;
          return (vectorsData.IA.x + IBx_a + ICx_a2) / 3;
        },
        get y() {
          const IBx_a = vectorsData.IB.x * ComplexOp.a.x - vectorsData.IB.y * ComplexOp.a.y;
          const IBy_a = vectorsData.IB.x * ComplexOp.a.y + vectorsData.IB.y * ComplexOp.a.x;
          const ICx_a2 = vectorsData.IC.x * ComplexOp.a2.x - vectorsData.IC.y * ComplexOp.a2.y;
          const ICy_a2 = vectorsData.IC.x * ComplexOp.a2.y + vectorsData.IC.y * ComplexOp.a2.x;
          return (vectorsData.IA.y + IBy_a + ICy_a2) / 3;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      V0: {
        get x() { return (vectorsData.VA.x + vectorsData.VB.x + vectorsData.VC.x) / 3; },
        get y() { return (vectorsData.VA.y + vectorsData.VB.y + vectorsData.VC.y) / 3; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      V1: {
        get x() {
          const VBx_a2 = vectorsData.VB.x * ComplexOp.a2.x - vectorsData.VB.y * ComplexOp.a2.y;
          const VBy_a2 = vectorsData.VB.x * ComplexOp.a2.y + vectorsData.VB.y * ComplexOp.a2.x;
          const VCx_a = vectorsData.VC.x * ComplexOp.a.x - vectorsData.VC.y * ComplexOp.a.y;
          const VCy_a = vectorsData.VC.x * ComplexOp.a.y + vectorsData.VC.y * ComplexOp.a.x;
          return (vectorsData.VA.x + VBx_a2 + VCx_a) / 3;
        },
        get y() {
          const VBx_a2 = vectorsData.VB.x * ComplexOp.a2.x - vectorsData.VB.y * ComplexOp.a2.y;
          const VBy_a2 = vectorsData.VB.x * ComplexOp.a2.y + vectorsData.VB.y * ComplexOp.a2.x;
          const VCx_a = vectorsData.VC.x * ComplexOp.a.x - vectorsData.VC.y * ComplexOp.a.y;
          const VCy_a = vectorsData.VC.x * ComplexOp.a.y + vectorsData.VC.y * ComplexOp.a.x;
          return (vectorsData.VA.y + VBy_a2 + VCy_a) / 3;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      V2: {
        get x() {
          const VBx_a = vectorsData.VB.x * ComplexOp.a.x - vectorsData.VB.y * ComplexOp.a.y;
          const VBy_a = vectorsData.VB.x * ComplexOp.a.y + vectorsData.VB.y * ComplexOp.a.x;
          const VCx_a2 = vectorsData.VC.x * ComplexOp.a2.x - vectorsData.VC.y * ComplexOp.a2.y;
          const VCy_a2 = vectorsData.VC.x * ComplexOp.a2.y + vectorsData.VC.y * ComplexOp.a2.x;
          return (vectorsData.VA.x + VBx_a + VCx_a2) / 3;
        },
        get y() {
          const VBx_a = vectorsData.VB.x * ComplexOp.a.x - vectorsData.VB.y * ComplexOp.a.y;
          const VBy_a = vectorsData.VB.x * ComplexOp.a.y + vectorsData.VB.y * ComplexOp.a.x;
          const VCx_a2 = vectorsData.VC.x * ComplexOp.a2.x - vectorsData.VC.y * ComplexOp.a2.y;
          const VCy_a2 = vectorsData.VC.x * ComplexOp.a2.y + vectorsData.VC.y * ComplexOp.a2.x;
          return (vectorsData.VA.y + VBy_a + VCy_a2) / 3;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      Z0: { x: 0, y: 0, get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }, get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; } },
      Z1: { x: 3, y: 0, get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }, get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; } },
      Z2: { x: 0, y: 0, get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }, get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; } },
      ZAB: {
        get x() {
          const Nx = vectorsData.VB.x - vectorsData.VA.x;
          const Ny = vectorsData.VB.y - vectorsData.VA.y;
          const Dx = vectorsData.IB.x - vectorsData.IA.x;
          const Dy = vectorsData.IB.y - vectorsData.IA.y;
          const denom = Dx * Dx + Dy * Dy;
          return (Nx * Dx + Ny * Dy) / denom;
        },
        get y() {
          const Nx = vectorsData.VB.x - vectorsData.VA.x;
          const Ny = vectorsData.VB.y - vectorsData.VA.y;
          const Dx = vectorsData.IB.x - vectorsData.IA.x;
          const Dy = vectorsData.IB.y - vectorsData.IA.y;
          const denom = Dx * Dx + Dy * Dy;
          return (Ny * Dx - Nx * Dy) / denom;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      ZBC: {
        get x() {
          const Nx = vectorsData.VC.x - vectorsData.VB.x;
          const Ny = vectorsData.VC.y - vectorsData.VB.y;
          const Dx = vectorsData.IC.x - vectorsData.IB.x;
          const Dy = vectorsData.IC.y - vectorsData.IB.y;
          const denom = Dx * Dx + Dy * Dy;
          return (Nx * Dx + Ny * Dy) / denom;
        },
        get y() {
          const Nx = vectorsData.VC.x - vectorsData.VB.x;
          const Ny = vectorsData.VC.y - vectorsData.VB.y;
          const Dx = vectorsData.IC.x - vectorsData.IB.x;
          const Dy = vectorsData.IC.y - vectorsData.IB.y;
          const denom = Dx * Dx + Dy * Dy;
          return (Ny * Dx - Nx * Dy) / denom;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      ZCA: {
        get x() {
          const Nx = vectorsData.VA.x - vectorsData.VC.x;
          const Ny = vectorsData.VA.y - vectorsData.VC.y;
          const Dx = vectorsData.IA.x - vectorsData.IC.x;
          const Dy = vectorsData.IA.y - vectorsData.IC.y;
          const denom = Dx * Dx + Dy * Dy;
          return (Nx * Dx + Ny * Dy) / denom;
        },
        get y() {
          const Nx = vectorsData.VA.x - vectorsData.VC.x;
          const Ny = vectorsData.VA.y - vectorsData.VC.y;
          const Dx = vectorsData.IA.x - vectorsData.IC.x;
          const Dy = vectorsData.IA.y - vectorsData.IC.y;
          const denom = Dx * Dx + Dy * Dy;
          return (Ny * Dx - Nx * Dy) / denom;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      ZsymetricalTotal: {
        get x() { return vectorsData.Z0.x + vectorsData.Z1.x + vectorsData.Z2.x; },
        get y() { return vectorsData.Z0.y + vectorsData.Z1.y + vectorsData.Z2.y; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      Zn: {
        get x() { return (vectorsData.Z0.x - vectorsData.Z1.x) / 3; },
        get y() { return (vectorsData.Z0.y - vectorsData.Z1.y) / 3; },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      YA: {
        get x() {
          const Ax = vectorsData.IA.x, Ay = vectorsData.IA.y;
          const Bx = vectorsData.VA.x, By = vectorsData.VA.y;
          const denom = Bx * Bx + By * By;
          return (Ax * Bx + Ay * By) / denom;
        },
        get y() {
          const Ax = vectorsData.IA.x, Ay = vectorsData.IA.y;
          const Bx = vectorsData.VA.x, By = vectorsData.VA.y;
          const denom = Bx * Bx + By * By;
          return (Ay * Bx - Ax * By) / denom;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      YB: {
        get x() {
          const Ax = vectorsData.IB.x, Ay = vectorsData.IB.y;
          const Bx = vectorsData.VB.x, By = vectorsData.VB.y;
          const denom = Bx * Bx + By * By;
          return (Ax * Bx + Ay * By) / denom;
        },
        get y() {
          const Ax = vectorsData.IB.x, Ay = vectorsData.IB.y;
          const Bx = vectorsData.VB.x, By = vectorsData.VB.y;
          const denom = Bx * Bx + By * By;
          return (Ay * Bx - Ax * By) / denom;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
      YC: {
        get x() {
          const Ax = vectorsData.IC.x, Ay = vectorsData.IC.y;
          const Bx = vectorsData.VC.x, By = vectorsData.VC.y;
          const denom = Bx * Bx + By * By;
          return (Ax * Bx + Ay * By) / denom;
        },
        get y() {
          const Ax = vectorsData.IC.x, Ay = vectorsData.IC.y;
          const Bx = vectorsData.VC.x, By = vectorsData.VC.y;
          const denom = Bx * Bx + By * By;
          return (Ay * Bx - Ax * By) / denom;
        },
        get magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        get angle() { return (Math.atan2(this.y, this.x) * 180) / Math.PI; },
      },
    };

    // Store in ref
    vectorsDataRef.current = vectorsData;

    // --- MAIN SVG SETUP ---
    const svg = d3.select("#cell-1").append("svg")
      .attr("width", svgWidth)
      .attr("height", svgWidth)
      .attr("id", "svgMainVisual")
      .style("overflow", "visible");
    
    svgRef.current = svg;
    const mainGroup = svg.append("g").attr("id", "gMainVisual");
    mainGroupRef.current = mainGroup;

    // --- ARROW MARKERS ---
    AddMarkers.Vmarker(svg, Object.keys(colors), arrowSize, colors);

    svg.append("defs").selectAll("marker")
      .data(["markc-arc"])
      .enter().append("marker")
      .attr("id", "markc-arc")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", arrowSize / 1.5)
      .attr("markerHeight", arrowSize)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .style("fill", "darkgrey");

    svg.append("defs").selectAll("marker")
      .data(Object.keys(colorAxis))
      .enter().append("marker")
      .attr("id", d => `markc-${d}`)
      .attr("viewBox", "0 -10 20 20")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", arrowSize * 1.5)
      .attr("markerHeight", arrowSize * 1.5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-10L20,0L0,10z")
      .attr("class", "axisMarker")
      .style("fill", d => colorAxis[d as keyof typeof colorAxis]);

    // --- CLOCKWISE ROTATION ICON ---
    svg.append("path")
      .attr("d", "M19.89 10.105a8.696 8.696 0 0 0-.789-1.456l-1.658 1.119a6.606 6.606 0 0 1 .987 2.345 6.659 6.659 0 0 1 0 2.648 6.495 6.495 0 0 1-.384 1.231 6.404 6.404 0 0 1-.603 1.112 6.654 6.654 0 0 1-1.776 1.775 6.606 6.606 0 0 1-2.343.987 6.734 6.734 0 0 1-2.646 0 6.55 6.55 0 0 1-3.317-1.788 6.605 6.605 0 0 1-1.408-2.088 6.613 6.613 0 0 1-.382-1.23 6.627 6.627 0 0 1 .382-3.877A6.551 6.551 0 0 1 7.36 8.797 6.628 6.628 0 0 1 9.446 7.39c.395-.167.81-.296 1.23-.382.107-.022.216-.032.324-.049V10l5-4-5-4v2.938a8.805 8.805 0 0 0-.725.111 8.512 8.512 0 0 0-3.063 1.29A8.566 8.566 0 0 0 4.11 16.77a8.535 8.535 0 0 0 1.835 2.724 8.614 8.614 0 0 0 2.721 1.833 8.55 8.55 0 0 0 5.061.499 8.576 8.576 0 0 0 6.162-5.056c.22-.52.389-1.061.5-1.608a8.643 8.643 0 0 0 0-3.45 8.684 8.684 0 0 0-.499-1.607z")
      .attr("stroke", "none")
      .attr("fill", "darkgrey")
      .attr("class", "clockwise")
      .attr("transform", `scale(1, -1) translate(${svgWidth - margin.right - 10},${-margin.top - 10}) scale(1.5)`);

    svg.append("path")
      .attr("d", `m ${svgWidth - 12.5 - 10},${margin.top - 26 + 10} 0,10`)
      .attr("stroke", "darkgrey")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("class", "clockwise");

    svg.append("path")
      .attr("d", `m ${svgWidth - 17.5 - 10},${margin.top - 21 + 10} 10,0`)
      .attr("stroke", "darkgrey")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("class", "clockwise");

    // --- SCALES ---
    const xScale = d3.scaleLinear().domain([-3, 3]).range([margin.left, svgWidth - margin.right]);
    const yScale = d3.scaleLinear().domain([-3, 3]).range([svgWidth - margin.bottom, margin.top]);
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;

    // --- AXES ---
    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    mainGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${svgWidth / 2})`)
      .call(xAxis)
      .call(g => g.selectAll(".tick text").filter(d => d === 0).remove())
      .select(".domain")
      .attr("stroke", "white")
      .each(function() {
        const self = this as SVGElement;
        d3.select(self.parentNode as Element)
          .append("line")
          .attr("x1", svgWidth - margin.right)
          .attr("x2", svgWidth - margin.right + 15)
          .attr("y1", 0.5)
          .attr("y2", 0.5)
          .attr("class", "xAxisAider")
          .attr("stroke", "white")
          .attr("marker-end", "url(#markc-xAxis)");
      });

    mainGroup.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${svgWidth / 2},0)`)
      .call(yAxis)
      .call(g => g.selectAll(".tick text").filter(d => d === 0).remove())
      .select(".domain")
      .attr("stroke", "white")
      .each(function() {
        const self = this as SVGElement;
        d3.select(self.parentNode as Element)
          .append("line")
          .attr("x1", 0.5)
          .attr("x2", 0.5)
          .attr("y1", margin.top)
          .attr("y2", margin.top - 15)
          .attr("class", "yAxisAider")
          .attr("stroke", "white")
          .attr("marker-end", "url(#markc-yAxis)");
      });

    // --- SETUP OTHER SVGs ---
    const setupSvg = (id: string) => {
      const sel = d3.select(`#${id}`).attr("width", svgWidth).attr("height", svgWidth);
      return sel;
    };

    svg_apparentPowerRef.current = setupSvg("apparentPower");
    svg_admittanceRef.current = setupSvg("admittance");
    svg_SequenceImpedanceRef.current = setupSvg("svgSequenceImpedance");
    svg_SequenceCurrentAndVoltageRef.current = setupSvg("svgSequenceCurrentAndVoltage");
    svg_PhasePhaseVoltageRef.current = setupSvg("svgPhasePhaseVoltage");
    svg_PhasePhaseCurrentRef.current = setupSvg("svgPhasePhaseCurrent");
    svg_PhasePhaseImpedanceRef.current = setupSvg("svgPhasePhaseImpedance");
    svg_ZaidsRef.current = setupSvg("svgZaids");

    // --- INITIALIZE QUANTITIES ---
    if (svg_apparentPowerRef.current) {
      const resultSC = Quantity.quantity(vectorsData, svg_apparentPowerRef.current, colors, ["SA", "SB", "SC", "S0", "S1", "S2"], "Apparent Power SA SB SC S0 S1 S2");
      updatePowerSCRef.current = resultSC?.updateQuantity || null;
    }
    if (svg_admittanceRef.current) {
      const resultYC = Quantity.quantity(vectorsData, svg_admittanceRef.current, colors, ["YA", "YB", "YC"], "Admittance YA YB YC");
      updatePowerYCRef.current = resultYC?.updateQuantity || null;
    }
    if (svg_SequenceImpedanceRef.current) {
      const resultSI = Quantity.quantity(vectorsData, svg_SequenceImpedanceRef.current, colors, ["Z0", "Z1", "Z2", "ZA", "ZB", "ZC"], "Z0 Z1 Z2 ZA ZB ZC");
      updatePowerSIRef.current = resultSI?.updateQuantity || null;
    }
    if (svg_SequenceCurrentAndVoltageRef.current) {
      const resultSCV = Quantity.quantity(vectorsData, svg_SequenceCurrentAndVoltageRef.current, colors, ["V0", "V1", "V2", "I0", "I1", "I2"], "V0 V1 V2 I0 I1 I2");
      updatePowerSCVRef.current = resultSCV?.updateQuantity || null;
    }
    if (svg_PhasePhaseVoltageRef.current) {
      const resultPPV = Quantity.quantity(vectorsData, svg_PhasePhaseVoltageRef.current, colors, ["VAB", "VBC", "VCA"], "Phase-Phase Voltage");
      updatePowerPPVRef.current = resultPPV?.updateQuantity || null;
    }
    if (svg_PhasePhaseCurrentRef.current) {
      const resultPPI = Quantity.quantity(vectorsData, svg_PhasePhaseCurrentRef.current, colors, ["IAB", "IBC", "ICA"], "Phase-Phase Current");
      updatePowerPPIRef.current = resultPPI?.updateQuantity || null;
    }
    if (svg_PhasePhaseImpedanceRef.current) {
      const resultPPZ = Quantity.quantity(vectorsData, svg_PhasePhaseImpedanceRef.current, colors, ["ZAB", "ZBC", "ZCA"], "Phase-Phase Impedance");
      updatePowerPPZRef.current = resultPPZ?.updateQuantity || null;
    }
    if (svg_ZaidsRef.current) {
      const resultZaids = Quantity.quantity(vectorsData, svg_ZaidsRef.current, colors, ["ZsymetricalTotal", "Zn"], "ZT = Z1+Z2+Z0, Zn");
      updatePowerZaidsRef.current = resultZaids?.updateQuantity || null;
    }

    // --- CREATE VECTORS ---
    const drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

    const vectorsDataArray = [
      { key: "ZA", value: vectorsData.ZA },
      { key: "ZB", value: vectorsData.ZB },
      { key: "ZC", value: vectorsData.ZC },
      { key: "VA", value: vectorsData.VA },
      { key: "VB", value: vectorsData.VB },
      { key: "VC", value: vectorsData.VC },
      { key: "IA", value: vectorsData.IA },
      { key: "IB", value: vectorsData.IB },
      { key: "IC", value: vectorsData.IC },
    ];

    MainSVG.GroupSVG(vectorsDataArray, drag, colors, mainGroup, xScale, yScale);

    // --- CREATE INPUT FIELDS ---
    createInputFields();

    // --- CALCULATE IMPEDANCES ---
    calculateImpedances(vectorsData);
    calculateSequenceImpedances(vectorsData);

    // --- DYNAMIC TABLE GENERATION ---
    const tablesContainer = document.getElementById("dynamic-tables-container");
    if (tablesContainer && tablesContainer.innerHTML === "") {
      const tablesData = [
        {
          title: "Phase Currents",
          data: { IA: "1.0∠0°", IB: "1.0∠120°", IC: "1.0∠-120°" },
          insight: `<p>Phase Currents: Imbalances in I<sub>A</sub>, I<sub>B</sub>, and I<sub>C</sub> may indicate unbalanced loads.</p>`,
        },
        {
          title: "Phase Voltages",
          data: { VA: "2.0∠0°", VB: "2.0∠120°", VC: "2.0∠-120°" },
          insight: `<p>Phase Voltages: Balanced phase voltages are critical for normal operation.</p>`,
        },
        {
          title: "Sequence Components",
          data: { V0: "0.0", V1: "2.0", V2: "0.0", I0: "0.0", I1: "1.0", I2: "0.0" },
          insight: `<p>Positive-sequence indicates balanced operation; negative suggests unbalance.</p>`,
        },
      ];

      tablesData.forEach((table) => {
        const title = document.createElement("h3");
        title.className = "text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 mt-4 border-b border-slate-200 pb-1";
        title.textContent = table.title;
        tablesContainer.appendChild(title);

        const tableEl = document.createElement("table");
        tableEl.className = "w-full text-sm text-left border-collapse";
        tableEl.innerHTML = `<tbody class="text-slate-700">${Object.entries(table.data).map(([k, v]) => `<tr class="border-b border-slate-100"><td class="p-2 font-mono text-xs font-semibold">${k}</td><td class="p-2 font-mono text-xs">${v}</td></tr>`).join("")}</tbody>`;
        tablesContainer.appendChild(tableEl);

        const insight = document.createElement("div");
        insight.className = "text-xs text-slate-500 p-3 bg-slate-50 rounded-lg mt-2 border border-slate-100";
        insight.innerHTML = table.insight;
        tablesContainer.appendChild(insight);
      });
    }

    // --- DRAG FUNCTIONS ---
    function dragstarted(this: Element, event: any, d: any) {
      d3.select(this).raise().classed("active", true);
    }

    function dragended(this: Element, event: any, d: any) {
      let max = Number.NEGATIVE_INFINITY;
      const allPhases = ["A", "B", "C"];
      for (let i = 0; i < 3; i++) {
        const magnitude = Math.max(
          Math.abs(vectorsData["I" + allPhases[i]].x),
          Math.abs(vectorsData["I" + allPhases[i]].y),
          Math.abs(vectorsData["V" + allPhases[i]].x),
          Math.abs(vectorsData["V" + allPhases[i]].y),
          Math.abs(vectorsData["Z" + allPhases[i]].x),
          Math.abs(vectorsData["Z" + allPhases[i]].y)
        );
        max = Math.max(max, magnitude);
      }

      xScale.domain([-max, max]);
      yScale.domain([-max, max]);
      mainGroup.select(".x-axis").transition().duration(1000).call(xAxis as any);
      mainGroup.select(".y-axis").transition().duration(1000).call(yAxis as any);

      d3.select(this).classed("active", false);
    }

    function dragged(this: Element, event: any, d: any) {
      if ("Z" !== d.key.charAt(0)) {
        const newX = xScale.invert(event.x);
        const newY = yScale.invert(event.y);

        d.value.x = newX;
        d.value.y = newY;
        vectorsData[d.key].x = newX;
        vectorsData[d.key].y = newY;

        // Update magnitude & angle
        const mag = Math.sqrt(newX * newX + newY * newY);
        const ang = (Math.atan2(newY, newX) * 180) / Math.PI;
        d.value.magnitude = mag;
        d.value.angle = ang;
        vectorsData[d.key].magnitude = mag;
        vectorsData[d.key].angle = ang;

        d3.selectAll(".input-field").each(function(d: any) {
          d3.select(`#${d.key}-real`).property("value", d.value.x.toFixed(2));
          d3.select(`#${d.key}-imaginary`).property("value", d.value.y.toFixed(2));
        });
        d3.selectAll(".input-fieldPolar").each(function(d: any) {
          d3.select(`#${d.key}-amplitude`).property("value", d.value.magnitude?.toFixed(2));
          d3.select(`#${d.key}-angle`).property("value", d.value.angle?.toFixed(2));
        });

        d3.select(this).select("line").attr("x2", event.x).attr("y2", event.y);
        d3.select(this).select("circle").attr("cx", event.x).attr("cy", event.y);
        d3.select(this).select("text")
          .attr("x", event.x + 5)
          .attr("y", event.y - 5)
          .text(`${d.key} ${Math.sqrt(d.value.x ** 2 + d.value.y ** 2).toFixed(1)}/${((Math.atan2(d.value.y, d.value.x) * 180) / Math.PI).toFixed(0)}°`);

        vectorsData[d.key].x = d.value.x;
        vectorsData[d.key].y = d.value.y;
        
        // Calculate and update impedance
        if (["A", "B", "C"].includes(d.key.charAt(1))) {
          const z = ComplexOp.complexDivision(
            vectorsData["V" + d.key.charAt(1)],
            vectorsData["I" + d.key.charAt(1)]
          );

          d3.select(`#Z${d.key.charAt(1)}-real`).property("value", z.x.toFixed(2));
          d3.select(`#Z${d.key.charAt(1)}-imaginary`).property("value", z.y.toFixed(2));
          vectorsData["Z" + d.key.charAt(1)].x = z.x;
          vectorsData["Z" + d.key.charAt(1)].y = z.y;
          
          calculateSequenceImpedances(vectorsData);
        }

        // Update visualizations
        mainGroup.selectAll(`.${d.key}`).attr("x2", xScale(d.value.x)).attr("y2", yScale(d.value.y))
          .attr("x", xScale(d.value.x)).attr("y", yScale(d.value.y))
          .attr("cx", xScale(d.value.x)).attr("cy", yScale(d.value.y));

        calculateImpedances(vectorsData);

        // Update secondary visualizations
        if (updatePowerSCRef.current) updatePowerSCRef.current();
        if (updatePowerYCRef.current) updatePowerYCRef.current();
        if (updatePowerSIRef.current) updatePowerSIRef.current();
        if (updatePowerSCVRef.current) updatePowerSCVRef.current();
        if (updatePowerPPVRef.current) updatePowerPPVRef.current();
        if (updatePowerPPIRef.current) updatePowerPPIRef.current();
        if (updatePowerPPZRef.current) updatePowerPPZRef.current();
        if (updatePowerZaidsRef.current) updatePowerZaidsRef.current();
      }
    }

    // --- DOUBLE CLICK INTERACTION ---
    const mosaicContainer = document.getElementById("mosaic-container");
    const svgAll = [
      { svg: "svgMainVisual", layout: "custom-layout", cell: "cell-1" },
      { svg: "svgSequenceImpedance", layout: "custom-layoutTopMiddle", cell: "cell-2" },
      { svg: "apparentPower", layout: "custom-layoutTopRight", cell: "cell-3" },
      { svg: "svgSequenceCurrentAndVoltage", layout: "custom-layoutMiddleLeft", cell: "cell-4" },
      { svg: "svgZaids", layout: "custom-layoutMiddleMiddle", cell: "cell-5" },
      { svg: "admittance", layout: "custom-layoutMiddleRight", cell: "cell-6" },
      { svg: "svgPhasePhaseVoltage", layout: "custom-layoutBottomLeft", cell: "cell-7" },
      { svg: "svgPhasePhaseCurrent", layout: "custom-layoutBottomMiddle", cell: "cell-8" },
      { svg: "svgPhasePhaseImpedance", layout: "custom-layoutBottomRight", cell: "cell-9" },
    ];

    if (mosaicContainer) {
      mosaicContainer.classList.add("default-layout");

      svgAll.forEach((svgElement) => {
        const thisSvgElement = document.getElementById(svgElement.svg);
        if (!thisSvgElement) return;

        const cellElement = document.getElementById(svgElement.cell);
        if (!cellElement) return;

        thisSvgElement.addEventListener("dblclick", () => {
          const previousSibling = thisSvgElement.previousElementSibling;

          if (mosaicContainer.classList.contains("default-layout")) {
            mosaicContainer.classList.remove("default-layout");
            mosaicContainer.classList.add(svgElement.layout);

            if (previousSibling && previousSibling instanceof HTMLElement) {
              const firstChild = previousSibling.childNodes[0] as HTMLElement;
              if (firstChild) {
                firstChild.style.fontSize = "2rem";
              }
              previousSibling.style.marginBottom = "125px";
            }

            scaleSvg(thisSvgElement, 2);
          } else {
            mosaicContainer.classList.remove(svgElement.layout);
            mosaicContainer.classList.add("default-layout");

            if (previousSibling && previousSibling instanceof HTMLElement) {
              const firstChild = previousSibling.childNodes[0] as HTMLElement;
              if (firstChild) {
                firstChild.style.fontSize = "14px";
              }
              previousSibling.style.marginBottom = "4px";
            }

            scaleSvg(thisSvgElement, 1);
          }
        });
      });
    }

    function scaleSvg(svgElement: HTMLElement, scaleFactor: number) {
      svgElement.style.transform = `scale(${scaleFactor})`;
      svgElement.style.transformOrigin = "center";
    }

    // --- CLEANUP ---
    return () => {
      hasInitialized.current = false;
    };
  }, [colors, colorAxis, arrowSize, svgWidth, margin, calculateImpedances, calculateSequenceImpedances, createInputFields]);

  // --- BUTTON HANDLERS ---
  const handleToggleInfo = () => {
    const content = document.getElementById("dynamic-tables-container");
    const icon = document.getElementById("showInfoIcon");
    if (content) content.classList.toggle("hidden");
    if (icon) {
      icon.classList.toggle("bx-info-circle");
      icon.classList.toggle("bx-hide");
    }
  };

  const handleToggleInput = () => {
    const inputContent = document.getElementById("table-input");
    if (inputContent) inputContent.classList.toggle("hidden");
  };

  const handleReset = () => {
    d3.selectAll("svg g").attr("transform", null);
    const dynamicTablesContainer = document.getElementById("dynamic-tables-container");
    const tableInput = document.getElementById("table-input");
    if (dynamicTablesContainer) {
      dynamicTablesContainer.classList.remove("hidden");
    }
    if (tableInput) {
      tableInput.classList.remove("hidden");
    }

    const mosaicContainer = document.getElementById("mosaic-container");
    if (mosaicContainer) {
      mosaicContainer.className = "lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr default-layout";
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto p-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Three-Phase Electrical System Visualization
          </h1>
          <p className="text-slate-500 mt-1">
            Interactive analysis of voltages, currents, and impedances in p.u.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setIsPolar(!isPolar)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            title="Toggle Polar/Cartesian"
          >
            {isPolar ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 12 L20 4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold">Z</text>
              </svg>
            )}
          </button>

          <button onClick={handleToggleInfo} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-700" title="Toggle Info">
            <i className="bx bx-info-circle text-xl" id="showInfoIcon" />
          </button>

          <button onClick={handleToggleInput} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-bold text-sm" title="Toggle Input/Output">
            I/V
          </button>

          <button onClick={handleReset} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold">
            Reset Layout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div id="info-panel" className="lg:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Electrical Quantities</h2>
            </div>
            <div id="general-insights" className="text-sm text-slate-600 mb-4 space-y-2">
              <p className="font-semibold text-slate-700">System Analysis Overview:</p>
              <p>This analysis provides a comprehensive overview of electrical quantities derived from currents and voltages.</p>
            </div>
            <div id="dynamic-tables-container" className="space-y-6 max-h-[60vh] overflow-y-auto pr-2" />
          </section>

          <section id="input-panel" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Inputs</h2>
            <div id="table-input">
              <div id="input-fields1" className="text-slate-400 text-sm italic">Impedance table</div>
              <div id="input-fields" className="text-slate-400 text-sm italic">Current and voltage inputs</div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div id="mosaic-container" className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {/* Cell 1: Main Visual */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-1">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Main Visual</span>
          </div>

          {/* Cell 2: Sequence Impedance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-2">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Sequence Impedance</span>
            <svg id="svgSequenceImpedance" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 3: Apparent Power */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-3">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Apparent Power</span>
            <svg id="apparentPower" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 4: Sequence Current/Voltage */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-4">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Seq. I & V</span>
            <svg id="svgSequenceCurrentAndVoltage" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 5: Zaids */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-5">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Zaids</span>
            <svg id="svgZaids" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 6: Admittance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-6">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Admittance</span>
            <svg id="admittance" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 7: Ph-Ph Voltage */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-7">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Ph-Ph Voltage</span>
            <svg id="svgPhasePhaseVoltage" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 8: Ph-Ph Current */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-8">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Ph-Ph Current</span>
            <svg id="svgPhasePhaseCurrent" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>

          {/* Cell 9: Ph-Ph Impedance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group" id="cell-9">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">Ph-Ph Impedance</span>
            <svg id="svgPhasePhaseImpedance" viewBox="0 0 250 250" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Custom Styles for Layout Classes */}
      <style jsx>{`
        .default-layout { }
        .custom-layout #cell-1 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutTopMiddle #cell-2 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutTopRight #cell-3 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutMiddleLeft #cell-4 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutMiddleMiddle #cell-5 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutMiddleRight #cell-6 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutBottomLeft #cell-7 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutBottomMiddle #cell-8 { grid-column: 1 / -1; grid-row: 1 / 3; }
        .custom-layoutBottomRight #cell-9 { grid-column: 1 / -1; grid-row: 1 / 3; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default Lab6;

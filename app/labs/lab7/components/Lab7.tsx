"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import * as katex from 'katex'
import '../style.css'

// Complex number type definition
interface Complex {
  re: number;
  im: number;
}

// Phase and sequence state interfaces
interface PhaseState {
  a: Complex;
  b: Complex;
  c: Complex;
}

interface SequenceState {
  v0: Complex;
  v1: Complex;
  v2: Complex;
}

// Input references interface
interface InputRefs {
  cart: {
    re: HTMLInputElement | null;
    im: HTMLInputElement | null;
  };
  polar: {
    mag: HTMLInputElement | null;
    ang: HTMLInputElement | null;
  };
}

export default function Lab7() {
  // State for mode (Cartesian vs Polar)
  const [isCartesian, setIsCartesian] = useState(true);
  const [numPhases, setNumPhases] = useState("3");

  // Refs for state management
  const [state, setState] = useState<{ phases: PhaseState; sequences: SequenceState }>({
    phases: {
      a: { re: 0, im: 0 },
      b: { re: 0, im: 0 },
      c: { re: 0, im: 0 },
    },
    sequences: {
      v0: { re: 0, im: 0 },
      v1: { re: 0, im: 0 },
      v2: { re: 0, im: 0 },
    },
  });

  const isSyncing = useRef(false);
  const visRef = useRef<SVGSVGElement | null>(null);
  const pointsRef = useRef<{ [key: string]: number[] }>({});

  // Input refs
  const phaseInputsRef = useRef<{
    a: InputRefs;
    b: InputRefs;
    c: InputRefs;
  } | null>(null);
  const sequenceInputsRef = useRef<{
    v0: InputRefs;
    v1: InputRefs;
    v2: InputRefs;
  } | null>(null);

  // Constants
  const SQRT3 = Math.sqrt(3);
  const alpha: Complex = { re: -0.5, im: SQRT3 / 2 };
  const alpha2: Complex = { re: -0.5, im: -SQRT3 / 2 };

  // Complex number utility functions
  const addComplex = useCallback((a: Complex, b: Complex): Complex => ({
    re: a.re + b.re,
    im: a.im + b.im,
  }), []);

  const mulComplex = useCallback((a: Complex, b: Complex): Complex => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }), []);

  const scaleComplex = useCallback((value: Complex, factor: number): Complex => ({
    re: value.re * factor,
    im: value.im * factor,
  }), []);

  const normalizeAngle = useCallback((angle: number): number => {
    if (!Number.isFinite(angle)) {
      return 0;
    }
    let normalized = ((angle + 180) % 360 + 360) % 360 - 180;
    if (normalized === -180) {
      normalized = 180;
    }
    return normalized;
  }, []);

  const toPolar = useCallback((value: Complex): { mag: number; ang: number } => {
    const mag = Math.hypot(value.re, value.im);
    const ang = normalizeAngle((Math.atan2(value.im, value.re) * 180) / Math.PI);
    return { mag, ang };
  }, [normalizeAngle]);

  const fromPolar = useCallback((mag: number, ang: number): Complex => {
    const radians = (ang * Math.PI) / 180;
    return { re: mag * Math.cos(radians), im: mag * Math.sin(radians) };
  }, []);

  const formatNumber = useCallback((value: number): string => {
    if (!Number.isFinite(value)) {
      return "";
    }
    const fixed = value.toFixed(2);
    const trimmed = fixed.replace(/\.?0+$/, "");
    return trimmed === "-0" ? "0" : trimmed;
  }, []);

  // Conversion functions
  const sequencesFromPhases = useCallback((phaseValues: PhaseState): SequenceState => {
    const va = phaseValues.a;
    const vb = phaseValues.b;
    const vc = phaseValues.c;
    const v1 = scaleComplex(
      addComplex(addComplex(va, mulComplex(alpha, vb)), mulComplex(alpha2, vc)),
      1 / 3
    );
    const v2 = scaleComplex(
      addComplex(addComplex(va, mulComplex(alpha2, vb)), mulComplex(alpha, vc)),
      1 / 3
    );
    return {
      v0: scaleComplex(addComplex(addComplex(va, vb), vc), 1 / 3),
      v1: v2,
      v2: v1,
    };
  }, [addComplex, mulComplex, scaleComplex, alpha, alpha2]);

  const phasesFromSequences = useCallback((sequenceValues: SequenceState): PhaseState => {
    const v0 = sequenceValues.v0;
    const v1 = sequenceValues.v2;
    const v2 = sequenceValues.v1;
    return {
      a: addComplex(addComplex(v0, v1), v2),
      b: addComplex(addComplex(v0, mulComplex(alpha2, v1)), mulComplex(alpha, v2)),
      c: addComplex(addComplex(v0, mulComplex(alpha, v1)), mulComplex(alpha2, v2)),
    };
  }, [addComplex, mulComplex, alpha, alpha2]);

  // Read complex value from inputs
  const readComplexFromInputs = useCallback((inputs: InputRefs, mode: string): Complex | null => {
    if (!inputs) return null;
    if (mode === "cartesian") {
      const re = parseFloat(inputs.cart.re?.value || "0");
      const im = parseFloat(inputs.cart.im?.value || "0");
      if (!Number.isFinite(re) || !Number.isFinite(im)) return null;
      return { re, im };
    }
    const mag = parseFloat(inputs.polar.mag?.value || "0");
    const ang = parseFloat(inputs.polar.ang?.value || "0");
    if (!Number.isFinite(mag) || !Number.isFinite(ang)) return null;
    return fromPolar(mag, ang);
  }, [fromPolar]);

  // Set input value
  const setInputValue = useCallback((input: HTMLInputElement | null, value: string): void => {
    if (input) {
      input.value = value;
    }
  }, []);

  // Render phase inputs
  const renderPhaseInputs = useCallback(() => {
    if (!phaseInputsRef.current) return;
    const phases = ["a", "b", "c"] as const;
    phases.forEach((phase) => {
      const inputs = phaseInputsRef.current?.[phase];
      if (!inputs) return;
      const value = state.phases[phase];
      setInputValue(inputs.cart.re, formatNumber(value.re));
      setInputValue(inputs.cart.im, formatNumber(value.im));
      const polar = toPolar(value);
      setInputValue(inputs.polar.mag, formatNumber(polar.mag));
      setInputValue(inputs.polar.ang, formatNumber(polar.ang));
    });
  }, [state.phases, setInputValue, formatNumber, toPolar]);

  // Render sequence inputs
  const renderSequenceInputs = useCallback(() => {
    if (!sequenceInputsRef.current) return;
    Object.entries(sequenceInputsRef.current).forEach(([key, inputs]) => {
      const value = state.sequences[key as keyof SequenceState];
      if (!inputs || !value) return;
      setInputValue(inputs.cart.re, formatNumber(value.re));
      setInputValue(inputs.cart.im, formatNumber(value.im));
      const polar = toPolar(value);
      setInputValue(inputs.polar.mag, formatNumber(polar.mag));
      setInputValue(inputs.polar.ang, formatNumber(polar.ang));
    });
  }, [state.sequences, setInputValue, formatNumber, toPolar]);

  // Render all inputs
  const renderAllInputs = useCallback(() => {
    renderPhaseInputs();
    renderSequenceInputs();
  }, [renderPhaseInputs, renderSequenceInputs]);

  // Sync from phases
  const syncFromPhases = useCallback((updateDiagram = true) => {
    setState((prev) => ({
      ...prev,
      sequences: sequencesFromPhases(prev.phases),
    }));
    renderAllInputs();
    // Declare updateVectors as optional global function
    const updateVectorsFunc = typeof window !== 'undefined' ? (window as unknown as { updateVectors?: () => void }).updateVectors : undefined;
    if (updateDiagram && typeof updateVectorsFunc === "function") {
      updateVectorsFunc();
    }
  }, [sequencesFromPhases, renderAllInputs]);

  // Sync from sequences
  const syncFromSequences = useCallback((updateDiagram = true) => {
    setState((prev) => ({
      ...prev,
      phases: phasesFromSequences(prev.sequences),
    }));
    renderAllInputs();
    // Declare updateVectors as optional global function
    const updateVectorsFunc = typeof window !== 'undefined' ? (window as unknown as { updateVectors?: () => void }).updateVectors : undefined;
    if (updateDiagram && typeof updateVectorsFunc === "function") {
      updateVectorsFunc();
    }
  }, [phasesFromSequences, renderAllInputs]);

  // Handle phase input
  const handlePhaseInput = useCallback((phase: "a" | "b" | "c") => {
    if (!phaseInputsRef.current) return;
    const inputs = phaseInputsRef.current[phase];
    if (!inputs) return;
    const mode = isCartesian ? "cartesian" : "polar";
    const value = readComplexFromInputs(inputs, mode);
    if (!value) return;
    setState((prev) => ({
      ...prev,
      phases: {
        ...prev.phases,
        [phase]: value,
      },
    }));
    syncFromPhases(true);
  }, [isCartesian, readComplexFromInputs, syncFromPhases]);

  // Handle sequence input
  const handleSequenceInput = useCallback((key: "v0" | "v1" | "v2") => {
    if (!sequenceInputsRef.current) return;
    const inputs = sequenceInputsRef.current[key];
    if (!inputs) return;
    const mode = isCartesian ? "cartesian" : "polar";
    const value = readComplexFromInputs(inputs, mode);
    if (!value) return;
    setState((prev) => ({
      ...prev,
      sequences: {
        ...prev.sequences,
        [key]: value,
      },
    }));
    syncFromSequences(true);
  }, [isCartesian, readComplexFromInputs, syncFromSequences]);

  // Toggle Cartesian/Polar mode
  const toggleCartesian = useCallback(() => {
    setIsCartesian((prev) => !prev);
  }, []);

  // Handle number of phases change
  const handlePhaseSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNumPhases(e.target.value);
  }, []);

  // Step input value
  const stepInputValue = useCallback((input: HTMLInputElement, direction: number) => {
    if (input.readOnly || input.disabled) return;
    if (!Number.isFinite(input.valueAsNumber)) {
      input.value = "0";
    }
    try {
      if (direction > 0) {
        input.stepUp();
      } else {
        input.stepDown();
      }
    } catch {
      const step = parseFloat(input.step);
      const stepSize = Number.isFinite(step) ? step : 1;
      const current = parseFloat(input.value);
      const base = Number.isFinite(current) ? current : 0;
      const stepText = String(stepSize);
      const precision = stepText.includes(".") ? stepText.split(".")[1].length : 0;
      const next = base + direction * stepSize;
      input.value = String(Number(next.toFixed(precision)));
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  // Handle wheel step
  const handleWheelStep = useCallback((event: WheelEvent) => {
    const input = event.target as HTMLInputElement;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.classList.contains("phasor-input")) return;
    if (document.activeElement !== input) return;
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    stepInputValue(input, direction);
  }, [stepInputValue]);

  // Handle arrow step
  const handleArrowStep = useCallback((event: KeyboardEvent) => {
    const input = event.target as HTMLInputElement;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type !== "number") return;
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

    const baseStep = parseFloat(input.step);
    const stepSize = Number.isFinite(baseStep) ? baseStep : 1;
    let multiplier = 1;
    if (event.ctrlKey) multiplier = 10;
    if (event.altKey) multiplier = 100;
    if (event.shiftKey) multiplier = 0.1;

    const direction = event.key === "ArrowUp" ? 1 : -1;
    const delta = stepSize * multiplier * direction;
    const current = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0;
    const next = current + delta;
    input.value = Number(next.toFixed(6)).toString();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    event.preventDefault();
  }, []);

  // Initialize input refs
  const initializeInputRefs = useCallback(() => {
    phaseInputsRef.current = {
      a: {
        cart: {
          re: document.getElementById("Va-real") as HTMLInputElement,
          im: document.getElementById("Va-imaginary") as HTMLInputElement,
        },
        polar: {
          mag: document.getElementById("Va-mag") as HTMLInputElement,
          ang: document.getElementById("Va-angle") as HTMLInputElement,
        },
      },
      b: {
        cart: {
          re: document.getElementById("Vb-real") as HTMLInputElement,
          im: document.getElementById("Vb-imaginary") as HTMLInputElement,
        },
        polar: {
          mag: document.getElementById("Vb-mag") as HTMLInputElement,
          ang: document.getElementById("Vb-angle") as HTMLInputElement,
        },
      },
      c: {
        cart: {
          re: document.getElementById("Vc-real") as HTMLInputElement,
          im: document.getElementById("Vc-imaginary") as HTMLInputElement,
        },
        polar: {
          mag: document.getElementById("Vc-mag") as HTMLInputElement,
          ang: document.getElementById("Vc-angle") as HTMLInputElement,
        },
      },
    };

    sequenceInputsRef.current = {
      v0: {
        cart: {
          re: document.getElementById("V0-real") as HTMLInputElement,
          im: document.getElementById("V0-imaginary") as HTMLInputElement,
        },
        polar: {
          mag: document.getElementById("V0-mag") as HTMLInputElement,
          ang: document.getElementById("V0-angle") as HTMLInputElement,
        },
      },
      v1: {
        cart: {
          re: document.getElementById("V1-real") as HTMLInputElement,
          im: document.getElementById("V1-imaginary") as HTMLInputElement,
        },
        polar: {
          mag: document.getElementById("V1-mag") as HTMLInputElement,
          ang: document.getElementById("V1-angle") as HTMLInputElement,
        },
      },
      v2: {
        cart: {
          re: document.getElementById("V2-real") as HTMLInputElement,
          im: document.getElementById("V2-imaginary") as HTMLInputElement,
        },
        polar: {
          mag: document.getElementById("V2-mag") as HTMLInputElement,
          ang: document.getElementById("V2-angle") as HTMLInputElement,
        },
      },
    };

    // Add event listeners to inputs
    const phases = ["a", "b", "c"] as const;
    phases.forEach((phase) => {
      const inputs = phaseInputsRef.current?.[phase];
      if (inputs) {
        inputs.cart.re?.addEventListener("input", () => handlePhaseInput(phase));
        inputs.cart.im?.addEventListener("input", () => handlePhaseInput(phase));
        inputs.polar.mag?.addEventListener("input", () => handlePhaseInput(phase));
        inputs.polar.ang?.addEventListener("input", () => handlePhaseInput(phase));
      }
    });

    Object.keys(sequenceInputsRef.current).forEach((key) => {
      const inputs = sequenceInputsRef.current?.[key as keyof typeof sequenceInputsRef.current];
      if (inputs) {
        inputs.cart.re?.addEventListener("input", () => handleSequenceInput(key as "v0" | "v1" | "v2"));
        inputs.cart.im?.addEventListener("input", () => handleSequenceInput(key as "v0" | "v1" | "v2"));
        inputs.polar.mag?.addEventListener("input", () => handleSequenceInput(key as "v0" | "v1" | "v2"));
        inputs.polar.ang?.addEventListener("input", () => handleSequenceInput(key as "v0" | "v1" | "v2"));
      }
    });

    // Add document-level event listeners
    document.addEventListener("wheel", handleWheelStep, { passive: false });
    document.addEventListener("keydown", handleArrowStep);
  }, [handlePhaseInput, handleSequenceInput, handleWheelStep, handleArrowStep]);

  // Initialize on mount
  useEffect(() => {
    console.log('[Lab7] Initializing visualization...');
    
    // Initialize D3 SVG and global variables FIRST before anything else
    const element_vis = document.getElementById("vis");
    if (!element_vis) {
      console.error('[Lab7] #vis element not found');
      return;
    }
    
    const styles = window.getComputedStyle(element_vis);
    const width_vis = parseFloat(styles.width) || 800;
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    const h = pageHeight;
    
    console.log('[Lab7] SVG dimensions:', { width_vis, h });
    
    // Create the main D3 SVG with ID #Containersvg
    const vis = d3.select("#vis")
      .append("svg")
      .attr("id", "Containersvg")
      .attr("width", width_vis)
      .attr("height", h);
    
    console.log('[Lab7] SVG created:', vis.node());
    
    const numPhases = 3; // Default to 3 phases
    
    // Set global variables that polyLineWithPoints.js expects
    (window as typeof window & { vis?: typeof vis; width_vis?: number; h?: number; numPhases?: number; toggleCartesianBtnStatus?: string; updateVectors?: () => void }).vis = vis;
    (window as typeof window & { width_vis?: number }).width_vis = width_vis;
    (window as typeof window & { h?: number }).h = h;
    (window as typeof window & { numPhases?: number }).numPhases = numPhases;
    (window as typeof window & { toggleCartesianBtnStatus?: string }).toggleCartesianBtnStatus = 'in Polar';
    (window as typeof window & { updateVectors?: () => void }).updateVectors = undefined;
    
    console.log('[Lab7] Global variables set');
    
    // Initialize input refs after setting global variables
    initializeInputRefs();
    console.log('[Lab7] Input refs initialized');
    
    // Dynamically import the visualization module first, then render inputs
    const loadVisualization = async () => {
      console.log('[Lab7] Loading visualization module...');
      try {
        const module = await import('../utils/polyLineWithPoints.js');
        console.log('[Lab7] Visualization module loaded:', module);
        console.log('[Lab7] updateVectors after load:', (window as typeof window & { updateVectors?: () => void }).updateVectors);
        
        // Check if circles were created
        const circles = d3.select("#Containersvg").selectAll("circle");
        console.log('[Lab7] Circles found:', circles.size());
        
        // Now that visualization is loaded, render inputs and sync
        renderAllInputs();
        console.log('[Lab7] Inputs rendered');
      } catch (error) {
        console.error('[Lab7] Failed to load visualization:', error);
        // Still render inputs even if visualization fails
        renderAllInputs();
      }
    };
    loadVisualization();
  }, [initializeInputRefs, renderAllInputs]);

  // Sync when mode changes
  useEffect(() => {
    renderAllInputs();
  }, [isCartesian, renderAllInputs]);

  return (
    <>
      <header className="py-4 bg-white shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700">
          Symmetrical Components
        </h1>
      </header>
      <main className="container mx-auto px-4 py-6">
        <nav className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <section
            id="phase-select"
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md"
          >
            <label
              htmlFor="numPhases"
              className="text-sm font-semibold text-gray-700"
            >
              Number of Phases:
            </label>
            <select
              id="numPhases"
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={numPhases}
              onChange={handlePhaseSelectChange}
            >
              <option value="3">3</option>
              <option value="6">6</option>
            </select>
          </section>
          <section>
            <button
              id="toggleCartesianBtn"
              className="toggle-btn px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
              onClick={toggleCartesian}
            >
              {isCartesian ? "in Polar" : "in Cartesian"}
            </button>
          </section>
          <section>
            <button
              id="triggerButton"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
            >
              trig Animation
            </button>
          </section>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section
            className="bg-white p-4 rounded-xl shadow-lg"
            id="phasorControls"
            aria-label="Phasor inputs"
          >
            <div className="space-y-2">
              <div className="grid grid-cols-[50px_1fr] items-end gap-2">
                <span></span>
                <div className="grid grid-cols-2 gap-2 justify-items-center">
                  <span
                    className="text-xs font-semibold text-gray-600"
                    id="phasorHeaderPrimary"
                  >
                    {isCartesian ? "R" : "Magnitude"}
                  </span>
                  <span
                    className="text-xs font-semibold text-gray-600"
                    id="phasorHeaderSecondary"
                  >
                    {isCartesian ? "X" : "Angle (deg)"}
                  </span>
                </div>
              </div>
              {["a", "b", "c"].map((phase) => (
                <div
                  key={phase}
                  className="grid grid-cols-[50px_1fr] items-center gap-2"
                  data-phase={phase}
                >
                  <span className="text-sm font-bold text-gray-700">
                    V{phase}
                  </span>
                  <div
                    className={`phasor-fields phasor-${
                      isCartesian ? "cartesian" : "polar"
                    } grid grid-cols-2 gap-2`}
                  >
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${phase}-real`}
                      type="number"
                      step="0.1"
                      aria-label={`V${phase} R`}
                    />
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${phase}-imaginary`}
                      type="number"
                      step="0.1"
                      aria-label={`V${phase} X`}
                    />
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${phase}-mag`}
                      type="number"
                      step="0.1"
                      aria-label={`V${phase} magnitude`}
                    />
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${phase}-angle`}
                      type="number"
                      step="0.1"
                      aria-label={`V${phase} angle`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section
            className="bg-white p-4 rounded-xl shadow-lg sequence-controls"
            id="sequenceControls"
            aria-label="Symmetrical component inputs"
          >
            <div className="space-y-2">
              <div className="grid grid-cols-[50px_1fr] items-end gap-2">
                <span></span>
                <div className="grid grid-cols-2 gap-2 justify-items-center">
                  <span
                    className="text-xs font-semibold text-gray-600"
                    id="sequenceHeaderPrimary"
                  >
                    {isCartesian ? "R" : "Magnitude"}
                  </span>
                  <span
                    className="text-xs font-semibold text-gray-600"
                    id="sequenceHeaderSecondary"
                  >
                    {isCartesian ? "X" : "Angle (deg)"}
                  </span>
                </div>
              </div>
              {["1", "2", "0"].map((seq, idx) => (
                <div
                  key={seq}
                  className="grid grid-cols-[50px_1fr] items-center gap-2"
                  data-sequence={seq}
                >
                  <span className="text-sm font-bold text-gray-700">
                    V{seq}
                  </span>
                  <div
                    className={`phasor-fields phasor-${
                      isCartesian ? "cartesian" : "polar"
                    } grid grid-cols-2 gap-2`}
                  >
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${seq}-real`}
                      type="number"
                      step="0.1"
                      aria-label={`V${seq} R`}
                    />
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${seq}-imaginary`}
                      type="number"
                      step="0.1"
                      aria-label={`V${seq} X`}
                    />
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${seq}-mag`}
                      type="number"
                      step="0.1"
                      aria-label={`V${seq} magnitude`}
                    />
                    <input
                      className="phasor-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id={`V${seq}-angle`}
                      type="number"
                      step="0.1"
                      aria-label={`V${seq} angle`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <figure className="mt-6" id="vis"></figure>
      </main>
    </>
  );
}

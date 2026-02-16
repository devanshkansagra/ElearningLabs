// Type definitions for polyLineWithPoints.js
// Note: The original polyLineWithPoints.js is obfuscated, so this file provides
// TypeScript type declarations for the exported functionality.
// The runtime logic remains in polyLineWithPoints.js

import * as d3 from "d3";

export interface VectorPoint {
    x: number;
    y: number;
}

export interface DataRef {
    [key: string]: unknown;
}

export interface RenderOptions {
    isSequence?: boolean;
    scale?: number;
}

// Re-export types from other modules
export { createMarkers, renderVectors, translateVectors } from "./helpers";
export { symbols } from "./symbols";
export { equationsDisplayed } from "./illustrativeKaTexEquations";
export { createMatrix } from "./createMatrix";
export { multiplyMatrices } from "./ComplexOperatorAid";

// Global variables that are set by the JS runtime
declare global {
    // Phase vectors
    var va: number[];
    var vb: number[];
    var vc: number[];
    var vd: number[];
    var ve: number[];
    var vf: number[];

    // Phase vectors origin points
    var psa: number[];
    var psb: number[];
    var psc: number[];
    var psd: number[];
    var pse: number[];
    var psf: number[];

    // Sequence vectors
    var vec0: number[];
    var vec1: number[];
    var vec2: number[];
    var vec3: number[];
    var vec4: number[];
    var vec5: number[];

    // Sequence origin points
    var ps0: number[];
    var ps1: number[];
    var ps2: number[];
    var ps3: number[];
    var ps4: number[];
    var ps5: number[];

    // Global data reference
    var dataRef: DataRef[];

    // Width and height
    var width_vis: number;
    var h: number;
}

/**
 * Main function to create vector inputs and visualization
 * @param svg - The SVG container (from d3 selection)
 * @param numPhases - Number of phases (3 or 6)
 */
export function VectorInputs(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    numPhases: number
): void {
    // This function is implemented in polyLineWithPoints.js
    // Types are declared here for TypeScript support
    
}

/**
 * Initialize the visualization with drag functionality
 */
export function M(): void {
    // This function is implemented in polyLineWithPoints.js
}

/**
 * Update vectors based on current state
 */
export function updateVectors(): void {
    // This function is implemented in polyLineWithPoints.js
}

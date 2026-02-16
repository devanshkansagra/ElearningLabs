// Index utility file for Lab9
// @ts-ignore
import * as C_ from "../js/ComplexOperatorAid.mjs";
// @ts-ignore
import * as M_ from "./AddMarkers.mjs";
// @ts-ignore
import * as G_ from "./MainSVG.mjs";
// @ts-ignore
import * as I_ from "./Inputs.mjs";
// @ts-ignore
import * as CL_ from "./checkboxListeners.mjs";

// @ts-ignore
import { ThreePhaseFault } from './3PhFault_at_F.mjs';
// @ts-ignore
import { Ph_Ph } from "./2PhFault_at_F.mjs";
// @ts-ignore
import { Ph_G } from "./1PhFault_at_F.mjs";

// Re-export all imported modules
export { C_ as ComplexOperatorAid };
export { M_ as AddMarkers };
export { G_ as MainSVG };
export { I_ as Inputs };
export { CL_ as CheckboxListeners };

export { ThreePhaseFault };
export { Ph_Ph };
export { Ph_G };

// Type definitions for vectors and data
export interface VectorData {
    [key: string]: {
        x: number;
        y: number;
    };
}

export interface Complex {
    x: number;
    y: number;
}

export interface InputField {
    key: string;
    value: Complex;
}

export interface ColorMap {
    [key: string]: string;
}

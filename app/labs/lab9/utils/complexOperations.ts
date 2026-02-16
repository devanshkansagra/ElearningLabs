import { Complex } from "./types";
export type { Complex };

// Complex number operations
export function complexAdd(a: Complex, b: Complex): Complex {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function complexSub(a: Complex, b: Complex): Complex {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function complexMultiplication(a: Complex, b: Complex): Complex {
  return { x: a.x * b.x - a.y * b.y, y: a.x * b.y + a.y * b.x };
}

export function complexMultiplication3(
  a: Complex,
  b: Complex,
  c: Complex,
): Complex {
  const ab = complexMultiplication(a, b);
  return complexMultiplication(ab, c);
}

export function complexAdd3(a: Complex, b: Complex, c: Complex): Complex {
  const ab = complexAdd(a, b);
  return complexAdd(ab, c);
}

export function complexAdd4(
  a: Complex,
  b: Complex,
  c: Complex,
  d: Complex,
): Complex {
  const ab = complexAdd(a, b);
  const abc = complexAdd(ab, c);
  return complexAdd(abc, d);
}

export function complexDivision(a: Complex, b: Complex): Complex {
  const denominator = b.x * b.x + b.y * b.y;
  return {
    x: (a.x * b.x + a.y * b.y) / denominator,
    y: (a.y * b.x - a.x * b.y) / denominator,
  };
}

// Convert to polar
export function convertToPolar(
  z: Complex,
  inDegrees: boolean = false,
): { magnitude: number; angle: number } {
  const magnitude = Math.sqrt(z.x * z.x + z.y * z.y);
  const angle = inDegrees
    ? (Math.atan2(z.y, z.x) * 180) / Math.PI
    : Math.atan2(z.y, z.x);
  return { magnitude, angle };
}

// Convert to cartesian
export function convertToCartesian(
  magnitude: number,
  angle: number,
  inDegrees: boolean = false,
): Complex {
  const rad = inDegrees ? (angle * Math.PI) / 180 : angle;
  return { x: magnitude * Math.cos(rad), y: magnitude * Math.sin(rad) };
}

// Sequence operators
export const a: Complex = { x: -0.5, y: Math.sqrt(3) / 2 };
export const a2: Complex = { x: -0.5, y: -Math.sqrt(3) / 2 };
export const _a: Complex = { x: -0.5, y: -Math.sqrt(3) / 2 };
export const _a2: Complex = { x: -0.5, y: Math.sqrt(3) / 2 };
export const I: Complex = { x: 1, y: 0 };
export const _I: Complex = { x: -1, y: 0 };
export const O: Complex = { x: 0, y: 0 };

// Derived operators
export const a_a2: Complex = complexSub(a, a2);
export const a2_a: Complex = complexSub(a2, a);
export const a_I: Complex = complexAdd(a, I);
export const I_a: Complex = complexAdd(I, a);
export const I_a2: Complex = complexAdd(I, a2);
export const a2_I: Complex = complexAdd(a2, I);
export const _a_I: Complex = complexAdd(_a, I);

// Rotation factors for sequence transformation
export const PI_to_Y: Complex = { x: 1 / 3, y: 0 };
export const d0: Complex = { x: 1, y: 0 };
export const d1: Complex = { x: 1, y: 0 };
export const d2: Complex = { x: 1, y: 0 };
export const _d0: Complex = { x: 1, y: 0 };
export const _d1: Complex = { x: 1, y: 0 };
export const _d2: Complex = { x: 1, y: 0 };

// Sequence transformation 012 to ABC
export function Seq_012(
  seq0: Complex,
  seq1: Complex,
  seq2: Complex,
): { A: Complex; B: Complex; C: Complex } {
  const A = complexAdd3(seq0, seq1, seq2);
  const B = complexAdd3(
    seq0,
    complexMultiplication(a2, seq1),
    complexMultiplication(a, seq2),
  );
  const C = complexAdd3(
    seq0,
    complexMultiplication(a, seq1),
    complexMultiplication(a2, seq2),
  );
  return { A, B, C };
}

/**
 * Symmetrical component transformation matrices and utilities.
 * Shared across Lab3 components for converting between ABC and 012 domains.
 */

// Complex number utilities
const Complex = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  mul: (a, b) => [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0],
  ],
};

// Scalar multiplication for complex numbers
function Zmulscal(s, z) {
  return [s * z[0], s * z[1]];
}

// Base phasors for symmetrical component transformation
const one = [1, 0];

/**
 * Complex operator 'a' = 1∠120° = -1/2 + j√3/2
 * Used in symmetrical component transformations
 */
export const a = [-1 / 2, Math.sqrt(3) / 2];

/**
 * Complex operator 'a²' = 1∠240° = -1/2 - j√3/2
 * Used in symmetrical component transformations
 */
export const a2 = [-1 / 2, -Math.sqrt(3) / 2];

/**
 * Forward transformation matrix (012 -> ABC)
 * Converts symmetrical components to phase quantities
 */
export const m = [
  [one, one, one],
  [one, a2, a],
  [one, a, a2],
];

/**
 * Alternative transformation matrix
 */
export const m_ = [
  [one, one, one],
  [one, a, a2],
  [one, a2, a],
];

/**
 * Inverse transformation matrix (ABC -> 012)
 * Converts phase quantities to symmetrical components
 */
export const m_inv = [
  [Zmulscal(1 / 3, one), Zmulscal(1 / 3, one), Zmulscal(1 / 3, one)],
  [Zmulscal(1 / 3, one), Zmulscal(1 / 3, a), Zmulscal(1 / 3, a2)],
  [Zmulscal(1 / 3, one), Zmulscal(1 / 3, a2), Zmulscal(1 / 3, a)],
];

/**
 * Matrix-vector multiplication for complex vectors
 * @param matrix - 3x3 complex matrix
 * @param v - complex vector of length 3
 * @returns resulting complex vector
 */
export function M_V(matrix, v) {
  return matrix.map((row) =>
    row
      .map((coef, i) => Complex.mul(coef, v[i]))
      .reduce((a, b) => Complex.add(a, b), [0, 0]),
  );
}

/**
 * Alternative matrix-vector multiplication with 1/3 scaling
 */
export function M_V_(matrix, v) {
  return matrix.map((row) =>
    Complex.mul(
      [1 / 3, 0],
      row
        .map((coef, i) => Complex.mul(coef, v[i]))
        .reduce((a, b) => Complex.add(a, b), [0, 0]),
    ),
  );
}

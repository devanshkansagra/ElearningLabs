export interface ComplexNumber {
  x: number;
  y: number;
}

// Helper function for complex multiplication
function _complexMultiplication(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const real = a.x * b.x - a.y * b.y;
  const imaginary = a.x * b.y + a.y * b.x;
  return { x: real, y: imaginary };
}

// Helper function for complex addition
function _complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const real = a.x + b.x;
  const imaginary = a.y + b.y;
  return { x: real, y: imaginary };
}

// Define constants first
export const _I: ComplexNumber = { x: -1, y: 0 };
export const I: ComplexNumber = { x: 1, y: 0 };
export const II: ComplexNumber = { x: 2, y: 0 };
export const III: ComplexNumber = { x: 3, y: 0 };
export const I_3: ComplexNumber = { x: 1 / 3, y: 0 };
export const O: ComplexNumber = { x: 0, y: 0 };
export const a: ComplexNumber = { x: -0.5, y: Math.sqrt(3) / 2 };
export const _a: ComplexNumber = { x: 0.5, y: -Math.sqrt(3) / 2 };

// Now define derived constants
export const a2 = _complexMultiplication(a, a);
export const _a2 = _complexMultiplication(_I, a2);
export const a_3 = _complexMultiplication(I_3, a);
export const a2_3 = _complexMultiplication(I_3, a2);
export const a_a2 = _complexAdd(a, _a2);
export const a2_a = _complexAdd(a2, _a);
export const a_I = _complexAdd(a, _I);
export const I_a2 = _complexAdd(I, _a2);
export const I_a = _complexAdd(I, _a);
export const a2_I = _complexAdd(a2, _I);
export const d0 = _complexAdd(I, _a2);
export const d1 = _complexAdd(a, _I);
export const d2 = _complexAdd(a2, _a);
export const _d0 = _complexAdd(_I, a2);
export const _d1 = _complexAdd(_a, I);
export const _d2 = _complexAdd(_a2, a);

export function objectToArrayFormatted(obj: ComplexNumber): [number, number] {
  return [obj.x, obj.y];
}

export function complexMultiplication(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  const real = aObj.x * bObj.x - aObj.y * bObj.y;
  const imaginary = aObj.x * bObj.y + aObj.y * bObj.x;
  return { x: real, y: imaginary };
}

function complexMultiplicationArrays(a: number[], b: number[]): [number, number] {
  return [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0]
  ];
}

export function complexAdd(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  const real = aObj.x + bObj.x;
  const imaginary = aObj.y + bObj.y;
  return { x: real, y: imaginary };
}

export function makeArray(variable: ComplexNumber | number[]): number[] | ComplexNumber {
  if (typeof variable === 'object' && variable !== null && !Array.isArray(variable)) {
    return objectToArrayFormatted(variable);
  } else {
    return variable;
  }
}

export function allToArray(a: (number[] | ComplexNumber)[]): (number[] | ComplexNumber)[] {
  a.forEach((element, index, arr) => {
    arr[index] = makeArray(element);
  });
  return a;
}

function arrayToObjectFormatted(array: number[]): ComplexNumber {
  return { x: array[0], y: array[1] };
}

export function makeObj(variable: number[] | ComplexNumber | unknown): ComplexNumber | number[] {
  if (Array.isArray(variable)) {
    return arrayToObjectFormatted(variable);
  } else if (typeof variable === 'object' && variable !== null) {
    return variable as ComplexNumber;
  } else {
    return variable as number[];
  }
}

export function allToObj(a: (number[] | ComplexNumber)[]): ComplexNumber[] {
  a.forEach((element, index, arr) => {
    arr[index] = makeObj(element) as ComplexNumber;
  });
  return a as ComplexNumber[];
}

export function createObjectFromVector(vector: [number, number]): ComplexNumber {
  const [x, y] = vector;
  return { x, y };
}

export function setVectors(p: ComplexNumber, mag: number): [number, number][] {
  return [
    [p.x + mag, p.y],
    [p.x - mag / 2, p.y - (mag * Math.sqrt(3) / 2)],
    [p.x - mag / 2, p.y + (mag * Math.sqrt(3) / 2)],
    [p.x, p.y]
  ];
}

export function convertToPolar(a: ComplexNumber, isPolar: boolean): { magnitude: number; angle: number } | ComplexNumber {
  if (isPolar) {
    const r = Math.sqrt(a.x * a.x + a.y * a.y);
    const θ = Math.atan2(a.y, a.x);
    return {
      magnitude: r,
      angle: (θ * 180) / Math.PI
    };
  } else {
    return {
      x: a.x,
      y: a.y
    };
  }
}

export function convertToCartesian(r: number, θ: number, isCartesian: boolean): ComplexNumber | { magnitude: number; angle: number } {
  if (isCartesian) {
    const a = r * Math.cos(θ / 180);
    const b = r * Math.sin(θ / 180);
    return {
      x: a,
      y: b
    };
  } else {
    return {
      magnitude: r,
      angle: θ
    };
  }
}

export function complexDivision(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  const denominator = bObj.x * bObj.x + bObj.y * bObj.y;

  if (denominator === 0) {
    return { x: NaN, y: NaN };
  }

  const real = (aObj.x * bObj.x + aObj.y * bObj.y) / denominator;
  const imaginary = (aObj.y * bObj.x - aObj.x * bObj.y) / denominator;

  return { x: real, y: imaginary };
}

export function complexInverse(b: ComplexNumber | number[]): ComplexNumber {
  let bObj: ComplexNumber;
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  const denominator = bObj.x * bObj.x + bObj.y * bObj.y;

  if (denominator === 0) {
    return { x: NaN, y: NaN };
  }

  const real = bObj.x / denominator;
  const imaginary = -bObj.y / denominator;

  return { x: real, y: imaginary };
}

export function complexAbs(b: ComplexNumber | number[]): number {
  let bObj: ComplexNumber;
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  const nominator = bObj.x * bObj.x + bObj.y * bObj.y;

  return Math.sqrt(nominator);
}

export function complexMultiplication3(a: ComplexNumber | number[], b: ComplexNumber | number[], c: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  let cObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  if (Array.isArray(c)) {
    cObj = { x: c[0], y: c[1] };
  } else {
    cObj = c;
  }
  
  const real_aux = aObj.x * bObj.x - aObj.y * bObj.y;
  const imaginary_aux = aObj.y * bObj.x + aObj.x * bObj.y;
  const real = real_aux * cObj.x - imaginary_aux * cObj.y;
  const imaginary = imaginary_aux * cObj.x + real_aux * cObj.y;

  return { x: real, y: imaginary };
}

export function complexSub(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  const real = aObj.x - bObj.x;
  const imaginary = aObj.y - bObj.y;

  return { x: real, y: imaginary };
}

export function complexAdd3(a: ComplexNumber | number[], b: ComplexNumber | number[], c: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  let cObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  if (Array.isArray(c)) {
    cObj = { x: c[0], y: c[1] };
  } else {
    cObj = c;
  }
  
  const real = aObj.x + bObj.x + cObj.x;
  const imaginary = aObj.y + bObj.y + cObj.y;

  return { x: real, y: imaginary };
}

export function complexAdd4(a: ComplexNumber | number[], b: ComplexNumber | number[], c: ComplexNumber | number[], d: ComplexNumber | number[]): ComplexNumber {
  let aObj: ComplexNumber;
  let bObj: ComplexNumber;
  let cObj: ComplexNumber;
  let dObj: ComplexNumber;
  
  if (Array.isArray(a)) {
    aObj = { x: a[0], y: a[1] };
  } else {
    aObj = a;
  }
  
  if (Array.isArray(b)) {
    bObj = { x: b[0], y: b[1] };
  } else {
    bObj = b;
  }
  
  if (Array.isArray(c)) {
    cObj = { x: c[0], y: c[1] };
  } else {
    cObj = c;
  }
  
  if (Array.isArray(d)) {
    dObj = { x: d[0], y: d[1] };
  } else {
    dObj = d;
  }
  
  const real = aObj.x + bObj.x + cObj.x + dObj.x;
  const imaginary = aObj.y + bObj.y + cObj.y + dObj.y;

  return { x: real, y: imaginary };
}

export function multiplyMatrices(matrix1: number[][][], matrix2: number[][][]): number[][][] {
  const rows1 = matrix1.length;
  const cols1 = matrix1[0].length;
  const rows2 = matrix2.length;
  const cols2 = matrix2[0].length;

  if (cols1 !== rows2) {
    throw new Error("Invalid dimensions for matrix multiplication.");
  }

  const result: number[][][] = Array.from({ length: rows1 }, () =>
    Array.from({ length: cols2 }, () => [0, 0] as [number, number])
  );

  for (let i = 0; i < rows1; i++) {
    for (let j = 0; j < cols2; j++) {
      let sum: [number, number] = [0, 0];
      for (let k = 0; k < cols1; k++) {
        const product = complexMultiplicationArrays(matrix1[i][k], matrix2[k][j]);
        sum[0] += product[0];
        sum[1] += product[1];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

export const matrix_abcTo123: ComplexNumber[][] = [
  [I_3, I_3, I_3],
  [I_3, a_3, a2_3],
  [I_3, a2_3, a_3]
];

export function inverseMatrix(matrix: number[][]): number[][] {
  const det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[2][0] * matrix[1][2]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]);
  const invDet = 1 / det;

  const result: number[][] = [];
  result[0] = [
    (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invDet,
    (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invDet,
    (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invDet
  ];
  result[1] = [
    (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invDet,
    (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invDet,
    (matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]) * invDet
  ];
  result[2] = [
    (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invDet,
    (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invDet,
    (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invDet
  ];

  return result;
}

export function PI_to_Y(Z_S: ComplexNumber, Z_E: ComplexNumber, Z_U: ComplexNumber): { Zl: ComplexNumber; Zj: ComplexNumber; Zk: ComplexNumber } {
  const Zl = complexDivision(complexMultiplication(Z_U, Z_S), complexAdd3(Z_S, Z_E, Z_U));
  const Zj = complexDivision(complexMultiplication(Z_S, Z_E), complexAdd3(Z_S, Z_E, Z_U));
  const Zk = complexDivision(complexMultiplication(Z_E, Z_U), complexAdd3(Z_S, Z_E, Z_U));
  return { Zl, Zj, Zk };
}

export function Seq_012(v: { ZA: ComplexNumber; ZB: ComplexNumber; ZC: ComplexNumber }): { Z0: ComplexNumber; Z1: ComplexNumber; Z2: ComplexNumber } {
  const Z0 = complexDivision(complexAdd3(v.ZA, v.ZB, v.ZC), III);
  const Z1 = complexDivision(complexAdd3(v.ZA, complexMultiplication(v.ZB, a), complexMultiplication(v.ZC, a2)), III);
  const Z2 = complexDivision(complexAdd3(v.ZA, complexMultiplication(v.ZB, a2), complexMultiplication(v.ZC, a)), III);
  return { Z0, Z1, Z2 };
}

// Complex number interface
export interface Complex {
    x: number;
    y: number;
}

// Type for complex number or array representation
export type ComplexInput = Complex | [number, number] | number;

// Helper function to convert any input to Complex
function toComplex(val: ComplexInput): Complex {
    if (typeof val === 'number') {
        return { x: val, y: 0 };
    }
    if (Array.isArray(val)) {
        return { x: val[0], y: val[1] };
    }
    return val;
}

// Exported constants
export const _I: Complex = { x: -1, y: 0 };
export const I: Complex = { x: 1, y: 0 };
export const II: Complex = { x: 2, y: 0 };
export const III: Complex = { x: 3, y: 0 };
export const I_3: Complex = { x: 1 / 3, y: 0 };
export const O: Complex = { x: 0, y: 0 };
export const a: Complex = { x: -0.5, y: Math.sqrt(3) / 2 };
export const a2: Complex = complexMultiplication(a, a);
export const a_3: Complex = complexMultiplication(I_3, a);
export const a2_3: Complex = complexMultiplication(I_3, a2);
export const _a: Complex = { x: 0.5, y: -Math.sqrt(3) / 2 };
export const _a2: Complex = complexMultiplication(_I, a2);
export const a_a2: Complex = complexAdd(a, _a2);
export const a2_a: Complex = complexAdd(a2, _a);
export const a_I: Complex = complexAdd(a, _I);
export const I_a2: Complex = complexAdd(I, _a2);
export const I_a: Complex = complexAdd(I, _a);
export const a2_I: Complex = complexAdd(a2, _I);
export const d0: Complex = complexAdd(I, _a2);
export const d1: Complex = complexAdd(a, _I);
export const d2: Complex = complexAdd(a2, _a);
export const _d0: Complex = complexAdd(_I, a2);
export const _d1: Complex = complexAdd(_a, I);
export const _d2: Complex = complexAdd(_a2, a);

export function objectToArrayFormatted(obj: Complex): [number, number] {
    return [obj.x, obj.y];
}

export function complexMultiplication(a: ComplexInput, b: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const real = aObj.x * bObj.x - aObj.y * bObj.y;
    const imaginary = aObj.x * bObj.y + aObj.y * bObj.x;
    return { x: real, y: imaginary };
}

function complexMultiplicationArrays(a: [number, number], b: [number, number]): [number, number] {
    // For [x1, y1] * [x2, y2]
    return [
        a[0] * b[0] - a[1] * b[1],  // x component
        a[0] * b[1] + a[1] * b[0]   // y component
    ];
}

export function complexAdd(a: ComplexInput, b: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const real = aObj.x + bObj.x;
    const imaginary = aObj.y + bObj.y;
    return { x: real, y: imaginary };
}

export function makeArray(variable: ComplexInput): [number, number] {
    if (typeof variable === 'number') {
        return [variable, 0];
    }
    if (Array.isArray(variable)) {
        return variable;
    }
    return objectToArrayFormatted(variable);
}

export function allToArray(a: ComplexInput[]): [number, number][] {
    return a.map(makeArray);
}

export function arrayToObjectFormatted(array: [number, number]): Complex {
    return { x: array[0], y: array[1] };
}

export function makeObj(variable: ComplexInput): Complex {
    if (typeof variable === 'number') {
        return { x: variable, y: 0 };
    }
    if (Array.isArray(variable)) {
        return arrayToObjectFormatted(variable);
    }
    return variable;
}

export function allToObj(a: ComplexInput[]): Complex[] {
    return a.map(makeObj);
}

export function createObjectFromVector(vector: [number, number]): Complex {
    const [x, y] = vector;
    return { x, y };
}

export function setVectors(p: Complex, mag: number): [number, number][] {
    return [
        [p.x + mag, p.y],
        [p.x - mag / 2, p.y - (mag * Math.sqrt(3) / 2)],
        [p.x - mag / 2, p.y + (mag * Math.sqrt(3) / 2)],
        [p.x, p.y]
    ];
}

export function convertToPolar(a: Complex, isPolar: boolean): { magnitude: number; angle: number } | Complex {
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

export function convertToCartesian(r: number, θ: number, isCartesian: boolean): { magnitude: number; angle: number } | Complex {
    if (isCartesian) {
        const a_val = r * Math.cos(θ / 180);
        const b = r * Math.sin(θ / 180);
        return {
            x: a_val,
            y: b
        };
    } else {
        return {
            magnitude: r,
            angle: θ
        };
    }
}

// Complex division function
export function complexDivision(a: ComplexInput, b: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const denominator = bObj.x * bObj.x + bObj.y * bObj.y;

    if (denominator === 0) {
        return { x: NaN, y: NaN };
    }

    const real = (aObj.x * bObj.x + aObj.y * bObj.y) / denominator;
    const imaginary = (aObj.y * bObj.x - aObj.x * bObj.y) / denominator;

    return { x: real, y: imaginary };
}

// Complex inverse function
export function complexInverse(b: ComplexInput): Complex {
    const bObj = toComplex(b);
    const denominator = bObj.x * bObj.x + bObj.y * bObj.y;

    if (denominator === 0) {
        return { x: NaN, y: NaN };
    }

    const real = (bObj.x) / denominator;
    const imaginary = (-bObj.y) / denominator;

    return { x: real, y: imaginary };
}

export function complexAbs(b: ComplexInput): number {
    const bObj = toComplex(b);
    const nominator = bObj.x * bObj.x + bObj.y * bObj.y;

    return Math.sqrt(nominator);
}

// Complex multiplication3 function
export function complexMultiplication3(a: ComplexInput, b: ComplexInput, c: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const cObj = toComplex(c);
    const real_aux = aObj.x * bObj.x - aObj.y * bObj.y;
    const imaginary_aux = aObj.y * bObj.x + aObj.x * bObj.y;
    const real = real_aux * cObj.x - imaginary_aux * cObj.y;
    const imaginary = imaginary_aux * cObj.x + real_aux * cObj.y;

    return { x: real, y: imaginary };
}

// Complex subtract function
export function complexSub(a: ComplexInput, b: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const real = aObj.x - bObj.x;
    const imaginary = aObj.y - bObj.y;

    return { x: real, y: imaginary };
}

export function complexAdd3(a: ComplexInput, b: ComplexInput, c: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const cObj = toComplex(c);
    const real = aObj.x + bObj.x + cObj.x;
    const imaginary = aObj.y + bObj.y + cObj.y;

    return { x: real, y: imaginary };
}

export function complexAdd4(a: ComplexInput, b: ComplexInput, c: ComplexInput, d: ComplexInput): Complex {
    const aObj = toComplex(a);
    const bObj = toComplex(b);
    const cObj = toComplex(c);
    const dObj = toComplex(d);
    const real = aObj.x + bObj.x + cObj.x + dObj.x;
    const imaginary = aObj.y + bObj.y + cObj.y + dObj.y;

    return { x: real, y: imaginary };
}

export function multiplyMatrices(
    matrix1: ComplexInput[][],
    matrix2: ComplexInput[][]
): [number, number][][] {
    // Standard dimension check: # of cols in matrix1 = # of rows in matrix2
    if (matrix1[0].length !== matrix2.length) {
        throw new Error("Invalid dimensions for matrix multiplication.");
    }

    const rows1 = matrix1.length;
    const cols1 = matrix1[0].length;
    const rows2 = matrix2.length;
    const cols2 = matrix2[0].length;

    // Create an N×1 result
    const result: [number, number][][] = Array.from({ length: rows1 }, () =>
        new Array(cols2).fill(null)
    );

    for (let i = 0; i < rows1; i++) {
        for (let j = 0; j < cols2; j++) {
            let sum: [number, number] = [0, 0]; // complex sum [real, imag]
            for (let k = 0; k < cols1; k++) {
                const product = complexMultiplicationArrays(
                    makeArray(matrix1[i][k]),
                    makeArray(matrix2[k][j])
                );
                sum[0] += product[0];
                sum[1] += product[1];
            }
            result[i][j] = sum;
        }
    }

    return result;
}

export const matrix_abcTo123: Complex[][] = [
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
        (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invDet
    ];
    result[2] = [
        (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invDet,
        (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invDet,
        (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invDet
    ];

    return result;
}

export interface PItoYParams {
    Z_S: Complex;
    Z_E: Complex;
    Z_U: Complex;
}

export function PI_to_Y(params: PItoYParams): { Zl: Complex; Zj: Complex; Zk: Complex } {
    const { Z_S, Z_E, Z_U } = params;
    const Zl = complexDivision(complexMultiplication(Z_U, Z_S), complexAdd3(Z_S, Z_E, Z_U));
    const Zj = complexDivision(complexMultiplication(Z_S, Z_E), complexAdd3(Z_S, Z_E, Z_U));
    const Zk = complexDivision(complexMultiplication(Z_E, Z_U), complexAdd3(Z_S, Z_E, Z_U));
    return { Zl, Zj, Zk };
}

export interface Seq012Params {
    ZA: Complex;
    ZB: Complex;
    ZC: Complex;
}

export function Seq_012(v: Seq012Params): { Z0: Complex; Z1: Complex; Z2: Complex } {
    const z = {
        Z0: {
            x: complexDivision(complexAdd3(v.ZA, v.ZB, v.ZC), III).x,
            y: complexDivision(complexAdd3(v.ZA, v.ZB, v.ZC), III).y
        },
        Z1: {
            x: complexDivision(complexAdd3(v.ZA, complexMultiplication(v.ZB, a), complexMultiplication(v.ZC, a2)), III).x,
            y: complexDivision(complexAdd3(v.ZA, complexMultiplication(v.ZB, a), complexMultiplication(v.ZC, a2)), III).y
        },
        Z2: {
            x: complexDivision(complexAdd3(v.ZA, complexMultiplication(v.ZB, a2), complexMultiplication(v.ZC, a)), III).x,
            y: complexDivision(complexAdd3(v.ZA, complexMultiplication(v.ZB, a2), complexMultiplication(v.ZC, a)), III).y
        }
    };
    return z;
}

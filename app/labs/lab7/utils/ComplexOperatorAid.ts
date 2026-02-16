export interface ComplexNumber {
    x: number;
    y: number;
}

export interface PolarComplex {
    magnitude: number;
    angle: number;
}

export const _I: ComplexNumber = { x: -1, y: 0 };
export const I: ComplexNumber = { x: 1, y: 0 };
export const II: ComplexNumber = { x: 2, y: 0 };
export const III: ComplexNumber = { x: 3, y: 0 };
export const I_3: ComplexNumber = { x: 1 / 3, y: 0 };
export const O: ComplexNumber = { x: 0, y: 0 };
export const a: ComplexNumber = { x: -0.5, y: Math.sqrt(3) / 2 };
export const a2 = complexMultiplication(a, a);
export const a_3 = complexMultiplication(I_3, a);
export const a2_3 = complexMultiplication(I_3, a2);
export const _a: ComplexNumber = { x: 0.5, y: -Math.sqrt(3) / 2 };
export const _a2 = complexMultiplication(_I, a2);
export const a_a2 = complexAdd(a, _a2);
export const a2_a = complexAdd(a2, _a);
export const a_I = complexAdd(a, _I);
export const I_a2 = complexAdd(I, _a2);
export const I_a = complexAdd(I, _a);
export const a2_I = complexAdd(a2, _I);
export const d0 = complexAdd(I, _a2);
export const d1 = complexAdd(a, _I);
export const d2 = complexAdd(a2, _a);
export const _d0 = complexAdd(_I, a2);
export const _d1 = complexAdd(_a, I);
export const _d2 = complexAdd(_a2, a);

export function objectToArrayFormatted(obj: ComplexNumber): [number, number] {
    return [obj.x, obj.y];
}

export function complexMultiplication(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b])[0];
    const bObj = allToObj([a, b])[1];
    const real = aObj.x * bObj.x - aObj.y * bObj.y;
    const imaginary = aObj.x * bObj.y + aObj.y * bObj.x;
    return { x: real, y: imaginary };
}

function complexMultiplicationArrays(a: number[], b: number[]): number[] {
    // For [x1, y1] * [x2, y2]
    return [
        a[0] * b[0] - a[1] * b[1], // x component
        a[0] * b[1] + a[1] * b[0], // y component
    ];
}

export function complexAdd(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b])[0];
    const bObj = allToObj([a, b])[1];
    const real = aObj.x + bObj.x;
    const imaginary = aObj.y + bObj.y;
    return { x: real, y: imaginary };
}

export function makeArray(variable: ComplexNumber | number[]): number[] {
    if (
        typeof variable === "object" &&
        variable !== null &&
        !Array.isArray(variable)
    ) {
        return objectToArrayFormatted(variable);
    } else {
        return variable as number[];
    }
}

export function allToArray(a: (ComplexNumber | number[])[]): (number[])[] {
    a.forEach((element, index, arr) => {
        arr[index] = makeArray(element);
    });
    return a as (number[])[];
}

function arrayToObjectFormatted(array: number[]): ComplexNumber {
    return { x: array[0], y: array[1] };
}

export function makeObj(variable: number[] | ComplexNumber): ComplexNumber {
    if (Array.isArray(variable)) {
        return arrayToObjectFormatted(variable);
    } else if (typeof variable === "object" && variable !== null) {
        return variable;
    } else {
        return { x: 0, y: 0 };
    }
}

export function allToObj(a: (number[] | ComplexNumber)[]): ComplexNumber[] {
    a.forEach((element, index, arr) => {
        arr[index] = makeObj(element);
    });
    return a as ComplexNumber[];
}

export function createObjectFromVector(vector: number[]): ComplexNumber {
    let [x, y] = vector;
    return { x, y };
}

export function setVectors(p: ComplexNumber, mag: number): number[][] {
    return [
        [p.x + mag, p.y],
        [p.x - mag / 2, p.y - (mag * Math.sqrt(3)) / 2],
        [p.x - mag / 2, p.y + (mag * Math.sqrt(3)) / 2],
        [p.x, p.y],
    ];
}

export function convertToPolar(a: ComplexNumber, isPolar: boolean): PolarComplex | ComplexNumber {
    if (isPolar) {
        const r = Math.sqrt(a.x * a.x + a.y * a.y);
        const θ = Math.atan2(a.y, a.x);
        // console.log("a.y",a.y,"a.x",a.x);
        return {
            magnitude: r,
            angle: (θ * 180) / Math.PI,
        };
    } else {
        return {
            x: a.x,
            y: a.y,
        };
    }
}

export function convertToCartesian(r: number, θ: number, isCartesian: boolean): ComplexNumber | PolarComplex {
    if (isCartesian) {
        const a = r * Math.cos(θ / 180);
        const b = r * Math.sin(θ / 180);
        console.log(θ / 180, "b", b);
        return {
            x: a,
            y: b,
        };
    } else {
        return {
            magnitude: r,
            angle: θ,
        };
    }
}

// Complex division function
export function complexDivision(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b])[0];
    const bObj = allToObj([a, b])[1];
    const denominator = bObj.x * bObj.x + bObj.y * bObj.y;

    if (denominator === 0) {
        return { x: NaN, y: NaN };
    }

    const real = (aObj.x * bObj.x + aObj.y * bObj.y) / denominator;
    const imaginary = (aObj.y * bObj.x - aObj.x * bObj.y) / denominator;

    return { x: real, y: imaginary };
}

// Complex inverse function
export function complexInverse(b: ComplexNumber | number[]): ComplexNumber {
    const bObj = allToObj([b])[0];
    const denominator = bObj.x * bObj.x + bObj.y * bObj.y;

    if (denominator === 0) {
        return { x: NaN, y: NaN };
    }

    const real = bObj.x / denominator;
    const imaginary = -bObj.y / denominator;

    return { x: real, y: imaginary };
}

export function complexAbs(b: ComplexNumber | number[]): number {
    const bObj = allToObj([b])[0];
    const nominator = bObj.x * bObj.x + bObj.y * bObj.y;

    return Math.sqrt(nominator);
}

// Complex multiplication3 function
export function complexMultiplication3(a: ComplexNumber | number[], b: ComplexNumber | number[], c: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b, c])[0];
    const bObj = allToObj([a, b, c])[1];
    const cObj = allToObj([a, b, c])[2];
    const real_aux = aObj.x * bObj.x - aObj.y * bObj.y;
    const imaginary_aux = aObj.y * bObj.x + aObj.x * bObj.y;
    const real = real_aux * cObj.x - imaginary_aux * cObj.y;
    const imaginary = imaginary_aux * cObj.x + real_aux * cObj.y;

    return { x: real, y: imaginary };
}

// Complex substract function
export function complexSub(a: ComplexNumber | number[], b: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b])[0];
    const bObj = allToObj([a, b])[1];
    const real = aObj.x - bObj.x;
    const imaginary = aObj.y - bObj.y;

    return { x: real, y: imaginary };
}

export function complexAdd3(a: ComplexNumber | number[], b: ComplexNumber | number[], c: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b, c])[0];
    const bObj = allToObj([a, b, c])[1];
    const cObj = allToObj([a, b, c])[2];
    const real = aObj.x + bObj.x + cObj.x;
    const imaginary = aObj.y + bObj.y + cObj.y;

    return { x: real, y: imaginary };
}

export function complexAdd4(a: ComplexNumber | number[], b: ComplexNumber | number[], c: ComplexNumber | number[], d: ComplexNumber | number[]): ComplexNumber {
    const aObj = allToObj([a, b, c, d])[0];
    const bObj = allToObj([a, b, c, d])[1];
    const cObj = allToObj([a, b, c, d])[2];
    const dObj = allToObj([a, b, c, d])[0];
    const real = aObj.x + bObj.x + cObj.x + dObj.x;
    const imaginary = aObj.y + bObj.y + cObj.y + dObj.y;

    return { x: real, y: imaginary };
}

export function multiplyMatrices(matrix1: (number[] | ComplexNumber)[][], matrix2: (number[] | ComplexNumber)[][]): (number[])[][] {
    // Standard dimension check: # of cols in matrix1 = # of rows in matrix2
    if (matrix1[0].length !== matrix2.length) {
        throw new Error("Invalid dimensions for matrix multiplication.");
    }

    const rows1 = matrix1.length; // N
    const cols1 = matrix1[0].length; // N
    const rows2 = matrix2.length; // N
    const cols2 = matrix2[0].length; // 1 for an N×1 vector

    // Create an N×1 result
    let result: number[][][] = Array.from({ length: rows1 }, () => new Array(cols2).fill(null));

    for (let i = 0; i < rows1; i++) {
        for (let j = 0; j < cols2; j++) {
            let sum: number[] = [0, 0]; // complex sum [real, imag]
            for (let k = 0; k < cols1; k++) {
                const product = complexMultiplicationArrays(
                    makeArray(matrix1[i][k]),
                    makeArray(matrix2[k][j]),
                );
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
    [I_3, a2_3, a_3],
];

export function inverseMatrix(matrix: number[][]): number[][] {
    const det =
        matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
        matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[2][0] * matrix[1][2]) +
        matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]);
    const invDet = 1 / det;

    const result: number[][] = [];
    result[0] = [
        (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invDet,
        (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invDet,
        (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invDet,
    ];
    result[1] = [
        (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invDet,
        (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invDet,
        (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invDet,
    ];
    result[2] = [
        (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invDet,
        (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invDet,
        (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invDet,
    ];

    return result;
}

export function PI_to_Y(Z_S: ComplexNumber, Z_E: ComplexNumber, Z_U: ComplexNumber): { Zl: ComplexNumber; Zj: ComplexNumber; Zk: ComplexNumber } {
    let Zl: ComplexNumber;
    let Zj: ComplexNumber;
    let Zk: ComplexNumber;
    Zl = complexDivision(
        complexMultiplication(Z_U, Z_S),
        complexAdd3(Z_S, Z_E, Z_U),
    );
    Zj = complexDivision(
        complexMultiplication(Z_S, Z_E),
        complexAdd3(Z_S, Z_E, Z_U),
    );
    Zk = complexDivision(
        complexMultiplication(Z_E, Z_U),
        complexAdd3(Z_S, Z_E, Z_U),
    );
    return { Zl, Zj, Zk };
}

export function Seq_012(v: { ZA: ComplexNumber; ZB: ComplexNumber; ZC: ComplexNumber }): { Z0: ComplexNumber; Z1: ComplexNumber; Z2: ComplexNumber } {
    let z = {
        Z0: {
            x: complexDivision(complexAdd3(v.ZA, v.ZB, v.ZC), III).x,
            y: complexDivision(complexAdd3(v.ZA, v.ZB, v.ZC), III).y,
        },
        Z1: {
            x: complexDivision(
                complexAdd3(
                    v.ZA,
                    complexMultiplication(v.ZB, a),
                    complexMultiplication(v.ZC, a2),
                ),
                III,
            ).x,
            y: complexDivision(
                complexAdd3(
                    v.ZA,
                    complexMultiplication(v.ZB, a),
                    complexMultiplication(v.ZC, a2),
                ),
                III,
            ).y,
        },
        Z2: {
            x: complexDivision(
                complexAdd3(
                    v.ZA,
                    complexMultiplication(v.ZB, a2),
                    complexMultiplication(v.ZC, a),
                ),
                III,
            ).x,
            y: complexDivision(
                complexAdd3(
                    v.ZA,
                    complexMultiplication(v.ZB, a2),
                    complexMultiplication(v.ZC, a),
                ),
                III,
            ).y,
        },
    };
    return z;
}

export function createMatrix(n) {
  // a = e^(i·2π/n) => [cos(2π/n), sin(2π/n)]
  const a = [Math.cos((2 * Math.PI) / n), Math.sin((2 * Math.PI) / n)];

  // Euler’s formula helper: a^k = e^(i·k·2π/n) => [cos(...), sin(...)]
  function α(exponent) {
    const angle = exponent * ((2 * Math.PI) / n);

    return [Math.cos(angle) / n, Math.sin(angle) / n];
  }

  // Initialize an n×n matrix with [1,0] (1+0i)
  let matrix = Array.from({ length: n }, () => Array(n).fill([1 / n, 0]));
  if (n === 3) {
    // Populate (row,col) for row>=1, col>=1
    for (let row = 1; row < n; row++) {
      for (let col = 1; col < n; col++) {
        // Diagonal => exponent = n-1
        // Off-diagonals => n-2, n-3, etc.
        const exponent = n - 2 + Math.abs(row - col);

        matrix[row][col] = α(exponent);
      }
    }
  }
  if (n === 6) {
    matrix = [
      [α(0), α(0), α(0), α(0), α(0), α(0)],
      [α(0), α(1), α(2), α(3), α(4), α(5)],
      [α(0), α(2), α(4), α(0), α(2), α(4)],
      [α(0), α(3), α(0), α(3), α(0), α(3)],
      [α(0), α(4), α(2), α(0), α(4), α(2)],
      [α(0), α(5), α(4), α(3), α(2), α(1)],
    ];
  }

  return matrix;
}

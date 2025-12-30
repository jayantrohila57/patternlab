import type { PatternData } from "./constants";

const solve = (
  formula: string,
  i: number,
  N: number,
  j: number = 0
): number => {
  try {
    return new Function("i", "N", "j", `return (${formula})`)(i, N, j);
  } catch {
    return 0;
  }
};

const nCr = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  const k = Math.min(r, n - r);
  let result = 1;
  for (let t = 1; t <= k; t++) {
    result = (result * (n - k + t)) / t;
  }
  return Math.round(result);
};

const checkCondition = (
  condition: string,
  i: number,
  j: number,
  N: number
): boolean => {
  try {
    return new Function("i", "j", "N", `return (${condition})`)(i, j, N);
  } catch {
    return true;
  }
};

const getValue = (
  type: string,
  i: number,
  j: number,
  counter: number,
  symbol: string
): string => {
  switch (type) {
    case "symbol":
      return symbol.trimEnd();
    case "row":
      return i.toString();
    case "col":
      return j.toString();
    case "counter":
      return counter.toString();
    case "binary":
      return (i + j) % 2 === 0 ? "1" : "0";
    case "binary-row":
      return i % 2 === 0 ? "1" : "0";
    case "binary-col":
      return j % 2 === 0 ? "1" : "0";
    case "alpha-row":
      return String.fromCharCode(64 + i);
    case "alpha-col":
      return String.fromCharCode(64 + j);
    case "palindrome": {
      // Simple palindromic sequence: 1..i..1 across the row
      const mid = i;
      const val = j <= mid ? j : 2 * mid - j;
      return val.toString();
    }
    case "pascal": {
      // Pascal's triangle coefficient C(i-1, j-1) for 1-indexed i/j
      const n = i - 1;
      const r = j - 1;
      return nCr(n, r).toString();
    }
    default:
      return symbol;
  }
};

export const generatePattern = (
  pattern: PatternData,
  customRows?: number
): string[] => {
  const N = customRows || pattern.config.defaultRows;
  const lines: string[] = [];
  let globalCounter = 1;

  // Keep spacing consistent: each rendered value takes one "cell" plus a gap.
  // A single empty cell is 2 chars so that leading padding aligns with "X ".
  const EMPTY_CELL = "  ";

  for (let i = 1; i <= N; i++) {
    let rowContent = "";

    // 1. Handle Spaces
    if (pattern.logic.renderSpaces && pattern.logic.spaceFormula) {
      const spaceCount = solve(pattern.logic.spaceFormula, i, N);
      rowContent += EMPTY_CELL.repeat(spaceCount);
    }

    // 2. Handle Fills
    const fillCount = solve(pattern.logic.fillFormula, i, N);
    for (let j = 1; j <= fillCount; j++) {
      // Hollow Logic
      if (
        pattern?.logic?.archetype === "CONDITIONAL" &&
        pattern?.logic?.condition
      ) {
        if (!checkCondition(pattern.logic.condition, i, j, N)) {
          rowContent += EMPTY_CELL;
          continue;
        }
      }

      rowContent +=
        getValue(
          pattern.logic.valueFormula,
          i,
          j,
          globalCounter,
          pattern.config.symbol
        ) + " ";
      globalCounter++;
    }
    lines.push(rowContent.trimEnd());
  }
  return lines;
};

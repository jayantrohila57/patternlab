export const logicArchetype = {
  LINEAR: "LINEAR", // j <= i (Triangles)
  SYMMETRIC: "SYMMETRIC", // j <= 2i-1 (Pyramids)
  STATIC: "STATIC", // j <= N (Squares/Grids)
  CONDITIONAL: "CONDITIONAL", // j <= N + If/Else (Hollow/Cross)
  MATH_SEQ: "MATH_SEQ", // Values based on math (Pascal/Floyd)
};

export type LogicArchetype =
  (typeof logicArchetype)[keyof typeof logicArchetype];

export type PatternCategory =
  | "Triangles"
  | "Pyramids & Diamonds"
  | "Grids & Squares"
  | "Math & Sequences"
  | "Misc";

export type PatternType =
  | "Solid"
  | "Hollow"
  | "Mirrored"
  | "Centered"
  | "Outline"
  | "Sequence";

export interface PatternData {
  id: string;
  name: string;
  description?: string;
  category?: PatternCategory;
  subCategory?: string;
  patternType?: PatternType;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  group: "Star" | "Number" | "Character";
  logic: {
    archetype: LogicArchetype;
    renderSpaces: boolean;
    fillFormula: string;
    spaceFormula?: string;
    condition?: string;
    valueFormula:
      | "row"
      | "col"
      | "counter"
      | "symbol"
      | "binary"
      | "binary-row"
      | "binary-col"
      | "alpha-row"
      | "alpha-col"
      | "palindrome"
      | "pascal";
  };
  config: {
    defaultRows: number;
    symbol: string;
  };
}

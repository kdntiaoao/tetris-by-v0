export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
export type TetrominoShape = boolean[][];
export type TetrominoColor = string;

// ゲームの状態の型定義
export type GameState = {
  grid: (TetrominoType | null)[][];
  position: { x: number; y: number };
  tetromino: {
    type: TetrominoType;
    shape: TetrominoShape;
  } | null;
  nextTetromino: TetrominoType | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
};

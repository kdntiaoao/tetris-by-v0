import {
  GameState,
  TetrominoColor,
  TetrominoShape,
  TetrominoType,
} from "./types";

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const DROP_TIME_INITIAL = 1000;

export const COLORS: Record<TetrominoType | "transparent", TetrominoColor> = {
  transparent: "0, 0, 0",
  I: "80, 227, 230",
  J: "36, 95, 223",
  L: "223, 173, 36",
  O: "223, 217, 36",
  S: "48, 211, 56",
  T: "132, 61, 198",
  Z: "227, 78, 78",
};

export const TETROMINOS: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"];

export const SHAPES: Record<TetrominoType, TetrominoShape> = {
  I: [
    [false, true, false, false],
    [false, true, false, false],
    [false, true, false, false],
    [false, true, false, false],
  ],
  J: [
    [false, true, false],
    [false, true, false],
    [true, true, false],
  ],
  L: [
    [false, true, false],
    [false, true, false],
    [false, true, true],
  ],
  O: [
    [true, true],
    [true, true],
  ],
  S: [
    [false, true, true],
    [true, true, false],
    [false, false, false],
  ],
  T: [
    [false, false, false],
    [true, true, true],
    [false, true, false],
  ],
  Z: [
    [true, true, false],
    [false, true, true],
    [false, false, false],
  ],
};

// ゲームの初期状態
export const INITIAL_STATE: GameState = {
  grid: Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null)),
  position: { x: 0, y: 0 },
  tetromino: null,
  nextTetromino: null,
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
};

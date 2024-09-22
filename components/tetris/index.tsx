"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

// テトリミノの形状と色の型定義
type TetrominoShape = (string | number)[][];
type TetrominoColor = string;

interface Tetromino {
  shape: TetrominoShape;
  color: TetrominoColor;
}

type TetrominoTypes = "0" | "I" | "J" | "L" | "O" | "S" | "T" | "Z";

// テトリミノの形状
const TETROMINOS: Record<TetrominoTypes, Tetromino> = {
  "0": { shape: [[0]], color: "0, 0, 0" },
  I: {
    shape: [
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
    ],
    color: "80, 227, 230",
  },
  J: {
    shape: [
      [0, "J", 0],
      [0, "J", 0],
      ["J", "J", 0],
    ],
    color: "36, 95, 223",
  },
  L: {
    shape: [
      [0, "L", 0],
      [0, "L", 0],
      [0, "L", "L"],
    ],
    color: "223, 173, 36",
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    color: "223, 217, 36",
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
      [0, 0, 0],
    ],
    color: "48, 211, 56",
  },
  T: {
    shape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    color: "132, 61, 198",
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
      [0, 0, 0],
    ],
    color: "227, 78, 78",
  },
};

// ゲームの状態の型定義
interface GameState {
  grid: number[][];
  position: { x: number; y: number };
  tetromino: Tetromino;
  nextTetromino: Tetromino;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
}

// ゲームの初期状態
const initialState: GameState = {
  grid: Array.from({ length: 20 }, () => Array(10).fill(0)),
  position: { x: 0, y: 0 },
  tetromino: TETROMINOS["0"],
  nextTetromino: TETROMINOS["0"],
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
};

export default function Component() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // 新しいテトリミノを生成
  const newTetromino = useCallback((): Tetromino => {
    const tetrominos = "IJLOSTZ" as const;
    const randTetromino =
      tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return TETROMINOS[randTetromino];
  }, []);

  // ゲームの初期化
  const startGame = useCallback(() => {
    setGameState({
      ...initialState,
      tetromino: newTetromino(),
      nextTetromino: newTetromino(),
    });
    setDropTime(1000);
    setGameStarted(true);
  }, [newTetromino]);

  // テトリミノの移動
  const moveTetromino = useCallback(
    (x: number, y: number) => {
      if (
        !checkCollision(
          gameState.grid,
          gameState.position,
          gameState.tetromino,
          { x, y }
        )
      ) {
        setGameState((prev) => ({
          ...prev,
          position: {
            x: prev.position.x + x,
            y: prev.position.y + y,
          },
        }));
      }
    },
    [gameState.grid, gameState.position, gameState.tetromino]
  );

  // テトリミノの回転
  const rotateTetromino = useCallback(() => {
    const rotated = gameState.tetromino.shape
      .map((_, index) => gameState.tetromino.shape.map((col) => col[index]))
      .reverse();

    if (
      !checkCollision(
        gameState.grid,
        gameState.position,
        { ...gameState.tetromino, shape: rotated },
        { x: 0, y: 0 }
      )
    ) {
      setGameState((prev) => ({
        ...prev,
        tetromino: {
          ...prev.tetromino,
          shape: rotated,
        },
      }));
    }
  }, [gameState.grid, gameState.position, gameState.tetromino]);

  // 衝突チェック
  const checkCollision = (
    grid: number[][],
    position: { x: number; y: number },
    tetromino: Tetromino,
    movement: { x: number; y: number }
  ): boolean => {
    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x] !== 0) {
          const newX = x + position.x + movement.x;
          const newY = y + position.y + movement.y;
          if (
            newX < 0 ||
            newX >= grid[0].length ||
            newY >= grid.length ||
            grid[newY][newX] !== 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // テトリミノを固定し、新しいテトリミノを生成
  const lockTetromino = useCallback(() => {
    const newGrid = gameState.grid.map((row) => [...row]);
    gameState.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newGrid[y + gameState.position.y][x + gameState.position.x] =
            value as number;
        }
      });
    });

    // ラインの消去とスコア計算
    let linesCleared = 0;
    for (let y = newGrid.length - 1; y >= 0; ) {
      if (newGrid[y].every((cell) => cell !== 0)) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(10).fill(0));
        linesCleared++;
      } else {
        y--;
      }
    }

    const newScore = gameState.score + linesCleared * 100 * gameState.level;
    const newLines = gameState.lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;

    setGameState((prev) => ({
      ...prev,
      grid: newGrid,
      position: { x: 3, y: 0 },
      tetromino: prev.nextTetromino,
      nextTetromino: newTetromino(),
      score: newScore,
      lines: newLines,
      level: newLevel,
      gameOver: checkCollision(newGrid, { x: 3, y: 0 }, prev.nextTetromino, {
        x: 0,
        y: 0,
      }),
    }));

    setDropTime(1000 / newLevel);
  }, [gameState, newTetromino]);

  // キーボード入力の処理
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!gameState.gameOver && gameStarted) {
        switch (event.key) {
          case "ArrowLeft":
            moveTetromino(-1, 0);
            break;
          case "ArrowRight":
            moveTetromino(1, 0);
            break;
          case "ArrowDown":
            moveTetromino(0, 1);
            break;
          case "ArrowUp":
            rotateTetromino();
            break;
        }
      }
    },
    [gameState.gameOver, gameStarted, moveTetromino, rotateTetromino]
  );

  // テトリミノの自動落下
  useEffect(() => {
    if (!gameState.gameOver && gameStarted && dropTime) {
      const dropTetromino = () => {
        if (
          !checkCollision(
            gameState.grid,
            gameState.position,
            gameState.tetromino,
            { x: 0, y: 1 }
          )
        ) {
          moveTetromino(0, 1);
        } else {
          lockTetromino();
        }
      };

      const dropTimer = setInterval(dropTetromino, dropTime);
      return () => clearInterval(dropTimer);
    }
  }, [gameState, dropTime, gameStarted, moveTetromino, lockTetromino]);

  // キーボードイベントリスナーの設定
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // ゲームボードの描画
  const renderGrid = () => {
    return gameState.grid.map((row, y) =>
      row.map((cell, x) => {
        const tetrominoCell =
          gameState.tetromino.shape[y - gameState.position.y]?.[
            x - gameState.position.x
          ];
        const color = tetrominoCell
          ? gameState.tetromino.color
          : cell
          ? TETROMINOS[cell as TetrominoTypes].color
          : "0, 0, 0";
        return (
          <div
            key={`${y}-${x}`}
            style={{
              width: "25px",
              height: "25px",
              backgroundColor: `rgba(${color}, ${
                tetrominoCell || cell ? 1 : 0.1
              })`,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
        );
      })
    );
  };

  // 次のテトリミノの描画
  const renderNextTetromino = () => {
    return gameState.nextTetromino.shape.map((row, y) =>
      row.map((cell, x) => (
        <div
          key={`next-${y}-${x}`}
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: cell
              ? `rgba(${gameState.nextTetromino.color}, 1)`
              : "transparent",
            border: cell ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          }}
        />
      ))
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Tetris</h1>
      <div className="flex">
        <div className="grid grid-cols-10 gap-0 border-2 border-gray-700">
          {renderGrid()}
        </div>
        <div className="ml-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Next</h2>
            <div className="grid grid-cols-4 gap-0">
              {renderNextTetromino()}
            </div>
          </div>
          <div className="mb-4">
            <p>Score: {gameState.score}</p>
            <p>Level: {gameState.level}</p>
            <p>Lines: {gameState.lines}</p>
          </div>
          {!gameStarted ? (
            <Button onClick={startGame}>Start Game</Button>
          ) : gameState.gameOver ? (
            <div>
              <p className="text-xl font-semibold mb-2">Game Over</p>
              <Button onClick={startGame}>Restart</Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

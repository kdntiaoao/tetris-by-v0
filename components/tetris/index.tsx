"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GameState, TetrominoShape, TetrominoType } from "./types";
import {
  COLORS,
  DROP_TIME_INITIAL,
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_STATE,
  SHAPES,
  TETROMINOS,
} from "./constants";

export default function Tetris() {
  const [grid, setGrid] = useState<GameState["grid"]>(INITIAL_STATE.grid);
  const [position, setPosition] = useState<{ x: number; y: number }>(
    INITIAL_STATE.position
  );
  const [tetromino, setTetromino] = useState<GameState["tetromino"]>(
    INITIAL_STATE.tetromino
  );
  const [nextTetromino, setNextTetromino] = useState<
    GameState["nextTetromino"]
  >(INITIAL_STATE.nextTetromino);
  const [score, setScore] = useState<number>(INITIAL_STATE.score);
  const [level, setLevel] = useState<number>(INITIAL_STATE.level);
  const [lines, setLines] = useState<number>(INITIAL_STATE.lines);
  const [gameOver, setGameOver] = useState<boolean>(INITIAL_STATE.gameOver);
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // 新しいテトリミノを生成
  const generateTetromino = useCallback((): TetrominoType => {
    return TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
  }, []);

  // ゲームの初期化
  const startGame = useCallback(() => {
    setGrid(
      Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0))
    );
    const initialTetromino = generateTetromino();
    setTetromino({
      type: initialTetromino,
      shape: SHAPES[initialTetromino],
    });
    setNextTetromino(generateTetromino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setDropTime(DROP_TIME_INITIAL);
    setGameStarted(true);
  }, [generateTetromino]);

  // テトリミノの移動
  const moveTetromino = useCallback(
    (x: number, y: number) => {
      if (
        tetromino &&
        !checkCollision(grid, position, tetromino.shape, { x, y })
      ) {
        setPosition((prev) => ({
          x: prev.x + x,
          y: prev.y + y,
        }));
      }
    },
    [grid, position, tetromino]
  );

  // テトリミノの回転
  const rotateTetromino = useCallback(() => {
    if (!tetromino) return;

    const rotated = tetromino.shape
      .map((_, index) => tetromino.shape.map((col) => col[index]))
      .map((row) => row.reverse());

    if (!checkCollision(grid, position, rotated, { x: 0, y: 0 })) {
      setTetromino((prev) => ({
        ...(prev || tetromino),
        shape: rotated,
      }));
    }
  }, [grid, position, tetromino]);

  // 衝突チェック
  const checkCollision = (
    grid: GameState["grid"],
    position: { x: number; y: number },
    shape: TetrominoShape,
    movement: { x: number; y: number }
  ): boolean => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = x + position.x + movement.x;
          const newY = y + position.y + movement.y;
          if (
            newX < 0 ||
            newX >= GRID_WIDTH ||
            newY >= GRID_HEIGHT ||
            grid[newY]?.[newX]
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
    const newGrid = grid.map((row) => [...row]);
    tetromino?.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          newGrid[y + position.y][x + position.x] = tetromino.type;
        }
      });
    });

    // ラインの消去とスコア計算
    let linesCleared = 0;
    for (let y = newGrid.length - 1; y >= 0; ) {
      if (newGrid[y].every((cell) => cell)) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(GRID_WIDTH).fill(0));
        linesCleared++;
      } else {
        y--;
      }
    }

    const newTetromino = nextTetromino && {
      type: nextTetromino,
      shape: SHAPES[nextTetromino],
    };
    const newScore = score + linesCleared * 100 * level;
    const newLines = lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;

    setGrid(newGrid);
    setPosition({ x: 3, y: 0 });
    setTetromino(newTetromino);
    setNextTetromino(generateTetromino());
    setScore(newScore);
    setLines(newLines);
    setLevel(newLevel);
    setGameOver(
      !!newTetromino &&
        checkCollision(newGrid, { x: 3, y: 0 }, newTetromino.shape, {
          x: 0,
          y: 0,
        })
    );
    setDropTime(DROP_TIME_INITIAL / newLevel);
  }, [
    grid,
    position,
    tetromino,
    nextTetromino,
    generateTetromino,
    score,
    lines,
    level,
  ]);

  // キーボード入力の処理
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!gameOver && gameStarted) {
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
    [gameOver, gameStarted, moveTetromino, rotateTetromino]
  );

  // テトリミノの自動落下
  useEffect(() => {
    if (!gameOver && gameStarted && dropTime) {
      const dropTetromino = () => {
        if (
          tetromino &&
          !checkCollision(grid, position, tetromino.shape, { x: 0, y: 1 })
        ) {
          moveTetromino(0, 1);
        } else {
          lockTetromino();
        }
      };

      const dropTimer = setInterval(dropTetromino, dropTime);
      return () => clearInterval(dropTimer);
    }
  }, [
    dropTime,
    gameStarted,
    moveTetromino,
    lockTetromino,
    gameOver,
    grid,
    position,
    tetromino,
  ]);

  // キーボードイベントリスナーの設定
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // ゲームボードの描画
  const renderGrid = () => {
    return grid.map((row, y) =>
      row.map((cell, x) => {
        const tetrominoCell =
          tetromino?.shape[y - position.y]?.[x - position.x];
        const color =
          (tetrominoCell && COLORS[tetromino.type]) ||
          (cell && COLORS[cell]) ||
          "0, 0, 0";
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
    return [...Array(4)].map((_, y) =>
      [...Array(4)].map((_, x) => (
        <div
          key={`next-${y}-${x}`}
          style={{
            backgroundColor:
              nextTetromino && SHAPES[nextTetromino]?.[y]?.[x]
                ? `rgba(${COLORS[nextTetromino]}, 1)`
                : "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            gridColumn: x + 1,
            gridRow: y + 1,
          }}
        />
      ))
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Tetris</h1>
      <div className="flex">
        <div className="grid grid-cols-10 gap-0 border-2 border-gray-700">
          {renderGrid()}
        </div>
        <div className="ml-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Next</h2>
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: "repeat(4, 20px)",
                gridTemplateRows: "repeat(4, 20px)",
              }}
            >
              {renderNextTetromino()}
            </div>
          </div>
          <div className="mb-4">
            <p>Score: {score}</p>
            <p>Level: {level}</p>
            <p>Lines: {lines}</p>
          </div>
          {!gameStarted ? (
            <Button onClick={startGame}>Start Game</Button>
          ) : gameOver ? (
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

import { useState, useCallback, useRef } from "react";
import {
  initGrid,
  findMatches,
  swapCells,
  removeMatches,
  dropTiles,
  fillEmpty,
  isAdjacent,
} from "../lib/gameLogic";

export type Phase =
  | "idle"
  | "swapping"
  | "swapping-back"
  | "removing"
  | "falling"
  | "filling";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function useGame() {
  const [grid, setGrid] = useState<number[][]>(() => initGrid());
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set());
  const [swappingCells, setSwappingCells] = useState<
    [[number, number], [number, number]] | null
  >(null);
  const processingRef = useRef(false);

  const processMatches = useCallback(async (startGrid: number[][]) => {
    let current = startGrid;
    let totalScore = 0;

    while (true) {
      const matches = findMatches(current);
      if (matches.size === 0) break;

      totalScore += matches.size * 10 + Math.max(0, matches.size - 3) * 5;

      setMatchedCells(new Set(matches));
      setPhase("removing");
      await delay(420);

      current = removeMatches(current, matches);
      setMatchedCells(new Set());
      current = dropTiles(current);
      setGrid([...current.map((r) => [...r])]);
      setPhase("falling");
      await delay(380);

      current = fillEmpty(current);
      setGrid([...current.map((r) => [...r])]);
      setPhase("filling");
      await delay(280);
    }

    setScore((s) => s + totalScore);
    setPhase("idle");
    processingRef.current = false;
  }, []);

  const handleCellPress = useCallback(
    async (row: number, col: number) => {
      if (processingRef.current) return;

      if (!selected) {
        setSelected([row, col]);
        return;
      }

      const [selRow, selCol] = selected;

      if (selRow === row && selCol === col) {
        setSelected(null);
        return;
      }

      if (!isAdjacent(selRow, selCol, row, col)) {
        setSelected([row, col]);
        return;
      }

      setSelected(null);
      processingRef.current = true;

      setSwappingCells([[selRow, selCol], [row, col]]);
      setPhase("swapping");
      const swapped = swapCells(grid, selRow, selCol, row, col);
      setGrid([...swapped.map((r) => [...r])]);
      await delay(320);
      setSwappingCells(null);

      const matches = findMatches(swapped);
      if (matches.size === 0) {
        setPhase("swapping-back");
        const restored = swapCells(swapped, selRow, selCol, row, col);
        setGrid([...restored.map((r) => [...r])]);
        await delay(320);
        setPhase("idle");
        processingRef.current = false;
        return;
      }

      await processMatches(swapped);
    },
    [grid, selected, processMatches]
  );

  const handleSwipeDirection = useCallback(
    async (row: number, col: number, dr: number, dc: number) => {
      if (processingRef.current) return;
      const r2 = row + dr;
      const c2 = col + dc;
      if (r2 < 0 || r2 >= 8 || c2 < 0 || c2 >= 8) return;

      setSelected(null);
      processingRef.current = true;

      setSwappingCells([[row, col], [r2, c2]]);
      setPhase("swapping");
      const swapped = swapCells(grid, row, col, r2, c2);
      setGrid([...swapped.map((r) => [...r])]);
      await delay(320);
      setSwappingCells(null);

      const matches = findMatches(swapped);
      if (matches.size === 0) {
        setPhase("swapping-back");
        const restored = swapCells(swapped, row, col, r2, c2);
        setGrid([...restored.map((r) => [...r])]);
        await delay(320);
        setPhase("idle");
        processingRef.current = false;
        return;
      }

      await processMatches(swapped);
    },
    [grid, processMatches]
  );

  const resetGame = useCallback(() => {
    if (processingRef.current) return;
    setGrid(initGrid());
    setScore(0);
    setSelected(null);
    setPhase("idle");
    setMatchedCells(new Set());
    setSwappingCells(null);
  }, []);

  return {
    grid,
    score,
    selected,
    phase,
    matchedCells,
    swappingCells,
    handleCellPress,
    handleSwipeDirection,
    resetGame,
  };
}

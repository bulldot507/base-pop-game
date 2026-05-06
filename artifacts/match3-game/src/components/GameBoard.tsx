import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CandyTile from "./CandyTile";
import { ROWS, COLS } from "../lib/gameLogic";
import type { Phase } from "../hooks/useGame";

interface GameBoardProps {
  grid: number[][];
  selected: [number, number] | null;
  matchedCells: Set<string>;
  swappingCells: [[number, number], [number, number]] | null;
  phase: Phase;
  onCellPress: (row: number, col: number) => void;
  onSwipe: (row: number, col: number, dr: number, dc: number) => void;
}

export default function GameBoard({
  grid,
  selected,
  matchedCells,
  swappingCells,
  phase,
  onCellPress,
  onSwipe,
}: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(48);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setTileSize(Math.floor(w / COLS));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const boardSize = tileSize * COLS;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[480px] mx-auto"
      style={{ aspectRatio: "1 / 1" }}
    >
      <div
        style={{
          width: boardSize,
          height: boardSize,
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(80,40,120,0.6) 0%, rgba(40,20,80,0.8) 100%)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Grid lines */}
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => (
            <div
              key={`cell-${r}-${c}`}
              style={{
                position: "absolute",
                left: c * tileSize,
                top: r * tileSize,
                width: tileSize,
                height: tileSize,
                borderRight: "1px solid rgba(255,255,255,0.04)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                boxSizing: "border-box",
              }}
            />
          ))
        )}

        {/* Tiles */}
        <AnimatePresence mode="popLayout">
          {grid.flatMap((row, r) =>
            row.map((type, c) => {
              if (type === -1) return null;
              const key = `tile-${r}-${c}-${type}`;
              const isSelected =
                selected !== null &&
                selected[0] === r &&
                selected[1] === c;
              const isMatched = matchedCells.has(`${r},${c}`);
              const isSwapping =
                swappingCells !== null &&
                ((swappingCells[0][0] === r && swappingCells[0][1] === c) ||
                  (swappingCells[1][0] === r && swappingCells[1][1] === c));

              return (
                <motion.div
                  key={key}
                  layout
                  style={{
                    position: "absolute",
                    left: c * tileSize,
                    top: r * tileSize,
                    width: tileSize,
                    height: tileSize,
                  }}
                  initial={{ y: -tileSize * 2, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    y: { type: "spring", stiffness: 340, damping: 28, delay: c * 0.02 },
                    opacity: { duration: 0.18 },
                    layout: { type: "spring", stiffness: 340, damping: 28 },
                  }}
                >
                  <CandyTile
                    type={type}
                    isSelected={isSelected}
                    isMatched={isMatched}
                    isSwapping={isSwapping}
                    row={r}
                    col={c}
                    tileSize={tileSize}
                    onPress={() => onCellPress(r, c)}
                    onSwipe={(dr, dc) => onSwipe(r, c, dr, dc)}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Phase overlay flash on match */}
        <AnimatePresence>
          {phase === "removing" && (
            <motion.div
              key="flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 70%)",
                pointerEvents: "none",
                borderRadius: 16,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

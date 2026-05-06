import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import GameBoard from "../components/GameBoard";
import { useGame } from "../hooks/useGame";
import { CANDY_CONFIGS } from "../components/CandyTile";
import WalletButton from "../components/WalletButton";

export default function GamePage() {
  const {
    grid,
    score,
    selected,
    phase,
    matchedCells,
    swappingCells,
    handleCellPress,
    handleSwipeDirection,
    resetGame,
  } = useGame();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, #2d1b69 0%, #1a0a3a 40%, #0d0520 100%)",
        minHeight: "100dvh",
      }}
    >
      {/* Ambient background orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {[
          { x: "15%", y: "10%", color: "rgba(167,92,250,0.12)", size: 340 },
          { x: "75%", y: "20%", color: "rgba(56,189,248,0.10)", size: 280 },
          { x: "50%", y: "80%", color: "rgba(236,72,153,0.10)", size: 320 },
        ].map((orb, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: orb.color,
              filter: "blur(60px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-5 px-4 py-6"
        style={{ paddingTop: "env(safe-area-inset-top, 24px)" }}
      >
        {/* Header */}
        <div className="w-full relative flex items-center justify-center" style={{ minHeight: 48 }}>
          {/* Centered title */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                style={{ color: "#f59e0b", filter: "drop-shadow(0 0 6px #f59e0b)" }}
              />
              <h1
                className="text-2xl font-black tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #f9a8d4 0%, #a78bfa 50%, #67e8f9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                Candy Crush
              </h1>
              <Sparkles
                size={18}
                style={{ color: "#f59e0b", filter: "drop-shadow(0 0 6px #f59e0b)" }}
              />
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              Match 3 or more to score!
            </p>
          </div>

          {/* Wallet button — top right */}
          <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <WalletButton />
          </div>
        </div>

        {/* Score + Reset row */}
        <div className="w-full flex items-center justify-between gap-3">
          {/* Score */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center rounded-2xl py-3 px-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(167,92,250,0.18) 0%, rgba(99,102,241,0.12) 100%)",
              border: "1px solid rgba(167,92,250,0.25)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Trophy size={14} style={{ color: "#fbbf24" }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Score
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={score}
                className="text-3xl font-black tabular-nums"
                style={{
                  background: "linear-gradient(90deg, #fde68a, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.1,
                }}
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {score.toLocaleString()}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Reset */}
          <motion.button
            onClick={resetGame}
            className="flex flex-col items-center justify-center rounded-2xl py-3 px-5 gap-1"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(239,68,68,0.12) 100%)",
              border: "1px solid rgba(236,72,153,0.25)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              cursor: "pointer",
              minWidth: 100,
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <RotateCcw
              size={20}
              style={{ color: "#f9a8d4", filter: "drop-shadow(0 0 4px rgba(236,72,153,0.6))" }}
            />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "rgba(249,168,212,0.9)" }}
            >
              New Game
            </span>
          </motion.button>
        </div>

        {/* Candy legend */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {CANDY_CONFIGS.map((cfg, i) => {
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: cfg.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 2px 8px ${cfg.shadow}`,
                }}
              >
                <Icon size={15} color={cfg.iconColor} strokeWidth={2} />
              </div>
            );
          })}
          <span
            className="text-xs ml-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            6 candy types
          </span>
        </div>

        {/* Phase status */}
        <div className="h-5 flex items-center">
          <AnimatePresence mode="wait">
            {phase !== "idle" && (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#a78bfa" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgba(167,139,250,0.9)" }}
                >
                  {phase === "swapping" && "Swapping…"}
                  {phase === "swapping-back" && "No match, undoing…"}
                  {phase === "removing" && "Match! Clearing…"}
                  {phase === "falling" && "Dropping tiles…"}
                  {phase === "filling" && "Refilling…"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game board */}
        <div className="w-full">
          <GameBoard
            grid={grid}
            selected={selected}
            matchedCells={matchedCells}
            swappingCells={swappingCells}
            phase={phase}
            onCellPress={handleCellPress}
            onSwipe={handleSwipeDirection}
          />
        </div>

        {/* Instructions */}
        <div
          className="text-center text-xs leading-relaxed px-2"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Tap to select, then tap adjacent — or swipe a candy to swap.
          <br />
          Match 3+ in a row or column to score!
        </div>
      </div>
    </div>
  );
}

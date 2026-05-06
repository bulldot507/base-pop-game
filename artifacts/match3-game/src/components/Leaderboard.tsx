import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  RefreshCw,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useLeaderboard } from "../hooks/useLeaderboard";

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
  currentScore: number;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function scoreDisplay(score: bigint) {
  return Number(score).toLocaleString();
}

const RANK_COLORS: Record<number, string> = {
  1: "linear-gradient(90deg, #ffd700, #ffb300)",
  2: "linear-gradient(90deg, #c0c0c0, #a8a8a8)",
  3: "linear-gradient(90deg, #cd7f32, #b36a1e)",
};

export default function Leaderboard({
  open,
  onClose,
  currentScore,
}: LeaderboardProps) {
  const { address, isConnected } = useAccount();
  const {
    entries,
    loading,
    error,
    lastFetched,
    refresh,
    submitScore,
    isSubmitting,
    isConfirming,
    isConfirmed,
    isSubmitError,
    submitError,
    txHash,
    contractConfigured,
  } = useLeaderboard();

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && entries.length === 0 && contractConfigured) {
      void refresh();
    }
  }, [open, contractConfigured]);

  const myEntry = address
    ? entries.find(
        (e) => e.address.toLowerCase() === address.toLowerCase()
      )
    : null;

  const myRank = myEntry?.rank ?? null;
  const myOnChainScore = myEntry ? Number(myEntry.score) : 0;
  const canSubmit =
    isConnected && currentScore > 0 && currentScore > myOnChainScore && contractConfigured;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lb-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9990,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <motion.div
            key="lb-modal"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 460,
              maxHeight: "90dvh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 22,
              border: "1px solid rgba(250,204,21,0.2)",
              background:
                "linear-gradient(160deg, rgba(28,14,65,0.99) 0%, rgba(12,6,35,1) 100%)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(250,204,21,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "18px 20px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(251,191,36,0.4)",
                }}
              >
                <Trophy size={20} color="#1c0e41" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#fef3c7",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Leaderboard
                </div>
                <div style={{ fontSize: 11, color: "rgba(252,211,77,0.5)", marginTop: 1 }}>
                  Base Mainnet · Top 1000 Players
                </div>
              </div>

              <button
                onClick={() => void refresh()}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: loading ? "default" : "pointer",
                  color: "rgba(252,211,77,0.6)",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Refresh"
              >
                <RefreshCw
                  size={15}
                  style={{
                    animation: loading ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.4)",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* My score + submit */}
            {isConnected && (
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(251,191,36,0.04)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "rgba(252,211,77,0.5)", marginBottom: 2 }}>
                      Your session
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#fbbf24",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {currentScore.toLocaleString()} pts
                    </div>
                    {myRank && (
                      <div style={{ fontSize: 11, color: "rgba(167,139,250,0.7)", marginTop: 1 }}>
                        Current rank: #{myRank} · On-chain best: {myOnChainScore.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {contractConfigured && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {isConfirmed && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4ade80" }}>
                          <CheckCircle2 size={12} />
                          Score saved on-chain!
                        </div>
                      )}
                      {isSubmitError && (
                        <div style={{ fontSize: 10, color: "#f87171", maxWidth: 160, textAlign: "right" }}>
                          {submitError?.message?.slice(0, 60)}…
                        </div>
                      )}
                      {txHash && !isConfirmed && (
                        <a
                          href={`https://basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 10, color: "#60a5fa", display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <ExternalLink size={10} /> View tx
                        </a>
                      )}
                      <motion.button
                        onClick={() => submitScore(currentScore)}
                        disabled={!canSubmit || isSubmitting || isConfirming}
                        whileTap={{ scale: 0.95 }}
                        whileHover={canSubmit ? { scale: 1.04 } : {}}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          borderRadius: 10,
                          border: "1px solid rgba(251,191,36,0.35)",
                          background: canSubmit
                            ? "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.15) 100%)"
                            : "rgba(255,255,255,0.04)",
                          cursor: canSubmit ? "pointer" : "not-allowed",
                          color: canSubmit ? "#fcd34d" : "rgba(255,255,255,0.25)",
                          fontSize: 12,
                          fontWeight: 700,
                          opacity: isSubmitting || isConfirming ? 0.7 : 1,
                        }}
                      >
                        {isSubmitting || isConfirming ? (
                          <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Send size={13} />
                        )}
                        {isConfirming ? "Confirming…" : isSubmitting ? "Sign in wallet…" : "Save Score On-Chain"}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Not configured notice */}
            {!contractConfigured && (
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(99,102,241,0.06)",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <AlertCircle size={14} style={{ color: "#a78bfa", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 4 }}>
                      Smart contract not yet deployed
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(196,181,253,0.6)", lineHeight: 1.6 }}>
                      Deploy <code style={{ background: "rgba(99,102,241,0.2)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>SimpleLeaderboard.sol</code> to Base Mainnet via Remix IDE, then set <code style={{ background: "rgba(99,102,241,0.2)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>VITE_LEADERBOARD_CONTRACT_ADDRESS</code> in your project secrets.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List */}
            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px 0",
                minHeight: 0,
              }}
            >
              {loading && entries.length === 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 20px",
                    gap: 12,
                    color: "rgba(252,211,77,0.5)",
                  }}
                >
                  <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 13 }}>Fetching on-chain events…</span>
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                    color: "#f87171",
                    fontSize: 13,
                  }}
                >
                  <AlertCircle size={24} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                  {error}
                </div>
              )}

              {!loading && !error && entries.length === 0 && contractConfigured && (
                <div
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    color: "rgba(252,211,77,0.4)",
                    fontSize: 13,
                  }}
                >
                  <Trophy size={32} style={{ margin: "0 auto 10px", display: "block", opacity: 0.3 }} />
                  No scores yet. Be the first!
                </div>
              )}

              {entries.map((entry) => {
                const isMe =
                  address &&
                  entry.address.toLowerCase() === address.toLowerCase();
                const rankBg = RANK_COLORS[entry.rank];
                return (
                  <div
                    key={entry.address}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 20px",
                      background: isMe
                        ? "rgba(251,191,36,0.08)"
                        : "transparent",
                      borderLeft: isMe ? "2px solid rgba(251,191,36,0.5)" : "2px solid transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: rankBg ?? "rgba(255,255,255,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: entry.rank > 99 ? 9 : entry.rank > 9 ? 11 : 13,
                          fontWeight: 800,
                          color: rankBg ? "#1c0e41" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {entry.rank}
                      </span>
                    </div>

                    {/* Address */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isMe ? 700 : 500,
                          color: isMe ? "#fcd34d" : "rgba(255,255,255,0.75)",
                          fontFamily: "monospace",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {shortAddr(entry.address)}
                        {isMe && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#fbbf24",
                              background: "rgba(251,191,36,0.15)",
                              padding: "1px 6px",
                              borderRadius: 4,
                              fontFamily: "sans-serif",
                              letterSpacing: 0,
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: entry.rank <= 3 ? "#fbbf24" : "rgba(255,255,255,0.8)",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                        flexShrink: 0,
                      }}
                    >
                      {scoreDisplay(entry.score)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {lastFetched && (
              <div
                style={{
                  padding: "8px 20px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                Last updated: {lastFetched.toLocaleTimeString()} · Data from Base Mainnet
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

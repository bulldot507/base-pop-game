import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Wallet, ChevronDown, LogOut, Copy, Check, ExternalLink } from "lucide-react";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const WALLET_META: Record<string, { label: string; icon: string }> = {
  coinbaseWalletSDK: {
    label: "Coinbase / Smart Wallet",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Ccircle cx='14' cy='14' r='14' fill='%230052FF'/%3E%3Crect x='9' y='9' width='10' height='10' rx='2.5' fill='white'/%3E%3C/svg%3E",
  },
  metaMaskSDK: {
    label: "MetaMask",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 35 33'%3E%3Cpolygon fill='%23E17726' points='32.96,0.5 19.38,10.2 21.81,4.3'/%3E%3Cpolygon fill='%23E27625' points='2.04,0.5 15.5,10.29 13.19,4.3'/%3E%3Cpolygon fill='%23E27625' points='28.23,23.53 24.53,29.09 32.2,31.22 34.41,23.66'/%3E%3Cpolygon fill='%23E27625' points='0.62,23.66 2.8,31.22 10.47,29.09 6.79,23.53'/%3E%3C/svg%3E",
  },
  phantom: {
    label: "Phantom",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='64' fill='%23AB9FF2'/%3E%3Cpath d='M110.5 64c0 25.7-20.8 46.5-46.5 46.5S17.5 89.7 17.5 64 38.3 17.5 64 17.5 110.5 38.3 110.5 64z' fill='white'/%3E%3C/svg%3E",
  },
  injected: {
    label: "Browser Wallet",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a78bfa' stroke-width='2'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath d='M16 12h.01'/%3E%3C/svg%3E",
  },
};

function getWalletMeta(connectorId: string) {
  return (
    WALLET_META[connectorId] ??
    WALLET_META["injected"]
  );
}

export default function WalletButton() {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (isConnected && address) {
    return (
      <div className="relative" ref={menuRef}>
        <motion.button
          onClick={() => setShowMenu((v) => !v)}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 12,
            border: "1px solid rgba(99,102,241,0.35)",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(167,92,250,0.12) 100%)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            cursor: "pointer",
            color: "#c4b5fd",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {connector && (
            <img
              src={getWalletMeta(connector.id).icon}
              alt=""
              style={{ width: 16, height: 16, borderRadius: 4 }}
            />
          )}
          {shortAddress(address)}
          <ChevronDown size={12} style={{ opacity: 0.7 }} />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: 190,
                borderRadius: 12,
                border: "1px solid rgba(99,102,241,0.3)",
                background:
                  "linear-gradient(135deg, rgba(30,15,70,0.97) 0%, rgba(20,10,50,0.99) 100%)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                padding: "6px",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  padding: "6px 10px",
                  fontSize: 11,
                  color: "rgba(196,181,253,0.55)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Connected on Base
              </div>
              <button
                onClick={copyAddress}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#e9d5ff",
                  fontSize: 13,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.background =
                    "rgba(99,102,241,0.15)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.background = "transparent")
                }
              >
                {copied ? (
                  <Check size={14} style={{ color: "#4ade80" }} />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied!" : shortAddress(address)}
              </button>
              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#e9d5ff",
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(99,102,241,0.15)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <ExternalLink size={14} />
                View on BaseScan
              </a>
              <div
                style={{
                  height: 1,
                  background: "rgba(99,102,241,0.18)",
                  margin: "4px 0",
                }}
              />
              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#fca5a5",
                  fontSize: 13,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.background =
                    "rgba(239,68,68,0.15)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.background = "transparent")
                }
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const uniqueConnectors = connectors.filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  );

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 12,
          border: "1px solid rgba(99,102,241,0.4)",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(167,92,250,0.15) 100%)",
          boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
          cursor: "pointer",
          color: "#c4b5fd",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        <Wallet size={14} />
        Connect Wallet
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(4px)",
              zIndex: 9998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 380,
                borderRadius: 20,
                border: "1px solid rgba(99,102,241,0.3)",
                background:
                  "linear-gradient(160deg, rgba(30,15,70,0.98) 0%, rgba(15,8,40,0.99) 100%)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
                padding: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wallet size={18} color="white" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#e9d5ff",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Connect Wallet
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(196,181,253,0.5)", marginTop: 1 }}>
                    Base Mainnet · Real ETH
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "rgba(196,181,253,0.6)",
                  marginBottom: 18,
                  marginTop: 14,
                  lineHeight: 1.5,
                }}
              >
                Choose a wallet to connect. Gas fees on Base are under $0.01.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {uniqueConnectors.map((c) => {
                  const meta = getWalletMeta(c.id);
                  const isLoading = isPending;
                  return (
                    <motion.button
                      key={c.id}
                      onClick={() => {
                        connect({ connector: c });
                        setShowModal(false);
                      }}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(99,102,241,0.22)",
                        background: "rgba(99,102,241,0.08)",
                        cursor: isLoading ? "wait" : "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "background 0.15s, border-color 0.15s",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.background = "rgba(99,102,241,0.18)";
                        el.style.borderColor = "rgba(99,102,241,0.45)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.background = "rgba(99,102,241,0.08)";
                        el.style.borderColor = "rgba(99,102,241,0.22)";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          overflow: "hidden",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        <img
                          src={meta.icon}
                          alt={meta.label}
                          style={{ width: 28, height: 28, objectFit: "contain" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#e9d5ff",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {meta.label}
                        </div>
                        {c.id === "coinbaseWalletSDK" && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(196,181,253,0.5)",
                              marginTop: 1,
                            }}
                          >
                            Email · Passkey · EOA
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "rgba(196,181,253,0.3)",
                  textAlign: "center",
                  marginTop: 16,
                  lineHeight: 1.5,
                }}
              >
                By connecting, you agree to interact on Base mainnet using real ETH.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

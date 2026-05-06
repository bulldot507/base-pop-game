# Candy Crush Match-3 Game

A browser-based Match-3 puzzle game inspired by Candy Crush, with Base Network wallet integration and on-chain high score leaderboard.

## Run & Operate

- `pnpm --filter @workspace/match3-game run dev` — run the game (uses PORT env)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `CDP_API_KEY` or `VITE_CDP_API_KEY` — Coinbase Developer Platform API key (optional, for full OnchainKit features)
- Required env: `VITE_LEADERBOARD_CONTRACT_ADDRESS` — deployed `SimpleLeaderboard` contract on Base Mainnet (optional, enables on-chain leaderboard)
- Required env: `DATABASE_URL` — Postgres connection string (API server only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, framer-motion
- Web3: wagmi v2, viem v2, @coinbase/onchainkit v0.38.x
- Icons: lucide-react
- Sound: Web Audio API (synthesized, no audio files)
- API: Express 5 (unused by game — scaffold only)
- DB: PostgreSQL + Drizzle ORM (scaffold only)

## Where things live

- `artifacts/match3-game/contracts/SimpleLeaderboard.sol` — Solidity contract (deploy via Remix IDE to Base Mainnet)
- `artifacts/match3-game/src/lib/gameLogic.ts` — pure game functions
- `artifacts/match3-game/src/lib/leaderboardAbi.ts` — contract ABI as TypeScript const
- `artifacts/match3-game/src/lib/wagmiConfig.ts` — wagmi config for Base mainnet + wallet connectors
- `artifacts/match3-game/src/hooks/useGame.ts` — React state machine + swap/match/fail callbacks
- `artifacts/match3-game/src/hooks/useSoundFx.ts` — Web Audio API synthesized sound effects
- `artifacts/match3-game/src/hooks/useLeaderboard.ts` — fetch ScoreSubmitted events, sort top 1000, submit score
- `artifacts/match3-game/src/providers.tsx` — WagmiProvider + QueryClientProvider + OnchainKitProvider
- `artifacts/match3-game/src/components/CandyTile.tsx` — animated candy tile + 6 candy configs
- `artifacts/match3-game/src/components/GameBoard.tsx` — 8×8 responsive grid
- `artifacts/match3-game/src/components/WalletButton.tsx` — Connect Wallet modal (Coinbase Smart Wallet, MetaMask, Phantom)
- `artifacts/match3-game/src/components/Leaderboard.tsx` — on-chain leaderboard modal with submit score
- `artifacts/match3-game/src/pages/GamePage.tsx` — main UI wiring all features together

## Architecture decisions

- Game logic is pure functions in `gameLogic.ts` — no React, fully testable
- `useGame` accepts `onSwapAttempt / onMatchFound / onSwapFail` callbacks — sounds injected from `GamePage` without coupling
- Tiles use framer-motion `layout` + `AnimatePresence`; drag via pointer event threshold (touch + mouse)
- Tile size computed via `ResizeObserver` — grid scales to any screen width
- Web3: wagmi v2 with OnchainKitProvider wrapping entire app; CDP API key via vite `define`
- Leaderboard: reads ALL `ScoreSubmitted` events in 50k-block chunks from BASE_GENESIS; deduplication and sorting done in JS — no on-chain sort needed
- `SimpleLeaderboard.sol` gas optimization: only writes to storage when `score > userScores[msg.sender]`
- Sound: Web Audio API synthesized tones — no audio files, works offline, instant response
- Buffer polyfill: alias `buffer → buffer/` in vite config + `global: "globalThis"` define

## Product

- 8×8 grid of 6 candy types (heart, sun, star, diamond, zap, moon)
- Tap-to-select-then-tap or swipe to swap adjacent candies
- 3+ match detection H/V with cascade scoring and bonus for large matches
- Swap sound (two-tone chirp), Match sound (ascending chord), No-match sound (low buzz)
- Mute toggle button in header
- Connect Wallet: Coinbase Smart Wallet (email/passkey), MetaMask, Phantom, browser wallets
- Leaderboard: top 1000 on-chain scores, current user highlighted, "Save Score" button
- Smart contract: gas-optimized (only writes new personal bests), emits events for off-chain sorting

## Deploying the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Paste `artifacts/match3-game/contracts/SimpleLeaderboard.sol`
3. Compile with Solidity 0.8.20
4. Deploy to **Base Mainnet** (Chain ID 8453) with your connected wallet
5. Copy the deployed contract address
6. Set it as `VITE_LEADERBOARD_CONTRACT_ADDRESS` in Replit Secrets

## Gotchas

- `processingRef` prevents double-taps during animation; do not remove it
- Grid is position-absolute tiled; `tileSize` must be recalculated on resize via ResizeObserver
- `fillEmpty` always fills after `dropTiles` — never call one without the other
- Leaderboard event fetch starts from `BASE_GENESIS = 2_000_000n`; update if contract deployed much later
- CDP API key and contract address are exposed to the client via vite `define` — both are public client keys

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
- OnchainKit docs: https://onchainkit.xyz
- Base network: https://docs.base.org
- Remix IDE deployment: https://remix.ethereum.org

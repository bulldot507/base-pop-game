# Candy Crush Match-3 Game

A browser-based Match-3 puzzle game inspired by Candy Crush — swap candies, match 3+, and rack up your score.

## Run & Operate

- `pnpm --filter @workspace/match3-game run dev` — run the game (uses PORT env)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `DATABASE_URL` — Postgres connection string (API server only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, framer-motion
- Icons: lucide-react
- API: Express 5 (unused by game — scaffold only)
- DB: PostgreSQL + Drizzle ORM (scaffold only)

## Where things live

- `artifacts/match3-game/src/lib/gameLogic.ts` — pure game functions (init, match, drop, fill)
- `artifacts/match3-game/src/hooks/useGame.ts` — React state machine for game loop
- `artifacts/match3-game/src/components/CandyTile.tsx` — animated candy tile + 6 candy configs
- `artifacts/match3-game/src/components/GameBoard.tsx` — 8×8 responsive grid with AnimatePresence
- `artifacts/match3-game/src/pages/GamePage.tsx` — full UI (score, reset, instructions)

## Architecture decisions

- Game logic is pure functions in `gameLogic.ts` — no React, fully testable
- `useGame` hook manages async game loop phases (idle → swapping → removing → falling → filling) with `processingRef` to prevent race conditions
- Tiles use framer-motion `layout` + `AnimatePresence` for smooth fall/appear; swap uses `animate` variants
- Drag detection via `onPointerDown`/`onPointerUp` threshold comparison — works on both touch and mouse
- Tile size is computed dynamically via `ResizeObserver` — grid scales to fit any screen

## Product

- 8×8 grid of 6 candy types (heart, sun, star, diamond, zap, moon)
- Tap-to-select-then-tap or swipe to swap adjacent candies
- 3+ match detection horizontal and vertical with cascade scoring
- Animated: swap, match flash, disappear, fall, and refill
- Score board with animated counter, New Game button, phase status indicator

## User preferences

_Populate as you build._

## Gotchas

- `processingRef` prevents double-taps during animation; do not remove it
- Grid is position-absolute tiled; `tileSize` must be recalculated on resize via ResizeObserver
- `fillEmpty` always fills after `dropTiles` — never call one without the other

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup

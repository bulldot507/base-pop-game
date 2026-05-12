# Base Pop 🔵 

A high-performance, on-chain match-3 puzzle game built specifically for the **Base Ecosystem**.

## 🚀 Overview
Base Pop integrates decentralized identity and on-chain mechanics into a seamless gaming experience. This project demonstrates how to leverage **Base Mainnet** for low-cost, high-speed gaming interactions and **Farcaster** for social distribution.

### 🛠 Tech Stack & Base Integration
- **Network:** Base Mainnet (Chain ID: 8453)
- **Frontend:** Vite + React + TypeScript
- **Onchain Tooling:** [Base OnchainKit](https://onchainkit.xyz) for seamless wallet connection.
- **Social:** Farcaster Frames v2 integration for in-feed gameplay.
- **Hosting:** Static Vite build (optimized for decentralized hosting).

## 💎 Builder Criteria alignment
This project is built following the "Base Builder" ethos:
1. **OnchainKit Implementation:** Uses `WalletComponents` for a "one-click" Base login experience.
2. **Mainnet Ready:** Fully configured for Base Mainnet (not just testnet).
- **Farcaster Optimized:** Includes full Frame metadata for deep integration into the Farcaster social graph.
- **Proof of Build:** Active development history visible in commit logs (started May 2026).

## 📂 Key Files
- `src/GamePage.tsx`: Core game logic and state management.
- `public/.well-known/farcaster.json`: Farcaster manifestation file for Frame validation.
- `vite.config.ts`: Optimized build configuration for Base performance.

## 🛠 Setup & Installation
```bash
npm install
npm run dev
```

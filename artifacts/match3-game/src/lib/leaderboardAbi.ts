export const LEADERBOARD_ABI = [
  {
    type: "function",
    name: "submitScore",
    inputs: [{ name: "score", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userScores",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getScore",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ScoreSubmitted",
    inputs: [
      { indexed: true, name: "user", type: "address", internalType: "address" },
      { indexed: false, name: "score", type: "uint256", internalType: "uint256" },
    ],
  },
] as const;

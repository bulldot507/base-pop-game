import { useState, useCallback } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { LEADERBOARD_ABI } from "../lib/leaderboardAbi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ADDRESS = import.meta.env
  .VITE_LEADERBOARD_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const CONTRACT_CONFIGURED =
  !!CONTRACT_ADDRESS && CONTRACT_ADDRESS.startsWith("0x");

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export interface LeaderboardEntry {
  rank: number;
  address: `0x${string}`;
  score: bigint;
}

const CHUNK = 50_000n;
const BASE_GENESIS = 2_000_000n;

async function fetchAllEvents(): Promise<LeaderboardEntry[]> {
  if (!CONTRACT_CONFIGURED) return [];

  const latest = await publicClient.getBlockNumber();
  const scoreMap = new Map<string, bigint>();

  let fromBlock = BASE_GENESIS;
  while (fromBlock <= latest) {
    const toBlock =
      fromBlock + CHUNK - 1n > latest ? latest : fromBlock + CHUNK - 1n;

    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem(
        "event ScoreSubmitted(address indexed user, uint256 score)"
      ),
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      const user = (log.args as { user: `0x${string}`; score: bigint }).user;
      const score = (log.args as { user: `0x${string}`; score: bigint }).score;
      const existing = scoreMap.get(user) ?? 0n;
      if (score > existing) scoreMap.set(user, score);
    }

    fromBlock = toBlock + 1n;
  }

  const entries: LeaderboardEntry[] = [];
  let rank = 1;
  const sorted = [...scoreMap.entries()].sort((a, b) =>
    a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0
  );
  for (const [address, score] of sorted.slice(0, 1000)) {
    entries.push({ rank: rank++, address: address as `0x${string}`, score });
  }
  return entries;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!CONTRACT_CONFIGURED) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllEvents();
      setEntries(data);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const {
    writeContract,
    data: txHash,
    isPending: isSubmitting,
    isError: isSubmitError,
    error: submitError,
    reset: resetSubmit,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const submitScore = useCallback(
    (score: number) => {
      if (!CONTRACT_CONFIGURED || !CONTRACT_ADDRESS) return;
      resetSubmit();
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LEADERBOARD_ABI,
        functionName: "submitScore",
        args: [BigInt(score)],
      });
    },
    [writeContract, resetSubmit]
  );

  return {
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
    contractConfigured: CONTRACT_CONFIGURED,
  };
}

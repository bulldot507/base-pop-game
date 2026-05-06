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

// Base RPC limits getLogs to a 10 000-block range — use 5 000 to stay safe
const CHUNK = 5_000n;
// Fetch the last ~46 days of blocks (~2 M blocks at Base's 2-second block time).
// For a freshly deployed contract this covers all events without fetching the
// entire chain history (which would require thousands of requests).
const LOOKBACK = 2_000_000n;

interface FetchProgress {
  fetched: number;
  total: number;
  pct: number;
}

async function fetchAllEvents(
  onProgress: (p: FetchProgress) => void,
  signal?: AbortSignal
): Promise<LeaderboardEntry[]> {
  if (!CONTRACT_CONFIGURED || !CONTRACT_ADDRESS) return [];

  const latest = await publicClient.getBlockNumber();
  const fromBlock = latest > LOOKBACK ? latest - LOOKBACK : 0n;

  const scoreMap = new Map<string, bigint>();
  const totalBlocks = latest - fromBlock;
  let processedBlocks = 0n;

  let cursor = fromBlock;

  while (cursor <= latest) {
    if (signal?.aborted) break;

    const toBlock =
      cursor + CHUNK - 1n > latest ? latest : cursor + CHUNK - 1n;

    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event ScoreSubmitted(address indexed user, uint256 score)"
        ),
        fromBlock: cursor,
        toBlock,
      });

      for (const log of logs) {
        const args = log.args as { user: `0x${string}`; score: bigint };
        const existing = scoreMap.get(args.user) ?? 0n;
        if (args.score > existing) scoreMap.set(args.user, args.score);
      }
    } catch (err) {
      // Skip the failed chunk — don't crash the whole fetch
      console.warn(`Leaderboard: skipped blocks ${cursor}–${toBlock}`, err);
    }

    processedBlocks += toBlock - cursor + 1n;

    const pct = Math.min(
      100,
      Math.round(Number((processedBlocks * 100n) / totalBlocks))
    );
    onProgress({
      fetched: Number(processedBlocks),
      total: Number(totalBlocks),
      pct,
    });

    cursor = toBlock + 1n;
  }

  // Sort highest score first, deduplicate by address, take top 1 000
  const entries: LeaderboardEntry[] = [...scoreMap.entries()]
    .sort((a, b) => (a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0))
    .slice(0, 1000)
    .map(([address, score], i) => ({
      rank: i + 1,
      address: address as `0x${string}`,
      score,
    }));

  return entries;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!CONTRACT_CONFIGURED) return;
    setLoading(true);
    setError(null);
    setProgress(null);

    const controller = new AbortController();

    try {
      const data = await fetchAllEvents((p) => setProgress(p), controller.signal);
      setEntries(data);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
      setProgress(null);
    }

    return () => controller.abort();
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
    progress,
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

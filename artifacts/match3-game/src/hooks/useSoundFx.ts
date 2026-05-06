import { useRef, useCallback } from "react";

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

function playTone(
  ac: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = "sine"
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function useSoundFx() {
  const enabled = useRef(true);

  const playSwap = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      playTone(ac, 520, t, 0.09, 0.13, "sine");
      playTone(ac, 720, t + 0.055, 0.09, 0.11, "sine");
    } catch {
      // AudioContext not available (e.g. SSR or blocked)
    }
  }, []);

  const playMatch = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      [440, 554, 659, 880].forEach((freq, i) => {
        playTone(ac, freq, t + i * 0.045, 0.22, 0.09, "triangle");
      });
    } catch {
      /* silent */
    }
  }, []);

  const playNoMatch = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      playTone(ac, 220, t, 0.12, 0.08, "sawtooth");
      playTone(ac, 180, t + 0.07, 0.12, 0.06, "sawtooth");
    } catch {
      /* silent */
    }
  }, []);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  return { playSwap, playMatch, playNoMatch, toggle, enabled };
}

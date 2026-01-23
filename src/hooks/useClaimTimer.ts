import { useState, useEffect, useCallback } from "react";

const CLAIM_COOLDOWN_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
const STORAGE_KEY = "zenfi_claim_timestamp";

export interface ClaimTimerState {
  canClaim: boolean;
  remainingTime: string;
  remainingMs: number;
}

export const useClaimTimer = (): ClaimTimerState & { 
  startCooldown: () => void;
  resetTimer: () => void;
} => {
  const [state, setState] = useState<ClaimTimerState>({
    canClaim: true,
    remainingTime: "00:00:00",
    remainingMs: 0
  });

  const formatTime = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const checkTimer = useCallback(() => {
    const storedTimestamp = localStorage.getItem(STORAGE_KEY);
    
    if (!storedTimestamp) {
      setState({
        canClaim: true,
        remainingTime: "00:00:00",
        remainingMs: 0
      });
      return;
    }

    const claimTime = parseInt(storedTimestamp, 10);
    const now = Date.now();
    const elapsed = now - claimTime;
    const remaining = CLAIM_COOLDOWN_MS - elapsed;

    if (remaining <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        canClaim: true,
        remainingTime: "00:00:00",
        remainingMs: 0
      });
    } else {
      setState({
        canClaim: false,
        remainingTime: formatTime(remaining),
        remainingMs: remaining
      });
    }
  }, []);

  const startCooldown = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    setState({
      canClaim: false,
      remainingTime: formatTime(CLAIM_COOLDOWN_MS),
      remainingMs: CLAIM_COOLDOWN_MS
    });
  }, []);

  const resetTimer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      canClaim: true,
      remainingTime: "00:00:00",
      remainingMs: 0
    });
  }, []);

  useEffect(() => {
    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [checkTimer]);

  return {
    ...state,
    startCooldown,
    resetTimer
  };
};

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const CLAIM_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const LOCAL_STORAGE_KEY = "creditbuzz_claim_timestamp";

export interface ClaimTimerState {
  canClaim: boolean;
  remainingTime: string;
  remainingMs: number;
  isLoading: boolean;
}

const formatTime = (ms: number): string => {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getStoredTargetTime = (): number | null => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return null;
  const t = parseInt(stored, 10);
  return isNaN(t) ? null : t;
};

export const useClaimTimer = (): ClaimTimerState & {
  startCooldown: () => Promise<void>;
  resetTimer: () => void;
} => {
  const getInitialTarget = (): number | null => {
    const t = getStoredTargetTime();
    if (t && t > Date.now()) return t;
    if (t) localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  };

  const targetRef = useRef<number | null>(getInitialTarget());

  const computeState = (): ClaimTimerState => {
    const target = targetRef.current;
    if (!target) {
      return { canClaim: true, remainingTime: "00:00:00", remainingMs: 0, isLoading: false };
    }
    const remaining = target - Date.now();
    if (remaining <= 0) {
      targetRef.current = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return { canClaim: true, remainingTime: "00:00:00", remainingMs: 0, isLoading: false };
    }
    return { canClaim: false, remainingTime: formatTime(remaining), remainingMs: remaining, isLoading: false };
  };

  const [state, setState] = useState<ClaimTimerState>(() => computeState());

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setState(computeState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync with server on mount
  useEffect(() => {
    const sync = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("next_claim_time")
          .eq("user_id", user.id)
          .single();

        // If a local cooldown was started AFTER this sync began, don't overwrite it
        const localTarget = targetRef.current;

        if (!profile?.next_claim_time) {
          // Only clear if no local cooldown is active
          if (!localTarget || localTarget <= Date.now()) {
            targetRef.current = null;
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } else {
          const serverTarget = new Date(profile.next_claim_time).getTime();
          if (serverTarget > Date.now()) {
            // Use whichever is further in the future (local claim may be newer)
            if (!localTarget || serverTarget > localTarget) {
              targetRef.current = serverTarget;
              localStorage.setItem(LOCAL_STORAGE_KEY, String(serverTarget));
            }
          } else {
            // Server says expired — only clear if local also expired
            if (!localTarget || localTarget <= Date.now()) {
              targetRef.current = null;
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          }
        }
        setState(computeState());
      } catch (error) {
        console.error("Error syncing claim timer:", error);
      }
    };
    sync();
  }, []);

  const startCooldown = useCallback(async () => {
    const nextClaimTime = Date.now() + CLAIM_COOLDOWN_MS;
    targetRef.current = nextClaimTime;
    localStorage.setItem(LOCAL_STORAGE_KEY, String(nextClaimTime));
    setState({
      canClaim: false,
      remainingTime: formatTime(CLAIM_COOLDOWN_MS),
      remainingMs: CLAIM_COOLDOWN_MS,
      isLoading: false,
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ next_claim_time: new Date(nextClaimTime).toISOString() })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error saving claim timer to server:", error);
    }
  }, []);

  const resetTimer = useCallback(() => {
    targetRef.current = null;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      canClaim: true,
      remainingTime: "00:00:00",
      remainingMs: 0,
      isLoading: false,
    });
  }, []);

  return { ...state, startCooldown, resetTimer };
};

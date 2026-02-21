import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const CLAIM_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const LOCAL_STORAGE_KEY = "creditbuzz_claim_timestamp";

export interface ClaimTimerState {
  canClaim: boolean;
  remainingTime: string;
  remainingMs: number;
  isLoading: boolean;
}

export const useClaimTimer = (): ClaimTimerState & { 
  startCooldown: () => Promise<void>;
  resetTimer: () => void;
} => {
  const formatTimeStatic = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize immediately from localStorage so button is never wrongly blocked
  const getInitialState = (): ClaimTimerState => {
    const storedTimestamp = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedTimestamp) {
      // No local data — optimistically allow claim, server will correct if needed
      return { canClaim: true, remainingTime: "00:00:00", remainingMs: 0, isLoading: false };
    }
    const nextClaimTime = parseInt(storedTimestamp, 10);
    const remaining = nextClaimTime - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return { canClaim: true, remainingTime: "00:00:00", remainingMs: 0, isLoading: false };
    }
    // Has active cooldown locally — no need for server confirmation to block the button
    return { canClaim: false, remainingTime: formatTimeStatic(remaining), remainingMs: remaining, isLoading: false };
  };

  const [state, setState] = useState<ClaimTimerState>(getInitialState);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fetch server-side timer and sync with local state
  const syncWithServer = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, canClaim: true, isLoading: false }));
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("next_claim_time")
        .eq("user_id", user.id)
        .single();

      if (!profile || !profile.next_claim_time) {
        // No timer set - user can claim
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setState({
          canClaim: true,
          remainingTime: "00:00:00",
          remainingMs: 0,
          isLoading: false,
        });
        return;
      }

      const nextClaimTime = new Date(profile.next_claim_time).getTime();
      const now = Date.now();
      const remaining = nextClaimTime - now;

      if (remaining <= 0) {
        // Timer expired - clear and allow claim
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setState({
          canClaim: true,
          remainingTime: "00:00:00",
          remainingMs: 0,
          isLoading: false,
        });
      } else {
        // Timer still active - sync local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, String(nextClaimTime));
        setState({
          canClaim: false,
          remainingTime: formatTime(remaining),
          remainingMs: remaining,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error syncing claim timer:", error);
      // Fall back to local storage on error
      checkLocalTimer();
    }
  }, []);

  const checkLocalTimer = useCallback(() => {
    const storedTimestamp = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!storedTimestamp) {
      setState(prev => ({
        ...prev,
        canClaim: true,
        remainingTime: "00:00:00",
        remainingMs: 0,
        isLoading: false,
      }));
      return;
    }

    const nextClaimTime = parseInt(storedTimestamp, 10);
    const now = Date.now();
    const remaining = nextClaimTime - now;

    if (remaining <= 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setState(prev => ({
        ...prev,
        canClaim: true,
        remainingTime: "00:00:00",
        remainingMs: 0,
        isLoading: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        canClaim: false,
        remainingTime: formatTime(remaining),
        remainingMs: remaining,
        isLoading: false,
      }));
    }
  }, []);

  const startCooldown = useCallback(async () => {
    const nextClaimTime = Date.now() + CLAIM_COOLDOWN_MS;
    
    // Update local storage immediately for instant UI feedback
    localStorage.setItem(LOCAL_STORAGE_KEY, String(nextClaimTime));
    setState({
      canClaim: false,
      remainingTime: formatTime(CLAIM_COOLDOWN_MS),
      remainingMs: CLAIM_COOLDOWN_MS,
      isLoading: false,
    });

    // Persist to server for cross-device/session persistence
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      canClaim: true,
      remainingTime: "00:00:00",
      remainingMs: 0,
      isLoading: false,
    });
  }, []);

  // Initial sync with server
  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  // Countdown interval - only update display, don't re-fetch
  useEffect(() => {
    const interval = setInterval(() => {
      checkLocalTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [checkLocalTimer]);

  // Re-sync when app becomes visible (user returns from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncWithServer();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncWithServer]);

  return {
    ...state,
    startCooldown,
    resetTimer,
  };
};

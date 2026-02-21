import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
  archived?: boolean;
}

interface PaymentState {
  hasPendingPayment: boolean;
  latestPayment: Payment | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  statusChanged: "approved" | "rejected" | null;
  clearStatusChange: () => void;
  needsStatusAcknowledgement: boolean;
}

// Key for tracking acknowledged payments
const ACKNOWLEDGED_KEY = "creditbuzz_acknowledged_payment";

// Cache latest payment so UI can render instantly on app resume/cold start
const LATEST_PAYMENT_CACHE_KEY = "creditbuzz_latest_payment_cache_v1";

const readCachedLatestPayment = (userId: string | undefined): Payment | null => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(LATEST_PAYMENT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Payment;
    if (!parsed?.id || !parsed?.status || parsed.user_id !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCachedLatestPayment = (payment: Payment | null) => {
  try {
    if (!payment) {
      localStorage.removeItem(LATEST_PAYMENT_CACHE_KEY);
      return;
    }
    localStorage.setItem(LATEST_PAYMENT_CACHE_KEY, JSON.stringify(payment));
  } catch {
    // ignore storage failures
  }
};

// Export function to clear cache before new payment creation
export const clearPaymentCache = () => {
  try {
    localStorage.removeItem(LATEST_PAYMENT_CACHE_KEY);
    localStorage.removeItem(ACKNOWLEDGED_KEY);
  } catch {
    // ignore
  }
};

export const usePaymentState = (userId: string | undefined): PaymentState => {
  const cachedPayment = readCachedLatestPayment(userId);
  const initialAcknowledgedId = typeof window !== "undefined" ? localStorage.getItem(ACKNOWLEDGED_KEY) : null;
  const initialNeedsAck =
    !!cachedPayment &&
    (cachedPayment.status === "approved" || cachedPayment.status === "rejected") &&
    initialAcknowledgedId !== cachedPayment.id;

  const [hasPendingPayment, setHasPendingPayment] = useState(!!cachedPayment && cachedPayment.status === "pending");
  const [latestPayment, setLatestPayment] = useState<Payment | null>(cachedPayment);
  const [isLoading, setIsLoading] = useState(() => Boolean(userId && !cachedPayment));
  const [statusChanged, setStatusChanged] = useState<"approved" | "rejected" | null>(null);
  const [needsStatusAcknowledgement, setNeedsStatusAcknowledgement] = useState(initialNeedsAck);
  const previousStatusRef = useRef<string | null>(cachedPayment?.status ?? null);
  const hasInitiallyLoadedRef = useRef(Boolean(cachedPayment));

  const clearStatusChange = useCallback(() => {
    setStatusChanged(null);
    setNeedsStatusAcknowledgement(false);
    // Mark as acknowledged
    if (latestPayment) {
      localStorage.setItem(ACKNOWLEDGED_KEY, latestPayment.id);
    }
  }, [latestPayment]);

  const fetchPaymentState = useCallback(async (isInitialLoad = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Only show loading on initial load, never on refetches
    if (isInitialLoad && !hasInitiallyLoadedRef.current) {
      setIsLoading(true);
    }

    try {
      // Fetch the latest payment for this user
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching payment state:", error);
        if (isInitialLoad) setIsLoading(false);
        return;
      }

      if (data) {
        const payment = data as Payment;
        setLatestPayment(payment);
        setHasPendingPayment(payment.status === "pending");
        writeCachedLatestPayment(payment);
        
        // Check if this payment needs acknowledgement (approved/rejected and not yet acknowledged)
        const acknowledgedId = localStorage.getItem(ACKNOWLEDGED_KEY);
        const isAcknowledged = acknowledgedId === payment.id;
        
        if ((payment.status === "approved" || payment.status === "rejected") && !isAcknowledged) {
          setNeedsStatusAcknowledgement(true);
        }
        
        previousStatusRef.current = payment.status;
      } else {
        setLatestPayment(null);
        setHasPendingPayment(false);
        writeCachedLatestPayment(null);
      }
    } catch (error) {
      console.error("Error in fetchPaymentState:", error);
    } finally {
      if (isInitialLoad) {
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
      }
    }
  }, [userId]);

  // Initial fetch - only this one shows loading
  useEffect(() => {
    // If we have a cached payment, skip the initial loading spinner and render instantly.
    hasInitiallyLoadedRef.current = Boolean(readCachedLatestPayment(userId));
    fetchPaymentState(true);
  }, [fetchPaymentState]);

  // If user changes (login/logout), hydrate immediately from cache for that user.
  useEffect(() => {
    const cached = readCachedLatestPayment(userId);
    setLatestPayment(cached);
    setHasPendingPayment(!!cached && cached.status === "pending");

    const acknowledgedId = localStorage.getItem(ACKNOWLEDGED_KEY);
    const needsAck =
      !!cached &&
      (cached.status === "approved" || cached.status === "rejected") &&
      acknowledgedId !== cached.id;
    setNeedsStatusAcknowledgement(needsAck);

    previousStatusRef.current = cached?.status ?? null;
    if (!userId) {
      setIsLoading(false);
    }
  }, [userId]);

  // Refetch on app resume (visibility change) to catch status changes while minimized - INSTANT, NO LOADING
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Immediately fetch without any delay or loading state
        fetchPaymentState(false);
      }
    };

    const handleFocus = () => {
      // Immediately fetch without any delay or loading state
      fetchPaymentState(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchPaymentState, userId]);

  // Real-time subscription for payment status changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`payment-state-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPayment = payload.new as Payment;
            setLatestPayment(newPayment);
            setHasPendingPayment(newPayment.status === "pending");
            writeCachedLatestPayment(newPayment);
            previousStatusRef.current = newPayment.status;
          } else if (payload.eventType === "UPDATE") {
            const updatedPayment = payload.new as Payment;
            const previousStatus = previousStatusRef.current;
            
            // Detect status change from pending to approved/rejected
            if (previousStatus === "pending") {
              if (updatedPayment.status === "approved") {
                setStatusChanged("approved");
                setNeedsStatusAcknowledgement(true);
              } else if (updatedPayment.status === "rejected") {
                setStatusChanged("rejected");
                setNeedsStatusAcknowledgement(true);
              }
            }
            
            setLatestPayment(updatedPayment);
            setHasPendingPayment(updatedPayment.status === "pending");
            writeCachedLatestPayment(updatedPayment);
            previousStatusRef.current = updatedPayment.status;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    hasPendingPayment,
    latestPayment,
    isLoading,
    refetch: () => fetchPaymentState(false),
    statusChanged,
    clearStatusChange,
    needsStatusAcknowledgement,
  };
};

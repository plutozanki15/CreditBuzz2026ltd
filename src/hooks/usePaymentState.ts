import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
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
const ACKNOWLEDGED_KEY = "zenfi_acknowledged_payment";

export const usePaymentState = (userId: string | undefined): PaymentState => {
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [latestPayment, setLatestPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusChanged, setStatusChanged] = useState<"approved" | "rejected" | null>(null);
  const [needsStatusAcknowledgement, setNeedsStatusAcknowledgement] = useState(false);
  const previousStatusRef = useRef<string | null>(null);
  const hasInitiallyLoadedRef = useRef(false);

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
    hasInitiallyLoadedRef.current = false;
    fetchPaymentState(true);
  }, [fetchPaymentState]);

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

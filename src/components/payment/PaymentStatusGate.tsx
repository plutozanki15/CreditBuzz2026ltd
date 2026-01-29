import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";

/**
 * Global guard: if a user has an unacknowledged approved/rejected payment,
 * force them onto /payment-status from ANY route (no refresh required).
 */
export const PaymentStatusGate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { needsStatusAcknowledgement, isLoading: paymentLoading } =
    usePaymentState(user?.id);

  useEffect(() => {
    if (authLoading || paymentLoading) return;
    if (!user) return;
    if (!needsStatusAcknowledgement) return;

    // Avoid infinite loops.
    if (location.pathname === "/payment-status") return;

    navigate("/payment-status", { replace: true });
  }, [authLoading, paymentLoading, user, needsStatusAcknowledgement, location.pathname, navigate]);

  return null;
};

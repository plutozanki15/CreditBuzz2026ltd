import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";
import { useUserRole } from "@/hooks/useUserRole";

/**
 * Global guard: if a regular user has an unacknowledged approved/rejected payment,
 * force them onto /payment-status from ANY route (no refresh required).
 * Admins are excluded from this gate.
 */
export const PaymentStatusGate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { needsStatusAcknowledgement, isLoading: paymentLoading } =
    usePaymentState(user?.id);

  useEffect(() => {
    // If we already have a cached user, don't block redirects on authLoading.
    if ((authLoading && !user) || paymentLoading || roleLoading) return;
    if (!user) return;
    // Admins should not be redirected
    if (isAdmin) return;
    if (!needsStatusAcknowledgement) return;

    // Avoid infinite loops.
    if (location.pathname === "/payment-status") return;

    navigate("/payment-status", { replace: true });
  }, [authLoading, paymentLoading, roleLoading, user, isAdmin, needsStatusAcknowledgement, location.pathname, navigate]);

  return null;
};

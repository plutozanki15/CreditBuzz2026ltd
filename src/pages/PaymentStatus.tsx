import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Receipt } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";
import { PaymentPendingView } from "@/components/payment/PaymentPendingView";
import { PaymentApprovedView } from "@/components/payment/PaymentApprovedView";
import { PaymentRejectedView } from "@/components/payment/PaymentRejectedView";

export const PaymentStatus = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { latestPayment, isLoading: paymentLoading, clearStatusChange } = usePaymentState(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
  }, [user, authLoading, navigate]);

  // Clear status change acknowledgement when user views the status page
  useEffect(() => {
    // We'll clear when they leave or interact, not immediately
    return () => {
      // Cleanup on unmount - acknowledge the status was viewed
    };
  }, []);

  const handleBackToDashboard = () => {
    // Clear the status change flag so they don't get redirected again
    clearStatusChange();
    navigate("/dashboard");
  };

  // Only show loading if we're still loading auth OR if we have no payment data yet on initial load
  // Don't show loading spinner when switching between statuses to avoid the "bug page" flash
  if ((authLoading && !user) || (paymentLoading && !latestPayment)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusView = () => {
    if (!latestPayment) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-5">
          <Receipt className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Start by purchasing ZFC
          </p>
          <button
            onClick={() => navigate("/buy-zfc")}
            className="px-6 py-2.5 bg-gradient-to-r from-violet to-magenta text-white font-semibold rounded-xl"
          >
            Buy ZFC
          </button>
        </div>
      );
    }

    switch (latestPayment.status) {
      case "approved":
        return <PaymentApprovedView onContinue={clearStatusChange} />;
      case "rejected":
        return <PaymentRejectedView reason={latestPayment.rejection_reason} onTryAgain={clearStatusChange} />;
      default:
        return <PaymentPendingView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBackToDashboard}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-violet" />
            <span className="text-base font-semibold text-foreground">Payment Status</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="relative z-10 w-full max-w-md mx-auto">
        {/* Removed AnimatePresence mode="wait" to prevent delay when switching status views */}
        <motion.div
          key={latestPayment?.status || "empty"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {getStatusView()}
        </motion.div>
      </main>
    </div>
  );
};

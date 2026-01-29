import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CreditCard, AlertTriangle } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { ProcessingAnimation } from "@/components/payment/ProcessingAnimation";
import { PaymentNoticeModal } from "@/components/payment/PaymentNoticeModal";
import { AccountDetails } from "@/components/payment/AccountDetails";

type FlowStep = "form" | "processing" | "notice" | "details";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
}

export const BuyZFC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const { hasPendingPayment, latestPayment, isLoading: paymentLoading } = usePaymentState(user?.id);
  const [currentStep, setCurrentStep] = useState<FlowStep>("form");
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Redirect to payment status if user has a pending payment
  useEffect(() => {
    if (!paymentLoading && hasPendingPayment && latestPayment) {
      navigate("/payment-status", { replace: true });
    }
  }, [paymentLoading, hasPendingPayment, latestPayment, navigate]);

  const handleFormSubmit = (data: FormData) => {
    // Double-check for pending payment before proceeding
    if (hasPendingPayment) {
      return; // Block - should not happen due to redirect but safety check
    }
    setFormData(data);
    setCurrentStep("processing");
  };

  const handleProcessingComplete = () => {
    setCurrentStep("notice");
  };

  const handleNoticeProceed = () => {
    setCurrentStep("details");
  };

  const handlePaymentConfirmed = (paymentId: string) => {
    navigate("/payment-status", { state: { paymentId } });
  };

  // Only show loading if auth is loading AND we have no cached profile
  // This allows instant page display when navigating from dashboard
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show pending payment warning if somehow still on this page
  if (hasPendingPayment) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingParticles />
        
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet" />
              <span className="text-base font-semibold text-foreground">Buy ZFC</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        <main className="relative z-10 px-5 py-8 w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gold/10 border border-gold/30 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Payment Pending
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              You already have a payment pending and awaiting admin approval. 
              Please wait until your current payment is processed before making another.
            </p>
            <button
              onClick={() => navigate("/payment-status")}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet to-magenta text-white font-semibold rounded-xl"
            >
              View Payment Status
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Processing Animation Overlay */}
      <AnimatePresence>
        {currentStep === "processing" && (
          <ProcessingAnimation onComplete={handleProcessingComplete} />
        )}
      </AnimatePresence>

      {/* Payment Notice Modal */}
      <AnimatePresence>
        {currentStep === "notice" && (
          <PaymentNoticeModal onProceed={handleNoticeProceed} />
        )}
      </AnimatePresence>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-magenta/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet" />
            <span className="text-base font-semibold text-foreground">Buy ZFC</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="relative z-10 px-5 py-4 pb-6 w-full max-w-md mx-auto">
        {currentStep === "form" && (
          <PaymentForm
            onSubmit={handleFormSubmit}
            defaultEmail={profile?.email || ""}
            defaultName={profile?.full_name || ""}
          />
        )}

        {currentStep === "details" && user && formData && (
          <AccountDetails
            userId={user.id}
            formData={formData}
            onPaymentConfirmed={handlePaymentConfirmed}
          />
        )}
      </main>
    </div>
  );
};

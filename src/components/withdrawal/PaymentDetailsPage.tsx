import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, CreditCard, Shield, ArrowRight, Building2, Hash, Banknote, Loader2 } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { toast } from "@/hooks/use-toast";

interface PaymentDetailsPageProps {
  onPaymentMade: () => void;
}

const PAYMENT_DETAILS = {
  accountNumber: "8102562883",
  bankName: "Moniepoint",
  amount: 8000,
};

export const PaymentDetailsPage = ({ onPaymentMade }: PaymentDetailsPageProps) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyAccount = async () => {
    await navigator.clipboard.writeText(PAYMENT_DETAILS.accountNumber);
    setCopiedAccount(true);
    toast({
      title: "Account number copied",
      description: "Paste it in your banking app to make payment",
    });
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handlePaymentMade = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onPaymentMade();
    }, 300);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold tracking-tight">Activation Payment</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Complete your activation</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pt-4 pb-8 flex flex-col items-center">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-teal/20 to-violet/10 border border-teal/40"
        >
          <span className="text-xs font-bold text-teal uppercase tracking-widest flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5" />
            Payment Required
          </span>
        </motion.div>

        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mb-6"
        >
          <div
            className="absolute inset-[-20px] rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(var(--teal)), hsl(var(--violet)))",
              filter: "blur(35px)",
              opacity: 0.3,
            }}
          />
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--teal)), hsl(var(--violet)))",
              boxShadow: "0 15px 40px hsla(var(--teal), 0.35)",
            }}
          >
            <Banknote className="w-9 h-9 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-display font-bold text-foreground mb-2 text-center"
        >
          Activation Payment Required
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mb-6 text-center max-w-xs"
        >
          Complete the payment below to activate your withdrawal
        </motion.p>

        {/* Payment Details Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mb-6"
        >
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{
              background: "hsla(240, 7%, 8%, 0.9)",
              border: "1px solid hsla(174, 88%, 56%, 0.25)",
              boxShadow: "0 20px 60px hsla(174, 88%, 56%, 0.12)",
            }}
          >
            {/* Amount */}
            <div className="text-center py-3 border-b border-border/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Amount to Pay
              </p>
              <p className="text-3xl font-display font-bold text-teal">
                {formatCurrency(PAYMENT_DETAILS.amount)}
              </p>
            </div>

            {/* Bank Name */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="text-xs">Bank</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{PAYMENT_DETAILS.bankName}</span>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span className="text-xs">Account Number</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold text-foreground">
                  {PAYMENT_DETAILS.accountNumber}
                </span>
                <motion.button
                  onClick={handleCopyAccount}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg transition-all"
                  style={{
                    background: copiedAccount ? "hsla(var(--teal), 0.2)" : "hsla(var(--violet), 0.2)",
                  }}
                >
                  {copiedAccount ? (
                    <Check className="w-4 h-4 text-teal" />
                  ) : (
                    <Copy className="w-4 h-4 text-violet" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mb-8 p-4 rounded-xl bg-secondary/40 border border-border/40"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Important</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Transfer the exact amount above to complete your activation. 
                After payment, click the button below to confirm.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Made Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handlePaymentMade}
          disabled={isSubmitting}
          className="group relative w-full max-w-sm py-4 rounded-2xl font-display font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, hsl(var(--teal)), hsl(var(--violet)))",
            boxShadow: "0 15px 40px hsla(var(--teal), 0.35)",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />

          <span className="relative flex items-center justify-center gap-3">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>I Have Made Payment</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </>
            )}
          </span>
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 mt-8 text-muted-foreground/60"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            Secured by ZenFi • 256-bit SSL
          </span>
        </motion.div>
      </main>
    </div>
  );
};

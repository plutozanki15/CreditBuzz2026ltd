import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Receipt, Building2, Hash, Calendar, Clock, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface WithdrawalSuccessProps {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  referenceId: string;
  createdAt: string;
}

export const WithdrawalSuccess = ({
  amount,
  bankName,
  accountNumber,
  accountName,
  referenceId,
  createdAt,
}: WithdrawalSuccessProps) => {
  const navigate = useNavigate();
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    // Animate receipt in after success animation
    const timer = setTimeout(() => setShowReceipt(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskAccountNumber = (accNum: string) => {
    if (accNum.length <= 4) return accNum;
    return "••••••" + accNum.slice(-4);
  };

  const handleContinue = () => {
    // Show notification when continuing to dashboard
    toast({
      title: "🔔 Withdrawal Processed",
      description: `Your withdrawal of ${formatCurrency(amount)} has been deducted from your dashboard balance.`,
    });

    // Navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-8 flex flex-col items-center justify-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsla(174, 88%, 56%, 0.2), hsla(174, 88%, 56%, 0.1))",
              boxShadow: "0 0 40px hsla(174, 88%, 56%, 0.3)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <CheckCircle className="w-12 h-12 text-teal" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Withdrawal Successful
          </h1>
          <p className="text-sm text-muted-foreground">
            Your withdrawal request has been processed successfully.
          </p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showReceipt ? 1 : 0, y: showReceipt ? 0 : 30 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "hsla(240, 7%, 8%, 0.9)",
              border: "1px solid hsla(0, 0%, 100%, 0.08)",
              boxShadow: "0 20px 50px hsla(0, 0%, 0%, 0.3)",
            }}
          >
            {/* Receipt Header */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, hsla(174, 88%, 56%, 0.15), hsla(262, 76%, 57%, 0.1))",
                borderBottom: "1px solid hsla(0, 0%, 100%, 0.06)",
              }}
            >
              <Receipt className="w-5 h-5 text-teal" />
              <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Transaction Receipt
              </span>
            </div>

            {/* Receipt Body */}
            <div className="p-5 space-y-4">
              {/* Amount - Highlighted */}
              <div className="text-center py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-display font-bold text-teal">{formatCurrency(amount)}</p>
              </div>

              <div className="h-px bg-border/30" />

              {/* Receipt Details */}
              <div className="space-y-3">
                <ReceiptRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Transaction Type"
                  value="Withdrawal"
                />
                <ReceiptRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date"
                  value={formatDate(createdAt)}
                />
                <ReceiptRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Time"
                  value={formatTime(createdAt)}
                />
                <ReceiptRow
                  icon={<Fingerprint className="w-4 h-4" />}
                  label="Reference ID"
                  value={referenceId.slice(0, 8).toUpperCase()}
                  mono
                />
                <ReceiptRow
                  icon={<Building2 className="w-4 h-4" />}
                  label="Bank"
                  value={bankName}
                />
                <ReceiptRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Account"
                  value={maskAccountNumber(accountNumber)}
                  mono
                />
              </div>

              <div className="h-px bg-border/30" />

              {/* Status */}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "hsla(174, 88%, 56%, 0.15)",
                    color: "hsl(174, 88%, 56%)",
                  }}
                >
                  Successful
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showReceipt ? 1 : 0, y: showReceipt ? 0 : 20 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onClick={handleContinue}
          className="mt-8 w-full max-w-sm h-14 rounded-2xl font-display font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
            boxShadow: "0 8px 32px hsla(262, 76%, 57%, 0.35)",
          }}
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </main>
    </div>
  );
};

// Helper component for receipt rows
const ReceiptRow = ({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
  </div>
);

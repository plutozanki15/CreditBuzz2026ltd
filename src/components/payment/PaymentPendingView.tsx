import { motion } from "framer-motion";
import { Clock, Shield, Loader2, Zap, Lock, CheckCircle2, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";
import { loadReceiptForPayment, storedReceiptToFile, deleteReceiptForPayment } from "@/lib/receiptStore";
import { uploadReceiptForPayment } from "@/lib/receiptUpload";
import { useState } from "react";

export const PaymentPendingView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latestPayment, refetch } = usePaymentState(user?.id);
  const [retrying, setRetrying] = useState(false);

  const receiptStatus = (latestPayment as any)?.receipt_status ?? "uploaded";

  const handleRetry = async () => {
    if (!user || !latestPayment || retrying) return;
    setRetrying(true);

    try {
      const stored = await loadReceiptForPayment(latestPayment.id);
      if (!stored) {
        // No local file - user must re-upload
        navigate("/buy-zfc");
        return;
      }

      const file = storedReceiptToFile(stored);
      await uploadReceiptForPayment({
        userId: user.id,
        paymentId: latestPayment.id,
        file,
        timeoutMs: 30000,
      });

      await deleteReceiptForPayment(latestPayment.id);
      localStorage.removeItem("zenfi_pending_upload_payment");
      await refetch();
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetrying(false);
    }
  };

  // Show uploading state
  if (receiptStatus === "uploading") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet/20 to-magenta/20 border border-violet/30"
        >
          <span className="text-xs font-semibold text-violet uppercase tracking-widest">
            Uploading Receipt
          </span>
        </motion.div>

        <div className="relative mb-8">
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsla(var(--violet), 0.1), hsla(var(--magenta), 0.1))",
              border: "2px solid hsla(var(--violet), 0.4)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-violet" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3">Uploading Your Receipt</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Please wait while we upload your payment receipt. This may take a few seconds.
        </p>

        <div className="flex items-center gap-2 text-muted-foreground/60">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            Secure Upload in Progress
          </span>
        </div>
      </motion.div>
    );
  }

  // Show failed state with retry
  if (receiptStatus === "failed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30"
        >
          <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
            Upload Failed
          </span>
        </motion.div>

        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsla(0, 70%, 50%, 0.1), hsla(0, 70%, 40%, 0.1))",
              border: "2px solid hsla(0, 70%, 50%, 0.4)",
            }}
          >
            <AlertTriangle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3">Receipt Upload Failed</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-8">
          We couldn't upload your receipt. Please tap Retry to try again, or go back and re-upload.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full py-3.5 px-4 font-semibold rounded-xl bg-gradient-to-r from-violet to-magenta text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {retrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retry Upload
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 px-4 font-medium rounded-xl bg-secondary/50 text-muted-foreground"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  // Default: Normal pending state (uploaded successfully, awaiting admin)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Premium Header Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-violet/20 border border-gold/30"
      >
        <span className="text-xs font-semibold text-gold uppercase tracking-widest">
          Processing Transaction
        </span>
      </motion.div>

      {/* Animated Processing Indicator */}
      <div className="relative mb-10">
        {/* Multiple orbiting rings */}
        <motion.div
          className="absolute inset-[-20px] rounded-full border-2 border-dashed border-gold/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-[-35px] rounded-full border border-violet/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--violet)) 100%)",
            filter: "blur(25px)",
            opacity: 0.35,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Main circle */}
        <motion.div
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsla(var(--gold), 0.1), hsla(var(--violet), 0.1))",
            border: "2px solid hsla(var(--gold), 0.4)",
            boxShadow: "0 0 40px hsla(var(--gold), 0.2), inset 0 0 30px hsla(var(--gold), 0.1)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-gold" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i === 0 ? "hsl(var(--gold))" : i === 1 ? "hsl(var(--violet))" : "hsl(var(--teal))",
              top: "50%",
              left: "50%",
              boxShadow: `0 0 10px ${i === 0 ? "hsl(var(--gold))" : i === 1 ? "hsl(var(--violet))" : "hsl(var(--teal))"}`,
            }}
            animate={{
              x: [0, Math.cos((i * 120 * Math.PI) / 180) * 55, 0],
              y: [0, Math.sin((i * 120 * Math.PI) / 180) * 55, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Status Icon with pulse */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-5"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gold/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Clock className="w-8 h-8 text-gold relative z-10" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
      >
        🕒 Payment Pending
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed"
      >
        Your payment has been received and is awaiting admin confirmation. You'll be notified instantly once approved.
      </motion.p>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl mb-8"
        style={{
          background: "linear-gradient(135deg, hsla(var(--gold), 0.1), hsla(var(--gold), 0.05))",
          border: "1px solid hsla(var(--gold), 0.25)",
          boxShadow: "0 4px 20px hsla(var(--gold), 0.1)",
        }}
      >
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-gold"
          animate={{ 
            opacity: [1, 0.4, 1],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ boxShadow: "0 0 8px hsl(var(--gold))" }}
        />
        <span className="text-xs font-semibold text-gold uppercase tracking-wider">
          Awaiting Verification
        </span>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8"
      >
        {[
          { icon: Zap, label: "Instant", color: "gold" },
          { icon: Lock, label: "Encrypted", color: "violet" },
          { icon: CheckCircle2, label: "Verified", color: "teal" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/30 border border-border/30"
          >
            <item.icon className={`w-4 h-4 text-${item.color}`} />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-2 text-muted-foreground/60"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-medium">
          Bank-Grade Security • 256-bit SSL
        </span>
      </motion.div>

      {/* Back to Dashboard Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-10"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="group relative flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-300 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(45, 90%, 45%) 50%, hsl(var(--gold)) 100%)",
            border: "2px solid hsla(var(--gold), 0.8)",
            boxShadow: "0 6px 30px hsla(var(--gold), 0.4), 0 2px 10px hsla(var(--gold), 0.3), inset 0 1px 0 hsla(0, 0%, 100%, 0.2)",
          }}
        >
          {/* Shine effect */}
          <span 
            className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300"
            style={{
              background: "linear-gradient(110deg, transparent 25%, hsla(0, 0%, 100%, 0.4) 50%, transparent 75%)",
              backgroundSize: "200% 100%",
            }}
          />
          
          {/* Arrow with animation */}
          <motion.span
            className="relative z-10"
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowLeft className="w-5 h-5 text-background" strokeWidth={3} />
          </motion.span>
          
          {/* Text */}
          <span className="relative z-10 text-background font-bold drop-shadow-sm">
            Back to Dashboard
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
};

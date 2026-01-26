import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, Shield, AlertTriangle } from "lucide-react";

interface PaymentRejectedViewProps {
  reason?: string | null;
}

export const PaymentRejectedView = ({ reason }: PaymentRejectedViewProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Rejection Animation Container */}
      <div className="relative mb-8">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "hsl(var(--destructive))",
            filter: "blur(25px)",
            opacity: 0.2,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1.3 }}
          transition={{ duration: 0.5 }}
        />

        {/* Main X circle */}
        <motion.div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "hsla(var(--destructive), 0.15)",
            border: "2px solid hsla(var(--destructive), 0.3)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <XCircle className="w-12 h-12 text-destructive" strokeWidth={2} />
          </motion.div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-foreground mb-2"
      >
        Payment Could Not Be Confirmed
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground max-w-xs mb-4"
      >
        Unfortunately, we couldn't verify your payment. Please review and try again.
      </motion.p>

      {/* Reason Box (if provided) */}
      {reason && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs p-4 rounded-xl mb-6"
          style={{
            background: "hsla(var(--destructive), 0.08)",
            border: "1px solid hsla(var(--destructive), 0.2)",
          }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-destructive mb-1">Reason</p>
              <p className="text-xs text-muted-foreground">{reason}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
        style={{
          background: "hsla(var(--destructive), 0.1)",
          border: "1px solid hsla(var(--destructive), 0.2)",
        }}
      >
        <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
          Verification Failed
        </span>
      </motion.div>

      {/* Retry Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={() => navigate("/buy-zfc")}
        className="group w-full max-w-xs py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
          boxShadow: "0 12px 30px hsla(var(--violet), 0.35)",
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </span>
      </motion.button>

      {/* Dashboard Link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => navigate("/dashboard")}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Return to Dashboard
      </motion.button>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-2 mt-8 text-muted-foreground/60"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">
          Contact support if this persists
        </span>
      </motion.div>
    </motion.div>
  );
};

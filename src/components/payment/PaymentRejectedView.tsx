import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, Shield, AlertTriangle, HelpCircle, MessageCircle } from "lucide-react";

interface PaymentRejectedViewProps {
  reason?: string | null;
  onTryAgain?: () => void;
}

export const PaymentRejectedView = ({ reason, onTryAgain }: PaymentRejectedViewProps) => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    onTryAgain?.();
    navigate("/buy-zfc");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
    >
      {/* Warning Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/40"
      >
        <span className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          Verification Failed
        </span>
      </motion.div>

      {/* Rejection Animation Container */}
      <div className="relative mb-10">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "hsl(var(--destructive))",
            filter: "blur(30px)",
            opacity: 0.25,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1.4 }}
          transition={{ duration: 0.5 }}
        />

        {/* Decorative ring */}
        <motion.div
          className="absolute inset-[-20px] rounded-full border-2 border-dashed border-destructive/20"
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: -360, scale: 1 }}
          transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 0.4 } }}
        />

        {/* Main X circle */}
        <motion.div
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsla(var(--destructive), 0.15), hsla(var(--destructive), 0.08))",
            border: "2px solid hsla(var(--destructive), 0.4)",
            boxShadow: "0 0 40px hsla(var(--destructive), 0.15), inset 0 0 30px hsla(var(--destructive), 0.08)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 280 }}
          >
            <XCircle className="w-14 h-14 text-destructive" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
      >
        Payment Could Not Be Verified
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed"
      >
        We were unable to confirm your transaction. Please review the details below and try again.
      </motion.p>

      {/* Reason Box (if provided) */}
      {reason && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs p-4 rounded-xl mb-6"
          style={{
            background: "linear-gradient(135deg, hsla(var(--destructive), 0.1), hsla(var(--destructive), 0.05))",
            border: "1px solid hsla(var(--destructive), 0.25)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-destructive mb-1 uppercase tracking-wide">Rejection Reason</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Common Issues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full max-w-xs mb-6"
      >
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Common Issues
        </p>
        <div className="space-y-2">
          {[
            "Receipt image was unclear or cropped",
            "Amount doesn't match the required payment",
            "Transaction reference not visible",
          ].map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2 text-left"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">{issue}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs space-y-3"
      >
        {/* Retry Button */}
        <motion.button
          onClick={handleTryAgain}
          className="group w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
            boxShadow: "0 12px 30px hsla(var(--violet), 0.35)",
          }}
          whileHover={{ boxShadow: "0 15px 40px hsla(var(--violet), 0.45)" }}
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </span>
        </motion.button>

        {/* Contact Support */}
        <motion.button
          onClick={() => window.open("https://t.me/creditbuzzadmin", "_blank", "noopener,noreferrer")}
          className="w-full py-3.5 rounded-2xl font-semibold text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "hsla(var(--secondary), 0.5)",
            border: "1px solid hsla(var(--border), 0.5)",
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </span>
        </motion.button>
      </motion.div>

      {/* Dashboard Link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate("/dashboard")}
        className="mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Return to Dashboard
      </motion.button>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex items-center gap-2 mt-8 text-muted-foreground/60"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-medium">
          Your Data Remains Secure
        </span>
      </motion.div>
    </motion.div>
  );
};

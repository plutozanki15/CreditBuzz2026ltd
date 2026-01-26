import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Sparkles, Shield } from "lucide-react";

export const PaymentApprovedView = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Success Animation Container */}
      <div className="relative mb-8">
        {/* Celebration particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? "hsl(var(--teal))" : "hsl(var(--gold))",
              top: "50%",
              left: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: Math.cos((i * 60 * Math.PI) / 180) * 80,
              y: Math.sin((i * 60 * Math.PI) / 180) * 80,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}

        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "hsl(var(--teal))",
            filter: "blur(30px)",
            opacity: 0.3,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* Main check circle */}
        <motion.div
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--teal)), hsla(var(--teal), 0.7))",
            boxShadow: "0 20px 40px hsla(var(--teal), 0.4)",
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="w-14 h-14 text-background" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-2 -right-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Sparkles className="w-6 h-6 text-gold" />
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Payment Approved!
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-muted-foreground max-w-xs mb-2"
      >
        Your ZFC has been credited to your account. You can now proceed to withdraw.
      </motion.p>

      {/* Amount Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="px-5 py-2 rounded-full mb-8"
        style={{
          background: "hsla(var(--teal), 0.1)",
          border: "1px solid hsla(var(--teal), 0.3)",
        }}
      >
        <span className="text-teal font-bold">₦180,000 ZFC Added</span>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate("/withdrawal")}
        className="group relative w-full max-w-xs py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--teal)), hsl(var(--violet)))",
          boxShadow: "0 12px 30px hsla(var(--teal), 0.35)",
        }}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
        
        <span className="relative flex items-center justify-center gap-2">
          Continue to Withdraw
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.span>
        </span>
      </motion.button>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-2 mt-8 text-muted-foreground/60"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">
          Transaction Verified • Secure
        </span>
      </motion.div>
    </motion.div>
  );
};

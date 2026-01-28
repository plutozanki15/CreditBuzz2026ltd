import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Sparkles, Shield, Star, TrendingUp, Wallet } from "lucide-react";

interface PaymentApprovedViewProps {
  onContinue?: () => void;
}

export const PaymentApprovedView = ({ onContinue }: PaymentApprovedViewProps) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    onContinue?.();
    navigate("/withdrawal-code");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
    >
      {/* Premium Header Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-teal/20 to-teal/10 border border-teal/40"
      >
        <span className="text-xs font-bold text-teal uppercase tracking-widest flex items-center gap-2">
          <Star className="w-3 h-3 fill-teal" />
          Transaction Complete
          <Star className="w-3 h-3 fill-teal" />
        </span>
      </motion.div>

      {/* Success Animation Container */}
      <div className="relative mb-10">
        {/* Celebration particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 3 === 0 ? "hsl(var(--teal))" : i % 3 === 1 ? "hsl(var(--gold))" : "hsl(var(--violet))",
              top: "50%",
              left: "50%",
              boxShadow: `0 0 10px ${i % 3 === 0 ? "hsl(var(--teal))" : i % 3 === 1 ? "hsl(var(--gold))" : "hsl(var(--violet))"}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos((i * 45 * Math.PI) / 180) * 90,
              y: Math.sin((i * 45 * Math.PI) / 180) * 90,
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 1.8,
              delay: 0.4,
              repeat: Infinity,
              repeatDelay: 2.5,
            }}
          />
        ))}

        {/* Outer decorative rings */}
        <motion.div
          className="absolute inset-[-25px] rounded-full border-2 border-dashed border-teal/20"
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: 360, scale: 1 }}
          transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5 } }}
        />

        {/* Outer glow */}
        <motion.div
          className="absolute inset-[-10px] rounded-full"
          style={{
            background: "hsl(var(--teal))",
            filter: "blur(35px)",
            opacity: 0.4,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1.6 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Main check circle */}
        <motion.div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--teal)), hsla(var(--teal), 0.8))",
            boxShadow: "0 25px 50px hsla(var(--teal), 0.45), inset 0 -5px 20px hsla(0, 0%, 0%, 0.2)",
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="w-16 h-16 text-background" strokeWidth={2} />
          </motion.div>
        </motion.div>

        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-3 -right-3"
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <Sparkles className="w-7 h-7 text-gold" />
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -left-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Sparkles className="w-5 h-5 text-violet" />
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold text-foreground mb-3 tracking-tight"
      >
        Payment Approved!
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-muted-foreground max-w-xs mb-4 leading-relaxed"
      >
        Your ZFC has been successfully credited to your wallet. You're now eligible to make withdrawals.
      </motion.p>

      {/* Amount Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="px-6 py-3 rounded-2xl mb-6"
        style={{
          background: "linear-gradient(135deg, hsla(var(--teal), 0.15), hsla(var(--teal), 0.05))",
          border: "1px solid hsla(var(--teal), 0.4)",
          boxShadow: "0 8px 30px hsla(var(--teal), 0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-teal" />
          <span className="text-teal font-bold text-lg">₦5,700</span>
          <motion.span
            className="text-xs text-teal/70 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Credited
          </motion.span>
        </div>
      </motion.div>

      {/* Benefits Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8"
      >
        {[
          { icon: TrendingUp, label: "Instant Earnings", desc: "Start earning now" },
          { icon: Shield, label: "Secure Wallet", desc: "Protected funds" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="p-4 rounded-xl bg-secondary/40 border border-border/40 text-left"
          >
            <item.icon className="w-5 h-5 text-teal mb-2" />
            <p className="text-xs font-semibold text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={handleContinue}
        className="group relative w-full max-w-xs py-4 rounded-2xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--teal)), hsl(var(--violet)))",
          boxShadow: "0 15px 35px hsla(var(--teal), 0.4)",
        }}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
        />
        
        <span className="relative flex items-center justify-center gap-3">
          Continue to Withdraw
          <motion.span
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.span>
        </span>
      </motion.button>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="flex items-center gap-2 mt-8 text-muted-foreground/60"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-medium">
          Verified Transaction • Funds Secured
        </span>
      </motion.div>
    </motion.div>
  );
};

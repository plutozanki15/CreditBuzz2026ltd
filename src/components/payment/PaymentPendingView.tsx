import { motion } from "framer-motion";
import { Clock, Shield, Loader2 } from "lucide-react";

export const PaymentPendingView = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Animated Processing Indicator */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--violet)) 100%)",
            filter: "blur(20px)",
            opacity: 0.4,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Main circle */}
        <motion.div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsla(var(--gold), 0.15), hsla(var(--violet), 0.15))",
            border: "2px solid hsla(var(--gold), 0.3)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-gold" />
          </motion.div>
        </motion.div>

        {/* Orbiting dot */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-violet"
          style={{ top: "50%", left: "50%" }}
          animate={{
            x: [0, 40, 0, -40, 0],
            y: [-40, 0, 40, 0, -40],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Status Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-4"
      >
        <Clock className="w-8 h-8 text-gold" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-foreground mb-2"
      >
        Payment Received
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground max-w-xs mb-6"
      >
        Your payment is being reviewed. You'll be notified instantly once confirmed.
      </motion.p>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: "hsla(var(--gold), 0.1)",
          border: "1px solid hsla(var(--gold), 0.2)",
        }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-gold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs font-semibold text-gold uppercase tracking-wider">
          Awaiting Admin Confirmation
        </span>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 mt-8 text-muted-foreground/60"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">
          Secure • Encrypted • Protected
        </span>
      </motion.div>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { Clock, Shield, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";

export const PaymentNotConfirmed = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold tracking-tight">Payment Status</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Verification in progress</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pt-8 pb-8 flex flex-col items-center">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-5 py-2.5 rounded-full bg-gradient-to-r from-gold/20 to-amber-500/10 border border-gold/40"
        >
          <span className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        </motion.div>

        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mb-8"
        >
          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-[-25px] rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold)), hsla(45, 93%, 62%, 0.5))",
              filter: "blur(40px)",
            }}
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Main circle */}
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsla(45, 93%, 62%, 0.15), hsla(45, 93%, 62%, 0.05))",
              border: "2px solid hsla(45, 93%, 62%, 0.4)",
              boxShadow: "0 20px 50px hsla(45, 93%, 62%, 0.2)",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="w-12 h-12 text-gold" />
            </motion.div>
          </div>
        </motion.div>

        {/* Status Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-gold" />
            Payment Not Confirmed
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Your activation payment is yet to be confirmed.
            Please wait while we verify your transaction.
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm mb-8"
        >
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "hsla(240, 7%, 8%, 0.85)",
              border: "1px solid hsla(45, 93%, 62%, 0.2)",
              boxShadow: "0 15px 50px hsla(0, 0%, 0%, 0.3)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: "hsla(45, 93%, 62%, 0.15)" }}
                >
                  <Clock className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Verification in Progress</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Our system is currently verifying your payment. This usually takes a few minutes.
                  </p>
                </div>
              </div>

              <div className="h-px bg-border/30" />

              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: "hsla(var(--violet), 0.15)" }}
                >
                  <Shield className="w-4 h-4 text-violet" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Secure Processing</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Your transaction is protected. You'll be notified once verification is complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-gold"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm text-muted-foreground">Awaiting confirmation...</span>
        </motion.div>

        {/* Back to Dashboard Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleBackToDashboard}
          className="w-full max-w-sm py-4 rounded-2xl font-display font-semibold text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: "hsla(0, 0%, 100%, 0.06)",
            border: "1px solid hsla(0, 0%, 100%, 0.1)",
          }}
        >
          <span>Back to Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
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

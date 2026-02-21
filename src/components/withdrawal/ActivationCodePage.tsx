import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Copy, Check, Shield, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { toast } from "@/hooks/use-toast";

interface ActivationCodePageProps {
  activationCode: string;
  onProceed: () => void;
}

export const ActivationCodePage = ({ activationCode, onProceed }: ActivationCodePageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activationCode);
    setCopied(true);
    toast({
      title: "Code copied successfully",
      description: "Keep this code safe for the activation process",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold tracking-tight">Withdrawal Activation</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Secure • Verified • Protected</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pt-6 pb-8 flex flex-col items-center">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-gold/20 to-violet/10 border border-gold/40"
        >
          <span className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Activation Required
          </span>
        </motion.div>

        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mb-6"
        >
          {/* Glow effect */}
          <div
            className="absolute inset-[-20px] rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--violet)))",
              filter: "blur(35px)",
              opacity: 0.35,
            }}
          />

          {/* Rotating ring */}
          <motion.div
            className="absolute inset-[-12px] rounded-full border-2 border-dashed border-gold/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Main circle */}
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--violet)))",
              boxShadow: "0 20px 50px hsla(37, 89%, 63%, 0.4)",
            }}
          >
            <Lock className="w-10 h-10 text-white" />
          </div>

          {/* Sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Sparkles className="w-6 h-6 text-gold" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-display font-bold text-foreground mb-3 text-center"
        >
          Withdrawal Activation Required
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mb-6 text-center max-w-xs leading-relaxed"
        >
          To complete your withdrawal, you must activate your withdrawal code. 
          This is a one-time security verification to protect your funds.
        </motion.p>

        {/* Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mb-6"
        >
          <div
            className="relative p-6 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsla(45, 93%, 62%, 0.12), hsla(262, 76%, 57%, 0.08))",
              border: "1px solid hsla(45, 93%, 62%, 0.35)",
              boxShadow: "0 20px 60px hsla(45, 93%, 62%, 0.15)",
            }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(var(--background), var(--background)), linear-gradient(90deg, hsl(var(--gold)), hsl(var(--violet)), hsl(var(--teal)), hsl(var(--gold)))",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                backgroundSize: "400% 100%",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                Your Activation Code
              </p>

              <div className="flex items-center justify-between gap-4">
                <motion.code
                  className="flex-1 text-3xl font-mono font-bold text-foreground tracking-[0.25em] text-center"
                  animate={{ opacity: [1, 0.85, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {activationCode}
                </motion.code>

                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl transition-all"
                  style={{
                    background: copied ? "hsla(var(--teal), 0.2)" : "hsla(var(--gold), 0.2)",
                    border: copied ? "1px solid hsla(var(--teal), 0.5)" : "1px solid hsla(var(--gold), 0.4)",
                  }}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-teal" />
                  ) : (
                    <Copy className="w-5 h-5 text-gold" />
                  )}
                </motion.button>
              </div>

              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-teal mt-3 text-center font-medium"
                >
                  ✓ Copied to clipboard
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mb-8 p-4 rounded-xl bg-secondary/40 border border-border/40"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Bank-Grade Security</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your activation code is unique to this withdrawal request. 
                Keep it confidential and do not share with anyone.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Proceed Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onProceed}
          className="group relative w-full max-w-sm py-4 rounded-2xl font-display font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
            boxShadow: "0 15px 40px hsla(262, 76%, 57%, 0.4)",
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
            Proceed to Activation
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
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
            Secured by CreditBuzz • 256-bit SSL
          </span>
        </motion.div>
      </main>
    </div>
  );
};

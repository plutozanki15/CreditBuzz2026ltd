import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Lock, Shield, Sparkles, Wallet, ArrowRight, Loader2 } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const WithdrawalCode = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [zfcCode, setZfcCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchZfcCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("zfc_code")
        .eq("user_id", user.id)
        .single();

      if (profile?.zfc_code) {
        setZfcCode(profile.zfc_code);
      }
      setIsLoading(false);
    };

    fetchZfcCode();
  }, [navigate]);

  const handleCopy = async () => {
    if (!zfcCode) return;
    await navigator.clipboard.writeText(zfcCode);
    setCopied(true);
    toast({
      title: "Code copied successfully",
      description: "You can now paste it on the withdrawal page",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet" />
      </div>
    );
  }

  if (!zfcCode) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingParticles />
        <header className="relative z-10 px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-semibold tracking-tight">Withdrawal Code</h1>
          </div>
          <ZenfiLogo size="sm" />
        </header>
        <main className="relative z-10 px-4 pt-20 flex flex-col items-center text-center">
          <Lock className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No CBC Code Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            You need to purchase a CBC code to enable withdrawals.
          </p>
          <button
            onClick={() => navigate("/buy-zfc")}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
            }}
          >
            Buy CBC Code
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold tracking-tight">Withdrawal Code</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Secure • Encrypted • Protected</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pt-6 pb-8 flex flex-col items-center">
        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-5 py-2 rounded-full bg-gradient-to-r from-violet/20 to-magenta/10 border border-violet/40"
        >
          <span className="text-xs font-bold text-violet uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Verified Activation
            <Lock className="w-3 h-3" />
          </span>
        </motion.div>

        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mb-8"
        >
          {/* Glow effect */}
          <div
            className="absolute inset-[-15px] rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
              filter: "blur(30px)",
              opacity: 0.4,
            }}
          />

          {/* Rotating ring */}
          <motion.div
            className="absolute inset-[-10px] rounded-full border-2 border-dashed border-violet/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Main circle */}
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
              boxShadow: "0 20px 40px hsla(var(--violet), 0.4)",
            }}
          >
            <Lock className="w-10 h-10 text-white" />
          </div>

          {/* Sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
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
          className="text-2xl font-bold text-foreground mb-2 text-center"
        >
          🔐 Your CBC Withdrawal Code
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mb-8 text-center max-w-xs"
        >
          Copy this code to complete your withdrawal request. Keep it confidential.
        </motion.p>

        {/* Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mb-8"
        >
          <div
            className="relative p-6 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsla(262, 76%, 57%, 0.15), hsla(289, 100%, 65%, 0.1))",
              border: "1px solid hsla(262, 76%, 57%, 0.4)",
              boxShadow: "0 15px 50px hsla(262, 76%, 57%, 0.2)",
            }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(var(--background), var(--background)), linear-gradient(90deg, hsl(var(--violet)), hsl(var(--magenta)), hsl(var(--teal)), hsl(var(--violet)))",
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
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-medium">
                Your Secure Code
              </p>

              <div className="flex items-center justify-between gap-4">
                <motion.code
                  className="flex-1 text-3xl font-mono font-bold text-foreground tracking-[0.3em] text-center"
                  animate={{ opacity: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {zfcCode}
                </motion.code>

                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl transition-all"
                  style={{
                    background: copied
                      ? "hsla(var(--teal), 0.2)"
                      : "hsla(262, 76%, 57%, 0.2)",
                    border: copied
                      ? "1px solid hsla(var(--teal), 0.5)"
                      : "1px solid hsla(262, 76%, 57%, 0.4)",
                  }}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-teal" />
                  ) : (
                    <Copy className="w-5 h-5 text-violet" />
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

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8"
        >
          {[
            { icon: Shield, label: "Bank-Grade Security", desc: "256-bit encryption" },
            { icon: Wallet, label: "Instant Processing", desc: "Real-time transfer" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-secondary/40 border border-border/40"
            >
              <item.icon className="w-5 h-5 text-violet mb-2" />
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate("/withdrawal")}
          className="group relative w-full max-w-sm py-4 rounded-2xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
            boxShadow: "0 15px 40px hsla(var(--violet), 0.4)",
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
            <Wallet className="w-5 h-5" />
            Proceed to Withdrawal
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </span>
        </motion.button>

        {/* Security Footer */}
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

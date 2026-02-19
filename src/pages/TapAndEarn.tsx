import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, HandCoins } from "lucide-react";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const MAX_ENERGY = 100;
const EARN_PER_TAP = 20;
const ENERGY_REGEN_MS = 3000; // 1 energy every 3 seconds
const STORAGE_KEY = "tap_earn_state";

interface TapParticle {
  id: number;
  x: number;
  y: number;
}

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { energy: MAX_ENERGY, earned: 0, lastTime: Date.now() };
    const s = JSON.parse(raw);
    // Regen energy based on time away
    const elapsed = Date.now() - (s.lastTime || Date.now());
    const regen = Math.floor(elapsed / ENERGY_REGEN_MS);
    const energy = Math.min(MAX_ENERGY, (s.energy || 0) + regen);
    return { energy, earned: s.earned || 0, lastTime: Date.now() };
  } catch {
    return { energy: MAX_ENERGY, earned: 0, lastTime: Date.now() };
  }
};

export const TapAndEarn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState(loadState);
  const [particles, setParticles] = useState<TapParticle[]>([]);
  const [tapping, setTapping] = useState(false);
  const particleId = useRef(0);
  const syncTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastTime: Date.now() }));
  }, [state]);

  // Energy regen timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.energy >= MAX_ENERGY) return prev;
        return { ...prev, energy: Math.min(MAX_ENERGY, prev.energy + 1) };
      });
    }, ENERGY_REGEN_MS);
    return () => clearInterval(interval);
  }, []);

  // Debounced sync to DB
  const syncToDb = useCallback((amount: number) => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      if (!user?.id) return;
      const { data } = await supabase.from("profiles").select("balance").eq("user_id", user.id).single();
      if (data) {
        await supabase.from("profiles").update({ balance: Number(data.balance) + amount }).eq("user_id", user.id);
      }
    }, 1500);
  }, [user?.id]);

  const pendingSync = useRef(0);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (state.energy <= 0) {
      toast({ title: "No energy!", description: "Wait for energy to recharge", variant: "destructive" });
      return;
    }

    // Get position for particle
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const id = particleId.current++;
    setParticles(prev => [...prev, { id, x: clientX - rect.left, y: clientY - rect.top }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800);

    setTapping(true);
    setTimeout(() => setTapping(false), 100);

    setState(prev => ({
      ...prev,
      energy: prev.energy - 1,
      earned: prev.earned + EARN_PER_TAP,
    }));

    pendingSync.current += EARN_PER_TAP;
    syncToDb(pendingSync.current);
  }, [state.energy, syncToDb]);

  const energyPercent = (state.energy / MAX_ENERGY) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <h1 className="text-lg font-display font-semibold tracking-tight">Tap & Earn</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Tap the orb to earn ₦{EARN_PER_TAP} per tap</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      {/* Balance display */}
      <div className="relative z-10 px-4 mb-2">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: "hsla(174, 88%, 56%, 0.12)",
            border: "1px solid hsla(174, 88%, 56%, 0.25)",
          }}
        >
          <HandCoins className="w-4 h-4 text-teal" />
          <span className="font-display font-bold text-sm">
            ₦{state.earned.toLocaleString()}.00
          </span>
        </div>
      </div>

      {/* Main tap area */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4">
        <div className="relative">
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: tapping
                ? "0 0 60px 20px hsla(174, 88%, 56%, 0.4), 0 0 120px 40px hsla(174, 88%, 56%, 0.15)"
                : "0 0 40px 10px hsla(174, 88%, 56%, 0.2), 0 0 80px 20px hsla(174, 88%, 56%, 0.08)",
            }}
            transition={{ duration: 0.15 }}
            style={{ margin: "-20px" }}
          />

          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-teal/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ margin: "-15px" }}
          />

          {/* The orb */}
          <motion.button
            onClick={handleTap}
            onTouchStart={handleTap}
            className="relative w-48 h-48 rounded-full cursor-pointer select-none outline-none border-none"
            style={{
              background: state.energy > 0
                ? "radial-gradient(circle at 40% 35%, hsla(174, 88%, 76%, 1), hsla(174, 88%, 56%, 0.9) 50%, hsla(160, 80%, 40%, 0.8) 100%)"
                : "radial-gradient(circle at 40% 35%, hsla(0, 0%, 50%, 0.6), hsla(0, 0%, 30%, 0.8) 100%)",
              boxShadow: state.energy > 0
                ? "inset 0 -8px 20px hsla(174, 88%, 30%, 0.5), inset 0 4px 15px hsla(174, 88%, 80%, 0.4)"
                : "inset 0 -8px 20px hsla(0, 0%, 15%, 0.5)",
            }}
            whileTap={{ scale: 0.92 }}
            animate={{ scale: tapping ? 0.92 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {/* Shine effect */}
            <div
              className="absolute top-4 left-8 w-16 h-8 rounded-full opacity-40"
              style={{
                background: "linear-gradient(180deg, hsla(0, 0%, 100%, 0.7), transparent)",
                filter: "blur(6px)",
              }}
            />

            {/* Dollar icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <HandCoins className="w-12 h-12 text-background/70" strokeWidth={1.5} />
              </motion.div>
            </div>

            {/* Tap particles */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute pointer-events-none font-display font-bold text-teal text-sm"
                  initial={{ x: p.x - 20, y: p.y - 10, opacity: 1, scale: 0.8 }}
                  animate={{ y: p.y - 60, opacity: 0, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  +₦{EARN_PER_TAP}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Energy bar */}
      <div className="relative z-10 px-4 pb-8 pt-4">
        <div
          className="p-4 rounded-2xl space-y-3"
          style={{
            background: "hsla(240, 7%, 8%, 0.8)",
            border: "1px solid hsla(0, 0%, 100%, 0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-sm text-muted-foreground font-medium">Energy</span>
            </div>
            <span className="font-display font-bold text-sm">
              {state.energy} / {MAX_ENERGY}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-secondary/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: energyPercent > 30
                  ? "linear-gradient(90deg, hsl(var(--teal)), hsl(var(--teal)))"
                  : energyPercent > 10
                  ? "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold)))"
                  : "linear-gradient(90deg, hsl(0, 70%, 55%), hsl(0, 70%, 55%))",
              }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Earning Rate: <span className="text-teal font-semibold">₦{EARN_PER_TAP}.00</span> per tap
          </p>
        </div>
      </div>
    </div>
  );
};

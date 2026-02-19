import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Zap, 
  HandCoins, 
  Sparkles, 
  TrendingUp, 
  Crown,
  Star,
  CircleDollarSign
} from "lucide-react";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MAX_ENERGY = 100;
const EARN_PER_TAP = 20;
const ENERGY_REGEN_MS = 60000; // 1 minute per energy unit
const STORAGE_KEY = "tap_earn_state";

interface TapParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const TAP_EMOJIS = ["💰", "⚡", "✨", "💎", "🔥"];

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { energy: MAX_ENERGY, earned: 0, lastTime: Date.now() };
    const s = JSON.parse(raw);
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
  const [tapCount, setTapCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const particleId = useRef(0);
  const syncTimeout = useRef<ReturnType<typeof setTimeout>>();
  const pendingSync = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastTime: Date.now() }));
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.energy >= MAX_ENERGY) return prev;
        return { ...prev, energy: Math.min(MAX_ENERGY, prev.energy + 1) };
      });
    }, ENERGY_REGEN_MS);
    return () => clearInterval(interval);
  }, []);

  const syncToDb = useCallback((amount: number) => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      if (!user?.id) return;
      const { data } = await supabase.from("profiles").select("balance").eq("user_id", user.id).single();
      if (data) {
        await supabase.from("profiles").update({ balance: Number(data.balance) + amount }).eq("user_id", user.id);
        pendingSync.current = 0;
      }
    }, 1500);
  }, [user?.id]);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (state.energy <= 0) {
      setShowPrompt(true);
      return;
    }

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
    const emoji = TAP_EMOJIS[id % TAP_EMOJIS.length];
    setParticles(prev => [...prev, { id, x: clientX - rect.left, y: clientY - rect.top, emoji }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 900);

    setTapping(true);
    setTapCount(prev => prev + 1);
    setTimeout(() => setTapping(false), 120);

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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <FloatingParticles />

      {/* Header */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 px-4 py-4 flex items-center gap-4"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold tracking-tight gradient-text">Tap & Earn</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold" />
            ₦{EARN_PER_TAP} per tap
          </p>
        </div>
        <ZenfiLogo size="sm" />
      </motion.header>

      {/* Stats Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 px-4 mb-4 grid grid-cols-3 gap-2"
      >
        <div className="glass-card p-3 text-center">
          <CircleDollarSign className="w-4 h-4 text-violet mx-auto mb-1" />
          <p className="text-sm font-display font-bold">₦{state.earned.toLocaleString()}</p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Earned</p>
        </div>
        <div className="glass-card p-3 text-center">
          <TrendingUp className="w-4 h-4 text-magenta mx-auto mb-1" />
          <p className="text-sm font-display font-bold">{tapCount}</p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Taps</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Crown className="w-4 h-4 text-gold mx-auto mb-1" />
          <p className="text-sm font-display font-bold">₦{EARN_PER_TAP}</p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Per Tap</p>
        </div>
      </motion.div>

      {/* Main tap area */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4">
        <div className="relative">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: "-30px",
              border: "2px dashed hsla(262, 76%, 57%, 0.2)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Mid rotating ring (reverse) */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: "-18px",
              border: "1px solid hsla(289, 100%, 65%, 0.15)",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: tapping
                ? [
                    "0 0 60px 25px hsla(262, 76%, 57%, 0.5), 0 0 120px 50px hsla(289, 100%, 65%, 0.2)",
                    "0 0 80px 35px hsla(289, 100%, 65%, 0.4), 0 0 140px 60px hsla(262, 76%, 57%, 0.15)",
                  ]
                : "0 0 40px 12px hsla(262, 76%, 57%, 0.25), 0 0 80px 25px hsla(289, 100%, 65%, 0.1)",
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Breathing pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid hsla(262, 76%, 57%, 0.3)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Second pulse ring offset */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "1px solid hsla(289, 100%, 65%, 0.2)" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />

          {/* The orb */}
          <motion.button
            onClick={handleTap}
            className="relative w-52 h-52 rounded-full cursor-pointer select-none outline-none border-none"
            style={{
              background: state.energy > 0
                ? "radial-gradient(circle at 38% 32%, hsla(289, 100%, 80%, 0.9), hsl(var(--violet)) 45%, hsla(262, 76%, 35%, 0.95) 100%)"
                : "radial-gradient(circle at 38% 32%, hsla(0, 0%, 45%, 0.6), hsla(0, 0%, 25%, 0.8) 100%)",
              boxShadow: state.energy > 0
                ? "inset 0 -10px 25px hsla(262, 50%, 20%, 0.6), inset 0 5px 20px hsla(289, 100%, 75%, 0.3)"
                : "inset 0 -8px 20px hsla(0, 0%, 10%, 0.5)",
            }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: tapping ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {/* Glass shine */}
            <div
              className="absolute top-5 left-10 w-20 h-10 rounded-full opacity-30"
              style={{
                background: "linear-gradient(180deg, hsla(0, 0%, 100%, 0.8), transparent)",
                filter: "blur(8px)",
              }}
            />

            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ opacity: 0.15 }}
            >
              <motion.div
                className="absolute w-full h-full"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.6) 50%, transparent 60%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
            </motion.div>

            {/* Center icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <motion.div
                animate={{ y: [0, -4, 0], rotateZ: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <HandCoins className="w-14 h-14 text-primary-foreground/80" strokeWidth={1.5} />
              </motion.div>
              <motion.span
                className="text-xs font-display font-bold text-primary-foreground/60 uppercase tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                TAP
              </motion.span>
            </div>

            {/* Orbiting stars */}
            {[0, 120, 240].map((deg, i) => (
              <motion.div
                key={deg}
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
              >
                <Star
                  className="text-gold/40"
                  size={10}
                  fill="currentColor"
                  style={{
                    transform: `rotate(${deg}deg) translateX(${90 + i * 8}px) rotate(-${deg}deg)`,
                  }}
                />
              </motion.div>
            ))}

            {/* Tap particles */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute pointer-events-none flex flex-col items-center"
                  initial={{ x: p.x - 24, y: p.y - 12, opacity: 1, scale: 0.6 }}
                  animate={{ y: p.y - 70, opacity: 0, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <span className="font-display font-black text-sm gradient-text">+₦{EARN_PER_TAP}</span>
                  <span className="text-xs">{p.emoji}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Energy bar section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 px-4 pb-8 pt-4"
      >
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-gold" fill="currentColor" />
              </motion.div>
              <span className="text-sm text-muted-foreground font-medium">Energy</span>
            </div>
            <span className="font-display font-bold text-sm">
              <span className={state.energy <= 10 ? "text-destructive" : state.energy <= 30 ? "text-gold" : "text-violet"}>
                {state.energy}
              </span>
              <span className="text-muted-foreground"> / {MAX_ENERGY}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-secondary/60 overflow-hidden relative">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: energyPercent > 30
                  ? "linear-gradient(90deg, hsl(var(--violet)), hsl(var(--magenta)))"
                  : energyPercent > 10
                  ? "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold)))"
                  : "linear-gradient(90deg, hsl(0, 70%, 55%), hsl(0, 50%, 45%))",
              }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {/* Shimmer on bar */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.3) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Earning Rate: <span className="text-violet font-semibold">₦{EARN_PER_TAP}.00</span> per tap
            </p>
            {state.energy < MAX_ENERGY && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-gold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Recharging...
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* No Energy Prompt */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="glass-card border-violet/30 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-display gradient-text">
              <Zap className="w-5 h-5 text-gold" /> Energy Depleted!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-2">
              You've used all your taps. Recharge by completing tasks or join our channel while you wait!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.open("https://t.me/zenaboraofficial", "_blank", "noopener,noreferrer");
                setShowPrompt(false);
              }}
              className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-wide text-primary-foreground flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))" }}
            >
              <Sparkles className="w-4 h-4" /> Join Our Channel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowPrompt(false);
                navigate("/dashboard", { state: { openTasks: true } });
              }}
              className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-wide border border-violet/30 text-violet flex items-center justify-center gap-2 hover:bg-violet/10 transition-colors"
            >
              <Star className="w-4 h-4" /> Complete Tasks
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

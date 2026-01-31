import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, CreditCard, Wifi, Play, Users, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VirtualBankCardProps {
  balance: number;
  cardNumber?: string;
  className?: string;
  userId?: string;
  referralCount?: number;
  isLoading?: boolean;
}

const WELCOME_START = 320000;
const DEDUCT_TARGET = 180000;

export const VirtualBankCard = ({
  balance = 130000,
  cardNumber = "4829",
  className,
  userId = "ZF-7829401",
  referralCount = 3,
  isLoading = false,
}: VirtualBankCardProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(WELCOME_START);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showWithdrawNotification, setShowWithdrawNotification] = useState(false);
  const hasStartedCountdown = useRef(false);
  const prevBalanceRef = useRef(balance);

  // Deduct animation: 320k -> 180k (runs once on mount and stops at 180k)
  useEffect(() => {
    if (!hasStartedCountdown.current) {
      hasStartedCountdown.current = true;
      setIsCountingDown(true);
      prevBalanceRef.current = WELCOME_START;

      let intervalId: number | null = null;
      
      // Show 320k first for a moment, then show notification and start deduction
      const startDelay = window.setTimeout(() => {
        // Show withdrawal notification
        setShowWithdrawNotification(true);
        
        // Hide notification after 6 seconds
        window.setTimeout(() => {
          setShowWithdrawNotification(false);
        }, 6000);

        const durationMs = 2800; // fast but not too fast
        const steps = 120;
        const stepMs = Math.max(10, Math.floor(durationMs / steps));
        const stepAmount = Math.max(1, Math.ceil((WELCOME_START - DEDUCT_TARGET) / steps));

        intervalId = window.setInterval(() => {
          setDisplayBalance((prev) => {
            const next = Math.max(DEDUCT_TARGET, prev - stepAmount);

            if (next === DEDUCT_TARGET) {
              if (intervalId !== null) window.clearInterval(intervalId);
              prevBalanceRef.current = DEDUCT_TARGET;
              setIsCountingDown(false);
              setIsGlowing(true);
              window.setTimeout(() => setIsGlowing(false), 800);
            }

            return next;
          });
        }, stepMs);
      }, 400);

      return () => {
        window.clearTimeout(startDelay);
        if (intervalId !== null) window.clearInterval(intervalId);
      };
    }
  }, []);

  // Regular balance update animation (after countdown is done)
  useEffect(() => {
    // Prevent the backend "0" hydration value from overriding the 180k stop.
    if (!isCountingDown && !isLoading && balance > 0 && hasStartedCountdown.current && balance !== prevBalanceRef.current) {
      const diff = balance - prevBalanceRef.current;
      const startValue = prevBalanceRef.current;
      const duration = 400;
      const steps = 20;
      let step = 0;
      
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 600);
      
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (diff * easeOut);
        
        if (step >= steps) {
          setDisplayBalance(balance);
          clearInterval(timer);
        } else {
          setDisplayBalance(Math.floor(currentValue));
        }
      }, duration / steps);

      prevBalanceRef.current = balance;
      return () => clearInterval(timer);
    }
  }, [balance, isCountingDown, isLoading]);

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {/* Withdrawal Notification Banner */}
      <AnimatePresence>
        {showWithdrawNotification && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-20 left-4 right-4 z-[100] max-w-[380px] mx-auto"
          >
            <div
              className="relative overflow-hidden rounded-xl border p-3"
              style={{
                background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary)))",
                borderColor: "hsl(var(--destructive))",
                boxShadow: "0 8px 32px hsla(0, 70%, 50%, 0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--destructive)), hsl(0, 60%, 40%))",
                  }}
                >
                  <ArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-destructive">
                    💸 Withdrawal Processing
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    -₦{(WELCOME_START - DEDUCT_TARGET).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Deducting from your balance...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "bank-card p-4 animate-card-float hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200",
          className
        )}
      >
        {/* Card Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, hsla(262, 76%, 57%, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsla(289, 100%, 65%, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Top Row - Chip, Wifi & Watch Video */}
      <div className="relative flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Chip */}
          <div 
            className="w-9 h-7 rounded-md flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, hsl(37, 70%, 60%), hsl(37, 60%, 45%))",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <div className="w-5 h-4 rounded-sm border border-amber-600/40 grid grid-cols-3 gap-px p-0.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-amber-700/50 rounded-[1px]" />
              ))}
            </div>
          </div>
          <Wifi className="w-4 h-4 text-gold rotate-90" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Watch Video Button */}
          <button 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet/20 hover:bg-violet/30 active:scale-95 transition-all duration-200"
            onClick={() => {}}
          >
            <Play className="w-3 h-3 text-violet fill-violet" />
            <span className="text-[9px] font-medium text-violet">Watch</span>
          </button>
          <span className="text-xs font-bold tracking-wider gradient-text">
            ZENFI
          </span>
        </div>
      </div>

      {/* Balance Section - Shifted Up */}
      <div className="relative mb-2">
        <p className="text-muted-foreground/70 text-[10px] uppercase tracking-wider mb-0.5">
          Available Balance
        </p>
        <div className="flex items-center gap-2">
          <h2 
            className={cn(
              "text-2xl font-bold text-foreground transition-all duration-300",
              isGlowing && "scale-[1.02]",
              isLoading && "opacity-70"
            )}
            style={{
              textShadow: isGlowing 
                ? "0 0 40px hsla(174, 88%, 56%, 0.6), 0 0 20px hsla(262, 76%, 57%, 0.4)" 
                : "0 0 30px hsla(262, 76%, 57%, 0.3)",
            }}
          >
            {isHidden ? "••••••••" : formatBalance(displayBalance)}
          </h2>
          <button
            onClick={() => setIsHidden(!isHidden)}
            className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary active:scale-90 transition-all duration-200"
            disabled={isLoading}
          >
            {isHidden ? (
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-teal" />
            )}
          </button>
        </div>
      </div>

      {/* Card Number & User ID */}
      <div className="relative flex items-center justify-between mb-2">
        <div>
          <p className="text-muted-foreground/50 text-[10px] tracking-widest font-medium">
            •••• •••• •••• {cardNumber}
          </p>
          <p className="text-muted-foreground/40 text-[9px] mt-0.5">
            ID: {userId}
          </p>
        </div>
        <CreditCard className="w-6 h-6 text-violet/40" />
      </div>

      {/* Referral Count */}
      <div className="relative flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal/10">
          <Users className="w-3 h-3 text-teal" />
          <span className="text-[9px] font-medium text-teal">{referralCount} Referrals</span>
        </div>
      </div>

      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
      >
        <div 
          className="absolute -inset-full animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent, hsla(262, 76%, 57%, 0.1), transparent)",
          }}
        />
      </div>

      {/* Glow overlay on balance update */}
      {isGlowing && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
          style={{
            background: "radial-gradient(circle at 30% 40%, hsla(174, 88%, 56%, 0.15) 0%, transparent 60%)",
          }}
        />
      )}

      {/* Security Text */}
      <div className="absolute bottom-2 right-4">
        <p className="text-[8px] text-muted-foreground/40 tracking-wide">
          🔒 Secured
        </p>
      </div>
      </div>
    </>
  );
};

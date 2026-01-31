import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, CreditCard, Wifi, Play, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualBankCardProps {
  balance: number;
  cardNumber?: string;
  className?: string;
  userId?: string;
  referralCount?: number;
  isLoading?: boolean;
}

const WELCOME_START = 320000;

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
  const hasStartedCountdown = useRef(false);
  const prevBalanceRef = useRef(balance);

  // Countdown animation: 320k -> actual balance (runs once on mount when balance is ready)
  useEffect(() => {
    if (balance > 0 && !isLoading && !hasStartedCountdown.current) {
      hasStartedCountdown.current = true;
      setIsCountingDown(true);
      
      // Show 320k first for a moment
      setTimeout(() => {
        const duration = 2500; // 2.5 seconds
        const startTime = Date.now();
        const targetBalance = balance;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease-out curve for smooth deceleration
          const easeOut = 1 - Math.pow(1 - progress, 2);
          
          // Decrease from 320k down to target balance
          const current = Math.floor(WELCOME_START - ((WELCOME_START - targetBalance) * easeOut));
          setDisplayBalance(current);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayBalance(targetBalance);
            setIsCountingDown(false);
            setIsGlowing(true);
            setTimeout(() => setIsGlowing(false), 800);
          }
        };
        
        requestAnimationFrame(animate);
      }, 400);
    }
  }, [balance, isLoading]);

  // Regular balance update animation (after countdown is done)
  useEffect(() => {
    if (!isCountingDown && hasStartedCountdown.current && balance !== prevBalanceRef.current) {
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
  }, [balance, isCountingDown]);

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
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
          {isLoading ? (
            <div className="h-8 w-32 bg-muted/50 rounded-lg animate-pulse" />
          ) : (
            <h2 
              className={cn(
                "text-2xl font-bold text-foreground transition-all duration-300",
                isGlowing && "scale-[1.02]"
              )}
              style={{
                textShadow: isGlowing 
                  ? "0 0 40px hsla(174, 88%, 56%, 0.6), 0 0 20px hsla(262, 76%, 57%, 0.4)" 
                  : "0 0 30px hsla(262, 76%, 57%, 0.3)",
              }}
            >
              {isHidden ? "••••••••" : formatBalance(displayBalance)}
            </h2>
          )}
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
  );
};

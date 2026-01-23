import { useState, useEffect } from "react";
import { Eye, EyeOff, CreditCard, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualBankCardProps {
  balance: number;
  cardNumber?: string;
  className?: string;
}

export const VirtualBankCard = ({ 
  balance = 180000, 
  cardNumber = "4829",
  className 
}: VirtualBankCardProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Count-up animation
  useEffect(() => {
    if (isAnimating && !isHidden) {
      const duration = 1500;
      const steps = 60;
      const increment = balance / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= balance) {
          setDisplayBalance(balance);
          clearInterval(timer);
          setIsAnimating(false);
        } else {
          setDisplayBalance(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [balance, isAnimating, isHidden]);

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
        "bank-card p-5 animate-card-float",
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

      {/* Top Row - Chip & Wifi */}
      <div className="relative flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {/* Chip */}
          <div 
            className="w-10 h-8 rounded-md flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, hsl(37, 70%, 60%), hsl(37, 60%, 45%))",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <div className="w-6 h-5 rounded-sm border border-amber-600/40 grid grid-cols-3 gap-px p-0.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-amber-700/50 rounded-[1px]" />
              ))}
            </div>
          </div>
          <Wifi className="w-5 h-5 text-gold rotate-90" />
        </div>
        
        <span className="text-sm font-bold tracking-wider gradient-text">
          ZENFI
        </span>
      </div>

      {/* Card Number */}
      <div className="relative mb-6">
        <p className="text-muted-foreground/60 text-xs tracking-widest font-medium">
          •••• •••• •••• {cardNumber}
        </p>
      </div>

      {/* Balance Section */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground/70 text-xs uppercase tracking-wider mb-1">
              Available Balance
            </p>
            <div className="flex items-center gap-3">
              <h2 
                className="text-3xl font-bold text-foreground animate-count-up"
                style={{
                  textShadow: "0 0 30px hsla(262, 76%, 57%, 0.3)",
                }}
              >
                {isHidden ? "••••••••" : formatBalance(displayBalance)}
              </h2>
              <button
                onClick={() => {
                  setIsHidden(!isHidden);
                  if (isHidden) {
                    setIsAnimating(true);
                    setDisplayBalance(0);
                  }
                }}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {isHidden ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-teal" />
                )}
              </button>
            </div>
          </div>
          
          <CreditCard className="w-8 h-8 text-violet/50" />
        </div>
      </div>

      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
      >
        <div 
          className="absolute -inset-full animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent, hsla(262, 76%, 57%, 0.08), transparent)",
          }}
        />
      </div>

      {/* Security Text */}
      <div className="absolute bottom-3 right-6">
        <p className="text-[10px] text-muted-foreground/40 tracking-wide">
          Secured & encrypted
        </p>
      </div>
    </div>
  );
};

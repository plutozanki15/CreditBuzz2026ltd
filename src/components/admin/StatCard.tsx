import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "violet" | "teal" | "gold" | "red";
  delay?: number;
  onClick?: () => void;
}

const colorMap = {
  violet: {
    bg: "bg-violet/10",
    border: "border-violet/30",
    text: "text-violet",
    glow: "shadow-violet/20",
  },
  teal: {
    bg: "bg-teal/10",
    border: "border-teal/30",
    text: "text-teal",
    glow: "shadow-teal/20",
  },
  gold: {
    bg: "bg-gold/10",
    border: "border-gold/30",
    text: "text-gold",
    glow: "shadow-gold/20",
  },
  red: {
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    text: "text-red-400",
    glow: "shadow-red-400/20",
  },
};

export const StatCard = ({ title, value, icon: Icon, color, delay = 0, onClick }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorMap[color];

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl ${colors.bg} border ${colors.border} backdrop-blur-xl shadow-lg ${colors.glow} overflow-hidden ${onClick ? "cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform" : ""}`}
    >
      {/* Glow effect */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 ${colors.bg} rounded-full blur-2xl opacity-50`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          {onClick && (
            <span className={`text-[9px] font-semibold ${colors.text} opacity-70`}>tap to view →</span>
          )}
        </div>
        
        <motion.div
          key={displayValue}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.2 }}
          className={`text-3xl font-bold ${colors.text} mb-1`}
        >
          {displayValue.toLocaleString()}
        </motion.div>
        
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

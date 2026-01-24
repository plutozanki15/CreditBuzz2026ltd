import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  animationType?: "pulse" | "bounce" | "spin" | "float" | "glow";
}

export const AnimatedIcon = ({ 
  icon: Icon, 
  className, 
  animationType = "pulse" 
}: AnimatedIconProps) => {
  const animationClasses = {
    pulse: "animate-icon-pulse",
    bounce: "animate-icon-bounce",
    spin: "animate-icon-spin",
    float: "animate-icon-float",
    glow: "animate-icon-glow",
  };

  return (
    <>
      <style>{`
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes iconSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(2deg); }
          75% { transform: translateY(2px) rotate(-2deg); }
        }
        @keyframes iconGlow {
          0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
          50% { filter: drop-shadow(0 0 8px currentColor); }
        }
        .animate-icon-pulse { animation: iconPulse 2s ease-in-out infinite; }
        .animate-icon-bounce { animation: iconBounce 1.5s ease-in-out infinite; }
        .animate-icon-spin { animation: iconSpin 3s linear infinite; }
        .animate-icon-float { animation: iconFloat 3s ease-in-out infinite; }
        .animate-icon-glow { animation: iconGlow 2s ease-in-out infinite; }
      `}</style>
      <Icon 
        className={cn(
          "w-full h-full transition-transform duration-300",
          animationClasses[animationType],
          className
        )} 
      />
    </>
  );
};

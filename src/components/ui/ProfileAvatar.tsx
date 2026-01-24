import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export const ProfileAvatar = ({ className, onClick, size = "sm" }: ProfileAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full flex items-center justify-center",
        "bg-gradient-to-br from-violet/30 to-magenta/30",
        "border border-violet/30 hover:border-violet/50",
        "hover:scale-105 active:scale-95",
        "transition-all duration-300 group",
        "overflow-hidden",
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: "0 0 15px hsla(262, 76%, 57%, 0.2)",
      }}
    >
      {/* Animated glow ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "conic-gradient(from 0deg, transparent, hsla(262, 76%, 57%, 0.3), transparent)",
          animation: "spin 3s linear infinite",
        }}
      />
      
      {/* Inner background */}
      <div className="absolute inset-[2px] rounded-full bg-secondary/80 flex items-center justify-center">
        <User className={cn(
          "text-violet/80 group-hover:text-violet transition-colors duration-300",
          iconSizes[size]
        )} />
      </div>

      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, transparent 40%, hsla(0, 0%, 100%, 0.1) 50%, transparent 60%)",
          animation: "shimmer 2s infinite",
        }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>
    </button>
  );
};

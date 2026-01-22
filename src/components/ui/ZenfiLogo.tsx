import { cn } from "@/lib/utils";
import zenfiLogo from "@/assets/zenfi-logo.png";

interface ZenfiLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeClasses = {
  sm: "h-12",
  md: "h-16",
  lg: "h-24",
  xl: "h-32",
};

export const ZenfiLogo = ({ className, size = "md", animated = false }: ZenfiLogoProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Animated glow background */}
      {animated && (
        <div 
          className="absolute inset-0 blur-3xl opacity-60 scale-150"
          style={{
            background: "radial-gradient(ellipse at center, rgba(216, 78, 255, 0.5), rgba(123, 63, 228, 0.4), rgba(46, 242, 226, 0.3), transparent 70%)",
            animation: "logoGlowPulse 3s ease-in-out infinite",
          }}
        />
      )}

      {/* Logo Image */}
      <img 
        src={zenfiLogo} 
        alt="ZENFI Logo"
        className={cn(
          "relative object-contain",
          sizeClasses[size],
          animated && "animate-logo-float"
        )}
        style={{
          filter: animated 
            ? "drop-shadow(0 0 30px rgba(123, 63, 228, 0.6)) drop-shadow(0 0 60px rgba(216, 78, 255, 0.4))" 
            : "drop-shadow(0 0 15px rgba(123, 63, 228, 0.4))",
          animation: animated ? "logoShimmer 4s ease-in-out infinite" : undefined,
        }}
      />

      <style>{`
        @keyframes logoGlowPulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1.4);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.6);
          }
        }
        
        @keyframes logoShimmer {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(123, 63, 228, 0.6)) drop-shadow(0 0 60px rgba(216, 78, 255, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(123, 63, 228, 0.8)) drop-shadow(0 0 80px rgba(216, 78, 255, 0.6)) drop-shadow(0 0 20px rgba(46, 242, 226, 0.5));
          }
        }
      `}</style>
    </div>
  );
};

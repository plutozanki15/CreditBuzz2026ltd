import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface LuxuryGlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const LuxuryGlassCard = ({ children, className, style }: LuxuryGlassCardProps) => {
  return (
    <div className={cn("relative group", className)} style={style}>
      {/* Glow effect behind card */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(123, 63, 228, 0.3), rgba(216, 78, 255, 0.2), rgba(245, 180, 76, 0.15))",
        }}
      />
      
      {/* Main glass card */}
      <div 
        className="relative overflow-hidden rounded-2xl p-7 md:p-8"
        style={{
          background: "rgba(11, 11, 15, 0.88)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 1px 0 0 rgba(255, 255, 255, 0.05) inset
          `,
        }}
      >
        {/* Gradient border glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            padding: "1px",
            background: "linear-gradient(135deg, rgba(123, 63, 228, 0.4), rgba(216, 78, 255, 0.3), rgba(245, 180, 76, 0.2))",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0.5,
          }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        >
          <div 
            className="absolute -inset-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)",
              animation: "cardShimmer 8s ease-in-out infinite",
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes cardShimmer {
          0% { transform: translateX(-100%) rotate(15deg); }
          50%, 100% { transform: translateX(200%) rotate(15deg); }
        }
      `}</style>
    </div>
  );
};

import { cn } from "@/lib/utils";

interface ZenfiLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeClasses = {
  sm: { text: "text-2xl", icon: "w-8 h-8" },
  md: { text: "text-4xl", icon: "w-12 h-12" },
  lg: { text: "text-5xl", icon: "w-16 h-16" },
  xl: { text: "text-7xl", icon: "w-24 h-24" },
};

export const ZenfiLogo = ({ className, size = "md", animated = false }: ZenfiLogoProps) => {
  return (
    <div className={cn("relative flex flex-col items-center justify-center gap-3", className)}>
      {/* Animated glow background */}
      {animated && (
        <div 
          className="absolute inset-0 blur-3xl opacity-50"
          style={{
            background: "radial-gradient(ellipse at center, rgba(216, 78, 255, 0.4), rgba(123, 63, 228, 0.3), transparent 70%)",
            animation: "logoGlowPulse 3s ease-in-out infinite",
          }}
        />
      )}

      {/* Stylized Z Icon */}
      <div className={cn("relative", sizeClasses[size].icon)}>
        {/* Multi-layer glow effect */}
        <div 
          className="absolute inset-0 blur-xl opacity-80"
          style={{
            background: "linear-gradient(135deg, #2EF2E2, #7B3FE4, #D84EFF, #F5B44C)",
            animation: animated ? "zIconGlow 2s ease-in-out infinite alternate" : undefined,
          }}
        />
        
        {/* Z Icon with crystalline effect */}
        <svg 
          viewBox="0 0 100 100" 
          className="relative w-full h-full"
          style={{
            filter: animated ? "drop-shadow(0 0 15px rgba(123, 63, 228, 0.8))" : undefined,
          }}
        >
          <defs>
            {/* Main gradient */}
            <linearGradient id="zGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2EF2E2" />
              <stop offset="25%" stopColor="#7B3FE4" />
              <stop offset="50%" stopColor="#D84EFF" />
              <stop offset="75%" stopColor="#F5B44C" />
              <stop offset="100%" stopColor="#D84EFF" />
            </linearGradient>
            
            {/* Highlight gradient for 3D effect */}
            <linearGradient id="zHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Shimmer animation gradient */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)">
                <animate attributeName="offset" values="-1;2" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="rgba(255,255,255,0.5)">
                <animate attributeName="offset" values="-0.5;2.5" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgba(255,255,255,0)">
                <animate attributeName="offset" values="0;3" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          
          {/* Main Z shape with gradient fill */}
          <path 
            d="M15 20 L85 20 L85 30 L35 70 L85 70 L85 80 L15 80 L15 70 L65 30 L15 30 Z"
            fill="url(#zGradient)"
            stroke="url(#zHighlight)"
            strokeWidth="1"
          />
          
          {/* Inner highlight for crystalline effect */}
          <path 
            d="M20 25 L80 25 L80 28 L38 68 L80 68 L80 75 L20 75 L20 72 L62 32 L20 32 Z"
            fill="url(#zHighlight)"
            opacity="0.3"
          />

          {/* Shimmer overlay when animated */}
          {animated && (
            <path 
              d="M15 20 L85 20 L85 30 L35 70 L85 70 L85 80 L15 80 L15 70 L65 30 L15 30 Z"
              fill="url(#shimmer)"
              opacity="0.6"
            />
          )}
        </svg>
      </div>

      {/* ZENFI Text */}
      <div className={cn("relative font-display font-bold tracking-wider", sizeClasses[size].text)}>
        {/* Text glow */}
        {animated && (
          <span 
            className="absolute inset-0 blur-lg"
            style={{
              background: "linear-gradient(135deg, #7B3FE4, #D84EFF, #F5B44C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.6,
              animation: "textGlow 2s ease-in-out infinite alternate",
            }}
            aria-hidden="true"
          >
            ZENFI
          </span>
        )}
        
        <span 
          className="relative"
          style={{
            background: "linear-gradient(135deg, #2EF2E2 0%, #7B3FE4 25%, #D84EFF 50%, #F5B44C 75%, #D84EFF 100%)",
            backgroundSize: animated ? "200% 200%" : "100% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: animated ? "drop-shadow(0 0 20px rgba(123, 63, 228, 0.5))" : undefined,
            animation: animated ? "gradientShift 4s ease-in-out infinite" : undefined,
          }}
        >
          ZENFI
        </span>
      </div>

      <style>{`
        @keyframes logoGlowPulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes zIconGlow {
          0% {
            opacity: 0.6;
            filter: blur(15px);
          }
          100% {
            opacity: 0.9;
            filter: blur(20px);
          }
        }
        
        @keyframes textGlow {
          0% {
            opacity: 0.4;
            filter: blur(10px);
          }
          100% {
            opacity: 0.7;
            filter: blur(15px);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

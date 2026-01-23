import { useMemo } from "react";

interface Particle {
  id: number;
  size: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  color: string;
  opacity: number;
}

interface LuxuryBackgroundProps {
  intensity?: "low" | "medium" | "high";
}

export const LuxuryBackground = ({ intensity = "medium" }: LuxuryBackgroundProps) => {
  const particleCount = intensity === "low" ? 15 : intensity === "medium" ? 25 : 40;
  
  const particles = useMemo(() => {
    const colors = [
      "rgba(123, 63, 228, 0.6)",   // Violet
      "rgba(216, 78, 255, 0.5)",   // Magenta
      "rgba(245, 180, 76, 0.4)",   // Gold
      "rgba(46, 242, 226, 0.3)",   // Teal
    ];
    
    return Array.from({ length: particleCount }, (_, i): Particle => ({
      id: i,
      size: Math.random() * 6 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 6 + 6}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, [particleCount]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Nebula Gradient */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute w-[150%] h-[150%] -top-1/4 -left-1/4"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(123, 63, 228, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 20%, rgba(216, 78, 255, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 70% 60% at 60% 80%, rgba(245, 180, 76, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 30% 70%, rgba(46, 242, 226, 0.08) 0%, transparent 50%)
            `,
            animation: "nebulaMove 20s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Secondary Nebula Layer */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%]"
          style={{
            background: `
              radial-gradient(ellipse 40% 30% at 70% 30%, rgba(123, 63, 228, 0.2) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 20% 60%, rgba(216, 78, 255, 0.15) 0%, transparent 60%)
            `,
            animation: "nebulaMove2 25s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      {/* Diagonal Shimmer */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(123, 63, 228, 0.1) 25%, transparent 50%, rgba(216, 78, 255, 0.08) 75%, transparent 100%)",
          backgroundSize: "400% 400%",
          animation: "diagonalShimmer 15s ease-in-out infinite",
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            animation: `floatParticle ${particle.duration} ease-in-out infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}

      {/* Glow Orbs */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(123, 63, 228, 0.4) 0%, transparent 70%)",
          top: "10%",
          right: "-10%",
          animation: "orbFloat 12s ease-in-out infinite",
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(216, 78, 255, 0.3) 0%, transparent 70%)",
          bottom: "5%",
          left: "-5%",
          animation: "orbFloat 15s ease-in-out infinite reverse",
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(46, 242, 226, 0.3) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "orbPulse 8s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes nebulaMove {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(5%, 3%) rotate(2deg); }
        }
        @keyframes nebulaMove2 {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-3%, 5%) rotate(-2deg); }
        }
        @keyframes diagonalShimmer {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1); 
            opacity: var(--particle-opacity, 0.3);
          }
          25% { 
            transform: translateY(-30px) translateX(15px) scale(1.1); 
            opacity: calc(var(--particle-opacity, 0.3) + 0.2);
          }
          50% { 
            transform: translateY(-15px) translateX(-10px) scale(0.9); 
            opacity: var(--particle-opacity, 0.3);
          }
          75% { 
            transform: translateY(-40px) translateX(5px) scale(1.05); 
            opacity: calc(var(--particle-opacity, 0.3) + 0.1);
          }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
};

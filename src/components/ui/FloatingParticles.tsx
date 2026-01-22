import { useMemo } from "react";

interface Particle {
  id: number;
  size: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  color: string;
}

export const FloatingParticles = () => {
  const particles = useMemo(() => {
    const colors = [
      "bg-violet",
      "bg-magenta",
      "bg-gold",
    ];
    
    return Array.from({ length: 20 }, (_, i): Particle => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 4 + 4}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${particle.color}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
};

import { useEffect, useState } from "react";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <FloatingParticles />
      <div className="relative z-10 animate-fade-in-up">
        <ZenfiLogo size="xl" animated />
        <div className="mt-6 flex justify-center">
          <div className="w-32 h-1 rounded-full overflow-hidden bg-secondary">
            <div 
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(135deg, hsl(262, 76%, 57%), hsl(289, 100%, 65%), hsl(37, 89%, 63%))",
                animation: "shimmer 1.5s infinite, progressFill 2.5s ease-out forwards",
              }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

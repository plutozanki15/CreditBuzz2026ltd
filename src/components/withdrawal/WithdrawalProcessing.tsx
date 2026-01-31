import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Shield, Zap, CheckCircle } from "lucide-react";

interface WithdrawalProcessingProps {
  message?: string;
  onComplete: () => void;
  duration?: number;
}

export const WithdrawalProcessing = ({ 
  message = "Processing your withdrawal request…", 
  onComplete,
  duration = 2500,
}: WithdrawalProcessingProps) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, duration / 25);

    const stageTimers = [
      setTimeout(() => setStage(1), duration * 0.35),
      setTimeout(() => setStage(2), duration * 0.7),
      setTimeout(() => setStage(3), duration * 0.9),
      setTimeout(() => onComplete(), duration),
    ];

    return () => {
      clearInterval(progressInterval);
      stageTimers.forEach(clearTimeout);
    };
  }, [onComplete, duration]);

  const stages = [
    { icon: Loader2, text: "Initiating secure connection...", spinning: true },
    { icon: Shield, text: "Verifying withdrawal details...", spinning: false },
    { icon: Zap, text: "Processing your request...", spinning: false },
    { icon: CheckCircle, text: "Verification complete!", spinning: false },
  ];

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-magenta/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Main animation circle */}
        <div className="relative">
          <motion.div
            className="w-32 h-32 rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--violet)) ${progress * 3.6}deg, hsla(var(--violet), 0.2) 0deg)`,
            }}
          />
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <motion.div
              key={stage}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Icon
                className={`w-12 h-12 text-violet ${currentStage.spinning ? "animate-spin" : ""}`}
              />
            </motion.div>
          </div>
        </div>

        {/* Stage text */}
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-display font-semibold text-foreground">
            {currentStage.text}
          </h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet to-magenta rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        {/* Progress percentage */}
        <span className="text-sm font-mono text-muted-foreground">{Math.min(progress, 100)}%</span>
      </div>
    </motion.div>
  );
};

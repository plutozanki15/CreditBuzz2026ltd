import { cn } from "@/lib/utils";

interface ZenfiLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-7xl",
};

export const ZenfiLogo = ({ className, size = "md", animated = false }: ZenfiLogoProps) => {
  return (
    <div className={cn("font-display font-bold tracking-tight", sizeClasses[size], className)}>
      <span className={cn("gradient-text", animated && "animate-logo-glow")}>
        ZENFI
      </span>
    </div>
  );
};

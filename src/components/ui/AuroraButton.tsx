import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface AuroraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const AuroraButton = forwardRef<HTMLButtonElement, AuroraButtonProps>(
  ({ children, className, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "btn-aurora glow-pulse w-full h-[52px] rounded-xl text-base font-semibold",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "flex items-center justify-center gap-2",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
            <div className="animate-shimmer absolute inset-0" />
            <span className="relative z-10">Processing...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

AuroraButton.displayName = "AuroraButton";

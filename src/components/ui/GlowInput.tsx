import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface GlowInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={isPassword && showPassword ? "text" : type}
            ref={ref}
            className={cn(
              "input-glow w-full h-[50px] px-4 rounded-xl",
              "bg-secondary border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-teal",
              error && "border-destructive focus:border-destructive",
              isPassword && "pr-12",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-teal transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

GlowInput.displayName = "GlowInput";

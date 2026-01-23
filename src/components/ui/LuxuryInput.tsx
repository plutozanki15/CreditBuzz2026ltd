import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LuxuryInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const LuxuryInput = forwardRef<HTMLInputElement, LuxuryInputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-muted-foreground/80">
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Focus glow effect */}
          <div 
            className={cn(
              "absolute -inset-0.5 rounded-xl transition-all duration-500",
              isFocused ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: "linear-gradient(135deg, rgba(46, 242, 226, 0.3), rgba(46, 242, 226, 0.1))",
              filter: "blur(8px)",
            }}
          />
          
          {/* Input container */}
          <div className="relative">
            {icon && (
              <div className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
                isFocused ? "text-teal" : "text-muted-foreground/50"
              )}>
                {icon}
              </div>
            )}
            
            <input
              type={isPassword && showPassword ? "text" : type}
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "relative w-full h-[50px] rounded-xl transition-all duration-300",
                "text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none",
                icon ? "pl-12 pr-4" : "px-4",
                isPassword && "pr-12",
                error 
                  ? "border-destructive focus:border-destructive" 
                  : "border-border/50 focus:border-teal",
                className
              )}
              style={{
                background: "rgba(11, 11, 15, 0.9)",
                border: `1px solid ${isFocused ? "rgba(46, 242, 226, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
                boxShadow: isFocused 
                  ? "0 0 20px rgba(46, 242, 226, 0.15), 0 0 0 1px rgba(46, 242, 226, 0.1) inset" 
                  : "none",
              }}
              {...props}
            />
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300",
                  "hover:scale-110",
                  showPassword ? "text-teal" : "text-muted-foreground/50 hover:text-teal"
                )}
                style={{
                  filter: showPassword ? "drop-shadow(0 0 6px rgba(46, 242, 226, 0.5))" : "none",
                }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-destructive" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

LuxuryInput.displayName = "LuxuryInput";

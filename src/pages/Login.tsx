import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { LuxuryGlassCard } from "@/components/ui/LuxuryGlassCard";
import { LuxuryInput } from "@/components/ui/LuxuryInput";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { LuxuryBackground } from "@/components/ui/LuxuryBackground";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { Mail, Lock } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <WarningBanner />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <LuxuryBackground intensity="high" />
        
        <div 
          className="w-full max-w-[400px] relative z-10"
          style={{
            animation: "pageEnter 0.8s ease-out forwards",
          }}
        >
          {/* Logo Section */}
          <div className="text-center mb-10">
            <ZenfiLogo size="lg" animated />
          </div>

          {/* Glass Card */}
          <LuxuryGlassCard>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 
                className="text-2xl font-display font-semibold mb-2"
                style={{
                  textShadow: "0 0 30px rgba(255, 255, 255, 0.1)",
                }}
              >
                Welcome Back
              </h1>
              <p className="text-muted-foreground/70 text-sm">
                Sign in to access your ZenFi wallet
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <LuxuryInput
                type="email"
                placeholder="Email address"
                icon={<Mail className="w-5 h-5" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <LuxuryInput
                type="password"
                placeholder="Password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(46,242,226,0.5)]"
                  style={{ color: "#2EF2E2" }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <LuxuryButton type="submit" loading={loading}>
                  Sign In
                </LuxuryButton>
              </div>
            </form>

            {/* Switch to Sign Up */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground/60 text-sm">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-semibold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(46,242,226,0.5)]"
                  style={{ color: "#2EF2E2" }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </LuxuryGlassCard>

          {/* Footer */}
          <p className="text-center text-muted-foreground/40 text-xs mt-8">
            By signing in, you agree to our{" "}
            <span className="text-muted-foreground/60 hover:text-teal transition-colors cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-muted-foreground/60 hover:text-teal transition-colors cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

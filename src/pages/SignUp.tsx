import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { LuxuryGlassCard } from "@/components/ui/LuxuryGlassCard";
import { LuxuryInput } from "@/components/ui/LuxuryInput";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { LuxuryBackground } from "@/components/ui/LuxuryBackground";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { User, Mail, Lock, Gift } from "lucide-react";

export const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Clear onboarding flag so it shows for new signups
    localStorage.removeItem("zenfi_onboarding_complete");
    
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
          <div className="text-center mb-8">
            <ZenfiLogo size="lg" animated />
          </div>

          {/* Glass Card */}
          <LuxuryGlassCard>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 
                className="text-2xl font-display font-semibold mb-2"
                style={{
                  textShadow: "0 0 30px rgba(255, 255, 255, 0.1)",
                }}
              >
                Create Your Account
              </h1>
              <p className="text-muted-foreground/70 text-sm">
                Join ZenFi and start your financial journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <LuxuryInput
                type="text"
                placeholder="Full name"
                icon={<User className="w-5 h-5" />}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              
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
                error={errors.password}
                required
              />
              
              <LuxuryInput
                type="password"
                placeholder="Confirm password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
              />
              
              <LuxuryInput
                type="text"
                placeholder="Referral code (optional)"
                icon={<Gift className="w-5 h-5" />}
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              />

              {/* Submit Button */}
              <div className="pt-3">
                <LuxuryButton type="submit" loading={loading}>
                  Create Account
                </LuxuryButton>
              </div>
            </form>

            {/* Switch to Login */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground/60 text-sm">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(46,242,226,0.5)]"
                  style={{ color: "#2EF2E2" }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </LuxuryGlassCard>

          {/* Footer */}
          <p className="text-center text-muted-foreground/40 text-xs mt-6">
            By signing up, you agree to our{" "}
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

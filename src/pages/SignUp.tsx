import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { LuxuryInput } from "@/components/ui/LuxuryInput";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { LuxuryBackground } from "@/components/ui/LuxuryBackground";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Lock, Gift } from "lucide-react";

export const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
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
    
    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.referralCode || undefined
    );

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Clear onboarding flag so it shows for new signups
    localStorage.removeItem("creditbuzz_onboarding_complete");
    
    toast({
      title: "Account Created!",
      description: "Welcome to CreditBuzz",
    });
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <WarningBanner />
      
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <LuxuryBackground intensity="high" />

        {/* Animated orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
            style={{ background: "radial-gradient(circle, #D84EFF, transparent 70%)", animationDuration: "4s" }} />
          <div className="absolute bottom-1/4 -left-20 w-56 h-56 rounded-full opacity-15 animate-pulse"
            style={{ background: "radial-gradient(circle, #7B3FE4, transparent 70%)", animationDuration: "5s", animationDelay: "0.8s" }} />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full opacity-10 animate-pulse"
            style={{ background: "radial-gradient(circle, #2EF2E2, transparent 70%)", animationDuration: "7s", animationDelay: "1.5s" }} />
        </div>
        
        <div 
          className="w-full max-w-[400px] relative z-10"
          style={{ animation: "pageEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
        >
          {/* Logo Section */}
          <div className="text-center mb-6" style={{ animation: "floatIn 0.6s ease-out 0.1s both" }}>
            <ZenfiLogo size="md" animated />
          </div>

          {/* Glass Card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsla(240,7%,9%,0.95), hsla(240,7%,5%,0.98))",
              border: "1px solid hsla(289,100%,65%,0.16)",
              boxShadow: "0 30px 80px -20px hsla(0,0%,0%,0.7), 0 0 0 1px hsla(289,100%,65%,0.06), inset 0 1px 0 hsla(255,255%,255%,0.04)",
              animation: "floatIn 0.65s ease-out 0.15s both",
            }}
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, hsla(289,100%,65%,0.5), hsla(262,76%,57%,0.5), transparent)" }} />
            
            {/* Corner sparkles */}
            <div className="absolute top-3 left-3 w-1 h-1 rounded-full bg-magenta/50 animate-pulse" />
            <div className="absolute top-5 left-5 w-0.5 h-0.5 rounded-full bg-violet/60 animate-pulse" style={{ animationDelay: "0.7s" }} />
            <div className="absolute bottom-3 right-3 w-1 h-1 rounded-full bg-teal/40 animate-pulse" style={{ animationDelay: "1.2s" }} />

            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-5" style={{ animation: "floatIn 0.5s ease-out 0.25s both" }}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                  style={{ background: "hsla(289,100%,65%,0.08)", border: "1px solid hsla(289,100%,65%,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-magenta animate-pulse" />
                  <span className="text-[10px] text-magenta/80 font-medium tracking-widest uppercase">New Account</span>
                </div>
                <h1 className="text-xl font-display font-bold mb-1">
                  Join CreditBuzz
                </h1>
                <p className="text-muted-foreground/60 text-sm">
                  Start your financial journey today
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div style={{ animation: "slideUp 0.4s ease-out 0.3s both" }}>
                  <LuxuryInput
                    type="text"
                    placeholder="Full name"
                    icon={<User className="w-5 h-5" />}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                
                <div style={{ animation: "slideUp 0.4s ease-out 0.35s both" }}>
                  <LuxuryInput
                    type="email"
                    placeholder="Email address"
                    icon={<Mail className="w-5 h-5" />}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div style={{ animation: "slideUp 0.4s ease-out 0.4s both" }}>
                  <LuxuryInput
                    type="password"
                    placeholder="Password"
                    icon={<Lock className="w-5 h-5" />}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    required
                  />
                </div>
                
                <div style={{ animation: "slideUp 0.4s ease-out 0.45s both" }}>
                  <LuxuryInput
                    type="password"
                    placeholder="Confirm password"
                    icon={<Lock className="w-5 h-5" />}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
                
                <div style={{ animation: "slideUp 0.4s ease-out 0.5s both" }}>
                  <LuxuryInput
                    type="text"
                    placeholder="Referral code (optional)"
                    icon={<Gift className="w-5 h-5" />}
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2" style={{ animation: "slideUp 0.4s ease-out 0.55s both" }}>
                  <LuxuryButton type="submit" loading={loading}>
                    Create Account
                  </LuxuryButton>
                </div>
              </form>

              {/* Switch to Login */}
              <div className="mt-5 text-center" style={{ animation: "slideUp 0.4s ease-out 0.6s both" }}>
                <p className="text-muted-foreground/50 text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-semibold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(46,242,226,0.5)]"
                    style={{ color: "#2EF2E2" }}
                  >
                    Sign in →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-muted-foreground/30 text-xs mt-5" style={{ animation: "floatIn 0.5s ease-out 0.65s both" }}>
            By signing up, you agree to our{" "}
            <span className="text-muted-foreground/50 hover:text-teal transition-colors cursor-pointer">Terms</span>
            {" & "}
            <span className="text-muted-foreground/50 hover:text-teal transition-colors cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

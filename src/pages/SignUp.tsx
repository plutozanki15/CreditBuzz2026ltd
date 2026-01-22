import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowInput } from "@/components/ui/GlowInput";
import { AuroraButton } from "@/components/ui/AuroraButton";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

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
    
    // Validation
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
    
    // Simulate signup
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <FloatingParticles />
      
      <div className="w-full max-w-[400px] relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <ZenfiLogo size="lg" animated className="justify-center mb-4" />
        </div>

        <GlassCard>
          <h1 className="text-2xl font-display font-semibold text-center mb-2">
            Create Your Account
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Join ZENFI and start your financial journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <GlowInput
              type="text"
              placeholder="Full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            
            <GlowInput
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <GlowInput
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
            />
            
            <GlowInput
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
            />
            
            <GlowInput
              type="text"
              placeholder="Referral code (optional)"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
            />

            <div className="pt-2">
              <AuroraButton type="submit" loading={loading}>
                Create Account
              </AuroraButton>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-teal hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </GlassCard>

        <p className="text-center text-muted-foreground text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

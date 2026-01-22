import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowInput } from "@/components/ui/GlowInput";
import { AuroraButton } from "@/components/ui/AuroraButton";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

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
    
    // Simulate login
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
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to access your ZENFI wallet
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              required
            />

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-teal hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <AuroraButton type="submit" loading={loading}>
              Sign In
            </AuroraButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-teal hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </GlassCard>

        <p className="text-center text-muted-foreground text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

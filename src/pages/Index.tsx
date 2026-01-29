import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "./SplashScreen";
import { Login } from "./Login";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isLoading && user && !showSplash) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, showSplash, navigate]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in, redirect will happen via useEffect
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Login />;
};

export default Index;

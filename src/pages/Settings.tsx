import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { 
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Lock,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Check
} from "lucide-react";

export const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  useRouteHistory();

  useEffect(() => {
    // Load saved preferences
    const savedNotifications = localStorage.getItem("zenfi_notifications");
    const savedTheme = localStorage.getItem("zenfi_theme");
    
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }
    if (savedTheme !== null) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  const handleNotificationToggle = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("zenfi_notifications", String(checked));
    toast({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked 
        ? "You'll receive important alerts" 
        : "You won't receive notifications",
    });
  };

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("zenfi_theme", checked ? "dark" : "light");
    // For now, we only support dark mode in this fintech design
    toast({
      title: checked ? "Dark Mode" : "Light Mode",
      description: "Theme preference saved",
    });
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    // Simulate password change
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
    setPasswords({ current: "", new: "", confirm: "" });
    setShowPasswordForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("zenfi_onboarding_complete");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold">Settings</h1>
          <p className="text-xs text-muted-foreground">Customize your experience</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 space-y-4">
        {/* Notifications */}
        <GlassCard className="animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet/20">
                <Bell className="w-5 h-5 text-violet" />
              </div>
              <div>
                <p className="font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">Receive important alerts</p>
              </div>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={handleNotificationToggle}
              className="data-[state=checked]:bg-violet"
            />
          </div>
        </GlassCard>

        {/* Theme */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gold/20">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gold" />
                ) : (
                  <Sun className="w-5 h-5 text-gold" />
                )}
              </div>
              <div>
                <p className="font-semibold">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Premium dark theme</p>
              </div>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={handleThemeToggle}
              className="data-[state=checked]:bg-gold"
            />
          </div>
        </GlassCard>

        {/* Change Password */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal/20">
                <Lock className="w-5 h-5 text-teal" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your security</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
              showPasswordForm ? "rotate-90" : ""
            }`} />
          </button>

          {showPasswordForm && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in-up">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="bg-secondary/50 border-border/50 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">New Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Confirm Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal to-violet text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Check className="w-4 h-4" />
                Update Password
              </button>
            </div>
          )}
        </GlassCard>

        {/* Security Status */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-magenta/20">
              <Shield className="w-5 h-5 text-magenta" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Security Status</p>
              <p className="text-xs text-muted-foreground">Account protection level</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-semibold">
              Secured
            </span>
          </div>
        </GlassCard>

        {/* App Info */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Info className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">App Version</p>
              <p className="text-xs text-muted-foreground">ZenFi v1.0.0</p>
            </div>
            <span className="text-xs text-muted-foreground/60">Latest</span>
          </div>
        </GlassCard>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full animate-fade-in-up"
          style={{ animationDelay: "0.25s" }}
        >
          <GlassCard className="flex items-center gap-3 hover:bg-destructive/10 transition-colors">
            <div className="p-2 rounded-xl bg-destructive/20">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-destructive">Logout</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
          </GlassCard>
        </button>

        {/* Footer */}
        <div className="text-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs text-muted-foreground/50">
            🔒 Encrypted system • Optimized performance
          </p>
        </div>
      </main>
    </div>
  );
};

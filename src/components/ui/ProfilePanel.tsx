import { useState } from "react";
import { X, User, Mail, Shield, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const [copied, setCopied] = useState(false);
  
  const userData = {
    email: "user@zenfi.com",
    userId: "ZF-7829401",
    status: "Verified",
    memberSince: "January 2024",
    tier: "Premium",
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userData.userId);
      setCopied(true);
      toast({ title: "User ID Copied", description: userData.userId });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-background/95 backdrop-blur-xl z-50 shadow-2xl",
          "border-l border-border/50",
          "animate-slide-in-right"
        )}
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(240, 7%, 6%) 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h2 className="font-display font-semibold text-lg">Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Avatar & Status */}
          <div className="text-center py-6">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
                boxShadow: "0 0 30px hsla(262, 76%, 57%, 0.4)",
              }}
            >
              <User className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-display font-semibold text-lg">{userData.userId}</span>
              <button 
                onClick={handleCopyId}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-teal" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-sm text-teal font-medium">{userData.status}</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            {/* Email */}
            <div 
              className="p-4 rounded-2xl border border-border/30"
              style={{
                background: "hsla(240, 7%, 8%, 0.6)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet/20">
                  <Mail className="w-4 h-4 text-violet" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium truncate">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div 
              className="p-4 rounded-2xl border border-border/30"
              style={{
                background: "hsla(240, 7%, 8%, 0.6)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal/20">
                  <Shield className="w-4 h-4 text-teal" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Account Status</p>
                  <p className="text-sm font-medium">Active • {userData.tier}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-teal" />
              </div>
            </div>

            {/* Member Since */}
            <div 
              className="p-4 rounded-2xl border border-border/30"
              style={{
                background: "hsla(240, 7%, 8%, 0.6)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold/20">
                  <User className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Member Since</p>
                  <p className="text-sm font-medium">{userData.memberSince}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div 
            className="p-4 rounded-2xl text-center"
            style={{
              background: "linear-gradient(135deg, hsla(174, 88%, 56%, 0.1), hsla(262, 76%, 57%, 0.1))",
              border: "1px solid hsla(174, 88%, 56%, 0.2)",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-teal" />
              <span className="text-sm font-semibold text-teal">Bank-Grade Security</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your account is protected with 256-bit encryption
            </p>
          </div>

          {/* Quick Links */}
          <div className="pt-2 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Quick Access</p>
            
            <button className="w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-between group">
              <span className="text-sm font-medium">Account Settings</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            
            <button className="w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-between group">
              <span className="text-sm font-medium">Security Center</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30">
          <p className="text-center text-[10px] text-muted-foreground/50">
            🔒 Secure • Encrypted • Trusted
          </p>
        </div>
      </div>
    </>
  );
};

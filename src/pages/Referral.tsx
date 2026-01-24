import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle2, 
  Users, 
  Gift, 
  Share2,
  Link2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Coins,
  ChevronRight
} from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { LuxuryGlassCard } from "@/components/ui/LuxuryGlassCard";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { toast } from "@/hooks/use-toast";

const howItWorksSteps = [
  {
    icon: Share2,
    title: "Share Your Link",
    description: "Send your unique referral link to friends and family",
    color: "from-violet to-magenta",
  },
  {
    icon: UserPlus,
    title: "Friends Sign Up",
    description: "They create an account using your referral code",
    color: "from-magenta to-gold",
  },
  {
    icon: Coins,
    title: "Earn Rewards",
    description: "Get ₦5,000 for each successful referral",
    color: "from-teal to-violet",
  },
];

export const Referral = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [referralCode] = useState("ZF7829401");
  const [referralLink] = useState("https://zenfi.com/ref/ZF7829401");
  const [stats, setStats] = useState({
    totalReferrals: 3,
    totalEarnings: 15000,
    pendingRewards: 5000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Code Copied!",
        description: "Your referral code has been copied.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-secondary active:scale-95 transition-all duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <div className="animate-slide-in">
          <h1 className="text-lg font-display font-bold text-foreground">Refer & Earn</h1>
          <p className="text-xs text-muted-foreground">Invite friends, earn rewards</p>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-6 space-y-3">
        {/* Compact Stats */}
        <LuxuryGlassCard className="p-3 animate-scale-in">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <Users className="w-4 h-4 mx-auto mb-0.5 text-violet" />
              <p className="text-base font-bold text-foreground">{stats.totalReferrals}</p>
              <p className="text-[8px] text-muted-foreground">Referrals</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <Coins className="w-4 h-4 mx-auto mb-0.5 text-gold" />
              <p className="text-base font-bold gradient-text">{formatCurrency(stats.totalEarnings)}</p>
              <p className="text-[8px] text-muted-foreground">Earned</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <Sparkles className="w-4 h-4 mx-auto mb-0.5 text-teal" />
              <p className="text-base font-bold text-teal">{formatCurrency(stats.pendingRewards)}</p>
              <p className="text-[8px] text-muted-foreground">Pending</p>
            </div>
          </div>
        </LuxuryGlassCard>

        {/* Referral Link & Code - Compact */}
        <LuxuryGlassCard className="p-4 space-y-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {/* Link */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/50">
            <Link2 className="w-3.5 h-3.5 text-violet flex-shrink-0" />
            <p className="flex-1 text-[11px] text-muted-foreground truncate font-mono">{referralLink}</p>
            <button
              onClick={handleCopyLink}
              className={`p-1.5 rounded-md transition-all active:scale-90 ${copied ? "bg-teal/20 text-teal" : "bg-violet/20 text-violet"}`}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Code */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-violet/10 to-magenta/10 border border-violet/20">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase">Code</p>
              <p className="text-sm font-bold font-mono gradient-text">{referralCode}</p>
            </div>
            <button onClick={handleCopyCode} className="p-2 rounded-lg bg-violet/20 active:scale-95">
              <Copy className="w-3.5 h-3.5 text-violet" />
            </button>
          </div>

          <LuxuryButton onClick={handleCopyLink} className="w-full h-10 rounded-lg text-sm">
            <Share2 className="w-3.5 h-3.5 mr-2" />
            Share Link
          </LuxuryButton>
        </LuxuryGlassCard>

        {/* How It Works - Compact Row */}
        <LuxuryGlassCard className="p-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <p className="text-[10px] font-semibold text-foreground mb-2">How It Works</p>
          <div className="flex items-center justify-between gap-1">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="flex-1 text-center">
                <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-1`}>
                  <step.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[9px] font-medium text-foreground leading-tight">{step.title}</p>
              </div>
            ))}
          </div>
        </LuxuryGlassCard>

        {/* Benefits - Compact */}
        <LuxuryGlassCard className="p-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Gift className="w-3 h-3 text-gold" />
            <span className="text-[10px] font-semibold text-foreground">Benefits</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["₦5,000 per referral", "Unlimited referrals", "Instant credit", "Mutual rewards"].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <CheckCircle2 className="w-2.5 h-2.5 text-teal flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </LuxuryGlassCard>

        {/* Footer */}
        <p className="text-[9px] text-center text-muted-foreground/50 pt-1">🎁 Share • Earn • Grow together</p>
      </main>
    </div>
  );
};

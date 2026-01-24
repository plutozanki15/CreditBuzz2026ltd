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

      <main className="relative z-10 px-4 pb-8 space-y-5">
        {/* Hero Stats Card */}
        <LuxuryGlassCard className="p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-gold/20 to-magenta/20">
                <Gift className="w-5 h-5 text-gold" />
              </div>
              <span className="text-sm font-semibold text-foreground">Your Earnings</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal/10">
              <TrendingUp className="w-3 h-3 text-teal" />
              <span className="text-[10px] font-medium text-teal">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-secondary/30">
              <Users className="w-5 h-5 mx-auto mb-1 text-violet" />
              <p className="text-lg font-bold text-foreground">{stats.totalReferrals}</p>
              <p className="text-[9px] text-muted-foreground">Referrals</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/30">
              <Coins className="w-5 h-5 mx-auto mb-1 text-gold" />
              <p className="text-lg font-bold gradient-text">{formatCurrency(stats.totalEarnings)}</p>
              <p className="text-[9px] text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/30">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-teal" />
              <p className="text-lg font-bold text-teal">{formatCurrency(stats.pendingRewards)}</p>
              <p className="text-[9px] text-muted-foreground">Pending</p>
            </div>
          </div>
        </LuxuryGlassCard>

        {/* Referral Link & Code */}
        <LuxuryGlassCard className="p-5 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-4 h-4 text-violet" />
            <span className="text-sm font-medium text-foreground">Your Referral Link</span>
          </div>

          {/* Referral Link */}
          <div className="relative">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
              <p className="flex-1 text-xs text-muted-foreground truncate font-mono">
                {referralLink}
              </p>
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg transition-all duration-300 active:scale-90 ${
                  copied 
                    ? "bg-teal/20 text-teal" 
                    : "bg-violet/20 hover:bg-violet/30 text-violet"
                }`}
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Success glow animation */}
            {copied && (
              <div 
                className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
                style={{
                  background: "radial-gradient(circle, hsla(174, 88%, 56%, 0.15) 0%, transparent 70%)",
                }}
              />
            )}
          </div>

          {/* Referral Code */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet/10 to-magenta/10 border border-violet/20">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Your Code</p>
              <p className="text-lg font-bold font-mono gradient-text">{referralCode}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-violet/20 hover:bg-violet/30 active:scale-95 transition-all duration-200"
            >
              <Copy className="w-4 h-4 text-violet" />
            </button>
          </div>

          {/* Share Button */}
          <LuxuryButton
            onClick={handleCopyLink}
            className="w-full h-12 rounded-xl"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral Link
          </LuxuryButton>
        </LuxuryGlassCard>

        {/* How It Works */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-display font-semibold text-foreground">How It Works</h2>
            <Sparkles className="w-4 h-4 text-gold" />
          </div>

          <div className="space-y-3">
            {howItWorksSteps.map((step, index) => (
              <LuxuryGlassCard 
                key={step.title}
                className="p-4 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + index * 0.08}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-violet/60">STEP {index + 1}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              </LuxuryGlassCard>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <LuxuryGlassCard className="p-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-foreground">Referral Benefits</span>
          </div>
          
          <ul className="space-y-2">
            {[
              "Earn ₦5,000 for every successful referral",
              "No limit on the number of referrals",
              "Instant credit when your friend signs up",
              "Both you and your friend earn rewards",
              "Track your earnings in real-time",
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal mt-0.5 flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </LuxuryGlassCard>

        {/* Footer */}
        <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-[10px] text-muted-foreground/50">
            🎁 Share the wealth • Help friends grow • Earn together
          </p>
        </div>
      </main>
    </div>
  );
};

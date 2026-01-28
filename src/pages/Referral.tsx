import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Users, 
  Gift, 
  Share2,
  Link2,
  Sparkles,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { toast } from "@/hooks/use-toast";

const howItWorksSteps = [
  { icon: Share2, title: "Share Link", desc: "Send to friends", color: "violet" },
  { icon: Users, title: "They Join", desc: "Sign up & verify", color: "magenta" },
  { icon: Gift, title: "You Earn", desc: "Get rewards", color: "teal" },
];

export const Referral = () => {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const referralCode = "ZF7829401";
  const referralLink = `https://zenfi2026.vercel.app/ref/${referralCode}`;
  
  const stats = {
    totalReferrals: 0,
    pendingRewards: 0,
    totalEarnings: 0,
  };

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
      setCopiedLink(true);
      toast({ title: "Link Copied!", description: "Share it with friends to earn rewards" });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast({ title: "Code Copied!", description: referralCode });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold tracking-tight">Refer & Earn</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Invite friends, earn rewards</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 animate-fade-in-up">
          <div 
            className="p-3 rounded-2xl text-center"
            style={{
              background: "hsla(262, 76%, 57%, 0.12)",
              border: "1px solid hsla(262, 76%, 57%, 0.2)",
            }}
          >
            <Users className="w-5 h-5 text-violet mx-auto mb-1" />
            <p className="text-xl font-display font-bold">{stats.totalReferrals}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Referrals</p>
          </div>
          
          <div 
            className="p-3 rounded-2xl text-center"
            style={{
              background: "hsla(289, 100%, 65%, 0.12)",
              border: "1px solid hsla(289, 100%, 65%, 0.2)",
            }}
          >
            <Sparkles className="w-5 h-5 text-magenta mx-auto mb-1" />
            <p className="text-xl font-display font-bold">{stats.pendingRewards}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Pending</p>
          </div>
          
          <div 
            className="p-3 rounded-2xl text-center"
            style={{
              background: "hsla(174, 88%, 56%, 0.12)",
              border: "1px solid hsla(174, 88%, 56%, 0.2)",
            }}
          >
            <TrendingUp className="w-5 h-5 text-teal mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{formatCurrency(stats.totalEarnings).replace('₦', '')}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Earned (₦)</p>
          </div>
        </div>

        {/* Referral Code & Link Card */}
        <div 
          className="p-4 rounded-2xl animate-fade-in-up space-y-4"
          style={{ 
            animationDelay: "0.05s",
            background: "hsla(240, 7%, 8%, 0.7)",
            border: "1px solid hsla(0, 0%, 100%, 0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Referral Code */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-violet" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Your Referral Code</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="flex-1 px-4 py-3 rounded-xl font-mono text-lg font-bold tracking-widest text-center"
                style={{
                  background: "hsla(262, 76%, 57%, 0.15)",
                  border: "1px solid hsla(262, 76%, 57%, 0.3)",
                }}
              >
                {referralCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-xl bg-violet/20 hover:bg-violet/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {copiedCode ? (
                  <CheckCircle className="w-5 h-5 text-teal" />
                ) : (
                  <Copy className="w-5 h-5 text-violet" />
                )}
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-teal" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Referral Link</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="flex-1 px-3 py-3 rounded-xl text-xs text-muted-foreground truncate"
                style={{
                  background: "hsla(174, 88%, 56%, 0.08)",
                  border: "1px solid hsla(174, 88%, 56%, 0.2)",
                }}
              >
                {referralLink}
              </div>
              <button
                onClick={handleCopyLink}
                className="p-3 rounded-xl bg-teal/20 hover:bg-teal/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {copiedLink ? (
                  <CheckCircle className="w-5 h-5 text-teal" />
                ) : (
                  <Copy className="w-5 h-5 text-teal" />
                )}
              </button>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3.5 rounded-xl font-display font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
              boxShadow: "0 6px 24px hsla(262, 76%, 57%, 0.35)",
            }}
          >
            <Share2 className="w-4 h-4" />
            Share & Earn
          </button>
        </div>

        {/* How It Works */}
        <div 
          className="p-4 rounded-2xl animate-fade-in-up"
          style={{ 
            animationDelay: "0.1s",
            background: "hsla(240, 7%, 8%, 0.7)",
            border: "1px solid hsla(0, 0%, 100%, 0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h3 className="text-sm font-display font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-gold" />
            How It Works
          </h3>
          
          <div className="flex items-center justify-between">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="flex items-center">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-1.5"
                    style={{
                      background: step.color === "violet" 
                        ? "hsla(262, 76%, 57%, 0.2)" 
                        : step.color === "magenta"
                        ? "hsla(289, 100%, 65%, 0.2)"
                        : "hsla(174, 88%, 56%, 0.2)",
                    }}
                  >
                    <step.icon 
                      className="w-5 h-5"
                      style={{
                        color: step.color === "violet" 
                          ? "hsl(262, 76%, 57%)" 
                          : step.color === "magenta"
                          ? "hsl(289, 100%, 65%)"
                          : "hsl(174, 88%, 56%)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold">{step.title}</p>
                  <p className="text-[9px] text-muted-foreground">{step.desc}</p>
                </div>
                {index < howItWorksSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div 
          className="p-4 rounded-2xl animate-fade-in-up"
          style={{ 
            animationDelay: "0.15s",
            background: "linear-gradient(135deg, hsla(37, 89%, 63%, 0.08), hsla(262, 76%, 57%, 0.08))",
            border: "1px solid hsla(37, 89%, 63%, 0.2)",
          }}
        >
          <h3 className="text-sm font-display font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            Why Refer?
          </h3>
          <ul className="space-y-1.5 text-[11px] text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-teal" />
              Earn ₦2,500 for every successful referral
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-teal" />
              No limit on referrals — unlimited earnings
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-teal" />
              Instant credit when referral qualifies
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-[10px] text-muted-foreground/50">
            🔒 Secure referral tracking • Real-time rewards
          </p>
        </div>
      </main>
    </div>
  );
};

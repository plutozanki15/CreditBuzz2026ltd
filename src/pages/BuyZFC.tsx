import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Shield,
  Building2,
  Lock,
  CreditCard,
  BadgeCheck,
  Zap,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AMOUNT = 5700;
const ZFC_AMOUNT = 180000;
const BANK_NAME = "Moniepoint MFB";
const ACCOUNT_NUMBER = "8102562883";
const ACCOUNT_NAME = "CHARIS BENJAMIN SOMTOCHUKWU";

export const BuyZFC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const userId = profile?.referral_code || localStorage.getItem("zenfi_user_id") || "ZF-7829401";
  const referralCode = userId.replace("ZF-", "ZF");

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated count-up for amount
  useEffect(() => {
    if (showContent) {
      const duration = 600;
      const steps = 15;
      const increment = AMOUNT / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= AMOUNT) {
          setDisplayAmount(AMOUNT);
          clearInterval(timer);
        } else {
          setDisplayAmount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [showContent]);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-magenta/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet" />
            <span className="text-base font-semibold text-foreground">Buy ZFC</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="relative z-10 px-5 py-5 pb-8 w-full max-w-md mx-auto">
        <div className={`space-y-6 transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          {/* Amount Card */}
          <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet/12 to-magenta/8 border border-violet/20 p-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet/15 rounded-full blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">ZFC Purchase</span>
                </div>
                <div className="text-2xl font-bold text-foreground tracking-tight">
                  {formatCurrency(displayAmount)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  You will receive <span className="text-teal font-semibold">{ZFC_AMOUNT.toLocaleString()} ZFC</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal/15 text-teal border border-teal/20">Best Value</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet/15 text-violet border border-violet/20">Instant</span>
              </div>
            </div>
          </section>

          {/* Trust Badges */}
          <div className="flex items-center justify-between px-2">
            {[
              { icon: Shield, label: "Bank-Grade Security" },
              { icon: Zap, label: "Instant Processing" },
              { icon: BadgeCheck, label: "100% Verified" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-violet" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Bank Transfer Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-violet" />
              <h3 className="text-sm font-semibold text-foreground">Transfer Details</h3>
            </div>
            
            <div className="space-y-3">
              {/* Bank Name */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Bank Name</span>
                    <span className="font-semibold text-foreground">{BANK_NAME}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(BANK_NAME, "Bank Name")}
                    className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
                  >
                    {copiedField === "Bank Name" ? (
                      <Check className="w-4 h-4 text-teal" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Account Number */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet/10 to-magenta/5 border border-violet/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Account Number</span>
                    <span className="font-mono font-bold text-lg text-foreground tracking-wider">{ACCOUNT_NUMBER}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(ACCOUNT_NUMBER, "Account Number")}
                    className="p-2.5 rounded-xl bg-violet/20 hover:bg-violet/30 transition-all active:scale-95"
                  >
                    {copiedField === "Account Number" ? (
                      <Check className="w-4 h-4 text-teal" />
                    ) : (
                      <Copy className="w-4 h-4 text-violet" />
                    )}
                  </button>
                </div>
              </div>

              {/* Account Name */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Account Name</span>
                    <span className="font-semibold text-foreground text-sm">{ACCOUNT_NAME}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(ACCOUNT_NAME, "Account Name")}
                    className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
                  >
                    {copiedField === "Account Name" ? (
                      <Check className="w-4 h-4 text-teal" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="p-4 rounded-xl bg-teal/10 border border-teal/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Amount to Transfer</span>
                    <span className="font-bold text-lg text-teal">{formatCurrency(AMOUNT)}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(AMOUNT.toString(), "Amount")}
                    className="p-2.5 rounded-xl bg-teal/20 hover:bg-teal/30 transition-all active:scale-95"
                  >
                    {copiedField === "Amount" ? (
                      <Check className="w-4 h-4 text-teal" />
                    ) : (
                      <Copy className="w-4 h-4 text-teal" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Referral Section */}
          <section className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Your Referral Code</span>
                <span className="font-mono text-base font-bold text-foreground">{referralCode}</span>
              </div>
            </div>
            <button
              onClick={() => handleCopy(referralCode, "Referral Code")}
              className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
            >
              {copiedField === "Referral Code" ? (
                <Check className="w-5 h-5 text-teal" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </section>

          {/* Instructions */}
          <section className="p-4 rounded-xl bg-secondary/20 border border-border/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">How to Complete</h4>
            <ol className="text-xs text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet/20 text-violet text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>Copy the account details above</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet/20 text-violet text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span>Open your banking app and transfer exactly ₦{AMOUNT.toLocaleString()}</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet/20 text-violet text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span>Your ZFC will be credited automatically after confirmation</span>
              </li>
            </ol>
          </section>

          {/* Security Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

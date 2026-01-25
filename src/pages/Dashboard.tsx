import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { VirtualBankCard } from "@/components/ui/VirtualBankCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { ProfilePanel } from "@/components/ui/ProfilePanel";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { useClaimTimer } from "@/hooks/useClaimTimer";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { 
  Bell,
  Settings,
  Wallet,
  Gift,
  Users,
  Clock,
  Headphones,
  Coins,
  ChevronRight,
  MessageCircle,
  Timer
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TRANSACTIONS_KEY = "zenfi_transactions";

const actionButtons = [
  { icon: Coins, label: "Buy ZFC", color: "from-violet to-magenta", animation: "pulse" as const },
  { icon: Gift, label: "Refer & Earn", color: "from-magenta to-gold", route: "/referral", animation: "bounce" as const },
  { icon: Users, label: "Community", color: "from-teal to-violet", route: "/community", animation: "float" as const },
  { icon: Clock, label: "History", color: "from-gold to-magenta", route: "/history", animation: "glow" as const },
  { icon: Headphones, label: "Support", color: "from-violet to-teal", route: "/support", animation: "pulse" as const },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [balance, setBalance] = useState(180000);
  const [isClaiming, setIsClaiming] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { canClaim, remainingTime, startCooldown } = useClaimTimer();
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  useRouteHistory();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("zenfi_onboarding_complete");
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
    
    // Load saved balance
    const savedBalance = localStorage.getItem("zenfi_balance");
    if (savedBalance) {
      setBalance(parseInt(savedBalance, 10));
    }
  }, []);

  const addTransaction = (type: "claim" | "withdraw", amount: number) => {
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      date: new Date().toISOString(),
      status: "success",
    };
    
    const existing = localStorage.getItem(TRANSACTIONS_KEY);
    const transactions = existing ? JSON.parse(existing) : [];
    transactions.unshift(transaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("zenfi_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const handleClaim = () => {
    if (!canClaim || isClaiming) return;
    
    setIsClaiming(true);
    
    // INSTANT update - no delay
    const newBalance = balance + 10000;
    setBalance(newBalance);
    localStorage.setItem("zenfi_balance", newBalance.toString());
    addTransaction("claim", 10000);
    startCooldown();
    
    // Brief visual feedback then reset
    setTimeout(() => {
      setIsClaiming(false);
    }, 300);
    
    toast({
      title: "₦10,000 Successfully Claimed!",
      description: "Your balance has been updated.",
    });
  };

  const handleActionClick = (route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <FloatingParticles />
      
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
      <ProfilePanel isOpen={showProfilePanel} onClose={() => setShowProfilePanel(false)} />
      
      {/* Official ZenFi Warning Banner */}
      <WarningBanner />
      
      {/* Compact Header */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between">
        <ZenfiLogo size="sm" />
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors relative group">
            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-magenta rounded-full animate-pulse" />
          </button>
          <ProfileAvatar onClick={() => setShowProfilePanel(true)} size="sm" />
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors group"
          >
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-4">
        {/* Compact Virtual Bank Card */}
        <div className="animate-fade-in-up">
          <VirtualBankCard balance={balance} cardNumber="4829" className="min-h-[110px]" />
        </div>

        {/* Primary Action Buttons - More Compact */}
        <div 
          className="grid grid-cols-2 gap-3 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Claim Button with Timer */}
          <button
            onClick={handleClaim}
            disabled={!canClaim || isClaiming}
            className={`relative overflow-hidden glass-card p-3 flex items-center gap-3 transition-all duration-300 ${
              !canClaim 
                ? "opacity-70 cursor-not-allowed" 
                : "hover:scale-[1.02] active:scale-[0.98]"
            }`}
            style={{
              background: !canClaim 
                ? "hsla(240, 7%, 12%, 0.9)"
                : "linear-gradient(135deg, hsla(262, 76%, 57%, 0.2), hsla(289, 100%, 65%, 0.15))",
            }}
          >
            {/* Pulse glow when active */}
            {canClaim && !isClaiming && (
              <div 
                className="absolute inset-0 animate-pulse opacity-30"
                style={{
                  background: "radial-gradient(circle at center, hsla(262, 76%, 57%, 0.4) 0%, transparent 70%)",
                }}
              />
            )}
            
            <div className={`p-2 rounded-xl ${!canClaim ? "bg-muted" : "bg-violet/20"}`}>
              {isClaiming ? (
                <div className="w-4 h-4 border-2 border-violet border-t-transparent rounded-full animate-spin" />
              ) : !canClaim ? (
                <Timer className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Gift className="w-4 h-4 text-violet" />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              {!canClaim ? (
                <>
                  <span className="font-semibold text-foreground block text-sm">
                    Next Claim
                  </span>
                  <span className="text-xs text-teal font-mono">{remainingTime}</span>
                </>
              ) : isClaiming ? (
                <span className="font-semibold text-foreground block text-sm">
                  Claiming...
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground block text-sm">
                    Claim ₦10,000
                  </span>
                  <span className="text-xs text-muted-foreground">Tap to claim</span>
                </>
              )}
            </div>
          </button>

          {/* Withdraw Button */}
          <button
            onClick={() => navigate("/withdrawal")}
            className="relative overflow-hidden glass-card p-3 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            style={{
              background: "linear-gradient(135deg, hsla(174, 88%, 56%, 0.15), hsla(262, 76%, 57%, 0.1))",
            }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "radial-gradient(circle at center, hsla(174, 88%, 56%, 0.2) 0%, transparent 70%)",
              }}
            />
            <div className="p-2 rounded-xl bg-teal/20">
              <Wallet className="w-4 h-4 text-teal" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground block text-sm">Withdraw</span>
              <span className="text-xs text-muted-foreground">To bank</span>
            </div>
          </button>
        </div>

        {/* Action Grid - Compact */}
        <div 
          className="space-y-2 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-display font-semibold">Quick Actions</h2>
            <span className="text-[10px] text-muted-foreground">Fast & reliable</span>
          </div>
          
          <div className="grid grid-cols-5 gap-1.5">
            {actionButtons.map((action, index) => (
              <div
                key={action.label}
                className="flex flex-col items-center gap-1 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + index * 0.03}s` }}
              >
                <button
                  onClick={() => handleActionClick(action.route)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center hover:scale-[1.08] active:scale-[0.92] transition-all duration-200 group bg-gradient-to-br ${action.color}`}
                  style={{
                    boxShadow: "0 3px 12px hsla(262, 76%, 57%, 0.3), inset 0 1px 0 hsla(0, 0%, 100%, 0.1)",
                  }}
                >
                  <AnimatedIcon 
                    icon={action.icon} 
                    className="w-5 h-5 text-white" 
                    animationType={action.animation}
                  />
                </button>
                <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">
                  {action.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card - Compact */}
        <GlassCard 
          className="text-center py-3 animate-fade-in-up"
          style={{ animationDelay: "0.35s" }}
        >
          <h3 className="font-display font-semibold text-sm mb-1">Powered by Smart Infrastructure</h3>
          <p className="text-xs text-muted-foreground">
            Secured & encrypted • Optimized performance
          </p>
        </GlassCard>

        {/* Bottom Carousel - Auto-sliding */}
        <div 
          className="animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-display font-semibold">Featured</h2>
            <button className="flex items-center gap-0.5 text-[10px] text-teal hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex gap-2">
              {[1, 2, 3].map((_, index) => (
                <div 
                  key={index}
                  className="flex-[0_0_85%] min-w-0 glass-card h-28 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, 
                      hsla(${262 + index * 30}, 76%, 57%, 0.15), 
                      hsla(${289 + index * 20}, 100%, 65%, 0.1)
                    )`,
                  }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, hsla(262, 76%, 57%, 0.3) 1px, transparent 1px)`,
                        backgroundSize: "16px 16px",
                      }}
                    />
                  </div>
                  
                  <div className="text-center z-10">
                    <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-secondary/50 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Banner {index + 1}</p>
                    <p className="text-[10px] text-muted-foreground/60">Image placeholder</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-1.5 mt-2">
            {[0, 1, 2].map((index) => (
              <button 
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index 
                    ? "bg-violet w-3" 
                    : "bg-muted-foreground/30 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Secure Footer */}
        <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-[10px] text-muted-foreground/50">
            🔒 Secure environment • Encrypted system • Powered by ZenFi
          </p>
        </div>
      </main>
    </div>
  );
};

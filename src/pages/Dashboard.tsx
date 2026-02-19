import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { VirtualBankCard } from "@/components/ui/VirtualBankCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { ProfilePanel } from "@/components/ui/ProfilePanel";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { BannedOverlay } from "@/components/ui/BannedOverlay";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useClaimTimer } from "@/hooks/useClaimTimer";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";
import {
  Settings,
  Wallet,
  Gift,
  Timer,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import creditbuzzLogo from "@/assets/creditbuzz-logo.jpg";
import zfcIcon from "@/assets/zfc-icon.png";
import referIcon from "@/assets/refer-icon.png";
import supportIcon from "@/assets/support-icon.png";
import historyIcon from "@/assets/history-icon.png";
import communityIcon from "@/assets/community-icon.png";

const carouselImages = [creditbuzzLogo];



const actionButtons = [
  { icon: null, customIcon: zfcIcon, label: "Buy CBC", color: "from-violet to-magenta", route: "/buy-zfc", animation: "pulse" as const },
  { icon: null, customIcon: historyIcon, label: "Tasks", color: "from-gold to-magenta", route: "/history", animation: "bounce" as const },
  { icon: null, customIcon: communityIcon, label: "Community", color: "from-teal to-violet", route: "/community", animation: "float" as const },
  { icon: null, customIcon: referIcon, label: "Refer & Earn", color: "from-magenta to-gold", route: "/referral", animation: "glow" as const },
  { icon: null, customIcon: supportIcon, label: "Support", color: "from-violet to-teal", route: "https://t.me/zenfiadmin", animation: "pulse" as const, external: true },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isBanned, isLoading: authLoading } = useAuth();
  const { 
    hasPendingPayment, 
    latestPayment, 
    isLoading: paymentLoading,
    statusChanged,
    clearStatusChange,
    needsStatusAcknowledgement 
  } = usePaymentState(user?.id);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  // Only used for optimistic claim updates - starts null, set after a claim
  const [claimBoost, setClaimBoost] = useState(0);
  
  // Balance: profile balance + any optimistic claim boost applied this session
  const profileBalance = profile?.balance ?? null;
  const displayBalance = profileBalance !== null ? Number(profileBalance) + claimBoost : null;
  const isBalanceLoading = displayBalance === null;
  const { canClaim, remainingTime, startCooldown } = useClaimTimer();
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  
  // Track route for persistence
  useRouteHistory();

  // Redirect to payment status when payment is approved/rejected in real-time
  useEffect(() => {
    if (statusChanged) {
      navigate("/payment-status");
    }
  }, [statusChanged, navigate]);

  // Check on mount if user needs to see their approved/rejected payment status
  useEffect(() => {
    if (!paymentLoading && needsStatusAcknowledgement) {
      navigate("/payment-status");
    }
  }, [paymentLoading, needsStatusAcknowledgement, navigate]);

  // Reset claimBoost when profile balance updates from server
  // Only reset if server balance already includes the boost (i.e., server caught up)
  const lastServerBalanceRef = useRef<number | null>(null);
  useEffect(() => {
    if (profile?.balance !== undefined && profile?.balance !== null) {
      const serverBalance = Number(profile.balance);
      const prevServer = lastServerBalanceRef.current;
      // If server balance went UP (meaning our update was persisted), safe to reset boost
      if (prevServer !== null && serverBalance >= prevServer + claimBoost) {
        setClaimBoost(0);
      } else if (prevServer === null) {
        // First load — no boost to worry about
        setClaimBoost(0);
      }
      lastServerBalanceRef.current = serverBalance;
    }
  }, [profile?.balance]);

  // Real-time ZFC code notification only (no balance manipulation)
  useEffect(() => {
    if (!profile?.user_id) return;
    const currentZfcCode = (profile as typeof profile & { zfc_code?: string })?.zfc_code;

    const channel = supabase
      .channel("dashboard-zfc-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${profile.user_id}`,
        },
        (payload) => {
          const newData = payload.new as { zfc_code?: string };
          if (newData.zfc_code && newData.zfc_code !== currentZfcCode) {
            toast({
              title: "🎉 CBC Code Purchased!",
              description: "Your withdrawal activation code is ready. View it in your profile.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id, profile]);


  useEffect(() => {
    const onboardingComplete = localStorage.getItem("creditbuzz_onboarding_complete");
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, []);

  const addClaimToDatabase = async (amount: number) => {
    if (!user?.id) return;
    
    try {
      await supabase.from("claims").insert({
        user_id: user.id,
        amount,
        status: "success",
      });
    } catch (error) {
      console.error("Error saving claim to database:", error);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("creditbuzz_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const handleClaim = async () => {
    // Guard: must have a real user session
    if (isClaiming) return;
    if (!canClaim) return;

    // Get user id from auth directly (profile may still be loading)
    const userId = user?.id;
    if (!userId) return;

    setIsClaiming(true);

    const currentBalance = Number(profile?.balance ?? 0) + claimBoost;
    const newBalance = currentBalance + 10000;

    // INSTANT UI update
    setClaimBoost(prev => prev + 10000);

    // Cache update
    try {
      const cached = localStorage.getItem("creditbuzz_profile_cache");
      if (cached) {
        const cachedProfile = JSON.parse(cached);
        cachedProfile.balance = newBalance;
        localStorage.setItem("creditbuzz_profile_cache", JSON.stringify(cachedProfile));
      }
    } catch (e) {
      // Ignore cache errors
    }

    toast({
      title: "₦10,000 Successfully Claimed!",
      description: "Your balance has been updated.",
    });

    // Start server-side cooldown (uses supabase.auth.getUser() internally)
    startCooldown().catch(console.error);

    const syncBalance = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        const { error } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('user_id', userId);

        if (!error) return;
        console.error(`Balance sync attempt ${i + 1} failed:`, error);
        if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    };

    syncBalance().catch(console.error);
    addClaimToDatabase(10000).catch(console.error);

    setIsClaiming(false);
  };

  const handleActionClick = (route?: string, external?: boolean) => {
    if (route) {
      if (external) {
        window.open(route, "_blank", "noopener,noreferrer");
        return;
      }
      // If user is trying to go to Buy ZFC and has pending payment, redirect to status
      if (route === "/buy-zfc" && hasPendingPayment) {
        navigate("/payment-status");
        return;
      }
      navigate(route);
    }
  };

  // Show banned overlay if user is banned
  if (isBanned) {
    return <BannedOverlay reason={profile?.ban_reason} />;
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <FloatingParticles />
      
      {showOnboarding && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete}
          isNewAccount={!!profile?.created_at && (Date.now() - new Date(profile.created_at).getTime()) < 30 * 60 * 1000}
        />
      )}
      
      <ProfilePanel isOpen={showProfilePanel} onClose={() => setShowProfilePanel(false)} />
      
      {/* Official CreditBuzz Warning Banner */}
      <WarningBanner />
      
      {/* Compact Header */}
      <header className="relative z-50 px-4 py-3 flex items-center justify-between">
        <ZenfiLogo size="sm" />
        <div className="flex items-center gap-2">
          <NotificationPanel />
          <ProfileAvatar onClick={() => setShowProfilePanel(true)} size="sm" />
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors group"
          >
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </header>

      <main className="relative z-0 px-4 space-y-4">
        {/* Compact Virtual Bank Card - show skeleton if balance loading */}
        <div className="animate-fade-in-up">
          <VirtualBankCard 
            balance={isBalanceLoading ? 0 : displayBalance} 
            cardNumber="4829" 
            className="min-h-[110px]"
            isLoading={isBalanceLoading}
          />
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
                  onClick={() => handleActionClick(action.route, (action as any).external)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center hover:scale-[1.08] active:scale-[0.92] transition-all duration-200 group bg-gradient-to-br ${action.color}`}
                  style={{
                    boxShadow: "0 3px 12px hsla(262, 76%, 57%, 0.3), inset 0 1px 0 hsla(0, 0%, 100%, 0.1)",
                  }}
                >
                  {action.customIcon ? (
                    <img src={action.customIcon} alt={action.label} className="w-7 h-7 rounded-full object-cover" />
                  ) : action.icon && (
                    <AnimatedIcon 
                      icon={action.icon} 
                      className="w-5 h-5 text-white" 
                      animationType={action.animation}
                    />
                  )}
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
          </div>
          
          <div 
            className="overflow-hidden rounded-2xl shadow-lg"
            style={{
              border: "1px solid hsla(262, 76%, 57%, 0.25)",
              boxShadow: "0 8px 32px hsla(262, 76%, 57%, 0.18)",
            }}
            ref={emblaRef}
          >
            <div className="flex">
              {carouselImages.map((image, index) => (
                <div 
                  key={index}
                  className="flex-[0_0_100%] min-w-0 relative"
                  style={{ height: "160px" }}
                >
                  <img 
                    src={image} 
                    alt={`CreditBuzz featured ad ${index + 1}`}
                    className="w-full h-full"
                    style={{ objectFit: "fill", display: "block" }}
                  />
                  {/* Ad label */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                    <span className="text-[9px] text-white/80 font-medium tracking-wide">Official Ad</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secure Footer */}
        <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-[10px] text-muted-foreground/50">
            🔒 Secure environment • Encrypted system • Powered by CreditBuzz
          </p>
        </div>
      </main>
    </div>
  );
};

import { useState, useEffect } from "react";
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
import { useClaimTimer } from "@/hooks/useClaimTimer";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentState } from "@/hooks/usePaymentState";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Settings,
  Wallet,
  Gift,
  ChevronRight,
  Timer,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import carouselImage1 from "@/assets/carousel-1.jpeg";
import carouselImage2 from "@/assets/carousel-2.jpeg";
import zfcIcon from "@/assets/zfc-icon.png";
import referIcon from "@/assets/refer-icon.png";
import supportIcon from "@/assets/support-icon.png";
import historyIcon from "@/assets/history-icon.png";
import communityIcon from "@/assets/community-icon.png";

const carouselImages = [carouselImage1, carouselImage2];

const TRANSACTIONS_KEY = "zenfi_transactions";

const actionButtons = [
  { icon: null, customIcon: zfcIcon, label: "Buy ZFC", color: "from-violet to-magenta", route: "/buy-zfc", animation: "pulse" as const },
  { icon: null, customIcon: referIcon, label: "Refer & Earn", color: "from-magenta to-gold", route: "/referral", animation: "bounce" as const },
  { icon: null, customIcon: communityIcon, label: "Community", color: "from-teal to-violet", route: "/community", animation: "float" as const },
  { icon: null, customIcon: historyIcon, label: "History", color: "from-gold to-magenta", route: "/history", animation: "glow" as const },
  { icon: null, customIcon: supportIcon, label: "Support", color: "from-violet to-teal", route: "/support", animation: "pulse" as const },
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
  const [balance, setBalance] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { canClaim, remainingTime, startCooldown } = useClaimTimer();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  
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

  // Sync balance from profile - stable initialization
  useEffect(() => {
    if (profile?.balance !== undefined && profile?.balance !== null) {
      const numBalance = Number(profile.balance);
      if (!isNaN(numBalance) && numBalance >= 0) {
        setBalance(numBalance);
      }
    }
  }, [profile?.balance]);

  // Real-time balance subscription for instant updates (new users, admin credits, etc.)
  useEffect(() => {
    if (!profile?.user_id) return;

    const channel = supabase
      .channel("dashboard-balance-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${profile.user_id}`,
        },
        (payload) => {
          const newBalance = Number(payload.new.balance);
          // Only update if valid number and greater than or equal to 0
          if (!isNaN(newBalance) && newBalance >= 0) {
            setBalance(newBalance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  // Update carousel slide indicator
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("zenfi_onboarding_complete");
    if (!onboardingComplete) {
      setShowOnboarding(true);
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

  const handleClaim = async () => {
    if (!canClaim || isClaiming || !profile?.user_id) return;
    
    setIsClaiming(true);
    
    try {
      // Update balance directly in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ balance: balance + 10000 })
        .eq('user_id', profile.user_id);
      
      if (error) {
        console.error("Claim error:", error);
        toast({
          title: "Claim Failed",
          description: "Please try again",
          variant: "destructive",
        });
        setIsClaiming(false);
        return;
      }
      
      // SUCCESS - Now update UI
      const newBalance = balance + 10000;
      setBalance(newBalance);
      addTransaction("claim", 10000);
      startCooldown();
      
      toast({
        title: "₦10,000 Successfully Claimed!",
        description: "Your balance has been updated.",
      });
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "Claim Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleActionClick = (route?: string) => {
    if (route) {
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
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
      <ProfilePanel isOpen={showProfilePanel} onClose={() => setShowProfilePanel(false)} />
      
      {/* Official ZenFi Warning Banner */}
      <WarningBanner />
      
      {/* Compact Header */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between">
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
            <button className="flex items-center gap-0.5 text-[10px] text-teal hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {carouselImages.map((image, index) => (
                <div 
                  key={index}
                  className="flex-[0_0_100%] min-w-0 rounded-xl overflow-hidden relative h-32"
                >
                  <img 
                    src={image} 
                    alt={`Featured banner ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    style={{
                      imageRendering: "auto",
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    }}
                  />
                  {/* Subtle gradient overlay for polish */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(180deg, transparent 60%, hsla(0, 0%, 0%, 0.3) 100%)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-1.5 mt-2">
            {carouselImages.map((_, index) => (
              <button 
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index 
                    ? "bg-violet w-4" 
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

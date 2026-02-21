import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  ExternalLink,
  ArrowLeft,
  Star,
  Check,
  Coins,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import creditbuzzLogo from "@/assets/creditbuzz-logo.jpg";
import carousel3 from "@/assets/carousel-3.jpeg";
import carousel4 from "@/assets/carousel-4.jpeg";
import zfcIcon from "@/assets/cbc-icon.png";
import referIcon from "@/assets/refer-icon.png";
import supportIcon from "@/assets/support-icon.png";
import historyIcon from "@/assets/history-icon.png";
import communityIcon from "@/assets/community-icon.png";

const carouselImages = [creditbuzzLogo, carousel3, carousel4];



const surveyTasks = [
  {
    id: 1, title: "Join Site Survey", description: "Complete a quick site survey & earn rewards",
    link: "https://helpinghands.money", reward: "+₦5,000", badge: "HOT", icon: Star,
    iconBg: "linear-gradient(135deg, hsl(45,100%,51%), hsl(25,100%,55%))",
    bgFrom: "hsla(45,100%,51%,0.06)", bgTo: "hsla(262,76%,57%,0.04)",
    borderColor: "hsla(45,100%,51%,0.2)", badgeBg: "hsla(45,100%,51%,0.2)", badgeColor: "hsl(45,100%,51%)",
  },
  {
    id: 2, title: "Referral Bonus Survey", description: "Answer referral questions & get paid instantly",
    link: "https://helpinghands.money", reward: "+₦5,000", badge: "NEW", icon: Users,
    iconBg: "linear-gradient(135deg, hsl(289,100%,65%), hsl(262,76%,57%))",
    bgFrom: "hsla(289,100%,65%,0.06)", bgTo: "hsla(262,76%,57%,0.04)",
    borderColor: "hsla(289,100%,65%,0.2)", badgeBg: "hsla(289,100%,65%,0.2)", badgeColor: "hsl(289,100%,65%)",
  },
  {
    id: 3, title: "Earnings Growth Task", description: "Help us improve & unlock extra earnings",
    link: "https://helpinghands.money", reward: "+₦5,000", badge: "EARN", icon: TrendingUp,
    iconBg: "linear-gradient(135deg, hsl(174,88%,56%), hsl(174,70%,40%))",
    bgFrom: "hsla(174,88%,56%,0.06)", bgTo: "hsla(262,76%,57%,0.04)",
    borderColor: "hsla(174,88%,56%,0.2)", badgeBg: "hsla(174,88%,56%,0.2)", badgeColor: "hsl(174,88%,56%)",
  },
  {
    id: 4, title: "Community Feedback", description: "Share your experience and earn bonus credits",
    link: "https://helpinghands.money", reward: "+₦5,000", badge: "EASY", icon: Sparkles,
    iconBg: "linear-gradient(135deg, hsl(262,76%,57%), hsl(174,88%,56%))",
    bgFrom: "hsla(262,76%,57%,0.06)", bgTo: "hsla(174,88%,56%,0.04)",
    borderColor: "hsla(262,76%,57%,0.2)", badgeBg: "hsla(262,76%,57%,0.2)", badgeColor: "hsl(262,76%,57%)",
  },
  {
    id: 5, title: "Daily Reward Survey", description: "Daily task — complete & collect your coins",
    link: "https://helpinghands.money", reward: "+₦5,000", badge: "DAILY", icon: Coins,
    iconBg: "linear-gradient(135deg, hsl(35,100%,55%), hsl(45,100%,51%))",
    bgFrom: "hsla(35,100%,55%,0.06)", bgTo: "hsla(45,100%,51%,0.04)",
    borderColor: "hsla(35,100%,55%,0.2)", badgeBg: "hsla(35,100%,55%,0.2)", badgeColor: "hsl(35,100%,55%)",
  },
];

const allActionButtons = [
  { icon: null, customIcon: supportIcon, label: "Support", color: "from-violet to-teal", route: "https://t.me/creditbuzzadmin", animation: "pulse" as const, external: true },
  { icon: null, customIcon: historyIcon, label: "Tasks", color: "from-gold to-magenta", route: "tasks", animation: "bounce" as const },
  { icon: null, customIcon: communityIcon, label: "Community", color: "from-teal to-violet", route: "/community", animation: "float" as const },
  { icon: null, customIcon: referIcon, label: "Tap & Earn", color: "from-magenta to-gold", route: "/referral", animation: "glow" as const },
  { icon: null, customIcon: zfcIcon, label: "Buy CBC", color: "from-violet to-magenta", route: "/buy-zfc", animation: "pulse" as const, weekendOnly: true },
];

// Helper: check if it's currently a weekend (Fri 00:00 - Sun 23:50)
const isWeekendNow = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat
  if (day === 5 || day === 6) return true;
  if (day === 0) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours < 23 || (hours === 23 && minutes <= 50);
  }
  return false;
};

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
  const location = useLocation();
  const [showTasksSheet, setShowTasksSheet] = useState(() => !!(location.state as any)?.openTasks);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("creditbuzz_completed_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [recentTransactions, setRecentTransactions] = useState<{id: string; amount: number; date: string; status: string; type: string}[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
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

  // Real-time CBC code notification only (no balance manipulation)
  useEffect(() => {
    if (!profile?.user_id) return;
    const currentZfcCode = (profile as typeof profile & { zfc_code?: string })?.zfc_code;

    const channel = supabase
      .channel("dashboard-cbc-updates")
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

  // Fetch recent transactions for history sheet on mount
  useEffect(() => {
    if (user?.id) fetchRecentTransactions();
  }, [user?.id]);

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

  const handleClaim = () => {
    // Guard: must have a real user session and not already claiming
    if (isClaiming || !canClaim) return;

    // Use user.id if available, otherwise fall back to cached profile's user_id
    const userId = user?.id || profile?.user_id;
    if (!userId) return;

    // Lock immediately — prevents double-tap
    setIsClaiming(true);

    // Start cooldown FIRST so canClaim flips to false instantly
    startCooldown()
      .then(() => setTimeout(() => setIsClaiming(false), 300))
      .catch((err) => {
        console.error(err);
        setTimeout(() => setIsClaiming(false), 300);
      });
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

    // Fire-and-forget server sync
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

  };

  const handleTaskComplete = async (task: typeof surveyTasks[0]) => {
    window.open(task.link, "_blank", "noopener,noreferrer");
    if (completedTasks.includes(task.id)) return;

    const updatedCompleted = [...completedTasks, task.id];
    setCompletedTasks(updatedCompleted);
    localStorage.setItem("creditbuzz_completed_tasks", JSON.stringify(updatedCompleted));

    toast({
      title: "✅ Task Completed!",
      description: "Task has been marked as done.",
    });
  };

  const fetchRecentTransactions = async () => {
    if (!user?.id) return;
    setClaimsLoading(true);
    try {
      const [{ data: claims }, { data: withdrawals }] = await Promise.all([
        supabase.from("claims").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
        supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
      ]);
      const all = [
        ...(claims || []).map(c => ({ id: c.id, amount: c.amount, date: c.created_at, status: c.status, type: "claim" })),
        ...(withdrawals || []).map(w => ({ id: w.id, amount: w.amount, date: w.created_at, status: w.status, type: "withdraw" })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12);
      setRecentTransactions(all);
    } catch (e) { console.error(e); }
    finally { setClaimsLoading(false); }
  };

  const handleActionClick = (route?: string, external?: boolean) => {
    if (route === "tasks") {
      setShowTasksSheet(true);
      return;
    }
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
        {/* Balance Card with History button inside */}
        <div className="animate-fade-in-up">
          <VirtualBankCard 
            balance={isBalanceLoading ? 0 : displayBalance} 
            cardNumber="4829" 
            className="min-h-[110px]"
            isLoading={isBalanceLoading}
            onHistoryClick={() => { fetchRecentTransactions(); setShowHistorySheet(true); }}
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
          
          <div className={`grid gap-1.5 ${isWeekendNow() ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {allActionButtons.filter(action => !(action as any).weekendOnly || isWeekendNow()).map((action, index) => {
              const isHiddenWeekend = false;
              return (
              <div
                key={action.label}
                className="flex flex-col items-center gap-1 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + index * 0.03}s` }}
              >
                <button
                  onClick={() => {
                    if (isHiddenWeekend) {
                      toast({
                        title: "⏳ Available on Weekends",
                        description: "CBC purchase opens on Friday. Make sure to buy your CBC code by Friday 11:57 AM!",
                      });
                      return;
                    }
                    handleActionClick(action.route, (action as any).external);
                  }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center hover:scale-[1.08] active:scale-[0.92] transition-all duration-200 group bg-gradient-to-br ${action.color} ${isHiddenWeekend ? "opacity-40 grayscale" : ""}`}
                  style={{
                    boxShadow: "0 3px 12px hsla(262, 76%, 57%, 0.3), inset 0 1px 0 hsla(0, 0%, 100%, 0.1)",
                  }}
                >
                  {action.customIcon ? (
                    <img src={action.customIcon} alt={action.label} className="w-full h-full rounded-xl object-cover" />
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
              );
            })}
          </div>
        </div>


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

      {/* ── TASKS PAGE ── */}
      {showTasksSheet && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in-up">
          {/* Header */}
          <header className="flex items-center gap-3 px-4 py-4 border-b border-border/40">
            <button
              onClick={() => setShowTasksSheet(false)}
              className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-display font-semibold tracking-tight">Earn More</h1>
              <p className="text-[10px] text-muted-foreground">Complete tasks & earn rewards</p>
            </div>
            <span className="text-[10px] text-gold font-bold animate-pulse">🔥 Live</span>
          </header>

          {/* Tasks list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div
              className="p-4 rounded-2xl mb-2"
              style={{ background: "hsla(45, 93%, 58%, 0.06)", border: "1px solid hsla(45, 93%, 58%, 0.15)" }}
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-gold font-semibold">💰 Earn rewards</span> by completing simple survey tasks. Tap any task to start.
              </p>
            </div>

            {surveyTasks.map((task) => {
              const isCompleted = completedTasks.includes(task.id);
              return (
              <button
                key={task.id}
                onClick={() => handleTaskComplete(task)}
                className={`block w-full text-left p-4 rounded-2xl relative overflow-hidden hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 ${isCompleted ? "opacity-60" : ""}`}
                style={{ background: `linear-gradient(135deg, ${task.bgFrom}, ${task.bgTo})`, border: `1px solid ${task.borderColor}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isCompleted ? "linear-gradient(135deg, hsl(142,71%,45%), hsl(142,60%,35%))" : task.iconBg }}>
                    {isCompleted ? <Check className="w-6 h-6 text-white" /> : <task.icon className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="font-display font-semibold text-sm text-foreground truncate">{task.title}</p>
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold flex-shrink-0" style={{ background: isCompleted ? "hsla(142,71%,45%,0.2)" : task.badgeBg, color: isCompleted ? "hsl(142,71%,45%)" : task.badgeColor }}>{isCompleted ? "DONE" : task.badge}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{isCompleted ? "Completed — ₦5,000 added" : task.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-base font-display font-bold ${isCompleted ? "text-teal" : "text-gold"}`}>{isCompleted ? "✓ Done" : task.reward}</span>
                    {!isCompleted && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </div>
              </button>
              );
            })}
          
          </div>
        </div>
      )}
      {/* ── HISTORY SHEET ── */}
      {showHistorySheet && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistorySheet(false)} />
          <div
            className="relative mt-auto w-full rounded-t-2xl overflow-hidden flex flex-col animate-fade-in-up"
            style={{ maxHeight: "88vh", background: "hsl(var(--background))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div>
                <h2 className="text-base font-display font-bold">Transaction History</h2>
                <p className="text-[10px] text-muted-foreground">{recentTransactions.length} recent transactions</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowHistorySheet(false); navigate("/history"); }} className="text-[11px] text-violet font-semibold px-2 py-1 rounded-lg bg-violet/10 hover:bg-violet/20 transition-colors">
                  View All
                </button>
                <button onClick={() => setShowHistorySheet(false)} className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors">
                  <span className="text-muted-foreground text-sm font-bold">✕</span>
                </button>
              </div>
            </div>
            {/* Transactions list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {claimsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-violet border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Claim your first reward on the dashboard</p>
                </div>
              ) : (
                recentTransactions.map((txn, i) => (
                  <div key={txn.id} className="glass-card p-3 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className={`p-2 rounded-xl flex-shrink-0 ${txn.type === "claim" ? "bg-teal/20" : "bg-magenta/20"}`}>
                      {txn.type === "claim" ? (
                        <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-magenta" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">{txn.type === "claim" ? "Daily Claim" : "Withdrawal"}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(txn.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold text-sm ${txn.type === "claim" ? "text-teal" : "text-foreground"}`}>
                        {txn.type === "claim" ? "+" : "-"}₦{Number(txn.amount).toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-medium ${txn.status === "success" ? "text-teal" : txn.status === "pending" ? "text-gold" : "text-magenta"}`}>
                        {txn.status === "success" ? "Completed" : txn.status === "pending" ? "Pending" : "Failed"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

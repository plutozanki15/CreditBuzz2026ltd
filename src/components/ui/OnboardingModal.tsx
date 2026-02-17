import { useState } from "react";
import { Bell, Users, ExternalLink, Gift, Sparkles } from "lucide-react";
import { LuxuryButton } from "./LuxuryButton";

interface OnboardingModalProps {
  onComplete: () => void;
  isNewAccount?: boolean;
}

export const OnboardingModal = ({ onComplete, isNewAccount = false }: OnboardingModalProps) => {
  // If not a new account, skip the bonus step entirely
  const [step, setStep] = useState<"community" | "notifications" | "bonus">("community");
  const [communityJoined, setCommunityJoined] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleJoinCommunity = () => {
    window.open("https://whatsapp.com/channel/0029VbBuf3I23n3iPMYZnx2f", "_blank");
    setCommunityJoined(true);
  };

  const handleProceedToNotifications = () => {
    if (communityJoined) {
      setStep("notifications");
    }
  };

  const handleEnableNotifications = async () => {
    try {
      if ("Notification" in window) {
        await Notification.requestPermission();
      }
    } catch {
      console.log("Notifications not supported");
    }
    if (isNewAccount) {
      setStep("bonus");
    } else {
      onComplete();
    }
  };

  const handleSkipNotifications = () => {
    if (isNewAccount) {
      setStep("bonus");
    } else {
      onComplete();
    }
  };

  const handleClaimBonus = () => {
    setIsClaiming(true);
    // Short delay for visual feedback before completing
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop – no dismiss on click */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[380px] animate-modal-enter"
        style={{
          background: "hsla(240, 7%, 6%, 0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid hsla(262, 76%, 57%, 0.2)",
          borderRadius: "1.25rem",
          boxShadow:
            "0 25px 60px -15px hsla(0, 0%, 0%, 0.6), 0 0 40px hsla(262, 76%, 57%, 0.15)",
        }}
      >
        {/* Gradient border */}
        <div
          className="absolute inset-0 rounded-[1.25rem] pointer-events-none"
          style={{
            padding: "1px",
            background:
              "linear-gradient(135deg, hsla(262, 76%, 57%, 0.4), hsla(289, 100%, 65%, 0.3), hsla(37, 89%, 63%, 0.2))",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />

        <div className="relative p-6">
          {step === "community" ? (
            <>
              {/* Community Icon */}
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsla(262, 76%, 57%, 0.2), hsla(289, 100%, 65%, 0.1))",
                  border: "1px solid hsla(262, 76%, 57%, 0.3)",
                }}
              >
                <Users className="w-8 h-8 text-magenta" />
              </div>

              <h2 className="text-xl font-display font-semibold text-center mb-2">
                Join Our Community
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-2 leading-relaxed">
                You must join our community before entering the dashboard.
              </p>
              <p className="text-teal text-sm text-center mb-6 font-medium">
                Be part of the 50,000 lucky members 🎉
              </p>

              {!communityJoined ? (
                <LuxuryButton
                  onClick={handleJoinCommunity}
                  className="flex items-center justify-center gap-2"
                >
                  Join Community
                  <ExternalLink className="w-4 h-4" />
                </LuxuryButton>
              ) : (
                <LuxuryButton onClick={handleProceedToNotifications}>
                  Continue
                </LuxuryButton>
              )}
            </>
          ) : step === "notifications" ? (
            <>
              {/* Notification Icon */}
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsla(262, 76%, 57%, 0.2), hsla(289, 100%, 65%, 0.1))",
                  border: "1px solid hsla(262, 76%, 57%, 0.3)",
                }}
              >
                <Bell className="w-8 h-8 text-violet" />
              </div>

              <h2 className="text-xl font-display font-semibold text-center mb-2">
                Enable Notifications
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
                Stay updated on transactions, withdrawals, and important security
                alerts.
              </p>

              <LuxuryButton onClick={handleEnableNotifications}>
                Enable Notifications
              </LuxuryButton>

              <button
                onClick={handleSkipNotifications}
                className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </>
          ) : (
            <>
              {/* Bonus Step */}
              <div className="relative">
                {/* Animated sparkles background */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="absolute top-2 left-4 w-2 h-2 bg-gold rounded-full animate-pulse opacity-60" />
                  <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-teal rounded-full animate-pulse opacity-50" style={{ animationDelay: "0.3s" }} />
                  <div className="absolute bottom-8 left-8 w-1 h-1 bg-magenta rounded-full animate-pulse opacity-40" style={{ animationDelay: "0.6s" }} />
                  <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-violet rounded-full animate-pulse opacity-50" style={{ animationDelay: "0.9s" }} />
                </div>

                {/* Gift Icon with glow */}
                <div
                  className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background:
                      "linear-gradient(135deg, hsla(37, 89%, 63%, 0.25), hsla(289, 100%, 65%, 0.15))",
                    border: "1.5px solid hsla(37, 89%, 63%, 0.5)",
                    boxShadow: "0 0 30px hsla(37, 89%, 63%, 0.3), inset 0 0 20px hsla(37, 89%, 63%, 0.1)",
                  }}
                >
                  <Gift className="w-10 h-10 text-gold" />
                  <Sparkles className="w-4 h-4 text-gold absolute -top-1 -right-1 animate-pulse" />
                </div>

                <h2 className="text-xl font-display font-semibold text-center mb-1">
                  Welcome Bonus! 🎁
                </h2>
                <p className="text-muted-foreground text-xs text-center mb-4 uppercase tracking-widest">
                  New Member Reward
                </p>

                {/* Amount Display */}
                <div
                  className="relative py-5 px-4 rounded-xl mb-5 text-center"
                  style={{
                    background: "linear-gradient(135deg, hsla(37, 89%, 63%, 0.1), hsla(262, 76%, 57%, 0.05))",
                    border: "1px solid hsla(37, 89%, 63%, 0.3)",
                  }}
                >
                  <p className="text-muted-foreground text-xs mb-1 uppercase tracking-wider">
                    Your Bonus
                  </p>
                  <p 
                    className="text-3xl font-bold font-display"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--teal)))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 40px hsla(37, 89%, 63%, 0.3)",
                    }}
                  >
                    ₦130,000
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Credited to your CreditBuzz wallet
                  </p>
                </div>

                <LuxuryButton 
                  onClick={handleClaimBonus} 
                  loading={isClaiming}
                  className="relative overflow-hidden"
                >
                  {isClaiming ? "Claiming..." : "Claim Bonus"}
                </LuxuryButton>

                <p className="text-muted-foreground/50 text-xs text-center mt-4">
                  One-time bonus for new members only
                </p>
              </div>
            </>
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-5">
            <div className={`w-2 h-2 rounded-full transition-colors ${step === "community" ? "bg-violet" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step === "notifications" ? "bg-violet" : "bg-muted"}`} />
            {isNewAccount && (
              <div className={`w-2 h-2 rounded-full transition-colors ${step === "bonus" ? "bg-gold" : "bg-muted"}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

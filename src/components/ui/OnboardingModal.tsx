import { useState } from "react";
import { Bell, Users, X, ExternalLink } from "lucide-react";
import { LuxuryButton } from "./LuxuryButton";

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  // Step order: community FIRST, notifications SECOND
  const [step, setStep] = useState<"community" | "notifications">("community");
  const [communityJoined, setCommunityJoined] = useState(false);

  const handleJoinCommunity = () => {
    window.open("https://whatsapp.com/channel/0029VbBuf3I23n3iPMYZnx2f", "_blank");
    setCommunityJoined(true);
  };

  const handleProceedToNotifications = () => {
    // Only allow proceeding if user has clicked join
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
    onComplete();
  };

  const handleSkipNotifications = () => {
    onComplete();
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
          ) : (
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
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-5">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                step === "community" ? "bg-violet" : "bg-muted"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                step === "notifications" ? "bg-violet" : "bg-muted"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

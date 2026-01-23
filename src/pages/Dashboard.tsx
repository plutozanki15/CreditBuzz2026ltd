import { useState, useEffect } from "react";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { VirtualBankCard } from "@/components/ui/VirtualBankCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Bell,
  Settings,
  Send,
  Wallet,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

const transactions = [
  { id: 1, name: "Deposit Received", amount: "+₦125,000", type: "credit", time: "Today, 2:34 PM", status: "completed" },
  { id: 2, name: "Service Fee", amount: "-₦1,499", type: "debit", time: "Today, 10:00 AM", status: "completed" },
  { id: 3, name: "Earnings Payout", amount: "+₦342,050", type: "credit", time: "Yesterday", status: "completed" },
  { id: 4, name: "Withdrawal to Bank", amount: "-₦50,000", type: "debit", time: "Yesterday", status: "pending" },
];

const quickActions = [
  { icon: Send, label: "Transfer", color: "bg-violet/20 text-violet" },
  { icon: Wallet, label: "Withdraw", color: "bg-teal/20 text-teal" },
];

export const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding was completed
    const onboardingComplete = localStorage.getItem("zenfi_onboarding_complete");
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("zenfi_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="status-badge success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="status-badge pending flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="status-badge failed flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between">
        <ZenfiLogo size="sm" />
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-magenta rounded-full" />
          </button>
          <button className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-6">
        {/* Virtual Bank Card */}
        <div className="animate-fade-in-up">
          <VirtualBankCard balance={180000} cardNumber="4829" />
        </div>

        {/* Action Buttons */}
        <div 
          className="grid grid-cols-2 gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="glass-card p-4 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{
                boxShadow: "0 0 20px hsla(262, 76%, 57%, 0.1)",
              }}
            >
              <div className={`p-2 rounded-xl ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Transaction History */}
        <div 
          className="space-y-3 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet" />
              Transaction History
            </h2>
            <button className="text-sm text-teal hover:underline">View all</button>
          </div>
          
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {transactions.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-4 animate-slide-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "credit" ? "bg-teal/15" : "bg-muted"
                    }`}>
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="w-5 h-5 text-teal" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">{tx.time}</p>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    tx.type === "credit" ? "text-teal" : "text-foreground"
                  }`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* CTA Card */}
        <GlassCard 
          className="text-center animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h3 className="font-display font-semibold mb-2">Powered by Smart Infrastructure</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Secured & encrypted transactions
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built for speed, security, and reliability
          </p>
        </GlassCard>
      </main>
    </div>
  );
};

import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuroraButton } from "@/components/ui/AuroraButton";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  TrendingUp,
  Bell,
  Settings,
  Wallet,
  PiggyBank,
  Send
} from "lucide-react";

const transactions = [
  { id: 1, name: "Received from Alex", amount: "+$1,250.00", type: "in", time: "Today, 2:34 PM" },
  { id: 2, name: "Subscription", amount: "-$14.99", type: "out", time: "Today, 10:00 AM" },
  { id: 3, name: "Earnings Payout", amount: "+$3,420.50", type: "in", time: "Yesterday" },
  { id: 4, name: "Transfer to Bank", amount: "-$500.00", type: "out", time: "Yesterday" },
];

const quickActions = [
  { icon: Send, label: "Send", color: "text-violet" },
  { icon: ArrowDownLeft, label: "Receive", color: "text-magenta" },
  { icon: CreditCard, label: "Card", color: "text-gold" },
  { icon: PiggyBank, label: "Savings", color: "text-teal" },
];

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between">
        <ZenfiLogo size="sm" />
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-6">
        {/* Balance Card */}
        <GlassCard className="text-center py-8">
          <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
          <h1 className="text-5xl font-display font-bold gradient-text mb-4">
            $24,680.42
          </h1>
          <div className="flex items-center justify-center gap-2 text-teal">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+12.5% this month</span>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
            >
              <div className={`${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Wallet Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-violet" />
            My Wallets
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            <div 
              className="min-w-[260px] h-[150px] rounded-2xl p-5 flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, hsl(262, 76%, 57%), hsl(289, 100%, 65%))",
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-white/80 text-sm">Primary Wallet</span>
                <span className="text-white font-bold text-sm">ZENFI</span>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Available</p>
                <p className="text-white text-2xl font-bold">$18,450.00</p>
              </div>
            </div>
            
            <div 
              className="min-w-[260px] h-[150px] rounded-2xl p-5 flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, hsl(37, 89%, 53%), hsl(37, 89%, 43%))",
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-white/80 text-sm">Savings</span>
                <span className="text-white font-bold text-sm">GOLD</span>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Available</p>
                <p className="text-white text-2xl font-bold">$6,230.42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold">Recent Activity</h2>
            <button className="text-sm text-teal hover:underline">View all</button>
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "in" ? "bg-teal/20" : "bg-muted"
                    }`}>
                      {tx.type === "in" ? (
                        <ArrowDownLeft className="w-5 h-5 text-teal" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    tx.type === "in" ? "text-teal" : "text-foreground"
                  }`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <GlassCard className="text-center">
          <h3 className="font-display font-semibold mb-2">Start Earning Today</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Invite friends and earn up to 5% commission
          </p>
          <AuroraButton>
            Share Referral Link
          </AuroraButton>
        </GlassCard>
      </main>
    </div>
  );
};

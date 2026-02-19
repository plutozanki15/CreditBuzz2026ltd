import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Star,
  Coins,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "claim" | "withdraw";
  amount: number;
  date: string;
  status: "success" | "pending" | "failed";
}

const surveyTasks = [
  {
    id: 1,
    title: "Join Site Survey",
    description: "Complete a quick site survey & earn rewards",
    link: "https://helpinghands.money",
    reward: "+₦5,000",
    badge: "HOT",
    icon: Star,
    iconBg: "linear-gradient(135deg, hsl(45, 100%, 51%), hsl(25, 100%, 55%))",
    bgFrom: "hsla(45, 100%, 51%, 0.06)",
    bgTo: "hsla(262, 76%, 57%, 0.04)",
    borderColor: "hsla(45, 100%, 51%, 0.2)",
    badgeBg: "hsla(45, 100%, 51%, 0.2)",
    badgeColor: "hsl(45, 100%, 51%)",
  },
  {
    id: 2,
    title: "Referral Bonus Survey",
    description: "Answer referral questions & get paid instantly",
    link: "https://helpinghands.money",
    reward: "+₦3,500",
    badge: "NEW",
    icon: Users,
    iconBg: "linear-gradient(135deg, hsl(289, 100%, 65%), hsl(262, 76%, 57%))",
    bgFrom: "hsla(289, 100%, 65%, 0.06)",
    bgTo: "hsla(262, 76%, 57%, 0.04)",
    borderColor: "hsla(289, 100%, 65%, 0.2)",
    badgeBg: "hsla(289, 100%, 65%, 0.2)",
    badgeColor: "hsl(289, 100%, 65%)",
  },
  {
    id: 3,
    title: "Earnings Growth Task",
    description: "Help us improve & unlock extra earnings",
    link: "https://helpinghands.money",
    reward: "+₦4,000",
    badge: "EARN",
    icon: TrendingUp,
    iconBg: "linear-gradient(135deg, hsl(174, 88%, 56%), hsl(174, 70%, 40%))",
    bgFrom: "hsla(174, 88%, 56%, 0.06)",
    bgTo: "hsla(262, 76%, 57%, 0.04)",
    borderColor: "hsla(174, 88%, 56%, 0.2)",
    badgeBg: "hsla(174, 88%, 56%, 0.2)",
    badgeColor: "hsl(174, 88%, 56%)",
  },
  {
    id: 4,
    title: "Community Feedback",
    description: "Share your experience and earn bonus credits",
    link: "https://helpinghands.money",
    reward: "+₦2,500",
    badge: "EASY",
    icon: Sparkles,
    iconBg: "linear-gradient(135deg, hsl(262, 76%, 57%), hsl(174, 88%, 56%))",
    bgFrom: "hsla(262, 76%, 57%, 0.06)",
    bgTo: "hsla(174, 88%, 56%, 0.04)",
    borderColor: "hsla(262, 76%, 57%, 0.2)",
    badgeBg: "hsla(262, 76%, 57%, 0.2)",
    badgeColor: "hsl(262, 76%, 57%)",
  },
  {
    id: 5,
    title: "Daily Reward Survey",
    description: "Daily task — complete & collect your coins",
    link: "https://helpinghands.money",
    reward: "+₦6,000",
    badge: "DAILY",
    icon: Coins,
    iconBg: "linear-gradient(135deg, hsl(35, 100%, 55%), hsl(45, 100%, 51%))",
    bgFrom: "hsla(35, 100%, 55%, 0.06)",
    bgTo: "hsla(45, 100%, 51%, 0.04)",
    borderColor: "hsla(35, 100%, 55%, 0.2)",
    badgeBg: "hsla(35, 100%, 55%, 0.2)",
    badgeColor: "hsl(35, 100%, 55%)",
  },
];

export const History = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useRouteHistory();

  // Fetch withdrawals and claims from database (user-specific)
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      // Fetch withdrawals from database
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (withdrawalError) {
        console.error("Error fetching withdrawals:", withdrawalError);
      }

      // Fetch claims from database (user-specific)
      const { data: claims, error: claimsError } = await supabase
        .from("claims")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (claimsError) {
        console.error("Error fetching claims:", claimsError);
      }

      // Convert withdrawals to transaction format
      const withdrawalTxns: Transaction[] = (withdrawals || []).map((w) => ({
        id: w.id,
        type: "withdraw" as const,
        amount: Number(w.amount),
        date: w.created_at,
        status: w.status === "completed" ? "success" : w.status === "failed" ? "failed" : "pending",
      }));

      // Convert claims to transaction format
      const claimTxns: Transaction[] = (claims || []).map((c: any) => ({
        id: c.id,
        type: "claim" as const,
        amount: Number(c.amount),
        date: c.created_at,
        status: c.status === "success" ? "success" : c.status === "failed" ? "failed" : "pending",
      }));

      // Combine and sort by date
      const allTransactions = [...withdrawalTxns, ...claimTxns].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error in fetchTransactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!authLoading && user) {
      fetchTransactions();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Real-time subscription for withdrawals
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("history-withdrawals")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "withdrawals",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch on any change
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-teal" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-gold animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-magenta" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string, type: string) => {
    if (type === "withdraw") {
      switch (status) {
        case "success":
          return "Completed";
        case "pending":
          return "Deducted";
        case "failed":
          return "Failed";
        default:
          return "Deducted";
      }
    }
    switch (status) {
      case "success":
        return "Completed";
      case "pending":
        return "Processing";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold">Transaction History</h1>
          <p className="text-xs text-muted-foreground">Your activity log</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 space-y-4">
        {/* Summary Card */}
        <GlassCard className="p-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet/20">
                <Clock className="w-5 h-5 text-violet" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-display font-bold">{transactions.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Real-time sync</p>
              <p className="text-xs text-teal">All records secured</p>
            </div>
          </div>
        </GlassCard>

        {/* Transaction List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-display font-semibold">Recent Activity</h2>
            <span className="text-[10px] text-muted-foreground">Encrypted logs</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="glass-card p-4 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                    <div className="h-5 bg-muted rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <GlassCard className="p-8 text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your transaction history will appear here after your first claim or withdrawal.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-xl bg-violet/20 text-violet text-sm font-medium hover:bg-violet/30 transition-colors"
              >
                Go to Dashboard
              </button>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn, index) => (
                <div
                  key={txn.id}
                  className="glass-card p-4 flex items-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Transaction Icon */}
                  <div 
                    className={`p-2.5 rounded-xl ${
                      txn.type === "claim" 
                        ? "bg-teal/20" 
                        : "bg-magenta/20"
                    }`}
                  >
                    {txn.type === "claim" ? (
                      <ArrowDownCircle className="w-5 h-5 text-teal" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-magenta" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {txn.type === "claim" ? "Daily Claim" : "Withdrawal"}
                      </p>
                      <span 
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          txn.type === "withdraw"
                            ? "bg-magenta/20 text-magenta"
                            : txn.status === "success" 
                            ? "bg-teal/20 text-teal" 
                            : txn.status === "pending"
                            ? "bg-gold/20 text-gold"
                            : "bg-magenta/20 text-magenta"
                        }`}
                      >
                        {getStatusLabel(txn.status, txn.type)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(txn.date)} • {formatTime(txn.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p 
                      className={`font-display font-semibold ${
                        txn.type === "claim" ? "text-teal" : "text-foreground"
                      }`}
                    >
                      {txn.type === "claim" ? "+" : "-"}{formatAmount(txn.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {getStatusIcon(txn.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earn More Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-display font-semibold">Earn More Tasks</h2>
            <span className="text-[10px] text-gold font-semibold animate-pulse">🔥 Live</span>
          </div>

          {surveyTasks.map((task, index) => (
            <motion.a
              key={task.id}
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.12, type: "spring", stiffness: 120 }}
              whileTap={{ scale: 0.97 }}
              className="glass-card p-4 flex items-center gap-3 cursor-pointer relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${task.bgFrom}, ${task.bgTo})`,
                border: `1px solid ${task.borderColor}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: task.iconBg }}
              >
                <task.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-foreground truncate">{task.title}</p>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                    style={{ background: task.badgeBg, color: task.badgeColor }}
                  >
                    {task.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>

              {/* Arrow + Reward */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-bold text-gold">{task.reward}</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              {/* Animated shimmer on active */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ opacity: [0, 0.06, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
                style={{ background: "linear-gradient(90deg, transparent, white, transparent)" }}
              />
            </motion.a>
          ))}
        </div>

        {/* Security Footer */}
        <div className="text-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-[10px] text-muted-foreground/50">
            🔒 All transactions are encrypted and secured
          </p>
        </div>
      </main>
    </div>
  );
};

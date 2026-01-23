import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { 
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface Transaction {
  id: string;
  type: "claim" | "withdraw";
  amount: number;
  date: string;
  status: "success" | "pending" | "failed";
}

const STORAGE_KEY = "zenfi_transactions";

export const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useRouteHistory();

  useEffect(() => {
    // Simulate loading for premium feel
    const timer = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  const getStatusLabel = (status: string) => {
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
              <p className="text-xs text-muted-foreground">Last 30 days</p>
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
                          txn.status === "success" 
                            ? "bg-teal/20 text-teal" 
                            : txn.status === "pending"
                            ? "bg-gold/20 text-gold"
                            : "bg-magenta/20 text-magenta"
                        }`}
                      >
                        {getStatusLabel(txn.status)}
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

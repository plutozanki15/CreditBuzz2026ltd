import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, User, Hash, Wallet, Lock, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const VALID_WITHDRAWAL_CODE = "XFC641400";
const TRANSACTIONS_KEY = "zenfi_transactions";

const nigerianBanks = [
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
  "First Bank of Nigeria", "First City Monument Bank", "Globus Bank",
  "Guaranty Trust Bank", "Heritage Bank", "Jaiz Bank", "Keystone Bank",
  "Kuda Bank", "Moniepoint MFB", "Opay", "Palmpay", "Parallex Bank",
  "Polaris Bank", "Providus Bank", "Stanbic IBTC Bank", "Standard Chartered Bank",
  "Sterling Bank", "SunTrust Bank", "Titan Trust Bank", "Union Bank of Nigeria",
  "United Bank for Africa", "Unity Bank", "VFD Microfinance Bank", "Wema Bank", "Zenith Bank"
].sort();

// Cache key for last known balance
const BALANCE_CACHE_KEY = "zenfi_withdrawal_balance";

export const Withdrawal = () => {
  const navigate = useNavigate();
  // Load cached balance for instant display
  const cachedBalance = (() => {
    try {
      const val = localStorage.getItem(BALANCE_CACHE_KEY);
      return val ? Number(val) : null;
    } catch { return null; }
  })();
  
  const [availableBalance, setAvailableBalance] = useState<number | null>(cachedBalance);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountName: "",
    bank: "",
    amount: "",
    zfcCode: "",
  });

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const bal = Number(profile.balance);
        setAvailableBalance(bal);
        // Cache for next time
        localStorage.setItem(BALANCE_CACHE_KEY, String(bal));
      }
      setIsLoading(false);
    };

    fetchBalance();

    // Subscribe to realtime balance updates with user filter
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return supabase
        .channel("withdrawal-balance")
        .on(
          "postgres_changes",
          { 
            event: "UPDATE", 
            schema: "public", 
            table: "profiles",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && payload.new.balance !== undefined) {
              const newBal = Number(payload.new.balance);
              setAvailableBalance(newBal);
              localStorage.setItem(BALANCE_CACHE_KEY, String(newBal));
            }
          }
        )
        .subscribe();
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupRealtimeSubscription().then((ch) => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  const formatBalance = (value: number | null) => {
    if (value === null) return "Loading...";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const displayBalance = availableBalance ?? 0;

  const addTransaction = (type: "claim" | "withdraw", amount: number, status: "success" | "pending" | "failed" = "pending") => {
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      date: new Date().toISOString(),
      status,
    };

    const existing = localStorage.getItem(TRANSACTIONS_KEY);
    const transactions = existing ? JSON.parse(existing) : [];
    transactions.unshift(transaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.accountNumber || !formData.accountName || !formData.bank || !formData.amount || !formData.zfcCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate withdrawal code
    if (formData.zfcCode !== VALID_WITHDRAWAL_CODE) {
      toast({
        title: "Invalid Withdrawal Code",
        description: "The activation code you entered is incorrect. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(formData.amount, 10);
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    // Validate balance
    if (availableBalance === null) {
      toast({
        title: "Please Wait",
        description: "Balance is still loading. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You cannot withdraw more than your available balance of ${formatBalance(availableBalance)}.`,
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Deduct balance from user's profile
      const newBalance = displayBalance - amount;
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (balanceError) throw balanceError;

      // 2. Create withdrawal record
      const { error: withdrawalError } = await supabase
        .from("withdrawals")
        .insert({
          user_id: userId,
          amount: amount,
          account_number: formData.accountNumber,
          account_name: formData.accountName,
          bank_name: formData.bank,
          status: "processing",
        });

      if (withdrawalError) throw withdrawalError;

      // 3. Update local balance immediately
      setAvailableBalance(newBalance);

      // 4. Add to transaction history
      addTransaction("withdraw", amount, "pending");

      // 5. Show success notification
      toast({
        title: "🔔 Withdrawal Initiated",
        description: `Your withdrawal of ${formatBalance(amount)} has been deducted from your dashboard balance.`,
      });

      // 6. Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.accountNumber && formData.accountName && formData.bank && formData.amount && formData.zfcCode;

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold tracking-tight">Withdraw Funds</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Secure • Fast • Reliable</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Balance Display Card */}
          <div
            className="p-5 rounded-2xl animate-fade-in-up"
            style={{
              background: "linear-gradient(135deg, hsla(174, 88%, 56%, 0.12), hsla(262, 76%, 57%, 0.08))",
              border: "1px solid hsla(174, 88%, 56%, 0.25)",
              boxShadow: "0 8px 32px hsla(174, 88%, 56%, 0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Available Balance</p>
                {availableBalance === null ? (
                  <div className="h-8 w-28 bg-muted/50 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-2xl font-display font-bold text-foreground">{formatBalance(availableBalance)}</p>
                )}
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: "hsla(174, 88%, 56%, 0.15)" }}
              >
                <Wallet className="w-6 h-6 text-teal" />
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div
            className="p-4 rounded-2xl space-y-4 animate-fade-in-up"
            style={{
              animationDelay: "0.05s",
              background: "hsla(240, 7%, 8%, 0.7)",
              border: "1px solid hsla(0, 0%, 100%, 0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-violet" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Details</span>
            </div>

            {/* Bank Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">Select Bank</label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/60 border-border/40 focus:border-violet focus:ring-1 focus:ring-violet/30 transition-all">
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl max-h-64 z-50">
                  {nigerianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank} className="focus:bg-violet/20">{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">Account Number</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:border-violet focus:ring-1 focus:ring-violet/30 focus:outline-none transition-all font-mono tracking-wider"
                />
                {formData.accountNumber.length === 10 && (
                  <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal" />
                )}
              </div>
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">Account Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:border-violet focus:ring-1 focus:ring-violet/30 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div
            className="p-4 rounded-2xl space-y-4 animate-fade-in-up"
            style={{
              animationDelay: "0.1s",
              background: "hsla(240, 7%, 8%, 0.7)",
              border: "1px solid hsla(0, 0%, 100%, 0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-teal" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Details</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">Amount (₦)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, "") })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:border-teal focus:ring-1 focus:ring-teal/30 focus:outline-none transition-all font-mono text-lg font-semibold"
                />
              </div>

              {/* ZFC Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">ZFC Code</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={formData.zfcCode}
                    onChange={(e) => setFormData({ ...formData, zfcCode: e.target.value.toUpperCase() })}
                    className="w-full h-12 pl-9 pr-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div
            className="flex items-start gap-3 p-3 rounded-xl animate-fade-in-up"
            style={{
              animationDelay: "0.15s",
              background: "hsla(262, 76%, 57%, 0.08)",
              border: "1px solid hsla(262, 76%, 57%, 0.15)",
            }}
          >
            <Shield className="w-4 h-4 text-violet mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your transaction is protected with bank-grade 256-bit encryption. Funds typically arrive within 1-24 hours.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-14 rounded-2xl font-display font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-fade-in-up flex items-center justify-center gap-2"
            style={{
              animationDelay: "0.2s",
              background: isFormValid
                ? "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))"
                : "hsla(240, 7%, 20%, 0.8)",
              boxShadow: isFormValid ? "0 8px 32px hsla(262, 76%, 57%, 0.35)" : "none",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm Withdrawal</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <p className="text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Secured by ZenFi • 256-bit SSL Encryption
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, User, Hash, Wallet, Lock, Shield, CheckCircle, Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { WithdrawalProcessing } from "@/components/withdrawal/WithdrawalProcessing";
import { ActivationCodePage } from "@/components/withdrawal/ActivationCodePage";
import { ActivationForm } from "@/components/withdrawal/ActivationForm";
import { PaymentDetailsPage } from "@/components/withdrawal/PaymentDetailsPage";
import { PaymentNotConfirmed } from "@/components/withdrawal/PaymentNotConfirmed";
import { WeekendOnlyGate } from "@/components/withdrawal/WeekendOnlyGate";
import { useWithdrawalFlow, WithdrawalFlowStep } from "@/hooks/useWithdrawalFlow";
import { supabase } from "@/integrations/supabase/client";
import { generateActivationCode } from "@/utils/activationCode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

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
const BALANCE_CACHE_KEY = "creditbuzz_withdrawal_balance";

export const Withdrawal = () => {
  const navigate = useNavigate();
  const { flowState, currentStep, updateFlowState, clearFlowState } = useWithdrawalFlow();
  
  // Load cached balance for instant display
  const cachedBalance = (() => {
    try {
      const val = localStorage.getItem(BALANCE_CACHE_KEY);
      return val ? Number(val) : null;
    } catch { return null; }
  })();
  
  const [availableBalance, setAvailableBalance] = useState<number | null>(cachedBalance);
  const [userId, setUserId] = useState<string | null>(null);
  const [userZfcCode, setUserZfcCode] = useState<string | null>(null);
  const [userActivationCode, setUserActivationCode] = useState<string | null>(null);
  const [currentActivationCode, setCurrentActivationCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalMode, setWithdrawalMode] = useState<"weekly" | "daily">(() => {
    try {
      const cached = localStorage.getItem("creditbuzz_withdrawal_mode");
      if (cached === "daily" || cached === "weekly") return cached;
    } catch {}
    return "weekly";
  });
  const [zfcError, setZfcError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accountNumber: flowState?.formData?.accountNumber || "",
    accountName: flowState?.formData?.accountName || "",
    bank: flowState?.formData?.bank || "",
    amount: flowState?.formData?.amount || "",
    zfcCode: flowState?.formData?.zfcCode || "",
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
        .select("balance, zfc_code, activation_code")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const bal = Number(profile.balance);
        setAvailableBalance(bal);
        localStorage.setItem(BALANCE_CACHE_KEY, String(bal));
        setUserZfcCode(profile.zfc_code || null);
        setUserActivationCode(profile.activation_code || null);
        
        // Generate a new activation code if none exists
        if (!profile.activation_code) {
          const newCode = generateActivationCode();
          setCurrentActivationCode(newCode);
          // Save to database
          await supabase
            .from("profiles")
            .update({ activation_code: newCode })
            .eq("user_id", user.id);
          setUserActivationCode(newCode);
        } else {
          setCurrentActivationCode(profile.activation_code);
        }
      }
      // Fetch withdrawal mode setting
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "withdrawal_mode")
        .single();
      if (setting) {
        setWithdrawalMode(setting.value as "weekly" | "daily");
        localStorage.setItem("creditbuzz_withdrawal_mode", setting.value);
      }

      setIsLoading(false);
    };

    fetchBalance();

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

    // Listen for withdrawal mode changes in real-time
    const modeChannel = supabase
      .channel("withdrawal-mode")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_settings" },
        (payload) => {
          const row = payload.new as { key: string; value: string };
          if (row.key === "withdrawal_mode") {
            setWithdrawalMode(row.value as "weekly" | "daily");
            localStorage.setItem("creditbuzz_withdrawal_mode", row.value);
          }
        }
      )
      .subscribe();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupRealtimeSubscription().then((ch) => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      supabase.removeChannel(modeChannel);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous ZFC error
    setZfcError(null);

    // Validate all fields
    if (!formData.accountNumber || !formData.accountName || !formData.bank || !formData.amount || !formData.zfcCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate ZFC code against user's purchased code OR the activation code
    const enteredCode = formData.zfcCode.toUpperCase();
    const isValidPurchasedCode = userZfcCode && enteredCode === userZfcCode.toUpperCase();
    const isValidActivationCode = userActivationCode && enteredCode === userActivationCode.toUpperCase();
    
    if (!isValidPurchasedCode && !isValidActivationCode) {
      setZfcError("Invalid CBC code. Please purchase a valid CBC code to continue.");
      // Clear flow state and navigate to Buy CBC page after a brief delay
      setTimeout(() => {
        clearFlowState();
        navigate("/buy-zfc", { state: { fromWithdrawal: true } });
      }, 1500);
      return;
    }

    const amount = parseInt(formData.amount, 10);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

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
      // Save withdrawal request as "initiated" - NO balance deduction yet
      const { data: withdrawalRecord, error: withdrawalError } = await supabase
        .from("withdrawals")
        .insert({
          user_id: userId,
          amount: amount,
          account_number: formData.accountNumber,
          account_name: formData.accountName,
          bank_name: formData.bank,
          status: "initiated",
        })
        .select("id")
        .single();

      if (withdrawalError) throw withdrawalError;

      // Save form data and move to processing step
      updateFlowState({
        step: "processing",
        withdrawalId: withdrawalRecord.id,
        formData,
      });

    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessingComplete = () => {
    updateFlowState({ step: "activation-code" });
  };

  const handleActivationCodeProceed = () => {
    updateFlowState({ step: "activation-form" });
  };

  const handleActivationFormBack = () => {
    updateFlowState({ step: "activation-code" });
  };

  const handleActivationFormSubmit = (data: { fullName: string; bankName: string; accountNumber: string; activationCode: string }) => {
    updateFlowState({
      step: "payment-details",
      activationFormData: data,
    });
  };

  const handlePaymentMade = () => {
    updateFlowState({ step: "verifying-payment" });
  };

  const handleVerifyingComplete = () => {
    updateFlowState({ step: "payment-not-confirmed" });
  };

  const isFormValid = formData.accountNumber && formData.accountName && formData.bank && formData.amount && formData.zfcCode;

  // Weekend check: Friday 00:00 to Sunday 23:50 (only when mode is weekly)
  const isWithdrawalOpen = (() => {
    if (withdrawalMode === "daily") return true;
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (day === 5 || day === 6) return true;
    if (day === 0) {
      return hours < 23 || (hours === 23 && minutes <= 50);
    }
    return false;
  })();

  if (!isWithdrawalOpen && currentStep === "form") {
    return <WeekendOnlyGate />;
  }

  // Render based on current step
  if (currentStep === "processing") {
    return (
      <WithdrawalProcessing
        message="Processing your withdrawal request…"
        onComplete={handleProcessingComplete}
        duration={2500}
      />
    );
  }

  if (currentStep === "activation-code") {
    return (
      <ActivationCodePage
        activationCode={currentActivationCode || userActivationCode || generateActivationCode()}
        onProceed={handleActivationCodeProceed}
      />
    );
  }

  if (currentStep === "activation-form") {
    return (
      <ActivationForm
        expectedCode={currentActivationCode || userActivationCode || ""}
        onBack={handleActivationFormBack}
        onSubmit={handleActivationFormSubmit}
      />
    );
  }

  if (currentStep === "payment-details") {
    return <PaymentDetailsPage onPaymentMade={handlePaymentMade} />;
  }

  if (currentStep === "verifying-payment") {
    return (
      <WithdrawalProcessing
        message="Verifying activation payment…"
        onComplete={handleVerifyingComplete}
        duration={3000}
      />
    );
  }

  if (currentStep === "payment-not-confirmed") {
    return <PaymentNotConfirmed />;
  }

  // Default: Show withdrawal form
  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => {
            clearFlowState();
            navigate("/dashboard");
          }}
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

              {/* CBC Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">CBC Code</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={formData.zfcCode}
                    onChange={(e) => {
                      setFormData({ ...formData, zfcCode: e.target.value.toUpperCase() });
                      setZfcError(null); // Clear error when user types
                    }}
                    className={`w-full h-12 pl-9 pr-4 rounded-xl bg-secondary/60 border text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all font-mono uppercase ${
                      zfcError 
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" 
                        : "border-border/40 focus:border-gold focus:ring-1 focus:ring-gold/30"
                    }`}
                  />
                </div>
              </div>
            </div>
            
            {/* CBC Code Error Message */}
            {zfcError && (
              <div
                className="mt-3 p-3 rounded-xl flex flex-col gap-2 animate-fade-in"
                style={{
                  background: "hsla(0, 70%, 50%, 0.08)",
                  border: "1px solid hsla(0, 70%, 50%, 0.2)",
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-400 leading-relaxed">{zfcError}</p>
                </div>
                <Link
                  to="/buy-zfc"
                  className="inline-flex items-center justify-center gap-2 w-full mt-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--teal)), hsl(var(--violet)))",
                    boxShadow: "0 4px 15px hsla(174, 88%, 56%, 0.3)",
                  }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy CBC Code
                </Link>
              </div>
            )}
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
              Secured by CreditBuzz • 256-bit SSL Encryption
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

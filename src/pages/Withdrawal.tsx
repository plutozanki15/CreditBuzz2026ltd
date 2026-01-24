import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, User, Hash, Wallet, Lock, Shield, CheckCircle2 } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { LuxuryInput } from "@/components/ui/LuxuryInput";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { LuxuryGlassCard } from "@/components/ui/LuxuryGlassCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const nigerianBanks = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Globus Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint MFB",
  "Opay",
  "Palmpay",
  "Parallex Bank",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "Unity Bank",
  "VFD Microfinance Bank",
  "Wema Bank",
  "Zenith Bank",
].sort();

export const Withdrawal = () => {
  const navigate = useNavigate();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountName: "",
    bank: "",
    amount: "",
    zfcCode: "",
  });

  useEffect(() => {
    const savedBalance = localStorage.getItem("zenfi_balance");
    if (savedBalance) {
      setAvailableBalance(parseInt(savedBalance, 10));
    }
  }, []);

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountNumber || !formData.accountName || !formData.bank || !formData.amount || !formData.zfcCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(formData.amount, 10);
    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot withdraw more than your available balance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal of ${formatBalance(amount)} is being processed.`,
      });
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-secondary active:scale-95 transition-all duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <div className="animate-slide-in">
          <h1 className="text-lg font-display font-bold text-foreground">Withdraw Funds</h1>
          <p className="text-xs text-muted-foreground">Transfer to your bank account</p>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-6 space-y-3">
        {/* Available Balance Card - Compact */}
        <LuxuryGlassCard className="p-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Available Balance</p>
              <p className="text-xl font-bold gradient-text">{formatBalance(availableBalance)}</p>
            </div>
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal/20 to-violet/20">
              <Wallet className="w-5 h-5 text-teal" />
            </div>
          </div>
        </LuxuryGlassCard>

        {/* Withdrawal Form - Compact */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <LuxuryGlassCard className="p-4 space-y-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-violet" />
              <span className="text-xs font-medium text-foreground">Bank Details</span>
            </div>

            {/* Bank Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Bank</label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger className="w-full h-10 bg-secondary/50 border-border/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Select bank" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl max-h-[280px] z-50">
                  {nigerianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank} className="text-sm">{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number & Name - Inline */}
            <div className="grid grid-cols-2 gap-2">
              <LuxuryInput
                label="Account No."
                placeholder="10-digit"
                icon={<Hash className="w-3 h-3" />}
                maxLength={10}
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
              />
              <LuxuryInput
                label="Account Name"
                placeholder="Name"
                icon={<User className="w-3 h-3" />}
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>
          </LuxuryGlassCard>

          <LuxuryGlassCard className="p-4 space-y-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-teal" />
              <span className="text-xs font-medium text-foreground">Amount & Code</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <LuxuryInput
                label="Amount (₦)"
                placeholder="Amount"
                icon={<span className="text-xs font-bold">₦</span>}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })}
              />
              <LuxuryInput
                label="ZFC Code"
                placeholder="Code"
                type="password"
                icon={<Lock className="w-3 h-3" />}
                value={formData.zfcCode}
                onChange={(e) => setFormData({ ...formData, zfcCode: e.target.value })}
              />
            </div>
          </LuxuryGlassCard>

          {/* Submit Button */}
          <LuxuryButton
            type="submit"
            loading={isSubmitting}
            className="w-full h-12 text-sm font-bold rounded-xl animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm Withdrawal
          </LuxuryButton>
        </form>

        {/* Security Footer */}
        <div className="text-center pt-2">
          <p className="text-[9px] text-muted-foreground/50 flex items-center justify-center gap-1">
            <Shield className="w-2.5 h-2.5" />
            Secured with 256-bit encryption
          </p>
        </div>
      </main>
    </div>
  );
};

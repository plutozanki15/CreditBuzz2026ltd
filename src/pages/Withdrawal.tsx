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

      <main className="relative z-10 px-4 pb-8 space-y-5">
        {/* Available Balance Card */}
        <LuxuryGlassCard className="p-5 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Available for Withdrawal
              </p>
              <p 
                className="text-2xl font-bold gradient-text"
                style={{ textShadow: "0 0 30px hsla(174, 88%, 56%, 0.3)" }}
              >
                {formatBalance(availableBalance)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-teal/20 to-violet/20">
              <Wallet className="w-6 h-6 text-teal" />
            </div>
          </div>
        </LuxuryGlassCard>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <LuxuryGlassCard className="p-5 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-violet" />
              <span className="text-sm font-medium text-foreground">Bank Details</span>
            </div>

            {/* Bank Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Select Bank
              </label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger className="w-full h-12 bg-secondary/50 border-border/50 rounded-xl focus:ring-2 focus:ring-teal/50 transition-all">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Choose your bank" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl max-h-[300px]">
                  {nigerianBanks.map((bank) => (
                    <SelectItem 
                      key={bank} 
                      value={bank}
                      className="hover:bg-secondary/50 focus:bg-secondary/50 cursor-pointer"
                    >
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <LuxuryInput
              label="Account Number"
              placeholder="Enter 10-digit account number"
              icon={<Hash className="w-4 h-4" />}
              maxLength={10}
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
            />

            {/* Account Name */}
            <LuxuryInput
              label="Account Name"
              placeholder="Enter account holder name"
              icon={<User className="w-4 h-4" />}
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            />
          </LuxuryGlassCard>

          <LuxuryGlassCard className="p-5 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-teal" />
              <span className="text-sm font-medium text-foreground">Amount & Verification</span>
            </div>

            {/* Amount */}
            <LuxuryInput
              label="Amount (₦)"
              placeholder="Enter withdrawal amount"
              icon={<span className="text-sm font-bold">₦</span>}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })}
            />

            {/* ZFC Code */}
            <LuxuryInput
              label="ZFC Verification Code"
              placeholder="Enter your ZFC code"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              value={formData.zfcCode}
              onChange={(e) => setFormData({ ...formData, zfcCode: e.target.value })}
            />

            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Your transaction is secured with 256-bit encryption
            </p>
          </LuxuryGlassCard>

          {/* Submit Button */}
          <div className="pt-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <LuxuryButton
              type="submit"
              loading={isSubmitting}
              className="w-full h-14 text-base font-bold rounded-2xl"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Confirm Withdrawal
            </LuxuryButton>
          </div>
        </form>

        {/* Security Footer */}
        <div className="text-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
            <Shield className="w-3 h-3" />
            <span>Bank-grade security • Instant processing • 24/7 support</span>
          </div>
        </div>
      </main>
    </div>
  );
};

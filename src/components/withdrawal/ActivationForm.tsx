import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Building2, Hash, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
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

interface ActivationFormProps {
  expectedCode: string;
  onBack: () => void;
  onSubmit: (data: { fullName: string; bankName: string; accountNumber: string; activationCode: string }) => void;
}

export const ActivationForm = ({ expectedCode, onBack, onSubmit }: ActivationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bankName: "",
    accountNumber: "",
    activationCode: expectedCode,
  });

  const isFormValid = formData.fullName && formData.bankName && formData.accountNumber.length === 10 && formData.activationCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    if (formData.activationCode !== expectedCode) {
      toast({
        title: "Invalid Activation Code",
        description: "The activation code you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate brief processing
    setTimeout(() => {
      onSubmit(formData);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold tracking-tight">Activation Form</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Complete your verification</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl space-y-5"
            style={{
              background: "hsla(240, 7%, 8%, 0.85)",
              border: "1px solid hsla(0, 0%, 100%, 0.08)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 15px 50px hsla(0, 0%, 0%, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-violet" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Activation Details
              </span>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:border-violet focus:ring-1 focus:ring-violet/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                Bank Name
              </label>
              <Select
                value={formData.bankName}
                onValueChange={(value) => setFormData({ ...formData, bankName: value })}
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/60 border-border/40 focus:border-violet focus:ring-1 focus:ring-violet/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground/50" />
                    <SelectValue placeholder="Select your bank" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl max-h-64 z-50">
                  {nigerianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank} className="focus:bg-violet/20">
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                Account Number
              </label>
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
              </div>
            </div>

            {/* Activation Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                Activation Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Enter activation code"
                  value={formData.activationCode}
                  onChange={(e) => setFormData({ ...formData, activationCode: e.target.value.toUpperCase() })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all font-mono uppercase tracking-wider"
                />
              </div>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{
              background: "hsla(262, 76%, 57%, 0.08)",
              border: "1px solid hsla(262, 76%, 57%, 0.15)",
            }}
          >
            <Shield className="w-4 h-4 text-violet mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your information is encrypted and securely transmitted. We never share your banking details with third parties.
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-14 rounded-2xl font-display font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{
              background: isFormValid
                ? "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))"
                : "hsla(240, 7%, 20%, 0.8)",
              boxShadow: isFormValid ? "0 10px 35px hsla(262, 76%, 57%, 0.4)" : "none",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Activation</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {/* Footer */}
          <div className="text-center pt-2">
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

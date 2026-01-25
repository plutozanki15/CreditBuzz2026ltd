import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { LuxuryInput } from "@/components/ui/LuxuryInput";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { LuxuryGlassCard } from "@/components/ui/LuxuryGlassCard";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Upload, 
  AlertCircle,
  Clock,
  Shield,
  FileCheck,
  Building2,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = "form" | "processing" | "notice" | "transfer" | "confirming" | "pending";

const AMOUNT = 5700;
const BANK_NAME = "Moniepoint MFB";
const ACCOUNT_NUMBER = "8102562883";
const ACCOUNT_NAME = "CHARIS BENJAMIN SOMTOCHUKWU";

const processingMessages = [
  "Initializing payment…",
  "Securing transaction…",
  "Verifying details…",
  "Almost ready…"
];

const confirmingMessages = [
  "Confirming payment…",
  "Finalizing transaction…"
];

export const BuyZFC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [processingIndex, setProcessingIndex] = useState(0);
  const [confirmingIndex, setConfirmingIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptName, setReceiptName] = useState("");
  const [displayAmount, setDisplayAmount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const userId = localStorage.getItem("zenfi_user_id") || "ZF-7829401";
  const referralCode = userId.replace("ZF-", "ZF");

  // Animated count-up for amount
  useEffect(() => {
    if (step === "form") {
      const duration = 1000;
      const steps = 30;
      const increment = AMOUNT / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= AMOUNT) {
          setDisplayAmount(AMOUNT);
          clearInterval(timer);
        } else {
          setDisplayAmount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Processing animation (4 seconds)
  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setProcessingIndex((prev) => {
          if (prev >= processingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStep("notice"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Confirming animation (2 seconds)
  useEffect(() => {
    if (step === "confirming") {
      const interval = setInterval(() => {
        setConfirmingIndex((prev) => {
          if (prev >= confirmingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStep("pending"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceed = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({ title: "Missing Information", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    setStep("processing");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptUploaded(true);
      setReceiptName(file.name);
      toast({ title: "Receipt Uploaded", description: "Your payment receipt has been attached" });
    }
  };

  const handlePaymentComplete = () => {
    if (!receiptUploaded) return;
    setStep("confirming");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => step === "form" ? navigate("/dashboard") : setStep("form")}
          className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 pb-8">
        {/* STEP 1: Form */}
        {step === "form" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Title */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-display font-bold text-foreground">Buy ZFC</h1>
              <p className="text-sm text-muted-foreground">Purchase ZenFi Credits securely</p>
            </div>

            {/* Amount Card */}
            <LuxuryGlassCard className="p-6">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Amount</span>
                <div 
                  className="text-4xl font-display font-bold bg-gradient-to-r from-violet via-magenta to-gold bg-clip-text text-transparent"
                  style={{ 
                    textShadow: "0 0 30px hsla(262, 76%, 57%, 0.3)",
                  }}
                >
                  {formatCurrency(displayAmount)}
                </div>
              </div>
            </LuxuryGlassCard>

            {/* Referral Code */}
            <LuxuryGlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Referral Code</span>
                  <span className="font-mono text-lg font-semibold text-foreground">{referralCode}</span>
                </div>
                <button
                  onClick={() => handleCopy(referralCode, "Referral Code")}
                  className="p-3 rounded-xl bg-violet/20 hover:bg-violet/30 transition-all active:scale-95"
                >
                  {copiedField === "Referral Code" ? (
                    <Check className="w-5 h-5 text-teal" />
                  ) : (
                    <Copy className="w-5 h-5 text-violet" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Your unique referral code is auto-applied</p>
            </LuxuryGlassCard>

            {/* User Details Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Details</h3>
              
              <LuxuryInput
                label="User ID"
                value={userId}
                readOnly
                className="opacity-70"
              />

              <LuxuryInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <LuxuryInput
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <LuxuryInput
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Proceed Button */}
            <LuxuryButton
              onClick={handleProceed}
              className="w-full py-4 text-lg"
            >
              Proceed
            </LuxuryButton>
          </div>
        )}

        {/* STEP 2: Processing */}
        {step === "processing" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative mb-8">
              {/* Animated loader */}
              <div className="w-20 h-20 rounded-full border-4 border-secondary relative">
                <div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet animate-spin"
                  style={{ animationDuration: "1s" }}
                />
                <div 
                  className="absolute inset-2 rounded-full border-4 border-transparent border-t-magenta animate-spin"
                  style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
                />
              </div>
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: "radial-gradient(circle, hsla(262, 76%, 57%, 0.3) 0%, transparent 70%)",
                  filter: "blur(10px)",
                }}
              />
            </div>
            
            <p className="text-lg font-medium text-foreground animate-pulse">
              {processingMessages[processingIndex]}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Please wait</p>

            {/* Progress dots */}
            <div className="flex gap-2 mt-6">
              {processingMessages.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= processingIndex ? "bg-violet scale-110" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Important Notice Modal */}
        {step === "notice" && (
          <div className="space-y-6 animate-fade-in-up">
            <LuxuryGlassCard className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Important Notice</h2>
                <p className="text-sm text-muted-foreground mt-1">Please read before proceeding</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Transfer the exact amount displayed to avoid delays" },
                  { icon: Upload, text: "Upload your payment receipt immediately after transfer" },
                  { icon: Building2, text: "Use reliable Nigerian banks for instant confirmation" },
                  { icon: FileCheck, text: "Payments are reviewed and confirmed automatically" },
                  { icon: Clock, text: "Do not raise disputes while payment is processing" },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-2 rounded-lg bg-violet/10 shrink-0">
                      <item.icon className="w-4 h-4 text-violet" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <LuxuryButton
                onClick={() => setStep("transfer")}
                className="w-full mt-6 py-4"
              >
                I Understand
              </LuxuryButton>
            </LuxuryGlassCard>
          </div>
        )}

        {/* STEP 4: Transfer Page */}
        {step === "transfer" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-display font-bold text-foreground">Complete Transfer</h1>
              <p className="text-sm text-muted-foreground">Send payment to the account below</p>
            </div>

            {/* Amount Card */}
            <LuxuryGlassCard className="p-5">
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Amount to Pay</span>
                <div className="text-3xl font-display font-bold text-foreground mt-1">
                  {formatCurrency(AMOUNT)}
                </div>
              </div>
            </LuxuryGlassCard>

            {/* Bank Details */}
            <LuxuryGlassCard className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Bank Details</h3>
              
              {/* Bank Name */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div>
                  <span className="text-xs text-muted-foreground block">Bank Name</span>
                  <span className="font-medium text-foreground">{BANK_NAME}</span>
                </div>
                <button
                  onClick={() => handleCopy(BANK_NAME, "Bank Name")}
                  className="p-2 rounded-lg bg-violet/20 hover:bg-violet/30 transition-all active:scale-95"
                >
                  {copiedField === "Bank Name" ? (
                    <Check className="w-4 h-4 text-teal" />
                  ) : (
                    <Copy className="w-4 h-4 text-violet" />
                  )}
                </button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div>
                  <span className="text-xs text-muted-foreground block">Account Number</span>
                  <span className="font-mono font-bold text-lg text-foreground">{ACCOUNT_NUMBER}</span>
                </div>
                <button
                  onClick={() => handleCopy(ACCOUNT_NUMBER, "Account Number")}
                  className="p-2 rounded-lg bg-violet/20 hover:bg-violet/30 transition-all active:scale-95"
                >
                  {copiedField === "Account Number" ? (
                    <Check className="w-4 h-4 text-teal" />
                  ) : (
                    <Copy className="w-4 h-4 text-violet" />
                  )}
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div>
                  <span className="text-xs text-muted-foreground block">Account Name</span>
                  <span className="font-medium text-foreground text-sm">{ACCOUNT_NAME}</span>
                </div>
                <button
                  onClick={() => handleCopy(ACCOUNT_NAME, "Account Name")}
                  className="p-2 rounded-lg bg-violet/20 hover:bg-violet/30 transition-all active:scale-95"
                >
                  {copiedField === "Account Name" ? (
                    <Check className="w-4 h-4 text-teal" />
                  ) : (
                    <Copy className="w-4 h-4 text-violet" />
                  )}
                </button>
              </div>
            </LuxuryGlassCard>

            {/* Receipt Upload */}
            <LuxuryGlassCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Upload Receipt</h3>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-6 rounded-xl border-2 border-dashed transition-all ${
                  receiptUploaded 
                    ? "border-teal bg-teal/10" 
                    : "border-muted-foreground/30 hover:border-violet/50 hover:bg-violet/5"
                }`}
              >
                {receiptUploaded ? (
                  <div className="flex flex-col items-center gap-2 animate-scale-in">
                    <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-teal" />
                    </div>
                    <span className="text-sm font-medium text-teal">Receipt Uploaded</span>
                    <span className="text-xs text-muted-foreground">{receiptName}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Tap to upload receipt</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG, or PDF</span>
                  </div>
                )}
              </button>
            </LuxuryGlassCard>

            {/* Payment Complete Button */}
            <LuxuryButton
              onClick={handlePaymentComplete}
              disabled={!receiptUploaded}
              className={`w-full py-4 text-lg transition-all ${
                !receiptUploaded ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              I Have Made Payment
            </LuxuryButton>
          </div>
        )}

        {/* STEP 5: Confirming */}
        {step === "confirming" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 text-violet animate-spin" />
              <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: "radial-gradient(circle, hsla(262, 76%, 57%, 0.4) 0%, transparent 70%)",
                  filter: "blur(15px)",
                }}
              />
            </div>
            
            <p className="text-lg font-medium text-foreground animate-pulse">
              {confirmingMessages[confirmingIndex]}
            </p>
            <p className="text-sm text-muted-foreground mt-2">This won't take long</p>
          </div>
        )}

        {/* STEP 6: Payment Pending */}
        {step === "pending" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in-up">
            <LuxuryGlassCard className="p-8 text-center max-w-sm mx-auto">
              {/* Animated Status Icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div 
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: "radial-gradient(circle, hsla(45, 93%, 62%, 0.3) 0%, transparent 70%)",
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-gold/20 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-gold" />
                </div>
                {/* Pulsing rings */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
              </div>

              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Payment Pending
              </h2>
              <p className="text-muted-foreground mb-6">
                Your transaction is under verification
              </p>

              <div className="p-4 rounded-xl bg-secondary/50 mb-6">
                <p className="text-sm text-muted-foreground">
                  You'll be notified once your payment is confirmed. This usually takes a few minutes.
                </p>
              </div>

              <div className="space-y-3">
                <LuxuryButton
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  Back to Dashboard
                </LuxuryButton>
                <button
                  onClick={() => navigate("/history")}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Transaction History
                </button>
              </div>
            </LuxuryGlassCard>
          </div>
        )}
      </main>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Upload, 
  Shield,
  FileCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
  Lock,
  CreditCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = "form" | "processing" | "notice" | "transfer" | "confirming" | "pending";

const AMOUNT = 5700;
const BANK_NAME = "Moniepoint MFB";
const ACCOUNT_NUMBER = "8102562883";
const ACCOUNT_NAME = "CHARIS BENJAMIN SOMTOCHUKWU";

const processingSteps = [
  { label: "Initializing secure session", icon: Lock },
  { label: "Encrypting transaction", icon: Shield },
  { label: "Verifying account", icon: CheckCircle2 },
  { label: "Preparing transfer", icon: Zap },
];

export const BuyZFC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptName, setReceiptName] = useState("");
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const userId = localStorage.getItem("zenfi_user_id") || "ZF-7829401";
  const referralCode = userId.replace("ZF-", "ZF");

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated count-up for amount
  useEffect(() => {
    if (step === "form" && showContent) {
      const duration = 600;
      const steps = 15;
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
  }, [step, showContent]);

  // Timeline processing (4 seconds total)
  useEffect(() => {
    if (step === "processing") {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= processingSteps.length) {
          clearInterval(interval);
          setTimeout(() => setStep("notice"), 200);
        } else {
          setActiveProcessingStep(currentStep);
        }
      }, 900);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Confirming step (2 seconds)
  useEffect(() => {
    if (step === "confirming") {
      setTimeout(() => setStep("pending"), 2000);
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
      toast({ title: "Complete all fields", description: "Please fill in your details", variant: "destructive" });
      return;
    }
    setStep("processing");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptUploaded(true);
      setReceiptName(file.name);
      toast({ title: "Receipt attached", description: file.name });
    }
  };

  const handlePaymentComplete = () => {
    if (!receiptUploaded) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("confirming");
    }, 500);
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

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-magenta/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Compact Header */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            onClick={() => step === "form" ? navigate("/dashboard") : setStep("form")}
            className="p-1.5 -ml-1 rounded-lg hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-violet" />
            <span className="text-xs font-semibold text-foreground tracking-wide">Buy ZFC</span>
          </div>
          <div className="w-7" />
        </div>
      </header>

      <main className="relative z-10 px-4 py-4 max-w-md mx-auto">
        
        {/* ============ STEP 1: FORM (COMPACT) ============ */}
        {step === "form" && (
          <div className={`space-y-5 transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            
            {/* Hero Amount Card */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet/10 via-magenta/5 to-transparent border border-violet/20 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Premium Credits</span>
                </div>
                <div className="text-3xl font-bold text-foreground tracking-tight">
                  {formatCurrency(displayAmount)}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">ZenFi Credit (ZFC)</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-teal/10 text-teal border border-teal/20">Best Value</span>
                </div>
              </div>
            </section>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 py-1">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Instant" },
                { icon: TrendingUp, label: "Verified" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-muted-foreground/70">
                  <item.icon className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Compact Form */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Your Details</h3>
                <span className="text-[10px] text-muted-foreground/60">ID: {userId}</span>
              </div>
              
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-secondary/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet/50 focus:bg-secondary/50 focus:shadow-[0_0_0_3px_rgba(123,63,228,0.1)] transition-all duration-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-secondary/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet/50 focus:bg-secondary/50 focus:shadow-[0_0_0_3px_rgba(123,63,228,0.1)] transition-all duration-200"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-secondary/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet/50 focus:bg-secondary/50 focus:shadow-[0_0_0_3px_rgba(123,63,228,0.1)] transition-all duration-200"
                  />
                </div>
              </div>
            </section>

            {/* Referral Badge */}
            <section className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/20 border border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet/10 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-violet" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Referral</span>
                  <span className="font-mono text-xs font-semibold text-foreground">{referralCode}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(referralCode, "Referral Code")}
                className="p-1.5 rounded-lg hover:bg-secondary/50 transition-all active:scale-90"
              >
                {copiedField === "Referral Code" ? (
                  <Check className="w-3.5 h-3.5 text-teal" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </section>

            {/* CTA */}
            <section className="pt-2">
              <button
                onClick={handleProceed}
                className="group relative w-full h-11 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-semibold text-sm overflow-hidden shadow-lg shadow-violet/20 hover:shadow-violet/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continue to Payment
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-magenta to-violet opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <p className="text-center text-[10px] text-muted-foreground/60 mt-2.5 flex items-center justify-center gap-1">
                <Lock className="w-2.5 h-2.5" /> 256-bit SSL Encrypted
              </p>
            </section>
          </div>
        )}

        {/* ============ STEP 2: PROCESSING (COMPACT TIMELINE) ============ */}
        {step === "processing" && (
          <div className="min-h-[45vh] flex flex-col justify-center animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet/10 to-magenta/10 border border-violet/20 mb-3">
                <ZenfiLogo size="sm" />
              </div>
              <p className="text-xs text-muted-foreground">Processing your request</p>
            </div>
            
            {/* Compact Timeline */}
            <div className="bg-secondary/20 rounded-2xl border border-border/30 p-4">
              {processingSteps.map((item, index) => (
                <div key={index} className={`flex items-center gap-3 py-2.5 ${index !== processingSteps.length - 1 ? "border-b border-border/20" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    index < activeProcessingStep 
                      ? "bg-teal/20" 
                      : index === activeProcessingStep 
                        ? "bg-violet/20 animate-pulse" 
                        : "bg-secondary/50"
                  }`}>
                    {index < activeProcessingStep ? (
                      <Check className="w-4 h-4 text-teal" />
                    ) : (
                      <item.icon className={`w-4 h-4 ${index === activeProcessingStep ? "text-violet" : "text-muted-foreground/40"}`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    index <= activeProcessingStep ? "text-foreground" : "text-muted-foreground/40"
                  }`}>
                    {item.label}
                  </span>
                  {index === activeProcessingStep && (
                    <Loader2 className="w-3 h-3 text-violet animate-spin ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ STEP 3: NOTICE (COMPACT CARD) ============ */}
        {step === "notice" && (
          <div className="animate-fade-in space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-gold/5 to-transparent border border-gold/20 overflow-hidden">
              {/* Compact Header */}
              <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Important</h3>
                  <p className="text-[10px] text-muted-foreground">Read before proceeding</p>
                </div>
              </div>

              {/* Compact Content */}
              <div className="p-4 space-y-2.5">
                {[
                  { icon: Shield, text: "Transfer exact amount shown" },
                  { icon: Upload, text: "Upload receipt after payment" },
                  { icon: Building2, text: "Major banks confirm faster" },
                  { icon: FileCheck, text: "Avoid disputes during review" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1">
                    <div className="w-5 h-5 rounded bg-violet/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-2.5 h-2.5 text-violet" />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setStep("transfer")}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  I Understand, Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ STEP 4: TRANSFER (COMPACT) ============ */}
        {step === "transfer" && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Amount Highlight */}
            <div className="text-center py-3 px-4 rounded-xl bg-gradient-to-r from-violet/10 to-magenta/10 border border-violet/20">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Transfer Exactly</span>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(AMOUNT)}</div>
            </div>

            {/* Bank Details Card */}
            <section className="rounded-xl border border-border/40 overflow-hidden bg-secondary/10">
              <div className="px-3 py-2 border-b border-border/30 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-violet" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Bank Details</span>
              </div>
              
              <div className="divide-y divide-border/20">
                {[
                  { label: "Bank", value: BANK_NAME, copyValue: BANK_NAME, field: "Bank" },
                  { label: "Account", value: ACCOUNT_NUMBER, copyValue: ACCOUNT_NUMBER, field: "Account", mono: true },
                  { label: "Name", value: ACCOUNT_NAME, copyValue: ACCOUNT_NAME, field: "Name" },
                ].map((item) => (
                  <div key={item.field} className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary/20 transition-colors">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs text-foreground ${item.mono ? "font-mono font-semibold" : ""} max-w-[160px] truncate`}>
                        {item.value}
                      </span>
                      <button
                        onClick={() => handleCopy(item.copyValue, item.field)}
                        className="p-1 rounded hover:bg-secondary/50 transition-all active:scale-90"
                      >
                        {copiedField === item.field ? (
                          <Check className="w-3 h-3 text-teal" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Receipt Upload */}
            <section>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-4 rounded-xl border-2 border-dashed transition-all ${
                  receiptUploaded 
                    ? "border-teal/40 bg-teal/5" 
                    : "border-border/40 hover:border-violet/40 hover:bg-violet/5"
                }`}
              >
                {receiptUploaded ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-teal" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-xs font-medium text-teal block">Receipt attached</span>
                      <span className="text-[10px] text-muted-foreground truncate block">{receiptName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-5 h-5 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground">Upload payment receipt</span>
                    <span className="text-[10px] text-muted-foreground/50">PNG, JPG, or PDF</span>
                  </div>
                )}
              </button>
            </section>

            {/* CTA */}
            <button
              onClick={handlePaymentComplete}
              disabled={!receiptUploaded || isSubmitting}
              className={`w-full h-11 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                receiptUploaded && !isSubmitting
                  ? "bg-gradient-to-r from-violet to-magenta text-white shadow-lg shadow-violet/20 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Confirm Payment"
              )}
            </button>
          </div>
        )}

        {/* ============ STEP 5: CONFIRMING (MINIMAL) ============ */}
        {step === "confirming" && (
          <div className="min-h-[45vh] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet/20 to-magenta/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-violet animate-spin" />
              </div>
              <div className="absolute -inset-2 bg-violet/10 rounded-3xl blur-xl animate-pulse" />
            </div>
            
            <p className="text-sm font-medium text-foreground">Verifying payment</p>
            <p className="text-xs text-muted-foreground mt-0.5">This won't take long...</p>
            
            {/* Progress bar */}
            <div className="w-32 h-1 bg-secondary/50 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-violet to-magenta rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" 
                   style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {/* ============ STEP 6: PENDING (PREMIUM) ============ */}
        {step === "pending" && (
          <div className="min-h-[45vh] flex flex-col items-center justify-center animate-fade-in">
            
            {/* Status Icon */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gold" />
              </div>
              <div className="absolute -inset-3 bg-gold/5 rounded-3xl blur-2xl animate-pulse" />
              {/* Floating particles */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold/30 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-violet/30 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-1">Payment Pending</h2>
            <p className="text-xs text-muted-foreground text-center max-w-[240px]">
              Your transaction is being verified. We'll notify you once confirmed.
            </p>

            {/* Status Badge */}
            <div className="mt-4 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-medium text-gold uppercase tracking-wide">Under Review</span>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2 w-full max-w-[240px]">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/history")}
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View Transaction History
              </button>
            </div>

            {/* Trust Footer */}
            <div className="mt-6 flex items-center gap-1 text-muted-foreground/50">
              <Shield className="w-3 h-3" />
              <span className="text-[10px]">Secured by ZenFi</span>
            </div>
          </div>
        )}
      </main>

      {/* Custom Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

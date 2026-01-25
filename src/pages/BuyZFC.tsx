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
  Lock,
  CreditCard,
  BadgeCheck,
  Banknote
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
  { label: "Verifying your account", icon: CheckCircle2 },
  { label: "Preparing bank transfer", icon: Zap },
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

  // Timeline processing
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

  // Confirming step
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
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-magenta/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => step === "form" ? navigate("/dashboard") : setStep("form")}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet" />
            <span className="text-base font-semibold text-foreground">Buy ZFC</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="relative z-10 px-5 py-5 pb-8 w-full max-w-md mx-auto">
        
        {/* ============ STEP 1: FORM ============ */}
        {step === "form" && (
          <div className={`space-y-6 transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            
            {/* Hero Amount Card */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet/15 via-magenta/10 to-transparent border border-violet/25 p-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Premium ZenFi Credits</span>
                </div>
                <div className="text-4xl font-bold text-foreground tracking-tight mb-2">
                  {formatCurrency(displayAmount)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Purchase ZFC to unlock premium rewards, faster withdrawals, and exclusive member benefits.
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal/15 text-teal border border-teal/25">Best Value</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet/15 text-violet border border-violet/25">Instant Credit</span>
                </div>
              </div>
            </section>

            {/* Trust Badges */}
            <div className="flex items-center justify-between px-2">
              {[
                { icon: Shield, label: "Bank-Grade Security" },
                { icon: Zap, label: "Instant Processing" },
                { icon: BadgeCheck, label: "100% Verified" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-violet" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground leading-tight">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Form Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Your Information</h3>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">ID: {userId}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/40 border border-border/50 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet/60 focus:bg-secondary/60 focus:shadow-[0_0_0_4px_rgba(123,63,228,0.1)] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/40 border border-border/50 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet/60 focus:bg-secondary/60 focus:shadow-[0_0_0_4px_rgba(123,63,228,0.1)] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/40 border border-border/50 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet/60 focus:bg-secondary/60 focus:shadow-[0_0_0_4px_rgba(123,63,228,0.1)] transition-all duration-200"
                  />
                </div>
              </div>
            </section>

            {/* Referral Section */}
            <section className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Your Referral Code</span>
                  <span className="font-mono text-base font-bold text-foreground">{referralCode}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(referralCode, "Referral Code")}
                className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
              >
                {copiedField === "Referral Code" ? (
                  <Check className="w-5 h-5 text-teal" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </section>

            {/* CTA */}
            <section className="space-y-3 pt-2">
              <button
                onClick={handleProceed}
                className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-violet to-magenta text-white font-bold text-base overflow-hidden shadow-xl shadow-violet/25 hover:shadow-violet/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continue to Payment
                  <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-magenta to-violet opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Protected by 256-bit SSL encryption
              </p>
            </section>
          </div>
        )}

        {/* ============ STEP 2: PROCESSING ============ */}
        {step === "processing" && (
          <div className="min-h-[60vh] flex flex-col justify-center animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet/15 to-magenta/15 border border-violet/25 mb-4">
                <ZenfiLogo size="sm" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Setting up your transaction</h2>
              <p className="text-sm text-muted-foreground">Please wait while we securely process your request</p>
            </div>
            
            {/* Timeline */}
            <div className="bg-secondary/30 rounded-2xl border border-border/40 p-5">
              {processingSteps.map((item, index) => (
                <div key={index} className={`flex items-center gap-4 py-4 ${index !== processingSteps.length - 1 ? "border-b border-border/30" : ""}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    index < activeProcessingStep 
                      ? "bg-teal/20 border border-teal/30" 
                      : index === activeProcessingStep 
                        ? "bg-violet/20 border border-violet/30 animate-pulse" 
                        : "bg-secondary/50 border border-border/30"
                  }`}>
                    {index < activeProcessingStep ? (
                      <Check className="w-5 h-5 text-teal" />
                    ) : (
                      <item.icon className={`w-5 h-5 ${index === activeProcessingStep ? "text-violet" : "text-muted-foreground/40"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium transition-colors ${
                      index <= activeProcessingStep ? "text-foreground" : "text-muted-foreground/50"
                    }`}>
                      {item.label}
                    </span>
                    {index === activeProcessingStep && (
                      <span className="text-xs text-violet block mt-0.5">In progress...</span>
                    )}
                  </div>
                  {index === activeProcessingStep && (
                    <Loader2 className="w-4 h-4 text-violet animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ STEP 3: NOTICE ============ */}
        {step === "notice" && (
          <div className="animate-fade-in space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/25 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Before You Proceed</h3>
                  <p className="text-xs text-muted-foreground">Please read these important guidelines</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To ensure your payment is processed quickly and credited to your account, please follow these guidelines carefully.
                </p>
                
                {[
                  { icon: Banknote, title: "Exact Amount", text: "Transfer the exact amount shown. Any variation may delay processing." },
                  { icon: Upload, title: "Upload Receipt", text: "Immediately upload your payment receipt after transfer for faster verification." },
                  { icon: Building2, title: "Bank Selection", text: "Payments from major Nigerian banks (GTB, Zenith, Access) confirm within minutes." },
                  { icon: FileCheck, title: "No Disputes", text: "Please avoid raising bank disputes during the confirmation period." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 border border-border/20">
                    <div className="w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-violet" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground block">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="p-5 pt-2">
                <button
                  onClick={() => setStep("transfer")}
                  className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet/20"
                >
                  I Understand, Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ STEP 4: TRANSFER ============ */}
        {step === "transfer" && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Amount Header */}
            <div className="text-center py-5 px-5 rounded-2xl bg-gradient-to-r from-violet/15 via-magenta/10 to-violet/15 border border-violet/25">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Transfer Exactly</span>
              <div className="text-3xl font-bold text-foreground mt-1">{formatCurrency(AMOUNT)}</div>
              <p className="text-sm text-muted-foreground mt-2">Any different amount will delay your credit</p>
            </div>

            {/* Bank Details */}
            <section className="rounded-2xl border border-border/50 overflow-hidden bg-secondary/20">
              <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 bg-secondary/30">
                <Building2 className="w-5 h-5 text-violet" />
                <span className="text-sm font-semibold text-foreground">Bank Transfer Details</span>
              </div>
              
              <div className="divide-y divide-border/30">
                {[
                  { label: "Bank Name", value: BANK_NAME, copyValue: BANK_NAME, field: "Bank" },
                  { label: "Account Number", value: ACCOUNT_NUMBER, copyValue: ACCOUNT_NUMBER, field: "Account", mono: true, highlight: true },
                  { label: "Account Name", value: ACCOUNT_NAME, copyValue: ACCOUNT_NAME, field: "Name" },
                ].map((item) => (
                  <div key={item.field} className={`flex items-center justify-between px-4 py-4 ${item.highlight ? "bg-violet/5" : ""}`}>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-0.5">{item.label}</span>
                      <span className={`text-base text-foreground ${item.mono ? "font-mono font-bold" : "font-medium"}`}>
                        {item.value}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.copyValue, item.field)}
                      className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
                    >
                      {copiedField === item.field ? (
                        <Check className="w-5 h-5 text-teal" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Receipt Upload */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Payment Proof</h3>
              <p className="text-xs text-muted-foreground">Upload your bank transfer receipt or screenshot</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all ${
                  receiptUploaded 
                    ? "border-teal/50 bg-teal/10" 
                    : "border-border/50 hover:border-violet/50 hover:bg-violet/5"
                }`}
              >
                {receiptUploaded ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-teal" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-base font-semibold text-teal block">Receipt Uploaded</span>
                      <span className="text-sm text-muted-foreground truncate block">{receiptName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <span className="text-base font-medium text-muted-foreground">Tap to upload receipt</span>
                    <span className="text-xs text-muted-foreground/60">Supports PNG, JPG, or PDF</span>
                  </div>
                )}
              </button>
            </section>

            {/* CTA */}
            <button
              onClick={handlePaymentComplete}
              disabled={!receiptUploaded || isSubmitting}
              className={`w-full h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                receiptUploaded && !isSubmitting
                  ? "bg-gradient-to-r from-violet to-magenta text-white shadow-xl shadow-violet/25 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-secondary/60 text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Confirm Payment"
              )}
            </button>
          </div>
        )}

        {/* ============ STEP 5: CONFIRMING ============ */}
        {step === "confirming" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet/25 to-magenta/25 flex items-center justify-center border border-violet/30">
                <Loader2 className="w-9 h-9 text-violet animate-spin" />
              </div>
              <div className="absolute -inset-3 bg-violet/15 rounded-3xl blur-2xl animate-pulse" />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2">Verifying Your Payment</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              We're confirming your transaction with the bank. This usually takes just a moment.
            </p>
            
            {/* Progress bar */}
            <div className="w-40 h-1.5 bg-secondary/60 rounded-full overflow-hidden mt-6">
              <div className="h-full bg-gradient-to-r from-violet to-magenta rounded-full" 
                   style={{ animation: "progressSlide 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        )}

        {/* ============ STEP 6: PENDING ============ */}
        {step === "pending" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            
            {/* Status Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold/25 to-gold/10 border border-gold/35 flex items-center justify-center">
                <Clock className="w-10 h-10 text-gold" />
              </div>
              <div className="absolute -inset-4 bg-gold/10 rounded-full blur-2xl animate-pulse" />
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-violet/40 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Pending</h2>
            <p className="text-base text-muted-foreground text-center max-w-xs leading-relaxed">
              Your transaction is currently under review. We'll notify you via email once it's confirmed.
            </p>

            {/* Status Badge */}
            <div className="mt-5 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-sm font-semibold text-gold">Under Review</span>
            </div>

            {/* Info Card */}
            <div className="mt-6 w-full p-4 rounded-xl bg-secondary/30 border border-border/40">
              <p className="text-xs text-muted-foreground text-center">
                Most payments are confirmed within 5-15 minutes during banking hours. 
                You can safely close this page — we'll send you a notification.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3 w-full">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-violet to-magenta text-white font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet/20"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/history")}
                className="w-full h-12 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View Transaction History
              </button>
            </div>

            {/* Trust Footer */}
            <div className="mt-8 flex items-center gap-2 text-muted-foreground/60">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Secured by ZenFi • All transactions encrypted</span>
            </div>
          </div>
        )}
      </main>

      {/* Animations */}
      <style>{`
        @keyframes progressSlide {
          0% { width: 20%; transform: translateX(-100%); }
          50% { width: 60%; }
          100% { width: 20%; transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

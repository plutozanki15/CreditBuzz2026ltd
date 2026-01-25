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
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = "form" | "processing" | "notice" | "transfer" | "confirming" | "pending";

const AMOUNT = 5700;
const BANK_NAME = "Moniepoint MFB";
const ACCOUNT_NUMBER = "8102562883";
const ACCOUNT_NAME = "CHARIS BENJAMIN SOMTOCHUKWU";

const processingSteps = [
  { label: "Initializing payment", duration: 1000 },
  { label: "Securing transaction", duration: 1000 },
  { label: "Verifying details", duration: 1000 },
  { label: "Preparing transfer", duration: 1000 },
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
      const duration = 800;
      const steps = 20;
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

  // Timeline processing (4 seconds total)
  useEffect(() => {
    if (step === "processing") {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= processingSteps.length) {
          clearInterval(interval);
          setTimeout(() => setStep("notice"), 300);
        } else {
          setActiveProcessingStep(currentStep);
        }
      }, 1000);
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
    toast({ title: "Copied", description: `${field} copied` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceed = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({ title: "Missing fields", description: "Please complete all fields", variant: "destructive" });
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

      {/* Clean Top Bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => step === "form" ? navigate("/dashboard") : setStep("form")}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground">Buy ZFC</span>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="relative z-10 px-4 py-6 max-w-lg mx-auto">
        
        {/* ============ STEP 1: FORM ============ */}
        {step === "form" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Section 1: Transaction Summary */}
            <section className="text-center pb-6 border-b border-border/30">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">You are purchasing</span>
              <div className="mt-2 text-4xl font-bold text-foreground tracking-tight">
                {formatCurrency(displayAmount)}
              </div>
              <span className="text-sm text-muted-foreground mt-1 block">ZenFi Credit (ZFC)</span>
            </section>

            {/* Section 2: User Details Form */}
            <section className="space-y-5">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Your Details</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* User ID - Read Only */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">User ID</label>
                  <div className="h-11 px-3 flex items-center rounded-lg bg-secondary/30 border border-border/50">
                    <span className="text-sm text-muted-foreground font-mono">{userId}</span>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg bg-secondary/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg bg-secondary/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg bg-secondary/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Referral Info (Compact) */}
            <section className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/20 border border-border/30">
              <div>
                <span className="text-xs text-muted-foreground block">Referral Code</span>
                <span className="font-mono text-sm font-medium text-foreground">{referralCode}</span>
              </div>
              <button
                onClick={() => handleCopy(referralCode, "Referral Code")}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-all active:scale-95"
              >
                {copiedField === "Referral Code" ? (
                  <Check className="w-4 h-4 text-teal" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </section>

            {/* Section 4: Primary Action */}
            <section className="pt-4">
              <button
                onClick={handleProceed}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-semibold text-sm shadow-lg shadow-violet/25 hover:shadow-violet/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Proceed to Payment
              </button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Secure • Encrypted • Instant
              </p>
            </section>
          </div>
        )}

        {/* ============ STEP 2: TIMELINE PROCESSING ============ */}
        {step === "processing" && (
          <div className="min-h-[50vh] flex flex-col justify-center animate-fade-in">
            <div className="text-center mb-8">
              <ZenfiLogo size="sm" />
            </div>
            
            {/* Timeline Progress */}
            <div className="space-y-0 pl-4">
              {processingSteps.map((item, index) => (
                <div key={index} className="flex items-start gap-4 relative">
                  {/* Vertical line */}
                  {index < processingSteps.length - 1 && (
                    <div 
                      className={`absolute left-[7px] top-6 w-0.5 h-8 transition-all duration-500 ${
                        index < activeProcessingStep ? "bg-violet" : "bg-border/50"
                      }`}
                    />
                  )}
                  
                  {/* Status dot */}
                  <div className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center shrink-0 mt-0.5 ${
                    index < activeProcessingStep 
                      ? "bg-violet border-violet" 
                      : index === activeProcessingStep 
                        ? "border-violet bg-background" 
                        : "border-border/50 bg-background"
                  }`}>
                    {index < activeProcessingStep && (
                      <Check className="w-2.5 h-2.5 text-white" />
                    )}
                    {index === activeProcessingStep && (
                      <div className="w-2 h-2 rounded-full bg-violet animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className={`pb-8 transition-all duration-300 ${
                    index <= activeProcessingStep ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    <span className="text-sm font-medium">{item.label}</span>
                    {index === activeProcessingStep && (
                      <span className="text-xs text-muted-foreground block mt-0.5">Processing...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ STEP 3: NOTICE (BOTTOM SHEET STYLE) ============ */}
        {step === "notice" && (
          <div className="animate-fade-in-up">
            <div className="rounded-2xl bg-secondary/30 border border-border/50 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Before you proceed</h3>
                  <p className="text-xs text-muted-foreground">Please note the following</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {[
                  { icon: Shield, text: "Ensure the exact amount is transferred" },
                  { icon: Upload, text: "Upload your receipt immediately after payment" },
                  { icon: Building2, text: "Payments confirm faster with major Nigerian banks" },
                  { icon: FileCheck, text: "Do not raise disputes during confirmation" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="p-5 pt-2">
                <button
                  onClick={() => setStep("transfer")}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ STEP 4: TRANSFER DETAILS ============ */}
        {step === "transfer" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Section A: Bank Details */}
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Transfer Details</h3>
              
              <div className="rounded-xl border border-border/50 divide-y divide-border/30 overflow-hidden bg-secondary/10">
                {/* Amount */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold text-foreground">{formatCurrency(AMOUNT)}</span>
                </div>

                {/* Bank Name */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{BANK_NAME}</span>
                    <button
                      onClick={() => handleCopy(BANK_NAME, "Bank")}
                      className="p-1.5 rounded-md hover:bg-secondary/50 transition-all"
                    >
                      {copiedField === "Bank" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-foreground">{ACCOUNT_NUMBER}</span>
                    <button
                      onClick={() => handleCopy(ACCOUNT_NUMBER, "Account Number")}
                      className="p-1.5 rounded-md hover:bg-secondary/50 transition-all"
                    >
                      {copiedField === "Account Number" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Name */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground text-right max-w-[180px] truncate">{ACCOUNT_NAME}</span>
                    <button
                      onClick={() => handleCopy(ACCOUNT_NAME, "Name")}
                      className="p-1.5 rounded-md hover:bg-secondary/50 transition-all"
                    >
                      {copiedField === "Name" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section B: Payment Proof */}
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Payment Proof</h3>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-5 rounded-xl border-2 border-dashed transition-all ${
                  receiptUploaded 
                    ? "border-teal/50 bg-teal/5" 
                    : "border-border/50 hover:border-violet/30 hover:bg-violet/5"
                }`}
              >
                {receiptUploaded ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-teal" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-teal block">Receipt uploaded</span>
                      <span className="text-xs text-muted-foreground">{receiptName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to upload receipt</span>
                    <span className="text-xs text-muted-foreground/60">PNG, JPG, or PDF</span>
                  </div>
                )}
              </button>
            </section>

            {/* CTA */}
            <section className="pt-2">
              <button
                onClick={handlePaymentComplete}
                disabled={!receiptUploaded || isSubmitting}
                className={`w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  receiptUploaded && !isSubmitting
                    ? "bg-gradient-to-r from-violet to-magenta text-white shadow-lg shadow-violet/25 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "I Have Made Payment"
                )}
              </button>
            </section>
          </div>
        )}

        {/* ============ STEP 5: CONFIRMING ============ */}
        {step === "confirming" && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center animate-fade-in">
            <ZenfiLogo size="sm" className="mb-8" />
            
            {/* Animated line */}
            <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-violet to-magenta rounded-full animate-pulse"
                style={{
                  animation: "confirmSlide 1.5s ease-in-out infinite",
                }}
              />
            </div>

            <p className="text-sm font-medium text-foreground">Confirming payment</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait...</p>

            <style>{`
              @keyframes confirmSlide {
                0%, 100% { width: 30%; transform: translateX(0); }
                50% { width: 60%; transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}

        {/* ============ STEP 6: PENDING ============ */}
        {step === "pending" && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center animate-fade-in">
            
            {/* Circular progress ring */}
            <div className="relative w-24 h-24 mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="4"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="276"
                  strokeDashoffset="69"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(262, 76%, 57%)" />
                    <stop offset="100%" stopColor="hsl(289, 100%, 65%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gold" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-1">Payment Pending</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Your payment is under review. You'll be notified once confirmed.
            </p>

            <div className="mt-8 space-y-3 w-full max-w-xs">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/history")}
                className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View Transaction History
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

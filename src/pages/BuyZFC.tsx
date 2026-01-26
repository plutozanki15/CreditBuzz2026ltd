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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Step = "form" | "processing" | "notice" | "transfer" | "confirming" | "pending" | "approved" | "rejected";

// NOTE: "confirming" step is deprecated - we go directly to "pending" after payment submission

const AMOUNT = 5700;
const ZFC_AMOUNT = 180000; // ZFC amount user will receive
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
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptName, setReceiptName] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [creditedAmount, setCreditedAmount] = useState(ZFC_AMOUNT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const userId = profile?.referral_code || localStorage.getItem("zenfi_user_id") || "ZF-7829401";
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

  // Real-time subscription for payment status updates
  useEffect(() => {
    if (!currentPaymentId || !user) return;

    const channel = supabase
      .channel(`payment-${currentPaymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `id=eq.${currentPaymentId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === 'approved') {
            setCreditedAmount(payload.new.zfc_amount);
            setStep('approved');
          } else if (newStatus === 'rejected') {
            setRejectionReason(payload.new.rejection_reason || 'Payment could not be verified');
            setStep('rejected');
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentPaymentId, user]);

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
      setReceiptFile(file);
      setReceiptUploaded(true);
      setReceiptName(file.name);
      toast({ title: "Receipt attached", description: file.name });
    }
  };

  const handlePaymentComplete = (event?: React.MouseEvent) => {
    // Prevent any default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    if (!receiptUploaded || !receiptFile) {
      toast({ title: "Error", description: "Please upload a receipt first", variant: "destructive" });
      return;
    }
    
    // Prevent double submissions
    if (isSubmitting) {
      return;
    }
    
    // Mark as submitting and IMMEDIATELY navigate to pending
    setIsSubmitting(true);
    setStep("pending");
    
    // Run Supabase operations in the background (fire-and-forget with error handling)
    const processPaymentInBackground = async () => {
      try {
        // Get current user directly from Supabase
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          toast({ 
            title: "Session Issue", 
            description: "Please check your login status", 
            variant: "destructive" 
          });
          return;
        }
        
        // 1. Upload receipt to storage
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast({ 
            title: "Upload Issue", 
            description: "Receipt may need to be re-uploaded", 
            variant: "destructive" 
          });
          return;
        }
        
        // 2. Get public URL for the receipt
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);
        
        const receiptUrl = urlData.publicUrl;
        
        // 3. Create payment record and get ID for realtime tracking
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: currentUser.id,
            amount: AMOUNT,
            zfc_amount: ZFC_AMOUNT,
            account_name: formData.fullName || profile?.full_name || "Unknown",
            receipt_url: receiptUrl,
            status: 'pending'
          })
          .select('id')
          .single();
        
        if (paymentError) {
          console.error("Payment error:", paymentError);
          toast({ 
            title: "Submission Issue", 
            description: "Payment record may need review", 
            variant: "destructive" 
          });
          return;
        }
        
        // Set the payment ID for realtime tracking
        if (paymentData?.id) {
          setCurrentPaymentId(paymentData.id);
        }
        
        // Success toast (user is already on pending screen)
        toast({
          title: "Payment Submitted",
          description: "Your payment is now being verified",
        });
      } catch (error) {
        console.error("Background payment error:", error);
        toast({ 
          title: "Processing Issue", 
          description: "Our team will review your submission", 
          variant: "destructive" 
        });
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Execute in background - don't await
    processPaymentInBackground();
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
            
            {/* Compact Amount Card */}
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet/12 to-magenta/8 border border-violet/20 p-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet/15 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">ZFC Purchase</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground tracking-tight">
                    {formatCurrency(displayAmount)}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal/15 text-teal border border-teal/20">Best Value</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet/15 text-violet border border-violet/20">Instant</span>
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

        {/* ============ STEP 3: NOTICE (ADVANCED) ============ */}
        {step === "notice" && (
          <div className="animate-fade-in space-y-4">
            {/* Compact Header Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet/12 via-magenta/8 to-teal/8 border border-violet/20 p-3.5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet/15 rounded-full blur-2xl animate-pulse" />
              
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground">Transfer Guidelines</h3>
                  <p className="text-xs text-muted-foreground">Follow for <span className="text-teal font-medium">instant verification</span></p>
                </div>
              </div>
            </div>

            {/* Guidelines Grid */}
            <div className="grid gap-3">
              {[
                { 
                  icon: Banknote, 
                  title: "Exact Amount Only",
                  desc: "Transfer ₦5,700 precisely — any deviation delays processing",
                  color: "violet",
                  delay: "0ms"
                },
                { 
                  icon: Upload, 
                  title: "Upload Proof Instantly",
                  desc: "Submit your receipt immediately after bank confirmation",
                  color: "magenta",
                  delay: "50ms"
                },
                { 
                  icon: Building2, 
                  title: "Recommended Banks",
                  desc: "GTBank, Zenith, Access, UBA process within 2-5 minutes",
                  color: "teal",
                  delay: "100ms"
                },
                { 
                  icon: FileCheck, 
                  title: "No Disputes Needed",
                  desc: "Our system auto-verifies — manual disputes cause delays",
                  color: "gold",
                  delay: "150ms"
                },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="group relative flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-violet/30 transition-all duration-300"
                  style={{ 
                    animation: `slideIn 0.4s ease-out ${item.delay} both`,
                  }}
                >
                  {/* Icon container with gradient border */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    item.color === 'violet' ? 'bg-violet/15 border border-violet/25 group-hover:bg-violet/25' :
                    item.color === 'magenta' ? 'bg-magenta/15 border border-magenta/25 group-hover:bg-magenta/25' :
                    item.color === 'teal' ? 'bg-teal/15 border border-teal/25 group-hover:bg-teal/25' :
                    'bg-gold/15 border border-gold/25 group-hover:bg-gold/25'
                  }`}>
                    <item.icon className={`w-5 h-5 ${
                      item.color === 'violet' ? 'text-violet' :
                      item.color === 'magenta' ? 'text-magenta' :
                      item.color === 'teal' ? 'text-teal' :
                      'text-gold'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-0.5">{item.title}</h4>
                    <p className="text-[13px] text-muted-foreground leading-snug">{item.desc}</p>
                  </div>
                  {/* Check indicator */}
                  <div className="w-6 h-6 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Check className="w-3.5 h-3.5 text-teal" />
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-secondary/20 border border-border/20">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal" />
                <span className="text-xs text-muted-foreground">256-bit SSL</span>
              </div>
              <div className="w-px h-4 bg-border/50" />
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-violet" />
                <span className="text-xs text-muted-foreground">Bank-Grade</span>
              </div>
              <div className="w-px h-4 bg-border/50" />
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-gold" />
                <span className="text-xs text-muted-foreground">Verified</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setStep("transfer")}
              className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-violet via-magenta to-violet text-white font-bold text-base overflow-hidden shadow-xl shadow-violet/25 hover:shadow-violet/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                I Understand, Proceed
                <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our <span className="text-violet">Terms of Service</span>
            </p>
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

            {/* CTA - Instant navigation, no loading state shown */}
            <button
              type="button"
              onClick={(e) => handlePaymentComplete(e)}
              disabled={!receiptUploaded || isSubmitting}
              className={`w-full h-14 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                receiptUploaded && !isSubmitting
                  ? "bg-gradient-to-r from-violet to-magenta text-white shadow-xl shadow-violet/25 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-secondary/60 text-muted-foreground cursor-not-allowed"
              }`}
            >
              I Have Made Payment
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

        {/* ============ STEP 6: PENDING (LUXURY ANIMATED) ============ */}
        {step === "pending" && (
          <div className="min-h-[65vh] flex flex-col items-center justify-center animate-fade-in">
            
            {/* Animated Status Ring */}
            <div className="relative mb-8">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 w-28 h-28 rounded-full border-2 border-dashed border-gold/30" style={{ animation: "spinSlow 8s linear infinite" }} />
              
              {/* Middle pulsing ring */}
              <div className="absolute inset-2 w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25" style={{ animation: "pendingPulse 2s ease-in-out infinite" }} />
              
              {/* Inner icon container */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 flex items-center justify-center shadow-lg shadow-gold/20">
                  <Clock className="w-7 h-7 text-gold" style={{ animation: "tickTock 1s ease-in-out infinite" }} />
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-1 right-2 w-2 h-2 bg-gold/50 rounded-full" style={{ animation: "floatUp 2s ease-in-out infinite" }} />
              <div className="absolute bottom-0 -left-1 w-1.5 h-1.5 bg-violet/50 rounded-full" style={{ animation: "floatUp 2.5s ease-in-out infinite", animationDelay: "0.5s" }} />
              <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-magenta/50 rounded-full" style={{ animation: "floatUp 3s ease-in-out infinite", animationDelay: "1s" }} />
            </div>

            {/* Status Text */}
            <h2 className="text-xl font-bold text-foreground mb-1">Payment Submitted</h2>
            <p className="text-sm text-muted-foreground text-center max-w-[280px] leading-relaxed mb-4">
              Your transaction has been received and is currently being verified by our payment team.
            </p>

            {/* Live Status Badge */}
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/25 flex items-center gap-2 mb-6">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-gold animate-ping" />
              </div>
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Processing</span>
            </div>

            {/* Transaction Details Card */}
            <div className="w-full rounded-xl bg-secondary/30 border border-border/40 overflow-hidden mb-6">
              <div className="px-4 py-2.5 border-b border-border/30 bg-secondary/20">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Transaction Details</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(AMOUNT)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Reference</span>
                  <span className="text-xs font-mono text-foreground">ZF-{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Est. Confirmation</span>
                  <span className="text-xs text-teal font-medium">5-15 minutes</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="w-full p-3 rounded-xl bg-teal/5 border border-teal/15 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-foreground font-medium">What happens next?</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Our automated system will verify your payment within minutes. Once confirmed, your ZFC credits will be instantly added to your account and you'll receive a notification.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet to-magenta text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet/20"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate("/history")}
                className="w-full h-10 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View All Transactions
              </button>
            </div>

            {/* Trust Footer */}
            <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground/50">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span className="text-[10px]">Encrypted</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span className="text-[10px]">Verified</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span className="text-[10px]">Secure</span>
              </div>
            </div>
          </div>
        )}

        {/* ============ STEP 7: APPROVED ============ */}
        {step === "approved" && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            
            {/* Celebration Confetti Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${20 + Math.random() * 40}%`,
                    background: i % 3 === 0 ? 'hsl(var(--teal))' : i % 3 === 1 ? 'hsl(var(--gold))' : 'hsl(var(--violet))',
                    animation: `confettiFall ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>

            {/* Premium Success Ring Animation */}
            <div className="relative mb-10" style={{ animation: "successEntrance 0.8s ease-out forwards" }}>
              {/* Multi-layer glow effect */}
              <div className="absolute -inset-6 rounded-full bg-teal/10 blur-3xl" style={{ animation: "approvedGlow 3s ease-in-out infinite" }} />
              <div className="absolute -inset-4 rounded-full bg-teal/20 blur-xl" style={{ animation: "approvedGlow 2.5s ease-in-out infinite", animationDelay: "0.5s" }} />
              
              {/* Outer rotating ring */}
              <div 
                className="absolute -inset-3 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent, hsl(var(--teal)), transparent, hsl(var(--gold)), transparent)",
                  animation: "spinSlow 4s linear infinite",
                  opacity: 0.5,
                }}
              />
              
              {/* Secondary rotating ring */}
              <div 
                className="absolute -inset-1.5 rounded-full border border-dashed border-teal/30"
                style={{ animation: "spinSlow 8s linear infinite reverse" }}
              />
              
              {/* Inner success container with glassmorphism */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(46, 242, 226, 0.3), rgba(46, 242, 226, 0.1))",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(46, 242, 226, 0.4)",
                    boxShadow: "0 0 60px rgba(46, 242, 226, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <CheckCircle2 
                    className="w-12 h-12 text-teal" 
                    style={{ animation: "successBounce 0.6s ease-out 0.3s both, iconPulse 2s ease-in-out 1s infinite" }} 
                  />
                </div>
              </div>
              
              {/* Celebration sparkles */}
              <Sparkles className="absolute -top-3 -right-2 w-5 h-5 text-gold" style={{ animation: "sparkle 1.5s ease-in-out infinite" }} />
              <Sparkles className="absolute -bottom-2 -left-3 w-4 h-4 text-teal" style={{ animation: "sparkle 2s ease-in-out infinite", animationDelay: "0.5s" }} />
              <Zap className="absolute top-1/4 -right-4 w-4 h-4 text-violet" style={{ animation: "sparkle 1.8s ease-in-out infinite", animationDelay: "0.3s" }} />
            </div>

            {/* Success Typography */}
            <div className="text-center mb-8" style={{ animation: "slideUpFade 0.6s ease-out 0.4s both" }}>
              <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                Payment <span className="gradient-text">Approved!</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
                Your ZFC credits have been instantly added to your account balance.
              </p>
            </div>

            {/* Premium Amount Card */}
            <div 
              className="w-full relative overflow-hidden rounded-2xl mb-6"
              style={{ 
                animation: "slideUpFade 0.6s ease-out 0.5s both",
                background: "linear-gradient(135deg, rgba(46, 242, 226, 0.15), rgba(46, 242, 226, 0.05))",
                border: "1px solid rgba(46, 242, 226, 0.3)",
              }}
            >
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(46, 242, 226, 0.1), transparent)",
                  animation: "shimmerSlide 3s ease-in-out infinite",
                }}
              />
              
              <div className="relative p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <BadgeCheck className="w-4 h-4 text-teal" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-teal font-semibold">Amount Credited</span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span 
                    className="text-5xl font-bold text-foreground tracking-tight"
                    style={{ fontFamily: "Outfit, sans-serif", animation: "countPop 0.8s ease-out 0.6s both" }}
                  >
                    5,700
                  </span>
                  <span className="text-xl font-semibold text-teal">ZFC</span>
                </div>
              </div>
            </div>

            {/* Transaction Summary Card */}
            <div 
              className="w-full rounded-2xl overflow-hidden mb-6"
              style={{ 
                animation: "slideUpFade 0.6s ease-out 0.6s both",
                background: "rgba(11, 11, 15, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Transaction Complete</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Status</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-teal" style={{ animation: "pulse 2s ease-in-out infinite" }} />
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal/20 text-teal">Approved</span>
                  </div>
                </div>
                <div className="h-px bg-border/30" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Amount Paid</span>
                  <span className="text-base font-bold text-foreground">{formatCurrency(AMOUNT)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">ZFC Received</span>
                  <span className="text-base font-bold text-teal">5,700 ZFC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Reference</span>
                  <span className="text-xs font-mono text-muted-foreground">ZF-{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Premium Actions */}
            <div className="w-full space-y-3" style={{ animation: "slideUpFade 0.6s ease-out 0.7s both" }}>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full h-14 rounded-xl font-bold text-sm transition-all active:scale-[0.98] relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--teal)), hsl(174, 88%, 45%))",
                  boxShadow: "0 0 40px rgba(46, 242, 226, 0.3)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Go to Dashboard
                </span>
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setReceiptUploaded(false);
                  setReceiptFile(null);
                  setReceiptName("");
                  setCurrentPaymentId(null);
                }}
                className="w-full h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-teal border border-border/40 hover:border-teal/30 transition-all"
              >
                Buy More ZFC
              </button>
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-3 mt-6 text-muted-foreground" style={{ animation: "fadeIn 0.6s ease-out 0.8s both" }}>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span className="text-[10px] font-medium">Verified</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span className="text-[10px] font-medium">Secure</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1">
                <Banknote className="w-3 h-3" />
                <span className="text-[10px] font-medium">Instant</span>
              </div>
            </div>
          </div>
        )}

        {/* ============ STEP 8: REJECTED ============ */}
        {step === "rejected" && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            
            {/* Rejection Ring Animation */}
            <div className="relative mb-10" style={{ animation: "rejectEntrance 0.6s ease-out forwards" }}>
              {/* Multi-layer glow */}
              <div className="absolute -inset-6 rounded-full bg-destructive/10 blur-3xl" style={{ animation: "rejectPulse 3s ease-in-out infinite" }} />
              <div className="absolute -inset-4 rounded-full bg-destructive/15 blur-xl" />
              
              {/* Warning ring */}
              <div 
                className="absolute -inset-2 rounded-full border-2 border-destructive/30"
                style={{ animation: "pulseRing 2s ease-in-out infinite" }}
              />
              
              {/* Inner container */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    boxShadow: "0 0 40px rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <AlertTriangle 
                    className="w-12 h-12 text-destructive" 
                    style={{ animation: "shake 0.5s ease-in-out 0.3s" }} 
                  />
                </div>
              </div>
            </div>

            {/* Rejection Typography */}
            <div className="text-center mb-8" style={{ animation: "slideUpFade 0.5s ease-out 0.3s both" }}>
              <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                Payment <span className="text-destructive">Rejected</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
                We couldn't verify your payment. Please review the details below.
              </p>
            </div>

            {/* Rejection Reason Card */}
            <div 
              className="w-full relative overflow-hidden rounded-2xl mb-6"
              style={{ 
                animation: "slideUpFade 0.5s ease-out 0.4s both",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.03))",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(239, 68, 68, 0.15)" }}
                  >
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.15em] text-destructive font-semibold block mb-2">Rejection Reason</span>
                    <p className="text-sm text-foreground leading-relaxed font-medium">
                      {rejectionReason || "The payment details could not be verified. Please ensure the transfer was completed correctly."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div 
              className="w-full rounded-2xl overflow-hidden mb-6"
              style={{ 
                animation: "slideUpFade 0.5s ease-out 0.5s both",
                background: "rgba(11, 11, 15, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-violet" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">What You Can Do</span>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { icon: CheckCircle2, text: "Verify the payment was sent to the correct account", color: "text-teal" },
                  { icon: FileCheck, text: "Ensure the receipt image is clear and shows all details", color: "text-violet" },
                  { icon: Shield, text: "Contact support if you believe this is an error", color: "text-gold" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-secondary/50 ${item.color}`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3" style={{ animation: "slideUpFade 0.5s ease-out 0.6s both" }}>
              <button
                onClick={() => {
                  setStep("form");
                  setReceiptUploaded(false);
                  setReceiptFile(null);
                  setReceiptName("");
                  setCurrentPaymentId(null);
                  setRejectionReason(null);
                }}
                className="w-full h-14 rounded-xl font-bold text-sm transition-all active:scale-[0.98] relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
                  boxShadow: "0 0 40px rgba(123, 63, 228, 0.3)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative text-white flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Try Again
                </span>
              </button>
              <button
                onClick={() => navigate("/support")}
                className="w-full h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-violet border border-border/40 hover:border-violet/30 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Contact Support
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full h-10 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Return to Dashboard
              </button>
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
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pendingPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes tickTock {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
        }
        @keyframes approvedGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes successBounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes successEntrance {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-5px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes rejectEntrance {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes slideUpFade {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes confettiFall {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          25% { transform: translateY(-15px) rotate(90deg); opacity: 1; }
          50% { transform: translateY(5px) rotate(180deg); opacity: 0.8; }
          75% { transform: translateY(-10px) rotate(270deg); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.3) rotate(10deg); opacity: 1; }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(200%); }
        }
        @keyframes countPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rejectPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px) rotate(-2deg); }
          40% { transform: translateX(5px) rotate(2deg); }
          60% { transform: translateX(-3px) rotate(-1deg); }
          80% { transform: translateX(3px) rotate(1deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

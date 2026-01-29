import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Upload, Building2, Sparkles, Lock, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  saveReceiptDraft,
  loadReceiptDraft,
  deleteReceiptDraft,
  saveReceiptForPayment,
  storedReceiptToFile,
} from "@/lib/receiptStore";
import { uploadReceiptForPayment } from "@/lib/receiptUpload";

const AMOUNT = 5700;
const ZFC_AMOUNT = 180000;
const BANK_NAME = "Moniepoint MFB";
const ACCOUNT_NUMBER = "8102562883";
const ACCOUNT_NAME = "CHARIS BENJAMIN SOMTOCHUKWU";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
}

interface AccountDetailsProps {
  userId: string;
  formData: FormData;
  onPaymentConfirmed: (paymentId: string) => void;
}

export const AccountDetails = ({ userId, formData, onPaymentConfirmed }: AccountDetailsProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [tempReceiptFile, setTempReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  // Restore draft receipt from IndexedDB on mount (survives app backgrounding)
  useEffect(() => {
    let cancelled = false;
    loadReceiptDraft(userId).then((stored) => {
      if (cancelled || !stored) return;
      const file = storedReceiptToFile(stored);
      setTempReceiptFile(file);
      setUploadedFile(URL.createObjectURL(file));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Persist file to IndexedDB so it survives app backgrounding
    await saveReceiptDraft(userId, file);

    setTempReceiptFile(file);
    const previewUrl = URL.createObjectURL(file);
    setUploadedFile(previewUrl);
    toast({
      title: "Receipt ready",
      description: "Click 'Confirm Payment' to submit",
    });
  };

  const handleConfirmPayment = async () => {
    // Prevent double submit
    if (!tempReceiptFile || isSubmitting || submittedRef.current) return;

    submittedRef.current = true;
    setIsSubmitting(true);

    // Capture file reference early
    const fileToUpload = tempReceiptFile;

    try {
      // 1. Create payment record with receipt_status = 'uploading' (DB is source of truth)
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          amount: AMOUNT,
          status: "pending",
          receipt_status: "uploading",
        } as any)
        .select("id")
        .single();

      if (paymentError) throw paymentError;

      const paymentId = paymentData.id;

      // 2. Store paymentId locally for recovery
      localStorage.setItem("zenfi_pending_upload_payment", paymentId);

      // 3. Persist receipt blob linked to this payment (for resume)
      await saveReceiptForPayment(paymentId, fileToUpload);

      // 4. Navigate IMMEDIATELY - don't wait for upload
      onPaymentConfirmed(paymentId);

      // 5. Upload receipt in background with 30s timeout
      uploadReceiptForPayment({
        userId,
        paymentId,
        file: fileToUpload,
        timeoutMs: 30000,
      })
        .then(() => {
          // Cleanup
          localStorage.removeItem("zenfi_pending_upload_payment");
          deleteReceiptDraft(userId);
        })
        .catch((err) => {
          console.error("Background receipt upload failed:", err);
          // DB already marked as 'failed' by uploadReceiptForPayment
          localStorage.removeItem("zenfi_pending_upload_payment");
        });
    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit payment",
        variant: "destructive",
      });
      submittedRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Receipt Upload Warning - Moved to Top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-xl bg-gold/10 border border-gold/30"
      >
        <p className="text-xs text-gold font-medium text-center flex items-center justify-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          ⚠️ You MUST upload your payment receipt before confirming
        </p>
      </motion.div>

      {/* Amount Card */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet/12 to-magenta/8 border border-violet/20 p-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet/15 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                ZFC Purchase
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(AMOUNT)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              You will receive{" "}
              <span className="text-teal font-semibold">
                {ZFC_AMOUNT.toLocaleString()} ZFC
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal/15 text-teal border border-teal/20">
              Best Value
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet/15 text-violet border border-violet/20">
              Instant
            </span>
          </div>
        </div>
      </section>

      {/* Bank Transfer Details */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-violet" />
          <h3 className="text-sm font-semibold text-foreground">Transfer Details</h3>
        </div>

        <div className="space-y-3">
          {/* Bank Name */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Bank Name</span>
                <span className="font-semibold text-foreground">{BANK_NAME}</span>
              </div>
              <button
                onClick={() => handleCopy(BANK_NAME, "Bank Name")}
                className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
              >
                {copiedField === "Bank Name" ? (
                  <Check className="w-4 h-4 text-teal" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Account Number */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet/10 to-magenta/5 border border-violet/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Account Number</span>
                <span className="font-mono font-bold text-lg text-foreground tracking-wider">
                  {ACCOUNT_NUMBER}
                </span>
              </div>
              <button
                onClick={() => handleCopy(ACCOUNT_NUMBER, "Account Number")}
                className="p-2.5 rounded-xl bg-violet/20 hover:bg-violet/30 transition-all active:scale-95"
              >
                {copiedField === "Account Number" ? (
                  <Check className="w-4 h-4 text-teal" />
                ) : (
                  <Copy className="w-4 h-4 text-violet" />
                )}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Account Name</span>
                <span className="font-semibold text-foreground text-sm">{ACCOUNT_NAME}</span>
              </div>
              <button
                onClick={() => handleCopy(ACCOUNT_NAME, "Account Name")}
                className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
              >
                {copiedField === "Account Name" ? (
                  <Check className="w-4 h-4 text-teal" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Receipt Upload Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-violet" />
          <h3 className="text-sm font-semibold text-foreground">Upload Payment Receipt</h3>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {uploadedFile ? (
          <div className="relative rounded-xl overflow-hidden border border-teal/30">
            <img
              src={uploadedFile}
              alt="Receipt"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-4">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-teal/20 text-teal rounded-full text-sm font-medium">
                <Check className="w-4 h-4" />
                Receipt Uploaded
              </span>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-6 border-2 border-dashed border-border/50 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-all flex flex-col items-center gap-3"
          >
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Tap to upload payment screenshot
            </span>
          </motion.button>
        )}
      </section>

      {/* Confirm Payment Button */}
      <motion.button
        onClick={handleConfirmPayment}
        disabled={!uploadedFile || isSubmitting}
        whileHover={{ scale: uploadedFile && !isSubmitting ? 1.02 : 1 }}
        whileTap={{ scale: uploadedFile && !isSubmitting ? 0.98 : 1 }}
        className={`w-full py-3.5 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
          uploadedFile && !isSubmitting
            ? "bg-gradient-to-r from-violet to-magenta text-white shadow-lg shadow-violet/25"
            : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          "✓ Confirm Payment"
        )}
      </motion.button>

      {/* Security Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          Protected by 256-bit SSL encryption
        </p>
      </div>
    </motion.div>
  );
};

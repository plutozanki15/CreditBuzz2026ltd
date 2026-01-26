import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Upload, Building2, Sparkles, Lock, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AMOUNT = 5700;
const ZFC_AMOUNT = 180000;
const BANK_NAME = "Moniepoint MFB";
const ACCOUNT_NUMBER = "8102562883";
const ACCOUNT_NAME = "CHARIS BENJAMIN SOMTOCHUKWU";

interface AccountDetailsProps {
  userId: string;
  paymentId: string;
  onUploadComplete: () => void;
}

export const AccountDetails = ({ userId, paymentId, onUploadComplete }: AccountDetailsProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${paymentId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("receipts")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      // Update payment record with receipt URL
      const { error: updateError } = await supabase
        .from("payments")
        .update({ receipt_url: urlData.publicUrl })
        .eq("id", paymentId);

      if (updateError) throw updateError;

      setUploadedFile(urlData.publicUrl);
      toast({
        title: "Receipt uploaded!",
        description: "Your payment receipt has been uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload receipt",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
            disabled={isUploading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-6 border-2 border-dashed border-border/50 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-all flex flex-col items-center gap-3 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Tap to upload payment screenshot
                </span>
              </>
            )}
          </motion.button>
        )}
      </section>

      {/* Proceed Button */}
      <motion.button
        onClick={onUploadComplete}
        disabled={!uploadedFile}
        whileHover={{ scale: uploadedFile ? 1.02 : 1 }}
        whileTap={{ scale: uploadedFile ? 0.98 : 1 }}
        className={`w-full py-3.5 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
          uploadedFile
            ? "bg-gradient-to-r from-violet to-magenta text-white shadow-lg shadow-violet/25"
            : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
        }`}
      >
        Proceed to Payment Status
      </motion.button>

      {/* Receipt Upload Warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-3 rounded-xl bg-gold/10 border border-gold/30"
      >
        <p className="text-xs text-gold font-medium text-center flex items-center justify-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          Please upload your payment receipt for faster verification
        </p>
      </motion.div>

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

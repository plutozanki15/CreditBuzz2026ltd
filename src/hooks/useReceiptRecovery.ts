import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  loadReceiptForPayment,
  deleteReceiptForPayment,
  storedReceiptToFile,
} from "@/lib/receiptStore";
import { uploadReceiptForPayment } from "@/lib/receiptUpload";

/**
 * Global hook that runs on app focus/resume and checks if there's a
 * pending payment with receipt_status = 'uploading'. If so, it will
 * resume or retry the upload automatically.
 */
export const useReceiptRecovery = (userId: string | undefined) => {
  const runningRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const recover = async () => {
      if (runningRef.current) return;
      runningRef.current = true;

      try {
        // Check DB for any pending + uploading payments
        const { data: payments } = await supabase
          .from("payments")
          .select("id, receipt_status, receipt_url")
          .eq("user_id", userId)
          .eq("status", "pending")
          .eq("receipt_status", "uploading")
          .order("created_at", { ascending: false })
          .limit(1);

        if (!payments || payments.length === 0) {
          runningRef.current = false;
          return;
        }

        const payment = payments[0];

        // Check if the receipt already exists in storage
        const fileName = `${userId}/${payment.id}`;
        const { data: files } = await supabase.storage.from("receipts").list(userId);

        const existingFile = files?.find((f) => f.name.startsWith(payment.id));
        if (existingFile) {
          // Receipt is already uploaded - just update DB
          const { data: urlData } = supabase.storage
            .from("receipts")
            .getPublicUrl(`${userId}/${existingFile.name}`);
          await supabase
            .from("payments")
            .update({ receipt_url: urlData.publicUrl, receipt_status: "uploaded" } as any)
            .eq("id", payment.id);
          localStorage.removeItem("zenfi_pending_upload_payment");
          runningRef.current = false;
          return;
        }

        // Try to load stored receipt from IndexedDB
        const stored = await loadReceiptForPayment(payment.id);
        if (!stored) {
          // No local file and not in storage - mark as failed
          await supabase
            .from("payments")
            .update({ receipt_status: "failed" } as any)
            .eq("id", payment.id);
          localStorage.removeItem("zenfi_pending_upload_payment");
          runningRef.current = false;
          return;
        }

        // Resume upload
        const file = storedReceiptToFile(stored);
        await uploadReceiptForPayment({
          userId,
          paymentId: payment.id,
          file,
          timeoutMs: 30000,
        });

        // Cleanup
        await deleteReceiptForPayment(payment.id);
        localStorage.removeItem("zenfi_pending_upload_payment");
      } catch (err) {
        console.error("Receipt recovery failed:", err);
      } finally {
        runningRef.current = false;
      }
    };

    // Run on mount
    recover();

    // Run on focus/visibility
    const handleVisibility = () => {
      if (document.visibilityState === "visible") recover();
    };
    const handleFocus = () => recover();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId]);
};

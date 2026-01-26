import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PaymentData {
  amount: number;
  zfcAmount: number;
  accountName: string;
  receiptUrl: string;
}

interface UsePaymentSubmitReturn {
  submitPayment: (data: PaymentData) => Promise<string | null>;
  isSubmitting: boolean;
}

export const usePaymentSubmit = (): UsePaymentSubmitReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPayment = useCallback(async (data: PaymentData): Promise<string | null> => {
    if (isSubmitting) return null; // Prevent double submission
    
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Not logged in",
          description: "Please log in to submit payment",
          variant: "destructive",
        });
        return null;
      }

      // Insert payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: data.amount,
          zfc_amount: data.zfcAmount,
          account_name: data.accountName,
          receipt_url: data.receiptUrl,
          status: "pending",
        })
        .select("id")
        .single();

      if (paymentError) {
        toast({
          title: "Submission failed",
          description: paymentError.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Payment submitted",
        description: "Awaiting admin verification",
      });

      return paymentData?.id || null;
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return {
    submitPayment,
    isSubmitting,
  };
};

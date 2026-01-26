import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Archive,
  User,
} from "lucide-react";
import { RejectPaymentModal } from "./RejectPaymentModal";
import { SuccessAnimation } from "./SuccessAnimation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  amount: number;
  status: string;
  receipt_url: string | null;
  created_at: string;
  archived: boolean;
}

interface PaymentsTableProps {
  payments: Payment[];
  onPaymentUpdated: () => void;
  showArchived?: boolean;
}

export const PaymentsTable = ({
  payments,
  onPaymentUpdated,
  showArchived = false,
}: PaymentsTableProps) => {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [rejectPayment, setRejectPayment] = useState<Payment | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async (payment: Payment) => {
    setProcessingId(payment.id);

    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "approved" })
        .eq("id", payment.id);

      if (paymentError) throw paymentError;

      // Get current balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", payment.user_id)
        .single();

      if (profileError) throw profileError;

      // Calculate ZFC amount (₦5700 = 180,000 ZFC)
      const zfcAmount = (payment.amount / 5700) * 180000;

      // Update balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: (profile?.balance || 0) + zfcAmount })
        .eq("user_id", payment.user_id);

      if (updateError) throw updateError;

      setSuccessMessage("Payment Approved!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onPaymentUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectPayment) return;
    setProcessingId(rejectPayment.id);

    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: "rejected" })
        .eq("id", rejectPayment.id);

      if (error) throw error;

      setSuccessMessage("Payment Rejected");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onPaymentUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
      setRejectPayment(null);
    }
  };

  const handleArchive = async (payment: Payment) => {
    setProcessingId(payment.id);

    try {
      const { error } = await supabase
        .from("payments")
        .update({ archived: !payment.archived })
        .eq("id", payment.id);

      if (error) throw error;

      setSuccessMessage(payment.archived ? "Payment Restored" : "Payment Archived");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onPaymentUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to archive payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-teal",
          bg: "bg-teal/10",
          border: "border-teal/30",
          label: "Approved",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/30",
          label: "Rejected",
        };
      default:
        return {
          icon: Clock,
          color: "text-gold",
          bg: "bg-gold/10",
          border: "border-gold/30",
          label: "Pending",
        };
    }
  };

  const filteredPayments = payments.filter((p) =>
    showArchived ? p.archived : !p.archived
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredPayments.map((payment, index) => {
                const statusConfig = getStatusConfig(payment.status);
                const StatusIcon = statusConfig.icon;
                const isProcessing = processingId === payment.id;

                return (
                  <motion.tr
                    key={payment.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-violet" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{payment.full_name}</p>
                          <p className="text-sm text-muted-foreground">{payment.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-foreground">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg} border ${statusConfig.border} text-xs font-semibold ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Receipt */}
                        {payment.receipt_url && (
                          <button
                            onClick={() => setSelectedReceipt(payment.receipt_url)}
                            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                            title="View Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Approve/Reject for pending */}
                        {payment.status === "pending" && !payment.archived && (
                          <>
                            <button
                              onClick={() => handleApprove(payment)}
                              disabled={isProcessing}
                              className="p-2 rounded-lg bg-teal/10 hover:bg-teal/20 text-teal transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setRejectPayment(payment)}
                              disabled={isProcessing}
                              className="p-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Archive */}
                        {(payment.status === "approved" || payment.status === "rejected") && (
                          <button
                            onClick={() => handleArchive(payment)}
                            disabled={isProcessing}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                              payment.archived
                                ? "bg-violet/10 hover:bg-violet/20 text-violet"
                                : "bg-secondary/50 hover:bg-secondary text-muted-foreground"
                            }`}
                            title={payment.archived ? "Restore" : "Archive"}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Archive className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {showArchived ? "No archived payments" : "No payments found"}
            </p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="p-4">
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RejectPaymentModal
        isOpen={!!rejectPayment}
        onClose={() => setRejectPayment(null)}
        onConfirm={handleReject}
        paymentAmount={rejectPayment ? formatCurrency(rejectPayment.amount) : ""}
        isProcessing={!!processingId}
      />

      <SuccessAnimation show={showSuccess} message={successMessage} />
    </>
  );
};

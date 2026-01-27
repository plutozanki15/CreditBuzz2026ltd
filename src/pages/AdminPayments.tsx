import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  Shield,
} from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
}

export const AdminPayments = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/login");
        return;
      }
      if (!isAdmin) {
        navigate("/dashboard");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        return;
      }
      fetchPayments();
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } else {
      setPayments(data || []);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: "approved" | "rejected") => {
    setProcessingId(paymentId);

    try {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");

      // If approved, credit the user's balance FIRST
      if (newStatus === "approved") {
        // Get current balance
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("balance")
          .eq("user_id", payment.user_id)
          .single();

        if (profileError) throw profileError;

        // Calculate ZFC amount (₦5700 = 180,000 ZFC)
        const zfcAmount = (payment.amount / 5700) * 180000;
        const newBalance = Number(profile?.balance || 0) + zfcAmount;

        // Update balance - this triggers realtime update on user's dashboard
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("user_id", payment.user_id);

        if (updateError) throw updateError;

        console.log(`Balance updated for user ${payment.user_id}: +${zfcAmount} ZFC (new total: ${newBalance})`);
      }

      // Now update the payment status
      const { error } = await supabase
        .from("payments")
        .update({ status: newStatus })
        .eq("id", paymentId);

      if (error) throw error;

      // Update local state
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
      );

      toast({
        title: "Success",
        description: `Payment ${newStatus}${newStatus === "approved" ? " - User balance updated" : ""}`,
      });
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-teal",
          bg: "bg-teal/10",
          border: "border-teal/20",
          label: "Approved",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/20",
          label: "Rejected",
        };
      default:
        return {
          icon: Clock,
          color: "text-gold",
          bg: "bg-gold/10",
          border: "border-gold/20",
          label: "Pending",
        };
    }
  };

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet" />
            <span className="text-base font-semibold text-foreground">Admin Panel</span>
          </div>
          <button
            onClick={fetchPayments}
            className="p-2 -mr-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 py-5 pb-8 w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Payment Management</h1>
          <p className="text-sm text-muted-foreground">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Yet</h3>
            <p className="text-sm text-muted-foreground">
              Payment requests will appear here for review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;
              const isProcessing = processingId === payment.id;

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/40"
                >
                  {/* User Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{payment.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{payment.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{payment.email}</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}
                    >
                      <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
                      <span className={`text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Amount & Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>

                    {/* View Receipt */}
                    {payment.receipt_url && (
                      <button
                        onClick={() => setSelectedReceipt(payment.receipt_url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-all text-sm text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                        View Receipt
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {payment.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(payment.id, "approved")}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 px-4 bg-teal/20 hover:bg-teal/30 text-teal font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(payment.id, "rejected")}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 px-4 bg-red-400/20 hover:bg-red-400/30 text-red-400 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

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
    </div>
  );
};

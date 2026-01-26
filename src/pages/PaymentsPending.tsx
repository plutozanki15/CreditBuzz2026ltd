import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Receipt,
  ExternalLink,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  amount: number;
  zfc_amount: number;
  status: string;
  receipt_url: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export const PaymentsPending = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data as Payment[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  // Real-time subscription for payment updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("user-payments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-gold/20 text-gold border-gold/30 hover:bg-gold/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-teal/20 text-teal border-teal/30 hover:bg-teal/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet" />
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
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="text-base font-semibold text-foreground">My Payments</span>
          <button
            onClick={fetchPayments}
            className="p-2 -mr-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 py-5 pb-8 w-full max-w-lg mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} className="animate-pulse">
                <div className="h-24 bg-muted/20 rounded" />
              </GlassCard>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="p-4 rounded-full bg-secondary/50 w-fit mx-auto mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No payments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your payment history will appear here</p>
            <button
              onClick={() => navigate("/buy-zfc")}
              className="mt-4 px-6 py-2 rounded-xl bg-violet text-white font-medium hover:bg-violet/90 transition-all"
            >
              Buy ZFC
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <GlassCard
                key={payment.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-teal font-medium">
                        {payment.zfc_amount.toLocaleString()} ZFC
                      </p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>

                  {/* Rejection reason */}
                  {payment.status === "rejected" && payment.rejection_reason && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive font-medium">Reason:</p>
                      <p className="text-sm text-destructive/90">{payment.rejection_reason}</p>
                    </div>
                  )}

                  {/* Receipt link */}
                  {payment.receipt_url && (
                    <button
                      onClick={() => setReceiptPreview(payment.receipt_url)}
                      className="flex items-center gap-2 text-sm text-violet hover:text-violet/80 transition-colors"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>View Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!receiptPreview} onOpenChange={() => setReceiptPreview(null)}>
        <DialogContent className="bg-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {receiptPreview && (
            <img
              src={receiptPreview}
              alt="Payment receipt"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPending;

import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock,
  Receipt,
  User,
  Mail,
  Calendar,
  ExternalLink,
  Download,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const AdminPayments = () => {
  const { payments, isLoading, approvePayment, rejectPayment, refreshData } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptIsPdf, setReceiptIsPdf] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  const pendingPayments = payments.filter(p => p.status === "pending");

  const filteredPayments = pendingPayments.filter(payment => 
    payment.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (paymentId: string) => {
    setProcessing(paymentId);
    const { error } = await approvePayment(paymentId);
    setProcessing(null);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Approved",
        description: "ZFC has been credited to the user's account",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason.trim()) return;
    
    setProcessing(selectedPayment);
    const { error } = await rejectPayment(selectedPayment, rejectReason);
    setProcessing(null);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Rejected",
        description: "The user has been notified",
      });
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedPayment(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast({ title: "Refreshed", description: "Payment list updated" });
  };

  // Get signed URL for receipt viewing (handles both public and private buckets)
  const handleViewReceipt = async (receiptUrl: string) => {
    setIsLoadingReceipt(true);
    try {
      // Extract path from URL if it's a full URL
      let path = receiptUrl;
      if (receiptUrl.includes("/storage/v1/object/public/receipts/")) {
        path = receiptUrl.split("/storage/v1/object/public/receipts/")[1];
      }

      setReceiptIsPdf(path.toLowerCase().endsWith(".pdf"));

      // Try to get signed URL for better security
      const { data, error } = await supabase.functions.invoke("get-signed-receipt-url", {
        body: { path },
      });

      if (error || !data?.signedUrl) {
        // Fallback to direct URL if signed URL fails
        setReceiptPreview(receiptUrl);
      } else {
        setReceiptPreview(data.signedUrl);
      }
    } catch {
      // Fallback to direct URL
      setReceiptPreview(receiptUrl);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="animate-pulse">
            <div className="h-32 bg-muted/20 rounded" />
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Payments</h2>
          <p className="text-muted-foreground text-sm">{pendingPayments.length} pending reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64 bg-secondary/50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPayments.map((payment, index) => (
          <GlassCard 
            key={payment.id} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gold/20">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-teal">{payment.zfc_amount.toLocaleString()} ZFC</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium">
                  Pending
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{payment.account_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{payment.profiles?.email || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                {payment.receipt_url && (
                  <button
                    onClick={() => handleViewReceipt(payment.receipt_url!)}
                    disabled={isLoadingReceipt}
                    className="flex items-center gap-2 text-violet hover:text-violet/80 transition-colors disabled:opacity-50"
                  >
                    {isLoadingReceipt ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Receipt className="w-4 h-4" />
                    )}
                    <span>View Receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <Button
                  onClick={() => handleApprove(payment.id)}
                  disabled={processing === payment.id}
                  className="flex-1 bg-gradient-to-r from-teal to-teal/80 hover:from-teal/90 hover:to-teal/70"
                >
                  {processing === payment.id ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(payment.id);
                    setRejectDialogOpen(true);
                  }}
                  disabled={processing === payment.id}
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}

        {filteredPayments.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="p-4 rounded-full bg-teal/20 w-fit mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal" />
            </div>
            <p className="font-semibold">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No pending payments to review</p>
          </GlassCard>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection reason</label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processing !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || processing !== null}
            >
              {processing ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!receiptPreview} onOpenChange={() => setReceiptPreview(null)}>
        <DialogContent className="bg-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {receiptPreview && (
            receiptIsPdf ? (
              <iframe
                src={receiptPreview}
                title="Payment receipt"
                className="w-full h-[70vh] rounded-lg"
              />
            ) : (
              <img 
                src={receiptPreview} 
                alt="Payment receipt" 
                className="w-full rounded-lg"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

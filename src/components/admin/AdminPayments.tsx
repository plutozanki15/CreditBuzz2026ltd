import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock,
  Receipt,
  User,
  Mail,
  Calendar,
  ExternalLink
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
  const { payments, isLoading, approvePayment, rejectPayment } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

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
              </div>

              {/* Receipt Preview Section */}
              {payment.receipt_url && (
                <div className="pt-3 border-t border-border/30">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <button
                      onClick={() => setReceiptPreview(payment.receipt_url)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/50 hover:border-violet/50 transition-all group flex-shrink-0"
                    >
                      <img 
                        src={payment.receipt_url} 
                        alt="Receipt" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Payment Receipt</p>
                      <button
                        onClick={() => setReceiptPreview(payment.receipt_url)}
                        className="text-sm text-violet hover:text-violet/80 font-medium flex items-center gap-1"
                      >
                        <Receipt className="w-4 h-4" />
                        View Full Size
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

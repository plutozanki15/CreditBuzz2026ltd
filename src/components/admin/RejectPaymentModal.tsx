import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  paymentAmount: string;
  isProcessing: boolean;
}

export const RejectPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  paymentAmount,
  isProcessing,
}: RejectPaymentModalProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason || "Payment rejected");
    setReason("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-secondary/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-400/10 border border-red-400/30">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Reject Payment</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-all"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-muted-foreground">
                  Reject payment of{" "}
                  <span className="text-foreground font-semibold">{paymentAmount}</span>?
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full h-24 p-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-400/50 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border/40 flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

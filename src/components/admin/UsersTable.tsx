import { useState } from "react";
import { motion } from "framer-motion";
import { Ban, ShieldCheck, User, Wallet } from "lucide-react";
import { BanUserModal } from "./BanUserModal";
import { SuccessAnimation } from "./SuccessAnimation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  balance: number;
  status: string;
  ban_reason: string | null;
}

interface UsersTableProps {
  users: Profile[];
  onUserUpdated: () => void;
}

export const UsersTable = ({ users, onUserUpdated }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleBan = async (reason: string) => {
    if (!selectedUser) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "banned", ban_reason: reason })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setSuccessMessage("User banned successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedUser(null);
    }
  };

  const handleUnban = async (user: Profile) => {
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "active", ban_reason: null })
        .eq("id", user.id);

      if (error) throw error;

      setSuccessMessage("User unbanned successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unban user",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Balance</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-violet" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gold" />
                    <span className="font-semibold text-foreground">{formatCurrency(user.balance)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {user.status === "banned" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-400/10 border border-red-400/30 text-xs font-semibold text-red-400">
                      <Ban className="w-3 h-3" />
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal/10 border border-teal/30 text-xs font-semibold text-teal">
                      <ShieldCheck className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  {user.status === "banned" ? (
                    <button
                      onClick={() => handleUnban(user)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-teal/20 hover:bg-teal/30 text-teal text-sm font-medium transition-all disabled:opacity-50"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-all group"
                    >
                      <Ban className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>

      <BanUserModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onConfirm={handleBan}
        userName={selectedUser?.full_name || selectedUser?.email || ""}
        isProcessing={isProcessing}
      />

      <SuccessAnimation show={showSuccess} message={successMessage} />
    </>
  );
};

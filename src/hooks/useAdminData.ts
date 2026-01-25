import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  balance: number;
  referral_code: string | null;
  referral_count: number;
  status: "active" | "banned";
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  zfc_amount: number;
  account_name: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  profiles?: Profile;
}

interface AdminStats {
  totalUsers: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  bannedAccounts: number;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    bannedAccounts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [usersResult, paymentsResult] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);

    if (usersResult.data) {
      const profileData = usersResult.data as Profile[];
      setUsers(profileData);
      
      // Calculate stats
      const bannedCount = profileData.filter(u => u.status === "banned").length;
      setStats(prev => ({
        ...prev,
        totalUsers: profileData.length,
        bannedAccounts: bannedCount,
      }));
    }

    if (paymentsResult.data && usersResult.data) {
      // Join payments with profiles manually
      const profilesMap = new Map<string, Profile>(
        usersResult.data.map(p => [p.user_id, {
          ...p,
          status: p.status as "active" | "banned"
        } as Profile])
      );
      const paymentData: Payment[] = paymentsResult.data.map(p => ({
        id: p.id,
        user_id: p.user_id,
        amount: p.amount,
        zfc_amount: p.zfc_amount,
        account_name: p.account_name,
        receipt_url: p.receipt_url,
        status: p.status as "pending" | "approved" | "rejected",
        rejection_reason: p.rejection_reason,
        processed_by: p.processed_by,
        processed_at: p.processed_at,
        created_at: p.created_at,
        profiles: profilesMap.get(p.user_id),
      }));
      setPayments(paymentData);
      
      // Calculate payment stats
      const pending = paymentData.filter(p => p.status === "pending").length;
      const approved = paymentData.filter(p => p.status === "approved").length;
      const rejected = paymentData.filter(p => p.status === "rejected").length;
      
      setStats(prev => ({
        ...prev,
        pendingPayments: pending,
        approvedPayments: approved,
        rejectedPayments: rejected,
      }));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Set up realtime subscriptions
    const profilesChannel: RealtimeChannel = supabase
      .channel("admin-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchData()
      )
      .subscribe();

    const paymentsChannel: RealtimeChannel = supabase
      .channel("admin-payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      profilesChannel.unsubscribe();
      paymentsChannel.unsubscribe();
    };
  }, []);

  const banUser = async (userId: string, reason: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "banned", ban_reason: reason })
      .eq("user_id", userId);

    if (!error) {
      await logActivity("ban_user", "profile", userId, { reason });
    }
    return { error };
  };

  const unbanUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "active", ban_reason: null })
      .eq("user_id", userId);

    if (!error) {
      await logActivity("unban_user", "profile", userId);
    }
    return { error };
  };

  const approvePayment = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return { error: new Error("Payment not found") };

    // Optimistic update - immediately remove from pending list
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: "approved" as const } : p
    ));
    setStats(prev => ({
      ...prev,
      pendingPayments: prev.pendingPayments - 1,
      approvedPayments: prev.approvedPayments + 1,
    }));

    const { data: { user } } = await supabase.auth.getUser();
    
    // Update payment status
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "approved",
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (paymentError) {
      // Revert optimistic update on error
      fetchData();
      return { error: paymentError };
    }

    // Credit the user's balance directly
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ 
        balance: (payment.profiles?.balance || 0) + payment.zfc_amount 
      })
      .eq("user_id", payment.user_id);

    if (!balanceError) {
      await logActivity("approve_payment", "payment", paymentId, { 
        amount: payment.zfc_amount,
        user_id: payment.user_id,
      });
    }

    return { error: balanceError };
  };

  const rejectPayment = async (paymentId: string, reason: string) => {
    // Optimistic update - immediately remove from pending list
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: "rejected" as const, rejection_reason: reason } : p
    ));
    setStats(prev => ({
      ...prev,
      pendingPayments: prev.pendingPayments - 1,
      rejectedPayments: prev.rejectedPayments + 1,
    }));

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) {
      // Revert optimistic update on error
      fetchData();
      return { error };
    }

    await logActivity("reject_payment", "payment", paymentId, { reason });
    return { error: null };
  };

  const logActivity = async (action: string, targetType: string, targetId: string, details?: Record<string, unknown>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("admin_activity_log").insert([{
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    }]);
  };

  return {
    users,
    payments,
    stats,
    isLoading,
    banUser,
    unbanUser,
    approvePayment,
    rejectPayment,
    refreshData: fetchData,
  };
};

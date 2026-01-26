import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  LayoutDashboard,
  CreditCard,
  Archive,
} from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StatCard } from "@/components/admin/StatCard";
import { UsersTable } from "@/components/admin/UsersTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  balance: number;
  status: string;
  ban_reason: string | null;
}

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

interface Stats {
  totalUsers: number;
  bannedUsers: number;
  approvedPayments: number;
  rejectedPayments: number;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    bannedUsers: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments((paymentsData || []) as Payment[]);

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const bannedUsers = usersData?.filter((u) => u.status === "banned").length || 0;
      const approvedPayments = paymentsData?.filter((p) => p.status === "approved").length || 0;
      const rejectedPayments = paymentsData?.filter((p) => p.status === "rejected").length || 0;

      setStats({
        totalUsers,
        bannedUsers,
        approvedPayments,
        rejectedPayments,
      });
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      fetchData();
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate, fetchData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    const profilesChannel = supabase
      .channel("admin-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel("admin-payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [isAdmin, fetchData]);

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === "pending" && !p.archived);

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet" />
            <span className="text-lg font-bold text-foreground">Admin Dashboard</span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 -mr-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 py-6 max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-6 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1.5 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-1.5 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-sm"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-1.5 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-sm relative"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
              {pendingPayments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-background text-xs font-bold flex items-center justify-center">
                  {pendingPayments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="flex items-center gap-1.5 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-sm"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Archived</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="violet"
                delay={0}
              />
              <StatCard
                title="Banned Accounts"
                value={stats.bannedUsers}
                icon={Ban}
                color="red"
                delay={0.1}
              />
              <StatCard
                title="Approved Payments"
                value={stats.approvedPayments}
                icon={CheckCircle}
                color="teal"
                delay={0.2}
              />
              <StatCard
                title="Rejected Payments"
                value={stats.rejectedPayments}
                icon={XCircle}
                color="gold"
                delay={0.3}
              />
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Recent Pending Payments</h3>
              {pendingPayments.length > 0 ? (
                <PaymentsTable
                  payments={pendingPayments.slice(0, 5)}
                  onPaymentUpdated={fetchData}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-teal/50 mb-3" />
                  <p className="text-muted-foreground">No pending payments</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">User Management</h3>
                <span className="text-sm text-muted-foreground">
                  {users.length} user{users.length !== 1 ? "s" : ""}
                </span>
              </div>
              <UsersTable users={users} onUserUpdated={fetchData} />
            </motion.div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Payment Management</h3>
                <span className="text-sm text-muted-foreground">
                  {payments.filter((p) => !p.archived).length} payment
                  {payments.filter((p) => !p.archived).length !== 1 ? "s" : ""}
                </span>
              </div>
              <PaymentsTable payments={payments} onPaymentUpdated={fetchData} />
            </motion.div>
          </TabsContent>

          {/* Archived Tab */}
          <TabsContent value="archived">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Archived Payments</h3>
                <span className="text-sm text-muted-foreground">
                  {payments.filter((p) => p.archived).length} archived
                </span>
              </div>
              <PaymentsTable payments={payments} onPaymentUpdated={fetchData} showArchived />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

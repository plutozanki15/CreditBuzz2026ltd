import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  MessageSquare,
  Search,
  User,
  ShieldCheck,
  X,
  CalendarDays,
  Clock,
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
import { AdminMessaging } from "@/components/admin/AdminMessaging";
import { BanUserModal } from "@/components/admin/BanUserModal";
import { SuccessAnimation } from "@/components/admin/SuccessAnimation";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  balance: number;
  status: string;
  ban_reason: string | null;
  created_at: string;
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

// Sub-view types for drilldown from stat cards
type SubView = "all-users" | "banned-users" | "approved-payments" | "rejected-payments" | null;

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState("overview");
  const [subView, setSubView] = useState<SubView>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    bannedUsers: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawalMode, setWithdrawalMode] = useState<"weekly" | "daily">("weekly");
  const [isTogglingMode, setIsTogglingMode] = useState(false);

  // Banned users management state (messaging-style layout)
  const [banSearchQuery, setBanSearchQuery] = useState("");
  const [selectedUserToBan, setSelectedUserToBan] = useState<Profile | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [isProcessingBan, setIsProcessingBan] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers((usersData || []) as Profile[]);

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments((paymentsData || []) as Payment[]);

      const totalUsers = usersData?.length || 0;
      const bannedUsers = usersData?.filter((u) => u.status === "banned").length || 0;
      const approvedPayments = paymentsData?.filter((p) => p.status === "approved").length || 0;
      const rejectedPayments = paymentsData?.filter((p) => p.status === "rejected").length || 0;

      setStats({ totalUsers, bannedUsers, approvedPayments, rejectedPayments });

      // Fetch withdrawal mode
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "withdrawal_mode")
        .single();
      if (setting) setWithdrawalMode(setting.value as "weekly" | "daily");
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) { navigate("/login"); return; }
      if (!isAdmin) {
        navigate("/dashboard");
        toast({ title: "Access Denied", description: "You don't have permission", variant: "destructive" });
        return;
      }
      fetchData();
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate, fetchData]);

  useEffect(() => {
    if (!isAdmin) return;

    const profilesChannel = supabase
      .channel("admin-profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchData())
      .subscribe();

    const paymentsChannel = supabase
      .channel("admin-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [isAdmin, fetchData]);

  const handleToggleWithdrawalMode = async () => {
    setIsTogglingMode(true);
    const newMode = withdrawalMode === "weekly" ? "daily" : "weekly";
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({ value: newMode, updated_at: new Date().toISOString() })
        .eq("key", "withdrawal_mode");
      if (error) throw error;
      setWithdrawalMode(newMode);
      toast({ title: "Updated", description: `Withdrawal mode set to ${newMode}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsTogglingMode(false);
    }
  };

  const handleStatCardClick = (view: SubView) => {
    if (view === "all-users" || view === "banned-users") {
      setActiveTab("users");
    } else {
      setActiveTab("payments");
    }
    setSubView(view);
  };

  const handleBanUser = async (reason: string) => {
    if (!selectedUserToBan) return;
    setIsProcessingBan(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "banned", ban_reason: reason, updated_at: new Date().toISOString() })
        .eq("id", selectedUserToBan.id);
      if (error) throw error;
      setSuccessMessage("User banned!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to ban user", variant: "destructive" });
    } finally {
      setIsProcessingBan(false);
      setSelectedUserToBan(null);
      setShowBanModal(false);
    }
  };

  const handleUnbanUser = async (user: Profile) => {
    setIsProcessingBan(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "active", ban_reason: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      setSuccessMessage("User unbanned!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to unban user", variant: "destructive" });
    } finally {
      setIsProcessingBan(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value);
  };

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === "pending" && !p.archived);
  const bannedUsers = users.filter((u) => u.status === "banned");
  const activeUsers = users.filter((u) => u.status !== "banned");

  // Banned users tab: filter by search
  const filteredForBanSearch = activeUsers.filter((u) =>
    u.email.toLowerCase().includes(banSearchQuery.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(banSearchQuery.toLowerCase()))
  );

  const subViewTitle: Record<NonNullable<SubView>, string> = {
    "all-users": "All Users",
    "banned-users": "Banned Accounts",
    "approved-payments": "Approved Payments",
    "rejected-payments": "Rejected Payments",
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <button
            onClick={() => {
              if (subView) { setSubView(null); }
              else { navigate("/settings"); }
            }}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet" />
            <span className="text-lg font-bold text-foreground">
              {subView ? subViewTitle[subView] : "Admin Dashboard"}
            </span>
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
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSubView(null); }} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-xl mx-auto mb-6 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-1 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-xs sm:text-sm">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-xs sm:text-sm relative">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
              {pendingPayments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-background text-xs font-bold flex items-center justify-center">
                  {pendingPayments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-1 data-[state=active]:bg-violet data-[state=active]:text-white rounded-lg text-xs sm:text-sm">
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Archived</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="violet" delay={0}
                onClick={() => handleStatCardClick("all-users")} />
              <StatCard title="Banned Accounts" value={stats.bannedUsers} icon={Ban} color="red" delay={0.1}
                onClick={() => handleStatCardClick("banned-users")} />
              <StatCard title="Approved Payments" value={stats.approvedPayments} icon={CheckCircle} color="teal" delay={0.2}
                onClick={() => handleStatCardClick("approved-payments")} />
              <StatCard title="Rejected Payments" value={stats.rejectedPayments} icon={XCircle} color="gold" delay={0.3}
                onClick={() => handleStatCardClick("rejected-payments")} />
            </div>

            {/* Withdrawal Mode Control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 20 }}
              className="relative overflow-hidden rounded-2xl border border-border/40"
              style={{
                background: withdrawalMode === "daily"
                  ? "linear-gradient(135deg, hsla(174, 88%, 56%, 0.08), hsla(174, 88%, 56%, 0.03))"
                  : "linear-gradient(135deg, hsla(262, 76%, 57%, 0.08), hsla(262, 76%, 57%, 0.03))",
              }}
            >
              {/* Decorative glow */}
              <motion.div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                animate={{
                  background: withdrawalMode === "daily"
                    ? "hsla(174, 88%, 56%, 0.15)"
                    : "hsla(262, 76%, 57%, 0.15)",
                }}
                transition={{ duration: 0.5 }}
              />

              <div className="relative p-5 space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    animate={{
                      background: withdrawalMode === "daily"
                        ? "hsla(174, 88%, 56%, 0.2)"
                        : "hsla(262, 76%, 57%, 0.2)",
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      key={withdrawalMode}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {withdrawalMode === "daily" ? (
                        <CalendarDays className="w-5 h-5 text-teal" />
                      ) : (
                        <Clock className="w-5 h-5 text-violet" />
                      )}
                    </motion.div>
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold text-foreground tracking-tight">Withdrawal Access</h3>
                    <motion.p
                      key={withdrawalMode}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground"
                    >
                      {withdrawalMode === "weekly" ? "Restricted to Fri — Sun only" : "Open to users every day"}
                    </motion.p>
                  </div>
                </div>

                {/* Toggle Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/30">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      animate={{
                        backgroundColor: withdrawalMode === "daily" ? "hsl(174, 88%, 56%)" : "hsl(262, 76%, 57%)",
                        boxShadow: withdrawalMode === "daily"
                          ? "0 0 8px hsla(174, 88%, 56%, 0.6)"
                          : "0 0 8px hsla(262, 76%, 57%, 0.6)",
                      }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      {withdrawalMode === "daily" ? "Daily Mode" : "Weekly Mode"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${withdrawalMode === "weekly" ? "text-violet" : "text-muted-foreground/50"}`}>
                      WKL
                    </span>
                    <button
                      onClick={handleToggleWithdrawalMode}
                      disabled={isTogglingMode}
                      className="relative w-11 h-6 rounded-full transition-all duration-400 focus:outline-none disabled:opacity-50"
                      style={{
                        background: withdrawalMode === "daily"
                          ? "linear-gradient(135deg, hsl(174, 88%, 46%), hsl(174, 88%, 56%))"
                          : "linear-gradient(135deg, hsl(262, 56%, 37%), hsl(262, 76%, 57%))",
                        boxShadow: withdrawalMode === "daily"
                          ? "0 4px 12px hsla(174, 88%, 56%, 0.4), inset 0 1px 1px hsla(0,0%,100%,0.2)"
                          : "0 4px 12px hsla(262, 76%, 57%, 0.4), inset 0 1px 1px hsla(0,0%,100%,0.2)",
                      }}
                    >
                      <motion.span
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                        animate={{ x: withdrawalMode === "daily" ? 24 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                    <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${withdrawalMode === "daily" ? "text-teal" : "text-muted-foreground/50"}`}>
                      DLY
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Recent Pending Payments</h3>
              {pendingPayments.length > 0 ? (
                <PaymentsTable payments={pendingPayments.slice(0, 5)} onPaymentUpdated={fetchData} />
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
            <AnimatePresence mode="wait">
              {/* Banned users drilldown — messaging-style */}
              {subView === "banned-users" ? (
                <motion.div key="banned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">
                  {/* Ban a user: broadcast/individual style toggle */}
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-border/40 max-w-lg mx-auto">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center">
                        <Ban className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Ban a User</h3>
                        <p className="text-xs text-muted-foreground">Search and select a user to ban</p>
                      </div>
                    </div>

                    {selectedUserToBan ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-red-400/10 border border-red-400/30 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{selectedUserToBan.full_name || "No name"}</p>
                            <p className="text-xs text-muted-foreground">{selectedUserToBan.email}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedUserToBan(null)} className="p-2 rounded-lg hover:bg-secondary/50">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          placeholder="Search users by name or email..."
                          value={banSearchQuery}
                          onChange={(e) => setBanSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-violet/50"
                        />
                      </div>
                    )}

                    {!selectedUserToBan && banSearchQuery && (
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 mb-4">
                        {filteredForBanSearch.map((u) => (
                          <button key={u.id} onClick={() => { setSelectedUserToBan(u); setBanSearchQuery(""); }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/20 last:border-0">
                            <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-violet" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{u.full_name || "No name"}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </button>
                        ))}
                        {filteredForBanSearch.length === 0 && (
                          <p className="text-center text-muted-foreground py-4 text-sm">No active users found</p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => { if (selectedUserToBan) setShowBanModal(true); }}
                      disabled={!selectedUserToBan || isProcessingBan}
                      className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Ban className="w-4 h-4" />
                        Ban Selected User
                      </span>
                    </button>
                  </div>

                  {/* Currently banned users list */}
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">Currently Banned</h3>
                      <span className="text-sm text-muted-foreground">{bannedUsers.length} account{bannedUsers.length !== 1 ? "s" : ""}</span>
                    </div>
                    {bannedUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShieldCheck className="w-12 h-12 text-teal/50 mb-3" />
                        <p className="text-muted-foreground">No banned accounts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bannedUsers.map((u, i) => (
                          <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-red-400/5 border border-red-400/20">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-red-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{u.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                {u.ban_reason && <p className="text-xs text-red-400/80 mt-0.5">Reason: {u.ban_reason}</p>}
                              </div>
                            </div>
                            <button onClick={() => handleUnbanUser(u)} disabled={isProcessingBan}
                              className="px-3 py-1.5 rounded-lg bg-teal/20 hover:bg-teal/30 text-teal text-xs font-semibold transition-all disabled:opacity-50">
                              Unban
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : subView === "all-users" ? (
                /* All users drilldown */
                <motion.div key="all-users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">All Users</h3>
                    <span className="text-sm text-muted-foreground">{users.length} users</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/40">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Balance</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Joined</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <motion.tr key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center">
                                  <User className="w-4 h-4 text-violet" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{u.full_name || "Unknown"}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-foreground text-sm">{formatCurrency(u.balance)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-muted-foreground">{formatDate(u.created_at)}</span>
                            </td>
                            <td className="py-4 px-4">
                              {u.status === "banned" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-400/10 border border-red-400/30 text-xs font-semibold text-red-400">
                                  <Ban className="w-3 h-3" /> Banned
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal/10 border border-teal/30 text-xs font-semibold text-teal">
                                  <ShieldCheck className="w-3 h-3" /> Active
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                /* Default users tab */
                <motion.div key="users-default" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">User Management</h3>
                    <span className="text-sm text-muted-foreground">{users.length} user{users.length !== 1 ? "s" : ""}</span>
                  </div>
                  <UsersTable users={users} onUserUpdated={fetchData} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <AnimatePresence mode="wait">
              {(subView === "approved-payments" || subView === "rejected-payments") ? (
                <motion.div key={subView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      {subView === "approved-payments" ? "Approved Payments" : "Rejected Payments"}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {payments.filter((p) => p.status === (subView === "approved-payments" ? "approved" : "rejected") && !p.archived).length} payment(s)
                    </span>
                  </div>
                  <PaymentsTable
                    payments={payments}
                    onPaymentUpdated={fetchData}
                    filterStatus={subView === "approved-payments" ? "approved" : "rejected"}
                  />
                </motion.div>
              ) : (
                <motion.div key="payments-default" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Payment Management</h3>
                    <span className="text-sm text-muted-foreground">
                      {payments.filter((p) => !p.archived).length} payment{payments.filter((p) => !p.archived).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <PaymentsTable payments={payments} onPaymentUpdated={fetchData} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-magenta/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-violet" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Send Messages</h3>
                  <p className="text-xs text-muted-foreground">Broadcast to all or send individually</p>
                </div>
              </div>
              <AdminMessaging />
            </motion.div>
          </TabsContent>

          {/* Archived Tab */}
          <TabsContent value="archived">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Archived Payments</h3>
                <span className="text-sm text-muted-foreground">{payments.filter((p) => p.archived).length} archived</span>
              </div>
              <PaymentsTable payments={payments} onPaymentUpdated={fetchData} showArchived />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <BanUserModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleBanUser}
        userName={selectedUserToBan?.full_name || selectedUserToBan?.email || ""}
        isProcessing={isProcessingBan}
      />

      <SuccessAnimation show={showSuccess} message={successMessage} />
    </div>
  );
};

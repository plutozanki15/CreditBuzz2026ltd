import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bell, 
  Archive, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminArchive } from "@/components/admin/AdminArchive";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";

type TabType = "dashboard" | "users" | "payments" | "notifications" | "archive" | "settings";

const tabs = [
  { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
  { id: "users" as TabType, label: "Users", icon: Users },
  { id: "payments" as TabType, label: "Payments", icon: CreditCard },
  { id: "notifications" as TabType, label: "Notifications", icon: Bell },
  { id: "archive" as TabType, label: "Archive", icon: Archive },
  { id: "settings" as TabType, label: "Settings", icon: SettingsIcon },
];

export const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading, signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Only redirect once loading is done AND user is confirmed NOT admin
    // Important: don't redirect while loading or if we have no user yet but still loading
    if (!isLoading && !isAdmin && user === null) {
      navigate("/login");
    } else if (!isLoading && !isAdmin && user !== null) {
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, user, navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("zenfi_onboarding_complete");
    navigate("/login");
    await signOut();
  };

  // Keep showing spinner while loading OR while waiting for admin status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    // Still render nothing while redirect useEffect runs
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <AdminUsers />;
      case "payments":
        return <AdminPayments />;
      case "notifications":
        return <AdminNotifications />;
      case "archive":
        return <AdminArchive />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <FloatingParticles />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card/95 backdrop-blur-xl border-r border-border/50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ZenfiLogo size="sm" />
              <div>
                <h1 className="font-display font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">ZenFi Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-left
                ${activeTab === tab.id 
                  ? "bg-gradient-to-r from-violet/20 to-magenta/20 text-foreground border border-violet/30" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-violet" : ""}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <ZenfiLogo size="sm" />
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

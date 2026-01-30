import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PaymentStatusGate } from "@/components/payment/PaymentStatusGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Support } from "./pages/Support";
import { Settings } from "./pages/Settings";
import { Community } from "./pages/Community";
import { Withdrawal } from "./pages/Withdrawal";
import { WithdrawalCode } from "./pages/WithdrawalCode";
import { Referral } from "./pages/Referral";
import { BuyZFC } from "./pages/BuyZFC";
import { PaymentsPending } from "./pages/PaymentsPending";
import { PaymentStatus } from "./pages/PaymentStatus";
import { AdminPayments } from "./pages/AdminPayments";
import { AdminDashboard } from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { getLastRoute, useRouteHistory } from "@/hooks/useRouteHistory";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const RoutePersistence = () => {
  useRouteHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // On cold start/re-entry, restore the last in-app route for authenticated users.
  // This prevents users from being forced back to the Buy ZFC form after leaving the app to pay.
  // (Only restores when we land on / or /login.)
  
  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (location.pathname !== "/" && location.pathname !== "/login") return;

    const lastRoute = getLastRoute();
    if (!lastRoute) return;
    if (lastRoute === location.pathname) return;
    navigate(lastRoute, { replace: true });
  }, [isLoading, user, location.pathname, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <RoutePersistence />
        <PaymentStatusGate />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/community" element={<Community />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/withdrawal-code" element={<WithdrawalCode />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/buy-zfc" element={<BuyZFC />} />
          <Route path="/payments" element={<PaymentsPending />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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
import { TapAndEarn } from "./pages/TapAndEarn";
import { BuyZFC } from "./pages/BuyZFC";
import { PaymentsPending } from "./pages/PaymentsPending";
import { PaymentStatus } from "./pages/PaymentStatus";
import { AdminPayments } from "./pages/AdminPayments";
import { AdminDashboard } from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { getLastRoute, useRouteHistory } from "@/hooks/useRouteHistory";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const BUY_ZFC_STATE_KEY = "zenfi_buy_zfc_state";

const hasPendingBuyZFCDetails = (): boolean => {
  try {
    const raw = localStorage.getItem(BUY_ZFC_STATE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    // Only consider it valid if step is "details" and not expired (1 hour)
    if (parsed?.step !== "details") return false;
    if (Date.now() - (parsed?.timestamp || 0) > 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
};

const RoutePersistence = () => {
  useRouteHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // On cold start/re-entry, ONLY redirect to /buy-zfc if user was on Account Details step.
  // This allows users to return after leaving to pay and continue submitting their receipt.
  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    // Only intercept when landing on root routes
    if (location.pathname !== "/" && location.pathname !== "/login" && location.pathname !== "/dashboard") return;

    // Check if user was in the middle of the Buy ZFC flow (on Account Details step)
    if (hasPendingBuyZFCDetails()) {
      navigate("/buy-zfc", { replace: true });
    }
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
          <Route path="/referral" element={<TapAndEarn />} />
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

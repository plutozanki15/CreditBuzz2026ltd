import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
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

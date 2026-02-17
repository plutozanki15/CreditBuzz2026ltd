import { Clock, Calendar, AlertTriangle, ArrowLeft } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { useNavigate } from "react-router-dom";

export const WeekendOnlyGate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-secondary/80 hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold tracking-tight">Withdraw Funds</h1>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      {/* Blurred background placeholder */}
      <div className="relative z-0 px-4 pb-8 blur-sm opacity-30 pointer-events-none select-none" aria-hidden="true">
        <div className="p-5 rounded-2xl mb-4" style={{ background: "hsla(174, 88%, 56%, 0.08)", border: "1px solid hsla(174, 88%, 56%, 0.15)" }}>
          <div className="h-8 w-32 bg-muted/40 rounded-lg" />
        </div>
        <div className="p-4 rounded-2xl mb-4 space-y-4" style={{ background: "hsla(240, 7%, 8%, 0.5)", border: "1px solid hsla(0,0%,100%,0.04)" }}>
          <div className="h-12 w-full bg-muted/30 rounded-xl" />
          <div className="h-12 w-full bg-muted/30 rounded-xl" />
          <div className="h-12 w-full bg-muted/30 rounded-xl" />
        </div>
        <div className="h-14 w-full bg-muted/20 rounded-2xl" />
      </div>

      {/* Warning overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
        <div
          className="w-full max-w-sm p-6 rounded-3xl text-center space-y-5 animate-fade-in-up"
          style={{
            background: "linear-gradient(145deg, hsla(240, 7%, 10%, 0.95), hsla(240, 7%, 6%, 0.98))",
            border: "1px solid hsla(45, 93%, 58%, 0.25)",
            boxShadow: "0 20px 60px hsla(0, 0%, 0%, 0.5), 0 0 40px hsla(45, 93%, 58%, 0.08)",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsla(45, 93%, 58%, 0.2), hsla(33, 100%, 50%, 0.15))" }}
            >
              <Calendar className="w-8 h-8 text-gold" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-display font-bold text-foreground mb-1">Weekend Withdrawals Only</h2>
            <div className="flex items-center justify-center gap-1.5 text-gold/80">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Restricted Period</span>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Withdrawals are only available on <span className="text-teal font-semibold">weekends</span> — from{" "}
            <span className="text-foreground font-medium">Friday 12:00 AM</span> to{" "}
            <span className="text-foreground font-medium">Sunday 11:50 PM</span>.
          </p>

          {/* Schedule card */}
          <div
            className="p-3.5 rounded-xl space-y-2"
            style={{ background: "hsla(174, 88%, 56%, 0.06)", border: "1px solid hsla(174, 88%, 56%, 0.12)" }}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal" />
              <span className="text-xs font-semibold text-teal uppercase tracking-wider">Withdrawal Window</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Opens</span>
              <span className="text-foreground font-medium">Friday 12:00 AM</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Closes</span>
              <span className="text-foreground font-medium">Sunday 11:50 PM</span>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 rounded-xl font-display font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
              boxShadow: "0 6px 20px hsla(262, 76%, 57%, 0.3)",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

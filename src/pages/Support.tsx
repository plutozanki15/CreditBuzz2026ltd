import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { 
  ArrowLeft,
  MessageCircle,
  Send,
  Mail,
  Phone,
  Shield,
  Clock,
  ExternalLink
} from "lucide-react";

const contactMethods = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "09153889086",
    link: "https://wa.me/2349153889086",
    color: "from-teal to-violet",
    description: "Chat with us instantly"
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@lumexzz",
    link: "https://t.me/lumexzz",
    color: "from-violet to-magenta",
    description: "Fast & secure messaging"
  },
  {
    icon: Mail,
    label: "Email",
    value: "commanderbenjamin177@gmail.com",
    link: "mailto:commanderbenjamin177@gmail.com",
    color: "from-magenta to-gold",
    description: "Detailed inquiries"
  }
];

export const Support = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useRouteHistory();
  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-semibold">Support Center</h1>
          <p className="text-xs text-muted-foreground">We're here to help</p>
        </div>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 space-y-6">
        {/* Hero Section */}
        <GlassCard className="text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet to-magenta flex items-center justify-center"
            style={{ boxShadow: "0 8px 32px hsla(262, 76%, 57%, 0.3)" }}
          >
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Get in Touch</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Our support team is available 24/7 to assist you
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal" />
              Secure
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold" />
              24/7 Available
            </span>
          </div>
        </GlassCard>

        {/* Contact Methods */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">Contact Methods</h3>
          
          {contactMethods.map((method, index) => (
            <a
              key={method.label}
              href={method.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block animate-fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <GlassCard 
                className={`flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  activeCard === index ? "ring-1 ring-violet/30" : ""
                }`}
              >
                <div 
                  className={`p-3 rounded-xl bg-gradient-to-br ${method.color} transition-transform duration-300 ${
                    activeCard === index ? "scale-110" : ""
                  }`}
                  style={{ boxShadow: "0 4px 20px hsla(262, 76%, 57%, 0.2)" }}
                >
                  <method.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{method.label}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-teal truncate">{method.value}</p>
                  <p className="text-xs text-muted-foreground/70">{method.description}</p>
                </div>
              </GlassCard>
            </a>
          ))}
        </div>

        {/* FAQ Teaser */}
        <GlassCard 
          className="animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h3 className="font-semibold mb-2">Common Questions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-teal">•</span>
              <span className="text-muted-foreground">How do I claim my daily reward?</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-violet">•</span>
              <span className="text-muted-foreground">When can I withdraw my balance?</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-magenta">•</span>
              <span className="text-muted-foreground">How does referral bonus work?</span>
            </div>
          </div>
        </GlassCard>

        {/* Security Footer */}
        <div className="text-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-xs text-muted-foreground/50">
            🔒 Secure environment • Encrypted system
          </p>
        </div>
      </main>
    </div>
  );
};

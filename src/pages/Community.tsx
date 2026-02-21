import { useNavigate } from "react-router-dom";
import { ZenfiLogo } from "@/components/ui/ZenfiLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { 
  ArrowLeft, 
  Users, 
  Bell, 
  Shield, 
  Gift,
  MessageCircle,
  Star,
  ExternalLink
} from "lucide-react";

const communityFeatures = [
  {
    icon: Bell,
    title: "Official Updates",
    description: "Get real-time notifications on new features and announcements",
  },
  {
    icon: Gift,
    title: "Rewards Alerts",
    description: "Never miss exclusive bonuses and claim opportunities",
  },
  {
    icon: Shield,
    title: "Security Notices",
    description: "Stay informed about security tips and account protection",
  },
  {
    icon: MessageCircle,
    title: "Community Support",
    description: "Connect with verified users and get help instantly",
  },
];

export const Community = () => {
  const navigate = useNavigate();
  
  useRouteHistory();

  const handleJoinCommunity = () => {
    window.open("https://t.me/creditbuzz", "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <ZenfiLogo size="sm" />
      </header>

      <main className="relative z-10 px-4 space-y-5">
        {/* Hero Section */}
        <div className="text-center animate-fade-in-up">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsla(262, 76%, 57%, 0.2), hsla(289, 100%, 65%, 0.15))",
              boxShadow: "0 8px 32px hsla(262, 76%, 57%, 0.2)",
            }}
          >
            <Users className="w-8 h-8 text-violet" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">
            Join the CreditBuzz Community
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Stay connected with verified CreditBuzz users, get official updates, rewards alerts, security notices, and community support.
          </p>
        </div>

        {/* Trust Badge */}
        <GlassCard 
          className="flex items-center justify-center gap-2 py-3 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Star className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium">Be part of a growing trusted fintech network</span>
          <Star className="w-4 h-4 text-gold" />
        </GlassCard>

        {/* Features Grid */}
        <div 
          className="grid grid-cols-2 gap-3 animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          {communityFeatures.map((feature, index) => (
            <GlassCard
              key={feature.title}
              className="p-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-fade-in-up"
              style={{ 
                animationDelay: `${0.2 + index * 0.05}s`,
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: "linear-gradient(135deg, hsla(262, 76%, 57%, 0.15), hsla(174, 88%, 56%, 0.1))",
                }}
              >
                <feature.icon className="w-5 h-5 text-teal" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Member Count */}
        <GlassCard 
          className="text-center py-4 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium"
                  style={{
                    background: `linear-gradient(135deg, hsla(${262 + i * 20}, 76%, 57%, 0.3), hsla(${289 + i * 15}, 100%, 65%, 0.2))`,
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">5,000+ Members</p>
              <p className="text-[10px] text-muted-foreground">Active & verified users</p>
            </div>
          </div>
        </GlassCard>

        {/* Join Button */}
        <button
          onClick={handleJoinCommunity}
          className="w-full relative overflow-hidden glass-card py-4 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group animate-fade-in-up"
          style={{
            animationDelay: "0.45s",
            background: "linear-gradient(135deg, hsla(262, 76%, 57%, 0.25), hsla(289, 100%, 65%, 0.2))",
            boxShadow: "0 8px 32px hsla(262, 76%, 57%, 0.25)",
          }}
        >
          {/* Animated glow */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "radial-gradient(circle at center, hsla(262, 76%, 57%, 0.3) 0%, transparent 70%)",
            }}
          />
          
          <MessageCircle className="w-5 h-5 text-violet relative z-10" />
          <span className="font-display font-semibold text-base relative z-10">Join Our Community</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground relative z-10" />
        </button>

        {/* Security Footer */}
        <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-[10px] text-muted-foreground/50">
            🔒 Official CreditBuzz channel • Verified & secure
          </p>
        </div>
      </main>
    </div>
  );
};

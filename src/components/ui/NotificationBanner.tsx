import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, AlertTriangle, AlertCircle, Info, MessageCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: "info" | "warning" | "important";
  is_broadcast: boolean;
  is_read: boolean;
  created_at: string;
}

export const NotificationBanner = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        const typed = data as Notification[];
        setNotifications(typed);
        // Stagger animation for each notification
        typed.forEach((n, i) => {
          setTimeout(() => {
            setVisibleNotifications(prev => [...prev, n.id]);
          }, i * 150);
        });
      }
    };

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setTimeout(() => {
            setVisibleNotifications(prev => [newNotification.id, ...prev]);
          }, 50);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const dismissNotification = async (id: string) => {
    setVisibleNotifications(prev => prev.filter(nId => nId !== id));
    
    // Wait for exit animation
    setTimeout(async () => {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  if (notifications.length === 0) return null;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "important":
        return {
          gradient: "from-destructive/95 to-destructive/80",
          icon: AlertCircle,
          iconBg: "bg-white/20",
          accent: "border-l-destructive",
          glow: "shadow-destructive/20",
        };
      case "warning":
        return {
          gradient: "from-gold/95 to-gold/80",
          icon: AlertTriangle,
          iconBg: "bg-background/20",
          accent: "border-l-gold",
          glow: "shadow-gold/20",
        };
      default:
        return {
          gradient: "from-violet/95 to-magenta/80",
          icon: Info,
          iconBg: "bg-white/20",
          accent: "border-l-violet",
          glow: "shadow-violet/20",
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-[340px] w-full pointer-events-none">
      {notifications.map((notification) => {
        const config = getPriorityConfig(notification.priority);
        const Icon = config.icon;
        const isVisible = visibleNotifications.includes(notification.id);

        return (
          <div
            key={notification.id}
            className={`
              pointer-events-auto
              transform transition-all duration-300 ease-out
              ${isVisible 
                ? "translate-x-0 opacity-100 scale-100" 
                : "translate-x-full opacity-0 scale-95"
              }
            `}
          >
            {/* Chat Bubble Container */}
            <div
              className={`
                relative overflow-hidden rounded-2xl rounded-tr-sm
                border-l-4 ${config.accent}
                bg-gradient-to-br ${config.gradient}
                shadow-2xl ${config.glow}
                backdrop-blur-xl
              `}
              style={{
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                  0 -1px 0 0 rgba(255, 255, 255, 0.05) inset
                `,
              }}
            >
              {/* Shimmer Effect */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  animation: "shimmer 3s infinite",
                }}
              />

              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    p-2 rounded-xl ${config.iconBg}
                    flex-shrink-0 backdrop-blur-sm
                    ring-1 ring-white/10
                  `}>
                    <Icon className="w-4 h-4 text-white drop-shadow-sm" />
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-white tracking-tight leading-tight truncate">
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-white/60 font-medium flex-shrink-0">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="
                      p-1.5 rounded-lg 
                      bg-white/10 hover:bg-white/20 
                      transition-all duration-200
                      hover:scale-110 active:scale-95
                      flex-shrink-0
                      ring-1 ring-white/5
                    "
                  >
                    <X className="w-3.5 h-3.5 text-white/80" />
                  </button>
                </div>

                {/* Chat Tail Indicator */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                  <MessageCircle className="w-3 h-3 text-white/50" />
                  <span className="text-[10px] text-white/50 font-medium tracking-wide">
                    ZenFi Official
                  </span>
                  <div className="flex-1" />
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-white/40" />
                    <div className="w-1 h-1 rounded-full bg-white/60" />
                  </div>
                </div>
              </div>

              {/* Chat Bubble Tail */}
              <div 
                className={`absolute -top-0 -right-1 w-4 h-4 bg-gradient-to-br ${config.gradient}`}
                style={{
                  clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Shimmer Animation Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState(0);

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
        setNotifications(data as Notification[]);
      }
    };

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const dismissNotification = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  const current = notifications[currentIndex];
  if (!current) return null;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "important":
        return {
          bg: "bg-gradient-to-r from-destructive/90 to-destructive/70",
          icon: AlertCircle,
          iconColor: "text-white",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-gold/90 to-gold/70",
          icon: AlertTriangle,
          iconColor: "text-background",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-violet/90 to-magenta/70",
          icon: Info,
          iconColor: "text-white",
        };
    }
  };

  const styles = getPriorityStyles(current.priority);
  const Icon = styles.icon;

  return (
    <div className={`${styles.bg} px-4 py-3 animate-fade-in-up relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
      <div className="relative flex items-start gap-3 max-w-lg mx-auto">
        <div className="p-1.5 rounded-lg bg-white/20 flex-shrink-0">
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white">{current.title}</p>
          <p className="text-xs text-white/80 line-clamp-2">{current.message}</p>
        </div>
        <button
          onClick={() => dismissNotification(current.id)}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>
      {notifications.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {notifications.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

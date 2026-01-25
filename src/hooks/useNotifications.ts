import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: "info" | "warning" | "important";
  is_broadcast: boolean;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      const typed = data as Notification[];
      setNotifications(typed);
      setUnreadCount(typed.length);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("user-notifications-hook")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchNotifications]);

  const dismissNotification = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, dismissNotification, refresh: fetchNotifications };
};

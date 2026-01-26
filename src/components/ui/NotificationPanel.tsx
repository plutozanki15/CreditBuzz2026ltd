import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, MessageSquare, Users, User, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  title: string;
  content: string;
  is_broadcast: boolean;
  read_at: string | null;
  created_at: string;
}

export const NotificationPanel = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    fetchMessages();

    // Real-time subscription for INSTANT message delivery
    const channel = supabase
      .channel("user-messages-instant")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Check if this message is for the current user
          if (newMessage.is_broadcast || newMessage.receiver_id === profile.id) {
            setMessages((prev) => [newMessage, ...prev]);
            setCurrentMessage(newMessage);
            setShowNotification(true);
            setUnreadCount((prev) => prev + 1);
            
            // Auto-hide notification after 8 seconds
            setTimeout(() => {
              setShowNotification(false);
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchMessages = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`is_broadcast.eq.true,receiver_id.eq.${profile.id}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setMessages(data as Message[]);
      setUnreadCount(data.filter((m) => !m.read_at).length);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, read_at: new Date().toISOString() } : m
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Clear message from view (mark as read and hide)
  const clearMessage = async (messageId: string) => {
    await markAsRead(messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleNotificationClick = () => {
    if (currentMessage) {
      markAsRead(currentMessage.id);
      setShowNotification(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(true)}
        className="relative p-2 rounded-xl bg-secondary/50 border border-border/40 hover:bg-secondary/70 transition-all"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-violet to-magenta text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* WhatsApp-style Slide-in Notification - Positioned lower for visibility */}
      <AnimatePresence>
        {showNotification && currentMessage && (
          <motion.div
            initial={{ x: 400, opacity: 0, y: 0 }}
            animate={{ x: 0, opacity: 1, y: 0 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-32 right-4 z-[100] w-[320px] max-w-[calc(100vw-32px)]"
            onClick={handleNotificationClick}
          >
            <div
              className="relative overflow-hidden rounded-2xl border shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform"
              style={{
                background: "linear-gradient(135deg, hsla(var(--card), 0.98), hsla(var(--card), 0.95))",
                borderColor: currentMessage.is_broadcast
                  ? "hsla(var(--violet), 0.4)"
                  : "hsla(var(--teal), 0.4)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: currentMessage.is_broadcast
                    ? "linear-gradient(90deg, hsl(var(--violet)), hsl(var(--magenta)))"
                    : "linear-gradient(90deg, hsl(var(--teal)), hsl(var(--violet)))",
                }}
              />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: currentMessage.is_broadcast
                          ? "linear-gradient(135deg, hsla(var(--violet), 0.2), hsla(var(--magenta), 0.2))"
                          : "linear-gradient(135deg, hsla(var(--teal), 0.2), hsla(var(--violet), 0.2))",
                      }}
                    >
                      {currentMessage.is_broadcast ? (
                        <Users className="w-4 h-4 text-violet" />
                      ) : (
                        <User className="w-4 h-4 text-teal" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {currentMessage.is_broadcast ? "Broadcast" : "Personal Message"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(currentMessage.id);
                      setShowNotification(false);
                    }}
                    className="p-1 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Content */}
                <h4 className="text-sm font-bold text-foreground mb-1">
                  {currentMessage.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {currentMessage.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatTime(currentMessage.created_at)}
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    Tap to dismiss
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Notifications Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-magenta/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-violet" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                      <p className="text-xs text-muted-foreground">
                        {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="overflow-y-auto h-[calc(100vh-88px)] p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-4 rounded-xl border transition-all ${
                        message.read_at
                          ? "bg-secondary/20 border-border/30"
                          : "bg-secondary/50 border-violet/30"
                      }`}
                    >
                      {/* Unread indicator */}
                      {!message.read_at && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet animate-pulse" />
                      )}

                      {/* Type badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            message.is_broadcast
                              ? "bg-violet/20 text-violet"
                              : "bg-teal/20 text-teal"
                          }`}
                        >
                          {message.is_broadcast ? "Broadcast" : "Personal"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatTime(message.created_at)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-foreground mb-1">
                        {message.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {message.content}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {!message.read_at ? (
                          <button
                            onClick={() => markAsRead(message.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-violet hover:text-violet/80 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">Read</span>
                        )}
                        
                        {/* Clear/Remove button */}
                        <button
                          onClick={() => clearMessage(message.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

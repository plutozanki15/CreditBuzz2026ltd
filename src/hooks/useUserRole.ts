import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const ADMIN_CACHE_KEY = "creditbuzz_is_admin";

export const useUserRole = () => {
  const { user, isLoading: authLoading } = useAuth();
  // Initialize from cache so the value is available on first render
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_CACHE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(!localStorage.getItem(ADMIN_CACHE_KEY));

  useEffect(() => {
    if (authLoading) return;

    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        localStorage.removeItem(ADMIN_CACHE_KEY);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        localStorage.removeItem(ADMIN_CACHE_KEY);
      } else {
        const admin = data === true;
        setIsAdmin(admin);
        localStorage.setItem(ADMIN_CACHE_KEY, String(admin));
      }
      setIsLoading(false);
    };

    checkAdminRole();
  }, [user, authLoading]);

  return { isAdmin, isLoading };
};

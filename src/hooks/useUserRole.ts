import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking roles
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Use backend function to avoid any RLS edge-cases when reading roles directly.
      // This also makes admin detection reliable immediately after role promotion.
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
      setIsLoading(false);
    };

    checkAdminRole();
  }, [user, authLoading]);

  return { isAdmin, isLoading };
};

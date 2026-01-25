import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  balance: number;
  referral_code: string | null;
  referral_count: number;
  status: "active" | "banned";
  ban_reason: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isBanned: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isAdmin: false,
    isLoading: true,
    isBanned: false,
  });

  // Guard against racing auth events
  const initializedRef = useRef(false);

  useEffect(() => {
    // Helper to load profile + admin status for a given user id
    const loadUserData = async (user: User, session: Session) => {
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      ]);

      const profile = profileResult.data as Profile | null;
      const isAdmin = roleResult.data === true;
      const isBanned = profile?.status === "banned";

      setAuthState({
        user,
        session,
        profile,
        isAdmin,
        isLoading: false,
        isBanned,
      });
    };

    // 1. Check existing session on first mount (skip waiting for onAuthStateChange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user, session);
        initializedRef.current = true;
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        initializedRef.current = true;
      }
    });

    // 2. Subscribe to future auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip initial event if already handled above
      if (!initializedRef.current) return;

      if (session?.user) {
        await loadUserData(session.user, session);
      } else {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          isAdmin: false,
          isLoading: false,
          isBanned: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    referralCode?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          referral_code: referralCode,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    // Set loading false immediately for responsive UI, signOut async in background
    setAuthState((prev) => ({ ...prev, isLoading: false }));
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const refreshProfile = async () => {
    if (!authState.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authState.user.id)
      .maybeSingle();

    if (data) {
      setAuthState((prev) => ({
        ...prev,
        profile: data as Profile,
        isBanned: data.status === "banned",
      }));
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
};

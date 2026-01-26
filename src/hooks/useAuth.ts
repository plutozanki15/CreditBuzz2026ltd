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
  isLoading: boolean;
  isBanned: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isBanned: false,
  });

  // Guard against racing auth events
  const initializedRef = useRef(false);
  const profileChannelRef = useRef<any>(null);

  useEffect(() => {
    // Helper to load profile for a given user id
    const loadUserData = async (user: User, session: Session) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const typedProfile = profile as Profile | null;
      const isBanned = typedProfile?.status === "banned";

      setAuthState({
        user,
        session,
        profile: typedProfile,
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!initializedRef.current) return;

      if (session?.user) {
        await loadUserData(session.user, session);
      } else {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isBanned: false,
        });
      }
    });

    // 3. Set up realtime subscription for profile changes (ban status updates)
    const setupProfileSubscription = (userId: string) => {
      if (profileChannelRef.current) {
        profileChannelRef.current.unsubscribe();
      }

      profileChannelRef.current = supabase
        .channel(`profile-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const updatedProfile = payload.new as Profile;
            setAuthState((prev) => ({
              ...prev,
              profile: updatedProfile,
              isBanned: updatedProfile.status === "banned",
            }));
          }
        )
        .subscribe();
    };

    // Subscribe for current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setupProfileSubscription(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannelRef.current) {
        profileChannelRef.current.unsubscribe();
      }
    };
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

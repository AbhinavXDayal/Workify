import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setAuthError(error.message);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!configured) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown sign in error';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!configured) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown sign up error';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!configured) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return {
    user,
    loading,
    authError,
    setAuthError,
    isConfigured: configured,
    signIn,
    signUp,
    signOut,
  };
}


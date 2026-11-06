import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, full_name: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from backend database using Supabase session
  const syncBackendUser = useCallback(async (currentSession: Session | null, sbUser: SupabaseUser | null) => {
    if (!currentSession || !sbUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const backendUser = await api.me();
      setUser(backendUser);
    } catch {
      // Fallback local representation if backend is starting or offline
      setUser({
        id: 1,
        email: sbUser.email || '',
        full_name: (sbUser.user_metadata?.full_name as string) || sbUser.email?.split('@')[0] || 'Analyst',
        role: (sbUser.user_metadata?.role as 'admin' | 'analyst') || 'analyst',
        is_active: true,
        created_at: sbUser.created_at || new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize session from Supabase on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setSupabaseUser(initialSession?.user || null);
          await syncBackendUser(initialSession, initialSession?.user || null);
        }
      } catch (err) {
        console.error('Error initializing Supabase session:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Subscribe to auth state changes (login, logout, token refreshed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setSupabaseUser(newSession?.user || null);
        await syncBackendUser(newSession, newSession?.user || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncBackendUser]);

  // Real Supabase login
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    setSession(data.session);
    setSupabaseUser(data.user);
    await syncBackendUser(data.session, data.user);
  };

  // Real Supabase registration
  const register = async (email: string, full_name: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          role: 'analyst',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if email confirmation is required by Supabase project settings
    const needsConfirmation = !data.session && Boolean(data.user && !data.user.confirmed_at);

    if (data.session) {
      setSession(data.session);
      setSupabaseUser(data.user);
      await syncBackendUser(data.session, data.user);
    }

    return { needsConfirmation };
  };

  // Real Supabase logout
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSupabaseUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

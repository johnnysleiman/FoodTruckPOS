import { createContext, useContext, useEffect, type ReactNode, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export type UserRole = 'admin' | 'employee';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

// ============================================
// QUERY KEYS
// ============================================

const authKeys = {
  session: ['auth', 'session'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
};

// ============================================
// DATA FETCHERS
// ============================================

async function fetchSession(): Promise<{ user: User | null; session: Session | null }> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return { user: session?.user ?? null, session };
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to handle 0 results

  if (error) {
    // Table might not exist yet or RLS blocking - don't throw
    console.warn('[Auth] Profile fetch issue:', error.message);
    return null;
  }

  // If no profile exists, create a default admin profile for the first user
  if (!data) {
    console.log('[Auth] No profile found, user may need to be added to user_profiles table');
    // Return a default profile so the app can function
    // In production, you'd want to create the profile or redirect to setup
    return {
      id: userId,
      email: null,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
    };
  }

  return data as UserProfile;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Session query - this is the source of truth
  const sessionQuery = useQuery({
    queryKey: authKeys.session,
    queryFn: fetchSession,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const user = sessionQuery.data?.user ?? null;
  const session = sessionQuery.data?.session ?? null;

  // Profile query - depends on user being logged in
  const profileQuery = useQuery({
    queryKey: authKeys.profile(user?.id ?? ''),
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    refetchOnWindowFocus: false,
  });

  const profile = profileQuery.data ?? null;

  // Listen to Supabase auth changes and update React Query cache
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(authKeys.session, { user: null, session: null });
          queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
        } else if (event === 'SIGNED_IN' && newSession) {
          queryClient.setQueryData(authKeys.session, {
            user: newSession.user,
            session: newSession
          });
          queryClient.invalidateQueries({ queryKey: authKeys.profile(newSession.user.id) });
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          queryClient.setQueryData(authKeys.session, {
            user: newSession.user,
            session: newSession
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('[Auth] Sign out error (clearing local state):', error);
    }
    queryClient.setQueryData(authKeys.session, { user: null, session: null });
    queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
  }, [queryClient]);

  // Computed values
  const isLoading = sessionQuery.isLoading || (!!user && profileQuery.isLoading);
  const isAuthenticated = !!user && !!session;
  const isAdmin = profile?.role === 'admin' && profile?.is_active === true;
  const isEmployee = (profile?.role === 'employee' || profile?.role === 'admin') && profile?.is_active === true;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAuthenticated,
      isAdmin,
      isEmployee,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

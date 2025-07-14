import React, { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthUser, UserRole } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await updateUserProfile(initialSession.user);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await updateUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateUserProfile = async (authUser: User) => {
    try {
      // Try to fetch user profile from our backend
      const profile = await fetchUserProfile(authUser.id);
      
      const userRole: UserRole = profile?.role as UserRole || 
                                 authUser.user_metadata?.role as UserRole || 
                                 'employee';
      
      setUser({ 
        id: authUser.id,
        email: authUser.email || '',
        role: userRole,
        firstName: profile?.first_name || authUser.user_metadata?.first_name || '',
        lastName: profile?.last_name || authUser.user_metadata?.last_name || ''
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic user with data from auth metadata
      setUser({ 
        id: authUser.id,
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as UserRole) || 'employee',
        firstName: authUser.user_metadata?.first_name || '',
        lastName: authUser.user_metadata?.last_name || ''
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Supabase sign in result:', { user: data.user?.email, error: error?.message });
      
      setLoading(false);
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
      return { error: err as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role: 'employee'
        }
      }
    });
    
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

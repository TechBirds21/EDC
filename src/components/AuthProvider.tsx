import React, { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthUser, UserRole } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';
import { demoUsers } from '@/services/demoUserService';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Mock user creation for demo accounts
const createMockSession = (email: string, role: UserRole): Session => {
  const mockUser: User = {
    id: `demo-${role}`,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { role },
    identities: [],
    confirmation_sent_at: null,
    email_confirmed_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    phone: null,
    phone_confirmed_at: null,
    recovery_sent_at: null,
    new_email: null,
    invited_at: null,
    action_link: null,
    email_change_sent_at: null,
    new_phone: null,
    deleted_at: null,
    is_sso_user: false,
    factors: null
  };

  return {
    access_token: `demo-token-${role}`,
    refresh_token: `demo-refresh-${role}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for demo session in localStorage first
        const demoSession = localStorage.getItem('demo_session');
        if (demoSession) {
          const parsedSession = JSON.parse(demoSession);
          const demoUser = demoUsers[parsedSession.user.email];
          if (demoUser && mounted) {
            setSession(parsedSession);
            setUser({
              ...parsedSession.user,
              role: demoUser.role
            } as AuthUser);
            setLoading(false);
            return;
          }
        }

        // Try to get real Supabase session
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
      // Check if this is a demo user
      const demoUser = demoUsers[authUser.email || ''];
      
      // Set user with role from demo user or try to fetch profile
      const userRole = demoUser?.role || 'employee';
      setUser({ 
        ...authUser, 
        role: userRole as UserRole
      } as AuthUser);

    } catch (error) {
      console.error('Error updating user profile:', error);
      // Fallback to basic user without profile
      setUser({ 
        ...authUser, 
        role: 'employee' as UserRole 
      } as AuthUser);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      
      // Check if this is a demo user
      const demoUser = demoUsers[email];
      if (demoUser && password === demoUser.password) {
        console.log('Demo user login detected');
        
        // Create mock session for demo user
        const mockSession = createMockSession(email, demoUser.role);
        
        // Store demo session in localStorage
        localStorage.setItem('demo_session', JSON.stringify(mockSession));
        
        // Set auth state
        setSession(mockSession);
        setUser({
          ...mockSession.user,
          role: demoUser.role
        } as AuthUser);
        
        setLoading(false);
        console.log('Demo login successful for role:', demoUser.role);
        return { error: null };
      }

      // Try regular Supabase auth for non-demo users
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
    
    // Clear demo session
    localStorage.removeItem('demo_session');
    
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

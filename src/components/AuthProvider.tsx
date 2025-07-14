import React, { useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthUser, UserRole } from '@/types/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simplified auth initialization - check localStorage for persisted session
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setSession({ user: userData });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simplified demo login - in production this would call your API
      console.log('Attempting sign in for:', email);
      
      // Demo users for testing
      const demoUsers: Record<string, { password: string; role: UserRole; first_name: string; last_name: string }> = {
        'admin@test.com': { password: 'admin123', role: 'admin', first_name: 'Admin', last_name: 'User' },
        'employee@test.com': { password: 'employee123', role: 'employee', first_name: 'Employee', last_name: 'User' },
        'super@test.com': { password: 'super123', role: 'super_admin', first_name: 'Super', last_name: 'Admin' }
      };

      const demoUser = demoUsers[email];
      if (demoUser && demoUser.password === password) {
        const userData: AuthUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          role: demoUser.role,
          profile: {
            id: Math.random().toString(36).substr(2, 9),
            email,
            first_name: demoUser.first_name,
            last_name: demoUser.last_name,
            role: demoUser.role,
            status: 'active'
          }
        };
        
        setUser(userData);
        setSession({ user: userData });
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        setLoading(false);
        return { error: null };
      } else {
        setLoading(false);
        return { error: { message: 'Invalid credentials' } };
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    // Simplified signup - in production this would call your API
    try {
      const userData: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: 'employee',
        profile: {
          id: Math.random().toString(36).substr(2, 9),
          email,
          first_name: '',
          last_name: '',
          role: 'employee',
          status: 'active'
        }
      };
      
      setUser(userData);
      setSession({ user: userData });
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setLoading(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth_user');
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

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
        const savedToken = localStorage.getItem('auth_token');
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setSession({ user: userData, access_token: savedToken });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      
      // Mock authentication with predefined test users
      const testUsers = {
        'employee@edc.com': { role: 'employee' as UserRole, firstName: 'John', lastName: 'Employee' },
        'admin@edc.com': { role: 'admin' as UserRole, firstName: 'Jane', lastName: 'Admin' },
        'superadmin@edc.com': { role: 'super_admin' as UserRole, firstName: 'Super', lastName: 'Admin' },
      };

      const testUser = testUsers[email as keyof typeof testUsers];
      
      if (testUser && password.length >= 6) {
        const userData: AuthUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          role: testUser.role,
          profile: {
            id: Math.random().toString(36).substr(2, 9),
            email,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            role: testUser.role,
            status: 'active'
          }
        };
        
        setUser(userData);
        setSession({ 
          user: userData, 
          access_token: 'mock_token_' + Math.random().toString(36).substr(2, 9)
        });
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', 'mock_token_' + Math.random().toString(36).substr(2, 9));
        
        setLoading(false);
        return { error: null };
      } else {
        setLoading(false);
        return { error: { message: 'Invalid credentials. Please use one of the test accounts.' } };
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simple validation
      if (password.length < 6) {
        setLoading(false);
        return { error: { message: 'Password must be at least 6 characters long' } };
      }

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
      localStorage.setItem('auth_token', 'mock_token_' + Math.random().toString(36).substr(2, 9));
      setLoading(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    // Simple logout - just clear local storage
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
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

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
      
      // Call the backend API for authentication
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const userData: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role as UserRole,
          profile: {
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.name.split(' ')[0] || '',
            last_name: data.user.name.split(' ')[1] || '',
            role: data.user.role as UserRole,
            status: 'active'
          }
        };
        
        setUser(userData);
        setSession({ 
          user: userData, 
          access_token: data.access_token 
        });
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', data.access_token);
        
        setLoading(false);
        return { error: null };
      } else {
        const errorData = await response.json();
        setLoading(false);
        return { error: { message: errorData.detail || 'Login failed' } };
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
      return { error: { message: 'Network error. Please try again.' } };
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
    
    try {
      // Call the backend logout endpoint
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
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

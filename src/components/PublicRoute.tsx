
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    // Redirect to correct dashboard based on role
    const dashboardRoute = user.role === 'super_admin' ? '/superadmin' : 
                          user.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

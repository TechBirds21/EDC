
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles = [],
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // Redirect authenticated users to their dashboard based on role
    const dashboardRoute = user.role === 'super_admin' ? '/superadmin' : 
                          user.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={dashboardRoute} replace />;
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = user.role === 'super_admin' ? '/superadmin' : 
                          user.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

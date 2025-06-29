import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { useAuth } from '@/contexts/AuthContext';
import { VolunteerProvider } from '@/context/VolunteerContext';
import { GlobalFormProvider } from '@/context/GlobalFormContext';
import RequireRole from '@/components/RequireRole';
import { Toaster } from '@/components/ui/toaster';

// Page imports
import LoginPage from '@/pages/LoginPage';
import FormExample from '@/pages/FormExample';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLayout from '@/components/layouts/AdminLayout';

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboard';
import VolunteersPage from '@/pages/admin/VolunteersPage';
import FormsPage from '@/pages/admin/FormsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import TemplatesPage from '@/pages/admin/TemplatesPage';
import UsersPage from '@/pages/admin/UsersPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import ClientsPage from '@/pages/admin/ClientsPage';
import AuditLogsPage from '@/pages/admin/AuditLogsPage';

import AdminEmployeesPage from '@/pages/AdminEmployeesPage';
import AdminFormBuilderPage from '@/pages/AdminFormBuilderPage';
import AdminReportsPage from '@/pages/AdminReportsPage';
import AdminAuditLogPage from '@/pages/AdminAuditLogPage';
import FormDataCollectionPage from '@/pages/FormDataCollectionPage';
import AdminPrintPage from '@/pages/AdminPrintPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SuperAdminClientsPage from '@/pages/SuperAdminClientsPage';
import SuperAdminGlobalTemplatesPage from '@/pages/SuperAdminGlobalTemplatesPage';
import SuperAdminUserManagementPage from '@/pages/SuperAdminUserManagementPage';
import EmployeeProjectsPage from '@/pages/EmployeeProjectsPage';
import ProjectDashboardLayout from '@/pages/ProjectDashboardLayout';
import NewClaimPage from '@/pages/NewClaimPage';

// Role guard component
const RoleGuard = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = user.role === 'super_admin' ? '/superadmin' : 
                          user.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

// Root redirect component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Navigate to appropriate dashboard based on role
  const dashboardRoute = user.role === 'super_admin' ? '/superadmin' : 
                        user.role === 'admin' ? '/admin' : '/employee';
  return <Navigate to={dashboardRoute} replace />;
};

// Public route wrapper for login page
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    // Redirect authenticated users to their dashboard
    const dashboardRoute = user.role === 'super_admin' ? '/superadmin' : 
                          user.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <GlobalFormProvider>
        <VolunteerProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />

              {/* Form Example Route */}
              <Route path="/form-example" element={<FormExample />} />

              {/* Super Admin Routes */}
              <Route path="/superadmin/*" element={
                <RoleGuard allowedRoles={['super_admin']}>
                  <Outlet />
                </RoleGuard>
              }>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="clients" element={<SuperAdminClientsPage />} />
                <Route path="templates" element={<SuperAdminGlobalTemplatesPage />} />
                <Route path="audit-logs" element={<AdminAuditLogPage />} />
                <Route path="users" element={<SuperAdminUserManagementPage />} />
              </Route>

              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <RequireRole role={['admin', 'super_admin']}>
                    <AdminLayout />
                  </RequireRole>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="volunteers" element={<VolunteersPage />} />
                <Route path="forms" element={<FormsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="templates/new" element={<AdminFormBuilderPage />} />
                <Route path="templates/edit/:id" element={<AdminFormBuilderPage />} />
                
                {/* Super Admin Only Routes */}
                <Route path="users" element={<UsersPage />} /> 
                <Route path="settings" element={<SettingsPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                
                {/* Legacy routes */}
                <Route path="employees" element={<AdminEmployeesPage />} />
                <Route path="form-builder" element={<AdminFormBuilderPage />} />
                <Route path="form-data/:caseId" element={<FormDataCollectionPage />} />
                <Route path="print" element={<AdminPrintPage />} />
              </Route>
              
              {/* Employee Routes */}
              <Route path="/employee/*" element={
                <RoleGuard allowedRoles={['employee', 'admin', 'super_admin']}>
                  <Outlet />
                </RoleGuard>
              }>
                <Route index element={<EmployeeDashboard />} />
                <Route path="projects" element={<EmployeeProjectsPage />} />
                
                {/* New Claim Route - Outside of ProjectDashboardLayout */}
                <Route path="project/:pid/new-claim" element={<NewClaimPage />} />
                
                {/* Project Dashboard Routes */}
                <Route path="project/:pid/*" element={<ProjectDashboardLayout />} />
              </Route>

              {/* Default Route - Auto navigation based on role */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <Toaster />
          </Router>
        </VolunteerProvider>
      </GlobalFormProvider>
    </AuthProvider>
  );
}

export default App;

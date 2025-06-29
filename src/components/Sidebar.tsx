
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  FolderOpen,
  PenTool,
  ChevronLeft,
  ChevronRight,
  History,
  Printer,
  Eye,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const linksByRole = {
  employee: [
    { to: '/employee', label: 'My Dashboard', icon: Home },
    { to: '/employee/projects', label: 'My Projects', icon: FolderOpen },
  ],
  admin: [
    { to: '/admin', label: 'Admin Dashboard', icon: Home },
    { to: '/admin/employees', label: 'Manage Employees', icon: Users },
    { to: '/admin/form-builder', label: 'Form Builder', icon: PenTool },
    { to: '/admin/reports', label: 'View Reports', icon: Eye },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: History },
    { to: '/admin/print', label: 'Print Forms', icon: Printer },
  ],
  super_admin: [
    { to: '/superadmin', label: 'System Overview', icon: Home },
    { to: '/superadmin/clients', label: 'Client Management', icon: Building },
    { to: '/superadmin/templates', label: 'Global Templates', icon: FileText },
    { to: '/superadmin/audit-logs', label: 'Audit Logs', icon: History },
    { to: '/superadmin/users', label: 'User Management', icon: Users },
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleLinks = linksByRole[user.role as keyof typeof linksByRole] || [];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">Clinical CRF</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {roleLinks.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">{user.email || 'Unknown User'}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role ? user.role.replace('_', ' ') : 'user'}
              </p>
              <button
                onClick={signOut}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

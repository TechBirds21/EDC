
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Home,
  Building2,
  Shield,
  UserCircle,
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { VolunteerInfo } from '@/components/VolunteerInfo';
import { useVolunteer } from '@/context/VolunteerContext';

const AdminLayout = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { volunteerData } = useVolunteer();

  const navigationItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
    { href: '/admin/forms', label: 'Forms', icon: FileText },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/templates', label: 'Templates', icon: FileText },
  ];

  // Super Admin only items
  const superAdminItems = [
    { href: '/admin/users', label: 'Users', icon: UserCircle },
    { href: '/admin/clients', label: 'Clients', icon: Building2 },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const allItems = user?.role === 'super_admin' 
    ? [...navigationItems, ...superAdminItems]
    : navigationItems;

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-6 border-b">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {allItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2 mb-4">
          <UserCircle className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {volunteerData && (
          <div className="px-6 pt-4">
            <VolunteerInfo 
              volunteerId={volunteerData.volunteerId}
              studyNumber={volunteerData.studyNumber}
            />
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

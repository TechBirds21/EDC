import React from 'react';
import { LogOut, User, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role) {
      case 'super_admin':
        return <Shield className="w-3 h-3" />;
      case 'admin':
        return <UserCheck className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRoleDisplayName = (role?: string) => {
    if (!role) return 'user';
    return role.replace('_', ' ');
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">
            {user.role === 'super_admin' && 'System Administration'}
            {user.role === 'admin' && 'Administration Dashboard'}
            {user.role === 'employee' && 'Data Collection'}
            {!user.role && 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className={`${getRoleColor()} border`}>
            {getRoleIcon()}
            <span className="ml-1 capitalize">{getRoleDisplayName(user.role)}</span>
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.email || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

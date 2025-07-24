
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVolunteer } from '@/context/VolunteerContext';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VolunteerSearchForm from '@/components/VolunteerSearchForm';
import { UserRole } from '@/types/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { clearVolunteerData } = useVolunteer();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-defined test users based on role
  const testUsers = {
    employee: { email: 'employee@edc.com', role: 'employee' as UserRole },
    admin: { email: 'admin@edc.com', role: 'admin' as UserRole },
    super_admin: { email: 'superadmin@edc.com', role: 'super_admin' as UserRole },
  };

  // Clear volunteer data when starting fresh
  React.useEffect(() => {
    clearVolunteerData();
  }, [clearVolunteerData]);

  // Update email when role is selected
  React.useEffect(() => {
    if (selectedRole && testUsers[selectedRole]) {
      setEmail(testUsers[selectedRole].email);
    }
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log(`Attempting ${isSignUpMode ? 'sign up' : 'sign in'} for:`, email);
      
      const result = isSignUpMode ? await signUp(email, password) : await signIn(email, password);
      
      if (result.error) {
        console.error('Auth error:', result.error);
        setError(result.error.message || `${isSignUpMode ? 'Registration' : 'Authentication'} failed. Please check your credentials.`);
      } else {
        console.log('Authentication successful, proceeding to volunteer search...');
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Auth exception:', err);
      setError(`${isSignUpMode ? 'Registration' : 'Authentication'} failed. Please check your credentials.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerSearchSuccess = () => {
    console.log('Volunteer search successful, navigating to dashboard...');
    // Small delay to ensure state is updated
    setTimeout(() => {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }, 100);
  };

  // Show volunteer search form if user is authenticated but no volunteer data
  if (isAuthenticated && user) {
    return (
      <AuthLayout>
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome, {user.email}</h2>
            <p className="text-muted-foreground">Please search for or register a volunteer to continue</p>
          </div>
          
          <VolunteerSearchForm onSuccess={handleVolunteerSearchSuccess} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {isSignUpMode ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-muted-foreground">
            {isSignUpMode 
              ? 'Create a new account to access the clinical data capture system'
              : 'Access your clinical data capture account'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Your Role</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={!isSignUpMode} // Auto-populate based on role for sign in
            />
            {!isSignUpMode && (
              <p className="text-xs text-muted-foreground">Email is auto-populated based on selected role</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
            {isSignUpMode && (
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            )}
            {!isSignUpMode && (
              <p className="text-xs text-muted-foreground">For test users, any password will work</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 
              (isSignUpMode ? 'Creating Account...' : 'Signing In...') : 
              (isSignUpMode ? 'Create Account' : 'Sign In')
            }
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setError('');
            }}
            className="text-sm"
          >
            {isSignUpMode 
              ? 'Already have an account? Sign in' 
              : 'Need an account? Sign up'
            }
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>Available test accounts:</p>
          <div className="grid grid-cols-1 gap-1 text-left bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <p><strong>Employee:</strong> employee@edc.com</p>
            <p><strong>Admin:</strong> admin@edc.com</p>
            <p><strong>Super Admin:</strong> superadmin@edc.com</p>
          </div>
          <p>Select your role above to auto-fill the email address</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

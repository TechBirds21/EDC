
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVolunteer } from '@/context/VolunteerContext';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VolunteerSearchForm from '@/components/VolunteerSearchForm';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { clearVolunteerData } = useVolunteer();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear volunteer data when starting fresh
  React.useEffect(() => {
    clearVolunteerData();
  }, [clearVolunteerData]);

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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
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

        <div className="text-center text-xs text-muted-foreground">
          <p>For system access, please contact your administrator</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent, isSignUp = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log(`Attempting ${isSignUp ? 'sign up' : 'sign in'} for:`, email);
      
      const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
      
      if (result.error) {
        console.error('Auth error:', result.error);
        setError(result.error.message || 'Authentication failed. Please check your credentials.');
      } else {
        console.log('Authentication successful, navigating...');
        // Small delay to ensure state is updated
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('Auth exception:', err);
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Demo login attempt for:', demoEmail);
      
      const result = await signIn(demoEmail, demoPassword);
      if (result.error) {
        console.error('Demo login error:', result.error);
        setError(result.error.message || 'Demo login failed. Please try again.');
      } else {
        console.log('Demo login successful');
        // Small delay to ensure state is updated, then navigate
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('Demo login exception:', err);
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demo">
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-4">
              Click any demo account to login instantly
            </div>
            
            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors" 
              onClick={() => !loading && handleDemoLogin('employee@demo.com', 'demo123')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Employee Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Email: employee@demo.com</p>
                <p className="text-sm text-muted-foreground">Password: demo123</p>
                <p className="text-sm text-muted-foreground">Role: Employee</p>
                <p className="text-sm text-blue-600 mt-2">Click to login as Employee</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors" 
              onClick={() => !loading && handleDemoLogin('admin@demo.com', 'demo123')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Admin Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Email: admin@demo.com</p>
                <p className="text-sm text-muted-foreground">Password: demo123</p>
                <p className="text-sm text-muted-foreground">Role: Admin</p>
                <p className="text-sm text-blue-600 mt-2">Click to login as Admin</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors" 
              onClick={() => !loading && handleDemoLogin('superadmin@demo.com', 'demo123')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Super Admin Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Email: superadmin@demo.com</p>
                <p className="text-sm text-muted-foreground">Password: demo123</p>
                <p className="text-sm text-muted-foreground">Role: Super Admin</p>
                <p className="text-sm text-blue-600 mt-2">Click to login as Super Admin</p>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="signin">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default LoginPage;

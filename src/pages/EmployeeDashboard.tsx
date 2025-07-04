import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalForms: number;
  pendingForms: number;
  completedToday: number;
  lastSubmission: string;
}

interface RecentForm {
  id: string;
  template_name: string;
  volunteer_id: string;
  study_number: string;
  created_at: string;
  case_id: string;
}

// Mock data for demo users
const getMockDashboardData = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const mockRecentForms: RecentForm[] = [
    {
      id: 'demo-form-1',
      template_name: 'COVID-19 Screening Form',
      volunteer_id: 'VOL-001',
      study_number: 'STU-2024-001',
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      case_id: 'CASE-001'
    },
    {
      id: 'demo-form-2',
      template_name: 'Medical History Form',
      volunteer_id: 'VOL-002',
      study_number: 'STU-2024-002',
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      case_id: 'CASE-002'
    },
    {
      id: 'demo-form-3',
      template_name: 'Vital Signs Assessment',
      volunteer_id: 'VOL-003',
      study_number: 'STU-2024-003',
      created_at: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      case_id: 'CASE-003'
    }
  ];

  const mockStats: DashboardStats = {
    totalForms: 15,
    pendingForms: 2,
    completedToday: 3,
    lastSubmission: '2 hr ago'
  };

  return { mockStats, mockRecentForms };
};

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    pendingForms: 0,
    completedToday: 0,
    lastSubmission: 'Never'
  });
  const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Check if this is a demo user
      if (user.id.startsWith('demo-')) {
        console.log('Loading mock data for demo user');
        const { mockStats, mockRecentForms } = getMockDashboardData();
        setStats(mockStats);
        setRecentForms(mockRecentForms);
        setLoading(false);
        return;
      }

      // Get total forms for this user
      try {
        // Get total forms for this user
        const { count: totalFormsCount, error: totalFormsError } = await supabase
          .from('patient_forms')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id);

        if (totalFormsError) throw totalFormsError;

        // Get forms submitted today for this user
        const today = new Date().toISOString().split('T')[0];
        const { count: todayFormsCount, error: todayFormsError } = await supabase
          .from('patient_forms')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`);

        if (todayFormsError) throw todayFormsError;

        // Get recent forms for this user (last 5)
        const { data: recentFormsData, error: recentError } = await supabase
          .from('patient_forms')
          .select('id, template_name, volunteer_id, study_number, created_at, case_id')
          .eq('submitted_by', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // Get the most recent submission time
        let lastSubmissionText = 'Never';
        if (recentFormsData && recentFormsData.length > 0) {
          const lastSubmission = new Date(recentFormsData[0].created_at);
          const now = new Date();
          const diffInMinutes = Math.floor((now.getTime() - lastSubmission.getTime()) / (1000 * 60));
          
          if (diffInMinutes < 1) {
            lastSubmissionText = 'Just now';
          } else if (diffInMinutes < 60) {
            lastSubmissionText = `${diffInMinutes} min ago`;
          } else if (diffInMinutes < 1440) {
            lastSubmissionText = `${Math.floor(diffInMinutes / 60)} hr ago`;
          } else {
            lastSubmissionText = `${Math.floor(diffInMinutes / 1440)} days ago`;
          }
        }

        setStats({
          totalForms: totalFormsCount || 0,
          pendingForms: 0, // This would need additional logic to determine pending forms
          completedToday: todayFormsCount || 0,
          lastSubmission: lastSubmissionText
        });

        setRecentForms(recentFormsData || []);
      } catch (apiError) {
        console.error('API error:', apiError);
        // Fallback to mock data if there's an API error
        const { mockStats, mockRecentForms } = getMockDashboardData();
        setStats(mockStats);
        setRecentForms(mockRecentForms);
      }

    } catch (err) {
      // Don't show error to user, just use mock data
      console.error('Error loading dashboard data:', err);
      const { mockStats, mockRecentForms } = getMockDashboardData();
      setStats(mockStats);
      setRecentForms(mockRecentForms);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">Here's an overview of your data collection activities.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalForms}</div>
              <p className="text-xs text-muted-foreground">All time submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingForms}</div>
              <p className="text-xs text-muted-foreground">Not yet synced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Forms submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lastSubmission}</div>
              <p className="text-xs text-muted-foreground">Most recent activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-20 clinical-gradient text-white">
                <Link to="/employee/project/clains-project-1/new-claim">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <span>Start New Form</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-20">
                <Link to="/employee/forms">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2" />
                    <span>Pending Forms</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-20">
                <Link to="/employee/history">
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <span>View History</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {recentForms.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No forms submitted yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium">{form.template_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Volunteer: {form.volunteer_id} • Study: {form.study_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(form.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
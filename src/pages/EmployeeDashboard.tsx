import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, UserCheck, Calendar, Edit, Play, Search } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useVolunteer } from '@/context/VolunteerContext';
import { adminApiService } from '@/services/adminApiService';

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
  status: 'draft' | 'submitted' | 'pending';
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
      case_id: 'CASE-001',
      status: 'submitted'
    },
    {
      id: 'demo-form-2',
      template_name: 'Medical History Form',
      volunteer_id: 'VOL-002',
      study_number: 'STU-2024-002',
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      case_id: 'CASE-002',
      status: 'draft'
    },
    {
      id: 'demo-form-3',
      template_name: 'Demographic Details',
      volunteer_id: 'VOL-003',
      study_number: 'STU-2024-003',
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      case_id: 'CASE-003',
      status: 'submitted'
    },
    {
      id: 'demo-form-4',
      template_name: 'Vital Signs',
      volunteer_id: 'VOL-004',
      study_number: 'STU-2024-004',
      created_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      case_id: 'CASE-004',
      status: 'pending'
    },
    {
      id: 'demo-form-5',
      template_name: 'Subject Check-in',
      volunteer_id: 'VOL-005',
      study_number: 'STU-2024-005',
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      case_id: 'CASE-005',
      status: 'submitted'
    },
    {
      id: 'demo-form-6',
      template_name: 'ECG Evaluation',
      volunteer_id: 'VOL-006',
      study_number: 'STU-2024-006',
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      case_id: 'CASE-006',
      status: 'draft'
    }
  ];

  const mockStats: DashboardStats = {
    totalForms: mockRecentForms.length,
    pendingForms: mockRecentForms.filter(f => f.status === 'draft' || f.status === 'pending').length,
    completedToday: mockRecentForms.filter(f => {
      const formDate = new Date(f.created_at);
      return formDate >= today && f.status === 'submitted';
    }).length,
    lastSubmission: mockRecentForms.length > 0 ? 
      new Date(Math.max(...mockRecentForms.map(f => new Date(f.created_at).getTime()))).toLocaleDateString() : 
      'Never'
  };

  return { mockStats, mockRecentForms };
};

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { volunteerData } = useVolunteer();
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    pendingForms: 0,
    completedToday: 0,
    lastSubmission: 'Never'
  });
  const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && volunteerData) {
      loadDashboardData();
    }
  }, [user, volunteerData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user || !volunteerData) return;

      // Check if this is a demo user
      if (user.id.startsWith('demo-')) {
        console.log('Loading mock data for demo user with volunteer:', volunteerData);
        const { mockStats, mockRecentForms } = getMockDashboardData();
        setStats(mockStats);
        setRecentForms(mockRecentForms);
        setLoading(false);
        return;
      }

      // Try to get real data from API for the current volunteer
      try {
        const formsResponse = await adminApiService.getForms({
          volunteer_id: volunteerData.volunteerId,
          page: 1,
          size: 50
        });

        const forms = formsResponse.items || [];
        const totalForms = forms.length;
        const submittedForms = forms.filter(f => f.status === 'submitted');
        const today = new Date().toISOString().split('T')[0];
        const todayForms = forms.filter(f => f.created_at.startsWith(today));

        // Calculate stats
        const calculatedStats: DashboardStats = {
          totalForms,
          pendingForms: forms.filter(f => f.status === 'draft').length,
          completedToday: todayForms.length,
          lastSubmission: forms.length > 0 ? 
            new Date(forms[0].created_at).toLocaleString() : 'Never'
        };

        // Transform forms to recent forms format
        const recentFormsData: RecentForm[] = forms.slice(0, 5).map(form => ({
          id: form.id,
          template_name: form.template_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          volunteer_id: volunteerData.volunteerId,
          study_number: volunteerData.studyNumber,
          created_at: form.created_at,
          case_id: `CASE-${form.id.slice(-4)}`
        }));

        setStats(calculatedStats);
        setRecentForms(recentFormsData);

        console.log('Dashboard data loaded from API:', { calculatedStats, recentFormsData });

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
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredForms = recentForms.filter(form => 
    form.volunteer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.study_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.case_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Volunteer Status Card */}
        {volunteerData && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span>Current Volunteer Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ID: {volunteerData.volunteerId}
                  </Badge>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    Study: {volunteerData.studyNumber}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Screening: {volunteerData.screeningDate ? 
                      new Date(volunteerData.screeningDate).toLocaleDateString() : 
                      'Not set'
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Session active since login
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Records Table - Requirement 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Records</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No records match your search' : 'No records available'}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer ID</TableHead>
                      <TableHead>Study Number</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Form Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.map((form) => (
                      <TableRow key={form.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{form.volunteer_id}</TableCell>
                        <TableCell>{form.study_number}</TableCell>
                        <TableCell>{form.case_id}</TableCell>
                        <TableCell>{form.template_name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(form.status)}>
                            {form.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(form.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {form.status === 'draft' ? (
                              <Button size="sm" asChild>
                                <Link to={`/employee/project/clains-project-1/forms/${form.case_id}`}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Continue
                                </Link>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/employee/project/clains-project-1/forms/${form.case_id}/view`}>
                                  <FileText className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            )}
                            {form.status !== 'submitted' && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/employee/project/clains-project-1/forms/${form.case_id}/edit`}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentForms.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {recentForms.slice(0, 3).map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        form.status === 'submitted' ? 'bg-green-500' : 
                        form.status === 'draft' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <p className="font-medium">{form.template_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Volunteer: {form.volunteer_id} • Study: {form.study_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(form.status)}>
                        {form.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(form.created_at)}</p>
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
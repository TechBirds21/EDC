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
      setError(null);
      
      if (!user || !volunteerData) {
        setLoading(false);
        return;
      }

      // Always try to get real data from API for any user
      try {
        const formsResponse = await adminApiService.getForms({
          volunteer_id: volunteerData.volunteerId,
          page: 1,
          size: 50
        });

        if (formsResponse?.data) {
          const forms: RecentForm[] = formsResponse.data.map((form: any) => ({
            id: form.id,
            template_name: form.template_name || 'Unknown Form',
            volunteer_id: form.volunteer_id,
            study_number: form.study_number,
            created_at: form.created_at,
            case_id: form.case_id || `CASE-${form.id.slice(0, 8)}`,
            status: form.status
          }));

          setRecentForms(forms);

          // Calculate stats from real data
          const today = new Date().toDateString();
          const completedToday = forms.filter(f => 
            new Date(f.created_at).toDateString() === today && f.status === 'submitted'
          ).length;

          const stats: DashboardStats = {
            totalForms: forms.length,
            pendingForms: forms.filter(f => f.status === 'draft' || f.status === 'pending').length,
            completedToday,
            lastSubmission: forms.length > 0 ? 
              new Date(Math.max(...forms.map(f => new Date(f.created_at).getTime()))).toLocaleDateString() : 
              'Never'
          };

          setStats(stats);
        } else {
          // No data found - show empty state
          setRecentForms([]);
          setStats({
            totalForms: 0,
            pendingForms: 0,
            completedToday: 0,
            lastSubmission: 'Never'
          });
        }
      } catch (apiError) {
        console.warn('Failed to load real data from API:', apiError);
        // Show empty state instead of falling back to demo data
        setRecentForms([]);
        setStats({
          totalForms: 0,
          pendingForms: 0,
          completedToday: 0,
          lastSubmission: 'Never'
        });
        setError('Unable to load dashboard data. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
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
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
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
              <div className="text-2xl font-bold">{stats.pendingForms}</div>
              <p className="text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Forms submitted today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lastSubmission === 'Never' ? 'None' : stats.lastSubmission}</div>
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
                <Link to="/employee/projects">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <span>Browse Projects</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-20">
                <Link to="/employee/projects">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2" />
                    <span>My Projects</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-20" disabled={recentForms.length === 0}>
                <Link to="/employee/forms">
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <span>View History</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records Table - Always show UI, even if no data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Records</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View all your project records, volunteer data, and form submissions
                </p>
              </div>
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
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">
                  {recentForms.length === 0 ? "No records found" : "No matching records"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {recentForms.length === 0 
                    ? "You don't have any form records yet. Once you start working on projects and filling forms, they will appear here."
                    : searchTerm 
                      ? `No records match your search "${searchTerm}". Try adjusting your search terms.`
                      : "No records match the current filters."
                  }
                </p>
                {recentForms.length === 0 && (
                  <div className="mt-6">
                    <Link to="/employee/projects">
                      <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Browse Available Projects
                      </Button>
                    </Link>
                  </div>
                )}
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
                                <Link to={`/employee/projects`}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Continue
                                </Link>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/employee/projects`}>
                                  <FileText className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            )}
                            {form.status !== 'submitted' && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/employee/projects`}>
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
            <p className="text-sm text-muted-foreground">Your most recent form submissions and updates</p>
          </CardHeader>
          <CardContent>
            {recentForms.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <h3 className="mt-4 text-base font-medium">No recent activity</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your recent form activities will appear here once you start working on projects.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentForms.slice(0, 3).map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        form.status === 'submitted' ? 'bg-green-500' : 
                        form.status === 'draft' ? 'bg-yellow-500' : 
                        form.status === 'pending' ? 'bg-orange-500' :
                        'bg-gray-500'
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
                {recentForms.length > 3 && (
                  <div className="text-center pt-4">
                    <Link to="/employee/projects">
                      <Button variant="outline" size="sm">
                        View All Activity
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
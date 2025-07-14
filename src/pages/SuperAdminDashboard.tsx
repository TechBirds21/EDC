import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, FolderOpen, FileText, Activity, Plus, Settings, Shield, ArrowLeft, Eye, History, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApiService } from '@/services/adminApiService';

interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  data: any[];
}

const SuperAdminDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load real data from our backend API
      try {
        const [clientsData, projectsData, templatesData, employeesData] = await Promise.all([
          adminApiService.getClients?.() || Promise.resolve({ data: [] }),
          adminApiService.getProjects?.() || Promise.resolve({ data: [] }),
          adminApiService.getFormTemplates?.() || Promise.resolve({ data: [] }),
          adminApiService.getUsers?.() || Promise.resolve({ data: [] })
        ]);

        const newMetrics: DashboardMetric[] = [
          {
            id: 'clients',
            title: 'Active Clients',
            value: (clientsData?.data?.filter((c: any) => c.status === 'active').length || 0).toString(),
            icon: Users,
            color: 'text-blue-600',
            data: clientsData?.data?.map((client: any) => ({
              name: client.name || 'Unknown',
              status: client.status || 'unknown',
              email: client.contact_email || 'N/A',
              created: client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'
            })) || []
          },
          {
            id: 'projects',
            title: 'Total Projects',
            value: (projectsData?.data?.length || 0).toString(),
            icon: FolderOpen,
            color: 'text-green-600',
            data: projectsData?.data?.map((project: any) => ({
              name: project.name || 'Unknown',
              client: project.client_name || 'No Client',
              status: project.status || 'unknown',
              created: project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'
            })) || []
          },
          {
            id: 'templates',
            title: 'Form Templates',
            value: (templatesData?.data?.length || 0).toString(),
            icon: FileText,
            color: 'text-purple-600',
            data: templatesData?.data?.map((template: any) => ({
              name: template.name || 'Unknown',
              version: template.version ? `v${template.version}` : 'v1',
              active: template.is_active ? 'Active' : 'Inactive',
              created: template.created_at ? new Date(template.created_at).toLocaleDateString() : 'N/A'
            })) || []
          },
          {
            id: 'employees',
            title: 'Total Employees',
            value: (employeesData?.data?.length || 0).toString(),
            icon: Shield,
            color: 'text-orange-600',
            data: employeesData?.data?.map((employee: any) => ({
              name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown',
              email: employee.email || 'N/A',
              role: employee.role || 'employee',
              status: employee.status || 'unknown'
            })) || []
          }
        ];

        setMetrics(newMetrics);
      } catch (apiError) {
        console.warn('Failed to load real data from API:', apiError);
        // Show empty state instead of mock data
        const emptyMetrics: DashboardMetric[] = [
          {
            id: 'clients',
            title: 'Active Clients',
            value: '0',
            icon: Users,
            color: 'text-blue-600',
            data: []
          },
          {
            id: 'projects',
            title: 'Total Projects',
            value: '0',
            icon: FolderOpen,
            color: 'text-green-600',
            data: []
          },
          {
            id: 'templates',
            title: 'Form Templates',
            value: '0',
            icon: FileText,
            color: 'text-purple-600',
            data: []
          },
          {
            id: 'employees',
            title: 'Total Employees',
            value: '0',
            icon: Shield,
            color: 'text-orange-600',
            data: []
          }
        ];
        setMetrics(emptyMetrics);
        setError('Unable to load dashboard data. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricClick = (metricId: string) => {
    setSelectedMetric(selectedMetric === metricId ? null : metricId);
  };

  const selectedMetricData = metrics.find(m => m.id === selectedMetric);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Loading system overview...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide overview and management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate('/superadmin/clients')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Plus className="w-6 h-6" />
            <span>Add Client</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/superadmin/templates')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <FileText className="w-6 h-6" />
            <span>Templates</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/superadmin/users')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Users className="w-6 h-6" />
            <span>Manage Users</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/superadmin/audit-logs')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <History className="w-6 h-6" />
            <span>Audit Logs</span>
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.id;
            return (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleMetricClick(metric.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <Eye className="h-3 w-3 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {metric.data.length > 0 ? 'Click to view details' : 'No data available'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Metric Details */}
        {selectedMetricData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedMetricData.icon className={`h-5 w-5 ${selectedMetricData.color}`} />
                {selectedMetricData.title} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMetricData.data.length === 0 ? (
                <div className="text-center py-8">
                  <selectedMetricData.icon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No {selectedMetricData.title.toLowerCase()} found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedMetricData.id === 'clients' && "No clients have been added to the system yet."}
                    {selectedMetricData.id === 'projects' && "No projects have been created yet."}
                    {selectedMetricData.id === 'templates' && "No form templates have been created yet."}
                    {selectedMetricData.id === 'employees' && "No employees have been added to the system yet."}
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={() => {
                        if (selectedMetricData.id === 'clients') navigate('/superadmin/clients');
                        else if (selectedMetricData.id === 'projects') navigate('/admin/clients');
                        else if (selectedMetricData.id === 'templates') navigate('/superadmin/templates');
                        else if (selectedMetricData.id === 'employees') navigate('/superadmin/users');
                      }}
                    >
                      Add {selectedMetricData.title.includes('Total') ? selectedMetricData.title.replace('Total ', '') : selectedMetricData.title}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMetricData.data.slice(0, 10).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        {Object.entries(item).slice(0, 4).map(([key, value]: [string, any]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="text-gray-600">{value || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {selectedMetricData.data.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... and {selectedMetricData.data.length - 10} more items
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-muted-foreground">Database</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-muted-foreground">API Server</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-sm text-muted-foreground">System Health</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;

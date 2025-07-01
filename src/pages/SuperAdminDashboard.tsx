import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, FileText, Activity, Plus, Settings, Shield, ArrowLeft, Eye, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SuperAdminDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    clients: [],
    projects: [],
    templates: [],
    employees: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load clients
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      // Load projects
      const { data: projects } = await supabase
        .from('projects_enhanced')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });

      // Load templates
      const { data: templates } = await supabase
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false });

      // Load employees
      const { data: employees } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setDashboardData({
        clients: clients || [],
        projects: projects || [],
        templates: templates || [],
        employees: employees || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      id: 'clients',
      title: 'Active Clients',
      value: dashboardData.clients.filter((c: any) => c.status === 'active').length.toString(),
      icon: Users,
      color: 'text-blue-600',
      data: dashboardData.clients.map((client: any) => ({
        name: client.name,
        status: client.status,
        email: client.contact_email,
        created: new Date(client.created_at).toLocaleDateString()
      }))
    },
    {
      id: 'projects',
      title: 'Total Projects',
      value: dashboardData.projects.length.toString(),
      icon: FolderOpen,
      color: 'text-green-600',
      data: dashboardData.projects.map((project: any) => ({
        name: project.name,
        client: project.clients?.name || 'No Client',
        status: project.status,
        created: new Date(project.created_at).toLocaleDateString()
      }))
    },
    {
      id: 'templates',
      title: 'Form Templates',
      value: dashboardData.templates.length.toString(),
      icon: FileText,
      color: 'text-purple-600',
      data: dashboardData.templates.map((template: any) => ({
        name: template.name,
        version: `v${template.version}`,
        active: template.is_active ? 'Yes' : 'No',
        created: new Date(template.created_at).toLocaleDateString()
      }))
    },
    {
      id: 'employees',
      title: 'System Users',
      value: dashboardData.employees.length.toString(),
      icon: Activity,
      color: 'text-emerald-600',
      data: dashboardData.employees.map((employee: any) => ({
        name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email,
        role: employee.role,
        status: employee.status || 'active',
        lastLogin: employee.last_login ? new Date(employee.last_login).toLocaleDateString() : 'Never'
      }))
    }
  ];

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Create a new client account',
      icon: Plus,
      action: () => navigate('/superadmin/clients')
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: Settings,
      action: () => console.log('Navigate to system settings')
    },
    {
      title: 'Security Review',
      description: 'Review security and audit logs',
      icon: History,
      action: () => navigate('/superadmin/audit-logs')
    }
  ];

  const handleMetricClick = (metricId: string) => {
    setSelectedMetric(selectedMetric === metricId ? null : metricId);
  };

  const selectedMetricData = metrics.find(m => m.id === selectedMetric);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
            <p className="text-muted-foreground">Global system metrics and administration</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
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
                  <p className="text-xs text-gray-500 mt-1">Click to view details</p>
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
              <div className="space-y-3">
                {selectedMetricData.data.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      {Object.entries(item).map(([key, value]: [string, any]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={action.action}>
                        Go
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Cluster</span>
                  <span className="text-xs text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Load Balancer</span>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Backup Systems</span>
                  <span className="text-xs text-green-600 font-medium">Synchronized</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Security Monitoring</span>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Form Builder Service</span>
                  <span className="text-xs text-green-600 font-medium">Running</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Report Generation</span>
                  <span className="text-xs text-green-600 font-medium">Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.clients.slice(0, 3).map((client: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">New client "{client.name}" added</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {dashboardData.templates.slice(0, 2).map((template: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">Form template "{template.name}" created</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;

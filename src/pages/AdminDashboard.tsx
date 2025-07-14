
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, FileText, Calendar, AlertTriangle, ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApiService } from '@/services/adminApiService';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  data: any[];
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
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

      // Try to load real data from API
      try {
        const [employeesData, formsData, todayFormsData, flaggedFormsData] = await Promise.all([
          adminApiService.getUsers({ role: 'employee' }),
          adminApiService.getForms({}),
          adminApiService.getForms({ 
            created_after: new Date().toISOString().split('T')[0] 
          }),
          adminApiService.getForms({ status: 'flagged' })
        ]);

        const newMetrics: DashboardMetric[] = [
          {
            id: 'employees',
            title: 'Total Employees',
            value: employeesData?.data?.length || 0,
            icon: Users,
            color: 'text-blue-600',
            data: employeesData?.data || []
          },
          {
            id: 'forms',
            title: 'Total Forms',
            value: formsData?.data?.length || 0,
            icon: FileText,
            color: 'text-green-600',
            data: formsData?.data || []
          },
          {
            id: 'today',
            title: 'Forms Today',
            value: todayFormsData?.data?.length || 0,
            icon: Calendar,
            color: 'text-purple-600',
            data: todayFormsData?.data || []
          },
          {
            id: 'flagged',
            title: 'Flagged Forms',
            value: flaggedFormsData?.data?.length || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            data: flaggedFormsData?.data || []
          }
        ];

        setMetrics(newMetrics);
      } catch (apiError) {
        console.warn('Failed to load real data from API:', apiError);
        // Show empty state instead of mock data
        const emptyMetrics: DashboardMetric[] = [
          {
            id: 'employees',
            title: 'Total Employees',
            value: 0,
            icon: Users,
            color: 'text-blue-600',
            data: []
          },
          {
            id: 'forms',
            title: 'Total Forms',
            value: 0,
            icon: FileText,
            color: 'text-green-600',
            data: []
          },
          {
            id: 'today',
            title: 'Forms Today',
            value: 0,
            icon: Calendar,
            color: 'text-purple-600',
            data: []
          },
          {
            id: 'flagged',
            title: 'Flagged Forms',
            value: 0,
            icon: AlertTriangle,
            color: 'text-red-600',
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
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of system activity and metrics</p>
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
            <Button
              variant="outline"
              onClick={() => navigate('/employee')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Employee Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                    {selectedMetricData.id === 'employees' && "No employees have been added to the system yet."}
                    {selectedMetricData.id === 'forms' && "No forms have been submitted yet."}
                    {selectedMetricData.id === 'today' && "No forms have been submitted today."}
                    {selectedMetricData.id === 'flagged' && "No forms have been flagged for review."}
                  </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <h3 className="mt-4 text-base font-medium">No recent activity</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Recent system activities will appear here once data is available.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database</span>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Server</span>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authentication</span>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

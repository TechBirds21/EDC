import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  BarChart, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardMetric {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface FormsByTemplate {
  name: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [formsByTemplate, setFormsByTemplate] = useState<FormsByTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, these would be actual API calls
      // For now, we'll use mock data
      
      // Mock metrics
      const mockMetrics: DashboardMetric[] = [
        {
          title: 'Total Volunteers',
          value: 156,
          change: '+12% from last month',
          trend: 'up',
          icon: Users,
          color: 'text-blue-500'
        },
        {
          title: 'Forms Submitted',
          value: 842,
          change: '+23% from last month',
          trend: 'up',
          icon: FileText,
          color: 'text-green-500'
        },
        {
          title: 'Completion Rate',
          value: '94%',
          change: '+2% from last month',
          trend: 'up',
          icon: CheckSquare,
          color: 'text-purple-500'
        },
        {
          title: 'Forms Pending Review',
          value: 5,
          change: '-3 from last week',
          trend: 'down',
          icon: AlertTriangle,
          color: 'text-amber-500'
        }
      ];
      
      // Mock forms by template data
      const mockFormsByTemplate: FormsByTemplate[] = [
        { name: 'Demographics', count: 156 },
        { name: 'Medical History', count: 142 },
        { name: 'Physical Examination', count: 138 },
        { name: 'Laboratory Results', count: 125 },
        { name: 'Vital Signs', count: 156 },
        { name: 'Adverse Events', count: 42 },
        { name: 'Concomitant Medications', count: 83 }
      ];
      
      setMetrics(mockMetrics);
      setFormsByTemplate(mockFormsByTemplate);
      
      // In a real implementation, you would fetch actual data from Supabase
      // Example:
      // const { data: volunteers, error: volunteersError } = await supabase
      //   .from('volunteers')
      //   .select('*');
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of system activity and metrics</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forms by Template Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Forms by Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={formsByTemplate}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New form submitted</p>
                  <p className="text-sm text-muted-foreground">Medical History for volunteer VOL-2024-001</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New volunteer registered</p>
                  <p className="text-sm text-muted-foreground">John Smith (VOL-2024-002)</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Form flagged for review</p>
                  <p className="text-sm text-muted-foreground">Adverse Event Report for volunteer VOL-2024-001</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Study period completed</p>
                  <p className="text-sm text-muted-foreground">Study STU-2024-003 Period 1</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto py-4 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Add Volunteer</span>
            </Button>
            
            <Button className="h-auto py-4 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Review Forms</span>
            </Button>
            
            <Button className="h-auto py-4 flex flex-col items-center justify-center space-y-2">
              <BarChart className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
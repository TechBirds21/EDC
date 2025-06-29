
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Calendar, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const navigate = useNavigate();

  const metrics = [
    {
      id: 'employees',
      title: 'Total Employees',
      value: '24',
      icon: Users,
      color: 'text-blue-600',
      data: [
        { name: 'John Smith', role: 'Senior Researcher', status: 'Active' },
        { name: 'Sarah Johnson', role: 'Data Analyst', status: 'Active' },
        { name: 'Mike Davis', role: 'Lab Technician', status: 'Active' },
        { name: 'Lisa Brown', role: 'Project Manager', status: 'Active' },
      ]
    },
    {
      id: 'forms',
      title: 'Total Forms',
      value: '156',
      icon: FileText,
      color: 'text-green-600',
      data: [
        { name: 'Demographics Form', submissions: 45, lastUpdated: '2024-06-10' },
        { name: 'Medical History', submissions: 38, lastUpdated: '2024-06-09' },
        { name: 'Lab Results', submissions: 42, lastUpdated: '2024-06-11' },
        { name: 'Adverse Events', submissions: 31, lastUpdated: '2024-06-08' },
      ]
    },
    {
      id: 'today',
      title: 'Forms Today',
      value: '8',
      icon: Calendar,
      color: 'text-purple-600',
      data: [
        { form: 'Demographics Form', submittedBy: 'Dr. Smith', time: '09:30 AM' },
        { form: 'Lab Results', submittedBy: 'Tech Jones', time: '10:15 AM' },
        { form: 'Medical History', submittedBy: 'Dr. Wilson', time: '11:00 AM' },
        { form: 'Adverse Events', submittedBy: 'Nurse Kelly', time: '02:30 PM' },
      ]
    },
    {
      id: 'flagged',
      title: 'Flagged Forms',
      value: '3',
      icon: AlertTriangle,
      color: 'text-red-600',
      data: [
        { form: 'Lab Results #1234', issue: 'Missing signature', flaggedBy: 'System' },
        { form: 'Demographics #5678', issue: 'Invalid date', flaggedBy: 'Dr. Smith' },
        { form: 'Medical History #9012', issue: 'Incomplete data', flaggedBy: 'Admin' },
      ]
    }
  ];

  const handleMetricClick = (metricId: string) => {
    setSelectedMetric(selectedMetric === metricId ? null : metricId);
  };

  const selectedMetricData = metrics.find(m => m.id === selectedMetric);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of system activity and metrics</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/employee')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employee Dashboard
          </Button>
        </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Form submitted: Demographics</span>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New employee added</span>
                  <span className="text-xs text-muted-foreground">4 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Audit log flagged</span>
                  <span className="text-xs text-muted-foreground">6 hours ago</span>
                </div>
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
                  <span className="text-sm">Form Builder</span>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Backup System</span>
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

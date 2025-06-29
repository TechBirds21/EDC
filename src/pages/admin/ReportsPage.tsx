import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Calendar, 
  Download, 
  FileText, 
  Printer, 
  RefreshCw 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('completeness');
  const [loading, setLoading] = useState(false);
  
  // Mock data for completeness report
  const completenessData = [
    { name: 'Demographics', complete: 156, incomplete: 0, total: 156 },
    { name: 'Medical History', complete: 142, incomplete: 14, total: 156 },
    { name: 'Physical Exam', complete: 138, incomplete: 18, total: 156 },
    { name: 'Laboratory', complete: 125, incomplete: 31, total: 156 },
    { name: 'Vital Signs', complete: 156, incomplete: 0, total: 156 },
    { name: 'Adverse Events', complete: 42, incomplete: 114, total: 156 },
    { name: 'Concomitant Meds', complete: 83, incomplete: 73, total: 156 }
  ];
  
  // Calculate completion percentages
  const completionPercentages = completenessData.map(item => ({
    name: item.name,
    percentage: Math.round((item.complete / item.total) * 100)
  }));
  
  // Mock data for status distribution
  const statusData = [
    { name: 'Draft', value: 24 },
    { name: 'Submitted', value: 38 },
    { name: 'Reviewed', value: 130 },
    { name: 'Flagged', value: 8 }
  ];
  
  // Colors for pie chart
  const COLORS = ['#9CA3AF', '#3B82F6', '#10B981', '#EF4444'];
  
  const handleGenerateReport = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert('PDF download would start here');
  };
  
  const handleDownloadExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    alert('Excel download would start here');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and download reports</p>
      </div>
      
      {/* Report Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completeness">Form Completeness</SelectItem>
                  <SelectItem value="status">Form Status Distribution</SelectItem>
                  <SelectItem value="volunteer">Volunteer Statistics</SelectItem>
                  <SelectItem value="audit">Audit Trail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {reportType === 'completeness' && 'Form Completeness Report'}
            {reportType === 'status' && 'Form Status Distribution'}
            {reportType === 'volunteer' && 'Volunteer Statistics'}
            {reportType === 'audit' && 'Audit Trail Report'}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Printer className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportType === 'completeness' && (
            <div className="space-y-6">
              {/* Completion Rate Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={completionPercentages}
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
                    <YAxis 
                      label={{ 
                        value: 'Completion Rate (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3b82f6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Completeness Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Type</TableHead>
                    <TableHead>Complete</TableHead>
                    <TableHead>Incomplete</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completenessData.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.complete}</TableCell>
                      <TableCell>{item.incomplete}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(item.complete / item.total) * 100}%` }}
                            ></div>
                          </div>
                          <span>{Math.round((item.complete / item.total) * 100)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {reportType === 'status' && (
            <div className="space-y-6">
              {/* Status Distribution Chart */}
              <div className="h-80 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Status Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusData.map((item, index) => {
                    const total = statusData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = (item.value / total) * 100;
                    
                    return (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.value}</TableCell>
                        <TableCell>{percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {reportType === 'volunteer' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Select a date range and generate the report to view volunteer statistics
                </p>
              </div>
            </div>
          )}
          
          {reportType === 'audit' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Select a date range and generate the report to view audit trail data
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Forms</h3>
              <p className="text-3xl font-bold">200</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Overall Completion Rate</h3>
              <p className="text-3xl font-bold">84%</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Volunteers</h3>
              <p className="text-3xl font-bold">42</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-2">Report Notes</h3>
            <p className="text-sm text-muted-foreground">
              This report shows data for the selected date range. The completeness rate is calculated based on the number of completed forms divided by the total number of expected forms for each form type.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
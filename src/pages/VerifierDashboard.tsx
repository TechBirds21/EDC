import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FormSubmission {
  id: string;
  volunteer_name: string;
  form_type: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  employee_name: string;
}

const VerifierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([
    {
      id: '1',
      volunteer_name: 'John Doe',
      form_type: 'Demographics',
      submitted_at: '2024-01-15T10:30:00Z',
      status: 'pending',
      employee_name: 'Jane Smith'
    },
    {
      id: '2',
      volunteer_name: 'Mary Johnson',
      form_type: 'Medical History',
      submitted_at: '2024-01-15T09:15:00Z',
      status: 'pending',
      employee_name: 'Bob Wilson'
    },
    {
      id: '3',
      volunteer_name: 'David Brown',
      form_type: 'Demographics',
      submitted_at: '2024-01-14T16:45:00Z',
      status: 'approved',
      employee_name: 'Alice Johnson'
    }
  ]);

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    const pending = submissions.filter(s => s.status === 'pending').length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    
    setStats({
      pending,
      approved,
      rejected,
      total: submissions.length
    });
  }, [submissions]);

  const handleApprove = (id: string) => {
    setSubmissions(prev => 
      prev.map(sub => sub.id === id ? { ...sub, status: 'approved' as const } : sub)
    );
  };

  const handleReject = (id: string) => {
    setSubmissions(prev => 
      prev.map(sub => sub.id === id ? { ...sub, status: 'rejected' as const } : sub)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Verifier Dashboard</h1>
            <p className="text-muted-foreground">Review and approve form submissions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Form Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.volunteer_name}</TableCell>
                    <TableCell>{submission.form_type}</TableCell>
                    <TableCell>{submission.employee_name}</TableCell>
                    <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        {submission.status === 'pending' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(submission.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleReject(submission.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VerifierDashboard;
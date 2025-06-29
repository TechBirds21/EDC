
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const submissions = [
    {
      id: 'SUB001',
      formType: 'Demographics',
      studyNo: 'STD001',
      volunteerId: 'VOL001',
      submittedBy: 'John Doe',
      submittedAt: '2024-01-15 10:30',
      status: 'complete'
    },
    {
      id: 'SUB002',
      formType: 'Medical History',
      studyNo: 'STD001',
      volunteerId: 'VOL002',
      submittedBy: 'Jane Smith',
      submittedAt: '2024-01-15 09:15',
      status: 'pending'
    },
    {
      id: 'SUB003',
      formType: 'ECG Evaluation',
      studyNo: 'STD002',
      volunteerId: 'VOL003',
      submittedBy: 'Mike Johnson',
      submittedAt: '2024-01-14 16:45',
      status: 'flagged'
    }
  ];

  const handlePrint = (submissionId: string) => {
    toast({
      title: "Print Initiated",
      description: `Generating PDF for submission ${submissionId}`
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Report data is being exported to CSV"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.formType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.studyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.volunteerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">View Reports</h1>
            <p className="text-muted-foreground">Browse and manage form submissions</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search forms, studies, volunteers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Form Submissions ({filteredSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Study No</TableHead>
                  <TableHead>Volunteer ID</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.id}</TableCell>
                    <TableCell>{submission.formType}</TableCell>
                    <TableCell>{submission.studyNo}</TableCell>
                    <TableCell>{submission.volunteerId}</TableCell>
                    <TableCell>{submission.submittedBy}</TableCell>
                    <TableCell>{submission.submittedAt}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrint(submission.id)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
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

export default AdminReportsPage;

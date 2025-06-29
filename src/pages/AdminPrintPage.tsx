
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPrintPage: React.FC = () => {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [printFormat, setPrintFormat] = useState('pdf');
  const { toast } = useToast();

  const submissions = [
    {
      id: 'SUB001',
      formType: 'Demographics',
      studyNo: 'STD001',
      volunteerId: 'VOL001',
      submittedAt: '2024-01-15 10:30',
      status: 'complete'
    },
    {
      id: 'SUB002',
      formType: 'Medical History',
      studyNo: 'STD001',
      volunteerId: 'VOL002',
      submittedAt: '2024-01-15 09:15',
      status: 'complete'
    },
    {
      id: 'SUB003',
      formType: 'ECG Evaluation',
      studyNo: 'STD002',
      volunteerId: 'VOL003',
      submittedAt: '2024-01-14 16:45',
      status: 'complete'
    },
    {
      id: 'SUB004',
      formType: 'Laboratory Results',
      studyNo: 'STD001',
      volunteerId: 'VOL001',
      submittedAt: '2024-01-14 14:20',
      status: 'complete'
    }
  ];

  const handleSelectionChange = (submissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubmissions([...selectedSubmissions, submissionId]);
    } else {
      setSelectedSubmissions(selectedSubmissions.filter(id => id !== submissionId));
    }
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(s => s.id));
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedSubmissions.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one form to print",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "PDF Generated",
        description: `${printFormat.toUpperCase()} generated for ${selectedSubmissions.length} forms`
      });
      setSelectedSubmissions([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Print Forms</h1>
            <p className="text-muted-foreground">Generate PDFs from form submissions</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={printFormat} onValueChange={setPrintFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGeneratePDF} disabled={selectedSubmissions.length === 0}>
              <Printer className="w-4 h-4 mr-2" />
              Generate {printFormat.toUpperCase()}
            </Button>
          </div>
        </div>

        {/* Selection Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedSubmissions.length === submissions.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedSubmissions.length} of {submissions.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Completed forms only
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Forms for Printing</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Study No</TableHead>
                  <TableHead>Volunteer ID</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubmissions.includes(submission.id)}
                        onCheckedChange={(checked) => 
                          handleSelectionChange(submission.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{submission.id}</TableCell>
                    <TableCell>{submission.formType}</TableCell>
                    <TableCell>{submission.studyNo}</TableCell>
                    <TableCell>{submission.volunteerId}</TableCell>
                    <TableCell>{submission.submittedAt}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
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

export default AdminPrintPage;

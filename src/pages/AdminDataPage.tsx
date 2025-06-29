
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Download, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  id: string;
  template_name: string;
  case_id: string;
  volunteer_id: string;
  study_number: string;
  answers: any;
  created_at: string;
  updated_at: string;
  submitted_by: string;
}

const AdminDataPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFormData(data || []);
    } catch (err: any) {
      console.error('Error loading form data:', err);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('patient_forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form deleted successfully"
      });

      loadFormData();
    } catch (error: any) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete form",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Form ID', 'Template', 'Case ID', 'Volunteer ID', 'Study Number', 'Submitted Date', 'Submitted By'],
      ...filteredData.map(form => [
        form.id,
        form.template_name,
        form.case_id,
        form.volunteer_id,
        form.study_number,
        new Date(form.created_at).toISOString(),
        form.submitted_by
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDetailedData = () => {
    const detailedData = filteredData.map(form => ({
      id: form.id,
      template_name: form.template_name,
      case_id: form.case_id,
      volunteer_id: form.volunteer_id,
      study_number: form.study_number,
      created_at: form.created_at,
      updated_at: form.updated_at,
      submitted_by: form.submitted_by,
      answers: form.answers
    }));

    const jsonContent = JSON.stringify(detailedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailed-form-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = formData.filter(form => {
    const matchesSearch = form.case_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.volunteer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.study_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.template_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTemplate = selectedTemplate === 'all' || form.template_name === selectedTemplate;
    return matchesSearch && matchesTemplate;
  });

  const uniqueTemplates = [...new Set(formData.map(form => form.template_name))];

  const renderAnswers = (answers: any) => {
    if (!answers || typeof answers !== 'object') return 'No data';
    
    return Object.entries(answers).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium text-sm">{key}:</span>
        <span className="ml-2 text-sm">{
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        }</span>
      </div>
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
            <p className="text-muted-foreground">View and manage all collected form data</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Summary
            </Button>
            <Button onClick={exportDetailedData} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Detailed
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formData.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueTemplates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formData.filter(form => 
                  new Date(form.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formData.filter(form => 
                  new Date(form.created_at).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by case ID, volunteer ID, study number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {uniqueTemplates.map(template => (
                    <SelectItem key={template} value={template}>{template}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Form Data ({filteredData.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading form data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Volunteer ID</TableHead>
                    <TableHead>Study Number</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <Badge variant="outline">{form.template_name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{form.case_id}</TableCell>
                      <TableCell className="font-mono text-sm">{form.volunteer_id}</TableCell>
                      <TableCell className="font-mono text-sm">{form.study_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(form.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(form.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {form.submitted_by?.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedForm(form);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteForm(form.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Form Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Form Details</DialogTitle>
            </DialogHeader>
            {selectedForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Template:</strong> {selectedForm.template_name}
                  </div>
                  <div>
                    <strong>Case ID:</strong> {selectedForm.case_id}
                  </div>
                  <div>
                    <strong>Volunteer ID:</strong> {selectedForm.volunteer_id}
                  </div>
                  <div>
                    <strong>Study Number:</strong> {selectedForm.study_number}
                  </div>
                  <div>
                    <strong>Submitted:</strong> {new Date(selectedForm.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {new Date(selectedForm.updated_at).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <strong>Form Answers:</strong>
                  <ScrollArea className="h-96 w-full border rounded-md p-4 mt-2">
                    {renderAnswers(selectedForm.answers)}
                  </ScrollArea>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminDataPage;

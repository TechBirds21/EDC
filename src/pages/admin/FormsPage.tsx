import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  Printer,
  Download
} from 'lucide-react';
import { formsApi } from '@/services/api';
import { toast } from 'sonner';

interface Form {
  id: string;
  template_name: string;
  volunteer_id: string;
  study_number: string;
  case_id: string;
  answers: any;
  created_at: string;
  updated_at: string;
  submitted_by: string;
}

type FormStatus = 'draft' | 'submitted' | 'reviewed' | 'flagged';

const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  useEffect(() => {
    loadForms();
  }, []);
  
  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getForms();
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadForms();
      return;
    }
    
    try {
      setLoading(true);
      const data = await formsApi.searchForms(searchTerm);
      setForms(data);
    } catch (error) {
      console.error('Error searching forms:', error);
      toast.error('Failed to search forms');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrintForm = () => {
    if (!selectedForm) return;
    
    // Create a printable version of the form
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print forms');
      return;
    }
    
    // Generate HTML content
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedForm.template_name} - ${selectedForm.volunteer_id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .header { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .section { margin-bottom: 15px; }
          .label { font-weight: bold; }
          .value { margin-left: 10px; }
          .row { display: flex; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${selectedForm.template_name}</h1>
          <div>Volunteer ID: ${selectedForm.volunteer_id}</div>
          <div>Study Number: ${selectedForm.study_number}</div>
          <div>Date: ${new Date(selectedForm.created_at).toLocaleDateString()}</div>
        </div>
        
        <div class="content">
          <pre>${JSON.stringify(selectedForm.answers, null, 2)}</pre>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Print Form</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };
  
  const handleExportForm = () => {
    if (!selectedForm) return;
    
    // Create a JSON file for download
    const dataStr = JSON.stringify(selectedForm, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${selectedForm.template_name}_${selectedForm.volunteer_id}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const filteredForms = forms.filter(form => {
    // Apply search filter if there's a search term
    if (searchTerm) {
      return (
        form.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.volunteer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.study_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.case_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Otherwise, just filter by tab
    return true;
  });
  
  const getFormStatus = (form: Form): FormStatus => {
    // In a real app, you'd have a status field
    // For now, we'll simulate it based on creation date
    const createdDate = new Date(form.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'submitted';
    if (diffDays < 3) return 'reviewed';
    if (diffDays < 5 && form.template_name.includes('Adverse')) return 'flagged';
    return 'reviewed';
  };
  
  const getStatusBadge = (form: Form) => {
    const status = getFormStatus(form);
    
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800">Flagged</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  const getStatusIcon = (form: Form) => {
    const status = getFormStatus(form);
    
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'reviewed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Forms</h1>
        <p className="text-muted-foreground">Manage and review form submissions</p>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by volunteer ID, study number, or form type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <Button variant="outline" className="w-full md:w-auto" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Forms Tabs and Table */}
      <Card>
        <CardHeader>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Forms</TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {forms.filter(f => getFormStatus(f) === 'submitted').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="flagged">
                Flagged
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {forms.filter(f => getFormStatus(f) === 'flagged').length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <CardTitle className="mb-4">All Forms ({filteredForms.length})</CardTitle>
              {renderFormsTable(filteredForms)}
            </TabsContent>
            
            <TabsContent value="submitted" className="mt-6">
              <CardTitle className="mb-4">Submitted Forms ({filteredForms.filter(f => getFormStatus(f) === 'submitted').length})</CardTitle>
              {renderFormsTable(filteredForms.filter(f => getFormStatus(f) === 'submitted'))}
            </TabsContent>
            
            <TabsContent value="reviewed" className="mt-6">
              <CardTitle className="mb-4">Reviewed Forms ({filteredForms.filter(f => getFormStatus(f) === 'reviewed').length})</CardTitle>
              {renderFormsTable(filteredForms.filter(f => getFormStatus(f) === 'reviewed'))}
            </TabsContent>
            
            <TabsContent value="flagged" className="mt-6">
              <CardTitle className="mb-4">Flagged Forms ({filteredForms.filter(f => getFormStatus(f) === 'flagged').length})</CardTitle>
              {renderFormsTable(filteredForms.filter(f => getFormStatus(f) === 'flagged'))}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      {/* View Form Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Details</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedForm.template_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Volunteer: {selectedForm.volunteer_id} • Study: {selectedForm.study_number}
                  </p>
                </div>
                <div>
                  {getStatusBadge(selectedForm)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Submission Details</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm">Submitted By:</dt>
                      <dd className="text-sm font-medium">{selectedForm.submitted_by}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm">Submitted On:</dt>
                      <dd className="text-sm font-medium">
                        {new Date(selectedForm.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm">Last Updated:</dt>
                      <dd className="text-sm font-medium">
                        {new Date(selectedForm.updated_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Case Information</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm">Case ID:</dt>
                      <dd className="text-sm font-medium">{selectedForm.case_id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm">Form Type:</dt>
                      <dd className="text-sm font-medium">{selectedForm.template_name}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Form Data</h3>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedForm.answers, null, 2)}
                  </pre>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handlePrintForm}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleExportForm}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderFormsTable(forms: Form[]) {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading forms...</p>
        </div>
      );
    }
    
    if (forms.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-muted-foreground">No forms found</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Form Type</TableHead>
              <TableHead>Volunteer ID</TableHead>
              <TableHead>Study Number</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(form)}
                    {getStatusBadge(form)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{form.template_name}</TableCell>
                <TableCell>{form.volunteer_id}</TableCell>
                <TableCell>{form.study_number}</TableCell>
                <TableCell>{new Date(form.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(form.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedForm(form);
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default FormsPage;

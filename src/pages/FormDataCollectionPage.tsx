import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formDataCollector } from '@/services/formDataCollector';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Database, FileText } from 'lucide-react';

const FormDataCollectionPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<any[]>([]);
  
  useEffect(() => {
    if (caseId) {
      loadFormData();
    }
  }, [caseId]);
  
  const loadFormData = () => {
    if (!caseId) return;
    
    const data = formDataCollector.getAllFormDataForCase(caseId);
    setFormData(data);
  };
  
  const handleSubmitAll = async () => {
    if (!caseId) {
      toast({
        title: "Error",
        description: "No case ID provided",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await formDataCollector.submitAllForms(caseId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        
        // Reload data
        loadFormData();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit forms",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleClearData = () => {
    if (!caseId) return;
    
    if (confirm("Are you sure you want to clear all form data for this case? This action cannot be undone.")) {
      formDataCollector.clearCaseData(caseId);
      loadFormData();
      
      toast({
        title: "Success",
        description: "Form data cleared successfully"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'synced':
        return <Badge variant="default">Synced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const status = formDataCollector.getSubmissionStatus(caseId || '');
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Form Data Collection</h1>
            <p className="text-muted-foreground">Manage and submit collected form data</p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmitAll} 
              disabled={submitting || formData.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit All Forms'}
            </Button>
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Total Forms</h3>
                <p className="text-3xl font-bold">{status.total}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <FileText className="h-8 w-8 text-yellow-500 mb-2" />
                <h3 className="text-lg font-medium">Draft</h3>
                <p className="text-3xl font-bold">{status.draft}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <FileText className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="text-lg font-medium">Submitted</h3>
                <p className="text-3xl font-bold">{status.submitted}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Synced</h3>
                <p className="text-3xl font-bold">{status.synced}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {formData.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No form data found for this case. Complete some forms to see them here.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Collected Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Volunteer ID</TableHead>
                    <TableHead>Study Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.map((form, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{form.templateName}</TableCell>
                      <TableCell>{form.volunteerId}</TableCell>
                      <TableCell>{form.studyNumber}</TableCell>
                      <TableCell>{getStatusBadge(form.status)}</TableCell>
                      <TableCell>{new Date(form.lastModified).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleClearData}
                  disabled={formData.length === 0}
                >
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Data Submission Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Form Collection</h3>
                  <p className="text-sm text-muted-foreground">
                    Forms are collected as you complete them and stored locally.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Batch Submission</h3>
                  <p className="text-sm text-muted-foreground">
                    All forms are submitted together to ensure data consistency.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Fallback Mechanism</h3>
                  <p className="text-sm text-muted-foreground">
                    If the Python API is unavailable, forms will be submitted directly to the database.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FormDataCollectionPage;
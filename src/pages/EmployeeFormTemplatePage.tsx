import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalForm } from '@/context/GlobalFormContext';
import { pythonApi } from '@/services/api';
import { db } from '@/lib/dexie';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Save, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmployeeFormTemplatePage = () => {
  const { pid, templateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { volunteerId, studyNo, projectId, caseId, setVolunteerId, setStudyNo } = useGlobalForm();
  
  const [template, setTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('section1');

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const volId = searchParams.get('volunteerId');
    const studyNumber = searchParams.get('studyNumber');
    const caseId = searchParams.get('case');
    
    if (volId) setVolunteerId(volId);
    if (studyNumber) setStudyNo(studyNumber);
    
    // Load template and any existing form data
    loadTemplate();
    loadExistingFormData();
  }, [location, templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;
    
    setLoading(true);
    try {
      const templateData = await pythonApi.getFormTemplateById(templateId);
      setTemplate(templateData);
      
      // Initialize form data structure based on template
      const initialData = {};
      templateData.json_schema?.sections?.forEach(section => {
        section.fields?.forEach(field => {
          initialData[field.name] = field.defaultValue || '';
        });
      });
      
      setFormData(prev => ({...prev, ...initialData}));
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Error",
        description: "Failed to load form template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingFormData = async () => {
    if (!volunteerId || !templateId) return;
    
    try {
      // First check local storage
      const localForms = await db.pending_forms
        .where({
          template_id: templateId,
          volunteer_id: volunteerId
        })
        .toArray();
      
      if (localForms.length > 0) {
        // Use the most recently modified form
        const latestForm = localForms.sort((a, b) => 
          new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
        )[0];
        
        setFormData(latestForm.answers);
        return;
      }
      
      // If not in local storage, try to fetch from API
      const response = await pythonApi.getForms(1, 10, {
        volunteer_id: volunteerId,
        template_id: templateId
      });
      
      if (response.items && response.items.length > 0) {
        setFormData(response.items[0].data || {});
      }
    } catch (error) {
      console.error('Error loading existing form data:', error);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSaveLocal = async () => {
    if (!templateId || !volunteerId) {
      toast({
        title: "Missing Information",
        description: "Template ID and Volunteer ID are required",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      // Check if we already have a local version
      const existingForms = await db.pending_forms
        .where({
          template_id: templateId,
          volunteer_id: volunteerId
        })
        .toArray();
      
      const now = new Date();
      
      if (existingForms.length > 0) {
        // Update existing
        await db.pending_forms.update(existingForms[0].id!, {
          answers: formData,
          last_modified: now,
          synced: false
        });
      } else {
        // Create new
        await db.pending_forms.add({
          template_id: templateId,
          patient_id: caseId || "",
          volunteer_id: volunteerId,
          study_number: studyNo || "",
          answers: formData,
          created_at: now,
          last_modified: now,
          synced: false
        });
      }
      
      toast({
        title: "Saved Locally",
        description: "Form data has been saved to local storage"
      });
    } catch (error) {
      console.error('Error saving form locally:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save form data locally",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!templateId || !volunteerId) {
      toast({
        title: "Missing Information",
        description: "Template ID and Volunteer ID are required",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Check if form already exists in backend
      const existingForms = await pythonApi.getForms(1, 10, {
        volunteer_id: volunteerId,
        template_id: templateId
      });
      
      let response;
      
      if (existingForms.items && existingForms.items.length > 0) {
        // Update existing form
        const formId = existingForms.items[0].id;
        response = await pythonApi.updateForm(formId, {
          status: "completed",
          data: formData
        });
      } else {
        // Create new form
        response = await pythonApi.createForm({
          template_id: templateId,
          volunteer_id: volunteerId,
          status: "completed",
          data: formData
        });
      }
      
      // Mark as synced in local storage
      const localForms = await db.pending_forms
        .where({
          template_id: templateId,
          volunteer_id: volunteerId
        })
        .toArray();
      
      if (localForms.length > 0) {
        await db.pending_forms.update(localForms[0].id!, {
          synced: true
        });
      }
      
      toast({
        title: "Form Submitted",
        description: "Form data has been successfully submitted"
      });
      
      // Navigate back to the project page or volunteer list
      navigate(`/employee/project/${pid}/volunteers`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit form data to server",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    // Save locally before navigating away
    handleSaveLocal();
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Template not found</h2>
        <p className="mt-2">The requested form template could not be loaded.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <CommonFormHeader
        title={template.name}
        volunteerId={volunteerId || undefined}
        studyNumber={studyNo || undefined}
      />

      {template.json_schema?.sections?.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {template.json_schema.sections.map((section, index) => (
              <TabsTrigger key={section.id} value={`section${index + 1}`}>
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {template.json_schema.sections.map((section, index) => (
            <TabsContent key={section.id} value={`section${index + 1}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields?.map(field => (
                    <FormField
                      key={field.id}
                      label={field.label}
                      type={field.type}
                      required={field.required}
                      options={field.options}
                      value={formData[field.name] || ''}
                      onChange={(value) => handleFieldChange(field.name, value)}
                      placeholder={field.placeholder}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">This template has no sections defined.</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="space-x-3">
          <Button 
            variant="outline" 
            onClick={handleSaveLocal}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>

          <Button 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormTemplatePage;

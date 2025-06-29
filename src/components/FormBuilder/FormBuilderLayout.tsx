import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Settings, 
  Save,
  Eye,
  Table,
  Type,
  Hash,
  CheckSquare,
  List
} from 'lucide-react';
import { FieldEditor } from './FieldEditor';
import { FormPreview } from './FormPreview';
import { formBuilderService } from '@/services/formBuilderService';
import { FormField, FormSection } from './types';

interface Client {
  id: string;
  name: string;
}

const FormBuilderLayout: React.FC = () => {
  const [formName, setFormName] = useState('Pre-dose and Post-dose Restrictions');
  const [formDescription, setFormDescription] = useState('');
  const [projectId, setProjectId] = useState('DEFAULT_PROJECT');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [sections, setSections] = useState<FormSection[]>([
    {
      id: 'section1',
      title: 'Evaluation Section',
      sortOrder: 0,
      fields: [
        {
          id: 'eval_header',
          type: 'header',
          name: 'evaluation_header',
          label: 'Evaluated By (sign & date) - (Coordinator/Designer):',
          width: 'full'
        },
        {
          id: 'name_signature',
          type: 'text',
          name: 'evaluator_name',
          label: 'Name/Signature',
          width: 'third',
          placeholder: 'Enter evaluator name',
          required: true
        },
        {
          id: 'eval_date',
          type: 'date',
          name: 'evaluation_date',
          label: 'Date',
          width: 'third',
          required: true
        },
        {
          id: 'eval_time',
          type: 'time',
          name: 'evaluation_time',
          label: 'Time',
          width: 'third',
          required: true
        }
      ]
    },
    {
      id: 'section2',
      title: 'Post-Dose Restrictions',
      sortOrder: 1,
      fields: [
        {
          id: 'water_restriction',
          type: 'radio',
          name: 'water_restriction_maintained',
          label: '1.0 hour post-dose water restriction maintained',
          options: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}],
          width: 'full',
          required: true
        },
        {
          id: 'sitting_position',
          type: 'radio',
          name: 'sitting_position_maintained',
          label: 'Sitting position maintained for initial 04 hours',
          options: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}],
          width: 'full',
          required: true
        },
        {
          id: 'fasting_condition',
          type: 'radio',
          name: 'fasting_condition_maintained',
          label: 'Is subject maintained fasting condition at least 04 hours post dose?',
          options: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}],
          width: 'full',
          required: true
        },
        {
          id: 'comments',
          type: 'textarea',
          name: 'additional_comments',
          label: 'Comments (if any):',
          width: 'full',
          placeholder: 'Enter any additional comments or observations'
        }
      ]
    }
  ]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientData = await formBuilderService.getClients();
      setClients(clientData);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      });
    }
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `section${Date.now()}`,
      title: 'New Section',
      fields: [],
      sortOrder: sections.length
    };
    setSections([...sections, newSection]);
  };

  const addField = (sectionId: string, fieldType: string) => {
    const fieldTypeMap: Record<string, Partial<FormField>> = {
      text: { type: 'text', name: 'text_field', label: 'Text Field', placeholder: 'Enter text' },
      textarea: { type: 'textarea', name: 'textarea_field', label: 'Text Area', placeholder: 'Enter description' },
      date: { type: 'date', name: 'date_field', label: 'Date Field' },
      time: { type: 'time', name: 'time_field', label: 'Time Field' },
      radio: { 
        type: 'radio', 
        name: 'radio_field', 
        label: 'Radio Buttons', 
        options: [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' }
        ]
      },
      select: { 
        type: 'select', 
        name: 'select_field', 
        label: 'Dropdown', 
        options: [
          { label: 'Option 1', value: 'option_1' }, 
          { label: 'Option 2', value: 'option_2' }
        ]
      },
      header: { type: 'header', name: 'header_field', label: 'Section Header' },
      table: { 
        type: 'table', 
        name: 'table_field', 
        label: 'Data Table',
        tableConfig: {
          columns: [
            { id: 'col1', label: 'Column 1', type: 'text' },
            { id: 'col2', label: 'Column 2', type: 'text' }
          ],
          defaultRows: 3
        }
      }
    };

    const newField: FormField = {
      id: `field${Date.now()}`,
      width: 'full',
      required: false,
      ...fieldTypeMap[fieldType]
    } as FormField;

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : section
    ));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  const updateSection = (sectionId: string, updates: { title: string }) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a form name",
        variant: "destructive"
      });
      return;
    }

    if (!projectId.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please enter a project ID",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name: formName.trim(),
        description: formDescription.trim(),
        project_id: projectId.trim(),
        client_id: clientId || undefined,
        sections: sections
      };

      await formBuilderService.saveTemplate(templateData);
      
      toast({
        title: "Success",
        description: "Form template saved successfully!",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save form template",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'textarea', label: 'Text Area', icon: FileText },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'time', label: 'Time', icon: Clock },
    { type: 'radio', label: 'Radio Buttons', icon: CheckSquare },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'table', label: 'Data Table', icon: Table },
    { type: 'header', label: 'Header', icon: Hash },
    { type: 'signature', label: 'Signature', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 text-white p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Form Builder</h2>
          <Button variant="outline" className="w-full mb-4" onClick={() => window.location.reload()}>
            <Plus className="w-4 h-4 mr-2" />
            New Form
          </Button>
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Field Types</h3>
          <div className="space-y-2">
            {fieldTypes.map((fieldType) => (
              <Button
                key={fieldType.type}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-700"
                onClick={() => sections.length > 0 && addField(sections[0].id, fieldType.type)}
                disabled={sections.length === 0}
              >
                <fieldType.icon className="w-4 h-4 mr-2" />
                {fieldType.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Template Builder</h1>
              <p className="text-gray-600 mt-1">Create professional forms with advanced field types</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>

          {/* Form Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Template Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formName">Template Name *</Label>
                  <Input
                    id="formName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="projectId">Project ID *</Label>
                  <Input
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter project ID"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="formDescription">Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the purpose of this form"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="clientSelect">Client (Optional)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Form Structure */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Form Structure</CardTitle>
                <Button onClick={addSection}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-500 mb-4">Create your first form section to get started</p>
                  <Button onClick={addSection}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <Card key={section.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="text-lg font-semibold border-none shadow-none p-0 bg-transparent"
                            placeholder="Section title"
                          />
                          <div className="flex gap-2">
                            <Select onValueChange={(value) => addField(section.id, value)}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Add Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type.type} value={type.type}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {sections.length > 1 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteSection(section.id)}
                              >
                                Delete Section
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {section.fields.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            No fields yet. Use the dropdown above to add fields.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {section.fields.map((field) => (
                              <FieldEditor
                                key={field.id}
                                field={field}
                                onUpdate={(updates) => updateField(section.id, field.id, updates)}
                                onDelete={() => deleteField(section.id, field.id)}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          <FormPreview formName={formName} sections={sections as any} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormBuilderLayout;

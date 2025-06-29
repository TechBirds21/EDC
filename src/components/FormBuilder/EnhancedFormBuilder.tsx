import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Save, Eye, Trash2, Copy, Move, Table, Type, Hash, Calendar, List, Radio, CheckSquare, FileText, Heading } from 'lucide-react';
import { FieldEditor } from './FieldEditor';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { formBuilderService } from '@/services/formBuilderService';
import { useToast } from '@/hooks/use-toast';
import { FormField, FormSection } from './types';

const FIELD_TYPES = [
  { type: 'header', label: 'Header', icon: Heading, description: 'Section header' },
  { type: 'text', label: 'Text Input', icon: Type, description: 'Single line text' },
  { type: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'time', label: 'Time', icon: Calendar, description: 'Time picker' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Select from options' },
  { type: 'radio', label: 'Radio Buttons', icon: Radio, description: 'Single choice' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Multiple choice' },
  { type: 'table', label: 'Data Table', icon: Table, description: 'Structured data table' },
  { type: 'signature', label: 'Signature', icon: FileText, description: 'Digital signature' }
];

export const EnhancedFormBuilder: React.FC = () => {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [clientId, setClientId] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: 'section-1',
      title: 'General Information',
      description: 'Basic form information',
      fields: [],
      sortOrder: 0,
      collapsible: false,
      columns: 1
    }
  ]);

  const { submitForm, isSubmitting } = useFormSubmission();
  const { toast } = useToast();

  const addField = (sectionId: string, fieldType: string) => {
    const fieldId = `field-${Date.now()}`;
    const fieldName = `${fieldType}_${fieldId}`;
    
    const newField: FormField = {
      id: fieldId,
      type: fieldType as FormField['type'],
      name: fieldName,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      required: false,
      width: 'full',
      placeholder: `Enter ${fieldType}...`
    };

    if (fieldType === 'select' || fieldType === 'radio') {
      newField.options = [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
        { label: 'Option 3', value: 'option_3' }
      ];
    }

    if (fieldType === 'table') {
      newField.tableConfig = {
        columns: [
          {
            id: 'col-1',
            label: 'Column 1',
            type: 'text',
            required: false
          },
          {
            id: 'col-2',
            label: 'Column 2',
            type: 'text',
            required: false
          }
        ],
        defaultRows: 3,
        allowAddRows: true,
        allowDeleteRows: true
      };
    }

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

  const duplicateField = (sectionId: string, fieldId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const field = section?.fields.find(f => f.id === fieldId);
    
    if (field) {
      const duplicatedField: FormField = {
        ...field,
        id: `field-${Date.now()}`,
        name: `${field.name}_copy`,
        label: `${field.label} (Copy)`
      };
      
      setSections(sections.map(section => 
        section.id === sectionId 
          ? { ...section, fields: [...section.fields, duplicatedField] }
          : section
      ));
    }
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      fields: [],
      sortOrder: sections.length,
      collapsible: false,
      columns: 1
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const saveForm = async () => {
    if (!formName.trim()) {
      toast({
        title: "Error",
        description: "Form name is required",
        variant: "destructive"
      });
      return;
    }

    if (!projectId.trim()) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive"
      });
      return;
    }

    const formData = {
      name: formName,
      description: formDescription,
      project_id: projectId,
      client_id: clientId || null,
      sections: sections
    };

    await submitForm(async () => {
      const result = await formBuilderService.saveTemplate(formData);
      toast({
        title: "Success",
        description: "Form template saved successfully",
      });
      return result;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enhanced Form Builder</h1>
              <p className="text-sm text-gray-600 mt-1">Create professional forms with tables, multi-column layouts, and advanced fields</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveForm} disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Field Palette */}
          <div className="col-span-3">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Field Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {FIELD_TYPES.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <div
                        key={fieldType.type}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => sections.length > 0 && addField(sections[0].id, fieldType.type)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">{fieldType.label}</div>
                            <div className="text-xs text-gray-500">{fieldType.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas */}
          <div className="col-span-9 space-y-6">
            {/* Form Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Form Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Form Name *</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter form name..."
                    />
                  </div>
                  <div>
                    <Label>Project ID *</Label>
                    <Input
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="Enter project ID..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the purpose of this form..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Client ID (Optional)</Label>
                  <Input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter client ID..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Sections */}
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first form section</p>
                    <Button onClick={addSection}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <Card key={section.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                className="font-semibold text-lg border-none p-0 h-auto"
                                placeholder="Section title..."
                              />
                              <Input
                                value={section.description || ''}
                                onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                className="text-sm text-gray-600 border-none p-0 h-auto mt-1"
                                placeholder="Section description..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSection(section.id)}
                                disabled={sections.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          {section.fields.length === 0 ? (
                            <div className="text-center py-8 border border-dashed rounded-lg">
                              <p className="text-gray-500 mb-4">No fields in this section</p>
                              <p className="text-sm text-gray-400">Drag fields from the palette or click on field types to add them</p>
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

                          <Separator className="my-4" />
                          
                          <div className="flex gap-2 flex-wrap">
                            {FIELD_TYPES.slice(0, 6).map((fieldType) => {
                              const Icon = fieldType.icon;
                              return (
                                <Button
                                  key={fieldType.type}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addField(section.id, fieldType.type)}
                                >
                                  <Icon className="w-3 h-3 mr-1" />
                                  {fieldType.label}
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

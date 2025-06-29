
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
}

interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormTemplate {
  id: string;
  name: string;
  project_id: string;
  json_schema: any;
  version: number;
  created_at: string;
  updated_at: string;
}

const AdvancedFormTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [projectId, setProjectId] = useState('default-project');
  const [sections, setSections] = useState<FormSection[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setProjectId(template.project_id);
    
    // Parse the JSON schema safely
    try {
      const schema = template.json_schema;
      if (schema && typeof schema === 'object' && 'sections' in schema) {
        setSections(schema.sections as FormSection[]);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Error parsing template schema:', error);
      setSections([]);
    }
    
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setProjectId('default-project');
    setSections([{
      id: '1',
      title: 'Section 1',
      fields: []
    }]);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setLoading(true);
    try {
      const templateData = {
        name: templateName,
        project_id: projectId,
        json_schema: { sections } as any,
        version: selectedTemplate ? selectedTemplate.version + 1 : 1
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from('form_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('form_templates')
          .insert([templateData]);

        if (error) throw error;
        toast.success('Template created successfully');
      }

      await loadTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template deleted successfully');
      await loadTemplates();
      
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: Date.now().toString(),
      title: `Section ${sections.length + 1}`,
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, title: string) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, title } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addField = (sectionId: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: 'field_name',
      type: 'text',
      label: 'Field Label',
      required: false
    };

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

  if (isEditing) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Enter project ID"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Form Sections</CardTitle>
            <Button onClick={addSection} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    className="font-medium"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Fields</Label>
                    <Button
                      onClick={() => addField(section.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  {section.fields.map((field) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(section.id, field.id, { name: e.target.value })}
                        placeholder="Field name"
                        className="col-span-2"
                      />
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                        placeholder="Field label"
                        className="col-span-3"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(section.id, field.id, { type: e.target.value as FormField['type'] })}
                        className="col-span-2 px-3 py-2 border rounded"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="select">Select</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="textarea">Textarea</option>
                      </select>
                      <label className="col-span-2 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                        />
                        Required
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteField(section.id, field.id)}
                        className="col-span-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTemplate} disabled={loading}>
            {loading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Form Template Manager</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">
                    Project: {template.project_id} | Version: {template.version}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found. Create your first template!</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedFormTemplateManager;

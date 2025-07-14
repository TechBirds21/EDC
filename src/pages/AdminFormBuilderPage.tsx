import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { TemplatePreview } from '@/components/templates/TemplatePreview'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField, FormSection } from '@/components/FormBuilder/types';

// The types here should match what TemplateBuilder and its children expect.
// This is a combination of what's needed for saving and for building.
interface Client {
  id: string;
  name: string;
}

interface FormTemplateForBuilder {
  id?: string;
  name: string;
  description: string;
  project_id: string;
  client_id: string;
  version: number;
  is_active?: boolean;
  created_at?: string;
  json_schema: {
    sections: FormSection[];
    side_headers?: any[];
    logic?: any;
  };
}

const AdminFormBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<FormTemplateForBuilder>({
    name: '',
    description: 'Form template description',
    project_id: 'default-project',
    client_id: '',
    version: 1,
    json_schema: {
      sections: [],
      side_headers: [],
      logic: {}
    }
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
    loadClients();
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTemplate({
          id: data.id,
          name: data.name,
          description: data.description || '',
          project_id: data.project_id,
          client_id: data.client_id || '',
          version: data.version || 1,
          json_schema: data.json_schema as any,
          is_active: data.is_active,
          created_at: data.created_at,
        });
      }
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

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, name').eq('status', 'active');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate template name and project ID
      if (!template.name.trim()) {
        toast({
          title: "Error",
          description: "Template name is required",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!template.project_id.trim()) {
        toast({
          title: "Error",
          description: "Project ID is required",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Convert the template to the format expected by Supabase
      const templateData = {
        name: template.name,
        description: template.description,
        project_id: template.project_id,
        client_id: template.client_id,
        version: template.version,
        is_active: template.is_active ?? true,
        json_schema: template.json_schema as any
      };

      if (template.id) {
        // Update existing template
        const { error } = await supabase
          .from('form_templates')
          .update(templateData)
          .eq('id', template.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('form_templates')
          .insert([templateData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Form template saved successfully",
      });

      navigate('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save form template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onTplNameChange = (name: string) => setTemplate(t => ({ ...t, name }));
  const onTplDescChange = (description: string) => setTemplate(t => ({ ...t, description }));
  const onProjIdChange = (project_id: string) => setTemplate(t => ({ ...t, project_id }));
  const onClientIdChange = (client_id: string) => setTemplate(t => ({ ...t, client_id: client_id === 'none' ? '' : client_id }));
  const onSectionsChange = (sections: FormSection[]) => setTemplate(t => ({ ...t, json_schema: { ...t.json_schema, sections } }));

  const onAddField = (sectionId: string, type: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `${type.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
      label: `New ${type} Field`,
      type: type as any,
      required: false,
      width: 'full',
      ...( (type === 'select' || type === 'radio') && { options: [{label: 'Option 1', value: 'option_1'}] } ),
      ...( (type === 'table' || type === 'matrix') && { columns: [{id: 'col1', label: 'Column 1', type: 'text'}] } )
    };

    const newSections = template.json_schema.sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, fields: [...(section.fields || []), newField] };
      }
      return section;
    });
    onSectionsChange(newSections);
  };

  const onUpdateField = (sectionId: string, fieldId: string, patch: Partial<FormField>) => {
    const newSections = template.json_schema.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.map(field =>
            field.id === fieldId ? { ...field, ...patch } : field
          )
        };
      }
      return section;
    });
    onSectionsChange(newSections);
  };

  const onDeleteField = (sectionId: string, fieldId: string) => {
    const newSections = template.json_schema.sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, fields: section.fields.filter(f => f.id !== fieldId) };
      }
      return section;
    });
    onSectionsChange(newSections);
  };

  const onDuplicateField = (sectionId: string, fieldId: string) => {
    let fieldToDuplicate: FormField | undefined;
    const section = template.json_schema.sections.find(s => s.id === sectionId);
    if(section) {
        fieldToDuplicate = section.fields.find(f => f.id === fieldId);
    }
    if (!fieldToDuplicate) return;

    const newField: FormField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}`,
      name: `${fieldToDuplicate.name}_copy`,
    };

    const newSections = template.json_schema.sections.map(s => {
      if (s.id === sectionId) {
        const fieldIndex = s.fields.findIndex(f => f.id === fieldId);
        const newFields = [...s.fields];
        newFields.splice(fieldIndex + 1, 0, newField);
        return { ...s, fields: newFields };
      }
      return s;
    });
    onSectionsChange(newSections);
  };

  const onMoveField = (sectionId: string, fieldId: string, direction: 'up' | 'down') => {
    const newSections = [...template.json_schema.sections];
    const sectionIndex = newSections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const fields = [...newSections[sectionIndex].fields];
    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (newIndex < 0 || newIndex >= fields.length) return;

    const [movedField] = fields.splice(fieldIndex, 1);
    fields.splice(newIndex, 0, movedField);
    
    newSections[sectionIndex] = { ...newSections[sectionIndex], fields };
    onSectionsChange(newSections);
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <TemplateBuilder
        tplName={template.name}
        tplDesc={template.description}
        projId={template.project_id}
        clientId={template.client_id}
        sections={template.json_schema.sections}
        clients={clients}
        onTplNameChange={onTplNameChange}
        onTplDescChange={onTplDescChange}
        onProjIdChange={onProjIdChange}
        onClientIdChange={onClientIdChange}
        onSectionsChange={onSectionsChange}
        onAddField={onAddField}
        onUpdateField={onUpdateField}
        onDeleteField={onDeleteField}
        onDuplicateField={onDuplicateField}
        onMoveField={onMoveField}
        onSave={handleSave}
        onPreview={() => setShowPreview(true)}
      />
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl min-w-[50vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              This is how your form will appear to users
            </p>
          </DialogHeader>
          <div className="overflow-auto p-4 bg-gray-50 rounded-md">
            <TemplatePreview template={{
              ...template,
              id: template.id || 'preview-id',
              is_active: template.is_active ?? true,
              created_at: template.created_at || new Date().toISOString()
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminFormBuilderPage;
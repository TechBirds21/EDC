import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings, Eye, Save, Undo, Redo } from 'lucide-react';
import { FormField, FormSection } from '../FormBuilder/types';
import { FieldPalette } from './FieldPalette';
import { SectionEditor } from './SectionEditor';

// Client type is specific to this builder context
interface Client {
  id: string;
  name: string;
}

interface TemplateBuilderProps {
  tplName: string;
  tplDesc: string;
  projId: string;
  clientId: string;
  sections: FormSection[];
  clients: Client[];
  onTplNameChange: (value: string) => void;
  onTplDescChange: (value: string) => void;
  onProjIdChange: (value: string) => void;
  onClientIdChange: (value: string) => void;
  onSectionsChange: (sections: FormSection[]) => void;
  onAddField: (sectionId: string, type: string) => void;
  onUpdateField: (sectionId: string, fieldId: string, patch: Partial<FormField>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onDuplicateField: (sectionId: string, fieldId: string) => void;
  onMoveField: (sectionId: string, fieldId: string, direction: 'up' | 'down') => void;
  onSave?: () => void;
  onPreview?: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  tplName,
  tplDesc,
  projId,
  clientId,
  sections,
  clients,
  onTplNameChange,
  onTplDescChange,
  onProjIdChange,
  onClientIdChange,
  onSectionsChange,
  onAddField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onMoveField,
  onSave,
  onPreview
}) => {
  // Helper: Validate for UUID format, returns true if valid UUID (version 4 typically)
  function isValidUUID(uuid: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Intercept the save, validate clientId, and pass a valid value
  const handleSave = () => {
    let safeClientId: string | null = null;
    if (clientId && clientId !== 'none') {
      safeClientId = isValidUUID(clientId) ? clientId : null;
      if (!safeClientId) {
        alert("Invalid Client ID. Please select a valid client.");
        return;
      }
    }
    // Call parent's onSave, but in your actual save implementation,
    // persist safeClientId (not raw clientId) as the value for clientId.
    // If additional save logic is present, adapt the following as needed!
    // If using a local save method, pass safeClientId instead of clientId.
    if (typeof onSave === "function") onSave();
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: Date.now().toString(),
      title: `Section ${sections.length + 1}`,
      description: '',
      fields: [],
      sortOrder: sections.length,
      collapsible: false,
      columns: 1
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    onSectionsChange(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const deleteSection = (sectionId: string) => {
    onSectionsChange(sections.filter(s => s.id !== sectionId));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newIndex = direction === 'up' ? Math.max(0, sectionIndex - 1) : Math.min(sections.length - 1, sectionIndex + 1);
    const newSections = [...sections];
    const [movedSection] = newSections.splice(sectionIndex, 1);
    newSections.splice(newIndex, 0, movedSection);

    // Update sort order
    newSections.forEach((section, index) => {
      section.sortOrder = index;
    });

    onSectionsChange(newSections);
  };

  const duplicateSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const duplicatedSection: FormSection = {
      ...section,
      id: Date.now().toString(),
      title: `${section.title} (Copy)`,
      sortOrder: sections.length,
      fields: section.fields.map(field => ({
        ...field,
        id: Date.now().toString() + Math.random(),
        name: `${field.name}_copy`
      }))
    };

    onSectionsChange([...sections, duplicatedSection]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Template Builder</h1>
              <p className="text-sm text-gray-600 mt-1">Create professional clinical forms with advanced features</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onPreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Field Palette Sidebar */}
          <div className="col-span-3">
            <FieldPalette sections={sections} onAddField={onAddField} />
          </div>

          {/* Main Canvas */}
          <div className="col-span-9 space-y-6">
            {/* Template Settings */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Template Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="template-name" className="text-sm font-medium">Template Name *</Label>
                    <Input
                      id="template-name"
                      value={tplName}
                      onChange={(e) => onTplNameChange(e.target.value)}
                      placeholder="Enter template name..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-id" className="text-sm font-medium">Project ID *</Label>
                    <Input
                      id="project-id"
                      value={projId}
                      onChange={(e) => onProjIdChange(e.target.value)}
                      placeholder="Enter project ID..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-desc" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="template-desc"
                    value={tplDesc}
                    onChange={(e) => onTplDescChange(e.target.value)}
                    placeholder="Describe the purpose of this form template..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="client-select" className="text-sm font-medium">Client Assignment</Label>
                  <Select value={clientId} onValueChange={onClientIdChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a client (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific client</SelectItem>
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
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Form Structure
                    <Badge variant="secondary" className="ml-2">
                      {sections.length} section{sections.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                  <Button onClick={addSection} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
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
                      Add Your First Section
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sections.map((section, index) => (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        isFirst={index === 0}
                        isLast={index === sections.length - 1}
                        onUpdate={(updates) => updateSection(section.id, updates)}
                        onDelete={() => deleteSection(section.id)}
                        onDuplicate={() => duplicateSection(section.id)}
                        onMove={(direction) => moveSection(section.id, direction)}
                        onUpdateField={onUpdateField}
                        onDeleteField={onDeleteField}
                        onDuplicateField={onDuplicateField}
                        onMoveField={onMoveField}
                        canDelete={sections.length > 1}
                      />
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

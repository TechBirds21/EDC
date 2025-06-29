import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableField } from './DynamicFormBuilder/TableField';
import { Plus, Save, Eye, Trash2, Copy } from 'lucide-react';
import { TableColumn, TableRow, FormField } from './FormBuilder/types';

interface TemplateField {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'table' | 'textarea';
  label: string;
  required: boolean;
  columns?: TableColumn[];
  sampleData?: TableRow[];
}

interface TemplateSection {
  id: string;
  title: string;
  fields: TemplateField[];
}

export const TemplateBuilderPage: React.FC = () => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [sections, setSections] = useState<TemplateSection[]>([
    {
      id: 'section1',
      title: 'Basic Information',
      fields: []
    }
  ]);
  const [activeTab, setActiveTab] = useState('builder');

  const addSection = () => {
    const newSection: TemplateSection = {
      id: `section${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const addTableField = (sectionId: string) => {
    const defaultColumns: TableColumn[] = [
      {
        id: 'col1',
        label: 'Item',
        type: 'text',
        required: true
      },
      {
        id: 'col2',
        label: 'Quantity',
        type: 'number',
        required: false
      },
      {
        id: 'col3',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Available', value: 'available' },
          { label: 'Out of Stock', value: 'out_of_stock' },
          { label: 'Discontinued', value: 'discontinued' }
        ],
        required: false
      }
    ];

    const newField: TemplateField = {
      id: `field${Date.now()}`,
      type: 'table',
      label: 'Data Table',
      required: false,
      columns: defaultColumns,
      sampleData: []
    };

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const addTextField = (sectionId: string) => {
    const newField: TemplateField = {
      id: `field${Date.now()}`,
      type: 'text',
      label: 'Text Field',
      required: false
    };

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const updateFieldTableData = (sectionId: string, fieldId: string, rows: TableRow[]) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId 
                ? { ...field, sampleData: rows }
                : field
            )
          }
        : section
    ));
  };

  const updateFieldTableColumns = (sectionId: string, fieldId: string, columns: TableColumn[]) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId 
                ? { ...field, columns }
                : field
            )
          }
        : section
    ));
  };

  const removeField = (sectionId: string, fieldId: string) => {
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
      const duplicatedField = {
        ...field,
        id: `field${Date.now()}`,
        label: `${field.label} (Copy)`
      };
      
      setSections(sections.map(section => 
        section.id === sectionId 
          ? { ...section, fields: [...section.fields, duplicatedField] }
          : section
      ));
    }
  };

  const handleSaveTemplate = () => {
    const template = {
      name: templateName,
      description: templateDescription,
      sections
    };
    console.log('Saving template:', template);
    // Here you would typically save to your backend
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Template Builder</h1>
          <p className="text-muted-foreground">Create and customize form templates with data tables</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('preview')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Description</Label>
                  <Input
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Enter template description..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{section.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => addTextField(section.id)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Text Field
                    </Button>
                    <Button size="sm" onClick={() => addTableField(section.id)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Data Table
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                    No fields added yet. Click "Add Text Field" or "Add Data Table" to get started.
                  </div>
                ) : (
                  section.fields.map((field) => (
                    <Card key={field.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-medium">{field.label}</h4>
                            <p className="text-sm text-muted-foreground">Type: {field.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => duplicateField(section.id, field.id)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => removeField(section.id, field.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {field.type === 'table' && field.columns && (
                          <TableField
                            id={field.id}
                            label={field.label}
                            columns={field.columns}
                            rows={field.sampleData || []}
                            value={field.sampleData || []}
                            onChange={(rows) => updateFieldTableData(section.id, field.id, rows)}
                            onBlur={() => {}}
                            allowAddRows={true}
                            allowEditColumns={true}
                            onColumnsChange={(columns) => updateFieldTableColumns(section.id, field.id, columns)}
                          />
                        )}

                        {field.type !== 'table' && (
                          <Input
                            value=""
                            placeholder={`Preview of ${field.label}`}
                            disabled
                            className="mt-2"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          ))}

          <Button onClick={addSection} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{templateName || 'Untitled Template'}</CardTitle>
              {templateDescription && (
                <p className="text-muted-foreground">{templateDescription}</p>
              )}
            </CardHeader>
            <CardContent>
              {sections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id}>
                        {field.type === 'table' && field.columns ? (
                          <TableField
                            id={`preview-${field.id}`}
                            label={field.label}
                            columns={field.columns}
                            rows={field.sampleData || []}
                            value={field.sampleData || []}
                            onChange={() => {}}
                            onBlur={() => {}}
                            allowAddRows={true}
                            allowEditColumns={false}
                          />
                        ) : (
                          <div>
                            <Label>{field.label}</Label>
                            <Input placeholder={`Enter ${field.label.toLowerCase()}...`} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

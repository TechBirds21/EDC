
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; 
import { FileText, Calendar, Hash, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Inline FormTemplate type, since it's not exported from types.ts
interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  client_id?: string;
  version: number;
  json_schema: any;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface TemplatePreviewProps {
  template: FormTemplate;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex gap-3 items-center">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {template.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="text-sm flex gap-4 mt-2">
            <Badge variant="outline">Project: {template.project_id}</Badge>
            <Badge variant="outline">Version: {template.version}</Badge>
            <Badge variant={template.is_active ? "default" : "secondary"}>
              {template.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Form Preview */}
      <div className="space-y-6">
        {template.json_schema?.sections?.map((section: any, sectionIndex: number) => (
          <Card key={sectionIndex} className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className={`grid ${section.columns ? `grid-cols-${section.columns}` : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {section.fields?.map((field: any, fieldIndex: number) => (
                  <div key={fieldIndex} className={`space-y-2 ${field.width === 'full' ? 'col-span-full' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <Badge variant="outline" className="text-xs">{field.type}</Badge>
                    </div>
                    
                    {renderFieldPreview(field)}
                    
                    <p className="text-xs text-gray-500">Field key: {field.name}</p>
                  </div>
                ))}
                
                {!section.fields?.length && (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No fields in this section
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!template.json_schema?.sections?.length && (
          <div className="text-center py-8 text-muted-foreground">
            <p>This template has no sections defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to render appropriate preview for each field type
const renderFieldPreview = (field: any) => {
  switch (field.type) {
    case 'text':
      return (
        <Input 
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
          disabled 
          className="bg-gray-50"
        />
      );
    
    case 'textarea':
      return (
        <Textarea 
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
          disabled 
          className="bg-gray-50"
          rows={field.rows || 3}
        />
      );
      
    case 'number':
      return (
        <div className="flex items-center">
          <Hash className="w-4 h-4 mr-2 text-gray-400" />
          <Input 
            type="number" 
            placeholder={field.placeholder || "0"} 
            disabled 
            className="bg-gray-50"
          />
        </div>
      );
      
    case 'date':
      return (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <Input 
            type="date" 
            disabled 
            className="bg-gray-50"
          />
        </div>
      );
      
    case 'select':
      return (
        <Select disabled>
          <SelectTrigger className="bg-gray-50">
            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option: any, index: number) => (
              <SelectItem 
                key={index} 
                value={typeof option === 'string' ? option : option.value}
              >
                {typeof option === 'string' ? option : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'radio':
      return (
        <div className="flex gap-4">
          {field.options?.map((option: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full border border-gray-300"></div>
              <span className="text-sm">
                {typeof option === 'string' ? option : option.label}
              </span>
            </div>
          ))}
        </div>
      );
      
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border border-gray-300"></div>
          <span className="text-sm">{field.label}</span>
        </div>
      );
      
    case 'table':
      return (
        <div className="border rounded overflow-hidden">
          <div className="bg-gray-100 p-2 text-sm font-medium grid grid-cols-4 gap-2">
            {field.columns?.map((column: any, index: number) => (
              <div key={index}>{column.label}</div>
            ))}
          </div>
          <div className="p-2 text-center text-sm text-gray-500">
            Table with {field.columns?.length || 0} columns
          </div>
        </div>
      );
      
    default:
      return (
        <Input 
          placeholder={`${field.type} field`} 
          disabled 
          className="bg-gray-50"
        />
      );
  }
};

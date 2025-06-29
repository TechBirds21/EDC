
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

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
    <>
      <div className="flex gap-3 items-center mb-4">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-medium">{template.name}</h3>
          <p className="text-sm text-muted-foreground">
            {template.description || 'No description'}
          </p>
        </div>
      </div>
      <div className="text-sm flex gap-4 mb-4">
        <span>Project: {template.project_id}</span>
        <span>Version: {template.version}</span>
        <span>Status: {template.is_active ? 'Active' : 'Inactive'}</span>
      </div>

      {template.json_schema?.sections?.map((sec: any, i: number) => (
        <Card key={i} className="mb-4">
          <CardHeader className="py-3">
            <CardTitle className="text-base">{sec.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sec.fields?.map((f: any, j: number) => (
                <div key={j} className="border p-3 rounded">
                  <div className="flex justify-between">
                    <div>
                      <Badge className="mb-1">{f.type}</Badge>
                      <h4>{f.label}</h4>
                      <p className="text-xs">Key: {f.key || f.name}</p>
                    </div>
                    {f.required && <Badge variant="outline">Required</Badge>}
                  </div>
                  {(f.type === 'select' || f.type === 'radio') && f.options && (
                    <div className="mt-2 text-xs">
                      Options: {Array.isArray(f.options) ? f.options.map((o: any) => typeof o === 'string' ? o : o.label).join(', ') : ''}
                    </div>
                  )}
                  {f.type === 'table' && f.columns && (
                    <div className="mt-2 text-xs">
                      Table: {f.defaultRows || f.rows || 0} rows × {f.columns.length} cols - Columns: {f.columns.map((c: any) => c.label).join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {!sec.fields?.length && (
                <p className="text-muted-foreground text-sm text-center py-4">No fields.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {!template.json_schema?.sections?.length && <p>No sections.</p>}
    </>
  );
};


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Copy, Trash2 } from 'lucide-react';

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  client_id?: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
}

interface TemplateListProps {
  templates: FormTemplate[];
  clients: Client[];
  search: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onPreview: (template: FormTemplate) => void;
  onEdit: (template: FormTemplate) => void;
  onDuplicate: (template: FormTemplate) => void;
  onDelete: (id: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  clients,
  search,
  loading,
  onSearchChange,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const visible = templates.filter(t =>
    [t.name, t.description || '', t.project_id].some(v =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">Loading…</CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No templates found.
          </CardContent>
        </Card>
      ) : (
        visible.map(t => (
          <Card key={t.id} className="my-4">
            <CardContent className="p-4 flex justify-between">
              <div>
                <h3 className="font-medium">{t.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.description && `${t.description} • `}Project: {t.project_id} • v{t.version}
                  {t.client_id && ` • Client: ${clients.find(c => c.id === t.client_id)?.name || '?'}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onPreview(t)}>
                  <Eye className="w-4 h-4 mr-1" />Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
                  <Edit className="w-4 h-4 mr-1" />Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(t)}>
                  <Copy className="w-4 h-4 mr-1" />Duplicate
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(t.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </>
  );
};

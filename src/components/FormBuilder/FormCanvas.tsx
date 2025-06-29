
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableConfigEditor } from './TableConfigEditor';
import type { FormSection, FormField } from './types';
import { OptionsEditor } from './OptionsEditor';
import { Button } from '@/components/ui/button';

interface FormCanvasProps {
  section: FormSection;
  onUpdateField: (fieldId: string, patch: Partial<FormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({ section, onUpdateField, onDeleteField, onDuplicateField, onMoveField }) => {
  return (
    <div className="space-y-4">
      {section.fields?.map(field => (
        <Card key={field.id} className="shadow-sm">
          <CardHeader>
            <CardTitle>{field.label || 'Untitled Field'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${field.id}-label`}>Label</Label>
                <Input
                  type="text"
                  id={`${field.id}-label`}
                  value={field.label || ''}
                  onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`${field.id}-name`}>Name</Label>
                <Input
                  type="text"
                  id={`${field.id}-name`}
                  value={field.name || ''}
                  onChange={(e) => onUpdateField(field.id, { name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${field.id}-type`}>Type</Label>
                <Select value={field.type} onValueChange={(value) => onUpdateField(field.id, { type: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`${field.id}-width`}>Width</Label>
                <Select value={field.width as any} onValueChange={(value) => onUpdateField(field.id, { width: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="half">Half</SelectItem>
                    <SelectItem value="third">One Third</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {field.type === 'textarea' && (
              <div>
                <Label htmlFor={`${field.id}-placeholder`}>Placeholder</Label>
                <Textarea
                  id={`${field.id}-placeholder`}
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
                />
              </div>
            )}

            {(field.type === 'select' || field.type === 'radio') && (
              <div>
                <OptionsEditor
                  options={field.options || []}
                  onUpdate={(newOptions) => onUpdateField(field.id, { options: newOptions })}
                />
              </div>
            )}

            {field.type === 'table' && (
              <div>
                <TableConfigEditor
                  tableConfig={field.tableConfig || { columns: [{ id: 'col1', label: 'Column 1', type: 'text' }] }}
                  onUpdate={(updates) => onUpdateField(field.id, { tableConfig: { ...field.tableConfig, ...updates } })}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={field.required || false}
                onCheckedChange={(checked) => onUpdateField(field.id, { required: checked })}
              />
              <Label htmlFor={`${field.id}-required`}>Required</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => onMoveField(field.id, 'up')}>Move Up</Button>
              <Button variant="outline" size="sm" onClick={() => onMoveField(field.id, 'down')}>Move Down</Button>
              <Button variant="outline" size="sm" onClick={() => onDuplicateField(field.id)}>Duplicate</Button>
              <Button variant="destructive" size="sm" onClick={() => onDeleteField(field.id)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

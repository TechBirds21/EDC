
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, GripVertical, Settings } from 'lucide-react';
import { FormField } from './types';
import { OptionsEditor } from './OptionsEditor';
import { TableConfigEditor } from './TableConfigEditor';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onDelete }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Determine which types need options (dropdown choices)
  const needsOptions = ['select', 'radio', 'matrix'].includes(field.type);

  // Table-like types for columns/headers editing
  const needsTableHeaders = ['table', 'matrix'].includes(field.type);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Badge variant="outline">{field.type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {field.type !== 'header' && (
            <>
              <div>
                <Label>Field Name</Label>
                <Input
                  value={field.name || ''}
                  onChange={e => onUpdate({ name: e.target.value })}
                  placeholder="Enter field programmatic name"
                />
              </div>
              <div>
                <Label>Display Label</Label>
                <Input
                  value={field.label || ''}
                  onChange={e => onUpdate({ label: e.target.value })}
                  placeholder="Enter display label for the field"
                />
              </div>
            </>
          )}
          {field.type === 'header' && (
            <div className="col-span-2">
              <Label>Header Text</Label>
              <Input
                value={field.label || ''}
                onChange={e => onUpdate({ label: e.target.value })}
                placeholder="Enter header text"
              />
            </div>
          )}
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Textarea: add placeholder and rows */}
            {field.type === 'textarea' && (
              <>
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={e => onUpdate({ placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                  />
                </div>
                <div>
                  <Label>Rows</Label>
                  <Input
                    type="number"
                    value={field.rows || 3}
                    onChange={e => onUpdate({ rows: parseInt(e.target.value) || 3 })}
                    placeholder="Rows"
                    min={1}
                    max={20}
                  />
                </div>
              </>
            )}

            {/* Options editor for select, radio, and matrix */}
            {needsOptions && (
              <OptionsEditor
                options={field.options || []}
                onUpdate={newOptions => onUpdate({ options: newOptions })}
              />
            )}

            {/* Table (and matrix) field: table/header editing */}
            {needsTableHeaders && (
              <TableConfigEditor
                tableConfig={field.tableConfig || {
                  columns: field.columns || [
                    { id: 'col1', label: 'Column 1', type: 'text' }
                  ],
                  defaultRows: 3
                }}
                onUpdate={(updates) => {
                  // Save to field.tableConfig (for table), or .columns (for matrix)
                  if (field.type === 'matrix') {
                    if (updates.columns) {
                      onUpdate({ columns: updates.columns });
                    }
                  } else {
                    onUpdate({ tableConfig: { ...field.tableConfig, ...updates }});
                  }
                }}
              />
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={field.required || false}
                onCheckedChange={checked => onUpdate({ required: checked })}
              />
              <Label>Required</Label>
            </div>
            
            <div>
              <Label>Width</Label>
              <Select
                value={field.width || 'full'}
                onValueChange={value => onUpdate({ width: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
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
        )}
      </CardContent>
    </Card>
  );
};

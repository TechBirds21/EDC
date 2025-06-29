import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, Plus, GripVertical, Settings, Eye, EyeOff,
  Type, Mail, Hash, Calendar, List, Radio, CheckSquare,
  FileText, Upload, Table, Star, Scale, Calculator,
  Clock, Link, Phone, ChevronDown, ChevronUp
} from 'lucide-react';
import { FormField, TableColumn } from '../FormBuilder/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const getFieldIcon = (type: string) => {
  const iconMap = {
    text: Type,
    email: Mail,
    number: Hash,
    date: Calendar,
    time: Clock,
    datetime: Calendar,
    select: List,
    radio: Radio,
    checkbox: CheckSquare,
    textarea: FileText,
    table: Table,
    file: Upload,
    signature: FileText,
    rating: Star,
    scale: Scale,
    range: Scale,
    calculation: Calculator,
    url: Link,
    tel: Phone,
    password: EyeOff,
    hidden: Eye,
    yesno: CheckSquare,
    matrix: Table
  };
  return iconMap[type as keyof typeof iconMap] || Type;
};

interface FieldEditorProps {
  field: FormField;
  sectionId: string;
  onUpdate: (sectionId: string, fieldId: string, patch: Partial<FormField>) => void;
  onDelete: (sectionId: string, fieldId: string) => void;
  onDuplicate: (sectionId: string, fieldId: string) => void;
  onMove: (sectionId: string, fieldId: string, direction: 'up' | 'down') => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  sectionId,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const Icon = getFieldIcon(field.type);

  const updateField = (updates: Partial<FormField>) => {
    onUpdate(sectionId, field.id, updates);
  };

  const addOption = () => {
    const newOption = {
      label: `Option ${(field.options?.length || 0) + 1}`,
      value: `option_${(field.options?.length || 0) + 1}`
    };
    updateField({ options: [...(field.options || []), newOption] });
  };

  const updateOption = (optionIndex: number, updates: Partial<{label: string, value: string}>) => {
    const updatedOptions = field.options?.map((opt, index) => 
      index === optionIndex ? { ...opt, ...updates } : opt
    ) || [];
    updateField({ options: updatedOptions });
  };

  const deleteOption = (optionIndex: number) => {
    const updatedOptions = field.options?.filter((_, index) => index !== optionIndex) || [];
    updateField({ options: updatedOptions });
  };

  const addTableColumn = () => {
    const newColumn: TableColumn = {
      id: Date.now().toString(),
      label: `Column ${(field.columns?.length || 0) + 1}`,
      type: 'text',
      required: false
    };
    updateField({ columns: [...(field.columns || []), newColumn] });
  };

  const updateColumn = (columnId: string, updates: Partial<TableColumn>) => {
    const updatedColumns = field.columns?.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    ) || [];
    updateField({ columns: updatedColumns });
  };

  const deleteColumn = (columnId: string) => {
    const updatedColumns = field.columns?.filter(col => col.id !== columnId) || [];
    updateField({ columns: updatedColumns });
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type);
  const needsTableColumns = ['table', 'matrix'].includes(field.type);
  const supportsValidation = ['text', 'email', 'number', 'tel', 'url'].includes(field.type);

  return (
    <Card className="mb-4 group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <div className="bg-primary/10 rounded-md p-1.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{field.label}</span>
                {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                <Badge variant="outline" className="text-xs">{field.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Key: {field.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onMove(sectionId, field.id, 'up')}>
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onMove(sectionId, field.id, 'down')}>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDuplicate(sectionId, field.id)}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(sectionId, field.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField({ label: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Field Key</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateField({ name: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Placeholder Text</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Help Text</Label>
                <Input
                  value={field.helpText || ''}
                  onChange={(e) => updateField({ helpText: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => updateField({ required: checked })}
                />
                <Label className="text-xs">Required</Label>
              </div>
              
              <div>
                <Label className="text-xs">Width</Label>
                <Select value={field.width || 'full'} onValueChange={(value) => updateField({ width: value as any })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Width</SelectItem>
                    <SelectItem value="half">Half Width</SelectItem>
                    <SelectItem value="third">Third Width</SelectItem>
                    <SelectItem value="quarter">Quarter Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {field.type === 'textarea' && (
                <div>
                  <Label className="text-xs">Rows</Label>
                  <Input
                    type="number"
                    value={field.rows || 3}
                    onChange={(e) => updateField({ rows: parseInt(e.target.value) || 3 })}
                    className="h-8"
                    min="1"
                    max="10"
                  />
                </div>
              )}
            </div>

            {/* Options for select/radio/checkbox fields */}
            {needsOptions && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Options</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, { label: e.target.value })}
                        placeholder="Option label"
                        className="h-8"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(index, { value: e.target.value })}
                        placeholder="Option value"
                        className="h-8"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteOption(index)}
                        disabled={field.options?.length === 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table columns for table/matrix fields */}
            {needsTableColumns && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Table Columns</Label>
                  <Button variant="outline" size="sm" onClick={addTableColumn}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Column
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(field.columns || []).map((column) => (
                    <div key={column.id} className="flex gap-2">
                      <Input
                        value={column.label}
                        onChange={(e) => updateColumn(column.id, { label: e.target.value })}
                        placeholder="Column label"
                        className="h-8"
                      />
                      <Select value={column.type} onValueChange={(value) => updateColumn(column.id, { type: value as any })}>
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteColumn(column.id)}
                        disabled={field.columns?.length === 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Advanced Settings
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Validation Rules */}
                {supportsValidation && (
                  <div>
                    <Label className="text-xs">Validation</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {field.type === 'number' && (
                        <>
                          <Input
                            type="number"
                            placeholder="Min value"
                            value={field.validation?.min || ''}
                            onChange={(e) => updateField({ 
                              validation: { 
                                ...field.validation, 
                                min: e.target.value ? parseInt(e.target.value) : undefined 
                              } 
                            })}
                            className="h-8"
                          />
                          <Input
                            type="number"
                            placeholder="Max value"
                            value={field.validation?.max || ''}
                            onChange={(e) => updateField({ 
                              validation: { 
                                ...field.validation, 
                                max: e.target.value ? parseInt(e.target.value) : undefined 
                              } 
                            })}
                            className="h-8"
                          />
                        </>
                      )}
                      {field.type === 'text' && (
                        <Input
                          placeholder="Pattern (regex)"
                          value={field.validation?.pattern || ''}
                          onChange={(e) => updateField({ 
                            validation: { 
                              ...field.validation, 
                              pattern: e.target.value 
                            } 
                          })}
                          className="h-8 col-span-2"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Default Value */}
                <div>
                  <Label className="text-xs">Default Value</Label>
                  <Input
                    value={field.defaultValue || ''}
                    onChange={(e) => updateField({ defaultValue: e.target.value })}
                    className="h-8"
                  />
                </div>

                {/* Calculation Formula */}
                {field.type === 'calculation' && (
                  <div>
                    <Label className="text-xs">Formula</Label>
                    <Textarea
                      value={field.calculation?.formula || ''}
                      onChange={(e) => updateField({ 
                        calculation: { 
                          ...field.calculation, 
                          formula: e.target.value,
                          fields: field.calculation?.fields || []
                        } 
                      })}
                      placeholder="e.g., field1 + field2 * 0.1"
                      rows={2}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

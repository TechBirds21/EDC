import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  GripVertical,
  Plus,
  Settings2,
  Eye,
  EyeOff
} from 'lucide-react';
import { FormField, FormSection } from '../FormBuilder/types';
import { FieldEditor } from './FieldEditor';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SectionEditorProps {
  section: FormSection;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updates: Partial<FormSection>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onUpdateField: (sectionId: string, fieldId: string, patch: Partial<FormField>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onDuplicateField: (sectionId: string, fieldId: string) => void;
  onMoveField: (sectionId: string, fieldId: string, direction: 'up' | 'down') => void;
  canDelete: boolean;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onMoveField,
  canDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fieldCount = section.fields.length;

  const duplicateField = (fieldId: string) => {
    onDuplicateField(section.id, fieldId);
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    onMoveField(section.id, fieldId, direction);
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Input
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                  placeholder="Section title..."
                />
                <Badge variant="secondary" className="text-xs">
                  {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                </Badge>
              </div>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMove('up')}
              disabled={isFirst}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMove('down')}
              disabled={isLast}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={!canDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Section Settings */}
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleContent className="pt-4 space-y-4">
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={section.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Optional section description..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Layout Columns</Label>
                  <Select 
                    value={section.columns?.toString() || '1'} 
                    onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={section.collapsible || false}
                    onCheckedChange={(checked) => onUpdate({ collapsible: checked })}
                  />
                  <Label className="text-xs">Collapsible Section</Label>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {section.fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-2">No fields in this section</p>
                <p className="text-xs text-gray-400">Add fields from the palette on the left</p>
              </div>
            ) : (
              <div className="space-y-4">
                {section.fields.map((field, index) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    sectionId={section.id}
                    onUpdate={onUpdateField}
                    onDelete={onDeleteField}
                    onDuplicate={duplicateField}
                    onMove={moveField}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

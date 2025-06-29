// components/FormBuilder/SortableItem.tsx
import React, { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MoveVertical,
  Trash2,
  Copy,
  Type,
  Table as TableIcon,
  Grid,
  Hash,
  Calendar,
  Mail,
  Phone,
  FileText,
  ListFilter,
  Upload as FileUp,
  PenTool,
  Sliders,
  Star,
  Repeat,
  SeparatorHorizontal,
  Columns,
} from 'lucide-react';

// ------------------------------------------------------------------
// INLINE TYPES
// ------------------------------------------------------------------
type FormFieldType =
  | 'text' | 'number' | 'date' | 'email' | 'phone'
  | 'textarea' | 'select' | 'radio' | 'checkbox'
  | 'file' | 'signature' | 'slider' | 'rating'
  | 'table' | 'matrix' | 'repeating-group'
  | 'page-break' | 'column-break';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  conditionalLogic?: { dependsOn?: string; value?: string };
  calculation?: { formula?: string };
}

// ------------------------------------------------------------------
// ICON HELPER
// ------------------------------------------------------------------
const getFieldIcon = (type: FormFieldType) => {
  switch (type) {
    case 'text': return <Type className="w-4 h-4" />;
    case 'number': return <Hash className="w-4 h-4" />;
    case 'date': return <Calendar className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'phone': return <Phone className="w-4 h-4" />;
    case 'textarea': return <FileText className="w-4 h-4" />;
    case 'select':
    case 'radio':
    case 'checkbox': return <ListFilter className="w-4 h-4" />;
    case 'file': return <FileUp className="w-4 h-4" />;
    case 'signature': return <PenTool className="w-4 h-4" />;
    case 'slider': return <Sliders className="w-4 h-4" />;
    case 'rating': return <Star className="w-4 h-4" />;
    case 'table': return <TableIcon className="w-4 h-4" />;
    case 'matrix': return <Grid className="w-4 h-4" />;
    case 'repeating-group': return <Repeat className="w-4 h-4" />;
    case 'page-break': return <SeparatorHorizontal className="w-4 h-4" />;
    case 'column-break': return <Columns className="w-4 h-4" />;
    default: return <Type className="w-4 h-4" />;
  }
};

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------
interface SortableItemProps {
  id: string;
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id, field, isSelected, onSelect, onDelete, onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  const renderFieldPreview = useCallback(() => {
    switch (field.type) {
      case 'text':
        return <Input disabled placeholder={field.placeholder ?? field.label} />;
      case 'number':
        return <Input type="number" disabled placeholder={field.placeholder ?? field.label} />;
      case 'date':
        return <Input type="date" disabled />;
      case 'email':
        return <Input type="email" disabled placeholder={field.placeholder ?? 'you@site.com'} />;
      case 'phone':
        return <Input type="tel" disabled placeholder={field.placeholder ?? '123-456-7890'} />;
      case 'textarea':
        return <Textarea disabled rows={2} placeholder={field.placeholder ?? field.label} />;
      case 'select':
        return (
          <select disabled className="w-full p-2 border rounded bg-gray-100">
            <option>{field.placeholder ?? 'Select…'}</option>
            {field.options?.map(o => <option key={o}>{o}</option>)}
          </select>
        );
      case 'radio':
      case 'checkbox':
        return (
          <div className="space-y-1">
            {(field.options ?? ['Option 1','Option 2']).map(o => (
              <label key={o} className="flex items-center space-x-2 text-sm">
                <input type={field.type} disabled name={field.id} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed rounded p-4 text-center bg-gray-50">
            <FileUp className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Upload file</p>
          </div>
        );
      case 'signature':
        return (
          <div className="border rounded p-4 text-center bg-gray-50">
            <PenTool className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Signature</p>
          </div>
        );
      case 'slider':
        return <input type="range" disabled className="w-full py-2" />;
      case 'rating':
        return (
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_,i) => (
              <Star key={i} className="text-gray-300" />
            ))}
          </div>
        );
      case 'table':
      case 'matrix':
        return (
          <div className="border rounded p-2 space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="capitalize text-sm">{field.type}</span>
              <Button size="sm" variant="ghost" disabled>Add Col</Button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-1 border">A</th>
                  <th className="p-1 border">B</th>
                  <th className="p-1">C</th>
                </tr>
              </thead>
              <tbody>
                {[1,2].map(r => (
                  <tr key={r} className="border-t">
                    <td className="p-1 border">r{r}-A</td>
                    <td className="p-1 border">r{r}-B</td>
                    <td className="p-1">r{r}-C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'repeating-group':
        return (
          <div className="border rounded p-2 space-y-1">
            <div className="flex justify-between border-b pb-1">
              <span className="text-sm">Repeating</span>
              <Button size="sm" variant="ghost" disabled>Add</Button>
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 p-1 rounded">
              Placeholder items…
            </p>
          </div>
        );
      case 'page-break':
        return (
          <div className="border-t-2 border-dashed py-1 text-center">
            <span className="bg-white px-2 text-xs text-gray-500">Page Break</span>
          </div>
        );
      case 'column-break':
        return (
          <div className="grid grid-cols-2 gap-1">
            <div className="border rounded p-1 text-center text-xs bg-gray-50">Col 1</div>
            <div className="border rounded p-1 text-center text-xs bg-gray-50">Col 2</div>
          </div>
        );
      default:
        return <Input disabled placeholder={field.label} />;
    }
  }, [field]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isSelected ? 'ring-2 ring-blue-500' : undefined}
      onClick={onSelect}
    >
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab p-1 hover:bg-gray-100 rounded"
              >
                <MoveVertical />
              </div>
              <div className="ml-2 flex items-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  {getFieldIcon(field.type)}
                </span>
                <Label className="ml-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={e => { e.stopPropagation(); onDuplicate(); }}
              >
                <Copy />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>

          {renderFieldPreview()}

          {field.conditionalLogic?.dependsOn && (
            <p className="mt-2 text-xs bg-blue-50 text-blue-600 p-1 rounded">
              Show when “{field.conditionalLogic.dependsOn}” = “{field.conditionalLogic.value}”
            </p>
          )}
          {field.calculation?.formula && (
            <p className="mt-2 text-xs bg-purple-50 text-purple-600 p-1 rounded">
              Calc: {field.calculation.formula}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { 
  FileText, 
  CalendarIcon, 
  ListFilter,
  Table,
  Grid3X3,
  Type, 
  Hash, 
  Mail, 
  Phone, 
  FileUp, 
  PenTool, 
  Sliders, 
  Star, 
  Repeat, 
  SeparatorHorizontal, 
  Columns 
} from 'lucide-react';

interface WidgetItem {
  type: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

interface WidgetCategory {
  title: string;
  widgets: WidgetItem[];
}

interface WidgetPaletteProps {
  onAddWidget: (type: string) => void;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onAddWidget }) => {
  const categories: WidgetCategory[] = [
    {
      title: 'Basic',
      widgets: [
        { type: 'text', label: 'Text Input', icon: Type },
        { type: 'number', label: 'Number', icon: Hash },
        { type: 'date', label: 'Date', icon: CalendarIcon },
        { type: 'email', label: 'Email', icon: Mail },
        { type: 'phone', label: 'Phone', icon: Phone },
        { type: 'textarea', label: 'Text Area', icon: FileText },
      ]
    },
    {
      title: 'Advanced',
      widgets: [
        { type: 'select', label: 'Dropdown', icon: ListFilter },
        { type: 'radio', label: 'Radio Group', icon: ListFilter },
        { type: 'checkbox', label: 'Checkbox', icon: ListFilter },
        { type: 'file', label: 'File Upload', icon: FileUp },
        { type: 'signature', label: 'Signature', icon: PenTool },
        { type: 'slider', label: 'Slider', icon: Sliders },
        { type: 'rating', label: 'Rating', icon: Star }
      ]
    },
    {
      title: 'Tables & Matrices',
      widgets: [
        { type: 'table', label: 'Data Table', icon: Table },
        { type: 'matrix', label: 'Matrix', icon: Grid3X3 }
      ]
    },
    {
      title: 'Layout',
      widgets: [
        { type: 'repeating-group', label: 'Repeating Group', icon: Repeat },
        { type: 'page-break', label: 'Page Break', icon: SeparatorHorizontal },
        { type: 'column-break', label: 'Column Layout', icon: Columns },
      ]
    }
  ];
  
  return (
    <div className="p-4 space-y-6">
      {categories.map((category) => (
        <div key={category.title}>
          <h3 className="font-medium text-sm mb-2">{category.title}</h3>
          <div className="space-y-1">
            {category.widgets.map((widget) => (
              <div 
                key={widget.type}
                className="flex items-center p-2 rounded hover:bg-slate-200 cursor-pointer"
                onClick={() => onAddWidget(widget.type)}
              >
                <widget.icon className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm">{widget.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

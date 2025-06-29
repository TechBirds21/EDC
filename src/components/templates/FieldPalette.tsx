import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Type, 
  Hash, 
  Calendar,
  Mail,
  FileText,
  List,
  CheckSquare,
  Radio,
  Upload,
  Table,
  Star,
  Scale,
  Calculator,
  Clock,
  Link,
  Phone,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { FormSection } from '../FormBuilder/types';

const fieldTypes = [
  // Basic Input Fields
  { 
    category: 'Basic Fields',
    fields: [
      { value: 'text', label: 'Text Input', icon: Type, description: 'Single line text input' },
      { value: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text input' },
      { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input with validation' },
      { value: 'email', label: 'Email', icon: Mail, description: 'Email address with validation' },
      { value: 'tel', label: 'Phone', icon: Phone, description: 'Phone number input' },
      { value: 'url', label: 'Website URL', icon: Link, description: 'URL input with validation' },
      { value: 'password', label: 'Password', icon: EyeOff, description: 'Hidden text input' },
      { value: 'hidden', label: 'Hidden Field', icon: Eye, description: 'Hidden field for calculations' },
    ]
  },
  // Date and Time Fields
  {
    category: 'Date & Time',
    fields: [
      { value: 'date', label: 'Date Picker', icon: Calendar, description: 'Date selection' },
      { value: 'time', label: 'Time Picker', icon: Clock, description: 'Time selection' },
      { value: 'datetime', label: 'Date & Time', icon: Calendar, description: 'Date and time selection' },
    ]
  },
  // Choice Fields
  {
    category: 'Choice Fields',
    fields: [
      { value: 'select', label: 'Dropdown', icon: List, description: 'Single selection dropdown' },
      { value: 'radio', label: 'Radio Buttons', icon: Radio, description: 'Single selection radio buttons' },
      { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple selections' },
      { value: 'yesno', label: 'Yes/No', icon: CheckSquare, description: 'Simple yes/no choice' },
    ]
  },
  // Advanced Fields
  {
    category: 'Advanced Fields',
    fields: [
      { value: 'table', label: 'Data Table', icon: Table, description: 'Dynamic table with rows/columns' },
      { value: 'matrix', label: 'Matrix/Grid', icon: Table, description: 'Question matrix grid' },
      { value: 'file', label: 'File Upload', icon: Upload, description: 'File attachment' },
      { value: 'signature', label: 'Signature', icon: FileText, description: 'Digital signature pad' },
      { value: 'rating', label: 'Star Rating', icon: Star, description: 'Star rating selection' },
      { value: 'scale', label: 'Scale/Slider', icon: Scale, description: 'Numeric scale slider' },
      { value: 'range', label: 'Range Slider', icon: Scale, description: 'Min-max range selection' },
      { value: 'calculation', label: 'Calculated Field', icon: Calculator, description: 'Auto-calculated value' },
    ]
  }
];

interface FieldPaletteProps {
  sections: FormSection[];
  onAddField: (sectionId: string, type: string) => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ sections, onAddField }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFieldTypes = fieldTypes.map(category => ({
    ...category,
    fields: category.fields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.fields.length > 0);

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Field Library
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {filteredFieldTypes.map((category) => (
          <div key={category.category}>
            <h4 className="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              {category.category}
            </h4>
            <div className="space-y-2">
              {category.fields.map((field) => {
                const IconComponent = field.icon;
                return (
                  <div key={field.value} className="border rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="bg-primary/10 rounded p-1">
                        <IconComponent className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs leading-none mb-1">{field.label}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{field.description}</p>
                      </div>
                    </div>
                    
                    {sections.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {sections.map((section) => (
                          <Button
                            key={section.id}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => onAddField(section.id, field.value)}
                          >
                            Add to {section.title}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {sections.length === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Create a section first
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {filteredFieldTypes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No fields found</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

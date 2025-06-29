
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: string[];
}

interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  required?: boolean;
  options?: string[];
  width?: string;
  placeholder?: string;
  tableConfig?: {
    columns: TableColumn[];
    defaultRows?: number;
  };
}

interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormPreviewProps {
  formName: string;
  sections: FormSection[];
}

export const FormPreview: React.FC<FormPreviewProps> = ({ formName, sections }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tableData, setTableData] = useState<Record<string, any[]>>({});

  const getWidthClass = (width: string) => {
    switch (width) {
      case 'quarter': return 'w-1/4';
      case 'third': return 'w-1/3';
      case 'half': return 'w-1/2';
      default: return 'w-full';
    }
  };

  const addTableRow = (fieldId: string, columns: TableColumn[]) => {
    const newRow: any = { id: Date.now().toString() };
    columns.forEach(col => {
      newRow[col.id] = col.type === 'checkbox' ? false : '';
    });
    
    setTableData(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), newRow]
    }));
  };

  const removeTableRow = (fieldId: string, rowIndex: number) => {
    setTableData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId]?.filter((_, index) => index !== rowIndex) || []
    }));
  };

  const updateTableCell = (fieldId: string, rowIndex: number, columnId: string, value: any) => {
    setTableData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId]?.map((row, index) => 
        index === rowIndex ? { ...row, [columnId]: value } : row
      ) || []
    }));
  };

  const renderTableField = (field: FormField) => {
    const columns = field.tableConfig?.columns || [];
    const rows = tableData[field.id] || [];

    // Initialize with default rows if empty
    if (rows.length === 0 && field.tableConfig?.defaultRows) {
      const defaultRows = [];
      for (let i = 0; i < field.tableConfig.defaultRows; i++) {
        const row: any = { id: `default_${i}` };
        columns.forEach(col => {
          row[col.id] = col.type === 'checkbox' ? false : '';
        });
        defaultRows.push(row);
      }
      setTableData(prev => ({ ...prev, [field.id]: defaultRows }));
    }

    return (
      <div>
        <Label className="text-sm font-medium mb-2 block">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th key={column.id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {column.label}
                  </th>
                ))}
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-t">
                  {columns.map(column => (
                    <td key={column.id} className="px-3 py-2">
                      {column.type === 'text' && (
                        <Input
                          value={row[column.id] || ''}
                          onChange={(e) => updateTableCell(field.id, rowIndex, column.id, e.target.value)}
                          placeholder={`Enter ${column.label.toLowerCase()}`}
                          className="h-8"
                        />
                      )}
                      {column.type === 'number' && (
                        <Input
                          type="number"
                          value={row[column.id] || ''}
                          onChange={(e) => updateTableCell(field.id, rowIndex, column.id, e.target.value)}
                          className="h-8"
                        />
                      )}
                      {column.type === 'date' && (
                        <Input
                          type="date"
                          value={row[column.id] || ''}
                          onChange={(e) => updateTableCell(field.id, rowIndex, column.id, e.target.value)}
                          className="h-8"
                        />
                      )}
                      {column.type === 'select' && (
                        <Select
                          value={row[column.id] || ''}
                          onValueChange={(value) => updateTableCell(field.id, rowIndex, column.id, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {column.options?.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {column.type === 'checkbox' && (
                        <input
                          type="checkbox"
                          checked={row[column.id] || false}
                          onChange={(e) => updateTableCell(field.id, rowIndex, column.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTableRow(field.id, rowIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-2 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTableRow(field.id, columns)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderField = (field: FormField) => {
    const widthClass = getWidthClass(field.width || 'full');

    if (field.type === 'header') {
      return (
        <div key={field.id} className={`${widthClass} mb-4`}>
          <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
        </div>
      );
    }

    if (field.type === 'table') {
      return (
        <div key={field.id} className={`${widthClass} p-2`}>
          {renderTableField(field)}
        </div>
      );
    }

    return (
      <div key={field.id} className={`${widthClass} p-2`}>
        <Label className="text-sm font-medium mb-2 block">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.type === 'text' && (
          <Input
            value={formData[field.name] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.placeholder}
          />
        )}
        
        {field.type === 'textarea' && (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.placeholder}
            rows={3}
          />
        )}
        
        {field.type === 'date' && (
          <Input
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          />
        )}
        
        {field.type === 'time' && (
          <Input
            type="time"
            value={formData[field.name] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          />
        )}
        
        {field.type === 'radio' && field.options && (
          <RadioGroup
            value={formData[field.name] || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
            className="flex gap-4"
          >
            {field.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {field.type === 'select' && field.options && (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{formName || 'Form Preview'}</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.map((section) => (
            <div key={section.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-6 pb-2 border-b">{section.title}</h3>
              <div className="flex flex-wrap -mx-2">
                {section.fields.map((field) => renderField(field))}
              </div>
            </div>
          ))}
          
          <div className="mt-8 pt-4 border-t">
            <Button className="w-full" size="lg">
              Submit Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

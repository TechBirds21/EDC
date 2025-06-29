
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertCircle, 
  Check, 
  ChevronDown,
  Plus,
  Info, 
  Loader2 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VolunteerContext } from '@/contexts/VolunteerContext';
import { TableField } from './TableField';
import { useValidatedDate } from '@/hooks/useValidatedDate';

// Types
interface FormTemplate {
  id: string;
  name: string;
  sections: Section[];
  side_headers?: SideHeader[];
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface SideHeader {
  id: string;
  title: string;
  fields: string[]; // Field IDs that this header applies to
}

interface Field {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'textarea' | 'table' | 'matrix';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[] | { label: string; value: string }[];
  validation?: any;
  columns?: any[];
  rows?: any[];
  allowAddRows?: boolean;
}

interface ChangeReason {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

interface DynamicFormBuilderProps {
  template: FormTemplate;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  formId?: string;
}

// API functions
const patchFormField = async ({ formId, field, value, reason }: { 
  formId: string; 
  field: string; 
  value: any; 
  reason: string;
}) => {
  const response = await fetch(`/api/forms/${formId}/field`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ field, value, reason }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update form field');
  }
  
  return response.json();
};

const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({ 
  template, 
  data, 
  onChange,
  formId 
}) => {
  const { volunteerId, screeningDate } = useContext(VolunteerContext);
  const [localData, setLocalData] = useState<Record<string, any>>(data || {});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [changeReasonModal, setChangeReasonModal] = useState<{
    isOpen: boolean;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>({
    isOpen: false,
    field: '',
    oldValue: null,
    newValue: null,
    reason: '',
  });
  
  const validateDate = useValidatedDate(screeningDate);
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLDivElement>(null);
  
  // Update local data when prop data changes
  useEffect(() => {
    setLocalData(data || {});
  }, [data]);
  
  // Mutation for patching form field
  const patchMutation = useMutation({
    mutationFn: patchFormField,
    onSuccess: (data) => {
      // Remove field from dirty fields
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(changeReasonModal.field);
        return newSet;
      });
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      
      // Close modal
      setChangeReasonModal(prev => ({ ...prev, isOpen: false, reason: '' }));
    },
    onError: (error) => {
      console.error('Failed to update form field:', error);
    }
  });
  
  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setLocalData(prev => {
      const newData = { ...prev, [fieldId]: value };
      onChange(newData);
      return newData;
    });
    
    // Mark field as dirty
    setDirtyFields(prev => new Set(prev).add(fieldId));
  };
  
  // Handle field blur (autosave)
  const handleFieldBlur = (fieldId: string) => {
    if (!dirtyFields.has(fieldId) || !formId) return;
    
    const oldValue = data?.[fieldId];
    const newValue = localData[fieldId];
    
    // If value hasn't changed, don't do anything
    if (oldValue === newValue) {
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
      return;
    }
    
    // Open change reason modal
    setChangeReasonModal({
      isOpen: true,
      field: fieldId,
      oldValue,
      newValue,
      reason: '',
    });
  };
  
  // Handle change reason submission
  const handleChangeReasonSubmit = () => {
    if (!formId || !changeReasonModal.reason.trim()) return;
    
    patchMutation.mutate({
      formId,
      field: changeReasonModal.field,
      value: changeReasonModal.newValue,
      reason: changeReasonModal.reason,
    });
  };
  
  // Render field based on type
  const renderField = (field: Field, sectionId: string) => {
    const fieldId = `${sectionId}.${field.id}`;
    const value = localData[fieldId] || '';
    const isDirty = dirtyFields.has(fieldId);
    
    // Special handling for table/matrix fields
    if (field.type === 'table' || field.type === 'matrix') {
      return (
        <div key={fieldId} className="space-y-2">
          <TableField
            id={fieldId}
            label={field.label}
            columns={field.columns || []}
            rows={field.rows || []}
            value={value || []}
            onChange={(val) => handleFieldChange(fieldId, val)}
            onBlur={() => handleFieldBlur(fieldId)}
            allowAddRows={field.allowAddRows !== false}
            isDirty={isDirty}
          />
        </div>
      );
    }
    
    const commonProps = {
      id: fieldId,
      value,
      onChange: (e: any) => handleFieldChange(fieldId, e.target.value),
      onBlur: () => handleFieldBlur(fieldId),
      required: field.required,
      placeholder: field.placeholder,
      className: `w-full ${isDirty ? 'border-amber-500' : ''}`,
    };
    
    switch (field.type) {
      case 'text':
        return <Input type="text" {...commonProps} />;
        
      case 'number':
        return <Input type="number" {...commonProps} />;
        
      case 'date':
        return (
          <Input 
            type="date" 
            {...commonProps} 
            min={validateDate.minDate} 
            onChange={(e) => {
              if (validateDate.isValid(e.target.value)) {
                handleFieldChange(fieldId, e.target.value);
              }
            }}
          />
        );
        
      case 'textarea':
        return <Textarea {...commonProps} rows={4} />;
        
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleFieldChange(fieldId, val)}
            onOpenChange={() => {
              if (value !== localData[fieldId]) {
                handleFieldBlur(fieldId);
              }
            }}
          >
            <SelectTrigger className={isDirty ? 'border-amber-500' : ''}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                
                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
        
      case 'radio':
        return (
          <RadioGroup 
            value={value} 
            onValueChange={(val) => {
              handleFieldChange(fieldId, val);
              handleFieldBlur(fieldId);
            }}
            className="flex flex-col space-y-1"
          >
            {(field.options || []).map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <div key={optionValue} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionValue} id={`${fieldId}-${optionValue}`} />
                  <Label htmlFor={`${fieldId}-${optionValue}`}>{optionLabel}</Label>
                </div>
              );
            })}
          </RadioGroup>
        );
        
      default:
        return <Input type="text" {...commonProps} />;
    }
  };
  
  // Find side header for a field
  const getSideHeaderForField = (sectionId: string, fieldId: string) => {
    if (!template.side_headers) return null;
    
    const fullFieldId = `${sectionId}.${fieldId}`;
    return template.side_headers.find(header => 
      header.fields.includes(fullFieldId)
    );
  };
  
  return (
    <div className="relative" ref={formRef}>
      {/* Side Headers */}
      {template.side_headers && (
        <div className="sticky left-0 w-44 bg-white z-10 border-r border-gray-200 h-full">
          {template.sections.map((section) => (
            <div key={section.id} className="py-4">
              <h3 className="font-medium text-sm px-4 mb-2">{section.title}</h3>
              {section.fields.map((field) => {
                const sideHeader = getSideHeaderForField(section.id, field.id);
                if (!sideHeader) return null;
                
                return (
                  <div 
                    key={`${section.id}.${field.id}`} 
                    className="px-4 py-2 text-sm text-gray-600"
                  >
                    {sideHeader.title}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      
      {/* Main Form Content */}
      <div className={`${template.side_headers ? 'ml-44' : ''} p-4`}>
        {template.sections.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={`${section.id}.${field.id}`} className="flex items-center">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {dirtyFields.has(`${section.id}.${field.id}`) && (
                      <div className="flex items-center text-amber-500 text-xs">
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Unsaved
                      </div>
                    )}
                  </div>
                  {renderField(field, section.id)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Change Reason Modal */}
      <Dialog open={changeReasonModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          // If closing without saving, revert the field value
          setLocalData(prev => ({
            ...prev,
            [changeReasonModal.field]: changeReasonModal.oldValue
          }));
          setDirtyFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(changeReasonModal.field);
            return newSet;
          });
          setChangeReasonModal(prev => ({ ...prev, isOpen: false, reason: '' }));
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <div className="p-2 bg-gray-50 rounded border">
                {changeReasonModal.field.split('.').pop()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Old Value</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {changeReasonModal.oldValue || '(empty)'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Value</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {changeReasonModal.newValue || '(empty)'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-reason">Reason for Change *</Label>
              <Textarea 
                id="change-reason"
                value={changeReasonModal.reason}
                onChange={(e) => setChangeReasonModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for this change"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                // Revert the field value
                setLocalData(prev => ({
                  ...prev,
                  [changeReasonModal.field]: changeReasonModal.oldValue
                }));
                setDirtyFields(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(changeReasonModal.field);
                  return newSet;
                });
                setChangeReasonModal(prev => ({ ...prev, isOpen: false, reason: '' }));
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleChangeReasonSubmit}
              disabled={!changeReasonModal.reason.trim() || patchMutation.isPending}
            >
              {patchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Change'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Status Indicator */}
      {patchMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md flex items-center">
          <Check className="mr-2 h-4 w-4" />
          Change saved successfully
        </div>
      )}
      
      {patchMutation.isError && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-md shadow-md flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          Failed to save change
        </div>
      )}
    </div>
  );
};

export default DynamicFormBuilder;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface OptionsEditorProps {
  options: { label: string; value: string }[];
  onUpdate: (options: { label: string; value: string }[]) => void;
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({ options, onUpdate }) => {
  const addOption = () => {
    const newOptions = [...options];
    newOptions.push({ label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` });
    onUpdate(newOptions);
  };

  const updateOption = (index: number, key: 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    onUpdate(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate(newOptions);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Options</Label>
        <Button size="sm" onClick={addOption}>
          <Plus className="w-4 h-4 mr-1" />
          Add Option
        </Button>
      </div>
      <div className="space-y-2">
        {(options || []).map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option.label}
              onChange={e => updateOption(index, 'label', e.target.value)}
              placeholder={`Option ${index + 1} label`}
            />
            <Input
              value={option.value}
              onChange={e => updateOption(index, 'value', e.target.value)}
              placeholder={`value_${index + 1}`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
              disabled={options.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

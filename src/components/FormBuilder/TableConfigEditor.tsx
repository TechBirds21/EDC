import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { TableColumn } from './types';
import { OptionsEditor } from './OptionsEditor';

interface TableConfig {
  columns: TableColumn[];
  defaultRows?: number;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
}

interface TableConfigEditorProps {
  tableConfig: TableConfig;
  onUpdate: (updates: Partial<TableConfig>) => void;
}

export const TableConfigEditor: React.FC<TableConfigEditorProps> = ({
  tableConfig,
  onUpdate,
}) => {
  const {
    columns,
    defaultRows = 1,
    allowAddRows = true,
    allowDeleteRows = true,
  } = tableConfig;

  const updateColumn = useCallback(
    (index: number, updates: Partial<TableColumn>) => {
      const newCols = [...columns];
      newCols[index] = { ...newCols[index], ...updates };
      onUpdate({ columns: newCols });
    },
    [columns, onUpdate],
  );

  const addColumn = useCallback(() => {
    const newCol: TableColumn = {
      id: `col_${Date.now()}`,
      label: 'New Column',
      type: 'text',
      required: false,
    };
    onUpdate({ columns: [...columns, newCol] });
  }, [columns, onUpdate]);

  const removeColumn = useCallback(
    (index: number) => {
      onUpdate({ columns: columns.filter((_, i) => i !== index) });
    },
    [columns, onUpdate],
  );

  const handleDefaultRowsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const n = parseInt(raw, 10);
      onUpdate({
        defaultRows:
          raw === ''
            ? undefined
            : isNaN(n)
            ? undefined
            : n < 1
            ? 1
            : n,
      });
    },
    [onUpdate],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-lg">Table Columns</Label>
        <Button size="sm" onClick={addColumn}>
          <Plus className="w-4 h-4 mr-1" /> Add Column
        </Button>
      </div>

      {/* Columns List */}
      <div className="space-y-4">
        {columns.map((col, idx) => (
          <Card key={col.id} className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Label */}
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  size="sm"
                  value={col.label}
                  onChange={(e) =>
                    updateColumn(idx, { label: e.target.value })
                  }
                  placeholder="Column label"
                />
              </div>

              {/* Type */}
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={col.type}
                  onValueChange={(value) =>
                    updateColumn(idx, {
                      type: value as TableColumn['type'],
                      // reset options if switching off "select"
                      options:
                        value === 'select'
                          ? col.options || [{ label: 'Option 1', value: 'opt1' }]
                          : undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Remove */}
              <div className="flex items-end justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeColumn(idx)}
                  disabled={columns.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* OptionsEditor if select */}
            {col.type === 'select' && (
              <div className="mt-3">
                <OptionsEditor
                  options={col.options || []}
                  onUpdate={(opts) => updateColumn(idx, { options: opts })}
                />
              </div>
            )}

            {/* Required toggle */}
            <div className="mt-3 flex items-center space-x-2">
              <Switch
                checked={col.required || false}
                onCheckedChange={(chk) => updateColumn(idx, { required: chk })}
              />
              <Label className="text-xs">Required</Label>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Settings */}
      <div className="grid grid-cols-3 gap-4">
        {/* Default Rows */}
        <div>
          <Label className="text-xs">Default Rows</Label>
          <Input
            type="number"
            size="sm"
            min={1}
            max={20}
            value={defaultRows.toString()}
            onChange={handleDefaultRowsChange}
          />
        </div>

        {/* Allow Add Rows */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={allowAddRows}
            onCheckedChange={(chk) => onUpdate({ allowAddRows: chk })}
          />
          <Label className="text-xs">Allow Add Rows</Label>
        </div>

        {/* Allow Delete Rows */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={allowDeleteRows}
            onCheckedChange={(chk) => onUpdate({ allowDeleteRows: chk })}
          />
          <Label className="text-xs">Allow Delete Rows</Label>
        </div>
      </div>
    </div>
  );
};

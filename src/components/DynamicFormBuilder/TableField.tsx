import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Settings, Edit } from 'lucide-react';
import { TableColumn, TableRow } from '../FormBuilder/types';

interface TableFieldProps {
  id: string;
  label: string;
  columns: TableColumn[];
  rows: TableRow[];
  value: TableRow[];
  onChange: (value: TableRow[]) => void;
  onBlur: () => void;
  allowAddRows?: boolean;
  allowEditColumns?: boolean;
  isDirty?: boolean;
  onColumnsChange?: (columns: TableColumn[]) => void;
}

export const TableField: React.FC<TableFieldProps> = ({
  id,
  label,
  columns: initialColumns,
  rows: initialRows,
  value,
  onChange,
  onBlur,
  allowAddRows = true,
  allowEditColumns = false,
  isDirty = false,
  onColumnsChange,
}) => {
  const [rows, setRows] = useState<TableRow[]>(value || initialRows || []);
  const [columns, setColumns] = useState<TableColumn[]>(initialColumns || []);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [newColumn, setNewColumn] = useState<Partial<TableColumn>>({
    label: '',
    type: 'text',
    required: false,
    options: []
  });
  
  const handleCellChange = (rowId: string, columnId: string, cellValue: any) => {
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: cellValue
          }
        };
      }
      return row;
    });
    
    setRows(updatedRows);
    onChange(updatedRows);
  };
  
  const addRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cells: columns.reduce((acc, column) => {
        acc[column.id] = column.type === 'checkbox' ? false : '';
        return acc;
      }, {} as Record<string, any>)
    };
    
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    onChange(updatedRows);
  };
  
  const removeRow = (rowId: string) => {
    const updatedRows = rows.filter(row => row.id !== rowId);
    setRows(updatedRows);
    onChange(updatedRows);
  };

  const addColumn = () => {
    if (!newColumn.label || !newColumn.type) return;
    
    const column: TableColumn = {
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: newColumn.label,
      type: newColumn.type as TableColumn['type'],
      required: newColumn.required || false,
      options: newColumn.type === 'select' ? newColumn.options || [] : undefined
    };
    
    const updatedColumns = [...columns, column];
    setColumns(updatedColumns);
    onColumnsChange?.(updatedColumns);
    
    // Add the new column to existing rows
    const updatedRows = rows.map(row => ({
      ...row,
      cells: {
        ...row.cells,
        [column.id]: column.type === 'checkbox' ? false : ''
      }
    }));
    setRows(updatedRows);
    onChange(updatedRows);
    
    // Reset form
    setNewColumn({ label: '', type: 'text', required: false, options: [] });
    setIsColumnDialogOpen(false);
  };

  const removeColumn = (columnId: string) => {
    const updatedColumns = columns.filter(col => col.id !== columnId);
    setColumns(updatedColumns);
    onColumnsChange?.(updatedColumns);
    
    // Remove the column from existing rows
    const updatedRows = rows.map(row => {
      const { [columnId]: removedColumn, ...remainingCells } = row.cells;
      return {
        ...row,
        cells: remainingCells
      };
    });
    setRows(updatedRows);
    onChange(updatedRows);
  };

  const updateColumn = (columnId: string, updates: Partial<TableColumn>) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    setColumns(updatedColumns);
    onColumnsChange?.(updatedColumns);
  };

  const duplicateRow = (rowId: string) => {
    const originalRow = rows.find(row => row.id === rowId);
    if (originalRow) {
      const newRow: TableRow = {
        id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cells: { ...originalRow.cells }
      };
      
      const updatedRows = [...rows, newRow];
      setRows(updatedRows);
      onChange(updatedRows);
    }
  };
  
  const renderCell = (row: TableRow, column: TableColumn) => {
    const cellValue = row.cells[column.id] || '';
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
            onBlur={onBlur}
            className="w-full min-w-[120px]"
            placeholder={column.label}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
            onBlur={onBlur}
            className="w-full min-w-[100px]"
            placeholder={column.label}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
            onBlur={onBlur}
            className="w-full min-w-[150px]"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
            onBlur={onBlur}
            className="w-full min-w-[200px]"
            rows={2}
            placeholder={column.label}
          />
        );
        
      case 'select':
        return (
          <Select
            value={cellValue}
            onValueChange={(value) => {
              handleCellChange(row.id, column.id, value);
              onBlur();
            }}
          >
            <SelectTrigger className="w-full min-w-[150px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={cellValue === true}
              onChange={(e) => {
                handleCellChange(row.id, column.id, e.target.checked);
                onBlur();
              }}
              className="h-4 w-4"
            />
          </div>
        );
        
      default:
        return (
          <Input
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
            onBlur={onBlur}
            className="w-full min-w-[120px]"
            placeholder={column.label}
          />
        );
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium">
            {label}
          </label>
          {isDirty && (
            <span className="text-amber-500 text-xs">Unsaved changes</span>
          )}
        </div>
        <div className="flex gap-2">
          {allowEditColumns && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColumnDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage Columns
            </Button>
          )}
          {allowAddRows && (
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th 
                  key={column.id} 
                  className="px-4 py-2 text-left text-sm font-medium border-b"
                  style={{ minWidth: column.width || '150px' }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {column.label}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    {allowEditColumns && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingColumn(column);
                            setNewColumn(column);
                            setIsColumnDialogOpen(true);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColumn(column.id)}
                          className="h-6 w-6 p-0"
                          disabled={columns.length <= 1}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {allowAddRows && (
                <th className="w-20 px-2 py-2 border-b">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${row.id}-${column.id}`} className="px-4 py-2">
                    {renderCell(row, column)}
                  </td>
                ))}
                {allowAddRows && (
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateRow(row.id)}
                        className="h-8 w-8 p-0"
                        title="Duplicate row"
                      >
                        <Plus className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        className="h-8 w-8 p-0"
                        title="Delete row"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            
            {rows.length === 0 && (
              <tr>
                <td 
                  colSpan={columns.length + (allowAddRows ? 1 : 0)} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No rows added yet. Click "Add Row" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add multiple rows at once */}
      {allowAddRows && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Quick add:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              for (let i = 0; i < 3; i++) {
                addRow();
              }
            }}
          >
            Add 3 Rows
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                addRow();
              }
            }}
          >
            Add 5 Rows
          </Button>
        </div>
      )}

      {/* Column Management Dialog */}
      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingColumn ? 'Edit Column' : 'Add New Column'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="column-label">Column Label</Label>
              <Input
                id="column-label"
                value={newColumn.label || ''}
                onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })}
                placeholder="Enter column label..."
              />
            </div>
            
            <div>
              <Label htmlFor="column-type">Column Type</Label>
              <Select 
                value={newColumn.type} 
                onValueChange={(value) => setNewColumn({ ...newColumn, type: value as TableColumn['type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newColumn.type === 'select' && (
              <div>
                <Label>Options (label,value per line)</Label>
                <Textarea
                  value={(newColumn.options || []).map(o => `${o.label},${o.value}`).join('\n')}
                  onChange={(e) => {
                    const newOptions = e.target.value.split('\n').map(line => {
                      const parts = line.split(',');
                      if (parts.length > 1) {
                        return { label: parts[0].trim(), value: parts[1].trim() };
                      }
                      return { label: line.trim(), value: line.trim() };
                    }).filter(o => o.label && o.value);
                    setNewColumn({ 
                      ...newColumn, 
                      options: newOptions
                    });
                  }}
                  placeholder="Label 1,value_1&#10;Label 2,value_2"
                  rows={4}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="column-required"
                checked={newColumn.required || false}
                onChange={(e) => setNewColumn({ ...newColumn, required: e.target.checked })}
              />
              <Label htmlFor="column-required">Required field</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsColumnDialogOpen(false);
                  setEditingColumn(null);
                  setNewColumn({ label: '', type: 'text', required: false, options: [] });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (editingColumn) {
                    updateColumn(editingColumn.id, newColumn);
                    setEditingColumn(null);
                  } else {
                    addColumn();
                  }
                  setIsColumnDialogOpen(false);
                  setNewColumn({ label: '', type: 'text', required: false, options: [] });
                }}
                disabled={!newColumn.label}
              >
                {editingColumn ? 'Update Column' : 'Add Column'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

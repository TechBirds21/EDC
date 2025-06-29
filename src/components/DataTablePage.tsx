import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableField } from './DynamicFormBuilder/TableField';
import { Save, Plus, Settings } from 'lucide-react';
import { TableColumn, TableRow } from './FormBuilder/types';

interface DataTablePageProps {
  title?: string;
  description?: string;
  initialColumns?: TableColumn[];
  initialRows?: TableRow[];
  onSave?: (data: { columns: TableColumn[]; rows: TableRow[] }) => void;
  allowColumnEdit?: boolean;
  allowRowEdit?: boolean;
}

export const DataTablePage: React.FC<DataTablePageProps> = ({
  title = "Data Table",
  description = "Manage your data with this customizable table",
  initialColumns = [],
  initialRows = [],
  onSave,
  allowColumnEdit = true,
  allowRowEdit = true
}) => {
  const [columns, setColumns] = useState<TableColumn[]>(
    initialColumns.length > 0 
      ? initialColumns 
      : [
          {
            id: 'col1',
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            id: 'col2',
            label: 'Email',
            type: 'text',
            required: false
          },
          {
            id: 'col3',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Pending', value: 'pending' },
            ],
            required: false
          }
        ]
  );
  
  const [rows, setRows] = useState<TableRow[]>(initialRows);
  const [tableName, setTableName] = useState(title);
  const [tableDescription, setTableDescription] = useState(description);

  const handleRowsChange = (newRows: TableRow[]) => {
    setRows(newRows);
  };

  const handleColumnsChange = (newColumns: TableColumn[]) => {
    setColumns(newColumns);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ columns, rows });
    }
    console.log('Saved data:', { tableName, tableDescription, columns, rows });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{tableName}</h1>
          <p className="text-muted-foreground">{tableDescription}</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Data
        </Button>
      </div>

      {/* Table Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Table Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name..."
              />
            </div>
            <div>
              <Label htmlFor="tableDescription">Description</Label>
              <Input
                id="tableDescription"
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                placeholder="Enter table description..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          <TableField
            id="main-data-table"
            label="Data Table"
            columns={columns}
            rows={rows}
            value={rows}
            onChange={handleRowsChange}
            onBlur={() => {}}
            allowAddRows={allowRowEdit}
            allowEditColumns={allowColumnEdit}
            onColumnsChange={handleColumnsChange}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{columns.length}</div>
              <div className="text-sm text-muted-foreground">Columns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{rows.length}</div>
              <div className="text-sm text-muted-foreground">Rows</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {rows.reduce((total, row) => {
                  return total + Object.values(row.cells).filter(cell => 
                    cell !== null && cell !== undefined && cell !== ''
                  ).length;
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Filled Cells</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

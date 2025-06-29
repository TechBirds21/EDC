
export interface TableRow {
  id: string;
  cells: Record<string, any>;
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea';
  options?: { label: string; value: string }[];
  width?: string;
  required?: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'radio' | 'select' | 'signature' | 'header' | 'table' | 'number' | 'email' | 'tel' | 'url' | 'password' | 'hidden' | 'datetime' | 'checkbox' | 'yesno' | 'matrix' | 'file' | 'rating' | 'scale' | 'range' | 'calculation';
  name: string;
  label: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  width?: 'full' | 'half' | 'third' | 'quarter';
  placeholder?: string;
  tableConfig?: {
    columns: TableColumn[];
    defaultRows?: number;
    allowAddRows?: boolean;
    allowDeleteRows?: boolean;
  };
  // Merged properties for the advanced template builder
  helpText?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  rows?: number; // for textarea
  calculation?: {
    formula: string;
    fields: string[];
  };
  columns?: TableColumn[]; // for table fields in advanced builder
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  sortOrder: number;
  collapsible?: boolean;
  columns?: number;
}


import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyPanelProps {
  selectedWidget?: any;
  onUpdateWidget?: (updates: any) => void;
  onDeleteWidget?: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedWidget,
  onUpdateWidget,
  onDeleteWidget
}) => {
  if (!selectedWidget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a widget to edit its properties</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input 
            id="label"
            value={selectedWidget.label || ''}
            onChange={(e) => onUpdateWidget?.({ label: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input 
            id="placeholder"
            value={selectedWidget.placeholder || ''}
            onChange={(e) => onUpdateWidget?.({ placeholder: e.target.value })}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteWidget}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

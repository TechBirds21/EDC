import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ChangeReasonModalProps {
  isOpen: boolean;
  field: string;
  oldValue: any;
  newValue: any;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting: boolean;
}

export const ChangeReasonModal: React.FC<ChangeReasonModalProps> = ({
  isOpen,
  field,
  oldValue,
  newValue,
  onCancel,
  onSubmit,
  isSubmitting
}) => {
  const [reason, setReason] = useState('');
  
  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason('');
  };
  
  const handleCancel = () => {
    setReason('');
    onCancel();
  };
  
  // Format field name for display
  const displayFieldName = field.split('.').pop() || field;
  
  // Format values for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '(empty)';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason for Change</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Field</Label>
            <div className="p-2 bg-gray-50 rounded border">
              {displayFieldName}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Old Value</Label>
              <div className="p-2 bg-gray-50 rounded border">
                {formatValue(oldValue)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Value</Label>
              <div className="p-2 bg-gray-50 rounded border">
                {formatValue(newValue)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="change-reason">Reason for Change *</Label>
            <Textarea 
              id="change-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for this change"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? (
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
  );
};
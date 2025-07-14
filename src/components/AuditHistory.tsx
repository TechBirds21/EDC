import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  History, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Clock, 
  FileText,
  Printer,
  Edit
} from 'lucide-react';
import { AuditRecord, AuditChange } from '@/hooks/useAuditTrail';

interface AuditHistoryProps {
  auditRecord: AuditRecord | null;
  className?: string;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  auditRecord,
  className = ""
}) => {
  const [expandedChanges, setExpandedChanges] = useState<Set<number>>(new Set());

  if (!auditRecord || auditRecord.changes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Audit History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No audit trail available for this form.
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleChange = (index: number) => {
    const newExpanded = new Set(expandedChanges);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChanges(newExpanded);
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'None';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'edited':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('audit-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Audit Trail - ${auditRecord.formType}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                .change-item { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
                .field-name { font-weight: bold; color: #333; }
                .value { background: #f5f5f5; padding: 5px; margin: 5px 0; }
                .meta { color: #666; font-size: 0.9em; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Audit History</span>
            <Badge 
              variant="secondary" 
              className={getStatusColor(auditRecord.status)}
            >
              {auditRecord.status}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div id="audit-content">
          <div className="header mb-4">
            <h3 className="text-lg font-semibold">Audit Trail Report</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
              <div>
                <strong>Form Type:</strong> {auditRecord.formType}
              </div>
              <div>
                <strong>Form ID:</strong> {auditRecord.formId}
              </div>
              <div>
                <strong>Volunteer ID:</strong> {auditRecord.volunteerId}
              </div>
              <div>
                <strong>Status:</strong> {auditRecord.status}
              </div>
              <div>
                <strong>Created:</strong> {new Date(auditRecord.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Last Updated:</strong> {new Date(auditRecord.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {auditRecord.changes.map((change, index) => (
                <Collapsible key={index}>
                  <div className="border rounded-lg p-3">
                    <CollapsibleTrigger
                      className="flex items-center justify-between w-full hover:bg-gray-50 p-2 rounded"
                      onClick={() => toggleChange(index)}
                    >
                      <div className="flex items-center space-x-3">
                        {expandedChanges.has(index) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <Edit className="h-4 w-4 text-amber-600" />
                        <div className="text-left">
                          <div className="font-medium">{change.field}</div>
                          <div className="text-sm text-muted-foreground">
                            Changed by {change.userEmail}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(change.changedAt).toLocaleString()}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-3">
                      <div className="space-y-3 pl-6">
                        <div>
                          <strong>Reason:</strong>
                          <div className="bg-blue-50 p-2 rounded mt-1">
                            {change.reason}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>Old Value:</strong>
                            <pre className="bg-red-50 p-2 rounded mt-1 text-xs overflow-auto">
                              {formatValue(change.oldValue)}
                            </pre>
                          </div>
                          <div>
                            <strong>New Value:</strong>
                            <pre className="bg-green-50 p-2 rounded mt-1 text-xs overflow-auto">
                              {formatValue(change.newValue)}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>User ID: {change.changedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>Field: {change.field}</span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditHistory;
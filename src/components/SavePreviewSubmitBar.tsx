
import React, { useState } from 'react';
import { Save, Eye, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/dexie';
import { useToast } from '@/hooks/use-toast';

interface SavePreviewSubmitBarProps {
  formData: Record<string, any>;
  caseId: string;
  templateId: string;
  volunteerId: string;
  studyNumber: string;
  onSaveLocal?: () => void;
  onSubmit?: () => void;
}

export const SavePreviewSubmitBar: React.FC<SavePreviewSubmitBarProps> = ({
  formData,
  caseId,
  templateId,
  volunteerId,
  studyNumber,
  onSaveLocal,
  onSubmit
}) => {
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSaveLocal = async () => {
    setSaving(true);
    try {
      await db.pending_forms.add({
        template_id: templateId,
        patient_id: caseId,
        answers: formData,
        created_at: new Date(),
        last_modified: new Date()
      });
      
      toast({
        title: "Saved Locally",
        description: "Form data has been saved to local storage.",
      });
      
      onSaveLocal?.();
    } catch (error) {
      console.error('Failed to save locally:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save form data locally.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!volunteerId || !studyNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in Volunteer ID and Study Number before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .insert({
          case_id: caseId,
          template_id: templateId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          answers: formData,
          submitted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      // Mark local data as synced
      await db.pending_forms
        .where('patient_id')
        .equals(caseId)
        .modify({ synced: true });

      toast({
        title: "Submitted Successfully",
        description: "Form data has been submitted to the database.",
      });

      onSubmit?.();
    } catch (error) {
      console.error('Failed to submit:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit form data to database.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreview = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {Object.entries(formData).map(([key, value]) => (
        <div key={key} className="border-b pb-2">
          <div className="font-medium text-sm text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <div className="text-gray-900">
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="mt-6 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleSaveLocal}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Local'}</span>
          </Button>

          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Form Preview</DialogTitle>
                </DialogHeader>
                {renderPreview()}
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(formData).length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

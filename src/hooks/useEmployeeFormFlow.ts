import { useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db } from "@/lib/dexie";
import { pythonApi } from "@/services/api";
import { formDataCollector } from "@/services/formDataCollector";
import { useToast } from "@/hooks/use-toast";

// Util: Form order for this project (should match sidebar and routes)
const FORM_ORDER = [
  "Demographic Details",
  "Medical History",
  "Medical Examination",
  "Systemic Examination",
  "ECG Evaluation",
  "ECG",
  "X-Ray Evaluation",
  "COVID-19 Screening",
];

export function useEmployeeFormFlow(formTitle: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Extract context info
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get("case");
  const volunteerId = searchParams.get("volunteerId");
  const studyNumber = searchParams.get("studyNumber");
  const { pid } = useParams();

  // Determines form order/context
  const sectionIndex = FORM_ORDER.findIndex(
    (t) => t.toLowerCase() === formTitle.toLowerCase()
  );
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === FORM_ORDER.length - 1;

  // Load existing form answers from local (for this form, case, volunteer)
  const loadLocalAnswers = useCallback(async () => {
    if (!caseId) return null;
    const form = await db.pending_forms
      .where({ template_id: formTitle, patient_id: caseId })
      .first();
    return form ? form.answers : null;
  }, [formTitle, caseId]);

  // Save answers to local (create/update)
  const saveLocalAnswers = useCallback(
    async (answers: any) => {
      if (!caseId || !formTitle) return; 
      const existing = await db.pending_forms
        .where({ template_id: formTitle, patient_id: caseId })
        .first();
      const now = new Date();
      if (existing) {
        await db.pending_forms.update(existing.id!, {
          answers,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          last_modified: now,
        });
      } else {
        await db.pending_forms.add({
          template_id: formTitle,
          patient_id: caseId,
          answers,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          created_at: now,
          last_modified: now,
          synced: false,
        });
      }
      
      // Also add to form data collector
      formDataCollector.addFormData({
        templateId: formTitle,
        templateName: formTitle,
        volunteerId: volunteerId || '',
        studyNumber: studyNumber || '',
        caseId,
        data: answers,
        status: 'draft',
        lastModified: now
      });
      
      toast.toast({ title: "Saved!", description: "Saved locally" });
    },
    [formTitle, caseId, volunteerId, studyNumber, toast]
  );

  // Navigate to previous/next form (saving local first)
  const goToForm = useCallback(
    async (answers: any, dir: "previous" | "next") => {
      await saveLocalAnswers(answers);
      let targetIdx =
        dir === "previous" ? sectionIndex - 1 : sectionIndex + 1;
      if (targetIdx < 0 || targetIdx >= FORM_ORDER.length) return;
      const targetTitle = FORM_ORDER[targetIdx];
      const cleanTitle = targetTitle
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, "");
      // Build target route (customize if your routing structure differs)
      const params = new URLSearchParams();
      if (caseId) params.set("case", caseId);
      if (volunteerId) params.set("volunteerId", volunteerId);
      if (studyNumber) params.set("studyNumber", studyNumber);
      // e.g. /employee/project/:pid/dashboard/screening/medical-history
      navigate(
        `/employee/project/${pid}/dashboard/screening/${cleanTitle}?${params.toString()}`
      );
    },
    [
      saveLocalAnswers,
      sectionIndex,
      caseId,
      volunteerId,
      studyNumber,
      pid,
      navigate,
    ]
  );

  // Final submission - submit all locally-saved forms to backend for volunteer/case
  const submitAllForms = useCallback(async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.toast({
        title: "Missing Info",
        description: "Cannot submit forms: missing volunteer or study info.", 
        variant: "destructive",
      });
      return;
    }
    const allForms = await db.pending_forms
      .where({ patient_id: caseId, volunteer_id: volunteerId })
      .toArray();
    let successCount = 0;
    for (const localForm of allForms) {
      try {
        // Prepare data for Python API
        const { template_id, answers } = localForm; 
        
        try {
          // Try Python API first
          const response = await pythonApi.createForm({
            template_id,
            volunteer_id: volunteerId,
            status: "completed",
            data: answers,
          });
          
          // Mark local as synced
          await db.pending_forms.update(localForm.id!, { synced: true });
          successCount++;
        } catch (apiError) {
          console.warn('Python API submission failed, falling back to Supabase:', apiError);
          
          // Fall back to Supabase
          const { error } = await supabase
            .from('patient_forms')
            .upsert({
              case_id: caseId,
              volunteer_id: volunteerId,
              study_number: studyNumber,
              template_name: template_id,
              answers: answers
            });
            
          if (error) throw error;
          
          // Mark local as synced
          await db.pending_forms.update(localForm.id!, { synced: true });
          successCount++;
        }
        
        // Mark local as synced in collector
        formDataCollector.addFormData({
          templateId: template_id,
          templateName: template_id,
          volunteerId,
          studyNumber,
          caseId,
          data: answers,
          status: 'synced',
          lastModified: new Date()
        });
      } catch (err) {
        // Log/skip error for partial progress
        console.error("Failed to sync form:", localForm.template_id, err);
      }
    }
    if (successCount === allForms.length) {
      toast.toast({
        title: "All forms submitted",
        description: "All completed forms submitted to server successfully.", 
      });
      // Optional: redirect to main dashboard
      
      // Clear case data from collector after successful submission
      formDataCollector.clearCaseData(caseId);
    } else if (successCount > 0) {
      toast.toast({
        title: "Partial Success",
        description: `${successCount}/${allForms.length} forms submitted, some failed.`,
        variant: "destructive",
      });
    } else {
      toast.toast({
        title: "Submit Failed",
        description: "No forms could be submitted.",
        variant: "destructive",
      });
    }
  }, [caseId, volunteerId, studyNumber, toast]);

  return {
    volunteerId,
    studyNumber,
    caseId,
    isFirst,
    isLast,
    loadLocalAnswers,
    saveLocalAnswers,
    goToForm,
    submitAllForms,
    sectionIndex,
  };
}
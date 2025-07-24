
import Dexie, { Table } from 'dexie';

export interface PendingForm {
  id?: number;
  template_id: string;
  patient_id: string;
  answers: Record<string, any>;
  volunteer_id?: string;
  study_number?: string;
  synced?: boolean;
  created_at: Date;
  last_modified: Date;
}

export interface FormSession {
  id?: number;
  case_id: string;
  volunteer_id: string;
  study_number: string;
  current_form: string;
  completed_forms: string[];
  form_data: Record<string, any>; // All form data aggregated
  navigation_state: {
    current_step: number;
    total_steps: number;
    form_sequence: string[];
  };
  validation_errors?: Record<string, string[]>;
  created_at: Date;
  last_modified: Date;
}

export interface FormPage {
  id?: string;
  form_id: string;
  page_name: string;
  data: Record<string, any>;
  is_valid: boolean;
  validation_errors?: Record<string, string[]>;
  created_at: Date;
  last_modified: Date;
}

export class ClinicalCaptureDB extends Dexie {
  pending_forms!: Table<PendingForm>;
  form_sessions!: Table<FormSession>;
  form_pages!: Table<FormPage>;

  constructor() {
    super('clinical_capture');
    
    this.version(2).stores({
      pending_forms: '++id, template_id, patient_id, volunteer_id, study_number, synced, created_at',
      form_sessions: '++id, case_id, volunteer_id, study_number, current_form, created_at',
      form_pages: '++id, form_id, page_name, is_valid, created_at'
    });
  }
}

export const db = new ClinicalCaptureDB();

// Legacy helper functions for offline form management
export const addPendingForm = async (form: Omit<PendingForm, 'id' | 'created_at' | 'last_modified'>) => {
  const now = new Date();
  return await db.pending_forms.add({
    ...form,
    created_at: now,
    last_modified: now
  });
};

export const updatePendingForm = async (id: number, updates: Partial<PendingForm>) => {
  return await db.pending_forms.update(id, {
    ...updates,
    last_modified: new Date()
  });
};

export const getPendingFormsCount = async (): Promise<number> => {
  return await db.pending_forms.count();
};

export const getAllPendingForms = async (): Promise<PendingForm[]> => {
  return await db.pending_forms.toArray();
};

export const deletePendingForm = async (id: number) => {
  return await db.pending_forms.delete(id);
};

// Enhanced form session management
export const createFormSession = async (
  caseId: string, 
  volunteerId: string, 
  studyNumber: string,
  formSequence: string[]
): Promise<number> => {
  const now = new Date();
  return await db.form_sessions.add({
    case_id: caseId,
    volunteer_id: volunteerId,
    study_number: studyNumber,
    current_form: formSequence[0] || '',
    completed_forms: [],
    form_data: {},
    navigation_state: {
      current_step: 0,
      total_steps: formSequence.length,
      form_sequence: formSequence
    },
    created_at: now,
    last_modified: now
  });
};

export const getFormSession = async (caseId: string): Promise<FormSession | undefined> => {
  return await db.form_sessions.where('case_id').equals(caseId).first();
};

export const updateFormSession = async (caseId: string, updates: Partial<FormSession>) => {
  return await db.form_sessions.where('case_id').equals(caseId).modify({
    ...updates,
    last_modified: new Date()
  });
};

export const saveFormPageData = async (
  formId: string,
  pageName: string,
  data: Record<string, any>,
  isValid: boolean = true,
  validationErrors?: Record<string, string[]>
): Promise<void> => {
  const now = new Date();
  const pageId = `${formId}_${pageName}`;
  
  await db.form_pages.put({
    id: pageId,
    form_id: formId,
    page_name: pageName,
    data,
    is_valid: isValid,
    validation_errors: validationErrors,
    created_at: now,
    last_modified: now
  });
  
  // Also update the form session with this page's data
  const session = await getFormSession(formId);
  if (session) {
    const updatedFormData = {
      ...session.form_data,
      [pageName]: data
    };
    
    await updateFormSession(formId, {
      form_data: updatedFormData,
      validation_errors: validationErrors
    });
  }
};

export const getFormPageData = async (formId: string, pageName: string): Promise<FormPage | undefined> => {
  return await db.form_pages.get(`${formId}_${pageName}`);
};

export const getCompletedFormsData = async (caseId: string): Promise<Record<string, any>> => {
  const session = await getFormSession(caseId);
  return session?.form_data || {};
};

export const markFormAsCompleted = async (caseId: string, formName: string): Promise<void> => {
  const session = await getFormSession(caseId);
  if (session) {
    const completedForms = [...session.completed_forms];
    if (!completedForms.includes(formName)) {
      completedForms.push(formName);
    }
    
    const nextStepIndex = session.navigation_state.current_step + 1;
    const nextForm = session.navigation_state.form_sequence[nextStepIndex];
    
    await updateFormSession(caseId, {
      completed_forms: completedForms,
      current_form: nextForm || '',
      navigation_state: {
        ...session.navigation_state,
        current_step: nextStepIndex
      }
    });
  }
};

export const navigateToForm = async (caseId: string, formName: string): Promise<void> => {
  const session = await getFormSession(caseId);
  if (session) {
    const formIndex = session.navigation_state.form_sequence.indexOf(formName);
    if (formIndex !== -1) {
      await updateFormSession(caseId, {
        current_form: formName,
        navigation_state: {
          ...session.navigation_state,
          current_step: formIndex
        }
      });
    }
  }
};

export const clearFormSession = async (caseId: string): Promise<void> => {
  await db.form_sessions.where('case_id').equals(caseId).delete();
  await db.form_pages.where('form_id').equals(caseId).delete();
};

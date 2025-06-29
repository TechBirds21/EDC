
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

export class ClinicalCaptureDB extends Dexie {
  pending_forms!: Table<PendingForm>;

  constructor() {
    super('clinical_capture');
    
    this.version(1).stores({
      pending_forms: '++id, template_id, patient_id, volunteer_id, study_number, synced, created_at'
    });
  }
}

export const db = new ClinicalCaptureDB();

// Helper functions for offline form management
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

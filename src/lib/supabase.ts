
// PostgreSQL API helpers (replacing Supabase completely)
import { pythonApi } from '@/services/api';

// Legacy form data save function - routes to Python API
export const saveFormData = async (tableName: string, data: any) => {
  try {
    // Use the Python API for all database operations
    const result = await pythonApi.createForm({
      template_id: data.template_id || tableName,
      volunteer_id: data.volunteer_id || '',
      study_number: data.study_number || '',
      data: data,
      status: data.status || 'submitted'
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving form data:', error);
    return { success: false, error };
  }
};

// Legacy form data update function - routes to Python API
export const updateFormData = async (tableName: string, id: string, data: any) => {
  try {
    // Use the Python API for updates
    const result = await pythonApi.updateForm(id, {
      data: data,
      status: data.status || 'updated'
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating form data:', error);
    return { success: false, error };
  }
};

// Note: Supabase has been completely removed and replaced with Python FastAPI backend
// All data operations now go through the Python API at /src/services/api.ts

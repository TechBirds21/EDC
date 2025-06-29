
import { supabase } from '../integrations/supabase/client';

export { supabase };

export const saveFormData = async (tableName: string, data: any) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName as any)
      .insert(data);
    
    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving form data:', error);
    return { success: false, error };
  }
};

export const updateFormData = async (tableName: string, id: string, data: any) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName as any)
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating form data:', error);
    return { success: false, error };
  }
};

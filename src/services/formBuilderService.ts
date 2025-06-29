import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
}

export const formBuilderService = {
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  
  async saveTemplate(templateData: any) {
    // Fixed param order to match your Supabase SQL function
    const { name, description, project_id, client_id, sections } = templateData;
    // Set up params as per function definition in SQL
    const params = {
      p_name: name,
      p_description: description,
      p_project_id: project_id,
      p_client_id: client_id ? client_id : null,
      p_version: 1,
      p_json_schema: {}, // optional legacy param
      p_is_active: true,
      p_sections: sections
    };

    // Actually, based on your latest migration, you are now using the `p_template_data` JSONB param
    // for the new save_form_template_complete function. 
    // To keep backwards compatibility and allow UI to work, let's try both functions:
    try {
      // Prefer new-style:
      const { data, error } = await supabase.rpc('save_form_template_complete', {
        p_template_data: {
          name,
          description,
          project_id,
          client_id,
          sections
        } as any
      });
      if (error) throw error;
      return data;
    } catch (err) {
      // fallback for older function signatures, if required!
      console.error('RPC save_form_template_complete failed, attempting legacy function', err);
      const { data, error } = await supabase.rpc('create_form_template_privileged', params);
      if (error) throw error;
      return data;
    }
  },
  
  async getTemplates() {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },
  
  async getTemplateById(id: string) {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },
  
  async deleteTemplate(id: string) {
    try {
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
};


export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  client_id?: string;
  version: number;
  json_schema: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  template_id: string;
  field_type: string;
  field_name: string;
  field_label: string;
  field_key: string;
  required: boolean;
  default_value?: string;
  options?: any;
  validation_rules?: any;
  sort_order: number;
  created_at: string;
}

export interface CreateFormTemplateData {
  name: string;
  description?: string;
  project_id: string;
  client_id?: string;
  version?: number;
  json_schema?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateFormTemplateData {
  name?: string;
  description?: string;
  project_id?: string;
  client_id?: string;
  version?: number;
  json_schema?: any;
  is_active?: boolean;
}

export interface CreateFormFieldData {
  template_id: string;
  field_type: string;
  field_name: string;
  field_label: string;
  field_key: string;
  required?: boolean;
  default_value?: string;
  options?: any;
  validation_rules?: any;
  sort_order?: number;
}

export const formTemplateService = {
  async getTemplates(): Promise<FormTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  async createTemplate(templateData: CreateFormTemplateData): Promise<FormTemplate> {
    try {
      // Ensure client_id is properly handled (null if 'none')
      const clientId = templateData.client_id === 'none' ? null : templateData.client_id;

      // Use the correct function signature that matches the available Supabase function
      const { data, error } = await supabase.rpc('create_form_template_privileged', {
        p_name: templateData.name,
        p_description: templateData.description || null,
        p_project_id: templateData.project_id,
        p_client_id: clientId,
        p_version: templateData.version || 1,
        p_json_schema: templateData.json_schema || {},
        p_is_active: templateData.is_active !== undefined ? templateData.is_active : true
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  async updateTemplate(id: string, templateData: UpdateFormTemplateData): Promise<FormTemplate> {
    try {
      // Ensure client_id is properly handled
      const updateData = {
        ...templateData,
        client_id: templateData.client_id === 'none' ? null : templateData.client_id
      };

      const { data, error } = await supabase
        .from('form_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  async getTemplateWithFields(templateId: string): Promise<{ template: FormTemplate; fields: FormField[] }> {
    try {
      const [templateResult, fieldsResult] = await Promise.all([
        supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single(),
        supabase
          .from('form_fields')
          .select('*')
          .eq('template_id', templateId)
          .order('sort_order', { ascending: true })
      ]);

      if (templateResult.error) throw templateResult.error;
      if (fieldsResult.error) throw fieldsResult.error;

      return {
        template: templateResult.data,
        fields: fieldsResult.data || []
      };
    } catch (error) {
      console.error('Error fetching template with fields:', error);
      throw error;
    }
  },

  async createFormFields(fields: CreateFormFieldData[]): Promise<FormField[]> {
    try {
      const { data, error } = await supabase
        .from('form_fields')
        .insert(fields)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating form fields:', error);
      throw error;
    }
  },

  async updateFormField(id: string, fieldData: Partial<CreateFormFieldData>): Promise<FormField> {
    try {
      const { data, error } = await supabase
        .from('form_fields')
        .update(fieldData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating form field:', error);
      throw error;
    }
  },

  async deleteFormField(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting form field:', error);
      throw error;
    }
  }
};

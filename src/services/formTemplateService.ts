
import { pythonApi } from './api';

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
      const response = await pythonApi.getFormTemplates();
      return response.data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  async createTemplate(templateData: CreateFormTemplateData): Promise<FormTemplate> {
    try {
      // Ensure client_id is properly handled (null if 'none')
      const clientId = templateData.client_id === 'none' ? null : templateData.client_id;

      const payload = {
        name: templateData.name,
        description: templateData.description || null,
        project_id: templateData.project_id,
        client_id: clientId,
        version: templateData.version || 1,
        json_schema: templateData.json_schema || {},
        is_active: templateData.is_active !== undefined ? templateData.is_active : true
      };

      const response = await pythonApi.createFormTemplate(payload);
      return response;
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

      const response = await pythonApi.updateFormTemplate(id, updateData);
      return response;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      await pythonApi.fetchWithAuth(`/form-templates/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  async getTemplateWithFields(templateId: string): Promise<{ template: FormTemplate; fields: FormField[] }> {
    try {
      // Get template by ID 
      const template = await pythonApi.getFormTemplateById(templateId);
      
      // For now, return empty fields array since the Python API may handle this differently
      // This may need to be updated based on the actual backend implementation
      const fields: FormField[] = [];

      return {
        template: template,
        fields: fields
      };
    } catch (error) {
      console.error('Error fetching template with fields:', error);
      throw error;
    }
  },

  async createFormFields(fields: CreateFormFieldData[]): Promise<FormField[]> {
    try {
      // For now, return empty array as the Python API may handle form fields differently
      // This may need to be updated based on actual backend implementation
      console.warn('createFormFields: Python API integration needed');
      return [];
    } catch (error) {
      console.error('Error creating form fields:', error);
      throw error;
    }
  },

  async updateFormField(id: string, fieldData: Partial<CreateFormFieldData>): Promise<FormField> {
    try {
      // For now, throw error as the Python API may handle form fields differently
      // This may need to be updated based on actual backend implementation
      throw new Error('updateFormField: Python API integration needed');
    } catch (error) {
      console.error('Error updating form field:', error);
      throw error;
    }
  },

  async deleteFormField(id: string): Promise<void> {
    try {
      // For now, do nothing as the Python API may handle form fields differently
      // This may need to be updated based on actual backend implementation
      console.warn('deleteFormField: Python API integration needed');
    } catch (error) {
      console.error('Error deleting form field:', error);
      throw error;
    }
  }
};

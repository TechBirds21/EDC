import { supabase } from '@/integrations/supabase/client';

// Form Templates API
export const formTemplateApi = {
  getTemplates: async () => {
    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  getTemplateById: async (id: string) => {
    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  createTemplate: async (template: any) => {
    const { data, error } = await supabase
      .from('form_templates')
      .insert([template])
      .select();
      
    if (error) throw error;
    return data?.[0];
  },
  
  updateTemplate: async (id: string, template: any) => {
    const { data, error } = await supabase
      .from('form_templates')
      .update(template)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data?.[0];
  },
  
  deleteTemplate: async (id: string) => {
    const { error } = await supabase
      .from('form_templates')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
};

// Forms API
export const formsApi = {
  getForms: async (filters: any = {}) => {
    let query = supabase
      .from('patient_forms')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.volunteer_id) {
      query = query.eq('volunteer_id', filters.volunteer_id);
    }
    
    if (filters.template_name) {
      query = query.eq('template_name', filters.template_name);
    }
    
    if (filters.study_number) {
      query = query.eq('study_number', filters.study_number);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },
  
  getFormById: async (id: string) => {
    const { data, error } = await supabase
      .from('patient_forms')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  searchForms: async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('patient_forms')
      .select('*')
      .or(`volunteer_id.ilike.%${searchTerm}%,study_number.ilike.%${searchTerm}%,template_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
};

// Volunteers API
export const volunteersApi = {
  getVolunteers: async () => {
    const { data, error } = await supabase
      .from('patient_forms')
      .select('volunteer_id, study_number')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Extract unique volunteers
    const uniqueVolunteers = new Map();
    data?.forEach(item => {
      if (!uniqueVolunteers.has(item.volunteer_id)) {
        uniqueVolunteers.set(item.volunteer_id, {
          id: item.volunteer_id,
          study_number: item.study_number
        });
      }
    });
    
    return Array.from(uniqueVolunteers.values());
  },
  
  getVolunteerById: async (id: string) => {
    const { data, error } = await supabase
      .from('patient_forms')
      .select('*')
      .eq('volunteer_id', id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Extract volunteer info from forms
    if (data && data.length > 0) {
      const volunteerInfo = {
        id: data[0].volunteer_id,
        study_number: data[0].study_number,
        forms: data
      };
      
      return volunteerInfo;
    }
    
    return null;
  }
};

// Users API
export const usersApi = {
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  getUserById: async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  updateUser: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data?.[0];
  }
};

// Clients API
export const clientsApi = {
  getClients: async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  getClientById: async (id: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  createClient: async (client: any) => {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    
    // Use RPC function to bypass RLS
    const { data, error } = await supabase
      .rpc('admin_create_client', {
        client_name: client.name,
        client_description: client.description || '',
        client_email: client.contact_email,
        client_status: client.status,
        user_id: userData.user?.id
      });
      
    if (error) throw error;
    return data;
  },
  
  updateClient: async (id: string, client: any) => {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data?.[0];
  },
  
  deleteClient: async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
};

// Audit Logs API
export const auditLogsApi = {
  getLogs: async (filters: any = {}) => {
    let query = supabase
      .from('activity_logs')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });
    
    // Apply filters with proper null checks
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Format the data to include user_email with proper null checks
    const formattedData = data?.map(log => ({
      ...log,
      user_email: log.profiles?.email || 'Unknown'
    })) || [];
    
    return formattedData;
  },
  
  createLog: async (log: any) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([log])
      .select();
      
    if (error) throw error;
    return data?.[0];
  }
};

// Python API integration
export const pythonApi = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.clinicalcapture.com/api' 
    : 'http://localhost:8000/api',
    
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      ...options.headers
    };
    
    // Make the request
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    
    // Return the data
    return response.json();
  },
  
  // Volunteers with proper null checks
  getVolunteers: async (page = 1, size = 20) => {
    return pythonApi.fetchWithAuth(`/volunteers?page=${page}&size=${size}`);
  },
  
  getVolunteerById: async (id: string) => {
    return pythonApi.fetchWithAuth(`/volunteers/${id}`);
  },
  
  createVolunteer: async (data: any) => {
    return pythonApi.fetchWithAuth('/volunteers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  updateVolunteer: async (id: string, data: any) => {
    return pythonApi.fetchWithAuth(`/volunteers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  // Form Templates with proper null checks
  getFormTemplates: async (page = 1, size = 20, name?: string) => {
    let url = `/form-templates?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    return pythonApi.fetchWithAuth(url);
  },
  
  getFormTemplateById: async (id: string) => {
    return pythonApi.fetchWithAuth(`/form-templates/${id}`);
  },
  
  createFormTemplate: async (data: any) => {
    return pythonApi.fetchWithAuth('/form-templates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  updateFormTemplate: async (id: string, data: any) => {
    return pythonApi.fetchWithAuth(`/form-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  // Forms with proper null checks
  getForms: async (page = 1, size = 20, filters: any = {}) => {
    let url = `/forms?page=${page}&size=${size}`;
    
    if (filters.volunteer_id) {
      url += `&volunteer_id=${filters.volunteer_id}`;
    }
    
    if (filters.template_id) {
      url += `&template_id=${filters.template_id}`;
    }
    
    if (filters.status) {
      url += `&status=${filters.status}`;
    }
    
    return pythonApi.fetchWithAuth(url);
  },
  
  getFormById: async (id: string) => {
    return pythonApi.fetchWithAuth(`/forms/${id}`);
  },
  
  createForm: async (data: any) => {
    return pythonApi.fetchWithAuth('/forms', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  updateForm: async (id: string, data: any) => {
    return pythonApi.fetchWithAuth(`/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  patchFormField: async (id: string, field: string, value: any, reason: string) => {
    return pythonApi.fetchWithAuth(`/forms/${id}/field`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        field, 
        value, 
        reason,
        timestamp: new Date().toISOString() 
      })
    });
  },
  
  // Change Log with proper null checks
  getChangeLogs: async (formId: string, page = 1, size = 20) => {
    return pythonApi.fetchWithAuth(`/change-log/${formId}?page=${page}&size=${size}`);
  },
  
  // Table/Matrix specific APIs with proper null checks
  addTableRow: async (formId: string, fieldPath: string, rowData: any, reason: string) => {
    return pythonApi.fetchWithAuth(`/forms/${formId}/table-row`, {
      method: 'POST',
      body: JSON.stringify({
        field_path: fieldPath,
        row_data: rowData,
        reason
      })
    });
  },
  
  updateTableCell: async (formId: string, fieldPath: string, rowId: string, columnId: string, value: any, reason: string) => {
    return pythonApi.fetchWithAuth(`/forms/${formId}/table-cell`, {
      method: 'PATCH',
      body: JSON.stringify({
        field_path: fieldPath,
        row_id: rowId,
        column_id: columnId,
        value,
        reason
      })
    });
  }
};

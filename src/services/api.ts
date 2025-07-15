// Helper function to handle errors
const handleError = (error: any) => {
  console.error('API Error:', error);
  throw error;
};

// Python API integration (PostgreSQL backend)
export const pythonApi = {
  baseUrl: import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
      ? 'https://api.clinicalcapture.com' 
      : 'http://localhost:8000'),
    
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Set default headers with auth token
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
    
    // Make the request
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      ...options, 
      headers
    });
    
    // Handle errors
    if (!response.ok) {
      try {
        const error = await response.json();
        return handleError(error.message || `API error: ${response.status}`);
      } catch (e) {
        return handleError(`API error: ${response.status}`);
      }
    }
    
    // Return the data
    return await response.json();
  },
  
  // Volunteers
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
  
  // Form Templates
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
  
  // Forms
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
  
  // Change Log
  getChangeLogs: async (formId: string, page = 1, size = 20) => {
    return pythonApi.fetchWithAuth(`/change-log/${formId}?page=${page}&size=${size}`);
  },
  
  // Table/Matrix specific APIs
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

// Form Templates API (using PostgreSQL)
export const formTemplateApi = {
  getTemplates: async () => {
    return await pythonApi.getFormTemplates();
  },
  
  getTemplateById: async (id: string) => {
    return await pythonApi.getFormTemplateById(id);
  },
  
  createTemplate: async (template: any) => {
    return await pythonApi.createFormTemplate(template);
  },
  
  updateTemplate: async (id: string, template: any) => {
    return await pythonApi.updateFormTemplate(id, template);
  },
  
  deleteTemplate: async (id: string) => {
    // Implement delete via Python API if needed
    return await pythonApi.fetchWithAuth(`/form-templates/${id}`, {
      method: 'DELETE'
    });
  }
};

// Forms API (using PostgreSQL)
export const formsApi = {
  getForms: async (filters: any = {}) => {
    return await pythonApi.getForms(1, 100, filters);
  },
  
  getFormById: async (id: string) => {
    return await pythonApi.getFormById(id);
  },

  createForm: async (formData: any) => {
    return await pythonApi.createForm(formData);
  },

  updateForm: async (id: string, formData: any) => {
    return await pythonApi.updateForm(id, formData);
  },

  // Save form data with template reference
  saveFormData: async (templateId: string, formData: Record<string, any>, metadata: any = {}) => {
    const payload = {
      template_id: templateId,
      data: formData,
      volunteer_id: metadata.volunteer_id || null,
      study_number: metadata.study_number || null,
      status: metadata.status || 'draft',
    };

    return await pythonApi.createForm(payload);
  },

  // Update existing form data
  updateFormData: async (formId: string, formData: Record<string, any>, reason?: string) => {
    const payload = {
      data: formData,
      ...(reason && { update_reason: reason })
    };

    return await pythonApi.updateForm(formId, payload);
  },
  
  searchForms: async (searchTerm: string) => {
    // Implement search via Python API if needed
    return await pythonApi.getForms(1, 100, { search: searchTerm });
  }
};

// Volunteers API (using PostgreSQL)
export const volunteersApi = {
  getVolunteers: async () => {
    return await pythonApi.getVolunteers();
  },
  
  getVolunteerById: async (id: string) => {
    return await pythonApi.getVolunteerById(id);
  }
};

// Users API (using PostgreSQL)
export const usersApi = {
  getUsers: async () => {
    // Implement via Python API if needed
    return await pythonApi.fetchWithAuth('/users');
  },
  
  getUserById: async (id: string) => {
    return await pythonApi.fetchWithAuth(`/users/${id}`);
  },
  
  updateUser: async (id: string, updates: any) => {
    return await pythonApi.fetchWithAuth(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
};

// Clients API (using PostgreSQL)
export const clientsApi = {
  getClients: async () => {
    return await pythonApi.fetchWithAuth('/clients');
  },
  
  getClientById: async (id: string) => {
    return await pythonApi.fetchWithAuth(`/clients/${id}`);
  },
  
  createClient: async (client: any) => {
    return await pythonApi.fetchWithAuth('/clients', {
      method: 'POST',
      body: JSON.stringify(client)
    });
  },
  
  updateClient: async (id: string, client: any) => {
    return await pythonApi.fetchWithAuth(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(client)
    });
  },
  
  deleteClient: async (id: string) => {
    return await pythonApi.fetchWithAuth(`/clients/${id}`, {
      method: 'DELETE'
    });
  }
};

// Audit Logs API (using PostgreSQL)
export const auditLogsApi = {
  getLogs: async (filters: any = {}) => {
    let url = '/audit-logs';
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.action) params.append('action', filters.action);
    if (filters.resource_type) params.append('resource_type', filters.resource_type);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    return await pythonApi.fetchWithAuth(url);
  },
  
  createLog: async (log: any) => {
    return await pythonApi.fetchWithAuth('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log)
    });
  }
};
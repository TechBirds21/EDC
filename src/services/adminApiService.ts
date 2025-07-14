import { useAuth } from '@/contexts/AuthContext';

interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pages?: number;
}

interface Volunteer {
  id: string;
  volunteer_id: string;
  study_number: string;
  screening_date?: string;
  dob?: string;
  gender?: string;
  bmi?: number;
  created_at: string;
  updated_at: string;
}

interface Form {
  id: string;
  template_id: string;
  volunteer_id: string;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  form_id: string;
  field: string;
  old: unknown;
  new: unknown;
  reason: string;
  changed_at: string;
  changed_by: string;
}

class AdminApiService {
  private baseUrl: string;
  private getAuthHeaders: () => { [key: string]: string };

  constructor() {
    this.baseUrl = '/api';
    
    // Get auth headers function
    this.getAuthHeaders = () => {
      const auth = (window as any).__auth_context;
      if (auth?.user?.session?.access_token) {
        return {
          'Authorization': `Bearer ${auth.user.session.access_token}`,
          'Content-Type': 'application/json'
        };
      }
      return { 'Content-Type': 'application/json' };
    };
  }

  // Generic API call method
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.getAuthHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      // For demo purposes, return mock data on API failure
      return this.getMockData<T>(endpoint);
    }
  }

  // Mock data fallback for when API is not available
  private getMockData<T>(endpoint: string): T {
    const mockData: { [key: string]: unknown } = {
      '/volunteers': {
        items: [
          {
            id: '1',
            volunteer_id: 'VOL-001',
            study_number: 'STU-2024-001',
            screening_date: '2024-01-15',
            gender: 'female',
            bmi: 22.5,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            volunteer_id: 'VOL-002',
            study_number: 'STU-2024-002',
            screening_date: '2024-01-16',
            gender: 'male',
            bmi: 24.1,
            created_at: '2024-01-16T11:00:00Z',
            updated_at: '2024-01-16T11:00:00Z'
          }
        ],
        total: 156,
        page: 1,
        pages: 16
      },
      '/forms': {
        items: [
          {
            id: '1',
            template_id: 'clinical_biochemistry_1',
            volunteer_id: '1',
            status: 'submitted',
            data: { period: 1, tests: {} },
            created_at: '2024-01-15T14:00:00Z',
            updated_at: '2024-01-15T14:00:00Z'
          }
        ],
        total: 234,
        page: 1,
        pages: 24
      },
      '/change_log': {
        items: [
          {
            id: '1',
            form_id: '1',
            field: 'glucose_result',
            old: '95',
            new: '98',
            reason: 'Correction based on lab review',
            changed_at: '2024-01-15T15:00:00Z',
            changed_by: 'admin@example.com'
          }
        ],
        total: 45,
        page: 1,
        pages: 5
      }
    };

    return mockData[endpoint] as T;
  }

  // Dashboard metrics
  async getDashboardMetrics() {
    const [volunteers, forms, auditLogs] = await Promise.all([
      this.getVolunteers({ page: 1, size: 1 }),
      this.getForms({ page: 1, size: 1 }),
      this.getAuditLogs({ page: 1, size: 1 })
    ]);

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalVolunteers: volunteers.total || 0,
      totalForms: forms.total || 0,
      submittedForms: forms.items?.filter(f => f.status === 'submitted').length || 0,
      auditChanges: auditLogs.total || 0,
      recentActivity: {
        newVolunteersThisWeek: 12, // This would be calculated from actual data
        formsSubmittedToday: 8,
        pendingReviews: 3
      }
    };
  }

  // Volunteers
  async getVolunteers(params: { page?: number; size?: number } = {}): Promise<ApiResponse<Volunteer[]>> {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      size: (params.size || 20).toString()
    });
    
    return this.apiCall<ApiResponse<Volunteer[]>>(`/volunteers?${queryParams}`);
  }

  async createVolunteer(volunteer: Omit<Volunteer, 'id' | 'created_at' | 'updated_at'>): Promise<Volunteer> {
    return this.apiCall<Volunteer>('/volunteers', {
      method: 'POST',
      body: JSON.stringify(volunteer)
    });
  }

  async updateVolunteer(id: string, volunteer: Partial<Volunteer>): Promise<Volunteer> {
    return this.apiCall<Volunteer>(`/volunteers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(volunteer)
    });
  }

  // Forms
  async getForms(params: { page?: number; size?: number; volunteer_id?: string } = {}): Promise<ApiResponse<Form[]>> {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      size: (params.size || 20).toString()
    });
    
    if (params.volunteer_id) {
      queryParams.set('volunteer_id', params.volunteer_id);
    }
    
    return this.apiCall<ApiResponse<Form[]>>(`/forms?${queryParams}`);
  }

  async getForm(id: string): Promise<Form> {
    return this.apiCall<Form>(`/forms/${id}`);
  }

  async createForm(form: Omit<Form, 'id' | 'created_at' | 'updated_at'>): Promise<Form> {
    return this.apiCall<Form>('/forms', {
      method: 'POST',
      body: JSON.stringify(form)
    });
  }

  async updateForm(id: string, form: Partial<Form>): Promise<Form> {
    return this.apiCall<Form>(`/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(form)
    });
  }

  // Audit Logs
  async getAuditLogs(params: { page?: number; size?: number; form_id?: string } = {}): Promise<ApiResponse<AuditLog[]>> {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      size: (params.size || 20).toString()
    });
    
    if (params.form_id) {
      queryParams.set('form_id', params.form_id);
    }
    
    return this.apiCall<ApiResponse<AuditLog[]>>(`/change_log?${queryParams}`);
  }

  // Form statistics for charts
  async getFormStatistics(): Promise<{ name: string; count: number }[]> {
    try {
      const forms = await this.getForms({ size: 1000 }); // Get more forms for statistics
      
      const formCounts: { [key: string]: number } = {};
      forms.items?.forEach(form => {
        const templateName = form.template_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        formCounts[templateName] = (formCounts[templateName] || 0) + 1;
      });

      return Object.entries(formCounts).map(([name, count]) => ({ name, count }));
    } catch (error) {
      console.error('Error getting form statistics:', error);
      // Return mock data
      return [
        { name: 'Clinical Biochemistry 1', count: 45 },
        { name: 'Clinical Biochemistry 2', count: 42 },
        { name: 'Hematology', count: 38 },
        { name: 'Covid Screening', count: 56 },
        { name: 'Medical History', count: 34 }
      ];
    }
  }
}

// Singleton instance
export const adminApiService = new AdminApiService();
export default adminApiService;
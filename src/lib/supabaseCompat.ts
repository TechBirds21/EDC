// Supabase compatibility layer that routes to Python API
import { pythonApi } from '@/services/api';

// Mock Supabase auth object
const mockAuth = {
  getUser: async () => {
    // Return mock user data based on stored auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { data: { user: null }, error: null };
    }
    
    // For now, return a basic user structure
    // This should be replaced with actual user data from the Python API
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: 'current@user.com'
        }
      },
      error: null
    };
  },
  
  admin: {
    createUser: async (userData: any) => {
      try {
        // Route to Python API user creation
        const response = await pythonApi.fetchWithAuth('/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        return { data: response, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    deleteUser: async (userId: string) => {
      try {
        await pythonApi.fetchWithAuth(`/users/${userId}`, {
          method: 'DELETE'
        });
        return { error: null };
      } catch (error) {
        return { error };
      }
    }
  }
};

// Mock Supabase client object that routes to Python API
export const supabaseCompat = {
  auth: mockAuth,
  
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const response = await pythonApi.fetchWithAuth(`/legacy/${table}?${column}=eq.${value}&select=${columns}&limit=1`);
            return { data: response.data?.[0] || null, error: null };
          } catch (error) {
            return { data: null, error };
          }
        },
        
        maybeSingle: async () => {
          try {
            const response = await pythonApi.fetchWithAuth(`/legacy/${table}?${column}=eq.${value}&select=${columns}&limit=1`);
            return { data: response.data?.[0] || null, error: null };
          } catch (error) {
            return { data: null, error };
          }
        }
      }),
      
      order: (column: string, options?: any) => ({
        async: async () => {
          try {
            const orderParam = options?.ascending === false ? `${column}.desc` : `${column}.asc`;
            const response = await pythonApi.fetchWithAuth(`/legacy/${table}?select=${columns}&order=${orderParam}`);
            return { data: response.data || [], error: null };
          } catch (error) {
            return { data: [], error };
          }
        }
      })
    }),
    
    insert: (data: any) => ({
      select: () => ({
        async: async () => {
          try {
            const response = await pythonApi.fetchWithAuth(`/legacy/${table}`, {
              method: 'POST',
              body: JSON.stringify(data)
            });
            return { data: response, error: null };
          } catch (error) {
            return { data: null, error };
          }
        }
      })
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            try {
              const response = await pythonApi.fetchWithAuth(`/legacy/${table}?${column}=eq.${value}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
              });
              return { data: response, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        })
      })
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => ({
        async: async () => {
          try {
            await pythonApi.fetchWithAuth(`/legacy/${table}?${column}=eq.${value}`, {
              method: 'DELETE'
            });
            return { error: null };
          } catch (error) {
            return { error };
          }
        }
      })
    }),
    
    upsert: (data: any) => ({
      async: async () => {
        try {
          const response = await pythonApi.fetchWithAuth(`/legacy/${table}`, {
            method: 'POST',
            body: JSON.stringify({ ...data, upsert: true })
          });
          return { data: response, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    })
  }),
  
  rpc: async (functionName: string, params: any) => {
    try {
      const response = await pythonApi.fetchWithAuth(`/rpc/${functionName}`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).supabase = supabaseCompat;
}

export default supabaseCompat;
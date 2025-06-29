
import { supabase } from '@/lib/supabase';
import { UserRole, DemoUsers } from '@/types/auth';

export const demoUsers: DemoUsers = {
  'employee@demo.com': { password: 'demo123', role: 'employee' },
  'admin@demo.com': { password: 'demo123', role: 'admin' },
  'superadmin@demo.com': { password: 'demo123', role: 'super_admin' }
};

export const createDemoUser = async (email: string, password: string, role: UserRole) => {
  try {
    console.log('Creating demo user:', email, 'with role:', role);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role: role,
          first_name: 'Demo',
          last_name: role === 'super_admin' ? 'Super Admin' : 
                    role === 'admin' ? 'Admin' : 'Employee'
        }
      }
    });

    if (error && error.message !== 'User already registered') {
      console.error('Demo user creation error:', error);
      throw error;
    }

    console.log('Demo user creation result:', { user: data.user?.email, error: error?.message });
    return data;
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
};

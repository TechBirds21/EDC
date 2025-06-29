
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'employee' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: string;
}

export interface AuthUser extends User {
  role: UserRole;
  profile?: Profile;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

export interface DemoUser {
  password: string;
  role: UserRole;
}

export type DemoUsers = {
  [key: string]: DemoUser;
};

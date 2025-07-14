
import { usersApi } from '@/services/api';
import { Profile, UserRole } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const data = await usersApi.getUserById(userId);
    
    if (data) {
      return {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role as UserRole,
        status: data.status
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

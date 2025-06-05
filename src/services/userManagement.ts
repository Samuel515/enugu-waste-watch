
import { supabase } from "@/integrations/supabase/client";

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "official" | "resident";
  area: string | null;
  is_active: boolean;
  auth_confirmed: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export class UserManagementService {
  
  // Fetch all users with enhanced information
  static async getAllUsers(): Promise<EnhancedUser[]> {
    try {
      // Get all profiles with their auth status
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          area,
          is_active,
          created_at,
          updated_at
        `);
      
      if (profilesError) throw profilesError;
      
      if (!profilesData || profilesData.length === 0) {
        return [];
      }
      
      // For each profile, try to get auth information
      const enhancedUsers: EnhancedUser[] = [];
      
      for (const profile of profilesData) {
        try {
          // Try to get auth user data (this might fail if user doesn't have admin rights)
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(profile.id);
          
          if (authError) {
            // If we get a 403 or other auth error, just use profile data
            console.warn(`Cannot access auth data for user ${profile.id}:`, authError.message);
            enhancedUsers.push({
              ...profile,
              role: profile.role as "admin" | "official" | "resident",
              auth_confirmed: true, // Assume confirmed if we can't check
              last_sign_in_at: null
            });
          } else {
            enhancedUsers.push({
              ...profile,
              role: profile.role as "admin" | "official" | "resident",
              auth_confirmed: authData?.user?.email_confirmed_at !== null,
              last_sign_in_at: authData?.user?.last_sign_in_at || null
            });
          }
        } catch (authError: any) {
          // If we can't access auth data due to permissions, just use profile data
          console.warn(`Cannot access auth data for user ${profile.id}:`, authError.message);
          enhancedUsers.push({
            ...profile,
            role: profile.role as "admin" | "official" | "resident",
            auth_confirmed: true, // Assume confirmed if we can't check
            last_sign_in_at: null
          });
        }
      }
      
      return enhancedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  // Update user profile
  static async updateUser(userId: string, updates: Partial<EnhancedUser>): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          area: updates.area,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Toggle user active status with sync
  static async toggleUserStatus(userId: string, newStatus: boolean): Promise<void> {
    try {
      // First update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Try to sync with auth (this might fail without admin privileges)
      try {
        if (!newStatus) {
          // If deactivating, try to sign out the user from all sessions
          const { error: signOutError } = await supabase.auth.admin.signOut(userId, 'global');
          if (signOutError) {
            console.warn('Could not sign out user from auth:', signOutError.message);
          }
        }
      } catch (authError: any) {
        console.warn('Could not sync auth status. Profile updated successfully.', authError.message);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }
  
  // Delete user completely
  static async deleteUser(userId: string): Promise<void> {
    try {
      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Try to delete from auth (might require admin privileges)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          console.warn('Profile deleted but could not delete from auth system:', authError.message);
        }
      } catch (authError: any) {
        console.warn('Profile deleted but could not delete from auth system:', authError.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

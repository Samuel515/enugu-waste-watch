import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuthService } from "@/hooks/useAuthService";

export type UserRole = "resident" | "official" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area?: string;
}

type SignupResult = {
  success: boolean;
  email?: string;
  exists?: boolean;
  error?: any;
};

type PasswordUpdateResult = {
  success: boolean;
  message?: string;
};

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string, role: UserRole, area?: string, verificationCode?: string) => Promise<SignupResult>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<PasswordUpdateResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const auth = useAuthService();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        auth.setSession(session);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setAppUser(null);
          auth.setUser(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      auth.setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const profile = await auth.fetchUserProfile(userId);
    
    if (profile) {
      const userEmail = auth.session?.user?.email || '';
      
      setAppUser({
        id: profile.id,
        name: profile.name || '',
        email: profile.email || userEmail,
        role: profile.role as UserRole,
        area: profile.area
      });

      auth.setUser(auth.session?.user || null);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<PasswordUpdateResult> => {
    try {
      if (!auth.session?.user) {
        return { success: false, message: "Not authenticated" };
      }
      
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: auth.session.user.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        return { 
          success: false, 
          message: "Current password is incorrect" 
        };
      }
      
      // Then update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        return { 
          success: false, 
          message: updateError.message 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating password:", error);
      return { 
        success: false, 
        message: "An unexpected error occurred" 
      };
    }
  };

  const value = {
    user: appUser,
    session: auth.session,
    isAuthenticated: !!appUser,
    login: auth.login,
    signupWithEmail: auth.signupWithEmail,
    signInWithGoogle: auth.signInWithGoogle,
    signInWithApple: auth.signInWithApple,
    logout: auth.logout,
    checkEmailExists: auth.checkEmailExists,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

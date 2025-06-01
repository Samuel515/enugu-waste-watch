
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const auth = useAuthService();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        auth.setSession(session);
        
        if (session?.user) {
          try {
            const profile = await auth.fetchUserProfile(session.user.id);
            
            if (profile) {
              const userEmail = session.user.email || '';
              
              setAppUser({
                id: profile.id,
                name: profile.name || '',
                email: profile.email || userEmail,
                role: profile.role as UserRole,
                area: profile.area
              });

              auth.setUser(session.user);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setAppUser(null);
            auth.setUser(null);
          }
        } else {
          setAppUser(null);
          auth.setUser(null);
        }
        
        setIsInitializing(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      auth.setSession(session);
      
      if (session?.user) {
        auth.fetchUserProfile(session.user.id).then(profile => {
          if (profile) {
            const userEmail = session.user.email || '';
            
            setAppUser({
              id: profile.id,
              name: profile.name || '',
              email: profile.email || userEmail,
              role: profile.role as UserRole,
              area: profile.area
            });

            auth.setUser(session.user);
          }
          setIsInitializing(false);
        });
      } else {
        setIsInitializing(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Don't render children until auth state is determined
  if (isInitializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waste-green"></div>
    </div>;
  }

  const value = {
    user: appUser,
    session: auth.session,
    isAuthenticated: !!appUser,
    login: auth.login,
    signupWithEmail: auth.signupWithEmail,
    signInWithGoogle: auth.signInWithGoogle,
    signInWithApple: auth.signInWithApple,
    logout: auth.logout,
    checkEmailExists: auth.checkEmailExists
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

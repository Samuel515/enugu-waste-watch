
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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsInitializing(false);
          }
          return;
        }

        console.log('Initial session:', session ? 'exists' : 'none');
        
        // Set session in auth service
        auth.setSession(session);
        
        if (session?.user) {
          console.log('User found in session, fetching profile...');
          
          try {
            const profile = await auth.fetchUserProfile(session.user.id);
            
            if (profile && mounted) {
              console.log('Profile fetched successfully:', profile);
              
              setAppUser({
                id: profile.id,
                name: profile.name || '',
                email: profile.email || session.user.email || '',
                role: profile.role as UserRole,
                area: profile.area
              });

              auth.setUser(session.user);
            } else if (mounted) {
              console.log('No profile found, clearing user state');
              setAppUser(null);
              auth.setUser(null);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            if (mounted) {
              setAppUser(null);
              auth.setUser(null);
            }
          }
        } else {
          console.log('No user in session, clearing state');
          if (mounted) {
            setAppUser(null);
            auth.setUser(null);
          }
        }
        
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete');
          setIsInitializing(false);
        }
      }
    };

    // Initialize auth immediately
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'session exists' : 'no session');
        
        if (!mounted) return;
        
        // Update auth service state
        auth.setSession(session);
        
        if (session?.user) {
          try {
            const profile = await auth.fetchUserProfile(session.user.id);
            
            if (profile && mounted) {
              setAppUser({
                id: profile.id,
                name: profile.name || '',
                email: profile.email || session.user.email || '',
                role: profile.role as UserRole,
                area: profile.area
              });

              auth.setUser(session.user);
            } else if (mounted) {
              setAppUser(null);
              auth.setUser(null);
            }
          } catch (error) {
            console.error('Error fetching user profile in auth change:', error);
            if (mounted) {
              setAppUser(null);
              auth.setUser(null);
            }
          }
        } else {
          if (mounted) {
            setAppUser(null);
            auth.setUser(null);
          }
        }
      }
    );

    return () => {
      console.log('Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading spinner while initializing
  if (isInitializing) {
    console.log('Auth context still initializing...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waste-green"></div>
      </div>
    );
  }

  console.log('Auth context ready, user:', appUser ? 'authenticated' : 'not authenticated');

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

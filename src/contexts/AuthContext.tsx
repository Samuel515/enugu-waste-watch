
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string, role: UserRole, area?: string, verificationCode?: string) => Promise<SignupResult>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const auth = useAuthService();

  // Store the intended URL when user tries to access a protected route
  const storeIntendedUrl = () => {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    if (currentPath !== '/auth' && currentPath !== '/') {
      localStorage.setItem('intendedUrl', currentPath);
      console.log('Stored intended URL:', currentPath);
    }
  };

  // Get and clear the stored URL
  const getAndClearIntendedUrl = () => {
    const storedUrl = localStorage.getItem('intendedUrl');
    localStorage.removeItem('intendedUrl');
    return storedUrl;
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: number;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Set a timeout to prevent hanging
        timeoutId = window.setTimeout(() => {
          if (mounted && !authInitialized) {
            console.warn('Auth initialization timeout, proceeding without session');
            setIsLoading(false);
            setAuthInitialized(true);
          }
        }, 10000); // 10 seconds timeout

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
            setAuthInitialized(true);
          }
          return;
        }

        console.log('Session check complete:', session ? 'Session found' : 'No session');

        if (mounted) {
          auth.setSession(session);
          
          if (session?.user) {
            console.log('User found in session, fetching profile...');
            await fetchUserProfile(session.user.id);
          } else {
            setAppUser(null);
            auth.setUser(null);
          }
          
          setIsLoading(false);
          setAuthInitialized(true);
          
          // Clear the timeout since we completed successfully
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (!mounted) return;

        // Don't process events until initial auth is complete
        if (!authInitialized && event !== 'INITIAL_SESSION') {
          console.log('Ignoring auth event until initialization complete');
          return;
        }

        auth.setSession(session);
        
        if (session?.user) {
          console.log('Auth state change: User signed in, fetching profile...');
          await fetchUserProfile(session.user.id);
          
          // Handle redirect after successful authentication
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Small delay to ensure profile is loaded
            setTimeout(() => {
              const intendedUrl = getAndClearIntendedUrl();
              const redirectUrl = intendedUrl || '/dashboard';
              console.log('Redirecting to:', redirectUrl);
              window.location.href = redirectUrl;
            }, 100);
          }
        } else {
          console.log('Auth state change: User signed out');
          setAppUser(null);
          auth.setUser(null);
          
          // Store current URL if user is being redirected to auth
          if (event === 'SIGNED_OUT') {
            storeIntendedUrl();
          }
        }
        
        if (isLoading) {
          setIsLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
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
        console.log('User profile loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const value = {
    user: appUser,
    session: auth.session,
    isAuthenticated: !!appUser,
    isLoading,
    login: auth.login,
    signupWithEmail: auth.signupWithEmail,
    signInWithGoogle: auth.signInWithGoogle,
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

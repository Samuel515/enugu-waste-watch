
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuthService } from "@/hooks/useAuthService";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const fetchUserProfile = async (userId: string): Promise<boolean> => {
    try {
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );
      
      const profilePromise = auth.fetchUserProfile(userId);
      const profile = await Promise.race([profilePromise, timeoutPromise]) as any;
      
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
        return true;
      } else {
        console.warn('No profile found for user:', userId);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't block auth flow if profile fetch fails
      // Set basic user data from session
      if (auth.session?.user) {
        setAppUser({
          id: auth.session.user.id,
          name: auth.session.user.email?.split('@')[0] || '',
          email: auth.session.user.email || '',
          role: 'resident' as UserRole,
          area: undefined
        });
        auth.setUser(auth.session.user);
        console.log('Set basic user data due to profile fetch error');
      }
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: number;

    const initializeAuth = async () => {
      try {        
        // Set a timeout to prevent hanging
        timeoutId = window.setTimeout(() => {
          if (mounted && !authInitialized) {
            console.warn('Auth initialization timeout, proceeding without session');
            setIsLoading(false);
            setAuthInitialized(true);
          }
        }, 6000);

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

        if (mounted) {
          auth.setSession(session);
          
          if (session?.user) {
            const profileFetched = await fetchUserProfile(session.user.id);
            if (!profileFetched) {
              console.warn('Profile fetch failed, but continuing with session');
            }
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
        if (!mounted) return;

        auth.setSession(session);
        
        if (session?.user) {
          
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(async () => {
            try {
              const profileFetched = await fetchUserProfile(session.user.id);
              
              // Handle redirect after successful authentication
              if (event === 'SIGNED_IN') {
                // Small delay to ensure profile is loaded
                setTimeout(() => {
                  const intendedUrl = getAndClearIntendedUrl();
                  if (intendedUrl && intendedUrl !== '/auth') {
                    navigate(intendedUrl, { replace: true });
                  } else {
                    console.log('Redirecting to dashboard');
                    navigate('/dashboard', { replace: true });
                  }
                }, 100);
              }
            } catch (error) {
              console.error('Profile fetch failed in auth state change:', error);
            }
          }, 0);
        } else {
          console.log('Auth state change: User signed out');
          setAppUser(null);
          auth.setUser(null);
          
          // Store current URL if user is being redirected to auth
          if (event === 'SIGNED_OUT') {
            storeIntendedUrl();
          }
        }
        
        // Ensure loading is set to false after auth state changes
        setIsLoading(false);
        setAuthInitialized(true);
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
  }, [navigate]);

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

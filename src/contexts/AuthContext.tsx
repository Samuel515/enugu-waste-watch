
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

// Define user roles
export type UserRole = "resident" | "official" | "admin";

// Define user type
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area?: string;
  phoneNumber?: string;
}

// Define auth context type
interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string, role: UserRole, area?: string) => Promise<void>;
  signupWithPhone: (name: string, phoneNumber: string, password: string, role: UserRole, area?: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  verifyPhone: (phoneNumber: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkPhoneExists: (phoneNumber: string) => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        setSession(session);
        
        // If session exists, fetch user profile
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name || '',
          email: session?.user?.email || '',
          role: profile.role as UserRole,
          area: profile.area,
          phoneNumber: profile.phone_number
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Check if email exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        filter: {
          email: email
        }
      });

      if (error) {
        console.error('Error checking email existence:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  // Check if phone exists
  const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        filter: {
          phone: formattedPhone
        }
      });

      if (error) {
        console.error('Error checking phone existence:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking phone existence:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signupWithEmail = async (name: string, email: string, password: string, role: UserRole, area?: string) => {
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      
      if (emailExists) {
        toast({
          title: "Signup failed",
          description: "This email is already registered. Please use a different email or try logging in.",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            area
          }
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Signup Successful",
        description: "Please check your email to confirm your account. You'll need to confirm your email before logging in."
      });
      
      // Redirect back to auth page with email prefilled
      navigate(`/auth?tab=login&email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const signupWithPhone = async (name: string, phoneNumber: string, password: string, role: UserRole, area?: string) => {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    try {
      // Check if phone already exists
      const phoneExists = await checkPhoneExists(formattedPhone);
      
      if (phoneExists) {
        toast({
          title: "Signup failed",
          description: "This phone number is already registered. Please use a different number or try logging in.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password,
        options: {
          data: {
            name,
            role,
            area,
            phone_number: formattedPhone
          }
        }
      });
      
      if (error) {
        toast({
          title: "Phone signup failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Phone Signup Successful",
        description: "Please verify your phone number with the code sent to continue."
      });
      
      // Navigate to verification page with phone number as state
      navigate(`/auth?tab=verify&phone=${encodeURIComponent(formattedPhone)}`);
    } catch (error: any) {
      console.error("Phone signup error:", error);
      throw error;
    }
  };

  const verifyPhone = async (phoneNumber: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms'
      });
      
      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Verification successful",
        description: "Your phone number has been verified. You are now logged in."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Verification error:", error);
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string, password: string) => {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password
      });
      
      if (error) {
        toast({
          title: "Phone login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Phone login error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        toast({
          title: "Google login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('Google auth initiated:', data);
    } catch (error: any) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast({
          title: "Apple login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('Apple auth initiated:', data);
    } catch (error: any) {
      console.error("Apple login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      
      // Redirect to homepage after logout
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Helper function to format phone number to E.164 format
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, remove it and add +234
    if (digitsOnly.startsWith('0')) {
      return '+234' + digitsOnly.substring(1);
    }
    
    // If it doesn't start with 0, just add +234
    return '+234' + digitsOnly;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated: !!user, 
      login, 
      signupWithEmail,
      signupWithPhone,
      signInWithPhone,
      signInWithGoogle,
      signInWithApple,
      verifyPhone,
      logout,
      checkEmailExists,
      checkPhoneExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

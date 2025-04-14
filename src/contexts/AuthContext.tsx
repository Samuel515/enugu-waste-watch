import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export type UserRole = "resident" | "official" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string, role: UserRole, area?: string) => Promise<void>;
  signupWithPhone: (name: string, phone: string, password: string, role: UserRole, area?: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  verifyPhone: (phoneNumber: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkPhoneExists: (phone: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [needPhoneVerification, setNeedPhoneVerification] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        setSession(session);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

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
        const userEmail = session?.user?.email || '';
        
        setUser({
          id: profile.id,
          name: profile.name || '',
          email: profile.email || userEmail,
          role: profile.role as UserRole,
          area: profile.area,
          phoneNumber: profile.phone_number
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .limit(1);
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error checking email in profiles:", profileError);
      }
      
      if (profileData && profileData.length > 0) {
        console.log("Email found in profiles table");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', formattedPhone)
        .limit(1);
      
      if (error) {
        console.error("Error checking phone existence:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking phone existence:", error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not verified",
            description: "Please check your email and verify your account before logging in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
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
    setIsLoading(true);
    
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => navigate('/auth?tab=login'), 2000);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            area,
          },
          emailRedirectTo: `${window.location.origin}/auth?tab=login&reason=email-verification`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        await supabase
          .from('profiles')
          .update({ email })
          .eq('id', data.user.id);
      }
      
      if (data.user) {
        console.log("Registration successful, email verification required");
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithPhone = async (name: string, phone: string, password: string, role: UserRole, area?: string) => {
    setIsLoading(true);
    
    try {
      const formattedPhone = phone.startsWith('0')
        ? '+234' + phone.substring(1)
        : phone.startsWith('+234')
          ? phone
          : '+234' + phone;
      
      const phoneExists = await checkPhoneExists(formattedPhone);
      if (phoneExists) {
        toast({
          title: "Account exists",
          description: "This phone number is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => navigate('/auth?tab=login'), 2000);
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
          data: {
            name,
            role,
            area,
            password,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      setNeedPhoneVerification(true);
      setPhone(formattedPhone);
      
      navigate(`/auth?tab=verify&phone=${encodeURIComponent(formattedPhone)}`);
      
      toast({
        title: "Verification required",
        description: "Please enter the verification code sent to your phone.",
      });
    } catch (error: any) {
      console.error("Phone signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = async (phoneNumber: string, token: string) => {
    try {
      console.log("Verifying phone:", phoneNumber, "with token:", token);
      
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
      
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const formatPhoneNumber = (phoneNumber: string): string => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (digitsOnly.startsWith('0')) {
      return '+234' + digitsOnly.substring(1);
    }
    
    if (!digitsOnly.startsWith('+234') && !digitsOnly.startsWith('234')) {
      return '+234' + digitsOnly;
    }
    
    return digitsOnly.startsWith('+') ? digitsOnly : '+' + digitsOnly;
  };

  const value = {
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


import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/contexts/AuthContext";

export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      console.log("Checking if email exists:", email);
      
      const { data, error } = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      });
      
      if (error) {
        console.error("Error checking email existence:", error);
        throw error;
      }
      
      console.log("Email exists check result:", data);
      return data?.exists || false;
    } catch (error) {
      console.error("Error checking email existence:", error);
      // Default to false on error to prevent potential duplicates
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
        setTimeout(() => navigate('/auth?tab=login&reason=email-exists'), 2000);
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
        return { success: true, email };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithPhone = async (name: string, phone: string, password: string, role: UserRole, area?: string) => {
    setIsLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      const phoneExists = await checkPhoneExists(formattedPhone);
      if (phoneExists) {
        toast({
          title: "Account exists",
          description: "This phone number is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => navigate('/auth?tab=login&reason=phone-exists'), 2000);
        return { success: false, exists: true };
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
      
      return { success: true, phone: formattedPhone };
    } catch (error: any) {
      console.error("Phone signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
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

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    fetchUserProfile,
    checkEmailExists,
    checkPhoneExists,
    login,
    signupWithEmail,
    signupWithPhone,
    verifyPhone,
    signInWithPhone,
    signInWithGoogle,
    signInWithApple,
    logout,
    formatPhoneNumber
  };
};

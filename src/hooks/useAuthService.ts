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
      return false;
    }
  };

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      // Format the phone number with 234 prefix for comparison
      const digitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = `234${digitsOnly.slice(-10)}`;
      console.log("Checking if phone exists:", formattedPhone);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, phone_number')
        .eq('phone_number', formattedPhone)
        .limit(1);
      
      if (error) {
        console.error("Error checking phone existence:", error);
        return false;
      }
      
      console.log("Phone exists check result:", data);
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
      
      // Store registration data in localStorage to retrieve during verification
      const registrationData = {
        name,
        phoneNumber: formattedPhone,
        password,
        role,
        area
      };
      
      localStorage.setItem('phoneRegistrationData', JSON.stringify(registrationData));
      
      // Only send OTP without creating the user
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: false
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
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Extract the last 10 digits
    const lastTenDigits = digitsOnly.slice(-10);
    
    // Always return with +234 prefix
    return `+234${lastTenDigits}`;
  };

  const verifyPhone = async (phoneNumber: string, token: string) => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log("Verifying phone:", formattedPhone, "with token:", token);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
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
      
      // If verification successful and we have registration data, create the user
      const registrationDataString = localStorage.getItem('phoneRegistrationData');
      
      if (registrationDataString) {
        const regData = JSON.parse(registrationDataString);
        
        // User is now verified and logged in
        if (data.session && data.user) {
          // Update the user's metadata
          await supabase.auth.updateUser({
            password: regData.password,
            data: {
              name: regData.name,
              role: regData.role,
              area: regData.area,
            }
          });
          
          // Create/update profile record with phone number
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: regData.name,
              role: regData.role,
              area: regData.area,
              phone_number: phoneNumber
            });
          
          // Clear registration data
          localStorage.removeItem('phoneRegistrationData');
        }
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
    try {
      // Format the phone number with +234 prefix
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log("Signing in with phone:", formattedPhone);
      
      // Check if user exists with exact phone number match
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, phone_number')
        .eq('phone_number', formattedPhone);
      
      if (profileError || !profiles || profiles.length === 0) {
        console.error("No user found with this phone number");
        toast({
          title: "Phone login failed",
          description: "No account found with this phone number. Please register first.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Found matching profiles:", profiles);
      
      // Send OTP for verification
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { shouldCreateUser: false }
      });
      
      if (error) {
        toast({
          title: "Phone login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Store the password to be used after verification
      localStorage.setItem('phoneLoginPassword', password);
      
      toast({
        title: "Verification code sent",
        description: "Please enter the verification code sent to your phone."
      });
      
      // Navigate to verification page
      navigate(`/auth?tab=verify&phone=${encodeURIComponent(formattedPhone)}`);
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

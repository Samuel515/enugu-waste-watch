
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
      
      // Get intended URL or default to dashboard
      const intendedUrl = localStorage.getItem('intendedUrl');
      localStorage.removeItem('intendedUrl');
      const redirectUrl = intendedUrl || '/dashboard';
      
      console.log('Login: Redirecting to:', redirectUrl);
      navigate(redirectUrl);
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signupWithEmail = async (name: string, email: string, password: string, role: UserRole, area?: string, verificationCode?: string) => {
    setIsLoading(true);
    
    try {
      // Check verification code for official and admin roles
      if ((role === "official" || role === "admin") && verificationCode !== "id^%Sbjs()2b{#$@}") {
        return { success: false, error: "Invalid verification code" };
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => navigate('/auth?tab=login&reason=email-exists'), 2000);
        return { success: false, exists: true };
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
          emailRedirectTo: `https://enuguwaste.com.ng/auth?tab=login&reason=email-verification`,
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

  const signInWithGoogle = async () => {
    try {
      // Store current URL before initiating OAuth
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (currentPath !== '/auth' && currentPath !== '/') {
        localStorage.setItem('intendedUrl', currentPath);
        console.log('Google auth: Storing intended URL:', currentPath);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://enuguwaste.com.ng/dashboard`,
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
      
      // Clear any stored intended URL
      localStorage.removeItem('intendedUrl');
      
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
    login,
    signupWithEmail,
    signInWithGoogle,
    logout
  };
};


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        // Parse the URL hash for OAuth tokens
        const hash = window.location.hash;
        
        if (hash) {
          // Remove the # from the hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('Processing OAuth tokens...');
            
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session:', error);
              toast({
                title: "Authentication Error",
                description: "Failed to complete authentication. Please try again.",
                variant: "destructive",
              });
              navigate('/auth');
              return;
            }

            if (data && data.session) {
              console.log('OAuth authentication successful');
              toast({
                title: "Login Successful",
                description: "Welcome! Redirecting...",
              });

              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);

              // Get intended URL or default to dashboard
              const intendedUrl = localStorage.getItem('intendedUrl');
              localStorage.removeItem('intendedUrl');
              const redirectUrl = intendedUrl || '/dashboard';
              
              console.log('OAuth: Redirecting to:', redirectUrl);
              
              // Use window.location.href for more reliable redirect
              window.location.href = redirectUrl;
              return;
            }
          }
        }
        
        // If no valid tokens found, check for existing session
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session) {
          const intendedUrl = localStorage.getItem('intendedUrl');
          localStorage.removeItem('intendedUrl');
          const redirectUrl = intendedUrl || '/dashboard';
          console.log('Existing session found, redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.log('No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "Something went wrong during authentication.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

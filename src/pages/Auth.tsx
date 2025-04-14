
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import AuthTabs from "@/components/auth/AuthTabs";
import { Leaf } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "login";
  const redirectReason = searchParams.get("reason");
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // If user is already authenticated and not on the verify tab, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && defaultTab !== "verify") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, defaultTab]);

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12 px-4">
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="bg-waste-green rounded-full p-3 mb-3">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center">Enugu Waste Watch</h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Join the community to report waste issues and track collections
            </p>
          </div>
        </div>
        
        {redirectReason === "email-exists" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Email already registered</AlertTitle>
            <AlertDescription>
              This email is already associated with an account. Please sign in with your existing account.
            </AlertDescription>
          </Alert>
        )}
        
        {redirectReason === "phone-exists" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Phone number already registered</AlertTitle>
            <AlertDescription>
              This phone number is already associated with an account. Please sign in with your existing account.
            </AlertDescription>
          </Alert>
        )}

        {redirectReason === "email-verification" && (
          <Alert className="mb-4 border-waste-green bg-waste-green/10">
            <AlertTitle>Email verification required</AlertTitle>
            <AlertDescription>
              Please check your email and click the verification link before logging in.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-card shadow-lg rounded-lg p-6 border">
          <AuthTabs defaultTab={defaultTab} />
        </div>
      </div>
    </Layout>
  );
};

export default Auth;


import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import AuthTabs from "@/components/auth/AuthTabs";
import { Leaf } from "lucide-react";

const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "login";
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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
        
        <div className="bg-card shadow-lg rounded-lg p-6 border">
          <AuthTabs />
        </div>
      </div>
    </Layout>
  );
};

export default Auth;

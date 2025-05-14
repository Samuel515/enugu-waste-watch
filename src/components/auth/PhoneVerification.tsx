
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const PhoneVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect users as phone verification is no longer available
    toast({
      title: "Phone authentication removed",
      description: "Phone authentication has been removed from the application.",
      variant: "destructive",
    });
    navigate("/auth?tab=login");
  }, [navigate, toast]);

  return null;
};

export default PhoneVerification;

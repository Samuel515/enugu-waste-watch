
import { useState } from "react";
import EmailRegisterForm from "./EmailRegisterForm";
import SocialLoginButtons from "./SocialLoginButtons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <EmailRegisterForm 
        setShowSuccessDialog={setShowSuccessDialog}
        setRegisteredEmail={setRegisteredEmail}
      />

      <SocialLoginButtons />

      {/* Email Verification Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Verify Your Email</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center p-4">
            <Mail className="h-16 w-16 text-waste-green mb-4" />
            <h3 className="text-lg font-medium">Registration Successful!</h3>
            <p className="text-center mt-2 mb-4 text-muted-foreground">
              We've sent a confirmation link to:
              <span className="block font-medium text-foreground mt-1">{registeredEmail}</span>
            </p>
            <p className="text-center text-sm mb-6">
              Please check your inbox and click the verification link to activate your account.
              <span className="block mt-2">You must verify your email before logging in.</span>
            </p>
            <Button 
              className="w-full" 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/auth?tab=login&reason=email-verification');
              }}
            >
              Go to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterForm;

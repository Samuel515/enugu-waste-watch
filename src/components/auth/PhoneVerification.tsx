
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Smartphone } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const PhoneVerification = () => {
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get("phone") || "";
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const [resendTime, setResendTime] = useState(60);
  const [isFromLogin, setIsFromLogin] = useState(false);
  
  const { verifyPhone } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this verification is from login by checking localStorage
    const hasLoginPassword = !!localStorage.getItem('phoneLoginPassword');
    setIsFromLogin(hasLoginPassword);
    
    // If no phone number is provided, redirect to login
    if (!phoneNumber) {
      toast({
        title: "Missing information",
        description: "Phone number is required for verification",
        variant: "destructive",
      });
      navigate("/auth?tab=login");
    }
  }, [phoneNumber, navigate, toast]);

  // Countdown timer for resend button
  useEffect(() => {
    if (hasResent && resendTime > 0) {
      const timer = setTimeout(() => {
        setResendTime(resendTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTime === 0) {
      setHasResent(false);
      setResendTime(60);
    }
  }, [hasResent, resendTime]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verifyPhone(phoneNumber, verificationCode);
      toast({
        title: "Success",
        description: isFromLogin ? 
          "Phone number verified and logged in successfully" : 
          "Phone number verified and account created successfully"
      });
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification failed",
        description: "The code you entered is incorrect or has expired. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Clear temporary login data
      localStorage.removeItem('phoneLoginPassword');
    }
  };

  const handleResend = async () => {
    try {
      setHasResent(true);
      
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Resend OTP
      await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          shouldCreateUser: false
        }
      });
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone number",
      });
    } catch (error) {
      console.error("Error resending code:", error);
      toast({
        title: "Failed to resend code",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Format the phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    // Extract the last 10 digits if it's longer
    const digitsOnly = phone.replace(/\D/g, '');
    const lastTenDigits = digitsOnly.slice(-10);
    
    if (lastTenDigits.length === 10) {
      return `+234 ${lastTenDigits.substring(0, 3)} ${lastTenDigits.substring(3, 6)} ${lastTenDigits.substring(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="bg-waste-green/20 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <Smartphone className="h-8 w-8 text-waste-green" />
        </div>
        <h2 className="text-xl font-medium">{isFromLogin ? "Verify to Log In" : "Verify Your Phone Number"}</h2>
        <p className="text-muted-foreground text-sm mt-2">
          We've sent a verification code to <span className="font-medium">{formatPhoneForDisplay(phoneNumber)}</span>
        </p>
      </div>
      
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-center mb-2">
            <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Enter the 6-digit code we sent to your phone
          </p>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 6}>
          {isLoading ? "Verifying..." : "Verify Phone Number"}
        </Button>
      </form>
      
      <p className="text-center text-sm text-muted-foreground">
        Didn't receive a code?{" "}
        {hasResent ? (
          <span className="text-sm">Resend in {resendTime}s</span>
        ) : (
          <Button variant="link" onClick={handleResend} className="p-0 h-auto">
            Resend
          </Button>
        )}
      </p>
    </div>
  );
};

export default PhoneVerification;

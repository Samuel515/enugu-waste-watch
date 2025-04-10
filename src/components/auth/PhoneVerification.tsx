
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";

const PhoneVerification = () => {
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get("phone") || "";
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { verifyPhone } = useAuth();
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verifyPhone(phoneNumber, verificationCode);
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="bg-waste-green/20 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-waste-green" />
        </div>
        <h2 className="text-xl font-medium">Verify Your Phone Number</h2>
        <p className="text-muted-foreground text-sm mt-2">
          We've sent a verification code to <span className="font-medium">{phoneNumber}</span>
        </p>
      </div>
      
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="verificationCode">Verification Code</Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => {
              // Only allow numbers and limit to 6 digits
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                setVerificationCode(value);
              }
            }}
            className="text-center text-lg letter-spacing-wide"
            disabled={isLoading}
            maxLength={6}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Phone Number"}
        </Button>
      </form>
      
      <p className="text-center text-sm text-muted-foreground">
        Didn't receive a code? <Button variant="link" className="p-0 h-auto">Resend</Button>
      </p>
    </div>
  );
};

export default PhoneVerification;

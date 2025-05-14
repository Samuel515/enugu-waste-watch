
import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock } from "lucide-react";
import { RoleAndAreaSelector } from "./RoleAndAreaSelector";

// Verification code for officials and admins
const VERIFICATION_CODE = "id^%Sbjs()2b{#$@}";

interface EmailRegisterFormProps {
  setShowSuccessDialog: (show: boolean) => void;
  setRegisteredEmail: (email: string) => void;
}

const EmailRegisterForm = ({ setShowSuccessDialog, setRegisteredEmail }: EmailRegisterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("resident");
  const [area, setArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationValid, setVerificationValid] = useState(true);
  
  const { signupWithEmail, checkEmailExists } = useAuth();
  const { toast } = useToast();

  // Validate verification code when it changes or when role changes
  useEffect(() => {
    if (role === "official" || role === "admin") {
      setVerificationValid(verificationCode === VERIFICATION_CODE || verificationCode === "");
    } else {
      setVerificationValid(true);
    }
  }, [verificationCode, role]);

  const handleEmailBlur = async () => {
    if (email && email.includes("@")) {
      setCheckingEmail(true);
      
      try {
        const exists = await checkEmailExists(email);
        setEmailExists(exists);
        
        if (exists) {
          toast({
            title: "Email already registered",
            description: "This email is already registered. Please use a different email or sign in.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking email:", error);
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (role === "resident" && !area) {
      toast({
        title: "Error",
        description: "Please specify your area",
        variant: "destructive",
      });
      return;
    }

    // Check verification code for officials and admins
    if ((role === "official" || role === "admin") && verificationCode !== VERIFICATION_CODE) {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
      setVerificationValid(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Double-check email existence
      const exists = await checkEmailExists(email);
      
      if (exists) {
        setEmailExists(true);
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please use a different email or sign in.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const result = await signupWithEmail(name, email, password, role, role === "resident" ? area : undefined, verificationCode);
      
      if (result && result.success) {
        setRegisteredEmail(email);
        setShowSuccessDialog(true);
        
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("resident");
        setArea("");
        setVerificationCode("");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "There was an error during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className={`relative flex items-center ${emailExists ? "border-red-500 border rounded-md" : ""}`}>
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Reset the exists flag when user types
              if (emailExists) {
                setEmailExists(false);
              }
            }}
            onBlur={handleEmailBlur}
            className={`pl-10`}
            disabled={isLoading || checkingEmail}
          />
        </div>
        {emailExists && (
          <p className="text-sm text-red-500 mt-1">
            This email is already registered.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <RoleAndAreaSelector 
        role={role}
        setRole={setRole}
        area={area}
        setArea={setArea}
        isLoading={isLoading}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        verificationValid={verificationValid}
      />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || checkingEmail || emailExists || ((role === "official" || role === "admin") && !verificationValid)}
      >
        {isLoading ? "Creating account..." : checkingEmail ? "Checking email..." : "Sign Up with Email"}
      </Button>
    </form>
  );
};

export default EmailRegisterForm;

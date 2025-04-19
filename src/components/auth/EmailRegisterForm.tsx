import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleAndAreaSelector } from "./RoleAndAreaSelector";

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
  
  const { signupWithEmail, checkEmailExists } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailBlur = async () => {
    if (email && email.includes('@')) {
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

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
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

    if (emailExists) {
      toast({
        title: "Email already registered",
        description: "Please use a different email or sign in with your existing account.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // One final check for email existence
      const exists = await checkEmailExists(email);
      if (exists) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => {
          navigate('/auth?tab=login&reason=email-exists');
        }, 2000);
        return;
      }
      
      await signupWithEmail(name, email, password, role, role === "resident" ? area : undefined);
      // Store the email and show success dialog
      setRegisteredEmail(email);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailSignup} className="space-y-4">
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
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailExists(false);
            }}
            onBlur={handleEmailBlur}
            className={`pl-10 ${emailExists ? "border-red-500" : ""}`}
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
      />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || checkingEmail || emailExists}
      >
        {isLoading ? "Creating account..." : checkingEmail ? "Checking email..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default EmailRegisterForm;

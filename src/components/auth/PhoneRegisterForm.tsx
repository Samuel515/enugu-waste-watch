
import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleAndAreaSelector } from "./RoleAndAreaSelector";

const PhoneRegisterForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("resident");
  const [area, setArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  
  const { signupWithPhone, checkPhoneExists } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhoneBlur = async () => {
    if (phoneNumber && phoneNumber.length >= 10) {
      setCheckingPhone(true);
      try {
        const exists = await checkPhoneExists(phoneNumber);
        setPhoneExists(exists);
        if (exists) {
          toast({
            title: "Phone number already registered",
            description: "This phone number is already registered. Please use a different number or sign in.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking phone:", error);
      } finally {
        setCheckingPhone(false);
      }
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!name || !phoneNumber || !password || !confirmPassword || !role) {
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

    if (phoneExists) {
      toast({
        title: "Phone number already registered",
        description: "Please use a different phone number or sign in with your existing account.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // One final check for phone existence
      const exists = await checkPhoneExists(phoneNumber);
      if (exists) {
        toast({
          title: "Phone number already registered",
          description: "This phone number is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => {
          navigate('/auth?tab=login&reason=phone-exists');
        }, 2000);
        return;
      }
      
      const result = await signupWithPhone(name, phoneNumber, password, role, role === "resident" ? area : undefined);
      if (result && result.success && result.phone) {
        // Redirect to verification page
        navigate(`/auth?tab=verify&phone=${encodeURIComponent(result.phone)}`);
      }
    } catch (error) {
      console.error("Phone registration error:", error);
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
    <form onSubmit={handlePhoneSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name-phone">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="name-phone"
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
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-14 border-r bg-muted text-muted-foreground rounded-l-md">
            <Phone className="h-4 w-4 mr-1" />
            <span className="text-sm">+234</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="8012345678"
            value={phoneNumber}
            onChange={(e) => {
              // Only allow up to 10 digits and remove non-digit characters
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 10) {
                setPhoneNumber(value);
                setPhoneExists(false);
              }
            }}
            onBlur={handlePhoneBlur}
            className={`pl-16 ${phoneExists ? "border-red-500" : ""}`}
            disabled={isLoading || checkingPhone}
          />
        </div>
        {phoneExists && (
          <p className="text-sm text-red-500 mt-1">
            This phone number is already registered.
          </p>
        )}
        <p className="text-xs text-muted-foreground">Format: Nigerian mobile number without the country code</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="phone-password"
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
          <Label htmlFor="phone-confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="phone-confirm-password"
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
        disabled={isLoading || checkingPhone || phoneExists}
      >
        {isLoading ? "Creating account..." : checkingPhone ? "Checking phone..." : "Sign Up with Phone"}
      </Button>
    </form>
  );
};

export default PhoneRegisterForm;

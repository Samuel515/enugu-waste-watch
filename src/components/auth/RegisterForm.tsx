
import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Lock, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("resident");
  const [area, setArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  
  const { signupWithEmail, signupWithPhone, signInWithGoogle, signInWithApple, checkEmailExists, checkPhoneExists } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailBlur = async () => {
    if (email && email.includes('@')) {
      setCheckingEmail(true);
      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          toast({
            title: "Email already registered",
            description: "This email is already registered. Redirecting to login...",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/auth?tab=login');
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking email:", error);
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handlePhoneBlur = async () => {
    if (phoneNumber && phoneNumber.length >= 10) {
      setCheckingPhone(true);
      try {
        const exists = await checkPhoneExists(phoneNumber);
        if (exists) {
          toast({
            title: "Phone number already registered",
            description: "This phone number is already registered. Redirecting to login...",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/auth?tab=login');
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking phone:", error);
      } finally {
        setCheckingPhone(false);
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
    
    setIsLoading(true);
    
    // First check if email exists
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => {
          navigate('/auth?tab=login');
        }, 2000);
        return;
      }
      
      await signupWithEmail(name, email, password, role, role === "resident" ? area : undefined);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
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
    
    setIsLoading(true);
    
    // First check if phone exists
    try {
      const exists = await checkPhoneExists(phoneNumber);
      if (exists) {
        toast({
          title: "Phone number already registered",
          description: "This phone number is already registered. Redirecting to login...",
          variant: "destructive",
        });
        setIsLoading(false);
        setTimeout(() => {
          navigate('/auth?tab=login');
        }, 2000);
        return;
      }
      
      await signupWithPhone(name, phoneNumber, password, role, role === "resident" ? area : undefined);
    } catch (error) {
      console.error("Phone registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleAndAreaFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resident">Resident</SelectItem>
            <SelectItem value="official">Waste Management Official</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {role === "resident" && (
        <div className="space-y-2">
          <Label htmlFor="area">Your Area</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="area"
              type="text"
              placeholder="e.g., Independence Layout"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-4">
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
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="pl-10"
                  disabled={isLoading || checkingEmail}
                />
              </div>
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
            
            {renderRoleAndAreaFields()}
            
            <Button type="submit" className="w-full" disabled={isLoading || checkingEmail}>
              {isLoading ? "Creating account..." : checkingEmail ? "Checking email..." : "Sign Up"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="phone" className="mt-4">
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
                    }
                  }}
                  onBlur={handlePhoneBlur}
                  className="pl-16"
                  disabled={isLoading || checkingPhone}
                />
              </div>
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
            
            {renderRoleAndAreaFields()}
            
            <Button type="submit" className="w-full" disabled={isLoading || checkingPhone}>
              {isLoading ? "Creating account..." : checkingPhone ? "Checking phone..." : "Sign Up with Phone"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isLoading}
        >
          <svg 
            className="mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 488 512">
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
          </svg>
          Google
        </Button>
        <Button 
          variant="outline" 
          type="button"
          onClick={() => signInWithApple()}
          disabled={isLoading}
        >
          <svg 
            className="mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 384 512">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
          Apple
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;


import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, MapPin, Phone } from "lucide-react";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [area, setArea] = useState(user?.area || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber?.replace('+234', '') || "");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Format phone number if provided
      const formattedPhone = phoneNumber ? 
        (phoneNumber.startsWith('0') ? '+234' + phoneNumber.substring(1) : '+234' + phoneNumber) : 
        user.phoneNumber;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          area: area || null,
          phone_number: formattedPhone
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout requireAuth>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground mb-8">
          Manage your personal information and preferences
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and preferences
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="fullname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Your full name"
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
                    value={user.email}
                    className="pl-10"
                    disabled
                    readOnly
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed. Please contact support if you need to update your email.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 z-10 flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">+234</span>
                  </div>
                  <Input 
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Only allow up to 11 digits and remove non-digit characters
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 11) {
                        setPhoneNumber(value);
                      }
                    }}
                    className="pl-16"
                    placeholder="8012345678"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: Nigerian mobile number without the country code
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>User Type</Label>
                <Select
                  value={user.role}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="official">Waste Management Official</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  User type cannot be changed. Please contact support if you need a different role.
                </p>
              </div>
              
              {user.role === "resident" && (
                <div className="space-y-2">
                  <Label htmlFor="area">Your Area</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="pl-10"
                      placeholder="e.g., Independence Layout"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
              
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => {
                  setName(user.name || "");
                  setArea(user.area || "");
                  setPhoneNumber((user.phoneNumber?.replace('+234', '')) || "");
                }}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;


import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Mail, Bell, Shield, AlertTriangle } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState({
    reportUpdates: true,
    collectionReminders: true,
    systemAnnouncements: false,
    tips: true
  });
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Password update failed",
        description: "An error occurred while updating your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationSettingChange = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved."
    });
  };
  
  return (
    <Layout requireAuth>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account settings and preferences
        </p>
        
        <Tabs defaultValue="password" className="space-y-8">
          <TabsList className="w-full flex-wrap h-auto py-1 md:h-10">
            <TabsTrigger value="password" className="flex-1 data-[state=active]:bg-primary">
              <span className="flex items-center gap-1">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">
              <span className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose which notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="report-updates">Report Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when your reports are updated
                    </p>
                  </div>
                  <Switch
                    id="report-updates"
                    checked={emailNotifications.reportUpdates}
                    onCheckedChange={() => handleNotificationSettingChange("reportUpdates")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="collection-reminders">Collection Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming waste collections
                    </p>
                  </div>
                  <Switch
                    id="collection-reminders"
                    checked={emailNotifications.collectionReminders}
                    onCheckedChange={() => handleNotificationSettingChange("collectionReminders")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-announcements">System Announcements</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important system updates and announcements
                    </p>
                  </div>
                  <Switch
                    id="system-announcements"
                    checked={emailNotifications.systemAnnouncements}
                    onCheckedChange={() => handleNotificationSettingChange("systemAnnouncements")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tips">Tips & Resources</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive waste management tips and educational resources
                    </p>
                  </div>
                  <Switch
                    id="tips"
                    checked={emailNotifications.tips}
                    onCheckedChange={() => handleNotificationSettingChange("tips")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security options and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-3">
                    <h3 className="text-lg font-medium">Session Management</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage your active sessions across different devices.
                    </p>
                    <Button variant="outline">Manage Sessions</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col space-y-3">
                    <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive" disabled>
                      Please contact support to delete your account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;

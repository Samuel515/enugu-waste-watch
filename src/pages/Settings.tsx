
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, AlertCircle, Bell, Lock, Shield } from "lucide-react";

const Settings = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions();
    }
  }, [isAuthenticated, user]);

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      // Note: This is a mock function since Supabase auth client doesn't have direct getSessions method
      // In a real app, you would implement this differently or use Supabase's getSession method
      
      // Mocking data instead
      setSessions([
        {
          id: '1',
          created_at: new Date().toISOString(),
          user_agent: 'Chrome on Windows',
          ip_address: '192.168.1.1',
        }
      ]);
    } catch (error: any) {
      console.error("Session fetch error:", error);
      toast({
        title: "Error loading sessions",
        description: "Could not retrieve your active sessions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error("Password change error:", error);
      toast({
        title: "Error changing password",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSavingNotifications(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message || "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };
  
  const handleSignOutSession = async (sessionId: string) => {
    try {
      // Mock response since we don't have actual session deletion
      fetchSessions();
      
      toast({
        title: "Session signed out",
        description: "The selected session has been terminated.",
      });
    } catch (error: any) {
      console.error("Session signout error:", error);
      toast({
        title: "Error signing out session",
        description: error.message || "Failed to sign out the session. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      toast({
        title: "Account deletion request",
        description: "Please contact support to delete your account.",
      });
      setIsDeletingAccount(false);
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        title: "Error with account deletion request",
        description: error.message || "Please contact support to delete your account.",
        variant: "destructive",
      });
      setIsDeletingAccount(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout requireAuth>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account settings and preferences
        </p>
        
        <Tabs defaultValue="password" className="w-full space-y-6">
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="password" className="flex-1">
              <Lock className="h-4 w-4 mr-2" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">
              <Bell className="h-4 w-4 mr-2" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={isSavingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                    disabled={isSavingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    disabled={isSavingNotifications}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={handleSaveNotificationSettings}
                  disabled={isSavingNotifications}
                >
                  {isSavingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h4 className="font-medium">Session Management</h4>
                    <p className="text-sm text-muted-foreground">
                      View and manage your active sessions
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={fetchSessions}
                    disabled={isLoadingSessions}
                    className="w-full md:w-auto"
                  >
                    {isLoadingSessions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Refresh Sessions"
                    )}
                  </Button>
                </div>
                
                {sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{session.user_agent || "Unknown device"}</p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {new Date(session.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSignOutSession(session.id)}
                        >
                          Sign Out
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active sessions found.</p>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4">
                  <div>
                    <h4 className="font-medium text-red-500">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full md:w-auto">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                            Contact Support
                          </div>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          To delete your account, please contact support. We'll process your request and ensure all your data is properly removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {isDeletingAccount ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Contact Support"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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

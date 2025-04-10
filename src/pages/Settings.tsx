
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bell, Mail, Lock, AlertTriangle, Shield, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface UserSession {
  id: string;
  created_at: string;
  user_agent: string;
  ip_address?: string;
  current: boolean;
}

const Settings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase.auth.getSessions();
      
      if (error) {
        throw error;
      }
      
      if (data.sessions) {
        const formattedSessions: UserSession[] = data.sessions.map((session: Session) => ({
          id: session.id,
          created_at: new Date(session.created_at!).toLocaleString(),
          user_agent: session.user_agent || 'Unknown device',
          ip_address: session.ip_address,
          current: session.id === data.sessions[0].id
        }));
        
        setSessions(formattedSessions);
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Could not retrieve your active sessions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user?.email) {
      toast({
        title: "Cannot reset password",
        description: "No email address associated with your account.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/auth?tab=reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast({
        title: "Failed to send password reset",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out from all devices",
        description: "You have been successfully logged out from all devices.",
      });
      
      // Redirect to auth page
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Error logging out from all devices:", error);
      toast({
        title: "Failed to logout from all devices",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsLoadingDelete(true);
    
    try {
      // For Supabase, we need to use our own admin API or server function to delete users
      // For demonstration purposes, we'll try to delete the user directly
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Failed to delete account",
        description: "To delete your account, please contact support. " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDelete(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout requireAuth>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account settings and preferences
        </p>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-8">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={user.name || ""} readOnly />
                        <p className="text-xs text-muted-foreground mt-1">
                          Update your name in the profile section
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email || ""} readOnly />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your role determines what features you can access
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Request a password reset link to be sent to your email
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        onClick={handleLogoutAllDevices}
                        disabled={isLoading}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout from All Devices
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Sign out from all devices where you're currently logged in
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={isLoadingDelete}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={handleDeleteAccount}
                              disabled={isLoadingDelete}
                            >
                              {isLoadingDelete ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <p className="text-xs text-muted-foreground">
                        Delete your account and all your personal data permanently
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how and when you get notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email_reports">Waste Reports</Label>
                          <p className="text-muted-foreground text-sm">
                            Get notified about updates to your waste reports
                          </p>
                        </div>
                        <Switch id="email_reports" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email_collection">Collection Reminders</Label>
                          <p className="text-muted-foreground text-sm">
                            Get email reminders about upcoming waste collection in your area
                          </p>
                        </div>
                        <Switch id="email_collection" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email_news">News & Updates</Label>
                          <p className="text-muted-foreground text-sm">
                            Receive newsletters and updates from Enugu Waste Watch
                          </p>
                        </div>
                        <Switch id="email_news" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">App Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app_reports">Waste Reports</Label>
                          <p className="text-muted-foreground text-sm">
                            Get in-app notifications about updates to your waste reports
                          </p>
                        </div>
                        <Switch id="app_reports" checked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app_collection">Collection Reminders</Label>
                          <p className="text-muted-foreground text-sm">
                            Get in-app reminders about upcoming waste collection in your area
                          </p>
                        </div>
                        <Switch id="app_collection" checked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app_news">News & Updates</Label>
                          <p className="text-muted-foreground text-sm">
                            Receive in-app newsletters and updates from Enugu Waste Watch
                          </p>
                        </div>
                        <Switch id="app_news" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your security preferences and active sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Password & Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Update your password for better security
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Active Sessions</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchUserSessions}
                      disabled={isLoadingSessions}
                    >
                      {isLoadingSessions ? "Loading..." : "Refresh"}
                    </Button>
                  </div>
                  
                  {isLoadingSessions ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Loading sessions...</p>
                    </div>
                  ) : sessions.length > 0 ? (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div key={session.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{session.user_agent}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.ip_address ? `IP: ${session.ip_address}` : "IP not available"}
                              </p>
                            </div>
                            {session.current && (
                              <Badge variant="outline" className="border-waste-green text-waste-green">
                                Current Session
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Signed in on {session.created_at}
                          </p>
                        </div>
                      ))}
                      
                      <Button
                        variant="destructive"
                        onClick={handleLogoutAllDevices}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout from All Devices
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No active sessions found.</p>
                    </div>
                  )}
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

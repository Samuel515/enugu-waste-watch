import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomSession {
  id: string;
  created_at: string;
  user_agent: string;
  ip: string | null;
  last_sign_in_at: string;
}

export default function SecuritySection() {
  const { user } = useAuth();
  const [emailOnLogin, setEmailOnLogin] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessions, setSessions] = useState<CustomSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data } = await supabase.auth.getSession();
        
        if (data && data.session) {
          // Format it for display - properly access session properties
          const session = data.session;
          const customSession: CustomSession = {
            id: session.access_token.substring(0, 8), // Use a part of access token as id
            created_at: new Date().toISOString(), // Use current date as fallback
            user_agent: navigator.userAgent,
            ip: null, // Not available client-side
            last_sign_in_at: new Date().toISOString() // Use current date as fallback
          };
          
          setSessions([customSession]);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchSessions();
    }
  }, [user]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const truncateUserAgent = (userAgent: string) => {
    return userAgent.length > 65 ? userAgent.substring(0, 62) + '...' : userAgent;
  };

  const getDeviceFromUserAgent = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS Device';
    } else if (userAgent.includes('Android')) {
      return 'Android Device';
    } else if (userAgent.includes('Windows')) {
      return 'Windows Device';
    } else if (userAgent.includes('Mac')) {
      return 'Mac Device';
    } else {
      return 'Unknown Device';
    }
  };
  
  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleSendEmail = () => {
    window.location.href = "mailto:support@enuguwaste.gov.ng?subject=Account%20Deletion%20Request&body=Hello%20Support,%0A%0AI%20would%20like%20to%20request%20my%20account%20deletion.%0A%0AMy%20account%20details:%0AName:%20" + (user?.name || "") + "%0AEmail:%20" + (user?.email || "") + "%0A%0AThank%20you.";
    setShowContactModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Update your account security settings
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure your security notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-signin" className="flex-1">
              Email me when a new login is detected
            </Label>
            <Switch
              id="email-signin"
              checked={emailOnLogin}
              onCheckedChange={setEmailOnLogin}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="two-factor">Two-factor authentication</Label>
              <p className="text-[0.8rem] text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-md border p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getDeviceFromUserAgent(session.user_agent)}</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Last active: {formatDate(session.last_sign_in_at)}</p>
                      <p title={session.user_agent}>Browser: {truncateUserAgent(session.user_agent)}</p>
                      {session.ip && <p>IP Address: {session.ip}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" disabled={sessions.length === 0}>
            Sign out of all other devices
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            className="w-full md:w-auto"
            onClick={handleContactSupport}
          >
            <span className="hidden md:inline">Contact support to delete account</span>
            <span className="inline md:hidden">Contact support</span>
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showContactModal} onOpenChange={setShowContactModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact Support</AlertDialogTitle>
            <AlertDialogDescription>
              To delete your account, please email our support team. They will verify your identity and process your request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const Badge = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${className || ''}`}>
      {children}
    </span>
  );
};

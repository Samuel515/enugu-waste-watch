
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationList from "@/components/notifications/NotificationList";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: "collection" | "report" | "system";
  read_at: string | null;
  for_user_id?: string;
}

// Key used for localStorage
const READ_NOTIFICATIONS_KEY = "enugu_waste_read_notifications";

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  
  // Load locally stored read notification IDs
  useEffect(() => {
    if (user) {
      const storedReadIds = localStorage.getItem(`${READ_NOTIFICATIONS_KEY}_${user.id}`);
      if (storedReadIds) {
        try {
          const parsedIds = JSON.parse(storedReadIds) as string[];
          setLocalReadIds(parsedIds);
        } catch (e) {
          console.error("Error parsing stored read notifications:", e);
          // Reset if there was an error
          localStorage.removeItem(`${READ_NOTIFICATIONS_KEY}_${user.id}`);
        }
      }
    }
  }, [user]);
  
  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`for_user_id.eq.${user.id},for_all.eq.true`)
          .order('created_at', { ascending: false }) as any;
          
        if (error) throw error;
        
        if (data) {
          const formattedNotifications: Notification[] = data.map((item: any) => {
            // Apply locally tracked read status
            const isLocallyRead = localReadIds.includes(item.id);
            
            return {
              id: item.id,
              title: item.title,
              message: item.message,
              created_at: item.created_at,
              read: isLocallyRead || item.read,
              type: item.type,
              read_at: isLocallyRead && !item.read_at ? new Date().toISOString() : item.read_at,
              for_user_id: item.for_user_id
            };
          });
          
          setNotifications(formattedNotifications);
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user, toast, localReadIds]);
  
  const storeLocalReadStatus = (ids: string[]) => {
    if (!user) return;
    
    // Update local state
    setLocalReadIds(prev => {
      const newIds = [...new Set([...prev, ...ids])];
      
      // Store in localStorage
      localStorage.setItem(`${READ_NOTIFICATIONS_KEY}_${user.id}`, JSON.stringify(newIds));
      
      return newIds;
    });
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadNotifications = notifications
        .filter(n => !n.read)
        .map(n => n.id);
        
      if (unreadNotifications.length === 0) return;
      
      // Store locally
      storeLocalReadStatus(unreadNotifications);
      
      // Update server (in background)
      const now = new Date().toISOString();
      await supabase
        .from('notifications')
        .update({ read: true, read_at: now })
        .in('id', unreadNotifications);
        
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    // Update locally first
    storeLocalReadStatus([id]);
    
    // Update server in background
    try {
      const now = new Date().toISOString();
      await supabase
        .from('notifications')
        .update({ read: true, read_at: now })
        .eq('id', id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };
  
  const filteredNotifications = notifications
    .filter(notification => {
      if (activeTab === "all") return true;
      return notification.type === activeTab;
    })
    .filter(notification => {
      if (!showUnreadOnly) return true;
      return !notification.read;
    });
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-waste-green" />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-waste-green text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? "Show All" : "Show Unread"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="report">Reports</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="flex flex-col items-center justify-center">
                  <LoaderCircle className="h-8 w-8 text-waste-green animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              </div>
            ) : (
              <NotificationList 
                notifications={filteredNotifications.map(n => ({
                  ...n,
                  timestamp: n.created_at
                }))} 
                onMarkAsRead={handleMarkAsRead}
              />
            )}
          </TabsContent>
          
          <TabsContent value="collection">
            <NotificationList 
              notifications={filteredNotifications.map(n => ({
                ...n,
                timestamp: n.created_at
              }))} 
              onMarkAsRead={handleMarkAsRead}
            />
          </TabsContent>
          
          <TabsContent value="report">
            <NotificationList 
              notifications={filteredNotifications.map(n => ({
                ...n,
                timestamp: n.created_at
              }))} 
              onMarkAsRead={handleMarkAsRead}
            />
          </TabsContent>
          
          <TabsContent value="system">
            <NotificationList 
              notifications={filteredNotifications.map(n => ({
                ...n,
                timestamp: n.created_at
              }))} 
              onMarkAsRead={handleMarkAsRead}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Notifications;

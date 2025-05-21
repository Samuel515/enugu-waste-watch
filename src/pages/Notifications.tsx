
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
  const [upcomingCollections, setUpcomingCollections] = useState<any[]>([]);
  
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
          .order('created_at', { ascending: false });
          
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

  // Fetch upcoming collections separately
  useEffect(() => {
    const fetchUpcomingCollections = async () => {
      if (!user?.area) return;
      
      try {
        const now = new Date();
        const oneDayLater = new Date(now);
        oneDayLater.setDate(oneDayLater.getDate() + 1);
        
        const { data, error } = await supabase
          .from('pickup_schedules')
          .select('*')
          .eq('area', user.area)
          .eq('status', 'scheduled')
          .gte('pickup_date', now.toISOString())
          .lt('pickup_date', oneDayLater.toISOString())
          .order('pickup_date', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setUpcomingCollections(data);
        }
      } catch (error) {
        console.error('Error fetching upcoming collections:', error);
      }
    };
    
    fetchUpcomingCollections();
  }, [user, activeTab]);
  
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

  // Generate collection notifications
  const collectionNotifications = upcomingCollections.map(collection => {
    const pickupDate = new Date(collection.pickup_date);
    const formattedDate = pickupDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      id: collection.id,
      title: "Upcoming Waste Collection",
      message: `A waste collection is scheduled for your area (${user?.area}) on ${formattedDate}. Please ensure your waste is properly sorted and ready for collection.`,
      timestamp: collection.created_at,
      read: false,
      type: "collection" as const,
      read_at: null
    };
  });

  // This is a placeholder function to handle the static collection notifications
  // It returns a Promise to match the expected type for the onMarkAsRead prop
  const handleCollectionNotification = async (id: string): Promise<void> => {
    // This is intentionally empty as these are dynamically generated notifications
    // that don't need to be marked as read in the database
    return Promise.resolve();
  };

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
              <>
                {/* Show upcoming collections in All tab too */}
                {collectionNotifications.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Upcoming Collections</h3>
                    <NotificationList 
                      notifications={collectionNotifications}
                      onMarkAsRead={handleCollectionNotification}
                    />
                  </div>
                )}
                <NotificationList 
                  notifications={filteredNotifications.map(n => ({
                    ...n,
                    timestamp: n.created_at
                  }))} 
                  onMarkAsRead={handleMarkAsRead}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="collection">
            {activeTab === "collection" && (
              <>
                {/* Display upcoming collections at the top */}
                {collectionNotifications.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Upcoming Collections</h3>
                    <NotificationList 
                      notifications={collectionNotifications}
                      onMarkAsRead={handleCollectionNotification}
                    />
                  </div>
                )}
                
                {/* Display regular collection notifications */}
                <NotificationList 
                  notifications={filteredNotifications.map(n => ({
                    ...n,
                    timestamp: n.created_at
                  }))}
                  onMarkAsRead={handleMarkAsRead}
                  isLoading={isLoading && filteredNotifications.length === 0}
                />
              </>
            )}
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

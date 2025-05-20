
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "collection" | "report" | "system";
  read_at: string | null;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkAsRead,
  isLoading = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasCollectionToday, setHasCollectionToday] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState<{area: string, time: string} | null>(null);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // Check for collection today in user's area
  useEffect(() => {
    const checkCollectionToday = async () => {
      if (!user || !user.area) return;

      try {
        setIsLoadingCollection(true);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await supabase
          .from('pickup_schedules')
          .select('*')
          .eq('area', user.area)
          .eq('status', 'scheduled')
          .gte('pickup_date', today.toISOString())
          .lt('pickup_date', tomorrow.toISOString()) as any;

        if (error) throw error;
        
        if (data && data.length > 0) {
          setHasCollectionToday(true);
          const pickupTime = new Date(data[0].pickup_date);
          setCollectionInfo({
            area: data[0].area,
            time: format(pickupTime, 'h:mm a')
          });
        } else {
          setHasCollectionToday(false);
          setCollectionInfo(null);
        }
      } catch (error) {
        console.error('Error checking collection today:', error);
      } finally {
        setIsLoadingCollection(false);
      }
    };

    checkCollectionToday();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!onMarkAsRead) return;
    
    try {
      await onMarkAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="flex flex-col items-center justify-center">
          <LoaderCircle className="h-8 w-8 text-waste-green animate-spin mb-2" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasCollectionToday && collectionInfo && (
        <div className="p-4 border-l-4 border-waste-blue bg-blue-50 rounded-lg mb-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-full bg-blue-100">
              <Bell className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Collection Today in Your Area</h4>
              <p className="text-sm text-blue-800 mt-1">
                You have a scheduled waste collection today in {collectionInfo.area} at {collectionInfo.time}.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Please ensure your waste is ready for collection.
              </p>
            </div>
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No notifications to display.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Notifications will appear here when you receive updates about waste collections or your reports.
          </p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg transition-colors ${
              notification.read ? "bg-muted/30" : "bg-muted/10 border-waste-green/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-full ${notification.read ? "bg-muted" : "bg-waste-green/10"}`}>
                  <Bell className={`h-4 w-4 ${notification.read ? "text-muted-foreground" : "text-waste-green"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    {!notification.read && (
                      <Badge className="bg-waste-green text-white text-[10px]">New</Badge>
                    )}
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.timestamp), "MMM d, yyyy • h:mm a")}
                    </p>
                    
                    {!notification.read && onMarkAsRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-primary hover:underline ml-4"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <Badge 
                className={`text-[10px] px-2 py-0 ${
                  notification.type === "collection" 
                    ? "bg-blue-100 text-blue-800"
                    : notification.type === "report" 
                    ? "bg-amber-100 text-amber-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {notification.type}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;

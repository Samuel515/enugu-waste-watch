
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define the notification context type
interface NotificationContextType {
  unreadCount: number;
  hasNewNotifications: boolean;
  refreshNotifications: () => Promise<void>;
  hasCollectionToday: boolean;
}

// Create the context
export const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  hasNewNotifications: false,
  refreshNotifications: async () => {},
  hasCollectionToday: false,
});

// Key used for localStorage
const READ_NOTIFICATIONS_KEY = "enugu_waste_read_notifications";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [hasCollectionToday, setHasCollectionToday] = useState(false);
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
          localStorage.removeItem(`${READ_NOTIFICATIONS_KEY}_${user.id}`);
        }
      }
    }
  }, [user]);

  // Function to check if there's a collection scheduled for today
  const checkTodayCollection = async () => {
    if (!user?.area) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data } = await supabase
        .from('pickup_schedules')
        .select('*')
        .eq('area', user.area)
        .eq('status', 'scheduled')
        .gte('pickup_date', today.toISOString())
        .lt('pickup_date', tomorrow.toISOString())
        .limit(1);

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking today's collection:", error);
      return false;
    }
  };

  // Function to check for upcoming collections (less than a day away)
  const checkUpcomingCollections = async () => {
    if (!user?.area) return;

    try {
      const now = new Date();
      const oneDayLater = new Date(now);
      oneDayLater.setDate(oneDayLater.getDate() + 1);
      
      const { data } = await supabase
        .from('pickup_schedules')
        .select('*')
        .eq('area', user.area)
        .eq('status', 'scheduled')
        .gte('pickup_date', now.toISOString())
        .lt('pickup_date', oneDayLater.toISOString())
        .order('pickup_date', { ascending: true })
        .limit(1);
      
      if (data && data.length > 0) {
        // Create a notification for upcoming collection
        const pickupDate = new Date(data[0].pickup_date);
        const formattedDate = pickupDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Check if we've already created a notification for this collection
        const collectionKey = `upcoming_collection_${data[0].id}`;
        const notificationCreated = localStorage.getItem(collectionKey);
        
        if (!notificationCreated) {
          // Create a notification
          const { error } = await supabase.from('notifications').insert({
            title: "Upcoming Waste Collection",
            message: `A waste collection is scheduled for your area (${user.area}) on ${formattedDate}. Please ensure your waste is properly sorted and ready for collection.`,
            type: "collection",
            for_user_id: user.id,
            created_by: null,
            for_all: false
          });
          
          if (error) {
            console.error("Error creating collection notification:", error);
          } else {
            // Mark as created in localStorage to prevent duplicate notifications
            localStorage.setItem(collectionKey, 'true');
          }
        }
      }
    } catch (error) {
      console.error("Error checking upcoming collections:", error);
    }
  };

  // Set up a listener for new reports to create notifications
  useEffect(() => {
    if (!user) return;

    // Subscribe to new reports
    const channel = supabase
      .channel('report-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'reports' }, 
        async (payload) => {
          const newReport = payload.new;
          
          // Create a notification for all users
          try {
            await supabase.from('notifications').insert({
              title: "New Waste Report Submitted",
              message: `A new waste report has been submitted at ${newReport.location}: "${newReport.title}"`,
              type: "report",
              for_all: true,
              created_by: newReport.user_id
            });
          } catch (error) {
            console.error("Error creating report notification:", error);
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Refresh notifications count and check collections
  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      // Check for unread notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .or(`for_user_id.eq.${user.id},for_all.eq.true`)
        .eq('read', false);
        
      if (error) throw error;
      
      if (data) {
        // Filter out locally marked as read notifications
        const actuallyUnread = data.filter((n: {id: string}) => !localReadIds.includes(n.id));
        setUnreadCount(actuallyUnread.length);
        setHasNewNotifications(actuallyUnread.length > 0);
      }
      
      // Check for today's collections
      const hasTodayCollection = await checkTodayCollection();
      setHasCollectionToday(hasTodayCollection);
      
      // Check for upcoming collections (less than a day away)
      await checkUpcomingCollections();
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  // Refresh notifications on mount and when user or local read IDs change
  useEffect(() => {
    if (user) {
      refreshNotifications();
      
      // Set up a subscription for real-time updates
      const channel = supabase
        .channel('notification-changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          () => refreshNotifications())
        .subscribe();
        
      // Refresh every 5 minutes
      const intervalId = setInterval(refreshNotifications, 5 * 60 * 1000);
      
      return () => {
        supabase.removeChannel(channel);
        clearInterval(intervalId);
      };
    }
  }, [user, localReadIds]);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      hasNewNotifications,
      refreshNotifications,
      hasCollectionToday,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

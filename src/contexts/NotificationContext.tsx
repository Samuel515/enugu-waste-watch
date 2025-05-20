
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
        .limit(1) as any;

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking today's collection:", error);
      return false;
    }
  };

  // Refresh notifications count and check collections
  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      // Check for unread notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .or(`for_user_id.eq.${user.id},for_all.eq.true`)
        .eq('read', false) as any;
        
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
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  // Refresh notifications on mount and when user or local read IDs change
  useEffect(() => {
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


import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell } from "lucide-react";
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
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkAsRead 
}) => {
  const { toast } = useToast();

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

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No notifications to display.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Notifications will appear here when you receive updates about waste collections or your reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
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
      ))}
    </div>
  );
};

export default NotificationList;

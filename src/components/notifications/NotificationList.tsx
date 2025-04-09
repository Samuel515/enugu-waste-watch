
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, CheckCircle, AlertTriangle, Truck, Calendar, CircleAlert } from "lucide-react";

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Report Status Update",
    message: "Your report about overflowing bin has been marked as in progress.",
    date: "2025-04-08T14:32:00",
    type: "report",
    read: false,
  },
  {
    id: 2,
    title: "Collection Reminder",
    message: "Waste collection in your area is scheduled for tomorrow.",
    date: "2025-04-08T09:15:00",
    type: "schedule",
    read: false,
  },
  {
    id: 3,
    title: "Pickup Completed",
    message: "Waste has been collected in Independence Layout area.",
    date: "2025-04-07T16:45:00",
    type: "collection",
    read: true,
  },
  {
    id: 4,
    title: "Special Announcement",
    message: "Please separate plastic and paper waste for the next collection.",
    date: "2025-04-06T11:20:00",
    type: "announcement",
    read: true,
  },
  {
    id: 5,
    title: "Missed Collection",
    message: "Collection in New Haven was missed due to vehicle breakdown. Rescheduled for tomorrow.",
    date: "2025-04-05T17:30:00",
    type: "alert",
    read: true,
  },
];

const NotificationList = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "report":
        return <CheckCircle className="h-5 w-5 text-waste-green" />;
      case "schedule":
        return <Calendar className="h-5 w-5 text-waste-blue" />;
      case "collection":
        return <Truck className="h-5 w-5 text-waste-green" />;
      case "announcement":
        return <Bell className="h-5 w-5 text-waste-yellow" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-waste-red" />;
      default:
        return <CircleAlert className="h-5 w-5" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const filteredNotifications = filter === "unread"
    ? notifications.filter((notification) => !notification.read)
    : notifications;

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stay updated with waste management activities</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            >
              {filter === "all" ? "Show Unread" : "Show All"}
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-md ${
                  !notification.read ? "bg-secondary/30 border-l-4 border-l-waste-green" : ""
                } transition-all`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <Badge className="bg-waste-green text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationList;

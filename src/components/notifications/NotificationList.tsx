
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "collection" | "report" | "system";
}

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No notifications to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-md p-4 ${
            !notification.read ? "bg-secondary/40" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                {notification.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(notification.timestamp).toLocaleString()}
              </div>
            </div>
            {!notification.read && (
              <div className="bg-waste-green w-2 h-2 rounded-full mt-2"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;

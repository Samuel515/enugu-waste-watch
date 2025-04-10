
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
  // Always show empty state for now as requested
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground">No notifications to display.</p>
      <p className="text-sm text-muted-foreground mt-2">
        Notifications will appear here when you receive updates about waste collections or your reports.
      </p>
    </div>
  );
};

export default NotificationList;

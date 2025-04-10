
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationList from "@/components/notifications/NotificationList";
import { Bell } from "lucide-react";

// Mock data
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "collection" | "report" | "system";
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Simulate fetching notifications
  useEffect(() => {
    // This would be a call to your backend in a real application
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "Waste Collection Scheduled",
        message: "Waste collection in Independence Layout is scheduled for tomorrow at 9:00 AM.",
        timestamp: "2023-06-15T09:00:00",
        read: false,
        type: "collection"
      },
      {
        id: "2",
        title: "Report Status Updated",
        message: "Your waste report #WR-2023-06-12 has been marked as 'In Progress'.",
        timestamp: "2023-06-14T14:30:00",
        read: true,
        type: "report"
      },
      {
        id: "3",
        title: "Collection Completed",
        message: "Waste collection in your area has been completed successfully.",
        timestamp: "2023-06-10T11:45:00",
        read: false,
        type: "collection"
      },
      {
        id: "4",
        title: "System Maintenance",
        message: "The system will undergo maintenance on June 20, 2023, from 2:00 AM to 4:00 AM.",
        timestamp: "2023-06-08T16:20:00",
        read: true,
        type: "system"
      },
      {
        id: "5",
        title: "New Schedule Available",
        message: "The waste collection schedule for July 2023 is now available.",
        timestamp: "2023-06-05T08:15:00",
        read: false,
        type: "collection"
      },
      {
        id: "6",
        title: "Report Resolved",
        message: "Your waste report #WR-2023-05-28 has been resolved. Thank you for your contribution.",
        timestamp: "2023-06-03T13:10:00",
        read: true,
        type: "report"
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
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
            <NotificationList notifications={filteredNotifications} />
          </TabsContent>
          
          <TabsContent value="collection">
            <NotificationList notifications={filteredNotifications} />
          </TabsContent>
          
          <TabsContent value="report">
            <NotificationList notifications={filteredNotifications} />
          </TabsContent>
          
          <TabsContent value="system">
            <NotificationList notifications={filteredNotifications} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Notifications;

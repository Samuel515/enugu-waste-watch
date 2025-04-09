
import Layout from "@/components/layout/Layout";
import NotificationList from "@/components/notifications/NotificationList";

const Notifications = () => {
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with waste management activities and alerts
          </p>
        </div>
        
        <NotificationList />
      </div>
    </Layout>
  );
};

export default Notifications;

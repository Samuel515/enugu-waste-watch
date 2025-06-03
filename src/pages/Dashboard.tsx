
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentReports from "@/components/dashboard/RecentReports";
import PickupSchedule from "@/components/dashboard/PickupSchedule";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
          <div>
            <Button asChild>
              <Link to="/report">
                <PlusCircle className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Report Waste Issue</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {user && (
          <>
            <div className="mb-8">
              <DashboardStats userRole={user.role} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RecentReports userRole={user.role} />
              <PickupSchedule />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

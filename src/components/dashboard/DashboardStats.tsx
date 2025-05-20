import { ReactNode, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Truck, AlertTriangle, Calendar, Clock, LoaderCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  isLoading?: boolean;
}

const StatsCard = ({ title, value, description, icon, trend, color, isLoading }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`waste-icon bg-${color}/10 text-${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
      {trend && (
        <CardFooter>
          <div className="flex items-center text-xs">
            <ArrowUpRight className={`mr-1 h-4 w-4 ${trend.isPositive ? "text-waste-green" : "text-waste-red"}`} />
            <span className={trend.isPositive ? "text-waste-green" : "text-waste-red"}>
              {trend.value}% {trend.isPositive ? "increase" : "decrease"}
            </span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

interface DashboardStatsProps {
  userRole: "resident" | "official" | "admin";
}

const DashboardStats = ({ userRole }: DashboardStatsProps) => {
  const { user } = useAuth();
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [nextPickup, setNextPickup] = useState<{date: string, time: string} | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [isLoadingPickup, setIsLoadingPickup] = useState<boolean>(true);

  // Fetch reports count
  useEffect(() => {
    const fetchUserReports = async () => {
      if (user && user.role === "resident") {
        try {
          setIsLoadingReports(true);
          const { count, error } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (error) {
            console.error("Error fetching reports count:", error);
          } else {
            setReportsCount(count || 0);
          }
        } catch (error) {
          console.error("Error fetching reports count:", error);
        } finally {
          setIsLoadingReports(false);
        }
      } else {
        setIsLoadingReports(false);
      }
    };

    fetchUserReports();
  }, [user]);

  // Fetch next pickup schedule
  useEffect(() => {
    const fetchNextPickup = async () => {
      if (user && user.area) {
        try {
          setIsLoadingPickup(true);
          
          const now = new Date().toISOString();
          
          const { data, error } = await supabase
            .from('pickup_schedules')
            .select('*')
            .eq('area', user.area)
            .eq('status', 'scheduled')
            .gte('pickup_date', now)
            .order('pickup_date', { ascending: true })
            .limit(1)
            .single();
          
          if (error && error.code !== 'PGRST116') { // Not found error
            console.error("Error fetching next pickup:", error);
          } else if (data) {
            const pickupDate = new Date(data.pickup_date);
            setNextPickup({
              date: pickupDate.toLocaleDateString(),
              time: pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        } catch (error) {
          console.error("Error fetching next pickup:", error);
        } finally {
          setIsLoadingPickup(false);
        }
      } else {
        setIsLoadingPickup(false);
      }
    };

    fetchNextPickup();
  }, [user]);

  // Different stats based on user role
  const residentStats = [
    { 
      title: "Collection Schedule", 
      value: nextPickup ? nextPickup.date : "Not scheduled", 
      description: "Next waste collection in your area", 
      icon: <Calendar className="h-5 w-5" />,
      color: "waste-blue",
      isLoading: isLoadingPickup
    },
    { 
      title: "Reports Made", 
      value: reportsCount, 
      description: "Waste issues you've reported", 
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "waste-yellow",
      isLoading: isLoadingReports
    },
    { 
      title: "Next Collection", 
      value: nextPickup ? nextPickup.time : "N/A", 
      description: "Scheduled time for pickup", 
      icon: <Clock className="h-5 w-5" />,
      color: "waste-green",
      isLoading: isLoadingPickup
    },
  ];

  const officialStats = [
    { 
      title: "Active Reports", 
      value: 0, 
      description: "Unresolved waste reports", 
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "waste-yellow" 
    },
    { 
      title: "Collections Today", 
      value: 0, 
      description: "Scheduled waste pickups", 
      icon: <Truck className="h-5 w-5" />,
      color: "waste-green" 
    },
    { 
      title: "Areas Covered", 
      value: 0, 
      description: "Districts with active collection", 
      icon: <Calendar className="h-5 w-5" />,
      color: "waste-blue" 
    },
  ];

  const adminStats = [
    { 
      title: "Total Reports", 
      value: 0, 
      description: "Waste issues reported this month", 
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "waste-yellow" 
    },
    { 
      title: "Collection Rate", 
      value: "0%", 
      description: "Waste collection efficiency", 
      icon: <Truck className="h-5 w-5" />,
      color: "waste-green" 
    },
    { 
      title: "Active Users", 
      value: 0, 
      description: "Engaged residents and officials", 
      icon: <Calendar className="h-5 w-5" />,
      color: "waste-blue" 
    },
  ];

  const statsToShow = userRole === "admin" 
    ? adminStats 
    : userRole === "official" 
      ? officialStats 
      : residentStats;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsToShow.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;

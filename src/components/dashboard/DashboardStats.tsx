
import { ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Truck, AlertTriangle, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
}

const StatsCard = ({ title, value, description, icon, trend, color }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`waste-icon bg-${color}/10 text-${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
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
  const [reportsMade, setReportsMade] = useState(0);
  const [activeReports, setActiveReports] = useState(0);
  const [collectionsToday, setCollectionsToday] = useState(0);
  const [areasCovered, setAreasCovered] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Load stats from database
    const loadStats = async () => {
      try {
        // Reports made by the current resident
        if (userRole === "resident") {
          const { data, error } = await supabase
            .from('reports')
            .select('count', { count: 'exact' })
            .eq('user_id', user.id);
          
          if (!error && data) {
            setReportsMade(data.length);
          }
        }
        
        // For officials and admins
        if (userRole === "official" || userRole === "admin") {
          // Active (pending) reports
          const { data: pendingData, error: pendingError } = await supabase
            .from('reports')
            .select('count', { count: 'exact' })
            .eq('status', 'pending');
          
          if (!pendingError && pendingData) {
            setActiveReports(pendingData.length);
          }
          
          // Total reports
          const { data: totalData, error: totalError } = await supabase
            .from('reports')
            .select('count', { count: 'exact' });
          
          if (!totalError && totalData) {
            setTotalReports(totalData.length);
          }
          
          // Collections today (this would be implemented with a real schedule system)
          setCollectionsToday(0);
          
          // Areas covered
          const { data: areasData, error: areasError } = await supabase
            .from('profiles')
            .select('area')
            .not('area', 'is', null);
          
          if (!areasError && areasData) {
            // Get unique areas
            const uniqueAreas = new Set(areasData.map(profile => profile.area));
            setAreasCovered(uniqueAreas.size);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      }
    };
    
    loadStats();
  }, [user, userRole]);

  // Different stats based on user role
  const residentStats = [
    { 
      title: "Collection Schedule", 
      value: "Not scheduled", 
      description: "Next waste collection in your area", 
      icon: <Calendar className="h-5 w-5" />,
      color: "waste-blue" 
    },
    { 
      title: "Reports Made", 
      value: reportsMade, 
      description: "Waste issues you've reported", 
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "waste-yellow" 
    },
    { 
      title: "Next Collection", 
      value: "N/A", 
      description: "Scheduled time for pickup", 
      icon: <Clock className="h-5 w-5" />,
      color: "waste-green" 
    },
  ];

  const officialStats = [
    { 
      title: "Active Reports", 
      value: activeReports, 
      description: "Unresolved waste reports", 
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "waste-yellow" 
    },
    { 
      title: "Collections Today", 
      value: collectionsToday, 
      description: "Scheduled waste pickups", 
      icon: <Truck className="h-5 w-5" />,
      color: "waste-green" 
    },
    { 
      title: "Areas Covered", 
      value: areasCovered, 
      description: "Districts with active collection", 
      icon: <Calendar className="h-5 w-5" />,
      color: "waste-blue" 
    },
  ];

  const adminStats = [
    { 
      title: "Total Reports", 
      value: totalReports, 
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

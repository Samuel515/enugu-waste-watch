
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Truck, AlertTriangle, Calendar, Clock } from "lucide-react";

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
  // Different stats based on user role, all showing zero activity
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
      value: 0, 
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

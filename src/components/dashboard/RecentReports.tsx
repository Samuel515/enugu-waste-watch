
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MapPin, MoreVertical, CheckCircle, AlertTriangle, Clock, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Report {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  waste_type: string;
  user_id: string;
}

interface ReportCardProps {
  report: Report;
  userRole: string;
  onStatusUpdate?: (id: string, newStatus: string) => void;
}

const ReportCard = ({ report, userRole, onStatusUpdate }: ReportCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-waste-yellow/10 text-waste-yellow border-waste-yellow">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-waste-blue/10 text-waste-blue border-waste-blue">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-waste-green/10 text-waste-green border-waste-green">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const handleViewReport = () => {
    navigate(`/reports/${report.id}`);
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(report.id, newStatus);
    }
  };

  return (
    <div className="flex items-start justify-between p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50" onClick={handleViewReport}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-sm">{report.title}</h4>
          {getStatusBadge()}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          {report.location}
        </div>
        <div className="text-xs text-muted-foreground">
          Reported on {formatDate(report.created_at)}
        </div>
      </div>

      {userRole !== "resident" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { 
              e.stopPropagation();
              handleViewReport();
            }}>
              View details
            </DropdownMenuItem>
            {report.status !== "pending" && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleStatusChange("pending");
              }}>
                Mark as Pending
              </DropdownMenuItem>
            )}
            {report.status !== "in-progress" && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleStatusChange("in-progress");
              }}>
                Mark as In Progress
              </DropdownMenuItem>
            )}
            {report.status !== "completed" && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleStatusChange("completed");
              }}>
                Mark as Completed
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

interface RecentReportsProps {
  userRole: string;
}

const RecentReports = ({ userRole }: RecentReportsProps) => {
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchReports();
  }, [user, userRole]);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userRole === 'resident' && user) {
        // Residents can only see their own reports
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setReports(data as Report[]);
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Optimistically update the UI
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === id ? { ...report, status: newStatus } : report
        )
      );
      
      toast({
        title: "Status updated",
        description: `Report status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredReports = filter === "all"
    ? reports
    : reports.filter(report => report.status === filter);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            {userRole === "resident"
              ? "Your recently reported waste issues"
              : "Latest waste issues reported by residents"}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              {filter === "all" ? "All Reports" : filter === "pending" ? "Pending" : filter === "in-progress" ? "In Progress" : "Completed"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>All Reports</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("in-progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : (
          <div>
            {filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  userRole={userRole} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No reports found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReports;

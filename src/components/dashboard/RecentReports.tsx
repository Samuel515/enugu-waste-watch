
import { useState } from "react";
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

// Mock data for reports
const MOCK_REPORTS = [
  {
    id: 1,
    title: "Overflowing bin near market",
    location: "Main Market, Ogui Road",
    status: "pending",
    date: "2025-04-08T09:30:00",
    type: "overflow",
  },
  {
    id: 2,
    title: "Illegal dumping by roadside",
    location: "Independence Layout, Enugu",
    status: "in-progress",
    date: "2025-04-07T14:20:00",
    type: "illegal",
  },
  {
    id: 3,
    title: "Missed collection on schedule",
    location: "Presidential Road, Enugu",
    status: "completed",
    date: "2025-04-06T11:15:00",
    type: "missed",
  },
  {
    id: 4,
    title: "Broken waste bin needs repair",
    location: "New Haven, Enugu",
    status: "pending",
    date: "2025-04-05T16:45:00",
    type: "damage",
  },
];

interface ReportCardProps {
  report: {
    id: number;
    title: string;
    location: string;
    status: string;
    date: string;
    type: string;
  };
  userRole: string;
}

const ReportCard = ({ report, userRole }: ReportCardProps) => {
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

  return (
    <div className="flex items-start justify-between p-4 border-b last:border-0">
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
          Reported on {formatDate(report.date)}
        </div>
      </div>

      {userRole !== "resident" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
            <DropdownMenuItem>Assign to team</DropdownMenuItem>
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
  
  const filteredReports = filter === "all"
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter(report => report.status === filter);

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
        <div>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <ReportCard key={report.id} report={report} userRole={userRole} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No reports found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReports;

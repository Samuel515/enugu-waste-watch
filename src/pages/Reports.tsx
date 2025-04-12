
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Reports = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Mock data for reports
  const allReports = [
    {
      id: "WR-2023-06-12",
      title: "Overflowing waste bin",
      location: "Independence Layout",
      status: "in-progress",
      date: "2023-06-12",
      description: "The waste bin at the junction is overflowing and needs immediate attention"
    },
    {
      id: "WR-2023-06-08",
      title: "Illegal dumping near school",
      location: "New Haven",
      status: "resolved",
      date: "2023-06-08",
      description: "People are illegally dumping waste near the primary school"
    },
    {
      id: "WR-2023-05-30",
      title: "Waste collection delayed",
      location: "Trans-Ekulu",
      status: "pending",
      date: "2023-05-30",
      description: "Regular waste collection has been delayed for over a week"
    },
    {
      id: "WR-2023-05-25",
      title: "Blocked drainage due to waste",
      location: "Ogui Road",
      status: "in-progress",
      date: "2023-05-25",
      description: "Drainage system is blocked with waste causing flooding during rain"
    },
    {
      id: "WR-2023-05-18",
      title: "Waste burning in residential area",
      location: "GRA",
      status: "resolved",
      date: "2023-05-18",
      description: "People are burning waste in the residential area causing air pollution"
    },
    {
      id: "WR-2023-05-15",
      title: "Waste container damaged",
      location: "Abakpa",
      status: "pending",
      date: "2023-05-15",
      description: "The community waste container is damaged and needs replacement"
    },
    {
      id: "WR-2023-05-10",
      title: "Industrial waste dumping",
      location: "Emene",
      status: "in-progress",
      date: "2023-05-10",
      description: "Industrial waste being dumped in unauthorized location"
    }
  ];
  
  // Filter reports based on search query and status filter
  const filteredReports = allReports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Waste Reports</h1>
          <p className="text-muted-foreground">
            View all waste-related reports in your area
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search reports by title, location or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button asChild className="md:w-auto">
            <Link to="/report">Report New Issue</Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No reports match your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium">{report.title}</span>
                        <Badge
                          className={`text-[10px] px-2 py-0 ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : report.status === "in-progress"
                              ? "bg-blue-100 text-blue-800 whitespace-nowrap text-xs"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.id}</p>
                      <p className="text-sm mt-1">{report.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {report.location} · {report.date}
                      </div>
                    </div>
                    {(user?.role === "official" || user?.role === "admin") && (
                      <Link
                        to={`/manage-reports/${report.id}`}
                        className="text-xs text-primary hover:underline mt-3 sm:mt-0 whitespace-nowrap"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

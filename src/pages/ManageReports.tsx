import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Report, ReportStatus } from "@/types/reports";
import { supabase } from "@/integrations/supabase/client";

const ManageReports = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Fetch reports from Supabase
        // Need to cast the table name as a type workaround
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false }) as any;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setReports(data as Report[]);
        } else {
          // Use mock data if no reports exist yet
          const mockReports = generateMockReports();
          setReports(mockReports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const generateMockReports = (): Report[] => {
    return [
      {
        id: "WR-2023-06-12",
        title: "Overflowing waste bin",
        description: "The waste bin at the junction is overflowing and needs immediate attention",
        location: "Independence Layout",
        status: "in-progress",
        user_id: "user1",
        user_name: "John Resident",
        user_area: "Independence Layout",
        created_at: "2023-06-12T10:00:00Z",
        updated_at: "2023-06-12T10:00:00Z"
      },
      {
        id: "WR-2023-06-08",
        title: "Illegal dumping near school",
        description: "People are illegally dumping waste near the primary school",
        location: "New Haven",
        status: "resolved",
        user_id: "user2",
        user_name: "Mary Citizen",
        user_area: "New Haven",
        created_at: "2023-06-08T12:30:00Z",
        updated_at: "2023-06-10T09:15:00Z"
      },
      {
        id: "WR-2023-05-30",
        title: "Waste collection delayed",
        description: "Regular waste collection has been delayed for over a week",
        location: "Trans-Ekulu",
        status: "pending",
        user_id: "user3",
        user_name: "Robert Johnson",
        user_area: "Trans-Ekulu",
        created_at: "2023-05-30T14:45:00Z",
        updated_at: "2023-05-30T14:45:00Z"
      },
      {
        id: "WR-2023-05-25",
        title: "Blocked drainage due to waste",
        description: "Drainage system is blocked with waste causing flooding during rain",
        location: "Ogui Road",
        status: "in-progress",
        user_id: "user4",
        user_name: "Patricia Smith",
        user_area: "Ogui Road",
        created_at: "2023-05-25T16:20:00Z",
        updated_at: "2023-05-26T09:10:00Z"
      },
      {
        id: "WR-2023-05-18",
        title: "Waste burning in residential area",
        description: "People are burning waste in the residential area causing air pollution",
        location: "GRA",
        status: "resolved",
        user_id: "user5",
        user_name: "Michael Brown",
        user_area: "GRA",
        created_at: "2023-05-18T08:30:00Z",
        updated_at: "2023-05-20T11:45:00Z"
      },
    ];
  };

  // Filter reports based on search query and status filter
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800 whitespace-nowrap text-xs";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout requireAuth allowedRoles={["official", "admin"]}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Reports</h1>
          <p className="text-muted-foreground">
            Review and update status of waste reports
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search reports by title, location, ID or description"
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
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">
                <p>Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No reports match your search criteria</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => {
                      const reportDate = new Date(report.created_at);
                      const formattedDate = reportDate.toLocaleDateString();
                      
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.id}</TableCell>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{report.location}</TableCell>
                          <TableCell>{report.user_name || 'Anonymous'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(report.status)}>
                              {report.status === 'in-progress' ? 'In Progress' : 
                                report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formattedDate}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/reports/${report.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManageReports;


import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Report {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  description: string | null;
  user_id: string;
  user_name: string | null;
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch reports from Supabase
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false }) as any;
        
        if (error) throw error;
        
        if (data) {
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [toast]);
  
  // Filter reports based on search query and status filter
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.id && report.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
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
                          {report.status === 'in-progress' ? 'In Progress' : 
                            report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.id}</p>
                      <p className="text-sm mt-1">{report.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {report.location} · {new Date(report.created_at).toLocaleDateString()}
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

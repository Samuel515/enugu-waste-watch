
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Report, ReportStatus } from "@/types/reports";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, MapPin, User, Calendar, Clock, AlertCircle, ArrowLeft, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>("pending");
  
  useEffect(() => {
    const fetchReportDetails = async () => {
      setIsLoading(true);
      try {
        if (!reportId) return;
        
        // In a real app, fetch from Supabase
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', reportId)
          .single();
        
        if (error) {
          // If the report is not found in the database, use mock data
          const mockReport = generateMockReport(reportId);
          setReport(mockReport);
        } else {
          setReport(data as unknown as Report);
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        toast({
          title: "Error",
          description: "Failed to load report details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportDetails();
  }, [reportId, toast]);

  const generateMockReport = (id: string): Report => {
    // Sample report for UI development
    return {
      id,
      title: id === "WR-2023-06-12" 
        ? "Overflowing waste bin" 
        : "Waste issue report",
      description: "The waste bin at the junction is overflowing and needs immediate attention. It has been in this state for three days and is causing foul smell in the area. Residents have been complaining about the health hazard it poses.",
      location: "Independence Layout, Junction 4",
      coordinates: {
        latitude: 6.452378,
        longitude: 7.499437,
      },
      image_url: "https://images.unsplash.com/photo-1605600659873-d808a13e4d9a",
      user_id: "user1",
      user_name: "John Resident",
      user_area: "Independence Layout",
      status: "in-progress",
      created_at: "2023-06-12T10:00:00Z",
      updated_at: "2023-06-12T15:30:00Z"
    };
  };

  const isOfficialOrAdmin = user?.role === "official" || user?.role === "admin";
  
  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const updateReportStatus = async () => {
    if (!report) return;
    
    try {
      // In a real app, update in Supabase
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', report.id);
      
      if (error) throw error;
      
      // Update local state
      setReport({
        ...report,
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Status updated",
        description: `Report has been marked as ${newStatus === 'in-progress' ? 'in progress' : newStatus}.`,
      });
      
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async () => {
    if (!report) return;
    
    try {
      // In a real app, delete from Supabase
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);
      
      if (error) throw error;
      
      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted.",
      });
      
      navigate("/manage-reports");
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete report.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <Layout requireAuth>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="text-center py-12">
            <p>Loading report details...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!report) {
    return (
      <Layout requireAuth>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Report Not Found</CardTitle>
              <CardDescription className="text-center">
                The report you're looking for doesn't exist or has been deleted.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate("/reports")}>
                View All Reports
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-xl sm:text-2xl font-bold">{report.id}</h1>
          </div>
          
          {isOfficialOrAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setNewStatus(report.status);
                  setStatusDialogOpen(true);
                }}
              >
                Update Status
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Report
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{report.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Reported on {formatDate(report.created_at)}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeClass(report.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(report.status)}
                      <span>
                        {report.status === 'in-progress' ? 'In Progress' : 
                          report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg">{report.description}</p>
                </div>
                
                {report.image_url && (
                  <div className="mt-6">
                    <p className="font-medium mb-2">Attached Photo</p>
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={report.image_url} 
                        alt="Report issue" 
                        className="w-full h-auto object-cover max-h-[400px]"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{report.location}</p>
                    {report.coordinates && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Coordinates: {report.coordinates.latitude}, {report.coordinates.longitude}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Map view would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporter Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{report.user_name || "Anonymous"}</p>
                    {report.user_area && (
                      <p className="text-sm text-muted-foreground">Area: {report.user_area}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon(report.status)}
                    </div>
                    <div>
                      <p className="font-medium">
                        Marked as {report.status === 'in-progress' ? 'In Progress' : 
                          report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(report.updated_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Report Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Change the current status of this report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="status">Status</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ReportStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateReportStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteReport}>
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ReportDetail;

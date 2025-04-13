
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, MapPin, Calendar, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Report, ReportStatus } from "@/types/reports";

const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      
      setIsLoading(true);
      try {
        // Fetch the report
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setReport(data as Report);
        } else {
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        toast({
          title: "Error",
          description: "Failed to load report details",
          variant: "destructive",
        });
        navigate("/not-found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

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

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!report) return;

    setIsStatusUpdating(true);
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", report.id);

      if (error) throw error;

      setReport({ ...report, status: newStatus, updated_at: new Date().toISOString() });
      
      toast({
        title: "Status updated",
        description: `Report status changed to ${newStatus.replace("-", " ")}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update failed",
        description: "Failed to update report status",
        variant: "destructive",
      });
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", report.id);
      
      if (error) throw error;
      
      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted",
      });
      
      // Redirect back to reports list
      navigate("/reports");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the report",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const canUpdateStatus = user?.role === "official" || user?.role === "admin";

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Report: {report?.title}
                  </h1>
                  <p className="text-muted-foreground">{report?.id}</p>
                </div>
                
                {canUpdateStatus && (
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Report
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : report ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>Submitted on {formatDate(report.created_at)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">{report.title}</h3>
                  <p className="text-muted-foreground">{report.description}</p>
                </div>
                
                {report.image_url && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Attached Photo</h4>
                    <img 
                      src={report.image_url} 
                      alt="Report evidence" 
                      className="rounded-md max-h-96 object-contain border"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{report.location}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Status:</span>
                      <Badge className={getStatusBadgeClass(report.status)}>
                        {report.status === "in-progress" ? "In Progress" : 
                          report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {canUpdateStatus && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Update Status:
                        </label>
                        <Select
                          value={report.status}
                          onValueChange={(value) => handleStatusChange(value as ReportStatus)}
                          disabled={isStatusUpdating}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last updated:</span>
                      </div>
                      <span className="text-sm font-medium">{formatDate(report.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reporter Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{report.user_name || "Anonymous"}</span>
                    </div>
                    
                    {report.user_area && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.user_area}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center p-12">
            <p>Report not found.</p>
            <Button className="mt-4" asChild>
              <Link to="/reports">View All Reports</Link>
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this waste report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport} 
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ReportDetail;

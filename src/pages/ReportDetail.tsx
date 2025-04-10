
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Trash2,
  CircleAlert,
  TriangleAlert,
  User
} from "lucide-react";

interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  waste_type: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Reporter {
  name: string;
  email?: string;
  phone_number?: string;
  area?: string;
}

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setReport(data as Report);
        fetchReporter(data.user_id);
      }
    } catch (error: any) {
      console.error("Error fetching report:", error);
      toast({
        title: "Error loading report",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchReporter = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, phone_number, area')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setReporter(data as Reporter);
      }
    } catch (error: any) {
      console.error("Error fetching reporter details:", error);
    }
  };

  const updateReportStatus = async (newStatus: string) => {
    if (!report) return;
    
    try {
      setStatusLoading(true);
      
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', report.id);
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setReport({ ...report, status: newStatus });
      
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
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWasteTypeIcon = () => {
    switch(report?.waste_type) {
      case "overflow":
        return <Trash2 className="h-5 w-5 mr-2" />;
      case "illegal":
        return <AlertTriangle className="h-5 w-5 mr-2" />;
      case "missed":
        return <CircleAlert className="h-5 w-5 mr-2" />;
      case "damage":
        return <TriangleAlert className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  const getWasteTypeName = () => {
    switch(report?.waste_type) {
      case "overflow":
        return "Overflowing Bin";
      case "illegal":
        return "Illegal Dumping";
      case "missed":
        return "Missed Collection";
      case "damage":
        return "Damaged Bin";
      default:
        return report?.waste_type || "Unknown";
    }
  };

  const getStatusBadge = () => {
    if (!report) return null;
    
    switch (report.status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-waste-yellow/10 text-waste-yellow border-waste-yellow">
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-waste-blue/10 text-waste-blue border-waste-blue">
            <Clock className="h-4 w-4 mr-1" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-waste-green/10 text-waste-green border-waste-green">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const isOfficialOrAdmin = user?.role === 'official' || user?.role === 'admin';

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Loading report details...</p>
          </div>
        ) : report ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Report ID: {report.id}
                      </CardDescription>
                    </div>
                    {getStatusBadge()}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {report.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Location</h3>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-waste-green" />
                      <p>{report.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Issue Type</h3>
                    <div className="flex items-center">
                      {getWasteTypeIcon()}
                      <p>{getWasteTypeName()}</p>
                    </div>
                  </div>
                  
                  {report.images && report.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {report.images.map((image, index) => (
                          <div key={index} className="aspect-square rounded-md overflow-hidden bg-secondary">
                            <img
                              src={image}
                              alt={`Report image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1 text-muted-foreground">Reported On</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p>{formatDate(report.created_at)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1 text-muted-foreground">Last Updated</h3>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p>{formatDate(report.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                {isOfficialOrAdmin && (
                  <CardFooter className="flex flex-col items-stretch space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                    <div className="w-full sm:w-auto">
                      <h3 className="text-sm font-medium mb-2">Update Status</h3>
                      <Select
                        value={report.status}
                        onValueChange={updateReportStatus}
                        disabled={statusLoading}
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reporter Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reporter ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium mb-1 text-muted-foreground">Name</h3>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p>{reporter.name}</p>
                        </div>
                      </div>
                      
                      {reporter.email && (
                        <div>
                          <h3 className="text-sm font-medium mb-1 text-muted-foreground">Email</h3>
                          <p className="text-sm">{reporter.email}</p>
                        </div>
                      )}
                      
                      {reporter.phone_number && (
                        <div>
                          <h3 className="text-sm font-medium mb-1 text-muted-foreground">Phone</h3>
                          <p className="text-sm">{reporter.phone_number}</p>
                        </div>
                      )}
                      
                      {reporter.area && (
                        <div>
                          <h3 className="text-sm font-medium mb-1 text-muted-foreground">Area</h3>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <p className="text-sm">{reporter.area}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">Reporter details unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-waste-yellow mb-4" />
            <h2 className="text-2xl font-bold">Report Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The report you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button className="mt-6" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportDetail;

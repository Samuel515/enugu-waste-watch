
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle } from "lucide-react";

interface RecentReportsProps {
  userRole: string;
}

interface Report {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  description: string;
}

const RecentReports: React.FC<RecentReportsProps> = ({ userRole }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the 3 most recent reports
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3) as any;
        
        if (error) throw error;
        
        if (data) {
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error",
          description: "Failed to load recent reports",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [toast]);

  return (
    <div className="md:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6 flex-col">
              <LoaderCircle className="h-8 w-8 text-waste-green animate-spin mb-2" />
              <p className="text-muted-foreground">Loading Reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No reports yet</p>
              <Link
                to="/report"
                className="text-sm text-primary hover:underline block mt-2"
              >
                Report a waste issue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {report.location} · {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {(userRole === "official" || userRole === "admin") && (
                    <Link
                      to={`/reports/${report.id}`}
                      className="text-xs text-primary hover:underline mt-2 sm:mt-0"
                    >
                      View details
                    </Link>
                  )}
                </div>
              ))}
              <div className="text-center pt-2">
                <Link
                  to="/reports"
                  className="text-sm text-primary hover:underline"
                >
                  View all reports
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentReports;

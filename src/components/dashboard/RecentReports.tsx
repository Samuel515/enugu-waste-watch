
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentReportsProps {
  userRole: string;
}

const RecentReports: React.FC<RecentReportsProps> = ({ userRole }) => {
  // Mock data for recent reports
  const reports = [
    {
      id: "WR-2023-06-12",
      title: "Overflowing waste bin",
      location: "Independence Layout",
      status: "in-progress",
      date: "2023-06-12",
      description: "Overflowing waste bin"
    },
    {
      id: "WR-2023-06-08",
      title: "Illegal dumping near school",
      location: "New Haven",
      status: "resolved",
      date: "2023-06-08",
      description: "Illegal dumping near school"
    },
    {
      id: "WR-2023-05-30",
      title: "Waste collection delayed",
      location: "Trans-Ekulu",
      status: "pending",
      date: "2023-05-30",
      description: "Waste collection delayed"
    }
  ];

  return (
    <div className="md:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
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
                      {report.location} · {report.date}
                    </div>
                  </div>
                  {(userRole === "official" || userRole === "admin") && (
                    <Link
                      to={`/manage-reports/${report.id}`}
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

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Report, ReportStatus } from "@/types/reports";

interface AnalyticsData {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  inProgressReports: number;
  reportsByArea: {
    area: string;
    count: number;
  }[];
  reportsByStatus: {
    name: string;
    value: number;
    color: string;
  }[];
  reportsTrend: {
    month: string;
    reports: number;
  }[];
}

const COLORS = {
  pending: "#fbbf24",
  "in-progress": "#3b82f6",
  resolved: "#22c55e",
};

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    reportsByArea: [],
    reportsByStatus: [],
    reportsTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Fetch real data from Supabase
        const { data: reportsData, error } = await supabase
          .from('reports')
          .select('*') as any;
          
        if (error) {
          throw error;
        }
        
        // If we have reports data, process it
        if (reportsData && reportsData.length > 0) {
          processReportsData(reportsData as Report[]);
        } else {
          // Use mock data if no reports exist yet
          const mockReports = generateMockReports();
          processReportsData(mockReports);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const processReportsData = (reports: Report[]) => {
    // Filter reports based on timeRange
    const now = new Date();
    const filteredReports = reports.filter(report => {
      const reportDate = new Date(report.created_at);
      switch (timeRange) {
        case "week":
          return (now.getTime() - reportDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return (now.getTime() - reportDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        case "year":
          return (now.getTime() - reportDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    // Calculate basic stats
    const resolved = filteredReports.filter(r => r.status === "resolved").length;
    const pending = filteredReports.filter(r => r.status === "pending").length;
    const inProgress = filteredReports.filter(r => r.status === "in-progress").length;

    // Group reports by area
    const areaMap = new Map<string, number>();
    filteredReports.forEach(report => {
      const area = report.user_area || report.location || "Unknown";
      areaMap.set(area, (areaMap.get(area) || 0) + 1);
    });

    const reportsByArea = Array.from(areaMap.entries()).map(([area, count]) => ({
      area,
      count,
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Prepare data for pie chart
    const reportsByStatus = [
      { name: "Pending", value: pending, color: COLORS.pending },
      { name: "In Progress", value: inProgress, color: COLORS["in-progress"] },
      { name: "Resolved", value: resolved, color: COLORS.resolved },
    ];

    // Generate monthly trend data
    let reportsTrend;
    if (timeRange === "week") {
      reportsTrend = generateDailyTrend(filteredReports);
    } else if (timeRange === "month") {
      reportsTrend = generateWeeklyTrend(filteredReports);
    } else {
      reportsTrend = generateMonthlyTrend(filteredReports);
    }

    setAnalyticsData({
      totalReports: filteredReports.length,
      resolvedReports: resolved,
      pendingReports: pending,
      inProgressReports: inProgress,
      reportsByArea,
      reportsByStatus,
      reportsTrend,
    });
  };

  const generateDailyTrend = (reports: Report[]) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysCounts = Array(7).fill(0);
    
    reports.forEach(report => {
      const day = new Date(report.created_at).getDay();
      daysCounts[day]++;
    });
    
    return days.map((day, index) => ({
      month: day,
      reports: daysCounts[index],
    }));
  };

  const generateWeeklyTrend = (reports: Report[]) => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const weeksCounts = Array(4).fill(0);
    
    reports.forEach(report => {
      const date = new Date(report.created_at);
      const dayOfMonth = date.getDate();
      const weekIndex = Math.min(Math.floor(dayOfMonth / 7), 3);
      weeksCounts[weekIndex]++;
    });
    
    return weeks.map((week, index) => ({
      month: week,
      reports: weeksCounts[index],
    }));
  };

  const generateMonthlyTrend = (reports: Report[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsCounts = Array(12).fill(0);
    
    reports.forEach(report => {
      const month = new Date(report.created_at).getMonth();
      monthsCounts[month]++;
    });
    
    return months.map((month, index) => ({
      month,
      reports: monthsCounts[index],
    }));
  };

  const generateMockReports = (): Report[] => {
    // Generate mock reports for UI development
    const areas = ["Independence Layout", "New Haven", "Trans Ekulu", "Ogui Road", "GRA", "Abakpa", "Emene"];
    const statuses: ReportStatus[] = ["pending", "in-progress", "resolved"];
    const reports: Report[] = [];
    
    for (let i = 0; i < 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const area = areas[Math.floor(Math.random() * areas.length)];
      const daysAgo = Math.floor(Math.random() * 364);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      reports.push({
        id: `WR-${i + 1}`,
        title: `Mock Report ${i + 1}`,
        description: `This is a mock report description for ${i + 1}`,
        location: area,
        user_id: `user-${i % 10}`,
        user_name: `User ${i % 10}`,
        user_area: area,
        status,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString()
      });
    }
    
    return reports;
  };

  const getStatusPercentage = (status: ReportStatus) => {
    if (analyticsData.totalReports === 0) return 0;
    
    switch (status) {
      case "resolved":
        return Math.round((analyticsData.resolvedReports / analyticsData.totalReports) * 100);
      case "pending":
        return Math.round((analyticsData.pendingReports / analyticsData.totalReports) * 100);
      case "in-progress":
        return Math.round((analyticsData.inProgressReports / analyticsData.totalReports) * 100);
      default:
        return 0;
    }
  };

  return (
    <Layout requireAuth allowedRoles={["admin"]}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of waste management reports and trends
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as "week" | "month" | "year")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-green-800">Resolved Reports</CardTitle>
              <CardDescription className="text-green-700">
                {getStatusPercentage("resolved")}% of total reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">
                {isLoading ? "..." : analyticsData.resolvedReports}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-800">In Progress</CardTitle>
              <CardDescription className="text-blue-700">
                {getStatusPercentage("in-progress")}% of total reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">
                {isLoading ? "..." : analyticsData.inProgressReports}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-amber-800">Pending Reports</CardTitle>
              <CardDescription className="text-amber-700">
                {getStatusPercentage("pending")}% of total reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-800">
                {isLoading ? "..." : analyticsData.pendingReports}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Report Trends</CardTitle>
              <CardDescription>
                Number of reports over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.reportsTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reports" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports by Status</CardTitle>
              <CardDescription>
                Distribution of reports by status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.reportsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.reportsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Areas with Reports</CardTitle>
              <CardDescription>
                Areas with the most reported issues
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.reportsByArea}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="area" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;

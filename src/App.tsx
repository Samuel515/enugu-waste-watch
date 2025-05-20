
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Reports from "./pages/Reports";
import Schedule from "./pages/Schedule";
import Notifications from "./pages/Notifications";
import ManageUsers from "./pages/ManageUsers";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import AdminAnalytics from "./pages/AdminAnalytics";
import ManageReports from "./pages/ManageReports";
import ReportDetail from "./pages/ReportDetail";
import UpdateSchedules from "./pages/UpdateSchedules";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider>
                {/* <Toaster /> */}
                <Sonner/>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/manage-users" element={<ManageUsers />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/manage-reports" element={<ManageReports />} />
                  <Route path="/reports/:reportId" element={<ReportDetail />} />
                  <Route path="/update-schedules" element={<UpdateSchedules />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </ScrollToTop>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

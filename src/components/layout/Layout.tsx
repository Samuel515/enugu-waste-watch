
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const Layout = ({ children, requireAuth = false, allowedRoles = [] }: LayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading while auth is being checked for protected routes
  if (isLoading && requireAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waste-green"></div>
      </div>
    );
  }
  
  // Check if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated && !isLoading) {
    // Store the current path for redirect after login
    const currentPath = location.pathname + location.search + location.hash;
    if (currentPath !== '/auth' && currentPath !== '/') {
      localStorage.setItem('intendedUrl', currentPath);
      console.log('Layout: Storing intended URL before redirect:', currentPath);
    }
    return <Navigate to="/auth" replace />;
  }

  // Check if user role is allowed to access this page
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

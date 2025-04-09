
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const Layout = ({ children, requireAuth = false, allowedRoles = [] }: LayoutProps) => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Check if user role is allowed to access this page
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
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

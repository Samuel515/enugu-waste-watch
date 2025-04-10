
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// This component automatically scrolls to top whenever the route changes
const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
};

export default ScrollToTop;

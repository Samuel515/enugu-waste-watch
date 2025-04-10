import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// This component automatically scrolls to top whenever the route changes
const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // If there's a hash, scroll to the element with that ID
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Otherwise scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: "instant" });
    
    // Force scroll position to be at the top
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }, [pathname, hash, key]);

  return <>{children}</>;
};

export default ScrollToTop;

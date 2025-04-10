import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-800 text-neutral-600">
      <div className="flex gap-5 text-3xl font-semibold">
        <h1 className="pr-5 border-r-4 border-r-neutral-600">404</h1>
        <p>PAGE NOT FOUND</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

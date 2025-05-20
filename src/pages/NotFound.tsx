import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-800 text-neutral-600 flex-col gap-7">
      <div className="flex gap-5 text-3xl font-semibold">
        <h1 className="pr-5 border-r-4 border-r-neutral-600">404</h1>
        <p>PAGE NOT FOUND</p>
      </div>
    </div>
  );
};

export default NotFound;

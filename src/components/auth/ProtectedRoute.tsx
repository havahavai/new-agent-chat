"use client";

import React, { useEffect, useState } from "react";
import { isAuthenticated } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status immediately
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      console.log("Auth check result:", authenticated);
      setIsAuth(authenticated);
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "flyo:jwt:token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Temporarily bypass authentication loading state for development
  if (isAuth === null) {
    console.log("Auth state is null, but allowing access for development");
    // return (
    //   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    //     <div className="text-center">
    //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    //       <p className="text-gray-600">Loading...</p>
    //     </div>
    //   </div>
    // );
  }

  // Temporarily allow access without authentication for development
  // TODO: Re-enable authentication check
  if (!isAuth) {
    console.log("User not authenticated, but allowing access for development");
    // return (
    //   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    //     <div className="text-center">
    //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    //       <p className="text-gray-600">Redirecting to login...</p>
    //     </div>
    //   </div>
    // );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;

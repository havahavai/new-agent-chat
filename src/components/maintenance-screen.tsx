import React from "react";
import { FlyoLogoSVG } from "@/components/icons/langgraph";

interface MaintenanceScreenProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="animate-in fade-in-0 zoom-in-95 bg-background flex max-w-md flex-col items-center rounded-lg border shadow-lg p-8 text-center">
        <div className="mb-6">
          <FlyoLogoSVG className="h-12 w-auto" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          We're Refueling ✈️
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Agent is grounded for scheduled maintenance. <br /> We'll be ready for takeoff shortly!
        </p>
      </div>
    </div>
  );
};

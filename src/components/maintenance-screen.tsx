import React from "react";
import { FlyoLogoSVG } from "@/components/icons/langgraph";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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

        <Button 
          onClick={onRetry} 
          disabled={isRetrying}
          className="w-full sm:w-auto min-w-[140px]"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Try Again"
          )}
        </Button>
      </div>
    </div>
  );
};

"use client";

import { useEffect } from "react";
import { useNewRelic } from "../../hooks/useNewRelic";
import { usePathname } from "next/navigation";

interface NewRelicMonitorProps {
  pageName?: string;
  customAttributes?: Record<string, any>;
}

export const NewRelicMonitor: React.FC<NewRelicMonitorProps> = ({
  pageName,
  customAttributes = {},
}) => {
  const { setPageViewName, setCustomAttributes, trackEvent } = useNewRelic();
  const pathname = usePathname();

  useEffect(() => {
    // Set page view name
    const name = pageName || pathname || "Unknown Page";
    setPageViewName(name);

    // Set custom attributes
    if (Object.keys(customAttributes).length > 0) {
      setCustomAttributes({
        pagePath: pathname,
        pageName: name,
        timestamp: new Date().toISOString(),
        ...customAttributes,
      });
    }

    // Track page view event
    trackEvent("page_view", {
      pageName: name,
      pagePath: pathname,
      timestamp: new Date().toISOString(),
    });

    console.log("New Relic: Page view tracked:", name);
  }, [
    pathname,
    pageName,
    customAttributes,
    setPageViewName,
    setCustomAttributes,
    trackEvent,
  ]);

  // This component doesn't render anything
  return null;
};

export default NewRelicMonitor;

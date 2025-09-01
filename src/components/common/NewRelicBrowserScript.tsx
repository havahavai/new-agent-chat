"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function NewRelicBrowserScript() {
  const [browserTimingHeader, setBrowserTimingHeader] = useState<string>("");

  useEffect(() => {
    // Get browser timing header on client side
    if (typeof window !== "undefined") {
      try {
        // Check if New Relic is available
        if (window.newrelic && window.newrelic.getBrowserTimingHeader) {
          const header = window.newrelic.getBrowserTimingHeader({
            hasToRemoveScriptWrapper: true,
          });
          setBrowserTimingHeader(header);
        }
      } catch (error) {
        console.error("Failed to get New Relic browser timing header:", error);
      }
    }
  }, []);

  return (
    <>
      {/* New Relic Browser Agent Script */}
      {browserTimingHeader && (
        <Script
          id="newrelic-browser-agent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
        />
      )}
    </>
  );
}

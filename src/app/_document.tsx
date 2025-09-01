import { Html, Head, Main, NextScript } from "next/document";
import { useEffect } from "react";

// Import New Relic for browser timing header
let newrelic: any;

// Only import New Relic on server side
if (typeof window === "undefined") {
  try {
    newrelic = require("newrelic");
  } catch (error) {
    console.error("Failed to load New Relic:", error);
  }
}

export default function Document() {
  // Get browser timing header on server side
  const browserTimingHeader =
    typeof window === "undefined" && newrelic
      ? newrelic.getBrowserTimingHeader({
          hasToRemoveScriptWrapper: true,
        })
      : "";

  return (
    <Html lang="en">
      <Head>
        {/* New Relic Browser Agent Script */}
        {browserTimingHeader && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

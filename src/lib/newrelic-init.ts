// New Relic initialization for Next.js
// This file ensures New Relic is properly initialized for automatic instrumentation

// Only run on server side
if (typeof window === "undefined") {
  try {
    // Import New Relic to ensure it's loaded
    const newrelic = require("newrelic");

    // Set up automatic transaction naming for Next.js
    if (newrelic.setTransactionName) {
      // Override the default transaction naming
      const originalSetTransactionName = newrelic.setTransactionName;

      newrelic.setTransactionName = function (name: string) {
        // Clean up the transaction name for better readability
        let cleanName = name;

        // Handle API routes
        if (name.includes("/api/")) {
          cleanName = `API ${name.replace("/api/", "")}`;
        }

        // Handle specific pages
        if (name === "/") {
          cleanName = "Homepage";
        } else if (name === "/login") {
          cleanName = "Login Page";
        } else if (name === "/widgets") {
          cleanName = "Widgets Page";
        }

        // Call the original function with the cleaned name
        return originalSetTransactionName.call(this, cleanName);
      };
    }

    console.log(
      "New Relic initialized for automatic instrumentation with custom transaction naming",
    );
  } catch (error) {
    console.error("Failed to initialize New Relic:", error);
  }
}

export {};

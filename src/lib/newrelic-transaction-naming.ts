// New Relic transaction naming for Next.js
// This helps New Relic properly identify and name transactions

import { NextRequest } from "next/server";

export function setTransactionName(req: NextRequest, route?: string) {
  if (typeof window === "undefined") {
    try {
      const newrelic = require("newrelic");

      // Extract meaningful transaction name from the request
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method;

      // Create a meaningful transaction name
      let transactionName = `${method} ${pathname}`;

      // Add route information if available
      if (route) {
        transactionName = `${method} ${route}`;
      }

      // Handle API routes specifically
      if (pathname.startsWith("/api/")) {
        const apiPath = pathname.replace("/api/", "");
        transactionName = `API ${method} ${apiPath}`;
      }

      // Handle dynamic routes
      if (pathname.includes("[") || pathname.includes("]")) {
        // Replace dynamic segments with meaningful names
        transactionName = transactionName
          .replace(/\[.*?\]/g, "*")
          .replace(/\/\*/g, "/:id");
      }

      // Set the transaction name
      newrelic.setTransactionName(transactionName);

      // Add custom attributes for better identification
      newrelic.addCustomAttribute("request.path", pathname);
      newrelic.addCustomAttribute("request.method", method);
      newrelic.addCustomAttribute("request.query", url.search);

      console.log(`New Relic transaction named: ${transactionName}`);
    } catch (error) {
      console.error("Failed to set New Relic transaction name:", error);
    }
  }
}

export function setCustomTransactionName(name: string) {
  if (typeof window === "undefined") {
    try {
      const newrelic = require("newrelic");
      newrelic.setTransactionName(name);
      console.log(`New Relic custom transaction named: ${name}`);
    } catch (error) {
      console.error("Failed to set custom New Relic transaction name:", error);
    }
  }
}

// Simple function to set transaction name for API routes
export function setAPITransactionName(route: string) {
  if (typeof window === "undefined") {
    try {
      const newrelic = require("newrelic");
      const transactionName = `API ${route}`;
      newrelic.setTransactionName(transactionName);
      console.log(`New Relic API transaction named: ${transactionName}`);
    } catch (error) {
      console.error("Failed to set API transaction name:", error);
    }
  }
}

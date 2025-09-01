"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class NewRelicErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send error to New Relic on client side
    if (typeof window !== "undefined") {
      try {
        // Check if New Relic is available in the browser
        if (window.newrelic) {
          window.newrelic.noticeError(error, {
            customAttributes: {
              componentStack: errorInfo.componentStack,
              errorBoundary: "NewRelicErrorBoundary",
            },
          });
          console.log("Client error sent to New Relic:", error.message);
        }
      } catch (newrelicError) {
        console.error("Failed to send error to New Relic:", newrelicError);
      }
    }

    // Log error to console for debugging
    console.error("Error caught by NewRelicErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NewRelicErrorBoundary;

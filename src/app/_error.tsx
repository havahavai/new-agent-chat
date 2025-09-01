import { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
  err?: Error;
}

function Error({ statusCode, err }: ErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {statusCode ? `Error ${statusCode}` : "An error occurred"}
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : "An error occurred on client"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  // Send error to New Relic on server side
  if (typeof window === "undefined") {
    try {
      const newrelic = require("newrelic");
      if (err) {
        newrelic.noticeError(err);
        console.log("Error sent to New Relic:", err.message);
      }
    } catch (error) {
      console.error("Failed to send error to New Relic:", error);
    }
  }

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, err };
};

export default Error;

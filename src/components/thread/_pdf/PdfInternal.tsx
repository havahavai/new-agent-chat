"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure pdf.js worker
if (typeof window !== "undefined") {
  // Use explicit HTTPS and the ESM worker to avoid dynamic import issues in WebViews
  const version = (pdfjs as any).version;
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
}

type Props = { url: string };

const PdfInternal: React.FC<Props> = ({ url }) => {
  const [pageNumber] = useState<number>(1);
  const [scale] = useState<number>(1.15);
  const [loadError, setLoadError] = useState<string | null>(null);

  return (
    <div className="h-full w-full">
      {loadError ? (
        <iframe
          title="document"
          src={`${url}#toolbar=0&view=FitH`}
          className="h-full w-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Document
            file={url}
            onLoadError={() => setLoadError("load-error")}
            loading={<div className="h-full w-full" />}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      )}
    </div>
  );
};

export default PdfInternal;

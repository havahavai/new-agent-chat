"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// react-pdf requires pdfjs worker setup; load only on client
const PDFViewer = dynamic(async () => import("./_pdf/PdfInternal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
      Loading document…
    </div>
  ),
});

export type PdfViewerProps = {
  url: string;
  title?: string;
  className?: string;
};

export const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  title,
  className,
}) => {
  return (
    <div className={cn("h-full w-full bg-white", className)}>
      <PDFViewer url={url} />
    </div>
  );
};

export default PdfViewer;

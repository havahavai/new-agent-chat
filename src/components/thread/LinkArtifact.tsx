import { useArtifact } from "./artifact";
import {
  ExternalLink,
  X,
  Download,
  AlertCircle,
  FileText,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

interface LinkArtifactProps {
  url: string;
  title?: string;
  children: React.ReactNode;
}

export function LinkArtifact({ url, title, children }: LinkArtifactProps) {
  const [Artifact, { open, setOpen }] = useArtifact();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>("");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Set loading states immediately
    setIsLinkLoading(true);
    setIsLoading(true);
    setLoadingStage("Opening document...");

    // Open artifact immediately
    setOpen(true);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = url;
    link.download = title || "document";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detect document type from URL
  const getDocumentType = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || ""))
      return "image";
    if (["txt", "md", "json", "xml", "csv"].includes(extension || ""))
      return "text";
    return "unknown";
  };

  // Fetch document content
  const fetchDocumentContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsLinkLoading(false); // Clear link loading state
      setError(null);
      setLoadingStage("Detecting document type...");

      const docType = getDocumentType(url);
      setDocumentType(docType);

      if (docType === "image") {
        setLoadingStage("Preparing image for display...");
        // For images, we can display them directly
        setDocumentContent(url);
        setIsLoading(false);
        return;
      }

      if (docType === "text") {
        setLoadingStage("Fetching document content...");
        // For text files, fetch the content
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch document");
        setLoadingStage("Processing text content...");
        const text = await response.text();
        setDocumentContent(text);
        setIsLoading(false);
        return;
      }

      if (docType === "pdf") {
        setLoadingStage("Loading PDF viewer...");
        // For PDFs, use a PDF viewer service
        const pdfViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        setDocumentContent(pdfViewerUrl);
        setIsLoading(false);
        return;
      }

      setLoadingStage("Analyzing document...");
      // For other types, try to fetch as text
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch document");
      setLoadingStage("Processing content...");
      const text = await response.text();
      setDocumentContent(text);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError(
        "Failed to load document. Please try downloading or opening in a new tab.",
      );
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (open) {
      // Show loading immediately when artifact opens
      setIsLoading(true);
      setLoadingStage("Opening document...");
      // Then start fetching
      fetchDocumentContent();
    } else {
      // Reset loading state when artifact closes
      setIsLoading(false);
      setIsLinkLoading(false);
      setDocumentContent(null);
      setError(null);
      setLoadingStage("");
    }
  }, [open, url, fetchDocumentContent]);

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        className="text-primary hover:text-primary/80 inline-flex cursor-pointer items-center gap-1 font-medium underline underline-offset-4 transition-all duration-150 active:opacity-70"
        target="_blank"
        rel="noopener noreferrer"
      >
        {isLinkLoading ? "Loading..." : children}
        {isLinkLoading ? (
          <div className="border-primary h-3 w-3 animate-spin rounded-full border border-t-transparent"></div>
        ) : (
          <ExternalLink className="h-3 w-3" />
        )}
      </a>

      <Artifact title={title || url}>
        <div className="flex h-full min-h-0 flex-col">
          {/* Header with URL and action buttons */}
          <div className="flex items-center justify-between border-b bg-gray-50 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {documentType === "pdf" && (
                <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
              )}
              {documentType === "image" && (
                <Image className="h-4 w-4 flex-shrink-0 text-gray-500" />
              )}
              {documentType === "text" && (
                <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
              )}
              {!documentType && (
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-500" />
              )}
              <span
                className="truncate text-sm text-gray-600"
                title={url}
              >
                {title || url}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="flex-shrink-0"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExternalClick}
                className="flex-shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content area */}
          <div className="relative min-h-0 flex-1">
            {(isLoading || isLinkLoading) && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    Loading document...
                  </h3>
                  <p className="text-sm text-gray-500">
                    {loadingStage || "Loading document..."}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
                      <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
                      <div className="bg-primary h-2 w-2 animate-bounce rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="p-6 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Failed to load document
                  </h3>
                  <p className="mb-4 text-gray-600">{error}</p>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button onClick={handleExternalClick}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in new tab
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !isLinkLoading && !error && documentContent && (
              <>
                {documentType === "image" && (
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src={documentContent}
                      alt={title || "Document"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                {documentType === "text" && (
                  <div className="flex h-full w-full overflow-auto">
                    <pre className="p-4 text-sm whitespace-pre-wrap text-gray-800">
                      {documentContent}
                    </pre>
                  </div>
                )}

                {documentType === "pdf" && (
                  <div className="flex h-full w-full">
                    <iframe
                      src={documentContent}
                      className="h-full w-full border-0"
                      title={title || url}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation allow-modals"
                      loading="lazy"
                      allow="fullscreen; camera; microphone; geolocation"
                    />
                  </div>
                )}

                {documentType === "unknown" && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="p-4 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold">
                        Document preview not available
                      </h3>
                      <p className="mb-4 text-gray-600">
                        This file type cannot be previewed. Please download or
                        open in a new tab to view.
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button onClick={handleExternalClick}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in new tab
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Artifact>
    </>
  );
}

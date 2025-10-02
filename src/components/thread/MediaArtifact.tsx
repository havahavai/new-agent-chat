"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useArtifact } from "./artifact";
import { cn } from "@/lib/utils";

type MediaPayload = {
  url: string;
  title?: string;
  mimeType?: string;
};

type MediaArtifactControl = {
  openMedia: (payload: MediaPayload) => void;
  currentMedia?: MediaPayload;
};

const MediaArtifactControlContext = createContext<MediaArtifactControl | null>(
  null,
);

export function useMediaArtifactControl() {
  const ctx = useContext(MediaArtifactControlContext);
  if (!ctx) {
    throw new Error(
      "useMediaArtifactControl must be used within <MediaArtifact />",
    );
  }
  return ctx;
}

function getMimeTypeFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(
      url,
      typeof window !== "undefined" ? window.location.href : "http://localhost",
    );
    const p = u.pathname.toLowerCase();
    if (p.endsWith(".png")) return "image/png";
    if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
    if (p.endsWith(".gif")) return "image/gif";
    if (p.endsWith(".webp")) return "image/webp";
    if (p.endsWith(".svg")) return "image/svg+xml";
    if (p.endsWith(".pdf")) return "application/pdf";
  } catch {}
  return undefined;
}

export function MediaArtifact(props: { children?: React.ReactNode }) {
  const [ArtifactSlot, { setOpen, setContext, context }] = useArtifact();

  const control = useMemo<MediaArtifactControl>(
    () => ({
      openMedia: (payload: MediaPayload) => {
        const mime = payload.mimeType || getMimeTypeFromUrl(payload.url);
        setContext({
          ...(context || {}),
          media: {
            url: payload.url,
            title: payload.title,
            mimeType: mime,
          },
        });
        setOpen(true);
      },
      currentMedia: (context as any)?.media as MediaPayload | undefined,
    }),
    [context, setContext, setOpen],
  );

  return (
    <MediaArtifactControlContext.Provider value={control}>
      {props.children}
      <ArtifactSlot
        title={
          <div className="flex items-center gap-2 truncate">
            <span className="truncate text-base font-semibold sm:text-lg">
              {((context as any)?.media?.title as string) || "Preview"}
            </span>
          </div>
        }
      >
        <div className={cn("h-full w-full overflow-hidden bg-white")}>
          <MediaContent
            url={(context as any)?.media?.url as string | undefined}
            mimeType={(context as any)?.media?.mimeType as string | undefined}
            title={(context as any)?.media?.title as string | undefined}
          />
        </div>
      </ArtifactSlot>
    </MediaArtifactControlContext.Provider>
  );
}

function MediaContent({
  url,
  mimeType,
  title,
}: {
  url?: string;
  mimeType?: string;
  title?: string;
}) {
  if (!url) return null;

  const mt = (mimeType || getMimeTypeFromUrl(url) || "").toLowerCase();
  const isImage = mt.startsWith("image/") || url.startsWith("data:image/");
  const isPdf =
    mt === "application/pdf" ||
    url.toLowerCase().endsWith(".pdf") ||
    url.startsWith("data:application/pdf");

  if (isImage) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <img
          src={url}
          alt={title || "image"}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <iframe
        title={title || "document"}
        src={`${url}#toolbar=0&view=FitH`}
        className="h-full w-full"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-600">
      Unsupported media type
    </div>
  );
}

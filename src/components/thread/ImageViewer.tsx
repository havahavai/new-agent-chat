"use client";

import React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";

export type ImageViewerProps = {
  url: string;
  title?: string;
  className?: string;
};

export const ImageViewer: React.FC<ImageViewerProps> = ({
  url,
  title,
  className,
}) => {
  return (
    <div className={cn("h-full w-full bg-white", className)}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        wheel={{ step: 0.1 }}
        doubleClick={{ step: 0.5 }}
        pinch={{ step: 0.1 }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperClass="h-full w-full"
          contentClass="h-full w-full"
        >
          <div className="flex h-full w-full items-center justify-center bg-neutral-50">
            <img
              src={url}
              alt={title || "image"}
              className="max-h-full max-w-full select-none"
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default ImageViewer;

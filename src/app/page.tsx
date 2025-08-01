"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { ArtifactProvider } from "@/components/thread/artifact";
import { WidgetStateProvider } from "@/providers/WidgetStateContext";
import { LayoutStateProvider } from "@/providers/LayoutStateContext";
import { NonAgentFlowProvider } from "@/providers/NonAgentFlowContext";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/auth";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <Toaster />
      <ProtectedRoute>
        <ThreadProvider>
          <StreamProvider>
            <ArtifactProvider>
              <LayoutStateProvider>
                <WidgetStateProvider>
                  <NonAgentFlowProvider>
                    <Thread />
                  </NonAgentFlowProvider>
                </WidgetStateProvider>
              </LayoutStateProvider>
            </ArtifactProvider>
          </StreamProvider>
        </ThreadProvider>
      </ProtectedRoute>
    </React.Suspense>
  );
}

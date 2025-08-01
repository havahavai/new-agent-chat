"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { useStreamContext } from "@/providers/Stream";
import { cn } from "@/lib/utils";
import { EnhancedChatArea } from "./EnhancedChatArea";
import { WidgetPanelSystem } from "../widgets/WidgetPanelSystem";
import { FloatingMapsButton } from "./FloatingMapsButton";
import { ChatHistoryButton } from "./ChatHistoryButton";
import { MobileEnhancements } from "./MobileEnhancements";
import { DesktopLayoutManager } from "./DesktopLayoutManager";
import LogoutButton from "@/components/auth/LogoutButton";

interface EnhancedThreadLayoutProps {
  className?: string;
}

export function EnhancedThreadLayout({ className }: EnhancedThreadLayoutProps) {
  const { layout, setMobileLayout, setDesktopLayout, setTabletLayout } =
    useLayoutState();
  const { isMobile, isTablet, isDesktop, isLarge } = useAdvancedResponsive();
  const { getActiveWidgets } = useWidgetState();
  const stream = useStreamContext();

  // Auto-adjust layout based on screen size changes
  useEffect(() => {
    if (isMobile) {
      setMobileLayout();
    } else if (isTablet) {
      setTabletLayout();
    } else if (isDesktop || isLarge) {
      setDesktopLayout();
    }
  }, [
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    setMobileLayout,
    setTabletLayout,
    setDesktopLayout,
  ]);

  // Auto-optimize when panels overlap
  useEffect(() => {
    const activeWidgets = getActiveWidgets();
    const hasWidgets = activeWidgets.length > 0;

    // Auto-open widget panel if widgets are available and panel is closed
    if (hasWidgets && !layout.widgetPanelOpen && isDesktop) {
      // Don't auto-open for now to avoid infinite loops
      // This can be enabled later with proper state management
    }
  }, [getActiveWidgets, layout.widgetPanelOpen, isDesktop]);

  // Layout transitions configuration
  const layoutTransitions = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    duration: 0.3,
  };

  // Calculate main content area width based on open panels
  const getMainContentWidth = useCallback(() => {
    let width = "100%";

    if (isDesktop || isLarge) {
      if (layout.sidebarOpen && layout.widgetPanelOpen) {
        width = "calc(100% - 640px)"; // 320px sidebar + 320px widget panel
      } else if (layout.sidebarOpen) {
        width = "calc(100% - 320px)"; // 320px sidebar
      } else if (layout.widgetPanelOpen) {
        width = "calc(100% - 320px)"; // 320px widget panel
      }
    }

    return width;
  }, [layout.sidebarOpen, layout.widgetPanelOpen, isDesktop, isLarge]);

  return (
    <div
      className={cn(
        "bg-background relative h-screen w-full overflow-hidden",
        className,
      )}
    >
      {/* Top Navigation Bar */}
      <div className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <ChatHistoryButton />
        </div>
        <div className="flex items-center space-x-4">
          <LogoutButton
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <motion.div
        className="relative h-full pt-16"
        style={{ width: getMainContentWidth() }}
        layout
        transition={layoutTransitions}
      >
        <EnhancedChatArea />
      </motion.div>

      {/* Widget Panel System */}
      <WidgetPanelSystem />

      {/* Mobile Enhancements */}
      <MobileEnhancements />

      {/* Floating Maps Button (Mobile) */}
      <FloatingMapsButton />

      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && layout.sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => {
              // Close sidebar when overlay is clicked
              // This would need to be implemented in the layout state
            }}
          />
        )}
      </AnimatePresence>

      {/* Loading State - Removed full screen loading */}

      {/* Error State */}
      {stream.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed right-4 bottom-4 z-50 max-w-sm"
        >
          <div className="bg-destructive text-destructive-foreground rounded-lg p-4 shadow-lg">
            <p className="text-sm font-medium">Error</p>
            <p className="mt-1 text-xs">
              {String(stream.error || "An error occurred")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

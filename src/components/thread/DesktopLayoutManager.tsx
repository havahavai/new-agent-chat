"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { cn } from "@/lib/utils";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sidebar,
  Layout,
  Maximize2,
  Minimize2,
  Settings,
  Keyboard,
  HelpCircle,
} from "lucide-react";

interface DesktopLayoutManagerProps {
  children: React.ReactNode;
  className?: string;
}

export function DesktopLayoutManager({
  children,
  className,
}: DesktopLayoutManagerProps) {
  const { layout, toggleSidebar, toggleWidgetPanel, panelStates } =
    useLayoutState();
  const { isDesktop, isLarge } = useAdvancedResponsive();
  const { getActiveWidgets } = useWidgetState();

  const [showLayoutControls, setShowLayoutControls] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeWidgets = getActiveWidgets();
  const hasWidgets = activeWidgets.length > 0;

  // Keyboard shortcuts for layout management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }

      // Ctrl/Cmd + Shift + W to toggle widget panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "W") {
        e.preventDefault();
        toggleWidgetPanel();
      }

      // F11 to toggle fullscreen layout
      if (e.key === "F11") {
        e.preventDefault();
        // This could be implemented to hide all panels
      }

      // Escape to close panels
      if (e.key === "Escape") {
        if (layout.widgetPanelOpen) {
          toggleWidgetPanel();
        } else if (layout.sidebarOpen) {
          toggleSidebar();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    layout.sidebarOpen,
    layout.widgetPanelOpen,
    toggleSidebar,
    toggleWidgetPanel,
  ]);

  // Auto-optimize layout based on content
  useEffect(() => {
    if (!isDesktop && !isLarge) return;

    // Auto-open widget panel if widgets are available and panel is closed
    if (hasWidgets && !layout.widgetPanelOpen) {
      // Don't auto-open to avoid infinite loops
      // This can be enabled with proper state management
    }

    // Auto-close sidebar on very small screens when widget panel is open
    if (
      layout.sidebarOpen &&
      layout.widgetPanelOpen &&
      window.innerWidth < 1200
    ) {
      // Could implement auto-close logic here
    }
  }, [
    hasWidgets,
    layout.sidebarOpen,
    layout.widgetPanelOpen,
    isDesktop,
    isLarge,
  ]);

  // Layout optimization
  const optimizeLayout = useCallback(() => {
    if (hasWidgets && !layout.widgetPanelOpen) {
      toggleWidgetPanel();
    }
  }, [hasWidgets, layout.widgetPanelOpen, toggleWidgetPanel]);

  // Calculate layout classes
  const getLayoutClasses = useCallback(() => {
    const classes = ["transition-all duration-300 ease-in-out"];

    if (layout.sidebarOpen && layout.widgetPanelOpen) {
      classes.push("ml-80 mr-96"); // 320px sidebar + 384px widget panel
    } else if (layout.sidebarOpen) {
      classes.push("ml-80"); // 320px sidebar
    } else if (layout.widgetPanelOpen) {
      classes.push("mr-96"); // 384px widget panel
    }

    return classes.join(" ");
  }, [layout.sidebarOpen, layout.widgetPanelOpen]);

  // Layout presets
  const applyLayoutPreset = useCallback(
    (preset: "chat" | "widgets" | "full" | "minimal") => {
      switch (preset) {
        case "chat":
          // Chat-focused: sidebar open, widget panel closed
          if (!layout.sidebarOpen) toggleSidebar();
          if (layout.widgetPanelOpen) toggleWidgetPanel();
          break;
        case "widgets":
          // Widget-focused: sidebar closed, widget panel open
          if (layout.sidebarOpen) toggleSidebar();
          if (!layout.widgetPanelOpen) toggleWidgetPanel();
          break;
        case "full":
          // Full layout: both panels open
          if (!layout.sidebarOpen) toggleSidebar();
          if (!layout.widgetPanelOpen) toggleWidgetPanel();
          break;
        case "minimal":
          // Minimal: both panels closed
          if (layout.sidebarOpen) toggleSidebar();
          if (layout.widgetPanelOpen) toggleWidgetPanel();
          break;
      }
    },
    [
      layout.sidebarOpen,
      layout.widgetPanelOpen,
      toggleSidebar,
      toggleWidgetPanel,
    ],
  );

  if (!isDesktop && !isLarge) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("relative h-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layout Controls Overlay */}
      <AnimatePresence>
        {showLayoutControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 z-50"
          >
            <div className="bg-background min-w-[280px] rounded-lg border p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Layout Controls</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLayoutControls(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyLayoutPreset("chat")}
                    className="text-xs"
                  >
                    Chat Focus
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyLayoutPreset("widgets")}
                    className="text-xs"
                  >
                    Widget Focus
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyLayoutPreset("full")}
                    className="text-xs"
                  >
                    Full Layout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyLayoutPreset("minimal")}
                    className="text-xs"
                  >
                    Minimal
                  </Button>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Sidebar</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSidebar}
                      className="h-6 px-2"
                    >
                      {layout.sidebarOpen ? (
                        <PanelLeftClose className="h-3 w-3" />
                      ) : (
                        <PanelLeftOpen className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Widget Panel</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleWidgetPanel}
                      className="h-6 px-2"
                    >
                      {layout.widgetPanelOpen ? (
                        <PanelRightClose className="h-3 w-3" />
                      ) : (
                        <PanelRightOpen className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 left-4 z-50"
          >
            <div className="bg-background min-w-[320px] rounded-lg border p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 font-medium">Layout</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>Ctrl+B - Toggle Sidebar</div>
                      <div>Ctrl+Shift+W - Toggle Widget Panel</div>
                      <div>Esc - Close Active Panel</div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-medium">Widgets</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>Ctrl+W - Close Widget</div>
                      <div>Ctrl+M - Minimize Widget</div>
                      <div>Ctrl+Shift+W - Close All Widgets</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Layout Controls */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 z-40"
          >
            <div className="bg-background/80 flex items-center space-x-1 rounded-lg border p-1 shadow-lg backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLayoutControls(!showLayoutControls)}
                className="h-8 w-8 p-0"
                title="Layout Controls"
              >
                <Layout className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="h-8 w-8 p-0"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </Button>

              {hasWidgets && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={optimizeLayout}
                  className="h-8 w-8 p-0"
                  title="Optimize Layout"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Layout Adjustments */}
      <div className={cn("h-full", getLayoutClasses())}>{children}</div>

      {/* Layout Status Indicator */}
      <AnimatePresence>
        {layout.sidebarOpen || layout.widgetPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-4 left-4 z-40"
          >
            <div className="bg-background/80 flex items-center space-x-2 rounded-lg border px-3 py-1 shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-1">
                {layout.sidebarOpen && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    Sidebar
                  </Badge>
                )}
                {layout.widgetPanelOpen && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    Widgets {hasWidgets && `(${activeWidgets.length})`}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Import Separator component
import { Separator } from "@/components/ui/separator";

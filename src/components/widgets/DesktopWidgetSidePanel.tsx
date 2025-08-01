"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWidgetState, ActiveWidget } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { componentMap, ComponentType } from "@/components/widgets";
import { cn } from "@/lib/utils";
import {
  X,
  Minimize2,
  Maximize2,
  Settings,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";

interface DesktopWidgetSidePanelProps {
  className?: string;
}

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 384;

export function DesktopWidgetSidePanel({
  className,
}: DesktopWidgetSidePanelProps) {
  const {
    activeWidgets,
    closeWidget,
    minimizeWidget,
    restoreWidget,
    getActiveWidgets,
    clearAllWidgets,
  } = useWidgetState();
  const {
    layout,
    toggleWidgetPanel,
    closeWidgetPanel,
    panelStates,
    setWidgetPanelWidth,
  } = useLayoutState();

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isHovered, setIsHovered] = useState(false);
  const [showMinimizedList, setShowMinimizedList] = useState(true);
  const resizeRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Get widgets
  const activeWidgetsList = getActiveWidgets();
  const primaryWidget = activeWidgetsList[0];
  const minimizedWidgets = activeWidgetsList.slice(1);

  // Handle widget selection
  const handleWidgetSelect = useCallback((widgetId: string) => {
    setSelectedWidgetId(widgetId);
  }, []);

  // Handle widget close
  const handleCloseWidget = useCallback(
    (widgetId: string) => {
      closeWidget(widgetId);
      if (selectedWidgetId === widgetId) {
        setSelectedWidgetId(null);
      }
    },
    [closeWidget, selectedWidgetId],
  );

  // Handle widget minimize
  const handleMinimizeWidget = useCallback(
    (widgetId: string) => {
      minimizeWidget(widgetId);
      if (selectedWidgetId === widgetId) {
        setSelectedWidgetId(null);
      }
    },
    [minimizeWidget, selectedWidgetId],
  );

  // Handle widget restore
  const handleRestoreWidget = useCallback(
    (widgetId: string) => {
      restoreWidget(widgetId);
      setSelectedWidgetId(widgetId);
    },
    [restoreWidget],
  );

  // Handle panel resizing
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(
        MIN_PANEL_WIDTH,
        Math.min(MAX_PANEL_WIDTH, newWidth),
      );

      setPanelWidth(clampedWidth);
      setWidgetPanelWidth(clampedWidth);
    },
    [isResizing, setWidgetPanelWidth],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!layout.widgetPanelOpen) return;

      // Escape to close panel
      if (e.key === "Escape") {
        closeWidgetPanel();
      }

      // Ctrl/Cmd + W to close current widget
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (primaryWidget) {
          handleCloseWidget(primaryWidget.id);
        }
      }

      // Ctrl/Cmd + M to minimize current widget
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        if (primaryWidget) {
          handleMinimizeWidget(primaryWidget.id);
        }
      }

      // Ctrl/Cmd + Shift + W to close all widgets
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "W") {
        e.preventDefault();
        clearAllWidgets();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    layout.widgetPanelOpen,
    closeWidgetPanel,
    primaryWidget,
    handleCloseWidget,
    handleMinimizeWidget,
    clearAllWidgets,
  ]);

  // Mouse move for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Render widget component
  const renderWidget = (widget: ActiveWidget) => {
    const WidgetComponent = componentMap[widget.config.type];
    if (!WidgetComponent) {
      return (
        <div className="text-muted-foreground flex h-full items-center justify-center">
          <div className="text-center">
            <p className="mb-2">
              Widget type &quot;{widget.config.type}&quot; not found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCloseWidget(widget.config.id)}
            >
              Close Widget
            </Button>
          </div>
        </div>
      );
    }

    return (
      <WidgetComponent
        {...widget.config.data}
        onClose={() => handleCloseWidget(widget.config.id)}
        onMinimize={() => handleMinimizeWidget(widget.config.id)}
      />
    );
  };

  // Panel animations
  const panelVariants = {
    hidden: { x: panelWidth, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: panelWidth, opacity: 0 },
  };

  if (!layout.widgetPanelOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "bg-background fixed top-0 right-0 z-30 flex h-full flex-col border-l shadow-xl",
          isResizing && "select-none",
          className,
        )}
        style={{ width: panelWidth }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Widgets</h3>
            {activeWidgets.size > 0 && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {activeWidgets.size}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {/* Settings button with hover effect */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 transition-all duration-200",
                isHovered && "bg-accent/50",
              )}
              title="Widget Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Close panel button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeWidgetPanel}
              className={cn(
                "p-2 transition-all duration-200",
                isHovered && "bg-accent/50 hover:bg-destructive/10",
              )}
              title="Close Panel (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Widget Content */}
        <div className="flex-1 overflow-hidden">
          {primaryWidget ? (
            <div className="h-full">
              {/* Widget header with actions */}
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {primaryWidget.type}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMinimizeWidget(primaryWidget.id)}
                    className="h-7 w-7 p-0"
                    title="Minimize (Ctrl+M)"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCloseWidget(primaryWidget.id)}
                    className="hover:bg-destructive/10 h-7 w-7 p-0"
                    title="Close (Ctrl+W)"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Widget content */}
              <div className="h-[calc(100%-48px)]">
                {renderWidget(primaryWidget)}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-4xl">📱</div>
                <p className="mb-2 font-medium">No active widgets</p>
                <p className="mb-4 text-xs">
                  Widgets will appear here when activated
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeWidgetPanel}
                >
                  Close Panel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Minimized Widgets Section */}
        {minimizedWidgets.length > 0 && (
          <>
            <Separator />
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between p-3">
                <button
                  onClick={() => setShowMinimizedList(!showMinimizedList)}
                  className="hover:text-foreground flex items-center space-x-2 text-sm font-medium transition-colors"
                >
                  {showMinimizedList ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                  <span>Minimized ({minimizedWidgets.length})</span>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllWidgets}
                  className="hover:bg-destructive/10 h-7 px-2 text-xs"
                  title="Close All Widgets (Ctrl+Shift+W)"
                >
                  Clear All
                </Button>
              </div>

              <AnimatePresence>
                {showMinimizedList && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 px-3 pb-3">
                      {minimizedWidgets.map((widget) => (
                        <motion.div
                          key={widget.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-md border p-2 transition-all duration-200",
                            selectedWidgetId === widget.id
                              ? "bg-accent border-accent-foreground"
                              : "hover:bg-accent/50 hover:border-accent-foreground/50",
                          )}
                          onClick={() => handleRestoreWidget(widget.id)}
                        >
                          <div className="flex min-w-0 flex-1 items-center space-x-2">
                            <GripVertical className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                            <span className="truncate text-sm font-medium">
                              {widget.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseWidget(widget.id);
                              }}
                              className="hover:bg-destructive/10 h-6 w-6 p-0"
                              title="Close Widget"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreWidget(widget.id);
                              }}
                              className="h-6 w-6 p-0"
                              title="Restore Widget"
                            >
                              <Maximize2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className={cn(
            "absolute top-0 left-0 h-full w-1 cursor-col-resize transition-colors",
            isResizing && "bg-primary/50",
            !isResizing && "hover:bg-primary/20",
          )}
          onMouseDown={handleResizeStart}
          title="Drag to resize panel"
        />
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWidgetState, ActiveWidget } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { componentMap, ComponentType } from "@/components/widgets";
import { cn } from "@/lib/utils";
import {
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  GripVertical,
} from "lucide-react";

interface MobileWidgetBottomSheetProps {
  className?: string;
}

export function MobileWidgetBottomSheet({
  className,
}: MobileWidgetBottomSheetProps) {
  const { getActiveWidgets, closeWidget, minimizeWidget, restoreWidget } =
    useWidgetState();
  const { layout, closeBottomSheet, toggleBottomSheet } = useLayoutState();
  const { isMobile } = useAdvancedResponsive();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<ActiveWidget[]>([]);
  const [currentWidgetIndex, setCurrentWidgetIndex] = useState(0);

  // Update active widgets when they change
  useEffect(() => {
    const widgets = getActiveWidgets();
    setActiveWidgets(widgets);

    // Auto-expand if widgets are available
    if (widgets.length > 0 && !layout.bottomSheetOpen) {
      toggleBottomSheet();
    }
  }, [getActiveWidgets, layout.bottomSheetOpen, toggleBottomSheet]);

  // Handle widget close
  const handleCloseWidget = useCallback(
    (widgetId: string) => {
      closeWidget(widgetId);

      // Update current index if needed
      const updatedWidgets = getActiveWidgets();
      if (currentWidgetIndex >= updatedWidgets.length) {
        setCurrentWidgetIndex(Math.max(0, updatedWidgets.length - 1));
      }

      // Close sheet if no widgets left
      if (updatedWidgets.length === 0) {
        closeBottomSheet();
      }
    },
    [closeWidget, currentWidgetIndex, getActiveWidgets, closeBottomSheet],
  );

  // Handle widget minimize
  const handleMinimizeWidget = useCallback(
    (widgetId: string) => {
      minimizeWidget(widgetId);
    },
    [minimizeWidget],
  );

  // Handle widget restore
  const handleRestoreWidget = useCallback(
    (widgetId: string) => {
      restoreWidget(widgetId);
      const widgetIndex = activeWidgets.findIndex(
        (w) => w.config.id === widgetId,
      );
      if (widgetIndex !== -1) {
        setCurrentWidgetIndex(widgetIndex);
      }
    },
    [restoreWidget, activeWidgets],
  );

  // Handle sheet drag end
  const handleDragEnd = useCallback(
    (event: any, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.y > threshold) {
        // Dragged down - close sheet
        closeBottomSheet();
      } else if (info.offset.y < -threshold) {
        // Dragged up - expand sheet
        setIsExpanded(true);
      }
    },
    [closeBottomSheet],
  );

  // Render widget component
  const renderWidget = (widget: ActiveWidget) => {
    const WidgetComponent = componentMap[widget.config.type];
    if (!WidgetComponent) {
      return (
        <div className="text-muted-foreground flex h-full items-center justify-center">
          <p>Widget type &quot;{widget.config.type}&quot; not found</p>
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

  // Get current widget
  const currentWidget = activeWidgets[currentWidgetIndex];

  if (!isMobile) return null;

  return (
    <Sheet
      open={layout.bottomSheetOpen}
      onOpenChange={toggleBottomSheet}
    >
      <SheetContent
        side="bottom"
        className={cn(
          "border-primary/20 flex h-[85vh] flex-col border-t-4 p-0",
          isExpanded && "h-[95vh]",
          className,
        )}
      >
        {/* Drag Handle */}
        <motion.div
          className="flex cursor-grab justify-center py-2 active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </motion.div>

        {/* Header */}
        <SheetHeader className="flex-shrink-0 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SheetTitle className="text-lg">
                {currentWidget ? currentWidget.config.type : "Widgets"}
              </SheetTitle>
              {activeWidgets.length > 1 && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                  {currentWidgetIndex + 1} of {activeWidgets.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeBottomSheet}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Widget Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentWidget ? (
              <motion.div
                key={currentWidget.config.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderWidget(currentWidget)}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground flex h-full items-center justify-center"
              >
                <div className="text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <GripVertical className="h-8 w-8" />
                  </div>
                  <p className="mb-2 text-lg font-medium">No Active Widgets</p>
                  <p className="text-sm">
                    Widgets will appear here when activated
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Widget Switcher */}
        {activeWidgets.length > 1 && (
          <div className="flex-shrink-0 border-t p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Active Widgets
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentWidgetIndex(Math.max(0, currentWidgetIndex - 1))
                  }
                  disabled={currentWidgetIndex === 0}
                  className="p-1"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentWidgetIndex(
                      Math.min(
                        activeWidgets.length - 1,
                        currentWidgetIndex + 1,
                      ),
                    )
                  }
                  disabled={currentWidgetIndex === activeWidgets.length - 1}
                  className="p-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {activeWidgets.map((widget, index) => (
                <Button
                  key={widget.config.id}
                  variant={index === currentWidgetIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentWidgetIndex(index)}
                  className="flex-shrink-0"
                >
                  <span className="max-w-20 truncate text-xs">
                    {widget.config.type}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseWidget(widget.config.id);
                    }}
                    className="ml-2 h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Minimized Widgets Tray */}
        {activeWidgets.length > 0 && (
          <div className="flex-shrink-0 border-t p-2">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {activeWidgets
                .filter((widget) => widget.isMinimized)
                .map((widget) => (
                  <Button
                    key={widget.config.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreWidget(widget.config.id)}
                    className="flex-shrink-0"
                  >
                    <Maximize2 className="mr-1 h-3 w-3" />
                    <span className="max-w-16 truncate text-xs">
                      {widget.config.type}
                    </span>
                  </Button>
                ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

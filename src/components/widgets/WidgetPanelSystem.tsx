"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWidgetState, ActiveWidget } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { componentMap, ComponentType } from "@/components/widgets";
import { cn } from "@/lib/utils";
import {
  X,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
} from "lucide-react";
import { DesktopWidgetSidePanel } from "./DesktopWidgetSidePanel";
import { WidgetLauncher } from "./WidgetLauncher";

interface WidgetPanelSystemProps {
  className?: string;
}

export function WidgetPanelSystem({ className }: WidgetPanelSystemProps) {
  const {
    activeWidgets,
    closeWidget,
    minimizeWidget,
    restoreWidget,
    getActiveWidgets,
  } = useWidgetState();
  const { layout, toggleWidgetPanel, closeWidgetPanel } = useLayoutState();
  const { isMobile, isDesktop } = useAdvancedResponsive();

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Get the primary widget (first active widget)
  const primaryWidget = getActiveWidgets()[0];
  const minimizedWidgets = getActiveWidgets().slice(1);

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

  // Widget launcher state
  const [showWidgetLauncher, setShowWidgetLauncher] = useState(false);

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

  // Mobile bottom sheet version
  if (isMobile) {
    return (
      <Sheet
        open={layout.widgetPanelOpen}
        onOpenChange={toggleWidgetPanel}
      >
        <SheetContent
          side="bottom"
          className="flex h-[90vh] flex-col p-0"
        >
          <SheetHeader className="flex-shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Widgets</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWidgetPanel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            {primaryWidget ? (
              <div className="h-full">{renderWidget(primaryWidget)}</div>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <p>No active widgets</p>
              </div>
            )}
          </div>

          {/* Minimized widgets bar */}
          {minimizedWidgets.length > 0 && (
            <div className="flex-shrink-0 border-t p-2">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {minimizedWidgets.map((widget) => (
                  <Button
                    key={widget.config.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreWidget(widget.config.id)}
                    className="flex-shrink-0"
                  >
                    <Maximize2 className="mr-1 h-3 w-3" />
                    {widget.config.type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop side panel version - use enhanced component
  if (isDesktop) {
    return (
      <>
        <DesktopWidgetSidePanel className={className} />
        <WidgetLauncher
          isOpen={showWidgetLauncher}
          onClose={() => setShowWidgetLauncher(false)}
        />
      </>
    );
  }

  // Mobile bottom sheet version
  return (
    <>
      <Sheet
        open={layout.widgetPanelOpen}
        onOpenChange={toggleWidgetPanel}
      >
        <SheetContent
          side="bottom"
          className="flex h-[90vh] flex-col p-0"
        >
          <SheetHeader className="flex-shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Widgets</SheetTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetLauncher(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeWidgetPanel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            {primaryWidget ? (
              <div className="h-full">{renderWidget(primaryWidget)}</div>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="mb-2">No active widgets</p>
                  <p className="mb-4 text-xs">
                    Widgets will appear here when activated
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWidgetLauncher(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Launch Widget
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Minimized widgets bar */}
          {minimizedWidgets.length > 0 && (
            <div className="flex-shrink-0 border-t p-2">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {minimizedWidgets.map((widget) => (
                  <Button
                    key={widget.config.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreWidget(widget.config.id)}
                    className="flex-shrink-0"
                  >
                    <Maximize2 className="mr-1 h-3 w-3" />
                    {widget.config.type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <WidgetLauncher
        isOpen={showWidgetLauncher}
        onClose={() => setShowWidgetLauncher(false)}
      />
    </>
  );
}

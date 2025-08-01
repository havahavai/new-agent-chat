"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { useStreamContext } from "@/providers/Stream";
import { cn } from "@/lib/utils";
import { Map, X, Plus } from "lucide-react";

interface FloatingMapsButtonProps {
  className?: string;
}

export function FloatingMapsButton({ className }: FloatingMapsButtonProps) {
  const { openWidget } = useWidgetState();
  const { layout, showFloatingButton, hideFloatingButton } = useLayoutState();
  const { isMobile } = useAdvancedResponsive();
  const stream = useStreamContext();

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show/hide button based on chat state and mobile layout
  useEffect(() => {
    const shouldShow =
      isMobile &&
      stream.messages.length > 0 &&
      !layout.widgetPanelOpen &&
      layout.floatingButtonVisible;

    setIsVisible(shouldShow);
  }, [
    isMobile,
    stream.messages.length,
    layout.widgetPanelOpen,
    layout.floatingButtonVisible,
  ]);

  // Handle button click
  const handleButtonClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  // Handle widget selection
  const handleWidgetSelect = async (widgetType: string) => {
    try {
      await openWidget({
        id: `floating-${widgetType}-${Date.now()}`,
        type: widgetType as any,
        data: {},
        triggerSource: "floating-button",
        metadata: {
          source: "manual",
          timestamp: Date.now(),
        },
      });
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to open widget:", error);
    }
  };

  // Quick widget options
  const quickWidgets = [
    { type: "FlightOptionsWidget", label: "Flight Options", icon: Map, color: "bg-blue-500" },
    { type: "FlightStatusWidget", label: "Flight Status", icon: Map, color: "bg-green-500" },
    { type: "weatherWidget", label: "Weather", icon: Map, color: "bg-yellow-500" },
    { type: "LoungeWidget", label: "Lounge Access", icon: Map, color: "bg-purple-500" },
    { type: "TravelerDetailsWidget", label: "Traveler Details", icon: Map, color: "bg-orange-500" },
  ];

  if (!isVisible) return null;

  return (
    <div className={cn("fixed right-6 bottom-6 z-50", className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 bottom-16 mb-2"
          >
            <div className="bg-background min-w-[200px] space-y-1 rounded-lg border p-2 shadow-lg">
              {quickWidgets.map((widget, index) => (
                <motion.button
                  key={widget.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleWidgetSelect(widget.type)}
                  className="hover:bg-accent flex w-full items-center space-x-3 rounded-md p-3 text-left transition-colors group"
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", widget.color)}>
                    <widget.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {widget.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={handleButtonClick}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { cn } from "@/lib/utils";

interface MobileGestureHandlerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileGestureHandler({
  children,
  className,
}: MobileGestureHandlerProps) {
  const { layout, toggleSidebar, toggleWidgetPanel, toggleBottomSheet } =
    useLayoutState();
  const { isMobile } = useAdvancedResponsive();
  const { getActiveWidgets } = useWidgetState();

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useMotionValue(0);
  const startY = useMotionValue(0);
  const currentX = useMotionValue(0);
  const currentY = useMotionValue(0);

  // Transform values for visual feedback
  const translateX = useTransform(currentX, (x) => x * 0.3);
  const translateY = useTransform(currentY, (y) => y * 0.3);
  const scale = useTransform(currentY, (y) => 1 - Math.abs(y) * 0.0001);
  const backgroundGradient = useTransform(
    currentY,
    (y) =>
      `linear-gradient(to bottom, rgba(0,0,0,${Math.abs(y) * 0.001}), transparent)`,
  );

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      startX.set(touch.clientX);
      startY.set(touch.clientY);
      currentX.set(0);
      currentY.set(0);
    },
    [isMobile, startX, startY, currentX, currentY],
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.get();
      const deltaY = touch.clientY - startY.get();

      currentX.set(deltaX);
      currentY.set(deltaY);
    },
    [isMobile, startX, startY, currentX, currentY],
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return;

      const deltaX = currentX.get();
      const deltaY = currentY.get();
      const threshold = 100;

      // Reset position
      currentX.set(0);
      currentY.set(0);

      // Handle swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold) {
          // Swipe right - open sidebar
          toggleSidebar();
        } else if (deltaX < -threshold) {
          // Swipe left - close sidebar or open widget panel
          if (layout.sidebarOpen) {
            toggleSidebar();
          } else {
            const activeWidgets = getActiveWidgets();
            if (activeWidgets.length > 0) {
              toggleWidgetPanel();
            }
          }
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold) {
          // Swipe down - close bottom sheet or minimize
          if (layout.bottomSheetOpen) {
            toggleBottomSheet();
          }
        } else if (deltaY < -threshold) {
          // Swipe up - open bottom sheet or expand
          const activeWidgets = getActiveWidgets();
          if (activeWidgets.length > 0 && !layout.bottomSheetOpen) {
            toggleBottomSheet();
          }
        }
      }
    },
    [
      isMobile,
      currentX,
      currentY,
      layout,
      toggleSidebar,
      toggleWidgetPanel,
      toggleBottomSheet,
      getActiveWidgets,
    ],
  );

  // Handle keyboard shortcuts for mobile
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isMobile) return;

      switch (e.key) {
        case "Escape":
          // Close open panels
          if (layout.sidebarOpen) toggleSidebar();
          if (layout.widgetPanelOpen) toggleWidgetPanel();
          if (layout.bottomSheetOpen) toggleBottomSheet();
          break;
        case "ArrowLeft":
          if (e.metaKey || e.ctrlKey) {
            // Cmd/Ctrl + Left - open sidebar
            toggleSidebar();
          }
          break;
        case "ArrowRight":
          if (e.metaKey || e.ctrlKey) {
            // Cmd/Ctrl + Right - open widget panel
            toggleWidgetPanel();
          }
          break;
        default:
          break;
      }
    },
    [isMobile, layout, toggleSidebar, toggleWidgetPanel, toggleBottomSheet],
  );

  // Set up event listeners
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isMobile,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
  ]);

  // Handle long press for context menu
  const handleLongPress = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return;

      // Show context menu or haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Could show a context menu here
      console.log("Long press detected");
    },
    [isMobile],
  );

  // Set up long press detection
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let longPressTimer: NodeJS.Timeout;
    let isLongPress = false;

    const handleTouchStartLong = (e: TouchEvent) => {
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        handleLongPress(e);
      }, 500);
    };

    const handleTouchEndLong = () => {
      clearTimeout(longPressTimer);
      isLongPress = false;
    };

    container.addEventListener("touchstart", handleTouchStartLong, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEndLong, {
      passive: true,
    });
    container.addEventListener("touchcancel", handleTouchEndLong, {
      passive: true,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStartLong);
      container.removeEventListener("touchend", handleTouchEndLong);
      container.removeEventListener("touchcancel", handleTouchEndLong);
      clearTimeout(longPressTimer);
    };
  }, [isMobile, handleLongPress]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn("mobile-gesture-handler", className)}
      style={{
        x: translateX,
        y: translateY,
        scale,
      }}
    >
      {children}

      {/* Visual feedback for gestures */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: backgroundGradient,
        }}
      />
    </motion.div>
  );
}

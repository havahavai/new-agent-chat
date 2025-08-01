"use client";

import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { cn } from "@/lib/utils";
import { MobileWidgetBottomSheet } from "../widgets/MobileWidgetBottomSheet";
import { MobileGestureHandler } from "./MobileGestureHandler";

interface MobileEnhancementsProps {
  className?: string;
}

export function MobileEnhancements({ className }: MobileEnhancementsProps) {
  const { isMobile } = useAdvancedResponsive();

  if (!isMobile) return null;

  return (
    <div className={cn("mobile-enhancements", className)}>
      {/* Mobile Gesture Handler - Wraps the entire mobile experience */}
      <MobileGestureHandler>
        {/* Mobile Widget Bottom Sheet */}
        <MobileWidgetBottomSheet />
      </MobileGestureHandler>
    </div>
  );
}

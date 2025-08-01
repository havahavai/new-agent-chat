"use client";

import { useState, useEffect, useCallback } from "react";
import { useMediaQuery } from "./useMediaQuery";

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Device types
export type DeviceType = "mobile" | "tablet" | "desktop" | "large";

// Orientation types
export type Orientation = "portrait" | "landscape";

// Responsive state interface
export interface ResponsiveState {
  // Breakpoint queries
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;

  // Device type
  deviceType: DeviceType;
  currentBreakpoint: "mobile" | "tablet" | "desktop" | "large";
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;

  // Orientation
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;

  // Viewport dimensions
  width: number;
  height: number;
  aspectRatio: number;

  // Touch capabilities
  hasTouch: boolean;
  hasHover: boolean;

  // Performance considerations
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;

  // Layout helpers
  isCompact: boolean;
  isSpacious: boolean;
  canShowSidebar: boolean;
  canShowWidgetPanel: boolean;
  canShowBottomSheet: boolean;
}

// Hook options
export interface UseAdvancedResponsiveOptions {
  // Custom breakpoints
  breakpoints?: Partial<typeof BREAKPOINTS>;

  // Device type thresholds
  mobileThreshold?: number;
  tabletThreshold?: number;
  desktopThreshold?: number;

  // Debounce resize events
  debounceMs?: number;

  // Initial values (for SSR)
  initialWidth?: number;
  initialHeight?: number;
}

export function useAdvancedResponsive(
  options: UseAdvancedResponsiveOptions = {},
): ResponsiveState {
  const {
    breakpoints = BREAKPOINTS,
    mobileThreshold = 768,
    tabletThreshold = 1024,
    desktopThreshold = 1280,
    debounceMs = 100,
    initialWidth = typeof window !== "undefined" ? window.innerWidth : 1024,
    initialHeight = typeof window !== "undefined" ? window.innerHeight : 768,
  } = options;

  // Viewport dimensions
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  // Media queries
  const isXs = useMediaQuery(`(min-width: ${breakpoints.xs}px)`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  const is2xl = useMediaQuery(`(min-width: ${breakpoints["2xl"]}px)`);

  // Device capabilities
  const hasTouch = useMediaQuery("(pointer: coarse)");
  const hasHover = useMediaQuery("(hover: hover)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Orientation
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const isLandscape = useMediaQuery("(orientation: landscape)");

  // Update dimensions with debouncing
  const updateDimensions = useCallback(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  // Debounced resize handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, debounceMs);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateDimensions, debounceMs]);

  // Calculate derived values
  const aspectRatio = dimensions.width / dimensions.height;
  const orientation: Orientation = isPortrait ? "portrait" : "landscape";

  // Determine device type
  const getDeviceType = (): DeviceType => {
    if (dimensions.width < mobileThreshold) return "mobile";
    if (dimensions.width < tabletThreshold) return "tablet";
    if (dimensions.width < desktopThreshold) return "desktop";
    return "large";
  };

  const deviceType = getDeviceType();
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isDesktop = deviceType === "desktop";
  const isLarge = deviceType === "large";

  // Layout helpers
  const isCompact = dimensions.width < (breakpoints.md || BREAKPOINTS.md);
  const isSpacious = dimensions.width >= (breakpoints.xl || BREAKPOINTS.xl);

  // Panel visibility logic
  const canShowSidebar = dimensions.width >= (breakpoints.lg || BREAKPOINTS.lg);
  const canShowWidgetPanel =
    dimensions.width >= (breakpoints.md || BREAKPOINTS.md);
  const canShowBottomSheet =
    dimensions.width < (breakpoints.lg || BREAKPOINTS.lg);

  // Current breakpoint
  const currentBreakpoint: "mobile" | "tablet" | "desktop" | "large" = isMobile
    ? "mobile"
    : isTablet
      ? "tablet"
      : isDesktop
        ? "desktop"
        : "large";

  return {
    // Breakpoint queries
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,

    // Device type
    deviceType,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,

    // Orientation
    orientation,
    isPortrait,
    isLandscape,

    // Viewport dimensions
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio,

    // Touch capabilities
    hasTouch,
    hasHover,

    // Performance considerations
    prefersReducedMotion,
    prefersDarkMode,

    // Layout helpers
    isCompact,
    isSpacious,
    canShowSidebar,
    canShowWidgetPanel,
    canShowBottomSheet,
  };
}

// Utility hook for responsive values
export function useResponsiveValue<T>(
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    large?: T;
  },
  defaultValue: T,
): T {
  const { deviceType } = useAdvancedResponsive();

  switch (deviceType) {
    case "mobile":
      return (
        values.mobile ??
        values.tablet ??
        values.desktop ??
        values.large ??
        defaultValue
      );
    case "tablet":
      return (
        values.tablet ??
        values.desktop ??
        values.large ??
        values.mobile ??
        defaultValue
      );
    case "desktop":
      return (
        values.desktop ??
        values.large ??
        values.tablet ??
        values.mobile ??
        defaultValue
      );
    case "large":
      return (
        values.large ??
        values.desktop ??
        values.tablet ??
        values.mobile ??
        defaultValue
      );
    default:
      return defaultValue;
  }
}

// Utility hook for responsive breakpoint matching
export function useResponsiveMatch(
  breakpoint: keyof typeof BREAKPOINTS,
): boolean {
  const { isXs, isSm, isMd, isLg, isXl, is2xl } = useAdvancedResponsive();

  switch (breakpoint) {
    case "xs":
      return isXs;
    case "sm":
      return isSm;
    case "md":
      return isMd;
    case "lg":
      return isLg;
    case "xl":
      return isXl;
    case "2xl":
      return is2xl;
    default:
      return false;
  }
}

// Utility hook for orientation changes
export function useOrientation(): {
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
} {
  const { orientation, isPortrait, isLandscape } = useAdvancedResponsive();

  return {
    orientation,
    isPortrait,
    isLandscape,
  };
}

// Utility hook for touch capabilities
export function useTouchCapabilities(): {
  hasTouch: boolean;
  hasHover: boolean;
} {
  const { hasTouch, hasHover } = useAdvancedResponsive();

  return {
    hasTouch,
    hasHover,
  };
}

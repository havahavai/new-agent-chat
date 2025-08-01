"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Layout configuration
export interface LayoutConfig {
  sidebarOpen: boolean;
  widgetPanelOpen: boolean;
  artifactPanelOpen: boolean;
  bottomSheetOpen: boolean;
  floatingButtonVisible: boolean;
}

// Panel states
export interface PanelStates {
  sidebar: {
    isOpen: boolean;
    width: number;
    isCollapsible: boolean;
  };
  widgetPanel: {
    isOpen: boolean;
    width: number;
    position: "left" | "right";
    isResizable: boolean;
  };
  artifactPanel: {
    isOpen: boolean;
    width: number;
    isResizable: boolean;
  };
  bottomSheet: {
    isOpen: boolean;
    height: number;
    isDraggable: boolean;
    isExpanded: boolean;
  };
}

// Responsive breakpoints
export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}

// Layout state context interface
interface LayoutStateContextType {
  // Current layout state
  layout: LayoutConfig;
  panelStates: PanelStates;

  // Responsive state
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  currentBreakpoint: "mobile" | "tablet" | "desktop" | "large";

  // Layout actions
  toggleSidebar: () => void;
  toggleWidgetPanel: () => void;
  toggleArtifactPanel: () => void;
  toggleBottomSheet: () => void;

  // Panel management
  openSidebar: () => void;
  closeSidebar: () => void;
  openWidgetPanel: () => void;
  closeWidgetPanel: () => void;
  openArtifactPanel: () => void;
  closeArtifactPanel: () => void;
  openBottomSheet: () => void;
  closeBottomSheet: () => void;

  // Panel sizing
  setSidebarWidth: (width: number) => void;
  setWidgetPanelWidth: (width: number) => void;
  setArtifactPanelWidth: (width: number) => void;
  setBottomSheetHeight: (height: number) => void;

  // Floating button
  showFloatingButton: () => void;
  hideFloatingButton: () => void;

  // Layout presets
  setMobileLayout: () => void;
  setDesktopLayout: () => void;
  setTabletLayout: () => void;

  // Utility functions
  getAvailableSpace: () => number;
  isPanelOverlapping: () => boolean;
  optimizeLayout: () => void;
}

const LayoutStateContext = createContext<LayoutStateContextType | undefined>(
  undefined,
);

// Default breakpoints
const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  large: 1536,
};

export function LayoutStateProvider({ children }: { children: ReactNode }) {
  // Responsive state
  const isMobile = useMediaQuery(
    `(max-width: ${DEFAULT_BREAKPOINTS.mobile - 1}px)`,
  );
  const isTablet = useMediaQuery(
    `(min-width: ${DEFAULT_BREAKPOINTS.mobile}px) and (max-width: ${DEFAULT_BREAKPOINTS.tablet - 1}px)`,
  );
  const isDesktop = useMediaQuery(
    `(min-width: ${DEFAULT_BREAKPOINTS.tablet}px) and (max-width: ${DEFAULT_BREAKPOINTS.desktop - 1}px)`,
  );
  const isLarge = useMediaQuery(
    `(min-width: ${DEFAULT_BREAKPOINTS.desktop}px)`,
  );

  // Current breakpoint
  const currentBreakpoint = isMobile
    ? "mobile"
    : isTablet
      ? "tablet"
      : isDesktop
        ? "desktop"
        : "large";

  // Layout state
  const [layout, setLayout] = useState<LayoutConfig>({
    sidebarOpen: false,
    widgetPanelOpen: false,
    artifactPanelOpen: false,
    bottomSheetOpen: false,
    floatingButtonVisible: false,
  });

  // Panel states
  const [panelStates, setPanelStates] = useState<PanelStates>({
    sidebar: {
      isOpen: false,
      width: 300,
      isCollapsible: true,
    },
    widgetPanel: {
      isOpen: false,
      width: 400,
      position: "right",
      isResizable: true,
    },
    artifactPanel: {
      isOpen: false,
      width: 400,
      isResizable: true,
    },
    bottomSheet: {
      isOpen: false,
      height: 400,
      isDraggable: true,
      isExpanded: false,
    },
  });

  // Toggle functions
  const toggleSidebar = useCallback(() => {
    setLayout((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: !prev.sidebar.isOpen },
    }));
  }, []);

  const toggleWidgetPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, widgetPanelOpen: !prev.widgetPanelOpen }));
    setPanelStates((prev) => ({
      ...prev,
      widgetPanel: { ...prev.widgetPanel, isOpen: !prev.widgetPanel.isOpen },
    }));
  }, []);

  const toggleArtifactPanel = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      artifactPanelOpen: !prev.artifactPanelOpen,
    }));
    setPanelStates((prev) => ({
      ...prev,
      artifactPanel: {
        ...prev.artifactPanel,
        isOpen: !prev.artifactPanel.isOpen,
      },
    }));
  }, []);

  const toggleBottomSheet = useCallback(() => {
    setLayout((prev) => ({ ...prev, bottomSheetOpen: !prev.bottomSheetOpen }));
    setPanelStates((prev) => ({
      ...prev,
      bottomSheet: { ...prev.bottomSheet, isOpen: !prev.bottomSheet.isOpen },
    }));
  }, []);

  // Open/Close functions
  const openSidebar = useCallback(() => {
    setLayout((prev) => ({ ...prev, sidebarOpen: true }));
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: true },
    }));
  }, []);

  const closeSidebar = useCallback(() => {
    setLayout((prev) => ({ ...prev, sidebarOpen: false }));
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: false },
    }));
  }, []);

  const openWidgetPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, widgetPanelOpen: true }));
    setPanelStates((prev) => ({
      ...prev,
      widgetPanel: { ...prev.widgetPanel, isOpen: true },
    }));
  }, []);

  const closeWidgetPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, widgetPanelOpen: false }));
    setPanelStates((prev) => ({
      ...prev,
      widgetPanel: { ...prev.widgetPanel, isOpen: false },
    }));
  }, []);

  const openArtifactPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, artifactPanelOpen: true }));
    setPanelStates((prev) => ({
      ...prev,
      artifactPanel: { ...prev.artifactPanel, isOpen: true },
    }));
  }, []);

  const closeArtifactPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, artifactPanelOpen: false }));
    setPanelStates((prev) => ({
      ...prev,
      artifactPanel: { ...prev.artifactPanel, isOpen: false },
    }));
  }, []);

  const openBottomSheet = useCallback(() => {
    setLayout((prev) => ({ ...prev, bottomSheetOpen: true }));
    setPanelStates((prev) => ({
      ...prev,
      bottomSheet: { ...prev.bottomSheet, isOpen: true },
    }));
  }, []);

  const closeBottomSheet = useCallback(() => {
    setLayout((prev) => ({ ...prev, bottomSheetOpen: false }));
    setPanelStates((prev) => ({
      ...prev,
      bottomSheet: { ...prev.bottomSheet, isOpen: false },
    }));
  }, []);

  // Panel sizing functions
  const setSidebarWidth = useCallback((width: number) => {
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, width: Math.max(200, Math.min(500, width)) },
    }));
  }, []);

  const setWidgetPanelWidth = useCallback((width: number) => {
    setPanelStates((prev) => ({
      ...prev,
      widgetPanel: {
        ...prev.widgetPanel,
        width: Math.max(300, Math.min(600, width)),
      },
    }));
  }, []);

  const setArtifactPanelWidth = useCallback((width: number) => {
    setPanelStates((prev) => ({
      ...prev,
      artifactPanel: {
        ...prev.artifactPanel,
        width: Math.max(300, Math.min(600, width)),
      },
    }));
  }, []);

  const setBottomSheetHeight = useCallback((height: number) => {
    setPanelStates((prev) => ({
      ...prev,
      bottomSheet: {
        ...prev.bottomSheet,
        height: Math.max(200, Math.min(600, height)),
      },
    }));
  }, []);

  // Floating button functions
  const showFloatingButton = useCallback(() => {
    setLayout((prev) => ({ ...prev, floatingButtonVisible: true }));
  }, []);

  const hideFloatingButton = useCallback(() => {
    setLayout((prev) => ({ ...prev, floatingButtonVisible: false }));
  }, []);

  // Layout presets
  const setMobileLayout = useCallback(() => {
    setLayout({
      sidebarOpen: false,
      widgetPanelOpen: false,
      artifactPanelOpen: false,
      bottomSheetOpen: false,
      floatingButtonVisible: true,
    });
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: false },
      widgetPanel: { ...prev.widgetPanel, isOpen: false },
      artifactPanel: { ...prev.artifactPanel, isOpen: false },
      bottomSheet: { ...prev.bottomSheet, isOpen: false },
    }));
  }, []);

  const setDesktopLayout = useCallback(() => {
    setLayout({
      sidebarOpen: true,
      widgetPanelOpen: false,
      artifactPanelOpen: false,
      bottomSheetOpen: false,
      floatingButtonVisible: false,
    });
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: true },
      widgetPanel: { ...prev.widgetPanel, isOpen: false },
      artifactPanel: { ...prev.artifactPanel, isOpen: false },
      bottomSheet: { ...prev.bottomSheet, isOpen: false },
    }));
  }, []);

  const setTabletLayout = useCallback(() => {
    setLayout({
      sidebarOpen: false,
      widgetPanelOpen: false,
      artifactPanelOpen: false,
      bottomSheetOpen: false,
      floatingButtonVisible: true,
    });
    setPanelStates((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: false },
      widgetPanel: { ...prev.widgetPanel, isOpen: false },
      artifactPanel: { ...prev.artifactPanel, isOpen: false },
      bottomSheet: { ...prev.bottomSheet, isOpen: false },
    }));
  }, []);

  // Utility functions
  const getAvailableSpace = useCallback(() => {
    const sidebarWidth = panelStates.sidebar.isOpen
      ? panelStates.sidebar.width
      : 0;
    const widgetPanelWidth = panelStates.widgetPanel.isOpen
      ? panelStates.widgetPanel.width
      : 0;
    const artifactPanelWidth = panelStates.artifactPanel.isOpen
      ? panelStates.artifactPanel.width
      : 0;

    // Assume viewport width of 100vw
    return Math.max(
      0,
      100 - sidebarWidth - widgetPanelWidth - artifactPanelWidth,
    );
  }, [panelStates]);

  const isPanelOverlapping = useCallback(() => {
    const availableSpace = getAvailableSpace();
    return availableSpace < 30; // Less than 30% available space
  }, [getAvailableSpace]);

  const optimizeLayout = useCallback(() => {
    if (isPanelOverlapping()) {
      // Close least important panel when overlapping
      if (panelStates.artifactPanel.isOpen) {
        closeArtifactPanel();
      } else if (panelStates.widgetPanel.isOpen) {
        closeWidgetPanel();
      } else if (panelStates.sidebar.isOpen) {
        closeSidebar();
      }
    }
  }, [
    isPanelOverlapping,
    panelStates,
    closeArtifactPanel,
    closeWidgetPanel,
    closeSidebar,
  ]);

  // Auto-adjust layout based on screen size (disabled to prevent infinite loops)
  // useEffect(() => {
  //   if (isMobile) {
  //     setMobileLayout();
  //   } else if (isTablet) {
  //     setTabletLayout();
  //   } else if (isDesktop || isLarge) {
  //     setDesktopLayout();
  //   }
  // }, [
  //   isMobile,
  //   isTablet,
  //   isDesktop,
  //   isLarge,
  //   setMobileLayout,
  //   setTabletLayout,
  //   setDesktopLayout,
  // ]);

  // Auto-optimize when panels overlap (disabled to prevent infinite loops)
  // useEffect(() => {
  //   if (isPanelOverlapping()) {
  //     optimizeLayout();
  //   }
  // }, [isPanelOverlapping, optimizeLayout]);

  const value: LayoutStateContextType = {
    layout,
    panelStates,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    currentBreakpoint,
    toggleSidebar,
    toggleWidgetPanel,
    toggleArtifactPanel,
    toggleBottomSheet,
    openSidebar,
    closeSidebar,
    openWidgetPanel,
    closeWidgetPanel,
    openArtifactPanel,
    closeArtifactPanel,
    openBottomSheet,
    closeBottomSheet,
    setSidebarWidth,
    setWidgetPanelWidth,
    setArtifactPanelWidth,
    setBottomSheetHeight,
    showFloatingButton,
    hideFloatingButton,
    setMobileLayout,
    setDesktopLayout,
    setTabletLayout,
    getAvailableSpace,
    isPanelOverlapping,
    optimizeLayout,
  };

  return (
    <LayoutStateContext.Provider value={value}>
      {children}
    </LayoutStateContext.Provider>
  );
}

export function useLayoutState() {
  const context = useContext(LayoutStateContext);
  if (context === undefined) {
    throw new Error("useLayoutState must be used within a LayoutStateProvider");
  }
  return context;
}

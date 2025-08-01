"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStreamContext } from "@/providers/Stream";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { ComponentType } from "@/components/widgets";
import { WidgetConfig } from "@/providers/WidgetStateContext";

// Enhanced stream state interface
export interface EnhancedStreamState {
  // Core stream state
  messages: any[];
  isLoading: boolean;
  error: any;
  interrupt: any;

  // Enhanced loading states
  isStreamLoading: boolean;
  isWidgetLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Widget coordination
  activeWidgets: Map<string, any>;
  widgetStates: Map<string, any>;

  // UI coordination
  uiState: {
    sidebarOpen: boolean;
    widgetPanelOpen: boolean;
    currentLayout: "mobile" | "desktop" | "tablet";
    lastActivity: number;
  };

  // Performance tracking
  performance: {
    messageCount: number;
    averageResponseTime: number;
    lastResponseTime: number;
  };
}

// Enhanced stream actions interface
export interface EnhancedStreamActions {
  // Core stream actions
  submit: (data: any, options?: any) => void;
  stop: () => void;

  // Widget coordination actions
  openWidgetFromStream: (config: WidgetConfig) => Promise<string>;
  closeWidgetFromStream: (widgetId: string) => void;
  updateWidgetFromStream: (widgetId: string, data: any) => void;

  // UI coordination actions
  updateUIState: (updates: Partial<EnhancedStreamState["uiState"]>) => void;
  resetUIState: () => void;

  // Performance actions
  trackResponseTime: (startTime: number) => void;
  resetPerformance: () => void;
}

// Hook options
export interface UseEnhancedStreamOptions {
  // Auto-widget management
  autoOpenWidgets?: boolean;
  autoCloseWidgets?: boolean;

  // Performance tracking
  enablePerformanceTracking?: boolean;

  // UI coordination
  enableUICoordination?: boolean;

  // Widget coordination
  enableWidgetCoordination?: boolean;
}

export function useEnhancedStream(
  options: UseEnhancedStreamOptions = {},
): EnhancedStreamState & EnhancedStreamActions {
  const {
    autoOpenWidgets = true,
    autoCloseWidgets = true,
    enablePerformanceTracking = true,
    enableUICoordination = true,
    enableWidgetCoordination = true,
  } = options;

  // Core stream context
  const stream = useStreamContext();

  // Widget state context
  const widgetState = useWidgetState();

  // Layout state context
  const layoutState = useLayoutState();

  // Performance tracking refs
  const performanceRef = useRef({
    messageCount: 0,
    responseTimes: [] as number[],
    lastResponseTime: 0,
  });

  // UI state ref
  const uiStateRef = useRef({
    sidebarOpen: false,
    widgetPanelOpen: false,
    currentLayout: "desktop" as "mobile" | "desktop" | "tablet",
    lastActivity: Date.now(),
  });

  // Widget coordination refs
  const widgetCoordinationRef = useRef({
    activeWidgets: new Map<string, any>(),
    widgetStates: new Map<string, any>(),
  });

  // Enhanced loading states
  const isStreamLoading = stream.isLoading;
  const isWidgetLoading = Array.from(widgetState.activeWidgets.values()).some(
    (widget) => widget.state?.isLoading || false,
  );

  const loadingStates = {
    stream: isStreamLoading,
    widgets: isWidgetLoading,
    ui: false, // Can be extended for UI-specific loading states
  };

  // Track response times
  const trackResponseTime = useCallback(
    (startTime: number) => {
      if (!enablePerformanceTracking) return;

      const responseTime = Date.now() - startTime;
      performanceRef.current.responseTimes.push(responseTime);
      performanceRef.current.lastResponseTime = responseTime;

      // Keep only last 10 response times for average calculation
      if (performanceRef.current.responseTimes.length > 10) {
        performanceRef.current.responseTimes.shift();
      }
    },
    [enablePerformanceTracking],
  );

  // Reset performance tracking
  const resetPerformance = useCallback(() => {
    performanceRef.current = {
      messageCount: 0,
      responseTimes: [],
      lastResponseTime: 0,
    };
  }, []);

  // Update UI state
  const updateUIState = useCallback(
    (updates: Partial<EnhancedStreamState["uiState"]>) => {
      if (!enableUICoordination) return;

      uiStateRef.current = {
        ...uiStateRef.current,
        ...updates,
        lastActivity: Date.now(),
      };
    },
    [enableUICoordination],
  );

  // Reset UI state
  const resetUIState = useCallback(() => {
    uiStateRef.current = {
      sidebarOpen: false,
      widgetPanelOpen: false,
      currentLayout: "desktop",
      lastActivity: Date.now(),
    };
  }, []);

  // Open widget from stream
  const openWidgetFromStream = useCallback(
    async (config: WidgetConfig): Promise<string> => {
      if (!enableWidgetCoordination) return "";

      // Add stream metadata
      const enhancedConfig: WidgetConfig = {
        ...config,
        metadata: {
          ...config.metadata,
          source: "stream",
          timestamp: Date.now(),
        },
      };

      const widgetId = await widgetState.openWidget(enhancedConfig);

      // Update coordination state
      widgetCoordinationRef.current.activeWidgets.set(widgetId, enhancedConfig);

      return widgetId;
    },
    [enableWidgetCoordination, widgetState],
  );

  // Close widget from stream
  const closeWidgetFromStream = useCallback(
    (widgetId: string) => {
      if (!enableWidgetCoordination) return;

      widgetState.closeWidget(widgetId);
      widgetCoordinationRef.current.activeWidgets.delete(widgetId);
      widgetCoordinationRef.current.widgetStates.delete(widgetId);
    },
    [enableWidgetCoordination, widgetState],
  );

  // Update widget from stream
  const updateWidgetFromStream = useCallback(
    (widgetId: string, data: any) => {
      if (!enableWidgetCoordination) return;

      widgetState.updateWidgetState(widgetId, data);
      widgetCoordinationRef.current.widgetStates.set(widgetId, data);
    },
    [enableWidgetCoordination, widgetState],
  );

  // Enhanced submit function
  const submit = useCallback(
    (data: any, options?: any) => {
      const startTime = Date.now();

      // Track performance
      if (enablePerformanceTracking) {
        performanceRef.current.messageCount++;
      }

      // Update UI state
      if (enableUICoordination) {
        updateUIState({
          lastActivity: Date.now(),
        });
      }

      // Call original submit
      stream.submit(data, options);

      // Track response time when loading starts
      if (stream.isLoading) {
        trackResponseTime(startTime);
      }
    },
    [
      stream,
      enablePerformanceTracking,
      enableUICoordination,
      updateUIState,
      trackResponseTime,
    ],
  );

  // Enhanced stop function
  const stop = useCallback(() => {
    stream.stop();

    // Update UI state
    if (enableUICoordination) {
      updateUIState({
        lastActivity: Date.now(),
      });
    }
  }, [stream, enableUICoordination, updateUIState]);

  // Auto-manage widgets based on stream state
  useEffect(() => {
    if (!enableWidgetCoordination) return;

    // Auto-close widgets when stream starts loading
    if (stream.isLoading && autoCloseWidgets) {
      const activeWidgets = widgetState.getActiveWidgets();
      activeWidgets.forEach((widget) => {
        if (widget.config.metadata?.autoCloseOnStream) {
          closeWidgetFromStream(widget.config.id);
        }
      });
    }

    // Auto-open widgets based on interrupt
    if (stream.interrupt && autoOpenWidgets) {
      const interruptData = stream.interrupt.value as any;
      if (interruptData?.widgetType) {
        const config: WidgetConfig = {
          id: `interrupt-${Date.now()}`,
          type: interruptData.widgetType as ComponentType,
          data: interruptData,
          displayMode: "inline",
          triggerSource: "interrupt",
          metadata: {
            source: "interrupt",
            timestamp: Date.now(),
            autoCloseOnStream: true,
          },
        };

        openWidgetFromStream(config);
      }
    }
  }, [
    stream.isLoading,
    stream.interrupt,
    enableWidgetCoordination,
    autoCloseWidgets,
    autoOpenWidgets,
    widgetState,
    closeWidgetFromStream,
    openWidgetFromStream,
  ]);

  // Initialize UI state once on mount (simplified to prevent infinite loops)
  useEffect(() => {
    if (!enableUICoordination) return;

    updateUIState({
      sidebarOpen: false,
      widgetPanelOpen: false,
      currentLayout: "desktop",
    });
  }, []); // Only run once on mount

  // Calculate performance metrics
  const performance = {
    messageCount: performanceRef.current.messageCount,
    averageResponseTime:
      performanceRef.current.responseTimes.length > 0
        ? performanceRef.current.responseTimes.reduce((a, b) => a + b, 0) /
          performanceRef.current.responseTimes.length
        : 0,
    lastResponseTime: performanceRef.current.lastResponseTime,
  };

  return {
    // Core stream state
    messages: stream.messages,
    isLoading: stream.isLoading,
    error: stream.error,
    interrupt: stream.interrupt,

    // Enhanced loading states
    isStreamLoading,
    isWidgetLoading,
    loadingStates,

    // Widget coordination
    activeWidgets: widgetCoordinationRef.current.activeWidgets,
    widgetStates: widgetCoordinationRef.current.widgetStates,

    // UI coordination
    uiState: uiStateRef.current,

    // Performance tracking
    performance,

    // Actions
    submit,
    stop,
    openWidgetFromStream,
    closeWidgetFromStream,
    updateWidgetFromStream,
    updateUIState,
    resetUIState,
    trackResponseTime,
    resetPerformance,
  };
}

// Utility hook for widget-specific stream coordination
export function useWidgetStreamCoordination(widgetId: string) {
  const {
    openWidgetFromStream,
    closeWidgetFromStream,
    updateWidgetFromStream,
  } = useEnhancedStream();

  return {
    openWidget: (config: WidgetConfig) => openWidgetFromStream(config),
    closeWidget: () => closeWidgetFromStream(widgetId),
    updateWidget: (data: any) => updateWidgetFromStream(widgetId, data),
  };
}

// Utility hook for UI-specific stream coordination
export function useUIStreamCoordination() {
  const { updateUIState, resetUIState, uiState } = useEnhancedStream();

  return {
    updateUI: updateUIState,
    resetUI: resetUIState,
    uiState,
  };
}

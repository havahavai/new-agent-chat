"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { ComponentType } from "@/components/widgets";

// Widget configuration interface
export interface WidgetConfig {
  id: string;
  type: ComponentType;
  data: any;
  displayMode?: "inline" | "bottom-sheet" | "side-panel" | "overlay";
  triggerSource?: "interrupt" | "manual" | "floating-button";
  metadata?: {
    threadId?: string;
    userId?: string;
    timestamp?: number;
    source?: "stream" | "interrupt" | "manual";
    autoCloseOnStream?: boolean;
  };
}

// Active widget state
export interface ActiveWidget {
  config: WidgetConfig;
  isOpen: boolean;
  isMinimized: boolean;
  lastActivity: number;
  state: any; // Widget-specific state
}

// Widget history entry
export interface WidgetHistoryEntry {
  id: string;
  type: ComponentType;
  title: string;
  timestamp: number;
  threadId: string;
  data: any;
}

// Display mode configuration
export interface DisplayModes {
  mobile: "bottom-sheet" | "fullscreen";
  desktop: "side-panel" | "overlay" | "inline";
}

// Widget state context interface
interface WidgetStateContextType {
  // Multi-widget support
  activeWidgets: Map<string, ActiveWidget>;
  widgetHistory: WidgetHistoryEntry[];

  // Display coordination
  displayModes: DisplayModes;
  currentDisplayMode: "mobile" | "desktop";

  // Widget lifecycle management
  openWidget: (config: WidgetConfig) => Promise<string>;
  closeWidget: (widgetId: string) => void;
  switchWidget: (fromId: string, toConfig: WidgetConfig) => void;
  minimizeWidget: (widgetId: string) => void;
  restoreWidget: (widgetId: string) => void;

  // Widget state management
  updateWidgetState: (widgetId: string, state: any) => void;
  getWidgetState: (widgetId: string) => any;

  // Thread-specific persistence
  saveWidgetState: (threadId: string) => void;
  loadWidgetState: (threadId: string) => void;

  // Utility functions
  getActiveWidgets: () => ActiveWidget[];
  getWidgetById: (widgetId: string) => ActiveWidget | undefined;
  clearAllWidgets: () => void;

  // Display mode management
  setDisplayMode: (mode: "mobile" | "desktop") => void;
  getPreferredDisplayMode: (
    widgetType: ComponentType,
  ) => "inline" | "bottom-sheet" | "side-panel" | "overlay";
}

const WidgetStateContext = createContext<WidgetStateContextType | undefined>(
  undefined,
);

export function WidgetStateProvider({ children }: { children: ReactNode }) {
  const [activeWidgets, setActiveWidgets] = useState<Map<string, ActiveWidget>>(
    new Map(),
  );
  const [widgetHistory, setWidgetHistory] = useState<WidgetHistoryEntry[]>([]);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<
    "mobile" | "desktop"
  >("desktop");

  // Default display modes
  const displayModes: DisplayModes = {
    mobile: "bottom-sheet",
    desktop: "side-panel",
  };

  // Open a new widget
  const openWidget = useCallback(
    async (config: WidgetConfig): Promise<string> => {
      const widgetId =
        config.id ||
        `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const activeWidget: ActiveWidget = {
        config: {
          ...config,
          id: widgetId,
          displayMode:
            config.displayMode || getPreferredDisplayMode(config.type),
          metadata: {
            ...config.metadata,
            timestamp: Date.now(),
          },
        },
        isOpen: true,
        isMinimized: false,
        lastActivity: Date.now(),
        state: {},
      };

      setActiveWidgets((prev) => {
        const newMap = new Map(prev);
        newMap.set(widgetId, activeWidget);
        return newMap;
      });

      // Add to history
      const historyEntry: WidgetHistoryEntry = {
        id: widgetId,
        type: config.type,
        title: getWidgetTitle(config.type),
        timestamp: Date.now(),
        threadId: config.metadata?.threadId || "unknown",
        data: config.data,
      };

      setWidgetHistory((prev) => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries

      return widgetId;
    },
    [],
  );

  // Close a widget
  const closeWidget = useCallback((widgetId: string) => {
    setActiveWidgets((prev) => {
      const newMap = new Map(prev);
      newMap.delete(widgetId);
      return newMap;
    });
  }, []);

  // Switch from one widget to another
  const switchWidget = useCallback(
    async (fromId: string, toConfig: WidgetConfig) => {
      closeWidget(fromId);
      return await openWidget(toConfig);
    },
    [closeWidget, openWidget],
  );

  // Minimize a widget
  const minimizeWidget = useCallback((widgetId: string) => {
    setActiveWidgets((prev) => {
      const newMap = new Map(prev);
      const widget = newMap.get(widgetId);
      if (widget) {
        newMap.set(widgetId, { ...widget, isMinimized: true });
      }
      return newMap;
    });
  }, []);

  // Restore a minimized widget
  const restoreWidget = useCallback((widgetId: string) => {
    setActiveWidgets((prev) => {
      const newMap = new Map(prev);
      const widget = newMap.get(widgetId);
      if (widget) {
        newMap.set(widgetId, { ...widget, isMinimized: false });
      }
      return newMap;
    });
  }, []);

  // Update widget state
  const updateWidgetState = useCallback((widgetId: string, state: any) => {
    setActiveWidgets((prev) => {
      const newMap = new Map(prev);
      const widget = newMap.get(widgetId);
      if (widget) {
        newMap.set(widgetId, {
          ...widget,
          state: { ...widget.state, ...state },
          lastActivity: Date.now(),
        });
      }
      return newMap;
    });
  }, []);

  // Get widget state
  const getWidgetState = useCallback(
    (widgetId: string) => {
      const widget = activeWidgets.get(widgetId);
      return widget?.state || {};
    },
    [activeWidgets],
  );

  // Save widget state for a thread
  const saveWidgetState = useCallback(
    (threadId: string) => {
      const threadWidgets = Array.from(activeWidgets.values()).filter(
        (widget) => widget.config.metadata?.threadId === threadId,
      );

      if (threadWidgets.length > 0) {
        const stateData = {
          threadId,
          widgets: threadWidgets,
          timestamp: Date.now(),
        };

        try {
          // Use enhanced state persistence
          const {
            statePersistence,
            PERSISTENCE_CONFIGS,
          } = require("@/utils/state-persistence");
          statePersistence.save(PERSISTENCE_CONFIGS.WIDGET_STATE, stateData);
        } catch (error) {
          console.warn("Failed to save widget state:", error);
        }
      }
    },
    [activeWidgets],
  );

  // Load widget state for a thread
  const loadWidgetState = useCallback((threadId: string) => {
    try {
      // Use enhanced state persistence
      const {
        statePersistence,
        PERSISTENCE_CONFIGS,
      } = require("@/utils/state-persistence");
      const stateData = statePersistence.load(PERSISTENCE_CONFIGS.WIDGET_STATE);

      if (stateData && stateData.threadId === threadId) {
        const savedWidgets = stateData.widgets || [];

        // Restore widgets that were open for this thread
        const restoredWidgets = new Map<string, ActiveWidget>();
        savedWidgets.forEach((widget: ActiveWidget) => {
          if (widget.config.metadata?.threadId === threadId) {
            restoredWidgets.set(widget.config.id, {
              ...widget,
              isOpen: false, // Start closed, user can reopen
              isMinimized: false,
            });
          }
        });

        setActiveWidgets((prev) => {
          const newMap = new Map(prev);
          restoredWidgets.forEach((widget, id) => {
            newMap.set(id, widget);
          });
          return newMap;
        });
      }
    } catch (error) {
      console.warn("Failed to load widget state:", error);
    }
  }, []);

  // Get all active widgets
  const getActiveWidgets = useCallback(() => {
    return Array.from(activeWidgets.values());
  }, [activeWidgets]);

  // Get widget by ID
  const getWidgetById = useCallback(
    (widgetId: string) => {
      return activeWidgets.get(widgetId);
    },
    [activeWidgets],
  );

  // Clear all widgets
  const clearAllWidgets = useCallback(() => {
    setActiveWidgets(new Map());
  }, []);

  // Set display mode
  const setDisplayMode = useCallback((mode: "mobile" | "desktop") => {
    setCurrentDisplayMode(mode);
  }, []);

  // Get preferred display mode for widget type
  const getPreferredDisplayMode = useCallback(
    (
      widgetType: ComponentType,
    ): "inline" | "bottom-sheet" | "side-panel" | "overlay" => {
      // Define preferred display modes for different widget types
      const preferredModes: Record<
        ComponentType,
        "inline" | "bottom-sheet" | "side-panel" | "overlay"
      > = {
        SearchCriteriaWidget: "inline",
        FlightOptionsWidget: "side-panel",
        FlightStatusWidget: "inline",
        LoungeWidget: "inline",
        weatherWidget: "inline",
        TravelerDetailsWidget: "side-panel",
        PaymentWidget: "bottom-sheet",
        NonAgentFlowWidget: "bottom-sheet",
      };

      return preferredModes[widgetType] || "inline";
    },
    [],
  );

  // Get widget title
  const getWidgetTitle = (widgetType: ComponentType): string => {
    const titles: Record<ComponentType, string> = {
      SearchCriteriaWidget: "Search Criteria",
      FlightOptionsWidget: "Flight Options",
      FlightStatusWidget: "Flight Status",
      LoungeWidget: "Lounge Access",
      weatherWidget: "Weather",
      TravelerDetailsWidget: "Traveler Details",
      PaymentWidget: "Payment",
      NonAgentFlowWidget: "Payment Flow",
    };

    return titles[widgetType] || "Widget";
  };

  // Clean up old widgets periodically
  useEffect(() => {
    const interval = setInterval(
      () => {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        setActiveWidgets((prev) => {
          const newMap = new Map(prev);
          let hasChanges = false;

          newMap.forEach((widget, id) => {
            if (now - widget.lastActivity > maxAge && !widget.isOpen) {
              newMap.delete(id);
              hasChanges = true;
            }
          });

          return hasChanges ? newMap : prev;
        });
      },
      5 * 60 * 1000,
    ); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value: WidgetStateContextType = {
    activeWidgets,
    widgetHistory,
    displayModes,
    currentDisplayMode,
    openWidget,
    closeWidget,
    switchWidget,
    minimizeWidget,
    restoreWidget,
    updateWidgetState,
    getWidgetState,
    saveWidgetState,
    loadWidgetState,
    getActiveWidgets,
    getWidgetById,
    clearAllWidgets,
    setDisplayMode,
    getPreferredDisplayMode,
  };

  return (
    <WidgetStateContext.Provider value={value}>
      {children}
    </WidgetStateContext.Provider>
  );
}

export function useWidgetState() {
  const context = useContext(WidgetStateContext);
  if (context === undefined) {
    throw new Error("useWidgetState must be used within a WidgetStateProvider");
  }
  return context;
}

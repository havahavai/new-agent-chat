import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  fetchPersonalizationData,
  getPersonalizationParams,
  validateQuickTabs,
  QuickTab,
  PersonalizationResult,
} from "@/services/personalizationService";
import { useLocationContext } from "@/providers/LocationContext";
import { getCurrentLanguage } from "@/utils/i18n";

interface PersonalizationContextType {
  quickTabs: QuickTab[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refreshPersonalization: () => Promise<void>;
  hasData: boolean;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(
  undefined
);

interface PersonalizationProviderProps {
  children: ReactNode;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({
  children,
}) => {
  const [quickTabs, setQuickTabs] = useState<QuickTab[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Refs to prevent multiple simultaneous API calls and track state
  const isInitializedRef = useRef(false);
  const currentRequestRef = useRef<Promise<void> | null>(null);
  const lastLanguageRef = useRef<string | null>(null);
  const lastLocationParamsRef = useRef<string | null>(null);
  const eventThrottleRef = useRef<{ [key: string]: number }>({});

  const { locationData } = useLocationContext();

  // Memoize location parameters with stable serialization
  const locationParams = useMemo(() => {
    if (!locationData?.latitude || !locationData?.longitude) {
      return null;
    }
    return {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };
  }, [locationData?.latitude, locationData?.longitude]);

  // Serialize location params for comparison
  const locationParamsKey = useMemo(() => {
    return locationParams ? `${locationParams.latitude},${locationParams.longitude}` : null;
  }, [locationParams]);

  // Throttle function to prevent rapid-fire events
  const throttleEvent = useCallback((eventType: string, delay: number = 1000): boolean => {
    const now = Date.now();
    const lastTime = eventThrottleRef.current[eventType] || 0;

    if (now - lastTime < delay) {
      console.log(`Throttling ${eventType} event (${now - lastTime}ms since last)`);
      return false;
    }

    eventThrottleRef.current[eventType] = now;
    return true;
  }, []);

  const fetchData = useCallback(async (force = false, reason = 'unknown') => {
    // Prevent multiple simultaneous calls
    if (currentRequestRef.current && !force) {
      console.log("Personalization API call already in progress, skipping...");
      return currentRequestRef.current;
    }

    // Create the API call promise
    const apiCall = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = getPersonalizationParams(locationParams || undefined);
        console.log(`Fetching personalization data (${reason}) with params:`, params);
        const result = await fetchPersonalizationData(params);

        if (result.success) {
          const validQuickTabs = validateQuickTabs(result.data.quickTabs);
          setQuickTabs(validQuickTabs);
          setLastFetched(new Date());
          console.log("Personalization data updated:", validQuickTabs);
        } else {
          const errorMessage = 'error' in result ? result.error : 'Unknown error';
          setError(errorMessage);
          console.error("Personalization API error:", errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Personalization fetch error:", err);
      } finally {
        setIsLoading(false);
        currentRequestRef.current = null;
      }
    };

    currentRequestRef.current = apiCall();
    return currentRequestRef.current;
  }, [locationParams, throttleEvent]);

  const refreshPersonalization = useCallback(async () => {
    await fetchData(true, 'manual-refresh'); // Force refresh
  }, [fetchData]);

  // Initial fetch on mount - only once
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log("PersonalizationProvider: Initial fetch on mount");
      fetchData(false, 'initial-mount');
    }
  }, []); // Empty dependency array - only run once on mount

  // Refetch when location data becomes available (with smart change detection)
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitializedRef.current) {
      return;
    }

    // Check if location parameters actually changed
    const currentLocationKey = locationParamsKey;
    if (currentLocationKey === lastLocationParamsRef.current) {
      return; // No change in location parameters
    }

    // Only refetch if we have location data and enough time has passed
    if (locationParams && lastFetched) {
      const timeSinceLastFetch = Date.now() - lastFetched.getTime();
      const REFETCH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastFetch > REFETCH_THRESHOLD) {
        console.log("Location data changed, refetching personalization...");
        lastLocationParamsRef.current = currentLocationKey;
        fetchData(false, 'location-change');
      }
    }
  }, [locationParamsKey, locationParams, lastFetched, fetchData]);

  // Listen for language changes and refetch if needed (with smart detection)
  useEffect(() => {
    const handleLanguageChange = (e?: StorageEvent) => {
      // Only handle language changes, not other storage events
      if (e && e.key !== "flyo:user:language") {
        return;
      }

      // Throttle language change events
      if (!throttleEvent('language-change', 500)) {
        return;
      }

      const currentLang = getCurrentLanguage();

      // Check if language actually changed
      if (currentLang === lastLanguageRef.current) {
        return;
      }

      console.log(`Language change detected: ${lastLanguageRef.current} → ${currentLang}`);
      lastLanguageRef.current = currentLang;

      // Only refetch if we've already initialized
      if (isInitializedRef.current) {
        fetchData(false, 'language-change');
      }
    };

    const handlePopState = () => {
      // Throttle popstate events to prevent excessive calls
      if (!throttleEvent('popstate', 1000)) {
        return;
      }

      // Only refetch if we've already initialized
      if (!isInitializedRef.current) {
        return;
      }

      const currentLang = getCurrentLanguage();

      // Only refetch if language actually changed during navigation
      if (currentLang !== lastLanguageRef.current) {
        console.log(`Navigation language change detected: ${lastLanguageRef.current} → ${currentLang}`);
        lastLanguageRef.current = currentLang;
        fetchData(false, 'navigation-language-change');
      }
    };

    // Initialize current language
    lastLanguageRef.current = getCurrentLanguage();

    // Listen for storage changes (language preference changes)
    window.addEventListener("storage", handleLanguageChange);

    // Listen for popstate events (navigation changes that might affect language)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("storage", handleLanguageChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [fetchData, throttleEvent]); // Keep fetchData dependency but it's now stable

  // Listen for page visibility changes to refetch when user returns to tab (with throttling)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only handle visibility changes if we've initialized and have previous data
      if (document.visibilityState !== "visible" || !isInitializedRef.current || !lastFetched) {
        return;
      }

      // Throttle visibility change events
      if (!throttleEvent('visibility-change', 2000)) {
        return;
      }

      const timeSinceLastFetch = Date.now() - lastFetched.getTime();
      const REFETCH_THRESHOLD = 10 * 60 * 1000; // 10 minutes

      if (timeSinceLastFetch > REFETCH_THRESHOLD) {
        console.log("Tab became visible, refetching personalization...");
        fetchData(false, 'visibility-change');
      }
    };

    const handleFocus = () => {
      // Only handle focus events if we've initialized
      if (!isInitializedRef.current) {
        return;
      }

      // Throttle focus events to prevent rapid-fire calls
      if (!throttleEvent('focus', 2000)) {
        return;
      }

      // Refetch on window focus (new tab/session scenarios)
      if (lastFetched) {
        const timeSinceLastFetch = Date.now() - lastFetched.getTime();
        const REFETCH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastFetch > REFETCH_THRESHOLD) {
          console.log("Window focused, refetching personalization...");
          fetchData(false, 'focus');
        }
      } else {
        // If no previous fetch but we're initialized, something went wrong - refetch
        console.log("Window focused with no previous data but initialized, fetching personalization...");
        fetchData(false, 'focus-recovery');
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [lastFetched, fetchData, throttleEvent]); // Keep dependencies but fetchData is now stable

  const value: PersonalizationContextType = {
    quickTabs,
    isLoading,
    error,
    lastFetched,
    refreshPersonalization,
    hasData: quickTabs.length > 0,
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalizationContext = (): PersonalizationContextType => {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error(
      "usePersonalizationContext must be used within a PersonalizationProvider"
    );
  }
  return context;
};

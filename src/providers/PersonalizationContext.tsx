import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  
  const { locationData } = useLocationContext();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = getPersonalizationParams(locationData || undefined);
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
    }
  }, [locationData]);

  const refreshPersonalization = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when location data changes (if user grants location permission later)
  useEffect(() => {
    if (locationData && lastFetched) {
      // Only refetch if we have location data and have fetched before
      // This prevents double fetching on initial load
      const timeSinceLastFetch = Date.now() - lastFetched.getTime();
      const REFETCH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      
      if (timeSinceLastFetch > REFETCH_THRESHOLD) {
        console.log("Location data available, refetching personalization...");
        fetchData();
      }
    }
  }, [locationData, lastFetched, fetchData]);

  // Listen for language changes and refetch if needed
  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = getCurrentLanguage();
      console.log("Language change detected, refetching personalization for:", currentLang);
      fetchData();
    };

    // Listen for storage changes (language preference changes)
    window.addEventListener("storage", (e) => {
      if (e.key === "flyo:user:language") {
        handleLanguageChange();
      }
    });

    // Listen for popstate events (navigation changes that might affect language)
    window.addEventListener("popstate", handleLanguageChange);

    return () => {
      window.removeEventListener("storage", handleLanguageChange);
      window.removeEventListener("popstate", handleLanguageChange);
    };
  }, [fetchData]);

  // Listen for page visibility changes to refetch when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && lastFetched) {
        const timeSinceLastFetch = Date.now() - lastFetched.getTime();
        const REFETCH_THRESHOLD = 10 * 60 * 1000; // 10 minutes

        if (timeSinceLastFetch > REFETCH_THRESHOLD) {
          console.log("Tab became visible, refetching personalization...");
          fetchData();
        }
      }
    };

    const handleFocus = () => {
      // Refetch on window focus (new tab/session scenarios)
      if (lastFetched) {
        const timeSinceLastFetch = Date.now() - lastFetched.getTime();
        const REFETCH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastFetch > REFETCH_THRESHOLD) {
          console.log("Window focused, refetching personalization...");
          fetchData();
        }
      } else {
        // If no previous fetch, fetch immediately
        console.log("Window focused with no previous data, fetching personalization...");
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [lastFetched, fetchData]);

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

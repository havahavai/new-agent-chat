"use client";

import { useCallback } from "react";

export const useNewRelic = () => {
  const noticeError = useCallback(
    (error: Error, customAttributes?: Record<string, any>) => {
      if (typeof window !== "undefined" && window.newrelic) {
        window.newrelic.noticeError(error, customAttributes);
      }
    },
    [],
  );

  const addToTrace = useCallback((attributes: Record<string, any>) => {
    if (typeof window !== "undefined" && window.newrelic) {
      window.newrelic.addToTrace(attributes);
    }
  }, []);

  const setCustomAttribute = useCallback(
    (name: string, value: string | number | boolean) => {
      if (typeof window !== "undefined" && window.newrelic) {
        window.newrelic.setCustomAttribute(name, value);
      }
    },
    [],
  );

  const setCustomAttributes = useCallback((attributes: Record<string, any>) => {
    if (typeof window !== "undefined" && window.newrelic) {
      window.newrelic.setCustomAttributes(attributes);
    }
  }, []);

  const addPageAction = useCallback(
    (name: string, attributes?: Record<string, any>) => {
      if (typeof window !== "undefined" && window.newrelic) {
        window.newrelic.addPageAction(name, attributes);
      }
    },
    [],
  );

  const setPageViewName = useCallback((name: string) => {
    if (typeof window !== "undefined" && window.newrelic) {
      window.newrelic.setPageViewName(name);
    }
  }, []);

  const setCurrentRouteName = useCallback((name: string) => {
    if (typeof window !== "undefined" && window.newrelic) {
      window.newrelic.setCurrentRouteName(name);
    }
  }, []);

  const startInteraction = useCallback(() => {
    if (typeof window !== "undefined" && window.newrelic) {
      return window.newrelic.interaction();
    }
    return null;
  }, []);

  const trackEvent = useCallback(
    (eventName: string, attributes?: Record<string, any>) => {
      if (typeof window !== "undefined" && window.newrelic) {
        window.newrelic.addPageAction(eventName, attributes);
      }
    },
    [],
  );

  const trackUserAction = useCallback(
    (action: string, details?: Record<string, any>) => {
      if (typeof window !== "undefined" && window.newrelic) {
        window.newrelic.addPageAction(`user_action_${action}`, {
          timestamp: new Date().toISOString(),
          ...details,
        });
      }
    },
    [],
  );

  return {
    noticeError,
    addToTrace,
    setCustomAttribute,
    setCustomAttributes,
    addPageAction,
    setPageViewName,
    setCurrentRouteName,
    startInteraction,
    trackEvent,
    trackUserAction,
    isAvailable: typeof window !== "undefined" && !!window.newrelic,
  };
};

// TypeScript declarations for New Relic Browser Agent
declare global {
  interface Window {
    newrelic?: {
      noticeError: (
        error: Error,
        customAttributes?: Record<string, any>,
      ) => void;
      addToTrace: (attributes: Record<string, any>) => void;
      setCustomAttribute: (
        name: string,
        value: string | number | boolean,
      ) => void;
      setCustomAttributes: (attributes: Record<string, any>) => void;
      addPageAction: (name: string, attributes?: Record<string, any>) => void;
      setPageViewName: (name: string) => void;
      setCurrentRouteName: (name: string) => void;
      interaction: () => {
        end: () => void;
        setAttribute: (name: string, value: string | number | boolean) => void;
        setAttributes: (attributes: Record<string, any>) => void;
      };
      getBrowserTimingHeader: (options?: {
        hasToRemoveScriptWrapper?: boolean;
      }) => string;
    };
  }
}

export {};

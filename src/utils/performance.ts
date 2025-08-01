/**
 * Performance Optimization System
 * Provides code splitting, lazy loading, memoization, and performance monitoring
 */

import { ComponentType, lazy, Suspense, ReactNode } from "react";

// Performance monitoring
export interface PerformanceMetrics {
  componentRenderTime: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Monitor memory usage
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.updateMetrics("memory", {
          componentRenderTime: 0,
          memoryUsage: memory.usedJSHeapSize,
          bundleSize: memory.totalJSHeapSize,
          loadTime: 0,
        });
      }, 5000);
    }

    // Monitor bundle size
    this.measureBundleSize();
  }

  private measureBundleSize(): void {
    if (typeof window !== "undefined") {
      const scripts = document.querySelectorAll("script[src]");
      let totalSize = 0;

      scripts.forEach((script) => {
        const src = script.getAttribute("src");
        if (src && src.includes("chunk")) {
          // Estimate size based on script loading time
          const start = performance.now();
          fetch(src, { method: "HEAD" }).then(() => {
            const end = performance.now();
            totalSize += (end - start) * 1000; // Rough estimate
          });
        }
      });

      this.updateMetrics("bundle", {
        componentRenderTime: 0,
        memoryUsage: 0,
        bundleSize: totalSize,
        loadTime: 0,
      });
    }
  }

  startTimer(componentName: string): () => void {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const renderTime = end - start;

      this.updateMetrics(componentName, {
        componentRenderTime: renderTime,
        memoryUsage: 0,
        bundleSize: 0,
        loadTime: 0,
      });
    };
  }

  private updateMetrics(
    key: string,
    metrics: Partial<PerformanceMetrics>,
  ): void {
    const existing = this.metrics.get(key) || {
      componentRenderTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      loadTime: 0,
    };

    const updated = { ...existing, ...metrics };
    this.metrics.set(key, updated);

    // Notify observers
    this.observers.forEach((observer) => observer(updated));
  }

  getMetrics(
    componentName?: string,
  ): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (componentName) {
      return (
        this.metrics.get(componentName) || {
          componentRenderTime: 0,
          memoryUsage: 0,
          bundleSize: 0,
          loadTime: 0,
        }
      );
    }
    return this.metrics;
  }

  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  getAverageRenderTime(): number {
    const times = Array.from(this.metrics.values()).map(
      (m) => m.componentRenderTime,
    );
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  getTotalMemoryUsage(): number {
    return Array.from(this.metrics.values()).reduce(
      (total, m) => total + m.memoryUsage,
      0,
    );
  }
}

// Code splitting utilities
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
) => {
  return lazy(importFn);
};

// Widget lazy loading
export const lazyWidgets = {
  flightOptions: lazy(
    () => import("@/components/widgets/flightOptions.widget"),
  ),
  flightStatus: lazy(() => import("@/components/widgets/flightStatus.wdiget")),
  payment: lazy(() => import("@/components/widgets/payment.widget")),
  weather: lazy(() => import("@/components/widgets/weather.widget")),
  lounge: lazy(() => import("@/components/widgets/lounge.widget")),
  searchCriteria: lazy(
    () => import("@/components/widgets/searchCriteria.widget"),
  ),
  review: lazy(() => import("@/components/widgets/review.widget")),
  nonAgentFlow: lazy(
    () => import("@/components/widgets/non-agent-flow.widget"),
  ),
};

// Memoization utilities
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const memoizeAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
): T => {
  const cache = new Map<string, Promise<any>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Virtual scrolling utilities
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  config: VirtualScrollConfig,
) => {
  const { itemHeight, containerHeight, overscan = 5 } = config;
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  return {
    totalHeight,
    visibleCount,
    getVisibleRange: (scrollTop: number) => {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + visibleCount + overscan, items.length);
      const startWithOverscan = Math.max(0, start - overscan);

      return {
        start: startWithOverscan,
        end,
        items: items.slice(startWithOverscan, end),
        offsetY: startWithOverscan * itemHeight,
      };
    },
  };
};

// Image optimization
export const optimizeImage = (
  src: string,
  width: number,
  quality: number = 80,
): string => {
  // In a real implementation, this would use a CDN or image optimization service
  // For now, we'll return the original src
  return src;
};

// Bundle analysis
export const analyzeBundle = () => {
  if (typeof window === "undefined") return null;

  const resources = performance.getEntriesByType("resource");
  const scripts = resources.filter((r) => r.name.includes(".js"));
  const styles = resources.filter((r) => r.name.includes(".css"));

  return {
    scripts: scripts.map((s) => ({
      name: s.name,
      size: (s as any).transferSize || 0,
      duration: s.duration,
    })),
    styles: styles.map((s) => ({
      name: s.name,
      size: (s as any).transferSize || 0,
      duration: s.duration,
    })),
    totalSize: resources.reduce(
      (total, r) => total + ((r as any).transferSize || 0),
      0,
    ),
  };
};

// Performance optimization hooks
export const usePerformanceOptimization = () => {
  const monitor = PerformanceMonitor.getInstance();

  return {
    startTimer: monitor.startTimer.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    subscribe: monitor.subscribe.bind(monitor),
    analyzeBundle,
  };
};

// Preloading utilities
export const preloadComponent = (importFn: () => Promise<any>) => {
  // Start loading the component in the background
  importFn();
};

export const preloadWidget = (widgetName: string) => {
  const widget = lazyWidgets[widgetName as keyof typeof lazyWidgets];
  if (widget) {
    // Trigger the import
    widget({} as any);
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
) => {
  if (typeof window === "undefined") return null;

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
};

// Resource hints
export const addResourceHints = () => {
  if (typeof window === "undefined") return;

  // Preconnect to external domains
  const domains = ["api.example.com", "cdn.example.com"];

  domains.forEach((domain) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = `https://${domain}`;
    document.head.appendChild(link);
  });
};

// Performance budget monitoring
export interface PerformanceBudget {
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxBundleSize: number;
}

export const checkPerformanceBudget = (
  metrics: PerformanceMetrics,
  budget: PerformanceBudget,
): { passed: boolean; violations: string[] } => {
  const violations: string[] = [];

  if (metrics.componentRenderTime > budget.maxRenderTime) {
    violations.push(
      `Render time ${metrics.componentRenderTime}ms exceeds budget ${budget.maxRenderTime}ms`,
    );
  }

  if (metrics.memoryUsage > budget.maxMemoryUsage) {
    violations.push(
      `Memory usage ${metrics.memoryUsage} bytes exceeds budget ${budget.maxMemoryUsage} bytes`,
    );
  }

  if (metrics.bundleSize > budget.maxBundleSize) {
    violations.push(
      `Bundle size ${metrics.bundleSize} bytes exceeds budget ${budget.maxBundleSize} bytes`,
    );
  }

  return {
    passed: violations.length === 0,
    violations,
  };
};

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Default performance budget
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxRenderTime: 16, // 60fps target
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  maxBundleSize: 500 * 1024, // 500KB
};

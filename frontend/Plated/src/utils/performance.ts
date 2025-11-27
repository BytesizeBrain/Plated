/**
 * Performance Monitoring Utilities
 * 
 * Tools for monitoring and measuring frontend performance:
 * - Core Web Vitals tracking
 * - Custom performance metrics
 * - Error tracking
 * - User experience metrics
 */

// Core Web Vitals types

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeWebVitals();
    this.initializeCustomMetrics();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry: PerformanceEntry) => {
      this.recordMetric('LCP', entry.startTime);
    });

    // Monitor First Input Delay (FID)
    this.observeMetric('first-input', (entry: PerformanceEntry) => {
      if (entry.processingStart) {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      }
    });

    // Monitor Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeMetric('layout-shift', (entry: PerformanceEntry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        this.recordMetric('CLS', clsValue);
      }
    });
  }

  /**
   * Initialize custom performance metrics
   */
  private initializeCustomMetrics() {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordMetric('PageLoad', loadTime);
    });

    // Monitor DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      const domContentLoaded = performance.now();
      this.recordMetric('DOMContentLoaded', domContentLoaded);
    });

    // Monitor time to first byte (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.downlink) {
        this.recordMetric('ConnectionSpeed', connection.downlink);
      }
    }
  }

  /**
   * Observe a specific performance metric
   */
  private observeMetric(type: string, callback: (entry: PerformanceEntry) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry as PerformanceEntry);
        }
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`Performance Metric: ${name} = ${value.toFixed(2)}`);
    }

    // Send to analytics service in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(name, value);
    }
  }

  /**
   * Get average value for a metric
   */
  getAverageMetric(name: string): number | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((values, name) => {
      result[name] = [...values];
    });
    return result;
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(`Function_${name}`, end - start);
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(`AsyncFunction_${name}`, end - start);
    return result;
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    this.recordMetric(`Render_${componentName}`, end - start);
  }

  /**
   * Track user interactions
   */
  trackInteraction(type: string, element: string, duration?: number) {
    const interaction = {
      type,
      element,
      duration: duration || 0,
      timestamp: Date.now(),
    };
    
    this.recordMetric(`Interaction_${type}`, duration || 0);
    
    if (import.meta.env.DEV) {
      console.log('User Interaction:', interaction);
    }
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: string) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    this.recordMetric('ErrorCount', 1);
    
    if (import.meta.env.DEV) {
      console.error('Tracked Error:', errorInfo);
    }
    
    if (import.meta.env.PROD) {
      this.sendErrorToAnalytics(errorInfo);
    }
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(name: string, value: number) {
    // Implement your analytics service integration here
    // Examples: Google Analytics, Mixpanel, Custom API
    
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
      });
    }
    
    // Custom API endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: name,
        value,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    }).catch(error => {
      console.warn('Failed to send performance metric:', error);
    });
  }

  /**
   * Send errors to analytics service
   */
  private sendErrorToAnalytics(errorInfo: any) {
    fetch('/api/analytics/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorInfo),
    }).catch(error => {
      console.warn('Failed to send error to analytics:', error);
    });
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    webVitals: Record<string, number>;
    customMetrics: Record<string, number>;
    recommendations: string[];
  } {
    const webVitals: Record<string, number> = {};
    const customMetrics: Record<string, number> = {};
    const recommendations: string[] = [];

    // Core Web Vitals
    const lcp = this.getAverageMetric('LCP');
    const fid = this.getAverageMetric('FID');
    const cls = this.getAverageMetric('CLS');

    if (lcp !== null) {
      webVitals.LCP = lcp;
      if (lcp > 2500) {
        recommendations.push('LCP is too high. Consider optimizing images and reducing server response time.');
      }
    }

    if (fid !== null) {
      webVitals.FID = fid;
      if (fid > 100) {
        recommendations.push('FID is too high. Consider reducing JavaScript execution time.');
      }
    }

    if (cls !== null) {
      webVitals.CLS = cls;
      if (cls > 0.1) {
        recommendations.push('CLS is too high. Consider adding size attributes to images and avoiding dynamic content insertion.');
      }
    }

    // Custom metrics
    const pageLoad = this.getAverageMetric('PageLoad');
    if (pageLoad !== null) {
      customMetrics.PageLoad = pageLoad;
      if (pageLoad > 3000) {
        recommendations.push('Page load time is too high. Consider code splitting and lazy loading.');
      }
    }

    return {
      webVitals,
      customMetrics,
      recommendations,
    };
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    trackInteraction: performanceMonitor.trackInteraction.bind(performanceMonitor),
    trackError: performanceMonitor.trackError.bind(performanceMonitor),
    getReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
}

// Global error tracking
window.addEventListener('error', (event) => {
  performanceMonitor.trackError(event.error, 'Global Error Handler');
});

window.addEventListener('unhandledrejection', (event) => {
  performanceMonitor.trackError(
    new Error(event.reason),
    'Unhandled Promise Rejection'
  );
});

export default performanceMonitor;

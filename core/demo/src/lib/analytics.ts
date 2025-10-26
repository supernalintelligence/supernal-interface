/**
 * Analytics utilities for tracking user interactions
 * Integrates with Google Tag Manager for comprehensive tracking
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Track custom events through GTM
 */
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'supernal_interface',
      event_label: parameters.label || '',
      value: parameters.value || 0,
      ...parameters
    });
  }
};

/**
 * Track tool executions
 */
export const trackToolExecution = (toolName: string, method: 'ai' | 'direct', success: boolean) => {
  trackEvent('tool_execution', {
    tool_name: toolName,
    execution_method: method,
    success: success,
    event_category: 'tool_usage'
  });
};

/**
 * Track page navigation within the SPA
 */
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    event_category: 'navigation'
  });
};

/**
 * Track demo interactions
 */
export const trackDemoInteraction = (action: string, details?: Record<string, any>) => {
  trackEvent('demo_interaction', {
    action: action,
    event_category: 'demo',
    ...details
  });
};

/**
 * Track documentation usage
 */
export const trackDocumentationUsage = (section: string, action: 'view' | 'copy' | 'expand') => {
  trackEvent('documentation_usage', {
    section: section,
    action: action,
    event_category: 'documentation'
  });
};

/**
 * Track code copying
 */
export const trackCodeCopy = (codeType: string, language?: string) => {
  trackEvent('code_copy', {
    code_type: codeType,
    language: language || 'unknown',
    event_category: 'developer_tools'
  });
};

/**
 * Track test executions
 */
export const trackTestExecution = (testType: 'quick' | 'comprehensive', results: { passed: number; failed: number }) => {
  trackEvent('test_execution', {
    test_type: testType,
    tests_passed: results.passed,
    tests_failed: results.failed,
    success_rate: results.passed / (results.passed + results.failed),
    event_category: 'testing'
  });
};

/**
 * Initialize analytics tracking
 */
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GTM_CONTAINER_ID) {
    // Track initial page load
    trackPageView('home');
    
    // Track user engagement
    let engagementStartTime = Date.now();
    
    // Track time on site when user leaves
    window.addEventListener('beforeunload', () => {
      const timeOnSite = Math.round((Date.now() - engagementStartTime) / 1000);
      trackEvent('user_engagement', {
        engagement_time_msec: timeOnSite * 1000,
        event_category: 'engagement'
      });
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          trackEvent('scroll_depth', {
            scroll_depth: maxScrollDepth,
            event_category: 'engagement'
          });
        }
      }
    });
  }
};

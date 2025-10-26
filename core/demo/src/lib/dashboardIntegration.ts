/**
 * Dashboard Integration Utilities
 * Handles dynamic dashboard port detection and fallback strategies
 */

export interface DashboardConfig {
  port?: number;
  host?: string;
  enabled?: boolean;
  fallbackUrl?: string;
}

/**
 * Get dashboard configuration from environment and runtime detection
 */
export const getDashboardConfig = (): DashboardConfig => {
  const config: DashboardConfig = {
    port: parseInt(process.env.NEXT_PUBLIC_DASHBOARD_PORT || '3001'),
    host: process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'localhost',
    enabled: process.env.NEXT_PUBLIC_DASHBOARD_ENABLED !== 'false',
    fallbackUrl: process.env.NEXT_PUBLIC_DASHBOARD_FALLBACK_URL
  };

  return config;
};

/**
 * Generate dashboard URL based on current environment
 */
export const getDashboardUrl = (): string => {
  const config = getDashboardConfig();
  
  if (typeof window === 'undefined') {
    return `http://${config.host}:${config.port}`;
  }

  // In production, try to use the same protocol and host
  if (process.env.NODE_ENV === 'production' && config.fallbackUrl) {
    return config.fallbackUrl;
  }

  // For development, use the configured port
  return `${window.location.protocol}//${window.location.hostname}:${config.port}`;
};

/**
 * Check if dashboard is available
 */
export const checkDashboardAvailability = async (): Promise<boolean> => {
  try {
    const url = getDashboardUrl();
    const response = await fetch(`${url}/health`, { 
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.warn('Dashboard health check failed:', error);
    return false;
  }
};

/**
 * Get alternative dashboard deployment options
 */
export const getDashboardAlternatives = () => {
  return {
    local: {
      title: 'Local Development',
      command: 'sc dashboard serve',
      description: 'Run the dashboard locally for development'
    },
    vercel: {
      title: 'Vercel Deployment',
      command: 'sc dashboard deploy --vercel',
      description: 'Deploy dashboard to Vercel for production'
    },
    githubPages: {
      title: 'GitHub Pages',
      command: 'sc dashboard deploy --github-pages',
      description: 'Deploy dashboard to GitHub Pages'
    }
  };
};

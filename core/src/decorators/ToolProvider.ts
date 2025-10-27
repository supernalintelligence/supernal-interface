/**
 * ToolProvider Decorator
 *
 * Class-level decorator for configuring AI tool providers.
 * Provides default settings for all tools in a class.
 */

export interface ToolProviderConfig {
  category?: string; // Default category for all tools
  aiEnabled?: boolean; // Default AI enablement
  dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'destructive';
  requiresApproval?: boolean; // Default approval requirement
  executionContext?: 'ui' | 'api' | 'both';
  tags?: string[]; // Additional tags for all tools
  permissions?: {
    level?: string;
    sensitiveDataAccess?: boolean;
    networkAccess?: boolean;
    requiredScopes?: string[];
  };
}

/**
 * ToolProvider decorator - configures a class as an AI tool provider
 *
 * @param config Provider configuration that applies to all @Tool methods
 */
export function ToolProvider(config: ToolProviderConfig = {}) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Store provider config on the class
    (constructor as any).__toolProvider__ = {
      name: constructor.name,
      config,
      registeredAt: new Date().toISOString(),
    };

    console.log(`🏭 Registered Tool Provider: ${constructor.name}`);

    return constructor;
  };
}

/**
 * Get tool provider configuration for a class
 */
export function getToolProviderConfig(target: any): ToolProviderConfig | undefined {
  return target.constructor?.__toolProvider__?.config;
}

/**
 * Check if a class is a tool provider
 */
export function isToolProvider(target: any): boolean {
  return !!target.constructor?.__toolProvider__;
}

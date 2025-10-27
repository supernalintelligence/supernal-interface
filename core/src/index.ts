/**
 * Supernal Interface - Core Package
 *
 * Universal system for making any application AI-controllable and auto-testable.
 * Extends supernal-command's proven architecture with AI safety controls.
 */

// Core decorators
export { Tool, ToolConfig, ToolMetadata } from './decorators/Tool';
// Deprecated: Use ToolRegistry.getAllTools() and ToolRegistry.getTool() instead
export { getStandaloneTools, getStandaloneTool } from './decorators/Tool';
export {
  ToolProvider,
  ToolProviderConfig,
  getToolProviderConfig,
  isToolProvider,
} from './decorators/ToolProvider';

// Registry system
export { ToolRegistry } from './registry/ToolRegistry';

// Test generation
export { TestGenerator, TestGenerationOptions } from './generators/TestGenerator';
export { UniversalGenerator } from './generators/UniversalGenerator';

// Execution engines (separate - not bundled)
export { PlaywrightExecutor } from './execution/PlaywrightExecutor'; // For testing
export { DOMExecutor } from './execution/DOMExecutor'; // For AI control

// AI interface
export {
  UniversalChatInterface,
  ChatQuery,
  ChatResponse,
} from './integration/UniversalChatInterface';

// CLI tools
export { SupernalInterfaceInit, InitOptions } from './cli/init';
export { program as CLI } from './cli/generate';

// Configuration system
export {
  UniversalInterfaceConfig,
  DEFAULT_CONFIG,
  FRAMEWORK_PRESETS,
  createConfig,
  getFrameworkPreset,
  validateConfig,
  ConfigBuilder,
  configBuilder,
} from './config/UniversalInterfaceConfig';

// Discovery system (from testing-tools)
export { ComponentDiscovery } from './discovery/ComponentDiscovery';
export { ComponentScanner } from './discovery/ComponentScanner';
export { InferenceEngine } from './discovery/InferenceEngine';
export {
  GenericComponentDiscovery,
  ComponentDiscoveryFactory,
} from './discovery/GenericComponentDiscovery';

// Story generation (from testing-tools)
export { StoryGenerator } from './story/StoryGenerator';

// Re-export types (copied from supernal-command for compatibility)
export {
  ToolCategory,
  ToolFrequency,
  ToolComplexity,
  ToolPermissionTier,
  ToolAccessLevel,
} from './types';

// Tool types (copied from supernal-command)
export * from './types';

// Version info
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@supernal-interface/core';

/**
 * Package metadata
 */
export const PACKAGE_INFO = {
  name: PACKAGE_NAME,
  version: VERSION,
  description: 'Universal AI Interface - Make any application AI-controllable and auto-testable',
  extends: '@supernal-command/core',
  features: [
    'AI-safe tool decorators',
    'Automatic test generation',
    'Natural language interface',
    'Universal execution contexts',
    'Safety-first AI controls',
    'Playwright integration',
    'CLI initialization tools',
    'Approval workflows',
  ],
};

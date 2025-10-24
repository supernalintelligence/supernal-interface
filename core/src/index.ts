/**
 * Supernal AI Interface - Core Package
 * 
 * Universal system for making any application AI-controllable and auto-testable.
 * Extends supernal-command's proven architecture with AI safety controls.
 */

// Core decorators
export { Tool, ToolConfig, ToolMetadata } from './decorators/Tool';

// Re-export types (copied from supernal-command for compatibility)
export {
  ToolCategory,
  ToolFrequency,
  ToolComplexity,
  ToolPermissionTier,
  ToolAccessLevel
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
    'Safety-first AI controls'
  ]
};

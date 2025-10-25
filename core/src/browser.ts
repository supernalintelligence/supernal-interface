/**
 * Browser-only exports for @supernal-interface/core
 * 
 * This excludes CLI tools and Node.js-specific functionality
 * that can't be bundled for the browser.
 */

// Core decorators and registry
export { Tool, ToolConfig, ToolMetadata } from './decorators/Tool';
export { ToolProvider, ToolProviderConfig } from './decorators/ToolProvider';
export { ToolRegistry } from './registry/ToolRegistry';

// Types (browser-safe)
export * from './types';

// Execution (browser-safe)
export { DOMExecutor } from './execution/DOMExecutor';

// Note: CLI tools, generators, and Node.js-specific functionality 
// are excluded from browser builds

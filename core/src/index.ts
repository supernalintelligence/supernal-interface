/**
 * @supernal-interface/core - Tool System
 * 
 * Core tool system with decorators, registry, and execution engines.
 */

// Core decorators and registry
export { Tool, ToolConfig, ToolMetadata } from './decorators/Tool';
export { ToolRegistry } from './registry/ToolRegistry';

// Execution engines
export { DOMExecutor } from './execution/DOMExecutor';

// Types
export * from './types';

// Browser-specific exports
export { ToolRegistry as BrowserToolRegistry } from './browser';

// Re-export commonly used types for convenience
export type {
  UniversalExecutionContext,
  UniversalToolResult
} from './registry/ToolRegistry';
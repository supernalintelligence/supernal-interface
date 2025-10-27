/**
 * @supernal-interface/core - Tool System
 * 
 * Core tool system with decorators, registry, and execution engines.
 */

// Core decorators and registry
export { Tool, ToolConfig, ToolMetadata } from './decorators/Tool';
export { getStandaloneTools, getStandaloneTool } from './decorators/Tool';
export {
  ToolProvider,
  ToolProviderConfig,
  getToolProviderConfig,
  isToolProvider,
} from './decorators/ToolProvider';
export { ToolRegistry } from './registry/ToolRegistry';

// Test generation
export { TestGenerator, TestGenerationOptions } from './generators/TestGenerator';

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

// Version info - read from package.json as single source of truth
import { readFileSync } from 'fs';
import { join } from 'path';

const getPackageInfo = () => {
  try {
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return { version: packageJson.version, name: packageJson.name };
  } catch {
    // Fallback for when package.json is not accessible (e.g., in bundled environments)
    return { version: '1.0.1', name: '@supernal-interface/core' };
  }
};

const { version, name } = getPackageInfo();
export const VERSION = version;
export const PACKAGE_NAME = name;
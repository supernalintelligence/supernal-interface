/**
 * Tool Registry - Simple registry for tool discovery and metadata
 * 
 * This registry ONLY handles:
 * - Tool registration
 * - Tool discovery
 * - Metadata management
 * 
 * Execution is handled separately by:
 * - PlaywrightExecutor (for testing)
 * - DOMExecutor (for AI control)
 */

import { ToolMetadata } from '../decorators/Tool';

// Use a global registry to avoid Jest module isolation issues
const globalRegistry = global as any;
if (!globalRegistry.__SUPERNAL_TOOL_REGISTRY__) {
  globalRegistry.__SUPERNAL_TOOL_REGISTRY__ = new Map<string, ToolMetadata>();
}

export class ToolRegistry {
  private static get tools(): Map<string, ToolMetadata> {
    return globalRegistry.__SUPERNAL_TOOL_REGISTRY__;
  }

  /**
   * Register a tool
   */
  static registerTool(providerName: string, methodName: string, metadata: ToolMetadata): void {
    const toolId = `${providerName}.${methodName}`;
    this.tools.set(toolId, metadata);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`🔧 Registered Tool: ${metadata.name} (${metadata.toolType}, AI: ${metadata.aiEnabled})`);
    }
  }

  /**
   * Get a specific tool by identifier
   */
  static getTool(toolIdentifier: string): ToolMetadata | undefined {
    return this.tools.get(toolIdentifier);
  }

  /**
   * Get all registered tools
   */
  static getAllTools(): Map<string, ToolMetadata> {
    return new Map(this.tools);
  }

  /**
   * Get AI-enabled tools only
   */
  static getAIEnabledTools(): ToolMetadata[] {
    return Array.from(this.tools.values()).filter(tool => tool.aiEnabled);
  }

  /**
   * Get test-only tools
   */
  static getTestOnlyTools(): ToolMetadata[] {
    return Array.from(this.tools.values()).filter(tool => !tool.aiEnabled);
  }

  /**
   * Get tools by category
   */
  static getToolsByCategory(category: string): ToolMetadata[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  /**
   * Search tools by query
   */
  static searchTools(query: string): ToolMetadata[] {
    const queryLower = query.toLowerCase();
    
    return Array.from(this.tools.values()).filter(tool => {
      const searchFields = [
        tool.name.toLowerCase(),
        tool.description.toLowerCase(),
        tool.category.toLowerCase(),
        ...(tool.examples || []).map(ex => ex.toLowerCase()),
        ...(tool.keywords || []).map(kw => kw.toLowerCase())
      ];
      
      return searchFields.some(field => 
        field.includes(queryLower) || queryLower.includes(field)
      );
    });
  }

  /**
   * Get registry statistics
   */
  static getStats(): {
    total: number;
    aiEnabled: number;
    testOnly: number;
    byCategory: Record<string, number>;
    byDangerLevel: Record<string, number>;
  } {
    const tools = Array.from(this.tools.values());
    
    const byCategory = tools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDangerLevel = tools.reduce((acc, tool) => {
      acc[tool.dangerLevel] = (acc[tool.dangerLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: tools.length,
      aiEnabled: tools.filter(t => t.aiEnabled).length,
      testOnly: tools.filter(t => !t.aiEnabled).length,
      byCategory,
      byDangerLevel
    };
  }

  /**
   * Clear all tools (for testing)
   */
  static clear(): void {
    this.tools.clear();
    console.log('🧹 ToolRegistry: Cleared all tools');
  }
}

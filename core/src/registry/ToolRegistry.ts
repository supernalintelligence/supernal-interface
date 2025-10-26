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
const globalRegistry = (typeof global !== 'undefined' ? global : globalThis) as any;
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
    
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
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
   * Get tools by class/provider name
   */
  static getToolsByProvider(providerName: string): ToolMetadata[] {
    return Array.from(this.tools.values()).filter(tool => 
      tool.providerClass === providerName || tool.providerName === providerName
    );
  }

  /**
   * Get all unique provider names
   */
  static getProviders(): string[] {
    const providers = new Set<string>();
    Array.from(this.tools.values()).forEach(tool => {
      if (tool.providerClass) providers.add(tool.providerClass);
      if (tool.providerName) providers.add(tool.providerName);
    });
    return Array.from(providers).sort();
  }

  // ===== CLI-LIKE METHODS =====

  /**
   * List all tools in a CLI-friendly format
   * Similar to 'ls' command
   */
  static list(options: {
    provider?: string;
    category?: string;
    aiEnabled?: boolean;
    dangerLevel?: string;
    verbose?: boolean;
  } = {}): string {
    let tools = Array.from(this.tools.values());

    // Apply filters
    if (options.provider) {
      tools = tools.filter(tool => 
        tool.providerClass === options.provider || tool.providerName === options.provider
      );
    }
    if (options.category) {
      tools = tools.filter(tool => tool.category === options.category);
    }
    if (options.aiEnabled !== undefined) {
      tools = tools.filter(tool => tool.aiEnabled === options.aiEnabled);
    }
    if (options.dangerLevel) {
      tools = tools.filter(tool => tool.dangerLevel === options.dangerLevel);
    }

    if (tools.length === 0) {
      return 'No tools found matching criteria.';
    }

    // Sort by provider, then by name
    tools.sort((a, b) => {
      const providerA = a.providerClass || a.providerName || '';
      const providerB = b.providerClass || b.providerName || '';
      if (providerA !== providerB) return providerA.localeCompare(providerB);
      return a.name.localeCompare(b.name);
    });

    if (options.verbose) {
      return this.formatVerboseList(tools);
    } else {
      return this.formatCompactList(tools);
    }
  }

  /**
   * Show help for a specific tool
   * Similar to 'man' or 'help' command
   */
  static help(toolId: string): string {
    const tool = this.getTool(toolId);
    if (!tool) {
      // Try to find by name or partial match
      const matches = Array.from(this.tools.values()).filter(t => 
        t.name.toLowerCase().includes(toolId.toLowerCase()) ||
        t.toolId.toLowerCase().includes(toolId.toLowerCase())
      );
      
      if (matches.length === 0) {
        return `Tool '${toolId}' not found. Use ToolRegistry.list() to see available tools.`;
      }
      
      if (matches.length > 1) {
        const matchList = matches.map(t => `  ${t.toolId} - ${t.name}`).join('\n');
        return `Multiple tools match '${toolId}':\n${matchList}\n\nUse the full toolId for specific help.`;
      }
      
      return this.formatToolHelp(matches[0]);
    }
    
    return this.formatToolHelp(tool);
  }

  /**
   * Show overview of all tools and providers
   * Similar to 'ls -la' or directory overview
   */
  static overview(): string {
    const stats = this.getStats();
    const providers = this.getProviders();
    
    let output = `🔧 Tool Registry Overview\n`;
    output += `${'='.repeat(50)}\n\n`;
    
    output += `📊 Statistics:\n`;
    output += `  Total Tools: ${stats.total}\n`;
    output += `  AI-Enabled: ${stats.aiEnabled}\n`;
    output += `  Test-Only: ${stats.testOnly}\n\n`;
    
    output += `🏭 Providers (${providers.length}):\n`;
    providers.forEach(provider => {
      const toolCount = this.getToolsByProvider(provider).length;
      output += `  ${provider} (${toolCount} tools)\n`;
    });
    
    output += `\n📂 Categories:\n`;
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      output += `  ${category}: ${count} tools\n`;
    });
    
    output += `\n⚠️  Danger Levels:\n`;
    Object.entries(stats.byDangerLevel).forEach(([level, count]) => {
      const emoji = level === 'safe' ? '✅' : level === 'moderate' ? '⚠️' : level === 'dangerous' ? '🔶' : '🚨';
      output += `  ${emoji} ${level}: ${count} tools\n`;
    });
    
    output += `\n💡 Usage:\n`;
    output += `  ToolRegistry.list()                    - List all tools\n`;
    output += `  ToolRegistry.list({ provider: 'X' })   - List tools by provider\n`;
    output += `  ToolRegistry.help('toolId')            - Get help for specific tool\n`;
    output += `  ToolRegistry.searchTools('query')      - Search tools\n`;
    
    return output;
  }

  /**
   * Search and display tools matching query
   */
  static find(query: string): string {
    const matches = this.searchTools(query);
    
    if (matches.length === 0) {
      return `No tools found matching '${query}'.`;
    }
    
    let output = `🔍 Found ${matches.length} tool(s) matching '${query}':\n\n`;
    
    matches.forEach(tool => {
      const provider = tool.providerClass || tool.providerName || 'Unknown';
      const aiStatus = tool.aiEnabled ? '🤖' : '🧪';
      const dangerEmoji = tool.dangerLevel === 'safe' ? '✅' : 
                         tool.dangerLevel === 'moderate' ? '⚠️' : 
                         tool.dangerLevel === 'dangerous' ? '🔶' : '🚨';
      
      output += `  ${aiStatus}${dangerEmoji} ${tool.toolId}\n`;
      output += `     ${tool.description}\n`;
      output += `     Provider: ${provider} | Category: ${tool.category}\n`;
      
      if (tool.examples && tool.examples.length > 0) {
        output += `     Examples: ${tool.examples.slice(0, 2).join(', ')}\n`;
      }
      output += `\n`;
    });
    
    output += `💡 Use ToolRegistry.help('toolId') for detailed information.\n`;
    
    return output;
  }

  // ===== PRIVATE FORMATTING METHODS =====

  private static formatCompactList(tools: ToolMetadata[]): string {
    let output = `📋 Tools (${tools.length}):\n\n`;
    
    let currentProvider = '';
    tools.forEach(tool => {
      const provider = tool.providerClass || tool.providerName || 'Unknown';
      
      if (provider !== currentProvider) {
        currentProvider = provider;
        output += `\n🏭 ${provider}:\n`;
      }
      
      const aiStatus = tool.aiEnabled ? '🤖' : '🧪';
      const dangerEmoji = tool.dangerLevel === 'safe' ? '✅' : 
                         tool.dangerLevel === 'moderate' ? '⚠️' : 
                         tool.dangerLevel === 'dangerous' ? '🔶' : '🚨';
      
      output += `  ${aiStatus}${dangerEmoji} ${tool.toolId.padEnd(25)} ${tool.description}\n`;
    });
    
    return output;
  }

  private static formatVerboseList(tools: ToolMetadata[]): string {
    let output = `📋 Tools (${tools.length}) - Verbose:\n\n`;
    
    tools.forEach(tool => {
      output += this.formatToolSummary(tool) + '\n';
    });
    
    return output;
  }

  private static formatToolSummary(tool: ToolMetadata): string {
    const provider = tool.providerClass || tool.providerName || 'Unknown';
    const aiStatus = tool.aiEnabled ? '🤖 AI-Enabled' : '🧪 Test-Only';
    const dangerEmoji = tool.dangerLevel === 'safe' ? '✅' : 
                       tool.dangerLevel === 'moderate' ? '⚠️' : 
                       tool.dangerLevel === 'dangerous' ? '🔶' : '🚨';
    
    let output = `🔧 ${tool.toolId}\n`;
    output += `   Name: ${tool.name}\n`;
    output += `   Description: ${tool.description}\n`;
    output += `   Provider: ${provider}\n`;
    output += `   Category: ${tool.category}\n`;
    output += `   Status: ${aiStatus}\n`;
    output += `   Danger: ${dangerEmoji} ${tool.dangerLevel}\n`;
    
    if (tool.examples && tool.examples.length > 0) {
      output += `   Examples: ${tool.examples.join(', ')}\n`;
    }
    
    if (tool.origin) {
      output += `   Origin: ${tool.origin.path || 'N/A'}`;
      if (tool.origin.elements) {
        output += ` (${tool.origin.elements.join(', ')})`;
      }
      output += `\n`;
    }
    
    return output;
  }

  private static formatToolHelp(tool: ToolMetadata): string {
    const provider = tool.providerClass || tool.providerName || 'Unknown';
    const aiStatus = tool.aiEnabled ? '🤖 AI-Enabled' : '🧪 Test-Only';
    const dangerEmoji = tool.dangerLevel === 'safe' ? '✅' : 
                       tool.dangerLevel === 'moderate' ? '⚠️' : 
                       tool.dangerLevel === 'dangerous' ? '🔶' : '🚨';
    
    let output = `📖 Help: ${tool.toolId}\n`;
    output += `${'='.repeat(50)}\n\n`;
    
    output += `📝 Description:\n`;
    output += `   ${tool.description}\n\n`;
    
    output += `ℹ️  Details:\n`;
    output += `   Name: ${tool.name}\n`;
    output += `   Provider: ${provider}\n`;
    output += `   Category: ${tool.category}\n`;
    output += `   Status: ${aiStatus}\n`;
    output += `   Danger Level: ${dangerEmoji} ${tool.dangerLevel}\n`;
    output += `   Requires Approval: ${tool.requiresApproval ? 'Yes' : 'No'}\n\n`;
    
    if (tool.examples && tool.examples.length > 0) {
      output += `💡 Usage Examples:\n`;
      tool.examples.forEach(example => {
        output += `   "${example}"\n`;
      });
      output += `\n`;
    }
    
    if (tool.origin) {
      output += `📍 Availability:\n`;
      if (tool.origin.path) {
        output += `   Path: ${tool.origin.path}\n`;
      }
      if (tool.origin.elements && tool.origin.elements.length > 0) {
        output += `   Elements: ${tool.origin.elements.join(', ')}\n`;
      }
      if (tool.origin.modal) {
        output += `   Modal: ${tool.origin.modal}\n`;
      }
      output += `\n`;
    }
    
    if (tool.keywords && tool.keywords.length > 0) {
      output += `🏷️  Keywords: ${tool.keywords.join(', ')}\n\n`;
    }
    
    if (tool.useCases && tool.useCases.length > 0) {
      output += `🎯 Use Cases:\n`;
      tool.useCases.forEach(useCase => {
        output += `   • ${useCase}\n`;
      });
      output += `\n`;
    }
    
    output += `🔧 Technical Details:\n`;
    output += `   Method: ${tool.methodName}\n`;
    output += `   Return Type: ${tool.returnType}\n`;
    output += `   Execution Context: ${tool.executionContext}\n`;
    output += `   Complexity: ${tool.complexity}\n`;
    output += `   Frequency: ${tool.frequency}\n`;
    
    return output;
  }

  /**
   * Clear all tools (for testing)
   */
  static clear(): void {
    this.tools.clear();
    console.log('🧹 ToolRegistry: Cleared all tools');
  }
}

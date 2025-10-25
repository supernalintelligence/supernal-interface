/**
 * Universal Chat Interface
 * 
 * Natural language interface for AI tool execution.
 * Parses human language and maps to appropriate tools.
 */

import { UniversalToolRegistry } from '../registry/UniversalToolRegistry';
import { ToolMetadata } from '../decorators/Tool';

export interface ChatQuery {
  text: string;
  context?: any;
  userId?: string;
  sessionId?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  toolsFound?: ToolMetadata[];
  toolExecuted?: string;
  result?: any;
  suggestions?: string[];
  requiresApproval?: boolean;
  approvalId?: string;
}

export class UniversalChatInterface {
  
  /**
   * Process natural language query and execute appropriate tools
   */
  async execute(query: ChatQuery): Promise<ChatResponse> {
    try {
      // Parse the query to find matching tools
      const matchingTools = this.findMatchingTools(query.text);
      
      if (matchingTools.length === 0) {
        return {
          success: false,
          message: "I couldn't find any tools that match your request.",
          suggestions: this.generateSuggestions()
        };
      }
      
      // If multiple tools match, return options
      if (matchingTools.length > 1) {
        return {
          success: false,
          message: "I found multiple tools that could help. Please be more specific:",
          toolsFound: matchingTools,
          suggestions: matchingTools.map(t => `"${t.examples[0]}" - ${t.aiDescription}`)
        };
      }
      
      // Single tool match - attempt execution
      const tool = matchingTools[0];
      const parameters = this.extractParameters(query.text, tool);
      const toolKey = `${tool.providerClass}.${tool.methodName}`;
      
      // Check if tool is AI-enabled
      if (!tool.aiEnabled) {
        return {
          success: false,
          message: `The tool "${tool.name}" is not available for AI execution. It can only be used in testing mode.`,
          toolsFound: [tool]
        };
      }
      
      // Check if approval is required
      if (tool.requiresApproval) {
        const approval = await UniversalToolRegistry.requestApproval(toolKey, parameters);
        
        return {
          success: false,
          message: `The action "${tool.name}" requires human approval due to its ${tool.dangerLevel} danger level. An approval request has been created.`,
          requiresApproval: true,
          approvalId: approval.id,
          toolsFound: [tool]
        };
      }
      
      // Execute the tool
      const result = await UniversalToolRegistry.executeForAI(toolKey, parameters);
      
      if (result.success) {
        return {
          success: true,
          message: `Successfully executed "${tool.name}".`,
          toolExecuted: toolKey,
          result: result.data
        };
      } else {
        return {
          success: false,
          message: `Failed to execute "${tool.name}": ${result.error}`,
          toolsFound: [tool]
        };
      }
      
    } catch (error) {
      return {
        success: false,
        message: `An error occurred: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Find tools that match the natural language query
   */
  private findMatchingTools(query: string): ToolMetadata[] {
    const queryLower = query.toLowerCase();
    const tools = Array.from(UniversalToolRegistry.getAllTools().values());
    
    // Score each tool based on relevance
    const scoredTools = tools.map(tool => ({
      tool,
      score: this.calculateRelevanceScore(queryLower, tool)
    }));
    
    // Filter and sort by score
    return scoredTools
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 matches
      .map(item => item.tool);
  }
  
  /**
   * Calculate relevance score for a tool against a query
   */
  private calculateRelevanceScore(query: string, tool: ToolMetadata): number {
    let score = 0;
    
    // Exact matches in examples (highest priority)
    for (const example of tool.examples) {
      if (query.includes(example.toLowerCase())) {
        score += 100;
      }
    }
    
    // Partial matches in examples
    for (const example of tool.examples) {
      const words = example.toLowerCase().split(' ');
      for (const word of words) {
        if (word.length > 2 && query.includes(word)) {
          score += 20;
        }
      }
    }
    
    // Matches in AI description
    const descWords = tool.aiDescription.toLowerCase().split(' ');
    for (const word of descWords) {
      if (word.length > 3 && query.includes(word)) {
        score += 10;
      }
    }
    
    // Matches in keywords
    for (const keyword of tool.keywords) {
      if (query.includes(keyword.toLowerCase())) {
        score += 15;
      }
    }
    
    // Matches in tags
    for (const tag of tool.tags) {
      if (query.includes(tag.toLowerCase())) {
        score += 5;
      }
    }
    
    // Method name similarity
    const methodWords = tool.methodName.replace(/([A-Z])/g, ' $1').toLowerCase().split(' ');
    for (const word of methodWords) {
      if (word.length > 2 && query.includes(word)) {
        score += 8;
      }
    }
    
    // Tool name similarity
    const nameWords = tool.name.toLowerCase().split(' ');
    for (const word of nameWords) {
      if (word.length > 2 && query.includes(word)) {
        score += 12;
      }
    }
    
    return score;
  }
  
  /**
   * Extract parameters from natural language query
   */
  private extractParameters(query: string, tool: ToolMetadata): any {
    const parameters: any = {};
    
    // Common parameter patterns
    const patterns = {
      id: /(?:id|identifier|ID)\s*:?\s*([a-zA-Z0-9-_]+)/i,
      name: /(?:name|called|named)\s*:?\s*["']?([^"'\n]+)["']?/i,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
      number: /(\d+)/,
      text: /["']([^"']+)["']/,
      url: /(https?:\/\/[^\s]+)/,
      path: /(?:path|route|url)\s*:?\s*([\/\w-]+)/i
    };
    
    // Extract common parameters
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = query.match(pattern);
      if (match) {
        parameters[key] = match[1];
      }
    }
    
    // Tool-specific parameter extraction
    const methodName = tool.methodName.toLowerCase();
    
    if (methodName.includes('search') || methodName.includes('find')) {
      // Extract search query
      const searchMatch = query.match(/(?:search|find|look for)\s+(?:for\s+)?(.+?)(?:\s+in|\s+from|$)/i);
      if (searchMatch) {
        parameters.query = searchMatch[1].trim();
      }
    }
    
    if (methodName.includes('create') || methodName.includes('add')) {
      // Extract creation data
      const createMatch = query.match(/(?:create|add|make)\s+(?:a\s+|an\s+)?(.+?)(?:\s+with|\s+called|$)/i);
      if (createMatch) {
        parameters.name = createMatch[1].trim();
      }
    }
    
    if (methodName.includes('update') || methodName.includes('modify')) {
      // Extract update target and data
      const updateMatch = query.match(/(?:update|modify|change)\s+(.+?)(?:\s+to|\s+with|$)/i);
      if (updateMatch) {
        parameters.target = updateMatch[1].trim();
      }
    }
    
    if (methodName.includes('delete') || methodName.includes('remove')) {
      // Extract deletion target
      const deleteMatch = query.match(/(?:delete|remove|get rid of)\s+(.+?)(?:\s+from|$)/i);
      if (deleteMatch) {
        parameters.target = deleteMatch[1].trim();
      }
    }
    
    return parameters;
  }
  
  /**
   * Generate helpful suggestions
   */
  private generateSuggestions(): string[] {
    const aiTools = UniversalToolRegistry.getAIEnabledTools();
    const suggestions: string[] = [];
    
    // Get examples from top AI-enabled tools
    for (const tool of aiTools.slice(0, 5)) {
      if (tool.examples.length > 0) {
        suggestions.push(`Try: "${tool.examples[0]}"`);
      }
    }
    
    // Add general suggestions if no specific ones
    if (suggestions.length === 0) {
      suggestions.push(
        'Try asking to "get users" or "search for something"',
        'Use specific action words like "create", "update", "delete"',
        'Be specific about what you want to do'
      );
    }
    
    return suggestions;
  }
  
  /**
   * Get help information about available tools
   */
  getHelp(): ChatResponse {
    const aiTools = UniversalToolRegistry.getAIEnabledTools();
    const stats = UniversalToolRegistry.getStats();
    
    let message = `I have access to ${stats.aiEnabled} AI-enabled tools out of ${stats.totalTools} total tools.\n\n`;
    message += "Here are some things you can ask me to do:\n\n";
    
    // Group tools by category
    const categories = new Map<string, ToolMetadata[]>();
    
    for (const tool of aiTools) {
      const category = tool.category.toString();
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(tool);
    }
    
    // Show examples by category
    for (const [category, tools] of categories) {
      message += `**${category}:**\n`;
      for (const tool of tools.slice(0, 3)) { // Show top 3 per category
        if (tool.examples.length > 0) {
          message += `- "${tool.examples[0]}" - ${tool.aiDescription}\n`;
        }
      }
      message += '\n';
    }
    
    return {
      success: true,
      message,
      toolsFound: aiTools
    };
  }
  
  /**
   * Check approval status
   */
  async checkApproval(approvalId: string): Promise<ChatResponse> {
    try {
      // This would check the approval status in a real implementation
      return {
        success: true,
        message: `Approval ${approvalId} is still pending. Please wait for human approval.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Could not check approval status: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

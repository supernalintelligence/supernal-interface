/**
 * Real AI Interface for @supernal-interface/core Demo
 * 
 * This actually uses the ToolRegistry to find and execute tools.
 */

import { ToolRegistry, ToolMetadata } from '@supernal-interface/core/browser';
import { getUIControls } from './UIControls';

export interface AICommand {
  query: string;
  tool?: ToolMetadata;
  confidence: number;
  requiresApproval: boolean;
  parameters?: any[];
  parsedIntent?: {
    action: string;
    target?: string;
    value?: string;
  };
}

export interface AIResponse {
  success: boolean;
  message: string;
  executedTool?: string;
  timestamp: string;
}

export class DemoAIInterface {
  
  /**
   * Extract parameters from natural language command
   */
  private extractParameters(query: string, tool?: ToolMetadata): { parameters: any[], parsedIntent: any } {
    const lowerQuery = query.toLowerCase().trim();
    const parameters: any[] = [];
    const parsedIntent: any = { action: '', target: '', value: '' };

    // Extract priority values
    if (lowerQuery.includes('priority')) {
      parsedIntent.action = 'setPriority';
      if (lowerQuery.includes('high')) {
        parameters.push('high');
        parsedIntent.value = 'high';
      } else if (lowerQuery.includes('medium')) {
        parameters.push('medium');
        parsedIntent.value = 'medium';
      } else if (lowerQuery.includes('low')) {
        parameters.push('low');
        parsedIntent.value = 'low';
      }
    }

    // Extract theme values
    if (lowerQuery.includes('theme')) {
      parsedIntent.action = 'setTheme';
      if (lowerQuery.includes('dark')) {
        parameters.push('dark');
        parsedIntent.value = 'dark';
      } else if (lowerQuery.includes('light')) {
        parameters.push('light');
        parsedIntent.value = 'light';
      } else if (lowerQuery.includes('auto')) {
        parameters.push('auto');
        parsedIntent.value = 'auto';
      }
    }

    // Extract status values
    if (lowerQuery.includes('status')) {
      parsedIntent.action = 'setStatus';
      if (lowerQuery.includes('active')) {
        parameters.push('active');
        parsedIntent.value = 'active';
      } else if (lowerQuery.includes('inactive')) {
        parameters.push('inactive');
        parsedIntent.value = 'inactive';
      } else if (lowerQuery.includes('pending')) {
        parameters.push('pending');
        parsedIntent.value = 'pending';
      } else if (lowerQuery.includes('disabled')) {
        parameters.push('disabled');
        parsedIntent.value = 'disabled';
      }
    }

    // Extract toggle states
    if (lowerQuery.includes('enable') || lowerQuery.includes('turn on')) {
      parameters.push(true);
      parsedIntent.value = 'enable';
    } else if (lowerQuery.includes('disable') || lowerQuery.includes('turn off')) {
      parameters.push(false);
      parsedIntent.value = 'disable';
    }

    return { parameters, parsedIntent };
  }

  /**
   * Process natural language command and find matching tools
   */
  findToolsForCommand(query: string): AICommand {
    const lowerQuery = query.toLowerCase().trim();
    
    // Search the actual tool registry
    const matchingTools = ToolRegistry.searchTools(lowerQuery);
    
    if (matchingTools.length === 0) {
      return {
        query,
        confidence: 0,
        requiresApproval: false
      };
    }
    
    // Find the best match based on examples
    let bestTool: ToolMetadata | undefined;
    let bestScore = 0;
    
    for (const tool of matchingTools) {
      let score = 0;
      
      // Check if query matches any examples
      for (const example of tool.examples) {
        if (lowerQuery.includes(example.toLowerCase()) || example.toLowerCase().includes(lowerQuery)) {
          score += 10;
        }
      }
      
      // Check description match
      if (tool.description.toLowerCase().includes(lowerQuery) || lowerQuery.includes(tool.description.toLowerCase())) {
        score += 5;
      }
      
      // Check method name match
      if (tool.methodName.toLowerCase().includes(lowerQuery.replace(/\s+/g, '')) || 
          lowerQuery.replace(/\s+/g, '').includes(tool.methodName.toLowerCase())) {
        score += 3;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestTool = tool;
      }
    }
    
    // Log the matching process for transparency
    if (bestTool) {
      console.log(`🎯 Tool Match: ${bestTool.name} (${Math.round((Math.min(bestScore / 10, 1)) * 100)}% confidence)`);
      console.log(`   Score: ${bestScore}/10`);
      console.log(`   Tool Schema:`, {
        testId: bestTool.testId,
        elementType: bestTool.elementType,
        actionType: bestTool.actionType,
        dangerLevel: bestTool.dangerLevel,
        requiresApproval: bestTool.requiresApproval,
        examples: bestTool.examples
      });
    } else {
      console.log(`❌ No tool match found for: "${query}"`);
      console.log(`💡 Available commands:`, Array.from(ToolRegistry.getAllTools().values())
        .filter(t => t.aiEnabled)
        .flatMap(t => t.examples));
    }
    
    // Extract parameters from the query
    const { parameters, parsedIntent } = this.extractParameters(query, bestTool);
    
    return {
      query,
      tool: bestTool,
      confidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0,
      requiresApproval: bestTool?.requiresApproval || false,
      parameters,
      parsedIntent
    };
  }
  
  
  /**
   * Execute a tool command
   */
  async executeCommand(command: AICommand, approved: boolean = false): Promise<AIResponse> {
    const timestamp = new Date().toISOString();
    
    if (!command.tool) {
      return {
        success: false,
        message: `❓ I don't understand "${command.query}". Try commands like "open menu" or "send message hello".`,
        timestamp
      };
    }
    
    if (command.tool.requiresApproval && !approved) {
      return {
        success: false,
        message: `⚠️ "${command.tool.name}" requires approval. This is a ${command.tool.dangerLevel} action.`,
        timestamp
      };
    }
    
    if (!command.tool.aiEnabled) {
      return {
        success: false,
        message: `🚫 "${command.tool.name}" is test-only and cannot be executed by AI.`,
        timestamp
      };
    }
    
    try {
      // Execute the tool by calling the actual method
      const result = await this.executeToolMethod(command.tool, command.parameters || []);
      
      return {
        success: result.success,
        message: result.message,
        executedTool: command.tool.name,
        timestamp
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Execution failed: ${error instanceof Error ? error.message : String(error)}`,
        executedTool: command.tool.name,
        timestamp
      };
    }
  }
  
  /**
   * Execute the actual @Tool method directly with parameters
   */
  private async executeToolMethod(tool: ToolMetadata, parameters: any[] = []): Promise<{ success: boolean; message: string }> {
    console.log(`🔧 AIInterface: Executing @Tool method: ${tool.methodName}() with parameters:`, parameters);
    
    try {
      const uiControls = getUIControls();
      
      // Call the @Tool decorated method directly with extracted parameters
      switch (tool.methodName) {
        // Button widgets
        case 'openMainMenu':
          return await uiControls.openMainMenu();
        case 'closeMainMenu':
          return await uiControls.closeMainMenu();
        
        // Checkbox widgets
        case 'toggleFeature':
          return await uiControls.toggleFeature(parameters[0]);
        case 'toggleNotifications':
          return await uiControls.toggleNotifications(parameters[0]);
        
        // Radio widget
        case 'setPriority':
          if (parameters.length === 0) {
            return { 
              success: false, 
              message: `❌ setPriority requires a parameter. Try: "set priority high", "set priority medium", or "set priority low"` 
            };
          }
          const priority = parameters[0];
          if (!['high', 'medium', 'low'].includes(priority)) {
            return { 
              success: false, 
              message: `❌ Invalid priority "${priority}". Valid options: high, medium, low. Try: "set priority high"` 
            };
          }
          return await uiControls.setPriority(priority);
        
        // Select widgets
        case 'setStatus':
          if (parameters.length === 0) {
            return { 
              success: false, 
              message: `❌ setStatus requires a parameter. Try: "set status active", "set status inactive", "set status pending", or "set status disabled"` 
            };
          }
          const status = parameters[0];
          if (!['active', 'inactive', 'pending', 'disabled'].includes(status)) {
            return { 
              success: false, 
              message: `❌ Invalid status "${status}". Valid options: active, inactive, pending, disabled. Try: "set status active"` 
            };
          }
          return await uiControls.setStatus(status);
          
        case 'setTheme':
          if (parameters.length === 0) {
            return { 
              success: false, 
              message: `❌ setTheme requires a parameter. Try: "set theme dark", "set theme light", or "set theme auto"` 
            };
          }
          const theme = parameters[0];
          if (!['light', 'dark', 'auto'].includes(theme)) {
            return { 
              success: false, 
              message: `❌ Invalid theme "${theme}". Valid options: light, dark, auto. Try: "set theme dark"` 
            };
          }
          return await uiControls.setTheme(theme);
        
        // Form widget
        case 'submitForm':
          const name = parameters[0] || 'AI User';
          return await uiControls.submitForm(name);
        
        default:
          return { success: false, message: `❌ Unknown tool method: ${tool.methodName}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Failed to execute ${tool.methodName}(): ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  
  /**
   * Get available commands for help
   */
  getAvailableCommands(): string[] {
    const tools = ToolRegistry.getAIEnabledTools();
    const commands: string[] = [];
    
    for (const tool of tools) {
      commands.push(...tool.examples);
    }
    
    return [...new Set(commands)].sort();
  }
  
  /**
   * Get tool statistics
   */
  getToolStats() {
    return ToolRegistry.getStats();
  }
}

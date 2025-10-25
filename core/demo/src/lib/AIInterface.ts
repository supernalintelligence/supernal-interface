/**
 * Real AI Interface for @supernal-interface/core Demo
 * 
 * This actually uses the ToolRegistry to find and execute tools.
 */

import { ToolRegistry, ToolMetadata } from '@supernal-interface/core/browser';

export interface AICommand {
  query: string;
  tool?: ToolMetadata;
  confidence: number;
  requiresApproval: boolean;
}

export interface AIResponse {
  success: boolean;
  message: string;
  executedTool?: string;
  timestamp: string;
}

export class DemoAIInterface {
  
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
    
    return {
      query,
      tool: bestTool,
      confidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0,
      requiresApproval: bestTool?.requiresApproval || false
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
      const result = await this.executeToolMethod(command.tool);
      
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
   * Execute the actual tool method
   */
  private async executeToolMethod(tool: ToolMetadata): Promise<{ success: boolean; message: string }> {
    // This is where we'd normally call the actual provider method
    // For the demo, we'll simulate the execution by triggering the DOM elements
    
    switch (tool.methodName) {
      case 'openMainMenu':
        return this.simulateClick('open-main-menu');
      case 'closeMainMenu':
        return this.simulateClick('close-main-menu');
      case 'navigateToDocs':
        return this.simulateClick('navigate-to-docs');
      case 'sendMessage':
        return this.simulateSendMessage();
      case 'clearChatHistory':
        return this.simulateClick('clear-chat-history');
      case 'toggleChatPanel':
        return this.simulateClick('toggle-chat-panel');
      case 'generateCodeExample':
        return this.simulateClick('generate-code-example');
      case 'runTestSimulation':
        return this.simulateClick('run-test-simulation');
      case 'resetDemoState':
        return this.simulateClick('reset-demo-state');
      case 'deleteDemoData':
        return this.simulateClick('delete-demo-data');
      case 'exportDemoConfig':
        return this.simulateClick('export-demo-config');
      default:
        return { success: false, message: `Unknown tool method: ${tool.methodName}` };
    }
  }
  
  /**
   * Simulate clicking a button by testId
   */
  private async simulateClick(testId: string): Promise<{ success: boolean; message: string }> {
    if (typeof document === 'undefined') {
      return { success: false, message: 'Document not available (server-side)' };
    }
    
    const element = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
    if (!element) {
      return { success: false, message: `Element with testId "${testId}" not found` };
    }
    
    element.click();
    return { success: true, message: `Successfully clicked ${testId}` };
  }
  
  /**
   * Simulate sending a message
   */
  private async simulateSendMessage(): Promise<{ success: boolean; message: string }> {
    if (typeof document === 'undefined') {
      return { success: false, message: 'Document not available (server-side)' };
    }
    
    const input = document.querySelector('[data-testid="chat-input"]') as HTMLInputElement;
    const button = document.querySelector('[data-testid="send-chat-message"]') as HTMLButtonElement;
    
    if (!input || !button) {
      return { success: false, message: 'Chat interface not found' };
    }
    
    // Use the current input value or a default message
    const message = input.value || 'Hello from AI!';
    button.click();
    
    return { success: true, message: `Message sent: "${message}"` };
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

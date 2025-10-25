/**
 * Auto-generated UniversalAIInterface
 * Generated from @Tool decorators - DO NOT EDIT MANUALLY
 * 
 * Generated: 2025-10-25T19:13:58.139Z
 * AI-enabled tools: 2
 * Total tools: 3
 */

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: any;
  examples: string[];
  dangerLevel: 'safe' | 'moderate' | 'dangerous' | 'destructive';
  requiresApproval: boolean;
  testId: string;
  elementType?: string;
  actionType?: string;
}

export class UniversalAIInterface {
  private tools: Record<string, AIToolDefinition> = {
    'clickLoginButton': {
      name: 'Click Login Button',
      description: 'Click the login button',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      examples: ["click login","press login button","login now"],
      dangerLevel: 'safe',
      requiresApproval: false,
      testId: 'demo-login-button',
      elementType: 'button',
      actionType: 'click'
    },
    'deleteAccount': {
      name: 'Delete Account',
      description: 'Delete user account permanently',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      examples: ["delete account","remove account","destroy account"],
      dangerLevel: 'destructive',
      requiresApproval: true,
      testId: 'demo-delete-account',
      elementType: 'button',
      actionType: 'click'
    }
  };

  /**
   * Get all AI-enabled tools
   */
  getAllTools(): Record<string, AIToolDefinition> {
    return { ...this.tools };
  }

  /**
   * Get tool by method name
   */
  getTool(methodName: string): AIToolDefinition | undefined {
    return this.tools[methodName];
  }

  /**
   * Find tools by natural language query
   */
  findToolsByQuery(query: string): AIToolDefinition[] {
    const queryLower = query.toLowerCase();
    
    return Object.values(this.tools).filter(tool => {
      const searchFields = [
        tool.name.toLowerCase(),
        tool.description.toLowerCase(),
        ...tool.examples.map(ex => ex.toLowerCase())
      ];
      
      return searchFields.some(field => 
        field.includes(queryLower) || queryLower.includes(field)
      );
    });
  }

  /**
   * Get tools by danger level
   */
  getToolsByDangerLevel(level: 'safe' | 'moderate' | 'dangerous' | 'destructive'): AIToolDefinition[] {
    return Object.values(this.tools).filter(tool => tool.dangerLevel === level);
  }

  /**
   * Get safe tools (no approval required)
   */
  getSafeTools(): AIToolDefinition[] {
    return Object.values(this.tools).filter(tool => !tool.requiresApproval);
  }
}
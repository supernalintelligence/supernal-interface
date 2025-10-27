/**
 * Universal Tool Registry
 *
 * Central registry for managing AI tools with safety controls.
 * Handles tool discovery, execution, and approval workflows.
 */

import { ToolMetadata } from '../decorators/Tool';

export interface UniversalExecutionContext {
  mode: 'test' | 'live';
  source?: 'testing' | 'ai' | 'human';
  page?: any; // Playwright page
  isLiveBrowser?: boolean;
  userId?: string;
  sessionId?: string;
}

export interface UniversalToolResult {
  success: boolean;
  data?: any;
  error?: string;
  tool: string;
  executionTime?: number;
  requiresApproval?: boolean;
}

export interface ApprovalRequest {
  id: string;
  tool: string;
  params: any;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}

export class UniversalToolRegistry {
  private static tools = new Map<string, ToolMetadata>();
  private static instances = new Map<string, any>();
  private static approvalRequests = new Map<string, ApprovalRequest>();

  /**
   * Register a tool from a decorated method
   */
  static registerTool(className: string, methodName: string, metadata: ToolMetadata): void {
    const toolKey = `${className}.${methodName}`;
    this.tools.set(toolKey, metadata);

    console.log(
      `🔧 Registered Tool: ${metadata.name} (${metadata.toolType}, AI: ${metadata.aiEnabled})`
    );
  }

  /**
   * Register a provider instance for tool execution
   */
  static registerProvider(className: string, instance: any): void {
    this.instances.set(className, instance);
    console.log(`🏭 Registered Provider: ${className}`);
  }

  /**
   * Get all registered tools
   */
  static getAllTools(): Map<string, ToolMetadata> {
    return new Map(this.tools);
  }

  /**
   * Get tools by category
   */
  static getToolsByCategory(category: string): ToolMetadata[] {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.category.toString().toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get AI-enabled tools only
   */
  static getAIEnabledTools(): ToolMetadata[] {
    return Array.from(this.tools.values()).filter((tool) => tool.aiEnabled);
  }

  /**
   * Find tool by natural language query
   */
  static findToolsByQuery(query: string): ToolMetadata[] {
    const queryLower = query.toLowerCase();

    return Array.from(this.tools.values()).filter((tool) => {
      // Check name, description, examples, keywords
      const searchFields = [
        tool.name,
        tool.description,
        tool.aiDescription,
        ...tool.examples,
        ...tool.keywords,
        ...tool.tags,
      ].map((field) => field.toLowerCase());

      return searchFields.some((field) => field.includes(queryLower) || queryLower.includes(field));
    });
  }

  /**
   * Execute a tool for TESTING (always allowed)
   */
  static async executeForTesting(
    toolIdentifier: string,
    parameters: any = {}
  ): Promise<UniversalToolResult> {
    return this.executeTool(toolIdentifier, parameters, {
      mode: 'test',
      source: 'testing',
    });
  }

  /**
   * Execute a tool for AI (only if AI-enabled)
   */
  static async executeForAI(
    toolIdentifier: string,
    parameters: any = {}
  ): Promise<UniversalToolResult> {
    const tool = this.tools.get(toolIdentifier);

    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolIdentifier} not found`,
        tool: toolIdentifier,
      };
    }

    if (!tool.aiEnabled) {
      return {
        success: false,
        error: `Tool ${toolIdentifier} is not AI-enabled. Use executeForTesting() instead.`,
        tool: toolIdentifier,
      };
    }

    if (tool.requiresApproval) {
      return {
        success: false,
        error: `Tool ${toolIdentifier} requires approval. Use requestApproval() first.`,
        tool: toolIdentifier,
        requiresApproval: true,
      };
    }

    return this.executeTool(toolIdentifier, parameters, {
      mode: 'live',
      source: 'ai',
    });
  }

  /**
   * Request approval for dangerous AI operations
   */
  static async requestApproval(
    toolIdentifier: string,
    parameters: any = {}
  ): Promise<ApprovalRequest> {
    const tool = this.tools.get(toolIdentifier);

    if (!tool) {
      throw new Error(`Tool ${toolIdentifier} not found`);
    }

    if (!tool.aiEnabled) {
      throw new Error(`Tool ${toolIdentifier} is not AI-enabled`);
    }

    const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request: ApprovalRequest = {
      id: approvalId,
      tool: toolIdentifier,
      params: parameters,
      timestamp: new Date(),
      status: 'pending',
    };

    this.approvalRequests.set(approvalId, request);

    console.log(`🚨 APPROVAL REQUIRED: ${toolIdentifier}`);
    console.log(`   Danger Level: ${tool.dangerLevel}`);
    console.log(`   Parameters:`, parameters);
    console.log(`   Approval ID: ${approvalId}`);

    return request;
  }

  /**
   * Approve a pending request
   */
  static approveRequest(approvalId: string, approvedBy: string): boolean {
    const request = this.approvalRequests.get(approvalId);

    if (!request) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error(`Request ${approvalId} is already ${request.status}`);
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    console.log(`✅ Request ${approvalId} approved by ${approvedBy}`);
    return true;
  }

  /**
   * Execute with approval (after human approval)
   */
  static async executeWithApproval(approvalId: string): Promise<UniversalToolResult> {
    const request = this.approvalRequests.get(approvalId);

    if (!request) {
      return {
        success: false,
        error: `Approval request ${approvalId} not found`,
        tool: 'unknown',
      };
    }

    if (request.status !== 'approved') {
      return {
        success: false,
        error: `Request ${approvalId} is ${request.status}, not approved`,
        tool: request.tool,
      };
    }

    console.log(`🔓 Executing approved action: ${request.tool}`);

    return this.executeTool(request.tool, request.params, {
      mode: 'live',
      source: 'ai',
    });
  }

  /**
   * Internal execution method
   */
  private static async executeTool(
    toolIdentifier: string,
    parameters: any = {},
    context: UniversalExecutionContext
  ): Promise<UniversalToolResult> {
    const startTime = Date.now();

    try {
      const tool = this.tools.get(toolIdentifier);
      if (!tool) {
        throw new Error(`Tool not found: ${toolIdentifier}`);
      }

      // Get the provider instance
      const [className] = toolIdentifier.split('.');
      const instance = this.instances.get(className);

      if (!instance) {
        throw new Error(`Provider instance not found: ${className}`);
      }

      // Get the method
      const method = instance[tool.methodName];
      if (!method || typeof method !== 'function') {
        throw new Error(`Method not found: ${tool.methodName}`);
      }

      console.log(`🚀 Executing ${toolIdentifier} (${context.mode} mode)`);

      // Execute the method
      const result = await method.call(instance, parameters);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        tool: toolIdentifier,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        tool: toolIdentifier,
        executionTime,
      };
    }
  }

  /**
   * Generate tool documentation
   */
  static generateDocumentation(): string {
    const tools = Array.from(this.tools.values());
    const aiEnabledTools = tools.filter((t) => t.aiEnabled);
    const testOnlyTools = tools.filter((t) => !t.aiEnabled);

    let doc = `# Supernal Interface Tools\n\n`;
    doc += `**Total Tools**: ${tools.length}\n`;
    doc += `**AI-Enabled**: ${aiEnabledTools.length}\n`;
    doc += `**Test-Only**: ${testOnlyTools.length}\n\n`;

    doc += `## AI-Enabled Tools\n\n`;
    aiEnabledTools.forEach((tool) => {
      doc += `### ${tool.name}\n`;
      doc += `- **Description**: ${tool.aiDescription}\n`;
      doc += `- **Danger Level**: ${tool.dangerLevel}\n`;
      doc += `- **Requires Approval**: ${tool.requiresApproval ? 'Yes' : 'No'}\n`;
      doc += `- **Examples**: ${tool.examples.join(', ')}\n\n`;
    });

    doc += `## Test-Only Tools\n\n`;
    testOnlyTools.forEach((tool) => {
      doc += `### ${tool.name}\n`;
      doc += `- **Description**: ${tool.description}\n`;
      doc += `- **Danger Level**: ${tool.dangerLevel}\n\n`;
    });

    return doc;
  }

  /**
   * Get registry statistics
   */
  static getStats() {
    const tools = Array.from(this.tools.values());

    return {
      totalTools: tools.length,
      aiEnabled: tools.filter((t) => t.aiEnabled).length,
      testOnly: tools.filter((t) => !t.aiEnabled).length,
      byDangerLevel: {
        safe: tools.filter((t) => t.dangerLevel === 'safe').length,
        moderate: tools.filter((t) => t.dangerLevel === 'moderate').length,
        dangerous: tools.filter((t) => t.dangerLevel === 'dangerous').length,
        destructive: tools.filter((t) => t.dangerLevel === 'destructive').length,
      },
      requiresApproval: tools.filter((t) => t.requiresApproval).length,
      providers: this.instances.size,
      pendingApprovals: Array.from(this.approvalRequests.values()).filter(
        (r) => r.status === 'pending'
      ).length,
    };
  }
}

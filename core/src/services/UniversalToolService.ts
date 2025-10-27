/**
 * Universal Tool Service
 * 
 * Central service that combines page tracking, tool chains, and navigation
 * to provide intelligent tool discovery and workflow automation.
 */

import { ToolRegistry } from '../registry/ToolRegistry';
import { ToolMetadata } from '../decorators/Tool';
import { PageTrackingService, PageContext, ToolAvailabilityStatus } from '../tracking/PageTrackingService';
import { ToolChainExecutor, ToolChain, ToolChainResult } from '../chains/ToolChainExecutor';

export interface ToolLocation {
  tool: ToolMetadata;
  currentlyAvailable: boolean;
  path: string;
  component: string;
  navigationSteps?: NavigationStep[];
  estimatedTime?: number;
  confidence?: number;
}

export interface NavigationStep {
  action: 'navigate' | 'click' | 'wait' | 'scroll' | 'type' | 'hover' | 'open-modal';
  target: string;
  description: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface NavigationResult {
  success: boolean;
  tool: ToolMetadata;
  steps: NavigationStep[];
  executionTime: number;
  error?: string;
}

export interface WorkflowResult {
  success: boolean;
  workflowId: string;
  executedSteps: number;
  totalSteps: number;
  executionTime: number;
  results: any[];
  error?: string;
}

export interface ToolSearchOptions {
  includeUnavailable?: boolean;
  category?: string;
  dangerLevel?: string[];
  aiEnabled?: boolean;
  sortBy?: 'relevance' | 'availability' | 'name' | 'frequency';
  limit?: number;
}

export interface ToolRecommendation {
  tool: ToolMetadata;
  reason: string;
  confidence: number;
  prerequisites?: string[];
  alternatives?: ToolMetadata[];
}

type ToolAvailabilityChangeCallback = (tools: ToolMetadata[]) => void;
type PageChangeCallback = (context: PageContext) => void;

export class UniversalToolService {
  private static instance: UniversalToolService;
  private pageTracker: PageTrackingService;
  private chainExecutor: ToolChainExecutor;
  
  // Event listeners
  private toolAvailabilityListeners: Set<ToolAvailabilityChangeCallback> = new Set();
  private pageChangeListeners: Set<PageChangeCallback> = new Set();
  
  // Caching
  private toolLocationCache: Map<string, ToolLocation[]> = new Map();
  private navigationCache: Map<string, NavigationStep[]> = new Map();
  
  // Configuration
  private config = {
    cacheExpiryMs: 30000,
    maxNavigationSteps: 10,
    defaultTimeout: 5000,
    verboseLogging: false
  };

  private constructor() {
    this.pageTracker = PageTrackingService.getInstance();
    this.chainExecutor = new ToolChainExecutor();
    this.initializeEventListeners();
  }

  public static getInstance(): UniversalToolService {
    if (!UniversalToolService.instance) {
      UniversalToolService.instance = new UniversalToolService();
    }
    return UniversalToolService.instance;
  }

  /**
   * Get all tools available on current or specified page
   */
  async getPageTools(path?: string): Promise<ToolMetadata[]> {
    const targetPath = path || this.pageTracker.getCurrentContext().path;
    
    if (path && path !== this.pageTracker.getCurrentContext().path) {
      // Get tools for different page (static analysis)
      return this.pageTracker.getToolsForPath(targetPath);
    } else {
      // Get currently available tools (dynamic analysis)
      return this.pageTracker.getAvailableTools();
    }
  }

  /**
   * Find tools by natural language query or name
   */
  async findTool(query: string, options: ToolSearchOptions = {}): Promise<ToolLocation[]> {
    const cacheKey = `${query}-${JSON.stringify(options)}`;
    const cached = this.toolLocationCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    this.log(`Finding tools for query: "${query}"`);

    // Search tools using registry
    const matchingTools = ToolRegistry.searchTools(query);
    
    // Apply filters
    let filteredTools = matchingTools;
    
    if (options.category) {
      filteredTools = filteredTools.filter(tool => tool.category === options.category);
    }
    
    if (options.dangerLevel) {
      filteredTools = filteredTools.filter(tool => options.dangerLevel!.includes(tool.dangerLevel));
    }
    
    if (options.aiEnabled !== undefined) {
      filteredTools = filteredTools.filter(tool => tool.aiEnabled === options.aiEnabled);
    }

    // Convert to ToolLocation objects
    const locations: ToolLocation[] = [];
    
    for (const tool of filteredTools) {
      const location = await this.createToolLocation(tool);
      
      if (options.includeUnavailable || location.currentlyAvailable) {
        locations.push(location);
      }
    }

    // Sort results
    this.sortToolLocations(locations, options.sortBy || 'relevance', query);
    
    // Apply limit
    if (options.limit) {
      locations.splice(options.limit);
    }

    // Cache results
    this.toolLocationCache.set(cacheKey, locations);
    
    return locations;
  }

  /**
   * Navigate to a specific tool
   */
  async navigateToTool(toolId: string): Promise<NavigationResult> {
    const startTime = Date.now();
    const tool = ToolRegistry.getTool(toolId);
    
    if (!tool) {
      return {
        success: false,
        tool: null as any,
        steps: [],
        executionTime: Date.now() - startTime,
        error: `Tool '${toolId}' not found`
      };
    }

    this.log(`Navigating to tool: ${tool.name}`);

    try {
      // Check if tool is already available
      if (this.pageTracker.isToolAvailable(toolId)) {
        return {
          success: true,
          tool,
          steps: [],
          executionTime: Date.now() - startTime
        };
      }

      // Create navigation chain
      const navigationChain = await this.chainExecutor.createNavigationChain(toolId);
      
      // Execute navigation
      const chainResult = await this.chainExecutor.executeChain(navigationChain.id);
      
      // Convert chain steps to navigation steps
      const navigationSteps: NavigationStep[] = navigationChain.steps.map(step => ({
        action: this.inferActionFromTool(step.toolId),
        target: step.parameters?.selector || step.parameters?.url || step.toolId,
        description: step.description || `Execute ${step.toolId}`,
        parameters: step.parameters,
        timeout: step.waitFor?.timeout
      }));

      return {
        success: chainResult.success,
        tool,
        steps: navigationSteps,
        executionTime: Date.now() - startTime,
        error: chainResult.error
      };

    } catch (error) {
      return {
        success: false,
        tool,
        steps: [],
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create a workflow from a list of tools
   */
  async createWorkflow(toolIds: string[], name?: string): Promise<ToolChain> {
    const workflowId = `workflow-${Date.now()}`;
    const steps = toolIds.map((toolId, index) => ({
      id: `step-${index + 1}`,
      toolId,
      description: `Execute ${ToolRegistry.getTool(toolId)?.name || toolId}`,
      continueOnFailure: false
    }));

    const workflow: ToolChain = {
      id: workflowId,
      name: name || `Workflow: ${toolIds.join(' → ')}`,
      description: `Multi-step workflow executing ${toolIds.length} tools in sequence`,
      steps,
      metadata: {
        created: Date.now(),
        author: 'UniversalToolService',
        version: '1.0.0',
        tags: ['workflow', 'multi-step']
      }
    };

    this.chainExecutor.registerChain(workflow);
    return workflow;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, context?: any): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    try {
      const chainResult = await this.chainExecutor.executeChain(workflowId, context);
      
      return {
        success: chainResult.success,
        workflowId,
        executedSteps: chainResult.executedSteps.length,
        totalSteps: chainResult.totalSteps,
        executionTime: Date.now() - startTime,
        results: chainResult.executedSteps.map(step => step.result),
        error: chainResult.error
      };
      
    } catch (error) {
      return {
        success: false,
        workflowId,
        executedSteps: 0,
        totalSteps: 0,
        executionTime: Date.now() - startTime,
        results: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get tool recommendations based on current context
   */
  async getToolRecommendations(intent?: string): Promise<ToolRecommendation[]> {
    const currentContext = this.pageTracker.getCurrentContext();
    const availableTools = this.pageTracker.getAvailableTools();
    const recommendations: ToolRecommendation[] = [];

    // Recommend based on current page tools
    for (const tool of availableTools) {
      if (tool.aiEnabled) {
        recommendations.push({
          tool,
          reason: 'Available on current page',
          confidence: 0.8,
          alternatives: this.findAlternativeTools(tool)
        });
      }
    }

    // Recommend based on intent if provided
    if (intent) {
      const intentTools = await this.findTool(intent, { limit: 3 });
      for (const location of intentTools) {
        if (!recommendations.find(r => r.tool.toolId === location.tool.toolId)) {
          recommendations.push({
            tool: location.tool,
            reason: `Matches intent: "${intent}"`,
            confidence: location.confidence || 0.6,
            prerequisites: location.currentlyAvailable ? [] : ['Navigate to tool location']
          });
        }
      }
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);
    
    return recommendations.slice(0, 5);
  }

  /**
   * Subscribe to tool availability changes
   */
  onToolAvailabilityChange(callback: ToolAvailabilityChangeCallback): () => void {
    this.toolAvailabilityListeners.add(callback);
    return () => this.toolAvailabilityListeners.delete(callback);
  }

  /**
   * Subscribe to page changes
   */
  onPageChange(callback: PageChangeCallback): () => void {
    this.pageChangeListeners.add(callback);
    return () => this.pageChangeListeners.delete(callback);
  }

  /**
   * Get current page context
   */
  getCurrentContext(): PageContext {
    return this.pageTracker.getCurrentContext();
  }

  /**
   * Check if a tool is currently available
   */
  isToolAvailable(toolId: string): boolean {
    return this.pageTracker.isToolAvailable(toolId);
  }

  /**
   * Get all registered workflows
   */
  getWorkflows(): ToolChain[] {
    return this.chainExecutor.getChains().filter(chain => 
      chain.metadata?.tags?.includes('workflow')
    );
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update dependent services
    this.pageTracker.updateConfig({
      verboseLogging: this.config.verboseLogging
    });
    
    this.chainExecutor.updateConfig({
      verboseLogging: this.config.verboseLogging,
      defaultTimeout: this.config.defaultTimeout
    });
  }

  // Private methods

  private initializeEventListeners(): void {
    // Listen to page context changes
    this.pageTracker.onContextChange((event) => {
      this.handlePageContextChange(event.current);
      this.clearLocationCache();
    });

    // Listen to tool availability changes
    this.pageTracker.onToolAvailabilityChange((status) => {
      this.handleToolAvailabilityChange(status);
    });
  }

  private handlePageContextChange(context: PageContext): void {
    this.log(`Page context changed: ${context.path}`);
    
    // Notify listeners
    this.pageChangeListeners.forEach(callback => {
      try {
        callback(context);
      } catch (error) {
        console.error('Error in page change callback:', error);
      }
    });
  }

  private handleToolAvailabilityChange(status: ToolAvailabilityStatus): void {
    this.log(`Tool availability changed: ${status.toolId} -> ${status.available}`);
    
    // Get current available tools and notify listeners
    const availableTools = this.pageTracker.getAvailableTools();
    
    this.toolAvailabilityListeners.forEach(callback => {
      try {
        callback(availableTools);
      } catch (error) {
        console.error('Error in tool availability callback:', error);
      }
    });
  }

  private async createToolLocation(tool: ToolMetadata): Promise<ToolLocation> {
    const currentlyAvailable = this.pageTracker.isToolAvailable(tool.toolId);
    const locations = this.pageTracker.findToolLocations(tool.toolId);
    
    const location: ToolLocation = {
      tool,
      currentlyAvailable,
      path: tool.origin?.path || '/',
      component: tool.providerClass || 'Unknown',
      confidence: this.calculateToolConfidence(tool)
    };

    // Generate navigation steps if not currently available
    if (!currentlyAvailable && locations.length > 0) {
      location.navigationSteps = await this.generateNavigationSteps(tool);
      location.estimatedTime = this.estimateNavigationTime(location.navigationSteps);
    }

    return location;
  }

  private async generateNavigationSteps(tool: ToolMetadata): Promise<NavigationStep[]> {
    const cacheKey = tool.toolId;
    const cached = this.navigationCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    const steps: NavigationStep[] = [];
    const currentContext = this.pageTracker.getCurrentContext();

    // Add navigation step if different page
    if (tool.origin?.path && currentContext.path !== tool.origin.path) {
      steps.push({
        action: 'navigate',
        target: tool.origin.path,
        description: `Navigate to ${tool.origin.path}`,
        parameters: { url: tool.origin.path }
      });
    }

    // Add modal opening step if needed
    if (tool.origin?.modal) {
      steps.push({
        action: 'open-modal',
        target: tool.origin.modal,
        description: `Open ${tool.origin.modal} modal`,
        parameters: { modal: tool.origin.modal }
      });
    }

    // Add scroll step if needed
    if (tool.selector || tool.elementId) {
      const selector = tool.selector || `#${tool.elementId}`;
      steps.push({
        action: 'scroll',
        target: selector,
        description: `Scroll to ${tool.name}`,
        parameters: { selector }
      });
    }

    this.navigationCache.set(cacheKey, steps);
    return steps;
  }

  private calculateToolConfidence(tool: ToolMetadata): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for AI-enabled tools
    if (tool.aiEnabled) confidence += 0.2;
    
    // Increase confidence for safe tools
    if (tool.dangerLevel === 'safe') confidence += 0.1;
    
    // Increase confidence for frequently used tools
    if (tool.frequency === 'VERY_HIGH') confidence += 0.1;
    
    // Increase confidence if tool has good examples
    if (tool.examples && tool.examples.length > 2) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private sortToolLocations(locations: ToolLocation[], sortBy: string, query?: string): void {
    locations.sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          return Number(b.currentlyAvailable) - Number(a.currentlyAvailable);
        
        case 'name':
          return a.tool.name.localeCompare(b.tool.name);
        
        case 'frequency': {
          const freqOrder = { 'VERY_HIGH': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1, 'VERY_LOW': 0 };
          return (freqOrder[b.tool.frequency as keyof typeof freqOrder] || 0) - 
                 (freqOrder[a.tool.frequency as keyof typeof freqOrder] || 0);
        }
        
        case 'relevance':
        default:
          // Sort by confidence, then availability
          if (a.confidence !== b.confidence) {
            return (b.confidence || 0) - (a.confidence || 0);
          }
          return Number(b.currentlyAvailable) - Number(a.currentlyAvailable);
      }
    });
  }

  private findAlternativeTools(tool: ToolMetadata): ToolMetadata[] {
    const allTools = Array.from(ToolRegistry.getAllTools().values());
    
    return allTools
      .filter(t => 
        t.toolId !== tool.toolId &&
        t.category === tool.category &&
        t.aiEnabled
      )
      .slice(0, 3);
  }

  private inferActionFromTool(toolId: string): NavigationStep['action'] {
    const lowerToolId = toolId.toLowerCase();
    
    if (lowerToolId.includes('navigate')) return 'navigate';
    if (lowerToolId.includes('click')) return 'click';
    if (lowerToolId.includes('scroll')) return 'scroll';
    if (lowerToolId.includes('type')) return 'type';
    if (lowerToolId.includes('hover')) return 'hover';
    if (lowerToolId.includes('wait')) return 'wait';
    
    return 'click'; // Default action
  }

  private estimateNavigationTime(steps?: NavigationStep[]): number {
    if (!steps || steps.length === 0) return 0;
    
    const timePerStep = {
      navigate: 2000,
      click: 500,
      scroll: 300,
      type: 1000,
      hover: 200,
      wait: 1000,
      'open-modal': 800
    };
    
    return steps.reduce((total, step) => {
      return total + (timePerStep[step.action] || 500);
    }, 0);
  }

  private isCacheValid(cacheKey: string): boolean {
    // Simple cache validation - in real implementation, track cache timestamps
    return false; // Always refresh for now
  }

  private clearLocationCache(): void {
    this.toolLocationCache.clear();
    this.navigationCache.clear();
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.verboseLogging) {
      console.log(`[UniversalToolService] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const universalToolService = UniversalToolService.getInstance();

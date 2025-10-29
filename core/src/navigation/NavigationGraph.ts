/**
 * NavigationGraph - Production-Quality Singleton (REQ-005)
 * 
 * Manages navigation contexts, discovers tool locations, and computes A→B paths.
 * Designed for production use with automatic context detection.
 */

import {
  NavigationContext,
  NavigationEdge,
  NavigationPath,
  PathComputeOptions,
  ContextDetection,
  ContextDetectionStrategy,
} from '../types/NavigationGraph';

export class NavigationGraph {
  private static instance: NavigationGraph;
  
  /** All registered contexts */
  private contexts = new Map<string, NavigationContext>();
  
  /** Navigation edges (context → context) */
  private edges: NavigationEdge[] = [];
  
  /** Tool to context mapping */
  private toolContextMap = new Map<string, string>();
  
  /** Current active context */
  private currentContext: string = 'global';
  
  /** Context detection strategies (in priority order) */
  private detectionStrategies: ContextDetectionStrategy[] = [
    'convention',
    'react-tree',
    'dom-observation',
  ];
  
  private constructor() {
    // Private constructor for singleton
    this.registerContext({
      id: 'global',
      name: 'Global',
      children: [],
      tools: [],
    });
  }
  
  static getInstance(): NavigationGraph {
    if (!NavigationGraph.instance) {
      NavigationGraph.instance = new NavigationGraph();
    }
    return NavigationGraph.instance;
  }
  
  /**
   * Register a navigation context
   */
  registerContext(context: NavigationContext): void {
    this.contexts.set(context.id, context);
    
    // Update parent's children list
    if (context.parent) {
      const parent = this.contexts.get(context.parent);
      if (parent && !parent.children.includes(context.id)) {
        parent.children.push(context.id);
      }
    }
  }
  
  /**
   * Register a navigation edge (how to get from A to B)
   */
  registerEdge(edge: NavigationEdge): void {
    // Validate contexts exist
    if (!this.contexts.has(edge.from)) {
      console.warn(`Cannot register edge: source context "${edge.from}" does not exist`);
      return;
    }
    if (!this.contexts.has(edge.to)) {
      console.warn(`Cannot register edge: target context "${edge.to}" does not exist`);
      return;
    }
    
    // Check for duplicate edges
    const duplicate = this.edges.find(
      (e) => e.from === edge.from && e.to === edge.to && e.navigationTool === edge.navigationTool
    );
    
    if (duplicate) {
      console.warn(`Edge from "${edge.from}" to "${edge.to}" via "${edge.navigationTool}" already exists`);
      return;
    }
    
    this.edges.push({
      ...edge,
      cost: edge.cost ?? 1, // Default cost
    });
  }
  
  /**
   * Register a tool in a specific context
   */
  registerToolInContext(toolId: string, contextId: string): void {
    if (!this.contexts.has(contextId)) {
      console.warn(`Cannot register tool "${toolId}": context "${contextId}" does not exist`);
      return;
    }
    
    const context = this.contexts.get(contextId)!;
    if (!context.tools.includes(toolId)) {
      context.tools.push(toolId);
    }
    
    this.toolContextMap.set(toolId, contextId);
  }
  
  /**
   * Auto-detect context for a tool (REQ-005 auto-detection)
   * 
   * Tries multiple strategies in order:
   * 1. Convention-based (file path)
   * 2. React component tree (runtime)
   * 3. DOM observation (fallback)
   */
  detectToolContext(toolId: string, metadata?: {
    filePath?: string;
    componentName?: string;
    element?: Element;
  }): ContextDetection | null {
    // Strategy 1: Convention-based (file path)
    if (metadata?.filePath) {
      const detection = this.detectContextByConvention(toolId, metadata.filePath);
      if (detection) return detection;
    }
    
    // Strategy 2: React component tree
    if (metadata?.componentName) {
      const detection = this.detectContextByReactTree(toolId, metadata.componentName);
      if (detection) return detection;
    }
    
    // Strategy 3: DOM observation
    if (metadata?.element) {
      const detection = this.detectContextByDOM(toolId, metadata.element);
      if (detection) return detection;
    }
    
    // Fallback: register in global context
    return {
      strategy: 'manual',
      contextId: 'global',
      confidence: 0.3,
      metadata: { reason: 'Auto-detection failed, defaulting to global' },
    };
  }
  
  /**
   * Strategy 1: Convention-based detection (file path → context path)
   * 
   * @example
   * "src/pages/authenticated/dashboard/SettingsTab.tsx"
   * → context: "authenticated.dashboard.settings"
   */
  private detectContextByConvention(toolId: string, filePath: string): ContextDetection | null {
    // Remove common prefixes
    let path = filePath
      .replace(/^src\/pages\//, '')
      .replace(/^src\/components\//, '')
      .replace(/^pages\//, '')
      .replace(/^components\//, '');
    
    // Remove file extension and common suffixes
    path = path
      .replace(/\.(tsx?|jsx?)$/, '')
      .replace(/(Page|Tab|Modal|View)$/, '');
    
    // Split by directory and convert to context ID
    const parts = path.split('/').filter(Boolean).map(part => part.toLowerCase());
    
    if (parts.length === 0) {
      return null;
    }
    
    // Build context ID (e.g., "authenticated.dashboard.settings")
    const contextId = parts.join('.');
    
    // Check if context exists, or create it
    if (!this.contexts.has(contextId)) {
      // Auto-create nested contexts
      this.autoCreateNestedContexts(parts);
    }
    
    return {
      strategy: 'convention',
      contextId,
      confidence: 0.9, // High confidence for file path
      metadata: { filePath, parts },
    };
  }
  
  /**
   * Strategy 2: React component tree detection (runtime)
   * 
   * Reads from a React Context (NavigationContext) if available
   */
  private detectContextByReactTree(toolId: string, componentName: string): ContextDetection | null {
    // This would integrate with a React Context provider
    // For now, return null (requires React integration)
    
    // Example of what this would look like:
    // const context = React.useContext(NavigationContext);
    // return context ? { strategy: 'react-tree', contextId: context.current, confidence: 1.0 } : null;
    
    return null;
  }
  
  /**
   * Strategy 3: DOM observation (fallback)
   * 
   * Infers context from DOM hierarchy (data-nav-context attributes)
   */
  private detectContextByDOM(toolId: string, element: Element): ContextDetection | null {
    // Walk up the DOM tree looking for data-nav-context attribute
    let current: Element | null = element;
    
    while (current) {
      const contextId = current.getAttribute('data-nav-context');
      if (contextId) {
        return {
          strategy: 'dom-observation',
          contextId,
          confidence: 0.8,
          metadata: { element: current.tagName },
        };
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  /**
   * Auto-create nested contexts from path parts
   */
  private autoCreateNestedContexts(parts: string[]): void {
    let parentId: string | undefined = undefined;
    let currentPath = '';
    
    for (const part of parts) {
      currentPath += (currentPath ? '.' : '') + part;
      
      if (!this.contexts.has(currentPath)) {
        this.registerContext({
          id: currentPath,
          name: part.charAt(0).toUpperCase() + part.slice(1),
          parent: parentId,
          children: [],
          tools: [],
          metadata: { autoCreated: true },
        });
      }
      
      parentId = currentPath;
    }
  }
  
  /**
   * Get the context where a tool is available
   */
  getToolContext(toolId: string): string | null {
    return this.toolContextMap.get(toolId) ?? null;
  }
  
  /**
   * Get current active context
   */
  getCurrentContext(): string {
    return this.currentContext;
  }
  
  /**
   * Set current active context
   */
  setCurrentContext(contextId: string): void {
    if (!this.contexts.has(contextId)) {
      console.warn(`Cannot set current context: "${contextId}" does not exist`);
      return;
    }
    this.currentContext = contextId;
  }
  
  /**
   * Wait for context to change to a specific value (with timeout)
   */
  waitForContextChange(expectedContext: string, timeoutMs = 3000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.currentContext === expectedContext) {
        resolve(true);
        return;
      }
      
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (this.currentContext === expectedContext) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > timeoutMs) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100); // Poll every 100ms
    });
  }
  
  /**
   * Compute navigation path from A to B using Dijkstra's algorithm
   */
  computePath(from: string, to: string, options?: PathComputeOptions): NavigationPath | null {
    const maxDepth = options?.maxDepth ?? 10;
    const avoidContexts = new Set(options?.avoidContexts ?? []);
    
    // Validate contexts exist
    if (!this.contexts.has(from) || !this.contexts.has(to)) {
      return null;
    }
    
    // Already at target
    if (from === to) {
      return {
        from,
        to,
        steps: [],
        totalCost: 0,
        estimatedTime: 0,
      };
    }
    
    // Dijkstra's algorithm
    const distances = new Map<string, number>();
    const previous = new Map<string, { context: string; edge: NavigationEdge }>();
    const unvisited = new Set<string>();
    
    // Initialize
    for (const context of this.contexts.keys()) {
      distances.set(context, Infinity);
      unvisited.add(context);
    }
    distances.set(from, 0);
    
    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: string | null = null;
      let smallestDistance = Infinity;
      
      for (const node of unvisited) {
        const dist = distances.get(node)!;
        if (dist < smallestDistance) {
          smallestDistance = dist;
          current = node;
        }
      }
      
      if (current === null || smallestDistance === Infinity) {
        break; // No path exists
      }
      
      if (current === to) {
        break; // Found shortest path
      }
      
      unvisited.delete(current);
      
      // Check depth limit
      const currentDepth = this.getPathDepth(current, previous);
      if (currentDepth >= maxDepth) {
        continue;
      }
      
      // Update neighbors
      const outgoingEdges = this.edges.filter((e) => e.from === current);
      
      for (const edge of outgoingEdges) {
        if (avoidContexts.has(edge.to)) {
          continue; // Skip avoided contexts
        }
        
        const alt = distances.get(current)! + (edge.cost ?? 1);
        
        if (alt < distances.get(edge.to)!) {
          distances.set(edge.to, alt);
          previous.set(edge.to, { context: current, edge });
        }
      }
    }
    
    // Reconstruct path
    if (!previous.has(to)) {
      return null; // No path found
    }
    
    const steps: NavigationEdge[] = [];
    let current = to;
    
    while (current !== from) {
      const prev = previous.get(current);
      if (!prev) break;
      
      steps.unshift(prev.edge);
      current = prev.context;
    }
    
    return {
      from,
      to,
      steps,
      totalCost: distances.get(to)!,
      estimatedTime: steps.length * 500, // Estimate 500ms per step
    };
  }
  
  /**
   * Get depth of a path
   */
  private getPathDepth(
    current: string,
    previous: Map<string, { context: string; edge: NavigationEdge }>
  ): number {
    let depth = 0;
    let node = current;
    
    while (previous.has(node)) {
      depth++;
      node = previous.get(node)!.context;
    }
    
    return depth;
  }
  
  /**
   * Get all contexts
   */
  getAllContexts(): NavigationContext[] {
    return Array.from(this.contexts.values());
  }
  
  /**
   * Get context by ID
   */
  getContext(contextId: string): NavigationContext | undefined {
    return this.contexts.get(contextId);
  }
  
  /**
   * Get all edges
   */
  getAllEdges(): NavigationEdge[] {
    return [...this.edges];
  }
  
  /**
   * Clear all navigation data (for testing)
   */
  clear(): void {
    this.contexts.clear();
    this.edges = [];
    this.toolContextMap.clear();
    this.currentContext = 'global';
    
    // Re-register global context
    this.registerContext({
      id: 'global',
      name: 'Global',
      children: [],
      tools: [],
    });
  }
}



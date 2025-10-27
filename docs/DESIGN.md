# Supernal Interface - Universal AI Tool and Test System

**Package Name**: `@supernal-interface/core`  
**Vision**: Universal system for making any application AI-controllable and auto-testable

## 🎯 Vision: Universal System for Any Application

Create `@supernal-interface/` - a package that **any application can install** to instantly get:
1. **AI-controllable interface** through natural language
2. **Auto-generated testing** with Playwright
3. **Zero maintenance** - just add decorators to existing methods

This builds on and extends supernal-command's proven architecture to work **universally**.

## 🧩 Core Architecture (Universal Extension of Supernal-Command)

### Universal Package Structure
```
@supernal-interface/core              # Universal npm package
├── core/                             # Core system (copies + extends supernal-command)
│   ├── decorators/                   # Enhanced decorators
│   │   ├── Tool.ts                   # Copy + enhance from supernal-command
│   │   ├── ToolProvider.ts           # New: Class-level decorator
│   │   └── index.ts                  # Exports
│   ├── registry/                     # Universal tool registry
│   │   ├── ToolRegistry.ts           # Enhanced from supernal-command
│   │   ├── ToolExecutor.ts           # Universal executor
│   │   └── ToolCatalog.ts            # Tool discovery
│   └── types/                        # Universal types
│       ├── UniversalTool.ts          # Enhanced tool interface
│       └── ExecutionContext.ts       # Execution context
├── generators/                       # Auto-generation system
│   ├── ComponentGenerator.ts         # Generate ComponentNames from decorators
│   ├── SimulationGenerator.ts        # Extend supernal's generator
│   ├── ToolGenerator.ts              # Generate tools from components
│   └── TestGenerator.ts              # Generate Playwright tests
├── execution/                        # Universal execution engines
│   ├── PlaywrightExecutor.ts         # For testing (like supernal)
│   ├── DOMExecutor.ts                # For live UI (like supernal)
│   └── APIExecutor.ts                # For backend methods
├── integration/                      # Chat/AI integration
│   ├── UniversalChatInterface.ts     # Natural language interface
│   ├── ToolDiscovery.ts              # AI tool discovery
│   └── IntentParser.ts               # Parse natural language
└── cli/                              # Command-line tools
    ├── generate.ts                   # Generate tests/docs
    └── init.ts                       # Initialize in project
```

## 🔧 Universal Decorators (Enhanced from Supernal-Command)

### Copy and Enhance Existing Tool Decorator

```typescript
// @ai-tools/universal/src/core/decorators/Tool.ts
// COPY the entire Tool.ts from supernal-command and ENHANCE it

import { 
  ToolCategory, 
  ToolFrequency, 
  ToolComplexity,
  ToolConfig as BaseToolConfig,
  ToolMetadata as BaseToolMetadata
} from '@supernal-command/types';

// ENHANCED: Add universal fields to existing config
export interface UniversalToolConfig extends BaseToolConfig {
  // Original supernal-command fields (keep all)
  name?: string;
  description?: string;
  category?: ToolCategory;
  inputSchema?: any;
  outputSchema?: any;
  returnType?: 'markdown' | 'json';
  supportsStreaming?: boolean;
  tags?: string[];
  keywords?: string[];
  useCases?: string[];
  permissions?: any;
  frequency?: ToolFrequency;
  complexity?: ToolComplexity;
  
  // NEW: Universal fields for any application
  testId?: string;                    // UI element identifier
  uiSelector?: string;                // CSS selector
  examples?: string[];                // Natural language examples
  aiDescription?: string;             // AI-optimized description
  executionContext?: 'ui' | 'api' | 'both';  // Where this tool runs
  mockData?: any;                     // Mock data for testing
  testScenarios?: TestScenario[];     // Pre-defined test cases
  
  // NEW: AI Control vs Testing distinction
  toolType?: 'test-only' | 'ai-safe' | 'ai-restricted' | 'ai-dangerous';
  aiEnabled?: boolean;                // Default: false (test-only)
  requiresApproval?: boolean;         // Requires human approval before AI execution
  dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'destructive';
}

export interface TestScenario {
  name: string;
  description: string;
  setup?: () => Promise<void>;
  execute: (params?: any) => Promise<any>;
  verify: (result: any) => Promise<boolean>;
  cleanup?: () => Promise<void>;
}

export interface UniversalToolMetadata extends UniversalToolConfig {
  methodName: string;
  method: Function;
  providerClass: string;
}

export interface UniversalExecutionContext {
  mode: 'test' | 'live';
  source?: 'testing' | 'ai' | 'human';
  page?: any;  // Playwright page
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

/**
 * Universal @Tool decorator - enhances supernal-command's @Tool
 * Works for UI elements, API methods, any function
 */
export function Tool(config: UniversalToolConfig = {}) {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    // COPY all the original supernal-command logic
    const methodName = typeof propertyKey === 'string' ? propertyKey : String(propertyKey);
    
    // Enhanced metadata with universal fields
    const universalMetadata: UniversalToolMetadata = {
      // All original supernal-command fields
      methodName,
      name: config.name || formatMethodName(propertyKey),
      description: config.description || formatMethodName(propertyKey),
      category: config.category || inferCategoryFromMethodName(methodName),
      inputSchema: config.inputSchema || generateInputSchemaFromMethod(descriptor.value),
      outputSchema: config.outputSchema || generateBasicOutputSchema(),
      returnType: config.returnType || 'json',
      supportsStreaming: config.supportsStreaming || false,
      tags: config.tags || [target.constructor.name.toLowerCase()],
      keywords: config.keywords || [methodName],
      useCases: config.useCases || generateUseCases(methodName),
      permissions: config.permissions || inferPermissions(methodName),
      frequency: config.frequency || inferFrequency(methodName),
      complexity: config.complexity || ToolComplexity.SIMPLE,
      
      // NEW: Universal enhancements
      testId: config.testId || generateTestId(target.constructor.name, methodName),
      uiSelector: config.uiSelector,
      examples: config.examples || generateNaturalLanguageExamples(methodName),
      aiDescription: config.aiDescription || generateAIDescription(methodName, config.description),
      executionContext: config.executionContext || inferExecutionContext(methodName),
      mockData: config.mockData,
      testScenarios: config.testScenarios || generateDefaultTestScenarios(methodName),
      
      // NEW: AI Control vs Testing distinction - SAFE DEFAULTS
      toolType: config.toolType || inferToolType(methodName),
      aiEnabled: config.aiEnabled || false,  // Default: test-only
      dangerLevel: config.dangerLevel || inferDangerLevel(methodName),
      requiresApproval: config.requiresApproval || shouldRequireApproval(methodName, config.dangerLevel),
      
      // Method reference for execution
      method: descriptor.value,
      providerClass: target.constructor.name
    };
    
    // Register with universal registry
    UniversalToolRegistry.registerTool(target.constructor.name, methodName, universalMetadata);
    
    // KEEP original supernal-command registration for compatibility
    if (!target.constructor.prototype.__tools__) {
      target.constructor.prototype.__tools__ = [];
    }
    target.constructor.prototype.__tools__.push(universalMetadata);
  };
}

/**
 * @ToolProvider decorator - marks classes as tool providers
 */
export function ToolProvider(category: string, config?: {
  description?: string;
  baseUrl?: string;
  authentication?: 'none' | 'api-key' | 'oauth';
  executionContext?: 'ui' | 'api' | 'both';
}) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    UniversalToolRegistry.registerProvider(category, constructor, config);
    return constructor;
  };
}

// COPY all helper functions from supernal-command and enhance them
function generateTestId(className: string, methodName: string): string {
  return `${className.toLowerCase().replace(/service|manager|provider/g, '')}-${methodName.toLowerCase().replace(/([A-Z])/g, '-$1')}`;
}

function generateNaturalLanguageExamples(methodName: string): string[] {
  const examples = [];
  const name = methodName.toLowerCase();
  
  // Navigation examples
  if (name.includes('navigate') || name.includes('goto')) {
    const target = name.replace('navigateto', '').replace('goto', '');
    examples.push(`go to ${target}`, `navigate to ${target}`, `open ${target}`);
  }
  
  // CRUD examples
  if (name.startsWith('create')) {
    const entity = name.replace('create', '');
    examples.push(`create ${entity}`, `add new ${entity}`, `make ${entity}`);
  }
  
  if (name.startsWith('approve')) {
    examples.push('approve this', 'accept it', 'give approval');
  }
  
  if (name.startsWith('search')) {
    const entity = name.replace('search', '');
    examples.push(`search ${entity}`, `find ${entity}`, `look for ${entity}`);
  }
  
  if (name.startsWith('delete') || name.startsWith('remove')) {
    examples.push('delete this', 'remove it', 'get rid of it');
  }
  
  return examples.length > 0 ? examples : [`execute ${formatMethodName(methodName)}`];
}

function generateAIDescription(methodName: string, description?: string): string {
  const baseDesc = description || formatMethodName(methodName);
  const name = methodName.toLowerCase();
  
  let aiDesc = baseDesc;
  
  if (name.includes('navigate')) {
    aiDesc += '. This changes the current page or view.';
  }
  
  if (name.startsWith('approve')) {
    aiDesc += '. This action updates the status to approved.';
  }
  
  if (name.startsWith('delete') || name.startsWith('remove')) {
    aiDesc += '. This is a destructive action that cannot be undone.';
  }
  
  if (name.startsWith('search') || name.startsWith('find')) {
    aiDesc += '. Returns matching results based on search criteria.';
  }
  
  return aiDesc;
}

function inferExecutionContext(methodName: string): 'ui' | 'api' | 'both' {
  const name = methodName.toLowerCase();
  
  if (name.includes('navigate') || name.includes('click') || name.includes('type')) {
    return 'ui';
  }
  
  if (name.includes('create') || name.includes('update') || name.includes('delete') || name.includes('fetch')) {
    return 'api';
  }
  
  return 'both';
}

function inferToolType(methodName: string): 'test-only' | 'ai-safe' | 'ai-restricted' | 'ai-dangerous' {
  const name = methodName.toLowerCase();
  
  // Dangerous operations - test-only by default
  if (name.includes('delete') || name.includes('remove') || name.includes('destroy')) {
    return 'ai-dangerous';
  }
  
  // Restricted operations - require explicit enabling
  if (name.includes('create') || name.includes('update') || name.includes('modify') || 
      name.includes('approve') || name.includes('reject') || name.includes('assign')) {
    return 'ai-restricted';
  }
  
  // Safe operations - can be AI-enabled
  if (name.includes('get') || name.includes('fetch') || name.includes('search') || 
      name.includes('find') || name.includes('list') || name.includes('view') ||
      name.includes('navigate') || name.includes('show')) {
    return 'ai-safe';
  }
  
  // Default: test-only until explicitly configured
  return 'test-only';
}

function inferDangerLevel(methodName: string): 'safe' | 'moderate' | 'dangerous' | 'destructive' {
  const name = methodName.toLowerCase();
  
  // Destructive operations
  if (name.includes('delete') || name.includes('remove') || name.includes('destroy') || 
      name.includes('purge') || name.includes('wipe')) {
    return 'destructive';
  }
  
  // Dangerous operations
  if (name.includes('approve') || name.includes('reject') || name.includes('ban') || 
      name.includes('suspend') || name.includes('disable')) {
    return 'dangerous';
  }
  
  // Moderate operations
  if (name.includes('create') || name.includes('update') || name.includes('modify') || 
      name.includes('assign') || name.includes('change')) {
    return 'moderate';
  }
  
  // Safe operations (read-only, navigation)
  return 'safe';
}

function shouldRequireApproval(methodName: string, dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'destructive'): boolean {
  const level = dangerLevel || inferDangerLevel(methodName);
  
  // Always require approval for dangerous/destructive operations
  if (level === 'dangerous' || level === 'destructive') {
    return true;
  }
  
  // Require approval for certain moderate operations
  if (level === 'moderate') {
    const name = methodName.toLowerCase();
    if (name.includes('approve') || name.includes('reject') || name.includes('assign')) {
      return true;
    }
  }
  
  return false;
}

function generateInputSchemaFromMethod(method: Function): any {
  // Enhanced: Try to infer parameters from method signature
  const methodStr = method.toString();
  const paramMatch = methodStr.match(/\(([^)]*)\)/);
  
  if (paramMatch && paramMatch[1].trim()) {
    const params = paramMatch[1].split(',').map(p => p.trim());
    const properties: any = {};
    
    params.forEach(param => {
      const paramName = param.split(':')[0].trim();
      const paramType = param.split(':')[1]?.trim() || 'string';
      
      properties[paramName] = {
        type: paramType.includes('string') ? 'string' :
              paramType.includes('number') ? 'number' :
              paramType.includes('boolean') ? 'boolean' : 'string',
        description: `${paramName} parameter`
      };
    });
    
    return {
      type: 'object',
      properties,
      required: params.map(p => p.split(':')[0].trim())
    };
  }
  
  return {
    type: 'object',
    properties: {},
    required: []
  };
}

// COPY all other helper functions from supernal-command...
```

## 🚀 Implementation Plan

### Phase 1: Copy and Enhance Core from Supernal-Command

**What we can directly copy:**
- `/families/supernal-command/packages/core/src/decorators/Tool.ts` (236 lines) - **COPY 100%**
- `/families/supernal-command/packages/core/src/decorators/index.ts` (8 lines) - **COPY 100%**
- `/families/supernal-command/packages/types/src/tools/` (all files) - **COPY 90%**

**Files to copy and locations:**
```bash
# 1. Create package structure
mkdir -p packages/@supernal-interface/core/src/{decorators,registry,types,generators,execution,integration,cli}

# 2. Copy core decorators (DIRECT COPY)
cp /families/supernal-command/packages/core/src/decorators/Tool.ts \
   packages/@supernal-interface/core/src/decorators/Tool.ts

cp /families/supernal-command/packages/core/src/decorators/index.ts \
   packages/@supernal-interface/core/src/decorators/index.ts

# 3. Copy types (COPY + ENHANCE)
cp -r /families/supernal-command/packages/types/src/tools/ \
      packages/@supernal-interface/core/src/types/

# 4. Copy tests
cp -r /families/supernal-command/packages/core/src/decorators/__tests__/ \
      packages/@supernal-interface/core/src/decorators/__tests__/
```

### Phase 2: Enhance with AI Safety Controls

**Modifications to copied files:**
1. **Tool.ts**: Add AI safety fields to `ToolConfig` and `ToolMetadata`
2. **Types**: Extend with `UniversalToolConfig`, `UniversalExecutionContext`, etc.
3. **Registry**: Create `UniversalToolRegistry` with AI control methods

### Phase 3: Add Universal Capabilities

**New files to create:**
1. `ToolProvider.ts` - Class-level decorator
2. `UniversalToolRegistry.ts` - Enhanced registry with AI controls
3. `ToolExecutor.ts` - Execution engine with safety checks
4. `ComponentGenerator.ts` - Auto-generate from decorators
5. `TestGenerator.ts` - Auto-generate Playwright tests

### Phase 4: Integration Layer

**AI Interface files:**
1. `UniversalChatInterface.ts` - Natural language interface
2. `ToolDiscovery.ts` - AI tool discovery
3. `IntentParser.ts` - Parse natural language commands

## 🛡️ AI Control vs Testing Strategy

**Key Principle**: Everything can be tested, but AI control requires explicit opt-in.

### Default Behavior
- **All tools are `test-only` by default** - can be tested but not AI-controlled
- **AI control requires explicit `aiEnabled: true`**
- **Dangerous operations require approval even when AI-enabled**

### Tool Types
```typescript
// Examples of automatic classification:

@Tool()  // Automatically: test-only, safe
async getUserList() { /* read-only - safe for testing */ }

@Tool()  // Automatically: ai-dangerous, destructive, requiresApproval: true
async deleteUser(id: string) { /* destructive - test-only by default */ }

@Tool({ aiEnabled: true })  // Explicitly AI-enabled safe operation
async searchUsers(query: string) { /* safe + AI-enabled */ }

@Tool({ aiEnabled: true, requiresApproval: false })  // Override approval
async createUser(data: UserData) { /* moderate but AI-enabled */ }
```

### Usage Patterns
```typescript
// 1. TESTING: All tools can be tested regardless of AI settings
const testResult = await ToolExecutor.executeForTesting('deleteUser', { id: 'test-123' });

// 2. AI EXECUTION: Only AI-enabled tools can be executed by AI
const aiResult = await ToolExecutor.executeForAI('searchUsers', { query: 'john' });
// ❌ This would fail: ToolExecutor.executeForAI('deleteUser', { id: 'real-123' });

// 3. APPROVAL FLOW: Dangerous operations require approval
const approvalRequest = await ToolExecutor.requestApproval('deleteUser', { id: 'real-123' });
// Human approves...
const result = await ToolExecutor.executeWithApproval(approvalRequest.id);
```

### Real-World Example

```typescript
// Admin Dashboard with AI-safe defaults
class UserManagementProvider {
  
  @Tool()  // Default: test-only, safe
  async getUserList(filters?: UserFilters) {
    // Safe read operation - can be tested, not AI-controlled by default
    return await this.userService.getUsers(filters);
  }
  
  @Tool({ aiEnabled: true })  // Explicitly AI-enabled
  async searchUsers(query: string) {
    // Safe search - AI can use this
    return await this.userService.search(query);
  }
  
  @Tool()  // Default: ai-restricted, moderate, test-only
  async updateUserProfile(userId: string, data: ProfileData) {
    // Moderate operation - test-only by default
    return await this.userService.updateProfile(userId, data);
  }
  
  @Tool({ aiEnabled: true, requiresApproval: false })  // Override for AI
  async approveUserRegistration(userId: string) {
    // Dangerous but explicitly AI-enabled without approval
    return await this.userService.approve(userId);
  }
  
  @Tool()  // Default: ai-dangerous, destructive, requiresApproval: true
  async deleteUser(userId: string) {
    // Destructive - test-only, requires approval even if AI-enabled
    return await this.userService.delete(userId);
  }
}

// Usage in tests (always works):
await UniversalToolRegistry.executeForTesting('UserManagement.deleteUser', { userId: 'test-123' });

// Usage by AI (only works for AI-enabled tools):
await UniversalToolRegistry.executeForAI('UserManagement.searchUsers', { query: 'john' });
// ❌ This fails: executeForAI('UserManagement.deleteUser', { userId: 'real-123' });

// Approval flow for dangerous operations:
const approval = await UniversalToolRegistry.requestApproval('UserManagement.deleteUser', { userId: 'real-123' });
// Human reviews and approves...
// await UniversalToolRegistry.executeWithApproval(approval.id);
```

## 🏗️ Universal Tool Registry (Enhanced from Supernal-Command)

```typescript
// @ai-tools/universal/src/core/registry/ToolRegistry.ts
export class UniversalToolRegistry {
  private static providers = new Map<string, UniversalToolProvider>();
  private static tools = new Map<string, UniversalToolMetadata>();
  private static instances = new Map<string, any>();
  
  /**
   * Register a universal tool provider
   */
  static registerProvider(category: string, providerClass: any, config?: any) {
    const provider: UniversalToolProvider = {
      category,
      class: providerClass,
      config: config || {},
      tools: [],
      executionContext: config?.executionContext || 'both'
    };
    
    this.providers.set(category, provider);
    console.log(`🤖 Registered Universal Tool Provider: ${category}`);
  }
  
  /**
   * Register a universal tool
   */
  static registerTool(providerName: string, methodName: string, metadata: UniversalToolMetadata) {
    const toolKey = `${providerName}.${methodName}`;
    this.tools.set(toolKey, metadata);
    
    // Add to provider's tool list
    const provider = this.findProviderByClass(providerName);
    if (provider) {
      provider.tools.push(metadata);
    }
    
    console.log(`🔧 Registered Universal Tool: ${metadata.name} (${metadata.executionContext})`);
  }
  
  /**
   * Execute a tool for TESTING (always allowed)
   */
  static async executeForTesting(
    toolIdentifier: string, 
    parameters: any = {}
  ): Promise<UniversalToolResult> {
    return this.executeTool(toolIdentifier, parameters, { mode: 'test', source: 'testing' });
  }

  /**
   * Execute a tool for AI (only if AI-enabled)
   */
  static async executeForAI(
    toolIdentifier: string, 
    parameters: any = {}
  ): Promise<UniversalToolResult> {
    const tool = this.findToolByIdentifier(toolIdentifier);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolIdentifier} not found`,
        tool: toolIdentifier
      };
    }
    
    if (!tool.aiEnabled) {
      return {
        success: false,
        error: `Tool ${toolIdentifier} is not AI-enabled. Use executeForTesting() instead.`,
        tool: toolIdentifier
      };
    }
    
    if (tool.requiresApproval) {
      return {
        success: false,
        error: `Tool ${toolIdentifier} requires approval. Use requestApproval() first.`,
        tool: toolIdentifier,
        requiresApproval: true
      };
    }
    
    return this.executeTool(toolIdentifier, parameters, { mode: 'live', source: 'ai' });
  }

  /**
   * Request approval for dangerous AI operations
   */
  static async requestApproval(
    toolIdentifier: string, 
    parameters: any = {}
  ): Promise<{ id: string; tool: string; params: any; timestamp: Date }> {
    const tool = this.findToolByIdentifier(toolIdentifier);
    
    if (!tool) {
      throw new Error(`Tool ${toolIdentifier} not found`);
    }
    
    if (!tool.aiEnabled) {
      throw new Error(`Tool ${toolIdentifier} is not AI-enabled`);
    }
    
    const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store approval request (in real implementation, this would go to a queue/database)
    console.log(`🚨 APPROVAL REQUIRED: ${toolIdentifier} with params:`, parameters);
    console.log(`Approval ID: ${approvalId}`);
    
    return {
      id: approvalId,
      tool: toolIdentifier,
      params: parameters,
      timestamp: new Date()
    };
  }

  /**
   * Execute tool universally (UI, API, or both) - INTERNAL METHOD
   */
  static async executeTool(
    toolIdentifier: string, 
    parameters: any = {},
    context?: UniversalExecutionContext
  ): Promise<UniversalToolResult> {
    try {
      const tool = this.findToolByIdentifier(toolIdentifier);
      if (!tool) {
        throw new Error(`Tool not found: ${toolIdentifier}`);
      }
      
      // Choose executor based on context
      const executor = this.getExecutor(tool.executionContext, context);
      
      // Execute with appropriate executor
      return await executor.execute(tool, parameters, context);
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        tool: toolIdentifier
      };
    }
  }
  
  /**
   * Get appropriate executor for tool
   */
  private static getExecutor(
    toolContext: 'ui' | 'api' | 'both', 
    executionContext?: UniversalExecutionContext
  ): UniversalExecutor {
    
    if (executionContext?.page) {
      // Playwright context - use UI executor
      return new PlaywrightExecutor(executionContext.page);
    }
    
    if (executionContext?.isLiveBrowser) {
      // Live browser - use DOM executor
      return new DOMExecutor();
    }
    
    // Default to API executor
    return new APIExecutor();
  }
  
  /**
   * Generate universal tool catalog
   */
  static generateUniversalCatalog(): UniversalToolCatalog {
    const catalog: UniversalToolCatalog = {
      providers: {},
      tools: [],
      totalTools: this.tools.size,
      categories: {},
      executionContexts: { ui: [], api: [], both: [] },
      naturalLanguageIndex: {}
    };
    
    for (const [toolKey, tool] of this.tools) {
      const [providerName] = toolKey.split('.');
      const provider = this.findProviderByClass(providerName);
      
      // Group by provider
      if (!catalog.providers[provider.category]) {
        catalog.providers[provider.category] = [];
      }
      
      // Group by category
      if (!catalog.categories[tool.category]) {
        catalog.categories[tool.category] = [];
      }
      
      const toolInfo = {
        name: tool.name,
        description: tool.aiDescription,
        examples: tool.examples,
        parameters: this.extractParameterInfo(tool.inputSchema),
        category: tool.category,
        provider: provider.category,
        executionContext: tool.executionContext,
        testId: tool.testId,
        complexity: tool.complexity,
        frequency: tool.frequency
      };
      
      catalog.providers[provider.category].push(toolInfo);
      catalog.categories[tool.category].push(toolInfo);
      catalog.executionContexts[tool.executionContext].push(toolInfo);
      catalog.tools.push(toolInfo);
      
      // Build natural language index
      for (const example of tool.examples) {
        catalog.naturalLanguageIndex[example.toLowerCase()] = tool.name;
      }
    }
    
    return catalog;
  }
  
  /**
   * Find tool by natural language or exact name
   */
  private static findToolByIdentifier(identifier: string): UniversalToolMetadata | null {
    const lowerIdentifier = identifier.toLowerCase();
    
    // Try exact name match first
    for (const [key, tool] of this.tools) {
      if (tool.name.toLowerCase() === lowerIdentifier) {
        return tool;
      }
    }
    
    // Try natural language examples
    for (const [key, tool] of this.tools) {
      for (const example of tool.examples) {
        if (this.matchesNaturalLanguage(example, lowerIdentifier)) {
          return tool;
        }
      }
    }
    
    // Try keywords and tags
    for (const [key, tool] of this.tools) {
      const allKeywords = [...tool.keywords, ...tool.tags];
      if (allKeywords.some(keyword => 
        this.matchesKeyword(keyword, lowerIdentifier)
      )) {
        return tool;
      }
    }
    
    return null;
  }
  
  private static matchesNaturalLanguage(example: string, command: string): boolean {
    return example.toLowerCase().includes(command) || 
           command.includes(example.toLowerCase()) ||
           this.calculateSimilarity(example.toLowerCase(), command) > 0.7;
  }
  
  private static calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation - could be enhanced
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}
```

## 🚀 Universal Executors

```typescript
// @ai-tools/universal/src/execution/PlaywrightExecutor.ts
export class PlaywrightExecutor implements UniversalExecutor {
  constructor(private page: Page) {}
  
  async execute(
    tool: UniversalToolMetadata, 
    parameters: any, 
    context?: UniversalExecutionContext
  ): Promise<UniversalToolResult> {
    
    if (tool.executionContext === 'api') {
      // For API tools in Playwright, call the actual method
      return await this.executeMethod(tool, parameters);
    }
    
    // For UI tools, use Playwright API
    return await this.executeUI(tool, parameters);
  }
  
  private async executeUI(tool: UniversalToolMetadata, parameters: any): Promise<UniversalToolResult> {
    try {
      const selector = tool.uiSelector || `[data-testid="${tool.testId}"]`;
      const element = this.page.locator(selector);
      
      await element.waitFor({ state: 'visible', timeout: 5000 });
      
      // Infer action from tool metadata
      if (tool.name.toLowerCase().includes('click') || tool.category === ToolCategory.USER_INTERACTION) {
        await element.click();
        return { success: true, result: { action: 'clicked', element: tool.testId } };
      }
      
      if (tool.name.toLowerCase().includes('type') && parameters.text) {
        await element.clear();
        await element.type(parameters.text);
        return { success: true, result: { action: 'typed', text: parameters.text, element: tool.testId } };
      }
      
      if (tool.name.toLowerCase().includes('select') && parameters.value) {
        await element.selectOption(parameters.value);
        return { success: true, result: { action: 'selected', value: parameters.value, element: tool.testId } };
      }
      
      // Default: click
      await element.click();
      return { success: true, result: { action: 'clicked', element: tool.testId } };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private async executeMethod(tool: UniversalToolMetadata, parameters: any): Promise<UniversalToolResult> {
    try {
      // Get provider instance
      const instance = await this.getProviderInstance(tool.providerClass);
      
      // Convert parameters to array
      const paramArray = this.convertParametersToArray(tool.inputSchema, parameters);
      
      // Execute method
      const result = await tool.method.apply(instance, paramArray);
      
      return {
        success: true,
        result,
        tool: tool.name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// @ai-tools/universal/src/execution/DOMExecutor.ts  
export class DOMExecutor implements UniversalExecutor {
  async execute(
    tool: UniversalToolMetadata, 
    parameters: any, 
    context?: UniversalExecutionContext
  ): Promise<UniversalToolResult> {
    
    if (tool.executionContext === 'api') {
      // For API tools in live browser, make HTTP calls
      return await this.executeAPI(tool, parameters);
    }
    
    // For UI tools, manipulate DOM directly
    return await this.executeDOM(tool, parameters);
  }
  
  private async executeDOM(tool: UniversalToolMetadata, parameters: any): Promise<UniversalToolResult> {
    try {
      const selector = tool.uiSelector || `[data-testid="${tool.testId}"]`;
      const element = document.querySelector(selector);
      
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      // Execute based on tool type
      if (tool.name.toLowerCase().includes('click')) {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return { success: true, result: { action: 'clicked', element: tool.testId } };
      }
      
      if (tool.name.toLowerCase().includes('type') && parameters.text) {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.value = parameters.text;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, result: { action: 'typed', text: parameters.text } };
        }
      }
      
      if (tool.name.toLowerCase().includes('select') && parameters.value) {
        if (element instanceof HTMLSelectElement) {
          element.value = parameters.value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, result: { action: 'selected', value: parameters.value } };
        }
      }
      
      // Default: click
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { success: true, result: { action: 'clicked' } };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// @ai-tools/universal/src/execution/APIExecutor.ts
export class APIExecutor implements UniversalExecutor {
  async execute(
    tool: UniversalToolMetadata, 
    parameters: any, 
    context?: UniversalExecutionContext
  ): Promise<UniversalToolResult> {
    
    try {
      // Get provider instance
      const instance = await this.getProviderInstance(tool.providerClass);
      
      // Convert parameters to method arguments
      const paramArray = this.convertParametersToArray(tool.inputSchema, parameters);
      
      // Execute the actual method
      const result = await tool.method.apply(instance, paramArray);
      
      return {
        success: true,
        result,
        tool: tool.name,
        executionContext: 'api'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
```

## 📦 Usage in Any Application

### Installation
```bash
npm install @ai-tools/universal
```

### Usage Example 1: Admin Dashboard
```typescript
import { Tool, ToolProvider } from '@ai-tools/universal';

@ToolProvider('user-management')
export class UserService {
  
  @Tool({
    description: 'Approve a pending user registration',
    testId: 'approve-user-button',
    examples: ['approve user john@example.com', 'accept the user', 'give approval'],
    executionContext: 'both'  // Works in UI and API
  })
  async approveUser(userEmail: string): Promise<{ success: boolean }> {
    // Your existing logic
    return { success: true };
  }
  
  @Tool({
    description: 'Navigate to users page',
    testId: 'nav-users',
    examples: ['go to users', 'open users page', 'show users'],
    executionContext: 'ui'
  })
  async navigateToUsers(): Promise<void> {
    window.location.href = '/users';
  }
}
```

### Usage Example 2: E-commerce Site
```typescript
@ToolProvider('shopping')
export class ShoppingService {
  
  @Tool({
    description: 'Add item to shopping cart',
    testId: 'add-to-cart-button',
    examples: ['add to cart', 'buy this', 'add this item'],
    executionContext: 'both'
  })
  async addToCart(productId: string, quantity: number = 1): Promise<{ success: boolean }> {
    // Your cart logic
    return { success: true };
  }
}
```

### Usage Example 3: Any Web App
```typescript
@ToolProvider('navigation')
export class NavigationService {
  
  @Tool({
    description: 'Search for content',
    testId: 'search-input',
    examples: ['search for products', 'find items', 'look for content'],
    executionContext: 'ui'
  })
  async search(query: string): Promise<void> {
    // Search logic
  }
}
```

## 🤖 AI Integration

```typescript
// Any app can now use AI
import { UniversalChatInterface } from '@ai-tools/universal/integration';

const aiTools = new UniversalChatInterface();

// AI can execute any decorated method
await aiTools.processCommand('approve user john@example.com');
await aiTools.processCommand('add this to cart');
await aiTools.processCommand('search for red shoes');
```

## 🧪 Auto-Generated Testing

```typescript
// Generate tests for any app
import { generateUniversalTests } from '@ai-tools/universal/generators';

// Automatically generates Playwright tests for all @Tool decorated methods
generateUniversalTests('./tests/generated');
```

## 📋 Implementation Plan

### Phase 1: Core Universal System (2 hours)
1. **Copy supernal-command decorators** and enhance (45 min)
2. **Create universal registry** and executors (45 min)
3. **Package setup** and exports (30 min)

### Phase 2: Universal Generators (1.5 hours)
1. **Test generation** for any decorated method (45 min)
2. **Component generation** from decorators (45 min)

### Phase 3: AI Integration (1 hour)
1. **Natural language interface** (30 min)
2. **Tool discovery** and documentation (30 min)

### Phase 4: CLI Tools (30 min)
1. **Init command** to set up in any project (15 min)
2. **Generate command** for tests/docs (15 min)

**Total: 5 hours for universal system**

## 🎯 Key Benefits

1. **Universal**: Works with ANY TypeScript/JavaScript application
2. **Zero Maintenance**: Add decorators → get AI tools + tests automatically
3. **Builds on Proven Architecture**: Extends supernal-command's battle-tested patterns
4. **Natural Language**: AI discovers and executes tools via conversation
5. **Comprehensive Testing**: Auto-generated Playwright tests
6. **Multiple Execution Contexts**: UI (Playwright/DOM) and API methods

This creates a **truly universal system** that any application can install to become AI-controllable and auto-testable!

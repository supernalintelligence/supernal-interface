# Supernal Interface - Universal AI Tool and Test System Architecture

**Package**: `@supernal-interface/core`  
**Version**: 1.0.0  
**Status**: Active Development

## 🎯 Vision

Create a **universal system** for making any application AI-controllable and auto-testable. A single `@Tool` decorator enables:

1. **AI-controllable interface** through natural language
2. **Auto-generated testing** with Playwright
3. **Interactive UI widgets** with immediate feedback
4. **Programmatic tool execution** with full metadata
5. **Zero maintenance** - just add decorators to existing methods

## 📋 Table of Contents

- [Core Concepts](#core-concepts)
- [Architecture Overview](#architecture-overview)
- [Tool Decorator System](#tool-decorator-system)
- [Exposure Detection & State Management](#exposure-detection--state-management)
- [Execution Engines](#execution-engines)
- [Natural Language Integration](#natural-language-integration)
- [Auto-Generated Testing](#auto-generated-testing)
- [Gherkin Integration](#gherkin-integration)
- [Tutorial Orchestration](#tutorial-orchestration)
- [Demo System Requirements](#demo-system-requirements)
- [Implementation Roadmap](#implementation-roadmap)

## Core Concepts

### Universal Tool System

The `@Tool` decorator transforms any method into a universally accessible tool that can be:
- **Executed directly** via UI interaction
- **Called programmatically** through the tool registry
- **Triggered by AI** through natural language commands
- **Tested automatically** with generated Playwright tests

### Builds on Supernal-Command

This system extends and enhances the proven `supernal-command` architecture:
- **Copies** the core decorator system from `supernal-command/packages/core/src/decorators/`
- **Enhances** with AI safety controls, exposure detection, and testing metadata
- **Maintains compatibility** with existing supernal-command patterns
- **Adds universal capabilities** for any application to integrate

### AI Safety by Default

```typescript
// Default: test-only (can be tested but not AI-controlled)
@Tool()
async deleteUser(userId: string) { }

// Explicitly AI-enabled for safe operations
@Tool({ aiEnabled: true })
async searchUsers(query: string) { }

// Dangerous operations require approval even when AI-enabled
@Tool({ aiEnabled: true, requiresApproval: true })
async approveUserRegistration(userId: string) { }
```

## Architecture Overview

### Package Structure

```
@supernal-interface/core
├── src/
│   ├── decorators/              # Enhanced decorators (from supernal-command)
│   │   ├── Tool.ts             # Enhanced @Tool decorator
│   │   ├── ToolProvider.ts     # @ToolProvider class decorator
│   │   └── index.ts            # Exports
│   ├── registry/               # Universal tool registry
│   │   ├── ToolRegistry.ts     # Central tool registry
│   │   ├── ToolExecutor.ts     # Universal executor
│   │   └── ToolCatalog.ts      # Tool discovery
│   ├── execution/              # Execution engines
│   │   ├── PlaywrightExecutor.ts  # For testing
│   │   ├── DOMExecutor.ts         # For live UI
│   │   └── APIExecutor.ts         # For backend methods
│   ├── exposure/               # Exposure detection
│   │   ├── ExposureDetector.ts    # Element state detection
│   │   ├── ExposureCollector.ts   # Central state registry
│   │   └── ExposureAwareTool.ts   # Tool wrapper with state emission
│   ├── generators/             # Auto-generation system
│   │   ├── TestGenerator.ts       # Generate Playwright tests
│   │   ├── SimulationGenerator.ts # Generate simulation classes
│   │   └── ComponentGenerator.ts  # Generate component definitions
│   ├── integration/            # AI integration
│   │   ├── ChatInterface.ts       # Natural language interface
│   │   ├── ToolDiscovery.ts       # AI tool discovery
│   │   └── IntentParser.ts        # Parse natural language
│   ├── chains/                 # Workflow chains
│   │   ├── GherkinParser.ts       # Parse Gherkin scenarios
│   │   ├── ChainGenerator.ts      # Generate tool chains
│   │   └── ChainExecutor.ts       # Execute workflows
│   ├── tutorial/               # Tutorial system
│   │   ├── TutorialEngine.ts      # Workflow orchestration
│   │   ├── VisualGuidance.ts      # Element highlighting
│   │   └── ProgressTracker.ts     # User progress tracking
│   └── types/                  # TypeScript definitions
│       ├── Tool.ts                # Tool metadata types
│       ├── Execution.ts           # Execution context types
│       ├── Exposure.ts            # Exposure state types
│       └── index.ts               # Type exports
├── demo/                       # Demo application
│   ├── src/
│   │   ├── components/         # Demo UI components
│   │   ├── tools/              # Tool implementations
│   │   └── pages/              # Demo pages
│   └── tests/                  # E2E tests
└── docs/                       # Documentation
    ├── ARCHITECTURE.md         # This file
    ├── GETTING_STARTED.md      # Quick start guide
    ├── API_REFERENCE.md        # API documentation
    └── EXAMPLES.md             # Usage examples
```

### System Flow

```mermaid
graph TB
    subgraph "User Interaction Layer"
        UI[UI Widgets]
        TOOLS[Tool Commands]
        CHAT[Chat Interface]
    end
    
    subgraph "@Tool Decorator System"
        DECORATOR[@Tool Decorator]
        REGISTRY[Tool Registry]
        METADATA[Tool Metadata]
    end
    
    subgraph "Exposure Management"
        DETECTOR[Exposure Detector]
        COLLECTOR[State Collector]
        EVENTS[Event Bus]
    end
    
    subgraph "Execution Layer"
        PLAYWRIGHT[Playwright Executor]
        DOM[DOM Executor]
        API[API Executor]
    end
    
    subgraph "Results & Feedback"
        STATE[State Management]
        FEEDBACK[Visual Feedback]
        LOGS[Execution Logs]
    end
    
    UI --> DECORATOR
    TOOLS --> DECORATOR
    CHAT --> DECORATOR
    
    DECORATOR --> REGISTRY
    DECORATOR --> DETECTOR
    
    REGISTRY --> METADATA
    DETECTOR --> COLLECTOR
    COLLECTOR --> EVENTS
    
    REGISTRY --> PLAYWRIGHT
    REGISTRY --> DOM
    REGISTRY --> API
    
    PLAYWRIGHT --> STATE
    DOM --> STATE
    API --> STATE
    
    STATE --> FEEDBACK
    STATE --> LOGS
    
    FEEDBACK --> UI
    FEEDBACK --> TOOLS
    FEEDBACK --> CHAT
```

## Tool Decorator System

### Enhanced @Tool Decorator

Copied from `supernal-command` and enhanced with universal capabilities:

```typescript
import { 
  ToolCategory, 
  ToolFrequency, 
  ToolComplexity 
} from './types';

export interface ToolConfig {
  // Original supernal-command fields
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
  
  // Universal enhancements
  testId?: string;                    // UI element identifier
  uiSelector?: string;                // CSS selector
  examples?: string[];                // Natural language examples
  aiDescription?: string;             // AI-optimized description
  executionContext?: 'ui' | 'api' | 'both';
  mockData?: any;                     // Mock data for testing
  testScenarios?: TestScenario[];     // Pre-defined test cases
  
  // AI safety controls
  toolType?: 'test-only' | 'ai-safe' | 'ai-restricted' | 'ai-dangerous';
  aiEnabled?: boolean;                // Default: false
  requiresApproval?: boolean;         // Requires human approval
  dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'destructive';
}

export function Tool(config: ToolConfig = {}) {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    // Original supernal-command logic + universal enhancements
    const methodName = typeof propertyKey === 'string' ? propertyKey : String(propertyKey);
    
    const metadata: ToolMetadata = {
      methodName,
      name: config.name || formatMethodName(propertyKey),
      description: config.description || formatMethodName(propertyKey),
      
      // Auto-infer safety settings
      toolType: config.toolType || inferToolType(methodName),
      aiEnabled: config.aiEnabled ?? false,  // Defaults to test-only
      dangerLevel: config.dangerLevel || inferDangerLevel(methodName),
      requiresApproval: config.requiresApproval ?? shouldRequireApproval(methodName),
      
      // Auto-generate testing metadata
      testId: config.testId || generateTestId(target.constructor.name, methodName),
      examples: config.examples || generateNaturalLanguageExamples(methodName),
      aiDescription: config.aiDescription || generateAIDescription(methodName, config.description),
      
      // Method reference
      method: descriptor.value,
      providerClass: target.constructor.name
    };
    
    // Register with universal registry
    ToolRegistry.registerTool(target.constructor.name, methodName, metadata);
  };
}
```

### @ToolProvider Decorator

```typescript
export function ToolProvider(category: string, config?: {
  description?: string;
  baseUrl?: string;
  authentication?: 'none' | 'api-key' | 'oauth';
  executionContext?: 'ui' | 'api' | 'both';
  testSetup?: () => Promise<void>;
  testTeardown?: () => Promise<void>;
}) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    ToolRegistry.registerProvider(category, constructor, config);
    return constructor;
  };
}
```

### Automatic Safety Classification

```typescript
function inferToolType(methodName: string): ToolType {
  const name = methodName.toLowerCase();
  
  // Dangerous operations - test-only by default
  if (name.includes('delete') || name.includes('remove') || name.includes('destroy')) {
    return 'ai-dangerous';
  }
  
  // Restricted operations - require explicit enabling
  if (name.includes('create') || name.includes('update') || name.includes('approve')) {
    return 'ai-restricted';
  }
  
  // Safe operations - can be AI-enabled
  if (name.includes('get') || name.includes('search') || name.includes('navigate')) {
    return 'ai-safe';
  }
  
  return 'test-only';
}

function inferDangerLevel(methodName: string): DangerLevel {
  const name = methodName.toLowerCase();
  
  if (name.includes('delete') || name.includes('destroy') || name.includes('purge')) {
    return 'destructive';
  }
  
  if (name.includes('approve') || name.includes('reject') || name.includes('ban')) {
    return 'dangerous';
  }
  
  if (name.includes('create') || name.includes('update') || name.includes('modify')) {
    return 'moderate';
  }
  
  return 'safe';
}
```

## Exposure Detection & State Management

### Event-Driven Exposure System

Tools self-report their state instead of relying on complex external detection:

```typescript
enum ExposureState {
  NOT_PRESENT = 0,    // Element doesn't exist in DOM
  PRESENT = 1,        // Element exists but may not be visible
  VISIBLE = 2,        // Element has dimensions and is not hidden
  EXPOSED = 3,        // Element is visible to user (no overlays)
  INTERACTABLE = 4,   // Element can be clicked/used right now
  ACCESSIBLE = 5      // Element meets accessibility requirements
}

interface ToolStateEvent {
  toolId: string;
  state: ExposureState;
  timestamp: number;
  metadata?: {
    reason?: string;
    blockers?: string[];
    position?: DOMRect;
    confidence?: number;
  };
}
```

### Exposure-Aware Tool Wrapper

```typescript
class ExposureAwareTool {
  private toolId: string;
  private element: HTMLElement;
  private currentState: ExposureState = ExposureState.NOT_PRESENT;
  private observer: IntersectionObserver;
  
  constructor(toolId: string, element: HTMLElement) {
    this.toolId = toolId;
    this.element = element;
    this.setupObservers();
  }
  
  private setupObservers() {
    // IntersectionObserver for visibility
    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const newState = this.calculateState(entry);
      
      if (newState !== this.currentState) {
        this.currentState = newState;
        this.emit(newState);
      }
    }, {
      threshold: [0, 0.1, 0.5, 1.0]
    });
    
    this.observer.observe(this.element);
    
    // MutationObserver for attribute changes
    new MutationObserver((mutations) => {
      const relevantChange = mutations.some(m => 
        m.type === 'attributes' && 
        ['disabled', 'aria-disabled', 'class', 'style'].includes(m.attributeName)
      );
      
      if (relevantChange) {
        const newState = this.calculateCurrentState();
        if (newState !== this.currentState) {
          this.currentState = newState;
          this.emit(newState);
        }
      }
    }).observe(this.element, {
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'class', 'style']
    });
  }
  
  private emit(state: ExposureState) {
    const event: ToolStateEvent = {
      toolId: this.toolId,
      state,
      timestamp: Date.now(),
      metadata: {
        reason: this.getStateReason(state),
        position: this.element.getBoundingClientRect(),
        confidence: 0.95
      }
    };
    
    ExposureCollector.getInstance().handleStateChange(event);
  }
}
```

### Central Exposure Collector

```typescript
class ExposureCollector {
  private static instance: ExposureCollector;
  private stateRegistry = new Map<string, ToolStateEvent>();
  private eventBus = new EventTarget();
  
  // Tools emit their state changes here
  handleStateChange(event: ToolStateEvent) {
    this.stateRegistry.set(event.toolId, event);
    this.notifySubscribers(event);
    this.eventBus.dispatchEvent(new CustomEvent('tool-state-change', {
      detail: { event }
    }));
  }
  
  // Get current state of any tool
  getToolState(toolId: string): ToolStateEvent | null {
    return this.stateRegistry.get(toolId) || null;
  }
  
  // Get all interactable tools
  getInteractableTools(): ToolStateEvent[] {
    return Array.from(this.stateRegistry.values())
      .filter(event => event.state === ExposureState.INTERACTABLE);
  }
  
  // Wait for tool to reach specific state
  async waitForState(toolId: string, targetState: ExposureState, timeout = 5000): Promise<boolean> {
    const currentState = this.getToolState(toolId);
    if (currentState && currentState.state >= targetState) {
      return true;
    }
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), timeout);
      
      const callback = (event: ToolStateEvent) => {
        if (event.toolId === toolId && event.state >= targetState) {
          clearTimeout(timeoutId);
          resolve(true);
        }
      };
      
      this.subscribe(callback, toolId);
    });
  }
}
```

## Execution Engines

### Universal Executor Interface

```typescript
interface UniversalExecutor {
  execute(
    tool: ToolMetadata,
    parameters: any,
    context?: ExecutionContext
  ): Promise<ToolResult>;
}
```

### Playwright Executor (for testing)

```typescript
export class PlaywrightExecutor implements UniversalExecutor {
  constructor(private page: Page) {}
  
  async execute(tool: ToolMetadata, parameters: any): Promise<ToolResult> {
    if (tool.executionContext === 'ui') {
      return await this.executeUI(tool, parameters);
    } else {
      return await this.executeMethod(tool, parameters);
    }
  }
  
  private async executeUI(tool: ToolMetadata, parameters: any): Promise<ToolResult> {
    const selector = tool.uiSelector || `[data-testid="${tool.testId}"]`;
    const element = this.page.locator(selector);
    
    await element.waitFor({ state: 'visible', timeout: 5000 });
    
    if (tool.name.toLowerCase().includes('click')) {
      await element.click();
      return { success: true, result: { action: 'clicked' } };
    }
    
    // Handle other interaction types...
    return { success: true, result: {} };
  }
}
```

### DOM Executor (for live UI)

```typescript
export class DOMExecutor implements UniversalExecutor {
  async execute(tool: ToolMetadata, parameters: any): Promise<ToolResult> {
    const selector = tool.uiSelector || `[data-testid="${tool.testId}"]`;
    const element = document.querySelector(selector) as HTMLElement;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    if (tool.name.toLowerCase().includes('click')) {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { success: true, result: { action: 'clicked' } };
    }
    
    // Handle other interaction types...
    return { success: true, result: {} };
  }
}
```

### API Executor (for backend methods)

```typescript
export class APIExecutor implements UniversalExecutor {
  async execute(tool: ToolMetadata, parameters: any): Promise<ToolResult> {
    // Get provider instance
    const instance = await this.getProviderInstance(tool.providerClass);
    
    // Convert parameters to method arguments
    const paramArray = this.convertParametersToArray(tool.inputSchema, parameters);
    
    // Execute the actual method
    const result = await tool.method.apply(instance, paramArray);
    
    return {
      success: true,
      result,
      tool: tool.name
    };
  }
}
```

## Natural Language Integration

### Chat Interface

```typescript
export class ChatInterface {
  private executor: ToolExecutor;
  private catalog: ToolCatalog;
  
  async processCommand(command: string, context?: any): Promise<ToolResult> {
    // Parse intent from command
    const intent = this.parseIntent(command);
    
    // Find matching tool
    const tool = this.findBestMatch(intent);
    
    if (!tool) {
      return {
        success: false,
        error: `No tool found for: "${command}"`,
        suggestions: this.getSuggestions(command)
      };
    }
    
    // Extract parameters from command
    const parameters = this.extractParameters(command, tool);
    
    // Execute tool
    return await this.executor.executeTool(tool.name, parameters, context);
  }
  
  getAvailableTools(): string {
    // Generate markdown documentation of all available tools
    let output = "# Available AI Tools\n\n";
    
    for (const [category, tools] of Object.entries(this.catalog.categories)) {
      output += `## ${category.toUpperCase()}\n\n`;
      
      for (const tool of tools) {
        output += `### ${tool.name}\n`;
        output += `**Description:** ${tool.description}\n\n`;
        output += `**Examples:**\n`;
        for (const example of tool.examples) {
          output += `- "${example}"\n`;
        }
        output += '\n';
      }
    }
    
    return output;
  }
}
```

### Intent Parser

```typescript
class IntentParser {
  parseIntent(command: string): ParsedIntent {
    const lowerCommand = command.toLowerCase();
    
    // Extract action verbs
    const actionVerbs = ['navigate', 'go', 'open', 'create', 'add', 'approve', 
                         'reject', 'delete', 'search', 'find', 'list', 'show'];
    const action = actionVerbs.find(verb => lowerCommand.includes(verb));
    
    // Extract entities
    const entities = ['user', 'project', 'card', 'client', 'dashboard'];
    const entity = entities.find(ent => lowerCommand.includes(ent));
    
    return {
      action,
      entity,
      originalCommand: command,
      confidence: (action ? 0.5 : 0) + (entity ? 0.5 : 0)
    };
  }
}
```

## Auto-Generated Testing

### Test Generation

```typescript
export class TestGenerator {
  static generatePlaywrightTests(outputDir: string = './tests/generated'): void {
    const catalog = ToolRegistry.generateCatalog();
    
    for (const [provider, tools] of Object.entries(catalog.providers)) {
      const testContent = this.generateProviderTestSuite(provider, tools);
      const fileName = `${provider.replace(/[^a-zA-Z0-9]/g, '-')}.spec.ts`;
      
      fs.writeFileSync(
        path.join(outputDir, fileName),
        testContent
      );
    }
  }
  
  private static generateProviderTestSuite(provider: string, tools: any[]): string {
    return `/**
 * Auto-Generated Test Suite for ${provider}
 * DO NOT EDIT MANUALLY
 */

import { test, expect } from '@playwright/test';

test.describe('${provider} Tools', () => {
${tools.map(tool => this.generateToolTest(tool)).join('\n\n')}
});`;
  }
  
  private static generateToolTest(tool: any): string {
    return `  test('${tool.name} - ${tool.description}', async ({ page }) => {
    await page.goto('/');
    
    // Test natural language execution
    const executor = new ToolExecutor(page);
    const result = await executor.execute('${tool.examples[0]}');
    
    expect(result.success).toBe(true);
    
    ${tool.testId ? `
    // Test UI interaction
    const element = page.locator('[data-testid="${tool.testId}"]');
    await expect(element).toBeVisible();
    ` : ''}
  });`;
  }
}
```

## Gherkin Integration

### Scenario to Tool Chain Mapping

```typescript
interface GherkinScenario {
  feature: string;
  scenario: string;
  steps: GherkinStep[];
  tags: string[];
}

interface ToolChain {
  id: string;
  name: string;
  steps: ToolChainStep[];
  preconditions: Condition[];
  postconditions: Condition[];
  alternativePaths: ToolChain[];
}

class GherkinToToolMapper {
  async parseScenario(scenario: GherkinScenario): Promise<ToolChain[]> {
    // 1. Extract entities and actions from natural language
    // 2. Match to registered tools using semantic similarity
    // 3. Generate parameter mappings
    // 4. Create multiple execution paths
    // 5. Add validation and error handling
    
    const chains: ToolChain[] = [];
    
    for (const step of scenario.steps) {
      const tool = await this.findMatchingTool(step.text);
      if (tool) {
        chains.push({
          id: generateChainId(),
          name: `${scenario.scenario} - ${step.text}`,
          steps: [{ toolId: tool.name, parameters: this.extractParams(step.text) }],
          preconditions: [],
          postconditions: [],
          alternativePaths: []
        });
      }
    }
    
    return chains;
  }
}
```

## Tutorial Orchestration

### Tutorial Engine

```typescript
interface TutorialWorkflow {
  id: string;
  name: string;
  steps: TutorialStep[];
  adaptiveRules: AdaptiveRule[];
}

interface TutorialStep {
  id: string;
  title: string;
  toolChain: ToolChain;
  visualHighlight: HighlightConfig;
  userValidation: ValidationConfig;
}

class TutorialEngine {
  async startTutorial(workflow: TutorialWorkflow) {
    const collector = ExposureCollector.getInstance();
    
    for (const step of workflow.steps) {
      // Wait for tool to be available
      const toolId = step.toolChain.steps[0].toolId;
      await collector.waitForState(toolId, ExposureState.INTERACTABLE);
      
      // Highlight the tool
      this.highlightTool(toolId, step.visualHighlight);
      
      // Wait for user to complete
      await this.waitForUserAction(toolId);
    }
  }
}
```

## Demo System Requirements

The demo application showcases three interconnected interaction methods:

### 1. Interactive UI Widgets (REQ-001)

**Component Zoo**: A clean showcase of standard UI widgets (buttons, forms, checkboxes, etc.) that are directly wrapped with `@Tool` decorators.

**Key Features**:
- Immediate visual feedback on interaction
- Direct `@Tool` method execution
- State reflection in UI
- Accessibility compliance

### 2. Extracted Tool Commands (REQ-002)

**Tool Discovery Interface**: Shows all registered `@Tool` methods with their metadata.

**Key Features**:
- Comprehensive tool listing with categories
- Direct programmatic execution
- Metadata display (description, parameters, examples)
- Approval workflows for dangerous operations
- Execution history and logs

### 3. Natural Language Chat Interface (REQ-003)

**Conversational Control**: AI-powered chat interface for tool execution.

**Key Features**:
- Natural language command parsing
- Fuzzy tool matching
- Parameter extraction from context
- Conversational feedback
- Help and discovery system

### Unified Architecture

All three interfaces produce **identical results** for the same tool:

```typescript
// Same tool, three ways to execute:

// 1. UI Widget
<button onClick={() => approveUser('john@example.com')}>Approve</button>

// 2. Programmatic
await ToolRegistry.executeTool('approveUser', { email: 'john@example.com' });

// 3. Natural Language
await chatInterface.process('approve user john@example.com');
```

## Implementation Roadmap

### Phase 1: Core Package (Weeks 1-3)
- Copy and enhance supernal-command decorators
- Create universal registry and executors
- Package setup and exports
- Basic exposure detection

### Phase 2: Testing Infrastructure (Weeks 4-5)
- Auto-generate Playwright tests
- Create simulation classes
- Parameter validation tests
- CI/CD integration

### Phase 3: AI Integration (Weeks 6-7)
- Natural language interface
- Intent parsing
- Tool discovery
- Documentation generation

### Phase 4: Demo System (Weeks 8-10)
- Interactive UI widgets (REQ-001)
- Extracted tool commands (REQ-002)
- Natural language chat (REQ-003)
- End-to-end testing

### Phase 5: Advanced Features (Weeks 11-15)
- Enhanced exposure detection with event system
- Gherkin integration
- Tutorial orchestration
- Performance optimization

## Success Metrics

### Technical Metrics
- **Tool Discovery Accuracy**: > 95% correct matching
- **Exposure Detection Reliability**: < 1% false positives
- **Execution Consistency**: 100% identical results across interfaces
- **Response Time**: < 500ms for any tool execution
- **Test Coverage**: > 90% scenario coverage

### Developer Experience
- **Easy Integration**: < 30 minutes to add first tool
- **Clear Documentation**: Comprehensive examples and guides
- **Type Safety**: Full TypeScript support
- **Minimal Boilerplate**: Single decorator for full functionality

## Security & Safety

### AI Safety Framework
- **Default test-only**: All tools require explicit AI enabling
- **Approval workflows**: Human oversight for dangerous operations
- **Audit logging**: Complete traceability
- **Rate limiting**: Prevent abuse

### Data Privacy
- **Minimal collection**: Only necessary execution data
- **Anonymized analytics**: No personal information
- **GDPR compliance**: Right to deletion and portability

## References

- [Getting Started Guide](./GETTING_STARTED.md)
- [API Reference](./API_REFERENCE.md)
- [Examples](./EXAMPLES.md)
- [Demo Requirements](../supernal-coding/requirements/EPIC-supernal-interface-demo-system.md)

---

**Last Updated**: 2025-01-27  
**Document Version**: 1.0.0  
**Status**: Living Document


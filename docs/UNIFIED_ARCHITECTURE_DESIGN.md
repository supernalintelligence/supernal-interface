# Unified Architecture: AI Interface + Testing Tools

## 🎯 Core Insight

**AI controlling the program** and **Tests controlling the program** are the **same fundamental problem**:

- **Component Discovery** - Find UI elements in code
- **Interface Generation** - Create programmatic interfaces  
- **Action Execution** - Perform actions (click, type, navigate)

## 🏗️ Unified Architecture Design

### Single Package: `@supernal-interface/core`

Instead of separate packages, we create **one universal system** with **multiple execution contexts**:

```typescript
@Tool({ 
  testId: 'chat-input',  // Generic, no SUPERNAL_ prefix required
  aiEnabled: true 
})
async typeChatInput(text: string) {
  // Same method works for:
  // 1. AI execution (live DOM)
  // 2. Test execution (Playwright)  
  // 3. Simulation generation
}
```

## 📦 Unified Package Structure

```
@supernal-interface/core/
├── src/
│   ├── decorators/
│   │   ├── Tool.ts                    # Enhanced with discovery integration
│   │   └── ToolProvider.ts            # Class-level configuration
│   ├── discovery/                     # Copied from testing-tools
│   │   ├── ComponentDiscovery.ts      # Generic component discovery
│   │   ├── ComponentScanner.ts        # Scan React files for usage
│   │   └── InferenceEngine.ts         # Infer element types/actions
│   ├── generation/                    # Enhanced from testing-tools
│   │   ├── SimulationGenerator.ts     # Generate test simulations
│   │   ├── ToolGenerator.ts           # Generate from @Tool decorators
│   │   └── InterfaceGenerator.ts      # Generate AI interfaces
│   ├── execution/                     # Multi-context execution
│   │   ├── PlaywrightExecutor.ts      # Test execution
│   │   ├── DOMExecutor.ts             # Live AI execution
│   │   └── SimulationExecutor.ts      # Generated simulation execution
│   ├── registry/
│   │   └── UniversalToolRegistry.ts   # Central registry for all contexts
│   ├── stories/                       # Copied from testing-tools
│   │   ├── StoryGenerator.ts          # Generate test stories
│   │   └── StoryTemplates.ts          # Reusable story patterns
│   └── integration/
│       ├── UniversalChatInterface.ts  # AI natural language interface
│       └── TestingIntegration.ts      # Testing framework integration
```

## 🔧 Implementation Strategy

### Phase 1: Copy & Integrate Testing-Tools

```bash
# Copy the generic/decoupled parts from testing-tools
cp -r /families/supernal-command/packages/testing-tools/src/discovery/ \
      packages/@supernal-interface/core/src/discovery/

cp -r /families/supernal-command/packages/testing-tools/src/decoupling/ \
      packages/@supernal-interface/core/src/discovery/generic/

cp -r /families/supernal-command/packages/testing-tools/src/generation/ \
      packages/@supernal-interface/core/src/generation/

cp -r /families/supernal-command/packages/testing-tools/src/story/ \
      packages/@supernal-interface/core/src/stories/
```

### Phase 2: Enhance Tool Decorator

```typescript
// Enhanced @Tool decorator that integrates with discovery
@Tool({
  // Auto-discovery integration
  testId: 'chat-input',           // Generic naming (no SUPERNAL_ required)
  elementType: 'input',           // Auto-inferred from discovery
  actionType: 'type',             // Auto-inferred from method name
  
  // AI control
  aiEnabled: true,
  dangerLevel: 'safe',
  
  // Testing integration  
  generateSimulation: true,       // Auto-generate simulation methods
  generateStories: true,          // Auto-generate test stories
  
  // Framework integration
  frameworks: ['playwright', 'cypress', 'selenium']
})
async typeChatInput(text: string) {
  // Implementation works across all contexts
}
```

### Phase 3: Universal Execution System

```typescript
// Single method, multiple execution contexts
class UniversalExecutor {
  // AI execution (live DOM)
  async executeForAI(toolId: string, params: any) {
    return this.domExecutor.execute(toolId, params);
  }
  
  // Test execution (Playwright)
  async executeForTesting(toolId: string, params: any) {
    return this.playwrightExecutor.execute(toolId, params);
  }
  
  // Simulation execution (generated methods)
  async executeSimulation(toolId: string, params: any) {
    return this.simulationExecutor.execute(toolId, params);
  }
}
```

### Phase 4: Auto-Generation Integration

```typescript
// Generate everything from @Tool decorators
class UniversalGenerator {
  // Generate test simulations (from testing-tools)
  generateSimulation(toolProviders: ToolProvider[]) {
    return this.simulationGenerator.generateFromDecorators(toolProviders);
  }
  
  // Generate test stories (from testing-tools)  
  generateStories(toolProviders: ToolProvider[]) {
    return this.storyGenerator.generateFromDecorators(toolProviders);
  }
  
  // Generate AI interfaces (new)
  generateAIInterface(toolProviders: ToolProvider[]) {
    return this.interfaceGenerator.generateFromDecorators(toolProviders);
  }
}
```

## 🎯 Configuration System

### Generic Configuration (No SUPERNAL_ Required)

```typescript
// Universal configuration for any project
const config: UniversalInterfaceConfig = {
  // Component discovery
  componentPrefix: '',              // No prefix required
  testIdAttribute: 'data-testid',   // Standard attribute
  
  // Generation settings
  generateSimulation: true,         // Auto-generate test simulations
  generateStories: true,            // Auto-generate test stories  
  generateAIInterface: true,        // Auto-generate AI interfaces
  
  // Framework integration
  testFramework: 'playwright',      // or 'cypress', 'selenium'
  aiFramework: 'dom',              // or 'puppeteer', 'webdriver'
  
  // Output settings
  outputDir: 'src/generated',
  simulationClassName: 'AppSimulation',
  storyClassName: 'AppStories'
};
```

### Framework Presets

```typescript
// Preset configurations for popular frameworks
const FRAMEWORK_PRESETS = {
  'react': {
    componentPrefix: 'COMPONENT_',
    testIdAttribute: 'data-testid',
    simulationClassName: 'ReactSimulation'
  },
  
  'vue': {
    componentPrefix: 'VUE_',
    testIdAttribute: 'data-cy',
    simulationClassName: 'VueSimulation'
  },
  
  'angular': {
    componentPrefix: 'NG_',
    testIdAttribute: 'data-test',
    simulationClassName: 'AngularSimulation'
  }
};
```

## 🚀 Usage Examples

### 1. Define Components (Generic)

```typescript
// ComponentNames.ts (any naming convention)
export const CHAT_INPUT = 'chat-input';
export const SEND_BUTTON = 'send-button';
export const USER_LIST = 'user-list';

// Or with prefixes if desired
export const MY_CHAT_INPUT = 'my-chat-input';
export const MY_SEND_BUTTON = 'my-send-button';
```

### 2. Create Tool Providers

```typescript
@ToolProvider({ category: 'chat' })
class ChatProvider {
  
  @Tool({ 
    testId: CHAT_INPUT,
    aiEnabled: true 
  })
  async typeMessage(text: string) {
    // Works for both AI and testing
  }
  
  @Tool({ 
    testId: SEND_BUTTON,
    aiEnabled: true 
  })
  async sendMessage() {
    // Works for both AI and testing
  }
}
```

### 3. Auto-Generate Everything

```bash
# Single command generates:
# - Test simulations
# - Test stories  
# - AI interfaces
# - Documentation
npx @supernal-interface/core generate
```

### 4. Use in Tests

```typescript
// Auto-generated simulation
const simulation = new AppSimulation(page);
await simulation.typeMessage('Hello');
await simulation.sendMessage();

// Auto-generated stories
await runStory('send-chat-message', simulation);
```

### 5. Use with AI

```typescript
// Natural language AI interface
const ai = new UniversalChatInterface();
await ai.execute({ text: "type hello and send message" });
// Automatically finds and executes the right tools
```

## 🎯 Benefits of Unified Architecture

### 1. **Single Source of Truth**
- One @Tool decorator defines everything
- No duplication between AI and testing systems
- Consistent behavior across all contexts

### 2. **Framework Agnostic**
- Works with React, Vue, Angular, etc.
- No SUPERNAL_ prefix requirement
- Configurable naming conventions

### 3. **Auto-Generation**
- Tests, simulations, and AI interfaces all generated from same decorators
- No manual maintenance of parallel systems
- Always in sync

### 4. **Universal Execution**
- Same tools work for AI control and testing
- Consistent API across contexts
- Easy to switch between execution modes

## 🔧 Migration Path

### From Existing Systems

```typescript
// Old: Separate systems
// testing-tools generates simulations
// AI interface generates tools
// Manual duplication

// New: Unified system
@Tool({ testId: 'chat-input', aiEnabled: true })
async typeMessage(text: string) {
  // Single definition
  // Auto-generates simulations, stories, AI interfaces
  // Works in all contexts
}
```

This unified architecture eliminates the need for separate packages while providing all the functionality of both systems in a cohesive, maintainable way.

# @supernal-interface/core - Working Demo & Landing Page

🎯 **This is a REAL working demo** that uses the actual `@supernal-interface/core` system to demonstrate AI-controllable interfaces.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

**Demo URL:** http://localhost:3011 (or next available port)

## 🎮 What This Demo Shows

### 1. **Real @Tool Decorators**
- Actual TypeScript classes with `@Tool` decorators
- Real tool registration with the `ToolRegistry`
- Working AI interface that finds and executes tools

### 2. **AI Command Interface**
- Natural language commands: "open menu", "show code", "run test"
- Real tool discovery using `ToolRegistry.searchTools()`
- Safety controls with approval workflows for dangerous actions

### 3. **Interactive UI Elements**
- Navigation controls (open/close menu)
- Demo controls (generate code, run tests, reset)
- Chat interface (send messages, clear history)
- Admin actions (delete data - requires approval)

### 4. **Auto-Generated UI Elements**
- **Tool Visualization**: Cards showing all available AI tools with metadata
- **Auto-Testing System**: Automatically tests all @Tool methods
- **Real-time Statistics**: Live data from the ToolRegistry
- **Safety Indicators**: Visual danger levels and approval requirements

### 5. **Comprehensive Testing**
- **Playwright Integration**: Auto-generated test suites from decorators
- **Element Verification**: Checks that UI elements exist for each tool
- **Action Testing**: Safely tests click, type, select actions
- **Safety Testing**: Verifies dangerous actions require approval

## 🔧 How It Works

### 1. Tool Providers Register Methods

```typescript
@ToolProvider({ category: 'navigation', executionContext: 'ui' })
export class NavigationProvider {
  
  @Tool({
    testId: 'open-main-menu',
    description: 'Open the main navigation menu',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['open menu', 'show navigation']
  })
  async openMainMenu(): Promise<{ success: boolean; message: string }> {
    // Real implementation that works in both AI and testing contexts
    const menuButton = safeQuerySelector('[data-testid="open-main-menu"]');
    menuButton?.click();
    return { success: true, message: 'Menu opened successfully' };
  }
}
```

### 2. AI Interface Finds and Executes Tools

```typescript
export class DemoAIInterface {
  findToolsForCommand(query: string): AICommand {
    // Uses actual ToolRegistry to search for matching tools
    const matchingTools = ToolRegistry.searchTools(query);
    // Returns best match with confidence scoring
  }
  
  async executeCommand(command: AICommand): Promise<AIResponse> {
    // Executes the actual tool method with safety checks
    // Handles approval workflows for dangerous actions
  }
}
```

### 3. Safety Controls

- **🟢 Safe**: AI executes immediately (`dangerLevel: 'safe'`)
- **🟡 Moderate**: AI can execute with caution (`dangerLevel: 'moderate'`)
- **🔴 Dangerous**: Requires human approval (`dangerLevel: 'destructive'`)
- **⚫ Test-Only**: AI cannot execute (`aiEnabled: false`)

## 🎯 Try These Commands

### Navigation
- "open menu" → Opens the navigation menu
- "close menu" → Closes the navigation menu
- "go to docs" → Navigates to documentation

### Demo Controls
- "show code" → Displays generated @Tool code
- "run test" → Starts test simulation
- "reset demo" → Resets demo state

### Chat Interface
- "clear chat" → Clears chat messages
- "toggle chat" → Shows/hides chat panel

### Admin Actions (Require Approval)
- "delete data" → Prompts for approval before execution

## 🎮 **New Interactive Features**

### **Available Tools Tab**
- **Visual Tool Cards**: Each @Tool method becomes a visual card
- **Metadata Display**: Shows danger level, AI enablement, examples
- **Action Buttons**: Execute or test tools directly from the UI
- **Filtering**: Filter by AI-enabled, test-only, or category
- **Real-time Stats**: Live tool counts and safety breakdowns

### **Auto-Testing Tab**  
- **One-Click Testing**: Test all tools automatically
- **Safety Modes**: Test safe-only, AI-enabled, or all tools
- **Real-time Results**: See pass/fail status as tests run
- **Element Verification**: Confirms UI elements exist for each tool
- **Action Simulation**: Safely tests interactions without side effects
- **Detailed Reporting**: Shows exactly what passed/failed and why

### **Testing Commands**
```bash
# Run Playwright tests (auto-generated from @Tool decorators)
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed
```

## 📊 Real Tool Statistics

The demo shows live statistics from the actual `ToolRegistry`:

- **Total Tools**: Number of registered @Tool methods
- **AI Enabled**: Tools that AI can execute
- **Test Only**: Tools only for automated testing
- **Require Approval**: Dangerous tools needing human approval

## 🏗️ Architecture

### Browser-Safe Imports
```typescript
// Uses browser-only exports to avoid Node.js dependencies
import { Tool, ToolProvider, ToolRegistry } from '@supernal-interface/core/browser';
```

### Real Tool Registration
```typescript
// Tools are automatically registered when classes are instantiated
new NavigationProvider(); // Registers all @Tool methods
new ChatProvider();       // Registers all @Tool methods
new AdminProvider();      // Registers all @Tool methods
```

### Live Event System
```typescript
// Tools dispatch real DOM events for UI updates
safeDispatchEvent('navigation:menu-opened', { timestamp: new Date().toISOString() });

// React components listen for these events
window.addEventListener('navigation:menu-opened', handleMenuOpened);
```

## 🚀 Deployment

### Static Export
```bash
npm run build  # Generates static files in .next/out/
```

### Production Server
```bash
npm run start  # Runs Next.js production server on port 3010
```

### Environment Variables
The demo works without any environment variables - it's completely self-contained.

## 🔗 Integration

This demo can be deployed as:

1. **Landing Page**: Showcase @supernal-interface/core capabilities
2. **Documentation**: Interactive examples of the system
3. **Testing Ground**: Try AI commands and see real results
4. **Integration Example**: Copy patterns for your own applications

## 📝 Key Files

- `src/providers/DemoToolProviders.ts` - Real @Tool decorated classes
- `src/lib/AIInterface.ts` - AI command processing using ToolRegistry
- `src/pages/index.tsx` - Main landing page with interactive demo
- `src/utils/browserUtils.ts` - Browser-safe DOM utilities

## 🎉 This is NOT a Mock!

Unlike typical demos, this system:

- ✅ Uses the actual `@supernal-interface/core` package
- ✅ Registers real tools with the `ToolRegistry`
- ✅ Executes actual tool methods when AI commands are processed
- ✅ Shows real tool statistics and metadata
- ✅ Demonstrates actual safety controls and approval workflows
- ✅ Can be deployed as a working landing page

**This is the real system in action!** 🚀
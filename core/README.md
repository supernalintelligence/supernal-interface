# @supernal-interface/core

**Equip your AI repositories with tools that make them easy to test and expose as LLM-controllable interfaces**

Transform any method into an AI-controllable tool with simple decorators. Built-in testing ensures your tools work correctly before AI uses them.

## 🚀 Quick Start

```bash
npm install @supernal-interface/core
```

## ✨ Features

- **🎯 Simple Decorators**: Transform methods AND functions into AI tools with `@Tool` decorators
- **🔧 Standalone Functions**: Decorate individual functions without classes
- **🧪 Built-in Testing**: Comprehensive testing validates positive and negative cases
- **🤖 AI-Safe by Default**: Explicit opt-in for AI control with danger levels
- **📝 Natural Language**: AI matches commands using examples and descriptions
- **🎯 Smart Identifiers**: Use `toolId`, `elementId`, `selector` instead of generic `testId`
- **📍 Origin Tracking**: Know exactly where tools are available (path, elements, modals)
- **⚡ Auto-Registration**: Tools automatically register in global registry

## 📖 Basic Usage

### Class-Based Tools (Traditional)

```typescript
import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'ui-controls' })
export class MyTools {
  @Tool({
    toolId: 'save-button',
    description: 'Save user data to database',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['save data', 'store information', 'persist data'],
    origin: {
      path: '/dashboard',
      elements: ['#save-btn', '.save-controls']
    }
  })
  async saveData(data: any): Promise<{ success: boolean; message: string }> {
    // Your implementation
    return { success: true, message: 'Data saved successfully!' };
  }
}
```

### Standalone Functions (NEW!)

```typescript
import { Tool, getStandaloneTools } from '@supernal-interface/core';

@Tool({
  toolId: 'calculate-tax',
  providerName: 'TaxUtils',
  description: 'Calculate tax amount based on income and rate',
  aiEnabled: true,
  dangerLevel: 'safe',
  examples: ['calculate tax for $50000 at 25%', 'compute tax amount'],
  origin: {
    path: '/calculator',
    elements: ['#tax-calculator']
  }
})
function calculateTax(income: number, rate: number): { tax: number; afterTax: number } {
  const tax = income * (rate / 100);
  return {
    tax: Math.round(tax * 100) / 100,
    afterTax: Math.round((income - tax) * 100) / 100
  };
}

// Access all tools from unified registry
import { ToolRegistry } from '@supernal-interface/core';
const allTools = Array.from(ToolRegistry.getAllTools().values());
console.log('Available tools:', allTools.map(t => t.toolId));

// Filter by type if needed
const standaloneTools = allTools.filter(tool => tool.isStandalone);
const classTools = allTools.filter(tool => !tool.isStandalone);
```

## 🎮 Live Demo

Try the interactive demo: [https://supernal-interface-demo.vercel.app](https://supernal-interface-demo.vercel.app)

## 📚 Documentation

### Tool Decorator Options

| Property | Type | Description |
|----------|------|-------------|
| `toolId` | `string` | Unique tool identifier (replaces testId) |
| `elementId` | `string` | DOM element ID for UI tools |
| `selector` | `string` | CSS selector for UI targeting |
| `providerName` | `string` | Provider name for standalone functions |
| `description` | `string` | Human-readable description |
| `aiEnabled` | `boolean` | Whether AI can execute this tool |
| `dangerLevel` | `'safe' \| 'moderate' \| 'dangerous' \| 'destructive'` | Risk level for approval |
| `examples` | `string[]` | Natural language examples for AI matching |
| `origin` | `object` | Where tool is available (path, elements, modal) |

### CLI-Like Tool Discovery

```typescript
import { ToolRegistry } from '@supernal-interface/core';

// Overview of all tools and providers
console.log(ToolRegistry.overview());

// List all tools (like 'ls')
console.log(ToolRegistry.list());

// List tools by provider/class
console.log(ToolRegistry.list({ provider: 'UIControls' }));

// List only AI-enabled tools
console.log(ToolRegistry.list({ aiEnabled: true }));

// Get detailed help for a tool (like 'man')
console.log(ToolRegistry.help('uicontrols.setTheme'));

// Search tools by keyword
console.log(ToolRegistry.find('theme'));

// Get tools by provider programmatically
const uiTools = ToolRegistry.getToolsByProvider('UIControls');
```

### Danger Levels

- **`safe`**: No approval required, safe for AI execution
- **`moderate`**: May require approval for sensitive operations
- **`destructive`**: Always requires approval for dangerous operations

## 🧪 Testing

The system includes comprehensive testing that validates:

- ✅ **Positive cases**: Valid parameters should succeed
- ❌ **Negative cases**: Invalid parameters should fail gracefully
- 🔍 **Edge cases**: Missing parameters and boundary conditions
- 📊 **Real-time feedback**: Progress bars and detailed results

## 🏗️ Architecture

### Core Components

- **`ToolRegistry`**: Central registry for all decorated tools
- **`@Tool`**: Decorator to mark methods as AI-controllable
- **`@ToolProvider`**: Decorator to mark classes as tool providers
- **`ToolMetadata`**: Interface describing registered tools

### Browser Support

```typescript
import { ToolRegistry } from '@supernal-interface/core/browser';

// Search tools by natural language
const tools = ToolRegistry.searchTools('save user data');

// Get all registered tools
const allTools = ToolRegistry.getAllTools();
```

## 🎯 Use Cases

- **🖥️ UI Automation**: Let AI control buttons, forms, and interface elements
- **🔧 DevOps Tools**: Deploy, monitor, and manage infrastructure via AI
- **📊 Data Analysis**: Query databases and generate reports through AI
- **🤖 AI Agents**: Build autonomous agents with safe, testable actions

## 🚀 Deployment

### Vercel Deployment

1. Fork/clone the repository
2. Connect to Vercel
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy

### Local Development

```bash
git clone https://github.com/your-org/supernal-interface
cd supernal-interface/core/demo
npm install
npm run dev
# Runs on http://localhost:3011
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

## 🔗 Links

- [Live Demo](https://supernal-interface-demo.vercel.app)
- [GitHub Repository](https://github.com/your-org/supernal-interface)
- [Documentation](https://supernal-interface-demo.vercel.app/docs)
- [Examples](https://supernal-interface-demo.vercel.app/examples)
- [API Reference](https://supernal-interface-demo.vercel.app/api)
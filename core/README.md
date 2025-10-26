# @supernal-interface/core

**Equip your AI repositories with tools that make them easy to test and expose as LLM-controllable interfaces**

Transform any method into an AI-controllable tool with simple decorators. Built-in testing ensures your tools work correctly before AI uses them.

## 🚀 Quick Start

```bash
npm install @supernal-interface/core
```

## ✨ Features

- **🎯 Simple Decorators**: Transform methods into AI tools with `@Tool` decorators
- **🧪 Built-in Testing**: Comprehensive testing validates positive and negative cases
- **🤖 AI-Safe by Default**: Explicit opt-in for AI control with danger levels
- **📝 Natural Language**: AI matches commands using examples and descriptions
- **🔧 Direct Execution**: No DOM simulation, direct method calls
- **⚡ Auto-Registration**: Tools automatically register in global registry

## 📖 Basic Usage

```typescript
import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'ui-controls' })
export class MyTools {
  @Tool({
    testId: 'save-button',
    description: 'Save user data to database',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['save data', 'store information', 'persist data']
  })
  async saveData(data: any): Promise<{ success: boolean; message: string }> {
    // Your implementation
    return { success: true, message: 'Data saved successfully!' };
  }
}
```

## 🎮 Live Demo

Try the interactive demo: [https://supernal-interface-demo.vercel.app](https://supernal-interface-demo.vercel.app)

## 📚 Documentation

### Tool Decorator Options

| Property | Type | Description |
|----------|------|-------------|
| `testId` | `string` | Unique identifier for testing |
| `description` | `string` | Human-readable description |
| `aiEnabled` | `boolean` | Whether AI can execute this tool |
| `dangerLevel` | `'safe' \| 'moderate' \| 'destructive'` | Risk level for approval |
| `examples` | `string[]` | Natural language examples for AI matching |

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
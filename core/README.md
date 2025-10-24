# @supernal-interface/core

**Universal AI Interface** - Make any application AI-controllable and auto-testable

## 🎯 Vision

Transform any application into an AI-controllable interface with automatic test generation, while maintaining strict safety controls.

## 🚀 Quick Start

```bash
npm install @supernal-interface/core
```

```typescript
import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'user-management' })
class UserManager {
  
  @Tool({ aiEnabled: true })  // Safe for AI control
  async getUsers() {
    return await this.userService.getAll();
  }
  
  @Tool()  // Test-only by default (safe default)
  async deleteUser(id: string) {
    return await this.userService.delete(id);
  }
}
```

## 🛡️ Safety-First Design

**Key Principle**: Everything can be tested, but AI control requires explicit opt-in.

### Default Behavior
- **All tools are test-only by default** - can be tested but not AI-controlled
- **AI control requires explicit `aiEnabled: true`**
- **Dangerous operations require approval even when AI-enabled**

### Automatic Classification

The system automatically classifies methods by danger level:

- **Safe**: `get`, `search`, `view`, `navigate` → Can be AI-enabled
- **Moderate**: `create`, `update`, `modify` → Requires explicit AI enabling
- **Dangerous**: `approve`, `reject`, `suspend` → Requires approval
- **Destructive**: `delete`, `remove`, `destroy` → Test-only by default

## 📖 Usage Examples

### Basic Tool Definition

```typescript
@Tool()  // Automatically: test-only, safe
async getUserList() {
  return await this.userService.getUsers();
}

@Tool({ aiEnabled: true })  // Explicitly AI-enabled
async searchUsers(query: string) {
  return await this.userService.search(query);
}
```

### Provider-Level Configuration

```typescript
@ToolProvider({
  category: 'admin',
  aiEnabled: false,  // Default for all tools in this class
  executionContext: 'api'
})
class AdminProvider {
  @Tool({ aiEnabled: true })  // Override provider default
  async getAdminStats() { /* ... */ }
}
```

### Natural Language Examples

```typescript
@Tool({
  aiEnabled: true,
  examples: ['find user john', 'search for admins', 'look up by email'],
  aiDescription: 'Search users by name, email, or role with fuzzy matching'
})
async searchUsers(query: string) { /* ... */ }
```

## 🔧 API Reference

### @Tool Decorator

```typescript
@Tool({
  // Basic config
  name?: string;
  description?: string;
  category?: ToolCategory;
  
  // AI Control (NEW)
  aiEnabled?: boolean;                // Default: false (test-only)
  requiresApproval?: boolean;         // Auto-inferred from method name
  dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'destructive';
  toolType?: 'test-only' | 'ai-safe' | 'ai-restricted' | 'ai-dangerous';
  
  // UI Integration (NEW)
  testId?: string;                    // Auto-generated: 'classname-methodname'
  uiSelector?: string;                // CSS selector for UI elements
  examples?: string[];                // Natural language examples
  executionContext?: 'ui' | 'api' | 'both';
})
```

### @ToolProvider Decorator

```typescript
@ToolProvider({
  category?: string;
  aiEnabled?: boolean;                // Default for all tools
  dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'destructive';
  executionContext?: 'ui' | 'api' | 'both';
  tags?: string[];
})
```

## 🧪 Testing vs AI Execution

```typescript
// TESTING: Always works for all tools
await ToolRegistry.executeForTesting('UserManager.deleteUser', { id: 'test-123' });

// AI EXECUTION: Only works for AI-enabled tools
await ToolRegistry.executeForAI('UserManager.searchUsers', { query: 'john' });
// ❌ This fails: executeForAI('UserManager.deleteUser', { id: 'real-123' });

// APPROVAL FLOW: For dangerous operations
const approval = await ToolRegistry.requestApproval('UserManager.deleteUser', { id: 'real-123' });
// Human reviews and approves...
await ToolRegistry.executeWithApproval(approval.id);
```

## 🏗️ Architecture

Built on and extends [supernal-command](https://github.com/supernal-ai/supernal-nova/tree/main/families/supernal-command)'s proven architecture:

- **Decorators**: Enhanced `@Tool` with AI safety controls
- **Registry**: Universal tool discovery and execution
- **Execution**: Multiple contexts (UI, API, testing)
- **Safety**: Approval workflows for dangerous operations

## 🔗 Integration

### With Testing Frameworks

```typescript
// Automatic Playwright test generation
import { generatePlaywrightTests } from '@supernal-interface/core/generators';

const tests = generatePlaywrightTests(UserManager);
// Generates tests for all @Tool methods
```

### With AI Chat Systems

```typescript
// Natural language interface
import { UniversalChatInterface } from '@supernal-interface/core/integration';

const chat = new UniversalChatInterface();
await chat.execute("search for users named john");
// Automatically finds and executes UserManager.searchUsers()
```

## 📦 Package Structure

```
@supernal-interface/core/
├── decorators/          # @Tool, @ToolProvider
├── registry/           # Tool discovery and execution
├── types/              # TypeScript interfaces
├── generators/         # Auto-generate tests/docs
├── execution/          # Execution engines
└── integration/        # AI chat interface
```

## 🤝 Contributing

This package extends supernal-command's architecture. See the [main repository](https://github.com/supernal-ai/supernal-nova) for contribution guidelines.

## 📄 License

MIT - See LICENSE file for details.

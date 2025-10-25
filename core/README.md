# @supernal-interface/core

**Universal AI Interface & Testing System** - Make any application AI-controllable and auto-testable with a single decorator system.

## 🎯 Vision

One decorator system that generates:
- **AI interfaces** for live control
- **Test simulations** for automated testing  
- **Test scenarios** for comprehensive coverage
- **Documentation** for both AI and humans

**Same tools, different execution contexts** - AI uses DOM, tests use Playwright, but the interface is identical.

## 🚀 Quick Start

```bash
npm install @supernal-interface/core
```

### 🎮 Interactive Demo

**Try the live demo:** Open `demo/simple-ui-demo.html` in your browser for an interactive demonstration of:
- AI controlling UI widgets through natural language
- Safety controls (approval required for dangerous actions)
- Generated Playwright simulations and AI interfaces

**React Example:** See `demo/react-example.tsx` for a complete TypeScript React integration.

### Simple Interface Example

```typescript
import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'auth' })
class AuthProvider {
  
  @Tool({ 
    testId: 'login-button',
    aiEnabled: true,
    dangerLevel: 'safe'
  })
  async login(username: string, password: string) {
    // Implementation works for both AI and testing
    return { success: true, token: 'abc123' };
  }
}
```

### Generate Everything

```bash
npx supernal-interface generate --framework react
```

**Generates:**
- `AuthSimulation.ts` - Playwright test simulation
- `AuthAIInterface.ts` - AI tool definitions
- `AuthStories.ts` - Test scenarios
- `GENERATED_DOCUMENTATION.md` - Usage documentation

### 💬 AI Chat Interface Pattern

```typescript
// AI finds tools by natural language
const aiInterface = new AuthAIInterface();
const tools = aiInterface.findToolsByQuery('login user');

// Execute the found tool
if (tools.length > 0) {
  const loginTool = tools[0];
  // AI can now execute login action safely
}

// Common chat commands:
// "open menu" → finds and executes openMenu()
// "submit form" → finds and executes submitForm()  
// "delete data" → requires approval for dangerous actions
```
- `AuthDocumentation.md` - Auto-generated docs

## 📚 Examples: Simple to Complex

### 1. Simple Button Interface

```typescript
@ToolProvider({ category: 'ui' })
class ButtonProvider {
  
  @Tool({ 
    testId: 'submit-btn',
    aiEnabled: true 
  })
  async clickSubmit() {
    document.querySelector('[data-testid="submit-btn"]')?.click();
    return { success: true };
  }
}
```

**Generated Test:**
```typescript
// Auto-generated in ButtonSimulation.ts
async clickSubmit(): Promise<{ success: boolean; message: string }> {
  const element = this.getElement('submit-btn');
  await element.waitFor({ state: 'visible' });
  await element.click();
  return { success: true, message: 'Clicked submit-btn' };
}
```

**Generated AI Interface:**
```typescript
// Auto-generated in ButtonAIInterface.ts
'clickSubmit': {
  name: 'Click Submit',
  description: 'Click the submit button',
  parameters: { type: 'object', properties: {}, required: [] },
  examples: ['click submit', 'submit the form', 'press submit button'],
  dangerLevel: 'safe',
  requiresApproval: false
}
```

### 2. Form Interface with Validation

```typescript
@ToolProvider({ category: 'forms' })
class FormProvider {
  
  @Tool({ 
    testId: 'user-name-input',
    aiEnabled: true,
    elementType: 'input',
    actionType: 'type'
  })
  async enterUserName(name: string) {
    const input = document.querySelector('[data-testid="user-name-input"]') as HTMLInputElement;
    if (!input) throw new Error('Name input not found');
    
    input.value = name;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return { success: true, value: name };
  }

  @Tool({ 
    testId: 'email-input',
    aiEnabled: true,
    elementType: 'input',
    actionType: 'type'
  })
  async enterEmail(email: string) {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    const input = document.querySelector('[data-testid="email-input"]') as HTMLInputElement;
    input.value = email;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return { success: true, value: email };
  }

  @Tool({ 
    testId: 'form-submit',
    aiEnabled: false,  // Test-only (form submission might be dangerous)
    dangerLevel: 'moderate'
  })
  async submitForm() {
    const form = document.querySelector('[data-testid="user-form"]') as HTMLFormElement;
    form.submit();
    return { success: true };
  }
}
```

**Generated Test Story:**
```typescript
// Auto-generated in FormStories.ts
async story_completeUserForm(): Promise<StoryResult> {
  const startTime = Date.now();
  
  try {
    await this.simulation.enterUserName('John Doe');
    await this.simulation.enterEmail('john@example.com');
    await this.simulation.submitForm();
    
    return {
      success: true,
      message: 'Successfully completed user form',
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      message: `Form completion failed: ${error.message}`,
      duration: Date.now() - startTime
    };
  }
}
```

### 3. Complex Nested Interface (E-commerce)

```typescript
@ToolProvider({ category: 'ecommerce' })
class ShoppingProvider {
  
  @Tool({ 
    testId: 'product-search',
    aiEnabled: true,
    elementType: 'input',
    actionType: 'type'
  })
  async searchProducts(query: string) {
    const searchInput = document.querySelector('[data-testid="product-search"]') as HTMLInputElement;
    searchInput.value = query;
    searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    
    // Wait for results
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, query };
  }

  @Tool({ 
    testId: 'add-to-cart',
    aiEnabled: true,
    dangerLevel: 'moderate'  // Adds cost
  })
  async addToCart(productId: string) {
    const addButton = document.querySelector(`[data-product-id="${productId}"] [data-testid="add-to-cart"]`);
    if (!addButton) throw new Error(`Product ${productId} not found`);
    
    addButton.click();
    return { success: true, productId };
  }

  @Tool({ 
    testId: 'checkout-button',
    aiEnabled: false,  // Test-only - involves payment
    dangerLevel: 'dangerous',
    requiresApproval: true
  })
  async proceedToCheckout() {
    const checkoutBtn = document.querySelector('[data-testid="checkout-button"]');
    checkoutBtn?.click();
    return { success: true };
  }

  @Tool({ 
    testId: 'payment-submit',
    aiEnabled: false,  // Never allow AI to submit payments
    dangerLevel: 'destructive'
  })
  async submitPayment(cardNumber: string, cvv: string) {
    // This will only be available for testing, never AI
    throw new Error('Payment submission is test-only');
  }
}

@ToolProvider({ category: 'cart' })
class CartProvider {
  
  @Tool({ 
    testId: 'cart-quantity',
    aiEnabled: true,
    elementType: 'select',
    actionType: 'select'
  })
  async updateQuantity(productId: string, quantity: number) {
    const select = document.querySelector(`[data-product-id="${productId}"] [data-testid="cart-quantity"]`) as HTMLSelectElement;
    select.value = quantity.toString();
    select.dispatchEvent(new Event('change'));
    return { success: true, productId, quantity };
  }

  @Tool({ 
    testId: 'remove-item',
    aiEnabled: true,
    dangerLevel: 'moderate'
  })
  async removeFromCart(productId: string) {
    const removeBtn = document.querySelector(`[data-product-id="${productId}"] [data-testid="remove-item"]`);
    removeBtn?.click();
    return { success: true, productId };
  }
}
```

**Generated Complex Test Scenario:**
```typescript
// Auto-generated in ShoppingStories.ts
async story_completeShoppingFlow(): Promise<StoryResult> {
  const startTime = Date.now();
  
  try {
    // Search for products
    await this.simulation.searchProducts('laptop');
    
    // Add items to cart
    await this.simulation.addToCart('laptop-123');
    await this.simulation.addToCart('mouse-456');
    
    // Modify cart
    await this.simulation.updateQuantity('laptop-123', 2);
    await this.simulation.removeFromCart('mouse-456');
    
    // Proceed to checkout (test-only)
    await this.simulation.proceedToCheckout();
    
    return {
      success: true,
      message: 'Complete shopping flow executed successfully',
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      message: `Shopping flow failed: ${error.message}`,
      duration: Date.now() - startTime
    };
  }
}
```

## 🧪 Testing Integration

### Using Generated Simulations

```typescript
// test/shopping.spec.ts
import { test, expect } from '@playwright/test';
import { ShoppingSimulation } from '../generated/ShoppingSimulation';

test('complete shopping flow', async ({ page }) => {
  const simulation = new ShoppingSimulation(page);
  
  await page.goto('/shop');
  
  // Use the same interface that AI would use
  await simulation.searchProducts('laptop');
  await simulation.addToCart('laptop-123');
  await simulation.updateQuantity('laptop-123', 2);
  
  // Test-only operations
  await simulation.proceedToCheckout();
  
  await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
});
```

### Using Generated Stories

```typescript
// test/shopping-stories.spec.ts
import { test } from '@playwright/test';
import { ShoppingSimulation, ShoppingStories } from '../generated';

test('run shopping stories', async ({ page }) => {
  const simulation = new ShoppingSimulation(page);
  const stories = new ShoppingStories(simulation);
  
  await page.goto('/shop');
  
  // Run auto-generated story
  const result = await stories.story_completeShoppingFlow();
  
  expect(result.success).toBe(true);
  expect(result.duration).toBeGreaterThan(0);
});
```

## 🤖 AI Integration

### Using Generated AI Interface

```typescript
// ai-controller.ts
import { ShoppingAIInterface } from '../generated/ShoppingAIInterface';

const aiInterface = new ShoppingAIInterface();

// AI can discover available tools
const safeTools = aiInterface.getSafeTools();
console.log('AI can use:', safeTools.map(t => t.name));

// AI can search for tools by natural language
const searchTools = aiInterface.findToolsByQuery('add product to cart');
console.log('Found tools:', searchTools);

// AI execution (separate from testing)
async function handleAICommand(command: string) {
  const tools = aiInterface.findToolsByQuery(command);
  
  if (tools.length === 0) {
    return { error: 'No tools found for command' };
  }
  
  const tool = tools[0];
  
  if (tool.requiresApproval) {
    return { 
      error: 'Tool requires approval',
      toolName: tool.name,
      requiresApproval: true 
    };
  }
  
  // Execute tool via DOMExecutor (not shown)
  return { success: true, executed: tool.name };
}
```

## 🏗️ Architecture: Same Tools, Different Execution

```
┌─────────────────┐    ┌─────────────────┐
│   @Tool         │    │   @Tool         │
│   Decorators    │    │   Decorators    │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  AI Interface   │    │ Test Simulation │
│  (DOM API)      │    │ (Playwright)    │
└─────────────────┘    └─────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Live Browser    │    │ Test Browser    │
│ (Production)    │    │ (CI/Testing)    │
└─────────────────┘    └─────────────────┘
```

## 🛡️ Safety-First Design

### Automatic Classification

- **Safe**: `get`, `search`, `view` → AI-enabled by default
- **Moderate**: `create`, `update` → Requires explicit AI enabling  
- **Dangerous**: `approve`, `delete` → Requires approval
- **Destructive**: `payment`, `destroy` → Test-only by default

### Approval Workflow

```typescript
@Tool({ 
  aiEnabled: true,
  dangerLevel: 'dangerous',
  requiresApproval: true 
})
async deleteUser(id: string) {
  // AI must request approval before execution
  return { success: true, deleted: id };
}
```

## 📊 Generated Documentation

The system auto-generates comprehensive documentation:

```markdown
# Shopping Tools Documentation

## 🟢 Safe Tools (2)
- **Search Products** - Search for products in the catalog
- **Update Quantity** - Change item quantity in cart

## 🟡 Moderate Tools (2) 
- **Add To Cart** - Add product to shopping cart
- **Remove From Cart** - Remove item from cart

## 🔴 Dangerous Tools (1) - Requires Approval
- **Proceed To Checkout** - Begin checkout process

## ⚫ Test-Only Tools (1)
- **Submit Payment** - Process payment (testing only)
```

## 🚀 Getting Started

1. **Install**:
   ```bash
   npm install @supernal-interface/core
   ```

2. **Add decorators** to your existing code:
   ```typescript
   @Tool({ testId: 'my-button', aiEnabled: true })
   async clickButton() { /* existing code */ }
   ```

3. **Generate interfaces**:
   ```bash
   npx supernal-interface generate
   ```

4. **Use in tests**:
   ```typescript
   const simulation = new AppSimulation(page);
   await simulation.clickButton();
   ```

5. **Use with AI**:
   ```typescript
   const aiInterface = new AppAIInterface();
   const tools = aiInterface.findToolsByQuery('click button');
   ```

## 🎯 Key Benefits

- **Single Source of Truth** - One decorator defines everything
- **Safety First** - Test-only by default, AI requires opt-in
- **Auto-Generated** - Tests, AI interfaces, docs all generated
- **Framework Agnostic** - Works with React, Vue, Angular, etc.
- **Separate Execution** - AI and tests run independently
- **Battle-Tested** - Built on proven patterns from supernal-command

**Transform any application into an AI-controllable, auto-testable system with a single decorator.** 🚀
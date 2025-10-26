/**
 * Example: Using @Tool decorator with standalone functions
 * 
 * This example shows how to use the enhanced @Tool decorator with both
 * class methods and standalone functions, using the improved naming conventions.
 */

import { Tool, ToolProvider, getStandaloneTools } from '../src/decorators/Tool';

// ===== STANDALONE FUNCTION TOOLS =====

@Tool({
  toolId: 'calculate-tax',
  providerName: 'TaxUtils',
  description: 'Calculate tax amount based on income and rate',
  aiEnabled: true,
  dangerLevel: 'safe',
  examples: ['calculate tax for $50000 at 25%', 'compute tax amount', 'what is the tax on this income'],
  origin: {
    path: '/calculator',
    elements: ['#tax-calculator', '.tax-form']
  }
})
function calculateTax(income: number, rate: number): { tax: number; afterTax: number } {
  const tax = income * (rate / 100);
  return {
    tax: Math.round(tax * 100) / 100,
    afterTax: Math.round((income - tax) * 100) / 100
  };
}

@Tool({
  toolId: 'format-currency',
  providerName: 'FormatUtils',
  description: 'Format number as currency string',
  aiEnabled: true,
  dangerLevel: 'safe',
  examples: ['format 1234.56 as currency', 'make this a dollar amount', 'currency format'],
  executionContext: 'both'
})
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

@Tool({
  toolId: 'delete-all-data',
  providerName: 'DataUtils',
  description: 'Delete all user data - DESTRUCTIVE ACTION',
  aiEnabled: false,  // Test-only by default for dangerous operations
  dangerLevel: 'destructive',
  requiresApproval: true,
  examples: ['delete all data', 'wipe everything', 'clear all user data'],
  origin: {
    path: '/admin',
    elements: ['#danger-zone'],
    modal: 'confirm-delete'
  }
})
function deleteAllData(): { success: boolean; message: string } {
  // This would be a destructive operation
  console.warn('DESTRUCTIVE: This would delete all data!');
  return { success: false, message: 'Operation blocked - test mode' };
}

// ===== CLASS-BASED TOOLS (Traditional Pattern) =====

@ToolProvider({
  category: 'ui-controls'
})
export class UIControls {
  
  @Tool({
    toolId: 'theme-toggle',
    elementId: 'theme-selector',
    selector: '#theme-selector, .theme-toggle',
    description: 'Change the application theme',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set theme to dark', 'change to light mode', 'toggle theme'],
    origin: {
      path: '/demo',
      elements: ['#theme-selector', '.theme-controls']
    }
  })
  setTheme(theme: 'light' | 'dark' | 'auto'): { success: boolean; theme: string } {
    console.log(`Setting theme to: ${theme}`);
    return { success: true, theme };
  }
  
  @Tool({
    toolId: 'save-user-data',
    description: 'Save user data to database',
    aiEnabled: true,
    dangerLevel: 'moderate',
    requiresApproval: false,
    examples: ['save user data', 'persist information', 'store user details'],
    origin: {
      path: '/profile',
      elements: ['#save-button', '.save-controls']
    }
  })
  async saveUserData(userData: any): Promise<{ success: boolean; id?: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, id: 'user-123' };
  }
}

// ===== USAGE EXAMPLES =====

async function demonstrateUsage() {
  console.log('=== Standalone Function Tools Demo ===');
  
  // Direct function calls work normally
  const taxResult = calculateTax(50000, 25);
  console.log('Tax calculation:', taxResult);
  
  const formatted = formatCurrency(taxResult.tax);
  console.log('Formatted tax:', formatted);
  
  // Access tool metadata
  console.log('Calculate tax metadata:', (calculateTax as any).__toolMetadata__);
  
  // Get all standalone tools
  const standaloneTools = getStandaloneTools();
  console.log('Registered standalone tools:', standaloneTools.map(t => t.toolId));
  
  console.log('=== Class-based Tools Demo ===');
  
  // Class-based tools work as usual
  const uiControls = new UIControls();
  const themeResult = uiControls.setTheme('dark');
  console.log('Theme change:', themeResult);
  
  const saveResult = await uiControls.saveUserData({ name: 'John', email: 'john@example.com' });
  console.log('Save result:', saveResult);
  
  // Access class tool metadata
  console.log('UI Controls tools:', (UIControls.prototype as any).__tools__);
}

// Run the demo
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

export { calculateTax, formatCurrency, deleteAllData, UIControls };

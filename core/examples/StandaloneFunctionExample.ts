/**
 * Example: Using @Tool decorator with standalone functions
 * 
 * This example shows how to use the enhanced @Tool decorator with both
 * class methods and standalone functions, using the improved naming conventions.
 */

import { Tool, ToolProvider, ToolRegistry } from '@supernal-interface/core';

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
  
  console.log('=== Class-based Tools Demo ===');
  
  // Class-based tools work as usual
  const uiControls = new UIControls();
  const themeResult = uiControls.setTheme('dark');
  console.log('Theme change:', themeResult);
  
  const saveResult = await uiControls.saveUserData({ name: 'John', email: 'john@example.com' });
  console.log('Save result:', saveResult);
  
  console.log('\n=== CLI-Like Tool Discovery Demo ===');
  
  // Overview of all tools and providers
  console.log(ToolRegistry.overview());
  
  // List all tools (compact format)
  console.log('\n--- All Tools (Compact) ---');
  console.log(ToolRegistry.list());
  
  // List tools by provider
  console.log('\n--- Tools by Provider ---');
  console.log(ToolRegistry.list({ provider: 'TaxUtils' }));
  console.log(ToolRegistry.list({ provider: 'UIControls' }));
  
  // List only AI-enabled tools
  console.log('\n--- AI-Enabled Tools Only ---');
  console.log(ToolRegistry.list({ aiEnabled: true }));
  
  // List tools with verbose details
  console.log('\n--- Verbose Tool List ---');
  console.log(ToolRegistry.list({ verbose: true }));
  
  // Search for tools
  console.log('\n--- Search Results ---');
  console.log(ToolRegistry.find('tax'));
  console.log(ToolRegistry.find('theme'));
  
  // Get help for specific tools
  console.log('\n--- Tool Help ---');
  console.log(ToolRegistry.help('taxutils.calculateTax'));
  console.log(ToolRegistry.help('uicontrols.setTheme'));
  
  // Try partial matches
  console.log('\n--- Partial Match Help ---');
  console.log(ToolRegistry.help('calculate'));
  
  // Get tools by provider
  console.log('\n--- Tools by Provider (Programmatic) ---');
  const taxTools = ToolRegistry.getToolsByProvider('TaxUtils');
  console.log('TaxUtils tools:', taxTools.map(t => t.toolId));
  
  const uiTools = ToolRegistry.getToolsByProvider('UIControls');
  console.log('UIControls tools:', uiTools.map(t => t.toolId));
  
  // Get all providers
  console.log('\n--- All Providers ---');
  const providers = ToolRegistry.getProviders();
  console.log('Available providers:', providers);
}

// Run the demo
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

export { calculateTax, formatCurrency, deleteAllData, UIControls };

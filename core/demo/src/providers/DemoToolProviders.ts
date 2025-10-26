/**
 * Real Working Tool Providers for @supernal-interface/core Demo
 * 
 * These are actual @Tool decorated classes that demonstrate the system.
 */

import { Tool, ToolProvider } from '@supernal-interface/core/browser';
import { safeQuerySelector, safeDispatchEvent, safeConfirm } from '../utils/browserUtils';

// ===== NAVIGATION PROVIDER =====

@ToolProvider({ 
  category: 'navigation',
  executionContext: 'ui'
})
export class NavigationProvider {
  
  @Tool({
    testId: 'open-main-menu',
    description: 'Open the main navigation menu',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['open menu', 'show navigation', 'display menu'],
    elementType: 'button',
    actionType: 'click'
  })
  async openMainMenu(): Promise<{ success: boolean; message: string }> {
    try {
      const menuButton = safeQuerySelector('[data-testid="open-main-menu"]');
      if (!menuButton) {
        return { success: false, message: 'Menu button not found' };
      }
      
      menuButton.click();
      safeDispatchEvent('navigation:menu-opened', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Main menu opened successfully' };
    } catch (error) {
      return { success: false, message: `Failed to open menu: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'close-main-menu',
    description: 'Close the main navigation menu',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['close menu', 'hide navigation', 'dismiss menu'],
    elementType: 'button',
    actionType: 'click'
  })
  async closeMainMenu(): Promise<{ success: boolean; message: string }> {
    try {
      const closeButton = safeQuerySelector('[data-testid="close-main-menu"]');
      if (!closeButton) {
        return { success: false, message: 'Close button not found' };
      }
      
      closeButton.click();
      safeDispatchEvent('navigation:menu-closed', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Main menu closed successfully' };
    } catch (error) {
      return { success: false, message: `Failed to close menu: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'navigate-to-docs',
    description: 'Navigate to the documentation section',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['go to docs', 'show documentation', 'open docs'],
    elementType: 'button',
    actionType: 'click'
  })
  async navigateToDocs(): Promise<{ success: boolean; message: string }> {
    try {
      const docsButton = safeQuerySelector('[data-testid="navigate-to-docs"]');
      if (!docsButton) {
        return { success: false, message: 'Docs button not found' };
      }
      
      docsButton.click();
      safeDispatchEvent('navigation:docs-opened', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Navigated to documentation' };
    } catch (error) {
      return { success: false, message: `Failed to navigate: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

// ===== CHAT PROVIDER =====

@ToolProvider({ 
  category: 'chat',
  executionContext: 'ui'
})
export class ChatProvider {
  
  @Tool({
    testId: 'send-chat-message',
    description: 'Send a message in the chat interface',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['send message', 'chat hello', 'say something'],
    elementType: 'input',
    actionType: 'type'
  })
  async sendMessage(message: string): Promise<{ success: boolean; message: string }> {
    try {
      const chatInput = safeQuerySelector('[data-testid="chat-input"]') as HTMLInputElement;
      const sendButton = safeQuerySelector('[data-testid="send-chat-message"]');
      
      if (!chatInput || !sendButton) {
        return { success: false, message: 'Chat interface not found' };
      }
      
      // Set the input value
      chatInput.value = message;
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Click send button
      sendButton.click();
      
      safeDispatchEvent('chat:message-sent', { message, timestamp: new Date().toISOString() });
      
      return { success: true, message: `Message sent: "${message}"` };
    } catch (error) {
      return { success: false, message: `Failed to send message: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'clear-chat-history',
    description: 'Clear all messages from the chat',
    aiEnabled: true,
    dangerLevel: 'moderate',
    examples: ['clear chat', 'delete messages', 'reset conversation'],
    elementType: 'button',
    actionType: 'click'
  })
  async clearChatHistory(): Promise<{ success: boolean; message: string }> {
    try {
      const clearButton = safeQuerySelector('[data-testid="clear-chat-history"]');
      if (!clearButton) {
        return { success: false, message: 'Clear button not found' };
      }
      
      clearButton.click();
      safeDispatchEvent('chat:history-cleared', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Chat history cleared successfully' };
    } catch (error) {
      return { success: false, message: `Failed to clear chat: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'toggle-chat-panel',
    description: 'Toggle the chat panel visibility (now permanently visible)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle chat', 'show hide chat', 'chat panel'],
    elementType: 'div',
    actionType: 'click'
  })
  async toggleChatPanel(): Promise<{ success: boolean; message: string }> {
    try {
      // Chat panel is now permanent, so just return a message
      safeDispatchEvent('chat:panel-info', { 
        message: 'Chat panel is now permanently visible',
        timestamp: new Date().toISOString() 
      });
      
      return { success: true, message: '💬 Chat panel is now permanently visible and cannot be hidden' };
    } catch (error) {
      return { success: false, message: `Failed to get chat info: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

// ===== DEMO CONTROL PROVIDER =====

@ToolProvider({ 
  category: 'demo',
  executionContext: 'ui'
})
export class DemoControlProvider {
  
  @Tool({
    testId: 'generate-code-example',
    description: 'Generate and display code examples',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['show code', 'generate example', 'display code'],
    elementType: 'button',
    actionType: 'click'
  })
  async generateCodeExample(): Promise<{ success: boolean; message: string }> {
    try {
      const generateButton = safeQuerySelector('[data-testid="generate-code-example"]');
      if (!generateButton) {
        return { success: false, message: 'Generate button not found' };
      }
      
      generateButton.click();
      safeDispatchEvent('demo:code-generated', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Code example generated successfully' };
    } catch (error) {
      return { success: false, message: `Failed to generate code: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'run-test-simulation',
    description: 'Run a test simulation to demonstrate functionality',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['run test', 'simulate test', 'demo test'],
    elementType: 'button',
    actionType: 'click'
  })
  async runTestSimulation(): Promise<{ success: boolean; message: string }> {
    try {
      const testButton = safeQuerySelector('[data-testid="run-test-simulation"]');
      if (!testButton) {
        return { success: false, message: 'Test button not found' };
      }
      
      testButton.click();
      safeDispatchEvent('demo:test-started', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Test simulation started successfully' };
    } catch (error) {
      return { success: false, message: `Failed to run test: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'reset-demo-state',
    description: 'Reset the demo to its initial state',
    aiEnabled: true,
    dangerLevel: 'moderate',
    requiresApproval: false,
    examples: ['reset demo', 'restart demo', 'clear demo'],
    elementType: 'button',
    actionType: 'click'
  })
  async resetDemoState(): Promise<{ success: boolean; message: string }> {
    try {
      const resetButton = safeQuerySelector('[data-testid="reset-demo-state"]');
      if (!resetButton) {
        return { success: false, message: 'Reset button not found' };
      }
      
      resetButton.click();
      safeDispatchEvent('demo:state-reset', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Demo state reset successfully' };
    } catch (error) {
      return { success: false, message: `Failed to reset demo: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

// ===== ADMIN PROVIDER (DANGEROUS ACTIONS) =====

@ToolProvider({ 
  category: 'admin',
  executionContext: 'ui',
  dangerLevel: 'dangerous'
})
export class AdminProvider {
  
  @Tool({
    testId: 'delete-demo-data',
    description: 'Delete all demo data (DANGEROUS - requires approval)',
    aiEnabled: true,
    dangerLevel: 'destructive',
    requiresApproval: true,
    examples: ['delete all data', 'wipe demo', 'remove everything'],
    elementType: 'button',
    actionType: 'click'
  })
  async deleteDemoData(): Promise<{ success: boolean; message: string }> {
    try {
      // This would require human approval in a real AI system
      const confirmed = safeConfirm('⚠️ This will delete ALL demo data. Are you sure?');
      if (!confirmed) {
        return { success: false, message: 'Action cancelled by user' };
      }
      
      const deleteButton = safeQuerySelector('[data-testid="delete-demo-data"]');
      if (!deleteButton) {
        return { success: false, message: 'Delete button not found' };
      }
      
      deleteButton.click();
      safeDispatchEvent('admin:data-deleted', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Demo data deleted (DESTRUCTIVE ACTION COMPLETED)' };
    } catch (error) {
      return { success: false, message: `Failed to delete data: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  @Tool({
    testId: 'export-demo-config',
    description: 'Export demo configuration (TEST ONLY - AI cannot execute)',
    aiEnabled: false, // This is test-only
    dangerLevel: 'safe',
    examples: ['export config', 'backup settings', 'download config'],
    elementType: 'button',
    actionType: 'click'
  })
  async exportDemoConfig(): Promise<{ success: boolean; message: string }> {
    try {
      // This is test-only - AI cannot execute this, but Playwright tests can
      const exportButton = safeQuerySelector('[data-testid="export-demo-config"]');
      if (!exportButton) {
        return { success: false, message: 'Export button not found' };
      }
      
      exportButton.click();
      safeDispatchEvent('admin:config-exported', { timestamp: new Date().toISOString() });
      
      return { success: true, message: 'Demo configuration exported (TEST-ONLY ACTION)' };
    } catch (error) {
      return { success: false, message: `Failed to export config: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

// ===== INITIALIZE PROVIDERS =====

let providersInitialized = false;
let providerInstances: {
  navigation: NavigationProvider;
  chat: ChatProvider;
  demoControl: DemoControlProvider;
  admin: AdminProvider;
} | null = null;

export function initializeProviders() {
  if (providersInitialized) return;
  
  // Instantiate all providers to register their @Tool decorated methods
  providerInstances = {
    navigation: new NavigationProvider(),
    chat: new ChatProvider(),
    demoControl: new DemoControlProvider(),
    admin: new AdminProvider()
  };
  
  providersInitialized = true;
  
  console.log('🔧 @supernal-interface/core providers initialized');
  console.log('🤖 AI can now control the demo interface');
}

export function getProviderInstances() {
  if (!providerInstances) {
    throw new Error('Providers not initialized. Call initializeProviders() first.');
  }
  return providerInstances;
}
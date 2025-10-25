/**
 * Simple UI Controls with @Tool decorators
 * 
 * These are the actual functions that control UI elements.
 * No bullshit, no event dispatching, just direct control.
 */

import { Tool, ToolProvider } from '@supernal-interface/core/browser';

// Global state for the demo UI
let demoState = {
  menuOpen: false,
  chatPanelOpen: true, // Always open now
  codeExampleVisible: false,
  testRunning: false,
  featureEnabled: false,
  priority: 'medium' as 'high' | 'medium' | 'low',
  status: 'inactive',
  messages: [] as Array<{id: string, text: string, type: 'user' | 'ai' | 'system', timestamp: string}>
};

// State change callback for React components
let stateChangeCallback: ((newState: any) => void) | null = null;

export function setStateChangeCallback(callback: (newState: any) => void) {
  stateChangeCallback = callback;
}

function updateState(changes: Partial<typeof demoState>) {
  demoState = { ...demoState, ...changes };
  if (stateChangeCallback) {
    stateChangeCallback(demoState);
  }
}

@ToolProvider({
  category: 'ui-controls'
})
export class UIControls {
  
  @Tool({
    testId: 'open-main-menu',
    description: 'Open the main navigation menu',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['open menu', 'show navigation', 'display menu']
  })
  async openMainMenu(): Promise<{ success: boolean; message: string }> {
    updateState({ menuOpen: true });
    return { success: true, message: 'Main menu opened' };
  }

  @Tool({
    testId: 'close-main-menu', 
    description: 'Close the main navigation menu',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['close menu', 'hide navigation', 'dismiss menu']
  })
  async closeMainMenu(): Promise<{ success: boolean; message: string }> {
    updateState({ menuOpen: false });
    return { success: true, message: 'Main menu closed' };
  }

  @Tool({
    testId: 'navigate-to-docs',
    description: 'Navigate to documentation',
    aiEnabled: true, 
    dangerLevel: 'safe',
    examples: ['go to docs', 'show documentation', 'open docs']
  })
  async navigateToDocs(): Promise<{ success: boolean; message: string }> {
    // Just open the GitHub docs in a new tab
    if (typeof window !== 'undefined') {
      window.open('https://github.com/ianderrington/supernal-nova/tree/main/platform/services/user-management/packages/@supernal-interface/core', '_blank');
    }
    return { success: true, message: 'Opened documentation in new tab' };
  }

  @Tool({
    testId: 'generate-code-example',
    description: 'Show code example',
    aiEnabled: true,
    dangerLevel: 'safe', 
    examples: ['show code', 'display example', 'code example']
  })
  async generateCodeExample(): Promise<{ success: boolean; message: string }> {
    updateState({ codeExampleVisible: true });
    return { success: true, message: 'Code example displayed' };
  }

  @Tool({
    testId: 'run-test-simulation',
    description: 'Run test simulation',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['run test', 'start simulation', 'test simulation']
  })
  async runTestSimulation(): Promise<{ success: boolean; message: string }> {
    updateState({ testRunning: true });
    
    // Stop after 3 seconds
    setTimeout(() => {
      updateState({ testRunning: false });
    }, 3000);
    
    return { success: true, message: 'Test simulation started' };
  }

  @Tool({
    testId: 'reset-demo-state',
    description: 'Reset demo to initial state',
    aiEnabled: true,
    dangerLevel: 'moderate',
    examples: ['reset demo', 'clear state', 'start over']
  })
  async resetDemoState(): Promise<{ success: boolean; message: string }> {
    updateState({
      menuOpen: false,
      codeExampleVisible: false, 
      testRunning: false,
      messages: []
    });
    return { success: true, message: 'Demo state reset' };
  }

  @Tool({
    testId: 'send-chat-message',
    description: 'Send a chat message',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['send message', 'chat hello', 'say hello']
  })
  async sendChatMessage(message: string = 'Hello from AI!'): Promise<{ success: boolean; message: string }> {
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: message,
      type: 'ai' as const,
      timestamp: new Date().toISOString()
    };
    
    updateState({ 
      messages: [...demoState.messages, newMessage] 
    });
    
    return { success: true, message: `Sent message: "${message}"` };
  }

  @Tool({
    testId: 'clear-chat-history',
    description: 'Clear all chat messages',
    aiEnabled: true,
    dangerLevel: 'moderate',
    examples: ['clear chat', 'delete messages', 'empty chat']
  })
  async clearChatHistory(): Promise<{ success: boolean; message: string }> {
    updateState({ messages: [] });
    return { success: true, message: 'Chat history cleared' };
  }

  @Tool({
    testId: 'delete-demo-data',
    description: 'Delete all demo data (DANGEROUS)',
    aiEnabled: true,
    dangerLevel: 'destructive',
    requiresApproval: true,
    examples: ['delete data', 'remove all data', 'destroy demo']
  })
  async deleteDemoData(): Promise<{ success: boolean; message: string }> {
    updateState({
      menuOpen: false,
      codeExampleVisible: false,
      testRunning: false,
      messages: []
    });
    return { success: true, message: '🗑️ All demo data deleted (DESTRUCTIVE action completed)' };
  }

  @Tool({
    testId: 'toggle-feature',
    description: 'Toggle a feature on or off',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle feature', 'enable feature', 'disable feature']
  })
  async toggleFeature(enabled?: boolean): Promise<{ success: boolean; message: string }> {
    const newState = enabled !== undefined ? enabled : !demoState.featureEnabled;
    updateState({ featureEnabled: newState });
    return { success: true, message: `Feature ${newState ? 'enabled' : 'disabled'}` };
  }

  @Tool({
    testId: 'set-priority',
    description: 'Set priority level',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set priority high', 'change priority to medium', 'low priority']
  })
  async setPriority(priority: 'high' | 'medium' | 'low'): Promise<{ success: boolean; message: string }> {
    updateState({ priority });
    return { success: true, message: `Priority set to ${priority}` };
  }

  @Tool({
    testId: 'set-status',
    description: 'Change status setting',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set status active', 'change to inactive', 'status pending']
  })
  async setStatus(status: string): Promise<{ success: boolean; message: string }> {
    updateState({ status });
    return { success: true, message: `Status changed to ${status}` };
  }

  @Tool({
    testId: 'submit-form',
    description: 'Submit form with data',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['submit form', 'send form data', 'submit with name']
  })
  async submitForm(name: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Form submitted with name: ${name}` };
  }
}

// Export the current state for React components
export function getDemoState() {
  return demoState;
}

// Initialize the UI controls
let uiControls: UIControls | null = null;

export function initializeUIControls() {
  if (!uiControls) {
    uiControls = new UIControls();
    console.log('🎮 UI Controls initialized with @Tool decorators');
  }
  return uiControls;
}

export function getUIControls() {
  if (!uiControls) {
    throw new Error('UI Controls not initialized. Call initializeUIControls() first.');
  }
  return uiControls;
}

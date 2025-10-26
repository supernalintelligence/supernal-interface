/**
 * Simple UI Controls with @Tool decorators
 * 
 * These match exactly the 5 widgets in the component zoo.
 * No bullshit, just the actual widget controls.
 */

import { Tool, ToolProvider } from '@supernal-interface/core/browser';

// Global state for the demo UI
let demoState = {
  menuOpen: false,
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
  category: 'widget-controls'
})
export class UIControls {
  
  // Button Widget - Open Menu
  @Tool({
    testId: 'menu-toggle-widget',
    description: 'Toggle the main menu (button widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['open menu', 'close menu', 'toggle menu']
  })
  async openMainMenu(): Promise<{ success: boolean; message: string }> {
    const newState = !demoState.menuOpen;
    updateState({ menuOpen: newState });
    return { success: true, message: `Main menu ${newState ? 'opened' : 'closed'}` };
  }

  @Tool({
    testId: 'menu-close-widget',
    description: 'Close the main menu (button widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['close menu', 'hide menu']
  })
  async closeMainMenu(): Promise<{ success: boolean; message: string }> {
    updateState({ menuOpen: false });
    return { success: true, message: 'Main menu closed' };
  }

  // Checkbox Widget - Enable Feature
  @Tool({
    testId: 'feature-toggle-widget',
    description: 'Toggle a feature on or off (checkbox widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle feature', 'enable feature', 'disable feature']
  })
  async toggleFeature(enabled?: boolean): Promise<{ success: boolean; message: string }> {
    const newState = enabled !== undefined ? enabled : !demoState.featureEnabled;
    updateState({ featureEnabled: newState });
    return { success: true, message: `Feature ${newState ? 'enabled' : 'disabled'}` };
  }

  // Radio Widget - Priority Selection
  @Tool({
    testId: 'priority-high-widget',
    description: 'Set priority level (radio widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set priority high', 'high priority', 'priority high']
  })
  async setPriority(priority: 'high' | 'medium' | 'low'): Promise<{ success: boolean; message: string }> {
    updateState({ priority });
    return { success: true, message: `Priority set to ${priority}` };
  }

  // Select Widget - Status Selection
  @Tool({
    testId: 'status-select-widget',
    description: 'Change status setting (select widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set status active', 'change status', 'status inactive']
  })
  async setStatus(status: string): Promise<{ success: boolean; message: string }> {
    updateState({ status });
    return { success: true, message: `Status changed to ${status}` };
  }

  // Form Widget - Submit Form
  @Tool({
    testId: 'form-submit-widget',
    description: 'Submit form with data (form widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['submit form', 'send form', 'submit name']
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
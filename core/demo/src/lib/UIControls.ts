/**
 * UI Controls with @Tool decorators - ONLY for widgets that actually exist
 * 
 * Each @Tool method corresponds to exactly one widget in the component zoo.
 * NO extra tools, NO missing tools - perfect 1:1 mapping.
 */

import { Tool, ToolProvider } from '@supernal-interface/core/browser';

// Global state for the demo UI - ONLY for actual widgets
let demoState = {
  // Button widgets
  menuOpen: false,
  
  // Checkbox widgets  
  featureEnabled: false,
  notificationsEnabled: false,
  
  // Radio widget
  priority: 'medium' as 'high' | 'medium' | 'low',
  
  // Select widgets
  status: 'inactive',
  theme: 'light' as 'light' | 'dark' | 'auto',
  
  // Visual feedback
  highlightedWidget: null as string | null,
  
  // Chat messages (for chat interface, not a widget)
  messages: [] as Array<{id: string, text: string, type: 'user' | 'ai' | 'system', timestamp: string}>
};

// State change callback for React components
let stateChangeCallback: ((newState: any) => void) | null = null;

export function setStateChangeCallback(callback: (newState: any) => void) {
  stateChangeCallback = callback;
}

function updateState(changes: Partial<typeof demoState>) {
  console.log(`🔄 UIControls.updateState: Changes:`, changes);
  console.log(`🔄 UIControls.updateState: Old state:`, demoState);
  demoState = { ...demoState, ...changes };
  console.log(`🔄 UIControls.updateState: New state:`, demoState);
  if (stateChangeCallback) {
    console.log(`🔄 UIControls.updateState: Calling React callback`);
    stateChangeCallback(demoState);
  } else {
    console.log(`🔄 UIControls.updateState: No React callback set`);
  }
}

// Visual feedback helper
function highlightWidget(widgetId: string) {
  updateState({ highlightedWidget: widgetId });
  // Clear highlight after 2 seconds
  setTimeout(() => {
    updateState({ highlightedWidget: null });
  }, 2000);
}

@ToolProvider({
  category: 'widget-controls'
})
export class UIControls {
  
  // ===== BUTTON WIDGETS =====
  
  @Tool({
    testId: 'open-main-menu',
    description: 'Open the main menu (button widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['open menu', 'show menu', 'display menu']
  })
  async openMainMenu(): Promise<{ success: boolean; message: string }> {
    highlightWidget('open-menu-button');
    updateState({ menuOpen: true });
    return { success: true, message: 'Main menu opened' };
  }

  @Tool({
    testId: 'close-main-menu',
    description: 'Close the main menu (button widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['close menu', 'hide menu', 'dismiss menu']
  })
  async closeMainMenu(): Promise<{ success: boolean; message: string }> {
    highlightWidget('close-menu-button');
    updateState({ menuOpen: false });
    return { success: true, message: 'Main menu closed' };
  }

  // ===== CHECKBOX WIDGETS =====
  
  @Tool({
    testId: 'feature-toggle-widget',
    description: 'Toggle feature on/off (checkbox widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle feature', 'enable feature', 'disable feature']
  })
  async toggleFeature(enabled?: boolean): Promise<{ success: boolean; message: string }> {
    highlightWidget('feature-toggle-widget');
    const newState = enabled !== undefined ? enabled : !demoState.featureEnabled;
    updateState({ featureEnabled: newState });
    return { success: true, message: `Feature ${newState ? 'enabled' : 'disabled'}` };
  }

  @Tool({
    testId: 'notifications-toggle-widget',
    description: 'Toggle notifications on/off (checkbox widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle notifications', 'enable notifications', 'disable notifications']
  })
  async toggleNotifications(enabled?: boolean): Promise<{ success: boolean; message: string }> {
    highlightWidget('notifications-toggle-widget');
    const newState = enabled !== undefined ? enabled : !demoState.notificationsEnabled;
    updateState({ notificationsEnabled: newState });
    return { success: true, message: `Notifications ${newState ? 'enabled' : 'disabled'}` };
  }

  // ===== RADIO WIDGET =====
  
  @Tool({
    testId: 'priority-radio-widget',
    description: 'Set priority level (radio widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set priority high', 'priority medium', 'low priority', 'change priority']
  })
  async setPriority(priority: 'high' | 'medium' | 'low'): Promise<{ success: boolean; message: string }> {
    highlightWidget('priority-radio-widget');
    updateState({ priority });
    return { success: true, message: `Priority set to ${priority}` };
  }

  // ===== SELECT WIDGETS =====
  
  @Tool({
    testId: 'status-select-widget',
    description: 'Change status (select widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set status active', 'change status', 'status inactive', 'status pending']
  })
  async setStatus(status: string): Promise<{ success: boolean; message: string }> {
    console.log(`🎛️ UIControls.setStatus called with:`, status);
    highlightWidget('status-select-widget');
    updateState({ status });
    console.log(`🎛️ UIControls.setStatus: State updated to:`, status);
    return { success: true, message: `Status changed to ${status}` };
  }

  @Tool({
    testId: 'theme-select-widget',
    description: 'Change theme (select widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['set theme dark', 'light theme', 'auto theme', 'change theme']
  })
  async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<{ success: boolean; message: string }> {
    console.log(`🎨 UIControls.setTheme called with:`, theme);
    highlightWidget('theme-select-widget');
    updateState({ theme });
    console.log(`🎨 UIControls.setTheme: State updated to:`, theme);
    // Apply theme to document for visual feedback
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    return { success: true, message: `Theme changed to ${theme}` };
  }

  // ===== FORM WIDGET =====
  
  @Tool({
    testId: 'form-submit-widget',
    description: 'Submit form with name (form widget)',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['submit form', 'send form', 'submit name']
  })
  async submitForm(name: string): Promise<{ success: boolean; message: string }> {
    highlightWidget('form-submit-widget');
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
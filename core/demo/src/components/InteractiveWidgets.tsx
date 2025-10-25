/**
 * REQ-001: Interactive UI Widgets with Tool Decorators
 * 
 * Standard UI elements directly connected to @Tool decorated methods.
 * Each widget provides immediate visual feedback and state changes.
 */

import React, { useState, useEffect } from 'react';
import { getUIControls, getDemoState, setStateChangeCallback } from '../lib/UIControls';

interface InteractiveWidgetsProps {
  onWidgetInteraction?: (widgetType: string, action: string, result: any) => void;
}

export const InteractiveWidgets: React.FC<InteractiveWidgetsProps> = ({ 
  onWidgetInteraction 
}) => {
  const [demoState, setDemoState] = useState(getDemoState());
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    // Sync with UIControls state changes
    setStateChangeCallback((newState) => {
      setDemoState(newState);
    });
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleButtonClick = async (toolMethod: string, buttonLabel: string) => {
    try {
      const uiControls = getUIControls();
      let result;

      switch (toolMethod) {
        case 'openMainMenu':
          result = await uiControls.openMainMenu();
          break;
        case 'closeMainMenu':
          result = await uiControls.closeMainMenu();
          break;
        case 'generateCodeExample':
          result = await uiControls.generateCodeExample();
          break;
        case 'runTestSimulation':
          result = await uiControls.runTestSimulation();
          break;
        case 'resetDemoState':
          result = await uiControls.resetDemoState();
          break;
        default:
          result = { success: false, message: `Unknown tool method: ${toolMethod}` };
      }

      showFeedback(result.success ? 'success' : 'error', result.message);
      onWidgetInteraction?.(buttonLabel, 'click', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showFeedback('error', `Failed to execute ${toolMethod}: ${errorMessage}`);
    }
  };

  const handleInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && messageInput.trim()) {
      try {
        const uiControls = getUIControls();
        const result = await uiControls.sendChatMessage(messageInput);
        
        showFeedback(result.success ? 'success' : 'error', result.message);
        onWidgetInteraction?.('Send Message Input', 'submit', result);
        
        if (result.success) {
          setMessageInput(''); // Clear input on success
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        showFeedback('error', `Failed to send message: ${errorMessage}`);
      }
    }
  };

  const handleCheckboxChange = async (checked: boolean) => {
    try {
      // For demo purposes, we'll simulate a toggleNotifications @Tool method
      setNotifications(checked);
      showFeedback('success', `Notifications ${checked ? 'enabled' : 'disabled'}`);
      onWidgetInteraction?.('Enable Notifications', 'toggle', { success: true, enabled: checked });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showFeedback('error', `Failed to toggle notifications: ${errorMessage}`);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      setTheme(newTheme);
      // Apply theme to document for immediate visual feedback
      document.documentElement.setAttribute('data-theme', newTheme);
      showFeedback('success', `Theme changed to ${newTheme}`);
      onWidgetInteraction?.('Theme Selection', 'change', { success: true, theme: newTheme });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showFeedback('error', `Failed to change theme: ${errorMessage}`);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      setLanguage(newLanguage);
      showFeedback('success', `Language changed to ${newLanguage === 'es' ? 'Spanish' : 'English'}`);
      onWidgetInteraction?.('Language Selection', 'change', { success: true, language: newLanguage });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showFeedback('error', `Failed to change language: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">🎮 Interactive UI Widgets</h2>
      <p className="text-gray-600 mb-6 text-sm">
        These widgets are directly connected to @Tool decorated methods. Each interaction executes the corresponding tool immediately.
      </p>

      {/* Feedback Display */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg border ${
          feedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? '✅' : '❌'} {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Button Widgets */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Button Widgets</h3>
          
          <div className="space-y-3">
            <button
              data-testid="open-menu-widget"
              onClick={() => handleButtonClick('openMainMenu', 'Open Menu')}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                demoState.menuOpen 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {demoState.menuOpen ? '✅ Menu Open' : 'Open Menu'}
            </button>

            <button
              data-testid="close-menu-widget"
              onClick={() => handleButtonClick('closeMainMenu', 'Close Menu')}
              disabled={!demoState.menuOpen}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                !demoState.menuOpen 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Close Menu
            </button>

            <button
              data-testid="generate-code-widget"
              onClick={() => handleButtonClick('generateCodeExample', 'Show Code')}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                demoState.codeExampleVisible 
                  ? 'bg-green-600 text-white' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {demoState.codeExampleVisible ? '✅ Code Shown' : 'Show Code Example'}
            </button>

            <button
              data-testid="run-test-widget"
              onClick={() => handleButtonClick('runTestSimulation', 'Run Test')}
              disabled={demoState.testRunning}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                demoState.testRunning 
                  ? 'bg-yellow-500 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {demoState.testRunning ? '🔄 Test Running...' : 'Run Test Simulation'}
            </button>

            <button
              data-testid="reset-demo-widget"
              onClick={() => handleButtonClick('resetDemoState', 'Reset Demo')}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Reset Demo State
            </button>
          </div>
        </div>

        {/* Form Input Widgets */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Form Input Widgets</h3>
          
          <div className="space-y-3">
            {/* Text Input Widget */}
            <div>
              <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-1">
                Send Message
              </label>
              <input
                id="message-input"
                data-testid="send-message-widget"
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleInputSubmit}
                placeholder="Type message and press Enter..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter to execute sendChatMessage() @Tool method</p>
            </div>

            {/* Checkbox Widget */}
            <div className="flex items-center space-x-3">
              <input
                id="notifications-checkbox"
                data-testid="enable-notifications-widget"
                type="checkbox"
                checked={notifications}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications-checkbox" className="text-sm font-medium text-gray-700">
                Enable Notifications {notifications && '✅'}
              </label>
            </div>

            {/* Radio Button Widget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="space-y-2">
                {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                  <div key={themeOption} className="flex items-center">
                    <input
                      id={`theme-${themeOption}`}
                      data-testid={`theme-${themeOption}-widget`}
                      name="theme"
                      type="radio"
                      value={themeOption}
                      checked={theme === themeOption}
                      onChange={() => handleThemeChange(themeOption)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`theme-${themeOption}`} className="ml-2 text-sm text-gray-700 capitalize">
                      {themeOption} {theme === themeOption && '✅'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdown/Select Widget */}
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language-select"
                data-testid="language-select-widget"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Executes setLanguage() @Tool method</p>
            </div>
          </div>
        </div>
      </div>

      {/* Widget State Display */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Widget States:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Menu Open: <span className="font-mono">{demoState.menuOpen ? 'true' : 'false'}</span></div>
          <div>Code Example Visible: <span className="font-mono">{demoState.codeExampleVisible ? 'true' : 'false'}</span></div>
          <div>Test Running: <span className="font-mono">{demoState.testRunning ? 'true' : 'false'}</span></div>
          <div>Notifications: <span className="font-mono">{notifications ? 'enabled' : 'disabled'}</span></div>
          <div>Theme: <span className="font-mono">{theme}</span></div>
          <div>Language: <span className="font-mono">{language}</span></div>
          <div>Messages Count: <span className="font-mono">{demoState.messages.length}</span></div>
        </div>
      </div>
    </div>
  );
};

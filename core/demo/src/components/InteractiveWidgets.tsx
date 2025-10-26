/**
 * REQ-001: Interactive UI Widgets with Tool Decorators
 * 
 * Complete component zoo showing ALL UI widgets that correspond to @Tool methods.
 * Each widget directly connects to its @Tool decorated method.
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
  const [formName, setFormName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Sync with UIControls state changes
    setStateChangeCallback((newState) => {
      console.log('🔄 InteractiveWidgets: State updated from UIControls:', newState);
      setDemoState(newState);
    });
    
    // Initialize with current state
    const initialState = getDemoState();
    console.log('🎮 InteractiveWidgets: Initial state:', initialState);
    setDemoState(initialState);
  }, []);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleButtonClick = async (action: 'open' | 'close') => {
    try {
      const uiControls = getUIControls();
      const result = action === 'open' ? await uiControls.openMainMenu() : await uiControls.closeMainMenu();
      showFeedback(result.message);
      onWidgetInteraction?.('Button', action, result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleFeatureToggle = async (checked: boolean) => {
    try {
      const uiControls = getUIControls();
      const result = await uiControls.toggleFeature(checked);
      showFeedback(result.message);
      onWidgetInteraction?.('Checkbox', 'toggle', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    try {
      const uiControls = getUIControls();
      const result = await uiControls.toggleNotifications(checked);
      showFeedback(result.message);
      onWidgetInteraction?.('Checkbox', 'toggle', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handlePriorityChange = async (newPriority: 'high' | 'medium' | 'low') => {
    try {
      const uiControls = getUIControls();
      const result = await uiControls.setPriority(newPriority);
      showFeedback(result.message);
      onWidgetInteraction?.('Radio', 'select', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const uiControls = getUIControls();
      const result = await uiControls.setStatus(newStatus);
      showFeedback(result.message);
      onWidgetInteraction?.('Select', 'change', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      const uiControls = getUIControls();
      const result = await uiControls.setTheme(newTheme);
      showFeedback(result.message);
      onWidgetInteraction?.('Select', 'change', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    
    try {
      const uiControls = getUIControls();
      const result = await uiControls.submitForm(formName);
      setFormName('');
      showFeedback(result.message);
      onWidgetInteraction?.('Form', 'submit', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">🎮 Widget Component Zoo</h3>
      <p className="text-sm text-gray-600 mb-4">
        All UI widgets with @Tool decorators - each interaction executes the corresponding method immediately.
      </p>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
          ✅ {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Button Widgets */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Button Widgets</label>
          <div className="space-y-2">
            <button
              data-testid="open-main-menu"
              onClick={() => handleButtonClick('open')}
              className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                demoState.menuOpen 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {demoState.menuOpen ? '✅ Menu Open' : 'Open Menu'}
            </button>
            <button
              data-testid="close-main-menu"
              onClick={() => handleButtonClick('close')}
              disabled={!demoState.menuOpen}
              className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Close Menu
            </button>
          </div>
        </div>

        {/* Checkbox Widgets */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Checkbox Widgets</label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                data-testid="feature-toggle-widget"
                type="checkbox"
                checked={demoState.featureEnabled}
                onChange={(e) => handleFeatureToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Enable Feature {demoState.featureEnabled && '✅'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                data-testid="notifications-toggle-widget"
                type="checkbox"
                checked={demoState.notificationsEnabled}
                onChange={(e) => handleNotificationsToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Enable Notifications {demoState.notificationsEnabled && '✅'}
              </span>
            </div>
          </div>
        </div>

        {/* Radio Widgets */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Radio Widgets</label>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-1">Priority Level:</div>
            {(['high', 'medium', 'low'] as const).map((level) => (
              <div key={level} className="flex items-center">
                <input
                  data-testid={`priority-${level}-widget`}
                  name="priority"
                  type="radio"
                  value={level}
                  checked={demoState.priority === level}
                  onChange={() => handlePriorityChange(level)}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700 capitalize">
                  {level} {demoState.priority === level && '✅'}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Select Widgets */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Select Widgets</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Status:</label>
              <select
                data-testid="status-select-widget"
                value={demoState.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Theme:</label>
              <select
                data-testid="theme-select-widget"
                value={demoState.theme}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Form Widget - Full Width */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Form Widget</label>
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            data-testid="form-name-widget"
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter your name..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            data-testid="form-submit-widget"
            type="submit"
            disabled={!formName.trim()}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit Form
          </button>
        </form>
      </div>
    </div>
  );
};
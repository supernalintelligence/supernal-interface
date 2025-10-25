/**
 * REQ-001: Interactive UI Widgets with Tool Decorators
 * 
 * Clean component zoo showing standard UI widgets directly connected to @Tool methods.
 * Small sliver above main interface - like a website component showcase.
 */

import React, { useState } from 'react';
import { getUIControls } from '../lib/UIControls';

interface InteractiveWidgetsProps {
  onWidgetInteraction?: (widgetType: string, action: string, result: any) => void;
}

export const InteractiveWidgets: React.FC<InteractiveWidgetsProps> = ({ 
  onWidgetInteraction 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState('inactive');
  const [formName, setFormName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleButtonClick = async () => {
    try {
      const uiControls = getUIControls();
      const result = menuOpen ? await uiControls.closeMainMenu() : await uiControls.openMainMenu();
      setMenuOpen(!menuOpen);
      showFeedback(result.message);
      onWidgetInteraction?.('Button', 'click', result);
    } catch (error) {
      showFeedback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCheckboxChange = async (checked: boolean) => {
    try {
      const uiControls = getUIControls();
      const result = await uiControls.toggleFeature(checked);
      setFeatureEnabled(checked);
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
      setPriority(newPriority);
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
      setStatus(newStatus);
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
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">🎮 Widget Component Zoo</h3>
      <p className="text-sm text-gray-600 mb-4">
        Standard UI widgets with @Tool decorators - each interaction executes the corresponding method immediately.
      </p>

      {/* Feedback */}
      {feedback && (
        <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
          ✅ {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        
        {/* Button Widget */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Button</label>
          <button
            data-testid="menu-toggle-widget"
            onClick={handleButtonClick}
            className={`w-full px-3 py-2 text-sm rounded transition-colors ${
              menuOpen 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {menuOpen ? '✅ Menu Open' : 'Open Menu'}
          </button>
        </div>

        {/* Checkbox Widget */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Checkbox</label>
          <div className="flex items-center space-x-2">
            <input
              data-testid="feature-toggle-widget"
              type="checkbox"
              checked={featureEnabled}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Enable Feature {featureEnabled && '✅'}
            </span>
          </div>
        </div>

        {/* Radio Widget */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Radio</label>
          <div className="space-y-1">
            {(['high', 'medium', 'low'] as const).map((level) => (
              <div key={level} className="flex items-center">
                <input
                  data-testid={`priority-${level}-widget`}
                  name="priority"
                  type="radio"
                  value={level}
                  checked={priority === level}
                  onChange={() => handlePriorityChange(level)}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-1 text-xs text-gray-700 capitalize">
                  {level} {priority === level && '✅'}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Select Widget */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Select</label>
          <select
            data-testid="status-select-widget"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Form Widget */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Form</label>
          <form onSubmit={handleFormSubmit} className="space-y-2">
            <input
              data-testid="form-name-widget"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              data-testid="form-submit-widget"
              type="submit"
              disabled={!formName.trim()}
              className="w-full px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
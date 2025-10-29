/**
 * Settings Modal Component (REQ-004 Demo: Modal-Gated Tools)
 * 
 * Demonstrates tools that are NOT_PRESENT → INTERACTABLE based on modal state.
 */

import React, { useRef, useEffect } from 'react';
import { useToolExposure } from '../hooks/useExposureCollector';
import { useRegisterTool } from '../hooks/useNavigationGraph';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  
  // Register tools with ExposureCollector (REQ-004)
  const saveToolState = useToolExposure('save-settings', saveButtonRef, {
    context: 'settings-modal',
  });
  
  // Register tools with NavigationGraph (REQ-005)
  useRegisterTool('save-settings', 'global.settings-modal');
  useRegisterTool('cancel-settings', 'global.settings-modal');

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null; // Tools are NOT_PRESENT when modal is closed
  }

  const handleSave = () => {
    console.log('✅ Settings saved!');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        data-nav-context="global.settings-modal"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              id="settings-modal-title"
              className="text-2xl font-bold text-gray-900"
            >
              Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                defaultValue="demo_user"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                defaultValue="demo@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Enable notifications</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Enable dark mode</span>
              </label>
            </div>
          </div>

          {/* Tool State Debug Info (only in dev) */}
          {process.env.NODE_ENV === 'development' && saveToolState && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <strong>Tool State (save-settings):</strong> {saveToolState.state} 
              {' '}({['NOT_PRESENT', 'PRESENT', 'VISIBLE', 'EXPOSED', 'INTERACTABLE'][saveToolState.state]})
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              ref={cancelButtonRef}
              data-tool-id="cancel-settings"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              data-tool-id="save-settings"
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}



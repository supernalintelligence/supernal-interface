/**
 * Dashboard with Tabs Component (REQ-005 Demo: Tab-Gated Tools)
 * 
 * Demonstrates tools that require navigation between contexts.
 */

import React, { useState, useRef } from 'react';
import { useToolExposure } from '../hooks/useExposureCollector';
import { useRegisterTool, NavigationContextProvider } from '../hooks/useNavigationGraph';
import { useFakeAuth } from '../lib/FakeAuth';

export function DashboardTabs() {
  const { isLoggedIn } = useFakeAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'security'>('overview');

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
        <p className="text-gray-600">Please login to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            data-tool-id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-selected={activeTab === 'overview'}
          >
            Overview
          </button>
          <button
            data-tool-id="tab-security"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-selected={activeTab === 'security'}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <NavigationContextProvider value="dashboard.overview">
          <OverviewTab />
        </NavigationContextProvider>
      )}
      
      {activeTab === 'security' && (
        <NavigationContextProvider value="dashboard.security">
          <SecurityTab />
        </NavigationContextProvider>
      )}
    </div>
  );
}

function OverviewTab() {
  return (
    <div data-nav-context="dashboard.overview">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Account Status</h4>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Recent Activity</h4>
              <p className="text-sm text-gray-600">Last login: Just now</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Tools Available</h4>
              <p className="text-sm text-gray-600">8 tools registered</p>
            </div>
            <div className="text-3xl">🔧</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const enable2FAButtonRef = useRef<HTMLButtonElement>(null);
  const revokeTokensButtonRef = useRef<HTMLButtonElement>(null);
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeTokens, setActiveTokens] = useState(3);

  // Register tools with ExposureCollector (REQ-004)
  useToolExposure('enable-2fa', enable2FAButtonRef, {
    context: 'dashboard.security',
  });
  useToolExposure('revoke-tokens', revokeTokensButtonRef, {
    context: 'dashboard.security',
  });

  // Register tools with NavigationGraph (REQ-005)
  useRegisterTool('enable-2fa', 'dashboard.security');
  useRegisterTool('revoke-tokens', 'dashboard.security');

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    console.log(`✅ Two-factor authentication ${twoFactorEnabled ? 'disabled' : 'enabled'}!`);
  };

  const handleRevokeTokens = () => {
    setActiveTokens(0);
    console.log('✅ All tokens revoked!');
  };

  return (
    <div data-nav-context="dashboard.security">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
      
      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 mb-3">
                Add an extra layer of security to your account
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {twoFactorEnabled ? '✓ Enabled' : '○ Disabled'}
                </span>
              </div>
            </div>
            <button
              ref={enable2FAButtonRef}
              data-tool-id="enable-2fa"
              onClick={handleEnable2FA}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                twoFactorEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Active Sessions</h4>
              <p className="text-sm text-gray-600 mb-3">
                Manage your active login sessions and API tokens
              </p>
              <div className="text-sm text-gray-700">
                <strong>{activeTokens}</strong> active token{activeTokens !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              ref={revokeTokensButtonRef}
              data-tool-id="revoke-tokens"
              onClick={handleRevokeTokens}
              disabled={activeTokens === 0}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTokens === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Revoke All Tokens
            </button>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Security Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Enable two-factor authentication for added security</li>
            <li>• Regularly review and revoke unused tokens</li>
            <li>• Use strong, unique passwords for your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


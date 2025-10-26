/**
 * Standard header for the @supernal-interface demo site
 * Provides navigation between different pages with persistent chat
 */

import React from 'react';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage = 'home', onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Demo', path: '/' },
    { id: 'docs', label: 'Documentation', path: '/docs' },
    { id: 'examples', label: 'Examples', path: '/examples' },
    { id: 'api', label: 'API Reference', path: '/api' }
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">@supernal-interface</h1>
              <p className="text-xs text-gray-500">AI Tool System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

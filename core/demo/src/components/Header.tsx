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
    { id: 'demo', label: 'Demo', path: '/demo' },
    { id: 'docs', label: 'Documentation', path: '/docs' },
    { id: 'examples', label: 'Examples', path: '/examples' },
    { id: 'api', label: 'API Reference', path: '/api' }
  ];

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('npm install @supernal-interface/core');
    // You could add a toast notification here
  };

  const openGitHub = () => {
    window.open('https://github.com/your-org/supernal-interface', '_blank');
  };

  const copyLLMInstructions = () => {
    const instructions = `# @supernal-interface Deployment Guide

## Quick Start
npm install @supernal-interface/core

## Local Development
git clone https://github.com/your-org/supernal-interface
cd supernal-interface/core/demo
npm install
npm run dev
# Runs on http://localhost:3011

## Vercel Deployment
1. Fork/clone the repository
2. Connect to Vercel
3. Set build command: npm run build
4. Set output directory: .next
5. Deploy

## Key Features
- @Tool decorators for AI-controllable methods
- Automatic tool registration and discovery
- Built-in testing with positive/negative cases
- Natural language command matching
- AI-safe defaults with explicit opt-in
- Danger levels and approval requirements

## Example Usage
@Tool({
  testId: 'save-data',
  description: 'Save user data to database',
  aiEnabled: true,
  dangerLevel: 'moderate',
  examples: ['save data', 'store information', 'persist user data']
})
async saveData(data: any): Promise<{success: boolean; message: string}> {
  // Implementation
  return { success: true, message: 'Data saved successfully' };
}

## Testing
- Built-in comprehensive testing system
- Validates both success and error cases
- Real-time progress feedback
- Integration with chat interface

## Live Demo
https://your-vercel-deployment.vercel.app`;
    
    navigator.clipboard.writeText(instructions);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo and Title - Clickable */}
          <button 
            onClick={() => onNavigate?.('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">@supernal-interface</h1>
              <p className="text-xs text-gray-500">AI Tool System</p>
            </div>
          </button>

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

          {/* Status Indicator with Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">AI Ready</span>
            </div>
            
            {/* Copy for LLM */}
            <button
              onClick={copyLLMInstructions}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Copy for LLM - Complete deployment guide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            
            {/* Copy Install Command */}
            <button
              onClick={copyInstallCommand}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Copy install command"
            >
              npm install
            </button>
            
            {/* GitHub Link */}
            <button
              onClick={openGitHub}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

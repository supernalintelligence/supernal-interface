/**
 * Standard header for the @supernal-interface demo site
 * Provides navigation between different pages with persistent chat
 */

import React from 'react';
import { trackPageView, trackDocumentationUsage } from '../lib/analytics';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage = 'home', onNavigate }) => {
  const [copiedInstall, setCopiedInstall] = React.useState(false);
  const [copiedAI, setCopiedAI] = React.useState(false);

  const navItems = [
    { id: 'demo', label: 'Demo', path: '/demo' },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'docs', label: 'Documentation', path: '/docs' },
    { id: 'examples', label: 'Examples', path: '/examples' },
    { id: 'api', label: 'API Reference', path: '/api' }
  ];

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('npm install @supernal-interface/core');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const openGitHub = () => {
    window.open('https://github.com/your-org/supernal-interface', '_blank');
  };

  const copyForAIAgent = () => {
    const completeGuide = `# @supernal-interface/core - Complete AI Agent Guide

## Overview
Transform any method into an AI-controllable tool with simple decorators. Built-in testing ensures your tools work correctly before AI uses them.

## Installation
npm install @supernal-interface/core

## Quick Start

### 1. Create Tool Provider
\`\`\`typescript
import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'ui-controls' })
export class UIControls {
  @Tool({
    testId: 'theme-toggle',
    description: 'Toggle between light and dark theme',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle theme', 'switch theme', 'change theme'],
    origin: { path: '/demo', elements: ['#theme-toggle'] }
  })
  async toggleTheme(): Promise<{ success: boolean; message: string }> {
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('dark');
    return { success: true, message: \`Theme switched to \${newTheme}\` };
  }

  @Tool({
    testId: 'form-submit',
    description: 'Submit form with user data',
    aiEnabled: true,
    dangerLevel: 'moderate',
    examples: ['submit form', 'save form', 'send form data'],
    origin: { path: '/demo', elements: ['#user-form', '.form-container'] }
  })
  async submitForm(data: { name: string; email: string }): Promise<{ success: boolean; message: string }> {
    if (!data.name || !data.email) {
      return { success: false, message: 'Name and email are required' };
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: 'Please provide a valid email address' };
    }
    return { success: true, message: \`Form submitted successfully for \${data.name}\` };
  }
}
\`\`\`

### 2. Initialize Tools
\`\`\`typescript
import { ToolRegistry } from '@supernal-interface/core/browser';
import { UIControls } from './UIControls';

// Initialize your tools - they auto-register via decorators
const uiControls = new UIControls();

// Verify registration
console.log(ToolRegistry.getAllTools());
\`\`\`

### 3. AI Interface Usage
\`\`\`typescript
import { DemoAIInterface } from './AIInterface';

const aiInterface = new DemoAIInterface();

// Natural language execution
const result = await aiInterface.executeCommand({
  query: 'toggle theme',
  toolId: 'theme-toggle',
  method: 'toggleTheme',
  parameters: {}
});

console.log(result); // { success: true, message: 'Theme switched to dark' }
\`\`\`

### 4. Direct Tool Access
\`\`\`typescript
// Get tool from registry
const tool = ToolRegistry.getTool('theme-toggle');
if (tool) {
  const instance = tool.instance;
  const result = await instance.toggleTheme();
  console.log(result);
}
\`\`\`

## Tool Decorator Options

| Property | Type | Description |
|----------|------|-------------|
| testId | string | Unique identifier for testing |
| description | string | Human-readable description |
| aiEnabled | boolean | Whether AI can execute this tool |
| dangerLevel | 'safe' \\| 'moderate' \\| 'destructive' | Risk level for approval |
| examples | string[] | Natural language examples for AI matching |
| origin | object | Path and element availability specification |

## Danger Levels
- **safe**: No approval required, safe for AI execution
- **moderate**: May require approval for sensitive operations  
- **destructive**: Always requires approval for dangerous operations

## Tool Origin Tracking
\`\`\`typescript
origin: { 
  path: '/demo',                    // Tool only works on /demo page
  elements: ['#theme-toggle'],      // Specific UI elements it controls
  modal: 'settings'                 // Optional: only when modal is open
}
\`\`\`

## Testing System
The system includes comprehensive testing that validates:
- ✅ Positive cases: Valid parameters should succeed
- ❌ Negative cases: Invalid parameters should fail gracefully
- 🔍 Edge cases: Missing parameters and boundary conditions
- 📊 Real-time feedback: Progress bars and detailed results

## Local Development
\`\`\`bash
git clone https://github.com/your-org/supernal-interface
cd supernal-interface/core/demo
npm install
npm run dev
# Runs on http://localhost:3011
\`\`\`

## Vercel Deployment
1. Fork/clone the repository
2. Connect to Vercel  
3. Set build command: npm run build
4. Set output directory: .next
5. Deploy

## Core Architecture
- **ToolRegistry**: Central registry for all decorated tools
- **@Tool**: Decorator to mark methods as AI-controllable
- **@ToolProvider**: Decorator to mark classes as tool providers
- **ToolMetadata**: Interface describing registered tools

## Browser Support
\`\`\`typescript
import { ToolRegistry } from '@supernal-interface/core/browser';

// Search tools by natural language
const tools = ToolRegistry.searchTools('save user data');

// Get all registered tools
const allTools = ToolRegistry.getAllTools();
\`\`\`

## Use Cases
- 🖥️ UI Automation: Let AI control buttons, forms, and interface elements
- 🔧 DevOps Tools: Deploy, monitor, and manage infrastructure via AI
- 📊 Data Analysis: Query databases and generate reports through AI
- 🤖 AI Agents: Build autonomous agents with safe, testable actions

## Live Demo
https://supernal-interface-demo.vercel.app

## NPM Package
https://www.npmjs.com/package/@supernal-interface/core

## Repository
https://github.com/your-org/supernal-interface`;
    
    navigator.clipboard.writeText(completeGuide);
    trackDocumentationUsage('ai-agent-guide', 'copy');
    setCopiedAI(true);
    setTimeout(() => setCopiedAI(false), 2000);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo and Title - Clickable */}
          <button 
            onClick={() => {
              onNavigate?.('home');
              trackPageView('home');
            }}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Supernal Interface Logo" 
                className="w-8 h-8 rounded-lg"
                onError={(e) => {
                  // Fallback to gradient logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg items-center justify-center hidden">
                <span className="text-white font-bold text-sm">SI</span>
              </div>
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
                onClick={() => {
                  onNavigate?.(item.id);
                  trackPageView(item.id);
                }}
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

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Copy for AI Agent */}
            <button
              onClick={copyForAIAgent}
              className={`flex items-center space-x-2 px-3 py-1 text-xs rounded transition-colors ${
                copiedAI 
                  ? 'bg-green-700 text-white' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title="Copy for AI Agent - Complete guide with examples"
            >
              {copiedAI ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                  <span>Copy for AI Agent</span>
                </>
              )}
            </button>
            
            {/* Copy Install Command */}
            <button
              onClick={copyInstallCommand}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                copiedInstall 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title="Copy install command"
            >
              {copiedInstall ? (
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </span>
              ) : (
                'npm install'
              )}
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

/**
 * @supernal-interface/core Clean Demo
 * 
 * Layout: [header] [widget examples] [widget tool examples click enabled][chat] [how to documentation]
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { initializeUIControls } from '../lib/UIControls';
import { DemoAIInterface, AICommand } from '../lib/AIInterface';
import { ToolRegistry } from '@supernal-interface/core/browser';
import { InteractiveWidgets } from '../components/InteractiveWidgets';
import { Header } from '../components/Header';
import { ChatBubble } from '../components/ChatBubble';
import { ToolTestResults } from '../components/ToolTestResults';
import { QuickToolTest } from '../lib/QuickToolTest';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
}

export default function LandingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [aiInterface] = useState(() => new DemoAIInterface());
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [quickTestResults, setQuickTestResults] = useState<any>(null);
  const [quickTestProgress, setQuickTestProgress] = useState<{
    current: number;
    total: number;
    testName: string;
    isRunning: boolean;
  } | null>(null);

  // Initialize the UI controls and messages on mount
  useEffect(() => {
    initializeUIControls();
    
    // Initialize messages client-side to avoid hydration issues
    setMessages(getInitialMessages());
    
    // Get available tools for the tool list - group by category
    const tools = Array.from(ToolRegistry.getAllTools().values())
      .filter(t => t.aiEnabled)
      .sort((a, b) => {
        // Sort by category first, then by name
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
    setAvailableTools(tools);
  }, []);

  const addMessage = (text: string, type: 'user' | 'ai' | 'system') => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      type,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAICommand = async (input: string) => {
    if (!input.trim()) return;
    
    addMessage(input, 'user');
    
    try {
      const command = aiInterface.findToolsForCommand(input);
      const response = await aiInterface.executeCommand(command, true);
      addMessage(response.message, 'ai');
    } catch (error) {
      addMessage(`Error: ${error instanceof Error ? error.message : String(error)}`, 'ai');
    }
  };

  const executeToolDirectly = async (tool: any) => {
    try {
      // Use the first example as the query to ensure proper parameter extraction
      const query = tool.examples[0] || tool.name;
      const command = aiInterface.findToolsForCommand(query);
      const response = await aiInterface.executeCommand(command, true);
      addMessage(`🔧 Executed "${tool.name}" via "${query}": ${response.message}`, 'system');
    } catch (error) {
      addMessage(`❌ Failed to execute "${tool.name}": ${error instanceof Error ? error.message : String(error)}`, 'system');
    }
  };

  const handleWidgetInteraction = (widgetType: string, action: string, result: any) => {
    addMessage(`🎮 Widget "${widgetType}" ${action}: ${result.message}`, 'system');
  };

  const getInitialMessages = (): Message[] => [
    {
      id: '1',
      text: '👋 Welcome to @supernal-interface Demo!',
      type: 'system',
      timestamp: new Date().toISOString()
    },
    {
      id: '2', 
      text: 'This is NOT real AI - it\'s a demo showing how AI would interact with @Tool decorated methods.',
      type: 'system',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      text: '🎮 Try these commands to see tool execution:\n• "toggle notifications"\n• "set theme dark"\n• "open menu"\n• "set priority high"',
      type: 'system', 
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      text: 'Watch how each command finds and executes the corresponding @Tool method, then updates the widgets above! 🔧',
      type: 'system',
      timestamp: new Date().toISOString()
    }
  ];

  const handleClearChat = () => {
    setMessages(getInitialMessages());
  };

  const runQuickTest = async () => {
    const quickTest = new QuickToolTest();
    setQuickTestProgress({ current: 0, total: 8, testName: 'Initializing...', isRunning: true });
    setQuickTestResults(null);
    addMessage('🧪 Running quick tool validation...', 'system');
    
    try {
      const results = await quickTest.testParameterBasedTools(
        (current, total, testName, result) => {
          setQuickTestProgress({ current, total, testName, isRunning: true });
          if (result) {
            addMessage(`${result.passed ? '✅' : '❌'} ${testName}: ${result.passed ? 'PASS' : 'FAIL'}`, 'system');
          }
        },
        1200 // 1.2 second delay between tests for better visibility
      );
      
      setQuickTestProgress(null);
      setQuickTestResults(results);
      addMessage(`🧪 Quick Test Complete: ${results.passed}/${results.passed + results.failed} passed (${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%)`, 'system');
      
      if (results.failed > 0) {
        const failedTests = results.results.filter(r => !r.passed).map(r => r.name);
        addMessage(`❌ Failed tests: ${failedTests.join(', ')}`, 'system');
      } else {
        addMessage('🎉 All parameter-based tools are working correctly!', 'system');
      }
    } catch (error) {
      setQuickTestProgress(null);
      addMessage(`❌ Quick test failed: ${error instanceof Error ? error.message : String(error)}`, 'system');
    }
  };

  return (
    <>
      <Head>
        <title>@supernal-interface/core - AI Tool System Demo</title>
        <meta name="description" content="Working demo of the @supernal-interface/core AI tool system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        
        {/* Header */}
        <Header 
          currentPage={currentPage} 
          onNavigate={(page) => setCurrentPage(page)} 
        />

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {currentPage === 'home' && (
            <>
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg text-white p-8 mb-8">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl font-bold mb-4">@supernal-interface</h1>
                  <p className="text-xl mb-6 opacity-90">
                    Equip your AI repositories with tools that make them easy to test and expose as LLM-controllable interfaces
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage('demo')}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Try Live Demo
                    </button>
                    <button
                      onClick={() => setCurrentPage('docs')}
                      className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Simple Decorators</h3>
                  <p className="text-gray-600">
                    Transform any method into an AI-controllable tool with simple <code className="bg-gray-100 px-1 rounded">@Tool</code> decorators. 
                    No complex setup required.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🧪</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Built-in Testing</h3>
                  <p className="text-gray-600">
                    Comprehensive testing system validates both positive and negative cases automatically. 
                    Ensure your tools work correctly before AI uses them.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI-Safe by Default</h3>
                  <p className="text-gray-600">
                    Tools are test-only by default. Explicit opt-in for AI control with danger levels and approval requirements.
                  </p>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                      <div>
                        <h3 className="font-semibold mb-2">Decorate Your Methods</h3>
                        <p className="text-gray-600 text-sm">Add <code className="bg-gray-100 px-1 rounded">@Tool</code> decorators to methods you want AI to control.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                      <div>
                        <h3 className="font-semibold mb-2">Automatic Registration</h3>
                        <p className="text-gray-600 text-sm">Tools are automatically discovered and registered in the global registry.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                      <div>
                        <h3 className="font-semibold mb-2">Natural Language Control</h3>
                        <p className="text-gray-600 text-sm">AI matches natural language commands to your tools using examples and descriptions.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                      <div>
                        <h3 className="font-semibold mb-2">Test & Deploy</h3>
                        <p className="text-gray-600 text-sm">Built-in testing validates functionality before AI execution.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
                    <div className="mb-2 text-gray-400">// Example: AI-controllable button</div>
                    <pre>{`@Tool({
  testId: 'save-button',
  description: 'Save user data',
  aiEnabled: true,
  dangerLevel: 'safe',
  examples: ['save data', 'save file']
})
async saveData(): Promise<{
  success: boolean; 
  message: string 
}> {
  // Your implementation
  return { 
    success: true, 
    message: 'Data saved!' 
  };
}`}</pre>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Perfect For</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🖥️</span>
                    </div>
                    <h3 className="font-semibold mb-2">UI Automation</h3>
                    <p className="text-gray-600 text-sm">Let AI control buttons, forms, and interface elements</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔧</span>
                    </div>
                    <h3 className="font-semibold mb-2">DevOps Tools</h3>
                    <p className="text-gray-600 text-sm">Deploy, monitor, and manage infrastructure via AI</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="font-semibold mb-2">Data Analysis</h3>
                    <p className="text-gray-600 text-sm">Query databases and generate reports through AI</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="font-semibold mb-2">AI Agents</h3>
                    <p className="text-gray-600 text-sm">Build autonomous agents with safe, testable actions</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentPage === 'demo' && (
            <>
              {/* Widget Examples - Component Zoo */}
              <InteractiveWidgets onWidgetInteraction={handleWidgetInteraction} />

              {/* Quick Test Button */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">⚡ Quick Tool Validation</h3>
                <p className="text-sm text-gray-600">Test parameter-based tools that were previously failing</p>
              </div>
              <button
                onClick={runQuickTest}
                disabled={quickTestProgress?.isRunning}
                className={`px-4 py-2 text-white rounded transition-colors font-medium ${
                  quickTestProgress?.isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {quickTestProgress?.isRunning ? 'Testing...' : 'Run Quick Test'}
              </button>
            </div>
            
            {quickTestProgress && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Testing: {quickTestProgress.testName}
                  </span>
                  <span className="text-sm text-blue-600">
                    {quickTestProgress.current}/{quickTestProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(quickTestProgress.current / quickTestProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {quickTestResults && !quickTestProgress && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">Results: </span>
                  <span className="text-green-600">{quickTestResults.passed} passed</span>
                  {quickTestResults.failed > 0 && (
                    <span className="text-red-600">, {quickTestResults.failed} failed</span>
                  )}
                  <span className="ml-2 text-gray-600">
                    ({((quickTestResults.passed / (quickTestResults.passed + quickTestResults.failed)) * 100).toFixed(1)}% pass rate)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tool Test Results */}
          <ToolTestResults onTestComplete={(summary) => {
            addMessage(`🧪 Test Results: ${summary.passedTests}/${summary.totalTests} passed (${summary.passRate.toFixed(1)}%)`, 'system');
          }} />

          {/* Available Tool Methods - 3 Column Layout */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🔧 Available @Tool Methods</h3>
            <p className="text-sm text-gray-600 mb-6">
              Click any tool to execute it directly (simulates AI command execution):
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTools.map((tool) => (
                <div key={tool.testId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800 text-sm">{tool.name}</h4>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tool.dangerLevel === 'safe' ? 'bg-green-100 text-green-800' :
                        tool.dangerLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tool.dangerLevel}
                      </span>
                      {tool.requiresApproval && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                          ⚠️
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                  
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Example command:</div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
                      "{tool.examples[0]}"
                    </code>
                  </div>
                  
                  <button
                    onClick={() => executeToolDirectly(tool)}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                    data-testid={`execute-${tool.testId}`}
                  >
                    Execute Tool
                  </button>
                </div>
              ))}
            </div>
          </div>


              {/* How It Works - Quick Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">📚 How It Works</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">1. Widget Examples</h4>
                    <p className="text-sm text-gray-600">
                      Standard UI components (buttons, checkboxes, forms) decorated with <code className="bg-gray-100 px-1 rounded">@Tool</code> 
                      decorators. Each interaction executes the corresponding method immediately.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">2. Tool Registry</h4>
                    <p className="text-sm text-gray-600">
                      All <code className="bg-gray-100 px-1 rounded">@Tool</code> decorated methods are automatically 
                      registered and can be executed directly or via AI commands. Click any tool to execute it.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">3. AI Interface</h4>
                    <p className="text-sm text-gray-600">
                      Natural language commands are matched to registered tools using examples and descriptions. 
                      The AI can execute any tool marked as <code className="bg-gray-100 px-1 rounded">aiEnabled: true</code>.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800 mb-2">🚀 Key Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Automatic Registration:</strong> @Tool decorators auto-register methods</li>
                    <li>• <strong>AI-Safe Defaults:</strong> Tools are test-only by default, must opt-in to AI control</li>
                    <li>• <strong>Danger Levels:</strong> Safe, moderate, destructive with approval requirements</li>
                    <li>• <strong>Natural Language:</strong> AI matches commands to tools using examples</li>
                    <li>• <strong>Direct Execution:</strong> No DOM simulation, direct method calls</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {currentPage === 'docs' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">📖 Documentation</h2>
              
              <div className="space-y-8">
                {/* Copy for LLM Section */}
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-800">🤖 Copy for LLM - Deployment Instructions</h3>
                    <button
                      onClick={() => {
                        const text = document.getElementById('llm-instructions')?.innerText || '';
                        navigator.clipboard.writeText(text);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy All
                    </button>
                  </div>
                  <div id="llm-instructions" className="bg-white p-4 rounded border text-sm font-mono whitespace-pre-wrap">
{`# @supernal-interface Deployment Guide

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
https://your-vercel-deployment.vercel.app`}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Getting Started</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 mb-4">
                      The @supernal-interface system allows you to create AI-controllable tools using simple decorators.
                      Here's how to get started:
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">1. Install the Package</h4>
                      <code className="bg-gray-800 text-green-400 p-2 rounded block">
                        npm install @supernal-interface/core
                      </code>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">2. Create a Tool Provider</h4>
                      <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'ui-controls' })
export class MyTools {
  @Tool({
    testId: 'my-button',
    description: 'Click a button',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['click button', 'press button']
  })
  async clickButton(): Promise<{ success: boolean; message: string }> {
    // Your implementation here
    return { success: true, message: 'Button clicked!' };
  }
}`}
                      </pre>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">3. Register and Use</h4>
                      <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`import { ToolRegistry } from '@supernal-interface/core';
import { MyTools } from './MyTools';

// Initialize your tools
const myTools = new MyTools();

// Tools are automatically registered via decorators
// Now they're available for AI execution!`}
                      </pre>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Tool Decorator Options</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">testId</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">string</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Unique identifier for testing</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">description</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">string</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Human-readable description</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">aiEnabled</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">boolean</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Whether AI can execute this tool</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">dangerLevel</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'safe' | 'moderate' | 'destructive'</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Risk level for approval requirements</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">examples</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">string[]</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Natural language examples for AI matching</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}

          {currentPage === 'examples' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">💡 Examples</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Basic Button Control</h3>
                  <p className="text-gray-600 mb-4">Simple button interaction with AI control:</p>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`@Tool({
  testId: 'open-menu-button',
  description: 'Open the main menu',
  aiEnabled: true,
  dangerLevel: 'safe',
  examples: ['open menu', 'show menu', 'display menu']
})
async openMainMenu(): Promise<{ success: boolean; message: string }> {
  this.menuOpen = true;
  return { success: true, message: 'Main menu opened' };
}`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Parameter-Based Tools</h3>
                  <p className="text-gray-600 mb-4">Tools that accept parameters from natural language:</p>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`@Tool({
  testId: 'theme-selector',
  description: 'Change the application theme',
  aiEnabled: true,
  dangerLevel: 'safe',
  examples: ['set theme dark', 'change theme light', 'use auto theme']
})
async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<{ success: boolean; message: string }> {
  if (!['light', 'dark', 'auto'].includes(theme)) {
    return { 
      success: false, 
      message: 'Invalid theme. Use: light, dark, or auto' 
    };
  }
  
  this.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  return { success: true, message: \`Theme changed to \${theme}\` };
}`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Form Handling</h3>
                  <p className="text-gray-600 mb-4">Processing form data through AI commands:</p>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`@Tool({
  testId: 'user-form',
  description: 'Submit user information form',
  aiEnabled: true,
  dangerLevel: 'moderate',
  examples: ['submit form with John', 'send form data', 'save user info']
})
async submitForm(name: string): Promise<{ success: boolean; message: string }> {
  if (!name || name.trim().length === 0) {
    return { 
      success: false, 
      message: 'Name is required' 
    };
  }
  
  // Process the form data
  await this.saveUserData({ name: name.trim() });
  return { success: true, message: \`Form submitted for \${name}\` };
}`}
                  </pre>
                </section>
              </div>
            </div>
          )}

          {currentPage === 'api' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">🔧 API Reference</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Core Classes</h3>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">ToolRegistry</h4>
                      <p className="text-gray-600 mb-3">Central registry for all @Tool decorated methods.</p>
                      
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">getAllTools(): Map&lt;string, ToolMetadata&gt;</code>
                          <p className="text-xs text-gray-600 mt-1">Returns all registered tools</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">searchTools(query: string): ToolMetadata[]</code>
                          <p className="text-xs text-gray-600 mt-1">Search tools by natural language query</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">getToolsByCategory(category: string): ToolMetadata[]</code>
                          <p className="text-xs text-gray-600 mt-1">Get tools by provider category</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">ToolMetadata</h4>
                      <p className="text-gray-600 mb-3">Interface describing a registered tool.</p>
                      
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">name: string</code>
                          <p className="text-xs text-gray-600 mt-1">Tool display name</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">methodName: string</code>
                          <p className="text-xs text-gray-600 mt-1">Actual method name</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">testId: string</code>
                          <p className="text-xs text-gray-600 mt-1">Unique test identifier</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">aiEnabled: boolean</code>
                          <p className="text-xs text-gray-600 mt-1">Whether AI can execute this tool</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">dangerLevel: 'safe' | 'moderate' | 'destructive'</code>
                          <p className="text-xs text-gray-600 mt-1">Risk assessment level</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <code className="text-sm">examples: string[]</code>
                          <p className="text-xs text-gray-600 mt-1">Natural language examples</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Decorators</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">@Tool(options)</h4>
                      <p className="text-gray-600 mb-3">Marks a method as an AI-controllable tool.</p>
                      <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm">
{`interface ToolOptions {
  testId: string;
  description: string;
  aiEnabled?: boolean;
  dangerLevel?: 'safe' | 'moderate' | 'destructive';
  requiresApproval?: boolean;
  examples?: string[];
}`}
                      </pre>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">@ToolProvider(options)</h4>
                      <p className="text-gray-600 mb-3">Marks a class as a provider of tools.</p>
                      <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm">
{`interface ToolProviderOptions {
  category: string;
  description?: string;
}`}
                      </pre>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Chat Bubble */}
        <ChatBubble 
          messages={messages}
          onSendMessage={handleAICommand}
          onClearChat={handleClearChat}
        />
      </div>
    </>
  );
}
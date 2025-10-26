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
import { CodeBlock, InlineCode } from '../components/CodeBlock';
import { initializeAnalytics, trackPageView, trackToolExecution, trackDemoInteraction, trackTestExecution } from '../lib/analytics';
import { getDashboardUrl, checkDashboardAvailability, getDashboardAlternatives } from '../lib/dashboardIntegration';

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
  const [dashboardAvailable, setDashboardAvailable] = useState<boolean | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string>('');

  // Initialize the UI controls and messages on mount
  useEffect(() => {
    initializeUIControls();
    initializeAnalytics();
    
    // Initialize messages client-side to avoid hydration issues
    setMessages(getInitialMessages());
    
    // Set up dashboard integration
    setDashboardUrl(getDashboardUrl());
    
  }, []);

  // Check dashboard availability when dashboard page is accessed
  useEffect(() => {
    if (currentPage === 'dashboard' && getDashboardConfig().enabled) {
      setDashboardAvailable(null); // Show loading state
      checkDashboardAvailability().then(setDashboardAvailable);
    }
  }, [currentPage]);

  useEffect(() => {
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
        <title>Supernal Interface - Make Any App AI-Controllable | Universal AI Tool System</title>
        <meta name="description" content="Transform any application into an AI-controllable system with simple @Tool decorators. Built-in testing, safety controls, and natural language processing. Try the live demo now." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* SEO Meta Tags */}
        <meta name="keywords" content="AI tools, artificial intelligence, automation, decorators, TypeScript, JavaScript, testing, natural language processing, tool registry, supernal" />
        <meta name="author" content="Supernal AI" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://interface.supernal.ai" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://interface.supernal.ai" />
        <meta property="og:title" content="Supernal Interface - Make Any App AI-Controllable" />
        <meta property="og:description" content="Transform any application into an AI-controllable system with simple @Tool decorators. Built-in testing, safety controls, and natural language processing." />
        <meta property="og:image" content="https://interface.supernal.ai/logo.png" />
        <meta property="og:site_name" content="Supernal Interface" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://interface.supernal.ai" />
        <meta name="twitter:title" content="Supernal Interface - Make Any App AI-Controllable" />
        <meta name="twitter:description" content="Transform any application into an AI-controllable system with simple @Tool decorators. Built-in testing, safety controls, and natural language processing." />
        <meta name="twitter:image" content="https://interface.supernal.ai/logo.png" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Supernal Interface",
              "description": "Universal AI Tool System - Make any application AI-controllable with simple decorators",
              "url": "https://interface.supernal.ai",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Supernal AI",
                "url": "https://supernal.ai"
              },
              "featureList": [
                "AI-controllable tools with @Tool decorators",
                "Built-in testing and validation",
                "Natural language processing",
                "Safety controls and danger levels",
                "TypeScript and JavaScript support",
                "Automated tool discovery"
              ]
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        
        {/* Header */}
        <Header 
          currentPage={currentPage} 
          onNavigate={(page) => setCurrentPage(page)} 
        />


        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Dashboard</h2>
              <p className="text-lg text-gray-600">
                {getDashboardConfig().enabled 
                  ? "Real-time progress tracking and requirements management"
                  : "Development-focused project management dashboard"
                }
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {!getDashboardConfig().enabled && (
                <div className="text-center py-20">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard for Development</h3>
                    <p className="text-gray-600 mb-6">The Supernal Coding dashboard is designed for local development and project management.</p>
                    
                    <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
                      <h4 className="font-semibold text-blue-900 mb-3">Development Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">Requirements Management</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Create and track requirements</li>
                            <li>• Validate requirement structure</li>
                            <li>• Generate test frameworks</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">Workflow Integration</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Kanban board visualization</li>
                            <li>• Git workflow automation</li>
                            <li>• Progress tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-sm text-gray-600">
                      <p>To use the dashboard in your development environment:</p>
                      <code className="block bg-gray-800 text-green-400 px-3 py-2 rounded text-sm mt-2">
                        sc dashboard serve
                      </code>
                    </div>
                  </div>
                </div>
              )}
              
              {getDashboardConfig().enabled && dashboardAvailable === true && (
                <iframe 
                  src={dashboardUrl}
                  width="100%" 
                  height="800"
                  className="border-0 rounded-lg"
                  title="Supernal Coding Dashboard"
                  onError={() => setDashboardAvailable(false)}
                />
              )}
              
              {getDashboardConfig().enabled && dashboardAvailable === false && (
                <div className="text-center py-20">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Not Available</h3>
                    <p className="text-gray-600 mb-4">The Supernal Coding dashboard is not currently running.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6">
                      {Object.entries(getDashboardAlternatives()).map(([key, option]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{option.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                          <code className="block bg-gray-800 text-green-400 px-3 py-2 rounded text-xs">
                            {option.command}
                          </code>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => checkDashboardAvailability().then(setDashboardAvailable)}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Check Again
                    </button>
                  </div>
                </div>
              )}
              
              {getDashboardConfig().enabled && dashboardAvailable === null && (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Checking dashboard availability...</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Dashboard Features</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Requirements tracking and validation</li>
                  <li>• Kanban workflow visualization</li>
                  <li>• Progress metrics and analytics</li>
                  <li>• Git integration and branch management</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">Supernal-Coding Commands</h3>
                <div className="space-y-2 text-green-700">
                  <code className="block bg-green-100 px-2 py-1 rounded text-sm">sc req new "Feature Name"</code>
                  <code className="block bg-green-100 px-2 py-1 rounded text-sm">sc dashboard serve</code>
                  <code className="block bg-green-100 px-2 py-1 rounded text-sm">sc git-smart merge</code>
                </div>
              </div>
            </div>
          </div>
        )}

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
              
              <div className="space-y-12">
                {/* 1-2-3 Breakdown */}
                <section>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Three Simple Steps</h3>
                    <p className="text-gray-600">Transform any method into an AI-controllable tool</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-800">Decorate Your Components</h4>
                      <p className="text-gray-600 mb-4">Add <InlineCode>@Tool</InlineCode> decorators to your methods</p>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">2</span>
                      </div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-800">Expose to Your System</h4>
                      <p className="text-gray-600 mb-4">Initialize classes to auto-register tools</p>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-purple-600">3</span>
                      </div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-800">Use and Execute</h4>
                      <p className="text-gray-600 mb-4">AI can now control your tools via natural language</p>
                    </div>
                  </div>
                </section>

                {/* Detailed Implementation */}
                <section>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Complete Implementation Guide</h3>
                  
                  {/* Step 1 Detail */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-blue-600">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Decorate Your Components</h4>
                    </div>
                    
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">
                        Start by installing the package and adding decorators to your existing methods:
                      </p>
                      
                      <div className="mb-4">
                        <CodeBlock language="bash" title="Installation">
{`npm install @supernal-interface/core`}
                        </CodeBlock>
                      </div>
                      
                      <CodeBlock language="typescript" title="UIControls.ts">
{`import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'ui-controls' })
export class UIControls {
  private currentTheme = 'light';
  
  @Tool({
    testId: 'theme-toggle',
    description: 'Toggle between light and dark theme',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['toggle theme', 'switch theme', 'change theme'],
    origin: { path: '/demo', elements: ['#theme-toggle'] }
  })
  async toggleTheme(): Promise<{ success: boolean; message: string }> {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark');
    return { 
      success: true, 
      message: \`Theme switched to \${this.currentTheme}\` 
    };
  }

  @Tool({
    testId: 'form-submit',
    description: 'Submit form with user data',
    aiEnabled: true,
    dangerLevel: 'moderate',
    examples: ['submit form', 'save form', 'send form data'],
    origin: { path: '/demo', elements: ['#user-form'] }
  })
  async submitForm(data: { name: string; email: string }): Promise<{ success: boolean; message: string }> {
    // Validation
    if (!data.name || !data.email) {
      return { success: false, message: 'Name and email are required' };
    }
    
    // Process form
    console.log('Processing form:', data);
    return { success: true, message: \`Form submitted for \${data.name}\` };
  }
}`}
                      </CodeBlock>
                    </div>
                  </div>
                  
                  {/* Step 2 Detail */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-green-600">2</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Expose to Your System</h4>
                    </div>
                    
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">
                        Initialize your tool classes to automatically register them with the system:
                      </p>
                      
                      <CodeBlock language="typescript" title="app.ts">
{`import { ToolRegistry } from '@supernal-interface/core/browser';
import { UIControls } from './UIControls';

// Initialize your tool providers - they auto-register via decorators
const uiControls = new UIControls();

// Verify registration (optional)
console.log('Registered tools:', ToolRegistry.getAllTools());

// You can also search for specific tools
const themeTools = ToolRegistry.searchTools('theme');
console.log('Theme-related tools:', themeTools);`}
                      </CodeBlock>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-blue-800 mb-2">🔍 What happens during registration:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Tools are automatically discovered via decorators</li>
                          <li>• Each tool gets a unique ID and metadata</li>
                          <li>• Natural language examples are indexed for AI matching</li>
                          <li>• Origin information is stored for context-aware execution</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 3 Detail */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-purple-600">3</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Use and Execute</h4>
                    </div>
                    
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">
                        Now your tools are ready for AI execution through multiple interfaces:
                      </p>
                      
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-medium mb-2 text-gray-700">AI Interface (Natural Language)</h5>
                          <CodeBlock language="typescript" title="AI Execution">
{`import { DemoAIInterface } from './AIInterface';

const aiInterface = new DemoAIInterface();

// Natural language execution
const result = await aiInterface.executeCommand({
  query: 'toggle theme',
  toolId: 'theme-toggle',
  method: 'toggleTheme',
  parameters: {}
});

console.log(result);
// Output: { success: true, message: 'Theme switched to dark' }

// With parameters
const formResult = await aiInterface.executeCommand({
  query: 'submit form with John Doe',
  toolId: 'form-submit', 
  method: 'submitForm',
  parameters: { name: 'John Doe', email: 'john@example.com' }
});`}
                          </CodeBlock>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2 text-gray-700">Direct Tool Access</h5>
                          <CodeBlock language="typescript" title="Direct Execution">
{`// Get tool from registry
const tool = ToolRegistry.getTool('theme-toggle');
if (tool) {
  const instance = tool.instance;
  const result = await instance.toggleTheme();
  console.log(result);
}

// Or find by search
const tools = ToolRegistry.searchTools('submit form');
const formTool = tools[0];
if (formTool) {
  const result = await formTool.instance.submitForm({
    name: 'Jane Doe',
    email: 'jane@example.com'
  });
}`}
                          </CodeBlock>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2 text-gray-700">Testing Integration</h5>
                          <CodeBlock language="typescript" title="Automated Testing">
{`import { ToolTester } from './ToolTester';

const tester = new ToolTester();

// Run comprehensive tests
const results = await tester.runAllTests();
console.log(\`Tests: \${results.passed} passed, \${results.failed} failed\`);

// Test specific tool
const themeResults = await tester.testTool('theme-toggle');
console.log('Theme toggle tests:', themeResults);`}
                          </CodeBlock>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-green-800 mb-2">✅ Your tools are now:</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Controllable via natural language commands</li>
                          <li>• Automatically tested for reliability</li>
                          <li>• Context-aware based on page/element availability</li>
                          <li>• Safe with built-in danger level controls</li>
                        </ul>
                      </div>
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
              
              <div className="space-y-12">
                {/* Example 1: Basic Theme Toggle */}
                <section>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Basic Tool Creation</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Code</h4>
                      <CodeBlock language="typescript" title="ThemeControls.ts">
{`@Tool({
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
  
  return {
    success: true,
    message: \`Theme switched to \${newTheme}\`
  };
}`}
                      </CodeBlock>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Execution & Results</h4>
                      <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
                        <div>
                          <span className="text-sm text-gray-600 font-medium">Tool Registration:</span>
                          <CodeBlock language="typescript" title="Automatic Registration">
{`// Tools are automatically registered when class is instantiated
import { UIControls } from './UIControls';
const uiControls = new UIControls();

// Check registration
import { ToolRegistry } from '@supernal-interface/core/browser';
console.log(ToolRegistry.getAllTools());
// Output: Map with 'theme-toggle' tool registered`}
                          </CodeBlock>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600 font-medium">AI Execution:</span>
                          <CodeBlock language="typescript" title="AI Interface Usage">
{`import { DemoAIInterface } from './AIInterface';
const aiInterface = new DemoAIInterface();

// Natural language execution
const result = await aiInterface.executeCommand({
  query: 'toggle theme',
  toolId: 'theme-toggle',
  method: 'toggleTheme',
  parameters: {}
});

console.log(result);
// Output: { success: true, message: 'Theme switched to dark' }`}
                          </CodeBlock>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600 font-medium">Direct Tool Access:</span>
                          <CodeBlock language="typescript" title="Direct Method Call">
{`// Get tool from registry
const tool = ToolRegistry.getTool('theme-toggle');
if (tool) {
  const instance = tool.instance;
  const result = await instance.toggleTheme();
  console.log(result);
  // Output: { success: true, message: 'Theme switched to light' }
}`}
                          </CodeBlock>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="text-sm text-blue-800">
                            <strong>💡 Available Commands:</strong><br/>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <InlineCode copyable>toggle theme</InlineCode>
                              <InlineCode copyable>switch theme</InlineCode>
                              <InlineCode copyable>change theme</InlineCode>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Example 2: Form Handling with Validation */}
                <section>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Form Handling with Validation</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Code</h4>
                      <CodeBlock language="typescript" title="FormControls.ts">
{`@Tool({
  testId: 'form-submit',
  description: 'Submit form with user data',
  aiEnabled: true,
  dangerLevel: 'moderate',
  examples: ['submit form', 'save form', 'send form data'],
  origin: { path: '/demo', elements: ['#user-form', '.form-container'] }
})
async submitForm(data: { name: string; email: string }): Promise<{ success: boolean; message: string }> {
  // Validate input
  if (!data.name || !data.email) {
    return {
      success: false,
      message: 'Name and email are required'
    };
  }
  
  // Email validation
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: 'Please provide a valid email address'
    };
  }
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: \`Form submitted successfully for \${data.name}\`
  };
}`}
                      </CodeBlock>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Execution & Test Results</h4>
                      <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
                        <div>
                          <span className="text-sm text-gray-600 font-medium">AI Command Processing:</span>
                          <CodeBlock language="typescript" title="Natural Language to Parameters">
{`// AI processes natural language and extracts parameters
const command = aiInterface.findToolsForCommand('submit form with John Doe');
console.log(command);
// Output: {
//   toolId: 'form-submit',
//   method: 'submitForm', 
//   parameters: { name: 'John Doe', email: 'john@example.com' }
// }

const result = await aiInterface.executeCommand(command);`}
                          </CodeBlock>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600 font-medium">Validation & Results:</span>
                          <div className="space-y-3">
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <div className="text-sm text-green-800">
                                ✅ <strong>Valid Input:</strong><br/>
                                <code className="text-xs">{"{ name: 'John', email: 'john@example.com' }"}</code><br/>
                                <strong>Result:</strong> Form submitted successfully
                              </div>
                            </div>
                            
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <div className="text-sm text-red-800">
                                ❌ <strong>Missing Data:</strong><br/>
                                <code className="text-xs">{"{ name: '', email: 'john@example.com' }"}</code><br/>
                                <strong>Result:</strong> Name and email are required
                              </div>
                            </div>
                            
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <div className="text-sm text-red-800">
                                ❌ <strong>Invalid Email:</strong><br/>
                                <code className="text-xs">{"{ name: 'John', email: 'invalid-email' }"}</code><br/>
                                <strong>Result:</strong> Please provide a valid email address
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600 font-medium">Automated Testing:</span>
                          <CodeBlock language="typescript" title="Test Execution">
{`import { ToolTester } from './ToolTester';
const tester = new ToolTester();

// Test the form tool with various inputs
const results = await tester.testTool('form-submit');
console.log(\`Form tests: \${results.passed}/\${results.total} passed\`);

// Results show validation working correctly
results.forEach(test => {
  console.log(\`\${test.name}: \${test.passed ? '✅' : '❌'}\`);
});`}
                          </CodeBlock>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Example 3: Tool Origin Tracking */}
                <section>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Tool Origin Tracking</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium mb-3 text-blue-800">Understanding Tool Origins</h4>
                    <p className="text-blue-700 mb-4">
                      The <InlineCode>origin</InlineCode> property helps AI understand where tools are available and what UI elements they interact with.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-blue-800">Path-based Availability</h5>
                        <CodeBlock language="typescript">
{`origin: { 
  path: '/demo',
  elements: ['#theme-toggle', '.form-container']
}`}
                        </CodeBlock>
                        <p className="text-sm text-blue-600 mt-2">Tool only works on the /demo page</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2 text-blue-800">Modal-based Availability</h5>
                        <CodeBlock language="typescript">
{`origin: { 
  path: '/admin',
  elements: ['#settings-modal'],
  modal: 'settings'
}`}
                        </CodeBlock>
                        <p className="text-sm text-blue-600 mt-2">Tool only works when settings modal is open</p>
                      </div>
                    </div>
                  </div>
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
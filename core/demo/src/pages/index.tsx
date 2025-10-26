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
    addMessage('🧪 Running quick tool validation...', 'system');
    try {
      const results = await quickTest.testParameterBasedTools();
      setQuickTestResults(results);
      addMessage(`🧪 Quick Test Results: ${results.passed}/${results.passed + results.failed} passed (${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%)`, 'system');
      
      if (results.failed > 0) {
        const failedTests = results.results.filter(r => !r.passed).map(r => r.name);
        addMessage(`❌ Failed tests: ${failedTests.join(', ')}`, 'system');
      }
    } catch (error) {
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
              >
                Run Quick Test
              </button>
            </div>
            {quickTestResults && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">Results: </span>
                  <span className="text-green-600">{quickTestResults.passed} passed</span>
                  {quickTestResults.failed > 0 && (
                    <span className="text-red-600">, {quickTestResults.failed} failed</span>
                  )}
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


          {/* How To Documentation */}
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
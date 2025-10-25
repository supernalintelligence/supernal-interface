/**
 * @supernal-interface/core Landing Page & Working Demo
 * 
 * This is a REAL working demo that uses the actual @supernal-interface/core system.
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { initializeUIControls, setStateChangeCallback, getDemoState } from '../lib/UIControls';
import { DemoAIInterface, AICommand } from '../lib/AIInterface';
import { ToolRegistry } from '@supernal-interface/core/browser';
import { ToolVisualization } from '../components/ToolVisualization';
import { AutoTesting } from '../components/AutoTesting';
import { InteractiveWidgets } from '../components/InteractiveWidgets';
import { safeConfirm } from '../utils/browserUtils';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
}

interface DemoState {
  menuOpen: boolean;
  chatPanelOpen: boolean;
  messages: Message[];
  codeExampleVisible: boolean;
  testRunning: boolean;
}

export default function LandingPage() {
  const [demoState, setDemoState] = useState<DemoState>({
    menuOpen: false,
    chatPanelOpen: true,
    messages: [
      {
        id: '1',
        text: 'FAKE 🤖 AI Assistant Ready! This is a REAL working demo of @supernal-interface/core.',
        type: 'system',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        text: 'Try commands like: "open menu", "show code", "run test", or "clear chat"',
        type: 'system',
        timestamp: new Date().toISOString()
      }
    ],
    codeExampleVisible: false,
    testRunning: false
  });
  
  const [aiInput, setAiInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [aiInterface] = useState(() => new DemoAIInterface());
  const [toolStats, setToolStats] = useState<{
    total: number;
    aiEnabled: number;
    testOnly: number;
    byCategory: Record<string, number>;
    byDangerLevel: Record<string, number>;
    requiresApproval?: number;
  } | null>(null);
  const [pendingCommand, setPendingCommand] = useState<AICommand | null>(null);
  const [activeTab, setActiveTab] = useState<'demo' | 'tools' | 'testing'>('demo');

  // Initialize the UI controls on mount
  useEffect(() => {
    initializeUIControls();
    
    // Set up state change callback to sync with React state
    setStateChangeCallback((newState) => {
      setDemoState(newState);
    });
    
    // Initialize with current state
    setDemoState(getDemoState());
    
    const stats = ToolRegistry.getStats();
    const allTools = Array.from(ToolRegistry.getAllTools().values());
    const requiresApproval = allTools.filter(t => t.requiresApproval).length;
    setToolStats({ ...stats, requiresApproval });
    
    // Only add event listeners in browser
    if (typeof window === 'undefined') return;
    
    // Listen for custom events from tool executions
    const handleMenuOpened = () => setDemoState(prev => ({ ...prev, menuOpen: true }));
    const handleMenuClosed = () => setDemoState(prev => ({ ...prev, menuOpen: false }));
    const handleChatToggled = () => setDemoState(prev => ({ ...prev, chatPanelOpen: !prev.chatPanelOpen }));
    const handleCodeGenerated = () => setDemoState(prev => ({ ...prev, codeExampleVisible: true }));
    const handleTestStarted = () => setDemoState(prev => ({ ...prev, testRunning: true }));
    const handleStateReset = () => setDemoState(prev => ({ 
      ...prev, 
      menuOpen: false, 
      codeExampleVisible: false, 
      testRunning: false 
    }));
    const handleChatCleared = () => setDemoState(prev => ({ 
      ...prev, 
      messages: [
        {
          id: Date.now().toString(),
          text: '🧹 Chat cleared by AI',
          type: 'system',
          timestamp: new Date().toISOString()
        }
      ]
    }));
    
    window.addEventListener('navigation:menu-opened', handleMenuOpened);
    window.addEventListener('navigation:menu-closed', handleMenuClosed);
    window.addEventListener('chat:panel-toggled', handleChatToggled);
    window.addEventListener('demo:code-generated', handleCodeGenerated);
    window.addEventListener('demo:test-started', handleTestStarted);
    window.addEventListener('demo:state-reset', handleStateReset);
    window.addEventListener('chat:history-cleared', handleChatCleared);
    
    return () => {
      if (typeof window === 'undefined') return;
      window.removeEventListener('navigation:menu-opened', handleMenuOpened);
      window.removeEventListener('navigation:menu-closed', handleMenuClosed);
      window.removeEventListener('chat:panel-toggled', handleChatToggled);
      window.removeEventListener('demo:code-generated', handleCodeGenerated);
      window.removeEventListener('demo:test-started', handleTestStarted);
      window.removeEventListener('demo:state-reset', handleStateReset);
      window.removeEventListener('chat:history-cleared', handleChatCleared);
    };
  }, []);

  const addMessage = (text: string, type: 'user' | 'ai' | 'system') => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      type,
      timestamp: new Date().toISOString()
    };
    setDemoState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const handleAICommand = async () => {
    if (!aiInput.trim()) return;

    console.log(`🎯 User command: "${aiInput}"`);
    addMessage(aiInput, 'user');
    
    const command = aiInterface.findToolsForCommand(aiInput);
    console.log(`🔍 Found command:`, command);
    
    if (command.requiresApproval) {
      console.log(`⚠️ Command requires approval: ${command.tool?.name}`);
      setPendingCommand(command);
      addMessage(`⚠️ "${command.tool?.name}" requires approval. This is a ${command.tool?.dangerLevel} action. Approve?`, 'ai');
    } else {
      console.log(`▶️ Executing command without approval...`);
      const response = await aiInterface.executeCommand(command);
      console.log(`📋 Execution response:`, response);
      addMessage(response.message, 'ai');
      
      if (response.success && response.executedTool) {
        addMessage(`✅ Executed: ${response.executedTool}`, 'system');
      }
    }
    
    setAiInput('');
  };

  // Direct tool execution service
  const executeToolDirectly = async (tool: any) => {
    console.log(`🔧 Executing tool: ${tool.name}`);
    addMessage(`🔧 Executing tool: ${tool.name} (${tool.dangerLevel} level)`, 'system');
    
    if (tool.requiresApproval) {
      const approved = safeConfirm(`⚠️ "${tool.name}" is a ${tool.dangerLevel} action. Are you sure you want to execute it?`);
      if (!approved) {
        console.log(`❌ Tool execution cancelled: ${tool.name}`);
        addMessage(`❌ Tool execution cancelled: ${tool.name}`, 'system');
        return;
      }
      addMessage(`✅ User approved dangerous action: ${tool.name}`, 'system');
    }
    
    // Show tool details
    addMessage(`📋 Tool Details: testId="${tool.testId}", elementType="${tool.elementType}", actionType="${tool.actionType}"`, 'system');
    
    // Create a mock command for direct execution
    const directCommand = {
      query: `Direct execution: ${tool.name}`,
      tool: tool,
      confidence: 1.0,
      requiresApproval: tool.requiresApproval
    };
    
    console.log(`🎯 Executing direct command for: ${tool.name}`);
    addMessage(`🎯 Executing @Tool method: ${tool.methodName}()`, 'ai');
    
    const response = await aiInterface.executeCommand(directCommand, true);
    addMessage(response.message, 'ai');
    
    if (response.success) {
      console.log(`✅ Tool executed successfully: ${tool.name}`);
      addMessage(`✅ SUCCESS: ${tool.name} executed successfully! 🎉`, 'system');
      
      // Show what actually happened
      if (response.executedTool) {
        addMessage(`🔍 Result: ${response.executedTool}`, 'system');
      }
    } else {
      console.log(`❌ Tool execution failed: ${tool.name}`);
      addMessage(`❌ FAILED: ${tool.name} execution failed`, 'system');
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!pendingCommand) return;
    
    const response = await aiInterface.executeCommand(pendingCommand, approved);
    addMessage(response.message, 'ai');
    
    if (approved && response.success) {
      addMessage(`✅ Approved and executed: ${response.executedTool}`, 'system');
    } else if (!approved) {
      addMessage('❌ Action denied for safety', 'system');
    }
    
    setPendingCommand(null);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    addMessage(chatInput, 'user');
    
    // Simulate AI response
    setTimeout(() => {
      addMessage(`Echo: ${chatInput}`, 'ai');
    }, 500);
    
    setChatInput('');
  };

  return (
    <>
      <Head>
        <title>@supernal-interface/core - Universal AI Interface & Testing</title>
        <meta name="description" content="Make any application AI-controllable and auto-testable with decorators" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-supernal-blue">
                  @supernal-interface/core
                </div>
                <div className="text-sm text-gray-500">
                  Universal AI Interface & Testing
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  data-testid="open-main-menu"
                  onClick={() => setDemoState(prev => ({ ...prev, menuOpen: true }))}
                  className="px-4 py-2 bg-supernal-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Open Menu
                </button>
                
                <button
                  data-testid="navigate-to-docs"
                  onClick={() => addMessage('📚 Navigated to documentation', 'system')}
                  className="px-4 py-2 bg-supernal-green text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Docs
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Menu Overlay */}
        {demoState.menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Navigation Menu</h3>
              <p className="text-gray-600 mb-6">This is a regular UI menu opened by clicking the button above. The @Tool methods can also open/close this menu via AI commands.</p>
              <div className="flex space-x-4">
                <button
                  data-testid="close-main-menu"
                  onClick={() => setDemoState(prev => ({ ...prev, menuOpen: false }))}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Make Any Application AI-Controllable
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              One decorator system that generates AI interfaces, test simulations, and documentation
            </p>
            
            {/* Tool Statistics */}
            {toolStats && (
              <div className="inline-flex items-center space-x-6 bg-white rounded-lg px-6 py-3 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-supernal-blue">{toolStats.total}</div>
                  <div className="text-sm text-gray-500">Total Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-supernal-green">{toolStats.aiEnabled}</div>
                  <div className="text-sm text-gray-500">AI Enabled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-supernal-yellow">{toolStats.testOnly}</div>
                  <div className="text-sm text-gray-500">Test Only</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-supernal-red">{toolStats.requiresApproval || 0}</div>
                  <div className="text-sm text-gray-500">Require Approval</div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'demo', label: 'Interactive Demo', icon: '🎮' },
                { id: 'tools', label: 'Available Tools', icon: '🔧' },
                { id: 'testing', label: 'Auto-Testing', icon: '🧪' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-supernal-blue text-supernal-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'demo' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Interactive UI Widgets - REQ-001 */}
                  <InteractiveWidgets 
                    onWidgetInteraction={(widgetType, action, result) => {
                      addMessage(`🎮 Widget "${widgetType}" ${action}: ${result.message}`, 'system');
                    }}
                  />

                  {/* Available Tools Kit */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">🔧 Available Tools</h2>
                    <p className="text-gray-600 mb-4">
                      These are @Tool decorated methods that AI can discover and execute. Type the exact commands below:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {toolStats && Array.from(ToolRegistry.getAllTools().values())
                        .filter(tool => tool.aiEnabled)
                        .map((tool) => (
                          <div key={tool.testId} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-supernal-blue">{tool.name}</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                                tool.dangerLevel === 'safe' ? 'bg-green-500' :
                                tool.dangerLevel === 'moderate' ? 'bg-yellow-500' :
                                tool.dangerLevel === 'dangerous' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}>
                                {tool.dangerLevel.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{tool.description}</p>
                            <div className="text-xs mb-2">
                              <strong>Commands:</strong>
                              <div className="mt-1 space-y-1">
                                {tool.examples.map((example, i) => (
                                  <div key={i} className="bg-white px-2 py-1 rounded border font-mono text-xs cursor-pointer hover:bg-blue-50 text-gray-800"
                                       onClick={() => setAiInput(example)}
                                       title="Click to use this command">
                                    "{example}"
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                              <strong>Test ID:</strong> <code>{tool.testId}</code>
                            </div>
                            <button
                              onClick={() => executeToolDirectly(tool)}
                              className={`w-full px-3 py-2 rounded text-xs font-semibold text-white transition-colors ${
                                tool.dangerLevel === 'safe' ? 'bg-green-600 hover:bg-green-700' :
                                tool.dangerLevel === 'moderate' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              {tool.requiresApproval ? '⚠️ Execute (Requires Approval)' : '▶️ Execute Tool'}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* AI Command Interface */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">🤖 AI Command Interface</h2>
                    <p className="text-gray-600 mb-4">
                      Type any command from the tools above. The system will find and execute the matching @Tool method.
                    </p>
                    
                    <div className="flex space-x-3 mb-4">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
                        placeholder="Try: 'open menu', 'show code', 'clear chat'..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supernal-blue focus:border-transparent text-gray-900 bg-white"
                      />
                      <button
                        onClick={handleAICommand}
                        className="px-6 py-2 bg-supernal-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Execute Tool Command
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold mb-2">💡 How It Works:</h3>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Type any command from the tool examples above</li>
                        <li>2. System finds matching @Tool decorated method</li>
                        <li>3. Executes the tool with proper safety controls</li>
                        <li>4. Check browser console for tool schema details</li>
                      </ol>
                    </div>

                {pendingCommand && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 mb-3">
                      ⚠️ Approval required for: <strong>{pendingCommand.tool?.name}</strong>
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproval(true)}
                        className="px-4 py-2 bg-supernal-green text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(false)}
                        className="px-4 py-2 bg-supernal-red text-white rounded hover:bg-red-600"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actual UI Buttons (Not Tools) */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">🎮 Actual UI Buttons</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  These are regular UI buttons that demonstrate the interface. The @Tool methods above can interact with these elements.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    data-testid="generate-code-example"
                    onClick={() => setDemoState(prev => ({ ...prev, codeExampleVisible: true }))}
                    className="px-4 py-2 bg-supernal-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Show Code
                  </button>
                  
                  <button
                    data-testid="run-test-simulation"
                    onClick={() => setDemoState(prev => ({ ...prev, testRunning: true }))}
                    className="px-4 py-2 bg-supernal-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Run Test
                  </button>
                  
                  <button
                    data-testid="reset-demo-state"
                    onClick={() => setDemoState(prev => ({ 
                      ...prev, 
                      menuOpen: false, 
                      codeExampleVisible: false, 
                      testRunning: false 
                    }))}
                    className="px-4 py-2 bg-supernal-yellow text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Reset Demo
                  </button>
                  
                  <button
                    data-testid="delete-demo-data"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.confirm('⚠️ Delete all demo data?')) {
                        addMessage('🗑️ Demo data deleted (DESTRUCTIVE)', 'system');
                      }
                    }}
                    className="px-4 py-2 bg-supernal-red text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Data
                  </button>
                </div>
              </div>

              {/* Code Example */}
              {demoState.codeExampleVisible && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">📋 Generated @Tool Code</h2>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
{`@ToolProvider({ category: 'navigation' })
export class NavigationProvider {
  
  @Tool({
    testId: 'open-main-menu',
    description: 'Open the main navigation menu',
    aiEnabled: true,
    dangerLevel: 'safe',
    examples: ['open menu', 'show navigation']
  })
  async openMainMenu(): Promise<{ success: boolean; message: string }> {
    // Real implementation that both AI and tests can use
    const menuButton = document.querySelector('[data-testid="open-main-menu"]');
    menuButton?.click();
    return { success: true, message: 'Menu opened' };
  }
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Test Simulation */}
              {demoState.testRunning && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">🎭 Test Simulation Running</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-supernal-green rounded-full animate-pulse"></div>
                      <span>✅ NavigationSimulation.openMainMenu() - PASSED</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-supernal-green rounded-full animate-pulse"></div>
                      <span>✅ ChatSimulation.sendMessage() - PASSED</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-supernal-green rounded-full animate-pulse"></div>
                      <span>✅ DemoSimulation.generateCodeExample() - PASSED</span>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800">🎉 All tests passed! The same @Tool decorators work for both AI and testing.</p>
                    </div>
                  </div>
                </div>
              )}
                </div>

                {/* Chat Panel - Permanent */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">💬 AI Chat & Tool Execution</h2>
                <p className="text-sm text-gray-600">Real-time feedback from tool execution and AI responses</p>
              </div>
                
                <div className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4 space-y-2 bg-gray-50">
                  {demoState.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg text-sm ${
                        msg.type === 'user'
                          ? 'bg-supernal-blue text-white ml-8'
                          : msg.type === 'ai'
                          ? 'bg-gray-100 text-gray-800 mr-8'
                          : 'bg-yellow-50 text-yellow-800 text-center'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 mb-3">
                  <input
                    data-testid="chat-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-supernal-blue focus:border-transparent text-gray-900 bg-white"
                  />
                  <button
                    data-testid="send-chat-message"
                    onClick={handleSendChatMessage}
                    className="px-4 py-2 bg-supernal-green text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Send
                  </button>
                </div>

                <button
                  data-testid="clear-chat-history"
                  onClick={() => setDemoState(prev => ({ ...prev, messages: [] }))}
                  className="w-full px-3 py-2 bg-supernal-yellow text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                >
                  Clear Chat
                </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <ToolVisualization
                onToolExecute={(tool) => {
                  addMessage(`🔧 Executed tool: ${tool.name}`, 'system');
                }}
                onToolTest={(tool) => {
                  addMessage(`🧪 Tested tool: ${tool.name}`, 'system');
                }}
              />
            )}

            {activeTab === 'testing' && (
              <AutoTesting
                onTestComplete={(results) => {
                  const passed = results.filter(r => r.status === 'passed').length;
                  const total = results.length;
                  addMessage(`🧪 Auto-testing complete: ${passed}/${total} tests passed`, 'system');
                }}
              />
            )}
          </div>

          {/* How It Works */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-center mb-8">How @supernal-interface/core Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🏷️</div>
                <h3 className="text-lg font-semibold mb-2">1. Decorate Methods</h3>
                <p className="text-gray-600">Add @Tool decorators to your methods with testId and safety settings</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">2. AI Discovers Tools</h3>
                <p className="text-gray-600">AI finds tools by natural language and executes them safely</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-lg font-semibold mb-2">3. Tests Use Same Tools</h3>
                <p className="text-gray-600">Playwright tests use identical interfaces for automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

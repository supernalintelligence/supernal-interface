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

interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
}

export default function LandingPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🤖 AI Assistant Ready! Try commands like: "open menu", "toggle feature", "set priority high"',
      type: 'system',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [aiInterface] = useState(() => new DemoAIInterface());
  const [availableTools, setAvailableTools] = useState<any[]>([]);

  // Initialize the UI controls on mount
  useEffect(() => {
    initializeUIControls();
    
    // Get available tools for the tool list
    const tools = Array.from(ToolRegistry.getAllTools().values())
      .filter(t => t.aiEnabled)
      .sort((a, b) => a.name.localeCompare(b.name));
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
    setChatInput('');
    
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
      const command = { query: tool.name, tool, confidence: 1, requiresApproval: false };
      const response = await aiInterface.executeCommand(command, true);
      addMessage(`🔧 Executed "${tool.name}": ${response.message}`, 'system');
    } catch (error) {
      addMessage(`❌ Failed to execute "${tool.name}": ${error instanceof Error ? error.message : String(error)}`, 'system');
    }
  };

  const handleWidgetInteraction = (widgetType: string, action: string, result: any) => {
    addMessage(`🎮 Widget "${widgetType}" ${action}: ${result.message}`, 'system');
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
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">@supernal-interface/core</h1>
            <p className="text-gray-600 mt-2">AI Tool System - Working Demo</p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {/* Widget Examples - Component Zoo */}
          <InteractiveWidgets onWidgetInteraction={handleWidgetInteraction} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Widget Tool Examples - Click Enabled */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">🔧 Available @Tool Methods</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click any tool to execute it directly (simulates AI command execution):
              </p>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableTools.map((tool) => (
                  <div key={tool.testId} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{tool.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tool.dangerLevel === 'safe' ? 'bg-green-100 text-green-800' :
                        tool.dangerLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tool.dangerLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Examples: {tool.examples.slice(0, 2).join(', ')}
                      </div>
                      <button
                        onClick={() => executeToolDirectly(tool)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">💬 AI Chat Interface</h3>
              <p className="text-sm text-gray-600 mb-4">
                Type natural language commands to execute tools via AI:
              </p>
              
              {/* Messages */}
              <div className="border border-gray-200 rounded p-4 h-80 overflow-y-auto mb-4 bg-gray-50">
                {messages.map((message) => (
                  <div key={message.id} className="mb-3">
                    <div className={`inline-block px-3 py-2 rounded max-w-xs ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : message.type === 'ai'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleAICommand(chatInput); }} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a command (e.g., 'open menu', 'toggle feature')..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
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
      </div>
    </>
  );
}
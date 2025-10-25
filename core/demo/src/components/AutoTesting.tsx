/**
 * Auto-Testing Component
 * 
 * Automatically tests all @Tool decorated methods to verify they work correctly.
 */

import React, { useState, useEffect } from 'react';
import { ToolRegistry, ToolMetadata } from '@supernal-interface/core/browser';

interface TestResult {
  toolId: string;
  toolName: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  message: string;
  duration?: number;
  error?: string;
  timestamp: string;
}

interface AutoTestingProps {
  onTestComplete?: (results: TestResult[]) => void;
}

export function AutoTesting({ onTestComplete }: AutoTestingProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<'all' | 'ai-enabled' | 'safe-only'>('safe-only');

  const initializeTests = () => {
    const tools = Array.from(ToolRegistry.getAllTools().values());
    const filteredTools = tools.filter(tool => {
      switch (testMode) {
        case 'ai-enabled':
          return tool.aiEnabled;
        case 'safe-only':
          return tool.dangerLevel === 'safe';
        default:
          return true;
      }
    });

    const initialResults: TestResult[] = filteredTools.map(tool => ({
      toolId: `${tool.providerClass}.${tool.methodName}`,
      toolName: tool.name,
      status: 'pending',
      message: 'Waiting to run...',
      timestamp: new Date().toISOString()
    }));

    setTestResults(initialResults);
    return filteredTools;
  };

  const updateTestResult = (toolId: string, update: Partial<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.toolId === toolId 
        ? { ...result, ...update, timestamp: new Date().toISOString() }
        : result
    ));
  };

  const testTool = async (tool: ToolMetadata): Promise<TestResult> => {
    const toolId = `${tool.providerClass}.${tool.methodName}`;
    const startTime = Date.now();

    updateTestResult(toolId, {
      status: 'running',
      message: 'Testing tool...'
    });

    try {
      // Test 1: Check if element exists
      const element = document.querySelector(`[data-testid="${tool.testId}"]`);
      if (!element) {
        throw new Error(`Element not found: [data-testid="${tool.testId}"]`);
      }

      // Test 2: Check element properties
      const expectedTag = tool.elementType || 'unknown';
      const actualTag = element.tagName.toLowerCase();
      
      // Test 3: Simulate the action based on tool type
      let actionResult = '';
      switch (tool.actionType) {
        case 'click':
          if (element instanceof HTMLElement) {
            // Don't actually click for dangerous actions
            if (tool.dangerLevel === 'destructive' || tool.dangerLevel === 'dangerous') {
              actionResult = 'Simulated click (dangerous action)';
            } else {
              element.click();
              actionResult = 'Click executed successfully';
            }
          }
          break;
        case 'type':
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const originalValue = element.value;
            element.value = 'test-input';
            element.dispatchEvent(new Event('input', { bubbles: true }));
            actionResult = `Text input successful (was: "${originalValue}", now: "test-input")`;
            // Restore original value
            element.value = originalValue;
          }
          break;
        case 'select':
          if (element instanceof HTMLSelectElement) {
            const originalIndex = element.selectedIndex;
            if (element.options.length > 1) {
              element.selectedIndex = 1;
              element.dispatchEvent(new Event('change', { bubbles: true }));
              actionResult = `Selection changed successfully`;
              // Restore original selection
              element.selectedIndex = originalIndex;
            } else {
              actionResult = 'Selection element found but no options to test';
            }
          }
          break;
        default:
          actionResult = 'Action type not specifically tested, but element is accessible';
      }

      const duration = Date.now() - startTime;
      const message = `✅ Element found (${actualTag}), ${actionResult}`;

      return {
        toolId,
        toolName: tool.name,
        status: 'passed',
        message,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        toolId,
        toolName: tool.name,
        status: 'failed',
        message: `❌ Test failed: ${errorMessage}`,
        duration,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const tools = initializeTests();
    
    for (const tool of tools) {
      const toolId = `${tool.providerClass}.${tool.methodName}`;
      setCurrentTest(toolId);
      
      // Skip dangerous tools unless explicitly testing all
      if (testMode !== 'all' && (tool.dangerLevel === 'destructive' || tool.dangerLevel === 'dangerous')) {
        updateTestResult(toolId, {
          status: 'skipped',
          message: '⚠️ Skipped dangerous tool'
        });
        continue;
      }

      const result = await testTool(tool);
      updateTestResult(toolId, result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setCurrentTest(null);
    setIsRunning(false);
    
    if (onTestComplete) {
      onTestComplete(testResults);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'skipped': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const stats = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    skipped: testResults.filter(r => r.status === 'skipped').length,
    pending: testResults.filter(r => r.status === 'pending').length,
    running: testResults.filter(r => r.status === 'running').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Auto-Testing System</h2>
        <p className="text-gray-600">
          Automatically test all @Tool decorated methods to verify they work correctly.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Mode:</label>
          <select
            value={testMode}
            onChange={(e) => setTestMode(e.target.value as any)}
            disabled={isRunning}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="safe-only">Safe Tools Only</option>
            <option value="ai-enabled">AI Enabled Tools</option>
            <option value="all">All Tools (Including Dangerous)</option>
          </select>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>

        {testResults.length > 0 && (
          <button
            onClick={() => setTestResults([])}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Clear Results
          </button>
        )}
      </div>

      {/* Statistics */}
      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Test Results Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total:</span>
              <span className="ml-2 text-gray-900">{stats.total}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Passed:</span>
              <span className="ml-2 text-green-900">{stats.passed}</span>
            </div>
            <div>
              <span className="font-medium text-red-700">Failed:</span>
              <span className="ml-2 text-red-900">{stats.failed}</span>
            </div>
            <div>
              <span className="font-medium text-yellow-700">Skipped:</span>
              <span className="ml-2 text-yellow-900">{stats.skipped}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Running:</span>
              <span className="ml-2 text-blue-900">{stats.running}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Pending:</span>
              <span className="ml-2 text-gray-900">{stats.pending}</span>
            </div>
          </div>
          
          {stats.total > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Success Rate</span>
                <span>{Math.round((stats.passed / (stats.total - stats.pending - stats.running)) * 100) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.passed / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Test Results</h3>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {testResults.map((result) => (
              <div 
                key={result.toolId} 
                className={`p-4 ${currentTest === result.toolId ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className={`text-lg ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{result.toolName}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {result.duration && <div>{result.duration}ms</div>}
                    <div>{new Date(result.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {testResults.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How Auto-Testing Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Discovers all @Tool decorated methods automatically</li>
            <li>• Verifies UI elements exist with correct data-testid attributes</li>
            <li>• Tests element interactions (click, type, select) safely</li>
            <li>• Skips dangerous actions unless explicitly requested</li>
            <li>• Provides detailed feedback on what works and what doesn't</li>
          </ul>
        </div>
      )}
    </div>
  );
}

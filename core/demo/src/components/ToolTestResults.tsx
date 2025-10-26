/**
 * Tool Test Results Component
 * 
 * Displays comprehensive test results for all @Tool methods
 * Shows pass/fail status, expected vs actual results
 */

import React, { useState, useEffect } from 'react';
import { ToolTester, ToolTestSuite, ToolTestResult } from '../lib/ToolTester';

interface ToolTestResultsProps {
  onTestComplete?: (summary: any) => void;
}

export const ToolTestResults: React.FC<ToolTestResultsProps> = ({ onTestComplete }) => {
  const [testSuites, setTestSuites] = useState<ToolTestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  const tester = new ToolTester();

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await tester.runAllTests();
      setTestSuites(results);
      const testSummary = tester.getTestSummary(results);
      setSummary(testSummary);
      onTestComplete?.(testSummary);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSuite = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName);
    } else {
      newExpanded.add(suiteName);
    }
    setExpandedSuites(newExpanded);
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? '✅' : '❌';
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🧪 Tool Test Results</h3>
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {summary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Tests:</span>
              <span className="ml-2 font-medium">{summary.totalTests}</span>
            </div>
            <div>
              <span className="text-gray-600">Passed:</span>
              <span className="ml-2 font-medium text-green-600">{summary.passedTests}</span>
            </div>
            <div>
              <span className="text-gray-600">Failed:</span>
              <span className="ml-2 font-medium text-red-600">{summary.failedTests}</span>
            </div>
            <div>
              <span className="text-gray-600">Pass Rate:</span>
              <span className={`ml-2 font-medium ${summary.passRate >= 90 ? 'text-green-600' : summary.passRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {summary.passRate.toFixed(1)}%
              </span>
            </div>
          </div>
          {summary.failedSuites.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-600">Failed Tools:</span>
              <span className="ml-2 text-red-600">{summary.failedSuites.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {testSuites.length > 0 && (
        <div className="space-y-4">
          {testSuites.map((suite) => (
            <div key={suite.toolName} className="border border-gray-200 rounded-lg">
              <div 
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  suite.overallPassed ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                }`}
                onClick={() => toggleSuite(suite.toolName)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(suite.overallPassed)}</span>
                    <h4 className="font-medium text-gray-800">{suite.toolName}</h4>
                    <span className="text-sm text-gray-500">
                      ({suite.results.filter(r => r.passed).length}/{suite.results.length} passed)
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedSuites.has(suite.toolName) ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedSuites.has(suite.toolName) && (
                <div className="border-t border-gray-200">
                  {suite.results.map((result, index) => (
                    <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg mt-0.5">{getStatusIcon(result.passed)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{result.testCase.name}</h5>
                            <span className={`text-sm font-medium ${getStatusColor(result.passed)}`}>
                              {result.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{result.testCase.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">Query:</span>
                              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">"{result.testCase.query}"</code>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Expected Success:</span>
                              <span className="ml-2">{result.testCase.expectedSuccess ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                            <div className="mb-2">
                              <span className="font-medium text-gray-700">Actual Result:</span>
                              <span className={`ml-2 ${result.actualSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                {result.actualSuccess ? 'Success' : 'Failed'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Message:</span>
                              <span className="ml-2 text-gray-600">{result.actualMessage}</span>
                            </div>
                            {result.error && (
                              <div className="mt-2">
                                <span className="font-medium text-red-700">Error:</span>
                                <span className="ml-2 text-red-600">{result.error}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {testSuites.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Run All Tests" to validate all tool methods</p>
          <p className="text-sm mt-1">Tests include both positive and negative cases</p>
        </div>
      )}
    </div>
  );
};

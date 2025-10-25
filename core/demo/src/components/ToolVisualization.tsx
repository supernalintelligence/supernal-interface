/**
 * Tool Visualization Component
 * 
 * Auto-generates UI elements from @Tool decorated methods to show what AI can do.
 */

import React, { useState, useEffect } from 'react';
import { ToolRegistry, ToolMetadata } from '@supernal-interface/core/browser';

interface ToolCardProps {
  tool: ToolMetadata;
  onExecute: (tool: ToolMetadata) => void;
  onTest: (tool: ToolMetadata) => void;
}

function ToolCard({ tool, onExecute, onTest }: ToolCardProps) {
  const getDangerColor = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dangerous': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'destructive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getElementIcon = (elementType?: string) => {
    switch (elementType) {
      case 'button': return '🔘';
      case 'input': return '📝';
      case 'select': return '📋';
      case 'link': return '🔗';
      default: return '⚙️';
    }
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'click': return '👆';
      case 'type': return '⌨️';
      case 'select': return '☑️';
      case 'navigate': return '🧭';
      default: return '▶️';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getElementIcon(tool.elementType)}</span>
          <h3 className="font-semibold text-gray-900">{tool.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getActionIcon(tool.actionType)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDangerColor(tool.dangerLevel)}`}>
            {tool.dangerLevel}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

      {/* Examples */}
      {tool.examples && tool.examples.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1">AI Commands:</p>
          <div className="flex flex-wrap gap-1">
            {tool.examples.slice(0, 3).map((example, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                "{example}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>TestID: {tool.testId}</span>
        <span>Category: {tool.category}</span>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1 ${tool.aiEnabled ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="text-xs">🤖</span>
            <span className="text-xs">{tool.aiEnabled ? 'AI Enabled' : 'Test Only'}</span>
          </div>
          {tool.requiresApproval && (
            <div className="flex items-center space-x-1 text-orange-600">
              <span className="text-xs">⚠️</span>
              <span className="text-xs">Requires Approval</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onExecute(tool)}
          disabled={!tool.aiEnabled}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
            tool.aiEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {tool.aiEnabled ? 'Execute' : 'AI Disabled'}
        </button>
        <button
          onClick={() => onTest(tool)}
          className="px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Test
        </button>
      </div>
    </div>
  );
}

interface ToolVisualizationProps {
  onToolExecute?: (tool: ToolMetadata) => void;
  onToolTest?: (tool: ToolMetadata) => void;
}

export function ToolVisualization({ onToolExecute, onToolTest }: ToolVisualizationProps) {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [filter, setFilter] = useState<'all' | 'ai-enabled' | 'test-only'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Get all registered tools
    const allTools = Array.from(ToolRegistry.getAllTools().values());
    setTools(allTools);

    // Extract unique categories
    const uniqueCategories = [...new Set(allTools.map(tool => tool.category))];
    setCategories(uniqueCategories);
  }, []);

  const filteredTools = tools.filter(tool => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'ai-enabled' && tool.aiEnabled) ||
      (filter === 'test-only' && !tool.aiEnabled);
    
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  const handleExecute = (tool: ToolMetadata) => {
    if (onToolExecute) {
      onToolExecute(tool);
    } else {
      // Default execution - try to find and click the element
      const element = document.querySelector(`[data-testid="${tool.testId}"]`) as HTMLElement;
      if (element) {
        element.click();
        console.log(`Executed tool: ${tool.name}`);
      } else {
        console.warn(`Element not found for tool: ${tool.name} (${tool.testId})`);
      }
    }
  };

  const handleTest = (tool: ToolMetadata) => {
    if (onToolTest) {
      onToolTest(tool);
    } else {
      // Default test - simulate the action and log result
      console.log(`Testing tool: ${tool.name}`);
      console.log(`- TestID: ${tool.testId}`);
      console.log(`- Element Type: ${tool.elementType}`);
      console.log(`- Action Type: ${tool.actionType}`);
      console.log(`- AI Enabled: ${tool.aiEnabled}`);
      console.log(`- Danger Level: ${tool.dangerLevel}`);
      
      // Try to find the element for testing
      const element = document.querySelector(`[data-testid="${tool.testId}"]`);
      if (element) {
        console.log(`✅ Element found: ${element.tagName}`);
      } else {
        console.log(`❌ Element not found for testId: ${tool.testId}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available AI Tools</h2>
        <p className="text-gray-600">
          Auto-generated from @Tool decorators. These show what AI can control in your application.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Access:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tools ({tools.length})</option>
            <option value="ai-enabled">AI Enabled ({tools.filter(t => t.aiEnabled).length})</option>
            <option value="test-only">Test Only ({tools.filter(t => !t.aiEnabled).length})</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category} ({tools.filter(t => t.category === category).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool, index) => (
            <ToolCard
              key={`${tool.providerClass}.${tool.methodName}`}
              tool={tool}
              onExecute={handleExecute}
              onTest={handleTest}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No tools are registered yet. Make sure to initialize your tool providers.'
              : `No tools match the current filter: ${filter}`
            }
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Tool Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Total:</span>
            <span className="ml-2 text-gray-900">{tools.length}</span>
          </div>
          <div>
            <span className="font-medium text-green-700">AI Enabled:</span>
            <span className="ml-2 text-green-900">{tools.filter(t => t.aiEnabled).length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Test Only:</span>
            <span className="ml-2 text-gray-900">{tools.filter(t => !t.aiEnabled).length}</span>
          </div>
          <div>
            <span className="font-medium text-red-700">Require Approval:</span>
            <span className="ml-2 text-red-900">{tools.filter(t => t.requiresApproval).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

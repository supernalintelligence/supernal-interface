/**
 * Enhanced Tool Demo Component
 * 
 * Demonstrates the new page-specific tool availability and tool-chain features
 */

import React, { useState, useEffect } from 'react';
import { 
  PageToolIndicator, 
  ToolChainNavigator, 
  universalToolService,
  ToolLocation,
  ToolChain,
  ToolRecommendation
} from '@supernal-interface/core';

export const EnhancedToolDemo: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolLocations, setToolLocations] = useState<ToolLocation[]>([]);
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [workflows, setWorkflows] = useState<ToolChain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadRecommendations();
    loadWorkflows();
  }, []);

  const loadRecommendations = async () => {
    try {
      const recs = await universalToolService.getToolRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadWorkflows = () => {
    const workflows = universalToolService.getWorkflows();
    setWorkflows(workflows);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const locations = await universalToolService.findTool(searchQuery, {
        includeUnavailable: true,
        sortBy: 'relevance',
        limit: 10
      });
      setToolLocations(locations);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (toolLocations.length < 2) return;
    
    try {
      const toolIds = toolLocations.slice(0, 3).map(loc => loc.tool.toolId);
      const workflow = await universalToolService.createWorkflow(
        toolIds, 
        `Custom Workflow: ${toolIds.join(' → ')}`
      );
      
      setWorkflows(prev => [...prev, workflow]);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleNavigateToTool = async (toolId: string) => {
    try {
      const result = await universalToolService.navigateToTool(toolId);
      if (result.success) {
        console.log('Navigation successful:', result);
      } else {
        console.error('Navigation failed:', result.error);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Tool Indicator Demo */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Page Tool Indicator
        </h3>
        <p className="text-gray-600 mb-4">
          The floating indicator shows all tools available on the current page in real-time.
        </p>
        
        <div className="relative bg-gray-50 rounded-lg p-8 min-h-32">
          <div className="text-center text-gray-500">
            <p>Simulated page content area</p>
            <p className="text-sm">Look for the tool indicator in the top-right corner →</p>
          </div>
          
          <PageToolIndicator
            position="top-right"
            showCount={true}
            showPreview={true}
            onNavigateToTool={handleNavigateToTool}
          />
        </div>
      </section>

      {/* Tool Search and Discovery */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Tool Search & Discovery
        </h3>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for tools (e.g., 'open menu', 'submit form', 'toggle')"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {toolLocations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">
                  Search Results ({toolLocations.length})
                </h4>
                {toolLocations.length >= 2 && (
                  <button
                    onClick={handleCreateWorkflow}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-150"
                  >
                    Create Workflow
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {toolLocations.map((location) => (
                  <div
                    key={location.tool.toolId}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all duration-150
                      ${location.currentlyAvailable 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setSelectedTool(location.tool.toolId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-sm text-gray-800">
                            {location.tool.name}
                          </h5>
                          <span className={`
                            px-2 py-0.5 text-xs rounded-full
                            ${location.currentlyAvailable 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                            }
                          `}>
                            {location.currentlyAvailable ? 'Available' : 'Navigate'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {location.tool.aiDescription}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{location.path}</span>
                          <span>•</span>
                          <span>{location.component}</span>
                          {location.estimatedTime && (
                            <>
                              <span>•</span>
                              <span>{Math.round(location.estimatedTime / 1000)}s</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tool Chain Navigator Demo */}
      {selectedTool && (
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Tool Chain Navigator
          </h3>
          <p className="text-gray-600 mb-4">
            Shows step-by-step navigation to reach the selected tool.
          </p>
          
          <ToolChainNavigator
            targetTool={selectedTool}
            autoExecute={false}
            showProgress={true}
            onNavigationComplete={(success, result) => {
              console.log('Navigation completed:', success, result);
            }}
          />
        </section>
      )}

      {/* Tool Recommendations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Tool Recommendations
        </h3>
        <p className="text-gray-600 mb-4">
          AI-powered recommendations based on current page context.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={rec.tool.toolId}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-150"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-800">
                  {rec.tool.name}
                </h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {Math.round(rec.confidence * 100)}%
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                {rec.reason}
              </p>
              
              <p className="text-xs text-gray-500">
                {rec.tool.aiDescription}
              </p>
              
              {rec.prerequisites && rec.prerequisites.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-orange-600">
                    Prerequisites: {rec.prerequisites.join(', ')}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => handleNavigateToTool(rec.tool.toolId)}
                className="mt-2 w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
              >
                Use Tool
              </button>
            </div>
          ))}
        </div>
        
        {recommendations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-sm">No recommendations available</p>
            <button
              onClick={loadRecommendations}
              className="mt-2 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-150"
            >
              Refresh
            </button>
          </div>
        )}
      </section>

      {/* Workflows */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Tool Workflows
        </h3>
        <p className="text-gray-600 mb-4">
          Multi-step tool sequences for complex operations.
        </p>
        
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">{workflow.name}</h4>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {workflow.steps.length} steps
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {workflow.steps.map((step, index) => (
                  <span
                    key={step.id}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {index + 1}. {step.toolId}
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => universalToolService.executeWorkflow(workflow.id)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-150"
                >
                  Execute
                </button>
                <button
                  onClick={() => setSelectedTool(workflow.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          
          {workflows.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm">No workflows created yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Search for tools and create a workflow from the results
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EnhancedToolDemo;

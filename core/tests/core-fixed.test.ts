/**
 * Fixed Core Package Tests
 * 
 * Tests the actual functionality that exists in the simplified registry.
 */

import { Tool, ToolProvider, ToolRegistry } from '../src';

// Test provider for testing
@ToolProvider({
  category: 'test',
  executionContext: 'api'
})
class TestProvider {
  
  @Tool({ 
    aiEnabled: true,
    description: 'Safe test method for AI',
    examples: ['get test data', 'fetch test info']
  })
  async getTestData(): Promise<{ message: string }> {
    return { message: 'Test data retrieved' };
  }
  
  @Tool({
    description: 'Test method that is test-only by default'
  })
  async createTestData(data: any): Promise<{ id: string; data: any }> {
    return { id: 'test-123', data };
  }
  
  @Tool({
    description: 'Update test data',
    aiEnabled: false,
    dangerLevel: 'moderate'
  })
  async updateTestData(id: string, data: any): Promise<{ success: boolean }> {
    return { success: true };
  }
  
  @Tool({
    description: 'Delete test data - requires approval',
    aiEnabled: true,
    dangerLevel: 'destructive',
    requiresApproval: true
  })
  async deleteTestData(id: string): Promise<{ success: boolean }> {
    return { success: true };
  }
}

describe('Fixed Supernal Interface Core', () => {
  let testProvider: TestProvider;
  
  beforeAll(() => {
    testProvider = new TestProvider();
  });
  
  describe('Tool Registration', () => {
    test('should register tools with correct metadata', () => {
      const tools = ToolRegistry.getAllTools();
      
      // Check that tools are registered
      expect(tools.has('TestProvider.getTestData')).toBe(true);
      expect(tools.has('TestProvider.createTestData')).toBe(true);
      expect(tools.has('TestProvider.updateTestData')).toBe(true);
      expect(tools.has('TestProvider.deleteTestData')).toBe(true);
    });
    
    test('should apply correct AI safety defaults', () => {
      const tools = ToolRegistry.getAllTools();
      
      const getTestData = tools.get('TestProvider.getTestData')!;
      expect(getTestData.aiEnabled).toBe(true);
      expect(getTestData.dangerLevel).toBe('safe');
      expect(getTestData.requiresApproval).toBe(false);
      
      const createTestData = tools.get('TestProvider.createTestData')!;
      expect(createTestData.aiEnabled).toBe(false); // Default for non-specified
      
      const deleteTestData = tools.get('TestProvider.deleteTestData')!;
      expect(deleteTestData.aiEnabled).toBe(true);
      expect(deleteTestData.dangerLevel).toBe('destructive');
      expect(deleteTestData.requiresApproval).toBe(true);
    });
  });
  
  describe('Tool Discovery', () => {
    test('should provide accurate statistics', () => {
      const stats = ToolRegistry.getStats();
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.aiEnabled).toBeGreaterThan(0);
      expect(stats.testOnly).toBeGreaterThan(0);
    });
    
    test('should find AI-enabled tools correctly', () => {
      const aiTools = ToolRegistry.getAIEnabledTools();
      
      expect(aiTools.length).toBeGreaterThan(0);
      
      for (const tool of aiTools) {
        expect(tool.aiEnabled).toBe(true);
      }
    });
    
    test('should find test-only tools correctly', () => {
      const testTools = ToolRegistry.getTestOnlyTools();
      
      expect(testTools.length).toBeGreaterThan(0);
      
      for (const tool of testTools) {
        expect(tool.aiEnabled).toBe(false);
      }
    });
    
    test('should search tools by query', () => {
      const results = ToolRegistry.searchTools('get test data');
      
      expect(results.length).toBeGreaterThan(0);
      
      const getTestDataTool = results.find(tool => tool.methodName === 'getTestData');
      expect(getTestDataTool).toBeDefined();
    });
  });
  
  describe('Package Integration', () => {
    test('should export all necessary components', () => {
      expect(Tool).toBeDefined();
      expect(ToolProvider).toBeDefined();
      expect(ToolRegistry).toBeDefined();
    });
  });
});

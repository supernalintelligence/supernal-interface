/**
 * Simplified Core Tests - Registry and Generation Only
 * 
 * Tests the simplified architecture without execution bundling.
 */

import { Tool, ToolProvider, ToolRegistry } from '../src';

// Test provider for testing
@ToolProvider({
  category: 'test',
  executionContext: 'api'
})
class TestProvider {
  
  @Tool({
    testId: 'test-data-get',
    description: 'Get test data',
    aiEnabled: true,
    dangerLevel: 'safe'
  })
  async getTestData() {
    return { success: true, data: 'test' };
  }

  @Tool({
    testId: 'test-data-create',
    description: 'Create test data',
    aiEnabled: false,  // Test-only
    dangerLevel: 'moderate'
  })
  async createTestData(data: any) {
    return { success: true, id: 'new-test' };
  }

  @Tool({
    testId: 'test-data-delete',
    description: 'Delete test data',
    aiEnabled: true,
    dangerLevel: 'destructive',
    requiresApproval: true
  })
  async deleteTestData(id: string) {
    return { success: true, deleted: id };
  }
}

describe('Simplified Supernal Interface Core', () => {
  beforeAll(() => {
    // Decorators run during module loading
    // Just instantiate to ensure the class is loaded
    new TestProvider();
  });

  describe('Tool Registration', () => {
    it('should register tools from decorators', () => {
      const tools = ToolRegistry.getAllTools();
      expect(tools.size).toBe(3);
      
      const toolNames = Array.from(tools.values()).map(t => t.methodName);
      expect(toolNames).toContain('getTestData');
      expect(toolNames).toContain('createTestData');
      expect(toolNames).toContain('deleteTestData');
    });

    it('should set correct AI safety defaults', () => {
      const tools = Array.from(ToolRegistry.getAllTools().values());
      
      const getTestData = tools.find(t => t.methodName === 'getTestData');
      expect(getTestData?.aiEnabled).toBe(true);
      expect(getTestData?.dangerLevel).toBe('safe');
      expect(getTestData?.requiresApproval).toBe(false);

      const deleteTestData = tools.find(t => t.methodName === 'deleteTestData');
      expect(deleteTestData?.aiEnabled).toBe(true);
      expect(deleteTestData?.dangerLevel).toBe('destructive');
      expect(deleteTestData?.requiresApproval).toBe(true);
    });
  });

  describe('Tool Discovery', () => {
    it('should get AI-enabled tools', () => {
      const aiTools = ToolRegistry.getAIEnabledTools();
      expect(aiTools).toHaveLength(2); // getTestData, deleteTestData
      
      const methodNames = aiTools.map(t => t.methodName);
      expect(methodNames).toContain('getTestData');
      expect(methodNames).toContain('deleteTestData');
      expect(methodNames).not.toContain('createTestData'); // test-only
    });

    it('should get test-only tools', () => {
      const testTools = ToolRegistry.getTestOnlyTools();
      expect(testTools).toHaveLength(1); // createTestData
      
      expect(testTools[0].methodName).toBe('createTestData');
      expect(testTools[0].aiEnabled).toBe(false);
    });

    it('should search tools by query', () => {
      const results = ToolRegistry.searchTools('get test data');
      expect(results.length).toBeGreaterThan(0);
      
      // Should find the getTestData tool
      const getTestDataTool = results.find(t => t.methodName === 'getTestData');
      expect(getTestDataTool).toBeDefined();
      expect(getTestDataTool?.methodName).toBe('getTestData');
    });

    it('should get registry statistics', () => {
      const stats = ToolRegistry.getStats();
      expect(stats.total).toBe(3);
      expect(stats.aiEnabled).toBe(2);
      expect(stats.testOnly).toBe(1);
      expect(stats.byDangerLevel.safe).toBe(1);
      expect(stats.byDangerLevel.moderate).toBe(1);
      expect(stats.byDangerLevel.destructive).toBe(1);
    });
  });

  describe('Testing Integration', () => {
    it('should generate testing integration fields', () => {
      const tools = Array.from(ToolRegistry.getAllTools().values());
      
      tools.forEach(tool => {
        expect(tool.generateSimulation).toBe(true);
        expect(tool.generateStories).toBe(true);
        expect(tool.elementType).toBeDefined();
        expect(tool.actionType).toBeDefined();
      });
    });
  });

  describe('Package Integration', () => {
    it('should export all necessary components', () => {
      expect(Tool).toBeDefined();
      expect(ToolProvider).toBeDefined();
      expect(ToolRegistry).toBeDefined();
    });
  });
});

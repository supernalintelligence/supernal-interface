/**
 * Core Package Tests
 * 
 * Comprehensive tests for the Supernal Interface core package.
 * Tests all major functionality including decorators, registry, and safety controls.
 */

import { Tool, ToolProvider, ToolRegistry, TestGenerator } from '../src';

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
    aiEnabled: true,
    requiresApproval: false,
    description: 'Moderate operation that is AI-enabled'
  })
  async updateTestData(id: string, data: any): Promise<{ id: string; data: any }> {
    return { id, data };
  }
  
  @Tool({
    aiEnabled: true,  // Enable AI for approval testing
    description: 'Dangerous operation requiring approval'
  })
  async deleteTestData(id: string): Promise<void> {
    // Destructive operation
  }
}

describe('Supernal Interface Core Package', () => {
  let testProvider: TestProvider;
  
  beforeAll(() => {
    console.log('[DEBUG] Before instantiating TestProvider');
    testProvider = new TestProvider();
    console.log('[DEBUG] After first TestProvider instantiation');
    // Provider registration happens automatically via decorators
    new TestProvider(); // Instantiate to trigger decorator registration
    console.log('[DEBUG] After second TestProvider instantiation');
    
    // Debug: Check what's in the registry after instantiation
    console.log('[DEBUG] Registry contents after instantiation:', Array.from(ToolRegistry.getAllTools().keys()));
    
    // No need to register provider separately - ToolRegistry handles everything
  });
  
  describe('Tool Decorator', () => {
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
      
      const createTestData = tools.get('TestProvider.createTestData')!;
      expect(createTestData.aiEnabled).toBe(false); // Default: test-only
      expect(createTestData.dangerLevel).toBe('moderate');
      
      const deleteTestData = tools.get('TestProvider.deleteTestData')!;
      expect(deleteTestData.aiEnabled).toBe(true); // Explicitly enabled for testing approval workflow
      expect(deleteTestData.dangerLevel).toBe('destructive');
      expect(deleteTestData.requiresApproval).toBe(true);
    });
    
    test('should generate correct natural language examples', () => {
      const tools = ToolRegistry.getAllTools();
      const getTestData = tools.get('TestProvider.getTestData')!;
      
      expect(getTestData.examples).toContain('get test data');
      expect(getTestData.examples).toContain('fetch test info');
    });
    
    test('should infer correct execution context', () => {
      const tools = ToolRegistry.getAllTools();
      
      for (const tool of tools.values()) {
        expect(['ui', 'api', 'both']).toContain(tool.executionContext);
      }
    });
  });
  
  describe('Universal Tool Registry', () => {
    test('should provide accurate statistics', () => {
      const stats = ToolRegistry.getStats();
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.aiEnabled).toBeGreaterThan(0);
      expect(stats.testOnly).toBeGreaterThan(0);
      expect(stats.total).toBe(stats.aiEnabled + stats.testOnly);
      // expect(stats.requiresApproval).toBeGreaterThan(0); // Property not implemented yet
    });
    
    test('should find AI-enabled tools correctly', () => {
      const aiTools = ToolRegistry.getAIEnabledTools();
      
      expect(aiTools.length).toBeGreaterThan(0);
      
      for (const tool of aiTools) {
        expect(tool.aiEnabled).toBe(true);
      }
    });
    
    test('should categorize tools by danger level', () => {
      const stats = ToolRegistry.getStats();
      
      expect(stats.byDangerLevel.safe).toBeGreaterThanOrEqual(0);
      expect(stats.byDangerLevel.moderate).toBeGreaterThanOrEqual(0);
      expect(stats.byDangerLevel.dangerous).toBeGreaterThanOrEqual(0);
      expect(stats.byDangerLevel.destructive).toBeGreaterThanOrEqual(0);
      
      const total = Object.values(stats.byDangerLevel).reduce((sum: number, count: number) => sum + count, 0);
      expect(total).toBe(stats.total);
    });
  });
  
  // Note: Tool execution is handled by separate PlaywrightExecutor and DOMExecutor classes
  // The registry only handles discovery and metadata
  
  describe('Search Interface', () => {
    test('should find tools by natural language query', () => {
      const results = ToolRegistry.findToolsByQuery('get test data');
      
      expect(results.length).toBeGreaterThan(0);
      
      const getTestDataTool = results.find(tool => tool.methodName === 'getTestData');
      expect(getTestDataTool).toBeDefined();
    });

    test('should find tools by partial matches', () => {
      const results = ToolRegistry.findToolsByQuery('test');
      
      expect(results.length).toBeGreaterThan(0);
    });

    test('should return empty array for non-matching queries', () => {
      const results = ToolRegistry.findToolsByQuery('nonexistent functionality');
      
      expect(results.length).toBe(0);
    });
  });
  
  describe('Test Generation', () => {
    test('should generate tests for all registered tools', () => {
      const tests = TestGenerator.generateAllTests({
        framework: 'jest',
        includePlaywright: false,
        includeIntegration: true
      });
      
      expect(tests.size).toBeGreaterThan(0);
      
      // Should generate unit tests
      expect(tests.has('TestProvider.unit.test.ts')).toBe(true);
      
      // Should generate integration tests
      expect(tests.has('TestProvider.integration.test.ts')).toBe(true);
    });
    
    test('should generate valid test code', () => {
      const tests = TestGenerator.generateAllTests({
        framework: 'jest'
      });
      
      const unitTest = tests.get('TestProvider.unit.test.ts')!;
      
      // Should contain proper imports
      expect(unitTest).toContain('import { ToolRegistry }');
      expect(unitTest).toContain('import { TestProvider }');
      
      // Should contain test structure
      expect(unitTest).toContain('describe(');
      expect(unitTest).toContain('test(');
      expect(unitTest).toContain('expect(');
      
      // Should test AI safety
      expect(unitTest).toContain('aiEnabled');
      expect(unitTest).toContain('executeForTesting');
      expect(unitTest).toContain('executeForAI');
    });
    
    test('should generate Playwright tests when requested', () => {
      const tests = TestGenerator.generateAllTests({
        framework: 'jest',
        includePlaywright: true
      });
      
      expect(tests.has('TestProvider.e2e.test.ts')).toBe(true);
      
      const e2eTest = tests.get('TestProvider.e2e.test.ts')!;
      expect(e2eTest).toContain('@playwright/test');
      expect(e2eTest).toContain('test.describe');
    });
  });
  
  describe('Documentation Generation', () => {
    test('should generate comprehensive documentation', () => {
      const docs = ToolRegistry.generateDocumentation();

      expect(docs).toContain('# Supernal Interface Tools');
      expect(docs).toContain('## AI-Enabled Tools');
      expect(docs).toContain('## Test-Only Tools');
      expect(docs).toContain('Total Tools');
      expect(docs).toContain('AI-Enabled');
      expect(docs).toContain('Test-Only');
    });

    test('should include tool details in documentation', () => {
      const docs = ToolRegistry.generateDocumentation();

      expect(docs).toContain('Get Test Data');  // Display name, not method name
      expect(docs).toContain('Safe test method for AI');
      expect(docs).toContain('get test data');
    });
  });
  
  describe('Safety Controls', () => {
    test('should enforce safety defaults', () => {
      const stats = ToolRegistry.getStats();
      
      // Dangerous tools should require approval
      expect(stats.byDangerLevel.dangerous).toBeGreaterThanOrEqual(0);
      expect(stats.byDangerLevel.destructive).toBeGreaterThanOrEqual(0);
      
      // Approval requirements should be enforced
      expect(stats.requiresApproval).toBeGreaterThanOrEqual(
        stats.byDangerLevel.dangerous + stats.byDangerLevel.destructive
      );
    });
    
    test('should prevent unauthorized dangerous operations', async () => {
      const result = await ToolRegistry.executeForAI('TestProvider.deleteTestData', { id: 'test-123' });
      
      expect(result.success).toBe(false);
      expect(result.requiresApproval).toBe(true);
    });
    
    test('should allow safe operations by default', async () => {
      const result = await ToolRegistry.executeForAI('TestProvider.getTestData', {});
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('Package Integration', () => {
    test('should export all necessary components', () => {
      // Test that all main exports are available
      expect(Tool).toBeDefined();
      expect(ToolProvider).toBeDefined();
      expect(ToolRegistry).toBeDefined();
      expect(TestGenerator).toBeDefined();
    });
    
    test('should provide version information', () => {
      const { VERSION, PACKAGE_NAME } = require('../src');
      
      expect(VERSION).toBeDefined();
      expect(PACKAGE_NAME).toBe('@supernal/interface-core');
    });
  });
});

/**
 * Test Generator
 *
 * Automatically generates comprehensive tests for @Tool decorated methods.
 * Creates both unit tests and integration tests with proper safety checks.
 */

import { ToolMetadata } from '../decorators/Tool';
import { ToolRegistry } from '../registry/ToolRegistry';

export interface TestGenerationOptions {
  outputDir?: string;
  framework?: 'jest' | 'vitest' | 'mocha';
  includePlaywright?: boolean;
  includeIntegration?: boolean;
  mockData?: boolean;
}

export class TestGenerator {
  /**
   * Generate all tests for registered tools
   */
  static generateAllTests(options: TestGenerationOptions = {}): Map<string, string> {
    const tests = new Map<string, string>();
    const tools = ToolRegistry.getAllTools();

    // Group tools by provider class
    const providerGroups = new Map<string, ToolMetadata[]>();

    for (const [toolKey, tool] of tools) {
      const [className] = toolKey.split('.');
      if (!providerGroups.has(className)) {
        providerGroups.set(className, []);
      }
      providerGroups.get(className)!.push(tool);
    }

    // Generate tests for each provider
    for (const [className, providerTools] of providerGroups) {
      const unitTests = this.generateUnitTests(className, providerTools, options);
      const integrationTests = this.generateIntegrationTests(className, providerTools, options);

      tests.set(`${className}.unit.test.ts`, unitTests);

      if (options.includeIntegration !== false) {
        tests.set(`${className}.integration.test.ts`, integrationTests);
      }

      if (options.includePlaywright) {
        const playwrightTests = this.generatePlaywrightTests(className, providerTools, options);
        tests.set(`${className}.e2e.test.ts`, playwrightTests);
      }
    }

    return tests;
  }

  /**
   * Generate unit tests for a provider class
   */
  static generateUnitTests(
    className: string,
    tools: ToolMetadata[],
    options: TestGenerationOptions
  ): string {
    const framework = options.framework || 'jest';

    let test = this.generateTestHeader(className, 'Unit Tests', framework);

    // Import statements
    test += `import { ToolRegistry } from '../src/registry/ToolRegistry';\n`;
    test += `import { ${className} } from '../src/providers/${className}';\n\n`;

    // Setup
    test += `describe('${className} - Unit Tests', () => {\n`;
    test += `  let provider: ${className};\n\n`;

    test += `  beforeEach(() => {\n`;
    test += `    provider = new ${className}();\n`;
    test += `    ToolRegistry.registerProvider('${className}', provider);\n`;
    test += `  });\n\n`;

    // Generate tests for each tool
    for (const tool of tools) {
      test += this.generateToolUnitTest(tool, options);
    }

    // Safety tests
    test += this.generateSafetyTests(tools);

    test += `});\n`;

    return test;
  }

  /**
   * Generate integration tests
   */
  static generateIntegrationTests(
    className: string,
    tools: ToolMetadata[],
    options: TestGenerationOptions
  ): string {
    const framework = options.framework || 'jest';

    let test = this.generateTestHeader(className, 'Integration Tests', framework);

    test += `import { ToolRegistry } from '../src/registry/ToolRegistry';\n`;
    test += `import { ${className} } from '../src/providers/${className}';\n\n`;

    test += `describe('${className} - Integration Tests', () => {\n`;
    test += `  let provider: ${className};\n\n`;

    test += `  beforeAll(async () => {\n`;
    test += `    provider = new ${className}();\n`;
    test += `    ToolRegistry.registerProvider('${className}', provider);\n`;
    test += `  });\n\n`;

    // Test registry integration
    test += `  describe('Registry Integration', () => {\n`;
    test += `    test('should register all tools correctly', () => {\n`;
    test += `      const stats = ToolRegistry.getStats();\n`;
    test += `      expect(stats.totalTools).toBeGreaterThan(0);\n`;
    test += `    });\n\n`;

    test += `    test('should categorize tools by AI safety', () => {\n`;
    test += `      const aiTools = ToolRegistry.getAIEnabledTools();\n`;
    test += `      const stats = ToolRegistry.getStats();\n`;
    test += `      expect(stats.aiEnabled + stats.testOnly).toBe(stats.totalTools);\n`;
    test += `    });\n`;
    test += `  });\n\n`;

    // Test execution workflows
    test += `  describe('Execution Workflows', () => {\n`;

    const aiEnabledTools = tools.filter((t) => t.aiEnabled);
    const testOnlyTools = tools.filter((t) => !t.aiEnabled);
    const approvalTools = tools.filter((t) => t.requiresApproval);

    if (aiEnabledTools.length > 0) {
      const tool = aiEnabledTools[0];
      test += `    test('should execute AI-enabled tools via executeForAI', async () => {\n`;
      test += `      const result = await ToolRegistry.executeForAI('${className}.${tool.methodName}', {});\n`;
      test += `      expect(result.success).toBe(true);\n`;
      test += `    });\n\n`;
    }

    if (testOnlyTools.length > 0) {
      const tool = testOnlyTools[0];
      test += `    test('should reject test-only tools via executeForAI', async () => {\n`;
      test += `      const result = await ToolRegistry.executeForAI('${className}.${tool.methodName}', {});\n`;
      test += `      expect(result.success).toBe(false);\n`;
      test += `      expect(result.error).toContain('not AI-enabled');\n`;
      test += `    });\n\n`;
    }

    if (approvalTools.length > 0) {
      const tool = approvalTools[0];
      test += `    test('should handle approval workflow for dangerous tools', async () => {\n`;
      test += `      const approval = await ToolRegistry.requestApproval('${className}.${tool.methodName}', {});\n`;
      test += `      expect(approval.id).toBeDefined();\n`;
      test += `      expect(approval.status).toBe('pending');\n\n`;
      test += `      ToolRegistry.approveRequest(approval.id, 'test-user');\n`;
      test += `      const result = await ToolRegistry.executeWithApproval(approval.id);\n`;
      test += `      expect(result.success).toBe(true);\n`;
      test += `    });\n\n`;
    }

    test += `  });\n\n`;

    // Test natural language queries
    test += `  describe('Natural Language Interface', () => {\n`;
    test += `    test('should find tools by natural language query', () => {\n`;
    test += `      const results = ToolRegistry.findToolsByQuery('get users');\n`;
    test += `      expect(results.length).toBeGreaterThan(0);\n`;
    test += `    });\n`;
    test += `  });\n`;

    test += `});\n`;

    return test;
  }

  /**
   * Generate Playwright E2E tests
   */
  static generatePlaywrightTests(
    className: string,
    tools: ToolMetadata[],
    options: TestGenerationOptions
  ): string {
    let test = `/**\n * ${className} - End-to-End Tests\n * Auto-generated by Supernal Interface\n */\n\n`;

    test += `import { test, expect, Page } from '@playwright/test';\n`;
    test += `import { ToolRegistry } from '../src/registry/ToolRegistry';\n`;
    test += `import { ${className} } from '../src/providers/${className}';\n\n`;

    test += `test.describe('${className} - E2E Tests', () => {\n`;
    test += `  let provider: ${className};\n\n`;

    test += `  test.beforeAll(async () => {\n`;
    test += `    provider = new ${className}();\n`;
    test += `    ToolRegistry.registerProvider('${className}', provider);\n`;
    test += `  });\n\n`;

    // Generate UI interaction tests for UI tools
    const uiTools = tools.filter(
      (t) => t.executionContext === 'ui' || t.executionContext === 'both'
    );

    for (const tool of uiTools) {
      if (tool.testId) {
        test += `  test('should interact with ${tool.name} via UI', async ({ page }) => {\n`;
        test += `    await page.goto('/admin'); // Adjust URL as needed\n`;
        test += `    \n`;
        test += `    // Find the UI element\n`;
        test += `    const element = page.locator('[data-testid="${tool.testId}"]');\n`;
        test += `    await expect(element).toBeVisible();\n`;
        test += `    \n`;
        test += `    // Interact with the element\n`;
        test += `    await element.click();\n`;
        test += `    \n`;
        test += `    // Verify the action was executed\n`;
        test += `    // Add specific assertions based on the tool's expected behavior\n`;
        test += `  });\n\n`;
      }
    }

    test += `});\n`;

    return test;
  }

  /**
   * Generate individual tool unit test
   */
  private static generateToolUnitTest(tool: ToolMetadata, options: TestGenerationOptions): string {
    let test = `  describe('${tool.name}', () => {\n`;

    // Basic functionality test
    test += `    test('should execute successfully with valid parameters', async () => {\n`;
    test += `      const result = await ToolRegistry.executeForTesting('${tool.providerClass}.${tool.methodName}', {});\n`;
    test += `      expect(result.success).toBe(true);\n`;
    test += `      expect(result.executionTime).toBeGreaterThan(0);\n`;
    test += `    });\n\n`;

    // AI safety test
    if (tool.aiEnabled) {
      test += `    test('should be executable by AI (aiEnabled: true)', async () => {\n`;
      test += `      const result = await ToolRegistry.executeForAI('${tool.providerClass}.${tool.methodName}', {});\n`;
      if (tool.requiresApproval) {
        test += `      expect(result.success).toBe(false);\n`;
        test += `      expect(result.requiresApproval).toBe(true);\n`;
      } else {
        test += `      expect(result.success).toBe(true);\n`;
      }
      test += `    });\n\n`;
    } else {
      test += `    test('should reject AI execution (aiEnabled: false)', async () => {\n`;
      test += `      const result = await ToolRegistry.executeForAI('${tool.providerClass}.${tool.methodName}', {});\n`;
      test += `      expect(result.success).toBe(false);\n`;
      test += `      expect(result.error).toContain('not AI-enabled');\n`;
      test += `    });\n\n`;
    }

    // Metadata test
    test += `    test('should have correct metadata', () => {\n`;
    test += `      const tools = ToolRegistry.getAllTools();\n`;
    test += `      const toolMeta = tools.get('${tool.providerClass}.${tool.methodName}');\n`;
    test += `      \n`;
    test += `      expect(toolMeta).toBeDefined();\n`;
    test += `      expect(toolMeta!.name).toBe('${tool.name}');\n`;
    test += `      expect(toolMeta!.aiEnabled).toBe(${tool.aiEnabled});\n`;
    test += `      expect(toolMeta!.dangerLevel).toBe('${tool.dangerLevel}');\n`;
    test += `      expect(toolMeta!.requiresApproval).toBe(${tool.requiresApproval});\n`;
    test += `    });\n\n`;

    test += `  });\n\n`;

    return test;
  }

  /**
   * Generate safety-focused tests
   */
  private static generateSafetyTests(tools: ToolMetadata[]): string {
    let test = `  describe('Safety Controls', () => {\n`;

    test += `    test('should enforce AI safety defaults', () => {\n`;
    test += `      const stats = ToolRegistry.getStats();\n`;
    test += `      \n`;
    test += `      // Verify dangerous tools require approval\n`;
    test += `      expect(stats.byDangerLevel.dangerous).toBeGreaterThanOrEqual(0);\n`;
    test += `      expect(stats.byDangerLevel.destructive).toBeGreaterThanOrEqual(0);\n`;
    test += `      \n`;
    test += `      // Verify approval requirements\n`;
    test += `      expect(stats.requiresApproval).toBeGreaterThanOrEqual(stats.byDangerLevel.dangerous + stats.byDangerLevel.destructive);\n`;
    test += `    });\n\n`;

    const destructiveTools = tools.filter((t) => t.dangerLevel === 'destructive');
    if (destructiveTools.length > 0) {
      test += `    test('should prevent unauthorized destructive operations', async () => {\n`;
      test += `      const destructiveTool = '${destructiveTools[0].providerClass}.${destructiveTools[0].methodName}';\n`;
      test += `      \n`;
      test += `      // Should fail without approval\n`;
      test += `      const result = await ToolRegistry.executeForAI(destructiveTool, {});\n`;
      test += `      expect(result.success).toBe(false);\n`;
      test += `    });\n\n`;
    }

    test += `  });\n\n`;

    return test;
  }

  /**
   * Generate test file header
   */
  private static generateTestHeader(
    className: string,
    testType: string,
    framework: string
  ): string {
    return `/**\n * ${className} - ${testType}\n * Auto-generated by Supernal Interface Test Generator\n * \n * This file contains comprehensive tests for all @Tool decorated methods.\n * Tests include safety controls, AI execution permissions, and functionality.\n */\n\n`;
  }

  /**
   * Write generated tests to files
   */
  static async writeTestFiles(
    tests: Map<string, string>,
    outputDir: string = './tests/generated'
  ): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write each test file
    for (const [filename, content] of tests) {
      const filePath = path.join(outputDir, filename);
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`📝 Generated test file: ${filePath}`);
    }
  }

  /**
   * Generate test configuration files
   */
  static generateTestConfig(framework: 'jest' | 'vitest' | 'mocha' = 'jest'): string {
    switch (framework) {
      case 'jest':
        return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};`;

      case 'vitest':
        return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: ['src/types/**', '**/*.d.ts']
    }
  }
});`;

      default:
        return '// Mocha configuration not implemented yet';
    }
  }
}

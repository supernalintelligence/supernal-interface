/**
 * Universal Generator - Generates AI interfaces, test simulations, and stories
 */

import { ToolMetadata } from '../decorators/Tool';
import { SimulationGenerator } from './SimulationGenerator';
import { TestGenerator } from './TestGenerator';
import { StoryGenerator } from '../story/StoryGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface UniversalConfig {
  outputDir: string;
  simulationClassName?: string;
  aiInterfaceClassName?: string;
  storyClassName?: string;
  generateSimulation?: boolean;
  generateAIInterface?: boolean;
  generateStories?: boolean;
  generateTests?: boolean;
  generateDocumentation?: boolean;
  overwriteExisting?: boolean;
  framework?: 'react' | 'vue' | 'angular';
}

export interface GenerationResult {
  simulationCode?: string;
  aiInterfaceCode?: string;
  storiesCode?: string;
  testsCode?: string;
  documentationCode?: string;
  filesWritten: string[];
  errors: string[];
}

export class UniversalGenerator {
  private simulationGenerator = new SimulationGenerator();
  private storyGenerator = new StoryGenerator();

  constructor(private config: UniversalConfig) {
    // Ensure output directory exists
    this.ensureOutputDir();
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Generate all code from registered tools
   */
  async generateAll(tools: ToolMetadata[]): Promise<GenerationResult> {
    const result: GenerationResult = {
      filesWritten: [],
      errors: [],
    };

    if (tools.length === 0) {
      result.errors.push('No tools provided for generation');
      return result;
    }

    try {
      // Generate simulation code
      if (this.config.generateSimulation !== false) {
        await this.generateSimulation(tools, result);
      }

      // Generate AI interface code
      if (this.config.generateAIInterface !== false) {
        await this.generateAIInterface(tools, result);
      }

      // Generate stories code
      if (this.config.generateStories !== false) {
        await this.generateStories(tools, result);
      }

      // Generate tests
      if (this.config.generateTests) {
        await this.generateTests(tools, result);
      }

      // Generate documentation
      if (this.config.generateDocumentation) {
        await this.generateDocumentation(tools, result);
      }
    } catch (error) {
      result.errors.push(
        `Generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return result;
  }

  /**
   * Generate Playwright simulation code
   */
  private async generateSimulation(tools: ToolMetadata[], result: GenerationResult): Promise<void> {
    try {
      const className = this.config.simulationClassName || 'UniversalSimulation';
      const simulationCode = this.generateSimulationClass(tools, className);

      result.simulationCode = simulationCode;

      const filePath = path.join(this.config.outputDir, `${className}.ts`);
      await fs.writeFile(filePath, simulationCode);
      result.filesWritten.push(filePath);
    } catch (error) {
      result.errors.push(
        `Simulation generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate AI interface code
   */
  private async generateAIInterface(
    tools: ToolMetadata[],
    result: GenerationResult
  ): Promise<void> {
    try {
      const className = this.config.aiInterfaceClassName || 'UniversalAIInterface';
      const aiInterfaceCode = this.generateAIInterfaceClass(tools, className);

      result.aiInterfaceCode = aiInterfaceCode;

      const filePath = path.join(this.config.outputDir, `${className}.ts`);
      await fs.writeFile(filePath, aiInterfaceCode);
      result.filesWritten.push(filePath);
    } catch (error) {
      result.errors.push(
        `AI Interface generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate stories code
   */
  private async generateStories(tools: ToolMetadata[], result: GenerationResult): Promise<void> {
    try {
      const className = this.config.storyClassName || 'UniversalStories';
      const simulationClassName = this.config.simulationClassName || 'UniversalSimulation';
      const storiesCode = this.generateStoriesClass(tools, className, simulationClassName);

      result.storiesCode = storiesCode;

      const filePath = path.join(this.config.outputDir, `${className}.ts`);
      await fs.writeFile(filePath, storiesCode);
      result.filesWritten.push(filePath);
    } catch (error) {
      result.errors.push(
        `Stories generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate test code
   */
  private async generateTests(tools: ToolMetadata[], result: GenerationResult): Promise<void> {
    try {
      const testsCode = this.generateTestsClass(tools);

      result.testsCode = testsCode;

      const filePath = path.join(this.config.outputDir, 'generated.test.ts');
      await fs.writeFile(filePath, testsCode);
      result.filesWritten.push(filePath);
    } catch (error) {
      result.errors.push(
        `Tests generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(
    tools: ToolMetadata[],
    result: GenerationResult
  ): Promise<void> {
    try {
      const docsCode = this.generateDocumentationMarkdown(tools);

      result.documentationCode = docsCode;

      const filePath = path.join(this.config.outputDir, 'GENERATED_DOCUMENTATION.md');
      await fs.writeFile(filePath, docsCode);
      result.filesWritten.push(filePath);
    } catch (error) {
      result.errors.push(
        `Documentation generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate Playwright simulation class
   */
  private generateSimulationClass(tools: ToolMetadata[], className: string): string {
    const aiTools = tools.filter((tool) => tool.aiEnabled);
    const testTools = tools.filter((tool) => !tool.aiEnabled);

    return `/**
 * Auto-generated ${className}
 * Generated from @Tool decorators - DO NOT EDIT MANUALLY
 * 
 * Generated: ${new Date().toISOString()}
 * Tools: ${tools.length}
 * AI-enabled: ${aiTools.length}
 * Test-only: ${testTools.length}
 */

import { Page, Frame, FrameLocator } from '@playwright/test';

export class ${className} {
  constructor(private context: Page | Frame | FrameLocator) {}

  /**
   * Get element by test ID
   */
  private getElement(testId: string) {
    return this.context.locator(\`[data-testid="\${testId}"]\`);
  }

${tools.map((tool) => this.generateSimulationMethod(tool)).join('\n\n')}
}`;
  }

  /**
   * Generate individual simulation method
   */
  private generateSimulationMethod(tool: ToolMetadata): string {
    // Use consistent return type with message for all UI interactions
    const returnType = '{ success: boolean; message: string }';

    return `  /**
   * ${tool.description}
   * Generated from: ${tool.name}
   * AI Enabled: ${tool.aiEnabled}
   * Danger Level: ${tool.dangerLevel}
   */
  async ${tool.methodName}(): Promise<${returnType}> {
    try {
      const element = this.getElement('${tool.testId}');
      await element.waitFor({ state: 'visible' });
      
      ${this.generateActionCode(tool)}
      
      return { success: true, message: '${tool.name} completed successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: \`${tool.name} failed: \${error instanceof Error ? error.message : String(error)}\`
      };
    }
  }`;
  }

  /**
   * Generate action code based on element and action type
   */
  private generateActionCode(tool: ToolMetadata): string {
    switch (tool.actionType) {
      case 'click':
        return `await element.click();`;
      case 'type':
        return `await element.fill('test data');`;
      case 'select':
        return `await element.selectOption('test-option');`;
      case 'hover':
        return `await element.hover();`;
      case 'scroll':
        return `await element.scrollIntoViewIfNeeded();`;
      default:
        return `// Perform ${tool.actionType || 'action'} on element
      await element.click(); // Default action`;
    }
  }

  /**
   * Generate AI interface class
   */
  private generateAIInterfaceClass(tools: ToolMetadata[], className: string): string {
    const aiTools = tools.filter((tool) => tool.aiEnabled);

    return `/**
 * Auto-generated ${className}
 * Generated from @Tool decorators - DO NOT EDIT MANUALLY
 * 
 * Generated: ${new Date().toISOString()}
 * AI-enabled tools: ${aiTools.length}
 * Total tools: ${tools.length}
 */

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: any;
  examples: string[];
  dangerLevel: 'safe' | 'moderate' | 'dangerous' | 'destructive';
  requiresApproval: boolean;
  testId: string;
  elementType?: string;
  actionType?: string;
}

export class ${className} {
  private tools: Record<string, AIToolDefinition> = {
${aiTools.map((tool) => this.generateAIToolDefinition(tool)).join(',\n')}
  };

  /**
   * Get all AI-enabled tools
   */
  getAllTools(): Record<string, AIToolDefinition> {
    return { ...this.tools };
  }

  /**
   * Get tool by method name
   */
  getTool(methodName: string): AIToolDefinition | undefined {
    return this.tools[methodName];
  }

  /**
   * Find tools by natural language query
   */
  findToolsByQuery(query: string): AIToolDefinition[] {
    const queryLower = query.toLowerCase();
    
    return Object.values(this.tools).filter(tool => {
      const searchFields = [
        tool.name.toLowerCase(),
        tool.description.toLowerCase(),
        ...tool.examples.map(ex => ex.toLowerCase())
      ];
      
      return searchFields.some(field => 
        field.includes(queryLower) || queryLower.includes(field)
      );
    });
  }

  /**
   * Get tools by danger level
   */
  getToolsByDangerLevel(level: 'safe' | 'moderate' | 'dangerous' | 'destructive'): AIToolDefinition[] {
    return Object.values(this.tools).filter(tool => tool.dangerLevel === level);
  }

  /**
   * Get safe tools (no approval required)
   */
  getSafeTools(): AIToolDefinition[] {
    return Object.values(this.tools).filter(tool => !tool.requiresApproval);
  }
}`;
  }

  /**
   * Generate AI tool definition
   */
  private generateAIToolDefinition(tool: ToolMetadata): string {
    return `    '${tool.methodName}': {
      name: '${tool.name}',
      description: '${tool.description}',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      examples: ${JSON.stringify(tool.examples || [])},
      dangerLevel: '${tool.dangerLevel}',
      requiresApproval: ${tool.requiresApproval},
      testId: '${tool.testId}',
      elementType: '${tool.elementType || 'unknown'}',
      actionType: '${tool.actionType || 'unknown'}'
    }`;
  }

  /**
   * Generate stories class
   */
  private generateStoriesClass(
    tools: ToolMetadata[],
    className: string,
    simulationClassName: string
  ): string {
    return `/**
 * Auto-generated ${className}
 * Generated from @Tool decorators - DO NOT EDIT MANUALLY
 * 
 * Generated: ${new Date().toISOString()}
 * Stories: ${tools.length}
 */

import { ${simulationClassName} } from './${simulationClassName}';

export interface StoryResult {
  success: boolean;
  message: string;
  duration: number;
  steps?: Array<{ step: string; success: boolean; message: string }>;
}

export class ${className} {
  constructor(private simulation: ${simulationClassName}) {}

${tools.map((tool) => this.generateStoryMethod(tool)).join('\n\n')}

  /**
   * Run all stories
   */
  async runAllStories(): Promise<StoryResult[]> {
    const results: StoryResult[] = [];
    
${tools.map((tool) => `    results.push(await this.story_${tool.methodName}());`).join('\n')}
    
    return results;
  }
}`;
  }

  /**
   * Generate individual story method
   */
  private generateStoryMethod(tool: ToolMetadata): string {
    return `  /**
   * Story: ${tool.name}
   * Implements: ${tool.description}
   */
  async story_${tool.methodName}(): Promise<StoryResult> {
    const startTime = Date.now();
    const steps: Array<{ step: string; success: boolean; message: string }> = [];
    
    try {
      // Step 1: Setup
      steps.push({ step: 'Setup', success: true, message: 'Story setup completed' });
      
      // Step 2: Execute action
      const result = await this.simulation.${tool.methodName}();
      steps.push({ 
        step: 'Execute ${tool.name}', 
        success: result.success, 
        message: result.message 
      });
      
      // Step 3: Validation
      if (result.success) {
        steps.push({ step: 'Validation', success: true, message: 'Action completed successfully' });
      } else {
        steps.push({ step: 'Validation', success: false, message: 'Action failed validation' });
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: result.success,
        message: \`Story '${tool.name}' \${result.success ? 'passed' : 'failed'}\`,
        duration,
        steps
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      steps.push({ 
        step: 'Error', 
        success: false, 
        message: error instanceof Error ? error.message : String(error)
      });
      
      return {
        success: false,
        message: \`Story '${tool.name}' failed with error\`,
        duration,
        steps
      };
    }
  }`;
  }

  /**
   * Generate test class
   */
  private generateTestsClass(tools: ToolMetadata[]): string {
    return `/**
 * Auto-generated Tests
 * Generated from @Tool decorators - DO NOT EDIT MANUALLY
 * 
 * Generated: ${new Date().toISOString()}
 * Tools: ${tools.length}
 */

import { test, expect } from '@playwright/test';

test.describe('Generated Tool Tests', () => {
${tools.map((tool) => this.generateTestMethod(tool)).join('\n\n')}
});`;
  }

  /**
   * Generate individual test method
   */
  private generateTestMethod(tool: ToolMetadata): string {
    return `  test('${tool.name}', async ({ page }) => {
    // Test: ${tool.description}
    // AI Enabled: ${tool.aiEnabled}
    // Danger Level: ${tool.dangerLevel}
    
    const element = page.locator('[data-testid="${tool.testId}"]');
    await expect(element).toBeVisible();
    
    ${this.generateTestActionCode(tool)}
  });`;
  }

  /**
   * Generate test action code
   */
  private generateTestActionCode(tool: ToolMetadata): string {
    switch (tool.actionType) {
      case 'click':
        return `await element.click();
    // Add assertions for click result`;
      case 'type':
        return `await element.fill('test input');
    await expect(element).toHaveValue('test input');`;
      case 'select':
        return `await element.selectOption('test-option');
    // Add assertions for selection`;
      default:
        return `// Perform ${tool.actionType || 'action'} and add assertions`;
    }
  }

  /**
   * Generate documentation markdown
   */
  private generateDocumentationMarkdown(tools: ToolMetadata[]): string {
    const aiTools = tools.filter((tool) => tool.aiEnabled);
    const testTools = tools.filter((tool) => !tool.aiEnabled);

    return `# Generated Tool Documentation

Generated: ${new Date().toISOString()}

## Summary

- **Total Tools**: ${tools.length}
- **AI-Enabled**: ${aiTools.length}
- **Test-Only**: ${testTools.length}

## AI-Enabled Tools

${aiTools
  .map(
    (tool) => `### ${tool.name}

- **Method**: \`${tool.methodName}()\`
- **Test ID**: \`${tool.testId}\`
- **Danger Level**: ${tool.dangerLevel}
- **Requires Approval**: ${tool.requiresApproval ? 'Yes' : 'No'}
- **Element Type**: ${tool.elementType}
- **Action Type**: ${tool.actionType}

**Description**: ${tool.description}

**Examples**:
${(tool.examples || []).map((ex) => `- "${ex}"`).join('\n')}

---`
  )
  .join('\n\n')}

## Test-Only Tools

${testTools
  .map(
    (tool) => `### ${tool.name}

- **Method**: \`${tool.methodName}()\`
- **Test ID**: \`${tool.testId}\`
- **Danger Level**: ${tool.dangerLevel}
- **Element Type**: ${tool.elementType}
- **Action Type**: ${tool.actionType}

**Description**: ${tool.description}

---`
  )
  .join('\n\n')}

## Usage

### Simulation
\`\`\`typescript
import { ${this.config.simulationClassName || 'UniversalSimulation'} } from './generated/${this.config.simulationClassName || 'UniversalSimulation'}';

const simulation = new ${this.config.simulationClassName || 'UniversalSimulation'}(page);
${tools
  .slice(0, 3)
  .map((tool) => `await simulation.${tool.methodName}();`)
  .join('\n')}
\`\`\`

### AI Interface
\`\`\`typescript
import { ${this.config.aiInterfaceClassName || 'UniversalAIInterface'} } from './generated/${this.config.aiInterfaceClassName || 'UniversalAIInterface'}';

const aiInterface = new ${this.config.aiInterfaceClassName || 'UniversalAIInterface'}();
const tools = aiInterface.findToolsByQuery('click button');
\`\`\`

### Stories
\`\`\`typescript
import { ${this.config.storyClassName || 'UniversalStories'} } from './generated/${this.config.storyClassName || 'UniversalStories'}';

const stories = new ${this.config.storyClassName || 'UniversalStories'}(simulation);
const results = await stories.runAllStories();
\`\`\`
`;
  }
}

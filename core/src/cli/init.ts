#!/usr/bin/env node

/**
 * Supernal Interface CLI - Init Command
 *
 * Initializes a project with Supernal Interface capabilities.
 * Sets up configuration, generates example files, and installs dependencies.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface InitOptions {
  projectName?: string;
  framework?: 'jest' | 'vitest' | 'mocha';
  includePlaywright?: boolean;
  includeExamples?: boolean;
  outputDir?: string;
}

export class SupernalInterfaceInit {
  /**
   * Initialize a new project with Supernal Interface
   */
  static async init(options: InitOptions = {}): Promise<void> {
    const {
      projectName = 'my-supernal-interface-project',
      framework = 'jest',
      includePlaywright = true,
      includeExamples = true,
      outputDir = './supernal-interface',
    } = options;

    console.log('🚀 Initializing Supernal Interface project...');

    try {
      // Create project directory
      await fs.mkdir(outputDir, { recursive: true });

      // Generate package.json
      await this.generatePackageJson(outputDir, projectName, framework, includePlaywright);

      // Generate TypeScript config
      await this.generateTsConfig(outputDir);

      // Generate test configuration
      await this.generateTestConfig(outputDir, framework);

      // Create directory structure
      await this.createDirectoryStructure(outputDir);

      // Generate example files
      if (includeExamples) {
        await this.generateExamples(outputDir);
      }

      // Generate setup files
      await this.generateSetupFiles(outputDir);

      // Generate README
      await this.generateReadme(outputDir, projectName);

      console.log('✅ Project initialized successfully!');
      console.log(`📁 Project created in: ${outputDir}`);
      console.log('\n📋 Next steps:');
      console.log(`   cd ${outputDir}`);
      console.log('   npm install');
      console.log('   npm run generate-tests');
      console.log('   npm test');
    } catch (error) {
      console.error('❌ Failed to initialize project:', error);
      throw error;
    }
  }

  /**
   * Generate package.json
   */
  private static async generatePackageJson(
    outputDir: string,
    projectName: string,
    framework: string,
    includePlaywright: boolean
  ): Promise<void> {
    const packageJson: any = {
      name: projectName,
      version: '1.0.0',
      description: 'AI-controllable interface powered by Supernal Interface',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        'build:watch': 'tsc --watch',
        dev: 'ts-node src/index.ts',
        test: framework === 'jest' ? 'jest' : framework === 'vitest' ? 'vitest' : 'mocha',
        'test:watch':
          framework === 'jest'
            ? 'jest --watch'
            : framework === 'vitest'
              ? 'vitest --watch'
              : 'mocha --watch',
        'test:coverage':
          framework === 'jest'
            ? 'jest --coverage'
            : framework === 'vitest'
              ? 'vitest --coverage'
              : 'nyc mocha',
        'generate-tests': 'ts-node scripts/generate-tests.ts',
        'generate-docs': 'ts-node scripts/generate-docs.ts',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
      },
      dependencies: {
        '@supernal-interface/core': '^1.0.0',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        typescript: '^5.3.2',
        'ts-node': '^10.9.1',
        eslint: '^8.54.0',
        '@typescript-eslint/eslint-plugin': '^6.12.0',
        '@typescript-eslint/parser': '^6.12.0',
      },
    };

    // Add framework-specific dependencies
    if (framework === 'jest') {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        jest: '^29.7.0',
        'ts-jest': '^29.1.1',
        '@types/jest': '^29.5.8',
      };
    } else if (framework === 'vitest') {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        vitest: '^1.0.0',
        '@vitest/ui': '^1.0.0',
      };
    } else if (framework === 'mocha') {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        mocha: '^10.0.0',
        chai: '^4.3.0',
        '@types/mocha': '^10.0.0',
        '@types/chai': '^4.3.0',
        nyc: '^15.1.0',
      };
    }

    // Add Playwright if requested
    if (includePlaywright) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@playwright/test': '^1.40.0',
      };
      packageJson.scripts = {
        ...packageJson.scripts,
        'test:e2e': 'playwright test',
        'test:e2e:ui': 'playwright test --ui',
      };
    }

    await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  }

  /**
   * Generate TypeScript configuration
   */
  private static async generateTsConfig(outputDir: string): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020', 'DOM'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        resolveJsonModule: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
    };

    await fs.writeFile(path.join(outputDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  }

  /**
   * Generate test configuration
   */
  private static async generateTestConfig(outputDir: string, framework: string): Promise<void> {
    let config = '';

    if (framework === 'jest') {
      config = `module.exports = {
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
      await fs.writeFile(path.join(outputDir, 'jest.config.js'), config);
    } else if (framework === 'vitest') {
      config = `import { defineConfig } from 'vitest/config';

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
      await fs.writeFile(path.join(outputDir, 'vitest.config.ts'), config);
    }
  }

  /**
   * Create directory structure
   */
  private static async createDirectoryStructure(outputDir: string): Promise<void> {
    const directories = [
      'src/providers',
      'src/types',
      'tests/generated',
      'tests/manual',
      'scripts',
      'docs',
      'examples',
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(outputDir, dir), { recursive: true });
    }
  }

  /**
   * Generate example files
   */
  private static async generateExamples(outputDir: string): Promise<void> {
    // Example provider
    const exampleProvider = `import { Tool, ToolProvider } from '@supernal-interface/core';

export interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

@ToolProvider({
  category: 'user-management',
  executionContext: 'api'
})
export class UserProvider {
  private users: User[] = [];
  
  @Tool({ 
    aiEnabled: true,
    description: 'Get all users in the system',
    examples: ['get users', 'list all users', 'show me the users']
  })
  async getUsers(): Promise<User[]> {
    return this.users;
  }
  
  @Tool({
    aiEnabled: true,
    examples: ['search for john', 'find user by email', 'look up user']
  })
  async searchUsers(query: string): Promise<User[]> {
    return this.users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  @Tool({
    description: 'Create a new user account',
    // aiEnabled: false by default (test-only)
  })
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: \`user-\${Date.now()}\`,
      ...userData
    };
    this.users.push(user);
    return user;
  }
  
  @Tool({
    description: 'Delete a user account permanently',
    // Automatically classified as dangerous/destructive
  })
  async deleteUser(userId: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== userId);
  }
}`;

    await fs.writeFile(path.join(outputDir, 'src/providers/UserProvider.ts'), exampleProvider);

    // Main index file
    const indexFile = `import { UniversalToolRegistry } from '@supernal-interface/core';
import { UserProvider } from './providers/UserProvider';

// Initialize providers
const userProvider = new UserProvider();

// Register providers with the registry
UniversalToolRegistry.registerProvider('UserProvider', userProvider);

// Export for use in other modules
export { userProvider };
export * from './providers/UserProvider';

// Log initialization
console.log('🚀 Supernal Interface initialized');
console.log('📊 Registry stats:', UniversalToolRegistry.getStats());`;

    await fs.writeFile(path.join(outputDir, 'src/index.ts'), indexFile);
  }

  /**
   * Generate setup files
   */
  private static async generateSetupFiles(outputDir: string): Promise<void> {
    // Test setup
    const testSetup = `import { UniversalToolRegistry } from '@supernal-interface/core';
import { UserProvider } from '../src/providers/UserProvider';

// Setup test environment
beforeAll(() => {
  const userProvider = new UserProvider();
  UniversalToolRegistry.registerProvider('UserProvider', userProvider);
});

// Clean up after tests
afterAll(() => {
  // Clean up if needed
});`;

    await fs.writeFile(path.join(outputDir, 'tests/setup.ts'), testSetup);

    // Test generation script
    const generateScript = `import { TestGenerator } from '@supernal-interface/core';
import { UniversalToolRegistry } from '@supernal-interface/core';
import '../src/index'; // Initialize providers

async function generateTests() {
  console.log('🧪 Generating tests...');
  
  const tests = TestGenerator.generateAllTests({
    framework: 'jest',
    includePlaywright: true,
    includeIntegration: true
  });
  
  await TestGenerator.writeTestFiles(tests, './tests/generated');
  
  console.log(\`✅ Generated \${tests.size} test files\`);
  console.log('📊 Registry stats:', UniversalToolRegistry.getStats());
}

generateTests().catch(console.error);`;

    await fs.writeFile(path.join(outputDir, 'scripts/generate-tests.ts'), generateScript);

    // Documentation generation script
    const docsScript = `import { UniversalToolRegistry } from '@supernal-interface/core';
import * as fs from 'fs/promises';
import '../src/index'; // Initialize providers

async function generateDocs() {
  console.log('📚 Generating documentation...');
  
  const docs = UniversalToolRegistry.generateDocumentation();
  await fs.writeFile('./docs/TOOLS.md', docs);
  
  console.log('✅ Documentation generated: ./docs/TOOLS.md');
}

generateDocs().catch(console.error);`;

    await fs.writeFile(path.join(outputDir, 'scripts/generate-docs.ts'), docsScript);
  }

  /**
   * Generate README
   */
  private static async generateReadme(outputDir: string, projectName: string): Promise<void> {
    const readme = `# ${projectName}

AI-controllable interface powered by **Supernal Interface**.

## 🚀 Quick Start

\`\`\`bash
npm install
npm run generate-tests
npm test
\`\`\`

## 🎯 What This Project Does

This project uses **@supernal-interface/core** to make your application AI-controllable while maintaining strict safety controls.

### Key Features

- **AI-Safe Tools**: Only explicitly enabled tools can be controlled by AI
- **Automatic Testing**: Tests are auto-generated for all your tools
- **Natural Language Interface**: AI can understand and execute commands
- **Safety Controls**: Dangerous operations require human approval

## 📖 Usage

### 1. Define Tools

\`\`\`typescript
import { Tool, ToolProvider } from '@supernal-interface/core';

@ToolProvider({ category: 'my-category' })
export class MyProvider {
  
  @Tool({ aiEnabled: true })  // Safe for AI
  async getSomething() {
    return "Hello from AI!";
  }
  
  @Tool()  // Test-only by default
  async deleteSomething() {
    // Dangerous operation - test-only
  }
}
\`\`\`

### 2. Generate Tests

\`\`\`bash
npm run generate-tests
\`\`\`

This automatically creates comprehensive tests for all your \`@Tool\` decorated methods.

### 3. Run Tests

\`\`\`bash
npm test                 # Run all tests
npm run test:coverage    # Run with coverage
npm run test:e2e         # Run Playwright tests
\`\`\`

### 4. AI Interaction

\`\`\`typescript
import { UniversalChatInterface } from '@supernal-interface/core';

const chat = new UniversalChatInterface();
const response = await chat.execute({ text: "get something" });
\`\`\`

## 🛡️ Safety Controls

- **Default**: All tools are test-only
- **AI Control**: Requires explicit \`aiEnabled: true\`
- **Approval**: Dangerous operations need human approval
- **Classification**: Automatic danger level detection

## 📊 Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── providers/          # Your tool providers
│   └── index.ts           # Main entry point
├── tests/
│   ├── generated/         # Auto-generated tests
│   └── manual/           # Your custom tests
├── scripts/
│   ├── generate-tests.ts  # Test generation
│   └── generate-docs.ts   # Documentation generation
└── docs/
    └── TOOLS.md          # Auto-generated tool docs
\`\`\`

## 🔧 Commands

\`\`\`bash
npm run build              # Build TypeScript
npm run dev                # Development mode
npm test                   # Run tests
npm run generate-tests     # Generate tests from @Tool decorators
npm run generate-docs      # Generate tool documentation
npm run lint               # Lint code
\`\`\`

## 📚 Learn More

- [Supernal Interface Documentation](https://github.com/supernal-ai/supernal-nova)
- [Tool Decorator Reference](./docs/TOOLS.md)
- [Safety Controls Guide](https://github.com/supernal-ai/supernal-nova/docs)

## 🤝 Contributing

1. Add new tools with \`@Tool\` decorators
2. Run \`npm run generate-tests\` to create tests
3. Run \`npm test\` to verify everything works
4. Update documentation with \`npm run generate-docs\`

---

**Powered by Supernal Interface** - Making applications AI-controllable with safety-first design.`;

    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: InitOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--name' && args[i + 1]) {
      options.projectName = args[i + 1];
      i++;
    } else if (arg === '--framework' && args[i + 1]) {
      options.framework = args[i + 1] as 'jest' | 'vitest' | 'mocha';
      i++;
    } else if (arg === '--no-playwright') {
      options.includePlaywright = false;
    } else if (arg === '--no-examples') {
      options.includeExamples = false;
    } else if (arg === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    }
  }

  SupernalInterfaceInit.init(options).catch(console.error);
}

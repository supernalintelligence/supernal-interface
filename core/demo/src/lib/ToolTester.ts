/**
 * Comprehensive Tool Testing System
 * 
 * Tests all @Tool decorated methods with both positive and negative cases
 * Provides UI feedback for test results
 */

import { ToolRegistry, ToolMetadata } from '@supernal-interface/core/browser';
import { DemoAIInterface } from './AIInterface';

export interface ToolTestCase {
  name: string;
  query: string;
  expectedSuccess: boolean;
  expectedMessagePattern?: RegExp;
  description: string;
}

export interface ToolTestResult {
  testCase: ToolTestCase;
  success: boolean;
  actualSuccess: boolean;
  actualMessage: string;
  passed: boolean;
  error?: string;
}

export interface ToolTestSuite {
  toolName: string;
  testCases: ToolTestCase[];
  results: ToolTestResult[];
  overallPassed: boolean;
}

export class ToolTester {
  private aiInterface: DemoAIInterface;
  
  constructor() {
    this.aiInterface = new DemoAIInterface();
  }

  /**
   * Get comprehensive test cases for all tools
   */
  getTestCases(): Record<string, ToolTestCase[]> {
    return {
      'openMainMenu': [
        {
          name: 'Valid open menu command',
          query: 'open menu',
          expectedSuccess: true,
          expectedMessagePattern: /Main menu opened/,
          description: 'Should successfully open the menu'
        },
        {
          name: 'Alternative open command',
          query: 'show menu',
          expectedSuccess: true,
          expectedMessagePattern: /Main menu opened/,
          description: 'Should work with alternative phrasing'
        }
      ],
      
      'closeMainMenu': [
        {
          name: 'Valid close menu command',
          query: 'close menu',
          expectedSuccess: true,
          expectedMessagePattern: /Main menu closed/,
          description: 'Should successfully close the menu'
        }
      ],
      
      'toggleFeature': [
        {
          name: 'Toggle feature on',
          query: 'enable feature',
          expectedSuccess: true,
          expectedMessagePattern: /Feature (enabled|disabled)/,
          description: 'Should toggle feature state'
        },
        {
          name: 'Toggle feature off',
          query: 'disable feature',
          expectedSuccess: true,
          expectedMessagePattern: /Feature (enabled|disabled)/,
          description: 'Should toggle feature state'
        }
      ],
      
      'toggleNotifications': [
        {
          name: 'Enable notifications',
          query: 'enable notifications',
          expectedSuccess: true,
          expectedMessagePattern: /Notifications (enabled|disabled)/,
          description: 'Should enable notifications'
        },
        {
          name: 'Disable notifications',
          query: 'disable notifications',
          expectedSuccess: true,
          expectedMessagePattern: /Notifications (enabled|disabled)/,
          description: 'Should disable notifications'
        }
      ],
      
      'setPriority': [
        {
          name: 'Set priority high',
          query: 'set priority high',
          expectedSuccess: true,
          expectedMessagePattern: /Priority set to high/,
          description: 'Should set priority to high'
        },
        {
          name: 'Set priority medium',
          query: 'priority medium',
          expectedSuccess: true,
          expectedMessagePattern: /Priority set to medium/,
          description: 'Should set priority to medium'
        },
        {
          name: 'Set priority low',
          query: 'low priority',
          expectedSuccess: true,
          expectedMessagePattern: /Priority set to low/,
          description: 'Should set priority to low'
        },
        {
          name: 'Invalid priority (should fail)',
          query: 'set priority invalid',
          expectedSuccess: false,
          expectedMessagePattern: /Invalid priority/,
          description: 'Should reject invalid priority values'
        }
      ],
      
      'setStatus': [
        {
          name: 'Set status active',
          query: 'set status active',
          expectedSuccess: true,
          expectedMessagePattern: /Status changed to active/,
          description: 'Should set status to active'
        },
        {
          name: 'Set status inactive',
          query: 'status inactive',
          expectedSuccess: true,
          expectedMessagePattern: /Status changed to inactive/,
          description: 'Should set status to inactive'
        },
        {
          name: 'Set status pending',
          query: 'status pending',
          expectedSuccess: true,
          expectedMessagePattern: /Status changed to pending/,
          description: 'Should set status to pending'
        },
        {
          name: 'Set status disabled',
          query: 'status disabled',
          expectedSuccess: true,
          expectedMessagePattern: /Status changed to disabled/,
          description: 'Should set status to disabled'
        },
        {
          name: 'Invalid status (should fail)',
          query: 'set status invalid',
          expectedSuccess: false,
          expectedMessagePattern: /Invalid status/,
          description: 'Should reject invalid status values'
        }
      ],
      
      'setTheme': [
        {
          name: 'Set theme dark',
          query: 'set theme dark',
          expectedSuccess: true,
          expectedMessagePattern: /Theme changed to dark/,
          description: 'Should set theme to dark'
        },
        {
          name: 'Set theme light',
          query: 'light theme',
          expectedSuccess: true,
          expectedMessagePattern: /Theme changed to light/,
          description: 'Should set theme to light'
        },
        {
          name: 'Set theme auto',
          query: 'auto theme',
          expectedSuccess: true,
          expectedMessagePattern: /Theme changed to auto/,
          description: 'Should set theme to auto'
        },
        {
          name: 'Invalid theme (should fail)',
          query: 'set theme invalid',
          expectedSuccess: false,
          expectedMessagePattern: /Invalid theme/,
          description: 'Should reject invalid theme values'
        }
      ],
      
      'submitForm': [
        {
          name: 'Submit form with name',
          query: 'submit form with John',
          expectedSuccess: true,
          expectedMessagePattern: /Form submitted with name: John/,
          description: 'Should submit form with provided name'
        },
        {
          name: 'Submit form default name',
          query: 'submit form',
          expectedSuccess: true,
          expectedMessagePattern: /Form submitted with name: AI User/,
          description: 'Should use default name when none provided'
        }
      ]
    };
  }

  /**
   * Run all tests for all tools
   */
  async runAllTests(): Promise<ToolTestSuite[]> {
    const testCases = this.getTestCases();
    const results: ToolTestSuite[] = [];
    
    for (const [toolName, cases] of Object.entries(testCases)) {
      const suite: ToolTestSuite = {
        toolName,
        testCases: cases,
        results: [],
        overallPassed: true
      };
      
      for (const testCase of cases) {
        const result = await this.runSingleTest(testCase);
        suite.results.push(result);
        if (!result.passed) {
          suite.overallPassed = false;
        }
      }
      
      results.push(suite);
    }
    
    return results;
  }

  /**
   * Run a single test case
   */
  async runSingleTest(testCase: ToolTestCase): Promise<ToolTestResult> {
    try {
      const command = this.aiInterface.findToolsForCommand(testCase.query);
      const response = await this.aiInterface.executeCommand(command, true);
      
      // Check if the result matches expectations
      const successMatches = response.success === testCase.expectedSuccess;
      const messageMatches = testCase.expectedMessagePattern ? 
        testCase.expectedMessagePattern.test(response.message) : true;
      
      const passed = successMatches && messageMatches;
      
      return {
        testCase,
        success: true,
        actualSuccess: response.success,
        actualMessage: response.message,
        passed
      };
    } catch (error) {
      return {
        testCase,
        success: false,
        actualSuccess: false,
        actualMessage: error instanceof Error ? error.message : String(error),
        passed: !testCase.expectedSuccess, // If we expected failure and got an error, that's a pass
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get a summary of test results
   */
  getTestSummary(suites: ToolTestSuite[]): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    failedSuites: string[];
  } {
    const totalTests = suites.reduce((sum, suite) => sum + suite.testCases.length, 0);
    const passedTests = suites.reduce((sum, suite) => 
      sum + suite.results.filter(r => r.passed).length, 0);
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const failedSuites = suites.filter(s => !s.overallPassed).map(s => s.toolName);
    
    return {
      totalTests,
      passedTests,
      failedTests,
      passRate,
      failedSuites
    };
  }
}

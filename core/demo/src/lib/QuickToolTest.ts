/**
 * Quick Tool Test - Can be run in browser console
 * Tests the most common tool issues
 */

import { DemoAIInterface } from './AIInterface';

export class QuickToolTest {
  private aiInterface: DemoAIInterface;
  
  constructor() {
    this.aiInterface = new DemoAIInterface();
  }

  async testParameterBasedTools(
    onProgress?: (current: number, total: number, testName: string, result?: any) => void,
    delayMs: number = 800
  ): Promise<{ passed: number; failed: number; results: any[] }> {
    const tests = [
      { name: 'Set Theme Dark', query: 'set theme dark', expectedSuccess: true },
      { name: 'Set Theme Light', query: 'set theme light', expectedSuccess: true },
      { name: 'Set Priority High', query: 'set priority high', expectedSuccess: true },
      { name: 'Set Status Active', query: 'set status active', expectedSuccess: true },
      { name: 'Toggle Notifications', query: 'enable notifications', expectedSuccess: true },
      { name: 'Submit Form', query: 'submit form with TestUser', expectedSuccess: true },
      // Negative tests
      { name: 'Invalid Theme', query: 'set theme invalid', expectedSuccess: false },
      { name: 'Invalid Priority', query: 'set priority invalid', expectedSuccess: false },
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    console.log('🧪 Testing Parameter-Based Tools...\n');

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Notify progress - starting test
      onProgress?.(i + 1, tests.length, test.name);
      
      try {
        const command = this.aiInterface.findToolsForCommand(test.query);
        const response = await this.aiInterface.executeCommand(command, true);
        
        const testPassed = response.success === test.expectedSuccess;
        const result = {
          name: test.name,
          query: test.query,
          expectedSuccess: test.expectedSuccess,
          actualSuccess: response.success,
          message: response.message,
          passed: testPassed
        };
        
        if (testPassed) {
          passed++;
          console.log(`✅ ${test.name}: PASS`);
        } else {
          failed++;
          console.log(`❌ ${test.name}: FAIL - Expected ${test.expectedSuccess ? 'success' : 'failure'}, got ${response.success ? 'success' : 'failure'}`);
        }
        
        results.push(result);
        
        // Notify progress - test completed
        onProgress?.(i + 1, tests.length, test.name, result);
        
      } catch (error) {
        failed++;
        console.log(`❌ ${test.name}: ERROR - ${error}`);
        
        const result = {
          name: test.name,
          query: test.query,
          expectedSuccess: test.expectedSuccess,
          actualSuccess: false,
          message: error instanceof Error ? error.message : String(error),
          passed: false,
          error: true
        };
        
        results.push(result);
        
        // Notify progress - test completed with error
        onProgress?.(i + 1, tests.length, test.name, result);
      }
      
      // Add delay between tests for better visual feedback
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    console.log(`Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    return { passed, failed, results };
  }
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).QuickToolTest = QuickToolTest;
}

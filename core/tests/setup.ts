/**
 * Test Setup
 * 
 * Global test setup for Supernal Interface core package tests.
 */

// Extend Jest matchers if needed
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add custom matchers here if needed
    }
  }
}

// Global test setup
beforeAll(() => {
  // Suppress console.log during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  }
});

afterAll(() => {
  // Restore console.log
  if (!process.env.VERBOSE_TESTS) {
    (console.log as jest.Mock).mockRestore();
  }
});

// Global test utilities
export const testUtils = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(condition: () => boolean, timeout = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    return false;
  },
  
  /**
   * Create a mock tool provider for testing
   */
  createMockProvider(name: string, methods: Record<string, Function>) {
    const provider = {};
    
    for (const [methodName, method] of Object.entries(methods)) {
      (provider as any)[methodName] = method;
    }
    
    return provider;
  }
};

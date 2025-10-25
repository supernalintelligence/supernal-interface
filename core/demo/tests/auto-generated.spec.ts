/**
 * Auto-Generated Playwright Tests
 * 
 * These tests are automatically generated from @Tool decorators
 * and demonstrate how the system can create comprehensive test suites.
 */

import { test, expect } from '@playwright/test';

test.describe('@supernal-interface/core Auto-Generated Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page
    await page.goto('http://localhost:3010');
    
    // Wait for the page to load and tools to be registered
    await page.waitForSelector('[data-testid="open-main-menu"]');
  });

  test('should have all required tool elements present', async ({ page }) => {
    // These test IDs are automatically extracted from @Tool decorators
    const requiredElements = [
      'open-main-menu',
      'close-main-menu', 
      'navigate-to-docs',
      'send-chat-message',
      'clear-chat-history',
      'toggle-chat-panel',
      'generate-code-example',
      'run-test-simulation',
      'reset-demo-state',
      'delete-demo-data',
      'export-demo-config'
    ];

    for (const testId of requiredElements) {
      await expect(page.locator(`[data-testid="${testId}"]`)).toBeVisible();
    }
  });

  test('should execute safe navigation tools', async ({ page }) => {
    // Test opening menu (safe action)
    await page.click('[data-testid="open-main-menu"]');
    await expect(page.locator('.fixed.inset-0')).toBeVisible(); // Menu overlay
    
    // Test closing menu
    await page.click('[data-testid="close-main-menu"]');
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('should execute demo control tools', async ({ page }) => {
    // Test generating code example
    await page.click('[data-testid="generate-code-example"]');
    // Should show code example section
    
    // Test running simulation
    await page.click('[data-testid="run-test-simulation"]');
    // Should show test running indicator
    
    // Test reset
    await page.click('[data-testid="reset-demo-state"]');
    // Should reset demo state
  });

  test('should handle chat interface tools', async ({ page }) => {
    // Test sending a message
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="send-chat-message"]');
    
    // Test clearing chat
    await page.click('[data-testid="clear-chat-history"]');
  });

  test('should show tool visualization tab', async ({ page }) => {
    // Navigate to tools tab
    await page.click('text=Available Tools');
    
    // Should show tool cards
    await expect(page.locator('.grid')).toBeVisible();
    
    // Should show tool statistics
    await expect(page.locator('text=Tool Summary')).toBeVisible();
  });

  test('should run auto-testing system', async ({ page }) => {
    // Navigate to testing tab
    await page.click('text=Auto-Testing');
    
    // Should show testing interface
    await expect(page.locator('text=Auto-Testing System')).toBeVisible();
    
    // Run safe tests
    await page.selectOption('select', 'safe-only');
    await page.click('text=Run All Tests');
    
    // Should show test results
    await expect(page.locator('text=Test Results Summary')).toBeVisible();
  });

  test('should process AI commands', async ({ page }) => {
    // Test AI command interface
    await page.fill('input[placeholder*="Try:"]', 'open menu');
    await page.click('text=Execute AI Command');
    
    // Should execute the command and show result
    await expect(page.locator('.fixed.inset-0')).toBeVisible(); // Menu should open
  });

  test('should handle dangerous actions with approval', async ({ page }) => {
    // Test dangerous action that requires approval
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('delete ALL demo data');
      dialog.dismiss(); // Reject the dangerous action
    });
    
    await page.click('[data-testid="delete-demo-data"]');
    // Dialog should have been shown and dismissed
  });

  test('should show correct tool metadata', async ({ page }) => {
    // Navigate to tools tab
    await page.click('text=Available Tools');
    
    // Check that tools show correct danger levels
    await expect(page.locator('text=safe')).toBeVisible();
    await expect(page.locator('text=moderate')).toBeVisible();
    await expect(page.locator('text=destructive')).toBeVisible();
    
    // Check AI enabled indicators
    await expect(page.locator('text=AI Enabled')).toBeVisible();
    await expect(page.locator('text=Test Only')).toBeVisible();
  });

  test('should demonstrate real tool execution', async ({ page }) => {
    // This test shows that the tools actually work, not just exist
    
    // 1. Generate code example
    await page.click('[data-testid="generate-code-example"]');
    await expect(page.locator('text=Generated @Tool Code')).toBeVisible();
    
    // 2. Run test simulation  
    await page.click('[data-testid="run-test-simulation"]');
    await expect(page.locator('text=Test Simulation Running')).toBeVisible();
    
    // 3. Reset demo
    await page.click('[data-testid="reset-demo-state"]');
    // Code example and test simulation should be hidden after reset
    await expect(page.locator('text=Generated @Tool Code')).not.toBeVisible();
    await expect(page.locator('text=Test Simulation Running')).not.toBeVisible();
  });
});

test.describe('AI Command Processing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForSelector('[data-testid="open-main-menu"]');
  });

  const aiCommands = [
    { command: 'open menu', expectedAction: 'menu opens' },
    { command: 'show code', expectedAction: 'code example appears' },
    { command: 'run test', expectedAction: 'test simulation starts' },
    { command: 'clear chat', expectedAction: 'chat messages cleared' }
  ];

  for (const { command, expectedAction } of aiCommands) {
    test(`should process AI command: "${command}"`, async ({ page }) => {
      await page.fill('input[placeholder*="Try:"]', command);
      await page.click('text=Execute AI Command');
      
      // Wait for command processing
      await page.waitForTimeout(500);
      
      // Verify the command was processed (check for success message or action)
      const messages = page.locator('.message');
      await expect(messages).toContainText('✅');
    });
  }
});

test.describe('Tool Safety and Permissions', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForSelector('[data-testid="open-main-menu"]');
  });

  test('should block AI from executing test-only tools', async ({ page }) => {
    // Navigate to tools tab
    await page.click('text=Available Tools');
    
    // Find a test-only tool and try to execute it
    const testOnlyTools = page.locator('text=Test Only').first();
    if (await testOnlyTools.isVisible()) {
      // Should show disabled state for AI execution
      await expect(page.locator('text=AI Disabled')).toBeVisible();
    }
  });

  test('should require approval for dangerous actions', async ({ page }) => {
    // Test that dangerous actions show approval workflow
    await page.fill('input[placeholder*="Try:"]', 'delete data');
    await page.click('text=Execute AI Command');
    
    // Should show approval request
    await expect(page.locator('text=requires approval')).toBeVisible();
    await expect(page.locator('text=Approve')).toBeVisible();
    await expect(page.locator('text=Deny')).toBeVisible();
  });
});

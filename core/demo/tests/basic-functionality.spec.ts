/**
 * Basic Functionality Test
 * 
 * Tests that the demo loads and basic functionality works
 */

import { test, expect } from '@playwright/test';

test.describe('Basic Demo Functionality', () => {
  
  test('should load the demo page successfully', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Check that the page loads
    await expect(page.locator('h1')).toContainText('Make Any Application AI-Controllable');
    
    // Check that tool statistics are displayed
    await expect(page.locator('text=Total Tools')).toBeVisible();
  });

  test('should have navigation tabs', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Check that all three tabs exist
    await expect(page.locator('text=Interactive Demo')).toBeVisible();
    await expect(page.locator('text=Available Tools')).toBeVisible();
    await expect(page.locator('text=Auto-Testing')).toBeVisible();
  });

  test('should be able to switch between tabs', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Click on Available Tools tab
    await page.click('text=Available Tools');
    await expect(page.locator('text=Available AI Tools')).toBeVisible();
    
    // Click on Auto-Testing tab
    await page.click('text=Auto-Testing');
    await expect(page.locator('text=Auto-Testing System')).toBeVisible();
    
    // Click back to Interactive Demo
    await page.click('text=Interactive Demo');
    await expect(page.locator('text=AI Command Interface')).toBeVisible();
  });

  test('should have required UI elements with data-testid attributes', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Check for key elements that should have data-testid attributes
    const requiredElements = [
      'open-main-menu',
      'navigate-to-docs',
      'generate-code-example',
      'run-test-simulation',
      'reset-demo-state'
    ];

    for (const testId of requiredElements) {
      await expect(page.locator(`[data-testid="${testId}"]`)).toBeVisible();
    }
  });

  test('should be able to execute safe actions', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Test opening menu (safe action)
    await page.click('[data-testid="open-main-menu"]');
    
    // Should show menu overlay
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    
    // Close the menu
    await page.click('[data-testid="close-main-menu"]');
    
    // Menu should be closed
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });
});

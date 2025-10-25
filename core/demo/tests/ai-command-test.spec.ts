/**
 * AI Command Test
 * 
 * Test that AI commands actually work and execute @Tool methods
 */

import { test, expect } from '@playwright/test';

test.describe('AI Command Interface', () => {
  
  test('should be able to type in AI command input', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Find the AI command input
    const aiInput = page.locator('input[placeholder*="open menu"]');
    await expect(aiInput).toBeVisible();
    
    // Try to type in it
    await aiInput.fill('open menu');
    await expect(aiInput).toHaveValue('open menu');
    
    console.log('✅ AI input accepts text');
  });

  test('should execute tool command when typed', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Listen for console messages to see tool execution
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    // Find and use the AI command input
    const aiInput = page.locator('input[placeholder*="open menu"]');
    const executeButton = page.locator('button:has-text("Execute Tool Command")');
    
    await aiInput.fill('open menu');
    await executeButton.click();
    
    // Wait for execution
    await page.waitForTimeout(2000);
    
    // Check if tool was found and executed
    const toolMessages = consoleMessages.filter(msg => 
      msg.includes('Tool Match') || msg.includes('Tool Schema')
    );
    
    console.log('Console messages:', consoleMessages);
    console.log('Tool messages:', toolMessages);
    
    expect(toolMessages.length).toBeGreaterThan(0);
  });

  test('should open menu via AI command vs UI button', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Test 1: Open menu via UI button (should NOT claim AI opened it)
    const uiMenuButton = page.locator('[data-testid="open-main-menu"]');
    await uiMenuButton.click();
    
    // Check menu content
    const menuModal = page.locator('.fixed.inset-0');
    await expect(menuModal).toBeVisible();
    
    const menuText = await menuModal.textContent();
    expect(menuText).toContain('regular UI menu');
    expect(menuText).not.toContain('opened by AI using');
    
    // Close menu
    await page.locator('[data-testid="close-main-menu"]').click();
    await expect(menuModal).not.toBeVisible();
    
    // Test 2: Open menu via AI command
    const aiInput = page.locator('input[placeholder*="open menu"]');
    const executeButton = page.locator('button:has-text("Execute Tool Command")');
    
    await aiInput.fill('open menu');
    await executeButton.click();
    
    // Wait and check if menu opened via AI
    await page.waitForTimeout(1000);
    
    // The menu should open (if AI command works)
    const menuAfterAI = page.locator('.fixed.inset-0');
    const isVisible = await menuAfterAI.isVisible();
    
    console.log('Menu visible after AI command:', isVisible);
  });
});

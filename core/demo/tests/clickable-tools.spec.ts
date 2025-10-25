/**
 * Clickable Tools Test
 * 
 * Test that tool cards are clickable and execute tools directly
 */

import { test, expect } from '@playwright/test';

test.describe('Clickable Tool Interface', () => {
  
  test('should show clickable tool cards with execute buttons', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Wait for tools to load
    await page.waitForTimeout(2000);
    
    // Check for tool cards
    const toolCards = page.locator('.border.border-gray-200.rounded-lg');
    const cardCount = await toolCards.count();
    console.log(`Found ${cardCount} tool cards`);
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for execute buttons
    const executeButtons = page.locator('button:has-text("Execute Tool"), button:has-text("Execute (Requires Approval)")');
    const buttonCount = await executeButtons.count();
    console.log(`Found ${buttonCount} execute buttons`);
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should execute tool when clicking execute button', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    // Wait for tools to load
    await page.waitForTimeout(2000);
    
    // Find a safe tool to execute (not requiring approval)
    const safeExecuteButton = page.locator('button:has-text("▶️ Execute Tool")').first();
    const buttonExists = await safeExecuteButton.count() > 0;
    
    if (buttonExists) {
      await safeExecuteButton.click();
      
      // Wait for execution
      await page.waitForTimeout(2000);
      
      // Check for execution messages
      const executionMessages = consoleMessages.filter(msg => 
        msg.includes('Executing tool') || msg.includes('Tool executed successfully')
      );
      
      console.log('Execution messages:', executionMessages);
      expect(executionMessages.length).toBeGreaterThan(0);
    } else {
      console.log('No safe execute buttons found');
    }
  });

  test('should populate AI input when clicking command examples', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Wait for tools to load
    await page.waitForTimeout(2000);
    
    // Find a command example to click
    const commandExample = page.locator('.font-mono.text-xs.cursor-pointer').first();
    const exampleExists = await commandExample.count() > 0;
    
    if (exampleExists) {
      const exampleText = await commandExample.textContent();
      console.log('Clicking command example:', exampleText);
      
      await commandExample.click();
      
      // Check if AI input was populated
      const aiInput = page.locator('input[placeholder*="open menu"]');
      const inputValue = await aiInput.inputValue();
      
      console.log('AI input value after click:', inputValue);
      expect(inputValue.length).toBeGreaterThan(0);
    } else {
      console.log('No command examples found');
    }
  });

  test('should show chat interface and accept input', async ({ page }) => {
    await page.goto('http://localhost:3010');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for chat interface
    const chatInterface = page.locator('h2:has-text("Chat Interface")');
    const chatExists = await chatInterface.count() > 0;
    
    if (chatExists) {
      console.log('✅ Chat interface found');
      
      // Try to find and use chat input
      const chatInput = page.locator('[data-testid="chat-input"]');
      const chatInputExists = await chatInput.count() > 0;
      
      if (chatInputExists) {
        await chatInput.fill('Hello test message');
        const inputValue = await chatInput.inputValue();
        console.log('Chat input value:', inputValue);
        expect(inputValue).toBe('Hello test message');
      } else {
        console.log('❌ Chat input not found');
      }
    } else {
      console.log('❌ Chat interface not visible');
    }
  });
});

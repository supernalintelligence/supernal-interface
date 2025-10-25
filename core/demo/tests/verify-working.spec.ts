/**
 * Verify Working Test
 * 
 * Simple test to verify the system is actually working despite any compilation warnings
 */

import { test, expect } from '@playwright/test';

test.describe('Verify System is Working', () => {
  
  test('page loads and shows content', async ({ page }) => {
    // Go to the page
    await page.goto('http://localhost:3010');
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    // Check if the page has loaded by looking for any text content
    const pageContent = await page.textContent('body');
    console.log('Page has content:', pageContent ? pageContent.length > 100 : false);
    
    // Try to find the main heading
    const heading = page.locator('h1');
    const headingExists = await heading.count() > 0;
    console.log('Main heading exists:', headingExists);
    
    if (headingExists) {
      const headingText = await heading.textContent();
      console.log('Heading text:', headingText);
    }
    
    // Check for any buttons with data-testid
    const testButtons = page.locator('[data-testid]');
    const buttonCount = await testButtons.count();
    console.log('Number of elements with data-testid:', buttonCount);
    
    // List the first few testids
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const testId = await testButtons.nth(i).getAttribute('data-testid');
      console.log(`TestID ${i + 1}:`, testId);
    }
    
    // Basic assertion - page should have some content
    expect(pageContent).toBeTruthy();
    expect(pageContent!.length).toBeGreaterThan(100);
  });

  test('can interact with basic elements', async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForTimeout(2000);
    
    // Try to find and click the open menu button
    const openMenuButton = page.locator('[data-testid="open-main-menu"]');
    const buttonExists = await openMenuButton.count() > 0;
    console.log('Open menu button exists:', buttonExists);
    
    if (buttonExists) {
      // Try to click it
      await openMenuButton.click();
      console.log('Clicked open menu button');
      
      // Wait a bit and check if anything changed
      await page.waitForTimeout(1000);
      
      // Look for the close button or menu overlay
      const closeButton = page.locator('[data-testid="close-main-menu"]');
      const closeButtonExists = await closeButton.count() > 0;
      console.log('Close menu button appeared:', closeButtonExists);
      
      if (closeButtonExists) {
        await closeButton.click();
        console.log('Clicked close menu button');
      }
    }
  });

  test('check tool registration in console', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    await page.goto('http://localhost:3010');
    await page.waitForTimeout(3000);
    
    // Check if we got tool registration messages
    const toolMessages = consoleMessages.filter(msg => 
      msg.includes('Registered Tool') || msg.includes('Tool Provider')
    );
    
    console.log('Tool registration messages found:', toolMessages.length);
    toolMessages.forEach((msg, i) => {
      console.log(`Tool ${i + 1}:`, msg);
    });
    
    // We should have some tool registrations
    expect(toolMessages.length).toBeGreaterThan(0);
  });
});

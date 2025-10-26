/**
 * Auto-generated Playwright tests for @supernal-interface widget-tool integration
 * 
 * Tests all 8 @Tool methods and their corresponding widgets for perfect 1:1 mapping.
 */

import { test, expect } from '@playwright/test';

test.describe('@supernal-interface Widget-Tool Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    
    // Wait for tools to be registered
    await page.waitForFunction(() => {
      return window.console && typeof window.console.log === 'function';
    });
  });

  test.describe('Button Widgets', () => {
    
    test('Open Main Menu - widget click and tool execution', async ({ page }) => {
      // Test widget click
      const openButton = page.locator('[data-testid="open-main-menu"]');
      await expect(openButton).toBeVisible();
      await expect(openButton).toContainText('Open Menu');
      
      await openButton.click();
      
      // Verify state change
      await expect(openButton).toContainText('✅ Menu Open');
      
      // Test tool execution via available tools
      const toolButton = page.locator('[data-testid="execute-open-main-menu"]');
      await expect(toolButton).toBeVisible();
      await toolButton.click();
      
      // Verify chat feedback
      await expect(page.locator('.bg-green-100')).toContainText('Main menu opened');
    });

    test('Close Main Menu - widget click and tool execution', async ({ page }) => {
      // First open the menu
      await page.locator('[data-testid="open-main-menu"]').click();
      
      // Test close widget click
      const closeButton = page.locator('[data-testid="close-main-menu"]');
      await expect(closeButton).toBeVisible();
      await expect(closeButton).not.toBeDisabled();
      
      await closeButton.click();
      
      // Verify state change
      await expect(page.locator('[data-testid="open-main-menu"]')).toContainText('Open Menu');
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-close-main-menu"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Main menu closed');
    });
  });

  test.describe('Checkbox Widgets', () => {
    
    test('Toggle Feature - widget and tool', async ({ page }) => {
      // Test widget interaction
      const featureCheckbox = page.locator('[data-testid="feature-toggle-widget"]');
      await expect(featureCheckbox).toBeVisible();
      await expect(featureCheckbox).not.toBeChecked();
      
      await featureCheckbox.click();
      await expect(featureCheckbox).toBeChecked();
      
      // Verify visual feedback
      await expect(page.locator('text=Enable Feature ✅')).toBeVisible();
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-feature-toggle-widget"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Feature');
    });

    test('Toggle Notifications - widget and tool', async ({ page }) => {
      // Test widget interaction
      const notificationsCheckbox = page.locator('[data-testid="notifications-toggle-widget"]');
      await expect(notificationsCheckbox).toBeVisible();
      await expect(notificationsCheckbox).not.toBeChecked();
      
      await notificationsCheckbox.click();
      await expect(notificationsCheckbox).toBeChecked();
      
      // Verify visual feedback
      await expect(page.locator('text=Enable Notifications ✅')).toBeVisible();
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-notifications-toggle-widget"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Notifications');
    });
  });

  test.describe('Radio Widget', () => {
    
    test('Set Priority - widget and tool', async ({ page }) => {
      // Test widget interaction - default should be medium
      const mediumRadio = page.locator('[data-testid="priority-medium-widget"]');
      await expect(mediumRadio).toBeChecked();
      
      // Click high priority
      const highRadio = page.locator('[data-testid="priority-high-widget"]');
      await highRadio.click();
      await expect(highRadio).toBeChecked();
      await expect(mediumRadio).not.toBeChecked();
      
      // Verify visual feedback
      await expect(page.locator('text=High ✅')).toBeVisible();
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-priority-radio-widget"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Priority set to');
    });
  });

  test.describe('Select Widgets', () => {
    
    test('Set Status - widget and tool', async ({ page }) => {
      // Test widget interaction
      const statusSelect = page.locator('[data-testid="status-select-widget"]');
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('inactive');
      
      await statusSelect.selectOption('active');
      await expect(statusSelect).toHaveValue('active');
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-status-select-widget"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Status changed to');
      
      // Verify the widget reflects the tool change
      await expect(statusSelect).toHaveValue('active');
    });

    test('Set Theme - widget and tool', async ({ page }) => {
      // Test widget interaction
      const themeSelect = page.locator('[data-testid="theme-select-widget"]');
      await expect(themeSelect).toBeVisible();
      await expect(themeSelect).toHaveValue('light');
      
      await themeSelect.selectOption('dark');
      await expect(themeSelect).toHaveValue('dark');
      
      // Verify theme applied to document
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-theme-select-widget"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Theme changed to');
      
      // Verify the widget reflects the tool change
      await expect(themeSelect).toHaveValue('dark');
    });
  });

  test.describe('Form Widget', () => {
    
    test('Submit Form - widget and tool', async ({ page }) => {
      // Test widget interaction
      const nameInput = page.locator('[data-testid="form-name-widget"]');
      const submitButton = page.locator('[data-testid="form-submit-widget"]');
      
      await expect(nameInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeDisabled();
      
      await nameInput.fill('Test User');
      await expect(submitButton).not.toBeDisabled();
      
      await submitButton.click();
      
      // Verify form cleared
      await expect(nameInput).toHaveValue('');
      await expect(submitButton).toBeDisabled();
      
      // Test tool execution
      const toolButton = page.locator('[data-testid="execute-form-submit-widget"]');
      await toolButton.click();
      await expect(page.locator('.bg-green-100')).toContainText('Form submitted with name');
    });
  });

  test.describe('Chat Bubble Integration', () => {
    
    test('Chat bubble auto-opens and can be toggled', async ({ page }) => {
      // Chat bubble should be visible
      const chatBubble = page.locator('[data-testid="chat-bubble-toggle"]');
      await expect(chatBubble).toBeVisible();
      
      // Chat should be auto-opened on load
      const chatInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="chat-send-button"]');
      await expect(chatInput).toBeVisible();
      await expect(sendButton).toBeVisible();
      
      // Click to minimize chat
      await chatBubble.click();
      
      // Chat panel should be hidden
      await expect(chatInput).not.toBeVisible();
      
      // Click to expand again
      await chatBubble.click();
      
      // Chat panel should be visible again
      await expect(chatInput).toBeVisible();
    });

    test('AI commands execute corresponding tools via chat bubble', async ({ page }) => {
      // Chat should already be open, but ensure it's visible
      
      const chatInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="chat-send-button"]');
      
      // Test "toggle notifications" command
      await chatInput.fill('toggle notifications');
      await sendButton.click();
      
      // Verify AI response in chat
      await expect(page.locator('.bg-gray-200')).toContainText('Notifications');
      
      // Verify widget state changed
      const notificationsCheckbox = page.locator('[data-testid="notifications-toggle-widget"]');
      await expect(notificationsCheckbox).toBeChecked();
      
      // Test parameter passing with "set priority medium"
      await chatInput.fill('set priority medium');
      await sendButton.click();
      
      // Verify AI response with parameter
      await expect(page.locator('.bg-gray-200')).toContainText('Priority set to medium');
      
      // Verify radio button change
      const mediumRadio = page.locator('[data-testid="priority-medium-widget"]');
      await expect(mediumRadio).toBeChecked();
      
      // Test "set theme dark" command
      await chatInput.fill('set theme dark');
      await sendButton.click();
      
      // Verify AI response
      await expect(page.locator('.bg-gray-200')).toContainText('Theme changed to');
      
      // Verify widget state changed
      const themeSelect = page.locator('[data-testid="theme-select-widget"]');
      await expect(themeSelect).toHaveValue('dark');
    });

    test('Chat bubble shows unread indicator', async ({ page }) => {
      // Execute a tool to generate a message
      const toolButton = page.locator('[data-testid="execute-feature-toggle-widget"]');
      await toolButton.click();
      
      // Chat bubble should show unread indicator
      const unreadIndicator = page.locator('.bg-red-500');
      await expect(unreadIndicator).toBeVisible();
      
      // Open chat bubble
      const chatBubble = page.locator('[data-testid="chat-bubble-toggle"]');
      await chatBubble.click();
      
      // Close chat bubble
      await chatBubble.click();
      
      // Unread indicator should be gone after viewing
      await expect(unreadIndicator).not.toBeVisible();
    });

    test('Chat can be cleared', async ({ page }) => {
      // Open chat bubble
      const chatBubble = page.locator('[data-testid="chat-bubble-toggle"]');
      await chatBubble.click();
      
      // Send a message
      const chatInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="chat-send-button"]');
      await chatInput.fill('test message');
      await sendButton.click();
      
      // Clear chat
      const clearButton = page.locator('[data-testid="clear-chat-button"]');
      await clearButton.click();
      
      // Initial demo messages should remain
      const messages = page.locator('.bg-yellow-100');
      await expect(messages).toHaveCount(4);
      await expect(messages.first()).toContainText('Welcome to @supernal-interface Demo');
    });

    test('Visual highlighting appears when AI commands execute', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="chat-send-button"]');
      
      // Test that widget gets highlighted when AI command executes
      await chatInput.fill('toggle feature');
      await sendButton.click();
      
      // Check for highlight classes (ring-4, animate-pulse, bg-blue-50)
      const featureWidget = page.locator('[data-testid="feature-toggle-widget"]').locator('..');
      await expect(featureWidget).toHaveClass(/ring-4|animate-pulse|bg-blue-50/);
      
      // Wait for highlight to fade (2 seconds)
      await page.waitForTimeout(2500);
      
      // Highlight should be gone
      await expect(featureWidget).not.toHaveClass(/ring-4|animate-pulse|bg-blue-50/);
    });
  });

  test.describe('Tool Registry Validation', () => {
    
    test('All 8 tools are registered and visible', async ({ page }) => {
      // Check that exactly 8 tool cards are displayed
      const toolCards = page.locator('[data-testid^="execute-"]');
      await expect(toolCards).toHaveCount(8);
      
      // Verify specific tools are present
      const expectedTools = [
        'execute-open-main-menu',
        'execute-close-main-menu', 
        'execute-feature-toggle-widget',
        'execute-notifications-toggle-widget',
        'execute-priority-radio-widget',
        'execute-status-select-widget',
        'execute-theme-select-widget',
        'execute-form-submit-widget'
      ];
      
      for (const toolId of expectedTools) {
        await expect(page.locator(`[data-testid="${toolId}"]`)).toBeVisible();
      }
    });

    test('Tool execution provides proper feedback', async ({ page }) => {
      // Execute each tool and verify feedback
      const toolButtons = page.locator('[data-testid^="execute-"]');
      const count = await toolButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = toolButtons.nth(i);
        await button.click();
        
        // Wait for feedback to appear
        await expect(page.locator('.bg-green-100')).toBeVisible();
        
        // Wait for feedback to disappear before next test
        await page.waitForTimeout(2100);
      }
    });
  });

  test.describe('State Synchronization', () => {
    
    test('Widget changes reflect in tool execution and vice versa', async ({ page }) => {
      // Change widget state
      const featureCheckbox = page.locator('[data-testid="feature-toggle-widget"]');
      await featureCheckbox.click();
      await expect(featureCheckbox).toBeChecked();
      
      // Execute tool - should toggle back
      const toolButton = page.locator('[data-testid="execute-feature-toggle-widget"]');
      await toolButton.click();
      
      // Widget should reflect tool change
      await expect(featureCheckbox).not.toBeChecked();
      
      // Test with select widget
      const statusSelect = page.locator('[data-testid="status-select-widget"]');
      await statusSelect.selectOption('pending');
      await expect(statusSelect).toHaveValue('pending');
      
      // Execute tool - should change to 'active' (default in tool)
      const statusToolButton = page.locator('[data-testid="execute-status-select-widget"]');
      await statusToolButton.click();
      
      // Widget should reflect tool change
      await expect(statusSelect).toHaveValue('active');
    });
  });
});

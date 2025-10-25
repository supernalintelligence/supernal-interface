Feature: Interactive UI Widgets with Tool Decorators
  As a developer
  I want to interact with UI widgets that execute @Tool methods directly
  So that I can see immediate results and understand the system behavior

  Background:
    Given the demo application is loaded
    And the UI widgets section is visible
    And all @Tool decorated methods are registered

  Scenario: Click a standard button widget
    Given I see a button labeled "Open Menu"
    When I click the button
    Then the @Tool method "openMainMenu()" executes immediately
    And I see visual feedback that the menu opened
    And the button state reflects the current menu state

  Scenario: Interact with form input widget
    Given I see a text input field with label "Send Message"
    When I type "Hello World" and press Enter
    Then the @Tool method "sendChatMessage('Hello World')" executes
    And I see the message appear in the chat interface
    And the input field clears automatically

  Scenario: Toggle checkbox widget
    Given I see a checkbox labeled "Enable Notifications"
    When I click the checkbox
    Then the @Tool method "toggleNotifications()" executes
    And the checkbox state changes to reflect the new setting
    And other UI elements update based on the notification state

  Scenario: Select radio button widget
    Given I see radio buttons for "Theme: Light, Dark, Auto"
    When I select "Dark"
    Then the @Tool method "setTheme('dark')" executes
    And the UI theme changes immediately to dark mode
    And the radio button selection is updated

  Scenario: Use dropdown/select widget
    Given I see a dropdown labeled "Language"
    When I select "Spanish" from the dropdown
    Then the @Tool method "setLanguage('es')" executes
    And UI text changes to Spanish where applicable
    And the dropdown shows "Spanish" as selected
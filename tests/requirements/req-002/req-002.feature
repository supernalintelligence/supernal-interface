Feature: Extracted Tool Commands Interface
  As a developer or AI system
  I want to discover and execute @Tool methods programmatically
  So that I can control the application without manual UI interaction

  Background:
    Given the demo application is loaded
    And the @Tool decorator registry is populated
    And the extracted tools section is visible

  Scenario: Display all available tools
    Given the system has registered @Tool methods
    When I view the extracted tools section
    Then I see a list of all available @Tool methods
    And each tool shows its name, description, and danger level
    And tools are categorized by their provider class
    And AI-enabled vs test-only tools are clearly distinguished

  Scenario: Execute safe tool command
    Given I see a tool labeled "Open Main Menu" with danger level "safe"
    When I click the "Execute Tool" button
    Then the openMainMenu() @Tool method executes immediately
    And I see the same result as if I clicked the UI widget directly
    And the execution result is displayed in the interface
    And no approval dialog is shown

  Scenario: Execute dangerous tool command with approval
    Given I see a tool labeled "Delete Demo Data" with danger level "destructive"
    When I click the "Execute Tool" button
    Then an approval dialog appears with warning text
    And the dialog shows the tool name and danger level
    When I click "Approve" in the dialog
    Then the deleteDemoData() @Tool method executes
    And I see confirmation of the destructive action
    And the UI state reflects the data deletion

  Scenario: View tool metadata and examples
    Given I see a tool in the extracted tools list
    When I hover over or expand the tool details
    Then I see the tool's description, examples, and parameters
    And I see the testId and element type information
    And I see whether the tool is AI-enabled or test-only
    And I see the tool's category and provider class

  Scenario: Filter tools by category
    Given the extracted tools section contains multiple tool categories
    When I select a filter for "Navigation" tools
    Then only navigation-related tools are displayed
    And the count of visible tools updates accordingly
    And I can clear the filter to see all tools again

  Scenario: Search tools by name or description
    Given the extracted tools section is loaded
    When I type "menu" in the search box
    Then only tools with "menu" in their name or description are shown
    And matching text is highlighted in the results
    And the search is case-insensitive
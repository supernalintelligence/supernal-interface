Feature: Natural Language Chat Interface for Tool Execution
  As a user or AI system
  I want to control the application using natural language commands
  So that I can interact with tools conversationally without technical knowledge

  Background:
    Given the demo application is loaded
    And the chat interface is visible
    And @Tool methods are registered with natural language examples
    And the AI command processing system is active

  Scenario: Execute simple command with exact match
    Given I see the chat input field
    When I type "open menu" and press Enter
    Then the system finds the openMainMenu() @Tool method
    And the method executes immediately
    And I see feedback "✅ Main menu opened successfully"
    And the UI shows the same result as clicking the menu button directly

  Scenario: Execute command with fuzzy matching
    Given I see the chat input field
    When I type "show navigation" 
    Then the system matches this to the openMainMenu() @Tool method
    And displays "🎯 Tool Match: Open Main Menu (85% confidence)"
    When I confirm or the system auto-executes
    Then the menu opens with the same result as direct interaction

  Scenario: Handle dangerous command with approval
    Given I see the chat input field
    When I type "delete all data"
    Then the system matches this to deleteDemoData() @Tool method
    And displays "⚠️ 'Delete Demo Data' requires approval. This is a destructive action."
    And shows approval buttons "Approve" and "Deny"
    When I click "Approve"
    Then the destructive action executes
    And I see confirmation "🗑️ All demo data deleted (DESTRUCTIVE action completed)"

  Scenario: Handle ambiguous command
    Given I see the chat input field
    When I type "send message"
    And multiple @Tool methods match this input
    Then the system shows "Multiple tools found: Send Chat Message, Send Email, Send Notification"
    And provides clickable options for each match
    When I click "Send Chat Message"
    Then that specific @Tool method executes

  Scenario: Handle unknown command
    Given I see the chat input field
    When I type "make coffee"
    Then the system responds "❓ I don't understand 'make coffee'"
    And suggests "Try commands like: 'open menu', 'send message', 'clear chat'"
    And displays available command examples from registered @Tool methods

  Scenario: Show command execution details
    Given I execute any command through the chat interface
    Then I see the command I typed displayed as a user message
    And I see the AI response with execution results
    And I see system messages showing tool execution details
    And I see the same state changes as direct UI interaction
    And the chat history preserves the conversation

  Scenario: Handle command with parameters
    Given I see the chat input field
    When I type "send message hello world"
    Then the system extracts "hello world" as the message parameter
    And executes sendChatMessage("hello world")
    And I see "hello world" appear in the chat interface
    And the execution matches direct UI widget interaction

  Scenario: Provide help and command discovery
    Given I see the chat input field
    When I type "help" or "what can you do"
    Then the system lists all available commands with examples
    And groups commands by category (Navigation, Chat, Demo Controls, etc.)
    And shows which commands are AI-enabled vs test-only
    And indicates which commands require approval
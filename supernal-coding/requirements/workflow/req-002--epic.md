---
id: REQ-002
title: Extracted Tool Commands Interface
epic: Supernal Interface Demo System
category: ui
hierarchyLevel: url-chat
priority: High
status: Draft
dependencies: [REQ-001]
assignee: ""
version: 1.0.0
tags: [core, mvp, tool-discovery]
created: 2025-01-25
updated: 2025-01-25
reviewedBy: ""
approvedBy: ""
---

# Requirement: Extracted Tool Commands Interface

## Description
Create a dedicated section that displays all @Tool decorated methods extracted from the decorator registry. Each tool should be presented as a clickable command that executes the underlying @Tool method AS IF the user directly interacted with the corresponding UI widget. This provides a programmatic interface to all available tools.

## User Story
As a developer or AI system, I want to see all available @Tool methods in a discoverable interface where I can click on any tool to execute it directly, so that I can programmatically control the application without needing to find and interact with individual UI widgets.

## Acceptance Criteria

```gherkin
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
```

## Technical Context

### Hierarchy Context
- **Supernal Level**: url-chat (demo interface level)
- **Scope**: @Tool registry, tool discovery, programmatic execution, metadata display
- **Data Flow**: Registry scan → Tool list generation → User selection → Tool execution → Result display

### Related Components
- **Frontend**: Tool discovery component, execution interface, result display
- **Backend**: ToolRegistry, @Tool decorated methods, execution engine
- **Storage**: Tool metadata cache, execution history
- **Integration**: @supernal-interface/core registry system

## Non-Functional Requirements
- **Performance**: Tool list must load within 200ms, execution within 100ms
- **Scalability**: Support 100+ registered tools without UI lag
- **Security**: Dangerous tools must require explicit approval
- **Usability**: Tools must be easily discoverable and searchable

## Implementation Notes
- **Key Implementation Points**:
  - Scan ToolRegistry for all registered @Tool methods
  - Display tools with full metadata (name, description, danger level, examples)
  - Provide direct execution without UI widget interaction
  - Handle approval flow for dangerous operations
  - Show execution results and error states
- **Constraints**:
  - Must work with existing @Tool decorator system
  - Must respect tool safety settings (aiEnabled, requiresApproval)
  - Must provide same results as direct UI widget interaction
- **Assumptions**:
  - ToolRegistry contains accurate metadata for all tools
  - Tool execution results are consistent and predictable
  - Users understand the difference between safe and dangerous operations

## Testing Strategy
- **Unit Tests**: Tool discovery logic, metadata extraction, execution handlers
- **Integration Tests**: Registry integration, tool execution flow, approval process
- **E2E Tests**: Complete tool discovery and execution workflows
- **Performance Tests**: Large tool set loading, concurrent executions

## Definition of Done
- [ ] All registered @Tool methods are discoverable in the interface
- [ ] Each tool can be executed with same results as UI widget interaction
- [ ] Dangerous tools require approval before execution
- [ ] Tool metadata is accurately displayed (name, description, examples, etc.)
- [ ] Search and filtering functionality works correctly
- [ ] Execution results are clearly displayed
- [ ] All acceptance criteria pass
- [ ] Tests are implemented and passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance requirements met

## Traceability
- **Test File**: `src/tests/playwright/ui/REQ-002-extracted-tool-commands.spec.js`
- **Implementation**: `packages/@supernal-interface/core/demo/src/components/ExtractedToolsInterface.tsx`
- **Git Branch**: `feature/REQ-002-extracted-tool-commands`
- **Related Issues**: [Links to GitHub issues]

## Changelog
- **v1.0.0** (2025-01-25): Initial requirement creation

---

## 📋 **Requirements vs Specifications Guide**

### **Requirements (This Document)**
- **WHAT** needs to be built: Discoverable interface for all @Tool methods with direct execution
- **WHY** it's needed: Enable programmatic control and tool discovery for developers and AI
- **WHO** will use it: Developers, AI systems, automated testing tools
- **WHEN** it's needed: Core MVP functionality for tool system demonstration

### **Specifications (Technical Design)**
- **HOW** it will be built: React component scanning ToolRegistry with execution interface
- **WHERE** components will be located: demo/src/components/ExtractedToolsInterface.tsx
- **WHICH** technologies will be used: React, TypeScript, ToolRegistry API
- Detailed **technical architecture**: Registry scanning, metadata display, execution flow
- **API contracts** and **data schemas**: ToolMetadata interface, execution response format

### **Relationship**
- Requirements → drive → Technical Specifications
- Specifications → implement → Requirements
- Tests → validate → Both Requirements and Specifications

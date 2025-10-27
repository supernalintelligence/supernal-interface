---
id: REQ-XXX
title: Brief descriptive title
epic: High-level feature group this belongs to
category: chat  # chat, context, persistence, core, ui, llm-interaction, debug
hierarchyLevel: url-chat  # platform, organization, project, workspace, window, tab-group, url-chat, message, context
priority: High  # High, Medium, Low
status: Draft  # Draft, Review, Approved, Implemented, Deprecated
dependencies: []  # List of other REQ-XXX IDs this depends on
assignee: ""  # Person responsible for this requirement
version: 1.0.0  # Semantic version for tracking changes
tags: []  # Tags for filtering: [core, mvp, enhancement, bug-fix, performance]
created: 2025-01-19
updated: 2025-01-19
reviewedBy: ""  # Person who reviewed this requirement
approvedBy: ""  # Person who approved this requirement
---

# Requirement: [Title]

## Description
Brief description of what this requirement addresses.

## User Story
As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria

```gherkin
Feature: [Feature name]
  As a [user type]
  I want [goal]
  So that [benefit]

  Background:
    Given [common setup steps]

  Scenario: [Specific scenario name]
    Given [precondition]
    When [action]
    Then [expected result]
    
  Scenario: [Another scenario name]
    Given [precondition]
    When [action]
    Then [expected result]
```

## Technical Context

### Hierarchy Context
- **Supernal Level**: [Which level of the hierarchy this requirement affects]
- **Scope**: [What components/systems are involved]
- **Data Flow**: [How data moves through the hierarchy for this requirement]

### Related Components
- **Frontend**: [Components involved]
- **Backend**: [Services/managers involved]
- **Storage**: [Data persistence requirements]
- **Integration**: [External systems/APIs]

## Non-Functional Requirements
- **Performance**: [Speed/load requirements]
- **Scalability**: [Volume/growth requirements]
- **Security**: [Security considerations]
- **Usability**: [User experience requirements]

## Implementation Notes
- **Key Implementation Points**: [Critical technical details]
- **Constraints**: [Technical limitations or restrictions]
- **Assumptions**: [What we're assuming to be true]

## Testing Strategy
- **Unit Tests**: [Components that need unit testing]
- **Integration Tests**: [Cross-component testing needs]
- **E2E Tests**: [End-to-end scenarios to test]
- **Performance Tests**: [Performance testing requirements]

## Definition of Done
- [ ] All acceptance criteria pass
- [ ] Tests are implemented and passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance requirements met

## Traceability
- **Test File**: `src/tests/playwright/[category]/[id]-[title-kebab-case].spec.js`
- **Implementation**: [Path to implementing code]
- **Git Branch**: `feature/[id]-[title-kebab-case]`
- **Related Issues**: [Links to GitHub issues]

## Changelog
- **v1.0.0** (2025-01-19): Initial requirement creation

---

## 📋 **Requirements vs Specifications Guide**

### **Requirements (This Document)**
- **WHAT** needs to be built
- **WHY** it's needed (business value)
- **WHO** will use it
- **WHEN** it's needed
- Focus on **business outcomes** and **user needs**

### **Specifications (Technical Design)**
- **HOW** it will be built
- **WHERE** components will be located
- **WHICH** technologies will be used
- Detailed **technical architecture**
- **API contracts** and **data schemas**

### **Relationship**
- Requirements → drive → Technical Specifications
- Specifications → implement → Requirements
- Tests → validate → Both Requirements and Specifications

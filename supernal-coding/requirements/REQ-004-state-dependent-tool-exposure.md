---
id: REQ-004
title: State-Dependent Tool Exposure Detection
epic: Supernal Interface Demo System
category: core
hierarchyLevel: core-infrastructure
priority: High
status: Draft
dependencies: []
assignee: ""
version: 1.0.0
tags: [core, infrastructure, exposure, state-management]
created: 2025-10-27
updated: 2025-10-27
reviewedBy: ""
approvedBy: ""
---

# Requirement: State-Dependent Tool Exposure Detection

## Description
Implement an event-driven system where tools self-report their exposure and interactability state in real-time. Tools emit state changes (NOT_PRESENT → PRESENT → VISIBLE → EXPOSED → INTERACTABLE) to a central collector, enabling AI agents, tutorial systems, and test runners to know exactly when tools are available for interaction without guesswork or complex detection logic.

## User Story
As an **AI agent, test runner, or tutorial system**, I want tools to automatically report their current exposure state, so that I can intelligently wait for tools to become available, avoid errors when tools aren't ready, and provide accurate user guidance without complex DOM analysis.

## Acceptance Criteria

```gherkin
Feature: State-Dependent Tool Exposure Detection
  As a system consuming tool state information
  I want tools to self-report their exposure state in real-time
  So that I can make intelligent decisions about when to interact with tools

  Background:
    Given the exposure detection system is initialized
    And the ExposureCollector is running
    And tools are wrapped with ExposureAwareTool

  Scenario: Tool reports NOT_PRESENT state
    Given a tool with toolId "submit-button"
    And the tool's DOM element does not exist
    When the tool wrapper checks its state
    Then the tool emits state NOT_PRESENT (0)
    And the ExposureCollector records this state
    And consumers are notified of the NOT_PRESENT state

  Scenario: Tool transitions from NOT_PRESENT to PRESENT
    Given a tool with toolId "submit-button" in NOT_PRESENT state
    When the tool's DOM element is added to the page
    Then the tool detects the element exists
    And the tool emits state PRESENT (1)
    And the ExposureCollector updates the state
    And subscribers receive the state change notification

  Scenario: Tool transitions to VISIBLE state
    Given a tool with toolId "submit-button" in PRESENT state
    When the IntersectionObserver detects the element has dimensions
    And the element is not hidden by CSS
    Then the tool emits state VISIBLE (2)
    And the state includes position metadata (DOMRect)
    And the confidence level is set to 0.95

  Scenario: Tool transitions to EXPOSED state
    Given a tool with toolId "submit-button" in VISIBLE state
    When the element is visible on screen
    And the element has no overlays blocking it
    But the element is marked as loading or busy
    Then the tool emits state EXPOSED (3)
    And the metadata includes reason "Element exposed but loading"

  Scenario: Tool transitions to INTERACTABLE state
    Given a tool with toolId "submit-button" in EXPOSED state
    When the element is no longer disabled
    And the element is not marked as busy
    And the element is fully visible to the user
    Then the tool emits state INTERACTABLE (4)
    And the metadata confirms full availability
    And consumers can safely execute the tool

  Scenario: Tool detects disabled state and downgrades
    Given a tool with toolId "submit-button" in INTERACTABLE state
    When the element receives the "disabled" attribute
    Then the MutationObserver detects the change
    And the tool emits state VISIBLE (2)
    And the metadata includes reason "Element visible but disabled"
    And the metadata includes blockers ["disabled"]

  Scenario: AI agent waits for tool to become interactable
    Given an AI agent wants to execute tool "submit-button"
    And the tool is currently in VISIBLE state
    When the AI agent calls waitForState(toolId, INTERACTABLE, 5000)
    And the tool transitions to INTERACTABLE within 2 seconds
    Then the waitForState promise resolves with true
    And the AI agent can safely execute the tool

  Scenario: Navigate-to command waits for navigation button
    Given a user says "navigate to docs"
    And the AI matches this to tool "navigate-to-docs"
    And the navigate-to-docs button is currently loading (EXPOSED state)
    When the AI checks ExposureCollector for tool state
    Then the AI sees state EXPOSED with reason "Element loading"
    When the AI waits for state INTERACTABLE
    And the button finishes loading and becomes INTERACTABLE
    Then the AI executes the navigateToDocs() method
    And the navigation succeeds

  Scenario: AI agent times out waiting for tool
    Given an AI agent wants to execute tool "submit-button"
    And the tool is currently in NOT_PRESENT state
    When the AI agent calls waitForState(toolId, INTERACTABLE, 3000)
    And 3 seconds pass without the tool becoming INTERACTABLE
    Then the waitForState promise resolves with false
    And the AI agent receives a timeout error
    And no tool execution is attempted

  Scenario: Tutorial system highlights available tool
    Given a tutorial system is guiding a user
    And the current tutorial step requires tool "open-menu"
    When the tutorial system queries ExposureCollector for the tool state
    And the tool state is INTERACTABLE
    Then the tutorial system retrieves the tool's position from metadata
    And displays a spotlight at the tool's location
    And waits for user interaction with the tool

  Scenario: Test runner validates tool state before testing
    Given a Playwright test scenario
    And the test needs to interact with tool "login-button"
    When the test runner checks the tool state via ExposureCollector
    And the tool state is less than INTERACTABLE
    Then the test fails with a clear error message
    And the error includes the current state name
    And the error includes the reason from metadata

  Scenario: Existing navigation tools report their state
    Given the NavigationProvider has @Tool methods with toolIds
    And "navigate-to-docs" button exists in the Header component
    When the page loads and the ExposureAwareTool wraps the button
    Then the tool emits state transitions automatically
    And "navigate-to-docs" reaches INTERACTABLE state
    And AI can execute "go to docs" command successfully
    And the existing executeToolMethod() logic works unchanged

  Scenario: Multiple tools report states independently
    Given three tools: "button-1", "button-2", "button-3"
    And button-1 is in INTERACTABLE state
    And button-2 is in VISIBLE state
    And button-3 is in NOT_PRESENT state
    When a consumer calls getInteractableTools()
    Then only "button-1" is returned
    When a consumer calls getToolsByState(VISIBLE)
    Then only "button-2" is returned

  Scenario: Subscriber receives specific tool state changes
    Given a subscriber registered for tool "submit-button"
    And the tool is currently in VISIBLE state
    When the tool transitions to INTERACTABLE state
    Then the subscriber callback is invoked
    And the callback receives the new state event
    And the callback receives the previous state for comparison
    And the timestamp shows the time of change

  Scenario: Global subscriber receives all tool state changes
    Given a subscriber registered for all tools (toolId = '*')
    When any tool in the system changes state
    Then the subscriber callback is invoked with the state event
    And the subscriber can track overall system state
    And the subscriber can generate health reports
```

## Technical Context

### Hierarchy Context
- **Supernal Level**: core-infrastructure (foundational capability)
- **Scope**: Tool state management, event emission, state registry, subscriber notifications
- **Data Flow**: Tool observes DOM → Calculates state → Emits event → ExposureCollector updates registry → Notifies subscribers

### Related Components
- **Frontend**: ExposureAwareTool (wrapper), IntersectionObserver, MutationObserver
- **Core**: ExposureCollector (singleton registry), EventBus, ToolStateEvent
- **Consumers**: AI agents, tutorial system, test runners, @Tool decorator
- **Integration**: Auto-wraps all @Tool decorated methods on mount

### State Hierarchy

```typescript
enum ExposureState {
  NOT_PRESENT = 0,    // Element doesn't exist in DOM
  PRESENT = 1,        // Element exists but may not be visible
  VISIBLE = 2,        // Element has dimensions and is not hidden
  EXPOSED = 3,        // Element is visible to user (no overlays)
  INTERACTABLE = 4,   // Element can be clicked/used right now
  ACCESSIBLE = 5      // Element meets accessibility requirements
}
```

### Key Interfaces

```typescript
interface ToolStateEvent {
  toolId: string;
  state: ExposureState;
  timestamp: number;
  metadata?: {
    reason?: string;           // Human-readable state explanation
    blockers?: string[];       // What's blocking higher states
    position?: DOMRect;        // Element position for highlighting
    confidence?: number;       // 0-1 confidence in state accuracy
  };
}

interface ExposureCollector {
  handleStateChange(event: ToolStateEvent): void;
  getToolState(toolId: string): ToolStateEvent | null;
  getToolsByState(state: ExposureState): ToolStateEvent[];
  getInteractableTools(): ToolStateEvent[];
  subscribe(callback: StateChangeCallback, toolId?: string): void;
  waitForState(toolId: string, targetState: ExposureState, timeout?: number): Promise<boolean>;
}
```

### Tool ID Duplication Detection

To prevent registration conflicts and maintain data integrity:

```typescript
// In Tool decorator or ToolRegistry
class ToolRegistry {
  private static registeredToolIds = new Set<string>();
  
  static registerTool(config: ToolConfig, target: any, propertyKey: string): void {
    const toolId = config.toolId || config.testId || propertyKey;
    
    // CRITICAL: Detect duplicate toolIds at registration time
    if (this.registeredToolIds.has(toolId)) {
      throw new Error(
        `❌ Duplicate toolId "${toolId}" detected!\n` +
        `Tool IDs must be unique across the entire application.\n` +
        `Found in: ${target.constructor.name}.${propertyKey}\n` +
        `This tool ID is already registered by another @Tool method.`
      );
    }
    
    this.registeredToolIds.add(toolId);
    
    // Legacy testId deprecation warning
    if (config.testId && !config.toolId) {
      console.warn(
        `⚠️  DEPRECATED: "testId" in @Tool decorator is deprecated.\n` +
        `   Location: ${target.constructor.name}.${propertyKey}\n` +
        `   Current:  @Tool({ testId: '${config.testId}' })\n` +
        `   Replace:  @Tool({ toolId: '${config.testId}' })\n` +
        `   Auto-migrated for now, but please update your code.`
      );
      config.toolId = config.testId; // Auto-migrate
    }
    
    // Continue with registration...
  }
  
  // Build-time validation script
  static validateAllToolIds(): { duplicates: string[], deprecated: string[] } {
    const duplicates: string[] = [];
    const deprecated: string[] = [];
    const seenIds = new Map<string, string>();
    
    for (const [key, tool] of this.getAllTools()) {
      if (seenIds.has(tool.toolId)) {
        duplicates.push(`${tool.toolId} (${seenIds.get(tool.toolId)} vs ${key})`);
      } else {
        seenIds.set(tool.toolId, key);
      }
      
      if (tool.testId && !tool.toolId) {
        deprecated.push(`${key} uses testId instead of toolId`);
      }
    }
    
    return { duplicates, deprecated };
  }
}
```

**Acceptance Criteria for Duplication Detection**:
```gherkin
Scenario: Detect duplicate toolId at registration
  Given a tool is already registered with toolId "submit-button"
  When another @Tool decorator attempts to register with the same toolId
  Then registration fails with a clear error message
  And the error identifies both conflicting locations
  And the application refuses to start

Scenario: Auto-generate tool ID constants for tests
  Given all @Tool decorators are registered
  When the build script runs "extract-tool-ids"
  Then a generated-tool-ids.ts file is created
  And it exports a const object with all toolIds
  And it exports a TypeScript type for all valid tool IDs
  And tests can import these constants instead of hardcoding strings
```

```

## Non-Functional Requirements
- **Performance**: State calculation < 10ms, emission < 5ms, subscriber notification < 2ms
- **Reliability**: 99.9% accuracy in state detection, < 0.1% false positives
- **Scalability**: Support 1000+ tools with < 50ms total processing time
- **Memory**: < 100KB memory overhead for entire system
- **Real-time**: State changes detected within 16ms (one animation frame)

## Implementation Notes

### Backward Compatibility with Existing Demo

**Current Working Implementation**:
- `NavigationProvider`, `ChatProvider`, `DemoProvider`, `AdminProvider` with @Tool methods ✅
- `UIControls` with widget @Tool methods ✅  
- `DemoAIInterface` executing tools via `executeToolMethod()` ✅
- `InteractiveWidgets` component with working UI elements ✅
- Existing toolIds: `open-main-menu`, `navigate-to-docs`, `send-message`, etc. ✅

**REQ-004 Integration Strategy** (Non-Breaking):

1. **Phase 1: Silent Addition** (Week 1)
   - Add ExposureAwareTool wrapper class
   - Add ExposureCollector singleton (no consumers yet)
   - Auto-wrap existing toolIds on component mount
   - State events emit but nothing consumes them
   - **Zero impact on existing functionality**

2. **Phase 2: Enhanced AI** (Week 2)
   - Modify `DemoAIInterface.executeCommand()` to check state first
   - Add `waitForState()` before tool execution
   - Provide better error messages when tools aren't ready
   - **Existing commands still work, just smarter**

3. **Phase 3: Tutorial/Testing** (Week 3)
   - Tutorial system uses state for highlighting
   - Test runners validate state before asserting
   - **New capabilities enabled**

**No Changes Needed To**:
- `@Tool` decorator usage in providers ✅
- `executeToolMethod()` switch statement logic ✅
- Existing UI components ✅
- Tool registration in ToolRegistry ✅

**Integration Points**:
```typescript
// In DemoAIInterface.executeCommand() - ADD THIS:
async executeCommand(command: AICommand): Promise<AIResponse> {
  // NEW: Check if tool is ready before executing
  const collector = ExposureCollector.getInstance();
  const toolState = collector.getToolState(command.tool.toolId);
  
  if (toolState && toolState.state < ExposureState.INTERACTABLE) {
    // Wait for tool to be ready (with timeout)
    const ready = await collector.waitForState(
      command.tool.toolId, 
      ExposureState.INTERACTABLE, 
      5000
    );
    
    if (!ready) {
      return {
        success: false,
        message: `Tool "${command.tool.name}" is not ready. Current state: ${ExposureState[toolState.state]}`,
        error: toolState.metadata?.reason
      };
    }
  }
  
  // EXISTING: Execute tool method (unchanged)
  return await this.executeToolMethod(command.tool, parameters);
}
```

### Key Implementation Points

1. **ExposureAwareTool Wrapper**
   - Wraps each @Tool decorated method's DOM element
   - Uses IntersectionObserver for visibility detection
   - Uses MutationObserver for attribute changes
   - Calculates state based on element properties
   - Emits state changes to ExposureCollector

2. **ExposureCollector Singleton**
   - Central registry of all tool states
   - Event bus for pub/sub notifications
   - Subscriber management (tool-specific and global)
   - Query methods (by state, by tool, all interactable)
   - Async wait methods with timeout

3. **Auto-Wrapping in @Tool Decorator**
   - Automatically wraps elements when component mounts
   - Uses data-testid for element lookup
   - No changes needed to existing tool methods
   - Zero developer overhead

4. **State Calculation Logic**
   ```typescript
   calculateState(entry: IntersectionObserverEntry): ExposureState {
     if (!element.isConnected) return NOT_PRESENT;
     if (entry.intersectionRatio === 0) return PRESENT;
     if (element.disabled || element.getAttribute('aria-disabled') === 'true') 
       return VISIBLE;
     if (element.getAttribute('aria-busy') === 'true') 
       return EXPOSED;
     return INTERACTABLE;
   }
   ```

### Constraints
- Must work with existing @Tool decorator system
- No changes to tool method implementations
- Zero performance impact when no subscribers
- Browser-compatible (Chrome, Firefox, Safari, Edge)

### Dependencies
- IntersectionObserver API (built-in browser API)
- MutationObserver API (built-in browser API)
- @Tool decorator system
- DOM element data-tool-id attributes

## Test Strategy

### Unit Tests
- ExposureAwareTool state calculation logic
- ExposureCollector registry operations
- Subscriber notification system
- State transition validation

### Integration Tests
- Tool wrapper auto-initialization
- End-to-end state change flow
- Multiple tools interacting
- Subscriber patterns (specific, global, filtered)

### E2E Tests
- AI agent using waitForState in real scenarios
- Tutorial system highlighting based on state
- Test runner validating states before execution
- Cross-browser state detection accuracy

### Performance Tests
- 1000 tools reporting states simultaneously
- Memory usage over 1 hour with state changes
- State calculation timing benchmarks
- Subscriber notification timing

## Related Requirements
- **REQ-001**: UI widgets will auto-report their state when interacted with
- **REQ-002**: Tool discovery interface can show real-time tool availability
- **REQ-003**: Chat interface can wait for tools before suggesting them
- **REQ-005**: Context-aware navigation uses REQ-004 to wait for navigation buttons and confirm tool availability

## Related Documentation

- **[Architecture: REQ-004/005 Improvements](../architecture/REQ-004-005-IMPROVEMENTS.md)** - Summary of toolId migration, duplication detection, and auto-context detection
- **[Architecture: User Command to Execution Flow](../architecture/USER-COMMAND-TO-EXECUTION-FLOW.md)** - Shows how REQ-004 state detection integrates with REQ-005 navigation
- **[Architecture: Demo Enhancement Plan](../architecture/DEMO-ENHANCEMENT-PLAN.md)** - Plan for demo improvements to showcase state transitions

## Benefits Over Complex Detection
1. **Tools know themselves best** - Self-reporting is more accurate than external analysis
2. **Real-time updates** - No polling, instant state changes
3. **High performance** - Simple observers vs expensive DOM queries
4. **Framework agnostic** - Works with React, Vue, Angular, vanilla JS
5. **Easy testing** - Mock state events for comprehensive test coverage
6. **Minimal code** - ~200 lines vs thousands for complex detection
7. **Developer friendly** - Zero changes to tool methods, automatic wrapping

## Notes

This is foundational infrastructure that enables advanced features:
- Smart AI agents that don't try to interact with unavailable tools
- Tutorial systems that guide users to available actions
- Test runners that validate state before asserting
- Accessibility systems that track element readiness

The event-driven approach is much simpler and more reliable than trying to externally detect tool states through complex DOM analysis.

---
*Implementation priority: HIGH - Required foundation for intelligent tool interaction*


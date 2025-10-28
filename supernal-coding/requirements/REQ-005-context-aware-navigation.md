---
id: REQ-005
title: Context-Aware Tool Discovery and Navigation Paths
epic: Supernal Interface Demo System
category: navigation
hierarchyLevel: core-infrastructure
priority: High
status: Draft
dependencies: [REQ-004]
assignee: ""
version: 1.0.0
tags: [core, infrastructure, navigation, path-finding, context]
created: 2025-10-27
updated: 2025-10-27
reviewedBy: ""
approvedBy: ""
---

# Requirement: Context-Aware Tool Discovery and Navigation Paths

## Description
Enable AI agents and automation systems to discover WHERE tools are available (which page, tab, route, or application state) and automatically compute and execute navigation paths to reach those contexts. This solves the "tool exists but I'm not there" problem by maintaining a navigation graph and providing path-finding capabilities.

## User Story
As an **AI agent**, when I want to execute a tool that exists on a different page/tab/route, I want the system to automatically navigate me to that location first, so that I can execute any tool in the system regardless of current context.

## The Problem

### Current Limitation
```
User: "show the widget examples"
AI: Finds tool "show-widget-examples" 
AI: Tries to execute
❌ FAILS: Tool not present (we're on wrong tab)
```

### What We Need
```
User: "show the widget examples"
AI: Finds tool "show-widget-examples"
AI: Discovers tool is on "Interactive Demo" tab
AI: Navigates: home → Interactive Demo tab
AI: Waits for tool to be INTERACTABLE (REQ-004)
AI: Executes tool
✅ SUCCESS
```

## Acceptance Criteria

```gherkin
Feature: Context-Aware Tool Discovery and Navigation Paths
  As an AI agent or automation system
  I want to automatically navigate to where tools are available
  So that I can execute any tool regardless of current page/tab/route

  Background:
    Given the ToolRegistry contains tools from multiple contexts
    And NavigationGraph is initialized with page/tab relationships
    And current location is tracked

  Scenario: Tool available on current page
    Given I am on the "Interactive Demo" tab
    And tool "open-main-menu" is registered with context "interactive-demo"
    When I query "where is open-main-menu available"
    Then the system reports context "interactive-demo"
    And the system reports "already at correct location"
    And no navigation is needed

  Scenario: Tool available on different tab (simple navigation)
    Given I am on the "Home" page
    And tool "show-widget-examples" is registered with context "interactive-demo"
    When I query "where is show-widget-examples available"
    Then the system reports context "interactive-demo"
    And the system computes path: ["click-interactive-demo-tab"]
    And the system reports "navigation required: 1 step"

  Scenario: AI executes tool on different tab with auto-navigation
    Given I am on the "Home" page
    And tool "toggle-feature" is registered with context "interactive-demo"
    When AI receives command "enable the feature"
    Then AI matches to tool "toggle-feature"
    And AI discovers tool requires context "interactive-demo"
    And AI computes navigation path: ["click-interactive-demo-tab"]
    And AI executes navigation step 1: click interactive-demo tab
    And AI waits for context change confirmation
    And AI waits for tool to be INTERACTABLE (REQ-004)
    And AI executes "toggle-feature"
    And command succeeds

  Scenario: Multi-step navigation path
    Given I am on "Available Tools" tab
    And I need to reach a tool on "Auto-Testing" sub-panel
    When I query navigation path to "auto-testing-subpanel"
    Then the system computes path: ["click-auto-testing-tab", "open-advanced-panel"]
    And the path has 2 steps
    And each step has navigation tool and expected context

  Scenario: Tool not available in any context
    Given no page/tab contains tool "delete-universe"
    When AI receives command "delete the universe"
    Then AI searches ToolRegistry
    And AI finds no matching tool
    And AI reports "Tool not found in any context"
    And no navigation is attempted

  Scenario: Tool available in multiple contexts
    Given tool "search" is available on both "Home" and "Dashboard"
    And I am on "Home" page
    When I query "where is search available"
    Then the system reports multiple contexts: ["home", "dashboard"]
    And the system selects closest context "home"
    And the system reports "already at one available location"

  Scenario: Navigation path blocked by authentication
    Given tool "admin-panel" requires context "admin-dashboard"
    And "admin-dashboard" requires authentication
    And user is not authenticated
    When AI tries to navigate to "admin-dashboard"
    Then the system detects authentication requirement
    And the system reports "Navigation blocked: authentication required"
    And the system suggests authentication tools

  Scenario: Circular navigation detection
    Given page A has button to go to page B
    And page B has button to go to page A
    And neither page has the target tool
    When I query navigation path to "nonexistent-tool"
    Then the system detects no valid path
    And the system reports "Tool not reachable from current location"
    And no circular navigation is attempted

  Scenario: Context registration at tool decoration time
    Given a component defines a @Tool method
    And the tool is decorated with contextPath: "/dashboard/settings"
    When the @Tool decorator executes
    Then the tool is registered with context metadata
    And NavigationGraph records the context location
    And the tool-to-context mapping is established

  Scenario: Dynamic context discovery from DOM
    Given the page has loaded
    And multiple tabs/sections exist
    When the ContextScanner runs
    Then it discovers all navigation buttons with data-testid="nav-*"
    And it discovers all tool elements with data-testid attributes
    And it maps tools to their containing sections
    And it builds the navigation graph

  Scenario: Real-time navigation graph updates
    Given a new tab is added to the page
    And the tab contains new tools
    When the tab mounts
    Then new tools register with their context
    And NavigationGraph adds new nodes
    And path-finding algorithms update
    And AI can immediately navigate to new tools

  Scenario: Cost-based path selection
    Given multiple paths exist to reach a tool
    And Path A: 1 step but requires authentication
    And Path B: 3 steps but no authentication
    When I query optimal path
    Then the system calculates cost for each path
    And the system considers: step count, auth requirements, load time
    And the system selects lowest-cost path
    And the system explains path selection

  Scenario: Navigation state persistence
    Given I navigate from Home → Demo → Settings
    And I execute a tool
    When the tool execution completes
    Then the system remembers navigation history
    And the system can return to previous context
    And breadcrumb trail is available

  Scenario: Failed navigation recovery
    Given I am navigating to "Dashboard" tab
    And the navigation button fails to load (404)
    When the navigation step fails
    Then the system detects navigation failure
    And the system tries alternative path if available
    Or the system reports "Cannot reach target context"
    And the system prevents tool execution in wrong context

  Scenario: Existing demo tabs integration
    Given the demo has tabs: Home, Interactive Demo, Available Tools, Auto-Testing
    And navigation is via tab buttons: data-testid="tab-interactive-demo"
    When NavigationGraph initializes
    Then it maps current demo structure:
      - Home: [general navigation tools]
      - Interactive Demo: [widget tools, menu tools]
      - Available Tools: [tool visualization, discovery tools]
      - Auto-Testing: [test execution tools]
    And AI can navigate between tabs automatically

  Scenario: Path execution with waiting
    Given I need to navigate: Home → Dashboard → Settings
    And each navigation step takes 0.5 seconds to load
    When I execute the navigation path
    Then Step 1: Click dashboard button, wait for context="dashboard"
    And Step 2: Click settings button, wait for context="settings"  
    And Each step uses REQ-004 to wait for navigation button to be INTERACTABLE
    And Each step confirms context change before proceeding
    And Total time respects loading delays
```

## Technical Context

### Hierarchy Context
- **Supernal Level**: core-infrastructure (foundational navigation capability)
- **Scope**: Navigation graph, path-finding, context mapping, tool-to-location binding
- **Data Flow**: Tool query → Context lookup → Path computation → Navigation execution → Context validation

### Navigation Graph Structure

```typescript
interface NavigationNode {
  id: string;                    // "home", "interactive-demo", "dashboard"
  displayName: string;           // "Home", "Interactive Demo"  
  tools: Set<string>;            // Tool toolIds available in this context
  navigationButtons: NavigationEdge[];  // How to reach other nodes
  requirements?: {
    authentication?: boolean;
    permissions?: string[];
  };
}

interface NavigationEdge {
  targetNodeId: string;          // Where this button goes
  navigationTool: string;        // toolId of button to click
  estimatedTime: number;         // ms to complete navigation
  cost: number;                  // For path optimization
}

interface NavigationGraph {
  nodes: Map<string, NavigationNode>;
  currentContext: string;
  
  // Core operations
  getToolContext(toolId: string): string[];
  computePath(from: string, to: string): NavigationPath | null;
  executeNavigation(path: NavigationPath): Promise<boolean>;
}

interface NavigationPath {
  steps: Array<{
    fromContext: string;
    toContext: string;
    navigationTool: string;      // Button to click
    estimatedTime: number;
  }>;
  totalCost: number;
  requiresAuth: boolean;
}
```

### Context Discovery (Auto-Detection)

**No Manual Configuration Required** - the system automatically discovers tool locations using three complementary strategies:

#### Strategy 1: Convention-Based (File Path = Context Path)
```typescript
// File structure defines context automatically
// src/pages/authenticated/dashboard/settings/ProfileTab.tsx

@Tool({ toolId: 'edit-profile' })
async editProfile() { }

// Context is auto-inferred: authenticated > dashboard > settings
// No manual contextPath needed!
```

**How it works**:
- AST analysis at build time extracts file paths of all `@Tool` decorators
- File path segments become context hierarchy
- Follows existing pattern: we already infer paths from structure

#### Strategy 2: React Component Tree Detection (Runtime)
```typescript
// NavigationContext tracks current location
const NavigationContext = React.createContext<string[]>([]);

// Wrap your pages/components
<NavigationContext.Provider value={['authenticated', 'dashboard']}>
  <Dashboard>
    <NavigationContext.Provider value={['authenticated', 'dashboard', 'settings']}>
      <Settings>
        {/* Tools here auto-detect they're in authenticated>dashboard>settings */}
      </Settings>
    </NavigationContext.Provider>
  </Dashboard>
</NavigationContext.Provider>

// Tools auto-read their context
@Tool({ toolId: 'edit-profile' })
async editProfile() {
  // Reads NavigationContext at runtime
  // Knows it's in authenticated>dashboard>settings
}
```

**How it works**:
- React Context API tracks navigation state
- ExposureAwareTool wrapper reads context when tool mounts
- Reports context to NavigationGraph automatically
- Zero manual configuration

#### Strategy 3: DOM Observation (Fallback)
```typescript
class ContextScanner {
  observeDOM(): void {
    // Watch for navigation buttons with data-nav-target
    // Watch for conditional rendering (display:none → display:block)
    // Map which tools appear/disappear together
    // Infer context relationships from co-occurrence
  }
  
  discoverNavigationGraph(): NavigationGraph {
    // 1. Find navigation buttons: [data-tool-id^="nav-"], [data-tool-id^="tab-"]
    // 2. Observe which tools appear after clicking each button
    // 3. Build graph: button click → context change → tools available
    // 4. Return inferred navigation structure
  }
}
```

**How it works**:
- MutationObserver watches DOM changes
- When navigation button clicked, records which tools become PRESENT
- Builds navigation graph from observed behavior
- Self-learning system

#### Hybrid Approach (Recommended)
```typescript
class NavigationGraph {
  constructor() {
    // 1. Start with convention-based (file paths)
    this.loadContextsFromBuildMetadata();
    
    // 2. Enhance with React context (runtime)
    this.subscribeToNavigationContext();
    
    // 3. Validate/refine with DOM observation
    this.startContextScanner();
    
    // Result: Accurate navigation graph with ZERO manual config
  }
  
  getToolContext(toolId: string): string | null {
    // Prefers: React context > File path > DOM observation
    return this.contextMap.get(toolId);
  }
}

### Integration with REQ-004

**REQ-004 (State Detection)**: "Is this tool ready to interact with?"
**REQ-005 (Navigation)**: "How do I get to where this tool exists?"

**Combined Flow**:
```typescript
async executeToolAnywhere(toolId: string) {
  // 1. Find where tool exists (REQ-005)
  const contexts = NavigationGraph.getToolContext(toolId);
  
  if (contexts.length === 0) {
    return { error: 'Tool not found in any context' };
  }
  
  // 2. Navigate to tool's context (REQ-005)
  const currentContext = NavigationGraph.currentContext;
  const targetContext = contexts[0];  // Or pick closest
  
  if (currentContext !== targetContext) {
    const path = NavigationGraph.computePath(currentContext, targetContext);
    const success = await NavigationGraph.executeNavigation(path);
    
    if (!success) {
      return { error: 'Navigation failed' };
    }
  }
  
  // 3. Wait for tool to be ready (REQ-004)
  const ready = await ExposureCollector.getInstance()
    .waitForState(toolId, ExposureState.INTERACTABLE, 5000);
  
  if (!ready) {
    return { error: 'Tool not ready after navigation' };
  }
  
  // 4. Execute tool
  return await ToolRegistry.executeTool(toolId);
}
```

## Complete End-to-End Flow: User Command → Tool Execution

This section details exactly how a user's natural language command results in execution of a tool that may be on a different page/context.

### Flow Diagram

```
User Types: "enable the feature toggle"
       ↓
1. DemoAIInterface.parseCommand(query)
   → Finds tool: "toggle-feature" (confidence: 0.85)
   → Parameters: { enabled: true }
       ↓
2. User approves (if needed)
       ↓
3. DemoAIInterface.executeCommand(command)
       ↓
4. NavigationGraph.getToolContext("toggle-feature")
   → Returns: "interactive-demo"
       ↓
5. NavigationGraph.getCurrentContext()
   → Returns: "home" (we're on wrong page!)
       ↓
6. NavigationGraph.computePath("home", "interactive-demo")
   → Returns: [{ from: "home", to: "interactive-demo", navTool: "tab-interactive-demo" }]
       ↓
7. FOR EACH step in path:
   a. ExposureCollector.waitForState("tab-interactive-demo", INTERACTABLE, 5000)
      → Waits for tab button to be clickable (REQ-004)
   b. ToolRegistry.executeTool("tab-interactive-demo")
      → Clicks the tab button
   c. NavigationGraph.waitForContextChange("interactive-demo", 3000)
      → Confirms we're now on the right tab
       ↓
8. ExposureCollector.waitForState("toggle-feature", INTERACTABLE, 5000)
   → Waits for target tool to be ready (REQ-004)
       ↓
9. ToolRegistry.executeTool("toggle-feature", { enabled: true })
   → Executes the actual tool
       ↓
10. Return AIResponse to user
    → "✅ Feature toggle enabled"
```

### Implementation in DemoAIInterface

**Current Code (Before REQ-005)**:
```typescript
// core/demo/src/lib/AIInterface.ts
async executeCommand(command: AICommand, approved: boolean = false): Promise<AIResponse> {
  const timestamp = new Date().toISOString();
  
  if (!command.tool) {
    return { success: false, message: `❓ I don't understand "${command.query}"`, timestamp };
  }
  
  if (command.tool.requiresApproval && !approved) {
    return { success: false, message: `⚠️ "${command.tool.name}" requires approval`, timestamp };
  }
  
  if (!command.tool.aiEnabled) {
    return { success: false, message: `🚫 "${command.tool.name}" is test-only`, timestamp };
  }
  
  try {
    // Direct execution (assumes tool is present on current page)
    const result = await this.executeToolMethod(command.tool, command.parameters || []);
    
    return {
      success: result.success,
      message: result.message,
      executedTool: command.tool.name,
      timestamp
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Execution failed: ${error.message}`,
      executedTool: command.tool.name,
      timestamp
    };
  }
}
```

**Enhanced Code (With REQ-005 Navigation)**:
```typescript
// core/demo/src/lib/AIInterface.ts
async executeCommand(command: AICommand, approved: boolean = false): Promise<AIResponse> {
  const timestamp = new Date().toISOString();
  
  // Existing validation...
  if (!command.tool) { /* ... */ }
  if (command.tool.requiresApproval && !approved) { /* ... */ }
  if (!command.tool.aiEnabled) { /* ... */ }
  
  try {
    // ============================================
    // NEW: REQ-005 Navigation Integration
    // ============================================
    
    const toolId = command.tool.toolId;
    
    // 1. Find where tool is available
    const targetContext = NavigationGraph.getInstance().getToolContext(toolId);
    
    if (!targetContext) {
      return {
        success: false,
        message: `❌ Tool "${command.tool.name}" not found in any context.`,
        timestamp
      };
    }
    
    // 2. Check if we need to navigate
    const currentContext = NavigationGraph.getInstance().getCurrentContext();
    
    if (currentContext !== targetContext) {
      console.log(`🧭 Navigation required: ${currentContext} → ${targetContext}`);
      
      // 3. Compute navigation path
      const path = NavigationGraph.getInstance().computePath(currentContext, targetContext);
      
      if (!path) {
        return {
          success: false,
          message: `❌ Cannot navigate to "${targetContext}". No path exists from "${currentContext}".`,
          suggestion: `Please navigate to the ${targetContext} page manually.`,
          timestamp
        };
      }
      
      // 4. Execute navigation steps
      for (const step of path.steps) {
        console.log(`🧭 Step: ${step.fromContext} → ${step.toContext} via ${step.navigationTool}`);
        
        // REQ-004: Wait for navigation button to be ready
        const navReady = await ExposureCollector.getInstance()
          .waitForState(step.navigationTool, ExposureState.INTERACTABLE, 5000);
        
        if (!navReady) {
          return {
            success: false,
            message: `❌ Navigation button "${step.navigationTool}" not ready. Cannot navigate to tool.`,
            timestamp
          };
        }
        
        // Execute navigation (click tab button, etc.)
        await ToolRegistry.executeTool(step.navigationTool);
        
        // Confirm context changed
        const contextChanged = await NavigationGraph.getInstance()
          .waitForContextChange(step.toContext, 3000);
        
        if (!contextChanged) {
          return {
            success: false,
            message: `❌ Navigation to "${step.toContext}" failed. Context did not change.`,
            timestamp
          };
        }
      }
      
      console.log(`✅ Navigation complete. Now in context: ${targetContext}`);
    }
    
    // ============================================
    // EXISTING: REQ-004 State Detection + Execution
    // ============================================
    
    // REQ-004: Wait for target tool to be ready
    const toolReady = await ExposureCollector.getInstance()
      .waitForState(toolId, ExposureState.INTERACTABLE, 5000);
    
    if (!toolReady) {
      const toolState = ExposureCollector.getInstance().getToolState(toolId);
      return {
        success: false,
        message: `❌ Tool "${command.tool.name}" is not ready. Current state: ${ExposureState[toolState?.state || 0]}`,
        reason: toolState?.metadata?.reason,
        timestamp
      };
    }
    
    // Execute the tool method
    const result = await this.executeToolMethod(command.tool, command.parameters || []);
    
    return {
      success: result.success,
      message: result.message,
      executedTool: command.tool.name,
      timestamp
    };
    
  } catch (error) {
    return {
      success: false,
      message: `❌ Execution failed: ${error instanceof Error ? error.message : String(error)}`,
      executedTool: command.tool.name,
      timestamp
    };
  }
}
```

### User Experience Examples

#### Example 1: Tool on Current Page (No Navigation)
```
User: "open the main menu"
Current Context: interactive-demo
Tool Location: interactive-demo

Flow:
1. Parse: "open-main-menu" tool found
2. Check context: Already on correct page ✓
3. Wait for tool ready (REQ-004)
4. Execute tool
→ "✅ Main menu opened"
```

#### Example 2: Tool on Different Page (Auto-Navigate)
```
User: "toggle the feature"
Current Context: home
Tool Location: interactive-demo

Flow:
1. Parse: "toggle-feature" tool found
2. Check context: Need to navigate (home → interactive-demo)
3. Compute path: [click "Interactive Demo" tab]
4. Wait for tab button ready (REQ-004)
5. Click tab button
6. Confirm context changed to "interactive-demo"
7. Wait for "toggle-feature" ready (REQ-004)
8. Execute tool
→ "✅ Feature toggled"
```

#### Example 3: Tool Not Found
```
User: "delete the universe"
Current Context: home

Flow:
1. Parse: "delete-universe" tool not found
2. Check context: Tool doesn't exist anywhere
→ "❌ Tool 'delete-universe' not found in any context."
```

#### Example 4: Navigation Failed
```
User: "run advanced tests"
Current Context: home
Tool Location: auto-testing (but requires auth)

Flow:
1. Parse: "run-advanced-tests" tool found
2. Check context: Need to navigate
3. Compute path: [login → dashboard → auto-testing]
4. Execute step 1: Click login button
5. Context change failed (modal didn't appear)
→ "❌ Navigation to 'auto-testing' failed. Please navigate manually."
```

## Non-Functional Requirements
- **Path Computation**: < 50ms for simple graphs (< 20 nodes)
- **Navigation Execution**: Respect actual page load times
- **Memory**: < 200KB for navigation graph with 100 nodes
- **Accuracy**: 100% correct context identification
- **Reliability**: Detect failed navigation within 5 seconds

## Implementation Notes

### Phase 1: Basic Context Mapping

**For Existing Demo**:
```typescript
// Manually define demo structure
const DEMO_NAVIGATION_GRAPH = {
  nodes: {
    'home': {
      tools: ['copy-install', 'open-github', 'nav-demo', 'nav-dashboard'],
      navigationButtons: [
        { target: 'interactive-demo', tool: 'tab-interactive-demo' },
        { target: 'available-tools', tool: 'tab-available-tools' },
        { target: 'auto-testing', tool: 'tab-auto-testing' }
      ]
    },
    'interactive-demo': {
      tools: [
        'open-main-menu', 'close-main-menu', 'toggle-feature', 
        'toggle-notifications', 'set-priority', 'set-status', 'set-theme'
      ],
      navigationButtons: [
        { target: 'home', tool: 'tab-home' }
      ]
    },
    'available-tools': {
      tools: ['filter-tools', 'search-tools', 'execute-tool-card'],
      navigationButtons: [
        { target: 'home', tool: 'tab-home' }
      ]
    },
    'auto-testing': {
      tools: ['run-all-tests', 'run-specific-test', 'view-test-results'],
      navigationButtons: [
        { target: 'home', tool: 'tab-home' }
      ]
    }
  }
};
```

### Phase 2: Dynamic Discovery

**Scan DOM on page load**:
```typescript
function discoverNavigationGraph(): NavigationGraph {
  const graph = new NavigationGraph();
  
  // Find all tabs/sections
  const tabs = document.querySelectorAll('[role="tab"], [data-testid^="tab-"]');
  
  for (const tab of tabs) {
    const contextId = tab.getAttribute('data-testid') || tab.id;
    const panel = document.querySelector(`[aria-labelledby="${tab.id}"]`);
    
    if (panel) {
      // Find all tools in this panel
      const tools = panel.querySelectorAll('[data-testid]');
      const toolIds = Array.from(tools).map(t => t.getAttribute('data-testid'));
      
      graph.addNode(contextId, toolIds, [...]);
    }
  }
  
  return graph;
}
```

### Phase 3: Path-Finding Algorithm

**Dijkstra's with cost weights**:
```typescript
function computePath(graph: NavigationGraph, from: string, to: string): NavigationPath | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const unvisited = new Set(graph.nodes.keys());
  
  distances.set(from, 0);
  
  while (unvisited.size > 0) {
    // Get node with smallest distance
    const current = findMinDistance(unvisited, distances);
    if (!current || current === to) break;
    
    unvisited.delete(current);
    
    // Check all neighbors
    for (const edge of graph.nodes.get(current).navigationButtons) {
      const neighbor = edge.targetNodeId;
      const alt = distances.get(current) + edge.cost;
      
      if (alt < (distances.get(neighbor) || Infinity)) {
        distances.set(neighbor, alt);
        previous.set(neighbor, current);
      }
    }
  }
  
  // Reconstruct path
  return buildPath(previous, from, to);
}
```

## Related Requirements
- **REQ-004**: Provides state detection for navigation buttons and target tools
- **REQ-003**: Chat interface uses navigation to execute tools anywhere
- **REQ-002**: Tool discovery shows where tools are located

## Benefits

### For AI Agents
- Execute any tool in the system, not just current page
- Automatic navigation removes manual "go to X first" steps
- Clear feedback: "Navigating to Settings page..."

### For Users  
- More natural commands: "show the widgets" vs "go to demo tab then show widgets"
- Transparent navigation: See AI navigating on their behalf
- Reliable execution: No "command failed" due to wrong page

### For Developers
- Tools don't need to handle navigation logic
- Declarative context specification in @Tool decorator
- Automatic graph discovery reduces configuration

## Challenges

### 1. State-Action Space Explosion
**Problem**: With N pages and M tools, mapping all possible states is O(N*M).

**Solution**: 
- Only map where tools ARE, not where they AREN'T
- Use sparse graph representation
- Lazy-load context mappings

### 2. Dynamic Navigation Graphs
**Problem**: SPAs with route-based navigation don't have fixed structure.

**Solution**:
- Support both static (tabs) and dynamic (routes) navigation
- React Router integration for route-based navigation
- Re-scan graph when routes change

### 3. Asynchronous Page Loads
**Problem**: Navigation takes time, need to know when context change is complete.

**Solution**:
- Use REQ-004 state detection for navigation buttons
- Confirm context change by detecting target tools appear
- Timeout after 10s if context doesn't change

### 4. Feasibility Concerns

**Is this reasonable/possible?**

**YES**, for tab-based interfaces like the demo (simple graph, ~4 nodes).

**CHALLENGING** for complex SPAs with many routes and dynamic content.

**APPROACH**: Start simple (demo tabs), expand progressively.

## Notes

This is **advanced infrastructure** that unlocks true "execute anywhere" capability. Without it, AI can only execute tools on the current page.

The graph approach is well-established (React Router uses similar concepts). The key innovation is **automatic graph discovery** from the DOM rather than manual configuration.

## Related Documentation

- **[Architecture: User Command to Execution Flow](../architecture/USER-COMMAND-TO-EXECUTION-FLOW.md)** - Complete end-to-end flow showing how user commands navigate and execute tools
- **[Architecture: Demo Enhancement Plan](../architecture/DEMO-ENHANCEMENT-PLAN.md)** - Plan for enhancing demo to showcase multi-level navigation, authentication, and role gates
- **[Architecture: REQ-005 Navigation Analysis](../architecture/REQ-005-NAVIGATION-ANALYSIS.md)** - Feasibility analysis and technical implementation details
- **[Architecture: REQ-004/005 Improvements](../architecture/REQ-004-005-IMPROVEMENTS.md)** - Summary of toolId migration, duplication detection, and auto-context detection

---
*Implementation priority: MEDIUM-HIGH - Required for full AI autonomy, builds on REQ-004*


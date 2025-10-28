# REQ-005: Context-Aware Navigation - Complete Analysis

**Date**: 2025-10-27  
**Your Question**: "How do we get to the location where that tool is exposed? This might be a tricky/technical thing because it amounts to A-B graphs of state-action capability."

## ✅ Your Insight Was Correct

You identified a **critical missing capability**:

### The Problem
```
User: "show the widget examples"
AI: Finds tool "show-widget-examples"
AI: Tool exists but is on "Interactive Demo" tab
AI: We're on "Home" tab
❌ AI tries to execute → FAILS (wrong context)
```

### What We Need
```
User: "show the widget examples"  
AI: Finds tool on "Interactive Demo" tab
AI: Computes path: Home → Interactive Demo (click tab button)
AI: Executes navigation
AI: Waits for tool to be INTERACTABLE (REQ-004)
✅ AI executes tool → SUCCESS
```

## Is It Reasonable/Possible?

### YES, for Your Demo ✅

**Why It's Feasible**:
1. **Simple Graph Structure**: ~4 tabs (Home, Interactive Demo, Available Tools, Auto-Testing)
2. **Fixed Navigation**: Tabs don't change dynamically
3. **Clear testIds**: Buttons already have `data-testid="tab-*"`
4. **Existing State Detection**: REQ-004 handles "when is button ready"

**Graph Complexity**:
```
Nodes: 4 (one per tab)
Edges: ~6 (tab buttons)
Tools: 15+ (distributed across tabs)

Path computation: O(N) where N=4 → trivial
```

### Challenging for Complex SPAs ⚠️

**Why It Gets Hard**:
1. **Dynamic Routes**: `/dashboard/:userId/settings/:section`
2. **Conditional Navigation**: Auth walls, permission checks
3. **Async Loading**: Infinite scroll, lazy-loaded components
4. **State Dependencies**: "Settings only available after profile complete"

**Our Approach**: Start simple (demo tabs), expand progressively.

## REQ-004 vs REQ-005: How They Work Together

| Concern | REQ-004 (State Detection) | REQ-005 (Navigation) |
|---------|--------------------------|----------------------|
| **Question** | "Is this tool ready?" | "Where is this tool?" |
| **Scope** | Single tool on current page | Tool location across pages |
| **Output** | ExposureState (0-4) | NavigationPath (steps to get there) |
| **Example** | Button disabled → wait → enabled | Tool on Tab B → navigate there |

### Combined Flow

```typescript
async executeToolAnywhere(toolId: string) {
  // REQ-005: Find where tool exists
  const toolLocation = NavigationGraph.getToolContext(toolId);
  
  if (!toolLocation) {
    return { error: 'Tool not found anywhere' };
  }
  
  // REQ-005: Navigate to that location
  if (currentContext !== toolLocation) {
    const path = NavigationGraph.computePath(currentContext, toolLocation);
    
    // REQ-004: Wait for navigation button to be ready
    for (const step of path.steps) {
      const navButton = step.navigationTool;  // e.g., "tab-interactive-demo"
      
      // Wait for button to be clickable
      await ExposureCollector.getInstance()
        .waitForState(navButton, INTERACTABLE, 5000);
      
      // Click it
      await ToolRegistry.executeTool(navButton);
      
      // Confirm context changed
      await waitForContextChange(step.toContext);
    }
  }
  
  // REQ-004: Wait for target tool to be ready
  await ExposureCollector.getInstance()
    .waitForState(toolId, INTERACTABLE, 5000);
  
  // Execute tool
  return await ToolRegistry.executeTool(toolId);
}
```

## Technical Implementation

### Phase 1: Manual Graph (Week 1)

For your demo, **manually define** the structure:

```typescript
const DEMO_GRAPH: NavigationGraph = {
  nodes: {
    'home': {
      tools: ['copy-install', 'open-github'],
      edges: [
        { to: 'interactive-demo', via: 'tab-interactive-demo' },
        { to: 'available-tools', via: 'tab-available-tools' },
        { to: 'auto-testing', via: 'tab-auto-testing' }
      ]
    },
    'interactive-demo': {
      tools: [
        'open-main-menu', 'close-main-menu', 'toggle-feature',
        'toggle-notifications', 'set-priority', 'set-status'
      ],
      edges: [
        { to: 'home', via: 'tab-home' }
      ]
    },
    // ... other tabs
  }
};
```

**Effort**: ~1 hour to define, works immediately.

### Phase 2: Auto-Discovery (Week 2)

Scan DOM to build graph automatically:

```typescript
function discoverGraph(): NavigationGraph {
  const graph = new NavigationGraph();
  
  // Find all tab buttons
  const tabs = document.querySelectorAll('[data-testid^="tab-"]');
  
  for (const tab of tabs) {
    const tabId = tab.getAttribute('data-testid').replace('tab-', '');
    const panel = document.querySelector(`[aria-labelledby="${tabId}"]`);
    
    // Find all tools in this panel
    const tools = panel.querySelectorAll('[data-testid]');
    const toolIds = Array.from(tools)
      .map(t => t.getAttribute('data-testid'))
      .filter(id => ToolRegistry.hasTool(id));  // Only registered tools
    
    graph.addNode(tabId, toolIds);
    
    // This tab button navigates to panel
    graph.addEdge('current-location', tabId, `tab-${tabId}`);
  }
  
  return graph;
}
```

**Effort**: ~1 day to implement, automatic thereafter.

### Phase 3: Path-Finding (Week 2)

Simple BFS for your small graph:

```typescript
function findPath(from: string, to: string): NavigationPath {
  const queue: Path[] = [{ nodes: [from], cost: 0 }];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const current = queue.shift();
    const lastNode = current.nodes[current.nodes.length - 1];
    
    if (lastNode === to) {
      return buildNavigationPath(current);
    }
    
    if (visited.has(lastNode)) continue;
    visited.set(lastNode);
    
    // Add neighbors to queue
    for (const edge of graph.getEdges(lastNode)) {
      queue.push({
        nodes: [...current.nodes, edge.to],
        cost: current.cost + edge.cost
      });
    }
  }
  
  return null;  // No path found
}
```

**Complexity**: O(V + E) where V=4, E=6 → < 1ms.

## Real Example from Your Demo

### Current Scenario

**Tools by Tab**:
- **Home**: `copy-install`, `open-github`, `nav-demo`
- **Interactive Demo**: `open-main-menu`, `toggle-feature`, `set-priority`, etc. (8 tools)
- **Available Tools**: `filter-tools`, `search-tools`, `execute-tool-card`
- **Auto-Testing**: `run-all-tests`, `view-test-results`

**User Command**: "enable the feature"

**Without REQ-005**:
```
AI: Matches "toggle-feature"
AI: Tries to execute
❌ FAILS: "Element not found" (we're on Home tab)
```

**With REQ-005**:
```
AI: Matches "toggle-feature"
AI: Looks up location → "interactive-demo" tab
AI: Current location → "home" tab
AI: Computes path: home → interactive-demo (click "tab-interactive-demo")
AI: Clicks tab button
AI: Waits for context change (sees "interactive-demo" tools appear)
AI: Waits for "toggle-feature" to be INTERACTABLE (REQ-004)
✅ AI executes "toggle-feature" → SUCCESS
```

## Challenges & Solutions

### Challenge 1: State-Action Space Explosion

**Your Concern**: "This amounts to A-B graphs of state-action capability"

**Reality for Demo**: 
- States (tabs): 4
- Actions (navigation): 6
- Tools: 15
- Total state space: 4 × 15 = 60 (trivial)

**Solution**: Only map where tools ARE, not all possible states.

### Challenge 2: Dynamic Content

**Concern**: What if tools appear/disappear dynamically?

**Solution**: 
- REQ-004 handles "tool not present" state
- Re-scan graph when DOM changes (MutationObserver)
- Cache mappings, invalidate on change

### Challenge 3: Failed Navigation

**Concern**: What if navigation fails?

**Solution**:
```typescript
const navigated = await executeNavigation(path);

if (!navigated) {
  // Try alternative path
  const altPath = findAlternativePath(from, to);
  
  if (!altPath) {
    return { 
      error: 'Cannot reach tool location',
      suggestion: 'Navigate manually to ${toolLocation} first'
    };
  }
}
```

## Integration with Existing Demo

### Existing Code (Unchanged)
```typescript
// NavigationProvider.ts - NO CHANGES
@Tool({ testId: 'navigate-to-docs', aiEnabled: true })
async navigateToDocs() {
  const button = safeQuerySelector('[data-testid="navigate-to-docs"]');
  button.click();
}
```

### Enhanced AI (Add Navigation)
```typescript
// AIInterface.ts - ADD THIS
async executeCommand(command: AICommand): Promise<AIResponse> {
  const tool = command.tool;
  
  // NEW: Navigate to tool's location if needed
  const toolContext = NavigationGraph.getToolContext(tool.testId);
  const currentContext = NavigationGraph.getCurrentContext();
  
  if (toolContext && toolContext !== currentContext) {
    const path = NavigationGraph.computePath(currentContext, toolContext);
    const navigated = await NavigationGraph.executeNavigation(path);
    
    if (!navigated) {
      return {
        success: false,
        message: `Cannot reach tool. It's on "${toolContext}" but navigation failed.`
      };
    }
  }
  
  // EXISTING: Wait for tool state (REQ-004)
  // EXISTING: Execute tool
}
```

## Requirements Summary

### Current State (5 Requirements)

| Requirement | Purpose | Status | Feasibility |
|------------|---------|--------|------------|
| **REQ-004** | State detection | Draft | ✅ Straightforward |
| **REQ-005** | Navigation graphs | Draft | ✅ **Feasible for demo** |
| **REQ-001** | UI widgets | In Progress | ✅ Partially complete |
| **REQ-002** | Tool discovery | Draft | ✅ Partially complete |
| **REQ-003** | Natural language | Draft | ✅ Partially complete |

### Dependency Chain

```
REQ-004 (State Detection)
  └─> REQ-005 (Navigation Paths)
       ├─> REQ-001 (UI Widgets)
       ├─> REQ-002 (Tool Discovery)
       └─> REQ-003 (Natural Language)
```

### Implementation Order

1. **REQ-004** (State Detection) - Foundation
2. **REQ-005 Phase 1** (Manual graph for demo) - ~1 hour
3. **Complete REQ-001, 002, 003** - Use both REQ-004 and REQ-005
4. **REQ-005 Phase 2** (Auto-discovery) - Polish

## Final Answer

### Is It Reasonable?

**YES** ✅ - For your demo with 4 tabs and simple navigation.

### Is It Possible?

**YES** ✅ - Standard graph algorithms, well-understood problem.

### Is It Part of REQ-004?

**NO** - It's a separate concern (REQ-005):
- **REQ-004**: "Is tool ready?" (state detection)
- **REQ-005**: "Where is tool?" (location & path-finding)

### Implementation Complexity

**Simple** (for your demo):
- Graph: 4 nodes, 6 edges
- Algorithm: BFS (< 1ms)
- Manual definition: 1 hour
- Auto-discovery: 1 day

**Complex** (for general SPAs):
- Dynamic routes
- Auth boundaries
- Async content
- *Not required for demo*

---

**You've identified a critical capability that makes AI truly autonomous! REQ-005 enables "execute anywhere" functionality.**


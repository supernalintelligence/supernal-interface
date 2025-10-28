# User Command → Tool Execution Flow
## "How does 'do this' execute when the tool is elsewhere in the application?"

**Date**: 2025-10-27  
**Question**: When a user says "do this" and it looks in a tool set and that involves going elsewhere in the application to do that: how does that execute? Is that written into reqs/design?

## Answer: YES ✅

The complete flow is documented in **REQ-005**, specifically in the section **"Complete End-to-End Flow: User Command → Tool Execution"** (lines 396-660).

---

## The Complete Flow

### 1. User Types Command
```
User: "enable the feature toggle"
```

### 2. Natural Language Parsing (DemoAIInterface)
```typescript
DemoAIInterface.parseCommand("enable the feature toggle")
  → Searches ToolRegistry for matching tools
  → Finds: "toggle-feature" (confidence: 0.85)
  → Extracts parameters: { enabled: true }
  → Returns: AICommand { tool, parameters, confidence }
```

### 3. Approval Check (if needed)
```typescript
if (tool.requiresApproval && !approved) {
  return "⚠️ This action requires approval"
}
```

### 4. Navigation Check (REQ-005)
```typescript
// Where is this tool?
const targetContext = NavigationGraph.getToolContext("toggle-feature")
// → Returns: "interactive-demo"

// Where are we now?
const currentContext = NavigationGraph.getCurrentContext()
// → Returns: "home"

// Are we in the right place?
if (currentContext !== targetContext) {
  // NO! We need to navigate
}
```

### 5. Path Computation (REQ-005)
```typescript
const path = NavigationGraph.computePath("home", "interactive-demo")
// → Returns: [{
//     fromContext: "home",
//     toContext: "interactive-demo", 
//     navigationTool: "tab-interactive-demo",  // The button to click
//     estimatedTime: 500
//   }]
```

### 6. Navigation Execution (REQ-005 + REQ-004)
```typescript
for (const step of path.steps) {
  // REQ-004: Wait for navigation button to be ready
  await ExposureCollector.waitForState(
    step.navigationTool,  // "tab-interactive-demo"
    ExposureState.INTERACTABLE,
    5000
  );
  
  // Click the navigation button (e.g., tab)
  await ToolRegistry.executeTool(step.navigationTool);
  
  // Confirm we actually navigated
  await NavigationGraph.waitForContextChange(step.toContext, 3000);
}
```

### 7. Tool Readiness Check (REQ-004)
```typescript
// Now that we're on the right page, wait for the tool to be ready
await ExposureCollector.waitForState(
  "toggle-feature",
  ExposureState.INTERACTABLE,
  5000
);
```

### 8. Tool Execution
```typescript
// Execute the actual tool
const result = await ToolRegistry.executeTool("toggle-feature", { enabled: true });
```

### 9. User Feedback
```typescript
return {
  success: true,
  message: "✅ Feature toggle enabled",
  executedTool: "toggle-feature",
  timestamp: "2025-10-27T..."
}
```

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ User: "enable the feature toggle"              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ DemoAIInterface.parseCommand()                  │
│ → Finds tool: "toggle-feature"                  │
│ → Confidence: 0.85                              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ NavigationGraph.getToolContext()                │
│ Current: "home"                                 │
│ Target: "interactive-demo"                      │
│ → Navigation required! ⚠️                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ NavigationGraph.computePath()                   │
│ → Path: [click "Interactive Demo" tab]         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ FOR EACH navigation step:                       │
│                                                  │
│ 1. Wait for button ready (REQ-004)             │
│    ExposureCollector.waitForState()             │
│                                                  │
│ 2. Click navigation button                      │
│    ToolRegistry.executeTool("tab-...")          │
│                                                  │
│ 3. Confirm context changed                      │
│    NavigationGraph.waitForContextChange()       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ ExposureCollector.waitForState()                │
│ → Wait for "toggle-feature" to be INTERACTABLE │
│ → State: NOT_PRESENT → PRESENT → ... → READY ✓ │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ ToolRegistry.executeTool("toggle-feature")     │
│ → Executes the actual @Tool method             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ User sees: "✅ Feature toggle enabled"         │
└─────────────────────────────────────────────────┘
```

---

## Where This Is Documented

### Primary Documentation
- **REQ-005** (`supernal-coding/requirements/REQ-005-context-aware-navigation.md`)
  - Lines 396-660: "Complete End-to-End Flow: User Command → Tool Execution"
  - Lines 440-600: **Implementation in DemoAIInterface** (actual code)
  - Lines 602-660: **User Experience Examples** (4 scenarios)

### Supporting Documentation
- **REQ-004** (`supernal-coding/requirements/REQ-004-state-dependent-tool-exposure.md`)
  - Lines 262-291: Integration with DemoAIInterface.executeCommand()
  - Shows how state checking is added to existing execution flow

- **REQ-004-005-IMPROVEMENTS.md**
  - Complete summary of how requirements work together

---

## Key Integration Points

### 1. DemoAIInterface.executeCommand()
**Location**: `core/demo/src/lib/AIInterface.ts` (line 184)

**Current State**: Does NOT have navigation logic yet  
**After REQ-005**: Will include navigation before execution

**Changes Required**:
```diff
async executeCommand(command: AICommand): Promise<AIResponse> {
  // Existing validation...
  
  try {
+   // NEW: Check if navigation is needed
+   const targetContext = NavigationGraph.getInstance().getToolContext(command.tool.toolId);
+   const currentContext = NavigationGraph.getInstance().getCurrentContext();
+   
+   if (currentContext !== targetContext) {
+     const path = NavigationGraph.computePath(currentContext, targetContext);
+     await NavigationGraph.executeNavigation(path); // Uses REQ-004
+   }
+   
+   // NEW: Wait for tool to be ready
+   await ExposureCollector.getInstance()
+     .waitForState(command.tool.toolId, ExposureState.INTERACTABLE, 5000);
    
    // EXISTING: Execute tool
    const result = await this.executeToolMethod(command.tool, command.parameters);
    
    return { success: true, message: result.message };
  }
}
```

### 2. NavigationGraph Singleton
**New Class** (to be created): `core/demo/src/lib/NavigationGraph.ts`

**Responsibilities**:
- Track current application context (which page/tab)
- Map tools to contexts (where each tool is available)
- Compute navigation paths (A → B graph traversal)
- Execute navigation sequences
- Confirm context changes

### 3. ExposureCollector (REQ-004)
**Location**: To be created in `core/src/exposure/ExposureCollector.ts`

**Used By REQ-005 For**:
- Waiting for navigation buttons to be clickable
- Waiting for target tools to be ready after navigation
- Detecting when navigation has completed (DOM changes)

---

## Example Scenarios

### Scenario 1: Tool on Same Page (No Navigation)
```
User: "open the main menu"
Current: interactive-demo
Tool Location: interactive-demo

Flow:
✓ Already on correct page
✓ Wait for tool ready (REQ-004)
✓ Execute tool
→ "✅ Main menu opened"

Time: ~100ms
```

### Scenario 2: Tool on Different Page (Auto-Navigate)
```
User: "toggle the feature"
Current: home
Tool Location: interactive-demo

Flow:
⚠️  Need to navigate (home → interactive-demo)
✓ Wait for "tab-interactive-demo" button ready
✓ Click tab button
✓ Confirm context changed
✓ Wait for "toggle-feature" ready
✓ Execute tool
→ "✅ Feature toggled"

Time: ~1.5s (includes navigation delay)
```

### Scenario 3: Multi-Step Navigation
```
User: "run advanced tests"
Current: home
Tool Location: auto-testing > advanced-panel

Flow:
⚠️  Need multi-step navigation
✓ Step 1: Click "Auto-Testing" tab
✓ Confirm context: auto-testing
✓ Step 2: Click "Advanced Panel" button
✓ Confirm context: auto-testing > advanced-panel
✓ Wait for "run-advanced-tests" ready
✓ Execute tool
→ "✅ Advanced tests started"

Time: ~2.5s (two navigation steps)
```

### Scenario 4: Navigation Failed
```
User: "access admin tools"
Current: home
Tool Location: admin (requires authentication)

Flow:
⚠️  Need to navigate (home → admin)
✓ Compute path: [login → admin]
✓ Step 1: Click login button
❌ Context change failed (modal didn't open)
→ "❌ Navigation to 'admin' failed. Please navigate manually."

Time: ~5s (timeout + failure detection)
```

---

## Requirements Coverage

| Question | Requirement | Line Numbers |
|----------|-------------|--------------|
| "Where is this tool?" | REQ-005 | 257-353 (Context Discovery) |
| "How do I get there?" | REQ-005 | 419-528 (Path Computation & Execution) |
| "Is the button ready?" | REQ-004 | 532-542 (Wait for navigation button) |
| "Did navigation succeed?" | REQ-005 | 547-557 (Context change confirmation) |
| "Is the tool ready?" | REQ-004 | 567-579 (Wait for target tool) |
| "Execute the tool" | REQ-001/002 | 582 (Existing execution) |

---

## Implementation Status

### ✅ Fully Documented
- End-to-end flow diagram (REQ-005, lines 400-438)
- Before/After code comparison (REQ-005, lines 442-600)
- User experience examples (REQ-005, lines 602-660)
- Integration points with REQ-004
- Error handling scenarios

### 🚧 Not Yet Implemented
- NavigationGraph class (needs creation)
- Context auto-detection (convention-based, React context, DOM observation)
- DemoAIInterface navigation integration (needs code update)
- Context change confirmation mechanism

### 📋 Next Steps
1. Implement NavigationGraph class
2. Add context detection to ExposureAwareTool
3. Update DemoAIInterface.executeCommand() with navigation logic
4. Create build script for context extraction from file paths
5. Add NavigationContext React provider to demo pages

---

## Summary

**Q**: "How does 'do this' execute when the tool is elsewhere?"

**A**: The complete flow is:

1. **Parse command** → Find tool in ToolRegistry
2. **Check location** → NavigationGraph tells us where tool lives (REQ-005)
3. **Compute path** → BFS/Dijkstra finds navigation steps (REQ-005)
4. **Execute navigation** → Click buttons, wait for state changes (REQ-004 + REQ-005)
5. **Wait for tool** → ExposureCollector confirms tool ready (REQ-004)
6. **Execute tool** → Existing execution logic runs
7. **Return result** → User sees success/failure

**Is it documented?** YES - REQ-005, lines 396-660, with full code examples and 4 user scenarios.

**Is it implemented?** NOT YET - Documented design ready for implementation.


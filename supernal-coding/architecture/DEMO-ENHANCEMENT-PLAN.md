# Demo Enhancement Plan for REQ-004 & REQ-005

**Date**: 2025-10-27  
**Philosophy**: Production-quality code, minimal real-world examples

---

## Goal: Demonstrate Production Patterns with Minimal Scope

**Build**: Production-ready `ExposureCollector` and `NavigationGraph` that work for ANY application
**Show**: 2-3 minimal but realistic scenarios that prove the concepts

**Key Principle**: The infrastructure is production-quality (handles 1 tool or 10,000 tools). The demo is intentionally minimal to clearly show the patterns.

---

## Current Demo State

### Existing Architecture
- **Flat navigation**: 5 pages (Home, Demo, Dashboard, Docs, Examples)
- **All tools always visible**: No state-dependent availability
- **Single-level contexts**: No nested tabs or sections
- **Simple state management**: `const [currentPage, setCurrentPage] = useState('home')`

### What's Missing for Real-World Demonstration
Real applications have:
1. **Modal-gated tools** - Settings only available when settings modal is open
2. **Tab-gated tools** - Security tools only in Security tab
3. **Conditionally rendered tools** - "Save" button only appears when form is dirty
4. **Multi-step navigation** - Must navigate through Dashboard → Settings → Profile to edit profile

**Current demo cannot demonstrate these patterns.**

---

## Minimal Real-World Scenarios

### Scenario 1: Modal-Gated Tool (REQ-004)

**Real Pattern**: Configuration tools in settings modal

```typescript
// Production code pattern
const [settingsOpen, setSettingsOpen] = useState(false);

<button onClick={() => setSettingsOpen(true)}>Settings</button>

{settingsOpen && (
  <Modal title="Settings">
    <button data-toolid="save-settings">
      Save Settings
    </button>
    {/* REQ-004: "save-settings" reports NOT_PRESENT when modal closed */}
  </Modal>
)}
```

**User Experience**:
```
User: "save settings"
AI: ⏳ Settings modal is closed. Opening now...
    [Clicks "Settings" button]
    ✅ Modal opened. Executing "save settings"...
```

**Demonstrates**:
- REQ-004 state detection: `NOT_PRESENT` → `PRESENT` → `VISIBLE` → `INTERACTABLE`
- Intelligent waiting before tool execution
- Real-world modal pattern

**Implementation Effort**: ~2 hours (add modal, wire state tracking)

---

### Scenario 2: Tab-Gated Tools (REQ-005)

**Real Pattern**: Security settings in different tab

```typescript
// Production code pattern
const [activeTab, setActiveTab] = useState('profile');

<Tabs>
  <Tab onClick={() => setActiveTab('profile')}>Profile</Tab>
  <Tab onClick={() => setActiveTab('security')}>Security</Tab>
</Tabs>

{activeTab === 'profile' && (
  <ProfileTools>
    <button data-toolid="edit-display-name">Edit Name</button>
  </ProfileTools>
)}

{activeTab === 'security' && (
  <SecurityTools>
    <button data-toolid="change-password">Change Password</button>
    {/* REQ-005: Must navigate to Security tab to access */}
  </SecurityTools>
)}
```

**User Experience**:
```
User: "change my password"
AI: 🧭 Tool "change-password" is in Security tab
    [Clicks Security tab]
    ✅ Navigated to Security. Executing "change password"...
```

**Demonstrates**:
- REQ-005 context detection: Tool knows it's in `settings.security` context
- Automatic navigation path computation
- Real-world tab pattern

**Implementation Effort**: ~3 hours (add tabs, configure navigation graph)

---

### Scenario 3: Conditionally Rendered Tool (REQ-004 Advanced)

**Real Pattern**: Save button only appears when form has changes

```typescript
// Production code pattern
const [formData, setFormData] = useState(initialData);
const hasChanges = formData !== initialData;

<form>
  <input 
    value={formData.name} 
    onChange={(e) => setFormData({...formData, name: e.target.value})}
  />
  
  {hasChanges && (
    <button data-toolid="save-form">Save Changes</button>
    {/* REQ-004: Tool appears/disappears based on form state */}
  )}
</form>
```

**User Experience**:
```
User: "save changes"
AI: ⚠️ No unsaved changes detected
    
[User types in form]

User: "save changes"
AI: ✅ Saving form...
```

**Demonstrates**:
- REQ-004 dynamic state: Tool availability changes based on application state
- Real-world conditional rendering pattern
- Smart AI feedback ("no changes to save")

**Implementation Effort**: ~1 hour (add form, wire dirty checking)

---

## Production Infrastructure (Implemented Once)

### REQ-004: ExposureCollector
```typescript
// core/src/exposure/ExposureCollector.ts
// Works for any app, any number of tools
export class ExposureCollector {
  private observers = new Map<string, IntersectionObserver>();
  private states = new Map<string, ToolExposureState>();
  private subscribers = new Map<string, Set<(state: ToolExposureState) => void>>();
  
  observeElement(toolId: string, element: HTMLElement): void {
    // IntersectionObserver for visibility
    // MutationObserver for DOM changes
    // Event system for state changes
  }
  
  waitForState(
    toolId: string, 
    minState: ExposureState, 
    timeout: number
  ): Promise<boolean> {
    // Intelligent waiting with timeout
  }
  
  getToolState(toolId: string): ToolExposureState | undefined {
    // Current state query
  }
}
```

**Production Features**:
- Memory-safe (cleanup on unmount)
- Performance-optimized (efficient observers)
- Type-safe (TypeScript)
- Tested (unit tests for all edge cases)

---

### REQ-005: NavigationGraph
```typescript
// core/src/navigation/NavigationGraph.ts
// BFS pathfinding works for any graph complexity
export class NavigationGraph {
  private graph = new Map<string, NavigationNode>();
  
  registerContext(context: string, config: {
    tools: string[],
    navigatesTo?: string[],
    parent?: string
  }): void {
    // Build navigation graph
  }
  
  computePath(from: string, to: string): NavigationPath | null {
    // BFS pathfinding algorithm
    // Returns null if no path exists
  }
  
  getToolContext(toolId: string): string | undefined {
    // Find which context a tool belongs to
  }
}
```

**Production Features**:
- Real graph algorithms (BFS, handles cycles)
- Supports manual configuration (for demos)
- Supports auto-discovery (for complex apps)
- Extensible (easy to add new strategies)

---

## Demo Navigation Graph (Manually Configured)

**Keep it simple**: 3 contexts, 2 navigation steps

```typescript
// core/demo/src/config/navigationGraph.ts
export const demoGraph = {
  'global': {
    tools: ['open-settings'],
    navigatesTo: ['settings']
  },
  'settings': {
    tools: ['open-profile-tab', 'open-security-tab'],
    navigatesTo: ['settings.profile', 'settings.security'],
    parent: 'global'
  },
  'settings.profile': {
    tools: ['edit-display-name', 'edit-email'],
    parent: 'settings'
  },
  'settings.security': {
    tools: ['change-password', 'enable-2fa'],
    parent: 'settings'
  }
};
```

**Graph Visualization**:
```
global
  └─ [open-settings] → settings
       ├─ [open-profile-tab] → settings.profile
       │    └─ Tools: edit-display-name, edit-email
       │
       └─ [open-security-tab] → settings.security
            └─ Tools: change-password, enable-2fa
```

**That's it.** 4 contexts prove pathfinding works. Production apps can have 100+ contexts.

---

## Integration: DemoAIInterface Updates

### Current executeCommand() (Basic)
```typescript
async executeCommand(command: AICommand): Promise<AIResponse> {
  if (!command.tool) return { success: false, message: "Unknown command" };
  
  // Execute directly (no state checking, no navigation)
  return await this.executeToolMethod(command.tool);
}
```

### Enhanced executeCommand() (REQ-004 + REQ-005)
```typescript
async executeCommand(command: AICommand): Promise<AIResponse> {
  if (!command.tool) return { success: false, message: "Unknown command" };
  
  const toolId = command.tool.toolId;
  
  // ============================================
  // REQ-005: Navigation to tool context
  // ============================================
  const targetContext = NavigationGraph.getInstance().getToolContext(toolId);
  const currentContext = NavigationGraph.getInstance().getCurrentContext();
  
  if (targetContext && currentContext !== targetContext) {
    const path = NavigationGraph.getInstance().computePath(currentContext, targetContext);
    
    if (!path) {
      return {
        success: false,
        message: `❌ Cannot reach tool "${command.tool.name}". No navigation path exists.`
      };
    }
    
    // Execute navigation steps
    for (const step of path.steps) {
      await ToolRegistry.executeTool(step.navigationTool);
      await NavigationGraph.getInstance().waitForContextChange(step.toContext, 3000);
    }
  }
  
  // ============================================
  // REQ-004: Wait for tool to be ready
  // ============================================
  const ready = await ExposureCollector.getInstance()
    .waitForState(toolId, ExposureState.INTERACTABLE, 5000);
  
  if (!ready) {
    const state = ExposureCollector.getInstance().getToolState(toolId);
    return {
      success: false,
      message: `❌ Tool not ready. State: ${ExposureState[state?.state || 0]}`
    };
  }
  
  // Execute tool
  return await this.executeToolMethod(command.tool);
}
```

**Production-quality**: Handles any navigation complexity, any tool state.

---

## Implementation Timeline

### Week 1: REQ-004 (State Detection)

**Infrastructure** (~3 days):
- ✅ `ExposureCollector` singleton
- ✅ `ExposureState` enum
- ✅ IntersectionObserver + MutationObserver
- ✅ Event system for state changes
- ✅ Unit tests

**Demo** (~2 days):
- ✅ Add settings modal (Scenario 1)
- ✅ Add form with conditional save button (Scenario 3)
- ✅ Wire state tracking to UI
- ✅ Update `DemoAIInterface` with wait logic

**Deliverable**: AI intelligently waits for tools to become available

---

### Week 2: REQ-005 (Navigation)

**Infrastructure** (~3 days):
- ✅ `NavigationGraph` with BFS pathfinding
- ✅ Manual graph configuration support
- ✅ Context tracking system
- ✅ Unit tests for pathfinding

**Demo** (~2 days):
- ✅ Add Settings page with Profile/Security tabs (Scenario 2)
- ✅ Configure demo navigation graph (4 contexts)
- ✅ Add navigation tools (`open-profile-tab`, `open-security-tab`)
- ✅ Update `DemoAIInterface` with navigation logic

**Deliverable**: AI automatically navigates to tool location

---

## Success Criteria

### Must Demonstrate
1. ✅ **Modal-gated tool**: AI opens modal before executing tool
2. ✅ **Tab navigation**: AI switches tabs to reach tool
3. ✅ **Conditional rendering**: AI detects when tool appears/disappears
4. ✅ **Multi-step navigation**: AI navigates through 2+ steps to reach tool

### Documentation Must Show
1. ✅ **Real-world patterns**: Modal, tabs, conditional rendering
2. ✅ **Minimal examples**: Each scenario is <50 lines of code
3. ✅ **Production quality**: Infrastructure works for complex apps
4. ✅ **Clear value**: "This is how you'd use it in your app"

### Non-Goals
- ❌ Fake authentication (use real patterns: modals, tabs)
- ❌ Complex state machines (simple React state is fine)
- ❌ 10+ contexts (3-4 contexts prove the concept)
- ❌ Auto-detection Phase 1 (manual `contextPath` is fine, infrastructure exists)

---

## Migration Notes

### `testId` → `toolId`
**Decision**: Support both for backward compatibility

```typescript
interface ToolConfig {
  toolId: string;        // Primary ID (used by NavigationGraph, ExposureCollector)
  testId?: string;       // Optional Playwright override (defaults to toolId)
}

// DOM elements get both:
<button 
  data-toolid="save-settings"    // Navigation system
  data-testid="save-settings"    // Playwright tests
>
```

**Migration Path**:
1. Phase 1: Add `toolId` parameter, auto-migrate `testId` → `toolId`
2. Phase 2: Deprecation warning if only `testId` provided
3. Phase 3: `testId` becomes optional

---

## Summary

**Infrastructure**: Production-ready (ExposureCollector + NavigationGraph)  
**Demo**: Minimal real-world scenarios (modal + tabs + conditional rendering)  
**Timeline**: 2 weeks  
**Complexity**: Low (3-4 contexts, <200 lines of demo code)  
**Value**: Clear demonstration of how to use in production apps

**Next Step**: Begin Week 1 implementation (REQ-004 infrastructure)

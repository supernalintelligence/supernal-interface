# REQ-004 & REQ-005 Improvements Summary

## Date: 2025-10-27

## Critical Issues Fixed

### 1. Terminology Correction: `testId` → `toolId`

**Problem**: Inconsistent naming in @Tool decorator across codebase
- Some code used `testId` (legacy, deprecated)
- Some code used `toolId` (correct)
- No clear migration path

**Solution**:
- ✅ Updated all Gherkin scenarios in REQ-004 to use `toolId`
- ✅ Updated all code examples in REQ-004 to use `toolId`
- ✅ Updated all interfaces in REQ-005 to use `toolId`
- ✅ **Important**: DOM attributes remain `data-testid` or `data-tool-id` (both acceptable)
- ✅ **Important**: The decorator parameter is `toolId`, not `testId`

**What Changed**:
```diff
// OLD (deprecated)
-@Tool({ testId: 'submit-button' })

// NEW (correct)
+@Tool({ toolId: 'submit-button' })
```

**In Code**:
```diff
-const toolState = collector.getToolState(command.tool.testId);
+const toolState = collector.getToolState(command.tool.toolId);
```

---

### 2. Tool ID Duplication Detection (NEW in REQ-004)

**Problem**: No validation to prevent duplicate `toolId` registrations, leading to:
- Silent overwrites
- Unpredictable tool execution
- Difficult debugging

**Solution**: Added comprehensive duplication detection system

#### Runtime Detection (Application Startup)
```typescript
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
  }
}
```

#### Build-Time Validation
```typescript
// npm run validate:tool-ids
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
```

#### Auto-Generate Tool ID Constants (Solves DRY Problem)
```typescript
// scripts/extract-tool-ids.ts - runs at build time
// Reads all @Tool decorators, outputs:

// generated-tool-ids.ts (auto-generated, DO NOT EDIT)
export const TOOL_IDS = {
  TOGGLE_FEATURE: 'toggle-feature',
  SAVE_BUTTON: 'save-button',
  OPEN_MAIN_MENU: 'open-main-menu',
  // ... all tool IDs extracted from decorators
} as const;

export type ToolId = typeof TOOL_IDS[keyof typeof TOOL_IDS];
```

**Tests can now use generated constants** (DRY):
```typescript
import { TOOL_IDS } from './generated-tool-ids';

// No more hardcoding, no more mismatches!
await page.click(`[data-tool-id="${TOOL_IDS.TOGGLE_FEATURE}"]`);
```

---

### 3. Auto-Detection of Tool Context (Removed Manual `contextPath`)

**Problem**: Original REQ-005 required manual context declaration:
```typescript
// ❌ UNMAINTAINABLE
@Tool({
  toolId: 'edit-profile',
  contextPath: ['authenticated', 'dashboard', 'settings', 'profile'] // Manual!
})
```

**Solution**: Three-strategy auto-detection system

#### Strategy 1: Convention-Based (File Path = Context)
```typescript
// File: src/pages/authenticated/dashboard/settings/ProfileTab.tsx
@Tool({ toolId: 'edit-profile' })
async editProfile() { }

// Context auto-inferred from file path:
// authenticated > dashboard > settings
// No manual configuration needed!
```

**How it works**:
- AST analysis at build time extracts file paths
- File structure = navigation structure
- Follows existing pattern (already used for other inferences)

#### Strategy 2: React Component Tree (Runtime)
```typescript
// Wrap pages with NavigationContext
<NavigationContext.Provider value={['authenticated', 'dashboard']}>
  <Dashboard>
    <NavigationContext.Provider value={['authenticated', 'dashboard', 'settings']}>
      <Settings>
        {/* Tools here auto-detect their context */}
      </Settings>
    </NavigationContext.Provider>
  </Dashboard>
</NavigationContext.Provider>

// ExposureAwareTool reads context automatically
```

**How it works**:
- React Context API tracks current navigation state
- Tool wrappers read context when mounted
- Report context to NavigationGraph automatically

#### Strategy 3: DOM Observation (Fallback)
```typescript
class ContextScanner {
  discoverNavigationGraph(): NavigationGraph {
    // 1. Watch for navigation button clicks
    // 2. Observe which tools appear after each click
    // 3. Infer: "button X" → "tools A, B, C appear"
    // 4. Build navigation graph from observed behavior
  }
}
```

**How it works**:
- MutationObserver watches DOM changes
- Records which tools co-occur after navigation
- Self-learning system

#### Hybrid Approach (Recommended)
```typescript
class NavigationGraph {
  constructor() {
    // 1. Start with file paths (convention)
    this.loadContextsFromBuildMetadata();
    
    // 2. Enhance with React context (runtime)
    this.subscribeToNavigationContext();
    
    // 3. Validate/refine with DOM observation
    this.startContextScanner();
    
    // Result: Accurate navigation graph, ZERO manual config
  }
}
```

---

## What This Solves

### Before (Problems)

1. **DRY Violation**:
   ```typescript
   // componentNames.ts - MANUAL SYNC REQUIRED
   export const COMPONENT_NAMES = {
     TOGGLE_FEATURE: 'toggle-feature', // Must match decorator
   };
   
   // Component - if these don't match, tests break
   @Tool({ testId: 'toggle-feature' })
   ```

2. **No Duplicate Detection**:
   ```typescript
   @Tool({ testId: 'submit' }) // Provider 1
   @Tool({ testId: 'submit' }) // Provider 2 - SILENT OVERWRITE!
   ```

3. **Unmaintainable Context**:
   ```typescript
   @Tool({
     testId: 'edit-profile',
     contextPath: ['auth', 'dashboard', 'settings'] // Manual!
   })
   ```

### After (Solutions)

1. **DRY Enforcement**:
   ```typescript
   // Auto-generated from decorators
   import { TOOL_IDS } from './generated-tool-ids';
   
   await page.click(`[data-tool-id="${TOOL_IDS.TOGGLE_FEATURE}"]`);
   // ALWAYS matches decorator, can't drift
   ```

2. **Runtime Duplication Check**:
   ```typescript
   @Tool({ toolId: 'submit' }) // Provider 1
   @Tool({ toolId: 'submit' }) // Provider 2
   // ❌ Error: Duplicate toolId "submit" detected!
   // Application refuses to start
   ```

3. **Auto-Detected Context**:
   ```typescript
   // File: pages/auth/dashboard/settings/Profile.tsx
   @Tool({ toolId: 'edit-profile' })
   // Context auto-inferred from file path
   // OR reads NavigationContext at runtime
   // OR learned from DOM observation
   ```

---

## Migration Guide

### For Existing Code Using `testId`

#### Automatic Migration (Temporary)
```typescript
// This will work but show warnings
@Tool({ testId: 'old-tool' })
async oldTool() { }

// Output:
// ⚠️  DEPRECATED: "testId" in @Tool decorator is deprecated.
//    Location: MyProvider.oldTool
//    Current:  @Tool({ testId: 'old-tool' })
//    Replace:  @Tool({ toolId: 'old-tool' })
//    Auto-migrated for now, but please update your code.
```

#### Manual Migration (Recommended)
```diff
-@Tool({ testId: 'my-tool', aiEnabled: true })
+@Tool({ toolId: 'my-tool', aiEnabled: true })
```

```diff
-const state = collector.getToolState(tool.testId);
+const state = collector.getToolState(tool.toolId);
```

### For Tests Using Hardcoded Strings

#### Before (Fragile)
```typescript
await page.click('[data-testid="toggle-feature"]');
// If decorator changes, test breaks silently
```

#### After (Robust)
```typescript
import { TOOL_IDS } from './generated-tool-ids';

await page.click(`[data-tool-id="${TOOL_IDS.TOGGLE_FEATURE}"]`);
// Always matches decorator, TypeScript validated
```

---

## REQ-004 vs REQ-005 Relationship

**Confirmed**: These are **complementary, not overlapping**

| Aspect | REQ-004 (State Detection) | REQ-005 (Navigation) |
|--------|---------------------------|---------------------|
| **Question** | "Can I click this button?" | "How do I get to this page?" |
| **Scope** | DOM element state | Application navigation state |
| **Detection** | IntersectionObserver, MutationObserver | Context detection, path-finding |
| **Output** | NOT_PRESENT → INTERACTABLE | Navigation path (button sequence) |
| **Purpose** | Wait for tool readiness | Navigate to tool location |

**They work together**:
```typescript
// REQ-005: Find where tool is, navigate there
const path = NavigationGraph.computePath(current, target);
await NavigationGraph.executeNavigation(path);

// REQ-004: Wait for tool to become interactable
await ExposureCollector.waitForState(toolId, INTERACTABLE, 5000);

// Execute
await ToolRegistry.executeTool(toolId);
```

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. ✅ Add `toolId` duplication detection to Tool decorator
2. ✅ Add deprecation warnings for `testId`
3. ✅ Create auto-migration path (`testId` → `toolId`)

### Phase 2: DRY Tooling (Week 1-2)
4. Create `extract-tool-ids.ts` build script
5. Generate `generated-tool-ids.ts` from decorators
6. Update tests to use generated constants

### Phase 3: Context Auto-Detection (Week 2-3)
7. Implement convention-based context (file path analysis)
8. Add NavigationContext React provider
9. Create ContextScanner for DOM observation

### Phase 4: Integration (Week 3-4)
10. Update DemoAIInterface to use REQ-004 state checks
11. Add NavigationGraph to demo
12. Demonstrate end-to-end auto-navigation

---

## Files Modified

### Requirements
- ✅ `supernal-coding/requirements/REQ-004-state-dependent-tool-exposure.md`
  - Replaced all `testId` → `toolId` in scenarios and code examples
  - Added "Tool ID Duplication Detection" section
  - Added Gherkin scenarios for duplication detection and auto-generation

- ✅ `supernal-coding/requirements/REQ-005-context-aware-navigation.md`
  - Replaced all `testId` → `toolId` in interfaces
  - Replaced manual `contextPath` with "Context Discovery (Auto-Detection)" section
  - Added three-strategy auto-detection design (convention, React context, DOM observation)

### New Documentation
- ✅ `REQ-004-005-IMPROVEMENTS.md` (this file)

---

## Next Steps

1. **Implement duplication detection** in `core/src/decorators/Tool.ts`
2. **Create build script** `scripts/extract-tool-ids.ts`
3. **Update demo** to use auto-generated constants
4. **Add NavigationContext** to demo pages
5. **Test end-to-end**: AI navigates to tool, waits for readiness, executes

---

## Questions Answered

### ❓ "They're not tabs, they're program states, right?"
✅ **Correct!** Updated all documentation to refer to "program states" or "application contexts" rather than "tabs." The demo uses React state (`currentPage`), not actual tabs or routes.

### ❓ "Ensure we're not planning something silly or unnecessary"
✅ **Validated**: REQ-004 and REQ-005 are complementary, not overlapping. They address different problems:
- REQ-004: "Is this tool ready?" (DOM state)
- REQ-005: "How do I get there?" (Application state)

### ❓ "What about XState?"
✅ **Decision**: Start with lightweight custom state machine (~200 lines). Evaluate XState later if complexity grows. XState is MIT licensed and would work, but we can handle the current use case without the dependency.

### ❓ "Playwright doesn't 'find them' - tests have to point"
✅ **Fixed**: Auto-generate tool ID constants from decorators. Tests import `TOOL_IDS.TOGGLE_FEATURE` instead of hardcoding strings. DRY problem solved.

### ❓ "Is there toolID duplication checks?"
✅ **Added**: Runtime detection throws error at startup. Build-time validation script. Added to REQ-004 with Gherkin scenarios.

### ❓ "You mentioned 'testID' as state in tools, why?"
✅ **Fixed**: Replaced all `testId` → `toolId` throughout both requirements. Added deprecation warnings and auto-migration for legacy code.

### ❓ "You have to write the contextPath? That seems unmaintainable"
✅ **Removed**: Three-strategy auto-detection system:
1. Convention-based (file path = context)
2. React Component Tree (NavigationContext)
3. DOM Observation (self-learning)

Zero manual configuration required.

---

## Status: ✅ Complete

All identified issues addressed. Requirements updated. Ready for implementation.


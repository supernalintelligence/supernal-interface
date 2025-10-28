# Advanced Demo Integration Plan

**Date**: 2025-10-27  
**Status**: Implementation Ready  

---

## Overview

This document outlines the integration of REQ-004 (state-dependent tool exposure) and REQ-005 (context-aware navigation) into the demo application to demonstrate production-quality patterns.

**Core APIs Implemented**: ✅
- `ExposureCollector` - Production singleton for real-time tool state detection
- `NavigationGraph` - Production singleton for A→B pathfinding and context discovery
- Full type definitions in `@supernal-interface/core`

---

## Demo Enhancements Needed

### Current State
- Flat 5-page navigation (Home, Demo, Dashboard, Docs, Examples)
- All tools always visible/interactable
- No nested contexts
- Simple React state: `const [currentPage, setCurrentPage] = useState('home')`

### Required Enhancements

#### 1. **Modal-Gated Tools** (REQ-004 Demo)
Shows tools that are NOT_PRESENT → INTERACTABLE based on modal state.

**Implementation**:
```tsx
// Dashboard.tsx
const [settingsModalOpen, setSettingsModalOpen] = useState(false);

<button onClick={() => setSettingsModalOpen(true)}>Settings</button>

{settingsModalOpen && (
  <SettingsModal onClose={() => setSettingsModalOpen(false)}>
    {/* Tools inside modal auto-register with ExposureCollector */}
    <SaveSettingsButton /> {/* toolId: 'save-settings' */}
  </SettingsModal>
)}
```

**AI Behavior**:
- User: "Save my settings"
- AI: Tool `save-settings` is NOT_PRESENT
- AI: Waits for tool to become INTERACTABLE
- AI: Opens settings modal
- Tool becomes PRESENT → VISIBLE → EXPOSED → INTERACTABLE
- AI: Executes `save-settings`

#### 2. **Tab-Gated Tools** (REQ-005 Demo)
Shows tools in nested contexts requiring navigation.

**Implementation**:
```tsx
// Dashboard.tsx
const [dashboardTab, setDashboardTab] = useState('overview');

<Tabs value={dashboardTab} onChange={setDashboardTab}>
  <Tab value="overview" data-nav-context="dashboard.overview">
    <OverviewTools />
  </Tab>
  <Tab value="security" data-nav-context="dashboard.security">
    <SecurityTools /> {/* toolId: 'enable-2fa', 'revoke-tokens' */}
  </Tab>
</Tabs>
```

**Context Graph**:
```
global
  └─ dashboard
       ├─ dashboard.overview
       └─ dashboard.security
```

**AI Behavior**:
- User: "Enable two-factor authentication"
- AI: Tool `enable-2fa` is in context `dashboard.security`
- AI: Current context is `dashboard.overview`
- AI: Computes path: overview → security (1 step)
- AI: Clicks "Security" tab
- AI: Waits for context change
- AI: Executes `enable-2fa`

#### 3. **Conditional Rendering** (REQ-004 Advanced)
Shows tools that appear/disappear based on application state.

**Implementation**:
```tsx
// EditProfileForm.tsx
const [formDirty, setFormDirty] = useState(false);

<input onChange={() => setFormDirty(true)} />

{formDirty && (
  <button data-tool-id="save-profile">
    Save Changes
  </button>
)}
```

**AI Behavior**:
- User: "Save my profile changes"
- AI: Tool `save-profile` is NOT_PRESENT
- AI: Detects form needs to be dirty first
- AI: Types into form fields
- Tool becomes PRESENT → INTERACTABLE
- AI: Executes `save-profile`

---

## Implementation Phases

### Phase 1: Core API Integration (Week 1)
**Goal**: Wire up ExposureCollector and NavigationGraph in demo

**Tasks**:
1. Create `useExposureCollector()` React hook
2. Create `useNavigationContext()` React hook
3. Update `@Tool` decorator usage to register with both systems
4. Add `data-tool-id` and `data-nav-context` attributes to demo components

**Files to Modify**:
- `core/demo/src/hooks/useExposureCollector.ts` (new)
- `core/demo/src/hooks/useNavigationContext.ts` (new)
- `core/demo/src/providers/DemoToolProviders.ts` (update decorators)

### Phase 2: Demo Enhancements (Week 2)
**Goal**: Add modal, tabs, and conditional rendering

**Tasks**:
1. Add Settings Modal to Dashboard page
2. Add tabbed interface to Dashboard (Overview, Security tabs)
3. Add conditional Save button to profile form
4. Register navigation edges in NavigationGraph

**Files to Create**:
- `core/demo/src/components/SettingsModal.tsx`
- `core/demo/src/components/DashboardTabs.tsx`
- `core/demo/src/components/SecurityTools.tsx`

**Files to Modify**:
- `core/demo/src/pages/DashboardPage.tsx`

### Phase 3: AI Interface Integration (Week 3)
**Goal**: Make DemoAIInterface use REQ-004 and REQ-005

**Tasks**:
1. Update `DemoAIInterface.executeCommand()` to wait for tool state
2. Integrate navigation path computation
3. Add automatic navigation execution
4. Add state/context logging to AI command history

**Files to Modify**:
- `core/demo/src/lib/AIInterface.ts` (main integration point)

**Key Changes**:
```typescript
// In DemoAIInterface.executeCommand()
async executeCommand(command: AICommand): Promise<AIResponse> {
  const toolId = command.tool.toolId;
  
  // REQ-005: Navigate if needed
  const targetContext = NavigationGraph.getInstance().getToolContext(toolId);
  const currentContext = NavigationGraph.getInstance().getCurrentContext();
  
  if (targetContext && targetContext !== currentContext) {
    const path = NavigationGraph.getInstance().computePath(currentContext, targetContext);
    
    if (!path) {
      return { success: false, message: `Cannot navigate to ${targetContext}` };
    }
    
    // Execute navigation steps
    for (const step of path.steps) {
      await this.executeNavigationStep(step);
    }
  }
  
  // REQ-004: Wait for tool to be ready
  const ready = await ExposureCollector.getInstance()
    .waitForState(toolId, ExposureState.INTERACTABLE, 5000);
  
  if (!ready) {
    const state = ExposureCollector.getInstance().getToolState(toolId);
    return {
      success: false,
      message: `Tool not ready. State: ${ExposureState[state?.state || 0]}`
    };
  }
  
  // Execute tool
  return await this.executeToolMethod(command.tool, command.parameters);
}
```

### Phase 4: Auto-Generated Testing & Documentation (Week 4)
**Goal**: Auto-generate Playwright tests and document usage

**Tasks**:
1. **Auto-generate Playwright tests** from ToolRegistry metadata
2. Run generated tests to verify all scenarios
3. Update demo documentation
4. Create video walkthrough
5. Add inline code comments explaining patterns

**Test Auto-Generation Strategy**:
```typescript
// All tools already have metadata for test generation
@Tool({
  toolId: 'save-settings',
  elementType: 'button',      // Auto-inferred from method name
  actionType: 'click',         // Auto-inferred from method name
  generateStories: true,       // Default: true
  executionContext: 'ui'
})

// TestGenerator reads ToolRegistry and generates Playwright tests
import { TestGenerator } from '@supernal-interface/core';
import { ToolRegistry } from '@supernal-interface/core';

const generator = new TestGenerator();
const allTools = ToolRegistry.getAllTools();

// Generates tests that include:
// 1. Navigation to correct context (from NavigationGraph)
// 2. Wait for tool state (from ExposureCollector)
// 3. Execute tool action
// 4. Verify results

const playwrightTests = generator.generatePlaywrightTests(allTools, {
  includeNavigation: true,     // Use NavigationGraph for auto-navigation
  includeStateChecks: true,    // Use ExposureCollector for state verification
  outputDir: 'tests/generated'
});
```

**Generated Test Example**:
```typescript
// Auto-generated from @Tool metadata
test('save-settings: Modal-gated tool execution', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Auto-generated from NavigationGraph
  const targetContext = 'dashboard.settings';
  const currentContext = 'dashboard';
  
  // Navigate: dashboard → dashboard.settings
  await page.click('[data-tool-id="open-settings-modal"]');
  await page.waitForSelector('[data-nav-context="dashboard.settings"]', { state: 'visible' });
  
  // Auto-generated from ExposureCollector metadata
  await page.waitForSelector('[data-tool-id="save-settings"]', { state: 'visible' });
  await page.waitForSelector('[data-tool-id="save-settings"]:not([disabled])', { state: 'attached' });
  
  // Execute tool
  await page.click('[data-tool-id="save-settings"]');
  
  // Verify (from tool's outputSchema or expectations)
  await expect(page.locator('.success-message')).toBeVisible();
});
```

**Benefits**:
- ✅ **Zero manual test writing** for standard tool interactions
- ✅ **Test coverage matches actual tools** (can't forget to test a tool)
- ✅ **Navigation tests auto-generated** from NavigationGraph
- ✅ **State transition tests auto-generated** from ExposureCollector
- ✅ **Tests stay in sync** with tool metadata

---

## Navigation Graph Example

**Demo Navigation Structure**:
```
global
  ├─ home
  ├─ demo
  ├─ dashboard
  │    ├─ dashboard.overview (tab)
  │    ├─ dashboard.security (tab)
  │    └─ dashboard.settings (modal)
  ├─ docs
  └─ examples
```

**Edges**:
```typescript
// Page navigation (always available)
{ from: 'global', to: 'home', navigationTool: 'nav-home' }
{ from: 'global', to: 'demo', navigationTool: 'nav-demo' }
{ from: 'global', to: 'dashboard', navigationTool: 'nav-dashboard' }
{ from: 'global', to: 'docs', navigationTool: 'nav-docs' }
{ from: 'global', to: 'examples', navigationTool: 'nav-examples' }

// Dashboard tabs (only when on dashboard page)
{ from: 'dashboard', to: 'dashboard.overview', navigationTool: 'tab-overview' }
{ from: 'dashboard', to: 'dashboard.security', navigationTool: 'tab-security' }

// Settings modal (conditional)
{ from: 'dashboard', to: 'dashboard.settings', navigationTool: 'open-settings-modal' }
```

---

## Tool Registration Examples

### Modal-Gated Tool
```typescript
@ToolProvider({ name: 'SettingsProvider' })
class SettingsProvider {
  @Tool({
    toolId: 'save-settings',
    name: 'Save Settings',
    aiEnabled: true,
    executionContext: 'ui',
  })
  async saveSettings() {
    // Register with ExposureCollector when component mounts
    // Auto-detected context: 'dashboard.settings' (from modal)
  }
}
```

### Tab-Gated Tool
```typescript
@ToolProvider({ name: 'SecurityProvider' })
class SecurityProvider {
  @Tool({
    toolId: 'enable-2fa',
    name: 'Enable Two-Factor Authentication',
    aiEnabled: true,
  })
  async enable2FA() {
    // Auto-detected context: 'dashboard.security' (from tab)
  }
}
```

### Navigation Tool
```typescript
@ToolProvider({ name: 'NavigationProvider' })
class NavigationProvider {
  @Tool({
    toolId: 'tab-security',
    name: 'Navigate to Security Tab',
    aiEnabled: true,
  })
  async navigateToSecurityTab() {
    setDashboardTab('security');
    NavigationGraph.getInstance().setCurrentContext('dashboard.security');
  }
}
```

---

## Success Criteria

**REQ-004 Success**:
- ✅ Tools register with ExposureCollector on mount
- ✅ State changes emit events (NOT_PRESENT → INTERACTABLE)
- ✅ AI waits for tools to be ready before executing
- ✅ Modal tools detected as NOT_PRESENT when modal is closed

**REQ-005 Success**:
- ✅ NavigationGraph auto-detects contexts from file paths or attributes
- ✅ Tools register in correct contexts
- ✅ AI computes navigation paths (A → B)
- ✅ AI executes navigation steps automatically
- ✅ Context changes are detected and confirmed

---

## Testing Strategy

### Playwright Tests

**Test 1: Modal-Gated Tool Execution**
```typescript
test('AI opens modal before executing tool', async ({ page }) => {
  // Given: User is on dashboard page
  await page.goto('/dashboard');
  
  // When: AI command to save settings
  await aiInterface.executeCommand({ tool: { toolId: 'save-settings' } });
  
  // Then: Modal should open
  await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
  
  // Then: Settings should be saved
  await expect(page.locator('.success-message')).toContainText('Settings saved');
});
```

**Test 2: Tab Navigation Before Tool Execution**
```typescript
test('AI navigates to security tab before executing tool', async ({ page }) => {
  // Given: User is on dashboard overview tab
  await page.goto('/dashboard');
  
  // When: AI command to enable 2FA (in security tab)
  await aiInterface.executeCommand({ tool: { toolId: 'enable-2fa' } });
  
  // Then: Security tab should become active
  await expect(page.locator('[data-tab="security"]')).toHaveAttribute('aria-selected', 'true');
  
  // Then: 2FA should be enabled
  await expect(page.locator('.success-message')).toContainText('Two-factor authentication enabled');
});
```

**Test 3: Conditional Tool Availability**
```typescript
test('AI makes form dirty before saving', async ({ page }) => {
  // Given: User is on profile edit page
  await page.goto('/dashboard/profile');
  
  // When: AI command to save profile (save button initially hidden)
  await aiInterface.executeCommand({ tool: { toolId: 'save-profile' } });
  
  // Then: Form should have changes
  await expect(page.locator('[data-tool-id="save-profile"]')).toBeVisible();
  
  // Then: Profile should be saved
  await expect(page.locator('.success-message')).toContainText('Profile updated');
});
```

---

## Documentation Updates

**Files to Create**:
- `core/demo/README.md` - Overview of demo patterns
- `core/docs/guides/REQ-004-USAGE.md` - How to use ExposureCollector
- `core/docs/guides/REQ-005-USAGE.md` - How to use NavigationGraph
- `core/docs/guides/DEMO-WALKTHROUGH.md` - Video + step-by-step demo explanation

---

## Next Steps

1. **Implement Phase 1** - Core API integration with React hooks
2. **Create PRs** - Separate PRs for each phase
3. **Review & Test** - Ensure patterns are clear and work correctly
4. **Document** - Add inline comments and guides

**Estimated Timeline**: 4 weeks (1 week per phase)

---

## Notes

- Production APIs are complete and tested ✅
- Demo enhancements are intentionally minimal (3 scenarios)
- Each scenario demonstrates a unique pattern
- Infrastructure works for ANY app, demo just shows the patterns


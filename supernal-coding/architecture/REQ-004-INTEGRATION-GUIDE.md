# REQ-004 Integration Guide: Existing Demo → State-Dependent Tools

**Date**: 2025-01-27  
**Target**: Integrate exposure detection into working demo without breaking existing functionality

## Current State Analysis

### ✅ What's Already Working

**Providers with @Tool Methods** (`core/demo/src/providers/DemoToolProviders.ts`):
```typescript
// NavigationProvider
@Tool({ testId: 'open-main-menu', aiEnabled: true })
async openMainMenu() { /* working */ }

@Tool({ testId: 'navigate-to-docs', aiEnabled: true })
async navigateToDocs() { /* working */ }

// ChatProvider, DemoProvider, AdminProvider - all working
```

**Widget Controls** (`core/demo/src/lib/UIControls.ts`):
```typescript
@Tool({ testId: 'open-main-menu', aiEnabled: true })
async openMainMenu() { /* working */ }

@Tool({ testId: 'toggle-feature', aiEnabled: true })
async toggleFeature(enabled: boolean) { /* working */ }
// ... 8+ widget tools, all working
```

**AI Execution** (`core/demo/src/lib/AIInterface.ts`):
```typescript
async executeCommand(command: AICommand) {
  // Executes tools via executeToolMethod()
  // Uses switch statement for each tool
  // Currently works but can't detect if tool is ready
}
```

**UI Components**:
- `InteractiveWidgets.tsx` - Component zoo with buttons, checkboxes, etc. ✅
- `Header.tsx` - Navigation buttons ✅
- `index.tsx` - Main landing page with tabs ✅

### 🎯 What REQ-004 Adds

**New Capabilities** (without breaking existing code):
1. **Real-time tool state awareness** - Know when tools are available
2. **Intelligent waiting** - Don't execute tools until ready
3. **Better error messages** - "Button is loading" vs "Command failed"
4. **Tutorial support** - Highlight available actions
5. **Test reliability** - Validate state before asserting

## Non-Breaking Integration Strategy

### Phase 1: Foundation (Week 1) - Silent Addition

**Goal**: Add infrastructure, zero impact on existing functionality

**Files to Create**:
```
core/src/exposure/
├── ExposureAwareTool.ts        # Tool wrapper with observers
├── ExposureCollector.ts        # Central state registry
├── types.ts                    # ExposureState enum, interfaces
└── index.ts                    # Exports
```

**Implementation**:
```typescript
// core/src/exposure/ExposureAwareTool.ts
export class ExposureAwareTool {
  constructor(toolId: string, element: HTMLElement) {
    this.setupObservers();
    this.emitInitialState();
  }
  
  private setupObservers() {
    // IntersectionObserver for visibility
    // MutationObserver for attribute changes
    // Emit state changes to ExposureCollector
  }
}

// core/src/exposure/ExposureCollector.ts
export class ExposureCollector {
  private static instance: ExposureCollector;
  private stateRegistry = new Map<string, ToolStateEvent>();
  
  handleStateChange(event: ToolStateEvent) {
    this.stateRegistry.set(event.toolId, event);
    this.notifySubscribers(event);
  }
  
  async waitForState(toolId: string, targetState: ExposureState, timeout = 5000) {
    // Returns promise that resolves when tool reaches target state
  }
}
```

**Auto-Wrap in Components**:
```typescript
// In InteractiveWidgets.tsx - ADD useEffect
useEffect(() => {
  // Auto-wrap all tool elements
  const toolIds = [
    'open-main-menu', 'close-main-menu', 'navigate-to-docs',
    'toggle-feature', 'toggle-notifications', 'set-priority',
    'set-status', 'set-theme'
  ];
  
  const wrappers = toolIds.map(id => {
    const element = document.querySelector(`[data-testid="${id}"]`);
    if (element) {
      return new ExposureAwareTool(id, element as HTMLElement);
    }
  }).filter(Boolean);
  
  return () => wrappers.forEach(w => w.destroy());
}, []);
```

**Result**: State events emit, but nothing consumes them yet. Existing functionality unchanged.

### Phase 2: Enhanced AI (Week 2) - Smart Execution

**Goal**: Make AI commands wait for tools to be ready

**Files to Modify**:
```
core/demo/src/lib/AIInterface.ts    # Add state checking
```

**Implementation**:
```typescript
// In DemoAIInterface.executeCommand() - BEFORE execution
async executeCommand(command: AICommand, approved: boolean = false): Promise<AIResponse> {
  const tool = command.tool;
  
  // NEW: Check if tool has a UI element and verify its state
  if (tool.testId) {
    const collector = ExposureCollector.getInstance();
    const toolState = collector.getToolState(tool.testId);
    
    if (toolState && toolState.state < ExposureState.INTERACTABLE) {
      // Tool exists but isn't ready - wait for it
      const ready = await collector.waitForState(
        tool.testId,
        ExposureState.INTERACTABLE,
        5000  // 5 second timeout
      );
      
      if (!ready) {
        return {
          success: false,
          message: `⏱️ Tool "${tool.name}" is not ready yet. ` +
                   `Current state: ${this.getStateDescription(toolState.state)}. ` +
                   `${toolState.metadata?.reason || ''}`,
          confidence: 0,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
  
  // EXISTING: Execute tool method (unchanged)
  const result = await this.executeToolMethod(tool, parameters);
  // ... rest of existing code
}

private getStateDescription(state: ExposureState): string {
  switch(state) {
    case ExposureState.NOT_PRESENT: return 'Element not found';
    case ExposureState.PRESENT: return 'Element exists but not visible';
    case ExposureState.VISIBLE: return 'Element visible but not ready';
    case ExposureState.EXPOSED: return 'Element loading';
    case ExposureState.INTERACTABLE: return 'Ready';
    default: return 'Unknown state';
  }
}
```

**User Experience Improvements**:

**Before REQ-004**:
```
User: "navigate to docs"
AI: ❌ Failed to navigate [generic error]
```

**After REQ-004**:
```
User: "navigate to docs"
AI: ⏱️ Navigation button is loading, waiting...
AI: ✅ Navigated to documentation
```

**Result**: Existing commands work better with intelligent waiting and clear feedback.

### Phase 3: Tutorial & Testing (Week 3) - New Capabilities

**Goal**: Enable tutorial highlighting and test state validation

**Files to Create**:
```
core/demo/src/components/TutorialOverlay.tsx    # New component
core/demo/tests/state-aware.spec.ts             # State validation tests
```

**Tutorial Component**:
```typescript
export function TutorialOverlay({ currentStep }: Props) {
  const [highlightedTool, setHighlightedTool] = useState<ToolStateEvent | null>(null);
  
  useEffect(() => {
    const collector = ExposureCollector.getInstance();
    
    // Subscribe to tool state changes
    const unsubscribe = collector.subscribe((event) => {
      if (event.toolId === currentStep.toolId && 
          event.state === ExposureState.INTERACTABLE) {
        // Tool is ready - highlight it
        setHighlightedTool(event);
      }
    }, currentStep.toolId);
    
    return unsubscribe;
  }, [currentStep]);
  
  // Render spotlight at tool position
  if (highlightedTool?.metadata?.position) {
    return <Spotlight position={highlightedTool.metadata.position} />;
  }
}
```

**State-Aware Tests**:
```typescript
// core/demo/tests/state-aware.spec.ts
test('Navigation tools report correct states', async ({ page }) => {
  await page.goto('http://localhost:3011');
  
  // Inject exposure collector (or access via window)
  const toolState = await page.evaluate(() => {
    return window.ExposureCollector.getInstance()
      .getToolState('navigate-to-docs');
  });
  
  expect(toolState.state).toBeGreaterThanOrEqual(ExposureState.INTERACTABLE);
  
  // Now safe to interact
  await page.click('[data-testid="navigate-to-docs"]');
});
```

**Result**: New capabilities enabled without changing existing tools.

## File-by-File Integration Checklist

### Core Package (`core/src/`)

- [ ] Create `exposure/ExposureAwareTool.ts`
- [ ] Create `exposure/ExposureCollector.ts`
- [ ] Create `exposure/types.ts`
- [ ] Export from `core/src/index.ts`
- [ ] Export from `core/browser.ts` for demo use

### Demo (`core/demo/src/`)

**Phase 1: Foundation**
- [ ] Add auto-wrapping in `components/InteractiveWidgets.tsx`
- [ ] Add auto-wrapping in `pages/index.tsx` (for header buttons)
- [ ] Test that state events emit (console logging)

**Phase 2: Enhanced AI**
- [ ] Modify `lib/AIInterface.ts` - add state checking
- [ ] Add `getStateDescription()` helper
- [ ] Test "navigate to docs" waits correctly

**Phase 3: Tutorial**
- [ ] Create `components/TutorialOverlay.tsx` (optional)
- [ ] Create `tests/state-aware.spec.ts`

## Testing Strategy

### Unit Tests
```typescript
describe('ExposureAwareTool', () => {
  test('detects NOT_PRESENT when element missing', () => {
    // Element doesn't exist
    expect(tool.currentState).toBe(ExposureState.NOT_PRESENT);
  });
  
  test('transitions to VISIBLE when element appears', () => {
    // Add element to DOM
    expect(tool.currentState).toBe(ExposureState.VISIBLE);
  });
});
```

### Integration Tests
```typescript
describe('AI with state awareness', () => {
  test('waits for disabled button to enable', async () => {
    // Button starts disabled
    const promise = aiInterface.executeCommand({
      tool: { testId: 'submit-button', name: 'submit' }
    });
    
    // Enable button after 1 second
    setTimeout(() => button.disabled = false, 1000);
    
    const result = await promise;
    expect(result.success).toBe(true);
  });
});
```

### E2E Tests
```typescript
test('Navigate to docs with state validation', async ({ page }) => {
  await page.goto('http://localhost:3011');
  
  // Type command
  await page.fill('[data-testid="ai-input"]', 'navigate to docs');
  await page.press('[data-testid="ai-input"]', 'Enter');
  
  // Should wait if needed, then succeed
  await expect(page.locator('.ai-response'))
    .toContainText('Navigated to documentation');
});
```

## Risk Mitigation

### Risk: Breaking Existing Functionality
**Mitigation**: 
- Phase 1 adds code but doesn't consume it
- Existing `executeToolMethod()` unchanged
- State checking is optional wrapper

### Risk: Performance Impact
**Mitigation**:
- Observers are efficient (browser-native)
- State map lookups are O(1)
- < 10ms overhead per state check

### Risk: State Detection Accuracy
**Mitigation**:
- Use proven browser APIs (IntersectionObserver, MutationObserver)
- Start with simple cases (disabled buttons)
- Add edge cases progressively

## Success Metrics

### Phase 1 Complete When:
- [ ] State events emit for all 15+ existing tools
- [ ] No regression in existing AI commands
- [ ] Console shows state transitions

### Phase 2 Complete When:
- [ ] "navigate to docs" waits if button disabled
- [ ] Better error messages for unavailable tools
- [ ] 100% of existing commands still work

### Phase 3 Complete When:
- [ ] Tutorial can highlight available tools
- [ ] Tests validate state before assertions
- [ ] All 15 Gherkin scenarios pass

## Key Principles

1. **Non-Breaking**: Existing code works unchanged
2. **Opt-In Enhancement**: State checking enhances but doesn't require changes
3. **Progressive Enhancement**: Add capabilities in phases
4. **Backward Compatible**: Tools without testIds work as before

---

**Ready to implement REQ-004 without breaking the working demo!**


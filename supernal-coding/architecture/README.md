# Architecture Documentation

This directory contains detailed architecture documents that support the requirements defined in `../requirements/`.

## Documents

### Implementation Plans

- **[ADVANCED-DEMO-INTEGRATION.md](ADVANCED-DEMO-INTEGRATION.md)** ⭐ **START HERE**
  - **Current Status**: Ready for implementation
  - Complete integration plan for REQ-004 and REQ-005
  - 4-week phased implementation approach
  - 3 realistic demo scenarios (modal-gated, tab-gated, conditional rendering)
  - React hooks, Playwright tests, and code examples
  - **This is the main document to follow for demo enhancements**

### Core Architecture

- **[REQ-004-005-IMPROVEMENTS.md](REQ-004-005-IMPROVEMENTS.md)**
  - Summary of improvements to REQ-004 and REQ-005
  - Terminology corrections (`testId` → `toolId`)
  - Tool ID duplication detection design
  - Auto-context detection strategies
  - Migration guide for existing code

- **[USER-COMMAND-TO-EXECUTION-FLOW.md](USER-COMMAND-TO-EXECUTION-FLOW.md)**
  - Complete end-to-end flow from user command to tool execution
  - Shows how DemoAIInterface integrates with NavigationGraph and ExposureCollector
  - Visual flow diagrams
  - 4 detailed user scenarios
  - Integration with REQ-004 (state detection) and REQ-005 (navigation)

### Technical Analysis

- **[REQ-005-NAVIGATION-ANALYSIS.md](REQ-005-NAVIGATION-ANALYSIS.md)**
  - Feasibility analysis for context-aware navigation
  - Why it works for simple demos (4 tabs) vs. complex SPAs
  - Technical implementation strategies
  - Graph complexity analysis
  - Challenge identification and solutions

- **[COMPLETE_INTEGRATION_PLAN.md](COMPLETE_INTEGRATION_PLAN.md)**
  - Integration strategy for REQ-004 with existing demo
  - Non-breaking integration approach
  - Phase-by-phase implementation plan
  - Backward compatibility considerations

- **[STATE_DEPENDENT_TOOLS_PLAN.md](STATE_DEPENDENT_TOOLS_PLAN.md)**
  - Initial planning document for REQ-004
  - Problem statement and solution approach
  - Early design decisions

### Historical / Reference

- **[CONSOLIDATION_SUMMARY.md](CONSOLIDATION_SUMMARY.md)**
  - Summary of documentation consolidation work
  - Files moved and reorganized
  - Historical reference

## Relationship to Requirements

These architecture documents are **referenced by** requirements but contain **implementation details** that don't belong in requirement specs:

- **Requirements** (`../requirements/`): WHAT needs to be built, acceptance criteria, user stories
- **Architecture** (this directory): HOW to build it, technical decisions, implementation strategies

## Document Status

| Document | Status | Last Updated |
|----------|--------|--------------| 
| ADVANCED-DEMO-INTEGRATION.md | ✅ Ready to Implement | 2025-10-27 |
| REQ-004-005-IMPROVEMENTS.md | ✅ Complete | 2025-10-27 |
| USER-COMMAND-TO-EXECUTION-FLOW.md | ✅ Complete | 2025-10-27 |
| REQ-005-NAVIGATION-ANALYSIS.md | ✅ Complete | 2025-10-27 |
| COMPLETE_INTEGRATION_PLAN.md | ✅ Complete | 2025-01-27 |
| STATE_DEPENDENT_TOOLS_PLAN.md | ✅ Complete | 2025-10-27 |
| CONSOLIDATION_SUMMARY.md | 📚 Historical | 2025-10-27 |

## How to Use

1. **Starting implementation?** Read the relevant architecture doc for technical approach
2. **Need to understand flow?** See `USER-COMMAND-TO-EXECUTION-FLOW.md`
3. **Planning demo changes?** Review `DEMO-ENHANCEMENT-PLAN.md`
4. **Migrating code?** Check `REQ-004-005-IMPROVEMENTS.md` for migration guide

## Updates

When requirements change or new technical decisions are made:
1. Update the relevant architecture document
2. Reference it from the requirement
3. Update this README if new documents are added


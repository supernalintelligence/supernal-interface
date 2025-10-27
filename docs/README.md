# Supernal Interface Core - Documentation Index

**Last Updated**: 2025-01-27  
**Package**: `@supernal-interface/core`  
**Version**: 1.0.0

## 📚 Primary Documentation

### [ARCHITECTURE.md](./ARCHITECTURE.md) ⭐
**The definitive architecture and design document**

Complete system architecture covering:
- Tool decorator system (enhanced from supernal-command)
- Event-driven exposure detection
- Universal execution engines (Playwright, DOM, API)
- Natural language AI integration
- Auto-generated testing infrastructure
- Gherkin workflow chains
- Tutorial orchestration
- Demo system requirements

**Start here** for understanding the complete system design.

## 🎯 Requirements Documentation

Located in: `/supernal-coding/requirements/`

### [EPIC-supernal-interface-demo-system.md](../../supernal-coding/requirements/EPIC-supernal-interface-demo-system.md)
The main epic defining the demo system that showcases three interaction paradigms:
1. Interactive UI widgets with `@Tool` decorators
2. Extracted tool commands interface
3. Natural language chat interface

### Core Requirements

- **[REQ-001: Interactive UI Widgets](../../supernal-coding/requirements/REQ-001-interactive-ui-widgets.md)**  
  Status: In Progress | Priority: High  
  Component zoo of standard UI elements directly wrapped with `@Tool` decorators.

- **[REQ-002: Extracted Tool Commands](../../supernal-coding/requirements/REQ-002-extracted-tool-commands.md)**  
  Status: Draft | Priority: High | Depends: REQ-001  
  Discoverable interface showing all registered tools with programmatic execution.

- **[REQ-003: Natural Language Chat Interface](../../supernal-coding/requirements/REQ-003-natural-language-chat-interface.md)**  
  Status: Draft | Priority: High | Depends: REQ-001, REQ-002  
  Conversational interface for tool control via natural language.

## 📖 Legacy Documentation

The following documents are being consolidated or deprecated:

### Active Legacy Docs

- **COMPLETE_IMPLEMENTATION.md** - Early implementation details (being superseded by ARCHITECTURE.md)
- **DESIGN.md** - Original design concepts (incorporated into ARCHITECTURE.md)
- **IMPLEMENTATION.md** - Implementation notes (being consolidated)
- **SIMPLIFIED_ARCHITECTURE_SUMMARY.md** - Earlier architecture summary (superseded)
- **UNIFIED_ARCHITECTURE_DESIGN.md** - Unified design attempt (consolidated into ARCHITECTURE.md)
- **UNIFIED_SYSTEM_COMPLETE.md** - System completion notes (being reviewed)
- **SUPERNAL_COMMAND_INTEGRATION_REPORT.md** - Integration analysis (incorporated into ARCHITECTURE.md)

### Archived Planning Docs

Located in: `/core/docs/archive/`

- **AI_TOOL_AND_TEST_SYSTEM.md** - Original planning document
- **AI_TOOL_AND_TEST_SYSTEM_UNIVERSAL.md** - Universal vision expansion
- **SUPERNAL_INTERFACE_PLAN.md** - Comprehensive implementation plan

See [archive/README.md](./archive/README.md) for details on archived documents.

## 🗺️ Documentation Roadmap

### Immediate (Week 1-2)
- [ ] Create GETTING_STARTED.md with quick start guide
- [ ] Create API_REFERENCE.md with complete API documentation
- [ ] Create EXAMPLES.md with common usage patterns
- [ ] Review and consolidate legacy docs into ARCHITECTURE.md

### Short Term (Week 3-4)
- [ ] Create CONTRIBUTING.md for contributors
- [ ] Create TESTING.md for test strategy and patterns
- [ ] Create DEPLOYMENT.md for deployment guidelines
- [ ] Archive fully superseded legacy docs

### Medium Term (Week 5-8)
- [ ] Generate API documentation from TypeScript definitions
- [ ] Create tutorial series for different use cases
- [ ] Create video walkthroughs of demo system
- [ ] Create migration guide from supernal-command

## 📂 Directory Structure

```
@supernal-interface/
├── core/
│   ├── src/                    # Source code
│   ├── docs/                   # Documentation (you are here)
│   │   ├── ARCHITECTURE.md     # ⭐ Main architecture doc
│   │   ├── README.md           # This index
│   │   ├── archive/            # Archived planning docs
│   │   └── [legacy docs]       # Being consolidated
│   └── demo/                   # Demo application
├── supernal-coding/
│   └── requirements/           # BDD requirements
│       ├── EPIC-*.md          # Epic definitions
│       ├── REQ-*.md           # Requirements
│       └── ARCHIVE/           # Archived requirements
└── [other packages]
```

## 🔍 Finding Information

### I want to understand...

- **The overall system architecture** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **How to use the @Tool decorator** → [ARCHITECTURE.md#tool-decorator-system](./ARCHITECTURE.md#tool-decorator-system)
- **How exposure detection works** → [ARCHITECTURE.md#exposure-detection--state-management](./ARCHITECTURE.md#exposure-detection--state-management)
- **How to integrate AI** → [ARCHITECTURE.md#natural-language-integration](./ARCHITECTURE.md#natural-language-integration)
- **How testing works** → [ARCHITECTURE.md#auto-generated-testing](./ARCHITECTURE.md#auto-generated-testing)
- **The demo requirements** → [EPIC-supernal-interface-demo-system.md](../../supernal-coding/requirements/EPIC-supernal-interface-demo-system.md)

### I want to implement...

- **A new @Tool decorated method** → Coming: GETTING_STARTED.md
- **Custom execution context** → Coming: API_REFERENCE.md
- **Gherkin test scenarios** → Coming: TESTING.md
- **Tutorial workflows** → [ARCHITECTURE.md#tutorial-orchestration](./ARCHITECTURE.md#tutorial-orchestration)

## 🤝 Contributing to Documentation

When updating documentation:

1. **Primary updates go to ARCHITECTURE.md** - Single source of truth
2. **Requirements use Gherkin format** - See EPIC and REQ files for examples
3. **Archive old docs** - Don't delete, move to archive/ with README
4. **Update this index** - Keep the roadmap current
5. **Use `sc` commands** - Leverage supernal-coding tools when possible

### Using Supernal Coding Tools

```bash
# Validate requirements
sc req validate REQ-001

# View requirement
sc req show REQ-001

# List all requirements
sc req list

# Generate documentation
sc docs generate
```

## 📞 Getting Help

- **Architecture questions** - See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Requirements questions** - See [EPIC](../../supernal-coding/requirements/EPIC-supernal-interface-demo-system.md)
- **Implementation questions** - Coming: EXAMPLES.md
- **Bug reports** - Create GitHub issue with `sc suggest-bug`
- **Feature requests** - Create GitHub issue with `sc suggest-feature`

---

**Note**: This documentation structure is actively being consolidated. The primary document is [ARCHITECTURE.md](./ARCHITECTURE.md), which supersedes all planning documents in the archive.


# Generated Tool Documentation

Generated: 2025-10-25T19:13:58.145Z

## Summary

- **Total Tools**: 3
- **AI-Enabled**: 2
- **Test-Only**: 1

## AI-Enabled Tools

### Click Login Button

- **Method**: `clickLoginButton()`
- **Test ID**: `demo-login-button`
- **Danger Level**: safe
- **Requires Approval**: No
- **Element Type**: button
- **Action Type**: click

**Description**: Click the login button

**Examples**:
- "click login"
- "press login button"
- "login now"

---

### Delete Account

- **Method**: `deleteAccount()`
- **Test ID**: `demo-delete-account`
- **Danger Level**: destructive
- **Requires Approval**: Yes
- **Element Type**: button
- **Action Type**: click

**Description**: Delete user account permanently

**Examples**:
- "delete account"
- "remove account"
- "destroy account"

---

## Test-Only Tools

### Fill Username

- **Method**: `fillUsername()`
- **Test ID**: `demo-username-input`
- **Danger Level**: moderate
- **Element Type**: input
- **Action Type**: type

**Description**: Fill username field

---

## Usage

### Simulation
```typescript
import { UniversalSimulation } from './generated/UniversalSimulation';

const simulation = new UniversalSimulation(page);
await simulation.clickLoginButton();
await simulation.fillUsername();
await simulation.deleteAccount();
```

### AI Interface
```typescript
import { UniversalAIInterface } from './generated/UniversalAIInterface';

const aiInterface = new UniversalAIInterface();
const tools = aiInterface.findToolsByQuery('click button');
```

### Stories
```typescript
import { UniversalStories } from './generated/UniversalStories';

const stories = new UniversalStories(simulation);
const results = await stories.runAllStories();
```

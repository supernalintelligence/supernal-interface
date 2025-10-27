/**
 * Story Templates - Reusable story patterns that work with any component naming
 */

import { StoryTemplate } from './StoryGenerator';

/**
 * Common story templates that can be used with any UI testing framework
 * These templates use patterns to match against available auto-generated methods
 */
export const COMMON_STORY_TEMPLATES: StoryTemplate[] = [
  // Basic interaction stories
  {
    name: 'basicMessage',
    description: 'Send a basic message in the chat interface',
    stepTemplates: [
      {
        actionPattern: '*ChatInput',
        params: ['Hello world!'],
        description: 'Type message in chat input',
      },
      { actionPattern: 'click:*Send*', description: 'Click send button' },
    ],
  },

  {
    name: 'openInterface',
    description: 'Open the main interface/sidebar',
    stepTemplates: [
      { actionPattern: 'click:*Sidebar*', description: 'Open sidebar' },
      {
        actionPattern: 'verify:*Input*',
        description: 'Verify input is focused',
        validation: 'verifyInputFocused',
      },
    ],
  },

  // Workspace/container management
  {
    name: 'createContainer',
    description: 'Create a new workspace/container',
    stepTemplates: [
      { actionPattern: 'click:*Creation*', description: 'Click creation button' },
      {
        actionPattern: 'type:*Name*',
        params: ['Test Container'],
        description: 'Enter container name',
      },
      { actionPattern: 'click:*Submit*', description: 'Submit creation form' },
    ],
  },

  // Navigation stories
  {
    name: 'navigateToNew',
    description: 'Navigate to create new item',
    stepTemplates: [
      { actionPattern: 'click:*New*', description: 'Click new item button' },
      { actionPattern: 'verify:*Form*', description: 'Verify form is visible' },
    ],
  },

  // Persistence stories
  {
    name: 'refreshPersistence',
    description: 'Verify data persists after page refresh',
    stepTemplates: [
      {
        actionPattern: 'type:*Input*',
        params: ['Test persistence'],
        description: 'Enter test data',
      },
      { actionPattern: 'click:*Save*', description: 'Save data' },
      // Note: Page refresh would be handled by test framework, not simulation
      { actionPattern: 'verify:*Input*', description: 'Verify data persisted' },
    ],
  },

  // Multi-step workflows
  {
    name: 'completeWorkflow',
    description: 'Complete a multi-step workflow',
    stepTemplates: [
      { actionPattern: 'click:*Start*', description: 'Start workflow' },
      { actionPattern: 'type:*Input*', params: ['Step 1 data'], description: 'Fill step 1' },
      { actionPattern: 'click:*Next*', description: 'Go to next step' },
      { actionPattern: 'type:*Input*', params: ['Step 2 data'], description: 'Fill step 2' },
      { actionPattern: 'click:*Complete*', description: 'Complete workflow' },
    ],
  },

  // Error handling
  {
    name: 'handleError',
    description: 'Handle error scenarios gracefully',
    stepTemplates: [
      { actionPattern: 'type:*Input*', params: [''], description: 'Enter invalid data' },
      { actionPattern: 'click:*Submit*', description: 'Submit form' },
      { actionPattern: 'verify:*Error*', description: 'Verify error message shown' },
    ],
  },
];

/**
 * Supernal-specific story templates (for migration from existing SimpleStories)
 */
export const SUPERNAL_STORY_TEMPLATES: StoryTemplate[] = [
  {
    name: 'helloMessage',
    description: 'Send hello message in Supernal chat',
    stepTemplates: [
      {
        actionPattern: 'typeChatInput',
        params: ['Hello world!'],
        description: 'Type hello message',
      },
      { actionPattern: 'click:*Send*', description: 'Send message' },
    ],
  },

  {
    name: 'newChatWithMessage',
    description: 'Create new chat and send message',
    stepTemplates: [
      { actionPattern: 'clickNewChatButton', description: 'Create new chat' },
      { actionPattern: 'typeChatInput', params: ['New chat message'], description: 'Type message' },
      { actionPattern: 'click:*Send*', description: 'Send message' },
    ],
  },

  {
    name: 'workspaceCreation',
    description: 'Create new workspace in Supernal',
    stepTemplates: [
      { actionPattern: 'clickWorkspaceCreationButton', description: 'Open workspace creation' },
      {
        actionPattern: 'typeWorkspaceNameInput',
        params: ['Development'],
        description: 'Enter workspace name',
      },
      { actionPattern: 'clickWorkspaceSubmitButton', description: 'Submit workspace creation' },
    ],
  },

  {
    name: 'sidebarAutoFocus',
    description: 'Verify sidebar auto-focuses chat input',
    stepTemplates: [
      { actionPattern: 'clickSidebar', description: 'Open sidebar' },
      {
        actionPattern: 'verify:*Focus*',
        description: 'Verify chat input focused',
        validation: 'verifyChatInputFocused',
      },
    ],
  },

  {
    name: 'contextAttachment',
    description: 'Attach context to chat message',
    stepTemplates: [
      { actionPattern: 'click:*Context*', description: 'Open context menu' },
      { actionPattern: 'select:*Context*', params: ['Notes'], description: 'Select context type' },
      {
        actionPattern: 'typeChatInput',
        params: ['Message with context'],
        description: 'Type message',
      },
      { actionPattern: 'click:*Send*', description: 'Send message with context' },
    ],
  },
];

/**
 * Get all available story templates
 */
export function getAllStoryTemplates(): StoryTemplate[] {
  return [...COMMON_STORY_TEMPLATES, ...SUPERNAL_STORY_TEMPLATES];
}

/**
 * Get story templates by category
 */
export function getStoryTemplatesByCategory(category: 'common' | 'supernal'): StoryTemplate[] {
  switch (category) {
    case 'common':
      return COMMON_STORY_TEMPLATES;
    case 'supernal':
      return SUPERNAL_STORY_TEMPLATES;
    default:
      return getAllStoryTemplates();
  }
}

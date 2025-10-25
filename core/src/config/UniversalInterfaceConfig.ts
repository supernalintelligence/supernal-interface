/**
 * Universal Interface Configuration
 */

import { UniversalConfig } from '../generators/UniversalGenerator';

export interface UniversalInterfaceConfig extends UniversalConfig {}

export const DEFAULT_CONFIG: UniversalConfig = {
  outputDir: 'src/generated',
  simulationClassName: 'UniversalSimulation',
  aiInterfaceClassName: 'UniversalAIInterface',
  storyClassName: 'UniversalStories',
  generateSimulation: true,
  generateAIInterface: true,
  generateStories: true,
  generateTests: false,
  generateDocumentation: true,
  overwriteExisting: false,
  framework: 'react'
};

export const FRAMEWORK_PRESETS: Record<string, Partial<UniversalConfig>> = {
  react: {
    outputDir: 'src/generated',
    framework: 'react'
  },
  vue: {
    outputDir: 'src/generated',
    framework: 'vue'
  },
  angular: {
    outputDir: 'src/generated',
    framework: 'angular'
  }
};

export function getFrameworkPreset(framework: string): Partial<UniversalConfig> {
  return FRAMEWORK_PRESETS[framework] || {};
}

export function createConfig(framework?: string, overrides: Partial<UniversalConfig> = {}): UniversalConfig {
  const preset = framework ? getFrameworkPreset(framework) : {};
  return { ...DEFAULT_CONFIG, ...preset, ...overrides };
}

export function validateConfig(config: UniversalInterfaceConfig): string[] {
  return [];
}

export class ConfigBuilder {
  private config: UniversalInterfaceConfig = { ...DEFAULT_CONFIG };
  
  build(): UniversalInterfaceConfig {
    return { ...this.config };
  }
}

export function configBuilder(): ConfigBuilder {
  return new ConfigBuilder();
}

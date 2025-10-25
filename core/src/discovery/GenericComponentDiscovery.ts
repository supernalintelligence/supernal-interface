/**
 * Generic Component Discovery - Framework-agnostic component discovery
 * 
 * This removes the tight coupling to "SUPERNAL_*" naming and makes the tool
 * usable with any component naming convention.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ComponentConstant {
  constantName: string;
  testId: string;
}

export interface DiscoveryConfig {
  constantPrefix?: string;      // Default: any uppercase constant
  constantPattern?: RegExp;     // Custom regex for constant matching
  testIdAttribute?: string;     // Default: 'data-testid'
  filePattern?: string;         // Default: 'ComponentNames.ts'
}

export class GenericComponentDiscovery {
  private componentNames = new Map<string, string>();
  private config: Required<DiscoveryConfig>;

  constructor(private componentNamesPath?: string, config: DiscoveryConfig = {}) {
    this.config = {
      constantPrefix: config.constantPrefix || '',
      constantPattern: config.constantPattern || /export const ([A-Z][A-Z_]*)\s*=\s*['"`]([^'"`]+)['"`]/g,
      testIdAttribute: config.testIdAttribute || 'data-testid',
      filePattern: config.filePattern || 'ComponentNames.ts'
    };
  }

  /**
   * Scan component constants file with configurable patterns
   */
  async scanComponentNames(filePath?: string): Promise<Map<string, string>> {
    const targetPath = filePath || this.componentNamesPath;
    
    if (!targetPath) {
      throw new Error(`${this.config.filePattern} path not provided`);
    }

    try {
      const content = await fs.readFile(targetPath, 'utf8');
      
      this.componentNames.clear();
      let match;
      while ((match = this.config.constantPattern.exec(content)) !== null) {
        const [, constantName, testId] = match;
        
        // Apply prefix filter if specified
        if (this.config.constantPrefix && !constantName.startsWith(this.config.constantPrefix)) {
          continue;
        }
        
        this.componentNames.set(testId, constantName);
      }
      
      return this.componentNames;
    } catch (error) {
      throw new Error(`Failed to scan ${this.config.filePattern}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all discovered component constants
   */
  getComponentNames(): Map<string, string> {
    return new Map(this.componentNames);
  }

  /**
   * Get component constants as array
   */
  getComponentConstants(): ComponentConstant[] {
    return Array.from(this.componentNames.entries()).map(([testId, constantName]) => ({
      testId,
      constantName
    }));
  }

  /**
   * Get discovery configuration
   */
  getConfig(): Required<DiscoveryConfig> {
    return { ...this.config };
  }
}

/**
 * Factory functions for common frameworks
 */
export class ComponentDiscoveryFactory {
  
  /**
   * Create discovery for Supernal Command components
   */
  static forSupernal(componentNamesPath?: string): GenericComponentDiscovery {
    return new GenericComponentDiscovery(componentNamesPath, {
      constantPrefix: 'SUPERNAL_',
      constantPattern: /export const (SUPERNAL_[A-Z_]+)\s*=\s*['"`]([^'"`]+)['"`]/g,
      testIdAttribute: 'data-testid',
      filePattern: 'ComponentNames.ts'
    });
  }

  /**
   * Create discovery for Material-UI components
   */
  static forMaterialUI(componentNamesPath?: string): GenericComponentDiscovery {
    return new GenericComponentDiscovery(componentNamesPath, {
      constantPrefix: 'MUI_',
      constantPattern: /export const (MUI_[A-Z_]+)\s*=\s*['"`]([^'"`]+)['"`]/g,
      testIdAttribute: 'data-testid',
      filePattern: 'ComponentIds.ts'
    });
  }

  /**
   * Create discovery for Ant Design components
   */
  static forAntDesign(componentNamesPath?: string): GenericComponentDiscovery {
    return new GenericComponentDiscovery(componentNamesPath, {
      constantPrefix: 'ANT_',
      constantPattern: /export const (ANT_[A-Z_]+)\s*=\s*['"`]([^'"`]+)['"`]/g,
      testIdAttribute: 'data-testid',
      filePattern: 'TestIds.ts'
    });
  }

  /**
   * Create discovery for any framework with custom config
   */
  static forFramework(config: DiscoveryConfig, componentNamesPath?: string): GenericComponentDiscovery {
    return new GenericComponentDiscovery(componentNamesPath, config);
  }

  /**
   * Create discovery that matches any uppercase constants (most flexible)
   */
  static forAnyFramework(componentNamesPath?: string): GenericComponentDiscovery {
    return new GenericComponentDiscovery(componentNamesPath, {
      constantPrefix: '',
      constantPattern: /export const ([A-Z][A-Z_]*)\s*=\s*['"`]([^'"`]+)['"`]/g,
      testIdAttribute: 'data-testid',
      filePattern: 'ComponentNames.ts'
    });
  }
}

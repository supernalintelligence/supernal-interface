/**
 * Component Discovery - Scans ComponentNames.ts for constants
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ComponentConstant {
  constantName: string; // SUPERNAL_CHAT_INPUT
  testId: string; // 'supernal-chat-input'
}

export class ComponentDiscovery {
  private componentNames = new Map<string, string>();

  constructor(private componentNamesPath?: string) {}

  /**
   * Scan ComponentNames.ts to extract all SUPERNAL_* constants
   */
  async scanComponentNames(filePath?: string): Promise<Map<string, string>> {
    const targetPath = filePath || this.componentNamesPath;

    if (!targetPath) {
      throw new Error('ComponentNames.ts path not provided');
    }

    try {
      const content = await fs.readFile(targetPath, 'utf8');
      const exportRegex = /export const (SUPERNAL_[A-Z_]+)\s*=\s*['"`]([^'"`]+)['"`]/g;

      this.componentNames.clear();
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        const [, constantName, testId] = match;
        this.componentNames.set(testId, constantName);
      }

      return this.componentNames;
    } catch (error) {
      throw new Error(
        `Failed to scan ComponentNames.ts: ${error instanceof Error ? error.message : String(error)}`
      );
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
      constantName,
    }));
  }
}

/**
 * Component Scanner - Scans React files for actual component usage
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ComponentUsage {
  element: string;        // 'button', 'input', 'textarea'
  props: string[];        // ['onClick', 'className']
  file: string;          // Relative file path
  constantName: string;   // SUPERNAL_CHAT_INPUT
  fullTag: string;       // JSX tag snippet
}

export class ComponentScanner {
  private componentNames = new Map<string, string>();
  private componentUsage = new Map<string, ComponentUsage>();

  /**
   * Set component names to scan for
   */
  setComponentNames(componentNames: Map<string, string>): void {
    this.componentNames = new Map(componentNames);
  }

  /**
   * Recursively find React files in directories
   */
  private async findReactFiles(dir: string, extensions = ['.tsx', '.jsx']): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.findReactFiles(fullPath, extensions));
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  /**
   * Scan directories for component usage
   */
  async scanDirectories(directories: string[]): Promise<Map<string, ComponentUsage>> {
    this.componentUsage.clear();

    for (const directory of directories) {
      const files = await this.findReactFiles(directory);
      
      for (const file of files) {
        await this.scanFile(file);
      }
    }

    return new Map(this.componentUsage);
  }

  /**
   * Scan individual React file for component usage
   */
  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Look for data-testid usage with ComponentNames constants
      for (const [testId, constantName] of this.componentNames) {
        if (content.includes(testId) || content.includes(constantName)) {
          const usage = this.extractComponentUsage(content, testId, constantName, filePath);
          if (usage) {
            this.componentUsage.set(testId, usage);
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  /**
   * Extract component usage details from file content
   */
  private extractComponentUsage(content: string, testId: string, constantName: string, filePath: string): ComponentUsage | null {
    // Look for JSX elements with this testId
    const patterns = [
      // <button data-testid={CONSTANT_NAME}
      new RegExp(`<(\\w+)[^>]*data-testid=\\{${constantName}\\}[^>]*>`, 'g'),
      // <button data-testid="test-id"
      new RegExp(`<(\\w+)[^>]*data-testid=["']${testId}["'][^>]*>`, 'g'),
    ];

    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        const element = matches[0][1].toLowerCase();
        
        // Extract the full JSX tag to analyze props
        const tagPattern = new RegExp(`<${matches[0][1]}[^>]*>`, 'g');
        const tagMatches = [...content.matchAll(tagPattern)];
        
        if (tagMatches.length > 0) {
          const fullTag = tagMatches[0][0];
          const props = this.extractProps(fullTag);
          
          return {
            element,
            props,
            file: path.relative(process.cwd(), filePath),
            constantName,
            fullTag: fullTag.substring(0, 200) + (fullTag.length > 200 ? '...' : '')
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract props from JSX tag
   */
  private extractProps(jsxTag: string): string[] {
    const props: string[] = [];
    
    // Common prop patterns
    const propPatterns = [
      /onClick\s*=/g,
      /onChange\s*=/g,
      /onKeyPress\s*=/g,
      /onSubmit\s*=/g,
      /type\s*=\s*["']([^"']+)["']/g,
      /role\s*=\s*["']([^"']+)["']/g,
      /className\s*=/g,
      /value\s*=/g,
      /placeholder\s*=/g
    ];

    for (const pattern of propPatterns) {
      const matches = [...jsxTag.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          props.push(`${match[0].split('=')[0]}="${match[1]}"`);
        } else {
          props.push(match[0].replace(/\s*=/g, ''));
        }
      });
    }

    return props;
  }

  /**
   * Get component usage results
   */
  getComponentUsage(): Map<string, ComponentUsage> {
    return new Map(this.componentUsage);
  }
}

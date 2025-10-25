/**
 * Inference Engine - Determines element types and actions from names and usage
 */

import { ComponentUsage } from './ComponentScanner';
import { ElementType, ActionType } from '../types';

export interface InferenceResult {
  elementType: ElementType;
  actionType: ActionType;
  confidence: number; // 0-100
  source: 'name' | 'usage' | 'hybrid';
}

export class InferenceEngine {
  
  /**
   * Infer element type and action from component name patterns
   */
  inferFromName(constantName: string, testId: string): InferenceResult {
    const name = constantName.toLowerCase();
    const id = testId.toLowerCase();
    
    // Button patterns
    if (name.includes('_button') || name.includes('_btn') || 
        id.includes('button') || id.includes('btn') ||
        name.includes('_close') || name.includes('_toggle') ||
        name.includes('_create') || name.includes('_send')) {
      return { elementType: ElementType.BUTTON, actionType: ActionType.CLICK, confidence: 85, source: 'name' };
    }
    
    // Input patterns  
    if (name.includes('_input') || id.includes('input') ||
        name.includes('_field') || id.includes('field')) {
      return { elementType: ElementType.INPUT, actionType: ActionType.TYPE, confidence: 80, source: 'name' };
    }
    
    // Textarea patterns
    if (name.includes('_chat_') && name.includes('_input')) {
      return { elementType: ElementType.TEXTAREA, actionType: ActionType.TYPE, confidence: 90, source: 'name' };
    }
    
    // Select/dropdown patterns
    if (name.includes('_selector') || name.includes('_dropdown') ||
        name.includes('_select') || id.includes('select') || id.includes('dropdown')) {
      return { elementType: ElementType.SELECT, actionType: ActionType.SELECT, confidence: 85, source: 'name' };
    }
    
    return { elementType: ElementType.DIV, actionType: ActionType.CLICK, confidence: 50, source: 'name' };
  }

  /**
   * Infer element type and action from actual component usage
   */
  inferFromUsage(usage: ComponentUsage): InferenceResult {
    const { element, props } = usage;
    
    // Direct element type mapping
    if (element === 'button') {
      return { elementType: ElementType.BUTTON, actionType: ActionType.CLICK, confidence: 100, source: 'usage' };
    }
    
    if (element === 'input') {
      const isTextInput = props.some(p => p.includes('type="text"') || p.includes('value'));
      return { 
        elementType: isTextInput ? ElementType.INPUT : ElementType.DIV,
        actionType: ActionType.TYPE,
        confidence: isTextInput ? 100 : 80,
        source: 'usage'
      };
    }
    
    if (element === 'textarea') {
      return { elementType: ElementType.TEXTAREA, actionType: ActionType.TYPE, confidence: 100, source: 'usage' };
    }
    
    if (element === 'select') {
      return { elementType: ElementType.SELECT, actionType: ActionType.SELECT, confidence: 100, source: 'usage' };
    }
    
    // Infer from props for complex components
    if (props.some(p => p.includes('role="listbox"'))) {
      return { elementType: ElementType.SELECT, actionType: ActionType.SELECT, confidence: 90, source: 'usage' };
    }
    
    if (props.some(p => p.includes('onClick'))) {
      return { elementType: ElementType.BUTTON, actionType: ActionType.CLICK, confidence: 70, source: 'usage' };
    }
    
    return { elementType: ElementType.DIV, actionType: ActionType.CLICK, confidence: 50, source: 'usage' };
  }

  /**
   * Hybrid inference: Start with name-based, validate with usage data
   */
  inferHybrid(constantName: string, testId: string, usage?: ComponentUsage): InferenceResult {
    const nameResult = this.inferFromName(constantName, testId);
    
    if (!usage) {
      return nameResult;
    }
    
    const usageResult = this.inferFromUsage(usage);
    
    // If usage data has high confidence and disagrees, use usage result
    if (usageResult.confidence >= 90 && usageResult.elementType !== nameResult.elementType) {
      return { ...usageResult, source: 'hybrid' };
    }
    
    // If both agree, use usage confidence
    if (usageResult.elementType === nameResult.elementType) {
      return { 
        ...usageResult, 
        confidence: Math.max(nameResult.confidence, usageResult.confidence),
        source: 'hybrid' 
      };
    }
    
    // If usage has higher confidence, use it
    if (usageResult.confidence > nameResult.confidence) {
      return { ...usageResult, source: 'hybrid' };
    }
    
    // Otherwise stick with name-based
    return { ...nameResult, source: 'hybrid' };
  }

  /**
   * Generate camelCase method name from constant and action
   */
  generateMethodName(constantName: string, actionType: ActionType): string {
    const baseName = constantName
      .replace(/^SUPERNAL_/, '')  // Remove SUPERNAL_ prefix
      .toLowerCase()
      .split('_')
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    return `${actionType}${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`;
  }
}

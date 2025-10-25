/**
 * Browser utilities for safe DOM access
 */

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function safeQuerySelector(selector: string): HTMLElement | null {
  if (!isBrowser()) return null;
  return document.querySelector(selector) as HTMLElement;
}

export function safeDispatchEvent(eventName: string, detail?: unknown): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

export function safeConfirm(message: string): boolean {
  if (!isBrowser()) return false;
  return window.confirm(message);
}

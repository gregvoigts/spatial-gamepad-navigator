// DOM element discovery module
// Finds and tracks focusable elements for spatial navigation

import { tabbable } from 'tabbable';
import { OBSERVER_TIMEOUT, VIEWPORT_MARGIN_HORIZONTAL, VIEWPORT_MARGIN_VERTICAL } from './constants';

/**
 * Navigation node representing a focusable element
 */
export interface NavNode {
  el: HTMLElement;
  rect: DOMRect;
  cx: number;
  cy: number;
}

/**
 * Extended MutationObserver with timeout property for debouncing
 */
interface DebouncedMutationObserver extends MutationObserver {
  timeout?: number;
}

/**
 * Creates a navigation node from an HTML element
 */
function createNode(el: Element): NavNode | null {
  const rect = el.getBoundingClientRect();
  
  // Filter out invisible or zero-size elements
  if (rect.width === 0 || rect.height === 0) {
    return null;
  }
  
  // Filter out elements outside viewport (with margin)
  if (rect.bottom < -VIEWPORT_MARGIN_VERTICAL || 
      rect.top > window.innerHeight + VIEWPORT_MARGIN_VERTICAL ||
      rect.right < -VIEWPORT_MARGIN_HORIZONTAL || 
      rect.left > window.innerWidth + VIEWPORT_MARGIN_HORIZONTAL) {
    return null;
  }
  
  // Check if element is visible (not display:none or visibility:hidden)
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return null;
  }
  
  return {
    el: el as HTMLElement,
    rect,
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2
  };
}

/**
 * Collects all focusable elements in the current document
 * If a dialog is detected, only returns elements within the dialog
 */
export function collectNodes(dialogContainer?: HTMLElement | null): NavNode[] {
  const searchRoot = dialogContainer || document.body;

  const tabbables = tabbable(searchRoot, {
  getShadowRoot: (node) => {
    return node.shadowRoot ?? undefined;
  }
});
  return Array.from(tabbables).map(createNode).filter((node): node is NavNode => node !== null);
}

/**
 * Sets up a mutation observer to detect DOM changes
 */
export function observeDOM(callback: () => void): DebouncedMutationObserver {
  const observer: DebouncedMutationObserver = new MutationObserver(() => {
    // Debounce rapid mutations
    if (observer.timeout) {
      clearTimeout(observer.timeout);
    }
    observer.timeout = window.setTimeout(callback, OBSERVER_TIMEOUT);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden']
  });
  
  return observer;
}

/**
 * Checks if an element is currently visible and accessible
 */
export function isElementAccessible(el: HTMLElement | null): boolean {
  if (!el || !el.isConnected) return false;
  
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  
  return true;
}

/**
 * Detects if there's an open dialog/modal on the page
 * Returns the dialog container element if found
 */
export function detectOpenDialog(): HTMLElement | null {
  // Check for native dialog elements
  const nativeDialog = document.querySelector('dialog[open]');
  if (nativeDialog) return nativeDialog as HTMLElement;

  // Check for ARIA modal dialogs
  const ariaDialog = document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]');
  if (ariaDialog && isElementAccessible(ariaDialog as HTMLElement)) {
    return ariaDialog as HTMLElement;
  }

  return null;
}

// Spatial navigation algorithm module
// Implements Spotlight-like directional navigation logic

import type { NavNode } from './dom';
import { PRIMARY_AXIS_WEIGHT, PERPENDICULAR_AXIS_WEIGHT, SCROLL_AMOUNT, FOCUS_UPPER_BOUND, FOCUS_LOWER_BOUND, OBSERVER_TIMEOUT, log } from './constants';
import { showKeyboard, hideKeyboard } from './keyboard';

/**
 * Direction type for navigation
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Navigation state
 */
interface NavigationState {
  nodes: NavNode[];
  current: NavNode | null;
  current_hover: NavNode | null;
  dialog: {
    startingNode: NavNode | null;
    container: HTMLElement | null;
  }
}

export const state: NavigationState = {
  nodes: [],
  current: null,
  current_hover: null,
  dialog: {
    startingNode: null,
    container: null
  }
};

/**
 * Checks if candidate is in the direction from current node
 */
function inDirection(current: NavNode, candidate: NavNode, dir: Direction): boolean {
  const dx = candidate.cx - current.cx;
  const dy = candidate.cy - current.cy;

  switch (dir) {
    case 'right': return dx > 0;
    case 'left': return dx < 0;
    case 'down': return dy > 0;
    case 'up': return dy < 0;
  }
}

/**
 * Calculates score for candidate element based on distance and axis alignment
 * Lower score = better candidate
 */
function score(current: NavNode, candidate: NavNode, dir: Direction): number {
  const dx = candidate.cx - current.cx;
  const dy = candidate.cy - current.cy;

  let primary: number;
  let secondary: number;

  // Primary axis is the direction of movement
  // Secondary axis is perpendicular (we penalize deviation)
  if (dir === 'left' || dir === 'right') {
    primary = Math.abs(dx);
    secondary = Math.abs(dy);
  } else {
    primary = Math.abs(dy);
    secondary = Math.abs(dx);
  }

  return primary * PRIMARY_AXIS_WEIGHT + secondary * PERPENDICULAR_AXIS_WEIGHT;
}

/**
 * Finds the next best element in the given direction
 */
function findNext(dir: Direction): NavNode | null {
  if (!state.current) return null;

  // Filter candidates in the specified direction
  const candidates = state.nodes.filter(n =>
    n !== state.current && inDirection(state.current!, n, dir)
  );

  if (candidates.length === 0) return null;

  // Sort by score (lower is better)
  candidates.sort((a, b) =>
    score(state.current!, a, dir) - score(state.current!, b, dir)
  );

  return candidates[0];
}


/**
 * Sets focus to a navigation node
 */
export function focusNode(node: NavNode | null): void {
  if (!node) {
    hideKeyboard();
    return;
  }

  // Remove focus class and hover state from current element
  if (state.current) {
    state.current.el.classList.remove('gamepad-outline', 'gamepad-display-override');
  }

  // Update state
  state.current = node;

  // Focus the element 
  node.el.focus({ preventScroll: true });

  // Scroll element into the vertival middle thrid of the viewport if needed
  const rect = node.rect;
  const viewportHeight = window.innerHeight;
  const upperBound = viewportHeight * FOCUS_UPPER_BOUND;
  const lowerBound = viewportHeight * FOCUS_LOWER_BOUND;
  if (rect.top < upperBound) {
    const scrollY = rect.top - upperBound;
    window.scrollBy({ top: scrollY, behavior: 'smooth' });
  } else if (rect.bottom > lowerBound) {
    const scrollY = rect.bottom - lowerBound;
    window.scrollBy({ top: scrollY, behavior: 'smooth' });
  }

  log('Focused element:', node.el);

  // Show virtual keyboard for text inputs
  const tagName = node.el.tagName.toLowerCase();
  const isTextInput = (
    tagName === 'textarea' ||
    (tagName === 'input' && (
      node.el.getAttribute('type') === 'text' ||
      node.el.getAttribute('type') === 'email' ||
      node.el.getAttribute('type') === 'password' ||
      node.el.getAttribute('type') === 'search' ||
      node.el.getAttribute('type') === 'tel' ||
      node.el.getAttribute('type') === 'url' ||
      node.el.getAttribute('type') === 'number' ||
      !node.el.getAttribute('type')
    ))
  );

  if (isTextInput) {
    showKeyboard(node.el as HTMLInputElement | HTMLTextAreaElement);
  } else {
    hideKeyboard();
  }
}

/**
 * Activates the currently focused element (click)
 */
export function activate(): void {
  if (!state.current) return;

  const el = state.current.el;

  // Trigger click event
  el.click();

  // Also dispatch keyboard events for better compatibility
  el.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true
  }));

  // Check if action changed focus (e.g. link navigation)
  setTimeout(() => {
    if (document.activeElement !== el) {
      const newFocused = state.nodes.find(n => n.el === document.activeElement);
      log('New focused element after activation:', newFocused ? newFocused.el : null);
      if (newFocused) {
        focusNode(newFocused);
      }
    }
  }, OBSERVER_TIMEOUT + 50);
}

/**
 * Handles scroll fallback when no candidate found
 */
function scrollFallback(dir: Direction): void {
  log(`Scrolling fallback in direction: ${dir}`);
  switch (dir) {
    case 'down':
      window.scrollBy({ top: SCROLL_AMOUNT, behavior: 'smooth' });
      break;
    case 'up':
      window.scrollBy({ top: -SCROLL_AMOUNT, behavior: 'smooth' });
      break;
    // no automated horizontal scrolling, most pages don't scroll horizontally
    case 'left':
    case 'right':
      break;
  }
}

/**
 * Main navigation handler
 */
export function navigate(dir: Direction): void {
  // If nothing is currently focused, start from upper left
  if (!state.current) {
    const upperLeft = findUpperLeftElement();
    if (upperLeft) {
      focusNode(upperLeft);
    }
    return;
  }

  const next = findNext(dir);

  if (next) {
    focusNode(next);
  } else {
    // No candidate found, try scrolling
    scrollFallback(dir);
  }
}

/**
 * Finds the nearest element to the current viewport center
 * Used for initial focus
 */
export function findNearestToCenter(): NavNode | null {
  if (state.nodes.length === 0) return null;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  let nearest = state.nodes[0];
  let minDist = Infinity;

  for (const node of state.nodes) {
    const dx = node.cx - centerX;
    const dy = node.cy - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }

  return nearest;
}

/**
 * Finds the nearest element to the upper left corner
 * Used for initial navigation when nothing is focused
 */
export function findUpperLeftElement(): NavNode | null {
  if (state.nodes.length === 0) return null;

  let nearest = state.nodes[0];
  let minDist = Infinity;

  for (const node of state.nodes) {
    // Calculate distance from upper left (0, 0)
    const dist = Math.sqrt(node.cx * node.cx + node.cy * node.cy);

    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }

  return nearest;
}

/**
 * Attempts to close the currently open dialog
 */
export function closeDialog(): boolean {
  if (!state.dialog.container) return false;

  const dialog = state.dialog.container;

  // Try native dialog close
  if (dialog.tagName === 'DIALOG') {
    (dialog as HTMLDialogElement).close();
    return true;
  }

  // Try clicking close button
  const closeButton = dialog.querySelector(
    'button[aria-label*="close" i], button[aria-label*="dismiss" i], ' +
    'button.close, button.btn-close, [data-dismiss="modal"], ' +
    '.modal-close, .dialog-close, button[title*="close" i]'
  );
  if (closeButton) {
    (closeButton as HTMLElement).click();
    return true;
  }

  // Try dispatching ESC key
  dialog.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    keyCode: 27,
    bubbles: true,
    cancelable: true
  }));

  return true;
}

/**
 * Updates the node list
 */
export function updateNodes(nodes: NavNode[]): void {
  state.nodes = nodes;

  // If current element is set, update reference or clear if gone
  if (state.current) {
    const updatedCurrent = nodes.find(n => n.el === state.current!.el)
    if (!updatedCurrent) {
      state.current.el.blur();
      state.current = null;
    }
    else {
      state.current = updatedCurrent;
    }
  }
}

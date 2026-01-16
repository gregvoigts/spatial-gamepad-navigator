// Main entry point for Gamepad Navigator extension
// Coordinates DOM discovery, navigation, and gamepad input

import { collectNodes, observeDOM, isElementAccessible, detectOpenDialog } from './dom';
import { focusNode, state, updateNodes } from './navigator';
import { initGamepad } from './gamepad';
import { 
  SCROLL_THROTTLE, 
  RESIZE_THROTTLE, 
  FOCUS_VALIDATION_INTERVAL, 
  PAGE_LOAD_REBUILD_DELAY,
  log,
  loadSettings 
} from './constants';

let scrollTimeout: number | null = null;
let resizeTimeout: number | null = null;

/**
 * Rebuilds the navigation node list
 */
function rebuild(): void {
  // Check if there's an open dialog
  const dialog = detectOpenDialog();

  if (state.dialog.container === null && dialog) {
    state.dialog.startingNode = state.current;
    state.dialog.container = dialog;
    log('Dialog detected, restricting focus to dialog:', dialog);
  }
  else if (state.dialog.container && !dialog) {
    log('Dialog closed, restoring full focus context');
    focusNode(state.dialog.startingNode);
    state.dialog.startingNode = null;
    state.dialog.container = null;
  }

  // Collect nodes (filtered to dialog if present)
  const nodes = collectNodes(dialog);
  log('Nodes:', nodes);
  updateNodes(nodes);

  // console.log(`${LOG_PREFIX} Discovered ${nodes.length} focusable elements${dialog ? ' in dialog' : ''}`);
}

/**
 * Handles scroll events - rebuild after scrolling stops
 */
function handleScroll(): void {
  if (scrollTimeout !== null) {
    clearTimeout(scrollTimeout);
  }
  
  scrollTimeout = window.setTimeout(() => {
    rebuild();
  }, SCROLL_THROTTLE);
}

/**
 * Handles window resize events
 */
function handleResize(): void {
  if (resizeTimeout !== null) {
    clearTimeout(resizeTimeout);
  }
  
  resizeTimeout = window.setTimeout(() => {
    rebuild();
  }, RESIZE_THROTTLE);
}

/**
 * Initializes the extension
 */
async function init(): Promise<void> {
  log('Initializing Gamepad Spatial Navigation...');

  // Load settings from storage
  await loadSettings();

  // Initial discovery
  rebuild();

  // Set up DOM mutation observer
  observeDOM(rebuild);

  // Listen for scroll events
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Listen for resize events
  window.addEventListener('resize', handleResize);

  // Initialize gamepad support
  initGamepad();

  // Listen for settings reload messages
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'reloadSettings') {
      log('Reloading settings...');
      loadSettings().then(() => {
        rebuild();
      });
    }
  });

  // Periodic validation of current focus
  setInterval(() => {
    if (state.current && !isElementAccessible(state.current.el)) {
      log('Current element became inaccessible, rebuilding...');
      rebuild();
    }
  }, FOCUS_VALIDATION_INTERVAL);

  log('Ready! Connect a gamepad and use D-pad/analog stick to navigate.');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also rebuild on page load (for dynamic content)
window.addEventListener('load', () => {
  setTimeout(rebuild, PAGE_LOAD_REBUILD_DELAY);
});

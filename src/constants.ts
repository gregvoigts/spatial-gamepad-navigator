// Constants for Gamepad Navigator extension
// Centralized configuration values

/**
 * DOM observation settings
 */
export let OBSERVER_TIMEOUT = 200; // ms debounce for DOM mutations
export let VIEWPORT_MARGIN_HORIZONTAL = 0; // Allow elements slightly off-screen
export let VIEWPORT_MARGIN_VERTICAL = 150;   // to be considered focusable

/**
 * Spatial navigation scoring weights
 */
export let PRIMARY_AXIS_WEIGHT = 0.3;
export let PERPENDICULAR_AXIS_WEIGHT = 0.7;

/**
 * Scroll behavior settings
 */
export let SCROLL_AMOUNT = 200; // pixels to scroll when no candidate found
export let SCROLL_THROTTLE = 150; // ms debounce for scroll events
export let RESIZE_THROTTLE = 250; // ms debounce for resize events
export let PAGE_LOAD_REBUILD_DELAY = 500; // ms delay before rebuilding on page load
export let FOCUS_UPPER_BOUND = 0.25; // Top 25% of viewport
export let FOCUS_LOWER_BOUND = 0.75; // Bottom 75% of viewport

/**
 * Gamepad input settings
 */
export let ANALOG_DEADZONE = 0.5; // Threshold for analog stick input
export let ANALOG_COOLDOWN = 300; // ms between analog stick triggers

/**
 * Element validation settings
 */
export let FOCUS_VALIDATION_INTERVAL = 1000; // ms between focus accessibility checks

/**
 * Logging prefix
 */
export const LOG_PREFIX = '[GamepadNav]';

/**
 * Loads settings from chrome.storage and updates constants
 * Settings are stored per-hostname for site-specific configuration
 */
export async function loadSettings(): Promise<void> {
  try {
    const hostname = window.location.hostname || 'default';
    const storageKey = `settings_${hostname}`;
    const result = await chrome.storage.local.get(storageKey);
    const settings = result[storageKey];

    if (!settings) {
      console.log(`${LOG_PREFIX} No custom settings found for ${hostname}, using defaults.`);
      return;
    }
    
    PRIMARY_AXIS_WEIGHT = settings.primaryAxisWeight;
    PERPENDICULAR_AXIS_WEIGHT = settings.perpendicularAxisWeight;
    SCROLL_AMOUNT = settings.scrollAmount;
    SCROLL_THROTTLE = settings.scrollThrottle;
    RESIZE_THROTTLE = settings.resizeThrottle;
    PAGE_LOAD_REBUILD_DELAY = settings.pageLoadRebuildDelay;
    FOCUS_UPPER_BOUND = settings.focusUpperBound;
    FOCUS_LOWER_BOUND = settings.focusLowerBound;
    ANALOG_DEADZONE = settings.analogDeadzone;
    ANALOG_COOLDOWN = settings.analogCooldown;
    VIEWPORT_MARGIN_HORIZONTAL = settings.viewportMarginHorizontal;
    VIEWPORT_MARGIN_VERTICAL = settings.viewportMarginVertical;
    OBSERVER_TIMEOUT = settings.observerTimeout;
    FOCUS_VALIDATION_INTERVAL = settings.focusValidationInterval;

    console.log(`${LOG_PREFIX} Settings loaded for ${hostname}:`, settings);
  } catch (error) {
    console.log(`${LOG_PREFIX} Using default settings (storage unavailable)`);
  }
}

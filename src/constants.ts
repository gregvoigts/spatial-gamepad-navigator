// Constants for Gamepad Navigator extension
// Centralized configuration values

/**
 * Selectors for focusable elements
 */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
  '[role="link"]',
  '[contenteditable="true"]'
];

/**
 * DOM observation settings
 */
export let OBSERVER_TIMEOUT = 200; // ms debounce for DOM mutations
export const VIEWPORT_MARGIN_HORIZONTAL = 0; // Allow elements slightly off-screen
export const VIEWPORT_MARGIN_VERTICAL = 150;   // to be considered focusable

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
export const RESIZE_THROTTLE = 250; // ms debounce for resize events
export const PAGE_LOAD_REBUILD_DELAY = 500; // ms delay before rebuilding on page load
export const FOCUS_UPPER_BOUND = 0.25; // Top 25% of viewport
export const FOCUS_LOWER_BOUND = 0.75; // Bottom 75% of viewport

/**
 * Gamepad input settings
 */
export let ANALOG_DEADZONE = 0.5; // Threshold for analog stick input
export let ANALOG_COOLDOWN = 300; // ms between analog stick triggers

/**
 * Element validation settings
 */
export const FOCUS_VALIDATION_INTERVAL = 1000; // ms between focus accessibility checks

/**
 * Logging prefix
 */
export const LOG_PREFIX = '[GamepadNav]';

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS = {
  primaryAxisWeight: 0.3,
  perpendicularAxisWeight: 0.7,
  scrollAmount: 200,
  scrollThrottle: 150,
  analogDeadzone: 0.5,
  analogCooldown: 300,
  observerTimeout: 200
};

/**
 * Loads settings from chrome.storage and updates constants
 */
export async function loadSettings(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get('settings');
    const settings = result.settings || DEFAULT_SETTINGS;

    PRIMARY_AXIS_WEIGHT = settings.primaryAxisWeight;
    PERPENDICULAR_AXIS_WEIGHT = settings.perpendicularAxisWeight;
    SCROLL_AMOUNT = settings.scrollAmount;
    SCROLL_THROTTLE = settings.scrollThrottle;
    ANALOG_DEADZONE = settings.analogDeadzone;
    ANALOG_COOLDOWN = settings.analogCooldown;
    OBSERVER_TIMEOUT = settings.observerTimeout;

    console.log(`${LOG_PREFIX} Settings loaded:`, settings);
  } catch (error) {
    console.log(`${LOG_PREFIX} Using default settings (storage unavailable)`);
  }
}

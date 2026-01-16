// Gamepad input handling module
// Polls gamepad state and triggers navigation actions

import { navigate, activate, state, closeDialog } from './navigator';
import { ANALOG_DEADZONE, ANALOG_COOLDOWN, LOG_PREFIX } from './constants';
import { keyboardState, navigateKeyboard, activateKey, hideKeyboard } from './keyboard';

/**
 * Simulates mouse hover on the currently focused element
 */
function simulateHover(): void {
  if (!state.current) return;

  const el = state.current.el;
  state.current_hover = state.current;
  
  // Dispatch mouse enter and over events
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
}

/**
 * Ends mouse hover simulation on the currently focused element
 */
function endHover(): void {
  if (!state.current_hover) return;

  console.log(`${LOG_PREFIX} Ending hover on element:`, state.current_hover.el);

  const el = state.current_hover.el;
  state.current_hover = null; 
  
  // Dispatch mouse leave and out events
  el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true }));
}

/**
 * Button state tracker
 */
interface ButtonState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  x: boolean;
  leftTrigger: boolean;
}

// Track previous button states to detect press events
let previousState: ButtonState = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
  x: false,
  leftTrigger: false
};

// Gamepad state
let gamepadConnected = false;
let gamepadIndex = -1;
let lastAnalogTrigger = 0;

/**
 * Handles D-pad and face button inputs
 */
function handleButtons(gamepad: Gamepad): void {
  // D-pad buttons (standard mapping)
  // Button 12 = Up, 13 = Down, 14 = Left, 15 = Right
  const currentState: ButtonState = {
    up: gamepad.buttons[12]?.pressed || false,
    down: gamepad.buttons[13]?.pressed || false,
    left: gamepad.buttons[14]?.pressed || false,
    right: gamepad.buttons[15]?.pressed || false,
    a: gamepad.buttons[0]?.pressed || false,  // A/Cross button
    b: gamepad.buttons[1]?.pressed || false,   // B/Circle button
    x: gamepad.buttons[2]?.pressed || false,   // X/Square button
    leftTrigger: gamepad.buttons[6]?.pressed || false,  // Left trigger (L2/LT)
  };

  // Detect button press (was not pressed, now is pressed)
  // If keyboard is active, route D-pad to keyboard navigation
  if (keyboardState.container) {
    if (currentState.up && !previousState.up) {
      navigateKeyboard('up');
    }
    if (currentState.down && !previousState.down) {
      navigateKeyboard('down');
    }
    if (currentState.left && !previousState.left) {
      navigateKeyboard('left');
    }
    if (currentState.right && !previousState.right) {
      navigateKeyboard('right');
    }
    if (currentState.a && !previousState.a) {
      activateKey();
    }
  } else {
    // Normal navigation mode
    if (currentState.up && !previousState.up) {
      navigate('up');
    }
    if (currentState.down && !previousState.down) {
      navigate('down');
    }
    if (currentState.left && !previousState.left) {
      navigate('left');
    }
    if (currentState.right && !previousState.right) {
      navigate('right');
    }
    if (currentState.a && !previousState.a) {
      activate();
    }
  }
  if (currentState.b && !previousState.b) {
    // B button priority: close keyboard, then dialog, go back
    if (keyboardState.container) {
      hideKeyboard();
    } else if (state.dialog.container) {
      console.log(`${LOG_PREFIX} Closing dialog with B button`);
      closeDialog();
      // Trigger rebuild after a short delay to update focus context
      setTimeout(() => {
        window.dispatchEvent(new Event('resize')); // Trigger rebuild
      }, 100);
    }
    else {
      window.history.back();
    }
  }
  if (currentState.leftTrigger && !previousState.leftTrigger) {
    simulateHover();
  }
  if (!currentState.leftTrigger && previousState.leftTrigger) {
    endHover();
  }

  previousState = currentState;
}

/**
 * Handles analog stick inputs (left stick for navigation)
 */
function handleAnalogStick(gamepad: Gamepad): void {
  const now = Date.now();
  
  // Cooldown to prevent rapid-fire navigation
  if (now - lastAnalogTrigger < ANALOG_COOLDOWN) {
    return;
  }

  // Left stick axes (standard mapping)
  // Axis 0 = left/right, Axis 1 = up/down
  const axisX = gamepad.axes[0] || 0;
  const axisY = gamepad.axes[1] || 0;

  // Check if stick is beyond deadzone
  if (Math.abs(axisX) > ANALOG_DEADZONE) {
    if (axisX > 0) {
      navigate('right');
    } else {
      navigate('left');
    }
    lastAnalogTrigger = now;
  } else if (Math.abs(axisY) > ANALOG_DEADZONE) {
    if (axisY > 0) {
      navigate('down');
    } else {
      navigate('up');
    }
    lastAnalogTrigger = now;
  }
}

/**
 * Main gamepad polling loop
 */
function pollGamepad(): void {
  if (!gamepadConnected) {
    requestAnimationFrame(pollGamepad);
    return;
  }

  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[gamepadIndex];

  if (!gamepad) {
    gamepadConnected = false;
    requestAnimationFrame(pollGamepad);
    return;
  }

  handleButtons(gamepad);
  handleAnalogStick(gamepad);

  requestAnimationFrame(pollGamepad);
}

/**
 * Initializes gamepad support
 */
export function initGamepad(): void {
  // Check if a gamepad is already connected
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepadConnected = true;
      gamepadIndex = i;
      console.log(`${LOG_PREFIX} Gamepad connected: ${gamepads[i]!.id}`);
      break;
    }
  }

  // Listen for gamepad connection events
  window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
    gamepadConnected = true;
    gamepadIndex = e.gamepad.index;
    console.log(`${LOG_PREFIX} Gamepad connected: ${e.gamepad.id}`);
  });

  window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
    if (e.gamepad.index === gamepadIndex) {
      gamepadConnected = false;
      gamepadIndex = -1;
      console.log(`${LOG_PREFIX} Gamepad disconnected`);
    }
  });

  // Start polling loop
  requestAnimationFrame(pollGamepad);
}

/**
 * Returns current gamepad connection status
 */
export function isGamepadConnected(): boolean {
  return gamepadConnected;
}

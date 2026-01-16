// Virtual keyboard for gamepad text input

import { log } from './constants';

const KEYBOARD_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
  ['Space', '✓']
];

interface KeyboardState {
  container: HTMLElement | null;
  targetInput: HTMLInputElement | HTMLTextAreaElement | null;
  selectedRow: number;
  selectedCol: number;
  shiftActive: boolean;
}

export const keyboardState: KeyboardState = {
  container: null,
  targetInput: null,
  selectedRow: 0,
  selectedCol: 0,
  shiftActive: false
};

/**
 * Creates and displays the virtual keyboard next to the focused input
 */
export function showKeyboard(input: HTMLInputElement | HTMLTextAreaElement): void {
  if (keyboardState.container) {
    hideKeyboard();
  }

  log('Showing virtual keyboard for input');

  // Create keyboard container
  const container = document.createElement('div');
  container.className = 'gamepad-keyboard';
  container.setAttribute('data-gamepad-ignore', 'true');

  // Position it near the input
  const inputRect = input.getBoundingClientRect();
  container.style.cssText = `
    position: fixed;
    left: ${Math.min(inputRect.left, window.innerWidth - 420)}px;
    top: ${Math.min(inputRect.bottom + 10, window.innerHeight - 250)}px;
    z-index: 100000;
    background: rgba(30, 30, 30, 0.95);
    border: 2px solid #555;
    border-radius: 8px;
    padding: 12px;
    font-family: monospace;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
  `;

  // Create keyboard grid
  KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.style.cssText = 'display: flex; gap: 4px; margin-bottom: 4px;';

    row.forEach((key, colIndex) => {
      const keyButton = document.createElement('button');
      keyButton.className = 'gamepad-key';
      keyButton.textContent = key;
      keyButton.setAttribute('data-row', String(rowIndex));
      keyButton.setAttribute('data-col', String(colIndex));
      keyButton.setAttribute('data-key', key);

      const isWide = key === 'Space' || key === '✓';
      keyButton.style.cssText = `
        min-width: ${isWide ? '80px' : '32px'};
        height: 32px;
        background: #444;
        color: #fff;
        border: 2px solid #666;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.15s;
      `;

      rowDiv.appendChild(keyButton);
    });

    container.appendChild(rowDiv);
  });

  document.body.appendChild(container);

  keyboardState.container = container;
  keyboardState.targetInput = input;
  keyboardState.selectedRow = 0;
  keyboardState.selectedCol = 0;
  keyboardState.shiftActive = false;

  updateKeyboardSelection();
}

/**
 * Hides and removes the virtual keyboard
 */
export function hideKeyboard(): void {
  if (keyboardState.container) {
    keyboardState.container.remove();
    keyboardState.container = null;
    keyboardState.targetInput = null;
    log('Keyboard hidden');
  }
}

/**
 * Updates the visual selection on the keyboard
 */
function updateKeyboardSelection(): void {
  if (!keyboardState.container) return;

  const keys = keyboardState.container.querySelectorAll('.gamepad-key');
  keys.forEach((key) => {
    const row = parseInt((key as HTMLElement).getAttribute('data-row') || '0');
    const col = parseInt((key as HTMLElement).getAttribute('data-col') || '0');

    if (row === keyboardState.selectedRow && col === keyboardState.selectedCol) {
      (key as HTMLElement).style.background = '#0078d4';
      (key as HTMLElement).style.borderColor = '#fff';
      (key as HTMLElement).style.transform = 'scale(1.1)';
    } else {
      (key as HTMLElement).style.background = '#444';
      (key as HTMLElement).style.borderColor = '#666';
      (key as HTMLElement).style.transform = 'scale(1)';
    }
  });
}

/**
 * Navigate the keyboard selection
 */
export function navigateKeyboard(direction: 'up' | 'down' | 'left' | 'right'): void {
  if (!keyboardState.container) return;

  const currentRow = KEYBOARD_LAYOUT[keyboardState.selectedRow];

  switch (direction) {
    case 'up':
      if (keyboardState.selectedRow > 0) {
        keyboardState.selectedRow--;
        // Clamp column to valid range for new row
        const newRow = KEYBOARD_LAYOUT[keyboardState.selectedRow];
        if (keyboardState.selectedCol >= newRow.length) {
          keyboardState.selectedCol = newRow.length - 1;
        }
      }
      break;

    case 'down':
      if (keyboardState.selectedRow < KEYBOARD_LAYOUT.length - 1) {
        keyboardState.selectedRow++;
        // Clamp column to valid range for new row
        const newRow = KEYBOARD_LAYOUT[keyboardState.selectedRow];
        if (keyboardState.selectedCol >= newRow.length) {
          keyboardState.selectedCol = newRow.length - 1;
        }
      }
      break;

    case 'left':
      if (keyboardState.selectedCol > 0) {
        keyboardState.selectedCol--;
      }
      break;

    case 'right':
      if (keyboardState.selectedCol < currentRow.length - 1) {
        keyboardState.selectedCol++;
      }
      break;
  }

  updateKeyboardSelection();
}

/**
 * Activates the currently selected key
 */
export function activateKey(): void {
  if (!keyboardState.container || !keyboardState.targetInput) return;

  const selectedKey = KEYBOARD_LAYOUT[keyboardState.selectedRow][keyboardState.selectedCol];

  switch (selectedKey) {
    case '⇧':
      keyboardState.shiftActive = !keyboardState.shiftActive;
      log(`Shift ${keyboardState.shiftActive ? 'ON' : 'OFF'}`);
      break;

    case '⌫':
      // Backspace
      const start = keyboardState.targetInput.selectionStart || 0;
      const end = keyboardState.targetInput.selectionEnd || 0;
      if (start > 0 || start !== end) {
        const value = keyboardState.targetInput.value;
        keyboardState.targetInput.value = value.slice(0, start - (start === end ? 1 : 0)) + value.slice(end);
        keyboardState.targetInput.setSelectionRange(start - (start === end ? 1 : 0), start - (start === end ? 1 : 0));
        keyboardState.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      break;

    case 'Space':
      insertText(' ');
      break;

    case '✓':
      // Done - close keyboard
      hideKeyboard();
      break;

    default:
      // Regular character
      let char = selectedKey;
      if (keyboardState.shiftActive) {
        char = char.toUpperCase();
        keyboardState.shiftActive = false; // Auto-disable shift after one character
      }
      insertText(char);
      break;
  }
}

/**
 * Inserts text at cursor position
 */
function insertText(text: string): void {
  if (!keyboardState.targetInput) return;

  const start = keyboardState.targetInput.selectionStart || 0;
  const end = keyboardState.targetInput.selectionEnd || 0;
  const value = keyboardState.targetInput.value;

  keyboardState.targetInput.value = value.slice(0, start) + text + value.slice(end);
  const newPos = start + text.length;
  keyboardState.targetInput.setSelectionRange(newPos, newPos);
  keyboardState.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
}

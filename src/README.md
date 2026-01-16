# Source Code Documentation

This directory contains the TypeScript source files for the Gamepad Navigator extension.

## File Overview

### Core Navigation Files

**`main.ts`**
- Entry point and lifecycle manager
- Initializes all modules on page load
- Coordinates between DOM observer, navigator, and gamepad handler
- Manages scroll and resize event listeners
- Handles settings reload messages from popup

**`navigator.ts`**
- Implements spatial navigation algorithm
- Calculates directional scores for element selection
- Manages focus state and navigation history
- Handles dialog/popup detection and focus trapping
- Controls scroll behavior when no elements are found
- Updates focus overlay position

**`dom.ts`**
- Element discovery and collection
- Visibility filtering (checks if elements are visible on screen)
- MutationObserver for dynamic content changes
- Finds focusable elements based on CSS selectors
- Filters out forbidden elements

**`gamepad.ts`**
- Gamepad input polling and state management
- Button press detection with debouncing
- Analog stick handling with deadzone and cooldown
- Routes input to appropriate handlers (navigation, keyboard, media)
- Manages button state tracking

### Feature Modules

**`keyboard.ts`**
- Virtual on-screen keyboard for text input
- QWERTY layout with special keys (Shift, Backspace, Space, Done)
- Gamepad navigation within keyboard
- Text input to focused form elements
- Auto-shows when text inputs are focused

### Configuration and UI

**`constants.ts`**
- Centralized configuration values
- All tunable settings as exportable variables
- Per-site settings loading from chrome.storage.local
- Default values for all parameters
- `log()` helper function that respects VERBOSE setting

**`overlay.css`**
- Styles for focus overlay element

**`popup.html`**
- Extension popup UI (accessible from toolbar icon)
- Settings form with all configurable parameters
- Organized into sections (Navigation, Input, Performance, etc.)
- Shows current site hostname

**`popup.js`**
- Settings management for popup
- Loads current settings from chrome.storage.local
- Saves settings per-site (hostname-based keys)
- Sends reload message to content script after save
- Handles focusable/forbidden selectors as textarea input

## Module Dependencies

```
main.ts
├── constants.ts (settings)
├── dom.ts (element collection)
├── navigator.ts (spatial navigation)
└── gamepad.ts (input handling)
    ├── navigator.ts (navigation commands)
    ├── keyboard.ts (text input)
    └── media.ts (media controls)

popup.js
└── (independent, communicates via chrome.storage and messaging)
```

## Build Process

Source files are compiled by webpack using ts-loader:
- TypeScript files → Single bundled `content.js`
- CSS/HTML files → Copied to `dist/` unchanged
- Popup.js → Copied to `dist/` (plain JavaScript)

## Key Algorithms

### Spatial Navigation Scoring
Located in `navigator.ts` `score()` function:
1. Calculate center points of current and candidate elements
2. Determine vector between centers
3. Check if candidate is in intended direction
4. Calculate primary axis distance (along direction vector)
5. Calculate perpendicular distance (off-axis)
6. Combine with weights: `(primaryDist * weight1) + (perpDist * weight2)`
7. Select candidate with lowest score

### Dialog Detection
Located in `navigator.ts`:
- Monitors for elements with `role="dialog"` or `aria-modal="true"`
- Checks z-index hierarchy to find topmost dialog
- Restricts navigation to elements within dialog
- B button closes dialog by clicking close button or blurring

### Media Control Strategy
Located in `media.ts`:
- First attempts to find and click visible player buttons
- Uses common CSS selectors for play/pause/volume/skip controls
- Falls back to direct `HTMLMediaElement` API if no buttons found
- Button-clicking approach works around browser security restrictions

# Gamepad Navigator

A small Chrome extension I vibe coded in a few days that enables gamepad-based navigation for websites using spatial algorithms similar to TV browsers. Navigate any website with your gamepad's D-pad or analog stick, automatically discovering and moving between interactive elements based on their visual position. I mainly built this for a SteamOS smart TV setup, so its focuses mainly on streaming sites. But in theory it should work on any website. It uses [tabbable](https://github.com/focus-trap/tabbable) to discover focusable elements and the Gamepad API for input. 

## Features

- **Spatial Navigation**: Navigate using directional input based on element positions
- **Spotlight Algorithm**: TV-style directional scoring for intelligent element selection
- **Universal Compatibility**: Works on arbitrary websites without site-specific configuration
- **Dialog Focus Trapping**: Automatically detects and traps focus in popups/modals
- **Virtual Keyboard**: On-screen keyboard for text input with gamepad control
- **Per-Site Settings**: Customize behavior for individual websites

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `GamepadNavigator` folder
6. The extension is now active on all websites

## Controls

### Basic Navigation
- **D-Pad / Left Analog Stick**: Navigate between elements spatially
- **A Button**: Activate/click the focused element
- **B Button**: 
  - Close dialogs/popups when detected
  - Go one step back in navigation history otherwise
- **Left Trigger**: Simulate hover on focused element

### Text Input
When a text input is focused:
- **Virtual Keyboard** appears automatically
- **D-Pad**: Navigate between keys
- **A Button**: Type the selected key
- Press **Done** or **B Button** to close keyboard

## Settings

Access settings by clicking the extension icon in Chrome's toolbar. Settings are saved per-site (based on hostname).

### Navigation Settings

**Primary Axis Weight** (default: 0.3)
- How much weight to give distance along the intended direction
- Lower values favor elements more directly in line

**Perpendicular Axis Weight** (default: 0.7)
- How much weight to give distance perpendicular to intended direction
- Higher values prevent diagonal jumps

**Scroll Amount** (default: 200 pixels)
- How far to scroll when no element is found in the navigation direction

**Focus Upper/Lower Bound** (default: 0.25 / 0.75)
- Viewport regions that trigger auto-scrolling when focus moves outside them

### Input Settings

**Analog Deadzone** (default: 0.5)
- Minimum analog stick deflection to register as input (0.0 - 1.0)

**Analog Cooldown** (default: 300ms)
- Delay between repeated analog stick navigation triggers

### Performance Settings

**Observer Timeout** (default: 200ms)
- Debounce delay for DOM mutation detection

**Scroll Throttle** (default: 150ms)
- Minimum time between scroll event processing

**Resize Throttle** (default: 250ms)
- Minimum time between resize event processing

**Focus Validation Interval** (default: 1000ms)
- How often to check if focused element is still valid

### Element Discovery

**Viewport Margin Horizontal/Vertical** (default: 0 / 150 pixels)
- Allow elements slightly outside viewport to be considered focusable

### Debug Settings

**Verbose Logging** (default: off)
- Enable console.log output for debugging
- Logs navigation decisions, element discovery, and gamepad input
- Useful for troubleshooting or understanding extension behavior

## How It Works

1. **Element Discovery**: Scans page for focusable elements based on tabbable library
2. **Directional Scoring**: When you press a direction:
   - Filters candidates to those in intended direction
   - Scores each candidate based on weighted distance metrics
   - Selects the best (lowest score) candidate
5. **Dialog Detection**: Monitors for new popups/modals and traps focus within them

## Browser Compatibility

- Chrome/Edge (Manifest V3)
- Requires Gamepad API support

## Development

Build the extension:
```bash
npm install
npm run build
```

The built files will be in the `dist/` folder.

## Inspiration

This extension is based on concepts from:
- **CSS Spatial Navigation** (WICG spec)
- **Enact Spotlight** (LG webOS navigation)
- **TV browser implementations** (Samsung Tizen, Android TV)

## License

MIT License - feel free to modify and extend!
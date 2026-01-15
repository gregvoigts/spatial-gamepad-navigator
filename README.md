# Gamepad Spatial Navigator

A Chrome extension that enables gamepad-based spatial navigation for arbitrary websites, similar to how TV browsers work.

## Features

- **Spatial Navigation**: Navigate websites using gamepad D-pad or analog stick based on visual layout
- **Spotlight Algorithm**: Uses TV-style directional scoring to intelligently select the next element
- **Works on Any Site**: Automatically discovers focusable elements on arbitrary websites
- **Visual Feedback**: Blue outline highlights the currently focused element
- **Scroll Support**: Automatically scrolls when no elements are found in the navigation direction
- **Dynamic Content**: Tracks DOM changes and updates navigation nodes automatically

## Installation

### Load as Unpacked Extension

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `GamepadNavigator` folder
6. The extension is now active on all websites

## Usage

### Controls

- **D-Pad / Left Analog Stick**: Navigate between focusable elements
  - Up/Down/Left/Right: Move focus spatially
- **A Button** (typically button 0): Activate/click the focused element
- **B Button** (typically button 1): Blur/unfocus current element

### How It Works

1. **Element Discovery**: Finds all focusable elements (links, buttons, inputs, etc.)
2. **Spatial Mapping**: Creates a spatial graph based on element positions on screen
3. **Directional Selection**: When you press a direction, scores candidates based on:
   - Distance in the primary direction (30% weight)
   - Perpendicular distance from axis (70% weight)
4. **Focus Management**: Highlights and focuses the selected element
5. **Scroll Fallback**: If no element is found, scrolls the page

### Supported Elements

The extension automatically detects:
- Links (`<a href>`)
- Buttons (`<button>`)
- Form inputs (`<input>`, `<select>`, `<textarea>`)
- Elements with `tabindex`
- Elements with `role="button"` or `role="link"`
- Contenteditable elements

## Architecture

```
GamepadNavigator/
├── manifest.json          # Extension configuration
├── content/
│   ├── main.js           # Bootstrap and coordination
│   ├── dom.js            # Element discovery
│   ├── navigator.js      # Spatial navigation algorithm
│   ├── gamepad.js        # Input handling
│   └── overlay.css       # Focus styling
```

### Core Modules

- **dom.js**: Finds focusable elements, filters invisible ones, observes mutations
- **navigator.js**: Implements Spotlight-like directional scoring and selection
- **gamepad.js**: Polls gamepad state, handles button presses and analog input
- **main.js**: Initializes all components, manages lifecycle

## Technical Details

### Navigation Algorithm

Based on the Enact Spotlight spatial navigation system:

1. **Direction Filtering**: Only considers elements in the intended direction
2. **Weighted Scoring**: 
   - Primary axis distance: 30%
   - Perpendicular distance: 70%
   - Lower score wins
3. **Center-to-Center**: Uses element centers for spatial calculations
4. **Scroll Fallback**: Scrolls 200px when no candidate found

### Performance

- Mutation observer with 100ms debouncing
- Scroll event throttling (150ms)
- Resize event throttling (250ms)
- Analog stick cooldown (300ms)
- Periodic focus validation (1s interval)

## Browser Compatibility

- Chrome/Edge (Manifest V3)
- Requires Gamepad API support (all modern browsers)

## Known Limitations

- iFrames require separate injection (not currently supported)
- Canvas/WebGL content is not navigable
- Some complex web apps may need per-site tuning
- Overlapping elements may cause ambiguous navigation

## Future Improvements

- [ ] Row affinity (prefer same horizontal row)
- [ ] Focus groups (nav bars, menus)
- [ ] Modal/dialog focus trapping
- [ ] iFrame support
- [ ] Per-site configuration overrides
- [ ] Scroll container awareness
- [ ] Diagonal jump suppression

## Inspiration

This extension is based on concepts from:
- **CSS Spatial Navigation** (WICG spec)
- **Enact Spotlight** (LG webOS navigation)
- **TV browser implementations** (Samsung Tizen, Android TV)

## License

MIT License - feel free to modify and extend!

## Contributing

Contributions welcome! Areas that need work:
- Better diagonal navigation handling
- Scroll container detection
- Focus group management
- Per-site configuration UI

# Development Guide

## Setup

1. Clone the repository
2. The extension uses ES6 modules, so no build step is required
3. Load as unpacked extension in Chrome

## Testing

### Testing Without a Physical Gamepad

You can test using Chrome DevTools gamepad emulation:

1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "gamepad" and select "Show Sensors"
4. Add a virtual gamepad controller

Or use a gamepad testing tool:
- [Gamepad Tester](https://gamepad-tester.com/)
- [HTML5 Gamepad Tester](https://html5gamepad.com/)

### Manual Testing

1. Navigate to any website (e.g., news sites, e-commerce)
2. Connect a gamepad
3. Watch the browser console for connection messages
4. Test navigation with D-pad or analog stick
5. Test activation with A button

### Test Sites

Good sites for testing:
- **News sites**: Many links in predictable layouts
- **Google**: Simple, few elements
- **Amazon**: Complex, many interactive elements
- **Forms**: Test input field navigation

## Architecture Overview

### Module Dependencies

```
main.js
├── dom.js (element discovery)
├── navigator.js (spatial algorithm)
│   └── Uses state from dom.js
└── gamepad.js (input)
    └── Calls navigator.js functions
```

### Data Flow

1. **Initialization** (main.js):
   - Collect initial nodes via dom.js
   - Start gamepad polling via gamepad.js
   - Set up mutation observer

2. **Gamepad Input** (gamepad.js):
   - Poll gamepad state (60fps)
   - Detect button presses
   - Call navigator.navigate(direction)

3. **Navigation** (navigator.js):
   - Filter candidates by direction
   - Score candidates spatially
   - Focus best candidate or scroll

4. **DOM Updates** (dom.js):
   - Detect mutations
   - Debounce and rebuild node list
   - Notify navigator.js

## Key Algorithms

### Spatial Scoring

```javascript
score = primary_distance * 0.3 + perpendicular_distance * 0.7
```

Why these weights?
- **30% primary**: Forward movement is always preferred
- **70% perpendicular**: Strongly penalizes diagonal jumps
- This creates intuitive "row-following" behavior

### Direction Filtering

Only elements with positive displacement in the intended direction are considered:

```javascript
right: candidate.cx > current.cx
left:  candidate.cx < current.cx
down:  candidate.cy > current.cy
up:    candidate.cy < current.cy
```

## Debugging

### Enable Verbose Logging

Add to main.js:
```javascript
window.GAMEPAD_NAV_DEBUG = true;
```

### Visualize Nodes

Add to navigator.js after scoring:
```javascript
candidates.forEach(c => {
  c.el.style.border = '2px solid red';
  setTimeout(() => c.el.style.border = '', 1000);
});
```

### Common Issues

**Navigation feels wrong on certain sites:**
- Check element Z-index and visibility
- Some elements may be invisible but still focusable
- Try adjusting scoring weights

**No elements found:**
- Check console for discovered element count
- Site may use non-standard focusable elements
- Add additional selectors to FOCUSABLE_SELECTORS

**Gamepad not detected:**
- Check chrome://device-log/
- Try pressing buttons to wake gamepad
- Verify with gamepad-tester.com

## Performance Optimization

### Current Optimizations

- Debounced mutation observer (100ms)
- Throttled scroll handler (150ms)
- Analog stick cooldown (300ms)
- Filtered out invisible elements

### Potential Improvements

- Use IntersectionObserver for viewport filtering
- Cache bounding rectangles
- Use spatial indexing (quadtree) for large element counts
- Only rebuild affected subtrees on mutations

## Extending the Extension

### Adding Keyboard Fallback

In gamepad.js, add:
```javascript
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') navigate('up');
  // etc...
});
```

### Adding Focus History

In navigator.js:
```javascript
const history = [];
export function back() {
  if (history.length > 1) {
    history.pop(); // Remove current
    focusNode(history.pop());
  }
}
```

### Per-Site Overrides

Create a config.js:
```javascript
const siteConfigs = {
  'youtube.com': {
    scrollAmount: 400,
    preferHorizontal: true
  }
};
```

## Publishing

### Before Publishing

1. Convert SVG icons to PNG (required by Chrome Web Store)
2. Add detailed description
3. Add screenshots/demo video
4. Test on multiple sites
5. Update version number

### Submission Checklist

- [ ] Real icon files (PNG, not SVG)
- [ ] Detailed description
- [ ] Screenshots
- [ ] Privacy policy (if needed)
- [ ] Test on Chrome, Edge, Brave

## Code Style

- ES6 modules
- JSDoc comments for public functions
- Descriptive variable names
- Keep functions focused and small
- Use early returns

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)
- [Enact Spotlight](https://github.com/enactjs/enact)
- [CSS Spatial Navigation](https://drafts.csswg.org/css-nav-1/)

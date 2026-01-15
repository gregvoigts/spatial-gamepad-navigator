# Icon Files

## Current Status

The extension currently uses SVG placeholders for icons. Chrome Web Store requires PNG format.

## Converting SVG to PNG

### Option 1: Online Converter
1. Open each SVG file in a browser
2. Take a screenshot or use an online converter like:
   - https://cloudconvert.com/svg-to-png
   - https://svgtopng.com/

### Option 2: Using ImageMagick (if installed)
```bash
magick icon16.svg icon16.png
magick icon48.svg icon48.png
magick icon128.svg icon128.png
```

### Option 3: Using Inkscape (if installed)
```bash
inkscape icon16.svg --export-filename=icon16.png -w 16 -h 16
inkscape icon48.svg --export-filename=icon48.png -w 48 -h 48
inkscape icon128.svg --export-filename=icon128.png -w 128 -h 128
```

### Option 4: Using Node.js (requires sharp package)
```bash
npm install sharp
node convert-icons.js
```

## Design Guidelines

The current placeholder design shows a gamepad D-pad:
- Blue background (#1a73e8 - Chrome blue)
- White D-pad buttons (up, down, left, right)
- Semi-transparent crosshair connecting them

Feel free to replace with a better design that represents:
- Gamepad/controller
- Navigation
- Spatial movement
- Accessibility

## Recommended Tools for Icon Design

- **Figma** (free, web-based)
- **Inkscape** (free, open-source)
- **Adobe Illustrator** (paid)
- **GIMP** (free, for raster editing)

## Requirements

- Format: PNG (required by Chrome Web Store)
- Sizes: 16x16, 48x48, 128x128
- Background: Should work on both light and dark backgrounds
- Style: Simple, recognizable at small sizes

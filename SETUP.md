# Setup Guide - TypeScript Version

## Prerequisites

You need Node.js installed to compile TypeScript.

### Installing Node.js

**Option 1: Official Installer**
1. Visit https://nodejs.org/
2. Download LTS version (recommended)
3. Run installer
4. Restart terminal/VS Code

**Option 2: Using winget (Windows 11)**
```powershell
winget install OpenJS.NodeJS.LTS
```

**Option 3: Using Chocolatey**
```powershell
choco install nodejs-lts
```

## Installation Steps

Once Node.js is installed:

```bash
# 1. Install dependencies
npm install

# 2. Build the extension
npm run build

# 3. Load in Chrome
# Go to chrome://extensions/
# Enable Developer Mode
# Click "Load unpacked"
# Select the GamepadNavigator folder
```

## Quick Start (Without Building)

If you don't want to set up TypeScript right now, you can still use the old JavaScript files:

1. Edit `manifest.json` and change:
   ```json
   "js": [
     "dist/dom.js",
     "dist/navigator.js",
     "dist/gamepad.js",
     "dist/main.js"
   ],
   "css": ["dist/overlay.css"]
   ```
   
   To:
   ```json
   "js": [
     "content/dom.js",
     "content/navigator.js",
     "content/gamepad.js",
     "content/main.js"
   ],
   "css": ["content/overlay.css"]
   ```

2. Load the extension directly (no build step needed)

## Development Commands

```bash
# Compile once
npm run build

# Watch mode (auto-compile on file changes)
npm run watch

# Clean build output
npm run clean

# Clean and rebuild
npm run rebuild

# Create zip for distribution
npm run zip
```

## Troubleshooting

**"npm: command not found"**
- Node.js not installed or not in PATH
- Restart terminal after installation
- Verify: `node --version` and `npm --version`

**Build errors**
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again
- Check TypeScript version: `npx tsc --version`

**Extension not loading**
- Make sure `dist/` folder exists
- Run `npm run build` first
- Check browser console for errors

## VS Code Setup (Recommended)

Install these extensions for best TypeScript experience:
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto-import

VS Code will automatically use the project's `tsconfig.json`.

# Quick Start Guide

## Installation (2 minutes)

1. **Download/Clone this repository**
   ```bash
   git clone <repository-url>
   cd GamepadNavigator
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

4. **Load Extension**
   - Click "Load unpacked"
   - Select the `GamepadNavigator` folder
   - Extension is now active!

## First Use (1 minute)

1. **Connect a gamepad**
   - Plug in any Xbox, PlayStation, or generic USB/Bluetooth gamepad
   - Press any button to wake it

2. **Open any website**
   - Try a news site, shopping site, or Google

3. **Navigate!**
   - **D-Pad/Analog Stick**: Move between links and buttons
   - **A Button**: Click the focused element
   - **B Button**: Unfocus (go back)

## What You Should See

- Blue outline appears on a focusable element
- Press direction buttons to move the outline
- Element highlights follow visual layout, not tab order
- Page scrolls automatically if no elements in direction

## Troubleshooting

### "No gamepad detected"
- Press buttons on the gamepad to wake it
- Check gamepad works at [gamepad-tester.com](https://gamepad-tester.com/)
- Try disconnecting/reconnecting

### "Navigation doesn't work"
1. Open browser console (F12)
2. Look for `[GamepadNav]` messages
3. Should see "Gamepad connected" and element count

### "Blue outline not showing"
- Check if extension is enabled at `chrome://extensions/`
- Reload the page (Ctrl+R)
- Check browser console for errors

### "Navigation feels weird"
- This is normal for some complex layouts
- Works best on traditional websites (news, shopping, forms)
- May struggle with heavy JavaScript apps (SPAs)

## Testing Sites

**Easy (good for first test):**
- google.com
- wikipedia.org

**Medium:**
- amazon.com
- reddit.com
- github.com

**Hard (complex layouts):**
- twitter.com
- youtube.com

## Next Steps

- Read [README.md](README.md) for detailed features
- Read [DEVELOPMENT.md](DEVELOPMENT.md) to understand the code
- Read [ICONS.md](ICONS.md) to create proper icon files
- Customize and extend!

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Gamepad Spatial Navigation"
3. Click "Remove"

## Support

Check browser console for debug messages. All logs start with `[GamepadNav]`.

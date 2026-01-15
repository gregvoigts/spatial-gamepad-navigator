// Popup script for managing settings

const DEFAULT_SETTINGS = {
  primaryAxisWeight: 0.3,
  perpendicularAxisWeight: 0.7,
  scrollAmount: 200,
  scrollThrottle: 150,
  analogDeadzone: 0.5,
  analogCooldown: 300,
  observerTimeout: 200
};

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get('settings');
  const settings = result.settings || DEFAULT_SETTINGS;

  document.getElementById('primaryAxisWeight').value = settings.primaryAxisWeight;
  document.getElementById('perpendicularAxisWeight').value = settings.perpendicularAxisWeight;
  document.getElementById('scrollAmount').value = settings.scrollAmount;
  document.getElementById('scrollThrottle').value = settings.scrollThrottle;
  document.getElementById('analogDeadzone').value = settings.analogDeadzone;
  document.getElementById('analogCooldown').value = settings.analogCooldown;
  document.getElementById('observerTimeout').value = settings.observerTimeout;
}

// Save settings to storage
async function saveSettings() {
  const settings = {
    primaryAxisWeight: parseFloat(document.getElementById('primaryAxisWeight').value),
    perpendicularAxisWeight: parseFloat(document.getElementById('perpendicularAxisWeight').value),
    scrollAmount: parseInt(document.getElementById('scrollAmount').value),
    scrollThrottle: parseInt(document.getElementById('scrollThrottle').value),
    analogDeadzone: parseFloat(document.getElementById('analogDeadzone').value),
    analogCooldown: parseInt(document.getElementById('analogCooldown').value),
    observerTimeout: parseInt(document.getElementById('observerTimeout').value)
  };

  await chrome.storage.sync.set({ settings });

  // Show confirmation
  const status = document.getElementById('status');
  status.textContent = '✓ Settings saved!';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);

  // Notify content scripts to reload settings
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'reloadSettings' }).catch(() => {
        // Ignore errors for tabs without content script
      });
    }
  }
}

// Reset to default settings
async function resetSettings() {
  await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  await loadSettings();

  const status = document.getElementById('status');
  status.textContent = '✓ Reset to defaults!';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);

  // Notify content scripts to reload settings
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'reloadSettings' }).catch(() => {
        // Ignore errors for tabs without content script
      });
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
});

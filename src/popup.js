// Popup script for managing settings

const DEFAULT_SETTINGS = {
  primaryAxisWeight: 0.3,
  perpendicularAxisWeight: 0.7,
  scrollAmount: 200,
  scrollThrottle: 150,
  resizeThrottle: 250,
  pageLoadRebuildDelay: 500,
  focusUpperBound: 0.25,
  focusLowerBound: 0.75,
  analogDeadzone: 0.5,
  analogCooldown: 300,
  viewportMarginHorizontal: 0,
  viewportMarginVertical: 150,
  observerTimeout: 200,
  focusValidationInterval: 1000,
  verbose: false
};

let currentHostname = '';

// Get hostname from current tab
async function getCurrentHostname() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      return {hostname: url.hostname, tab};
    } catch (e) {
      return {hostname: 'default', tab: undefined};
    }
  }
  return {hostname: 'default', tab: undefined};
}

// Load settings from storage for current site
async function loadSettings() {
  const {hostname, tab} = await getCurrentHostname();
  document.getElementById('currentSite').textContent = hostname;

  const storageKey = `settings_${hostname}`;
  const result = await chrome.storage.local.get(storageKey);
  const settings = result[storageKey] || DEFAULT_SETTINGS;

  document.getElementById('primaryAxisWeight').value = settings.primaryAxisWeight;
  document.getElementById('perpendicularAxisWeight').value = settings.perpendicularAxisWeight;
  document.getElementById('scrollAmount').value = settings.scrollAmount;
  document.getElementById('scrollThrottle').value = settings.scrollThrottle;
  document.getElementById('resizeThrottle').value = settings.resizeThrottle;
  document.getElementById('pageLoadRebuildDelay').value = settings.pageLoadRebuildDelay;
  document.getElementById('focusUpperBound').value = settings.focusUpperBound;
  document.getElementById('focusLowerBound').value = settings.focusLowerBound;
  document.getElementById('analogDeadzone').value = settings.analogDeadzone;
  document.getElementById('analogCooldown').value = settings.analogCooldown;
  document.getElementById('viewportMarginHorizontal').value = settings.viewportMarginHorizontal;
  document.getElementById('viewportMarginVertical').value = settings.viewportMarginVertical;
  document.getElementById('observerTimeout').value = settings.observerTimeout;
  document.getElementById('focusValidationInterval').value = settings.focusValidationInterval;
  document.getElementById('verbose').checked = settings.verbose ?? false;
}

// Save settings to storage
async function saveSettings() {
  const {hostname, tab} = await getCurrentHostname();
  const focusableSelectors = document.getElementById('focusableSelectors').value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const forbiddenSelectors = document.getElementById('forbiddenSelectors').value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const settings = {
    primaryAxisWeight: parseFloat(document.getElementById('primaryAxisWeight').value),
    perpendicularAxisWeight: parseFloat(document.getElementById('perpendicularAxisWeight').value),
    scrollAmount: parseInt(document.getElementById('scrollAmount').value),
    scrollThrottle: parseInt(document.getElementById('scrollThrottle').value),
    resizeThrottle: parseInt(document.getElementById('resizeThrottle').value),
    pageLoadRebuildDelay: parseInt(document.getElementById('pageLoadRebuildDelay').value),
    focusUpperBound: parseFloat(document.getElementById('focusUpperBound').value),
    focusLowerBound: parseFloat(document.getElementById('focusLowerBound').value),
    analogDeadzone: parseFloat(document.getElementById('analogDeadzone').value),
    analogCooldown: parseInt(document.getElementById('analogCooldown').value),
    viewportMarginHorizontal: parseInt(document.getElementById('viewportMarginHorizontal').value),
    viewportMarginVertical: parseInt(document.getElementById('viewportMarginVertical').value),
    observerTimeout: parseInt(document.getElementById('observerTimeout').value),
    focusValidationInterval: parseInt(document.getElementById('focusValidationInterval').value),
    verbose: document.getElementById('verbose').checked
  };

  const storageKey = `settings_${hostname}`;
  await chrome.storage.local.set({ [storageKey]: settings });

  // Show confirmation
  const status = document.getElementById('status');
  status.textContent = '✓ Settings saved!';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);

  // Notify content scripts to reload settings
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'reloadSettings' }).catch(() => {
        // Ignore errors for tabs without content script
      });
    }
  
}

// Reset to default settings for current site
async function resetSettings() {
  const {hostname, tab} = await getCurrentHostname();
  const storageKey = `settings_${hostname}`;
  await chrome.storage.local.set({ [storageKey]: DEFAULT_SETTINGS });
  await loadSettings();

  const status = document.getElementById('status');
  status.textContent = '✓ Reset to defaults!';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);

  // Notify content scripts to reload settings
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'reloadSettings' }).catch(() => {
        // Ignore errors for tabs without content script
      });
    }  
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
});

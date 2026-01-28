// Get DOM elements
const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
const openSelectedTextBtn = document.getElementById('openSelectedText');

// Load current state from storage
chrome.storage.sync.get(['extensionEnabled'], (result) => {
  const isEnabled = result.extensionEnabled !== false; // Default to enabled
  updateUI(isEnabled);
});

// Handle toggle click
toggle.addEventListener('click', () => {
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    const currentState = result.extensionEnabled !== false;
    const newState = !currentState;
    
    // Save new state
    chrome.storage.sync.set({ extensionEnabled: newState }, () => {
      updateUI(newState);
      
      // Notify background script of state change
      chrome.runtime.sendMessage({
        action: 'toggleExtension',
        enabled: newState
      });
    });
  });
});

// Handle open selected text button click
openSelectedTextBtn.addEventListener('click', async () => {
  // Check if extension is enabled
  chrome.storage.sync.get(['extensionEnabled'], async (result) => {
    const isEnabled = result.extensionEnabled !== false;
    
    if (!isEnabled) {
      alert('Extension is disabled. Please enable it first.');
      return;
    }
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to capture selected HTML
      await chrome.tabs.sendMessage(tab.id, {
        action: 'captureSelectedHTML'
      });
      
      // Close popup after successful action
      window.close();
    } catch (error) {
      console.error('Error opening selected text:', error);
      alert('Error: ' + error.message);
    }
  });
});

// Update UI based on enabled state
function updateUI(isEnabled) {
  if (isEnabled) {
    toggle.classList.add('enabled');
    status.textContent = 'Enabled';
    openSelectedTextBtn.disabled = false;
  } else {
    toggle.classList.remove('enabled');
    status.textContent = 'Disabled';
    openSelectedTextBtn.disabled = true;
  }
}
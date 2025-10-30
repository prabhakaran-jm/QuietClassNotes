chrome.runtime.onInstalled.addListener(() => {
  console.log('QuietClass Notes installed');
});

// Handle messages from content script and store for side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'QCN_SELECTED_TEXT') {
    // Store the selected text so side panel can retrieve it
    chrome.storage.local.set({ lastSelectedText: message.text }).catch(() => {});
    // Also try to send directly if side panel is listening
    chrome.runtime.sendMessage(message).catch(() => {});
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async response
});

// For future: handle context-menu or keyboard shortcuts


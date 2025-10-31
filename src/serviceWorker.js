chrome.runtime.onInstalled.addListener(() => {
  console.log('QuietClass Notes installed');
});

// Handle messages from content script and store for side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[QCN Service Worker] Received message:', message.type);
  
  if (message.type === 'QCN_SELECTED_TEXT') {
    // Store the selected text and tab so side panel can retrieve it
    chrome.storage.local.set({ 
      lastSelectedText: message.text,
      lastSelectedTab: message.tab || null
    }).then(() => {
      console.log('[QCN Service Worker] Stored text and tab');
    }).catch((err) => {
      console.error('[QCN Service Worker] Storage error:', err);
    });
    
    // Open side panel if requested (sidePanel API must be called from service worker)
    if (message.openSidePanel) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId })
            .then(() => {
              console.log('[QCN Service Worker] Side panel opened');
            })
            .catch((err) => {
              console.error('[QCN Service Worker] Failed to open side panel:', err);
            });
        }
      });
    }
    
    sendResponse({ success: true });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'QCN_OPEN_SIDE_PANEL') {
    // Fallback: try to open side panel from service worker
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId })
          .then(() => console.log('[QCN Service Worker] Side panel opened'))
          .catch((err) => console.error('[QCN Service Worker] Failed to open side panel:', err));
      }
    });
    sendResponse({ success: true });
    return true;
  }
  
  return false;
});

// For future: handle context-menu or keyboard shortcuts


// Debug: Log that content script is loaded
console.log('[QCN] Content script loaded. Chrome runtime:', typeof chrome !== 'undefined' ? 'available' : 'undefined');

const IDS = {
  WRAP: 'qcn-wrap',
  SUM: 'qcn-sum',
  SIM: 'qcn-sim',
  TRN: 'qcn-trn',
  PRF: 'qcn-prf'
};

const CHIP_TO_TAB = {
  [IDS.SUM]: 'summarize',
  [IDS.SIM]: 'simplify',
  [IDS.TRN]: 'translate',
  [IDS.PRF]: 'proofread'
};

function createChips() {
  const wrap = document.createElement('div');
  wrap.id = IDS.WRAP;
  Object.assign(wrap.style, {
    position: 'absolute', zIndex: 2147483647, display: 'none', gap: '6px', flexDirection: 'row',
    background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)'
  });

  const mk = (id, label) => {
    const b = document.createElement('button');
    b.id = id; b.textContent = label;
    Object.assign(b.style, { 
      background: 'transparent', 
      color: 'white', 
      border: '1px solid #aaa', 
      padding: '4px 8px', 
      borderRadius: '6px', 
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '12px'
    });
    b.addEventListener('mouseenter', () => {
      b.style.background = 'rgba(255,255,255,0.2)';
      b.style.borderColor = '#fff';
    });
    b.addEventListener('mouseleave', () => {
      b.style.background = 'transparent';
      b.style.borderColor = '#aaa';
    });
    return b;
  };

  wrap.append(
    mk(IDS.SUM, '✳️ Summarize'),
    mk(IDS.SIM, '✏️ Simplify'),
    mk(IDS.TRN, '🌐 Translate'),
    mk(IDS.PRF, '🧹 Proofread')
  );
  document.body.appendChild(wrap);
  return wrap;
}

const wrap = createChips();

function showChips(rect) {
  wrap.style.left = `${rect.left + window.scrollX}px`;
  wrap.style.top = `${rect.bottom + window.scrollY + 6}px`;
  wrap.style.display = 'flex';
}
function hideChips(){ wrap.style.display = 'none'; }

function getSelectionText() {
  const sel = window.getSelection();
  return sel && sel.toString().trim();
}

function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const r = sel.getRangeAt(0).getBoundingClientRect();
  if (!r) return null; return r;
}

document.addEventListener('mouseup', () => {
  const text = getSelectionText();
  if (text) {
    const rect = getSelectionRect();
    rect ? showChips(rect) : hideChips();
  } else hideChips();
});

document.addEventListener('mousedown', (e) => {
  if (!wrap.contains(e.target)) hideChips();
});

function sendSelectedText() {
  const text = getSelectionText();
  if (!text) return;
  
  // Check if extension runtime is available
  if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
    // Extension context invalidated - silent fail for selection tracking
    return;
  }
  
  chrome.runtime.sendMessage({ type: 'QCN_SELECTED_TEXT', text }, (response) => {
    if (chrome.runtime.lastError) {
      // Context invalidated - silent fail for selection tracking
      return;
    }
  });
}

wrap.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent event bubbling
  e.preventDefault(); // Prevent default behavior
  
  const id = e.target?.id || e.target.closest('button')?.id;
  if (!id || !CHIP_TO_TAB[id]) {
    console.log('[QCN] No valid chip ID:', id);
    return;
  }
  
  const text = getSelectionText();
  if (!text) {
    console.log('[QCN] No text selected');
    return;
  }
  
  console.log('[QCN] Chip clicked:', id, 'Text:', text.substring(0, 50));
  
  // Debug: Check chrome availability
  console.log('[QCN] Debug - typeof chrome:', typeof chrome);
  console.log('[QCN] Debug - chrome.runtime:', typeof chrome !== 'undefined' ? typeof chrome.runtime : 'N/A');
  console.log('[QCN] Debug - chrome.runtime.sendMessage:', typeof chrome !== 'undefined' && chrome.runtime ? typeof chrome.runtime.sendMessage : 'N/A');
  
  // Check if extension runtime is available
  if (typeof chrome === 'undefined') {
    console.error('[QCN] Chrome is undefined! Extension may not be loaded. Reload extension and page.');
    alert('Chrome extension API not available. Please:\n1. Go to chrome://extensions\n2. Reload QuietClass Notes\n3. Reload this page (F5)');
    return;
  }
  
  if (!chrome.runtime) {
    console.error('[QCN] chrome.runtime is undefined! Extension context invalidated.');
    alert('Extension context invalidated. Please reload this page (F5) to reconnect.');
    return;
  }
  
  // Double-check sendMessage exists
  if (typeof chrome.runtime.sendMessage !== 'function') {
    console.error('[QCN] chrome.runtime.sendMessage is not a function. Extension context invalidated.');
    alert('Extension context invalidated. Please reload this page (F5) to reconnect.');
    return;
  }
  
  console.log('[QCN] All checks passed, sending message...');
  
  // Send selected text with the tab to activate and request side panel open
  const tabToActivate = CHIP_TO_TAB[id];
  
  try {
    chrome.runtime.sendMessage({ 
      type: 'QCN_SELECTED_TEXT', 
      text,
      tab: tabToActivate,
      openSidePanel: true  // Request side panel to open
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Extension context invalidated (reloaded) - reload page or re-register listener
        if (chrome.runtime.lastError.message?.includes('Extension context invalidated') ||
            chrome.runtime.lastError.message?.includes('message port closed')) {
          console.warn('[QCN] Extension context invalidated. Please reload the page.');
          alert('Extension was reloaded. Please reload this page (F5) to reconnect.');
        } else {
          console.error('[QCN] Message error:', chrome.runtime.lastError);
        }
      } else {
        console.log('[QCN] Message sent:', response);
      }
    });
  } catch (e) {
    // Extension context invalidated or other error
    if (e.message?.includes('Extension context invalidated') || 
        e.message?.includes('message port closed') ||
        e.message?.includes('sendMessage')) {
      console.warn('[QCN] Extension context invalidated. Please reload the page.');
      alert('Extension context invalidated. Please reload this page (F5).');
    } else {
      console.error('[QCN] Error sending message:', e);
    }
  }
});


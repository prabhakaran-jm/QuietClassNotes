import { getAIAvailabilityBadge, getPreference, setPreference } from "../src/utils/availability.js";
import * as Summarizer from "../src/ai/summarizer.js";
import * as Rewriter from "../src/ai/rewriter.js";
import * as Translator from "../src/ai/translator.js";
import * as Proofreader from "../src/ai/proofreader.js";

let activeTab = "summarize";
const tabs = document.querySelectorAll('.tab');
const badge = document.getElementById('statusBadge');
const input = document.getElementById('input');
const output = document.getElementById('output');
const runBtn = document.getElementById('run');
const copyBtn = document.getElementById('copy');
const exportBtn = document.getElementById('export');
const clearBtn = document.getElementById('clear');
const useAsInputBtn = document.getElementById('useAsInput');
const hybridToggle = document.getElementById('hybridToggle');
const translateOptions = document.getElementById('translateOptions');
const simplifyOptions = document.getElementById('simplifyOptions');
const targetLanguage = document.getElementById('targetLanguage');
const rewriteMode = document.getElementById('rewriteMode');

// Load saved preferences
(async () => {
  badge.textContent = await getAIAvailabilityBadge();
  const savedHybrid = await getPreference('hybrid');
  hybridToggle.checked = !!savedHybrid;
  
  // Load saved language and mode preferences
  const savedTargetLang = await getPreference('targetLanguage');
  if (savedTargetLang) targetLanguage.value = savedTargetLang;
  
  const savedMode = await getPreference('rewriteMode');
  if (savedMode) rewriteMode.value = savedMode;
})();

// Character and word count
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');

function updateStats() {
  const text = input.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  charCount.textContent = chars;
  wordCount.textContent = words;
}

input.addEventListener('input', updateStats);
updateStats();

function updateTabUI() {
  // Show/hide options based on active tab
  translateOptions.style.display = activeTab === 'translate' ? 'block' : 'none';
  simplifyOptions.style.display = activeTab === 'simplify' ? 'block' : 'none';
  // Show export and use as input buttons when there's output
  const hasOutput = output.textContent.trim() && !output.classList.contains('error');
  exportBtn.style.display = hasOutput ? 'inline-block' : 'none';
  useAsInputBtn.style.display = hasOutput ? 'inline-block' : 'none';
}

// Toast notification helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  activeTab = t.dataset.tab;
  updateTabUI();
}));

hybridToggle.addEventListener('change', () => setPreference('hybrid', hybridToggle.checked));

// Save preferences when language/mode changes
targetLanguage.addEventListener('change', () => setPreference('targetLanguage', targetLanguage.value));
rewriteMode.addEventListener('change', () => setPreference('rewriteMode', rewriteMode.value));

// Keyboard shortcuts
input.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runBtn.click();
  }
});

runBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) { 
    output.textContent = 'No input text.'; 
    output.classList.remove('loading');
    return; 
  }
  
  // Set loading state
  runBtn.disabled = true;
  const runText = document.getElementById('runText');
  const runSpinner = document.getElementById('runSpinner');
  runText.textContent = 'Processing…';
  runSpinner.style.display = 'inline-block';
  output.textContent = 'Working…';
  output.classList.add('loading');
  copyBtn.disabled = true;

  const hybrid = await getPreference('hybrid');

  try {
    let result;
    if (activeTab === 'summarize') {
      result = await Summarizer.summarize(text, { hybrid });
    } else if (activeTab === 'simplify') {
      const mode = rewriteMode.value;
      result = await Rewriter.rewrite(text, { mode, hybrid });
    } else if (activeTab === 'translate') {
      const target = targetLanguage.value;
      result = await Translator.translate(text, { target, hybrid });
    } else if (activeTab === 'proofread') {
      result = await Proofreader.proofread(text, { hybrid });
    }
    
    output.textContent = result;
    output.classList.remove('loading', 'error');
    // Show export button after successful run
    updateTabUI();
    showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} completed successfully`, 'success');
  } catch (e) {
    console.error(e);
    const errorMsg = e?.message || String(e);
    let userMessage = `Error: ${errorMsg}`;
    
    // Provide helpful error messages
    if (errorMsg.includes('not available') || errorMsg.includes('unavailable')) {
      if (hybrid) {
        userMessage = `On-device AI unavailable.\n\nTry:\n• Check Chrome Built-in AI availability\n• Enable Hybrid mode (if not already)\n• Ensure you have an internet connection for cloud fallback`;
      } else {
        userMessage = `AI feature not available.\n\nTry:\n• Enable Hybrid mode for cloud fallback\n• Ensure Chrome Built-in AI is enabled\n• Check your Chrome version (requires Chrome 130+)`;
      }
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      userMessage = `Network error occurred.\n\nTry:\n• Check your internet connection\n• Retry the operation\n• Ensure Hybrid mode is enabled for cloud fallback`;
    }
    
    output.textContent = userMessage;
    output.classList.add('error');
    output.classList.remove('loading');
    updateTabUI();
    showToast('Processing failed. See output for details.', 'error');
  } finally {
    // Reset loading state
    runBtn.disabled = false;
    runText.textContent = 'Run';
    runSpinner.style.display = 'none';
    copyBtn.disabled = false;
  }
});

// Clear input button
clearBtn.addEventListener('click', () => {
  input.value = '';
  updateStats();
  input.focus();
  showToast('Input cleared', 'success');
});

// Use output as input
useAsInputBtn.addEventListener('click', () => {
  const outputText = output.textContent.trim();
  if (!outputText || output.classList.contains('error')) return;
  
  input.value = outputText;
  output.textContent = '';
  updateStats();
  updateTabUI();
  input.focus();
  showToast('Output used as new input', 'success');
});

copyBtn.addEventListener('click', async () => {
  const text = output.textContent;
  if (!text || output.classList.contains('error')) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    showToast('Copied to clipboard', 'success');
    setTimeout(() => (copyBtn.textContent = 'Copy Output'), 1000);
  } catch (e) {
    showToast('Failed to copy', 'error');
  }
});

// Export functionality
exportBtn.addEventListener('click', () => {
  const text = output.textContent;
  if (!text) return;
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const inputText = input.value.trim();
  
  // Create export data
  const exportData = {
    type: activeTab,
    timestamp,
    input: inputText,
    output: text,
    options: activeTab === 'translate' ? { target: targetLanguage.value } :
             activeTab === 'simplify' ? { mode: rewriteMode.value } : {}
  };
  
  // Show menu options
  const menu = document.createElement('div');
  menu.className = 'export-menu';
  menu.style.display = 'block';
  
  const jsonBtn = document.createElement('button');
  jsonBtn.textContent = 'Export as JSON';
  jsonBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quietclass-notes-${activeTab}-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    menu.remove();
  };
  
  const mdBtn = document.createElement('button');
  mdBtn.textContent = 'Export as Markdown';
  mdBtn.onclick = () => {
    const md = `# ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Result\n\n` +
               `**Timestamp:** ${new Date(exportData.timestamp.replace(/-/g, ':')).toLocaleString()}\n\n` +
               `## Input\n\n${exportData.input}\n\n` +
               `## Output\n\n${exportData.output}\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quietclass-notes-${activeTab}-${timestamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
    menu.remove();
  };
  
  menu.appendChild(jsonBtn);
  menu.appendChild(mdBtn);
  
  // Position menu near export button
  const rect = exportBtn.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${rect.left}px`;
  menu.style.zIndex = '10000';
  
  document.body.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== exportBtn) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
});

// Receive selected text from content script or service worker
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'QCN_SELECTED_TEXT') {
    input.value = msg.text || '';
    // Auto-select the corresponding tab if provided
    if (msg.tab) {
      const tabToActivate = Array.from(tabs).find(t => t.dataset.tab === msg.tab);
      if (tabToActivate) {
        tabs.forEach(x => x.classList.remove('active'));
        tabToActivate.classList.add('active');
        activeTab = msg.tab;
        updateTabUI();
      }
    }
  }
});

// Also check storage on load for recently selected text
(async () => {
  const stored = await chrome.storage.local.get(['lastSelectedText', 'lastSelectedTab']);
  if (stored.lastSelectedText && !input.value) {
    input.value = stored.lastSelectedText;
      // Auto-select tab if available
      if (stored.lastSelectedTab) {
        const tabToActivate = Array.from(tabs).find(t => t.dataset.tab === stored.lastSelectedTab);
        if (tabToActivate) {
          tabs.forEach(x => x.classList.remove('active'));
          tabToActivate.classList.add('active');
          activeTab = stored.lastSelectedTab;
          updateTabUI();
        }
      }
  }
  updateTabUI();
})();


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
const hybridToggle = document.getElementById('hybridToggle');

(async () => {
  badge.textContent = await getAIAvailabilityBadge();
  const savedHybrid = await getPreference('hybrid');
  hybridToggle.checked = !!savedHybrid;
})();

tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  activeTab = t.dataset.tab;
}));

hybridToggle.addEventListener('change', () => setPreference('hybrid', hybridToggle.checked));

runBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) { output.textContent = 'No input text.'; return; }
  output.textContent = 'Working…';

  const hybrid = await getPreference('hybrid');

  try {
    if (activeTab === 'summarize') {
      output.textContent = await Summarizer.summarize(text, { hybrid });
    } else if (activeTab === 'simplify') {
      output.textContent = await Rewriter.rewrite(text, { mode: 'beginner', hybrid });
    } else if (activeTab === 'translate') {
      output.textContent = await Translator.translate(text, { target: 'en', hybrid });
    } else if (activeTab === 'proofread') {
      output.textContent = await Proofreader.proofread(text, { hybrid });
    }
  } catch (e) {
    console.error(e);
    output.textContent = `Error: ${e?.message || e}`;
  }
});

copyBtn.addEventListener('click', async () => {
  const text = output.textContent;
  if (!text) return;
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy Output'), 1000);
});

// Receive selected text from content script or service worker
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'QCN_SELECTED_TEXT') {
    input.value = msg.text || '';
  }
});

// Also check storage on load for recently selected text
(async () => {
  const stored = await chrome.storage.local.get('lastSelectedText');
  if (stored.lastSelectedText && !input.value) {
    input.value = stored.lastSelectedText;
  }
})();


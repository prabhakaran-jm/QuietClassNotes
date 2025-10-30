export async function getAIAvailabilityBadge() {
  const bits = [];
  if ('Summarizer' in self) {
    try { bits.push((await Summarizer.availability?.()) || 'Summarizer'); } catch { bits.push('Summarizer'); }
  }
  if ('LanguageModel' in self) bits.push('Prompt');
  if ('translator' in navigator) bits.push('Translator');
  // Proofreader/Rewriter are origin-trial gated in some builds; we just display generic badges
  return bits.length ? 'On-Device Ready' : 'Limited';
}

export function setPreference(key, value) {
  return new Promise(res => chrome.storage.local.set({ [key]: value }, res));
}

export function getPreference(key) {
  return new Promise(res => chrome.storage.local.get(key, x => res(x[key])));
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}


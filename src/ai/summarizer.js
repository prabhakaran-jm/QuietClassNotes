export async function summarize(text, { hybrid } = {}) {
  if (typeof Summarizer === 'undefined') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.summarizeCloud(text);
    }
    throw new Error('Summarizer not available');
  }

  const availability = await Summarizer.availability();
  if (availability === 'unavailable') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.summarizeCloud(text);
    }
    throw new Error('On-device summarizer unavailable');
  }

  if (!navigator.userActivation.isActive) {
    // Side panel: ensure user gesture by clicking Run
  }

  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => console.debug('Model download', e.loaded));
    }
  });
  const result = await summarizer.summarize(text, { context: 'Summarize study material into concise bullet points.' });
  return result;
}


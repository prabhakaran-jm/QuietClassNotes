export async function translate(text, { target = 'en', hybrid } = {}) {
  if (!('translator' in navigator)) {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.translateCloud(text, target);
    }
    throw new Error('Translator API not available');
  }
  let source;
  try { source = await navigator.translator.detect(text); } catch { source = 'auto'; }
  const translated = await navigator.translator.translate(text, { source, target });
  return translated?.text || translated;
}


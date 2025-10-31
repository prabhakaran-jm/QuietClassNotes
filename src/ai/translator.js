export async function translate(text, { target = 'en', hybrid } = {}) {
  // Check for translator API - it might be navigator.translator or window.translator
  const translator = navigator.translator || window.translator;
  
  if (!translator) {
    console.log('[Translator] navigator.translator not available');
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.translateCloud(text, target);
    }
    throw new Error('AI feature not available.\n\nTry:\n• Enable Hybrid mode for cloud fallback\n• Ensure Chrome Built-in AI is enabled\n• Check your Chrome version (requires Chrome 130+)');
  }
  
  try {
    console.log('[Translator] Detecting source language...');
    let source;
    try { 
      if (translator.detect) {
        source = await translator.detect(text); 
      } else {
        source = 'auto';
      }
    } catch (e) { 
      console.log('[Translator] Auto-detection failed, using auto:', e.message);
      source = 'auto'; 
    }
    
    console.log(`[Translator] Translating from ${source} to ${target}...`);
    const translated = await translator.translate(text, { source, target });
    console.log('[Translator] Translation completed');
    return translated?.text || translated || translated?.translatedText || translated;
  } catch (e) {
    console.error('[Translator] Translation error:', e.message);
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.translateCloud(text, target);
    }
    throw new Error(`Translator error: ${e.message || 'Unable to translate text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


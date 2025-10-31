export async function translate(text, { target = 'en', hybrid } = {}) {
  // Check for translator API - it might be navigator.translator or window.translator
  // Also check if it's available through different paths
  let translator = navigator.translator;
  
  if (!translator && typeof window !== 'undefined') {
    translator = window.translator;
  }
  
  // Try to access via globalThis if available
  if (!translator && typeof globalThis !== 'undefined') {
    translator = globalThis.translator || globalThis.navigator?.translator;
  }
  
  console.log('[Translator] Checking availability...', {
    'navigator.translator': !!navigator.translator,
    'window.translator': typeof window !== 'undefined' ? !!window.translator : 'N/A',
    'translator found': !!translator
  });
  
  if (!translator) {
    console.log('[Translator] navigator.translator not available in this Chrome build');
    console.log('[Translator] Note: Translator API is only available in Chrome Canary/Dev builds or with specific flags enabled');
    if (hybrid) {
      console.log('[Translator] Using hybrid cloud fallback...');
      const hybridModule = await import('./hybrid.js');
      return hybridModule.translateCloud(text, target);
    }
    throw new Error('AI feature not available.\n\nTry:\n• Enable Hybrid mode for cloud fallback\n• Ensure Chrome Built-in AI is enabled\n• Check your Chrome version (requires Chrome 130+)\n• Translator API may require Chrome Canary or Dev build');
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


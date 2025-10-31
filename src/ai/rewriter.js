// Map UI-friendly mode values to Rewriter API tone enum values
const MODE_TO_TONE = {
  'beginner': 'simplify',      // UI: Beginner → API: simplify
  'intermediate': 'formalize', // UI: Intermediate → API: formalize
  'formal': 'formalize',       // UI: Formal → API: formalize
  'casual': 'casualize'        // UI: Casual → API: casualize
};

export async function rewrite(text, { mode = 'beginner', hybrid } = {}) {
  if (typeof Rewriter === 'undefined') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.rewriteCloud(text, mode);
    }
    throw new Error('Rewriter API not available in this Chrome build. Enable Hybrid mode for cloud fallback.');
  }
  
  // Check availability if API supports it
  let availability = 'available';
  try {
    if (Rewriter.availability) {
      availability = await Rewriter.availability();
    }
  } catch (e) {
    // Availability check not supported, try to create anyway
  }
  
  if (availability === 'unavailable') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.rewriteCloud(text, mode);
    }
    throw new Error('On-device Rewriter unavailable. Enable Hybrid mode for cloud fallback.');
  }
  
  // Map UI mode to Rewriter API tone enum value
  // Try to infer the correct enum value - API might use different values
  let tone = MODE_TO_TONE[mode];
  
  // If mode not in mapping, log warning and default
  if (!tone) {
    console.warn(`[Rewriter] Unknown mode '${mode}', defaulting to 'simplify'`);
    tone = 'simplify';
  }
  
  console.log(`[Rewriter] UI Mode: '${mode}' → API Tone: '${tone}'`);
  
  try {
    console.log(`[Rewriter] Creating with tone: ${tone}`);
    const rewriter = await Rewriter.create({ tone });
    console.log(`[Rewriter] Created successfully, rewriting text...`);
    return await rewriter.rewrite(text);
  } catch (e) {
    console.error(`[Rewriter] Failed with tone '${tone}':`, e.message);
    
    // Try alternative tone values if enum error
    if (e.message?.includes('enum') || e.message?.includes('not a valid')) {
      const alternatives = {
        'beginner': ['simplify', 'formalize', 'casualize'],
        'intermediate': ['formalize', 'simplify', 'casualize'],
        'formal': ['formalize', 'simplify'],
        'casual': ['casualize', 'simplify', 'formalize']
      };
      
      const altTones = alternatives[mode] || ['simplify', 'formalize', 'casualize'];
      
      for (const altTone of altTones) {
        if (altTone === tone) continue; // Skip if already tried
        try {
          console.log(`[Rewriter] Trying alternative tone: ${altTone}`);
          const rewriter = await Rewriter.create({ tone: altTone });
          return await rewriter.rewrite(text);
        } catch (e2) {
          console.log(`[Rewriter] Alternative tone '${altTone}' also failed`);
          continue;
        }
      }
    }
    
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.rewriteCloud(text, mode);
    }
    throw new Error(`Rewriter error: ${e.message || 'Unable to rewrite text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


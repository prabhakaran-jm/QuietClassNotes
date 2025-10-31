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
  // The Rewriter API may not support 'tone' option - try without options first
  console.log(`[Rewriter] UI Mode: '${mode}'`);
  
  try {
    // First, try creating Rewriter without options (some implementations may not need tone)
    console.log(`[Rewriter] Attempting to create Rewriter without options...`);
    const rewriter = await Rewriter.create();
    console.log(`[Rewriter] Created successfully without options, rewriting text...`);
    return await rewriter.rewrite(text);
  } catch (e1) {
    console.log(`[Rewriter] Failed without options: ${e1.message}`);
    
    // Try with tone mapping
    let tone = MODE_TO_TONE[mode] || 'simplify';
    console.log(`[Rewriter] Trying with tone: ${tone}`);
    
    try {
      const rewriter = await Rewriter.create({ tone });
      console.log(`[Rewriter] Created successfully with tone, rewriting text...`);
      return await rewriter.rewrite(text);
    } catch (e2) {
      console.error(`[Rewriter] Failed with tone '${tone}':`, e2.message);
      
      // Try alternative tone values if enum error
      if (e2.message?.includes('enum') || e2.message?.includes('not a valid') || e2.message?.includes('beginner')) {
        const alternatives = ['simplify', 'formalize', 'casualize', 'elaborate', 'condense'];
        
        for (const altTone of alternatives) {
          if (altTone === tone) continue; // Skip if already tried
          try {
            console.log(`[Rewriter] Trying alternative tone: ${altTone}`);
            const rewriter = await Rewriter.create({ tone: altTone });
            return await rewriter.rewrite(text);
          } catch (e3) {
            console.log(`[Rewriter] Alternative tone '${altTone}' also failed: ${e3.message}`);
            continue;
          }
        }
      }
      
      if (hybrid) {
        const hybridModule = await import('./hybrid.js');
        return hybridModule.rewriteCloud(text, mode);
      }
      throw new Error(`Rewriter error: ${e2.message || 'Unable to rewrite text. Enable Hybrid mode for cloud fallback.'}`);
    }
  }
}


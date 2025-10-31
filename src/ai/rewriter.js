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
  const tone = MODE_TO_TONE[mode] || 'simplify'; // Default to 'simplify' if unknown
  
  try {
    const rewriter = await Rewriter.create({ tone });
    return await rewriter.rewrite(text);
  } catch (e) {
    // If first tone fails, try alternative mapping
    if (mode === 'beginner' && e.message?.includes('enum')) {
      // Try 'simplify' directly if 'beginner' mapping failed
      try {
        const rewriter = await Rewriter.create({ tone: 'simplify' });
        return await rewriter.rewrite(text);
      } catch (e2) {
        // Fall through to hybrid/error handling
      }
    }
    
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.rewriteCloud(text, mode);
    }
    throw new Error(`Rewriter error: ${e.message || 'Unable to rewrite text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


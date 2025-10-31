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
  
  try {
    const rewriter = await Rewriter.create({ tone: mode });
    return await rewriter.rewrite(text);
  } catch (e) {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.rewriteCloud(text, mode);
    }
    throw new Error(`Rewriter error: ${e.message || 'Unable to rewrite text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


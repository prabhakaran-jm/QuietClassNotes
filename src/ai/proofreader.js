export async function proofread(text, { hybrid } = {}) {
  if (typeof Proofreader === 'undefined') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.proofreadCloud(text);
    }
    throw new Error('Proofreader API not available in this Chrome build. Enable Hybrid mode for cloud fallback.');
  }

  // Check availability if API supports it
  let availability = 'available';
  try {
    if (Proofreader.availability) {
      availability = await Proofreader.availability();
    }
  } catch (e) {
    // Availability check not supported, try to create anyway
  }
  
  if (availability === 'unavailable') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.proofreadCloud(text);
    }
    throw new Error('On-device Proofreader unavailable. Enable Hybrid mode for cloud fallback.');
  }

  try {
    console.log('[Proofreader] Creating proofreader...');
    const proof = await Proofreader.create();
    console.log('[Proofreader] Proofreading text...');
    
    // Add timeout for proofreading operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Proofreading timeout after 30 seconds')), 30000);
    });
    
    const proofreadPromise = proof.proofread(text);
    const res = await Promise.race([proofreadPromise, timeoutPromise]);
    
    console.log('[Proofreader] Result received:', res);
    
    // Format basic explanations if present
    if (Array.isArray(res?.edits)) {
      return res.edits.map(e => `• ${e.description || 'Edit'}: "${e.before}" → "${e.after}"`).join('\n');
    }
    return typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  } catch (e) {
    console.error('[Proofreader] Error:', e.message);
    
    if (e.message?.includes('timeout')) {
      if (hybrid) {
        const hybridModule = await import('./hybrid.js');
        return hybridModule.proofreadCloud(text);
      }
      throw new Error('Proofreading timed out. The text might be too long, or the API is not responding. Enable Hybrid mode for cloud fallback.');
    }
    
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.proofreadCloud(text);
    }
    throw new Error(`Proofreader error: ${e.message || 'Unable to proofread text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


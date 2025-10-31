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
    console.log('[Proofreader] Proofreading text...', { textLength: text.length });
    
    // Create a more robust timeout mechanism
    let timeoutId;
    let isResolved = false;
    
    // Create timeout promise that will always reject after 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          console.log('[Proofreader] Timeout fired after 10 seconds');
          isResolved = true; // Prevent multiple rejections
          reject(new Error('Proofreading timeout after 10 seconds'));
        }
      }, 10000);
    });
    
    // Create proofread promise
    const proofreadPromise = proof.proofread(text).then(result => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
        return result;
      }
      // If timeout already fired, reject
      return Promise.reject(new Error('Operation was cancelled due to timeout'));
    }).catch(error => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
      }
      throw error;
    });
    
    // Race between proofread and timeout - whichever resolves/rejects first wins
    const res = await Promise.race([proofreadPromise, timeoutPromise]);
    
    console.log('[Proofreader] Result received:', res);
    
    // Format basic explanations if present
    if (Array.isArray(res?.edits)) {
      if (res.edits.length === 0) {
        return '✓ No issues found. Your text looks good!';
      }
      return res.edits.map(e => `• ${e.description || 'Edit'}: "${e.before}" → "${e.after}"`).join('\n');
    }
    return typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  } catch (e) {
    console.error('[Proofreader] Error:', e.message, e);
    
    // Handle timeout specifically
    if (e.message?.includes('timeout') || e.message?.includes('cancelled')) {
      console.log('[Proofreader] Timeout occurred, checking hybrid mode...');
      if (hybrid) {
        console.log('[Proofreader] Trying cloud fallback...');
        const hybridModule = await import('./hybrid.js');
        return hybridModule.proofreadCloud(text);
      }
      throw new Error('Proofreading timed out after 10 seconds. The text might be too long, or the API is not responding.\n\nEnable Hybrid mode for cloud fallback or try with shorter text.');
    }
    
    // Handle other errors with hybrid fallback
    if (hybrid) {
      console.log('[Proofreader] Error occurred, trying cloud fallback...');
      const hybridModule = await import('./hybrid.js');
      return hybridModule.proofreadCloud(text);
    }
    throw new Error(`Proofreader error: ${e.message || 'Unable to proofread text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


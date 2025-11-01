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

    // Robust timeout mechanism that ALWAYS fires
    const TIMEOUT_MS = 10000; // 10 seconds
    let timeoutFired = false;
    let timeoutHandle = null;

    // Wrapper promise that implements the timeout
    const proofreadWithTimeout = new Promise((resolve, reject) => {
      // Set timeout that will ALWAYS reject after 10 seconds
      timeoutHandle = setTimeout(() => {
        timeoutFired = true;
        console.error('[Proofreader] TIMEOUT: Operation exceeded 10 seconds');
        reject(new Error('TIMEOUT: Proofreading operation exceeded 10 seconds'));
      }, TIMEOUT_MS);

      // Start the actual proofread operation
      proof.proofread(text)
        .then(result => {
          if (!timeoutFired) {
            clearTimeout(timeoutHandle);
            console.log('[Proofreader] Successfully completed before timeout');
            resolve(result);
          } else {
            console.warn('[Proofreader] Operation completed but timeout already fired');
            // Timeout already rejected, do nothing
          }
        })
        .catch(error => {
          if (!timeoutFired) {
            clearTimeout(timeoutHandle);
            console.error('[Proofreader] Operation failed:', error);
            reject(error);
          } else {
            console.warn('[Proofreader] Operation failed but timeout already fired');
            // Timeout already rejected, do nothing
          }
        });
    });

    // Await the result with timeout
    const res = await proofreadWithTimeout;

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
    console.error('[Proofreader] Caught error:', e.message, e);

    // Handle timeout specifically
    if (e.message?.includes('TIMEOUT') || e.message?.includes('timeout') || e.message?.includes('cancelled')) {
      console.log('[Proofreader] Timeout confirmed, checking hybrid mode:', { hybrid });
      if (hybrid) {
        console.log('[Proofreader] Attempting cloud fallback after timeout...');
        try {
          const hybridModule = await import('./hybrid.js');
          return await hybridModule.proofreadCloud(text);
        } catch (hybridError) {
          console.error('[Proofreader] Cloud fallback also failed:', hybridError);
          throw new Error('Proofreading timed out after 10 seconds.\n\nCloud fallback also failed: ' + hybridError.message);
        }
      }
      // No hybrid mode - throw clear timeout error
      throw new Error('Proofreading timed out after 10 seconds.\n\nThe text might be too long, or the API is not responding.\n\nTry:\n• Enable Hybrid mode for cloud fallback\n• Use shorter text\n• Check if Chrome Built-in AI is functioning properly');
    }

    // Handle other errors with hybrid fallback
    if (hybrid) {
      console.log('[Proofreader] Non-timeout error, trying cloud fallback...');
      try {
        const hybridModule = await import('./hybrid.js');
        return await hybridModule.proofreadCloud(text);
      } catch (hybridError) {
        console.error('[Proofreader] Cloud fallback failed:', hybridError);
        throw new Error(`Proofreader error: ${e.message}\n\nCloud fallback also failed: ${hybridError.message}`);
      }
    }

    // No hybrid mode - throw original error with helpful message
    throw new Error(`Proofreader error: ${e.message || 'Unable to proofread text.'}\n\nEnable Hybrid mode for cloud fallback.`);
  }
}


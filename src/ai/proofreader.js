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
    const proof = await Proofreader.create();
    const res = await proof.proofread(text);
    // Format basic explanations if present
    if (Array.isArray(res?.edits)) {
      return res.edits.map(e => `• ${e.description || 'Edit'}: "${e.before}" → "${e.after}"`).join('\n');
    }
    return typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  } catch (e) {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.proofreadCloud(text);
    }
    throw new Error(`Proofreader error: ${e.message || 'Unable to proofread text. Enable Hybrid mode for cloud fallback.'}`);
  }
}


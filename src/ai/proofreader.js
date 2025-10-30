export async function proofread(text, { hybrid } = {}) {
  if (typeof Proofreader === 'undefined') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.proofreadCloud(text);
    }
    throw new Error('Proofreader not available');
  }

  const proof = await Proofreader.create();
  const res = await proof.proofread(text);
  // Format basic explanations if present
  if (Array.isArray(res?.edits)) {
    return res.edits.map(e => `• ${e.description || 'Edit'}: "${e.before}" → "${e.after}"`).join('\n');
  }
  return typeof res === 'string' ? res : JSON.stringify(res, null, 2);
}


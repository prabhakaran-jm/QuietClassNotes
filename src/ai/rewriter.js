export async function rewrite(text, { mode = 'beginner', hybrid } = {}) {
  if (typeof Rewriter === 'undefined') {
    if (hybrid) {
      const hybridModule = await import('./hybrid.js');
      return hybridModule.rewriteCloud(text, mode);
    }
    throw new Error('Rewriter not available');
  }
  const rewriter = await Rewriter.create({ tone: mode });
  return await rewriter.rewrite(text);
}


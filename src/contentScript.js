const IDS = {
  WRAP: 'qcn-wrap',
  SUM: 'qcn-sum',
  SIM: 'qcn-sim',
  TRN: 'qcn-trn',
  PRF: 'qcn-prf'
};

const CHIP_TO_TAB = {
  [IDS.SUM]: 'summarize',
  [IDS.SIM]: 'simplify',
  [IDS.TRN]: 'translate',
  [IDS.PRF]: 'proofread'
};

function createChips() {
  const wrap = document.createElement('div');
  wrap.id = IDS.WRAP;
  Object.assign(wrap.style, {
    position: 'absolute', zIndex: 2147483647, display: 'none', gap: '6px', flexDirection: 'row',
    background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '6px', borderRadius: '8px'
  });

  const mk = (id, label) => {
    const b = document.createElement('button');
    b.id = id; b.textContent = label;
    Object.assign(b.style, { background: 'transparent', color: 'white', border: '1px solid #aaa', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer' });
    return b;
  };

  wrap.append(
    mk(IDS.SUM, '✳️ Summarize'),
    mk(IDS.SIM, '✏️ Simplify'),
    mk(IDS.TRN, '🌐 Translate'),
    mk(IDS.PRF, '🧹 Proofread')
  );
  document.body.appendChild(wrap);
  return wrap;
}

const wrap = createChips();

function showChips(rect) {
  wrap.style.left = `${rect.left + window.scrollX}px`;
  wrap.style.top = `${rect.bottom + window.scrollY + 6}px`;
  wrap.style.display = 'flex';
}
function hideChips(){ wrap.style.display = 'none'; }

function getSelectionText() {
  const sel = window.getSelection();
  return sel && sel.toString().trim();
}

function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const r = sel.getRangeAt(0).getBoundingClientRect();
  if (!r) return null; return r;
}

document.addEventListener('mouseup', () => {
  const text = getSelectionText();
  if (text) {
    const rect = getSelectionRect();
    rect ? showChips(rect) : hideChips();
  } else hideChips();
});

document.addEventListener('mousedown', (e) => {
  if (!wrap.contains(e.target)) hideChips();
});

function sendSelectedText() {
  const text = getSelectionText();
  if (!text) return;
  chrome.runtime.sendMessage({ type: 'QCN_SELECTED_TEXT', text });
}

wrap.addEventListener('click', (e) => {
  const id = e.target?.id;
  if (!id || !CHIP_TO_TAB[id]) return;
  const text = getSelectionText();
  if (!text) return;
  
  // Send selected text with the tab to activate
  const tabToActivate = CHIP_TO_TAB[id];
  chrome.runtime.sendMessage({ 
    type: 'QCN_SELECTED_TEXT', 
    text,
    tab: tabToActivate
  });
  
  // Open side panel
  chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }).catch(()=>{});
});


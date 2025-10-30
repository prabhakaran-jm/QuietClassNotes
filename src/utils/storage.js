export function saveNote(id, data){
  return new Promise(res => chrome.storage.local.set({ ['note:'+id]: data }, res));
}

export function loadNote(id){
  return new Promise(res => chrome.storage.local.get('note:'+id, x => res(x['note:'+id])));
}


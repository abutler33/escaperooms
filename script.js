"use strict";
(() => {
const $ = s => document.querySelector(s);
document.addEventListener('error', event => {
  if (event.target.tagName !== 'IMG') return;
  const image = event.target;
  const fallback = document.createElement('p');
  fallback.className = 'image-fallback';
  fallback.textContent = 'This image is taking a break. Please ask your teacher to help reload it.';
  image.replaceWith(fallback);
}, true);
document.querySelectorAll('img').forEach(image => { if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event('error')); });
if (!$('#clue-dialog')) return;
const hashes = {"number": "100c30e28616c0013e9d6a5ebd6e6f396f84131b49646e3fd8c78a4804e7ac5c", "letters": "d54989388b350e9dd5ac9a96a9b234f19f14dee1adba36065e3579efa3081889", "word": "bc3da7941b52f48885a69d0b2c844f3acd5330808e97c89f5c136e7badbc38bc", "color": "01c9af5193d45df5736271840fd904dd31c2b0df461e1729e3929a8ee2d92472"};
const key = 'library-case-001-v1';
let solved = new Set();
try { solved = new Set(JSON.parse(localStorage.getItem(key) || '[]').filter(x => Object.hasOwn(hashes, x))); } catch {}
const dialog = $('#clue-dialog');
let opener;
document.querySelectorAll('.clue-tile').forEach(tile => tile.addEventListener('click', () => {
  opener = tile;
  $('#dialog-title').textContent = tile.dataset.title;
  const image = new Image();
  image.alt = tile.dataset.title + ' — investigation graphic';
  image.src = 'assets/' + tile.dataset.clue;
  $('#clue-image-wrap').replaceChildren(image);
  dialog.showModal();
}));
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close(); }});
function render(celebrate=false) {
  document.querySelectorAll('[data-lock]').forEach(form => {
    const open = solved.has(form.dataset.lock);
    form.classList.toggle('solved',open);
    form.querySelector('.lock-state').textContent = open ? '✓ Open' : 'Locked';
    form.querySelectorAll('input, select, button').forEach(el => el.disabled = open);
    if(open) form.querySelector('.feedback').textContent = 'Great detective work! Lock opened.';
  });
  $('#progress').value = solved.size;
  $('#progress-label').textContent = solved.size + ' of 4 locks open';
  $('#progress-percent').textContent = solved.size * 25 + '%';
  $('#celebration').hidden = solved.size !== 4;
  if(celebrate && solved.size===4) { $('#celebration').focus(); $('#celebration').scrollIntoView({behavior:'smooth',block:'center'}); }
}
async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b=>b.toString(16).padStart(2,'0')).join('');
}
document.querySelectorAll('[data-lock]').forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault();
  const id = form.dataset.lock;
  const value = id==='color' ? Array.from(form.querySelectorAll('select'),s=>s.value).join('') : form.elements.answer.value.trim().toUpperCase();
  const feedback = form.querySelector('.feedback');
  if(await digest(value) === hashes[id]) {
    solved.add(id);
    try { localStorage.setItem(key, JSON.stringify([...solved])); } catch {}
    render(true);
  } else { feedback.textContent = 'Not quite yet. Revisit the clues and try again.'; }
}));
$('#reset').addEventListener('click',()=>$('#reset-dialog').showModal());
$('#cancel-reset').addEventListener('click',()=>$('#reset-dialog').close());
$('#confirm-reset').addEventListener('click',()=>{
 solved.clear();
 try { localStorage.removeItem(key); } catch {}
 document.querySelectorAll('[data-lock]').forEach(f=>{f.reset();f.querySelector('.feedback').textContent='';});
 render(); $('#reset-dialog').close(); $('#reset').focus();
});
render();
})();

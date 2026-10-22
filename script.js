'use strict';
const lockDigests = ['100c30e28616c0013e9d6a5ebd6e6f396f84131b49646e3fd8c78a4804e7ac5c', 'd54989388b350e9dd5ac9a96a9b234f19f14dee1adba36065e3579efa3081889', 'bc3da7941b52f48885a69d0b2c844f3acd5330808e97c89f5c136e7badbc38bc', 'a4eda2f48baaf68008dad10c2143b5668e9f10c5fd61441ab674bf512197ce0a'];
const evidence = [
 {title:'The trophy shelf',icon:'trophy-icon.png',graphics:['trophy-clue.png']},
 {title:'The charging cart',icon:'laptop-icon.png',graphics:['cart-clue.png']},
 {title:'The brick bin',icon:'brick-icon.png',graphics:['brick-clue.png']},
 {title:'The reading hideout',icon:'treehouse-icon.jpeg',graphics:['treehouse-clue.jpeg']},
 {title:'The topic books',icon:'book-icon.png',graphics:['subject-clue.png']},
 {title:'The bracelet',icon:'bracelet-icon.png',graphics:['fiction-clue.png']}
];
function imageWithFallback(src,alt){
 const image=document.createElement('img'); image.src=`assets/${src}`; image.alt=alt;
 image.addEventListener('error',()=>{const note=document.createElement('p');note.className='fallback';note.textContent=`This image is taking a break. Ask your teacher for ${alt.toLowerCase()}.`;image.replaceWith(note);},{once:true});return image;
}
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function normalize(value){return value.trim().toUpperCase();}
const tiles=document.querySelector('#tiles');
if(tiles){
 const dialog=document.querySelector('#clue-dialog'),content=document.querySelector('#clue-content');
 evidence.forEach(item=>{const button=document.createElement('button');button.className='tile';button.type='button';button.setAttribute('aria-haspopup','dialog');button.append(imageWithFallback(item.icon,`${item.title} icon`));const title=document.createElement('span');title.textContent=item.title;const hint=document.createElement('small');hint.textContent='Click to inspect ↗';button.append(title,hint);button.addEventListener('click',()=>{document.querySelector('#dialog-title').textContent=item.title;content.replaceChildren();item.graphics.forEach((file,i)=>{const figure=document.createElement('figure');figure.append(imageWithFallback(file,`${item.title}, graphic ${i+1}`));if(item.graphics.length>1){const caption=document.createElement('figcaption');caption.textContent=`Display ${i+1} of ${item.graphics.length}`;figure.append(caption);}content.append(figure);});dialog.showModal();});tiles.append(button);});
 document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
 const storageKey='library-breakout-v1';let opened=new Set();
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))opened=new Set(saved.filter(i=>Number.isInteger(i)&&i>=0&&i<4&&lockDigests[i]));}catch{}
 const specs=[['6 Number Lock','Enter six digits. Example: 482907','text','numeric',6],['8 Letter Lock','Enter eight letters. Example: ABCDEFGH','text','text',8],['Word Lock','No spaces. Example: WORDWORDWORD','text','text',80],['5 Color Lock','Choose five colors in order.']];
 const colors=['Red','Orange','Yellow','Green','Blue','Purple','Pink','Black','White'];
 const list=document.querySelector('#lock-list');
 specs.forEach((spec,i)=>{const form=document.createElement('form');form.className='lock-card';form.dataset.lock=i;
 const heading=document.createElement('h3');heading.textContent=spec[0];const status=document.createElement('span');status.className='status';heading.append(status);form.append(heading);
 const label=document.createElement('label');label.id=`help-${i}`;label.textContent=spec[1];form.append(label);
 const row=document.createElement('div');row.className='entry-row';
 if(i===3){const group=document.createElement('div');group.className='colors';for(let n=0;n<5;n++){const select=document.createElement('select');select.required=true;select.setAttribute('aria-label',`Color ${n+1}`);select.append(new Option(`${n+1}. Color`,''));colors.forEach(color=>select.append(new Option(color,color.toUpperCase())));group.append(select);}form.append(group);}else{const input=document.createElement('input');input.type=spec[2];input.inputMode=spec[3];input.maxLength=spec[4];input.required=true;input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-label',spec[0]+' answer');input.setAttribute('aria-describedby',label.id);if(i===0)input.pattern='[0-9]{6}';if(i===1)input.pattern='[A-Za-z]{8}';if(i===2)input.pattern='[A-Za-z]+';row.append(input);}
 const submit=document.createElement('button');submit.type='submit';submit.textContent='Unlock';row.append(submit);form.append(row);const feedback=document.createElement('p');feedback.className='feedback';feedback.setAttribute('aria-live','polite');form.append(feedback);
 form.addEventListener('submit',async event=>{event.preventDefault();if(opened.has(i))return;if(!lockDigests[i]){feedback.textContent='Your teacher is still setting up this lock.';return;}const value=i===3?[...form.querySelectorAll('select')].map(s=>s.value).join(','):normalize(form.querySelector('input').value);submit.disabled=true;try{if(await digest(value)===lockDigests[i]){opened.add(i);try{localStorage.setItem(storageKey,JSON.stringify([...opened]));}catch{}update();}else{feedback.className='feedback error';feedback.textContent='Not quite. Take another look and try again.';}}catch{feedback.textContent='This browser could not check the lock. Ask your teacher for help.';}finally{if(!opened.has(i))submit.disabled=false;}});list.append(form);});
 function update(){list.querySelectorAll('form').forEach((form,i)=>{const solved=opened.has(i);form.classList.toggle('solved',solved);form.querySelector('.status').textContent=solved?'✓ Open':'Closed';form.querySelectorAll('input,select,button').forEach(control=>control.disabled=solved);if(solved){form.querySelector('.feedback').className='feedback';form.querySelector('.feedback').textContent='Great connection! This lock is open.';}});document.querySelector('#progress').value=opened.size;document.querySelector('#progress-text').textContent=`${opened.size} of 4 open`;const win=document.querySelector('#win');const wasHidden=win.hidden;win.hidden=opened.size!==4;if(wasHidden&&!win.hidden)win.focus();}
 
 const resetDialog=document.querySelector('#reset-dialog');document.querySelector('#reset').addEventListener('click',()=>resetDialog.showModal());document.querySelector('#cancel-reset').addEventListener('click',()=>resetDialog.close());document.querySelector('#confirm-reset').addEventListener('click',()=>{opened.clear();try{localStorage.removeItem(storageKey);}catch{}list.querySelectorAll('form').forEach(form=>{form.reset();form.querySelector('.feedback').textContent='';});update();resetDialog.close();});update();
}

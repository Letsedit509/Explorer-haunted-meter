const canvas=document.querySelector('#meter'),ctx=canvas.getContext('2d');
const labels=['Dead zone','Slightly active','Unexplained','Active','Extreme'];
const colors=['#72ed37','#c5ed35','#ffcf36','#ff7b22','#ff3025'];
let rating=3,fill=0.6,started=0,playing=false,transparent=false,busy=false,cancelled=false,checker=true,pulseStarted=null,alphaWebmSupported=false;
const $=s=>document.querySelector(s),duration=()=>Number($('#speed').value);
const buttons=labels.map((label,i)=>{const b=document.createElement('button');b.className='rating';b.style.setProperty('--rating-color',colors[i]);b.innerHTML=`<strong>${i+1}</strong><small>${label}</small>`;b.setAttribute('aria-label',`Level ${i+1}: ${label}`);b.onclick=()=>{rating=i+1;playing=false;fill=0;pulseStarted=null;sync();};$('#ratings').append(b);return b;});
function sync(){buttons.forEach((b,i)=>{b.classList.toggle('active',i+1===rating);b.setAttribute('aria-pressed',i+1===rating)});$('#rating-readout').textContent=`LEVEL ${rating}`;$('#export-level').textContent=rating;$('#state').textContent=playing?'SUPERNATURAL ACTIVITY DETECTED':fill?'READING COMPLETE · '+labels[rating-1].toUpperCase():'READY TO INVESTIGATE';}
$('#play').onclick=()=>{fill=0;pulseStarted=null;started=performance.now();playing=true;sync()};$('#reset').onclick=()=>{playing=false;fill=0;pulseStarted=null;sync()};$('#speed').oninput=()=>{$('#duration').textContent=duration().toFixed(1)+'s';if(playing)started=performance.now()-fill/(rating/5)*duration()*1000};function updateDisplay(){transparent=$('#display-mode').value==='overlay';$('.canvas-wrap').classList.toggle('checker',transparent&&checker);$('#background').setAttribute('aria-pressed',checker);}
$('#display-mode').onchange=()=>{updateDisplay();$('#format').value=transparent?'png':'webm';};
$('#background').onclick=()=>{checker=!checker;updateDisplay()};
// Three distinct half-second pulses, followed by a calm hold. Never changes fill width.
function endingPulse(elapsed){return elapsed>=0&&elapsed<1.8?Math.sin(Math.PI*(elapsed%.6)/.6)**2:0;}

// Seeded surface texture stays stable between preview and exported frames.
let seed=509;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const texture=document.createElement('canvas');texture.width=960;texture.height=540;const tx=texture.getContext('2d'),pixels=tx.createImageData(960,540);for(let i=0;i<pixels.data.length;i+=4){const v=random()*180;pixels.data[i]=v;pixels.data[i+1]=v;pixels.data[i+2]=v;pixels.data[i+3]=random()*50}tx.putImageData(pixels,0,0);
const motes=Array.from({length:100},()=>({x:random(),y:random(),r:random()*4+1,s:random()*22+10}));
function text(c,s,x,y,size,color,font='Georgia'){c.font=`900 ${size}px ${font}`;c.textAlign='center';c.fillStyle=color;c.fillText(s,x,y)}
export function progress(elapsed,seconds,level){return Math.min(1,Math.max(0,elapsed/seconds))*level/5}
function draw(c,amount,t,alpha=false,pulse=0){const W=1920,H=1080;c.clearRect(0,0,W,H);c.save();
if(!alpha){c.fillStyle='#070c10';c.fillRect(0,0,W,H);const bg=c.createRadialGradient(960,490,60,960,490,1100);bg.addColorStop(0,'#182329');bg.addColorStop(1,'#020506');c.fillStyle=bg;c.fillRect(0,0,W,H);c.globalAlpha=.23;c.drawImage(texture,0,0,W,H);c.globalAlpha=1;for(let i=0;i<25;i++){const y=i*43+Math.sin(i*44)*12;c.fillStyle=`rgba(118,154,164,${.015+(i%3)*.008})`;c.fillRect(0,y,W,2+i%3)}}
c.shadowColor='#000';c.shadowBlur=15;c.shadowOffsetY=7;text(c,'EXPLORER’S',960,303,108,'#d8d8c6');c.shadowColor='#e9341755';c.shadowBlur=35;text(c,'HAUNTED METER',960,437,129,'#e84a2d','Georgia');c.shadowBlur=0;c.shadowOffsetY=0;
const x=184,y=532,w=1552,h=351,cell=w/5,barY=670,barH=121;
c.fillStyle='#090f10eb';c.fillRect(x,y,w,h);c.strokeStyle='#697776';c.lineWidth=4;c.strokeRect(x,y,w,h);c.strokeStyle='#69777666';c.lineWidth=2;c.beginPath();c.moveTo(x,656);c.lineTo(x+w,656);c.moveTo(x,807);c.lineTo(x+w,807);c.stroke();
for(let i=0;i<5;i++){const cx=x+cell*(i+.5);c.strokeStyle='#7d888449';c.beginPath();c.moveTo(x+cell*i,y);c.lineTo(x+cell*i,y+h);c.stroke();text(c,String(i+1),cx,636,103,'#e0dfca');text(c,labels[i].toUpperCase(),cx,859,i===1?32:37,amount>i/5?colors[i]:'#8c9589','"Barlow Condensed", "Arial Narrow", sans-serif')}
c.save();c.beginPath();c.rect(x+9,barY,w-18,barH);c.clip();const inner=w-18,end=Math.max(0,Math.min(inner,w*amount-9));
const grad=c.createLinearGradient(x+9,0,x+w-9,0);colors.forEach((color,i)=>grad.addColorStop(i/4,color));c.fillStyle='#081309';c.fillRect(x+9,barY,inner,barH);
if(amount>0){c.save();c.beginPath();c.rect(x+9,barY,end,barH);c.clip();c.fillStyle=grad;c.globalAlpha=.67;c.fillRect(x+9,barY+20,end,barH);c.globalAlpha=1;
for(let layer=0;layer<3;layer++){c.beginPath();c.moveTo(x+9,barY+barH);for(let u=0;u<=end+3;u+=3){const wave=Math.sin(u*.027-t*3+layer*2)*4+Math.sin(u*.064+t*2)*2;c.lineTo(x+9+u,barY+23+wave+layer*5)}c.lineTo(x+9+end,barY+barH);c.closePath();c.fillStyle=grad;c.globalAlpha=[.35,.25,.45][layer];c.fill();c.globalAlpha=1;c.strokeStyle=grad;c.shadowColor=colors[Math.min(4,Math.floor(amount*4))];c.shadowBlur=18;c.lineWidth=layer===0?3:1;c.stroke()}
for(const p of motes){const bx=x+9+p.x*inner,by=barY+barH-((t*p.s+p.y*barH)%barH);if(bx>x+9+end)continue;c.beginPath();c.arc(bx,by,p.r,0,Math.PI*2);c.strokeStyle='#eaffbd99';c.lineWidth=1;c.shadowBlur=8;c.stroke()}
c.restore()}
for(let i=0;i<60;i++){c.fillStyle='#0009';c.fillRect(x+10+i*inner/60,barY+45,4,barH-45)}c.restore();
// Cinematic smoke is omitted entirely from transparent overlays.
if(!alpha)for(let i=0;i<9;i++){const sx=200+i*195+Math.sin(t*.28+i)*70,sy=943+Math.sin(i*2+t*.3)*38;const fog=c.createRadialGradient(sx,sy,0,sx,sy,180);fog.addColorStop(0,'rgba(139,173,177,.07)');fog.addColorStop(1,'rgba(139,173,177,0)');c.fillStyle=fog;c.beginPath();c.ellipse(sx,sy,180,62,Math.sin(i+t*.2)*.3,0,Math.PI*2);c.fill()}
if(alpha&&amount>0){c.save();const glow=colors[Math.max(0,Math.min(4,Math.round(amount*5)-1))];c.strokeStyle=glow;c.shadowColor=glow;c.shadowBlur=10+pulse*28;c.globalAlpha=.17+pulse*.55;c.lineWidth=2+pulse*2;c.strokeRect(x,y,w,h);c.beginPath();c.moveTo(x+9,barY+24);c.lineTo(x+9+Math.max(0,Math.min(w-18,w*amount-9)),barY+24);c.stroke();c.restore()}
// Distress inside the artwork, never on transparent empty margins.
c.save();c.globalAlpha=.17;c.globalCompositeOperation='source-atop';c.drawImage(texture,0,0,W,H);c.restore();c.restore();}
function frame(now){if(playing&&!busy){fill=progress((now-started)/1000,duration(),rating);if(fill>=rating/5){playing=false;pulseStarted=started+duration()*1000;sync()}}if(!busy)draw(ctx,fill,now/1000,transparent,transparent&&pulseStarted!==null?endingPulse((now-pulseStarted)/1000):0);requestAnimationFrame(frame)}sync();requestAnimationFrame(frame);
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
const crcTable=Array.from({length:256},(_,n)=>{for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});function crc(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function zip(files){const pieces=[],directory=[];let offset=0;for(const [name,data]of files){const n=new TextEncoder().encode(name),checksum=crc(data);const header=new Uint8Array(30+n.length),v=new DataView(header.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,checksum,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,n.length,true);header.set(n,30);pieces.push(header,data);const central=new Uint8Array(46+n.length),d=new DataView(central.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,checksum,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,n.length,true);d.setUint32(42,offset,true);central.set(n,46);directory.push(central);offset+=header.length+data.length}const size=directory.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);return new Blob([...pieces,...directory,end],{type:'application/zip'})}
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
// Retain each rendered Blob and attached native link until explicit removal.
// A fresh Save click restores user activation lost during asynchronous rendering.
const pendingZips=new Map();
async function keepZip(blob,name,frameCount){
 if(!(blob instanceof Blob)||blob.size<22)throw new Error('ZIP creation failed: no archive data was generated.');
 const end=new DataView(await blob.slice(-22).arrayBuffer());
 if(end.getUint32(0,true)!==0x06054b50||end.getUint16(10,true)!==frameCount+1)throw new Error('ZIP creation failed: archive directory validation did not pass.');
 const url=URL.createObjectURL(blob),card=document.createElement('article');card.className='zip-card';
 const heading=document.createElement('strong');heading.textContent=name;
 const info=document.createElement('p');info.textContent=`ZIP ready · ${frameCount} frames · ${(blob.size/1048576).toFixed(2)} MiB (${blob.size.toLocaleString('en-US')} bytes)`;
 const actions=document.createElement('div'),save=document.createElement('button'),link=document.createElement('a'),remove=document.createElement('button'),status=document.createElement('p');
 save.textContent='Save ZIP';save.className='save-zip';link.textContent='Download ZIP (fallback)';link.href=url;link.download=name;link.className='zip-link';remove.textContent='Remove';status.className='save-status';status.setAttribute('role','status');
 status.textContent='Rendered, not saved yet. Click Save ZIP to choose where to save it.';
 actions.append(save,link,remove);card.append(heading,info,actions,status);$('#zip-downloads').append(card);pendingZips.set(card,{blob,url});
 link.addEventListener('click',()=>{status.textContent='Download requested. Check Edge’s Downloads (Ctrl+J). Browsers do not report whether this fallback was blocked or saved; you can retry Save ZIP.';status.classList.remove('save-error')});
 save.addEventListener('click',async()=>{
  save.disabled=true;status.classList.remove('save-error');let writable;
  try{
   if(typeof window.showSaveFilePicker==='function'){
    // Must be invoked directly from this user's click, before any asynchronous work.
    const handle=await window.showSaveFilePicker({suggestedName:name,types:[{description:'ZIP archive',accept:{'application/zip':['.zip']}}]});
    status.textContent='Saving ZIP…';writable=await handle.createWritable();await writable.write(blob);await writable.close();writable=null;
    status.textContent=`Saved successfully: ${name} (${blob.size.toLocaleString('en-US')} bytes).`;
   }else{link.click();}
  }catch(error){
   if(writable)try{await writable.abort()}catch{}
   status.classList.add('save-error');status.textContent=error.name==='AbortError'?'Save cancelled. Your ZIP is still ready; click Save ZIP to retry.':`Save failed: ${error.message||error.name}. Your ZIP is still ready. Retry Save ZIP or use Download ZIP (fallback).`;
  }finally{save.disabled=false}
 });
 remove.onclick=()=>{if(save.disabled){status.textContent='Wait until saving finishes before removing this ZIP.';return}URL.revokeObjectURL(url);pendingZips.delete(card);card.remove()};
}
window.addEventListener('unload',()=>{for(const {url}of pendingZips.values())URL.revokeObjectURL(url)});
async function pngExport(level,seconds){const files=[],count=Math.round((seconds+2)*30);for(let i=0;i<count;i++){if(cancelled)throw new Error('Export cancelled');draw(ctx,progress(i/30,seconds,level),i/30,true,endingPulse(i/30-seconds));const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG encoding failed: the browser returned no frame data.')),'image/png'));files.push([`frame_${String(i).padStart(5,'0')}.png`,new Uint8Array(await blob.arrayBuffer())]);if(i%5===0){$('#export-status').textContent=`Level ${level} · frame ${i+1} of ${count}`;await pause()}}files.push(['IMPORT.txt',new TextEncoder().encode(`Explorer's Haunted Meter — Level ${level}\n1920x1080, 30 fps, transparent PNG sequence.\nImport frame_00000.png as an image sequence at 30fps in your editor.\nOr convert with FFmpeg to an alpha-capable MOV:\nffmpeg -framerate 30 -i frame_%05d.png -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le haunted-level-${level}.mov\nTest alpha support in your Filmora version.\n`)]);await keepZip(zip(files),`haunted-level-${level}-transparent.zip`,count)}
async function videoExport(level,seconds,alpha=false){if(alpha&&!alphaWebmSupported)throw new Error("This browser cannot preserve WebM alpha. Use transparent PNG sequence instead.");if(!canvas.captureStream||!window.MediaRecorder)throw new Error('Video recording is unavailable. Choose PNG sequence instead.');const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw new Error('WebM is unsupported. Choose PNG sequence instead.');const stream=canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:14000000}),chunks=[];try{await new Promise((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=resolve;rec.onerror=()=>reject(new Error('Video recorder failed'));draw(ctx,0,0,alpha);rec.start();const begin=performance.now();function record(now){const elapsed=(now-begin)/1000;draw(ctx,progress(elapsed,seconds,level),elapsed,alpha,alpha?endingPulse(elapsed-seconds):0);$('#export-status').textContent=`Recording level ${level} · ${Math.min(elapsed,seconds+2).toFixed(1)} / ${seconds+2}s`;if(cancelled||elapsed>=seconds+2){rec.stop();return}requestAnimationFrame(record)}requestAnimationFrame(record)});if(cancelled)throw new Error('Export cancelled');download(new Blob(chunks,{type:mime}),`haunted-level-${level}${alpha?"-transparent":""}.webm`)}finally{stream.getTracks().forEach(t=>t.stop())}}
async function runExport(all){if(busy)return;busy=true;cancelled=false;playing=false;sync();const controls=[...document.querySelectorAll('button,input,select')].filter(e=>e.id!=='cancel'&&!e.closest('#zip-downloads'));controls.forEach(e=>e.disabled=true);$('#cancel').hidden=false;try{await document.fonts.ready;const seconds=duration(),levels=all?[1,2,3,4,5]:[rating];for(const level of levels){if($('#format').value==='png')await pngExport(level,seconds);else await videoExport(level,seconds,$('#format').value==='webm-alpha')}$('#export-status').textContent=$('#format').value==='png'?`Rendering complete — ${levels.length} ZIP file${levels.length===1?'':'s'} ready. Click Save ZIP below.`:'Video download requested. Check your browser’s Downloads list; the page cannot confirm that it was saved.'}catch(e){$('#export-status').textContent=e.message}finally{busy=false;controls.forEach(e=>e.disabled=false);$('#cancel').hidden=true}}
$('#export').onclick=()=>runExport(false);$('#export-all').onclick=()=>runExport(true);$('#cancel').onclick=()=>{cancelled=true};
window.hauntedMeter={progress,draw,endingPulse,getState:()=>({rating,fill,playing,busy,transparent,alphaWebmSupported})};
// isTypeSupported only confirms a codec, not alpha. Record AND decode a small
// transparent sample before offering transparent WebM on this specific browser.
async function checkAlphaWebm(){
 const option=$('#format option[value="webm-alpha"]');let stream,video,url,rec;
 try{
  if(!window.MediaRecorder||!canvas.captureStream)throw new Error('Recording unavailable');
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  if(!mime)throw new Error('No WebM encoder');
  const sample=document.createElement('canvas');sample.width=64;sample.height=64;const sc=sample.getContext('2d');sc.fillStyle='#ff0000';sc.fillRect(24,24,16,16);
  stream=sample.captureStream(30);rec=new MediaRecorder(stream,{mimeType:mime});const chunks=[];
  await new Promise((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=resolve;rec.onerror=reject;rec.start();setTimeout(()=>{if(rec.state==='recording')rec.stop()},300)});
  url=URL.createObjectURL(new Blob(chunks,{type:mime}));video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Alpha decode timed out')),4000);video.onloadeddata=()=>{clearTimeout(timer);resolve()};video.onerror=()=>{clearTimeout(timer);reject(new Error('Alpha decode unavailable'))};video.src=url;video.load()});
  const decoded=document.createElement('canvas');decoded.width=64;decoded.height=64;const dc=decoded.getContext('2d',{willReadFrequently:true});dc.drawImage(video,0,0);
  const clear=dc.getImageData(2,2,1,1).data,red=dc.getImageData(32,32,1,1).data;
  alphaWebmSupported=clear[3]===0&&red[0]>150&&red[3]>240;
 }catch{alphaWebmSupported=false}finally{
  if(rec?.state==='recording')rec.stop();stream?.getTracks().forEach(t=>t.stop());if(video){video.removeAttribute('src');video.load()}if(url)URL.revokeObjectURL(url);
  option.disabled=!alphaWebmSupported;option.textContent=alphaWebmSupported?'Transparent WebM · alpha verified in this browser':'Transparent WebM · unavailable in this browser';
  $('#alpha-support').textContent=alphaWebmSupported?'WebM alpha passed a recorded playback test. Test compatibility in Filmora before editing.':'This browser does not preserve WebM alpha in the playback test. Choose PNG sequence ZIP for real transparency.';
 }
}
checkAlphaWebm();

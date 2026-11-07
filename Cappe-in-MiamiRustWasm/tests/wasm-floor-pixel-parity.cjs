'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8788, debugPort = 9241;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-v130-'));
const server = createGameServer();
let chrome;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, ms=20000) { const end=Date.now()+ms; let last; while(Date.now()<end) { try { last=await fn(); if(last) return last; } catch(e) {} await wait(250); } throw Error('timeout '+String(last||'')); }
(async()=>{
 try {
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});
  chrome=spawn(chromePath,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-allow-origins=*','--remote-debugging-port='+debugPort,'--user-data-dir='+profile,'--window-size=1280,720','http://127.0.0.1:'+port+'/?renderer=wasm&wasmDiagnostics=1'],{stdio:'ignore',windowsHide:true});
  const version=await until(async()=>{const r=await fetch('http://127.0.0.1:'+debugPort+'/json/version');return r.ok?await r.json():null});
  const targets=await (await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
  const page=targets.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  if(!page) throw Error('Chrome page target missing');
  const ws=new WebSocket(page.webSocketDebuggerUrl), pending=new Map(), exceptions=[]; let seq=0;
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.text);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}});
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
  await call('Runtime.enable'); await call('Page.enable');
  const evalJS=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result?.value};
  const before=await until(async()=>{const r=await evalJS("(()=>({status:window.HM_WASM_RENDERER?.status,active:window.HM_WASM_RENDERER?.active,directReady:window.HM_WASM_RENDERER?.directReady,directError:window.HM_WASM_RENDERER?.directError}))()");return r&&r.active?r:null},20000);
  const started=await evalJS("(()=>{try{newGame();return true}catch(e){return String(e)}})()");
  const gameState=await evalJS("typeof st==='undefined'?null:st");
  await wait(2500);
   const barrelScorchRuntime=await evalJS("(()=>{const barrels=EXP.world.barrels,b=barrels[0]||{x:P.x+60,y:P.y+40,r:12,t:0,dead:false};if(!barrels.includes(b))barrels.push(b);b.dead=false;b.t=.001;const before=HM_WASM_RENDERER.directExplosionScorchCalls;EXP.worldTick(1/60);return HM_WASM_RENDERER.directExplosionScorchCalls-before})()");
   const runtimeCanvas=await evalJS("(()=>({directCommandFrames:HM_WASM_RENDERER.directCommandFrames,directFurnitureFrames:HM_WASM_RENDERER.directFurnitureFrames,directActorFrames:HM_WASM_RENDERER.directActorFrames,directHudTextFrames:HM_WASM_RENDERER.directHudTextFrames,directCanvasImageFrames:HM_WASM_RENDERER.directCanvasImageFrames,directCanvasLayerCalls:HM_WASM_RENDERER.directCanvasLayerCalls,directBloodSplatterCalls:HM_WASM_RENDERER.directBloodSplatterCalls,directEnemyShadowCalls:HM_WASM_RENDERER.directEnemyShadowCalls,directExplosionScorchCalls:HM_WASM_RENDERER.directExplosionScorchCalls,directImageSmoothingCalls:HM_WASM_RENDERER.directImageSmoothingCalls,directImageDataCreateCalls:HM_WASM_RENDERER.directImageDataCreateCalls,directImageDataPutCalls:HM_WASM_RENDERER.directImageDataPutCalls,directClearRectCalls:HM_WASM_RENDERER.directClearRectCalls,directTextImageFrames:HM_WASM_RENDERER.directTextImageFrames,directMapFrames:HM_WASM_RENDERER.directMapFrames,directDustFrames:HM_WASM_RENDERER.directDustFrames,directDustCommands:HM_WASM_RENDERER.directDustCommands,directSparkFrames:HM_WASM_RENDERER.directSparkFrames,directSparkCommands:HM_WASM_RENDERER.directSparkCommands,top:HM_WASM_RENDERER.getResidualCanvasTop(12),properties:Object.entries(HM_WASM_RENDERER.canvasPropertyWriteCounts).sort((a,b)=>b[1]-a[1]).slice(0,8),propertySamples:Object.fromEntries(Object.entries(HM_WASM_RENDERER.canvasPropertyWriteSamples).map(([k,v])=>[k,String(v).split('\\n').slice(0,6).join('\\n')])),samples:Object.fromEntries(Object.entries(HM_WASM_RENDERER.canvasOperationSamples).map(([k,v])=>[k,String(v).split('\\n').slice(0,6).join('\\n')]))}))()");
   await evalJS("(()=>{window.requestAnimationFrame=()=>0;return true})()");
   await wait(50);
   const killEffectRuntime=await evalJS("(()=>{if(!enemies.length)return{error:'smoke map has no enemy to kill'};const before=HM_WASM_RENDERER.directBloodSplatterCalls,ops=HM_WASM_RENDERER.canvasOperationCounts.quadraticCurveTo||0;kill(enemies[0],7,2);return{directCalls:HM_WASM_RENDERER.directBloodSplatterCalls-before,hostQuadraticCalls:(HM_WASM_RENDERER.canvasOperationCounts.quadraticCurveTo||0)-ops,remainingEnemies:enemies.length}})()");
   const enemyShadowParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=320;c.height=180;return c.getContext('2d')},reference=make(),direct=make();
     const commands=new Float64Array([42,38,14,8,.72,108,76,18,10,.35,242,119,11,7,.9]);
     for(let offset=0;offset<commands.length;offset+=5){reference.save();reference.globalAlpha=commands[offset+4];reference.fillStyle='rgba(0,0,0,.32)';reference.beginPath();reference.ellipse(commands[offset],commands[offset+1],commands[offset+2],commands[offset+3],0,0,6.28);reference.fill();reference.restore()}
     const directCount=HM_WASM_RENDERER.direct.drawEnemyShadows(direct,commands,0,3);
     const a=reference.getImageData(0,0,320,180).data,b=direct.getImageData(0,0,320,180).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{shadows:commands.length/5,directCount,differentChannels,maxDifference};
   })()`);
   const floorParity=await evalJS(`(()=>{
     const width=WW,height=WH,tileIndex=2,seed=0x5a17;
     const make=()=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c.getContext('2d')};
     const reference=make(),rust=make(),referenceRng=rng(seed),rustRng=rng(seed);
     if(!HM_WASM_RENDERER.paintFloorGrain(rust,width,height,rustRng)) return {error:'grain'};
     for(let i=0,count=Math.round(width*height/160);i<count;i++){
       reference.fillStyle=referenceRng()<.5?'rgba(0,0,0,.09)':'rgba(255,255,255,.06)';
       reference.fillRect(Math.floor(referenceRng()*width),Math.floor(referenceRng()*height),1+Math.floor(referenceRng()*2),1);
     }
     const pattern=reference.createPattern(FTILES,'repeat');
     for(const room of rooms){if(room===rooms.hall)continue;reference.save();reference.beginPath();reference.rect(room.x,room.y,room.w,room.h);reference.clip();reference.translate(-tileIndex*24,0);reference.globalAlpha=.45;reference.fillStyle=pattern;reference.fillRect(room.x,room.y,room.w+48,room.h+48);reference.restore()}
     reference.fillStyle='rgba(0,0,0,.32)';for(const rect of sol)reference.fillRect(rect[0]+5,rect[1]+7,rect[2],rect[3]);
     reference.fillStyle='rgba(0,0,0,.07)';for(let x=0;x<width;x+=24)reference.fillRect(x,0,1,height);for(let y=0;y<height;y+=24)reference.fillRect(0,y,width,1);
     const tileResult=HM_WASM_RENDERER.paintFloorTiles(rust,rooms,tileIndex,FTILES);
     const finishResult=HM_WASM_RENDERER.paintFloorFinish(rust,sol,width,height);
     const expected=reference.getImageData(0,0,width,height).data,actual=rust.getImageData(0,0,width,height).data;
     let differentChannels=0,maxDifference=0,totalDifference=0;for(let i=0;i<expected.length;i++){const d=Math.abs(expected[i]-actual[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d;totalDifference+=d}
     return{width,height,rooms:rooms.length,solids:sol.length,tileResult,finishResult,sameRng:referenceRng.getState()===rustRng.getState(),differentChannels,maxDifference,meanDifference:totalDifference/expected.length}
   })()`);
   const mapTextureParity=await evalJS(`(()=>{
     const width=WW,height=WH,make=()=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c.getContext('2d')};
     const reference=make(),rust=make(),referenceTextures={
       wallFace:ready(WALLT)?cell(WALLT,'wallFace',0,0,24,24):null,
       furnitureFaces:ready(FURNT)?Array.from({length:6},(_,i)=>cell(FURNT,'furn'+i,i*24,0,24,24)):null,
       doorOpen:ready(DOORT)?cell(DOORT,'doorOpen',24,0,24,24):null
     };
     const textures={wallSheet:ready(WALLT)?WALLT:null,furnitureSheet:ready(FURNT)?FURNT:null,doorSheet:ready(DOORT)?DOORT:null};
     if(!referenceTextures.wallFace&&!referenceTextures.furnitureFaces&&!referenceTextures.doorOpen)return{error:'map texture assets unavailable'};
     for(let i=0;i<sol.length;i++){
       const [x,y,w,h]=sol[i],thin=Math.min(w,h)<=26;
       if(thin&&referenceTextures.wallFace){const pat=reference.createPattern(referenceTextures.wallFace,'repeat');reference.save();reference.beginPath();reference.rect(x,y,w,h);reference.clip();reference.fillStyle=pat;reference.fillRect(x,y,w,h);reference.restore()}
       else if(referenceTextures.furnitureFaces){const face=referenceTextures.furnitureFaces[i%6];reference.save();reference.beginPath();reference.rect(x,y,w,h);reference.clip();reference.imageSmoothingEnabled=false;reference.fillStyle=reference.createPattern(face,'repeat');reference.fillRect(x,y,w,h);reference.restore()}
     }
     if(referenceTextures.doorOpen){for(const [x,y,w,h] of keep){const along=Math.min(w,h);if(along>110||along<20)continue;reference.save();reference.imageSmoothingEnabled=false;reference.translate(x+w/2,y+h/2);if(w>h)reference.rotate(Math.PI/2);reference.drawImage(referenceTextures.doorOpen,-along/2,-T/2,along,T);reference.restore()}}
     const rendered=HM_WASM_RENDERER.paintMapTextures(rust,sol,keep,textures,T);
     const expected=reference.getImageData(0,0,width,height).data,actual=rust.getImageData(0,0,width,height).data;
     let differentChannels=0,maxDifference=0,totalDifference=0,maxAt=-1;for(let i=0;i<expected.length;i++){const d=Math.abs(expected[i]-actual[i]);if(d)differentChannels++;if(d>maxDifference){maxDifference=d;maxAt=i}totalDifference+=d}
     return{width,height,solids:sol.length,openings:keep.length,rendered,differentChannels,maxDifference,meanDifference:totalDifference/expected.length}
   })()`);
   const fogSpriteParity=await evalJS(`(()=>{
     const rings=[[60,50,60],[130,72,85],[210,140,74],[300,102,116],[420,62,71],[90,211,62],[245,50,96],[355,204,78],[470,150,90]];
     const reference=document.createElement('canvas');reference.width=512;reference.height=256;const g=reference.getContext('2d');
     for(const [x,y,r] of rings){const gradient=g.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,'rgba(255,255,255,.55)');gradient.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gradient;g.fillRect(0,0,512,256)}
     const rust=document.createElement('canvas');if(!HM_WASM_RENDERER.createFogSprite(rust,rings))return{error:'Rust fog sprite generation rejected valid rings'};
     const expected=g.getImageData(0,0,512,256).data,actual=rust.getContext('2d').getImageData(0,0,512,256).data;
     let differentAlpha=0,maxAlphaDifference=0,totalAlphaDifference=0,maxRgbDifference=0,maxVisibleRgbDifference=0,visibleRgbSamples=0;
     for(let i=0;i<expected.length;i+=4){const da=Math.abs(expected[i+3]-actual[i+3]);if(da)differentAlpha++;maxAlphaDifference=Math.max(maxAlphaDifference,da);totalAlphaDifference+=da;if(expected[i+3]>=16&&actual[i+3]>=16){for(let channel=0;channel<3;channel++)maxRgbDifference=Math.max(maxRgbDifference,Math.abs(expected[i+channel]-actual[i+channel]));visibleRgbSamples++}if(expected[i+3]>=64&&actual[i+3]>=64){for(let channel=0;channel<3;channel++)maxVisibleRgbDifference=Math.max(maxVisibleRgbDifference,Math.abs(expected[i+channel]-actual[i+channel]))}}
     return{width:512,height:256,rings:rings.length,differentAlpha,maxAlphaDifference,meanAlphaDifference:totalAlphaDifference/(expected.length/4),maxRgbDifferenceWhenAlphaAtLeast16:maxRgbDifference,maxRgbDifferenceWhenAlphaAtLeast64:maxVisibleRgbDifference,visibleRgbSamples}
   })()`);
   const fogRuntime=await evalJS(`(()=>{const previous=EXP.fx.kind,canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;try{EXP.fx.kind='neblina';EXP.drawFx(canvas.getContext('2d'));return{spriteCommands:HM_WASM_RENDERER.fogSpriteCommands,fogCommands:HM_WASM_RENDERER.fogCommands}}finally{EXP.fx.kind=previous}})()`);
   const pauseUiParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     let differentChannels=0,maxDifference=0;
     for(const hoverIndex of [-1,0,1]){
       const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;return c.getContext('2d')};
       const reference=make(),direct=make(),g=reference;
       g.save();g.fillStyle='rgba(5,0,18,.78)';g.fillRect(0,0,960,600);g.textAlign='center';g.fillStyle='#ff2e93';g.font='64px Impact, sans-serif';g.fillText('PAUSADO',480,260);
       for(const [index,label,color,offsetY] of [[0,'ESC · CONTINUAR','#ffffff',26],[1,'M · LOBBY','#ffd23f',82]]){
         const x=270,y=300+offsetY-23+4,over=hoverIndex===index;
         g.fillStyle=over?'rgba(255,46,147,.35)':'rgba(20,0,40,.85)';g.fillRect(x,y,420,46);
         g.strokeStyle=color;g.lineWidth=over?3:2;g.strokeRect(x,y,420,46);
         g.fillStyle=color;g.font='bold 22px Impact, sans-serif';g.textBaseline='middle';g.fillText(label,480,y+24);
       }g.restore();
       if(!HM_WASM_RENDERER.drawPauseUiDirect(direct,960,600,hoverIndex))return{error:'direct Rust canvas API was not used'};
       const a=reference.getImageData(0,0,960,600).data,b=direct.getImageData(0,0,960,600).data;
       for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     }
     return{hoverCases:3,differentChannels,maxDifference};
   })()`);
   const fxOverlayParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const cases=[[0,1450,.7,.35,true],[0,1450,.7,.35,false],[1,2200,12,0,true],[2,2200,.8,0,true],[3,2200,.55,0,true],[3,2200,.55,0,false]];
     let differentChannels=0,maxDifference=0,directFrames=0;
     for(const [stage,now,primary,secondary,enabled] of cases){
       const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;return c.getContext('2d')},reference=make(),direct=make(),g=reference;
       g.save();
       if(stage===0&&enabled){if(primary>0){g.fillStyle='rgba(220,235,255,'+(primary*.35)+')';g.fillRect(0,0,960,600)}if(secondary>0){g.fillStyle='rgba(255,46,147,'+(secondary*.35)+')';g.fillRect(0,0,960,600)}}
       else if(stage===1&&primary>0){g.fillStyle='rgba(255,30,60,'+(.06+.07*Math.sin(now/110))+')';g.fillRect(0,0,960,600)}
       else if(stage===2&&primary>0){const bh=78*Math.min(1,primary/1.3*1.6);g.fillStyle='#000';g.fillRect(0,0,960,bh);g.fillRect(0,600-bh,960,bh)}
       else if(stage===3&&enabled&&primary>0){g.fillStyle='rgba(255,46,91,'+primary+')';g.fillRect(0,0,960,600)}
       g.restore();
       const before=HM_WASM_RENDERER.directFxOverlayFrames;
       if(!HM_WASM_RENDERER.drawFxOverlays(direct,stage,960,600,now,primary,secondary,enabled))return{error:'direct overlay draw failed'};
       if(HM_WASM_RENDERER.directFxOverlayFrames!==before+1)return{error:'overlay bypassed direct Rust Canvas API'};
       directFrames++;
       const a=reference.getImageData(0,0,960,600).data,b=direct.getImageData(0,0,960,600).data;
       for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     }
     return{cases:cases.length,directFrames,differentChannels,maxDifference};
   })()`);
   const rainParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const cases=[1,2],drops=[{x:12.25,y:20.5,l:33.75},{x:110.1,y:240.8,l:21.5},{x:500.5,y:301.25,l:52.125},{x:899.9,y:590.25,l:7.75}];
     let differentChannels=0,maxDifference=0,directFrames=0;
     for(const step of cases){
       const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;return c.getContext('2d')},reference=make(),direct=make(),g=reference;
       g.save();g.strokeStyle='rgba(170,210,255,.38)';g.lineWidth=1;g.beginPath();
       for(let i=0;i<drops.length;i+=step){const d=drops[i];g.moveTo(d.x,d.y);g.lineTo(d.x-d.l*.18,d.y+d.l)}g.stroke();g.restore();
       const before=HM_WASM_RENDERER.directRainFrames;
       if(!HM_WASM_RENDERER.drawRain(direct,drops,step))return{error:'direct rain draw failed'};
       if(HM_WASM_RENDERER.directRainFrames!==before+1)return{error:'rain bypassed direct Rust Canvas API'};
       directFrames++;
       const a=reference.getImageData(0,0,960,600).data,b=direct.getImageData(0,0,960,600).data;
       for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     }
     return{cases:cases.length,directFrames,differentChannels,maxDifference};
   })()`);
   const moteParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const times=[350,1400],motes=[{x:12.25,y:20.5,r:2.5,p:.2},{x:110.1,y:240.8,r:1.75,p:1.4},{x:500.5,y:301.25,r:3,p:3.1},{x:899.9,y:590.25,r:2.25,p:5.6}];
     let differentChannels=0,maxDifference=0,directFrames=0;
     for(const now of times){
       const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;return c.getContext('2d')},reference=make(),direct=make(),g=reference;
       g.save();g.fillStyle='rgba(255,230,190,.55)';for(const m of motes){g.globalAlpha=.25+.35*Math.abs(Math.sin(now/700+m.p));g.fillRect(m.x,m.y,m.r,m.r)}g.restore();
       const before=HM_WASM_RENDERER.directWeatherMoteFrames;
       if(!HM_WASM_RENDERER.drawWeatherMotes(direct,motes,now))return{error:'direct weather-mote draw failed'};
       if(HM_WASM_RENDERER.directWeatherMoteFrames!==before+1)return{error:'motes bypassed direct Rust Canvas API'};
       directFrames++;
       const a=reference.getImageData(0,0,960,600).data,b=direct.getImageData(0,0,960,600).data;
       for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     }
     return{cases:times.length,directFrames,differentChannels,maxDifference};
   })()`);
   const hudTextParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const entries=[
       {text:'MIAMI',x:250,y:120,color:'#ffd23f',font:'bold 24px Impact, sans-serif',align:'left',alpha:.5},
       {text:'$1250',x:450,y:180,color:'#19f0e6',font:'italic 31px Arial, sans-serif',align:'right',alpha:.8,absoluteAlpha:true}
     ];
     const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;return c.getContext('2d')},reference=make(),direct=make();
     reference.globalAlpha=direct.globalAlpha=.6;
     for(const entry of entries){reference.save();reference.globalAlpha=entry.absoluteAlpha?entry.alpha:.6*entry.alpha;reference.fillStyle=entry.color;reference.font=entry.font;reference.textAlign=entry.align;reference.fillText(entry.text,entry.x,entry.y);reference.restore()}
     const before=HM_WASM_RENDERER.directHudTextFrames;
     if(!HM_WASM_RENDERER.drawRawHudTexts(entries,direct))return{error:'raw HUD text draw failed'};
     if(HM_WASM_RENDERER.directHudTextFrames!==before+1)return{error:'HUD text bypassed direct Rust Canvas API'};
     const a=reference.getImageData(0,0,960,600).data,b=direct.getImageData(0,0,960,600).data;
     let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{entries:entries.length,directFrames:1,differentChannels,maxDifference,restoredAlpha:direct.globalAlpha};
   })()`);
   const weatherTextRasterParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const label='NEBLINA · APAGÃO',font='12px Orbitron, sans-serif',color='rgba(25,240,230,.55)',reference=document.createElement('canvas'),direct=document.createElement('canvas');
     let g=reference.getContext('2d');g.font=font;reference.width=Math.ceil(g.measureText(label).width)+4;reference.height=24;g=reference.getContext('2d');g.font=font;g.fillStyle=color;g.textBaseline='alphabetic';g.fillText(label,2,17);
     const before=HM_WASM_RENDERER.directTextImageFrames;if(!HM_WASM_RENDERER.createTextImage(direct,label,font,color))return{error:'Rust text image generation failed'};
     if(HM_WASM_RENDERER.directTextImageFrames!==before+1)return{error:'text image generation bypassed direct Rust'};
     if(reference.width!==direct.width||reference.height!==direct.height)return{error:'text image dimensions differ',reference:[reference.width,reference.height],direct:[direct.width,direct.height]};
     const a=g.getImageData(0,0,reference.width,reference.height).data,b=direct.getContext('2d').getImageData(0,0,direct.width,direct.height).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{differentChannels,maxDifference,directFrames:1,width:direct.width,height:direct.height};
   })()`);
   const enemyTextRasterParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const label='NOCAUTE · ESPAÇO',font='bold 15px Impact, sans-serif',color='#ffd23f',reference=document.createElement('canvas'),direct=document.createElement('canvas');
     let g=reference.getContext('2d');g.font=font;const size=+(font.match(/(\\d+)px/)||[0,16])[1],w=Math.ceil(g.measureText(label).width)+12,h=Math.ceil(size*1.5)+10;reference.width=w;reference.height=h;g=reference.getContext('2d');g.font=font;g.lineWidth=5;g.lineJoin='round';g.strokeStyle='#0b0218';g.fillStyle=color;const by=Math.ceil(size*1.15)+4;g.strokeText(label,6,by);g.fillText(label,6,by);
     if(!HM_WASM_RENDERER.createTextImage(direct,label,font,color,true))return{error:'outlined Rust text image generation failed'};
     if(reference.width!==direct.width||reference.height!==direct.height)return{error:'outlined text dimensions differ',reference:[reference.width,reference.height],direct:[direct.width,direct.height]};
     const a=g.getImageData(0,0,reference.width,reference.height).data,b=direct.getContext('2d').getImageData(0,0,direct.width,direct.height).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{differentChannels,maxDifference,width:direct.width,height:direct.height};
   })()`);
   const canvasLayerParity=await evalJS([
     "(()=>{",
     "if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};",
     "const source=document.createElement('canvas');source.width=90;source.height=70;const s=source.getContext('2d');",
     "s.fillStyle='#ff2e93';s.fillRect(0,0,45,35);s.fillStyle='#19f0e6';s.fillRect(45,0,45,35);s.fillStyle='#ffd23f';s.fillRect(0,35,45,35);s.fillStyle='#ffffff';s.fillRect(45,35,45,35);",
     "const make=()=>{const c=document.createElement('canvas');c.width=160;c.height=120;return c.getContext('2d')},reference=make(),direct=make();reference.globalAlpha=direct.globalAlpha=.8;",
     "reference.save();reference.globalAlpha=.55;reference.drawImage(source,10,6,45,35,30,20,90,70);reference.restore();",
     "const before=HM_WASM_RENDERER.directCanvasLayerCalls;if(!HM_WASM_RENDERER.drawCanvasLayer(direct,source,10,6,45,35,30,20,90,70,.55))return{error:'Rust canvas layer draw failed'};",
     "if(HM_WASM_RENDERER.directCanvasLayerCalls!==before+1)return{error:'canvas layer draw bypassed direct Rust'};",
     "const a=reference.getImageData(0,0,160,120).data,b=direct.getImageData(0,0,160,120).data;let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}",
     "return{differentChannels,maxDifference,directCalls:1,restoredAlpha:direct.globalAlpha};",
     "})()"
   ].join(""));
   const bloodSplatterParity=await evalJS([
     "(()=>{",
     "if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};",
     "const blobs=[],streaks=[],droplets=[];for(let b=0;b<5;b++)for(let k=0;k<14;k++){const a=k/14*6.28,r=11+b*1.7+((k*7+b*3)%9);blobs.push(70+b*34+Math.cos(a)*r,55+b*5+Math.sin(a)*r*.75)}",
     "for(let k=0;k<14;k++){const x=18+k*9,y=142+(k%4)*3;streaks.push(x,y,x+8+(k%5),y-4+(k%7),1.5+(k%4)*.4)}for(let k=0;k<24;k++)droplets.push(20+(k*17)%250,180+(k*13)%80,1+(k%5)*.45);",
     "const make=()=>{const c=document.createElement('canvas');c.width=320;c.height=280;return c.getContext('2d')},reference=make(),direct=make(),puddle='rgba(190,6,14,.5)',drop='rgba(190,6,14,.6)';",
     "reference.save();reference.fillStyle=puddle;for(let base=0;base<blobs.length;base+=28){const firstX=blobs[base],firstY=blobs[base+1],last=base+26;reference.beginPath();reference.moveTo((firstX+blobs[last])/2,(firstY+blobs[last+1])/2);for(let point=0;point<14;point++){const o=base+point*2,n=base+((point+1)%14)*2;reference.quadraticCurveTo(blobs[o],blobs[o+1],(blobs[o]+blobs[n])/2,(blobs[o+1]+blobs[n+1])/2)}reference.fill()}",
     "reference.strokeStyle=drop;reference.fillStyle=drop;for(let base=0;base<streaks.length;base+=5){reference.lineWidth=streaks[base+4];reference.beginPath();reference.moveTo(streaks[base],streaks[base+1]);reference.lineTo(streaks[base+2],streaks[base+3]);reference.stroke()}for(let base=0;base<droplets.length;base+=3){reference.beginPath();reference.arc(droplets[base],droplets[base+1],droplets[base+2],0,6.28);reference.fill()}reference.restore();",
     "const before=HM_WASM_RENDERER.directBloodSplatterCalls;if(!HM_WASM_RENDERER.drawBloodSplatter(direct,puddle,drop,blobs,streaks,droplets))return{error:'Rust blood splatter draw failed'};if(HM_WASM_RENDERER.directBloodSplatterCalls!==before+1)return{error:'blood splatter bypassed direct Rust'};",
     "const a=reference.getImageData(0,0,320,280).data,b=direct.getImageData(0,0,320,280).data;let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}return{differentChannels,maxDifference,directCalls:1};",
     "})()"
   ].join(""));
   const weatherLabelParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const label='NEBLINA · APAGÃO',make=()=>{const c=document.createElement('canvas');c.width=320;c.height=100;return c.getContext('2d')},reference=make(),direct=make();
     const image=document.createElement('canvas'),measure=image.getContext('2d');measure.font='12px Orbitron, sans-serif';image.width=Math.ceil(measure.measureText(label).width)+4;image.height=24;
     const cached=image.getContext('2d');cached.font='12px Orbitron, sans-serif';cached.fillStyle='rgba(25,240,230,.55)';cached.textBaseline='alphabetic';cached.fillText(label,2,17);
     reference.globalAlpha=direct.globalAlpha=.8;reference.drawImage(image,32,75);
     const before=HM_WASM_RENDERER.directCanvasImageFrames;
     if(!HM_WASM_RENDERER.drawCanvasImage(direct,image,32,75))return{error:'weather label draw failed'};
     if(HM_WASM_RENDERER.directCanvasImageFrames!==before+1)return{error:'weather label bypassed direct Rust Canvas API'};
     const a=reference.getImageData(0,0,320,100).data,b=direct.getImageData(0,0,320,100).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{differentChannels,maxDifference,directFrames:1,restoredAlpha:direct.globalAlpha};
   })()`);
   const furnitureParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const items=[
       {kind:'bed',x:35,y:40,w:80,h:55,c:0},{kind:'mesa',x:145,y:42,w:64,h:52,c:0},
       {kind:'vaso',x:255,y:45,w:48,h:62,c:0},{kind:'planta',x:340,y:45,w:54,h:58,c:0},
       {kind:'sofa',x:430,y:40,w:86,h:54,c:0},{kind:'arcade',x:550,y:40,w:58,h:74,c:0},
       {kind:'sinuca',x:635,y:40,w:95,h:58,c:0},{kind:'poco',x:760,y:40,w:60,h:60,c:0},
       {kind:'caixa',x:845,y:42,w:55,h:55,c:0}
     ];
     const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=180;return c.getContext('2d')},reference=make(),direct=make();
     const module=HM_WASM_RENDERER.direct,ready=HM_WASM_RENDERER.directReady,before=HM_WASM_RENDERER.directFurnitureFrames;
     try{HM_WASM_RENDERER.direct=null;HM_WASM_RENDERER.drawFurniture(reference,items)}finally{HM_WASM_RENDERER.direct=module;HM_WASM_RENDERER.directReady=ready}
     HM_WASM_RENDERER.drawFurniture(direct,items);
     if(HM_WASM_RENDERER.directFurnitureFrames!==before+1)return{error:'furniture bypassed direct Rust Canvas API'};
     const a=reference.getImageData(0,0,960,180).data,b=direct.getImageData(0,0,960,180).data;
     let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{items:items.length,directFrames:1,differentChannels,maxDifference};
   })()`);
   const actorParity=await evalJS(`(()=>{
     if(!HM_WASM_RENDERER.directReady)return{error:HM_WASM_RENDERER.directError||'direct module is not ready'};
     const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=220;return c.getContext('2d')};
     const player=[{x:170,y:100,angle:.37,animation:1.2,attack:.12,state:'run',isP2:false,skin:null,frame:buildPlayerFrame('run',1.2,.6,null),weapon:'pistola',shadows:true,glow:true}];
     const enemy={x:420,y:100,a:.42,fall:0,type:'gun',alert:true,stun:false,ko:0,dstun:0,state:'ALERT'};
     const paintersFor=g=>({text:(_enemy,label,x,y)=>{const value=label===1?'KNOCKOUT':label===2?'?':label===3?'!':'STUN',color=label===3?'#ff2e93':'#ffd23f';g.save();g.fillStyle=color;g.font='bold 15px Impact, sans-serif';g.textAlign='center';g.fillText(value,x,y);g.restore()},textImage:(_enemy,label,x,y)=>{const value=label===1?'KNOCKOUT':label===2?'?':label===3?'!':'STUN',color=label===3?'#ff2e93':'#ffd23f',image=document.createElement('canvas');image.width=160;image.height=32;const g=image.getContext('2d');g.fillStyle=color;g.font='bold 15px Impact, sans-serif';g.textAlign='center';g.fillText(value,80,22);return{image,x:x-80,y:y-22}},label:()=>{},body:()=>{},stun:()=>{}});
     const playerReference=make(),playerDirect=make(),enemyReference=make(),enemyDirect=make(),weaponReference=make(),weaponDirect=make(),ghostReference=make(),ghostDirect=make(),auraReference=make(),auraDirect=make();
     const module=HM_WASM_RENDERER.direct,wasReady=HM_WASM_RENDERER.directReady,before=HM_WASM_RENDERER.directActorFrames,beforeText=HM_WASM_RENDERER.directEnemyTextCommands;
     try{
       HM_WASM_RENDERER.direct=null;
       HM_WASM_RENDERER.drawPlayers(player,playerReference,ready(PSHEET)?PSHEET:null);
       HM_WASM_RENDERER.drawEnemies([enemy],{x:420,y:100},paintersFor(enemyReference),enemyReference,ready(ESHEET)?ESHEET:null,1234);
       weaponReference.save();weaponReference.translate(300,110);HM_WASM_RENDERER.drawWeapon(weaponReference,'smg');weaponReference.restore();
       HM_WASM_RENDERER.drawGhosts([{x:470,y:110,a:.38}],ghostReference,'taco');
       auraReference.save();auraReference.translate(650,110);HM_WASM_RENDERER.drawPlayerAura(auraReference,false,true,true);auraReference.restore();
     }finally{HM_WASM_RENDERER.direct=module;HM_WASM_RENDERER.directReady=wasReady}
     const referenceFrames=HM_WASM_RENDERER.directActorFrames;
     HM_WASM_RENDERER.drawPlayers(player,playerDirect,ready(PSHEET)?PSHEET:null);
     const playerFrames=HM_WASM_RENDERER.directActorFrames-referenceFrames;
     HM_WASM_RENDERER.drawEnemies([enemy],{x:420,y:100},paintersFor(enemyDirect),enemyDirect,ready(ESHEET)?ESHEET:null,1234);
     const enemyFrames=HM_WASM_RENDERER.directActorFrames-referenceFrames-playerFrames;
     const directTextCommands=HM_WASM_RENDERER.directEnemyTextCommands-beforeText;
     weaponDirect.save();weaponDirect.translate(300,110);HM_WASM_RENDERER.drawWeapon(weaponDirect,'smg');weaponDirect.restore();
     const weaponFrames=HM_WASM_RENDERER.directActorFrames-referenceFrames-playerFrames-enemyFrames;
     HM_WASM_RENDERER.drawGhosts([{x:470,y:110,a:.38}],ghostDirect,'taco');
     const ghostFrames=HM_WASM_RENDERER.directActorFrames-referenceFrames-playerFrames-enemyFrames-weaponFrames;
     auraDirect.save();auraDirect.translate(650,110);HM_WASM_RENDERER.drawPlayerAura(auraDirect,false,true,true);auraDirect.restore();
     const auraFrames=HM_WASM_RENDERER.directActorFrames-referenceFrames-playerFrames-enemyFrames-weaponFrames-ghostFrames;
     if(HM_WASM_RENDERER.directActorFrames!==before+5)return{error:'actor command batches bypassed direct Rust Canvas API',playerFrames,enemyFrames,weaponFrames,ghostFrames,auraFrames,before,referenceFrames,after:HM_WASM_RENDERER.directActorFrames};
     const compare=(a,b)=>{const x=a.getImageData(0,0,960,220).data,y=b.getImageData(0,0,960,220).data;let differentChannels=0,maxDifference=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}return{differentChannels,maxDifference}};
     return{player:compare(playerReference,playerDirect),enemy:compare(enemyReference,enemyDirect),weapon:compare(weaponReference,weaponDirect),ghost:compare(ghostReference,ghostDirect),aura:compare(auraReference,auraDirect),directFrames:5,directTextCommands,playerSheetReady:ready(PSHEET),enemySheetReady:ready(ESHEET)};
   })()`);
   const mapCommandParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=240;c.height=180;return c.getContext('2d')},reference=make(),direct=make();
     const colors=['#1b3248','#26c9b8','#d9388a'];
     const rows=Array.from({length:22},(_,i)=>{const op=i+1;return[op,op===3?2:op===15?0:op===16?(i%2)+1:0,8+(i%6)*36,12+Math.floor(i/6)*42,24,18,op===1||op===2||op===10||op===14||op===16||op===20||op===21||op===22?2:0,op===1?.22:op===2?.1:op===22?.65:1]});
     const commands=Float64Array.from(rows.flat());
     const fills={4:'rgba(0, 0, 0, 0.4)',5:'#c8c8d8',6:'#f0eff8',7:'#a0a0b5',8:'#e5e4ef',9:'#77778d',11:'rgba(25,240,230,.18)',12:'#f4f2ff',13:'#b5b5c8'};
     for(const [op,color,x,y,w,h,line,alpha] of rows){const g=reference;g.save();g.globalAlpha=alpha;
       if(op===1){g.strokeStyle='#f4d7ff';g.lineWidth=line;g.strokeRect(x,y,w,h)}
       else if(op===2){g.strokeStyle='#19f0e6';g.lineWidth=line;g.beginPath();g.moveTo(x,y);g.lineTo(w,h);g.stroke()}
       else if(op===3){g.fillStyle=color===2?'rgba(5,0,20,.10)':'rgba(255,255,255,.035)';g.fillRect(x,y,w,h)}
       else if(op>=4&&op<=9||op>=11&&op<=13){g.fillStyle=fills[op];g.fillRect(x,y,w,h)}
       else if(op===10||op===14){g.strokeStyle=op===10?'#5d5d73':'#383849';g.lineWidth=line;g.strokeRect(x,y,w,h)}
       else if(op===15){if(colors[color]!==undefined)g.fillStyle=colors[color];g.fillRect(x,y,w,h)}
       else if(op===16){if(colors[color]!==undefined)g.strokeStyle=colors[color];g.lineWidth=line;g.strokeRect(x,y,w,h)}
       else if(op===17){g.fillStyle='#07010f';g.fillRect(x,y,w,h)}
       else if(op===18){g.fillStyle='rgba(255,240,230,.08)';g.fillRect(x,y,w,h)}
       else if(op===19){g.fillStyle='rgba(110,225,255,.22)';g.fillRect(x,y,w,h)}
       else if(op===20){g.strokeStyle='rgba(210,255,255,.85)';g.lineWidth=line;g.strokeRect(x,y,w,h)}
       else if(op===21){g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=line;g.beginPath();g.moveTo(x,y);g.lineTo(w,h);g.stroke()}
       else if(op===22){g.strokeStyle='rgba(210,250,255,.75)';g.lineWidth=line;g.beginPath();g.moveTo(x-w*.45,y-h*.35);g.lineTo(x+w*.2,y+h*.15);g.lineTo(x-w*.1,y+h*.42);g.moveTo(x+w*.42,y-h*.38);g.lineTo(x-w*.05,y+h*.05);g.stroke()}
       g.restore();}
     const directCount=HM_WASM_RENDERER.drawMapCommandsDirect(direct,commands,colors),a=reference.getImageData(0,0,240,180).data,b=direct.getImageData(0,0,240,180).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{commands:rows.length,directCount,differentChannels,maxDifference};
   })()`);
   const dustParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=260;c.height=170;return c.getContext('2d')},reference=make(),direct=make();
     const commands=Float64Array.from([18,20,4,54,30,7,92,18,9,124,58,12,168,32,6,205,79,11,42,126,3,111,130,8,183,133,0]);
     const alpha=.62;reference.save();reference.fillStyle='#c8b8ff';reference.beginPath();
     for(let i=0;i<commands.length;i+=3){reference.moveTo(commands[i]+commands[i+2],commands[i+1]);reference.arc(commands[i],commands[i+1],commands[i+2],0,6.28)}reference.globalAlpha=alpha;reference.fill();reference.restore();
     const directCount=HM_WASM_RENDERER.drawDustDirect(direct,commands,alpha),a=reference.getImageData(0,0,260,170).data,b=direct.getImageData(0,0,260,170).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{particles:commands.length/3,directCount,differentChannels,maxDifference,restoredAlpha:direct.globalAlpha};
   })()`);
   const sparkParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=260;c.height=170;return c.getContext('2d')},reference=make(),direct=make();
     const colors=['#ff8a1f','#19f0e6','#ff2e93'];
     const commands=Float64Array.from([0,.2,22,24,7,2,0,.2,34,28,5,3,1,.55,86,44,3,8,1,.55,94,48,4,7,2,.35,132,88,6,4,0,.2,44,34,5,2]);
     const rows=Array.from({length:commands.length/6},(_,i)=>Array.from(commands.subarray(i*6,i*6+6)));
     reference.save();reference.globalCompositeOperation='lighter';let palette=-1,alpha=-1;
     for(const [color,value,x,y,w,h] of rows){if(color!==palette||value!==alpha){if(palette>=0)reference.fill();palette=color;alpha=value;reference.fillStyle=colors[color];reference.globalAlpha=value;reference.beginPath()}reference.rect(x,y,w,h)}if(rows.length)reference.fill();reference.restore();
     const directCount=HM_WASM_RENDERER.drawSparksDirect(direct,commands,colors),a=reference.getImageData(0,0,260,170).data,b=direct.getImageData(0,0,260,170).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{sparks:rows.length,directCount,differentChannels,maxDifference,restoredAlpha:direct.globalAlpha};
   })()`);
   const bloodParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=260;c.height=170;return c.getContext('2d')},liveReference=make(),liveDirect=make(),staticReference=make(),staticDirect=make();
     const color='#a51f36',commands=Float64Array.from([24,26,9,.25,54,35,14,.7,88,68,6,.42,133,44,11,.9,197,114,18,.13]);
     liveReference.fillStyle=color;for(let i=0;i<commands.length;i+=4){liveReference.globalAlpha=commands[i+3];liveReference.beginPath();liveReference.arc(commands[i],commands[i+1],commands[i+2],0,6.28);liveReference.fill()}liveReference.globalAlpha=1;
     staticReference.fillStyle=color;staticReference.beginPath();for(let i=0;i<commands.length;i+=4){staticReference.moveTo(commands[i]+commands[i+2],commands[i+1]);staticReference.arc(commands[i],commands[i+1],commands[i+2],0,6.28)}staticReference.fill();
     const liveCount=HM_WASM_RENDERER.drawBloodDirect(liveDirect,commands,color),staticCount=HM_WASM_RENDERER.drawBloodDirect(staticDirect,commands,color,true);
     const compare=(a,b)=>{const x=a.getImageData(0,0,260,170).data,y=b.getImageData(0,0,260,170).data;let differentChannels=0,maxDifference=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}return{differentChannels,maxDifference}};
     return{marks:commands.length/4,liveCount,staticCount,live:compare(liveReference,liveDirect),static:compare(staticReference,staticDirect),liveAlpha:liveDirect.globalAlpha};
   })()`);
   const corpseParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=300;c.height=180;return c.getContext('2d')},reference=make(),direct=make(),colors=['#101018','#e7b98f','#24242e'];
     const commands=Float64Array.from([42,48,.35,12,6,.82,0,112,78,-.62,8,13,.55,1,211,96,1.16,16,5,.3,3]);
     for(let i=0;i<commands.length;i+=7){reference.save();reference.translate(commands[i],commands[i+1]);reference.rotate(commands[i+2]);reference.fillStyle=commands[i+6]===3?'rgba(0,0,0,.35)':colors[commands[i+6]];reference.globalAlpha=commands[i+5];reference.beginPath();reference.ellipse(0,0,commands[i+3],commands[i+4],0,0,6.28);reference.fill();reference.restore()}
     const directCount=HM_WASM_RENDERER.drawCorpsesDirect(direct,commands,colors),a=reference.getImageData(0,0,300,180).data,b=direct.getImageData(0,0,300,180).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{corpses:commands.length/7,directCount,differentChannels,maxDifference,restoredAlpha:direct.globalAlpha};
   })()`);
   const commandAbiParity=await evalJS(`(()=>{
     const make=()=>{const c=document.createElement('canvas');c.width=220;c.height=140;return c.getContext('2d')};
     const reference=make(),direct=make(),tile=document.createElement('canvas'),furniture=document.createElement('canvas'),doorOpen=document.createElement('canvas'),door=document.createElement('canvas');
     for(const [canvas,base,light] of [[tile,'#111827','#19f0e6'],[furniture,'#3b2134','#ffd23f'],[doorOpen,'#ff2e93','#120018'],[door,'#8a542d','#e3bb72']]){canvas.width=12;canvas.height=12;const g=canvas.getContext('2d');g.fillStyle=base;g.fillRect(0,0,12,12);g.fillStyle=light;g.fillRect(0,0,6,6);g.fillRect(6,6,6,6)}
     const commands=Float64Array.from([
       21,0,8,8,20,14,0,0,
       31,0,0,38,8,28,28,0,
       31,1,0,74,8,30,28,0,
       32,0,118,20,24,38,1,0,
       33,0,5,74,95,35,-3,0,
       34,0,158,82,0,0,0,0
     ]);
     const refPattern=reference.createPattern(furniture,'repeat'),directPattern=direct.createPattern(furniture,'repeat');
     const batch={doorImage:door,mapTextures:{wallFace:tile,furnitureFaces:[furniture],doorOpen},floorTilePattern:directPattern,spriteImages:[PSHEET]};
     reference.imageSmoothingEnabled=true;reference.drawImage(door,8,8,20,14);
     reference.save();reference.beginPath();reference.rect(38,8,28,28);reference.clip();reference.fillStyle=reference.createPattern(tile,'repeat');reference.fillRect(38,8,28,28);reference.restore();
     reference.save();reference.beginPath();reference.rect(74,8,30,28);reference.clip();reference.imageSmoothingEnabled=false;reference.fillStyle=refPattern;reference.fillRect(74,8,30,28);reference.restore();
     reference.save();reference.imageSmoothingEnabled=false;reference.translate(118,20);reference.rotate(Math.PI/2);reference.drawImage(doorOpen,-12,-19,24,38);reference.restore();
     reference.save();reference.beginPath();reference.rect(5,74,95,35);reference.clip();reference.translate(-3,0);reference.globalAlpha=.45;reference.fillStyle=reference.createPattern(furniture,'repeat');reference.fillRect(5,74,143,83);reference.restore();
     reference.drawImage(PSHEET,158,82);
     const directCount=HM_WASM_RENDERER.drawBatchCommandsDirect(direct,commands,batch);
     const a=reference.getImageData(0,0,220,140).data,b=direct.getImageData(0,0,220,140).data;let differentChannels=0,maxDifference=0;
     for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
     return{commands:commands.length/8,directCount,differentChannels,maxDifference};
   })()`);
   if(runtimeCanvas.directImageDataCreateCalls<1||runtimeCanvas.directImageDataPutCalls<1||runtimeCanvas.top.some(([name])=>name==='createImageData'||name==='putImageData'))throw Error('Canvas ImageData still bypasses direct Rust: '+JSON.stringify(runtimeCanvas));
   if(runtimeCanvas.directClearRectCalls<1||runtimeCanvas.top.some(([name])=>name==='clearRect'))throw Error('Canvas clearRect still bypasses direct Rust: '+JSON.stringify(runtimeCanvas));
   if(runtimeCanvas.directImageSmoothingCalls<1||runtimeCanvas.properties.some(([name])=>name==='imageSmoothingEnabled'))throw Error('Canvas image smoothing setup still bypasses direct Rust: '+JSON.stringify(runtimeCanvas));
   if(runtimeCanvas.properties.some(([name])=>name==='globalAlpha'))throw Error('Canvas alpha setter still runs in the host during the tested gameplay frame: '+JSON.stringify(runtimeCanvas));
   if(runtimeCanvas.directEnemyShadowCalls<1)throw Error('Enemy shadows still bypass direct Rust in gameplay: '+JSON.stringify(runtimeCanvas));
   if(runtimeCanvas.directExplosionScorchCalls<1||barrelScorchRuntime<1)throw Error('Barrel explosion scorch still bypasses direct Rust in gameplay: '+JSON.stringify({barrelScorchRuntime,runtimeCanvas}));
   if(runtimeCanvas.directTextImageFrames<1||runtimeCanvas.top.some(([name])=>name==='measureText'||name==='fillText'))throw Error('Cached text image still rasterizes in the host Canvas: '+JSON.stringify(runtimeCanvas));
   if(weatherTextRasterParity?.error||weatherTextRasterParity.differentChannels!==0||weatherTextRasterParity.maxDifference!==0)throw Error('weather text raster parity failed: '+JSON.stringify(weatherTextRasterParity));
   if(canvasLayerParity?.error||canvasLayerParity.differentChannels!==0||canvasLayerParity.maxDifference!==0||canvasLayerParity.restoredAlpha!==.8)throw Error('Canvas layer pixel parity failed: '+JSON.stringify(canvasLayerParity));
   if(bloodSplatterParity?.error||bloodSplatterParity.differentChannels!==0||bloodSplatterParity.maxDifference!==0)throw Error('blood splatter pixel parity failed: '+JSON.stringify(bloodSplatterParity));
   if(killEffectRuntime?.error||killEffectRuntime.directCalls!==1||killEffectRuntime.hostQuadraticCalls!==0)throw Error('enemy kill blood effect did not rasterize through direct Rust: '+JSON.stringify(killEffectRuntime));
   if(enemyShadowParity?.shadows!==3||enemyShadowParity.directCount!==3||enemyShadowParity.differentChannels!==0||enemyShadowParity.maxDifference!==0)throw Error('enemy shadow pixel parity failed: '+JSON.stringify(enemyShadowParity));
   if(runtimeCanvas.directCanvasLayerCalls<1)throw Error('Canvas layer composition did not use the direct Rust renderer: '+JSON.stringify(runtimeCanvas));
   if(enemyTextRasterParity?.error||enemyTextRasterParity.differentChannels!==0||enemyTextRasterParity.maxDifference!==0)throw Error('enemy text raster parity failed: '+JSON.stringify(enemyTextRasterParity));
   if(!started||gameState!=='play'||runtimeCanvas.directCommandFrames<1||runtimeCanvas.directFurnitureFrames<1||runtimeCanvas.directActorFrames<1||runtimeCanvas.directMapFrames<1||runtimeCanvas.directDustFrames<1||runtimeCanvas.directCanvasImageFrames<1||floorParity?.error||!floorParity?.tileResult||!floorParity?.finishResult||!floorParity?.sameRng||floorParity.maxDifference>3||floorParity.meanDifference>0.2||mapTextureParity?.error||!mapTextureParity?.rendered||mapTextureParity.maxDifference>80||mapTextureParity.meanDifference>0.0025||fogSpriteParity?.error||fogSpriteParity.maxAlphaDifference>1||fogSpriteParity.meanAlphaDifference>0.12||fogSpriteParity.maxRgbDifferenceWhenAlphaAtLeast64>16||!fogRuntime||fogRuntime.spriteCommands<1||fogRuntime.fogCommands<1||pauseUiParity?.error||pauseUiParity.hoverCases!==3||pauseUiParity.maxDifference!==0||fxOverlayParity?.error||fxOverlayParity.cases!==6||fxOverlayParity.directFrames!==6||fxOverlayParity.maxDifference!==0||rainParity?.error||rainParity.cases!==2||rainParity.directFrames!==2||rainParity.maxDifference!==0||moteParity?.error||moteParity.cases!==2||moteParity.directFrames!==2||moteParity.maxDifference!==0||hudTextParity?.error||hudTextParity.entries!==2||hudTextParity.directFrames!==1||hudTextParity.maxDifference!==0||hudTextParity.restoredAlpha!==.6||weatherLabelParity?.error||weatherLabelParity.directFrames!==1||weatherLabelParity.maxDifference!==0||weatherLabelParity.restoredAlpha!==.8||furnitureParity?.error||furnitureParity.items!==9||furnitureParity.directFrames!==1||furnitureParity.maxDifference!==0||actorParity?.error||actorParity.directFrames!==5||actorParity.directTextCommands<1||actorParity.player?.maxDifference!==0||actorParity.enemy?.maxDifference!==0||actorParity.weapon?.maxDifference!==0||actorParity.ghost?.maxDifference!==0||actorParity.aura?.maxDifference!==0||mapCommandParity?.commands!==22||mapCommandParity.directCount!==22||mapCommandParity.maxDifference!==0||dustParity?.particles!==9||dustParity.directCount!==9||dustParity.maxDifference!==0||dustParity.restoredAlpha!==1||sparkParity?.sparks!==6||sparkParity.directCount!==6||sparkParity.maxDifference!==0||sparkParity.restoredAlpha!==1||bloodParity?.marks!==5||bloodParity.liveCount!==5||bloodParity.staticCount!==5||bloodParity.live?.maxDifference!==0||bloodParity.static?.maxDifference!==0||bloodParity.liveAlpha!==1||corpseParity?.corpses!==3||corpseParity.directCount!==3||corpseParity.maxDifference!==0||corpseParity.restoredAlpha!==1||commandAbiParity?.commands!==6||commandAbiParity.directCount!==6||commandAbiParity.maxDifference!==0||exceptions.length) throw Error('WASM map pixel parity regression: '+JSON.stringify({started,gameState,floorParity,mapTextureParity,fogSpriteParity,fogRuntime,pauseUiParity,fxOverlayParity,rainParity,moteParity,hudTextParity,weatherLabelParity,furnitureParity,actorParity,mapCommandParity,dustParity,sparkParity,bloodParity,corpseParity,commandAbiParity,runtimeCanvas,exceptions}));
   console.log(JSON.stringify({browser:version.Browser,ready:before,gameState,barrelScorchRuntime,floorParity,mapTextureParity,fogSpriteParity,fogRuntime,pauseUiParity,fxOverlayParity,rainParity,moteParity,hudTextParity,weatherTextRasterParity,canvasLayerParity,bloodSplatterParity,killEffectRuntime,enemyShadowParity,weatherLabelParity,furnitureParity,actorParity,mapCommandParity,dustParity,sparkParity,bloodParity,corpseParity,commandAbiParity,runtimeCanvas},null,2));
  ws.close();
 } catch(e){console.error(e.stack||String(e));process.exitCode=1}
 finally { if(chrome&&!chrome.killed)chrome.kill();server.close();setTimeout(()=>process.exit(process.exitCode||0),300); }
})();






'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8789, debugPort = 9242;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-shadow-'));
const server = createGameServer();
let chrome;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(200); }
  throw Error('timeout waiting for browser state');
}

(async () => {
  let ws;
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    process.stdout.write('[parity] server ready\n');
    chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-allow-origins=*', '--remote-debugging-port=' + debugPort, '--user-data-dir=' + profile, '--window-size=1280,720', 'http://127.0.0.1:' + port + '/?renderer=wasm&wasmDiagnostics=1&dev=1'], { stdio: 'ignore', windowsHide: true });
    await until(async () => { const response = await fetch('http://127.0.0.1:' + debugPort + '/json/version'); return response.ok ? response.json() : null; });
    const targets = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
    const page = targets.find(target => target.type === 'page' && target.webSocketDebuggerUrl);
    if (!page) throw Error('Chrome page target missing');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    const pending = new Map(); let seq = 0;
    ws.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { const item = pending.get(message.id); pending.delete(message.id); message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result); } });
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
    await call('Runtime.enable');
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
      return result.result && result.result.value;
    };
    await until(async () => { const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady}))()'); return state && state.active && state.directReady ? state : null; });
    process.stdout.write('[parity] wasm ready\n');
    const started = await evaluate('(()=>{newGame();return st})()');
    process.stdout.write('[parity] newGame: ' + started + '\n');
    await wait(1800);
    const runtime = await evaluate('HM_WASM_RENDERER.directEnemyShadowCalls');
    process.stdout.write('[parity] runtime sample ready\n');
    await evaluate('(()=>{window.requestAnimationFrame=()=>0;return true})()');
    const worldBatchRuntime = await evaluate(`(()=>{
      const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const context=canvas.getContext('2d');
      const image=document.createElement('canvas');image.width=image.height=16;image.getContext('2d').fillRect(0,0,16,16);
      const before={fog:HM_WASM_RENDERER.directFogCalls,lights:HM_WASM_RENDERER.directWorldLightCalls,rings:HM_WASM_RENDERER.directWorldRingCalls,zone:HM_WASM_RENDERER.directInvasionZoneCalls};
      const fog=HM_WASM_RENDERER.drawFog(context,image,1000,false,0);
      const lights=HM_WASM_RENDERER.drawWorldLights(context,[{x:30,y:40,r:24,p:.3,on:true,spr:image}],1000,.8,false,1,60,70,true,true,image);
      const rings=HM_WASM_RENDERER.drawWorldRings(context,[{x:90,y:80,R:30,t:.4,T:1,c:'#19f0e6'}]);
      const zone=HM_WASM_RENDERER.drawInvasionZone(context,120,90,1000);
      const darkCanvas=document.createElement('canvas');darkCanvas.width=480;darkCanvas.height=300;const darkContext=darkCanvas.getContext('2d');darkContext.setTransform(.5,0,0,.5,0,0);
      const screen=document.createElement('canvas');screen.width=960;screen.height=600;const screenContext=screen.getContext('2d');
      const lampCanvas=()=>{const c=document.createElement('canvas');c.width=c.height=32;c.getContext('2d').fillRect(0,0,32,32);return c};
      const lamps={core:lampCanvas(),far:lampCanvas(),flash:lampCanvas()},beforeDark=HM_WASM_RENDERER.directDarkOverlayCalls;
      const dark=HM_WASM_RENDERER.drawDarkOverlay(darkContext,screenContext,darkCanvas,lamps,P.x,P.y,cam.x,cam.y,W,H,CFG.zoom,P.a,false,true);
      const beforeFx=HM_WASM_RENDERER.directFxCalls,fx=HM_WASM_RENDERER.drawFx(context,[{x:160,y:120,t:.2,R:14,a:.4,muzzle:false}]);
      const beforeShells=HM_WASM_RENDERER.directShellCalls,shells=HM_WASM_RENDERER.drawShells(context,[{x:160,y:120,r:2},{x:168,y:125,r:1.5}],10,20);
      const comboCanvas=document.createElement('canvas');comboCanvas.width=160;comboCanvas.height=120;const comboContext=comboCanvas.getContext('2d'),beforeCombo=HM_WASM_RENDERER.directComboTextCalls;
      const combo=HM_WASM_RENDERER.drawComboText(comboContext,3,performance.now());
      const beforeAlarm=HM_WASM_RENDERER.directAlarmTextCalls,alarm=HM_WASM_RENDERER.drawAlarmText(context,12.6,960);
      const beforeHudImage=HM_WASM_RENDERER.directHudImageCalls,hudImage=HM_WASM_RENDERER.drawHudImage(context,0,960,600,false,true,[image,image,image,image,image]);
      return{fog,lights,rings,zone,dark,fx,shells,combo,alarm,hudImage,directFogCalls:HM_WASM_RENDERER.directFogCalls-before.fog,directWorldLightCalls:HM_WASM_RENDERER.directWorldLightCalls-before.lights,directWorldRingCalls:HM_WASM_RENDERER.directWorldRingCalls-before.rings,directInvasionZoneCalls:HM_WASM_RENDERER.directInvasionZoneCalls-before.zone,directDarkOverlayCalls:HM_WASM_RENDERER.directDarkOverlayCalls-beforeDark,directFxCalls:HM_WASM_RENDERER.directFxCalls-beforeFx,directShellCalls:HM_WASM_RENDERER.directShellCalls-beforeShells,directComboTextCalls:HM_WASM_RENDERER.directComboTextCalls-beforeCombo,directAlarmTextCalls:HM_WASM_RENDERER.directAlarmTextCalls-beforeAlarm,directHudImageCalls:HM_WASM_RENDERER.directHudImageCalls-beforeHudImage};
    })()`);
    process.stdout.write('[parity] world batch callbacks ready\n');
    const debugHud = await evaluate(`(()=>{if(!EXP.dbg)return{error:'debug mode not active'};const before=HM_WASM_RENDERER.directDebugHudCalls;const drawn=HM_WASM_RENDERER.drawDebugHud(ctx,W,H,true,['DEV FPS 60','pos 240,160','mapa TESTE 960x600','inimigos 3 balas 2','paredes 14 portas 1','F3 painel F4 colisão F6 IA F7 mapa','F9 erros F10 chefe'],true,['debug parity sample']);return{calls:HM_WASM_RENDERER.directDebugHudCalls-before,drawn}})()`);
    process.stdout.write('[parity] debug HUD ready\n');
    const debugWorld = await evaluate(`(()=>{const wallData=new Float64Array(walls.length*4),doorData=new Float64Array(doors.length*4),enemyData=new Float64Array(enemies.length*6),labels=[];for(let i=0;i<walls.length;i++)wallData.set(walls[i],i*4);for(let i=0;i<doors.length;i++){const d=doors[i],o=i*4;doorData[o]=d.x;doorData[o+1]=d.y;doorData[o+2]=d.w;doorData[o+3]=d.h}for(let i=0;i<enemies.length;i++){const e=enemies[i],o=i*6,t=e.lkp;enemyData[o]=e.x;enemyData[o+1]=e.y;enemyData[o+2]=e.r;enemyData[o+3]=t?1:0;enemyData[o+4]=t?t.x:0;enemyData[o+5]=t?t.y:0;labels.push('#'+(e.id||'?')+' '+e.state+(e.cls?' '+e.cls:''))}const before=HM_WASM_RENDERER.directDebugWorldCalls;const drawn=HM_WASM_RENDERER.drawDebugWorld(ctx,wallData,doorData,P.x,P.y,P.r,true,enemyData,labels,true);return{calls:HM_WASM_RENDERER.directDebugWorldCalls-before,drawn,walls:walls.length,doors:doors.length,enemies:enemies.length}})()`);
    process.stdout.write('[parity] debug world ready\n');
    const parity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;return canvas.getContext('2d')};
      const reference=make(),direct=make(),commands=new Float64Array([42,38,14,8,.72,108,76,18,10,.35,242,119,11,7,.9]);
      reference.fillStyle='#123456';direct.fillStyle='#123456';reference.globalAlpha=.65;direct.globalAlpha=.65;
      for(let offset=0;offset<commands.length;offset+=5){reference.save();reference.globalAlpha=commands[offset+4];reference.fillStyle='rgba(0,0,0,.32)';reference.beginPath();reference.ellipse(commands[offset],commands[offset+1],commands[offset+2],commands[offset+3],0,0,6.28);reference.fill();reference.restore()}
      const directCount=HM_WASM_RENDERER.direct.drawEnemyShadows(direct,commands,0,3);
      const a=reference.getImageData(0,0,320,180).data,b=direct.getImageData(0,0,320,180).data;let differentChannels=0,maxDifference=0;
      for(let i=0;i<a.length;i++){const difference=Math.abs(a[i]-b[i]);if(difference)differentChannels++;if(difference>maxDifference)maxDifference=difference}
      return{shadows:commands.length/5,directCount,differentChannels,maxDifference,referenceAlpha:reference.globalAlpha,directAlpha:direct.globalAlpha,referenceFill:reference.fillStyle,directFill:direct.fillStyle};
    })()`);
    const glassTraceParity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=280;canvas.height=160;return canvas.getContext('2d')};
      const reference=make(),direct=make(),commands=new Float64Array([.31,42,38,47,40,43,44,.52,50,41,53,44,51,48,.66,44,52,47,54,46,58,.28,39,47,44,50,40,54,.74,52,51,57,53,54,58,.43,48,37,50,40,53,43,.59,39,40,43,43,42,46,.35,54,46,59,49,56,52,.63,46,47,48,49,47,53]);
      reference.globalAlpha=.65;direct.globalAlpha=.65;reference.fillStyle='#123456';direct.fillStyle='#123456';
      reference.save();reference.fillStyle='rgba(160,230,255,.10)';reference.fillRect(30,32,24,26);
      for(let offset=0;offset<commands.length;offset+=7){reference.fillStyle='rgba(220,250,255,'+commands[offset]+')';reference.beginPath();reference.moveTo(commands[offset+1],commands[offset+2]);reference.lineTo(commands[offset+3],commands[offset+4]);reference.lineTo(commands[offset+5],commands[offset+6]);reference.fill()}reference.restore();
      const directResult=HM_WASM_RENDERER.drawGlassBreakTrace(direct,30,32,24,26,commands);
      const a=reference.getImageData(0,0,280,160).data,b=direct.getImageData(0,0,280,160).data;let differentChannels=0,maxDifference=0;
      for(let i=0;i<a.length;i++){const difference=Math.abs(a[i]-b[i]);if(difference)differentChannels++;if(difference>maxDifference)maxDifference=difference}
      return{directResult,shards:commands.length/7,differentChannels,maxDifference,restoredAlpha:direct.globalAlpha,restoredFill:direct.fillStyle,directCalls:HM_WASM_RENDERER.directGlassTraceCalls};
    })()`);
    const explosionScorchParity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=120;canvas.height=120;return canvas.getContext('2d')};
      const reference=make(),direct=make();reference.globalAlpha=.65;direct.globalAlpha=.65;reference.fillStyle='#123456';direct.fillStyle='#123456';
      reference.fillStyle='rgba(8,4,12,.55)';reference.beginPath();reference.arc(60,60,38,0,Math.PI*2);reference.fill();
      reference.fillStyle='rgba(255,138,31,.18)';reference.beginPath();reference.arc(60,60,24,0,Math.PI*2);reference.fill();
      const directResult=HM_WASM_RENDERER.drawExplosionScorch(direct,60,60);
      const a=reference.getImageData(0,0,120,120).data,b=direct.getImageData(0,0,120,120).data;let differentChannels=0,maxDifference=0;
      for(let i=0;i<a.length;i++){const difference=Math.abs(a[i]-b[i]);if(difference)differentChannels++;if(difference>maxDifference)maxDifference=difference}
      return{directResult,differentChannels,maxDifference,referenceAlpha:reference.globalAlpha,directAlpha:direct.globalAlpha,referenceFill:reference.fillStyle,directFill:direct.fillStyle,directCalls:HM_WASM_RENDERER.directExplosionScorchCalls};
    })()`);
    const debugHudParity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;return canvas.getContext('2d')};
      const reference=make(),direct=make(),lines=['DEV FPS 60','pos 240,160','mapa TESTE 960x600','inimigos 3 balas 2','paredes 14 portas 1','F3 painel F4 colisão F6 IA F7 mapa','F9 erros F10 chefe'],errors=['debug sample','renderer test'];
      reference.globalAlpha=.65;direct.globalAlpha=.65;reference.fillStyle='#123456';direct.fillStyle='#123456';
      reference.save();reference.font='12px monospace';reference.textAlign='left';reference.fillStyle='rgba(0,0,0,.65)';reference.fillRect(710,450,244,120);reference.fillStyle='#7dff9b';lines.forEach((text,index)=>reference.fillText(text,716,466+index*15));
      reference.fillStyle='rgba(0,0,0,.8)';reference.fillRect(10,200,560,200);reference.fillStyle='#ff9ac8';errors.forEach((text,index)=>reference.fillText(text,16,218+index*15));reference.restore();
      const directResult=HM_WASM_RENDERER.drawDebugHud(direct,960,600,true,lines,true,errors);
      const a=reference.getImageData(0,0,960,600).data,b=direct.getImageData(0,0,960,600).data;let differentChannels=0,maxDifference=0;
      for(let i=0;i<a.length;i++){const difference=Math.abs(a[i]-b[i]);if(difference)differentChannels++;if(difference>maxDifference)maxDifference=difference}
      return{directResult,differentChannels,maxDifference,referenceAlpha:reference.globalAlpha,directAlpha:direct.globalAlpha,referenceFill:reference.fillStyle,directFill:direct.fillStyle};
    })()`);
    const debugWorldParity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;return canvas.getContext('2d')};
      const reference=make(),direct=make(),wallData=new Float64Array([5,8,60,24,88,42,31,47]),doorData=new Float64Array([74,18,12,42]),
        enemyData=new Float64Array([145,76,14,1,228,63,251,111,9,0,0,0]),labels=['#4 guard alert heavy','#? civilian idle'];
      for(const g of [reference,direct]){g.globalAlpha=.65;g.fillStyle='#123456';g.strokeStyle='#654321';g.lineWidth=3;g.font='13px sans-serif';g.textAlign='right'}
      reference.save();reference.strokeStyle='rgba(0,255,120,.8)';reference.lineWidth=1;
      for(let i=0;i<wallData.length;i+=4)reference.strokeRect(...wallData.slice(i,i+4));
      reference.strokeStyle='rgba(255,210,63,.9)';for(let i=0;i<doorData.length;i+=4)reference.strokeRect(...doorData.slice(i,i+4));
      reference.strokeStyle='#19f0e6';reference.beginPath();reference.arc(40,90,13,0,6.3);reference.stroke();reference.restore();
      reference.save();reference.font='11px monospace';reference.textAlign='center';
      for(let i=0;i<enemyData.length;i+=6){const x=enemyData[i],y=enemyData[i+1],r=enemyData[i+2];reference.strokeStyle='rgba(255,46,147,.7)';reference.beginPath();reference.arc(x,y,r,0,6.3);reference.stroke();if(enemyData[i+3]){reference.strokeStyle='rgba(255,210,63,.6)';reference.beginPath();reference.moveTo(x,y);reference.lineTo(enemyData[i+4],enemyData[i+5]);reference.stroke()}reference.fillStyle='#fff';reference.fillText(labels[i/6],x,y-r-6)}reference.restore();
      const directResult=HM_WASM_RENDERER.drawDebugWorld(direct,wallData,doorData,40,90,13,true,enemyData,labels,true);
      const a=reference.getImageData(0,0,320,180).data,b=direct.getImageData(0,0,320,180).data;let differentChannels=0,maxDifference=0;
      for(let i=0;i<a.length;i++){const difference=Math.abs(a[i]-b[i]);if(difference)differentChannels++;if(difference>maxDifference)maxDifference=difference}
      return{directResult,differentChannels,maxDifference,referenceAlpha:reference.globalAlpha,directAlpha:direct.globalAlpha,referenceFill:reference.fillStyle,directFill:direct.fillStyle,referenceStroke:reference.strokeStyle,directStroke:direct.strokeStyle,referenceLineWidth:reference.lineWidth,directLineWidth:direct.lineWidth};
    })()`);
    const worldBatchParity = await evaluate(`(()=>{
      const make=(w=160,h=120)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas.getContext('2d')};
      const compare=(reference,direct)=>{const a=reference.getImageData(0,0,160,120).data,b=direct.getImageData(0,0,160,120).data;let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}return{differentChannels,maxDifference,alphaRestored:reference.globalAlpha===direct.globalAlpha,compositeRestored:reference.globalCompositeOperation===direct.globalCompositeOperation}};
      const fogSource=document.createElement('canvas');fogSource.width=16;fogSource.height=16;const fogContext=fogSource.getContext('2d');fogContext.fillStyle='#f4f4f4';fogContext.fillRect(0,0,16,16);fogContext.fillStyle='rgba(25,240,230,.6)';fogContext.beginPath();fogContext.arc(8,8,6,0,Math.PI*2);fogContext.fill();
      let reference=make(),direct=make(),fogCommands=new Float64Array([12,7,80,60,53,40,75,50,90,74,55,33]);reference.globalAlpha=direct.globalAlpha=.72;reference.globalCompositeOperation=direct.globalCompositeOperation='multiply';
      reference.save();reference.globalAlpha=.13;reference.globalCompositeOperation='lighter';for(let i=0;i<fogCommands.length;i+=4)reference.drawImage(fogSource,...fogCommands.slice(i,i+4));reference.restore();
      const fogCount=HM_WASM_RENDERER.direct.drawFog(direct,fogSource,fogCommands,3,.13,false),fog=compare(reference,direct);
      const light=document.createElement('canvas'),flash=document.createElement('canvas');light.width=light.height=12;flash.width=flash.height=20;const lightContext=light.getContext('2d'),flashContext=flash.getContext('2d');lightContext.fillStyle='rgba(255,46,147,.7)';lightContext.fillRect(0,0,12,12);flashContext.fillStyle='rgba(255,220,120,.5)';flashContext.fillRect(0,0,20,20);
      reference=make();direct=make();const lights=new Float64Array([0,0,17,18,24,24,.36,1,0,45,42,20,20,.8,2,0,88,74,14,5,.12]);
      reference.save();reference.globalCompositeOperation='lighter';reference.globalAlpha=.36;reference.drawImage(light,17,18,24,24);reference.globalAlpha=.8;reference.drawImage(flash,45,42,20,20);reference.restore();reference.save();reference.globalAlpha=.12;reference.fillStyle='#9ad1ff';reference.beginPath();reference.ellipse(88,74,14,5,0,0,Math.PI*2);reference.fill();reference.restore();
      const lightCount=HM_WASM_RENDERER.direct.drawWorldLights(direct,lights,[light],flash),worldLights=compare(reference,direct);
      reference=make();direct=make();reference.save();reference.globalAlpha=.7;reference.strokeStyle='#19f0e6';reference.lineWidth=3;reference.beginPath();reference.arc(72,54,21,0,Math.PI*2);reference.stroke();reference.restore();
      const ringCount=HM_WASM_RENDERER.direct.drawWorldRings(direct,new Float64Array([72,54,21,3,.7,0]),['#19f0e6']),rings=compare(reference,direct);
      reference=make();direct=make();reference.save();reference.strokeStyle='rgba(255,107,213,0.5)';reference.lineWidth=4;reference.beginPath();reference.arc(104,68,34,0,Math.PI*2);reference.stroke();reference.fillStyle='rgba(255,107,213,0.14)';reference.fill();reference.restore();
      const zone=HM_WASM_RENDERER.direct.drawInvasionZone(direct,new Float64Array([104,68,34,.5,4,.14])),invasion=compare(reference,direct);
      const makeDark=()=>{const canvas=document.createElement('canvas');canvas.width=480;canvas.height=300;const context=canvas.getContext('2d');context.setTransform(.5,0,0,.5,0,0);return{canvas,context}};
      const makeScreen=()=>{const canvas=document.createElement('canvas');canvas.width=160;canvas.height=120;return canvas.getContext('2d')};
      const source=(size,color)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const context=canvas.getContext('2d');context.fillStyle=color;context.fillRect(0,0,size,size);return canvas};
      const darkRef=makeDark(),darkDirect=makeDark(),screenRef=makeScreen(),screenDirect=makeScreen();
      const core=source(300,'rgba(255,255,255,.9)'),far=source(660,'rgba(255,255,255,.7)'),flashImage=source(520,'rgba(255,220,120,.6)'),darkCommands=new Float64Array([140,110,.31,150,330,260,0,1]);
      for(const context of [darkRef.context,darkDirect.context]){context.globalAlpha=.8;context.globalCompositeOperation='multiply'}for(const context of [screenRef,screenDirect]){context.globalAlpha=.9;context.globalCompositeOperation='source-over'}
      darkRef.context.globalCompositeOperation='source-over';darkRef.context.clearRect(0,0,960,600);darkRef.context.fillStyle='rgba(3,0,12,.88)';darkRef.context.fillRect(0,0,960,600);darkRef.context.globalCompositeOperation='destination-out';
      darkRef.context.drawImage(core,140-150,110-150,300,300);darkRef.context.save();darkRef.context.beginPath();darkRef.context.moveTo(140,110);darkRef.context.arc(140,110,330,.31-.38,.31+.38);darkRef.context.closePath();darkRef.context.clip();darkRef.context.drawImage(far,140-330,110-330,660,660);darkRef.context.restore();darkRef.context.drawImage(flashImage,140-260,110-260,520,520);
      screenRef.drawImage(darkRef.canvas,0,0,960,600);
      const darkDrawn=HM_WASM_RENDERER.direct.drawDarkOverlay(darkDirect.context,screenDirect,darkDirect.canvas,core,far,flashImage,darkCommands),darkOverlay=compare(screenRef,screenDirect);
      const fxReference=make(),fxDirect=make(),muzzle=document.createElement('canvas');muzzle.width=muzzle.height=32;const muzzleContext=muzzle.getContext('2d');muzzleContext.fillStyle='rgba(255,210,63,.7)';muzzleContext.fillRect(0,0,32,32);
      fxReference.globalAlpha=fxDirect.globalAlpha=.65;fxReference.globalCompositeOperation=fxDirect.globalCompositeOperation='multiply';
      fxReference.save();fxReference.globalCompositeOperation='lighter';fxReference.globalAlpha=.8;fxReference.drawImage(muzzle,28,23,24,24);fxReference.restore();
      fxReference.strokeStyle='#fff';fxReference.lineWidth=4;fxReference.beginPath();fxReference.arc(80,65,16,.4-1.2,.4+1.2);fxReference.stroke();
      const fxCount=HM_WASM_RENDERER.direct.drawFx(fxDirect,new Float64Array([40,35,.08,12,.3,1,80,65,.15,16,.4,0]),muzzle),fxParity=compare(fxReference,fxDirect);
      const shellReference=make(),shellDirect=make(),shells=new Float64Array([42,36,3,1.8,.5,73,58,2.25,1.2,-.3]);
      shellReference.globalAlpha=shellDirect.globalAlpha=.65;shellReference.globalCompositeOperation=shellDirect.globalCompositeOperation='multiply';
      shellReference.save();shellReference.globalAlpha=.72;shellReference.fillStyle='#d8c8a2';shellReference.beginPath();shellReference.ellipse(42,36,3,1.8,.5,0,Math.PI*2);shellReference.ellipse(73,58,2.25,1.2,-.3,0,Math.PI*2);shellReference.fill();shellReference.restore();
      const shellCount=HM_WASM_RENDERER.direct.drawShells(shellDirect,shells,2),shellParity=compare(shellReference,shellDirect);
      const comboReference=make(),comboDirect=make(),comboPulse=1.04;comboReference.globalAlpha=comboDirect.globalAlpha=.65;comboReference.globalCompositeOperation=comboDirect.globalCompositeOperation='multiply';
      comboReference.save();comboReference.translate(34,176);comboReference.scale(comboPulse,comboPulse);comboReference.font='bold 54px Impact, sans-serif';comboReference.lineWidth=6;comboReference.strokeStyle='#1a0006';comboReference.strokeText('3X',0,0);comboReference.fillStyle='#ff2e5b';comboReference.fillText('3X',0,0);comboReference.restore();
      const comboDrawn=HM_WASM_RENDERER.direct.drawComboText(comboDirect,new Float64Array([comboPulse,3]),'3X'),comboParity=compare(comboReference,comboDirect);
      const alarmReference=make(),alarmDirect=make(),alarmLabel='ALARME ATIVO · 13 s',alarmCommands=new Float64Array([12.6,80,24]);
      alarmReference.fillStyle='rgba(255,60,90,.9)';alarmReference.font='bold 14px Orbitron, sans-serif';alarmReference.textAlign='center';alarmReference.fillText(alarmLabel,80,24);
      const alarmDrawn=HM_WASM_RENDERER.direct.drawAlarmText(alarmDirect,alarmCommands,alarmLabel),alarmParity=compare(alarmReference,alarmDirect);
      const hudReference=make(),hudDirect=make(),hudSource=source(24,'rgba(25,240,230,.75)'),hudCommands=new Float64Array([1,20,18,40,30]);
      hudReference.globalAlpha=hudDirect.globalAlpha=.7;hudReference.globalCompositeOperation=hudDirect.globalCompositeOperation='multiply';hudReference.drawImage(hudSource,20,18,40,30);
      const hudDrawn=HM_WASM_RENDERER.direct.drawHudImage(hudDirect,hudSource,hudCommands),hudParity=compare(hudReference,hudDirect);
      return{fogCount,fog,lightCount,worldLights,ringCount,rings,zone,invasion,darkDrawn,darkOverlay,fxCount,fxParity,shellCount,shellParity,comboDrawn,comboParity,alarmDrawn,alarmParity,hudDrawn,hudParity};
    })()`);
    process.stdout.write('[parity] world batches ready\n');
    if (started !== 'play' || runtime < 1) throw Error('gameplay did not route enemy shadows through direct Rust: ' + JSON.stringify({ started, runtime }));
    if (debugHud?.error || debugHud.calls < 1 || !debugHud.drawn) throw Error('developer HUD did not draw through direct Rust: ' + JSON.stringify(debugHud));
    if (debugWorld?.calls < 1 || !debugWorld.drawn || debugWorld.walls < 1 || debugWorld.enemies < 1) throw Error('developer world overlays did not draw through direct Rust: ' + JSON.stringify(debugWorld));
    if (!worldBatchRuntime.fog || !worldBatchRuntime.lights || !worldBatchRuntime.rings || !worldBatchRuntime.zone
      || !worldBatchRuntime.dark || worldBatchRuntime.directFogCalls < 1 || worldBatchRuntime.directWorldLightCalls < 1 || worldBatchRuntime.directWorldRingCalls < 1
      || !worldBatchRuntime.fx || worldBatchRuntime.directInvasionZoneCalls < 1 || worldBatchRuntime.directDarkOverlayCalls < 1 || worldBatchRuntime.directFxCalls < 1
      || !worldBatchRuntime.shells || worldBatchRuntime.directShellCalls < 1) throw Error('world batch callback did not call direct Rust: ' + JSON.stringify(worldBatchRuntime));
    if (!worldBatchRuntime.combo || worldBatchRuntime.directComboTextCalls < 1) throw Error('combo text callback did not call direct Rust: ' + JSON.stringify(worldBatchRuntime));
    if (!worldBatchRuntime.alarm || worldBatchRuntime.directAlarmTextCalls < 1) throw Error('alarm text callback did not call direct Rust: ' + JSON.stringify(worldBatchRuntime));
    if (!worldBatchRuntime.hudImage || worldBatchRuntime.directHudImageCalls < 1) throw Error('HUD image callback did not call direct Rust: ' + JSON.stringify(worldBatchRuntime));
    if (parity.shadows !== 3 || parity.directCount !== 3 || parity.differentChannels !== 0 || parity.maxDifference !== 0 || parity.referenceAlpha !== parity.directAlpha || parity.referenceFill !== parity.directFill) throw Error('enemy shadow parity failed: ' + JSON.stringify(parity));
    if (!glassTraceParity.directResult || glassTraceParity.shards !== 9 || glassTraceParity.differentChannels !== 0 || glassTraceParity.maxDifference !== 0 || glassTraceParity.restoredAlpha !== .65 || glassTraceParity.restoredFill !== '#123456' || glassTraceParity.directCalls < 1) throw Error('glass trace parity failed: ' + JSON.stringify(glassTraceParity));
    if (!explosionScorchParity.directResult || explosionScorchParity.differentChannels !== 0 || explosionScorchParity.maxDifference !== 0 || explosionScorchParity.referenceAlpha !== explosionScorchParity.directAlpha || explosionScorchParity.referenceFill !== explosionScorchParity.directFill || explosionScorchParity.directCalls < 1) throw Error('explosion scorch parity failed: ' + JSON.stringify(explosionScorchParity));
    if (!debugHudParity.directResult || debugHudParity.differentChannels !== 0 || debugHudParity.maxDifference !== 0 || debugHudParity.referenceAlpha !== debugHudParity.directAlpha || debugHudParity.referenceFill !== debugHudParity.directFill) throw Error('debug HUD parity failed: ' + JSON.stringify(debugHudParity));
    if (!debugWorldParity.directResult || debugWorldParity.differentChannels !== 0 || debugWorldParity.maxDifference !== 0 || debugWorldParity.referenceAlpha !== debugWorldParity.directAlpha || debugWorldParity.referenceFill !== debugWorldParity.directFill || debugWorldParity.referenceStroke !== debugWorldParity.directStroke || debugWorldParity.referenceLineWidth !== debugWorldParity.directLineWidth) throw Error('debug world overlay parity failed: ' + JSON.stringify(debugWorldParity));
    if (worldBatchParity.fogCount !== 3 || worldBatchParity.lightCount !== 3 || worldBatchParity.ringCount !== 1 || worldBatchParity.zone !== true || worldBatchParity.darkDrawn !== true || worldBatchParity.fxCount !== 2
      || worldBatchParity.shellCount !== 2 || worldBatchParity.comboDrawn !== true || worldBatchParity.alarmDrawn !== true || worldBatchParity.hudDrawn !== true
      || [worldBatchParity.fog, worldBatchParity.worldLights, worldBatchParity.rings, worldBatchParity.invasion, worldBatchParity.darkOverlay, worldBatchParity.fxParity, worldBatchParity.shellParity, worldBatchParity.comboParity, worldBatchParity.alarmParity, worldBatchParity.hudParity].some(result => result.differentChannels !== 0 || !result.alphaRestored || !result.compositeRestored)) throw Error('world batch parity failed: ' + JSON.stringify(worldBatchParity));
    console.log(JSON.stringify({ browser: 'Chrome', gameState: started, runtimeDirectShadowCalls: runtime, worldBatchRuntime, debugHud, debugWorld, parity, glassTraceParity, explosionScorchParity, debugHudParity, debugWorldParity, worldBatchParity }, null, 2));
  } catch (error) {
    console.error(error.stack || String(error)); process.exitCode = 1;
  } finally {
    if (ws) ws.close();
    if (chrome && !chrome.killed) chrome.kill();
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
    setTimeout(() => process.exit(process.exitCode || 0), 300);
  }
})();

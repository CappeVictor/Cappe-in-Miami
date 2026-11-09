'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8795, debugPort = 9248;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-particle-inputs-'));
const server = createGameServer();
let chrome, ws;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeout = 20000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(200); }
  throw Error('timeout waiting for Rust/WASM renderer');
}

(async () => {
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-dev-shm-usage', `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, `http://127.0.0.1:${port}/?renderer=wasm`], { stdio: 'ignore', windowsHide: true });
    await until(async () => { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); return response.ok ? response.json() : null; });
    const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    const page = targets.find(target => target.type === 'page' && target.webSocketDebuggerUrl);
    if (!page) throw Error('Chrome page target missing');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    const pending = new Map(); let seq = 0;
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) { const item = pending.get(message.id); pending.delete(message.id); message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result); }
    });
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
    await call('Runtime.enable');
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
      return result.result && result.result.value;
    };
    await until(async () => { const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady}))()'); return state && state.active && state.directReady ? state : null; });
    const result = await evaluate(`(()=>{
      const renderer=HM_WASM_RENDERER;
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=180;canvas.height=120;const context=canvas.getContext('2d');context.fillStyle='#26364a';context.fillRect(0,0,180,120);context.globalAlpha=.73;context.globalCompositeOperation='multiply';return{canvas,context}};
      const compare=(a,b)=>{const x=a.canvas.getContext('2d').getImageData(0,0,180,120).data,y=b.canvas.getContext('2d').getImageData(0,0,180,120).data;let differentChannels=0,maxDifference=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}return{differentChannels,maxDifference,alphaRestored:a.context.globalAlpha===b.context.globalAlpha,compositeRestored:a.context.globalCompositeOperation===b.context.globalCompositeOperation}};
      const dust=[{x:15,y:14,r:1},{x:28.5,y:32,r:2.3},{x:63,y:48,r:0},{x:110,y:72,r:3.5},{x:158,y:105,r:1.2}],dustFallback=make(),dustDirect=make(),drawDust=renderer.direct.drawDust,dustBefore=renderer.directDustInputCalls;let dustLegacy;
      try{renderer.direct.drawDust=null;dustLegacy=renderer.drawDust(dustFallback.context,dust,.62)}finally{renderer.direct.drawDust=drawDust}
      dustFallback.context.save();dustFallback.context.fillStyle='#c8b8ff';dustFallback.context.beginPath();for(const p of dust){dustFallback.context.moveTo(p.x+p.r,p.y);dustFallback.context.arc(p.x,p.y,p.r,0,6.28)}dustFallback.context.globalAlpha=.62;dustFallback.context.fill();dustFallback.context.restore();
      const dustDrawn=renderer.drawDust(dustDirect.context,dust,.62),dustParity=compare(dustFallback,dustDirect),dustCalls=renderer.directDustInputCalls-dustBefore;
      const colors=['rgba(255,170,35,1)','rgba(255,72,30,1)','rgba(255,235,130,1)'],sparks=[
        {x:19,y:18,life:.95,max:1,c:colors[0]},{x:55,y:39,life:.62,max:1,c:colors[1]},
        {x:94,y:65,life:.32,max:1,c:colors[2]},{x:133,y:89,life:.08,max:1,c:colors[0]},
        {x:150,y:45,life:1.4,max:1,c:colors[1]},{x:78,y:100,life:0,max:1,c:colors[2]}];
      const sparkFallback=make(),sparkDirect=make(),drawSparkInputs=renderer.direct.drawSparkInputs,sparkBefore=renderer.directSparkInputCalls;let sparkLegacy;
      try{renderer.direct.drawSparkInputs=null;sparkLegacy=renderer.drawSparks(sparkFallback.context,sparks,colors)}finally{renderer.direct.drawSparkInputs=drawSparkInputs}
      sparkFallback.context.save();sparkFallback.context.globalCompositeOperation='lighter';for(let ci=0;ci<colors.length;ci++){sparkFallback.context.fillStyle=colors[ci];for(let q=1;q<=6;q++){let any=false;sparkFallback.context.beginPath();for(const p of sparks){if(p.c!==colors[ci])continue;const k=Math.ceil(Math.max(0,p.life/p.max)*6);if(k!==q&&!(q===6&&k>6))continue;sparkFallback.context.rect(p.x-2,p.y-2,4,4);any=true}if(any){sparkFallback.context.globalAlpha=q/6;sparkFallback.context.fill()}}}sparkFallback.context.restore();
      const sparksDrawn=renderer.drawSparks(sparkDirect.context,sparks,colors),sparkParity=compare(sparkFallback,sparkDirect),sparkCalls=renderer.directSparkInputCalls-sparkBefore;
      const blood=[{x:24,y:28,r:3,t:.28},{x:70,y:52,r:6,t:.64},{x:142,y:94,r:2,t:1}],bloodFallback=make(),bloodDirect=make(),drawLiveBlood=renderer.direct.drawLiveBlood,bloodBefore=renderer.directLiveBloodInputCalls;let bloodLegacy;
      try{renderer.direct.drawLiveBlood=null;bloodLegacy=renderer.drawLiveBlood(bloodFallback.context,blood,'rgba(190,12,38,.9)')}finally{renderer.direct.drawLiveBlood=drawLiveBlood}
      bloodFallback.context.fillStyle='rgba(190,12,38,.9)';for(const b of blood){bloodFallback.context.globalAlpha=Math.min(1,b.t);bloodFallback.context.beginPath();bloodFallback.context.arc(b.x,b.y,b.r,0,6.28);bloodFallback.context.fill()}bloodFallback.context.globalAlpha=1;
      const bloodDrawn=renderer.drawLiveBlood(bloodDirect.context,blood,'rgba(190,12,38,.9)'),bloodParity=compare(bloodFallback,bloodDirect),bloodCalls=renderer.directLiveBloodInputCalls-bloodBefore;
      const staticBlood=[{x:32,y:30,r:5},{x:82,y:60,r:9},{x:138,y:91,r:4}],staticFallback=make(),staticDirect=make(),drawStaticBlood=renderer.direct.drawStaticBlood,staticBefore=renderer.directStaticBloodInputCalls;let staticLegacy;
      try{renderer.direct.drawStaticBlood=null;staticLegacy=renderer.drawStaticBlood(staticFallback.context,staticBlood,'rgba(140,6,28,.78)')}finally{renderer.direct.drawStaticBlood=drawStaticBlood}
      staticFallback.context.fillStyle='rgba(140,6,28,.78)';staticFallback.context.beginPath();for(const b of staticBlood){staticFallback.context.moveTo(b.x+b.r,b.y);staticFallback.context.arc(b.x,b.y,b.r,0,6.28)}staticFallback.context.fill();
      const staticDrawn=renderer.drawStaticBlood(staticDirect.context,staticBlood,'rgba(140,6,28,.78)'),staticParity=compare(staticFallback,staticDirect),staticCalls=renderer.directStaticBloodInputCalls-staticBefore;
      const corpseColors=['#b89a70','#56606a','#888f98'],corpses=[{x:39,y:42,a:.12,type:'gun'},{x:91,y:70,a:-.43,type:'bat'},{x:147,y:49,a:1.04,type:'shot'}],corpseFallback=make(),corpseDirect=make(),drawCorpseInputs=renderer.direct.drawCorpseInputs,drawCorpses=renderer.direct.drawCorpses,corpseBefore=renderer.directCorpseInputCalls;let corpseLegacy;
      try{renderer.direct.drawCorpseInputs=null;renderer.direct.drawCorpses=null;corpseLegacy=renderer.drawCorpses(corpseFallback.context,corpses,corpseColors)}finally{renderer.direct.drawCorpseInputs=drawCorpseInputs;renderer.direct.drawCorpses=drawCorpses}
      for(const c of corpses){corpseFallback.context.save();corpseFallback.context.translate(c.x,c.y);corpseFallback.context.rotate(c.a);corpseFallback.context.fillStyle='rgba(0,0,0,.35)';corpseFallback.context.beginPath();corpseFallback.context.ellipse(0,0,15,11,0,0,6.28);corpseFallback.context.fill();corpseFallback.context.fillStyle=corpseColors[['gun','bat','shot'].indexOf(c.type)];corpseFallback.context.globalAlpha=.55;corpseFallback.context.beginPath();corpseFallback.context.ellipse(0,0,13,8,0,0,6.28);corpseFallback.context.fill();corpseFallback.context.restore()}
      const corpsesDrawn=renderer.drawCorpses(corpseDirect.context,corpses,corpseColors),corpseParity=compare(corpseFallback,corpseDirect),corpseCalls=renderer.directCorpseInputCalls-corpseBefore;
      return{dust:{fallback:dustLegacy,drawn:dustDrawn,calls:dustCalls,parity:dustParity},sparks:{fallback:sparkLegacy,drawn:sparksDrawn,calls:sparkCalls,parity:sparkParity},blood:{fallback:bloodLegacy,drawn:bloodDrawn,calls:bloodCalls,parity:bloodParity},staticBlood:{fallback:staticLegacy,drawn:staticDrawn,calls:staticCalls,parity:staticParity},corpses:{fallback:corpseLegacy,drawn:corpsesDrawn,calls:corpseCalls,parity:corpseParity}};
    })()`);
    for (const [name, item] of Object.entries(result || {})) {
      if (item.fallback !== false || !item.drawn || item.calls < 1 || item.parity.differentChannels !== 0 || item.parity.maxDifference !== 0 || !item.parity.alphaRestored || !item.parity.compositeRestored) throw Error(`${name} direct-input parity failed: ${JSON.stringify(item)}`);
    }
    console.log(JSON.stringify({ browser: 'Chrome', result }, null, 2));
  } catch (error) {
    console.error(error.stack || String(error)); process.exitCode = 1;
  } finally {
    if (ws) ws.close();
    if (chrome && !chrome.killed) chrome.kill();
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  }
})();

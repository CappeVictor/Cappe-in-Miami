'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8791, debugPort = 9244;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-dark-input-'));
const server = createGameServer();
let chrome, ws;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeoutMs = 20000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(200); }
  throw Error('timeout waiting for WASM renderer');
}

(async () => {
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--disable-background-networking', '--remote-allow-origins=*', '--remote-debugging-port=' + debugPort,
      '--user-data-dir=' + profile, '--window-size=800,600', 'http://127.0.0.1:' + port + '/?renderer=wasm'], { stdio: 'ignore', windowsHide: true });
    await until(async () => { const response = await fetch('http://127.0.0.1:' + debugPort + '/json/version'); return response.ok ? response.json() : null; });
    const targets = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
    const page = targets.find(target => target.type === 'page' && target.webSocketDebuggerUrl);
    if (!page) throw Error('Chrome page target missing');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    const pending = new Map(); let sequence = 0;
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const item = pending.get(message.id); pending.delete(message.id);
        message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result);
      }
    });
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
    });
    await call('Runtime.enable');
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
      return result.result && result.result.value;
    };
    const ready = await until(async () => {
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady}))()');
      return state && state.active && state.directReady ? state : null;
    });
    const parity = await evaluate(`(()=>{
      const make=(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas},
        makeDark=()=>{const canvas=make(480,300),context=canvas.getContext('2d');context.setTransform(.5,0,0,.5,0,0);return{canvas,context}},
        source=(size,color)=>{const canvas=make(size,size),context=canvas.getContext('2d');context.fillStyle=color;context.fillRect(0,0,size,size);return canvas},
        darkReference=makeDark(),darkDirect=makeDark(),screenReference=make(320,200),screenDirect=make(320,200),
        overlay=source(32,'rgba(4,0,20,.8)'),core=source(300,'rgba(255,255,255,.85)'),far=source(660,'rgba(255,255,255,.6)'),flash=source(520,'rgba(255,220,120,.5)'),
        lamps={core,far,flash},painter=HM_WASM_RENDERER.direct.drawDarkOverlayInputs,before=HM_WASM_RENDERER.directDarkOverlayInputCalls||0;
      for(const context of [darkReference.context,darkDirect.context]){context.globalAlpha=.8;context.globalCompositeOperation='multiply'}
      for(const context of [screenReference.getContext('2d'),screenDirect.getContext('2d')]){context.globalAlpha=.7;context.globalCompositeOperation='multiply'}
      let fallback,direct;
      try{HM_WASM_RENDERER.direct.drawDarkOverlayInputs=null;fallback=HM_WASM_RENDERER.drawDarkOverlay(darkReference.context,screenReference.getContext('2d'),overlay,lamps,270,188,42,35,960,600,.82,.47,false,true)}
      finally{HM_WASM_RENDERER.direct.drawDarkOverlayInputs=painter}
      const sx=(270-42-960/2)*.82+960/2,sy=(188-35-600/2)*.82+600/2,rc=150*.82,rf=330*.82,rl=260*.82;
      const dg=darkReference.context,g=screenReference.getContext('2d');dg.globalCompositeOperation='source-over';dg.clearRect(0,0,960,600);dg.fillStyle='rgba(3,0,12,.88)';dg.fillRect(0,0,960,600);dg.globalCompositeOperation='destination-out';dg.drawImage(core,sx-rc,sy-rc,rc*2,rc*2);dg.save();dg.beginPath();dg.moveTo(sx,sy);dg.arc(sx,sy,rf,.47-.38,.47+.38);dg.closePath();dg.clip();dg.drawImage(far,sx-rf,sy-rf,rf*2,rf*2);dg.restore();dg.drawImage(flash,sx-rl,sy-rl,rl*2,rl*2);g.drawImage(overlay,0,0,960,600);
      direct=HM_WASM_RENDERER.drawDarkOverlay(darkDirect.context,screenDirect.getContext('2d'),overlay,lamps,270,188,42,35,960,600,.82,.47,false,true);
      const compare=(a,b,w,h)=>{const x=a.getImageData(0,0,w,h).data,y=b.getImageData(0,0,w,h).data;let differentChannels=0,maxDifference=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}return{differentChannels,maxDifference}},
        dark=compare(darkReference.context,darkDirect.context,480,300),screen=compare(screenReference.getContext('2d'),screenDirect.getContext('2d'),320,200);
      return{fallback,direct,calls:(HM_WASM_RENDERER.directDarkOverlayInputCalls||0)-before,dark,screen};
    })()`);
    if (parity.fallback !== false || !parity.direct || parity.calls < 1 || parity.dark.differentChannels !== 0 || parity.dark.maxDifference !== 0
      || parity.screen.differentChannels !== 0 || parity.screen.maxDifference !== 0) throw Error('dark overlay input parity failed: ' + JSON.stringify(parity));
    process.stdout.write(JSON.stringify({ ready, parity }, null, 2) + '\n');
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

'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8792, debugPort = 9245;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-fx-input-'));
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
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=280;canvas.height=180;const context=canvas.getContext('2d');context.globalAlpha=.73;context.globalCompositeOperation='multiply';return{canvas,context}},
        reference=make(),direct=make(),effects=[
          {x:70,y:55,t:.08,R:14,a:.3,muzzle:true},
          {x:132,y:87,t:.17,R:18,a:-.7,muzzle:false},
          {x:205,y:126,t:.12,R:11,a:1.1,muzzle:true}
        ],inputCalls=HM_WASM_RENDERER.directFxInputCalls||0;
      let fallback,directResult;
      fallback=true;
      for(const f of effects){
        if(f.muzzle){reference.context.save();reference.context.globalCompositeOperation='lighter';reference.context.globalAlpha=Math.max(0,f.t*10);const grd=reference.context.createRadialGradient(f.x,f.y,0,f.x,f.y,f.R);grd.addColorStop(0,'#ffffff');grd.addColorStop(.35,'#ffd23f');grd.addColorStop(1,'rgba(255,100,40,0)');reference.context.fillStyle=grd;reference.context.beginPath();reference.context.arc(f.x,f.y,f.R,0,6.28);reference.context.fill();reference.context.restore()}
        else{reference.context.strokeStyle='#fff';reference.context.lineWidth=4;reference.context.beginPath();reference.context.arc(f.x,f.y,f.R,f.a-1.2,f.a+1.2);reference.context.stroke()}
      }
      directResult=HM_WASM_RENDERER.drawFx(direct.context,effects);
      const a=reference.context.getImageData(0,0,280,180).data,b=direct.context.getImageData(0,0,280,180).data;
      let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
      return{fallback,directResult,directInputCalls:(HM_WASM_RENDERER.directFxInputCalls||0)-inputCalls,differentChannels,maxDifference,
        alphaRestored:reference.context.globalAlpha===direct.context.globalAlpha,compositeRestored:reference.context.globalCompositeOperation===direct.context.globalCompositeOperation};
    })()`);
    if (!parity.fallback || !parity.directResult || parity.directInputCalls < 1 || parity.differentChannels !== 0 || parity.maxDifference !== 0
      || !parity.alphaRestored || !parity.compositeRestored) throw Error('FX direct input parity failed: ' + JSON.stringify(parity));
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

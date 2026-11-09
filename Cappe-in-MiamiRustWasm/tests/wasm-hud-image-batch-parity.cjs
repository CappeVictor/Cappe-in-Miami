'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8791, debugPort = 9244;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-hud-batch-'));
const server = createGameServer();
let chrome, ws;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeout = 20000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(200); }
  throw Error('timeout waiting for Rust/WASM direct module');
}

(async () => {
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--disable-background-networking', '--remote-allow-origins=*', '--remote-debugging-port=' + debugPort,
      '--user-data-dir=' + profile, 'http://127.0.0.1:' + port + '/?renderer=wasm'], { stdio: 'ignore', windowsHide: true });
    await until(async () => { const response = await fetch('http://127.0.0.1:' + debugPort + '/json/version'); return response.ok ? response.json() : null; });
    const targets = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
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
    const parity = await evaluate(`(()=>{
      const images=[];for(let i=0;i<3;i++){const c=document.createElement('canvas');c.width=24+i*3;c.height=18+i*2;const g=c.getContext('2d');g.fillStyle=['#ff2e93','#19f0e6','#ffd23f'][i];g.fillRect(0,0,c.width,c.height);images.push(c)}
      const make=()=>{const c=document.createElement('canvas');c.width=160;c.height=120;return c.getContext('2d')},reference=make(),direct=make(),placements=[13,18,.45,52,30,.8,105,75,1];reference.globalAlpha=direct.globalAlpha=.7;reference.globalCompositeOperation=direct.globalCompositeOperation='multiply';
      for(let i=0;i<images.length;i++){reference.save();reference.globalAlpha=placements[i*3+2];reference.drawImage(images[i],placements[i*3],placements[i*3+1]);reference.restore()}
      const before=HM_WASM_RENDERER.directCanvasImageBatchFrames;if(!HM_WASM_RENDERER.drawCanvasImageBatch(direct,images,placements))return{error:'Rust cached-image batch draw failed'};
      if(HM_WASM_RENDERER.directCanvasImageBatchFrames!==before+1)return{error:'batch did not use direct Rust'};
      const a=reference.getImageData(0,0,160,120).data,b=direct.getImageData(0,0,160,120).data;let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
      const invalid=HM_WASM_RENDERER.drawCanvasImageBatch(direct,images,[0,0,2,0,0,1,0,0,1]);
      return{images:images.length,directFrames:1,differentChannels,maxDifference,restoredAlpha:direct.globalAlpha,restoredComposite:direct.globalCompositeOperation==='multiply',invalidRejected:invalid===false};
    })()`);
    if (parity?.error || parity.images !== 3 || parity.directFrames !== 1 || parity.differentChannels !== 0 || parity.maxDifference !== 0
      || parity.restoredAlpha !== .7 || !parity.restoredComposite || !parity.invalidRejected) throw Error('cached HUD image batch parity failed: ' + JSON.stringify(parity));
    console.log(JSON.stringify({ browser: 'Chrome', parity }, null, 2));
  } catch (error) {
    console.error(error.stack || String(error)); process.exitCode = 1;
  } finally {
    if (ws) ws.close();
    if (chrome && !chrome.killed) chrome.kill();
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  }
})();

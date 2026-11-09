'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8795, debugPort = 9248;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-exp-weapons-'));
const server = createGameServer();
let chrome, ws;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeoutMs = 25000) {
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
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady,draw:typeof HM_WASM_RENDERER?.drawWeapon}))()');
      return state && state.active && state.directReady && state.draw === 'function' ? state : null;
    });
    const parity = await evaluate(`(()=>{
      const names=['pistola_aut','magnum','pump','dupla','carabina','sniper','lmg','katana','machado','garrafa','extintor','lanca'];
      let differentChannels=0,maxDifference=0,stateRestored=true;const cases=[];
      for(const name of names){
        const make=()=>{const c=document.createElement('canvas');c.width=96;c.height=48;const g=c.getContext('2d');g.translate(5,24);g.globalAlpha=.83;g.fillStyle='#123456';return g};
        const reference=make(),direct=make(),wasActive=HM_WASM_RENDERER.active;HM_WASM_RENDERER.active=false;
        try{wicon(reference,name)}finally{HM_WASM_RENDERER.active=wasActive}
        const before=HM_WASM_RENDERER.directWeaponIconCalls||0;
        if(!HM_WASM_RENDERER.drawWeapon(direct,name))throw Error('Rust icon failed: '+name);
        const calls=(HM_WASM_RENDERER.directWeaponIconCalls||0)-before;
        const a=reference.getImageData(0,0,96,48).data,b=direct.getImageData(0,0,96,48).data;let local=0,localMax=0,minX=96,minY=48,maxX=-1,maxY=-1;const samples=[];
        for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d){local++;differentChannels++;const x=Math.floor(i/4)%96,y=Math.floor(i/(96*4));minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);if(samples.length<6)samples.push({x,y,channel:i%4,a:a[i],b:b[i]})}if(d>localMax)localMax=d;if(d>maxDifference)maxDifference=d}
        const transform=direct.getTransform();stateRestored=stateRestored&&direct.globalAlpha===.83&&Math.abs(transform.a-1)<1e-9&&Math.abs(transform.d-1)<1e-9&&transform.e===5&&transform.f===24;
        cases.push({name,calls,differentChannels:local,maxDifference:localMax,bounds:local?[minX,minY,maxX,maxY]:null,samples});
      }
      return{weapons:names.length,cases,differentChannels,maxDifference,stateRestored};
    })()`);
    if (parity.weapons !== 12 || parity.cases.some(item => item.calls !== 1) || parity.differentChannels !== 0 || parity.maxDifference !== 0 || !parity.stateRestored)
      throw Error('Expansion weapon icon parity failed: ' + JSON.stringify(parity));
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

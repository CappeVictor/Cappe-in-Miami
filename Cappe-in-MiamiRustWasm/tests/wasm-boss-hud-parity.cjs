'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8796, debugPort = 9249;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-boss-hud-'));
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
      '--user-data-dir=' + profile, '--window-size=1000,700', 'http://127.0.0.1:' + port + '/?renderer=wasm'], { stdio: 'ignore', windowsHide: true });
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
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady,draw:typeof HM_WASM_RENDERER?.drawBossHealthBar}))()');
      return state && state.active && state.directReady && state.draw === 'function' ? state : null;
    });
    const parity = await evaluate(`(()=>{
      const make=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;const g=c.getContext('2d');g.globalAlpha=.64;g.globalCompositeOperation='screen';g.setTransform(1.05,0,0,1.05,3,-4);return{c,g}};
      const reference=make(),direct=make(),boss={hp:4.25,hpMax:9,boss:{col:'#ff8a1f',phases:[{at:1},{at:.72},{at:.38},{at:.12}]}},renderer=HM_WASM_RENDERER.direct;
      const old=HM_WASM_RENDERER.directReady,before=HM_WASM_RENDERER.directBossHealthBarCalls||0;let fallback,drawn;
      try{HM_WASM_RENDERER.directReady=false;fallback=HM_WASM_RENDERER.drawBossHealthBar(reference.g,boss,960,600)}finally{HM_WASM_RENDERER.directReady=old}
      const w=460,x=(960-w)/2,y=600-92,f=Math.max(0,boss.hp/boss.hpMax),g=reference.g;
      g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-3,y-3,w+6,20);g.fillStyle=boss.boss.col;g.fillRect(x,y,w*f,14);
      g.fillStyle='rgba(255,255,255,.35)';for(let i=1;i<boss.boss.phases.length;i++)g.fillRect(x+w*boss.boss.phases[i].at-1,y,2,14);
      g.strokeStyle='#000';g.lineWidth=2;g.strokeRect(x,y,w,14);
      drawn=HM_WASM_RENDERER.drawBossHealthBar(direct.g,boss,960,600);
      const a=reference.g.getImageData(0,0,960,600).data,b=direct.g.getImageData(0,0,960,600).data;let differentChannels=0,maxDifference=0;
      for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
      const t=direct.g.getTransform();return{fallback,drawn,calls:(HM_WASM_RENDERER.directBossHealthBarCalls||0)-before,differentChannels,maxDifference,
        alphaRestored:direct.g.globalAlpha===.64,compositeRestored:direct.g.globalCompositeOperation==='screen',transformRestored:Math.abs(t.a-1.05)<1e-6&&Math.abs(t.d-1.05)<1e-6&&Math.abs(t.e-3)<1e-6&&Math.abs(t.f+4)<1e-6,transform:[t.a,t.b,t.c,t.d,t.e,t.f]};
    })()`);
    if (parity.fallback || !parity.drawn || parity.calls !== 1 || parity.differentChannels !== 0 || parity.maxDifference !== 0
      || !parity.alphaRestored || !parity.compositeRestored || !parity.transformRestored) throw Error('Boss HUD parity failed: ' + JSON.stringify(parity));
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

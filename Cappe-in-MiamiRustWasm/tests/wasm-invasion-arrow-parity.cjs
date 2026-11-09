'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8793, debugPort = 9246;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-invasion-arrow-'));
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
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady,draw:typeof HM_WASM_RENDERER?.drawInvasionArrow}))()');
      return state && state.active && state.directReady && state.draw === 'function' ? state : null;
    });
    const parity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=420;return canvas},
        fallback=make(),direct=make(),cases=[[80,80,0],[190.5,120.25,.47],[340,270,1.2],[510,330,2.68],[630,16,5.1]],
        before=HM_WASM_RENDERER.directInvasionArrowCalls||0;
      for(const context of [fallback.getContext('2d'),direct.getContext('2d')]){context.globalAlpha=.83;context.globalCompositeOperation='screen';context.setTransform(1.05,0,0,1.05,2,-4)}
      for(const [x,y,angle] of cases){const c=fallback.getContext('2d'),cos=Math.cos(angle),sin=Math.sin(angle),local=[[14,0],[-8,-9],[-8,9]],p=local.map(([px,py])=>[x+px*cos-py*sin,y+px*sin+py*cos]);
        c.save();c.fillStyle='#ff6bd5';c.beginPath();c.moveTo(p[0][0],p[0][1]);c.lineTo(p[1][0],p[1][1]);c.lineTo(p[2][0],p[2][1]);c.closePath();c.fill();c.restore()}
      for(const v of cases)if(!HM_WASM_RENDERER.drawInvasionArrow(direct.getContext('2d'),v[0],v[1],v[2]))throw Error('direct arrow failed');
      const a=fallback.getContext('2d').getImageData(0,0,640,420).data,b=direct.getContext('2d').getImageData(0,0,640,420).data;
      let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
      const ctx=direct.getContext('2d'),transform=ctx.getTransform();return{cases:cases.length,calls:(HM_WASM_RENDERER.directInvasionArrowCalls||0)-before,differentChannels,maxDifference,
        alphaRestored:ctx.globalAlpha===.83,compositeRestored:ctx.globalCompositeOperation==='screen',transformRestored:Math.abs(transform.a-1.05)<1e-6&&Math.abs(transform.e-2)<1e-6};
    })()`);
    if (parity.cases !== 5 || parity.calls !== 5 || parity.differentChannels !== 0 || parity.maxDifference !== 0
      || !parity.alphaRestored || !parity.compositeRestored || !parity.transformRestored) throw Error('Invasion arrow parity failed: ' + JSON.stringify(parity));
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

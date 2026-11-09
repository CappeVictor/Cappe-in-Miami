'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8792, debugPort = 9245;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-owl-'));
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
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady,draw:typeof HM_WASM_RENDERER?.drawOwlOverlay}))()');
      return state && state.active && state.directReady && state.draw === 'function' ? state : null;
    });
    const parity = await evaluate(`(()=>{
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=420;return canvas},
        fallback=make(),direct=make(),items=new Float64Array([
          0,90,100,12,12, 1,180,190,24,0, 2,270,130,10,8, 1,380,260,17,0,
          0,480,300,12,12
        ]),path=new Float64Array([55,60,100,74,145,110,190,118,240,160,290,166,330,220,390,224]),now=1734.5,pulse=.55+.35*Math.sin(now/260),
        before=HM_WASM_RENDERER.directOwlOverlayCalls||0;
      const paint=(context)=>{context.save();context.strokeStyle='rgba(176,107,255,'+pulse+')';context.lineWidth=2;
        for(let i=0;i<items.length;i+=5){const kind=items[i],x=items[i+1],y=items[i+2],rx=items[i+3],ry=items[i+4];
          if(kind===0||kind===2)context.strokeRect(x-rx,y-ry,rx*2,ry*2);else{context.beginPath();context.arc(x,y,rx,0,Math.PI*2);context.stroke()}}
        context.setLineDash([10,8]);context.lineDashOffset=-now/40;context.beginPath();context.moveTo(path[0],path[1]);
        for(let i=2;i<path.length;i+=2)context.lineTo(path[i],path[i+1]);context.stroke();context.restore()};
      for(const context of [fallback.getContext('2d'),direct.getContext('2d')]){context.globalAlpha=.73;context.globalCompositeOperation='lighter';context.setTransform(1.1,0,0,1.1,3,-7)}
      paint(fallback.getContext('2d'));
      const result=HM_WASM_RENDERER.drawOwlOverlay(direct.getContext('2d'),items,5,path,path.length/2,now,pulse);
      const a=fallback.getContext('2d').getImageData(0,0,640,420).data,b=direct.getContext('2d').getImageData(0,0,640,420).data;
      let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
      const state=direct.getContext('2d');return{result,calls:(HM_WASM_RENDERER.directOwlOverlayCalls||0)-before,differentChannels,maxDifference,
        alphaRestored:state.globalAlpha===.73,compositeRestored:state.globalCompositeOperation==='lighter',transformRestored:Math.abs(state.getTransform().a-1.1)<1e-6&&Math.abs(state.getTransform().e-3)<1e-6};
    })()`);
    if (!parity.result || parity.calls < 1 || parity.differentChannels !== 0 || parity.maxDifference !== 0
      || !parity.alphaRestored || !parity.compositeRestored || !parity.transformRestored) throw Error('Owl overlay parity failed: ' + JSON.stringify(parity));
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

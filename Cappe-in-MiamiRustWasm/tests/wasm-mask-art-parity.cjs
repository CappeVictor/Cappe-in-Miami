'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8794, debugPort = 9247;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-mask-art-'));
const server = createGameServer();
const source = fs.readFileSync(path.join(process.cwd(), 'js/exp-content.js'), 'utf8');
const start = source.indexOf('  function makeMaskArt(sp) {');
// Aceita LF e CRLF: o teste compara o painter legado e não deve depender do
// estilo de quebra de linha usado no checkout do projeto.
const end = source.indexOf('  // fx novos reconhecidos pela expansão', start);
if (start < 0 || end < 0) throw Error('makeMaskArt source range not found');
const legacyFunction = source.slice(start, end).trim().replace(/^function /, 'function ');
let chrome, ws;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeoutMs = 25000) {
  const endAt = Date.now() + timeoutMs;
  while (Date.now() < endAt) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(200); }
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
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady,draw:typeof HM_WASM_RENDERER?.drawMaskArt,calls:HM_WASM_RENDERER?.directMaskArtCalls||0,maskCount:MASKS.filter(m=>m.exp).length}))()');
      return state && state.active && state.directReady && state.draw === 'function' && state.calls >= 16 && state.maskCount === 16 ? state : null;
    });
    const legacySource = JSON.stringify(legacyFunction);
    const result = await evaluate(`(()=>{
      const masks=MASKS.filter(m=>m.exp),specs=masks.map(m=>m.art), legacy=eval('('+${legacySource}+')');
      const oldDraw=HM_WASM_RENDERER.drawMaskArt, cases=[]; let differentChannels=0, maxDifference=0, directCalls=0, contextRestored=true;
      for(const spec of specs){
        const oldCanvas=document.createElement('canvas'),rustCanvas=document.createElement('canvas'); oldCanvas.width=oldCanvas.height=rustCanvas.width=rustCanvas.height=128;
        const oldContext=oldCanvas.getContext('2d'),rustContext=rustCanvas.getContext('2d');
        HM_WASM_RENDERER.drawMaskArt=null;
        const oldImage=legacy(spec);
        HM_WASM_RENDERER.drawMaskArt=oldDraw;
        const before=HM_WASM_RENDERER.directMaskArtCalls||0, rustImage=(()=>{
          const c=document.createElement('canvas');c.width=c.height=128;
          const context=c.getContext('2d');
          if(!oldDraw(context,spec))throw Error('Rust render failed '+spec.a);
          const transform=context.getTransform();
          contextRestored=contextRestored&&context.globalAlpha===1&&context.globalCompositeOperation==='source-over'
            &&Math.abs(transform.a-1)<1e-9&&Math.abs(transform.d-1)<1e-9&&transform.e===0&&transform.f===0;
          return c;
        })();
        directCalls+=(HM_WASM_RENDERER.directMaskArtCalls||0)-before;
        oldContext.drawImage(oldImage,0,0); rustContext.drawImage(rustImage,0,0);
        const a=oldContext.getImageData(0,0,128,128).data,b=rustContext.getImageData(0,0,128,128).data;let perMask=0;
        for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d){perMask++;differentChannels++;}if(d>maxDifference)maxDifference=d;}
        cases.push({id:spec.a,differentChannels:perMask});
      }
      const first=MASKS.findIndex(m=>m.exp),menuRegenerated=grade.children.length===MASKS.length&&masks.every((m,i)=>grade.children[first+i].querySelector('canvas')===m.img);
      return {cases:cases.length,directCalls,differentChannels,maxDifference,caseResults:cases,menuRegenerated,contextRestored};
    })()`);
    if (result.cases !== 16 || result.directCalls !== 16 || result.differentChannels !== 0 || result.maxDifference !== 0 || !result.menuRegenerated || !result.contextRestored)
      throw Error('Mask art parity failed: ' + JSON.stringify(result));
    process.stdout.write(JSON.stringify({ ready, parity: result }, null, 2) + '\n');
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

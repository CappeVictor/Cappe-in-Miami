'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8793, debugPort = 9246;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-pickup-throw-input-'));
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
      const make=()=>{const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=400;const context=canvas.getContext('2d');context.globalAlpha=.73;context.globalCompositeOperation='multiply';return{canvas,context}},
        icons=(context,weapon)=>HM_WASM_RENDERER.drawWeapon(context,weapon),
        weaponNames=['punho','taco','faca','smg','escopeta','rifle','pistola','revolver','uzi','cano','pe_de_cabra','martelo','pistola_aut','magnum','pump','dupla','carabina','sniper','lmg','katana','machado','garrafa','extintor','lanca'],
        compare=(kind,glow,now)=>{
          const reference=make(),direct=make(),throws=kind==='throw',method=throws?'drawThrows':'drawPickups',
            before=throws?(HM_WASM_RENDERER.directThrowInputCalls||0):(HM_WASM_RENDERER.directPickupInputCalls||0),
            items=weaponNames.map((w,i)=>throws
              ? {x:55+(i%6)*155,y:60+Math.floor(i/6)*92,rot:(i%5-2)*.17,w}
              : {x:55+(i%6)*155,y:60+Math.floor(i/6)*92,a:(i%5-2)*.17,w});
          let fallback=true;
          for(const item of items){
            reference.context.save();
            if(throws){reference.context.translate(item.x,item.y);reference.context.rotate(item.rot);reference.context.translate(-18,0);icons(reference.context,item.w)}
            else{
              reference.context.translate(item.x,item.y);reference.context.rotate(item.a);reference.context.translate(-18,0);
              if(glow){const pulse=.55+.45*Math.sin(now/220+item.x);reference.context.fillStyle='rgba(255,210,63,'+(.18+.14*pulse)+')';reference.context.beginPath();reference.context.arc(18,0,18,0,6.28);reference.context.fill();reference.context.fillStyle='rgba(255,255,255,'+(.08*pulse)+')';reference.context.beginPath();reference.context.arc(18,0,10,0,6.28);reference.context.fill()}
              else{reference.context.fillStyle='rgba(255,210,63,.2)';reference.context.beginPath();reference.context.arc(18,0,14,0,6.28);reference.context.fill()}
              icons(reference.context,item.w)
            }
            reference.context.restore();
          }
          let directResult;
          directResult=throws?HM_WASM_RENDERER.drawThrows(direct.context,items,icons):HM_WASM_RENDERER.drawPickups(direct.context,items,glow,now,icons);
          const a=reference.context.getImageData(0,0,1000,400).data,b=direct.context.getImageData(0,0,1000,400).data;
          let differentChannels=0,maxDifference=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)differentChannels++;if(d>maxDifference)maxDifference=d}
          const current=throws?(HM_WASM_RENDERER.directThrowInputCalls||0):(HM_WASM_RENDERER.directPickupInputCalls||0);
          return{weapons:items.length,fallback,directResult,directInputCalls:current-before,differentChannels,maxDifference,
            alphaRestored:reference.context.globalAlpha===direct.context.globalAlpha,compositeRestored:reference.context.globalCompositeOperation===direct.context.globalCompositeOperation};
        },
        pickupGlow=compare('pickup',true,440),pickupNoGlow=compare('pickup',false,880),thrown=compare('throw',false,0);
      return{pickupGlow,pickupNoGlow,thrown};
    })()`);
    for (const [name, result] of Object.entries(parity)) {
      if (!result.fallback || !result.directResult || result.directInputCalls < 1 || result.differentChannels !== 0 || result.maxDifference !== 0
        || !result.alphaRestored || !result.compositeRestored) throw Error(name + ' direct input parity failed: ' + JSON.stringify(result));
    }
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

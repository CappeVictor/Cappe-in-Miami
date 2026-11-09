'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8797, debugPort = 9250;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-rain-mote-'));
const server = createGameServer();
let chrome, ws;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeoutMs = 20000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(200); }
  throw Error('timeout waiting for Rust/WASM renderer');
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
    await until(async () => {
      const state = await evaluate('(()=>({active:HM_WASM_RENDERER?.active,directReady:HM_WASM_RENDERER?.directReady}))()');
      return state && state.active && state.directReady ? state : null;
    });
    const result = await evaluate(`(()=>{
      const renderer=HM_WASM_RENDERER,direct=renderer.direct;
      const drops=[{x:12.5,y:16.25,l:18.5},{x:51,y:43,l:27},{x:104.75,y:21,l:14},{x:190,y:88,l:33}];
      const motes=[{x:16.5,y:23.5,r:2.5,p:.2},{x:73,y:59,r:3.75,p:1.1},{x:158.25,y:34,r:1.25,p:2.4}];
      const make=()=>{const c=document.createElement('canvas');c.width=240;c.height=160;return c.getContext('2d')};
      const rainBuffers=[],moteBuffers=[];
      renderer.direct=new Proxy(direct,{get(target,key){if(key==='drawRain')return(...args)=>{rainBuffers.push(args[1].buffer);return target.drawRain(...args)};if(key==='drawWeatherMotes')return(...args)=>{moteBuffers.push(args[1].buffer);return target.drawWeatherMotes(...args)};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value}});
      const directRain=renderer.drawRain(make(),drops,1),directRainSecond=renderer.drawRain(make(),drops,2);
      const directMotes=renderer.drawWeatherMotes(make(),motes,1234),directMotesSecond=renderer.drawWeatherMotes(make(),motes,2345);
      const unavailable=new Proxy(direct,{get(target,key){if(key==='drawRain'||key==='drawWeatherMotes')return undefined;const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value}});
      renderer.direct=unavailable;const rainFallbackContext=make(),moteFallbackContext=make();
      const fallbackRain=renderer.drawRain(rainFallbackContext,drops,1),fallbackMotes=renderer.drawWeatherMotes(moteFallbackContext,motes,1234);
      renderer.direct=direct;
      return{directRain,directRainSecond,directMotes,directMotesSecond,fallbackRain,fallbackMotes,rainFallbackUntouched:rainFallbackContext.getImageData(0,0,240,160).data.every(value=>value===0),moteFallbackUntouched:moteFallbackContext.getImageData(0,0,240,160).data.every(value=>value===0),rainBufferReused:rainBuffers.length===2&&rainBuffers[0]===rainBuffers[1],moteBufferReused:moteBuffers.length===2&&moteBuffers[0]===moteBuffers[1]};
    })()`);
    if (!result || !result.directRain || !result.directRainSecond || !result.directMotes || !result.directMotesSecond
      || result.fallbackRain || result.fallbackMotes || !result.rainFallbackUntouched || !result.moteFallbackUntouched
      || !result.rainBufferReused || !result.moteBufferReused) throw Error('rain/weather mote route failed: ' + JSON.stringify(result));
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

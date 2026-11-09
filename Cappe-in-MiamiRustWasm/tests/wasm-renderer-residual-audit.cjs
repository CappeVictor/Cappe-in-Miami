'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require('../server/server.js');

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8790, debugPort = 9243;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-wasm-residual-'));
const server = createGameServer();
let chrome;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { try { const value = await fn(); if (value) return value; } catch (_) {} await wait(150); }
  throw Error('timeout waiting for Chrome renderer');
}

(async () => {
  let ws;
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-allow-origins=*', '--remote-debugging-port=' + debugPort, '--user-data-dir=' + profile, '--window-size=1280,720', `http://127.0.0.1:${port}/?renderer=wasm&wasmDiagnostics=1`], { stdio: 'ignore', windowsHide: true });
    await until(async () => { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); return response.ok ? response.json() : null; });
    const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
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
      const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      return response.result?.value;
    };
    await until(async () => evaluate('!!(HM_WASM_RENDERER?.active && HM_WASM_RENDERER?.directReady)'));
    const snapshot = async label => evaluate(`(()=>{
      const r=HM_WASM_RENDERER, top=r.getResidualCanvasTop(20), properties=Object.entries(r.canvasPropertyWriteCounts).sort((a,b)=>b[1]-a[1]).slice(0,12);
      const samples=Object.fromEntries(Object.entries(r.canvasOperationSamples).map(([k,v])=>[k,String(v).split('\\n').slice(0,5).join('\\n')]));
      const propertySamples=Object.fromEntries(Object.entries(r.canvasPropertyWriteSamples).map(([k,v])=>[k,String(v).split('\\n').slice(0,5).join('\\n')]));
      const floor=${JSON.stringify(label)}.startsWith('modo ')?{width:WW,height:WH,ftiles:{complete:FTILES.complete,width:FTILES.naturalWidth,height:FTILES.naturalHeight},rooms:rooms.map(({x,y,w,h})=>({x,y,w,h,integer:[x,y,w,h].every(Number.isInteger)})),floorTextureCommands:r.floorTextureCommands,floorTileCalls:r.directFloorTileCalls,directError:r.directError}:null;
      const result={scene:${JSON.stringify(label)},state:typeof st==='undefined'?null:st,operations:top,properties,samples,propertySamples,floor};
      for(const table of [r.canvasOperationCounts,r.canvasPropertyWriteCounts,r.canvasOperationSamples,r.canvasPropertyWriteSamples]) for(const key of Object.keys(table)) delete table[key];
      return result;
    })()`);
    await wait(500);
    const scenes = [await snapshot('menu inicial')];
    await evaluate('newGame(); true');
    await wait(1200);
    scenes.push(await snapshot('gameplay'));
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
    await wait(400);
    scenes.push(await snapshot('pausa/overlay'));
    for (const [state, label] of [
      ['dead', 'morte'], ['summary', 'resumo de fase'], ['result', 'resultado'], ['win', 'vitória'],
      ['brief', 'briefing'], ['dif', 'dificuldade'], ['pick', 'seleção de máscara'], ['opt', 'opções'], ['expui', 'expansão UI']
    ]) {
      await evaluate(`st=${JSON.stringify(state)}; draw(); true`);
      await wait(120);
      scenes.push(await snapshot(label));
    }
    for (const id of ['classico', 'campanha', 'horda', 'sobrevivencia', 'arcade', 'contrarrelogio', 'assassino', 'limpeza', 'invasao', 'diario', 'custom']) {
      const opts = ['horda', 'sobrevivencia', 'invasao'].includes(id) ? { map: 'rand' } : {};
      await evaluate(`EXP.startMode(${JSON.stringify(id)},${JSON.stringify(opts)}); if(st==='pick') newGame(); true`);
      await until(async () => evaluate(`st==='play' && EXP.run?.id===${JSON.stringify(id)}`), 15000);
      await wait(600);
      scenes.push(await snapshot('modo ' + id));
    }
    const residualScenes = scenes.filter(scene => scene.operations.some(([, count]) => count > 0) || scene.properties.some(([, count]) => count > 0));
    if (residualScenes.length) throw Error('JavaScript-host Canvas residuals remain in sampled scenes: ' + JSON.stringify(residualScenes.map(scene => ({ scene: scene.scene, operations: scene.operations, properties: scene.properties, floor: scene.floor, fillRect: scene.samples.fillRect, createPattern: scene.samples.createPattern }))));
    console.log(JSON.stringify({ browser: (await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json()).Browser, scenes }, null, 2));
  } catch (error) {
    console.error(error.stack || String(error)); process.exitCode = 1;
  } finally {
    if (ws) ws.close();
    if (chrome && !chrome.killed) chrome.kill();
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  }
})();

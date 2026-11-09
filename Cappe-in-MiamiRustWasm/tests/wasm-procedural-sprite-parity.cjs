'use strict';
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { createGameServer } = require(path.join(process.cwd(), 'server/server.js'));

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 8792, debugPort = 9245;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-procedural-sprites-'));
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
    const result = await evaluate(`(()=>{
      const buffer=new ArrayBuffer(8),f64=new Float64Array(buffer),u64=new BigUint64Array(buffer);
      const sqrt=v=>{if(v<=0)return 0;f64[0]=v;u64[0]=(u64[0]>>1n)+0x1ff8000000000000n;let e=f64[0];e=(e+v/e)*.5;e=(e+v/e)*.5;return(e+v/e)*.5};
      const diff=(a,b)=>{const x=a.getContext('2d').getImageData(0,0,a.width,a.height).data,y=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let channels=0,max=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d)channels++;if(d>max)max=d}return{channels,max}};
      const radialCanvas=document.createElement('canvas'),radialReference=document.createElement('canvas'),radius=23.5,alpha=.72,rgb=[255,46,147],side=Math.ceil(radius*2);radialReference.width=radialReference.height=side;
      const radialData=radialReference.getContext('2d').createImageData(side,side);
      for(let y=0;y<side;y++)for(let x=0;x<side;x++){const dx=x+.5-radius,dy=y+.5-radius,remaining=1-sqrt(dx*dx+dy*dy)/radius,opacity=Math.floor(alpha*Math.max(0,remaining)*255+.5),o=(y*side+x)*4;if(opacity){radialData.data[o]=rgb[0];radialData.data[o+1]=rgb[1];radialData.data[o+2]=rgb[2]}radialData.data[o+3]=opacity}
      radialReference.getContext('2d').putImageData(radialData,0,0);const radialBefore=HM_WASM_RENDERER.directRadialSpriteCalls;
      if(!HM_WASM_RENDERER.createRadialSprite(radialCanvas,rgb.join(','),radius,alpha))return{error:'direct radial sprite creation failed'};
      const radial=diff(radialReference,radialCanvas);
      const directRadialPainter=HM_WASM_RENDERER.direct.createRadialSprite;let radialLegacyDisabled=false;
      try{HM_WASM_RENDERER.direct.createRadialSprite=null;radialLegacyDisabled=!HM_WASM_RENDERER.createRadialSprite(document.createElement('canvas'),rgb.join(','),radius,alpha)}
      finally{HM_WASM_RENDERER.direct.createRadialSprite=directRadialPainter}
      const muzzleCanvas=document.createElement('canvas'),muzzleReference=document.createElement('canvas');muzzleReference.width=muzzleReference.height=128;
      const muzzleData=muzzleReference.getContext('2d').createImageData(128,128),center=64;
      for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=x+.5-center,dy=y+.5-center,distance=sqrt(dx*dx+dy*dy)/center,o=(y*128+x)*4;let r=0,g=0,b=0,a=0;if(distance<=.35){const t=distance/.35;r=255;g=Math.trunc(255+(210-255)*t);b=Math.trunc(255+(63-255)*t);a=255}else if(distance<1){const t=(distance-.35)/.65;r=255;g=Math.trunc(210+(100-210)*t);b=Math.trunc(63+(40-63)*t);a=Math.trunc(255*(1-t)+.5)}if(a){muzzleData.data[o]=r;muzzleData.data[o+1]=g;muzzleData.data[o+2]=b}muzzleData.data[o+3]=a}
      muzzleReference.getContext('2d').putImageData(muzzleData,0,0);
      if(!HM_WASM_RENDERER.direct.createMuzzleSprite(muzzleCanvas))return{error:'direct muzzle sprite creation failed'};
      const muzzle=diff(muzzleReference,muzzleCanvas);
      const rings=[[60,50,60],[452,200,90],[256,128,75],[120,210,64],[410,80,72],[320,45,55],[240,230,48],[500,128,46],[30,120,42]],fogCanvas=document.createElement('canvas'),fogReference=document.createElement('canvas');fogReference.width=512;fogReference.height=256;
      const fogData=fogReference.getContext('2d').createImageData(512,256);
      for(const [cx,cy,r] of rings){const left=Math.max(0,Math.min(512,Math.floor(cx-r))),top=Math.max(0,Math.min(256,Math.floor(cy-r))),right=Math.max(0,Math.min(512,Math.ceil(cx+r))),bottom=Math.max(0,Math.min(256,Math.ceil(cy+r))),r2=r*r;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const dx=x+.5-cx,dy=y+.5-cy,d2=dx*dx+dy*dy;if(d2>=r2)continue;const remaining=1-sqrt(d2)/r;if(remaining<=0)continue;const sa=.55*remaining,o=(y*512+x)*4,da=fogData.data[o+3]/255;fogData.data[o]=fogData.data[o+1]=fogData.data[o+2]=255;fogData.data[o+3]=Math.floor((sa+da*(1-sa))*255+.5)}}
      fogReference.getContext('2d').putImageData(fogData,0,0);const fogBefore=HM_WASM_RENDERER.directFogSpriteCalls;
      if(!HM_WASM_RENDERER.createFogSprite(fogCanvas,rings))return{error:'direct fog sprite creation failed'};
      const fog=diff(fogReference,fogCanvas);
      const directFogPainter=HM_WASM_RENDERER.direct.createFogSprite;let fogLegacyDisabled=false;
      try{HM_WASM_RENDERER.direct.createFogSprite=null;fogLegacyDisabled=!HM_WASM_RENDERER.createFogSprite(document.createElement('canvas'),rings)}
      finally{HM_WASM_RENDERER.direct.createFogSprite=directFogPainter}
      const transportSpecs=[[73,55,0,0,73],[48,62,1,0,48],[33,51,2,5,72],[33,51,2,39,72]],transport=[];
      for(const [w,h,kind,offset,gradientWidth] of transportSpecs){const actual=document.createElement('canvas'),reference=document.createElement('canvas');reference.width=w;reference.height=h;const data=reference.getContext('2d').createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=kind===1?(y+.5)/h:(x+.5)/w;let from,to,local;if(kind===0){from=[109,109,140];to=[58,58,82];local=t}else if(kind===1){from=[44,61,82];to=[20,32,44];local=t}else{const q=(offset+x+.5)/gradientWidth;if(q<.5){from=[201,214,227];to=[143,160,180];local=q*2}else{from=[143,160,180];to=[201,214,227];local=(q-.5)*2}}const o=(y*w+x)*4;data.data[o]=Math.floor(from[0]+(to[0]-from[0])*local);data.data[o+1]=Math.floor(from[1]+(to[1]-from[1])*local);data.data[o+2]=Math.floor(from[2]+(to[2]-from[2])*local);data.data[o+3]=255}reference.getContext('2d').putImageData(data,0,0);if(!HM_WASM_RENDERER.direct.createTransportGradient(actual,w,h,kind,offset,gradientWidth))return{error:'direct transport gradient failed',kind};transport.push(diff(reference,actual))}
      const exit=[];for(const cleared of [false,true]){const w=101,h=49,actual=document.createElement('canvas'),reference=document.createElement('canvas');reference.width=w;reference.height=h;const data=reference.getContext('2d').createImageData(w,h),dx=w,dy=h,len=dx*dx+dy*dy,from=cleared?[25,240,230]:[255,46,147],to=cleared?[255,210,63]:[45,15,92],a0=cleared?.4:.2,a1=cleared?.24:.25;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=Math.max(0,Math.min(1,((x+.5)*dx+(y+.5)*dy)/len)),o=(y*w+x)*4;data.data[o]=Math.floor(from[0]+(to[0]-from[0])*t);data.data[o+1]=Math.floor(from[1]+(to[1]-from[1])*t);data.data[o+2]=Math.floor(from[2]+(to[2]-from[2])*t);data.data[o+3]=Math.floor((a0+(a1-a0)*t)*255+.5)}reference.getContext('2d').putImageData(data,0,0);if(!HM_WASM_RENDERER.direct.createExitGradient(actual,w,h,cleared))return{error:'direct exit gradient failed',cleared};exit.push(diff(reference,actual))}
      const transportCallsBefore=HM_WASM_RENDERER.directTransportGradientCalls,transportGeometryBefore=HM_WASM_RENDERER.directTransportGeometryCalls,stair=HM_WASM_RENDERER.drawTransport(document.createElement('canvas').getContext('2d'),{x:30,y:40,w:120,h:80,to:2,tipo:'escada'},1),elevator=HM_WASM_RENDERER.drawTransport(document.createElement('canvas').getContext('2d'),{x:30,y:40,w:120,h:80,to:0,tipo:'elevador'},1),exitCallsBefore=HM_WASM_RENDERER.directExitGradientCalls,exitGeometryBefore=HM_WASM_RENDERER.directExitGeometryCalls,exitDrawn=HM_WASM_RENDERER.drawExit(document.createElement('canvas').getContext('2d'),[40,50,88,44],.7,true,true);
      return{radial,radialLegacyDisabled,muzzle,fog,fogLegacyDisabled,transport,exit,radialCalls:HM_WASM_RENDERER.directRadialSpriteCalls-radialBefore,fogCalls:HM_WASM_RENDERER.directFogSpriteCalls-fogBefore,transportCalls:HM_WASM_RENDERER.directTransportGradientCalls-transportCallsBefore,transportGeometryCalls:HM_WASM_RENDERER.directTransportGeometryCalls-transportGeometryBefore,stair,elevator,exitCalls:HM_WASM_RENDERER.directExitGradientCalls-exitCallsBefore,exitGeometryCalls:HM_WASM_RENDERER.directExitGeometryCalls-exitGeometryBefore,exitDrawn,dimensions:[radialCanvas.width,radialCanvas.height,muzzleCanvas.width,muzzleCanvas.height,fogCanvas.width,fogCanvas.height]};
    })()`);
    if (result?.error || result.radial.channels !== 0 || result.radial.max !== 0 || result.muzzle.channels !== 0 || result.muzzle.max !== 0 || result.fog.channels !== 0 || result.fog.max !== 0
      || result.transport.length !== 4 || result.transport.some(item => item.channels !== 0 || item.max !== 0)
      || result.exit.length !== 2 || result.exit.some(item => item.channels !== 0 || item.max !== 0)
      || result.transportCalls !== 4 || result.transportGeometryCalls !== 2 || !result.stair || !result.elevator || result.exitCalls !== 1 || result.exitGeometryCalls !== 1 || !result.exitDrawn
      || result.radialCalls !== 1 || result.radialLegacyDisabled !== true || result.fogCalls !== 1 || result.fogLegacyDisabled !== true || result.dimensions.join(',') !== '47,47,128,128,512,256') throw Error('procedural sprite parity failed: ' + JSON.stringify(result));
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

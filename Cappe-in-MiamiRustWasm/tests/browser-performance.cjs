'use strict';

// Coleta custo de update+draw e cadência de RAF em gameplay real no Chrome.
// Node 22+ (WebSocket global) e Chrome instalado. É comparativo local, sem meta fixa de FPS.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');

const CHROME = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome');
const RUST_ROOT = process.env.CAPPE_PERF_RUST_ROOT || path.resolve(__dirname, '..');
const CPU_PROFILE = process.argv.includes('--profile');
const STRESS_ENEMIES = Math.max(0, Math.min(120, Number(process.env.CAPPE_PERF_ENEMIES) || 0));
const STRESS_SPARKS = Math.max(0, Math.min(500, Number(process.env.CAPPE_PERF_SPARKS) || 0));
const FORCE_CANVAS_SPARKS = process.env.CAPPE_PERF_FORCE_CANVAS_SPARKS === '1';
const REPO = path.resolve(__dirname, '../..');
const BUILD_FILTER = (process.env.CAPPE_PERF_BUILD || '').toLowerCase();
const BUILDS = [
  { name: 'Web', root: process.env.CAPPE_PERF_WEB_ROOT || path.join(REPO, 'Cappe-in-MiamiWeb'), wasm: false },
  { name: 'Rust/WASM', root: RUST_ROOT, wasm: true },
].filter(build => !BUILD_FILTER || build.name.toLowerCase() === BUILD_FILTER || (BUILD_FILTER === 'rust' && build.wasm));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function until(read, timeoutMs, description) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const value = await read();
    if (value) return value;
    await wait(100);
  }
  throw new Error(`Tempo esgotado aguardando ${description}.`);
}

function summary(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = p => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  return {
    count: values.length,
    meanMs: +(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3),
    p50Ms: +percentile(.5).toFixed(3),
    p90Ms: +percentile(.9).toFixed(3),
    p95Ms: +percentile(.95).toFixed(3),
  };
}

async function measure(build) {
  if (!fs.existsSync(path.join(build.root, 'index.html'))) throw new Error(`Build não encontrado: ${build.root}`);
  const { createGameServer } = require(path.join(build.root, 'server/server.js'));
  const server = createGameServer();
  const port = await freePort();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  const debugPort = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cappe-browser-perf-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--remote-allow-origins=*', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
    '--window-size=1280,900', `http://127.0.0.1:${port}/${build.wasm ? '?renderer=wasm' : ''}`,
  ], { stdio: 'ignore', windowsHide: true });

  let socket;
  try {
    const target = await until(async () => {
      try {
        const pages = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
        return pages.find(page => page.type === 'page' && page.webSocketDebuggerUrl);
      } catch { return null; }
    }, 15000, 'Chrome DevTools');

    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });

    let nextId = 0;
    const pending = new Map();
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    });
    const cdp = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = expression => cdp('Runtime.evaluate', { expression, returnByValue: true });

    await wait(1200);
    if (build.wasm) {
      await until(async () => (await evaluate('HM_WASM_RENDERER.directReady === true')).result?.value, 15000, 'o renderer direto Rust/WASM');
    }

    const startup = (await evaluate(`(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const top = [...resources].sort((a, b) => b.transferSize - a.transferSize).slice(0, 10).map(r => ({
        path: r.name.startsWith(location.origin) ? r.name.slice(location.origin.length) : r.name,
        transferBytes: r.transferSize || 0,
        decodedBytes: r.decodedBodySize || 0,
        durationMs: +r.duration.toFixed(1),
      }));
      return {
        readyState: document.readyState,
        observedReadyElapsedMs: +performance.now().toFixed(1),
        domInteractiveMs: +(nav?.domInteractive || 0).toFixed(1),
        domContentLoadedMs: +(nav?.domContentLoadedEventEnd || 0).toFixed(1),
        loadEventMs: +(nav?.loadEventEnd || 0).toFixed(1),
        resourceCount: resources.length,
        totalTransferBytes: resources.reduce((n, r) => n + (r.transferSize || 0), 0),
        totalDecodedBytes: resources.reduce((n, r) => n + (r.decodedBodySize || 0), 0),
        largestResources: top,
      };
    })()`)).result.value;

    await evaluate('CFG.fps = 60');
    await evaluate("document.getElementById('jogar').click()");
    await wait(250);
    const start = await evaluate("document.getElementById('comecar').click(); P.inv = 10000; ammo = 10000; keys.w = true; keys.d = true; mouse.x = W * .78; mouse.y = H * .5; mouse.down = true; window.__perf = { work: [], gaps: [] }; const previous = loop; let sampledDraw = lastDraw; window.loop = function(t) { window.__perfKeepSparks?.(); const before = performance.now(), priorDraw = lastDraw; previous(t); if (st === 'play' && lastDraw !== priorDraw) { __perf.work.push(performance.now() - before); __perf.gaps.push(lastDraw - (sampledDraw || lastDraw)); sampledDraw = lastDraw; } }; st");
    if (start.exceptionDetails) throw new Error(start.exceptionDetails.text);
    if (FORCE_CANVAS_SPARKS) await evaluate('if (window.HM_WASM_RENDERER) window.HM_WASM_RENDERER.drawSparks = null');

    if (STRESS_ENEMIES) {
      await evaluate(`mouse.down = false; for (let i = 0; i < ${STRESS_ENEMIES}; i++) { const a = i * 2.399963229728653, r = 100 + (i % 8) * 38, e = EXP.spawnEnemy(P.x + Math.cos(a) * r, P.y + Math.sin(a) * r, i % 3 ? 'gun' : 'bat', null, true); e.state = 'CHASE'; e.lkp = { x: P.x, y: P.y }; }`);
    }
    if (STRESS_SPARKS) {
      await evaluate(`CFG.particles = 'alta'; window.__perfSparkColors = ['#fff','#ffd23f','#19f0e6','#ff2e93']; window.__perfKeepSparks = () => { for (let i = 0; i < ${STRESS_SPARKS}; i++) { let p = sparks[i]; if (!p) p = sparks[i] = {x:0,y:0,vx:0,vy:0,life:1,max:.95,c:window.__perfSparkColors[i % window.__perfSparkColors.length]}; p.x = P.x + (i % 25) * 12 - 140; p.y = P.y + (Math.floor(i / 25) % 20) * 12 - 115; p.life = p.max * (.18 + (i % 80) / 100); p.c = window.__perfSparkColors[i % window.__perfSparkColors.length]; } }; window.__perfKeepSparks();`);
    }

    const initialCanvas = (await evaluate('[c.width, c.height]')).result.value;
    await wait(250);
    if (CPU_PROFILE) {
      await cdp('Profiler.enable');
      await cdp('Profiler.setSamplingInterval', { interval: 1000 });
      await cdp('Profiler.start');
    }
    await until(async () => (await evaluate('__perf.work.length >= 180')).result?.value, 45000, '180 quadros de gameplay');
    const sample = (await evaluate('({work: __perf.work.slice(0, 180), gaps: __perf.gaps.slice(0, 180), tier: EXP.perfTier, state: st, canvas: [c.width, c.height], renderer: window.HM_WASM_RENDERER?.status || "Canvas"})')).result.value;
    if (sample.state !== 'play') throw new Error(`A amostra terminou fora do gameplay (${sample.state}).`);
    if (build.wasm && sample.renderer !== 'ready') throw new Error(`Renderer WASM não ficou ativo (${sample.renderer}).`);
    let cpuHotspots, cpuCallers;
    if (CPU_PROFILE) {
      const { profile } = await cdp('Profiler.stop');
      const parentById = new Map();
      for (const parent of profile.nodes) for (const child of parent.children || []) parentById.set(child, parent);
      const selfMs = new Map();
      for (let i = 0; i < profile.samples.length; i++) {
        const id = profile.samples[i], deltaMs = (profile.timeDeltas?.[i] || 1000) / 1000;
        selfMs.set(id, (selfMs.get(id) || 0) + deltaMs);
      }
      cpuHotspots = profile.nodes
        .filter(node => selfMs.has(node.id))
        .map(node => ({
          function: node.callFrame.functionName || '(anonymous)',
          url: node.callFrame.url,
          line: node.callFrame.lineNumber + 1,
          selfMs: +selfMs.get(node.id).toFixed(1),
        }))
        .sort((a, b) => b.selfMs - a.selfMs)
        .slice(0, 12);
      const pairs = new Map();
      for (const node of profile.nodes) {
        if (!selfMs.has(node.id)) continue;
        const parent = parentById.get(node.id);
        const callee = node.callFrame.functionName || '(anonymous)';
        const caller = parent?.callFrame.functionName || '(root)';
        const key = `${callee} ← ${caller}`;
        const item = pairs.get(key) || { call: key, selfMs: 0, url: parent?.callFrame.url || '', line: (parent?.callFrame.lineNumber ?? -1) + 1 };
        item.selfMs += selfMs.get(node.id);
        pairs.set(key, item);
      }
      cpuCallers = [...pairs.values()].sort((a, b) => b.selfMs - a.selfMs).slice(0, 16);
    }
    return {
      build: build.name,
      renderer: sample.renderer,
      stressEnemies: STRESS_ENEMIES,
      stressSparks: STRESS_SPARKS,
      startup,
      governorTier: sample.tier,
      initialCanvas,
      finalCanvas: sample.canvas,
      ...(cpuHotspots ? { cpuHotspots } : {}),
      ...(cpuCallers ? { cpuCallers } : {}),
      beforeAdaptation: { work: summary(sample.work.slice(0, 120)), rafGap: summary(sample.gaps.slice(0, 120)) },
      afterAdaptation: { work: summary(sample.work.slice(120)), rafGap: summary(sample.gaps.slice(120)) },
    };
  } finally {
    try { socket?.close(); } catch {}
    chrome.kill();
    await new Promise(resolve => chrome.once('exit', resolve));
    await new Promise(resolve => server.close(resolve));
    const tempRoot = path.resolve(os.tmpdir());
    const resolvedProfile = path.resolve(profile);
    if (path.basename(resolvedProfile).startsWith('cappe-browser-perf-') && resolvedProfile.startsWith(tempRoot)) {
      try { fs.rmSync(resolvedProfile, { recursive: true, force: true, maxRetries: 12, retryDelay: 200 }); } catch {}
    }
  }
}

(async () => {
  if (typeof WebSocket === 'undefined') throw new Error('Este medidor requer Node.js 22 ou superior.');
  if (!BUILDS.length) throw new Error('CAPPE_PERF_BUILD deve ser Web ou Rust.');
  const results = [];
  for (const build of BUILDS) results.push(await measure(build));
  console.log(JSON.stringify({ chrome: CHROME, note: 'Tempo local de update+draw e intervalo RAF; resultados dependem do PC, navegador e carga.', results }, null, 2));
})().catch(error => { console.error(error.stack || String(error)); process.exitCode = 1; });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function main() {
  const script = fs.readFileSync(path.join(__dirname, '..', 'js', 'wasm-renderer.js'), 'utf8');
  const wasm = fs.readFileSync(path.join(__dirname, '..', 'wasm-renderer', 'pkg', 'renderer.wasm'));
  class CanvasGradient { constructor() { this.stops = []; } addColorStop(at, color) { this.stops.push([at, color]); } }
  class CanvasPattern { setTransform(transform) { this.transform = transform; } }
  class Path2D { rect(...args) { this.lastRect = args; } }
  class CanvasRenderingContext2D {
    constructor() { this.calls = []; }
    fillRect(...args) { this.calls.push(['fillRect', ...args]); return 'fill-result'; }
    clearRect(...args) { this.calls.push(['clearRect', ...args]); }
    createLinearGradient(...args) { this.calls.push(['createLinearGradient', ...args]); return new CanvasGradient(); }
    createRadialGradient(...args) { this.calls.push(['createRadialGradient', ...args]); return new CanvasGradient(); }
    save() { this.calls.push(['save']); }
    beginPath() { this.calls.push(['beginPath']); }
    rect(...args) { this.calls.push(['rect', ...args]); }
    clip() { this.calls.push(['clip']); }
    restore() { this.calls.push(['restore']); }
    strokeRect(...args) { this.calls.push(['strokeRect', ...args]); }
    moveTo(...args) { this.calls.push(['moveTo', ...args]); }
    lineTo(...args) { this.calls.push(['lineTo', ...args]); }
    closePath() { this.calls.push(['closePath']); }
    stroke() { this.calls.push(['stroke']); }
    arc(...args) { this.calls.push(['arc', ...args]); }
    ellipse(...args) { this.calls.push(['ellipse', ...args]); }
    fill() { this.calls.push(['fill']); }
    fillText(...args) { this.calls.push(['fillText', ...args]); }
    strokeText(...args) { this.calls.push(['strokeText', ...args]); }
    translate(...args) { this.calls.push(['translate', ...args]); }
    scale(...args) { this.calls.push(['scale', ...args]); }
    rotate(...args) { this.calls.push(['rotate', ...args]); }
    setTransform(...args) { this.calls.push(['setTransform', ...args]); }
    setLineDash(...args) { this.calls.push(['setLineDash', ...args]); }
    drawImage(...args) { this.calls.push(['drawImage', ...args]); }
    createPattern(...args) { this.calls.push(['createPattern', ...args]); return new CanvasPattern(); }
    createImageData(width, height) { this.calls.push(['createImageData', width, height]); return { width, height, data: new Uint8ClampedArray(width * height * 4) }; }
    putImageData(image, x, y) { this.calls.push(['putImageData', x, y, image.data.slice()]); }
    getImageData(x, y, width, height) { this.calls.push(['getImageData', x, y, width, height]); return { width, height, data: new Uint8ClampedArray(width * height * 4) }; }
  }
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
    configurable: true,
    get() { return this._fillStyle; },
    set(value) { this._fillStyle = value; }
  });

  const badgeHost = { children: [], appendChild(child) { this.children.push(child); } };
  const sandbox = {
    URL, URLSearchParams, WebAssembly, Map, Object, console,
    location: { search: '?renderer=wasm&wasmDiagnostics=1', href: 'http://localhost/index.html?renderer=wasm&wasmDiagnostics=1' },
    document: {
      currentScript: { src: 'http://localhost/js/wasm-renderer.js' },
      body: badgeHost,
      createElement(tag) {
        if (tag === 'canvas') return { width: 0, height: 0, context: new CanvasRenderingContext2D(), getContext() { return this.context; } };
        return { style: {}, textContent: '', id: '', setAttribute(name, value) { this[name] = value; } };
      }
    },
    CanvasRenderingContext2D, CanvasGradient, CanvasPattern, Path2D,
    EXP: { CLS: {
      blindado: { col: '#aabbcc' }, lider: { col: '#bb66ff' }, atirador: { col: '#ff2e5b' }, boss: { col: '#ff2e93' }
    } },
    draw_floor_rect() {},
    fetch: async () => ({ ok: true, arrayBuffer: async () => wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength) }),
    setInterval() { return 1; }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(script, sandbox, { filename: 'wasm-renderer.js' });
  for (let attempt = 0; attempt < 500 && sandbox.HM_WASM_RENDERER.status === 'loading'; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  assert.equal(sandbox.HM_WASM_RENDERER.status, 'ready');
  const diagnosticContext = new CanvasRenderingContext2D();
  assert.equal(diagnosticContext.fillRect(1, 2, 3, 4), 'fill-result');
  assert.equal(sandbox.HM_WASM_RENDERER.canvasOperationCounts.fillRect, 1);
  assert.match(sandbox.HM_WASM_RENDERER.canvasOperationSamples.fillRect, /fillRect/);
  const backgroundContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameBackground(backgroundContext, 960, 600), true);
  assert.deepEqual(backgroundContext.calls, [['fillRect', -20, -20, 1000, 640]]);
  assert.equal(backgroundContext.fillStyle, '#0d0320');
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameBackground(backgroundContext, NaN, 600), false);
  assert.equal(backgroundContext.calls.length, 1, 'invalid background dimensions select the original painter');

  const rootCanvas = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.setupCanvas(rootCanvas, 1.25, true, 2), true);
  assert.deepEqual(rootCanvas.calls, [['setTransform', 1.25, 0, 0, 1.25, 0, 0]]);
  assert.equal(rootCanvas.imageSmoothingEnabled, true);
  assert.equal(rootCanvas.imageSmoothingQuality, 'high');
  const rootSetupCallCount = rootCanvas.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.setupCanvas(rootCanvas, 1.25, true, 2), true, 'unchanged root Canvas state uses the cached Rust setup');
  assert.equal(rootCanvas.calls.length, rootSetupCallCount, 'cached root setup does not repeat Canvas operations');
  assert.equal(sandbox.HM_WASM_RENDERER.setupCanvas(rootCanvas, 1.25, false, 0, true), true, 'forced setup reapplies state after canvas resize');
  assert.deepEqual(rootCanvas.calls.slice(1), [['setTransform', 1.25, 0, 0, 1.25, 0, 0]]);
  assert.equal(rootCanvas.imageSmoothingEnabled, false);
  assert.equal(rootCanvas.imageSmoothingQuality, 'low');
  assert.equal(sandbox.HM_WASM_RENDERER.setupCanvas(rootCanvas, 0, true, 2), false, 'invalid root setup selects its host fallback');

  const enemyDrawOrder = [];
  const enemies = [
    { id: 0, x: 0, y: 0, dstun: 1, state: 'SUSPICIOUS' },
    { id: 1, x: 899, y: 699, ko: 1 },
    { id: 2, x: 900, y: 0 },
    { id: 3, x: -899, y: -699, state: 'CHASE' }
  ];
  const painters = {
    body: (enemy, alpha) => enemyDrawOrder.push(['body', enemy.id, alpha]),
    stun: enemy => enemyDrawOrder.push(['stun', enemy.id]),
    label: (enemy, label) => enemyDrawOrder.push(['label', enemy.id, label])
  };
  assert.equal(sandbox.HM_WASM_RENDERER.drawEnemies(enemies, { x: 0, y: 0 }, painters), true);
  assert.deepEqual(enemyDrawOrder, [
    ['body', 0, 1], ['stun', 0], ['label', 0, 2],
    ['body', 1, 0.55], ['label', 1, 1],
    ['body', 3, 1], ['label', 3, 3]
  ]);
  assert.ok(sandbox.HM_WASM_RENDERER.stunEffects > 0);
  assert.equal(sandbox.HM_WASM_RENDERER.visibleEnemyCount, 3);
  const enemyActorOrder = [], enemyShadowAlphas = [], enemyStunRadii = [];
  const enemyShadowContext = new CanvasRenderingContext2D();
  const originalEnemyEllipse = enemyShadowContext.ellipse.bind(enemyShadowContext);
  enemyShadowContext.ellipse = (...args) => {
    if (args[2] === 12 && args[3] === 10) { enemyShadowAlphas.push(enemyShadowContext.globalAlpha); enemyActorOrder.push(['shadow', ...args]); }
    return originalEnemyEllipse(...args);
  };
  const originalEnemyArc = enemyShadowContext.arc.bind(enemyShadowContext);
  enemyShadowContext.arc = (...args) => {
    if (args[2] === 5 || args[2] === 2.5) {
      enemyStunRadii.push([args[2], enemyShadowContext.globalAlpha]);
      enemyActorOrder.push(['stun-geometry', args[2]]);
    }
    return originalEnemyArc(...args);
  };
  const originalEnemyFillRect = enemyShadowContext.fillRect.bind(enemyShadowContext);
  enemyShadowContext.fillRect = (...args) => { if (args[0] === 4 && args[1] === -3 && args[2] === 22 && args[3] === 6) enemyActorOrder.push(['body-geometry']); return originalEnemyFillRect(...args); };
  const enemyPainters = {
    body: (enemy, alpha, shadowHandledByWasm) => enemyActorOrder.push(['body', enemy.id, alpha, shadowHandledByWasm]),
    stun: (enemy, geometryHandledByWasm, textHandledByWasm) => { if (!textHandledByWasm) enemyActorOrder.push(['stun', enemy.id, geometryHandledByWasm]); },
    label: (enemy, label) => enemyActorOrder.push(['label', enemy.id, label]),
    text: (enemy, label, x, y) => enemyActorOrder.push(['text', enemy.id, label, x, y])
  };
  assert.equal(sandbox.HM_WASM_RENDERER.drawEnemies(enemies, { x: 0, y: 0 }, enemyPainters, enemyShadowContext), true);
  assert.deepEqual(enemyActorOrder.filter(event => event[0] === 'shadow'), [
    ['shadow', 3, 5, 12, 10, 0, 0, 6.28],
    ['shadow', 902, 704, 12, 10, 0, 0, 6.28],
    ['shadow', -896, -694, 12, 10, 0, 0, 6.28]
  ]);
  assert.deepEqual(enemyShadowAlphas, [1, 0.55, 1], 'knockout alpha applies to its Rust-generated ground shadow');
  assert.deepEqual(enemyStunRadii.map(([radius]) => radius), [5, 2.5, 5, 2.5, 5, 2.5], 'Rust body buffer executes all six stun orbs');
  assert.deepEqual(enemyStunRadii.filter(([radius]) => radius === 5).map(([, alpha]) => alpha), [0.3, 0.3, 0.3]);
  assert.deepEqual(enemyActorOrder.filter(event => event[0] === 'text'), [
    ['text', 0, 4, 0, -34], ['text', 0, 2, 0, -24], ['text', 1, 1, 899, 675], ['text', 3, 3, -899, -723]
  ], 'Rust emits stun and state labels at their original positions; the host maps them to cached text');
  assert.equal(sandbox.HM_WASM_RENDERER.enemyTextCommands, 4, 'host executes the four Rust-authored enemy label commands');
  assert.deepEqual(enemyActorOrder.filter(event => event[0] === 'body-geometry'), [
    ['body-geometry'], ['body-geometry'], ['body-geometry']
  ], 'Rust body batches replace the JavaScript painter for visible enemies');
  const actorLayerOrder = enemyActorOrder.filter(event => ['shadow', 'body-geometry', 'text', 'stun', 'label'].includes(event[0])).map(event => event[0]);
  assert.deepEqual(actorLayerOrder, ['shadow','body-geometry','text','text','shadow','body-geometry','text','shadow','body-geometry','text']);
  assert.equal(sandbox.HM_WASM_RENDERER.enemyShadowCommands, 3);
  assert.ok(sandbox.HM_WASM_RENDERER.enemyBodyCommands > 0);

  const enemySheetContext = new CanvasRenderingContext2D(), enemySheetFallbacks = [], enemySheetTextFallbacks = [];
  const enemySheet = { complete: true, naturalWidth: 96 };
  assert.equal(sandbox.HM_WASM_RENDERER.drawEnemies([
    { id: 'sheet', x: 20, y: 30, a: 0.25, type: 'gun', alert: true, stun: false, state: 'ALERT' }
  ], { x: 0, y: 0 }, { body: enemy => enemySheetFallbacks.push(enemy.id), stun() {}, label: (enemy, label) => enemySheetTextFallbacks.push([enemy.id, label]) }, enemySheetContext, enemySheet, 220), true);
  assert.ok(enemySheetContext.calls.some(call => call[0] === 'drawImage' && call[1] === enemySheet && call.slice(2).join(',') === '48,24,24,24,-11.5,-11.5,24,24'), 'Rust selects and hosts the animated enemy spritesheet crop');
  assert.deepEqual(enemySheetFallbacks, [], 'spritesheet actor is rendered by the Rust command batch');
  assert.deepEqual(enemySheetTextFallbacks, [['sheet', 3]], 'status labels retain the JavaScript fallback when no Rust text painter is supplied');

  const ctx = new CanvasRenderingContext2D();
  ctx.fillStyle = '#19f0e6';
  assert.equal(ctx.fillRect(2, 3, 4, 5), 'fill-result');
  assert.deepEqual(ctx.calls, [['fillRect', 2, 3, 4, 5]]);
  assert.equal(ctx.fillStyle, '#19f0e6');

  let randomSeed = 37;
  const random = { getState: () => randomSeed, setState: value => { randomSeed = value >>> 0; } };
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloor(ctx, { k: 'b', c: ['brick-a', 'brick-b', 'brick-c', 'brick-d'], m: 'mortar' }, 4, 5, 25, 18, random), true);
  assert.deepEqual(ctx.calls.at(-1), ['restore']);
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 4 && call[2] === 5 && call[3] === 25 && call[4] === 18));
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 5 && call[2] === 6 && call[3] === 26 && call[4] === 8));
  assert.ok(randomSeed !== 37, 'Rust floor painter should return the advanced deterministic RNG state');
  assert.ok(ctx.calls.some(call => call[0] === 'clip'), 'brick painter should clip its pattern to the floor rectangle');
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call.at(-1) === 1), 'floor host callback should receive Rust-generated tile geometry');
  const finishContext = new CanvasRenderingContext2D(), grainCalls = [], floorFill = finishContext.fillRect.bind(finishContext);
  finishContext.fillRect = (...args) => { grainCalls.push([finishContext.fillStyle, ...args]); return floorFill(...args); };
  let grainSeed = 12345;
  const grainRandom = { getState: () => grainSeed, setState: value => { grainSeed = value >>> 0; } };
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorGrain(finishContext, 20, 20, grainRandom), true);
  assert.equal(grainCalls.length, 0, 'the Rust floor pixel batch no longer dispatches one Canvas rectangle per grain speck');
  const grainImageCalls = finishContext.calls.filter(call => call[0] === 'putImageData');
  assert.equal(grainImageCalls.length, 1, 'Rust uploads one complete grain layer to the host canvas');
  const grainAlphas = grainImageCalls[0][3].filter((alpha, index) => index % 4 === 3 && alpha > 0);
  assert.ok(grainAlphas.length > 0 && grainAlphas.every(alpha => alpha === 15 || alpha === 23), 'Rust uploads the two original semitransparent grain colors');
  assert.ok(grainSeed !== 12345, 'Rust floor-grain pass returns the advanced deterministic seed');
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorFinish(finishContext, [[1, 2, 3, 4]], 49, 25), false, 'floor raster fallback rejects dimensions that differ from its cached image');
  const finishStart = finishContext.calls.length, floorFinishCommandsBefore = sandbox.HM_WASM_RENDERER.floorFinishCommands;
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorFinish(finishContext, [[1, 2, 3, 4]], 20, 20), true);
  const floorFinishCalls = finishContext.calls.slice(finishStart);
  assert.deepEqual(floorFinishCalls.filter(call => call[0] === 'fillRect'), [], 'Rust rasterizes floor shadows and grout without Canvas rectangles');
  assert.equal(floorFinishCalls.filter(call => call[0] === 'putImageData').length, 1, 'Rust uploads the complete grain, FTILES, shadow, and grout layer once more');
  assert.equal(sandbox.HM_WASM_RENDERER.floorFinishCommands - floorFinishCommandsBefore, 3, 'Rust records one shadow and two grout strips');
  const fallbackTileContext = new CanvasRenderingContext2D(); let fallbackSeed = 7;
  const fallbackRandom = { getState: () => fallbackSeed, setState: value => { fallbackSeed = value >>> 0; } };
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorGrain(fallbackTileContext, 20, 20, fallbackRandom), true);
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorTiles(fallbackTileContext, [{ x: 1, y: 1, w: 10, h: 10 }], 0, { complete: true, naturalWidth: 10, naturalHeight: 10 }), false);
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorFinish(fallbackTileContext, [], 20, 20), false, 'Canvas FTILES fallback invalidates the stale Rust floor layer so shadows cannot overwrite it');
  const floorTextureContext = new CanvasRenderingContext2D();
  const floorTextureImage = { complete: true, naturalWidth: 72, naturalHeight: 24 };
  const floorTextureRooms = [{ x: 2, y: 3, w: 20, h: 30 }, { x: 50, y: 60, w: 40, h: 50 }, { x: 100, y: 120, w: 40, h: 50 }];
  floorTextureRooms.hall = floorTextureRooms[1];
  let floorTextureSeed = 91;
  const floorTextureRandom = { getState: () => floorTextureSeed, setState: value => { floorTextureSeed = value >>> 0; } };
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorGrain(floorTextureContext, 144, 180, floorTextureRandom), true);
  const floorTilesRendered = sandbox.HM_WASM_RENDERER.paintFloorTiles(floorTextureContext, floorTextureRooms, 2, floorTextureImage);
  if (typeof WebAssembly.Module.exports === 'function') {
    const moduleExports = WebAssembly.Module.exports(new WebAssembly.Module(wasm));
    if (moduleExports.some(item => item.name === 'paint_floor_tiles')) {
      assert.equal(floorTilesRendered, true);
      assert.equal(floorTextureContext.calls.filter(call => call[0] === 'fillRect').length, 0, 'Rust composes floor textures into RGBA without per-room Canvas fills');
      assert.equal(sandbox.HM_WASM_RENDERER.floorTextureCommands, 2);
      assert.equal(floorTextureContext.calls.filter(call => call[0] === 'createPattern').length, 0, 'WASM floor texture path no longer creates a CanvasPattern');
      assert.equal(floorTextureContext.calls.filter(call => call[0] === 'putImageData').length, 2, 'Rust uploads grain then the grain-plus-texture composite');
    } else {
      assert.equal(floorTilesRendered, false, 'v74 WASM keeps using the JavaScript FTILES fallback');
    }
  }
  const mapSeed = randomSeed;
  const mapRandom = { getState: () => mapSeed, setState: value => { randomSeed = value >>> 0; } };
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapDetails(ctx, [{ x: 0, y: 0, w: 100, h: 100 }], 320, 240, mapRandom), true);
  assert.ok(ctx.calls.some(call => call[0] === 'strokeRect' && call[1] === 9 && call[2] === 9 && call[3] === 82 && call[4] === 82));
  assert.ok(ctx.calls.some(call => call[0] === 'lineTo' && call[1] === 58 && call[2] === 22));
  assert.ok(sandbox.HM_WASM_RENDERER.mapCommands >= 2);
  assert.ok(randomSeed !== mapSeed, 'Rust map detail pass should advance and return the deterministic speck seed');
  const baseStart = ctx.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapBase(ctx, true, 120, 80), true);
  assert.ok(ctx.calls.slice(baseStart).some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === 0 && call[3] === 120 && call[4] === 80));
  assert.equal(ctx.fillStyle, '#07010f');
  const overlayStart = ctx.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapOverlay(ctx, 120, 80), true);
  assert.ok(ctx.calls.slice(overlayStart).some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === 0 && call[3] === 120 && call[4] === 80));
  assert.equal(ctx.fillStyle, 'rgba(255,240,230,.08)');
  const decorFills = [], decorStrokes = [];
  const originalDecorFill = ctx.fillRect.bind(ctx), originalDecorStroke = ctx.strokeRect.bind(ctx);
  ctx.fillRect = (...args) => { decorFills.push([ctx.fillStyle, ...args]); return originalDecorFill(...args); };
  ctx.strokeRect = (...args) => { decorStrokes.push([ctx.strokeStyle, ctx.lineWidth, ...args]); return originalDecorStroke(...args); };
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapDecor(ctx, [
    { kind: 'tapete', x: 10, y: 20, w: 30, h: 40 }, { kind: 'caixa', x: 50, y: 60, w: 8, h: 9, c: '#bd8838' }
  ]), true);
  assert.deepEqual(decorFills, [['#20a9b0', 10, 20, 30, 40], ['#bd8838', 50, 60, 8, 9]]);
  assert.deepEqual(decorStrokes, [['#0e6a70', 2, 11, 21, 28, 38], ['rgba(255,255,255,.35)', 1, 18, 28, 14, 24]]);
  assert.equal(sandbox.HM_WASM_RENDERER.mapDecorCommands, 4);
  const breakableStart = ctx.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawBreakables(ctx, [{ x: 10, y: 20, w: 30, h: 40, broken: false }], [{ x: 50, y: 60, w: 8, h: 10, t: 0.5 }]), true);
  const breakableCalls = ctx.calls.slice(breakableStart);
  assert.ok(breakableCalls.some(call => call[0] === 'fillRect' && call[1] === 10 && call[2] === 20 && call[3] === 30 && call[4] === 40));
  assert.ok(breakableCalls.some(call => call[0] === 'strokeRect' && call[1] === 11 && call[2] === 21 && call[3] === 28 && call[4] === 38));
  assert.ok(breakableCalls.some(call => call[0] === 'moveTo' && call[1] === 16 && call[2] === 54));
  assert.ok(breakableCalls.some(call => call[0] === 'moveTo' && call[1] === 53.36 && call[2] === 56.2));
  assert.equal(sandbox.HM_WASM_RENDERER.breakableCommands, 4);
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapShadows(ctx, [[1, 2, 3, 4]], [{ x: 5, y: 6, w: 7, h: 8 }]), true);
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 7 && call[2] === 10 && call[3] === 3 && call[4] === 4));
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 9 && call[2] === 12 && call[3] === 7 && call[4] === 8));
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapStructure(ctx, [[1, 2, 30, 40]], [[10, 20]]), true);
  assert.ok(ctx.calls.some(call => call[0] === 'strokeRect' && call[1] === 1.5 && call[2] === 2.5 && call[3] === 29 && call[4] === 39));
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === 10 && call[3] === 20 && call[4] === 20));
  const textureContext = new CanvasRenderingContext2D();
  const wallFace = { name: 'wall-face' }, furnitureFaces = Array.from({ length: 6 }, (_, index) => ({ name: `furniture-${index}` })), doorOpen = { name: 'open-door' };
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapTextures(textureContext,
    [[0, 0, 24, 80], [40, 20, 80, 40]], [[10, 20, 130, 20], [0, 0, 40, 100], [0, 0, 200, 200]],
    { wallFace, furnitureFaces, doorOpen }, 40), true);
  assert.ok(textureContext.calls.some(call => call[0] === 'createPattern' && call[1] === wallFace && call[2] === 'repeat'));
  assert.ok(textureContext.calls.some(call => call[0] === 'createPattern' && call[1] === furnitureFaces[1] && call[2] === 'repeat'));
  assert.ok(textureContext.calls.some(call => call[0] === 'fillRect' && call[1] === 40 && call[2] === 20 && call[3] === 80 && call[4] === 40));
  assert.deepEqual(textureContext.calls.filter(call => call[0] === 'drawImage'), [
    ['drawImage', doorOpen, -10, -20, 20, 40], ['drawImage', doorOpen, -20, -20, 40, 40]
  ], 'host applies Rust-selected door image geometry and orientation');
  assert.equal(sandbox.HM_WASM_RENDERER.mapTextureCommands, 4);
  const mapTextureRgbaContext = new CanvasRenderingContext2D(); mapTextureRgbaContext.canvas = { width: 80, height: 100 };
  const mapTextureSprite = (color) => ({
    width: 24, height: 24,
    getContext() { return { getImageData() { const data = new Uint8ClampedArray(24 * 24 * 4); for (let i = 0; i < 24 * 24; i++) data.set([...color, 255], i * 4); return { data }; } }; }
  });
  const mapTextureRgbaAssets = { wallFace: mapTextureSprite([20, 30, 40]), furnitureFaces: Array.from({ length: 6 }, (_, index) => mapTextureSprite([index, index + 1, index + 2])), doorOpen: mapTextureSprite([200, 100, 50]) };
  const mapTextureCommandsBeforeRgba = sandbox.HM_WASM_RENDERER.mapTextureCommands, mapTextureRgbaStart = mapTextureRgbaContext.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.paintMapTextures(mapTextureRgbaContext,
    [[0, 0, 24, 60], [40, 20, 40, 40]], [[10, 20, 130, 20], [0, 0, 40, 100], [0, 0, 200, 200]], mapTextureRgbaAssets, 24), true);
  const mapTextureRgbaCalls = mapTextureRgbaContext.calls.slice(mapTextureRgbaStart);
  assert.equal(mapTextureRgbaCalls.filter(call => call[0] === 'putImageData').length, 1, 'Rust uploads the complete map texture layer once');
  assert.deepEqual(mapTextureRgbaCalls.filter(call => ['createPattern', 'fillRect', 'drawImage', 'save', 'clip'].includes(call[0])), [], 'map texture sprites no longer use per-surface Canvas pattern or door draws');
  assert.equal(sandbox.HM_WASM_RENDERER.mapTextureCommands - mapTextureCommandsBeforeRgba, 4);
  const furnitureStart = ctx.calls.length;
  const furniture = ['bed','banco','mesa','balcao','vaso','pia','banheira','planta','sofa','mesaR','felt','arcade','sinuca','poltrona','palco','poco','caixa']
    .map((kind, i) => ({ kind, x: 10 + i * 2, y: 20, w: 80, h: 40, c: i % 3 }));
  assert.equal(sandbox.HM_WASM_RENDERER.drawFurniture(ctx, furniture), true);
  const furnitureCalls = ctx.calls.slice(furnitureStart);
  assert.ok(furnitureCalls.length > 100);
  assert.equal(furnitureCalls.filter(call => call[0] === 'save').length, 17);
  assert.equal(furnitureCalls.filter(call => call[0] === 'restore').length, 17);
  assert.ok(furnitureCalls.some(call => call[0] === 'arc'));
  assert.ok(furnitureCalls.some(call => call[0] === 'ellipse'));

  const barrelContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldBarrels(barrelContext,
    [{ x: 10, y: 20, r: 12, t: -1 }, { x: 30, y: 40, r: 10, t: 0.1 }], 70), true);
  assert.equal(barrelContext.calls.filter(call => call[0] === 'save').length, 2);
  assert.equal(barrelContext.calls.filter(call => call[0] === 'restore').length, 2);
  assert.deepEqual(barrelContext.calls.filter(call => call[0] === 'translate'), [['translate', 10, 20], ['translate', 30, 40]]);
  assert.equal(barrelContext.calls.filter(call => call[0] === 'arc').length, 4);
  assert.equal(barrelContext.calls.filter(call => call[0] === 'fillRect').length, 4);
  assert.equal(sandbox.HM_WASM_RENDERER.worldBarrelCommands, 2);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldBarrels(barrelContext, [{ x: 0, y: 0, r: NaN, t: 0 }], 70), false,
    'invalid barrel data selects the JavaScript fallback');

  const cameraContext = new CanvasRenderingContext2D();
  const cameraPoly = Float32Array.from({ length: 26 }, (_, index) => index + 20);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldCameras(cameraContext, [
    { x: 10, y: 15, a: 0.4, hot: 0, poly: cameraPoly },
    { x: 35, y: 45, a: -0.2, hot: 1, poly: cameraPoly }
  ], false), true);
  assert.equal(cameraContext.calls.filter(call => call[0] === 'save').length, 2);
  assert.equal(cameraContext.calls.filter(call => call[0] === 'restore').length, 2);
  assert.equal(cameraContext.calls.filter(call => call[0] === 'closePath').length, 2);
  assert.equal(cameraContext.calls.filter(call => call[0] === 'fillRect').length, 2);
  assert.equal(cameraContext.calls.filter(call => call[0] === 'strokeRect').length, 2);
  assert.equal(cameraContext.calls.filter(call => call[0] === 'arc').length, 2);
  assert.deepEqual(cameraContext.calls.filter(call => call[0] === 'translate'), [['translate', 10, 15], ['translate', 35, 45]]);
  assert.equal(sandbox.HM_WASM_RENDERER.worldCameraCommands, 2);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldCameras(cameraContext,
    [{ x: 1, y: 2, a: 0, hot: 0, poly: [1] }], false), false,
  'missing cone data selects the JavaScript fallback');

  const enemyAccentContext = new CanvasRenderingContext2D();
  const worldEnemies = [
    { cls: 'blindado', x: 10, y: 20, r: 15, hp: 3, a: 0 },
    { cls: 'lider', x: 30, y: 40, r: 12, hp: 1, a: 0 },
    { cls: 'atirador', x: 50, y: 60, r: 11, hp: 1, a: 0.5, sniper: true, tele: 0.35 },
    { cls: 'boss', x: 70, y: 80, r: 20, hp: 10, a: 0, boss: { col: '#ff2e93' }, chS: 1, chA: -0.25 }
  ];
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldEnemyAccents(enemyAccentContext, worldEnemies, 160, 0, 0, 1), true);
  assert.equal(enemyAccentContext.calls.filter(call => call[0] === 'setLineDash').length, 1);
  assert.equal(enemyAccentContext.calls.filter(call => call[0] === 'fillRect').length, 3);
  assert.equal(enemyAccentContext.calls.filter(call => call[0] === 'arc').length, 10);
  assert.equal(enemyAccentContext.calls.filter(call => call[0] === 'save').length, 7);
  assert.equal(enemyAccentContext.calls.filter(call => call[0] === 'restore').length, 7);
  assert.equal(sandbox.HM_WASM_RENDERER.worldEnemyAccentCommands, 4);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldEnemyAccents(enemyAccentContext,
    [{ cls: 'blindado', x: 0, y: 0, r: 0, hp: 1 }], 160, 0, 0), false,
  'invalid enemy geometry selects the JavaScript fallback');

  const frameTransformContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameTransforms(frameTransformContext, 0, 0.14, 10, 1, 0, 0, 0, 0, 0, 0.5, 0.5), true);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameTransforms(frameTransformContext, 1, 0, 0, 0.5, 0.5, 2, -1, 3, 0.5, 0, 1), true);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameTransforms(frameTransformContext, 2, 0, 0, 0.5, 0.5, 0, 0, 0, 0, 0.5, 0.5, 960, 600, 1.25, 120, 80), true);
  assert.deepEqual(frameTransformContext.calls.filter(call => call[0] === 'translate'), [
    ['translate', 5, -5], ['translate', 1, -0.5], ['translate', -0.75, 0.75],
    ['translate', 480, 300], ['translate', -480, -300], ['translate', -120, -80]
  ], 'screen shake, recoil, camera shake, and world camera preserve Canvas transform order');
  assert.deepEqual(frameTransformContext.calls.filter(call => call[0] === 'scale'), [['scale', 1.25, 1.25]]);
  assert.equal(sandbox.HM_WASM_RENDERER.frameTransformCommands, 9);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameTransforms(frameTransformContext, 3, 0, 0, 0.5, 0.5, 0, 0, 0, 0, 0.5, 0.5), true);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameTransforms(frameTransformContext, 4, 0, 0, 0.5, 0.5, 0, 0, 0, 0, 0.5, 0.5), true);
  assert.deepEqual(frameTransformContext.calls.filter(call => call[0] === 'save' || call[0] === 'restore').map(call => call[0]), ['save', 'save', 'restore', 'restore'],
    'Rust batch opens and closes the same two nested Canvas scopes around the transform sequence');
  assert.equal(sandbox.HM_WASM_RENDERER.frameTransformCommands, 11);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFrameTransforms(frameTransformContext, 0, 0.14, 10, 2, 0, 0, 0, 0, 0, 0.5, 0.5), false,
    'invalid random input selects JavaScript frame-transform fallback');

  const glassContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawGlass(glassContext, [{ x: 10, y: 20, w: 40, h: 50 }], [
    { on: false }, { on: true, x: 30, y: 40, rot: 1, life: 0.5, max: 1, s: 4, c: 2 }
  ], 40, 0.8), true, 'glass panes and active shards use the Rust batch');
  assert.ok(glassContext.calls.some(call => call[0] === 'fillRect') && glassContext.calls.some(call => call[0] === 'strokeRect'));
  assert.ok(glassContext.calls.some(call => call[0] === 'rotate' && call[1] === 1));
  assert.ok(glassContext.calls.some(call => call[0] === 'closePath') && glassContext.calls.some(call => call[0] === 'fill'));
  assert.equal(sandbox.HM_WASM_RENDERER.glassCommands, 2);
  const invalidGlassContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawGlass(invalidGlassContext, [{ x: 10, y: 20, w: 2, h: 50 }], [], 40, 1), false,
    'invalid glass geometry selects the JavaScript fallback');
  assert.equal(invalidGlassContext.calls.length, 0);

  const frameContext = new CanvasRenderingContext2D();
  const frameCanvas = { getContext: () => frameContext };
  const playerPalette = ['#0b0812','#1f5d5a','#123a38','#3a8c85','#eef2f5','#aab6c0','#c0263a','#7a1624','#1c1424','#e9bc92','#b98262','#14101c'];
  assert.equal(sandbox.HM_WASM_RENDERER.drawPlayerFrame(frameCanvas, 'walk', 3, 0, Math.sin(3 * 6.283 / 8), playerPalette), true);
  const playerImage = frameContext.calls.find(call => call[0] === 'putImageData');
  assert.ok(playerImage, 'WASM player pixels should be uploaded to the browser Canvas');
  assert.equal(playerImage[1], 0); assert.equal(playerImage[2], 0); assert.equal(playerImage[3].length, 24 * 24 * 4);
  assert.ok(playerImage[3].some((value, index) => index % 4 === 3 && value === 255), 'player frame should contain opaque pixel art');
  assert.equal(sandbox.HM_WASM_RENDERER.playerFrames, 1);
  const selectPlayerSprite = (...args) => Array.from(sandbox.HM_WASM_RENDERER.selectPlayerSprite(...args));
  assert.deepEqual(selectPlayerSprite('idle', 4.2, 0), [0, 0]);
  assert.deepEqual(selectPlayerSprite('walk', 3 * 6.283 / 4, 0), [3, 1]);
  assert.deepEqual(selectPlayerSprite('run', -0.1, 0), [3, 2]);
  assert.deepEqual(selectPlayerSprite('attack', 0, 0.13), [1, 3]);
  assert.deepEqual(selectPlayerSprite('attack', 0, 0.06), [2, 3]);
  assert.equal(sandbox.HM_WASM_RENDERER.selectPlayerSprite('unknown', 0, 0), null);
  const selectEnemySprite = (...args) => Array.from(sandbox.HM_WASM_RENDERER.selectEnemySprite(...args));
  assert.deepEqual(selectEnemySprite(false, 500), [0, 0]);
  assert.deepEqual(selectEnemySprite(true, 110), [1, 1]);
  assert.deepEqual(selectEnemySprite(true, 440), [0, 1]);
  const actorContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawPlayerAura(actorContext, false, true, true), true);
  assert.deepEqual(actorContext.calls.filter(call => call[0] === 'ellipse'), [
    ['ellipse', 2, 5, 13, 8, 0, 0, 6.28], ['ellipse', 0, 0, 16, 16, 0, 0, 6.28]
  ]);
  assert.equal(actorContext.fillStyle, 'rgba(25,240,230,.14)');
  assert.ok(sandbox.HM_WASM_RENDERER.playerAuraCommands >= 10);
  const p2ActorContext = new CanvasRenderingContext2D();
  sandbox.HM_WASM_RENDERER.drawPlayerAura(p2ActorContext, true, false, true);
  assert.deepEqual(p2ActorContext.calls.find(call => call[0] === 'ellipse'), ['ellipse', 1, 3, 11, 9, 0, 0, 6.28]);
  assert.equal(p2ActorContext.fillStyle, 'rgba(255,46,147,.14)');
  const fallbackPlayerContext = new CanvasRenderingContext2D();
  const fallbackPlayerFrame = { id: 'rust-player-frame' };
  assert.equal(sandbox.HM_WASM_RENDERER.drawPlayers([{
    x: 13, y: 17, angle: 0.25, animation: 1.5, attack: 0.1, state: 'walk', isP2: false,
    weapon: 'pistola', shadows: true, glow: true, skin: null, frame: fallbackPlayerFrame
  }], fallbackPlayerContext, null), true);
  assert.ok(fallbackPlayerContext.calls.some(call => call[0] === 'drawImage' && call[1] === fallbackPlayerFrame && call.slice(2).join(',') === '-11.5,-11.5'), 'Rust player commands consume the procedural fallback image from WASM');
  assert.ok(fallbackPlayerContext.calls.some(call => call[0] === 'fillText' && call[1] === 'P1' && call[2] === 0 && call[3] === -18), 'Rust player commands retain the P1 marker');
  assert.ok(fallbackPlayerContext.calls.findIndex(call => call[0] === 'ellipse') < fallbackPlayerContext.calls.findIndex(call => call[0] === 'drawImage'), 'player shadow/aura renders before its weapon and sprite');
  const sheetPlayerContext = new CanvasRenderingContext2D();
  const skinRectColors = [], originalSkinFillRect = sheetPlayerContext.fillRect.bind(sheetPlayerContext);
  sheetPlayerContext.fillRect = (...args) => {
    if ((args[0] === -4 || args[0] === 1) && args[1] === -2) skinRectColors.push([args[0], sheetPlayerContext.fillStyle]);
    return originalSkinFillRect(...args);
  };
  const playerSheet = { complete: true, naturalWidth: 96 };
  assert.equal(sandbox.HM_WASM_RENDERER.drawPlayers([{
    x: 20, y: 30, angle: -0.5, animation: 4.71225, attack: 0, state: 'walk', isP2: true,
    weapon: 'punho', shadows: false, glow: true, skin: { color: '#1caa66', detail: '#ffee88' }, frame: null
  }], sheetPlayerContext, playerSheet), true);
  assert.ok(sheetPlayerContext.calls.some(call => call[0] === 'drawImage' && call[1] === playerSheet && call.slice(2).join(',') === '72,24,24,24,-11.5,-11.5,24,24'), 'Rust chooses and hosts the P2 spritesheet crop');
  assert.deepEqual(skinRectColors, [[-4, '#1caa66'], [1, '#ffee88']], 'Rust style commands retain both cosmetic skin colors');
  assert.ok(sheetPlayerContext.calls.some(call => call[0] === 'fillText' && call[1] === 'P2'), 'Rust player commands retain the P2 marker');
  assert.ok(sandbox.HM_WASM_RENDERER.playerBodyCommands > 0, 'player command batches are counted independently from aura-only batches');
  const ghostContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawGhosts([{ x: 10, y: 20, a: 0.5 }], ghostContext, 'pistola'), true);
  assert.ok(ghostContext.calls.some(call => call[0] === 'ellipse' && call[1] === 13 && call[2] === 25 && call[3] === 12 && call[4] === 10), 'Rust ghost batch places the ground shadow before the actor');
  assert.ok(ghostContext.calls.some(call => call[0] === 'translate' && call[1] === 10 && call[2] === 20));
  assert.ok(ghostContext.calls.some(call => call[0] === 'rotate' && call[1] === 0.5));
  assert.ok(ghostContext.calls.filter(call => call[0] === 'ellipse').length >= 7, 'Rust ghost body, arms, head and highlights reach Canvas');
  assert.ok(sandbox.HM_WASM_RENDERER.ghostCommands > 0, 'ghost composition is counted independently');
  const emptyGhostContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawGhosts([], emptyGhostContext, 'punho'), true);
  assert.equal(emptyGhostContext.calls.length, 0, 'empty ghost buffer skips Rust and Canvas work');
  const weaponStart = ctx.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawWeapon(ctx, 'sniper'), true);
  const weaponCalls = ctx.calls.slice(weaponStart);
  assert.ok(weaponCalls.some(call => call[0] === 'fillRect'));
  assert.ok(weaponCalls.some(call => call[0] === 'stroke'));
  assert.ok(sandbox.HM_WASM_RENDERER.weaponCommands > 0);
  const doorStart = ctx.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawDoors(ctx, [{ x: 10, y: 20, w: 8, h: 12, th: 0.25, vert: true }], { id: 'door-texture' }), true);
  const doorCalls = ctx.calls.slice(doorStart);
  assert.ok(doorCalls.some(call => call[0] === 'translate' && call[1] === 14 && call[2] === 20));
  assert.ok(doorCalls.some(call => call[0] === 'rotate' && call[1] === 0.25));
  assert.ok(doorCalls.some(call => call[0] === 'drawImage'));
  assert.ok(sandbox.HM_WASM_RENDERER.doorCommands > 0);
  const neonDoorImage = { id: 'neon-door-frame', complete: true, naturalWidth: 32 };
  const neonDoorImage2 = { id: 'neon-door-frame-2', complete: true, naturalWidth: 48 };
  const neonDoorCommandStart = sandbox.HM_WASM_RENDERER.doorCommands;
  const neonDoorStart = ctx.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawNeonDoors(ctx, [
    { spriteKey: 'door-a', image: neonDoorImage, px: 70, py: 90, baseAngle: 0.4, swingAngle: -0.15, ox: 11, oy: 7 },
    { spriteKey: 'door-b', image: neonDoorImage2, px: 170, py: 190, baseAngle: -0.3, swingAngle: 0.5, ox: 9, oy: 12 }
  ]), true);
  const neonDoorCalls = ctx.calls.slice(neonDoorStart);
  assert.ok(neonDoorCalls.some(call => call[0] === 'translate' && call[1] === 70 && call[2] === 90));
  assert.ok(neonDoorCalls.some(call => call[0] === 'rotate' && call[1] === 0.25), 'Rust combines the closed-door angle and current swing');
  assert.ok(neonDoorCalls.some(call => call[0] === 'drawImage' && call[1] === neonDoorImage && call[2] === -11 && call[3] === -7));
  assert.ok(neonDoorCalls.some(call => call[0] === 'drawImage' && call[1] === neonDoorImage2 && call[2] === -9 && call[3] === -12), 'each sprite handle resolves to its own host image');
  assert.equal(sandbox.HM_WASM_RENDERER.doorCommands - neonDoorCommandStart, 10, 'Neon door command batches are counted');
  const fallbackDoorStart = ctx.calls.length;
  sandbox.HM_WASM_RENDERER.drawDoors(ctx, [{ x: 30, y: 40, w: 25, h: 8, th: 0, vert: false }], null);
  assert.ok(ctx.calls.slice(fallbackDoorStart).some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === -4));

  const particlesContext = new CanvasRenderingContext2D();
  const dustStart = particlesContext.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawDust(particlesContext, [{ x: 5, y: 6, r: 2 }], 0.12), true);
  assert.ok(particlesContext.calls.some(call => call[0] === 'arc' && call[1] === 5 && call[2] === 6 && call[3] === 2), 'Rust dust batch reaches the Canvas arc path');
  assert.equal(particlesContext.calls[dustStart][0], 'save', 'dust restores the Canvas state that existed before the batch');
  assert.equal(particlesContext.calls.at(-1)[0], 'restore', 'dust restores global alpha after its batch');
  assert.equal(sandbox.HM_WASM_RENDERER.drawSparks(particlesContext, [{ x: 8, y: 9, life: 0.5, max: 1, c: '#f00' }], ['#f00']), true);
  assert.ok(particlesContext.calls.some(call => call[0] === 'rect' && call[1] === 6 && call[2] === 7 && call[3] === 4 && call[4] === 4), 'Rust spark batch reaches additive Canvas rectangles');
  assert.ok(particlesContext.calls.some(call => call[0] === 'restore'), 'spark host restores Canvas state');
  assert.equal(sandbox.HM_WASM_RENDERER.drawLiveBlood(particlesContext, [{ x: 11, y: 12, r: 3, t: 0.4 }], '#900'), true);
  assert.equal(particlesContext.calls.at(-1)[0], 'fill', 'live blood keeps individual fills');
  assert.equal(sandbox.HM_WASM_RENDERER.drawStaticBlood(particlesContext, [{ x: 15, y: 16, r: 4 }], '#900'), true);
  assert.equal(particlesContext.calls.at(-1)[0], 'fill', 'cached blood is emitted as one compound fill');
  assert.equal(sandbox.HM_WASM_RENDERER.drawCorpses(particlesContext, [{ x: 20, y: 25, a: 0.5, type: 'shot' }], ['#gun', '#bat', '#shot']), true);
  assert.equal(particlesContext.calls.filter(call => call[0] === 'ellipse').length >= 2, true, 'corpse batch draws its shadow and body');
  const mineBullet = { id: 'mine-bullet' }, foeBullet = { id: 'foe-bullet' };
  assert.equal(sandbox.HM_WASM_RENDERER.drawBullets(particlesContext, [{ x: 30, y: 40, mine: true }, { x: 10, y: 20, mine: false }], mineBullet, foeBullet), true);
  assert.ok(particlesContext.calls.some(call => call[0] === 'drawImage' && call[1] === mineBullet && call[2] === 8 && call[3] === 26), 'bullet batch selects owner image and position');
  const cachedLayer = { width: 100, height: 80 };
  assert.equal(sandbox.HM_WASM_RENDERER.drawLayer(particlesContext, cachedLayer, 2, 3, 90, 70), true);
  assert.ok(particlesContext.calls.some(call => call[0] === 'drawImage' && call[1] === cachedLayer && call.slice(2).join(',') === '2,3,88,67,2,3,88,67'), 'camera layer batch preserves source and destination crop');
  assert.equal(sandbox.HM_WASM_RENDERER.drawShells(particlesContext, [{ x: 120, y: 90, r: 2 }], 20, 10), true);
  assert.ok(particlesContext.calls.some(call => call[0] === 'ellipse' && call.slice(1).join(',') === '100,80,3.2,2,0.5,0,6.283185307179586'), 'shell batch projects to screen space and preserves ellipse dimensions');
  assert.equal(sandbox.HM_WASM_RENDERER.drawDarkOutlines(particlesContext, [
    { x: 30, y: 50, dead: false, ko: 1 }, { x: 90, y: 80, dead: true, ko: 0 }
  ], 10, 20, 100, 80, 1.5), true);
  assert.ok(particlesContext.calls.some(call => call[0] === 'arc' && call[1] === 5 && call[2] === 25 && call[3] === 21), 'dark outline batch projects live actor circles and skips dead actors');
  const darkContext = new CanvasRenderingContext2D(), darkScreen = new CanvasRenderingContext2D();
  const darkOverlayImage = { id: 'dark-overlay', width: 480, height: 300 };
  const lampImages = { core: { id: 'lamp-core' }, far: { id: 'lamp-cone' }, flash: { id: 'lamp-flash' } };
  assert.equal(sandbox.HM_WASM_RENDERER.drawDarkOverlay(darkContext, darkScreen, darkOverlayImage, lampImages,
    120, 90, 20, 10, 100, 80, 1.5, 0.25, true, true), true, 'Rust dark overlay commands reach the Canvas host');
  assert.deepEqual(darkContext.calls.filter(call => ['clearRect', 'fillRect', 'drawImage'].includes(call[0])), [
    ['clearRect', 0, 0, 960, 600], ['fillRect', 0, 0, 960, 600],
    ['drawImage', lampImages.core, -100, -125, 450, 450],
    ['drawImage', lampImages.far, -370, -395, 990, 990],
    ['drawImage', lampImages.flash, -265, -290, 780, 780]
  ], 'dark mask preserves half-resolution target coordinates and projected flashlight geometry');
  assert.deepEqual(darkScreen.calls, [['drawImage', darkOverlayImage, 0, 0, 960, 600]], 'dark mask is composited once over gameplay');
  assert.equal(sandbox.HM_WASM_RENDERER.darkOverlayCommands, 1, 'dark overlay diagnostic increments only for rendered batches');
  const comboContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawComboText(comboContext, 5, 45), true, 'Rust combo text batch reaches host rasterization');
  assert.deepEqual(comboContext.calls.filter(call => ['save', 'translate', 'strokeText', 'fillText', 'restore'].includes(call[0])), [
    ['save'], ['translate', 34, 176], ['strokeText', '5X', 0, 0], ['fillText', '5X', 0, 0], ['restore']
  ], 'combo text keeps outline/fill order and transform');
  const comboScale = comboContext.calls.find(call => call[0] === 'scale');
  assert.ok(comboScale && Math.abs(comboScale[1] - (1 + Math.sin(0.5) * 0.06)) < 1e-9 && comboScale[1] === comboScale[2], 'combo text keeps its uniform pulsing scale');
  assert.equal(sandbox.HM_WASM_RENDERER.comboTextCommands, 1);
  const hudImageContext = new CanvasRenderingContext2D();
  const hudImages = [
    { id: 'vignette', width: 960, height: 600 }, { id: 'crt-vignette', width: 960, height: 600 },
    { id: 'hud-vignette', width: 960, height: 600 }, { id: 'mask-portrait', width: 56, height: 56 },
    { id: 'weather-label', width: 144, height: 24 }
  ];
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudImage(hudImageContext, 0, 960, 600, true, true, hudImages), true);
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudImage(hudImageContext, 1, 960, 600, false, true, hudImages), true);
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudImage(hudImageContext, 2, 1280, 720, false, true, hudImages, true), true);
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudImage(hudImageContext, 3, 960, 600, false, true, hudImages), true);
  assert.deepEqual(hudImageContext.calls.filter(call => call[0] === 'drawImage'), [
    ['drawImage', hudImages[1], 0, 0, 960, 600], ['drawImage', hudImages[2], 0, 0, 960, 600],
    ['drawImage', hudImages[3], 1198, 26, 56, 56], ['drawImage', hudImages[4], 32, 575, 144, 24]
  ], 'Rust selects each HUD image and preserves the original screen-space bounds');
  assert.equal(sandbox.HM_WASM_RENDERER.hudImageCommands, 4);
  assert.equal(sandbox.HM_WASM_RENDERER.weatherLabelCommands, 1);
  const alarmTextContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawAlarmText(alarmTextContext, 12.6, 960), true, 'Rust alarm text batch rasterizes on the host');
  assert.deepEqual(alarmTextContext.calls, [['fillText', 'ALARME ATIVO · 13 s', 480, 24]]);
  assert.equal(alarmTextContext.fillStyle, 'rgba(255,60,90,.9)');
  assert.equal(alarmTextContext.font, 'bold 14px Orbitron, sans-serif');
  assert.equal(alarmTextContext.textAlign, 'center');
  assert.equal(sandbox.HM_WASM_RENDERER.alarmTextCommands, 1);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFx(particlesContext, [
    { x: 4, y: 7, t: 0.05, R: 9, a: 0, muzzle: true }, { x: 10, y: 12, t: 0.2, R: 6, a: 1, muzzle: false }
  ]), true);
  const muzzleDraw = particlesContext.calls.find(call => call[0] === 'drawImage' && call[1] && call[1].width === 128 && call[2] === -5 && call[3] === -2);
  assert.ok(muzzleDraw, 'Rust ordered FX batch draws the cached muzzle sprite at the original gradient bounds');
  assert.ok(!particlesContext.calls.some(call => call[0] === 'createRadialGradient'), 'muzzle FX no longer allocates a Canvas gradient per shot');
  const impactArc = particlesContext.calls.find(call => call[0] === 'arc' && call[1] === 10 && call[2] === 12 && call[3] === 6);
  assert.ok(impactArc && Math.abs(impactArc[4] + 0.2) < 1e-12 && Math.abs(impactArc[5] - 2.2) < 1e-12, 'Rust ordered FX batch keeps the impact arc');
  const rainContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawRain(rainContext, [
    { x: 10, y: 20, l: 10 }, { x: 30, y: 40, l: 20 }, { x: 50, y: 60, l: 5 }
  ], 2), true, 'Rust rain geometry reaches the host Canvas batch');
  assert.deepEqual(rainContext.calls, [
    ['save'], ['beginPath'], ['moveTo', 10, 20], ['lineTo', 8.2, 30],
    ['moveTo', 50, 60], ['lineTo', 49.1, 65], ['stroke'], ['restore']
  ], 'rain segments preserve step selection, geometry and Canvas state');
  assert.equal(sandbox.HM_WASM_RENDERER.drawRain(rainContext, [{ x: 1, y: 2, l: -1 }]), false, 'invalid rain data falls back to the original renderer');
  const moteContext = new CanvasRenderingContext2D(), moteAlphas = [];
  Object.defineProperty(moteContext, 'globalAlpha', { configurable: true, get() { return this._alpha; }, set(value) { this._alpha = value; moteAlphas.push(value); } });
  assert.equal(sandbox.HM_WASM_RENDERER.drawWeatherMotes(moteContext, [
    { x: 1, y: 2, r: 0.5, p: 0.2 }, { x: 3, y: 4, r: 1, p: -0.3 }
  ], 700), true, 'Rust computes ambient mote alpha and batches its host painter');
  assert.deepEqual(moteContext.calls, [
    ['save'], ['fillRect', 1, 2, 0.5, 0.5], ['fillRect', 3, 4, 1, 1], ['restore']
  ], 'ambient mote painter preserves positions, sizes and Canvas state');
  assert.ok(Math.abs(moteAlphas[0] - (0.25 + 0.35 * Math.abs(Math.sin(1.2)))) < 1e-12);
  assert.ok(Math.abs(moteAlphas[1] - (0.25 + 0.35 * Math.abs(Math.sin(0.7)))) < 1e-12);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWeatherMotes(moteContext, [{ x: 1, y: 2, r: -1, p: 0 }], 700), false, 'invalid ambient mote data selects the JS fallback');
  const fogContext = new CanvasRenderingContext2D(), fogImage = { width: 512, height: 256 }, fogAlphas = [], fogComposites = [];
  Object.defineProperty(fogContext, 'globalAlpha', { configurable: true, get() { return this._alpha; }, set(value) { this._alpha = value; fogAlphas.push(value); } });
  Object.defineProperty(fogContext, 'globalCompositeOperation', { configurable: true, get() { return this._composite; }, set(value) { this._composite = value; fogComposites.push(value); } });
  assert.equal(sandbox.HM_WASM_RENDERER.drawFog(fogContext, fogImage, 900, false, 0), true, 'Rust places the three fog sprites');
  const fogDraws = fogContext.calls.filter(call => call[0] === 'drawImage');
  assert.equal(fogDraws.length, 3);
  assert.equal(fogDraws[0][1], fogImage);
  assert.deepEqual(fogDraws[0].slice(2), [-425, -40, 920, 460]);
  assert.deepEqual(fogAlphas, [0.13]);
  assert.deepEqual(fogComposites, ['lighter']);
  assert.deepEqual(fogContext.calls[0], ['save']);
  assert.deepEqual(fogContext.calls.at(-1), ['restore']);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFog(fogContext, fogImage, 900, true, 1), true, 'Rust retains smoke at the middle quality tier');
  assert.equal(fogAlphas.at(-1), 0.16);
  assert.equal(fogComposites.at(-1), 'source-over');
  const fogDrawCount = fogContext.calls.filter(call => call[0] === 'drawImage').length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawFog(fogContext, fogImage, 900, false, 2), true, 'Rust suppresses fog at the lowest quality tier without invoking fallback');
  assert.equal(fogContext.calls.filter(call => call[0] === 'drawImage').length, fogDrawCount);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFog(fogContext, fogImage, NaN, false, 0), false, 'invalid fog time selects the legacy fallback');
  assert.equal(sandbox.HM_WASM_RENDERER.drawPickups(particlesContext, [{ x: 40, y: 50, a: 0.25, w: 'pistola' }], true, 220, (context, weapon) => {
    assert.equal(sandbox.HM_WASM_RENDERER.drawWeapon(context, weapon), true);
  }), true, 'pickup batch re-enters Rust weapon drawing with its pose intact');
  assert.ok(particlesContext.calls.some(call => call[0] === 'translate' && call[1] === 40 && call[2] === 50));
  assert.ok(particlesContext.calls.some(call => call[0] === 'fillRect'), 'pickup weapon uses the Rust weapon renderer inside the pickup transform');
  const throwStart = particlesContext.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.drawThrows(particlesContext, [{ x: 60, y: 70, rot: 0.4, w: 'taco' }], (context, weapon) => {
    assert.equal(sandbox.HM_WASM_RENDERER.drawWeapon(context, weapon), true);
  }), true, 'thrown-weapon batch re-enters Rust icon drawing');
  const throwCalls = particlesContext.calls.slice(throwStart);
  assert.ok(throwCalls.some(call => call[0] === 'translate' && call[1] === 60 && call[2] === 70));
  assert.ok(throwCalls.some(call => call[0] === 'rotate' && call[1] === 0.4));
  assert.ok(throwCalls.some(call => call[0] === 'fillRect'), 'thrown weapon is drawn by the Rust icon renderer');
  const transportContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawTransport(transportContext, { x: 10, y: 20, w: 40, h: 60, tipo: 'escada', to: 1 }, 0), true);
  assert.ok(transportContext.calls.some(call => call[0] === 'drawImage' && call[1] && call[1].width === 40 && call[1].height === 60 && call.slice(2).join(',') === '10,20,40,60'), 'Rust stair commands use a cached horizontal gradient texture');
  assert.ok(!transportContext.calls.some(call => call[0] === 'createLinearGradient'), 'WASM stair draw no longer creates a Canvas gradient every frame');
  assert.ok(transportContext.calls.some(call => call[0] === 'fillRect' && call[1] === 16 && call[2] === 24 && call[3] === 28 && call[4] === 4.5), 'Rust stair commands emit tread rectangles');
  assert.equal(transportContext.calls.filter(call => call[0] === 'restore').length, 1, 'transport batch restores Canvas state');
  assert.equal(sandbox.HM_WASM_RENDERER.drawTransport(transportContext, { x: 100, y: 30, w: 50, h: 70, tipo: 'elevador', to: 0 }, 1), true);
  assert.ok(transportContext.calls.some(call => call[0] === 'moveTo' && call[1] === 125 && call[2] === 39), 'Rust elevator command emits downward floor arrow');
  assert.ok(transportContext.calls.some(call => call[0] === 'drawImage' && call[1] && call[1].width === 50 && call[1].height === 70), 'elevator body gradient is cached as an RGBA image');
  assert.ok(transportContext.calls.some(call => call[0] === 'drawImage' && call[1] && call[1].width === 19 && call[1].height === 54), 'elevator door gradient is cached as an RGBA image');
  const doorImages = transportContext.calls.filter(call => call[0] === 'drawImage' && call[1] && call[1].width === 19 && call[1].height === 54).map(call => call[1]);
  assert.equal(doorImages.length, 2, 'both elevator doors receive their Rust-generated gradient');
  assert.notEqual(doorImages[0], doorImages[1], 'left and right doors use separate slices of the elevator-wide gradient');
  const exitContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawExit(exitContext, [10, 20, 100, 40], 0.7, true, true), true);
  assert.ok(exitContext.calls.some(call => call[0] === 'drawImage' && call[1] && call[1].width === 100 && call[1].height === 40 && call.slice(2).join(',') === '10,20,100,40'), 'Rust RGBA gradient keeps the original diagonal exit bounds');
  assert.ok(!exitContext.calls.some(call => call[0] === 'createLinearGradient'), 'WASM exit path no longer creates a Canvas gradient every frame');
  assert.equal(exitContext.calls.filter(call => call[0] === 'lineTo').length, 9, 'Rust emits all diagonal exit hatches');
  assert.equal(exitContext.calls.filter(call => call[0] === 'restore').length, 2, 'exit batch restores clip and outer canvas state');
  const gradePass = [];
  const gradeContext = {
    globalCompositeOperation: 'source-over', fillStyle: '',
    save() { gradePass.push(['save']); }, restore() { gradePass.push(['restore']); },
    fillRect(x, y, width, height) { gradePass.push(['fillRect', this.globalCompositeOperation, this.fillStyle, x, y, width, height]); }
  };
  assert.equal(sandbox.HM_WASM_RENDERER.drawColorGrade(gradeContext, 1280, 720), true);
  assert.deepEqual(gradePass, [
    ['save'],
    ['fillRect', 'soft-light', 'rgba(255, 80, 140, 0.07)', 0, 0, 1280, 720],
    ['fillRect', 'overlay', 'rgba(40, 200, 220, 0.04)', 0, 0, 1280, 720],
    ['restore']
  ], 'Rust color-grade batch preserves composite mode, colors, full-canvas geometry, and save/restore order');
  const finalOverlayPass = [];
  const finalOverlayContext = {
    fillStyle: '',
    save() { finalOverlayPass.push(['save']); }, restore() { finalOverlayPass.push(['restore']); },
    fillRect(x, y, width, height) { finalOverlayPass.push(['fillRect', this.fillStyle, x, y, width, height]); }
  };
  assert.equal(sandbox.HM_WASM_RENDERER.drawFinalOverlays(finalOverlayContext, 1280, 720, 0.4, 0.8, true), true);
  assert.deepEqual(finalOverlayPass, [
    ['save'], ['fillRect', 'rgba(8,0,20,0.4)', 0, 0, 1280, 720],
    ['fillRect', 'rgba(255,46,147,0.4)', 0, 0, 1280, 720], ['restore']
  ], 'Rust final-overlay batch preserves fade/flash alpha, order, geometry, and state');
  finalOverlayPass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawFinalOverlays(finalOverlayContext, 1280, 720, 0, 0.8, false), true);
  assert.deepEqual(finalOverlayPass, [], 'disabled flash emits no Canvas operations');
  const fxOverlayContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawFxOverlays(fxOverlayContext, 0, 1280, 720, 900, 0.8, 0.5, true), true);
  assert.deepEqual(fxOverlayContext.calls.filter(call => call[0] === 'fillRect'), [
    ['fillRect', 0, 0, 1280, 720], ['fillRect', 0, 0, 1280, 720]
  ], 'Rust flash batch preserves full-screen geometry');
  assert.equal(fxOverlayContext.calls.at(-1)[0], 'restore', 'effect batch restores Canvas state');
  assert.equal(sandbox.HM_WASM_RENDERER.drawFxOverlays(fxOverlayContext, 1, 1280, 720, 110, 2.5, 0, true), true);
  assert.equal(fxOverlayContext.calls.filter(call => call[0] === 'fillRect').length, 3, 'Rust emits alarm tint as one full-screen rectangle');
  assert.equal(sandbox.HM_WASM_RENDERER.drawFxOverlays(fxOverlayContext, 2, 1280, 720, 900, 0.65, 0, true), true);
  const cinemaRects = fxOverlayContext.calls.filter(call => call[0] === 'fillRect').slice(-2);
  assert.deepEqual(cinemaRects.map(call => call.slice(1, 4)), [[0, 0, 1280], [0, 657.6, 1280]]);
  assert.ok(cinemaRects.every(call => Math.abs(call[4] - 62.4) < 1e-12), 'Rust preserves cinema-bar heights');
  assert.equal(sandbox.HM_WASM_RENDERER.drawFxOverlays(fxOverlayContext, 3, 1280, 720, 0, 0.12, 0, true), true);
  const countdownFlash = fxOverlayContext.calls.filter(call => call[0] === 'fillRect').at(-1);
  assert.deepEqual(countdownFlash.slice(1), [0, 0, 1280, 720]);
  assert.equal(fxOverlayContext.fillStyle, 'rgba(255,46,91,0.12)', 'Rust emits the time-limit flash with its original red color and alpha');
  assert.equal(sandbox.HM_WASM_RENDERER.fxOverlayCommands, 6);
  assert.equal(sandbox.HM_WASM_RENDERER.drawFxOverlays(fxOverlayContext, 0, 1280, 720, 0, 0.8, 0.5, false), true);
  assert.equal(fxOverlayContext.calls.filter(call => call[0] === 'fillRect').length, 6, 'flash preference suppresses both effect draws');
  assert.equal(sandbox.HM_WASM_RENDERER.drawFxOverlays(fxOverlayContext, 2, 1280, 720, 0, -1, 0, true), false, 'invalid effect values select JavaScript fallback');
  const worldLightContext = new CanvasRenderingContext2D();
  const lampSprite = { id: 'lamp' }, muzzleSprite = { id: 'muzzle' };
  const lights = [
    { x: 10, y: 20, r: 5, p: 0, on: true, spr: lampSprite },
    { x: 30, y: 40, r: 10, p: 0.5, on: false, spr: lampSprite }
  ];
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldLights(worldLightContext, lights, 400, 0.4, true, 1, 100, 200, true, true, muzzleSprite), true);
  assert.deepEqual(worldLightContext.calls.filter(call => call[0] === 'drawImage'), [
    ['drawImage', lampSprite, 5, 15, 10, 10], ['drawImage', muzzleSprite, 10, 110, 180, 180]
  ], 'Rust light batch resolves the corresponding host sprites and world geometry');
  assert.deepEqual(worldLightContext.calls.filter(call => ['ellipse', 'fill'].includes(call[0])), [
    ['ellipse', 100, 214, 14, 5, 0, 0, Math.PI * 2], ['fill']
  ], 'Rust places the rain reflection under the player');
  assert.equal(worldLightContext.calls.filter(call => call[0] === 'save').length, 2);
  assert.equal(worldLightContext.calls.filter(call => call[0] === 'restore').length, 2);
  assert.equal(sandbox.HM_WASM_RENDERER.worldLightCommands, 3);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldLights(worldLightContext, lights, 400, 0.4, true, 1, 100, 200, true, false, null), false, 'missing fire-flash image selects fallback');
  const ringContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldRings(ringContext, [
    { x: 12, y: 24, R: 60, t: 0.225, T: 0.45, c: '#f80' },
    { x: 40, y: 50, R: 26, t: 0, T: 0.45, c: '#ff0' }
  ]), true, 'Rust world-ring batch handles active rings and skips inactive slots');
  assert.deepEqual(ringContext.calls.filter(call => call[0] === 'arc'), [['arc', 12, 24, 37.5, 0, Math.PI * 2]]);
  assert.equal(ringContext.strokeStyle, '#f80');
  assert.equal(ringContext.lineWidth, 4);
  assert.equal(ringContext.globalAlpha, 0.5);
  assert.equal(sandbox.HM_WASM_RENDERER.worldRingCommands, 1);
  assert.equal(sandbox.HM_WASM_RENDERER.drawWorldRings(ringContext, [{ x: 0, y: 0, R: -1, t: 0.2, T: 0.45, c: '#fff' }]), false, 'invalid world-ring geometry uses the original painter');
  const invasionZoneContext = new CanvasRenderingContext2D();
  assert.equal(sandbox.HM_WASM_RENDERER.drawInvasionZone(invasionZoneContext, 20, 35, 65), true);
  assert.ok(invasionZoneContext.calls.some(call => call[0] === 'arc' && call[1] === 20 && call[2] === 35 && call[3] === 34));
  assert.ok(invasionZoneContext.calls.some(call => call[0] === 'fill'), 'Rust Invasion marker preserves the filled disk after its outline');
  assert.equal(sandbox.HM_WASM_RENDERER.invasionZoneCommands, 1);
  assert.equal(sandbox.HM_WASM_RENDERER.drawInvasionZone(invasionZoneContext, 20, 35, -1), false, 'invalid Invasion timing selects fallback');
  const hudShapePass = [];
  const hudShapeContext = {
    fillStyle: '', strokeStyle: '', lineWidth: 0,
    save() { hudShapePass.push(['save']); }, restore() { hudShapePass.push(['restore']); },
    beginPath() { hudShapePass.push(['beginPath']); }, moveTo(x, y) { hudShapePass.push(['moveTo', x, y]); },
    lineTo(x, y) { hudShapePass.push(['lineTo', x, y]); }, closePath() { hudShapePass.push(['closePath']); },
    ellipse(x, y, rx, ry, rotation, start, end) { hudShapePass.push(['ellipse', x, y, rx, ry, rotation, start, end]); },
    arc(x, y, radius, start, end) { hudShapePass.push(['arc', x, y, radius, start, end]); },
    stroke() { hudShapePass.push(['stroke', this.strokeStyle, this.lineWidth]); },
    fill() { hudShapePass.push(['fill', this.fillStyle]); },
    fillRect(x, y, width, height) { hudShapePass.push(['fillRect', this.fillStyle, x, y, width, height]); },
    strokeRect(x, y, width, height) { hudShapePass.push(['strokeRect', this.strokeStyle, this.lineWidth, x, y, width, height]); }
  };
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudShape(hudShapeContext, 0, 1280, 720, 0.25), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(0,0,0,.45)', 34, 186, 220, 10],
    ['fillRect', '#ffd23f', 34, 186, 55, 10], ['strokeRect', '#1a0006', 2, 34, 186, 220, 10], ['restore']
  ], 'Rust HUD combo geometry preserves the low-time color and rect ordering');
  hudShapePass.length = 0;
  sandbox.HM_WASM_RENDERER.drawHudShape(hudShapeContext, 1, 1280, 720);
  assert.deepEqual(hudShapePass, [['save'], ['strokeRect', '#19f0e6', 3, 1198, 26, 56, 56], ['restore']], 'Rust places the mask portrait border');
  hudShapePass.length = 0;
  sandbox.HM_WASM_RENDERER.drawHudShape(hudShapeContext, 2, 1280, 720);
  assert.deepEqual(hudShapePass, [['save'], ['fillRect', 'rgba(5,0,18,.78)', 0, 0, 1280, 720], ['restore']], 'Rust emits the pause-screen veil');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawPauseUi(hudShapeContext, 1280, 720, -1), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(5,0,18,.78)', 0, 0, 1280, 720],
    ['fillRect', 'rgba(20,0,40,.85)', 430, 367, 420, 46], ['strokeRect', '#fff', 2, 430, 367, 420, 46],
    ['fillRect', 'rgba(20,0,40,.85)', 430, 423, 420, 46], ['strokeRect', '#ffd23f', 2, 430, 423, 420, 46], ['restore']
  ], 'Rust pause menu preserves Canvas geometry, colors, outlines, and painter order');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawPauseUi(hudShapeContext, 1280, 720, 0), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(5,0,18,.78)', 0, 0, 1280, 720],
    ['fillRect', 'rgba(255,46,147,.35)', 430, 367, 420, 46], ['strokeRect', '#fff', 3, 430, 367, 420, 46],
    ['fillRect', 'rgba(20,0,40,.85)', 430, 423, 420, 46], ['strokeRect', '#ffd23f', 2, 430, 423, 420, 46], ['restore']
  ], 'Rust pause menu preserves the hover fill and thicker outline');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawPauseUi(hudShapeContext, 1280, 720, 2), false, 'unsupported hover index selects original painter');
  sandbox.HM_WASM_RENDERER.drawHudShape(hudShapeContext, 3, 1280, 720, 0.5);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(0,0,0,.5)', 34, 146, 160, 8], ['fillRect', '#ff9ac8', 34, 146, 80, 8], ['restore']
  ], 'Rust preserves reload bar dimensions, progress, colors, and order');
  hudShapePass.length = 0;
  const bossHud = { hp: 5, hpMax: 10, boss: { col: '#19f0e6', phases: [{ at: 1 }, { at: 0.5 }] } };
  assert.equal(sandbox.HM_WASM_RENDERER.drawBossHealthBar(hudShapeContext, bossHud, 1280, 720), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(0,0,0,.6)', 407, 625, 466, 20],
    ['fillRect', '#19f0e6', 410, 628, 230, 14],
    ['fillRect', 'rgba(255,255,255,.35)', 639, 628, 2, 14],
    ['strokeRect', '#000', 2, 410, 628, 460, 14], ['restore']
  ], 'Rust preserves the boss bar dimensions, phase marker, dynamic color, and painter order');
  assert.equal(sandbox.HM_WASM_RENDERER.drawBossHealthBar(hudShapeContext, { ...bossHud, hpMax: 0 }, 1280, 720), false, 'invalid boss state selects the original painter');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawInvasionArrow(hudShapeContext, 100, 200, Math.PI / 2), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['beginPath'], ['moveTo', 100, 214], ['lineTo', 109, 192], ['lineTo', 91, 192], ['closePath'], ['fill', '#ff6bd5'], ['restore']
  ], 'Rust rotates the Invasion arrow geometry and the host preserves its fill painter');
  assert.equal(sandbox.HM_WASM_RENDERER.drawInvasionArrow(hudShapeContext, NaN, 0, 0), false, 'invalid arrow data selects fallback');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawShopDealer(hudShapeContext, [100, 200, 0.25, 1.5, -1, 0.5, 0, 0]), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['beginPath'], ['ellipse', 100, 210, 12, 5.5, 0, 0, Math.PI * 2], ['fill', 'rgba(0,0,0,.35)'],
    ['beginPath'], ['moveTo', 111, 162.5], ['lineTo', 89, 162.5], ['lineTo', 85, 180.5], ['lineTo', 115, 180.5], ['closePath'], ['fill', '#ff5fa2'],
    ['beginPath'], ['ellipse', 100, 154.5, 8, 8, 0, 0, Math.PI * 2], ['fill', '#f3c9a0'],
    ['fillRect', '#1b1b1b', 104, 153.5, 2, 2], ['fillRect', '#1b1b1b', 98, 153.5, 2, 2], ['fillRect', '#ffffff', 96, 159.5, 8, 2],
    ['beginPath'], ['moveTo', 110, 146.5], ['lineTo', 107, 136.5], ['lineTo', 104, 146.5], ['fill', '#ffd23f'],
    ['beginPath'], ['moveTo', 104, 146.5], ['lineTo', 101, 136.5], ['lineTo', 98, 146.5], ['fill', '#ffd23f'],
    ['beginPath'], ['moveTo', 98, 146.5], ['lineTo', 95, 136.5], ['lineTo', 92, 146.5], ['fill', '#ffd23f'],
    ['beginPath'], ['moveTo', 92, 146.5], ['lineTo', 89, 136.5], ['lineTo', 86, 146.5], ['fill', '#ffd23f'],
    ['fillRect', '#2d0f5c', 88, 145.5, 24, 4],
    ['beginPath'], ['arc', 100, 206, 30, -Math.PI / 2, Math.PI / 2], ['stroke', '#ffd23f', 3], ['restore']
  ], 'Rust dealer geometry preserves shapes, facing, order, colors, and timer arc');
  assert.equal(sandbox.HM_WASM_RENDERER.dealerCommands, 12);
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawShopPanel(hudShapeContext, [0, 100, 150, 210, 46, 22, 0]), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(255,255,255,.95)', -5, 150, 210, 46], ['beginPath'], ['moveTo', 94, 196],
    ['lineTo', 106, 196], ['lineTo', 100, 205], ['closePath'], ['fill', 'rgba(255,255,255,.95)'], ['restore']
  ], 'Rust emits the shop speech box and pointer in their original order');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawShopPanel(hudShapeContext, [1, 100, 200, 112, 54, 24, 0], '#19f0e6'), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(12,4,28,.92)', 44, 173, 112, 54], ['strokeRect', '#19f0e6', 3, 45.5, 174.5, 109, 51], ['restore']
  ], 'Rust preserves card panel geometry, dynamic color, and outline');
  hudShapePass.length = 0;
  assert.equal(sandbox.HM_WASM_RENDERER.drawShopPanel(hudShapeContext, [2, 100, 200, 112, 40, 18, 0]), true);
  assert.deepEqual(hudShapePass, [
    ['save'], ['fillRect', 'rgba(12,4,28,.92)', 44, 180, 112, 40], ['strokeRect', '#ffd23f', 3, 45.5, 181.5, 109, 37], ['restore']
  ], 'Rust preserves reroll panel geometry and yellow outline');
  assert.equal(sandbox.HM_WASM_RENDERER.drawShopPanel(hudShapeContext, [3, 100, 200, 112, 40, 18, 0]), false,
    'invalid shop panel kind selects the existing Canvas fallback');
  const hudTextPass = [];
  const hudTextContext = { globalAlpha: 0.75 };
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudTexts([
    { text: 'PONTOS 120', x: 34, y: 52, color: '#ffd23f', font: 'bold 22px Impact, sans-serif' },
    { text: 'ABATES 2 / 5', x: 1246, y: 128, color: '#ffd23f', font: 'bold 20px Impact, sans-serif', align: 'right', alpha: 0.5 }
  ], (...args) => hudTextPass.push([...args, hudTextContext.globalAlpha]), hudTextContext), true);
  assert.deepEqual(hudTextPass, [
    ['PONTOS 120', 34, 52, '#ffd23f', 'bold 22px Impact, sans-serif', 'left', 1],
    ['ABATES 2 / 5', 1246, 128, '#ffd23f', 'bold 20px Impact, sans-serif', 'right', 0.5]
  ], 'Rust validates and batches HUD text placements while the host retains the cached text painter');
  assert.equal(hudTextContext.globalAlpha, 0.75, 'HUD text batch restores the host alpha after painting');
  assert.equal(sandbox.HM_WASM_RENDERER.hudTextCommands, 2);
  assert.equal(sandbox.HM_WASM_RENDERER.drawHudTexts([{ text: 'inválido', x: 0, y: 0, color: '#fff', font: '12px sans-serif', alpha: 1.5 }], () => assert.fail('invalid alpha must not paint')), false);
  const rawHudContext = new CanvasRenderingContext2D(); rawHudContext.globalAlpha = 0.5;
  assert.equal(sandbox.HM_WASM_RENDERER.drawRawHudTexts([
    { text: 'CRÉDITOS 40', x: 34, y: 156, color: '#ffd23f', font: 'bold 18px Impact, sans-serif', align: 'left', alpha: 0.4 }
  ], rawHudContext), true, 'Rust raw HUD batch accepts valid direct-text metadata');
  assert.deepEqual(rawHudContext.calls.filter(call => ['save', 'fillText', 'restore'].includes(call[0])), [
    ['save'], ['fillText', 'CRÉDITOS 40', 34, 156], ['restore']
  ], 'raw HUD text preserves direct Canvas text order and placement');
  assert.equal(rawHudContext.globalAlpha, 0.2, 'raw HUD text multiplies the inherited canvas alpha by its entry alpha');
  assert.equal(rawHudContext.fillStyle, '#ffd23f');
  assert.equal(rawHudContext.font, 'bold 18px Impact, sans-serif');
  assert.equal(rawHudContext.textAlign, 'left');
  assert.equal(sandbox.HM_WASM_RENDERER.drawRawHudTexts([
    { text: 'VENDIDO', x: 10, y: 20, color: '#ff0', font: 'bold 18px Impact, sans-serif', alpha: 0.3, absoluteAlpha: true }
  ], rawHudContext), true, 'raw HUD batch supports absolute alpha for painters that replace Canvas alpha');
  assert.equal(rawHudContext.globalAlpha, 0.3, 'absolute-alpha HUD text does not multiply the inherited Canvas alpha');
  assert.equal(sandbox.HM_WASM_RENDERER.drawRawHudTexts([{ text: 'inválido', x: NaN, y: 0, color: '#fff', font: '12px sans-serif' }], rawHudContext), false,
    'invalid raw HUD geometry selects the existing JavaScript fallback');
  assert.equal(sandbox.HM_WASM_RENDERER.hudTextCommands, 4);

  const radialCanvas = { width: 0, height: 0, context: new CanvasRenderingContext2D(), getContext() { return this.context; } };
  assert.equal(sandbox.HM_WASM_RENDERER.createRadialSprite(radialCanvas, '255,46,147', 2.5, 1), true);
  assert.equal(radialCanvas.width, 5); assert.equal(radialCanvas.height, 5);
  const radialPixels = radialCanvas.context.calls.find(call => call[0] === 'putImageData')[3];
  assert.deepEqual(Array.from(radialPixels.slice((2 * 5 + 2) * 4, (2 * 5 + 2) * 4 + 4)), [255, 46, 147, 255]);
  assert.equal(sandbox.HM_WASM_RENDERER.radialSpriteCommands, 1);
  assert.equal(sandbox.HM_WASM_RENDERER.createRadialSprite(radialCanvas, 'bad', 2, 1), false, 'invalid radial colors select the Canvas fallback');
  const fogCanvas = { width: 0, height: 0, context: new CanvasRenderingContext2D(), getContext() { return this.context; } };
  const fogRings = Array.from({ length: 9 }, (_, index) => index === 0 ? [100, 100, 100] : [512, 256, 0.01]);
  assert.equal(sandbox.HM_WASM_RENDERER.createFogSprite(fogCanvas, fogRings), true);
  assert.equal(fogCanvas.width, 512); assert.equal(fogCanvas.height, 256);
  const fogPixels = fogCanvas.context.calls.find(call => call[0] === 'putImageData')[3];
  assert.equal(fogPixels[(100 * 512 + 100) * 4 + 3], 139, 'Rust uploads the generated fog sprite RGBA once');
  assert.equal(sandbox.HM_WASM_RENDERER.fogSpriteCommands, 1);
  assert.equal(sandbox.HM_WASM_RENDERER.createFogSprite(fogCanvas, [[0, 0, 1]]), false, 'invalid fog ring lists select the Canvas fallback');
  const gradient = ctx.createLinearGradient(0, 0, 10, 10);
  gradient.addColorStop(0, '#000');
  assert.deepEqual(gradient.stops, [[0, '#000']]);
  assert.equal(sandbox.HM_WASM_RENDERER.active, true);
  assert.equal(badgeHost.children[0].textContent, 'WASM ATIVO');
  assert.equal(badgeHost.children[0].role, 'status');
  assert.match(badgeHost.children[0]['aria-label'], /parte das chamadas ainda usa Canvas/);
  console.log('WASM browser-bridge checks passed (Rust player ghosts, ordered/cached/raw HUD text batches, compact accessible status badge, HUD grade/fade/flash/shapes, floor/map commands, actor composition, Canvas bridge and fallbacks).');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

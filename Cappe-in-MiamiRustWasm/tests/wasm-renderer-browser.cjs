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
    createLinearGradient(...args) { this.calls.push(['createLinearGradient', ...args]); return new CanvasGradient(); }
    save() { this.calls.push(['save']); }
    beginPath() { this.calls.push(['beginPath']); }
    rect(...args) { this.calls.push(['rect', ...args]); }
    clip() { this.calls.push(['clip']); }
    restore() { this.calls.push(['restore']); }
    strokeRect(...args) { this.calls.push(['strokeRect', ...args]); }
    moveTo(...args) { this.calls.push(['moveTo', ...args]); }
    lineTo(...args) { this.calls.push(['lineTo', ...args]); }
    stroke() { this.calls.push(['stroke']); }
    arc(...args) { this.calls.push(['arc', ...args]); }
    ellipse(...args) { this.calls.push(['ellipse', ...args]); }
    fill() { this.calls.push(['fill']); }
    fillText(...args) { this.calls.push(['fillText', ...args]); }
    translate(...args) { this.calls.push(['translate', ...args]); }
    rotate(...args) { this.calls.push(['rotate', ...args]); }
    drawImage(...args) { this.calls.push(['drawImage', ...args]); }
    createPattern(...args) { this.calls.push(['createPattern', ...args]); return new CanvasPattern(); }
    createImageData(width, height) { this.calls.push(['createImageData', width, height]); return { data: new Uint8ClampedArray(width * height * 4) }; }
    putImageData(image, x, y) { this.calls.push(['putImageData', x, y, image.data.slice()]); }
  }
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
    configurable: true,
    get() { return this._fillStyle; },
    set(value) { this._fillStyle = value; }
  });

  const badgeHost = { children: [], appendChild(child) { this.children.push(child); } };
  const sandbox = {
    URL, URLSearchParams, WebAssembly, Map, Object, console,
    location: { search: '?renderer=wasm', href: 'http://localhost/index.html?renderer=wasm' },
    document: {
      currentScript: { src: 'http://localhost/js/wasm-renderer.js' },
      body: badgeHost,
      createElement() { return { style: {}, textContent: '', id: '' }; }
    },
    CanvasRenderingContext2D, CanvasGradient, CanvasPattern, Path2D,
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
  assert.equal(grainCalls.length, 3, 'Rust keeps Math.round(width*height/160) floor specks');
  assert.ok(grainCalls.every(([color, , , , h]) => ['rgba(0,0,0,.09)', 'rgba(255,255,255,.06)'].includes(color) && h === 1));
  assert.ok(grainSeed !== 12345, 'Rust floor-grain pass returns the advanced deterministic seed');
  const finishStart = finishContext.calls.length;
  assert.equal(sandbox.HM_WASM_RENDERER.paintFloorFinish(finishContext, [[1, 2, 3, 4]], 49, 25), true);
  const floorFinishCalls = finishContext.calls.slice(finishStart).filter(call => call[0] === 'fillRect');
  assert.deepEqual(floorFinishCalls, [['fillRect', 6, 9, 3, 4], ['fillRect', 0, 0, 1, 25], ['fillRect', 24, 0, 1, 25], ['fillRect', 48, 0, 1, 25], ['fillRect', 0, 0, 49, 1], ['fillRect', 0, 24, 49, 1]]);
  assert.equal(sandbox.HM_WASM_RENDERER.floorFinishCommands, 9);
  const floorTextureContext = new CanvasRenderingContext2D();
  const floorTextureImage = { complete: true, naturalWidth: 96 };
  const floorTextureRooms = [{ x: 2, y: 3, w: 20, h: 30 }, { x: 50, y: 60, w: 40, h: 50 }, { x: 100, y: 120, w: 40, h: 50 }];
  floorTextureRooms.hall = floorTextureRooms[1];
  const floorTilesRendered = sandbox.HM_WASM_RENDERER.paintFloorTiles(floorTextureContext, floorTextureRooms, 2, floorTextureImage);
  if (typeof WebAssembly.Module.exports === 'function') {
    const moduleExports = WebAssembly.Module.exports(new WebAssembly.Module(wasm));
    if (moduleExports.some(item => item.name === 'paint_floor_tiles')) {
      assert.equal(floorTilesRendered, true);
      assert.deepEqual(floorTextureContext.calls.filter(call => call[0] === 'fillRect'), [
        ['fillRect', 2, 3, 68, 78], ['fillRect', 100, 120, 88, 98]
      ], 'host clips and fills Rust-selected FTILES rooms, skipping the corridor');
      assert.equal(sandbox.HM_WASM_RENDERER.floorTextureCommands, 2);
      assert.equal(floorTextureContext.calls.filter(call => call[0] === 'createPattern').length, 1);
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

  const gradient = ctx.createLinearGradient(0, 0, 10, 10);
  gradient.addColorStop(0, '#000');
  assert.deepEqual(gradient.stops, [[0, '#000']]);
  assert.equal(sandbox.HM_WASM_RENDERER.active, true);
  assert.equal(badgeHost.children[0].textContent, 'RENDERER WASM ATIVO');
  console.log('WASM browser-bridge checks passed (Rust floor grain/shadows/grout, FTILES room geometry when available, map image textures, map background/decor/breakables, player/enemy composition, spritesheets and status-label commands, floor/map/furniture/weapons/doors including Neon sprites, Canvas methods/setters and fallback).');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

(() => {
  const enabled = new URLSearchParams(location.search).get('renderer') === 'wasm';
  const diagnosticsEnabled = enabled && new URLSearchParams(location.search).get('wasmDiagnostics') === '1';
  const scriptUrl = document.currentScript ? document.currentScript.src : location.href;
  const pending = new Map();
  const patchedPrototypes = new WeakSet();
  let nextOperationId = 1;
  let currentFloorBatch = null;
  let currentFloorPixelBatch = null;
  const floorGrainImageCache = new WeakMap();
  const floorGrainRasterReady = new WeakSet();
  const mapTextureImageCache = new WeakMap();
  const mapTextureSourcePixelCache = new WeakMap();
  let currentCanvasSetup = null;
  let lastCanvasSetup = null;
  let currentFrameBackground = null;
  let currentDustBatch = null;
  let currentSparkBatch = null;
  let currentBloodBatch = null;
  let currentCorpseBatch = null;
  let currentBulletBatch = null;
  let currentLayerBatch = null;
  let currentShellBatch = null;
  let currentDarkOutlineBatch = null;
  let currentDarkOverlayBatch = null;
  let currentFxBatch = null;
  let currentPickupBatch = null;
  let currentThrowBatch = null;
  let currentTransportBatch = null;
  let currentTransportGradientBatch = null;
  const transportGradientCache = new WeakMap();
  let currentExitBatch = null;
  let currentExitGradientBatch = null;
  let currentColorGradeBatch = null;
  let currentFinalOverlayBatch = null;
  let currentHudShapeBatch = null;
  let currentRadialSpriteBatch = null;
  let currentMuzzleSpriteBatch = null;
  let muzzleSpriteCanvas = null;
  let exitGradientCanvas = null;
  let exitGradientContext = null;
  let exitGradientImage = null;
  let exitGradientWidth = 0;
  let exitGradientHeight = 0;
  let exitGradientCleared = null;
  let currentHudImageBatch = null;
  let currentAlarmTextBatch = null;
  let currentComboTextBatch = null;
  let currentHudTextBatch = null;
  let currentRainBatch = null;
  let currentWeatherMoteBatch = null;
  let currentFogBatch = null;
  let currentFxOverlayBatch = null;
  let currentWorldLightBatch = null;
  let currentWorldRingBatch = null;
  let currentInvasionZoneBatch = null;
  let currentGhostBatch = null;
  let currentFloorTextureBatch = null;
  let currentMapBatch = null;
  let currentMapTextureBatch = null;
  let currentFurnitureBatch = null;
  const worldBarrelBatch = { context: null, error: null };
  let worldBarrelInputView = null;
  const worldCameraBatch = { context: null, error: null };
  let worldCameraInputView = null;
  const worldEnemyColors = ['rgba(255,46,91,1)', 'rgba(255,46,91,.7)'];
  const worldEnemyBatch = { context: null, colors: worldEnemyColors, error: null };
  let worldEnemyInputView = null;
  const frameTransformBatch = { context: null, error: null };
  let frameTransformInputView = null;
  const glassBatch = { context: null, colors: null, error: null };
  let glassPanelInputView = null, glassShardInputView = null;
  let currentWeaponBatch = null;
  let currentDoorBatch = null;
  let currentNeonDoorBatch = null;
  let currentActorBatch = null;
  let currentPlayerBatch = null;
  let bypassDepth = 0;
  let wasm = null;
  let hudImageInputView = null;
  let worldRingInputView = null;
  let worldRingOutputView = null;
  const worldRingColors = [];
  const worldRingBatch = { context: null, colors: worldRingColors, error: null };
  const invasionZoneBatch = { context: null, error: null };
  let invasionZoneInputView = null;
  let invasionZoneOutputView = null;
  const state = { enabled, active: false, status: enabled ? 'loading' : 'disabled', directReady: false, directError: null, directMapFrames: 0, directEnemyTextCommands: 0, floorRects: 0, floorFinishCommands: 0, floorTextureCommands: 0, mapCommands: 0, mapDecorCommands: 0, mapTextureCommands: 0, breakableCommands: 0, furnitureCommands: 0, weaponCommands: 0, doorCommands: 0, playerAuraCommands: 0, playerBodyCommands: 0, ghostCommands: 0, hudTextCommands: 0, hudImageCommands: 0, weatherLabelCommands: 0, alarmTextCommands: 0, rainCommands: 0, weatherMoteCommands: 0, fogCommands: 0, fogSpriteCommands: 0, fxOverlayCommands: 0, worldLightCommands: 0, worldRingCommands: 0, invasionZoneCommands: 0, invasionArrowCommands: 0, worldBarrelCommands: 0, worldCameraCommands: 0, worldEnemyAccentCommands: 0, glassCommands: 0, frameTransformCommands: 0, darkOverlayCommands: 0, comboTextCommands: 0, enemyShadowCommands: 0, enemyBodyCommands: 0, enemyTextCommands: 0, stunEffects: 0, playerFrames: 0, dealerCommands: 0, radialSpriteCommands: 0 };
  state.directDustFrames = 0;
  state.directEnemyShadowCalls = 0;
  state.directGlassTraceCalls = 0;
  state.directExplosionScorchCalls = 0;
  state.directDebugHudCalls = 0;
  state.directDebugWorldCalls = 0;
  state.directFogCalls = 0;
  state.directWorldLightCalls = 0;
  state.directWorldRingCalls = 0;
  state.directInvasionZoneCalls = 0;
  state.directDarkOverlayCalls = 0;
  state.directFxCalls = 0;
  state.fxCommands = 0;
  state.directDustCommands = 0;
  state.directSparkFrames = 0;
  state.directSparkCommands = 0;
  state.directBloodFrames = 0;
  state.directBloodSplatterCalls = 0;
  state.directBloodCommands = 0;
  state.directStaticBloodFrames = 0;
  state.directStaticBloodCommands = 0;
  state.directCorpseFrames = 0;
  state.directCorpseCommands = 0;
  state.directPauseFrames = 0;
  state.directFxOverlayFrames = 0;
  state.directRainFrames = 0;
  state.directWeatherMoteFrames = 0;
  state.directHudTextFrames = 0;
  state.directCanvasImageFrames = 0;
  state.directCanvasLayerCalls = 0;
  state.directImageDataCreateCalls = 0;
  state.directImageDataPutCalls = 0;
  state.directClearRectCalls = 0;
  state.directImageSmoothingCalls = 0;
  state.directTextImageFrames = 0;
  state.directFurnitureFrames = 0;
  state.directActorFrames = 0;
  state.directCommandFrames = 0;
  if (diagnosticsEnabled) {
    state.canvasOperationCounts = Object.create(null);
    state.canvasPropertyWriteCounts = Object.create(null);
    state.canvasOperationSamples = Object.create(null);
    state.canvasPropertyWriteSamples = Object.create(null);
    state.getResidualCanvasTop = (limit = 12) => Object.entries(state.canvasOperationCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, Math.max(0, Math.min(64, limit | 0)));
  }
  const FURNITURE_COLORS = [
    '#25b5ba', '#0e6a70', '#f4f4fa', '#2f9f5c', '#a59b3a', '#3a4aa8', '#2b1a24', '#000', '#6a6a78', '#111',
    '#7a4a26', '#3d2410', '#9a6234', '#ececf2', '#7d7d90', '#2b2b33', '#9a9aaa', '#b6bacb', '#7e8398', '#f2f2f8',
    '#cfd3e6', '#8fd4e8', '#f6f6fb', '#c9cde4', '#1f7a2c', '#35c24a', '#2f6b3a', '#173a1e', '#3d8a4b', '#6a3d1c',
    '#e3bb72', '#7a5520', '#1f7a45', '#6b3f1a', '#f5f5f5', '#d6203a', '#26264f', '#0d0d26', '#19f0e6', '#ff2e93',
    '#e0509a', '#7a1f50', '#ff9ad0', '#222', '#c01339', '#5e0a1c', '#8c0e2a', '#2a2a3a', '#000', '#34344a',
    '#6a6a88', '#ffd23f', '#1a0630', '#4c1280', '#5e1ca0', '#e8e8f0', '#a8742f', '#5a3a10', '#6b4511',
    '#9b6424', '#e0aa4f', '#493018', '#d8e4ef', '#201723', '#20242b', '#59616d', '#353943', '#6f3e1e',
    '#8a542d', '#737b87', '#30343b', '#57351f', '#9a6940', '#56616b', '#252a31', '#b9c2cc', '#656e78',
    '#7a4d28', '#555e68', '#9aa0a8', '#d6dbe2', '#aeb7c2', '#555', '#d7dbe6', '#999', '#4a2c14', '#6a6a74',
    '#777', '#3a3a44', '#2a2f2a', '#2a2a30', '#444', '#888', '#e8f6ff', '#2f9e5a', '#bff5d2', '#d02020',
    '#eee', 'rgba(0,0,0,.72)', 'rgba(255,255,255,.48)', 'rgba(18,22,29,.85)', 'rgba(255,255,255,.55)', 'rgba(230,240,250,.7)', '#8fa0b4',
    'rgba(0,0,0,.4)', 'rgba(0,0,0,.28)', 'rgba(25,240,230,.14)', 'rgba(255,46,147,.14)',
    'rgba(255,138,31,.28)', '#fff', '#b8321c', '#ffd23f', '#2a0a06',
    'rgba(255,46,91,.20)', 'rgba(25,240,230,.11)', '#20202c', '#19f0e6', '#ff2e5b',
    'rgba(110,225,255,.26)', 'rgba(210,255,255,.8)', 'rgba(255,255,255,.55)', 'rgba(255,255,255,1)',
    'rgba(190,250,255,1)', 'rgba(120,230,255,1)', 'rgba(255,255,255,1)', 'rgba(255,170,230,1)'
  ];
  const ACTOR_COLORS = ['#111', '#e7b98f', '#0b0812', '#19f0e6', '#ffd23f', '#ff7a1a', 'rgba(255,255,255,.22)', '#16101f', '#2a1a10', '#ff2e93', 'rgba(0,0,0,.32)'];
  window.HM_WASM_RENDERER = state;
  if (!enabled) return;

  function dispatch(original, receiver, args, isSetter, operationName) {
    if (bypassDepth) return isSetter ? original.call(receiver, args[0]) : original.apply(receiver, args);
    if (diagnosticsEnabled) {
      const counts = isSetter ? state.canvasPropertyWriteCounts : state.canvasOperationCounts;
      counts[operationName] = (counts[operationName] || 0) + 1;
      const samples = isSetter ? state.canvasPropertyWriteSamples : state.canvasOperationSamples;
      if (!samples[operationName]) samples[operationName] = new Error(`Canvas ${isSetter ? 'property' : 'method'}: ${operationName}`).stack;
    }
    const id = nextOperationId;
    nextOperationId = (nextOperationId + 1) >>> 0;
    if (!nextOperationId) nextOperationId = 1;
    const operation = { run: null, result: undefined, error: undefined, hasError: false };
    operation.run = () => isSetter ? original.call(receiver, args[0]) : original.apply(receiver, args);
    pending.set(id, operation);
    try {
      if (isSetter) wasm.exports.canvas_set(id);
      else wasm.exports.canvas_call(id);
    } finally {
      pending.delete(id);
    }
    if (operation.hasError) throw operation.error;
    return operation.result;
  }

  function withCanvasBypass(callback) {
    bypassDepth++;
    try { return callback(); }
    finally { bypassDepth--; }
  }

  function executeFurnitureCommands(batch, commands) {
    withCanvasBypass(() => {
      const g = batch.context;
      for (let i = 0; i < commands.length; i += 8) {
        const op = commands[i] | 0, color = commands[i + 1] | 0;
        const a = commands[i + 2], b = commands[i + 3], c = commands[i + 4], d = commands[i + 5], e = commands[i + 6], f = commands[i + 7];
        if (op === 1) { g.save(); g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 5; g.shadowOffsetX = 1; g.shadowOffsetY = 2; }
        else if (op === 15) { g.save(); g.shadowColor = 'rgba(0,0,0,.62)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 2; }
        else if (op === 16) g.save();
        else if (op === 17) g.lineCap = 'round';
        else if (op === 2) g.restore();
        else if (op === 3) g.lineWidth = a;
        else if (op === 4) { if (FURNITURE_COLORS[color] === undefined) throw new Error(`cor de móvel inválida: ${color}`); g.fillStyle = FURNITURE_COLORS[color]; }
        else if (op === 5) { if (FURNITURE_COLORS[color] === undefined) throw new Error(`cor de contorno inválida: ${color}`); g.strokeStyle = FURNITURE_COLORS[color]; }
        else if (op === 6) g.fillRect(a, b, c, d);
        else if (op === 7) g.strokeRect(a, b, c, d);
        else if (op === 8) g.beginPath();
        else if (op === 9) g.moveTo(a, b);
        else if (op === 10) g.lineTo(a, b);
        else if (op === 11) g.arc(a, b, c, d, e);
        else if (op === 12) g.ellipse(a, b, c, d, e, 0, f);
        else if (op === 13) g.fill();
        else if (op === 14) g.stroke();
        else if (op === 18) g.globalAlpha = a;
        else if (op === 19) g.translate(a, b);
        else if (op === 20) g.rotate(a);
        else if (op === 39) g.scale(a, b);
        else if (op === 21) { if (batch.doorImage) { g.imageSmoothingEnabled = true; g.drawImage(batch.doorImage, a, b, c, d); } }
        else if (op === 22) {
          if (!batch.enemySheet) throw new Error('spritesheet de inimigos ausente no comando Rust');
          g.imageSmoothingEnabled = true;
          g.drawImage(batch.enemySheet, a * 24, b * 24, 24, 24, -11.5, -11.5, 24, 24);
        }
        else if (op === 23) { if (ACTOR_COLORS[color] === undefined) throw new Error(`cor de ator inválida: ${color}`); g.fillStyle = ACTOR_COLORS[color]; }
        else if (op === 24) { if (ACTOR_COLORS[color] === undefined) throw new Error(`contorno de ator inválido: ${color}`); g.strokeStyle = ACTOR_COLORS[color]; }
        else if (op === 25) g.imageSmoothingEnabled = a !== 0;
        else if (op === 26) {
          if (!batch.playerSheet) throw new Error('spritesheet de jogador ausente no comando Rust');
          g.drawImage(batch.playerSheet, a * 24, b * 24, 24, 24, -11.5, -11.5, 24, 24);
        }
        else if (op === 27) {
          const frame = batch.playerFrames[color];
          if (!frame) throw new Error(`frame procedural do jogador ausente: ${color}`);
          g.drawImage(frame, -11.5, -11.5);
        }
        else if (op === 28) {
          const colorValue = batch.skinColors[color];
          if (colorValue === undefined) throw new Error(`cor cosmética do jogador inválida: ${color}`);
          g.fillStyle = colorValue;
        }
        else if (op === 29) {
          const isP2 = !!batch.playerIsP2[color];
          g.fillStyle = ACTOR_COLORS[isP2 ? 9 : 3];
          g.font = 'bold 10px Rajdhani,sans-serif';
          g.textAlign = 'center';
          g.fillText(isP2 ? 'P2' : 'P1', a, b);
        }
        else if (op === 30) { if (batch.enemyText) { batch.enemyText(color, a, b); state.enemyTextCommands++; } }
        else if (op === 31) {
          const textures = batch.mapTextures;
          const image = color === 0 ? textures && textures.wallFace : textures && textures.furnitureFaces && textures.furnitureFaces[a | 0];
          if (!image) throw new Error(`textura de mapa ausente para tipo ${color}, índice ${a}`);
          g.save();
          try {
            g.beginPath(); g.rect(b, c, d, e); g.clip();
            if (color === 1) g.imageSmoothingEnabled = false;
            g.fillStyle = g.createPattern(image, 'repeat'); g.fillRect(b, c, d, e);
          } finally { g.restore(); }
        }
        else if (op === 32) {
          const image = batch.mapTextures && batch.mapTextures.doorOpen;
          if (!image) throw new Error('textura de porta aberta ausente');
          g.save();
          try {
            g.imageSmoothingEnabled = false; g.translate(a, b);
            if (e !== 0) g.rotate(Math.PI / 2);
            g.drawImage(image, -c / 2, -d / 2, c, d);
          } finally { g.restore(); }
        }
        else if (op === 33) {
          if (!batch.floorTilePattern) throw new Error('padrão de textura de piso ausente');
          g.save();
          try {
            g.beginPath(); g.rect(a, b, c, d); g.clip();
            g.translate(e, 0); g.globalAlpha = 0.45; g.fillStyle = batch.floorTilePattern;
            g.fillRect(a, b, c + 48, d + 48);
          } finally { g.restore(); }
        }
        else if (op === 34) {
          const image = batch.spriteImages && batch.spriteImages[color];
          if (image && image.complete && image.naturalWidth > 0) g.drawImage(image, a, b);
        }
        else if (op === 35) { if (color) g.closePath(); else g.lineTo(a, b); }
        else if (op === 36) { if (!batch.colors || batch.colors[color] === undefined) throw new Error(`cor de preenchimento dinâmica inválida: ${color}`); g.fillStyle = batch.colors[color]; }
        else if (op === 37) { if (!batch.colors || batch.colors[color] === undefined) throw new Error(`cor de contorno dinâmica inválida: ${color}`); g.strokeStyle = batch.colors[color]; }
        else if (op === 38) g.setLineDash([a, b]);
        else throw new Error(`comando de móvel/ator desconhecido: ${op}`);
      }
    });
  }

  function patchPrototype(proto) {
    if (!proto || patchedPrototypes.has(proto)) return;
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (!descriptor || !descriptor.configurable) continue;
      if (typeof descriptor.value === 'function') {
        const original = descriptor.value;
        Object.defineProperty(proto, name, {
          ...descriptor,
          value: function (...args) { return dispatch(original, this, args, false, name); }
        });
      } else if (typeof descriptor.set === 'function') {
        const original = descriptor.set;
        Object.defineProperty(proto, name, {
          ...descriptor,
          set: function (value) { return dispatch(original, this, [value], true, name); }
        });
      }
    }
    patchedPrototypes.add(proto);
  }

  function showStatus() {
    const badge = document.createElement('div');
    badge.id = 'hm-wasm-renderer-status';
    badge.textContent = 'WASM ATIVO';
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-label', 'Renderer experimental Rust/WASM ativo; parte das chamadas ainda usa Canvas no host.');
    Object.assign(badge.style, {
      position: 'fixed', left: '8px', top: '4px', zIndex: '2147483647',
      maxWidth: 'calc(100vw - 16px)', padding: '2px 5px', color: '#19f0e6', background: 'rgba(8,0,20,.82)',
      border: '1px solid rgba(25,240,230,.65)', borderRadius: '3px', font: '10px/1.15 monospace',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none'
    });
    document.body.appendChild(badge);
    setInterval(() => {
      const calls = wasm.exports.canvas_calls();
      const writes = wasm.exports.property_writes();
      badge.textContent = `WASM ativo · ${calls.toLocaleString()} chamadas Canvas residuais`;
      badge.title = `Renderer experimental Rust/WASM. Canvas host: ${calls.toLocaleString()} chamadas e ${writes.toLocaleString()} propriedades interceptadas. Rust: ${wasm.exports.floor_rects().toLocaleString()} retângulos de piso; ${state.floorFinishCommands.toLocaleString()} acabamentos; ${state.floorTextureCommands.toLocaleString()} texturas de piso; ${state.mapTextureCommands.toLocaleString()} texturas de mapa; ${state.furnitureCommands.toLocaleString()} móveis; ${state.weaponCommands.toLocaleString()} comandos de arma; ${state.doorCommands.toLocaleString()} portas; ${state.enemyBodyCommands.toLocaleString()} comandos de inimigo; ${state.playerBodyCommands.toLocaleString()} de jogador; ${state.hudTextCommands.toLocaleString()} textos HUD; ${state.rainCommands.toLocaleString()} segmentos de chuva; ${state.weatherMoteCommands.toLocaleString()} partículas de ambiente; ${state.enemyShadowCommands.toLocaleString()} sombras; ${state.stunEffects.toLocaleString()} efeitos; ${state.playerFrames.toLocaleString()} sprites.`;
    }, 1000);
  }

  (async () => {
    try {
      if (typeof WebAssembly === 'undefined') throw new Error('WebAssembly não suportado neste navegador');
      const wasmUrl = new URL('../wasm-renderer/pkg/renderer.wasm', scriptUrl);
      const response = await fetch(wasmUrl.href, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status} ao carregar renderer.wasm`);
      const bytes = await response.arrayBuffer();
      const result = await WebAssembly.instantiate(bytes, {
        host: {
        set_canvas_setup(scale, smoothing, quality) {
          const batch = currentCanvasSetup;
          if (!batch) return;
          try {
            const qualities = ['low', 'medium', 'high'];
            withCanvasBypass(() => {
              batch.context.setTransform(scale, 0, 0, scale, 0, 0);
              batch.context.imageSmoothingEnabled = smoothing !== 0;
              batch.context.imageSmoothingQuality = qualities[quality];
            });
          } catch (error) { batch.error = error; }
        },
        fill_frame_background(width, height) {
          const batch = currentFrameBackground;
          if (!batch) return;
          try { withCanvasBypass(() => { batch.context.fillStyle = '#0d0320'; batch.context.fillRect(-20, -20, width + 40, height + 40); }); }
          catch (error) { batch.error = error; }
        },
          execute_canvas_call(id) {
            const operation = pending.get(id);
            if (!operation) return;
            try { operation.result = operation.run(); }
            catch (error) { operation.error = error; operation.hasError = true; }
          },
          execute_canvas_set(id) {
            const operation = pending.get(id);
            if (!operation) return;
            try { operation.run(); }
            catch (error) { operation.error = error; operation.hasError = true; }
          },
          draw_floor_batch(pointer, count) {
            if (!currentFloorBatch || currentFloorBatch.error) return;
            try {
              const batch = currentFloorBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 5);
              withCanvasBypass(() => {
                for (let i = 0; i < commands.length; i += 5) {
                  const color = commands[i], fill = batch.palette[color];
                  if (fill === undefined) throw new Error(`índice de cor de piso inválido: ${color}`);
                  batch.context.fillStyle = fill;
                  batch.context.fillRect(commands[i + 1], commands[i + 2], commands[i + 3], commands[i + 4]);
                }
              });
            } catch (error) { currentFloorBatch.error = error; }
          },
          draw_floor_rgba_batch(pointer, width, height) {
            if (!currentFloorPixelBatch || currentFloorPixelBatch.error) return;
            try {
              const batch = currentFloorPixelBatch;
              if (width !== batch.width || height !== batch.height || !batch.image || batch.image.width !== width || batch.image.height !== height) throw new Error('dimensões inválidas no granulado RGBA Rust');
              const pixels = new Uint8ClampedArray(wasm.exports.memory.buffer, pointer, width * height * 4);
              if (!state.putCanvasImageData(batch.context, batch.image, pixels, width, height)) withCanvasBypass(() => { batch.image.data.set(pixels); batch.context.putImageData(batch.image, 0, 0); });
            } catch (error) { currentFloorPixelBatch.error = error; }
          },
          draw_dust_batch(pointer, count, alpha) {
            if (!currentDustBatch || currentDustBatch.error) return;
            try {
              const batch = currentDustBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 3);
              if (state.directReady && state.direct && state.direct.drawDust) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawDust(batch.context, commands, alpha));
                  if (Number.isInteger(directCount) && directCount === count) {
                    state.directDustFrames++; state.directDustCommands += directCount; return;
                  }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.globalAlpha = alpha; context.fillStyle = '#c8b8ff'; context.beginPath();
                  for (let i = 0; i < commands.length; i += 3) {
                    context.moveTo(commands[i] + commands[i + 2], commands[i + 1]);
                    context.arc(commands[i], commands[i + 1], commands[i + 2], 0, 6.28);
                  }
                  context.fill();
                } finally { context.restore(); }
              });
            } catch (error) { currentDustBatch.error = error; }
          },
          draw_spark_batch(pointer, count) {
            if (!currentSparkBatch || currentSparkBatch.error) return;
            try {
              const batch = currentSparkBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 6);
              if (state.directReady && state.direct && state.direct.drawSparks) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawSparks(batch.context, commands, batch.colors));
                  if (Number.isInteger(directCount) && directCount === count) {
                    state.directSparkFrames++; state.directSparkCommands += directCount; return;
                  }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.globalCompositeOperation = 'lighter';
                  let palette = -1, alpha = -1;
                  for (let i = 0; i < commands.length; i += 6) {
                    if (commands[i] !== palette || commands[i + 1] !== alpha) {
                      if (i > 0) context.fill();
                      palette = commands[i]; alpha = commands[i + 1];
                      context.fillStyle = batch.colors[palette]; context.globalAlpha = alpha; context.beginPath();
                    }
                    context.rect(commands[i + 2], commands[i + 3], commands[i + 4], commands[i + 5]);
                  }
                  if (commands.length) context.fill();
                } finally { context.restore(); }
              });
            } catch (error) { currentSparkBatch.error = error; }
          },
          draw_live_blood_batch(pointer, count) {
            if (!currentBloodBatch || currentBloodBatch.error) return;
            try {
              const batch = currentBloodBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              if (state.directReady && state.direct && state.direct.drawLiveBlood) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawLiveBlood(batch.context, commands, batch.color));
                  if (Number.isInteger(directCount) && directCount === count) { state.directBloodFrames++; state.directBloodCommands += directCount; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.fillStyle = batch.color;
                for (let i = 0; i < commands.length; i += 4) {
                  context.globalAlpha = commands[i + 3]; context.beginPath();
                  context.arc(commands[i], commands[i + 1], commands[i + 2], 0, 6.28); context.fill();
                }
                context.globalAlpha = 1;
              });
            } catch (error) { currentBloodBatch.error = error; }
          },
          draw_static_blood_batch(pointer, count) {
            if (!currentBloodBatch || currentBloodBatch.error) return;
            try {
              const batch = currentBloodBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              if (state.directReady && state.direct && state.direct.drawStaticBlood) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawStaticBlood(batch.context, commands, batch.color));
                  if (Number.isInteger(directCount) && directCount === count) { state.directStaticBloodFrames++; state.directStaticBloodCommands += directCount; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.fillStyle = batch.color; context.beginPath();
                for (let i = 0; i < commands.length; i += 4) {
                  context.moveTo(commands[i] + commands[i + 2], commands[i + 1]);
                  context.arc(commands[i], commands[i + 1], commands[i + 2], 0, 6.28);
                }
                context.fill();
              });
            } catch (error) { currentBloodBatch.error = error; }
          },
          draw_corpse_batch(pointer, count) {
            if (!currentCorpseBatch || currentCorpseBatch.error) return;
            try {
              const batch = currentCorpseBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 7);
              if (state.directReady && state.direct && state.direct.drawCorpses) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawCorpses(batch.context, commands, batch.colors));
                  if (Number.isInteger(directCount) && directCount === count) { state.directCorpseFrames++; state.directCorpseCommands += directCount; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                for (let i = 0; i < commands.length; i += 7) {
                  const color = commands[i + 6];
                  context.save();
                  try {
                    context.translate(commands[i], commands[i + 1]); context.rotate(commands[i + 2]);
                    context.fillStyle = color === 3 ? 'rgba(0,0,0,.35)' : batch.colors[color];
                    context.globalAlpha = commands[i + 5]; context.beginPath();
                    context.ellipse(0, 0, commands[i + 3], commands[i + 4], 0, 0, 6.28); context.fill();
                  } finally { context.restore(); }
                }
              });
            } catch (error) { currentCorpseBatch.error = error; }
          },
          draw_bullet_batch(pointer, count) {
            if (!currentBulletBatch || currentBulletBatch.error) return;
            try {
              const batch = currentBulletBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 3);
              withCanvasBypass(() => {
                for (let i = 0; i < commands.length; i += 3) {
                  const image = commands[i + 2] ? batch.mine : batch.foe;
                  batch.context.drawImage(image, commands[i], commands[i + 1]);
                }
              });
            } catch (error) { currentBulletBatch.error = error; }
          },
          draw_layer_command(pointer) {
            if (!currentLayerBatch || currentLayerBatch.error) return;
            try {
              const batch = currentLayerBatch;
              const rect = new Float64Array(wasm.exports.memory.buffer, pointer, 8);
              withCanvasBypass(() => batch.context.drawImage(batch.image, ...rect));
            } catch (error) { currentLayerBatch.error = error; }
          },
          draw_shell_batch(pointer, count) {
            if (!currentShellBatch || currentShellBatch.error) return;
            try {
              const batch = currentShellBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 5);
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.globalAlpha = 0.72; context.fillStyle = '#d8c8a2'; context.beginPath();
                  for (let i = 0; i < commands.length; i += 5) {
                    context.ellipse(commands[i], commands[i + 1], commands[i + 2], commands[i + 3], commands[i + 4], 0, 6.283185307179586);
                  }
                  context.fill();
                } finally { context.restore(); }
              });
            } catch (error) { currentShellBatch.error = error; }
          },
          draw_dark_outline_batch(pointer, count) {
            if (!currentDarkOutlineBatch || currentDarkOutlineBatch.error) return;
            try {
              const batch = currentDarkOutlineBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              withCanvasBypass(() => {
                const context = batch.context;
                context.save(); context.lineWidth = 2;
                try {
                  for (let i = 0; i < commands.length; i += 4) {
                    context.strokeStyle = commands[i + 3] === 0 ? 'rgba(255,210,63,.6)' : 'rgba(255,46,147,.85)';
                    context.beginPath(); context.arc(commands[i], commands[i + 1], commands[i + 2], 0, 6.28); context.stroke();
                  }
                } finally { context.restore(); }
              });
            } catch (error) { currentDarkOutlineBatch.error = error; }
          },
          draw_dark_overlay_batch(pointer) {
            if (!currentDarkOverlayBatch || currentDarkOverlayBatch.error) return;
            try {
              const batch = currentDarkOverlayBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, 8);
              const [sx, sy, angle, rc, rf, rl, blackout, fireFlash] = commands;
              if (state.directReady && state.direct && state.direct.drawDarkOverlay) {
                try {
                  const directDrawn = withCanvasBypass(() => state.direct.drawDarkOverlay(batch.darkContext, batch.screenContext,
                    batch.overlay, batch.lamps.core, batch.lamps.far, batch.lamps.flash, commands));
                  if (directDrawn === true) { state.directDarkOverlayCalls++; state.darkOverlayCommands++; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.darkContext;
                context.globalCompositeOperation = 'source-over'; context.clearRect(0, 0, 960, 600);
                context.fillStyle = blackout ? 'rgba(2,0,10,.95)' : 'rgba(3,0,12,.88)'; context.fillRect(0, 0, 960, 600);
                context.globalCompositeOperation = 'destination-out';
                context.drawImage(batch.lamps.core, sx - rc, sy - rc, rc * 2, rc * 2);
                context.save(); context.beginPath(); context.moveTo(sx, sy); context.arc(sx, sy, rf, angle - .38, angle + .38); context.closePath(); context.clip();
                context.drawImage(batch.lamps.far, sx - rf, sy - rf, rf * 2, rf * 2); context.restore();
                if (fireFlash) context.drawImage(batch.lamps.flash, sx - rl, sy - rl, rl * 2, rl * 2);
                batch.screenContext.drawImage(batch.overlay, 0, 0, 960, 600);
                state.darkOverlayCommands++;
              });
            } catch (error) { currentDarkOverlayBatch.error = error; }
          },
          draw_fx_batch(pointer, count) {
            if (!currentFxBatch || currentFxBatch.error) return;
            try {
              const batch = currentFxBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 6);
              if (state.directReady && state.direct && state.direct.drawFx) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawFx(batch.context, commands, batch.muzzleSprite || null));
                  if (directCount === count) { state.directFxCalls++; state.fxCommands += count; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                for (let i = 0; i < commands.length; i += 6) {
                  const x = commands[i], y = commands[i + 1], t = commands[i + 2], radius = commands[i + 3], angle = commands[i + 4];
                  if (commands[i + 5] >= 0.5) {
                    if (!batch.muzzleSprite) throw new Error('sprite de disparo Rust indisponível');
                    context.save();
                    try {
                      context.globalCompositeOperation = 'lighter'; context.globalAlpha = Math.max(0, t * 10);
                      context.drawImage(batch.muzzleSprite, x - radius, y - radius, radius * 2, radius * 2);
                    } finally { context.restore(); }
                  } else {
                    context.strokeStyle = '#fff'; context.lineWidth = 4; context.beginPath();
                    context.arc(x, y, radius, angle - 1.2, angle + 1.2); context.stroke();
                  }
                }
              });
            } catch (error) { currentFxBatch.error = error; }
          },
          draw_pickup_batch(pointer, count) {
            if (!currentPickupBatch || currentPickupBatch.error) return;
            try {
              const batch = currentPickupBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 5);
              withCanvasBypass(() => {
                const context = batch.context;
                for (let i = 0; i < commands.length; i += 5) {
                  const weapon = batch.weaponNames[commands[i + 3]];
                  context.save();
                  try {
                    context.translate(commands[i], commands[i + 1]); context.rotate(commands[i + 2]); context.translate(-18, 0);
                    if (batch.glow) {
                      const pulse = commands[i + 4];
                      context.fillStyle = 'rgba(255,210,63,' + (.18 + .14 * pulse) + ')'; context.beginPath(); context.arc(18, 0, 18, 0, 6.28); context.fill();
                      context.fillStyle = 'rgba(255,255,255,' + (.08 * pulse) + ')'; context.beginPath(); context.arc(18, 0, 10, 0, 6.28); context.fill();
                    } else {
                      context.fillStyle = 'rgba(255,210,63,.2)'; context.beginPath(); context.arc(18, 0, 14, 0, 6.28); context.fill();
                    }
                    batch.drawWeaponIcon(context, weapon);
                  } finally { context.restore(); }
                }
              });
            } catch (error) { currentPickupBatch.error = error; }
          },
          draw_throw_batch(pointer, count) {
            if (!currentThrowBatch || currentThrowBatch.error) return;
            try {
              const batch = currentThrowBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              withCanvasBypass(() => {
                for (let i = 0; i < commands.length; i += 4) {
                  const weapon = batch.weaponNames[commands[i + 3]], context = batch.context;
                  context.save();
                  try {
                    context.translate(commands[i], commands[i + 1]); context.rotate(commands[i + 2]); context.translate(-18, 0);
                    batch.drawWeaponIcon(context, weapon);
                  } finally { context.restore(); }
                }
              });
            } catch (error) { currentThrowBatch.error = error; }
          },
          draw_transport_batch(pointer, count) {
            if (!currentTransportBatch || currentTransportBatch.error) return;
            try {
              const batch = currentTransportBatch, context = batch.context;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 8);
              withCanvasBypass(() => {
                for (let i = 0; i < commands.length; i += 8) {
                  const op = commands[i], x = commands[i + 1], y = commands[i + 2], w = commands[i + 3], h = commands[i + 4], variant = commands[i + 5], alpha = commands[i + 6], lineWidth = commands[i + 7];
                  if (op === 0) { context.save(); context.fillStyle = 'rgba(0,0,0,.32)'; context.fillRect(x, y, w, h); }
                  else if (op === 1) { context.drawImage(batch.gradients.stair, x, y, w, h); context.shadowColor = 'transparent'; }
                  else if (op === 2) { context.fillStyle = variant ? '#a9a9c4' : '#7a7a98'; context.fillRect(x, y, w, h); }
                  else if (op === 3) { context.fillStyle = 'rgba(255,255,255,.35)'; context.fillRect(x, y, w, h); }
                  else if (op === 4) { context.fillStyle = '#ffd23f'; context.fillRect(x, y, w, h); }
                  else if (op === 5) { context.drawImage(batch.gradients.elevator, x, y, w, h); context.shadowColor = 'transparent'; }
                  else if (op === 6) { context.drawImage(variant ? batch.gradients.doorRight : batch.gradients.doorLeft, x, y, w, h); }
                  else if (op === 7) { context.fillStyle = '#4b5a6b'; context.fillRect(x, y, w, h); }
                  else if (op === 8) { context.fillStyle = '#0b1218'; context.fillRect(x, y, w, h); }
                  else if (op === 9) {
                    context.fillStyle = variant ? '#7CFF8A' : '#ffb347'; context.beginPath();
                    if (variant) { context.moveTo(x, y + 4); context.lineTo(x + 3, y + 9); context.lineTo(x - 3, y + 9); }
                    else { context.moveTo(x, y + 9); context.lineTo(x + 3, y + 4); context.lineTo(x - 3, y + 4); }
                    context.fill();
                  } else if (op === 10 || op === 11) {
                    context.strokeStyle = '#19f0e6'; context.globalAlpha = alpha; context.lineWidth = lineWidth; context.strokeRect(x, y, w, h);
                    if (op === 11) { context.globalAlpha = 1; context.restore(); }
                  }
                }
              });
            } catch (error) { currentTransportBatch.error = error; }
          },
          draw_transport_gradient_batch(pointer, width, height) {
            if (!currentTransportGradientBatch || currentTransportGradientBatch.error) return;
            try {
              const batch = currentTransportGradientBatch;
              if (width !== batch.canvas.width || height !== batch.canvas.height || !batch.image || batch.image.width !== width || batch.image.height !== height) throw new Error('dimensões inválidas no gradiente do transporte Rust');
              const pixels = new Uint8ClampedArray(wasm.exports.memory.buffer, pointer, width * height * 4);
              if (!state.putCanvasImageData(batch.context, batch.image, pixels, width, height)) withCanvasBypass(() => { batch.image.data.set(pixels); batch.context.putImageData(batch.image, 0, 0); });
            } catch (error) { currentTransportGradientBatch.error = error; }
          },
          draw_exit_batch(pointer, count) {
            if (!currentExitBatch || currentExitBatch.error) return;
            try {
              const batch = currentExitBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 6);
              withCanvasBypass(() => {
                const context = batch.context; let clipSaved = false;
                context.save();
                try {
                  for (let i = 0; i < commands.length; i += 6) {
                    const op = commands[i], x1 = commands[i + 1], y1 = commands[i + 2], x2 = commands[i + 3], y2 = commands[i + 4], width = commands[i + 5];
                    if (op === 0) {
                      if (batch.bloom) { context.shadowColor = batch.cleared ? '#19f0e6' : '#ff2e93'; context.shadowBlur = batch.cleared ? 18 + 10 * batch.pulse : 10; }
                      context.strokeStyle = batch.cleared ? 'rgba(25,240,230,.55)' : 'rgba(255,46,147,.4)'; context.lineWidth = 3;
                      context.strokeRect(x1, y1, x2, y2); context.shadowBlur = 0;
                    } else if (op === 1) { context.save(); clipSaved = true; context.beginPath(); context.rect(x1, y1, x2, y2); context.clip(); }
                    else if (op === 2) {
                      if (!batch.gradientCanvas) throw new Error('gradiente da saída Rust indisponível');
                      const previousAlpha = context.globalAlpha;
                      try {
                        if (batch.cleared) context.globalAlpha = (Number.isFinite(context.globalAlpha) ? context.globalAlpha : 1) * (1 + batch.pulse) / 2;
                        context.drawImage(batch.gradientCanvas, x1, y1, x2 - x1, y2 - y1);
                      } finally { if (batch.cleared) context.globalAlpha = previousAlpha; }
                    } else if (op === 3) {
                      context.strokeStyle = batch.cleared ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.3)'; context.lineWidth = 7;
                      context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
                    } else if (op === 4) { if (clipSaved) { context.restore(); clipSaved = false; } }
                    else if (op === 5) { context.strokeStyle = batch.cleared ? '#19f0e6' : '#ff2e93'; context.globalAlpha = .35; context.lineWidth = width; context.strokeRect(x1, y1, x2, y2); }
                    else if (op === 6) { context.globalAlpha = 1; context.lineWidth = width; context.strokeRect(x1, y1, x2, y2); }
                  }
                } finally { if (clipSaved) context.restore(); context.restore(); }
              });
            } catch (error) { currentExitBatch.error = error; }
          },
          draw_color_grade_batch(pointer, count) {
            if (!currentColorGradeBatch || currentColorGradeBatch.error) return;
            try {
              const batch = currentColorGradeBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 5);
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  for (let i = 0; i < commands.length; i += 5) {
                    const op = commands[i], x = commands[i + 1], y = commands[i + 2], width = commands[i + 3], height = commands[i + 4];
                    if (op === 0) {
                      context.globalCompositeOperation = 'soft-light';
                      context.fillStyle = 'rgba(255, 80, 140, 0.07)';
                      context.fillRect(x, y, width, height);
                    } else if (op === 1) {
                      context.globalCompositeOperation = 'overlay';
                      context.fillStyle = 'rgba(40, 200, 220, 0.04)';
                      context.fillRect(x, y, width, height);
                    } else throw new Error(`color grade Rust desconhecido: ${op}`);
                  }
                } finally { context.restore(); }
              });
            } catch (error) { currentColorGradeBatch.error = error; }
          },
          draw_final_overlay_batch(pointer, count) {
            if (!currentFinalOverlayBatch || currentFinalOverlayBatch.error) return;
            try {
              const batch = currentFinalOverlayBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  for (let i = 0; i < commands.length; i += 4) {
                    const op = commands[i], width = commands[i + 1], height = commands[i + 2], alpha = commands[i + 3];
                    if (op === 0) context.fillStyle = `rgba(8,0,20,${alpha})`;
                    else if (op === 1) context.fillStyle = `rgba(255,46,147,${alpha})`;
                    else throw new Error(`overlay final Rust desconhecido: ${op}`);
                    context.fillRect(0, 0, width, height);
                  }
                } finally { context.restore(); }
              });
            } catch (error) { currentFinalOverlayBatch.error = error; }
          },
          draw_hud_shape_batch(pointer, count) {
            if (!currentHudShapeBatch || currentHudShapeBatch.error) return;
            try {
              const batch = currentHudShapeBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 7);
              const fills = [...(batch.baseColors || ['rgba(0,0,0,.45)', '#ff2e5b', '#ffd23f', '#1a0006', 'rgba(5,0,18,.78)', '#19f0e6', '#ff9ac8', '#19f0e6', 'rgba(0,0,0,.5)', '#ff9ac8', 'rgba(20,0,40,.85)', 'rgba(255,46,147,.35)', '#fff']), ...(batch.colors || [])];
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  for (let i = 0; i < commands.length; i += 7) {
                    const op = commands[i], x = commands[i + 1], y = commands[i + 2], width = commands[i + 3], height = commands[i + 4], colorId = commands[i + 5], lineWidth = commands[i + 6];
                    const color = fills[colorId];
                    if (!color) throw new Error(`cor de forma HUD Rust desconhecida: ${colorId}`);
                    if (op === 0) { context.fillStyle = color; context.fillRect(x, y, width, height); }
                    else if (op === 1) { context.strokeStyle = color; context.lineWidth = lineWidth; context.strokeRect(x, y, width, height); }
                    else if (op === 2) { context.fillStyle = color; context.beginPath(); context.ellipse(x, y, width, height, 0, 0, Math.PI * 2); context.fill(); }
                    else if (op === 3) {
                      context.fillStyle = color; context.beginPath();
                      context.moveTo(x - 11 * width, y - 4); context.lineTo(x + 11 * width, y - 4);
                      context.lineTo(x + 15 * width, y + 14); context.lineTo(x - 15 * width, y + 14);
                      context.closePath(); context.fill();
                    }
                    else if (op === 4) {
                      context.fillStyle = color; context.beginPath();
                      context.moveTo(x - 3 * width, y + height); context.lineTo(x, y);
                      context.lineTo(x + 3 * width, y + height); context.fill();
                    }
                    else if (op === 5) {
                      context.strokeStyle = color; context.lineWidth = lineWidth; context.beginPath();
                      context.arc(x, y, width, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * height); context.stroke();
                    }
                    else if (op === 6) {
                      context.fillStyle = color; context.beginPath(); context.moveTo(x - width, y);
                      context.lineTo(x + width, y); context.lineTo(x, y + height); context.closePath(); context.fill();
                    }
                    else throw new Error(`operação de forma HUD Rust desconhecida: ${op}`);
                  }
                } finally { context.restore(); }
              });
            } catch (error) { currentHudShapeBatch.error = error; }
          },
          draw_invasion_arrow_batch(pointer) {
            try {
              const points = new Float64Array(wasm.exports.memory.buffer, pointer, 6);
              withCanvasBypass(() => {
                const context = currentHudShapeBatch.context;
                context.save();
                try {
                  context.fillStyle = '#ff6bd5'; context.beginPath(); context.moveTo(points[0], points[1]);
                  context.lineTo(points[2], points[3]); context.lineTo(points[4], points[5]); context.closePath(); context.fill();
                } finally { context.restore(); }
              });
            } catch (error) { if (currentHudShapeBatch) currentHudShapeBatch.error = error; }
          },
          draw_radial_sprite_batch(pointer, width, height) {
            if (!currentRadialSpriteBatch || currentRadialSpriteBatch.error) return;
            try {
              const batch = currentRadialSpriteBatch, context = batch.context;
              if (!(width > 0 && height > 0) || width !== batch.canvas.width || height !== batch.canvas.height) throw new Error('dimensões inválidas no sprite radial Rust');
              const pixels = new Uint8ClampedArray(wasm.exports.memory.buffer, pointer, width * height * 4);
              const image = state.createCanvasImageData(context, width, height);
              if (!image || !state.putCanvasImageData(context, image, pixels, width, height)) throw new Error('falha ao aplicar sprite radial RGBA');
            } catch (error) { currentRadialSpriteBatch.error = error; }
          },
          draw_muzzle_sprite_batch(pointer, width, height) {
            if (!currentMuzzleSpriteBatch || currentMuzzleSpriteBatch.error) return;
            try {
              const batch = currentMuzzleSpriteBatch, context = batch.context;
              if (width !== 128 || height !== 128 || width !== batch.canvas.width || height !== batch.canvas.height) throw new Error('dimensões inválidas no sprite de disparo Rust');
              const pixels = new Uint8ClampedArray(wasm.exports.memory.buffer, pointer, width * height * 4);
              const image = state.createCanvasImageData(context, width, height);
              if (!image || !state.putCanvasImageData(context, image, pixels, width, height)) throw new Error('falha ao aplicar sprite de disparo RGBA');
            } catch (error) { currentMuzzleSpriteBatch.error = error; }
          },
          draw_exit_gradient_batch(pointer, width, height) {
            if (!currentExitGradientBatch || currentExitGradientBatch.error) return;
            try {
              const batch = currentExitGradientBatch;
              if (width !== batch.canvas.width || height !== batch.canvas.height || !batch.image || batch.image.width !== width || batch.image.height !== height) throw new Error('dimensões inválidas no gradiente da saída Rust');
              const pixels = new Uint8ClampedArray(wasm.exports.memory.buffer, pointer, width * height * 4);
              if (!state.putCanvasImageData(batch.context, batch.image, pixels, width, height)) throw new Error('falha ao aplicar gradiente RGBA de saída');
            } catch (error) { currentExitGradientBatch.error = error; }
          },
          draw_combo_text_batch(pointer) {
            if (!currentComboTextBatch || currentComboTextBatch.error) return;
            try {
              const batch = currentComboTextBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, 2);
              const pulse = commands[0], label = `${Math.floor(commands[1])}X`;
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.translate(34, 176); context.scale(pulse, pulse);
                  context.font = 'bold 54px Impact, sans-serif'; context.lineWidth = 6; context.strokeStyle = '#1a0006';
                  context.strokeText(label, 0, 0); context.fillStyle = '#ff2e5b'; context.fillText(label, 0, 0);
                  state.comboTextCommands++;
                } finally { context.restore(); }
              });
            } catch (error) { currentComboTextBatch.error = error; }
          },
          draw_hud_image_batch(pointer) {
            if (!currentHudImageBatch || currentHudImageBatch.error) return;
            try {
              const batch = currentHudImageBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, 5);
              const index = commands[0] | 0, image = batch.images[index];
              if (!image || !(image.width > 0 && image.height > 0) || (image.complete !== undefined && (!image.complete || !(image.naturalWidth > 0)))) {
                throw new Error(`imagem HUD Rust indisponível: ${index}`);
              }
              withCanvasBypass(() => batch.context.drawImage(image, commands[1], commands[2], commands[3], commands[4]));
              state.hudImageCommands++;
              if (index === 4) state.weatherLabelCommands++;
            } catch (error) { currentHudImageBatch.error = error; }
          },
          draw_alarm_text_batch(pointer) {
            if (!currentAlarmTextBatch || currentAlarmTextBatch.error) return;
            try {
              const batch = currentAlarmTextBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, 3);
              withCanvasBypass(() => {
                const context = batch.context;
                context.fillStyle = 'rgba(255,60,90,.9)'; context.font = 'bold 14px Orbitron, sans-serif'; context.textAlign = 'center';
                context.fillText('ALARME ATIVO · ' + commands[0].toFixed(0) + ' s', commands[1], commands[2]);
              });
              state.alarmTextCommands++;
            } catch (error) { currentAlarmTextBatch.error = error; }
          },
          draw_hud_text_batch(pointer, count) {
            if (!currentHudTextBatch || currentHudTextBatch.error) return;
            try {
              const batch = currentHudTextBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 5);
              withCanvasBypass(() => {
                const context = batch.context;
                if (batch.raw) {
                  for (let i = 0; i < commands.length; i += 5) {
                    const id = commands[i] | 0, entry = batch.entries[id];
                    if (!entry) throw new Error(`texto HUD Rust sem entrada: ${id}`);
                    context.save();
                    try {
                      context.globalAlpha = commands[i + 4];
                      context.fillStyle = entry.color;
                      context.font = entry.font;
                      context.textAlign = ['left', 'center', 'right'][commands[i + 3] | 0];
                      context.fillText(entry.text, commands[i + 1], commands[i + 2]);
                    } finally { context.restore(); }
                    state.hudTextCommands++;
                  }
                  return;
                }
                const savedAlpha = context ? context.globalAlpha : 1;
                try {
                  for (let i = 0; i < commands.length; i += 5) {
                    const id = commands[i] | 0, x = commands[i + 1], y = commands[i + 2], alignId = commands[i + 3] | 0, alpha = commands[i + 4];
                    const entry = batch.entries[id];
                    if (!entry || typeof entry.text !== 'string' || typeof batch.paint !== 'function') throw new Error(`texto HUD Rust sem painter: ${id}`);
                    if (context) context.globalAlpha = alpha;
                    batch.paint(entry.text, x, y, entry.color, entry.font, ['left', 'center', 'right'][alignId]);
                    state.hudTextCommands++;
                  }
                } finally { if (context) context.globalAlpha = savedAlpha; }
              });
            } catch (error) { currentHudTextBatch.error = error; }
          },
          draw_rain_batch(pointer, count) {
            if (!currentRainBatch || currentRainBatch.error) return;
            try {
              const batch = currentRainBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.strokeStyle = 'rgba(170,210,255,.38)'; context.lineWidth = 1; context.beginPath();
                  for (let i = 0; i < commands.length; i += 4) {
                    context.moveTo(commands[i], commands[i + 1]);
                    context.lineTo(commands[i + 2], commands[i + 3]);
                  }
                  context.stroke();
                  state.rainCommands += count;
                } finally { context.restore(); }
              });
            } catch (error) { currentRainBatch.error = error; }
          },
          draw_weather_motes_batch(pointer, count) {
            if (!currentWeatherMoteBatch || currentWeatherMoteBatch.error) return;
            try {
              const batch = currentWeatherMoteBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.fillStyle = 'rgba(255,230,190,.55)';
                  for (let i = 0; i < commands.length; i += 4) {
                    context.globalAlpha = commands[i + 3];
                    context.fillRect(commands[i], commands[i + 1], commands[i + 2], commands[i + 2]);
                  }
                } finally { context.restore(); }
                state.weatherMoteCommands += count;
              });
            } catch (error) { currentWeatherMoteBatch.error = error; }
          },
          draw_fog_batch(pointer, count, smoke, alpha) {
            if (!currentFogBatch || currentFogBatch.error) return;
            try {
              const batch = currentFogBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 4);
              if (state.directReady && state.direct && state.direct.drawFog) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawFog(batch.context, batch.image, commands, count, alpha, smoke === 1));
                  if (directCount === count) { state.directFogCalls++; state.fogCommands += count; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.globalAlpha = alpha;
                  context.globalCompositeOperation = smoke ? 'source-over' : 'lighter';
                  for (let i = 0; i < commands.length; i += 4) {
                    context.drawImage(batch.image, commands[i], commands[i + 1], commands[i + 2], commands[i + 3]);
                    state.fogCommands++;
                  }
                } finally { context.restore(); }
              });
            } catch (error) { currentFogBatch.error = error; }
          },
          draw_fx_overlay_batch(pointer, count) {
            if (!currentFxOverlayBatch || currentFxOverlayBatch.error) return;
            try {
              const batch = currentFxOverlayBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 6);
              const colors = ['220,235,255', '255,46,147', '255,30,60', '0,0,0', '255,46,91'];
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  for (let i = 0; i < commands.length; i += 6) {
                    const color = colors[commands[i] | 0];
                    if (!color) throw new Error(`cor de overlay de efeito Rust desconhecida: ${commands[i]}`);
                    const alpha = commands[i + 5];
                    context.fillStyle = commands[i] === 3 ? '#000' : `rgba(${color},${alpha})`;
                    context.fillRect(commands[i + 1], commands[i + 2], commands[i + 3], commands[i + 4]);
                    state.fxOverlayCommands++;
                  }
                } finally { context.restore(); }
              });
            } catch (error) { currentFxOverlayBatch.error = error; }
          },
          draw_world_light_batch(pointer, count) {
            if (!currentWorldLightBatch || currentWorldLightBatch.error) return;
            try {
              const batch = currentWorldLightBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 7);
              if (state.directReady && state.direct && state.direct.drawWorldLights) {
                try {
                  const images = batch.lights.map(light => light && light.spr);
                  const directCount = withCanvasBypass(() => state.direct.drawWorldLights(batch.context, commands, images, batch.flashImage || null));
                  if (directCount === count) { state.directWorldLightCalls++; state.worldLightCommands += count; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.globalCompositeOperation = 'lighter';
                  for (let i = 0; i < commands.length; i += 7) {
                    const kind = commands[i] | 0, imageIndex = commands[i + 1] | 0;
                    const x = commands[i + 2], y = commands[i + 3], width = commands[i + 4], height = commands[i + 5], alpha = commands[i + 6];
                    context.globalAlpha = alpha;
                    if (kind === 0) {
                      const light = batch.lights[imageIndex];
                      if (!light || !light.spr) throw new Error(`luz Rust sem sprite: ${imageIndex}`);
                      context.drawImage(light.spr, x, y, width, height);
                    } else if (kind === 1) {
                      if (!batch.flashImage) throw new Error('clarão Rust sem sprite');
                      context.drawImage(batch.flashImage, x, y, width, height);
                    } else if (kind !== 2) throw new Error(`comando de luz Rust desconhecido: ${kind}`);
                    if (kind !== 2) state.worldLightCommands++;
                  }
                } finally { context.restore(); }
                for (let i = 0; i < commands.length; i += 7) {
                  if ((commands[i] | 0) !== 2) continue;
                  context.save();
                  try {
                    context.globalAlpha = commands[i + 6]; context.fillStyle = '#9ad1ff'; context.beginPath();
                    context.ellipse(commands[i + 2], commands[i + 3], commands[i + 4], commands[i + 5], 0, 0, 6.283185307179586);
                    context.fill(); state.worldLightCommands++;
                  } finally { context.restore(); }
                }
              });
            } catch (error) { currentWorldLightBatch.error = error; }
          },
          draw_world_ring_batch(pointer, count) {
            if (!currentWorldRingBatch || currentWorldRingBatch.error) return;
            try {
              const batch = currentWorldRingBatch;
              if (!worldRingOutputView || worldRingOutputView.buffer !== wasm.exports.memory.buffer || worldRingOutputView.byteOffset !== pointer) {
                worldRingOutputView = new Float64Array(wasm.exports.memory.buffer, pointer, 14 * 6);
              }
              const commands = worldRingOutputView;
              if (state.directReady && state.direct && state.direct.drawWorldRings) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawWorldRings(batch.context, commands.subarray(0, count * 6), batch.colors));
                  if (directCount === count) { state.directWorldRingCalls++; state.worldRingCommands += count; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                for (let i = 0; i < count * 6; i += 6) {
                  const color = batch.colors[commands[i + 5] | 0];
                  if (typeof color !== 'string') throw new Error(`cor do anel Rust desconhecida: ${commands[i + 5]}`);
                  context.save();
                  try {
                    context.globalAlpha = commands[i + 4]; context.strokeStyle = color; context.lineWidth = commands[i + 3];
                    context.beginPath(); context.arc(commands[i], commands[i + 1], commands[i + 2], 0, 6.283185307179586); context.stroke();
                    state.worldRingCommands++;
                  } finally { context.restore(); }
                }
              });
            } catch (error) { currentWorldRingBatch.error = error; }
          },
          draw_invasion_zone_batch(pointer) {
            if (!currentInvasionZoneBatch || currentInvasionZoneBatch.error) return;
            try {
              const batch = currentInvasionZoneBatch;
              if (!invasionZoneOutputView || invasionZoneOutputView.buffer !== wasm.exports.memory.buffer || invasionZoneOutputView.byteOffset !== pointer) {
                invasionZoneOutputView = new Float64Array(wasm.exports.memory.buffer, pointer, 6);
              }
              const commands = invasionZoneOutputView;
              if (state.directReady && state.direct && state.direct.drawInvasionZone) {
                try {
                  const directDrawn = withCanvasBypass(() => state.direct.drawInvasionZone(batch.context, commands));
                  if (directDrawn === true) { state.directInvasionZoneCalls++; state.invasionZoneCommands++; return; }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.strokeStyle = `rgba(255,107,213,${commands[3]})`; context.lineWidth = commands[4];
                  context.beginPath(); context.arc(commands[0], commands[1], commands[2], 0, 6.283185307179586); context.stroke();
                  context.fillStyle = `rgba(255,107,213,${commands[5]})`; context.fill();
                  state.invasionZoneCommands++;
                } finally { context.restore(); }
              });
            } catch (error) { currentInvasionZoneBatch.error = error; }
          },
          draw_map_command(opcode, color, x1, y1, x2, y2, lineWidth, alpha) {
            if (!currentMapBatch || currentMapBatch.error) return;
            try {
              const batch = currentMapBatch;
              if (batch.commands) {
                batch.commands.push(opcode, color, x1, y1, x2, y2, lineWidth, alpha);
                state.mapCommands++;
                if (batch.kind === 'decor') state.mapDecorCommands++;
                if (batch.kind === 'breakables') state.breakableCommands++;
                return;
              }
              withCanvasBypass(() => {
                const context = batch.context;
                context.save();
                try {
                  context.globalAlpha = alpha;
                  if (opcode === 1) {
                    context.strokeStyle = '#f4d7ff'; context.lineWidth = lineWidth;
                    context.strokeRect(x1, y1, x2, y2);
                  } else if (opcode === 2) {
                    context.strokeStyle = '#19f0e6'; context.lineWidth = lineWidth;
                    context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
                  } else if (opcode === 3) {
                    context.fillStyle = color === 2 ? 'rgba(5,0,20,.10)' : 'rgba(255,255,255,.035)';
                    context.fillRect(x1, y1, x2, y2);
                  } else if (opcode >= 4 && opcode <= 9 || opcode >= 11 && opcode <= 13) {
                    const fills = { 4: 'rgba(0, 0, 0, 0.4)', 5: '#c8c8d8', 6: '#f0eff8', 7: '#a0a0b5', 8: '#e5e4ef', 9: '#77778d', 11: 'rgba(25,240,230,.18)', 12: '#f4f2ff', 13: '#b5b5c8' };
                    context.fillStyle = fills[opcode]; context.fillRect(x1, y1, x2, y2);
                  } else if (opcode === 10 || opcode === 14) {
                    context.strokeStyle = opcode === 10 ? '#5d5d73' : '#383849'; context.lineWidth = lineWidth;
                    context.strokeRect(x1, y1, x2, y2);
                  } else if (opcode === 15) {
                    const fill = batch.mapColors && batch.mapColors[color];
                    if (fill !== undefined) context.fillStyle = fill;
                    context.fillRect(x1, y1, x2, y2);
                  } else if (opcode === 16) {
                    const stroke = batch.mapColors && batch.mapColors[color];
                    if (stroke !== undefined) context.strokeStyle = stroke;
                    context.lineWidth = lineWidth; context.strokeRect(x1, y1, x2, y2);
                  } else if (opcode === 17) {
                    context.fillStyle = '#07010f'; context.fillRect(x1, y1, x2, y2);
                  } else if (opcode === 18) {
                    context.fillStyle = 'rgba(255,240,230,.08)'; context.fillRect(x1, y1, x2, y2);
                  } else if (opcode === 19) {
                    context.fillStyle = 'rgba(110,225,255,.22)'; context.fillRect(x1, y1, x2, y2);
                  } else if (opcode === 20) {
                    context.strokeStyle = 'rgba(210,255,255,.85)'; context.lineWidth = lineWidth; context.strokeRect(x1, y1, x2, y2);
                  } else if (opcode === 21) {
                    context.strokeStyle = 'rgba(255,255,255,.55)'; context.lineWidth = lineWidth;
                    context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
                  } else if (opcode === 22) {
                    context.strokeStyle = 'rgba(210,250,255,.75)'; context.lineWidth = lineWidth; context.beginPath();
                    context.moveTo(x1 - x2 * 0.45, y1 - y2 * 0.35); context.lineTo(x1 + x2 * 0.2, y1 + y2 * 0.15); context.lineTo(x1 - x2 * 0.1, y1 + y2 * 0.42);
                    context.moveTo(x1 + x2 * 0.42, y1 - y2 * 0.38); context.lineTo(x1 - x2 * 0.05, y1 + y2 * 0.05); context.stroke();
                  } else throw new Error(`operação de mapa desconhecida: ${opcode}`);
                } finally { context.restore(); }
              });
              state.mapCommands++;
              if (batch.kind === 'decor') state.mapDecorCommands++;
              if (batch.kind === 'breakables') state.breakableCommands++;
            } catch (error) { currentMapBatch.error = error; }
          },
          draw_furniture_batch(pointer, count) {
            const targetBatch = currentPlayerBatch || currentWeaponBatch || currentDoorBatch || currentNeonDoorBatch || currentGhostBatch || currentActorBatch || currentFurnitureBatch || currentFloorTextureBatch || currentMapTextureBatch;
            if (!targetBatch || targetBatch.error) return;
            try {
              const batch = targetBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 8);
              let drawnDirect = false;
              if (state.directReady && state.direct && state.direct.drawBatchCommands) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawBatchCommands(batch.context, commands, FURNITURE_COLORS, ACTOR_COLORS, batch));
                  if (Number.isInteger(directCount) && directCount === count) {
                    state.directCommandFrames++;
                    if (batch === currentFurnitureBatch) state.directFurnitureFrames++;
                    if (batch === currentPlayerBatch || batch === currentWeaponBatch || batch === currentGhostBatch || batch === currentActorBatch) state.directActorFrames++;
                    drawnDirect = true;
                  }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              if (!drawnDirect) executeFurnitureCommands(batch, commands);
              if (currentPlayerBatch) state.playerBodyCommands += count;
              else if (currentWeaponBatch) state.weaponCommands += count;
              else if (currentDoorBatch) state.doorCommands += count;
              else if (currentNeonDoorBatch) state.doorCommands += count;
              else if (currentGhostBatch) state.ghostCommands = (state.ghostCommands || 0) + count;
              else if (currentActorBatch) state.playerAuraCommands += count;
              else if (currentFloorTextureBatch) state.floorTextureCommands += count;
              else if (currentMapTextureBatch) state.mapTextureCommands += count;
              else state.furnitureCommands += count;
            } catch (error) { targetBatch.error = error; }
          }
        }
      });
      const flushDirectMapCommands = batch => {
        if (!batch.commands || !batch.commands.length) return;
        if (!state.directReady || !state.direct || !state.direct.drawMapCommands) throw new Error('pintor direto de mapa indisponível');
        const commands = new Float64Array(batch.commands);
        const drawn = withCanvasBypass(() => state.direct.drawMapCommands(batch.context, commands, batch.mapColors || []));
        if (drawn !== commands.length / 8) throw new Error('lote direto de mapa rejeitado');
        state.directMapFrames++;
      };
      wasm = result.instance;
      try {
        const directJsUrl = new URL('../wasm-renderer/pkg/direct/direct_renderer.js', scriptUrl);
        const directWasmUrl = new URL('../wasm-renderer/pkg/direct/direct_renderer_bg.wasm', scriptUrl);
        const directModule = await import(directJsUrl.href);
        await directModule.default(directWasmUrl);
        state.direct = directModule;
        state.directReady = true;
        state.drawEnemyShadowDirect = (context, commands, offset) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawEnemyShadows || !context || !(commands instanceof Float64Array)) return -1;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawEnemyShadows(context, commands, offset, 1));
            if (drawn === 1) state.directEnemyShadowCalls++;
            return drawn;
          } catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
        state.drawGlassBreakTrace = (context, x, y, width, height, commands) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawGlassBreakTrace || !context || !(commands instanceof Float64Array)) return false;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawGlassBreakTrace(context, x, y, width, height, commands));
            if (drawn) state.directGlassTraceCalls++;
            return drawn === true;
          } catch (error) { state.directError = String(error && error.message || error); return false; }
        };
        state.drawExplosionScorch = (context, x, y) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawExplosionScorch || !context) return false;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawExplosionScorch(context, x, y));
            if (drawn) state.directExplosionScorchCalls++;
            return drawn === true;
          } catch (error) { state.directError = String(error && error.message || error); return false; }
        };
        state.drawDebugHud = (context, width, height, showPanel, lines, showErrors, errors) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawDebugHud || !context
            || !Number.isFinite(width) || !Number.isFinite(height) || typeof showPanel !== 'boolean' || typeof showErrors !== 'boolean'
            || !Array.isArray(lines) || !Array.isArray(errors)) return false;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawDebugHud(context, width, height, showPanel, lines, showErrors, errors));
            if (drawn) state.directDebugHudCalls++;
            return drawn === true;
          } catch (error) { state.directError = String(error && error.message || error); return false; }
        };
        state.drawDebugWorld = (context, walls, doors, playerX, playerY, playerRadius, showCollisions, enemies, labels, showAi) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawDebugWorld || !context
            || !(walls instanceof Float64Array) || !(doors instanceof Float64Array) || !(enemies instanceof Float64Array)
            || !Array.isArray(labels) || typeof showCollisions !== 'boolean' || typeof showAi !== 'boolean') return false;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawDebugWorld(context, walls, walls.length / 4,
              doors, doors.length / 4, playerX, playerY, playerRadius, showCollisions,
              enemies, labels, enemies.length / 6, showAi));
            if (drawn) state.directDebugWorldCalls++;
            return drawn === true;
          } catch (error) { state.directError = String(error && error.message || error); return false; }
        };
        if (diagnosticsEnabled) state.drawBatchCommandsDirect = (context, commands, batch) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawBatchCommands || !context || !(commands instanceof Float64Array)) return -1;
          try { return withCanvasBypass(() => state.direct.drawBatchCommands(context, commands, FURNITURE_COLORS, ACTOR_COLORS, batch)); }
          catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
        if (diagnosticsEnabled) state.drawMapCommandsDirect = (context, commands, colors = []) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawMapCommands || !context || !(commands instanceof Float64Array)) return -1;
          try { return withCanvasBypass(() => state.direct.drawMapCommands(context, commands, colors)); }
          catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
        if (diagnosticsEnabled) state.drawDustDirect = (context, commands, alpha) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawDust || !context || !(commands instanceof Float64Array)) return -1;
          try { return withCanvasBypass(() => state.direct.drawDust(context, commands, alpha)); }
          catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
        if (diagnosticsEnabled) state.drawSparksDirect = (context, commands, colors) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawSparks || !context || !(commands instanceof Float64Array) || !Array.isArray(colors)) return -1;
          try { return withCanvasBypass(() => state.direct.drawSparks(context, commands, colors)); }
          catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
        if (diagnosticsEnabled) state.drawBloodDirect = (context, commands, color, isStatic = false) => {
          const method = state.direct && (isStatic ? state.direct.drawStaticBlood : state.direct.drawLiveBlood);
          if (!state.active || !state.directReady || !method || !context || !(commands instanceof Float64Array) || typeof color !== 'string') return -1;
          try { return withCanvasBypass(() => method(context, commands, color)); }
          catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
        if (diagnosticsEnabled) state.drawCorpsesDirect = (context, commands, colors) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawCorpses || !context || !(commands instanceof Float64Array) || !Array.isArray(colors)) return -1;
          try { return withCanvasBypass(() => state.direct.drawCorpses(context, commands, colors)); }
          catch (error) { state.directError = String(error && error.message || error); return -1; }
        };
      } catch (error) {
        state.directError = String(error && error.message || error);
        if (diagnosticsEnabled && !String(error && error.code || '').includes('VM_DYNAMIC_IMPORT_CALLBACK_MISSING')) console.warn('[Cappe WASM] módulo Canvas direto indisponível; camadas antigas seguem ativas.', error);
      }
        if (!wasm.exports.canvas_call || !wasm.exports.canvas_set || !wasm.exports.canvas_calls || !wasm.exports.property_writes || !wasm.exports.draw_visible_enemies || !wasm.exports.enemy_events_ptr || !wasm.exports.enemy_events_count || !wasm.exports.enemy_shadows_ptr || !wasm.exports.enemy_shadows_count || !wasm.exports.enemy_draw_data_ptr || !wasm.exports.enemy_body_ranges_ptr || !wasm.exports.enemy_body_commands_ptr || !wasm.exports.enemy_body_commands_count || !wasm.exports.points_ptr || !wasm.exports.enemy_flags_ptr || !wasm.exports.capacity || !wasm.exports.paint_floor || !wasm.exports.paint_floor_grain || !wasm.exports.paint_floor_grain_rgba || !wasm.exports.floor_tile_pixels_ptr || !wasm.exports.paint_floor_tiles_rgba || !wasm.exports.paint_floor_finish || !wasm.exports.paint_floor_finish_rgba || !wasm.exports.floor_rects || !wasm.exports.floor_batch_capacity || !wasm.exports.paint_map_base || !wasm.exports.paint_map_overlay || !wasm.exports.paint_map_decor || !wasm.exports.paint_map_details || !wasm.exports.paint_map_shadows || !wasm.exports.paint_map_structure || !wasm.exports.map_texture_pixels_ptr || !wasm.exports.map_texture_sheet_pixels_ptr || !wasm.exports.copy_map_texture_sprite || !wasm.exports.paint_map_textures_rgba || !wasm.exports.paint_map_textures || !wasm.exports.draw_breakables || !wasm.exports.breakable_data_ptr || !wasm.exports.draw_furniture || !wasm.exports.furniture_ptr || !wasm.exports.rooms_ptr || !wasm.exports.enemy_sheet_frame || !wasm.exports.player_sheet_frame || !wasm.exports.draw_player_frame || !wasm.exports.player_palette_ptr || !wasm.exports.player_pixels_ptr || !wasm.exports.draw_weapon || !wasm.exports.draw_doors || !wasm.exports.doors_ptr || !wasm.exports.draw_player_aura || !wasm.exports.draw_players || !wasm.exports.player_draw_data_ptr || !wasm.exports.glass_panel_input_ptr || !wasm.exports.glass_shard_input_ptr || !wasm.exports.draw_glass || !wasm.exports.fog_sprite_input_ptr || !wasm.exports.generate_fog_sprite) {
        throw new Error('exports WASM incompletos');
      }

      patchPrototype(window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype);
      patchPrototype(window.OffscreenCanvasRenderingContext2D && OffscreenCanvasRenderingContext2D.prototype);
      patchPrototype(window.CanvasGradient && CanvasGradient.prototype);
      patchPrototype(window.CanvasPattern && CanvasPattern.prototype);
      patchPrototype(window.Path2D && Path2D.prototype);
      state.drawEnemies = (enemies, player, painters, context, enemySheet = null, nowMs = 0) => {
        if (!state.active || enemies.length > wasm.exports.capacity()) return false;
        const memory = wasm.exports.memory.buffer;
        const points = new Float64Array(memory, wasm.exports.points_ptr(), wasm.exports.capacity() * 2);
        const flags = new Uint32Array(memory, wasm.exports.enemy_flags_ptr(), wasm.exports.capacity());
        const drawData = new DataView(memory, wasm.exports.enemy_draw_data_ptr(), wasm.exports.capacity() * 24);
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          points[i * 2] = enemy.x;
          points[i * 2 + 1] = enemy.y;
          flags[i] = (enemy.ko > 0 ? 1 : 0) | (enemy.dstun > 0 ? 2 : 0)
            | (enemy.state === 'SUSPICIOUS' || enemy.state === 'INVESTIGATE' ? 4 : 0)
            | (enemy.state === 'ALERT' || enemy.state === 'CHASE' ? 8 : 0);
          drawData.setFloat64(i * 24, Number.isFinite(enemy.a) ? enemy.a : 0, true);
          drawData.setFloat64(i * 24 + 8, Number.isFinite(enemy.fall) ? enemy.fall : 0, true);
          const color = enemy.type === 'bat' ? 1 : enemy.type === 'shot' ? 2 : 0;
          drawData.setUint32(i * 24 + 16, color, true);
          drawData.setUint32(i * 24 + 20, (enemy.type ? 1 : 0) | (enemy.alert && !enemy.stun ? 2 : 0), true);
        }
        const sheet = enemySheet && enemySheet.complete && enemySheet.naturalWidth > 0 ? enemySheet : null;
        const visible = wasm.exports.draw_visible_enemies(enemies.length, player.x, player.y, sheet ? 1 : 0, nowMs);
        const eventCount = wasm.exports.enemy_events_count();
        const events = new Uint32Array(memory, wasm.exports.enemy_events_ptr(), eventCount * 3);
        const shadowCount = wasm.exports.enemy_shadows_count();
        const shadows = new Float64Array(memory, wasm.exports.enemy_shadows_ptr(), shadowCount * 5);
        const bodyRanges = new Uint32Array(memory, wasm.exports.enemy_body_ranges_ptr(), wasm.exports.capacity() * 2);
        const bodyCommandsLength = wasm.exports.enemy_body_commands_count();
        const bodyCommands = new Float64Array(memory, wasm.exports.enemy_body_commands_ptr(), bodyCommandsLength * 8);
        let shadowIndex = 0;
        for (let i = 0; i < events.length; i += 3) {
          const kind = events[i], index = events[i + 1], value = events[i + 2];
          const enemy = enemies[index];
          if (kind === 1) {
            const alpha = value === 1 ? 0.55 : 1;
            if (context && shadowIndex < shadowCount) {
              const offset = shadowIndex * 5;
              if (!(state.drawEnemyShadowDirect && state.drawEnemyShadowDirect(context, shadows, offset) === 1)) {
                withCanvasBypass(() => {
                  context.save();
                  try {
                    context.globalAlpha = shadows[offset + 4];
                    context.fillStyle = 'rgba(0,0,0,.32)';
                    context.beginPath();
                    context.ellipse(shadows[offset], shadows[offset + 1], shadows[offset + 2], shadows[offset + 3], 0, 0, 6.28);
                    context.fill();
                  } finally { context.restore(); }
                });
              }
            }
            shadowIndex++;
            const rangeStart = bodyRanges[index * 2], rangeLength = bodyRanges[index * 2 + 1];
            if (context && rangeLength) {
              const commands = bodyCommands.subarray(rangeStart * 8, (rangeStart + rangeLength) * 8);
              const enemyTextImages = [];
              if (painters.textImage) {
                try {
                  for (let offset = 0; offset < commands.length; offset += 8) {
                    if ((commands[offset] | 0) === 30) enemyTextImages.push(painters.textImage(enemy, commands[offset + 1] | 0, commands[offset + 2], commands[offset + 3]));
                  }
                } catch (_) { enemyTextImages.length = 0; }
              }
              const batch = { context, enemySheet: sheet, enemyTextImages,
                enemyText: painters.text ? (label, x, y) => painters.text(enemy, label, x, y) : null };
              let drawnDirect = false;
              if (state.directReady && state.direct && state.direct.drawBatchCommands) {
                try {
                  const directCount = withCanvasBypass(() => state.direct.drawBatchCommands(context, commands, FURNITURE_COLORS, ACTOR_COLORS, batch));
                  if (Number.isInteger(directCount) && directCount === rangeLength) {
                    state.directCommandFrames++;
                    state.directActorFrames++;
                    if (batch.enemyText) for (let command = 0; command < commands.length; command += 8) {
                    if ((commands[command] | 0) === 30) { state.enemyTextCommands++; state.directEnemyTextCommands++; }
                    }
                    drawnDirect = true;
                  }
                } catch (error) { state.directError = String(error && error.message || error); }
              }
              if (!drawnDirect) executeFurnitureCommands(batch, commands);
              state.enemyBodyCommands += rangeLength;
            } else painters.body(enemy, alpha, !!context);
          }
          else if (kind === 2) {
            state.stunEffects++;
            const rangeLength = bodyRanges[index * 2 + 1];
            painters.stun(enemy, !!(context && rangeLength), !!(context && rangeLength && painters.text));
          }
          else if (kind === 3) {
            const rangeLength = bodyRanges[index * 2 + 1];
            if (!(context && rangeLength && painters.text)) painters.label(enemy, value);
          }
          else throw new Error(`evento de inimigo desconhecido: ${kind}`);
        }
        if (shadowIndex !== shadowCount) throw new Error(`sombra de inimigo sem evento correspondente: ${shadowIndex}/${shadowCount}`);
        if (context) state.enemyShadowCommands += shadowCount;
        state.enemyCount = enemies.length;
        state.visibleEnemyCount = visible;
        return true;
      };
      state.paintMapBase = (context, fixedMap, width, height) => {
        if (!state.active) return false;
        const batch = { context, error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null, mapColors: [] };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_base(fixedMap ? 1 : 0, width, height); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        return true;
      };
      state.paintMapOverlay = (context, width, height) => {
        if (!state.active) return false;
        const batch = { context, error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null, mapColors: [] };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_overlay(width, height); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        return true;
      };
      state.paintMapDecor = (context, decor) => {
        if (!state.active || decor.length > wasm.exports.capacity()) return false;
        const colors = ['#20a9b0', '#0e6a70', 'rgba(255,255,255,.35)'];
        const view = new DataView(wasm.exports.memory.buffer, wasm.exports.furniture_ptr(), wasm.exports.capacity() * 40);
        let colorIndex = colors.length;
        for (let i = 0; i < decor.length; i++) {
          const item = decor[i], offset = i * 40, rug = item.kind === 'tapete';
          view.setFloat64(offset, item.x, true); view.setFloat64(offset + 8, item.y, true);
          view.setFloat64(offset + 16, item.w, true); view.setFloat64(offset + 24, item.h, true);
          view.setUint32(offset + 32, rug ? 1 : 0, true);
          if (rug) view.setUint32(offset + 36, 0, true);
          else { colors.push(item.c); view.setUint32(offset + 36, colorIndex++, true); }
        }
        const batch = { context, mapColors: colors, kind: 'decor', error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_decor(decor.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        return true;
      };
      state.drawBreakables = (context, breakables, brokenGlass) => {
        const intact = breakables.filter(item => !item.broken);
        const shards = brokenGlass.filter(item => item.t > 0);
        if (!state.active || intact.length + shards.length > wasm.exports.capacity()) return false;
        const data = new Float64Array(wasm.exports.memory.buffer, wasm.exports.breakable_data_ptr(), wasm.exports.capacity() * 5);
        for (let i = 0; i < intact.length; i++) {
          const item = intact[i], offset = i * 5;
          data[offset] = item.x; data[offset + 1] = item.y; data[offset + 2] = item.w; data[offset + 3] = item.h; data[offset + 4] = 1;
        }
        for (let i = 0; i < shards.length; i++) {
          const item = shards[i], offset = (intact.length + i) * 5;
          data[offset] = item.x; data[offset + 1] = item.y; data[offset + 2] = item.w; data[offset + 3] = item.h; data[offset + 4] = item.t;
        }
        const batch = { context, kind: 'breakables', error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null, mapColors: [] };
        currentMapBatch = batch;
        try { wasm.exports.draw_breakables(intact.length, shards.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        return true;
      };
      state.paintFloor = (context, floor, x, y, w, h, random) => {
        if (!state.active || !random || typeof random.getState !== 'function' || typeof random.setState !== 'function') return false;
        const kind = floor.k === 'c' ? 1 : floor.k === 't' ? 2 : floor.k === 'b' ? 3 : 0;
        if (!kind) return false;
        const palette = floor.k === 'b' ? [...floor.c, floor.m, 'rgba(255,255,255,.07)'] : floor.c;
        const batch = { context, palette, error: null };
        currentFloorBatch = batch;
        const seed = random.getState();
        let nextSeed;
        try {
          if (kind === 3) {
            withCanvasBypass(() => { context.save(); context.beginPath(); context.rect(x, y, w, h); context.clip(); });
          }
          nextSeed = wasm.exports.paint_floor(kind, x, y, w, h, floor.k === 't' ? floor.c[3] : 0, seed);
        } finally {
          if (kind === 3) withCanvasBypass(() => context.restore());
          currentFloorBatch = null;
        }
        if (batch.error) throw batch.error;
        random.setState(nextSeed);
        state.floorRects = wasm.exports.floor_rects();
        return true;
      };
      state.drawDust = (context, particles, alpha) => {
        if (!state.active || particles.length > wasm.exports.capacity() || !wasm.exports.draw_dust) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.dust_input_ptr(), particles.length * 3);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], offset = i * 3;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.r;
        }
        const batch = { context, error: null };
        currentDustBatch = batch;
        try { wasm.exports.draw_dust(particles.length, alpha); }
        finally { currentDustBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawSparks = (context, particles, colors) => {
        if (!state.active || particles.length > wasm.exports.capacity() || !wasm.exports.draw_sparks) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.spark_input_ptr(), particles.length * 5);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], offset = i * 5;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.life; input[offset + 3] = p.max;
          input[offset + 4] = colors.indexOf(p.c);
        }
        const batch = { context, colors, error: null };
        currentSparkBatch = batch;
        try { wasm.exports.draw_sparks(particles.length, colors.length); }
        finally { currentSparkBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawLiveBlood = (context, particles, color) => {
        if (!state.active || particles.length > wasm.exports.capacity() || !wasm.exports.draw_live_blood) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.blood_input_ptr(), particles.length * 4);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], offset = i * 4;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.r; input[offset + 3] = p.t;
        }
        const batch = { context, color, error: null };
        currentBloodBatch = batch;
        try { wasm.exports.draw_live_blood(particles.length, 0); }
        finally { currentBloodBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawStaticBlood = (context, particles, color) => {
        if (!state.active || particles.length > wasm.exports.capacity() || !wasm.exports.draw_static_blood) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.blood_input_ptr(), particles.length * 4);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], offset = i * 4;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.r; input[offset + 3] = 1;
        }
        const batch = { context, color, error: null };
        currentBloodBatch = batch;
        try { wasm.exports.draw_static_blood(particles.length); }
        finally { currentBloodBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawCorpses = (context, items, colors) => {
        if (!state.active || items.length > wasm.exports.capacity() || !wasm.exports.draw_corpses) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.corpse_input_ptr(), items.length * 4);
        const colorIds = { gun: 0, bat: 1, shot: 2 };
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 4;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.a; input[offset + 3] = colorIds[item.type] ?? 0;
        }
        const batch = { context, colors, error: null };
        currentCorpseBatch = batch;
        try { wasm.exports.draw_corpses(items.length); }
        finally { currentCorpseBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawBullets = (context, items, mine, foe) => {
        if (!state.active || items.length > wasm.exports.capacity() || !wasm.exports.draw_bullets) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.bullet_input_ptr(), items.length * 3);
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 3;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.mine ? 1 : 0;
        }
        const batch = { context, mine, foe, error: null };
        currentBulletBatch = batch;
        try { wasm.exports.draw_bullets(items.length); }
        finally { currentBulletBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawLayer = (context, image, vx0, vy0, vx1, vy1) => {
        if (!state.active || !image) return false;
        const x1 = Math.min(vx1, image.width), y1 = Math.min(vy1, image.height), width = x1 - vx0, height = y1 - vy0;
        if (width <= 0 || height <= 0) return true;
        if (state.directReady && state.drawCanvasLayer) return state.drawCanvasLayer(context, image, vx0, vy0, width, height, vx0, vy0, width, height, -1);
        if (!wasm.exports.draw_layer) return false;
        const batch = { context, image, error: null };
        currentLayerBatch = batch;
        let drawn;
        try { drawn = wasm.exports.draw_layer(vx0, vy0, vx1, vy1, image.width, image.height); }
        finally { currentLayerBatch = null; }
        if (batch.error) throw batch.error;
        return drawn > 0;
      };
      state.drawShells = (context, particles, cameraX, cameraY) => {
        if (!state.active || particles.length > wasm.exports.capacity() || !wasm.exports.draw_shells) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.shell_input_ptr(), particles.length * 3);
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i], offset = i * 3;
          input[offset] = particle.x; input[offset + 1] = particle.y; input[offset + 2] = particle.r;
        }
        const batch = { context, error: null };
        currentShellBatch = batch;
        try { wasm.exports.draw_shells(particles.length, cameraX, cameraY); }
        finally { currentShellBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawDarkOutlines = (context, enemies, camX, camY, screenW, screenH, zoom) => {
        if (!state.active || enemies.length > wasm.exports.capacity() || !wasm.exports.draw_dark_outlines) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.dark_outline_input_ptr(), enemies.length * 4);
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i], offset = i * 4;
          input[offset] = enemy.x; input[offset + 1] = enemy.y; input[offset + 2] = enemy.dead ? 1 : 0; input[offset + 3] = enemy.ko;
        }
        const batch = { context, error: null };
        currentDarkOutlineBatch = batch;
        try { wasm.exports.draw_dark_outlines(enemies.length, camX, camY, screenW, screenH, zoom); }
        finally { currentDarkOutlineBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawDarkOverlay = (darkContext, screenContext, overlay, lamps, playerX, playerY, camX, camY, screenW, screenH, zoom, angle, blackout, fireFlash) => {
        if (!state.active || !wasm.exports.draw_dark_overlay || !wasm.exports.dark_overlay_input_ptr || !overlay || !lamps || !lamps.core || !lamps.far || !lamps.flash) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.dark_overlay_input_ptr(), 10);
        input.set([playerX, playerY, camX, camY, screenW, screenH, zoom, angle, blackout ? 1 : 0, fireFlash ? 1 : 0]);
        const batch = { darkContext, screenContext, overlay, lamps, error: null };
        currentDarkOverlayBatch = batch;
        let drawn;
        try { drawn = wasm.exports.draw_dark_overlay(); }
        finally { currentDarkOverlayBatch = null; }
        if (batch.error) throw batch.error;
        return drawn > 0;
      };
      state.drawFx = (context, effects) => {
        if (!state.active || !Array.isArray(effects) || effects.length > wasm.exports.capacity() || !wasm.exports.draw_fx) return false;
        if (effects.some(effect => effect && effect.muzzle) && !muzzleSpriteCanvas) {
          if (!wasm.exports.generate_muzzle_sprite) return false;
          const canvas = document.createElement('canvas');
          canvas.width = 128; canvas.height = 128;
          const spriteBatch = { canvas, context: canvas.getContext('2d'), error: null };
          if (!spriteBatch.context) return false;
          currentMuzzleSpriteBatch = spriteBatch;
          let side = 0;
          try { side = wasm.exports.generate_muzzle_sprite(); }
          catch (_) { return false; }
          finally { currentMuzzleSpriteBatch = null; }
          if (spriteBatch.error) return false;
          if (side !== 128) return false;
          muzzleSpriteCanvas = canvas;
        }
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.fx_input_ptr(), effects.length * 6);
        for (let i = 0; i < effects.length; i++) {
          const effect = effects[i], offset = i * 6;
          input[offset] = effect.x; input[offset + 1] = effect.y; input[offset + 2] = effect.t;
          input[offset + 3] = effect.R; input[offset + 4] = effect.a; input[offset + 5] = effect.muzzle ? 1 : 0;
        }
        const batch = { context, muzzleSprite: muzzleSpriteCanvas, error: null };
        currentFxBatch = batch;
        try { wasm.exports.draw_fx(effects.length); }
        finally { currentFxBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawPickups = (context, items, glow, now, drawWeaponIcon) => {
        if (!state.active || items.length > wasm.exports.capacity() || !wasm.exports.draw_pickups || typeof drawWeaponIcon !== 'function') return false;
        const weaponNames = ['punho', 'taco', 'faca', 'smg', 'escopeta', 'rifle', 'pistola', 'revolver', 'uzi', 'cano', 'pe_de_cabra', 'martelo', 'pistola_aut', 'magnum', 'pump', 'dupla', 'carabina', 'sniper', 'lmg', 'katana', 'machado', 'garrafa', 'extintor', 'lanca'];
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.pickup_input_ptr(), items.length * 5);
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 5;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.a;
          input[offset + 3] = Math.max(0, weaponNames.indexOf(item.w));
          input[offset + 4] = .55 + .45 * Math.sin(now / 220 + item.x);
        }
        const batch = { context, glow, weaponNames, drawWeaponIcon, error: null };
        currentPickupBatch = batch;
        try { wasm.exports.draw_pickups(items.length); }
        finally { currentPickupBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawThrows = (context, items, drawWeaponIcon) => {
        if (!state.active || items.length > wasm.exports.capacity() || !wasm.exports.draw_throws || typeof drawWeaponIcon !== 'function') return false;
        const weaponNames = ['punho', 'taco', 'faca', 'smg', 'escopeta', 'rifle', 'pistola', 'revolver', 'uzi', 'cano', 'pe_de_cabra', 'martelo', 'pistola_aut', 'magnum', 'pump', 'dupla', 'carabina', 'sniper', 'lmg', 'katana', 'machado', 'garrafa', 'extintor', 'lanca'];
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.throw_input_ptr(), items.length * 4);
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 4;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.rot;
          input[offset + 3] = Math.max(0, weaponNames.indexOf(item.w));
        }
        const batch = { context, weaponNames, drawWeaponIcon, error: null };
        currentThrowBatch = batch;
        try { wasm.exports.draw_throws(items.length); }
        finally { currentThrowBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawTransport = (context, transport, currentFloor) => {
        if (!state.active || !transport || typeof transport !== 'object' || !wasm.exports.draw_transports || !wasm.exports.generate_transport_gradient ||
            ![transport.x, transport.y, transport.w, transport.h, transport.to, currentFloor].every(Number.isFinite) || transport.w <= 0 || transport.h <= 0 || transport.w > 660 || transport.h > 660) return false;
        let cached = transportGradientCache.get(transport);
        if (!cached) { cached = Object.create(null); transportGradientCache.set(transport, cached); }
        const getGradient = (name, width, height, kind, offsetX = 0, gradientWidth = width) => {
          const prior = cached[name];
          if (prior && prior.width === width && prior.height === height && prior.offsetX === offsetX && prior.gradientWidth === gradientWidth) return prior.canvas;
          if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > 660 || height > 660 || !Number.isFinite(offsetX) || !Number.isFinite(gradientWidth) || gradientWidth <= 0) return null;
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          const gradientContext = canvas.getContext('2d'), image = gradientContext && state.createCanvasImageData(gradientContext, width, height);
          if (!image) return null;
          const gradientBatch = { canvas, context: gradientContext, image, error: null };
          currentTransportGradientBatch = gradientBatch;
          let generated = 0;
          try { generated = wasm.exports.generate_transport_gradient(width, height, kind, offsetX, gradientWidth); }
          catch (_) { return null; }
          finally { currentTransportGradientBatch = null; }
          if (gradientBatch.error || generated !== 1) return null;
          cached[name] = { canvas, width, height, offsetX, gradientWidth };
          return canvas;
        };
        let gradients;
        if (transport.tipo === 'escada') {
          const stair = getGradient('stair', transport.w, transport.h, 0);
          if (!stair) return false;
          gradients = { stair };
        } else {
          const elevator = getGradient('elevator', transport.w, transport.h, 1);
          const doorWidth = transport.w / 2 - 6, doorHeight = transport.h - 16;
          const doorLeft = getGradient('doorLeft', doorWidth, doorHeight, 2, 5, transport.w);
          const doorRight = getGradient('doorRight', doorWidth, doorHeight, 2, transport.w / 2 + 1, transport.w);
          if (!elevator || !doorLeft || !doorRight) return false;
          gradients = { elevator, doorLeft, doorRight };
        }
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.transport_input_ptr(), 6);
        input.set([transport.x, transport.y, transport.w, transport.h, transport.tipo === 'escada' ? 0 : 1, transport.to > currentFloor ? 1 : 0]);
        const batch = { context, gradients, error: null };
        currentTransportBatch = batch;
        try { wasm.exports.draw_transports(1); }
        finally { currentTransportBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawExit = (context, rect, pulse, cleared, bloom) => {
        if (!state.active || !wasm.exports.draw_exit || !wasm.exports.generate_exit_gradient || !Array.isArray(rect) || rect.length < 4 ||
            !rect.slice(0, 4).every(Number.isFinite) || !Number.isInteger(rect[2]) || !Number.isInteger(rect[3]) || rect[2] <= 0 || rect[3] <= 0 || rect[2] > 660 || rect[3] > 660 ||
            !Number.isFinite(pulse) || pulse < 0 || pulse > 1) return false;
        if (!exitGradientCanvas || exitGradientWidth !== rect[2] || exitGradientHeight !== rect[3]) {
          exitGradientCanvas = document.createElement('canvas');
          exitGradientCanvas.width = exitGradientWidth = rect[2]; exitGradientCanvas.height = exitGradientHeight = rect[3];
          exitGradientCleared = null;
          exitGradientContext = exitGradientCanvas.getContext('2d');
          exitGradientImage = exitGradientContext && state.createCanvasImageData(exitGradientContext, rect[2], rect[3]);
          if (!exitGradientImage) { exitGradientCanvas = exitGradientContext = exitGradientImage = null; exitGradientWidth = exitGradientHeight = 0; exitGradientCleared = null; return false; }
        }
        if (exitGradientCleared !== !!cleared) {
          const gradientBatch = { canvas: exitGradientCanvas, context: exitGradientContext, image: exitGradientImage, error: null };
          currentExitGradientBatch = gradientBatch;
          let generated = 0;
          try { generated = wasm.exports.generate_exit_gradient(rect[2], rect[3], cleared ? 1 : 0); }
          catch (_) { return false; }
          finally { currentExitGradientBatch = null; }
          if (gradientBatch.error || generated !== 1) return false;
          exitGradientCleared = !!cleared;
        }
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.exit_input_ptr(), 7);
        input.set([rect[0], rect[1], rect[2], rect[3], pulse, cleared ? 1 : 0, bloom ? 1 : 0]);
        const batch = { context, pulse, cleared, bloom, gradientCanvas: exitGradientCanvas, error: null };
        currentExitBatch = batch;
        try { wasm.exports.draw_exit(); }
        finally { currentExitBatch = null; }
        if (batch.error) return false;
        return true;
      };
      state.drawColorGrade = (context, width, height) => {
        if (!state.active || !wasm.exports.draw_color_grade) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.color_grade_input_ptr(), 2);
        input.set([width, height]);
        const batch = { context, error: null };
        currentColorGradeBatch = batch;
        try { wasm.exports.draw_color_grade(); }
        finally { currentColorGradeBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawFinalOverlays = (context, width, height, fade, flash, flashEnabled) => {
        if (!state.active || !wasm.exports.draw_final_overlays) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.final_overlay_input_ptr(), 5);
        input.set([width, height, fade, flash, flashEnabled ? 1 : 0]);
        const batch = { context, error: null };
        currentFinalOverlayBatch = batch;
        try { wasm.exports.draw_final_overlays(); }
        finally { currentFinalOverlayBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawFrameBackground = (context, width, height) => {
        if (!state.active || !wasm.exports.draw_frame_background || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return false;
        const batch = { context, error: null };
        currentFrameBackground = batch;
        let drawn;
        try { drawn = wasm.exports.draw_frame_background(width, height); }
        finally { currentFrameBackground = null; }
        if (batch.error) throw batch.error;
        return drawn === 1;
      };
      state.setupCanvas = (context, scale, smoothing, quality, force = false) => {
        const qualityId = typeof quality === 'number' ? quality : ({ low: 0, medium: 1, high: 2 })[quality];
        if (!state.active || !wasm.exports.draw_canvas_setup || !Number.isFinite(scale) ||
            ![0, 1].includes(Number(smoothing)) || !Number.isInteger(qualityId) || qualityId < 0 || qualityId > 2) return false;
        if (!force && lastCanvasSetup && lastCanvasSetup.context === context && lastCanvasSetup.scale === scale &&
            lastCanvasSetup.smoothing === !!smoothing && lastCanvasSetup.quality === qualityId) return true;
        const batch = { context, error: null };
        currentCanvasSetup = batch;
        let drawn;
        try { drawn = wasm.exports.draw_canvas_setup(scale, smoothing ? 1 : 0, qualityId); }
        finally { currentCanvasSetup = null; }
        if (batch.error) throw batch.error;
        if (drawn !== 1) return false;
        lastCanvasSetup = { context, scale, smoothing: !!smoothing, quality: qualityId };
        return true;
      };
      state.drawHudShape = (context, stage, width, height, value = 0) => {
        if (!state.active || !wasm.exports.draw_hud_shape) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.hud_shape_input_ptr(), 4);
        input.set([stage, width, height, value]);
        const batch = { context, error: null };
        currentHudShapeBatch = batch;
        try { wasm.exports.draw_hud_shape(); }
        finally { currentHudShapeBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawShopDealer = (context, inputValues) => {
        if (!state.active || !wasm.exports.draw_shop_dealer || !wasm.exports.shop_dealer_input_ptr ||
            !Array.isArray(inputValues) || inputValues.length !== 8 || !inputValues.every(Number.isFinite)) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.shop_dealer_input_ptr(), 8);
        input.set(inputValues);
        const batch = { context, error: null, colors: [
          'rgba(0,0,0,.35)', '#ff5fa2', '#f3c9a0', '#1b1b1b', '#ffffff', '#ffd23f', '#2d0f5c', '#ff2e93', '#ffd23f',
          'rgba(255,255,255,.95)', 'rgba(12,4,28,.92)', '#ffffff'
        ] };
        currentHudShapeBatch = batch;
        let count;
        try { count = wasm.exports.draw_shop_dealer(); }
        finally { currentHudShapeBatch = null; }
        if (batch.error) throw batch.error;
        if (count !== 11 && count !== 12) return false;
        state.dealerCommands += count;
        return true;
      };
      state.drawShopPanel = (context, inputValues, outlineColor) => {
        if (!state.active || !wasm.exports.draw_shop_panel || !wasm.exports.shop_panel_input_ptr ||
            !Array.isArray(inputValues) || inputValues.length !== 7 || !inputValues.every(Number.isFinite) ||
            (inputValues[0] === 1 && typeof outlineColor !== 'string')) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.shop_panel_input_ptr(), 7);
        input.set(inputValues);
        const batch = { context, error: null, colors: [
          'rgba(0,0,0,.35)', '#ff5fa2', '#f3c9a0', '#1b1b1b', '#ffffff', '#ffd23f', '#2d0f5c', '#ff2e93', '#ffd23f',
          'rgba(255,255,255,.95)', 'rgba(12,4,28,.92)', typeof outlineColor === 'string' ? outlineColor : '#fff'
        ] };
        currentHudShapeBatch = batch;
        let count;
        try { count = wasm.exports.draw_shop_panel(); }
        finally { currentHudShapeBatch = null; }
        if (batch.error) throw batch.error;
        if (count !== 2) return false;
        state.dealerCommands += count;
        return true;
      };
      state.createRadialSprite = (canvas, rgb, radius, alpha) => {
        if (!state.active || !wasm.exports.generate_radial_sprite || !wasm.exports.radial_sprite_input_ptr ||
            !canvas || !canvas.getContext || typeof rgb !== 'string' || !Number.isFinite(radius) || radius <= 0 || radius > 330 ||
            !Number.isFinite(alpha) || alpha < 0 || alpha > 1) return false;
        const channels = rgb.split(',').map(Number);
        if (channels.length !== 3 || !channels.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return false;
        const width = Math.ceil(radius * 2);
        canvas.width = width; canvas.height = width;
        const context = canvas.getContext('2d');
        if (!context) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.radial_sprite_input_ptr(), 5);
        input.set([radius, channels[0], channels[1], channels[2], alpha]);
        const batch = { canvas, context, error: null };
        currentRadialSpriteBatch = batch;
        let side;
        try { side = wasm.exports.generate_radial_sprite(); }
        finally { currentRadialSpriteBatch = null; }
        if (batch.error) throw batch.error;
        if (side !== width) return false;
        state.radialSpriteCommands++;
        return true;
      };
      state.createFogSprite = (canvas, rings) => {
        if (!state.active || !wasm.exports.generate_fog_sprite || !wasm.exports.fog_sprite_input_ptr || !canvas || !canvas.getContext ||
            !Array.isArray(rings) || rings.length !== 9 || rings.some(ring => !Array.isArray(ring) || ring.length !== 3 || !ring.every(Number.isFinite))) return false;
        canvas.width = 512; canvas.height = 256;
        const context = canvas.getContext('2d');
        if (!context) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.fog_sprite_input_ptr(), 27);
        for (let i = 0; i < 9; i++) input.set(rings[i], i * 3);
        const batch = { canvas, context, error: null };
        currentRadialSpriteBatch = batch;
        let generated;
        try { generated = wasm.exports.generate_fog_sprite(); }
        finally { currentRadialSpriteBatch = null; }
        if (batch.error) throw batch.error;
        if (generated !== 1) return false;
        state.fogSpriteCommands++;
        return true;
      };
      state.drawBossHealthBar = (context, boss, width, height) => {
        if (!state.active || !wasm.exports.draw_boss_health_bar || !boss || !boss.boss || !Array.isArray(boss.boss.phases) ||
            boss.boss.phases.length > 9 || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 ||
            !Number.isFinite(boss.hp) || !Number.isFinite(boss.hpMax) || boss.hpMax <= 0 || typeof boss.boss.col !== 'string') return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.boss_health_input_ptr(), 12);
        input.fill(0);
        const phaseMarkers = boss.boss.phases.slice(1);
        input[0] = width; input[1] = height; input[2] = Math.max(0, boss.hp / boss.hpMax); input[3] = phaseMarkers.length;
        for (let i = 0; i < phaseMarkers.length; i++) {
          const at = phaseMarkers[i] && phaseMarkers[i].at;
          if (!Number.isFinite(at)) return false;
          input[4 + i] = at;
        }
        const batch = { context, error: null, baseColors: ['rgba(0,0,0,.6)', '#ff2e5b', '#ffd23f', '#1a0006', 'rgba(5,0,18,.78)', '#19f0e6'], colors: [boss.boss.col, 'rgba(255,255,255,.35)', '#000'] };
        currentHudShapeBatch = batch;
        try { wasm.exports.draw_boss_health_bar(); }
        finally { currentHudShapeBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawInvasionArrow = (context, centerX, centerY, angle) => {
        if (!state.active || !wasm.exports.draw_invasion_arrow || !wasm.exports.invasion_arrow_input_ptr ||
            ![centerX, centerY, angle].every(Number.isFinite)) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.invasion_arrow_input_ptr(), 4);
        input.set([centerX, centerY, Math.cos(angle), Math.sin(angle)]);
        const batch = { context, error: null };
        currentHudShapeBatch = batch;
        let vertices;
        try { vertices = wasm.exports.draw_invasion_arrow(); }
        finally { currentHudShapeBatch = null; }
        if (batch.error) throw batch.error;
        state.invasionArrowCommands += vertices;
        return vertices === 3;
      };
      state.drawPauseUi = (context, width, height, hoverIndex) => {
        if (!state.active || !wasm.exports.draw_pause_ui || !wasm.exports.pause_ui_input_ptr ||
            ![width, height, hoverIndex].every(Number.isFinite) || width <= 0 || height <= 0 || ![-1, 0, 1].includes(hoverIndex)) return false;
        new Float64Array(wasm.exports.memory.buffer, wasm.exports.pause_ui_input_ptr(), 3).set([width, height, hoverIndex]);
        const batch = { context, error: null, baseColors: [
          'rgba(0,0,0,.45)', '#ff2e5b', '#ffd23f', '#1a0006', 'rgba(5,0,18,.78)', '#19f0e6',
          '#ff9ac8', '#19f0e6', 'rgba(0,0,0,.5)', '#ff9ac8', 'rgba(20,0,40,.85)', 'rgba(255,46,147,.35)', '#fff'
        ] };
        currentHudShapeBatch = batch;
        let count;
        try { count = wasm.exports.draw_pause_ui(); }
        finally { currentHudShapeBatch = null; }
        if (batch.error) throw batch.error;
        return count === 5;
      };
      state.drawPauseUiDirect = (context, width, height, hoverIndex) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawPauseUi ||
            ![width, height, hoverIndex].every(Number.isFinite) || width <= 0 || height <= 0 || ![-1, 0, 1].includes(hoverIndex)) return false;
        try {
          const drawn = withCanvasBypass(() => state.direct.drawPauseUi(context, width, height, hoverIndex)) === true;
          if (drawn) state.directPauseFrames++;
          return drawn;
        }
        catch (error) { state.directError = String(error && error.message || error); return false; }
      };
      state.drawComboText = (context, combo, nowMs = 0) => {
        if (!state.active || !wasm.exports.draw_combo_text || !wasm.exports.combo_text_input_ptr || !Number.isFinite(combo) || !Number.isFinite(nowMs)) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.combo_text_input_ptr(), 2);
        input.set([combo, nowMs]);
        const batch = { context, error: null };
        currentComboTextBatch = batch;
        let drawn;
        try { drawn = wasm.exports.draw_combo_text(); }
        finally { currentComboTextBatch = null; }
        if (batch.error) throw batch.error;
        return drawn > 0;
      };
      state.drawHudImage = (context, stage, width, height, crt, hasPlayer, images, hasMask = false) => {
        if (!state.active || !wasm.exports.draw_hud_image || !wasm.exports.hud_image_input_ptr || !Array.isArray(images) || images.length < 4) return false;
        const image = stage === 3 ? images[4] : null;
        const inputPointer = wasm.exports.hud_image_input_ptr();
        if (!hudImageInputView || hudImageInputView.buffer !== wasm.exports.memory.buffer || hudImageInputView.byteOffset !== inputPointer) {
          hudImageInputView = new Float64Array(wasm.exports.memory.buffer, inputPointer, 8);
        }
        const input = hudImageInputView;
        input.set([stage, width, height, crt ? 1 : 0, hasPlayer ? 1 : 0, hasMask ? 1 : 0,
          image && image.width || 0, image && image.height || 0]);
        const batch = { context, images, error: null };
        currentHudImageBatch = batch;
        let drawn;
        try { drawn = wasm.exports.draw_hud_image(); }
        finally { currentHudImageBatch = null; }
        if (batch.error) throw batch.error;
        return drawn > 0;
      };
      state.drawAlarmText = (context, seconds, width) => {
        if (!state.active || !wasm.exports.draw_alarm_text || !wasm.exports.alarm_text_input_ptr || !Number.isFinite(seconds) || !Number.isFinite(width)) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.alarm_text_input_ptr(), 2);
        input.set([seconds, width]);
        const batch = { context, error: null };
        currentAlarmTextBatch = batch;
        let drawn;
        try { drawn = wasm.exports.draw_alarm_text(); }
        finally { currentAlarmTextBatch = null; }
        if (batch.error) throw batch.error;
        return drawn > 0;
      };
      state.drawHudTexts = (entries, paint, context = null) => {
        if (!state.active || !wasm.exports.draw_hud_text || !wasm.exports.hud_text_input_ptr || !Array.isArray(entries) || entries.length > 64 || typeof paint !== 'function') return false;
        return drawHudTextEntries(entries, paint, context, false);
      };
      state.drawRawHudTexts = (entries, context) => {
        if (!state.active || !wasm.exports.draw_hud_text || !wasm.exports.hud_text_input_ptr || !Array.isArray(entries) || entries.length > 64 || !context) return false;
        return drawHudTextEntries(entries, null, context, true);
      };
      state.drawCanvasImage = (context, image, x, y) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawCanvasImage || !context
          || !(image instanceof HTMLCanvasElement) || !(image.width > 0) || !(image.height > 0) || !Number.isFinite(x) || !Number.isFinite(y)) return false;
        try {
          const drawn = withCanvasBypass(() => state.direct.drawCanvasImage(context, image, x, y));
          if (drawn) state.directCanvasImageFrames++;
          return drawn;
        } catch (error) { state.directError = String(error && error.message || error); return false; }
      };
      state.drawCanvasLayer = (context, image, sx, sy, sw, sh, dx, dy, dw, dh, alpha = -1) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawCanvasLayer
          || !context || !image || ![sx, sy, sw, sh, dx, dy, dw, dh, alpha].every(Number.isFinite)) return false;
        try {
          const drawn = withCanvasBypass(() => state.direct.drawCanvasLayer(context, image, sx, sy, sw, sh, dx, dy, dw, dh, alpha));
          if (drawn) state.directCanvasLayerCalls++;
          return drawn;
        } catch (error) {
          if (diagnosticsEnabled) console.warn('[Cappe WASM] desenho de camada usou fallback Canvas.', error);
          return false;
        }
      };
      state.drawBloodSplatter = (context, puddleColor, dropColor, blobs, streaks, droplets) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawBloodSplatter || !context
          || typeof puddleColor !== 'string' || typeof dropColor !== 'string'
          || !Array.isArray(blobs) || !Array.isArray(streaks) || !Array.isArray(droplets)) return false;
        try {
          const result = withCanvasBypass(() => state.direct.drawBloodSplatter(context, puddleColor, dropColor,
            Float64Array.from(blobs), Float64Array.from(streaks), Float64Array.from(droplets)));
          if (result) state.directBloodSplatterCalls++;
          return result;
        } catch (error) {
          if (diagnosticsEnabled) console.warn('[Cappe WASM] respingos de sangue usaram fallback Canvas.', error);
          return false;
        }
      };
      state.createCanvasImageData = (context, width, height) => {
        if (!context || !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return null;
        if (state.directReady && state.direct && state.direct.createCanvasImageData) {
          try {
            const image = withCanvasBypass(() => state.direct.createCanvasImageData(context, width, height));
            if (image) { state.directImageDataCreateCalls++; return image; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        try { return withCanvasBypass(() => context.createImageData(width, height)); }
        catch (_) { return null; }
      };
      state.putCanvasImageData = (context, image, pixels, width, height) => {
        if (!context || !image || !(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height * 4) return false;
        if (state.directReady && state.direct && state.direct.putCanvasImageData) {
          try {
            if (withCanvasBypass(() => state.direct.putCanvasImageData(context, image, pixels, width, height))) { state.directImageDataPutCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        try { return withCanvasBypass(() => { image.data.set(pixels); context.putImageData(image, 0, 0); return true; }); }
        catch (_) { return false; }
      };
      state.clearCanvasRect = (context, x, y, width, height) => {
        if (!context || ![x, y, width, height].every(Number.isFinite)) return false;
        if (state.directReady && state.direct && state.direct.clearCanvasRect) {
          try {
            if (withCanvasBypass(() => state.direct.clearCanvasRect(context, x, y, width, height))) { state.directClearRectCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        try { return withCanvasBypass(() => { context.clearRect(x, y, width, height); return true; }); }
        catch (_) { return false; }
      };
      state.setCanvasImageSmoothing = (context, enabled) => {
        if (!context || typeof enabled !== 'boolean') return false;
        if (state.directReady && state.direct && state.direct.setCanvasImageSmoothing) {
          try {
            if (withCanvasBypass(() => state.direct.setCanvasImageSmoothing(context, enabled))) { state.directImageSmoothingCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.createTextImage = (canvas, text, font, color, outlined = false) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.createTextImage
          || !(canvas instanceof HTMLCanvasElement) || typeof text !== 'string' || typeof font !== 'string' || typeof color !== 'string' || typeof outlined !== 'boolean') return false;
        try {
          const created = withCanvasBypass(() => state.direct.createTextImage(canvas, text, font, color, outlined));
          if (created) state.directTextImageFrames++;
          return created;
        } catch (error) { state.directError = String(error && error.message || error); return false; }
      };
      function drawHudTextEntries(entries, paint, context, raw) {
        if (!state.active || !wasm.exports.draw_hud_text || !wasm.exports.hud_text_input_ptr || !Array.isArray(entries) || entries.length > 64) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.hud_text_input_ptr(), entries.length * 5);
        const baseAlpha = context && Number.isFinite(context.globalAlpha) ? context.globalAlpha : 1;
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const alpha = entry && entry.alpha === undefined ? 1 : entry && entry.alpha;
          if (!entry || typeof entry.text !== 'string' || typeof entry.color !== 'string' || typeof entry.font !== 'string' || !Number.isFinite(entry.x) || !Number.isFinite(entry.y) || !['left', 'center', 'right'].includes(entry.align || 'left') || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) return false;
          if (entry.absoluteAlpha !== undefined && typeof entry.absoluteAlpha !== 'boolean') return false;
          input.set([i, entry.x, entry.y, (entry.align || 'left') === 'left' ? 0 : (entry.align === 'center' ? 1 : 2), raw ? (entry.absoluteAlpha ? alpha : baseAlpha * alpha) : alpha], i * 5);
        }
        if (raw && state.directReady && state.direct && state.direct.drawRawHudTexts) {
          try {
            const directCount = withCanvasBypass(() => state.direct.drawRawHudTexts(context, entries));
            if (Number.isInteger(directCount) && directCount === entries.length) {
              state.directHudTextFrames++;
              state.hudTextCommands += directCount;
              return true;
            }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        const batch = { entries, paint, context, raw, error: null };
        currentHudTextBatch = batch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_hud_text(entries.length); }
        finally { currentHudTextBatch = null; }
        if (batch.error) throw batch.error;
        return drawn === entries.length;
      };
      state.drawRain = (context, drops, step = 1) => {
        if (!state.active || !wasm.exports.draw_rain || !wasm.exports.rain_input_ptr || !Array.isArray(drops) || drops.length > 256 || (step !== 1 && step !== 2)) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rain_input_ptr(), drops.length * 3);
        for (let i = 0; i < drops.length; i++) {
          const drop = drops[i];
          if (!drop || !Number.isFinite(drop.x) || !Number.isFinite(drop.y) || !Number.isFinite(drop.l) || drop.l < 0) return false;
          input.set([drop.x, drop.y, drop.l], i * 3);
        }
        if (state.directReady && state.direct && state.direct.drawRain) {
          try {
            const directCount = withCanvasBypass(() => state.direct.drawRain(context, input, drops.length, step));
            if (Number.isInteger(directCount) && directCount >= 0) { state.directRainFrames++; state.rainCommands += directCount; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        const batch = { context, error: null };
        currentRainBatch = batch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_rain(drops.length, step); }
        finally { currentRainBatch = null; }
        if (batch.error) throw batch.error;
        return Number.isInteger(drawn) && drawn >= 0;
      };
      state.drawWeatherMotes = (context, motes, nowMs) => {
        if (!state.active || !wasm.exports.draw_weather_motes || !wasm.exports.weather_mote_input_ptr || !Array.isArray(motes) || motes.length > 128 || !Number.isFinite(nowMs)) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.weather_mote_input_ptr(), motes.length * 4);
        for (let i = 0; i < motes.length; i++) {
          const mote = motes[i];
          if (!mote || !Number.isFinite(mote.x) || !Number.isFinite(mote.y) || !Number.isFinite(mote.r) || mote.r < 0 || !Number.isFinite(mote.p)) return false;
          input.set([mote.x, mote.y, mote.r, mote.p], i * 4);
        }
        if (state.directReady && state.direct && state.direct.drawWeatherMotes) {
          try {
            const directCount = withCanvasBypass(() => state.direct.drawWeatherMotes(context, input, motes.length, nowMs));
            if (Number.isInteger(directCount) && directCount >= 0) { state.directWeatherMoteFrames++; state.weatherMoteCommands += directCount; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        const batch = { context, error: null };
        currentWeatherMoteBatch = batch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_weather_motes(motes.length, nowMs); }
        finally { currentWeatherMoteBatch = null; }
        if (batch.error) throw batch.error;
        return Number.isInteger(drawn) && drawn >= 0;
      };
      state.drawFog = (context, image, nowMs, smoke, perfTier = 0) => {
        if (!state.active || !wasm.exports.draw_fog || !wasm.exports.fog_input_ptr || !image || !(image.width > 0) || !(image.height > 0)
          || !Number.isFinite(nowMs) || typeof smoke !== 'boolean' || !Number.isFinite(perfTier) || perfTier < 0) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.fog_input_ptr(), 3);
        input.set([nowMs, smoke ? 1 : 0, perfTier]);
        const batch = { context, image, error: null };
        currentFogBatch = batch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_fog(); }
        finally { currentFogBatch = null; }
        if (batch.error) throw batch.error;
        return Number.isInteger(drawn) && drawn >= 0;
      };
      state.drawFxOverlays = (context, stage, width, height, nowMs = 0, primary = 0, secondary = 0, enabled = true) => {
        if (!state.active || !wasm.exports.draw_fx_overlays || !wasm.exports.fx_overlay_input_ptr
          || ![stage, width, height, nowMs, primary, secondary].every(Number.isFinite)
          || !Number.isInteger(stage) || stage < 0 || stage > 3 || width <= 0 || height <= 0
          || typeof enabled !== 'boolean' || primary < 0 || secondary < 0
          || (stage === 0 && (primary > 1 || secondary > 1))) return false;
        if (state.directReady && state.direct && state.direct.drawFxOverlays) {
          try {
            const directCount = withCanvasBypass(() => state.direct.drawFxOverlays(context, stage, width, height, nowMs, primary, secondary, enabled));
            if (Number.isInteger(directCount) && directCount >= 0) { state.directFxOverlayFrames++; state.fxOverlayCommands += directCount; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.fx_overlay_input_ptr(), 7);
        input.set([stage, width, height, nowMs, primary, secondary, enabled ? 1 : 0]);
        const batch = { context, error: null };
        currentFxOverlayBatch = batch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_fx_overlays(); }
        finally { currentFxOverlayBatch = null; }
        if (batch.error) throw batch.error;
        return Number.isInteger(drawn) && drawn >= 0;
      };
      state.drawWorldLights = (context, lights, nowMs, dim, neon, stride, playerX, playerY, fireFlash, rainReflection, flashImage) => {
        if (!state.active || !wasm.exports.draw_world_lights || !wasm.exports.world_light_meta_ptr || !wasm.exports.world_light_input_ptr
          || !Array.isArray(lights) || lights.length > 6 || !Number.isFinite(nowMs) || nowMs < 0
          || !Number.isFinite(dim) || dim < 0 || dim > 1 || typeof neon !== 'boolean' || ![1, 2].includes(stride)
          || !Number.isFinite(playerX) || !Number.isFinite(playerY) || typeof fireFlash !== 'boolean' || typeof rainReflection !== 'boolean'
          || (fireFlash && !flashImage)) return false;
        let expected = (fireFlash ? 1 : 0) + (rainReflection ? 1 : 0);
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.world_light_input_ptr(), lights.length * 5);
        for (let i = 0; i < lights.length; i++) {
          const light = lights[i];
          if (!light || !Number.isFinite(light.x) || !Number.isFinite(light.y) || !Number.isFinite(light.r) || light.r <= 0 || !Number.isFinite(light.p) || typeof light.on !== 'boolean') return false;
          input.set([light.x, light.y, light.r, light.p, light.on ? 1 : 0], i * 5);
          if (light.on && i % stride === 0) expected++;
        }
        const meta = new Float64Array(wasm.exports.memory.buffer, wasm.exports.world_light_meta_ptr(), 8);
        meta.set([nowMs, dim, neon ? 1 : 0, stride, playerX, playerY, fireFlash ? 1 : 0, rainReflection ? 1 : 0]);
        const batch = { context, lights, flashImage, error: null };
        currentWorldLightBatch = batch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_world_lights(lights.length); }
        finally { currentWorldLightBatch = null; }
        if (batch.error) throw batch.error;
        return drawn === expected;
      };
      state.drawWorldRings = (context, rings) => {
        if (!state.active || !wasm.exports.draw_world_rings || !wasm.exports.world_ring_input_ptr
          || !Array.isArray(rings) || rings.length > 14) return false;
        const colors = worldRingColors;
        colors.length = 0;
        for (const ring of rings) {
          if (!ring || !Number.isFinite(ring.x) || !Number.isFinite(ring.y) || !Number.isFinite(ring.R)
            || !Number.isFinite(ring.t) || !Number.isFinite(ring.T) || typeof ring.c !== 'string') return false;
          if (ring.t <= 0) continue;
          if (!colors.includes(ring.c)) colors.push(ring.c);
        }
        if (!colors.length) return true;
        const inputPointer = wasm.exports.world_ring_input_ptr();
        if (!worldRingInputView || worldRingInputView.buffer !== wasm.exports.memory.buffer || worldRingInputView.byteOffset !== inputPointer) {
          worldRingInputView = new Float64Array(wasm.exports.memory.buffer, inputPointer, 14 * 6);
        }
        const input = worldRingInputView;
        let count = 0;
        for (const ring of rings) {
          if (ring.t <= 0) continue;
          const offset = count++ * 6;
          input[offset] = ring.x; input[offset + 1] = ring.y; input[offset + 2] = ring.R;
          input[offset + 3] = ring.t; input[offset + 4] = ring.T; input[offset + 5] = colors.indexOf(ring.c);
        }
        worldRingBatch.context = context; worldRingBatch.error = null;
        currentWorldRingBatch = worldRingBatch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_world_rings(count, colors.length); }
        finally { currentWorldRingBatch = null; worldRingBatch.context = null; }
        if (worldRingBatch.error) throw worldRingBatch.error;
        return drawn === count;
      };
      state.drawInvasionZone = (context, x, y, nowMs) => {
        if (!state.active || !wasm.exports.draw_invasion_zone || !wasm.exports.invasion_zone_input_ptr
          || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(nowMs) || nowMs < 0) return false;
        const pointer = wasm.exports.invasion_zone_input_ptr();
        if (!invasionZoneInputView || invasionZoneInputView.buffer !== wasm.exports.memory.buffer || invasionZoneInputView.byteOffset !== pointer) {
          invasionZoneInputView = new Float64Array(wasm.exports.memory.buffer, pointer, 3);
        }
        invasionZoneInputView[0] = x; invasionZoneInputView[1] = y; invasionZoneInputView[2] = nowMs;
        invasionZoneBatch.context = context; invasionZoneBatch.error = null;
        currentInvasionZoneBatch = invasionZoneBatch;
        let drawn = 0;
        try { drawn = wasm.exports.draw_invasion_zone(); }
        finally { currentInvasionZoneBatch = null; invasionZoneBatch.context = null; }
        if (invasionZoneBatch.error) throw invasionZoneBatch.error;
        return drawn === 1;
      };
      state.paintFloorGrain = (context, width, height, random) => {
        if (!context) return false;
        if (!state.active || !wasm.exports.paint_floor_grain_rgba || !random || typeof random.getState !== 'function' || typeof random.setState !== 'function' ||
            !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > 1440 || height > 900) { floorGrainRasterReady.delete(context); return false; }
        let cached = floorGrainImageCache.get(context);
        if (!cached || cached.width !== width || cached.height !== height) {
          const image = state.createCanvasImageData(context, width, height);
          if (!image) { floorGrainRasterReady.delete(context); return false; }
          cached = { image, width, height };
          floorGrainImageCache.set(context, cached);
        }
        const batch = { context, image: cached.image, width, height, error: null };
        currentFloorPixelBatch = batch;
        const before = wasm.exports.floor_rects();
        let nextSeed;
        try { nextSeed = wasm.exports.paint_floor_grain_rgba(width, height, random.getState()); }
        finally { currentFloorPixelBatch = null; }
        if (batch.error) { floorGrainRasterReady.delete(context); throw batch.error; }
        random.setState(nextSeed);
        floorGrainRasterReady.add(context);
        state.floorRects = wasm.exports.floor_rects();
        state.floorFinishCommands += state.floorRects - before;
        return true;
      };
      state.paintFloorTiles = (context, rooms, tileIndex, tileImage) => {
        const grain = context && floorGrainImageCache.get(context);
        const useCanvasFallback = () => { if (context) floorGrainRasterReady.delete(context); return false; };
        if (!state.active || !context || !floorGrainRasterReady.has(context) || !grain || !wasm.exports.paint_floor_tiles_rgba || !wasm.exports.floor_tile_pixels_ptr ||
            !tileImage || !tileImage.complete || tileImage.naturalWidth !== 72 || tileImage.naturalHeight !== 24 || !Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex > 2 ||
            rooms.length > wasm.exports.capacity()) return useCanvasFallback();
        let sourcePixels;
        try {
          const source = document.createElement('canvas'); source.width = 72; source.height = 24;
          const sourceContext = source.getContext('2d');
          if (!sourceContext) return useCanvasFallback();
          withCanvasBypass(() => { sourceContext.drawImage(tileImage, 0, 0); sourcePixels = sourceContext.getImageData(0, 0, 72, 24).data; });
        } catch (_) { return useCanvasFallback(); }
        const tileInput = new Uint8Array(wasm.exports.memory.buffer, wasm.exports.floor_tile_pixels_ptr(), 72 * 24 * 4);
        tileInput.set(sourcePixels);
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i], offset = i * 4;
          input[offset] = room.x; input[offset + 1] = room.y; input[offset + 2] = room.w; input[offset + 3] = room.h;
        }
        const hallIndex = rooms.hall ? rooms.indexOf(rooms.hall) : -1;
        const batch = { context, image: grain.image, width: grain.width, height: grain.height, error: null };
        currentFloorPixelBatch = batch;
        let drawnRooms;
        try { drawnRooms = wasm.exports.paint_floor_tiles_rgba(rooms.length, hallIndex, tileIndex, grain.width, grain.height); }
        finally { currentFloorPixelBatch = null; }
        if (batch.error) { useCanvasFallback(); throw batch.error; }
        if (drawnRooms === -1 || drawnRooms === 0xffffffff) return useCanvasFallback();
        state.floorTextureCommands += drawnRooms;
        return true;
      };
      state.paintFloorFinish = (context, solids, width, height) => {
        const grain = context && floorGrainImageCache.get(context);
        if (!state.active || !context || !floorGrainRasterReady.has(context) || !grain || grain.width !== width || grain.height !== height || !wasm.exports.paint_floor_finish_rgba || solids.length > wasm.exports.capacity()) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < solids.length; i++) {
          const rect = solids[i], offset = i * 4;
          input[offset] = rect[0]; input[offset + 1] = rect[1]; input[offset + 2] = rect[2]; input[offset + 3] = rect[3];
        }
        const batch = { context, image: grain.image, width: grain.width, height: grain.height, error: null };
        currentFloorPixelBatch = batch;
        let drawnRects;
        try { drawnRects = wasm.exports.paint_floor_finish_rgba(solids.length, width, height); }
        finally { currentFloorPixelBatch = null; }
        if (batch.error) throw batch.error;
        if (drawnRects === -1 || drawnRects === 0xffffffff) return false;
        state.floorRects = wasm.exports.floor_rects();
        state.floorFinishCommands += drawnRects;
        return true;
      };
      state.paintMapDetails = (context, rooms, width, height, random) => {
        if (!state.active || rooms.length > wasm.exports.capacity() || !random || typeof random.getState !== 'function' || typeof random.setState !== 'function') return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i];
          input[i * 4] = room.px !== undefined ? room.px : room.x;
          input[i * 4 + 1] = room.py !== undefined ? room.py : room.y;
          input[i * 4 + 2] = room.pw !== undefined ? room.pw : room.w;
          input[i * 4 + 3] = room.ph !== undefined ? room.ph : room.h;
        }
        const batch = { context, error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null, mapColors: [] };
        currentMapBatch = batch;
        let nextSeed;
        try { nextSeed = wasm.exports.paint_map_details(rooms.length, width, height, random.getState()); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        random.setState(nextSeed);
        return true;
      };
      state.paintMapShadows = (context, walls, furniture) => {
        if (!state.active || walls.length + furniture.length > wasm.exports.capacity()) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < walls.length + furniture.length; i++) {
          const rect = i < walls.length ? walls[i] : furniture[i - walls.length];
          const offset = i * 4;
          input[offset] = Array.isArray(rect) ? rect[0] : rect.x;
          input[offset + 1] = Array.isArray(rect) ? rect[1] : rect.y;
          input[offset + 2] = Array.isArray(rect) ? rect[2] : rect.w;
          input[offset + 3] = Array.isArray(rect) ? rect[3] : rect.h;
        }
        const batch = { context, error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null, mapColors: [] };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_shadows(walls.length, furniture.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        return true;
      };
      state.paintMapStructure = (context, walls, posts) => {
        if (!state.active || walls.length + posts.length > wasm.exports.capacity()) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < walls.length; i++) {
          const wall = walls[i], offset = i * 4;
          input[offset] = wall[0]; input[offset + 1] = wall[1]; input[offset + 2] = wall[2]; input[offset + 3] = wall[3];
        }
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i], offset = (walls.length + i) * 4;
          input[offset] = post[0]; input[offset + 1] = post[1]; input[offset + 2] = 0; input[offset + 3] = 0;
        }
        const batch = { context, error: null, commands: state.directReady && state.direct && state.direct.drawMapCommands ? [] : null, mapColors: [] };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_structure(walls.length, posts.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        flushDirectMapCommands(batch);
        return true;
      };
      const paintMapTexturesRgba = (context, solids, openings, mapTextures, across) => {
        const canvas = context && context.canvas;
        if (!context || !canvas || !mapTextures || !Number.isInteger(canvas.width) || !Number.isInteger(canvas.height) ||
            canvas.width <= 0 || canvas.height <= 0 || canvas.width > 1440 || canvas.height > 900 ||
            solids.length > wasm.exports.capacity() || openings.length > wasm.exports.capacity() || !Number.isFinite(across) || across <= 0) return null;
        const wallSource = mapTextures.wallSheet || mapTextures.wallFace;
        const furnitureSheet = mapTextures.furnitureSheet;
        const furnitureReady = !!furnitureSheet || !!(mapTextures.furnitureFaces && mapTextures.furnitureFaces.length >= 6);
        const furnitureSources = furnitureSheet ? null : (furnitureReady ? mapTextures.furnitureFaces.slice(0, 6) : [null, null, null, null, null, null]);
        const doorSource = mapTextures.doorSheet || mapTextures.doorOpen;
        const wallReady = !!wallSource, doorReady = !!doorSource;
        const sourceReady = source => !source || (Number.isInteger(source.naturalWidth || source.width) && Number.isInteger(source.naturalHeight || source.height));
        if (!sourceReady(wallSource) || !sourceReady(furnitureSheet) || !sourceReady(doorSource) || (furnitureSources && !furnitureSources.every(sourceReady))) return null;
        try {
          const texturePixels = new Uint8Array(wasm.exports.memory.buffer, wasm.exports.map_texture_pixels_ptr(), 8 * 24 * 24 * 4);
          const sheetPixels = new Uint8Array(wasm.exports.memory.buffer, wasm.exports.map_texture_sheet_pixels_ptr(), 144 * 24 * 4);
          const uploadedSheets = new WeakSet();
          texturePixels.fill(0);
          const readPixels = source => {
            let cached = mapTextureSourcePixelCache.get(source);
            if (cached) return cached;
            const width = source.naturalWidth || source.width, height = source.naturalHeight || source.height;
            if (width < 24 || width > 144 || height < 24 || height > 24) return null;
            let sourceContext = typeof source.getContext === 'function' ? source.getContext('2d') : null;
            if (!sourceContext) {
              const scratch = document.createElement('canvas'); scratch.width = width; scratch.height = height;
              sourceContext = scratch.getContext('2d');
              if (!sourceContext) return null;
              withCanvasBypass(() => sourceContext.drawImage(source, 0, 0));
            }
            let data;
            withCanvasBypass(() => { data = sourceContext.getImageData(0, 0, width, height).data; });
            cached = { width, height, data };
            mapTextureSourcePixelCache.set(source, cached);
            return cached;
          };
          const copySheetCrop = (source, slot, sourceX = 0, sourceY = 0) => {
            if (!source) return true;
            const pixels = readPixels(source);
            if (!pixels) return false;
            const isSheet = pixels.width !== 24 || pixels.height !== 24 || sourceX !== 0 || sourceY !== 0;
            if (!isSheet) {
              texturePixels.set(pixels.data, slot * 24 * 24 * 4);
              return true;
            }
            if (pixels.width > 24 || pixels.height > 24) {
              if (!uploadedSheets.has(source)) { sheetPixels.fill(0); sheetPixels.set(pixels.data); uploadedSheets.add(source); }
              return wasm.exports.copy_map_texture_sprite(slot, pixels.width, pixels.height, sourceX, sourceY) === 1;
            }
            return false;
          };
          if (!copySheetCrop(wallSource, 0)) return null;
          if (furnitureSheet) {
            for (let index = 0; index < 6; index++) if (!copySheetCrop(furnitureSheet, index + 1, index * 24, 0)) return null;
          } else if (furnitureSources) {
            for (let index = 0; index < 6; index++) if (!copySheetCrop(furnitureSources[index], index + 1)) return null;
          }
          if (!copySheetCrop(doorSource, 7, mapTextures.doorSheet ? 24 : 0, 0)) return null;
        } catch (_) { return null; }
        let layer = mapTextureImageCache.get(context);
        if (!layer || layer.width !== canvas.width || layer.height !== canvas.height) {
          try {
            const image = state.createCanvasImageData(context, canvas.width, canvas.height);
            if (!image) return null;
            layer = { image, width: canvas.width, height: canvas.height };
            mapTextureImageCache.set(context, layer);
          } catch (_) { return null; }
        }
        const solidInput = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < solids.length; i++) {
          const rect = solids[i], offset = i * 4;
          solidInput[offset] = rect[0]; solidInput[offset + 1] = rect[1]; solidInput[offset + 2] = rect[2]; solidInput[offset + 3] = rect[3];
        }
        const openingInput = new Float64Array(wasm.exports.memory.buffer, wasm.exports.breakable_data_ptr(), wasm.exports.capacity() * 5);
        for (let i = 0; i < openings.length; i++) {
          const rect = openings[i], offset = i * 5;
          openingInput[offset] = rect[0]; openingInput[offset + 1] = rect[1]; openingInput[offset + 2] = rect[2]; openingInput[offset + 3] = rect[3]; openingInput[offset + 4] = 0;
        }
        const batch = { context, image: layer.image, width: layer.width, height: layer.height, error: null };
        currentFloorPixelBatch = batch;
        let placements;
        try {
          placements = wasm.exports.paint_map_textures_rgba(solids.length, openings.length, wallReady ? 1 : 0,
            furnitureReady ? 1 : 0, doorReady ? 1 : 0, across, canvas.width, canvas.height);
        } finally { currentFloorPixelBatch = null; }
        if (batch.error) { throw batch.error; }
        if (placements === -1 || placements === 0xffffffff) return null;
        state.mapTextureCommands += placements;
        return true;
      };
      state.paintMapTextures = (context, solids, openings, mapTextures, across) => {
        if (!state.active || solids.length > wasm.exports.capacity() || openings.length > wasm.exports.capacity()) return false;
        const rasterized = paintMapTexturesRgba(context, solids, openings, mapTextures, across);
        if (rasterized !== null) return rasterized;
        if (mapTextures && (mapTextures.wallSheet || mapTextures.furnitureSheet || mapTextures.doorSheet)) return false;
        const solidInput = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < solids.length; i++) {
          const rect = solids[i], offset = i * 4;
          solidInput[offset] = rect[0]; solidInput[offset + 1] = rect[1]; solidInput[offset + 2] = rect[2]; solidInput[offset + 3] = rect[3];
        }
        const openingInput = new Float64Array(wasm.exports.memory.buffer, wasm.exports.breakable_data_ptr(), wasm.exports.capacity() * 5);
        for (let i = 0; i < openings.length; i++) {
          const rect = openings[i], offset = i * 5;
          openingInput[offset] = rect[0]; openingInput[offset + 1] = rect[1]; openingInput[offset + 2] = rect[2]; openingInput[offset + 3] = rect[3]; openingInput[offset + 4] = 0;
        }
        const batch = { context, mapTextures, error: null };
        currentMapTextureBatch = batch;
        try {
          wasm.exports.paint_map_textures(solids.length, openings.length, mapTextures.wallFace ? 1 : 0,
            mapTextures.furnitureFaces ? 1 : 0, mapTextures.doorOpen ? 1 : 0, across);
        } finally { currentMapTextureBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawFurniture = (context, furniture) => {
        if (!state.active || furniture.length > wasm.exports.capacity()) return false;
        const pointer = wasm.exports.furniture_ptr();
        const view = new DataView(wasm.exports.memory.buffer, pointer, wasm.exports.capacity() * 40);
        const kinds = { bed: 1, banco: 2, mesa: 3, balcao: 4, vaso: 5, pia: 6, banheira: 7, planta: 8, sofa: 9, mesaR: 10, felt: 11, arcade: 12, sinuca: 13, poltrona: 14, palco: 15, poco: 16, caixa: 17 };
        for (let i = 0; i < furniture.length; i++) {
          const item = furniture[i], offset = i * 40;
          view.setFloat64(offset, item.x, true); view.setFloat64(offset + 8, item.y, true);
          view.setFloat64(offset + 16, item.w, true); view.setFloat64(offset + 24, item.h, true);
          view.setUint32(offset + 32, kinds[item.kind] || 0, true); view.setUint32(offset + 36, item.c >>> 0, true);
        }
        const batch = { context, error: null };
        currentFurnitureBatch = batch;
        try { wasm.exports.draw_furniture(furniture.length); }
        finally { currentFurnitureBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawWorldBarrels = (context, barrels, nowMs) => {
        if (!state.active || !Array.isArray(barrels) || barrels.length > 16 || !Number.isFinite(nowMs) || nowMs < 0) return false;
        if (!barrels.length) return true;
        const pointer = wasm.exports.world_barrel_input_ptr();
        if (worldBarrelInputView === null || worldBarrelInputView.buffer !== wasm.exports.memory.buffer || worldBarrelInputView.byteOffset !== pointer) {
          worldBarrelInputView = new Float64Array(wasm.exports.memory.buffer, pointer, 16 * 4);
        }
        for (let i = 0; i < barrels.length; i++) {
          const barrel = barrels[i], offset = i * 4;
          if (!barrel || !Number.isFinite(barrel.x) || !Number.isFinite(barrel.y) || !Number.isFinite(barrel.r) || barrel.r <= 0 || !Number.isFinite(barrel.t)) return false;
          worldBarrelInputView[offset] = barrel.x; worldBarrelInputView[offset + 1] = barrel.y;
          worldBarrelInputView[offset + 2] = barrel.r; worldBarrelInputView[offset + 3] = barrel.t;
        }
        worldBarrelBatch.context = context; worldBarrelBatch.error = null;
        currentFurnitureBatch = worldBarrelBatch;
        try { wasm.exports.draw_world_barrels(barrels.length, nowMs); }
        finally { currentFurnitureBatch = null; worldBarrelBatch.context = null; }
        if (worldBarrelBatch.error) throw worldBarrelBatch.error;
        state.worldBarrelCommands += barrels.length;
        return true;
      };
      state.drawWorldCameras = (context, cameras, alarmActive) => {
        if (!state.active || !Array.isArray(cameras) || cameras.length > 8) return false;
        if (!cameras.length) return true;
        const pointer = wasm.exports.world_camera_input_ptr();
        if (worldCameraInputView === null || worldCameraInputView.buffer !== wasm.exports.memory.buffer || worldCameraInputView.byteOffset !== pointer) {
          worldCameraInputView = new Float64Array(wasm.exports.memory.buffer, pointer, 8 * 30);
        }
        for (let i = 0; i < cameras.length; i++) {
          const camera = cameras[i], offset = i * 30;
          if (!camera || !Number.isFinite(camera.x) || !Number.isFinite(camera.y) || !Number.isFinite(camera.a) || !camera.poly || camera.poly.length < 26) return false;
          worldCameraInputView[offset] = camera.x; worldCameraInputView[offset + 1] = camera.y;
          worldCameraInputView[offset + 2] = camera.a; worldCameraInputView[offset + 3] = camera.hot > 0 || alarmActive ? 1 : 0;
          for (let point = 0; point < 26; point++) {
            if (!Number.isFinite(camera.poly[point])) return false;
            worldCameraInputView[offset + 4 + point] = camera.poly[point];
          }
        }
        worldCameraBatch.context = context; worldCameraBatch.error = null;
        currentFurnitureBatch = worldCameraBatch;
        try { wasm.exports.draw_world_cameras(cameras.length); }
        finally { currentFurnitureBatch = null; worldCameraBatch.context = null; }
        if (worldCameraBatch.error) throw worldCameraBatch.error;
        state.worldCameraCommands += cameras.length;
        return true;
      };
      state.drawWorldEnemyAccents = (context, enemies, nowMs, playerX, playerY, baseAlpha = 1) => {
        if (!state.active || !Array.isArray(enemies) || enemies.length > 256 || !Number.isFinite(nowMs) || nowMs < 0 ||
            !Number.isFinite(playerX) || !Number.isFinite(playerY) || !Number.isFinite(baseAlpha) || baseAlpha < 0 || baseAlpha > 1) return false;
        const pointer = wasm.exports.world_enemy_input_ptr();
        if (worldEnemyInputView === null || worldEnemyInputView.buffer !== wasm.exports.memory.buffer || worldEnemyInputView.byteOffset !== pointer) {
          worldEnemyInputView = new Float64Array(wasm.exports.memory.buffer, pointer, 256 * 13);
        }
        worldEnemyColors.length = 2;
        const paletteIndex = color => {
          let index = worldEnemyColors.indexOf(color);
          if (index < 0) { index = worldEnemyColors.length; worldEnemyColors.push(color); }
          return index;
        };
        let count = 0;
        for (const enemy of enemies) {
          if (!enemy || !enemy.cls || enemy.ko > 0 || Math.abs(enemy.x - playerX) >= 900 || Math.abs(enemy.y - playerY) >= 700) continue;
          const definition = window.EXP && window.EXP.CLS && window.EXP.CLS[enemy.cls];
          if (!definition || !definition.col) continue;
          if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.y) || !Number.isFinite(enemy.r) || enemy.r <= 0) return false;
          const offset = count * 13, boss = enemy.cls === 'boss', color = paletteIndex(definition.col);
          const bossColor = paletteIndex(boss && enemy.boss && enemy.boss.col || definition.col);
          const kind = enemy.cls === 'blindado' ? 1 : enemy.cls === 'lider' ? 2 : boss ? 3 : 0;
          worldEnemyInputView[offset] = enemy.x; worldEnemyInputView[offset + 1] = enemy.y; worldEnemyInputView[offset + 2] = enemy.r;
          worldEnemyInputView[offset + 3] = kind; worldEnemyInputView[offset + 4] = Number.isFinite(enemy.hp) ? enemy.hp : 0;
          worldEnemyInputView[offset + 5] = Number.isFinite(enemy.a) ? enemy.a : 0;
          worldEnemyInputView[offset + 6] = Number.isFinite(enemy.tele) ? enemy.tele : 0;
          worldEnemyInputView[offset + 7] = enemy.sniper ? 1 : 0; worldEnemyInputView[offset + 8] = enemy.chS === 1 ? 1 : 0;
          worldEnemyInputView[offset + 9] = Number.isFinite(enemy.chA) ? enemy.chA : 0;
          worldEnemyInputView[offset + 10] = color; worldEnemyInputView[offset + 11] = bossColor; worldEnemyInputView[offset + 12] = baseAlpha;
          count++;
        }
        if (!count) return true;
        worldEnemyBatch.context = context; worldEnemyBatch.error = null;
        currentFurnitureBatch = worldEnemyBatch;
        try { wasm.exports.draw_world_enemy_accents(count, nowMs); }
        finally { currentFurnitureBatch = null; worldEnemyBatch.context = null; }
        if (worldEnemyBatch.error) throw worldEnemyBatch.error;
        state.worldEnemyAccentCommands += count;
        return true;
      };
      state.drawFrameTransforms = (context, stage, screenShake, screenPower, screenRx, screenRy, kickX, kickY, shake, shakeScale, shakeRx, shakeRy, width, height, zoom, cameraX, cameraY) => {
        if (stage !== 0 && stage !== 1 && stage !== 2 && stage !== 3 && stage !== 4) return false;
        if (!state.active) return false;
        if ((stage === 0 || stage === 1) && (!Number.isFinite(screenShake) || screenShake < 0 || !Number.isFinite(screenPower) || screenPower < 0 ||
            !Number.isFinite(screenRx) || screenRx < 0 || screenRx > 1 || !Number.isFinite(screenRy) || screenRy < 0 || screenRy > 1 ||
            !Number.isFinite(kickX) || !Number.isFinite(kickY) || !Number.isFinite(shake) || shake < 0 ||
            !Number.isFinite(shakeScale) || shakeScale < 0 || !Number.isFinite(shakeRx) || shakeRx < 0 || shakeRx > 1 ||
            !Number.isFinite(shakeRy) || shakeRy < 0 || shakeRy > 1)) return false;
        if (stage === 2 && (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0 ||
            !Number.isFinite(zoom) || zoom <= 0 || !Number.isFinite(cameraX) || !Number.isFinite(cameraY))) return false;
        const pointer = wasm.exports.frame_transform_input_ptr();
        if (frameTransformInputView === null || frameTransformInputView.buffer !== wasm.exports.memory.buffer || frameTransformInputView.byteOffset !== pointer || frameTransformInputView.length !== 15) {
          frameTransformInputView = new Float64Array(wasm.exports.memory.buffer, pointer, 15);
        }
        frameTransformInputView[0] = screenShake; frameTransformInputView[1] = screenPower;
        frameTransformInputView[2] = screenRx; frameTransformInputView[3] = screenRy;
        frameTransformInputView[4] = kickX; frameTransformInputView[5] = kickY;
        frameTransformInputView[6] = shake; frameTransformInputView[7] = shakeScale;
        frameTransformInputView[8] = shakeRx; frameTransformInputView[9] = shakeRy;
        frameTransformInputView[10] = width || 0; frameTransformInputView[11] = height || 0;
        frameTransformInputView[12] = zoom || 0; frameTransformInputView[13] = cameraX || 0; frameTransformInputView[14] = cameraY || 0;
        frameTransformBatch.context = context; frameTransformBatch.error = null;
        currentFurnitureBatch = frameTransformBatch;
        let emitted;
        try { emitted = wasm.exports.draw_frame_transforms(stage); }
        finally { currentFurnitureBatch = null; frameTransformBatch.context = null; }
        if (frameTransformBatch.error) throw frameTransformBatch.error;
        state.frameTransformCommands += emitted;
        return emitted > 0 || stage === 0 && screenShake === 0;
      };
      state.drawGlass = (context, panels, shards, nowMs, baseAlpha) => {
        if (!state.active || panels.length > 96 || shards.length > 160 || !Number.isFinite(nowMs) || nowMs < 0 ||
            !Number.isFinite(baseAlpha) || baseAlpha < 0 || baseAlpha > 1) return false;
        const panelPointer = wasm.exports.glass_panel_input_ptr(), shardPointer = wasm.exports.glass_shard_input_ptr();
        if (glassPanelInputView === null || glassPanelInputView.buffer !== wasm.exports.memory.buffer || glassPanelInputView.byteOffset !== panelPointer) {
          glassPanelInputView = new Float64Array(wasm.exports.memory.buffer, panelPointer, 96 * 4);
        }
        if (glassShardInputView === null || glassShardInputView.buffer !== wasm.exports.memory.buffer || glassShardInputView.byteOffset !== shardPointer) {
          glassShardInputView = new Float64Array(wasm.exports.memory.buffer, shardPointer, 160 * 7);
        }
        for (let i = 0; i < panels.length; i++) {
          const p = panels[i], o = i * 4;
          glassPanelInputView[o] = p.x; glassPanelInputView[o + 1] = p.y; glassPanelInputView[o + 2] = p.w; glassPanelInputView[o + 3] = p.h;
        }
        let shardCount = 0;
        for (const p of shards) if (p.on) {
          const o = shardCount * 7;
          glassShardInputView[o] = p.x; glassShardInputView[o + 1] = p.y; glassShardInputView[o + 2] = p.rot;
          glassShardInputView[o + 3] = p.life; glassShardInputView[o + 4] = p.max; glassShardInputView[o + 5] = p.s; glassShardInputView[o + 6] = p.c;
          shardCount++;
        }
        glassBatch.context = context; glassBatch.error = null; glassBatch.colors = FURNITURE_COLORS;
        currentFurnitureBatch = glassBatch;
        let emitted;
        try { emitted = wasm.exports.draw_glass(panels.length, shardCount, nowMs, baseAlpha); }
        finally { currentFurnitureBatch = null; glassBatch.context = null; }
        if (glassBatch.error) throw glassBatch.error;
        state.glassCommands += emitted;
        return emitted === panels.length + shardCount;
      };
      state.drawWeapon = (context, weapon) => {
        if (!state.active) return false;
        const ids = { punho: 0, taco: 1, faca: 2, smg: 3, escopeta: 4, rifle: 5, pistola: 6, revolver: 7,
          uzi: 8, cano: 9, pe_de_cabra: 10, martelo: 11, pistola_aut: 12, magnum: 13, pump: 14, dupla: 15,
          carabina: 16, sniper: 17, lmg: 18, katana: 19, machado: 20, garrafa: 21, extintor: 22, lanca: 23 };
        const batch = { context, error: null };
        currentWeaponBatch = batch;
        let commands;
        try { commands = wasm.exports.draw_weapon(ids[weapon] ?? 24); }
        finally { currentWeaponBatch = null; }
        if (batch.error) throw batch.error;
        if (!commands && weapon !== 'punho') return false;
        return true;
      };
      state.drawDoors = (context, doors, doorImage) => {
        if (!state.active || doors.length > wasm.exports.capacity()) return false;
        const pointer = wasm.exports.doors_ptr();
        const view = new DataView(wasm.exports.memory.buffer, pointer, wasm.exports.capacity() * 48);
        for (let i = 0; i < doors.length; i++) {
          const door = doors[i], offset = i * 48;
          view.setFloat64(offset, door.x, true); view.setFloat64(offset + 8, door.y, true);
          view.setFloat64(offset + 16, door.w, true); view.setFloat64(offset + 24, door.h, true);
          view.setFloat64(offset + 32, door.th || 0, true);
          view.setUint32(offset + 40, door.vert ? 1 : 0, true); view.setUint32(offset + 44, doorImage ? 1 : 0, true);
        }
        const batch = { context, doorImage, error: null };
        currentDoorBatch = batch;
        try { wasm.exports.draw_doors(doors.length); }
        finally { currentDoorBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawNeonDoors = (context, doors) => {
        if (!state.active || doors.length > wasm.exports.capacity() || !wasm.exports.neon_doors_ptr || !wasm.exports.draw_neon_doors) return false;
        const pointer = wasm.exports.neon_doors_ptr();
        const view = new DataView(wasm.exports.memory.buffer, pointer, wasm.exports.capacity() * 56);
        const spriteImages = [], spriteIndices = new Map();
        for (let i = 0; i < doors.length; i++) {
          const door = doors[i], offset = i * 56;
          let spriteIndex = spriteIndices.get(door.spriteKey);
          if (spriteIndex === undefined) {
            spriteIndex = spriteImages.length;
            spriteIndices.set(door.spriteKey, spriteIndex);
            spriteImages.push(door.image);
          }
          view.setFloat64(offset, door.px, true); view.setFloat64(offset + 8, door.py, true);
          view.setFloat64(offset + 16, door.baseAngle, true); view.setFloat64(offset + 24, door.swingAngle, true);
          view.setFloat64(offset + 32, door.ox, true); view.setFloat64(offset + 40, door.oy, true);
          view.setUint32(offset + 48, spriteIndex, true); view.setUint32(offset + 52, 0, true);
        }
        const batch = { context, spriteImages, error: null };
        currentNeonDoorBatch = batch;
        try { wasm.exports.draw_neon_doors(doors.length); }
        finally { currentNeonDoorBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawPlayerAura = (context, isP2, shadowsEnabled, glowEnabled) => {
        if (!state.active) return false;
        const batch = { context, error: null };
        currentActorBatch = batch;
        try { wasm.exports.draw_player_aura(isP2 ? 1 : 0, shadowsEnabled ? 1 : 0, glowEnabled ? 1 : 0); }
        finally { currentActorBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawPlayers = (players, context, playerSheet) => {
        if (!state.active || players.length > 3) return false;
        const memory = wasm.exports.memory.buffer;
        const view = new DataView(memory, wasm.exports.player_draw_data_ptr(), players.length * 56);
        const states = { idle: 0, walk: 1, run: 2, attack: 3 };
        const weapons = { punho: 0, taco: 1, faca: 2, smg: 3, escopeta: 4, rifle: 5, pistola: 6, revolver: 7,
          uzi: 8, cano: 9, pe_de_cabra: 10, martelo: 11, pistola_aut: 12, magnum: 13, pump: 14, dupla: 15,
          carabina: 16, sniper: 17, lmg: 18, katana: 19, machado: 20, garrafa: 21, extintor: 22, lanca: 23 };
        const sheet = playerSheet && playerSheet.complete && playerSheet.naturalWidth > 0 ? playerSheet : null;
        const skinColors = [], playerIsP2 = [];
        for (let i = 0; i < players.length; i++) {
          const player = players[i], offset = i * 56;
          view.setFloat64(offset, Number.isFinite(player.x) ? player.x : 0, true);
          view.setFloat64(offset + 8, Number.isFinite(player.y) ? player.y : 0, true);
          view.setFloat64(offset + 16, Number.isFinite(player.angle) ? player.angle : 0, true);
          view.setFloat64(offset + 24, Number.isFinite(player.animation) ? player.animation : 0, true);
          view.setFloat64(offset + 32, Number.isFinite(player.attack) ? player.attack : 0, true);
          view.setUint32(offset + 40, states[player.state] ?? 0, true);
          const flags = (player.isP2 ? 1 : 0) | (player.shadows ? 2 : 0) | (player.glow ? 4 : 0)
            | (sheet && player.skin ? 8 : 0);
          view.setUint32(offset + 44, flags, true);
          view.setUint32(offset + 48, weapons[player.weapon] ?? (player.weapon === 'punho' ? 0 : 24), true);
          view.setUint32(offset + 52, 0, true);
          skinColors.push(player.skin ? player.skin.color : '#000', player.skin ? player.skin.detail : '#000');
          playerIsP2.push(!!player.isP2);
        }
        const batch = { context, playerSheet: sheet, playerFrames: players.map(player => player.frame), skinColors, playerIsP2, error: null };
        currentPlayerBatch = batch;
        let commandCount;
        try { commandCount = wasm.exports.draw_players(players.length, sheet ? 1 : 0); }
        finally { currentPlayerBatch = null; }
        if (batch.error) throw batch.error;
        if (commandCount > 0) state.playerAuraCommands += players.reduce((total, player) => total + (player.glow ? 10 : 6), 0);
        return commandCount > 0 || players.length === 0;
      };
      state.drawGhosts = (ghosts, context, weaponName) => {
        if (!state.active || !wasm.exports.draw_ghosts || !wasm.exports.ghost_input_ptr || ghosts.length > 5) return false;
        if (!ghosts.length) return true;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.ghost_input_ptr(), 20);
        for (let i = 0; i < ghosts.length; i++) {
          const ghost = ghosts[i], offset = i * 4;
          input[offset] = ghost.x; input[offset + 1] = ghost.y;
          input[offset + 2] = ghost.a; input[offset + 3] = 0.06 + i * 0.04;
        }
        const weapons = { punho: 0, taco: 1, faca: 2, smg: 3, escopeta: 4, rifle: 5, pistola: 6, revolver: 7,
          uzi: 8, cano: 9, pe_de_cabra: 10, martelo: 11, pistola_aut: 12, magnum: 13, pump: 14, dupla: 15,
          carabina: 16, sniper: 17, lmg: 18, katana: 19, machado: 20, garrafa: 21, extintor: 22, lanca: 23 };
        const batch = { context, weaponName, error: null };
        currentGhostBatch = batch;
        try { wasm.exports.draw_ghosts(ghosts.length, weapons[weaponName] ?? 24); }
        finally { currentGhostBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.drawPlayerFrame = (canvas, drawState, phase, attackFrame, sine, palette) => {
        if (!state.active || palette.length !== 12) return false;
        const memory = wasm.exports.memory.buffer;
        const packed = new Uint32Array(memory, wasm.exports.player_palette_ptr(), 12);
        for (let i = 0; i < palette.length; i++) {
          const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(palette[i]);
          if (!match) return false;
          const hex = match[1].length === 3 ? [...match[1]].map(ch => ch + ch).join('') : match[1];
          packed[i] = parseInt(hex.slice(0, 2), 16) | parseInt(hex.slice(2, 4), 16) << 8 | parseInt(hex.slice(4, 6), 16) << 16 | 0xff000000;
        }
        const states = { idle: 0, walk: 1, run: 2, attack: 3 };
        wasm.exports.draw_player_frame(states[drawState], phase, attackFrame, sine);
        const source = new Uint8ClampedArray(wasm.exports.memory.buffer, wasm.exports.player_pixels_ptr(), 24 * 24 * 4);
        const draw = canvas.getContext('2d'), image = state.createCanvasImageData(draw, 24, 24);
        if (!image || !state.putCanvasImageData(draw, image, source, 24, 24)) return false;
        state.playerFrames++;
        return true;
      };
      state.selectPlayerSprite = (drawState, animation, attackRemaining) => {
        if (!state.active) return null;
        const states = { idle: 0, walk: 1, run: 2, attack: 3 };
        if (states[drawState] === undefined) return null;
        const packed = wasm.exports.player_sheet_frame(states[drawState], animation, attackRemaining);
        return [packed & 0xff, (packed >>> 8) & 0xff];
      };
      state.selectEnemySprite = (moving, nowMs) => {
        if (!state.active) return null;
        const packed = wasm.exports.enemy_sheet_frame(moving ? 1 : 0, nowMs);
        return [packed & 0xff, (packed >>> 8) & 0xff];
      };
      state.active = true;
      state.status = 'ready';
      showStatus();
      console.info('[Cappe WASM] piso, granulado/sombras/rejunte, FTILES (quando o módulo contém a exportação), texturas de mapa, fundo/decor estáticos, vidros quebráveis, geometria de mapa, portas, móveis, armas, atores, acentos visuais de inimigos, chuva, clima, HUD e efeitos da expansão usam Rust/WASM; rasterização e outras camadas ainda estão em migração.');
    } catch (error) {
      state.status = 'fallback';
      console.error('[Cappe WASM] módulo indisponível; usando o caminho Canvas original.', error);
    }
  })();
})();

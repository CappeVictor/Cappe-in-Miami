(() => {
  const enabled = new URLSearchParams(location.search).get('renderer') === 'wasm';
  const diagnosticsEnabled = enabled && new URLSearchParams(location.search).get('wasmDiagnostics') === '1';
  const scriptUrl = document.currentScript ? document.currentScript.src : location.href;
  const patchedPrototypes = new WeakSet();
  const floorGrainImageCache = new WeakMap();
  const mapTextureImageCache = new WeakMap();
  const mapTextureSourcePixelCache = new WeakMap();
  let lastCanvasSetup = null;
  const transportGradientCache = new WeakMap();
  let exitGradientCanvas = null;
  let exitGradientContext = null;
  let exitGradientWidth = 0;
  let exitGradientHeight = 0;
  let exitGradientCleared = null;
  const worldEnemyColors = ['rgba(255,46,91,1)', 'rgba(255,46,91,.7)'];
  const worldBarrelDirectInputBuffer = new Float64Array(16 * 4);
  const worldCameraDirectInputBuffer = new Float64Array(8 * 30);
  const worldEnemyDirectInputBuffer = new Float64Array(256 * 13);
  let pickupInputBuffer = new Float64Array(64);
  let throwInputBuffer = new Float64Array(64);
  let shellInputBuffer = new Float64Array(96);
  let bulletInputBuffer = new Float64Array(96);
  let fxDirectInputBuffer = new Float64Array(96);
  const rainDirectInputBuffer = new Float64Array(256 * 3);
  const weatherMoteDirectInputBuffer = new Float64Array(128 * 4);
  let dustInputBuffer = new Float64Array(96);
  let sparkInputBuffer = new Float64Array(160);
  let bloodInputBuffer = new Float64Array(128);
  let corpseInputBuffer = new Float64Array(128);
  let darkOutlineInputBuffer = new Float64Array(128);
  let mapDecorInputBuffer = new Float64Array(0);
  let mapDetailsInputBuffer = new Float64Array(0);
  let mapShadowInputBuffer = new Float64Array(0);
  let mapStructureInputBuffer = new Float64Array(0);
  let tileWallInputBuffer = new Float64Array(0);
  let mapBreakableInputBuffer = new Float64Array(0);
  let floorTileInputBuffer = new Float64Array(0);
  let floorFinishInputBuffer = new Float64Array(0);
  const frameTransformInput = new Float64Array(15);
  let bypassDepth = 0;
  const worldRingColors = [];
  const worldLightDirectImages = [];
  const worldLightDirectInputBuffer = new Float64Array(6 * 5);
  const worldLightDirectMetaBuffer = new Float64Array(8);
  const worldRingDirectInputBuffer = new Float64Array(14 * 6);
  const state = { enabled, active: false, status: enabled ? 'loading' : 'disabled', directReady: false, directError: null, directEnemyTextCommands: 0, floorRects: 0, floorFinishCommands: 0, floorTextureCommands: 0, mapDecorCommands: 0, mapTextureCommands: 0, breakableCommands: 0, furnitureCommands: 0, doorCommands: 0, playerAuraCommands: 0, playerBodyCommands: 0, ghostCommands: 0, hudTextCommands: 0, hudImageCommands: 0, weatherLabelCommands: 0, alarmTextCommands: 0, rainCommands: 0, weatherMoteCommands: 0, fogCommands: 0, fogSpriteCommands: 0, fxOverlayCommands: 0, worldLightCommands: 0, worldRingCommands: 0, invasionZoneCommands: 0, invasionArrowCommands: 0, worldBarrelCommands: 0, worldCameraCommands: 0, worldEnemyAccentCommands: 0, glassCommands: 0, frameTransformCommands: 0, darkOverlayCommands: 0, comboTextCommands: 0, enemyShadowCommands: 0, enemyBodyCommands: 0, enemyTextCommands: 0, stunEffects: 0, playerFrames: 0, dealerCommands: 0, radialSpriteCommands: 0 };
  state.hostCanvasOperations = 0;
  state.hostCanvasPropertyWrites = 0;
  state.directDustFrames = 0;
  state.directEnemyShadowCalls = 0;
  state.directEnemyBodyFrames = 0;
  state.directGlassTraceCalls = 0;
  state.directExplosionScorchCalls = 0;
  state.directDebugHudCalls = 0;
  state.directDebugWorldCalls = 0;
  state.directFogCalls = 0;
  state.directFogInputCalls = 0;


  state.directWorldLightInputCalls = 0;
  state.directInvasionZoneInputCalls = 0;
  state.directInvasionZoneCalls = 0;
  state.directDarkOverlayCalls = 0;
  state.directDarkOverlayInputCalls = 0;
  state.directFxCalls = 0;
  state.directMapBaseCalls = 0;
  state.directMapOverlayCalls = 0;
  state.directMapDecorCalls = 0;
  state.directMapDetailsCalls = 0;
  state.directMapShadowCalls = 0;
  state.directMapStructureCalls = 0;
  state.directTileWallCalls = 0;
  state.directMapBreakableCalls = 0;
  state.directFloorGrainCalls = 0;
  state.directFloorTileCalls = 0;
  state.directFloorFinishCalls = 0;
  state.forceFloorGrainFallback = false;
  state.forceFloorTilesFallback = false;
  state.forceFurnitureFallback = false;
  state.forcePlayerFrameFallback = false;
  state.directPlayerFrameCalls = 0;
  state.directPlayerBatchCalls = 0;
  state.directGhostFrames = 0;
  state.forceFloorFinishFallback = false;
  state.directFxInputCalls = 0;
  state.directShellCalls = 0;
  state.directShellInputCalls = 0;
  state.directComboTextCalls = 0;
  state.directAlarmTextCalls = 0;
  state.directHudImageCalls = 0;
  state.directBulletCalls = 0;
  state.directBulletInputCalls = 0;
  state.directTransportCalls = 0;
  state.directExitCalls = 0;
  state.directTransportGeometryCalls = 0;
  state.directExitGeometryCalls = 0;
  state.directDustInputCalls = 0;
  state.directSparkInputCalls = 0;
  state.directLiveBloodInputCalls = 0;
  state.directStaticBloodInputCalls = 0;
  state.directCorpseInputCalls = 0;
  state.directDarkOutlineInputCalls = 0;
  state.directPickupCalls = 0;
  state.directThrowCalls = 0;
  state.directPickupInputCalls = 0;
  state.directThrowInputCalls = 0;
  state.directHudShapeCalls = 0;
  state.directInvasionArrowCalls = 0;
  state.directColorGradeCalls = 0;
  state.directFinalOverlayCalls = 0;
  state.directFloorCalls = 0;
  state.directDarkOutlineCalls = 0;
  state.directWeaponIconCalls = 0;
  state.directDoorCalls = 0;
  state.directNeonDoorCalls = 0;
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
  state.directRadialSpriteCalls = 0;
  state.directFogSpriteCalls = 0;
  state.directTransportGradientCalls = 0;
  state.directExitGradientCalls = 0;
  state.directHudTextFrames = 0;
  state.directCanvasImageFrames = 0;
  state.directCanvasImageBatchFrames = 0;
  state.directCanvasLayerCalls = 0;
  state.directImageDataCreateCalls = 0;
  state.directImageDataPutCalls = 0;
  state.directCanvasReadbackCalls = 0;
  state.directFrameTransformCalls = 0;
  state.directPlayerAuraCalls = 0;
  state.directMapTextureRasterCalls = 0;
  state.directMapTextureLastResult = null;
  state.directMapTextureError = null;
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
    if (isSetter) state.hostCanvasPropertyWrites++;
    else state.hostCanvasOperations++;
    if (diagnosticsEnabled) {
      const counts = isSetter ? state.canvasPropertyWriteCounts : state.canvasOperationCounts;
      counts[operationName] = (counts[operationName] || 0) + 1;
      const samples = isSetter ? state.canvasPropertyWriteSamples : state.canvasOperationSamples;
      if (!samples[operationName]) samples[operationName] = new Error(`Canvas ${isSetter ? 'property' : 'method'}: ${operationName}`).stack;
    }
    return isSetter ? original.call(receiver, args[0]) : original.apply(receiver, args);
  }

  function withCanvasBypass(callback) {
    bypassDepth++;
    try { return callback(); }
    finally { bypassDepth--; }
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
      const calls = state.hostCanvasOperations;
      const writes = state.hostCanvasPropertyWrites;
      badge.textContent = `WASM ativo · ${calls.toLocaleString()} chamadas Canvas residuais`;
      badge.title = `Renderer experimental Rust/WASM. Canvas host: ${calls.toLocaleString()} chamadas e ${writes.toLocaleString()} propriedades interceptadas. ${state.floorFinishCommands.toLocaleString()} acabamentos; ${state.floorTextureCommands.toLocaleString()} texturas de piso; ${state.mapTextureCommands.toLocaleString()} texturas de mapa; ${state.furnitureCommands.toLocaleString()} móveis; ${state.doorCommands.toLocaleString()} portas; ${state.enemyBodyCommands.toLocaleString()} comandos de inimigo; ${state.playerBodyCommands.toLocaleString()} de jogador; ${state.hudTextCommands.toLocaleString()} textos HUD; ${state.rainCommands.toLocaleString()} segmentos de chuva; ${state.weatherMoteCommands.toLocaleString()} partículas de ambiente; ${state.enemyShadowCommands.toLocaleString()} sombras; ${state.stunEffects.toLocaleString()} efeitos; ${state.playerFrames.toLocaleString()} sprites.`;
    }, 1000);
  }

  (async () => {
    try {
      if (typeof WebAssembly === 'undefined') throw new Error('WebAssembly não suportado neste navegador');
      try {
        const directJsUrl = new URL('../wasm-renderer/pkg/direct/direct_renderer.js', scriptUrl);
        const directWasmUrl = new URL('../wasm-renderer/pkg/direct/direct_renderer_bg.wasm', scriptUrl);
        const directModule = await import(directJsUrl.href);
        await directModule.default(directWasmUrl);
        state.direct = Object.assign({}, directModule);
        state.directReady = true;
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
        state.drawColorGradeDirect = (context, width, height) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawColorGrade || !context
            || !Number.isFinite(width) || !Number.isFinite(height)) return false;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawColorGrade(context, width, height));
            if (drawn) state.directColorGradeCalls++;
            return drawn === true;
          } catch (error) { state.directError = String(error && error.message || error); return false; }
        };
        state.drawFinalOverlaysDirect = (context, width, height, fade, flash, flashEnabled) => {
          if (!state.active || !state.directReady || !state.direct || !state.direct.drawFinalOverlays || !context
            || ![width, height, fade, flash].every(Number.isFinite) || typeof flashEnabled !== 'boolean') return false;
          try {
            const drawn = withCanvasBypass(() => state.direct.drawFinalOverlays(context, width, height, fade, flash, flashEnabled));
            if (drawn) state.directFinalOverlayCalls++;
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
        if (!String(error && error.code || '').includes('VM_DYNAMIC_IMPORT_CALLBACK_MISSING')) console.warn('[Cappe WASM] módulo Rust/WebSys direto indisponível; o jogo usa o Canvas original.', error);
      }
      if (!state.directReady) throw new Error(state.directError || 'módulo Rust/WebSys direto indisponível');

      if (diagnosticsEnabled) {
        patchPrototype(window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype);
        patchPrototype(window.OffscreenCanvasRenderingContext2D && OffscreenCanvasRenderingContext2D.prototype);
        patchPrototype(window.CanvasGradient && CanvasGradient.prototype);
        patchPrototype(window.CanvasPattern && CanvasPattern.prototype);
        patchPrototype(window.Path2D && Path2D.prototype);
      }
      state.drawEnemies = (enemies, player, painters, context, enemySheet = null, nowMs = 0) => {
        if (!state.active || !Array.isArray(enemies) || enemies.length > 8192 || !player || !context || !painters ||
            typeof painters.textImage !== 'function' || !Number.isFinite(player.x) || !Number.isFinite(player.y) ||
            !Number.isFinite(nowMs) || !state.directReady || !state.direct || !state.direct.drawEnemies) return false;
        const sheet = enemySheet && enemySheet.complete && enemySheet.naturalWidth > 0 ? enemySheet : null;
        const rows = [], textImages = [], textPlacements = [], textOffsets = [0];
        let visibleEnemies = 0, stunCount = 0;
        for (const enemy of enemies) {
          if (!enemy || !Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) return false;
          if (!(Math.abs(enemy.x - player.x) < 900 && Math.abs(enemy.y - player.y) < 700)) continue;
          const angle = Number.isFinite(enemy.a) ? enemy.a : 0;
          const fall = Number.isFinite(enemy.fall) ? enemy.fall : 0;
          const color = enemy.type === 'bat' ? 4 : enemy.type === 'shot' ? 5 : 3;
          const knockout = enemy.ko > 0, stunned = !knockout && enemy.dstun > 0;
          const suspicious = !knockout && (enemy.state === 'SUSPICIOUS' || enemy.state === 'INVESTIGATE');
          const alert = !knockout && !suspicious && (enemy.state === 'ALERT' || enemy.state === 'CHASE');
          const moving = !!(enemy.alert && !enemy.stun);
          const flags = (enemy.type ? 1 : 0) | (knockout ? 2 : 0) | (stunned ? 4 : 0) | (moving ? 8 : 0);
          rows.push(enemy.x, enemy.y, angle, fall, color, flags);
          visibleEnemies++;
          if (stunned) stunCount++;
          const addLabel = (label, yOffset) => {
            const entry = painters.textImage(enemy, label, enemy.x, enemy.y + yOffset);
            if (!entry || !entry.image || !Number.isFinite(entry.x) || !Number.isFinite(entry.y)) return false;
            textPlacements.push(textImages.length, entry.x, entry.y);
            textImages.push(entry.image);
            return true;
          };
          if (knockout) {
            if (!addLabel(1, -24)) return false;
          } else {
            if (stunned && !addLabel(4, -34)) return false;
            if (suspicious && !addLabel(2, -24)) return false;
            else if (alert && !addLabel(3, -24)) return false;
          }
          textOffsets.push(textPlacements.length / 3);
        }
        try {
          const drawn = withCanvasBypass(() => state.direct.drawEnemies(context, Float64Array.from(rows),
            player.x, player.y, sheet || null, nowMs, ACTOR_COLORS, textImages,
            Float64Array.from(textPlacements), Uint32Array.from(textOffsets)));
          if (drawn !== visibleEnemies) return false;
          state.directActorFrames++;
          state.directEnemyBodyFrames++;
          state.enemyCount = enemies.length;
          state.visibleEnemyCount = visibleEnemies;
          state.enemyBodyCommands += visibleEnemies;
          state.enemyShadowCommands += visibleEnemies;
          state.directEnemyShadowCalls += visibleEnemies;
          state.stunEffects += stunCount;
          state.enemyTextCommands += textPlacements.length / 3;
          state.directEnemyTextCommands += textPlacements.length / 3;
          return true;
        } catch (error) { state.directError = String(error && error.message || error); return false; }
      };
      state.paintMapBase = (context, fixedMap, width, height) => {
        if (!state.active) return false;
        if (state.directReady && state.direct && state.direct.paintMapBase) {
          try {
            const drawn = withCanvasBypass(() => state.direct.paintMapBase(context, !!fixedMap, width, height));
            if (drawn) { state.directMapBaseCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.paintMapOverlay = (context, width, height) => {
        if (!state.active) return false;
        if (state.directReady && state.direct && state.direct.paintMapOverlay) {
          try {
            const drawn = withCanvasBypass(() => state.direct.paintMapOverlay(context, width, height));
            if (drawn) { state.directMapOverlayCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.paintMapDecor = (context, decor) => {
        if (!state.active || !Array.isArray(decor) || decor.length > 8192) return false;
        const colors = ['#20a9b0', '#0e6a70', 'rgba(255,255,255,.35)'];
        let colorIndex = colors.length;
        if (mapDecorInputBuffer.length < decor.length * 6) mapDecorInputBuffer = new Float64Array(Math.max(decor.length * 6, mapDecorInputBuffer.length * 2, 96));
        for (let i = 0; i < decor.length; i++) {
          const item = decor[i], offset = i * 6, rug = item.kind === 'tapete';
          mapDecorInputBuffer[offset] = item.x; mapDecorInputBuffer[offset + 1] = item.y;
          mapDecorInputBuffer[offset + 2] = item.w; mapDecorInputBuffer[offset + 3] = item.h;
          mapDecorInputBuffer[offset + 4] = rug ? 1 : 0;
          if (rug) mapDecorInputBuffer[offset + 5] = 0;
          else { colors.push(item.c); mapDecorInputBuffer[offset + 5] = colorIndex++; }
        }
        if (state.directReady && state.direct && state.direct.drawMapDecor) {
          try {
            const count = withCanvasBypass(() => state.direct.drawMapDecor(context, mapDecorInputBuffer.subarray(0, decor.length * 6), colors));
            if (count === decor.length) { state.directMapDecorCalls++; state.mapDecorCommands += count; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawBreakables = (context, breakables, brokenGlass) => {
        const intact = breakables.filter(item => !item.broken);
        const shards = brokenGlass.filter(item => item.t > 0);
        const count = intact.length + shards.length;
        if (!state.active || !context || count > 8192) return false;
        if (mapBreakableInputBuffer.length < count * 5) mapBreakableInputBuffer = new Float64Array(Math.max(count * 5, mapBreakableInputBuffer.length * 2, 80));
        for (let i = 0; i < intact.length; i++) {
          const item = intact[i], offset = i * 5;
          mapBreakableInputBuffer[offset] = item.x; mapBreakableInputBuffer[offset + 1] = item.y;
          mapBreakableInputBuffer[offset + 2] = item.w; mapBreakableInputBuffer[offset + 3] = item.h; mapBreakableInputBuffer[offset + 4] = 1;
        }
        for (let i = 0; i < shards.length; i++) {
          const item = shards[i], offset = (intact.length + i) * 5;
          mapBreakableInputBuffer[offset] = item.x; mapBreakableInputBuffer[offset + 1] = item.y;
          mapBreakableInputBuffer[offset + 2] = item.w; mapBreakableInputBuffer[offset + 3] = item.h; mapBreakableInputBuffer[offset + 4] = item.t;
        }
        if (state.directReady && state.direct && state.direct.drawMapBreakables) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawMapBreakables(context, mapBreakableInputBuffer.subarray(0, count * 5), intact.length, shards.length));
            if (drawn === count) { state.directMapBreakableCalls++; state.breakableCommands += intact.length * 3 + shards.length; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.paintFloor = (context, floor, x, y, w, h, random) => {
        if (!state.active || !random || typeof random.getState !== 'function' || typeof random.setState !== 'function') return false;
        const kind = floor.k === 'c' ? 1 : floor.k === 't' ? 2 : floor.k === 'b' ? 3 : 0;
        if (!kind) return false;
        const palette = floor.k === 'b' ? [...floor.c, floor.m, 'rgba(255,255,255,.07)'] : floor.k === 't' ? floor.c.slice(0, 3) : floor.c;
        if (state.directReady && state.direct && state.direct.paintFloor) {
          try {
            const result = withCanvasBypass(() => {
              if (kind === 3) {
                context.save();
                context.beginPath();
                context.rect(x, y, w, h);
                context.clip();
              }
              try {
                return state.direct.paintFloor(context, kind, x, y, w, h,
                  floor.k === 't' ? floor.c[3] : 0, random.getState(), palette);
              } finally {
                if (kind === 3) context.restore();
              }
            });
            if (result && result.length === 2 && Number.isFinite(result[0]) && Number.isFinite(result[1])) {
              random.setState(result[0] >>> 0);
              state.floorRects += result[1];
              state.directFloorPaintCalls = (state.directFloorPaintCalls || 0) + 1;
              return true;
            }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawDust = (context, particles, alpha) => {
        if (!state.active || !Array.isArray(particles) || particles.length > 8192) return false;
        const inputLength = particles.length * 3;
        if (dustInputBuffer.length < inputLength) dustInputBuffer = new Float64Array(Math.max(inputLength, dustInputBuffer.length * 2));
        const input = dustInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], offset = i * 3;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.r;
        }
        if (state.directReady && state.direct && state.direct.drawDust) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawDust(context, input, alpha));
            if (drawn === particles.length) { state.directDustInputCalls++; state.directDustFrames++; state.directDustCommands += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawSparks = (context, particles, colors, packedInput = null) => {
        if (!state.active || !Array.isArray(particles) || particles.length > 8192 || !Array.isArray(colors)) return false;
        const inputLength = particles.length * 5;
        let input = packedInput;
        if (!(input instanceof Float64Array) || input.length !== inputLength) {
          if (sparkInputBuffer.length < inputLength) sparkInputBuffer = new Float64Array(Math.max(inputLength, sparkInputBuffer.length * 2));
          input = sparkInputBuffer.subarray(0, inputLength);
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i], offset = i * 5;
            input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.life; input[offset + 3] = p.max;
            input[offset + 4] = colors.indexOf(p.c);
          }
        }
        if (state.directReady && state.direct && state.direct.drawSparkInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawSparkInputs(context, input, colors));
            if (Number.isInteger(drawn) && drawn >= 0) { state.directSparkInputCalls++; state.directSparkFrames++; state.directSparkCommands += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawLiveBlood = (context, particles, color) => {
        if (!state.active || !Array.isArray(particles) || particles.length > 8192) return false;
        const inputLength = particles.length * 4;
        if (bloodInputBuffer.length < inputLength) bloodInputBuffer = new Float64Array(Math.max(inputLength, bloodInputBuffer.length * 2));
        const input = bloodInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], offset = i * 4;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.r; input[offset + 3] = p.t;
        }
        if (state.directReady && state.direct && state.direct.drawLiveBlood) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawLiveBlood(context, input, color));
            if (drawn === particles.length) { state.directLiveBloodInputCalls++; state.directBloodFrames++; state.directBloodCommands += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawStaticBlood = (context, particles, color, startIndex = 0) => {
        if (!state.active || !Array.isArray(particles) || !Number.isInteger(startIndex) || startIndex < 0 || startIndex > particles.length) return false;
        const particleCount = particles.length - startIndex;
        if (particleCount > 8192) return false;
        const inputLength = particleCount * 4;
        if (bloodInputBuffer.length < inputLength) bloodInputBuffer = new Float64Array(Math.max(inputLength, bloodInputBuffer.length * 2));
        const input = bloodInputBuffer.subarray(0, inputLength);
        for (let i = startIndex; i < particles.length; i++) {
          const p = particles[i], offset = (i - startIndex) * 4;
          input[offset] = p.x; input[offset + 1] = p.y; input[offset + 2] = p.r; input[offset + 3] = 1;
        }
        if (state.directReady && state.direct && state.direct.drawStaticBlood) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawStaticBlood(context, input, color));
            if (drawn === particleCount) { state.directStaticBloodInputCalls++; state.directStaticBloodFrames++; state.directStaticBloodCommands += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawCorpses = (context, items, colors) => {
        if (!state.active || !Array.isArray(items) || items.length > 8192) return false;
        const inputLength = items.length * 4;
        if (corpseInputBuffer.length < inputLength) corpseInputBuffer = new Float64Array(Math.max(inputLength, corpseInputBuffer.length * 2));
        const input = corpseInputBuffer.subarray(0, inputLength);
        const colorIds = { gun: 0, bat: 1, shot: 2 };
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 4;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.a; input[offset + 3] = colorIds[item.type] ?? 0;
        }
        if (state.directReady && state.direct && state.direct.drawCorpseInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawCorpseInputs(context, input, colors));
            if (Number.isInteger(drawn) && drawn >= 0) { state.directCorpseInputCalls++; state.directCorpseFrames++; state.directCorpseCommands += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawBullets = (context, items, mine, foe) => {
        if (!state.active || !Array.isArray(items) || items.length > 8192) return false;
        const inputLength = items.length * 3;
        if (bulletInputBuffer.length < inputLength) bulletInputBuffer = new Float64Array(Math.max(inputLength, bulletInputBuffer.length * 2));
        const input = bulletInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 3;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.mine ? 1 : 0;
        }
        if (state.directReady && state.direct && state.direct.drawBulletInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawBulletInputs(context, input, mine, foe));
            if (Number.isInteger(drawn) && drawn >= 0) { state.directBulletCalls += drawn; state.directBulletInputCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawLayer = (context, image, vx0, vy0, vx1, vy1) => {
        if (!state.active || !image) return false;
        const x1 = Math.min(vx1, image.width), y1 = Math.min(vy1, image.height), width = x1 - vx0, height = y1 - vy0;
        if (width <= 0 || height <= 0) return true;
        if (state.directReady && state.drawCanvasLayer) return state.drawCanvasLayer(context, image, vx0, vy0, width, height, vx0, vy0, width, height, -1);
        return false;
      };
      state.drawShells = (context, particles, cameraX, cameraY) => {
        if (!state.active || !Array.isArray(particles) || particles.length > 8192) return false;
        const inputLength = particles.length * 3;
        if (shellInputBuffer.length < inputLength) shellInputBuffer = new Float64Array(Math.max(inputLength, shellInputBuffer.length * 2));
        const input = shellInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i], offset = i * 3;
          input[offset] = particle.x; input[offset + 1] = particle.y; input[offset + 2] = particle.r;
        }
        if (state.directReady && state.direct && state.direct.drawShellInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawShellInputs(context, input, cameraX, cameraY));
            if (Number.isInteger(drawn) && drawn >= 0) { state.directShellCalls += drawn; state.directShellInputCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawDarkOutlines = (context, enemies, camX, camY, screenW, screenH, zoom) => {
        if (!state.active || !Array.isArray(enemies) || enemies.length > 8192) return false;
        const inputLength = enemies.length * 4;
        if (darkOutlineInputBuffer.length < inputLength) darkOutlineInputBuffer = new Float64Array(Math.max(inputLength, darkOutlineInputBuffer.length * 2));
        const input = darkOutlineInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i], offset = i * 4;
          input[offset] = enemy.x; input[offset + 1] = enemy.y; input[offset + 2] = enemy.dead ? 1 : 0; input[offset + 3] = enemy.ko;
        }
        if (state.directReady && state.direct && state.direct.drawDarkOutlineInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawDarkOutlineInputs(context, input, camX, camY, screenW, screenH, zoom));
            if (Number.isInteger(drawn) && drawn >= 0) { state.directDarkOutlineInputCalls++; state.directDarkOutlineCalls += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawDarkOverlay = (darkContext, screenContext, overlay, lamps, playerX, playerY, camX, camY, screenW, screenH, zoom, angle, blackout, fireFlash) => {
        if (!state.active || !overlay || !lamps || !lamps.core || !lamps.far || !lamps.flash) return false;
        if (state.directReady && state.direct && state.direct.drawDarkOverlayInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawDarkOverlayInputs(darkContext, screenContext, overlay, lamps.core, lamps.far, lamps.flash,
              playerX, playerY, camX, camY, screenW, screenH, zoom, angle, !!blackout, !!fireFlash));
            if (drawn === true) { state.directDarkOverlayInputCalls++; state.darkOverlayCommands++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawOwlOverlay = (context, items, itemCount, path, pathCount, nowMs, pulse) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawOwlOverlay || !context
          || !(items instanceof Float64Array) || !(path instanceof Float64Array)
          || !Number.isInteger(itemCount) || itemCount < 0 || itemCount > 2048 || items.length < itemCount * 5
          || !Number.isInteger(pathCount) || pathCount < 0 || pathCount > 4096 || path.length < pathCount * 2
          || !Number.isFinite(nowMs) || !Number.isFinite(pulse) || pulse < 0 || pulse > 1) return false;
        try {
          const drawn = withCanvasBypass(() => state.direct.drawOwlOverlay(context, items, itemCount, path, pathCount, nowMs, pulse));
          if (Number.isInteger(drawn) && drawn >= 0) {
            state.directOwlOverlayCalls = (state.directOwlOverlayCalls || 0) + drawn;
            return true;
          }
        } catch (error) { state.directError = String(error && error.message || error); }
        return false;
      };
      state.drawFx = (context, effects) => {
        if (!state.active || !Array.isArray(effects) || effects.length > 8192) return false;
        const inputLength = effects.length * 6;
        if (fxDirectInputBuffer.length < inputLength) fxDirectInputBuffer = new Float64Array(Math.max(inputLength, fxDirectInputBuffer.length * 2));
        const input = fxDirectInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < effects.length; i++) {
          const effect = effects[i], offset = i * 6;
          input[offset] = effect.x; input[offset + 1] = effect.y; input[offset + 2] = effect.t;
          input[offset + 3] = effect.R; input[offset + 4] = effect.a; input[offset + 5] = effect.muzzle ? 1 : 0;
        }
        if (state.directReady && state.direct && state.direct.drawFxInputs) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawFxInputs(context, input));
            if (drawn === effects.length) { state.directFxCalls++; state.directFxInputCalls++; state.fxCommands += drawn; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawPickups = (context, items, glow, now, drawWeaponIcon) => {
        if (!state.active || !Array.isArray(items) || items.length > 8192 || typeof drawWeaponIcon !== 'function') return false;
        const weaponNames = ['punho', 'taco', 'faca', 'smg', 'escopeta', 'rifle', 'pistola', 'revolver', 'uzi', 'cano', 'pe_de_cabra', 'martelo', 'pistola_aut', 'magnum', 'pump', 'dupla', 'carabina', 'sniper', 'lmg', 'katana', 'machado', 'garrafa', 'extintor', 'lanca'];
        const inputLength = items.length * 5;
        if (pickupInputBuffer.length < inputLength) pickupInputBuffer = new Float64Array(Math.max(inputLength, pickupInputBuffer.length * 2));
        const input = pickupInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 5;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.a;
          input[offset + 3] = Math.max(0, weaponNames.indexOf(item.w));
          input[offset + 4] = .55 + .45 * Math.sin(now / 220 + item.x);
        }
        if (state.directReady && state.direct && state.direct.drawPickups) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawPickups(context, input, !!glow, FURNITURE_COLORS));
            if (drawn === items.length) { state.directPickupCalls += drawn; state.directPickupInputCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawThrows = (context, items, drawWeaponIcon) => {
        if (!state.active || !Array.isArray(items) || items.length > 8192 || typeof drawWeaponIcon !== 'function') return false;
        const weaponNames = ['punho', 'taco', 'faca', 'smg', 'escopeta', 'rifle', 'pistola', 'revolver', 'uzi', 'cano', 'pe_de_cabra', 'martelo', 'pistola_aut', 'magnum', 'pump', 'dupla', 'carabina', 'sniper', 'lmg', 'katana', 'machado', 'garrafa', 'extintor', 'lanca'];
        const inputLength = items.length * 4;
        if (throwInputBuffer.length < inputLength) throwInputBuffer = new Float64Array(Math.max(inputLength, throwInputBuffer.length * 2));
        const input = throwInputBuffer.subarray(0, inputLength);
        for (let i = 0; i < items.length; i++) {
          const item = items[i], offset = i * 4;
          input[offset] = item.x; input[offset + 1] = item.y; input[offset + 2] = item.rot;
          input[offset + 3] = Math.max(0, weaponNames.indexOf(item.w));
        }
        if (state.directReady && state.direct && state.direct.drawThrows) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawThrows(context, input, FURNITURE_COLORS));
            if (drawn === items.length) { state.directThrowCalls += drawn; state.directThrowInputCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawTransport = (context, transport, currentFloor) => {
        if (!state.active || !transport || typeof transport !== 'object' ||
            ![transport.x, transport.y, transport.w, transport.h, transport.to, currentFloor].every(Number.isFinite) || transport.w <= 0 || transport.h <= 0 || transport.w > 660 || transport.h > 660) return false;
        const direct = state.directReady && state.direct;
        if (!direct || !direct.createTransportGradient || !direct.drawTransportDirect) return false;
        let cached = transportGradientCache.get(transport);
        if (!cached) { cached = Object.create(null); transportGradientCache.set(transport, cached); }
        const getGradient = (name, width, height, kind, offsetX = 0, gradientWidth = width) => {
          const prior = cached[name];
          if (prior && prior.width === width && prior.height === height && prior.offsetX === offsetX && prior.gradientWidth === gradientWidth) return prior.canvas;
          if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > 660 || height > 660 || !Number.isFinite(offsetX) || !Number.isFinite(gradientWidth) || gradientWidth <= 0) return null;
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          try {
            const created = withCanvasBypass(() => direct.createTransportGradient(canvas, width, height, kind, offsetX, gradientWidth));
            if (created !== true) return null;
            state.directTransportGradientCalls++;
            cached[name] = { canvas, width, height, offsetX, gradientWidth };
            return canvas;
          } catch (error) { state.directError = String(error && error.message || error); return null; }
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
        try {
          const drawn = withCanvasBypass(() => direct.drawTransportDirect(context, transport.x, transport.y,
            transport.w, transport.h, transport.tipo === 'escada' ? 0 : 1, transport.to > currentFloor,
            gradients.stair || null, gradients.elevator || null, gradients.doorLeft || null, gradients.doorRight || null));
          if (drawn === true) { state.directTransportGeometryCalls++; return true; }
        } catch (error) { state.directError = String(error && error.message || error); }
        return false;
      };      state.drawExit = (context, rect, pulse, cleared, bloom) => {
        if (!state.active || !Array.isArray(rect) || rect.length < 4 ||
            !rect.slice(0, 4).every(Number.isFinite) || !Number.isInteger(rect[2]) || !Number.isInteger(rect[3]) || rect[2] <= 0 || rect[3] <= 0 || rect[2] > 660 || rect[3] > 660 ||
            !Number.isFinite(pulse) || pulse < 0 || pulse > 1) return false;
        if (!exitGradientCanvas || exitGradientWidth !== rect[2] || exitGradientHeight !== rect[3]) {
          exitGradientCanvas = document.createElement('canvas');
          exitGradientCanvas.width = exitGradientWidth = rect[2]; exitGradientCanvas.height = exitGradientHeight = rect[3];
          exitGradientCleared = null;
          exitGradientContext = exitGradientCanvas.getContext('2d');
          if (!exitGradientContext) { exitGradientCanvas = exitGradientContext = null; exitGradientWidth = exitGradientHeight = 0; exitGradientCleared = null; return false; }
        }
        if (exitGradientCleared !== !!cleared) {
          let generatedDirect = false;
          if (state.directReady && state.direct && state.direct.createExitGradient) {
            try { generatedDirect = withCanvasBypass(() => state.direct.createExitGradient(exitGradientCanvas, rect[2], rect[3], !!cleared)) === true; }
            catch (error) { state.directError = String(error && error.message || error); }
            if (generatedDirect) state.directExitGradientCalls++;
          }
          if (!generatedDirect) return false;
          exitGradientCleared = !!cleared;
        }
        if (state.directReady && state.direct && state.direct.drawExitDirect) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawExitDirect(context, rect[0], rect[1], rect[2], rect[3],
              pulse, !!cleared, !!bloom, exitGradientCanvas));
            if (drawn === true) { state.directExitGeometryCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawColorGrade = (context, width, height) => !!(state.drawColorGradeDirect && state.drawColorGradeDirect(context, width, height));
      state.drawFinalOverlays = (context, width, height, fade, flash, flashEnabled) => !!(state.drawFinalOverlaysDirect && state.drawFinalOverlaysDirect(context, width, height, fade, flash, flashEnabled));
      state.drawFrameBackground = (context, width, height) => {
        if (!state.active || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return false;
        if (state.directReady && state.direct && state.direct.drawFrameBackground) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawFrameBackground(context, width, height));
            if (drawn === true) { state.directFrameBackgroundCalls = (state.directFrameBackgroundCalls || 0) + 1; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.setupCanvas = (context, scale, smoothing, quality, force = false) => {
        const qualityId = typeof quality === 'number' ? quality : ({ low: 0, medium: 1, high: 2 })[quality];
        if (!state.active || !Number.isFinite(scale) ||
            ![0, 1].includes(Number(smoothing)) || !Number.isInteger(qualityId) || qualityId < 0 || qualityId > 2) return false;
        if (!force && lastCanvasSetup && lastCanvasSetup.context === context && lastCanvasSetup.scale === scale &&
            lastCanvasSetup.smoothing === !!smoothing && lastCanvasSetup.quality === qualityId) return true;
        if (state.directReady && state.direct && state.direct.setupCanvas) {
          try {
            const drawn = withCanvasBypass(() => state.direct.setupCanvas(context, scale, !!smoothing, qualityId));
            if (drawn === true) {
              state.directCanvasSetupCalls = (state.directCanvasSetupCalls || 0) + 1;
              lastCanvasSetup = { context, scale, smoothing: !!smoothing, quality: qualityId };
              return true;
            }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawHudShape = (context, stage, width, height, value = 0) => {
        if (!state.active) return false;
        if (state.directReady && state.direct && state.direct.drawHudShape && Number.isInteger(stage) &&
            Number.isFinite(width) && Number.isFinite(height) && Number.isFinite(value)) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawHudShape(context, stage, width, height, value));
            if (drawn === true) { state.directHudShapeCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawShopDealer = (context, inputValues) => {
        if (!state.active || !Array.isArray(inputValues) || inputValues.length !== 8 || !inputValues.every(Number.isFinite)) return false;
        if (!state.directReady || !state.direct || !state.direct.drawShopDealerStage) return false;
        try {
          const count = withCanvasBypass(() => state.direct.drawShopDealerStage(context, Float64Array.from(inputValues)));
          if (count === 11 || count === 12) {
            state.dealerCommands += count;
            state.directShopDealerCalls = (state.directShopDealerCalls || 0) + 1;
            return true;
          }
        } catch (error) { state.directError = String(error && error.message || error); }
        return false;
      };
      state.drawShopPanel = (context, inputValues, outlineColor) => {
        if (!state.active || !Array.isArray(inputValues) || inputValues.length !== 7 || !inputValues.every(Number.isFinite) ||
            (inputValues[0] === 1 && typeof outlineColor !== 'string')) return false;
        if (state.directReady && state.direct && state.direct.drawShopPanelStage) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawShopPanelStage(context, Float64Array.from(inputValues),
              typeof outlineColor === 'string' ? outlineColor : '#fff'));
            if (drawn === true) { state.dealerCommands += 2; state.directShopPanelCalls = (state.directShopPanelCalls || 0) + 1; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.createRadialSprite = (canvas, rgb, radius, alpha) => {
        if (!state.active || !canvas || !canvas.getContext || typeof rgb !== 'string' || !Number.isFinite(radius) || radius <= 0 || radius > 330 ||
            !Number.isFinite(alpha) || alpha < 0 || alpha > 1) return false;
        const channels = rgb.split(',').map(Number);
        if (channels.length !== 3 || !channels.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return false;
        if (state.directReady && state.direct && state.direct.createRadialSprite) {
          try {
            const created = withCanvasBypass(() => state.direct.createRadialSprite(canvas, channels[0], channels[1], channels[2], radius, alpha));
            if (created === true) { state.directRadialSpriteCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        // The gameplay caller has its own Canvas gradient fallback. Keep this
        // sprite generator on the direct Rust/WebSys path; do not route it back
        // through the legacy renderer's shared linear memory and host callback.
        return false;
      };
      state.createFogSprite = (canvas, rings) => {
        if (!state.active || !canvas || !canvas.getContext ||
            !Array.isArray(rings) || rings.length !== 9 || rings.some(ring => !Array.isArray(ring) || ring.length !== 3 || !ring.every(Number.isFinite))) return false;
        if (state.directReady && state.direct && state.direct.createFogSprite) {
          try {
            const input = Float64Array.from(rings.flat());
            const created = withCanvasBypass(() => state.direct.createFogSprite(canvas, input));
            if (created === true) { state.directFogSpriteCalls++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        // exp-fx.js builds the same fog image with Canvas gradients on failure.
        // Do not copy ring inputs into the legacy renderer's linear memory.
        return false;
      };
      state.drawBossHealthBar = (context, boss, width, height) => {
        if (!state.active || !context || !boss || !boss.boss || !Array.isArray(boss.boss.phases) ||
            boss.boss.phases.length > 9 || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 ||
            !Number.isFinite(boss.hp) || !Number.isFinite(boss.hpMax) || boss.hpMax <= 0 || typeof boss.boss.col !== 'string') return false;
        const phaseMarkers = boss.boss.phases.slice(1);
        const phaseValues = new Float64Array(phaseMarkers.length);
        for (let i = 0; i < phaseMarkers.length; i++) {
          const at = phaseMarkers[i] && phaseMarkers[i].at;
          if (!Number.isFinite(at)) return false;
          phaseValues[i] = at;
        }
        const fraction = Math.max(0, boss.hp / boss.hpMax);
        if (state.directReady && state.direct && state.direct.drawBossHealthBar) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawBossHealthBar(context, width, height, fraction, boss.boss.col, phaseValues));
            if (drawn === true) { state.directBossHealthBarCalls = (state.directBossHealthBarCalls || 0) + 1; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        // Gameplay retains the original Canvas painter in exp-modes.js as the
        // compatibility path; the legacy geometry batch is intentionally gone.
        return false;
      };
      state.drawInvasionArrow = (context, centerX, centerY, angle) => {
        if (!state.active || !context ||
            ![centerX, centerY, angle].every(Number.isFinite)) return false;
        if (state.directReady && state.direct && state.direct.drawInvasionArrowInput) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawInvasionArrowInput(context, centerX, centerY, Math.cos(angle), Math.sin(angle)));
            if (drawn === true) { state.directInvasionArrowCalls = (state.directInvasionArrowCalls || 0) + 1; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawMaskArt = (context, art) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawMaskArt || !context || !art) return false;
        const ids = {
          ears: { none: 0, pointed: 1, round: 2, horn: 3, wing: 4, flame: 5 },
          eyes: { round: 0, slit: 1, visor: 2, angry: 3, hollow: 4 },
          marks: { none: 0, stripes: 1, dots: 2, scales: 3, cracks: 4, web: 5, bands: 6 },
          mouth: { line: 0, beak: 1, fangs: 2, snout: 3, grin: 4 }
        };
        const values = [ids.ears[art.ears || 'none'], ids.eyes[art.eyes || 'round'], ids.marks[art.marks || 'none'], ids.mouth[art.mouth || 'line']];
        if (values.some(value => !Number.isInteger(value))) return false;
        const palette = [art.a, art.b, art.e, art.d || '#101018', art.n || ''];
        if (palette.slice(0, 3).some(value => typeof value !== 'string' || value.length > 64) || palette.slice(3).some(value => typeof value !== 'string' || value.length > 64)) return false;
        const params = new Float64Array([...values, art.w || 38, art.h || 42, art.ey || 62]);
        try {
          const drawn = withCanvasBypass(() => state.direct.drawMaskArt(context, palette, params));
          if (drawn === true) { state.directMaskArtCalls = (state.directMaskArtCalls || 0) + 1; return true; }
        } catch (error) { state.directError = String(error && error.message || error); }
        return false;
      };
      state.drawPauseUiDirect = (context, width, height, hoverIndex, labels = ['PAUSADO', 'ESC · CONTINUAR', 'M · LOBBY']) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawPauseUi ||
            ![width, height, hoverIndex].every(Number.isFinite) || width <= 0 || height <= 0 || ![-1, 0, 1].includes(hoverIndex) ||
            !Array.isArray(labels) || labels.length !== 3 || labels.some(label => typeof label !== 'string' || label.length > 128)) return false;
        try {
          const drawn = withCanvasBypass(() => state.direct.drawPauseUi(context, width, height, hoverIndex, ...labels)) === true;
          if (drawn) state.directPauseFrames++;
          return drawn;
        }
        catch (error) { state.directError = String(error && error.message || error); return false; }
      };
      state.drawComboText = (context, combo, nowMs = 0) => {
        if (!state.active || !Number.isFinite(combo) || !Number.isFinite(nowMs)) return false;
        if (state.directReady && state.direct && state.direct.drawComboTextStage) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawComboTextStage(context, combo, nowMs));
            if (drawn === true) { state.directComboTextCalls++; state.comboTextCommands++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawHudImage = (context, stage, width, height, crt, hasPlayer, images, hasMask = false) => {
        if (!state.active || !Array.isArray(images) || images.length < 4 || !Number.isFinite(width) || !Number.isFinite(height)) return false;
        if (state.directReady && state.direct && state.direct.drawHudImageStage && Number.isInteger(stage)) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawHudImageStage(context, stage, width, height,
              !!crt, !!hasPlayer, !!hasMask, images));
            if (drawn === true) {
              state.directHudImageCalls++; state.hudImageCommands++;
              if (stage === 3) state.weatherLabelCommands++;
              return true;
            }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawAlarmText = (context, seconds, width) => {
        if (!state.active || !Number.isFinite(seconds) || !Number.isFinite(width)) return false;
        if (state.directReady && state.direct && state.direct.drawAlarmTextStage) {
          try {
            const drawn = withCanvasBypass(() => state.direct.drawAlarmTextStage(context, seconds, width));
            if (drawn === true) { state.directAlarmTextCalls++; state.alarmTextCommands++; return true; }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return false;
      };
      state.drawRawHudTexts = (entries, context) => {
        if (!state.active || !Array.isArray(entries) || entries.length > 64 || !context) return false;
        return drawRawHudTextEntries(entries, context);
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
      state.drawCanvasImageBatch = (context, images, placements) => {
        if (!state.active || !state.directReady || !state.direct || !state.direct.drawCanvasImageBatch || !context
          || !Array.isArray(images) || images.length > 64 || !Array.isArray(placements) || placements.length !== images.length * 3
          || !placements.every(Number.isFinite)) return false;
        try {
          const drawn = withCanvasBypass(() => state.direct.drawCanvasImageBatch(context, images, Float64Array.from(placements)));
          if (Number.isInteger(drawn) && drawn === images.length) {
            state.directCanvasImageBatchFrames++;
            state.directCanvasImageFrames += drawn;
            return true;
          }
          return false;
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
      state.readCanvasSourcePixels = (source, scratchContext, width, height) => {
        if (!source || !scratchContext || !Number.isInteger(width) || !Number.isInteger(height)
          || width < 24 || width > 144 || height !== 24) return null;
        if (state.directReady && state.direct && state.direct.readCanvasSourcePixels) {
          try {
            const image = withCanvasBypass(() => state.direct.readCanvasSourcePixels(source, scratchContext, width, height));
            const pixels = image && image.data;
            if (pixels instanceof Uint8ClampedArray && pixels.length === width * height * 4) {
              state.directCanvasReadbackCalls++;
              return pixels;
            }
          } catch (error) { state.directError = String(error && error.message || error); }
        }
        return null;
      };
      state.putCanvasImageData = (context, image, pixels, width, height) => {
        if (!context || !image || !(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height * 4) return false;
        if (state.directReady && state.direct && state.direct.putCanvasImageData) {
          try {
            if (withCanvasBypass(() => state.direct.putCanvasImageData(context, image, pixels, width, height))) { state.di
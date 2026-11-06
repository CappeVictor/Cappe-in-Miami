(() => {
  const enabled = new URLSearchParams(location.search).get('renderer') === 'wasm';
  const scriptUrl = document.currentScript ? document.currentScript.src : location.href;
  const pending = new Map();
  const patchedPrototypes = new WeakSet();
  let nextOperationId = 1;
  let currentFloorBatch = null;
  let currentFloorTextureBatch = null;
  let currentMapBatch = null;
  let currentMapTextureBatch = null;
  let currentFurnitureBatch = null;
  let currentWeaponBatch = null;
  let currentDoorBatch = null;
  let currentNeonDoorBatch = null;
  let currentActorBatch = null;
  let currentPlayerBatch = null;
  let bypassDepth = 0;
  let wasm = null;
  const state = { enabled, active: false, status: enabled ? 'loading' : 'disabled', floorRects: 0, floorFinishCommands: 0, floorTextureCommands: 0, mapCommands: 0, mapDecorCommands: 0, mapTextureCommands: 0, breakableCommands: 0, furnitureCommands: 0, weaponCommands: 0, doorCommands: 0, playerAuraCommands: 0, playerBodyCommands: 0, enemyShadowCommands: 0, enemyBodyCommands: 0, enemyTextCommands: 0, stunEffects: 0, playerFrames: 0 };
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
    'rgba(0,0,0,.4)', 'rgba(0,0,0,.28)', 'rgba(25,240,230,.14)', 'rgba(255,46,147,.14)'
  ];
  const ACTOR_COLORS = ['#111', '#e7b98f', '#0b0812', '#19f0e6', '#ffd23f', '#ff7a1a', 'rgba(255,255,255,.22)', '#16101f', '#2a1a10', '#ff2e93'];
  window.HM_WASM_RENDERER = state;
  if (!enabled) return;

  function dispatch(original, receiver, args, isSetter) {
    if (bypassDepth) return isSetter ? original.call(receiver, args[0]) : original.apply(receiver, args);
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
          value: function (...args) { return dispatch(original, this, args, false); }
        });
      } else if (typeof descriptor.set === 'function') {
        const original = descriptor.set;
        Object.defineProperty(proto, name, {
          ...descriptor,
          set: function (value) { return dispatch(original, this, [value], true); }
        });
      }
    }
    patchedPrototypes.add(proto);
  }

  function showStatus() {
    const badge = document.createElement('div');
    badge.id = 'hm-wasm-renderer-status';
    badge.textContent = 'RENDERER WASM ATIVO';
    Object.assign(badge.style, {
      position: 'fixed', right: '10px', top: '10px', zIndex: '2147483647',
      padding: '5px 8px', color: '#19f0e6', background: 'rgba(8,0,20,.86)',
      border: '1px solid #19f0e6', borderRadius: '3px', font: '12px monospace',
      pointerEvents: 'none'
    });
    document.body.appendChild(badge);
    setInterval(() => {
      const calls = wasm.exports.canvas_calls();
      const writes = wasm.exports.property_writes();
      badge.textContent = `WASM · ${calls.toLocaleString()} Canvas · ${wasm.exports.floor_rects().toLocaleString()} piso · ${state.floorFinishCommands.toLocaleString()} cmd acabamento · ${state.floorTextureCommands.toLocaleString()} cmd textura piso · ${state.mapTextureCommands.toLocaleString()} cmd texturas mapa · ${state.furnitureCommands.toLocaleString()} cmd móveis · ${state.weaponCommands.toLocaleString()} cmd armas · ${state.doorCommands.toLocaleString()} cmd portas · ${state.enemyBodyCommands.toLocaleString()} cmd inimigos · ${state.playerBodyCommands.toLocaleString()} cmd jogadores · ${state.enemyShadowCommands.toLocaleString()} sombras · ${state.stunEffects.toLocaleString()} efeitos · ${state.playerFrames.toLocaleString()} sprites`;
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
          draw_map_command(opcode, color, x1, y1, x2, y2, lineWidth, alpha) {
            if (!currentMapBatch || currentMapBatch.error) return;
            try {
              const batch = currentMapBatch;
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
            const targetBatch = currentPlayerBatch || currentWeaponBatch || currentDoorBatch || currentNeonDoorBatch || currentActorBatch || currentFurnitureBatch || currentFloorTextureBatch || currentMapTextureBatch;
            if (!targetBatch || targetBatch.error) return;
            try {
              const batch = targetBatch;
              const commands = new Float64Array(wasm.exports.memory.buffer, pointer, count * 8);
              executeFurnitureCommands(batch, commands);
              if (currentPlayerBatch) state.playerBodyCommands += count;
              else if (currentWeaponBatch) state.weaponCommands += count;
              else if (currentDoorBatch) state.doorCommands += count;
              else if (currentNeonDoorBatch) state.doorCommands += count;
              else if (currentActorBatch) state.playerAuraCommands += count;
              else if (currentFloorTextureBatch) state.floorTextureCommands += count;
              else if (currentMapTextureBatch) state.mapTextureCommands += count;
              else state.furnitureCommands += count;
            } catch (error) { targetBatch.error = error; }
          }
        }
      });
      wasm = result.instance;
      if (!wasm.exports.canvas_call || !wasm.exports.canvas_set || !wasm.exports.canvas_calls || !wasm.exports.property_writes || !wasm.exports.draw_visible_enemies || !wasm.exports.enemy_events_ptr || !wasm.exports.enemy_events_count || !wasm.exports.enemy_shadows_ptr || !wasm.exports.enemy_shadows_count || !wasm.exports.enemy_draw_data_ptr || !wasm.exports.enemy_body_ranges_ptr || !wasm.exports.enemy_body_commands_ptr || !wasm.exports.enemy_body_commands_count || !wasm.exports.points_ptr || !wasm.exports.enemy_flags_ptr || !wasm.exports.capacity || !wasm.exports.paint_floor || !wasm.exports.paint_floor_grain || !wasm.exports.paint_floor_finish || !wasm.exports.floor_rects || !wasm.exports.floor_batch_capacity || !wasm.exports.paint_map_base || !wasm.exports.paint_map_overlay || !wasm.exports.paint_map_decor || !wasm.exports.paint_map_details || !wasm.exports.paint_map_shadows || !wasm.exports.paint_map_structure || !wasm.exports.paint_map_textures || !wasm.exports.draw_breakables || !wasm.exports.breakable_data_ptr || !wasm.exports.draw_furniture || !wasm.exports.furniture_ptr || !wasm.exports.rooms_ptr || !wasm.exports.enemy_sheet_frame || !wasm.exports.player_sheet_frame || !wasm.exports.draw_player_frame || !wasm.exports.player_palette_ptr || !wasm.exports.player_pixels_ptr || !wasm.exports.draw_weapon || !wasm.exports.draw_doors || !wasm.exports.doors_ptr || !wasm.exports.draw_player_aura || !wasm.exports.draw_players || !wasm.exports.player_draw_data_ptr) {
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
            shadowIndex++;
            const rangeStart = bodyRanges[index * 2], rangeLength = bodyRanges[index * 2 + 1];
            if (context && rangeLength) {
              const batch = { context, enemySheet: sheet, enemyText: painters.text ? (label, x, y) => painters.text(enemy, label, x, y) : null };
              executeFurnitureCommands(batch, bodyCommands.subarray(rangeStart * 8, (rangeStart + rangeLength) * 8));
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
        const batch = { context, error: null };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_base(fixedMap ? 1 : 0, width, height); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.paintMapOverlay = (context, width, height) => {
        if (!state.active) return false;
        const batch = { context, error: null };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_overlay(width, height); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
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
        const batch = { context, mapColors: colors, kind: 'decor', error: null };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_decor(decor.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
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
        const batch = { context, kind: 'breakables', error: null };
        currentMapBatch = batch;
        try { wasm.exports.draw_breakables(intact.length, shards.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
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
      state.paintFloorGrain = (context, width, height, random) => {
        if (!state.active || !random || typeof random.getState !== 'function' || typeof random.setState !== 'function') return false;
        const batch = { context, palette: ['rgba(0,0,0,.09)', 'rgba(255,255,255,.06)'], error: null };
        currentFloorBatch = batch;
        const before = wasm.exports.floor_rects();
        let nextSeed;
        try { nextSeed = wasm.exports.paint_floor_grain(width, height, random.getState()); }
        finally { currentFloorBatch = null; }
        if (batch.error) throw batch.error;
        random.setState(nextSeed);
        state.floorRects = wasm.exports.floor_rects();
        state.floorFinishCommands += state.floorRects - before;
        return true;
      };
      state.paintFloorTiles = (context, rooms, tileIndex, tileImage) => {
        if (!state.active || typeof wasm.exports.paint_floor_tiles !== 'function' || !tileImage
          || !tileImage.complete || tileImage.naturalWidth <= 0 || rooms.length > wasm.exports.capacity()) return false;
        const tilePattern = context.createPattern(tileImage, 'repeat');
        if (!tilePattern) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i], offset = i * 4;
          input[offset] = room.x; input[offset + 1] = room.y; input[offset + 2] = room.w; input[offset + 3] = room.h;
        }
        const hallIndex = rooms.hall ? rooms.indexOf(rooms.hall) : -1;
        const batch = { context, floorTilePattern: tilePattern, error: null };
        currentFloorTextureBatch = batch;
        try { wasm.exports.paint_floor_tiles(rooms.length, hallIndex, tileIndex); }
        finally { currentFloorTextureBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.paintFloorFinish = (context, solids, width, height) => {
        if (!state.active || solids.length > wasm.exports.capacity()) return false;
        const input = new Float64Array(wasm.exports.memory.buffer, wasm.exports.rooms_ptr(), wasm.exports.capacity() * 4);
        for (let i = 0; i < solids.length; i++) {
          const rect = solids[i], offset = i * 4;
          input[offset] = rect[0]; input[offset + 1] = rect[1]; input[offset + 2] = rect[2]; input[offset + 3] = rect[3];
        }
        const batch = { context, palette: ['rgba(0,0,0,.32)', 'rgba(0,0,0,.07)'], error: null };
        currentFloorBatch = batch;
        const before = wasm.exports.floor_rects();
        try { wasm.exports.paint_floor_finish(solids.length, width, height); }
        finally { currentFloorBatch = null; }
        if (batch.error) throw batch.error;
        state.floorRects = wasm.exports.floor_rects();
        state.floorFinishCommands += state.floorRects - before;
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
        const batch = { context, error: null };
        currentMapBatch = batch;
        let nextSeed;
        try { nextSeed = wasm.exports.paint_map_details(rooms.length, width, height, random.getState()); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
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
        const batch = { context, error: null };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_shadows(walls.length, furniture.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
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
        const batch = { context, error: null };
        currentMapBatch = batch;
        try { wasm.exports.paint_map_structure(walls.length, posts.length); }
        finally { currentMapBatch = null; }
        if (batch.error) throw batch.error;
        return true;
      };
      state.paintMapTextures = (context, solids, openings, mapTextures, across) => {
        if (!state.active || solids.length > wasm.exports.capacity() || openings.length > wasm.exports.capacity()) return false;
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
        const draw = canvas.getContext('2d');
        withCanvasBypass(() => {
          const image = draw.createImageData(24, 24);
          image.data.set(source);
          draw.putImageData(image, 0, 0);
        });
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
      console.info('[Cappe WASM] piso, granulado/sombras/rejunte, FTILES (quando o módulo contém a exportação), texturas de mapa, fundo/decor estáticos, vidros quebráveis, geometria de mapa, portas, móveis, armas, composição de jogadores e corpos/sombras/orbes/rótulos de inimigos usam Rust/WASM; rasterização e outras camadas ainda estão em migração.');
    } catch (error) {
      state.status = 'fallback';
      console.error('[Cappe WASM] módulo indisponível; usando o caminho Canvas original.', error);
    }
  })();
})();

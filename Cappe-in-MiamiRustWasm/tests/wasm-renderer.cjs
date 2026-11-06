const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const wasmPath = path.join(__dirname, '..', 'wasm-renderer', 'pkg', 'renderer.wasm');
  const pending = new Map();
  const drawEvents = [];
  const floorEvents = [];
  const mapEvents = [];
  const furnitureEvents = [];
  let floorBatchCalls = 0;
  let furnitureBatchCalls = 0;
  let wasmMemory;
  const { instance } = await WebAssembly.instantiate(fs.readFileSync(wasmPath), {
    host: {
      execute_canvas_call(id) {
        const op = pending.get(id);
        if (!op) return;
        try { op.result = op.run(); } catch (error) { op.error = error; }
      },
      execute_canvas_set(id) {
        const op = pending.get(id);
        if (!op) return;
        try { op.run(); } catch (error) { op.error = error; }
      },
      draw_enemy_body(index, alpha) { drawEvents.push(['body', index, alpha]); },
      draw_enemy_stun(index) { drawEvents.push(['stun', index]); },
      draw_enemy_label(index, label) { drawEvents.push(['label', index, label]); },
      draw_floor_batch(pointer, count) {
        floorBatchCalls++;
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 5);
        for (let i = 0; i < commands.length; i += 5) floorEvents.push([commands[i], commands[i + 1], commands[i + 2], commands[i + 3], commands[i + 4]]);
      },
      draw_map_command(opcode, color, x1, y1, x2, y2, lineWidth, alpha) { mapEvents.push([opcode, color, x1, y1, x2, y2, lineWidth, alpha]); },
      draw_furniture_batch(pointer, count) {
        furnitureBatchCalls++;
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 8);
        for (let i = 0; i < commands.length; i += 8) furnitureEvents.push(Array.from(commands.slice(i, i + 8)));
      }
    }
  });
  const wasm = instance.exports;
  const floorTilesExported = typeof wasm.paint_floor_tiles === 'function';
  wasmMemory = wasm.memory;
  assert.equal(typeof wasm.canvas_call, 'function');
  assert.equal(typeof wasm.canvas_set, 'function');
  assert.equal(wasm.capacity(), 8192);
  assert.equal(wasm.floor_batch_capacity(), 4096);
  assert.ok(wasm.memory instanceof WebAssembly.Memory);
  assert.equal(typeof wasm.player_sheet_frame, 'function');
  const spriteTau = 6.283;
  function playerSheetReference(state, animation, attackRemaining) {
    if (state === 0) return 0;
    if (state === 1 || state === 2) {
      const cycle = ((animation % spriteTau) + spriteTau) % spriteTau;
      const column = Math.floor(cycle / spriteTau * 4) % 4;
      return column | ((state === 1 ? 1 : 2) << 8);
    }
    const column = attackRemaining > 0.13 ? 0 : attackRemaining > 0.06 ? 1 : 2;
    return column | (3 << 8);
  }
  for (const state of [0, 1, 2, 3]) {
    for (const animation of [-12.7, -spriteTau, -0.001, 0, 1.57075, 3.1415, 4.71225, spriteTau, 18.849]) {
      for (const attackRemaining of [0.2, 0.130001, 0.13, 0.060001, 0.06, 0]) {
        assert.equal(wasm.player_sheet_frame(state, animation, attackRemaining), playerSheetReference(state, animation, attackRemaining), `player state=${state}, animation=${animation}, attack=${attackRemaining}`);
      }
    }
  }
  assert.equal(typeof wasm.enemy_sheet_frame, 'function');
  for (const nowMs of [0, 109.999, 110, 219.999, 220, 329.999, 330, 439.999, 440, 770, 1234.5]) {
    const column = Math.floor(nowMs / 110) % 4;
    assert.equal(wasm.enemy_sheet_frame(0, nowMs), 0, 'inimigo parado usa a primeira célula da linha');
    assert.equal(wasm.enemy_sheet_frame(1, nowMs), column | (1 << 8), `inimigo alerta em ${nowMs} ms`);
  }

  function invoke(id, operation, setter = false) {
    pending.set(id, operation);
    try { setter ? wasm.canvas_set(id) : wasm.canvas_call(id); }
    finally { pending.delete(id); }
    if (operation.error) throw operation.error;
    return operation.result;
  }

  const receiver = { seen: [], opacity: 1 };
  const originalMethod = function (...args) { this.seen.push(args); return 'same-return'; };
  const result = invoke(1, { run: () => originalMethod.apply(receiver, [12, 24, 'asset']) });
  assert.equal(result, 'same-return');
  assert.deepEqual(receiver.seen, [[12, 24, 'asset']]);

  invoke(2, { run() { receiver.opacity = 0.35; } }, true);
  assert.equal(receiver.opacity, 0.35);

  const originalError = new TypeError('original Canvas error');
  assert.throws(() => invoke(3, { run() { throw originalError; } }), error => error === originalError);
  const positions = new Float64Array(wasm.memory.buffer, wasm.points_ptr(), wasm.capacity() * 2);
  const flags = new Uint32Array(wasm.memory.buffer, wasm.enemy_flags_ptr(), wasm.capacity());
  const enemyDrawData = new DataView(wasm.memory.buffer, wasm.enemy_draw_data_ptr(), wasm.capacity() * 24);
  [[0, 0], [899.5, 699.5], [900, 0], [-900, 0], [0, 700], [-899.5, -699.5], [900.1, 700.1], [12, 20]]
    .forEach(([x, y], i) => { positions[i * 2] = x; positions[i * 2 + 1] = y; });
  flags.set([6, 15, 8, 0, 0, 8, 4, 0]);
  enemyDrawData.setFloat64(8 * 24, 0.7, true);
  enemyDrawData.setFloat64(8 * 24 + 8, 0.2, true);
  enemyDrawData.setUint32(8 * 24 + 16, 2, true);
  assert.equal(wasm.draw_visible_enemies(8, 0, 0, 0, 0), 4);
  assert.deepEqual(drawEvents, []);
  const enemyEventCount = wasm.enemy_events_count();
  const enemyEvents = new Uint32Array(wasm.memory.buffer, wasm.enemy_events_ptr(), enemyEventCount * 3);
  const decodedEnemyEvents = [];
  for (let i = 0; i < enemyEvents.length; i += 3) {
    const [kind, index, value] = enemyEvents.slice(i, i + 3);
    decodedEnemyEvents.push(kind === 1 ? ['body', index, value === 1 ? 0.55 : 1]
      : kind === 2 ? ['stun', index]
      : ['label', index, value]);
  }
  assert.deepEqual(decodedEnemyEvents, [
    ['body', 0, 1], ['stun', 0], ['label', 0, 2],
    ['body', 1, 0.55], ['label', 1, 1],
    ['body', 5, 1], ['label', 5, 3],
    ['body', 7, 1]
  ]);
  assert.equal(wasm.enemy_shadows_count(), 4, 'Rust emits one ground-shadow command for each visible enemy body');
  const enemyShadows = new Float64Array(wasm.memory.buffer, wasm.enemy_shadows_ptr(), wasm.enemy_shadows_count() * 5);
  assert.deepEqual(Array.from(enemyShadows), [
    3, 5, 12, 10, 1,
    902.5, 704.5, 12, 10, 0.55,
    -896.5, -694.5, 12, 10, 1,
    15, 25, 12, 10, 1
  ]);
  assert.ok(wasm.enemy_body_commands_count() > 0, 'Rust emits fallback body geometry for visible enemies');
  const bodyRanges = new Uint32Array(wasm.memory.buffer, wasm.enemy_body_ranges_ptr(), wasm.capacity() * 2);
  const bodyCommandCount = wasm.enemy_body_commands_count();
  const bodyCommands = new Float64Array(wasm.memory.buffer, wasm.enemy_body_commands_ptr(), bodyCommandCount * 8);
  const firstBodyStart = bodyRanges[0], firstBodyLength = bodyRanges[1];
  assert.ok(firstBodyLength >= 30, 'fallback actor body has a complete Canvas command sequence');
  const firstBody = bodyCommands.slice(firstBodyStart * 8, (firstBodyStart + firstBodyLength) * 8);
  assert.deepEqual(Array.from(firstBody.slice(0, 32)).filter((_, i) => i % 8 === 0), [16, 19, 20, 23]);
  assert.deepEqual(Array.from(firstBody.slice(0, 32)).filter((_, i) => i % 8 === 2), [0, 0, 0, 0]);
  const stunArcs = [];
  for (let i = 0; i < firstBody.length; i += 8) if (firstBody[i] === 11 && (firstBody[i + 4] === 5 || firstBody[i + 4] === 2.5)) {
    stunArcs.push([firstBody[i + 2], firstBody[i + 3], firstBody[i + 4]]);
  }
  assert.equal(stunArcs.length, 6, 'Rust appends all six orbiting stun circles to the enemy command range');
  assert.deepEqual(stunArcs.map(arc => arc[2]), [5, 2.5, 5, 2.5, 5, 2.5]);
  assert.ok(Math.abs(stunArcs[0][0] - 9) < 0.01 && Math.abs(stunArcs[0][1] + 22) < 0.01, 'stun orbit starts at the original phase-zero point');
  const firstBodyTexts = [];
  for (let i = 0; i < firstBody.length; i += 8) if (firstBody[i] === 30) firstBodyTexts.push([firstBody[i + 1], firstBody[i + 2], firstBody[i + 3]]);
  assert.deepEqual(firstBodyTexts, [[4, 0, -34], [2, 0, -24]], 'Rust emits stun and suspicious labels after the enemy body');
  const knockoutStart = bodyRanges[2], knockoutLength = bodyRanges[3];
  const knockoutBody = bodyCommands.slice(knockoutStart * 8, (knockoutStart + knockoutLength) * 8);
  assert.equal(knockoutBody[8], 18);
  assert.equal(knockoutBody[10], 0.55, 'Rust body command retains knockout alpha');
  const knockoutText = [];
  for (let i = 0; i < knockoutBody.length; i += 8) if (knockoutBody[i] === 30) knockoutText.push([knockoutBody[i + 1], knockoutBody[i + 2], knockoutBody[i + 3]]);
  assert.deepEqual(knockoutText, [[1, 899.5, 675.5]], 'Rust emits the knockout label at its original position');
  const alertStart = bodyRanges[5 * 2], alertLength = bodyRanges[5 * 2 + 1];
  const alertBody = bodyCommands.slice(alertStart * 8, (alertStart + alertLength) * 8);
  const alertText = [];
  for (let i = 0; i < alertBody.length; i += 8) if (alertBody[i] === 30) alertText.push([alertBody[i + 1], alertBody[i + 2], alertBody[i + 3]]);
  assert.deepEqual(alertText, [[3, -899.5, -723.5]], 'Rust emits the alert label at its original position');

  positions.fill(0); flags.fill(0);
  enemyDrawData.setFloat64(0, 0.2, true); enemyDrawData.setUint32(16, 1, true); enemyDrawData.setUint32(20, 3, true);
  assert.equal(wasm.draw_visible_enemies(1, 0, 0, 1, 220), 1);
  const sheetBodyStart = bodyRanges[0], sheetBodyLength = bodyRanges[1];
  const sheetBody = new Float64Array(wasm.memory.buffer, wasm.enemy_body_commands_ptr(), wasm.enemy_body_commands_count() * 8)
    .slice(sheetBodyStart * 8, (sheetBodyStart + sheetBodyLength) * 8);
  const sheetCommand = [];
  for (let i = 0; i < sheetBody.length; i += 8) if (sheetBody[i] === 22) sheetCommand.push([sheetBody[i + 2], sheetBody[i + 3]]);
  assert.deepEqual(sheetCommand, [[2, 1]], 'Rust selects the correct animated enemy spritesheet cell');
  let sheetArcCount = 0;
  for (let i = 0; i < sheetBody.length; i += 8) if (sheetBody[i] === 11) sheetArcCount++;
  assert.equal(sheetArcCount, 0, 'non-stunned spritesheet enemies do not receive stun geometry');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  positions.fill(0);
  assert.equal(wasm.filter_visible_count(wasm.capacity() + 100, 0, 0), wasm.capacity());
  assert.equal(wasm.canvas_calls(), 2);
  assert.equal(wasm.property_writes(), 1);
  wasm.reset_stats();
  assert.equal(wasm.canvas_calls(), 0);
  assert.equal(wasm.property_writes(), 0);
  assert.equal(wasm.enemy_batches(), 0);
  assert.equal(wasm.enemy_events_count(), 0);
  assert.equal(wasm.enemy_shadows_count(), 0);
  assert.equal(wasm.enemy_body_commands_count(), 0);

  const carpetSeed = 0x12345678;
  const nextSeed = wasm.paint_floor(1, 10, 20, 12, 12, 0, carpetSeed);
  function referenceRandom(initial) {
    let seed = initial | 0;
    return {
      next() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; },
      state() { return seed >>> 0; }
    };
  }
  const reference = referenceRandom(carpetSeed);
  const expectedFloorEvents = [[0, 10, 20, 12, 12]];
  for (let i = 0, count = Math.ceil(12 * 12 / 12); i < count; i++) {
    const color = reference.next() < 0.5 ? 1 : 2;
    const x = 10 + Math.floor(reference.next() * 12 / 2) * 2;
    const y = 20 + Math.floor(reference.next() * 12 / 2) * 2;
    expectedFloorEvents.push([color, x, y, 2, 2]);
  }
  assert.equal(nextSeed >>> 0, reference.state());
  assert.deepEqual(floorEvents, expectedFloorEvents);
  floorEvents.length = 0;
  wasm.paint_floor(2, 0, 0, 25, 18, 12, 77);
  assert.deepEqual(floorEvents, [
    [2, 0, 0, 25, 18], [1, 1, 1, 11, 11], [0, 13, 1, 11, 11], [1, 25, 1, 0, 11],
    [0, 1, 13, 11, 5], [1, 13, 13, 11, 5], [0, 25, 13, 0, 5]
  ]);
  assert.equal(wasm.floor_rects(), 20);
  assert.equal(floorBatchCalls, 2, 'one host call should flush each small generated floor in a batch');

  floorEvents.length = 0;
  const grainSeed = 0x12345678;
  const grainNextSeed = wasm.paint_floor_grain(10, 20, grainSeed);
  const grainReference = referenceRandom(grainSeed);
  const grainColor = grainReference.next() < 0.5 ? 0 : 1;
  const grainX = Math.floor(grainReference.next() * 10);
  const grainY = Math.floor(grainReference.next() * 20);
  const grainWidth = 1 + Math.floor(grainReference.next() * 2);
  assert.equal(grainNextSeed >>> 0, grainReference.state(), 'Rust returns the exact floor-grain RNG state');
  assert.deepEqual(floorEvents, [[grainColor, grainX, grainY, grainWidth, 1]], 'Rust preserves one speck per seeded JS iteration');

  floorEvents.length = 0;
  const floorSolids = new Float64Array(wasm.memory.buffer, wasm.rooms_ptr(), wasm.capacity() * 4);
  floorSolids.set([1, 2, 3, 4, 10, 20, 5, 6]);
  wasm.paint_floor_finish(2, 49, 25);
  assert.deepEqual(floorEvents, [
    [0, 6, 9, 3, 4], [0, 15, 27, 5, 6],
    [1, 0, 0, 1, 25], [1, 24, 0, 1, 25], [1, 48, 0, 1, 25],
    [1, 0, 0, 49, 1], [1, 0, 24, 49, 1]
  ], 'Rust keeps floor shadows and vertical/horizontal grout in source order');
  assert.equal(wasm.floor_rects(), 28);

  const roomView = new Float64Array(wasm.memory.buffer, wasm.rooms_ptr(), wasm.capacity() * 4);
  roomView.set([0, 0, 100, 100, 150, 20, 50, 100]);
  const mapSeed = 0x31415926;
  const mapNextSeed = wasm.paint_map_details(2, 640, 580, mapSeed);
  const mapReference = referenceRandom(mapSeed);
  const expectedMapEvents = [[1, 0, 9, 9, 82, 82, 2, 0.22]];
  for (let yy = 22; yy < 88; yy += 44) expectedMapEvents.push([2, 1, 10, yy, 58, yy, 1, 0.1]);
  for (let i = 0, count = Math.min(180, Math.floor(640 * 580 / 18000)); i < count; i++) {
    const x = Math.floor(mapReference.next() * Math.max(1, 640 - 12));
    const y = Math.floor(mapReference.next() * Math.max(1, 580 - 12));
    const color = mapReference.next() < 0.5 ? 2 : 3;
    const w = 3 + mapReference.next() * 8;
    const h = 2 + mapReference.next() * 5;
    expectedMapEvents.push([3, color, x, y, w, h, 0, 1]);
  }
  assert.equal(mapNextSeed >>> 0, mapReference.state());
  assert.deepEqual(mapEvents, expectedMapEvents);

  mapEvents.length = 0;
  wasm.paint_map_base(1, 120, 80);
  assert.deepEqual(mapEvents, [[17, 0, 0, 0, 120, 80, 0, 1]], 'Rust paints the fixed-map base rectangle');
  mapEvents.length = 0;
  wasm.paint_map_base(0, 120, 80);
  assert.deepEqual(mapEvents, [], 'procedural maps keep their existing floor painter');
  wasm.paint_map_overlay(120, 80);
  assert.deepEqual(mapEvents, [[18, 0, 0, 0, 120, 80, 0, 1]], 'Rust keeps the soft overlay after decor');
  mapEvents.length = 0;
  const mapDecor = new DataView(wasm.memory.buffer, wasm.furniture_ptr(), wasm.capacity() * 40);
  [[10, 20, 30, 40, 1, 0], [50, 60, 8, 9, 0, 3]].forEach(([x, y, w, h, kind, color], i) => {
    const offset = i * 40;
    mapDecor.setFloat64(offset, x, true); mapDecor.setFloat64(offset + 8, y, true);
    mapDecor.setFloat64(offset + 16, w, true); mapDecor.setFloat64(offset + 24, h, true);
    mapDecor.setUint32(offset + 32, kind, true); mapDecor.setUint32(offset + 36, color, true);
  });
  wasm.paint_map_decor(2);
  assert.deepEqual(mapEvents, [
    [15, 0, 10, 20, 30, 40, 0, 1], [16, 1, 11, 21, 28, 38, 2, 1],
    [16, 2, 18, 28, 14, 24, 1, 1], [15, 3, 50, 60, 8, 9, 0, 1]
  ], 'Rust composes rug borders and ordinary decor in source order');
  mapEvents.length = 0;
  furnitureEvents.length = 0;
  roomView.set([0, 0, 24, 80, 40, 20, 80, 40, 150, 30, 20, 60]);
  const openings = new Float64Array(wasm.memory.buffer, wasm.breakable_data_ptr(), wasm.capacity() * 5);
  openings.set([10, 20, 130, 20, 0, 0, 0, 40, 100, 0, 0, 0, 200, 200, 0]);
  wasm.paint_map_textures(3, 3, 1, 1, 1, 40);
  assert.deepEqual(furnitureEvents, [
    [31, 0, 0, 0, 0, 24, 80, 0], [31, 1, 1, 40, 20, 80, 40, 0], [31, 0, 0, 150, 30, 20, 60, 0],
    [32, 0, 75, 30, 20, 40, 1, 0], [32, 0, 20, 50, 40, 40, 0, 0]
  ], 'Rust preserves wall/furniture texture selection, opening order, dimensions and orientation');
  furnitureEvents.length = 0;
  if (floorTilesExported) {
    roomView.set([2, 3, 20, 30, 50, 60, 40, 50, 100, 120, 40, 50]);
    wasm.paint_floor_tiles(3, 1, 2);
    assert.deepEqual(furnitureEvents, [
      [33, 0, 2, 3, 20, 30, -48, 0], [33, 0, 100, 120, 40, 50, -48, 0]
    ], 'Rust keeps FTILES room order, skips the hall and applies the original pattern offset');
  }
  furnitureEvents.length = 0;
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const breakableData = new Float64Array(wasm.memory.buffer, wasm.breakable_data_ptr(), wasm.capacity() * 5);
  breakableData.set([10, 20, 30, 40, 1, 50, 60, 8, 10, 0.5]);
  wasm.draw_breakables(1, 1);
  assert.deepEqual(mapEvents, [
    [19, 0, 10, 20, 30, 40, 0, 1], [20, 0, 11, 21, 28, 38, 2, 1],
    [21, 0, 16, 54, 34, 26, 2, 1], [22, 0, 50, 60, 8, 10, 1.5, 0.5]
  ], 'Rust emits intact breakable panes and alpha-faded glass fragments');

  mapEvents.length = 0;
  roomView.set([1, 2, 3, 4, 5, 6, 7, 8]);
  wasm.paint_map_shadows(1, 1);
  assert.deepEqual(mapEvents, [[4, 0, 7, 10, 3, 4, 0, 1], [4, 0, 9, 12, 7, 8, 0, 1]]);
  mapEvents.length = 0;
  roomView.set([1, 2, 3, 4, 10, 20, 0, 0]);
  wasm.paint_map_structure(1, 1);
  assert.deepEqual(mapEvents, [
    [5, 0, 1, 2, 3, 4, 0, 1], [6, 0, 1, 2, 3, 4, 0, 1],
    [7, 0, 1, 2, 3, 4, 0, 1], [8, 0, 1, 2, 3, 4, 0, 1],
    [9, 0, 1, 2, 3, 4, 0, 1], [10, 0, 1.5, 2.5, 2, 3, 1, 1],
    [11, 0, 0, 10, 20, 20, 0, 1], [12, 0, 3, 13, 14, 14, 0, 1],
    [13, 0, 5, 15, 10, 10, 0, 1], [14, 0, 3, 13, 14, 14, 2, 1]
  ]);
  const furnitureView = new DataView(wasm.memory.buffer, wasm.furniture_ptr(), wasm.capacity() * 40);
  function writeFurniture(index, kind, variant = 0) {
    const offset = index * 40;
    furnitureView.setFloat64(offset, 10, true); furnitureView.setFloat64(offset + 8, 20, true);
    furnitureView.setFloat64(offset + 16, 80, true); furnitureView.setFloat64(offset + 24, 40, true);
    furnitureView.setUint32(offset + 32, kind, true); furnitureView.setUint32(offset + 36, variant, true);
  }
  writeFurniture(0, 1, 2);
  wasm.draw_furniture(1);
  assert.deepEqual(furnitureEvents[0], [1, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(furnitureEvents[1], [3, 0, 2, 0, 0, 0, 0, 0]);
  assert.deepEqual(furnitureEvents[2], [4, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(furnitureEvents[3], [6, 0, 10, 20, 80, 40, 0, 0]);
  assert.deepEqual(furnitureEvents.at(-1), [2, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(furnitureBatchCalls, 1);
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  for (let kind = 1; kind <= 17; kind++) writeFurniture(kind - 1, kind, kind % 3);
  wasm.draw_furniture(17);
  assert.ok(furnitureEvents.length > 100, 'all furniture definitions should produce Rust Canvas commands');
  assert.equal(furnitureEvents.filter(command => command[0] === 1).length, 17);
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 17);
  assert.ok(furnitureBatchCalls >= 1);
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  assert.equal(wasm.draw_weapon(0), 0, 'the punch weapon has no drawn icon');
  for (let weapon = 1; weapon <= 24; weapon++) {
    const before = furnitureEvents.length;
    const commandCount = wasm.draw_weapon(weapon);
    assert.ok(commandCount > 0, `weapon ${weapon} should emit Canvas commands`);
    assert.equal(furnitureEvents.length - before, commandCount, `weapon ${weapon} command count should match emitted primitives`);
    assert.equal(furnitureEvents[before][0], 15, `weapon ${weapon} should save and configure its shadow`);
    assert.equal(furnitureEvents.at(-1)[0], 2, `weapon ${weapon} should restore the caller context`);
  }
  assert.ok(furnitureEvents.some(command => command[0] === 11), 'weapon icons should generate Canvas arcs');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const doorView = new DataView(wasm.memory.buffer, wasm.doors_ptr(), wasm.capacity() * 48);
  function writeDoor(index, x, y, w, h, angle, vertical, textured) {
    const offset = index * 48;
    doorView.setFloat64(offset, x, true); doorView.setFloat64(offset + 8, y, true);
    doorView.setFloat64(offset + 16, w, true); doorView.setFloat64(offset + 24, h, true);
    doorView.setFloat64(offset + 32, angle, true); doorView.setUint32(offset + 40, vertical ? 1 : 0, true);
    doorView.setUint32(offset + 44, textured ? 1 : 0, true);
  }
  writeDoor(0, 10, 20, 8, 12, 0.25, true, true);
  writeDoor(1, 30, 40, 25, 8, -0.5, false, false);
  const doorCount = wasm.draw_doors(2);
  assert.equal(doorCount, furnitureEvents.length, 'door command count should match emitted commands');
  assert.equal(furnitureEvents[0][0], 16);
  assert.deepEqual(furnitureEvents[1], [19, 0, 14, 20, 0, 0, 0, 0]);
  assert.deepEqual(furnitureEvents[2], [20, 0, 0.25, 0, 0, 0, 0, 0]);
  assert.deepEqual(furnitureEvents[3], [21, 0, -4, 0, 8, 12, 0, 0]);
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 103));
  assert.ok(furnitureEvents.some(command => command[0] === 6 && command[2] === 0 && command[3] === -4 && command[4] === 25 && command[5] === 8));
  assert.ok(furnitureEvents.some(command => command[0] === 18 && command[2] === 0.28));
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 2);

  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const neonDoorView = new DataView(wasm.memory.buffer, wasm.neon_doors_ptr(), wasm.capacity() * 56);
  function writeNeonDoor(index, px, py, base, swing, ox, oy, sprite) {
    const offset = index * 56;
    neonDoorView.setFloat64(offset, px, true); neonDoorView.setFloat64(offset + 8, py, true);
    neonDoorView.setFloat64(offset + 16, base, true); neonDoorView.setFloat64(offset + 24, swing, true);
    neonDoorView.setFloat64(offset + 32, ox, true); neonDoorView.setFloat64(offset + 40, oy, true);
    neonDoorView.setUint32(offset + 48, sprite, true); neonDoorView.setUint32(offset + 52, 0, true);
  }
  writeNeonDoor(0, 120, 80, 0.4, -0.15, 11, 7, 3);
  writeNeonDoor(1, 240, 160, -0.3, 0.5, 9, 12, 5);
  const neonDoorCount = wasm.draw_neon_doors(2);
  assert.equal(neonDoorCount, 10, 'Neon sprite door batch should emit five commands per door');
  assert.equal(neonDoorCount, furnitureEvents.length, 'Neon door count should match emitted commands');
  assert.deepEqual(furnitureEvents.slice(0, 5), [
    [16, 0, 0, 0, 0, 0, 0, 0], [19, 0, 120, 80, 0, 0, 0, 0],
    [20, 0, 0.25, 0, 0, 0, 0, 0], [34, 3, -11, -7, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0]
  ], 'Rust combines base and swing rotation and chooses the sprite offset');
  assert.deepEqual(furnitureEvents.slice(5, 10), [
    [16, 0, 0, 0, 0, 0, 0, 0], [19, 0, 240, 160, 0, 0, 0, 0],
    [20, 0, 0.2, 0, 0, 0, 0, 0], [34, 5, -9, -12, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0]
  ]);

  function capturePlayerAura(isP2, fullShadow, glow) {
    furnitureEvents.length = 0; furnitureBatchCalls = 0;
    const commandCount = wasm.draw_player_aura(isP2, fullShadow, glow);
    assert.equal(commandCount, furnitureEvents.length, 'player aura command count should match its Canvas batch');
    assert.equal(furnitureBatchCalls, commandCount > 0 ? 1 : 0);
    return furnitureEvents.slice();
  }
  const fullPlayerAura = capturePlayerAura(0, 1, 1);
  assert.deepEqual(fullPlayerAura, [
    [16, 0, 0, 0, 0, 0, 0, 0], [4, 104, 0, 0, 0, 0, 0, 0],
    [8, 0, 0, 0, 0, 0, 0, 0], [12, 0, 2, 5, 13, 8, 0, 6.28],
    [13, 0, 0, 0, 0, 0, 0, 0], [4, 106, 0, 0, 0, 0, 0, 0],
    [8, 0, 0, 0, 0, 0, 0, 0], [12, 0, 0, 0, 16, 16, 0, 6.28],
    [13, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0]
  ]);
  assert.equal(capturePlayerAura(1, 1, 1)[5][1], 107, 'P2 aura should retain its pink color');
  const reducedPlayerShadow = capturePlayerAura(0, 0, 0);
  assert.equal(reducedPlayerShadow.length, 6);
  assert.deepEqual(reducedPlayerShadow[1], [4, 105, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(reducedPlayerShadow[3], [12, 0, 1, 3, 11, 9, 0, 6.28]);

  const playerDrawData = new DataView(wasm.memory.buffer, wasm.player_draw_data_ptr(), 3 * 56);
  function writePlayer(index, { x, y, angle, animation = 0, attack = 0, state = 0, flags = 0, weapon = 0 }) {
    const offset = index * 56;
    playerDrawData.setFloat64(offset, x, true); playerDrawData.setFloat64(offset + 8, y, true);
    playerDrawData.setFloat64(offset + 16, angle, true); playerDrawData.setFloat64(offset + 24, animation, true);
    playerDrawData.setFloat64(offset + 32, attack, true); playerDrawData.setUint32(offset + 40, state, true);
    playerDrawData.setUint32(offset + 44, flags, true); playerDrawData.setUint32(offset + 48, weapon, true);
    playerDrawData.setUint32(offset + 52, 0, true);
  }
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  writePlayer(0, { x: 11, y: 22, angle: 0.5, animation: 1.2, attack: 0.1, state: 1, flags: 6, weapon: 6 });
  writePlayer(1, { x: 33, y: 44, angle: -0.25, flags: 13 });
  const fallbackPlayerCount = wasm.draw_players(2, 0);
  assert.equal(fallbackPlayerCount, furnitureEvents.length, 'Rust player commands should match the flushed batch');
  assert.equal(furnitureBatchCalls, 1, 'the full live-player pass should be one host batch');
  assert.deepEqual(furnitureEvents.slice(0, 4), [
    [16, 0, 0, 0, 0, 0, 0, 0], [19, 0, 11, 22, 0, 0, 0, 0], [20, 0, 0.5, 0, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0, 0, 0]
  ]);
  assert.ok(furnitureEvents.some(command => command[0] === 27 && command[1] === 0), 'Rust selects the procedural frame for P1');
  assert.ok(furnitureEvents.some(command => command[0] === 27 && command[1] === 1), 'Rust selects the procedural frame for P2');
  const weaponCommandIndex = furnitureEvents.findIndex(command => command[0] === 15);
  const playerSpriteIndex = furnitureEvents.findIndex(command => command[0] === 27 && command[1] === 0);
  assert.ok(weaponCommandIndex >= 0 && playerSpriteIndex > weaponCommandIndex, 'player weapon remains before its sprite');
  assert.ok(furnitureEvents.some(command => command[0] === 29 && command[1] === 0 && command[3] === -18), 'Rust composes the screen-aligned player tag');
  assert.ok(furnitureEvents.some(command => command[0] === 29 && command[1] === 1 && command[3] === -18), 'Rust composes the P2 tag');
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 6, 'weapon, aura and actor saves are balanced');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  writePlayer(0, { x: 8, y: 9, angle: 0.4, animation: 4.71225, state: 1, flags: 14, weapon: 0 });
  wasm.draw_players(1, 1);
  assert.ok(furnitureEvents.some(command => command[0] === 26 && command[2] === 3 && command[3] === 1), 'Rust selects the current spritesheet cell');
  assert.ok(furnitureEvents.some(command => command[0] === 18 && command[2] === 0.78), 'cosmetic skin accents preserve their original alpha');
  assert.ok(furnitureEvents.some(command => command[0] === 28 && command[1] === 0), 'P1 suit accent uses its host-provided skin color');
  assert.ok(furnitureEvents.some(command => command[0] === 28 && command[1] === 1), 'P1 detail accent uses its host-provided skin color');

  class PixelCanvas {
    constructor() { this.width = 0; this.height = 0; this.pixels = new Array(24 * 24).fill(null); this.context = {
      fillStyle: '#000000', fillRect: (x, y) => { this.pixels[y * 24 + x] = this.context.fillStyle; }
    }; }
    getContext() { return this.context; }
  }
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const playerSource = html.match(/function buildPlayerFrame\(state, f, atk, skin\) \{[\s\S]*?\n\}\nfunction drawOnePlayer/);
  assert.ok(playerSource, 'procedural player source should remain available for parity checks');
  const paletteSource = html.match(/const PAL = (\{[^;]+\});/);
  assert.ok(paletteSource);
  const defaultPalette = Function(`return (${paletteSource[1]})`)();
  const playerSandbox = { Map, Math, Array, playerFrameCache: new Map(), document: { createElement: () => new PixelCanvas() }, window: { EXP: null }, PAL: defaultPalette };
  require('node:vm').runInNewContext(`${playerSource[0].replace('\nfunction drawOnePlayer', '\n')}\nglobalThis.buildPlayerFrame = buildPlayerFrame;`, playerSandbox);
  const skinPalettes = [
    defaultPalette,
    { ...defaultPalette, suit: '#a64436', suitD: '#672b29', suitL: '#dc7650', tie: '#ffd166', tieD: '#bd7437' },
    { ...defaultPalette, suit: '#343d70', suitD: '#202748', suitL: '#5866a6', tie: '#a78bfa', tieD: '#7256b4' },
    { ...defaultPalette, suit: '#287348', suitD: '#17452f', suitL: '#49a86c', tie: '#f3d46b', tieD: '#b99a42' }
  ];
  const playerColors = colors => [colors.K, colors.suit, colors.suitD, colors.suitL, colors.shirt, colors.shirtD,
    colors.tie, colors.tieD, colors.hair, colors.skin, colors.skinD, colors.shoe];
  const packedColor = color => {
    const hex = color.slice(1);
    return (parseInt(hex.slice(0, 2), 16) | parseInt(hex.slice(2, 4), 16) << 8 | parseInt(hex.slice(4, 6), 16) << 16 | 0xff000000) >>> 0;
  };
  const playerPaletteView = new Uint32Array(wasm.memory.buffer, wasm.player_palette_ptr(), 12);
  const playerPixels = new Uint32Array(wasm.memory.buffer, wasm.player_pixels_ptr(), 24 * 24);
  const playerStates = [['idle', 0], ['walk', 1], ['run', 2], ['attack', 3]];
  for (let skinIndex = 0; skinIndex < skinPalettes.length; skinIndex++) {
    const colors = skinPalettes[skinIndex], outfit = skinIndex === 0 ? null : { id: `parity-${skinIndex}`, palette: colors };
    playerPaletteView.set(playerColors(colors).map(packedColor));
    for (const [name, id] of playerStates) {
      const attackFrames = name === 'attack' ? [0, 1, 2, 3] : [0];
      for (const phase of [0, 1, 2, 3, 4, 5, 6, 7]) for (const attackFrame of attackFrames) {
        const f = phase * 6.283 / 8;
        const referenceFrame = playerSandbox.buildPlayerFrame(name, f, attackFrame / 3, outfit);
        wasm.draw_player_frame(id, phase, attackFrame, Math.sin(f));
        const expected = referenceFrame.pixels.map(color => color === null ? 0 : packedColor(color));
        assert.deepEqual(Array.from(playerPixels), expected, `player frame parity failed for ${name}, phase ${phase}, attack ${attackFrame}, palette ${skinIndex}`);
      }
    }
  }
  console.log(`Rust/WASM checks passed (Canvas ABI, enemy body/status labels/order, floor RNG/geometry, furniture/weapons/doors including Neon sprites, player composition, aura and sprite/pixel parity; FTILES export ${floorTilesExported ? 'validated' : 'not in packaged v74 binary, JS fallback active'}).`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });

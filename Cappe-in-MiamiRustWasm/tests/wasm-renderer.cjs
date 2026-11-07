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
  const dustEvents = [];
  const sparkEvents = [];
  const bloodEvents = [];
  const staticBloodEvents = [];
  const corpseEvents = [];
  const bulletEvents = [];
  const layerEvents = [];
  const shellEvents = [];
  const outlineEvents = [];
  const fxEvents = [];
  const pickupEvents = [];
  const throwEvents = [];
  const transportEvents = [];
  const exitEvents = [];
  const colorGradeEvents = [];
  const finalOverlayEvents = [];
  const hudShapeEvents = [];
  const invasionArrowEvents = [];
  const hudTextEvents = [];
  const rainEvents = [];
  const weatherMoteEvents = [];
  const fogEvents = [];
  const fxOverlayEvents = [];
  const worldLightEvents = [];
  const worldRingEvents = [];
  const invasionZoneEvents = [];
  const darkOverlayEvents = [];
  const comboTextEvents = [];
  const hudImageEvents = [];
  const alarmTextEvents = [];
  const canvasSetupEvents = [];
  const frameBackgroundEvents = [];
  const radialSpriteEvents = [];
  const muzzleSpriteEvents = [];
  const exitGradientEvents = [];
  const transportGradientEvents = [];
  const floorGrainRgbaEvents = [];
  let wasmMemory;
  const { instance } = await WebAssembly.instantiate(fs.readFileSync(wasmPath), {
    host: {
      set_canvas_setup(scale, smoothing, quality) { canvasSetupEvents.push([scale, smoothing, quality]); },
      fill_frame_background(width, height) { frameBackgroundEvents.push([width, height]); },
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
      draw_floor_rgba_batch(pointer, width, height) {
        floorGrainRgbaEvents.push({ pointer, width, height, pixels: Array.from(new Uint8Array(wasmMemory.buffer, pointer, width * height * 4)) });
      },
      draw_dust_batch(pointer, count, alpha) {
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 3);
        dustEvents.push({ commands: Array.from(commands), alpha });
      },
      draw_spark_batch(pointer, count) {
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 6);
        sparkEvents.push(Array.from(commands));
      },
      draw_live_blood_batch(pointer, count) {
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 4);
        bloodEvents.push(Array.from(commands));
      },
      draw_static_blood_batch(pointer, count) {
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 4);
        staticBloodEvents.push(Array.from(commands));
      },
      draw_corpse_batch(pointer, count) {
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 7);
        corpseEvents.push(Array.from(commands));
      },
      draw_bullet_batch(pointer, count) {
        const commands = new Float64Array(wasmMemory.buffer, pointer, count * 3);
        bulletEvents.push(Array.from(commands));
      },
      draw_layer_command(pointer) {
        layerEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 8)));
      },
      draw_shell_batch(pointer, count) {
        shellEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 5)));
      },
      draw_dark_outline_batch(pointer, count) {
        outlineEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 4)));
      },
      draw_dark_overlay_batch(pointer) {
        darkOverlayEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 8)));
      },
      draw_combo_text_batch(pointer) {
        comboTextEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 2)));
      },
      draw_hud_image_batch(pointer) {
        hudImageEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 5)));
      },
      draw_alarm_text_batch(pointer) {
        alarmTextEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 3)));
      },
      draw_fx_batch(pointer, count) {
        fxEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 6)));
      },
      draw_pickup_batch(pointer, count) {
        pickupEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 5)));
      },
      draw_throw_batch(pointer, count) {
        throwEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 4)));
      },
      draw_transport_batch(pointer, count) {
        transportEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 8)));
      },
      draw_exit_batch(pointer, count) {
        exitEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 6)));
      },
      draw_color_grade_batch(pointer, count) {
        colorGradeEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 5)));
      },
      draw_final_overlay_batch(pointer, count) {
        finalOverlayEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 4)));
      },
      draw_hud_shape_batch(pointer, count) {
        hudShapeEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 7)));
      },
      draw_radial_sprite_batch(pointer, width, height) {
        radialSpriteEvents.push({ width, height, pixels: Array.from(new Uint8Array(wasmMemory.buffer, pointer, width * height * 4)) });
      },
      draw_muzzle_sprite_batch(pointer, width, height) {
        muzzleSpriteEvents.push({ width, height, pixels: Array.from(new Uint8Array(wasmMemory.buffer, pointer, width * height * 4)) });
      },
      draw_exit_gradient_batch(pointer, width, height) {
        exitGradientEvents.push({ width, height, pixels: Array.from(new Uint8Array(wasmMemory.buffer, pointer, width * height * 4)) });
      },
      draw_transport_gradient_batch(pointer, width, height) {
        transportGradientEvents.push({ width, height, pixels: Array.from(new Uint8Array(wasmMemory.buffer, pointer, width * height * 4)) });
      },
      draw_invasion_arrow_batch(pointer) {
        invasionArrowEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 6)));
      },
      draw_hud_text_batch(pointer, count) {
        hudTextEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 5)));
      },
      draw_rain_batch(pointer, count) {
        rainEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 4)));
      },
      draw_weather_motes_batch(pointer, count) {
        weatherMoteEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 4)));
      },
      draw_fog_batch(pointer, count, smoke, alpha) {
        fogEvents.push({ commands: Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 4)), smoke, alpha });
      },
      draw_fx_overlay_batch(pointer, count) {
        fxOverlayEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 6)));
      },
      draw_world_light_batch(pointer, count) {
        worldLightEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 7)));
      },
      draw_world_ring_batch(pointer, count) {
        worldRingEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, count * 6)));
      },
      draw_invasion_zone_batch(pointer) {
        invasionZoneEvents.push(Array.from(new Float64Array(wasmMemory.buffer, pointer, 6)));
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
  assert.equal(wasm.draw_canvas_setup(1.25, 1, 2), 1, 'Rust accepts a valid root Canvas scale and smoothing state');
  assert.deepEqual(canvasSetupEvents, [[1.25, 1, 2]], 'Rust forwards the validated Canvas setup once');
  assert.equal(wasm.draw_canvas_setup(0, 1, 2), 0, 'Rust rejects a non-positive root Canvas scale');
  assert.equal(wasm.draw_canvas_setup(1, 0.5, 1), 0, 'Rust rejects a non-boolean smoothing flag');
  assert.equal(wasm.draw_canvas_setup(1, 1, 3), 0, 'Rust rejects an unsupported smoothing quality');
  assert.equal(canvasSetupEvents.length, 1, 'invalid Canvas setup emits no host operation');
  assert.equal(wasm.draw_frame_background(960, 600), 1, 'Rust emits a valid base frame background');
  assert.deepEqual(frameBackgroundEvents, [[960, 600]]);
  assert.equal(wasm.draw_frame_background(NaN, 600), 0, 'Rust rejects invalid frame dimensions');
  assert.equal(frameBackgroundEvents.length, 1, 'invalid frame background emits no host operation');
  const dustInput = new Float64Array(wasm.memory.buffer, wasm.dust_input_ptr(), 9);
  dustInput.set([10, 20, 2, 5, 6, 1.5, NaN, 4, 1]);
  assert.equal(wasm.draw_dust(3, 0.16), 2, 'Rust filters non-finite dust particles before emitting the Canvas batch');
  assert.deepEqual(dustEvents[0], { commands: [10, 20, 2, 5, 6, 1.5], alpha: 0.16 });
  assert.equal(wasm.draw_dust(0, 2), 0, 'empty dust frame emits no host draw');
  const sparkInput = new Float64Array(wasm.memory.buffer, wasm.spark_input_ptr(), 15);
  sparkInput.set([10, 20, 0.5, 1, 0, 30, 40, 0.1, 1, 1, 50, 60, 0, 1, 1]);
  assert.equal(wasm.draw_sparks(3, 2), 2, 'Rust groups visible sparks by color and life bucket, omitting expired particles');
  assert.deepEqual(sparkEvents[0], [0, 0.5, 8, 18, 4, 4, 1, 1 / 6, 28, 38, 4, 4]);
  const bloodInput = new Float64Array(wasm.memory.buffer, wasm.blood_input_ptr(), 8);
  bloodInput.set([7, 9, 2, 1.2, 12, 14, -1, 0.5]);
  assert.equal(wasm.draw_live_blood(2, 0), 1, 'Rust preserves live blood order while filtering invalid radii and clamping alpha');
  assert.deepEqual(bloodEvents[0], [7, 9, 2, 1]);
  bloodInput.set([2, 3, 1, 1, 8, 9, 2, 1]);
  assert.equal(wasm.draw_static_blood(2), 2, 'static blood is emitted as one compound Canvas path for cache painting');
  assert.deepEqual(staticBloodEvents[0], [2, 3, 1, 1, 8, 9, 2, 1]);
  const corpseInput = new Float64Array(wasm.memory.buffer, wasm.corpse_input_ptr(), 4);
  corpseInput.set([100, 200, 1.5, 2]);
  assert.equal(wasm.draw_corpses(1), 2, 'Rust emits a shadow and typed body ellipse per corpse');
  assert.deepEqual(corpseEvents[0], [100, 200, 1.5, 15, 11, 0.35, 3, 100, 200, 1.5, 13, 8, 0.55, 2]);
  const bulletInput = new Float64Array(wasm.memory.buffer, wasm.bullet_input_ptr(), 6);
  bulletInput.set([100, 50, 1, 10, 20, 0]);
  assert.equal(wasm.draw_bullets(2), 2, 'Rust preserves bullet order and resolves owner sprite placement');
  assert.deepEqual(bulletEvents[0], [78, 36, 1, -12, 6, 0]);
  assert.equal(wasm.draw_layer(2, 3, 10, 12, 8, 9), 1, 'Rust clips camera layer source to canvas bounds');
  assert.deepEqual(layerEvents[0], [2, 3, 6, 6, 2, 3, 6, 6]);
  assert.equal(wasm.draw_layer(9, 0, 8, 10, 12, 12), 0, 'empty camera crop emits no image draw');
  const shellInput = new Float64Array(wasm.memory.buffer, wasm.shell_input_ptr(), 3);
  shellInput.set([120, 90, 2]);
  assert.equal(wasm.draw_shells(1, 20, 10), 1, 'Rust projects a shell into screen space');
  assert.deepEqual(shellEvents[0], [100, 80, 3.2, 2, 0.5]);
  const outlineInput = new Float64Array(wasm.memory.buffer, wasm.dark_outline_input_ptr(), 8);
  outlineInput.set([30, 50, 0, 0, 90, 80, 1, 2]);
  assert.equal(wasm.draw_dark_outlines(2, 10, 20, 100, 80, 1.5), 1, 'Rust filters dead actors and projects dark outlines');
  assert.deepEqual(outlineEvents[0], [5, 25, 21, 1]);
  const darkOverlayInput = new Float64Array(wasm.memory.buffer, wasm.dark_overlay_input_ptr(), 10);
  darkOverlayInput.set([120, 90, 20, 10, 100, 80, 1.5, 0.25, 1, 1]);
  assert.equal(wasm.draw_dark_overlay(), 1, 'Rust projects blackout lantern geometry and emits its overlay batch');
  assert.deepEqual(darkOverlayEvents[0], [125, 100, 0.25, 225, 495, 390, 1, 1]);
  darkOverlayInput[6] = NaN;
  assert.equal(wasm.draw_dark_overlay(), 0, 'invalid dark overlay geometry is rejected before host rasterization');
  const comboTextInput = new Float64Array(wasm.memory.buffer, wasm.combo_text_input_ptr(), 2);
  comboTextInput.set([5, 45]);
  assert.equal(wasm.draw_combo_text(), 1, 'Rust emits a valid combo multiplier text batch');
  assert.equal(comboTextEvents[0][1], 5);
  assert.ok(Math.abs(comboTextEvents[0][0] - (1 + Math.sin(0.5) * 0.06)) < 1e-9, 'Rust calculates the original combo pulse');
  comboTextInput[0] = 1;
  assert.equal(wasm.draw_combo_text(), 0, 'Rust suppresses combo text at its inactive threshold');
  const hudImageInput = new Float64Array(wasm.memory.buffer, wasm.hud_image_input_ptr(), 8);
  hudImageInput.set([0, 960, 600, 1, 1, 0]);
  assert.equal(wasm.draw_hud_image(), 1, 'Rust selects the CRT vignette when the player is visible');
  assert.deepEqual(hudImageEvents[0], [1, 0, 0, 960, 600]);
  hudImageInput.set([0, 960, 600, 1, 0, 0]);
  assert.equal(wasm.draw_hud_image(), 0, 'Rust omits the world vignette when the gameplay actor is absent');
  hudImageInput.set([2, 1280, 720, 0, 1, 1]);
  assert.equal(wasm.draw_hud_image(), 1, 'Rust positions the mask portrait in the HUD');
  assert.deepEqual(hudImageEvents[1], [3, 1198, 26, 56, 56]);
  hudImageInput.set([3, 960, 600, 0, 1, 0, 144, 24]);
  assert.equal(wasm.draw_hud_image(), 1, 'Rust positions the weather label image using its cached dimensions');
  assert.deepEqual(hudImageEvents[2], [4, 32, 575, 144, 24]);
  const alarmTextInput = new Float64Array(wasm.memory.buffer, wasm.alarm_text_input_ptr(), 2);
  alarmTextInput.set([12.6, 960]);
  assert.equal(wasm.draw_alarm_text(), 1, 'Rust emits the active alarm label placement');
  assert.deepEqual(alarmTextEvents[0], [12.6, 480, 24]);
  alarmTextInput[0] = 0;
  assert.equal(wasm.draw_alarm_text(), 0, 'Rust suppresses the alarm label when its timer expires');
  const fxInput = new Float64Array(wasm.memory.buffer, wasm.fx_input_ptr(), 12);
  fxInput.set([1, 2, 0.07, 10, 0, 1, 3, 4, 0.5, 5, 1, 0]);
  assert.equal(wasm.draw_fx(2), 2, 'Rust preserves muzzle and impact effect ordering');
  assert.deepEqual(fxEvents[0], [1, 2, 0.07, 10, 0, 1, 3, 4, 0.5, 5, 1, 0]);
  const pickupInput = new Float64Array(wasm.memory.buffer, wasm.pickup_input_ptr(), 5);
  pickupInput.set([17, 23, 0.75, 6, 0.9]);
  assert.equal(wasm.draw_pickups(1), 1, 'Rust preserves pickup pose, weapon, and glow pulse');
  assert.deepEqual(pickupEvents[0], [17, 23, 0.75, 6, 0.9]);
  const throwInput = new Float64Array(wasm.memory.buffer, wasm.throw_input_ptr(), 4);
  throwInput.set([25, 35, 1.2, 3]);
  assert.equal(wasm.draw_throws(1), 1, 'Rust preserves thrown weapon pose and icon id');
  assert.deepEqual(throwEvents[0], [25, 35, 1.2, 3]);
  const transportInput = new Float64Array(wasm.memory.buffer, wasm.transport_input_ptr(), 6);
  transportInput.set([10, 20, 40, 60, 0, 1]);
  assert.equal(wasm.draw_transports(1), 18, 'Rust emits ordered stair shadow, gradient, steps, rails and borders');
  assert.equal(transportEvents[0].length, 18 * 8);
  assert.deepEqual(transportEvents[0].slice(0, 8), [0, 8, 22, 44, 64, 0, 1, 0]);
  const exitInput = new Float64Array(wasm.memory.buffer, wasm.exit_input_ptr(), 7);
  exitInput.set([10, 20, 100, 40, 0.7, 1, 1]);
  assert.equal(wasm.draw_exit(), 15, 'Rust emits outer glow, clipping, gradient, nine hatches and double borders');
  assert.deepEqual(exitEvents[0].slice(0, 6), [0, 8, 18, 104, 44, 1]);
  assert.deepEqual(exitEvents[0].slice(-12), [5, 11, 21, 98, 38, 8, 6, 11, 21, 98, 38, 2.5]);
  assert.equal(wasm.generate_exit_gradient(100, 40, 1), 1, 'Rust rasterizes an exit gradient into RGBA');
  assert.deepEqual([exitGradientEvents[0].width, exitGradientEvents[0].height], [100, 40]);
  assert.equal(exitGradientEvents[0].pixels[(20 * 100 + 50) * 4 + 3] > 0, true, 'Rust retains alpha across the exit gradient interior');
  assert.equal(wasm.generate_exit_gradient(661, 40, 1), 0, 'Rust rejects exit gradients beyond the fixed shared RGBA buffer');
  assert.equal(wasm.generate_transport_gradient(40, 60, 0, 0, 40), 1, 'Rust generates a stair gradient texture');
  assert.deepEqual([transportGradientEvents[0].width, transportGradientEvents[0].height], [40, 60]);
  assert.equal(transportGradientEvents[0].pixels[3], 255, 'transport gradient pixels remain opaque');
  assert.equal(wasm.generate_transport_gradient(50, 70, 1, 0, 50), 1, 'Rust generates an elevator body gradient texture');
  assert.equal(wasm.generate_transport_gradient(19, 54, 2, 5, 50), 1, 'Rust generates the left door gradient over the full elevator width');
  assert.equal(wasm.generate_transport_gradient(19, 54, 2, 26, 50), 1, 'Rust generates the right door gradient over the full elevator width');
  assert.equal(transportGradientEvents[2].pixels[0], 188, 'left door begins at the corresponding position in the full-width gradient');
  assert.equal(transportGradientEvents[3].pixels[0], 146, 'right door begins after the midpoint stop in the full-width gradient');
  assert.equal(wasm.generate_transport_gradient(50, 70, 3, 0, 50), 0, 'Rust rejects unsupported transport gradient kinds');
  assert.equal(wasm.generate_transport_gradient(19, 54, 2, 5, 0), 0, 'Rust rejects invalid full-gradient dimensions');
  new Float64Array(wasm.memory.buffer, wasm.color_grade_input_ptr(), 2).set([1280, 720]);
  assert.equal(wasm.draw_color_grade(), 2, 'Rust emits the two color-grade fills');
  assert.deepEqual(colorGradeEvents[0], [0, 0, 0, 1280, 720, 1, 0, 0, 1280, 720]);
  new Float64Array(wasm.memory.buffer, wasm.color_grade_input_ptr(), 2).set([NaN, 720]);
  assert.equal(wasm.draw_color_grade(), 0, 'Rust rejects invalid color-grade dimensions');
  new Float64Array(wasm.memory.buffer, wasm.final_overlay_input_ptr(), 5).set([1280, 720, 0.4, 0.8, 1]);
  assert.equal(wasm.draw_final_overlays(), 2, 'Rust preserves fade then enabled flash order');
  assert.deepEqual(finalOverlayEvents[0], [0, 1280, 720, 0.4, 1, 1280, 720, 0.4]);
  new Float64Array(wasm.memory.buffer, wasm.final_overlay_input_ptr(), 5).set([1280, 720, 0, 0.8, 0]);
  assert.equal(wasm.draw_final_overlays(), 0, 'Rust omits flash when the effect is disabled');
  new Float64Array(wasm.memory.buffer, wasm.hud_shape_input_ptr(), 4).set([0, 1280, 720, 0.25]);
  assert.equal(wasm.draw_hud_shape(), 3, 'Rust emits combo bar background, progress and outline');
  assert.deepEqual(hudShapeEvents[0], [0, 34, 186, 220, 10, 0, 0, 0, 34, 186, 55, 10, 2, 0, 1, 34, 186, 220, 10, 3, 2]);
  new Float64Array(wasm.memory.buffer, wasm.hud_shape_input_ptr(), 4).set([1, 1280, 720, 0]);
  assert.equal(wasm.draw_hud_shape(), 1, 'Rust emits the mask portrait frame');
  assert.deepEqual(hudShapeEvents[1], [1, 1198, 26, 56, 56, 5, 3]);
  new Float64Array(wasm.memory.buffer, wasm.hud_shape_input_ptr(), 4).set([2, 1280, 720, 0]);
  assert.equal(wasm.draw_hud_shape(), 1, 'Rust emits the pause veil');
  assert.deepEqual(hudShapeEvents[2], [0, 0, 0, 1280, 720, 4, 0]);
  new Float64Array(wasm.memory.buffer, wasm.hud_shape_input_ptr(), 4).set([3, 1280, 720, 0.5]);
  assert.equal(wasm.draw_hud_shape(), 2, 'Rust emits reload background and progress fill');
  assert.deepEqual(hudShapeEvents[3], [0, 34, 146, 160, 8, 8, 0, 0, 34, 146, 80, 8, 9, 0]);
  new Float64Array(wasm.memory.buffer, wasm.hud_shape_input_ptr(), 4).set([0, 1280, 720, NaN]);
  assert.equal(wasm.draw_hud_shape(), 3, 'Rust retains valid combo background/outline for a non-finite timer');
  assert.ok(Number.isNaN(hudShapeEvents[4][10]), 'Rust preserves Canvas no-op width for an invalid progress fraction');
  new Float64Array(wasm.memory.buffer, wasm.pause_ui_input_ptr(), 3).set([1280, 720, -1]);
  assert.equal(wasm.draw_pause_ui(), 5, 'Rust emits pause veil and both button fill/outline pairs');
  assert.deepEqual(hudShapeEvents[5], [
    0, 0, 0, 1280, 720, 4, 0,
    0, 430, 367, 420, 46, 10, 0, 1, 430, 367, 420, 46, 12, 2,
    0, 430, 423, 420, 46, 10, 0, 1, 430, 423, 420, 46, 2, 2
  ], 'Rust preserves pause veil and button geometry, fill colors, border colors, and order');
  new Float64Array(wasm.memory.buffer, wasm.pause_ui_input_ptr(), 3).set([1280, 720, 0]);
  assert.equal(wasm.draw_pause_ui(), 5, 'Rust emits the hovered pause-button state');
  assert.deepEqual(hudShapeEvents[6].slice(12, 19), [11, 0, 1, 430, 367, 420, 46]);
  assert.equal(hudShapeEvents[6][19], 12, 'the first pause button keeps its white hover outline');
  assert.equal(hudShapeEvents[6][20], 3, 'the hovered pause outline becomes 3 pixels wide');
  new Float64Array(wasm.memory.buffer, wasm.pause_ui_input_ptr(), 3).set([1280, 720, 2]);
  assert.equal(wasm.draw_pause_ui(), 0, 'Rust rejects unsupported pause-button hover indices');
  const bossHudInput = new Float64Array(wasm.memory.buffer, wasm.boss_health_input_ptr(), 12);
  bossHudInput.set([1280, 720, 0.5, 2, 0.5, 0.3]);
  assert.equal(wasm.draw_boss_health_bar(), 5, 'Rust emits boss background, health, phase ticks, and outline');
  assert.deepEqual(hudShapeEvents[7], [
    0, 407, 625, 466, 20, 0, 0,
    0, 410, 628, 230, 14, 6, 0,
    0, 639, 628, 2, 14, 7, 0,
    0, 547, 628, 2, 14, 7, 0,
    1, 410, 628, 460, 14, 8, 2
  ]);
  bossHudInput[3] = 9;
  assert.equal(wasm.draw_boss_health_bar(), 0, 'Rust rejects boss bars exceeding the fixed marker capacity');
  bossHudInput.set([1280, 720, 0.5, 1.5]);
  assert.equal(wasm.draw_boss_health_bar(), 0, 'Rust rejects a fractional boss phase count');
  new Float64Array(wasm.memory.buffer, wasm.invasion_arrow_input_ptr(), 4).set([100, 200, 0, 1]);
  assert.equal(wasm.draw_invasion_arrow(), 3, 'Rust emits the three rotated Invasion arrow vertices');
  assert.deepEqual(invasionArrowEvents[0], [100, 214, 109, 192, 91, 192]);
  new Float64Array(wasm.memory.buffer, wasm.invasion_arrow_input_ptr(), 4).set([100, 200, NaN, 1]);
  assert.equal(wasm.draw_invasion_arrow(), 0, 'Rust rejects a non-finite Invasion arrow transform');
  assert.equal(invasionArrowEvents.length, 1, 'invalid arrow transforms emit no partial callback');
  const hudTextInput = new Float64Array(wasm.memory.buffer, wasm.hud_text_input_ptr(), 15);
  hudTextInput.set([0, 34, 52, 0, 1, 1, 1246, 128, 2, 0.75, 2, NaN, 174, 1, 1]);
  assert.equal(wasm.draw_hud_text(3), 2, 'Rust filters invalid HUD text commands and preserves display order');
  assert.deepEqual(hudTextEvents[0], [0, 34, 52, 0, 1, 1, 1246, 128, 2, 0.75]);
  assert.equal(wasm.hud_text_command_count(), 2);
  assert.equal(wasm.draw_hud_text(65), 0, 'Rust rejects a HUD batch above its fixed capacity');
  assert.equal(wasm.hud_text_command_count(), 0, 'an oversized HUD request clears the prior batch count');
  hudTextInput.set([0, 34, 52, 0, 1.2]);
  assert.equal(wasm.draw_hud_text(1), 0, 'Rust filters text alpha outside the Canvas range');
  assert.equal(wasm.hud_text_command_count(), 0);
  const rainInput = new Float64Array(wasm.memory.buffer, wasm.rain_input_ptr(), 9);
  rainInput.set([10, 20, 10, 30, 40, 20, 50, 60, 5]);
  assert.equal(wasm.draw_rain(3, 2), 2, 'Rust applies the performance-tier stride to rain segments');
  assert.deepEqual(rainEvents[0], [10, 20, 8.2, 30, 50, 60, 49.1, 65], 'Rust preserves the original slanted rain geometry and input order');
  rainInput.set([10, 20, 10, NaN, 40, 20, 50, 60, -1]);
  assert.equal(wasm.draw_rain(3, 1), 1, 'Rust drops malformed rain coordinates and negative lengths');
  assert.deepEqual(rainEvents[1], [10, 20, 8.2, 30]);
  assert.equal(wasm.draw_rain(257, 1), 0, 'Rust rejects rain batches above the fixed input capacity');
  assert.equal(wasm.rain_command_count(), 0, 'rejected rain batches clear the previous command count');
  const weatherMoteInput = new Float64Array(wasm.memory.buffer, wasm.weather_mote_input_ptr(), 12);
  weatherMoteInput.set([1, 2, 0.5, 0.2, 3, 4, 1, -0.3, 5, 6, NaN, 1]);
  assert.equal(wasm.draw_weather_motes(3, 700), 2, 'Rust filters invalid ambient motes while preserving order');
  assert.deepEqual(weatherMoteEvents[0].slice(0, 3), [1, 2, 0.5]);
  assert.deepEqual(weatherMoteEvents[0].slice(4, 7), [3, 4, 1]);
  assert.ok(Math.abs(weatherMoteEvents[0][3] - (0.25 + 0.35 * Math.abs(Math.sin(1 + 0.2)))) < 1e-12, 'Rust preserves the time-based ambient mote alpha');
  assert.equal(wasm.draw_weather_motes(3, NaN), 0, 'Rust rejects non-finite weather time');
  assert.equal(wasm.weather_mote_command_count(), 0, 'invalid weather mote frames clear the prior command count');
  new Float64Array(wasm.memory.buffer, wasm.fog_input_ptr(), 3).set([900, 0, 0]);
  assert.equal(wasm.draw_fog(), 3, 'Rust emits the three ambient fog sprite placements');
  assert.equal(fogEvents[0].commands.length, 12);
  assert.equal(fogEvents[0].commands[0], (900 / 60) % 1400 - 440);
  assert.equal(fogEvents[0].commands[1], -40);
  assert.deepEqual(fogEvents[0].commands.filter((_, i) => i % 4 >= 2), [920, 460, 920, 460, 920, 460]);
  assert.equal(fogEvents[0].smoke, 0);
  assert.equal(fogEvents[0].alpha, 0.13);
  new Float64Array(wasm.memory.buffer, wasm.fog_input_ptr(), 3).set([900, 1, 1]);
  assert.equal(wasm.draw_fog(), 3, 'Rust emits smoke placements and honors the reduced-quality tier');
  assert.equal(fogEvents[1].smoke, 1);
  assert.equal(fogEvents[1].alpha, 0.16);
  new Float64Array(wasm.memory.buffer, wasm.fog_input_ptr(), 3).set([900, 0, 2]);
  assert.equal(wasm.draw_fog(), 0, 'Rust suppresses ambient fog at performance tier two');
  assert.equal(wasm.fog_command_count(), 0, 'suppressed fog clears the previous command count');
  const fxOverlayInput = new Float64Array(wasm.memory.buffer, wasm.fx_overlay_input_ptr(), 7);
  fxOverlayInput.set([0, 1280, 720, 900, 0.8, 0.5, 1]);
  assert.equal(wasm.draw_fx_overlays(), 2, 'Rust batches storm and neon flashes in painter order');
  assert.deepEqual(fxOverlayEvents[0].filter((_, i) => i % 6 < 5), [0, 0, 0, 1280, 720, 1, 0, 0, 1280, 720]);
  assert.ok(Math.abs(fxOverlayEvents[0][5] - 0.28) < 1e-12 && Math.abs(fxOverlayEvents[0][11] - 0.175) < 1e-12);
  fxOverlayInput.set([0, 1280, 720, 900, 0.8, 0.5, 0]);
  assert.equal(wasm.draw_fx_overlays(), 0, 'Rust suppresses both flashes when reduced-flash setting is enabled');
  fxOverlayInput.set([1, 1280, 720, 110, 2.5, 0, 1]);
  assert.equal(wasm.draw_fx_overlays(), 1, 'Rust emits an alarm tint when its timer is active');
  assert.ok(Math.abs(fxOverlayEvents[1][5] - (0.06 + 0.07 * Math.sin(1))) < 1e-12, 'alarm tint keeps its sinusoidal pulse');
  fxOverlayInput.set([2, 1280, 720, 900, 0.65, 0, 1]);
  assert.equal(wasm.draw_fx_overlays(), 2, 'Rust emits the two cinematic bars');
  assert.deepEqual(fxOverlayEvents[2].filter((_, i) => i % 6 < 4), [3, 0, 0, 1280, 3, 0, 657.6, 1280]);
  assert.ok(Math.abs(fxOverlayEvents[2][4] - 62.4) < 1e-12 && Math.abs(fxOverlayEvents[2][10] - 62.4) < 1e-12);
  fxOverlayInput.set([2, 1280, 720, 900, -1, 0, 1]);
  assert.equal(wasm.draw_fx_overlays(), 0, 'Rust rejects negative cinematic progress');
  assert.equal(wasm.fx_overlay_command_count(), 0, 'invalid effect input clears the previous command count');
  fxOverlayInput.set([3, 1280, 720, 0, 0.12, 0, 1]);
  assert.equal(wasm.draw_fx_overlays(), 1, 'Rust emits the countdown warning flash');
  assert.deepEqual(fxOverlayEvents[3], [4, 0, 0, 1280, 720, 0.12]);
  fxOverlayInput.set([3, 1280, 720, 0, 0.12, 0, 0]);
  assert.equal(wasm.draw_fx_overlays(), 0, 'Rust respects disabled overlay state for the countdown flash');
  new Float64Array(wasm.memory.buffer, wasm.world_light_meta_ptr(), 8).set([132.3, 0.4, 1, 1, 100, 200, 1, 1]);
  new Float64Array(wasm.memory.buffer, wasm.world_light_input_ptr(), 15).set([
    10, 20, 5, 0, 1,
    30, 40, 10, 0.5, 0,
    50, 60, 20, 3.5, 1
  ]);
  assert.equal(wasm.draw_world_lights(3), 4, 'Rust emits enabled lights, fire flash, and rain reflection');
  assert.deepEqual(worldLightEvents[0].filter((_, i) => i % 7 < 6), [
    0, 0, 5, 15, 10, 10,
    0, 2, 30, 40, 40, 40,
    1, 0, 10, 110, 180, 180,
    2, 0, 100, 214, 14, 5
  ]);
  assert.ok(Math.abs(worldLightEvents[0][6] - (0.22 * (0.55 + 0.45 * Math.sin(132.3 / 520)) * 0.4 * 0.4)) < 1e-12, 'Rust preserves dimmed glow pulse and neon flicker alpha');
  assert.ok(Math.abs(worldLightEvents[0][13] - (0.22 * (0.55 + 0.45 * Math.sin(132.3 / 520 + 3.5)) * 0.4 * 0.4)) < 1e-12, 'Rust preserves phase-specific neon flicker and light pulse');
  assert.equal(worldLightEvents[0][20], 1, 'muzzle flash remains fully visible');
  assert.equal(worldLightEvents[0][27], 0.12, 'rain reflection retains its alpha');
  new Float64Array(wasm.memory.buffer, wasm.world_light_meta_ptr(), 8).set([500, 1, 0, 2, 100, 200, 0, 0]);
  assert.equal(wasm.draw_world_lights(3), 2, 'Rust applies the reduced-quality light stride');
  assert.equal(worldLightEvents[1][1], 0, 'stride two keeps the first active light');
  assert.equal(worldLightEvents[1][8], 2, 'stride two selects the third light');
  assert.equal(wasm.draw_world_lights(7), 0, 'Rust rejects light batches above the fixed capacity');
  assert.equal(wasm.world_light_command_count(), 0, 'rejected light batches clear the prior command count');
  const rings = new Float64Array(wasm.memory.buffer, wasm.world_ring_input_ptr(), 18);
  rings.set([12, 24, 60, 0.225, 0.45, 1, 40, 50, 26, 0.45, 0.45, 0, NaN, 0, 10, 1, 1, 0]);
  assert.equal(wasm.draw_world_rings(3, 2), 2, 'Rust filters inactive and invalid world rings while preserving order');
  assert.deepEqual(worldRingEvents[0], [12, 24, 37.5, 4, 0.5, 1, 40, 50, 6.5, 7, 1, 0]);
  assert.equal(wasm.draw_world_rings(15, 1), 0, 'Rust rejects world-ring batches above their fixed capacity');
  assert.equal(wasm.world_ring_command_count(), 0, 'rejected world-ring batches clear their command count');
  new Float64Array(wasm.memory.buffer, wasm.invasion_zone_input_ptr(), 3).set([20, 35, 65]);
  assert.equal(wasm.draw_invasion_zone(), 1, 'Rust emits the animated Invasion-zone marker');
  assert.deepEqual(invasionZoneEvents[0].slice(0, 3), [20, 35, 34]);
  assert.ok(Math.abs(invasionZoneEvents[0][3] - (0.7 + 0.2 * Math.sin(0.25))) < 1e-10, 'Rust preserves the original Invasion pulse');
  assert.deepEqual(invasionZoneEvents[0].slice(4), [4, 0.14]);
  new Float64Array(wasm.memory.buffer, wasm.invasion_zone_input_ptr(), 3).set([20, 35, NaN]);
  assert.equal(wasm.draw_invasion_zone(), 0, 'Rust rejects invalid Invasion-zone timing');
  assert.equal(wasm.invasion_zone_command_count(), 0, 'invalid Invasion input clears the prior command count');
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
  assert.equal(wasm.paint_floor_grain_rgba(10, 20, grainSeed) >>> 0, grainReference.state(), 'RGBA grain returns the same seeded random state');
  assert.deepEqual([floorGrainRgbaEvents[0].width, floorGrainRgbaEvents[0].height], [10, 20]);
  const grainPixel = (grainY * 10 + grainX) * 4, grainRgba = floorGrainRgbaEvents[0].pixels;
  assert.equal(grainRgba[grainPixel + 3], grainColor ? 15 : 23, 'Rust rasterizes grain alpha into transparent RGBA pixels');
  assert.equal(grainRgba[grainPixel], grainColor ? 255 : 0, 'Rust rasterizes the correct grain color');
  assert.ok(grainRgba.filter((_, index) => index % 4 === 3).filter(alpha => alpha > 0).length >= grainWidth);
  assert.equal(wasm.paint_floor_grain_rgba(1441, 20, grainSeed), 0, 'Rust rejects grain surfaces beyond its bounded raster buffer');
  assert.equal(wasm.paint_floor_grain_rgba(10, 901, grainSeed), 0, 'Rust rejects grain surfaces beyond its bounded height');

  wasm.paint_floor_grain_rgba(80, 100, 0x5a17);
  const tileGrainBase = floorGrainRgbaEvents.at(-1).pixels;
  const tileInput = new Uint8Array(wasm.memory.buffer, wasm.floor_tile_pixels_ptr(), 72 * 24 * 4);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 72; x++) tileInput.set([x, y, 200, 255], (y * 72 + x) * 4);
  const tileRoomInput = new Float64Array(wasm.memory.buffer, wasm.rooms_ptr(), wasm.capacity() * 4);
  tileRoomInput.set([2, 3, 20, 30, 50, 60, 20, 20]);
  const tileRoomCount = wasm.paint_floor_tiles_rgba(2, 1, 2, 80, 100);
  assert.equal(tileRoomCount, 1, 'Rust composites only the non-hall room');
  const tileOutput = floorGrainRgbaEvents.at(-1).pixels;
  const sampleOffset = (3 * 80 + 3) * 4, sampleAlpha = tileGrainBase[sampleOffset + 3];
  const sourceAlpha = 115, expectedAlpha = sourceAlpha + Math.floor(sampleAlpha * 140 / 255);
  const expectedTile = [51, 3, 200].map((source, channel) => {
    const destination = Math.floor((tileGrainBase[sampleOffset + channel] * sampleAlpha + 127) / 255);
    const sourcePremultiplied = Math.floor((source * sourceAlpha + 127) / 255);
    const outputPremultiplied = sourcePremultiplied + Math.floor(destination * 140 / 255);
    return Math.min(255, Math.floor((outputPremultiplied * 255 + Math.floor(expectedAlpha / 2)) / expectedAlpha));
  });
  assert.deepEqual(tileOutput.slice(sampleOffset, sampleOffset + 4), [...expectedTile, expectedAlpha], 'Rust repeats FTILES at the shifted pattern phase and source-over composites it onto grain');
  const hallOffset = (65 * 80 + 55) * 4;
  assert.deepEqual(tileOutput.slice(hallOffset, hallOffset + 4), tileGrainBase.slice(hallOffset, hallOffset + 4), 'Rust leaves the hall tile overlay untouched');
  tileRoomInput[0] = 2.5;
  assert.equal(wasm.paint_floor_tiles_rgba(1, -1, 0, 80, 100), -1, 'Rust selects the legacy fallback for fractional room geometry');

  floorEvents.length = 0;
  const floorSolids = new Float64Array(wasm.memory.buffer, wasm.rooms_ptr(), wasm.capacity() * 4);
  floorSolids.set([1, 2, 3, 4, 10, 20, 5, 6]);
  const floorRectsBeforeFinish = wasm.floor_rects();
  wasm.paint_floor_finish(2, 49, 25);
  assert.deepEqual(floorEvents, [
    [0, 6, 9, 3, 4], [0, 15, 27, 5, 6],
    [1, 0, 0, 1, 25], [1, 24, 0, 1, 25], [1, 48, 0, 1, 25],
    [1, 0, 0, 49, 1], [1, 0, 24, 49, 1]
  ], 'Rust keeps floor shadows and vertical/horizontal grout in source order');
  assert.equal(wasm.floor_rects() - floorRectsBeforeFinish, 7, 'Rust emits two solid shadows, three vertical grout lines, and two horizontal grout lines');

  const finishRgba = new Uint8Array(wasm.memory.buffer, floorGrainRgbaEvents.at(-1).pointer, 80 * 100 * 4);
  for (let pixel = 0; pixel < 80 * 100; pixel++) finishRgba.set([100, 150, 200, 255], pixel * 4);
  floorSolids.set([-3, -5, 2.5, 1.5]);
  const finishRgbaEventsBefore = floorGrainRgbaEvents.length, finishRgbaRectsBefore = wasm.floor_rects();
  assert.equal(wasm.paint_floor_finish_rgba(1, 80, 100), 10, 'Rust rasterizes one solid shadow and the 4+5 grout lines');
  const finishRgbaPixels = floorGrainRgbaEvents.at(-1).pixels;
  assert.deepEqual(finishRgbaPixels.slice((2 * 80 + 3) * 4, (2 * 80 + 3) * 4 + 4), [67, 101, 135, 255], 'Rust darkens the fully covered pixel with the original 0.32 solid-shadow alpha');
  assert.deepEqual(finishRgbaPixels.slice((2 * 80 + 4) * 4, (2 * 80 + 4) * 4 + 4), [83, 125, 167, 255], 'Rust antialiases fractional shadow edges by pixel coverage');
  assert.deepEqual(finishRgbaPixels.slice((10 * 80 + 24) * 4, (10 * 80 + 24) * 4 + 4), [92, 139, 185, 255], 'Rust rasterizes the original 0.07 vertical grout opacity');
  assert.deepEqual(finishRgbaPixels.slice((10 * 80 + 10) * 4, (10 * 80 + 10) * 4 + 4), [100, 150, 200, 255], 'Rust leaves pixels outside shadows and grout unchanged');
  assert.equal(wasm.floor_rects() - finishRgbaRectsBefore, 10);
  assert.equal(floorGrainRgbaEvents.length, finishRgbaEventsBefore + 1, 'Rust emits one finished floor image');
  floorSolids[2] = -2;
  assert.equal(wasm.paint_floor_finish_rgba(1, 80, 100), -1, 'Rust rejects negative solid geometry for the Canvas fallback');

  const mapTextureSheetPixels = new Uint8Array(wasm.memory.buffer, wasm.map_texture_sheet_pixels_ptr(), 144 * 24 * 4);
  mapTextureSheetPixels.fill(0);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 48; x++) {
    mapTextureSheetPixels.set([x, y, 77, 255], (y * 48 + x) * 4);
  }
  assert.equal(wasm.copy_map_texture_sprite(3, 48, 24, 24, 0), 1, 'Rust crops a 24x24 map sprite from a spritesheet');
  const mapTexturePixels = new Uint8Array(wasm.memory.buffer, wasm.map_texture_pixels_ptr(), 8 * 24 * 24 * 4);
  assert.deepEqual(Array.from(mapTexturePixels.slice((3 * 24 * 24) * 4, (3 * 24 * 24) * 4 + 4)), [24, 0, 77, 255]);
  assert.deepEqual(Array.from(mapTexturePixels.slice((3 * 24 * 24 + 23 * 24 + 23) * 4, (3 * 24 * 24 + 23 * 24 + 23) * 4 + 4)), [47, 23, 77, 255]);
  assert.equal(wasm.copy_map_texture_sprite(3, 48, 24, 25, 0), 0, 'Rust rejects a crop that exceeds the spritesheet bounds');
  assert.equal(wasm.copy_map_texture_sprite(8, 48, 24, 0, 0), 0, 'Rust rejects a texture slot outside the fixed table');
  mapTexturePixels.fill(0);
  mapTexturePixels.fill(0);
  for (let slot = 0; slot < 7; slot++) for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    mapTexturePixels.set([x, y, slot, 255], ((slot * 24 * 24) + (y * 24 + x)) * 4);
  }
  for (let pixel = 0; pixel < 24 * 24; pixel++) mapTexturePixels.set([220, 120, 40, 255], (7 * 24 * 24 + pixel) * 4);
  const mapTextureSolids = new Float64Array(wasm.memory.buffer, wasm.rooms_ptr(), wasm.capacity() * 4);
  mapTextureSolids.set([0, 0, 24, 60, 40, 20, 40, 40]);
  const mapTextureOpenings = new Float64Array(wasm.memory.buffer, wasm.breakable_data_ptr(), wasm.capacity() * 5);
  mapTextureOpenings.set([10, 20, 130, 20, 0, 0, 0, 40, 100, 0, 0, 0, 200, 200, 0]);
  const mapTextureRgbaEventsBefore = floorGrainRgbaEvents.length;
  assert.equal(wasm.paint_map_textures_rgba(2, 3, 1, 1, 1, 24, 80, 100), 4, 'Rust rasterizes two repeated surface sprites and only the two valid door decals');
  const mapTextureRgba = floorGrainRgbaEvents.at(-1).pixels;
  assert.deepEqual(mapTextureRgba.slice((5 * 80 + 5) * 4, (5 * 80 + 5) * 4 + 4), [5, 5, 0, 255], 'wall texture repeats from the canvas origin');
  assert.deepEqual(mapTextureRgba.slice((25 * 80 + 45) * 4, (25 * 80 + 45) * 4 + 4), [21, 1, 2, 255], 'furniture texture selects index modulo six and repeats');
  assert.deepEqual(mapTextureRgba.slice((30 * 80 + 70) * 4, (30 * 80 + 70) * 4 + 4), [220, 120, 40, 255], 'horizontal open-door sprite is rasterized with its selected rotation');
  assert.deepEqual(mapTextureRgba.slice((50 * 80 + 20) * 4, (50 * 80 + 20) * 4 + 4), [220, 120, 40, 255], 'vertical open-door sprite is rasterized without the horizontal rotation');
  assert.deepEqual(mapTextureRgba.slice((80 * 80 + 20) * 4, (80 * 80 + 20) * 4 + 4), [0, 0, 0, 0], 'map texture layer keeps untouched pixels transparent');
  assert.equal(floorGrainRgbaEvents.length, mapTextureRgbaEventsBefore + 1, 'Rust uploads the completed map texture layer once');
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) mapTexturePixels.set([1, y, 0, 255], ((7 * 24 * 24) + (y * 24 + x)) * 4);
  assert.equal(wasm.paint_map_textures_rgba(0, 1, 0, 0, 1, 24, 80, 100), 1);
  assert.deepEqual(floorGrainRgbaEvents.at(-1).pixels.slice((30 * 80 + 75) * 4, (30 * 80 + 75) * 4 + 4), [1, 10, 0, 255], 'rotated door image uses the Canvas-measured nearest source row');
  mapTextureSolids[2] = -1;
  assert.equal(wasm.paint_map_textures_rgba(1, 0, 1, 0, 0, 24, 80, 100), -1, 'Rust rejects invalid surface geometry before rasterizing');

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
  const barrelInput = new Float64Array(wasm.memory.buffer, wasm.world_barrel_input_ptr(), 16 * 4);
  barrelInput.set([10, 20, 12, -1, 30, 40, 10, 0.1]);
  assert.equal(wasm.draw_world_barrels(2, 70), 2, 'Rust emits all valid barrels using the original armed blink timing');
  assert.equal(furnitureEvents.length, 34, 'each barrel emits a balanced 17-command Canvas sequence');
  assert.deepEqual(furnitureEvents.slice(0, 2), [[16, 0, 0, 0, 0, 0, 0, 0], [19, 0, 10, 20, 0, 0, 0, 0]]);
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 108), 'barrel glow uses the translucent orange palette');
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 110), 'unarmed barrel body is dark red');
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 109), 'armed barrel body blinks white at the original phase');
  assert.ok(furnitureEvents.some(command => command[0] === 6 && command[2] === -8 && command[3] === -6.5 && command[4] === 16 && command[5] === 3));
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 2, 'barrel drawing balances both context saves');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  assert.equal(wasm.draw_world_barrels(17, 70), 0, 'Rust rejects barrel batches above the fixed capacity');
  assert.equal(furnitureEvents.length, 0, 'invalid barrel batch emits no Canvas commands');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const cameraInput = new Float64Array(wasm.memory.buffer, wasm.world_camera_input_ptr(), 8 * 30);
  cameraInput.set([10, 20, 0.25, 0, 11, 22, 13, 24, 15, 26, 17, 28, 19, 30, 21, 32, 23, 34, 25, 36, 27, 38, 29, 40, 31, 42, 33, 44, 35, 46]);
  cameraInput.set([50, 60, -0.5, 1, ...Array.from({ length: 26 }, (_, point) => point + 100)], 30);
  assert.equal(wasm.draw_world_cameras(2), 2, 'Rust emits cone, camera body and lens commands for each valid camera');
  assert.equal(furnitureEvents.length, 62, 'each camera emits a 31-command Canvas sequence');
  assert.deepEqual(furnitureEvents.slice(0, 4), [[16, 0, 0, 0, 0, 0, 0, 0], [4, 114, 0, 0, 0, 0, 0, 0], [8, 0, 0, 0, 0, 0, 0, 0], [9, 0, 10, 20, 0, 0, 0, 0]]);
  assert.ok(furnitureEvents.some(command => command[0] === 35 && command[1] === 1), 'camera sector closes its Canvas path');
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 113), 'hot camera sector uses the alarm palette');
  assert.ok(furnitureEvents.some(command => command[0] === 7 && command[2] === -7 && command[3] === -5 && command[4] === 14 && command[5] === 10));
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 2, 'camera drawing balances each Canvas save');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  cameraInput[4] = NaN;
  assert.equal(wasm.draw_world_cameras(1), 0, 'Rust rejects cameras with invalid cone coordinates');
  assert.equal(furnitureEvents.length, 0, 'invalid camera emits no partial drawing commands');
  assert.equal(wasm.draw_world_cameras(9), 0, 'Rust rejects camera batches above their fixed capacity');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const enemyAccentInput = new Float64Array(wasm.memory.buffer, wasm.world_enemy_input_ptr(), 256 * 13);
  enemyAccentInput.set([10, 20, 15, 1, 2.5, 0.1, 0, 0, 0, 0, 2, 2, 1,
    30, 40, 12, 2, 1, -0.2, 0, 0, 0, 0, 3, 3, 1,
    50, 60, 11, 0, 1, 0.5, 0.35, 1, 0, 0, 4, 4, 0.8,
    70, 80, 20, 3, 10, 0, 0, 0, 1, -0.25, 5, 6, 0.9]);
  assert.equal(wasm.draw_world_enemy_accents(4, 160), 4, 'Rust emits accents for armored, leader, sniper and boss states');
  assert.ok(furnitureEvents.some(command => command[0] === 6 && command[2] === -9 && command[3] === -27 && command[4] === 5 && command[5] === 3));
  assert.ok(furnitureEvents.some(command => command[0] === 37 && command[1] === 2), 'dynamic enemy class colors are selected through the bridge palette');
  assert.ok(furnitureEvents.some(command => command[0] === 38 && command[2] === 8 && command[3] === 6), 'boss charge warning preserves its dash pattern');
  assert.ok(furnitureEvents.some(command => command[0] === 10 && Math.abs(command[2] - (70 + Math.sin(-0.25 + Math.PI / 2) * 420)) < 1), 'boss charge vector is generated in Rust');
  assert.ok(furnitureEvents.some(command => command[0] === 10 && Math.abs(command[2] - (50 + Math.sin(0.5 + Math.PI / 2) * 560)) < 1), 'sniper telegraph vector is generated in Rust');
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 7, 'enemy accent contexts restore across sniper/boss transitions');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  assert.equal(wasm.draw_world_enemy_accents(257, 160), 0, 'Rust rejects enemy accent batches above their fixed capacity');
  assert.equal(wasm.draw_world_enemy_accents(1, NaN), 0, 'Rust rejects a non-finite effect clock');
  assert.equal(furnitureEvents.length, 0, 'rejected enemy accent batches emit no partial Canvas commands');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const frameTransformInput = new Float64Array(wasm.memory.buffer, wasm.frame_transform_input_ptr(), 15);
  frameTransformInput.set([0.14, 10, 1, 0, 2, -1, 3, 0.5, 0, 1, 960, 600, 1.25, 120, 80]);
  assert.equal(wasm.draw_frame_transforms(0), 2, 'Rust opens the outer Canvas scope and emits screen shake');
  assert.equal(wasm.draw_frame_transforms(1), 3, 'Rust opens the world scope and emits kick and camera shake');
  assert.deepEqual(furnitureEvents, [
    [16, 0, 0, 0, 0, 0, 0, 0], [19, 0, 5, -5, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0, 0, 0], [19, 0, 1, -0.5, 0, 0, 0, 0], [19, 0, -0.75, 0.75, 0, 0, 0, 0]
  ]);
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  assert.equal(wasm.draw_frame_transforms(2), 4, 'Rust emits the screen center, zoom, inverse center, and camera offset sequence');
  assert.deepEqual(furnitureEvents, [
    [19, 0, 480, 300, 0, 0, 0, 0], [39, 0, 1.25, 1.25, 0, 0, 0, 0],
    [19, 0, -480, -300, 0, 0, 0, 0], [19, 0, -120, -80, 0, 0, 0, 0]
  ]);
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  frameTransformInput[10] = 0;
  assert.equal(wasm.draw_frame_transforms(2), 0, 'Rust rejects invalid camera dimensions');
  assert.equal(furnitureEvents.length, 0, 'invalid camera dimensions emit no partial transforms');
  frameTransformInput[10] = 960;
  frameTransformInput[2] = 2;
  assert.equal(wasm.draw_frame_transforms(0), 0, 'Rust rejects non-normalized screen shake randomness without partial save');
  assert.equal(furnitureEvents.length, 0, 'invalid frame transforms emit no partial Canvas commands');
  assert.equal(wasm.draw_frame_transforms(3), 1, 'Rust closes the world transform scope');
  assert.equal(wasm.draw_frame_transforms(4), 1, 'Rust closes the outer frame scope');
  assert.deepEqual(furnitureEvents.map(command => command[0]), [2, 2], 'Rust balances both saved Canvas scopes');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  const glassPanels = new Float64Array(wasm.memory.buffer, wasm.glass_panel_input_ptr(), 96 * 4);
  const glassShards = new Float64Array(wasm.memory.buffer, wasm.glass_shard_input_ptr(), 160 * 7);
  glassPanels.set([10, 20, 40, 50]); glassShards.set([30, 40, Math.PI / 2, 0.5, 1, 4, 2]);
  assert.equal(wasm.draw_glass(1, 1, 40, 0.8), 2, 'Rust emits intact glass and active shard geometry');
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 118), 'glass panel fill color is preserved');
  assert.ok(furnitureEvents.some(command => command[0] === 5 && command[1] === 119), 'glass panel edge color is preserved');
  assert.ok(furnitureEvents.some(command => command[0] === 18 && Math.abs(command[2] - 0.6) < 1e-9), 'glass shimmer/shard alpha follows its timer');
  assert.ok(furnitureEvents.some(command => command[0] === 4 && command[1] === 124), 'shard color index remains mapped to its original palette');
  assert.equal(furnitureEvents.filter(command => command[0] === 2).length, 2, 'glass panels and shards restore Canvas state');
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  glassPanels[2] = 2;
  assert.equal(wasm.draw_glass(1, 1, 40, 0.8), 0, 'Rust rejects invalid glass geometry');
  assert.equal(furnitureEvents.length, 0, 'invalid glass input emits no partial Canvas commands');
  glassPanels[2] = 40;
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
  furnitureEvents.length = 0; furnitureBatchCalls = 0;
  new Float64Array(wasm.memory.buffer, wasm.ghost_input_ptr(), 20).set([10, 20, 0.5, 0.06]);
  const ghostCommandCount = wasm.draw_ghosts(1, 0);
  assert.equal(ghostCommandCount, furnitureEvents.length, 'Rust ghost commands should match the flushed Canvas batch');
  assert.equal(furnitureBatchCalls, 1, 'all ghost geometry should flush in one host batch');
  assert.deepEqual(furnitureEvents.slice(0, 9), [
    [16, 0, 0, 0, 0, 0, 0, 0], [18, 0, 0.06, 0, 0, 0, 0, 0],
    [23, 10, 0, 0, 0, 0, 0, 0], [8, 0, 0, 0, 0, 0, 0, 0], [12, 0, 13, 25, 12, 10, 0, 6.28],
    [13, 0, 0, 0, 0, 0, 0, 0], [19, 0, 10, 20, 0, 0, 0, 0],
    [20, 0, 0.5, 0, 0, 0, 0, 0], [23, 1, 0, 0, 0, 0, 0, 0]
  ]);
  assert.ok(furnitureEvents.some(command => command[0] === 18 && command[2] === 0.015), 'ghost aura uses one quarter of its configured alpha');
  assert.ok(furnitureEvents.some(command => command[0] === 23 && command[1] === 3), 'ghost body uses its cyan palette');
  assert.equal(furnitureEvents.at(-1)[0], 2, 'ghost command sequence restores its outer Canvas state');

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
  new Float64Array(wasm.memory.buffer, wasm.shop_dealer_input_ptr(), 8).set([100, 200, 0.25, 1.5, -1, 0.5, 0, 0]);
  assert.equal(wasm.draw_shop_dealer(), 12, 'Rust emits ordered dealer shadow, body, face, hat, and timer geometry');
  const dealerGeometry = hudShapeEvents.at(-1);
  assert.equal(dealerGeometry.length, 12 * 7);
  assert.deepEqual(Array.from({ length: 12 }, (_, index) => dealerGeometry[index * 7]), [2, 3, 2, 0, 0, 0, 4, 4, 4, 4, 0, 5]);
  assert.deepEqual(dealerGeometry.slice(0, 7), [2, 100, 210, 12, 5.5, 13, 0], 'falling dealer shadow shrinks with the descent');
  assert.deepEqual(dealerGeometry.slice(7, 14), [3, 100, 166.5, -1, 1, 14, 0], 'Rust computes the falling dealer body position and facing');
  assert.deepEqual(dealerGeometry.slice(-7), [5, 100, 206, 30, 0.5, 21, 3], 'Rust preserves timer radius, progress, color, and stroke');
  new Float64Array(wasm.memory.buffer, wasm.shop_dealer_input_ptr(), 8).set([100, 200, 0, 0, 1, 0.2, 1, 1]);
  assert.equal(wasm.draw_shop_dealer(), 11, 'Rust omits the timer while dealer is falling');
  assert.equal(hudShapeEvents.at(-1).at(-7), 0, 'falling dealer emits no arc command');
  new Float64Array(wasm.memory.buffer, wasm.shop_dealer_input_ptr(), 8).set([NaN, 200, 0, 0, 1, 1, 0, 0]);
  assert.equal(wasm.draw_shop_dealer(), 0, 'Rust rejects non-finite dealer geometry for Canvas fallback');
  new Float64Array(wasm.memory.buffer, wasm.shop_panel_input_ptr(), 7).set([0, 100, 150, 210, 46, 22, 0]);
  assert.equal(wasm.draw_shop_panel(), 2, 'Rust emits speech panel and pointer');
  assert.deepEqual(hudShapeEvents.at(-1), [0, -5, 150, 210, 46, 22, 0, 6, 100, 196, 6, 9, 22, 0]);
  new Float64Array(wasm.memory.buffer, wasm.shop_panel_input_ptr(), 7).set([1, 100, 200, 112, 54, 24, 0]);
  assert.equal(wasm.draw_shop_panel(), 2, 'Rust emits card fill and dynamic outline');
  assert.deepEqual(hudShapeEvents.at(-1), [0, 44, 173, 112, 54, 23, 0, 1, 45.5, 174.5, 109, 51, 24, 3]);
  new Float64Array(wasm.memory.buffer, wasm.shop_panel_input_ptr(), 7).set([2, 100, 200, 112, 40, 18, 0]);
  assert.equal(wasm.draw_shop_panel(), 2, 'Rust emits reroll fill and yellow outline');
  assert.deepEqual(hudShapeEvents.at(-1), [0, 44, 180, 112, 40, 23, 0, 1, 45.5, 181.5, 109, 37, 18, 3]);
  new Float64Array(wasm.memory.buffer, wasm.shop_panel_input_ptr(), 7).set([3, 100, 200, 112, 40, 18, 0]);
  assert.equal(wasm.draw_shop_panel(), 0, 'Rust rejects unsupported shop panel kind');
  new Float64Array(wasm.memory.buffer, wasm.radial_sprite_input_ptr(), 5).set([2.5, 255, 46, 147, 1]);
  assert.equal(wasm.generate_radial_sprite(), 5, 'Rust emits a 5x5 radial sprite');
  assert.deepEqual([radialSpriteEvents[0].width, radialSpriteEvents[0].height], [5, 5]);
  assert.deepEqual(radialSpriteEvents[0].pixels.slice((2 * 5 + 2) * 4, (2 * 5 + 2) * 4 + 4), [255, 46, 147, 255], 'Rust writes full alpha at the center');
  assert.deepEqual(radialSpriteEvents[0].pixels.slice((1 * 5 + 2) * 4, (1 * 5 + 2) * 4 + 4), [255, 46, 147, 153], 'Rust interpolates radial alpha one pixel from center');
  assert.deepEqual(radialSpriteEvents[0].pixels.slice(0, 4), [0, 0, 0, 0], 'fully transparent radial pixels keep zeroed RGB');
  new Float64Array(wasm.memory.buffer, wasm.radial_sprite_input_ptr(), 5).set([330, 0, 0, 0, 0.95]);
  assert.equal(wasm.generate_radial_sprite(), 660, 'Rust supports the maximum darkness sprite');
  new Float64Array(wasm.memory.buffer, wasm.radial_sprite_input_ptr(), 5).set([331, 0, 0, 0, 1]);
  assert.equal(wasm.generate_radial_sprite(), 0, 'Rust rejects sprites beyond the fixed pixel buffer');
  new Float64Array(wasm.memory.buffer, wasm.radial_sprite_input_ptr(), 5).set([65.5, 255, 46, 147, 0.5]);
  assert.equal(wasm.generate_radial_sprite(), 131, 'Rust generates the representative 65.5-radius radial sprite');
  const optimizedRadial = radialSpriteEvents.at(-1), radial = 65.5;
  let maxRadialAlphaDiff = 0;
  for (let y = 0; y < optimizedRadial.height; y++) for (let x = 0; x < optimizedRadial.width; x++) {
    const dx = x + 0.5 - radial, dy = y + 0.5 - radial;
    const expected = Math.floor(0.5 * Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / radial) * 255 + 0.5);
    maxRadialAlphaDiff = Math.max(maxRadialAlphaDiff, Math.abs(optimizedRadial.pixels[(y * optimizedRadial.width + x) * 4 + 3] - expected));
  }
  assert.ok(maxRadialAlphaDiff <= 1, `three-step radial square root stays within one alpha level (observed ${maxRadialAlphaDiff})`);
  const fogInput = new Float64Array(wasm.memory.buffer, wasm.fog_sprite_input_ptr(), 27);
  for (let i = 0; i < 9; i++) fogInput.set(i === 0 ? [100, 100, 100] : [512, 256, 0.01], i * 3);
  assert.equal(wasm.generate_fog_sprite(), 1, 'Rust emits the 512x256 cached fog sprite');
  const fogPixels = radialSpriteEvents.at(-1);
  assert.deepEqual([fogPixels.width, fogPixels.height], [512, 256]);
  assert.deepEqual(fogPixels.pixels.slice((100 * 512 + 100) * 4, (100 * 512 + 100) * 4 + 4), [255, 255, 255, 139], 'Rust rasterizes the fog radial-gradient center');
  fogInput[2] = 0;
  assert.equal(wasm.generate_fog_sprite(), 0, 'Rust rejects invalid fog rings for the Canvas fallback');
  assert.equal(wasm.generate_muzzle_sprite(), 128, 'Rust creates one reusable muzzle-flash sprite');
  assert.deepEqual([muzzleSpriteEvents[0].width, muzzleSpriteEvents[0].height], [128, 128]);
  const muzzlePixels = muzzleSpriteEvents[0].pixels;
  assert.equal(muzzlePixels[(64 * 128 + 64) * 4 + 3], 255, 'muzzle sprite center is opaque');
  assert.deepEqual(muzzlePixels.slice(0, 4), [0, 0, 0, 0], 'muzzle sprite exterior is transparent');
  console.log(`Rust/WASM checks passed (Canvas ABI, enemy body/status labels/order, floor RNG/geometry, furniture/weapons/doors including Neon sprites, shop dealer geometry, player and ghost composition, aura and sprite/pixel parity; FTILES export ${floorTilesExported ? 'validated' : 'not in packaged v74 binary, JS fallback active'}).`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });

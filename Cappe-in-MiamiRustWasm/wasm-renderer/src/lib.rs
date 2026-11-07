#![no_std]

use core::panic::PanicInfo;

static mut CANVAS_CALLS: u32 = 0;
static mut PROPERTY_WRITES: u32 = 0;
static mut ENEMY_BATCHES: u32 = 0;
static mut ENEMY_EVENT_COUNT: u32 = 0;
static mut ENEMY_SHADOW_COUNT: u32 = 0;
static mut ENEMY_BODY_COMMAND_COUNT: u32 = 0;
static mut FLOOR_RECTS: u32 = 0;
const FLOOR_GRAIN_MAX_WIDTH: usize = 1440;
const FLOOR_GRAIN_MAX_HEIGHT: usize = 900;
static mut FLOOR_GRAIN_PIXELS: [u8; FLOOR_GRAIN_MAX_WIDTH * FLOOR_GRAIN_MAX_HEIGHT * 4] = [0; FLOOR_GRAIN_MAX_WIDTH * FLOOR_GRAIN_MAX_HEIGHT * 4];
static mut FLOOR_TILE_PIXELS: [u8; 72 * 24 * 4] = [0; 72 * 24 * 4];
static mut MAP_TEXTURE_PIXELS: [u8; 8 * 24 * 24 * 4] = [0; 8 * 24 * 24 * 4];
static mut MAP_TEXTURE_SHEET_PIXELS: [u8; 144 * 24 * 4] = [0; 144 * 24 * 4];
static mut DUST_COMMAND_COUNT: u32 = 0;
static mut SPARK_COMMAND_COUNT: u32 = 0;
static mut BLOOD_COMMAND_COUNT: u32 = 0;
static mut STATIC_BLOOD_COMMAND_COUNT: u32 = 0;
static mut CORPSE_COMMAND_COUNT: u32 = 0;
static mut BULLET_COMMAND_COUNT: u32 = 0;
static mut LAYER_COMMAND_COUNT: u32 = 0;
static mut SHELL_COMMAND_COUNT: u32 = 0;
static mut DARK_OUTLINE_COUNT: u32 = 0;
static mut FX_COMMAND_COUNT: u32 = 0;
static mut PICKUP_COMMAND_COUNT: u32 = 0;
static mut THROW_COMMAND_COUNT: u32 = 0;
static mut TRANSPORT_COMMAND_COUNT: u32 = 0;
static mut EXIT_COMMAND_COUNT: u32 = 0;
static mut COLOR_GRADE_COMMAND_COUNT: u32 = 0;
static mut FINAL_OVERLAY_COMMAND_COUNT: u32 = 0;
static mut HUD_SHAPE_COMMAND_COUNT: u32 = 0;
static mut HUD_TEXT_COMMAND_COUNT: u32 = 0;
static mut RAIN_COMMAND_COUNT: u32 = 0;
static mut WEATHER_MOTE_COMMAND_COUNT: u32 = 0;
static mut FOG_COMMAND_COUNT: u32 = 0;
static mut FX_OVERLAY_COMMAND_COUNT: u32 = 0;
static mut WORLD_LIGHT_COMMAND_COUNT: u32 = 0;
static mut WORLD_RING_COMMAND_COUNT: u32 = 0;
static mut INVASION_ZONE_COMMAND_COUNT: u32 = 0;

const MAX_POINTS: usize = 8192;
const MAX_PLAYERS: usize = 3;
const MAX_GHOSTS: usize = 5;
const FLOOR_BATCH_SIZE: usize = 4096;
const FURN_BATCH_SIZE: usize = 4096;
const ENEMY_BODY_COMMAND_CAPACITY: usize = 65536;
static mut FLOOR_COMMAND_COUNT: u32 = 0;
static mut FLOOR_COMMANDS: [f64; FLOOR_BATCH_SIZE * 5] = [0.0; FLOOR_BATCH_SIZE * 5];
static mut FURN_COMMAND_COUNT: u32 = 0;
static mut FURN_COMMANDS: [f64; FURN_BATCH_SIZE * 8] = [0.0; FURN_BATCH_SIZE * 8];
static mut PLAYER_PIXELS: [u32; 24 * 24] = [0; 24 * 24];
static mut PLAYER_PALETTE: [u32; 12] = [0; 12];
static mut DUST_INPUT: [f64; MAX_POINTS * 3] = [0.0; MAX_POINTS * 3];
static mut DUST_COMMANDS: [f64; MAX_POINTS * 3] = [0.0; MAX_POINTS * 3];
static mut SPARK_INPUT: [f64; MAX_POINTS * 5] = [0.0; MAX_POINTS * 5];
static mut SPARK_COMMANDS: [f64; MAX_POINTS * 6] = [0.0; MAX_POINTS * 6];
static mut BLOOD_INPUT: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
static mut BLOOD_COMMANDS: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
static mut CORPSE_INPUT: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
static mut CORPSE_COMMANDS: [f64; MAX_POINTS * 14] = [0.0; MAX_POINTS * 14];
static mut BULLET_INPUT: [f64; MAX_POINTS * 3] = [0.0; MAX_POINTS * 3];
static mut BULLET_COMMANDS: [f64; MAX_POINTS * 3] = [0.0; MAX_POINTS * 3];
static mut LAYER_COMMAND: [f64; 8] = [0.0; 8];
static mut SHELL_INPUT: [f64; MAX_POINTS * 3] = [0.0; MAX_POINTS * 3];
static mut SHELL_COMMANDS: [f64; MAX_POINTS * 5] = [0.0; MAX_POINTS * 5];
static mut DARK_OUTLINE_INPUT: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
static mut DARK_OUTLINE_COMMANDS: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
static mut FX_INPUT: [f64; MAX_POINTS * 6] = [0.0; MAX_POINTS * 6];
static mut FX_COMMANDS: [f64; MAX_POINTS * 6] = [0.0; MAX_POINTS * 6];
static mut PICKUP_INPUT: [f64; MAX_POINTS * 5] = [0.0; MAX_POINTS * 5];
static mut PICKUP_COMMANDS: [f64; MAX_POINTS * 5] = [0.0; MAX_POINTS * 5];
static mut THROW_INPUT: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
static mut THROW_COMMANDS: [f64; MAX_POINTS * 4] = [0.0; MAX_POINTS * 4];
const TRANSPORT_MAX: usize = 16;
const TRANSPORT_COMMANDS_PER_ITEM: usize = 24;
static mut TRANSPORT_INPUT: [f64; TRANSPORT_MAX * 6] = [0.0; TRANSPORT_MAX * 6];
static mut TRANSPORT_COMMANDS: [f64; TRANSPORT_MAX * TRANSPORT_COMMANDS_PER_ITEM * 8] = [0.0; TRANSPORT_MAX * TRANSPORT_COMMANDS_PER_ITEM * 8];
static mut EXIT_INPUT: [f64; 7] = [0.0; 7];
const EXIT_COMMAND_CAPACITY: usize = 128;
static mut EXIT_COMMANDS: [f64; EXIT_COMMAND_CAPACITY * 6] = [0.0; EXIT_COMMAND_CAPACITY * 6];
static mut COLOR_GRADE_INPUT: [f64; 2] = [0.0; 2];
static mut COLOR_GRADE_COMMANDS: [f64; 10] = [0.0; 10];
static mut FINAL_OVERLAY_INPUT: [f64; 5] = [0.0; 5];
static mut FINAL_OVERLAY_COMMANDS: [f64; 8] = [0.0; 8];
static mut HUD_SHAPE_INPUT: [f64; 4] = [0.0; 4];
static mut HUD_SHAPE_COMMANDS: [f64; 256] = [0.0; 256];
static mut BOSS_HEALTH_INPUT: [f64; 12] = [0.0; 12];
static mut SHOP_DEALER_INPUT: [f64; 8] = [0.0; 8];
static mut SHOP_PANEL_INPUT: [f64; 7] = [0.0; 7];
const RADIAL_MAX_SIDE: usize = 660;
static mut RADIAL_SPRITE_INPUT: [f64; 5] = [0.0; 5];
static mut RADIAL_SPRITE_PIXELS: [u8; RADIAL_MAX_SIDE * RADIAL_MAX_SIDE * 4] = [0; RADIAL_MAX_SIDE * RADIAL_MAX_SIDE * 4];
const MUZZLE_SPRITE_SIDE: usize = 128;
static mut MUZZLE_SPRITE_PIXELS: [u8; MUZZLE_SPRITE_SIDE * MUZZLE_SPRITE_SIDE * 4] = [0; MUZZLE_SPRITE_SIDE * MUZZLE_SPRITE_SIDE * 4];

#[inline]
fn radial_sqrt(value: f64) -> f64 {
    // A bit-level initial estimate is already close for the bounded pixel-distance range.
    // Three Newton steps keep the radial alpha within Canvas rounding tolerance while
    // avoiding twelve divisions per pixel in the previous implementation.
    let estimate = f64::from_bits((value.to_bits() >> 1) + 0x1ff8_0000_0000_0000);
    let estimate = (estimate + value / estimate) * 0.5;
    let estimate = (estimate + value / estimate) * 0.5;
    (estimate + value / estimate) * 0.5
}
static mut INVASION_ARROW_INPUT: [f64; 4] = [0.0; 4];
static mut INVASION_ARROW_POINTS: [f64; 6] = [0.0; 6];
static mut PAUSE_UI_INPUT: [f64; 3] = [0.0; 3];
const MAX_HUD_TEXTS: usize = 64;
static mut HUD_TEXT_INPUT: [f64; MAX_HUD_TEXTS * 5] = [0.0; MAX_HUD_TEXTS * 5];
static mut HUD_TEXT_COMMANDS: [f64; MAX_HUD_TEXTS * 5] = [0.0; MAX_HUD_TEXTS * 5];
const MAX_RAIN_DROPS: usize = 256;
static mut RAIN_INPUT: [f64; MAX_RAIN_DROPS * 3] = [0.0; MAX_RAIN_DROPS * 3];
static mut RAIN_COMMANDS: [f64; MAX_RAIN_DROPS * 4] = [0.0; MAX_RAIN_DROPS * 4];
const MAX_WEATHER_MOTES: usize = 128;
static mut WEATHER_MOTE_INPUT: [f64; MAX_WEATHER_MOTES * 4] = [0.0; MAX_WEATHER_MOTES * 4];
static mut WEATHER_MOTE_COMMANDS: [f64; MAX_WEATHER_MOTES * 4] = [0.0; MAX_WEATHER_MOTES * 4];
static mut FOG_INPUT: [f64; 3] = [0.0; 3];
static mut FOG_COMMANDS: [f64; 12] = [0.0; 12];
static mut FOG_SPRITE_INPUT: [f64; 27] = [0.0; 27];
static mut FX_OVERLAY_INPUT: [f64; 7] = [0.0; 7];
static mut FX_OVERLAY_COMMANDS: [f64; 24] = [0.0; 24];
const MAX_WORLD_LIGHTS: usize = 6;
static mut WORLD_LIGHT_META: [f64; 8] = [0.0; 8];
static mut WORLD_LIGHT_INPUT: [f64; MAX_WORLD_LIGHTS * 5] = [0.0; MAX_WORLD_LIGHTS * 5];
static mut WORLD_LIGHT_COMMANDS: [f64; (MAX_WORLD_LIGHTS + 2) * 7] = [0.0; (MAX_WORLD_LIGHTS + 2) * 7];
const MAX_WORLD_RINGS: usize = 14;
static mut WORLD_RING_INPUT: [f64; MAX_WORLD_RINGS * 6] = [0.0; MAX_WORLD_RINGS * 6];
static mut WORLD_RING_COMMANDS: [f64; MAX_WORLD_RINGS * 6] = [0.0; MAX_WORLD_RINGS * 6];
const MAX_WORLD_BARRELS: usize = 16;
static mut WORLD_BARREL_INPUT: [f64; MAX_WORLD_BARRELS * 4] = [0.0; MAX_WORLD_BARRELS * 4];
const MAX_WORLD_CAMERAS: usize = 8;
static mut WORLD_CAMERA_INPUT: [f64; MAX_WORLD_CAMERAS * 30] = [0.0; MAX_WORLD_CAMERAS * 30];
const MAX_WORLD_ENEMIES: usize = 256;
static mut WORLD_ENEMY_INPUT: [f64; MAX_WORLD_ENEMIES * 13] = [0.0; MAX_WORLD_ENEMIES * 13];
const MAX_GLASS_PANELS: usize = 96;
const MAX_GLASS_SHARDS: usize = 160;
static mut GLASS_PANEL_INPUT: [f64; MAX_GLASS_PANELS * 4] = [0.0; MAX_GLASS_PANELS * 4];
static mut GLASS_SHARD_INPUT: [f64; MAX_GLASS_SHARDS * 7] = [0.0; MAX_GLASS_SHARDS * 7];
static mut FRAME_TRANSFORM_INPUT: [f64; 15] = [0.0; 15];
static mut INVASION_ZONE_INPUT: [f64; 3] = [0.0; 3];
static mut INVASION_ZONE_COMMANDS: [f64; 6] = [0.0; 6];
static mut DARK_OVERLAY_INPUT: [f64; 10] = [0.0; 10];
static mut DARK_OVERLAY_COMMANDS: [f64; 8] = [0.0; 8];
static mut COMBO_TEXT_INPUT: [f64; 2] = [0.0; 2];
static mut COMBO_TEXT_COMMANDS: [f64; 2] = [0.0; 2];
static mut HUD_IMAGE_INPUT: [f64; 8] = [0.0; 8];
static mut HUD_IMAGE_COMMANDS: [f64; 5] = [0.0; 5];
static mut ALARM_TEXT_INPUT: [f64; 2] = [0.0; 2];
static mut ALARM_TEXT_COMMANDS: [f64; 3] = [0.0; 3];

#[repr(C)]
#[derive(Clone, Copy)]
struct Point {
    x: f64,
    y: f64,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct EnemyDrawData {
    angle: f64,
    fall: f64,
    color: u32,
    flags: u32, // bit 0 = type set; bit 1 = moving sprite
}

#[repr(C)]
#[derive(Clone, Copy)]
struct Rect {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct Furniture {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    kind: u32,
    variant: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct Door {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    angle: f64,
    vertical: u32,
    textured: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct NeonDoor {
    px: f64,
    py: f64,
    base_angle: f64,
    swing_angle: f64,
    ox: f64,
    oy: f64,
    sprite_index: u32,
    reserved: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct PlayerDrawData {
    x: f64,
    y: f64,
    angle: f64,
    animation: f64,
    attack_remaining: f64,
    state: u32, // 0 idle, 1 walk, 2 run, 3 attack
    flags: u32, // bit 0 = P2/remote, bit 1 = shadows, bit 2 = glow, bit 3 = skin accents
    weapon: u32,
    reserved: u32,
}

static mut INPUT: [Point; MAX_POINTS] = [Point { x: 0.0, y: 0.0 }; MAX_POINTS];
static mut ROOMS: [Rect; MAX_POINTS] = [Rect { x: 0.0, y: 0.0, w: 0.0, h: 0.0 }; MAX_POINTS];
static mut FURNITURE: [Furniture; MAX_POINTS] = [Furniture { x: 0.0, y: 0.0, w: 0.0, h: 0.0, kind: 0, variant: 0 }; MAX_POINTS];
static mut DOORS: [Door; MAX_POINTS] = [Door { x: 0.0, y: 0.0, w: 0.0, h: 0.0, angle: 0.0, vertical: 0, textured: 0 }; MAX_POINTS];
static mut NEON_DOORS: [NeonDoor; MAX_POINTS] = [NeonDoor { px: 0.0, py: 0.0, base_angle: 0.0, swing_angle: 0.0, ox: 0.0, oy: 0.0, sprite_index: 0, reserved: 0 }; MAX_POINTS];
static mut PLAYER_DRAW_DATA: [PlayerDrawData; MAX_PLAYERS] = [PlayerDrawData { x: 0.0, y: 0.0, angle: 0.0, animation: 0.0, attack_remaining: 0.0, state: 0, flags: 0, weapon: 0, reserved: 0 }; MAX_PLAYERS];
static mut GHOST_INPUT: [f64; MAX_GHOSTS * 4] = [0.0; MAX_GHOSTS * 4];
static mut VISIBLE: [u32; MAX_POINTS] = [0; MAX_POINTS];
static mut ENEMY_FLAGS: [u32; MAX_POINTS] = [0; MAX_POINTS];
static mut ENEMY_DRAW_DATA: [EnemyDrawData; MAX_POINTS] = [EnemyDrawData { angle: 0.0, fall: 0.0, color: 0, flags: 0 }; MAX_POINTS];
static mut ENEMY_BODY_RANGES: [u32; MAX_POINTS * 2] = [0; MAX_POINTS * 2];
static mut ENEMY_BODY_COMMANDS: [f64; ENEMY_BODY_COMMAND_CAPACITY * 8] = [0.0; ENEMY_BODY_COMMAND_CAPACITY * 8];
static mut BREAKABLE_DATA: [f64; MAX_POINTS * 5] = [0.0; MAX_POINTS * 5];
// Three events per visible enemy at most (body, stun, label), each as kind/index/value.
static mut ENEMY_EVENTS: [u32; MAX_POINTS * 9] = [0; MAX_POINTS * 9];
// x, y, rx, ry, alpha for each visible enemy's ground shadow.
static mut ENEMY_SHADOWS: [f64; MAX_POINTS * 5] = [0.0; MAX_POINTS * 5];

#[link(wasm_import_module = "host")]
extern "C" {
    fn execute_canvas_call(operation_id: u32);
    fn execute_canvas_set(operation_id: u32);
    fn set_canvas_setup(scale: f64, smoothing: u32, quality: u32);
    fn fill_frame_background(width: f64, height: f64);
    fn draw_floor_batch(pointer: u32, count: u32);
    fn draw_floor_rgba_batch(pointer: u32, width: u32, height: u32);
    fn draw_dust_batch(pointer: u32, count: u32, alpha: f64);
    fn draw_spark_batch(pointer: u32, count: u32);
    fn draw_live_blood_batch(pointer: u32, count: u32, color: u32);
    fn draw_static_blood_batch(pointer: u32, count: u32);
    fn draw_corpse_batch(pointer: u32, count: u32);
    fn draw_bullet_batch(pointer: u32, count: u32);
    fn draw_layer_command(pointer: u32);
    fn draw_shell_batch(pointer: u32, count: u32);
    fn draw_dark_outline_batch(pointer: u32, count: u32);
    fn draw_fx_batch(pointer: u32, count: u32);
    fn draw_pickup_batch(pointer: u32, count: u32);
    fn draw_throw_batch(pointer: u32, count: u32);
    fn draw_transport_batch(pointer: u32, count: u32);
    fn draw_transport_gradient_batch(pointer: u32, width: u32, height: u32);
    fn draw_exit_batch(pointer: u32, count: u32);
    fn draw_color_grade_batch(pointer: u32, count: u32);
    fn draw_final_overlay_batch(pointer: u32, count: u32);
    fn draw_hud_shape_batch(pointer: u32, count: u32);
    fn draw_radial_sprite_batch(pointer: u32, width: u32, height: u32);
    fn draw_muzzle_sprite_batch(pointer: u32, width: u32, height: u32);
    fn draw_exit_gradient_batch(pointer: u32, width: u32, height: u32);
    fn draw_invasion_arrow_batch(pointer: u32);
    fn draw_hud_text_batch(pointer: u32, count: u32);
    fn draw_rain_batch(pointer: u32, count: u32);
    fn draw_weather_motes_batch(pointer: u32, count: u32);
    fn draw_fog_batch(pointer: u32, count: u32, smoke: u32, alpha: f64);
    fn draw_fx_overlay_batch(pointer: u32, count: u32);
    fn draw_world_light_batch(pointer: u32, count: u32);
    fn draw_world_ring_batch(pointer: u32, count: u32);
    fn draw_invasion_zone_batch(pointer: u32);
    fn draw_dark_overlay_batch(pointer: u32);
    fn draw_combo_text_batch(pointer: u32);
    fn draw_hud_image_batch(pointer: u32);
    fn draw_alarm_text_batch(pointer: u32);
    fn draw_map_command(opcode: u32, color: u32, x1: f64, y1: f64, x2: f64, y2: f64, line_width: f64, alpha: f64);
    fn draw_furniture_batch(pointer: u32, count: u32);
}

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}

/// Dispatches one recorded browser Canvas operation through the Rust/WASM ABI.
#[no_mangle]
pub extern "C" fn canvas_call(operation_id: u32) {
    unsafe {
        CANVAS_CALLS = CANVAS_CALLS.wrapping_add(1);
        execute_canvas_call(operation_id);
    }
}

/// Dispatches one recorded Canvas property assignment through the host ABI.
#[no_mangle]
pub extern "C" fn canvas_set(operation_id: u32) {
    unsafe {
        PROPERTY_WRITES = PROPERTY_WRITES.wrapping_add(1);
        execute_canvas_set(operation_id);
    }
}

/// Validates and applies the root Canvas transform and smoothing state as one renderer command.
#[no_mangle]
pub extern "C" fn draw_canvas_setup(scale: f64, smoothing: f64, quality: f64) -> u32 {
    if !scale.is_finite() || scale <= 0.0 || scale > 4.0 ||
       !smoothing.is_finite() || (smoothing != 0.0 && smoothing != 1.0) ||
       !quality.is_finite() || quality < 0.0 || quality > 2.0 || quality != quality as u32 as f64 { return 0; }
    unsafe { set_canvas_setup(scale, smoothing as u32, quality as u32); }
    1
}

/// Selects the base frame fill and extends it past the viewport to cover screen shake.
#[no_mangle]
pub extern "C" fn draw_frame_background(width: f64, height: f64) -> u32 {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0 || width > 4096.0 || height > 4096.0 { return 0; }
    unsafe { fill_frame_background(width, height); }
    1
}

#[no_mangle]
pub extern "C" fn canvas_calls() -> u32 {
    unsafe { CANVAS_CALLS }
}

#[no_mangle]
pub extern "C" fn property_writes() -> u32 {
    unsafe { PROPERTY_WRITES }
}

#[no_mangle]
pub extern "C" fn reset_stats() {
    unsafe { CANVAS_CALLS = 0; PROPERTY_WRITES = 0; ENEMY_BATCHES = 0; ENEMY_EVENT_COUNT = 0; ENEMY_SHADOW_COUNT = 0; ENEMY_BODY_COMMAND_COUNT = 0; FLOOR_RECTS = 0; }
}

#[no_mangle]
pub extern "C" fn dust_input_ptr() -> u32 { core::ptr::addr_of_mut!(DUST_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn dust_commands_ptr() -> u32 { core::ptr::addr_of!(DUST_COMMANDS).cast::<u8>() as u32 }

/// Validates and emits the per-frame dust circles as a compact Canvas batch.
#[no_mangle]
pub extern "C" fn draw_dust(count: u32, alpha: f64) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(DUST_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(DUST_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let x = core::ptr::read(input.add(i * 3));
            let y = core::ptr::read(input.add(i * 3 + 1));
            let r = core::ptr::read(input.add(i * 3 + 2));
            if x.is_finite() && y.is_finite() && r.is_finite() && r >= 0.0 {
                core::ptr::write(output.add(emitted * 3), x);
                core::ptr::write(output.add(emitted * 3 + 1), y);
                core::ptr::write(output.add(emitted * 3 + 2), r);
                emitted += 1;
            }
        }
    }
    unsafe { DUST_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(DUST_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_dust_batch(pointer, emitted as u32, alpha.clamp(0.0, 1.0)); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn spark_input_ptr() -> u32 { core::ptr::addr_of_mut!(SPARK_INPUT).cast::<u8>() as u32 }

/// Groups additive spark rectangles by palette and life-opacity bucket.
#[no_mangle]
pub extern "C" fn draw_sparks(count: u32, color_count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let colors = (color_count as usize).min(256);
    let input = core::ptr::addr_of!(SPARK_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(SPARK_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for color in 0..colors {
        for bucket in 1..=6 {
            for i in 0..count {
                unsafe {
                    let offset = i * 5;
                    let x = core::ptr::read(input.add(offset));
                    let y = core::ptr::read(input.add(offset + 1));
                    let life = core::ptr::read(input.add(offset + 2));
                    let max = core::ptr::read(input.add(offset + 3));
                    let color_id = core::ptr::read(input.add(offset + 4));
                    if !x.is_finite() || !y.is_finite() || !life.is_finite() || !max.is_finite() || max <= 0.0 || life <= 0.0 || color_id != color as f64 { continue; }
                    let level = ceil_f64((life / max) * 6.0).max(1.0) as usize;
                    if level != bucket && !(bucket == 6 && level > 6) { continue; }
                    let out = emitted * 6;
                    core::ptr::write(output.add(out), color as f64);
                    core::ptr::write(output.add(out + 1), bucket as f64 / 6.0);
                    core::ptr::write(output.add(out + 2), x - 2.0);
                    core::ptr::write(output.add(out + 3), y - 2.0);
                    core::ptr::write(output.add(out + 4), 4.0);
                    core::ptr::write(output.add(out + 5), 4.0);
                    emitted += 1;
                }
            }
        }
    }
    unsafe { SPARK_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(SPARK_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_spark_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn blood_input_ptr() -> u32 { core::ptr::addr_of_mut!(BLOOD_INPUT).cast::<u8>() as u32 }

/// Emits valid live blood marks without changing simulation data or iteration order.
#[no_mangle]
pub extern "C" fn draw_live_blood(count: u32, color: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(BLOOD_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(BLOOD_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let x = core::ptr::read(input.add(i * 4));
            let y = core::ptr::read(input.add(i * 4 + 1));
            let r = core::ptr::read(input.add(i * 4 + 2));
            let alpha = core::ptr::read(input.add(i * 4 + 3));
            if !x.is_finite() || !y.is_finite() || !r.is_finite() || !alpha.is_finite() || r < 0.0 { continue; }
            let out = emitted * 4;
            core::ptr::write(output.add(out), x);
            core::ptr::write(output.add(out + 1), y);
            core::ptr::write(output.add(out + 2), r);
            core::ptr::write(output.add(out + 3), alpha.clamp(0.0, 1.0));
            emitted += 1;
        }
    }
    unsafe { BLOOD_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(BLOOD_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_live_blood_batch(pointer, emitted as u32, color); }
    }
    emitted as u32
}

/// Builds one compound static-blood path for the caller's cached canvas layer.
#[no_mangle]
pub extern "C" fn draw_static_blood(count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(BLOOD_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(BLOOD_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let x = core::ptr::read(input.add(i * 4));
            let y = core::ptr::read(input.add(i * 4 + 1));
            let r = core::ptr::read(input.add(i * 4 + 2));
            if !x.is_finite() || !y.is_finite() || !r.is_finite() || r < 0.0 { continue; }
            let out = emitted * 4;
            core::ptr::write(output.add(out), x);
            core::ptr::write(output.add(out + 1), y);
            core::ptr::write(output.add(out + 2), r);
            core::ptr::write(output.add(out + 3), 1.0);
            emitted += 1;
        }
    }
    unsafe { STATIC_BLOOD_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(BLOOD_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_static_blood_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn corpse_input_ptr() -> u32 { core::ptr::addr_of_mut!(CORPSE_INPUT).cast::<u8>() as u32 }

/// Emits ordered shadow/body ellipse commands for the existing corpse actors.
#[no_mangle]
pub extern "C" fn draw_corpses(count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(CORPSE_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(CORPSE_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let offset = i * 4;
            let x = core::ptr::read(input.add(offset));
            let y = core::ptr::read(input.add(offset + 1));
            let angle = core::ptr::read(input.add(offset + 2));
            let color = core::ptr::read(input.add(offset + 3));
            if !x.is_finite() || !y.is_finite() || !angle.is_finite() || !color.is_finite() || color < 0.0 { continue; }
            for kind in 0..2 {
                let command = emitted * 7;
                core::ptr::write(output.add(command), x);
                core::ptr::write(output.add(command + 1), y);
                core::ptr::write(output.add(command + 2), angle);
                core::ptr::write(output.add(command + 3), if kind == 0 { 15.0 } else { 13.0 });
                core::ptr::write(output.add(command + 4), if kind == 0 { 11.0 } else { 8.0 });
                core::ptr::write(output.add(command + 5), if kind == 0 { 0.35 } else { 0.55 });
                core::ptr::write(output.add(command + 6), if kind == 0 { 3.0 } else { color });
                emitted += 1;
            }
        }
    }
    unsafe { CORPSE_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(CORPSE_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_corpse_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn bullet_input_ptr() -> u32 { core::ptr::addr_of_mut!(BULLET_INPUT).cast::<u8>() as u32 }

/// Resolves projectile sprite and centered draw position without changing physics state.
#[no_mangle]
pub extern "C" fn draw_bullets(count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(BULLET_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(BULLET_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let x = core::ptr::read(input.add(i * 3));
            let y = core::ptr::read(input.add(i * 3 + 1));
            let mine = core::ptr::read(input.add(i * 3 + 2));
            if !x.is_finite() || !y.is_finite() { continue; }
            let out = emitted * 3;
            core::ptr::write(output.add(out), x - 22.0);
            core::ptr::write(output.add(out + 1), y - 14.0);
            core::ptr::write(output.add(out + 2), if mine >= 0.5 { 1.0 } else { 0.0 });
            emitted += 1;
        }
    }
    unsafe { BULLET_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(BULLET_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_bullet_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

/// Computes the source and destination rectangles for one camera-clipped canvas layer.
#[no_mangle]
pub extern "C" fn draw_layer(vx0: f64, vy0: f64, vx1: f64, vy1: f64, width: f64, height: f64) -> u32 {
    unsafe { LAYER_COMMAND_COUNT = 0; }
    if !vx0.is_finite() || !vy0.is_finite() || !vx1.is_finite() || !vy1.is_finite() || !width.is_finite() || !height.is_finite() { return 0; }
    let x1 = vx1.min(width);
    let y1 = vy1.min(height);
    let w = x1 - vx0;
    let h = y1 - vy0;
    if w <= 0.0 || h <= 0.0 { return 0; }
    unsafe {
        let command = core::ptr::addr_of_mut!(LAYER_COMMAND).cast::<f64>();
        core::ptr::write(command, vx0); core::ptr::write(command.add(1), vy0);
        core::ptr::write(command.add(2), w); core::ptr::write(command.add(3), h);
        core::ptr::write(command.add(4), vx0); core::ptr::write(command.add(5), vy0);
        core::ptr::write(command.add(6), w); core::ptr::write(command.add(7), h);
        LAYER_COMMAND_COUNT = 1;
        let pointer = core::ptr::addr_of!(LAYER_COMMAND).cast::<u8>() as u32;
        draw_layer_command(pointer);
    }
    1
}

#[no_mangle]
pub extern "C" fn shell_input_ptr() -> u32 { core::ptr::addr_of_mut!(SHELL_INPUT).cast::<u8>() as u32 }

/// Projects world-space shell particles into screen space and emits grouped ellipses.
#[no_mangle]
pub extern "C" fn draw_shells(count: u32, camera_x: f64, camera_y: f64) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    if !camera_x.is_finite() || !camera_y.is_finite() { return 0; }
    let input = core::ptr::addr_of!(SHELL_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(SHELL_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let x = core::ptr::read(input.add(i * 3));
            let y = core::ptr::read(input.add(i * 3 + 1));
            let r = core::ptr::read(input.add(i * 3 + 2));
            if !x.is_finite() || !y.is_finite() || !r.is_finite() || r < 0.0 { continue; }
            let command = emitted * 5;
            core::ptr::write(output.add(command), x - camera_x);
            core::ptr::write(output.add(command + 1), y - camera_y);
            core::ptr::write(output.add(command + 2), r * 1.6);
            core::ptr::write(output.add(command + 3), r);
            core::ptr::write(output.add(command + 4), 0.5);
            emitted += 1;
        }
    }
    unsafe { SHELL_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(SHELL_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_shell_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn dark_outline_input_ptr() -> u32 { core::ptr::addr_of_mut!(DARK_OUTLINE_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn dark_overlay_input_ptr() -> u32 { core::ptr::addr_of_mut!(DARK_OVERLAY_INPUT).cast::<u8>() as u32 }

/// Projects the player and prepares the blackout mask and flashlight command for the host.
#[no_mangle]
pub extern "C" fn draw_dark_overlay() -> u32 {
    let input = core::ptr::addr_of!(DARK_OVERLAY_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(DARK_OVERLAY_COMMANDS).cast::<f64>();
    let mut v = [0.0; 10];
    for i in 0..10 { unsafe { v[i] = core::ptr::read(input.add(i)); } }
    if !v.iter().all(|n| n.is_finite()) || v[4] <= 0.0 || v[5] <= 0.0 || v[6] <= 0.0
        || !(v[8] == 0.0 || v[8] == 1.0) || !(v[9] == 0.0 || v[9] == 1.0) { return 0; }
    let (player_x, player_y, camera_x, camera_y, screen_w, screen_h, zoom, angle, blackout, fire_flash) =
        (v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9]);
    let screen_x = (player_x - camera_x - screen_w / 2.0) * zoom + screen_w / 2.0;
    let screen_y = (player_y - camera_y - screen_h / 2.0) * zoom + screen_h / 2.0;
    let commands = [screen_x, screen_y, angle, 150.0 * zoom, 330.0 * zoom, 260.0 * zoom, blackout, fire_flash];
    for i in 0..8 { unsafe { core::ptr::write(output.add(i), commands[i]); } }
    let pointer = core::ptr::addr_of!(DARK_OVERLAY_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_dark_overlay_batch(pointer); }
    1
}

/// Projects living enemies into dark-scene outline circles; color 0 is alerted/knocked out.
#[no_mangle]
pub extern "C" fn draw_dark_outlines(count: u32, camera_x: f64, camera_y: f64, screen_w: f64, screen_h: f64, zoom: f64) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    if !camera_x.is_finite() || !camera_y.is_finite() || !screen_w.is_finite() || !screen_h.is_finite() || !zoom.is_finite() { return 0; }
    let input = core::ptr::addr_of!(DARK_OUTLINE_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(DARK_OUTLINE_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let offset = i * 4;
            let x = core::ptr::read(input.add(offset));
            let y = core::ptr::read(input.add(offset + 1));
            let dead = core::ptr::read(input.add(offset + 2));
            let ko = core::ptr::read(input.add(offset + 3));
            if dead != 0.0 || !x.is_finite() || !y.is_finite() || !ko.is_finite() { continue; }
            let command = emitted * 4;
            core::ptr::write(output.add(command), (x - camera_x - screen_w / 2.0) * zoom + screen_w / 2.0);
            core::ptr::write(output.add(command + 1), (y - camera_y - screen_h / 2.0) * zoom + screen_h / 2.0);
            core::ptr::write(output.add(command + 2), 14.0 * zoom);
            core::ptr::write(output.add(command + 3), if ko > 0.0 { 0.0 } else { 1.0 });
            emitted += 1;
        }
    }
    unsafe { DARK_OUTLINE_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(DARK_OUTLINE_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_dark_outline_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn fx_input_ptr() -> u32 { core::ptr::addr_of_mut!(FX_INPUT).cast::<u8>() as u32 }

/// Preserves effect order and emits both muzzle flashes and impact arcs.
#[no_mangle]
pub extern "C" fn draw_fx(count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(FX_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(FX_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let offset = i * 6;
            let x = core::ptr::read(input.add(offset));
            let y = core::ptr::read(input.add(offset + 1));
            let t = core::ptr::read(input.add(offset + 2));
            let radius = core::ptr::read(input.add(offset + 3));
            let angle = core::ptr::read(input.add(offset + 4));
            let muzzle = core::ptr::read(input.add(offset + 5));
            if !x.is_finite() || !y.is_finite() || !t.is_finite() || !radius.is_finite() || !angle.is_finite() { continue; }
            let command = emitted * 6;
            core::ptr::write(output.add(command), x);
            core::ptr::write(output.add(command + 1), y);
            core::ptr::write(output.add(command + 2), t);
            core::ptr::write(output.add(command + 3), radius);
            core::ptr::write(output.add(command + 4), angle);
            core::ptr::write(output.add(command + 5), if muzzle >= 0.5 { 1.0 } else { 0.0 });
            emitted += 1;
        }
    }
    unsafe { FX_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(FX_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_fx_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn pickup_input_ptr() -> u32 { core::ptr::addr_of_mut!(PICKUP_INPUT).cast::<u8>() as u32 }

/// Preserves pickup order and emits pose, weapon, glow preference and animated pulse.
#[no_mangle]
pub extern "C" fn draw_pickups(count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(PICKUP_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(PICKUP_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let offset = i * 5;
            let x = core::ptr::read(input.add(offset)); let y = core::ptr::read(input.add(offset + 1));
            let angle = core::ptr::read(input.add(offset + 2)); let weapon = core::ptr::read(input.add(offset + 3));
            let pulse = core::ptr::read(input.add(offset + 4));
            if !x.is_finite() || !y.is_finite() || !angle.is_finite() || !weapon.is_finite() || !pulse.is_finite() { continue; }
            let command = emitted * 5;
            core::ptr::write(output.add(command), x); core::ptr::write(output.add(command + 1), y);
            core::ptr::write(output.add(command + 2), angle); core::ptr::write(output.add(command + 3), weapon);
            core::ptr::write(output.add(command + 4), pulse);
            emitted += 1;
        }
    }
    unsafe { PICKUP_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(PICKUP_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_pickup_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn throw_input_ptr() -> u32 { core::ptr::addr_of_mut!(THROW_INPUT).cast::<u8>() as u32 }

/// Emits thrown-weapon transforms and icon ids in the input order.
#[no_mangle]
pub extern "C" fn draw_throws(count: u32) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let input = core::ptr::addr_of!(THROW_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(THROW_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for i in 0..count {
        unsafe {
            let offset = i * 4;
            let x = core::ptr::read(input.add(offset)); let y = core::ptr::read(input.add(offset + 1));
            let angle = core::ptr::read(input.add(offset + 2)); let weapon = core::ptr::read(input.add(offset + 3));
            if !x.is_finite() || !y.is_finite() || !angle.is_finite() || !weapon.is_finite() { continue; }
            let command = emitted * 4;
            core::ptr::write(output.add(command), x); core::ptr::write(output.add(command + 1), y);
            core::ptr::write(output.add(command + 2), angle); core::ptr::write(output.add(command + 3), weapon);
            emitted += 1;
        }
    }
    unsafe { THROW_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(THROW_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_throw_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn transport_input_ptr() -> u32 { core::ptr::addr_of_mut!(TRANSPORT_INPUT).cast::<u8>() as u32 }

fn transport_command(op: u32, x: f64, y: f64, w: f64, h: f64, variant: f64, alpha: f64, line_width: f64) {
    unsafe {
        let offset = TRANSPORT_COMMAND_COUNT as usize * 8;
        let commands = core::ptr::addr_of_mut!(TRANSPORT_COMMANDS).cast::<f64>();
        for (i, value) in [op as f64, x, y, w, h, variant, alpha, line_width].iter().enumerate() {
            core::ptr::write(commands.add(offset + i), *value);
        }
        TRANSPORT_COMMAND_COUNT += 1;
    }
}

/// Emits stair/elevator Canvas primitives in map order; host retains gradient rasterization.
#[no_mangle]
pub extern "C" fn draw_transports(count: u32) -> u32 {
    let count = (count as usize).min(TRANSPORT_MAX);
    let input = core::ptr::addr_of!(TRANSPORT_INPUT).cast::<f64>();
    unsafe { TRANSPORT_COMMAND_COUNT = 0; }
    for i in 0..count {
        let (x, y, w, h, kind, up) = unsafe {
            let offset = i * 6;
            (core::ptr::read(input.add(offset)), core::ptr::read(input.add(offset + 1)),
             core::ptr::read(input.add(offset + 2)), core::ptr::read(input.add(offset + 3)),
             core::ptr::read(input.add(offset + 4)), core::ptr::read(input.add(offset + 5)))
        };
        if !x.is_finite() || !y.is_finite() || !w.is_finite() || !h.is_finite() || !kind.is_finite() || !up.is_finite() || w <= 0.0 || h <= 0.0 { continue; }
        transport_command(0, x - 2.0, y + 2.0, w + 4.0, h + 4.0, 0.0, 1.0, 0.0);
        if kind < 0.5 {
            transport_command(1, x, y, w, h, 0.0, 1.0, 0.0);
            for step in 0..6 {
                let sy = y + 4.0 + step as f64 * 6.3;
                transport_command(2, x + 6.0, sy, w - 12.0, 4.5, (step % 2) as f64, 1.0, 0.0);
                transport_command(3, x + 6.0, sy, w - 12.0, 1.0, 0.0, 1.0, 0.0);
            }
            transport_command(4, x + 2.0, y + 2.0, 2.5, h - 4.0, 0.0, 1.0, 0.0);
            transport_command(4, x + w - 4.5, y + 2.0, 2.5, h - 4.0, 0.0, 1.0, 0.0);
        } else {
            let cx = x + w / 2.0;
            transport_command(5, x, y, w, h, 0.0, 1.0, 0.0);
        transport_command(6, x + 5.0, y + 12.0, w / 2.0 - 6.0, h - 16.0, 0.0, 1.0, 0.0);
        transport_command(6, cx + 1.0, y + 12.0, w / 2.0 - 6.0, h - 16.0, 1.0, 1.0, 0.0);
            transport_command(7, cx - 1.0, y + 12.0, 2.0, h - 16.0, 0.0, 1.0, 0.0);
            transport_command(8, x + 8.0, y + 3.0, w - 16.0, 7.0, 0.0, 1.0, 0.0);
            transport_command(9, cx, y, 0.0, 0.0, if up > 0.5 { 1.0 } else { 0.0 }, 1.0, 0.0);
        }
        transport_command(10, x + 1.0, y + 1.0, w - 2.0, h - 2.0, 0.0, 0.28, 7.0);
        transport_command(11, x + 1.0, y + 1.0, w - 2.0, h - 2.0, 0.0, 1.0, 2.0);
    }
    let emitted = unsafe { TRANSPORT_COMMAND_COUNT };
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(TRANSPORT_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_transport_batch(pointer, emitted); }
    }
    emitted
}

/// Rasterizes the cached stair, elevator, or metal-door gradient used by the host Canvas.
#[no_mangle]
pub extern "C" fn generate_transport_gradient(width: u32, height: u32, kind: u32, offset_x: f64, gradient_width: f64) -> u32 {
    if width == 0 || height == 0 || width as usize > RADIAL_MAX_SIDE || height as usize > RADIAL_MAX_SIDE || kind > 2
        || !offset_x.is_finite() || !gradient_width.is_finite() || gradient_width <= 0.0 { return 0; }
    let w = width as usize;
    let h = height as usize;
    for y in 0..h {
        for x in 0..w {
            let t = if kind == 1 { (y as f64 + 0.5) / height as f64 } else { (x as f64 + 0.5) / width as f64 };
            let (from, to, local_t) = if kind == 0 {
                ([109.0, 109.0, 140.0], [58.0, 58.0, 82.0], t)
            } else if kind == 1 {
                ([44.0, 61.0, 82.0], [20.0, 32.0, 44.0], t)
            } else {
                let door_t = (offset_x + x as f64 + 0.5) / gradient_width;
                if door_t < 0.5 {
                    ([201.0, 214.0, 227.0], [143.0, 160.0, 180.0], door_t * 2.0)
                } else {
                    ([143.0, 160.0, 180.0], [201.0, 214.0, 227.0], (door_t - 0.5) * 2.0)
                }
            };
            let offset = (y * w + x) * 4;
            let pixels = core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>();
            unsafe {
                core::ptr::write(pixels.add(offset), (from[0] + (to[0] - from[0]) * local_t) as u8);
                core::ptr::write(pixels.add(offset + 1), (from[1] + (to[1] - from[1]) * local_t) as u8);
                core::ptr::write(pixels.add(offset + 2), (from[2] + (to[2] - from[2]) * local_t) as u8);
                core::ptr::write(pixels.add(offset + 3), 255);
            }
        }
    }
    let pointer = core::ptr::addr_of!(RADIAL_SPRITE_PIXELS).cast::<u8>() as u32;
    unsafe { draw_transport_gradient_batch(pointer, width, height); }
    1
}

#[no_mangle]
pub extern "C" fn exit_input_ptr() -> u32 { core::ptr::addr_of_mut!(EXIT_INPUT).cast::<u8>() as u32 }

fn exit_command(op: u32, x1: f64, y1: f64, x2: f64, y2: f64, width: f64) {
    unsafe {
        let offset = EXIT_COMMAND_COUNT as usize * 6;
        let output = core::ptr::addr_of_mut!(EXIT_COMMANDS).cast::<f64>();
        for (i, value) in [op as f64, x1, y1, x2, y2, width].iter().enumerate() { core::ptr::write(output.add(offset + i), *value); }
        EXIT_COMMAND_COUNT += 1;
    }
}

/// Builds the exit glow, clipped gradient, diagonal hatch and double neon border.
#[no_mangle]
pub extern "C" fn draw_exit() -> u32 {
    let input = core::ptr::addr_of!(EXIT_INPUT).cast::<f64>();
    let (x, y, w, h, _pulse, _cleared, bloom) = unsafe {
        (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)), core::ptr::read(input.add(3)),
         core::ptr::read(input.add(4)), core::ptr::read(input.add(5)), core::ptr::read(input.add(6)))
    };
    unsafe { EXIT_COMMAND_COUNT = 0; }
    if !x.is_finite() || !y.is_finite() || !w.is_finite() || !h.is_finite() || !bloom.is_finite() || w <= 0.0 || h <= 0.0 { return 0; }
    exit_command(0, x - 2.0, y - 2.0, w + 4.0, h + 4.0, if bloom > 0.5 { 1.0 } else { 0.0 });
    exit_command(1, x, y, w, h, 0.0); // clip interior
    exit_command(2, x, y, x + w, y + h, 0.0); // gradient fill
    let mut diagonal = -h;
    while diagonal < w + h && unsafe { EXIT_COMMAND_COUNT as usize } < EXIT_COMMAND_CAPACITY - 4 {
        exit_command(3, x + diagonal, y + h, x + diagonal + h, y, 0.0);
        diagonal += 22.0;
    }
    exit_command(4, 0.0, 0.0, 0.0, 0.0, 0.0); // restore clip
    exit_command(5, x + 1.0, y + 1.0, w - 2.0, h - 2.0, 8.0);
    exit_command(6, x + 1.0, y + 1.0, w - 2.0, h - 2.0, 2.5);
    let count = unsafe { EXIT_COMMAND_COUNT };
    if count > 0 {
        let pointer = core::ptr::addr_of!(EXIT_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_exit_batch(pointer, count); }
    }
    count
}

/// Emits the two full-screen color-grade fills in their original composition order.
#[no_mangle]
pub extern "C" fn color_grade_input_ptr() -> u32 { core::ptr::addr_of_mut!(COLOR_GRADE_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_color_grade() -> u32 {
    let input = core::ptr::addr_of!(COLOR_GRADE_INPUT).cast::<f64>();
    let (width, height) = unsafe { (core::ptr::read(input), core::ptr::read(input.add(1))) };
    unsafe { COLOR_GRADE_COMMAND_COUNT = 0; }
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0 { return 0; }
    let output = core::ptr::addr_of_mut!(COLOR_GRADE_COMMANDS).cast::<f64>();
    unsafe {
        for (i, value) in [0.0, 0.0, 0.0, width, height, 1.0, 0.0, 0.0, width, height].iter().enumerate() {
            core::ptr::write(output.add(i), *value);
        }
        COLOR_GRADE_COMMAND_COUNT = 2;
    }
    let count = unsafe { COLOR_GRADE_COMMAND_COUNT };
    let pointer = core::ptr::addr_of!(COLOR_GRADE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_color_grade_batch(pointer, count); }
    count
}

/// Builds the fade and optional flash overlays that finish the frame.
#[no_mangle]
pub extern "C" fn final_overlay_input_ptr() -> u32 { core::ptr::addr_of_mut!(FINAL_OVERLAY_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_final_overlays() -> u32 {
    let input = core::ptr::addr_of!(FINAL_OVERLAY_INPUT).cast::<f64>();
    let (width, height, fade, flash, flash_enabled) = unsafe {
        (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)),
         core::ptr::read(input.add(3)), core::ptr::read(input.add(4)))
    };
    unsafe { FINAL_OVERLAY_COMMAND_COUNT = 0; }
    if !width.is_finite() || !height.is_finite() || !fade.is_finite() || !flash.is_finite()
        || !flash_enabled.is_finite() || width <= 0.0 || height <= 0.0 { return 0; }
    let mut count = 0usize;
    let output = core::ptr::addr_of_mut!(FINAL_OVERLAY_COMMANDS).cast::<f64>();
    if fade > 0.0 {
        for (i, value) in [0.0, width, height, fade].iter().enumerate() { unsafe { core::ptr::write(output.add(count * 4 + i), *value); } }
        count += 1;
    }
    if flash > 0.0 && flash_enabled > 0.5 {
        for (i, value) in [1.0, width, height, flash * 0.5].iter().enumerate() { unsafe { core::ptr::write(output.add(count * 4 + i), *value); } }
        count += 1;
    }
    unsafe { FINAL_OVERLAY_COMMAND_COUNT = count as u32; }
    if count > 0 {
        let pointer = core::ptr::addr_of!(FINAL_OVERLAY_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_final_overlay_batch(pointer, count as u32); }
    }
    count as u32
}

fn hud_shape_command(op: u32, x: f64, y: f64, width: f64, height: f64, color: f64, line_width: f64) {
    unsafe {
        let offset = HUD_SHAPE_COMMAND_COUNT as usize * 7;
        let output = core::ptr::addr_of_mut!(HUD_SHAPE_COMMANDS).cast::<f64>();
        for (i, value) in [op as f64, x, y, width, height, color, line_width].iter().enumerate() {
            core::ptr::write(output.add(offset + i), *value);
        }
        HUD_SHAPE_COMMAND_COUNT += 1;
    }
}

/// Emits HUD rectangle geometry for the combo bar, mask border and pause veil.
#[no_mangle]
pub extern "C" fn hud_shape_input_ptr() -> u32 { core::ptr::addr_of_mut!(HUD_SHAPE_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_hud_shape() -> u32 {
    let input = core::ptr::addr_of!(HUD_SHAPE_INPUT).cast::<f64>();
    let (stage, width, height, value) = unsafe {
        (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)), core::ptr::read(input.add(3)))
    };
    unsafe { HUD_SHAPE_COMMAND_COUNT = 0; }
    if !stage.is_finite() || !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0 { return 0; }
    if stage == 0.0 {
        let fraction = if value.is_finite() { value.max(0.0).min(1.0) } else { f64::NAN };
        hud_shape_command(0, 34.0, 186.0, 220.0, 10.0, 0.0, 0.0);
        hud_shape_command(0, 34.0, 186.0, 220.0 * fraction, 10.0, if fraction > 0.3 { 1.0 } else { 2.0 }, 0.0);
        hud_shape_command(1, 34.0, 186.0, 220.0, 10.0, 3.0, 2.0);
    } else if stage == 1.0 {
        hud_shape_command(1, width - 82.0, 26.0, 56.0, 56.0, 5.0, 3.0);
    } else if stage == 2.0 {
        hud_shape_command(0, 0.0, 0.0, width, height, 4.0, 0.0);
    } else if stage == 3.0 {
        hud_shape_command(0, 34.0, 146.0, 160.0, 8.0, 8.0, 0.0);
        hud_shape_command(0, 34.0, 146.0, 160.0 * value, 8.0, 9.0, 0.0);
    } else { return 0; }
    let count = unsafe { HUD_SHAPE_COMMAND_COUNT };
    let pointer = core::ptr::addr_of!(HUD_SHAPE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_hud_shape_batch(pointer, count); }
    count
}

/// Emits the shop dealer's ordered geometry; the host only rasterizes these Canvas primitives.
#[no_mangle]
pub extern "C" fn shop_dealer_input_ptr() -> u32 { core::ptr::addr_of_mut!(SHOP_DEALER_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_shop_dealer() -> u32 {
    let input = core::ptr::addr_of!(SHOP_DEALER_INPUT).cast::<f64>();
    let values = unsafe { [
        core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)), core::ptr::read(input.add(3)),
        core::ptr::read(input.add(4)), core::ptr::read(input.add(5)), core::ptr::read(input.add(6)), core::ptr::read(input.add(7)),
    ] };
    unsafe { HUD_SHAPE_COMMAND_COUNT = 0; }
    if values.iter().any(|value| !value.is_finite()) { return 0; }
    let [gx, gy, fall_ratio, bob, face, timer_ratio, urgent, falling] = values;
    let fall = fall_ratio.clamp(0.0, 1.0);
    let direction = if face < 0.0 { -1.0 } else { 1.0 };
    let sy = gy - fall * 140.0 + bob;

    // op 2: ellipse; op 3: dealer dress trapezoid; op 4: feather triangle; op 5: timer arc.
    hud_shape_command(2, gx, gy + 10.0, 13.0 - fall * 4.0, 6.0 - fall * 2.0, 13.0, 0.0);
    hud_shape_command(3, gx, sy, direction, 1.0, 14.0, 0.0);
    hud_shape_command(2, gx, sy - 12.0, 8.0, 8.0, 15.0, 0.0);
    hud_shape_command(0, gx + direction * -4.0, sy - 13.0, 2.0, 2.0, 16.0, 0.0);
    hud_shape_command(0, gx + direction * 2.0, sy - 13.0, 2.0, 2.0, 16.0, 0.0);
    hud_shape_command(0, gx - 4.0, sy - 7.0, 8.0, 2.0, 17.0, 0.0);
    for index in 0..4 {
        let center = -7.0 + index as f64 * 6.0;
        hud_shape_command(4, gx + direction * center, sy - 30.0, direction, 10.0, 18.0, 0.0);
    }
    hud_shape_command(0, gx - 12.0, sy - 21.0, 24.0, 4.0, 19.0, 0.0);
    if falling <= 0.0 {
        hud_shape_command(5, gx, gy + 6.0, 30.0, timer_ratio.clamp(0.0, 1.0), if urgent > 0.5 { 20.0 } else { 21.0 }, 3.0);
    }
    let count = unsafe { HUD_SHAPE_COMMAND_COUNT };
    let pointer = core::ptr::addr_of!(HUD_SHAPE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_hud_shape_batch(pointer, count); }
    count
}

/// Emits the shop bubble, card, or reroll panel geometry in Canvas painter order.
#[no_mangle]
pub extern "C" fn shop_panel_input_ptr() -> u32 { core::ptr::addr_of_mut!(SHOP_PANEL_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_shop_panel() -> u32 {
    let input = core::ptr::addr_of!(SHOP_PANEL_INPUT).cast::<f64>();
    let values = unsafe { [
        core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)),
        core::ptr::read(input.add(3)), core::ptr::read(input.add(4)), core::ptr::read(input.add(5)), core::ptr::read(input.add(6)),
    ] };
    unsafe { HUD_SHAPE_COMMAND_COUNT = 0; }
    if values.iter().any(|value| !value.is_finite()) { return 0; }
    let [stage, cx, y, width, height, outline_color, flick] = values;
    if width <= 0.0 || height <= 0.0 || stage != stage as i32 as f64 { return 0; }
    if stage == 0.0 {
        hud_shape_command(0, cx - width / 2.0, y, width, height, 22.0, 0.0);
        hud_shape_command(6, cx, y + height, 6.0, 9.0, 22.0, 0.0);
    } else if stage == 1.0 || stage == 2.0 {
        let left = cx - width / 2.0;
        let top = y - height / 2.0;
        hud_shape_command(0, left, top, width, height, 23.0, 0.0);
        let color = if stage == 2.0 { 18.0 } else if flick > 0.5 { 17.0 } else { outline_color };
        if color != 17.0 && color != 18.0 && color != 24.0 { unsafe { HUD_SHAPE_COMMAND_COUNT = 0; } return 0; }
        hud_shape_command(1, left + 1.5, top + 1.5, width - 3.0, height - 3.0, color, 3.0);
    } else { return 0; }
    let count = unsafe { HUD_SHAPE_COMMAND_COUNT };
    let pointer = core::ptr::addr_of!(HUD_SHAPE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_hud_shape_batch(pointer, count); }
    count
}

/// Rasterizes a radial-gradient sprite into RGBA pixels in Rust and uploads it to a host canvas.
#[no_mangle]
pub extern "C" fn radial_sprite_input_ptr() -> u32 { core::ptr::addr_of_mut!(RADIAL_SPRITE_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn generate_radial_sprite() -> u32 {
    let input = core::ptr::addr_of!(RADIAL_SPRITE_INPUT).cast::<f64>();
    let values = unsafe { [
        core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)),
        core::ptr::read(input.add(3)), core::ptr::read(input.add(4)),
    ] };
    if values.iter().any(|value| !value.is_finite()) { return 0; }
    let [radius, red, green, blue, alpha] = values;
    if radius <= 0.0 || radius > RADIAL_MAX_SIDE as f64 / 2.0 ||
        [red, green, blue].iter().any(|value| *value < 0.0 || *value > 255.0 || *value != *value as u8 as f64) ||
        alpha < 0.0 || alpha > 1.0 { return 0; }
    let diameter = radius * 2.0;
    let mut side = diameter as usize;
    if (side as f64) < diameter { side += 1; }
    let rgba = [red as u8, green as u8, blue as u8];
    for y in 0..side {
        for x in 0..side {
            let dx = x as f64 + 0.5 - radius;
            let dy = y as f64 + 0.5 - radius;
            let distance_squared = dx * dx + dy * dy;
            let distance = if distance_squared <= 0.0 { 0.0 } else { radial_sqrt(distance_squared) };
            let remaining = 1.0 - distance / radius;
            let radial = if remaining > 0.0 { remaining } else { 0.0 };
            let opacity = (alpha * radial * 255.0 + 0.5) as u8;
            let color = if opacity == 0 { [0, 0, 0] } else { rgba };
            let offset = (y * side + x) * 4;
            unsafe {
                core::ptr::write(core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>().add(offset), color[0]);
                core::ptr::write(core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>().add(offset + 1), color[1]);
                core::ptr::write(core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>().add(offset + 2), color[2]);
                core::ptr::write(core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>().add(offset + 3), opacity);
            }
        }
    }
    let pointer = core::ptr::addr_of!(RADIAL_SPRITE_PIXELS).cast::<u8>() as u32;
    unsafe { draw_radial_sprite_batch(pointer, side as u32, side as u32); }
    side as u32
}

/// Rasterizes the nine radial gradients used for the cached fog/smoke sprite.
#[no_mangle]
pub extern "C" fn fog_sprite_input_ptr() -> u32 { core::ptr::addr_of_mut!(FOG_SPRITE_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn generate_fog_sprite() -> u32 {
    const WIDTH: usize = 512;
    const HEIGHT: usize = 256;
    let input = core::ptr::addr_of!(FOG_SPRITE_INPUT).cast::<f64>();
    let mut rings = [(0.0, 0.0, 0.0); 9];
    for (index, ring) in rings.iter_mut().enumerate() {
        let offset = index * 3;
        let x = unsafe { core::ptr::read(input.add(offset)) };
        let y = unsafe { core::ptr::read(input.add(offset + 1)) };
        let radius = unsafe { core::ptr::read(input.add(offset + 2)) };
        if !x.is_finite() || !y.is_finite() || !radius.is_finite()
            || x < 0.0 || x > WIDTH as f64 || y < 0.0 || y > HEIGHT as f64 || radius <= 0.0 || radius > 256.0 { return 0; }
        *ring = (x, y, radius);
    }
    let pixels = core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>();
    for pixel in 0..(WIDTH * HEIGHT * 4) { unsafe { core::ptr::write(pixels.add(pixel), 0); } }
    for &(center_x, center_y, radius) in &rings {
        let left = floor_f64(center_x - radius).max(0.0).min(WIDTH as f64) as usize;
        let top = floor_f64(center_y - radius).max(0.0).min(HEIGHT as f64) as usize;
        let right = ceil_f64(center_x + radius).max(0.0).min(WIDTH as f64) as usize;
        let bottom = ceil_f64(center_y + radius).max(0.0).min(HEIGHT as f64) as usize;
        let radius_squared = radius * radius;
        for y in top..bottom {
            for x in left..right {
                let dx = x as f64 + 0.5 - center_x;
                let dy = y as f64 + 0.5 - center_y;
                let distance_squared = dx * dx + dy * dy;
                if distance_squared >= radius_squared { continue; }
                let distance = radial_sqrt(distance_squared);
                let remaining = 1.0 - distance / radius;
                if remaining <= 0.0 { continue; }
                let source_alpha = 0.55 * remaining;
                let offset = (y * WIDTH + x) * 4;
                let destination_alpha = unsafe { core::ptr::read(pixels.add(offset + 3)) as f64 / 255.0 };
                let alpha = ((source_alpha + destination_alpha * (1.0 - source_alpha)) * 255.0 + 0.5) as u8;
                unsafe {
                    core::ptr::write(pixels.add(offset), 255);
                    core::ptr::write(pixels.add(offset + 1), 255);
                    core::ptr::write(pixels.add(offset + 2), 255);
                    core::ptr::write(pixels.add(offset + 3), alpha);
                }
            }
        }
    }
    let pointer = core::ptr::addr_of!(RADIAL_SPRITE_PIXELS).cast::<u8>() as u32;
    unsafe { draw_radial_sprite_batch(pointer, WIDTH as u32, HEIGHT as u32); }
    1
}

/// Generates the reusable white/yellow/orange muzzle-flash sprite used by the Canvas host.
#[no_mangle]
pub extern "C" fn generate_muzzle_sprite() -> u32 {
    let center = MUZZLE_SPRITE_SIDE as f64 / 2.0;
    for y in 0..MUZZLE_SPRITE_SIDE {
        for x in 0..MUZZLE_SPRITE_SIDE {
            let dx = x as f64 + 0.5 - center;
            let dy = y as f64 + 0.5 - center;
            let distance = radial_sqrt(dx * dx + dy * dy) / center;
            let (red, green, blue, alpha) = if distance <= 0.35 {
                let amount = distance / 0.35;
                (255, (255.0 + (210.0 - 255.0) * amount) as u8,
                    (255.0 + (63.0 - 255.0) * amount) as u8, 255)
            } else if distance < 1.0 {
                let amount = (distance - 0.35) / 0.65;
                ((255.0 + (255.0 - 255.0) * amount) as u8,
                    (210.0 + (100.0 - 210.0) * amount) as u8,
                    (63.0 + (40.0 - 63.0) * amount) as u8,
                    (255.0 * (1.0 - amount) + 0.5) as u8)
            } else { (0, 0, 0, 0) };
            let offset = (y * MUZZLE_SPRITE_SIDE + x) * 4;
            let pixels = core::ptr::addr_of_mut!(MUZZLE_SPRITE_PIXELS).cast::<u8>();
            unsafe {
                core::ptr::write(pixels.add(offset), if alpha == 0 { 0 } else { red });
                core::ptr::write(pixels.add(offset + 1), if alpha == 0 { 0 } else { green });
                core::ptr::write(pixels.add(offset + 2), if alpha == 0 { 0 } else { blue });
                core::ptr::write(pixels.add(offset + 3), alpha);
            }
        }
    }
    let pointer = core::ptr::addr_of!(MUZZLE_SPRITE_PIXELS).cast::<u8>() as u32;
    unsafe { draw_muzzle_sprite_batch(pointer, MUZZLE_SPRITE_SIDE as u32, MUZZLE_SPRITE_SIDE as u32); }
    MUZZLE_SPRITE_SIDE as u32
}

/// Rasterizes the diagonal exit fill into the shared RGBA buffer for the Canvas host.
#[no_mangle]
pub extern "C" fn generate_exit_gradient(width: u32, height: u32, cleared: u32) -> u32 {
    if width == 0 || height == 0 || width as usize > RADIAL_MAX_SIDE || height as usize > RADIAL_MAX_SIDE
        || cleared > 1 { return 0; }
    let w = width as usize;
    let h = height as usize;
    let dx = width as f64;
    let dy = height as f64;
    let length_squared = dx * dx + dy * dy;
    if length_squared <= 0.0 { return 0; }
    let (start_rgb, end_rgb, start_alpha, end_alpha) = if cleared == 1 {
        // Cache the cleared gradient at its maximum pulse; the host applies (1+pulse)/2.
        ([25.0, 240.0, 230.0], [255.0, 210.0, 63.0], 0.4, 0.24)
    } else { ([255.0, 46.0, 147.0], [45.0, 15.0, 92.0], 0.2, 0.25) };
    for y in 0..h {
        for x in 0..w {
            let projection = ((x as f64 + 0.5) * dx + (y as f64 + 0.5) * dy) / length_squared;
            let t = if projection < 0.0 { 0.0 } else if projection > 1.0 { 1.0 } else { projection };
            let red = (start_rgb[0] + (end_rgb[0] - start_rgb[0]) * t) as u8;
            let green = (start_rgb[1] + (end_rgb[1] - start_rgb[1]) * t) as u8;
            let blue = (start_rgb[2] + (end_rgb[2] - start_rgb[2]) * t) as u8;
            let alpha = ((start_alpha + (end_alpha - start_alpha) * t) * 255.0 + 0.5) as u8;
            let offset = (y * w + x) * 4;
            let pixels = core::ptr::addr_of_mut!(RADIAL_SPRITE_PIXELS).cast::<u8>();
            unsafe {
                core::ptr::write(pixels.add(offset), red);
                core::ptr::write(pixels.add(offset + 1), green);
                core::ptr::write(pixels.add(offset + 2), blue);
                core::ptr::write(pixels.add(offset + 3), alpha);
            }
        }
    }
    let pointer = core::ptr::addr_of!(RADIAL_SPRITE_PIXELS).cast::<u8>() as u32;
    unsafe { draw_exit_gradient_batch(pointer, width, height); }
    1
}

/// Builds the boss health bar geometry and phase ticks from the active boss state.
/// The color itself remains a host asset/style value; Rust owns dimensions and ordering.
#[no_mangle]
pub extern "C" fn boss_health_input_ptr() -> u32 { core::ptr::addr_of_mut!(BOSS_HEALTH_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_boss_health_bar() -> u32 {
    let input = core::ptr::addr_of!(BOSS_HEALTH_INPUT).cast::<f64>();
    let width = unsafe { core::ptr::read(input) };
    let height = unsafe { core::ptr::read(input.add(1)) };
    let fraction = unsafe { core::ptr::read(input.add(2)) };
    let phase_count = unsafe { core::ptr::read(input.add(3)) };
    unsafe { HUD_SHAPE_COMMAND_COUNT = 0; }
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0 ||
        !fraction.is_finite() || !phase_count.is_finite() || phase_count < 0.0 || phase_count > 8.0 || phase_count != phase_count as u32 as f64 {
        return 0;
    }
    let bar_width = 460.0;
    let x = (width - bar_width) / 2.0;
    let y = height - 92.0;
    hud_shape_command(0, x - 3.0, y - 3.0, bar_width + 6.0, 20.0, 0.0, 0.0);
    hud_shape_command(0, x, y, bar_width * fraction.max(0.0), 14.0, 6.0, 0.0);
    for phase in 0..phase_count as usize {
        let at = unsafe { core::ptr::read(input.add(4 + phase)) };
        if !at.is_finite() { unsafe { HUD_SHAPE_COMMAND_COUNT = 0; } return 0; }
        hud_shape_command(0, x + bar_width * at - 1.0, y, 2.0, 14.0, 7.0, 0.0);
    }
    hud_shape_command(1, x, y, bar_width, 14.0, 8.0, 2.0);
    let count = unsafe { HUD_SHAPE_COMMAND_COUNT };
    let pointer = core::ptr::addr_of!(HUD_SHAPE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_hud_shape_batch(pointer, count); }
    count
}

/// Rotates and positions the off-screen Invasion arrow's three vertices for the host Canvas.
#[no_mangle]
pub extern "C" fn invasion_arrow_input_ptr() -> u32 { core::ptr::addr_of_mut!(INVASION_ARROW_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_invasion_arrow() -> u32 {
    let input = core::ptr::addr_of!(INVASION_ARROW_INPUT).cast::<f64>();
    let (center_x, center_y, cosine, sine) = unsafe {
        (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)), core::ptr::read(input.add(3)))
    };
    if !center_x.is_finite() || !center_y.is_finite() || !cosine.is_finite() || !sine.is_finite() { return 0; }
    let vertices = [(14.0, 0.0), (-8.0, -9.0), (-8.0, 9.0)];
    let output = core::ptr::addr_of_mut!(INVASION_ARROW_POINTS).cast::<f64>();
    for (index, (x, y)) in vertices.iter().enumerate() {
        unsafe {
            core::ptr::write(output.add(index * 2), center_x + x * cosine - y * sine);
            core::ptr::write(output.add(index * 2 + 1), center_y + x * sine + y * cosine);
        }
    }
    unsafe { draw_invasion_arrow_batch(core::ptr::addr_of!(INVASION_ARROW_POINTS).cast::<u8>() as u32); }
    3
}

/// Emits the duplicate pause veil and the two pause-menu button rectangles.
#[no_mangle]
pub extern "C" fn pause_ui_input_ptr() -> u32 { core::ptr::addr_of_mut!(PAUSE_UI_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_pause_ui() -> u32 {
    let input = core::ptr::addr_of!(PAUSE_UI_INPUT).cast::<f64>();
    let width = unsafe { core::ptr::read(input) };
    let height = unsafe { core::ptr::read(input.add(1)) };
    let hover = unsafe { core::ptr::read(input.add(2)) };
    unsafe { HUD_SHAPE_COMMAND_COUNT = 0; }
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0 ||
        !hover.is_finite() || hover < -1.0 || hover > 1.0 || hover != hover as i32 as f64 { return 0; }
    hud_shape_command(0, 0.0, 0.0, width, height, 4.0, 0.0);
    for (index, offset_y) in [26.0, 82.0].iter().enumerate() {
        let x = width / 2.0 - 210.0;
        let y = height / 2.0 + offset_y - 23.0 + 4.0;
        let over = hover == index as f64;
        hud_shape_command(0, x, y, 420.0, 46.0, if over { 11.0 } else { 10.0 }, 0.0);
        let border = if index == 0 { 12.0 } else { 2.0 };
        hud_shape_command(1, x, y, 420.0, 46.0, border, if over { 3.0 } else { 2.0 });
    }
    let count = unsafe { HUD_SHAPE_COMMAND_COUNT };
    unsafe { draw_hud_shape_batch(core::ptr::addr_of!(HUD_SHAPE_COMMANDS).cast::<u8>() as u32, count); }
    count
}

#[no_mangle]
pub extern "C" fn combo_text_input_ptr() -> u32 { core::ptr::addr_of_mut!(COMBO_TEXT_INPUT).cast::<u8>() as u32 }

/// Calculates the pulsing transform and emits the outlined combo multiplier.
#[no_mangle]
pub extern "C" fn draw_combo_text() -> u32 {
    let input = core::ptr::addr_of!(COMBO_TEXT_INPUT).cast::<f64>();
    let combo = unsafe { core::ptr::read(input) };
    let now_ms = unsafe { core::ptr::read(input.add(1)) };
    if !combo.is_finite() || combo <= 1.0 || !now_ms.is_finite() { return 0; }
    let pulse = 1.0 + sin_approx(now_ms / 90.0).max(0.0) * 0.06;
    unsafe { core::ptr::write(core::ptr::addr_of_mut!(COMBO_TEXT_COMMANDS).cast::<f64>(), pulse); }
    unsafe { core::ptr::write(core::ptr::addr_of_mut!(COMBO_TEXT_COMMANDS).cast::<f64>().add(1), combo); }
    let pointer = core::ptr::addr_of!(COMBO_TEXT_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_combo_text_batch(pointer); }
    1
}

#[no_mangle]
pub extern "C" fn hud_image_input_ptr() -> u32 { core::ptr::addr_of_mut!(HUD_IMAGE_INPUT).cast::<u8>() as u32 }

/// Selects and positions the existing screen-space vignette/mask images.
#[no_mangle]
pub extern "C" fn draw_hud_image() -> u32 {
    let input = core::ptr::addr_of!(HUD_IMAGE_INPUT).cast::<f64>();
    let mut values = [0.0; 8];
    for i in 0..8 { values[i] = unsafe { core::ptr::read(input.add(i)) }; }
    let [stage, width, height, crt, has_player, has_mask, image_width, image_height] = values;
    if !values.iter().all(|value| value.is_finite()) || width <= 0.0 || height <= 0.0 { return 0; }
    let command = if stage == 0.0 && has_player > 0.0 {
        [if crt > 0.0 { 1.0 } else { 0.0 }, 0.0, 0.0, width, height]
    } else if stage == 1.0 {
        [2.0, 0.0, 0.0, width, height]
    } else if stage == 2.0 && has_mask > 0.0 {
        [3.0, width - 82.0, 26.0, 56.0, 56.0]
    } else if stage == 3.0 && image_width > 0.0 && image_height > 0.0 {
        [4.0, 32.0, height - 25.0, image_width, image_height]
    } else { return 0; };
    let output = core::ptr::addr_of_mut!(HUD_IMAGE_COMMANDS).cast::<f64>();
    for i in 0..5 { unsafe { core::ptr::write(output.add(i), command[i]); } }
    let pointer = core::ptr::addr_of!(HUD_IMAGE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_hud_image_batch(pointer); }
    1
}

#[no_mangle]
pub extern "C" fn alarm_text_input_ptr() -> u32 { core::ptr::addr_of_mut!(ALARM_TEXT_INPUT).cast::<u8>() as u32 }

/// Validates the alarm timer and centers the existing HUD label.
#[no_mangle]
pub extern "C" fn draw_alarm_text() -> u32 {
    let input = core::ptr::addr_of!(ALARM_TEXT_INPUT).cast::<f64>();
    let seconds = unsafe { core::ptr::read(input) };
    let screen_width = unsafe { core::ptr::read(input.add(1)) };
    if !seconds.is_finite() || seconds <= 0.0 || !screen_width.is_finite() || screen_width <= 0.0 { return 0; }
    let command = [seconds, screen_width / 2.0, 24.0];
    let output = core::ptr::addr_of_mut!(ALARM_TEXT_COMMANDS).cast::<f64>();
    for i in 0..3 { unsafe { core::ptr::write(output.add(i), command[i]); } }
    let pointer = core::ptr::addr_of!(ALARM_TEXT_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_alarm_text_batch(pointer); }
    1
}

/// Projects the rain pool into ordered Canvas line segments. State updates and
/// respawn randomness stay in JavaScript so the weather simulation is unchanged.
#[no_mangle]
pub extern "C" fn rain_input_ptr() -> u32 { core::ptr::addr_of_mut!(RAIN_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_rain(count: u32, step: u32) -> u32 {
    unsafe { RAIN_COMMAND_COUNT = 0; }
    if count as usize > MAX_RAIN_DROPS || (step != 1 && step != 2) { return 0; }
    let input = core::ptr::addr_of!(RAIN_INPUT).cast::<f64>();
    let mut out_count = 0usize;
    for i in (0..count as usize).step_by(step as usize) {
        let offset = i * 3;
        let x = unsafe { core::ptr::read(input.add(offset)) };
        let y = unsafe { core::ptr::read(input.add(offset + 1)) };
        let length = unsafe { core::ptr::read(input.add(offset + 2)) };
        if !x.is_finite() || !y.is_finite() || !length.is_finite() || length < 0.0 { continue; }
        let output = core::ptr::addr_of_mut!(RAIN_COMMANDS).cast::<f64>();
        for (j, value) in [x, y, x - length * 0.18, y + length].iter().enumerate() {
            unsafe { core::ptr::write(output.add(out_count * 4 + j), *value); }
        }
        out_count += 1;
    }
    unsafe { RAIN_COMMAND_COUNT = out_count as u32; }
    if out_count > 0 {
        let pointer = core::ptr::addr_of!(RAIN_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_rain_batch(pointer, out_count as u32); }
    }
    out_count as u32
}

#[no_mangle]
pub extern "C" fn rain_command_count() -> u32 { unsafe { RAIN_COMMAND_COUNT } }

/// Computes the alpha of ambient dust motes while preserving JS-owned motion.
#[no_mangle]
pub extern "C" fn weather_mote_input_ptr() -> u32 { core::ptr::addr_of_mut!(WEATHER_MOTE_INPUT).cast::<u8>() as u32 }

fn weather_sine(angle: f64) -> f64 {
    const PI: f64 = 3.14159265358979323846;
    const HALF_PI: f64 = 1.57079632679489661923;
    const TAU: f64 = 6.28318530717958647692;
    let mut x = angle % TAU;
    if x > PI { x -= TAU; } else if x < -PI { x += TAU; }
    if x > HALF_PI { x = PI - x; } else if x < -HALF_PI { x = -PI - x; }
    let x2 = x * x;
    let mut p = 1.0 / 355687428096000.0;
    p = -1.0 / 1307674368000.0 + x2 * p;
    p = 1.0 / 6227020800.0 + x2 * p;
    p = -1.0 / 39916800.0 + x2 * p;
    p = 1.0 / 362880.0 + x2 * p;
    p = -1.0 / 5040.0 + x2 * p;
    p = 1.0 / 120.0 + x2 * p;
    p = -1.0 / 6.0 + x2 * p;
    x * (1.0 + x2 * p)
}

#[no_mangle]
pub extern "C" fn draw_weather_motes(count: u32, now_ms: f64) -> u32 {
    unsafe { WEATHER_MOTE_COMMAND_COUNT = 0; }
    if count as usize > MAX_WEATHER_MOTES || !now_ms.is_finite() { return 0; }
    let input = core::ptr::addr_of!(WEATHER_MOTE_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(WEATHER_MOTE_COMMANDS).cast::<f64>();
    let mut out_count = 0usize;
    for i in 0..count as usize {
        let offset = i * 4;
        let x = unsafe { core::ptr::read(input.add(offset)) };
        let y = unsafe { core::ptr::read(input.add(offset + 1)) };
        let radius = unsafe { core::ptr::read(input.add(offset + 2)) };
        let phase = unsafe { core::ptr::read(input.add(offset + 3)) };
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 || !phase.is_finite() { continue; }
        let alpha = 0.25 + 0.35 * weather_sine(now_ms / 700.0 + phase).abs();
        for (j, value) in [x, y, radius, alpha].iter().enumerate() {
            unsafe { core::ptr::write(output.add(out_count * 4 + j), *value); }
        }
        out_count += 1;
    }
    unsafe { WEATHER_MOTE_COMMAND_COUNT = out_count as u32; }
    if out_count > 0 {
        let pointer = core::ptr::addr_of!(WEATHER_MOTE_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_weather_motes_batch(pointer, out_count as u32); }
    }
    out_count as u32
}

#[no_mangle]
pub extern "C" fn weather_mote_command_count() -> u32 { unsafe { WEATHER_MOTE_COMMAND_COUNT } }

/// Computes placement and composition for the three ambient fog/smoke sprites.
#[no_mangle]
pub extern "C" fn fog_input_ptr() -> u32 { core::ptr::addr_of_mut!(FOG_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_fog() -> u32 {
    unsafe { FOG_COMMAND_COUNT = 0; }
    let input = core::ptr::addr_of!(FOG_INPUT).cast::<f64>();
    let now_ms = unsafe { core::ptr::read(input) };
    let smoke_value = unsafe { core::ptr::read(input.add(1)) };
    let perf_tier = unsafe { core::ptr::read(input.add(2)) };
    if !now_ms.is_finite() || now_ms < 0.0 || !smoke_value.is_finite() || !(smoke_value == 0.0 || smoke_value == 1.0)
        || !perf_tier.is_finite() || perf_tier < 0.0 { return 0; }
    if perf_tier >= 2.0 { return 0; }
    let smoke = smoke_value == 1.0;
    let alpha = if smoke { 0.16 } else { 0.13 };
    let base_y = if smoke { -(now_ms / 90.0 % 120.0) } else { 0.0 };
    let output = core::ptr::addr_of_mut!(FOG_COMMANDS).cast::<f64>();
    for i in 0..3usize {
        let x = (now_ms / (60.0 + i as f64 * 25.0) + i as f64 * 330.0) % 1400.0 - 440.0;
        let y = base_y + i as f64 * 170.0 - 40.0;
        for (j, value) in [x, y, 920.0, 460.0].iter().enumerate() {
            unsafe { core::ptr::write(output.add(i * 4 + j), *value); }
        }
    }
    unsafe { FOG_COMMAND_COUNT = 3; }
    let pointer = core::ptr::addr_of!(FOG_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_fog_batch(pointer, 3, if smoke { 1 } else { 0 }, alpha); }
    3
}

#[no_mangle]
pub extern "C" fn fog_command_count() -> u32 { unsafe { FOG_COMMAND_COUNT } }

/// Produces screen-space flash, alarm wash, and cinema-bar rectangles.
/// Stage 0 batches storm/neon flashes; stage 1 is the alarm wash; stage 2 is cinema bars.
#[no_mangle]
pub extern "C" fn fx_overlay_input_ptr() -> u32 { core::ptr::addr_of_mut!(FX_OVERLAY_INPUT).cast::<u8>() as u32 }

fn fx_overlay_command(color: f64, x: f64, y: f64, width: f64, height: f64, alpha: f64) {
    unsafe {
        let offset = FX_OVERLAY_COMMAND_COUNT as usize * 6;
        let output = core::ptr::addr_of_mut!(FX_OVERLAY_COMMANDS).cast::<f64>();
        for (i, value) in [color, x, y, width, height, alpha].iter().enumerate() {
            core::ptr::write(output.add(offset + i), *value);
        }
        FX_OVERLAY_COMMAND_COUNT += 1;
    }
}

#[no_mangle]
pub extern "C" fn draw_fx_overlays() -> u32 {
    unsafe { FX_OVERLAY_COMMAND_COUNT = 0; }
    let input = core::ptr::addr_of!(FX_OVERLAY_INPUT).cast::<f64>();
    let (stage, width, height, now_ms, primary, secondary, enabled) = unsafe {
        (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)),
         core::ptr::read(input.add(3)), core::ptr::read(input.add(4)), core::ptr::read(input.add(5)),
         core::ptr::read(input.add(6)))
    };
    if !stage.is_finite() || stage < 0.0 || stage > 3.0 || stage as u32 as f64 != stage
        || !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || !now_ms.is_finite() || !primary.is_finite() || !secondary.is_finite() || !enabled.is_finite() {
        return 0;
    }
    if stage == 0.0 {
        if primary < 0.0 || primary > 1.0 || secondary < 0.0 || secondary > 1.0 { return 0; }
        if enabled > 0.5 {
            if primary > 0.0 { fx_overlay_command(0.0, 0.0, 0.0, width, height, primary * 0.35); }
            if secondary > 0.0 { fx_overlay_command(1.0, 0.0, 0.0, width, height, secondary * 0.35); }
        }
    } else if stage == 1.0 {
        if primary < 0.0 { return 0; }
        if primary > 0.0 {
            let alpha = 0.06 + 0.07 * weather_sine(now_ms / 110.0);
            fx_overlay_command(2.0, 0.0, 0.0, width, height, alpha);
        }
    } else if stage == 2.0 {
        if primary < 0.0 { return 0; }
        if primary > 0.0 {
            let bar_height = 78.0 * (primary / 1.3 * 1.6).min(1.0);
            fx_overlay_command(3.0, 0.0, 0.0, width, bar_height, 1.0);
            fx_overlay_command(3.0, 0.0, height - bar_height, width, bar_height, 1.0);
        }
    } else {
        if primary < 0.0 || primary > 1.0 { return 0; }
        if enabled > 0.5 && primary > 0.0 { fx_overlay_command(4.0, 0.0, 0.0, width, height, primary); }
    }
    let count = unsafe { FX_OVERLAY_COMMAND_COUNT };
    if count > 0 {
        let pointer = core::ptr::addr_of!(FX_OVERLAY_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_fx_overlay_batch(pointer, count); }
    }
    count
}

#[no_mangle]
pub extern "C" fn fx_overlay_command_count() -> u32 { unsafe { FX_OVERLAY_COMMAND_COUNT } }

/// Emits the world-space glow sprites, muzzle flare, and rain reflection.
/// Light animation is calculated here while sprite creation and state remain on the host.
#[no_mangle]
pub extern "C" fn world_light_meta_ptr() -> u32 { core::ptr::addr_of_mut!(WORLD_LIGHT_META).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn world_light_input_ptr() -> u32 { core::ptr::addr_of_mut!(WORLD_LIGHT_INPUT).cast::<u8>() as u32 }

fn world_light_command(kind: f64, index: f64, x: f64, y: f64, width: f64, height: f64, alpha: f64) {
    unsafe {
        let offset = WORLD_LIGHT_COMMAND_COUNT as usize * 7;
        let output = core::ptr::addr_of_mut!(WORLD_LIGHT_COMMANDS).cast::<f64>();
        for (i, value) in [kind, index, x, y, width, height, alpha].iter().enumerate() {
            core::ptr::write(output.add(offset + i), *value);
        }
        WORLD_LIGHT_COMMAND_COUNT += 1;
    }
}

#[no_mangle]
pub extern "C" fn draw_world_lights(count: u32) -> u32 {
    unsafe { WORLD_LIGHT_COMMAND_COUNT = 0; }
    let meta = core::ptr::addr_of!(WORLD_LIGHT_META).cast::<f64>();
    let (now_ms, dim, neon, stride, player_x, player_y, fire_flash, rain_reflection) = unsafe {
        (core::ptr::read(meta), core::ptr::read(meta.add(1)), core::ptr::read(meta.add(2)), core::ptr::read(meta.add(3)),
         core::ptr::read(meta.add(4)), core::ptr::read(meta.add(5)), core::ptr::read(meta.add(6)), core::ptr::read(meta.add(7)))
    };
    if count as usize > MAX_WORLD_LIGHTS || !now_ms.is_finite() || now_ms < 0.0
        || !dim.is_finite() || dim < 0.0 || dim > 1.0
        || !(neon == 0.0 || neon == 1.0) || !(stride == 1.0 || stride == 2.0)
        || !player_x.is_finite() || !player_y.is_finite()
        || !(fire_flash == 0.0 || fire_flash == 1.0) || !(rain_reflection == 0.0 || rain_reflection == 1.0) {
        return 0;
    }
    let input = core::ptr::addr_of!(WORLD_LIGHT_INPUT).cast::<f64>();
    for index in (0..count as usize).step_by(stride as usize) {
        let offset = index * 5;
        let (x, y, radius, phase, enabled) = unsafe {
            (core::ptr::read(input.add(offset)), core::ptr::read(input.add(offset + 1)), core::ptr::read(input.add(offset + 2)),
             core::ptr::read(input.add(offset + 3)), core::ptr::read(input.add(offset + 4)))
        };
        if !enabled.is_finite() || enabled <= 0.5 { continue; }
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius <= 0.0 || !phase.is_finite() { continue; }
        let pulse = 0.55 + 0.45 * weather_sine(now_ms / 520.0 + phase);
        let flicker = if neon == 1.0 && weather_sine(now_ms / 90.0 + phase * 9.0) > 0.97 { 0.4 } else { 1.0 };
        let alpha = 0.22 * pulse * flicker * dim;
        world_light_command(0.0, index as f64, x - radius, y - radius, radius * 2.0, radius * 2.0, alpha);
    }
    if fire_flash == 1.0 {
        world_light_command(1.0, 0.0, player_x - 90.0, player_y - 90.0, 180.0, 180.0, 1.0);
    }
    if rain_reflection == 1.0 {
        world_light_command(2.0, 0.0, player_x, player_y + 14.0, 14.0, 5.0, 0.12);
    }
    let commands = unsafe { WORLD_LIGHT_COMMAND_COUNT };
    if commands > 0 {
        let pointer = core::ptr::addr_of!(WORLD_LIGHT_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_world_light_batch(pointer, commands); }
    }
    commands
}

#[no_mangle]
pub extern "C" fn world_light_command_count() -> u32 { unsafe { WORLD_LIGHT_COMMAND_COUNT } }

/// Computes the expanding outlines for the expansion's temporary world rings.
/// Simulation timers and color strings remain owned by JavaScript.
#[no_mangle]
pub extern "C" fn world_ring_input_ptr() -> u32 { core::ptr::addr_of_mut!(WORLD_RING_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_world_rings(count: u32, color_count: u32) -> u32 {
    unsafe { WORLD_RING_COMMAND_COUNT = 0; }
    if count as usize > MAX_WORLD_RINGS || color_count == 0 || color_count > MAX_WORLD_RINGS as u32 { return 0; }
    let input = core::ptr::addr_of!(WORLD_RING_INPUT).cast::<f64>();
    let output = core::ptr::addr_of_mut!(WORLD_RING_COMMANDS).cast::<f64>();
    let mut emitted = 0usize;
    for index in 0..count as usize {
        let offset = index * 6;
        let (x, y, base_radius, time_left, duration, color) = unsafe {
            (core::ptr::read(input.add(offset)), core::ptr::read(input.add(offset + 1)),
             core::ptr::read(input.add(offset + 2)), core::ptr::read(input.add(offset + 3)),
             core::ptr::read(input.add(offset + 4)), core::ptr::read(input.add(offset + 5)))
        };
        if !x.is_finite() || !y.is_finite() || !base_radius.is_finite() || base_radius < 0.0
            || !time_left.is_finite() || time_left <= 0.0 || !duration.is_finite() || duration <= 0.0
            || !color.is_finite() || color < 0.0 || color >= color_count as f64 || color as u32 as f64 != color { continue; }
        let progress = 1.0 - time_left / duration;
        let out = emitted * 6;
        unsafe {
            core::ptr::write(output.add(out), x);
            core::ptr::write(output.add(out + 1), y);
            core::ptr::write(output.add(out + 2), base_radius * (0.25 + 0.75 * progress));
            core::ptr::write(output.add(out + 3), 6.0 * (1.0 - progress) + 1.0);
            core::ptr::write(output.add(out + 4), time_left / duration);
            core::ptr::write(output.add(out + 5), color);
        }
        emitted += 1;
    }
    unsafe { WORLD_RING_COMMAND_COUNT = emitted as u32; }
    if emitted > 0 {
        let pointer = core::ptr::addr_of!(WORLD_RING_COMMANDS).cast::<u8>() as u32;
        unsafe { draw_world_ring_batch(pointer, emitted as u32); }
    }
    emitted as u32
}

#[no_mangle]
pub extern "C" fn world_ring_command_count() -> u32 { unsafe { WORLD_RING_COMMAND_COUNT } }

/// Emits the animated barrel drawing commands while barrel state stays in JavaScript.
#[no_mangle]
pub extern "C" fn world_barrel_input_ptr() -> u32 { core::ptr::addr_of_mut!(WORLD_BARREL_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_world_barrels(count: u32, now_ms: f64) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    if count as usize > MAX_WORLD_BARRELS || !now_ms.is_finite() || now_ms < 0.0 { return 0; }
    let input = core::ptr::addr_of!(WORLD_BARREL_INPUT).cast::<f64>();
    let blinking = ((now_ms / 70.0) as u64) % 2 == 1;
    let mut emitted = 0u32;
    for index in 0..count as usize {
        let offset = index * 4;
        let (x, y, radius, timer) = unsafe {
            (core::ptr::read(input.add(offset)), core::ptr::read(input.add(offset + 1)),
             core::ptr::read(input.add(offset + 2)), core::ptr::read(input.add(offset + 3)))
        };
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius <= 0.0 || !timer.is_finite() { continue; }
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // save
        furniture_command(19, 0, x, y, 0.0, 0.0, 0.0, 0.0); // translate
        ffill(108); fbegin(); furniture_command(11, 0, 0.0, 0.0, radius + 5.0, 0.0, 6.283185307179586, 0.0); ffill_path();
        ffill(if timer >= 0.0 && blinking { 109 } else { 110 });
        fbegin(); furniture_command(11, 0, 0.0, 0.0, radius, 0.0, 6.283185307179586, 0.0); ffill_path();
        ffill(111);
        frect(-radius + 2.0, -6.5, radius * 2.0 - 4.0, 3.0);
        frect(-radius + 2.0, 3.5, radius * 2.0 - 4.0, 3.0);
        fstroke(112); fline(2.0); fstroke_path();
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // restore
        emitted += 1;
    }
    flush_furniture_commands();
    emitted
}

/// Emits camera cone and body drawing commands from the live camera poses.
#[no_mangle]
pub extern "C" fn world_camera_input_ptr() -> u32 { core::ptr::addr_of_mut!(WORLD_CAMERA_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_world_cameras(count: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    if count as usize > MAX_WORLD_CAMERAS { return 0; }
    let input = core::ptr::addr_of!(WORLD_CAMERA_INPUT).cast::<f64>();
    let mut emitted = 0u32;
    for index in 0..count as usize {
        let offset = index * 30;
        let (x, y, angle, hot) = unsafe {
            (core::ptr::read(input.add(offset)), core::ptr::read(input.add(offset + 1)),
             core::ptr::read(input.add(offset + 2)), core::ptr::read(input.add(offset + 3)))
        };
        if !x.is_finite() || !y.is_finite() || !angle.is_finite() || (hot != 0.0 && hot != 1.0) { continue; }
        let mut valid = true;
        for point in 0..13 {
            let px = unsafe { core::ptr::read(input.add(offset + 4 + point * 2)) };
            let py = unsafe { core::ptr::read(input.add(offset + 5 + point * 2)) };
            if !px.is_finite() || !py.is_finite() { valid = false; break; }
        }
        if !valid { continue; }
        let (cone_fill, camera_edge, lens) = if hot == 1.0 { (113, 117, 117) } else { (114, 116, 116) };
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        ffill(cone_fill); fbegin(); fmove(x, y);
        for point in 0..13 {
            let px = unsafe { core::ptr::read(input.add(offset + 4 + point * 2)) };
            let py = unsafe { core::ptr::read(input.add(offset + 5 + point * 2)) };
            furniture_command(35, 0, px, py, 0.0, 0.0, 0.0, 0.0);
        }
        furniture_command(35, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        ffill_path(); furniture_command(19, 0, x, y, 0.0, 0.0, 0.0, 0.0);
        furniture_command(20, 0, angle, 0.0, 0.0, 0.0, 0.0, 0.0);
        ffill(115); frect(-7.0, -5.0, 14.0, 10.0); fstroke(camera_edge); fline(2.0); fsrect(-7.0, -5.0, 14.0, 10.0);
        ffill(lens); fbegin(); furniture_command(11, 0, 7.0, 0.0, 3.0, 0.0, 6.283185307179586, 0.0); ffill_path();
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        emitted += 1;
    }
    flush_furniture_commands();
    emitted
}

/// Emits class accents, sniper telegraphs, and boss charge rings for visible enemies.
#[no_mangle]
pub extern "C" fn world_enemy_input_ptr() -> u32 { core::ptr::addr_of_mut!(WORLD_ENEMY_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_world_enemy_accents(count: u32, now_ms: f64) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    if count as usize > MAX_WORLD_ENEMIES || !now_ms.is_finite() || now_ms < 0.0 { return 0; }
    let input = core::ptr::addr_of!(WORLD_ENEMY_INPUT).cast::<f64>();
    let mut emitted = 0u32;
    for index in 0..count as usize {
        let offset = index * 13;
        let (x, y, radius, kind, hp, angle, tele, sniper, charge, charge_angle, color, boss_color, base_alpha) = unsafe {
            (core::ptr::read(input.add(offset)), core::ptr::read(input.add(offset + 1)),
             core::ptr::read(input.add(offset + 2)), core::ptr::read(input.add(offset + 3)),
             core::ptr::read(input.add(offset + 4)), core::ptr::read(input.add(offset + 5)),
             core::ptr::read(input.add(offset + 6)), core::ptr::read(input.add(offset + 7)),
             core::ptr::read(input.add(offset + 8)), core::ptr::read(input.add(offset + 9)),
             core::ptr::read(input.add(offset + 10)), core::ptr::read(input.add(offset + 11)),
             core::ptr::read(input.add(offset + 12)))
        };
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius <= 0.0 ||
            !kind.is_finite() || kind < 0.0 || kind > 3.0 || kind != (kind as u32) as f64 ||
            !hp.is_finite() || !angle.is_finite() || !tele.is_finite() ||
            (sniper != 0.0 && sniper != 1.0) || (charge != 0.0 && charge != 1.0) ||
            !charge_angle.is_finite() || !color.is_finite() || color < 0.0 || color != (color as u32) as f64 ||
            !boss_color.is_finite() || boss_color < 0.0 || boss_color != (boss_color as u32) as f64 ||
            !base_alpha.is_finite() || base_alpha < 0.0 || base_alpha > 1.0 { continue; }
        let color = color as u32;
        let boss_color = boss_color as u32;
        let line_width = if kind == 1.0 { 4.0 } else { 2.0 };
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, x, y, 0.0, 0.0, 0.0, 0.0);
        furniture_command(37, color, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        fline(line_width + 6.0); furniture_command(18, 0, base_alpha * 0.28, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); farc(0.0, 0.0, radius + 5.0); fstroke_path();
        furniture_command(18, 0, base_alpha, 0.0, 0.0, 0.0, 0.0, 0.0);
        fline(line_width); fbegin(); farc(0.0, 0.0, radius + 5.0); fstroke_path();
        if kind == 1.0 && hp > 0.0 {
            ffill(color);
            for bar in 0..16 {
                if bar as f64 >= hp { break; }
                frect(-9.0 + bar as f64 * 7.0, -radius - 12.0, 5.0, 3.0);
            }
        }
        if kind == 2.0 {
            ffill(color); fbegin(); fmove(-7.0, -radius - 6.0);
            for (px, py) in [(-7.0,-radius-14.0),(-3.0,-radius-9.0),(0.0,-radius-16.0),(3.0,-radius-9.0),(7.0,-radius-14.0),(7.0,-radius-6.0)] { furniture_command(10, 0, px, py, 0.0, 0.0, 0.0, 0.0); }
            ffill_path();
        }
        if sniper == 1.0 && tele > 0.0 {
            furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            furniture_command(37, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            furniture_command(18, 0, base_alpha * (0.35 + 0.5 * (1.0 - tele / 0.7)), 0.0, 0.0, 0.0, 0.0, 0.0);
            fline(1.5); fbegin(); fmove(x, y);
            furniture_command(10, 0, x + sin_approx(angle + 1.5707963267948966) * 560.0, y + sin_approx(angle) * 560.0, 0.0, 0.0, 0.0, 0.0);
            fstroke_path();
        } else if kind == 3.0 {
            furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            furniture_command(19, 0, x, y, 0.0, 0.0, 0.0, 0.0);
            let pulse = 1.0 + sin_approx(now_ms / 160.0) * 0.08;
            furniture_command(37, boss_color, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            furniture_command(18, 0, base_alpha * 0.3, 0.0, 0.0, 0.0, 0.0, 0.0);
            fline(12.0); fbegin(); farc(0.0, 0.0, (radius + 8.0) * pulse); fstroke_path();
            furniture_command(18, 0, base_alpha, 0.0, 0.0, 0.0, 0.0, 0.0);
            fline(4.0); fbegin(); farc(0.0, 0.0, (radius + 8.0) * pulse); fstroke_path();
            if charge == 1.0 {
                furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                furniture_command(37, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                furniture_command(18, 0, base_alpha * 0.7, 0.0, 0.0, 0.0, 0.0, 0.0);
                fline(3.0); furniture_command(38, 0, 8.0, 6.0, 0.0, 0.0, 0.0, 0.0);
                fbegin(); fmove(x, y);
                furniture_command(10, 0, x + sin_approx(charge_angle + 1.5707963267948966) * 420.0, y + sin_approx(charge_angle) * 420.0, 0.0, 0.0, 0.0, 0.0);
                fstroke_path();
            }
        }
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        emitted += 1;
    }
    flush_furniture_commands();
    emitted
}

/// Draws intact glass highlights and active shards; their simulation remains in JavaScript.
#[no_mangle]
pub extern "C" fn glass_panel_input_ptr() -> u32 { core::ptr::addr_of_mut!(GLASS_PANEL_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn glass_shard_input_ptr() -> u32 { core::ptr::addr_of_mut!(GLASS_SHARD_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_glass(panel_count: u32, shard_count: u32, now_ms: f64, base_alpha: f64) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    if panel_count as usize > MAX_GLASS_PANELS || shard_count as usize > MAX_GLASS_SHARDS ||
        !now_ms.is_finite() || now_ms < 0.0 || !base_alpha.is_finite() || !(0.0..=1.0).contains(&base_alpha) { return 0; }
    let panels = core::ptr::addr_of!(GLASS_PANEL_INPUT).cast::<f64>();
    let shards = core::ptr::addr_of!(GLASS_SHARD_INPUT).cast::<f64>();
    for index in 0..panel_count as usize {
        let offset = index * 4;
        let (x, y, width, height) = unsafe {
            (core::ptr::read(panels.add(offset)), core::ptr::read(panels.add(offset + 1)),
             core::ptr::read(panels.add(offset + 2)), core::ptr::read(panels.add(offset + 3)))
        };
        if !x.is_finite() || !y.is_finite() || !width.is_finite() || width <= 2.0 || !height.is_finite() || height <= 2.0 { return 0; }
    }
    for index in 0..shard_count as usize {
        let offset = index * 7;
        let (x, y, rotation, life, max_life, size, color) = unsafe {
            (core::ptr::read(shards.add(offset)), core::ptr::read(shards.add(offset + 1)),
             core::ptr::read(shards.add(offset + 2)), core::ptr::read(shards.add(offset + 3)),
             core::ptr::read(shards.add(offset + 4)), core::ptr::read(shards.add(offset + 5)),
             core::ptr::read(shards.add(offset + 6)))
        };
        if !x.is_finite() || !y.is_finite() || !rotation.is_finite() || !life.is_finite() || life <= 0.0 ||
            !max_life.is_finite() || max_life <= 0.0 || !size.is_finite() || size <= 0.0 ||
            !color.is_finite() || color < 0.0 || color >= 4.0 || color as u32 as f64 != color { return 0; }
    }
    for index in 0..panel_count as usize {
        let offset = index * 4;
        let x = unsafe { core::ptr::read(panels.add(offset)) };
        let y = unsafe { core::ptr::read(panels.add(offset + 1)) };
        let width = unsafe { core::ptr::read(panels.add(offset + 2)) };
        let height = unsafe { core::ptr::read(panels.add(offset + 3)) };
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        ffill(118); frect(x, y, width, height);
        fstroke(119); fline(2.0); fsrect(x + 1.0, y + 1.0, width - 2.0, height - 2.0);
        fstroke(120); fline(3.0); fbegin(); fmove(x + 6.0, y + 30.0); fline_to(x + 30.0, y + 6.0); fstroke_path();
        let shimmer = (now_ms / 40.0 + x) % 120.0;
        if shimmer < 40.0 {
            furniture_command(18, 0, base_alpha * (0.5 - shimmer / 80.0), 0.0, 0.0, 0.0, 0.0, 0.0);
            fstroke(121); fbegin(); fmove(x + shimmer, y); fline_to(x + shimmer - 20.0, y + height); fstroke_path();
        }
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    for index in 0..shard_count as usize {
        let offset = index * 7;
        let (x, y, rotation, life, max_life, size, color) = unsafe {
            (core::ptr::read(shards.add(offset)), core::ptr::read(shards.add(offset + 1)),
             core::ptr::read(shards.add(offset + 2)), core::ptr::read(shards.add(offset + 3)),
             core::ptr::read(shards.add(offset + 4)), core::ptr::read(shards.add(offset + 5)),
             core::ptr::read(shards.add(offset + 6)) as u32)
        };
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, x, y, 0.0, 0.0, 0.0, 0.0);
        furniture_command(20, 0, rotation, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(18, 0, base_alpha * (1.0_f64.min(life / max_life * 1.5)), 0.0, 0.0, 0.0, 0.0, 0.0);
        ffill(122 + color); fbegin(); fmove(-size, size * 0.6);
        fline_to(size * 1.1, 0.0); fline_to(-size * 0.2, -size);
        furniture_command(35, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); ffill_path();
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    flush_furniture_commands();
    panel_count + shard_count
}

/// Emits frame shake and camera transforms in their original Canvas save scopes.
#[no_mangle]
pub extern "C" fn frame_transform_input_ptr() -> u32 { core::ptr::addr_of_mut!(FRAME_TRANSFORM_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_frame_transforms(stage: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    if stage == 3 || stage == 4 {
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        flush_furniture_commands();
        return 1;
    }
    if stage > 2 { return 0; }
    let input = core::ptr::addr_of!(FRAME_TRANSFORM_INPUT).cast::<f64>();
    let (screen_shake, screen_power, screen_rx, screen_ry, kick_x, kick_y, shake, shake_scale, shake_rx, shake_ry) = unsafe {
        (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2)),
         core::ptr::read(input.add(3)), core::ptr::read(input.add(4)), core::ptr::read(input.add(5)),
         core::ptr::read(input.add(6)), core::ptr::read(input.add(7)), core::ptr::read(input.add(8)),
         core::ptr::read(input.add(9)))
    };
    let mut emitted = 0u32;
    if stage == 0 {
        if !screen_shake.is_finite() || screen_shake < 0.0 || !screen_power.is_finite() || screen_power < 0.0 ||
            !screen_rx.is_finite() || screen_rx < 0.0 || screen_rx > 1.0 || !screen_ry.is_finite() || screen_ry < 0.0 || screen_ry > 1.0 { return 0; }
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        emitted += 1;
        if screen_shake > 0.0 {
            let factor = screen_power * (screen_shake / 0.14);
            furniture_command(19, 0, (screen_rx - 0.5) * factor, (screen_ry - 0.5) * factor, 0.0, 0.0, 0.0, 0.0);
            emitted += 1;
        }
    } else if stage == 1 {
        if !kick_x.is_finite() || !kick_y.is_finite() || !shake.is_finite() || shake < 0.0 ||
            !shake_scale.is_finite() || shake_scale < 0.0 || !shake_rx.is_finite() || shake_rx < 0.0 || shake_rx > 1.0 ||
            !shake_ry.is_finite() || shake_ry < 0.0 || shake_ry > 1.0 { return 0; }
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        emitted += 1;
        furniture_command(19, 0, kick_x * shake_scale, kick_y * shake_scale, 0.0, 0.0, 0.0, 0.0);
        emitted += 1;
        if shake > 0.0 && shake_scale > 0.0 {
            let factor = shake * shake_scale;
            furniture_command(19, 0, (shake_rx - 0.5) * factor, (shake_ry - 0.5) * factor, 0.0, 0.0, 0.0, 0.0);
            emitted += 1;
        }
    } else {
        let (width, height, zoom, camera_x, camera_y) = unsafe {
            (core::ptr::read(input.add(10)), core::ptr::read(input.add(11)),
             core::ptr::read(input.add(12)), core::ptr::read(input.add(13)),
             core::ptr::read(input.add(14)))
        };
        if !width.is_finite() || width <= 0.0 || !height.is_finite() || height <= 0.0 ||
            !zoom.is_finite() || zoom <= 0.0 || !camera_x.is_finite() || !camera_y.is_finite() { return 0; }
        furniture_command(19, 0, width / 2.0, height / 2.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(39, 0, zoom, zoom, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, -width / 2.0, -height / 2.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, -camera_x, -camera_y, 0.0, 0.0, 0.0, 0.0);
        emitted = 4;
    }
    flush_furniture_commands();
    emitted
}

/// Computes the pulsing world marker drawn by the Invasion mode.
#[no_mangle]
pub extern "C" fn invasion_zone_input_ptr() -> u32 { core::ptr::addr_of_mut!(INVASION_ZONE_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_invasion_zone() -> u32 {
    unsafe { INVASION_ZONE_COMMAND_COUNT = 0; }
    let input = core::ptr::addr_of!(INVASION_ZONE_INPUT).cast::<f64>();
    let (x, y, now_ms) = unsafe { (core::ptr::read(input), core::ptr::read(input.add(1)), core::ptr::read(input.add(2))) };
    if !x.is_finite() || !y.is_finite() || !now_ms.is_finite() || now_ms < 0.0 { return 0; }
    let pulse = 0.5 + 0.5 * sin_approx(now_ms / 260.0);
    let output = core::ptr::addr_of_mut!(INVASION_ZONE_COMMANDS).cast::<f64>();
    unsafe {
        core::ptr::write(output, x);
        core::ptr::write(output.add(1), y);
        core::ptr::write(output.add(2), 34.0);
        core::ptr::write(output.add(3), 0.5 + 0.4 * pulse);
        core::ptr::write(output.add(4), 4.0);
        core::ptr::write(output.add(5), 0.14);
        INVASION_ZONE_COMMAND_COUNT = 1;
    }
    let pointer = core::ptr::addr_of!(INVASION_ZONE_COMMANDS).cast::<u8>() as u32;
    unsafe { draw_invasion_zone_batch(pointer); }
    1
}

#[no_mangle]
pub extern "C" fn invasion_zone_command_count() -> u32 { unsafe { INVASION_ZONE_COMMAND_COUNT } }

/// Validates and orders the visible HUD text placements before host rasterization.
/// Each record is [text id, x, y, alignment id, alpha]; string/cache lookup stays in the host.
#[no_mangle]
pub extern "C" fn hud_text_input_ptr() -> u32 { core::ptr::addr_of_mut!(HUD_TEXT_INPUT).cast::<u8>() as u32 }

#[no_mangle]
pub extern "C" fn draw_hud_text(count: u32) -> u32 {
    unsafe { HUD_TEXT_COMMAND_COUNT = 0; }
    if count as usize > MAX_HUD_TEXTS { return 0; }
    let mut out_count = 0usize;
    for index in 0..count as usize {
        let input = core::ptr::addr_of!(HUD_TEXT_INPUT).cast::<f64>();
        let offset = index * 5;
        let id = unsafe { core::ptr::read(input.add(offset)) };
        let x = unsafe { core::ptr::read(input.add(offset + 1)) };
        let y = unsafe { core::ptr::read(input.add(offset + 2)) };
        let align = unsafe { core::ptr::read(input.add(offset + 3)) };
        let alpha = unsafe { core::ptr::read(input.add(offset + 4)) };
        if !id.is_finite() || id < 0.0 || id >= MAX_HUD_TEXTS as f64 || id as u32 as f64 != id
            || !x.is_finite() || !y.is_finite()
            || !align.is_finite() || align < 0.0 || align > 2.0 || align as u32 as f64 != align
            || !alpha.is_finite() || alpha < 0.0 || alpha > 1.0 {
            continue;
        }
        let output = core::ptr::addr_of_mut!(HUD_TEXT_COMMANDS).cast::<f64>();
        let out_offset = out_count * 5;
        unsafe {
            core::ptr::write(output.add(out_offset), id);
            core::ptr::write(output.add(out_offset + 1), x);
            core::ptr::write(output.add(out_offset + 2), y);
            core::ptr::write(output.add(out_offset + 3), align);
            core::ptr::write(output.add(out_offset + 4), alpha);
        }
        out_count += 1;
    }
    let pointer = core::ptr::addr_of!(HUD_TEXT_COMMANDS).cast::<u8>() as u32;
    unsafe {
        HUD_TEXT_COMMAND_COUNT = out_count as u32;
        if out_count > 0 { draw_hud_text_batch(pointer, out_count as u32); }
    }
    out_count as u32
}

#[no_mangle]
pub extern "C" fn hud_text_command_count() -> u32 { unsafe { HUD_TEXT_COMMAND_COUNT } }

fn random(state: &mut u32) -> f64 {
    *state = state.wrapping_add(0x6D2B79F5);
    let mut t = (*state ^ (*state >> 15)).wrapping_mul(1 | *state);
    t = (t.wrapping_add((t ^ (t >> 7)).wrapping_mul(61 | t))) ^ t;
    ((t ^ (t >> 14)) as u32) as f64 / 4_294_967_296.0
}

#[inline]
fn floor_f64(value: f64) -> f64 {
    let truncated = value as i64 as f64;
    if truncated > value { truncated - 1.0 } else { truncated }
}

#[inline]
fn ceil_f64(value: f64) -> f64 {
    let truncated = value as i64 as f64;
    if truncated < value { truncated + 1.0 } else { truncated }
}

#[inline]
fn floor_rect(color: u32, x: f64, y: f64, w: f64, h: f64) {
    unsafe {
        FLOOR_RECTS = FLOOR_RECTS.wrapping_add(1);
        let offset = FLOOR_COMMAND_COUNT as usize * 5;
        let commands = core::ptr::addr_of_mut!(FLOOR_COMMANDS).cast::<f64>();
        core::ptr::write(commands.add(offset), color as f64);
        core::ptr::write(commands.add(offset + 1), x);
        core::ptr::write(commands.add(offset + 2), y);
        core::ptr::write(commands.add(offset + 3), w);
        core::ptr::write(commands.add(offset + 4), h);
        FLOOR_COMMAND_COUNT += 1;
        if FLOOR_COMMAND_COUNT as usize == FLOOR_BATCH_SIZE {
            flush_floor_commands();
        }
    }
}

fn flush_floor_commands() {
    unsafe {
        if FLOOR_COMMAND_COUNT == 0 { return; }
        let pointer = core::ptr::addr_of!(FLOOR_COMMANDS).cast::<u8>() as u32;
        let count = FLOOR_COMMAND_COUNT;
        FLOOR_COMMAND_COUNT = 0;
        draw_floor_batch(pointer, count);
    }
}

/// Paints one static floor region. `kind`: 1 carpet, 2 tile, 3 brick.
/// The color indices are resolved by the Canvas host; geometry, patterns,
/// iteration order, and the game's deterministic random sequence live in Rust.
#[no_mangle]
pub extern "C" fn paint_floor(kind: u32, x: f64, y: f64, w: f64, h: f64, spacing: f64, seed: u32) -> u32 {
    let mut state = seed;
    unsafe { FLOOR_COMMAND_COUNT = 0; }
    match kind {
        1 => {
            floor_rect(0, x, y, w, h);
            let limit = ceil_f64((w * h / 12.0).max(0.0)).min(2_000_000.0) as u32;
            for _ in 0..limit {
                let shade = if random(&mut state) < 0.5 { 1 } else { 2 };
                let px = x + floor_f64(random(&mut state) * w / 2.0) * 2.0;
                let py = y + floor_f64(random(&mut state) * h / 2.0) * 2.0;
                floor_rect(shade, px, py, 2.0, 2.0);
            }
        }
        2 => {
            floor_rect(2, x, y, w, h);
            if spacing > 0.0 {
                let rows = ceil_f64(h / spacing).max(0.0).min(100_000.0) as u32;
                let cols = ceil_f64(w / spacing).max(0.0).min(100_000.0) as u32;
                for j in 0..rows {
                    for i in 0..cols {
                        let px = x + i as f64 * spacing + 1.0;
                        let py = y + j as f64 * spacing + 1.0;
                        let rw = (spacing - 1.0).min(w - i as f64 * spacing - 1.0);
                        let rh = (spacing - 1.0).min(h - j as f64 * spacing - 1.0);
                        floor_rect(if (i + j) % 2 == 1 { 0 } else { 1 }, px, py, rw, rh);
                    }
                }
            }
        }
        3 => {
            floor_rect(4, x, y, w, h);
            if w > 0.0 && h > 0.0 {
                let rows = ceil_f64(h / 10.0).min(100_000.0) as u32;
                let cols = ceil_f64(w / 28.0).min(100_000.0) as u32 + 1;
                for j in 0..rows {
                    let yy = y + j as f64 * 10.0;
                    let row_x = x - (j % 2) as f64 * 14.0;
                    for i in 0..cols {
                        let xx = row_x + i as f64 * 28.0;
                        if xx >= x + w { continue; }
                        let shade = floor_f64(random(&mut state) * 4.0) as u32;
                        floor_rect(shade, xx + 1.0, yy + 1.0, 26.0, 8.0);
                        floor_rect(5, xx + 1.0, yy + 1.0, 26.0, 1.0);
                    }
                }
            }
        }
        _ => {}
    }
    flush_floor_commands();
    state
}

/// Generates the same deterministic floor grain as buildFloor's seeded JS loop.
#[no_mangle]
pub extern "C" fn paint_floor_grain(width: f64, height: f64, seed: u32) -> u32 {
    let mut state = seed;
    unsafe { FLOOR_COMMAND_COUNT = 0; }
    let count = floor_f64((width * height / 160.0) + 0.5).max(0.0).min(2_000_000.0) as u32;
    for _ in 0..count {
        let color = if random(&mut state) < 0.5 { 0 } else { 1 };
        let x = floor_f64(random(&mut state) * width.max(0.0));
        let y = floor_f64(random(&mut state) * height.max(0.0));
        let w = 1.0 + floor_f64(random(&mut state) * 2.0);
        floor_rect(color, x, y, w, 1.0);
    }
    flush_floor_commands();
    state
}

/// Rasterizes seeded floor-grain rectangles into a reusable transparent RGBA layer.
/// Returns the exact next RNG state and transfers the completed pixels to the host once.
#[no_mangle]
pub extern "C" fn paint_floor_grain_rgba(width: f64, height: f64, seed: u32) -> u32 {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > FLOOR_GRAIN_MAX_WIDTH as f64 || height > FLOOR_GRAIN_MAX_HEIGHT as f64
        || width != floor_f64(width) || height != floor_f64(height) { return 0; }
    let w = width as usize;
    let h = height as usize;
    let len = w * h * 4;
    let pixels = core::ptr::addr_of_mut!(FLOOR_GRAIN_PIXELS).cast::<u8>();
    for index in 0..len { unsafe { core::ptr::write(pixels.add(index), 0); } }
    let mut state = seed;
    let count = floor_f64((width * height / 160.0) + 0.5).max(0.0).min(2_000_000.0) as u32;
    for _ in 0..count {
        let white = random(&mut state) >= 0.5;
        let x = floor_f64(random(&mut state) * width);
        let y = floor_f64(random(&mut state) * height);
        let rect_width = 1 + floor_f64(random(&mut state) * 2.0) as usize;
        let x = x as usize;
        let y = y as usize;
        let source_alpha: u32 = if white { 15 } else { 23 };
        let source_premultiplied = if white { source_alpha } else { 0 };
        for px in x..(x + rect_width).min(w) {
            let offset = (y * w + px) * 4;
            let dest_alpha = unsafe { core::ptr::read(pixels.add(offset + 3)) as u32 };
            let inverse_alpha = 255 - source_alpha;
            let out_alpha = source_alpha + dest_alpha * inverse_alpha / 255;
            for channel in 0..3 {
                let dest = unsafe { core::ptr::read(pixels.add(offset + channel)) as u32 };
                let out = source_premultiplied + dest * inverse_alpha / 255;
                unsafe { core::ptr::write(pixels.add(offset + channel), out.min(255) as u8); }
            }
            unsafe { core::ptr::write(pixels.add(offset + 3), out_alpha.min(255) as u8); }
        }
    }
    for pixel in 0..(w * h) {
        let offset = pixel * 4;
        let alpha = unsafe { core::ptr::read(pixels.add(offset + 3)) as u32 };
        if alpha == 0 { continue; }
        for channel in 0..3 {
            let premultiplied = unsafe { core::ptr::read(pixels.add(offset + channel)) as u32 };
            let unpremultiplied = (premultiplied * 255 + alpha / 2) / alpha;
            unsafe { core::ptr::write(pixels.add(offset + channel), unpremultiplied.min(255) as u8); }
        }
    }
    unsafe { FLOOR_RECTS = FLOOR_RECTS.saturating_add(count); }
    let pointer = core::ptr::addr_of!(FLOOR_GRAIN_PIXELS).cast::<u8>() as u32;
    unsafe { draw_floor_rgba_batch(pointer, w as u32, h as u32); }
    state
}

/// Draws static solid shadows and tile grout after the floor-image overlays.
#[no_mangle]
pub extern "C" fn paint_floor_finish(solid_count: u32, width: f64, height: f64) {
    let solids = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let count = (solid_count as usize).min(MAX_POINTS);
    unsafe { FLOOR_COMMAND_COUNT = 0; }
    for index in 0..count {
        let rect = unsafe { core::ptr::read(solids.add(index)) };
        floor_rect(0, rect.x + 5.0, rect.y + 7.0, rect.w, rect.h);
    }
    let mut x = 0.0;
    while x < width {
        floor_rect(1, x, 0.0, 1.0, height);
        x += 24.0;
    }
    let mut y = 0.0;
    while y < height {
        floor_rect(1, 0.0, y, width, 1.0);
        y += 24.0;
    }
    flush_floor_commands();
}

#[inline]
fn floor_finish_alpha_blend(pixels: *mut u8, offset: usize, source_alpha: u32) {
    if source_alpha == 0 { return; }
    let inverse = 255 - source_alpha;
    let dest_alpha = unsafe { core::ptr::read(pixels.add(offset + 3)) as u32 };
    let out_alpha = source_alpha + dest_alpha * inverse / 255;
    for channel in 0..3 {
        let dest = unsafe { core::ptr::read(pixels.add(offset + channel)) as u32 };
        unsafe { core::ptr::write(pixels.add(offset + channel), (dest * inverse / 255).min(255) as u8); }
    }
    unsafe { core::ptr::write(pixels.add(offset + 3), out_alpha.min(255) as u8); }
}

#[inline]
fn floor_finish_rect(pixels: *mut u8, width: usize, height: usize, rect: Rect, opacity: f64) {
    let left = rect.x.max(0.0).min(width as f64);
    let top = rect.y.max(0.0).min(height as f64);
    let right = (rect.x + rect.w).max(0.0).min(width as f64);
    let bottom = (rect.y + rect.h).max(0.0).min(height as f64);
    if right <= left || bottom <= top { return; }
    let x0 = floor_f64(left) as usize;
    let y0 = floor_f64(top) as usize;
    let x1 = ceil_f64(right) as usize;
    let y1 = ceil_f64(bottom) as usize;
    for y in y0..y1 {
        let coverage_y = (bottom.min(y as f64 + 1.0) - top.max(y as f64)).max(0.0);
        for x in x0..x1 {
            let coverage_x = (right.min(x as f64 + 1.0) - left.max(x as f64)).max(0.0);
            let coverage = coverage_x * coverage_y;
            let alpha = (opacity * coverage * 255.0 + 0.5) as u32;
            floor_finish_alpha_blend(pixels, (y * width + x) * 4, alpha.min(255));
        }
    }
}

/// Rasters the static solid shadows and tile grout over the existing Rust RGBA floor layer.
/// Returns the number of source rectangles, or u32::MAX when the caller should use Canvas.
#[no_mangle]
pub extern "C" fn paint_floor_finish_rgba(solid_count: u32, width: f64, height: f64) -> u32 {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > FLOOR_GRAIN_MAX_WIDTH as f64 || height > FLOOR_GRAIN_MAX_HEIGHT as f64
        || width != floor_f64(width) || height != floor_f64(height)
        || solid_count as usize > MAX_POINTS { return u32::MAX; }
    let w = width as usize;
    let h = height as usize;
    let solids = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    for index in 0..solid_count as usize {
        let rect = unsafe { core::ptr::read(solids.add(index)) };
        if !rect.x.is_finite() || !rect.y.is_finite() || !rect.w.is_finite() || !rect.h.is_finite() || rect.w < 0.0 || rect.h < 0.0 { return u32::MAX; }
    }
    let pixels = core::ptr::addr_of_mut!(FLOOR_GRAIN_PIXELS).cast::<u8>();
    let buffer_len = w * h;
    for pixel in 0..buffer_len {
        let offset = pixel * 4;
        let alpha = unsafe { core::ptr::read(pixels.add(offset + 3)) as u32 };
        for channel in 0..3 {
            let color = unsafe { core::ptr::read(pixels.add(offset + channel)) as u32 };
            unsafe { core::ptr::write(pixels.add(offset + channel), ((color * alpha + 127) / 255) as u8); }
        }
    }
    for index in 0..solid_count as usize {
        let solid = unsafe { core::ptr::read(solids.add(index)) };
        floor_finish_rect(pixels, w, h, Rect { x: solid.x + 5.0, y: solid.y + 7.0, w: solid.w, h: solid.h }, 0.32);
    }
    let mut x = 0usize;
    while x < w {
        floor_finish_rect(pixels, w, h, Rect { x: x as f64, y: 0.0, w: 1.0, h: height }, 0.07);
        x += 24;
    }
    let mut y = 0usize;
    while y < h {
        floor_finish_rect(pixels, w, h, Rect { x: 0.0, y: y as f64, w: width, h: 1.0 }, 0.07);
        y += 24;
    }
    for pixel in 0..buffer_len {
        let offset = pixel * 4;
        let alpha = unsafe { core::ptr::read(pixels.add(offset + 3)) as u32 };
        if alpha == 0 { continue; }
        for channel in 0..3 {
            let premultiplied = unsafe { core::ptr::read(pixels.add(offset + channel)) as u32 };
            unsafe { core::ptr::write(pixels.add(offset + channel), ((premultiplied * 255 + alpha / 2) / alpha).min(255) as u8); }
        }
    }
    let vertical_count = (w + 23) / 24;
    let horizontal_count = (h + 23) / 24;
    let command_count = solid_count + vertical_count as u32 + horizontal_count as u32;
    unsafe { FLOOR_RECTS = FLOOR_RECTS.saturating_add(command_count); }
    let pointer = core::ptr::addr_of!(FLOOR_GRAIN_PIXELS).cast::<u8>() as u32;
    unsafe { draw_floor_rgba_batch(pointer, w as u32, h as u32); }
    command_count
}

/// Renders static room inlays and floor specks in their original Canvas order.
/// Host opcodes: 1 = room border, 2 = room seam, 3 = random floor speck.
#[no_mangle]
pub extern "C" fn paint_map_details(count: u32, width: f64, height: f64, seed: u32) -> u32 {
    let rooms = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let count = (count as usize).min(MAX_POINTS);
    for index in 0..count {
        let room = unsafe { core::ptr::read(rooms.add(index)) };
        if room.w < 70.0 || room.h < 70.0 { continue; }
        unsafe { draw_map_command(1, 0, room.x + 9.0, room.y + 9.0, (room.w - 18.0).max(0.0), (room.h - 18.0).max(0.0), 2.0, 0.22); }
        let mut yy = room.y + 22.0;
        while yy < room.y + room.h - 12.0 {
            unsafe { draw_map_command(2, 1, room.x + 10.0, yy, room.x + (room.w - 10.0).min(58.0), yy, 1.0, 0.10); }
            yy += 44.0;
        }
    }
    let specks = ((width * height / 18_000.0) as u32).min(180);
    let mut state = seed;
    for _ in 0..specks {
        let x = floor_f64(random(&mut state) * (width - 12.0).max(1.0));
        let y = floor_f64(random(&mut state) * (height - 12.0).max(1.0));
        let color = if random(&mut state) < 0.5 { 2 } else { 3 };
        let w = 3.0 + random(&mut state) * 8.0;
        let h = 2.0 + random(&mut state) * 5.0;
        unsafe { draw_map_command(3, color, x, y, w, h, 0.0, 1.0); }
    }
    state
}

/// Emits the fixed-map base rectangle. Procedural maps keep their Rust floor painter.
#[no_mangle]
pub extern "C" fn paint_map_base(fixed_map: u32, width: f64, height: f64) {
    if fixed_map != 0 { unsafe { draw_map_command(17, 0, 0.0, 0.0, width, height, 0.0, 1.0); } }
}

/// Emits the soft overlay placed above rooms and decor, before map details.
#[no_mangle]
pub extern "C" fn paint_map_overlay(width: f64, height: f64) {
    unsafe { draw_map_command(18, 0, 0.0, 0.0, width, height, 0.0, 1.0); }
}

/// Composes static decor (including rugs) in its original order on the floor layer.
#[no_mangle]
pub extern "C" fn paint_map_decor(count: u32) {
    let decor = core::ptr::addr_of!(FURNITURE).cast::<Furniture>();
    for index in 0..(count as usize).min(MAX_POINTS) {
        let item = unsafe { core::ptr::read(decor.add(index)) };
        if item.kind == 1 {
            unsafe {
                draw_map_command(15, 0, item.x, item.y, item.w, item.h, 0.0, 1.0);
                draw_map_command(16, 1, item.x + 1.0, item.y + 1.0, item.w - 2.0, item.h - 2.0, 2.0, 1.0);
                draw_map_command(16, 2, item.x + 8.0, item.y + 8.0, item.w - 16.0, item.h - 16.0, 1.0, 1.0);
            }
        } else {
            unsafe { draw_map_command(15, item.variant, item.x, item.y, item.w, item.h, 0.0, 1.0); }
        }
    }
}

/// x, y, w, h, alpha records for intact breakables followed by temporary glass shards.
#[no_mangle]
pub extern "C" fn breakable_data_ptr() -> *mut u8 {
    core::ptr::addr_of_mut!(BREAKABLE_DATA).cast::<u8>()
}

/// Emits breakable panes and their temporary shard paths without mutating gameplay timers.
#[no_mangle]
pub extern "C" fn draw_breakables(breakable_count: u32, shard_count: u32) {
    let breakable_count = (breakable_count as usize).min(MAX_POINTS);
    let shard_count = (shard_count as usize).min(MAX_POINTS - breakable_count);
    let data = core::ptr::addr_of!(BREAKABLE_DATA).cast::<f64>();
    for index in 0..breakable_count {
        let offset = index * 5;
        let x = unsafe { core::ptr::read(data.add(offset)) };
        let y = unsafe { core::ptr::read(data.add(offset + 1)) };
        let w = unsafe { core::ptr::read(data.add(offset + 2)) };
        let h = unsafe { core::ptr::read(data.add(offset + 3)) };
        unsafe {
            draw_map_command(19, 0, x, y, w, h, 0.0, 1.0);
            draw_map_command(20, 0, x + 1.0, y + 1.0, w - 2.0, h - 2.0, 2.0, 1.0);
            draw_map_command(21, 0, x + 6.0, y + h - 6.0, x + w - 6.0, y + 6.0, 2.0, 1.0);
        }
    }
    for index in 0..shard_count {
        let offset = (breakable_count + index) * 5;
        let x = unsafe { core::ptr::read(data.add(offset)) };
        let y = unsafe { core::ptr::read(data.add(offset + 1)) };
        let w = unsafe { core::ptr::read(data.add(offset + 2)) };
        let h = unsafe { core::ptr::read(data.add(offset + 3)) };
        let alpha = unsafe { core::ptr::read(data.add(offset + 4)) };
        unsafe { draw_map_command(22, 0, x, y, w, h, 1.5, alpha); }
    }
}

/// Draws wall/furniture shadows before furniture, preserving paintMap order.
#[no_mangle]
pub extern "C" fn paint_map_shadows(wall_count: u32, furniture_count: u32) {
    let walls = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let wall_count = (wall_count as usize).min(MAX_POINTS);
    let furniture_count = (furniture_count as usize).min(MAX_POINTS - wall_count);
    for index in 0..wall_count + furniture_count {
        let rect = unsafe { core::ptr::read(walls.add(index)) };
        let (dx, dy) = if index < wall_count { (6.0, 8.0) } else { (4.0, 6.0) };
        unsafe { draw_map_command(4, 0, rect.x + dx, rect.y + dy, rect.w, rect.h, 0.0, 1.0); }
    }
}

/// Draws wall faces and post details after the JS furniture painters.
#[no_mangle]
pub extern "C" fn paint_map_structure(wall_count: u32, post_count: u32) {
    let geometry = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let wall_count = (wall_count as usize).min(MAX_POINTS);
    let post_count = (post_count as usize).min(MAX_POINTS - wall_count);
    for index in 0..wall_count {
        let wall = unsafe { core::ptr::read(geometry.add(index)) };
        unsafe {
            draw_map_command(5, 0, wall.x, wall.y, wall.w, wall.h, 0.0, 1.0);
            draw_map_command(6, 0, wall.x, wall.y, wall.w, 4.0_f64.min(wall.h), 0.0, 1.0);
            draw_map_command(7, 0, wall.x, wall.y + (wall.h - 4.0).max(0.0), wall.w, 4.0_f64.min(wall.h), 0.0, 1.0);
            draw_map_command(8, 0, wall.x, wall.y, 4.0_f64.min(wall.w), wall.h, 0.0, 1.0);
            draw_map_command(9, 0, wall.x + (wall.w - 4.0).max(0.0), wall.y, 4.0_f64.min(wall.w), wall.h, 0.0, 1.0);
            draw_map_command(10, 0, wall.x + 0.5, wall.y + 0.5, wall.w - 1.0, wall.h - 1.0, 1.0, 1.0);
        }
    }
    for index in 0..post_count {
        let post = unsafe { core::ptr::read(geometry.add(wall_count + index)) };
        unsafe {
            draw_map_command(11, 0, post.x - 10.0, post.y - 10.0, 20.0, 20.0, 0.0, 1.0);
            draw_map_command(12, 0, post.x - 7.0, post.y - 7.0, 14.0, 14.0, 0.0, 1.0);
            draw_map_command(13, 0, post.x - 5.0, post.y - 5.0, 10.0, 10.0, 0.0, 1.0);
            draw_map_command(14, 0, post.x - 7.0, post.y - 7.0, 14.0, 14.0, 2.0, 1.0);
        }
    }
}

#[inline]
fn furniture_command(op: u32, color: u32, a: f64, b: f64, c: f64, d: f64, e: f64, f: f64) {
    unsafe {
        let offset = FURN_COMMAND_COUNT as usize * 8;
        let commands = core::ptr::addr_of_mut!(FURN_COMMANDS).cast::<f64>();
        core::ptr::write(commands.add(offset), op as f64);
        core::ptr::write(commands.add(offset + 1), color as f64);
        core::ptr::write(commands.add(offset + 2), a);
        core::ptr::write(commands.add(offset + 3), b);
        core::ptr::write(commands.add(offset + 4), c);
        core::ptr::write(commands.add(offset + 5), d);
        core::ptr::write(commands.add(offset + 6), e);
        core::ptr::write(commands.add(offset + 7), f);
        FURN_COMMAND_COUNT += 1;
        if FURN_COMMAND_COUNT as usize == FURN_BATCH_SIZE { flush_furniture_commands(); }
    }
}

fn flush_furniture_commands() {
    unsafe {
        if FURN_COMMAND_COUNT == 0 { return; }
        let pointer = core::ptr::addr_of!(FURN_COMMANDS).cast::<u8>() as u32;
        let count = FURN_COMMAND_COUNT;
        FURN_COMMAND_COUNT = 0;
        draw_furniture_batch(pointer, count);
    }
}

#[inline] fn ffill(color: u32) { furniture_command(4, color, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn fstroke(color: u32) { furniture_command(5, color, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn fline(width: f64) { furniture_command(3, 0, width, 0.0, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn frect(x: f64, y: f64, w: f64, h: f64) { furniture_command(6, 0, x, y, w, h, 0.0, 0.0); }
#[inline] fn fsrect(x: f64, y: f64, w: f64, h: f64) { furniture_command(7, 0, x, y, w, h, 0.0, 0.0); }
#[inline] fn fbegin() { furniture_command(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn fmove(x: f64, y: f64) { furniture_command(9, 0, x, y, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn fline_to(x: f64, y: f64) { furniture_command(10, 0, x, y, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn farc(x: f64, y: f64, r: f64) { furniture_command(11, 0, x, y, r, 0.0, 6.28, 0.0); }
#[inline] fn fellipse(x: f64, y: f64, rx: f64, ry: f64) { furniture_command(12, 0, x, y, rx, ry, 0.0, 6.28); }
#[inline] fn ffill_path() { furniture_command(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); }
#[inline] fn fstroke_path() { furniture_command(14, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); }

fn furniture_box(x: f64, y: f64, w: f64, h: f64, fill: u32, line: u32) {
    ffill(fill); frect(x, y, w, h); fstroke(line); fsrect(x + 1.0, y + 1.0, w - 2.0, h - 2.0);
}

/// Selects and orders repeated wall/furniture textures and open-door decals.
/// The host owns decoded image handles and applies the texture Canvas operations.
#[no_mangle]
pub extern "C" fn paint_map_textures(
    solid_count: u32,
    opening_count: u32,
    wall_texture_ready: u32,
    furniture_texture_ready: u32,
    door_texture_ready: u32,
    across: f64,
) {
    let solids = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let openings = core::ptr::addr_of!(BREAKABLE_DATA).cast::<f64>();
    let solid_count = (solid_count as usize).min(MAX_POINTS);
    let opening_count = (opening_count as usize).min(MAX_POINTS);
    unsafe { FURN_COMMAND_COUNT = 0; }
    for index in 0..solid_count {
        let rect = unsafe { core::ptr::read(solids.add(index)) };
        if rect.w.min(rect.h) <= 26.0 && wall_texture_ready != 0 {
            furniture_command(31, 0, 0.0, rect.x, rect.y, rect.w, rect.h, 0.0);
        } else if furniture_texture_ready != 0 {
            furniture_command(31, 1, (index % 6) as f64, rect.x, rect.y, rect.w, rect.h, 0.0);
        }
    }
    if door_texture_ready != 0 {
        for index in 0..opening_count {
            let offset = index * 5;
            let x = unsafe { core::ptr::read(openings.add(offset)) };
            let y = unsafe { core::ptr::read(openings.add(offset + 1)) };
            let w = unsafe { core::ptr::read(openings.add(offset + 2)) };
            let h = unsafe { core::ptr::read(openings.add(offset + 3)) };
            let along = w.min(h);
            if along > 110.0 || along < 20.0 { continue; }
            furniture_command(32, 0, x + w / 2.0, y + h / 2.0, along, across, if w > h { 1.0 } else { 0.0 }, 0.0);
        }
    }
    flush_furniture_commands();
}

/// Returns the fixed RGBA input table for wall, six furniture and open-door sprites.
#[no_mangle]
pub extern "C" fn map_texture_pixels_ptr() -> u32 { core::ptr::addr_of_mut!(MAP_TEXTURE_PIXELS).cast::<u8>() as u32 }

/// Returns the reusable RGBA input for one of the small map texture spritesheets.
#[no_mangle]
pub extern "C" fn map_texture_sheet_pixels_ptr() -> u32 { core::ptr::addr_of_mut!(MAP_TEXTURE_SHEET_PIXELS).cast::<u8>() as u32 }

/// Crops one 24x24 sprite from the host-provided map sheet into the Rust texture table.
#[no_mangle]
pub extern "C" fn copy_map_texture_sprite(slot: u32, sheet_width: u32, sheet_height: u32, source_x: u32, source_y: u32) -> u32 {
    if slot >= 8 || sheet_width == 0 || sheet_width > 144 || sheet_height == 0 || sheet_height > 24
        || source_x.checked_add(24).map_or(true, |right| right > sheet_width)
        || source_y.checked_add(24).map_or(true, |bottom| bottom > sheet_height) { return 0; }
    let source = core::ptr::addr_of!(MAP_TEXTURE_SHEET_PIXELS).cast::<u8>();
    let destination = core::ptr::addr_of_mut!(MAP_TEXTURE_PIXELS).cast::<u8>();
    for y in 0..24usize {
        for x in 0..24usize {
            let from = ((source_y as usize + y) * sheet_width as usize + source_x as usize + x) * 4;
            let to = (slot as usize * 24 * 24 + y * 24 + x) * 4;
            for channel in 0..4usize {
                unsafe { core::ptr::write(destination.add(to + channel), core::ptr::read(source.add(from + channel))); }
            }
        }
    }
    1
}

#[inline]
fn map_texture_blend_pixel(output: *mut u8, offset: usize, texture: *const u8, source_offset: usize, coverage: f64) {
    if coverage <= 0.0 { return; }
    let source_alpha_raw = unsafe { core::ptr::read(texture.add(source_offset + 3)) as f64 };
    let source_alpha = (source_alpha_raw * coverage + 0.5) as u32;
    if source_alpha == 0 { return; }
    let dest_alpha = unsafe { core::ptr::read(output.add(offset + 3)) as u32 };
    if dest_alpha == 0 {
        for channel in 0..3 {
            unsafe { core::ptr::write(output.add(offset + channel), core::ptr::read(texture.add(source_offset + channel))); }
        }
        unsafe { core::ptr::write(output.add(offset + 3), source_alpha.min(255) as u8); }
        return;
    }
    let inverse = 255 - source_alpha;
    let out_alpha = source_alpha + dest_alpha * inverse / 255;
    for channel in 0..3 {
        let source_color = unsafe { core::ptr::read(texture.add(source_offset + channel)) as u32 };
        let source_premultiplied = (source_color * source_alpha + 127) / 255;
        let dest_color = unsafe { core::ptr::read(output.add(offset + channel)) as u32 };
        let out_premultiplied = source_premultiplied + dest_color * inverse / 255;
        unsafe { core::ptr::write(output.add(offset + channel), out_premultiplied.min(255) as u8); }
    }
    unsafe { core::ptr::write(output.add(offset + 3), out_alpha.min(255) as u8); }
}

#[inline]
fn raster_map_texture_pattern(output: *mut u8, width: usize, height: usize, sprite: *const u8, rect: Rect) {
    let left = rect.x.max(0.0).min(width as f64);
    let top = rect.y.max(0.0).min(height as f64);
    let right = (rect.x + rect.w).max(0.0).min(width as f64);
    let bottom = (rect.y + rect.h).max(0.0).min(height as f64);
    if right <= left || bottom <= top { return; }
    for y in floor_f64(top) as usize..ceil_f64(bottom) as usize {
        let coverage_y = (bottom.min(y as f64 + 1.0) - top.max(y as f64)).max(0.0);
        for x in floor_f64(left) as usize..ceil_f64(right) as usize {
            let coverage_x = (right.min(x as f64 + 1.0) - left.max(x as f64)).max(0.0);
            let sample_x_raw = floor_f64((x as f64 + 0.5) % 24.0);
            let sample_y_raw = floor_f64((y as f64 + 0.5) % 24.0);
            let sample_x = if sample_x_raw < 0.0 { (sample_x_raw + 24.0) as usize } else { sample_x_raw as usize };
            let sample_y = if sample_y_raw < 0.0 { (sample_y_raw + 24.0) as usize } else { sample_y_raw as usize };
            map_texture_blend_pixel(output, (y * width + x) * 4, sprite, (sample_y * 24 + sample_x) * 4, coverage_x * coverage_y);
        }
    }
}

#[inline]
fn raster_map_texture_door(output: *mut u8, width: usize, height: usize, sprite: *const u8, center_x: f64, center_y: f64, along: f64, across: f64, rotated: bool) {
    if !along.is_finite() || !across.is_finite() || along <= 0.0 || across <= 0.0 { return; }
    let (rect_width, rect_height) = if rotated { (across, along) } else { (along, across) };
    let left = (center_x - rect_width / 2.0).max(0.0).min(width as f64);
    let top = (center_y - rect_height / 2.0).max(0.0).min(height as f64);
    let right = (center_x + rect_width / 2.0).max(0.0).min(width as f64);
    let bottom = (center_y + rect_height / 2.0).max(0.0).min(height as f64);
    if right <= left || bottom <= top { return; }
    for y in floor_f64(top) as usize..ceil_f64(bottom) as usize {
        let sample_y = y as f64 + 0.5;
        if sample_y < top || sample_y >= bottom { continue; }
        for x in floor_f64(left) as usize..ceil_f64(right) as usize {
            let sample_x = x as f64 + 0.5;
            if sample_x < left || sample_x >= right { continue; }
            let world_x = x as f64 + 0.5 - center_x;
            let world_y = y as f64 + 0.5 - center_y;
            let (local_x, local_y) = if rotated { (world_y, -world_x) } else { (world_x, world_y) };
            let source_x = floor_f64(((local_x / along + 0.5) * 24.0).max(0.0).min(23.999)) as usize;
            // Match the source-row selection measured against Canvas nearest-neighbor sampling.
            let source_y = (floor_f64(((local_y / across + 0.5) * 24.0).max(0.0).min(23.999)) as usize).saturating_sub(1);
            map_texture_blend_pixel(output, (y * width + x) * 4, sprite, (source_y * 24 + source_x) * 4, 1.0);
        }
    }
}

/// Software-rasterizes repeated map sprites and door decals into the reusable RGBA buffer.
/// Returns the number of texture placements, or u32::MAX for the Canvas command fallback.
#[no_mangle]
pub extern "C" fn paint_map_textures_rgba(
    solid_count: u32, opening_count: u32, wall_texture_ready: u32, furniture_texture_ready: u32,
    door_texture_ready: u32, across: f64, width: f64, height: f64,
) -> u32 {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > FLOOR_GRAIN_MAX_WIDTH as f64 || height > FLOOR_GRAIN_MAX_HEIGHT as f64
        || width != floor_f64(width) || height != floor_f64(height) || !across.is_finite() || across <= 0.0
        || solid_count as usize > MAX_POINTS || opening_count as usize > MAX_POINTS
        || wall_texture_ready > 1 || furniture_texture_ready > 1 || door_texture_ready > 1 { return u32::MAX; }
    let w = width as usize;
    let h = height as usize;
    let solids = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let openings = core::ptr::addr_of!(BREAKABLE_DATA).cast::<f64>();
    for index in 0..solid_count as usize {
        let rect = unsafe { core::ptr::read(solids.add(index)) };
        if !rect.x.is_finite() || !rect.y.is_finite() || !rect.w.is_finite() || !rect.h.is_finite() || rect.w < 0.0 || rect.h < 0.0 { return u32::MAX; }
    }
    for index in 0..opening_count as usize {
        let offset = index * 5;
        for item in 0..4 {
            if !unsafe { core::ptr::read(openings.add(offset + item)) }.is_finite() { return u32::MAX; }
        }
    }
    let output = core::ptr::addr_of_mut!(FLOOR_GRAIN_PIXELS).cast::<u8>();
    let textures = core::ptr::addr_of!(MAP_TEXTURE_PIXELS).cast::<u8>();
    for pixel in 0..(w * h * 4) { unsafe { core::ptr::write(output.add(pixel), 0); } }
    let mut placements = 0u32;
    for index in 0..solid_count as usize {
        let rect = unsafe { core::ptr::read(solids.add(index)) };
        if rect.w.min(rect.h) <= 26.0 && wall_texture_ready != 0 {
            raster_map_texture_pattern(output, w, h, textures, rect);
            placements += 1;
        } else if furniture_texture_ready != 0 {
            let sprite = unsafe { textures.add(((index % 6 + 1) * 24 * 24 * 4) as usize) };
            raster_map_texture_pattern(output, w, h, sprite, rect);
            placements += 1;
        }
    }
    if door_texture_ready != 0 {
        let door_sprite = unsafe { textures.add((7 * 24 * 24 * 4) as usize) };
        for index in 0..opening_count as usize {
            let offset = index * 5;
            let x = unsafe { core::ptr::read(openings.add(offset)) };
            let y = unsafe { core::ptr::read(openings.add(offset + 1)) };
            let rect_width = unsafe { core::ptr::read(openings.add(offset + 2)) };
            let rect_height = unsafe { core::ptr::read(openings.add(offset + 3)) };
            let along = rect_width.min(rect_height);
            if along > 110.0 || along < 20.0 { continue; }
            raster_map_texture_door(output, w, h, door_sprite, x + rect_width / 2.0, y + rect_height / 2.0, along, across, rect_width > rect_height);
            placements += 1;
        }
    }
    for pixel in 0..(w * h) {
        let offset = pixel * 4;
        let alpha = unsafe { core::ptr::read(output.add(offset + 3)) as u32 };
        if alpha == 0 { continue; }
        for channel in 0..3 {
            let premultiplied = unsafe { core::ptr::read(output.add(offset + channel)) as u32 };
            unsafe { core::ptr::write(output.add(offset + channel), ((premultiplied * 255 + alpha / 2) / alpha).min(255) as u8); }
        }
    }
    unsafe { draw_floor_rgba_batch(core::ptr::addr_of!(FLOOR_GRAIN_PIXELS).cast::<u8>() as u32, w as u32, h as u32); }
    placements
}

/// Pixel input for the 72x24 floor tile asset, copied once from the decoded browser image.
#[no_mangle]
pub extern "C" fn floor_tile_pixels_ptr() -> *mut u8 { core::ptr::addr_of_mut!(FLOOR_TILE_PIXELS).cast::<u8>() }

/// Composites the original repeating FTILES pattern into the existing Rust grain layer.
/// Returns the number of non-hall rooms, or u32::MAX for invalid geometry/dimensions.
#[no_mangle]
pub extern "C" fn paint_floor_tiles_rgba(room_count: u32, hall_index: i32, tile_index: i32, width: f64, height: f64) -> u32 {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > FLOOR_GRAIN_MAX_WIDTH as f64 || height > FLOOR_GRAIN_MAX_HEIGHT as f64
        || width != floor_f64(width) || height != floor_f64(height) || !(0..=2).contains(&tile_index)
        || room_count as usize > MAX_POINTS { return u32::MAX; }
    let w = width as usize;
    let h = height as usize;
    let rooms = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    let output = core::ptr::addr_of_mut!(FLOOR_GRAIN_PIXELS).cast::<u8>();
    let texture = core::ptr::addr_of!(FLOOR_TILE_PIXELS).cast::<u8>();
    for index in 0..(room_count as usize) {
        if hall_index >= 0 && index == hall_index as usize { continue; }
        let room = unsafe { core::ptr::read(rooms.add(index)) };
        if !room.x.is_finite() || !room.y.is_finite() || !room.w.is_finite() || !room.h.is_finite()
            || room.x != floor_f64(room.x) || room.y != floor_f64(room.y)
            || room.w != floor_f64(room.w) || room.h != floor_f64(room.h) || room.w <= 0.0 || room.h <= 0.0 { return u32::MAX; }
    }
    // The previous RGBA upload is unpremultiplied; Canvas source-over composites premultiplied bytes.
    for pixel in 0..(w * h) {
        let offset = pixel * 4;
        let alpha = unsafe { core::ptr::read(output.add(offset + 3)) as u32 };
        for channel in 0..3 {
            let color = unsafe { core::ptr::read(output.add(offset + channel)) as u32 };
            unsafe { core::ptr::write(output.add(offset + channel), ((color * alpha + 127) / 255) as u8); }
        }
    }
    let mut drawn_rooms = 0u32;
    for index in 0..(room_count as usize) {
        if hall_index >= 0 && index == hall_index as usize { continue; }
        let room = unsafe { core::ptr::read(rooms.add(index)) };
        let left = (room.x as i32).max(0) as usize;
        let top = (room.y as i32).max(0) as usize;
        let right = ((room.x + room.w) as i32).max(0).min(width as i32) as usize;
        let bottom = ((room.y + room.h) as i32).max(0).min(height as i32) as usize;
        for y in top..bottom {
            for x in left..right {
                let source_x = (x + tile_index as usize * 24) % 72;
                let source_y = y % 24;
                let source_offset = (source_y * 72 + source_x) * 4;
                let output_offset = (y * w + x) * 4;
                let texture_alpha = unsafe { core::ptr::read(texture.add(source_offset + 3)) as u32 };
                let source_alpha = (texture_alpha * 45 + 50) / 100;
                let inverse_alpha = 255 - source_alpha;
                let dest_alpha = unsafe { core::ptr::read(output.add(output_offset + 3)) as u32 };
                let out_alpha = source_alpha + dest_alpha * inverse_alpha / 255;
                for channel in 0..3 {
                    let source_color = unsafe { core::ptr::read(texture.add(source_offset + channel)) as u32 };
                    let source_premultiplied = (source_color * source_alpha + 127) / 255;
                    let dest_color = unsafe { core::ptr::read(output.add(output_offset + channel)) as u32 };
                    let out_color = source_premultiplied + dest_color * inverse_alpha / 255;
                    unsafe { core::ptr::write(output.add(output_offset + channel), out_color.min(255) as u8); }
                }
                unsafe { core::ptr::write(output.add(output_offset + 3), out_alpha.min(255) as u8); }
            }
        }
        drawn_rooms += 1;
    }
    for pixel in 0..(w * h) {
        let offset = pixel * 4;
        let alpha = unsafe { core::ptr::read(output.add(offset + 3)) as u32 };
        if alpha == 0 { continue; }
        for channel in 0..3 {
            let premultiplied = unsafe { core::ptr::read(output.add(offset + channel)) as u32 };
            unsafe { core::ptr::write(output.add(offset + channel), ((premultiplied * 255 + alpha / 2) / alpha).min(255) as u8); }
        }
    }
    let pointer = core::ptr::addr_of!(FLOOR_GRAIN_PIXELS).cast::<u8>() as u32;
    unsafe { draw_floor_rgba_batch(pointer, w as u32, h as u32); }
    drawn_rooms
}

/// Legacy command path retained for the no-WASM fallback and ABI compatibility tests.
/// It selects floor-tile overlay rectangles in room order, excluding the corridor.
#[no_mangle]
pub extern "C" fn paint_floor_tiles(room_count: u32, hall_index: i32, tile_index: i32) {
    let rooms = core::ptr::addr_of!(ROOMS).cast::<Rect>();
    for index in 0..(room_count as usize).min(MAX_POINTS) {
        if hall_index >= 0 && index == hall_index as usize { continue; }
        let room = unsafe { core::ptr::read(rooms.add(index)) };
        let shift_x = -(tile_index as f64) * 24.0;
        furniture_command(33, 0, room.x, room.y, room.w, room.h, shift_x, 0.0);
    }
    flush_furniture_commands();
}

fn draw_furniture_item(f: Furniture) {
    let x = f.x; let y = f.y; let w = f.w; let h = f.h; let hz = w >= h;
    furniture_command(1, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    fline(2.0);
    match f.kind {
        1 => { // bed
            furniture_box(x, y, w, h, 0, 1);
            ffill(2); if hz { frect(x + 4.0, y + 5.0, 14.0, h - 10.0); } else { frect(x + 5.0, y + 4.0, w - 10.0, 14.0); }
            ffill(3 + f.variant.min(2)); if hz { frect(x + 24.0, y + 4.0, w - 28.0, h - 8.0); } else { frect(x + 4.0, y + 24.0, w - 8.0, h - 28.0); }
        }
        2 => { // banco
            furniture_box(x, y, w, h, 6, 7); ffill(8); frect(x + 6.0, y + 6.0, w - 12.0, h - 12.0); ffill(9);
            if hz { frect(x + 4.0, y + h / 2.0 - 3.0, w - 8.0, 6.0); } else { frect(x + w / 2.0 - 3.0, y + 4.0, 6.0, h - 8.0); }
        }
        3 => { furniture_box(x, y, w, h, 10, 11); ffill(12); frect(x + 5.0, y + 5.0, w - 10.0, h - 10.0); }
        4 => { // balcao
            furniture_box(x, y, w, h, 13, 14);
            let length = if hz { w } else { h }; let mut i = 4.0; let mut k = 0u32;
            while i + 30.0 <= length {
                let px = if hz { x + i } else { x + 5.0 };
                let py = if hz { y + 5.0 } else { y + i };
                let size = if hz { 30.0_f64.min(h - 10.0) } else { 30.0_f64.min(w - 10.0) };
                if k % 2 == 0 {
                    ffill(15); frect(px, py, size, size); ffill(16);
                    for (ax, ay) in [(0.28, 0.28), (0.72, 0.28), (0.28, 0.72), (0.72, 0.72)] { fbegin(); farc(px + size * ax, py + size * ay, 3.0); ffill_path(); }
                } else { ffill(17); frect(px, py, size, size); ffill(18); frect(px + 4.0, py + 4.0, size - 8.0, size - 8.0); }
                i += 38.0; k += 1;
            }
        }
        5 => { // vaso
            ffill(19); frect(x, y, w, h); fstroke(14); fsrect(x + 1.0, y + 1.0, w - 2.0, h - 2.0); ffill(20); fbegin(); furniture_command(12, 0, x + w / 2.0, y + h / 2.0 + 2.0, w / 2.0 - 4.0, h / 2.0 - 5.0, 0.0, 6.28); ffill_path();
        }
        6 => { // pia
            furniture_box(x, y, w, h, 19, 14); ffill(21); fbegin(); farc(x + w / 2.0, y + h / 2.0, w.min(h) / 2.0 - 4.0); ffill_path();
        }
        7 => { // banheira
            furniture_box(x, y, w, h, 22, 14); ffill(23); frect(x + 6.0, y + 6.0, w - 12.0, h - 12.0); ffill(18); fbegin();
            if hz { farc(x + 12.0, y + h / 2.0, 3.0); } else { farc(x + w / 2.0, y + 12.0, 3.0); } ffill_path();
        }
        8 => { // planta
            ffill(24);
            for i in 0..6 {
                let (cx, sy) = match i { 0 => (1.0, 0.0), 1 => (0.5403023058681398, 0.8414709848078965), 2 => (-0.4161468365471424, 0.9092974268256817), 3 => (-0.9899924966004454, 0.1411200080598672), 4 => (-0.6536436208636119, -0.7568024953079282), _ => (0.28366218546322625, -0.9589242746631385) };
                fbegin(); farc(x + w / 2.0 + cx * 7.0, y + h / 2.0 + sy * 7.0, 8.0); ffill_path();
            }
            ffill(25); fbegin(); farc(x + w / 2.0, y + h / 2.0, 7.0); ffill_path();
        }
        9 => { // sofa
            furniture_box(x, y, w, h, 26, 27); ffill(28);
            if hz { frect(x + 4.0, y + 4.0, w - 8.0, h * 0.55); } else { frect(x + 4.0, y + 4.0, w * 0.55, h - 8.0); }
            fstroke(27); fbegin();
            if hz { let mut i = x + 30.0; while i < x + w - 8.0 { fmove(i, y + 4.0); fline_to(i, y + h - 4.0); i += 30.0; } }
            else { let mut i = y + 30.0; while i < y + h - 8.0 { fmove(x + 4.0, i); fline_to(x + w - 4.0, i); i += 30.0; } }
            fstroke_path();
        }
        10 => { // mesaR
            ffill(29);
            for (ax, ay) in [(0.0, -1.0), (0.0, 1.0), (-1.0, 0.0), (1.0, 0.0)] { fbegin(); farc(x + w / 2.0 + ax * (w / 2.0 + 2.0), y + h / 2.0 + ay * (h / 2.0 + 2.0), 7.0); ffill_path(); }
            ffill(30); fbegin(); fellipse(x + w / 2.0, y + h / 2.0, w / 2.0, h / 2.0); ffill_path(); fstroke(31); fstroke_path();
        }
        11 => { // felt
            furniture_box(x, y, w, h, 32, 33); fstroke(33); fline(4.0); fsrect(x + 2.0, y + 2.0, w - 4.0, h - 4.0); fline(2.0); ffill(34); frect(x + w / 2.0 - 6.0, y + h / 2.0 - 4.0, 12.0, 8.0); ffill(35); frect(x + w / 4.0, y + h / 2.0 - 3.0, 6.0, 6.0);
        }
        12 => { // arcade
            furniture_box(x, y, w, h, 36, 37); ffill(38); if hz { frect(x + 4.0, y + 5.0, w * 0.45, h - 10.0); } else { frect(x + 5.0, y + 4.0, w - 10.0, h * 0.45); }
            ffill(39); if hz { frect(x + w * 0.6, y + h / 2.0 - 3.0, 8.0, 6.0); } else { frect(x + w / 2.0 - 3.0, y + h * 0.65, 6.0, 8.0); }
        }
        13 => { // sinuca
            furniture_box(x, y, w, h, 40, 41); ffill(42); frect(x + 5.0, y + 5.0, w - 10.0, h - 10.0); ffill(34); fbegin(); farc(x + w / 2.0, y + h / 2.0, 3.0); ffill_path(); ffill(43);
            for (cx, cy) in [(x+4.0,y+4.0), (x+w-4.0,y+4.0), (x+4.0,y+h-4.0), (x+w-4.0,y+h-4.0)] { fbegin(); farc(cx, cy, 3.0); ffill_path(); }
        }
        14 => { // poltrona
            furniture_box(x, y, w, h, 44, 45); ffill(46); if hz { frect(x + 4.0, y + 4.0, w - 8.0, h * 0.35); } else { frect(x + 4.0, y + 4.0, w * 0.35, h - 8.0); }
        }
        15 => { // palco
            furniture_box(x, y, w, h, 47, 48); ffill(49); frect(x + 8.0, y + 8.0, w - 16.0, h - 16.0); fstroke(50); fbegin(); fmove(x + 8.0,y + 8.0); fline_to(x + w - 8.0,y + h - 8.0); fmove(x + w - 8.0,y + 8.0); fline_to(x + 8.0,y + h - 8.0); fstroke_path(); ffill(51);
            for (ax, ay) in [(0.45,0.45),(0.55,0.4),(0.5,0.55)] { fbegin(); farc(x + w * ax, y + h * ay, w.min(h) * 0.07); ffill_path(); }
        }
        16 => { // poco
            ffill(52); frect(x,y,w,h); ffill(53); frect(x+4.0,y+4.0,w-8.0,h-8.0); ffill(54); frect(x+4.0,y+4.0,w-8.0,(h-8.0)/3.0); fstroke(55); fline(3.0); fsrect(x+1.0,y+1.0,w-2.0,h-2.0);
        }
        17 => { // caixa
            furniture_box(x,y,w,h,56,57); fbegin(); fmove(x+3.0,y+3.0); fline_to(x+w-3.0,y+h-3.0); fmove(x+w-3.0,y+3.0); fline_to(x+3.0,y+h-3.0); fstroke(58); fstroke_path();
        }
        _ => { furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); return; }
    }
    furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
}

/// Generates all furniture primitives in stable floor order.
#[no_mangle]
pub extern "C" fn draw_furniture(count: u32) {
    unsafe { FURN_COMMAND_COUNT = 0; }
    let furniture = core::ptr::addr_of!(FURNITURE).cast::<Furniture>();
    for index in 0..(count as usize).min(MAX_POINTS) {
        draw_furniture_item(unsafe { core::ptr::read(furniture.add(index)) });
    }
    flush_furniture_commands();
}

fn finish_weapon_icon(id: u32) {
    furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    fline(1.0); furniture_command(17, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    fstroke(98); fbegin(); fmove(4.0, 3.0); fline_to(4.0, -3.0); fline_to(24.0, -4.0); fstroke_path();
    fstroke(99); fbegin(); fmove(7.0, -3.0); fline_to(if id == 5 || id == 17 { 54.0 } else { 31.0 }, -3.0); fstroke_path();
    ffill(100);
    if id == 6 || id == 7 || id == 12 || id == 13 { frect(15.0, 5.0, 1.0, 5.0); frect(18.0, 5.0, 1.0, 5.0); }
    if id == 3 || id == 8 || id == 16 || id == 18 { frect(12.0, -1.0, 1.0, 2.0); frect(16.0, -1.0, 1.0, 2.0); }
    if id == 7 || id == 13 {
        fstroke(101); fbegin(); farc(12.0, 0.0, 3.0); fstroke_path();
    }
    if id == 4 || id == 5 || id == 14 || id == 15 || id == 16 || id == 17 || id == 18 {
        let cx = if id == 15 { 40.0 } else { 48.0 };
        ffill(9); fbegin(); farc(cx, 0.0, 2.2); ffill_path();
        fstroke(102); fbegin(); farc(cx, 0.0, 1.2); fstroke_path();
    }
    furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
}

fn draw_weapon_icon(id: u32) {
    if id == 0 { return; }
    furniture_command(15, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    match id {
        1 => { ffill(59); frect(5.0,-2.0,39.0,5.0); ffill(60); frect(35.0,-4.0,9.0,8.0); ffill(61); frect(7.0,-2.0,7.0,5.0); }
        2 => { ffill(62); fbegin(); fmove(9.0,-3.0); fline_to(35.0,0.0); fline_to(9.0,3.0); fline_to(20.0,0.0); ffill_path(); ffill(63); frect(2.0,-2.0,9.0,4.0); ffill(51); frect(9.0,-4.0,2.0,8.0); }
        3 => { ffill(64); frect(4.0,-4.0,29.0,7.0); ffill(65); frect(10.0,-5.0,11.0,2.0); ffill(66); frect(13.0,3.0,6.0,11.0); ffill(9); frect(29.0,-2.0,11.0,3.0); }
        4 => { ffill(67); frect(3.0,-4.0,17.0,8.0); ffill(68); frect(6.0,3.0,12.0,5.0); ffill(69); frect(17.0,-2.0,32.0,4.0); ffill(70); frect(43.0,-3.0,8.0,6.0); }
        5 => { ffill(71); frect(3.0,-3.0,18.0,6.0); ffill(72); frect(5.0,3.0,15.0,4.0); ffill(73); frect(18.0,-2.0,43.0,4.0); ffill(74); frect(30.0,-6.0,13.0,3.0); frect(52.0,-3.0,10.0,3.0); }
        6 => { ffill(74); frect(4.0,-4.0,24.0,7.0); ffill(65); frect(7.0,-5.0,17.0,2.0); ffill(74); frect(13.0,3.0,7.0,10.0); ffill(38); frect(24.0,-2.0,5.0,2.0); }
        7 => { ffill(75); frect(6.0,-4.0,22.0,7.0); ffill(76); frect(11.0,3.0,7.0,9.0); ffill(77); frect(4.0,4.0,9.0,7.0); ffill(70); fbegin(); farc(12.0,0.0,4.0); ffill_path(); }
        8 => { ffill(64); frect(4.0,-5.0,24.0,9.0); ffill(78); frect(9.0,-7.0,13.0,2.0); ffill(9); frect(12.0,3.0,5.0,12.0); frect(25.0,-2.0,12.0,3.0); }
        9 => { ffill(79); frect(5.0,-3.0,42.0,6.0); ffill(80); frect(10.0,-4.0,5.0,8.0); ffill(65); frect(38.0,-4.0,9.0,8.0); }
        10 => { ffill(79); frect(5.0,-2.0,39.0,4.0); fbegin(); fmove(42.0,-2.0); fline_to(51.0,-8.0); fline_to(49.0,-1.0); fline_to(44.0,2.0); ffill_path(); }
        11 => { ffill(77); frect(5.0,-2.0,30.0,4.0); ffill(81); frect(30.0,-8.0,13.0,16.0); ffill(65); frect(33.0,-10.0,8.0,3.0); }
        12 => { ffill(15); frect(4.0,-3.0,22.0,6.0); ffill(38); frect(20.0,-1.0,6.0,2.0); ffill(82); frect(8.0,2.0,5.0,8.0); }
        13 => { ffill(83); frect(4.0,-3.0,26.0,6.0); ffill(77); frect(2.0,2.0,7.0,9.0); ffill(84); frect(12.0,-5.0,8.0,4.0); }
        14 => { ffill(85); frect(2.0,-3.0,14.0,6.0); ffill(86); frect(14.0,-2.0,30.0,4.0); ffill(91); frect(24.0,-4.0,10.0,8.0); }
        15 => { ffill(85); frect(2.0,-4.0,14.0,8.0); ffill(87); frect(14.0,-4.0,26.0,3.0); frect(14.0,1.0,26.0,3.0); }
        16 => { ffill(88); frect(2.0,-3.0,38.0,6.0); ffill(38); frect(30.0,-5.0,4.0,2.0); ffill(43); frect(14.0,2.0,6.0,9.0); }
        17 => { ffill(89); frect(2.0,-3.0,56.0,5.0); ffill(9); frect(14.0,-8.0,16.0,4.0); ffill(39); frect(28.0,-7.0,2.0,2.0); }
        18 => { ffill(90); frect(2.0,-4.0,40.0,8.0); ffill(91); frect(12.0,3.0,14.0,8.0); ffill(92); frect(38.0,-2.0,12.0,4.0); }
        19 => { ffill(93); fbegin(); fmove(10.0,-2.0); fline_to(52.0,-1.0); fline_to(54.0,1.0); fline_to(10.0,2.0); ffill_path(); ffill(39); frect(2.0,-2.0,9.0,4.0); ffill(51); frect(9.0,-4.0,2.0,8.0); }
        20 => { ffill(77); frect(4.0,-2.0,34.0,4.0); ffill(81); fbegin(); fmove(30.0,-3.0); fline_to(44.0,-12.0); fline_to(44.0,12.0); fline_to(30.0,3.0); ffill_path(); }
        21 => { ffill(94); frect(6.0,-3.0,16.0,6.0); frect(22.0,-1.5,12.0,3.0); ffill(95); frect(8.0,-2.0,5.0,2.0); }
        22 => { ffill(96); frect(4.0,-5.0,26.0,10.0); ffill(43); frect(30.0,-2.0,8.0,4.0); ffill(97); frect(12.0,-5.0,3.0,10.0); }
        _ => { ffill(9); frect(4.0,-3.0,20.0,6.0); }
    }
    finish_weapon_icon(id);
    if id == 23 { finish_weapon_icon(id); } // lanca used the original fallback icon and receives the new-weapon finish too.
    furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
}

#[no_mangle]
pub extern "C" fn draw_weapon(id: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    draw_weapon_icon(id);
    let count = unsafe { FURN_COMMAND_COUNT };
    flush_furniture_commands();
    count
}

/// Emits the transformed Canvas commands for non-sprite doors. Sprite doors stay
/// with their asset painter in JS, while geometry, orientation and outline state
/// are selected here and flushed to the host in one batch.
#[no_mangle]
pub extern "C" fn draw_doors(count: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    let doors = core::ptr::addr_of!(DOORS).cast::<Door>();
    for index in 0..(count as usize).min(MAX_POINTS) {
        let door = unsafe { core::ptr::read(doors.add(index)) };
        let vertical = door.vertical != 0;
        let px = if vertical { door.x + door.w / 2.0 } else { door.x };
        let py = if vertical { door.y } else { door.y + door.h / 2.0 };
        let (x, y, w, h) = if vertical { (-4.0, 0.0, 8.0, door.h) } else { (0.0, -4.0, door.w, 8.0) };
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, px, py, 0.0, 0.0, 0.0, 0.0);
        furniture_command(20, 0, door.angle, 0.0, 0.0, 0.0, 0.0, 0.0);
        if door.textured != 0 { furniture_command(21, 0, x, y, w, h, 0.0, 0.0); }
        else { ffill(103); frect(x, y, w, h); }
        fstroke(38); furniture_command(18, 0, 0.28, 0.0, 0.0, 0.0, 0.0, 0.0); fline(5.0);
        fsrect(x + 0.5, y + 0.5, w - 1.0, h - 1.0);
        furniture_command(18, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0); fline(1.5);
        fsrect(x + 0.5, y + 0.5, w - 1.0, h - 1.0);
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    let command_count = unsafe { FURN_COMMAND_COUNT };
    flush_furniture_commands();
    command_count
}

/// Selects and orders Neon door sprite transforms in one Rust batch. The host
/// retains image assets and performs Canvas rasterization after this returns.
#[no_mangle]
pub extern "C" fn draw_neon_doors(count: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    let doors = core::ptr::addr_of!(NEON_DOORS).cast::<NeonDoor>();
    let count = (count as usize).min(MAX_POINTS);
    for index in 0..count {
        let door = unsafe { core::ptr::read(doors.add(index)) };
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, door.px, door.py, 0.0, 0.0, 0.0, 0.0);
        furniture_command(20, 0, door.base_angle + door.swing_angle, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(34, door.sprite_index, -door.ox, -door.oy, 0.0, 0.0, 0.0, 0.0);
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    flush_furniture_commands();
    (count * 5) as u32
}

/// Emits the player's ground shadow and optional player-color aura into one
/// Canvas batch. Position and rotation remain on the host's transformed context.
#[no_mangle]
pub extern "C" fn draw_player_aura(is_p2: u32, shadows: u32, glow: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    append_player_aura(is_p2, shadows, glow);
    let command_count = unsafe { FURN_COMMAND_COUNT };
    flush_furniture_commands();
    command_count
}

#[inline]
fn append_player_aura(is_p2: u32, shadows: u32, glow: u32) {
    furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    ffill(if shadows != 0 { 104 } else { 105 });
    fbegin();
    if shadows != 0 { fellipse(2.0, 5.0, 13.0, 8.0); }
    else { fellipse(1.0, 3.0, 11.0, 9.0); }
    ffill_path();
    if glow != 0 {
        ffill(if is_p2 != 0 { 107 } else { 106 });
        fbegin(); fellipse(0.0, 0.0, 16.0, 16.0); ffill_path();
    }
    furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
}

/// Generates a complete ordered Canvas command batch for each live player.
/// JavaScript supplies current gameplay pose and asset handles; Rust owns the
/// visual composition, animation-cell selection, weapon/aura placement and tags.
#[no_mangle]
pub extern "C" fn draw_players(count: u32, sheet_ready: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    let players = core::ptr::addr_of!(PLAYER_DRAW_DATA).cast::<PlayerDrawData>();
    for index in 0..(count as usize).min(MAX_PLAYERS) {
        let player = unsafe { core::ptr::read(players.add(index)) };
        let is_p2 = player.flags & 1 != 0;
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(19, 0, player.x, player.y, 0.0, 0.0, 0.0, 0.0);
        furniture_command(20, 0, player.angle, 0.0, 0.0, 0.0, 0.0, 0.0);
        append_player_aura(is_p2 as u32, (player.flags >> 1) & 1, (player.flags >> 2) & 1);
        if player.weapon != 0 { draw_weapon_icon(player.weapon); }
        furniture_command(25, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        if sheet_ready != 0 {
            let frame = player_sheet_frame(player.state, player.animation, player.attack_remaining);
            furniture_command(26, 0, (frame & 0xff) as f64, ((frame >> 8) & 0xff) as f64, 0.0, 0.0, 0.0, 0.0);
            if player.flags & 8 != 0 {
                furniture_command(18, 0, 0.78, 0.0, 0.0, 0.0, 0.0, 0.0);
                furniture_command(28, (index * 2) as u32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                frect(-4.0, -2.0, 6.0, 7.0);
                furniture_command(28, (index * 2 + 1) as u32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                frect(1.0, -2.0, 2.0, 7.0);
                furniture_command(18, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            }
        } else {
            furniture_command(27, index as u32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        }
        furniture_command(20, 0, -player.angle, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(29, index as u32, 0.0, -18.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    let command_count = unsafe { FURN_COMMAND_COUNT };
    flush_furniture_commands();
    command_count
}

/// Draws the translucent player trails with the same fallback body() geometry.
#[no_mangle]
pub extern "C" fn ghost_input_ptr() -> *mut u8 { core::ptr::addr_of_mut!(GHOST_INPUT).cast::<u8>() }

#[no_mangle]
pub extern "C" fn draw_ghosts(count: u32, weapon: u32) -> u32 {
    unsafe { FURN_COMMAND_COUNT = 0; }
    let ghosts = core::ptr::addr_of!(GHOST_INPUT).cast::<f64>();
    for index in 0..(count as usize).min(MAX_GHOSTS) {
        let offset = index * 4;
        let (x, y, angle, alpha) = unsafe {
            (core::ptr::read(ghosts.add(offset)), core::ptr::read(ghosts.add(offset + 1)),
             core::ptr::read(ghosts.add(offset + 2)), core::ptr::read(ghosts.add(offset + 3)))
        };
        if !x.is_finite() || !y.is_finite() || !angle.is_finite() || !alpha.is_finite() || alpha <= 0.0 { continue; }
        furniture_command(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(18, 0, alpha, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(23, 10, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); furniture_command(12, 0, x + 3.0, y + 5.0, 12.0, 10.0, 0.0, 6.28); ffill_path();
        furniture_command(19, 0, x, y, 0.0, 0.0, 0.0, 0.0);
        furniture_command(20, 0, angle, 0.0, 0.0, 0.0, 0.0, 0.0);
        draw_weapon_icon(weapon);

        furniture_command(23, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(24, 2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        fline(1.5);
        fbegin(); furniture_command(12, 0, 3.0, -11.0, 4.5, 3.0, 0.25, 6.28); ffill_path(); fstroke_path();
        fbegin(); furniture_command(12, 0, 3.0, 11.0, 4.5, 3.0, -0.25, 6.28); ffill_path(); fstroke_path();

        furniture_command(23, 3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        furniture_command(18, 0, alpha * 0.25, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); fellipse(0.0, 0.0, 13.0, 18.0); ffill_path();
        furniture_command(18, 0, alpha, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); fellipse(0.0, 0.0, 9.0, 14.0); ffill_path();
        furniture_command(24, 2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); fline(2.0);
        fbegin(); fellipse(0.0, 0.0, 9.0, 14.0); fstroke_path();

        furniture_command(23, 6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); fellipse(-2.0, -4.0, 4.0, 6.0); ffill_path();
        furniture_command(23, 7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        frect(1.0, -14.0, 5.0, 3.0); frect(1.0, 11.0, 5.0, 3.0);
        furniture_command(23, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); farc(0.0, 0.0, 8.0); ffill_path();
        furniture_command(23, 8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        fbegin(); farc(-2.0, 0.0, 7.0); ffill_path();
        furniture_command(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    let commands = unsafe { FURN_COMMAND_COUNT };
    flush_furniture_commands();
    commands
}

#[no_mangle]
pub extern "C" fn player_draw_data_ptr() -> *mut u8 {
    core::ptr::addr_of_mut!(PLAYER_DRAW_DATA).cast::<u8>()
}

#[no_mangle]
pub extern "C" fn doors_ptr() -> *mut u8 { core::ptr::addr_of_mut!(DOORS).cast::<u8>() }
#[no_mangle]
pub extern "C" fn neon_doors_ptr() -> *mut u8 { core::ptr::addr_of_mut!(NEON_DOORS).cast::<u8>() }

#[inline]
fn player_round(value: f64) -> i32 { floor_f64(value + 0.5) as i32 }

/// Selects the player's existing spritesheet cell without changing animation timing.
/// Returns column in bits 0..7 and row in bits 8..15; state: 0 idle, 1 walk,
/// 2 run, 3 attack. `animation` is the host's accumulated radians.
#[no_mangle]
pub extern "C" fn player_sheet_frame(state: u32, animation: f64, attack_remaining: f64) -> u32 {
    let (column, row) = match state {
        0 => (0, 0),
        1 | 2 => {
            let cycle = (animation % 6.283 + 6.283) % 6.283;
            let column = (floor_f64(cycle / 6.283 * 4.0) as u32) % 4;
            (column, if state == 1 { 1 } else { 2 })
        }
        3 => (if attack_remaining > 0.13 { 0 } else if attack_remaining > 0.06 { 1 } else { 2 }, 3),
        _ => (0, 0),
    };
    column | (row << 8)
}

/// Selects the enemy spritesheet row and column using the original 110 ms cadence.
/// Returns column in bits 0..7 and row in bits 8..15.
#[no_mangle]
pub extern "C" fn enemy_sheet_frame(moving: u32, now_ms: f64) -> u32 {
    if moving == 0 { return 0; }
    let column = (floor_f64(now_ms / 110.0) as u32) % 4;
    column | (1 << 8)
}

#[inline]
fn player_ellipse(x: f64, y: f64, cx: f64, cy: f64, rx: f64, ry: f64) -> bool {
    ((x - cx) / rx) * ((x - cx) / rx) + ((y - cy) / ry) * ((y - cy) / ry) <= 1.0
}

#[inline]
unsafe fn player_put(x: f64, y: f64, color: u32) {
    let px = player_round(x); let py = player_round(y);
    if px >= 0 && py >= 0 && px < 24 && py < 24 {
        core::ptr::write(core::ptr::addr_of_mut!(PLAYER_PIXELS).cast::<u32>().add((py * 24 + px) as usize), color);
    }
}

/// Builds the game's 24x24 procedural player frame into packed RGBA pixels.
/// Palette order: outline, suit, suit shadow, suit light, shirt, shirt shadow,
/// tie, tie shadow, hair, skin, skin shadow, shoes. `state`: 0 idle, 1 walk,
/// 2 run, 3 attack. Sine is computed by the host to preserve JS animation parity.
#[no_mangle]
pub extern "C" fn draw_player_frame(state: u32, phase: u32, attack_frame: u32, sine: f64) {
    const C: f64 = 11.5;
    let colors = core::ptr::addr_of!(PLAYER_PALETTE).cast::<u32>();
    let palette = unsafe { core::slice::from_raw_parts(colors, 12) };
    unsafe { core::ptr::addr_of_mut!(PLAYER_PIXELS).cast::<u32>().write_bytes(0, 24 * 24); }
    let f = (phase.min(7) as f64) * 6.283 / 8.0;
    let sw = sine;
    let mut arm_l = 0.0; let mut arm_r = 0.0; let mut legs = 0.0; let mut lean = 0.0; let mut hit = 0.0;
    if state == 1 { arm_l = sw * 2.6; arm_r = -sw * 2.6; legs = sw * 2.2; }
    if state == 2 { arm_l = sw * 4.0; arm_r = -sw * 4.0; legs = sw * 3.6; lean = 1.5; }
    if state == 3 { hit = 1.0 - attack_frame.min(3) as f64 / 3.0; }

    // Shoes behind the body.
    for pair in 0..2 {
        let (sx, sy, offset) = if pair == 0 { (C - 7.0, C - 4.0, legs) } else { (C - 7.0, C + 4.0, -legs) };
        for y in -2..=2 { for x in -2..=2 {
            if player_ellipse(x as f64, y as f64, 0.0, 0.0, 2.0, 1.5) && (x as f64).abs() < 3.0 {
                unsafe { player_put(sx + x as f64, sy + y as f64 + offset * 0.5, palette[11]); }
            }
        }}
    }
    // Arms and hands.
    for side in [-1_i32, 1_i32] {
        let (ax, ay) = if side < 0 { (C - 1.0 + arm_l * 0.4 + lean, C - 8.0) }
            else { (C - 1.0 + arm_r * 0.4 + lean + if state == 3 { 4.0 + hit * 4.0 } else { 0.0 }, C + 8.0 - if state == 3 { 2.0 * hit } else { 0.0 }) };
        for y in 0..24 { for x in 0..24 {
            let rx = if state == 3 && side > 0 { 4.2 } else { 3.4 };
            if player_ellipse(x as f64, y as f64, ax, ay, rx, 2.3) { unsafe { player_put(x as f64, y as f64, palette[2]); } }
        }}
        let hx = ax + if side > 0 && state == 3 { 4.0 } else { 2.6 };
        for y in 0..24 { for x in 0..24 {
            if player_ellipse(x as f64, y as f64, hx, ay, 1.7, 1.7) { unsafe { player_put(x as f64, y as f64, palette[9]); } }
        }}
    }
    // Suit torso, highlight and shadow.
    for y in 0..24 { for x in 0..24 {
        if player_ellipse(x as f64, y as f64, C - 1.5 + lean, C, 6.2, 8.2) {
            let highlight = player_ellipse(x as f64, y as f64, C - 2.5, C - 3.0, 3.0, 3.0);
            let shadow = (x as f64) < C - 3.5;
            unsafe { player_put(x as f64, y as f64, if highlight { palette[3] } else if shadow { palette[2] } else { palette[1] }); }
        }
    }}
    // Shirt and tie.
    let mut y = C - 3.0; while y <= C + 3.0 { let mut x = C + 2.0; while x <= C + 4.0 {
        unsafe { player_put(x, y, if x == C + 4.0 { palette[5] } else { palette[4] }); } x += 1.0;
    } y += 1.0; }
    y = C - 1.0; while y <= C + 3.0 { unsafe { player_put(C + 3.0, y, palette[6]); } y += 1.0; }
    y = C; while y <= C + 3.0 { unsafe { player_put(C + 4.0, y, palette[7]); } y += 1.0; }
    y = C - 5.0; while y <= C - 3.0 { unsafe { player_put(C + 5.0, y, palette[2]); } y += 1.0; }
    y = C + 3.0; while y <= C + 5.0 { unsafe { player_put(C + 5.0, y, palette[2]); } y += 1.0; }
    // Head and hair.
    let head_x = C + 6.0 + lean;
    for yy in 0..24 { for xx in 0..24 {
        if player_ellipse(xx as f64, yy as f64, head_x, C, 3.7, 3.9) { unsafe { player_put(xx as f64, yy as f64, palette[9]); } }
    }}
    for yy in 0..24 { for xx in 0..24 {
        if player_ellipse(xx as f64, yy as f64, head_x, C, 3.7, 3.9) && ((xx as f64) < head_x - 0.8 || (yy as f64) < C - 2.0) {
            unsafe { player_put(xx as f64, yy as f64, palette[8]); }
        }
    }}
    unsafe { player_put(head_x + 2.0, C + 1.0, palette[10]); player_put(head_x + 1.0, C + 2.0, palette[10]); }
    // One-pixel outline around the silhouette, based on the unoutlined image.
    let mut outline = [0u8; 24 * 24];
    for y in 0..24_i32 { for x in 0..24_i32 {
        let idx = (y * 24 + x) as usize;
        if unsafe { core::ptr::read(core::ptr::addr_of!(PLAYER_PIXELS).cast::<u32>().add(idx)) } != 0 { continue; }
        'neighbors: for dy in -1..=1 { for dx in -1..=1 {
            let xx = x + dx; let yy = y + dy;
            if xx >= 0 && yy >= 0 && xx < 24 && yy < 24 {
                let neighbor = (yy * 24 + xx) as usize;
                if unsafe { core::ptr::read(core::ptr::addr_of!(PLAYER_PIXELS).cast::<u32>().add(neighbor)) } != 0 { outline[idx] = 1; break 'neighbors; }
            }
        }}
    }}
    for i in 0..24 * 24 { if outline[i] != 0 { unsafe { core::ptr::write(core::ptr::addr_of_mut!(PLAYER_PIXELS).cast::<u32>().add(i), palette[0]); } } }
    let _ = f; // `sine` represents sin(f); keep the phase calculation explicit for the ABI contract.
}

#[no_mangle]
pub extern "C" fn player_palette_ptr() -> *mut u8 { core::ptr::addr_of_mut!(PLAYER_PALETTE).cast::<u8>() }

#[no_mangle]
pub extern "C" fn player_pixels_ptr() -> *mut u8 { core::ptr::addr_of_mut!(PLAYER_PIXELS).cast::<u8>() }

#[no_mangle]
pub extern "C" fn points_ptr() -> *mut u8 {
    core::ptr::addr_of_mut!(INPUT).cast::<u8>()
}

#[no_mangle]
pub extern "C" fn rooms_ptr() -> *mut u8 {
    core::ptr::addr_of_mut!(ROOMS).cast::<u8>()
}

#[no_mangle]
pub extern "C" fn furniture_ptr() -> *mut u8 {
    core::ptr::addr_of_mut!(FURNITURE).cast::<u8>()
}

#[no_mangle]
pub extern "C" fn capacity() -> u32 {
    MAX_POINTS as u32
}

#[no_mangle]
pub extern "C" fn enemy_flags_ptr() -> *mut u8 {
    core::ptr::addr_of_mut!(ENEMY_FLAGS).cast::<u8>()
}

fn filter_visible(count: usize, player_x: f64, player_y: f64) -> usize {
    let input = core::ptr::addr_of!(INPUT).cast::<Point>();
    let visible = core::ptr::addr_of_mut!(VISIBLE).cast::<u32>();
    let mut output_count = 0usize;
    for index in 0..count.min(MAX_POINTS) {
        let point = unsafe { core::ptr::read(input.add(index)) };
        if (point.x - player_x).abs() < 900.0 && (point.y - player_y).abs() < 700.0 {
            unsafe { core::ptr::write(visible.add(output_count), index as u32); }
            output_count += 1;
        }
    }
    output_count
}

#[no_mangle]
pub extern "C" fn filter_visible_count(count: u32, player_x: f64, player_y: f64) -> u32 {
    filter_visible(count as usize, player_x, player_y) as u32
}

struct EnemyCommandWriter {
    start: usize,
    len: usize,
    failed: bool,
}

impl EnemyCommandWriter {
    fn new() -> Self {
        Self { start: unsafe { ENEMY_BODY_COMMAND_COUNT as usize }, len: 0, failed: false }
    }

    fn push(&mut self, op: u32, color: u32, a: f64, b: f64, c: f64, d: f64, e: f64, f: f64) {
        if self.failed { return; }
        if self.start + self.len >= ENEMY_BODY_COMMAND_CAPACITY {
            self.failed = true;
            return;
        }
        let offset = (self.start + self.len) * 8;
        let commands = core::ptr::addr_of_mut!(ENEMY_BODY_COMMANDS).cast::<f64>();
        unsafe {
            core::ptr::write(commands.add(offset), op as f64);
            core::ptr::write(commands.add(offset + 1), color as f64);
            core::ptr::write(commands.add(offset + 2), a);
            core::ptr::write(commands.add(offset + 3), b);
            core::ptr::write(commands.add(offset + 4), c);
            core::ptr::write(commands.add(offset + 5), d);
            core::ptr::write(commands.add(offset + 6), e);
            core::ptr::write(commands.add(offset + 7), f);
        }
        self.len += 1;
    }

    fn commit(self, enemy_index: u32) {
        if self.failed { return; }
        let range_offset = enemy_index as usize * 2;
        let ranges = core::ptr::addr_of_mut!(ENEMY_BODY_RANGES).cast::<u32>();
        unsafe {
            core::ptr::write(ranges.add(range_offset), self.start as u32);
            core::ptr::write(ranges.add(range_offset + 1), self.len as u32);
            ENEMY_BODY_COMMAND_COUNT = (self.start + self.len) as u32;
        }
    }
}

/// Rust owns the geometry and command ordering for one visible enemy body.
/// The browser host applies the completed command slice after this call returns.
fn emit_enemy_body(enemy_index: u32, alpha: f64, sheet_ready: bool, now_ms: f64, stunned: bool, label: u32) {
    let pose = unsafe { core::ptr::read(core::ptr::addr_of!(ENEMY_DRAW_DATA).cast::<EnemyDrawData>().add(enemy_index as usize)) };
    unsafe {
        let ranges = core::ptr::addr_of_mut!(ENEMY_BODY_RANGES).cast::<u32>();
        core::ptr::write(ranges.add(enemy_index as usize * 2), 0);
        core::ptr::write(ranges.add(enemy_index as usize * 2 + 1), 0);
    }

    let mut out = EnemyCommandWriter::new();
    out.push(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // save
    if alpha != 1.0 { out.push(18, 0, alpha, 0.0, 0.0, 0.0, 0.0, 0.0); } // knockout alpha
    let point = unsafe { core::ptr::read(core::ptr::addr_of!(INPUT).cast::<Point>().add(enemy_index as usize)) };
    out.push(19, 0, point.x, point.y, 0.0, 0.0, 0.0, 0.0);
    out.push(20, 0, pose.angle, 0.0, 0.0, 0.0, 0.0, 0.0);
    if pose.fall != 0.0 { out.push(20, 0, pose.fall * 1.45, 0.0, 0.0, 0.0, 0.0, 0.0); }

    if sheet_ready && pose.flags & 1 != 0 {
        let frame = enemy_sheet_frame(if pose.flags & 2 != 0 { 1 } else { 0 }, now_ms);
        out.push(25, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0); // imageSmoothingEnabled
        out.push(22, 0, (frame & 0xff) as f64, ((frame >> 8) & 0xff) as f64, 0.0, 0.0, 0.0, 0.0); // enemy spritesheet cell
        out.push(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // restore
        if stunned { emit_enemy_stun(&mut out, enemy_index, now_ms); }
        emit_enemy_text(&mut out, enemy_index, if stunned { 4 } else { 0 }, -34.0);
        emit_enemy_text(&mut out, enemy_index, label, -24.0);
        out.commit(enemy_index);
        return;
    }

    // Preserve body()'s default enemy weapon strip before the fallback character.
    out.push(23, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(6, 0, 4.0, -3.0, 22.0, 6.0, 0.0, 0.0);
    out.push(23, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // skin fill
    out.push(24, 2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // dark outline
    out.push(3, 0, 1.5, 0.0, 0.0, 0.0, 0.0, 0.0);

    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(12, 0, 3.0, -11.0, 4.5, 3.0, 0.25, 6.28); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); out.push(14, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(12, 0, 3.0, 11.0, 4.5, 3.0, -0.25, 6.28); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); out.push(14, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

    out.push(23, pose.color.min(2), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // class color
    out.push(18, 0, alpha * 0.25, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(12, 0, 0.0, 0.0, 13.0, 18.0, 0.0, 6.28); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(18, 0, alpha, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(12, 0, 0.0, 0.0, 9.0, 14.0, 0.0, 6.28); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(24, 2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); out.push(3, 0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0); out.push(14, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

    out.push(23, 6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // highlight
    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(12, 0, -2.0, -4.0, 4.0, 6.0, 0.0, 6.28); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(23, 7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // shoes
    out.push(6, 0, 1.0, -14.0, 5.0, 3.0, 0.0, 0.0); out.push(6, 0, 1.0, 11.0, 5.0, 3.0, 0.0, 0.0);
    out.push(23, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // face
    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); out.push(11, 0, 0.0, 0.0, 8.0, 0.0, 6.28, 0.0); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(23, 8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // hair
    out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); out.push(11, 0, -2.0, 0.0, 7.0, 1.6, 4.7, 0.0); out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    out.push(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // restore
    if stunned { emit_enemy_stun(&mut out, enemy_index, now_ms); }
    emit_enemy_text(&mut out, enemy_index, if stunned { 4 } else { 0 }, -34.0);
    emit_enemy_text(&mut out, enemy_index, label, -24.0);
    out.commit(enemy_index);
}

/// Adds a semantic enemy-label command after the body/stun geometry.
/// The browser host uses the game's existing cached text painter for rasterization.
fn emit_enemy_text(out: &mut EnemyCommandWriter, enemy_index: u32, label: u32, y_offset: f64) {
    if label == 0 { return; }
    let point = unsafe { core::ptr::read(core::ptr::addr_of!(INPUT).cast::<Point>().add(enemy_index as usize)) };
    out.push(30, label, point.x, point.y + y_offset, 0.0, 0.0, 0.0, 0.0);
}

#[inline]
fn sin_approx(value: f64) -> f64 {
    const PI: f64 = 3.141592653589793;
    const TAU: f64 = 6.283185307179586;
    let mut x = value % TAU;
    if x > PI { x -= TAU; }
    if x < -PI { x += TAU; }
    let x2 = x * x;
    x * (1.0 + x2 * (-1.0 / 6.0 + x2 * (1.0 / 120.0 + x2 * (-1.0 / 5040.0 + x2 * (1.0 / 362880.0 + x2 * (-1.0 / 39916800.0))))))
}

/// Emits the three orbiting stun pairs after the enemy body has restored its
/// transform. JavaScript supplies the same performance clock used by the old
/// painter; the host only rasterizes these Rust-authored arc commands.
fn emit_enemy_stun(out: &mut EnemyCommandWriter, enemy_index: u32, now_ms: f64) {
    let point = unsafe { core::ptr::read(core::ptr::addr_of!(INPUT).cast::<Point>().add(enemy_index as usize)) };
    let time = now_ms / 180.0;
    out.push(16, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // save
    out.push(23, 4, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // yellow
    for i in 0..3 {
        let angle = time + i as f64 * 2.09;
        let cx = point.x + sin_approx(angle + 1.5707963267948966) * 9.0;
        let cy = point.y - 22.0 + sin_approx(angle) * 3.0;
        out.push(18, 0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0);
        out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        out.push(11, 0, cx, cy, 5.0, 0.0, 6.28, 0.0);
        out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        out.push(18, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        out.push(8, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        out.push(11, 0, cx, cy, 2.5, 0.0, 6.28, 0.0);
        out.push(13, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    out.push(2, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0); // restore
}

/// Rust owns enemy visibility, body geometry, knockout/stun/alert branching and draw order.
/// Host callbacks are restricted to asset/text drawing through the browser APIs.
#[no_mangle]
pub extern "C" fn draw_visible_enemies(count: u32, player_x: f64, player_y: f64, sheet_ready: u32, now_ms: f64) -> u32 {
    let count = (count as usize).min(MAX_POINTS);
    let visible_count = filter_visible(count, player_x, player_y);
    let visible = core::ptr::addr_of!(VISIBLE).cast::<u32>();
    let flags = core::ptr::addr_of!(ENEMY_FLAGS).cast::<u32>();
    unsafe { ENEMY_BATCHES = ENEMY_BATCHES.wrapping_add(1); ENEMY_EVENT_COUNT = 0; ENEMY_SHADOW_COUNT = 0; ENEMY_BODY_COMMAND_COUNT = 0; }
    for index in 0..visible_count {
        let enemy_index = unsafe { core::ptr::read(visible.add(index)) };
        let state = unsafe { core::ptr::read(flags.add(enemy_index as usize)) };
        if state & 1 != 0 {
            push_enemy_shadow(enemy_index, 0.55);
            emit_enemy_body(enemy_index, 0.55, sheet_ready != 0, now_ms, false, 1);
            push_enemy_event(1, enemy_index, 1); // body at 55% alpha
            push_enemy_event(3, enemy_index, 1); // knockout label
            continue;
        }
        push_enemy_shadow(enemy_index, 1.0);
        let label = if state & 4 != 0 { 2 } else if state & 8 != 0 { 3 } else { 0 };
        emit_enemy_body(enemy_index, 1.0, sheet_ready != 0, now_ms, state & 2 != 0, label);
        push_enemy_event(1, enemy_index, 0); // body at full alpha
        if state & 2 != 0 { push_enemy_event(2, enemy_index, 0); }
        if state & 4 != 0 { push_enemy_event(3, enemy_index, 2); }
        else if state & 8 != 0 { push_enemy_event(3, enemy_index, 3); }
    }
    visible_count as u32
}

#[inline]
fn push_enemy_shadow(index: u32, alpha: f64) {
    unsafe {
        let point = core::ptr::read(core::ptr::addr_of!(INPUT).cast::<Point>().add(index as usize));
        let offset = ENEMY_SHADOW_COUNT as usize * 5;
        let shadows = core::ptr::addr_of_mut!(ENEMY_SHADOWS).cast::<f64>();
        core::ptr::write(shadows.add(offset), point.x + 3.0);
        core::ptr::write(shadows.add(offset + 1), point.y + 5.0);
        core::ptr::write(shadows.add(offset + 2), 12.0);
        core::ptr::write(shadows.add(offset + 3), 10.0);
        core::ptr::write(shadows.add(offset + 4), alpha);
        ENEMY_SHADOW_COUNT += 1;
    }
}

#[inline]
fn push_enemy_event(kind: u32, index: u32, value: u32) {
    unsafe {
        let offset = ENEMY_EVENT_COUNT as usize * 3;
        core::ptr::write(core::ptr::addr_of_mut!(ENEMY_EVENTS).cast::<u32>().add(offset), kind);
        core::ptr::write(core::ptr::addr_of_mut!(ENEMY_EVENTS).cast::<u32>().add(offset + 1), index);
        core::ptr::write(core::ptr::addr_of_mut!(ENEMY_EVENTS).cast::<u32>().add(offset + 2), value);
        ENEMY_EVENT_COUNT += 1;
    }
}

#[no_mangle]
pub extern "C" fn enemy_events_ptr() -> u32 {
    core::ptr::addr_of!(ENEMY_EVENTS) as u32
}

#[no_mangle]
pub extern "C" fn enemy_events_count() -> u32 {
    unsafe { ENEMY_EVENT_COUNT }
}

#[no_mangle]
pub extern "C" fn enemy_shadows_ptr() -> u32 {
    core::ptr::addr_of!(ENEMY_SHADOWS) as u32
}

#[no_mangle]
pub extern "C" fn enemy_shadows_count() -> u32 {
    unsafe { ENEMY_SHADOW_COUNT }
}

#[no_mangle]
pub extern "C" fn enemy_draw_data_ptr() -> u32 {
    core::ptr::addr_of!(ENEMY_DRAW_DATA) as u32
}

#[no_mangle]
pub extern "C" fn enemy_body_ranges_ptr() -> u32 {
    core::ptr::addr_of!(ENEMY_BODY_RANGES) as u32
}

#[no_mangle]
pub extern "C" fn enemy_body_commands_ptr() -> u32 {
    core::ptr::addr_of!(ENEMY_BODY_COMMANDS) as u32
}

#[no_mangle]
pub extern "C" fn enemy_body_commands_count() -> u32 {
    unsafe { ENEMY_BODY_COMMAND_COUNT }
}

#[no_mangle]
pub extern "C" fn enemy_batches() -> u32 {
    unsafe { ENEMY_BATCHES }
}

#[no_mangle]
pub extern "C" fn floor_rects() -> u32 {
    unsafe { FLOOR_RECTS }
}

#[no_mangle]
pub extern "C" fn floor_batch_capacity() -> u32 {
    FLOOR_BATCH_SIZE as u32
}

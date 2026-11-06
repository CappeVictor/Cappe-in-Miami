#![no_std]

use core::panic::PanicInfo;

static mut CANVAS_CALLS: u32 = 0;
static mut PROPERTY_WRITES: u32 = 0;
static mut ENEMY_BATCHES: u32 = 0;
static mut ENEMY_EVENT_COUNT: u32 = 0;
static mut ENEMY_SHADOW_COUNT: u32 = 0;
static mut ENEMY_BODY_COMMAND_COUNT: u32 = 0;
static mut FLOOR_RECTS: u32 = 0;

const MAX_POINTS: usize = 8192;
const MAX_PLAYERS: usize = 3;
const FLOOR_BATCH_SIZE: usize = 4096;
const FURN_BATCH_SIZE: usize = 4096;
const ENEMY_BODY_COMMAND_CAPACITY: usize = 65536;
static mut FLOOR_COMMAND_COUNT: u32 = 0;
static mut FLOOR_COMMANDS: [f64; FLOOR_BATCH_SIZE * 5] = [0.0; FLOOR_BATCH_SIZE * 5];
static mut FURN_COMMAND_COUNT: u32 = 0;
static mut FURN_COMMANDS: [f64; FURN_BATCH_SIZE * 8] = [0.0; FURN_BATCH_SIZE * 8];
static mut PLAYER_PIXELS: [u32; 24 * 24] = [0; 24 * 24];
static mut PLAYER_PALETTE: [u32; 12] = [0; 12];

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
    fn draw_floor_batch(pointer: u32, count: u32);
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

/// Selects floor-tile overlay rectangles in room order, excluding the corridor.
/// The host owns the decoded tileset and performs Canvas clipping/pattern fills.
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

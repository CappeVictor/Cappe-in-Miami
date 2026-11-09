use js_sys::{Array, Float64Array, Reflect, Uint8Array, Uint8ClampedArray, Uint32Array};
use std::cell::RefCell;
use wasm_bindgen::{prelude::*, JsCast};
use web_sys::{
    CanvasPattern, CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement, ImageData,
};

const MAP_TEXTURE_BUFFER_LEN: usize = 1600 * 1200 * 4;
const MAP_TEXTURE_INPUT_LEN: usize = 8 * 24 * 24 * 4;
static mut MAP_TEXTURE_OUTPUT: [u8; MAP_TEXTURE_BUFFER_LEN] = [0; MAP_TEXTURE_BUFFER_LEN];

struct SparkBuffers {
    input: Vec<f64>,
    palette: Vec<String>,
    buckets: Vec<Vec<usize>>,
}

std::thread_local! {
    static SPARK_BUFFERS: RefCell<SparkBuffers> = RefCell::new(SparkBuffers {
        input: Vec::new(),
        palette: Vec::new(),
        buckets: Vec::new(),
    });
}

#[inline]
fn blend_map_texture_pixel(
    output: &mut [u8],
    offset: usize,
    textures: &[u8],
    source_offset: usize,
    coverage: f64,
) {
    if coverage <= 0.0 {
        return;
    }
    let source_alpha = (textures[source_offset + 3] as f64 * coverage + 0.5) as u32;
    if source_alpha == 0 {
        return;
    }
    let dest_alpha = output[offset + 3] as u32;
    if dest_alpha == 0 {
        output[offset..offset + 3].copy_from_slice(&textures[source_offset..source_offset + 3]);
        output[offset + 3] = source_alpha.min(255) as u8;
        return;
    }
    let inverse = 255 - source_alpha;
    let out_alpha = source_alpha + dest_alpha * inverse / 255;
    for channel in 0..3 {
        let source_color = textures[source_offset + channel] as u32;
        let source_premultiplied = (source_color * source_alpha + 127) / 255;
        let dest_color = output[offset + channel] as u32;
        let out_premultiplied = source_premultiplied + dest_color * inverse / 255;
        output[offset + channel] = out_premultiplied.min(255) as u8;
    }
    output[offset + 3] = out_alpha.min(255) as u8;
}

fn raster_map_pattern(
    output: &mut [u8],
    width: usize,
    height: usize,
    textures: &[u8],
    slot: usize,
    x: f64,
    y: f64,
    rect_width: f64,
    rect_height: f64,
) {
    let left = x.max(0.0).min(width as f64);
    let top = y.max(0.0).min(height as f64);
    let right = (x + rect_width).max(0.0).min(width as f64);
    let bottom = (y + rect_height).max(0.0).min(height as f64);
    if right <= left || bottom <= top {
        return;
    }
    let sprite = slot * 24 * 24 * 4;
    for py in top.floor() as usize..(bottom.ceil() as usize) {
        let coverage_y = (bottom.min(py as f64 + 1.0) - top.max(py as f64)).max(0.0);
        for px in left.floor() as usize..(right.ceil() as usize) {
            let coverage_x = (right.min(px as f64 + 1.0) - left.max(px as f64)).max(0.0);
            let sample_x = ((px as f64 + 0.5) % 24.0).floor() as usize;
            let sample_y = ((py as f64 + 0.5) % 24.0).floor() as usize;
            let source = sprite + (sample_y * 24 + sample_x) * 4;
            blend_map_texture_pixel(
                output,
                (py * width + px) * 4,
                textures,
                source,
                coverage_x * coverage_y,
            );
        }
    }
}

fn raster_map_door(
    output: &mut [u8],
    width: usize,
    height: usize,
    textures: &[u8],
    center_x: f64,
    center_y: f64,
    along: f64,
    across: f64,
    rotated: bool,
) {
    if !along.is_finite() || !across.is_finite() || along <= 0.0 || across <= 0.0 {
        return;
    }
    let (rect_width, rect_height) = if rotated {
        (across, along)
    } else {
        (along, across)
    };
    let left = (center_x - rect_width / 2.0).max(0.0).min(width as f64);
    let top = (center_y - rect_height / 2.0).max(0.0).min(height as f64);
    let right = (center_x + rect_width / 2.0).max(0.0).min(width as f64);
    let bottom = (center_y + rect_height / 2.0).max(0.0).min(height as f64);
    if right <= left || bottom <= top {
        return;
    }
    let sprite = 7 * 24 * 24 * 4;
    for py in top.floor() as usize..(bottom.ceil() as usize) {
        let sample_y = py as f64 + 0.5;
        if sample_y < top || sample_y >= bottom {
            continue;
        }
        for px in left.floor() as usize..(right.ceil() as usize) {
            let sample_x = px as f64 + 0.5;
            if sample_x < left || sample_x >= right {
                continue;
            }
            let world_x = sample_x - center_x;
            let world_y = sample_y - center_y;
            let (local_x, local_y) = if rotated {
                (world_y, -world_x)
            } else {
                (world_x, world_y)
            };
            let source_x = (((local_x / along + 0.5) * 24.0)
                .max(0.0)
                .min(23.999)
                .floor()) as usize;
            let source_y = (((local_y / across + 0.5) * 24.0)
                .max(0.0)
                .min(23.999)
                .floor() as usize)
                .saturating_sub(1);
            blend_map_texture_pixel(
                output,
                (py * width + px) * 4,
                textures,
                sprite + (source_y * 24 + source_x) * 4,
                1.0,
            );
        }
    }
}

/// Rasterizes wall/furniture patterns and open-door decals without the legacy renderer callback.
#[wasm_bindgen(js_name = drawMapTexturesRgba)]
pub fn draw_map_textures_rgba(
    context: &CanvasRenderingContext2d,
    image: &ImageData,
    solids: &Float64Array,
    openings: &Float64Array,
    texture_input: &Uint8Array,
    wall_ready: bool,
    furniture_ready: bool,
    door_ready: bool,
    across: f64,
    width: u32,
    height: u32,
) -> Result<i32, JsValue> {
    if width == 0
        || width > 1600
        || height == 0
        || height > 1200
        || image.width() != width
        || image.height() != height
        || solids.length() % 4 != 0
        || solids.length() > 8192 * 4
        || openings.length() % 5 != 0
        || openings.length() > 8192 * 5
        || texture_input.length() != MAP_TEXTURE_INPUT_LEN as u32
        || !across.is_finite()
        || across <= 0.0
    {
        return Ok(-1);
    }

    let solid_data = solids.to_vec();
    let opening_data = openings.to_vec();
    if solid_data.iter().any(|value| !value.is_finite())
        || (0..solids.length() as usize)
            .step_by(4)
            .any(|offset| solid_data[offset + 2] < 0.0 || solid_data[offset + 3] < 0.0)
        || opening_data.iter().any(|value| !value.is_finite())
    {
        return Ok(-1);
    }

    let mut texture_bytes = [0u8; MAP_TEXTURE_INPUT_LEN];
    texture_input.copy_to(&mut texture_bytes);
    let width = width as usize;
    let height = height as usize;
    let output_len = width * height * 4;
    let output = unsafe {
        core::slice::from_raw_parts_mut(
            core::ptr::addr_of_mut!(MAP_TEXTURE_OUTPUT).cast::<u8>(),
            output_len,
        )
    };
    output.fill(0);

    let mut placements = 0i32;
    for index in 0..solid_data.len() / 4 {
        let offset = index * 4;
        let x = solid_data[offset];
        let y = solid_data[offset + 1];
        let rect_width = solid_data[offset + 2];
        let rect_height = solid_data[offset + 3];
        if rect_width.min(rect_height) <= 26.0 && wall_ready {
            raster_map_pattern(
                output,
                width,
                height,
                &texture_bytes,
                0,
                x,
                y,
                rect_width,
                rect_height,
            );
            placements += 1;
        } else if furniture_ready {
            raster_map_pattern(
                output,
                width,
                height,
                &texture_bytes,
                index % 6 + 1,
                x,
                y,
                rect_width,
                rect_height,
            );
            placements += 1;
        }
    }
    if door_ready {
        for index in 0..opening_data.len() / 5 {
            let offset = index * 5;
            let x = opening_data[offset];
            let y = opening_data[offset + 1];
            let rect_width = opening_data[offset + 2];
            let rect_height = opening_data[offset + 3];
            let along = rect_width.min(rect_height);
            if along > 110.0 || along < 20.0 {
                continue;
            }
            raster_map_door(
                output,
                width,
                height,
                &texture_bytes,
                x + rect_width / 2.0,
                y + rect_height / 2.0,
                along,
                across,
                rect_width > rect_height,
            );
            placements += 1;
        }
    }
    for pixel in 0..width * height {
        let offset = pixel * 4;
        let alpha = output[offset + 3] as u32;
        if alpha == 0 {
            continue;
        }
        for channel in 0..3 {
            let premultiplied = output[offset + channel] as u32;
            output[offset + channel] = ((premultiplied * 255 + alpha / 2) / alpha).min(255) as u8;
        }
    }

    let pixels = unsafe { Uint8ClampedArray::view(&output[..output_len]) };
    let data = Reflect::get(image.as_ref(), &JsValue::from_str("data"))?
        .dyn_into::<Uint8ClampedArray>()?;
    data.set(pixels.as_ref(), 0);
    context.put_image_data(image, 0.0, 0.0)?;
    Ok(placements)
}

/// Reads a small texture source into ImageData through Rust's Web APIs.
/// Canvas sources are read directly; image sources are rasterized into the supplied scratch canvas.
#[wasm_bindgen(js_name = readCanvasSourcePixels)]
pub fn read_canvas_source_pixels(
    source: &JsValue,
    scratch: &CanvasRenderingContext2d,
    width: u32,
    height: u32,
) -> Result<JsValue, JsValue> {
    if width < 24 || width > 144 || height != 24 {
        return Ok(JsValue::NULL);
    }

    let context = if let Some(canvas) = source.dyn_ref::<HtmlCanvasElement>() {
        if canvas.width() != width || canvas.height() != height {
            return Ok(JsValue::NULL);
        }
        let Some(context) = canvas
            .get_context("2d")?
            .and_then(|value| value.dyn_into::<CanvasRenderingContext2d>().ok())
        else {
            return Ok(JsValue::NULL);
        };
        context
    } else if let Some(image) = source.dyn_ref::<HtmlImageElement>() {
        if !image.complete() || image.natural_width() != width || image.natural_height() != height {
            return Ok(JsValue::NULL);
        }
        scratch.draw_image_with_html_image_element(image, 0.0, 0.0)?;
        scratch.clone()
    } else {
        return Ok(JsValue::NULL);
    };

    let pixels: ImageData = context.get_image_data(0.0, 0.0, width as f64, height as f64)?;
    Ok(pixels.into())
}

#[inline]
fn floor_random_direct(state: &mut u32) -> f64 {
    *state = state.wrapping_add(0x6D2B79F5);
    let mut t = (*state ^ (*state >> 15)).wrapping_mul(1 | *state);
    t = (t.wrapping_add((t ^ (t >> 7)).wrapping_mul(61 | t))) ^ t;
    (t ^ (t >> 14)) as f64 / 4_294_967_296.0
}

#[inline]
fn paint_floor_rect_direct(
    context: &CanvasRenderingContext2d,
    colors: &[String],
    color: usize,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), JsValue> {
    let fill = colors.get(color).ok_or_else(|| JsValue::from_str("invalid floor palette index"))?;
    context.set_fill_style_str(fill);
    context.fill_rect(x, y, width, height);
    Ok(())
}

/// Generates and paints a static carpet/tile/brick floor directly in Rust/WebSys.
/// Returns [next RNG state, emitted rectangle count] to preserve host RNG progression.
#[wasm_bindgen(js_name = paintFloor)]
pub fn paint_floor_direct(
    context: &CanvasRenderingContext2d,
    kind: u32,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    spacing: f64,
    seed: u32,
    color_input: &Array,
) -> Result<Float64Array, JsValue> {
    if kind < 1 || kind > 3 || ![x, y, width, height, spacing].iter().all(|value| value.is_finite())
        || width <= 0.0 || height <= 0.0 || width > 8192.0 || height > 8192.0
    {
        return Ok(Float64Array::new_with_length(0));
    }
    let minimum_colors = if kind == 1 { 3 } else if kind == 2 { 3 } else { 6 };
    if color_input.length() < minimum_colors || color_input.length() > 32 {
        return Ok(Float64Array::new_with_length(0));
    }
    let mut colors = Vec::with_capacity(color_input.length() as usize);
    for index in 0..color_input.length() {
        let Some(color) = color_input.get(index).as_string() else {
            return Ok(Float64Array::new_with_length(0));
        };
        if color.len() > 128 { return Ok(Float64Array::new_with_length(0)); }
        colors.push(color);
    }

    let mut state = seed;
    let mut emitted = 0_u32;
    match kind {
        1 => {
            paint_floor_rect_direct(context, &colors, 0, x, y, width, height)?;
            emitted += 1;
            let limit = (width * height / 12.0).ceil().max(0.0).min(2_000_000.0) as u32;
            for _ in 0..limit {
                let shade = if floor_random_direct(&mut state) < 0.5 { 1 } else { 2 };
                let px = x + (floor_random_direct(&mut state) * width / 2.0).floor() * 2.0;
                let py = y + (floor_random_direct(&mut state) * height / 2.0).floor() * 2.0;
                paint_floor_rect_direct(context, &colors, shade, px, py, 2.0, 2.0)?;
                emitted += 1;
            }
        }
        2 => {
            paint_floor_rect_direct(context, &colors, 2, x, y, width, height)?;
            emitted += 1;
            if spacing > 0.0 {
                let rows = (height / spacing).ceil().max(0.0).min(100_000.0) as u32;
                let columns = (width / spacing).ceil().max(0.0).min(100_000.0) as u32;
                if rows as u64 * columns as u64 > 2_000_000 { return Ok(Float64Array::new_with_length(0)); }
                for row in 0..rows {
                    for column in 0..columns {
                        let px = x + column as f64 * spacing + 1.0;
                        let py = y + row as f64 * spacing + 1.0;
                        let rw = (spacing - 1.0).min(width - column as f64 * spacing - 1.0);
                        let rh = (spacing - 1.0).min(height - row as f64 * spacing - 1.0);
                        let shade = if (column + row) % 2 == 1 { 0 } else { 1 };
                        paint_floor_rect_direct(context, &colors, shade, px, py, rw, rh)?;
                        emitted += 1;
                    }
                }
            }
        }
        3 => {
            paint_floor_rect_direct(context, &colors, 4, x, y, width, height)?;
            emitted += 1;
            let rows = (height / 10.0).ceil().min(100_000.0) as u32;
            let columns = (width / 28.0).ceil().min(100_000.0) as u32 + 1;
            if rows as u64 * columns as u64 > 1_000_000 { return Ok(Float64Array::new_with_length(0)); }
            for row in 0..rows {
                let row_y = y + row as f64 * 10.0;
                let row_x = x - (row % 2) as f64 * 14.0;
                for column in 0..columns {
                    let xx = row_x + column as f64 * 28.0;
                    if xx >= x + width { continue; }
                    let shade = (floor_random_direct(&mut state) * 4.0).floor() as usize;
                    paint_floor_rect_direct(context, &colors, shade, xx + 1.0, row_y + 1.0, 26.0, 8.0)?;
                    paint_floor_rect_direct(context, &colors, 5, xx + 1.0, row_y + 1.0, 26.0, 1.0)?;
                    emitted += 2;
                }
            }
        }
        _ => return Ok(Float64Array::new_with_length(0)),
    }
    Ok(Float64Array::from(&[state as f64, emitted as f64][..]))
}

/// Draws projected actor outlines for dark scenes, preserving the existing stroke styles.
#[wasm_bindgen(js_name = drawDarkOutlines)]
pub fn draw_dark_outlines(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
) -> Result<i32, JsValue> {
    if commands.length() % 4 != 0 || commands.length() > 40_000 {
        return Ok(-1);
    }
    let count = commands.length() / 4;
    for index in 0..count {
        let offset = index * 4;
        if (0..4).any(|component| !commands.get_index(offset + component).is_finite())
            || commands.get_index(offset + 2) < 0.0
            || !(commands.get_index(offset + 3) == 0.0 || commands.get_index(offset + 3) == 1.0)
        {
            return Ok(-1);
        }
    }

    context.save();
    context.set_line_width(2.0);
    for index in 0..count {
        let offset = index * 4;
        context.set_stroke_style_str(if commands.get_index(offset + 3) == 0.0 {
            "rgba(255,210,63,.6)"
        } else {
            "rgba(255,46,147,.85)"
        });
        context.begin_path();
        context.arc(
            commands.get_index(offset),
            commands.get_index(offset + 1),
            commands.get_index(offset + 2),
            0.0,
            6.28,
        )?;
        context.stroke();
    }
    context.restore();
    Ok(count as i32)
}

/// Projects living enemies and derives their dark-scene outlines from simulation state directly.
#[wasm_bindgen(js_name = drawDarkOutlineInputs)]
pub fn draw_dark_outline_inputs(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    camera_x: f64,
    camera_y: f64,
    screen_width: f64,
    screen_height: f64,
    zoom: f64,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 4;
    let length = input.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536
        || ![camera_x, camera_y, screen_width, screen_height, zoom].iter().all(|value| value.is_finite())
    {
        return Ok(-1);
    }
    let mut commands = Vec::with_capacity((length as usize / STRIDE as usize) * 4);
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = input.get_index(offset);
        let y = input.get_index(offset + 1);
        let dead = input.get_index(offset + 2);
        let knocked_out = input.get_index(offset + 3);
        if dead != 0.0 || !x.is_finite() || !y.is_finite() || !knocked_out.is_finite() {
            continue;
        }
        commands.extend_from_slice(&[
            (x - camera_x - screen_width / 2.0) * zoom + screen_width / 2.0,
            (y - camera_y - screen_height / 2.0) * zoom + screen_height / 2.0,
            14.0 * zoom,
            if knocked_out > 0.0 { 0.0 } else { 1.0 },
        ]);
    }
    let count = (commands.len() / 4) as i32;
    let commands = Float64Array::from(commands.as_slice());
    let drawn = draw_dark_outlines(context, &commands)?;
    if drawn == count { Ok(count) } else { Ok(-1) }
}

/// Draws the complete pause overlay through Canvas APIs called from Rust/WASM.
/// JavaScript still owns pause state and pointer hit-testing.
#[wasm_bindgen(js_name = drawPauseUi)]
pub fn draw_pause_ui(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
    hover_index: i32,
    title: &str,
    resume_label: &str,
    lobby_label: &str,
) -> Result<bool, JsValue> {
    if !width.is_finite()
        || !height.is_finite()
        || width <= 0.0
        || height <= 0.0
        || !(-1..=1).contains(&hover_index)
        || title.len() > 128
        || resume_label.len() > 128
        || lobby_label.len() > 128
    {
        return Ok(false);
    }

    context.save();
    context.set_fill_style_str("rgba(5,0,18,.78)");
    context.fill_rect(0.0, 0.0, width, height);
    context.set_text_align("center");
    context.set_text_baseline("alphabetic");
    context.set_fill_style_str("#ff2e93");
    context.set_font("64px Impact, sans-serif");
    context.fill_text(title, width / 2.0, height / 2.0 - 40.0)?;

    for (index, (label, color, offset_y)) in [
        (resume_label, "#ffffff", 26.0),
        (lobby_label, "#ffd23f", 82.0),
    ]
    .iter()
    .enumerate()
    {
        let x = width / 2.0 - 210.0;
        let y = height / 2.0 + offset_y - 23.0 + 4.0;
        let hovered = hover_index == index as i32;

        context.set_fill_style_str(if hovered {
            "rgba(255,46,147,.35)"
        } else {
            "rgba(20,0,40,.85)"
        });
        context.fill_rect(x, y, 420.0, 46.0);
        context.set_stroke_style_str(color);
        context.set_line_width(if hovered { 3.0 } else { 2.0 });
        context.stroke_rect(x, y, 420.0, 46.0);

        context.set_fill_style_str(color);
        context.set_font("bold 22px Impact, sans-serif");
        context.set_text_baseline("middle");
        context.fill_text(label, width / 2.0, y + 24.0)?;
    }

    context.restore();
    Ok(true)
}

/// Draws screen overlays directly on the supplied browser Canvas context.
/// Returns -1 for invalid input, otherwise the number of overlay rectangles.
#[wasm_bindgen(js_name = drawFxOverlays)]
pub fn draw_fx_overlays(
    context: &CanvasRenderingContext2d,
    stage: u32,
    width: f64,
    height: f64,
    now_ms: f64,
    primary: f64,
    secondary: f64,
    enabled: bool,
) -> Result<i32, JsValue> {
    if stage > 3
        || !width.is_finite()
        || !height.is_finite()
        || width <= 0.0
        || height <= 0.0
        || !now_ms.is_finite()
        || !primary.is_finite()
        || !secondary.is_finite()
        || primary < 0.0
        || secondary < 0.0
        || (stage == 0 && (primary > 1.0 || secondary > 1.0))
        || (stage == 3 && primary > 1.0)
    {
        return Ok(-1);
    }

    let mut count = 0;
    context.save();
    match stage {
        0 if enabled => {
            if primary > 0.0 {
                context.set_fill_style_str(&format!("rgba(220,235,255,{})", primary * 0.35));
                context.fill_rect(0.0, 0.0, width, height);
                count += 1;
            }
            if secondary > 0.0 {
                context.set_fill_style_str(&format!("rgba(255,46,147,{})", secondary * 0.35));
                context.fill_rect(0.0, 0.0, width, height);
                count += 1;
            }
        }
        1 if primary > 0.0 => {
            let alpha = 0.06 + 0.07 * (now_ms / 110.0).sin();
            context.set_fill_style_str(&format!("rgba(255,30,60,{alpha})"));
            context.fill_rect(0.0, 0.0, width, height);
            count = 1;
        }
        2 if primary > 0.0 => {
            let bar_height = 78.0 * (primary / 1.3 * 1.6).min(1.0);
            context.set_fill_style_str("#000");
            context.fill_rect(0.0, 0.0, width, bar_height);
            context.fill_rect(0.0, height - bar_height, width, bar_height);
            count = 2;
        }
        3 if enabled && primary > 0.0 => {
            context.set_fill_style_str(&format!("rgba(255,46,91,{primary})"));
            context.fill_rect(0.0, 0.0, width, height);
            count = 1;
        }
        _ => {}
    }
    context.restore();
    Ok(count)
}

/// Draws JavaScript-owned rain segments as one Canvas path from Rust/WASM.
/// The input is interleaved x, y, length values; invalid rows are skipped.
#[wasm_bindgen(js_name = drawRain)]
pub fn draw_rain(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    count: u32,
    step: u32,
) -> Result<i32, JsValue> {
    if count > 256 || (step != 1 && step != 2) || input.length() < count.saturating_mul(3) {
        return Ok(-1);
    }
    let mut segment_count = 0usize;
    for index in (0..count).step_by(step as usize) {
        let offset = index * 3;
        let x = input.get_index(offset);
        let y = input.get_index(offset + 1);
        let length = input.get_index(offset + 2);
        if x.is_finite() && y.is_finite() && length.is_finite() && length >= 0.0 {
            segment_count += 1;
        }
    }
    if segment_count == 0 {
        return Ok(0);
    }

    context.save();
    context.set_stroke_style_str("rgba(170,210,255,.38)");
    context.set_line_width(1.0);
    context.begin_path();
    for index in (0..count).step_by(step as usize) {
        let offset = index * 3;
        let x = input.get_index(offset);
        let y = input.get_index(offset + 1);
        let length = input.get_index(offset + 2);
        if !x.is_finite() || !y.is_finite() || !length.is_finite() || length < 0.0 {
            continue;
        }
        context.move_to(x, y);
        context.line_to(x - length * 0.18, y + length);
    }
    context.stroke();
    context.restore();
    Ok(segment_count as i32)
}

/// Draws ambient motes directly while JS retains all position updates.
#[wasm_bindgen(js_name = drawWeatherMotes)]
pub fn draw_weather_motes(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    count: u32,
    now_ms: f64,
) -> Result<i32, JsValue> {
    if count > 128 || !now_ms.is_finite() || input.length() < count.saturating_mul(4) {
        return Ok(-1);
    }
    context.save();
    context.set_fill_style_str("rgba(255,230,190,.55)");
    let mut drawn = 0;
    for index in 0..count {
        let offset = index * 4;
        let x = input.get_index(offset);
        let y = input.get_index(offset + 1);
        let radius = input.get_index(offset + 2);
        let phase = input.get_index(offset + 3);
        if !x.is_finite()
            || !y.is_finite()
            || !radius.is_finite()
            || radius < 0.0
            || !phase.is_finite()
        {
            continue;
        }
        let alpha = 0.25 + 0.35 * js_sys::Math::sin(now_ms / 700.0 + phase).abs();
        context.set_global_alpha(alpha);
        context.fill_rect(x, y, radius, radius);
        drawn += 1;
    }
    context.restore();
    Ok(drawn)
}

/// Draws plain HUD text entries directly, leaving entry construction in JS.
#[wasm_bindgen(js_name = drawRawHudTexts)]
pub fn draw_raw_hud_texts(
    context: &CanvasRenderingContext2d,
    entries: &Array,
) -> Result<i32, JsValue> {
    let count = entries.length();
    if count > 64 {
        return Ok(-1);
    }
    let saved_alpha = context.global_alpha();
    if !saved_alpha.is_finite() || !(0.0..=1.0).contains(&saved_alpha) {
        return Ok(-1);
    }

    for index in 0..count {
        let entry = entries.get(index);
        let text = Reflect::get(&entry, &JsValue::from_str("text"))?.as_string();
        let color = Reflect::get(&entry, &JsValue::from_str("color"))?.as_string();
        let font = Reflect::get(&entry, &JsValue::from_str("font"))?.as_string();
        let x = Reflect::get(&entry, &JsValue::from_str("x"))?.as_f64();
        let y = Reflect::get(&entry, &JsValue::from_str("y"))?.as_f64();
        let alpha_value = Reflect::get(&entry, &JsValue::from_str("alpha"))?;
        let alpha = if alpha_value.is_undefined() {
            Some(1.0)
        } else {
            alpha_value.as_f64()
        };
        let align_value = Reflect::get(&entry, &JsValue::from_str("align"))?;
        let align = if align_value.is_undefined() {
            Some("left".to_string())
        } else {
            align_value.as_string()
        };
        let absolute_value = Reflect::get(&entry, &JsValue::from_str("absoluteAlpha"))?;
        if text.is_none()
            || color.is_none()
            || font.is_none()
            || x.map_or(true, |v| !v.is_finite())
            || y.map_or(true, |v| !v.is_finite())
            || alpha.map_or(true, |v| !v.is_finite() || !(0.0..=1.0).contains(&v))
            || !matches!(align.as_deref(), Some("left" | "center" | "right"))
            || (!absolute_value.is_undefined() && absolute_value.as_bool().is_none())
        {
            return Ok(-1);
        }
    }

    for index in 0..count {
        let entry = entries.get(index);
        let text = Reflect::get(&entry, &JsValue::from_str("text"))?
            .as_string()
            .unwrap();
        let color = Reflect::get(&entry, &JsValue::from_str("color"))?
            .as_string()
            .unwrap();
        let font = Reflect::get(&entry, &JsValue::from_str("font"))?
            .as_string()
            .unwrap();
        let x = Reflect::get(&entry, &JsValue::from_str("x"))?
            .as_f64()
            .unwrap();
        let y = Reflect::get(&entry, &JsValue::from_str("y"))?
            .as_f64()
            .unwrap();
        let alpha_value = Reflect::get(&entry, &JsValue::from_str("alpha"))?;
        let alpha = if alpha_value.is_undefined() {
            1.0
        } else {
            alpha_value.as_f64().unwrap()
        };
        let align_value = Reflect::get(&entry, &JsValue::from_str("align"))?;
        let align_string = if align_value.is_undefined() {
            Some("left".to_string())
        } else {
            align_value.as_string()
        };
        let align = align_string.as_deref().unwrap();
        let absolute = Reflect::get(&entry, &JsValue::from_str("absoluteAlpha"))?
            .as_bool()
            .unwrap_or(false);
        context.save();
        context.set_global_alpha(if absolute { alpha } else { saved_alpha * alpha });
        context.set_fill_style_str(&color);
        context.set_font(&font);
        context.set_text_align(align);
        if let Err(error) = context.fill_text(&text, x, y) {
            context.restore();
            return Err(error);
        }
        context.restore();
    }
    Ok(count as i32)
}

/// Draws the optional developer HUD panel and error list without host Canvas calls.
#[wasm_bindgen(js_name = drawDebugHud)]
pub fn draw_debug_hud(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
    show_panel: bool,
    lines: &Array,
    show_errors: bool,
    errors: &Array,
) -> Result<bool, JsValue> {
    if !width.is_finite()
        || width <= 0.0
        || !height.is_finite()
        || height <= 0.0
        || lines.length() > 7
        || errors.length() > 12
        || (show_panel && lines.length() != 7)
    {
        return Ok(false);
    }
    for index in 0..lines.length() {
        if lines
            .get(index)
            .as_string()
            .map_or(true, |text| text.len() > 160)
        {
            return Ok(false);
        }
    }
    for index in 0..errors.length() {
        if errors
            .get(index)
            .as_string()
            .map_or(true, |text| text.len() > 90)
        {
            return Ok(false);
        }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_font("12px monospace");
        context.set_text_align("left");
        if show_panel {
            context.set_fill_style_str("rgba(0,0,0,.65)");
            context.fill_rect(width - 250.0, height - 150.0, 244.0, 120.0);
            context.set_fill_style_str("#7dff9b");
            for index in 0..lines.length() {
                let text = lines.get(index).as_string().unwrap();
                context.fill_text(&text, width - 244.0, height - 134.0 + index as f64 * 15.0)?;
            }
        }
        if show_errors {
            context.set_fill_style_str("rgba(0,0,0,.8)");
            context.fill_rect(10.0, 200.0, 560.0, 200.0);
            context.set_fill_style_str("#ff9ac8");
            if errors.length() == 0 {
                context.fill_text("sem erros registrados", 16.0, 218.0)?;
            } else {
                for index in 0..errors.length() {
                    let text = errors.get(index).as_string().unwrap();
                    context.fill_text(&text, 16.0, 218.0 + index as f64 * 15.0)?;
                }
            }
        }
        Ok(())
    })();
    context.restore();
    result?;
    Ok(true)
}

/// Rasterizes an expansion mask sprite using Rust-owned Canvas calls.
/// Colors: [base, outline, eyes, dark, nose]. Params: [ears, eyes, marks, mouth, width, height, eye_y].
#[wasm_bindgen(js_name = drawMaskArt)]
pub fn draw_mask_art(
    context: &CanvasRenderingContext2d,
    colors: &Array,
    params: &Float64Array,
) -> Result<bool, JsValue> {
    if colors.length() != 5 || params.length() != 7 {
        return Ok(false);
    }
    let mut color_values = Vec::with_capacity(5);
    for index in 0..5 {
        let Some(value) = colors.get(index).as_string() else {
            return Ok(false);
        };
        if value.len() > 64 {
            return Ok(false);
        }
        color_values.push(value);
    }
    let ears = params.get_index(0);
    let eyes = params.get_index(1);
    let marks = params.get_index(2);
    let mouth = params.get_index(3);
    let width = params.get_index(4);
    let height = params.get_index(5);
    let eye_y = params.get_index(6);
    if ![ears, eyes, marks, mouth, width, height, eye_y]
        .iter()
        .all(|value| value.is_finite())
        || ears.fract() != 0.0
        || !(0.0..=5.0).contains(&ears)
        || eyes.fract() != 0.0
        || !(0.0..=4.0).contains(&eyes)
        || marks.fract() != 0.0
        || !(0.0..=6.0).contains(&marks)
        || mouth.fract() != 0.0
        || !(0.0..=4.0).contains(&mouth)
        || width <= 0.0
        || width > 64.0
        || height <= 0.0
        || height > 64.0
        || !(0.0..=128.0).contains(&eye_y)
    {
        return Ok(false);
    }
    let ear_kind = ears as u32;
    let eye_kind = eyes as u32;
    let mark_kind = marks as u32;
    let mouth_kind = mouth as u32;
    let (base, outline, eye_color, dark, nose) = (
        &color_values[0],
        &color_values[1],
        &color_values[2],
        &color_values[3],
        &color_values[4],
    );
    context.save();
    let result = (|| -> Result<(), JsValue> {
        let background = context.create_linear_gradient(0.0, 0.0, 0.0, 128.0);
        background.add_color_stop(0.0, "#1a0840")?;
        background.add_color_stop(1.0, "#07020f")?;
        context.set_fill_style_canvas_gradient(&background);
        context.fill_rect(0.0, 0.0, 128.0, 128.0);
        context.set_stroke_style_str(&format!("{outline}55"));
        context.set_line_width(1.0);
        for i in (0..128).step_by(16) {
            let v = i as f64;
            context.begin_path();
            context.move_to(v, 0.0);
            context.line_to(v, 128.0);
            context.move_to(0.0, v);
            context.line_to(128.0, v);
            context.stroke();
        }
        if ear_kind != 0 {
            for (x, flip) in [(36.0, 1.0), (92.0, -1.0)] {
                context.save();
                context.translate(x, 34.0)?;
                context.scale(flip, 1.0)?;
                context.set_fill_style_str(base);
                context.set_stroke_style_str(outline);
                context.set_line_width(3.0);
                context.begin_path();
                match ear_kind {
                    1 => {
                        context.move_to(-6.0, 12.0);
                        context.line_to(-20.0, -22.0);
                        context.line_to(14.0, 2.0);
                    }
                    2 => context.arc(-6.0, 0.0, 15.0, 0.0, 6.3)?,
                    3 => {
                        context.move_to(-4.0, 14.0);
                        context.quadratic_curve_to(-28.0, -8.0, -14.0, -30.0);
                        context.quadratic_curve_to(-12.0, -6.0, 8.0, 6.0);
                    }
                    4 => {
                        context.move_to(-2.0, 14.0);
                        context.line_to(-30.0, -6.0);
                        context.line_to(-20.0, 4.0);
                        context.line_to(-26.0, 12.0);
                        context.line_to(-10.0, 8.0);
                        context.line_to(-14.0, 16.0);
                    }
                    5 => {
                        context.move_to(-4.0, 14.0);
                        context.quadratic_curve_to(-26.0, -4.0, -10.0, -30.0);
                        context.quadratic_curve_to(-8.0, -12.0, 6.0, -10.0);
                        context.quadratic_curve_to(0.0, 0.0, 8.0, 8.0);
                    }
                    _ => context.close_path(),
                }
                context.fill();
                context.stroke();
                context.restore();
            }
        }
        let face = context.create_radial_gradient(54.0, 56.0, 6.0, 64.0, 70.0, 54.0)?;
        face.add_color_stop(0.0, base)?;
        face.add_color_stop(1.0, dark)?;
        context.set_fill_style_canvas_gradient(&face);
        context.set_stroke_style_str(outline);
        context.set_line_width(4.0);
        context.set_shadow_color(outline);
        context.set_shadow_blur(14.0);
        context.begin_path();
        context.ellipse(64.0, 70.0, width, height, 0.0, 0.0, 6.3)?;
        context.fill();
        context.stroke();
        context.set_shadow_blur(0.0);
        context.set_stroke_style_str(outline);
        context.set_fill_style_str(outline);
        match mark_kind {
            1 => {
                context.set_line_width(4.0);
                for i in -2..=2 {
                    let v = i as f64;
                    context.begin_path();
                    context.move_to(64.0 + v * 11.0, 30.0);
                    context.line_to(64.0 + v * 8.0, 52.0);
                    context.stroke();
                }
            }
            2 => {
                for i in 0..9 {
                    context.begin_path();
                    context.arc(
                        40.0 + (i * 37 % 48) as f64,
                        48.0 + (i * 23 % 46) as f64,
                        2.6,
                        0.0,
                        6.3,
                    )?;
                    context.fill();
                }
            }
            3 => {
                context.set_line_width(1.6);
                for y in (38..108).step_by(10) {
                    let start_x = 34 + if y % 20 != 0 { 5 } else { 0 };
                    for x in (start_x..96).step_by(10) {
                        context.begin_path();
                        context.arc(x as f64, y as f64, 5.0, 0.0, 3.14)?;
                        context.stroke();
                    }
                }
            }
            4 => {
                context.set_line_width(2.4);
                context.begin_path();
                context.move_to(64.0, 30.0);
                context.line_to(58.0, 48.0);
                context.line_to(68.0, 60.0);
                context.line_to(60.0, 80.0);
                context.move_to(88.0, 52.0);
                context.line_to(78.0, 62.0);
                context.stroke();
            }
            5 => {
                context.set_line_width(1.4);
                for i in 0..6 {
                    let angle = i as f64 / 6.0 * 6.28;
                    context.begin_path();
                    context.move_to(64.0, 70.0);
                    context.line_to(64.0 + angle.cos() * 40.0, 70.0 + angle.sin() * 42.0);
                    context.stroke();
                }
                for r in [12.0, 23.0, 34.0] {
                    context.begin_path();
                    context.arc(64.0, 70.0, r, 0.0, 6.3)?;
                    context.stroke();
                }
            }
            6 => {
                context.set_line_width(7.0);
                for i in 0..3 {
                    context.begin_path();
                    context.move_to(30.0, 54.0 + i as f64 * 17.0);
                    context.line_to(98.0, 54.0 + i as f64 * 17.0);
                    context.stroke();
                }
            }
            _ => {}
        }
        context.set_shadow_color(eye_color);
        context.set_shadow_blur(16.0);
        context.set_fill_style_str(eye_color);
        match eye_kind {
            1 => {
                for sign in [-1.0, 1.0] {
                    context.begin_path();
                    context.ellipse(64.0 + sign * 17.0, eye_y, 9.0, 4.5, sign * 0.35, 0.0, 6.3)?;
                    context.fill();
                }
            }
            2 => context.fill_rect(36.0, eye_y - 7.0, 56.0, 11.0),
            3 => {
                for sign in [-1.0, 1.0] {
                    context.begin_path();
                    context.move_to(64.0 + sign * 6.0, eye_y - 8.0);
                    context.line_to(64.0 + sign * 26.0, eye_y - 2.0);
                    context.line_to(64.0 + sign * 20.0, eye_y + 8.0);
                    context.line_to(64.0 + sign * 6.0, eye_y + 4.0);
                    context.fill();
                }
            }
            4 => {
                for sign in [-1.0, 1.0] {
                    context.set_fill_style_str("#000");
                    context.begin_path();
                    context.ellipse(64.0 + sign * 17.0, eye_y, 8.0, 11.0, 0.0, 0.0, 6.3)?;
                    context.fill();
                    context.set_fill_style_str(eye_color);
                    context.begin_path();
                    context.arc(64.0 + sign * 17.0, eye_y, 3.0, 0.0, 6.3)?;
                    context.fill();
                }
            }
            _ => {
                for sign in [-1.0, 1.0] {
                    context.begin_path();
                    context.arc(64.0 + sign * 17.0, eye_y, 7.0, 0.0, 6.3)?;
                    context.fill();
                }
            }
        }
        context.set_shadow_blur(0.0);
        context.set_line_width(3.0);
        context.set_stroke_style_str(outline);
        context.set_fill_style_str(if nose.is_empty() { outline } else { nose });
        match mouth_kind {
            1 => {
                context.set_fill_style_str("#ffb02e");
                context.begin_path();
                context.move_to(54.0, 78.0);
                context.line_to(74.0, 78.0);
                context.line_to(64.0, 100.0);
                context.fill();
                context.stroke();
            }
            2 => {
                context.begin_path();
                context.move_to(40.0, 92.0);
                context.line_to(88.0, 92.0);
                context.stroke();
                context.set_fill_style_str("#fff");
                for x in [48.0, 60.0, 68.0, 80.0] {
                    context.begin_path();
                    context.move_to(x, 92.0);
                    context.line_to(x + 4.0, 92.0);
                    context.line_to(x + 2.0, 102.0);
                    context.fill();
                }
            }
            3 => {
                let snout = if nose.is_empty() { "#111" } else { nose };
                context.set_fill_style_str(snout);
                context.begin_path();
                context.ellipse(64.0, 86.0, 16.0, 11.0, 0.0, 0.0, 6.3)?;
                context.fill();
                context.stroke();
                context.set_fill_style_str(outline);
                context.begin_path();
                context.arc(64.0, 82.0, 4.0, 0.0, 6.3)?;
                context.fill();
            }
            4 => {
                context.begin_path();
                context.arc(64.0, 84.0, 22.0, 0.15, 3.0)?;
                context.stroke();
            }
            _ => {
                context.begin_path();
                context.move_to(52.0, 94.0);
                context.line_to(76.0, 94.0);
                context.stroke();
            }
        }
        Ok(())
    })();
    context.restore();
    result?;
    Ok(true)
}

/// Paints the expansion boss health bar and phase markers directly in Rust.
#[wasm_bindgen(js_name = drawBossHealthBar)]
pub fn draw_boss_health_bar_direct(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
    fraction: f64,
    boss_color: &str,
    phases: &Float64Array,
) -> Result<bool, JsValue> {
    if !width.is_finite()
        || !height.is_finite()
        || width <= 0.0
        || height <= 0.0
        || !fraction.is_finite()
        || fraction < 0.0
        || fraction > 4.0
        || phases.length() > 8
        || boss_color.is_empty()
        || boss_color.len() > 64
    {
        return Ok(false);
    }
    for index in 0..phases.length() {
        let at = phases.get_index(index);
        if !at.is_finite() {
            return Ok(false);
        }
    }
    let x = (width - 460.0) / 2.0;
    let y = height - 92.0;
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("rgba(0,0,0,.6)");
        context.fill_rect(x - 3.0, y - 3.0, 466.0, 20.0);
        context.set_fill_style_str(boss_color);
        context.fill_rect(x, y, 460.0 * fraction.max(0.0), 14.0);
        context.set_fill_style_str("rgba(255,255,255,.35)");
        for index in 0..phases.length() {
            context.fill_rect(x + 460.0 * phases.get_index(index) - 1.0, y, 2.0, 14.0);
        }
        context.set_stroke_style_str("#000");
        context.set_line_width(2.0);
        context.stroke_rect(x, y, 460.0, 14.0);
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(true)
}

/// Paints the hidden-object outline and escape route for the Owl character.
/// Items are rows of [kind, x, y, radius_or_half_width, half_height].
/// Kinds: 0 pickup rectangle, 1 circular object, 2 camera rectangle.
#[wasm_bindgen(js_name = drawOwlOverlay)]
pub fn draw_owl_overlay(
    context: &CanvasRenderingContext2d,
    items: &Float64Array,
    item_count: u32,
    path: &Float64Array,
    path_count: u32,
    now_ms: f64,
    pulse: f64,
) -> Result<i32, JsValue> {
    if item_count > 2048
        || path_count > 4096
        || items.length() < item_count.saturating_mul(5)
        || path.length() < path_count.saturating_mul(2)
        || !now_ms.is_finite()
        || !pulse.is_finite()
        || !(0.0..=1.0).contains(&pulse)
    {
        return Ok(-1);
    }
    for index in 0..path_count {
        if !path.get_index(index * 2).is_finite() || !path.get_index(index * 2 + 1).is_finite() {
            return Ok(-1);
        }
    }

    context.save();
    let result = (|| -> Result<i32, JsValue> {
        let mut drawn = 0;
        context.set_stroke_style_str(&format!("rgba(176,107,255,{pulse})"));
        context.set_line_width(2.0);
        for index in 0..item_count {
            let offset = index * 5;
            let raw_kind = items.get_index(offset);
            if !raw_kind.is_finite() || raw_kind.fract() != 0.0 || !(0.0..=2.0).contains(&raw_kind)
            {
                continue;
            }
            let kind = raw_kind as u32;
            let x = items.get_index(offset + 1);
            let y = items.get_index(offset + 2);
            let rx = items.get_index(offset + 3);
            let ry = items.get_index(offset + 4);
            if ![x, y, rx, ry].iter().all(|value| value.is_finite()) || rx <= 0.0 {
                continue;
            }
            match kind {
                0 | 2 if ry > 0.0 => context.stroke_rect(x - rx, y - ry, rx * 2.0, ry * 2.0),
                1 => {
                    context.begin_path();
                    context.arc(x, y, rx, 0.0, std::f64::consts::TAU)?;
                    context.stroke();
                }
                _ => continue,
            }
            drawn += 1;
        }
        if path_count > 1 {
            let dash = Array::of2(&JsValue::from_f64(10.0), &JsValue::from_f64(8.0));
            context.set_line_dash(dash.as_ref())?;
            context.set_line_dash_offset(-now_ms / 40.0);
            context.begin_path();
            context.move_to(path.get_index(0), path.get_index(1));
            for index in 1..path_count {
                context.line_to(path.get_index(index * 2), path.get_index(index * 2 + 1));
            }
            context.stroke();
            drawn += 1;
        }
        Ok(drawn)
    })();
    context.restore();
    result
}

/// Draws optional collision and AI diagnostics. JS owns entity state and labels.
#[wasm_bindgen(js_name = drawDebugWorld)]
pub fn draw_debug_world(
    context: &CanvasRenderingContext2d,
    walls: &Float64Array,
    wall_count: u32,
    doors: &Float64Array,
    door_count: u32,
    player_x: f64,
    player_y: f64,
    player_radius: f64,
    show_collisions: bool,
    enemies: &Float64Array,
    labels: &Array,
    enemy_count: u32,
    show_ai: bool,
) -> Result<bool, JsValue> {
    if wall_count > 4096
        || door_count > 1024
        || enemy_count > 256
        || walls.length() < wall_count.saturating_mul(4)
        || doors.length() < door_count.saturating_mul(4)
        || enemies.length() < enemy_count.saturating_mul(6)
        || labels.length() < enemy_count
        || (show_collisions
            && (!player_x.is_finite()
                || !player_y.is_finite()
                || !player_radius.is_finite()
                || player_radius < 0.0))
    {
        return Ok(false);
    }
    for index in 0..wall_count * 4 {
        if !walls.get_index(index).is_finite() {
            return Ok(false);
        }
    }
    for index in 0..door_count * 4 {
        if !doors.get_index(index).is_finite() {
            return Ok(false);
        }
    }
    for index in 0..enemy_count {
        let offset = index * 6;
        let x = enemies.get_index(offset);
        let y = enemies.get_index(offset + 1);
        let radius = enemies.get_index(offset + 2);
        let has_target = enemies.get_index(offset + 3);
        let target_x = enemies.get_index(offset + 4);
        let target_y = enemies.get_index(offset + 5);
        if !x.is_finite()
            || !y.is_finite()
            || !radius.is_finite()
            || radius < 0.0
            || !has_target.is_finite()
            || !target_x.is_finite()
            || !target_y.is_finite()
            || labels
                .get(index)
                .as_string()
                .map_or(true, |label| label.len() > 160)
        {
            return Ok(false);
        }
    }

    if show_collisions {
        context.save();
        context.set_stroke_style_str("rgba(0,255,120,.8)");
        context.set_line_width(1.0);
        for index in 0..wall_count {
            let offset = index * 4;
            context.stroke_rect(
                walls.get_index(offset),
                walls.get_index(offset + 1),
                walls.get_index(offset + 2),
                walls.get_index(offset + 3),
            );
        }
        context.set_stroke_style_str("rgba(255,210,63,.9)");
        for index in 0..door_count {
            let offset = index * 4;
            context.stroke_rect(
                doors.get_index(offset),
                doors.get_index(offset + 1),
                doors.get_index(offset + 2),
                doors.get_index(offset + 3),
            );
        }
        context.set_stroke_style_str("#19f0e6");
        context.begin_path();
        context.arc(player_x, player_y, player_radius, 0.0, 6.3)?;
        context.stroke();
        context.restore();
    }
    if show_ai {
        context.save();
        context.set_font("11px monospace");
        context.set_text_align("center");
        for index in 0..enemy_count {
            let offset = index * 6;
            let x = enemies.get_index(offset);
            let y = enemies.get_index(offset + 1);
            let radius = enemies.get_index(offset + 2);
            let has_target = enemies.get_index(offset + 3) != 0.0;
            context.set_stroke_style_str("rgba(255,46,147,.7)");
            context.begin_path();
            context.arc(x, y, radius, 0.0, 6.3)?;
            context.stroke();
            if has_target {
                context.set_stroke_style_str("rgba(255,210,63,.6)");
                context.begin_path();
                context.move_to(x, y);
                context.line_to(enemies.get_index(offset + 4), enemies.get_index(offset + 5));
                context.stroke();
            }
            context.set_fill_style_str("#fff");
            context.fill_text(&labels.get(index).as_string().unwrap(), x, y - radius - 6.0)?;
        }
        context.restore();
    }
    Ok(true)
}

/// Rasterizes the already-positioned fog sprites without routing drawImage through host JS.
#[wasm_bindgen(js_name = drawFog)]
pub fn draw_fog(
    context: &CanvasRenderingContext2d,
    image: &JsValue,
    commands: &Float64Array,
    count: u32,
    alpha: f64,
    smoke: bool,
) -> Result<i32, JsValue> {
    if count > 3
        || commands.length() < count.saturating_mul(4)
        || !supported_image(image)
        || !alpha.is_finite()
        || !(0.0..=1.0).contains(&alpha)
    {
        return Ok(-1);
    }
    for index in 0..count * 4 {
        if !commands.get_index(index).is_finite() {
            return Ok(-1);
        }
    }
    context.save();
    context.set_global_alpha(alpha);
    context.set_global_composite_operation(if smoke { "source-over" } else { "lighter" })?;
    for index in 0..count {
        let offset = index * 4;
        if let Err(error) = draw_image_at(
            context,
            image,
            &[
                commands.get_index(offset),
                commands.get_index(offset + 1),
                commands.get_index(offset + 2),
                commands.get_index(offset + 3),
            ],
        ) {
            context.restore();
            return Err(error);
        }
    }
    context.restore();
    Ok(count as i32)
}

/// Computes the three drifting fog/smoke sprites and paints them directly from simulation time.
#[wasm_bindgen(js_name = drawFogInputs)]
pub fn draw_fog_inputs(
    context: &CanvasRenderingContext2d,
    image: &JsValue,
    now_ms: f64,
    smoke: bool,
    perf_tier: f64,
) -> Result<i32, JsValue> {
    if !supported_image(image)
        || !now_ms.is_finite()
        || now_ms < 0.0
        || !perf_tier.is_finite()
        || perf_tier < 0.0
    {
        return Ok(-1);
    }
    if perf_tier >= 2.0 {
        return Ok(0);
    }
    let alpha = if smoke { 0.16 } else { 0.13 };
    let base_y = if smoke { -(now_ms / 90.0 % 120.0) } else { 0.0 };
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        context.set_global_alpha(alpha);
        context.set_global_composite_operation(if smoke { "source-over" } else { "lighter" })?;
        for index in 0..3usize {
            let x = (now_ms / (60.0 + index as f64 * 25.0) + index as f64 * 330.0) % 1400.0 - 440.0;
            let y = base_y + index as f64 * 170.0 - 40.0;
            draw_image_at(context, image, &[x, y, 920.0, 460.0])?;
        }
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(3)
}

/// Computes pulse/flicker light commands and paints them directly, preserving JS-owned light state.
#[wasm_bindgen(js_name = drawWorldLightInputs)]
pub fn draw_world_light_inputs(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    images: &Array,
    metadata: &Float64Array,
    flash_image: &JsValue,
) -> Result<i32, JsValue> {
    const LIGHT_STRIDE: u32 = 5;
    if input.length() % LIGHT_STRIDE != 0
        || input.length() / LIGHT_STRIDE > 6
        || metadata.length() != 8
    {
        return Ok(-1);
    }
    let count = input.length() / LIGHT_STRIDE;
    if images.length() != count {
        return Ok(-1);
    }
    let values = input.to_vec();
    let meta = metadata.to_vec();
    let (now_ms, dim, neon, stride, player_x, player_y, fire_flash, rain_reflection) = (
        meta[0], meta[1], meta[2], meta[3], meta[4], meta[5], meta[6], meta[7],
    );
    if !now_ms.is_finite()
        || now_ms < 0.0
        || !dim.is_finite()
        || !(0.0..=1.0).contains(&dim)
        || !(neon == 0.0 || neon == 1.0)
        || !(stride == 1.0 || stride == 2.0)
        || !player_x.is_finite()
        || !player_y.is_finite()
        || !(fire_flash == 0.0 || fire_flash == 1.0)
        || !(rain_reflection == 0.0 || rain_reflection == 1.0)
    {
        return Ok(-1);
    }
    for (index, light) in values.chunks_exact(LIGHT_STRIDE as usize).enumerate() {
        if !light[0].is_finite()
            || !light[1].is_finite()
            || !light[2].is_finite()
            || light[2] <= 0.0
            || !light[3].is_finite()
            || !(light[4] == 0.0 || light[4] == 1.0)
        {
            return Ok(-1);
        }
        if light[4] == 1.0
            && index % stride as usize == 0
            && !supported_image(&images.get(index as u32))
        {
            return Ok(-1);
        }
    }
    if fire_flash == 1.0 && !supported_image(flash_image) {
        return Ok(-1);
    }
    let mut drawn = 0;
    context.save();
    let painted_lights = (|| -> Result<(), JsValue> {
        context.set_global_composite_operation("lighter")?;
        for (index, light) in values.chunks_exact(LIGHT_STRIDE as usize).enumerate() {
            if light[4] != 1.0 || index % stride as usize != 0 {
                continue;
            }
            let pulse = 0.55 + 0.45 * js_sys::Math::sin(now_ms / 520.0 + light[3]);
            let flicker = if neon == 1.0 && js_sys::Math::sin(now_ms / 90.0 + light[3] * 9.0) > 0.97
            {
                0.4
            } else {
                1.0
            };
            context.set_global_alpha(0.22 * pulse * flicker * dim);
            draw_image_at(
                context,
                &images.get(index as u32),
                &[
                    light[0] - light[2],
                    light[1] - light[2],
                    light[2] * 2.0,
                    light[2] * 2.0,
                ],
            )?;
            drawn += 1;
        }
        if fire_flash == 1.0 {
            context.set_global_alpha(1.0);
            draw_image_at(
                context,
                flash_image,
                &[player_x - 90.0, player_y - 90.0, 180.0, 180.0],
            )?;
            drawn += 1;
        }
        Ok(())
    })();
    context.restore();
    painted_lights?;
    if rain_reflection == 1.0 {
        context.save();
        let painted_reflection = (|| -> Result<(), JsValue> {
            context.set_global_alpha(0.12);
            context.set_fill_style_str("#9ad1ff");
            context.begin_path();
            context.ellipse(
                player_x,
                player_y + 14.0,
                14.0,
                5.0,
                0.0,
                0.0,
                6.283185307179586,
            )?;
            context.fill();
            Ok(())
        })();
        context.restore();
        painted_reflection?;
        drawn += 1;
    }
    Ok(drawn)
}

/// Computes each active ring's pulse and paints it without legacy command generation.
#[wasm_bindgen(js_name = drawWorldRingInputs)]
pub fn draw_world_ring_inputs(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 6;
    const MAX_RINGS: u32 = 14;
    if input.length() % STRIDE != 0
        || input.length() / STRIDE > MAX_RINGS
        || colors.length() > MAX_RINGS
    {
        return Ok(-1);
    }
    let values = input.to_vec();
    if values.chunks_exact(STRIDE as usize).any(|ring| {
        !ring[0].is_finite()
            || !ring[1].is_finite()
            || !ring[2].is_finite()
            || ring[2] < 0.0
            || !ring[3].is_finite()
            || ring[3] <= 0.0
            || !ring[4].is_finite()
            || ring[4] <= 0.0
            || ring[3] / ring[4] > 1.0
            || !ring[5].is_finite()
            || ring[5] < 0.0
            || ring[5].fract() != 0.0
            || ring[5] >= colors.length() as f64
    }) {
        return Ok(-1);
    }
    for ring in values.chunks_exact(STRIDE as usize) {
        let color = colors
            .get(ring[5] as u32)
            .as_string()
            .ok_or_else(|| JsValue::from_str("world ring color missing"))?;
        let progress = 1.0 - ring[3] / ring[4];
        let radius = ring[2] * (0.25 + 0.75 * progress);
        let line_width = 6.0 * (1.0 - progress) + 1.0;
        let alpha = ring[3] / ring[4];
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.set_global_alpha(alpha);
            context.set_stroke_style_str(&color);
            context.set_line_width(line_width);
            context.begin_path();
            context.arc(ring[0], ring[1], radius, 0.0, 6.283185307179586)?;
            context.stroke();
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE as usize) as i32)
}

/// Draws the pulsing invasion-zone ring and fill from its six computed command values.
#[wasm_bindgen(js_name = drawInvasionZone)]
pub fn draw_invasion_zone(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
) -> Result<bool, JsValue> {
    if commands.length() < 6 {
        return Ok(false);
    }
    let x = commands.get_index(0);
    let y = commands.get_index(1);
    let radius = commands.get_index(2);
    let stroke_alpha = commands.get_index(3);
    let line_width = commands.get_index(4);
    let fill_alpha = commands.get_index(5);
    if !x.is_finite()
        || !y.is_finite()
        || !radius.is_finite()
        || radius < 0.0
        || !stroke_alpha.is_finite()
        || !(0.0..=1.0).contains(&stroke_alpha)
        || !line_width.is_finite()
        || line_width < 0.0
        || !fill_alpha.is_finite()
        || !(0.0..=1.0).contains(&fill_alpha)
    {
        return Ok(false);
    }
    context.save();
    context.set_stroke_style_str(&format!("rgba(255,107,213,{stroke_alpha})"));
    context.set_line_width(line_width);
    context.begin_path();
    context.arc(x, y, radius, 0.0, 6.283185307179586)?;
    context.stroke();
    context.set_fill_style_str(&format!("rgba(255,107,213,{fill_alpha})"));
    context.fill();
    context.restore();
    Ok(true)
}

fn invasion_zone_sine(value: f64) -> f64 {
    const PI: f64 = 3.141592653589793;
    const TAU: f64 = 6.283185307179586;
    let mut x = value % TAU;
    if x > PI {
        x -= TAU;
    }
    if x < -PI {
        x += TAU;
    }
    let x2 = x * x;
    x * (1.0
        + x2 * (-1.0 / 6.0
            + x2 * (1.0 / 120.0
                + x2 * (-1.0 / 5040.0 + x2 * (1.0 / 362880.0 + x2 * (-1.0 / 39916800.0))))))
}

/// Computes and paints the pulsing Invasion marker without the legacy geometry batch.
#[wasm_bindgen(js_name = drawInvasionZoneInput)]
pub fn draw_invasion_zone_input(
    context: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    now_ms: f64,
) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() || !now_ms.is_finite() || now_ms < 0.0 {
        return Ok(false);
    }
    let pulse = 0.5 + 0.5 * invasion_zone_sine(now_ms / 260.0);
    let commands = Float64Array::new_with_length(6);
    commands.set_index(0, x);
    commands.set_index(1, y);
    commands.set_index(2, 34.0);
    commands.set_index(3, 0.5 + 0.4 * pulse);
    commands.set_index(4, 4.0);
    commands.set_index(5, 0.14);
    draw_invasion_zone(context, &commands)
}

/// Builds the dark overlay with direct Canvas calls on both offscreen and screen contexts.
#[wasm_bindgen(js_name = drawDarkOverlay)]
pub fn draw_dark_overlay(
    dark_context: &CanvasRenderingContext2d,
    screen_context: &CanvasRenderingContext2d,
    overlay: &JsValue,
    core: &JsValue,
    far: &JsValue,
    flash: &JsValue,
    commands: &Float64Array,
) -> Result<bool, JsValue> {
    if commands.length() < 8
        || !supported_image(overlay)
        || !supported_image(core)
        || !supported_image(far)
        || !supported_image(flash)
    {
        return Ok(false);
    }
    let sx = commands.get_index(0);
    let sy = commands.get_index(1);
    let angle = commands.get_index(2);
    let core_radius = commands.get_index(3);
    let far_radius = commands.get_index(4);
    let flash_radius = commands.get_index(5);
    let blackout = commands.get_index(6);
    let fire_flash = commands.get_index(7);
    if !sx.is_finite()
        || !sy.is_finite()
        || !angle.is_finite()
        || !core_radius.is_finite()
        || core_radius < 0.0
        || !far_radius.is_finite()
        || far_radius < 0.0
        || !flash_radius.is_finite()
        || flash_radius < 0.0
        || !(blackout == 0.0 || blackout == 1.0)
        || !(fire_flash == 0.0 || fire_flash == 1.0)
    {
        return Ok(false);
    }

    dark_context.set_global_composite_operation("source-over")?;
    dark_context.clear_rect(0.0, 0.0, 960.0, 600.0);
    dark_context.set_fill_style_str(if blackout == 1.0 {
        "rgba(2,0,10,.95)"
    } else {
        "rgba(3,0,12,.88)"
    });
    dark_context.fill_rect(0.0, 0.0, 960.0, 600.0);
    dark_context.set_global_composite_operation("destination-out")?;
    if let Err(error) = draw_image_at(
        dark_context,
        core,
        &[
            sx - core_radius,
            sy - core_radius,
            core_radius * 2.0,
            core_radius * 2.0,
        ],
    ) {
        return Err(error);
    }
    dark_context.save();
    let cone = (|| -> Result<(), JsValue> {
        dark_context.begin_path();
        dark_context.move_to(sx, sy);
        dark_context.arc(sx, sy, far_radius, angle - 0.38, angle + 0.38)?;
        dark_context.close_path();
        dark_context.clip();
        draw_image_at(
            dark_context,
            far,
            &[
                sx - far_radius,
                sy - far_radius,
                far_radius * 2.0,
                far_radius * 2.0,
            ],
        )?;
        Ok(())
    })();
    dark_context.restore();
    cone?;
    if fire_flash == 1.0 {
        draw_image_at(
            dark_context,
            flash,
            &[
                sx - flash_radius,
                sy - flash_radius,
                flash_radius * 2.0,
                flash_radius * 2.0,
            ],
        )?;
    }
    draw_image_at(screen_context, overlay, &[0.0, 0.0, 960.0, 600.0])?;
    Ok(true)
}

/// Projects player/world coordinates and paints the blackout mask without legacy command generation.
#[wasm_bindgen(js_name = drawDarkOverlayInputs)]
pub fn draw_dark_overlay_inputs(
    dark_context: &CanvasRenderingContext2d,
    screen_context: &CanvasRenderingContext2d,
    overlay: &JsValue,
    core: &JsValue,
    far: &JsValue,
    flash: &JsValue,
    player_x: f64,
    player_y: f64,
    camera_x: f64,
    camera_y: f64,
    screen_w: f64,
    screen_h: f64,
    zoom: f64,
    angle: f64,
    blackout: bool,
    fire_flash: bool,
) -> Result<bool, JsValue> {
    let values = [
        player_x, player_y, camera_x, camera_y, screen_w, screen_h, zoom, angle,
    ];
    if values.iter().any(|value| !value.is_finite())
        || screen_w <= 0.0
        || screen_h <= 0.0
        || zoom <= 0.0
    {
        return Ok(false);
    }
    let screen_x = (player_x - camera_x - screen_w / 2.0) * zoom + screen_w / 2.0;
    let screen_y = (player_y - camera_y - screen_h / 2.0) * zoom + screen_h / 2.0;
    let commands = Float64Array::new_with_length(8);
    commands.set_index(0, screen_x);
    commands.set_index(1, screen_y);
    commands.set_index(2, angle);
    commands.set_index(3, 150.0 * zoom);
    commands.set_index(4, 330.0 * zoom);
    commands.set_index(5, 260.0 * zoom);
    commands.set_index(6, if blackout { 1.0 } else { 0.0 });
    commands.set_index(7, if fire_flash { 1.0 } else { 0.0 });
    draw_dark_overlay(
        dark_context,
        screen_context,
        overlay,
        core,
        far,
        flash,
        &commands,
    )
}

/// Draws muzzle flashes and short impact arcs from prepared effect commands.
#[wasm_bindgen(js_name = drawFx)]
pub fn draw_fx(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
) -> Result<i32, JsValue> {
    draw_fx_commands(context, commands)
}

/// Draws effect inputs directly, without a command-generation pass in the legacy WASM module.
#[wasm_bindgen(js_name = drawFxInputs)]
pub fn draw_fx_inputs(
    context: &CanvasRenderingContext2d,
    inputs: &Float64Array,
) -> Result<i32, JsValue> {
    draw_fx_commands(context, inputs)
}

fn draw_fx_commands(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
) -> Result<i32, JsValue> {
    if commands.length() % 6 != 0 || commands.length() > 8192 {
        return Ok(-1);
    }
    let count = commands.length() / 6;
    for index in 0..count {
        let offset = index * 6;
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let time = commands.get_index(offset + 2);
        let radius = commands.get_index(offset + 3);
        let angle = commands.get_index(offset + 4);
        let muzzle = commands.get_index(offset + 5);
        if !x.is_finite()
            || !y.is_finite()
            || !time.is_finite()
            || !radius.is_finite()
            || radius < 0.0
            || !angle.is_finite()
            || !(muzzle == 0.0 || muzzle == 1.0)
        {
            return Ok(-1);
        }
    }
    for index in 0..count {
        let offset = index * 6;
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let time = commands.get_index(offset + 2);
        let radius = commands.get_index(offset + 3);
        let angle = commands.get_index(offset + 4);
        let muzzle = commands.get_index(offset + 5) == 1.0;
        if muzzle {
            context.save();
            let draw_result = (|| -> Result<(), JsValue> {
                context.set_global_composite_operation("lighter")?;
                context.set_global_alpha((time * 10.0).max(0.0));
                let gradient = context.create_radial_gradient(x, y, 0.0, x, y, radius)?;
                gradient.add_color_stop(0.0, "#ffffff")?;
                gradient.add_color_stop(0.35, "#ffd23f")?;
                gradient.add_color_stop(1.0, "rgba(255,100,40,0)")?;
                context.set_fill_style_canvas_gradient(&gradient);
                context.begin_path();
                context.arc(x, y, radius, 0.0, 6.28)?;
                context.fill();
                Ok(())
            })();
            context.restore();
            draw_result?;
        } else {
            context.set_stroke_style_str("#fff");
            context.set_line_width(4.0);
            context.begin_path();
            context.arc(x, y, radius, angle - 1.2, angle + 1.2)?;
            context.stroke();
        }
    }
    Ok(count as i32)
}

/// Draws projected shell casings from commands emitted by the legacy Rust pass.
/// Each row contains screen x/y, horizontal/vertical radii, and rotation.
#[wasm_bindgen(js_name = drawShells)]
pub fn draw_shells(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    count: u32,
) -> Result<i32, JsValue> {
    if count > 8192 || commands.length() < count.saturating_mul(5) {
        return Ok(-1);
    }
    context.save();
    context.set_global_alpha(0.72);
    context.set_fill_style_str("#d8c8a2");
    context.begin_path();
    let mut drawn = 0i32;
    for index in 0..count {
        let offset = index * 5;
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let radius_x = commands.get_index(offset + 2);
        let radius_y = commands.get_index(offset + 3);
        let rotation = commands.get_index(offset + 4);
        if !x.is_finite()
            || !y.is_finite()
            || !radius_x.is_finite()
            || !radius_y.is_finite()
            || !rotation.is_finite()
            || radius_x < 0.0
            || radius_y < 0.0
        {
            continue;
        }
        context.ellipse(
            x,
            y,
            radius_x,
            radius_y,
            rotation,
            0.0,
            core::f64::consts::TAU,
        )?;
        drawn += 1;
    }
    context.fill();
    context.restore();
    Ok(drawn)
}

/// Projects world-space shell inputs and paints them without the legacy WASM command batch.
#[wasm_bindgen(js_name = drawShellInputs)]
pub fn draw_shell_inputs(
    context: &CanvasRenderingContext2d,
    inputs: &Float64Array,
    camera_x: f64,
    camera_y: f64,
) -> Result<i32, JsValue> {
    if inputs.length() % 3 != 0
        || inputs.length() > 24576
        || !camera_x.is_finite()
        || !camera_y.is_finite()
    {
        return Ok(-1);
    }
    let count = inputs.length() / 3;
    context.save();
    let painted = (|| -> Result<i32, JsValue> {
        context.set_global_alpha(0.72);
        context.set_fill_style_str("#d8c8a2");
        context.begin_path();
        let mut drawn = 0i32;
        for index in 0..count {
            let offset = index * 3;
            let x = inputs.get_index(offset);
            let y = inputs.get_index(offset + 1);
            let radius = inputs.get_index(offset + 2);
            if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 {
                continue;
            }
            context.ellipse(
                x - camera_x,
                y - camera_y,
                radius * 1.6,
                radius,
                0.5,
                0.0,
                core::f64::consts::TAU,
            )?;
            drawn += 1;
        }
        context.fill();
        Ok(drawn)
    })();
    context.restore();
    painted
}

/// Draws the outlined combo multiplier using the browser's current font rasterizer.
#[wasm_bindgen(js_name = drawComboText)]
pub fn draw_combo_text(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    label: &str,
) -> Result<bool, JsValue> {
    if commands.length() != 2 {
        return Ok(false);
    }
    let pulse = commands.get_index(0);
    let combo = commands.get_index(1);
    if !pulse.is_finite()
        || pulse <= 0.0
        || pulse > 2.0
        || !combo.is_finite()
        || combo <= 1.0
        || label.is_empty()
        || label.len() > 64
    {
        return Ok(false);
    }
    context.save();
    let drawn = (|| -> Result<(), JsValue> {
        context.translate(34.0, 176.0)?;
        context.scale(pulse, pulse)?;
        context.set_font("bold 54px Impact, sans-serif");
        context.set_line_width(6.0);
        context.set_stroke_style_str("#1a0006");
        context.stroke_text(label, 0.0, 0.0)?;
        context.set_fill_style_str("#ff2e5b");
        context.fill_text(label, 0.0, 0.0)?;
        Ok(())
    })();
    context.restore();
    drawn?;
    Ok(true)
}

/// Draws the existing alarm status label using the browser's Canvas text rasterizer.
#[wasm_bindgen(js_name = drawAlarmText)]
pub fn draw_alarm_text(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    label: &str,
) -> Result<bool, JsValue> {
    if commands.length() != 3 || label.is_empty() || label.len() > 96 {
        return Ok(false);
    }
    let seconds = commands.get_index(0);
    let x = commands.get_index(1);
    let y = commands.get_index(2);
    if !seconds.is_finite() || seconds <= 0.0 || !x.is_finite() || !y.is_finite() {
        return Ok(false);
    }
    context.set_fill_style_str("rgba(255,60,90,.9)");
    context.set_font("bold 14px Orbitron, sans-serif");
    context.set_text_align("center");
    context.fill_text(label, x, y)?;
    Ok(true)
}

/// Draws one selected HUD image from an existing five-number layout command.
#[wasm_bindgen(js_name = drawHudImage)]
pub fn draw_hud_image(
    context: &CanvasRenderingContext2d,
    image: &JsValue,
    commands: &Float64Array,
) -> Result<bool, JsValue> {
    if commands.length() != 5 || !supported_image(image) {
        return Ok(false);
    }
    let index = commands.get_index(0);
    let x = commands.get_index(1);
    let y = commands.get_index(2);
    let width = commands.get_index(3);
    let height = commands.get_index(4);
    if !index.is_finite()
        || index.fract() != 0.0
        || !(0.0..=4.0).contains(&index)
        || !x.is_finite()
        || !y.is_finite()
        || !width.is_finite()
        || !height.is_finite()
        || width <= 0.0
        || height <= 0.0
    {
        return Ok(false);
    }
    draw_image_at(context, image, &[x, y, width, height])?;
    Ok(true)
}

/// Draws cached projectile sprites at positions emitted by the legacy Rust pass.
#[wasm_bindgen(js_name = drawBullets)]
pub fn draw_bullets(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    mine: &JsValue,
    foe: &JsValue,
) -> Result<i32, JsValue> {
    if commands.length() % 3 != 0
        || commands.length() > 24576
        || !supported_image(mine)
        || !supported_image(foe)
    {
        return Ok(-1);
    }
    let count = commands.length() / 3;
    for index in 0..count {
        let offset = index * 3;
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let owner = commands.get_index(offset + 2);
        if !x.is_finite() || !y.is_finite() || !(owner == 0.0 || owner == 1.0) {
            return Ok(-1);
        }
    }
    for index in 0..count {
        let offset = index * 3;
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let image = if commands.get_index(offset + 2) == 1.0 {
            mine
        } else {
            foe
        };
        draw_image_at(context, image, &[x, y])?;
    }
    Ok(count as i32)
}

/// Draws world-simulation projectile inputs directly, preserving owner sprite and centered offset.
#[wasm_bindgen(js_name = drawBulletInputs)]
pub fn draw_bullet_inputs(
    context: &CanvasRenderingContext2d,
    inputs: &Float64Array,
    mine: &JsValue,
    foe: &JsValue,
) -> Result<i32, JsValue> {
    if inputs.length() % 3 != 0
        || inputs.length() > 24576
        || !supported_image(mine)
        || !supported_image(foe)
    {
        return Ok(-1);
    }
    let count = inputs.length() / 3;
    let mut drawn = 0i32;
    for index in 0..count {
        let offset = index * 3;
        let x = inputs.get_index(offset);
        let y = inputs.get_index(offset + 1);
        let owner = inputs.get_index(offset + 2);
        if !x.is_finite() || !y.is_finite() {
            continue;
        }
        let image = if owner >= 0.5 { mine } else { foe };
        draw_image_at(context, image, &[x - 22.0, y - 14.0])?;
        drawn += 1;
    }
    Ok(drawn)
}

/// Applies the two existing full-screen color-grade passes directly through Rust/WASM.
#[wasm_bindgen(js_name = drawColorGrade)]
pub fn draw_color_grade(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
) -> Result<bool, JsValue> {
    if !width.is_finite()
        || !height.is_finite()
        || width <= 0.0
        || height <= 0.0
        || width > 8192.0
        || height > 8192.0
    {
        return Ok(false);
    }
    context.save();
    let drawn = (|| -> Result<(), JsValue> {
        context.set_global_composite_operation("soft-light")?;
        context.set_fill_style_str("rgba(255, 80, 140, 0.07)");
        context.fill_rect(0.0, 0.0, width, height);
        context.set_global_composite_operation("overlay")?;
        context.set_fill_style_str("rgba(40, 200, 220, 0.04)");
        context.fill_rect(0.0, 0.0, width, height);
        Ok(())
    })();
    context.restore();
    drawn?;
    Ok(true)
}

/// Draws the existing end-of-frame fade and optional flash passes through Rust/WASM.
#[wasm_bindgen(js_name = drawFinalOverlays)]
pub fn draw_final_overlays(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
    fade: f64,
    flash: f64,
    flash_enabled: bool,
) -> Result<bool, JsValue> {
    if !width.is_finite()
        || !height.is_finite()
        || !fade.is_finite()
        || !flash.is_finite()
        || width <= 0.0
        || height <= 0.0
        || width > 8192.0
        || height > 8192.0
        || fade < 0.0
        || flash < 0.0
    {
        return Ok(false);
    }
    context.save();
    let drawn = (|| -> Result<(), JsValue> {
        if fade > 0.0 {
            context.set_fill_style_str(&format!("rgba(8,0,20,{fade})"));
            context.fill_rect(0.0, 0.0, width, height);
        }
        if flash > 0.0 && flash_enabled {
            context.set_fill_style_str(&format!("rgba(255,46,147,{})", flash * 0.5));
            context.fill_rect(0.0, 0.0, width, height);
        }
        Ok(())
    })();
    context.restore();
    drawn?;
    Ok(true)
}

/// Rasterizes the existing stair/elevator command batch directly through WebSys.
#[wasm_bindgen(js_name = drawTransportCommands)]
pub fn draw_transport_commands(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    stair: &JsValue,
    elevator: &JsValue,
    door_left: &JsValue,
    door_right: &JsValue,
) -> Result<i32, JsValue> {
    if commands.length() % 8 != 0 || commands.length() > 4096 {
        return Ok(-1);
    }
    let count = commands.length() / 8;
    for index in 0..count {
        let offset = index * 8;
        let op = commands.get_index(offset);
        if !op.is_finite() || op.fract() != 0.0 || !(0.0..=11.0).contains(&op) {
            return Ok(-1);
        }
        for component in 1..8 {
            if !commands.get_index(offset + component).is_finite() {
                return Ok(-1);
            }
        }
        let variant = commands.get_index(offset + 5) != 0.0;
        if op == 1.0 && !supported_image(stair)
            || op == 5.0 && !supported_image(elevator)
            || op == 6.0
                && !(if variant {
                    supported_image(door_right)
                } else {
                    supported_image(door_left)
                })
        {
            return Ok(-1);
        }
    }

    let mut save_depth = 0u32;
    for index in 0..count {
        let offset = index * 8;
        let op = commands.get_index(offset) as u32;
        let x = commands.get_index(offset + 1);
        let y = commands.get_index(offset + 2);
        let w = commands.get_index(offset + 3);
        let h = commands.get_index(offset + 4);
        let variant = commands.get_index(offset + 5) != 0.0;
        let alpha = commands.get_index(offset + 6);
        let line_width = commands.get_index(offset + 7);
        match op {
            0 => {
                context.save();
                save_depth += 1;
                context.set_fill_style_str("rgba(0,0,0,.32)");
                context.fill_rect(x, y, w, h);
            }
            1 => {
                let _ = draw_image_at(context, stair, &[x, y, w, h])?;
                context.set_shadow_color("transparent");
            }
            2 => {
                context.set_fill_style_str(if variant { "#a9a9c4" } else { "#7a7a98" });
                context.fill_rect(x, y, w, h);
            }
            3 => {
                context.set_fill_style_str("rgba(255,255,255,.35)");
                context.fill_rect(x, y, w, h);
            }
            4 => {
                context.set_fill_style_str("#ffd23f");
                context.fill_rect(x, y, w, h);
            }
            5 => {
                let _ = draw_image_at(context, elevator, &[x, y, w, h])?;
                context.set_shadow_color("transparent");
            }
            6 => {
                let image = if variant { door_right } else { door_left };
                let _ = draw_image_at(context, image, &[x, y, w, h])?;
            }
            7 => {
                context.set_fill_style_str("#4b5a6b");
                context.fill_rect(x, y, w, h);
            }
            8 => {
                context.set_fill_style_str("#0b1218");
                context.fill_rect(x, y, w, h);
            }
            9 => {
                context.set_fill_style_str(if variant { "#7CFF8A" } else { "#ffb347" });
                context.begin_path();
                if variant {
                    context.move_to(x, y + 4.0);
                    context.line_to(x + 3.0, y + 9.0);
                    context.line_to(x - 3.0, y + 9.0);
                } else {
                    context.move_to(x, y + 9.0);
                    context.line_to(x + 3.0, y + 4.0);
                    context.line_to(x - 3.0, y + 4.0);
                }
                context.fill();
            }
            10 | 11 => {
                context.set_stroke_style_str("#19f0e6");
                context.set_global_alpha(alpha);
                context.set_line_width(line_width);
                context.stroke_rect(x, y, w, h);
                if op == 11 {
                    context.set_global_alpha(1.0);
                    context.set_line_width(line_width);
                    context.stroke_rect(x, y, w, h);
                    if save_depth > 0 {
                        context.restore();
                        save_depth -= 1;
                    }
                }
            }
            _ => return Ok(-1),
        }
    }
    while save_depth > 0 {
        context.restore();
        save_depth -= 1;
    }
    Ok(count as i32)
}

/// Builds and paints one stair/elevator directly, without asking the legacy renderer for commands.
#[wasm_bindgen(js_name = drawTransportDirect)]
pub fn draw_transport_direct(
    context: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    kind: u32,
    up: bool,
    stair: &JsValue,
    elevator: &JsValue,
    door_left: &JsValue,
    door_right: &JsValue,
) -> Result<bool, JsValue> {
    if ![x, y, width, height].iter().all(|value| value.is_finite())
        || width <= 0.0 || height <= 0.0 || width > 660.0 || height > 660.0 || kind > 1
        || (kind == 0 && !supported_image(stair))
        || (kind == 1 && (!supported_image(elevator) || !supported_image(door_left) || !supported_image(door_right)))
    {
        return Ok(false);
    }
    let mut commands = Vec::with_capacity(if kind == 0 { 18 * 8 } else { 9 * 8 });
    let mut push = |op: f64, px: f64, py: f64, w: f64, h: f64, variant: f64, alpha: f64, line_width: f64| {
        commands.extend_from_slice(&[op, px, py, w, h, variant, alpha, line_width]);
    };
    push(0.0, x - 2.0, y + 2.0, width + 4.0, height + 4.0, 0.0, 1.0, 0.0);
    if kind == 0 {
        push(1.0, x, y, width, height, 0.0, 1.0, 0.0);
        for step in 0..6 {
            let step_y = y + 4.0 + step as f64 * 6.3;
            push(2.0, x + 6.0, step_y, width - 12.0, 4.5, (step % 2) as f64, 1.0, 0.0);
            push(3.0, x + 6.0, step_y, width - 12.0, 1.0, 0.0, 1.0, 0.0);
        }
        push(4.0, x + 2.0, y + 2.0, 2.5, height - 4.0, 0.0, 1.0, 0.0);
        push(4.0, x + width - 4.5, y + 2.0, 2.5, height - 4.0, 0.0, 1.0, 0.0);
    } else {
        let center_x = x + width / 2.0;
        push(5.0, x, y, width, height, 0.0, 1.0, 0.0);
        push(6.0, x + 5.0, y + 12.0, width / 2.0 - 6.0, height - 16.0, 0.0, 1.0, 0.0);
        push(6.0, center_x + 1.0, y + 12.0, width / 2.0 - 6.0, height - 16.0, 1.0, 1.0, 0.0);
        push(7.0, center_x - 1.0, y + 12.0, 2.0, height - 16.0, 0.0, 1.0, 0.0);
        push(8.0, x + 8.0, y + 3.0, width - 16.0, 7.0, 0.0, 1.0, 0.0);
        push(9.0, center_x, y, 0.0, 0.0, if up { 1.0 } else { 0.0 }, 1.0, 0.0);
    }
    push(10.0, x + 1.0, y + 1.0, width - 2.0, height - 2.0, 0.0, 0.28, 7.0);
    push(11.0, x + 1.0, y + 1.0, width - 2.0, height - 2.0, 0.0, 1.0, 2.0);
    let commands = Float64Array::from(commands.as_slice());
    let drawn = draw_transport_commands(context, &commands, stair, elevator, door_left, door_right)?;
    Ok(drawn as u32 == commands.length() / 8)
}

/// Rasterizes the existing exit glow, gradient, hatches, and borders directly in Rust/WASM.
#[wasm_bindgen(js_name = drawExitCommands)]
pub fn draw_exit_commands(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    gradient: &JsValue,
    pulse: f64,
    cleared: bool,
    bloom: bool,
) -> Result<i32, JsValue> {
    if commands.length() % 6 != 0
        || commands.length() > 2048
        || !pulse.is_finite()
        || !(0.0..=1.0).contains(&pulse)
    {
        return Ok(-1);
    }
    let count = commands.length() / 6;
    for index in 0..count {
        let offset = index * 6;
        let op = commands.get_index(offset);
        if !op.is_finite() || op.fract() != 0.0 || !(0.0..=6.0).contains(&op) {
            return Ok(-1);
        }
        for component in 1..6 {
            if !commands.get_index(offset + component).is_finite() {
                return Ok(-1);
            }
        }
        if op == 2.0 && !supported_image(gradient) {
            return Ok(-1);
        }
    }

    context.save();
    let mut clip_saved = false;
    let drawn = (|| -> Result<(), JsValue> {
        for index in 0..count {
            let offset = index * 6;
            let op = commands.get_index(offset) as u32;
            let x1 = commands.get_index(offset + 1);
            let y1 = commands.get_index(offset + 2);
            let x2 = commands.get_index(offset + 3);
            let y2 = commands.get_index(offset + 4);
            let width = commands.get_index(offset + 5);
            match op {
                0 => {
                    if bloom {
                        context.set_shadow_color(if cleared { "#19f0e6" } else { "#ff2e93" });
                        context.set_shadow_blur(if cleared { 18.0 + 10.0 * pulse } else { 10.0 });
                    }
                    context.set_stroke_style_str(if cleared {
                        "rgba(25,240,230,.55)"
                    } else {
                        "rgba(255,46,147,.4)"
                    });
                    context.set_line_width(3.0);
                    context.stroke_rect(x1, y1, x2, y2);
                    context.set_shadow_blur(0.0);
                }
                1 => {
                    context.save();
                    clip_saved = true;
                    context.begin_path();
                    context.rect(x1, y1, x2, y2);
                    context.clip();
                }
                2 => {
                    let previous_alpha = context.global_alpha();
                    if cleared {
                        context.set_global_alpha(
                            (if previous_alpha.is_finite() {
                                previous_alpha
                            } else {
                                1.0
                            }) * (1.0 + pulse)
                                / 2.0,
                        );
                    }
                    let result = draw_image_at(context, gradient, &[x1, y1, x2 - x1, y2 - y1]);
                    if cleared {
                        context.set_global_alpha(previous_alpha);
                    }
                    let _ = result?;
                }
                3 => {
                    context.set_stroke_style_str(if cleared {
                        "rgba(255,255,255,.28)"
                    } else {
                        "rgba(0,0,0,.3)"
                    });
                    context.set_line_width(7.0);
                    context.begin_path();
                    context.move_to(x1, y1);
                    context.line_to(x2, y2);
                    context.stroke();
                }
                4 => {
                    if clip_saved {
                        context.restore();
                        clip_saved = false;
                    }
                }
                5 => {
                    context.set_stroke_style_str(if cleared { "#19f0e6" } else { "#ff2e93" });
                    context.set_global_alpha(0.35);
                    context.set_line_width(width);
                    context.stroke_rect(x1, y1, x2, y2);
                }
                6 => {
                    context.set_global_alpha(1.0);
                    context.set_line_width(width);
                    context.stroke_rect(x1, y1, x2, y2);
                }
                _ => return Err(JsValue::from_str("invalid exit painter command")),
            }
        }
        Ok(())
    })();
    if clip_saved {
        context.restore();
    }
    context.restore();
    drawn?;
    Ok(count as i32)
}

/// Builds and paints a phase exit directly, without asking the legacy renderer for commands.
#[wasm_bindgen(js_name = drawExitDirect)]
pub fn draw_exit_direct(
    context: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    pulse: f64,
    cleared: bool,
    bloom: bool,
    gradient: &JsValue,
) -> Result<bool, JsValue> {
    if ![x, y, width, height, pulse].iter().all(|value| value.is_finite())
        || width <= 0.0 || height <= 0.0 || width > 660.0 || height > 660.0
        || !(0.0..=1.0).contains(&pulse) || !supported_image(gradient)
    {
        return Ok(false);
    }
    let mut commands = Vec::with_capacity(32 * 6);
    commands.extend_from_slice(&[0.0, x - 2.0, y - 2.0, width + 4.0, height + 4.0, if bloom { 1.0 } else { 0.0 }]);
    commands.extend_from_slice(&[1.0, x, y, width, height, 0.0]);
    commands.extend_from_slice(&[2.0, x, y, x + width, y + height, 0.0]);
    let mut diagonal = -height;
    while diagonal < width + height && commands.len() / 6 < 28 {
        commands.extend_from_slice(&[3.0, x + diagonal, y + height, x + diagonal + height, y, 0.0]);
        diagonal += 22.0;
    }
    commands.extend_from_slice(&[4.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    commands.extend_from_slice(&[5.0, x + 1.0, y + 1.0, width - 2.0, height - 2.0, 8.0]);
    commands.extend_from_slice(&[6.0, x + 1.0, y + 1.0, width - 2.0, height - 2.0, 2.5]);
    let count = commands.len() / 6;
    let commands = Float64Array::from(commands.as_slice());
    let drawn = draw_exit_commands(context, &commands, gradient, pulse, cleared, bloom)?;
    Ok(drawn >= 0 && drawn as usize == count)
}

fn weapon_fill(
    context: &CanvasRenderingContext2d,
    colors: &Array,
    index: u32,
) -> Result<(), JsValue> {
    let color = colors
        .get(index)
        .as_string()
        .ok_or_else(|| JsValue::from_str("weapon fill palette entry is missing"))?;
    context.set_fill_style_str(&color);
    Ok(())
}

fn weapon_stroke(
    context: &CanvasRenderingContext2d,
    colors: &Array,
    index: u32,
) -> Result<(), JsValue> {
    let color = colors
        .get(index)
        .as_string()
        .ok_or_else(|| JsValue::from_str("weapon stroke palette entry is missing"))?;
    context.set_stroke_style_str(&color);
    Ok(())
}

/// Paints static furniture directly from compact records, bypassing the legacy command generator.
#[wasm_bindgen(js_name = drawFurniture)]
pub fn draw_furniture_direct(
    context: &CanvasRenderingContext2d,
    items: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: usize = 6;
    const MAX_ITEMS: usize = 8192;
    if items.length() as usize % STRIDE != 0
        || items.length() as usize / STRIDE > MAX_ITEMS
        || colors.length() < 59
    { return Ok(-1); }
    let values = items.to_vec();
    if values.iter().any(|value| !value.is_finite()) { return Ok(-1); }
    for row in values.chunks_exact(STRIDE) {
        if row[2] <= 0.0 || row[3] <= 0.0 || row[4] < 1.0 || row[4] > 17.0
            || row[4] != row[4].floor() || row[5] < 0.0 || row[5] != row[5].floor()
        { return Ok(-1); }
    }
    let fill = |index: u32| -> Result<(), JsValue> {
        let color = colors.get(index).as_string().ok_or_else(|| JsValue::from_str("furniture fill color missing"))?;
        context.set_fill_style_str(&color); Ok(())
    };
    let stroke = |index: u32| -> Result<(), JsValue> {
        let color = colors.get(index).as_string().ok_or_else(|| JsValue::from_str("furniture stroke color missing"))?;
        context.set_stroke_style_str(&color); Ok(())
    };
    let rect = |x: f64, y: f64, w: f64, h: f64| { context.fill_rect(x, y, w, h); };
    let outline = |x: f64, y: f64, w: f64, h: f64| { context.stroke_rect(x, y, w, h); };
    for row in values.chunks_exact(STRIDE) {
        let (x, y, w, h) = (row[0], row[1], row[2], row[3]);
        let kind = row[4] as u32;
        let variant = (row[5] as u32).min(2);
        let hz = w >= h;
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.set_shadow_color("rgba(0,0,0,.28)");
            context.set_shadow_blur(5.0);
            context.set_shadow_offset_x(1.0);
            context.set_shadow_offset_y(2.0);
            context.set_line_width(2.0);
            let box_draw = |fill_index: u32, stroke_index: u32| -> Result<(), JsValue> {
                fill(fill_index)?; rect(x, y, w, h); stroke(stroke_index)?; outline(x + 1.0, y + 1.0, w - 2.0, h - 2.0); Ok(())
            };
            match kind {
                1 => { box_draw(0,1)?; fill(2)?; if hz {rect(x+4.0,y+5.0,14.0,h-10.0)} else {rect(x+5.0,y+4.0,w-10.0,14.0)}; fill(3+variant)?; if hz {rect(x+24.0,y+4.0,w-28.0,h-8.0)} else {rect(x+4.0,y+24.0,w-8.0,h-28.0)}; }
                2 => { box_draw(6,7)?; fill(8)?; rect(x+6.0,y+6.0,w-12.0,h-12.0); fill(9)?; if hz {rect(x+4.0,y+h/2.0-3.0,w-8.0,6.0)} else {rect(x+w/2.0-3.0,y+4.0,6.0,h-8.0)}; }
                3 => { box_draw(10,11)?; fill(12)?; rect(x+5.0,y+5.0,w-10.0,h-10.0); }
                4 => { box_draw(13,14)?; let length=if hz {w}else{h}; let mut i=4.0; let mut k=0u32; while i+30.0<=length { let px=if hz{x+i}else{x+5.0}; let py=if hz{y+5.0}else{y+i}; let size=if hz{30.0_f64.min(h-10.0)}else{30.0_f64.min(w-10.0)}; if k%2==0 {fill(15)?;rect(px,py,size,size);fill(16)?;for (ax,ay) in [(0.28,0.28),(0.72,0.28),(0.28,0.72),(0.72,0.72)] {context.begin_path();context.arc(px+size*ax,py+size*ay,3.0,0.0,6.28)?;context.fill();}} else {fill(17)?;rect(px,py,size,size);fill(18)?;rect(px+4.0,py+4.0,size-8.0,size-8.0);} i+=38.0;k+=1; } }
                5 => { fill(19)?;rect(x,y,w,h);stroke(14)?;outline(x+1.0,y+1.0,w-2.0,h-2.0);fill(20)?;context.begin_path();context.ellipse(x+w/2.0,y+h/2.0+2.0,w/2.0-4.0,h/2.0-5.0,0.0,0.0,6.28)?;context.fill(); }
                6 => { box_draw(19,14)?;fill(21)?;context.begin_path();context.arc(x+w/2.0,y+h/2.0,w.min(h)/2.0-4.0,0.0,6.28)?;context.fill(); }
                7 => { box_draw(22,14)?;fill(23)?;rect(x+6.0,y+6.0,w-12.0,h-12.0);fill(18)?;context.begin_path();if hz{context.arc(x+12.0,y+h/2.0,3.0,0.0,6.28)?}else{context.arc(x+w/2.0,y+12.0,3.0,0.0,6.28)?};context.fill(); }
                8 => { fill(24)?;for i in 0..6 {let (cx,sy)=match i{0=>(1.0,0.0),1=>(0.5403023058681398,0.8414709848078965),2=>(-0.4161468365471424,0.9092974268256817),3=>(-0.9899924966004454,0.1411200080598672),4=>(-0.6536436208636119,-0.7568024953079282),_=>(0.28366218546322625,-0.9589242746631385)};context.begin_path();context.arc(x+w/2.0+cx*7.0,y+h/2.0+sy*7.0,8.0,0.0,6.28)?;context.fill();}fill(25)?;context.begin_path();context.arc(x+w/2.0,y+h/2.0,7.0,0.0,6.28)?;context.fill(); }
                9 => { box_draw(26,27)?;fill(28)?;if hz{rect(x+4.0,y+4.0,w-8.0,h*0.55)}else{rect(x+4.0,y+4.0,w*0.55,h-8.0)};stroke(27)?;context.begin_path();if hz{let mut i=x+30.0;while i<x+w-8.0{context.move_to(i,y+4.0);context.line_to(i,y+h-4.0);i+=30.0;}}else{let mut i=y+30.0;while i<y+h-8.0{context.move_to(x+4.0,i);context.line_to(x+w-4.0,i);i+=30.0;}}context.stroke(); }
                10 => { fill(29)?;for(ax,ay)in[(0.0,-1.0),(0.0,1.0),(-1.0,0.0),(1.0,0.0)]{context.begin_path();context.arc(x+w/2.0+ax*(w/2.0+2.0),y+h/2.0+ay*(h/2.0+2.0),7.0,0.0,6.28)?;context.fill();}fill(30)?;context.begin_path();context.ellipse(x+w/2.0,y+h/2.0,w/2.0,h/2.0,0.0,0.0,6.28)?;context.fill();stroke(31)?;context.stroke(); }
                11 => { box_draw(32,33)?;stroke(33)?;context.set_line_width(4.0);outline(x+2.0,y+2.0,w-4.0,h-4.0);context.set_line_width(2.0);fill(34)?;rect(x+w/2.0-6.0,y+h/2.0-4.0,12.0,8.0);fill(35)?;rect(x+w/4.0,y+h/2.0-3.0,6.0,6.0); }
                12 => { box_draw(36,37)?;fill(38)?;if hz{rect(x+4.0,y+5.0,w*0.45,h-10.0)}else{rect(x+5.0,y+4.0,w-10.0,h*0.45)};fill(39)?;if hz{rect(x+w*0.6,y+h/2.0-3.0,8.0,6.0)}else{rect(x+w/2.0-3.0,y+h*0.65,6.0,8.0)}; }
                13 => { box_draw(40,41)?;fill(42)?;rect(x+5.0,y+5.0,w-10.0,h-10.0);fill(34)?;context.begin_path();context.arc(x+w/2.0,y+h/2.0,3.0,0.0,6.28)?;context.fill();fill(43)?;for(cx,cy)in[(x+4.0,y+4.0),(x+w-4.0,y+4.0),(x+4.0,y+h-4.0),(x+w-4.0,y+h-4.0)]{context.begin_path();context.arc(cx,cy,3.0,0.0,6.28)?;context.fill();} }
                14 => { box_draw(44,45)?;fill(46)?;if hz{rect(x+4.0,y+4.0,w-8.0,h*0.35)}else{rect(x+4.0,y+4.0,w*0.35,h-8.0)}; }
                15 => { box_draw(47,48)?;fill(49)?;rect(x+8.0,y+8.0,w-16.0,h-16.0);stroke(50)?;context.begin_path();context.move_to(x+8.0,y+8.0);context.line_to(x+w-8.0,y+h-8.0);context.move_to(x+w-8.0,y+8.0);context.line_to(x+8.0,y+h-8.0);context.stroke();fill(51)?;for(ax,ay)in[(0.45,0.45),(0.55,0.4),(0.5,0.55)]{context.begin_path();context.arc(x+w*ax,y+h*ay,w.min(h)*0.07,0.0,6.28)?;context.fill();} }
                16 => { fill(52)?;rect(x,y,w,h);fill(53)?;rect(x+4.0,y+4.0,w-8.0,h-8.0);fill(54)?;rect(x+4.0,y+4.0,w-8.0,(h-8.0)/3.0);stroke(55)?;context.set_line_width(3.0);outline(x+1.0,y+1.0,w-2.0,h-2.0); }
                17 => { box_draw(56,57)?;context.begin_path();context.move_to(x+3.0,y+3.0);context.line_to(x+w-3.0,y+h-3.0);context.move_to(x+w-3.0,y+3.0);context.line_to(x+3.0,y+h-3.0);stroke(58)?;context.stroke(); }
                _ => return Err(JsValue::from_str("invalid furniture kind")),
            }
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE) as i32)
}

#[inline]
fn player_frame_ellipse(x: f64, y: f64, cx: f64, cy: f64, rx: f64, ry: f64) -> bool {
    ((x - cx) / rx).powi(2) + ((y - cy) / ry).powi(2) <= 1.0
}

#[inline]
fn player_frame_put(pixels: &mut [u8; 24 * 24 * 4], x: f64, y: f64, color: u32) {
    let px = (x + 0.5).floor() as i32;
    let py = (y + 0.5).floor() as i32;
    if (0..24).contains(&px) && (0..24).contains(&py) {
        let offset = ((py * 24 + px) * 4) as usize;
        pixels[offset] = color as u8;
        pixels[offset + 1] = (color >> 8) as u8;
        pixels[offset + 2] = (color >> 16) as u8;
        pixels[offset + 3] = (color >> 24) as u8;
    }
}

/// Builds the game's procedural 24x24 player frame in the supplied ImageData bytes.
/// Gameplay timing and the host-computed animation sine remain owned by JavaScript.
#[wasm_bindgen(js_name = drawPlayerFrameRgba)]
pub fn draw_player_frame_rgba(
    output: &Uint8ClampedArray,
    palette_input: &Uint32Array,
    state: u32,
    _phase: u32,
    attack_frame: u32,
    sine: f64,
) -> Result<bool, JsValue> {
    if output.length() != 24 * 24 * 4 || palette_input.length() != 12 || state > 3 || !sine.is_finite() {
        return Ok(false);
    }
    let palette = palette_input.to_vec();
    let mut pixels = [0_u8; 24 * 24 * 4];
    const C: f64 = 11.5;
    let sw = sine;
    let mut arm_l = 0.0; let mut arm_r = 0.0; let mut legs = 0.0; let mut lean = 0.0; let mut hit = 0.0;
    if state == 1 { arm_l = sw * 2.6; arm_r = -sw * 2.6; legs = sw * 2.2; }
    if state == 2 { arm_l = sw * 4.0; arm_r = -sw * 4.0; legs = sw * 3.6; lean = 1.5; }
    if state == 3 { hit = 1.0 - attack_frame.min(3) as f64 / 3.0; }
    for pair in 0..2 {
        let (sx, sy, offset) = if pair == 0 { (C - 7.0, C - 4.0, legs) } else { (C - 7.0, C + 4.0, -legs) };
        for y in -2..=2 { for x in -2..=2 {
            if player_frame_ellipse(x as f64, y as f64, 0.0, 0.0, 2.0, 1.5) && (x as f64).abs() < 3.0 {
                player_frame_put(&mut pixels, sx + x as f64, sy + y as f64 + offset * 0.5, palette[11]);
            }
        }}
    }
    for side in [-1_i32, 1_i32] {
        let (ax, ay) = if side < 0 { (C - 1.0 + arm_l * 0.4 + lean, C - 8.0) }
            else { (C - 1.0 + arm_r * 0.4 + lean + if state == 3 { 4.0 + hit * 4.0 } else { 0.0 }, C + 8.0 - if state == 3 { 2.0 * hit } else { 0.0 }) };
        for y in 0..24 { for x in 0..24 {
            let rx = if state == 3 && side > 0 { 4.2 } else { 3.4 };
            if player_frame_ellipse(x as f64, y as f64, ax, ay, rx, 2.3) { player_frame_put(&mut pixels, x as f64, y as f64, palette[2]); }
        }}
        let hx = ax + if side > 0 && state == 3 { 4.0 } else { 2.6 };
        for y in 0..24 { for x in 0..24 {
            if player_frame_ellipse(x as f64, y as f64, hx, ay, 1.7, 1.7) { player_frame_put(&mut pixels, x as f64, y as f64, palette[9]); }
        }}
    }
    for y in 0..24 { for x in 0..24 {
        if player_frame_ellipse(x as f64, y as f64, C - 1.5 + lean, C, 6.2, 8.2) {
            let highlight = player_frame_ellipse(x as f64, y as f64, C - 2.5, C - 3.0, 3.0, 3.0);
            let shadow = (x as f64) < C - 3.5;
            player_frame_put(&mut pixels, x as f64, y as f64, if highlight { palette[3] } else if shadow { palette[2] } else { palette[1] });
        }
    }}
    let mut y = C - 3.0; while y <= C + 3.0 { let mut x = C + 2.0; while x <= C + 4.0 {
        player_frame_put(&mut pixels, x, y, if x == C + 4.0 { palette[5] } else { palette[4] }); x += 1.0;
    } y += 1.0; }
    y = C - 1.0; while y <= C + 3.0 { player_frame_put(&mut pixels, C + 3.0, y, palette[6]); y += 1.0; }
    y = C; while y <= C + 3.0 { player_frame_put(&mut pixels, C + 4.0, y, palette[7]); y += 1.0; }
    y = C - 5.0; while y <= C - 3.0 { player_frame_put(&mut pixels, C + 5.0, y, palette[2]); y += 1.0; }
    y = C + 3.0; while y <= C + 5.0 { player_frame_put(&mut pixels, C + 5.0, y, palette[2]); y += 1.0; }
    let head_x = C + 6.0 + lean;
    for yy in 0..24 { for xx in 0..24 {
        if player_frame_ellipse(xx as f64, yy as f64, head_x, C, 3.7, 3.9) { player_frame_put(&mut pixels, xx as f64, yy as f64, palette[9]); }
    }}
    for yy in 0..24 { for xx in 0..24 {
        if player_frame_ellipse(xx as f64, yy as f64, head_x, C, 3.7, 3.9) && ((xx as f64) < head_x - 0.8 || (yy as f64) < C - 2.0) {
            player_frame_put(&mut pixels, xx as f64, yy as f64, palette[8]);
        }
    }}
    player_frame_put(&mut pixels, head_x + 2.0, C + 1.0, palette[10]);
    player_frame_put(&mut pixels, head_x + 1.0, C + 2.0, palette[10]);
    let mut outline = [0_u8; 24 * 24];
    for y in 0..24_i32 { for x in 0..24_i32 {
        let idx = (y * 24 + x) as usize;
        if pixels[idx * 4 + 3] != 0 { continue; }
        'neighbors: for dy in -1..=1 { for dx in -1..=1 {
            let xx = x + dx; let yy = y + dy;
            if xx >= 0 && yy >= 0 && xx < 24 && yy < 24 {
                let neighbor = (yy * 24 + xx) as usize;
                if pixels[neighbor * 4 + 3] != 0 { outline[idx] = 1; break 'neighbors; }
            }
        }}
    }}
    for i in 0..24 * 24 { if outline[i] != 0 { player_frame_put(&mut pixels, (i % 24) as f64, (i / 24) as f64, palette[0]); } }
    output.copy_from(&pixels);
    Ok(true)
}

/// Composes live players directly, preserving host-owned state and sprite assets.
#[wasm_bindgen(js_name = drawPlayers)]
pub fn draw_players_direct(
    context: &CanvasRenderingContext2d,
    items: &Float64Array,
    player_sheet: &JsValue,
    player_frames: &Array,
    skin_colors: &Array,
    furniture_colors: &Array,
    actor_colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: usize = 8;
    const MAX_PLAYERS: usize = 3;
    if items.length() as usize % STRIDE != 0 || items.length() as usize / STRIDE > MAX_PLAYERS
        || furniture_colors.length() <= 107 || actor_colors.length() <= 9
    { return Ok(-1); }
    let values = items.to_vec();
    let count = values.len() / STRIDE;
    if player_frames.length() < count as u32 || skin_colors.length() < (count * 2) as u32
        || values.iter().any(|value| !value.is_finite())
    { return Ok(-1); }
    let has_sheet = !player_sheet.is_null() && !player_sheet.is_undefined();
    if has_sheet && !supported_image(player_sheet) { return Ok(-1); }
    for (index, row) in values.chunks_exact(STRIDE).enumerate() {
        if row[5] < 0.0 || row[5] > 3.0 || row[5] != row[5].floor()
            || row[6] < 0.0 || row[6] > 15.0 || row[6] != row[6].floor()
            || row[7] < 0.0 || row[7] > 24.0 || row[7] != row[7].floor()
        { return Ok(-1); }
        if !has_sheet {
            let frame = player_frames.get(index as u32);
            if !supported_image(&frame) { return Ok(-1); }
        }
        if has_sheet && (row[6] as u32 & 8) != 0
            && (skin_colors.get(index as u32 * 2).as_string().is_none()
                || skin_colors.get(index as u32 * 2 + 1).as_string().is_none())
        { return Ok(-1); }
    }
    for (index, row) in values.chunks_exact(STRIDE).enumerate() {
        let x = row[0]; let y = row[1]; let angle = row[2];
        let animation = row[3]; let attack_remaining = row[4];
        let state = row[5] as u32; let flags = row[6] as u32; let weapon = row[7] as u32;
        let is_p2 = flags & 1 != 0;
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.translate(x, y)?;
            context.rotate(angle)?;
            let shadow_color = furniture_colors.get(if flags & 2 != 0 { 104 } else { 105 }).as_string()
                .ok_or_else(|| JsValue::from_str("player shadow color missing"))?;
            context.set_fill_style_str(&shadow_color);
            context.begin_path();
            if flags & 2 != 0 { context.ellipse(2.0, 5.0, 13.0, 8.0, 0.0, 0.0, 6.28)?; }
            else { context.ellipse(1.0, 3.0, 11.0, 9.0, 0.0, 0.0, 6.28)?; }
            context.fill();
            if flags & 4 != 0 {
                let glow_color = furniture_colors.get(if is_p2 { 107 } else { 106 }).as_string()
                    .ok_or_else(|| JsValue::from_str("player glow color missing"))?;
                context.set_fill_style_str(&glow_color);
                context.begin_path(); context.ellipse(0.0, 0.0, 16.0, 16.0, 0.0, 0.0, 6.28)?; context.fill();
            }
            if weapon > 0 && weapon <= 23 { draw_weapon_icon_direct(context, weapon, furniture_colors)?; }
            context.set_image_smoothing_enabled(true);
            if has_sheet {
                let (column, row) = match state {
                    0 => (0, 0),
                    1 | 2 => {
                        let cycle = (animation % 6.283 + 6.283) % 6.283;
                        ((cycle / 6.283 * 4.0).floor() as u32 % 4, if state == 1 { 1 } else { 2 })
                    }
                    3 => (if attack_remaining > 0.13 { 0 } else if attack_remaining > 0.06 { 1 } else { 2 }, 3),
                    _ => (0, 0),
                };
                draw_image_at(context, player_sheet, &[
                    column as f64 * 24.0, row as f64 * 24.0, 24.0, 24.0, -11.5, -11.5, 24.0, 24.0,
                ])?;
                if flags & 8 != 0 {
                    context.set_global_alpha(0.78);
                    context.set_fill_style_str(&skin_colors.get(index as u32 * 2).as_string().unwrap());
                    context.fill_rect(-4.0, -2.0, 6.0, 7.0);
                    context.set_fill_style_str(&skin_colors.get(index as u32 * 2 + 1).as_string().unwrap());
                    context.fill_rect(1.0, -2.0, 2.0, 7.0);
                    context.set_global_alpha(1.0);
                }
            } else {
                draw_image_at(context, &player_frames.get(index as u32), &[-11.5, -11.5])?;
            }
            context.rotate(-angle)?;
            let tag_color = actor_colors.get(if is_p2 { 9 } else { 3 }).as_string()
                .ok_or_else(|| JsValue::from_str("player tag color missing"))?;
            context.set_fill_style_str(&tag_color);
            context.set_font("bold 10px Rajdhani,sans-serif");
            context.set_text_align("center");
            context.fill_text(if is_p2 { "P2" } else { "P1" }, 0.0, -18.0)?;
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok(count as i32)
}

/// Composes player afterimages directly from host-owned motion samples.
#[wasm_bindgen(js_name = drawGhosts)]
pub fn draw_ghosts_direct(
    context: &CanvasRenderingContext2d,
    items: &Float64Array,
    weapon: u32,
    furniture_colors: &Array,
    actor_colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: usize = 4;
    const MAX_GHOSTS: usize = 5;
    if items.length() as usize % STRIDE != 0
        || items.length() as usize / STRIDE > MAX_GHOSTS
        || weapon > 24
        || furniture_colors.length() <= 102
        || actor_colors.length() <= 10
    { return Ok(-1); }
    let values = items.to_vec();
    if values.iter().any(|value| !value.is_finite())
        || values.chunks_exact(STRIDE).any(|row| row[3] <= 0.0)
    { return Ok(-1); }
    let actor_color = |index: u32| actor_colors.get(index).as_string()
        .ok_or_else(|| JsValue::from_str("ghost palette entry missing"));
    let shadow_color = actor_color(10)?;
    for row in values.chunks_exact(STRIDE) {
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.set_global_alpha(row[3]);
            context.set_fill_style_str(&shadow_color);
            context.begin_path();
            context.ellipse(row[0] + 3.0, row[1] + 5.0, 12.0, 10.0, 0.0, 0.0, 6.28)?;
            context.fill();
            context.translate(row[0], row[1])?;
            context.rotate(row[2])?;
            if weapon > 0 { draw_weapon_icon_direct(context, weapon, furniture_colors)?; }

            context.set_fill_style_str(&actor_color(1)?);
            context.set_stroke_style_str(&actor_color(2)?);
            context.set_line_width(1.5);
            context.begin_path(); context.ellipse(3.0, -11.0, 4.5, 3.0, 0.25, 0.0, 6.28)?;
            context.fill(); context.stroke();
            context.begin_path(); context.ellipse(3.0, 11.0, 4.5, 3.0, -0.25, 0.0, 6.28)?;
            context.fill(); context.stroke();

            context.set_fill_style_str(&actor_color(3)?);
            context.set_global_alpha(row[3] * 0.25);
            context.begin_path(); context.ellipse(0.0, 0.0, 13.0, 18.0, 0.0, 0.0, 6.28)?; context.fill();
            context.set_global_alpha(row[3]);
            context.begin_path(); context.ellipse(0.0, 0.0, 9.0, 14.0, 0.0, 0.0, 6.28)?; context.fill();
            context.set_stroke_style_str(&actor_color(2)?);
            context.set_line_width(2.0);
            context.begin_path(); context.ellipse(0.0, 0.0, 9.0, 14.0, 0.0, 0.0, 6.28)?; context.stroke();

            context.set_fill_style_str(&actor_color(6)?);
            context.begin_path(); context.ellipse(-2.0, -4.0, 4.0, 6.0, 0.0, 0.0, 6.28)?; context.fill();
            context.set_fill_style_str(&actor_color(7)?);
            context.fill_rect(1.0, -14.0, 5.0, 3.0);
            context.fill_rect(1.0, 11.0, 5.0, 3.0);
            context.set_fill_style_str(&actor_color(1)?);
            context.begin_path(); context.arc(0.0, 0.0, 8.0, 0.0, 6.28)?; context.fill();
            context.set_fill_style_str(&actor_color(8)?);
            context.begin_path(); context.arc(-2.0, 0.0, 7.0, 1.6, 4.7)?; context.fill();
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE) as i32)
}

/// Filters and composes visible enemy shadows, bodies, stun marks, and cached labels directly.
#[wasm_bindgen(js_name = drawEnemies)]
pub fn draw_enemies_direct(
    context: &CanvasRenderingContext2d,
    items: &Float64Array,
    player_x: f64,
    player_y: f64,
    enemy_sheet: &JsValue,
    now_ms: f64,
    actor_colors: &Array,
    text_images: &Array,
    text_placements: &Float64Array,
    text_offsets: &Uint32Array,
) -> Result<i32, JsValue> {
    const STRIDE: usize = 6;
    const MAX_ENEMIES: usize = 8192;
    if items.length() as usize % STRIDE != 0
        || items.length() as usize / STRIDE > MAX_ENEMIES
        || text_offsets.length() != (items.length() as usize / STRIDE + 1) as u32
        || text_placements.length() % 3 != 0
        || actor_colors.length() <= 8
        || !player_x.is_finite() || !player_y.is_finite() || !now_ms.is_finite()
    { return Ok(-1); }
    let values = items.to_vec();
    if values.chunks_exact(STRIDE).any(|row| {
        !row.iter().all(|value| value.is_finite())
            || row[4] < 3.0 || row[4] > 5.0 || row[4] != row[4].floor()
            || row[5] < 0.0 || row[5] > 63.0 || row[5] != row[5].floor()
    }) { return Ok(-1); }
    let placements = text_placements.to_vec();
    if placements.iter().any(|value| !value.is_finite()) { return Ok(-1); }
    let mut previous = 0;
    for index in 0..text_offsets.length() {
        let value = text_offsets.get_index(index);
        if value < previous || value as usize > placements.len() / 3 { return Ok(-1); }
        previous = value;
    }
    if previous as usize != placements.len() / 3 { return Ok(-1); }
    for row in placements.chunks_exact(3) {
        let image_index = row[0];
        if image_index < 0.0 || image_index >= text_images.length() as f64 || image_index.fract() != 0.0
            || !supported_image(&text_images.get(image_index as u32))
        { return Ok(-1); }
    }
    let has_sheet = !enemy_sheet.is_null() && !enemy_sheet.is_undefined();
    if has_sheet && !supported_image(enemy_sheet) { return Ok(-1); }
    let actor_color = |index: u32| actor_colors.get(index).as_string()
        .ok_or_else(|| JsValue::from_str("enemy palette entry missing"));
    let mut visible = 0_i32;
    for (index, row) in values.chunks_exact(STRIDE).enumerate() {
        let x = row[0]; let y = row[1];
        if (x - player_x).abs() >= 900.0 || (y - player_y).abs() >= 700.0 { continue; }
        let angle = row[2]; let fall = row[3]; let color = row[4] as u32; let flags = row[5] as u32;
        let has_type = flags & 1 != 0; let knockout = flags & 2 != 0;
        let stunned = flags & 4 != 0; let moving = flags & 8 != 0;
        let alpha = if knockout { 0.55 } else { 1.0 };

        context.save();
        let drawn = (|| -> Result<(), JsValue> {
            context.set_global_alpha(alpha);
            context.set_fill_style_str("rgba(0,0,0,.32)");
            context.begin_path(); context.ellipse(x + 3.0, y + 5.0, 12.0, 10.0, 0.0, 0.0, 6.28)?; context.fill();
            context.translate(x, y)?;
            context.rotate(angle)?;
            if fall != 0.0 { context.rotate(fall * 1.45)?; }
            context.set_fill_style_str(&actor_color(0)?);
            context.fill_rect(4.0, -3.0, 22.0, 6.0);
            if has_sheet && has_type {
                let frame = if moving { ((now_ms / 110.0).floor() as u32) % 4 } else { 0 };
                context.set_image_smoothing_enabled(true);
                draw_image_at(context, enemy_sheet, &[
                    frame as f64 * 24.0, if moving { 24.0 } else { 0.0 }, 24.0, 24.0,
                    -11.5, -11.5, 24.0, 24.0,
                ])?;
            } else {
                context.set_fill_style_str(&actor_color(1)?);
                context.set_stroke_style_str(&actor_color(2)?);
                context.set_line_width(1.5);
                context.begin_path(); context.ellipse(3.0, -11.0, 4.5, 3.0, 0.25, 0.0, 6.28)?; context.fill(); context.stroke();
                context.begin_path(); context.ellipse(3.0, 11.0, 4.5, 3.0, -0.25, 0.0, 6.28)?; context.fill(); context.stroke();
                context.set_fill_style_str(&actor_color(color)?);
                context.set_global_alpha(alpha * 0.25);
                context.begin_path(); context.ellipse(0.0, 0.0, 13.0, 18.0, 0.0, 0.0, 6.28)?; context.fill();
                context.set_global_alpha(alpha);
                context.begin_path(); context.ellipse(0.0, 0.0, 9.0, 14.0, 0.0, 0.0, 6.28)?; context.fill();
                context.set_stroke_style_str(&actor_color(2)?);
                context.set_line_width(2.0);
                context.begin_path(); context.ellipse(0.0, 0.0, 9.0, 14.0, 0.0, 0.0, 6.28)?; context.stroke();
                context.set_fill_style_str(&actor_color(6)?);
                context.begin_path(); context.ellipse(-2.0, -4.0, 4.0, 6.0, 0.0, 0.0, 6.28)?; context.fill();
                context.set_fill_style_str(&actor_color(7)?);
                context.fill_rect(1.0, -14.0, 5.0, 3.0); context.fill_rect(1.0, 11.0, 5.0, 3.0);
                context.set_fill_style_str(&actor_color(1)?);
                context.begin_path(); context.arc(0.0, 0.0, 8.0, 0.0, 6.28)?; context.fill();
                context.set_fill_style_str(&actor_color(8)?);
                context.begin_path(); context.arc(-2.0, 0.0, 7.0, 1.6, 4.7)?; context.fill();
            }
            Ok(())
        })();
        context.restore();
        drawn?;

        if !knockout && stunned {
            context.save();
            let stun_drawn = (|| -> Result<(), JsValue> {
                context.set_fill_style_str("#ffd23f");
                let time = now_ms / 180.0;
                for i in 0..3 {
                    let phase = time + i as f64 * 2.09;
                    let cx = x + enemy_sin_approx(phase + 1.5707963267948966) * 9.0;
                    let cy = y - 22.0 + enemy_sin_approx(phase) * 3.0;
                    context.set_global_alpha(0.3);
                    context.begin_path(); context.arc(cx, cy, 5.0, 0.0, 6.28)?; context.fill();
                    context.set_global_alpha(1.0);
                    context.begin_path(); context.arc(cx, cy, 2.5, 0.0, 6.28)?; context.fill();
                }
                Ok(())
            })();
            context.restore();
            stun_drawn?;
        }
        let start = text_offsets.get_index(index as u32) as usize;
        let end = text_offsets.get_index(index as u32 + 1) as usize;
        for placement_index in start..end {
            let offset = placement_index * 3;
            let image = text_images.get(placements[offset] as u32);
            draw_image_at(context, &image, &[placements[offset + 1], placements[offset + 2]])?;
        }
        visible += 1;
    }
    Ok(visible)
}

#[inline]
fn enemy_sin_approx(value: f64) -> f64 {
    const PI: f64 = 3.141592653589793;
    const TAU: f64 = 6.283185307179586;
    let mut x = value % TAU;
    if x > PI { x -= TAU; }
    if x < -PI { x += TAU; }
    let x2 = x * x;
    x * (1.0 + x2 * (-1.0 / 6.0 + x2 * (1.0 / 120.0 + x2 * (-1.0 / 5040.0 + x2 * (1.0 / 362880.0 + x2 * (-1.0 / 39916800.0))))))
}

/// Draws standard room doors directly, without generating a legacy WASM command batch.
#[wasm_bindgen(js_name = drawDoors)]
pub fn draw_doors_direct(
    context: &CanvasRenderingContext2d,
    doors: &Float64Array,
    door_image: &JsValue,
    furniture_colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 6;
    const MAX_DOORS: u32 = 8192;
    if doors.length() % STRIDE != 0
        || doors.length() / STRIDE > MAX_DOORS
        || furniture_colors.length() <= 103
    {
        return Ok(-1);
    }
    let has_image = !door_image.is_null() && !door_image.is_undefined();
    if has_image && !supported_image(door_image) {
        return Ok(-1);
    }
    let fill = furniture_colors
        .get(103)
        .as_string()
        .ok_or_else(|| JsValue::from_str("door fill palette entry is missing"))?;
    let stroke = furniture_colors
        .get(38)
        .as_string()
        .ok_or_else(|| JsValue::from_str("door stroke palette entry is missing"))?;
    let mut values = Vec::with_capacity(doors.length() as usize);
    for index in 0..doors.length() {
        let value = doors.get_index(index);
        if !value.is_finite() {
            return Ok(-1);
        }
        values.push(value);
    }
    for offset in (0..values.len()).step_by(STRIDE as usize) {
        if values[offset + 5] != 0.0 && values[offset + 5] != 1.0 {
            return Ok(-1);
        }
    }
    for offset in (0..values.len()).step_by(STRIDE as usize) {
        let x = values[offset];
        let y = values[offset + 1];
        let width = values[offset + 2];
        let height = values[offset + 3];
        let angle = values[offset + 4];
        let vertical = values[offset + 5] == 1.0;
        let (px, py, local_x, local_y, local_w, local_h) = if vertical {
            (x + width / 2.0, y, -4.0, 0.0, 8.0, height)
        } else {
            (x, y + height / 2.0, 0.0, -4.0, width, 8.0)
        };
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.translate(px, py)?;
            context.rotate(angle)?;
            if has_image {
                context.set_image_smoothing_enabled(true);
                draw_image_at(context, door_image, &[local_x, local_y, local_w, local_h])?;
            } else {
                context.set_fill_style_str(&fill);
                context.fill_rect(local_x, local_y, local_w, local_h);
            }
            context.set_stroke_style_str(&stroke);
            context.set_global_alpha(0.28);
            context.set_line_width(5.0);
            context.stroke_rect(local_x + 0.5, local_y + 0.5, local_w - 1.0, local_h - 1.0);
            context.set_global_alpha(1.0);
            context.set_line_width(1.5);
            context.stroke_rect(local_x + 0.5, local_y + 0.5, local_w - 1.0, local_h - 1.0);
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE as usize) as i32)
}

/// Draws animated Neon door sprites and transforms without a legacy WASM batch.
#[wasm_bindgen(js_name = drawNeonDoors)]
pub fn draw_neon_doors_direct(
    context: &CanvasRenderingContext2d,
    doors: &Float64Array,
    sprite_images: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 6;
    const MAX_DOORS: u32 = 8192;
    if doors.length() % STRIDE != 0 || doors.length() / STRIDE > MAX_DOORS {
        return Ok(-1);
    }
    let mut values = Vec::with_capacity(doors.length() as usize);
    for index in 0..doors.length() {
        let value = doors.get_index(index);
        if !value.is_finite() {
            return Ok(-1);
        }
        values.push(value);
    }
    for offset in (0..values.len()).step_by(STRIDE as usize) {
        let sprite_index = values[offset + 5];
        if sprite_index.fract() != 0.0
            || sprite_index < 0.0
            || sprite_index >= sprite_images.length() as f64
        {
            return Ok(-1);
        }
        if !supported_image(&sprite_images.get(sprite_index as u32)) {
            return Ok(-1);
        }
    }
    for offset in (0..values.len()).step_by(STRIDE as usize) {
        let px = values[offset];
        let py = values[offset + 1];
        let angle = values[offset + 2];
        let ox = values[offset + 3];
        let oy = values[offset + 4];
        let sprite_index = values[offset + 5] as u32;
        let image = sprite_images.get(sprite_index);
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.translate(px, py)?;
            context.rotate(angle)?;
            draw_image_at(context, &image, &[-ox, -oy])?;
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE as usize) as i32)
}

/// Paints world barrels directly from live simulation records, without legacy command generation.
#[wasm_bindgen(js_name = drawWorldBarrels)]
pub fn draw_world_barrels_direct(
    context: &CanvasRenderingContext2d,
    barrels: &Float64Array,
    now_ms: f64,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 4;
    const MAX_BARRELS: u32 = 16;
    if barrels.length() % STRIDE != 0
        || barrels.length() / STRIDE > MAX_BARRELS
        || !now_ms.is_finite()
        || now_ms < 0.0
        || colors.length() <= 112
    {
        return Ok(-1);
    }
    let values = barrels.to_vec();
    if values.iter().any(|value| !value.is_finite())
        || values
            .chunks_exact(STRIDE as usize)
            .any(|row| row[2] <= 0.0)
    {
        return Ok(-1);
    }
    let color = |index: u32| {
        colors
            .get(index)
            .as_string()
            .ok_or_else(|| JsValue::from_str("barrel palette entry missing"))
    };
    let blinking = ((now_ms / 70.0) as u64) % 2 == 1;
    for row in values.chunks_exact(STRIDE as usize) {
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.translate(row[0], row[1])?;
            context.set_fill_style_str(&color(108)?);
            context.begin_path();
            context.arc(0.0, 0.0, row[2] + 5.0, 0.0, 6.283185307179586)?;
            context.fill();
            context.set_fill_style_str(&color(if row[3] >= 0.0 && blinking { 109 } else { 110 })?);
            context.begin_path();
            context.arc(0.0, 0.0, row[2], 0.0, 6.283185307179586)?;
            context.fill();
            context.set_fill_style_str(&color(111)?);
            context.fill_rect(-row[2] + 2.0, -6.5, row[2] * 2.0 - 4.0, 3.0);
            context.fill_rect(-row[2] + 2.0, 3.5, row[2] * 2.0 - 4.0, 3.0);
            context.set_stroke_style_str(&color(112)?);
            context.set_line_width(2.0);
            context.stroke();
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE as usize) as i32)
}

/// Paints camera cones, housings, and lenses directly from simulation records.
#[wasm_bindgen(js_name = drawWorldCameras)]
pub fn draw_world_cameras_direct(
    context: &CanvasRenderingContext2d,
    cameras: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 30;
    const MAX_CAMERAS: u32 = 8;
    if cameras.length() % STRIDE != 0
        || cameras.length() / STRIDE > MAX_CAMERAS
        || colors.length() <= 117
    {
        return Ok(-1);
    }
    let values = cameras.to_vec();
    if values.iter().any(|value| !value.is_finite())
        || values
            .chunks_exact(STRIDE as usize)
            .any(|row| row[3] != 0.0 && row[3] != 1.0)
    {
        return Ok(-1);
    }
    let color = |index: u32| {
        colors
            .get(index)
            .as_string()
            .ok_or_else(|| JsValue::from_str("camera palette entry missing"))
    };
    for row in values.chunks_exact(STRIDE as usize) {
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            let hot = row[3] == 1.0;
            context.set_fill_style_str(&color(if hot { 113 } else { 114 })?);
            context.begin_path();
            context.move_to(row[0], row[1]);
            for point in 0..13 {
                context.line_to(row[4 + point * 2], row[5 + point * 2]);
            }
            context.close_path();
            context.fill();
            context.translate(row[0], row[1])?;
            context.rotate(row[2])?;
            context.set_fill_style_str(&color(115)?);
            context.fill_rect(-7.0, -5.0, 14.0, 10.0);
            let edge = color(if hot { 117 } else { 116 })?;
            context.set_stroke_style_str(&edge);
            context.set_line_width(2.0);
            context.stroke_rect(-7.0, -5.0, 14.0, 10.0);
            context.set_fill_style_str(&edge);
            context.begin_path();
            context.arc(7.0, 0.0, 3.0, 0.0, 6.283185307179586)?;
            context.fill();
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE as usize) as i32)
}

#[inline]
fn renderer_sin_approx(value: f64) -> f64 {
    const PI: f64 = 3.141592653589793;
    const TAU: f64 = 6.283185307179586;
    let mut x = value % TAU;
    if x > PI {
        x -= TAU;
    }
    if x < -PI {
        x += TAU;
    }
    let x2 = x * x;
    x * (1.0
        + x2 * (-1.0 / 6.0
            + x2 * (1.0 / 120.0
                + x2 * (-1.0 / 5040.0 + x2 * (1.0 / 362880.0 + x2 * (-1.0 / 39916800.0))))))
}

/// Draws enemy class accents and telegraphs directly from the host-selected enemy records.
#[wasm_bindgen(js_name = drawWorldEnemyAccents)]
pub fn draw_world_enemy_accents_direct(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    count: u32,
    now_ms: f64,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 13;
    const MAX_ENEMIES: u32 = 256;
    if count > MAX_ENEMIES
        || input.length() != count * STRIDE
        || !now_ms.is_finite()
        || now_ms < 0.0
    {
        return Ok(-1);
    }
    let values = input.to_vec();
    if values.chunks_exact(STRIDE as usize).any(|row| {
        !row[0].is_finite()
            || !row[1].is_finite()
            || !row[2].is_finite()
            || row[2] <= 0.0
            || !row[3].is_finite()
            || row[3] < 0.0
            || row[3] > 3.0
            || row[3].fract() != 0.0
            || !row[4].is_finite()
            || !row[5].is_finite()
            || !row[6].is_finite()
            || (row[7] != 0.0 && row[7] != 1.0)
            || (row[8] != 0.0 && row[8] != 1.0)
            || !row[9].is_finite()
            || !row[10].is_finite()
            || row[10] < 0.0
            || row[10].fract() != 0.0
            || row[10] >= colors.length() as f64
            || !row[11].is_finite()
            || row[11] < 0.0
            || row[11].fract() != 0.0
            || row[11] >= colors.length() as f64
            || !row[12].is_finite()
            || !(0.0..=1.0).contains(&row[12])
    }) {
        return Ok(-1);
    }
    for row in values.chunks_exact(STRIDE as usize) {
        let x = row[0];
        let y = row[1];
        let radius = row[2];
        let kind = row[3] as u32;
        let hp = row[4];
        let angle = row[5];
        let tele = row[6];
        let sniper = row[7] == 1.0;
        let charge = row[8] == 1.0;
        let charge_angle = row[9];
        let color = colors
            .get(row[10] as u32)
            .as_string()
            .ok_or_else(|| JsValue::from_str("enemy accent palette entry missing"))?;
        let boss_color = colors
            .get(row[11] as u32)
            .as_string()
            .ok_or_else(|| JsValue::from_str("boss accent palette entry missing"))?;
        let alpha = row[12];
        let outline_width = if kind == 1 { 4.0 } else { 2.0 };
        context.save();
        let painted =
            (|| -> Result<(), JsValue> {
                context.translate(x, y)?;
                context.set_stroke_style_str(&color);
                context.set_line_width(outline_width + 6.0);
                context.set_global_alpha(alpha * 0.28);
                context.begin_path();
                context.arc(0.0, 0.0, radius + 5.0, 0.0, core::f64::consts::TAU)?;
                context.stroke();
                context.set_global_alpha(alpha);
                context.set_line_width(outline_width);
                context.begin_path();
                context.arc(0.0, 0.0, radius + 5.0, 0.0, core::f64::consts::TAU)?;
                context.stroke();
                if kind == 1 && hp > 0.0 {
                    context.set_fill_style_str(&color);
                    for bar in 0..16 {
                        if bar as f64 >= hp {
                            break;
                        }
                        context.fill_rect(-9.0 + bar as f64 * 7.0, -radius - 12.0, 5.0, 3.0);
                    }
                }
                if kind == 2 {
                    context.set_fill_style_str(&color);
                    context.begin_path();
                    context.move_to(-7.0, -radius - 6.0);
                    for (px, py) in [
                        (-7.0, -radius - 14.0),
                        (-3.0, -radius - 9.0),
                        (0.0, -radius - 16.0),
                        (3.0, -radius - 9.0),
                        (7.0, -radius - 14.0),
                        (7.0, -radius - 6.0),
                    ] {
                        context.line_to(px, py);
                    }
                    context.fill();
                }
                if sniper && tele > 0.0 {
                    context.restore();
                    context.save();
                    context.set_stroke_style_str(&colors.get(0).as_string().ok_or_else(|| {
                        JsValue::from_str("enemy telegraph palette entry missing")
                    })?);
                    context.set_global_alpha(alpha * (0.35 + 0.5 * (1.0 - tele / 0.7)));
                    context.set_line_width(1.5);
                    context.begin_path();
                    context.move_to(x, y);
                    context.line_to(
                        x + js_sys::Math::cos(angle) * 560.0,
                        y + js_sys::Math::sin(angle) * 560.0,
                    );
                    context.stroke();
                } else if kind == 3 {
                    context.restore();
                    context.save();
                    context.translate(x, y)?;
                    let pulse = 1.0 + js_sys::Math::sin(now_ms / 160.0) * 0.08;
                    context.set_stroke_style_str(&boss_color);
                    context.set_global_alpha(0.3);
                    context.set_line_width(12.0);
                    context.begin_path();
                    context.arc(0.0, 0.0, (radius + 8.0) * pulse, 0.0, core::f64::consts::TAU)?;
                    context.stroke();
                    context.set_global_alpha(1.0);
                    context.set_line_width(4.0);
                    context.begin_path();
                    context.arc(0.0, 0.0, (radius + 8.0) * pulse, 0.0, core::f64::consts::TAU)?;
                    context.stroke();
                    if charge {
                        context.restore();
                        context.save();
                        context.set_stroke_style_str(&colors.get(1).as_string().ok_or_else(
                            || JsValue::from_str("boss charge palette entry missing"),
                        )?);
                        // The original Canvas painter keeps the incoming alpha;
                        // the .7 opacity is already part of the RGBA stroke color.
                        context.set_global_alpha(alpha);
                        context.set_line_width(3.0);
                        let dash = Array::new();
                        dash.push(&JsValue::from_f64(8.0));
                        dash.push(&JsValue::from_f64(6.0));
                        context.set_line_dash(&dash)?;
                        context.begin_path();
                        context.move_to(x, y);
                        context.line_to(
                            x + js_sys::Math::cos(charge_angle) * 420.0,
                            y + js_sys::Math::sin(charge_angle) * 420.0,
                        );
                        context.stroke();
                    }
                }
                Ok(())
            })();
        context.restore();
        painted?;
    }
    Ok((values.len() / STRIDE as usize) as i32)
}

/// Paints intact glass and active shards directly from the host-maintained simulation records.
#[wasm_bindgen(js_name = drawGlass)]
pub fn draw_glass_direct(
    context: &CanvasRenderingContext2d,
    panels: &Float64Array,
    shards: &Float64Array,
    now_ms: f64,
    base_alpha: f64,
    colors: &Array,
) -> Result<i32, JsValue> {
    const PANEL_STRIDE: u32 = 4;
    const SHARD_STRIDE: u32 = 7;
    if panels.length() % PANEL_STRIDE != 0
        || panels.length() / PANEL_STRIDE > 96
        || shards.length() % SHARD_STRIDE != 0
        || shards.length() / SHARD_STRIDE > 160
        || !now_ms.is_finite()
        || now_ms < 0.0
        || !base_alpha.is_finite()
        || !(0.0..=1.0).contains(&base_alpha)
        || colors.length() <= 125
    {
        return Ok(-1);
    }
    let panel_values = panels.to_vec();
    let shard_values = shards.to_vec();
    if panel_values
        .chunks_exact(PANEL_STRIDE as usize)
        .any(|panel| {
            panel.iter().any(|value| !value.is_finite()) || panel[2] <= 2.0 || panel[3] <= 2.0
        })
        || shard_values
            .chunks_exact(SHARD_STRIDE as usize)
            .any(|shard| {
                shard.iter().any(|value| !value.is_finite())
                    || shard[3] <= 0.0
                    || shard[4] <= 0.0
                    || shard[5] <= 0.0
                    || shard[6] < 0.0
                    || shard[6] >= 4.0
                    || shard[6].fract() != 0.0
            })
    {
        return Ok(-1);
    }
    for panel in panel_values.chunks_exact(PANEL_STRIDE as usize) {
        let (x, y, width, height) = (panel[0], panel[1], panel[2], panel[3]);
        let painted = with_context_save(context, || {
            context.set_fill_style_str(
                &colors
                    .get(118)
                    .as_string()
                    .ok_or_else(|| JsValue::from_str("glass fill color missing"))?,
            );
            context.fill_rect(x, y, width, height);
            context.set_stroke_style_str(
                &colors
                    .get(119)
                    .as_string()
                    .ok_or_else(|| JsValue::from_str("glass edge color missing"))?,
            );
            context.set_line_width(2.0);
            context.stroke_rect(x + 1.0, y + 1.0, width - 2.0, height - 2.0);
            context.set_stroke_style_str(
                &colors
                    .get(120)
                    .as_string()
                    .ok_or_else(|| JsValue::from_str("glass shine color missing"))?,
            );
            context.set_line_width(3.0);
            context.begin_path();
            context.move_to(x + 6.0, y + 30.0);
            context.line_to(x + 30.0, y + 6.0);
            context.stroke();
            let shimmer = (now_ms / 40.0 + x) % 120.0;
            if shimmer < 40.0 {
                context.set_global_alpha(base_alpha * (0.5 - shimmer / 80.0));
                context.set_stroke_style_str(
                    &colors
                        .get(121)
                        .as_string()
                        .ok_or_else(|| JsValue::from_str("glass shimmer color missing"))?,
                );
                context.begin_path();
                context.move_to(x + shimmer, y);
                context.line_to(x + shimmer - 20.0, y + height);
                context.stroke();
            }
            Ok(())
        });
        painted?;
    }
    for shard in shard_values.chunks_exact(SHARD_STRIDE as usize) {
        let (x, y, rotation, life, max_life, size, color) = (
            shard[0],
            shard[1],
            shard[2],
            shard[3],
            shard[4],
            shard[5],
            shard[6] as u32,
        );
        let painted = with_context_save(context, || {
            context.translate(x, y)?;
            context.rotate(rotation)?;
            context.set_global_alpha(base_alpha * 1.0_f64.min(life / max_life * 1.5));
            context.set_fill_style_str(
                &colors
                    .get(122 + color)
                    .as_string()
                    .ok_or_else(|| JsValue::from_str("glass shard color missing"))?,
            );
            context.begin_path();
            context.move_to(-size, size * 0.6);
            context.line_to(size * 1.1, 0.0);
            context.line_to(-size * 0.2, -size);
            context.close_path();
            context.fill();
            Ok(())
        });
        painted?;
    }
    Ok(
        (panel_values.len() / PANEL_STRIDE as usize + shard_values.len() / SHARD_STRIDE as usize)
            as i32,
    )
}

fn finish_weapon_icon(
    context: &CanvasRenderingContext2d,
    colors: &Array,
    id: u32,
) -> Result<(), JsValue> {
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        context.set_line_width(1.0);
        context.set_line_cap("round");
        weapon_stroke(context, colors, 98)?;
        context.begin_path();
        context.move_to(4.0, 3.0);
        context.line_to(4.0, -3.0);
        context.line_to(24.0, -4.0);
        context.stroke();
        weapon_stroke(context, colors, 99)?;
        context.begin_path();
        context.move_to(7.0, -3.0);
        context.line_to(if id == 5 || id == 17 { 54.0 } else { 31.0 }, -3.0);
        context.stroke();
        weapon_fill(context, colors, 100)?;
        if matches!(id, 6 | 7 | 12 | 13) {
            context.fill_rect(15.0, 5.0, 1.0, 5.0);
            context.fill_rect(18.0, 5.0, 1.0, 5.0);
        }
        if matches!(id, 3 | 8 | 16 | 18) {
            context.fill_rect(12.0, -1.0, 1.0, 2.0);
            context.fill_rect(16.0, -1.0, 1.0, 2.0);
        }
        if id == 7 || id == 13 {
            weapon_stroke(context, colors, 101)?;
            context.begin_path();
            context.arc(12.0, 0.0, 3.0, 0.0, 6.28)?;
            context.stroke();
        }
        if matches!(id, 4 | 5 | 14 | 15 | 16 | 17 | 18) {
            let cx = if id == 15 { 40.0 } else { 48.0 };
            context.set_fill_style_str("#171b22");
            context.begin_path();
            context.arc(cx, 0.0, 2.2, 0.0, 6.28)?;
            context.fill();
            weapon_stroke(context, colors, 102)?;
            context.begin_path();
            context.arc(cx, 0.0, 1.2, 0.0, 6.28)?;
            context.stroke();
        }
        Ok(())
    })();
    context.restore();
    painted
}

/// Builds and rasterizes an existing weapon icon entirely in the direct Rust renderer.
#[wasm_bindgen(js_name = drawWeaponIcon)]
pub fn draw_weapon_icon_direct(
    context: &CanvasRenderingContext2d,
    id: u32,
    colors: &Array,
) -> Result<bool, JsValue> {
    if id > 23 || colors.length() <= 102 {
        return Ok(false);
    }
    if id == 0 {
        return Ok(true);
    }
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        context.set_shadow_color("rgba(0,0,0,.62)");
        context.set_shadow_blur(2.0);
        context.set_shadow_offset_x(1.0);
        context.set_shadow_offset_y(2.0);
        match id {
            1 => {
                weapon_fill(context, colors, 59)?;
                context.fill_rect(5.0, -2.0, 39.0, 5.0);
                weapon_fill(context, colors, 60)?;
                context.fill_rect(35.0, -4.0, 9.0, 8.0);
                weapon_fill(context, colors, 61)?;
                context.fill_rect(7.0, -2.0, 7.0, 5.0);
            }
            2 => {
                weapon_fill(context, colors, 62)?;
                context.begin_path();
                context.move_to(9.0, -3.0);
                context.line_to(35.0, 0.0);
                context.line_to(9.0, 3.0);
                context.line_to(20.0, 0.0);
                context.fill();
                weapon_fill(context, colors, 63)?;
                context.fill_rect(2.0, -2.0, 9.0, 4.0);
                weapon_fill(context, colors, 51)?;
                context.fill_rect(9.0, -4.0, 2.0, 8.0);
            }
            3 => {
                weapon_fill(context, colors, 64)?;
                context.fill_rect(4.0, -4.0, 29.0, 7.0);
                weapon_fill(context, colors, 65)?;
                context.fill_rect(10.0, -5.0, 11.0, 2.0);
                weapon_fill(context, colors, 66)?;
                context.fill_rect(13.0, 3.0, 6.0, 11.0);
                weapon_fill(context, colors, 9)?;
                context.fill_rect(29.0, -2.0, 11.0, 3.0);
            }
            4 => {
                weapon_fill(context, colors, 67)?;
                context.fill_rect(3.0, -4.0, 17.0, 8.0);
                weapon_fill(context, colors, 68)?;
                context.fill_rect(6.0, 3.0, 12.0, 5.0);
                weapon_fill(context, colors, 69)?;
                context.fill_rect(17.0, -2.0, 32.0, 4.0);
                weapon_fill(context, colors, 70)?;
                context.fill_rect(43.0, -3.0, 8.0, 6.0);
            }
            5 => {
                weapon_fill(context, colors, 71)?;
                context.fill_rect(3.0, -3.0, 18.0, 6.0);
                weapon_fill(context, colors, 72)?;
                context.fill_rect(5.0, 3.0, 15.0, 4.0);
                weapon_fill(context, colors, 73)?;
                context.fill_rect(18.0, -2.0, 43.0, 4.0);
                weapon_fill(context, colors, 74)?;
                context.fill_rect(30.0, -6.0, 13.0, 3.0);
                context.fill_rect(52.0, -3.0, 10.0, 3.0);
            }
            6 => {
                weapon_fill(context, colors, 74)?;
                context.fill_rect(4.0, -4.0, 24.0, 7.0);
                weapon_fill(context, colors, 65)?;
                context.fill_rect(7.0, -5.0, 17.0, 2.0);
                weapon_fill(context, colors, 74)?;
                context.fill_rect(13.0, 3.0, 7.0, 10.0);
                weapon_fill(context, colors, 38)?;
                context.fill_rect(24.0, -2.0, 5.0, 2.0);
            }
            7 => {
                weapon_fill(context, colors, 75)?;
                context.fill_rect(6.0, -4.0, 22.0, 7.0);
                weapon_fill(context, colors, 76)?;
                context.fill_rect(11.0, 3.0, 7.0, 9.0);
                weapon_fill(context, colors, 77)?;
                context.fill_rect(4.0, 4.0, 9.0, 7.0);
                weapon_fill(context, colors, 70)?;
                context.begin_path();
                context.arc(12.0, 0.0, 4.0, 0.0, 6.28)?;
                context.fill();
            }
            8 => {
                weapon_fill(context, colors, 64)?;
                context.fill_rect(4.0, -5.0, 24.0, 9.0);
                weapon_fill(context, colors, 78)?;
                context.fill_rect(9.0, -7.0, 13.0, 2.0);
                weapon_fill(context, colors, 9)?;
                context.fill_rect(12.0, 3.0, 5.0, 12.0);
                context.fill_rect(25.0, -2.0, 12.0, 3.0);
            }
            9 => {
                weapon_fill(context, colors, 79)?;
                context.fill_rect(5.0, -3.0, 42.0, 6.0);
                weapon_fill(context, colors, 80)?;
                context.fill_rect(10.0, -4.0, 5.0, 8.0);
                context.set_fill_style_str("#555b64");
                context.fill_rect(38.0, -4.0, 9.0, 8.0);
            }
            10 => {
                weapon_fill(context, colors, 79)?;
                context.fill_rect(5.0, -2.0, 39.0, 4.0);
                context.begin_path();
                context.move_to(42.0, -2.0);
                context.line_to(51.0, -8.0);
                context.line_to(49.0, -1.0);
                context.line_to(44.0, 2.0);
                context.fill();
            }
            11 => {
                weapon_fill(context, colors, 77)?;
                context.fill_rect(5.0, -2.0, 30.0, 4.0);
                weapon_fill(context, colors, 81)?;
                context.fill_rect(30.0, -8.0, 13.0, 16.0);
                weapon_fill(context, colors, 65)?;
                context.fill_rect(33.0, -10.0, 8.0, 3.0);
            }
            12 => {
                weapon_fill(context, colors, 15)?;
                context.fill_rect(4.0, -3.0, 22.0, 6.0);
                weapon_fill(context, colors, 38)?;
                context.fill_rect(20.0, -1.0, 6.0, 2.0);
                weapon_fill(context, colors, 82)?;
                context.fill_rect(8.0, 2.0, 5.0, 8.0);
            }
            13 => {
                weapon_fill(context, colors, 83)?;
                context.fill_rect(4.0, -3.0, 26.0, 6.0);
                weapon_fill(context, colors, 77)?;
                context.fill_rect(2.0, 2.0, 7.0, 9.0);
                weapon_fill(context, colors, 84)?;
                context.fill_rect(12.0, -5.0, 8.0, 4.0);
            }
            14 => {
                weapon_fill(context, colors, 85)?;
                context.fill_rect(2.0, -3.0, 14.0, 6.0);
                weapon_fill(context, colors, 86)?;
                context.fill_rect(14.0, -2.0, 30.0, 4.0);
                weapon_fill(context, colors, 91)?;
                context.fill_rect(24.0, -4.0, 10.0, 8.0);
            }
            15 => {
                weapon_fill(context, colors, 85)?;
                context.fill_rect(2.0, -4.0, 14.0, 8.0);
                weapon_fill(context, colors, 87)?;
                context.fill_rect(14.0, -4.0, 26.0, 3.0);
                context.fill_rect(14.0, 1.0, 26.0, 3.0);
            }
            16 => {
                weapon_fill(context, colors, 88)?;
                context.fill_rect(2.0, -3.0, 38.0, 6.0);
                weapon_fill(context, colors, 38)?;
                context.fill_rect(30.0, -5.0, 4.0, 2.0);
                weapon_fill(context, colors, 43)?;
                context.fill_rect(14.0, 2.0, 6.0, 9.0);
            }
            17 => {
                weapon_fill(context, colors, 89)?;
                context.fill_rect(2.0, -3.0, 56.0, 5.0);
                weapon_fill(context, colors, 9)?;
                context.fill_rect(14.0, -8.0, 16.0, 4.0);
                weapon_fill(context, colors, 39)?;
                context.fill_rect(28.0, -7.0, 2.0, 2.0);
            }
            18 => {
                weapon_fill(context, colors, 90)?;
                context.fill_rect(2.0, -4.0, 40.0, 8.0);
                weapon_fill(context, colors, 91)?;
                context.fill_rect(12.0, 3.0, 14.0, 8.0);
                weapon_fill(context, colors, 92)?;
                context.fill_rect(38.0, -2.0, 12.0, 4.0);
            }
            19 => {
                weapon_fill(context, colors, 93)?;
                context.begin_path();
                context.move_to(10.0, -2.0);
                context.line_to(52.0, -1.0);
                context.line_to(54.0, 1.0);
                context.line_to(10.0, 2.0);
                context.fill();
                weapon_fill(context, colors, 39)?;
                context.fill_rect(2.0, -2.0, 9.0, 4.0);
                weapon_fill(context, colors, 51)?;
                context.fill_rect(9.0, -4.0, 2.0, 8.0);
            }
            20 => {
                weapon_fill(context, colors, 77)?;
                context.fill_rect(4.0, -2.0, 34.0, 4.0);
                weapon_fill(context, colors, 81)?;
                context.begin_path();
                context.move_to(30.0, -3.0);
                context.line_to(44.0, -12.0);
                context.line_to(44.0, 12.0);
                context.line_to(30.0, 3.0);
                context.fill();
            }
            21 => {
                weapon_fill(context, colors, 94)?;
                context.fill_rect(6.0, -3.0, 16.0, 6.0);
                context.fill_rect(22.0, -1.5, 12.0, 3.0);
                weapon_fill(context, colors, 95)?;
                context.fill_rect(8.0, -2.0, 5.0, 2.0);
            }
            22 => {
                weapon_fill(context, colors, 96)?;
                context.fill_rect(4.0, -5.0, 26.0, 10.0);
                weapon_fill(context, colors, 43)?;
                context.fill_rect(30.0, -2.0, 8.0, 4.0);
                weapon_fill(context, colors, 97)?;
                context.fill_rect(12.0, -5.0, 3.0, 10.0);
            }
            _ => {
                weapon_fill(context, colors, 9)?;
                context.fill_rect(4.0, -3.0, 20.0, 6.0);
            }
        }
        finish_weapon_icon(context, colors, id)?;
        if id == 23 {
            finish_weapon_icon(context, colors, id)?;
        }
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(true)
}

/// Draws pickup transforms, their pulsing glow, and weapon icons in direct Rust/WebSys.
#[wasm_bindgen(js_name = drawPickups)]
pub fn draw_pickups(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    glow: bool,
    colors: &Array,
) -> Result<i32, JsValue> {
    if commands.length() % 5 != 0 || commands.length() > 32768 || colors.length() <= 102 {
        return Ok(-1);
    }
    let count = commands.length() / 5;
    let mut values = Vec::with_capacity(commands.length() as usize);
    for index in 0..commands.length() {
        let value = commands.get_index(index);
        if !value.is_finite() {
            return Ok(-1);
        }
        values.push(value);
    }
    for offset in (0..values.len()).step_by(5) {
        let weapon = values[offset + 3];
        if weapon.fract() != 0.0
            || !(0.0..24.0).contains(&weapon)
            || !(0.0..=1.0).contains(&values[offset + 4])
        {
            return Ok(-1);
        }
    }
    for offset in (0..values.len()).step_by(5) {
        let x = values[offset];
        let y = values[offset + 1];
        let angle = values[offset + 2];
        let weapon = values[offset + 3] as u32;
        let pulse = values[offset + 4];
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.translate(x, y)?;
            context.rotate(angle)?;
            context.translate(-18.0, 0.0)?;
            context.begin_path();
            if glow {
                context.set_fill_style_str(&format!("rgba(255,210,63,{})", 0.18 + 0.14 * pulse));
                context.arc(18.0, 0.0, 18.0, 0.0, 6.28)?;
                context.fill();
                context.begin_path();
                context.set_fill_style_str(&format!("rgba(255,255,255,{})", 0.08 * pulse));
                context.arc(18.0, 0.0, 10.0, 0.0, 6.28)?;
                context.fill();
            } else {
                context.set_fill_style_str("rgba(255,210,63,.2)");
                context.arc(18.0, 0.0, 14.0, 0.0, 6.28)?;
                context.fill();
            }
            draw_weapon_icon_direct(context, weapon, colors)?;
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok(count as i32)
}

/// Draws thrown weapon transforms and icons entirely in direct Rust/WebSys.
#[wasm_bindgen(js_name = drawThrows)]
pub fn draw_throws(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    if commands.length() % 4 != 0 || commands.length() > 32768 || colors.length() <= 102 {
        return Ok(-1);
    }
    let count = commands.length() / 4;
    let mut values = Vec::with_capacity(commands.length() as usize);
    for index in 0..commands.length() {
        let value = commands.get_index(index);
        if !value.is_finite() {
            return Ok(-1);
        }
        values.push(value);
    }
    for offset in (0..values.len()).step_by(4) {
        let weapon = values[offset + 3];
        if weapon.fract() != 0.0 || !(0.0..24.0).contains(&weapon) {
            return Ok(-1);
        }
    }
    for offset in (0..values.len()).step_by(4) {
        let x = values[offset];
        let y = values[offset + 1];
        let angle = values[offset + 2];
        let weapon = values[offset + 3] as u32;
        context.save();
        let painted = (|| -> Result<(), JsValue> {
            context.translate(x, y)?;
            context.rotate(angle)?;
            context.translate(-18.0, 0.0)?;
            draw_weapon_icon_direct(context, weapon, colors)?;
            Ok(())
        })();
        context.restore();
        painted?;
    }
    Ok(count as i32)
}

/// Rasterizes the legacy HUD geometry batch while Rust keeps its exact opcode and palette.
#[wasm_bindgen(js_name = drawHudShapeCommands)]
pub fn draw_hud_shape_commands(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    if commands.length() % 7 != 0
        || commands.length() > 32768
        || colors.length() == 0
        || colors.length() > 64
    {
        return Ok(-1);
    }
    let count = commands.length() / 7;
    for offset in (0..commands.length()).step_by(7) {
        let op = commands.get_index(offset);
        let color = commands.get_index(offset + 5);
        if !op.is_finite()
            || op.fract() != 0.0
            || !(0.0..=6.0).contains(&op)
            || !color.is_finite()
            || color.fract() != 0.0
            || color < 0.0
            || color as u32 >= colors.length()
            || colors.get(color as u32).as_string().is_none()
        {
            return Ok(-1);
        }
        for field in [1, 2, 3, 4, 6] {
            if !commands.get_index(offset + field).is_finite() {
                return Ok(-1);
            }
        }
    }
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        for offset in (0..commands.length()).step_by(7) {
            let op = commands.get_index(offset) as u32;
            let x = commands.get_index(offset + 1);
            let y = commands.get_index(offset + 2);
            let width = commands.get_index(offset + 3);
            let height = commands.get_index(offset + 4);
            let color = colors
                .get(commands.get_index(offset + 5) as u32)
                .as_string()
                .unwrap();
            let line_width = commands.get_index(offset + 6);
            match op {
                0 => {
                    context.set_fill_style_str(&color);
                    context.fill_rect(x, y, width, height);
                }
                1 => {
                    context.set_stroke_style_str(&color);
                    context.set_line_width(line_width);
                    context.stroke_rect(x, y, width, height);
                }
                2 => {
                    context.set_fill_style_str(&color);
                    context.begin_path();
                    context.ellipse(x, y, width, height, 0.0, 0.0, core::f64::consts::TAU)?;
                    context.fill();
                }
                3 => {
                    context.set_fill_style_str(&color);
                    context.begin_path();
                    context.move_to(x - 11.0 * width, y - 4.0);
                    context.line_to(x + 11.0 * width, y - 4.0);
                    context.line_to(x + 15.0 * width, y + 14.0);
                    context.line_to(x - 15.0 * width, y + 14.0);
                    context.close_path();
                    context.fill();
                }
                4 => {
                    context.set_fill_style_str(&color);
                    context.begin_path();
                    context.move_to(x - 3.0 * width, y + height);
                    context.line_to(x, y);
                    context.line_to(x + 3.0 * width, y + height);
                    context.fill();
                }
                5 => {
                    context.set_stroke_style_str(&color);
                    context.set_line_width(line_width);
                    context.begin_path();
                    context.arc(
                        x,
                        y,
                        width,
                        -core::f64::consts::FRAC_PI_2,
                        -core::f64::consts::FRAC_PI_2 + core::f64::consts::TAU * height,
                    )?;
                    context.stroke();
                }
                6 => {
                    context.set_fill_style_str(&color);
                    context.begin_path();
                    context.move_to(x - width, y);
                    context.line_to(x + width, y);
                    context.line_to(x, y + height);
                    context.close_path();
                    context.fill();
                }
                _ => return Err(JsValue::from_str("invalid HUD shape command")),
            }
        }
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(count as i32)
}

/// Draws the game's fixed HUD shapes directly from Rust without the legacy command bridge.
#[wasm_bindgen(js_name = drawHudShape)]
pub fn draw_hud_shape(
    context: &CanvasRenderingContext2d,
    stage: u32,
    width: f64,
    height: f64,
    value: f64,
) -> Result<bool, JsValue> {
    if stage > 4 || !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > 4096.0 || height > 4096.0 || !value.is_finite()
    {
        return Ok(false);
    }
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        match stage {
            0 => {
                let fraction = value.clamp(0.0, 1.0);
                context.set_fill_style_str("rgba(0,0,0,.45)");
                context.fill_rect(34.0, 186.0, 220.0, 10.0);
                context.set_fill_style_str(if fraction > 0.3 { "#ff2e5b" } else { "#ffd23f" });
                context.fill_rect(34.0, 186.0, 220.0 * fraction, 10.0);
                context.set_stroke_style_str("#1a0006");
                context.set_line_width(2.0);
                context.stroke_rect(34.0, 186.0, 220.0, 10.0);
            }
            1 => {
                context.set_stroke_style_str("#19f0e6");
                context.set_line_width(3.0);
                context.stroke_rect(width - 82.0, 26.0, 56.0, 56.0);
            }
            2 => {
                context.set_fill_style_str("rgba(5,0,18,.78)");
                context.fill_rect(0.0, 0.0, width, height);
            }
            3 => {
                context.set_fill_style_str("rgba(0,0,0,.5)");
                context.fill_rect(34.0, 146.0, 160.0, 8.0);
                context.set_fill_style_str("#ff9ac8");
                context.fill_rect(34.0, 146.0, 160.0 * value, 8.0);
            }
            4 => {
                context.set_fill_style_str("rgba(5,0,18,.55)");
                context.fill_rect(width / 2.0 - 230.0, height / 2.0 + 80.0, 460.0, 120.0);
            }
            _ => return Ok(()),
        }
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(true)
}

/// Selects and paints the existing vignette or mask image without the legacy HUD generator.
#[wasm_bindgen(js_name = drawHudImageStage)]
pub fn draw_hud_image_stage(
    context: &CanvasRenderingContext2d,
    stage: u32,
    width: f64,
    height: f64,
    crt: bool,
    has_player: bool,
    has_mask: bool,
    images: &Array,
) -> Result<bool, JsValue> {
    if stage > 3 || !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > 4096.0 || height > 4096.0 || images.length() < 4 || images.length() > 16
    {
        return Ok(false);
    }
    let image = match stage {
        0 if has_player => images.get(if crt { 1 } else { 0 }),
        1 => images.get(2),
        2 if has_mask => images.get(3),
        3 => images.get(4),
        _ => return Ok(false),
    };
    if !supported_image(&image) { return Ok(false); }
    let placement = match stage {
        0 if has_player => [0.0, 0.0, width, height],
        1 => [0.0, 0.0, width, height],
        2 if has_mask => [width - 82.0, 26.0, 56.0, 56.0],
        3 => {
            let (image_width, image_height) = if let Some(canvas) = image.dyn_ref::<HtmlCanvasElement>() {
                (canvas.width() as f64, canvas.height() as f64)
            } else if let Some(element) = image.dyn_ref::<HtmlImageElement>() {
                (element.natural_width() as f64, element.natural_height() as f64)
            } else {
                (0.0, 0.0)
            };
            if image_width <= 0.0 || image_height <= 0.0 { return Ok(false); }
            [32.0, height - 25.0, image_width, image_height]
        }
        _ => return Ok(false),
    };
    draw_image_at(context, &image, &placement)
}

/// Formats and paints the centered alarm timer entirely in Rust/WebSys.
#[wasm_bindgen(js_name = drawAlarmTextStage)]
pub fn draw_alarm_text_stage(
    context: &CanvasRenderingContext2d,
    seconds: f64,
    screen_width: f64,
) -> Result<bool, JsValue> {
    if !seconds.is_finite() || seconds <= 0.0 || !screen_width.is_finite()
        || screen_width <= 0.0 || screen_width > 4096.0
    {
        return Ok(false);
    }
    let label = format!("ALARME ATIVO · {:.0} s", seconds);
    if label.len() > 96 { return Ok(false); }
    context.set_fill_style_str("rgba(255,60,90,.9)");
    context.set_font("bold 14px Orbitron, sans-serif");
    context.set_text_align("center");
    context.fill_text(&label, screen_width / 2.0, 24.0)?;
    Ok(true)
}

/// Computes the combo pulse and paints its outlined multiplier directly in Rust/WebSys.
#[wasm_bindgen(js_name = drawComboTextStage)]
pub fn draw_combo_text_stage(
    context: &CanvasRenderingContext2d,
    combo: f64,
    now_ms: f64,
) -> Result<bool, JsValue> {
    if !combo.is_finite() || combo <= 1.0 || !now_ms.is_finite() { return Ok(false); }
    let pulse = 1.0 + renderer_sin_approx(now_ms / 90.0).max(0.0) * 0.06;
    let label = format!("{:.0}X", combo.floor());
    if label.len() > 64 { return Ok(false); }
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        context.translate(34.0, 176.0)?;
        context.scale(pulse, pulse)?;
        context.set_font("bold 54px Impact, sans-serif");
        context.set_line_width(6.0);
        context.set_stroke_style_str("#1a0006");
        context.stroke_text(&label, 0.0, 0.0)?;
        context.set_fill_style_str("#ff2e5b");
        context.fill_text(&label, 0.0, 0.0)?;
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(true)
}

/// Computes and paints the shop dealer's ordered geometry directly in Rust/WebSys.
#[wasm_bindgen(js_name = drawShopDealerStage)]
pub fn draw_shop_dealer_stage(
    context: &CanvasRenderingContext2d,
    values: &Float64Array,
) -> Result<i32, JsValue> {
    if values.length() != 8 || (0..8).any(|index| !values.get_index(index).is_finite()) {
        return Ok(-1);
    }
    let gx = values.get_index(0);
    let gy = values.get_index(1);
    let fall = values.get_index(2).clamp(0.0, 1.0);
    let bob = values.get_index(3);
    let direction = if values.get_index(4) < 0.0 { -1.0 } else { 1.0 };
    let timer = values.get_index(5).clamp(0.0, 1.0);
    let urgent = values.get_index(6) > 0.5;
    let falling = values.get_index(7) > 0.0;
    let sy = gy - fall * 140.0 + bob;
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("rgba(0,0,0,.35)");
        context.begin_path();
        context.ellipse(gx, gy + 10.0, 13.0 - fall * 4.0, 6.0 - fall * 2.0, 0.0, 0.0, core::f64::consts::TAU)?;
        context.fill();

        context.save();
        let dealer_shapes = (|| -> Result<(), JsValue> {
            context.translate(gx, sy)?;
            context.scale(direction, 1.0)?;
            context.set_fill_style_str("#ff5fa2");
            context.begin_path();
            context.move_to(-11.0, -4.0);
            context.line_to(11.0, -4.0);
            context.line_to(15.0, 14.0);
            context.line_to(-15.0, 14.0);
            context.close_path();
            context.fill();

            context.set_fill_style_str("#f3c9a0");
            context.begin_path();
            context.arc(0.0, -12.0, 8.0, 0.0, 6.2832)?;
            context.fill();

            context.set_fill_style_str("#1b1b1b");
            context.fill_rect(-4.0, -13.0, 2.0, 2.0);
            context.fill_rect(2.0, -13.0, 2.0, 2.0);

            context.set_fill_style_str("#ffffff");
            context.fill_rect(-4.0, -7.0, 8.0, 2.0);

            context.set_fill_style_str("#ffd23f");
            for index in 0..4 {
                let center = -7.0 + index as f64 * 6.0;
                context.begin_path();
                context.move_to(center - 3.0, -20.0);
                context.line_to(center, -30.0);
                context.line_to(center + 3.0, -20.0);
                context.close_path();
                context.fill();
            }

            context.set_fill_style_str("#2d0f5c");
            context.fill_rect(-12.0, -21.0, 24.0, 4.0);
            Ok(())
        })();
        context.restore();
        dealer_shapes?;

        if !falling {
            context.set_stroke_style_str(if urgent { "#ff2e93" } else { "#ffd23f" });
            context.set_line_width(3.0);
            context.begin_path();
            context.arc(gx, gy + 6.0, 30.0, -core::f64::consts::FRAC_PI_2,
                -core::f64::consts::FRAC_PI_2 + core::f64::consts::TAU * timer)?;
            context.stroke();
        }
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(if falling { 11 } else { 12 })
}

/// Computes and paints the shop speech bubble, card, or reroll panel directly in Rust/WebSys.
#[wasm_bindgen(js_name = drawShopPanelStage)]
pub fn draw_shop_panel_stage(
    context: &CanvasRenderingContext2d,
    values: &Float64Array,
    outline_color: &str,
) -> Result<bool, JsValue> {
    if values.length() != 7 || (0..7).any(|index| !values.get_index(index).is_finite())
        || outline_color.len() > 128
    { return Ok(false); }
    let stage = values.get_index(0);
    let center_x = values.get_index(1);
    let y = values.get_index(2);
    let width = values.get_index(3);
    let height = values.get_index(4);
    let flick = values.get_index(6) > 0.5;
    if width <= 0.0 || height <= 0.0 || stage.fract() != 0.0 || !(0.0..=2.0).contains(&stage) {
        return Ok(false);
    }
    let outline_id = values.get_index(5);
    if stage == 1.0 && outline_id != 17.0 && outline_id != 18.0 && outline_id != 24.0 {
        return Ok(false);
    }
    let selected_outline = if stage == 2.0 { "#ffd23f" } else if flick { "#ffffff" } else { outline_color };
    if stage == 1.0 && selected_outline.is_empty() { return Ok(false); }
    let left = center_x - width / 2.0;
    context.save();
    let painted = (|| -> Result<(), JsValue> {
        if stage == 0.0 {
            context.set_fill_style_str("rgba(255,255,255,.95)");
            context.fill_rect(left, y, width, height);
            context.begin_path();
            context.move_to(center_x - 6.0, y + height);
            context.line_to(center_x + 6.0, y + height);
            context.line_to(center_x, y + height + 9.0);
            context.close_path();
            context.fill();
        } else {
            let top = y - height / 2.0;
            context.set_fill_style_str("rgba(12,4,28,.92)");
            context.fill_rect(left, top, width, height);
            context.set_stroke_style_str(selected_outline);
            context.set_line_width(3.0);
            context.stroke_rect(left + 1.5, top + 1.5, width - 3.0, height - 3.0);
        }
        Ok(())
    })();
    context.restore();
    painted?;
    Ok(true)
}

/// Fills the frame background with the game's shake-safe margins.
#[wasm_bindgen(js_name = drawFrameBackground)]
pub fn draw_frame_background(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
) -> Result<bool, JsValue> {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || width > 4096.0 || height > 4096.0
    {
        return Ok(false);
    }
    context.set_fill_style_str("#0d0320");
    context.fill_rect(-20.0, -20.0, width + 40.0, height + 40.0);
    Ok(true)
}

/// Applies one of the game's nested screen shake, kick, or camera transforms.
/// Stages 0 and 1 open save scopes, stage 2 applies the camera transform, and
/// stages 3 and 4 close the matching scopes.
#[wasm_bindgen(js_name = drawFrameTransforms)]
pub fn draw_frame_transforms(
    context: &CanvasRenderingContext2d,
    stage: u32,
    input: &[f64],
) -> Result<bool, JsValue> {
    if stage == 3 || stage == 4 {
        context.restore();
        return Ok(true);
    }
    if stage > 2 || input.len() < 15 {
        return Ok(false);
    }
    if stage == 0 {
        let (shake, power, rx, ry) = (input[0], input[1], input[2], input[3]);
        if !shake.is_finite() || shake < 0.0 || !power.is_finite() || power < 0.0
            || !rx.is_finite() || !(0.0..=1.0).contains(&rx)
            || !ry.is_finite() || !(0.0..=1.0).contains(&ry)
        {
            return Ok(false);
        }
        context.save();
        if shake > 0.0 {
            let factor = power * (shake / 0.14);
            context.translate((rx - 0.5) * factor, (ry - 0.5) * factor)?;
        }
        return Ok(true);
    }
    if stage == 1 {
        let (kick_x, kick_y, shake, scale, rx, ry) =
            (input[4], input[5], input[6], input[7], input[8], input[9]);
        if !kick_x.is_finite() || !kick_y.is_finite() || !shake.is_finite() || shake < 0.0
            || !scale.is_finite() || scale < 0.0
            || !rx.is_finite() || !(0.0..=1.0).contains(&rx)
            || !ry.is_finite() || !(0.0..=1.0).contains(&ry)
        {
            return Ok(false);
        }
        context.save();
        context.translate(kick_x * scale, kick_y * scale)?;
        if shake > 0.0 && scale > 0.0 {
            let factor = shake * scale;
            context.translate((rx - 0.5) * factor, (ry - 0.5) * factor)?;
        }
        return Ok(true);
    }
    let (width, height, zoom, camera_x, camera_y) =
        (input[10], input[11], input[12], input[13], input[14]);
    if !width.is_finite() || width <= 0.0 || !height.is_finite() || height <= 0.0
        || !zoom.is_finite() || zoom <= 0.0 || !camera_x.is_finite() || !camera_y.is_finite()
    {
        return Ok(false);
    }
    context.translate(width / 2.0, height / 2.0)?;
    context.scale(zoom, zoom)?;
    context.translate(-width / 2.0, -height / 2.0)?;
    context.translate(-camera_x, -camera_y)?;
    Ok(true)
}

/// Draws the player's shadow and optional local color glow.
#[wasm_bindgen(js_name = drawPlayerAura)]
pub fn draw_player_aura(
    context: &CanvasRenderingContext2d,
    is_p2: bool,
    shadows: bool,
    glow: bool,
) -> Result<bool, JsValue> {
    context.save();
    context.set_fill_style_str(if shadows { "rgba(0,0,0,.4)" } else { "rgba(0,0,0,.28)" });
    context.begin_path();
    if shadows {
        context.ellipse(2.0, 5.0, 13.0, 8.0, 0.0, 0.0, 6.28)?;
    } else {
        context.ellipse(1.0, 3.0, 11.0, 9.0, 0.0, 0.0, 6.28)?;
    }
    context.fill();
    if glow {
        context.set_fill_style_str(if is_p2 { "rgba(255,46,147,.14)" } else { "rgba(25,240,230,.14)" });
        context.begin_path();
        context.ellipse(0.0, 0.0, 16.0, 16.0, 0.0, 0.0, 6.28)?;
        context.fill();
    }
    context.restore();
    Ok(true)
}

/// Applies the renderer's root Canvas transform and smoothing settings directly.
#[wasm_bindgen(js_name = setupCanvas)]
pub fn setup_canvas(
    context: &CanvasRenderingContext2d,
    scale: f64,
    smoothing: bool,
    quality: u32,
) -> Result<bool, JsValue> {
    if !scale.is_finite() || scale <= 0.0 || scale > 16.0 || quality > 2 {
        return Ok(false);
    }
    let quality_name = match quality {
        0 => "low",
        1 => "medium",
        2 => "high",
        _ => return Ok(false),
    };
    context.set_transform(scale, 0.0, 0.0, scale, 0.0, 0.0)?;
    context.set_image_smoothing_enabled(smoothing);
    Reflect::set(
        context.as_ref(),
        &JsValue::from_str("imageSmoothingQuality"),
        &JsValue::from_str(quality_name),
    )?;
    Ok(true)
}

/// Selects the player's existing sprite sheet cell with the legacy animation math.
#[wasm_bindgen(js_name = selectPlayerSprite)]
pub fn select_player_sprite(state: u32, animation: f64, attack_remaining: f64) -> u32 {
    let (column, row) = match state {
        0 => (0, 0),
        1 | 2 => {
            let cycle = (animation % 6.283 + 6.283) % 6.283;
            let column = (cycle / 6.283 * 4.0).floor() as u32 % 4;
            (column, if state == 1 { 1 } else { 2 })
        }
        3 => (if attack_remaining > 0.13 { 0 } else if attack_remaining > 0.06 { 1 } else { 2 }, 3),
        _ => (0, 0),
    };
    column | (row << 8)
}

/// Selects the enemy sprite sheet cell at the legacy 110 ms animation cadence.
#[wasm_bindgen(js_name = selectEnemySprite)]
pub fn select_enemy_sprite(moving: bool, now_ms: f64) -> u32 {
    if !moving {
        return 0;
    }
    let column = (now_ms / 110.0).floor() as u32 % 4;
    column | (1 << 8)
}

/// Rasterizes the invasion direction triangle from its three Rust-generated vertices.
#[wasm_bindgen(js_name = drawInvasionArrow)]
pub fn draw_invasion_arrow(
    context: &CanvasRenderingContext2d,
    vertices: &Float64Array,
) -> Result<bool, JsValue> {
    if vertices.length() != 6 {
        return Ok(false);
    }
    for index in 0..6 {
        if !vertices.get_index(index).is_finite() {
            return Ok(false);
        }
    }
    context.save();
    context.set_fill_style_str("#ff6bd5");
    context.begin_path();
    context.move_to(vertices.get_index(0), vertices.get_index(1));
    context.line_to(vertices.get_index(2), vertices.get_index(3));
    context.line_to(vertices.get_index(4), vertices.get_index(5));
    context.close_path();
    context.fill();
    context.restore();
    Ok(true)
}

/// Computes and paints the Invasion direction arrow without the legacy command buffer.
#[wasm_bindgen(js_name = drawInvasionArrowInput)]
pub fn draw_invasion_arrow_input(
    context: &CanvasRenderingContext2d,
    center_x: f64,
    center_y: f64,
    cosine: f64,
    sine: f64,
) -> Result<bool, JsValue> {
    if !center_x.is_finite() || !center_y.is_finite() || !cosine.is_finite() || !sine.is_finite() {
        return Ok(false);
    }
    let local = [(14.0, 0.0), (-8.0, -9.0), (-8.0, 9.0)];
    let mut vertices = [(0.0, 0.0); 3];
    for (index, (x, y)) in local.iter().enumerate() {
        vertices[index] = (
            center_x + x * cosine - y * sine,
            center_y + x * sine + y * cosine,
        );
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("#ff6bd5");
        context.begin_path();
        context.move_to(vertices[0].0, vertices[0].1);
        context.line_to(vertices[1].0, vertices[1].1);
        context.line_to(vertices[2].0, vertices[2].1);
        context.close_path();
        context.fill();
        Ok(())
    })();
    context.restore();
    result?;
    Ok(true)
}

fn batch_prop(batch: &JsValue, key: &str) -> Result<JsValue, JsValue> {
    Reflect::get(batch, &JsValue::from_str(key))
}

fn batch_array(batch: &JsValue, key: &str) -> Result<Array, JsValue> {
    let value = batch_prop(batch, key)?;
    if value.is_undefined() || value.is_null() {
        Ok(Array::new())
    } else {
        Ok(value.unchecked_into::<Array>())
    }
}

fn supported_image(value: &JsValue) -> bool {
    value.is_instance_of::<HtmlImageElement>() || value.is_instance_of::<HtmlCanvasElement>()
}

fn draw_image_at(
    context: &CanvasRenderingContext2d,
    source: &JsValue,
    v: &[f64],
) -> Result<bool, JsValue> {
    if let Ok(image) = source.clone().dyn_into::<HtmlImageElement>() {
        match v {
            [x, y] => context.draw_image_with_html_image_element(&image, *x, *y)?,
            [x, y, w, h] => {
                context.draw_image_with_html_image_element_and_dw_and_dh(&image, *x, *y, *w, *h)?
            }
            [sx, sy, sw, sh, dx, dy, dw, dh] => context
                .draw_image_with_html_image_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
                    &image, *sx, *sy, *sw, *sh, *dx, *dy, *dw, *dh,
                )?,
            _ => return Ok(false),
        }
        return Ok(true);
    }
    if let Ok(canvas) = source.clone().dyn_into::<HtmlCanvasElement>() {
        match v {
            [x, y] => context.draw_image_with_html_canvas_element(&canvas, *x, *y)?,
            [x, y, w, h] => context
                .draw_image_with_html_canvas_element_and_dw_and_dh(&canvas, *x, *y, *w, *h)?,
            [sx, sy, sw, sh, dx, dy, dw, dh] => context
                .draw_image_with_html_canvas_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
                    &canvas, *sx, *sy, *sw, *sh, *dx, *dy, *dw, *dh,
                )?,
            _ => return Ok(false),
        }
        return Ok(true);
    }
    Ok(false)
}

fn repeat_pattern(
    context: &CanvasRenderingContext2d,
    source: &JsValue,
) -> Result<Option<CanvasPattern>, JsValue> {
    if let Ok(image) = source.clone().dyn_into::<HtmlImageElement>() {
        context.create_pattern_with_html_image_element(&image, "repeat")
    } else if let Ok(canvas) = source.clone().dyn_into::<HtmlCanvasElement>() {
        context.create_pattern_with_html_canvas_element(&canvas, "repeat")
    } else {
        Ok(None)
    }
}

fn with_context_save<T>(
    context: &CanvasRenderingContext2d,
    paint: impl FnOnce() -> Result<T, JsValue>,
) -> Result<T, JsValue> {
    context.save();
    let result = paint();
    context.restore();
    result
}

/// Rasterizes the Rust-generated dust circles in one direct Canvas batch.
#[wasm_bindgen(js_name = drawDust)]
pub fn draw_dust(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    alpha: f64,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 3;
    let length = commands.length();
    if length % STRIDE != 0
        || length / STRIDE > 65_536
        || !alpha.is_finite()
        || !(0.0..=1.0).contains(&alpha)
    {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let radius = commands.get_index(offset + 2);
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 {
            return Ok(-1);
        }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("#c8b8ff");
        context.begin_path();
        for offset in (0..length).step_by(STRIDE as usize) {
            let x = commands.get_index(offset);
            let y = commands.get_index(offset + 1);
            let radius = commands.get_index(offset + 2);
            context.move_to(x + radius, y);
            context.arc(x, y, radius, 0.0, 6.28)?;
        }
        context.set_global_alpha(alpha);
        context.fill();
        Ok(())
    })();
    context.restore();
    result?;
    Ok((length / STRIDE) as i32)
}

/// Rasterizes color/alpha-grouped spark rectangles using additive Canvas blending.
#[wasm_bindgen(js_name = drawSparks)]
pub fn draw_sparks(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 6;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let color = commands.get_index(offset);
        let alpha = commands.get_index(offset + 1);
        if !color.is_finite()
            || color.fract() != 0.0
            || color < 0.0
            || (color as u32) >= colors.length()
            || colors.get(color as u32).as_string().is_none()
            || !alpha.is_finite()
            || !(0.0..=1.0).contains(&alpha)
        {
            return Ok(-1);
        }
        for field in 2..STRIDE {
            if !commands.get_index(offset + field).is_finite() {
                return Ok(-1);
            }
        }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_global_composite_operation("lighter")?;
        let mut previous_color = f64::NAN;
        let mut previous_alpha = f64::NAN;
        for offset in (0..length).step_by(STRIDE as usize) {
            let color = commands.get_index(offset);
            let alpha = commands.get_index(offset + 1);
            if color != previous_color || alpha != previous_alpha {
                if offset > 0 {
                    context.fill();
                }
                context.set_fill_style_str(&colors.get(color as u32).as_string().unwrap());
                context.set_global_alpha(alpha);
                context.begin_path();
                previous_color = color;
                previous_alpha = alpha;
            }
            context.rect(
                commands.get_index(offset + 2),
                commands.get_index(offset + 3),
                commands.get_index(offset + 4),
                commands.get_index(offset + 5),
            );
        }
        if length > 0 {
            context.fill();
        }
        Ok(())
    })();
    context.restore();
    result?;
    Ok((length / STRIDE) as i32)
}

/// Groups spark inputs once, then paints each color/alpha batch without JS element reads or a second command array.
#[wasm_bindgen(js_name = drawSparkInputs)]
pub fn draw_spark_inputs(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const INPUT_STRIDE: u32 = 5;
    let length = input.length();
    if length % INPUT_STRIDE != 0 || length / INPUT_STRIDE > 65_536 || colors.length() > 256 {
        return Ok(-1);
    }
    let palette_len = colors.length() as usize;
    SPARK_BUFFERS.with(|shared| {
        let mut buffers = shared.borrow_mut();
        buffers.input.resize(length as usize, 0.0);
        input.copy_to(&mut buffers.input);
        buffers.palette.resize_with(palette_len, String::new);
        for color in 0..palette_len {
            let Some(value) = colors.get(color as u32).as_string() else {
                return Ok(-1);
            };
            buffers.palette[color].clone_from(&value);
        }
        let bucket_count = palette_len * 6;
        buffers.buckets.resize_with(bucket_count, Vec::new);
        for bucket in &mut buffers.buckets[..bucket_count] {
            bucket.clear();
        }

        for offset in (0..buffers.input.len()).step_by(INPUT_STRIDE as usize) {
            let x = buffers.input[offset];
            let y = buffers.input[offset + 1];
            let life = buffers.input[offset + 2];
            let max_life = buffers.input[offset + 3];
            let color_id = buffers.input[offset + 4];
            if !x.is_finite()
                || !y.is_finite()
                || !life.is_finite()
                || !max_life.is_finite()
                || max_life <= 0.0
                || life <= 0.0
                || !color_id.is_finite()
                || color_id.fract() != 0.0
                || color_id < 0.0
                || color_id as usize >= palette_len
            {
                continue;
            }
            let level = ((life / max_life) * 6.0).ceil().max(1.0) as usize;
            let alpha_bucket = level.min(6) - 1;
            buffers.buckets[color_id as usize * 6 + alpha_bucket].push(offset);
        }

        let mut count = 0i32;
        context.save();
        let result = (|| -> Result<(), JsValue> {
            context.set_global_composite_operation("lighter")?;
            for color in 0..palette_len {
                context.set_fill_style_str(&buffers.palette[color]);
                for alpha_bucket in 0..6 {
                    let grouped = &buffers.buckets[color * 6 + alpha_bucket];
                    if grouped.is_empty() {
                        continue;
                    }
                    context.begin_path();
                    for &offset in grouped {
                        context.rect(
                            buffers.input[offset] - 2.0,
                            buffers.input[offset + 1] - 2.0,
                            4.0,
                            4.0,
                        )?;
                    }
                    context.set_global_alpha((alpha_bucket + 1) as f64 / 6.0);
                    context.fill();
                    count += grouped.len() as i32;
                }
            }
            Ok(())
        })();
        context.restore();
        result.map(|()| count)
    })
}

/// Draws enemy shadow ellipses directly in Canvas while preserving the host painter's per-enemy alpha.
#[wasm_bindgen(js_name = drawEnemyShadows)]
pub fn draw_enemy_shadows(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    offset: u32,
    count: u32,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 5;
    let length = commands.length();
    let end = match offset.checked_add(count.saturating_mul(STRIDE)) {
        Some(value) => value,
        None => return Ok(-1),
    };
    if count > 65_536 || end > length {
        return Ok(-1);
    }
    for index in 0..count {
        let position = offset + index * STRIDE;
        let x = commands.get_index(position);
        let y = commands.get_index(position + 1);
        let radius_x = commands.get_index(position + 2);
        let radius_y = commands.get_index(position + 3);
        let alpha = commands.get_index(position + 4);
        if !x.is_finite()
            || !y.is_finite()
            || !radius_x.is_finite()
            || radius_x < 0.0
            || !radius_y.is_finite()
            || radius_y < 0.0
            || !alpha.is_finite()
            || !(0.0..=1.0).contains(&alpha)
        {
            return Ok(-1);
        }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("rgba(0,0,0,.32)");
        for index in 0..count {
            let position = offset + index * STRIDE;
            context.set_global_alpha(commands.get_index(position + 4));
            context.begin_path();
            context.ellipse(
                commands.get_index(position),
                commands.get_index(position + 1),
                commands.get_index(position + 2),
                commands.get_index(position + 3),
                0.0,
                0.0,
                6.28,
            )?;
            context.fill();
        }
        Ok(())
    })();
    context.restore();
    result?;
    Ok(count as i32)
}

/// Draws the persistent background trace created when a glass panel breaks.
#[wasm_bindgen(js_name = drawGlassBreakTrace)]
pub fn draw_glass_break_trace(
    context: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    commands: &Float64Array,
) -> Result<bool, JsValue> {
    const SHARD_STRIDE: u32 = 7;
    if !x.is_finite()
        || !y.is_finite()
        || !width.is_finite()
        || width <= 0.0
        || !height.is_finite()
        || height <= 0.0
        || commands.length() != SHARD_STRIDE * 9
    {
        return Ok(false);
    }
    for offset in (0..commands.length()).step_by(SHARD_STRIDE as usize) {
        let alpha = commands.get_index(offset);
        if !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) {
            return Ok(false);
        }
        for field in 1..SHARD_STRIDE {
            if !commands.get_index(offset + field).is_finite() {
                return Ok(false);
            }
        }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("rgba(160,230,255,.10)");
        context.fill_rect(x, y, width, height);
        for offset in (0..commands.length()).step_by(SHARD_STRIDE as usize) {
            let alpha = commands.get_index(offset);
            let color = format!("rgba(220,250,255,{alpha})");
            context.set_fill_style_str(&color);
            context.begin_path();
            context.move_to(
                commands.get_index(offset + 1),
                commands.get_index(offset + 2),
            );
            context.line_to(
                commands.get_index(offset + 3),
                commands.get_index(offset + 4),
            );
            context.line_to(
                commands.get_index(offset + 5),
                commands.get_index(offset + 6),
            );
            context.fill();
        }
        Ok(())
    })();
    context.restore();
    result?;
    Ok(true)
}

/// Paints the two persistent scorch circles left by an exploding barrel.
#[wasm_bindgen(js_name = drawExplosionScorch)]
pub fn draw_explosion_scorch(
    context: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() {
        return Ok(false);
    }
    context.set_fill_style_str("rgba(8,4,12,.55)");
    context.begin_path();
    context.arc(x, y, 38.0, 0.0, core::f64::consts::TAU)?;
    context.fill();
    context.set_fill_style_str("rgba(255,138,31,.18)");
    context.begin_path();
    context.arc(x, y, 24.0, 0.0, core::f64::consts::TAU)?;
    context.fill();
    Ok(true)
}

/// Rasterizes independently-alpha'd live blood marks and leaves alpha at one, matching the host painter.
#[wasm_bindgen(js_name = drawLiveBlood)]
pub fn draw_live_blood(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    color: &str,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 4;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 || color.is_empty() {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let radius = commands.get_index(offset + 2);
        let alpha = commands.get_index(offset + 3);
        if !x.is_finite()
            || !y.is_finite()
            || !radius.is_finite()
            || radius < 0.0
            || !alpha.is_finite()
            || !(0.0..=1.0).contains(&alpha)
        {
            return Ok(-1);
        }
    }
    if length == 0 {
        return Ok(0);
    }
    context.set_fill_style_str(color);
    for offset in (0..length).step_by(STRIDE as usize) {
        context.set_global_alpha(commands.get_index(offset + 3));
        context.begin_path();
        context.arc(
            commands.get_index(offset),
            commands.get_index(offset + 1),
            commands.get_index(offset + 2),
            0.0,
            6.28,
        )?;
        context.fill();
    }
    context.set_global_alpha(1.0);
    Ok((length / STRIDE) as i32)
}

/// Rasterizes static blood marks as one path, preserving Canvas arc connection semantics.
#[wasm_bindgen(js_name = drawStaticBlood)]
pub fn draw_static_blood(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    color: &str,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 4;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 || color.is_empty() {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = commands.get_index(offset);
        let y = commands.get_index(offset + 1);
        let radius = commands.get_index(offset + 2);
        let alpha = commands.get_index(offset + 3);
        if !x.is_finite()
            || !y.is_finite()
            || !radius.is_finite()
            || radius < 0.0
            || !alpha.is_finite()
        {
            return Ok(-1);
        }
    }
    if length == 0 {
        return Ok(0);
    }
    context.set_fill_style_str(color);
    context.begin_path();
    for offset in (0..length).step_by(STRIDE as usize) {
        context.move_to(
            commands.get_index(offset) + commands.get_index(offset + 2),
            commands.get_index(offset + 1),
        );
        context.arc(
            commands.get_index(offset),
            commands.get_index(offset + 1),
            commands.get_index(offset + 2),
            0.0,
            6.28,
        )?;
    }
    context.fill();
    Ok((length / STRIDE) as i32)
}

/// Rasterizes the irregular puddles, directional trails, and droplets created on enemy death.
/// JavaScript keeps the original random sequence and passes only the resulting geometry.
#[wasm_bindgen(js_name = drawBloodSplatter)]
pub fn draw_blood_splatter(
    context: &CanvasRenderingContext2d,
    puddle_color: &str,
    drop_color: &str,
    blobs: &Float64Array,
    streaks: &Float64Array,
    droplets: &Float64Array,
) -> Result<bool, JsValue> {
    const BLOB_STRIDE: u32 = 28;
    const STREAK_STRIDE: u32 = 5;
    const DROP_STRIDE: u32 = 3;
    if puddle_color.len() > 128
        || drop_color.len() > 128
        || blobs.length() % BLOB_STRIDE != 0
        || blobs.length() > 5 * BLOB_STRIDE
        || streaks.length() % STREAK_STRIDE != 0
        || streaks.length() > 14 * STREAK_STRIDE
        || droplets.length() % DROP_STRIDE != 0
        || droplets.length() > 256 * DROP_STRIDE
    {
        return Ok(false);
    }
    for index in 0..blobs.length() {
        if !blobs.get_index(index).is_finite() {
            return Ok(false);
        }
    }
    for index in 0..streaks.length() {
        if !streaks.get_index(index).is_finite() {
            return Ok(false);
        }
    }
    for index in 0..droplets.length() {
        if !droplets.get_index(index).is_finite() {
            return Ok(false);
        }
    }

    context.save();
    if blobs.length() > 0 {
        context.set_fill_style_str(puddle_color);
        let points_per_blob = BLOB_STRIDE as usize / 2;
        for base in (0..blobs.length()).step_by(BLOB_STRIDE as usize) {
            let first_x = blobs.get_index(base);
            let first_y = blobs.get_index(base + 1);
            let last = base + (BLOB_STRIDE - 2);
            context.begin_path();
            context.move_to(
                (first_x + blobs.get_index(last)) / 2.0,
                (first_y + blobs.get_index(last + 1)) / 2.0,
            );
            for point in 0..points_per_blob {
                let offset = base + (point * 2) as u32;
                let next = base + (((point + 1) % points_per_blob) * 2) as u32;
                let x = blobs.get_index(offset);
                let y = blobs.get_index(offset + 1);
                context.quadratic_curve_to(
                    x,
                    y,
                    (x + blobs.get_index(next)) / 2.0,
                    (y + blobs.get_index(next + 1)) / 2.0,
                );
            }
            context.fill();
        }
    }
    if streaks.length() > 0 || droplets.length() > 0 {
        context.set_stroke_style_str(drop_color);
        context.set_fill_style_str(drop_color);
        for base in (0..streaks.length()).step_by(STREAK_STRIDE as usize) {
            context.set_line_width(streaks.get_index(base + 4));
            context.begin_path();
            context.move_to(streaks.get_index(base), streaks.get_index(base + 1));
            context.line_to(streaks.get_index(base + 2), streaks.get_index(base + 3));
            context.stroke();
        }
        for base in (0..droplets.length()).step_by(DROP_STRIDE as usize) {
            context.begin_path();
            context.arc(
                droplets.get_index(base),
                droplets.get_index(base + 1),
                droplets.get_index(base + 2),
                0.0,
                6.28,
            )?;
            context.fill();
        }
    }
    context.restore();
    Ok(true)
}

/// Rasterizes ordered corpse ellipses with their original transforms and palette.
fn draw_corpses_mode(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    colors: &Array,
    preserve_shadow_alpha: bool,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 7;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let color = commands.get_index(offset + 6);
        if !color.is_finite()
            || color.fract() != 0.0
            || !(0.0..=3.0).contains(&color)
            || (color != 3.0 && (color as u32) >= colors.length())
            || (color != 3.0 && colors.get(color as u32).as_string().is_none())
        {
            return Ok(-1);
        }
        for field in 0..6 {
            let value = commands.get_index(offset + field);
            if !value.is_finite() {
                return Ok(-1);
            }
            if matches!(field, 3 | 4) && value < 0.0 {
                return Ok(-1);
            }
            if field == 5 && !(0.0..=1.0).contains(&value) {
                return Ok(-1);
            }
        }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        context.save();
        let result = (|| -> Result<(), JsValue> {
            context.translate(commands.get_index(offset), commands.get_index(offset + 1))?;
            context.rotate(commands.get_index(offset + 2))?;
            let color = commands.get_index(offset + 6) as u32;
            let fill = if color == 3 {
                "rgba(0,0,0,.35)".to_string()
            } else {
                colors.get(color).as_string().unwrap()
            };
            context.set_fill_style_str(&fill);
            if !preserve_shadow_alpha || color != 3 {
                context.set_global_alpha(commands.get_index(offset + 5));
            }
            context.begin_path();
            context.ellipse(
                0.0,
                0.0,
                commands.get_index(offset + 3),
                commands.get_index(offset + 4),
                0.0,
                0.0,
                6.28,
            )?;
            context.fill();
            Ok(())
        })();
        context.restore();
        result?;
    }
    Ok((length / STRIDE) as i32)
}

#[wasm_bindgen(js_name = drawCorpses)]
pub fn draw_corpses(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    draw_corpses_mode(context, commands, colors, false)
}

/// Derives the original shadow/body ellipses from corpse state and paints them without the legacy batch.
#[wasm_bindgen(js_name = drawCorpseInputs)]
pub fn draw_corpse_inputs(
    context: &CanvasRenderingContext2d,
    input: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const INPUT_STRIDE: u32 = 4;
    let length = input.length();
    if length % INPUT_STRIDE != 0 || length / INPUT_STRIDE > 65_536 {
        return Ok(-1);
    }
    let mut commands = Vec::with_capacity((length as usize / INPUT_STRIDE as usize) * 14);
    for offset in (0..length).step_by(INPUT_STRIDE as usize) {
        let x = input.get_index(offset);
        let y = input.get_index(offset + 1);
        let angle = input.get_index(offset + 2);
        let color = input.get_index(offset + 3);
        if !x.is_finite() || !y.is_finite() || !angle.is_finite() || !color.is_finite() || color < 0.0 {
            continue;
        }
        commands.extend_from_slice(&[x, y, angle, 15.0, 11.0, 0.35, 3.0]);
        commands.extend_from_slice(&[x, y, angle, 13.0, 8.0, 0.55, color]);
    }
    let count = (commands.len() / 7) as i32;
    let commands = Float64Array::from(commands.as_slice());
    let drawn = draw_corpses_mode(context, &commands, colors, true)?;
    if drawn == count { Ok(count) } else { Ok(-1) }
}

/// Draws a cached Canvas image directly into another Canvas context.
#[wasm_bindgen(js_name = drawCanvasImage)]
pub fn draw_canvas_image(
    context: &CanvasRenderingContext2d,
    image: &HtmlCanvasElement,
    x: f64,
    y: f64,
) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() || image.width() == 0 || image.height() == 0 {
        return Ok(false);
    }
    context.draw_image_with_html_canvas_element(image, x, y)?;
    Ok(true)
}

/// Draws a batch of cached text images with per-entry alpha in one direct Rust call.
/// Placements contain x, y and alpha triples; Canvas state is restored after each image.
#[wasm_bindgen(js_name = drawCanvasImageBatch)]
pub fn draw_canvas_image_batch(
    context: &CanvasRenderingContext2d,
    images: &Array,
    placements: &Float64Array,
) -> Result<i32, JsValue> {
    let count = images.length() as usize;
    if count > 64 || placements.length() as usize != count * 3 {
        return Ok(-1);
    }
    let values = placements.to_vec();
    for index in 0..count {
        let offset = index * 3;
        if !values[offset].is_finite()
            || !values[offset + 1].is_finite()
            || !values[offset + 2].is_finite()
            || !(0.0..=1.0).contains(&values[offset + 2])
            || images
                .get(index as u32)
                .dyn_ref::<HtmlCanvasElement>()
                .map_or(true, |image| image.width() == 0 || image.height() == 0)
        {
            return Ok(-1);
        }
    }
    for index in 0..count {
        let offset = index * 3;
        let image = images
            .get(index as u32)
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| JsValue::from_str("cached HUD image is not a canvas"))?;
        context.save();
        context.set_global_alpha(values[offset + 2]);
        let result =
            context.draw_image_with_html_canvas_element(&image, values[offset], values[offset + 1]);
        context.restore();
        result?;
    }
    Ok(count as i32)
}

/// Draws a cropped canvas layer from Rust, optionally overriding global alpha for the draw.
/// An alpha below zero preserves the caller's current alpha, matching the legacy layer path.
#[wasm_bindgen(js_name = drawCanvasLayer)]
pub fn draw_canvas_layer(
    context: &CanvasRenderingContext2d,
    image: &HtmlCanvasElement,
    sx: f64,
    sy: f64,
    sw: f64,
    sh: f64,
    dx: f64,
    dy: f64,
    dw: f64,
    dh: f64,
    alpha: f64,
) -> Result<bool, JsValue> {
    if ![sx, sy, sw, sh, dx, dy, dw, dh, alpha]
        .iter()
        .all(|v| v.is_finite())
        || sw <= 0.0
        || sh <= 0.0
        || dw <= 0.0
        || dh <= 0.0
        || sx < 0.0
        || sy < 0.0
        || sx + sw > image.width() as f64
        || sy + sh > image.height() as f64
        || (alpha >= 0.0 && alpha > 1.0)
    {
        return Ok(false);
    }

    context.save();
    if alpha >= 0.0 {
        context.set_global_alpha(alpha);
    }
    let drawn = context
        .draw_image_with_html_canvas_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
            image, sx, sy, sw, sh, dx, dy, dw, dh,
        );
    context.restore();
    drawn?;
    Ok(true)
}

#[inline]
fn procedural_sqrt(value: f64) -> f64 {
    if value <= 0.0 {
        return 0.0;
    }
    let estimate = f64::from_bits((value.to_bits() >> 1) + 0x1ff8_0000_0000_0000);
    let estimate = (estimate + value / estimate) * 0.5;
    let estimate = (estimate + value / estimate) * 0.5;
    (estimate + value / estimate) * 0.5
}

fn write_rgba_canvas(
    canvas: &HtmlCanvasElement,
    width: u32,
    height: u32,
    pixels: &[u8],
) -> Result<bool, JsValue> {
    if width == 0
        || height == 0
        || width > 1440
        || height > 900
        || pixels.len() != width as usize * height as usize * 4
    {
        return Ok(false);
    }
    canvas.set_width(width);
    canvas.set_height(height);
    let context = canvas
        .get_context("2d")?
        .ok_or_else(|| JsValue::from_str("2D context unavailable for procedural sprite"))?
        .dyn_into::<CanvasRenderingContext2d>()?;
    let image = context.create_image_data_with_sw_and_sh(width as f64, height as f64)?;
    let data = Reflect::get(image.as_ref(), &JsValue::from_str("data"))?
        .dyn_into::<Uint8ClampedArray>()?;
    let view = unsafe { Uint8ClampedArray::view(pixels) };
    data.set(view.as_ref(), 0);
    context.put_image_data(&image, 0.0, 0.0)?;
    Ok(true)
}

/// Generates the cached radial light sprite directly in Rust/WebSys.
#[wasm_bindgen(js_name = createRadialSprite)]
pub fn create_radial_sprite(
    canvas: &HtmlCanvasElement,
    red: u8,
    green: u8,
    blue: u8,
    radius: f64,
    alpha: f64,
) -> Result<bool, JsValue> {
    if !radius.is_finite()
        || radius <= 0.0
        || radius > 330.0
        || !alpha.is_finite()
        || !(0.0..=1.0).contains(&alpha)
    {
        return Ok(false);
    }
    let side = (radius * 2.0).ceil() as u32;
    if side == 0 || side > 660 {
        return Ok(false);
    }
    let mut pixels = vec![0u8; side as usize * side as usize * 4];
    for y in 0..side as usize {
        for x in 0..side as usize {
            let dx = x as f64 + 0.5 - radius;
            let dy = y as f64 + 0.5 - radius;
            let distance = procedural_sqrt(dx * dx + dy * dy);
            let remaining = 1.0 - distance / radius;
            let radial = remaining.max(0.0);
            let opacity = (alpha * radial * 255.0 + 0.5) as u8;
            let offset = (y * side as usize + x) * 4;
            if opacity != 0 {
                pixels[offset..offset + 3].copy_from_slice(&[red, green, blue]);
            }
            pixels[offset + 3] = opacity;
        }
    }
    write_rgba_canvas(canvas, side, side, &pixels)
}

/// Generates the cached muzzle-flash sprite directly in Rust/WebSys.
#[wasm_bindgen(js_name = createMuzzleSprite)]
pub fn create_muzzle_sprite(canvas: &HtmlCanvasElement) -> Result<bool, JsValue> {
    const SIDE: usize = 128;
    let center = SIDE as f64 / 2.0;
    let mut pixels = vec![0u8; SIDE * SIDE * 4];
    for y in 0..SIDE {
        for x in 0..SIDE {
            let dx = x as f64 + 0.5 - center;
            let dy = y as f64 + 0.5 - center;
            let distance = procedural_sqrt(dx * dx + dy * dy) / center;
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
            } else {
                (0, 0, 0, 0)
            };
            let offset = (y * SIDE + x) * 4;
            pixels[offset] = if alpha == 0 { 0 } else { red };
            pixels[offset + 1] = if alpha == 0 { 0 } else { green };
            pixels[offset + 2] = if alpha == 0 { 0 } else { blue };
            pixels[offset + 3] = alpha;
        }
    }
    write_rgba_canvas(canvas, SIDE as u32, SIDE as u32, &pixels)
}

/// Rasterizes the nine radial fog/smoke rings directly in Rust/WebSys.
#[wasm_bindgen(js_name = createFogSprite)]
pub fn create_fog_sprite(
    canvas: &HtmlCanvasElement,
    rings: &Float64Array,
) -> Result<bool, JsValue> {
    const WIDTH: usize = 512;
    const HEIGHT: usize = 256;
    if rings.length() != 27 {
        return Ok(false);
    }
    let mut inputs = [(0.0, 0.0, 0.0); 9];
    for index in 0..9 {
        let x = rings.get_index(index * 3);
        let y = rings.get_index(index * 3 + 1);
        let radius = rings.get_index(index * 3 + 2);
        if !x.is_finite()
            || !y.is_finite()
            || !radius.is_finite()
            || x < 0.0
            || x > WIDTH as f64
            || y < 0.0
            || y > HEIGHT as f64
            || radius <= 0.0
            || radius > 256.0
        {
            return Ok(false);
        }
        inputs[index as usize] = (x, y, radius);
    }
    let mut pixels = vec![0u8; WIDTH * HEIGHT * 4];
    for (center_x, center_y, radius) in inputs {
        let left = (center_x - radius).floor().max(0.0).min(WIDTH as f64) as usize;
        let top = (center_y - radius).floor().max(0.0).min(HEIGHT as f64) as usize;
        let right = (center_x + radius).ceil().max(0.0).min(WIDTH as f64) as usize;
        let bottom = (center_y + radius).ceil().max(0.0).min(HEIGHT as f64) as usize;
        let radius_squared = radius * radius;
        for y in top..bottom {
            for x in left..right {
                let dx = x as f64 + 0.5 - center_x;
                let dy = y as f64 + 0.5 - center_y;
                let distance_squared = dx * dx + dy * dy;
                if distance_squared >= radius_squared {
                    continue;
                }
                let remaining = 1.0 - procedural_sqrt(distance_squared) / radius;
                if remaining <= 0.0 {
                    continue;
                }
                let source_alpha = 0.55 * remaining;
                let offset = (y * WIDTH + x) * 4;
                let destination_alpha = pixels[offset + 3] as f64 / 255.0;
                pixels[offset] = 255;
                pixels[offset + 1] = 255;
                pixels[offset + 2] = 255;
                pixels[offset + 3] =
                    ((source_alpha + destination_alpha * (1.0 - source_alpha)) * 255.0 + 0.5) as u8;
            }
        }
    }
    write_rgba_canvas(canvas, WIDTH as u32, HEIGHT as u32, &pixels)
}

/// Generates the cached stair/elevator/door gradient directly in Rust/WebSys.
#[wasm_bindgen(js_name = createTransportGradient)]
pub fn create_transport_gradient(
    canvas: &HtmlCanvasElement,
    width: u32,
    height: u32,
    kind: u32,
    offset_x: f64,
    gradient_width: f64,
) -> Result<bool, JsValue> {
    if width == 0
        || height == 0
        || width > 660
        || height > 660
        || kind > 2
        || !offset_x.is_finite()
        || !gradient_width.is_finite()
        || gradient_width <= 0.0
    {
        return Ok(false);
    }
    let mut pixels = vec![0u8; width as usize * height as usize * 4];
    for y in 0..height as usize {
        for x in 0..width as usize {
            let t = if kind == 1 {
                (y as f64 + 0.5) / height as f64
            } else {
                (x as f64 + 0.5) / width as f64
            };
            let (from, to, local_t) = match kind {
                0 => ([109.0, 109.0, 140.0], [58.0, 58.0, 82.0], t),
                1 => ([44.0, 61.0, 82.0], [20.0, 32.0, 44.0], t),
                _ => {
                    let door_t = (offset_x + x as f64 + 0.5) / gradient_width;
                    if door_t < 0.5 {
                        ([201.0, 214.0, 227.0], [143.0, 160.0, 180.0], door_t * 2.0)
                    } else {
                        (
                            [143.0, 160.0, 180.0],
                            [201.0, 214.0, 227.0],
                            (door_t - 0.5) * 2.0,
                        )
                    }
                }
            };
            let offset = (y * width as usize + x) * 4;
            pixels[offset] = (from[0] + (to[0] - from[0]) * local_t) as u8;
            pixels[offset + 1] = (from[1] + (to[1] - from[1]) * local_t) as u8;
            pixels[offset + 2] = (from[2] + (to[2] - from[2]) * local_t) as u8;
            pixels[offset + 3] = 255;
        }
    }
    write_rgba_canvas(canvas, width, height, &pixels)
}

/// Generates the cached exit glow fill directly in Rust/WebSys.
#[wasm_bindgen(js_name = createExitGradient)]
pub fn create_exit_gradient(
    canvas: &HtmlCanvasElement,
    width: u32,
    height: u32,
    cleared: bool,
) -> Result<bool, JsValue> {
    if width == 0 || height == 0 || width > 660 || height > 660 {
        return Ok(false);
    }
    let dx = width as f64;
    let dy = height as f64;
    let length_squared = dx * dx + dy * dy;
    if length_squared <= 0.0 {
        return Ok(false);
    }
    let (start_rgb, end_rgb, start_alpha, end_alpha) = if cleared {
        ([25.0, 240.0, 230.0], [255.0, 210.0, 63.0], 0.4, 0.24)
    } else {
        ([255.0, 46.0, 147.0], [45.0, 15.0, 92.0], 0.2, 0.25)
    };
    let mut pixels = vec![0u8; width as usize * height as usize * 4];
    for y in 0..height as usize {
        for x in 0..width as usize {
            let projection = ((x as f64 + 0.5) * dx + (y as f64 + 0.5) * dy) / length_squared;
            let t = projection.max(0.0).min(1.0);
            let offset = (y * width as usize + x) * 4;
            pixels[offset] = (start_rgb[0] + (end_rgb[0] - start_rgb[0]) * t) as u8;
            pixels[offset + 1] = (start_rgb[1] + (end_rgb[1] - start_rgb[1]) * t) as u8;
            pixels[offset + 2] = (start_rgb[2] + (end_rgb[2] - start_rgb[2]) * t) as u8;
            pixels[offset + 3] =
                ((start_alpha + (end_alpha - start_alpha) * t) * 255.0 + 0.5) as u8;
        }
    }
    write_rgba_canvas(canvas, width, height, &pixels)
}

#[wasm_bindgen(js_name = createCanvasImageData)]
pub fn create_canvas_image_data(
    context: &CanvasRenderingContext2d,
    width: u32,
    height: u32,
) -> Result<Option<ImageData>, JsValue> {
    if width == 0 || height == 0 || width > 1600 || height > 1200 {
        return Ok(None);
    }
    Ok(Some(context.create_image_data_with_sw_and_sh(
        width as f64,
        height as f64,
    )?))
}

#[wasm_bindgen(js_name = putCanvasImageData)]
pub fn put_canvas_image_data(
    context: &CanvasRenderingContext2d,
    image: &ImageData,
    pixels: &Uint8ClampedArray,
    width: u32,
    height: u32,
) -> Result<bool, JsValue> {
    let expected = width
        .checked_mul(height)
        .and_then(|size| size.checked_mul(4));
    if width == 0
        || height == 0
        || width > 1600
        || height > 1200
        || expected != Some(pixels.length())
        || image.width() != width
        || image.height() != height
    {
        return Ok(false);
    }
    let data = Reflect::get(image.as_ref(), &JsValue::from_str("data"))?
        .dyn_into::<Uint8ClampedArray>()?;
    data.set(pixels.as_ref(), 0);
    context.put_image_data(image, 0.0, 0.0)?;
    Ok(true)
}

#[wasm_bindgen(js_name = clearCanvasRect)]
pub fn clear_canvas_rect(
    context: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() || !width.is_finite() || !height.is_finite() {
        return Ok(false);
    }
    context.clear_rect(x, y, width, height);
    Ok(true)
}

#[wasm_bindgen(js_name = setCanvasImageSmoothing)]
pub fn set_canvas_image_smoothing(context: &CanvasRenderingContext2d, enabled: bool) -> bool {
    context.set_image_smoothing_enabled(enabled);
    true
}

#[wasm_bindgen(js_name = createTextImage)]
pub fn create_text_image(
    canvas: &HtmlCanvasElement,
    text: &str,
    font: &str,
    color: &str,
    outlined: bool,
) -> Result<bool, JsValue> {
    if text.len() > 4096
        || font.is_empty()
        || font.len() > 256
        || color.is_empty()
        || color.len() > 128
    {
        return Ok(false);
    }
    let context = canvas
        .get_context("2d")?
        .ok_or_else(|| JsValue::from_str("2D Canvas context unavailable"))?
        .dyn_into::<CanvasRenderingContext2d>()?;
    context.set_font(font);
    let measured_width = context.measure_text(text)?.width();
    if !measured_width.is_finite() || measured_width < 0.0 || measured_width > 2040.0 {
        return Ok(false);
    }
    let font_size = first_px_font_size(font).unwrap_or(16) as f64;
    let width = measured_width.ceil() as u32 + if outlined { 12 } else { 4 };
    let height = if outlined {
        (font_size * 1.5).ceil() as u32 + 10
    } else {
        24
    };
    if height == 0 || height > 256 {
        return Ok(false);
    }
    canvas.set_width(width);
    canvas.set_height(height);
    context.set_font(font);
    context.set_text_baseline("alphabetic");
    if outlined {
        let baseline = (font_size * 1.15).ceil() + 4.0;
        context.set_line_width(5.0);
        context.set_line_join("round");
        context.set_stroke_style_str("#0b0218");
        context.set_fill_style_str(color);
        context.stroke_text(text, 6.0, baseline)?;
        context.fill_text(text, 6.0, baseline)?;
    } else {
        context.set_fill_style_str(color);
        context.fill_text(text, 2.0, 17.0)?;
    }
    Ok(true)
}

fn first_px_font_size(font: &str) -> Option<u32> {
    let px = font.find("px")?;
    let bytes = font.as_bytes();
    let mut start = px;
    while start > 0 && bytes[start - 1].is_ascii_digit() {
        start -= 1;
    }
    if start == px {
        return None;
    }
    font[start..px].parse().ok()
}

/// Direct Rust/web-sys painter for the full shared eight-number command ABI.
#[wasm_bindgen(js_name = drawBatchCommands)]
pub fn draw_batch_commands(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    furniture_colors: &Array,
    actor_colors: &Array,
    batch: &JsValue,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 8;
    const MAX_COMMANDS: u32 = 250_000;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > MAX_COMMANDS {
        return Ok(-1);
    }
    let mut enemy_text_index = 0;
    for offset in (0..length).step_by(STRIDE as usize) {
        let opf = commands.get_index(offset);
        let cf = commands.get_index(offset + 1);
        if !opf.is_finite()
            || opf.fract() != 0.0
            || !(1.0..=39.0).contains(&opf)
            || !cf.is_finite()
            || cf.fract() != 0.0
            || cf < 0.0
        {
            return Ok(-1);
        }
        let op = opf as u32;
        let color = cf as u32;
        if matches!(op, 4 | 5) && color >= furniture_colors.length() {
            return Ok(-1);
        }
        if matches!(op, 23 | 24) && color >= actor_colors.length() {
            return Ok(-1);
        }
        for field in 2..STRIDE {
            if !commands.get_index(offset + field).is_finite() {
                return Ok(-1);
            }
        }
        match op {
            21 => {
                let image = batch_prop(batch, "doorImage")?;
                if !image.is_null() && !image.is_undefined() && !supported_image(&image) {
                    return Ok(-1);
                }
            }
            22 | 26 => {
                let key = if op == 22 {
                    "enemySheet"
                } else {
                    "playerSheet"
                };
                let image = batch_prop(batch, key)?;
                if image.is_null()
                    || image.is_undefined()
                    || !image.is_instance_of::<HtmlImageElement>()
                {
                    return Ok(-1);
                }
            }
            27 => {
                let frames = batch_array(batch, "playerFrames")?;
                if color >= frames.length()
                    || !frames.get(color).is_instance_of::<HtmlCanvasElement>()
                {
                    return Ok(-1);
                }
            }
            28 => {
                let values = batch_array(batch, "skinColors")?;
                if color >= values.length() || values.get(color).as_string().is_none() {
                    return Ok(-1);
                }
            }
            29 => {
                let values = batch_array(batch, "playerIsP2")?;
                if color >= values.length() || values.get(color).as_bool().is_none() {
                    return Ok(-1);
                }
            }
            30 => {
                let images = batch_array(batch, "enemyTextImages")?;
                if enemy_text_index >= images.length() {
                    return Ok(-1);
                }
                let entry = images.get(enemy_text_index);
                let image = Reflect::get(&entry, &JsValue::from_str("image"))?;
                let x = Reflect::get(&entry, &JsValue::from_str("x"))?
                    .as_f64()
                    .unwrap_or(f64::NAN);
                let y = Reflect::get(&entry, &JsValue::from_str("y"))?
                    .as_f64()
                    .unwrap_or(f64::NAN);
                if !supported_image(&image) || !x.is_finite() || !y.is_finite() {
                    return Ok(-1);
                }
                enemy_text_index += 1;
            }
            31 => {
                let textures = batch_prop(batch, "mapTextures")?;
                let image = if color == 0 {
                    Reflect::get(&textures, &JsValue::from_str("wallFace"))?
                } else {
                    Reflect::get(&textures, &JsValue::from_str("furnitureFaces"))?
                        .unchecked_into::<Array>()
                        .get(commands.get_index(offset + 2) as u32)
                };
                if !supported_image(&image) {
                    return Ok(-1);
                }
            }
            32 => {
                let textures = batch_prop(batch, "mapTextures")?;
                if !supported_image(&Reflect::get(&textures, &JsValue::from_str("doorOpen"))?) {
                    return Ok(-1);
                }
            }
            33 => {
                let pattern = batch_prop(batch, "floorTilePattern")?;
                if pattern.is_null()
                    || pattern.is_undefined()
                    || !pattern.is_instance_of::<CanvasPattern>()
                {
                    return Ok(-1);
                }
            }
            34 => {
                let image = batch_array(batch, "spriteImages")?.get(color);
                if !image.is_null() && !image.is_undefined() {
                    let complete = Reflect::get(&image, &JsValue::from_str("complete"))?
                        .as_bool()
                        .unwrap_or(false);
                    let width = Reflect::get(&image, &JsValue::from_str("naturalWidth"))?
                        .as_f64()
                        .unwrap_or(0.0);
                    if complete && width > 0.0 && !supported_image(&image) {
                        return Ok(-1);
                    }
                }
            }
            36 | 37 => {
                let values = batch_array(batch, "colors")?;
                if color >= values.length() || values.get(color).as_string().is_none() {
                    return Ok(-1);
                }
            }
            _ => {}
        }
    }
    let mut enemy_text_index = 0;
    for offset in (0..length).step_by(STRIDE as usize) {
        let op = commands.get_index(offset) as u32;
        let color = commands.get_index(offset + 1) as u32;
        let a = commands.get_index(offset + 2);
        let b = commands.get_index(offset + 3);
        let c = commands.get_index(offset + 4);
        let d = commands.get_index(offset + 5);
        let e = commands.get_index(offset + 6);
        let f = commands.get_index(offset + 7);
        match op {
            1 => {
                context.save();
                context.set_shadow_color("rgba(0,0,0,.28)");
                context.set_shadow_blur(5.0);
                context.set_shadow_offset_x(1.0);
                context.set_shadow_offset_y(2.0);
            }
            2 => context.restore(),
            3 => context.set_line_width(a),
            4 => context.set_fill_style_str(&furniture_colors.get(color).as_string().unwrap()),
            5 => context.set_stroke_style_str(&furniture_colors.get(color).as_string().unwrap()),
            6 => context.fill_rect(a, b, c, d),
            7 => context.stroke_rect(a, b, c, d),
            8 => context.begin_path(),
            9 => context.move_to(a, b),
            10 => context.line_to(a, b),
            11 => context.arc(a, b, c, d, e)?,
            12 => context.ellipse(a, b, c, d, e, 0.0, f)?,
            13 => context.fill(),
            14 => context.stroke(),
            15 => {
                context.save();
                context.set_shadow_color("rgba(0,0,0,.62)");
                context.set_shadow_blur(2.0);
                context.set_shadow_offset_x(1.0);
                context.set_shadow_offset_y(2.0);
            }
            16 => context.save(),
            17 => context.set_line_cap("round"),
            18 => context.set_global_alpha(a),
            19 => context.translate(a, b)?,
            20 => context.rotate(a)?,
            21 => {
                let image = batch_prop(batch, "doorImage")?;
                if !image.is_null() && !image.is_undefined() {
                    context.set_image_smoothing_enabled(true);
                    draw_image_at(context, &image, &[a, b, c, d])?;
                }
            }
            22 | 26 => {
                let key = if op == 22 {
                    "enemySheet"
                } else {
                    "playerSheet"
                };
                let image = batch_prop(batch, key)?;
                if op == 22 {
                    context.set_image_smoothing_enabled(true);
                }
                draw_image_at(
                    context,
                    &image,
                    &[a * 24.0, b * 24.0, 24.0, 24.0, -11.5, -11.5, 24.0, 24.0],
                )?;
            }
            23 => context.set_fill_style_str(&actor_colors.get(color).as_string().unwrap()),
            24 => context.set_stroke_style_str(&actor_colors.get(color).as_string().unwrap()),
            25 => context.set_image_smoothing_enabled(a != 0.0),
            27 => {
                let frames = batch_array(batch, "playerFrames")?;
                draw_image_at(context, &frames.get(color), &[-11.5, -11.5])?;
            }
            28 => {
                let values = batch_array(batch, "skinColors")?;
                context.set_fill_style_str(&values.get(color).as_string().unwrap());
            }
            29 => {
                let values = batch_array(batch, "playerIsP2")?;
                let p2 = values.get(color).as_bool().unwrap_or(false);
                context.set_fill_style_str(if p2 { "#ff2e93" } else { "#19f0e6" });
                context.set_font("bold 10px Rajdhani,sans-serif");
                context.set_text_align("center");
                context.fill_text(if p2 { "P2" } else { "P1" }, a, b)?;
            }
            30 => {
                let entry = batch_array(batch, "enemyTextImages")?.get(enemy_text_index);
                let image = Reflect::get(&entry, &JsValue::from_str("image"))?;
                let x = Reflect::get(&entry, &JsValue::from_str("x"))?
                    .as_f64()
                    .unwrap_or(0.0);
                let y = Reflect::get(&entry, &JsValue::from_str("y"))?
                    .as_f64()
                    .unwrap_or(0.0);
                draw_image_at(context, &image, &[x, y])?;
                enemy_text_index += 1;
            }
            31 => {
                let textures = batch_prop(batch, "mapTextures")?;
                let image = if color == 0 {
                    Reflect::get(&textures, &JsValue::from_str("wallFace"))?
                } else {
                    Reflect::get(&textures, &JsValue::from_str("furnitureFaces"))?
                        .unchecked_into::<Array>()
                        .get(a as u32)
                };
                with_context_save(context, || {
                    context.begin_path();
                    context.rect(b, c, d, e);
                    context.clip();
                    if color == 1 {
                        context.set_image_smoothing_enabled(false);
                    }
                    if let Some(pattern) = repeat_pattern(context, &image)? {
                        context.set_fill_style_canvas_pattern(&pattern);
                        context.fill_rect(b, c, d, e);
                    }
                    Ok(())
                })?;
            }
            32 => {
                let textures = batch_prop(batch, "mapTextures")?;
                let image = Reflect::get(&textures, &JsValue::from_str("doorOpen"))?;
                with_context_save(context, || {
                    context.set_image_smoothing_enabled(false);
                    context.translate(a, b)?;
                    if e != 0.0 {
                        context.rotate(core::f64::consts::FRAC_PI_2)?;
                    }
                    draw_image_at(context, &image, &[-c / 2.0, -d / 2.0, c, d])?;
                    Ok(())
                })?;
            }
            33 => {
                let pattern: CanvasPattern =
                    batch_prop(batch, "floorTilePattern")?.unchecked_into();
                with_context_save(context, || {
                    context.begin_path();
                    context.rect(a, b, c, d);
                    context.clip();
                    context.translate(e, 0.0)?;
                    context.set_global_alpha(0.45);
                    context.set_fill_style_canvas_pattern(&pattern);
                    context.fill_rect(a, b, c + 48.0, d + 48.0);
                    Ok(())
                })?;
            }
            34 => {
                let image = batch_array(batch, "spriteImages")?.get(color);
                if !image.is_null() && !image.is_undefined() {
                    let complete = Reflect::get(&image, &JsValue::from_str("complete"))?
                        .as_bool()
                        .unwrap_or(false);
                    let width = Reflect::get(&image, &JsValue::from_str("naturalWidth"))?
                        .as_f64()
                        .unwrap_or(0.0);
                    if complete && width > 0.0 {
                        draw_image_at(context, &image, &[a, b])?;
                    }
                }
            }
            35 => {
                if color != 0 {
                    context.close_path();
                } else {
                    context.line_to(a, b);
                }
            }
            36 => {
                let values = batch_array(batch, "colors")?;
                context.set_fill_style_str(&values.get(color).as_string().unwrap());
            }
            37 => {
                let values = batch_array(batch, "colors")?;
                context.set_stroke_style_str(&values.get(color).as_string().unwrap());
            }
            38 => {
                let dash = Array::new();
                dash.push(&JsValue::from_f64(a));
                dash.push(&JsValue::from_f64(b));
                context.set_line_dash(&dash)?;
            }
            39 => context.scale(a, b)?,
            _ => unreachable!(),
        }
    }
    Ok((length / STRIDE) as i32)
}

/// Draws Rust-generated static map command batches directly through Canvas.
#[wasm_bindgen(js_name = drawMapCommands)]
pub fn draw_map_commands(
    context: &CanvasRenderingContext2d,
    commands: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 8;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 250_000 {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let op = commands.get_index(offset);
        let color = commands.get_index(offset + 1);
        if !op.is_finite()
            || op.fract() != 0.0
            || !(1.0..=22.0).contains(&op)
            || !color.is_finite()
            || color.fract() != 0.0
            || color < 0.0
        {
            return Ok(-1);
        }
        for field in 2..STRIDE {
            if !commands.get_index(offset + field).is_finite() {
                return Ok(-1);
            }
        }
        if matches!(op as u32, 15 | 16)
            && (color as u32) < colors.length()
            && colors.get(color as u32).as_string().is_none()
        {
            return Ok(-1);
        }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let op = commands.get_index(offset) as u32;
        let color = commands.get_index(offset + 1) as u32;
        let x = commands.get_index(offset + 2);
        let y = commands.get_index(offset + 3);
        let w = commands.get_index(offset + 4);
        let h = commands.get_index(offset + 5);
        let line = commands.get_index(offset + 6);
        let alpha = commands.get_index(offset + 7);
        context.save();
        context.set_global_alpha(alpha);
        match op {
            1 => {
                context.set_stroke_style_str("#f4d7ff");
                context.set_line_width(line);
                context.stroke_rect(x, y, w, h);
            }
            2 => {
                context.set_stroke_style_str("#19f0e6");
                context.set_line_width(line);
                context.begin_path();
                context.move_to(x, y);
                context.line_to(w, h);
                context.stroke();
            }
            3 => {
                context.set_fill_style_str(if color == 2 {
                    "rgba(5,0,20,.10)"
                } else {
                    "rgba(255,255,255,.035)"
                });
                context.fill_rect(x, y, w, h);
            }
            4..=9 | 11..=13 => {
                let fill = match op {
                    4 => "rgba(0, 0, 0, 0.4)",
                    5 => "#c8c8d8",
                    6 => "#f0eff8",
                    7 => "#a0a0b5",
                    8 => "#e5e4ef",
                    9 => "#77778d",
                    11 => "rgba(25,240,230,.18)",
                    12 => "#f4f2ff",
                    _ => "#b5b5c8",
                };
                context.set_fill_style_str(fill);
                context.fill_rect(x, y, w, h);
            }
            10 | 14 => {
                context.set_stroke_style_str(if op == 10 { "#5d5d73" } else { "#383849" });
                context.set_line_width(line);
                context.stroke_rect(x, y, w, h);
            }
            15 => {
                if color < colors.length() {
                    if let Some(fill) = colors.get(color).as_string() {
                        context.set_fill_style_str(&fill);
                    }
                }
                context.fill_rect(x, y, w, h);
            }
            16 => {
                if color < colors.length() {
                    if let Some(stroke) = colors.get(color).as_string() {
                        context.set_stroke_style_str(&stroke);
                    }
                }
                context.set_line_width(line);
                context.stroke_rect(x, y, w, h);
            }
            17 => {
                context.set_fill_style_str("#07010f");
                context.fill_rect(x, y, w, h);
            }
            18 => {
                context.set_fill_style_str("rgba(255,240,230,.08)");
                context.fill_rect(x, y, w, h);
            }
            19 => {
                context.set_fill_style_str("rgba(110,225,255,.22)");
                context.fill_rect(x, y, w, h);
            }
            20 => {
                context.set_stroke_style_str("rgba(210,255,255,.85)");
                context.set_line_width(line);
                context.stroke_rect(x, y, w, h);
            }
            21 => {
                context.set_stroke_style_str("rgba(255,255,255,.55)");
                context.set_line_width(line);
                context.begin_path();
                context.move_to(x, y);
                context.line_to(w, h);
                context.stroke();
            }
            22 => {
                context.set_stroke_style_str("rgba(210,250,255,.75)");
                context.set_line_width(line);
                context.begin_path();
                context.move_to(x - w * 0.45, y - h * 0.35);
                context.line_to(x + w * 0.2, y + h * 0.15);
                context.line_to(x - w * 0.1, y + h * 0.42);
                context.move_to(x + w * 0.42, y - h * 0.38);
                context.line_to(x - w * 0.05, y + h * 0.05);
                context.stroke();
            }
            _ => unreachable!(),
        }
        context.restore();
    }
    Ok((length / STRIDE) as i32)
}

/// Paints the optional fixed-map backing directly in Rust/WebSys.
#[wasm_bindgen(js_name = paintMapBase)]
pub fn paint_map_base_direct(
    context: &CanvasRenderingContext2d,
    fixed_map: bool,
    width: f64,
    height: f64,
) -> bool {
    if !width.is_finite() || !height.is_finite() || width < 0.0 || height < 0.0 {
        return false;
    }
    if !fixed_map {
        return true;
    }
    context.save();
    context.set_fill_style_str("#07010f");
    context.fill_rect(0.0, 0.0, width, height);
    context.restore();
    true
}

/// Paints the translucent map light layer directly in Rust/WebSys.
#[wasm_bindgen(js_name = paintMapOverlay)]
pub fn paint_map_overlay_direct(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
) -> bool {
    if !width.is_finite() || !height.is_finite() || width < 0.0 || height < 0.0 {
        return false;
    }
    context.save();
    context.set_fill_style_str("rgba(255,240,230,.08)");
    context.fill_rect(0.0, 0.0, width, height);
    context.restore();
    true
}

/// Generates and paints static room decor directly, preserving rug details and input order.
#[wasm_bindgen(js_name = drawMapDecor)]
pub fn draw_map_decor_direct(
    context: &CanvasRenderingContext2d,
    decor: &Float64Array,
    colors: &Array,
) -> Result<i32, JsValue> {
    const STRIDE: u32 = 6;
    let length = decor.length();
    if length % STRIDE != 0 || length / STRIDE > 250_000 {
        return Ok(-1);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        for field in 0..STRIDE {
            if !decor.get_index(offset + field).is_finite() {
                return Ok(-1);
            }
        }
        let kind = decor.get_index(offset + 4);
        let color = decor.get_index(offset + 5);
        if kind.fract() != 0.0 || !(0.0..=1.0).contains(&kind)
            || color.fract() != 0.0 || color < 0.0
        {
            return Ok(-1);
        }
        if kind == 0.0
            && (color as u32) >= colors.length()
        {
            return Ok(-1);
        }
        if kind == 0.0 && colors.get(color as u32).as_string().is_none() {
            return Ok(-1);
        }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = decor.get_index(offset);
        let y = decor.get_index(offset + 1);
        let width = decor.get_index(offset + 2);
        let height = decor.get_index(offset + 3);
        let is_rug = decor.get_index(offset + 4) == 1.0;
        context.save();
        if is_rug {
            context.set_fill_style_str("#20a9b0");
            context.fill_rect(x, y, width, height);
            context.set_stroke_style_str("#0e6a70");
            context.set_line_width(2.0);
            context.stroke_rect(x + 1.0, y + 1.0, width - 2.0, height - 2.0);
            context.set_stroke_style_str("rgba(255,255,255,.35)");
            context.set_line_width(1.0);
            context.stroke_rect(x + 8.0, y + 8.0, width - 16.0, height - 16.0);
        } else {
            if let Some(fill) = colors.get(decor.get_index(offset + 5) as u32).as_string() {
                context.set_fill_style_str(&fill);
            }
            context.fill_rect(x, y, width, height);
        }
        context.restore();
    }
    Ok((length / STRIDE) as i32)
}

#[inline]
fn map_detail_random(state: &mut u32) -> f64 {
    *state = state.wrapping_add(0x6D2B79F5);
    let mut value = (*state ^ (*state >> 15)).wrapping_mul(1 | *state);
    value = (value.wrapping_add((value ^ (value >> 7)).wrapping_mul(61 | value))) ^ value;
    ((value ^ (value >> 14)) as u32) as f64 / 4_294_967_296.0
}

/// Generates and paints static room inlays and floor specks, returning the advanced RNG state.
#[wasm_bindgen(js_name = drawMapDetails)]
pub fn draw_map_details_direct(
    context: &CanvasRenderingContext2d,
    rooms: &Float64Array,
    width: f64,
    height: f64,
    seed: u32,
) -> Result<f64, JsValue> {
    const STRIDE: u32 = 4;
    let length = rooms.length();
    if length % STRIDE != 0 || length / STRIDE > 250_000
        || !width.is_finite() || !height.is_finite() || width < 0.0 || height < 0.0
    {
        return Ok(f64::NAN);
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        for field in 0..STRIDE {
            if !rooms.get_index(offset + field).is_finite() {
                return Ok(f64::NAN);
            }
        }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = rooms.get_index(offset);
        let y = rooms.get_index(offset + 1);
        let room_width = rooms.get_index(offset + 2);
        let room_height = rooms.get_index(offset + 3);
        if room_width < 70.0 || room_height < 70.0 { continue; }
        context.save();
        context.set_global_alpha(0.22);
        context.set_stroke_style_str("#f4d7ff");
        context.set_line_width(2.0);
        context.stroke_rect(x + 9.0, y + 9.0, (room_width - 18.0).max(0.0), (room_height - 18.0).max(0.0));
        context.restore();
        let mut line_y = y + 22.0;
        while line_y < y + room_height - 12.0 {
            context.save();
            context.set_global_alpha(0.10);
            context.set_stroke_style_str("#19f0e6");
            context.set_line_width(1.0);
            context.begin_path();
            context.move_to(x + 10.0, line_y);
            context.line_to(x + (room_width - 10.0).min(58.0), line_y);
            context.stroke();
            context.restore();
            line_y += 44.0;
        }
    }
    let specks = ((width * height / 18_000.0) as u32).min(180);
    let mut state = seed;
    for _ in 0..specks {
        let x = (map_detail_random(&mut state) * (width - 12.0).max(1.0)).floor();
        let y = (map_detail_random(&mut state) * (height - 12.0).max(1.0)).floor();
        let color = if map_detail_random(&mut state) < 0.5 { "rgba(5,0,20,.10)" } else { "rgba(255,255,255,.035)" };
        let rect_width = 3.0 + map_detail_random(&mut state) * 8.0;
        let rect_height = 2.0 + map_detail_random(&mut state) * 5.0;
        context.save();
        context.set_fill_style_str(color);
        context.fill_rect(x, y, rect_width, rect_height);
        context.restore();
    }
    Ok(state as f64)
}

/// Draws map shadows directly, with separate offsets for walls and furniture.
#[wasm_bindgen(js_name = drawMapShadows)]
pub fn draw_map_shadows_direct(
    context: &CanvasRenderingContext2d,
    rectangles: &Float64Array,
) -> i32 {
    const STRIDE: u32 = 5;
    let length = rectangles.length();
    if length % STRIDE != 0 || length / STRIDE > 250_000 {
        return -1;
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        for field in 0..4 {
            if !rectangles.get_index(offset + field).is_finite() { return -1; }
        }
        let kind = rectangles.get_index(offset + 4);
        if kind.fract() != 0.0 || !(0.0..=1.0).contains(&kind) { return -1; }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let furniture = rectangles.get_index(offset + 4) == 1.0;
        let dx = if furniture { 4.0 } else { 6.0 };
        let dy = if furniture { 6.0 } else { 8.0 };
        context.save();
        context.set_fill_style_str("rgba(0, 0, 0, 0.4)");
        context.fill_rect(
            rectangles.get_index(offset) + dx,
            rectangles.get_index(offset + 1) + dy,
            rectangles.get_index(offset + 2),
            rectangles.get_index(offset + 3),
        );
        context.restore();
    }
    (length / STRIDE) as i32
}

#[inline]
fn structure_fill(context: &CanvasRenderingContext2d, color: &str, x: f64, y: f64, width: f64, height: f64) {
    context.save();
    context.set_fill_style_str(color);
    context.fill_rect(x, y, width, height);
    context.restore();
}

#[inline]
fn structure_stroke(context: &CanvasRenderingContext2d, color: &str, line: f64, x: f64, y: f64, width: f64, height: f64) {
    context.save();
    context.set_stroke_style_str(color);
    context.set_line_width(line);
    context.stroke_rect(x, y, width, height);
    context.restore();
}

/// Generates and paints wall faces and decorative posts directly in Rust/WebSys.
#[wasm_bindgen(js_name = drawMapStructure)]
pub fn draw_map_structure_direct(
    context: &CanvasRenderingContext2d,
    geometry: &Float64Array,
) -> i32 {
    const STRIDE: u32 = 5;
    let length = geometry.length();
    if length % STRIDE != 0 || length / STRIDE > 250_000 { return -1; }
    for offset in (0..length).step_by(STRIDE as usize) {
        for field in 0..4 {
            if !geometry.get_index(offset + field).is_finite() { return -1; }
        }
        let kind = geometry.get_index(offset + 4);
        if kind.fract() != 0.0 || !(0.0..=1.0).contains(&kind) { return -1; }
    }
    let mut commands = 0;
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = geometry.get_index(offset);
        let y = geometry.get_index(offset + 1);
        let width = geometry.get_index(offset + 2);
        let height = geometry.get_index(offset + 3);
        let is_post = geometry.get_index(offset + 4) == 1.0;
        if is_post {
            structure_fill(context, "rgba(25,240,230,.18)", x - 10.0, y - 10.0, 20.0, 20.0);
            structure_fill(context, "#f4f2ff", x - 7.0, y - 7.0, 14.0, 14.0);
            structure_fill(context, "#b5b5c8", x - 5.0, y - 5.0, 10.0, 10.0);
            structure_stroke(context, "#383849", 2.0, x - 7.0, y - 7.0, 14.0, 14.0);
            commands += 4;
        } else {
            structure_fill(context, "#c8c8d8", x, y, width, height);
            structure_fill(context, "#f0eff8", x, y, width, 4.0_f64.min(height));
            structure_fill(context, "#a0a0b5", x, y + (height - 4.0).max(0.0), width, 4.0_f64.min(height));
            structure_fill(context, "#e5e4ef", x, y, 4.0_f64.min(width), height);
            structure_fill(context, "#77778d", x + (width - 4.0).max(0.0), y, 4.0_f64.min(width), height);
            structure_stroke(context, "#5d5d73", 1.0, x + 0.5, y + 0.5, width - 1.0, height - 1.0);
            commands += 6;
        }
    }
    commands
}

/// Applies the campaign tile map's themed wall faces and trims directly through Rust/WebSys.
#[wasm_bindgen(js_name = drawTileWalls)]
pub fn draw_tile_walls_direct(
    context: &CanvasRenderingContext2d,
    walls: &Float64Array,
    wall_color: &str,
    trim_color: &str,
) -> i32 {
    if walls.length() % 4 != 0 || walls.length() / 4 > 250_000
        || wall_color.is_empty() || trim_color.is_empty()
    { return -1; }
    for offset in (0..walls.length()).step_by(4) {
        let x = walls.get_index(offset);
        let y = walls.get_index(offset + 1);
        let width = walls.get_index(offset + 2);
        let height = walls.get_index(offset + 3);
        if !x.is_finite() || !y.is_finite() || !width.is_finite() || !height.is_finite()
            || width < 0.0 || height < 0.0
        { return -1; }
    }
    for offset in (0..walls.length()).step_by(4) {
        let x = walls.get_index(offset);
        let y = walls.get_index(offset + 1);
        let width = walls.get_index(offset + 2);
        let height = walls.get_index(offset + 3);
        context.set_global_alpha(0.9);
        context.set_fill_style_str(wall_color);
        context.fill_rect(x, y, width, height);
        context.set_global_alpha(1.0);
        context.set_fill_style_str(trim_color);
        context.fill_rect(x, y, width, 3.0);
        context.fill_rect(x, y + height - 3.0, width, 3.0);
    }
    (walls.length() / 4 * 3) as i32
}

/// Generates and paints intact breakable panes and transient glass fragments directly.
#[wasm_bindgen(js_name = drawMapBreakables)]
pub fn draw_map_breakables_direct(
    context: &CanvasRenderingContext2d,
    items: &Float64Array,
    panel_count: u32,
    shard_count: u32,
) -> i32 {
    const STRIDE: u32 = 5;
    let total = panel_count as u64 + shard_count as u64;
    if total > 250_000 || items.length() as u64 != total * STRIDE as u64 { return -1; }
    for offset in (0..items.length()).step_by(STRIDE as usize) {
        for field in 0..STRIDE {
            let value = items.get_index(offset + field);
            if !value.is_finite() || (field == 4 && offset >= panel_count * STRIDE && !(0.0..=1.0).contains(&value)) { return -1; }
        }
    }
    for index in 0..panel_count {
        let offset = index * STRIDE;
        let x = items.get_index(offset);
        let y = items.get_index(offset + 1);
        let width = items.get_index(offset + 2);
        let height = items.get_index(offset + 3);
        context.save();
        context.set_fill_style_str("rgba(110,225,255,.22)");
        context.fill_rect(x, y, width, height);
        context.set_stroke_style_str("rgba(210,255,255,.85)");
        context.set_line_width(2.0);
        context.stroke_rect(x + 1.0, y + 1.0, width - 2.0, height - 2.0);
        context.set_stroke_style_str("rgba(255,255,255,.55)");
        context.begin_path();
        context.move_to(x + 6.0, y + height - 6.0);
        context.line_to(x + width - 6.0, y + 6.0);
        context.stroke();
        context.restore();
    }
    for index in 0..shard_count {
        let offset = (panel_count + index) * STRIDE;
        let x = items.get_index(offset);
        let y = items.get_index(offset + 1);
        let width = items.get_index(offset + 2);
        let height = items.get_index(offset + 3);
        let alpha = items.get_index(offset + 4);
        context.save();
        context.set_global_alpha(alpha);
        context.set_stroke_style_str("rgba(210,250,255,.75)");
        context.set_line_width(1.5);
        context.begin_path();
        context.move_to(x - width * 0.45, y - height * 0.35);
        context.line_to(x + width * 0.2, y + height * 0.15);
        context.line_to(x - width * 0.1, y + height * 0.42);
        context.move_to(x + width * 0.42, y - height * 0.38);
        context.line_to(x - width * 0.05, y + height * 0.05);
        context.stroke();
        context.restore();
    }
    total as i32
}

/// Generates deterministic floor-grain pixels directly into ImageData and returns the advanced RNG state.
#[wasm_bindgen(js_name = drawFloorGrainRgba)]
pub fn draw_floor_grain_rgba_direct(
    data: &Uint8ClampedArray,
    width: u32,
    height: u32,
    seed: u32,
) -> f64 {
    if width == 0 || height == 0 || width > 1600 || height > 1200
        || data.length() as u64 != width as u64 * height as u64 * 4
    {
        return f64::NAN;
    }
    let w = width as usize;
    let h = height as usize;
    let mut pixels = vec![0u8; w * h * 4];
    let mut state = seed;
    let count = ((width as f64 * height as f64 / 160.0) + 0.5)
        .floor()
        .max(0.0)
        .min(2_000_000.0) as u32;
    for _ in 0..count {
        let white = map_detail_random(&mut state) >= 0.5;
        let x = (map_detail_random(&mut state) * width as f64).floor() as usize;
        let y = (map_detail_random(&mut state) * height as f64).floor() as usize;
        let rect_width = 1 + (map_detail_random(&mut state) * 2.0).floor() as usize;
        let source_alpha = if white { 15u32 } else { 23u32 };
        let source_premultiplied = if white { source_alpha } else { 0 };
        for px in x..(x + rect_width).min(w) {
            let offset = (y * w + px) * 4;
            let dest_alpha = pixels[offset + 3] as u32;
            let inverse_alpha = 255 - source_alpha;
            let out_alpha = source_alpha + dest_alpha * inverse_alpha / 255;
            for channel in 0..3 {
                let dest = pixels[offset + channel] as u32;
                let out = source_premultiplied + dest * inverse_alpha / 255;
                pixels[offset + channel] = out.min(255) as u8;
            }
            pixels[offset + 3] = out_alpha.min(255) as u8;
        }
    }
    for pixel in pixels.chunks_exact_mut(4) {
        let alpha = pixel[3] as u32;
        if alpha == 0 { continue; }
        for channel in 0..3 {
            let premultiplied = pixel[channel] as u32;
            pixel[channel] = ((premultiplied * 255 + alpha / 2) / alpha).min(255) as u8;
        }
    }
    data.copy_from(&pixels);
    state as f64
}

/// Paints repeating floor tiles with the Canvas clipping/compositing rules, called directly from Rust.
#[wasm_bindgen(js_name = drawFloorTilesCanvas)]
pub fn draw_floor_tiles_canvas_direct(
    context: &CanvasRenderingContext2d,
    tile_image: &HtmlImageElement,
    rooms: &Float64Array,
    hall_index: i32,
    tile_index: i32,
    width: u32,
    height: u32,
) -> Result<i32, JsValue> {
    let canvas = match context.canvas() { Some(canvas) => canvas, None => return Ok(-1) };
    if width == 0 || height == 0 || width > 1600 || height > 1200
        || canvas.width() != width || canvas.height() != height
        || tile_image.natural_width() != 72 || tile_image.natural_height() != 24
        || rooms.length() % 4 != 0 || rooms.length() / 4 > 8192
        || hall_index < -1 || hall_index >= rooms.length() as i32 / 4
        || !(0..=2).contains(&tile_index)
    { return Ok(-1); }
    for index in 0..(rooms.length() / 4) {
        if hall_index >= 0 && index == hall_index as u32 { continue; }
        let x = rooms.get_index(index * 4);
        let y = rooms.get_index(index * 4 + 1);
        let room_width = rooms.get_index(index * 4 + 2);
        let room_height = rooms.get_index(index * 4 + 3);
        if !x.is_finite() || !y.is_finite() || !room_width.is_finite() || !room_height.is_finite()
            || room_width <= 0.0 || room_height <= 0.0
            || !(x + room_width).is_finite() || !(y + room_height).is_finite()
        { return Ok(-1); }
    }
    let pattern = match context.create_pattern_with_html_image_element(tile_image, "repeat")? {
        Some(pattern) => pattern,
        None => return Ok(-1),
    };
    for index in 0..(rooms.length() / 4) {
        if hall_index >= 0 && index == hall_index as u32 { continue; }
        let x = rooms.get_index(index * 4);
        let y = rooms.get_index(index * 4 + 1);
        let room_width = rooms.get_index(index * 4 + 2);
        let room_height = rooms.get_index(index * 4 + 3);
        context.save();
        context.begin_path();
        context.rect(x, y, room_width, room_height);
        context.clip();
        context.translate(-(tile_index as f64) * 24.0, 0.0)?;
        context.set_global_alpha(0.45);
        context.set_fill_style_canvas_pattern(&pattern);
        context.fill_rect(x, y, room_width + 48.0, room_height + 48.0);
        context.restore();
    }
    Ok((rooms.length() / 4) as i32 - i32::from(hall_index >= 0))
}

/// Paints static floor shadows and grout on Canvas directly from Rust/WebSys.
#[wasm_bindgen(js_name = paintFloorFinishCanvas)]
pub fn paint_floor_finish_canvas_direct(
    context: &CanvasRenderingContext2d,
    solids: &Float64Array,
    width: u32,
    height: u32,
) -> i32 {
    let canvas = match context.canvas() { Some(canvas) => canvas, None => return -1 };
    if width == 0 || height == 0 || width > 1600 || height > 1200
        || canvas.width() != width || canvas.height() != height
        || solids.length() % 4 != 0 || solids.length() / 4 > 8192
    { return -1; }
    for offset in (0..solids.length()).step_by(4) {
        let x = solids.get_index(offset);
        let y = solids.get_index(offset + 1);
        let rect_width = solids.get_index(offset + 2);
        let rect_height = solids.get_index(offset + 3);
        if !x.is_finite() || !y.is_finite() || !rect_width.is_finite() || !rect_height.is_finite()
            || rect_width < 0.0 || rect_height < 0.0
        { return -1; }
    }
    context.set_fill_style_str("rgba(0,0,0,.32)");
    for offset in (0..solids.length()).step_by(4) {
        context.fill_rect(solids.get_index(offset) + 5.0, solids.get_index(offset + 1) + 7.0,
            solids.get_index(offset + 2), solids.get_index(offset + 3));
    }
    context.set_fill_style_str("rgba(0,0,0,.07)");
    let mut x = 0u32;
    while x < width { context.fill_rect(x as f64, 0.0, 1.0, height as f64); x += 24; }
    let mut y = 0u32;
    while y < height { context.fill_rect(0.0, y as f64, width as f64, 1.0); y += 24; }
    (solids.length() / 4) as i32 + ((width + 23) / 24) as i32 + ((height + 23) / 24) as i32
}


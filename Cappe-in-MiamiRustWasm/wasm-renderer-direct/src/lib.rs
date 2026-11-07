use js_sys::{Array, Float64Array, Reflect, Uint8ClampedArray};
use wasm_bindgen::{prelude::*, JsCast};
use web_sys::{CanvasPattern, CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement, ImageData};

/// Draws the complete pause overlay through Canvas APIs called from Rust/WASM.
/// JavaScript still owns pause state and pointer hit-testing.
#[wasm_bindgen(js_name = drawPauseUi)]
pub fn draw_pause_ui(
    context: &CanvasRenderingContext2d,
    width: f64,
    height: f64,
    hover_index: i32,
) -> Result<bool, JsValue> {
    if !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || !(-1..=1).contains(&hover_index)
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
    context.fill_text("PAUSADO", width / 2.0, height / 2.0 - 40.0)?;

    for (index, (label, color, offset_y)) in [
        ("ESC · CONTINUAR", "#ffffff", 26.0),
        ("M · LOBBY", "#ffd23f", 82.0),
    ].iter().enumerate() {
        let x = width / 2.0 - 210.0;
        let y = height / 2.0 + offset_y - 23.0 + 4.0;
        let hovered = hover_index == index as i32;

        context.set_fill_style_str(if hovered { "rgba(255,46,147,.35)" } else { "rgba(20,0,40,.85)" });
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
    if stage > 3 || !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
        || !now_ms.is_finite() || !primary.is_finite() || !secondary.is_finite() || primary < 0.0 || secondary < 0.0
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
    if segment_count == 0 { return Ok(0); }

    context.save();
    context.set_stroke_style_str("rgba(170,210,255,.38)");
    context.set_line_width(1.0);
    context.begin_path();
    for index in (0..count).step_by(step as usize) {
        let offset = index * 3;
        let x = input.get_index(offset);
        let y = input.get_index(offset + 1);
        let length = input.get_index(offset + 2);
        if !x.is_finite() || !y.is_finite() || !length.is_finite() || length < 0.0 { continue; }
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
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 || !phase.is_finite() {
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
    if count > 64 { return Ok(-1); }
    let saved_alpha = context.global_alpha();
    if !saved_alpha.is_finite() || !(0.0..=1.0).contains(&saved_alpha) { return Ok(-1); }

    for index in 0..count {
        let entry = entries.get(index);
        let text = Reflect::get(&entry, &JsValue::from_str("text"))?.as_string();
        let color = Reflect::get(&entry, &JsValue::from_str("color"))?.as_string();
        let font = Reflect::get(&entry, &JsValue::from_str("font"))?.as_string();
        let x = Reflect::get(&entry, &JsValue::from_str("x"))?.as_f64();
        let y = Reflect::get(&entry, &JsValue::from_str("y"))?.as_f64();
        let alpha_value = Reflect::get(&entry, &JsValue::from_str("alpha"))?;
        let alpha = if alpha_value.is_undefined() { Some(1.0) } else { alpha_value.as_f64() };
        let align_value = Reflect::get(&entry, &JsValue::from_str("align"))?;
        let align = if align_value.is_undefined() { Some("left".to_string()) } else { align_value.as_string() };
        let absolute_value = Reflect::get(&entry, &JsValue::from_str("absoluteAlpha"))?;
        if text.is_none() || color.is_none() || font.is_none() || x.map_or(true, |v| !v.is_finite())
            || y.map_or(true, |v| !v.is_finite()) || alpha.map_or(true, |v| !v.is_finite() || !(0.0..=1.0).contains(&v))
            || !matches!(align.as_deref(), Some("left" | "center" | "right"))
            || (!absolute_value.is_undefined() && absolute_value.as_bool().is_none())
        { return Ok(-1); }
    }

    for index in 0..count {
        let entry = entries.get(index);
        let text = Reflect::get(&entry, &JsValue::from_str("text"))?.as_string().unwrap();
        let color = Reflect::get(&entry, &JsValue::from_str("color"))?.as_string().unwrap();
        let font = Reflect::get(&entry, &JsValue::from_str("font"))?.as_string().unwrap();
        let x = Reflect::get(&entry, &JsValue::from_str("x"))?.as_f64().unwrap();
        let y = Reflect::get(&entry, &JsValue::from_str("y"))?.as_f64().unwrap();
        let alpha_value = Reflect::get(&entry, &JsValue::from_str("alpha"))?;
        let alpha = if alpha_value.is_undefined() { 1.0 } else { alpha_value.as_f64().unwrap() };
        let align_value = Reflect::get(&entry, &JsValue::from_str("align"))?;
        let align_string = if align_value.is_undefined() { Some("left".to_string()) } else { align_value.as_string() };
        let align = align_string.as_deref().unwrap();
        let absolute = Reflect::get(&entry, &JsValue::from_str("absoluteAlpha"))?.as_bool().unwrap_or(false);
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
pub fn draw_debug_hud(context: &CanvasRenderingContext2d, width: f64, height: f64,
    show_panel: bool, lines: &Array, show_errors: bool, errors: &Array) -> Result<bool, JsValue> {
    if !width.is_finite() || width <= 0.0 || !height.is_finite() || height <= 0.0
        || lines.length() > 7 || errors.length() > 12 || (show_panel && lines.length() != 7) {
        return Ok(false);
    }
    for index in 0..lines.length() {
        if lines.get(index).as_string().map_or(true, |text| text.len() > 160) { return Ok(false); }
    }
    for index in 0..errors.length() {
        if errors.get(index).as_string().map_or(true, |text| text.len() > 90) { return Ok(false); }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_font("12px monospace"); context.set_text_align("left");
        if show_panel {
            context.set_fill_style_str("rgba(0,0,0,.65)"); context.fill_rect(width - 250.0, height - 150.0, 244.0, 120.0);
            context.set_fill_style_str("#7dff9b");
            for index in 0..lines.length() {
                let text = lines.get(index).as_string().unwrap();
                context.fill_text(&text, width - 244.0, height - 134.0 + index as f64 * 15.0)?;
            }
        }
        if show_errors {
            context.set_fill_style_str("rgba(0,0,0,.8)"); context.fill_rect(10.0, 200.0, 560.0, 200.0);
            context.set_fill_style_str("#ff9ac8");
            if errors.length() == 0 { context.fill_text("sem erros registrados", 16.0, 218.0)?; }
            else {
                for index in 0..errors.length() {
                    let text = errors.get(index).as_string().unwrap();
                    context.fill_text(&text, 16.0, 218.0 + index as f64 * 15.0)?;
                }
            }
        }
        Ok(())
    })();
    context.restore(); result?; Ok(true)
}

/// Draws optional collision and AI diagnostics. JS owns entity state and labels.
#[wasm_bindgen(js_name = drawDebugWorld)]
pub fn draw_debug_world(context: &CanvasRenderingContext2d,
    walls: &Float64Array, wall_count: u32, doors: &Float64Array, door_count: u32,
    player_x: f64, player_y: f64, player_radius: f64, show_collisions: bool,
    enemies: &Float64Array, labels: &Array, enemy_count: u32, show_ai: bool) -> Result<bool, JsValue> {
    if wall_count > 4096 || door_count > 1024 || enemy_count > 256
        || walls.length() < wall_count.saturating_mul(4) || doors.length() < door_count.saturating_mul(4)
        || enemies.length() < enemy_count.saturating_mul(6) || labels.length() < enemy_count
        || (show_collisions && (!player_x.is_finite() || !player_y.is_finite()
            || !player_radius.is_finite() || player_radius < 0.0)) {
        return Ok(false);
    }
    for index in 0..wall_count * 4 {
        if !walls.get_index(index).is_finite() { return Ok(false); }
    }
    for index in 0..door_count * 4 {
        if !doors.get_index(index).is_finite() { return Ok(false); }
    }
    for index in 0..enemy_count {
        let offset = index * 6;
        let x = enemies.get_index(offset);
        let y = enemies.get_index(offset + 1);
        let radius = enemies.get_index(offset + 2);
        let has_target = enemies.get_index(offset + 3);
        let target_x = enemies.get_index(offset + 4);
        let target_y = enemies.get_index(offset + 5);
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0
            || !has_target.is_finite() || !target_x.is_finite() || !target_y.is_finite()
            || labels.get(index).as_string().map_or(true, |label| label.len() > 160) {
            return Ok(false);
        }
    }

    if show_collisions {
        context.save();
        context.set_stroke_style_str("rgba(0,255,120,.8)");
        context.set_line_width(1.0);
        for index in 0..wall_count {
            let offset = index * 4;
            context.stroke_rect(walls.get_index(offset), walls.get_index(offset + 1),
                walls.get_index(offset + 2), walls.get_index(offset + 3));
        }
        context.set_stroke_style_str("rgba(255,210,63,.9)");
        for index in 0..door_count {
            let offset = index * 4;
            context.stroke_rect(doors.get_index(offset), doors.get_index(offset + 1),
                doors.get_index(offset + 2), doors.get_index(offset + 3));
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
pub fn draw_fog(context: &CanvasRenderingContext2d, image: &JsValue, commands: &Float64Array,
    count: u32, alpha: f64, smoke: bool) -> Result<i32, JsValue> {
    if count > 3 || commands.length() < count.saturating_mul(4) || !supported_image(image)
        || !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) { return Ok(-1); }
    for index in 0..count * 4 { if !commands.get_index(index).is_finite() { return Ok(-1); } }
    context.save();
    context.set_global_alpha(alpha);
    context.set_global_composite_operation(if smoke { "source-over" } else { "lighter" })?;
    for index in 0..count {
        let offset = index * 4;
        if let Err(error) = draw_image_at(context, image, &[commands.get_index(offset), commands.get_index(offset + 1),
            commands.get_index(offset + 2), commands.get_index(offset + 3)]) {
            context.restore(); return Err(error);
        }
    }
    context.restore();
    Ok(count as i32)
}

/// Draws glow sprites and rain reflections from Rust-generated world-light commands.
#[wasm_bindgen(js_name = drawWorldLights)]
pub fn draw_world_lights(context: &CanvasRenderingContext2d, commands: &Float64Array,
    images: &Array, flash_image: &JsValue) -> Result<i32, JsValue> {
    if commands.length() % 7 != 0 || commands.length() > 56 { return Ok(-1); }
    let count = commands.length() / 7;
    for index in 0..count {
        let offset = index * 7;
        let kind = commands.get_index(offset);
        let image_index = commands.get_index(offset + 1);
        let x = commands.get_index(offset + 2); let y = commands.get_index(offset + 3);
        let width = commands.get_index(offset + 4); let height = commands.get_index(offset + 5);
        let alpha = commands.get_index(offset + 6);
        if !kind.is_finite() || ![0.0, 1.0, 2.0].contains(&kind) || !image_index.is_finite()
            || image_index < 0.0 || image_index.fract() != 0.0 || !x.is_finite() || !y.is_finite()
            || !width.is_finite() || !height.is_finite() || width < 0.0 || height < 0.0
            || !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) { return Ok(-1); }
        if kind == 0.0 && (image_index >= images.length() as f64 || !supported_image(&images.get(image_index as u32))) { return Ok(-1); }
        if kind == 1.0 && !supported_image(flash_image) { return Ok(-1); }
    }
    context.save();
    context.set_global_composite_operation("lighter")?;
    for index in 0..count {
        let offset = index * 7; let kind = commands.get_index(offset);
        if kind == 2.0 { continue; }
        context.set_global_alpha(commands.get_index(offset + 6));
        let image = if kind == 1.0 { flash_image.clone() } else { images.get(commands.get_index(offset + 1) as u32) };
        if let Err(error) = draw_image_at(context, &image, &[commands.get_index(offset + 2), commands.get_index(offset + 3),
            commands.get_index(offset + 4), commands.get_index(offset + 5)]) {
            context.restore(); return Err(error);
        }
    }
    context.restore();
    for index in 0..count {
        let offset = index * 7;
        if commands.get_index(offset) != 2.0 { continue; }
        context.save(); context.set_global_alpha(commands.get_index(offset + 6));
        context.set_fill_style_str("#9ad1ff"); context.begin_path();
        context.ellipse(commands.get_index(offset + 2), commands.get_index(offset + 3),
            commands.get_index(offset + 4), commands.get_index(offset + 5), 0.0, 0.0, 6.283185307179586)?;
        context.fill(); context.restore();
    }
    Ok(count as i32)
}

/// Rasterizes animated world rings emitted by the legacy Rust geometry pass.
#[wasm_bindgen(js_name = drawWorldRings)]
pub fn draw_world_rings(context: &CanvasRenderingContext2d, commands: &Float64Array,
    colors: &Array) -> Result<i32, JsValue> {
    if commands.length() % 6 != 0 || commands.length() > 84 || colors.length() > 14 { return Ok(-1); }
    let count = commands.length() / 6;
    for index in 0..count {
        let offset = index * 6; let color_index = commands.get_index(offset + 5);
        if !commands.get_index(offset).is_finite() || !commands.get_index(offset + 1).is_finite()
            || !commands.get_index(offset + 2).is_finite() || commands.get_index(offset + 2) < 0.0
            || !commands.get_index(offset + 3).is_finite() || commands.get_index(offset + 3) < 0.0
            || !commands.get_index(offset + 4).is_finite() || !(0.0..=1.0).contains(&commands.get_index(offset + 4))
            || !color_index.is_finite() || color_index < 0.0 || color_index.fract() != 0.0
            || color_index >= colors.length() as f64 || colors.get(color_index as u32).as_string().is_none() { return Ok(-1); }
    }
    for index in 0..count {
        let offset = index * 6; let color = colors.get(commands.get_index(offset + 5) as u32).as_string().unwrap();
        context.save(); context.set_global_alpha(commands.get_index(offset + 4));
        context.set_stroke_style_str(&color); context.set_line_width(commands.get_index(offset + 3)); context.begin_path();
        if let Err(error) = context.arc(commands.get_index(offset), commands.get_index(offset + 1), commands.get_index(offset + 2), 0.0, 6.283185307179586) {
            context.restore(); return Err(error);
        }
        context.stroke(); context.restore();
    }
    Ok(count as i32)
}

/// Draws the pulsing invasion-zone ring and fill from its six computed command values.
#[wasm_bindgen(js_name = drawInvasionZone)]
pub fn draw_invasion_zone(context: &CanvasRenderingContext2d, commands: &Float64Array) -> Result<bool, JsValue> {
    if commands.length() < 6 { return Ok(false); }
    let x = commands.get_index(0); let y = commands.get_index(1); let radius = commands.get_index(2);
    let stroke_alpha = commands.get_index(3); let line_width = commands.get_index(4); let fill_alpha = commands.get_index(5);
    if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0
        || !stroke_alpha.is_finite() || !(0.0..=1.0).contains(&stroke_alpha)
        || !line_width.is_finite() || line_width < 0.0
        || !fill_alpha.is_finite() || !(0.0..=1.0).contains(&fill_alpha) { return Ok(false); }
    context.save(); context.set_stroke_style_str(&format!("rgba(255,107,213,{stroke_alpha})")); context.set_line_width(line_width);
    context.begin_path(); context.arc(x, y, radius, 0.0, 6.283185307179586)?; context.stroke();
    context.set_fill_style_str(&format!("rgba(255,107,213,{fill_alpha})")); context.fill(); context.restore();
    Ok(true)
}

/// Builds the dark overlay with direct Canvas calls on both offscreen and screen contexts.
#[wasm_bindgen(js_name = drawDarkOverlay)]
pub fn draw_dark_overlay(dark_context: &CanvasRenderingContext2d, screen_context: &CanvasRenderingContext2d,
    overlay: &JsValue, core: &JsValue, far: &JsValue, flash: &JsValue, commands: &Float64Array) -> Result<bool, JsValue> {
    if commands.length() < 8 || !supported_image(overlay) || !supported_image(core) || !supported_image(far) || !supported_image(flash) {
        return Ok(false);
    }
    let sx = commands.get_index(0); let sy = commands.get_index(1); let angle = commands.get_index(2);
    let core_radius = commands.get_index(3); let far_radius = commands.get_index(4); let flash_radius = commands.get_index(5);
    let blackout = commands.get_index(6); let fire_flash = commands.get_index(7);
    if !sx.is_finite() || !sy.is_finite() || !angle.is_finite() || !core_radius.is_finite() || core_radius < 0.0
        || !far_radius.is_finite() || far_radius < 0.0 || !flash_radius.is_finite() || flash_radius < 0.0
        || !(blackout == 0.0 || blackout == 1.0) || !(fire_flash == 0.0 || fire_flash == 1.0) { return Ok(false); }

    dark_context.set_global_composite_operation("source-over")?;
    dark_context.clear_rect(0.0, 0.0, 960.0, 600.0);
    dark_context.set_fill_style_str(if blackout == 1.0 { "rgba(2,0,10,.95)" } else { "rgba(3,0,12,.88)" });
    dark_context.fill_rect(0.0, 0.0, 960.0, 600.0);
    dark_context.set_global_composite_operation("destination-out")?;
    if let Err(error) = draw_image_at(dark_context, core, &[sx - core_radius, sy - core_radius, core_radius * 2.0, core_radius * 2.0]) {
        return Err(error);
    }
    dark_context.save();
    let cone = (|| -> Result<(), JsValue> {
        dark_context.begin_path(); dark_context.move_to(sx, sy);
        dark_context.arc(sx, sy, far_radius, angle - 0.38, angle + 0.38)?;
        dark_context.close_path(); dark_context.clip();
        draw_image_at(dark_context, far, &[sx - far_radius, sy - far_radius, far_radius * 2.0, far_radius * 2.0])?;
        Ok(())
    })();
    dark_context.restore();
    cone?;
    if fire_flash == 1.0 {
        draw_image_at(dark_context, flash, &[sx - flash_radius, sy - flash_radius, flash_radius * 2.0, flash_radius * 2.0])?;
    }
    draw_image_at(screen_context, overlay, &[0.0, 0.0, 960.0, 600.0])?;
    Ok(true)
}

/// Draws muzzle sprites and short impact arcs from commands calculated by the legacy Rust pass.
#[wasm_bindgen(js_name = drawFx)]
pub fn draw_fx(context: &CanvasRenderingContext2d, commands: &Float64Array, muzzle_sprite: &JsValue) -> Result<i32, JsValue> {
    if commands.length() % 6 != 0 || commands.length() > 8192 { return Ok(-1); }
    let count = commands.length() / 6;
    for index in 0..count {
        let offset = index * 6;
        let x = commands.get_index(offset); let y = commands.get_index(offset + 1); let time = commands.get_index(offset + 2);
        let radius = commands.get_index(offset + 3); let angle = commands.get_index(offset + 4); let muzzle = commands.get_index(offset + 5);
        if !x.is_finite() || !y.is_finite() || !time.is_finite() || !radius.is_finite() || radius < 0.0
            || !angle.is_finite() || !(muzzle == 0.0 || muzzle == 1.0)
            || (muzzle == 1.0 && !supported_image(muzzle_sprite)) { return Ok(-1); }
    }
    for index in 0..count {
        let offset = index * 6;
        let x = commands.get_index(offset); let y = commands.get_index(offset + 1);
        let time = commands.get_index(offset + 2); let radius = commands.get_index(offset + 3);
        let angle = commands.get_index(offset + 4); let muzzle = commands.get_index(offset + 5) == 1.0;
        if muzzle {
            context.save();
            context.set_global_composite_operation("lighter")?;
            context.set_global_alpha((time * 10.0).max(0.0));
            if let Err(error) = draw_image_at(context, muzzle_sprite, &[x - radius, y - radius, radius * 2.0, radius * 2.0]) {
                context.restore(); return Err(error);
            }
            context.restore();
        } else {
            context.set_stroke_style_str("#fff"); context.set_line_width(4.0); context.begin_path();
            context.arc(x, y, radius, angle - 1.2, angle + 1.2)?; context.stroke();
        }
    }
    Ok(count as i32)
}

/// Draws projected shell casings from commands emitted by the legacy Rust pass.
/// Each row contains screen x/y, horizontal/vertical radii, and rotation.
#[wasm_bindgen(js_name = drawShells)]
pub fn draw_shells(context: &CanvasRenderingContext2d, commands: &Float64Array, count: u32) -> Result<i32, JsValue> {
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
        if !x.is_finite() || !y.is_finite() || !radius_x.is_finite() || !radius_y.is_finite()
            || !rotation.is_finite() || radius_x < 0.0 || radius_y < 0.0
        {
            continue;
        }
        context.ellipse(x, y, radius_x, radius_y, rotation, 0.0, core::f64::consts::TAU)?;
        drawn += 1;
    }
    context.fill();
    context.restore();
    Ok(drawn)
}

/// Draws the outlined combo multiplier using the browser's current font rasterizer.
#[wasm_bindgen(js_name = drawComboText)]
pub fn draw_combo_text(context: &CanvasRenderingContext2d, commands: &Float64Array, label: &str) -> Result<bool, JsValue> {
    if commands.length() != 2 {
        return Ok(false);
    }
    let pulse = commands.get_index(0);
    let combo = commands.get_index(1);
    if !pulse.is_finite() || pulse <= 0.0 || pulse > 2.0 || !combo.is_finite() || combo <= 1.0 || label.is_empty() || label.len() > 64 {
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
pub fn draw_alarm_text(context: &CanvasRenderingContext2d, commands: &Float64Array, label: &str) -> Result<bool, JsValue> {
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
pub fn draw_hud_image(context: &CanvasRenderingContext2d, image: &JsValue, commands: &Float64Array) -> Result<bool, JsValue> {
    if commands.length() != 5 || !supported_image(image) {
        return Ok(false);
    }
    let index = commands.get_index(0);
    let x = commands.get_index(1);
    let y = commands.get_index(2);
    let width = commands.get_index(3);
    let height = commands.get_index(4);
    if !index.is_finite() || index.fract() != 0.0 || !(0.0..=4.0).contains(&index)
        || !x.is_finite() || !y.is_finite() || !width.is_finite() || !height.is_finite() || width <= 0.0 || height <= 0.0
    {
        return Ok(false);
    }
    draw_image_at(context, image, &[x, y, width, height])?;
    Ok(true)
}

/// Draws cached projectile sprites at positions emitted by the legacy Rust pass.
#[wasm_bindgen(js_name = drawBullets)]
pub fn draw_bullets(context: &CanvasRenderingContext2d, commands: &Float64Array, mine: &JsValue, foe: &JsValue) -> Result<i32, JsValue> {
    if commands.length() % 3 != 0 || commands.length() > 24576 || !supported_image(mine) || !supported_image(foe) {
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
        let image = if commands.get_index(offset + 2) == 1.0 { mine } else { foe };
        draw_image_at(context, image, &[x, y])?;
    }
    Ok(count as i32)
}

fn batch_prop(batch: &JsValue, key: &str) -> Result<JsValue, JsValue> {
    Reflect::get(batch, &JsValue::from_str(key))
}

fn batch_array(batch: &JsValue, key: &str) -> Result<Array, JsValue> {
    let value = batch_prop(batch, key)?;
    if value.is_undefined() || value.is_null() { Ok(Array::new()) }
    else { Ok(value.unchecked_into::<Array>()) }
}

fn supported_image(value: &JsValue) -> bool {
    value.is_instance_of::<HtmlImageElement>() || value.is_instance_of::<HtmlCanvasElement>()
}

fn draw_image_at(context: &CanvasRenderingContext2d, source: &JsValue, v: &[f64]) -> Result<bool, JsValue> {
    if let Ok(image) = source.clone().dyn_into::<HtmlImageElement>() {
        match v {
            [x, y] => context.draw_image_with_html_image_element(&image, *x, *y)?,
            [x, y, w, h] => context.draw_image_with_html_image_element_and_dw_and_dh(&image, *x, *y, *w, *h)?,
            [sx, sy, sw, sh, dx, dy, dw, dh] => context.draw_image_with_html_image_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(&image, *sx, *sy, *sw, *sh, *dx, *dy, *dw, *dh)?,
            _ => return Ok(false),
        }
        return Ok(true);
    }
    if let Ok(canvas) = source.clone().dyn_into::<HtmlCanvasElement>() {
        match v {
            [x, y] => context.draw_image_with_html_canvas_element(&canvas, *x, *y)?,
            [x, y, w, h] => context.draw_image_with_html_canvas_element_and_dw_and_dh(&canvas, *x, *y, *w, *h)?,
            [sx, sy, sw, sh, dx, dy, dw, dh] => context.draw_image_with_html_canvas_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(&canvas, *sx, *sy, *sw, *sh, *dx, *dy, *dw, *dh)?,
            _ => return Ok(false),
        }
        return Ok(true);
    }
    Ok(false)
}

fn repeat_pattern(context: &CanvasRenderingContext2d, source: &JsValue) -> Result<Option<CanvasPattern>, JsValue> {
    if let Ok(image) = source.clone().dyn_into::<HtmlImageElement>() {
        context.create_pattern_with_html_image_element(&image, "repeat")
    } else if let Ok(canvas) = source.clone().dyn_into::<HtmlCanvasElement>() {
        context.create_pattern_with_html_canvas_element(&canvas, "repeat")
    } else { Ok(None) }
}

fn with_context_save<T>(context: &CanvasRenderingContext2d, paint: impl FnOnce() -> Result<T, JsValue>) -> Result<T, JsValue> {
    context.save();
    let result = paint();
    context.restore();
    result
}

/// Rasterizes the Rust-generated dust circles in one direct Canvas batch.
#[wasm_bindgen(js_name = drawDust)]
pub fn draw_dust(context: &CanvasRenderingContext2d, commands: &Float64Array, alpha: f64) -> Result<i32, JsValue> {
    const STRIDE: u32 = 3;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 || !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) { return Ok(-1); }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = commands.get_index(offset); let y = commands.get_index(offset + 1); let radius = commands.get_index(offset + 2);
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 { return Ok(-1); }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_fill_style_str("#c8b8ff");
        context.begin_path();
        for offset in (0..length).step_by(STRIDE as usize) {
            let x = commands.get_index(offset); let y = commands.get_index(offset + 1); let radius = commands.get_index(offset + 2);
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
pub fn draw_sparks(context: &CanvasRenderingContext2d, commands: &Float64Array, colors: &Array) -> Result<i32, JsValue> {
    const STRIDE: u32 = 6;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 { return Ok(-1); }
    for offset in (0..length).step_by(STRIDE as usize) {
        let color = commands.get_index(offset); let alpha = commands.get_index(offset + 1);
        if !color.is_finite() || color.fract() != 0.0 || color < 0.0 || (color as u32) >= colors.length()
            || colors.get(color as u32).as_string().is_none() || !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) { return Ok(-1); }
        for field in 2..STRIDE { if !commands.get_index(offset + field).is_finite() { return Ok(-1); } }
    }
    context.save();
    let result = (|| -> Result<(), JsValue> {
        context.set_global_composite_operation("lighter")?;
        let mut previous_color = f64::NAN;
        let mut previous_alpha = f64::NAN;
        for offset in (0..length).step_by(STRIDE as usize) {
            let color = commands.get_index(offset); let alpha = commands.get_index(offset + 1);
            if color != previous_color || alpha != previous_alpha {
                if offset > 0 { context.fill(); }
                context.set_fill_style_str(&colors.get(color as u32).as_string().unwrap());
                context.set_global_alpha(alpha);
                context.begin_path();
                previous_color = color; previous_alpha = alpha;
            }
            context.rect(commands.get_index(offset + 2), commands.get_index(offset + 3), commands.get_index(offset + 4), commands.get_index(offset + 5));
        }
        if length > 0 { context.fill(); }
        Ok(())
    })();
    context.restore();
    result?;
    Ok((length / STRIDE) as i32)
}

/// Draws enemy shadow ellipses directly in Canvas while preserving the host painter's per-enemy alpha.
#[wasm_bindgen(js_name = drawEnemyShadows)]
pub fn draw_enemy_shadows(context: &CanvasRenderingContext2d, commands: &Float64Array, offset: u32, count: u32) -> Result<i32, JsValue> {
    const STRIDE: u32 = 5;
    let length = commands.length();
    let end = match offset.checked_add(count.saturating_mul(STRIDE)) { Some(value) => value, None => return Ok(-1) };
    if count > 65_536 || end > length { return Ok(-1); }
    for index in 0..count {
        let position = offset + index * STRIDE;
        let x = commands.get_index(position); let y = commands.get_index(position + 1);
        let radius_x = commands.get_index(position + 2); let radius_y = commands.get_index(position + 3);
        let alpha = commands.get_index(position + 4);
        if !x.is_finite() || !y.is_finite() || !radius_x.is_finite() || radius_x < 0.0
            || !radius_y.is_finite() || radius_y < 0.0 || !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) {
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
            context.ellipse(commands.get_index(position), commands.get_index(position + 1),
                commands.get_index(position + 2), commands.get_index(position + 3), 0.0, 0.0, 6.28)?;
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
pub fn draw_glass_break_trace(context: &CanvasRenderingContext2d, x: f64, y: f64, width: f64, height: f64, commands: &Float64Array) -> Result<bool, JsValue> {
    const SHARD_STRIDE: u32 = 7;
    if !x.is_finite() || !y.is_finite() || !width.is_finite() || width <= 0.0 || !height.is_finite() || height <= 0.0
        || commands.length() != SHARD_STRIDE * 9 { return Ok(false); }
    for offset in (0..commands.length()).step_by(SHARD_STRIDE as usize) {
        let alpha = commands.get_index(offset);
        if !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) { return Ok(false); }
        for field in 1..SHARD_STRIDE { if !commands.get_index(offset + field).is_finite() { return Ok(false); } }
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
            context.move_to(commands.get_index(offset + 1), commands.get_index(offset + 2));
            context.line_to(commands.get_index(offset + 3), commands.get_index(offset + 4));
            context.line_to(commands.get_index(offset + 5), commands.get_index(offset + 6));
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
pub fn draw_explosion_scorch(context: &CanvasRenderingContext2d, x: f64, y: f64) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() { return Ok(false); }
    context.set_fill_style_str("rgba(8,4,12,.55)");
    context.begin_path(); context.arc(x, y, 38.0, 0.0, core::f64::consts::TAU)?; context.fill();
    context.set_fill_style_str("rgba(255,138,31,.18)");
    context.begin_path(); context.arc(x, y, 24.0, 0.0, core::f64::consts::TAU)?; context.fill();
    Ok(true)
}

/// Rasterizes independently-alpha'd live blood marks and leaves alpha at one, matching the host painter.
#[wasm_bindgen(js_name = drawLiveBlood)]
pub fn draw_live_blood(context: &CanvasRenderingContext2d, commands: &Float64Array, color: &str) -> Result<i32, JsValue> {
    const STRIDE: u32 = 4;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 || color.is_empty() { return Ok(-1); }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = commands.get_index(offset); let y = commands.get_index(offset + 1);
        let radius = commands.get_index(offset + 2); let alpha = commands.get_index(offset + 3);
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 || !alpha.is_finite() || !(0.0..=1.0).contains(&alpha) { return Ok(-1); }
    }
    context.set_fill_style_str(color);
    for offset in (0..length).step_by(STRIDE as usize) {
        context.set_global_alpha(commands.get_index(offset + 3)); context.begin_path();
        context.arc(commands.get_index(offset), commands.get_index(offset + 1), commands.get_index(offset + 2), 0.0, 6.28)?;
        context.fill();
    }
    context.set_global_alpha(1.0);
    Ok((length / STRIDE) as i32)
}

/// Rasterizes static blood marks as one path, preserving Canvas arc connection semantics.
#[wasm_bindgen(js_name = drawStaticBlood)]
pub fn draw_static_blood(context: &CanvasRenderingContext2d, commands: &Float64Array, color: &str) -> Result<i32, JsValue> {
    const STRIDE: u32 = 4;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 || color.is_empty() { return Ok(-1); }
    for offset in (0..length).step_by(STRIDE as usize) {
        let x = commands.get_index(offset); let y = commands.get_index(offset + 1);
        let radius = commands.get_index(offset + 2); let alpha = commands.get_index(offset + 3);
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 || !alpha.is_finite() { return Ok(-1); }
    }
    context.set_fill_style_str(color);
    context.begin_path();
    for offset in (0..length).step_by(STRIDE as usize) {
        context.move_to(commands.get_index(offset) + commands.get_index(offset + 2), commands.get_index(offset + 1));
        context.arc(commands.get_index(offset), commands.get_index(offset + 1), commands.get_index(offset + 2), 0.0, 6.28)?;
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
    if puddle_color.len() > 128 || drop_color.len() > 128
        || blobs.length() % BLOB_STRIDE != 0 || blobs.length() > 5 * BLOB_STRIDE
        || streaks.length() % STREAK_STRIDE != 0 || streaks.length() > 14 * STREAK_STRIDE
        || droplets.length() % DROP_STRIDE != 0 || droplets.length() > 256 * DROP_STRIDE
    { return Ok(false); }
    for index in 0..blobs.length() { if !blobs.get_index(index).is_finite() { return Ok(false); } }
    for index in 0..streaks.length() { if !streaks.get_index(index).is_finite() { return Ok(false); } }
    for index in 0..droplets.length() { if !droplets.get_index(index).is_finite() { return Ok(false); } }

    context.save();
    if blobs.length() > 0 {
        context.set_fill_style_str(puddle_color);
        let points_per_blob = BLOB_STRIDE as usize / 2;
        for base in (0..blobs.length()).step_by(BLOB_STRIDE as usize) {
            let first_x = blobs.get_index(base);
            let first_y = blobs.get_index(base + 1);
            let last = base + (BLOB_STRIDE - 2);
            context.begin_path();
            context.move_to((first_x + blobs.get_index(last)) / 2.0, (first_y + blobs.get_index(last + 1)) / 2.0);
            for point in 0..points_per_blob {
                let offset = base + (point * 2) as u32;
                let next = base + (((point + 1) % points_per_blob) * 2) as u32;
                let x = blobs.get_index(offset); let y = blobs.get_index(offset + 1);
                context.quadratic_curve_to(x, y, (x + blobs.get_index(next)) / 2.0, (y + blobs.get_index(next + 1)) / 2.0);
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
            context.arc(droplets.get_index(base), droplets.get_index(base + 1), droplets.get_index(base + 2), 0.0, 6.28)?;
            context.fill();
        }
    }
    context.restore();
    Ok(true)
}

/// Rasterizes ordered corpse ellipses with their original transforms and palette.
#[wasm_bindgen(js_name = drawCorpses)]
pub fn draw_corpses(context: &CanvasRenderingContext2d, commands: &Float64Array, colors: &Array) -> Result<i32, JsValue> {
    const STRIDE: u32 = 7;
    let length = commands.length();
    if length % STRIDE != 0 || length / STRIDE > 65_536 { return Ok(-1); }
    for offset in (0..length).step_by(STRIDE as usize) {
        let color = commands.get_index(offset + 6);
        if !color.is_finite() || color.fract() != 0.0 || !(0.0..=3.0).contains(&color)
            || (color != 3.0 && (color as u32) >= colors.length())
            || (color != 3.0 && colors.get(color as u32).as_string().is_none()) { return Ok(-1); }
        for field in 0..6 {
            let value = commands.get_index(offset + field);
            if !value.is_finite() { return Ok(-1); }
            if matches!(field, 3 | 4) && value < 0.0 { return Ok(-1); }
            if field == 5 && !(0.0..=1.0).contains(&value) { return Ok(-1); }
        }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        context.save();
        let result = (|| -> Result<(), JsValue> {
            context.translate(commands.get_index(offset), commands.get_index(offset + 1))?;
            context.rotate(commands.get_index(offset + 2))?;
            let color = commands.get_index(offset + 6) as u32;
            let fill = if color == 3 { "rgba(0,0,0,.35)".to_string() } else { colors.get(color).as_string().unwrap() };
            context.set_fill_style_str(&fill);
            context.set_global_alpha(commands.get_index(offset + 5)); context.begin_path();
            context.ellipse(0.0, 0.0, commands.get_index(offset + 3), commands.get_index(offset + 4), 0.0, 0.0, 6.28)?;
            context.fill();
            Ok(())
        })();
        context.restore();
        result?;
    }
    Ok((length / STRIDE) as i32)
}

/// Draws a cached Canvas image directly into another Canvas context.
#[wasm_bindgen(js_name = drawCanvasImage)]
pub fn draw_canvas_image(context: &CanvasRenderingContext2d, image: &HtmlCanvasElement, x: f64, y: f64) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() || image.width() == 0 || image.height() == 0 { return Ok(false); }
    context.draw_image_with_html_canvas_element(image, x, y)?;
    Ok(true)
}

/// Draws a cropped canvas layer from Rust, optionally overriding global alpha for the draw.
/// An alpha below zero preserves the caller's current alpha, matching the legacy layer path.
#[wasm_bindgen(js_name = drawCanvasLayer)]
pub fn draw_canvas_layer(
    context: &CanvasRenderingContext2d,
    image: &HtmlCanvasElement,
    sx: f64, sy: f64, sw: f64, sh: f64,
    dx: f64, dy: f64, dw: f64, dh: f64,
    alpha: f64,
) -> Result<bool, JsValue> {
    if ![sx, sy, sw, sh, dx, dy, dw, dh, alpha].iter().all(|v| v.is_finite())
        || sw <= 0.0 || sh <= 0.0 || dw <= 0.0 || dh <= 0.0
        || sx < 0.0 || sy < 0.0 || sx + sw > image.width() as f64 || sy + sh > image.height() as f64
        || (alpha >= 0.0 && alpha > 1.0)
    { return Ok(false); }

    context.save();
    if alpha >= 0.0 { context.set_global_alpha(alpha); }
    let drawn = context.draw_image_with_html_canvas_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
        image, sx, sy, sw, sh, dx, dy, dw, dh,
    );
    context.restore();
    drawn?;
    Ok(true)
}

#[wasm_bindgen(js_name = createCanvasImageData)]
pub fn create_canvas_image_data(context: &CanvasRenderingContext2d, width: u32, height: u32) -> Result<Option<ImageData>, JsValue> {
    if width == 0 || height == 0 || width > 1440 || height > 900 { return Ok(None); }
    Ok(Some(context.create_image_data_with_sw_and_sh(width as f64, height as f64)?))
}

#[wasm_bindgen(js_name = putCanvasImageData)]
pub fn put_canvas_image_data(
    context: &CanvasRenderingContext2d,
    image: &ImageData,
    pixels: &Uint8ClampedArray,
    width: u32,
    height: u32,
) -> Result<bool, JsValue> {
    let expected = width.checked_mul(height).and_then(|size| size.checked_mul(4));
    if width == 0 || height == 0 || width > 1440 || height > 900 || expected != Some(pixels.length())
        || image.width() != width || image.height() != height { return Ok(false); }
    let data = Reflect::get(image.as_ref(), &JsValue::from_str("data"))?.dyn_into::<Uint8ClampedArray>()?;
    data.set(pixels.as_ref(), 0);
    context.put_image_data(image, 0.0, 0.0)?;
    Ok(true)
}

#[wasm_bindgen(js_name = clearCanvasRect)]
pub fn clear_canvas_rect(context: &CanvasRenderingContext2d, x: f64, y: f64, width: f64, height: f64) -> Result<bool, JsValue> {
    if !x.is_finite() || !y.is_finite() || !width.is_finite() || !height.is_finite() { return Ok(false); }
    context.clear_rect(x, y, width, height);
    Ok(true)
}

#[wasm_bindgen(js_name = setCanvasImageSmoothing)]
pub fn set_canvas_image_smoothing(context: &CanvasRenderingContext2d, enabled: bool) -> bool {
    context.set_image_smoothing_enabled(enabled);
    true
}

#[wasm_bindgen(js_name = createTextImage)]
pub fn create_text_image(canvas: &HtmlCanvasElement, text: &str, font: &str, color: &str, outlined: bool) -> Result<bool, JsValue> {
    if text.len() > 4096 || font.is_empty() || font.len() > 256 || color.is_empty() || color.len() > 128 { return Ok(false); }
    let context = canvas.get_context("2d")?.ok_or_else(|| JsValue::from_str("2D Canvas context unavailable"))?
        .dyn_into::<CanvasRenderingContext2d>()?;
    context.set_font(font);
    let measured_width = context.measure_text(text)?.width();
    if !measured_width.is_finite() || measured_width < 0.0 || measured_width > 2040.0 { return Ok(false); }
    let font_size = first_px_font_size(font).unwrap_or(16) as f64;
    let width = measured_width.ceil() as u32 + if outlined { 12 } else { 4 };
    let height = if outlined { (font_size * 1.5).ceil() as u32 + 10 } else { 24 };
    if height == 0 || height > 256 { return Ok(false); }
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
    while start > 0 && bytes[start - 1].is_ascii_digit() { start -= 1; }
    if start == px { return None; }
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
    if length % STRIDE != 0 || length / STRIDE > MAX_COMMANDS { return Ok(-1); }
    let mut enemy_text_index = 0;
    for offset in (0..length).step_by(STRIDE as usize) {
        let opf = commands.get_index(offset); let cf = commands.get_index(offset + 1);
        if !opf.is_finite() || opf.fract() != 0.0 || !(1.0..=39.0).contains(&opf)
            || !cf.is_finite() || cf.fract() != 0.0 || cf < 0.0 { return Ok(-1); }
        let op = opf as u32; let color = cf as u32;
        if matches!(op, 4 | 5) && color >= furniture_colors.length() { return Ok(-1); }
        if matches!(op, 23 | 24) && color >= actor_colors.length() { return Ok(-1); }
        for field in 2..STRIDE { if !commands.get_index(offset + field).is_finite() { return Ok(-1); } }
        match op {
            21 => { let image = batch_prop(batch, "doorImage")?; if !image.is_null() && !image.is_undefined() && !supported_image(&image) { return Ok(-1); } }
            22 | 26 => { let key = if op == 22 { "enemySheet" } else { "playerSheet" }; let image = batch_prop(batch, key)?; if image.is_null() || image.is_undefined() || !image.is_instance_of::<HtmlImageElement>() { return Ok(-1); } }
            27 => { let frames = batch_array(batch, "playerFrames")?; if color >= frames.length() || !frames.get(color).is_instance_of::<HtmlCanvasElement>() { return Ok(-1); } }
            28 => { let values = batch_array(batch, "skinColors")?; if color >= values.length() || values.get(color).as_string().is_none() { return Ok(-1); } }
            29 => { let values = batch_array(batch, "playerIsP2")?; if color >= values.length() || values.get(color).as_bool().is_none() { return Ok(-1); } }
            30 => {
                let images = batch_array(batch, "enemyTextImages")?;
                if enemy_text_index >= images.length() { return Ok(-1); }
                let entry = images.get(enemy_text_index);
                let image = Reflect::get(&entry, &JsValue::from_str("image"))?;
                let x = Reflect::get(&entry, &JsValue::from_str("x"))?.as_f64().unwrap_or(f64::NAN);
                let y = Reflect::get(&entry, &JsValue::from_str("y"))?.as_f64().unwrap_or(f64::NAN);
                if !supported_image(&image) || !x.is_finite() || !y.is_finite() { return Ok(-1); }
                enemy_text_index += 1;
            }
            31 => {
                let textures = batch_prop(batch, "mapTextures")?;
                let image = if color == 0 { Reflect::get(&textures, &JsValue::from_str("wallFace"))? }
                    else { Reflect::get(&textures, &JsValue::from_str("furnitureFaces"))?.unchecked_into::<Array>().get(commands.get_index(offset + 2) as u32) };
                if !supported_image(&image) { return Ok(-1); }
            }
            32 => { let textures = batch_prop(batch, "mapTextures")?; if !supported_image(&Reflect::get(&textures, &JsValue::from_str("doorOpen"))?) { return Ok(-1); } }
            33 => { let pattern = batch_prop(batch, "floorTilePattern")?; if pattern.is_null() || pattern.is_undefined() || !pattern.is_instance_of::<CanvasPattern>() { return Ok(-1); } }
            34 => {
                let image = batch_array(batch, "spriteImages")?.get(color);
                if !image.is_null() && !image.is_undefined() {
                    let complete = Reflect::get(&image, &JsValue::from_str("complete"))?.as_bool().unwrap_or(false);
                    let width = Reflect::get(&image, &JsValue::from_str("naturalWidth"))?.as_f64().unwrap_or(0.0);
                    if complete && width > 0.0 && !supported_image(&image) { return Ok(-1); }
                }
            }
            36 | 37 => { let values = batch_array(batch, "colors")?; if color >= values.length() || values.get(color).as_string().is_none() { return Ok(-1); } }
            _ => {}
        }
    }
    let mut enemy_text_index = 0;
    for offset in (0..length).step_by(STRIDE as usize) {
        let op = commands.get_index(offset) as u32; let color = commands.get_index(offset + 1) as u32;
        let a = commands.get_index(offset + 2); let b = commands.get_index(offset + 3);
        let c = commands.get_index(offset + 4); let d = commands.get_index(offset + 5);
        let e = commands.get_index(offset + 6); let f = commands.get_index(offset + 7);
        match op {
            1 => { context.save(); context.set_shadow_color("rgba(0,0,0,.28)"); context.set_shadow_blur(5.0); context.set_shadow_offset_x(1.0); context.set_shadow_offset_y(2.0); }
            2 => context.restore(), 3 => context.set_line_width(a),
            4 => context.set_fill_style_str(&furniture_colors.get(color).as_string().unwrap()),
            5 => context.set_stroke_style_str(&furniture_colors.get(color).as_string().unwrap()),
            6 => context.fill_rect(a, b, c, d), 7 => context.stroke_rect(a, b, c, d), 8 => context.begin_path(),
            9 => context.move_to(a, b), 10 => context.line_to(a, b), 11 => context.arc(a, b, c, d, e)?,
            12 => context.ellipse(a, b, c, d, e, 0.0, f)?, 13 => context.fill(), 14 => context.stroke(),
            15 => { context.save(); context.set_shadow_color("rgba(0,0,0,.62)"); context.set_shadow_blur(2.0); context.set_shadow_offset_x(1.0); context.set_shadow_offset_y(2.0); }
            16 => context.save(), 17 => context.set_line_cap("round"), 18 => context.set_global_alpha(a),
            19 => context.translate(a, b)?, 20 => context.rotate(a)?,
            21 => { let image = batch_prop(batch, "doorImage")?; if !image.is_null() && !image.is_undefined() { context.set_image_smoothing_enabled(true); draw_image_at(context, &image, &[a, b, c, d])?; } }
            22 | 26 => { let key = if op == 22 { "enemySheet" } else { "playerSheet" }; let image = batch_prop(batch, key)?; if op == 22 { context.set_image_smoothing_enabled(true); } draw_image_at(context, &image, &[a * 24.0, b * 24.0, 24.0, 24.0, -11.5, -11.5, 24.0, 24.0])?; }
            23 => context.set_fill_style_str(&actor_colors.get(color).as_string().unwrap()),
            24 => context.set_stroke_style_str(&actor_colors.get(color).as_string().unwrap()),
            25 => context.set_image_smoothing_enabled(a != 0.0),
            27 => { let frames = batch_array(batch, "playerFrames")?; draw_image_at(context, &frames.get(color), &[-11.5, -11.5])?; }
            28 => { let values = batch_array(batch, "skinColors")?; context.set_fill_style_str(&values.get(color).as_string().unwrap()); }
            29 => { let values = batch_array(batch, "playerIsP2")?; let p2 = values.get(color).as_bool().unwrap_or(false); context.set_fill_style_str(if p2 { "#ff2e93" } else { "#19f0e6" }); context.set_font("bold 10px Rajdhani,sans-serif"); context.set_text_align("center"); context.fill_text(if p2 { "P2" } else { "P1" }, a, b)?; }
            30 => {
                let entry = batch_array(batch, "enemyTextImages")?.get(enemy_text_index);
                let image = Reflect::get(&entry, &JsValue::from_str("image"))?;
                let x = Reflect::get(&entry, &JsValue::from_str("x"))?.as_f64().unwrap_or(0.0);
                let y = Reflect::get(&entry, &JsValue::from_str("y"))?.as_f64().unwrap_or(0.0);
                draw_image_at(context, &image, &[x, y])?;
                enemy_text_index += 1;
            }
            31 => {
                let textures = batch_prop(batch, "mapTextures")?;
                let image = if color == 0 { Reflect::get(&textures, &JsValue::from_str("wallFace"))? }
                    else { Reflect::get(&textures, &JsValue::from_str("furnitureFaces"))?.unchecked_into::<Array>().get(a as u32) };
                with_context_save(context, || {
                    context.begin_path(); context.rect(b, c, d, e); context.clip(); if color == 1 { context.set_image_smoothing_enabled(false); }
                    if let Some(pattern) = repeat_pattern(context, &image)? { context.set_fill_style_canvas_pattern(&pattern); context.fill_rect(b, c, d, e); }
                    Ok(())
                })?;
            }
            32 => { let textures = batch_prop(batch, "mapTextures")?; let image = Reflect::get(&textures, &JsValue::from_str("doorOpen"))?; with_context_save(context, || { context.set_image_smoothing_enabled(false); context.translate(a, b)?; if e != 0.0 { context.rotate(core::f64::consts::FRAC_PI_2)?; } draw_image_at(context, &image, &[-c / 2.0, -d / 2.0, c, d])?; Ok(()) })?; }
            33 => { let pattern: CanvasPattern = batch_prop(batch, "floorTilePattern")?.unchecked_into(); with_context_save(context, || { context.begin_path(); context.rect(a, b, c, d); context.clip(); context.translate(e, 0.0)?; context.set_global_alpha(0.45); context.set_fill_style_canvas_pattern(&pattern); context.fill_rect(a, b, c + 48.0, d + 48.0); Ok(()) })?; }
            34 => { let image = batch_array(batch, "spriteImages")?.get(color); if !image.is_null() && !image.is_undefined() { let complete = Reflect::get(&image, &JsValue::from_str("complete"))?.as_bool().unwrap_or(false); let width = Reflect::get(&image, &JsValue::from_str("naturalWidth"))?.as_f64().unwrap_or(0.0); if complete && width > 0.0 { draw_image_at(context, &image, &[a, b])?; } } }
            35 => if color != 0 { context.close_path(); } else { context.line_to(a, b); },
            36 => { let values = batch_array(batch, "colors")?; context.set_fill_style_str(&values.get(color).as_string().unwrap()); }
            37 => { let values = batch_array(batch, "colors")?; context.set_stroke_style_str(&values.get(color).as_string().unwrap()); }
            38 => { let dash = Array::new(); dash.push(&JsValue::from_f64(a)); dash.push(&JsValue::from_f64(b)); context.set_line_dash(&dash)?; }
            39 => context.scale(a, b)?, _ => unreachable!(),
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
    if length % STRIDE != 0 || length / STRIDE > 250_000 { return Ok(-1); }
    for offset in (0..length).step_by(STRIDE as usize) {
        let op = commands.get_index(offset);
        let color = commands.get_index(offset + 1);
        if !op.is_finite() || op.fract() != 0.0 || !(1.0..=22.0).contains(&op)
            || !color.is_finite() || color.fract() != 0.0 || color < 0.0 { return Ok(-1); }
        for field in 2..STRIDE { if !commands.get_index(offset + field).is_finite() { return Ok(-1); } }
        if matches!(op as u32, 15 | 16) && (color as u32) < colors.length()
            && colors.get(color as u32).as_string().is_none() { return Ok(-1); }
    }
    for offset in (0..length).step_by(STRIDE as usize) {
        let op = commands.get_index(offset) as u32;
        let color = commands.get_index(offset + 1) as u32;
        let x = commands.get_index(offset + 2); let y = commands.get_index(offset + 3);
        let w = commands.get_index(offset + 4); let h = commands.get_index(offset + 5);
        let line = commands.get_index(offset + 6); let alpha = commands.get_index(offset + 7);
        context.save();
        context.set_global_alpha(alpha);
        match op {
            1 => { context.set_stroke_style_str("#f4d7ff"); context.set_line_width(line); context.stroke_rect(x, y, w, h); }
            2 => { context.set_stroke_style_str("#19f0e6"); context.set_line_width(line); context.begin_path(); context.move_to(x, y); context.line_to(w, h); context.stroke(); }
            3 => { context.set_fill_style_str(if color == 2 { "rgba(5,0,20,.10)" } else { "rgba(255,255,255,.035)" }); context.fill_rect(x, y, w, h); }
            4..=9 | 11..=13 => {
                let fill = match op { 4 => "rgba(0, 0, 0, 0.4)", 5 => "#c8c8d8", 6 => "#f0eff8", 7 => "#a0a0b5", 8 => "#e5e4ef", 9 => "#77778d", 11 => "rgba(25,240,230,.18)", 12 => "#f4f2ff", _ => "#b5b5c8" };
                context.set_fill_style_str(fill); context.fill_rect(x, y, w, h);
            }
            10 | 14 => { context.set_stroke_style_str(if op == 10 { "#5d5d73" } else { "#383849" }); context.set_line_width(line); context.stroke_rect(x, y, w, h); }
            15 => { if color < colors.length() { if let Some(fill) = colors.get(color).as_string() { context.set_fill_style_str(&fill); } } context.fill_rect(x, y, w, h); }
            16 => { if color < colors.length() { if let Some(stroke) = colors.get(color).as_string() { context.set_stroke_style_str(&stroke); } } context.set_line_width(line); context.stroke_rect(x, y, w, h); }
            17 => { context.set_fill_style_str("#07010f"); context.fill_rect(x, y, w, h); }
            18 => { context.set_fill_style_str("rgba(255,240,230,.08)"); context.fill_rect(x, y, w, h); }
            19 => { context.set_fill_style_str("rgba(110,225,255,.22)"); context.fill_rect(x, y, w, h); }
            20 => { context.set_stroke_style_str("rgba(210,255,255,.85)"); context.set_line_width(line); context.stroke_rect(x, y, w, h); }
            21 => { context.set_stroke_style_str("rgba(255,255,255,.55)"); context.set_line_width(line); context.begin_path(); context.move_to(x, y); context.line_to(w, h); context.stroke(); }
            22 => { context.set_stroke_style_str("rgba(210,250,255,.75)"); context.set_line_width(line); context.begin_path(); context.move_to(x - w * 0.45, y - h * 0.35); context.line_to(x + w * 0.2, y + h * 0.15); context.line_to(x - w * 0.1, y + h * 0.42); context.move_to(x + w * 0.42, y - h * 0.38); context.line_to(x - w * 0.05, y + h * 0.05); context.stroke(); }
            _ => unreachable!(),
        }
        context.restore();
    }
    Ok((length / STRIDE) as i32)
}

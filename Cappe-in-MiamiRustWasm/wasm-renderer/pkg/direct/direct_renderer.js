/* @ts-self-types="./direct_renderer.d.ts" */

/**
 * @param {CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function clearCanvasRect(context, x, y, width, height) {
    const ret = wasm.clearCanvasRect(context, x, y, width, height);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 * @returns {ImageData | undefined}
 */
export function createCanvasImageData(context, width, height) {
    const ret = wasm.createCanvasImageData(context, width, height);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} text
 * @param {string} font
 * @param {string} color
 * @param {boolean} outlined
 * @returns {boolean}
 */
export function createTextImage(canvas, text, font, color, outlined) {
    const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(font, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.createTextImage(canvas, ptr0, len0, ptr1, len1, ptr2, len2, outlined);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws the existing alarm status label using the browser's Canvas text rasterizer.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {string} label
 * @returns {boolean}
 */
export function drawAlarmText(context, commands, label) {
    const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.drawAlarmText(context, commands, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Direct Rust/web-sys painter for the full shared eight-number command ABI.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {Array<any>} furniture_colors
 * @param {Array<any>} actor_colors
 * @param {any} batch
 * @returns {number}
 */
export function drawBatchCommands(context, commands, furniture_colors, actor_colors, batch) {
    const ret = wasm.drawBatchCommands(context, commands, furniture_colors, actor_colors, batch);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Rasterizes the irregular puddles, directional trails, and droplets created on enemy death.
 * JavaScript keeps the original random sequence and passes only the resulting geometry.
 * @param {CanvasRenderingContext2D} context
 * @param {string} puddle_color
 * @param {string} drop_color
 * @param {Float64Array} blobs
 * @param {Float64Array} streaks
 * @param {Float64Array} droplets
 * @returns {boolean}
 */
export function drawBloodSplatter(context, puddle_color, drop_color, blobs, streaks, droplets) {
    const ptr0 = passStringToWasm0(puddle_color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(drop_color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.drawBloodSplatter(context, ptr0, len0, ptr1, len1, blobs, streaks, droplets);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws cached projectile sprites at positions emitted by the legacy Rust pass.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {any} mine
 * @param {any} foe
 * @returns {number}
 */
export function drawBullets(context, commands, mine, foe) {
    const ret = wasm.drawBullets(context, commands, mine, foe);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws a cached Canvas image directly into another Canvas context.
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLCanvasElement} image
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function drawCanvasImage(context, image, x, y) {
    const ret = wasm.drawCanvasImage(context, image, x, y);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws a cropped canvas layer from Rust, optionally overriding global alpha for the draw.
 * An alpha below zero preserves the caller's current alpha, matching the legacy layer path.
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLCanvasElement} image
 * @param {number} sx
 * @param {number} sy
 * @param {number} sw
 * @param {number} sh
 * @param {number} dx
 * @param {number} dy
 * @param {number} dw
 * @param {number} dh
 * @param {number} alpha
 * @returns {boolean}
 */
export function drawCanvasLayer(context, image, sx, sy, sw, sh, dx, dy, dw, dh, alpha) {
    const ret = wasm.drawCanvasLayer(context, image, sx, sy, sw, sh, dx, dy, dw, dh, alpha);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws the outlined combo multiplier using the browser's current font rasterizer.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {string} label
 * @returns {boolean}
 */
export function drawComboText(context, commands, label) {
    const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.drawComboText(context, commands, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Rasterizes ordered corpse ellipses with their original transforms and palette.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {Array<any>} colors
 * @returns {number}
 */
export function drawCorpses(context, commands, colors) {
    const ret = wasm.drawCorpses(context, commands, colors);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Builds the dark overlay with direct Canvas calls on both offscreen and screen contexts.
 * @param {CanvasRenderingContext2D} dark_context
 * @param {CanvasRenderingContext2D} screen_context
 * @param {any} overlay
 * @param {any} core
 * @param {any} far
 * @param {any} flash
 * @param {Float64Array} commands
 * @returns {boolean}
 */
export function drawDarkOverlay(dark_context, screen_context, overlay, core, far, flash, commands) {
    const ret = wasm.drawDarkOverlay(dark_context, screen_context, overlay, core, far, flash, commands);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws the optional developer HUD panel and error list without host Canvas calls.
 * @param {CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 * @param {boolean} show_panel
 * @param {Array<any>} lines
 * @param {boolean} show_errors
 * @param {Array<any>} errors
 * @returns {boolean}
 */
export function drawDebugHud(context, width, height, show_panel, lines, show_errors, errors) {
    const ret = wasm.drawDebugHud(context, width, height, show_panel, lines, show_errors, errors);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws optional collision and AI diagnostics. JS owns entity state and labels.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} walls
 * @param {number} wall_count
 * @param {Float64Array} doors
 * @param {number} door_count
 * @param {number} player_x
 * @param {number} player_y
 * @param {number} player_radius
 * @param {boolean} show_collisions
 * @param {Float64Array} enemies
 * @param {Array<any>} labels
 * @param {number} enemy_count
 * @param {boolean} show_ai
 * @returns {boolean}
 */
export function drawDebugWorld(context, walls, wall_count, doors, door_count, player_x, player_y, player_radius, show_collisions, enemies, labels, enemy_count, show_ai) {
    const ret = wasm.drawDebugWorld(context, walls, wall_count, doors, door_count, player_x, player_y, player_radius, show_collisions, enemies, labels, enemy_count, show_ai);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Rasterizes the Rust-generated dust circles in one direct Canvas batch.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {number} alpha
 * @returns {number}
 */
export function drawDust(context, commands, alpha) {
    const ret = wasm.drawDust(context, commands, alpha);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws enemy shadow ellipses directly in Canvas while preserving the host painter's per-enemy alpha.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {number} offset
 * @param {number} count
 * @returns {number}
 */
export function drawEnemyShadows(context, commands, offset, count) {
    const ret = wasm.drawEnemyShadows(context, commands, offset, count);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Paints the two persistent scorch circles left by an exploding barrel.
 * @param {CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function drawExplosionScorch(context, x, y) {
    const ret = wasm.drawExplosionScorch(context, x, y);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Rasterizes the already-positioned fog sprites without routing drawImage through host JS.
 * @param {CanvasRenderingContext2D} context
 * @param {any} image
 * @param {Float64Array} commands
 * @param {number} count
 * @param {number} alpha
 * @param {boolean} smoke
 * @returns {number}
 */
export function drawFog(context, image, commands, count, alpha, smoke) {
    const ret = wasm.drawFog(context, image, commands, count, alpha, smoke);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws muzzle sprites and short impact arcs from commands calculated by the legacy Rust pass.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {any} muzzle_sprite
 * @returns {number}
 */
export function drawFx(context, commands, muzzle_sprite) {
    const ret = wasm.drawFx(context, commands, muzzle_sprite);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws screen overlays directly on the supplied browser Canvas context.
 * Returns -1 for invalid input, otherwise the number of overlay rectangles.
 * @param {CanvasRenderingContext2D} context
 * @param {number} stage
 * @param {number} width
 * @param {number} height
 * @param {number} now_ms
 * @param {number} primary
 * @param {number} secondary
 * @param {boolean} enabled
 * @returns {number}
 */
export function drawFxOverlays(context, stage, width, height, now_ms, primary, secondary, enabled) {
    const ret = wasm.drawFxOverlays(context, stage, width, height, now_ms, primary, secondary, enabled);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws the persistent background trace created when a glass panel breaks.
 * @param {CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Float64Array} commands
 * @returns {boolean}
 */
export function drawGlassBreakTrace(context, x, y, width, height, commands) {
    const ret = wasm.drawGlassBreakTrace(context, x, y, width, height, commands);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws one selected HUD image from an existing five-number layout command.
 * @param {CanvasRenderingContext2D} context
 * @param {any} image
 * @param {Float64Array} commands
 * @returns {boolean}
 */
export function drawHudImage(context, image, commands) {
    const ret = wasm.drawHudImage(context, image, commands);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws the pulsing invasion-zone ring and fill from its six computed command values.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @returns {boolean}
 */
export function drawInvasionZone(context, commands) {
    const ret = wasm.drawInvasionZone(context, commands);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Rasterizes independently-alpha'd live blood marks and leaves alpha at one, matching the host painter.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {string} color
 * @returns {number}
 */
export function drawLiveBlood(context, commands, color) {
    const ptr0 = passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.drawLiveBlood(context, commands, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws Rust-generated static map command batches directly through Canvas.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {Array<any>} colors
 * @returns {number}
 */
export function drawMapCommands(context, commands, colors) {
    const ret = wasm.drawMapCommands(context, commands, colors);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws the complete pause overlay through Canvas APIs called from Rust/WASM.
 * JavaScript still owns pause state and pointer hit-testing.
 * @param {CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 * @param {number} hover_index
 * @returns {boolean}
 */
export function drawPauseUi(context, width, height, hover_index) {
    const ret = wasm.drawPauseUi(context, width, height, hover_index);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Draws JavaScript-owned rain segments as one Canvas path from Rust/WASM.
 * The input is interleaved x, y, length values; invalid rows are skipped.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} input
 * @param {number} count
 * @param {number} step
 * @returns {number}
 */
export function drawRain(context, input, count, step) {
    const ret = wasm.drawRain(context, input, count, step);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws plain HUD text entries directly, leaving entry construction in JS.
 * @param {CanvasRenderingContext2D} context
 * @param {Array<any>} entries
 * @returns {number}
 */
export function drawRawHudTexts(context, entries) {
    const ret = wasm.drawRawHudTexts(context, entries);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws projected shell casings from commands emitted by the legacy Rust pass.
 * Each row contains screen x/y, horizontal/vertical radii, and rotation.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {number} count
 * @returns {number}
 */
export function drawShells(context, commands, count) {
    const ret = wasm.drawShells(context, commands, count);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Rasterizes color/alpha-grouped spark rectangles using additive Canvas blending.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {Array<any>} colors
 * @returns {number}
 */
export function drawSparks(context, commands, colors) {
    const ret = wasm.drawSparks(context, commands, colors);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Rasterizes static blood marks as one path, preserving Canvas arc connection semantics.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {string} color
 * @returns {number}
 */
export function drawStaticBlood(context, commands, color) {
    const ptr0 = passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.drawStaticBlood(context, commands, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws ambient motes directly while JS retains all position updates.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} input
 * @param {number} count
 * @param {number} now_ms
 * @returns {number}
 */
export function drawWeatherMotes(context, input, count, now_ms) {
    const ret = wasm.drawWeatherMotes(context, input, count, now_ms);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Draws glow sprites and rain reflections from Rust-generated world-light commands.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {Array<any>} images
 * @param {any} flash_image
 * @returns {number}
 */
export function drawWorldLights(context, commands, images, flash_image) {
    const ret = wasm.drawWorldLights(context, commands, images, flash_image);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Rasterizes animated world rings emitted by the legacy Rust geometry pass.
 * @param {CanvasRenderingContext2D} context
 * @param {Float64Array} commands
 * @param {Array<any>} colors
 * @returns {number}
 */
export function drawWorldRings(context, commands, colors) {
    const ret = wasm.drawWorldRings(context, commands, colors);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {ImageData} image
 * @param {Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function putCanvasImageData(context, image, pixels, width, height) {
    const ret = wasm.putCanvasImageData(context, image, pixels, width, height);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {boolean} enabled
 * @returns {boolean}
 */
export function setCanvasImageSmoothing(context, enabled) {
    const ret = wasm.setCanvasImageSmoothing(context, enabled);
    return ret !== 0;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_boolean_get_5b446f51afd21013: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_is_null_e343b7d08827ba72: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_8865fb403f8fe9d8: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_2e0e7dee9f701a71: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_arc_03f7717b2e38682a: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.arc(arg1, arg2, arg3, arg4, arg5);
        }, arguments); },
        __wbg_beginPath_8598d895c13f1c86: function(arg0) {
            arg0.beginPath();
        },
        __wbg_clearRect_a5e36505218c247a: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.clearRect(arg1, arg2, arg3, arg4);
        },
        __wbg_clip_275e70d2dc182fec: function(arg0) {
            arg0.clip();
        },
        __wbg_closePath_355eb6da179dd9c2: function(arg0) {
            arg0.closePath();
        },
        __wbg_createImageData_eba92f20690e49b9: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.createImageData(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_createPattern_6afa84d0d2ffe63e: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.createPattern(arg1, getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_createPattern_94e5692cc458e195: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.createPattern(arg1, getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_drawImage_3fed5f1f3393a907: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            arg0.drawImage(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
        }, arguments); },
        __wbg_drawImage_4c91e25ed237ce22: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            arg0.drawImage(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
        }, arguments); },
        __wbg_drawImage_61d43245950ef561: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.drawImage(arg1, arg2, arg3);
        }, arguments); },
        __wbg_drawImage_6f841fbe7ccefe78: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.drawImage(arg1, arg2, arg3, arg4, arg5);
        }, arguments); },
        __wbg_drawImage_93d4867540340235: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.drawImage(arg1, arg2, arg3);
        }, arguments); },
        __wbg_drawImage_c0004b34389582f6: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.drawImage(arg1, arg2, arg3, arg4, arg5);
        }, arguments); },
        __wbg_ellipse_59ddb84ea8ee8ce1: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            arg0.ellipse(arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        }, arguments); },
        __wbg_fillRect_0ef59adb9acb7d06: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.fillRect(arg1, arg2, arg3, arg4);
        },
        __wbg_fillText_1bcec8b81ad73bd0: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
        }, arguments); },
        __wbg_fill_fc5e02a06cc26e92: function(arg0) {
            arg0.fill();
        },
        __wbg_getContext_635e36719cad2623: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_get_31af05bd4842a84f: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_6c896e0571ddae51: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_index_f4750150bb3083b3: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_globalAlpha_9ac73c8e4c5a15ad: function(arg0) {
            const ret = arg0.globalAlpha;
            return ret;
        },
        __wbg_height_816341c9bbd4e9e3: function(arg0) {
            const ret = arg0.height;
            return ret;
        },
        __wbg_height_fc97e1a0c2e7331f: function(arg0) {
            const ret = arg0.height;
            return ret;
        },
        __wbg_instanceof_CanvasPattern_72868c1ae822fada: function(arg0) {
            let result;
            try {
                result = arg0 instanceof CanvasPattern;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_CanvasRenderingContext2d_769208c72dcbf5e6: function(arg0) {
            let result;
            try {
                result = arg0 instanceof CanvasRenderingContext2D;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_HtmlCanvasElement_0a30c11fbbf41841: function(arg0) {
            let result;
            try {
                result = arg0 instanceof HTMLCanvasElement;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_HtmlImageElement_1e066996b10acb3d: function(arg0) {
            let result;
            try {
                result = arg0 instanceof HTMLImageElement;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8ClampedArray_ae70cf3ae1cd285f: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8ClampedArray;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_length_b5d0ffc9b832763b: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_b5f0008bbf60cf59: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_d4bdea10311bd9cf: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_lineTo_63fac7d60279d95e: function(arg0, arg1, arg2) {
            arg0.lineTo(arg1, arg2);
        },
        __wbg_measureText_1035b288be51876c: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.measureText(getStringFromWasm0(arg1, arg2));
            return ret;
        }, arguments); },
        __wbg_moveTo_037e3deefec91ae1: function(arg0, arg1, arg2) {
            arg0.moveTo(arg1, arg2);
        },
        __wbg_new_ee2291f50781bf1d: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_push_2baf45db356cf468: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_putImageData_11570c06086c9e05: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.putImageData(arg1, arg2, arg3);
        }, arguments); },
        __wbg_quadraticCurveTo_4f57843d21c4f90d: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.quadraticCurveTo(arg1, arg2, arg3, arg4);
        },
        __wbg_rect_c6f60004ffec8f09: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.rect(arg1, arg2, arg3, arg4);
        },
        __wbg_restore_c93ba7571816b182: function(arg0) {
            arg0.restore();
        },
        __wbg_rotate_5273f09fed0af920: function() { return handleError(function (arg0, arg1) {
            arg0.rotate(arg1);
        }, arguments); },
        __wbg_save_f32554f1747071d1: function(arg0) {
            arg0.save();
        },
        __wbg_scale_a6ef716accd967d5: function() { return handleError(function (arg0, arg1, arg2) {
            arg0.scale(arg1, arg2);
        }, arguments); },
        __wbg_setLineDash_9fc0f9169c542b64: function() { return handleError(function (arg0, arg1) {
            arg0.setLineDash(arg1);
        }, arguments); },
        __wbg_set_61a601c6843275e7: function(arg0, arg1, arg2) {
            arg0.set(arg1, arg2 >>> 0);
        },
        __wbg_set_fillStyle_00dcacffc57cf944: function(arg0, arg1) {
            arg0.fillStyle = arg1;
        },
        __wbg_set_fillStyle_a2961b4d44e572af: function(arg0, arg1, arg2) {
            arg0.fillStyle = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_font_1f60a05a2544a2ff: function(arg0, arg1, arg2) {
            arg0.font = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_globalAlpha_ae4b85201dda64c5: function(arg0, arg1) {
            arg0.globalAlpha = arg1;
        },
        __wbg_set_globalCompositeOperation_8d071d7528280f24: function() { return handleError(function (arg0, arg1, arg2) {
            arg0.globalCompositeOperation = getStringFromWasm0(arg1, arg2);
        }, arguments); },
        __wbg_set_height_c9789c1c77eaedff: function(arg0, arg1) {
            arg0.height = arg1 >>> 0;
        },
        __wbg_set_imageSmoothingEnabled_eb22252b69819404: function(arg0, arg1) {
            arg0.imageSmoothingEnabled = arg1 !== 0;
        },
        __wbg_set_lineCap_c9b7bdd3b7f5ce74: function(arg0, arg1, arg2) {
            arg0.lineCap = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_lineJoin_c1780f2096e6f970: function(arg0, arg1, arg2) {
            arg0.lineJoin = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_lineWidth_cc15473552c60c9c: function(arg0, arg1) {
            arg0.lineWidth = arg1;
        },
        __wbg_set_shadowBlur_216915d92b179fbe: function(arg0, arg1) {
            arg0.shadowBlur = arg1;
        },
        __wbg_set_shadowColor_0e2bd5d3400b0d3b: function(arg0, arg1, arg2) {
            arg0.shadowColor = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_shadowOffsetX_0dbcf4ca8295e0c3: function(arg0, arg1) {
            arg0.shadowOffsetX = arg1;
        },
        __wbg_set_shadowOffsetY_de495fcc5a5ae809: function(arg0, arg1) {
            arg0.shadowOffsetY = arg1;
        },
        __wbg_set_strokeStyle_d51608fa918b53d4: function(arg0, arg1, arg2) {
            arg0.strokeStyle = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_textAlign_1bda1733d57574ed: function(arg0, arg1, arg2) {
            arg0.textAlign = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_textBaseline_d5ba548751584f49: function(arg0, arg1, arg2) {
            arg0.textBaseline = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_width_b0e1267db4b196b5: function(arg0, arg1) {
            arg0.width = arg1 >>> 0;
        },
        __wbg_sin_2310c09055f9455d: function(arg0) {
            const ret = Math.sin(arg0);
            return ret;
        },
        __wbg_strokeRect_c6e73405ca787ae9: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.strokeRect(arg1, arg2, arg3, arg4);
        },
        __wbg_strokeText_acf127bdbf1ec111: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.strokeText(getStringFromWasm0(arg1, arg2), arg3, arg4);
        }, arguments); },
        __wbg_stroke_385d731098398489: function(arg0) {
            arg0.stroke();
        },
        __wbg_translate_b75b7d842d89a889: function() { return handleError(function (arg0, arg1, arg2) {
            arg0.translate(arg1, arg2);
        }, arguments); },
        __wbg_width_3d0dce3d9892e35e: function(arg0) {
            const ret = arg0.width;
            return ret;
        },
        __wbg_width_c9bfe09197f3b26e: function(arg0) {
            const ret = arg0.width;
            return ret;
        },
        __wbg_width_e95ad291d52fe17e: function(arg0) {
            const ret = arg0.width;
            return ret;
        },
        __wbindgen_generic_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_generic_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./direct_renderer_bg.js": import0,
    };
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('direct_renderer_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };

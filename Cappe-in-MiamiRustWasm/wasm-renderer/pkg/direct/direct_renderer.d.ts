/* tslint:disable */
/* eslint-disable */

export function clearCanvasRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): boolean;

export function createCanvasImageData(context: CanvasRenderingContext2D, width: number, height: number): ImageData | undefined;

export function createTextImage(canvas: HTMLCanvasElement, text: string, font: string, color: string, outlined: boolean): boolean;

/**
 * Draws the existing alarm status label using the browser's Canvas text rasterizer.
 */
export function drawAlarmText(context: CanvasRenderingContext2D, commands: Float64Array, label: string): boolean;

/**
 * Direct Rust/web-sys painter for the full shared eight-number command ABI.
 */
export function drawBatchCommands(context: CanvasRenderingContext2D, commands: Float64Array, furniture_colors: Array<any>, actor_colors: Array<any>, batch: any): number;

/**
 * Rasterizes the irregular puddles, directional trails, and droplets created on enemy death.
 * JavaScript keeps the original random sequence and passes only the resulting geometry.
 */
export function drawBloodSplatter(context: CanvasRenderingContext2D, puddle_color: string, drop_color: string, blobs: Float64Array, streaks: Float64Array, droplets: Float64Array): boolean;

/**
 * Draws cached projectile sprites at positions emitted by the legacy Rust pass.
 */
export function drawBullets(context: CanvasRenderingContext2D, commands: Float64Array, mine: any, foe: any): number;

/**
 * Draws a cached Canvas image directly into another Canvas context.
 */
export function drawCanvasImage(context: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number): boolean;

/**
 * Draws a cropped canvas layer from Rust, optionally overriding global alpha for the draw.
 * An alpha below zero preserves the caller's current alpha, matching the legacy layer path.
 */
export function drawCanvasLayer(context: CanvasRenderingContext2D, image: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, alpha: number): boolean;

/**
 * Draws the outlined combo multiplier using the browser's current font rasterizer.
 */
export function drawComboText(context: CanvasRenderingContext2D, commands: Float64Array, label: string): boolean;

/**
 * Rasterizes ordered corpse ellipses with their original transforms and palette.
 */
export function drawCorpses(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Builds the dark overlay with direct Canvas calls on both offscreen and screen contexts.
 */
export function drawDarkOverlay(dark_context: CanvasRenderingContext2D, screen_context: CanvasRenderingContext2D, overlay: any, core: any, far: any, flash: any, commands: Float64Array): boolean;

/**
 * Draws the optional developer HUD panel and error list without host Canvas calls.
 */
export function drawDebugHud(context: CanvasRenderingContext2D, width: number, height: number, show_panel: boolean, lines: Array<any>, show_errors: boolean, errors: Array<any>): boolean;

/**
 * Draws optional collision and AI diagnostics. JS owns entity state and labels.
 */
export function drawDebugWorld(context: CanvasRenderingContext2D, walls: Float64Array, wall_count: number, doors: Float64Array, door_count: number, player_x: number, player_y: number, player_radius: number, show_collisions: boolean, enemies: Float64Array, labels: Array<any>, enemy_count: number, show_ai: boolean): boolean;

/**
 * Rasterizes the Rust-generated dust circles in one direct Canvas batch.
 */
export function drawDust(context: CanvasRenderingContext2D, commands: Float64Array, alpha: number): number;

/**
 * Draws enemy shadow ellipses directly in Canvas while preserving the host painter's per-enemy alpha.
 */
export function drawEnemyShadows(context: CanvasRenderingContext2D, commands: Float64Array, offset: number, count: number): number;

/**
 * Paints the two persistent scorch circles left by an exploding barrel.
 */
export function drawExplosionScorch(context: CanvasRenderingContext2D, x: number, y: number): boolean;

/**
 * Rasterizes the already-positioned fog sprites without routing drawImage through host JS.
 */
export function drawFog(context: CanvasRenderingContext2D, image: any, commands: Float64Array, count: number, alpha: number, smoke: boolean): number;

/**
 * Draws muzzle sprites and short impact arcs from commands calculated by the legacy Rust pass.
 */
export function drawFx(context: CanvasRenderingContext2D, commands: Float64Array, muzzle_sprite: any): number;

/**
 * Draws screen overlays directly on the supplied browser Canvas context.
 * Returns -1 for invalid input, otherwise the number of overlay rectangles.
 */
export function drawFxOverlays(context: CanvasRenderingContext2D, stage: number, width: number, height: number, now_ms: number, primary: number, secondary: number, enabled: boolean): number;

/**
 * Draws the persistent background trace created when a glass panel breaks.
 */
export function drawGlassBreakTrace(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, commands: Float64Array): boolean;

/**
 * Draws one selected HUD image from an existing five-number layout command.
 */
export function drawHudImage(context: CanvasRenderingContext2D, image: any, commands: Float64Array): boolean;

/**
 * Draws the pulsing invasion-zone ring and fill from its six computed command values.
 */
export function drawInvasionZone(context: CanvasRenderingContext2D, commands: Float64Array): boolean;

/**
 * Rasterizes independently-alpha'd live blood marks and leaves alpha at one, matching the host painter.
 */
export function drawLiveBlood(context: CanvasRenderingContext2D, commands: Float64Array, color: string): number;

/**
 * Draws Rust-generated static map command batches directly through Canvas.
 */
export function drawMapCommands(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Draws the complete pause overlay through Canvas APIs called from Rust/WASM.
 * JavaScript still owns pause state and pointer hit-testing.
 */
export function drawPauseUi(context: CanvasRenderingContext2D, width: number, height: number, hover_index: number): boolean;

/**
 * Draws JavaScript-owned rain segments as one Canvas path from Rust/WASM.
 * The input is interleaved x, y, length values; invalid rows are skipped.
 */
export function drawRain(context: CanvasRenderingContext2D, input: Float64Array, count: number, step: number): number;

/**
 * Draws plain HUD text entries directly, leaving entry construction in JS.
 */
export function drawRawHudTexts(context: CanvasRenderingContext2D, entries: Array<any>): number;

/**
 * Draws projected shell casings from commands emitted by the legacy Rust pass.
 * Each row contains screen x/y, horizontal/vertical radii, and rotation.
 */
export function drawShells(context: CanvasRenderingContext2D, commands: Float64Array, count: number): number;

/**
 * Rasterizes color/alpha-grouped spark rectangles using additive Canvas blending.
 */
export function drawSparks(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Rasterizes static blood marks as one path, preserving Canvas arc connection semantics.
 */
export function drawStaticBlood(context: CanvasRenderingContext2D, commands: Float64Array, color: string): number;

/**
 * Draws ambient motes directly while JS retains all position updates.
 */
export function drawWeatherMotes(context: CanvasRenderingContext2D, input: Float64Array, count: number, now_ms: number): number;

/**
 * Draws glow sprites and rain reflections from Rust-generated world-light commands.
 */
export function drawWorldLights(context: CanvasRenderingContext2D, commands: Float64Array, images: Array<any>, flash_image: any): number;

/**
 * Rasterizes animated world rings emitted by the legacy Rust geometry pass.
 */
export function drawWorldRings(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

export function putCanvasImageData(context: CanvasRenderingContext2D, image: ImageData, pixels: Uint8ClampedArray, width: number, height: number): boolean;

export function setCanvasImageSmoothing(context: CanvasRenderingContext2D, enabled: boolean): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly clearCanvasRect: (a: any, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly createCanvasImageData: (a: any, b: number, c: number) => [number, number, number];
    readonly createTextImage: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly drawAlarmText: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawBatchCommands: (a: any, b: any, c: any, d: any, e: any) => [number, number, number];
    readonly drawBloodSplatter: (a: any, b: number, c: number, d: number, e: number, f: any, g: any, h: any) => [number, number, number];
    readonly drawBullets: (a: any, b: any, c: any, d: any) => [number, number, number];
    readonly drawCanvasImage: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawCanvasLayer: (a: any, b: any, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number];
    readonly drawComboText: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawCorpses: (a: any, b: any, c: any) => [number, number, number];
    readonly drawDarkOverlay: (a: any, b: any, c: any, d: any, e: any, f: any, g: any) => [number, number, number];
    readonly drawDebugHud: (a: any, b: number, c: number, d: number, e: any, f: number, g: any) => [number, number, number];
    readonly drawDebugWorld: (a: any, b: any, c: number, d: any, e: number, f: number, g: number, h: number, i: number, j: any, k: any, l: number, m: number) => [number, number, number];
    readonly drawDust: (a: any, b: any, c: number) => [number, number, number];
    readonly drawEnemyShadows: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawExplosionScorch: (a: any, b: number, c: number) => [number, number, number];
    readonly drawFog: (a: any, b: any, c: any, d: number, e: number, f: number) => [number, number, number];
    readonly drawFx: (a: any, b: any, c: any) => [number, number, number];
    readonly drawFxOverlays: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly drawGlassBreakTrace: (a: any, b: number, c: number, d: number, e: number, f: any) => [number, number, number];
    readonly drawHudImage: (a: any, b: any, c: any) => [number, number, number];
    readonly drawInvasionZone: (a: any, b: any) => [number, number, number];
    readonly drawLiveBlood: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawMapCommands: (a: any, b: any, c: any) => [number, number, number];
    readonly drawPauseUi: (a: any, b: number, c: number, d: number) => [number, number, number];
    readonly drawRain: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawRawHudTexts: (a: any, b: any) => [number, number, number];
    readonly drawShells: (a: any, b: any, c: number) => [number, number, number];
    readonly drawSparks: (a: any, b: any, c: any) => [number, number, number];
    readonly drawStaticBlood: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawWeatherMotes: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawWorldLights: (a: any, b: any, c: any, d: any) => [number, number, number];
    readonly drawWorldRings: (a: any, b: any, c: any) => [number, number, number];
    readonly putCanvasImageData: (a: any, b: any, c: any, d: number, e: number) => [number, number, number];
    readonly setCanvasImageSmoothing: (a: any, b: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

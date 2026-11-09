/* tslint:disable */
/* eslint-disable */

export function clearCanvasRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): boolean;

export function createCanvasImageData(context: CanvasRenderingContext2D, width: number, height: number): ImageData | undefined;

/**
 * Generates the cached exit glow fill directly in Rust/WebSys.
 */
export function createExitGradient(canvas: HTMLCanvasElement, width: number, height: number, cleared: boolean): boolean;

/**
 * Rasterizes the nine radial fog/smoke rings directly in Rust/WebSys.
 */
export function createFogSprite(canvas: HTMLCanvasElement, rings: Float64Array): boolean;

/**
 * Generates the cached muzzle-flash sprite directly in Rust/WebSys.
 */
export function createMuzzleSprite(canvas: HTMLCanvasElement): boolean;

/**
 * Generates the cached radial light sprite directly in Rust/WebSys.
 */
export function createRadialSprite(canvas: HTMLCanvasElement, red: number, green: number, blue: number, radius: number, alpha: number): boolean;

export function createTextImage(canvas: HTMLCanvasElement, text: string, font: string, color: string, outlined: boolean): boolean;

/**
 * Generates the cached stair/elevator/door gradient directly in Rust/WebSys.
 */
export function createTransportGradient(canvas: HTMLCanvasElement, width: number, height: number, kind: number, offset_x: number, gradient_width: number): boolean;

/**
 * Draws the existing alarm status label using the browser's Canvas text rasterizer.
 */
export function drawAlarmText(context: CanvasRenderingContext2D, commands: Float64Array, label: string): boolean;

/**
 * Formats and paints the centered alarm timer entirely in Rust/WebSys.
 */
export function drawAlarmTextStage(context: CanvasRenderingContext2D, seconds: number, screen_width: number): boolean;

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
 * Paints the expansion boss health bar and phase markers directly in Rust.
 */
export function drawBossHealthBar(context: CanvasRenderingContext2D, width: number, height: number, fraction: number, boss_color: string, phases: Float64Array): boolean;

/**
 * Draws world-simulation projectile inputs directly, preserving owner sprite and centered offset.
 */
export function drawBulletInputs(context: CanvasRenderingContext2D, inputs: Float64Array, mine: any, foe: any): number;

/**
 * Draws cached projectile sprites at positions emitted by the legacy Rust pass.
 */
export function drawBullets(context: CanvasRenderingContext2D, commands: Float64Array, mine: any, foe: any): number;

/**
 * Draws a cached Canvas image directly into another Canvas context.
 */
export function drawCanvasImage(context: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number): boolean;

/**
 * Draws a batch of cached text images with per-entry alpha in one direct Rust call.
 * Placements contain x, y and alpha triples; Canvas state is restored after each image.
 */
export function drawCanvasImageBatch(context: CanvasRenderingContext2D, images: Array<any>, placements: Float64Array): number;

/**
 * Draws a cropped canvas layer from Rust, optionally overriding global alpha for the draw.
 * An alpha below zero preserves the caller's current alpha, matching the legacy layer path.
 */
export function drawCanvasLayer(context: CanvasRenderingContext2D, image: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, alpha: number): boolean;

/**
 * Applies the two existing full-screen color-grade passes directly through Rust/WASM.
 */
export function drawColorGrade(context: CanvasRenderingContext2D, width: number, height: number): boolean;

/**
 * Draws the outlined combo multiplier using the browser's current font rasterizer.
 */
export function drawComboText(context: CanvasRenderingContext2D, commands: Float64Array, label: string): boolean;

/**
 * Computes the combo pulse and paints its outlined multiplier directly in Rust/WebSys.
 */
export function drawComboTextStage(context: CanvasRenderingContext2D, combo: number, now_ms: number): boolean;

/**
 * Derives the original shadow/body ellipses from corpse state and paints them without the legacy batch.
 */
export function drawCorpseInputs(context: CanvasRenderingContext2D, input: Float64Array, colors: Array<any>): number;

export function drawCorpses(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Projects living enemies and derives their dark-scene outlines from simulation state directly.
 */
export function drawDarkOutlineInputs(context: CanvasRenderingContext2D, input: Float64Array, camera_x: number, camera_y: number, screen_width: number, screen_height: number, zoom: number): number;

/**
 * Draws projected actor outlines for dark scenes, preserving the existing stroke styles.
 */
export function drawDarkOutlines(context: CanvasRenderingContext2D, commands: Float64Array): number;

/**
 * Builds the dark overlay with direct Canvas calls on both offscreen and screen contexts.
 */
export function drawDarkOverlay(dark_context: CanvasRenderingContext2D, screen_context: CanvasRenderingContext2D, overlay: any, core: any, far: any, flash: any, commands: Float64Array): boolean;

/**
 * Projects player/world coordinates and paints the blackout mask without legacy command generation.
 */
export function drawDarkOverlayInputs(dark_context: CanvasRenderingContext2D, screen_context: CanvasRenderingContext2D, overlay: any, core: any, far: any, flash: any, player_x: number, player_y: number, camera_x: number, camera_y: number, screen_w: number, screen_h: number, zoom: number, angle: number, blackout: boolean, fire_flash: boolean): boolean;

/**
 * Draws the optional developer HUD panel and error list without host Canvas calls.
 */
export function drawDebugHud(context: CanvasRenderingContext2D, width: number, height: number, show_panel: boolean, lines: Array<any>, show_errors: boolean, errors: Array<any>): boolean;

/**
 * Draws optional collision and AI diagnostics. JS owns entity state and labels.
 */
export function drawDebugWorld(context: CanvasRenderingContext2D, walls: Float64Array, wall_count: number, doors: Float64Array, door_count: number, player_x: number, player_y: number, player_radius: number, show_collisions: boolean, enemies: Float64Array, labels: Array<any>, enemy_count: number, show_ai: boolean): boolean;

/**
 * Draws standard room doors directly, without generating a legacy WASM command batch.
 */
export function drawDoors(context: CanvasRenderingContext2D, doors: Float64Array, door_image: any, furniture_colors: Array<any>): number;

/**
 * Rasterizes the Rust-generated dust circles in one direct Canvas batch.
 */
export function drawDust(context: CanvasRenderingContext2D, commands: Float64Array, alpha: number): number;

/**
 * Filters and composes visible enemy shadows, bodies, stun marks, and cached labels directly.
 */
export function drawEnemies(context: CanvasRenderingContext2D, items: Float64Array, player_x: number, player_y: number, enemy_sheet: any, now_ms: number, actor_colors: Array<any>, text_images: Array<any>, text_placements: Float64Array, text_offsets: Uint32Array): number;

/**
 * Draws enemy shadow ellipses directly in Canvas while preserving the host painter's per-enemy alpha.
 */
export function drawEnemyShadows(context: CanvasRenderingContext2D, commands: Float64Array, offset: number, count: number): number;

/**
 * Rasterizes the existing exit glow, gradient, hatches, and borders directly in Rust/WASM.
 */
export function drawExitCommands(context: CanvasRenderingContext2D, commands: Float64Array, gradient: any, pulse: number, cleared: boolean, bloom: boolean): number;

/**
 * Builds and paints a phase exit directly, without asking the legacy renderer for commands.
 */
export function drawExitDirect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, pulse: number, cleared: boolean, bloom: boolean, gradient: any): boolean;

/**
 * Paints the two persistent scorch circles left by an exploding barrel.
 */
export function drawExplosionScorch(context: CanvasRenderingContext2D, x: number, y: number): boolean;

/**
 * Draws the existing end-of-frame fade and optional flash passes through Rust/WASM.
 */
export function drawFinalOverlays(context: CanvasRenderingContext2D, width: number, height: number, fade: number, flash: number, flash_enabled: boolean): boolean;

/**
 * Generates deterministic floor-grain pixels directly into ImageData and returns the advanced RNG state.
 */
export function drawFloorGrainRgba(data: Uint8ClampedArray, width: number, height: number, seed: number): number;

/**
 * Paints repeating floor tiles with the Canvas clipping/compositing rules, called directly from Rust.
 */
export function drawFloorTilesCanvas(context: CanvasRenderingContext2D, tile_image: HTMLImageElement, rooms: Float64Array, hall_index: number, tile_index: number, width: number, height: number): number;

/**
 * Rasterizes the already-positioned fog sprites without routing drawImage through host JS.
 */
export function drawFog(context: CanvasRenderingContext2D, image: any, commands: Float64Array, count: number, alpha: number, smoke: boolean): number;

/**
 * Computes the three drifting fog/smoke sprites and paints them directly from simulation time.
 */
export function drawFogInputs(context: CanvasRenderingContext2D, image: any, now_ms: number, smoke: boolean, perf_tier: number): number;

/**
 * Fills the frame background with the game's shake-safe margins.
 */
export function drawFrameBackground(context: CanvasRenderingContext2D, width: number, height: number): boolean;

/**
 * Applies one of the game's nested screen shake, kick, or camera transforms.
 * Stages 0 and 1 open save scopes, stage 2 applies the camera transform, and
 * stages 3 and 4 close the matching scopes.
 */
export function drawFrameTransforms(context: CanvasRenderingContext2D, stage: number, input: Float64Array): boolean;

/**
 * Paints static furniture directly from compact records, bypassing the legacy command generator.
 */
export function drawFurniture(context: CanvasRenderingContext2D, items: Float64Array, colors: Array<any>): number;

/**
 * Draws muzzle flashes and short impact arcs from prepared effect commands.
 */
export function drawFx(context: CanvasRenderingContext2D, commands: Float64Array): number;

/**
 * Draws effect inputs directly, without a command-generation pass in the legacy WASM module.
 */
export function drawFxInputs(context: CanvasRenderingContext2D, inputs: Float64Array): number;

/**
 * Draws screen overlays directly on the supplied browser Canvas context.
 * Returns -1 for invalid input, otherwise the number of overlay rectangles.
 */
export function drawFxOverlays(context: CanvasRenderingContext2D, stage: number, width: number, height: number, now_ms: number, primary: number, secondary: number, enabled: boolean): number;

/**
 * Composes player afterimages directly from host-owned motion samples.
 */
export function drawGhosts(context: CanvasRenderingContext2D, items: Float64Array, weapon: number, furniture_colors: Array<any>, actor_colors: Array<any>): number;

/**
 * Paints intact glass and active shards directly from the host-maintained simulation records.
 */
export function drawGlass(context: CanvasRenderingContext2D, panels: Float64Array, shards: Float64Array, now_ms: number, base_alpha: number, colors: Array<any>): number;

/**
 * Draws the persistent background trace created when a glass panel breaks.
 */
export function drawGlassBreakTrace(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, commands: Float64Array): boolean;

/**
 * Draws one selected HUD image from an existing five-number layout command.
 */
export function drawHudImage(context: CanvasRenderingContext2D, image: any, commands: Float64Array): boolean;

/**
 * Selects and paints the existing vignette or mask image without the legacy HUD generator.
 */
export function drawHudImageStage(context: CanvasRenderingContext2D, stage: number, width: number, height: number, crt: boolean, has_player: boolean, has_mask: boolean, images: Array<any>): boolean;

/**
 * Draws the game's fixed HUD shapes directly from Rust without the legacy command bridge.
 */
export function drawHudShape(context: CanvasRenderingContext2D, stage: number, width: number, height: number, value: number): boolean;

/**
 * Rasterizes the legacy HUD geometry batch while Rust keeps its exact opcode and palette.
 */
export function drawHudShapeCommands(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Rasterizes the invasion direction triangle from its three Rust-generated vertices.
 */
export function drawInvasionArrow(context: CanvasRenderingContext2D, vertices: Float64Array): boolean;

/**
 * Computes and paints the Invasion direction arrow without the legacy command buffer.
 */
export function drawInvasionArrowInput(context: CanvasRenderingContext2D, center_x: number, center_y: number, cosine: number, sine: number): boolean;

/**
 * Draws the pulsing invasion-zone ring and fill from its six computed command values.
 */
export function drawInvasionZone(context: CanvasRenderingContext2D, commands: Float64Array): boolean;

/**
 * Computes and paints the pulsing Invasion marker without the legacy geometry batch.
 */
export function drawInvasionZoneInput(context: CanvasRenderingContext2D, x: number, y: number, now_ms: number): boolean;

/**
 * Rasterizes independently-alpha'd live blood marks and leaves alpha at one, matching the host painter.
 */
export function drawLiveBlood(context: CanvasRenderingContext2D, commands: Float64Array, color: string): number;

/**
 * Generates and paints intact breakable panes and transient glass fragments directly.
 */
export function drawMapBreakables(context: CanvasRenderingContext2D, items: Float64Array, panel_count: number, shard_count: number): number;

/**
 * Draws Rust-generated static map command batches directly through Canvas.
 */
export function drawMapCommands(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Generates and paints static room decor directly, preserving rug details and input order.
 */
export function drawMapDecor(context: CanvasRenderingContext2D, decor: Float64Array, colors: Array<any>): number;

/**
 * Generates and paints static room inlays and floor specks, returning the advanced RNG state.
 */
export function drawMapDetails(context: CanvasRenderingContext2D, rooms: Float64Array, width: number, height: number, seed: number): number;

/**
 * Draws map shadows directly, with separate offsets for walls and furniture.
 */
export function drawMapShadows(context: CanvasRenderingContext2D, rectangles: Float64Array): number;

/**
 * Generates and paints wall faces and decorative posts directly in Rust/WebSys.
 */
export function drawMapStructure(context: CanvasRenderingContext2D, geometry: Float64Array): number;

/**
 * Rasterizes wall/furniture patterns and open-door decals without the legacy renderer callback.
 */
export function drawMapTexturesRgba(context: CanvasRenderingContext2D, image: ImageData, solids: Float64Array, openings: Float64Array, texture_input: Uint8Array, wall_ready: boolean, furniture_ready: boolean, door_ready: boolean, across: number, width: number, height: number): number;

/**
 * Rasterizes an expansion mask sprite using Rust-owned Canvas calls.
 * Colors: [base, outline, eyes, dark, nose]. Params: [ears, eyes, marks, mouth, width, height, eye_y].
 */
export function drawMaskArt(context: CanvasRenderingContext2D, colors: Array<any>, params: Float64Array): boolean;

/**
 * Draws animated Neon door sprites and transforms without a legacy WASM batch.
 */
export function drawNeonDoors(context: CanvasRenderingContext2D, doors: Float64Array, sprite_images: Array<any>): number;

/**
 * Paints the hidden-object outline and escape route for the Owl character.
 * Items are rows of [kind, x, y, radius_or_half_width, half_height].
 * Kinds: 0 pickup rectangle, 1 circular object, 2 camera rectangle.
 */
export function drawOwlOverlay(context: CanvasRenderingContext2D, items: Float64Array, item_count: number, path: Float64Array, path_count: number, now_ms: number, pulse: number): number;

/**
 * Draws the complete pause overlay through Canvas APIs called from Rust/WASM.
 * JavaScript still owns pause state and pointer hit-testing.
 */
export function drawPauseUi(context: CanvasRenderingContext2D, width: number, height: number, hover_index: number, title: string, resume_label: string, lobby_label: string): boolean;

/**
 * Draws pickup transforms, their pulsing glow, and weapon icons in direct Rust/WebSys.
 */
export function drawPickups(context: CanvasRenderingContext2D, commands: Float64Array, glow: boolean, colors: Array<any>): number;

/**
 * Draws the player's shadow and optional local color glow.
 */
export function drawPlayerAura(context: CanvasRenderingContext2D, is_p2: boolean, shadows: boolean, glow: boolean): boolean;

/**
 * Builds the game's procedural 24x24 player frame in the supplied ImageData bytes.
 * Gameplay timing and the host-computed animation sine remain owned by JavaScript.
 */
export function drawPlayerFrameRgba(output: Uint8ClampedArray, palette_input: Uint32Array, state: number, _phase: number, attack_frame: number, sine: number): boolean;

/**
 * Composes live players directly, preserving host-owned state and sprite assets.
 */
export function drawPlayers(context: CanvasRenderingContext2D, items: Float64Array, player_sheet: any, player_frames: Array<any>, skin_colors: Array<any>, furniture_colors: Array<any>, actor_colors: Array<any>): number;

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
 * Projects world-space shell inputs and paints them without the legacy WASM command batch.
 */
export function drawShellInputs(context: CanvasRenderingContext2D, inputs: Float64Array, camera_x: number, camera_y: number): number;

/**
 * Draws projected shell casings from commands emitted by the legacy Rust pass.
 * Each row contains screen x/y, horizontal/vertical radii, and rotation.
 */
export function drawShells(context: CanvasRenderingContext2D, commands: Float64Array, count: number): number;

/**
 * Computes and paints the shop dealer's ordered geometry directly in Rust/WebSys.
 */
export function drawShopDealerStage(context: CanvasRenderingContext2D, values: Float64Array): number;

/**
 * Computes and paints the shop speech bubble, card, or reroll panel directly in Rust/WebSys.
 */
export function drawShopPanelStage(context: CanvasRenderingContext2D, values: Float64Array, outline_color: string): boolean;

/**
 * Groups spark inputs once, then paints each color/alpha batch without JS element reads or a second command array.
 */
export function drawSparkInputs(context: CanvasRenderingContext2D, input: Float64Array, colors: Array<any>): number;

/**
 * Rasterizes color/alpha-grouped spark rectangles using additive Canvas blending.
 */
export function drawSparks(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Rasterizes static blood marks as one path, preserving Canvas arc connection semantics.
 */
export function drawStaticBlood(context: CanvasRenderingContext2D, commands: Float64Array, color: string): number;

/**
 * Draws thrown weapon transforms and icons entirely in direct Rust/WebSys.
 */
export function drawThrows(context: CanvasRenderingContext2D, commands: Float64Array, colors: Array<any>): number;

/**
 * Applies the campaign tile map's themed wall faces and trims directly through Rust/WebSys.
 */
export function drawTileWalls(context: CanvasRenderingContext2D, walls: Float64Array, wall_color: string, trim_color: string): number;

/**
 * Rasterizes the existing stair/elevator command batch directly through WebSys.
 */
export function drawTransportCommands(context: CanvasRenderingContext2D, commands: Float64Array, stair: any, elevator: any, door_left: any, door_right: any): number;

/**
 * Builds and paints one stair/elevator directly, without asking the legacy renderer for commands.
 */
export function drawTransportDirect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, kind: number, up: boolean, stair: any, elevator: any, door_left: any, door_right: any): boolean;

/**
 * Builds and rasterizes an existing weapon icon entirely in the direct Rust renderer.
 */
export function drawWeaponIcon(context: CanvasRenderingContext2D, id: number, colors: Array<any>): boolean;

/**
 * Draws ambient motes directly while JS retains all position updates.
 */
export function drawWeatherMotes(context: CanvasRenderingContext2D, input: Float64Array, count: number, now_ms: number): number;

/**
 * Paints world barrels directly from live simulation records, without legacy command generation.
 */
export function drawWorldBarrels(context: CanvasRenderingContext2D, barrels: Float64Array, now_ms: number, colors: Array<any>): number;

/**
 * Paints camera cones, housings, and lenses directly from simulation records.
 */
export function drawWorldCameras(context: CanvasRenderingContext2D, cameras: Float64Array, colors: Array<any>): number;

/**
 * Draws enemy class accents and telegraphs directly from the host-selected enemy records.
 */
export function drawWorldEnemyAccents(context: CanvasRenderingContext2D, input: Float64Array, count: number, now_ms: number, colors: Array<any>): number;

/**
 * Computes pulse/flicker light commands and paints them directly, preserving JS-owned light state.
 */
export function drawWorldLightInputs(context: CanvasRenderingContext2D, input: Float64Array, images: Array<any>, metadata: Float64Array, flash_image: any): number;

/**
 * Computes each active ring's pulse and paints it without legacy command generation.
 */
export function drawWorldRingInputs(context: CanvasRenderingContext2D, input: Float64Array, colors: Array<any>): number;

/**
 * Generates and paints a static carpet/tile/brick floor directly in Rust/WebSys.
 * Returns [next RNG state, emitted rectangle count] to preserve host RNG progression.
 */
export function paintFloor(context: CanvasRenderingContext2D, kind: number, x: number, y: number, width: number, height: number, spacing: number, seed: number, color_input: Array<any>): Float64Array;

/**
 * Paints static floor shadows and grout on Canvas directly from Rust/WebSys.
 */
export function paintFloorFinishCanvas(context: CanvasRenderingContext2D, solids: Float64Array, width: number, height: number): number;

/**
 * Paints the optional fixed-map backing directly in Rust/WebSys.
 */
export function paintMapBase(context: CanvasRenderingContext2D, fixed_map: boolean, width: number, height: number): boolean;

/**
 * Paints the translucent map light layer directly in Rust/WebSys.
 */
export function paintMapOverlay(context: CanvasRenderingContext2D, width: number, height: number): boolean;

export function putCanvasImageData(context: CanvasRenderingContext2D, image: ImageData, pixels: Uint8ClampedArray, width: number, height: number): boolean;

/**
 * Reads a small texture source into ImageData through Rust's Web APIs.
 * Canvas sources are read directly; image sources are rasterized into the supplied scratch canvas.
 */
export function readCanvasSourcePixels(source: any, scratch: CanvasRenderingContext2D, width: number, height: number): any;

/**
 * Selects the enemy sprite sheet cell at the legacy 110 ms animation cadence.
 */
export function selectEnemySprite(moving: boolean, now_ms: number): number;

/**
 * Selects the player's existing sprite sheet cell with the legacy animation math.
 */
export function selectPlayerSprite(state: number, animation: number, attack_remaining: number): number;

export function setCanvasImageSmoothing(context: CanvasRenderingContext2D, enabled: boolean): boolean;

/**
 * Applies the renderer's root Canvas transform and smoothing settings directly.
 */
export function setupCanvas(context: CanvasRenderingContext2D, scale: number, smoothing: boolean, quality: number): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly clearCanvasRect: (a: any, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly createCanvasImageData: (a: any, b: number, c: number) => [number, number, number];
    readonly createExitGradient: (a: any, b: number, c: number, d: number) => [number, number, number];
    readonly createFogSprite: (a: any, b: any) => [number, number, number];
    readonly createMuzzleSprite: (a: any) => [number, number, number];
    readonly createRadialSprite: (a: any, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly createTextImage: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly createTransportGradient: (a: any, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly drawAlarmText: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawAlarmTextStage: (a: any, b: number, c: number) => [number, number, number];
    readonly drawBatchCommands: (a: any, b: any, c: any, d: any, e: any) => [number, number, number];
    readonly drawBloodSplatter: (a: any, b: number, c: number, d: number, e: number, f: any, g: any, h: any) => [number, number, number];
    readonly drawBossHealthBar: (a: any, b: number, c: number, d: number, e: number, f: number, g: any) => [number, number, number];
    readonly drawBulletInputs: (a: any, b: any, c: any, d: any) => [number, number, number];
    readonly drawBullets: (a: any, b: any, c: any, d: any) => [number, number, number];
    readonly drawCanvasImage: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawCanvasImageBatch: (a: any, b: any, c: any) => [number, number, number];
    readonly drawCanvasLayer: (a: any, b: any, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number];
    readonly drawColorGrade: (a: any, b: number, c: number) => [number, number, number];
    readonly drawComboText: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawComboTextStage: (a: any, b: number, c: number) => [number, number, number];
    readonly drawCorpseInputs: (a: any, b: any, c: any) => [number, number, number];
    readonly drawCorpses: (a: any, b: any, c: any) => [number, number, number];
    readonly drawDarkOutlineInputs: (a: any, b: any, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly drawDarkOutlines: (a: any, b: any) => [number, number, number];
    readonly drawDarkOverlay: (a: any, b: any, c: any, d: any, e: any, f: any, g: any) => [number, number, number];
    readonly drawDarkOverlayInputs: (a: any, b: any, c: any, d: any, e: any, f: any, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => [number, number, number];
    readonly drawDebugHud: (a: any, b: number, c: number, d: number, e: any, f: number, g: any) => [number, number, number];
    readonly drawDebugWorld: (a: any, b: any, c: number, d: any, e: number, f: number, g: number, h: number, i: number, j: any, k: any, l: number, m: number) => [number, number, number];
    readonly drawDoors: (a: any, b: any, c: any, d: any) => [number, number, number];
    readonly drawDust: (a: any, b: any, c: number) => [number, number, number];
    readonly drawEnemies: (a: any, b: any, c: number, d: number, e: any, f: number, g: any, h: any, i: any, j: any) => [number, number, number];
    readonly drawEnemyShadows: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawExitCommands: (a: any, b: any, c: any, d: number, e: number, f: number) => [number, number, number];
    readonly drawExitDirect: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: any) => [number, number, number];
    readonly drawExplosionScorch: (a: any, b: number, c: number) => [number, number, number];
    readonly drawFinalOverlays: (a: any, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly drawFloorGrainRgba: (a: any, b: number, c: number, d: number) => number;
    readonly drawFloorTilesCanvas: (a: any, b: any, c: any, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly drawFog: (a: any, b: any, c: any, d: number, e: number, f: number) => [number, number, number];
    readonly drawFogInputs: (a: any, b: any, c: number, d: number, e: number) => [number, number, number];
    readonly drawFrameBackground: (a: any, b: number, c: number) => [number, number, number];
    readonly drawFrameTransforms: (a: any, b: number, c: number, d: number) => [number, number, number];
    readonly drawFurniture: (a: any, b: any, c: any) => [number, number, number];
    readonly drawFx: (a: any, b: any) => [number, number, number];
    readonly drawFxInputs: (a: any, b: any) => [number, number, number];
    readonly drawFxOverlays: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly drawGhosts: (a: any, b: any, c: number, d: any, e: any) => [number, number, number];
    readonly drawGlass: (a: any, b: any, c: any, d: number, e: number, f: any) => [number, number, number];
    readonly drawGlassBreakTrace: (a: any, b: number, c: number, d: number, e: number, f: any) => [number, number, number];
    readonly drawHudImage: (a: any, b: any, c: any) => [number, number, number];
    readonly drawHudImageStage: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: any) => [number, number, number];
    readonly drawHudShape: (a: any, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly drawHudShapeCommands: (a: any, b: any, c: any) => [number, number, number];
    readonly drawInvasionArrow: (a: any, b: any) => [number, number, number];
    readonly drawInvasionArrowInput: (a: any, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly drawInvasionZone: (a: any, b: any) => [number, number, number];
    readonly drawInvasionZoneInput: (a: any, b: number, c: number, d: number) => [number, number, number];
    readonly drawLiveBlood: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawMapBreakables: (a: any, b: any, c: number, d: number) => number;
    readonly drawMapCommands: (a: any, b: any, c: any) => [number, number, number];
    readonly drawMapDecor: (a: any, b: any, c: any) => [number, number, number];
    readonly drawMapDetails: (a: any, b: any, c: number, d: number, e: number) => [number, number, number];
    readonly drawMapShadows: (a: any, b: any) => number;
    readonly drawMapStructure: (a: any, b: any) => number;
    readonly drawMapTexturesRgba: (a: any, b: any, c: any, d: any, e: any, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number];
    readonly drawMaskArt: (a: any, b: any, c: any) => [number, number, number];
    readonly drawNeonDoors: (a: any, b: any, c: any) => [number, number, number];
    readonly drawOwlOverlay: (a: any, b: any, c: number, d: any, e: number, f: number, g: number) => [number, number, number];
    readonly drawPauseUi: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number];
    readonly drawPickups: (a: any, b: any, c: number, d: any) => [number, number, number];
    readonly drawPlayerAura: (a: any, b: number, c: number, d: number) => [number, number, number];
    readonly drawPlayerFrameRgba: (a: any, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly drawPlayers: (a: any, b: any, c: any, d: any, e: any, f: any, g: any) => [number, number, number];
    readonly drawRain: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawRawHudTexts: (a: any, b: any) => [number, number, number];
    readonly drawShellInputs: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawShells: (a: any, b: any, c: number) => [number, number, number];
    readonly drawShopDealerStage: (a: any, b: any) => [number, number, number];
    readonly drawShopPanelStage: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawSparkInputs: (a: any, b: any, c: any) => [number, number, number];
    readonly drawSparks: (a: any, b: any, c: any) => [number, number, number];
    readonly drawStaticBlood: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawThrows: (a: any, b: any, c: any) => [number, number, number];
    readonly drawTileWalls: (a: any, b: any, c: number, d: number, e: number, f: number) => number;
    readonly drawTransportCommands: (a: any, b: any, c: any, d: any, e: any, f: any) => [number, number, number];
    readonly drawTransportDirect: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: any, i: any, j: any, k: any) => [number, number, number];
    readonly drawWeaponIcon: (a: any, b: number, c: any) => [number, number, number];
    readonly drawWeatherMotes: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly drawWorldBarrels: (a: any, b: any, c: number, d: any) => [number, number, number];
    readonly drawWorldCameras: (a: any, b: any, c: any) => [number, number, number];
    readonly drawWorldEnemyAccents: (a: any, b: any, c: number, d: number, e: any) => [number, number, number];
    readonly drawWorldLightInputs: (a: any, b: any, c: any, d: any, e: any) => [number, number, number];
    readonly drawWorldRingInputs: (a: any, b: any, c: any) => [number, number, number];
    readonly paintFloor: (a: any, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: any) => [number, number, number];
    readonly paintFloorFinishCanvas: (a: any, b: any, c: number, d: number) => number;
    readonly paintMapBase: (a: any, b: number, c: number, d: number) => number;
    readonly paintMapOverlay: (a: any, b: number, c: number) => number;
    readonly putCanvasImageData: (a: any, b: any, c: any, d: number, e: number) => [number, number, number];
    readonly readCanvasSourcePixels: (a: any, b: any, c: number, d: number) => [number, number, number];
    readonly selectEnemySprite: (a: number, b: number) => number;
    readonly selectPlayerSprite: (a: number, b: number, c: number) => number;
    readonly setCanvasImageSmoothing: (a: any, b: number) => number;
    readonly setupCanvas: (a: any, b: number, c: number, d: number) => [number, number, number];
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


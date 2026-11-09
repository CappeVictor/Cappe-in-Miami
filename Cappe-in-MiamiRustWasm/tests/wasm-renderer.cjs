const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const root = path.join(__dirname, '..');
  const wasmPath = path.join(root, 'wasm-renderer', 'pkg', 'direct', 'direct_renderer_bg.wasm');
  const bridge = fs.readFileSync(path.join(root, 'js', 'wasm-renderer.js'), 'utf8');
  const build = fs.readFileSync(path.join(root, 'wasm-renderer', 'build.ps1'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const wasm = fs.readFileSync(wasmPath);

  const module = await WebAssembly.compile(wasm);
  const exports = WebAssembly.Module.exports(module).map(item => item.name);
  const imports = WebAssembly.Module.imports(module);
  assert.ok(exports.includes('drawEnemies'), 'the production Rust module exports direct Canvas painters');
  assert.ok(exports.includes('drawPlayerFrameRgba'), 'the production Rust module exports the procedural player painter');
  assert.ok(imports.some(item => item.module === './direct_renderer_bg.js'), 'the direct module binds browser Canvas/Web APIs through wasm-bindgen');
  assert.match(bridge, /direct_renderer_bg\.wasm/);
  assert.doesNotMatch(bridge, /wasm-renderer\/pkg\/renderer\.wasm|wasm\.exports|execute_canvas_call|execute_canvas_set/);
  assert.doesNotMatch(build, /wasm-renderer\.wasm|Copy-Item[^\n]*renderer\.wasm|\$manifest\s*=|\$targetWasm\s*=/);
  assert.doesNotMatch(worker, /"wasm-renderer\/pkg\/renderer\.wasm"/);
  assert.match(bridge, /if \(diagnosticsEnabled\) \{\s*patchPrototype/);
  assert.match(bridge, /return isSetter \? original\.call\(receiver, args\[0\]\) : original\.apply\(receiver, args\)/);
  assert.match(bridge, /if \(!state\.directReady\) throw new Error/);
  assert.match(bridge, /state\.status = 'fallback'/);
  // legacy floor route ${name} was removed; current direct artifact is checked above.
  console.log(`Direct Rust/WASM artifact checks passed (${exports.length} exports, ${imports.length} browser imports; no legacy trampoline build, fetch or cache route).`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });

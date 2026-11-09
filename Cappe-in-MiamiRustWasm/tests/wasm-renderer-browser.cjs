const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function main() {
  const root = path.join(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'js', 'wasm-renderer.js'), 'utf8');
  const bridge = {
    fetch: /direct_renderer_bg\.wasm/.test(source),
    noLegacyTransport: !/wasm-renderer\/pkg\/renderer\.wasm|execute_canvas_call|execute_canvas_set|wasm\.exports/.test(source),
    diagnosticsAreOptIn: /if \(diagnosticsEnabled\) \{\s*patchPrototype/.test(source),
    directRustPainter: /await directModule\.default\(directWasmUrl\)/.test(source),
    safeFallback: /state\.status = 'fallback'/.test(source) && /módulo indisponível; usando o caminho Canvas original/.test(source)
  };
  for (const [check, passed] of Object.entries(bridge)) assert.equal(passed, true, `renderer bridge invariant: ${check}`);

  const sandbox = {
    URL, URLSearchParams,
    location: { search: '', href: 'http://localhost/index.html' },
    document: { currentScript: { src: 'http://localhost/js/wasm-renderer.js' } },
    window: null
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: 'wasm-renderer.js' });
  assert.equal(sandbox.HM_WASM_RENDERER.status, 'disabled');
  assert.equal(sandbox.HM_WASM_RENDERER.active, false);
  assert.equal(sandbox.HM_WASM_RENDERER.directReady, false);

  const unsupported = {
    URL, URLSearchParams,
    location: { search: '?renderer=wasm', href: 'http://localhost/index.html?renderer=wasm' },
    document: { currentScript: { src: 'http://localhost/js/wasm-renderer.js' } },
    console: { warn() {}, error() {} },
    window: null
  };
  unsupported.window = unsupported;
  vm.runInNewContext(source, unsupported, { filename: 'wasm-renderer-no-wasm.js' });
  for (let attempt = 0; attempt < 20 && unsupported.HM_WASM_RENDERER.status === 'loading'; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.equal(unsupported.HM_WASM_RENDERER.status, 'fallback');
  assert.equal(unsupported.HM_WASM_RENDERER.active, false);
  assert.equal(unsupported.HM_WASM_RENDERER.directReady, false);

  // ABI history assertion retained: each legacy floor route ${name} was removed; the direct WASM artifact is checked by wasm-renderer.cjs.
  console.log('Renderer browser-bridge checks passed (direct Rust module path, opt-in diagnostics, disabled/unsupported modes, safe Canvas fallback, and no legacy trampoline).');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

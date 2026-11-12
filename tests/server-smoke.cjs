'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const editions = ['Cappe-in-MiamiWeb', 'Cappe-in-MiamiRustWasm'];

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function checkEdition(edition) {
  const { createGameServer } = require(path.join(root, edition, 'server', 'server.js'));
  const server = createGameServer({ root: path.join(root, edition) });
  const base = await listen(server);
  try {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200, `${edition}: health`);
    assert.equal((await health.json()).ok, true, `${edition}: health payload`);

    const index = await fetch(`${base}/`);
    assert.equal(index.status, 200, `${edition}: index`);
    assert.match(index.headers.get('content-type') || '', /text\/html/);
    assert.ok((await index.text()).includes('<canvas'), `${edition}: index content`);

    for (const asset of ['/js/tile-levels.js', '/js/exp-core.js']) {
      const response = await fetch(`${base}${asset}`);
      assert.equal(response.status, 200, `${edition}: ${asset}`);
      assert.match(response.headers.get('content-type') || '', /javascript/);
      assert.ok((await response.text()).length > 0, `${edition}: ${asset} vazio`);
    }
    if (edition === 'Cappe-in-MiamiRustWasm') {
      const response = await fetch(`${base}/wasm-renderer/pkg/direct/direct_renderer_bg.wasm`);
      assert.equal(response.status, 200, `${edition}: módulo WASM`);
      assert.match(response.headers.get('content-type') || '', /application\/wasm/);
      const bytes = new Uint8Array(await response.arrayBuffer());
      assert.deepEqual(Array.from(bytes.slice(0, 4)), [0, 97, 115, 109], 'assinatura WASM');
    }

    const traversal = await fetch(`${base}/%2e%2e/README.md`);
    assert.equal(traversal.status, 404, `${edition}: traversal guard`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

(async () => {
  for (const edition of editions) await checkEdition(edition);
  console.log('Smoke do servidor passou para Web e Rust/WASM.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

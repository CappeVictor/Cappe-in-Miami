'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const editions = [
  { dir: 'Cappe-in-MiamiWeb', zip: /^cappe-in-miamiWeb\.zip$/i },
  { dir: 'Cappe-in-MiamiRustWasm', zip: /^cappe-in-miamiRustWasm-v\d+-preview\.zip$/i },
];

for (const edition of editions) {
  const dir = path.join(root, edition.dir);
  for (const required of ['README.md', 'index.html', 'sw.js']) {
    if (!fs.existsSync(path.join(dir, required))) {
      throw new Error(`${edition.dir}: arquivo obrigatório ausente: ${required}`);
    }
  }
  const zips = fs.readdirSync(dir).filter(name => name.toLowerCase().endsWith('.zip'));
  if (zips.length !== 1 || !edition.zip.test(zips[0])) {
    throw new Error(`${edition.dir}: esperado exatamente um ZIP de release, encontrado: ${zips.join(', ') || '(nenhum)'}`);
  }
}

console.log('Layout de releases válido: Web e Rust/WASM têm exatamente um ZIP cada.');
